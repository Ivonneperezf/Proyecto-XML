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

const form = document.getElementById("formEditar");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await guardar_cambios();
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

// Función para mostrar vista previa
function mostrarVistaPrevia(receta) {
    const recetaId = document.getElementById("recetaId");
    const nombre = document.getElementById("nombre");
    const categoria = document.getElementById("categoria");
    const dificultad = document.getElementById("dificultad");
    const descripcion = document.getElementById("descripcion");
    const contenedor = document.getElementById("contenedor-ingredientes");
    const tiempocantidad = document.getElementById("tiempoTotal");
    const unidadTiempo = document.getElementById("unidadTiempo");
    const porciones = document.getElementById("porciones");
    const videoUrl = document.getElementById("videoUrl");
    const enlaceUrl = document.getElementById("enlaceUrl");
    const notas = document.getElementById("notas");

    recetaId.value = receta["id"];
    nombre.value = receta["nombre"];
    categoria.value = receta["categoria"];
    dificultad.value = receta["dificultad"];
    descripcion.value = receta["descripcion"];
    const ingredientes = receta["ingredientes"];
    contenedor.innerHTML = "";

    ingredientes.forEach(ing => {
        const item = document.createElement("div");
        item.classList.add("ingrediente-item");

        const inputNombre = document.createElement("input");
        inputNombre.type = "text";
        inputNombre.classList.add("input-field", "ing-nombre");
        inputNombre.placeholder = "Ingrediente";
        inputNombre.value = ing.nombre;

        const divCantUni = document.createElement("div");
        divCantUni.classList.add("cantidad-unidad");

        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.classList.add("input-field", "ing-cantidad");
        inputCantidad.placeholder = "Cant.";
        inputCantidad.value = ing.cantidad;

        const inputUnidad = document.createElement("input");
        inputUnidad.type = "text";
        inputUnidad.classList.add("input-field", "ing-unidad");
        inputUnidad.placeholder = "Unidad (g, kg, ml, ...)";
        inputUnidad.maxLength = 10;
        inputUnidad.value = ing.unidad;

        divCantUni.appendChild(inputCantidad);
        divCantUni.appendChild(inputUnidad);

        const btnDelete = document.createElement("button");
        btnDelete.type = "button";
        btnDelete.classList.add("btn-delete");
        btnDelete.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        btnDelete.addEventListener("click", () => item.remove());

        item.appendChild(inputNombre);
        item.appendChild(divCantUni);
        item.appendChild(btnDelete);

        contenedor.appendChild(item);
    });

    const pasosContainer = document.getElementById("pasosContainer");
    const pasos = receta["pasos"]; // tu array de pasos

    // Limpiar los pasos previos
    pasosContainer.innerHTML = "";

    // Crear cada paso
    pasos.forEach(paso => {
        const pasoItem = document.createElement("div");
        pasoItem.classList.add("paso-item");
        pasoItem.style.display = "flex";       // fila de número, textarea y botón
        pasoItem.style.alignItems = "center";
        pasoItem.style.gap = "1rem";
        pasoItem.style.marginBottom = "0.8rem";

        // Número del paso
        const pasoNumero = document.createElement("div");
        pasoNumero.classList.add("paso-numero");
        pasoNumero.textContent = paso.orden;
        pasoNumero.style.minWidth = "20px"; // opcional, que no se encoja

        // Textarea de descripción
        const textarea = document.createElement("textarea");
        textarea.classList.add("input-field", "paso-descripcion");
        textarea.rows = 2;
        textarea.value = paso.descripcion;
        textarea.style.flex = "1"; // ocupa todo el espacio disponible

        // Botón eliminar
        const btnDelete = document.createElement("button");
        btnDelete.type = "button";
        btnDelete.classList.add("btn-delete");
        btnDelete.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        btnDelete.addEventListener("click", () => pasoItem.remove());

        // Armar el bloque del paso
        pasoItem.appendChild(pasoNumero);
        pasoItem.appendChild(textarea);
        pasoItem.appendChild(btnDelete);

        // Agregar al contenedor principal
        pasosContainer.appendChild(pasoItem);
    });
    tiempocantidad.value = receta["tiempo"]["total"];
    unidadTiempo.value = receta["tiempo"]["unidad"];
    porciones.value = receta["porciones"];
    videoUrl.value = receta["video"];
    enlaceUrl.value = receta["enlace"];
    notas.value = receta["notas"];
}

function resetFormulario() {
    // Pregunta de confirmación
    if (!confirm("¿Seguro que desea cancelar?")) {
        return; // Si el usuario cancela, no hace nada
    }

    // Campos de texto
    document.getElementById("searchId").value="";
    document.getElementById("recetaId").value = "";  // también se borra el ID
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("tiempoTotal").value = "";
    document.getElementById("unidadTiempo").value = "";
    document.getElementById("porciones").value = "";
    document.getElementById("videoUrl").value = "";
    document.getElementById("enlaceUrl").value = "";
    document.getElementById("notas").value = "";

    // Selects
    document.getElementById("categoria").value = "";
    document.getElementById("dificultad").value = "";

    // Contenedores de ingredientes y pasos
    const contenedorIngredientes = document.getElementById("contenedor-ingredientes");
    const pasosContainer = document.getElementById("pasosContainer");

    contenedorIngredientes.innerHTML = ""; // limpia todos los ingredientes
    pasosContainer.innerHTML = "";         // limpia todos los pasos
}

async function cargarXMLEdit() {
    try {
        const response = await fetch("../data/recetario.xml");
        if (!response.ok) throw new Error("No se pudo cargar el XML");

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Error al analizar el XML");
        }

        return xmlDoc; // devolver el documento XML parseado
    } catch (error) {
        console.error("Error cargando el XML:", error);
    }
}

function buscarRecetaPorId(xmlDoc, idReceta) {
    const ns = "http://www.recetas.com";
    const recetas = xmlDoc.getElementsByTagNameNS(ns, "receta");
    
    for (let i = 0; i < recetas.length; i++) {
        if (recetas[i].getAttribute("id") === idReceta) {
            return recetas[i]; // devuelve el nodo <receta>
        }
    }
    return null; // no se encontró
}


function editarReceta(recetaNodo, cambios) {
    const ns = "http://www.recetas.com";

    if (cambios.nombre) {
        const nombreNodo = recetaNodo.getElementsByTagNameNS(ns, "nombre")[0];
        nombreNodo.textContent = cambios.nombre;
    }

    if (cambios.descripcion) {
        const descripcionNodo = recetaNodo.getElementsByTagNameNS(ns, "descripcion")[0];
        descripcionNodo.textContent = cambios.descripcion;
    }

    if (cambios.categoria) {
        recetaNodo.setAttribute("categoria", cambios.categoria);
    }

    if (cambios.dificultad) {
        recetaNodo.setAttribute("dificultad", cambios.dificultad);
    }

    // Ejemplo: cambiar notas
    if (cambios.notas) {
        const notasNodo = recetaNodo.getElementsByTagNameNS(ns, "notas")[0];
        notasNodo.textContent = cambios.notas;
    }
}

function obtenerIngredientes() {
    const ingredientesArray = [];
    const contenedor = document.getElementById("ingredientesContainer");
    const items = contenedor.querySelectorAll(".ingrediente-item");

    items.forEach((item, index) => {
        // Omitir la plantilla (primer elemento)
        if (index === 0 && item.id === "contenedor-ingredientes") return;

        const nombre = item.querySelector(".ing-nombre")?.value.trim() || "";
        const cantidad = item.querySelector(".ing-cantidad")?.value.trim() || "";
        const unidad = item.querySelector(".ing-unidad")?.value.trim() || "";

        if (nombre !== "") {
            ingredientesArray.push({ nombre, cantidad, unidad });
        }
    });

    return ingredientesArray;
}

async function guardar_cambios() {
    // try {
    //     // 1️⃣ Cargar el XML
    //     const xmlDoc = await cargarXML();
    //     if (!xmlDoc) throw new Error("No se pudo cargar el XML");

    //     // 2️⃣ Obtener el id de la receta desde el input
    //     const recetaId = document.getElementById("recetaId").value.trim();
    //     if (!recetaId) {
    //         alert("El ID de la receta está vacío");
    //         return;
    //     }

    //     // 3️⃣ Buscar la receta por ID
    //     const receta = buscarRecetaPorId(xmlDoc, recetaId);
    //     if (!receta) {
    //         alert("Receta no encontrada en el XML");
    //         return;
    //     }

    //     // 4️⃣ Crear objeto con los cambios desde el formulario
        

    //     const cambios = {
    //         nombre: document.getElementById("nombre").value.trim(),
    //         categoria: document.getElementById("categoria").value,
    //         dificultad: document.getElementById("dificultad").value,
    //         descripcion: document.getElementById("descripcion").value.trim(),
    //     };

    //     // 5️⃣ Editar la receta
    //     editarReceta(receta, cambios);

    //     // 6️⃣ Serializar el XML modificado
    //     const nuevoXMLString = new XMLSerializer().serializeToString(xmlDoc);

    //     // 7️⃣ Enviar al servidor
    //     const respuesta = await fetch("../backend/guardar_recetario.php", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/xml" },
    //         body: nuevoXMLString
    //     });

    //     const mensaje = await respuesta.text();

    //     // 8️⃣ Mostrar mensaje del servidor
    //     alert(mensaje);

    // } catch (error) {
    //     console.error("Error al guardar los cambios:", error);
    //     alert("Ocurrió un error al guardar los cambios. Revisa la consola.");
    // }
}
