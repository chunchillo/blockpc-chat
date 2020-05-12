var socket = io();
let usuario_chat = $("#usuario-chat");
let div_usuarios = $("#lista-usuarios");
let messageArea = $("#messageArea");
let messageInput = $("#messageInput");
let btnSend = $("#btnSend");
let estado = $("#estado");
let privado = $("#privado");

var params = new URLSearchParams( window.location.search );
if ( !params.has('nombre') || !params.has('sala') ) {
    window.location = "index.html";
    throw new Error("El nombre y la sala son necesarios");
}
let usuario = {
    nombre: params.get('nombre'),
    sala: params.get('sala')
}

socket.on('connect', function() {
    console.log('Conectado al servidor');
    usuario_chat.text(usuario.nombre);
    socket.emit('entradaChat', usuario, function(usuarios) {
        lista_usuarios(usuarios);
    });
});

socket.on('disconnect', function() {
    console.log('Perdimos conexión con el servidor');
});

// Escuchar mensaje administrador
socket.on('msgAdmin', function(data) {
    msg_admin(data.mensaje)
    lista_usuarios(data.todos);
});

// Escuchar Mensajes Publicos
socket.on('enviarMensaje', function(data) {
    var audio = new Audio("audio/new-ticket.mp3");
    audio.play();
    msg_publico(data);
});

// Escuchar Mensaje Privado
socket.on('mensajePrivado', function(data) {
    msg_privado(data);
});

function lista_usuarios(usuarios) {
    div_usuarios.html('');
    usuarios.forEach(user => {
        if (user.nombre == usuario.nombre) {
            return;
        }
        let activo = (user.nombre == usuario.nombre) ? "text-primary" : "text-info";
        div_usuarios.append(`<li class="nav-item p-2">
            <a class="nav-link p-0 ${activo}" href="#">
                <img src="/img/blockpc50x25.png" alt="">
                <span class="user_id" data-id="${user.id}">${user.nombre}</span>
            </a>
        </li>`);
    });
}

btnSend.on("click", function() {
    let mensaje = messageInput.val();
    if ( mensaje.trim().length === 0 ) {
        return;
    }
    let para = privado.val();
    let date = prettyDate(0);
    if ( para ) {
        socket.emit('mensajePrivado', { mensaje, para });
        estado.html('');
    } else {
        socket.emit('enviarMensaje', { mensaje });
        messageArea.prepend(`<div class="d-flex alert alert-primary p-2" role="alert">
            <div class="d-flex flex-column text-center pr-2">
                <img src="/img/blockpc50x25.png" class="img-fluid img" alt="">
                <span class="titulo_privado">${usuario.nombre}</span>
            </div>
            <div class="d-flex flex-column">
                <div class="mb-2">${mensaje}</div>
                <small class="float-right">${date}</small>
            </div>
        </div>`);
    }
    messageInput.val('').focus();
    privado.val('');
    messageArea.stop().animate({ scrollTop: messageArea[0].scrollHeight}, 1000);
});

function msg_publico(data) {
    const fecha = prettyDate(data.fecha);
    messageArea.prepend(`<div class="d-flex justify-content-between alert alert-success p-2" role="alert">
        <div class="d-flex flex-column">
            <div class="mb-2">${data.mensaje}</div>
            <small class="float-right">${fecha}</small>
        </div>
        <div class="d-flex flex-column text-center pl-2">
            <img src="/img/blockpc50x25.png" class="img-fluid img" alt="">
            <span class="titulo_privado user_id" data-id="${data.usuario.id}">${data.usuario.nombre}</span>
        </div>
    </div>`);
    messageArea.stop().animate({ scrollTop: messageArea[0].scrollHeight}, 1000);
}

function msg_privado(data) {
    const fecha = prettyDate(data.fecha);
    messageArea.prepend(`<div class="d-flex justify-content-between alert alert-warning p-2" role="alert">
        <div class="d-flex flex-column pr-2">
            <span class="titulo_privado user_id" data-id="${data.usuario.id}">Privado de ${data.usuario.nombre} <i class="fas fa-share ml-2" aria-hidden="true"></i></span>
            <div class="mb-2">${data.mensaje}</div>
            <small class="float-right">${fecha}</small>
        </div>
        <div class="d-flex flex-column text-center">
            <img src="/img/blockpc50x25.png" class="img-fluid img" alt="">
            <span class="titulo_privado user_id" data-id="${data.usuario.id}">${data.usuario.nombre}</span>
        </div>
    </div>`);
    messageArea.stop().animate({ scrollTop: messageArea[0].scrollHeight}, 1000);
}

function msg_admin(mensaje) {
    messageArea.prepend(`<div class="alert alert-info titulo_privado p-1" role="alert">
        <div class="d-flex justify-content-center">
            <span>${mensaje}</span>
        </div>
    </div>`);
}

$(document).on("click", ".user_id", function(e) {
    e.preventDefault();
    const id = $(this).data("id");
    socket.emit('obtenerUsuario', {id}, function(usuario) {
        privado.val(id);
        estado.html(`<div class="d-block color-info p-1 small" id="estado">Enviando mensaje a <b>${usuario.nombre}</b> <i class="fas fa-times text-danger float-right p-1"></i></div>`);
    });
    if ( $("#navbarSupportedContent").hasClass('show') ) {
        console.log('true')
        $("#navbarSupportedContent").collapse('hide');
    }
});

$(document).on("click", ".fa-times", function() {
    messageInput.val('');
    privado.val('');
    estado.html('');
});

// Execute a function when the user releases a key on the keyboard
messageInput.on("keyup", function(event) {
    if (event.keyCode === 13) {
      btnSend.click();
    }
});

// Hora y Minutos
function prettyDate(time){
    var date = !time ? new Date() : new Date(parseInt(time));
    return date.toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute:'2-digit'
    });
}