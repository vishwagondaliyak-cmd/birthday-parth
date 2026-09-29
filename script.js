/* ===== Helpers ===== */
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ===== Floating background sparkles (lightweight) ===== */
const icons = ["✦", "★", "♡", "✧", "⋆"];
for (let i = 0; i < 16; i++) {
  const s = document.createElement("span");
  s.textContent = icons[i % icons.length];
  s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;font-size:${12 + Math.random() * 16}px;animation-delay:${Math.random() * 6}s;color:#c77dab`;
  $("bg").appendChild(s);
}

/* ===== Confetti (simple canvas) ===== */
const cv = $("fx"), ctx = cv.getContext("2d");
let bits = [];
function size() { cv.width = innerWidth; cv.height = innerHeight; }
size(); addEventListener("resize", size);
function confetti(n = 80) {
  const cols = ["#f7a8c4", "#c9b6ff", "#ffdcc2", "#fff", "#ffd54f"];
  for (let i = 0; i < n; i++)
    bits.push({ x: cv.width / 2, y: cv.height / 2, vx: (Math.random() - .5) * 14, vy: Math.random() * -14 - 3,
      s: 4 + Math.random() * 6, c: cols[i % cols.length], life: 120 });
  if (bits.length === n) loop();
}
function loop() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  bits = bits.filter((b) => b.life-- > 0);
  bits.forEach((b) => { b.x += b.vx; b.y += b.vy; b.vy += .35; ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, b.s, b.s); });
  if (bits.length) requestAnimationFrame(loop); else ctx.clearRect(0, 0, cv.width, cv.height);
}

/* ===== Screen navigation =====
   go("s-xxx") hides every screen and shows the chosen one.
   Any button with data-go="s-xxx" works automatically. */
const hooks = { "s-unlock": runUnlock, "s-reveal": runReveal, "s-report": watch, "s-story": watch };
function go(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
  scrollTo({ top: 0 });
  if (hooks[id]) hooks[id]();
}
document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));

/* ===== Scroll animations: timeline cards + progress bars ===== */
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("show");
  const bar = e.target.querySelector(".bar i");
  if (bar) bar.style.width = bar.dataset.v + "%";
  io.unobserve(e.target);
}), { threshold: 0.3 });
function watch() {
  document.querySelectorAll(".screen.active .reveal").forEach((el) => io.observe(el));
}

/* ===== PART 1: gate ===== */
$("yes").addEventListener("click", async () => {
  $("yes").classList.add("hide");
  $("loadline").classList.remove("hide");
  for (const t of ["Checking…", "Analyzing irritation levels…", "Checking randomness…", "Searching friendship database…"]) {
    $("loadline").textContent = t; await wait(900);
  }
  $("loadline").classList.add("hide");
  $("confirmed").classList.remove("hide");
});

/* ===== PARTS 2-4: quizzes =====
   The right answer is the button with the "data-correct" attribute in index.html.
   Wrong answers just show an error - he can always retry. */
document.querySelectorAll(".quiz").forEach((q) => {
  const fb = q.querySelector(".fb"), next = q.querySelector(".btn");
  q.querySelectorAll(".opt").forEach((o) => o.addEventListener("click", () => {
    const right = o.hasAttribute("data-correct");
    const [h, t] = (right ? q.dataset.ok : q.dataset.bad).split("|");
    fb.innerHTML = `<b>${h}</b>${t}`;
    o.classList.remove("wrong"); void o.offsetWidth;
    o.classList.add(right ? "right" : "wrong");
    if (right) {
      q.querySelectorAll(".opt").forEach((x) => (x.disabled = true));
      next.classList.remove("hide"); confetti(30);
    }
  }));
});

/* ===== PART 5: unlock animation ===== */
async function runUnlock() {
  for (const t of ["VERIFYING…", "FRIENDSHIP DATABASE FOUND…", "MEMORIES FOUND…", "CHAOS FOUND…", "ANNOYING PERSON FOUND…"]) {
    $("ulines").textContent = t; await wait(900);
  }
  $("lock").textContent = "🔓"; $("lock").classList.add("open");
  $("ulines").textContent = "ACCESS GRANTED 🔓"; confetti(120);
  await wait(1600); go("s-reveal");
}

/* ===== PART 6: birthday reveal ===== */
async function runReveal() {
  const line = $("rv-line");
  for (const t of ["HEY PARTH 👀", "I made something for you…", "WAIT…", "IT'S YOUR BIRTHDAY?!"]) {
    line.textContent = t; await wait(1200);
  }
  line.classList.add("hide"); $("rv-main").classList.remove("hide"); confetti(150);
}

/* ===== PART 9: secret cards ===== */
let opened = 0;
document.querySelectorAll(".flip").forEach((c) => c.addEventListener("click", () => {
  if (c.classList.contains("open")) return; // count each card only once
  c.classList.add("open"); opened++;
  $("counter").textContent = `Secrets unlocked: ${opened}/6`;
  if (opened === 6) { $("allsecrets").classList.remove("hide"); confetti(60); }
}));

/* ===== PART 10: interrogation (every answer is accepted) ===== */
document.querySelectorAll("#whoopts .opt").forEach((o) => o.addEventListener("click", () => {
  $("whoopts").classList.add("hide"); $("whores").classList.remove("hide");
  let n = 0;
  const t = setInterval(() => { n += 4; $("pts").textContent = n; if (n >= 100) clearInterval(t); }, 40);
  confetti(60);
}));

/* ===== PART 11: fake exit ===== */
const steps = [
  ["WAIT.", "You really thought that was the end?", "Continue…"],
  ["Nice try. 😂", "", "Continue…"],
  ["One last thing.", "", "Okay…"],
];
let step = 0;
function showStep() {
  const [h, t, b] = steps[step];
  $("m-title").textContent = h; $("m-text").textContent = t; $("m-btn").textContent = b;
}
$("done").addEventListener("click", () => { step = 0; showStep(); $("modal").classList.remove("hide"); });
$("m-btn").addEventListener("click", () => {
  step++;
  if (step < steps.length) showStep();
  else { $("modal").classList.add("hide"); go("s-gift"); }
});

/* ===== PART 12: final gift =====
   EDIT THE FINAL MESSAGE BELOW. Use \n for a new line. */
const finalMessage = `Happy Birthday, Parth 🤍

You are genuinely one of the most irritating people I know.

You annoy me.
You test my patience.
You create unnecessary chaos.

And somehow…

you're also one of the best parts of my college life.

We've been around each other since 1st year, properly started knowing each other in 2nd year, and somewhere along the way you became such a normal part of my life that I can't imagine college memories without all the random chaos.

So yes…

You're irritating.

Very irritating.

But you're also important.

And I'm genuinely grateful for all the memories, laughs, arguments, stupid conversations and random moments.

Happy Birthday, idiot. 😂❤️

Stay exactly the way you are…

Just maybe 10% less irritating.`;

$("open").addEventListener("click", async () => {
  $("open").classList.add("hide"); $("gifttag").classList.add("hide");
  $("gift").classList.add("open");
  confetti(200); await wait(400); confetti(120);
  document.body.style.background = "linear-gradient(160deg,#ffd6e0,#e3d9ff,#ffdcc2)";
  await wait(800);
  $("msgwrap").classList.remove("hide");
  // typewriter effect
  for (let i = 0; i <= finalMessage.length; i++) {
    $("msg").textContent = finalMessage.slice(0, i);
    await wait(finalMessage[i] === "\n" ? 60 : 22);
  }
  $("sign").classList.remove("hide");
  await wait(600);
  $("restart").classList.remove("hide"); confetti(100);
});

/* ===== PART 13: restart ===== */
$("restart").addEventListener("click", () => {
  document.body.classList.add("fade");           // smooth fade out
  setTimeout(() => location.reload(), 600);      // reload = back to the opening screen
});
