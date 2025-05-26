# Rapid Mart - Plataforma de Comercio Electrónico

Rapid Mart es una plataforma de comercio electrónico moderna construida con React y Firebase, que permite a los usuarios realizar compras en línea y a los administradores gestionar productos y pedidos.

## Características Principales

### Para Usuarios
- Registro y autenticación de usuarios
- Catálogo de productos con categorías
- Carrito de compras
- Proceso de pago seguro con Stripe
- Historial de pedidos
- Seguimiento de estado de pedidos

### Para Administradores
- Panel de administración
- Gestión de productos (CRUD)
- Gestión de pedidos



## Tecnologías Utilizadas

- **Frontend**: React.js, React Router, Context API
- **Backend**: Firebase (Firestore, Authentication)
- **Pagos**: Stripe
- **Estilos**: CSS Modules
- **Control de Versiones**: Git

## Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
├── context/           # Contextos de React
├── firebase/          # Configuración de Firebase
├── pages/             # Páginas de la aplicación
├── services/          # Servicios y APIs
├── styles/            # Estilos CSS
└── utils/             # Utilidades y helpers
```

## Instalación

1. Instalar dependencias:
```bash
cd rapid-mart
npm install
```

2. Configurar variables de entorno:

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
REACT_APP_STRIPE_PUBLIC_KEY=tu_stripe_public_key
```

3. Iniciar el servidor de desarrollo:

Primero para iniciar el backend, usar los siguientes comandos:

"cd backend"
"npm start"

Luego, en una nueva terminar ejecutar "npm start" para iniciar el frontend.


## Documentación Detallada

- [Documentación de Servicios](./docs/SERVICES.md)
- [Documentación de APIs](./docs/API.md)
- [Documentación de Componentes](./docs/COMPONENTS.md)






