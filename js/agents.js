// Configuración para LangGraph
const LANGGRAPH_BASE_URL = "https://stood-ride-usd-longitude.trycloudflare.com/langgraph"; // Usa URL directa al servidor
const ROUTER_GRAPH_ID = "build_router_graph";
const ASSISTANT_GRAPH_ID = "assistant_graph";
const ROUTER_ASSISTANT_ID = "0c9ef1b4-15a8-4529-a82a-7989a1f705c7";

// Variable global para mantener el ID del hilo de conversación activo
let activeThreadId = null;

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
 * Crea un nuevo hilo de conversación
 */
async function createThread() {
    try {
        const payload = {
            thread_id: uuidv4(),
            metadata: {
                name: "Conversación con MCP Asistente"
            }
        };

        console.log("Creando hilo de conversación...");

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
        console.log("Estado del hilo:", stateData);

        if (stateData.values && stateData.values.messages) {
            const messages = stateData.values.messages;
            console.log("Mensajes:", messages);

            // El último mensaje de tipo "ai" es la respuesta más reciente
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg.type === "ai") {
                    console.log(`Respuesta del asistente: ${msg.content}`);
                    return msg.content;
                }
            }

            console.log("No se encontró respuesta del asistente");
            return "No se encontró una respuesta. Intenta de nuevo.";
        } else {
            console.log("No se encontró la estructura de mensajes esperada");
            return "No se pudo obtener una respuesta. Intenta de nuevo.";
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return "Error al comunicarse con el asistente. Por favor, intenta más tarde.";
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

// Modificación de la función processVoiceCommand para integrar con LangGraph
async function processVoiceCommand(command) {
    console.log('Comando de voz recibido:', command);
    const voiceResultText = document.getElementById('voice-result-text');
    const voiceResultContainer = document.getElementById('voice-result');

    if (!voiceResultText || !voiceResultContainer) {
        console.error('No se encontraron los elementos de resultado de voz');
        return;
    }

    // Cambiar el estado visual para indicar que estamos procesando
    voiceResultText.textContent = "Procesando...";
    voiceResultContainer.classList.add('active');

    try {
        // Inicializar la conversación si es necesario
        if (!activeThreadId) {
            voiceResultText.textContent = "Iniciando conversación...";
            const initialized = await initializeLangGraphConversation();
            if (!initialized) {
                voiceResultText.textContent = "No se pudo iniciar la conversación. Inténtalo de nuevo.";
                setTimeout(() => voiceResultContainer.classList.remove('active'), 3000);
                return;
            }
        }

        // Enviar el comando al servicio LangGraph
        const response = await getAssistantResponse(command, activeThreadId);

        if (response) {
            // Mostrar la respuesta
            voiceResultText.textContent = response;

            // Usar síntesis de voz si está disponible
            if ('speechSynthesis' in window) {
                // Cancelar cualquier síntesis en progreso
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(response);
                utterance.lang = 'es-MX';
                utterance.rate = 1.0;
                utterance.pitch = 1.0;

                // Intentar encontrar una voz en español
                const voices = window.speechSynthesis.getVoices();
                const spanishVoice = voices.find(voice =>
                    voice.lang.includes('es') && voice.localService
                );

                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                }

                window.speechSynthesis.speak(utterance);
            }
        } else {
            voiceResultText.textContent = "No obtuve respuesta. Inténtalo de nuevo.";
        }
    } catch (error) {
        console.error('Error al procesar comando:', error);
        voiceResultText.textContent = "Ocurrió un error. Inténtalo de nuevo.";
    }

    // Mantener el mensaje visible
    setTimeout(() => voiceResultContainer.classList.remove('active'), 8000);
}

// Función modificada para inicializar el asistente de voz integrado con LangGraph
// --- Dentro de agents.js ---
// Modificación en la función initVoiceAssistantSection en agents.js
function initVoiceAssistantSection() {
    const micButton = document.getElementById('mic-button');
    const voiceResultContainer = document.getElementById('voice-result');
    const voiceResultText = document.getElementById('voice-result-text');

    if (!micButton || !voiceResultContainer || !voiceResultText) {
        console.error('No se encontraron los elementos del asistente de voz');
        return;
    }

    // Inicializar conexión con LangGraph al cargar la interfaz
    voiceResultText.textContent = "Conectando con el asistente...";
    voiceResultContainer.classList.add('active');

    initializeLangGraphConversation().then(initialized => {
        if (initialized) {
            voiceResultText.textContent = "Asistente listo. Presiona el micrófono para hablar.";
            setTimeout(() => voiceResultContainer.classList.remove('active'), 3000);
        } else {
            voiceResultText.textContent = "No se pudo conectar con el asistente. Verifica la conexión.";
        }
    });

    // Inicializar reconocimiento de voz si está disponible
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true; // Cambiar a continuous true para que siga grabando
        recognition.interimResults = true;
        recognition.lang = 'es-MX';

        // Variable para almacenar la transcripción acumulada
        let finalTranscript = '';

        // Evento cuando se hace clic en el botón de micrófono
        micButton.addEventListener('click', function () {
            if (micButton.classList.contains('listening')) {
                // Detener el reconocimiento manualmente
                recognition.stop();
                micButton.classList.remove('listening');
                voiceResultText.textContent = "Procesando comando...";

                // Procesar el comando acumulado cuando el usuario detiene la grabación
                if (finalTranscript.trim() !== '') {
                    processVoiceCommand(finalTranscript);
                } else {
                    voiceResultText.textContent = "No se detectó ningún comando";
                    setTimeout(() => voiceResultContainer.classList.remove('active'), 2000);
                }

                // Resetear la transcripción acumulada
                finalTranscript = '';
            } else {
                // Comenzar a escuchar
                try {
                    finalTranscript = ''; // Reiniciar la transcripción
                    recognition.start();
                    micButton.classList.add('listening');
                    voiceResultText.textContent = "Escuchando... (Presiona de nuevo para detener)";
                    voiceResultContainer.classList.add('active');
                } catch (error) {
                    console.error('Error iniciando reconocimiento de voz:', error);
                    voiceResultText.textContent = "Error al iniciar el reconocimiento de voz";
                    voiceResultContainer.classList.add('active');
                    setTimeout(() => voiceResultContainer.classList.remove('active'), 3000);
                }
            }
        });

        // Evento cuando se reciben resultados de voz
        recognition.onresult = function (event) {
            // Crear una transcripción temporal para mostrar mientras habla
            let interimTranscript = '';

            // Recorrer todos los resultados
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];

                // Si es un resultado final, añadirlo a la transcripción final
                if (result.isFinal) {
                    finalTranscript += result[0].transcript + ' ';
                } else {
                    // Si es un resultado intermedio, mostrarlo como feedback
                    interimTranscript += result[0].transcript;
                }
            }

            // Mostrar la transcripción actual (combinando final e intermedia)
            voiceResultText.textContent = finalTranscript + interimTranscript;
        };

        // Evento cuando termina el reconocimiento (por error o timeout interno)
        recognition.onend = function () {
            // Si se detuvo por razones internas y todavía estábamos en modo escucha,
            // reiniciamos el reconocimiento para mantenerlo activo hasta que el usuario lo detenga
            if (micButton.classList.contains('listening')) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Error reiniciando reconocimiento de voz:', error);
                    micButton.classList.remove('listening');
                    voiceResultText.textContent = "El reconocimiento se detuvo inesperadamente";
                    setTimeout(() => voiceResultContainer.classList.remove('active'), 3000);
                }
            }
        };

        // Evento en caso de error
        recognition.onerror = function (event) {
            console.error('Error en reconocimiento de voz:', event.error);

            // Si el error no es fatal, intentamos continuar grabando
            if (micButton.classList.contains('listening') && event.error !== 'no-speech') {
                try {
                    recognition.start();
                } catch (e) {
                    micButton.classList.remove('listening');
                    voiceResultText.textContent = "Error crítico: " + event.error;
                    voiceResultContainer.classList.add('active');
                    setTimeout(() => voiceResultContainer.classList.remove('active'), 3000);
                }
            } else {
                micButton.classList.remove('listening');
                voiceResultText.textContent = "Error: " + event.error;
                voiceResultContainer.classList.add('active');
                setTimeout(() => voiceResultContainer.classList.remove('active'), 3000);
            }
        };
    } else {
        // Si el navegador no soporta reconocimiento de voz
        micButton.addEventListener('click', function () {
            voiceResultText.textContent = "Tu navegador no soporta reconocimiento de voz";
            voiceResultContainer.classList.add('active');
            setTimeout(() => voiceResultContainer.classList.remove('active'), 3000);
        });
    }
}