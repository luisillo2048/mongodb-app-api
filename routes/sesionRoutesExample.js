// const express = require("express");
// const Sesion = require("../models/Sesion");

// const router = express.Router();

// router.get("/test-sesion", async (req, res) => {
//     try {
//         const nuevaSesion = new Sesion({
//             userId: "6603f5b1e4a3d2b678c4e9a1", // Reemplaza con un ID válido de un usuario en tu base de datos
//             token: "test-token-123"
//         });

//         await nuevaSesion.save();
//         console.log("Sesión guardada manualmente:", nuevaSesion);
//         res.json({ message: "Sesión creada", sesion: nuevaSesion });
//     } catch (error) {
//         console.error("Error al guardar sesión:", error);
//         res.status(500).json({ error: "Error al guardar sesión" });
//     }
// });

// module.exports = router;
