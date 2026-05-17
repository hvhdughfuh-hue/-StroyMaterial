/**
 * СтройМатериал+ — landing interactions
 * Smooth scroll, mobile nav, pre-order forms (mailto + success message)
 */

(function () {
  "use strict";

  const ORDER_EMAIL = "info@stroymaterial-plus.ru";

  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  const header = document.getElementById("header");
  const orderForm = document.getElementById("orderForm");
  const modal = document.getElementById("preorderModal");
  const modalForm = document.getElementById("modalForm");
  const modalClose = document.getElementById("modalClose");
  const modalProduct = document.getElementById("modalProduct");
  const modalProductInput = document.getElementById("modalProductInput");
  const productSelect = document.getElementById("product");

  /* ----- Mobile menu ----- */
  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Открыть меню");
  }

  function openNav() {
    if (!nav || !navToggle) return;
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Закрыть меню");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  /* ----- Smooth scroll for anchor links ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      closeNav();

      const headerOffset = header ? header.offsetHeight : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerOffset - 8;

      window.scrollTo({ top: top, behavior: "smooth" });
      history.pushState(null, "", id);
    });
  });

  /* ----- Close nav on resize ----- */
  window.addEventListener(
    "resize",
    function () {
      if (window.innerWidth > 768) closeNav();
    },
    { passive: true }
  );

  /* ----- Pre-order buttons → modal or scroll to form ----- */
  document.querySelectorAll("[data-preorder]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const card = btn.closest(".product-card");
      const productName =
        card?.getAttribute("data-product") || "Материал не указан";

      if (modal && modalProduct && modalProductInput) {
        modalProduct.textContent = productName;
        modalProductInput.value = productName;
        if (typeof modal.showModal === "function") {
          modal.showModal();
        } else {
          scrollToFormWithProduct(productName);
        }
      } else {
        scrollToFormWithProduct(productName);
      }
    });
  });

  function scrollToFormWithProduct(productName) {
    if (productSelect) {
      const options = Array.from(productSelect.options);
      const match = options.find(function (opt) {
        return opt.value === productName;
      });
      if (match) productSelect.value = productName;
    }

    const contact = document.getElementById("contact");
    if (contact) {
      const headerOffset = header ? header.offsetHeight : 0;
      const top =
        contact.getBoundingClientRect().top + window.scrollY - headerOffset - 8;
      window.scrollTo({ top: top, behavior: "smooth" });
    }

    const nameInput = document.getElementById("name");
    if (nameInput) nameInput.focus();
  }

  if (modalClose && modal) {
    modalClose.addEventListener("click", function () {
      modal.close();
    });

    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.close();
    });

    modal.addEventListener("cancel", function () {
      resetModalForm();
    });
  }

  function resetModalForm() {
    if (!modalForm) return;
    modalForm.reset();
    const success = document.getElementById("modalSuccess");
    if (success) success.hidden = true;
  }

  /* ----- Form validation & submit ----- */
  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  }

  function buildMailtoBody(data) {
    const lines = [
      "Новая заявка на предзаказ (сайт СтройМатериал+)",
      "",
      "Имя: " + data.name,
      "Телефон: " + data.phone,
      "Материал: " + data.product,
      "Количество: " + data.quantity,
    ];
    if (data.comment) lines.push("Комментарий: " + data.comment);
    return encodeURIComponent(lines.join("\n"));
  }

  function handleSubmit(form, successEl, useMailto) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {
        name: (formData.get("name") || "").toString().trim(),
        phone: (formData.get("phone") || "").toString().trim(),
        product: (formData.get("product") || "").toString().trim(),
        quantity: (formData.get("quantity") || "").toString().trim(),
        comment: (formData.get("comment") || "").toString().trim(),
      };

      if (!data.name || !data.product || !data.quantity) {
        form.reportValidity();
        return;
      }

      if (!validatePhone(data.phone)) {
        const phoneInput = form.querySelector('[name="phone"]');
        if (phoneInput) {
          phoneInput.setCustomValidity("Введите корректный номер телефона");
          phoneInput.reportValidity();
          phoneInput.setCustomValidity("");
        }
        return;
      }

      if (useMailto && ORDER_EMAIL) {
        const subject = encodeURIComponent(
          "Предзаказ: " + data.product.slice(0, 60)
        );
        const body = buildMailtoBody(data);
        const mailto =
          "mailto:" +
          ORDER_EMAIL +
          "?subject=" +
          subject +
          "&body=" +
          body;

        window.location.href = mailto;
      }

      if (successEl) {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      form.querySelectorAll("input, select, textarea, button").forEach(function (el) {
        if (el.type !== "hidden") el.disabled = true;
      });

      if (form === modalForm && modal) {
        setTimeout(function () {
          modal.close();
          resetModalForm();
          form.querySelectorAll("input, select, textarea, button").forEach(function (el) {
            el.disabled = false;
          });
        }, 2500);
      }
    });
  }

  if (orderForm) {
    handleSubmit(
      orderForm,
      document.getElementById("formSuccess"),
      true
    );
  }

  if (modalForm) {
    handleSubmit(
      modalForm,
      document.getElementById("modalSuccess"),
      true
    );
  }

  /* ----- Header shadow on scroll ----- */
  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        header.classList.toggle("header--scrolled", window.scrollY > 8);
      },
      { passive: true }
    );
  }
})();
