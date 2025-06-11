const User = require("../models/User");
const Sesion = require('../models/Sesion');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Generar token de sesión
        const token = jwt.sign({ userId: newUser._id }, "secreto", { expiresIn: "1d" });

        // Crear sesión en la base de datos
        const newSession = new Sesion({
            userId: newUser._id,
            token,
        });

        await newSession.save();

        res.status(201).json({ message: "Usuario registrado con éxito", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

module.exports = { registerUser };
