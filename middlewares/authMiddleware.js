const jwt = require("jsonwebtoken");
const Maestro = require("../models/Maestro");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado, token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let currentUser = null;

    if (decoded.role === "maestro") {
      currentUser = await Maestro.findById(decoded.id).select("-password");
    } else if (decoded.role === "user") {
      currentUser = await User.findById(decoded.id).select("-password");
    }

    if (!currentUser) {
      return res.status(404).json({ error: "Usuario/Maestro no encontrado" });
    }

    req.user = currentUser; 
    req.role = decoded.role; 

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
