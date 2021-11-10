const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')

const container = require('./contend')

// static files
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json())
app.use(express.urlencoded({extended:false}))

// Server 
const http = require('http')
const server = http.createServer(app)
const port = process.env.PORT || 8080

// Socket
const { Server } = require('socket.io')
const io = new Server(server)

// setting
app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')

const productRoutes = require('./routes/productos')

// Middleware
app.use("/api", productRoutes)

// PROYECT-
const writeFileAsync = async (arr, nameFile) => {
    await fs.promises.writeFile(
      nameFile,
      JSON.stringify(arr, null, 2),
      "utf-8"
    );
  }; 
  
  const readFileAsync = async (nameFile) => {
    let file = await fs.promises.readFile(nameFile, "utf-8");
    return file;
  };
  
  const truncateAsync = async (nameFile) => {
    await fs.promises.truncate(
      nameFile, 0, function() {
  
      }
    )
  }
  // PROYECT-

let contenedor = new container.Contenedor("./src/productos.txt");
let contenedorMensajes = new container.Contenedor("./src/mensajes.txt")


// Routes
app.get('/', async (req, res) => {
  let productos = await contenedor.getAll() 
  let mensajes = await contenedorMensajes.getAll()
  // console.log(productos)
  res.render('index.html', {productos, mensajes})
})

app.post("/", async (req, res) => {
    req.body.price = Number(req.body.price)                                                                                                                                                                      
      await contenedor.save(req.body)  
      // console.log(req.body)
      console.log("Viva el señor")
      // res.redirect('/');
    //   res.render('index.html', {title: 'Formulario de Productos'})
  })

// Conexion Socket
io.on("connection", (socket) => {
    console.log("Client connected")

    // socket.emit("message_back", "Hi, I am the Backend")

    socket.on("dataProducto", async(data) => {
      let productos = await contenedor.getAll()
      productos.push(data)
      await contenedor.save(data)
      console.log(data)
      io.sockets.emit('message_back', productos)
    })

    socket.on("message_client", (data) => {
      console.log(data)
    })

    // Chat
    socket.on('dataMensaje', async(data) => {
      let mensajesAll = await contenedorMensajes.getAll()
      mensajesAll.push(data)
      await contenedorMensajes.save(data)
      io.sockets.emit('mensaje_enviado_guardado', mensajesAll)
    })
})

module.exports.contenedor = contenedor
module.exports.writeFileAsync = writeFileAsync
module.exports.readFileAsync = readFileAsync
module.exports.truncateAsync = truncateAsync

// listening the server
server.listen(port, () => {
    console.log("Server running on port", port)
})