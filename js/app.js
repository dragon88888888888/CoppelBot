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
    // ... (código sin cambios)
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
    // ... (código sin cambios)
    if (!navigator.onLine) {
        mostrarNotificacionOffline();
    }
}

function mostrarNotificacionOffline() {
    // ... (código sin cambios)
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
    // ... (código sin cambios)
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
    // ... (código sin cambios)
    console.log('Sincronizando datos con el servidor...');
    // Aquí implementarías la lógica de sincronización
}

// ==============================================
// MANEJO DE AUTENTICACIÓN (Verificación sigue siendo necesaria en las páginas destino)
// ==============================================
function verificarAutenticacion() {
    const paginasPublicas = ['index.html', '/'];
    // Asegurarse de que la ruta se normalice (ej: remove trailing slash if not root)
    let rutaActual = window.location.pathname;
    if (rutaActual !== '/' && rutaActual.endsWith('/')) {
        rutaActual = rutaActual.slice(0, -1);
    }
    // Handle potential base paths if not running at root
    const currentPage = rutaActual.substring(rutaActual.lastIndexOf('/') + 1);


    // Si estamos en una página pública (index.html), no hacemos nada aquí
    if (paginasPublicas.some(pagina => currentPage === pagina || rutaActual === pagina || currentPage === '')) {
        return;
    }

    const estaAutenticado = localStorage.getItem('loggedIn') === 'true';
    const tipoUsuario = localStorage.getItem('userType');

    if (!estaAutenticado) {
        // Redirigir al login si no está autenticado y no está en index.html
        console.log("No autenticado, redirigiendo a index.html desde:", rutaActual);
        window.location.href = 'index.html'; // Ajusta si tu index está en otra ruta base
    } else {
        // Verificar que el usuario esté en la página correcta según su tipo
        let paginaCorrecta = '';
        switch (tipoUsuario) {
            case 'empleado':
                paginaCorrecta = 'empleado.html';
                break;
            // case 'microempresario': // Mantenemos esto por si se usa
            //     paginaCorrecta = 'microempresario.html';
            //     break;
            case 'administrador': // Nueva condición
                paginaCorrecta = 'administrador.html';
                break;
            default:
                // Tipo de usuario desconocido, redirigir a index
                console.log("Tipo de usuario desconocido o inválido:", tipoUsuario, "Limpiando y redirigiendo a index.html");
                localStorage.clear(); // Limpiar estado inválido
                window.location.href = 'index.html'; // Ajusta si tu index está en otra ruta base
                return;
        }

        if (!currentPage.endsWith(paginaCorrecta)) {
            console.log(`Usuario ${tipoUsuario} en página incorrecta (${currentPage}). Redirigiendo a ${paginaCorrecta}`);
            window.location.href = paginaCorrecta; // Ajusta si tus páginas están en otra ruta base
        } else {
            console.log(`Usuario ${tipoUsuario} autenticado y en la página correcta (${currentPage}).`);
        }
    }
}

// ==============================================
// MANEJO DE AUTENTICACIÓN (Función simulada - COMENTADA PORQUE SE BYPASSEA)
// ==============================================
/* --- INICIO: Código comentado ---
   // Esta función ya no es llamada directamente por los clicks de Empleado/Administrador
   // Podría mantenerse si el perfil 'microempresario' u otros futuros perfiles
   // SÍ usan un modal y una lógica de autenticación real.
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
                // ... (cases for microempresario, empleado, administrador) ...
                // Esta lógica ya no se usa para empleado/admin en el flujo modificado
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
--- FIN: Código comentado --- */


// ==============================================
// MANEJO DE FORMULARIOS DE LOGIN (COMENTADO/MODIFICADO)
// ==============================================
function configurarLoginForms() {
    // --- INICIO: Código comentado ---
    // Ya no necesitamos listeners para los formularios de Empleado y Admin
    // porque estamos bypasseando los modales para ellos.

    /*
    // Configurar formulario de empleado
    const empForm = document.getElementById('empleadoForm');
    if (empForm) {
        empForm.addEventListener('submit', async function (e) {
            // ... Lógica original del formulario de empleado ...
            // Esta lógica es ahora manejada por el click directo en la card
        });
    }

    // Configurar formulario de administrador (NUEVO)
    const adminForm = document.getElementById('administradorForm');
    if (adminForm) {
        adminForm.addEventListener('submit', async function (e) {
           // ... Lógica original del formulario de administrador ...
           // Esta lógica es ahora manejada por el click directo en la card
        });
    }
    */
    // --- FIN: Código comentado ---

    // Mantenemos el formulario de microempresario por si acaso,
    // o coméntalo también si ese perfil no existe o también se bypassará.
    /*
    const microForm = document.getElementById('microempresarioForm');
    if (microForm) {
        microForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<div class="loader"></div>';

                const email = document.getElementById('micro-email').value;
                const password = document.getElementById('micro-password').value;

                // Si autenticarUsuario está comentado, esta línea fallará.
                // Necesitarías decidir si microempresario también bypassa
                // o si mantienes/adaptas autenticarUsuario solo para él.
                // await autenticarUsuario('microempresario', { email, password });
                // window.location.href = 'microempresario.html';

                // Ejemplo si microempresario TAMBIÉN bypassa:
                console.log('Simulando Microempresario login y redirecting...');
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('userType', 'microempresario');
                localStorage.setItem('userEmail', email || 'micro-bypass@example.com'); // Guardar un email simulado
                window.location.href = 'microempresario.html';


            } catch (error) {
                console.error('Error en autenticación microempresario:', error);
                alert(error.message || 'Error en autenticación. Por favor intenta nuevamente.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
    */
}

// ==============================================
// FUNCIONALIDAD COMÚN
// ==============================================
function togglePasswordVisibility(inputId, buttonId) {
    // ... (código sin cambios, puede ser útil si alguna vez se reintroducen formularios)
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (input && button) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.innerHTML = isPassword
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#005AA3"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>' // Ojo tachado
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#005AA3"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'; // Ojo normal
    }
}


// ==============================================
// MANEJO DE ESTADO DE LA APLICACIÓN
// ==============================================
function guardarEstadoApp() {
    // ... (código sin cambios)
    const ruta = window.location.pathname;
    const seccionActivaElement = document.querySelector('.dashboard-section.active'); // Asumiendo que las páginas internas usan esta clase

    if (seccionActivaElement) {
        const seccionActivaId = seccionActivaElement.id;
        // Normalizar ruta para obtener nombre de archivo
        const currentPage = ruta.substring(ruta.lastIndexOf('/') + 1);

        if (currentPage === 'empleado.html') {
            localStorage.setItem('empleadoActiveSection', seccionActivaId);
        } else if (currentPage === 'microempresario.html') { // Si se usa
            localStorage.setItem('microempresarioActiveSection', seccionActivaId);
        } else if (currentPage === 'administrador.html') {
            localStorage.setItem('adminActiveSection', seccionActivaId);
        }
    }
}

// ==============================================
// EVENT LISTENERS GLOBALES
// ==============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM Cargado, verificando autenticación...");
    verificarAutenticacion(); // Verificar auth en todas las páginas excepto index

    // Normalizar ruta para obtener nombre de archivo
    let rutaActual = window.location.pathname;
    if (rutaActual !== '/' && rutaActual.endsWith('/')) {
        rutaActual = rutaActual.slice(0, -1);
    }
    const currentPage = rutaActual.substring(rutaActual.lastIndexOf('/') + 1);

    // Solo configurar lógica de index.html si estamos en ella
    if (currentPage === 'index.html' || currentPage === '') {
        console.log("En index.html, configurando Clicks directos para perfiles...");

        // --- INICIO: Código comentado (Llamada a configurar formularios) ---
        // Ya no necesitamos configurar los formularios de login de la manera original
        // configurarLoginForms();
        // --- FIN: Código comentado ---

        // Configurar Clicks Directos para Empleado y Administrador
        document.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', function () {
                const ripple = this.querySelector('.ripple');
                if (ripple) {
                    ripple.classList.add('active');
                    setTimeout(() => ripple.classList.remove('active'), 600);
                }

                const profileId = this.id;

                if (profileId === 'empleado') {
                    console.log('Redirigiendo a Empleado...');
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('userType', 'empleado');
                    // Opcional: guardar un ID simulado si la página empleado.html lo espera
                    localStorage.setItem('employeeNumber', 'E-BYPASS');
                    window.location.href = 'empleado.html'; // Asegúrate que la ruta sea correcta
                } else if (profileId === 'administrador') {
                    console.log('Redirigiendo a Administrador...');
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('userType', 'administrador');
                    // Opcional: guardar un ID simulado si la página administrador.html lo espera
                    localStorage.setItem('adminId', 'A-BYPASS');
                    window.location.href = 'administrador.html'; // Asegúrate que la ruta sea correcta
                }
                // else if (profileId === 'microempresario') {
                // --- OPCIÓN 1: Mantener Modal para Microempresario ---
                /*
                console.log('Mostrando modal para Microempresario...');
                const modalElement = document.getElementById('microempresarioModal');
                if (modalElement) {
                    const form = modalElement.querySelector('form');
                    if (form) form.reset();
                    const submitBtn = modalElement.querySelector('.login-btn');
                     if (submitBtn && submitBtn.querySelector('.loader')) {
                        submitBtn.innerHTML = 'Ingresar';
                        submitBtn.disabled = false;
                    }
                    modalElement.style.display = 'flex';
                } else {
                     console.error(`Modal con ID microempresarioModal no encontrado.`);
                }
                */
                // --- OPCIÓN 2: Bypass también para Microempresario ---
                /*
                console.log('Redirigiendo a Microempresario...');
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('userType', 'microempresario');
                localStorage.setItem('userEmail', 'micro-bypass@example.com');
                window.location.href = 'microempresario.html';
                */
                // }
                else {
                    console.warn(`Perfil clickeado (${profileId}) no tiene acción de redirección definida.`);
                }

                // --- INICIO: Código comentado (Lógica original de mostrar modal) ---
                /*
                let modalId = '';
                switch (this.id) {
                    case 'microempresario':
                        modalId = 'microempresarioModal';
                        break;
                    case 'empleado':
                        modalId = 'empleadoModal';
                        break;
                    case 'administrador':
                        modalId = 'administradorModal';
                        break;
                }
                const modalElement = document.getElementById(modalId);
                // ... resto de la lógica para mostrar el modal ...
                */
                // --- FIN: Código comentado ---
            });
        });

        // --- INICIO: Código comentado (Cerrar modales) ---
        // Puedes mantener esto si el modal de microempresario sigue activo,
        // o comentarlo si ningún modal se usa ya.
        /*
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
        */
        // --- FIN: Código comentado ---

    } else {
        console.log(`No estamos en index.html (${currentPage}), no se configuran clicks de perfil.`);
        // Lógica específica para otras páginas podría ir aquí si es necesario
        // Por ejemplo, restaurar el estado de la sección activa
        // restaurarEstadoApp(); // Esta función se movió o se implementa en cada página
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