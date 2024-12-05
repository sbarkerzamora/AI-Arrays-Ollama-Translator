import eventlet
import re
import json
import os
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Cargar el modelo general (configurable según el idioma de destino)
model_name_template = "Helsinki-NLP/opus-mt-en-{target_lang}"
tokenizers = {}
models = {}

def load_model(target_language):
    if target_language not in tokenizers:
        model_name = model_name_template.format(target_lang=target_language)
        tokenizers[target_language] = AutoTokenizer.from_pretrained(model_name)
        models[target_language] = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        models[target_language].to(device)
    return tokenizers[target_language], models[target_language]

# Mover el modelo a la GPU si está disponible
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def translate_text(text, target_language):
    try:
        # Cargar el tokenizador y el modelo para el idioma de destino
        tokenizer, model = load_model(target_language)

        # Preservar placeholders y variables de Laravel
        placeholders = re.findall(r'(:\w+|\{\{\s*.+?\s*\}\})', text)
        temp_text = text
        placeholder_map = {}
        for idx, placeholder in enumerate(placeholders):
            placeholder_token = f"__PLACEHOLDER_{idx}__"
            placeholder_map[placeholder_token] = placeholder
            temp_text = temp_text.replace(placeholder, placeholder_token)

        # Preparar el prompt para el modelo de traducción
        inputs = tokenizer(temp_text, return_tensors="pt").to(device)

        # Generar la traducción
        outputs = model.generate(**inputs, max_length=512, num_beams=5, early_stopping=True)
        translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Restaurar placeholders
        for placeholder_token, placeholder in placeholder_map.items():
            translated_text = translated_text.replace(placeholder_token, placeholder)

        return translated_text.strip()
    except Exception as e:
        print(f"Error en translate_text:\n\n{str(e)}\n")
        return text  # En caso de error, devolver el texto original

def count_strings(data):
    # Contar el número de cadenas en los valores del diccionario
    count = 0
    if isinstance(data, dict):
        for value in data.values():
            count += count_strings(value)
    elif isinstance(data, list):
        for item in data:
            count += count_strings(item)
    elif isinstance(data, str):
        count += 1
    return count

def translate_values(data, progress_info, target_language):
    # Traducir los valores en el diccionario
    if isinstance(data, dict):
        for key, value in data.items():
            data[key] = translate_values(value, progress_info, target_language)
    elif isinstance(data, list):
        for idx, item in enumerate(data):
            data[idx] = translate_values(item, progress_info, target_language)
    elif isinstance(data, str):
        original_text = data
        translation = translate_text(original_text, target_language)
        progress_info['current'] += 1
        progress = int((progress_info['current'] / progress_info['total']) * 100)
        socketio.emit('progress', {'progress': progress})
        socketio.emit('log', {'message': f"Traduciendo '{original_text}' a '{translation}'"})
        eventlet.sleep(0)
        return translation
    return data

def php_array_to_json(php_file_content):
    try:
        # Guardar el contenido del archivo PHP en un archivo temporal
        temp_php_file = 'temp_array.php'
        with open(temp_php_file, 'w', encoding='utf-8') as f:
            f.write(php_file_content)

        # Crear un script PHP que incluya el archivo y convierta el array a JSON
        php_script = '''
        <?php
        $array = include '{}';
        header('Content-Type: application/json');
        echo json_encode($array, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        ?>
        '''.format(temp_php_file)

        # Guardar el script PHP en un archivo temporal
        temp_php_script = 'temp_script.php'
        with open(temp_php_script, 'w', encoding='utf-8') as f:
            f.write(php_script)

        # Ejecutar el script PHP y capturar la salida JSON
        result = subprocess.run(['php', temp_php_script], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        # Eliminar archivos temporales
        os.remove(temp_php_file)
        os.remove(temp_php_script)

        if result.returncode != 0:
            print(f"Error al ejecutar el script PHP: {result.stderr}")
            return None

        json_data = json.loads(result.stdout)
        return json_data
    except Exception as e:
        print(f"Error en php_array_to_json: {e}")
        return None

def json_to_php_array(data):
    # Función para exportar el array con formato PHP
    def var_export_php(var, indent=""):
        if isinstance(var, dict):
            lines = []
            for key, value in var.items():
                key_str = f"'{key}'" if isinstance(key, str) else key
                value_str = var_export_php(value, indent + "    ")
                lines.append(f"{indent}    {key_str} => {value_str}")
            return "array(\n" + ",\n".join(lines) + f"\n{indent})"
        elif isinstance(var, list):
            lines = []
            for value in var:
                value_str = var_export_php(value, indent + "    ")
                lines.append(f"{indent}    {value_str}")
            return "array(\n" + ",\n".join(lines) + f"\n{indent})"
        elif isinstance(var, str):
            escaped_value = var.replace("\\", "\\\\").replace("'", "\\'")
            return f"'{escaped_value}'"
        elif isinstance(var, bool):
            return 'true' if var else 'false'
        elif var is None:
            return 'NULL'
        else:
            return str(var)

    php_array = "<?php\n\nreturn " + var_export_php(data) + ";\n"
    return php_array

@socketio.on('connect')
def handle_connect():
    print('Cliente conectado')

@socketio.on('disconnect')
def handle_disconnect():
    print('Cliente desconectado')

@app.route('/translate', methods=['POST'])
def translate():
    print("Iniciando proceso de traducción...")
    file = request.files['file']
    filename = file.filename
    content = file.read().decode('utf-8')
    target_language = request.form.get('target_language', 'es')  # Idioma de destino predeterminado: español

    # Convertir el array PHP a JSON
    data = php_array_to_json(content)
    if data is None:
        return jsonify({'error': 'Error al convertir el array PHP a JSON.'}), 400

    # Contar el total de cadenas a traducir
    total_strings = count_strings(data)
    progress_info = {'current': 0, 'total': total_strings}

    # Traducir los valores
    data = translate_values(data, progress_info, target_language)

    # Convertir el JSON traducido a array PHP
    translated_php_array = json_to_php_array(data)

    # Preparar la ruta de salida
    output_filename = os.path.splitext(filename)[0] + '_translated.php'
    output_path = os.path.join('public', output_filename)

    # Asegurarse de que el directorio existe
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Guardar el resultado
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(translated_php_array)

    return jsonify({'message': 'Traducción completada', 'filename': output_filename})

if __name__ == '__main__':
    # Iniciar la aplicación Flask
    socketio.run(app, debug=True, port=5001)
