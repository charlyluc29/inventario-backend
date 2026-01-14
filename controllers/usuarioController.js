const Usuario = require("../models/Usuario");
const Sucursal = require("../models/Sucursal");

// ==============================
// Generar código de empleado
// ==============================
const generarCodigoEmpleado = async () => {
  const totalUsuarios = await Usuario.countDocuments({ role: "user" });
  const numero = String(totalUsuarios + 1).padStart(4, "0");
  return `EMP-${numero}`;
};

// ==============================
// Crear usuario (SOLO USER)
// ==============================
exports.crearUsuario = async (req, res) => {
  try {
    const { username, password, sucursal } = req.body;

    if (!username || !password || !sucursal) {
      return res.status(400).json({
        error: "Username, password y sucursal son obligatorios"
      });
    }

    const sucursalExiste = await Sucursal.findById(sucursal);
    if (!sucursalExiste) {
      return res.status(400).json({ error: "Sucursal inválida" });
    }

    const codigoEmpleado = await generarCodigoEmpleado();

    const usuario = await Usuario.create({
      username,
      password,
      sucursal,
      codigoEmpleado,
      role: "user",   // 🔒 FORZADO
      activo: true
    });

    res.json({
      mensaje: "Usuario creado correctamente",
      usuario
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Listar usuarios
// ==============================
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .populate("sucursal")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Cambiar sucursal
// ==============================
exports.cambiarSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const { sucursal } = req.body;

    const sucursalExiste = await Sucursal.findById(sucursal);
    if (!sucursalExiste) {
      return res.status(400).json({ error: "Sucursal inválida" });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    usuario.sucursal = sucursal;
    await usuario.save();

    res.json({
      mensaje: "Sucursal actualizada correctamente",
      usuario
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Desactivar usuario
// ==============================
exports.desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    usuario.activo = false;
    await usuario.save();

    res.json({
      mensaje: "Usuario desactivado correctamente",
      usuario
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ==============================
// Actualizar usuario (editar)
// ==============================
exports.actualizarUsuario = async (req, res) => {
  try {
    const { username, password, sucursal } = req.body;

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Cambios permitidos
    if (username) usuario.username = username;
    if (sucursal) usuario.sucursal = sucursal;

    // Solo cambia password si viene algo
    if (password && password.trim() !== "") {
      usuario.password = password;
    }

    await usuario.save();

    res.json({
      mensaje: "Usuario actualizado correctamente",
      usuario
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Reactivar usuario (SOLO ADMIN)
// ==============================
exports.reactivarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    usuario.activo = true;
    await usuario.save();

    res.json({ mensaje: "Usuario reactivado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

