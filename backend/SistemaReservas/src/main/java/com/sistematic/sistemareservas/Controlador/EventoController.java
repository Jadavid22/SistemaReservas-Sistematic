package com.sistematic.sistemareservas.Controlador;

import com.sistematic.sistemareservas.Modelo.Evento;
import com.sistematic.sistemareservas.Servicio.EventoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/eventos")
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class EventoController {
    private static final Logger logger = LoggerFactory.getLogger(EventoController.class);
    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @PostMapping
    public ResponseEntity<?> crearEvento(@RequestBody Evento evento) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("Recibiendo solicitud para crear evento: {}", evento);
            
            // Validar campos requeridos
            if (evento.getNombre() == null || evento.getNombre().trim().isEmpty()) {
                throw new IllegalArgumentException("El nombre del evento es requerido");
            }
            if (evento.getTipo() == null || evento.getTipo().trim().isEmpty()) {
                throw new IllegalArgumentException("El tipo del evento es requerido");
            }
            if (evento.getFecha() == null) {
                throw new IllegalArgumentException("La fecha del evento es requerida");
            }
            if (evento.getCapacidad() == null || evento.getCapacidad() <= 0) {
                throw new IllegalArgumentException("La capacidad debe ser mayor a 0");
            }
            if (evento.getPrecio() == null || evento.getPrecio() < 0) {
                throw new IllegalArgumentException("El precio no puede ser negativo");
            }

            Evento eventoCreado = eventoService.crearEvento(evento);
            logger.info("Evento creado exitosamente: {}", eventoCreado);
            
            response.put("success", true);
            response.put("data", eventoCreado);
            response.put("message", "Evento creado exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación al crear evento: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Error inesperado al crear evento", e);
            response.put("success", false);
            response.put("error", "Error al crear el evento: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<?> listarEventos() {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("Recibiendo solicitud para listar eventos");
            List<Evento> eventos = eventoService.listarEventos();
            logger.info("Eventos encontrados: {}", eventos.size());
            response.put("success", true);
            response.put("data", eventos);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error al listar eventos", e);
            response.put("success", false);
            response.put("error", "Error al listar eventos: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerEvento(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("Recibiendo solicitud para obtener evento con id: {}", id);
            Optional<Evento> evento = eventoService.obtenerPorId(id);
            if (evento.isPresent()) {
                logger.info("Evento encontrado: {}", evento.get());
                response.put("success", true);
                response.put("data", evento.get());
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Evento no encontrado con id: {}", id);
                response.put("success", false);
                response.put("error", "Evento no encontrado");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error al obtener evento con id: {}", id, e);
            response.put("success", false);
            response.put("error", "Error al obtener el evento: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<?> obtenerEventosPorTipo(@PathVariable String tipo) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("Recibiendo solicitud para obtener eventos por tipo: {}", tipo);
            List<Evento> eventos = eventoService.findByTipo(tipo);
            logger.info("Eventos encontrados para tipo {}: {}", tipo, eventos.size());
            response.put("success", true);
            response.put("data", eventos);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error al obtener eventos por tipo: {}", tipo, e);
            response.put("success", false);
            response.put("error", "Error al obtener los eventos por tipo: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<?> obtenerEventosPorCategoria(@PathVariable String categoria) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("Recibiendo solicitud para obtener eventos por categoría: {}", categoria);
            
            // Validar que la categoría no sea nula o vacía
            if (categoria == null || categoria.trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "La categoría no puede estar vacía");
                return ResponseEntity.badRequest().body(response);
            }
            
            List<Evento> eventos = eventoService.findByCategoria(categoria);
            logger.info("Eventos encontrados para categoría {}: {}", categoria, eventos.size());
            
            response.put("success", true);
            response.put("data", eventos);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error al obtener eventos por categoría: {}", categoria, e);
            response.put("success", false);
            response.put("error", "Error al obtener los eventos por categoría: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEvento(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("Recibiendo solicitud para eliminar evento con id: {}", id);
            
            // Verificar si el evento existe
            Optional<Evento> evento = eventoService.obtenerPorId(id);
            if (!evento.isPresent()) {
                logger.warn("Evento no encontrado con id: {}", id);
                response.put("success", false);
                response.put("error", "Evento no encontrado");
                return ResponseEntity.status(404).body(response);
            }

            eventoService.eliminarEvento(id);
            logger.info("Evento eliminado exitosamente con id: {}", id);
            
            response.put("success", true);
            response.put("message", "Evento eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error al eliminar evento con id: {}", id, e);
            response.put("success", false);
            response.put("error", "Error al eliminar el evento: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/{id}")
    @ResponseBody
    public ResponseEntity<?> actualizarEvento(@PathVariable Long id, @RequestBody Evento evento) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("Recibiendo solicitud para actualizar evento con id: {}", id);
            logger.info("Datos del evento a actualizar: {}", evento);

            // Validar que el evento exista
            Optional<Evento> eventoExistente = eventoService.obtenerPorId(id);
            if (!eventoExistente.isPresent()) {
                logger.warn("Evento no encontrado con id: {}", id);
                response.put("success", false);
                response.put("error", "Evento no encontrado");
                return ResponseEntity.notFound().build();
            }

            // Actualizar el evento
            evento.setId(id);
            Evento eventoActualizado = eventoService.actualizarEvento(evento);
            logger.info("Evento actualizado exitosamente: {}", eventoActualizado);

            response.put("success", true);
            response.put("data", eventoActualizado);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación al actualizar evento: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Error inesperado al actualizar evento", e);
            response.put("success", false);
            response.put("error", "Error al actualizar el evento: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

