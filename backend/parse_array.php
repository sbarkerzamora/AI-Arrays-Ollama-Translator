<?php
$input = file_get_contents('php://stdin');

// Eliminar etiquetas de apertura y cierre de PHP si existen
$input = preg_replace('/<\?php\s*/', '', $input);
$input = preg_replace('/\?>/', '', $input);

// Reemplazar 'return' inicial por '$array ='
$input = preg_replace('/^\s*return\s+/', '$array = ', $input);

// Agregar punto y coma al final si no existe
if (!preg_match('/;\s*$/', $input)) {
    $input = rtrim($input) . ';';
}

try {
    // Evaluar el contenido y obtener el array
    eval($input);

    // Verificar si $array es realmente un array
    if (!isset($array) || !is_array($array)) {
        throw new Exception("El contenido proporcionado no es un array válido.");
    }

    // Convertir el array a JSON
    echo json_encode($array, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (ParseError $e) {
    // Manejar errores de sintaxis en el array PHP
    fwrite(STDERR, "Error de sintaxis en el array PHP: " . $e->getMessage() . "\n");
    exit(1);
} catch (Exception $e) {
    fwrite(STDERR, "Error: " . $e->getMessage() . "\n");
    exit(1);
}
?>
