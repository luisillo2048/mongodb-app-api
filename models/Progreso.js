const mongoose = require("mongoose");

const ProgresoSchema = new mongoose.Schema({
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  id_tarea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tarea", // Asegúrate de que coincida con el nombre de tu modelo de Tarea
    required: true
  },
  id_sesion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sesion",
    required: false // Si quieres que sea opcional, ponlo en false
  },
  puntaje: {
    type: Number,
    default: 0
  },
  correcto: {
    type: Boolean,
    default: false
  },
  fecha_progreso: {
    type: Date,
    default: Date.now // Para que se ponga la fecha actual automáticamente
  }
});

module.exports = mongoose.model("Progreso", ProgresoSchema);
