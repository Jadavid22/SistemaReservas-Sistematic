package com.sistematic.sistemareservas.Controlador;
import com.sistematic.sistemareservas.Servicio.*;
import com.sistematic.sistemareservas.Modelo.Pago;
import com.sistematic.sistemareservas.Modelo.Usuario;
import com.sistematic.sistemareservas.Seguridad.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/pagos")
public class PagoController {

    @Autowired
    private JwtUtil jwtUtil;
    private final PagoService pagoService;
    private final UsuarioService usuarioService;

    public PagoController(PagoService pagoService, UsuarioService usuarioService) {
        this.pagoService = pagoService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public Pago crearPago(@RequestBody Pago pago, @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromToken(authHeader);
        Usuario usuario = usuarioService.buscarPorEmail(email).orElseThrow();
        pago.setUsuario(usuario);
        return pagoService.crearPago(pago);
    }

    @GetMapping
    public List<Pago> listarPagos(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromToken(authHeader);
        Usuario usuario = usuarioService.buscarPorEmail(email).orElseThrow();
        return pagoService.listarPagosPorUsuario(usuario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pago> obtenerPago(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromToken(authHeader);
        Usuario usuario = usuarioService.buscarPorEmail(email).orElseThrow();

        Optional<Pago> pago = pagoService.obtenerPorId(id);
        if (pago.isPresent() && pago.get().getUsuario().getId().equals(usuario.getId())) {
            return ResponseEntity.ok(pago.get());
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPago(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromToken(authHeader);
        Usuario usuario = usuarioService.buscarPorEmail(email).orElseThrow();

        Optional<Pago> pago = pagoService.obtenerPorId(id);
        if (pago.isPresent() && pago.get().getUsuario().getId().equals(usuario.getId())) {
            pagoService.eliminarPago(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

   private String extractEmailFromToken(String authHeader) {
    String token = authHeader.replace("Bearer ", "");
    return jwtUtil.extractEmail(token);
    }

}
