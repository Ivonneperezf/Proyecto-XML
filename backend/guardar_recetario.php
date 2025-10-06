<?php
// 1️⃣ Leer el XML enviado por POST
$xml = file_get_contents("php://input");

// 2️⃣ Cargarlo en DOMDocument para formatear
$dom = new DOMDocument();
$dom->preserveWhiteSpace = false;
$dom->formatOutput = true;
$dom->loadXML($xml);

// 3️⃣ Guardar el XML tabulado
$dom->save("../data/recetario.xml");

// 4️⃣ Responder al cliente
echo "Tarea realizada correctamente";
?>
