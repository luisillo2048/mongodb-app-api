// rutas/maestros.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Maestro = require("../models/Maestro");
const Sesion = require("../models/Sesion");
const User = require("../models/User");

// Middlewares
const authMiddleware = require("../middlewares/authMiddleware"); 
const maestroMiddleware = require("../middlewares/maestroMiddleware"); 

const router = express.Router();

/**
 * Registro de maestro
 */
router.post("/register", async (req, res) => {
  const { username, email, password, cct, grado, role } = req.body;
  try {
    let maestro = await Maestro.findOne({ email });
    if (maestro) return res.status(400).json({ msg: "Maestro ya registrado" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    maestro = new Maestro({ username, email, password: hashedPassword, cct, grado, role });
    await maestro.save();

    res.status(201).json({ msg: "Maestro registrado exitosamente", role: maestro.role });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
});

/**
 * Login de maestro
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const maestro = await Maestro.findOne({ email });
    if (!maestro) return res.status(400).json({ msg: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, maestro.password);
    if (!isMatch) return res.status(400).json({ msg: "Credenciales inválidas" });

    const payload = { id: maestro._id, role: "maestro" };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", { expiresIn: "1d" });

    let session = await Sesion.findOne({ userId: maestro._id });
    if (session) {
      session.token = token;
      session.createdAt = new Date();
      await session.save();
    } else {
      await new Sesion({ userId: maestro._id, token }).save();
    }

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
});

/**
 * Generar código para usuarios
 */
router.post("/generar-codigo", authMiddleware, maestroMiddleware, async (req, res) => {
  try {
    const maestroId = req.user.id;
    const nuevoCodigo = Math.floor(10000 + Math.random() * 90000).toString();
    const nuevaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const maestro = await Maestro.findByIdAndUpdate(
      maestroId,
      { codigo_ninos: nuevoCodigo, codigo_expira: nuevaExpiracion },
      { new: true }
    );

    res.json({
      msg: "Código generado correctamente",
      codigo_ninos: maestro.codigo_ninos,
      codigo_expira: maestro.codigo_expira,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo generar el código" });
  }
});

/**
 * Obtener todos los usuarios (estudiantes) de un maestro
 */
router.get("/:id/users", authMiddleware, async (req, res) => {
  try {
    const maestroId = req.params.id;

    const maestro = await Maestro.findById(maestroId);
    if (!maestro) return res.status(404).json({ error: "Maestro no encontrado" });

    const users = await User.find({ maestro: maestroId });
    res.json({ users }); 
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

/**
 * Obtener datos del maestro autenticado
 */
router.get("/me", authMiddleware, maestroMiddleware, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
