import React, { useState } from "react"; // Importar React y useState para manejar el estado
import "../styles/Servicios.css"; // Importar estilos específicos para la página de servicios
import Carrito from "../components/Carrito"; // Importar componente Carrito
import CarritoFlotante from "../components/CarritoFlotante"; // Importar componente Carrito Flotante
import Header from "../components/Header"; // Importar componente Header

// Componente principal de Servicios

const Servicios = () => {
  const [carrito, setCarrito] = useState([]); // Estado para almacenar los productos en el carrito
  const [mostrarCarrito, setMostrarCarrito] = useState(false); // Estado para controlar la visibilidad del carrito

 

  // Función para actualizar el carrito con nuevos items
  const actualizarCarrito = (nuevosItems) => {
    setCarrito(nuevosItems); // Actualizar el estado del carrito
  };

  // Calcular la cantidad total de productos en el carrito
  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="app-container">
      <Header /> 
      {/* Contenedor principal de servicios */}
      <main className="servicios-container"> 
        <h1>Nuestros Servicios</h1> 
         {/* Contenedor para la cuadrícula de servicios */}
        <div className="servicios-grid">
          {[ // Definición de servicios disponibles
            {
              img: "../images/SERVICIOS/entregas-a-domicilio-1080x675.jpg",
              title: "Entrega a Domicilio",
              desc: "Entregamos tus compras directamente en tu puerta",
              details: ["Entrega el mismo día", "Seguimiento en tiempo real", "Cobertura en toda la ciudad"],
            },
            {
              img: "../images/SERVICIOS/tienda.jpg",
              title: "Recogida en Tienda",
              desc: "Recoge tus compras cuando lo prefieras",
              details: ["Sin costo adicional", "Horario extendido", "Preparamos tu pedido"],
            },
            {
              img: "../images/SERVICIOS/asesoria.jpg",
              title: "Asesoría Personalizada",
              desc: "Te ayudamos a encontrar lo que necesitas",
              details: ["Atención personalizada", "Expertos en productos", "Recomendaciones"],
            },
            {
              img: "../images/SERVICIOS/compras.png",
              title: "Compras Especiales",
              desc: "Pedidos personalizados y al por mayor",
              details: ["Descuentos por volumen", "Productos especiales", "Atención empresarial"],
            },

          ].map((servicio, index) => ( 
            <div className="servicio-card" key={index}> 
              <img src={servicio.img} alt={servicio.title} /> 
              <h3>{servicio.title}</h3> 
              <p className="servicio-description">{servicio.desc}</p> 
              <ul className="servicio-detalles"> 
                {servicio.details.map((detail, i) => ( 
                  <li key={i}>{detail}</li>
                ))}
              </ul>
              <button className="solicitar-servicio">Solicitar Servicio</button> {/* Botón para solicitar el servicio */}
            </div>
          ))}
        </div>
      </main>

      {/* Carrito */}
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

export default Servicios; 