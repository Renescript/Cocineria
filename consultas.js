const { Pool } = require('pg')
require('dotenv').config();

const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD

const config = {
    user: DB_USER,
    host: "localhost",
    password: DB_PASSWORD,
    database: "cocina",
    port: 5432,
};

const pool = new Pool(config);

const nuevaComida = async(nombre, descripcion, precio, foto) => {
    const query = {
        text: `INSERT INTO comidas (nombre, descripcion, precio, foto) values ($1,$2,$3,$4) RETURNING *`,
        values: [nombre, descripcion, precio, foto],
    }
    try {
        const respuesta = await pool.query(query);
        return respuesta.rows;
    } catch (error) {
        return error;
    }
}

const getComidas= async() => {
    const query = {
        text: 'SELECT * from comidas order by id asc',
        name: 'nuevaComida',
    }
        try {
            const respuesta = await pool.query(query);
            return respuesta.rows;
        } catch (error) {
            return error;
        }
    };



const eliminarComida = async(id) => {
    const query = {
        text: 'DELETE FROM comidas WHERE id =$1 RETURNING *;',
        values: [id],
        name: 'deleteUser'
    };
    try {
        const respuesta = await pool.query(query);
        return respuesta.rows[0];
    } catch (error) {

    }
};



module.exports = { nuevaComida, getComidas, eliminarComida };