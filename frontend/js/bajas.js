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
        const response = await fetch("../data/recetario.xml");
        if (!response.ok) {
            throw new Error(`No se pudo cargar el XML. Status: ${response.status}`);
        }
        const xmlText = await response.text();
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
        const categoria = recetaXML.getAttribute("categoria") || "";
        const dificultad = recetaXML.getAttribute("dificultad") || "";

        const nombre = recetaXML.getElementsByTagNameNS(ns, "nombre")[0]?.textContent.trim() || "";
        const descripcion = recetaXML.getElementsByTagNameNS(ns, "descripcion")[0]?.textContent.trim() || "";

        // Tiempo total
        const tiempoXML = recetaXML.getElementsByTagNameNS(ns, "tiempo")[0];
        const tiempo = {
            total: tiempoXML?.getAttribute("total") || "0",
            unidad: tiempoXML?.getAttribute("unidad") || "minutos"
        };

        // Porciones
        const porcionesXML = recetaXML.getElementsByTagNameNS(ns, "porciones")[0];
        const porciones = porcionesXML?.getAttribute("cantidad") || "0";

        // Ingredientes
        const ingredientesXML = recetaXML.getElementsByTagNameNS(ns, "ingrediente");
        const ingredientes = [];
        for (let i = 0; i < ingredientesXML.length; i++) {
            ingredientes.push({
                nombre: ingredientesXML[i].textContent.trim(),
                cantidad: ingredientesXML[i].getAttribute("cantidad") || "",
                unidad: ingredientesXML[i].getAttribute("unidad") || ""
            });
        }

        // Pasos de preparación
        const pasosXML = recetaXML.getElementsByTagNameNS(ns, "paso");
        const pasos = [];
        for (let i = 0; i < pasosXML.length; i++) {
            pasos.push({
                orden: pasosXML[i].getAttribute("orden") || (i + 1).toString(),
                descripcion: pasosXML[i].textContent.trim()
            });
        }

        // Video, enlace y notas (opcionales)
        const video = recetaXML.getElementsByTagNameNS(ns, "video")[0]?.getAttribute("url") || "";
        const enlace = recetaXML.getElementsByTagNameNS(ns, "enlace")[0]?.getAttribute("url") || "";
        const notas = recetaXML.getElementsByTagNameNS(ns, "notas")[0]?.textContent.trim() || "";

        return {
            id,
            nombre,
            categoria,
            dificultad,
            descripcion,
            tiempo,
            porciones,
            ingredientes,
            pasos,
            video,
            enlace,
            notas
        };
    } catch (error) {
        console.error("Error parseando receta:", error);
        return null;
    }
}

// Función para mostrar la lista de recetas
function mostrarListaRecetas() {

    // Limpiar la lista actual
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
        console.log(receta);
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
    document.getElementById("previewTiempo").textContent = `${receta.tiempo.total} ${receta.tiempo.unidad}`;
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

    receta.pasos.forEach((paso, index) => {
        const div = document.createElement("div");
        div.classList.add("paso-preview");
        div.innerHTML = `
            <div class="paso-numero">${index + 1}</div>
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

// Función para eliminar receta desde panel de recetas
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

        //Eliminar receta
        eliminarRecetaXML(recetaSeleccionada.id);

        // Cargamos nuevamente
        cargarXML();

        // Actualizar lista visual
        mostrarListaRecetas();
        
        // Limpiar vista previa
        limpiarVistaPrevia();
        
    }
}

// Funcion para eliminar receta desde archivo XML
async function eliminarRecetaXML(idReceta) {

    const NS = "http://www.recetas.com"; // Namespace principal

    try {
        // Cargar el XML existente
        const response = await fetch("../data/recetario.xml");
        if (!response.ok) throw new Error("No se pudo cargar el XML");

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Error al analizar el XML");
        }

        // Buscar la receta por su id y eliminarla
        const recetas = xmlDoc.getElementsByTagNameNS(NS, "receta");
        let recetaEncontrada = false;

        for (let i = 0; i < recetas.length; i++) {
            if (recetas[i].getAttribute("id") === idReceta) {
                recetas[i].parentNode.removeChild(recetas[i]);
                recetaEncontrada = true;
                break;
            }
        }

        if (!recetaEncontrada) {
            alert("No se encontró la receta con id: " + idReceta);
            return;
        }

        // Reasignar IDs consecutivos r001, r002, r003...
        const recetasRestantes = xmlDoc.getElementsByTagNameNS(NS, "receta");
        for (let i = 0; i < recetasRestantes.length; i++) {
            const nuevoId = "r" + String(i + 1).padStart(3, "0");
            recetasRestantes[i].setAttribute("id", nuevoId);
        }

        // Convertir a string para enviar o guardar
        const serializer = new XMLSerializer();
        const nuevoXMLString = serializer.serializeToString(xmlDoc);

        console.log(nuevoXMLString);

        // Enviar al servidor para guardar los cambios
        const respuesta = await fetch("../backend/guardar_recetario.php", {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: nuevoXMLString
        });
        const mensaje = await respuesta.text();

        alert(mensaje);

    } catch (error) {
        console.error("Error eliminando la receta:", error);
        alert("Ocurrió un error al eliminar la receta. Revisa la consola.");
    }
}