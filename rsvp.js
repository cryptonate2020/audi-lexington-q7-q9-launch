(function () {
  "use strict";

  var form = document.getElementById("rsvp-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var button = form.querySelector("[type='submit']");
  var names = ["fullName", "email", "phone", "guests", "note"];

  var rules = {
    fullName: function (value) {
      var name = value.trim().replace(/\s+/g, " ");
      var parts = name.split(" ");
      var partOk = parts.every(function (part) {
        return /^[\p{L}][\p{L}'’.\-]*$/u.test(part);
      });
      if (name.length < 3 || name.length > 80 || parts.length < 2 || !partOk) {
        return "Enter your full name.";
      }
      return "";
    },
    email: function (value) {
      var email = value.trim();
      if (
        email.length > 120 ||
        email.indexOf("..") !== -1 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
      ) {
        return "Enter a valid email address.";
      }
      return "";
    },
    phone: function (value) {
      var digits = value.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        return "Enter a phone number with an area code.";
      }
      return "";
    },
    guests: function (value) {
      var raw = value.trim();
      var guests = Number(raw);
      if (!/^\d+$/.test(raw) || guests < 1 || guests > 12) {
        return "Enter the number of guests, including yourself.";
      }
      return "";
    },
    note: function (value) {
      if (value.trim().length > 400) return "Keep the note under 400 characters.";
      return "";
    }
  };

  function showError(name, message) {
    var input = form.elements[name];
    var error = document.getElementById(name + "-error");
    var wrap = input.closest(".field");
    if (message) {
      wrap.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
      error.textContent = message;
    } else {
      wrap.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
      error.textContent = "";
    }
  }

  function validateAll() {
    var ok = true;
    names.forEach(function (name) {
      var message = rules[name](form.elements[name].value);
      showError(name, message);
      if (message) ok = false;
    });
    return ok;
  }

  function endpoint() {
    var value = window.RSVP_ENDPOINT;
    return typeof value === "string" ? value.trim() : "";
  }

  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.className = "form-status" + (kind ? " " + kind : "");
  }

  function payload() {
    return {
      fullName: form.elements.fullName.value.trim().replace(/\s+/g, " "),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      guests: Number(form.elements.guests.value.trim()),
      note: form.elements.note.value.trim(),
      event: "the new Q7 and the all-new Q9",
      when: "Friday, October 30, 2026, 6:00 to 8:00 PM",
      where: "Audi Lexington, 3000 Pink Pigeon Pkwy, Lexington, KY 40509"
    };
  }

  form.addEventListener("input", function (event) {
    var target = event.target;
    if (!target.name || !rules[target.name]) return;
    if (target.getAttribute("aria-invalid") !== "true") return;
    showError(target.name, rules[target.name](target.value));
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("", "");
    if (!validateAll()) {
      var first = form.querySelector("[aria-invalid='true']");
      if (first) first.focus();
      return;
    }

    var url = endpoint();
    if (!url) {
      form.classList.add("is-finished");
      setStatus("Registration will open shortly.", "is-pending");
      return;
    }

    button.disabled = true;
    setStatus("Sending your request.", "is-pending");

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload())
    })
      .then(function (response) {
        if (!response.ok) throw new Error(String(response.status));
        form.classList.add("is-finished");
        setStatus("Your request has been received.", "is-received");
      })
      .catch(function () {
        setStatus("The request did not go through. Call (859) 252-2834.", "is-alert");
      })
      .finally(function () {
        button.disabled = false;
      });
  });

  var dock = document.querySelector(".dock");
  var rsvp = document.getElementById("rsvp");
  if (dock && rsvp) {
    var frame = 0;
    function placeDock() {
      frame = 0;
      var rect = rsvp.getBoundingClientRect();
      var away = rect.top < window.innerHeight * 0.75;
      dock.classList.toggle("is-hidden", away);
      dock.inert = away;
      dock.setAttribute("aria-hidden", away ? "true" : "false");
      document.body.classList.toggle("dock-away", away);
    }
    function requestPlace() {
      if (frame) return;
      frame = window.requestAnimationFrame(placeDock);
    }
    placeDock();
    window.addEventListener("scroll", requestPlace, { passive: true });
    window.addEventListener("resize", requestPlace);
  }
})();
