drop database if exists red_social;
create database if not exists red_social;

use red_social; 

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) not null,
    username varchar(100) not null unique,
 --   email VARCHAR(100) NOT NULL UNIQUE,
    contraseña CHAR(60) NOT NULL,
    fecha_nacimiento date,
    telefono varchar(100),
    foto_perfil LONGBLOB,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo boolean default 1,
    descripcion VARCHAR(100),
    twitter VARCHAR(255),
    instagram VARCHAR(255),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    oculto BOOLEAN DEFAULT FALSE, -- Ocultar usuarios
    role ENUM('admin', 'user') DEFAULT 'user'
);
CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emisor_id INT NOT NULL,
    receptor_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emisor_id) REFERENCES usuarios(id),
    FOREIGN KEY (receptor_id) REFERENCES usuarios(id)
);

-- Creación de la tabla de seguimiento
CREATE TABLE IF NOT EXISTS seguimiento (
    seguidor_id INT,
    seguido_id INT,
    PRIMARY KEY (seguidor_id, seguido_id),
    FOREIGN KEY (seguidor_id) REFERENCES usuarios(id),
    FOREIGN KEY (seguido_id) REFERENCES usuarios(id)
);


-- Creación de la tabla de publicaciones
CREATE TABLE IF NOT EXISTS publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    contenido TEXT,
    num_like INT  DEFAULT 0,
	num_guardado INT  DEFAULT 0,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    oculto BOOLEAN DEFAULT FALSE, -- Ocultar publicaciones
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE TABLE IF NOT EXISTS imagen_publicacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT,
    imagen LONGBLOB,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id)
);

DROP TABLE IF EXISTS `comentarios`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
CREATE TABLE `comentarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `publicacion_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `contenido` text NOT NULL,
  `fecha_comentario` timestamp NOT NULL DEFAULT current_timestamp(),
   oculto BOOLEAN DEFAULT FALSE, -- Ocultar comentarios
  PRIMARY KEY (`id`),
  KEY `publicacion_id` (`publicacion_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`publicacion_id`) REFERENCES `publicaciones` (`id`),
  CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
 SET character_set_client = @saved_cs_client;

 
 CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emisor_id INT NOT NULL,
    receptor_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emisor_id) REFERENCES usuarios(id),
    FOREIGN KEY (receptor_id) REFERENCES usuarios(id)
);

CREATE TABLE bloqueos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bloqueador_id INT NOT NULL,
  bloqueado_id INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bloqueador_id) REFERENCES usuarios(id),
  FOREIGN KEY (bloqueado_id) REFERENCES usuarios(id),
  UNIQUE (bloqueador_id, bloqueado_id)
);

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
ALTER TABLE `comentarios` DISABLE KEYS ;
ALTER TABLE `comentarios` ENABLE KEYS ;
UNLOCK TABLES;
SET TIME_ZONE = '+00:00'; -- UTC

SET SQL_MODE = '';
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
SET CHARACTER_SET_CLIENT = 'utf8mb4';
SET CHARACTER_SET_RESULTS = 'utf8mb4';
SET COLLATION_CONNECTION = 'utf8mb4_general_ci';
SET SQL_NOTES = 1;

CREATE TABLE IF NOT EXISTS like_publicacion (
    id_like INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_publicacion INT,
    UNIQUE (id_usuario, id_publicacion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS guardar_publicacion (
    id_elemento_guardado INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_publicacion INT,
    UNIQUE (id_usuario, id_publicacion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id) ON DELETE CASCADE
);

-- Tabla principal de encuestas
CREATE TABLE encuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT NOT NULL,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

-- Tabla de opciones
CREATE TABLE opciones_encuesta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    encuesta_id INT NOT NULL,
    texto_opcion VARCHAR(255) NOT NULL,
    votos INT DEFAULT 0,
    FOREIGN KEY (encuesta_id) REFERENCES encuestas(id) ON DELETE CASCADE
);

-- Tabla de votos de usuarios
CREATE TABLE votos_encuesta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opcion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    UNIQUE(opcion_id, usuario_id),
    FOREIGN KEY (opcion_id) REFERENCES opciones_encuesta(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
select * from usuarios u ;




-- para ver desde que rutas se pueden subir archivos
SHOW VARIABLES LIKE 'secure_file_priv';
-- Hay que incluir \\ 
-- C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\
INSERT INTO usuarios (nombre, apellido, username, contraseña, fecha_nacimiento, telefono, role)
VALUES ('Admin', 'Admin', 'admin', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '2000-01-01', '123456789', 'admin');
INSERT INTO usuarios (nombre, apellido, username, contraseña, fecha_nacimiento, telefono, foto_perfil)
VALUES ('Miguel', 'Ternero Algarín', 'miguelt', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1985-10-20', '987654321', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36290.jpg'));
INSERT INTO usuarios (nombre, apellido, username, contraseña, fecha_nacimiento, telefono, foto_perfil)
VALUES ('María', 'RuiG', 'mariar', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1985-10-20', '987654321', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36264.jpg'));
INSERT INTO usuarios (nombre, apellido, username, contraseña, fecha_nacimiento, telefono, foto_perfil)
VALUES ('Ronaldo', 'de Assis Moreira', 'Ronaldinho1', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1985-10-20', '987654321', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\Ronaldinho.png'));
INSERT INTO usuarios (nombre, apellido, username, contraseña, fecha_nacimiento, telefono, foto_perfil)
VALUES ('Linda', 'Onotanto', 'officialLinda1', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1985-10-20', '987654321', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36268.jpg'));
INSERT INTO usuarios (nombre, apellido, username, contraseña, fecha_nacimiento, telefono, foto_perfil) VALUES
('Luis', 'Ramírez Sánchez', 'luis_rs', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1991-04-12', '968975321', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36505.jpg')),
('Ana', 'Herrera Díaz', 'ana_hd', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1994-09-17', '934665432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36506.jpg')),
('Miguel', 'Moreno Aguilar', 'miguel_ma', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1989-06-20', '921234567', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36507.jpg')),
('Laura', 'Pérez Sánchez', 'laura_ps', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1993-11-25', '912345678', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36508.jpg')),
('Pedro', 'Hernández García', 'pedro_hg', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1985-07-09', '934567890', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36509.jpg')),
('Marta', 'Gómez Fernández', 'marta_gf', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1992-03-15', '945678901', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36510.jpg')),
('Juan', 'Martínez López', 'juan_ml', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1987-10-22', '956789012', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36511.jpg')),
('Isabel', 'Ruiz Torres', 'isabel_rt', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1990-01-28', '968975321', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36512.jpg')),
('Alberto', 'López Gómez', 'alberto_lg', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1989-05-18', '934665432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Alberta', 'Lpez Gmez', 'alberta_lg', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1982-05-18', '934365432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Pepe', '`pepin` popon', 'pepe_pp', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1982-05-18', '934665432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Pepa', 'Pa Pi', 'pepo_pp', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1981-05-18', '934665432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Jisus', 'Cristo Pipi', 'jisus_cristo', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1989-01-18', '934665422', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Losus', 'Losus Pipi', 'losus', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1939-01-18', '934665422', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Terne', 'Terne Terne', 'terne_pipo', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1911-04-12', '962975321', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36505.jpg')),
('Ana', 'Maria Díaz', 'ana_mm', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1994-01-17', '934665432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36506.jpg')),
('Kola', 'pepe pepe', 'kolapep', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1999-06-20', '921234567', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36507.jpg')),
('Julio', 'Mari Pep', 'julio_kol', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1993-11-25', '912315678', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36508.jpg')),
('Popo', 'Pipi Caca', 'poo', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1925-07-09', '940567890', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36509.jpg')),
('Popi', 'POPO Popi', 'popo', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1912-03-15', '945676901', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36510.jpg')),
('Yuyu', 'Yaya López', 'Yuyu', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1947-10-22', '956749012', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36511.jpg')),
('Isabel', 'Pantoja nose', 'isabel_pantoja', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1990-01-18', '958975321', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36512.jpg')),
('Killo', 'Pepe Koko', 'pedro_pp', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1929-05-18', '933665432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Alberte', 'Lpez Gmez', 'alberte_lg', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1980-05-18', '904365432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Lolo', '`Lolito` Lolon', 'Lolo', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1922-05-18', '934635432', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Puedo', 'Pa Pi', 'puedo', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1982-05-18', '934665431', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Koko', 'Dc Pipi', 'koko', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1982-01-18', '934265422', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Juju', 'Jojo Pipi', 'jojo', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1929-01-18', '934615422', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36513.jpg')),
('Nono', 'Noni Pérez', 'noni', '$2a$10$DxvoLNDuQpgNbheGIRb7ZuKoJA91o24LllzbEGp4fpt.JFqLJ8QUC', '1992-12-11', '921134567', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.3\\Uploads\\IMG_36514.jpg'));





-- Miguel sigue a ...
insert into seguimiento values(1,2);
insert into seguimiento values(1,3);

-- mariar sigue a ...
insert into seguimiento values(2,1);
insert into seguimiento values(2,3);
insert into seguimiento values(2,4);

-- Ronaldo sigue a ...
insert into seguimiento values(3,4);

-- linda sigue a ...
insert into seguimiento values(4,2);
insert into seguimiento values(4,3);


-- Maria escribe varios post
insert into publicaciones (usuario_id,contenido)   values(2,'Soy nuevo en SocialTernero');
insert into publicaciones (usuario_id,contenido)   values(2,'Seguidme!! please');
insert into publicaciones (usuario_id,contenido)   values(2,'Divide et impera ');
insert into publicaciones (usuario_id,contenido)   values(2,'Esta red funciona');
insert into publicaciones (usuario_id,contenido)   values(8,'XD');
insert into publicaciones (usuario_id,contenido)   values(8,'MADRID MIERDA');
insert into publicaciones (usuario_id,contenido)   values(8,'BARCA EL MEJOR ');
insert into publicaciones (usuario_id,contenido)   values(8,'HOLAAA');
insert into publicaciones (usuario_id,contenido)   values(7,'FORTNITE');
insert into publicaciones (usuario_id,contenido)   values(7,'ME ENCANTA');
insert into publicaciones (usuario_id,contenido)   values(7,'CRISTIN EL MEJOR');
insert into publicaciones (usuario_id,contenido)   values(7,'SOY DEL BETIS');
insert into publicaciones (usuario_id,contenido)   values(9,'VIVA EL SEVILLA');
insert into publicaciones (usuario_id,contenido)   values(9,'EL DEL BETIS CABRON');
insert into publicaciones (usuario_id,contenido)   values(9,'JAJAJA');
insert into publicaciones (usuario_id,contenido)   values(9,'MÁQUINA');
-- Linda escribe varios post
insert into publicaciones (usuario_id,contenido)   values(4,'Hola Red social');
insert into publicaciones (usuario_id,contenido)   values(4,'Cogito Ergo sum');
-- Ronaldinho escribe varios post
insert into publicaciones (usuario_id,contenido) values(3,'Dura derrota, a seguir trabajando!');
insert into publicaciones (usuario_id,contenido) values(3,'Gran victoría!! este equipo promete');






-- CONSULTAS

-- post de los que yo sigo
SELECT p.*
FROM publicaciones p
INNER JOIN seguimiento s ON p.usuario_id = s.seguido_id
WHERE s.seguidor_id = 1
ORDER BY p.fecha_publicacion DESC;

SELECT u.nombre, u.foto_perfil, p.contenido , p.fecha_publicacion 
FROM publicaciones p
INNER JOIN usuarios u ON p.usuario_id = u.id
INNER JOIN seguimiento s ON u.id = s.seguido_id
INNER JOIN usuarios u2 ON s.seguidor_id = u2.id
WHERE u2.username = 'miguelt'
ORDER BY p.fecha_publicacion DESC;
