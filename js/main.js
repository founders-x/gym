/* ==========================================================================
   IRONCLAD FITNESS STUDIO — main.js
   Vanilla JS only. Every feature checks for its DOM target before running,
   so this file is safe to include unchanged on all 6 pages.
   ========================================================================== */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  /* ------------------------------------------------------------------ */
  /* Init AOS (Animate On Scroll) if the CDN script loaded              */
  /* ------------------------------------------------------------------ */
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80
    });
  }

  /* ------------------------------------------------------------------ */
  /* Mobile nav toggle                                                  */
  /* ------------------------------------------------------------------ */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sticky nav shrink on scroll                                        */
  /* ------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  if (header) {
    var lastState = false;
    var onScroll = function () {
      var shouldShrink = window.scrollY > 40;
      if (shouldShrink !== lastState) {
        header.classList.toggle('is-shrunk', shouldShrink);
        lastState = shouldShrink;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------ */
  /* Animated counting stats on scroll into view                        */
  /* ------------------------------------------------------------------ */
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    var animateCounter = function (el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var suffix = el.getAttribute('data-count-suffix') || '';
      var duration = 1800;
      var startTime = null;

      var step = function (timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('en-US') + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString('en-US') + suffix;
        }
      };
      window.requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
      counters.forEach(function (el) { animateCounter(el); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Testimonial carousel                                                */
  /* ------------------------------------------------------------------ */
  var carousel = document.querySelector('.testimonial-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.testimonial-slide'));
    var dotsWrap = carousel.parentElement.querySelector('.carousel-dots');
    var current = 0;
    var timer = null;

    if (dotsWrap && slides.length > 1) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', function () { goTo(i); resetTimer(); });
        dotsWrap.appendChild(dot);
      });
    }

    function goTo(index) {
      slides[current].classList.remove('is-active');
      if (dotsWrap) dotsWrap.children[current] && dotsWrap.children[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (dotsWrap) dotsWrap.children[current] && dotsWrap.children[current].classList.add('is-active');
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      if (slides.length > 1) {
        timer = setInterval(function () { goTo(current + 1); }, 6000);
      }
    }

    if (slides.length) {
      slides[0].classList.add('is-active');
      resetTimer();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Gallery filter                                                      */
  /* ------------------------------------------------------------------ */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var galleryItems = document.querySelectorAll('[data-category]');
  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var filter = btn.getAttribute('data-filter');
        galleryItems.forEach(function (item) {
          var match = filter === 'all' || item.getAttribute('data-category') === filter;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sign-up form validation                                             */
  /* ------------------------------------------------------------------ */
  var signupForm = document.getElementById('signup-form');
  if (signupForm) {
    var showError = function (field, message) {
      var wrapper = field.closest('.field');
      if (!wrapper) return;
      wrapper.classList.add('has-error');
      var errEl = wrapper.querySelector('.field-error');
      if (errEl) errEl.textContent = message;
    };
    var clearError = function (field) {
      var wrapper = field.closest('.field');
      if (!wrapper) return;
      wrapper.classList.remove('has-error');
    };

    var validators = {
      name: function (v) { return v.trim().length >= 2 ? null : 'Please enter your full name.'; },
      phone: function (v) {
        var digits = v.replace(/\D/g, '');
        return digits.length === 10 ? null : 'Enter a valid 10-digit US phone number.';
      },
      email: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address.';
      },
      goal: function (v) { return v ? null : 'Please select a fitness goal.'; },
      preferred_class: function (v) { return v ? null : 'Please select a class.'; },
      preferred_time: function (v) { return v ? null : 'Please select a preferred time.'; }
    };

    var fieldsToValidate = Object.keys(validators);

    fieldsToValidate.forEach(function (name) {
      var field = signupForm.elements[name];
      if (!field) return;
      field.addEventListener('blur', function () {
        var error = validators[name](field.value);
        if (error) showError(field, error); else clearError(field);
      });
    });

    signupForm.addEventListener('submit', function (e) {
      var hasError = false;
      fieldsToValidate.forEach(function (name) {
        var field = signupForm.elements[name];
        if (!field) return;
        var error = validators[name](field.value);
        if (error) {
          showError(field, error);
          hasError = true;
        } else {
          clearError(field);
        }
      });

      if (hasError) {
        e.preventDefault();
        var firstError = signupForm.querySelector('.has-error input, .has-error select');
        if (firstError) firstError.focus();
        var status = document.getElementById('form-status');
        if (status) {
          status.textContent = 'Please fix the highlighted fields before submitting.';
          status.className = 'form-status is-error';
        }
      }
      // If valid, the form submits normally to the Formspree endpoint (see action attribute).
    });
  }

  /* ------------------------------------------------------------------ */
  /* Phone auto-format as-you-type: (xxx) xxx-xxxx                      */
  /* ------------------------------------------------------------------ */
  var phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
      var formatted = digits;
      if (digits.length > 6) {
        formatted = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
      } else if (digits.length > 3) {
        formatted = '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
      } else if (digits.length > 0) {
        formatted = '(' + digits;
      }
      phoneInput.value = formatted;
    });
  }

  /* ------------------------------------------------------------------ */
  /* AI Chat Widget (Gemini via Cloudflare Worker proxy)                 */
  /* ------------------------------------------------------------------ */
  var chatLauncher = document.getElementById('chat-launcher');
  var chatPanel = document.getElementById('chat-panel');
  var chatForm = document.getElementById('chat-form');
  var chatInput = document.getElementById('chat-input');
  var chatBody = document.getElementById('chat-body');
  var chatCloseBtn = document.getElementById('chat-close-btn');

  // Replace this with your deployed Cloudflare Worker URL (see worker.js at the repo root).
  // The frontend never talks to Gemini directly and never holds an API key.
  var CHAT_BACKEND_URL = 'https://gym-worker.meherali22053.workers.dev/chat';

  if (chatLauncher && chatPanel && chatForm && chatInput && chatBody) {
    var hasGreeted = false;

    var openPanel = function () {
      chatPanel.classList.add('is-open');
      chatLauncher.setAttribute('aria-expanded', 'true');
      chatPanel.setAttribute('aria-hidden', 'false');
      if (!hasGreeted) {
        hasGreeted = true;
        addMessage('bot', "Hey! I'm the Ironclad Fitness virtual assistant. Ask me about memberships, class times, trainers, or how to start your free trial \u{1F4AA}");
      }
      window.setTimeout(function () { chatInput.focus(); }, 150);
    };

    var closePanel = function () {
      chatPanel.classList.remove('is-open');
      chatLauncher.setAttribute('aria-expanded', 'false');
      chatPanel.setAttribute('aria-hidden', 'true');
    };

    chatLauncher.addEventListener('click', function () {
      var isOpen = chatPanel.classList.contains('is-open');
      if (isOpen) { closePanel(); } else { openPanel(); }
    });

    if (chatCloseBtn) chatCloseBtn.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && chatPanel.classList.contains('is-open')) closePanel();
    });

    function addMessage(role, text) {
      var msg = document.createElement('div');
      msg.className = 'chat-msg ' + role;
      msg.textContent = text;
      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;
      return msg;
    }

    function showTyping() {
      var typing = document.createElement('div');
      typing.className = 'chat-typing';
      typing.id = 'chat-typing-indicator';
      typing.innerHTML = '<span></span><span></span><span></span>';
      chatBody.appendChild(typing);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function hideTyping() {
      var typing = document.getElementById('chat-typing-indicator');
      if (typing) typing.remove();
    }

    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = chatInput.value.trim();
      if (!text) return;

      addMessage('user', text);
      chatInput.value = '';
      chatInput.disabled = true;
      showTyping();

      fetch(CHAT_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
        .then(function (response) {
          if (response.status === 429) {
            throw new Error('RATE_LIMIT');
          }
          if (!response.ok) {
            throw new Error('BAD_RESPONSE');
          }
          return response.json();
        })
        .then(function (data) {
          hideTyping();
          addMessage('bot', data && data.reply ? data.reply : "Sorry, I didn't quite catch that. Could you rephrase?");
        })
        .catch(function (err) {
          hideTyping();
          if (err && err.message === 'RATE_LIMIT') {
            addMessage('bot', "I'm getting a lot of questions right now — please call us at (918) 555-0142 and our team will help you right away!");
          } else {
            addMessage('bot', "I'm having trouble connecting right now. Please call us at (918) 555-0142 or use the sign-up form on this page and we'll reach out.");
          }
        })
        .finally(function () {
          chatInput.disabled = false;
          chatInput.focus();
        });
    });
  }

})();
