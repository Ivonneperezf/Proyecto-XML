let ingredientes = [];
let pasos = [];
let listaIds = [];
const ingredientesContainer = document.getElementById("ingredientesContainer");
const pasosContainer = document.getElementById("pasosContainer");

// Función para leer entradas
function validar_entradas() {
    const numTem = 0;
    const numuni= "";
    // Obtener los valores de los campos del formulario
    const idReceta = document.getElementById("idReceta").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const dificultad = document.getElementById("dificultad").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const tiempoTotalNumero = document.getElementById("tiempoTotalNumero").value;
    const tiempoTotalUnidad = document.getElementById("tiempoTotalUnidad").value.trim();
    // const porciones = document.getElementById("porciones").value;
    // const videoUrl = document.getElementById("videoUrl").value.trim();
    // const enlaceUrl = document.getElementById("enlaceUrl").value.trim();
    // const notas = document.getElementById("notas").value.trim();

    // Validar campos obligatorios


    fetch("http://localhost/Proyectos/ProyectoXML/data/recetario.xml")
    .then(response => response.text())
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(xmlDoc => {
        const recetas = xmlDoc.getElementsByTagNameNS("http://www.recetas.com", "receta");

        // Vaciar la lista antes de llenarla
        listaIds = [];

        for (let i = 0; i < recetas.length; i++) {
            const id = recetas[i].getAttribute("id");
            listaIds.push(id.trim());
        }

        if (!idReceta || !nombre || categoria == "" || dificultad == "" || !descripcion ||!tiempoTotalNumero||!tiempoTotalUnidad) {
            alert("Por favor completa todos los campos obligatorios (*)");
            return false;
        }

        if (ingredientes.length == 0){
            alert("Agrega los ingredientes por favor");
            return false;
        }

        if (pasos.length == 0){
            alert("Agrega los pasos por favor");
            return false;
        }

        // Comparación dentro del fetch
        if (listaIds.includes(idReceta)) {
            alert("El ID ya existe");
            return false;
        }

        numTem = parseInt(tiempoTotalNumero,10);
    })
    .catch(err => console.error("Error al cargar XML:", err));

    // Si todo está correcto, devolver un objeto con los valores
    // const receta = {
    //     idReceta,
    //     nombre,
    //     categoria,
    //     dificultad,
    //     descripcion,
    //     tiempoTotal: parseInt(tiempoTotal),
    //     porciones: parseInt(porciones),
    //     videoUrl,
    //     enlaceUrl,
    //     notas
    // };

    // console.log("Datos leídos del formulario:", receta);
    // return receta;
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
    console.log("Ingrediente eliminado:", ingredienteObj);
    console.log(ingredientes);
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
    console.log("Paso agregado:", paso);
    console.log(pasos);

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
    console.log("Paso eliminado:", pasoObj);
    console.log(pasos);
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
    console.log("Formulario, ingredientes y pasos limpiados.");
}
