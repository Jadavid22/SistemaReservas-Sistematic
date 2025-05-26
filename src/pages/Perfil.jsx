import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/Perfil.css';

const Perfil = () => {
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    email: ''
  });
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDatosUsuario({
            nombre: docSnap.data().nombre || '',
            apellido: docSnap.data().apellido || '',
            telefono: docSnap.data().telefono || '',
            direccion: docSnap.data().direccion || '',
            email: user.email || ''
          });
        }

        if (user.photoURL) {
          setPreviewUrl(user.photoURL);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos del usuario');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar el tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen debe ser menor a 10MB');
        return;
      }

      // Crear una URL temporal para la vista previa
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
      setFotoPerfil(file);
      setError(''); // Limpiar cualquier error previo
    }
  };

  const optimizarImagen = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calcular nuevas dimensiones manteniendo la proporción
          const maxSize = 150; // Reducido a 150px para asegurar una URL más corta
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64 con calidad muy reducida
          const base64 = canvas.toDataURL('image/jpeg', 0.2); // Calidad reducida a 0.2
          resolve(base64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const actualizarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMensaje('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      console.log('Iniciando actualización de perfil...');

      // Preparar datos básicos para Firestore
      const userData = {
        nombre: datosUsuario.nombre,
        apellido: datosUsuario.apellido,
        telefono: datosUsuario.telefono,
        direccion: datosUsuario.direccion,
        email: user.email,
        fechaActualizacion: new Date(),
        uid: user.uid
      };

      // Si hay una nueva foto, intentar procesarla
      if (fotoPerfil) {
        console.log('Procesando nueva foto...');
        try {
          // Optimizar la imagen
          const optimizedImage = await optimizarImagen(fotoPerfil);
          
          // Guardar la URL en Firestore
          userData.fotoPerfil = optimizedImage;
          
          // Guardar en Firestore primero
          console.log('Guardando datos en Firestore...');
          const userRef = doc(db, 'usuarios', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (!docSnap.exists()) {
            console.log('Creando nuevo documento en Firestore...');
            await setDoc(userRef, userData);
          } else {
            console.log('Actualizando documento existente en Firestore...');
            await updateDoc(userRef, userData);
          }
          console.log('Datos guardados exitosamente en Firestore');

          // Actualizar el perfil en Auth con una URL más corta
          await updateProfile(user, {
            displayName: `${datosUsuario.nombre} ${datosUsuario.apellido}`,
            photoURL: optimizedImage.substring(0, 1000) // Limitar la longitud de la URL
          });

          setMensaje('Perfil actualizado correctamente');
          setFotoPerfil(null);
        } catch (error) {
          console.error('Error al procesar la foto:', error);
          setError('Error al procesar la foto: ' + error.message);
        }
      } else {
        // Si no hay foto nueva, solo actualizar los datos básicos
        try {
          // Guardar en Firestore
          console.log('Guardando datos en Firestore...');
          const userRef = doc(db, 'usuarios', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (!docSnap.exists()) {
            console.log('Creando nuevo documento en Firestore...');
            await setDoc(userRef, userData);
          } else {
            console.log('Actualizando documento existente en Firestore...');
            await updateDoc(userRef, userData);
          }
          console.log('Datos guardados exitosamente en Firestore');

          // Actualizar el perfil en Auth
          await updateProfile(user, {
            displayName: `${datosUsuario.nombre} ${datosUsuario.apellido}`
          });

          setMensaje('Perfil actualizado correctamente');
        } catch (error) {
          console.error('Error al guardar los datos:', error);
          setError('Error al guardar los datos: ' + error.message);
        }
      }
    } catch (error) {
      console.error('Error en actualizarPerfil:', error);
      setError(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    console.log('Redirigiendo a inicio...');
    navigate('/cliente', { replace: true });
  };

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <button onClick={handleVolver} className="btn-volver">
          Volver al Inicio
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {mensaje && <div className="success-message">{mensaje}</div>}

      <div className="perfil-content">
        <div className="foto-perfil-section">
          <div className="foto-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Foto de perfil" />
            ) : (
              <div className="placeholder-foto">
                <span>Sin foto</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            id="foto-input"
            className="foto-input"
          />
          <label htmlFor="foto-input" className="foto-label">
            Cambiar foto
          </label>
        </div>

        <form onSubmit={actualizarPerfil} className="datos-form">
          <h2>Datos Personales</h2>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={datosUsuario.nombre}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              name="apellido"
              value={datosUsuario.apellido}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={datosUsuario.telefono}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={datosUsuario.direccion}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={datosUsuario.email}
              disabled
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-guardar" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              type="button" 
              className="btn-cambiar-password"
              onClick={() => navigate('/cambiar-contrasena')}
            >
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Perfil; 