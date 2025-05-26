package com.sistematic.sistemareservas.Controlador;

import com.sistematic.sistemareservas.Modelo.Usuario;
import com.sistematic.sistemareservas.Modelo.Rol;
import com.sistematic.sistemareservas.Servicio.UsuarioService;
import com.sistematic.sistemareservas.Seguridad.JwtUtil;
import com.sistematic.sistemareservas.Seguridad.dto.JwtResponse;
import com.sistematic.sistemareservas.Seguridad.dto.LoginRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    public AuthController(UsuarioService usuarioService, JwtUtil jwtUtil) {
        this.usuarioService = usuarioService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            // Validación de rol
            if (usuario.getRol() == Rol.ADMINISTRADOR) {
                return ResponseEntity.badRequest()
                    .body("No se permite crear usuarios con rol ADMINISTRADOR desde el registro público.");
            }
            
            logger.info("Iniciando registro de usuario: {}", usuario.getEmail());
            
            Usuario creado = usuarioService.crearUsuario(usuario);
            logger.info("Usuario registrado exitosamente: {}", creado.getEmail());
            
            return ResponseEntity.ok(creado);
        } catch (IllegalArgumentException e) {
            logger.warn("Error de validación en registro: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error al registrar usuario: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body("Error al procesar el registro: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            logger.info("Intento de login para usuario: {}", request.getEmail());
            
            if (!usuarioService.verificarCredenciales(request.getEmail(), request.getPassword())) {
                logger.warn("Credenciales inválidas para usuario: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales inválidas");
            }

            Optional<Usuario> usuario = usuarioService.buscarPorEmail(request.getEmail());
            String token = jwtUtil.generarToken(
                usuario.get().getEmail(),
                usuario.get().getRol().name(),
                usuario.get().getId()
            );
            
            logger.info("Login exitoso para usuario: {}", request.getEmail());
            return ResponseEntity.ok(new JwtResponse(token));
        } catch (Exception e) {
            logger.error("Error en login: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body("Error al procesar el login: " + e.getMessage());
        }
    }

    @GetMapping("/test-encode")
    public ResponseEntity<?> testEncode(@RequestParam String password) {
        try {
            String encoded = usuarioService.encodePassword(password);
            boolean matches = usuarioService.verificarPassword(password, encoded);
            
            Map<String, Object> response = new HashMap<>();
            response.put("original", password);
            response.put("encoded", encoded);
            response.put("matches", matches);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error al probar codificación: " + e.getMessage());
        }
    }

    @GetMapping("/debug-encoder")
    public ResponseEntity<?> debugEncoder() {
        String testPassword = "testeo";
        String encoded1 = usuarioService.encodePassword(testPassword);
        String encoded2 = usuarioService.encodePassword(testPassword);
        
        boolean matches1 = usuarioService.verificarPassword(testPassword, encoded1);
        boolean matches2 = usuarioService.verificarPassword(testPassword, encoded2);
        
        Map<String, Object> response = new HashMap<>();
        response.put("encoded1", encoded1);
        response.put("encoded2", encoded2);
        response.put("matches1", matches1);
        response.put("matches2", matches2);
        response.put("encoderClass", usuarioService.getClass().getName());
        
        return ResponseEntity.ok(response);
    }
}
