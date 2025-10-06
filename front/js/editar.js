let recetas = [];
let recetaSeleccionada = null;

function inicio(){
    const categoria = document.getElementById("categoria");
    const dificultad = document.getElementById("dificultad");
    categoria.removeAttribute("readonly");
    categoria.disabled = false;
    dificultad.removeAttribute("readonly");
    dificultad.disabled = false;
    categoria.style.cursor = "pointer";
    dificultad.style.cursor = "pointer";
}

const searchInput = document.getElementById("searchId");
const recetasList = document.getElementById("recetasList");

// Cargar XML al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarXML();
    
    // Event listeners
    btnBuscar.addEventListener("click", buscarReceta);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") buscarReceta();
    });

});

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
        console.log(recetas);
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