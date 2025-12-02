const express = require("express");
const bcrypt = require("bcryptjs");
const Maestro = require("../models/Maestro");
const User = require("../models/User");
const Sesion = require("../models/Sesion");
const jwt = require("jsonwebtoken");
const authAdmin = require("../middlewares/adminMiddleware");

const router = express.Router();

/* ==============================
   ✅ REGISTRO ADMIN (TUYO)
================================ */
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (role !== "admin") {
    return res.status(400).json({ msg: "El rol debe ser admin" });
  }

  const correo = email.toLowerCase().trim();

  if (!correo.match(/admin(?=@)/)) {
    return res.status(400).json({
      msg: "El correo debe contener 'admin' antes del @ (Ej: juanadmin@gmail.com)"
    });
  }

  try {
    const existeUsername = await Maestro.findOne({ username });
    if (existeUsername) {
      return res.status(400).json({ msg: "El username ya está usado" });
    }

    const existeCorreo = await Maestro.findOne({ email: correo });
    if (existeCorreo) {
      return res.status(400).json({ msg: "El correo ya está registrado" });
    }

    const nuevoAdmin = new Maestro({
      username,
      email: correo,
      password,
      role: "admin"
    });

    await nuevoAdmin.save();

    res.status(201).json({
      msg: "Admin registrado correctamente",
      username: username
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
});

/* ==============================
   ✅ LOGIN ADMIN (TUYO)
================================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Maestro.findOne({
      email: email.toLowerCase().trim(),
      role: "admin",
    });

    if (!admin) return res.status(400).json({ msg: "Credenciales inválidas" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Credenciales inválidas" });

    const payload = { id: admin._id, role: "admin" };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "1d",
    });

    res.json({ token, role: "admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
});

/* ==============================
   ✅ PERFIL ADMIN /me (TUYO)
================================ */
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ msg: "No hay token, autorización denegada" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    
    const admin = await Maestro.findById(decoded.id).select("-password");
    
    if (!admin) {
      return res.status(404).json({ msg: "Admin no encontrado" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ msg: "No tienes permisos de administrador" });
    }

    res.json({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt
    });

  } catch (error) {
    console.error("Error en /me:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Token inválido" });
    }
    res.status(500).json({ msg: "Error en el servidor" });
  }
});

/* ==============================
   ✅ VER TODOS LOS USUARIOS
================================ */
router.get("/users", authAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("maestro", "username grado");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo usuarios" });
  }
});

/* ==============================
   ✅ VER TODOS LOS MAESTROS
================================ */
router.get("/maestros", authAdmin, async (req, res) => {
  try {
    const maestros = await Maestro.find().select("-password");
    res.json(maestros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo maestros" });
  }
});

/* ==============================
   ✅ VER USUARIOS POR MAESTRO
================================ */
router.get("/maestro/:id/users", authAdmin, async (req, res) => {
  try {
    const users = await User.find({ maestro: req.params.id })
      .select("-password");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo usuarios del maestro" });
  }
});

/* ==============================
   ✅ CAMBIAR CONTRASEÑA USUARIO
================================ */
router.put("/user/:id/password", authAdmin, async (req, res) => {
  try {
    const { password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(req.params.id, { password: hashed });

    res.json({ msg: "Contraseña de usuario actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error cambiando contraseña del usuario" });
  }
});

/* ==============================
   ✅ CAMBIAR CONTRASEÑA MAESTRO
================================ */
router.put("/maestro/:id/password", authAdmin, async (req, res) => {
  try {
    const { password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await Maestro.findByIdAndUpdate(req.params.id, { password: hashed });

    res.json({ msg: "Contraseña de maestro actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error cambiando contraseña del maestro" });
  }
});

/* ==============================
   ✅ VER SESIONES ACTIVAS
================================ */
router.get("/sesiones", authAdmin, async (req, res) => {
  try {
    const sesiones = await Sesion.find().populate("userId", "username email");
    res.json(sesiones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo sesiones" });
  }
});

module.exports = router;
