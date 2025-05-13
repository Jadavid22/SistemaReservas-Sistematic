package com.sistematic.sistemareservas.Repositorio;

import com.sistematic.sistemareservas.Modelo.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByUsuarioId(Long usuarioId);
    List<Reserva> findByEstado(String estado);
}