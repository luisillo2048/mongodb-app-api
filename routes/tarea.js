const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Tarea = require('../models/Tarea');  
const Progreso = require('../models/Progreso');  
const authMiddleware = require('../middlewares/authMiddleware');
const LogroUnlocked = require('../models/Logro_unlocked');
const axios = require("axios");

// Obtener todas las tareas
router.get("/alltareas", async (req, res) => {
  try {
    const allTarea = await Tarea.find();
    res.json(allTarea);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener las tareas" });
  }
});

// Crear una nueva tarea
router.post("/add", async (req, res) => {
  try {
    const newTarea = new Tarea(req.body);
    await newTarea.save();
    res.status(201).json(newTarea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar tarea por ID
router.delete("/:id", async (req, res) => {
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "No se pudo eliminar la tarea" });
  }
});

// Responder a una tarea y guardar el progreso
router.post("/:id/responder", authMiddleware, async (req, res) => {
  try {
    const { respuesta, id_sesion } = req.body;
    const { id } = req.params;
    const id_usuario = req.user._id; // 🔹 Aquí estaba el error, ahora correcto

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de tarea no válido" });
    }

    const tarea = await Tarea.findById(id);
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });

    const esCorrecta = tarea.respuestaCorrecta === respuesta;
    const puntajeAsignado = esCorrecta ? tarea.puntaje : 0;

    const nuevoProgreso = new Progreso({
      id_usuario,
      id_tarea: id,
      id_sesion,
      puntaje: puntajeAsignado,
      correcto: esCorrecta,
      fecha_progreso: new Date()
    });

    await nuevoProgreso.save();

    let logroDesbloqueado = null;

    if (esCorrecta && tarea.logro) {
      const yaTieneLogro = await LogroUnlocked.findOne({
        id_usuario,
        id_logro: tarea.logro
      });

      if (!yaTieneLogro) {
        const nuevoLogro = new LogroUnlocked({
          id_usuario,
          id_logro: tarea.logro,
          fuente: "tarea"
        });

        await nuevoLogro.save();
        logroDesbloqueado = await nuevoLogro.populate("id_logro");
      }
    }

    console.log("📦 Enviando a IA:", {
      puntaje: puntajeAsignado,
      correcto: esCorrecta,
      dificultad_actual: tarea.dificultad
    });

    let dificultadSugerida = null;
    let siguienteTarea = null;

    try {
      const iaResponse = await axios.post("http://192.168.1.13:3000/predecir", {
        puntaje: puntajeAsignado,
        correcto: esCorrecta,
        dificultad_actual: tarea.dificultad
      }, {
        headers: { "Content-Type": "application/json" }
      });

      dificultadSugerida = iaResponse.data.dificultad_sugerida;

      const tareasRespondidas = await Progreso.find({ id_usuario }).distinct("id_tarea");

      siguienteTarea = await Tarea.findOne({
        _id: { $nin: tareasRespondidas },
        dificultad: dificultadSugerida,
        bloque: tarea.bloque
      });

    } catch (iaError) {
      console.error("Error IA o siguiente tarea:", iaError.message);
    }

    res.json({
      mensaje: esCorrecta ? "Respuesta correcta" : "Respuesta incorrecta",
      puntaje: puntajeAsignado,
      progreso: nuevoProgreso,
      logroDesbloqueado,
      siguiente_dificultad: dificultadSugerida,
      siguiente_tarea: siguienteTarea
    });

  } catch (error) {
    console.error("Error al responder tarea:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener tareas por bloque
router.get("/tareas/bloque/:bloque", async (req, res) => {
  const bloque = parseInt(req.params.bloque);
  if (isNaN(bloque)) return res.status(400).json({ error: "Bloque inválido. Debe ser un número." });

  try {
    const tareasPorBloque = await Tarea.find({ bloque });
    res.json(tareasPorBloque);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las tareas por bloque." });
  }
});

module.exports = router;
