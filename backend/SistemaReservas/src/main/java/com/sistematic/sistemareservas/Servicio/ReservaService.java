package com.sistematic.sistemareservas.Servicio;

import com.sistematic.sistemareservas.Modelo.Evento;
import com.sistematic.sistemareservas.Modelo.Reserva;
import com.sistematic.sistemareservas.Modelo.Usuario;
import com.sistematic.sistemareservas.Modelo.Pago;
import com.sistematic.sistemareservas.Repositorio.ReservaRepository;
import com.sistematic.sistemareservas.Repositorio.EventoRepository;
import com.sistematic.sistemareservas.Repositorio.PagoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ReservaService {
    private final ReservaRepository reservaRepository;
    private final EventoRepository eventoRepository;
    private final PagoRepository pagoRepository;
    private final EmailService emailService;
    private static final Logger logger = LoggerFactory.getLogger(ReservaService.class);

    public ReservaService(ReservaRepository reservaRepository, 
                         EventoRepository eventoRepository,
                         PagoRepository pagoRepository,
                         EmailService emailService) {
        this.reservaRepository = reservaRepository;
        this.eventoRepository = eventoRepository;
        this.pagoRepository = pagoRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Reserva crearReservaConPago(Reserva reserva, Pago pago) {
        logger.info("Iniciando creación de reserva con pago");
        
        // Validar que el evento exista y tenga capacidad disponible
        Evento evento = eventoRepository.findById(reserva.getEvento().getId())
            .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado"));

        if (evento.getCapacidadDisponible() < reserva.getCantidad()) {
            throw new IllegalStateException("No hay suficiente capacidad disponible");
        }

        try {
            // Actualizar la capacidad disponible del evento
            evento.setCapacidadDisponible(evento.getCapacidadDisponible() - reserva.getCantidad());
            eventoRepository.save(evento);
            logger.debug("Capacidad del evento actualizada");

            // Establecer estado y fecha de la reserva
            reserva.setEstado("CONFIRMADA");
            reserva.setFechaReserva(new Date());
            
            // Configurar el estado del pago
            pago.setEstado("CONFIRMADO");
            pago.setFecha(new Date());
            
            // Guardar el pago
            pago = pagoRepository.save(pago);
            logger.debug("Pago guardado con ID: {} y estado: {}", pago.getId(), pago.getEstado());
            
            // Asociar el pago con la reserva
            reserva.setPago(pago);
            
            // Guardar la reserva
            Reserva reservaGuardada = reservaRepository.save(reserva);
            logger.info("Reserva guardada exitosamente con ID: {} y estado: {}", 
                       reservaGuardada.getId(), reservaGuardada.getEstado());

            // Enviar correo de confirmación
            try {
                logger.debug("Intentando enviar correo de confirmación");
                emailService.enviarConfirmacionPago(reservaGuardada, pago);
                logger.info("Correo de confirmación enviado exitosamente");
            } catch (Exception e) {
                // Log el error pero no interrumpir la transacción
                logger.error("Error al enviar correo de confirmación: {}", e.getMessage());
                logger.error("Detalles del error:", e);
                // No lanzar la excepción para no revertir la transacción
            }

            return reservaGuardada;
            
        } catch (Exception e) {
            logger.error("Error al procesar la reserva: {}", e.getMessage());
            logger.error("Detalles del error:", e);
            throw e;
        }
    }

    public List<Reserva> obtenerReservasPorUsuario(String email) {
        return reservaRepository.findByUserEmail(email);
    }

    public Optional<Reserva> obtenerReservaPorId(Long id) {
        return reservaRepository.findById(id);
    }

    public List<Reserva> obtenerTodasLasReservas() {
        return reservaRepository.findAll();
    }

    @Transactional
    public void cancelarReserva(Long id) {
        logger.info("Iniciando cancelación de reserva ID: {}", id);
        
        Reserva reserva = reservaRepository.findById(id)
            .orElseThrow(() -> {
                logger.error("Reserva no encontrada con ID: {}", id);
                return new EntityNotFoundException("Reserva no encontrada");
            });

        try {
            // Devolver la capacidad al evento
            Evento evento = reserva.getEvento();
            if (evento != null) {
                logger.debug("Actualizando capacidad del evento ID: {}", evento.getId());
                evento.setCapacidadDisponible(evento.getCapacidadDisponible() + reserva.getCantidad());
                eventoRepository.save(evento);
                logger.debug("Capacidad del evento actualizada exitosamente");
            }

            // Actualizar estado de la reserva
            reserva.setEstado("CANCELADA");
            reservaRepository.save(reserva);
            logger.info("Reserva ID: {} cancelada exitosamente", id);
            
        } catch (Exception e) {
            logger.error("Error al cancelar reserva ID: {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error al cancelar la reserva: " + e.getMessage());
        }
    }

    @Transactional
    public Reserva actualizarReserva(Reserva reserva) {
        // Validar que la reserva exista
        Reserva reservaExistente = reservaRepository.findById(reserva.getId())
            .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada"));

        // Actualizar solo los campos permitidos
        reservaExistente.setEstado(reserva.getEstado());
        
        // Si hay cambio en la cantidad, actualizar la capacidad del evento
        if (!reservaExistente.getCantidad().equals(reserva.getCantidad())) {
            Evento evento = reservaExistente.getEvento();
            // Calcular la diferencia de capacidad
            int diferencia = reserva.getCantidad() - reservaExistente.getCantidad();
            evento.setCapacidadDisponible(evento.getCapacidadDisponible() - diferencia);
            eventoRepository.save(evento);
            reservaExistente.setCantidad(reserva.getCantidad());
        }

        // Guardar la reserva actualizada
        Reserva reservaActualizada = reservaRepository.save(reservaExistente);

        // Si el estado cambia a COMPLETADO, enviar correo de confirmación
        if ("COMPLETADO".equals(reserva.getEstado()) && !reserva.getEstado().equals(reservaExistente.getEstado())) {
            try {
                logger.info("Enviando correo de confirmación para reserva ID: {}", reservaActualizada.getId());
                emailService.enviarConfirmacionPago(reservaActualizada, reservaActualizada.getPago());
                logger.info("Correo de confirmación enviado exitosamente");
            } catch (Exception e) {
                // Log el error pero no interrumpir la transacción
                logger.error("Error al enviar correo de confirmación: {}", e.getMessage(), e);
            }
        }

        return reservaActualizada;
    }
}
