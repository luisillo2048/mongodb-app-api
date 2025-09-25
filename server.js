const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());

// Rutas existentes
const user = require("./routes/auth");
app.use("/api/auth", user);

const tarea = require("./routes/tarea");
app.use("/api/tarea", tarea);

const sesionRoutes = require("./routes/sesion");
app.use("/api/sesion", sesionRoutes);

const tareaRoutes = require("./routes/progreso");
app.use("/api/progreso", tareaRoutes);

const logroRoutes = require("./routes/logro");
app.use("/api/logro", logroRoutes);

const logrosUnlockedRoutes = require("./routes/logro_unlocked");
app.use("/logros-unlocked", logrosUnlockedRoutes);

const maestroRoutes = require("./routes/maestros");
app.use("/api/maestros", maestroRoutes);

// Endpoints de IA
const iaRoutes = require("./routes/ia_routes");
app.use("/api", iaRoutes);

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conexión a MongoDB exitosa"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// Puerto y Host del servidor
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; 

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
});
