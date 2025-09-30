const mongoose = require("mongoose");

const TareaSchema = new mongoose.Schema({
    imagen: {
        type: String,
        required: false,
        match: [/^https?:\/\//, 'Debe ser una URL válida']
    },
    pregunta: {
        type: String,
        required: true,
        trim: true
    },
    opciones: {
        type: [String], 
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length >= 2; 
            },
            message: "Debe haber al menos dos opciones."
        }
    },
    respuestaCorrecta: {
        type: String,
        required: true,
        validate: {
            validator: function (respuesta) {
                return this.opciones.includes(respuesta);
            },
            message: "La respuesta correcta debe estar en las opciones."
        }
    },
    puntaje: {
        type: Number,
        required: true,
        min: 1 
    },
    bloque: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5, 6], 
    },
    dificultad: {
        type: String,
        enum: ["fácil", "media", "difícil"],
        default: "fácil"
    },
    logro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Logro",
        required: false
    }
}, { timestamps: true });

const Tarea = mongoose.model("Tarea", TareaSchema);

module.exports = Tarea;
