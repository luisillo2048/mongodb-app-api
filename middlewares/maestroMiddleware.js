const Maestro = require("../models/Maestro");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware");

const maestroMiddleware = async (req, res, next) => {
  if (!req.user || req.role !== "maestro") {
    return res.status(403).json({ error: "Acceso denegado, solo para maestros" });
  }

  try {
    const maestro = await Maestro.findById(req.user._id).select("-password");
    if (!maestro) {
      return res.status(404).json({ error: "Maestro no encontrado" });
    }
    req.maestro = maestro;
    next();
  } catch (error) {
    res.status(500).json({ error: "Error en el middleware de maestro" });
  }
};

module.exports = maestroMiddleware;