(function () {
  "use strict";

  // ============ Configuración (placeholders a sustituir) ============

  var SUBSCRIBE_ENDPOINT = "https://audiciones.netlify.app/.netlify/functions/subscribe-test";

  // Vídeos alojados en Cloudflare R2. Pega aquí la URL pública de cada uno
  // en cuanto estén subidos — mientras estén vacíos, se muestra "Vídeo en camino".
  var RESULT_VIDEOS = {
    R1: "", // [URL_R2_RESULTADO_1]
    R2: "", // [URL_R2_RESULTADO_2]
    R3: "", // [URL_R2_RESULTADO_3]
  };

  var SKOOL_URL = "https://www.skool.com/la-capsula-creativa-4067/about";
  var WHATSAPP_NUMBER = "34610317683";

  // ============ Contenido ============

  var QUESTIONS = [
    {
      text: "Cuando piensas en cómo se ve tu contenido ahora mismo, ¿qué es lo primero que sientes?",
      options: [
        { text: "Todavía estoy encontrando mi estilo, voy aprendiendo sobre la marcha", result: "R1" },
        { text: "Que no refleja lo que realmente soy o vendo, algo no encaja", result: "R2" },
        { text: "Que la idea y la estrategia están bien, pero el resultado final podría verse mejor", result: "R3" },
      ],
    },
    {
      text: "¿Cómo es tu relación con la cámara?",
      options: [
        { text: "Todavía me cuesta, estoy perdiendo la vergüenza poco a poco", result: "R1" },
        { text: "Me siento cómoda, pero siento que quien edita no lo aprovecha bien", result: "R2" },
        { text: "Muy cómoda, ya tengo mi forma de grabar definida", result: "R3" },
      ],
    },
    {
      text: "Cuando imaginas delegar tu contenido, ¿qué es lo primero que piensas?",
      options: [
        { text: "Todavía no, prefiero seguir aprendiendo yo primero", result: "R1" },
        { text: "Ya lo intenté (o lo tengo) y no ha sido lo que esperaba", result: "R2" },
        { text: "Ya delego la estrategia, solo me falta resolver la parte técnica", result: "R3" },
      ],
    },
    {
      text: "¿Qué tan definida sientes tu estrategia de contenido — qué publicar, para quién, con qué objetivo?",
      options: [
        { text: "Todavía la estoy construyendo", result: "R1" },
        { text: "La tengo más o menos clara, pero lo que se publica no la representa", result: "R2" },
        { text: "Totalmente definida, tengo equipo y proceso", result: "R3" },
      ],
    },
    {
      text: "Si mañana pudieras cambiar una sola cosa de tu contenido, ¿cuál sería?",
      options: [
        { text: "Aprender a mostrarme mejor y perder el miedo a la cámara", result: "R1" },
        { text: "Que representara de verdad mi marca y mi estilo", result: "R2" },
        { text: "Que la edición estuviera a la altura de la idea", result: "R3" },
      ],
    },
    {
      text: "¿Cómo te sientes con la calidad visual de tus vídeos ahora mismo?",
      options: [
        { text: "Sé que puede mejorar mucho, apenas estoy empezando", result: "R1" },
        { text: "Depende — a veces ni yo reconozco mi marca en lo que se publica", result: "R2" },
        { text: "Buena, pero le falta ese toque profesional final", result: "R3" },
      ],
    },
    {
      text: "¿Tu marca ya tiene una identidad clara — colores, tono, forma de hablar?",
      options: [
        { text: "Todavía la estoy definiendo", result: "R1" },
        { text: "Sí, pero lo que se publica no la respeta", result: "R2" },
        { text: "Sí, muy consolidada", result: "R3" },
      ],
    },
    {
      text: "¿Qué buscas principalmente ahora mismo?",
      options: [
        { text: "Seguir aprendiendo a crear contenido yo misma", result: "R1" },
        { text: "Encontrar a alguien que entienda de verdad mi marca", result: "R2" },
        { text: "Encontrar quien lleve la edición al nivel que mi marca merece", result: "R3" },
      ],
    },
    {
      text: "¿Cómo describirías tu negocio hoy?",
      options: [
        { text: "Está empezando, todavía validando", result: "R1" },
        { text: "Está creciendo, pero el contenido no acompaña ese crecimiento", result: "R2" },
        { text: "Está consolidado, con equipo y procesos", result: "R3" },
      ],
    },
    {
      text: "¿Qué tan seguido publicas contenido ahora mismo?",
      options: [
        { text: "Poco, todavía estoy validando el negocio", result: "R1" },
        { text: "Con regularidad, pero sin ver el resultado que esperaba", result: "R2" },
        { text: "Con regularidad, y con un sistema que funciona", result: "R3" },
      ],
    },
  ];

  var RESULTS = {
    R1: {
      title: "Todavía no necesitas Community Manager",
      message: "Ahora mismo toca seguir creando, encontrar tu voz y ganar base — delegar antes de tiempo no acelera nada. Cuando llegue el momento, lo sabrás.",
      cta: "skool",
    },
    R2: {
      title: "Necesitas un Community Manager completo",
      message: "Tu marca ya tiene algo que contar, pero el contenido no la está representando. Necesitas a alguien que entienda tu negocio de verdad y lo lleve de principio a fin.",
      cta: "whatsapp",
    },
    R3: {
      title: "Solo necesitas edición profesional",
      message: "La estrategia y la idea ya están resueltas — lo que falta es que la edición esté a la altura. Es justo lo que hacemos.",
      cta: "whatsapp",
    },
  };

  var TIEBREAK_ORDER = ["R2", "R3", "R1"];

  // ============ Estado ============

  var answers = new Array(QUESTIONS.length).fill(null);
  var currentQuestion = 0;

  // ============ Elementos ============

  var screens = {
    intro: document.getElementById("screen-intro"),
    question: document.getElementById("screen-question"),
    email: document.getElementById("screen-email"),
    result: document.getElementById("screen-result"),
  };

  var progressTrack = document.getElementById("progress-track");
  var progressFill = document.getElementById("progress-fill");

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle("screen--active", key === name);
    });
    window.scrollTo(0, 0);
  }

  function updateProgress() {
    if (currentQuestion === 0) {
      progressTrack.hidden = false;
    }
    var pct = (currentQuestion / QUESTIONS.length) * 100;
    progressFill.style.width = pct + "%";
  }

  // ============ Intro ============

  document.getElementById("btn-start").addEventListener("click", function () {
    currentQuestion = 0;
    updateProgress();
    renderQuestion();
    showScreen("question");
  });

  // ============ Preguntas ============

  var questionCountEl = document.getElementById("question-count");
  var questionTextEl = document.getElementById("question-text");
  var optionButtons = Array.prototype.slice.call(document.querySelectorAll(".option"));
  var btnBack = document.getElementById("btn-back");

  function renderQuestion() {
    var q = QUESTIONS[currentQuestion];
    questionCountEl.textContent = "Pregunta " + (currentQuestion + 1) + " de " + QUESTIONS.length;
    questionTextEl.textContent = q.text;

    optionButtons.forEach(function (btn, i) {
      btn.textContent = q.options[i].text;
      btn.classList.toggle("is-selected", answers[currentQuestion] === q.options[i].result);
    });

    btnBack.hidden = currentQuestion === 0;
    updateProgress();
  }

  optionButtons.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      var q = QUESTIONS[currentQuestion];
      answers[currentQuestion] = q.options[i].result;

      if (currentQuestion < QUESTIONS.length - 1) {
        currentQuestion++;
        renderQuestion();
      } else {
        currentQuestion = QUESTIONS.length;
        updateProgress();
        showScreen("email");
      }
    });
  });

  btnBack.addEventListener("click", function () {
    if (currentQuestion === 0) return;
    currentQuestion--;
    renderQuestion();
  });

  // ============ Cálculo de resultado ============

  function computeResult() {
    var scores = { R1: 0, R2: 0, R3: 0 };
    answers.forEach(function (result) {
      if (result) scores[result]++;
    });

    var maxScore = Math.max(scores.R1, scores.R2, scores.R3);

    // TIEBREAK_ORDER ya está en orden de prioridad (R2 > R3 > R1), así que el
    // primer resultado que iguale el máximo es el ganador, con o sin empate.
    var i;
    for (i = 0; i < TIEBREAK_ORDER.length; i++) {
      if (scores[TIEBREAK_ORDER[i]] === maxScore) {
        return TIEBREAK_ORDER[i];
      }
    }
  }

  // ============ Email + envío ============

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var emailForm = document.getElementById("email-form");
  var emailInput = document.getElementById("email");

  emailInput.addEventListener("input", function () {
    document.getElementById("email").closest(".field").classList.remove("has-error");
  });

  emailForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var email = emailInput.value.trim();
    var errorEl = document.getElementById("error-email");
    var field = emailInput.closest(".field");

    if (!email || !EMAIL_RE.test(email)) {
      field.classList.add("has-error");
      errorEl.textContent = "Introduce un email válido.";
      return;
    }
    field.classList.remove("has-error");

    var resultado = computeResult();
    var submitBtn = document.getElementById("btn-submit-email");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    var payload = {
      email: email,
      "bot-field": emailForm.querySelector("[name=bot-field]").value,
    };

    fetch(SUBSCRIBE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        renderResult(resultado);
        showScreen("result");
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Ver mi resultado";
        field.classList.add("has-error");
        errorEl.textContent = "Algo ha fallado al enviar. Inténtalo de nuevo en unos segundos.";
      });
  });

  // ============ Resultado ============

  function renderResult(resultado) {
    var data = RESULTS[resultado];

    document.getElementById("result-title").textContent = data.title;
    document.getElementById("result-message").textContent = data.message;

    var videoWrap = document.getElementById("result-video");
    var videoUrl = RESULT_VIDEOS[resultado];
    if (videoUrl) {
      videoWrap.innerHTML = "";
      var video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.src = videoUrl;
      videoWrap.appendChild(video);
    } else {
      videoWrap.innerHTML = '<div class="video-pending">Vídeo en camino</div>';
    }

    var ctaWrap = document.getElementById("result-cta");
    ctaWrap.innerHTML = "";
    var ctaLink = document.createElement("a");
    ctaLink.className = "btn btn-primary";
    ctaLink.target = "_blank";
    ctaLink.rel = "noopener";

    if (data.cta === "skool") {
      ctaLink.href = SKOOL_URL;
      ctaLink.textContent = "Únete a La Cápsula Creativa";
    } else {
      ctaLink.href = "https://wa.me/" + WHATSAPP_NUMBER;
      ctaLink.textContent = "Hablar con nosotras por WhatsApp";
    }

    ctaWrap.appendChild(ctaLink);
  }
})();
