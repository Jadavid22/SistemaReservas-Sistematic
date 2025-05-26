package com.sistematic.sistemareservas.Repositorio;

import com.sistematic.sistemareservas.Modelo.Reserva;
import com.sistematic.sistemareservas.Modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByUserEmail(String email);
    List<Reserva> findByUsuario(Usuario usuario);
    List<Reserva> findByUsuarioId(Long usuarioId);
    List<Reserva> findByEstado(String estado);
}