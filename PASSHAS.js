const bcrypt = require('bcryptjs');// Añade la importación de bcrypt

const password = '1234';

bcrypt.hash(password, 10, function(err, hash) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(hash);
});
