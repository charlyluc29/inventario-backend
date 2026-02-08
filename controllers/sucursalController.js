const Sucursal = require("../models/Sucursal");

exports.crearSucursal = async (req, res) => {
  try {
    const nueva = new Sucursal(req.body);
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.obtenerSucursales = async (req, res) => {
  const data = await Sucursal.find();
  res.json(data);
};

exports.obtenerSucursal = async (req, res) => {
  const data = await Sucursal.findById(req.params.id);
  if (!data) return res.status(404).json({ error: "No encontrado" });
  res.json(data);
};

exports.actualizarSucursal = async (req, res) => {
  const data = await Sucursal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(data);
};

exports.eliminarSucursal = async (req, res) => {
  await Sucursal.findByIdAndDelete(req.params.id);
  res.json({ mensaje: "Sucursal eliminada" });
};
// ==============================
// Obtener sucursal de mantenimiento
// ==============================
exports.obtenerSucursalMantenimiento = async (req, res) => {
  try {
    const sucursal = await Sucursal.findOne({ tipo: "mantenimiento" });

    if (!sucursal) {
      return res
        .status(404)
        .json({ error: "Sucursal de mantenimiento no existe" });
    }

    res.json(sucursal);
  } catch (err) {
    console.error("Error obteniendo mantenimiento:", err);
    res.status(500).json({ error: err.message });
  }
};

