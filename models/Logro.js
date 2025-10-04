// models/Logro.js
const mongoose = require("mongoose");

const LogroSchema = new mongoose.Schema({
    logro: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true,
        default: "⭐"
    },
    tipo: {
        type: String,
        enum: ["tareas_completadas", "puntaje", "bloque"],
        default: "tareas_completadas"
    },
    meta: {
        type: Number, // Para tareas_completadas será el número de tareas requeridas
        required: true
    },
    bloque: {
        type: Number, // Si el logro es específico de un bloque
        required: false
    }
});

const Logro = mongoose.model("Logro", LogroSchema);
module.exports = Logro;