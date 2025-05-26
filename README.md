# Sistematic - Plataforma de Reserva de eventos

Sistematic es una plataforma de comercio electrónico moderna construida con React y springboot, que permite a los usuarios realizar reservas en línea y a los administradores gestionar eventos y reservas.

## Características Principales

### Para Usuarios
- Registro y autenticación de usuarios
- Catálogo de eventos con categorías
- Proceso de pago seguro 
- Historial de reservas

### Para Administradores
- Panel de administración
- Gestión de eventos (CRUD)
- Gestión de reservas



## Tecnologías Utilizadas

- **Frontend**: React.js, React Router, Context API
- **Backend**: SpringBoot 
- **Base de datos**: Mysql
- **Estilos**: CSS Modules
- **Control de Versiones**: Git

## Estructura del Proyecto

Frontend
```
src/ 
├── components/         # Componentes reutilizables
├── context/           # Contextos de React
├── pages/             # Páginas de la aplicación
├── services/          # Servicios y APIs
├── styles/            # Estilos CSS
└── utils/             # Utilidades y helpers
```
Backend
```
Java/
├── Controlador/       # Controlan los métodos de entrada (API REST)
├── Modelo/            # Modelos de cada tabla de la base de datos
├── Repositorio/       # Interfaces que manejan la persistencia (JPA, consultas a BD)
├── Servicio/          # Lógica de negocio de la aplicación
├── Seguridad/         # Manejo de seguridad (JWT, filtros, roles)
```

## Instalación

1. Instalar dependencias:
```bash
cd src
npm install
```

2. Encender el backend:

- cd backend
- cd SistemasReservas
- ./mvnw spring-boot:run


4. Iniciar el servidor de react:

Primero iniciamos otra terminal usamos los siguientes comandos:

- "cd src"
- "npm start"


## Documentación Detallada

- [Documentación de Servicios](./docs/SERVICES.md)
- [Documentación de APIs](./docs/API.md)
- [Documentación de Componentes](./docs/COMPONENTS.md)






