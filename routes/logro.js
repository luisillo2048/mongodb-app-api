const express = require("express");
const router = express.Router();
const Logro = require("../models/Logro");

// Obtener todos los logros
router.get("/allogros", async (req, res) => {
    try {
        const allLogros = await Logro.find();  // Cambié Logros a Logro
        res.json(allLogros);
    } catch (error) {
        res.status(500).json({ error: "No se pudieron obtener los datos de la tabla de los logros" });
    }
});

// Crear un nuevo logro
router.post("/newlogro", async (req, res) => {
    const { logro, descripcion, icon } = req.body;
    if (!logro || !descripcion || !icon) {
        return res.status(400).json({ error: "Todos los campos son necesarios: logro, descripcion, icon" });
    }

    try {
        const newLogro = new Logro(req.body);
        await newLogro.save();
        res.status(200).json({ message: "Logro creado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "No se pudo crear el nuevo logro, revisa el código" });
    }
});
// Crear múltiples logros
router.post("/newlogros", async (req, res) => {
    const logros = req.body;  // Suponemos que recibes un array de logros

    if (!Array.isArray(logros) || logros.length === 0) {
        return res.status(400).json({ error: "Debes enviar un array de logros" });
    }

    try {
        const newLogros = await Logro.insertMany(logros);  // insertMany para múltiples registros
        res.status(200).json({ message: "Logros creados con éxito", logros: newLogros });
    } catch (error) {
        console.error(error);  // Ver el error completo en consola
        res.status(500).json({ error: "No se pudieron crear los logros, revisa el código" });
    }
});

// Actualizar logro
router.put("/logro/:id", async (req, res) => {
    try {
        const { logro, descripcion, icon } = req.body;  // Asegúrate de que los tres campos puedan ser actualizados
        const updateLogro = await Logro.findByIdAndUpdate(
            req.params.id,
            { logro, descripcion, icon },  // Actualizo todos los campos
            { new: true }
        );

        if (!updateLogro) {
            return res.status(400).json({ error: "No se encontró el logro" });
        }

        res.status(200).json({ message: "Logro actualizado correctamente", logro: updateLogro });

    } catch (error) {
        res.status(500).json({ error: "No se pudo actualizar el logro" });
    }
});

// Eliminar logro
router.delete("/logros/:id", async (req, res) => {
    try {
        const deleteLogro = await Logro.findByIdAndDelete(req.params.id);

        if (!deleteLogro) {
            return res.status(404).json({ error: "No se encontró el ID" });
        }

        res.status(200).json({ message: "Se eliminó correctamente", logro: deleteLogro });

    } catch (error) {
        res.status(500).json({ error: "No se pudo eliminar el logro" });
    }
});

module.exports = router;
