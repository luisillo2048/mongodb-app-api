const express = require("express");
const mongoose = require("mongoose");
const Progreso = require('../models/Progreso');  // Modelo de Progreso

const router = express.Router();


// Obtener el progreso de un usuario específico
router.get("/progreso/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const progreso = await Progreso.find({ id_usuario })
      .sort({ fecha_progreso: -1 })
      .populate("id_tarea")    // Trae la info de la tarea
      .populate("id_usuario")  // Trae la info del usuario
      .populate("id_sesion");  // Trae la info de la sesión (si existe)

    // Si no se encuentra nada
    if (!progreso || progreso.length === 0) {
      return res.status(404).json({ error: "Progreso no encontrado para este usuario" });
    }

    // Respondemos con los registros
    res.json(progreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener el resumen del progreso (total de puntaje) de un usuario específico
router.get("/:id_usuario/resumen", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    // Verificar que id_usuario es válido
    if (!mongoose.Types.ObjectId.isValid(id_usuario)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }
    
    // Convertir el id_usuario a ObjectId usando 'new'
    const userObjectId = new mongoose.Types.ObjectId(id_usuario);

    // Agregamos para sumar todos los puntajes del usuario
    const resumen = await Progreso.aggregate([
      { $match: { id_usuario: userObjectId } },
      { $group: { _id: "$id_usuario", totalPuntaje: { $sum: "$puntaje" } } }
    ]);

    if (!resumen || resumen.length === 0) {
      return res.status(404).json({ error: "Progreso no encontrado para este usuario" });
    }
    
    // Respondemos con el total de puntaje
    res.json({ id_usuario, totalPuntaje: resumen[0].totalPuntaje });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
