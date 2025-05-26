package com.sistematic.sistemareservas.Modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String metodo;
    private Double monto;
    private String estado;
    private Date fecha;
    private String metodoPago;

    @OneToOne(mappedBy = "pago")
    @JsonIgnore
    private Reserva reserva;

    public Pago() {
        this.fecha = new Date();
        this.estado = "CONFIRMADO"; // Cambiamos el estado por defecto a CONFIRMADO
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public Double getMonto() {
        return monto;
    }

    public void setMonto(Double monto) {
        this.monto = monto;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }
}
