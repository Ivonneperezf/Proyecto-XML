<?php
// Leer el XML enviado por POST
$xml = file_get_contents("php://input");

// Cargarlo en DOMDocument para poder formatearlo
$dom = new DOMDocument();
$dom->preserveWhiteSpace = false;
$dom->formatOutput = true;

// Intentar cargar el XML recibido
if (!$dom->loadXML($xml)) {
    // Si hay error en el XML, responder con mensaje de error
    http_response_code(400);
    echo "Error: el XML enviado no es válido";
    exit;
}

// Guardar el XML en el archivo del recetario
$archivoDestino = "../data/recetario.xml"; // Cambia la ruta si es necesario
if (!$dom->save($archivoDestino)) {
    http_response_code(500);
    echo "Error: no se pudo guardar el XML";
    exit;
}

// Responder al cliente
echo "Receta editada y guardada correctamente";
?>