const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

   grado: {
    type: String,
    required: false,
    enum: ['1A°', '1B°', '1C°'],
  },

  // El alumno lo escribe para unirse al maestro
  codigo_maestro: {
    type: String,
    required: false 
  },

  // Se asocia cuando el código es válido
  maestro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maestro',
    required: false 
  }

});

const User = mongoose.model('User', userSchema);
module.exports = User;
