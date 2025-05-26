package com.sistematic.sistemareservas.Modelo;

import java.util.Date;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Date fechaReserva;
    private String estado;
    private String userEmail;
    private Integer cantidad = 1; // Valor por defecto de 1

    @Column(name = "fecha_creacion")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaCreacion = new Date(); // Valor por defecto: fecha actual

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties("reservas")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    @JsonIgnoreProperties("reservas")
    private Evento evento;

    @OneToOne
    @JoinColumn(name = "pago_id", nullable = true)
    @JsonIgnoreProperties("reservas")
    private Pago pago;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getFechaReserva() {
        return fechaReserva;
    }

    public void setFechaReserva(Date fechaReserva) {
        this.fechaReserva = fechaReserva;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad != null ? cantidad : 1;
    }

    public Date getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Date fechaCreacion) {
        this.fechaCreacion = fechaCreacion != null ? fechaCreacion : new Date();
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
        if (usuario != null) {
            this.userEmail = usuario.getEmail();
        }
    }

    public Evento getEvento() {
        return evento;
    }

    public void setEvento(Evento evento) {
        this.evento = evento;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }
}
