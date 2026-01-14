const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// ==============================
// Verificar token
// ==============================
exports.verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "clave_secreta"
    );

    // 🔥 CLAVE: cargar usuario CON sucursal poblada
    const usuario = await Usuario.findById(decoded.id).populate("sucursal");

    if (!usuario) {
      return res.status(401).json({ error: "Usuario no válido" });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: "Usuario desactivado" });
    }

    req.usuario = usuario; // 👈 ahora sucursal viene completa
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// ==============================
// Solo admin
// ==============================
exports.soloAdmin = (req, res, next) => {
  if (req.usuario.role !== "admin") {
    return res.status(403).json({ error: "Acceso solo para admin" });
  }
  next();
};
