<?php
// Verificar si se ha proporcionado el nombre del archivo
if ($argc < 2) {
    echo "Uso: php php_to_json.php nombre_del_array.php\n";
    exit(1);
}

$array_file = $argv[1];

// Verificar que el archivo existe
if (!file_exists($array_file)) {
    echo "Error: El archivo '$array_file' no existe.\n";
    exit(1);
}

// Incluir el archivo que contiene el array
$array = include $array_file;

// Verificar que el contenido sea un array
if (!is_array($array)) {
    echo "Error: El archivo no devolvió un array válido.\n";
    exit(1);
}

// Convertir el array a JSON
$json = json_encode($array, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Verificar si json_encode tuvo éxito
if ($json === false) {
    echo "Error al convertir el array a JSON: " . json_last_error_msg() . "\n";
    exit(1);
}

// Guardar el JSON en un archivo
file_put_contents('array.json', $json);

echo "El array ha sido convertido a JSON y guardado en 'array.json'.\n";
?>
