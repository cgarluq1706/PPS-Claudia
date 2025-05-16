const connection = require('../conexion');

const ver = (req, res) => {

    const usuarioId = req.params.id;
    const sessionUserId = req.session.userId;

    if (!sessionUserId) {
        return res.redirect('/login');
    }

    connection.query('SELECT nombre FROM usuarios WHERE id = ?', [usuarioId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en la base de datos');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        const nombreUsuario = results[0].nombre;

        const query = `
            SELECT * FROM mensajes 
            WHERE (emisor_id = ? AND receptor_id = ?) 
            OR (emisor_id = ? AND receptor_id = ?)
            ORDER BY fecha_envio ASC
        `;
        connection.query(query, [sessionUserId, usuarioId, usuarioId, sessionUserId], (error, messages) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error al cargar mensajes');
            }

            res.render('chat', { 
                usuarioId,
                nombreUsuario,
                messages,
                sessionUserId
            });
        });
    });
};

const escribir  = (req, res) => {
    
    const usuarioId = req.session.userId;
    const chatWithId = req.params.id;

    if (!usuarioId) {
        return res.status(401).send('Usuario no autenticado');
    }

    // Obtener el nombre del usuario actual y del usuario con quien se chatea
    const queryUsuario = `SELECT nombre FROM usuarios WHERE id = ?`;
    const queryMensajes = `
        SELECT * FROM mensajes 
        WHERE (emisor_id = ? AND receptor_id = ?)
        OR (emisor_id = ? AND receptor_id = ?)
        ORDER BY fecha_envio ASC
    `;

    connection.query(queryUsuario, [chatWithId], (error, results) => {
        if (error) {
            console.error('Error al obtener el nombre del usuario:', error);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        const nombreUsuario = results[0].nombre;

        connection.query(queryMensajes, [usuarioId, chatWithId, chatWithId, usuarioId], (err, messages) => {
            if (err) {
                console.error('Error al cargar mensajes:', err);
                return res.status(500).send('Error al cargar mensajes');
            }

            // Renderizar la vista de chat y pasar variables
            res.render('chat', {
                usuarioId: chatWithId,
                sessionUserId: usuarioId,
                nombreUsuario: nombreUsuario,
                messages: messages
            });
        });
    });
};

module.exports = {
    ver,
    escribir
};