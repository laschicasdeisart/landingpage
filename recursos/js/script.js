(function () {
  "use strict";

  var SUBSCRIBE_ENDPOINT = "https://audiciones.netlify.app/.netlify/functions/subscribe-recursos";

  var VIDEO_DESKTOP = "https://pub-6ae185c6fb554bb99ca07e1a58b735dc.r2.dev/video%20web%20arto/Arto%20web%20horizontal.mp4";
  var VIDEO_MOBILE = "https://pub-6ae185c6fb554bb99ca07e1a58b735dc.r2.dev/video%20web%20arto/arto%20web%20vertical.mp4";
  var MOBILE_BREAKPOINT = "(max-width: 720px)";

  // Mapa de recursos por campaña. La URL de cada campaña lleva un parámetro
  // ?r=clave que apunta al archivo público en Cloudflare R2. Añade una línea
  // aquí por cada leadmagnet nuevo — no hace falta tocar nada más.
  var RESOURCES = {
    // "guion-reels": "https://TU-BUCKET.r2.dev/guion-reels.pdf",
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var formScreen = document.getElementById("screen-form");
  var confirmScreen = document.getElementById("screen-confirm");
  var form = document.getElementById("email-form");
  var emailInput = document.getElementById("email");
  var submitBtn = document.getElementById("btn-submit");

  function getResourceUrl() {
    var params = new URLSearchParams(window.location.search);
    var key = params.get("r");
    return key ? RESOURCES[key] : undefined;
  }

  emailInput.addEventListener("input", function () {
    emailInput.closest(".field").classList.remove("has-error");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var email = emailInput.value.trim();
    var field = emailInput.closest(".field");
    var errorEl = document.getElementById("error-email");

    if (!email || !EMAIL_RE.test(email)) {
      field.classList.add("has-error");
      errorEl.textContent = "Introduce un email válido.";
      return;
    }
    field.classList.remove("has-error");

    // Reserva la pestaña de forma síncrona (dentro del gesto de clic) para que
    // el navegador no la bloquee como popup cuando la abramos más tarde.
    var resourceUrl = getResourceUrl();
    var resourceTab = resourceUrl ? window.open("", "_blank") : null;

    submitBtn.disabled = true;
    submitBtn.textContent = "Un momento...";

    if (resourceTab) {
      resourceTab.location = resourceUrl;
    }

    formScreen.hidden = true;
    confirmScreen.hidden = false;

    var payload = {
      email: email,
      "bot-field": form.querySelector("[name=bot-field]").value,
    };

    fetch(SUBSCRIBE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(function () {
      /* La entrega del recurso no depende de esto — el email ya está validado. */
    });
  });

  // ---------- Vídeo intro a pantalla completa ----------

  var introPoster = document.getElementById("intro-poster");
  var video = document.getElementById("intro-video");
  var playBtn = document.getElementById("play-btn");
  var emailCard = document.getElementById("email-card");
  var replayLink = document.getElementById("replay-link");

  video.src = window.matchMedia(MOBILE_BREAKPOINT).matches ? VIDEO_MOBILE : VIDEO_DESKTOP;

  function playIntroVideo() {
    introPoster.hidden = true;
    emailCard.hidden = true;
    video.hidden = false;
    video.currentTime = 0;
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        // Si el navegador bloquea la reproducción, volvemos a la portada
        // para que la usuaria pueda tocar el botón otra vez.
        video.hidden = true;
        introPoster.hidden = false;
      });
    }
  }

  playBtn.addEventListener("click", playIntroVideo);

  video.addEventListener("ended", function () {
    introPoster.hidden = true;
    video.hidden = true;
    emailCard.hidden = false;
  });

  replayLink.addEventListener("click", playIntroVideo);

  // ---------- Fondo: estrellas ----------

  (function renderStars() {
    var starsEl = document.getElementById("stars");
    var count = 140;
    var shadows = [];
    for (var i = 0; i < count; i++) {
      var x = Math.round(Math.random() * 100);
      var y = Math.round(Math.random() * 100);
      var size = Math.random() < 0.85 ? 1 : 2;
      var opacity = (Math.random() * 0.6 + 0.3).toFixed(2);
      shadows.push(x + "vw " + y + "vh 0 " + (size - 1) + "px rgba(243, 239, 231, " + opacity + ")");
    }
    starsEl.style.boxShadow = shadows.join(", ");
    starsEl.style.width = "1px";
    starsEl.style.height = "1px";
  })();
})();
