//Esperamos que cargue el documento HTML
document.addEventListener("DOMContentLoaded", () => {
    cargarXML(); //cuando empiece cargamos el XML
    resetDetalleReceta();
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
        //Llamamos a la función que carga las recetas
        cargarRecetas(xmlDoc);
    } catch (error) {
        console.error("Error cargando el XML:", error);
    }
}

let recetas = [];//Array global para usar en búsquedas y filtros

function cargarRecetas(xml) {
    //esta funcion nos va a servir para cargar absolutamente todas las recetas con toda su informacion
    const recetasXML = xml.getElementsByTagName("receta");
    recetas = []; //Limpiar en caso de recargar
    for (let receta of recetasXML) {
        const id = receta.getAttribute("id");
        const nombre = receta.getElementsByTagName("nombre")[0]?.textContent || "Sin nombre";
        const categoria = receta.getAttribute("categoria");
        const dificultad = receta.getAttribute("dificultad");
        const tiempo = parseInt(receta.getElementsByTagName("tiempo")[0]?.getAttribute("total")) || 0;
        const unidad = receta.getElementsByTagName("tiempo")[0]?.getAttribute("unidad") || "minutos";
        const porciones = parseInt(receta.getElementsByTagName("porciones")[0]?.getAttribute("cantidad")) || 0;
        const descripcion = receta.getElementsByTagName("descripcion")[0]?.textContent || "Sin descripción";
        //Ingredientes
        const ingredientesXML = receta.getElementsByTagName("ingrediente");
        const ingredientes = [];
        for (let ing of ingredientesXML) {
            ingredientes.push({
                nombre: ing.textContent,
                cantidad: ing.getAttribute("cantidad"),
                unidad: ing.getAttribute("unidad")
            });
        }
        //Pasos
        const pasosXML = receta.getElementsByTagName("paso");
        const pasos = [];
        for (let paso of pasosXML) {
            pasos.push({
                orden: paso.getAttribute("orden"),
                descripcion: paso.textContent
            });
        }
        //Video, enlace y notas
        const video = receta.getElementsByTagName("video")[0]?.getAttribute("url") || "";
        const enlace = receta.getElementsByTagName("enlace")[0]?.getAttribute("url") || "";
        const notas = receta.getElementsByTagName("notas")[0]?.textContent || "";
        recetas.push({ id, nombre, descripcion, categoria, dificultad, tiempo, unidad, porciones, ingredientes, pasos, video, enlace, notas });
    }
    mostrarListaResultados(recetas); // muestra todas las recetas al inicio
    console.log("Recetas cargadas:", recetas);
}

//------- FUNCION PARA RESETEAR EL CUADRO DE DETALLE ---
function resetDetalleReceta() {
    document.getElementById("emptyState").style.display = "block";
    document.getElementById("recipeDetail").style.display = "none";
    document.getElementById("mensajeBusqueda").textContent = "Realiza una búsqueda o aplica filtros";
}

//------- BUSQUEDA POR ID ---
const btnBuscarId = document.getElementById("btnBuscarId"); //Buscar por id
const inputSearchId = document.getElementById("searchId"); //Entrada de busqueda por id
btnBuscarId.addEventListener("click", () => {
    const id = inputSearchId.value.trim();
    if (id) {
        buscarPorId(id);
    } else {
        resetDetalleReceta(); //Vuelve al estado original si el input está vacío
    }
});
//----------------------------

//------- BUSQUEDA POR NOMBRE ---
const btnBuscarName = document.getElementById("btnBuscarNombre"); //Buscar por  nombre
const inputSearchName = document.getElementById("searchNombre"); //Entrada de busqueda por nombre
btnBuscarName.addEventListener("click", () => {
    const name = inputSearchName.value.trim();
    if (name) {
        buscarPorNombre(name);
    } else {
        resetDetalleReceta(); //Vuelve al estado original si el input está vacío
    }
});
//----------------------------

// Función de búsqueda por id
function buscarPorId(id) {
    const receta = recetas.find(r => r.id.toLowerCase() === id.toLowerCase());
    if (!receta) {
        resetDetalleReceta(); // También resetea si no se encuentra
        document.getElementById("mensajeBusqueda").textContent = `❌ No se encontró la receta con ID "${id}"`;
        return;
    }
    document.getElementById("mensajeBusqueda").textContent = "";
    mostrarDetalleReceta(receta);
}

// Función de búsqueda por nombre
function buscarPorNombre(nombreBuscado) {
    nombreBuscado = nombreBuscado.trim().toLowerCase();
    if (!nombreBuscado) {
        resetDetalleReceta(); // Si el input está vacío, volver al estado inicial
        return;
    }
    // Buscar recetas que contengan el texto ingresado
    const recetasEncontradas = recetas.filter(r => r.nombre.toLowerCase().includes(nombreBuscado));
    if (recetasEncontradas.length === 0) {
        resetDetalleReceta(); // Resetea si no hay coincidencias
        document.getElementById("mensajeBusqueda").textContent = `❌ No se encontró ninguna receta con "${nombreBuscado}"`;
        return;
    }
    // Mostrar la primera coincidencia (o podrías implementar mostrar varias)
    document.getElementById("mensajeBusqueda").textContent = "";
    mostrarDetalleReceta(recetasEncontradas[0]);
}


// Función para mostrar detalle
function mostrarDetalleReceta(receta) {
    // Ocultar estado vacío
    document.getElementById("emptyState").style.display = "none";
    const detail = document.getElementById("recipeDetail");
    detail.style.display = "block";
    // Información general
    document.getElementById("detailNombre").textContent = receta.nombre;
    document.getElementById("detailCategoria").textContent = receta.categoria;
    document.getElementById("detailDificultad").textContent = receta.dificultad;
    document.getElementById("detailDescripcion").textContent = receta.descripcion || "Sin descripción";
    document.getElementById("detailTiempo").textContent = receta.tiempo;
    document.getElementById("detailPorciones").textContent = receta.porciones;
    document.getElementById("detailId").textContent = receta.id;
    // Ingredientes
    const ingredientesContainer = document.getElementById("detailIngredientes");
    ingredientesContainer.innerHTML = "";
    receta.ingredientes.forEach(ing => {
        const div = document.createElement("div");
        div.className = "ingrediente-card";
        div.innerHTML = `<span>${ing.nombre}</span><span>${ing.cantidad} ${ing.unidad}</span>`;
        ingredientesContainer.appendChild(div);
    });
    // Pasos
    const pasosContainer = document.getElementById("detailPasos");
    pasosContainer.innerHTML = "";
    receta.pasos.forEach(p => {
        const div = document.createElement("div");
        div.className = "paso-card";
        div.innerHTML = `<div class="paso-numero">${p.orden}</div><p>${p.descripcion}</p>`;
        pasosContainer.appendChild(div);
    });
    // Video y enlace
    document.getElementById("detailVideo").href = receta.video || "#";
    document.getElementById("detailEnlace").href = receta.enlace || "#";
    // Notas
    document.getElementById("detailNotas").textContent = receta.notas || "";
}

//SECCION DE FILTROS AVANZADOS ---------------------------------------------------------------
//Elementos para filtros y resultados
const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
const selectCategoria = document.getElementById("filterCategoria");
const selectDificultad = document.getElementById("filterDificultad");
const resultadosContainer = document.getElementById("resultadosContainer"); //Acuerdate que este es el contenedor para resultados no el principal

//Evento para aplicar filtros
btnAplicarFiltros.addEventListener("click", () => {
    aplicarFiltrosActuales();
});

function mostrarListaResultados(lista) {
    // Actualizar el título con la cantidad de resultados
    const tituloResultados = document.querySelector(".results-list .card-title");
    tituloResultados.textContent = `Resultados (${lista.length})`;
    // Limpiar resultados previos
    const contenedor = document.getElementById("resultadosContainer");
    contenedor.innerHTML = "";
    lista.forEach(r => {
        const div = document.createElement("div");
        div.className = "result-item";
        div.dataset.id = r.id;
        div.innerHTML = `
            <div class="result-info">
                <div class="result-nombre">${r.nombre}</div>
                <div class="result-meta">
                    <span class="result-badge badge-categoria">${r.categoria}</span>
                    <span class="result-badge badge-dificultad">${r.dificultad}</span>
                    <span>⏱️ ${r.tiempo} ${r.unidad}</span>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
        div.addEventListener("click", () => {
            mostrarDetalleReceta(r);
        });
    });
}

//REINICIAMOS SI SE BORRA EL FILTRO
selectCategoria.addEventListener("change", () => {
    aplicarFiltrosActuales();
});

selectDificultad.addEventListener("change", () => {
    aplicarFiltrosActuales();
});

function aplicarFiltrosActuales() {
    const categoria = selectCategoria.value;
    const dificultad = selectDificultad.value;
    let filtradas = recetas;
    if (categoria && categoria !== "todas") {
        filtradas = filtradas.filter(r => r.categoria === categoria);
    }
    if (dificultad && dificultad !== "todas") {
        filtradas = filtradas.filter(r => r.dificultad === dificultad);
    }
    // Declaramos el título antes de usarlo
    const tituloResultados = document.querySelector(".results-list .card-title");
    if (filtradas.length === 0) {
        resultadosContainer.innerHTML = `<p style="padding: 1rem;">❌ No se encontraron recetas con esos filtros</p>`;
        // Actualizar el título con la cantidad de resultados
        tituloResultados.textContent = `Resultados (0)`;
        resetDetalleReceta();
        return;
    }
    mostrarListaResultados(filtradas);
}




