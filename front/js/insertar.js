let ingredientes = [];
const ingredientesContainer = document.getElementById("ingredientesContainer");

// Función para leer entradas
function validar_entradas() {
    // Obtener los valores de los campos del formulario
    const idReceta = document.getElementById("idReceta").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoria").value;
    const dificultad = document.getElementById("dificultad").value;
    const descripcion = document.getElementById("descripcion").value.trim();
    const tiempoTotal = document.getElementById("tiempoTotal").value;
    const porciones = document.getElementById("porciones").value;
    const videoUrl = document.getElementById("videoUrl").value.trim();
    const enlaceUrl = document.getElementById("enlaceUrl").value.trim();
    const notas = document.getElementById("notas").value.trim();

    // Validar campos obligatorios
    if (!idReceta || !nombre || !categoria || !dificultad || !descripcion || !tiempoTotal || !porciones) {
        alert("Por favor completa todos los campos obligatorios (*)");
        return false;
    }

    // Si todo está correcto, devolver un objeto con los valores
    const receta = {
        idReceta,
        nombre,
        categoria,
        dificultad,
        descripcion,
        tiempoTotal: parseInt(tiempoTotal),
        porciones: parseInt(porciones),
        videoUrl,
        enlaceUrl,
        notas
    };

    console.log("Datos leídos del formulario:", receta);
    return receta;
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

    console.log("Ingrediente agregado:", ingrediente);
    console.log(ingredientes);

    // Crear un elemento visual para el ingrediente
    const ingredienteDiv = document.createElement("div");
    ingredienteDiv.classList.add("ingrediente-item");
    ingredienteDiv.style.display = "flex";
    ingredienteDiv.style.justifyContent = "space-between";
    ingredienteDiv.style.alignItems = "center";
    ingredienteDiv.style.marginBottom = "5px";

    // Texto del ingrediente
    const texto = document.createElement("span");
    texto.textContent = `${cantidad} ${unidad} de ${nombre}`;

    // Botón de borrar
    const btnBorrar = document.createElement("button");
    btnBorrar.textContent = "🗑️";
    btnBorrar.classList.add("btn-borrar");
    btnBorrar.addEventListener("click", () => borrar_ingrediente(ingredienteDiv, ingrediente));

    // Agregar texto y botón al div
    ingredienteDiv.appendChild(texto);
    ingredienteDiv.appendChild(btnBorrar);

    // Agregar div al contenedor
    ingredientesContainer.appendChild(ingredienteDiv);
}

// Función para borrar un ingrediente
function borrar_ingrediente(divElemento, ingredienteObj) {
    ingredientes = ingredientes.filter(i => i !== ingredienteObj);
    divElemento.remove();
    console.log("Ingrediente eliminado:", ingredienteObj);
    console.log(ingredientes);
}