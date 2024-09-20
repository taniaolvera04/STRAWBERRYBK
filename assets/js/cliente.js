var action = document.getElementById("action");
var sesion = localStorage.getItem('usuario') || "null";


var boton=document.getElementById("boton");
const navCombo = document.getElementById("navCombo");



if (sesion === "null") {
    window.location.href = "index.html";
}

const cargarNombre = async () => {
    const datos = new FormData();
    datos.append("usuario", sesion);
    datos.append("action", "select");

    let respuesta = await fetch("php/loginUsuario.php", { method: 'POST', body: datos });
    let json = await respuesta.json();

    if (json.success) {
        document.getElementById("user").innerHTML = json.mensaje;
        document.getElementById("foto_perfil").src = "php/" + json.foto;
    } else {
        Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
    }
};

document.getElementById("salir").onclick = () => {
    Swal.fire({
        title: "¿Está seguro de Cerrar Sesión?",
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: `No`
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = "index.html";
        }
    });
};

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
    event.preventDefault();

    const formPerfil = document.getElementById("formPerfil");
    const datos = new FormData(formPerfil);
    datos.append("usuario", sesion);
    datos.append("action", "saveperfil");

    try {
        const respuesta = await fetch("php/loginUsuario.php", { method: 'POST', body: datos });
        const json = await respuesta.json();

        if (json.success) {
            Swal.fire({ title: "¡ÉXITO!", text: json.mensaje, icon: "success" });
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


//SELECT PARA PERFIL E HISTORIAL

boton.onclick=()=>{
    navCombo.style.display = "block"; 
};

navCombo.onchange = () => {
    const pantalla = navCombo.value;
    if (pantalla=="perfil") {
        window.location.href = "perfilC.html"; 
    }else if(pantalla=="historial"){
        window.location.href = "historial.html"; 
    }else if(pantalla=="catalogo"){
        window.location.href = "cliente.html"; 
    }
};


const cargarCatalogo = async () => {
    try {
        const response = await fetch('php/metodosC.php');
        const data = await response.json();
        const catalogo = document.getElementById('catalogo');
        catalogo.innerHTML = '';

        data.forEach(prenda => {
            const prendaHTML = `
            <div class="prenda">
                <img src="${prenda.fotoa || 'default.jpg'}" alt="${prenda.nombrea}" height="60px">
                <h2>${prenda.nombrea}</h2>
                <p>${prenda.descripcion}</p>
                <p>Precio: $${prenda.precio}</p>
                <div class="input-group mb-2">
                    <button class="btn btn-outline-secondary" type="button" onclick="restarCantidad(${prenda.id_a})">-</button>
                    <input type="number" id="cantidad-${prenda.id_a}" class="form-control text-center" value="1" min="1">
                    <button class="btn btn-outline-secondary" type="button" onclick="sumarCantidad(${prenda.id_a})">+</button>
                </div>
                <div class="botones">
                    <button class="boton" onclick="agregarCarrito(${prenda.id_a})">Agregar al Carrito</button>
                </div>
            </div>`;
            catalogo.innerHTML += prendaHTML;
        });
    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
    }
};

// CARRITO

function sumarCantidad(idProducto) {
    const inputCantidad = document.getElementById(`cantidad-${idProducto}`);
    let cantidad = parseInt(inputCantidad.value, 10);
    cantidad++;
    inputCantidad.value = cantidad;
}

function restarCantidad(idProducto) {
    const inputCantidad = document.getElementById(`cantidad-${idProducto}`);
    let cantidad = parseInt(inputCantidad.value, 10);
    if (cantidad > 1) {
        cantidad--;
        inputCantidad.value = cantidad;
    }
}

async function agregarCarrito(idAlbum) {
    const inputCantidad = document.getElementById(`cantidad-${idAlbum}`);
    const cantidad = inputCantidad.value;

    const formData = new FormData();
    formData.append('action', 'agregarC');
    formData.append('id_a', idAlbum);
    formData.append('usuario', sesion);
    formData.append('cantidad', cantidad);

    try {
        const respuesta = await fetch('php/carrito.php', {
            method: 'POST',
            body: formData
        });

        const json = await respuesta.json();

        if (json.success) {
            await obtenerCarrito(); // Actualiza el carrito
            Swal.fire({ title: '¡ÁLBUM AGREGADO!', text: 'El álbum fue agregado exitosamente', icon: 'success' });
        } else {
            Swal.fire({ title: 'Error', text: json.mensaje, icon: 'error' });
        }
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        Swal.fire({ title: 'Error', text: 'Hubo un problema al intentar agregar al carrito', icon: 'error' });
    }
}



async function obtenerCarrito() {
    const formData = new FormData();
    formData.append('action', 'listarC');
    formData.append('usuario', sesion);

    try {
        const respuesta = await fetch('php/carrito.php', {
            method: 'POST',
            body: formData
        });

        const json = await respuesta.json();

        if (json.success) {
            mostrarCarrito(json.carrito);
        } else {
            Swal.fire({ title: 'Error', text: json.mensaje, icon: 'error' });
        }
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
    }
}



function mostrarCarrito(carrito) {
    const tbody = document.getElementById('carrito-table-body');
    tbody.innerHTML = '';

    let total = 0;

    if (carrito.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">El carrito está vacío</td></tr>';
        document.getElementById('total-carrito-display').innerText = '$0';
        return;
    }

    carrito.forEach((producto, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${producto.nombrea}</td>
            <td>$${producto.precio}</td>
            <td>${producto.cantidad}</td>
            <td>
                <button class="btn btn-danger" onclick="eliminarDelCarrito(${producto.id_ca})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);

        total += producto.precio * producto.cantidad;
    });

    document.getElementById('total-carrito-display').innerText = `$${total.toFixed(2)}`;
}

// Función para eliminar un producto del carrito
async function eliminarDelCarrito(idCarrito) {
    const result = await Swal.fire({
        title: '¿Está seguro de eliminar este álbum?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No estoy seguro'
    });

    if (result.isConfirmed) {
        const formData = new FormData();
        formData.append('action', 'eliminarC');
        formData.append('id_ca', idCarrito);

        try {
            const respuesta = await fetch('php/carrito.php', {
                method: 'POST',
                body: formData
            });

            const json = await respuesta.json();

            if (json.success) {
                await obtenerCarrito(); // Actualiza el carrito
                Swal.fire({ title: 'Eliminado del carrito', text: json.mensaje, icon: 'success' });
            } else {
                Swal.fire({ title: 'Error', text: json.mensaje, icon: 'error' });
            }
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            Swal.fire({ title: 'Error', text: 'Hubo un problema al intentar eliminar del carrito', icon: 'error' });
        }
    }
}




// Confirmar compra
async function confirmarCompra() {
    const formData = new FormData();
    formData.append('action', 'confirmarCompra');
    formData.append('usuario', sesion);

    try {
        const respuesta = await fetch('php/carrito.php', {
            method: 'POST',
            body: formData
        });

        const json = await respuesta.json();

        if (json.success) {
            Swal.fire({ title: 'Compra Confirmada', text: json.mensaje, icon: 'success' }).then(() => {
                limpiarCarrito();
            });
        } else {
            Swal.fire({ title: 'Error', text: json.mensaje, icon: 'error' });
        }
    } catch (error) {
        console.error('Error al confirmar la compra:', error);
        Swal.fire({ title: 'Error', text: 'Hubo un problema al intentar confirmar la compra', icon: 'error' });
    }
}

function limpiarCarrito() {
    const carritoDiv = document.getElementById('carrito-table-body');
    carritoDiv.innerHTML = '';
    document.getElementById('total-carrito-display').innerText = '$0';
}




const mostrarHis = async () => {
    const datos = new FormData();
    datos.append("action", "selectHis");
    datos.append("usuario", sesion);

    try {
        const respuesta = await fetch("php/metodosA.php", { method: 'POST', body: datos });

        if (!respuesta.ok) {
            throw new Error(`Error en la red: ${respuesta.status}`);
        }

        const json = await respuesta.json();

        if (!json || !Array.isArray(json.data)) {
            throw new Error("Respuesta JSON no válida o sin datos");
        }

        let tablaHTML = `
            <table id="tablaH" class="table table-striped w-75 text-center">
                <thead>
                    <tr>
                        <th>ID ORDEN</th>
                        <th>NOMBRE DE ÁLBUM</th>
                        <th>FOTO</th>
                        <th>PRECIO UNITARIO</th>
                        <th>CANTIDAD</th>
                        <th>TOTAL</th>
                        <th>FECHA DE COMPRA</th>
                    </tr>
                </thead>
                <tbody id="listaHis">
        `;

        json.data.forEach(item => {
            tablaHTML += `
                <tr>
                    <td>${item[0]}</td>
                    <td>${item[1]}</td>
                    <td><img src="assets/${item[2]}" height="95px"></td>
                    <td>${item[3]}</td>
                    <td>${item[4]}</td>
                    <td>${item[5]}</td>
                    <td>${item[6]}</td>
                </tr>
            `;
        });

        tablaHTML += `</tbody></table>`;

        document.getElementById("action").innerHTML = tablaHTML;

        // Destruir tabla anterior si existe
        if ($.fn.DataTable.isDataTable("#tablaH")) {
            $("#tablaH").DataTable().destroy();
        }

        // Inicializar DataTable
        $("#tablaH").DataTable({
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
        alert("Hubo un problema al cargar los datos. Intenta de nuevo más tarde.");
    }
};
