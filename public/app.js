// URL del backend real (por ahora usaremos un mock)
const BACKEND_URL = "https://chat-socios-backend.onrender.com/chat";

const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// UPN de prueba (luego vendrá de Teams/MSAL)
const FAKE_UPN = "socio1@empresa.com";

let isSending = false;

function formatTime(date = new Date()) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Crea un bloque de mensaje (usuario o bot) estilo Teams
 */
function addMessage(text, sender = "user", extra = {}) {
  const row = document.createElement("div");
  row.classList.add("message-row", sender);

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  if (sender === "bot") {
    avatar.textContent = "MC"; // iniciales del bot
  }

  const content = document.createElement("div");
  content.classList.add("message-content");

  if (sender === "bot") {
    const header = document.createElement("div");
    header.classList.add("message-header");
    header.textContent = "Ms Comisiones";
    content.appendChild(header);
  }

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  bubble.textContent = text;

  // Link a PDF, si hay
  if (extra.pdfUrl) {
    bubble.appendChild(document.createElement("br"));
    const link = document.createElement("a");
    link.href = extra.pdfUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "📄 Descargar PDF";
    bubble.appendChild(link);
  }

  content.appendChild(bubble);

  // Meta (hora + feedback)
  const meta = document.createElement("div");
  meta.classList.add("message-meta");
  meta.textContent = formatTime();

  if (sender === "bot") {
    const feedback = document.createElement("span");
    feedback.classList.add("message-feedback");

    const up = document.createElement("span");
    up.classList.add("feedback-btn");
    up.textContent = "👍";
    up.title = "Útil";

    const down = document.createElement("span");
    down.classList.add("feedback-btn");
    down.textContent = "👎";
    down.title = "No útil";

    // Por ahora solo mostramos en consola; luego podremos mandar al backend
    up.addEventListener("click", () => {
      console.log("Feedback positivo para mensaje:", text);
    });
    down.addEventListener("click", () => {
      console.log("Feedback negativo para mensaje:", text);
    });

    feedback.appendChild(up);
    feedback.appendChild(down);
    meta.appendChild(feedback);
  }

  content.appendChild(meta);

  if (sender === "bot") {
    row.appendChild(avatar);
  }
  row.appendChild(content);

  messagesContainer.appendChild(row);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Añade una "card" con botones de acciones rápidas dentro del chat
 */
function addQuickActionsCard() {
  const row = document.createElement("div");
  row.classList.add("message-row", "bot");

  const avatar = document.createElement("div");
  avatar.classList.add("avatar");
  avatar.textContent = "MC";

  const content = document.createElement("div");
  content.classList.add("message-content");

  const header = document.createElement("div");
  header.classList.add("message-header");
  header.textContent = "Ms Comisiones";
  content.appendChild(header);

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");

  const card = document.createElement("div");
  card.classList.add("quick-card");

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("quick-card-buttons");

  const actions = [
    { label: "Consulta de pago", text: "Quiero hacer una consulta de pago" },
    { label: "Realizar un reclamo", text: "Quiero realizar un reclamo" },
    {
      label: "Consultar por calendario de pagos",
      text: "Muéstrame el calendario de pagos del mes",
    },
    { label: "Agendar una sesión", text: "Quiero agendar una sesión" },
    { label: "Manuales", text: "Muéstrame los manuales disponibles" },
    { label: "Preguntas frecuentes", text: "Quiero ver las preguntas frecuentes" },
  ];

  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.classList.add("quick-card-button");
    btn.textContent = action.label;
    btn.addEventListener("click", () => sendMessage(action.text));
    buttonsContainer.appendChild(btn);
  });

  card.appendChild(buttonsContainer);
  bubble.appendChild(card);
  content.appendChild(bubble);

  const meta = document.createElement("div");
  meta.classList.add("message-meta");
  meta.textContent = formatTime();
  content.appendChild(meta);

  row.appendChild(avatar);
  row.appendChild(content);

  messagesContainer.appendChild(row);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Mock de backend mientras no tengamos IA y Python conectados
 */
async function mockBackendCall(message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const msg = message.toLowerCase();

      if (msg.includes("calendario")) {
        resolve({
          texto_respuesta:
            "Con el siguiente parámetro entregado.\n\n(En la versión real verás tu calendario de pagos y el PDF correspondiente).",
          pdf_url:
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        });
      } else if (msg.includes("reclamo")) {
        resolve({
          texto_respuesta:
            "Para registrar un reclamo, indícame el número de factura y el motivo. Más adelante esto creará un registro en el sistema.",
          pdf_url: null,
        });
      } else if (msg.includes("preguntas frecuentes")) {
        resolve({
          texto_respuesta:
            "Estas son algunas preguntas frecuentes de ejemplo. Más adelante las obtendré de tu base de datos de FAQs.",
          pdf_url: null,
        });
      } else {
        resolve({
          texto_respuesta:
            "Puedo ayudarte con consultas de pago, calendario, reclamos, agendar sesiones y manuales. Prueba con uno de los botones de la tarjeta o escribe tu consulta.",
          pdf_url: null,
        });
      }
    }, 800);
  });
}

/**
 * Envía un mensaje (del usuario) y muestra la respuesta del bot
 */
async function sendMessage(textFromQuickButton = null) {
  const text = (textFromQuickButton ?? messageInput.value).trim();
  if (!text || isSending) return;

  addMessage(text, "user");
  messageInput.value = "";

  setLoadingState(true);

  try {
    // Cuando tengas backend real, cambiar aquí por fetch a BACKEND_URL
    // const response = await fetch(BACKEND_URL, { ... })
    // const data = await response.json();

    const data = await mockBackendCall(text);

    addMessage(data.texto_respuesta, "bot", {
      pdfUrl: data.pdf_url,
    });
  } catch (error) {
    console.error(error);
    addMessage("⚠️ Ocurrió un error al contactar con el servidor.", "bot");
  } finally {
    setLoadingState(false);
    messageInput.focus();
  }
}

function setLoadingState(loading) {
  isSending = loading;
  sendButton.disabled = loading;
  sendButton.textContent = loading ? "Enviando..." : "Enviar";
}

/**
 * Mensajes iniciales del bot para parecerse a tu captura
 */
function showWelcomeConversation() {
  // Mensaje 1: como si respondiera a un parámetro previo
  addMessage("Con el siguiente parámetro entregado.\n\nSEC : 71301758", "bot");

  // Mensaje 2: saludo personalizado (más adelante lo haremos real con el UPN)
  addMessage(
    "Hola, soy Ms Comisiones, ¿en qué puedo ayudarte hoy?",
    "bot"
  );

  // Mensaje 3: pregunta abierta
  addMessage("¿En qué puedo ayudarte?", "bot");

  // Card con botones
  addQuickActionsCard();
}

// Eventos
sendButton.addEventListener("click", () => sendMessage());

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Inicialización
showWelcomeConversation();