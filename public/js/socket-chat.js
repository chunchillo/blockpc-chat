var socket = io();

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
    socket.emit('entradaChat', usuario, function(usuarios) {
        console.log("Usuarios Conectados", usuarios);
    });
});

socket.on('disconnect', function() {
    console.log('Perdimos conexión con el servidor');
});

socket.on('msgAdmin', function(resp) {
    console.log(resp);
});

// Escuchar Mensajes Publicos
socket.on('enviarMensaje', function(mensaje) {
    console.log('Servidor:', mensaje);
});

// Escuchar Mensaje Privado
socket.on('mensajePrivado', function(mensaje) {
    console.log('Mensaje privado:', mensaje);
});
