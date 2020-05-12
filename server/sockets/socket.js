const { io } = require('../server');
const { Usuarios } = require("../classes/index");
const { crearMensaje } = require("../utils/utils");

const usuarios = new Usuarios();

io.on('connection', (client) => {
    client.on('entradaChat', (data, callback) => {
        if ( !data.nombre || !data.sala ) {
            return callback({
                error: true,
                message: "EL nombre / sala son necesarios"
            });
        }
        client.join(data.sala);
        let todos = usuarios.agregar(client.id, data.nombre, data.sala);
        let usuariosEnSala = usuarios.todosEnSala(data.sala);
        callback(usuariosEnSala);
        client.broadcast.to(data.sala).emit('msgAdmin', {
            usuario: 'Administrador',
            mensaje: `EL usuario ${data.nombre} se ha conectado`,
            todos: usuariosEnSala
        });
    });
    client.on('disconnect', () => {
        let usuario = usuarios.borrarPorId(client.id);
        client.broadcast.to(usuario.sala).emit('msgAdmin', {
            usuario: 'Administrador',
            mensaje: `EL usuario ${usuario.nombre} se ha desconectado`,
            todos: usuarios.todosEnSala(usuario.sala)
        });
    });
    // Mensajes Publicos
    client.on('enviarMensaje', (data) => {
        let usuario = usuarios.buscarPorId(client.id);
        let mensaje = crearMensaje(usuario, data.mensaje);
        client.broadcast.to(usuario.sala).emit('enviarMensaje', mensaje);
    });
    // Escuchar Mensaje Privado
    client.on('mensajePrivado', (data) => {
        let usuario = usuarios.buscarPorId(client.id);
        let mensaje = crearMensaje(usuario, data.mensaje);
        client.broadcast.to(data.para).emit('mensajePrivado', mensaje);
    });
    // Escuchar solicitu de usuario
    client.on('obtenerUsuario', (data, callback) => {
        let usuario = usuarios.buscarPorId(data.id);
        callback(usuario);
    });
});
