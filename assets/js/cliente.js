var sesion = localStorage.getItem('usuario') || "null";

if (sesion === "null") {
    window.location.href = "index.html";
}

const cargarNombre = async () => {
    const datos = new FormData();
    datos.append("usuario", sesion);
    datos.append("action", "select");

    try {
        const respuesta = await fetch("php/loginUsuario.php", { method: 'POST', body: datos });
        const json = await respuesta.json();

        if (json.success) {
            document.getElementById("user").innerHTML = json.mensaje;
            document.getElementById("foto_perfil").src = "php/" + json.foto;
        } else {
            Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
        }
    } catch (error) {
        console.error('Error al cargar nombre:', error);
    }
}

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
}

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
                <div class="input-group mb-3">
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
}

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

let productosEnCarrito = [];

async function agregarCarrito(idProducto) {
    const cantidad = document.getElementById(`cantidad-${idProducto}`).value;
    const usuario = sesion;

    const formData = new FormData();
    formData.append('action', 'agregarC');
    formData.append('id_a', idProducto);
    formData.append('usuario', usuario);
    formData.append('cantidad', cantidad);

    try {
        const respuesta = await fetch('php/carrito.php', {
            method: 'POST',
            body: formData
        });

        const json = await respuesta.json();

        if (json.success) {
            Swal.fire({ title: '¡ÉXITO!', text: json.mensaje, icon: 'success' }).then(() => {
                obtenerCarrito();
            });
        } else {
            Swal.fire({ title: 'Error', text: json.mensaje, icon: 'error' });
        }
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        Swal.fire({ title: 'Error', text: 'Hubo un problema al intentar agregar al carrito', icon: 'error' });
    }
}


async function obtenerCarrito() {
    const usuario = localStorage.getItem('usuario');

    const formData = new FormData();
    formData.append('action', 'listarC');
    formData.append('usuario', usuario);

    try {
        const respuesta = await fetch('php/carrito.php', {
            method: 'POST',
            body: formData
        });

        if (!respuesta.ok) {
            throw new Error('Network response was not ok');
        }

        const json = await respuesta.json(); // Directly parse as JSON

        if (json.success) {
            productosEnCarrito = json.carrito;
            mostrarCarrito(productosEnCarrito);

            let totalCarrito = json.total;
            const totalCarritoDisplay = document.getElementById('total-carrito-display');
            if (totalCarritoDisplay) {
                totalCarritoDisplay.textContent = `$${totalCarrito.toFixed(2)}`;
            }
        } else {
            Swal.fire({ title: 'Error', text: json.mensaje, icon: 'error' });
        }
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        Swal.fire({ title: 'Error', text: 'Hubo un problema al intentar obtener el carrito', icon: 'error' });
    }
}




function mostrarCarrito(carrito) {
    const tbody = document.getElementById('carrito-table-body');
    tbody.innerHTML = '';

    carrito.forEach((producto, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${producto.nombrea}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>${producto.cantidad}</td>
            <td>
                <button class="btn btn-danger" onclick="eliminarDelCarrito(${producto.id_ca})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para eliminar un producto del carrito
async function eliminarDelCarrito(idCarrito) {
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
            Swal.fire({ title: 'Eliminado del carrito', text: json.mensaje, icon: 'success' }).then(() => {
                obtenerCarrito();
            });
        } else {
            Swal.fire({ title: 'Error', text: json.mensaje, icon: 'error' });
        }
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        Swal.fire({ title: 'Error', text: 'Hubo un problema al intentar eliminar del carrito', icon: 'error' });
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
    productosEnCarrito = [];
    const carritoDiv = document.getElementById('carrito-table-body');
    carritoDiv.innerHTML = '';
    const carritoDisplay = document.getElementById('total-carrito-display');
    carritoDisplay.innerHTML = '';
}

// Iniciar el proceso al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarNombre();
    cargarCatalogo();
    obtenerCarrito();
});
