let ingredientes = [];
let pasos = [];
let listaIds = [];
const ingredientesContainer = document.getElementById("ingredientesContainer");
const pasosContainer = document.getElementById("pasosContainer");

// Funcion para cargar XML
async function cargarXML() {
    try {
        const response = await fetch("../data/recetario.xml");
        if (!response.ok) throw new Error("No se pudo cargar el XML");
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml"); 
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Error al analizar el XML");
        }
        const recetas = xmlDoc.getElementsByTagNameNS("http://www.recetas.com", "receta");
        listaIds = [];

        for (let i = 0; i < recetas.length; i++) {
            const id = recetas[i].getAttribute("id");
            if (id) listaIds.push(id.trim());
        }
    } catch (error) {
        console.error("Error cargando el XML:",error);
    }
}

// Función para leer entradas
function validar_entradas(event) { 
    // Prevenir envío si se llama desde onsubmit
    if (event) event.preventDefault();

    const campos = [
        "idReceta",
        "nombre",
        "categoria",
        "dificultad",
        "descripcion",
        "tiempoTotalNumero",
        "tiempoTotalUnidad",
        "porciones"
    ];
    let valido = true;

    // Agregar eventos para quitar el color rojo cuando el campo tenga contenido
    campos.forEach(id => {
        const elemento = document.getElementById(id);
        elemento.addEventListener("input", () => {
            if (elemento.value.trim() !== "") {
                elemento.classList.remove("input-error");
            }
        });
    });

    // Verificar campos vacíos
    campos.forEach(id => {
        const elemento = document.getElementById(id);
        const valor = elemento.value.trim();

        if (!valor) {
            elemento.classList.add("input-error");
            valido = false;
        }
    });

    if (!valido) {
        alert("Por favor completa todos los campos obligatorios (*)");
        return false;
    }

    // Verificar que existan ingredientes y pasos
    if (ingredientes.length === 0) {
        alert("Agrega los ingredientes por favor");
        return false;
    }

    if (pasos.length === 0) {
        alert("Agrega los pasos por favor");
        return false;
    }

    // Obtener el valor del ID
    const idReceta = document.getElementById("idReceta").value.trim();

    // Verificar si el ID ya existe
    if (listaIds.includes(idReceta)) {
        alert("El ID ya existe");
        const campo = document.getElementById("idReceta");
        campo.classList.add("input-error");
        campo.focus();
        return false; // No borra nada del formulario
    }

    // Todo correcto: mostrar mensaje
    alert("Datos guardados correctamente");

    // Limpiar todos los campos del formulario
    campos.forEach(id => {
        document.getElementById(id).value = "";
        document.getElementById(id).classList.remove("input-error");
    });

    const valores_validos = crear_json(ingredientes, pasos);

    // Limpiar ingredientes y pasos
    ingredientes = [];
    pasos = [];

    // Limpiar contenedores del DOM (si existen)
    const ingredientesContainer = document.getElementById("ingredientesContainer");
    if (ingredientesContainer) ingredientesContainer.innerHTML = "";

    const pasosContainer = document.getElementById("pasosContainer");
    if (pasosContainer) pasosContainer.innerHTML = "";

    return true;
}

function crear_json(ingredientes, pasos){
    const idReceta = document.getElementById("idReceta").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const dificultad = document.getElementById("dificultad").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const tiempo = document.getElementById("tiempoTotalNumero").value.trim();
    const unidadTempo = document.getElementById("tiempoTotalUnidad").value.trim();
    const porciones = document.getElementById("porciones").value.trim();
    const VideoUrl = document.getElementById("videoUrl").value.trim();
    const enlaceUrl = document.getElementById("enlaceUrl").value.trim();
    const notas = document.getElementById("notas").value.trim();

    // Crear el objeto JSON
    return {
        idReceta: idReceta,
        nombre: nombre,
        categoria: categoria,
        dificultad: dificultad,
        descripcion: descripcion,
        tiempoTotal: {
            cantidad: tiempo,
            unidad: unidadTempo
        },
        porciones: porciones,
        videoUrl: videoUrl,
        enlaceUrl: enlaceUrl,
        notas: notas,
        ingredientes: ingredientes, // Array de objetos o strings
        pasos: pasos // Array de objetos con descripción y número
    };
}
// Función para agregar un ingrediente
function agregar_ingrediente() {
    let nombre = "";
    while (true) {
        nombre = prompt("Nombre del ingrediente:");
        if (nombre === null) return; 
        if (nombre.trim() === "") {
            alert("Debes ingresar un nombre para el ingrediente.");
        } else {
            break;
        }
    }
    let cantidad = "";
    while (true) {
        cantidad = prompt("Cantidad del ingrediente:");
        if (cantidad === null) return;
        if (cantidad.trim() === "") {
            alert("Debes ingresar la cantidad del ingrediente.");
        } else {
            break;
        }
    }
    let unidad = "";
    while (true) {
        unidad = prompt("Unidad (ej. g, ml, taza):");
        if (unidad === null) return;
        if (unidad.trim() === "") {
            alert("Debes ingresar la unidad del ingrediente.");
        } else {
            break;
        }
    }
    const ingrediente = { nombre, cantidad, unidad };
    ingredientes.push(ingrediente);

    // Crear un elemento visual para el ingrediente
    const ingredienteDiv = document.createElement("div");
    ingredienteDiv.classList.add("ingrediente-item");
    ingredienteDiv.style.display = "flex";
    ingredienteDiv.style.justifyContent = "space-between";
    ingredienteDiv.style.alignItems = "center";
    ingredienteDiv.style.marginBottom = "5px";
    const texto = document.createElement("span");
    texto.textContent = `${cantidad} ${unidad} de ${nombre}`;
    const btnBorrar = document.createElement("button");
    btnBorrar.textContent = "🗑️";
    btnBorrar.classList.add("btn-borrar");
    btnBorrar.addEventListener("click", () => borrar_ingrediente(ingredienteDiv, ingrediente));
    ingredienteDiv.appendChild(texto);
    ingredienteDiv.appendChild(btnBorrar);
    ingredientesContainer.appendChild(ingredienteDiv);
}

// Función para borrar un ingrediente
function borrar_ingrediente(divElemento, ingredienteObj) {
    ingredientes = ingredientes.filter(i => i !== ingredienteObj);
    divElemento.remove();
}

// Función para agregar un paso
function agregar_paso() {
    let descripcion = "";
    while (true) {
        descripcion = prompt("Describe el paso de preparación:");
        if (descripcion === null) return; // si cancela, salir
        if (descripcion.trim() === "") {
            alert("Debes ingresar una descripción para el paso.");
        } else {
            break;
        }
    }
    const paso = { descripcion };
    pasos.push(paso);

    // Crear un elemento visual para el paso
    const pasoDiv = document.createElement("div");
    pasoDiv.classList.add("paso-item");
    pasoDiv.style.display = "flex";
    pasoDiv.style.justifyContent = "space-between";
    pasoDiv.style.alignItems = "center";
    pasoDiv.style.marginBottom = "5px";
    const numero = pasos.length;
    const texto = document.createElement("span");
    texto.textContent = `${numero}. ${descripcion}`;
    const btnBorrar = document.createElement("button");
    btnBorrar.textContent = "🗑️";
    btnBorrar.classList.add("btn-borrar");
    btnBorrar.addEventListener("click", () => borrar_paso(pasoDiv, paso));
    pasoDiv.appendChild(texto);
    pasoDiv.appendChild(btnBorrar);
    pasosContainer.appendChild(pasoDiv);
}

// Función para borrar un paso
function borrar_paso(divElemento, pasoObj) {
    
    pasos = pasos.filter(p => p !== pasoObj);
    
    divElemento.remove();

    const elementos = pasosContainer.querySelectorAll("span");
    elementos.forEach((el, index) => {
        el.textContent = `${index + 1}. ${pasos[index].descripcion}`;
    });
}

// Función para limpiar el formulario por completo
function limpiar_formulario() {
    const form = document.getElementById("formReceta");
    form.reset(); 
    ingredientes = [];
    pasos = [];
    const ingredientesContainer = document.getElementById("ingredientesContainer");
    const pasosContainer = document.getElementById("pasosContainer");
    ingredientesContainer.innerHTML = "";
    pasosContainer.innerHTML = "";
}
