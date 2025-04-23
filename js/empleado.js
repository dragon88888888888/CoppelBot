// Configuration constants
const CONFIG = {
    MAP_CENTER: [23.6345, -102.5528],
    MAP_ZOOM: 5,
    DEFAULT_RADIUS: 10,
    MAX_RADIUS: 50,
    DEBOUNCE_TIME: 300
};

const BUSINESS_TYPES = {
    comida: { color: '#e74c3c', icon: 'utensils', name: 'Comida' },
    ropa: { color: '#3498db', icon: 'tshirt', name: 'Ropa' },
    servicios: { color: '#2ecc71', icon: 'tools', name: 'Servicios' },
    tecnologia: { color: '#9b59b6', icon: 'laptop', name: 'Tecnología' },
    otros: { color: '#f39c12', icon: 'store', name: 'Otros' }
};

const COURSES_MAPPING = {
    comida: 'Curso de Gastronomía y Manejo de Alimentos',
    ropa: 'Curso de Moda y Diseño de Ropa',
    servicios: 'Curso de Administración de Servicios',
    tecnologia: 'Curso de Tecnología para Negocios',
    otros: 'Curso General de Emprendimiento'
};

// State management
const state = {
    map: null,
    userLocation: null,
    userMarker: null,
    radiusCircle: null,
    currentRadius: CONFIG.DEFAULT_RADIUS,
    allBusinesses: [],
    displayedBusinesses: [],
    isLoading: false
};

// Initialize map
function initMap() {
    state.map = L.map('map').setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(state.map);

    // Initialize hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const controlPanel = document.getElementById('control-panel');
    hamburgerBtn.addEventListener('click', () => {
        controlPanel.classList.toggle('open');
    });
}

// Load sample businesses
function loadSampleBusinesses() {
    const cities = [
        { name: "Monterrey", lat: 25.6714, lng: -100.309 },
        { name: "Guadalajara", lat: 20.6668, lng: -103.392 },
        { name: "CDMX", lat: 19.4326, lng: -99.1332 },
        { name: "Puebla", lat: 19.0414, lng: -98.2063 },
        { name: "Tijuana", lat: 32.5149, lng: -117.0382 },
        { name: "León", lat: 21.1250, lng: -101.6860 },
        { name: "Querétaro", lat: 20.5881, lng: -100.3881 }
    ];

    const businessNames = {
        comida: ["Tortas Don José", "Taquería El Pastor", "Restaurante Mariscos", "Cafetería Central", "Pizzería Napoli"],
        ropa: ["Boutique María", "Moda Joven", "Ropa para Todos", "Estilo Único", "Textiles Artesanales"],
        servicios: ["Taller Mecánico Pérez", "Lavandería Express", "Ferretería Central", "Farmacia del Ahorro", "Tintorería Elegante"],
        tecnologia: ["TecnoSoluciones", "Reparación de Celulares", "Cyber Café Net", "Electrónica Digital", "Software MX"],
        otros: ["Miscelánea Luna", "Papelería Escolar", "Regalos y Más", "Tienda de Conveniencia", "Bazar Familiar"]
    };

    return cities.reduce((businesses, city) => {
        Object.keys(BUSINESS_TYPES).forEach(type => {
            businessNames[type].forEach(name => {
                const offsetLat = (Math.random() - 0.5) * 0.1;
                const offsetLng = (Math.random() - 0.5) * 0.1;
                const hasWebsite = Math.random() > 0.4;
                const hasFacebook = Math.random() > 0.6;
                const hasPhone = Math.random() > 0.3;

                businesses.push({
                    name: sanitizeInput(name),
                    type,
                    lat: city.lat + offsetLat,
                    lng: city.lng + offsetLng,
                    phone: hasPhone ? `55${Math.floor(10000000 + Math.random() * 90000000)}` : "",
                    website: hasWebsite ? `https://${name.toLowerCase().replace(/\s/g, '')}.com` : "",
                    facebook: hasFacebook ? `https://facebook.com/${name.toLowerCase().replace(/\s/g, '')}` : "",
                    reviews: Math.random() > 0.3 ? (Math.random() * 1 + 4).toFixed(1) : "",
                    address: sanitizeInput(`Calle ${Math.floor(Math.random() * 100) + 1}, ${city.name}`),
                    course: COURSES_MAPPING[type]
                });
            });
        });
        return businesses;
    }, []);
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Add businesses to map
function addBusinessesToMap(businesses) {
    state.displayedBusinesses.forEach(marker => state.map.removeLayer(marker));
    state.displayedBusinesses = [];

    businesses.forEach(business => {
        const typeInfo = BUSINESS_TYPES[business.type] || BUSINESS_TYPES.otros;
        const icon = L.divIcon({
            className: 'custom-icon',
            html: `<i class="fas fa-${typeInfo.icon}" style="color:${typeInfo.color}"></i>`,
            iconSize: [32, 32]
        });

        const popupContent = `
                  <h4>${business.name}</h4>
                  <p><strong>Tipo:</strong> ${typeInfo.name}</p>
                  <p><strong>Dirección:</strong> ${business.address}</p>
                  <p><strong>Curso recomendado:</strong> ${business.course}</p>
                  <div class="business-info">
                      ${business.phone ? `<p><i class="fas fa-phone"></i> ${business.phone}</p>` : ''}
                      ${business.website ? `<p><i class="fas fa-globe"></i> <a href="${business.website}" target="_blank" rel="noopener">Sitio web</a></p>` : ''}
                      ${business.facebook ? `<p><i class="fab fa-facebook"></i> <a href="${business.facebook}" target="_blank" rel="noopener">Facebook</a></p>` : ''}
                      ${business.reviews ? `<p><i class="fas fa-star"></i> Calificación: ${business.reviews}/5</p>` : ''}
                  </div>
              `;

        const marker = L.marker([business.lat, business.lng], { icon })
            .addTo(state.map)
            .bindPopup(popupContent);
        state.displayedBusinesses.push(marker);
    });
}

// Filter businesses
function filterBusinesses() {
    const typeFilter = document.getElementById('business-type').value;
    const radiusFilter = state.currentRadius * 1000;

    let filtered = [...state.allBusinesses];

    if (typeFilter !== 'all') {
        filtered = filtered.filter(b => b.type === typeFilter);
    }

    if (state.userLocation) {
        filtered = filtered.filter(business => {
            const distance = state.userLocation.distanceTo(L.latLng(business.lat, business.lng));
            return distance <= radiusFilter;
        });
        updateRadiusCircle();
    }

    addBusinessesToMap(filtered);
}

// Update radius circle
function updateRadiusCircle() {
    if (state.radiusCircle) {
        state.map.removeLayer(state.radiusCircle);
    }

    if (state.userLocation) {
        state.radiusCircle = L.circle(state.userLocation, {
            radius: state.currentRadius * 1000,
            color: '#00a0e3',
            fillColor: '#00a0e3',
            fillOpacity: 0.15
        }).addTo(state.map);
    }
}

// Locate user
async function locateUser() {
    const loadingElement = document.getElementById('location-loading');
    const locateButton = document.getElementById('locate-me');
    loadingElement.style.display = 'block';
    locateButton.disabled = true;

    try {
        if (!navigator.geolocation) {
            throw new Error('Geolocalización no soportada por el navegador');
        }

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });

        state.userLocation = L.latLng(position.coords.latitude, position.coords.longitude);
        state.map.setView(state.userLocation, 13);

        if (state.userMarker) {
            state.map.removeLayer(state.userMarker);
        }

        state.userMarker = L.marker(state.userLocation, {
            icon: L.divIcon({
                className: 'custom-icon user-location',
                html: '<i class="bi bi-geo-fill"></i>',
                iconSize: [32, 32]
            })
        }).addTo(state.map)
            .bindPopup('<b>Tu ubicación</b>').openPopup();

        filterBusinesses();
    } catch (error) {
        alert(`Error al obtener la ubicación: ${error.message}`);
        console.error('Error de geolocalización:', error);
    } finally {
        loadingElement.style.display = 'none';
        locateButton.disabled = false;
    }
}

// Export to PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const typeFilter = document.getElementById('business-type').value;

    doc.setFontSize(18);
    doc.setTextColor(0, 160, 227);
    doc.text('Directorio de Microempresarios - Coppel Emprende', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const locationText = state.userLocation
        ? `Ubicación: Lat ${state.userLocation.lat.toFixed(4)}, Lng ${state.userLocation.lng.toFixed(4)} | Radio: ${state.currentRadius} km`
        : 'Ubicación: Todos los negocios';
    doc.text(locationText, 14, 25);

    const filterText = `Filtro: ${typeFilter === 'all' ? 'Todos los tipos' : BUSINESS_TYPES[typeFilter].name}`;
    doc.text(filterText, 14, 32);

    const now = new Date();
    doc.text(`Generado: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 14, 39);

    const filteredBusinesses = typeFilter === 'all' ? state.allBusinesses :
        state.allBusinesses.filter(b => b.type === typeFilter);

    const finalBusinesses = state.userLocation ?
        filteredBusinesses.filter(b => {
            const distance = state.userLocation.distanceTo(L.latLng(b.lat, b.lng));
            return distance <= state.currentRadius * 1000;
        }) : filteredBusinesses;

    const tableData = finalBusinesses.map(b => [
        b.name,
        BUSINESS_TYPES[b.type].name,
        b.address,
        b.phone || 'N/A',
        b.website ? 'Sí' : 'No',
        b.facebook ? 'Sí' : 'No',
        b.reviews || 'N/A',
        b.course
    ]);

    doc.autoTable({
        head: [['Nombre', 'Tipo', 'Dirección', 'Teléfono', 'Sitio Web', 'Facebook', 'Reseñas', 'Curso Recomendado']],
        body: tableData,
        startY: 45,
        styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [0, 160, 227],
            textColor: 255,
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 35 },
            3: { cellWidth: 20 },
            4: { cellWidth: 15 },
            5: { cellWidth: 15 },
            6: { cellWidth: 15 },
            7: { cellWidth: 30 }
        },
        margin: { left: 10 }
    });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('© Coppel Emprende - Programa de capacitación para microempresarios', 105, doc.internal.pageSize.height - 10, { align: 'center' });

    doc.save(`microempresarios_coppel_${now.toISOString().slice(0, 10)}.pdf`);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize application
function init() {
    initMap();
    state.allBusinesses = loadSampleBusinesses();
    addBusinessesToMap(state.allBusinesses);

    const locateButton = document.getElementById('locate-me');
    const exportButton = document.getElementById('exportPdf');
    const typeSelect = document.getElementById('business-type');
    const radiusInput = document.getElementById('search-radius');
    const radiusValue = document.getElementById('radius-value');

    locateButton.addEventListener('click', locateUser);
    exportButton.addEventListener('click', exportToPDF);
    typeSelect.addEventListener('change', filterBusinesses);
    radiusInput.addEventListener('input', debounce(() => {
        state.currentRadius = parseInt(radiusInput.value);
        radiusValue.textContent = `${state.currentRadius} km`;
        if (state.userLocation) {
            filterBusinesses();
        }
    }, CONFIG.DEBOUNCE_TIME));
}

document.addEventListener("DOMContentLoaded", function () {
    // Mostrar correo del usuario
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
        document.getElementById("user-email").textContent = userEmail;
    }

    // Logout con animación
    document
        .getElementById("logout-btn")
        .addEventListener("click", function () {
            this.classList.add("rotate-center");
            setTimeout(() => {
                localStorage.removeItem("loggedIn");
                localStorage.removeItem("userEmail");
                window.location.href = "index.html";
            }, 500);
        });

    // Navegación entre secciones con animación
    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".dashboard-section");

    navButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Animación del botón
            this.classList.add("jump");
            setTimeout(() => this.classList.remove("jump"), 500);

            // Quitar active de todos los botones y secciones
            navButtons.forEach((btn) => btn.classList.remove("active"));
            sections.forEach((section) => {
                section.classList.remove("active");
                section.style.opacity = "0";
            });

            // Agregar active al botón clickeado
            this.classList.add("active");

            // Mostrar la sección correspondiente con animación
            const sectionId = this.getAttribute("data-section") + "-section";
            const activeSection = document.getElementById(sectionId);

            if (activeSection) {
                activeSection.classList.add("active");

                setTimeout(() => {
                    activeSection.style.opacity = "1";
                }, 10);

                // Inicializar mapa si es la sección de rutas
                if (sectionId === "rutas-section") {
                    init();
                }
            } else {
                console.warn(
                    `La sección con ID '${sectionId}' no existe en el DOM`
                );
            }
        });
    });

    // Botón de asistente por voz
    document
        .getElementById("voice-assistant-btn")
        .addEventListener("click", function () {
            if ("webkitSpeechRecognition" in window) {
                const recognition = new webkitSpeechRecognition();
                recognition.lang = "es-MX";
                recognition.start();

                this.innerHTML =
                    '<div class="pulse"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg></div>';

                recognition.onresult = function (event) {
                    const transcript = event.results[0][0].transcript.toLowerCase();
                    let response = "";

                    if (
                        transcript.includes("registros") ||
                        transcript.includes("clientes")
                    ) {
                        document.querySelector('[data-section="registros"]').click();
                        response = "Abriendo sección de registros";
                    } else if (
                        transcript.includes("rutas") ||
                        transcript.includes("mapa")
                    ) {
                        document.querySelector('[data-section="rutas"]').click();
                        response = "Abriendo sección de rutas";
                    } else if (transcript.includes("buscar")) {
                        const searchTerm = transcript.replace("buscar", "").trim();
                        document.querySelector(
                            "#registros-section .search-bar input"
                        ).value = searchTerm;
                        response = `Buscando "${searchTerm}" en registros`;
                    } else {
                        response =
                            'No entendí el comando. Puedes decir "registros", "rutas" o "buscar [término]"';
                    }

                    // Mostrar notificación con la respuesta
                    const notification = document.createElement("div");
                    notification.className =
                        "notification voice-notification slide-in-bottom";
                    notification.innerHTML = response;
                    document.body.appendChild(notification);

                    setTimeout(() => {
                        notification.classList.add("fade-out");
                        setTimeout(() => notification.remove(), 500);
                    }, 3000);
                };

                recognition.onerror = function () {
                    document.getElementById("voice-assistant-btn").innerHTML =
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg><span>Asistente</span>';
                };
            } else {
                alert(
                    "El reconocimiento de voz no es compatible con tu navegador"
                );
            }
        });

    // Modal de microempresarios
    const microCards = document.querySelectorAll(".microempresario-card");
    const microModal = document.getElementById("microempresario-modal");
    const closeMicroModal = document.querySelector(
        "#microempresario-modal .close-modal"
    );

    microCards.forEach((card) => {
        card.addEventListener("click", function () {
            // Efecto de click
            this.classList.add("clicked");
            setTimeout(() => this.classList.remove("clicked"), 300);

            const id = this.getAttribute("data-id");
            showMicroempresarioDetails(id);
            microModal.style.display = "block";
        });
    });

    closeMicroModal.addEventListener("click", function () {
        microModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === microModal) {
            microModal.style.display = "none";
        }
    });

    // Inicializar mapa si la sección de rutas está activa
    if (
        document.getElementById("rutas-section").classList.contains("active")
    ) {
        init();
    }

    // Agregar inicialización del asistente cuando se navega a la sección
    const assistantButton = document.querySelector(
        '[data-section="asistente"]'
    );
    if (assistantButton) {
        assistantButton.addEventListener("click", function () {
            // Iniciar el asistente cuando se navega a la sección
            setTimeout(initVoiceAssistantSection, 100);
        });
    }

    // También inicializar si ya estamos en la sección del asistente
    if (
        document
            .getElementById("asistente-section")
            .classList.contains("active")
    ) {
        initVoiceAssistantSection();
    }
});

function showMicroempresarioDetails(id) {
    // Simular datos del microempresario
    const microempresarios = {
        1: {
            nombre: "Juan López Martínez",
            negocio: 'Miscelánea "La Económica"',
            rfc: "PERJ800101ABC",
            direccion: "Calle Falsa 123, Col. Centro, Culiacán, Sin.",
            telefono: "6671234567",
            email: "juan.lopez@example.com",
            giro: "Comercio al por menor",
            antiguedad: "3 años",
            ventas: "$25,000 MXN mensuales",
            status: "Activo",
            ultimoPago: "15/10/2023",
            proximaVisita: "20/11/2023",
        },
        2: {
            nombre: "María González Pérez",
            negocio: 'Tortillería "La Abuelita"',
            rfc: "GOPM750505DEF",
            direccion: "Av. Siempre Viva 742, Col. Jardines, Culiacán, Sin.",
            telefono: "6677654321",
            email: "maria.gonzalez@example.com",
            giro: "Elaboración de tortillas",
            antiguedad: "5 años",
            ventas: "$35,000 MXN mensuales",
            status: "Pendiente",
            ultimoPago: "N/A",
            proximaVisita: "18/11/2023",
        },
        3: {
            nombre: "Roberto Sánchez Díaz",
            negocio: 'Taller mecánico "El Veloz"',
            rfc: "SADR820202GHI",
            direccion: "Blvd. Las Flores 456, Col. Reforma, Culiacán, Sin.",
            telefono: "6679876543",
            email: "roberto.sanchez@example.com",
            giro: "Servicios de reparación automotriz",
            antiguedad: "2 años",
            ventas: "$40,000 MXN mensuales",
            status: "Inactivo",
            ultimoPago: "15/08/2023",
            proximaVisita: "N/A",
        },
        4: {
            nombre: "Ana Cristina Ruiz",
            negocio: 'Boutique "Moda Elegante"',
            rfc: "RUAC900101JKL",
            direccion: "Callejón del Beso 321, Col. Centro, Culiacán, Sin.",
            telefono: "6671122334",
            email: "ana.ruiz@example.com",
            giro: "Venta de ropa y accesorios",
            antiguedad: "1 año",
            ventas: "$20,000 MXN mensuales",
            status: "Activo",
            ultimoPago: "01/11/2023",
            proximaVisita: "25/11/2023",
        },
    };

    const micro = microempresarios[id];
    const modalBody = document.getElementById("modal-body");

    modalBody.innerHTML = `
                <div class="micro-detail-header">
                    <div class="micro-avatar swing-in-top-fwd">${micro.nombre.split(" ")[0][0]
        }${micro.nombre.split(" ")[1][0]}</div>
                    <div class="micro-title">
                        <h3>${micro.nombre}</h3>
                        <p>${micro.negocio}</p>
                        <span class="status-badge ${micro.status.toLowerCase()}">${micro.status
        }</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Información de contacto</h4>
                    <div class="info-row">
                        <span class="info-label">Dirección:</span>
                        <span class="info-value">${micro.direccion}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">${micro.telefono}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${micro.email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">RFC:</span>
                        <span class="info-value">${micro.rfc}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Información del negocio</h4>
                    <div class="info-row">
                        <span class="info-label">Giro:</span>
                        <span class="info-value">${micro.giro}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Antigüedad:</span>
                        <span class="info-value">${micro.antiguedad}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ventas promedio:</span>
                        <span class="info-value">${micro.ventas}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Información financiera</h4>
                    <div class="info-row">
                        <span class="info-label">Último pago:</span>
                        <span class="info-value">${micro.ultimoPago}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Próxima visita:</span>
                        <span class="info-value">${micro.proximaVisita}</span>
                    </div>
                </div>
                
                <div class="detail-actions">
                    <button class="btn-secondary">Editar información</button>
                    <button class="btn-primary">Agendar visita</button>
                </div>
            `;

    document.getElementById("modal-title").textContent = micro.negocio;
}