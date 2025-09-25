const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Maestro = require("../models/Maestro");
const Sesion = require("../models/Sesion");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
  const { username, email, password, grado, codigo_maestro } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Usuario ya registrado" });

    let maestroId = null;
    if (codigo_maestro) {
      const maestro = await Maestro.findOne({
        codigo_ninos: codigo_maestro,
        codigo_expira: { $gt: new Date() },
      });
      if (!maestro) return res.status(400).json({ msg: "Código de maestro inválido o expirado" });
      maestroId = maestro._id;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      grado,
      codigo_maestro: codigo_maestro || undefined,
      maestro: maestroId,
    });

    await user.save();
    res.status(201).json({ msg: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Credenciales inválidas" });

    const payload = { id: user._id, role: "user" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    let session = await Sesion.findOne({ userId: user._id });
    if (session) {
      session.token = token;
      session.createdAt = new Date();
      await session.save();
    } else {
      await new Sesion({ userId: user._id, token }).save();
    }

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
});

// Obtener datos del usuario autenticado
router.get("/me", authMiddleware, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
