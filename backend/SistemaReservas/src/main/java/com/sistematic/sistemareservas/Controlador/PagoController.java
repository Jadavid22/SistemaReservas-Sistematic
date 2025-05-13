package com.sistematic.sistemareservas.Controlador;

import com.sistematic.sistemareservas.Modelo.Pago;
import com.sistematic.sistemareservas.Servicio.PagoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping
    public Pago crearPago(@RequestBody Pago pago) {
        return pagoService.crearPago(pago);
    }

    @GetMapping
    public List<Pago> listarPagos() {
        return pagoService.listarPagos();
    }

    @GetMapping("/{id}")
    public Optional<Pago> obtenerPago(@PathVariable Long id) {
        return pagoService.obtenerPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminarPago(@PathVariable Long id) {
        pagoService.eliminarPago(id);
    }
}

