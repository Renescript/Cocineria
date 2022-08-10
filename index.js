const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const axios = require('axios');

const { nuevaComida, getComidas, eliminarComida } = require('./consultas');


const port = 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(expressFileUpload({
    limits: { fileSize: 5000000},
    abortOnLimit: true,
    responseOnLimit: 'Limite de archivo excedido'
}));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.set('view engine', 'handlebars');

app.engine(
    'handlebars',
    exphbs.engine({
        defaultLayout: 'Main',
        layoutsDir: `${__dirname}/views/layout`,
        partialsDir: `${__dirname}/views/components`,
    })
);

app.get("/", async (req, res) => {
    try{
        const platos = await getComidas();
        res.render("Index", { platos });
    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal ${error}`,
            code: 500
        });
    }
});
app.get("/admin", async (req, res) => {
    try{
        const platos = await getComidas();
        res.render("Admin", { platos });
    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal ${error}`,
            code: 500
        });
    }
});


app.post("/admin", async(req, res) => {
    const {nombre, descripcion, precio } = req.body;
    const { foto } = req.files;
    const name = foto.name;
    try {
        const usuario = await nuevaComida(nombre, descripcion, precio, name);
        foto.mv(`${__dirname}/public/assets/img/${name}`, (err) => {
            if (err) res.status(500).send("Error al subir la imagen");
            res.status(201).redirect('/admin');
        })
    } catch (error) {
        res.status(500).send({
            error: `Error al crear comida: ${error}`,
            code: 500
        })
    };
})


app.get("/admin",   (req, res) => {
    res.render("Admin");
});

app.get("/datos", async(req, res) => {
    try{
        const platos = await getComidas();
        res.render("Datos", { platos });
    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal ${error}`,
            code: 500
        });
    }
});


app.delete('/comida/:nombre', async (req, res) => {
    const  { nombre }  = req.nombre;
    const eliminar = await eliminarComida(nombre);
    res.status(200).send(eliminar);
})