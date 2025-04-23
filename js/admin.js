 // --- SIMULACIÓN DE DATOS (Reemplazar con llamadas a API/BD) ---
      const simulatedData = {
        administrador: {
          id_admin: 1,
          nombre: "Admin Principal",
          matricula_admin: "A00001",
        },
        colaboradores: [
          {
            id_colaborador: 101,
            id_admin: 1,
            matricula_col: "C12345",
            num_empleado: "E1001",
            meta_negocios: 10,
            nombre: "Carlos Ramírez",
          },
          {
            id_colaborador: 102,
            id_admin: 1,
            matricula_col: "C67890",
            num_empleado: "E1002",
            meta_negocios: 10,
            nombre: "Sofía Hernández",
          },
          {
            id_colaborador: 103,
            id_admin: 1,
            matricula_col: "C11223",
            num_empleado: "E1003",
            meta_negocios: 10,
            nombre: "Luis García",
          },
        ],
        micronegocios: [
          {
            id_negocio: 1,
            id_colaborador: 101,
            nombre: "Abarrotes Don Pepe",
            propietario: "José Pérez",
            contacto: "5511223344",
            descripcion_negocio: "Tienda de abarrotes",
          },
          {
            id_negocio: 2,
            id_colaborador: 101,
            nombre: "Tacos El Güero",
            propietario: "Ricardo Solís",
            contacto: "5522334455",
            descripcion_negocio: "Puesto de tacos",
          },
          {
            id_negocio: 3,
            id_colaborador: 102,
            nombre: "Estética Bella",
            propietario: "Laura Méndez",
            contacto: "5533445566",
            descripcion_negocio: "Salón de belleza",
          },
          {
            id_negocio: 4,
            id_colaborador: 101,
            nombre: "Papelería El Lápiz",
            propietario: "Ana Torres",
            contacto: "5544556677",
            descripcion_negocio: "Venta de artículos escolares",
          },
          // ... agregar más negocios para simular alcanzar metas
          {
            id_negocio: 5,
            id_colaborador: 101,
            nombre: "Frutería La Huerta",
            propietario: "Mario Bros",
            contacto: "555",
            descripcion_negocio: "Frutas y verduras",
          },
          {
            id_negocio: 6,
            id_colaborador: 101,
            nombre: "Carnicería San Juan",
            propietario: "Juan Camaney",
            contacto: "556",
            descripcion_negocio: "Venta de carne",
          },
          {
            id_negocio: 7,
            id_colaborador: 101,
            nombre: "Ferretería El Clavo",
            propietario: "Pedro Picapiedra",
            contacto: "557",
            descripcion_negocio: "Herramientas",
          },
          {
            id_negocio: 8,
            id_colaborador: 101,
            nombre: "Lavandería Burbujas",
            propietario: "Pablo Mármol",
            contacto: "558",
            descripcion_negocio: "Servicio de lavado",
          },
          {
            id_negocio: 9,
            id_colaborador: 101,
            nombre: "Zapatería El Paso",
            propietario: "Usain Bolt",
            contacto: "559",
            descripcion_negocio: "Venta de calzado",
          },
          {
            id_negocio: 10,
            id_colaborador: 101,
            nombre: "Panadería El Bolillo",
            propietario: "Homero Simpson",
            contacto: "550",
            descripcion_negocio: "Pan dulce y salado",
          },
          {
            id_negocio: 11,
            id_colaborador: 101,
            nombre: "Refaccionaria Speed",
            propietario: "Rayo McQueen",
            contacto: "551",
            descripcion_negocio: "Partes automotrices",
          }, // Negocio 11 para Carlos
        ],
        contenido: [
          {
            id_contenido: 1,
            tipo: "leccion",
            titulo: "Finanzas Básicas 1",
            valor_llaves: 7,
          },
          {
            id_contenido: 2,
            tipo: "leccion",
            titulo: "Marketing Digital Intro",
            valor_llaves: 7,
          },
          {
            id_contenido: 3,
            tipo: "webinar",
            titulo: "Webinar: Atención al Cliente",
            valor_llaves: 7,
          },
          {
            id_contenido: 4,
            tipo: "leccion",
            titulo: "Finanzas Básicas 2",
            valor_llaves: 7,
          },
          // ... agregar 20 lecciones para simular
          ...Array.from({ length: 18 }, (_, i) => ({
            id_contenido: 5 + i,
            tipo: "leccion",
            titulo: `Lección Extra ${i + 1}`,
            valor_llaves: 7,
          })),
        ],
        progreso: [
          // Progreso para negocio 1 (Carlos) - Cumple lecciones
          ...Array.from({ length: 20 }, (_, i) => ({
            id_progreso: i + 1,
            id_negocio: 1,
            id_contenido: i + 1,
            llaves_ganadas: 7,
          })),
          {
            id_progreso: 21,
            id_negocio: 1,
            id_contenido: 3,
            llaves_ganadas: 7,
          }, // Webinar
          // Progreso para negocio 2 (Carlos) - Algunas lecciones
          {
            id_progreso: 22,
            id_negocio: 2,
            id_contenido: 1,
            llaves_ganadas: 7,
          },
          {
            id_progreso: 23,
            id_negocio: 2,
            id_contenido: 2,
            llaves_ganadas: 7,
          },
          // Progreso para negocio 3 (Sofia)
          {
            id_progreso: 24,
            id_negocio: 3,
            id_contenido: 1,
            llaves_ganadas: 7,
          },
          {
            id_progreso: 25,
            id_negocio: 3,
            id_contenido: 3,
            llaves_ganadas: 7,
          }, // Webinar
          // Progreso para los otros 9 negocios de Carlos para cumplir meta de negocios
          ...Array.from({ length: 9 }, (v, k) => k + 4).flatMap((negocioId) =>
            Array.from({ length: 20 }, (_, i) => ({
              id_progreso: 100 + (negocioId - 4) * 20 + i,
              id_negocio: negocioId,
              id_contenido: i + 1,
              llaves_ganadas: 7,
            }))
          ),
        ],
        llaves: [
          { id_llaves: 1, id_negocio: 1, total: 21 * 7, usadas: 10 }, // 20 lecciones + 1 webinar
          { id_llaves: 2, id_negocio: 2, total: 2 * 7, usadas: 0 },
          { id_llaves: 3, id_negocio: 3, total: 2 * 7, usadas: 5 },
          // ... llaves para los otros negocios de Carlos
          ...Array.from({ length: 9 }, (v, k) => ({
            id_llaves: 4 + k,
            id_negocio: 4 + k,
            total: 20 * 7,
            usadas: Math.floor(Math.random() * 50),
          })),
        ],
        recompensas: [
          {
            id_recompensa: 1,
            nombre: "Descuento en mercancía",
            costo_llaves: 50,
          },
          {
            id_recompensa: 2,
            nombre: "Asesoría personalizada",
            costo_llaves: 100,
          },
        ],
        canjes: [
          { id_canje: 1, id_negocio: 1, id_recompensa: 1, llaves_usadas: 10 },
        ],
        incentivos: [
          {
            id_incentivo: 1,
            nombre: "Días de Vacaciones Extra",
            tipo: "vacaciones",
            req_negocios: 10,
            req_lecciones: 20,
          },
          {
            id_incentivo: 2,
            nombre: "30% Descuento en Tienda",
            tipo: "descuento",
            req_negocios: 10,
            req_lecciones: 20,
          },
          {
            id_incentivo: 3,
            nombre: "Bono en Nómina",
            tipo: "nomina",
            req_negocios: 10,
            req_lecciones: 20,
          },
        ],
        incentivos_ganados: [
          // Se calculará dinámicamente en la lógica
        ],
      };
      // --- Global Variables & Chart Instances ---
let chartInstances = {}; // Object to store all chart instances for easy destruction

// --- FIN SIMULACIÓN ---

document.addEventListener("DOMContentLoaded", function () {
  // --- Initial Setup & Authentication ---
  const adminId = simulatedData.administrador.matricula_admin; // Using simulated data
  if (adminId) {
    const adminIdElement = document.getElementById("admin-id");
    if (adminIdElement) adminIdElement.textContent = adminId;
  } else {
    console.warn("No admin ID found in simulated data or localStorage");
    // Potentially redirect: window.location.href = 'index.html';
  }

  // --- Event Listeners ---
  setupLogoutButton();
  setupNavigation();
  setupSearchListeners();
  setupCollaboratorModal();

  // --- Restore or Load Initial Section ---
  restoreOrLoadInitialSection();
});

// =========================================================================
// SETUP FUNCTIONS (Called on DOMContentLoaded)
// =========================================================================

function setupLogoutButton() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      this.classList.add("rotate-center");
      setTimeout(() => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("userType");
        localStorage.removeItem("adminId");
        window.location.href = "index.html";
      }, 500);
    });
  }
}

function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".dashboard-section");

  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const currentActiveButton = document.querySelector(".nav-btn.active");
      const currentActiveSection = document.querySelector(
        ".dashboard-section.active"
      );
      const sectionIdToShow = this.getAttribute("data-section") + "-section";
      const sectionToShow = document.getElementById(sectionIdToShow);

      if (currentActiveButton !== this && sectionToShow) {
        // Button Animation
        this.classList.add("jump");
        setTimeout(() => this.classList.remove("jump"), 500);

        // Deactivate current
        if (currentActiveButton) currentActiveButton.classList.remove("active");
        if (currentActiveSection) {
          currentActiveSection.classList.remove("active");
          currentActiveSection.style.opacity = "0";
        }

        // Activate new
        this.classList.add("active");
        sectionToShow.classList.add("active");

        // Fade in and load data
        setTimeout(() => {
          sectionToShow.style.opacity = "1";
          loadSectionData(this.getAttribute("data-section"));
        }, 50); // Short delay for transition

        // Save state
        localStorage.setItem("adminActiveSection", sectionIdToShow);
      }
    });
  });
}

function restoreOrLoadInitialSection() {
  const savedSection = localStorage.getItem("adminActiveSection") || "dashboard-section";
  const sectionButton = document.querySelector(
    `.nav-btn[data-section="${savedSection.replace("-section", "")}"]`
  );

  if (sectionButton && document.getElementById(savedSection)) {
    // Simulate click only if button and section exist
     sectionButton.click();
  } else {
    // Fallback to default dashboard if saved section or button is invalid
    console.warn(`Saved section "${savedSection}" or its button not found. Loading default dashboard.`);
    const defaultButton = document.querySelector('.nav-btn[data-section="dashboard"]');
     if (defaultButton) {
        // Manually activate default button and section
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.dashboard-section').forEach(sec => {
            sec.classList.remove('active');
            sec.style.opacity = '0';
        });
        defaultButton.classList.add('active');
        const defaultSection = document.getElementById('dashboard-section');
        if (defaultSection) {
            defaultSection.classList.add('active');
            defaultSection.style.opacity = '1';
            loadSectionData("dashboard"); // Load default data
        } else {
             console.error("Default dashboard section not found!");
        }
     } else {
         console.error("Default dashboard button not found!");
     }

  }
}


function setupSearchListeners() {
  // Search for Collaborators
  const searchColaboradorBtn = document.getElementById("search-colaborador-btn");
  const searchColaboradorInput = document.getElementById("search-colaborador");
  if (searchColaboradorBtn && searchColaboradorInput) {
    searchColaboradorBtn.addEventListener("click", () => filterColaboradores(searchColaboradorInput.value));
    searchColaboradorInput.addEventListener("keyup", (e) => { if (e.key === "Enter") filterColaboradores(searchColaboradorInput.value); });
  }

  // Search for Progress
  const searchProgresoBtn = document.getElementById("search-progreso-btn");
  const searchProgresoInput = document.getElementById("search-progreso");
  if (searchProgresoBtn && searchProgresoInput) {
    searchProgresoBtn.addEventListener("click", () => filterProgreso(searchProgresoInput.value));
    searchProgresoInput.addEventListener("keyup", (e) => { if (e.key === "Enter") filterProgreso(searchProgresoInput.value); });
  }
}

function setupCollaboratorModal() {
  const closeColaboradorModalBtn = document.querySelector("#colaborador-modal .close-modal");
  const colaboradorModal = document.getElementById("colaborador-modal");
  if (closeColaboradorModalBtn && colaboradorModal) {
    closeColaboradorModalBtn.addEventListener("click", () => { colaboradorModal.style.display = "none"; });
    colaboradorModal.addEventListener("click", (e) => { if (e.target === colaboradorModal) colaboradorModal.style.display = "none"; });
  }
}

// =========================================================================
// DATA LOADING & SECTION RENDERING
// =========================================================================

function loadSectionData(sectionName) {
  console.log("Loading data for section:", sectionName);
  switch (sectionName) {
    case "dashboard":
      renderAdminDashboard(); // Call the new dashboard renderer
      break;
    case "colaboradores":
      destroyCharts(); // Destroy charts if navigating away from dashboard
      renderColaboradoresList(simulatedData.colaboradores);
      break;
    case "progreso":
      destroyCharts(); // Destroy charts if navigating away from dashboard
      renderProgresoList(simulatedData.micronegocios);
      break;
    case "incentivos":
      destroyCharts(); // Destroy charts if navigating away from dashboard
      renderIncentivos();
      break;
    default:
        console.warn("Attempted to load unknown section:", sectionName);
  }
}

// =========================================================================
// DASHBOARD RENDERING (New Power BI Style)
// =========================================================================

function renderAdminDashboard() {
  console.log("Renderizando Dashboard General...");
  destroyCharts(); // Ensure previous charts are cleared

  // --- Calculate KPI Data ---
  const totalColaboradores = simulatedData.colaboradores.length;
  const totalNegocios = simulatedData.micronegocios.length;

  let totalLeccionesCompletadas = 0;
  let totalWebinarsCompletados = 0;
  const leccionesUnicasPorNegocio = {};
  const webinarsUnicosPorNegocio = {};

  simulatedData.progreso.forEach(p => {
      const contenido = simulatedData.contenido.find(c => c.id_contenido === p.id_contenido);
      if (contenido?.tipo === 'leccion') {
          if (!leccionesUnicasPorNegocio[p.id_negocio]) leccionesUnicasPorNegocio[p.id_negocio] = new Set();
          leccionesUnicasPorNegocio[p.id_negocio].add(p.id_contenido);
      } else if (contenido?.tipo === 'webinar') {
           if (!webinarsUnicosPorNegocio[p.id_negocio]) webinarsUnicosPorNegocio[p.id_negocio] = new Set();
          webinarsUnicosPorNegocio[p.id_negocio].add(p.id_contenido);
      }
  });
  Object.values(leccionesUnicasPorNegocio).forEach(set => totalLeccionesCompletadas += set.size);
  Object.values(webinarsUnicosPorNegocio).forEach(set => totalWebinarsCompletados += set.size);

  const totalLecciones = simulatedData.contenido.filter(c => c.tipo === 'leccion').length;
  const totalLeccionesPosibles = totalNegocios * totalLecciones;
  const avgProgress = totalLeccionesPosibles > 0 ? ((totalLeccionesCompletadas / totalLeccionesPosibles) * 100).toFixed(1) : 0;

  const { earnedIncentivesCount, earnedIncentivesList } = calculateAllIncentives();

  // --- Update KPIs in HTML ---
  updateKPI('kpi-total-colaboradores', totalColaboradores);
  updateKPI('kpi-total-negocios', totalNegocios);
  updateKPI('kpi-avg-progreso', `${avgProgress}%`);
  updateKPI('kpi-total-incentivos', earnedIncentivesCount);

  // --- Render Charts ---
  renderNegociosPorColaboradorChart();
  renderProgresoTipoChart(totalLeccionesCompletadas, totalWebinarsCompletados);
  renderIncentivosTipoChart(earnedIncentivesList);
  renderMetasColaboradorChart();
}

function updateKPI(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`KPI element with ID ${elementId} not found.`);
    }
}

function destroyCharts() {
  Object.values(chartInstances).forEach(chart => {
    if (chart) {
      chart.destroy();
    }
  });
  chartInstances = {}; // Reset the object
  // Ensure placeholders are visible again
  document.querySelectorAll('.chart-placeholder').forEach(p => p.style.display = 'block');
}

// --- Specific Chart Rendering Functions ---

function renderNegociosPorColaboradorChart() {
  const ctx = document.getElementById('dash-negocios-colab-chart')?.getContext('2d');
  const placeholder = document.getElementById('negocios-colab-placeholder');
  if (!ctx || !placeholder) return;

  let negociosPorColaborador = {};
   simulatedData.colaboradores.forEach(col => {
       const count = simulatedData.micronegocios.filter(n => n.id_colaborador === col.id_colaborador).length;
       negociosPorColaborador[col.id_colaborador] = { nombre: col.nombre || col.matricula_col, count: count };
   });

   const labels = Object.values(negociosPorColaborador).map(data => data.nombre);
   const data = Object.values(negociosPorColaborador).map(data => data.count);

   if (labels.length > 0) {
       placeholder.style.display = 'none';
       chartInstances.negociosColab = new Chart(ctx, {
           type: 'bar',
           data: {
               labels: labels,
               datasets: [{
                   label: 'Negocios Registrados',
                   data: data,
                   backgroundColor: 'rgba(0, 90, 163, 0.7)', // Coppel Blue
                   borderColor: 'rgba(0, 90, 163, 1)',
                   borderWidth: 1,
                   borderRadius: 4,
                   hoverBackgroundColor: 'rgba(255, 215, 0, 0.8)' // Coppel Yellow hover
               }]
           },
           options: chartOptions('Negocios Registrados', true, false) // Generic options
       });
   } else {
       placeholder.textContent = 'No hay datos de negocios por colaborador.';
       placeholder.style.display = 'block';
   }
}

function renderProgresoTipoChart(lecciones, webinars) {
  const ctx = document.getElementById('dash-progreso-tipo-chart')?.getContext('2d');
   const placeholder = document.getElementById('progreso-tipo-placeholder');
   if (!ctx || !placeholder) return;

   if (lecciones > 0 || webinars > 0) {
        placeholder.style.display = 'none';
       chartInstances.progresoTipo = new Chart(ctx, {
           type: 'pie',
           data: {
               labels: ['Lecciones Vistas', 'Webinars Vistos'],
               datasets: [{
                   label: 'Tipo de Contenido Completado',
                   data: [lecciones, webinars],
                   backgroundColor: [
                       'rgba(0, 90, 163, 0.8)',  // Coppel Blue
                       'rgba(255, 215, 0, 0.8)'   // Coppel Yellow
                   ],
                   borderColor: [
                       'rgba(0, 90, 163, 1)',
                       'rgba(255, 215, 0, 1)'
                   ],
                   borderWidth: 1
               }]
           },
           options: chartOptions('Contenido Completado', false, true) // Options for Pie/Doughnut
       });
   } else {
       placeholder.textContent = 'No hay datos de progreso.';
        placeholder.style.display = 'block';
   }
}

function renderIncentivosTipoChart(earnedIncentivesList) {
    const ctx = document.getElementById('dash-incentivos-tipo-chart')?.getContext('2d');
    const placeholder = document.getElementById('incentivos-tipo-placeholder');
    if (!ctx || !placeholder) return;

    const incentivosPorTipo = {};
    earnedIncentivesList.forEach(item => {
        const tipo = item.incentivo.tipo || 'Desconocido';
        incentivosPorTipo[tipo] = (incentivosPorTipo[tipo] || 0) + 1;
    });

    const labels = Object.keys(incentivosPorTipo);
    const data = Object.values(incentivosPorTipo);

    if (labels.length > 0) {
        placeholder.style.display = 'none';
        chartInstances.incentivosTipo = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Incentivos por Tipo',
                    data: data,
                    backgroundColor: [ // Coppel color palette + derivatives
                        'rgba(0, 90, 163, 0.8)', // Coppel Blue
                        'rgba(255, 215, 0, 0.8)', // Coppel Yellow
                        'rgba(0, 123, 255, 0.7)', // Lighter Blue
                        'rgba(255, 193, 7, 0.7)',  // Softer Yellow/Orange
                        'rgba(108, 117, 125, 0.7)' // Gray
                    ],
                    borderColor: '#fff', // White border for segments
                    borderWidth: 2
                }]
            },
           options: chartOptions('Incentivos por Tipo', false, true, true) // Options for Doughnut
        });
    } else {
        placeholder.textContent = 'No se han otorgado incentivos.';
         placeholder.style.display = 'block';
    }
}

function renderMetasColaboradorChart() {
    const ctx = document.getElementById('dash-metas-colab-chart')?.getContext('2d');
    const placeholder = document.getElementById('metas-colab-placeholder');
    if (!ctx || !placeholder) return;

    const labels = [];
    const negociosData = [];
    const metasData = [];

    simulatedData.colaboradores.forEach(col => {
        labels.push(col.nombre || col.matricula_col);
        const negociosRegistrados = simulatedData.micronegocios.filter(n => n.id_colaborador === col.id_colaborador).length;
        negociosData.push(negociosRegistrados);
        metasData.push(col.meta_negocios || 10); // Default meta if undefined
    });

    if (labels.length > 0) {
        placeholder.style.display = 'none';
        chartInstances.metasColab = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Negocios Registrados',
                        data: negociosData,
                        backgroundColor: 'rgba(0, 90, 163, 0.7)', // Coppel Blue
                        borderColor: 'rgba(0, 90, 163, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                    {
                        label: 'Meta de Negocios',
                        data: metasData,
                        backgroundColor: 'rgba(255, 215, 0, 0.6)', // Coppel Yellow (softer)
                        borderColor: 'rgba(255, 215, 0, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    }
                ]
            },
            options: chartOptions('Comparativa vs Meta', true, true) // Show legend here
        });
    } else {
         placeholder.textContent = 'No hay datos de colaboradores para mostrar metas.';
         placeholder.style.display = 'block';
    }
}

// --- Chart.js Helper Function for Common Options ---
function chartOptions(titleText = '', showAxes = true, showLegend = false, isDoughnut = false) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          color: '#333',
          font: { size: 11 }
        }
      },
      title: {
        display: false, // Use card header instead
        text: titleText,
        font: { size: 14, weight: '600' },
        color: '#333'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'var(--coppel-yellow)',
        bodyColor: '#fff',
        borderColor: 'var(--coppel-yellow)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          // Add custom tooltip callbacks if needed
        }
      }
    },
    scales: {} // Initialize scales object
  };

  if (showAxes) {
    options.scales = {
      y: {
        display: true,
        beginAtZero: true,
        ticks: { color: '#555', stepSize: isDoughnut ? undefined : 2 }, // Adjust stepSize as needed
        title: { display: false },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        display: true,
        ticks: { color: '#555', font: { size: 10 } },
        title: { display: false },
        grid: { display: false }
      }
    };
  } else {
      // Hide axes for Pie/Doughnut
      delete options.scales;
  }


  if (isDoughnut) {
    options.cutout = '60%'; // Doughnut hole size
  }

  return options;
}


// =========================================================================
// OTHER SECTION RENDERING FUNCTIONS (Colaboradores, Progreso, Incentivos)
// =========================================================================

function renderColaboradoresList(colaboradores) {
  const listContainer = document.getElementById("colaboradores-list");
  if (!listContainer) return;
  listContainer.innerHTML = ""; // Clear previous list

  if (!colaboradores || colaboradores.length === 0) {
    listContainer.innerHTML = "<p>No se encontraron colaboradores.</p>";
    return;
  }

  colaboradores.forEach((col, index) => {
    const negociosRegistrados = simulatedData.micronegocios.filter(
      (n) => n.id_colaborador === col.id_colaborador
    ).length;
    const { progressText, incentiveStatusClass } = calculateIncentiveProgress(col.id_colaborador);

    const card = document.createElement("div");
    // Use the updated CSS class structure if available
    card.className = "collaborator-card card slide-in-right"; // Add 'card' class if using generic card styles
    card.style.animationDelay = `${index * 0.05}s`;
    card.dataset.id = col.id_colaborador;

    card.innerHTML = `
          <div class="collaborator-avatar">${
            col.nombre ? col.nombre.substring(0, 2).toUpperCase() : col.matricula_col.substring(1, 3)
          }</div>
          <div class="collaborator-info">
              <h3>${col.nombre || `Matrícula: ${col.matricula_col}`} (${col.num_empleado || 'N/A'})</h3>
              <p>Negocios Registrados: ${negociosRegistrados} / ${col.meta_negocios || 10}</p>
              <p class="incentive-progress ${incentiveStatusClass}">Progreso Incentivo: ${progressText}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#005AA3" class="arrow-icon">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
      `;
    card.addEventListener("click", () => showCollaboratorDetails(col.id_colaborador));
    listContainer.appendChild(card);
  });
}

function showCollaboratorDetails(colaboradorId) {
    const colaborador = simulatedData.colaboradores.find(c => c.id_colaborador === colaboradorId);
    const modal = document.getElementById("colaborador-modal");
    const modalBody = document.getElementById("colaborador-modal-body");
    const modalTitle = document.getElementById("colaborador-modal-title");

    if (!colaborador || !modal || !modalBody || !modalTitle) {
        console.error("Error showing collaborator details: Missing element or data.");
        return;
    }

    const negocios = simulatedData.micronegocios.filter(n => n.id_colaborador === colaboradorId);
    const { progressDetails, earnedIncentives } = calculateIncentiveProgress(colaboradorId, true);

    modalTitle.textContent = `Detalles de ${colaborador.nombre || colaborador.matricula_col}`;

    let negociosHtml = "<h4>Negocios Registrados:</h4>";
    if (negocios.length > 0) {
        negociosHtml += '<ul class="details-list">'; // Use a class for styling
        negocios.forEach(n => {
            const progresoNegocio = simulatedData.progreso.filter(p => p.id_negocio === n.id_negocio);
            const leccionesVistasSet = new Set();
             const webinarsVistosSet = new Set();
             progresoNegocio.forEach(p => {
                 const contenido = simulatedData.contenido.find(c => c.id_contenido === p.id_contenido);
                 if(contenido?.tipo === 'leccion') leccionesVistasSet.add(p.id_contenido);
                 else if(contenido?.tipo === 'webinar') webinarsVistosSet.add(p.id_contenido);
             });
            const leccionesVistas = leccionesVistasSet.size;
            const webinarsVistos = webinarsVistosSet.size;
            const llaves = simulatedData.llaves.find(l => l.id_negocio === n.id_negocio)?.total || 0;
            negociosHtml += `<li><strong>${n.nombre}</strong> (${n.propietario})<br><small>${leccionesVistas} lecc., ${webinarsVistos} web., ${llaves} llaves</small></li>`;
        });
        negociosHtml += "</ul>";
    } else {
        negociosHtml += "<p>Ningún negocio registrado aún.</p>";
    }

    let incentivosHtml = "<h4>Progreso de Incentivos:</h4>";
    incentivosHtml += `<p>Negocios con meta: ${progressDetails.negociosConMetaLecciones} / ${progressDetails.reqNegocios} (Req. ${progressDetails.reqLecciones} lecc.)</p>`;
    if (earnedIncentives.length > 0) {
        incentivosHtml += '<h5>Incentivos Ganados:</h5><ul class="details-list">';
        earnedIncentives.forEach(inc => {
            incentivosHtml += `<li>${inc.nombre} (${inc.tipo})</li>`;
        });
        incentivosHtml += "</ul>";
    } else {
        incentivosHtml += "<p>Aún no ha ganado incentivos.</p>";
    }

    modalBody.innerHTML = `
          <div class="detail-section">
              <h4>Información Básica</h4>
              <div class="info-row"><span class="info-label">Nombre:</span><span class="info-value">${colaborador.nombre || "N/D"}</span></div>
              <div class="info-row"><span class="info-label">Matrícula:</span><span class="info-value">${colaborador.matricula_col}</span></div>
              <div class="info-row"><span class="info-label">No. Empleado:</span><span class="info-value">${colaborador.num_empleado || 'N/A'}</span></div>
              <div class="info-row"><span class="info-label">Meta Negocios:</span><span class="info-value">${colaborador.meta_negocios || 10}</span></div>
          </div>
          <div class="detail-section">
              ${negociosHtml}
          </div>
          <div class="detail-section">
               ${incentivosHtml}
          </div>
      `;

    modal.style.display = "block"; // Use block or flex depending on your modal CSS
}


function renderProgresoList(micronegocios) {
  const listContainer = document.getElementById("progreso-list");
  if (!listContainer) return;
  listContainer.innerHTML = ""; // Clear

  if (!micronegocios || micronegocios.length === 0) {
    listContainer.innerHTML = "<p>No hay microempresarios registrados.</p>";
    return;
  }

  const totalLecciones = simulatedData.contenido.filter(c => c.tipo === "leccion").length;

  micronegocios.forEach((negocio, index) => {
    const colaborador = simulatedData.colaboradores.find(c => c.id_colaborador === negocio.id_colaborador);
    const progreso = simulatedData.progreso.filter(p => p.id_negocio === negocio.id_negocio);
    const llavesData = simulatedData.llaves.find(l => l.id_negocio === negocio.id_negocio);

    const leccionesVistas = new Set(progreso.map(p => p.id_contenido).filter(id => simulatedData.contenido.find(c => c.id_contenido === id)?.tipo === "leccion")).size;
    const webinarsVistos = new Set(progreso.map(p => p.id_contenido).filter(id => simulatedData.contenido.find(c => c.id_contenido === id)?.tipo === "webinar")).size;

    const progressPercent = totalLecciones > 0 ? ((leccionesVistas / totalLecciones) * 100).toFixed(0) : 0;

    const card = document.createElement("div");
    card.className = "course-card card slide-in-right"; // Add 'card' class
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
          <div class="course-header card-header"> <!-- Add card-header -->
              <h3>${negocio.nombre} (${negocio.propietario})</h3>
              <span class="progress-badge">Col: ${colaborador ? (colaborador.nombre || colaborador.matricula_col) : "N/A"}</span>
          </div>
          <div class="card-body"> <!-- Add card-body -->
              <p>Lecciones: ${leccionesVistas}/${totalLecciones} | Webinars: ${webinarsVistos} | Llaves: ${llavesData?.total || 0} (Usadas: ${llavesData?.usadas || 0})</p>
              <div class="progress-container">
                  <div class="progress-bar" style="width: ${progressPercent}%" title="${progressPercent}% Lecciones Completadas"></div>
              </div>
              <small>Descripción: ${negocio.descripcion_negocio || "N/A"}</small>
          </div>
       `;
    listContainer.appendChild(card);
  });
}

function renderIncentivos() {
  const rulesContainer = document.getElementById("incentive-rules");
  const earnedContainer = document.getElementById("earned-incentives-list");
  if (!rulesContainer || !earnedContainer) return;

  // Show rules
  let rulesHtml = "<ul>";
  simulatedData.incentivos.forEach((inc) => {
    rulesHtml += `<li><strong>${inc.nombre} (${inc.tipo}):</strong> Requiere ${inc.req_negocios} negocios registrados, cada uno con al menos ${inc.req_lecciones} lecciones vistas.</li>`;
  });
  rulesHtml += "</ul><p><em>Nota: Los webinars son opcionales pero suman llaves para el microempresario.</em></p>";
  rulesContainer.innerHTML = rulesHtml;

  // Show winners
  const { earnedIncentivesList } = calculateAllIncentives();
  earnedContainer.innerHTML = ""; // Clear

  if (earnedIncentivesList.length === 0) {
    earnedContainer.innerHTML = "<p>Ningún colaborador ha ganado incentivos aún.</p>";
    return;
  }

  let earnedHtml = "<ul>";
  earnedIncentivesList.forEach((ganador) => {
    earnedHtml += `<li><strong>${ganador.colaborador.nombre || ganador.colaborador.matricula_col}:</strong> Ganó "${ganador.incentivo.nombre}"</li>`;
  });
  earnedHtml += "</ul>";
  earnedContainer.innerHTML = earnedHtml;
}

// =========================================================================
// CALCULATION & FILTERING FUNCTIONS
// =========================================================================

function calculateIncentiveProgress(colaboradorId, detailed = false) {
  const colaborador = simulatedData.colaboradores.find(c => c.id_colaborador === colaboradorId);
  if (!colaborador) return { progressText: "Colaborador no encontrado", incentiveStatusClass: "inactive", progressDetails: {}, earnedIncentives: [] };

  const negociosColaborador = simulatedData.micronegocios.filter(n => n.id_colaborador === colaboradorId);
  const incentivoBase = simulatedData.incentivos[0]; // Assuming all incentives share base requirements for now
  if (!incentivoBase) return { progressText: "No hay reglas de incentivos", incentiveStatusClass: "inactive", progressDetails: {}, earnedIncentives: [] };

  const reqNegocios = incentivoBase.req_negocios;
  const reqLecciones = incentivoBase.req_lecciones;

  let negociosConMetaLecciones = 0;
  negociosColaborador.forEach((negocio) => {
    const progresoNegocio = simulatedData.progreso.filter(p => p.id_negocio === negocio.id_negocio);
    const leccionesVistas = new Set(progresoNegocio.map(p => p.id_contenido).filter(id => simulatedData.contenido.find(c => c.id_contenido === id)?.tipo === "leccion")).size;
    if (leccionesVistas >= reqLecciones) {
      negociosConMetaLecciones++;
    }
  });

  const cumpleMetaNegocios = negociosConMetaLecciones >= reqNegocios;
  let progressText = `${negociosConMetaLecciones}/${reqNegocios} negocios c/ ≥${reqLecciones} lecc.`;
  let incentiveStatusClass = "inactive";
  let earnedIncentives = [];

  if (cumpleMetaNegocios) {
    progressText = `¡Meta Cumplida! (${negociosConMetaLecciones} negocios)`;
    incentiveStatusClass = "active";
    earnedIncentives = simulatedData.incentivos; // Simplified: award all if met
  } else if (negociosConMetaLecciones > 0) {
    incentiveStatusClass = "pending";
  }

  if (detailed) {
    return { progressText, incentiveStatusClass, progressDetails: { negociosConMetaLecciones, reqNegocios, reqLecciones }, earnedIncentives };
  } else {
    return { progressText, incentiveStatusClass };
  }
}

function calculateAllIncentives() {
  let earnedIncentivesCount = 0;
  let earnedIncentivesList = []; // { colaborador, incentivo }

  simulatedData.colaboradores.forEach((col) => {
    const { earnedIncentives } = calculateIncentiveProgress(col.id_colaborador, true);
    if (earnedIncentives.length > 0) {
      earnedIncentives.forEach((inc) => {
        earnedIncentivesList.push({ colaborador: col, incentivo: inc });
        earnedIncentivesCount++;
      });
    }
  });
  // simulatedData.incentivos_ganados = earnedIncentivesList.map(...) // Persist if needed
  return { earnedIncentivesCount, earnedIncentivesList };
}

function filterColaboradores(searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  const colaboradoresToShow = !lowerSearchTerm
    ? simulatedData.colaboradores
    : simulatedData.colaboradores.filter(col =>
        (col.nombre && col.nombre.toLowerCase().includes(lowerSearchTerm)) ||
        col.matricula_col.toLowerCase().includes(lowerSearchTerm) ||
        (col.num_empleado && col.num_empleado.toLowerCase().includes(lowerSearchTerm))
      );
  renderColaboradoresList(colaboradoresToShow);
}

function filterProgreso(searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  const negociosToShow = !lowerSearchTerm
    ? simulatedData.micronegocios
    : simulatedData.micronegocios.filter((negocio) => {
        const colaborador = simulatedData.colaboradores.find(c => c.id_colaborador === negocio.id_colaborador);
        return (
          negocio.nombre.toLowerCase().includes(lowerSearchTerm) ||
          negocio.propietario.toLowerCase().includes(lowerSearchTerm) ||
          (colaborador && (
              (colaborador.nombre && colaborador.nombre.toLowerCase().includes(lowerSearchTerm)) ||
              colaborador.matricula_col.toLowerCase().includes(lowerSearchTerm)
          ))
        );
      });
  renderProgresoList(negociosToShow);
}