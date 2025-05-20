package com.sistematic.sistemareservas.Controlador;

import com.sistematic.sistemareservas.Modelo.Reserva;
import com.sistematic.sistemareservas.Modelo.Usuario;
import com.sistematic.sistemareservas.Repositorio.UsuarioRepository;
import com.sistematic.sistemareservas.Servicio.ReservaService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservaService;
    private final UsuarioRepository usuarioRepository;

    public ReservaController(UsuarioRepository usuarioRepository, ReservaService reservaService) {
        this.usuarioRepository = usuarioRepository;
        this.reservaService = reservaService;
    }

    // Crear reserva
    @PostMapping
    public Reserva crearReserva(@RequestBody Reserva reserva, Authentication auth) {
        String email = auth.getName();
        Usuario usuario = usuarioRepository.findFirstByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Asocia automáticamente la reserva al usuario autenticado
        reserva.setUsuario(usuario);
        return reservaService.crearReserva(reserva);
    }

    // Obtener todas las reservas del usuario autenticado
    @GetMapping
    public List<Reserva> getMisReservas(Authentication auth) {
        String email = auth.getName();
        Usuario usuario = usuarioRepository.findFirstByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return reservaService.buscarPorUsuario(usuario.getId());
    }

    // Obtener una reserva específica solo si es del usuario autenticado
    @GetMapping("/{id}")
    public Reserva obtenerMiReserva(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        Usuario usuario = usuarioRepository.findFirstByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Reserva reserva = reservaService.obtenerPorId(id)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!reserva.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para ver esta reserva");
        }

        return reserva;
    }

    // Eliminar una reserva (solo si pertenece al usuario)
    @DeleteMapping("/{id}")
    public void eliminarReserva(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        Usuario usuario = usuarioRepository.findFirstByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Reserva reserva = reservaService.obtenerPorId(id)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!reserva.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No puedes eliminar esta reserva");
        }

        reservaService.eliminarReserva(id);
    }
}
