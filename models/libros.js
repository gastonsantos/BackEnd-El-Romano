const mongoose = require('mongoose');

const Libros = mongoose.model('libros', {
    nombre: {
        type: String,
        required: [true, "El nombre del videojuego es obligatorio."]
    },
    descripcion: {
        type: String
    },
    categoria: {
        type: String,
        required: [true, "La categoria del videojuego es obligatoria."]
    },
    clasificacion: {
        type: Number,
        required: [true, "La clasificacion del videojuego es obligatoria."]
    },
    precio: {
        type: Number,
        required: [true, "El precio del videojuego es obligatorio."]
    },
    imagen: {
        type: String,
        required: [true, "El precio del videojuego es obligatorio."]
    } 
});

module.exports =  {Libros} ;
