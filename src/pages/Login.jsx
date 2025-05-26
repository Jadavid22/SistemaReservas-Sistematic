import React, { useState } from "react";
import "../styles/style.css";
import { useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoKeyOutline, IoCloseCircleOutline } from "react-icons/io5";
import logoadmin from '../images/logoadmin.png';
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const [registrando, setRegistrando] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ show: false, message: '', type: '' });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();

  // Función para mostrar alertas
  const showAlert = (message, type) => {
    setAlertMessage({ show: true, message, type });
    setTimeout(() => {
      setAlertMessage({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Función para acceso como invitado
  const handleGuestAccess = () => {
    showAlert("Accediendo como invitado", "success");
    navigate('/ClienteInv');
  };

  // Función para el registro de usuarios
  const handleRegister = async (e) => {
    e.preventDefault();
    const nombre = e.target.nombreRegister.value;
    const correo = e.target.emailRegister.value;
    const contraseña = e.target.passwordRegister.value;

    try {
      const response = await fetch('http://localhost:8080/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email: correo, password: contraseña })
      });
      if (response.ok) {
        showAlert("¡Registro exitoso! Ahora puedes iniciar sesión.", "success");
        navigate('/');
      } else {
        const errorText = await response.text();
        showAlert("Error en el registro: " + errorText, "error");
      }
    } catch (error) {
      showAlert("Error en el registro: " + error.message, "error");
    }
  };

  // Función para el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    const correo = e.target.emailLogin.value;
    const contraseña = e.target.passwordLogin.value;

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password: contraseña })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta del servidor:', data); // Debug

        // Guardar el token
        localStorage.setItem('token', data.token);

        // Decodificar el token para obtener el rol y el ID
        const decoded = jwtDecode(data.token);
        console.log("Token decodificado completo:", decoded);
        console.log("ID del token:", decoded.id);
        console.log("SUB del token:", decoded.sub);
        console.log("Rol del token:", decoded.rol);

        // Intentar obtener el ID de diferentes formas
        const userId = decoded.id || decoded.sub || decoded.userId || decoded.user_id;
        console.log("ID obtenido:", userId);

        // Guardar la información del usuario
        const userInfo = {
          email: correo,
          id: userId ? parseInt(userId) : null,
          rol: decoded.rol
        };
        console.log("Información del usuario a guardar:", userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));

        // Verificar el rol en el token
        let rol = decoded.rol;
        if (!rol && decoded.authorities && decoded.authorities.length > 0) {
          rol = decoded.authorities[0].authority.replace('ROLE_', '');
        }

        // Si no hay rol, asumimos que es USUARIO por defecto
        if (!rol) {
          rol = 'USUARIO';
        }

        console.log("Rol detectado:", rol);

        // Guardar el rol en localStorage
        localStorage.setItem('userRole', rol);

showAlert("¡Inicio de sesión exitoso!", "success");
setTimeout(() => {
          if (rol === "ADMINISTRADOR") {
    navigate('/AdminDashboard');
  } else {
    navigate('/Cliente');
  }
}, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error de autenticación:', errorData);
        showAlert("Error de autenticación: " + (errorData.message || 'El correo o la contraseña son incorrectos'), "error");
      }
    } catch (error) {
      console.error("Error en la autenticación:", error);
      showAlert("Error de autenticación: " + error.message, "error");
    }
  };

  // Función para el reset de contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const email = e.target.emailReset.value;
    const oldPassword = e.target.oldPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    // Validaciones básicas
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      showAlert("Todos los campos son requeridos", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Las contraseñas nuevas no coinciden", "error");
      return;
    }

    if (newPassword.length < 6) {
      showAlert("La nueva contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/auth/cambiar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });

      if (response.ok) {
        showAlert("Contraseña actualizada exitosamente", "success");
        setShowResetPassword(false);
        handleOpenLogin(); // Redirigir al login
      } else {
        const errorData = await response.text();
        showAlert(errorData || "Error al cambiar la contraseña", "error");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      showAlert("Error al cambiar la contraseña: " + error.message, "error");
    }
  };

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isPopupActive, setIsPopupActive] = useState(false);

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
    setShowResetPassword(false);
    setIsPopupActive(true);
  };

  const handleOpenRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
    setShowResetPassword(false);
    setRegistrando(true);
  };

  const handleOpenResetPassword = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowResetPassword(true);
  };

  const handleClosePopup = () => {
    setIsPopupActive(false);
    setTimeout(() => {
      setShowLogin(false);
      setShowRegister(false);
      setShowResetPassword(false);
    }, 400);
  };

  return (
    <div>
      <header>
        <h2 className="logo">
          <img src="../Sistematic Logo.png" width="400" height="90" alt="Logo SENA" />
        </h2>

        <div className="nav-buttons">
          <nav className="navigation">
            <button className="btnInv-popup" onClick={handleGuestAccess}>INVITADO</button>
            <button className="btnLogin-popup" onClick={handleOpenLogin}>LOGIN</button>
          </nav>
        </div>
      </header>

      {alertMessage.show && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}

      <div className={`wrapper ${isPopupActive ? "active-popup" : ""}`} style={{ transform: isPopupActive ? "scale(1)" : "scale(0)" }}>
        <span className="icon-close" onClick={handleClosePopup}>
          <IoCloseCircleOutline />
        </span>

        {/* Formulario de Login */}
        {showLogin && (
          <div className="form-box login active">
            <h2>Ingreso</h2>
            <form onSubmit={handleLogin}>
              <div className="input-box">
                <span className="icon"><IoPersonOutline /></span>
                <input type="text" required name="emailLogin" id="emailLogin" />
                <label>Usuario</label>
              </div>

              <div className="input-box">
                <span className="icon"><IoKeyOutline /></span>
                <input type="password" required name="passwordLogin" id="passwordLogin" />
                <label>Contraseña</label>
              </div>

              <div className="Guardar-Datos">
                <label>
                  <input type="checkbox" /> Guardar Datos
                </label>
                <a href="#" onClick={handleOpenResetPassword}>Restablecer contraseña</a>
              </div>

              <button type="submit" className="btn">Ingresar</button>

              <div className="Ingreso-Registro">
                <p>No tienes una cuenta? <a href="#" className="Link-de-registro" onClick={handleOpenRegister}>Registrarse</a></p>
              </div>
            </form>
          </div>
        )}

        {/* Formulario de Registro */}
        {showRegister && (
          <div className="form-box register active">
            <h2>Registro</h2>
            <form onSubmit={handleRegister}>
              <div className="input-box">
                <span className="icon"><IoPersonOutline /></span>
                <input type="text" required name="nombreRegister" id="nombreRegister" />
                <label>Nombre</label>
              </div>
              <div className="input-box">
                <span className="icon"><IoPersonOutline /></span>
                <input type="text" required name="emailRegister" id="emailRegister" />
                <label>Correo</label>
              </div>

              <div className="input-box">
                <span className="icon"><IoKeyOutline /></span>
                <input type="password" required name="passwordRegister" id="passwordRegister" />
                <label>Contraseña</label>
              </div>

              <div className="Guardar-Datos">
                <label>
                  <input type="checkbox" /> Aceptar términos y condiciones
                </label>
              </div>

              <button type="submit" className="btn">Registrarse</button>

              <div className="Ingreso-Registro">
                <p>Ya tienes una cuenta? <a href="#" className="Link-de-ingreso" onClick={handleOpenLogin}>Ingresar</a></p>
              </div>
            </form>
          </div>
        )}

        {/* Formulario de Restablecer Contraseña */}
        {showResetPassword && (
          <div className="form-box reset-password active">
            <h2>Cambiar Contraseña</h2>
            <form onSubmit={handleResetPassword}>
              <div className="input-box">
                <span className="icon"><IoPersonOutline /></span>
                <input type="email" required name="emailReset" id="emailReset" />
                <label>Correo</label>
              </div>
              <div className="input-box">
                <span className="icon"><IoKeyOutline /></span>
                <input type="password" required name="oldPassword" id="oldPassword" />
                <label>Contraseña Actual</label>
              </div>
              <div className="input-box">
                <span className="icon"><IoKeyOutline /></span>
                <input type="password" required name="newPassword" id="newPassword" />
                <label>Nueva Contraseña</label>
              </div>
              <div className="input-box">
                <span className="icon"><IoKeyOutline /></span>
                <input type="password" required name="confirmPassword" id="confirmPassword" />
                <label>Confirmar Nueva Contraseña</label>
              </div>
              <button type="submit" className="btn">Cambiar Contraseña</button>
              <div className="Ingreso-Registro">
                <p>¿Recuerdas tu contraseña? <a href="#" className="Link-de-ingreso" onClick={handleOpenLogin}>Ingresar</a></p>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Enlaces a otras páginas */}
      <a href="AdminDashboard" className="admin-link">
        <img src={logoadmin} alt="Acceso Administrador" className="LogoAdmin" />
      </a>

  
    </div>
  );
};

export default LoginPage;
