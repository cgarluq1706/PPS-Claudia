const mysql = require('mysql');

// Cargar las variables del archivo .env
require('dotenv').config();

// Crear la conexión usando variables de entorno
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Conectar y mostrar mensaje
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL de Railway');
});

module.exports = connection;
