const mongoose = require('mongoose');

// 📌 Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/prueba', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Progreso = mongoose.model('Progreso', new mongoose.Schema({
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_tarea: { type: mongoose.Schema.Types.ObjectId, ref: 'Tarea', required: true },
  id_sesion: { type: mongoose.Schema.Types.ObjectId, ref: 'Sesion' },
  puntaje: { type: Number, default: 0 },
  correcto: { type: Boolean, default: false },
  fecha_progreso: { type: Date, default: Date.now }
}));

const Tarea = mongoose.model('Tarea', new mongoose.Schema({
  dificultad: String,
}));

// ⚙️ Configuraciones
const USUARIO_ID = "67f416f8ca2f63a3fa8f64c0"; // ID fijo para los progresos

async function generarProgresosFalsos() {
  try {
    const tareas = await Tarea.find({});
    if (tareas.length === 0) {
      console.log("❌ No hay tareas en la base de datos");
      return;
    }

    const progresos = [];

    for (let i = 0; i < 50; i++) {
      const tareaAleatoria = tareas[Math.floor(Math.random() * tareas.length)];
      const correcto = Math.random() < 0.5; // 50% chance de acertar
      const puntaje = correcto ? 10 : 0;

      progresos.push({
        id_usuario: USUARIO_ID,
        id_tarea: tareaAleatoria._id,
        puntaje,
        correcto,
        fecha_progreso: new Date()
      });
    }

    await Progreso.insertMany(progresos);
    console.log("✅ 50 progresos falsos insertados correctamente.");
  } catch (error) {
    console.error("❌ Error al generar progresos:", error);
  } finally {
    mongoose.disconnect();
  }
}

generarProgresosFalsos();
