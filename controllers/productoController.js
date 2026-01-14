const Producto = require("../models/Producto");

// Crear producto
exports.crearProducto = async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener todos
exports.obtenerProductos = async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
};

// ==============================
//   RUTAS BASADAS EN CÓDIGO
// ==============================

// Obtener por código
exports.obtenerPorCodigo = async (req, res) => {
  const producto = await Producto.findOne({ codigo: req.params.codigo });
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(producto);
};

// Actualizar por código
exports.actualizarPorCodigo = async (req, res) => {
  const producto = await Producto.findOneAndUpdate(
    { codigo: req.params.codigo },
    req.body,
    { new: true }
  );

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(producto);
};

// Eliminar por código
exports.eliminarPorCodigo = async (req, res) => {
  const eliminado = await Producto.findOneAndDelete({ codigo: req.params.codigo });

  if (!eliminado) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json({ mensaje: "Producto eliminado correctamente", eliminado });
};