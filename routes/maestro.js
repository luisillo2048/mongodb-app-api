const express = require('express');
const router = express.Router();
const Maestro = require('../models/Maestro');

// Crear un nuevo maestro
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar si el email ya existe
    const existingMaestro = await Maestro.findOne({ email });
    if (existingMaestro) {
      return res.status(400).json({ message: 'El Maestro ya está registrado' });
    }
    
    const maestro = new Maestro({ email, password });
    await maestro.save();
    
    res.status(201).json({ message: 'Maestro creado exitosamente', teacher });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el maestro', error: error.message });
  }
});

// Obtener todos los maestros
router.get('/', async (req, res) => {
  try {
    const maestros = await Maestro.find({}, '-password'); // Excluir contraseñas
    res.json(maestros);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los maestros', error: error.message });
  }
});

// Obtener un maestro por ID
router.get('/:id', async (req, res) => {
  try {
    const maestro = await Maestro.findById(req.params.id, '-password');
    if (!maestro) {
      return res.status(404).json({ message: 'Maestro no encontrado' });
    }
    res.json(maestro);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el maestro', error: error.message });
  }
});

// Actualizar un maestro
router.put('/:id', async (req, res) => {
  try {
    const { email, password } = req.body;
    const maestro = await Maestro.findByIdAndUpdate(
      req.params.id,
      { email, password },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!maestro) {
      return res.status(404).json({ message: 'Maestro no encontrado' });
    }
    
    res.json({ message: 'Maestro actualizado', maestro});
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el maestro', error: error.message });
  }
});

// Eliminar un maestro
router.delete('/:id', async (req, res) => {
  try {
    const maestro = await Maestro.findByIdAndDelete(req.params.id);
    if (!maestro) {
      return res.status(404).json({ message: 'Maestro no encontrado' });
    }
    res.json({ message: 'Maestro eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el maestro', error: error.message });
  }
});

module.exports = router;