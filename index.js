const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const axios = require('axios');
const jwt = require('jsonwebtoken');
const secretKey = 'holi';

const { nuevoRegistro, getRegistros, setStatus, getUsuario, actualizarUsuario, getUserMail, eliminarUsuario } = require('./consultas');


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
        const registros = await getRegistros();
        res.render("Index", { registros });
    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal ${error}`,
            code: 500
        });
    }

});

app.get("/login",   (req, res) => {
    res.render('Login');
});

app.get("/registro",   (req, res) => {
    res.render("Registro");
});

app.post("/usuarios", async(req, res) => {
    const { email, nombre, password, anos_experiencia, especialidad } = req.body;
    const { foto } = req.files;
    const name = foto.name;
    try {
        const usuario = await nuevoRegistro(email, nombre, password, anos_experiencia, especialidad, name);
        console.log(usuario);
        foto.mv(`${__dirname}/public/assets/img/${name}`, (err) => {
            if (err) res.status(500).send("Error al subir la imagen");
            res.status(201).redirect('/login');
        })
    } catch (error) {
        res.status(500).send({
            error: `Error al crear el usuario: ${error}`,
            code: 500
        })
    };
})



app.put("/status", async (req, res) => {
    const { id, auth } = req.body;
    try{
        const registro = await setStatus(id, auth);
        res.status(200).send(registro);
    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal ${error}`,
            code: 500
        });
    }
});

app.get("/admin",  async (req, res) => {
    try{
        const registros = await getRegistros();
        res.render("Admin", { registros });
    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal ${error}`,
            code: 500
        });
    }
});


app.post('/verify', async(req, res) => {
    const { email, password } = req.body;
    const usuario = await getUsuario([email, password]);
    if (usuario) {
        if (usuario.estado) {
            const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + 180,
                    data: { email },
                },
                secretKey
            );
            res.send(token);
        } else {
            res.status(401).send({
                error: 'El usuario en espera de ser validado por el Administrador',
                code: 401,
            });
        }

    } else {
        res.status(404).send({
            error: 'UPS !! El usuario no está registrado en la base de datos...',
            code: 404,
        });
    }
});

app.get('/datos', async(req, res) => {
    const { token } = req.query;
    let email = '';
    jwt.verify(token, secretKey, (error, data) => {
        email = data.data.email;
        if (error) {
            res.status(500).send({ error: 'token incorrecto' })
        }
    })
    const usuario = await getUserMail(email);
    res.render('Datos', { usuario });
});

app.put('/usuario', async(req, res) => {
    const usuario = req.body.payload;
    const actualizar = await actualizarUsuario(usuario);
    res.status(200).send('Datos actualizados con éxito !');
});

app.delete('/skaters/:email', async (req, res) => {
    const  { email }  = req.params;
    const eliminar = await eliminarUsuario(email);
    res.status(200).send(eliminar);
})