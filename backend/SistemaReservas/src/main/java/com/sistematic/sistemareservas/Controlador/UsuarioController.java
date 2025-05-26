package com.sistematic.sistemareservas.Controlador;

import com.sistematic.sistemareservas.Modelo.Usuario;
import com.sistematic.sistemareservas.Servicio.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:3000")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        return usuarioService.crearUsuario(usuario);
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/{id}")
    public Optional<Usuario> obtenerUsuario(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id);
    }

    @GetMapping("/me")
    public ResponseEntity<?> obtenerUsuarioActual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            
            Optional<Usuario> usuario = usuarioService.buscarPorEmail(email);
            if (!usuario.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(usuario.get());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener información del usuario: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
    }

    @PostMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> passwordData) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                return ResponseEntity.status(401).body("Usuario no autenticado");
            }
            
            String email = auth.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(401).body("No se pudo obtener el email del usuario");
            }
            
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Se requieren ambas contraseñas");
            }
            
            usuarioService.cambiarPassword(email, oldPassword, newPassword);
            return ResponseEntity.ok().body("Contraseña actualizada exitosamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al cambiar la contraseña: " + e.getMessage());
        }
    }
}

