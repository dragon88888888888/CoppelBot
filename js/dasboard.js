/**
 * voice_dashboard_clean.js
 * 
 * Sistema de asistente por voz que integra las respuestas de LangGraph
 * directamente en las secciones del dashboard existente
 */

// Configuración para LangGraph
const LANGGRAPH_BASE_URL = "https://ad-cigarette-hollywood-military.trycloudflare.com/langgraph";
const ASSISTANT_GRAPH_ID = "assistant_graph";
const ROUTER_ASSISTANT_ID = "0c9ef1b4-15a8-4529-a82a-7989a1f705c7";

// Variables globales
let activeThreadId = null;
let currentDashboardCharts = {}; // Para gestionar los gráficos del dashboard

/**
 * Inicializa el dashboard de voz integrado
 */
function initVoiceDashboard() {
    console.log("Inicializando Voice Dashboard...");

    // Configurar el botón de voz
    const voiceAssistantBtn = document.querySelector('.voice-dashboard-input .btn-primary');

    if (!voiceAssistantBtn) {
        console.error("No se encontró el botón del asistente de voz");
        return;
    }

    // Crear un indicador temporal para notificaciones
    if (!document.getElementById('voice-status-indicator')) {
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'voice-status-indicator';
        statusIndicator.className = 'voice-status-indicator hidden';
        document.body.appendChild(statusIndicator);
    }

    // Inicializar LangGraph
    initializeLangGraphConversation().then(success => {
        if (success) {
            console.log("LangGraph inicializado correctamente");
        } else {
            console.error("Error al inicializar LangGraph");
        }
    });

    // Configurar reconocimiento de voz
    setupSpeechRecognition(voiceAssistantBtn);
}

/**
 * Configura el reconocimiento de voz
 */
function setupSpeechRecognition(voiceButton) {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("El navegador no soporta reconocimiento de voz");
        voiceButton.addEventListener('click', function () {
            showStatusIndicator("Tu navegador no soporta reconocimiento de voz", "error");
        });
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-MX';

    let isWaitingForFinalResult = false;

    // Evento para el botón de voz
    voiceButton.addEventListener('click', function () {
        if (voiceButton.classList.contains('listening')) {
            // Detener si ya está escuchando
            recognition.stop();
            voiceButton.classList.remove('listening');
            showStatusIndicator("Escucha cancelada", "info");
        } else {
            // Iniciar escucha
            try {
                recognition.start();
                voiceButton.classList.add('listening');
                showStatusIndicator("Escuchando...", "listening");
                isWaitingForFinalResult = true;
            } catch (error) {
                console.error('Error al iniciar reconocimiento de voz:', error);
                showStatusIndicator("Error al iniciar el reconocimiento de voz", "error");
            }
        }
    });

    // Evento cuando se reciben resultados
    recognition.onresult = function (event) {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        showStatusIndicator(transcript, "listening");

        // Si es el resultado final
        if (event.results[0].isFinal && isWaitingForFinalResult) {
            isWaitingForFinalResult = false;
            showStatusIndicator("Procesando: " + transcript, "processing");
            processVoiceQuery(transcript);
        }
    };

    // Evento cuando termina el reconocimiento
    recognition.onend = function () {
        voiceButton.classList.remove('listening');
        if (isWaitingForFinalResult) {
            showStatusIndicator("No escuché nada, intenta de nuevo", "error");
        }
        isWaitingForFinalResult = false;
    };

    // Evento en caso de error
    recognition.onerror = function (event) {
        voiceButton.classList.remove('listening');
        console.error('Error en reconocimiento de voz:', event.error);
        showStatusIndicator("Ocurrió un error, intenta de nuevo", "error");
        isWaitingForFinalResult = false;
    };
}

/**
 * Muestra una notificación temporal
 */
function showStatusIndicator(message, status = "info") {
    const indicator = document.getElementById('voice-status-indicator');
    if (!indicator) return;

    // Configurar el indicador
    indicator.textContent = message;
    indicator.className = 'voice-status-indicator voice-status-' + status;
    indicator.classList.remove('hidden');

    // Ocultar después de un tiempo
    clearTimeout(window.statusIndicatorTimeout);
    window.statusIndicatorTimeout = setTimeout(() => {
        indicator.classList.add('hidden');
    }, status === 'error' ? 5000 : 3000);
}

/**
 * Procesa una consulta de voz
 */
async function processVoiceQuery(query) {
    console.log('Procesando consulta de voz:', query);

    try {
        // Asegurar conexión con LangGraph
        if (!activeThreadId) {
            showStatusIndicator("Iniciando conexión con el asistente...", "processing");
            const initialized = await initializeLangGraphConversation();
            if (!initialized) {
                showStatusIndicator("No se pudo conectar con el asistente. Inténtalo de nuevo.", "error");
                return;
            }
        }

        // Enviar consulta al asistente
        showStatusIndicator("Consultando al asistente...", "processing");
        const response = await getAssistantResponse(query, activeThreadId);

        if (response && response.assistantResponse) {
            // Reproducir respuesta con voz
            speakResponse(response.assistantResponse);

            // Intentar actualizar el dashboard con los resultados
            if (response.toolContent) {
                console.log("Datos para dashboard encontrados, actualizando visualización...");
                updateDashboardWithResults(response.assistantResponse, response.toolContent);
            } else {
                console.log("No se encontraron datos para el dashboard en la respuesta");
                showStatusIndicator(response.assistantResponse, "success");
            }
        } else {
            showStatusIndicator("No obtuve respuesta del asistente. Inténtalo de nuevo.", "error");
        }
    } catch (error) {
        console.error('Error al procesar consulta:', error);
        showStatusIndicator("Ocurrió un error al procesar tu consulta.", "error");
    }
}

/**
 * Actualiza el dashboard con los resultados de la consulta
 */
function updateDashboardWithResults(textResponse, toolContent) {
    // Analizar el tipo de consulta para determinar qué sección actualizar
    let queryType = determineQueryType(textResponse, toolContent);

    // Según el tipo de consulta, actualizar la sección correspondiente
    switch (queryType) {
        case 'colaboradores':
            updateColaboradoresSection(textResponse, toolContent);
            break;
        case 'clientes':
            updateClientesSection(textResponse, toolContent);
            break;
        case 'negocios':
            createGenericResultCard("Resultado: Información de Negocios", textResponse, toolContent);
            break;
        case 'incentivos':
            createGenericResultCard("Resultado: Información de Incentivos", textResponse, toolContent);
            break;
        default:
            // Tipo desconocido, mostrar un resultado genérico
            createGenericResultCard("Resultado de la Consulta", textResponse, toolContent);
            break;
    }

    // Notificar al usuario que se actualizó el dashboard
    showStatusIndicator("Dashboard actualizado con los resultados", "success");
}

/**
 * Determina el tipo de consulta basado en el texto y los datos
 */
function determineQueryType(textResponse, toolContent) {
    const text = textResponse.toLowerCase();

    // Detectar palabras clave en el texto
    if (text.includes('colaborador') || text.includes('registró') || text.includes('carlos') ||
        text.includes('sofía') || text.includes('luis') || text.includes('empleado')) {
        return 'colaboradores';
    }

    if (text.includes('cliente') || text.includes('debe') || text.includes('deuda') ||
        text.includes('maría') || text.includes('gonzález') || text.includes('crédito')) {
        return 'clientes';
    }

    if (text.includes('negocio') || text.includes('tienda') || text.includes('abarrotes') ||
        text.includes('tacos') || text.includes('estética') || text.includes('papelería')) {
        return 'negocios';
    }

    if (text.includes('incentivo') || text.includes('incentivos') || text.includes('premio') ||
        text.includes('bono') || text.includes('vacaciones') || text.includes('descuento')) {
        return 'incentivos';
    }

    // Por defecto, si no podemos determinar el tipo
    return 'generico';
}

/**
 * Actualiza la sección de Colaboradores con los resultados
 */
function updateColaboradoresSection(textResponse, toolContent) {
    // Primero, necesitamos asegurarnos de que estamos en la sección de dashboard
    const dashboardButton = document.querySelector('.nav-btn[data-section="dashboard"]');
    if (dashboardButton && !dashboardButton.classList.contains('active')) {
        dashboardButton.click(); // Cambiar a la sección de dashboard
    }

    // Obtener el contenedor de resultados
    const resultContainer = document.getElementById('query-results-container');
    if (!resultContainer) {
        console.error("No se encontró el contenedor de resultados");
        return;
    }

    // Limpiar contenedor existente
    resultContainer.innerHTML = '';

    // Crear título con los resultados
    const title = document.createElement('h2');
    title.className = 'slide-in-left';
    title.textContent = 'Resultado: Colaborador con Más Negocios';
    resultContainer.appendChild(title);

    // Extraer información relevante del resultado para el colaborador destacado
    const colaboradorInfo = extractColaboradorInfo(textResponse, toolContent);

    // Crear la tarjeta de resumen destacado
    const summaryCard = document.createElement('div');
    summaryCard.className = 'summary-highlight card swing-in-top-fwd';
    summaryCard.innerHTML = `
        <div class="card-header"><h3>Hallazgo Principal</h3></div>
        <div class="card-body" id="top-performer-summary">
            <div class="top-performer-card">
                <div class="collaborator-avatar">${colaboradorInfo.iniciales}</div>
                <div class="collaborator-info">
                    <h3>${colaboradorInfo.nombre}</h3>
                    <p>Registró <strong>${colaboradorInfo.negocios}</strong> Negocios</p>
                </div>
            </div>
        </div>
    `;
    resultContainer.appendChild(summaryCard);

    // Crear contenedor para el gráfico
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container card swing-in-top-fwd';
    chartContainer.style.animationDelay = '0.1s';
    chartContainer.innerHTML = `
        <div class="card-header">
            <h3>Comparativa: Negocios por Colaborador</h3>
        </div>
        <div class="card-body">
            <canvas id="colaborador-negocios-chart"></canvas>
        </div>
    `;
    resultContainer.appendChild(chartContainer);

    // Crear tarjeta de análisis
    const analysisCard = document.createElement('div');
    analysisCard.className = 'textual-analysis card swing-in-top-fwd';
    analysisCard.style.animationDelay = '0.2s';
    analysisCard.innerHTML = `
        <div class="card-header"><h3>Análisis Rápido</h3></div>
        <div class="card-body">
            <p id="analysis-text">${textResponse}</p>
        </div>
    `;
    resultContainer.appendChild(analysisCard);

    // Renderizar el gráfico
    renderChartFromLangGraph(
        'colaborador-negocios-chart',
        toolContent,
        'colaboradores'
    );
}

/**
 * Extrae información sobre colaboradores del resultado
 */
function extractColaboradorInfo(textResponse, toolContent) {
    // Valores por defecto
    let info = {
        nombre: 'Colaborador',
        iniciales: 'CN',
        negocios: 0
    };

    // Intentar extraer el nombre del colaborador del texto
    const nombreMatch = textResponse.match(/([A-Za-zÁáÉéÍíÓóÚúÑñ]+\s+[A-Za-zÁáÉéÍíÓóÚúÑñ]+)(?:\s+es el colaborador|\s+registró|\s+tiene)/i);
    if (nombreMatch && nombreMatch[1]) {
        info.nombre = nombreMatch[1];
        const partes = info.nombre.split(' ');
        if (partes.length >= 2) {
            info.iniciales = partes[0].charAt(0) + partes[1].charAt(0);
        } else {
            info.iniciales = partes[0].substring(0, 2);
        }
    }

    // Intentar extraer la cantidad de negocios
    const negociosMatch = textResponse.match(/(\d+)\s+(?:negocios|negocio)/i);
    if (negociosMatch && negociosMatch[1]) {
        info.negocios = parseInt(negociosMatch[1]);
    }

    // Si tenemos datos del chart_config, extraer más información
    if (toolContent && toolContent.chart_config && toolContent.chart_config.config) {
        const chartConfig = toolContent.chart_config.config;
        if (chartConfig.data && chartConfig.data.datasets && chartConfig.data.datasets.length > 0) {
            const dataset = chartConfig.data.datasets[0];
            const labels = chartConfig.data.labels;

            // Encontrar el valor máximo y su índice
            if (dataset.data && dataset.data.length > 0) {
                const maxValue = Math.max(...dataset.data);
                const maxIndex = dataset.data.indexOf(maxValue);

                if (maxIndex >= 0 && labels && labels[maxIndex]) {
                    info.nombre = labels[maxIndex];
                    const partes = info.nombre.split(' ');
                    if (partes.length >= 2) {
                        info.iniciales = partes[0].charAt(0) + partes[1].charAt(0);
                    } else {
                        info.iniciales = partes[0].substring(0, 2);
                    }
                    info.negocios = maxValue;
                }
            }
        }
    }

    // Validar que las iniciales estén en mayúsculas
    info.iniciales = info.iniciales.toUpperCase();

    return info;
}

/**
 * Actualiza la sección de Clientes con los resultados
 */
function updateClientesSection(textResponse, toolContent) {
    // Cambiamos a la sección de dashboard si no estamos en ella
    const dashboardButton = document.querySelector('.nav-btn[data-section="dashboard"]');
    if (dashboardButton && !dashboardButton.classList.contains('active')) {
        dashboardButton.click();
    }

    // Obtener el contenedor de resultados
    const resultContainer = document.getElementById('query-results-container');
    if (!resultContainer) {
        console.error("No se encontró el contenedor de resultados");
        return;
    }

    // Limpiar contenedor existente
    resultContainer.innerHTML = '';

    // Crear título con los resultados
    const title = document.createElement('h2');
    title.className = 'slide-in-left';
    title.textContent = 'Resultado: Cliente con Mayor Deuda';
    resultContainer.appendChild(title);

    // Extraer información del cliente
    const clienteInfo = extractClienteInfo(textResponse, toolContent);

    // Crear la tarjeta de resumen destacado
    const summaryCard = document.createElement('div');
    summaryCard.className = 'summary-highlight card swing-in-top-fwd';
    summaryCard.innerHTML = `
        <div class="card-header"><h3>Hallazgo Principal</h3></div>
        <div class="card-body" id="top-performer-summary">
            <div class="client-info">
                <h3>${clienteInfo.nombre}</h3>
                <p>Deuda Total: <strong>$${clienteInfo.deuda.toLocaleString('es-MX')}</strong></p>
            </div>
        </div>
    `;
    resultContainer.appendChild(summaryCard);

    // Crear contenedor para el gráfico
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container card swing-in-top-fwd';
    chartContainer.style.animationDelay = '0.1s';
    chartContainer.innerHTML = `
        <div class="card-header">
            <h3>Deuda Total por Cliente</h3>
        </div>
        <div class="card-body">
            <canvas id="cliente-deuda-chart"></canvas>
        </div>
    `;
    resultContainer.appendChild(chartContainer);

    // Crear tarjeta de análisis
    const analysisCard = document.createElement('div');
    analysisCard.className = 'textual-analysis card swing-in-top-fwd';
    analysisCard.style.animationDelay = '0.2s';
    analysisCard.innerHTML = `
        <div class="card-header"><h3>Análisis Rápido</h3></div>
        <div class="card-body">
            <p id="analysis-text">${textResponse}</p>
        </div>
    `;
    resultContainer.appendChild(analysisCard);

    // Renderizar el gráfico
    renderChartFromLangGraph(
        'cliente-deuda-chart',
        toolContent,
        'clientes'
    );
}

/**
 * Extrae información sobre clientes del resultado
 */
function extractClienteInfo(textResponse, toolContent) {
    // Valores iniciales
    let info = {
        nombre: 'Cliente',
        deuda: 0
    };

    // Intentar extraer el nombre del cliente del texto
    const nombreMatch = textResponse.match(/([A-Za-zÁáÉéÍíÓóÚúÑñ]+(?:\s+[A-Za-zÁáÉéÍíÓóÚúÑñ]+){1,3})(?:\s+es el cliente|\s+debe|\s+tiene una deuda)/i);
    if (nombreMatch && nombreMatch[1]) {
        info.nombre = nombreMatch[1];
    }

    // Intentar extraer la cantidad de deuda
    const deudaMatch = textResponse.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:pesos|MXN|\$)?/);
    if (deudaMatch && deudaMatch[1]) {
        // Reemplazar comas para poder convertir a número
        const deudaStr = deudaMatch[1].replace(/,/g, '');
        info.deuda = parseFloat(deudaStr);
    }

    // Si tenemos datos del toolContent, extraer más información
    if (toolContent && toolContent.raw_data && toolContent.raw_data.length > 0) {
        // Buscar el cliente con mayor deuda
        let maxDeuda = 0;
        let clienteMaxDeuda = null;

        for (const item of toolContent.raw_data) {
            // Buscar campo de deuda
            let deudaField = null;
            for (const key in item) {
                if ((key.includes('deuda') || key.includes('monto')) && !isNaN(parseFloat(item[key]))) {
                    deudaField = key;
                    break;
                }
            }

            if (deudaField && parseFloat(item[deudaField]) > maxDeuda) {
                maxDeuda = parseFloat(item[deudaField]);
                clienteMaxDeuda = item;
            }
        }

        if (clienteMaxDeuda) {
            // Construir el nombre completo
            let nombreCompleto = [];
            if (clienteMaxDeuda.nombre) nombreCompleto.push(clienteMaxDeuda.nombre);
            if (clienteMaxDeuda.apellido_paterno) nombreCompleto.push(clienteMaxDeuda.apellido_paterno);
            if (clienteMaxDeuda.apellido_materno) nombreCompleto.push(clienteMaxDeuda.apellido_materno);

            if (nombreCompleto.length > 0) {
                info.nombre = nombreCompleto.join(' ');
            }

            // Actualizar la deuda
            if (maxDeuda > 0) {
                info.deuda = maxDeuda;
            }
        }
    }

    return info;
}

/**
 * Crea una tarjeta de resultado genérica
 */
function createGenericResultCard(title, textResponse, toolContent) {
    // Cambiar a la sección de dashboard si no estamos en ella
    const dashboardButton = document.querySelector('.nav-btn[data-section="dashboard"]');
    if (dashboardButton && !dashboardButton.classList.contains('active')) {
        dashboardButton.click();
    }

    // Obtener el contenedor de resultados
    const resultContainer = document.getElementById('query-results-container');
    if (!resultContainer) {
        console.error("No se encontró el contenedor de resultados");
        return;
    }

    // Limpiar contenedor existente
    resultContainer.innerHTML = '';

    // Crear título con los resultados
    const titleElement = document.createElement('h2');
    titleElement.className = 'slide-in-left';
    titleElement.textContent = title;
    resultContainer.appendChild(titleElement);

    // Crear la tarjeta de resumen destacado
    const summaryCard = document.createElement('div');
    summaryCard.className = 'summary-highlight card swing-in-top-fwd';
    summaryCard.innerHTML = `
        <div class="card-header"><h3>Respuesta</h3></div>
        <div class="card-body">
            <p>${textResponse}</p>
        </div>
    `;
    resultContainer.appendChild(summaryCard);

    // Si hay datos para gráfico, crear contenedor
    if (toolContent && (toolContent.chart_config || toolContent.context_data || toolContent.raw_data)) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container card swing-in-top-fwd';
        chartContainer.style.animationDelay = '0.1s';
        chartContainer.innerHTML = `
            <div class="card-header">
                <h3>Visualización de Datos</h3>
            </div>
            <div class="card-body">
                <canvas id="generic-result-chart"></canvas>
            </div>
        `;
        resultContainer.appendChild(chartContainer);

        // Renderizar gráfico
        renderChartFromLangGraph(
            'generic-result-chart',
            toolContent,
            'generico'
        );
    }
}

/**
 * Renderiza un gráfico usando los datos de LangGraph
 */
function renderChartFromLangGraph(canvasId, toolContent, type) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`No se encontró el canvas con ID: ${canvasId}`);
        return;
    }

    // Limpiar gráfico existente
    if (currentDashboardCharts[type]) {
        currentDashboardCharts[type].destroy();
        delete currentDashboardCharts[type];
    }

    // Obtener la configuración del chart
    let chartConfig = null;

    // Intentar obtener la configuración del gráfico del toolContent
    if (toolContent.chart_config && toolContent.chart_config.config) {
        chartConfig = toolContent.chart_config.config;
    } else if (toolContent.config) {
        chartConfig = toolContent.config;
    }

    // Si no hay configuración, no podemos mostrar el gráfico
    if (!chartConfig) {
        const chartBody = canvas.parentNode;
        if (chartBody) {
            chartBody.innerHTML = "<p>No se encontró configuración para el gráfico en los datos</p>";
        }
        return;
    }

    // Si los datos del gráfico están vacíos, intentar llenarlos con context_data
    if ((!chartConfig.data.labels || chartConfig.data.labels.length === 0 ||
        !chartConfig.data.datasets[0].data || chartConfig.data.datasets[0].data.length === 0) &&
        toolContent.context_data && toolContent.context_data.length > 0) {

        const contextData = toolContent.context_data;
        const labels = [];
        const data = [];

        for (const item of contextData) {
            // Para clientes, buscar nombre/apellidos y deuda
            if (type === 'clientes') {
                let nombre = "";
                if (item.nombre) {
                    nombre = item.nombre;
                    if (item.apellido_paterno) {
                        nombre += " " + item.apellido_paterno;
                        if (item.apellido_materno) {
                            nombre += " " + item.apellido_materno;
                        }
                    }

                    let valor = null;
                    // Buscar campo de deuda o monto
                    for (const key in item) {
                        if ((key.includes('deuda') || key.includes('monto')) && !isNaN(parseFloat(item[key]))) {
                            valor = parseFloat(item[key]);
                            break;
                        }
                    }

                    if (nombre && valor !== null) {
                        labels.push(nombre);
                        data.push(valor);
                    }
                }
            }
            // Para otros tipos, intentar extraer campos de nombre y valor numérico
            else {
                const keys = Object.keys(item);
                let labelField = keys.find(k => typeof item[k] === 'string' && k !== 'id');
                let valueField = keys.find(k => typeof item[k] === 'number' || !isNaN(parseFloat(item[k])));

                if (!labelField && !valueField && keys.length >= 2) {
                    labelField = keys[0];
                    valueField = keys[1];
                }

                if (labelField && valueField) {
                    labels.push(item[labelField]);
                    data.push(parseFloat(item[valueField]));
                }
            }
        }

        if (labels.length > 0 && data.length > 0) {
            chartConfig.data.labels = labels;
            chartConfig.data.datasets[0].data = data;
        }
    }

    // Verificar si aún tenemos datos válidos
    if (!chartConfig.data.labels || chartConfig.data.labels.length === 0 ||
        !chartConfig.data.datasets[0].data || chartConfig.data.datasets[0].data.length === 0) {
        const chartBody = canvas.parentNode;
        if (chartBody) {
            chartBody.innerHTML = "<p>No hay datos suficientes para mostrar un gráfico</p>";
        }
        return;
    }

    // Asegurar opciones básicas para mejor visualización
    if (!chartConfig.options) {
        chartConfig.options = {};
    }

    chartConfig.options.responsive = true;
    chartConfig.options.maintainAspectRatio = false;

    // Crear el gráfico
    try {
        const ctx = canvas.getContext('2d');
        currentDashboardCharts[type] = new Chart(ctx, chartConfig);
    } catch (error) {
        console.error(`Error al crear el gráfico: ${error.message}`);
        const chartBody = canvas.parentNode;
        if (chartBody) {
            chartBody.innerHTML = `<p>Error al crear el gráfico: ${error.message}</p>`;
        }
    }
}

/**
 * Reproduce la respuesta usando síntesis de voz
 */
function speakResponse(text) {
    if ('speechSynthesis' in window) {
        // Cancelar cualquier síntesis en progreso
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Intentar encontrar una voz en español
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(voice => voice.lang.includes('es'));

        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}

/**
 * Genera un UUID v4
 */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Extrae y formatea el JSON del contenido de una herramienta
 */
function extractToolContent(content) {
    try {
        // El contenido viene en un formato específico que necesitamos parsear
        const parsedContent = JSON.parse(content);

        // Si es un array, tomamos el primer elemento
        if (Array.isArray(parsedContent)) {
            const firstItem = parsedContent[0];
            if (firstItem && firstItem.type === "text" && firstItem.text) {
                // Intentamos hacer un JSON.parse de text (que está escapado como string)
                try {
                    return JSON.parse(firstItem.text);
                } catch (e) {
                    return firstItem.text;
                }
            }
        }
        return parsedContent;
    } catch (error) {
        console.error("Error al parsear el contenido de la herramienta:", error);
        return content; // Devolver el contenido original si hay error
    }
}

/**
 * Crea un nuevo hilo de conversación
 */
async function createThread() {
    try {
        const payload = {
            thread_id: uuidv4(),
            metadata: {
                name: "Conversación Dashboard Asistente"
            }
        };

        const response = await fetch(`${LANGGRAPH_BASE_URL}/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Hilo creado exitosamente: ${data.thread_id}`);
        return data.thread_id;
    } catch (error) {
        console.error(`Error al crear hilo: ${error.message}`);
        return null;
    }
}

/**
 * Inicializa el hilo con el grafo build_router_graph
 */
async function initializeThreadWithRouter(threadId) {
    try {
        console.log(`Inicializando hilo con build_router_graph (ID: ${ROUTER_ASSISTANT_ID})...`);

        const payload = {
            assistant_id: ROUTER_ASSISTANT_ID,
            input: {} // Entrada vacía para inicializar el router
        };

        const response = await fetch(`${LANGGRAPH_BASE_URL}/threads/${threadId}/runs/wait`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        console.log("Inicialización completada exitosamente.");
        return true;
    } catch (error) {
        console.error(`Error al inicializar hilo con build_router_graph: ${error.message}`);
        return false;
    }
}

/**
 * Envía un mensaje al asistente y obtiene la respuesta
 */
async function getAssistantResponse(message, threadId) {
    try {
        console.log(`Enviando mensaje al asistente: '${message}'`);

        // Usar directamente el endpoint wait que espera hasta que termine
        const payload = {
            assistant_id: ASSISTANT_GRAPH_ID, // Usamos el grafo del asistente para procesar mensajes
            input: {
                messages: [{ content: message, role: "human" }]
            }
        };

        // Esta llamada bloqueará hasta que la ejecución termine
        const runResponse = await fetch(`${LANGGRAPH_BASE_URL}/threads/${threadId}/runs/wait`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!runResponse.ok) {
            throw new Error(`Error HTTP en la ejecución: ${runResponse.status}`);
        }

        await runResponse.json(); // Consumir el cuerpo de la respuesta

        // Obtener el estado del hilo para ver los mensajes
        const stateResponse = await fetch(`${LANGGRAPH_BASE_URL}/threads/${threadId}/state`);

        if (!stateResponse.ok) {
            throw new Error(`Error HTTP al obtener estado: ${stateResponse.status}`);
        }

        const stateData = await stateResponse.json();

        let toolContent = null;
        let assistantResponse = null;

        if (stateData.values && stateData.values.messages) {
            const messages = stateData.values.messages;

            // Buscar la respuesta de tipo "tool" para obtener el JSON
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg.type === "tool") {
                    toolContent = extractToolContent(msg.content);
                    break;
                }
            }

            // Buscar la respuesta final del asistente
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg.type === "ai" && msg.content) {
                    assistantResponse = msg.content;
                    break;
                }
            }

            return {
                assistantResponse,
                toolContent
            };
        } else {
            console.log("No se encontró la estructura de mensajes esperada");
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

/**
 * Inicializa una conversación con el asistente de LangGraph
 */
async function initializeLangGraphConversation() {
    // Si ya tenemos un hilo activo, no creamos uno nuevo
    if (activeThreadId) {
        console.log("Usando hilo activo existente:", activeThreadId);
        return true;
    }

    // Crear un nuevo hilo
    const threadId = await createThread();

    if (!threadId) {
        console.error("No se pudo crear el hilo de conversación");
        return false;
    }

    // Inicializar el hilo con el build_router_graph
    const routerInitialized = await initializeThreadWithRouter(threadId);

    if (!routerInitialized) {
        console.error("No se pudo inicializar el router");
        return false;
    }

    // Guardar el ID del hilo activo
    activeThreadId = threadId;
    console.log("Conversación inicializada correctamente. Thread ID:", activeThreadId);
    return true;
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
    initVoiceDashboard();
});

// Exportar funciones para uso global
window.VoiceDashboard = {
    init: initVoiceDashboard,
    processQuery: processVoiceQuery
};