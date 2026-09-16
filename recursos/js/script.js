(function () {
  "use strict";

  var SUBSCRIBE_ENDPOINT = "https://audiciones.netlify.app/.netlify/functions/subscribe-recursos";

  var VIDEO_DESKTOP = "https://pub-6ae185c6fb554bb99ca07e1a58b735dc.r2.dev/video%20web%20arto/Arto%20web%20horizontal.mp4";
  var VIDEO_MOBILE = "https://pub-6ae185c6fb554bb99ca07e1a58b735dc.r2.dev/video%20web%20arto/arto%20web%20vertical.mp4";
  var MOBILE_BREAKPOINT = "(max-width: 720px)";

  // Recurso que se descarga al enviar el email. Para cambiarlo en el futuro,
  // sustituye esta URL por la del archivo nuevo en Cloudflare R2.
  var RESOURCE_URL = "https://pub-6ae185c6fb554bb99ca07e1a58b735dc.r2.dev/video%20web%20arto/ANALIZA%20REELS%20CON%20CHAT%20GPT%20WORK%20(1).pdf";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var form = document.getElementById("email-form");
  var emailInput = document.getElementById("email");
  var submitBtn = document.getElementById("btn-submit");

  var introPoster = document.getElementById("intro-poster");
  var video = document.getElementById("intro-video");
  var playBtn = document.getElementById("play-btn");
  var emailCard = document.getElementById("email-card");
  var finalScreen = document.getElementById("final-screen");
  var replayLink = document.getElementById("replay-link");

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

    submitBtn.disabled = true;
    submitBtn.textContent = "Un momento...";

    // Se abre en una pestaña nueva (gesto directo del clic, no bloqueado por
    // popup blockers) mientras esta pantalla pasa a mostrar la imagen final.
    window.open(RESOURCE_URL, "_blank");

    emailCard.hidden = true;
    finalScreen.hidden = false;

    var payload = {
      email: email,
      "bot-field": form.querySelector("[name=bot-field]").value,
    };

    fetch(SUBSCRIBE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(function () {
      /* El envío del email ya está validado; el guardado en MailerLite es best-effort. */
    });
  });

  // ---------- Vídeo intro a pantalla completa ----------

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
