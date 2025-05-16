const mysql = require('mysql2');
require('dotenv').config();

// Creamos un pool de conexiones
const pool = mysql.createPool({
    host: process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'admin',
    database: process.env.MYSQLDATABASE || 'red_social',
    waitForConnections: true,
    connectionLimit: 10,  // Puedes ajustar este número según lo que necesites
    queueLimit: 0
});

// Verificamos si la conexión funciona correctamente
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos MySQL');
        connection.release(); // liberamos la conexión para que vuelva al pool
    }
});

module.exports = pool;
