const wrapper = document.querySelector('.wrapper');
const LinkIngreso = document.querySelector('.Link-de-ingreso');
const LinkRegistro = document.querySelector('.Link-de-registro');
const loginContainer = document.querySelector('.login-container');
const registerForm = document.querySelector('.form-box.register');

const btnPopup = document.querySelector('.btnLogin-popup');
const IconClose = document.querySelector('.icon-close');

LinkRegistro.addEventListener('click', ()=> {
    loginContainer.classList.remove('active');
    setTimeout(() => {
        loginContainer.style.display = 'none';
        registerForm.style.display = 'block';
        wrapper.classList.add('active');
        setTimeout(() => {
            registerForm.classList.add('active');
        }, 50);
    }, 400);
});

LinkIngreso.addEventListener('click', ()=> {
    registerForm.classList.remove('active');
    setTimeout(() => {
        registerForm.style.display = 'none';
        loginContainer.style.display = 'block';
        wrapper.classList.remove('active');
        setTimeout(() => {
            loginContainer.classList.add('active');
        }, 50);
    }, 400);
});

btnPopup.addEventListener('click', ()=> {
    wrapper.style.transform = 'scale(1)';
    wrapper.classList.add('active-popup');
    loginContainer.style.display = 'block';
    registerForm.style.display = 'none';
    loginContainer.classList.add('active');
});

IconClose.addEventListener('click', ()=> {
    wrapper.classList.remove('active-popup');
    setTimeout(() => {
        loginContainer.classList.remove('active');
        registerForm.classList.remove('active');
        wrapper.style.transform = 'scale(0)';
    }, 400);
});