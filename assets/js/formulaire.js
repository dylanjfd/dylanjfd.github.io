/* ==========================================================================
   Portfolio BTS SIO — formulaire.js
   Formulaire de contact (pages/contact.html) : validation accessible,
   consentement RGPD, pot de miel anti-spam, envoi vers FormSubmit, Formspree
   ou contact.php (réglage CONFIG.FORM_ENDPOINT dans main.js).
   Les messages s'affichent dans la zone role="status" du formulaire.
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.Portfolio = window.Portfolio || {});

  function init() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    form.noValidate = true; // la validation est gérée ici (messages en français, focus)

    const status = document.querySelector('[data-form-status]');
    const submit = form.querySelector('[type="submit"]');
    const submitLabel = submit ? submit.innerHTML : '';
    const settings = (typeof CONFIG === 'object' && CONFIG) || {};

    const rules = [
      {
        name: 'name',
        test: (f) => f.value.trim().length >= 2,
        message: () => 'Indiquez votre nom (2 caractères minimum).',
      },
      {
        name: 'email',
        test: (f) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim()),
        message: (f) => (f.value.trim() ? 'Adresse e-mail invalide (exemple : prenom.nom@exemple.fr).' : 'Indiquez votre adresse e-mail.'),
      },
      {
        name: 'subject',
        test: (f) => f.value !== '',
        message: () => "Choisissez l'objet de votre message.",
      },
      {
        name: 'message',
        test: (f) => f.value.trim().length >= 20,
        message: (f) => (f.value.trim() ? 'Votre message doit contenir au moins 20 caractères.' : 'Écrivez votre message.'),
      },
      {
        name: 'consent',
        test: (f) => f.checked,
        message: () => "Cochez cette case pour accepter l'utilisation de vos données.",
      },
    ];

    function setError(field, message) {
      const error = document.getElementById(`${field.id}-error`);
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (error) error.textContent = message;
      } else {
        field.removeAttribute('aria-invalid');
        if (error) error.textContent = '';
      }
    }

    function validate() {
      const invalid = [];
      rules.forEach((rule) => {
        const field = form.elements[rule.name];
        if (!field) return;
        const ok = rule.test(field);
        setError(field, ok ? '' : rule.message(field));
        if (!ok) invalid.push(field);
      });
      return invalid;
    }

    // Une fois signalé, un champ est revalidé dès qu'il est corrigé
    const revalidate = (event) => {
      const field = event.target;
      if (field.getAttribute('aria-invalid') !== 'true') return;
      const rule = rules.find((r) => r.name === field.name);
      if (rule && rule.test(field)) setError(field, '');
    };
    form.addEventListener('input', revalidate);
    form.addEventListener('change', revalidate);

    function el(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }

    function notice(type, title, text) {
      const box = el('div', `notice notice--${type}`);
      // Séparateur lu uniquement par les lecteurs d'écran (le titre est déjà sur sa propre ligne à l'écran)
      box.append(el('strong', 'notice__title', title), el('span', 'sr-only', ' : '), el('span', '', text));
      return box;
    }

    function questToast() {
      const toast = el('div', 'quest-toast');
      const icon = el('span', 'quest-toast__icon', '✦');
      icon.setAttribute('aria-hidden', 'true');
      const text = el('p', 'quest-toast__text');
      text.append(el('span', 'quest-toast__title', 'Quête mise à jour'), document.createTextNode(' — message envoyé'));
      toast.append(icon, text);
      return toast;
    }

    // Vide puis remplit la zone role="status" pour que chaque message soit bien annoncé
    function showStatus(...nodes) {
      if (!status) return;
      status.textContent = '';
      window.setTimeout(() => status.append(...nodes), 60);
    }

    function setBusy(busy) {
      if (!submit) return;
      submit.disabled = busy;
      if (busy) submit.textContent = 'Envoi en cours…';
      else submit.innerHTML = submitLabel;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const invalid = validate();
      if (invalid.length) {
        showStatus(notice('error', 'Formulaire incomplet',
          invalid.length === 1
            ? 'Un champ est à corriger.'
            : `${invalid.length} champs sont à corriger.`));
        invalid[0].focus();
        return;
      }

      const fallback = settings.CONTACT_EMAIL ? ` Vous pouvez aussi écrire à ${settings.CONTACT_EMAIL}.` : '';

      // Pot de miel rempli : très probablement un robot, on ne transmet rien
      const honeypot = form.elements._gotcha;
      if (honeypot && honeypot.value) {
        form.reset();
        showStatus(notice('success', 'Message envoyé', 'Merci ! Je vous réponds dans les meilleurs délais.'));
        return;
      }

      const endpoint = String(settings.FORM_ENDPOINT || '').trim();
      if (!endpoint) {
        showStatus(notice('info', 'Formulaire non configuré',
          "Aucun message n'a été envoyé : l'adresse d'envoi n'est pas encore renseignée "
          + '(propriétaire du site : complétez CONFIG.FORM_ENDPOINT dans assets/js/main.js, voir le README).' + fallback));
        return;
      }

      setBusy(true);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        // FormSubmit répond 200 même en cas de refus (formulaire pas encore activé) : on lit « success »
        const resultat = await response.json().catch(() => ({}));
        if (resultat.success === false || resultat.success === 'false') throw new Error(resultat.message || 'refusé');
        form.reset();
        rules.forEach((rule) => { if (form.elements[rule.name]) setError(form.elements[rule.name], ''); });
        showStatus(
          notice('success', 'Message envoyé', 'Merci ! Je vous réponds dans les meilleurs délais.'),
          questToast(),
        );
      } catch (error) {
        showStatus(notice('error', "Échec de l'envoi", `Le message n'a pas pu être envoyé. Réessayez dans quelques instants.${fallback}`));
      } finally {
        setBusy(false);
      }
    });
  }

  P.formulaire = { init };
}());
