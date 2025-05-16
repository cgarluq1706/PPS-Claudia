const connection = require('../conexion');
//Para subir las imagenes como blob

const getImageId = (req, res) => {
    const userId = req.params.id;
    const username = req.session.username;

    // Consulta SQL para obtener la imagen de perfil del usuario
    const sql = 'SELECT foto_perfil FROM usuarios WHERE id = ?';

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener imagen de perfil:', err);
            res.status(500).send('Error al obtener imagen de perfil');
            return;
        }

        // Comprobar si se encontraron resultados
        if (results.length > 0) {
            // Obtener los datos de la imagen de perfil en formato BLOB
            const image = results[0].foto_perfil;

            // Verificar si hay datos en la columna de imagen
            if (image) {
                // Configurar el tipo de contenido de la respuesta
                res.contentType('image/jpeg'); // Cambiar a 'image/png' si es PNG

                // Enviar la imagen como respuesta
                res.send(image);
            } else {
                // Si no hay imagen de perfil, enviar una imagen de avatar predeterminada o un mensaje de error
                res.status(404).send('Imagen de perfil no encontrada');
            }
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    });
};


const getImage = (req, res) => {
    //const userId = req.params.id;
    const username = req.session.username;

    // Consulta SQL para obtener la imagen de perfil del usuario
    const sql = 'SELECT foto_perfil FROM usuarios WHERE username = ?';

    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error al obtener imagen de perfil:', err);
            res.status(500).send('Error al obtener imagen de perfil');
            return;
        }

        // Comprobar si se encontraron resultados
        if (results.length > 0) {
            // Obtener los datos de la imagen de perfil en formato BLOB
            const image = results[0].foto_perfil;

            // Verificar si hay datos en la columna de imagen
            if (image) {
                // Configurar el tipo de contenido de la respuesta
                res.contentType('image/jpeg'); // Cambiar a 'image/png' si es PNG

                // Enviar la imagen como respuesta
                res.send(image);
            } else {
                // Si no hay imagen de perfil, enviar una imagen de avatar predeterminada o un mensaje de error
                res.status(404).send('Imagen de perfil no encontrada');
            }
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    });
};

const modificaFoto = (req, res) => {
    const image = req.files?.image; // Acceder al archivo cargado con 'image' como el nombre del campo

    if (!image) {
        return res.redirect('/perfil?mensaje=' + encodeURIComponent('No se ha subido ninguna imagen'));
    }

    // Procesar la imagen, por ejemplo, guardarla en la base de datos
    const username = req.session.username;
    const imageBuffer = image.data; // Usar el buffer de la imagen cargada

    const updateQuery = 'UPDATE usuarios SET foto_perfil = ? WHERE username = ?';
    const values = [imageBuffer, username];

    connection.query(updateQuery, values, (error, results) => {
        if (error) {
            return res.redirect('/perfil?mensaje=' + encodeURIComponent('Error al actualizar la foto de perfil'));
        }

        res.redirect('/perfil');
    });
};

module.exports = {
    modificaFoto,
    getImageId,
    getImage

}