package com.sistematic.sistemareservas.Repositorio;

import com.sistematic.sistemareservas.Modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findFirstByEmail(String email);
}