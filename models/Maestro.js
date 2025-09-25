const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MaestroSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  cct: {
    type: String,
    required: false,
  },

  grado: {
    type: String,
    required: false,
    enum: ['1A°', '1B°', '1C°'],
  },

  role: {
    type: String,
    enum: ['maestro', 'admin'],
    default: 'maestro',
    required: true
  },

  codigo_ninos: {
    type: String,
    required: false
  },
  codigo_expira: {
    type: Date,
    required: false
  }

}); 

// Hash de la contraseña antes de guardar
MaestroSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Método para comparar contraseñas
MaestroSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Maestro', MaestroSchema);
