const mongoose = require("mongoose");

const EstadoUsuarioSchema = new mongoose.Schema({
  id_usuario: 
  { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  dificultadActual: { type: String, enum: ["fácil","media","difícil"], default: "fácil" },
  aciertosConsecutivos: { type: Number, default: 0 },
  erroresConsecutivos: { type: Number, default: 0 }
});

module.exports = mongoose.model("EstadoUsuario", EstadoUsuarioSchema);
