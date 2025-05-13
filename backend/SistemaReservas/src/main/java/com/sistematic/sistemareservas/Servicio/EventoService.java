package com.sistematic.sistemareservas.Servicio;

import com.sistematic.sistemareservas.Modelo.Evento;
import com.sistematic.sistemareservas.Repositorio.EventoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;

    public EventoService(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    public Evento crearEvento(Evento evento) {
        return eventoRepository.save(evento);
    }

    public List<Evento> listarEventos() {
        return eventoRepository.findAll();
    }

    public Optional<Evento> obtenerPorId(Long id) {
        return eventoRepository.findById(id);
    }

    public void eliminarEvento(Long id) {
        eventoRepository.deleteById(id);
    }
}
