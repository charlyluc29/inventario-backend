require("dotenv").config()
const mongoose = require("mongoose")

const Producto = require("./models/Producto")
const Inventario = require("./models/Inventario")
const Movimiento = require("./models/Movimiento")

async function reset() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB conectado ✅")

    const mov = await Movimiento.deleteMany({})
    console.log("Movimientos eliminados:", mov.deletedCount)

    const inv = await Inventario.deleteMany({})
    console.log("Inventarios eliminados:", inv.deletedCount)

    const prod = await Producto.deleteMany({})
    console.log("Productos eliminados:", prod.deletedCount)

    console.log("✅ RESET COMPLETO TERMINADO")
    process.exit()
  } catch (err) {
    console.error("❌ Error:", err)
    process.exit(1)
  }
}

reset()
