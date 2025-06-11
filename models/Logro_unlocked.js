const mongoose = require("mongoose");

// Modelo de Logro desbloqueado
const LogroUnlockedSchema = new mongoose.Schema({
    fecha_desbloqueo: {
        type: Date,
        default: Date.now
    },
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    id_logro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Logro",
        required: true
    }
});
const LogroUnlocked = mongoose.model("LogroUnlocked", LogroUnlockedSchema);

module.exports = LogroUnlocked;