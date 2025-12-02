const jwt = require("jsonwebtoken");
const Maestro = require("../models/Maestro");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "Sin token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    const admin = await Maestro.findById(decoded.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Acceso solo para admin" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token inválido" });
  }
};
