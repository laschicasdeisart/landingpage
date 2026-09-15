(function () {
  "use strict";

  // Esta página se sirve como estática desde GitHub Pages (laschicasdeisart.com/audiciones),
  // así que el alta en MailerLite se hace vía una función serverless alojada aparte, en Netlify
  // (repo laschicasdeisart/regalos), que guarda la API key del lado del servidor.
  //
  var SUBSCRIBE_ENDPOINT = "https://audiciones.netlify.app/.netlify/functions/subscribe";

  var form = document.getElementById("casting-form");
  var confirmation = document.getElementById("form-confirmation");

  if (!form) return;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var wrapper = field.closest(".field");
    var errorEl = document.getElementById("error-" + fieldId);
    wrapper.classList.add("has-error");
    errorEl.textContent = message;
  }

  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var wrapper = field.closest(".field");
    var errorEl = document.getElementById("error-" + fieldId);
    wrapper.classList.remove("has-error");
    errorEl.textContent = "";
  }

  function validate() {
    var valid = true;

    var email = document.getElementById("email").value.trim();
    var instagram = document.getElementById("instagram").value.trim();
    var pitch = document.getElementById("pitch").value.trim();

    if (!email || !EMAIL_RE.test(email)) {
      setError("email", "Introduce un email válido.");
      valid = false;
    } else {
      clearError("email");
    }

    if (!instagram) {
      setError("instagram", "Cuéntanos tu @ de Instagram.");
      valid = false;
    } else {
      clearError("instagram");
    }

    if (!pitch || pitch.length < 10) {
      setError("pitch", "Cuéntanos un poco más — al menos unas frases.");
      valid = false;
    } else {
      clearError("pitch");
    }

    return valid;
  }

  ["email", "instagram", "pitch"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      clearError(id);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    var submitBtn = form.querySelector(".btn-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    var payload = {
      email: document.getElementById("email").value.trim(),
      instagram: document.getElementById("instagram").value.trim(),
      pitch: document.getElementById("pitch").value.trim(),
      "bot-field": form.querySelector("[name=bot-field]").value,
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
        form.hidden = true;
        confirmation.hidden = false;
        confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Quiero audicionar";
        setError("pitch", "Algo ha fallado al enviar. Inténtalo de nuevo en unos segundos.");
      });
  });
})();
