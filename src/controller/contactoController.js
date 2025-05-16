const getContacto = (req, res) => {
    // Puedes agregar datos dinámicos si es necesario
    res.render('contacto', { username: req.session.username });
};

module.exports = {
    getContacto
};
