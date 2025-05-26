document.addEventListener('DOMContentLoaded', function() {
    // Manejar el envío del formulario
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Aquí iría la lógica para enviar el formulario
            showNotification('Mensaje enviado correctamente');
            contactForm.reset();
        });
    }

    // Manejar el botón de chat
    const chatBtn = document.querySelector('.chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', function() {
            showNotification('Iniciando chat con soporte...');
            // Aquí iría la lógica para iniciar el chat
        });
    }

    // Función para mostrar notificaciones
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        }, 100);
    }
}); 