//Esperamos que cargue el documento HTML
document.addEventListener("DOMContentLoaded", () => {
    cargarXML(); //cuando empiece cargamos el XML
});

//Leer el XML
async function cargarXML() {
    try {
        const response = await fetch("../data/recetario.xml"); //Cargamos el XML
        if (!response.ok) throw new Error("No se pudo cargar el XML");
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml"); //Parsea el texto obtenido en un documento XML
        // Verificamos que no haya errores de parseo
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Error al analizar el XML");
        }
        // Llamamos a la función que lo procesa
        procesarRecetario(xmlDoc);
    } catch (error) {
        console.error("Error cargando el XML:", error);
    }
}

function procesarRecetario(xml) {
    const recetasXML = xml.getElementsByTagName("receta");
    let recetas = [];
    console.log(`Se encontraron ${recetas.length} recetas:\n`);
    for (let receta of recetasXML) {
        const nombre = receta.getElementsByTagName("nombre")[0]?.textContent || "Sin nombre";
        const categoria = receta.getAttribute("categoria");
        const dificultad = receta.getAttribute("dificultad");
        const tiempo = parseInt(receta.getElementsByTagName("tiempo")[0]?.getAttribute("total")) || 0;
        const unidad = receta.getElementsByTagName("tiempo")[0]?.getAttribute("unidad") || "minutos";
        const porciones = parseInt(receta.getElementsByTagName("porciones")[0]?.getAttribute("cantidad")) || 0;
        console.log(`🍽️ ${nombre}`);
        console.log(`   Categoría: ${categoria}`);
        console.log(`   Dificultad: ${dificultad}`);
        console.log(`   Tiempo: ${tiempo} ${unidad}`);
        console.log(`   Porciones: ${porciones}`);
        console.log("-----------------------------");
        recetas.push({ nombre, categoria, dificultad, tiempo, unidad, porciones });
    }

    // --- Llamar a las funciones de reporte ---
    generarEstadisticas(recetas);
}

function generarEstadisticas(recetas) {
    //Total de recetas
    const totalRecetas = recetas.length;
    //Tiempo promedio
    const sumaTiempos = recetas.reduce((acc, r) => acc + r.tiempo, 0);
    const tiempoPromedio = totalRecetas > 0 ? Math.round(sumaTiempos / totalRecetas) : 0;
    //Porciones totales
    const porcionesTotales = recetas.reduce((acc, r) => acc + r.porciones, 0);
    //Categoría más común
    const conteoCategorias = {};
    recetas.forEach(r => {
        conteoCategorias[r.categoria] = (conteoCategorias[r.categoria] || 0) + 1;
    });
    const categoriaComun = Object.entries(conteoCategorias).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    // --- Mostrar en el HTML ---
    document.getElementById("totalRecetas").textContent = totalRecetas;
    document.getElementById("tiempoPromedio").textContent = `${tiempoPromedio} min`;
    document.getElementById("porcionesTotales").textContent = porcionesTotales;
    document.getElementById("categoriaComun").textContent = categoriaComun;
    console.log("-------> Estadísticas calculadas:");
    console.log({ totalRecetas, tiempoPromedio, porcionesTotales, categoriaComun });
}

