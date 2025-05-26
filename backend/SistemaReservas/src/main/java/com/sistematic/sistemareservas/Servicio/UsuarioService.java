package com.sistematic.sistemareservas.Servicio;

import com.sistematic.sistemareservas.Modelo.Usuario;
import com.sistematic.sistemareservas.Modelo.Rol;
import com.sistematic.sistemareservas.Repositorio.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public boolean verificarPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public Usuario crearUsuario(Usuario usuario) {
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía");
        }
        
        // Validar y establecer el rol
        if (usuario.getRol() == null) {
            usuario.setRol(Rol.USUARIO);
        }
        
        // Limpiar la contraseña de espacios en blanco
        String rawPassword = usuario.getPassword().trim();
        
        // Validar longitud mínima de la contraseña
        if (rawPassword.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        
        logger.info("Creando usuario con rol: {}", usuario.getRol());
        logger.debug("Encriptando contraseña para usuario: {}", usuario.getEmail());
        
        try {
            // Codificar la contraseña antes de guardar
            String encodedPassword = encodePassword(rawPassword);
            usuario.setPassword(encodedPassword);
            
            // Verificar que la contraseña se haya encriptado correctamente
            if (!verificarPassword(rawPassword, encodedPassword)) {
                logger.error("Error en la verificación de la contraseña encriptada");
                throw new RuntimeException("Error en la encriptación de la contraseña");
            }
            
            logger.debug("Contraseña encriptada correctamente");
            return usuarioRepository.save(usuario);
        } catch (Exception e) {
            logger.error("Error al crear usuario: {}", e.getMessage());
            throw new RuntimeException("Error al crear usuario: " + e.getMessage());
        }
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findFirstByEmail(email);
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public void cambiarPassword(String email, String oldPassword, String newPassword) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El email es requerido");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findFirstByEmail(email);
        if (!usuarioOpt.isPresent()) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();
        
        // Verificar que la contraseña antigua sea correcta
        if (oldPassword == null || oldPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña actual es requerida");
        }
        
        if (!verificarPassword(oldPassword, usuario.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        // Validar la nueva contraseña
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("La nueva contraseña no puede estar vacía");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 6 caracteres");
        }

        if (oldPassword.equals(newPassword)) {
            throw new IllegalArgumentException("La nueva contraseña debe ser diferente a la actual");
        }

        try {
            // Codificar y guardar la nueva contraseña
            String encodedPassword = encodePassword(newPassword);
            usuario.setPassword(encodedPassword);
            usuarioRepository.save(usuario);
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar la contraseña: " + e.getMessage());
        }
    }

    public boolean tienePermiso(String email, String... roles) {
        Optional<Usuario> usuarioOpt = buscarPorEmail(email);
        if (!usuarioOpt.isPresent()) {
            return false;
        }

        Usuario usuario = usuarioOpt.get();
        for (String rol : roles) {
            if (usuario.getRol().name().equals(rol)) {
                return true;
            }
        }
        return false;
    }

    public boolean verificarCredenciales(String email, String password) {
        Optional<Usuario> usuario = buscarPorEmail(email);
        if (!usuario.isPresent()) {
            return false;
        }
        
        try {
            boolean matches = verificarPassword(password, usuario.get().getPassword());
            if (!matches) {
                logger.warn("Contraseña incorrecta para usuario: {}", email);
            }
            return matches;
        } catch (Exception e) {
            logger.error("Error al verificar contraseña: {}", e.getMessage());
            return false;
        }
    }
}
