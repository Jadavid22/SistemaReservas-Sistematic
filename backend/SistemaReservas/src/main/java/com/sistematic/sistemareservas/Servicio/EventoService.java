package com.sistematic.sistemareservas.Servicio;

import com.sistematic.sistemareservas.Modelo.Evento;
import com.sistematic.sistemareservas.Repositorio.EventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class EventoService {
    private static final Logger logger = LoggerFactory.getLogger(EventoService.class);
    private final EventoRepository eventoRepository;

    public EventoService(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    @Transactional
    public Evento crearEvento(Evento evento) {
        logger.info("Recibiendo evento para crear: {}", evento);
        
        // Validaciones básicas
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

        // Inicializar capacidad disponible si no está establecida
        if (evento.getCapacidadDisponible() == null) {
            evento.setCapacidadDisponible(evento.getCapacidad());
        }

        // Asegurar que la capacidad disponible no sea mayor que la capacidad total
        if (evento.getCapacidadDisponible() > evento.getCapacidad()) {
            evento.setCapacidadDisponible(evento.getCapacidad());
        }

        // Establecer destacado como false por defecto si no está especificado
        if (evento.getDestacado() == null) {
            evento.setDestacado(false);
        }

        // Asegurar que los campos opcionales no sean nulos
        if (evento.getCategoria() == null) evento.setCategoria("");
        if (evento.getDescripcion() == null) evento.setDescripcion("");
        if (evento.getHoraInicio() == null) evento.setHoraInicio("");
        if (evento.getHoraFinal() == null) evento.setHoraFinal("");
        if (evento.getUbicacion() == null) evento.setUbicacion("");
        if (evento.getImagen() == null) evento.setImagen("");

        logger.info("Evento procesado antes de guardar: {}", evento);
        
        Evento eventoSaved = eventoRepository.save(evento);
        logger.info("Evento guardado exitosamente: {}", eventoSaved);
        
        return eventoSaved;
    }

    public List<Evento> listarEventos() {
        return eventoRepository.findAll();
    }

    public Optional<Evento> obtenerPorId(Long id) {
        return eventoRepository.findById(id);
    }

    @Transactional
    public void eliminarEvento(Long id) {
        eventoRepository.deleteById(id);
    }

    public List<Evento> findByTipo(String tipo) {
        return eventoRepository.findByTipo(tipo);
    }

    public List<Evento> findByCategoria(String categoria) {
        return eventoRepository.findByCategoria(categoria);
    }

    @Transactional
    public Evento actualizarEvento(Evento evento) {
        logger.info("Recibiendo evento para actualizar: {}", evento);
        
        // Validaciones básicas
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

        // Obtener el evento existente
        Optional<Evento> eventoExistente = eventoRepository.findById(evento.getId());
        if (!eventoExistente.isPresent()) {
            throw new IllegalArgumentException("El evento no existe");
        }

        // Asegurar que la capacidad disponible no sea mayor que la capacidad total
        if (evento.getCapacidadDisponible() > evento.getCapacidad()) {
            evento.setCapacidadDisponible(evento.getCapacidad());
        }

        // Asegurar que los campos opcionales no sean nulos
        if (evento.getCategoria() == null) evento.setCategoria("");
        if (evento.getDescripcion() == null) evento.setDescripcion("");
        if (evento.getHoraInicio() == null) evento.setHoraInicio("");
        if (evento.getHoraFinal() == null) evento.setHoraFinal("");
        if (evento.getUbicacion() == null) evento.setUbicacion("");
        if (evento.getImagen() == null) evento.setImagen("");
        if (evento.getDestacado() == null) evento.setDestacado(false);

        logger.info("Evento procesado antes de actualizar: {}", evento);
        
        Evento eventoActualizado = eventoRepository.save(evento);
        logger.info("Evento actualizado exitosamente: {}", eventoActualizado);
        
        return eventoActualizado;
    }
}
