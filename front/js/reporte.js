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
    for (let receta of recetasXML) {
        const nombre = receta.getElementsByTagName("nombre")[0]?.textContent || "Sin nombre";
        const categoria = receta.getAttribute("categoria");
        const dificultad = receta.getAttribute("dificultad");
        const tiempo = parseInt(receta.getElementsByTagName("tiempo")[0]?.getAttribute("total")) || 0;
        const unidad = receta.getElementsByTagName("tiempo")[0]?.getAttribute("unidad") || "minutos";
        const porciones = parseInt(receta.getElementsByTagName("porciones")[0]?.getAttribute("cantidad")) || 0;
        recetas.push({ nombre, categoria, dificultad, tiempo, unidad, porciones });
    }
    //--- Llamar a las funciones de reporte ---
    generarEstadisticas(recetas);
    generarTablaCategorias(recetas);
    generarTablaDificultad(recetas);
    generarListaRecetas(recetas);
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
        conteoCategorias[r.categoria] = (conteoCategorias[r.categoria] || 0) + 1; //Si hay una categoria que no existe se inicia en 0, si no se suma 1
    });
    const categoriaComun = Object.entries(conteoCategorias).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    // --- Mostrar en el HTML ---
    document.getElementById("totalRecetas").textContent = totalRecetas;
    document.getElementById("tiempoPromedio").textContent = `${tiempoPromedio} min`;
    document.getElementById("porcionesTotales").textContent = porcionesTotales;
    document.getElementById("categoriaComun").textContent = categoriaComun;
}

function generarTablaCategorias(recetas) {
    const tabla = document.getElementById("tablaCategorias");
    tabla.innerHTML = ""; //Limpiar por si se vuelve a generar
    //Contar recetas por categoría
    const conteo = {};
    recetas.forEach(r => {
        conteo[r.categoria] = (conteo[r.categoria] || 0) + 1;
    });
    const total = recetas.length;
    //Crear filas dinámicamente
    for (let [categoria, cantidad] of Object.entries(conteo)) {
        const porcentaje = ((cantidad / total) * 100).toFixed(1);
        const fila = `
            <tr>
                <td>${categoria}</td>
                <td>${cantidad}</td>
                <td>${porcentaje}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${porcentaje}%;"></div>
                    </div>
                </td>
            </tr>
        `;
        tabla.innerHTML += fila;
    }
}

function generarTablaDificultad(recetas) {
    const tabla = document.getElementById("tablaDificultad");
    tabla.innerHTML = ""; //Limpiar por si se vuelve a generar
    //Contar recetas por dificultad
    const conteo = {};
    recetas.forEach(r => {
        conteo[r.dificultad] = (conteo[r.dificultad] || 0) + 1;
    });
    const total = recetas.length;
    //Crear filas dinámicamente
    for (let [dificultad, cantidad] of Object.entries(conteo)) {
        const porcentaje = ((cantidad / total) * 100).toFixed(1);
        const fila = `
            <tr>
                <td>${dificultad}</td>
                <td>${cantidad}</td>
                <td>${porcentaje}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${porcentaje}%;"></div>
                    </div>
                </td>
            </tr>
        `;
        tabla.innerHTML += fila;
    }
}

function generarListaRecetas(recetas) {
    const contenedor = document.getElementById("listaRecetas");
    contenedor.innerHTML = "";//Limpiar antes de volver a generar
    if (recetas.length === 0) {
        contenedor.innerHTML = "<p>No hay recetas registradas.</p>";
        return;
    }
    recetas.forEach(r => {
        //Clase de color para la dificultad
        let claseDificultad = "";
        switch (r.dificultad) {
            case "Baja": claseDificultad = "badge-success"; break;
            case "Media": claseDificultad = "badge-warning"; break;
            case "Alta": claseDificultad = "badge-danger"; break;
            default: claseDificultad = "badge-secondary";
        }
        //Crear la tarjeta
        const tarjeta = `
            <div class="receta-card">
                <div class="receta-header">
                    <h4>${r.nombre}</h4>
                    <span class="badge badge-info">${r.categoria}</span>
                </div>
                <div class="receta-details">
                    <div class="detail-item">
                        <span class="detail-label">Dificultad:</span>
                        <span class="badge ${claseDificultad}">${r.dificultad}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tiempo:</span>
                        <span>${r.tiempo} ${r.unidad}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Porciones:</span>
                        <span>${r.porciones}</span>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += tarjeta;
    });
}
