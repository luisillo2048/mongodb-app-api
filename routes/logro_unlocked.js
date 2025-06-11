const express = require("express");
const router = express.Router();
const LogroUnlocked = require("../models/Logro_unlocked");
const Logro = require("../models/Logro");
const authMiddleware = require("../middlewares/authMiddleware");

// 🔒 Middleware para proteger los endpoints (requiere token)
router.use(authMiddleware);

/**
 * 🧾 Obtener todos los logros desbloqueados por el usuario autenticado
 */
router.get("/", async (req, res) => {
  try {
    const logros = await LogroUnlocked.find({ id_usuario: req.user.user.id }).populate("id_logro");
    res.json(logros);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener logros desbloqueados" });
  }
});

/**
 * 🔎 Obtener un logro desbloqueado específico
 */
router.get("/:id", async (req, res) => {
  try {
    const logro = await LogroUnlocked.findOne({
      _id: req.params.id,
      id_usuario: req.user.user.id
    }).populate("id_logro");

    if (!logro) {
      return res.status(404).json({ error: "Logro no encontrado" });
    }

    res.json(logro);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el logro desbloqueado" });
  }
});

/**
 * 🆕 Crear un logro desbloqueado manualmente (fuera de una tarea)
 */
router.post("/add", async (req, res) => {
  try {
    const { id_logro, fuente } = req.body;

    // Validar duplicado por usuario y logro
    const existe = await LogroUnlocked.findOne({
      id_usuario: req.user.user.id,
      id_logro
    });

    if (existe) {
      return res.status(409).json({ error: "El logro ya fue desbloqueado por este usuario." });
    }

    const nuevo = new LogroUnlocked({
      id_usuario: req.user.user.id,
      id_logro,
      fuente: fuente || "manual"
    });

    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: "No se pudo registrar el logro desbloqueado" });
  }
});

/**
 * 🗑️ Eliminar un logro desbloqueado (uso administrativo)
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await LogroUnlocked.findOneAndDelete({
      _id: req.params.id,
      id_usuario: req.user.user.id
    });

    if (!deleted) {
      return res.status(404).json({ error: "No se encontró el logro para eliminar" });
    }

    res.json({ message: "Logro eliminado correctamente", deleted });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el logro" });
  }
});

module.exports = router;
