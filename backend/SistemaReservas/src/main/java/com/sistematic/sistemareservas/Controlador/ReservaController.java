package com.sistematic.sistemareservas.Controlador;

import com.sistematic.sistemareservas.Modelo.Reserva;
import com.sistematic.sistemareservas.Modelo.Pago;
import com.sistematic.sistemareservas.Modelo.Evento;
import com.sistematic.sistemareservas.Servicio.ReservaService;
import com.sistematic.sistemareservas.Servicio.EventoService;
import com.sistematic.sistemareservas.Seguridad.JwtUtil;
import com.sistematic.sistemareservas.Servicio.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.Date;

@RestController
@RequestMapping("/reservas")
@CrossOrigin(origins = "http://localhost:3000")
public class ReservaController {
    private static final Logger logger = LoggerFactory.getLogger(ReservaController.class);
    private final ReservaService reservaService;
    private final EventoService eventoService;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public ReservaController(ReservaService reservaService, EventoService eventoService, JwtUtil jwtUtil, EmailService emailService) {
        this.reservaService = reservaService;
        this.eventoService = eventoService;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> crearReservaConPago(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("Recibiendo solicitud para crear reserva con pago");
            
            // Obtener el token del header
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Token no proporcionado");
            }
            String token = authHeader.substring(7);
            
            // Validar el token y obtener el email del usuario
            String userEmail = jwtUtil.extraerEmail(token);
            if (userEmail == null) {
                throw new IllegalArgumentException("Token inválido");
            }
            
            logger.info("Usuario autenticado: {}", userEmail);

            // Validar que los objetos necesarios estén presentes
            if (!request.containsKey("reserva") || !request.containsKey("pago")) {
                throw new IllegalArgumentException("Se requieren los datos de reserva y pago");
            }

            // Mapear los datos de la reserva
            Map<String, Object> reservaData = (Map<String, Object>) request.get("reserva");
            Reserva reserva = new Reserva();
            
            // Establecer los campos de la reserva
            reserva.setFechaReserva(new Date());
            reserva.setEstado("CONFIRMADA");
            reserva.setCantidad(((Number) reservaData.get("cantidad")).intValue());
            reserva.setUserEmail(userEmail);

            // Obtener y establecer el evento
            Long eventoId = ((Number) reservaData.get("evento_id")).longValue();
            Evento evento = eventoService.obtenerPorId(eventoId)
                .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado con ID: " + eventoId));
            reserva.setEvento(evento);

            // Mapear los datos del pago
            Map<String, Object> pagoData = (Map<String, Object>) request.get("pago");
            Pago pago = new Pago();
            
            pago.setMetodo((String) pagoData.get("metodo"));
            pago.setMonto(((Number) pagoData.get("monto")).doubleValue());
            pago.setEstado("CONFIRMADO");
            pago.setMetodoPago((String) pagoData.get("metodoPago"));
            pago.setFecha(new Date());

            // Guardar la reserva y el pago
            Reserva reservaCreada = reservaService.crearReservaConPago(reserva, pago);
            
            response.put("success", true);
            response.put("message", "Reserva creada exitosamente");
            response.put("data", Map.of(
                "reserva", reservaCreada,
                "pago", Map.of(
                    "id", reservaCreada.getPago().getId(),
                    "monto", reservaCreada.getPago().getMonto(),
                    "estado", reservaCreada.getPago().getEstado(),
                    "urlPago", "/pagos/procesar/" + reservaCreada.getId()
                )
            ));
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (EntityNotFoundException e) {
            logger.error("Entidad no encontrada: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error al crear la reserva: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "Error al procesar la reserva: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerTodasLasReservas() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Reserva> reservas = reservaService.obtenerTodasLasReservas();
            response.put("success", true);
            response.put("data", reservas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error al obtener las reservas: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "Error al obtener las reservas: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerReservaPorId(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Reserva> reserva = reservaService.obtenerReservaPorId(id);
            if (reserva.isPresent()) {
                response.put("success", true);
                response.put("data", reserva.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Reserva no encontrada");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error al obtener la reserva: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "Error al obtener la reserva: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/usuario/{email}")
    public ResponseEntity<?> obtenerReservasPorUsuario(@PathVariable String email, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Obtener el token del header
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Token no proporcionado");
            }
            String token = authHeader.substring(7);
            
            // Validar el token y obtener el email del usuario
            String userEmail = jwtUtil.extraerEmail(token);
            if (userEmail == null) {
                throw new IllegalArgumentException("Token inválido");
            }
            
            // Verificar que el usuario solo pueda ver sus propias reservas
            if (!userEmail.equals(email)) {
                logger.error("Usuario {} intentó acceder a las reservas de {}", userEmail, email);
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "error", "No tiene permisos para ver estas reservas"
                ));
            }

            List<Reserva> reservas = reservaService.obtenerReservasPorUsuario(email);
            response.put("success", true);
            response.put("data", reservas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error al obtener las reservas del usuario: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "Error al obtener las reservas: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            reservaService.cancelarReserva(id);
            response.put("success", true);
            response.put("message", "Reserva cancelada exitosamente");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            logger.error("Reserva no encontrada: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error al cancelar la reserva: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "Error al cancelar la reserva: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/{id}/completar")
    public ResponseEntity<?> completarReserva(@PathVariable Long id, @RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        boolean emailSent = false;
        
        try {
            // Validar el token
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Token no proporcionado");
            }
            String token = authHeader.substring(7);
            
            // Extraer y validar el email del usuario
            String tokenEmail = jwtUtil.extraerEmail(token);
            String requestEmail = request.get("userEmail");
            
            if (tokenEmail == null || !tokenEmail.equals(requestEmail)) {
                logger.error("Usuario no autorizado: {} intentó completar reserva de {}", tokenEmail, requestEmail);
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "error", "No tiene permisos para completar esta reserva"
                ));
            }

            // Obtener y validar la reserva
            Optional<Reserva> reservaOpt = reservaService.obtenerReservaPorId(id);
            if (reservaOpt.isEmpty()) {
                throw new EntityNotFoundException("Reserva no encontrada con ID: " + id);
            }

            Reserva reserva = reservaOpt.get();
            
            // Validar que la reserva pertenezca al usuario
            if (!reserva.getUserEmail().equals(requestEmail)) {
                logger.error("Usuario {} intentó completar reserva de otro usuario", requestEmail);
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "error", "No tiene permisos para completar esta reserva"
                ));
            }

            // Actualizar el estado de la reserva
            reserva.setEstado("COMPLETADO");
            Reserva reservaActualizada = reservaService.actualizarReserva(reserva);

            // Enviar correo de confirmación
            try {
                emailService.enviarConfirmacionPago(reservaActualizada, reservaActualizada.getPago());
                emailSent = true;
                logger.info("Correo de confirmación enviado exitosamente para la reserva ID: {}", id);
            } catch (Exception e) {
                logger.error("Error al enviar correo de confirmación: {}", e.getMessage());
                emailSent = false;
            }

            response.put("success", true);
            response.put("message", emailSent ? 
                "Reserva completada y correo enviado exitosamente" : 
                "Reserva completada pero hubo un problema al enviar el correo");
            response.put("data", reservaActualizada);
            response.put("emailSent", emailSent);
            
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            logger.error("Reserva no encontrada: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Error al completar la reserva: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "Error al completar la reserva: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
