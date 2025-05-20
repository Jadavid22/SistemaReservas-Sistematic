package com.sistematic.sistemareservas.Repositorio;

import com.sistematic.sistemareservas.Modelo.Pago;
import com.sistematic.sistemareservas.Modelo.Usuario;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByUsuario(Usuario usuario);

}
