import React, { useState } from "react"; // Importar React y useState para manejar el estado
import "../styles/Cliente.css"; // Importar estilos específicos para la página del cliente
import "../styles/Secciones.css"; // Importar estilos generales para secciones
import Carrito from "../components/Carrito"; // Importar componente Carrito
import CarritoFlotante from "../components/CarritoFlotante"; // Importar componente Carrito Flotante
import "bootstrap/dist/css/bootstrap.min.css"; // Importar estilos de Bootstrap
import Header from "../components/Header"; // Importar componente Header
import Slider from "react-slick"; // Importar componente Slider para carrusel
import 'slick-carousel/slick/slick.css'; // Importar estilos para el carrusel
import 'slick-carousel/slick/slick-theme.css'; // Importar estilos de tema para el carrusel
import {getAuth, signOut} from 'firebase/auth';
import {appFirebase} from '../credenciales';
const auth = getAuth(appFirebase);

// Componente principal de RapidMart
const RapidMart = ({correoUsuario}) => {
  const [carrito, setCarrito] = useState([]); // Estado para almacenar los productos en el carrito
  const [mostrarCarrito, setMostrarCarrito] = useState(false); // Estado para controlar la visibilidad del carrito


  // Función para actualizar el carrito con nuevos items
  const actualizarCarrito = (nuevosItems) => {
    setCarrito(nuevosItems); // Actualizar el estado del carrito
  };

  // Calcular la cantidad total de productos en el carrito
  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);

  // Configuración del carrusel
  const settings = {
    dots: true, // Mostrar puntos de navegación
    infinite: true, // Carrusel infinito
    speed: 500, // Velocidad de transición
    slidesToShow: 1, // Número de slides a mostrar
    slidesToScroll: 1, // Número de slides a desplazar
    autoplay: true, // Activar autoplay
    autoplaySpeed: 3000, // Velocidad de autoplay
  };

  return (
    <div className="app-container">
      <Header /> {/* Renderizar el encabezado */}
      
      <main className="productos-container">
        <div className="carousel-container">
          <Slider {...settings}> {/* Renderizar el carrusel con las configuraciones */}
            <div>
              <img src="../images/VERDURAS.png" alt="Imagen 1" className="carousel-image" /> {/* Imagen del carrusel */}
            </div>
            <div>
              <img src="../images/LACTEOS BANNER.jpg" alt="Imagen 2" className="carousel-image" /> {/* Imagen del carrusel */}
            </div>
            <div>
              <img src="../images/ABARROTES.jpeg" alt="Imagen 3" className="carousel-image" /> {/* Imagen del carrusel */}
            </div>
            <div>
              <img src="../images/licores-licor-cerca-de-mi.jpg" alt="Imagen 4" className="carousel-image" /> {/* Imagen del carrusel */}
            </div>
            <div>
              <img src="../images/shutterstock_1544878508-1-1024x684.jpg" alt="Imagen 5" className="carousel-image" /> {/* Imagen del carrusel */}
            </div>
          </Slider>
        </div>

        <div className="categories"> {/* Contenedor de categorías */}

          {[ // Definición de categorías disponibles
            { name: "LÁCTEOS", img: "LACTEOS.png", path: "Lacteos" },
            { name: "FRUTAS Y VERDURAS", img: "FRUTAS Y VERDURAS.png", path: "FyV" },
            { name: "LICORES", img: "LICORES.png", path: "Licores" },
            { name: "MASCOTAS", img: "MASCOTAS.png", path: "Mascotas" },
            { name: "DROGUERIA", img: "MEDICAMENTOS.png", path: "Drogueria" },
            { name: "ASEO", img: "ASEO.png", path: "Aseo" },
            { name: "PANADERIA", img: "PANADERIA.png", path: "Panaderia" },
            { name: "ABARROTES", img: "ABARROTES.png", path: "Abarrotes" }
          ].map((category, index) => (
            <div key={index} className="category-item" onClick={() => window.location.href = `/${category.path}`}>
              <img src={`../images/ICONOS PAGINA CLIENTE/${category.img}`} alt={category.name} className="category-icon" /> {/* Icono de la categoría */}
              <p className="category-text">{category.name}</p> {/* Nombre de la categoría */}
            </div>
          ))}
        </div>
      </main>

      <CarritoFlotante 
        cantidad={cantidadTotal} // Pasar la cantidad total de productos al carrito flotante
        onClick={() => setMostrarCarrito(true)} // Manejar clic para mostrar el carrito
      />

      <Carrito
        visible={mostrarCarrito} // Controlar la visibilidad del carrito
        onClose={() => setMostrarCarrito(false)} // Manejar el cierre del carrito
        productos={carrito} // Pasar los productos al carrito
        onUpdateCart={actualizarCarrito} // Pasar la función para actualizar el carrito
      />
    </div>
  );
};

export default RapidMart; 