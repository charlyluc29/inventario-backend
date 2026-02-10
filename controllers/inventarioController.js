const mongoose = require("mongoose")

const Inventario = require("../models/Inventario")
const Producto = require("../models/Producto")
const Movimiento = require("../models/Movimiento")
const Sucursal = require("../models/Sucursal")


// ==============================
// Inventario por sucursal
// ==============================
exports.obtenerInventarioPorSucursal = async (req, res) => {
  try {

    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "ID de sucursal inválido"
      })
    }

    let inventario = await Inventario.find({ sucursal: id })
      .populate("producto")
      .populate("sucursal")
      .lean()


    inventario = inventario.filter(i => i.producto && i.sucursal)


    res.json(inventario)

  } catch (err) {

    console.error("Inventario por sucursal:", err)

    res.status(500).json({
      error: "Error al obtener inventario"
    })
  }
}



// ==============================
// Inventario general
// ==============================
exports.obtenerInventarioGeneral = async (req, res) => {
  try {

    let inventario = await Inventario.find()
      .populate("producto")
      .populate("sucursal")
      .lean()


    inventario = inventario.filter(i => {

      if (!i.producto || !i.sucursal) return false

      // ocultar mantenimiento sin stock
      if (
        i.sucursal.tipo === "mantenimiento" &&
        i.cantidad === 0
      ) {
        return false
      }

      return true
    })


    res.json(inventario)

  } catch (err) {

    console.error("Inventario general:", err)

    res.status(500).json({
      error: "Error al obtener inventario"
    })
  }
}



// ==============================
// Eliminar inventario (SIN HISTORIAL)
// ==============================
exports.eliminarInventario = async (req, res) => {
  try {

    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "ID inválido"
      })
    }

    const inventario = await Inventario.findById(id)

    if (!inventario) {
      return res.status(404).json({
        error: "Registro no encontrado"
      })
    }


    // borrar movimientos relacionados
    await Movimiento.deleteMany({
      producto: inventario.producto,
      $or: [
        { sucursalOrigen: inventario.sucursal },
        { sucursalDestino: inventario.sucursal }
      ]
    })


    await Inventario.findByIdAndDelete(id)


    res.json({
      mensaje: "Inventario eliminado correctamente"
    })

  } catch (err) {

    console.error("Eliminar inventario:", err)

    res.status(500).json({
      error: "Error al eliminar inventario"
    })
  }
}



// ==============================
// Entrada (ADMIN)
// ==============================
exports.agregarInventario = async (req, res) => {
  try {

    const { sucursal, producto, cantidad } = req.body


    if (!mongoose.Types.ObjectId.isValid(sucursal))
      return res.status(400).json({ error: "Sucursal inválida" })

    if (!mongoose.Types.ObjectId.isValid(producto))
      return res.status(400).json({ error: "Producto inválido" })

    if (!cantidad || cantidad <= 0)
      return res.status(400).json({ error: "Cantidad inválida" })


    const sucursalDB = await Sucursal.findById(sucursal)

    if (!sucursalDB)
      return res.status(404).json({ error: "Sucursal no encontrada" })


    if (sucursalDB.tipo === "mantenimiento") {
      return res.status(403).json({
        error: "No se permiten entradas en mantenimiento"
      })
    }


    let registro = await Inventario.findOne({ sucursal, producto })


    if (registro) {

      registro.cantidad += Number(cantidad)
      await registro.save()

    } else {

      registro = await Inventario.create({
        sucursal,
        producto,
        cantidad
      })
    }


    await Movimiento.create({
      tipo: "entrada",
      producto,
      cantidad,
      sucursalDestino: sucursal,
      usuario: req.usuario?.id || null
    })


    res.json({
      mensaje: "Entrada registrada",
      registro
    })

  } catch (err) {

    console.error("Entrada inventario:", err)

    res.status(500).json({
      error: "Error en entrada"
    })
  }
}



// ==============================
// Salida (ADMIN)
// ==============================
exports.salidaInventario = async (req, res) => {
  try {

    const { sucursal, producto, cantidad } = req.body


    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        error: "Cantidad inválida"
      })
    }


    const registro = await Inventario.findOne({
      sucursal,
      producto
    })


    if (!registro || registro.cantidad < cantidad) {
      return res.status(400).json({
        error: "Inventario insuficiente"
      })
    }


    registro.cantidad -= Number(cantidad)
    await registro.save()


    await Movimiento.create({
      tipo: "salida",
      producto,
      cantidad,
      sucursalOrigen: sucursal,
      usuario: req.usuario?.id || null
    })


    res.json({
      mensaje: "Salida registrada",
      registro
    })

  } catch (err) {

    console.error("Salida inventario:", err)

    res.status(500).json({
      error: "Error en salida"
    })
  }
}



// ==============================
// Transferencia individual
// ==============================
exports.transferirProducto = async (req, res) => {
  try {

    const {
      producto,
      sucursalOrigen,
      sucursalDestino,
      cantidad
    } = req.body


    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        error: "Cantidad inválida"
      })
    }


    const destinoDB = await Sucursal.findById(sucursalDestino)

    if (!destinoDB) {
      return res.status(404).json({
        error: "Sucursal destino no existe"
      })
    }


    if (destinoDB.tipo === "mantenimiento") {
      return res.status(403).json({
        error: "No se permite transferir a mantenimiento"
      })
    }


    if (
      req.usuario?.role === "user" &&
      req.usuario?.sucursal?.toString() !== sucursalOrigen?.toString()
    ) {
      return res.status(403).json({
        error: "No autorizado"
      })
    }


    const origen = await Inventario.findOne({
      producto,
      sucursal: sucursalOrigen
    })


    if (!origen || origen.cantidad < cantidad) {
      return res.status(400).json({
        error: "Inventario insuficiente"
      })
    }


    origen.cantidad -= Number(cantidad)
    await origen.save()


    let destino = await Inventario.findOne({
      producto,
      sucursal: sucursalDestino
    })


    if (destino) {

      destino.cantidad += Number(cantidad)
      await destino.save()

    } else {

      destino = await Inventario.create({
        producto,
        sucursal: sucursalDestino,
        cantidad
      })
    }


    await Movimiento.create({
      tipo: "transferencia",
      producto,
      cantidad,
      sucursalOrigen,
      sucursalDestino,
      usuario: req.usuario?.id || null
    })


    res.json({
      mensaje: "Transferencia realizada",
      origen,
      destino
    })

  } catch (err) {

    console.error("Transferencia:", err)

    res.status(500).json({
      error: "Error en transferencia"
    })
  }
}



// ==============================
// Transferencia lote
// ==============================
exports.transferirProductosLote = async (req, res) => {
  try {

    const {
      items,
      sucursalOrigen,
      sucursalDestino
    } = req.body


    for (const item of items) {

      const { producto, cantidad } = item


      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
          error: "Cantidad inválida"
        })
      }


      const origen = await Inventario.findOne({
        producto,
        sucursal: sucursalOrigen
      })


      if (!origen || origen.cantidad < cantidad) {
        return res.status(400).json({
          error: "Inventario insuficiente"
        })
      }


      origen.cantidad -= Number(cantidad)
      await origen.save()


      let destino = await Inventario.findOne({
        producto,
        sucursal: sucursalDestino
      })


      if (destino) {

        destino.cantidad += Number(cantidad)
        await destino.save()

      } else {

        await Inventario.create({
          producto,
          sucursal: sucursalDestino,
          cantidad
        })
      }


      await Movimiento.create({
        tipo: "transferencia",
        producto,
        cantidad,
        sucursalOrigen,
        sucursalDestino,
        usuario: req.usuario?.id || null
      })
    }


    res.json({
      mensaje: "Transferencia por lote completada"
    })

  } catch (err) {

    console.error("Transferencia lote:", err)

    res.status(500).json({
      error: "Error en transferencia lote"
    })
  }
}



// ==============================
// Crear producto + inventario
// ==============================
exports.crearProductoConInventario = async (req, res) => {
  try {

    const {
      codigo,
      nombre,
      caracteristicas,
      modelo,
      estado,
      precio,
      sucursal,
      cantidad
    } = req.body


    if (
      !codigo ||
      !nombre ||
      !caracteristicas ||
      !modelo ||
      !estado ||
      precio == null ||
      !sucursal ||
      !cantidad
    ) {
      return res.status(400).json({
        error: "Faltan campos"
      })
    }


    const sucursalDB = await Sucursal.findById(sucursal)


    if (!sucursalDB) {
      return res.status(404).json({
        error: "Sucursal no encontrada"
      })
    }


    if (sucursalDB.tipo === "mantenimiento") {
      return res.status(403).json({
        error: "Sucursal en mantenimiento"
      })
    }


    const producto = await Producto.create({
      codigo,
      nombre,
      caracteristicas,
      modelo,
      estado,
      precio
    })


    const inventario = await Inventario.create({
      producto: producto._id,
      sucursal,
      cantidad
    })


    await Movimiento.create({
      tipo: "entrada",
      producto: producto._id,
      cantidad,
      sucursalDestino: sucursal,
      usuario: req.usuario?.id || null
    })


    res.status(201).json({
      mensaje: "Producto creado",
      producto,
      inventario
    })

  } catch (err) {

    console.error("Crear producto:", err)

    res.status(500).json({
      error: "Error al crear producto"
    })
  }
}



// ==============================
// Movimientos
// ==============================
exports.obtenerMovimientos = async (req, res) => {
  try {

    let movimientos = await Movimiento.find()
      .populate("producto")
      .populate("sucursalOrigen")
      .populate("sucursalDestino")
      .populate("usuario", "username")
      .populate("usuarioAcepta", "username")
      .lean()


    movimientos = movimientos.filter(m => m.producto)


    res.json(movimientos)

  } catch (err) {

    console.error("Movimientos:", err)

    res.status(500).json({
      error: "Error al obtener movimientos"
    })
  }
}
