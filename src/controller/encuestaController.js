const connection = require('../conexion');

// Mostrar formulario de encuesta
function mostrarFormularioEncuesta(req, res) {
    if (!req.session.userId) return res.redirect('/login');
    res.render('crearEncuesta', { username: req.session.username });
}

// Guardar encuesta
function guardarEncuesta(req, res) {
    const usuario_id = req.session.userId;
    const contenido = req.body.contenido;
    const opciones = req.body.opciones?.filter(op => op.trim() !== '');

    if (!usuario_id || !contenido || opciones.length < 2 || opciones.length > 4) {
        return res.status(400).send("Debes incluir entre 2 y 4 opciones.");
    }

    const sqlPublicacion = `INSERT INTO publicaciones (usuario_id, contenido) VALUES (?, ?)`;
    connection.query(sqlPublicacion, [usuario_id, contenido], (err, resultPubli) => {
        if (err) return res.status(500).send("Error al guardar publicación");

        const publicacion_id = resultPubli.insertId;
        const sqlEncuesta = `INSERT INTO encuestas (publicacion_id) VALUES (?)`;

        connection.query(sqlEncuesta, [publicacion_id], (err, resultEncuesta) => {
            if (err) return res.status(500).send("Error al crear encuesta");

            const encuesta_id = resultEncuesta.insertId;
            const opcionesData = opciones.map(op => [encuesta_id, op]);

            const sqlOpciones = `INSERT INTO opciones_encuesta (encuesta_id, texto_opcion) VALUES ?`;
            connection.query(sqlOpciones, [opcionesData], (err) => {
                if (err) return res.status(500).send("Error al guardar opciones");
                res.redirect('/mis_publicaciones');
            });
        });
    });
}

// Votar
function votarEncuesta(req, res) {
    const usuario_id = req.session.userId;
    const opcion_id = req.body.opcion_id;

    if (!usuario_id || !opcion_id) {
        return res.json({ success: false, error: 'Faltan datos' });
    }

    const verificarSql = `
        SELECT oe.encuesta_id
        FROM opciones_encuesta oe
        JOIN encuestas e ON e.id = oe.encuesta_id
        WHERE oe.id = ?
    `;
    
    connection.query(verificarSql, [opcion_id], (err, rows) => {
        if (err || !rows.length) return res.json({ success: false, error: 'Opción no válida' });

        const encuesta_id = rows[0].encuesta_id;

        const yaVotoSql = `
            SELECT ve.id FROM votos_encuesta ve
            JOIN opciones_encuesta oe ON oe.id = ve.opcion_id
            WHERE oe.encuesta_id = ? AND ve.usuario_id = ?
        `;

        connection.query(yaVotoSql, [encuesta_id, usuario_id], (err, result) => {
            if (result.length > 0) {
                return res.json({ success: false, error: 'Ya votaste en esta encuesta' });
            }

            const insertVoto = `INSERT INTO votos_encuesta (opcion_id, usuario_id) VALUES (?, ?)`;
            const updateVoto = `UPDATE opciones_encuesta SET votos = votos + 1 WHERE id = ?`;

            connection.query(insertVoto, [opcion_id, usuario_id], (err) => {
                if (err) return res.json({ success: false, error: 'Error al votar' });

                connection.query(updateVoto, [opcion_id], (err) => {
                    if (err) return res.json({ success: false, error: 'Error al actualizar votos' });

                    res.json({ success: true });
                });
            });
        });
    });
}

module.exports = {
    mostrarFormularioEncuesta,
    guardarEncuesta,
    votarEncuesta
};
