const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");

// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findOne({ username })
      .populate("sucursal");

    if (!usuario) {
      return res.status(401).json({
        error: "Credenciales inválidas"
      });
    }

    // Usuario desactivado
    if (!usuario.activo) {
      return res.status(403).json({
        error: "Usuario desactivado"
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.verificarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        error: "Credenciales inválidas"
      });
    }

    // Crear token
    const token = jwt.sign(
      {
        id: usuario._id,
        role: usuario.role,
        sucursal: usuario.sucursal ? usuario.sucursal._id : null,
        codigoEmpleado: usuario.codigoEmpleado
      },
      process.env.JWT_SECRET || "clave_secreta",
      { expiresIn: "8h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
