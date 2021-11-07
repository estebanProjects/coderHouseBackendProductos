const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')

const container = require('./contend')

// static files
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json())
app.use(express.urlencoded({extended:false}))

// setting
const port = process.env.PORT || 8080
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


// Routes
app.get('/', (req, res) => {
    res.render('index.html', {title: 'Formulario de Productos'})
})

app.post("/", async (req, res) => {
    req.body.price = Number(req.body.price)                                                                                                                                                                      
      await contenedor.save(req.body)  
      console.log(req.body)
      res.redirect('/');
    //   res.render('index.html', {title: 'Formulario de Productos'})
  })

module.exports.contenedor = contenedor
module.exports.writeFileAsync = writeFileAsync
module.exports.readFileAsync = readFileAsync
module.exports.truncateAsync = truncateAsync

// listening the server
app.listen(port, () => {
    console.log("Server running on port", port)
})