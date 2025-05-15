package com.sistematic.sistemareservas.Controlador;

import com.sistematic.sistemareservas.Modelo.Usuario;
import com.sistematic.sistemareservas.Modelo.Rol;
import com.sistematic.sistemareservas.Servicio.UsuarioService;
import com.sistematic.sistemareservas.Seguridad.JwtUtil;
import com.sistematic.sistemareservas.Seguridad.dto.JwtResponse;
import com.sistematic.sistemareservas.Seguridad.dto.LoginRequest;
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
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(UsuarioService usuarioService, JwtUtil jwtUtil, 
                        PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        // Validación de rol
        if (usuario.getRol() == Rol.ADMINISTRADOR) {
            return ResponseEntity.badRequest()
                .body("No se permite crear usuarios con rol ADMINISTRADOR desde el registro público.");
        }
        
        // Debug: Mostrar contraseña recibida
        System.out.println("Contraseña recibida en JSON: " + usuario.getPassword());
        
        // Codificación única
        String rawPassword = usuario.getPassword();
        String encodedPassword = passwordEncoder.encode(rawPassword);
        System.out.println("Contraseña codificada: " + encodedPassword);
        
        usuario.setPassword(encodedPassword);
        usuario.setRol(Rol.USUARIO);
        
        try {
            Usuario creado = usuarioService.crearUsuario(usuario);
            System.out.println("Contraseña almacenada en BD: " + creado.getPassword());
            return ResponseEntity.ok(creado);
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("El correo ya está registrado");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Usuario> usuario = usuarioService.buscarPorEmail(request.getEmail());
        
        // Logs seguros (sin mostrar contraseñas reales)
        System.out.println("Intento de login para: " + request.getEmail());
        
        if (usuario.isEmpty() || !passwordEncoder.matches(request.getPassword(), usuario.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }

        String token = jwtUtil.generarToken(usuario.get().getEmail());
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @GetMapping("/test-encode")
    public ResponseEntity<String> testEncode(@RequestParam String password) {
        return ResponseEntity.ok(passwordEncoder.encode(password));
    }
    @GetMapping("/debug-encoder")
    public ResponseEntity<?> debugEncoder() {
        String testPassword = "testeo";
        String encoded1 = passwordEncoder.encode(testPassword);
        String encoded2 = passwordEncoder.encode(testPassword);
        
        boolean matches1 = passwordEncoder.matches(testPassword, encoded1);
        boolean matches2 = passwordEncoder.matches(testPassword, encoded2);
        
        Map<String, Object> response = new HashMap<>();
        response.put("encoded1", encoded1);
        response.put("encoded2", encoded2);
        response.put("matches1", matches1);
        response.put("matches2", matches2);
        response.put("encoderClass", passwordEncoder.getClass().getName());
        
        return ResponseEntity.ok(response);
    }
}
