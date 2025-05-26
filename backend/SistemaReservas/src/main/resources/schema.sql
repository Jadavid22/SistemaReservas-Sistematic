-- Eliminar la tabla si existe
DROP TABLE IF EXISTS evento;

-- Crear la tabla evento con todos los campos necesarios
CREATE TABLE evento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    categoria VARCHAR(255),
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora_inicio VARCHAR(10),
    hora_final VARCHAR(10),
    capacidad INTEGER NOT NULL,
    capacidad_disponible INTEGER NOT NULL,
    precio DOUBLE NOT NULL,
    ubicacion VARCHAR(255),
    imagen VARCHAR(255),
    destacado BOOLEAN DEFAULT FALSE
);

-- Actualizar los registros existentes
UPDATE evento
SET capacidad_disponible = capacidad
WHERE capacidad_disponible IS NULL; 