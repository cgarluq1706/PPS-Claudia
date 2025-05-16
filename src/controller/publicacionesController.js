const connection = require('../conexion');
// ✅ Función para obtener opciones de encuesta (reutilizable)
const obtenerOpcionesEncuesta = (publicacion) => {
    return new Promise((resolve) => {
        const sqlEncuesta = `
            SELECT e.id AS encuesta_id, oe.id AS opcion_id, oe.texto_opcion, oe.votos
            FROM encuestas e
            JOIN opciones_encuesta oe ON oe.encuesta_id = e.id
            WHERE e.publicacion_id = ?
        `;
        connection.query(sqlEncuesta, [publicacion.publicacion_id], (err, opciones) => {
            if (!err && opciones.length > 0) {
                publicacion.es_encuesta = true;
                publicacion.opciones = opciones;
            }
            resolve();
        });
    });
};

const truncarContenido = (contenido, maxSaltos, maxCaracteres = 1200) => {
    // Si el contenido tiene más de maxCaracteres, truncamos
    if (contenido.length > maxCaracteres) {
        const contenidoTruncado = contenido.slice(0, maxCaracteres);
        return contenidoTruncado + 
               '<br><span class="ver-mas" style="display:none;">' + contenido.slice(maxCaracteres) + 
               '</span><p class="ver-mas-link" data-username="<%= publicacion.username %>" data-publicacion-id="<%= publicacion.publicacion_id %>">Ver más</p>';
    }

    // Truncar por el número de saltos de línea
    const partes = contenido.split('<br>');
    if (partes.length > maxSaltos) {
        return partes.slice(0, maxSaltos).join('<br>') + 
               '<br><span class="ver-mas" style="display:none;">' + partes.slice(maxSaltos).join('<br>') + 
               '</span><p class="ver-mas-link" data-username="<%= publicacion.username %>" data-publicacion-id="<%= publicacion.publicacion_id %>">Ver más</p>';
    }

    return contenido;
};


const getSusPublicaciones = async (req, res) => {
    const mi_usuario_id = req.session.userId;
    const username = req.params.username;

    if (!mi_usuario_id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Obtener el ID del usuario al que pertenece el perfil
    const getUserIdQuery = `SELECT id FROM usuarios WHERE username = ?`;

    connection.query(getUserIdQuery, [username], async (err, userResult) => {
        if (err || userResult.length === 0) {
            console.error('Error al obtener usuario por username', err);
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const usuario_id = userResult[0].id;

        const sql = `
        SELECT 
            p.id AS publicacion_id, 
            p.contenido, 
            p.num_like, 
            p.num_guardado,
            u.nombre, 
            u.username, 
            DATE_FORMAT(p.fecha_publicacion, '%d/%m/%Y %H:%i:%s') AS fecha_publi,
            (SELECT COUNT(*) FROM like_publicacion lp WHERE lp.id_publicacion = p.id AND lp.id_usuario = ?) AS dio_like,
            (SELECT COUNT(*) FROM guardar_publicacion gp WHERE gp.id_publicacion = p.id AND gp.id_usuario = ?) AS loguardo,
            (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS num_comentarios,
            img.id AS imagen_id,
            TO_BASE64(img.imagen) AS imagen_base64,
            TO_BASE64(u.foto_perfil) AS foto_perfil_base64
        FROM publicaciones p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN imagen_publicacion img ON img.publicacion_id = p.id
        WHERE p.usuario_id = ? 
        AND p.oculto = FALSE
        ORDER BY p.fecha_publicacion DESC, img.id;
        `;

        connection.query(sql, [mi_usuario_id, mi_usuario_id, usuario_id], async (err, results) => {
            if (err) {
                console.error('Error al obtener publicaciones', err);
                return res.status(500).json({ error: "Error al obtener publicaciones" });
            }

            const publicaciones = [];

            results.forEach((row) => {
                let pub = publicaciones.find(p => p.publicacion_id === row.publicacion_id);
                if (!pub) {
                    pub = {
                        publicacion_id: row.publicacion_id,
                        contenido: row.contenido,
                        num_like: row.num_like,
                        num_guardado: row.num_guardado,
                        nombre: row.nombre,
                        username: row.username,
                        fecha_publi: row.fecha_publi,
                        dio_like: row.dio_like,
                        loguardo: row.loguardo,
                        num_com: row.num_comentarios,
                        imagenes: [],
                        foto_perfil: row.foto_perfil_base64
                    };
                    publicaciones.push(pub);
                }

                pub.contenido = truncarContenido(row.contenido, 7);
                if (row.imagen_base64) {
                    pub.imagenes.push({
                        imagen_id: row.imagen_id,
                        imagen_base64: row.imagen_base64
                    });
                }
            });
            await Promise.all(publicaciones.map(pub => obtenerOpcionesEncuesta(pub)));
            res.render('publicaciones', { 
                username: req.session.username,
                userid: mi_usuario_id,
                publicaciones: publicaciones,
                tipo: 'sus_publicaciones',
                resultado: 1
            });
        });
    });
};



// Obtener publicaciones del usuario actual
const getMisPublicaciones = async (req, res) => {
    const usuario_id = req.session.userId;

    if (!usuario_id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const sql = `
    SELECT 
        p.id AS publicacion_id, 
        p.contenido, 
        p.num_like, 
        p.num_guardado,
        u.nombre, 
        u.username, 
        DATE_FORMAT(p.fecha_publicacion, '%d/%m/%Y %H:%i:%s') AS fecha_publi,
        (SELECT COUNT(*) FROM like_publicacion lp WHERE lp.id_publicacion = p.id AND lp.id_usuario = ?) AS dio_like,
        (SELECT COUNT(*) FROM guardar_publicacion gp WHERE gp.id_publicacion = p.id AND gp.id_usuario = ?) AS loguardo,
        (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS num_comentarios,
        img.id AS imagen_id,
        TO_BASE64(img.imagen) AS imagen_base64,  -- Convertimos el BLOB a Base64
        TO_BASE64(u.foto_perfil) AS foto_perfil_base64  -- Convertimos el BLOB de foto_perfil a Base64
    FROM publicaciones p
    INNER JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN imagen_publicacion img ON img.publicacion_id = p.id
    WHERE p.usuario_id = ? 
    AND p.oculto = FALSE
    ORDER BY p.fecha_publicacion DESC, img.id;
    `;

    connection.query(sql, [usuario_id, usuario_id, usuario_id], async (err, results) => {
        if (err) {
            console.error('Error al obtener publicaciones', err);
            return res.status(500).json({ error: "Error al obtener publicaciones" });
        }

        // Agrupar imágenes por publicación
        const publicaciones = [];

        results.forEach((row) => {
            let pub = publicaciones.find(p => p.publicacion_id === row.publicacion_id);
            if (!pub) {
                // Si no existe, agregar una nueva publicación
                pub = {
                    publicacion_id: row.publicacion_id,
                    contenido: row.contenido,
                    num_like: row.num_like,
                    num_guardado: row.num_guardado,
                    nombre: row.nombre,
                    username: row.username,
                    fecha_publi: row.fecha_publi,
                    dio_like: row.dio_like,
                    loguardo: row.loguardo,
                    num_com: row.num_comentarios,
                    imagenes: [],
                    foto_perfil: row.foto_perfil_base64  // Agregar foto de perfil en base64
                };
                publicaciones.push(pub);
            }

            pub.contenido = truncarContenido(row.contenido, 7); // 7 es el número de saltos de línea
            // Agregar la imagen a la lista de imágenes de la publicación
            if (row.imagen_base64) {
                pub.imagenes.push({
                    imagen_id: row.imagen_id,
                    imagen_base64: row.imagen_base64
                });
            }
        });
        await Promise.all(publicaciones.map(pub => obtenerOpcionesEncuesta(pub)));
        // Pasar las publicaciones agrupadas a la vista
        res.render('publicaciones', { 
            username: req.session.username, 
            userid: usuario_id, 
            publicaciones: publicaciones, 
            tipo: 'mis_publicaciones', 
            resultado: 1
        });
    });
};



// Obtener publicaciones con comentarios
const getpublicaciones = async (req, res) => {
    const username = req.session.username;
    const userid = req.session.userId;
    const tipo = req.query.tipo; // Recibe el parámetro tipo=guardados desde la URL

    let sql;
    let params = [userid, userid, username];

    if (tipo === "guardados") {
        sql = `
            SELECT u.id, u.nombre, u.foto_perfil, u.username, 
                   p.id AS publicacion_id, p.contenido, 
                   DATE_FORMAT(p.fecha_publicacion, '%d/%m/%Y %H:%i:%s') AS fecha_publi, p.num_like, p.num_guardado,
                   (SELECT COUNT(*) FROM like_publicacion lp 
                    WHERE lp.id_publicacion = p.id AND lp.id_usuario = ?) AS dio_like,
                   (SELECT COUNT(*) FROM guardar_publicacion gp 
                    WHERE gp.id_publicacion = p.id AND gp.id_usuario = ?) AS loguardo,
                    (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS num_comentarios,
                   img.id AS imagen_id, TO_BASE64(img.imagen) AS imagen_base64, 
                   TO_BASE64(u.foto_perfil) AS foto_perfil_base64  -- Convertir la foto de perfil a Base64
            FROM publicaciones p
            INNER JOIN guardar_publicacion gp ON p.id = gp.id_publicacion
            INNER JOIN usuarios u ON p.usuario_id = u.id
            LEFT JOIN imagen_publicacion img ON img.publicacion_id = p.id
            WHERE gp.id_usuario = ? AND p.oculto = FALSE
            ORDER BY p.fecha_publicacion DESC, img.id;
        `;
        params = [userid, userid, userid]; // Solo filtra por el usuario que guardó
    } else {
        // Consulta para obtener publicaciones de los usuarios seguidos
        sql = `
            SELECT u.id, u.nombre, u.foto_perfil, u.username, 
                   p.id AS publicacion_id, p.contenido, 
                   DATE_FORMAT(p.fecha_publicacion, '%d/%m/%Y %H:%i:%s') AS fecha_publi, p.num_like, p.num_guardado,
                   (SELECT COUNT(*) FROM like_publicacion lp 
                    WHERE lp.id_publicacion = p.id AND lp.id_usuario = ?) AS dio_like,
                   (SELECT COUNT(*) FROM guardar_publicacion gp 
                    WHERE gp.id_publicacion = p.id AND gp.id_usuario = ?) AS loguardo,
                 (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS num_comentarios,
                   img.id AS imagen_id, TO_BASE64(img.imagen) AS imagen_base64, 
                   TO_BASE64(u.foto_perfil) AS foto_perfil_base64  -- Convertir la foto de perfil a Base64
            FROM publicaciones p 
            INNER JOIN usuarios u ON p.usuario_id = u.id 
            INNER JOIN seguimiento s ON u.id = s.seguido_id 
            INNER JOIN usuarios u2 ON s.seguidor_id = u2.id 
            LEFT JOIN imagen_publicacion img ON img.publicacion_id = p.id
            WHERE u2.username = ? AND p.oculto = FALSE
            ORDER BY p.fecha_publicacion DESC, img.id;
        `;
        params = [userid, userid, req.session.username]; // Aquí filtra por el usuario logueado
    }

    connection.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error al obtener publicaciones" });
        }

        if (results.length === 0) {
            res.render('publicaciones', { tipo: 'publicaciones', username: req.session.username, resultado: 0 });
        } else {
            // Agrupar publicaciones por publicación_id
            const publicaciones = [];

            results.forEach((row) => {
                let pub = publicaciones.find(p => p.publicacion_id === row.publicacion_id);
                if (!pub) {
                    // Si no existe, crear una nueva publicación
                    pub = {
                        publicacion_id: row.publicacion_id,
                        contenido: row.contenido,
                        num_like: row.num_like,
                        num_guardado: row.num_guardado,
                        nombre: row.nombre,
                        foto_perfil: row.foto_perfil_base64, // Usamos Base64 para la foto de perfil
                        username: row.username,
                        fecha_publi: row.fecha_publi,
                        dio_like: row.dio_like,
                        num_com: row.num_comentarios,
                        loguardo: row.loguardo,
                        imagenes: []
                    };
                    publicaciones.push(pub);
                }
                pub.contenido = truncarContenido(row.contenido, 7); // 7 es el número de saltos de línea
                // Agregar la imagen a la lista de imágenes de la publicación
                if (row.imagen_base64) {
                    pub.imagenes.push({
                        imagen_id: row.imagen_id,
                        imagen_base64: row.imagen_base64
                    });
                }
            });

            // Ahora obtener los comentarios de cada publicación
            const publicacionesConComentarios = [];
            let comentariosProcessed = 0;

            publicaciones.forEach((publicacion) => {
                const sqlComentarios = `
                    SELECT c.id, c.contenido, 
                           DATE_FORMAT(c.fecha_comentario, '%Y-%m-%d %H:%i:%s') AS fecha_comentario, 
                           u.nombre 
                    FROM comentarios c
                    INNER JOIN usuarios u ON c.usuario_id = u.id
                    WHERE c.publicacion_id = ?
                `;

                connection.query(sqlComentarios, [publicacion.publicacion_id], async (err, comentarios) => {
                    if (err) {
                        console.error('Error al obtener comentarios', err);
                        return res.status(500).send('Error al obtener comentarios');
                    }

                    publicacion.comentarios = comentarios;
                    comentariosProcessed++;

                    // Cuando se hayan procesado todos los comentarios
                    if (comentariosProcessed === publicaciones.length) {
                        await Promise.all(publicaciones.map(pub => obtenerOpcionesEncuesta(pub)));
                        res.render('publicaciones', { 
                            tipo: 'publicaciones', 
                            username: req.session.username, 
                            userid, 
                            publicaciones: publicaciones, 
                            resultado: 1 
                        });
                    }
                });
            });
        }
    });
};


// Obtener comentarios de una publicación
const getComentarios = (req, res) => {
    const { publicacion_id } = req.params;


    const sql = `SELECT c.id, c.contenido, c.fecha_comentario, u.nombre
                 FROM comentarios c
                 INNER JOIN usuarios u ON c.usuario_id = u.id
                 WHERE c.publicacion_id = ?
                 ORDER BY c.fecha_comentario ASC`;


    connection.query(sql, [publicacion_id], (err, results) => {
        if (err) {
            console.error('Error al obtener comentarios', err);
            res.status(500).send('Error al obtener comentarios');
            return;
        }
        res.json(results); // Devolvemos los comentarios como JSON
    });
};

const sanitizeHtml = require('sanitize-html');

// Definir las etiquetas permitidas
const allowedTags = ['b', 'i', 'u', 'em', 'strong', 'br', 'p']; // Por ejemplo, solo permitimos estas etiquetas

const agregarComentario = (req, res) => {
    const { publicacion_id, contenido } = req.body;
    const usuario_id = req.session.userId; // Tomar el ID del usuario desde la sesión

    if (!usuario_id) {
        return res.json({ error: "Usuario no autenticado" });
    }

    if (!publicacion_id || !contenido) {
        return res.json({ error: "Faltan datos en la solicitud" });
    }

    // Sanitizar el contenido del comentario
    const contenidoSaneado = sanitizeHtml(contenido, {
        allowedTags: allowedTags, // Solo permitir las etiquetas que definimos
        allowedAttributes: {} // No permitir atributos peligrosos
    });

    // Reemplazar saltos de línea con <br> para que se muestren correctamente
    const contenidoConSaltosDeLinea = contenidoSaneado.replace(/\n/g, '<br>');

    // Insertar el comentario en la base de datos
    const sql = `INSERT INTO comentarios (publicacion_id, usuario_id, contenido) VALUES (?, ?, ?)`;
    connection.query(sql, [publicacion_id, usuario_id, contenidoConSaltosDeLinea], (err, result) => {
        if (err) {
            console.error('Error al insertar comentario', err);
            return res.json({ error: "Error al insertar comentario" });
        }

        // Recuperar el comentario recién insertado con la foto de perfil del usuario en base64
        const sqlComentarios = `
        SELECT c.id, c.contenido,
               DATE_FORMAT(c.fecha_comentario, '%Y-%m-%d %H:%i:%s') AS fecha_comentario,
               u.nombre, TO_BASE64(u.foto_perfil) AS foto_perfil_base64
        FROM comentarios c
        INNER JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = ?`;

        connection.query(sqlComentarios, [result.insertId], (err, comentario) => {
            if (err) {
                console.error('Error al obtener el comentario insertado', err);
                return res.json({ error: "Error al obtener el comentario insertado" });
            }

            // Devolver el comentario con la foto de perfil del usuario
            if (!comentario.length) {
                return res.json({ error: "No se pudo recuperar el comentario" });
            }

            // Devolver el comentario con el contenido ya formateado y la foto de perfil en base64
            res.json({
                id: comentario[0].id,
                contenido: comentario[0].contenido,
                fecha_comentario: comentario[0].fecha_comentario,
                nombre: comentario[0].nombre,
                foto_perfil: comentario[0].foto_perfil_base64 // Foto de perfil en base64
            });
        });
    });
};




const crearPublicacion = (req, res) => {
    const usuario_id = req.session.userId;
    const contenido = req.body.contenido;
    const imagenes = req.files?.imagenes; // Capturamos archivos enviados en multipart/form-data

    if (!usuario_id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!contenido) {
        return res.status(400).json({ error: "Contenido de la publicación es requerido" });
    }

    // Sanitizar el contenido antes de guardarlo en la base de datos
    const contenidoSaneado = sanitizeHtml(contenido, {
        allowedTags: allowedTags, // Solo permitimos las etiquetas que definimos
        allowedAttributes: {} // No permitir atributos peligrosos
    });

    // Reemplazar saltos de línea por <br>
    const contenidoConSaltosDeLinea = contenidoSaneado.replace(/\n/g, '<br>');

    // 1️⃣ Insertamos la publicación y obtenemos su ID
    const sqlPublicacion = `INSERT INTO publicaciones (usuario_id, contenido) VALUES (?, ?)`;
    connection.query(sqlPublicacion, [usuario_id, contenidoConSaltosDeLinea], (err, result) => {
        if (err) {
            console.error("Error al crear publicación", err);
            return res.status(500).json({ error: "Error al crear publicación" });
        }

        const publicacion_id = result.insertId;

        if (imagenes) {
            const imagenArray = Array.isArray(imagenes) ? imagenes : [imagenes]; // Convierte a array si es una sola imagen
            const valoresImagenes = imagenArray.map(img => [publicacion_id, img.data]); // Guardamos Buffer directamente

            const sqlImagenes = `INSERT INTO imagen_publicacion (publicacion_id, imagen) VALUES ?`;
            connection.query(sqlImagenes, [valoresImagenes], (err) => {
                if (err) {
                    console.error("Error al guardar imágenes", err);
                    return res.status(500).json({ error: "Error al guardar imágenes" });
                }
                res.status(201).json({ message: "Publicación creada con imágenes correctamente" });
            });
        } else {
            res.status(201).json({ message: "Publicación creada correctamente sin imágenes" });
        }
    });
};




// Eliminar publicaciones
const eliminarPublicacion = (req, res) => {
    const { id } = req.params;
    const usuario_id = req.session.userId;

    if (!usuario_id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Verificar que la publicación pertenece al usuario autenticado
    const sqlVerificar = `SELECT * FROM publicaciones WHERE id = ? AND usuario_id = ?`;
    connection.query(sqlVerificar, [id, usuario_id], (err, results) => {
        if (err) {
            console.error('Error al verificar publicación', err);
            return res.status(500).json({ error: "Error al verificar publicación" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Publicación no encontrada o no pertenece al usuario" });
        }

        // Ocultar la publicación
        const sqlOcultar = `UPDATE publicaciones SET oculto = TRUE WHERE id = ? AND usuario_id = ?`;
        connection.query(sqlOcultar, [id, usuario_id], (err, result) => {
            if (err) {
                console.error('Error al ocultar publicación', err);
                return res.status(500).json({ error: "Error al ocultar publicación" });
            }
            res.status(200).json({ message: "Publicación ocultada correctamente" });
        });
    });
};

const verpublicacion = async (req, res) => {
const { username, id } = req.params;
const userid = req.session.userId;

const query = `
    SELECT u.id, u.username, u.nombre, 
           TO_BASE64(u.foto_perfil) AS foto_perfil_base64,   -- Foto de perfil en Base64
           p.id AS publicacion_id, p.contenido, p.num_like, p.num_guardado, 
           DATE_FORMAT(p.fecha_publicacion, '%d/%m/%Y %H:%i:%s') AS fecha_publi,
           (SELECT COUNT(*) FROM like_publicacion lp 
            WHERE lp.id_publicacion = p.id AND lp.id_usuario = ?) AS dio_like,
           (SELECT COUNT(*) FROM guardar_publicacion gp 
            WHERE gp.id_publicacion = p.id AND gp.id_usuario = ?) AS loguardo,
            (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS num_comentarios,
           img.id AS imagen_id, TO_BASE64(img.imagen) AS imagen_base64
    FROM publicaciones p
    INNER JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN imagen_publicacion img ON img.publicacion_id = p.id
    WHERE u.username = ? AND p.id = ?;
`;

connection.query(query, [userid, userid, username, id], async (err, results) => {
    if (err) {
        console.error(err);
        return res.status(500).send("Error al obtener la publicación");
    }

    if (results.length === 0) {
        return res.status(404).send("Publicación no encontrada");
    }

    const publicacion = {
        publicacion_id: results[0].publicacion_id,
        contenido: results[0].contenido,
        nombre: results[0].nombre,
        username: results[0].username,
        foto_perfil: results[0].foto_perfil_base64,  // Usar la foto en Base64 de la publicación
        num_like: results[0].num_like,
        num_guardado: results[0].num_guardado,
        fecha_publi: results[0].fecha_publi,
        loguardo: results[0].loguardo,
        dio_like: results[0].dio_like,
        num_com: results[0].num_comentarios,
        imagenes: [],
        comentarios: [] // inicializar comentarios
    };

    results.forEach(row => {
        if (row.imagen_base64) {
            publicacion.imagenes.push(row.imagen_base64);
        }
    });

    // Obtener comentarios para la publicación específica
    const sqlComentarios = `
        SELECT c.id, c.contenido, 
               DATE_FORMAT(c.fecha_comentario, '%Y-%m-%d %H:%i:%s') AS fecha_comentario, 
               u.nombre, 
               TO_BASE64(u.foto_perfil) AS foto_perfil_base64_comentario -- Foto de perfil en Base64 del comentario
        FROM comentarios c
        INNER JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.publicacion_id = ?
    `;

    connection.query(sqlComentarios, [publicacion.publicacion_id], async (err, comentarios) => {
        if (err) {
            console.error('Error al obtener comentarios', err);
            return res.status(500).send('Error al obtener comentarios');
        }

        // Agregar las fotos de perfil a cada comentario
        comentarios.forEach(comentario => {
            comentario.foto_perfil = comentario.foto_perfil_base64_comentario; // Foto de perfil en Base64 del comentarista
            delete comentario.foto_perfil_base64_comentario; // Limpiar el campo extra
        });
        await obtenerOpcionesEncuesta(publicacion);

        publicacion.comentarios = comentarios;
        const soyyo = req.session.username === username;
        res.render("solopublicacion", {
            publicacion,
            userid,
            username: req.session.username,
            soyyo
        });
    });
});
};


module.exports = {
    getpublicaciones,
    getComentarios,
    agregarComentario,
    crearPublicacion,
    eliminarPublicacion,
    getMisPublicaciones,
    getSusPublicaciones,
    verpublicacion,
};