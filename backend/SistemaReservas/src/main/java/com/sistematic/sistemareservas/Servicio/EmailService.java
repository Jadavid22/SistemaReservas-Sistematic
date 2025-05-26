package com.sistematic.sistemareservas.Servicio;

import com.sistematic.sistemareservas.Modelo.Reserva;
import com.sistematic.sistemareservas.Modelo.Pago;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.text.SimpleDateFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void enviarConfirmacionPago(Reserva reserva, Pago pago) throws MessagingException {
        logger.debug("Iniciando envío de correo de confirmación para reserva ID: {}", reserva.getId());
        
        // Validaciones iniciales
        if (reserva == null) {
            logger.error("Error: La reserva es null");
            throw new IllegalArgumentException("La reserva no puede ser null");
        }

        if (pago == null) {
            logger.error("Error: El pago es null");
            throw new IllegalArgumentException("El pago no puede ser null");
        }

        if (reserva.getUserEmail() == null || reserva.getUserEmail().isEmpty()) {
            logger.error("Error: Email del usuario no disponible para reserva ID: {}", reserva.getId());
            throw new IllegalArgumentException("Email del usuario no disponible");
        }

        if (reserva.getEvento() == null) {
            logger.error("Error: Evento no disponible para reserva ID: {}", reserva.getId());
            throw new IllegalArgumentException("Evento no disponible");
        }

        logger.debug("Preparando mensaje para enviar a: {}", reserva.getUserEmail());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
            
            String contenido = String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2c3e50; text-align: center;">¡Confirmación de Pago y Reserva!</h2>
                        <p>Estimado(a) usuario,</p>
                        <p>Tu pago ha sido procesado exitosamente. Aquí están los detalles:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #2c3e50;">Detalles del Pago:</h3>
                            <ul style="list-style: none; padding-left: 0;">
                                <li>Número de Pago: %d</li>
                                <li>Monto: $%.2f</li>
                                <li>Método de Pago: %s</li>
                                <li>Fecha: %s</li>
                                <li>Estado: %s</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #2c3e50;">Detalles de la Reserva:</h3>
                            <ul style="list-style: none; padding-left: 0;">
                                <li>Evento: %s</li>
                                <li>Fecha del Evento: %s</li>
                                <li>Cantidad de Personas: %d</li>
                                <li>Ubicación: %s</li>
                            </ul>
                        </div>
                        
                        <p style="color: #666;">Guarda este correo como comprobante de tu reserva.</p>
                        <p style="color: #666;">¡Gracias por tu reserva!</p>
                        
                        <div style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
                            <p>Este es un correo automático, por favor no responder.</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                pago.getId(),
                pago.getMonto(),
                pago.getMetodoPago(),
                dateFormat.format(pago.getFecha()),
                pago.getEstado(),
                reserva.getEvento().getNombre(),
                dateFormat.format(reserva.getEvento().getFecha()),
                reserva.getCantidad(),
                reserva.getEvento().getUbicacion()
            );

            helper.setTo(reserva.getUserEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Confirmación de Reserva - Sistematic");
            helper.setText(contenido, true);

            logger.debug("Configuración del mensaje completada, intentando enviar a: {}", reserva.getUserEmail());
            
            try {
                mailSender.send(message);
                logger.info("Correo enviado exitosamente a: {}", reserva.getUserEmail());
            } catch (Exception e) {
                logger.error("Error al enviar el correo: {}", e.getMessage());
                logger.error("Detalles técnicos:", e);
                throw new MessagingException("Error al enviar el correo: " + e.getMessage());
            }
            
        } catch (Exception e) {
            logger.error("Error al preparar o enviar el correo a {}: {}", reserva.getUserEmail(), e.getMessage());
            logger.error("Detalles técnicos:", e);
            throw new MessagingException("Error al preparar o enviar el correo: " + e.getMessage());
        }
    }
} 