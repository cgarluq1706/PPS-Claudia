const connection = require('../conexion');

const yosigo = (req, res) => {

    const usernameperfil = req.params.username;
    
    const querySiguiendo = `
        SELECT u.id, u.username, u.descripcion,
            EXISTS (
                SELECT 1 FROM bloqueos 
                WHERE bloqueador_id = (SELECT id FROM usuarios WHERE username = ?) 
                AND bloqueado_id = u.id
            ) AS bloqueado
        FROM seguimiento s
        INNER JOIN usuarios u ON s.seguido_id = u.id
        WHERE s.seguidor_id = (SELECT id FROM usuarios WHERE username = ?)
    `;
    
    connection.query(querySiguiendo, [usernameperfil, usernameperfil], (err, result) => {
        if (err) {
            console.error("Error al obtener la lista de seguidos:", err);
            return res.status(500).send("Error interno del servidor");
        }
    
        res.render("siguiendo", {
            username: req.session.username,
            usernameperfil,
            siguiendo: result
        });
    });
    };

        const mesiguen = (req, res) => {
        const usernameperfil = req.params.username;
    
        const querySeguidores = `
            SELECT u.id, u.username, u.descripcion
            FROM seguimiento s
            INNER JOIN usuarios u ON s.seguidor_id = u.id
            WHERE s.seguido_id = (SELECT id FROM usuarios WHERE username = ?)
        `;
    
        connection.query(querySeguidores, [usernameperfil], (err, result) => {
            if (err) {
                console.error("Error al obtener la lista de seguidores:", err);
                return res.status(500).send("Error interno del servidor");
            }
    
            res.render("seguidores", {username: req.session.username, usernameperfil, seguidores: result });
        });
    };

    

    const elsigue = (req, res) => {
    const usernameperfil = req.params.username;

    const querySiguiendo = `
    SELECT u.id, u.username, u.descripcion
    FROM seguimiento s
    INNER JOIN usuarios u ON s.seguido_id = u.id
    WHERE s.seguidor_id = (SELECT id FROM usuarios WHERE username = ?)
`;

    connection.query(querySiguiendo, [usernameperfil], (err, result) => {
        if (err) {
            console.error("Error al obtener la lista de seguidos:", err);
            return res.status(500).send("Error interno del servidor");
        }

        res.render("siguiendo", {username: req.session.username, usernameperfil, siguiendo: result });
    });
};

    const lesiguen = (req, res) => {
    const usernameperfil = req.params.username;

    const querySeguidores = `
        SELECT u.id, u.username, u.descripcion
        FROM seguimiento s
        INNER JOIN usuarios u ON s.seguidor_id = u.id
        WHERE s.seguido_id = (SELECT id FROM usuarios WHERE username = ?)
    `;

    connection.query(querySeguidores, [usernameperfil], (err, result) => {
        if (err) {
            console.error("Error al obtener la lista de seguidores:", err);
            return res.status(500).send("Error interno del servidor");
        }

        res.render("seguidores", {username: req.session.username, usernameperfil, seguidores: result });
    });
};
    module.exports = {
        yosigo,
        mesiguen,
        lesiguen,
        elsigue
    };