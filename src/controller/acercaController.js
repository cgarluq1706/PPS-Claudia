const getAcerca = (req, res) => {
    // Puedes agregar datos dinámicos si es necesario
    res.render('acerca', { username: req.session.username });
};

module.exports = {
    getAcerca
};