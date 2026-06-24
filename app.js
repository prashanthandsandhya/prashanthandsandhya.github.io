// ===================================================
// ProjectPS — P.S. The Final Commit
// Prashanth & Sandhya Wedding App
// ===================================================

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyD6O7xRdRQQe2ku45Kq2F_6cOmjLXaxY8Q",
    authDomain: "thepswedding.firebaseapp.com",
    databaseURL: "https://thepswedding-default-rtdb.firebaseio.com",
    projectId: "thepswedding",
    storageBucket: "thepswedding.firebasestorage.app",
    messagingSenderId: "28727762701",
    appId: "1:28727762701:web:94191e76c4dbed9f225a44"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

// ===== NEURAL NETWORK ANIMATED BACKGROUND =====
(function initNeuralBg() {
    const canvas = document.getElementById('neural-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, nodes, animFrame;
    let mouse = { x: -1000, y: -1000 };
    let time = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createNodes() {
        const count = Math.min(150, Math.floor((width * height) / 9000));
        nodes = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 3.5 + 1.2,
            pulse: Math.random() * Math.PI * 2,
            layer: Math.floor(Math.random() * 4),
            energy: 0,
        }));
    }

    const colors = [
        '74, 222, 128',   // green
        '244, 114, 182',  // rose/pink
        '252, 215, 121',  // warm gold
        '167, 139, 250',  // soft lavender
    ];

    function draw() {
        time += 0.016;
        ctx.clearRect(0, 0, width, height);

        // Ambient warm glow — slow drifting
        const glowX = width * 0.5 + Math.sin(time * 0.2) * width * 0.25;
        const glowY = height * 0.4 + Math.cos(time * 0.15) * height * 0.2;
        const grad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 450);
        grad.addColorStop(0, 'rgba(244, 114, 182, 0.025)');
        grad.addColorStop(0.4, 'rgba(240, 180, 41, 0.015)');
        grad.addColorStop(0.7, 'rgba(74, 222, 128, 0.01)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;
            n.pulse += 0.025 + n.energy * 0.015;

            if (n.x < -50) n.x = width + 50;
            if (n.x > width + 50) n.x = -50;
            if (n.y < -50) n.y = height + 50;
            if (n.y > height + 50) n.y = -50;

            // Mouse interaction — strong glow and repel
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 300) {
                const force = (300 - dist) / 300;
                n.vx += dx * force * 0.0004;
                n.vy += dy * force * 0.0004;
                n.energy = Math.min(1, n.energy + 0.08);
            } else {
                n.energy *= 0.96;
            }

            // Speed limit
            const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
            if (speed > 0.9) { n.vx *= 0.96; n.vy *= 0.96; }

            const color = colors[n.layer];
            const baseAlpha = 0.4 + Math.sin(n.pulse) * 0.2 + n.energy * 0.4;

            // Outer glow — bigger and brighter near mouse
            const glowSize = n.r * (5 + n.energy * 6);
            const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowSize);
            grd.addColorStop(0, `rgba(${color}, ${baseAlpha * 0.4})`);
            grd.addColorStop(0.5, `rgba(${color}, ${baseAlpha * 0.1})`);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(n.x, n.y, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Core node — bigger
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * (1 + n.energy * 0.8), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${baseAlpha})`;
            ctx.fill();

            // Connections — thicker, longer range
            for (let j = i + 1; j < nodes.length; j++) {
                const m = nodes[j];
                const cx = n.x - m.x;
                const cy = n.y - m.y;
                const cdist = Math.sqrt(cx * cx + cy * cy);
                const maxDist = 200;
                if (cdist < maxDist) {
                    const lineAlpha = 0.22 * (1 - cdist / maxDist) * (1 + n.energy * 1.5);
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(m.x, m.y);
                    ctx.strokeStyle = `rgba(${color}, ${lineAlpha})`;
                    ctx.lineWidth = 0.8 + n.energy * 1.5;
                    ctx.stroke();
                }
            }
        }

        // Data pulses — bright dots racing along connections
        for (let i = 0; i < nodes.length; i += 5) {
            const n = nodes[i];
            for (let j = i + 1; j < Math.min(i + 4, nodes.length); j++) {
                const m = nodes[j];
                const cdist = Math.sqrt((n.x - m.x) ** 2 + (n.y - m.y) ** 2);
                if (cdist < 150) {
                    const t = ((time * 1.5 + i * 0.4) % 2) / 2;
                    if (t >= 0 && t <= 1) {
                        const px = n.x + (m.x - n.x) * t;
                        const py = n.y + (m.y - n.y) * t;
                        const color = colors[n.layer];

                        const pgrd = ctx.createRadialGradient(px, py, 0, px, py, 6);
                        pgrd.addColorStop(0, `rgba(${color}, 0.8)`);
                        pgrd.addColorStop(1, 'transparent');
                        ctx.fillStyle = pgrd;
                        ctx.beginPath();
                        ctx.arc(px, py, 6, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${color}, 0.9)`;
                        ctx.fill();
                    }
                }
            }
        }

        animFrame = requestAnimationFrame(draw);
    }

    resize();
    createNodes();
    draw();

    window.addEventListener('resize', () => { resize(); createNodes(); });
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });
})();

// ===== TERMINAL TYPING =====
(function initTerminal() {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    const lines = [
        { type: 'cmd', text: '$ python train_model.py --task="forever"' },
        { type: 'out', text: '⚡ Loading model: ProjectPS v1.0.0-forever' },
        { type: 'out', text: '📊 Eval results: love=1.0, compatibility=0.99' },
        { type: 'cmd', text: '$ git log --oneline -1' },
        { type: 'out', html: '<span class="t-hash">a1b2c3d</span> <span class="t-msg">feat: merge two lives into one</span>' },
        { type: 'cmd', text: '$ git status' },
        { type: 'out', html: 'On branch: <span class="t-branch">forever</span>' },
        { type: 'out', html: '&nbsp;&nbsp;<span class="t-file">new: marriage.py</span>' },
        { type: 'out', html: '&nbsp;&nbsp;<span class="t-file">new: adventures/*</span>' },
        { type: 'cmd', text: '$ echo "P.S. The Final Commit"' },
        { type: 'out', html: '<span class="t-hash">P.S. The Final Commit</span> 💛' },
    ];

    let lineIdx = 0, charIdx = 0, currentEl = null;

    function getPlain(html) {
        const d = document.createElement('div');
        d.innerHTML = html;
        return d.textContent;
    }

    function typeLine() {
        if (lineIdx >= lines.length) {
            const cur = document.createElement('p');
            cur.className = 't-line';
            cur.innerHTML = '<span class="t-prompt">$</span> <span class="t-cursor">_</span>';
            body.appendChild(cur);
            return;
        }

        const line = lines[lineIdx];
        if (charIdx === 0) {
            currentEl = document.createElement('p');
            currentEl.className = 't-line' + (line.type === 'out' ? ' t-output' : '');
            body.appendChild(currentEl);
        }

        if (line.type === 'cmd') {
            const plain = line.text;
            charIdx++;
            const partial = plain.substring(0, charIdx);
            currentEl.innerHTML = `<span class="t-prompt">${partial[0]}</span><span class="t-cmd">${partial.substring(1)}</span><span class="t-cursor">_</span>`;

            if (charIdx >= plain.length) {
                currentEl.innerHTML = `<span class="t-prompt">$</span><span class="t-cmd">${plain.substring(1)}</span>`;
                lineIdx++; charIdx = 0;
                setTimeout(typeLine, 350);
            } else {
                setTimeout(typeLine, 22 + Math.random() * 30);
            }
        } else {
            currentEl.innerHTML = line.html || line.text;
            lineIdx++; charIdx = 0;
            setTimeout(typeLine, 100);
        }
    }

    setTimeout(typeLine, 600);
})();

// ===== COUNTDOWN =====
(function initCountdown() {
    const target = new Date('2026-09-07T10:00:00-07:00').getTime();
    function update() {
        const diff = Math.max(0, target - Date.now());
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('cd-days').textContent = d;
        document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
        document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
        document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
})();

// ===== SCROLL REVEAL =====
(function initReveal() {
    const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => obs.observe(el));
})();

// ===== TYPEWRITER REVEAL =====
(function initTypewriter() {
    const container = document.querySelector('.sequence-reveal');
    if (!container) return;

    const lines = container.querySelectorAll('.seq-line');
    lines.forEach(line => {
        const text = line.textContent;
        line.textContent = '';
        [...text].forEach(ch => {
            const span = document.createElement('span');
            span.className = 'seq-char';
            span.textContent = ch;
            line.appendChild(span);
        });
    });

    const cursor = document.createElement('span');
    cursor.className = 'seq-cursor';

    let started = false;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting && !started) {
                started = true;
                obs.unobserve(e.target);
                typeAll();
            }
        });
    }, { threshold: 0.5 });
    obs.observe(container);

    function positionCursor(charEl) {
        const rect = charEl.getBoundingClientRect();
        const parentRect = container.getBoundingClientRect();
        cursor.style.left = (rect.right - parentRect.left) + 'px';
        cursor.style.top = (rect.top - parentRect.top) + 'px';
    }

    function typeAll() {
        const allChars = [];
        lines.forEach((line, li) => {
            const chars = line.querySelectorAll('.seq-char');
            chars.forEach(c => allChars.push({ el: c, line: li }));
            if (li < lines.length - 1) allChars.push({ pause: true, line: li });
        });

        let i = 0;
        const speed = 45;
        const pauseTime = 400;

        container.appendChild(cursor);

        function typeNext() {
            if (i >= allChars.length) {
                return;
            }
            const item = allChars[i];
            if (item.pause) {
                i++;
                setTimeout(typeNext, pauseTime);
                return;
            }
            item.el.classList.add('typed');
            positionCursor(item.el);
            i++;
            setTimeout(typeNext, speed);
        }
        setTimeout(typeNext, 300);
    }
})();

// ===== GITHUB CONTRIBUTION HEATMAP =====
(function initContribGraph() {
    const grid = document.getElementById('contrib-grid');
    const monthsEl = document.getElementById('contrib-months');
    if (!grid || !monthsEl) return;

    // Full calendar year: Jan 1 – Dec 31, 2025 (365 days)
    const startDate = new Date(2025, 0, 1); // Jan 1, 2025 (Wednesday)
    const totalDays = 365;
    // Grid is 7 rows (Sun–Sat). Pad start so Jan 1 lands on correct row (Wed = row 3)
    const startDayOfWeek = startDate.getDay(); // 3 (Wednesday)
    const paddedTotal = totalDays + startDayOfWeek;
    const totalWeeks = Math.ceil(paddedTotal / 7);
    const totalCells = totalWeeks * 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // The "project start" — before this, cells are empty/dark
    const projectStart = new Date(2025, 3, 6); // Apr 6, 2025

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Heavy/light day definitions (month is 0-indexed)
    const activityMap = {};
    function mark(month, days, type) {
        days.forEach(d => { activityMap[`${month}-${d}`] = type; });
    }

    // April 2025 (month 3) — specified dates at MAX, others medium fill
    mark(3, [6, 7], 'max');
    mark(3, [8, 9, 10], 'medium');
    mark(3, [11], 'max');
    mark(3, [12, 13], 'medium');
    mark(3, [14], 'max');
    mark(3, [15, 16, 17], 'max');
    mark(3, [18, 19, 20], 'medium');
    mark(3, [21, 22, 23], 'medium');
    mark(3, [24], 'max');
    mark(3, [25, 26], 'medium');
    mark(3, [27, 28, 29], 'max');
    mark(3, [30], 'medium');

    // May 2025 (month 4) — specified dates at MAX, others medium fill
    mark(4, [1], 'medium');
    mark(4, [2, 3], 'max');
    mark(4, [4, 5], 'medium');
    mark(4, [6, 7], 'max');
    mark(4, [8, 9, 10, 11, 12, 13], 'medium');
    mark(4, [14, 15, 16, 17, 18, 19, 20], 'max');
    mark(4, [21, 22], 'medium');
    mark(4, [23, 24, 25, 26, 27, 28], 'max');
    mark(4, [29, 30, 31], 'medium');

    // June 2025 (month 5) — specified dates at MAX, others medium fill
    mark(5, [1, 2], 'medium');
    mark(5, [3, 4, 5, 6, 7, 8], 'max');
    mark(5, [9, 10], 'medium');
    mark(5, [11, 12, 13], 'max');
    mark(5, [14, 15, 16, 17, 18], 'medium');
    mark(5, [19, 20, 21, 22, 23], 'max');
    mark(5, [24], 'medium');

    // Month labels — track which column each month starts
    const monthStarts = [];
    let lastMonth = -1;
    for (let i = 0; i < totalCells; i++) {
        const dayIndex = i - startDayOfWeek;
        if (dayIndex < 0 || dayIndex >= totalDays) continue;
        const d = new Date(2025, 0, 1 + dayIndex);
        const m = d.getMonth();
        const col = Math.floor(i / 7);
        if (m !== lastMonth) {
            monthStarts.push({ month: m, week: col });
            lastMonth = m;
        }
    }

    // Match CSS: 10+3 desktop, 8+2 tablet, 6+2 mobile
    const vw = window.innerWidth;
    const cellSize = vw <= 560 ? 8 : vw <= 900 ? 10 : 13;
    monthsEl.innerHTML = '';
    monthStarts.forEach((ms, idx) => {
        const span = document.createElement('span');
        span.textContent = monthNames[ms.month];
        const nextWeek = idx < monthStarts.length - 1 ? monthStarts[idx + 1].week : totalWeeks;
        span.style.width = `${(nextWeek - ms.week) * cellSize}px`;
        monthsEl.appendChild(span);
    });

    // Render cells — grid flows column-first (7 rows per column = 1 week)
    grid.innerHTML = '';
    for (let i = 0; i < totalCells; i++) {
        const dayIndex = i - startDayOfWeek;
        const cell = document.createElement('div');
        cell.className = 'contrib-cell';

        // Padding cells before Jan 1 or after Dec 31
        if (dayIndex < 0 || dayIndex >= totalDays) {
            cell.style.visibility = 'hidden';
            grid.appendChild(cell);
            continue;
        }

        const cellDate = new Date(2025, 0, 1 + dayIndex);

        // Tooltip with date
        const dateStr = cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        cell.setAttribute('data-date', dateStr);

        const month = cellDate.getMonth();
        const day = cellDate.getDate();
        const key = `${month}-${day}`;

        if (cellDate < projectStart) {
            // Before Apr 6: empty/dark — no activity, no color
            // (default background from CSS, no class added)
        } else if (cellDate > today) {
            // Future: pulsing dashed
            cell.classList.add('cl-future');
        } else if (activityMap[key]) {
            // Specific activity days
            const type = activityMap[key];
            if (type === 'max') {
                cell.classList.add('cl-4');
            } else if (type === 'heavy') {
                cell.classList.add(Math.random() > 0.35 ? 'cl-4' : 'cl-3');
            } else if (type === 'medium') {
                cell.classList.add(Math.random() > 0.5 ? 'cl-3' : 'cl-2');
            } else {
                cell.classList.add(Math.random() > 0.5 ? 'cl-2' : 'cl-1');
            }
        } else {
            // Apr/May/Jun: allow occasional dark gaps for variation
            // Jul onward: steady light (expected activity, more to come)
            if (month <= 5) {
                const r = Math.random();
                if (r > 0.75) cell.classList.add('cl-2');
                else if (r > 0.15) cell.classList.add('cl-1');
            } else {
                cell.classList.add('cl-1');
            }
        }

        grid.appendChild(cell);
    }
})();

// ===== COMMIT TIMELINE TYPING ANIMATION =====
(function initCommitTimeline() {
    const timeline = document.getElementById('commit-timeline');
    if (!timeline) return;

    const items = timeline.querySelectorAll('.commit-item');

    // Inject diff cards from data-diff attributes
    items.forEach(item => {
        const diff = item.getAttribute('data-diff');
        if (diff) {
            const diffEl = document.createElement('div');
            diffEl.className = 'commit-diff';
            diffEl.innerHTML = `<div class="commit-diff-inner">${diff}</div>`;
            item.appendChild(diffEl);
        }
    });

    let triggered = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !triggered) {
                triggered = true;
                typeCommits();
            }
        });
    }, { threshold: 0.15 });

    observer.observe(timeline);

    function typeCommits() {
        items.forEach((item, idx) => {
            setTimeout(() => {
                item.classList.add('typed');
                const msgEl = item.querySelector('.commit-msg');
                if (msgEl) {
                    const fullText = msgEl.textContent;
                    msgEl.textContent = '';
                    msgEl.innerHTML = '<span class="type-cursor"></span>';
                    typeText(msgEl, fullText, 0);
                }
            }, idx * 500);
        });
    }

    function typeText(el, text, i) {
        if (i <= text.length) {
            el.innerHTML = text.substring(0, i) + '<span class="type-cursor"></span>';
            setTimeout(() => typeText(el, text, i + 1), 18);
        } else {
            el.innerHTML = text;
        }
    }
})();

// ===== MOBILE NAV =====
(function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => links.classList.toggle('active'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('active')));
})();

// ===== RSVP =====
const rsvpForm = document.getElementById('rsvp-form');
const rsvpStatus = document.getElementById('rsvp-status');

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guest-name').value.trim();
    const attending = document.querySelector('input[name="attending"]:checked');
    const guests = document.getElementById('party-size').value;
    if (!name || !attending || !guests) {
        showStatus(rsvpStatus, 'Error: all fields required.', 'error');
        return;
    }
    db.ref('rsvps').push({ name, attending: attending.value, guests: parseInt(guests), timestamp: Date.now() })
        .then(() => {
            const msg = attending.value === 'yes'
                ? `✓ Merged! See you Sep 7, ${name}!`
                : `Noted. We'll miss you, ${name}. ❤️`;
            showStatus(rsvpStatus, msg, 'success');
            rsvpForm.reset();
        })
        .catch(() => showStatus(rsvpStatus, 'Push rejected. Try again.', 'error'));
});

// ===== GUESTBOOK =====
const gbForm = document.getElementById('guestbook-form');
const gbStatus = document.getElementById('guestbook-status');
const gbEntries = document.getElementById('guestbook-entries');

// Tab switching
const gbTabs = document.querySelectorAll('.gb-tab');
const gbPanels = document.querySelectorAll('.gb-panel');
let activeTab = 'text';

gbTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        gbTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        gbPanels.forEach(p => p.classList.add('hidden'));
        document.getElementById(`panel-${activeTab}`).classList.remove('hidden');
    });
});

// Drawing canvas
const drawCanvas = document.getElementById('draw-canvas');
const drawCtx = drawCanvas.getContext('2d');
let drawing = false, drawColor = '#1a1a2e';

function initCanvas() {
    drawCtx.fillStyle = '#ffffff';
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.lineWidth = 3;
}
initCanvas();

function getDrawPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (drawCanvas.width / rect.width),
        y: (clientY - rect.top) * (drawCanvas.height / rect.height)
    };
}

drawCanvas.addEventListener('mousedown', (e) => { drawing = true; const p = getDrawPos(e); drawCtx.beginPath(); drawCtx.moveTo(p.x, p.y); });
drawCanvas.addEventListener('mousemove', (e) => { if (!drawing) return; const p = getDrawPos(e); drawCtx.strokeStyle = drawColor; drawCtx.lineTo(p.x, p.y); drawCtx.stroke(); });
drawCanvas.addEventListener('mouseup', () => { drawing = false; });
drawCanvas.addEventListener('mouseleave', () => { drawing = false; });

drawCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; const p = getDrawPos(e); drawCtx.beginPath(); drawCtx.moveTo(p.x, p.y); });
drawCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (!drawing) return; const p = getDrawPos(e); drawCtx.strokeStyle = drawColor; drawCtx.lineTo(p.x, p.y); drawCtx.stroke(); });
drawCanvas.addEventListener('touchend', () => { drawing = false; });

// Color buttons
const colorMap = { 'draw-black': '#1a1a2e', 'draw-green': '#4ade80', 'draw-gold': '#f0b429', 'draw-rose': '#f472b6', 'draw-blue': '#58a6ff' };
Object.entries(colorMap).forEach(([id, color]) => {
    const btn = document.getElementById(id);
    btn.addEventListener('click', () => {
        drawColor = color;
        document.querySelectorAll('.draw-tool').forEach(t => t.classList.remove('active-color'));
        btn.classList.add('active-color');
    });
});
document.getElementById('draw-black').classList.add('active-color');
document.getElementById('draw-clear').addEventListener('click', initCanvas);

// File upload (images + videos)
const uploadZone = document.getElementById('upload-zone');
const uploadInput = document.getElementById('gb-upload');
const uploadPreview = document.getElementById('upload-preview');
const uploadPlaceholder = document.getElementById('upload-placeholder');
let uploadedFile = null;

uploadZone.addEventListener('click', () => uploadInput.click());
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
});
uploadInput.addEventListener('change', (e) => { if (e.target.files[0]) handleUpload(e.target.files[0]); });

function handleUpload(file) {
    if (file.size > 150 * 1024 * 1024) {
        showStatus(gbStatus, 'Error: file too large (max 150MB).', 'error');
        return;
    }
    uploadedFile = file;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video/')) {
        uploadPreview.outerHTML = `<video id="upload-preview" src="${url}" controls class="upload-preview"></video>`;
    } else {
        uploadPreview.src = url;
        uploadPreview.classList.remove('hidden');
    }
    uploadPlaceholder.style.display = 'none';
}

// Upload file to Firebase Storage, return download URL
async function uploadToStorage(file, folder) {
    const filename = `${Date.now()}_${file.name || 'file'}`;
    const ref = storage.ref(`${folder}/${filename}`);
    await ref.put(file);
    return ref.getDownloadURL();
}

// Submit guestbook
gbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('gb-name').value.trim();
    if (!name) { showStatus(gbStatus, 'Error: name required.', 'error'); return; }

    const entry = { name, timestamp: Date.now(), type: activeTab };
    const submitBtn = gbForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    try {
        if (activeTab === 'text') {
            const msg = document.getElementById('gb-message').value.trim();
            if (!msg) { showStatus(gbStatus, 'Error: message required.', 'error'); submitBtn.disabled = false; submitBtn.textContent = 'Submit'; return; }
            entry.message = msg;
        } else if (activeTab === 'draw') {
            const blob = await new Promise(resolve => drawCanvas.toBlob(resolve, 'image/png', 0.8));
            const drawFile = new File([blob], 'drawing.png', { type: 'image/png' });
            entry.mediaUrl = await uploadToStorage(drawFile, 'guestbook');
            entry.mediaType = 'image';
        } else if (activeTab === 'upload') {
            if (!uploadedFile) { showStatus(gbStatus, 'Error: no file selected.', 'error'); submitBtn.disabled = false; submitBtn.textContent = 'Submit'; return; }
            entry.mediaUrl = await uploadToStorage(uploadedFile, 'guestbook');
            entry.mediaType = uploadedFile.type.startsWith('video/') ? 'video' : 'image';
        }

        await db.ref('guestbook').push(entry);
        showStatus(gbStatus, '✓ Committed!', 'success');
        gbForm.reset();
        initCanvas();
        uploadedFile = null;
        const preview = document.getElementById('upload-preview');
        if (preview) { preview.classList.add('hidden'); preview.src = ''; }
        uploadPlaceholder.style.display = '';
    } catch (err) {
        showStatus(gbStatus, 'Push rejected. Try again.', 'error');
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
});

// Realtime guestbook entries
db.ref('guestbook').orderByChild('timestamp').on('value', (snapshot) => {
    gbEntries.innerHTML = '';
    if (!snapshot.exists()) {
        gbEntries.innerHTML = '<p class="gb-empty">// log is empty — be the first contributor</p>';
        return;
    }
    const entries = [];
    snapshot.forEach(child => entries.push(child.val()));

    entries.reverse().forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const el = document.createElement('div');
        el.className = 'gb-entry';

        let content = '';
        if (entry.message) {
            content = `<p class="gb-entry-message">${escapeHtml(entry.message)}</p>`;
        }
        if (entry.mediaUrl) {
            if (entry.mediaType === 'video') {
                content += `<video class="gb-entry-video" src="${entry.mediaUrl}" controls playsinline></video>`;
            } else {
                content += `<img class="gb-entry-image" src="${entry.mediaUrl}" alt="From ${escapeHtml(entry.name)}">`;
            }
        }
        // Legacy support for old base64 entries
        if (entry.drawing) {
            content += `<img class="gb-entry-drawing" src="${entry.drawing}" alt="Drawing by ${escapeHtml(entry.name)}">`;
        }
        if (entry.image) {
            content += `<img class="gb-entry-image" src="${entry.image}" alt="Photo by ${escapeHtml(entry.name)}">`;
        }

        el.innerHTML = `
            ${content}
            <p class="gb-entry-meta">— <span class="gb-entry-name">${escapeHtml(entry.name)}</span> · ${date}</p>
        `;
        gbEntries.appendChild(el);
    });
});

// ===== DYNAMIC GALLERY CAROUSEL =====
(function initGallery() {
    const track = document.getElementById('gallery-track');
    const dotsContainer = document.getElementById('gallery-dots');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    if (!track) return;

    let autoScrollInterval = null;
    let items = [];

    storage.ref('gallery').listAll().then(result => {
        if (result.items.length === 0) {
            track.innerHTML = '<p class="gb-empty" style="padding:2rem;">// photos loading soon...</p>';
            return;
        }

        const urlPromises = result.items.map(item => item.getDownloadURL().then(url => ({ url, name: item.name })));
        Promise.all(urlPromises).then(photos => {
            photos.sort((a, b) => a.name.localeCompare(b.name));
            track.innerHTML = '';
            dotsContainer.innerHTML = '';
            items = [];

            photos.forEach(photo => {
                const item = document.createElement('div');
                item.className = 'gallery-item';

                const ext = photo.name.split('.').pop().toLowerCase();
                if (['mp4', 'webm', 'mov'].includes(ext)) {
                    item.innerHTML = `<video src="${photo.url}" playsinline muted loop></video>`;
                    item.addEventListener('mouseenter', () => item.querySelector('video').play());
                    item.addEventListener('mouseleave', () => item.querySelector('video').pause());
                } else {
                    item.innerHTML = `<img src="${photo.url}" alt="" loading="lazy">`;
                }

                track.appendChild(item);
                items.push(item);

                const dot = document.createElement('button');
                dot.className = 'gallery-dot';
                dot.addEventListener('click', () => scrollToItem(items.indexOf(item)));
                dotsContainer.appendChild(dot);
            });

            updateDots();
            startAutoScroll();
        });
    });

    function scrollToItem(idx) {
        if (!items[idx]) return;
        items[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    function getCurrentIndex() {
        const trackRect = track.getBoundingClientRect();
        const center = trackRect.left + trackRect.width / 2;
        let closest = 0, minDist = Infinity;
        items.forEach((item, i) => {
            const rect = item.getBoundingClientRect();
            const dist = Math.abs(rect.left + rect.width / 2 - center);
            if (dist < minDist) { minDist = dist; closest = i; }
        });
        return closest;
    }

    function updateDots() {
        const current = getCurrentIndex();
        dotsContainer.querySelectorAll('.gallery-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        const idx = getCurrentIndex();
        scrollToItem(Math.max(0, idx - 1));
        resetAutoScroll();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        const idx = getCurrentIndex();
        scrollToItem(Math.min(items.length - 1, idx + 1));
        resetAutoScroll();
    });

    track.addEventListener('scroll', updateDots);
    track.addEventListener('touchstart', () => clearInterval(autoScrollInterval), { passive: true });
    track.addEventListener('touchend', () => startAutoScroll(), { passive: true });

    function startAutoScroll() {
        clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            if (!items.length) return;
            const idx = getCurrentIndex();
            const next = (idx + 1) % items.length;
            scrollToItem(next);
        }, 4000);
    }

    function resetAutoScroll() {
        clearInterval(autoScrollInterval);
        startAutoScroll();
    }
})();

// ===== UTILITIES =====
function showStatus(el, text, type) {
    el.textContent = text;
    el.className = `form-status ${type}`;
    setTimeout(() => { el.textContent = ''; el.className = 'form-status'; }, 6000);
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}
