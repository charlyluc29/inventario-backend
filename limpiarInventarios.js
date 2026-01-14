require("dotenv").config()
const mongoose = require("mongoose")
const Inventario = require("./models/Inventario")

async function limpiarInventarios() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB conectado ✅")

    // eliminar inventarios cuyo producto NO sea ObjectId
    const resultado = await Inventario.deleteMany({
      producto: { $type: "string" }
    })

    console.log("Inventarios corruptos eliminados:", resultado.deletedCount)
    process.exit()
  } catch (err) {
    console.error("Error:", err)
    process.exit(1)
  }
}

limpiarInventarios()
