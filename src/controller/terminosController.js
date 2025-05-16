const getTerminos = (req, res) => {
    // Puedes agregar datos dinámicos si es necesario
    res.render('terminos', { username: req.session.username });
};

module.exports = {
    getTerminos
};
