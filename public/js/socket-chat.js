var socket = io();
let usuario_chat = $("#usuario-chat");
let div_usuarios = $("#lista-usuarios");
let div_mensajes = $("#messageArea");
let input_area = $("#messageInput");
let btn_send = $("#btnSend");

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
socket.on('msgAdmin', function(resp) {
    //console.log(resp);
    lista_usuarios(resp.todos);
});

// Escuchar Mensajes Publicos
socket.on('enviarMensaje', function(data) {
    var audio = new Audio("audio/new-ticket.mp3");
    audio.play();
    msg_publico(data.mensaje, data.fecha);
});

// Escuchar Mensaje Privado
socket.on('mensajePrivado', function(mensaje) {
    //console.log('Mensaje privado:', mensaje);
});

function lista_usuarios(usuarios) {
    div_usuarios.html('');
    usuarios.forEach(user => {
        if (user.nombre == usuario.nombre) {
            return;
        }
        let activo = (user.nombre == usuario.nombre) ? "text-primary" : "text-info";
        div_usuarios.append(`<li class="nav-item p-2">
            <a class="nav-link  ${activo}" href="#">
                <img src="/img/blockpc50x25.png" alt="">
                <span>${user.nombre}</span>
            </a>
        </li>`);
    });
}

btn_send.on("click", function() {
    let mensaje = input_area.val();
    let date = Date();
    socket.emit('enviarMensaje', { mensaje });
    div_mensajes.prepend(`<div class="d-flex alert alert-primary bottom" role="alert">
        <img src="/img/blockpc50x25.png" class="mr-2" alt="">
        <div class="d-flex flex-column">
            <div class="mb-2">${mensaje}</div>
            <small class="float-right">${date}</small>
        </div>
    </div>`);
    input_area.val('');
    div_mensajes.stop().animate({ scrollTop: div_mensajes[0].scrollHeight}, 1000);
});

function msg_publico(mensaje, time) {
    const date = !time ? new Date() : Date(time);
    div_mensajes.prepend(`<div class="d-flex justify-content-between alert alert-success bottom" role="alert">
        <div class="d-flex flex-column">
            <div class="mb-2">${mensaje}</div>
            <small class="float-right">${date}</small>
        </div>
        <img src="/img/blockpc50x25.png" class="mr-2" alt="">
    </div>`);
    setInterval(updateScroll,1000);
}

function updateScroll(){
    div_mensajes.scrollTop = div_mensajes.scrollHeight;
}