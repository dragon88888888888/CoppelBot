// ==============================================
// SERVICE WORKER REGISTRATION
// ==============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration.scope);

                // Manejar actualizaciones
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            mostrarNotificacionActualizacion();
                        }
                    });
                });
            })
            .catch(err => {
                console.error('Error al registrar ServiceWorker:', err);
            });
    });
}

// ==============================================
// FUNCIONES DE UTILIDAD
// ==============================================
function mostrarNotificacionActualizacion() {
    const notificacion = document.createElement('div');
    notificacion.className = 'notification update';
    notificacion.innerHTML = `
        <p>¡Nueva versión disponible!</p>
        <button id="reload-btn" class="btn-notification">Actualizar ahora</button>
    `;
    document.body.appendChild(notificacion);
    
    document.getElementById('reload-btn').addEventListener('click', () => {
        window.location.reload();
    });
}

function manejarEstadoConexion() {
    if (!navigator.onLine) {
        mostrarNotificacionOffline();
    }
}

function mostrarNotificacionOffline() {
    const notificacion = document.createElement('div');
    notificacion.className = 'notification offline';
    notificacion.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>Trabajando en modo offline</span>
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('fade-out');
        setTimeout(() => notificacion.remove(), 500);
    }, 5000);
}

function mostrarNotificacionOnline() {
    const notificacion = document.createElement('div');
    notificacion.className = 'notification online';
    notificacion.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Conexión restablecida</span>
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('fade-out');
        setTimeout(() => notificacion.remove(), 500);
    }, 3000);
    
    // Sincronizar datos pendientes
    sincronizarDatos();
}

function sincronizarDatos() {
    console.log('Sincronizando datos con el servidor...');
    // Aquí implementarías la lógica de sincronización
}

// ==============================================
// MANEJO DE AUTENTICACIÓN
// ==============================================
function verificarAutenticacion() {
    const paginasPublicas = ['index.html', '/'];
    const rutaActual = window.location.pathname;

    // Si estamos en una página pública, no hacemos nada
    if (paginasPublicas.some(pagina => rutaActual.endsWith(pagina) || rutaActual === pagina)) {
        return;
    }

    const estaAutenticado = localStorage.getItem('loggedIn') === 'true';
    const tipoUsuario = localStorage.getItem('userType');

    if (!estaAutenticado) {
        // Redirigir al login si no está autenticado y no está en index.html
        window.location.href = 'index.html';
    } else {
        // Verificar que el usuario esté en la página correcta según su tipo
        let paginaCorrecta = '';
        switch (tipoUsuario) {
            case 'empleado':
                paginaCorrecta = 'empleado.html';
                break;
            case 'microempresario':
                paginaCorrecta = 'microempresario.html';
                break;
            case 'administrador': // Nueva condición
                paginaCorrecta = 'administrador.html';
                break;
            default:
                // Tipo de usuario desconocido, redirigir a index
                localStorage.clear(); // Limpiar estado inválido
                window.location.href = 'index.html';
                return;
        }

        if (!rutaActual.endsWith(paginaCorrecta)) {
            console.log(`Redirigiendo de ${rutaActual} a ${paginaCorrecta} para usuario ${tipoUsuario}`);
            window.location.href = paginaCorrecta;
        }
    }
}

function autenticarUsuario(tipoUsuario, credenciales) {
    return new Promise((resolve, reject) => {
        // Simulamos una autenticación con delay
        console.log(`Intentando autenticar como ${tipoUsuario} con credenciales:`, credenciales); // Debug
        setTimeout(() => {
            // Aquí normalmente harías una llamada a tu backend
            // Para este ejemplo, simulamos una autenticación exitosa si se proporcionan credenciales

            let autenticado = false;
            let errorMsg = 'Credenciales inválidas o faltantes.';

            // Validación básica y simulación de éxito
            switch (tipoUsuario) {
                case 'microempresario':
                    if (credenciales.email && credenciales.password) {
                        // TODO: Validar contra BD real
                        if (credenciales.email.includes('@') && credenciales.password.length > 3) { // Simulación simple
                            autenticado = true;
                            localStorage.setItem('userEmail', credenciales.email); // Guardar email
                        } else {
                            errorMsg = "Formato de email o contraseña inválido.";
                        }
                    } else {
                        errorMsg = 'Email y contraseña son requeridos';
                    }
                    break;
                case 'empleado':
                    if (credenciales.employeeNumber && credenciales.password) {
                        // TODO: Validar contra BD real
                        if (credenciales.employeeNumber.startsWith('E') && credenciales.password.length > 3) { // Simulación simple
                            autenticado = true;
                            localStorage.setItem('employeeNumber', credenciales.employeeNumber); // Guardar número empleado
                        } else {
                            errorMsg = "Formato de número de empleado o contraseña inválido.";
                        }
                    } else {
                        errorMsg = 'Número de empleado y contraseña son requeridos';
                    }
                    break;
                case 'administrador': // Nueva lógica
                    if (credenciales.adminId && credenciales.password) {
                        // TODO: Validar contra BD real
                        if (credenciales.adminId.startsWith('A') && credenciales.password.length > 3) { // Simulación simple
                            autenticado = true;
                            localStorage.setItem('adminId', credenciales.adminId); // Guardar ID admin
                        } else {
                            errorMsg = "Formato de matrícula o contraseña inválido.";
                        }
                    } else {
                        errorMsg = 'Matrícula de administrador y contraseña son requeridos';
                    }
                    break;
                default:
                    errorMsg = 'Tipo de usuario desconocido';
                    reject(new Error(errorMsg));
                    return;
            }

            if (autenticado) {
                // Guardamos el estado de autenticación
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('userType', tipoUsuario);
                console.log(`Autenticación exitosa como ${tipoUsuario}`); // Debug
                resolve({ success: true });
            } else {
                console.error(`Error de autenticación para ${tipoUsuario}: ${errorMsg}`); // Debug
                reject(new Error(errorMsg));
            }

        }, 1000); // Simulación de 1 segundo
    });
}


// ==============================================
// MANEJO DE FORMULARIOS DE LOGIN
// ==============================================
function configurarLoginForms() {
    // Configurar formulario de microempresario
    const microForm = document.getElementById('microempresarioForm');
    if (microForm) {
        microForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<div class="loader"></div>'; // Usar loader

                const email = document.getElementById('micro-email').value;
                const password = document.getElementById('micro-password').value;

                await autenticarUsuario('microempresario', { email, password });
                window.location.href = 'microempresario.html';
            } catch (error) {
                console.error('Error en autenticación microempresario:', error);
                alert(error.message || 'Error en autenticación. Por favor intenta nuevamente.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
            // No necesitamos finally si la redirección siempre ocurre en éxito
        });
    }

    // Configurar formulario de empleado
    const empForm = document.getElementById('empleadoForm');
    if (empForm) {
        empForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<div class="loader"></div>'; // Usar loader

                const employeeNumber = document.getElementById('employee-number').value;
                const password = document.getElementById('employee-password').value;

                await autenticarUsuario('empleado', { employeeNumber, password });
                window.location.href = 'empleado.html';
            } catch (error) {
                console.error('Error en autenticación empleado:', error);
                alert(error.message || 'Error en autenticación. Por favor intenta nuevamente.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // Configurar formulario de administrador (NUEVO)
    const adminForm = document.getElementById('administradorForm');
    if (adminForm) {
        adminForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<div class="loader"></div>'; // Usar loader

                const adminId = document.getElementById('admin-id').value;
                const password = document.getElementById('admin-password').value;

                await autenticarUsuario('administrador', { adminId, password });
                window.location.href = 'administrador.html';
            } catch (error) {
                console.error('Error en autenticación administrador:', error);
                alert(error.message || 'Error en autenticación. Por favor intenta nuevamente.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
}

// ==============================================
// FUNCIONALIDAD COMÚN
// ==============================================
function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (input && button) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.innerHTML = isPassword
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#005AA3"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>' // Ojo abierto
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#005AA3"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'; // Ojo cerrado
    }
}

// ==============================================
// MANEJO DE ESTADO DE LA APLICACIÓN
// ==============================================
function guardarEstadoApp() {
    const ruta = window.location.pathname;
    const seccionActivaElement = document.querySelector('.dashboard-section.active');

    if (seccionActivaElement) {
        const seccionActivaId = seccionActivaElement.id;
        if (ruta.endsWith('empleado.html')) {
            localStorage.setItem('empleadoActiveSection', seccionActivaId);
        } else if (ruta.endsWith('microempresario.html')) {
            localStorage.setItem('microempresarioActiveSection', seccionActivaId);
        } else if (ruta.endsWith('administrador.html')) { // Nuevo
            localStorage.setItem('adminActiveSection', seccionActivaId);
        }
    }
}

// ESTA FUNCIÓN YA NO ES NECESARIA AQUÍ, CADA PÁGINA RESTAURA SU ESTADO EN SU PROPIO SCRIPT
// function restaurarEstadoApp() { ... }


// ==============================================
// EVENT LISTENERS GLOBALES
// ==============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM Cargado, verificando autenticación..."); // Debug
    verificarAutenticacion(); // Verificar auth en todas las páginas excepto index
    // restaurarEstadoApp(); // Se mueve a cada página específica

    // Solo configurar formularios y modales si estamos en index.html
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        console.log("En index.html, configurando formularios y modales..."); // Debug
        configurarLoginForms();

        // Configurar eventos para mostrar/ocultar modales
        document.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', function () {
                const ripple = this.querySelector('.ripple');
                if (ripple) { // Verificar si existe ripple
                    ripple.classList.add('active');
                    setTimeout(() => ripple.classList.remove('active'), 600); // Duración de la animación ripple
                }

                let modalId = '';
                switch (this.id) {
                    case 'microempresario':
                        modalId = 'microempresarioModal';
                        break;
                    case 'empleado':
                        modalId = 'empleadoModal';
                        break;
                    case 'administrador': // Nuevo
                        modalId = 'administradorModal';
                        break;
                }

                const modalElement = document.getElementById(modalId);
                if (modalElement) {
                    // Resetear campos del formulario antes de mostrar
                    const form = modalElement.querySelector('form');
                    if (form) form.reset();
                    // Asegurar que el botón no esté en estado de carga
                    const submitBtn = modalElement.querySelector('.login-btn');
                    if (submitBtn && submitBtn.querySelector('.loader')) {
                        submitBtn.innerHTML = 'Ingresar'; // O el texto original
                        submitBtn.disabled = false;
                    }
                    modalElement.style.display = 'flex'; // Usar flex para centrar
                } else {
                    console.error(`Modal con ID ${modalId} no encontrado.`);
                }
            });
        });

        // Cerrar modales al hacer clic en la X
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', function () {
                this.closest('.modal').style.display = 'none';
            });
        });

        // Cerrar modales al hacer clic fuera del contenido
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function (e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        });
    } else {
        console.log("No estamos en index.html, no se configuran modales de login."); // Debug
    }

    // Manejo offline/online (siempre activo)
    if (!navigator.onLine) {
        mostrarNotificacionOffline();
    }
});

window.addEventListener('online', function () {
    mostrarNotificacionOnline();
});

window.addEventListener('offline', function () {
    mostrarNotificacionOffline();
});

// Guardar estado antes de salir (siempre activo)
window.addEventListener('beforeunload', guardarEstadoApp);

// ==============================================
// INICIALIZACIÓN
// ==============================================
manejarEstadoConexion(); // Verificar estado inicial