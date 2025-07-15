const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');

// Crear un nuevo maestro
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar si el email ya existe
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    const teacher = new Teacher({ email, password });
    await teacher.save();
    
    res.status(201).json({ message: 'Maestro creado exitosamente', teacher });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el maestro', error: error.message });
  }
});

// Obtener todos los maestros
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find({}, '-password'); // Excluir contraseñas
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los maestros', error: error.message });
  }
});

// Obtener un maestro por ID
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id, '-password');
    if (!teacher) {
      return res.status(404).json({ message: 'Maestro no encontrado' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el maestro', error: error.message });
  }
});

// Actualizar un maestro
router.put('/:id', async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { email, password },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Maestro no encontrado' });
    }
    
    res.json({ message: 'Maestro actualizado', teacher });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el maestro', error: error.message });
  }
});

// Eliminar un maestro
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Maestro no encontrado' });
    }
    res.json({ message: 'Maestro eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el maestro', error: error.message });
  }
});

module.exports = router;