package com.sistematic.sistemareservas.Controlador;

import com.sistematic.sistemareservas.Modelo.Reserva;
import com.sistematic.sistemareservas.Servicio.ReservaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public Reserva crearReserva(@RequestBody Reserva reserva) {
        return reservaService.crearReserva(reserva);
    }

    @GetMapping
    public List<Reserva> listarReservas() {
        return reservaService.listarReservas();
    }

    @GetMapping("/{id}")
    public Optional<Reserva> obtenerReserva(@PathVariable Long id) {
        return reservaService.obtenerPorId(id);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Reserva> reservasPorUsuario(@PathVariable Long usuarioId) {
        return reservaService.buscarPorUsuario(usuarioId);
    }

    @DeleteMapping("/{id}")
    public void eliminarReserva(@PathVariable Long id) {
        reservaService.eliminarReserva(id);
    }
}
