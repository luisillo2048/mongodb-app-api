const express = require("express");
const mongoose = require("mongoose");
const Progreso = require('../models/Progreso');  // Modelo de Progreso
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Obtener el progreso de un usuario específico
router.get("/progreso/:id_usuario", authMiddleware, async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id_usuario)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    const progreso = await Progreso.find({ id_usuario })
      .sort({ fecha_progreso: -1 })
      .populate("id_tarea")    
      .populate("id_usuario")  
      .populate("id_sesion");  

    if (!progreso || progreso.length === 0) {
      return res.status(404).json({ error: "Progreso no encontrado para este usuario" });
    }

    res.json(progreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener el resumen del progreso (total de puntaje) de un usuario específico
router.get("/:id_usuario/resumen", authMiddleware, async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id_usuario)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    const userObjectId = new mongoose.Types.ObjectId(id_usuario);

    const resumen = await Progreso.aggregate([
      { $match: { id_usuario: userObjectId } },
      { $group: { _id: "$id_usuario", totalPuntaje: { $sum: "$puntaje" } } }
    ]);

    if (!resumen || resumen.length === 0) {
      return res.status(404).json({ error: "Progreso no encontrado para este usuario" });
    }

    res.json({ id_usuario, totalPuntaje: resumen[0].totalPuntaje });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
