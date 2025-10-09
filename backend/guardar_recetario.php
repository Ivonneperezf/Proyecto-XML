<?php
// Leer el XML enviado por POST
$xml = file_get_contents("php://input");

// Cargarlo en DOMDocument para formatear
$dom = new DOMDocument();
$dom->preserveWhiteSpace = false;
$dom->formatOutput = true;
$dom->loadXML($xml);

// Guardar el XML tabulado
$dom->save("../data/recetario.xml");

// Responder al cliente
echo "Tarea realizada correctamente";
?>
