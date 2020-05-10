class Usuarios {
    constructor() {
        this.usuarios = [];
    }
    agregar( id, nombre, sala ) {
        let usuario = this.buscarPorNombre(nombre);
        if ( !usuario ) {
            this.usuarios.push({id, nombre, sala});
        } else {
            usuario.id = id;
        }
        return this.usuarios;
    }
    buscarPorNombre( nombre ) {
        let usuario = this.usuarios.find(usuario => {
            return usuario.nombre === nombre
        })
        return usuario;
    }
    buscarPorId( id ) {
        let usuario = this.usuarios.find(usuario => {
            return usuario.id === id
        })
        return usuario;
    }
    borrarPorId( id ) {
        let usuarioBorrado = this.buscarPorId(id);
        this.usuarios = this.usuarios.filter(usuario => {
            return usuario.id != id
        })
        return usuarioBorrado;
    }
    todos() {
        return this.usuarios;
    }
    todosEnSala( sala ) {
        let usuariosEnSala = this.usuarios.filter(usuario => {
            return usuario.sala === sala
        });
        return usuariosEnSala;
    }
}

module.exports = Usuarios;