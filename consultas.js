const { Pool } = require('pg')
require('dotenv').config();

const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD

const config = {
    user: DB_USER,
    host: "localhost",
    password: DB_PASSWORD,
    database: "skatepark",
    port: 5432,
};

const pool = new Pool(config);



const nuevoRegistro = async(email, nombre, password, anos_experiencia, especialidad, foto) => {
    const query = {
        text: `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ($1,$2,$3,$4,$5,$6,false) RETURNING *`,
        values: [email, nombre, password, anos_experiencia, especialidad, foto],
    }
    try {
        const respuesta = await pool.query(query);
        return respuesta.rows;
    } catch (error) {
        return error;
    }
}

const getRegistros = async() => {
    const query = {
        text: 'SELECT * from skaters order by id asc',
        name: 'nuevoRegistro',
    }
        try {
            const respuesta = await pool.query(query);
            return respuesta.rows;
        } catch (error) {
            return error;
        }
    };

const setStatus = async(id, auth) => {
    const query = {
        text: 'UPDATE skaters SET estado = $1 where id = $2 RETURNING *',
        values: [auth, id],
        name: 'setRegistro',
    }
    try {
        const respuesta = await pool.query(query);
        return respuesta.rows;
        } catch (error) {
            return error;
        }
    };

    const getUsuario = async(parametros) => {
        const query = {
            text: "select * from skaters where email = $1 and password = $2;",
            values: parametros,
            name: 'obtenerUsuario',
        };
        try {
            const respuesta = await pool.query(query);
            return respuesta.rows[0];
        } catch (error) {
            return error;
        }
    };
const actualizarUsuario = async(usuario) => {
    console.log(usuario);
    const query = {
        text: 'update skaters set nombre= $1, password= $2, anos_experiencia= $3, especialidad=$4 where email= $5 RETURNING *;',
        values: Object.values(usuario),
        name: 'actualizarUsuario',
    };
    try {
        const respuesta = await pool.query(query);
        console.log(respuesta.rows[0]);
        return respuesta.rows[0];
    } catch (error) {
        console.log(error);
        return error;
    }

};

const getUserMail = async(email) => {
    const query = {
        text: 'select * from skaters where email= $1;',
        values: [email],
        name: 'usuarioPorEmail'
    };
    try {
        const respuesta = await pool.query(query);
        return respuesta.rows[0];
    } catch (error) {

    }
};

const eliminarUsuario = async(email) => {
    const query = {
        text: 'DELETE FROM skaters WHERE email =$1 RETURNING *;',
        values: [email],
        name: 'deleteUser'
    };
    try {
        const respuesta = await pool.query(query);
        return respuesta.rows[0];
    } catch (error) {

    }
};



module.exports = { nuevoRegistro, getRegistros, setStatus, getUsuario, actualizarUsuario, getUserMail, eliminarUsuario };