package com.sistematic.sistemareservas.Repositorio;

import com.sistematic.sistemareservas.Modelo.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByTipo(String tipo);
    List<Evento> findByFechaAfter(Date fecha);
}