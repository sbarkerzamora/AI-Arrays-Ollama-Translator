# PHP File Translator

PHP File Translator es una herramienta que permite traducir archivos PHP con arrays de strings a varios idiomas usando modelos de traducción basados en inteligencia artificial. Está diseñado para desarrolladores que trabajan con aplicaciones PHP y desean mantener archivos de traducción consistentes en múltiples idiomas.

## Características

- Traducción automática de archivos PHP que contienen arrays de cadenas.
- Soporta múltiples idiomas, incluyendo español, francés, alemán, portugués e italiano.
- Interfaz moderna basada en Next.js para una experiencia de usuario intuitiva.
- Integración en tiempo real con Flask-SocketIO para mostrar el progreso de la traducción.

## Tecnologías Utilizadas

- **Frontend**: [Next.js](https://nextjs.org/)
- **Backend**: [Flask](https://flask.palletsprojects.com/)
- **WebSockets**: [Flask-SocketIO](https://flask-socketio.readthedocs.io/en/latest/)
- **Modelos de Traducción**: [Helsinki-NLP/Opus-MT](https://huggingface.co/Helsinki-NLP)
- **Dependencias adicionales**: [Torch](https://pytorch.org/), [Socket.io-client](https://socket.io/)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/php-file-translator.git
cd php-file-translator

```
### 2. Configuración del Backend (Flask)

2.1 Crear un entorno virtual e instalar dependencias

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2.2 Ejecutar el servidor

```bash
python app.py
```
El servidor se ejecutará en http://localhost:5001.

### 3. Configuración del Frontend (Next.js)

3.1 Instalar dependencias

```bash
cd frontend
npm install
```

3.2 Ejecutar la aplicación

```bash
npm run dev
```
El frontend estará disponible en http://localhost:3000.

### Uso

- Visita http://localhost:3000 en tu navegador.
- Arrastra y suelta un archivo PHP con arrays de cadenas o haz clic para seleccionar un archivo.
- Selecciona el idioma de destino para la traducción.
- Haz clic en "Traducir Archivo" para iniciar la traducción.
- Observa el progreso y los logs en tiempo real.

### Contribuir

¡Las contribuciones son bienvenidas! Siéntete libre de abrir un issue o un pull request.

### Pasos para Contribuir:

- Fork el repositorio.
- Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).
- Realiza los cambios y haz commit (git commit -m 'Añadir nueva funcionalidad').
- Haz push a la rama (git push origin feature/nueva-funcionalidad).
- Abre un pull request.

### Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para obtener más información.

### Contacto

Autor: Stephan Barker
Email: hi@stephanbarker.com

### Roadmap

- Agregar soporte para más idiomas.
- Mejorar el rendimiento en archivos grandes.
- Integración con otros servicios de traducción (como DeepL).
- Soporte para otros formatos de archivo (ej. JSON, YAML).

### Agradecimientos

Agradecemos a los creadores de Hugging Face y Flask-SocketIO por las herramientas increíbles que hacen posible este proyecto.