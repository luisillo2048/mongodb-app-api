const mongoose = require("mongoose");
const Tarea = require("./models/Tarea"); // Ajusta la ruta si está en otro lugar

mongoose.connect("mongodb://127.0.0.1:27017/prueba", { useNewUrlParser: true, useUnifiedTopology: true });

const tareas = [
  {
    pregunta: "¿Cuánto es 2 + 2?",
    opciones: ["3", "4", "5"],
    respuestaCorrecta: "4",
    puntaje: 10,
    bloque: 1,
    dificultad: "fácil"
  },
  {
    pregunta: "¿Qué planeta es el tercero desde el Sol?",
    opciones: ["Marte", "Tierra", "Venus"],
    respuestaCorrecta: "Tierra",
    puntaje: 10,
    bloque:1,
    dificultad: "media"
  },
  {
    pregunta: "¿Cuál es el resultado de (5 × 3) + (6 ÷ 2)?",
    opciones: ["15", "18", "21"],
    respuestaCorrecta: "18",
    puntaje: 10,
    bloque: 1,
    dificultad: "difícil"
  }
];

Tarea.insertMany(tareas)
  .then(() => {
    console.log("✅ Tareas insertadas correctamente");
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error("❌ Error al insertar tareas:", error);
  });
