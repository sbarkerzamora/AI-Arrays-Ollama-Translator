<?php
// Verificar si el archivo JSON existe
$json_file = 'translated_array.json';

if (!file_exists($json_file)) {
    echo "Error: El archivo '$json_file' no existe.\n";
    exit(1);
}

// Leer el JSON traducido
$json = file_get_contents($json_file);
$array = json_decode($json, true);

// Verificar que se haya decodificado correctamente
if ($array === null) {
    echo "Error al decodificar el JSON: " . json_last_error_msg() . "\n";
    exit(1);
}

// Función para exportar el array con formato PHP
function var_export_php($var, $indent = "")
{
    switch (gettype($var)) {
        case "string":
            return "'" . addslashes($var) . "'";
        case "array":
            $indexed = array_keys($var) === range(0, count($var) - 1);
            $r = [];
            foreach ($var as $key => $value) {
                $value_str = var_export_php($value, $indent . "    ");
                if ($indexed) {
                    $r[] = $indent . "    " . $value_str;
                } else {
                    $key_str = is_numeric($key) ? $key : "'" . addslashes($key) . "'";
                    $r[] = $indent . "    " . $key_str . " => " . $value_str;
                }
            }
            return "array(\n" . implode(",\n", $r) . "\n" . $indent . ")";
        case "boolean":
            return $var ? "true" : "false";
        case "NULL":
            return "NULL";
        default:
            return var_export($var, true);
    }
}

// Generar el código PHP del array
$array_export = var_export_php($array);

// Crear el contenido del archivo PHP
$php_content = "<?php\n\nreturn " . $array_export . ";\n";

// Guardar el array traducido en un archivo PHP
file_put_contents('translated_array.php', $php_content);

echo "El JSON traducido ha sido convertido a un array PHP y guardado en 'translated_array.php'.\n";
?>
