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

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties("reservas")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    @JsonIgnoreProperties("reservas")
    private Evento evento;

    @OneToOne
    @JoinColumn(name = "pago_id")
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
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
