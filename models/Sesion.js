const mongoose = require("mongoose");

const SesionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: "1d" } // Expira en 1 día
});

module.exports = mongoose.model("Sesion", SesionSchema);

