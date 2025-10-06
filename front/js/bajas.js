let recetas = [];
let recetaSeleccionada = null;

// Elementos del DOM
const searchInput = document.getElementById("searchId");
const btnBuscar = document.getElementById("btnBuscar");
const mensajeBusqueda = document.getElementById("mensajeBusqueda");
const emptyState = document.getElementById("emptyState");
const recipePreview = document.getElementById("recipePreview");
const btnEliminar = document.getElementById("btnEliminar");
const btnCancelar = document.getElementById("btnCancelar");
const recetasList = document.querySelector(".recetas-list");

// Cargar XML al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarXML();
    
    // Event listeners
    btnBuscar.addEventListener("click", buscarReceta);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") buscarReceta();
    });
    btnCancelar.addEventListener("click", limpiarVistaPrevia);
    btnEliminar.addEventListener("click", eliminarReceta);
});

// Función para cargar XML (reutilizada de insertar.js)
async function cargarXML() {
    try {
        console.log("Intentando cargar XML desde: ../data/recetario.xml");
        const response = await fetch("../data/recetario.xml");
        console.log("Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`No se pudo cargar el XML. Status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        console.log("XML cargado, primeros 200 caracteres:", xmlText.substring(0, 200));
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            const errorText = xmlDoc.getElementsByTagName("parsererror")[0].textContent;
            throw new Error("Error al analizar el XML: " + errorText);
        }
        
        // Obtener todas las recetas
        const recetasXML = xmlDoc.getElementsByTagNameNS("http://www.recetas.com", "receta");
        console.log("Recetas encontradas:", recetasXML.length);
        recetas = [];
        
        for (let i = 0; i < recetasXML.length; i++) {
            const receta = parsearReceta(recetasXML[i]);
            if (receta) {
                console.log("Receta parseada:", receta.id, receta.nombre);
                recetas.push(receta);
            }
        }
        
        console.log("Total recetas cargadas:", recetas.length);
        
        // Mostrar lista de recetas
        mostrarListaRecetas();
        
    } catch (error) {
        console.error("Error completo:", error);
        console.error("Stack trace:", error.stack);
        mensajeBusqueda.textContent = "Error al cargar las recetas: " + error.message;
        mensajeBusqueda.style.color = "#dc3545";
    }
}

// Función para parsear una receta del XML
function parsearReceta(recetaXML) {
    try {
        const ns = "http://www.recetas.com";
        const id = recetaXML.getAttribute("id");
        
        const nombre = recetaXML.getElementsByTagNameNS(ns, "nombre")[0]?.textContent || "";
        const categoria = recetaXML.getElementsByTagNameNS(ns, "categoria")[0]?.textContent || "";
        const dificultad = recetaXML.getElementsByTagNameNS(ns, "dificultad")[0]?.textContent || "";
        const descripcion = recetaXML.getElementsByTagNameNS(ns, "descripcion")[0]?.textContent || "";
        
        // Tiempo total
        const tiempoTotal = recetaXML.getElementsByTagNameNS(ns, "tiempoTotal")[0];
        const tiempo = {
            cantidad: tiempoTotal?.getAttribute("cantidad") || "0",
            unidad: tiempoTotal?.getAttribute("unidad") || "minutos"
        };
        
        const porciones = recetaXML.getElementsByTagNameNS(ns, "porciones")[0]?.textContent || "0";
        
        // Ingredientes
        const ingredientesXML = recetaXML.getElementsByTagNameNS(ns, "ingrediente");
        const ingredientes = [];
        for (let i = 0; i < ingredientesXML.length; i++) {
            ingredientes.push({
                nombre: ingredientesXML[i].getElementsByTagNameNS(ns, "nombre")[0]?.textContent || "",
                cantidad: ingredientesXML[i].getAttribute("cantidad") || "",
                unidad: ingredientesXML[i].getAttribute("unidad") || ""
            });
        }
        
        // Pasos
        const pasosXML = recetaXML.getElementsByTagNameNS(ns, "paso");
        const pasos = [];
        for (let i = 0; i < pasosXML.length; i++) {
            pasos.push({
                numero: pasosXML[i].getAttribute("numero") || (i + 1).toString(),
                descripcion: pasosXML[i].textContent || ""
            });
        }
        
        return {
            id,
            nombre,
            categoria,
            dificultad,
            descripcion,
            tiempo,
            porciones,
            ingredientes,
            pasos
        };
    } catch (error) {
        console.error("Error parseando receta:", error);
        return null;
    }
}

// Función para mostrar la lista de recetas
function mostrarListaRecetas() {
    // Limpiar la lista actual (mantener solo el título)
    const items = recetasList.querySelectorAll(".receta-item");
    items.forEach(item => item.remove());
    
    // Agregar las recetas cargadas
    recetas.forEach(receta => {
        const div = document.createElement("div");
        div.classList.add("receta-item");
        div.setAttribute("data-id", receta.id);
        
        div.innerHTML = `
            <span class="receta-id">${receta.id}</span>
            <span class="receta-nombre">${receta.nombre}</span>
        `;
        
        div.addEventListener("click", () => {
            searchInput.value = receta.id;
            buscarReceta();
        });
        
        recetasList.appendChild(div);
    });
}

// Función para buscar receta
function buscarReceta() {
    const id = searchInput.value.trim().toLowerCase();
    
    if (!id) {
        mensajeBusqueda.textContent = "Por favor ingresa un ID";
        mensajeBusqueda.style.color = "#dc3545";
        return;
    }
    
    const receta = recetas.find(r => r.id.toLowerCase() === id);
    
    if (receta) {
        recetaSeleccionada = receta;
        mostrarVistaPrevia(receta);
        mensajeBusqueda.textContent = "Receta encontrada";
        mensajeBusqueda.style.color = "#28a745";
    } else {
        mensajeBusqueda.textContent = "No se encontró ninguna receta con ese ID";
        mensajeBusqueda.style.color = "#dc3545";
        limpiarVistaPrevia();
    }
}

// Función para mostrar vista previa
function mostrarVistaPrevia(receta) {
    // Ocultar estado vacío y mostrar preview
    emptyState.style.display = "none";
    recipePreview.style.display = "block";
    
    // Llenar datos básicos
    document.getElementById("previewNombre").textContent = receta.nombre;
    document.getElementById("previewCategoria").textContent = receta.categoria;
    document.getElementById("previewDificultad").textContent = receta.dificultad;
    document.getElementById("previewDescripcion").textContent = receta.descripcion;
    document.getElementById("previewTiempo").textContent = `${receta.tiempo.cantidad} ${receta.tiempo.unidad}`;
    document.getElementById("previewPorciones").textContent = `${receta.porciones} porciones`;
    document.getElementById("previewId").textContent = `ID: ${receta.id}`;
    
    // Llenar ingredientes
    const ingredientesContainer = document.getElementById("previewIngredientes");
    ingredientesContainer.innerHTML = "";
    receta.ingredientes.forEach(ing => {
        const div = document.createElement("div");
        div.classList.add("ingrediente-preview");
        div.innerHTML = `
            <span>${ing.nombre}</span>
            <span>${ing.cantidad} ${ing.unidad}</span>
        `;
        ingredientesContainer.appendChild(div);
    });
    
    // Llenar pasos
    const pasosContainer = document.getElementById("previewPasos");
    pasosContainer.innerHTML = "";
    receta.pasos.forEach(paso => {
        const div = document.createElement("div");
        div.classList.add("paso-preview");
        div.innerHTML = `
            <div class="paso-numero">${paso.numero}</div>
            <p>${paso.descripcion}</p>
        `;
        pasosContainer.appendChild(div);
    });
}

// Función para limpiar vista previa
function limpiarVistaPrevia() {
    emptyState.style.display = "flex";
    recipePreview.style.display = "none";
    recetaSeleccionada = null;
    searchInput.value = "";
    mensajeBusqueda.textContent = "Ingresa el ID de la receta que deseas eliminar";
    mensajeBusqueda.style.color = "#6c757d";
}

// Función para eliminar receta
function eliminarReceta() {
    if (!recetaSeleccionada) {
        alert("No hay ninguna receta seleccionada");
        return;
    }
    
    const confirmacion = confirm(
        `¿Estás seguro de que deseas eliminar la receta "${recetaSeleccionada.nombre}"?\n\n` +
        `Esta acción no se puede deshacer.`
    );
    
    if (confirmacion) {
        // Eliminar de la lista en memoria
        recetas = recetas.filter(r => r.id !== recetaSeleccionada.id);
        
        // Actualizar lista visual
        mostrarListaRecetas();
        
        // Limpiar vista previa
        limpiarVistaPrevia();
        
        // Mostrar mensaje de éxito
        alert(`La receta "${recetaSeleccionada.nombre}" ha sido eliminada correctamente`);
        
        // Nota: Aquí deberías implementar la lógica para guardar los cambios en el XML
        // Por ejemplo, enviando los datos al servidor mediante fetch/AJAX
        console.log("Receta eliminada:", recetaSeleccionada.id);
    }
}