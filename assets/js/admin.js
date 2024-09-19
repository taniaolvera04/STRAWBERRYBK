var action=document.getElementById("action");

var sesion=localStorage.getItem('usuario') || "null";

if(sesion=="null"){
    window.location.href="index.html"
}


const cargarNombre=async()=>{

    datos=new FormData();
    datos.append("usuario",sesion);
    datos.append("action","select");

    let respuesta=await fetch("php/loginUsuario.php",{method:'POST',body:datos});
    let json=await respuesta.json();

    if(json.success==true){
        document.getElementById("user").innerHTML=json.mensaje;
        document.getElementById("foto_perfil").src="php/"+json.foto;
    }else{
    Swal.fire({title:"ERROR",text:json.mensaje,icon:"error"});
    }
}

document.getElementById("salir").onclick=()=>{
    Swal.fire({
        title:"¿Está seguro de Cerrar Sesión?",
        showDenyButton:true,
        confirmButtonText:"Si",
        denyButtonText:`No`
    }).then((result)=>{
if(result.isConfirmed){
localStorage.clear();
window.location.href="index.html"
}
});
}



const cargarPerfil = async () => {
    const datos = new FormData();
    datos.append("usuario", sesion);
    datos.append("action", "perfil");

    try {
        const respuesta = await fetch("php/loginUsuario.php", { method: 'POST', body: datos });
        const json = await respuesta.json();

        if (json.success) {
            document.getElementById("email").innerHTML = json.usuario;
            document.getElementById("nombre").value = json.nombre;
            document.getElementById("foto-preview").innerHTML = `<img src="php/${json.foto}" class="foto-perfil">`;
            document.getElementById("foto_perfil").src = `php/${json.foto}`;
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema con la conexión", icon: "error" });
    }
};

const guardarPerfil = async (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const formPerfil = document.getElementById("formPerfil");
    const datos = new FormData(formPerfil);
    datos.append("usuario", sesion);
    datos.append("action", "saveperfil");

    try {
        const respuesta = await fetch("php/loginUsuario.php", { method: 'POST', body: datos });
        const json = await respuesta.json();

        if (json.success) {
            Swal.fire({ title: "¡ÉXITO!", text: json.mensaje, icon: "success" });
            // Actualiza la imagen de perfil en la página sin recargar
            document.getElementById("foto-preview").innerHTML = `<img src="php/${json.foto}" class="foto-perfil">`;
            document.getElementById("foto_perfil").src = `php/${json.foto}`;
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema con la conexión", icon: "error" });
    }
};




const limpiarP=()=>{
    document.querySelector("#ida").value="";
    document.querySelector("#nombrea").value="";
    document.querySelector("#descripcion").value="";
    document.querySelector("#precio").value="";
    document.querySelector("#cantidada").value="";
    document.getElementById("album-preview").src="";
    document.querySelector("#categoria").value="";
}


const selectCategoria = async () => {
    let datos = new FormData();
    datos.append("action", "selectAllCa");

    try {
        let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
        let json = await respuesta.json();

        console.log(json); // Añade esto para verificar la respuesta

        if (json.data) {
            let selectCategoria = document.getElementById('categoria');
            selectCategoria.innerHTML = "";

            json.data.forEach(categoria => {
                let option = document.createElement('option');
                option.value = categoria[1]; // Asegúrate de que el índice correcto está en uso
                option.textContent = categoria[1];
                selectCategoria.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
};






const guardarAlbum = async () => {

    let nombrea = document.getElementById('nombrea').value;
    let descripcion = document.getElementById('descripcion').value;
    let precio = parseFloat(document.getElementById('precio').value);
    let cantidada = parseInt(document.getElementById('cantidada').value);
    let fotoa = document.getElementById('fotoa').files[0]; 
    let categoria = document.getElementById('categoria').value;

    if (nombrea.trim() === "" || descripcion.trim() === "" || isNaN(precio) || isNaN(cantidada) || !fotoa) {
        Swal.fire({
            title: "ERROR",
            text: "Falta completar campos o seleccionar una imagen",
            icon: "error"
        });
        return;
    }

    let datos = new FormData();
    datos.append("nombrea", nombrea);
    datos.append("descripcion", descripcion);
    datos.append("precio", precio);
    datos.append("cantidada", cantidada);
    datos.append("fotoa", fotoa); 
    datos.append("categoria", categoria); 
    datos.append('action', 'guardar');

    try {
        let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
        let json = await respuesta.json();

        if (json.success === true) {
            Swal.fire({
                title: "¡REGISTRO ÉXITOSO!",
                text: json.mensaje,
                icon: "success"
            });

            limpiarP(); 
            cargarAlbum(); 
            bootstrap.Modal.getInstance(document.getElementById("addA")).hide();
        } else {
            Swal.fire({
                title: "ERROR",
                text: json.mensaje,
                icon: "error"
            });
        }
    } catch (error) {
        console.error('Error al guardar el álbum:', error);
        Swal.fire({
            title: "ERROR",
            text: "Hubo un problema al procesar la solicitud",
            icon: "error"
        });
    }
}



//TABLA PARA CARGAR PRENDAS Y BOTÓN QUE ABRE MODAL

const cargarAlbum = async () => {
    const datos = new FormData();
    datos.append("action", "selectAll");
    let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = `
        <button class="btn btn-success mb-3" data-bs-toggle="modal" data-bs-target="#addA">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus-circle-fill mx-2" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
            </svg>
            Agregar Álbum
        </button><br>

        <table id="tablaA" class="table table-striped w-75 text-center">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>DESCRIPCIÓN</th>
                    <th>PRECIO</th>
                    <th>CANTIDAD</th>
                    <th>IMAGEN</th>
                    <th>CATEGORÍA</th>
                    <th>ACTION</th>
                </tr>
            </thead>
            <tbody>
    `;

    json.data.forEach(item => {
        tablaHTML += `
            <tr>
                <td>${item[0]}</td>
                <td>${item[1]}</td>
                <td>${item[2]}</td>
                <td>${item[3]}</td>
                <td>${item[4]}</td>
                <td><img src="assets/${item[5]}" height="95px"></td>
                <td>${item[6]}</td>
                <td colspan="2">
                    <button class="btn btn-danger" onclick="eliminarA(${item[0]})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                        </svg>
                    </button>
                    <button class="btn btn-info" onclick="mostrarA(${item[0]})" data-bs-toggle="modal" data-bs-target="#editA">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });

    tablaHTML += `</tbody></table>`;

    document.getElementById("action").innerHTML = tablaHTML;

    if ($.fn.DataTable.isDataTable("#tablaA")) {
        $("#tablaA").DataTable().destroy();
    }

    $("#tablaA").DataTable({
        lengthMenu: [5, 10, 25, 50, 100],
        language: {
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "No se encontraron resultados",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "No hay registros disponibles",
            infoFiltered: "(filtrados de _MAX_ registros totales)",
            search: "Buscar:",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            }
        }
    });
};



//ELIMINAR PRENDAS

const eliminarA = async (ida) => {
    Swal.fire({
        title: "¿Estás seguro de eliminar este álbum?",
        icon: "question",
        showDenyButton: true,
        confirmButtonText: "Sí, estoy seguro",
        denyButtonText: "No estoy seguro"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // Crear un nuevo objeto FormData para esta solicitud de eliminación
                let formData = new FormData();
                formData.append('ida', ida); // Agregar el ID del álbum
                formData.append('action', 'delete'); // Agregar la acción requerida
                
                // Realizar la solicitud POST al servidor
                let respuesta = await fetch("php/metodosA.php", {
                    method: 'POST',
                    body: formData
                });

                // Verificar la respuesta JSON del servidor
                if (respuesta.ok) {
                    let json = await respuesta.json();

                    // Verificar si la eliminación fue exitosa
                    if (json.success) {
                        Swal.fire({
                            title: "¡Se eliminó con éxito!",
                            text: json.mensaje,
                            icon: "success"
                        });
                        // Recargar la lista de álbumes después de eliminar
                        cargarAlbum(); // Asegúrate de tener esta función definida
                    } else {
                        Swal.fire({
                            title: "ERROR",
                            text: json.mensaje,
                            icon: "error"
                        });
                    }
                } else {
                    // Manejar errores de red u otras fallas en la solicitud
                    throw new Error(`HTTP error! status: ${respuesta.status}`);
                }
            } catch (error) {
                console.error('Error al eliminar el álbum:', error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al intentar eliminar el álbum",
                    icon: "error"
                });
            }
        }
    });
}



const selectCategoria2 = async () => {
    let datos = new FormData();
    datos.append("action", "selectAllCa");

    try {
        let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
        let json = await respuesta.json();

        console.log(json); // Añade esto para verificar la respuesta

        if (json.data) {
            let selectCategoria = document.getElementById('ecategoria');
            selectCategoria.innerHTML = "";

            json.data.forEach(categoria => {
                let option = document.createElement('option');
                option.value = categoria[1]; // Asegúrate de que el índice correcto está en uso
                option.textContent = categoria[1];
                selectCategoria.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
};


// Mostrar información del álbum en el modal
const mostrarA = async (ida) => {
    let datos = new FormData();
    datos.append("ida", ida);
    datos.append('action', 'select');

    let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    if (json.success) {
        document.querySelector("#ida").value = json.ida;
        document.querySelector("#enombrea").value = json.nombrea;
        document.querySelector("#edescripcion").value = json.descripcion;
        document.querySelector("#eprecio").value = json.precio;
        document.querySelector("#ecantidada").value = json.cantidada;
        document.getElementById("ealbum-preview").src = "img_albumes/" + json.fotoa;
        document.querySelector("#ecategoria").value = json.categoria;
    } else {
        Swal.fire({
            title: "ERROR",
            text: "No se pudo cargar la información del álbum.",
            icon: "error"
        });
    }
};







// Actualizar álbum
const actualizarAlbum = async () => {
    var ida = document.querySelector("#ida").value;
    var nombrea = document.querySelector("#enombrea").value;
    var descripcion = document.querySelector("#edescripcion").value;
    var precio = document.querySelector("#eprecio").value;
    var cantidada = document.querySelector("#ecantidada").value;
    var fotoa = document.querySelector("#efotoa").files[0]; 
    var categoria = document.querySelector("#ecategoria").value;

    if (nombrea.trim() == "" || descripcion.trim() == "" || precio.trim() == "" || cantidada.trim() == "" ) {
        Swal.fire({
            title: "ERROR",
            text: "Tienes campos vacíos",
            icon: "error"
        });
        return;
    }

    let datos = new FormData();
    datos.append("ida", ida);
    datos.append("nombrea", nombrea);
    datos.append("descripcion", descripcion);
    datos.append("precio", precio);
    datos.append("cantidada", cantidada);
    datos.append("categoria", categoria);
    datos.append("fotoa", fotoa); 
    datos.append('action', 'update');

    try {
        let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
        let json = await respuesta.json();

        if (json.success) {
            Swal.fire({ title: "¡ACTUALIZACIÓN ÉXITOSA!", text: json.mensaje, icon: "success" });
            cargarAlbum(); // Actualiza la lista de álbumes
            bootstrap.Modal.getInstance(document.getElementById("editA")).hide();
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }

    } catch (error) {
        console.error('Error al actualizar el álbum:', error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema al procesar la solicitud", icon: "error" });
    }
};




// MOSTRAR FOTO-PREVIEW EN MODAL

function previewImage() {
    const fotoInput = document.getElementById('fotoa');
    const preview = document.getElementById('album-preview');
    
    if (fotoInput.files && fotoInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block'; 
        }

        reader.readAsDataURL(fotoInput.files[0]); // Leer el archivo como URL
    }
}


function epreviewImage() {
    const fotoInput = document.getElementById('efotoa');
    const preview = document.getElementById('ealbum-preview');
    
    if (fotoInput.files && fotoInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block'; 
        }

        reader.readAsDataURL(fotoInput.files[0]); // Leer el archivo como URL
    }
}




//METODOS PARA CATEGORIAS

const cargarCategorias = async () => {
    const datos = new FormData();
    datos.append("action", "selectAllCa");
    let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = `
        <button class="btn btn-success mb-2" data-bs-toggle="modal" data-bs-target="#addCa">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus-circle-fill mx-2" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
            </svg>
            Agregar Categoria
        </button><br>

        <table id="tablaC" class="table table-striped w-75 text-center">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>CATEGORÍA</th>
                    <th>ACTION</th>
                </tr>
            </thead>
            <tbody>
    `;

    json.data.forEach(item => {
        tablaHTML += `
            <tr>
                <td>${item[0]}</td>
                <td>${item[1]}</td>

                <td colspan="2">
                    <button class="btn btn-danger" onclick="eliminarC(${item[0]})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                        </svg>
                    </button>
                    <button class="btn btn-info" onclick="mostrarC(${item[0]})" data-bs-toggle="modal" data-bs-target="#editCa">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });

    tablaHTML += `</tbody></table>`;

    document.getElementById("action").innerHTML = tablaHTML;

    if ($.fn.DataTable.isDataTable("#tablaC")) {
        $("#tablaC").DataTable().destroy();
    }

    $("#tablaC").DataTable({
        lengthMenu: [5, 10, 25, 50, 100],
        language: {
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "No se encontraron resultados",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "No hay registros disponibles",
            infoFiltered: "(filtrados de _MAX_ registros totales)",
            search: "Buscar:",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            }
        }
    });
};





//GUARDAR CATEGORIA

const guardarCategoria = async () => {
    let nombrec = document.getElementById('nombrec').value;
    

    if (nombrec.trim() == "") {
        Swal.fire({
            title: "ERROR",
            text: "CAMPO VACÍO",
            icon: "error"
        });
        return;
    }

    let datos = new FormData();
    datos.append("nombrec", nombrec); 
    datos.append('action', 'guardarCa');

        let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
        let json = await respuesta.json();

        if (json.success == true) {
            Swal.fire({
                title: "¡REGISTRO ÉXITOSO!",
                text: json.mensaje,
                icon: "success"
            });

            cargarCategorias();
            selectCategoria();
            selectCategoria2();
            
            bootstrap.Modal.getInstance(document.getElementById("addCa")).hide();
            document.querySelector("#nombrec").value="";
            
        } else {
            Swal.fire({
                title: "ERROR",
                text: json.mensaje,
                icon: "error"
            });
        }
}



//ELIMINAR CATEGORIAS

const eliminarC = async (idCategoria) => {
    Swal.fire({
        title: "¿Estás seguro de eliminar esta categoría?",
        icon: "question",
        showDenyButton: true,
        confirmButtonText: "Si, estoy seguro",
        denyButtonText: "No estoy seguro"
    }).then(async (result) => {
        if (result.isConfirmed) {
           
            let formData = new FormData();
            formData.append('idc', idCategoria); 
            formData.append('action', 'deleteCa'); 

            try {
                let respuesta = await fetch("php/metodosA.php", {
                    method: 'POST',
                    body: formData
                });

                let json = await respuesta.json();

                if (json.success) {
                    Swal.fire({
                        title: "¡Se eliminó con éxito!",
                        text: json.mensaje,
                        icon: "success"
                    });
                } else {
                    Swal.fire({
                        title: "ERROR",
                        text: json.mensaje,
                        icon: "error"
                    });
                }
                cargarCategorias();
                selectCategoria();
                selectCategoria2();
            } catch (error) {
                console.error('Error al eliminar categoría:', error);
                Swal.fire({
                    title: "ERROR",
                    text: "Hubo un problema al eliminar la categoría.",
                    icon: "error"
                });
            }
        }
    });
}



//MOSTRAR INFORMACIÓN DE CATEGORIA EN MODAL

const mostrarC=async(idc)=>{
    let datos=new FormData();
    datos.append("idc",idc);
    datos.append('action','selectCa');
    
    let respuesta=await fetch("php/metodosA.php",{method:'POST',body:datos});
    let json=await respuesta.json();

    document.querySelector("#idc").value=json.idc;
    document.querySelector("#enombrec").value=json.nombrec;
   
}


//ACTUALIZAR CATEGORÍAS
const actualizarCategoria = async () => {
    var idc = document.querySelector("#idc").value;
    var nombrec = document.querySelector("#enombrec").value;
    
    if (nombrec.trim() == "") {
        Swal.fire({
            title: "ERROR",
            text: "El nombre de categoría no puede estar vacío",
            icon: "error"
        });
        return;
    }
    
    let datos = new FormData();
    datos.append("idc", idc);
    datos.append("nombrec", nombrec); 
    datos.append('action', 'updateCa');
    try {
        let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
        let json = await respuesta.json();
        
        if (json.success == true) {
            Swal.fire({ title: "¡ACTUALIZACIÓN ÉXITOSA!", text: json.mensaje, icon: "success" });
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
        
        cargarCategorias(); 
        cargarAlbum();
        selectCategoria();
        selectCategoria2();
        bootstrap.Modal.getInstance(document.getElementById("editCa")).hide();
        
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        Swal.fire({ title: "ERROR", text: "Hubo un problema al procesar la solicitud", icon: "error" });
    }
}    





//MOSTRAR USUARIOS

const mostrarUsu=async()=>{
    const datos = new FormData();
    datos.append("action", "selectAllUsu");
    let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    let tablaHTML = `
        <table id="tablaU" class="table table-striped w-75 text-center">
            <thead>
                <tr>
                    <th>ID_U</th>
                    <th>USUARIO</th>
                    <th>PASSWORD</th>
                    <th>NOMBRE</th>
                    <th>TIPO</th>
                </tr>
            </thead>
            <tbody id="lista">
    `;

    json.data.forEach(item => {
        tablaHTML += `
            <tr>
                <td>${item[0]}</td>
                <td>${item[1]}</td>
                <td>${item[2]}</td>
                <td>${item[3]}</td>
                <td>${item[4]}</td>
            </tr>
        `;
    });

    tablaHTML += `</tbody></table>
    `;

    document.getElementById("action").innerHTML = tablaHTML;

    if ($.fn.DataTable.isDataTable("#tablaU")) {
        $("#tablaU").DataTable().destroy();
    }

    $("#tablaU").DataTable({
        lengthMenu: [5, 10, 25, 50, 100],
        language: {
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "No se encontraron resultados",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "No hay registros disponibles",
            infoFiltered: "(filtrados de _MAX_ registros totales)",
            search: "Buscar:",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            }
        }
    });
};



const mostrarOrden = async () => {
    const datos = new FormData();
    datos.append("action", "selectAllOr");
    
    try {
        let respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });
        let json = await respuesta.json();

        let tablaHTML = `
            <table id="tablaO" class="table table-striped w-75 text-center">
                <thead>
                    <tr>
                        <th>ID ORDEN</th>
                        <th>NOMBRE DE USUARIO</th>
                        <th>NOMBRE DE ÁLBUM</th>
                        <th>CANTIDAD</th>
                        <th>TOTAL</th>
                        <th>FECHA</th>
                    </tr>
                </thead>
                <tbody id="listaOrden">
        `;

        json.data.forEach(item => {
            tablaHTML += `
                <tr>
                    <td>${item[0]}</td>
                    <td>${item[1]}</td>
                    <td>${item[2]}</td>
                    <td>${item[3]}</td>
                    <td>$${item[4].toFixed(2)}</td>
                    <td>${new Date(item[5]).toLocaleString()}</td>
                </tr>
            `;
        });

        tablaHTML += `</tbody></table>`;

        document.getElementById("action").innerHTML = tablaHTML;

        if ($.fn.DataTable.isDataTable("#tablaO")) {
            $("#tablaO").DataTable().destroy();
        }

        $("#tablaO").DataTable({
            lengthMenu: [5, 10, 25, 50, 100],
            language: {
                lengthMenu: "Mostrar _MENU_ registros por página",
                zeroRecords: "No se encontraron resultados",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "No hay registros disponibles",
                infoFiltered: "(filtrados de _MAX_ registros totales)",
                search: "Buscar:",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior"
                }
            }
        });

    } catch (error) {
        console.error("Error al cargar órdenes:", error);
    }
};

