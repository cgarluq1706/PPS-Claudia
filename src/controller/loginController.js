const bcrypt = require('bcryptjs'); // Importamos bcrypt
const connection = require('../conexion');

const getIndex = (req, res) => {
    res.render('index',{ mensaje: '' });
};

const login = (req, res) => {
    const username = req.body.username;
    const password = req.body.contraseña;
    const query = 'SELECT * FROM usuarios WHERE BINARY username = ?';
   
    connection.query(query, [username], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const validPassword = bcrypt.compare(password, results[0].contraseña);
            if (validPassword) {
                req.session.loggedIn = true;
                req.session.username = username;
                req.session.userId = results[0].id;
                res.redirect('/dashboard');
            } else {
                res.render('index', { mensaje: 'Contraseña inválida' });
            }
        } else {
            res.render('index', { mensaje: 'Usuario no valido' });
        }
    });
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
};

const getDashboard = (req, res) => {
    if (req.session.loggedIn) {
        res.render('dashboard', { username: req.session.username });
    } else {
        res.render('error');
    }
};

const postRegister = async (req, res) => {
    const { name, apellido, username, password, fecha_nacimiento, phone } = req.body;

    const calcularEdad = (fechaNacimiento) => {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };
    //Calculamos edad
    const edad = calcularEdad(fecha_nacimiento);
    if (edad < 16 || edad > 99) {
        return res.status(400).render('registro', { 
            errorEdad: 'Debes tener entre 16 y 99 años.',
            datosPrevios: req.body
        });
    }
      
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery ='INSERT INTO usuarios (nombre, apellido, username, contraseña, fecha_nacimiento, telefono) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [name, apellido, username, hashedPassword, fecha_nacimiento, phone];

    connection.query(insertQuery, values, function(error, results, fields) {
        if (error) {
            console.error('Error al insertar usuario:', error);
            return;
        }
        res.render('index', { mensaje: 'Usuario registrado' });
    });
};

const postLogin = (req, res) => {
    const username = req.body.username;
    const password = req.body.contraseña;
    const query = 'SELECT * FROM usuarios WHERE BINARY username = ?';

    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.render('index', { mensaje: 'Error en el servidor' });
        }

        if (results.length > 0) {
            // Verificamos si el usuario está oculto
            if (results[0].oculto) {
                return res.render('index', { mensaje: 'Este usuario está baneado y no puede inicia sesión'});
            }
            bcrypt.compare(password, results[0].contraseña, (err, validPassword) => {
                if (err) {
                    console.error("Error al comparar la contraseña:", err);
                    return res.render('index', { mensaje: 'Error en el login' });
                }
                if (validPassword) {
                    req.session.loggedIn = true;
                    req.session.username = username;
                    req.session.userId = results[0].id;
                    req.session.role = results[0].role;
                    
                    // Redirigir según el rol de usuario
                    if (results[0].role === 'admin') {
                        return res.redirect('/admin'); // Redirige al panel de control
                    } else {
                        return res.redirect('/dashboard'); // Redirige al dashboard
                    }

                } else {
                    res.render('index', { mensaje: 'Contraseña inválida' });
                }
            });
        } else {
            res.render('index', { mensaje: 'Usuario no válido' });
        }
    });
};

const getRegistro = (req, res) => {
    const errorEdad = req.query.errorEdad || null; // Define errorEdad
    res.render('registro', { errorEdad });
};

const getComentarios = (req, res) => {
    res.render('comentarios', { username: req.session.username });
};

const getError = (req, res) => {
    res.render('error');
};

const getPerfil = (req, res) => {
    const username = req.session.username;
    const mensaje = req.query.mensaje;
    // Consulta SQL para obtener los datos del perfil del usuario
    const sql = 'SELECT * FROM usuarios WHERE BINARY username = ?';
    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error al obtener datos del perfil:', err);
            res.status(500).send('Error al obtener datos del perfil');
            return;
        }
        const usuario = results[0];

        // Comprobar si se encotraron resultados
        if (results.length > 0) {
            // Renderizar a plantilla 'perfil' con los datos del usuario

            const sqlseguidores = 'select count(*) from usuarios u inner join seguimiento s on s.seguidor_id = u.id where u.username = ?';
            connection.query(sqlseguidores, [username], (err, results) => {
                if (err) {
                    console.error('Error al obtener datos:', err);
                    res.status(500).send('Error al obtener datos');
                    return;
                }
                const seguidos = results[0]['count(*)'];

            const sqlseguidos = 'select count(*) from usuarios u inner join seguimiento s on s.seguido_id = u.id where u.username = ?';
            connection.query(sqlseguidos, [username], (err, results) => {
                if (err) {
                    console.error('Error al obtener datos:', err);
                    res.status(500).send('Error al obtener datos');
                    return;
                }
                const seguidores = results[0]['count(*)'];
                res.render('perfil', { username, usuario, seguidos, seguidores, mensaje});
            });
        });
    } else {
        res.status(404).send('Usuario no encontrado');
    }
});
};

const deleteAccount = (req, res) => {
    const { contraseña } = req.body;
    const userId = req.session.userId;
    
    console.log("Contraseña ingresada:", contraseña);
    console.log("ID de usuario en sesión:", userId);
    
    if (!userId) {
        return res.status(401).send('Usuario no autenticado (ID no encontrado en sesión)');
    }

    // Buscar el usuario por su ID para obtener la contraseña almacenada
    const query = 'SELECT * FROM usuarios WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Comparar la contraseña proporcionada con la almacenada en la base de datos
        bcrypt.compare(contraseña, results[0].contraseña, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar las contraseñas:', err);
                return res.status(500).send('Error en el servidor');
            }

            if (!isMatch) {
                return res.render('borrar', { mensaje: 'Contraseña incorrecta' });
            }

            // Si las contraseñas coinciden, marcar al usuario como oculto
            const updateQuery = 'UPDATE usuarios SET oculto = TRUE WHERE id = ?';
            connection.query(updateQuery, [userId], (err, results) => {
                if (err) {
                    console.error('Error al ocultar la cuenta:', err);
                    return res.status(500).send('Error al ocultar la cuenta');
                }

                // Destruir la sesión después de ocultar la cuenta
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error al destruir la sesión:', err);
                    }
                    res.redirect('/login'); // Redirigir al login después de ocultar la cuenta
                });
            });
        });
    });
};

module.exports = {
    getIndex,
    login,
    logout,
    getDashboard,
    postLogin,
    getRegistro,
    getComentarios,
    postRegister,
    getError,
    getPerfil,
    deleteAccount,
};