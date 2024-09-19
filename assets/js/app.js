var sesion = localStorage.getItem('usuario') || "null";

  if (sesion != "null") {
    let tipoUsuario = localStorage.getItem('tipoUsuario') || "cliente";

    if (tipoUsuario === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'cliente.html';
    }
  }

  function validarCorreo(correo){
    var regex= /[\w-\.]{2,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/;
    return regex.test(correo.trim());
  }

  function validarPassword(password){
    var regex= /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/;
    return regex.test(password.trim());
  }




  const login= async() => {
    let usuario = document.getElementById('email').value;
    let password = document.getElementById("password").value;

    if (usuario.trim() == "" || password == "") {
        Swal.fire({ title: "ERROR", text: "TIENES CAMPOS VACÍOS", icon: "error" });
        return;
    }

    if (!validarCorreo(usuario)) {
        Swal.fire({ title: "ERROR", text: "CORREO NO VÁLIDO", icon: "error" });
        return;
    }

    if (!validarPassword(password)) {
        Swal.fire({ title: "ERROR", text: "CONTRASEÑA NO VÁLIDA", icon: "error" });
        return;
    }

    datos = new FormData();
    datos.append("usuario", usuario);
    datos.append("password", password);
    datos.append('action', 'login');

   
    let respuesta = await fetch("php/loginUsuario.php",{method:'POST',body:datos});
    let json = await respuesta.json();

    
    if (json.success == true) {
        localStorage.setItem("usuario", usuario);
        localStorage.setItem("tipoUsuario", json.tipo);

        if (json.tipo === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'cliente.html';
        }
    } else {
        Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
    }
};



  const Registrar = async() => {

    let usuario = document.getElementById("r_email").value;
    let password = document.getElementById("r_password").value;
    let nombre = document.getElementById("r_nombre").value;
    let tipo = document.getElementById("tipo").value;


    if (usuario.trim() == "" || password == "" || nombre == "") {
        Swal.fire({ title: "ERROR", text: "TIENES CAMPOS VACÍOS", icon: "error" });
        return;
    }

    if (!validarCorreo(usuario)) {
        Swal.fire({ title: "ERROR", text: "CORREO NO VÁLIDO", icon: "error" });
        return;
    }

    if (!validarPassword(password)) {
        Swal.fire({ title: "ERROR", text: "CONTRASEÑA NO VÁLIDA", icon: "error" });
        return;
    }

    datos = new FormData();
    datos.append("usuario", usuario);
    datos.append("password", password);
    datos.append("nombre", nombre);
    datos.append("tipo", tipo);
    datos.append('action', 'registrar');

    let respuesta = await fetch("php/loginUsuario.php",{method:'POST',body:datos});
    let json = await respuesta.json();

    if (json.success == true) {
        Swal.fire({ title: "¡REGISTRO EXITOSO!", text: json.mensaje, icon: "success" });
    } else {
        Swal.fire({ title: "ERROR", text: json.mensaje, icon: "error" });
    }
};

