// routes/ia_routes.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

// Endpoint para predecir la dificultad (Flask)
// routes/ia_routes.js
router.post("/prediccion", async (req, res) => {
    try {
      const { puntaje, correcto, dificultad_actual } = req.body;
  
      if (
        puntaje === undefined ||
        correcto === undefined ||
        !["fácil", "media", "difícil"].includes(dificultad_actual)
      ) {
        return res.status(400).json({ error: "Faltan campos requeridos o dificultad inválida" });
      }
  
      if (!Number.isInteger(puntaje) || puntaje < 0) {
        return res.status(400).json({ error: "Puntaje inválido, debe ser entero >= 0" });
      }
      const response = await axios.post("http://localhost:3000/predecir", {
        puntaje,
        correcto,
        dificultad_actual
      });
  
      return res.json({
        dificultad_sugerida: response.data.dificultad_sugerida
      });
  
    } catch (err) {
      console.error("Error al predecir:", err.message);
      return res.status(500).json({ error: "Error al conectar con el modelo de IA" });
    }
  });
  

// Endpoint para enviar notificación usando FastAPI
router.post("/send-notification", async (req, res) => {
  const { input_data } = req.body;

  try {
    const response = await axios.post("http://127.0.0.1:8000/predict_and_notify", {
      input_data: input_data,
    });

    if (response.data.status === "success") {
      res.status(200).json({ message: "Notification sent successfully via FastAPI" });
    } else {
      res.status(400).json({ message: response.data.message });
    }
  } catch (error) {
    console.error("Error en la solicitud a FastAPI:", error);
    res.status(500).json({ message: "Error sending notification" });
  }
});

module.exports = router;
