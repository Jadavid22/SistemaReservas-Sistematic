package com.sistematic.sistemareservas.Servicio;

import com.sistematic.sistemareservas.Modelo.Usuario;
import com.sistematic.sistemareservas.Repositorio.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario crearUsuario(Usuario usuario) {
        // Validación adicional
        if (usuario.getPassword() == null || !usuario.getPassword().startsWith("$2a$")) {
            throw new IllegalStateException("La contraseña debe estar codificada con BCrypt");
        }
        return usuarioRepository.save(usuario);
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
}
