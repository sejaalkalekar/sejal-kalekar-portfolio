// ===================== SCROLL PROGRESS ===================== //
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if (progressBar) progressBar.style.width = scrolled + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

// ===================== HERO NETWORK CANVAS ===================== //
(function initNetwork() {
  const canvas = document.getElementById('network');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes, animId;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function makeNodes() {
    const count = Math.max(18, Math.min(46, Math.floor((w * h) / 26000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.strokeStyle = `rgba(249,115,22,${0.14 * (1 - dist / 150)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,191,36,0.55)';
      ctx.fill();
    });
    animId = requestAnimationFrame(step);
  }

  resize();
  makeNodes();
  if (!reduceMotion) step();
  else { step(); cancelAnimationFrame(animId); }

  window.addEventListener('resize', () => { resize(); makeNodes(); }, { passive: true });
})();

// ===================== ANIMATED STAT COUNTERS ===================== //
const statEls = document.querySelectorAll('.stat__num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });
statEls.forEach(el => statObserver.observe(el));

// ===================== CARD TILT + CURSOR SPOTLIGHT ===================== //
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    const rotX = ((y / rect.height) - 0.5) * -6;
    const rotY = ((x / rect.width) - 0.5) * 6;
    card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===================== NAV ===================== //
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 20);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===================== SCROLL REVEAL ===================== //
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ===================== HERO TYPEWRITER ===================== //
const roles = [
  'Cloud Engineer | AWS | Linux | Docker',
  'AWS Cloud Engineer',
  'Linux Administrator',
  'DevOps Practitioner (in progress)'
];
const typewriterEl = document.getElementById('typewriter');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIndex];
  if (!deleting) {
    charIndex++;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }
  } else {
    charIndex--;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 55);
}
if (typewriterEl) typeLoop();

// ===================== TERMINAL WIDGET ===================== //
const terminalBody = document.getElementById('terminalBody');
const terminalInput = document.getElementById('terminalInput');

const COMMANDS = {
  whoami: 'Sejal Kalekar — Linux & AWS Cloud Engineer',
  role: 'Cloud Engineer · Linux Administrator · Aspiring DevOps Engineer',
  skills: 'AWS (EC2, IAM, VPC, S3, RDS) · Linux · Shell Scripting · Git · React',
  contact: 'sejaalkalekar@gmail.com · linkedin.com/in/sejaalkalekar · github.com/sejaalkalekar',
  location: 'Nashik, Maharashtra, India',
  experience: '4+ years across React development, Linux administration & cloud support',
  projects: 'AWS Three-Tier Infrastructure · React App CI/CD Deployment — see the Projects section above',
  resume: 'Opening resume...',
  clear: '__CLEAR__',
  help: 'Available commands: whoami, role, skills, contact, location, experience, projects, resume, clear'
};

function addLine(html) {
  const line = document.createElement('div');
  line.className = 'terminal__line';
  line.innerHTML = html;
  terminalBody.appendChild(line);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function runCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  addLine(`<span class="terminal__prompt">$</span> ${escapeHtml(raw)}`);
  if (!cmd) return;
  if (cmd === 'clear') {
    terminalBody.innerHTML = '';
    return;
  }
  if (cmd === 'resume') {
    addLine(`<span class="terminal__output--accent">${COMMANDS.resume}</span>`);
    window.open('assets/resume.pdf', '_blank');
    return;
  }
  if (COMMANDS[cmd]) {
    addLine(`<span class="terminal__output">${COMMANDS[cmd]}</span>`);
  } else {
    addLine(`<span class="terminal__output">command not found: ${escapeHtml(cmd)} — try "help"</span>`);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

if (terminalInput) {
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      runCommand(terminalInput.value);
      terminalInput.value = '';
    }
  });

  // Seed with a couple of example outputs on first view
  const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        addLine(`<span class="terminal__output">${COMMANDS.whoami}</span>`);
        terminalObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  terminalObserver.observe(document.getElementById('terminalWidget'));
}

// ===================== FOOTER YEAR ===================== //
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
