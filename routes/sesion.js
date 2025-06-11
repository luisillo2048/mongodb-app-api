const express = require("express");
const { login, logout } = require("../controllers/sesionController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Ruta para el inicio de sesión
// La ruta /login recibe el email y password, y genera un token JWT si las credenciales son correctas.
router.post("/login", login);

// Ruta para cerrar sesión
// La ruta /logout asegura que el usuario esté autenticado antes de cerrar sesión.
router.post("/logout", authMiddleware, logout);

module.exports = router;
