const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Suponiendo que tienes un modelo User
const Sesion = require('../models/Sesion'); // Suponiendo que usas un modelo de Sesión

// Función de inicio de sesión
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar al usuario por su correo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Verificar que la contraseña coincida
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Crear un token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // Usa tu clave secreta aquí
      { expiresIn: "1h" } // El token caduca después de 1 hora
    );

    // Guardar la sesión (si es necesario en tu modelo)
    await Sesion.create({ userId: user._id, token });

    // Enviar la respuesta con el token
    res.json({ token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

// Función para cerrar sesión
const logout = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({ error: "Token no encontrado" });
    }

    // Eliminar el token de la sesión (esto depende de cómo manejas las sesiones)
    await Sesion.deleteOne({ token });  // Esto eliminaría la sesión en la base de datos, si usas Sesion para almacenar el token

    // También puedes eliminar el token de un almacenamiento persistente si es necesario
    res.json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ error: "Error en el servidor al cerrar sesión" });
  }
};

module.exports = { login, logout };
