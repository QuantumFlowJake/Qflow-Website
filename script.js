/* ===================== LIVE FEED ENGINE ===================== */
(function () {
  const feed       = document.getElementById('liveFeed');
  const elTotal    = document.getElementById('liveTotal');
  const elSent     = document.getElementById('liveSent');
  const elReplies  = document.getElementById('liveReplies');
  const elHot      = document.getElementById('liveHot');
  if (!feed) return;

  const MAX_ITEMS = 5;

  // Seed realistic starting numbers
  let sent    = 247 + Math.floor(Math.random() * 40);
  let replies = 18  + Math.floor(Math.random() * 8);
  let hot     = 4   + Math.floor(Math.random() * 4);

  const firstNames = ['James','Sarah','Michael','Emily','David','Jessica','Ryan','Lauren','Chris','Amanda','Tyler','Megan','Kevin','Rachel','Brian'];
  const companies  = ['Apex Media','NorthStar Labs','Vantage Group','Crestline Co.','Summit Digital','Orion Ventures','BluePeak Inc.','Nexus Agency','Clarity SaaS','Titan Consulting','Stellar Works','Harbor Partners'];
  const titles     = ['CEO','Founder','VP of Sales','Head of Growth','COO','Director of Marketing','Managing Partner','CMO'];

  const eventTypes = [
    { weight: 5, make: () => {
        const name = pick(firstNames), co = pick(companies);
        sent++;
        return { icon: '✉️', badge: 'badge-sent', label: 'SENT',
          text: `<strong>${name}</strong> · ${pick(titles)} @ ${co}` };
    }},
    { weight: 2, make: () => {
        const name = pick(firstNames), co = pick(companies);
        replies++;
        return { icon: '↩️', badge: 'badge-reply', label: 'REPLY',
          text: `<strong>${name} @ ${co}</strong> replied — gauging interest` };
    }},
    { weight: 1, make: () => {
        const name = pick(firstNames), score = 88 + Math.floor(Math.random() * 12);
        hot++;
        return { icon: '🔥', badge: 'badge-hot', label: 'HOT LEAD',
          text: `<strong>${name}</strong> flagged · ${score}% ICP match` };
    }},
    { weight: 1, make: () => {
        const name = pick(firstNames), co = pick(companies);
        return { icon: '💬', badge: 'badge-convo', label: 'CONVO',
          text: `Conversation started with <strong>${name} @ ${co}</strong>` };
    }},
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function weightedEvent() {
    const pool = [];
    eventTypes.forEach(e => { for (let i = 0; i < e.weight; i++) pool.push(e); });
    return pick(pool).make();
  }

  function updateCounters() {
    elTotal.textContent   = sent.toLocaleString();
    elSent.textContent    = sent.toLocaleString();
    elReplies.textContent = replies;
    elHot.textContent     = hot;
  }

  function addEvent() {
    const ev = weightedEvent();
    updateCounters();

    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
      <span class="feed-icon">${ev.icon}</span>
      <span class="feed-text">${ev.text}</span>
      <span class="feed-badge ${ev.badge}">${ev.label}</span>`;

    feed.prepend(item);

    // Trim to max visible items
    while (feed.children.length > MAX_ITEMS) {
      feed.removeChild(feed.lastChild);
    }
  }

  // Boot with initial events
  updateCounters();
  for (let i = 0; i < MAX_ITEMS; i++) addEvent();

  // Stream new events at random intervals
  function scheduleNext() {
    const delay = 1800 + Math.random() * 2200;
    setTimeout(() => { addEvent(); scheduleNext(); }, delay);
  }
  scheduleNext();
})();

/* ===================== BILLING TOGGLE ===================== */
function setBilling(plan) {
  const price = document.getElementById('scalePrice');
  const sublabel = document.getElementById('scaleSublabel');
  const btnMonthly = document.getElementById('toggleMonthly');
  const btnYearly = document.getElementById('toggleYearly');

  if (plan === 'yearly') {
    price.innerHTML = '$833<span class="pricing-period">/ mo</span>';
    sublabel.textContent = 'Billed $10,000/year — 2 months free';
    btnYearly.classList.add('active');
    btnMonthly.classList.remove('active');
  } else {
    price.innerHTML = '$1,000<span class="pricing-period">/ mo</span>';
    sublabel.textContent = 'First month free with 90-day contract';
    btnMonthly.classList.add('active');
    btnYearly.classList.remove('active');
  }
}

/* ===================== PARTICLE CANVAS ===================== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
const PARTICLE_COUNT = 80;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '108,99,255' : '0,212,255';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(108,99,255,${0.12 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ===================== HAMBURGER MENU ===================== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.nav-close').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ===================== NAV SCROLL ===================== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ===================== SCROLL REVEAL ===================== */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger siblings in the same parent
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ===================== COUNTER ANIMATION ===================== */
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ===================== FAQ ACCORDION ===================== */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ===================== CONTACT FORM ===================== */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnSpinner = submitBtn.querySelector('.btn-spinner');
const formSuccess = document.getElementById('formSuccess');

function validate() {
  let valid = true;

  const fields = [
    { id: 'name',    errorId: 'nameError',    msg: 'Please enter your name.',          check: v => v.trim().length >= 2 },
    { id: 'email',   errorId: 'emailError',   msg: 'Please enter a valid email.',      check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'company', errorId: 'companyError', msg: 'Please enter your company name.',  check: v => v.trim().length >= 1 },
    { id: 'message', errorId: 'messageError', msg: 'Please tell us how we can help.',  check: v => v.trim().length >= 10 },
  ];

  fields.forEach(({ id, errorId, msg, check }) => {
    const input = document.getElementById(id);
    const error = document.getElementById(errorId);
    if (!check(input.value)) {
      input.classList.add('error');
      error.textContent = msg;
      valid = false;
    } else {
      input.classList.remove('error');
      error.textContent = '';
    }
  });

  return valid;
}

// Clear error on input
['name','email','company','message'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('error');
    document.getElementById(id + 'Error').textContent = '';
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  submitBtn.disabled = true;
  btnText.hidden = true;
  btnSpinner.hidden = false;

  try {
    const res = await fetch('https://formsubmit.co/ajax/Jake@quantumflowai.net', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name:     document.getElementById('name').value,
        email:    document.getElementById('email').value,
        company:  document.getElementById('company').value,
        message:  document.getElementById('message').value,
        _cc:      'Brandon@quantumflowai.net,Info@quantumflowai.net',
        _subject: 'New enquiry from QuantumFlow AI website',
        _captcha: 'false',
      })
    });

    if (!res.ok) throw new Error('Network error');

    form.reset();
    formSuccess.hidden = false;
    setTimeout(() => { formSuccess.hidden = true; }, 6000);
  } catch {
    alert('Something went wrong. Please email us directly at Info@quantumflowai.net');
  }

  submitBtn.disabled = false;
  btnText.hidden = false;
  btnSpinner.hidden = true;
});
