const connection = require('../conexion');

const actualizarperfil = (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect('/perfil?mensaje=error');
    }


    //Recoger todos los campos del formulario
    const{
        nombre,
        apellido,
        fecha_nacimiento,
        telefono,
        descripcion,
        twitter,
        instagram,
        linkedin,
        github
    } = req.body;


    // Query para actualizar todos los campos
    const query = `
        UPDATE usuarios
        SET
            nombre = ?,
            apellido = ?,
            fecha_nacimiento = ?,
            telefono = ?,
            descripcion = ?,
            twitter = ?,
            instagram = ?,
            linkedin = ?,
            github = ?
        WHERE id = ?
    `;


    connection.query(
        query,
        [
            nombre,
            apellido,
            fecha_nacimiento,
            telefono,
            descripcion,
            twitter,
            instagram,
            linkedin,
            github,
            userId
        ],
        (error, results) => {
            if (error) {
                console.error('Error al actualizar el perfil:', error);
                return res.redirect('/perfil?mensaje=error');
            }
            res.redirect('/perfil?mensaje=exito');
        }
    );
};
const verperfil = (req, res) => {

const userId = req.session.userId;
console.log(userId);


if (!userId) {
    return res.status(401).send('Usuario no autenticado');
}


// Consulta actualizada para obtener todos los campos necesarioss
const query = `
    SELECT
        nombre,
        apellido,
        fecha_nacimiento,
        telefono,
        descripcion,
        twitter,
        instagram,
        linkedin,
        github
    FROM usuarios
    WHERE id = ?
`;


connection.query(query, [userId], (error, results) => {
    if (error) {
        console.error('Error al obtener el perfil:', error);
        return res.status(500).send('Error al cargar el perfil');
    }


    const usuario = results[0] || {};


    // Asegurar formato de fecha válido
    if (usuario.fecha_nacimiento) {
        usuario.fecha_nacimiento = new Date(usuario.fecha_nacimiento)
            .toISOString()
            .split('T')[0];
    }


    const mensaje = req.query.mensaje;

   
    res.render('perfil', {
        usuario,
        seguidos: 0,
        seguidores: 0,
        mensaje
    });
});
};

const perfilajeno = (req, res) => {
const usernamever = req.params.username; // Usuario cuyo perfil se quiere ver
const userId = req.session.userId;    // ID del usuario autenticado
let estasbloqueado = false;

const queryUsuario = `SELECT *, TO_BASE64(foto_perfil) AS foto_perfil_base64 FROM usuarios WHERE username = ?`;

const queryBloqueadoPor = `
    SELECT COUNT(*) AS bloqueado
    FROM bloqueos
    WHERE bloqueador_id = (SELECT id FROM usuarios WHERE username = ?)
    AND bloqueado_id = ?`;

// Verificar si el usuario está bloqueado por el dueño del perfil
connection.query(queryBloqueadoPor, [usernamever, userId], (errBloqueado, resultBloqueado) => {
    if (errBloqueado) {
        console.error("Error al verificar si el usuario está bloqueado:", errBloqueado);
        return res.status(500).send("Error interno del servidor");
    }

    if (resultBloqueado[0].bloqueado > 0) {
        estasbloqueado = true;
    }

    // Si no está bloqueado, continuar con la lógica normal
    connection.query(queryUsuario, [usernamever], (err, resultUsuario) => {
        if (err) {
            console.error("Error al obtener usuario:", err);
            return res.status(500).send("Error interno del servidor");
        }
        if (resultUsuario.length === 0) {
            return res.status(404).send("Usuario no encontrado");
        }

        const perfilId = resultUsuario[0].id;

        const querySeguidos = `
            SELECT COUNT(*) AS seguidos
            FROM seguimiento s
            INNER JOIN usuarios u ON s.seguidor_id = u.id
            WHERE u.username = ?`;

        const querySeguidores = `
            SELECT COUNT(*) AS seguidores
            FROM seguimiento s
            INNER JOIN usuarios u ON s.seguido_id = u.id
            WHERE u.username = ?`;

        const querySeguido = `
            SELECT COUNT(*) AS seguido
            FROM seguimiento
            WHERE seguidor_id = ? AND seguido_id = ?`;

        const queryBloqueado = `
            SELECT COUNT(*) AS bloqueado
            FROM bloqueos
            WHERE bloqueador_id = ? AND bloqueado_id = ?`;

        connection.query(querySeguidos, [usernamever], (errSeguidos, resultSeguidos) => {
            if (errSeguidos) {
                console.error("Error al obtener seguidos:", errSeguidos);
                return res.status(500).send("Error interno del servidor");
            }

            connection.query(querySeguidores, [usernamever], (errSeguidores, resultSeguidores) => {
                if (errSeguidores) {
                    console.error("Error al obtener seguidores:", errSeguidores);
                    return res.status(500).send("Error interno del servidor");
                }

                connection.query(querySeguido, [userId, perfilId], (errSeguido, resultSeguido) => {
                    if (errSeguido) {
                        console.error("Error al obtener estado de seguimiento:", errSeguido);
                        return res.status(500).send("Error interno del servidor");
                    }

                    const seguido = resultSeguido[0].seguido > 0;

                    connection.query(queryBloqueado, [userId, perfilId], (errBloqueado2, resultBloqueado2) => {
                        if (errBloqueado2) {
                            console.error("Error al verificar estado de bloqueo:", errBloqueado2);
                            return res.status(500).send("Error interno del servidor");
                        }

                        const bloqueado = resultBloqueado2[0].bloqueado > 0;

                        // Aquí pasamos la foto de perfil en Base64 a la vista
                        res.render("perfilajeno", {
                            usuario: resultUsuario[0],
                            seguidos: resultSeguidos[0].seguidos,
                            seguidores: resultSeguidores[0].seguidores,
                            seguido,
                            bloqueado,
                            userId,
                            usernamever,
                            estasbloqueado,
                            foto_perfil_base64: resultUsuario[0].foto_perfil_base64, // Foto en Base64
                            username: req.session.username
                        });
                    });
                });
            });
        });
    });
});
};

    module.exports = {
        actualizarperfil,
        verperfil,
        perfilajeno
    };