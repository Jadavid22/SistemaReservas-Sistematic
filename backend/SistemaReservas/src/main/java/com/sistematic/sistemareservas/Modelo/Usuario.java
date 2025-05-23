package com.sistematic.sistemareservas.Modelo;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class Usuario {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Rol rol;
    private String nombre;
    @Column(unique = true)
    private String email;
    @Column(length = 60) 
    private String password;

    @OneToMany(mappedBy = "usuario")
    @JsonIgnore
    private List<Reserva> reservas;

    public Long getId(){
        return this.id;
    }
    public void setId(long id){
        this.id= id;
    }

    public String getNombre(){
        return this.nombre;
    }
    public void setNombre(String nombre){
        this.nombre= nombre;
    }

    public String getEmail(){
        return this.email;
    }
    public void setEmail(String email){
        this.email= email;
    }

    public String getPassword(){
        return this.password;
    }
    public void setPassword(String password) {
        // Validación básica para evitar hashes corruptos
        if (password != null && password.startsWith("$2a$")) {
            if (password.length() != 60) {
                throw new IllegalArgumentException("Formato de hash BCrypt inválido");
            }
        }
        this.password = password;
    }

    public Rol getRol() {
    return this.rol;
    }
    public void setRol(Rol rol) {
        this.rol = rol;
    }
}
