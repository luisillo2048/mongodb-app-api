const mongoose = require("mongoose");

// Modelo de Logro
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
        required: false // Puedes poner `false` si quieres que sea opcional
    }
});

const Logro = mongoose.model("Logro", LogroSchema);

module.exports = Logro;