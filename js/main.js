const traces = [
  {
    tag: "claims",
    model: "Azure OpenAI · GPT-4.1",
    stack: "LangChain · Django · Azure",
    steps: [
      ["01", "Ingest", "Form, chatbot, or Outlook mail"],
      ["02", "Parse", "Read the claim packet"],
      ["03", "Verify", "Cross-check documents"],
      ["04", "Call tools", "Business rules and reserves"],
      ["05", "Score", "Validation score and fraud flags"],
    ],
  },
  {
    tag: "onboarding",
    model: "Azure OpenAI · LangGraph",
    stack: "Django · YAML · AKS",
    steps: [
      ["01", "Greet", "Open the insurance conversation"],
      ["02", "Collect", "Quote inputs, one turn at a time"],
      ["03", "Adapt", "Load the client YAML"],
      ["04", "Answer", "Policy questions with context"],
      ["05", "Hand off", "A quote the team can use"],
    ],
  },
  {
    tag: "broker",
    model: "Azure OpenAI · LangChain",
    stack: "PostgreSQL · Django · EKS",
    steps: [
      ["01", "Ingest", "Pull the policy PDFs"],
      ["02", "Structure", "Clean and normalize clauses"],
      ["03", "Compare", "Line offerings up side by side"],
      ["04", "Explain", "Turn jargon into a decision"],
      ["05", "Store", "Write it to PostgreSQL"],
    ],
  },
  {
    tag: "nl→sql",
    model: "OpenAI · LangChain",
    stack: "MSSQL · PostgreSQL · EC2",
    steps: [
      ["01", "Ask", "A question in plain language"],
      ["02", "Write SQL", "Target MSSQL or PostgreSQL"],
      ["03", "Run", "Fetch the rows"],
      ["04", "Draw", "Chart the result"],
      ["05", "Refine", "Follow-up in the same thread"],
    ],
  },
  {
    tag: "rag",
    model: "OpenAI · retrieval",
    stack: "Flask · EC2 · RunPod",
    steps: [
      ["01", "Load", "PDFs, scans, and images"],
      ["02", "Retrieve", "Find the passage that matters"],
      ["03", "Read", "Ground the answer in that text"],
      ["04", "Reply", "Flask returns it to the UI"],
      ["05", "Infer", "GPU work stays on RunPod"],
    ],
  },
];

const traceList = document.getElementById("trace");
const traceTag = document.getElementById("traceTag");
const traceModel = document.getElementById("traceModel");
const traceStack = document.getElementById("traceStack");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderTrace(index, activeStep) {
  const trace = traces[index];
  traceTag.textContent = trace.tag;
  traceModel.textContent = trace.model;
  traceStack.textContent = trace.stack;
  traceList.innerHTML = "";
  trace.steps.forEach((step, i) => {
    const li = document.createElement("li");
    if (i === activeStep) li.className = "active";
    const id = document.createElement("span");
    id.className = "step";
    id.textContent = step[0];
    const label = document.createElement("span");
    label.textContent = step[2];
    const kind = document.createElement("span");
    kind.className = "kind";
    kind.textContent = step[1];
    li.append(id, label, kind);
    traceList.append(li);
  });
}

let traceIndex = 0;
let stepIndex = 0;
renderTrace(0, 0);

if (!reduceMotion) {
  setInterval(() => {
    stepIndex += 1;
    if (stepIndex >= traces[traceIndex].steps.length) {
      stepIndex = 0;
      traceIndex = (traceIndex + 1) % traces.length;
    }
    renderTrace(traceIndex, stepIndex);
  }, 1400);
}

const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 8);
}, { passive: true });

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

links.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

const copyBtn = document.getElementById("copyMail");
copyBtn.addEventListener("click", async () => {
  const mail = copyBtn.dataset.mail;
  try {
    await navigator.clipboard.writeText(mail);
    copyBtn.textContent = "Copied";
  } catch {
    copyBtn.textContent = mail;
  }
  setTimeout(() => {
    copyBtn.textContent = "Copy email";
  }, 1600);
});

const cursor = document.getElementById("cursor");
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursor.style.opacity = "1";
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  });
  window.addEventListener("pointerleave", () => {
    cursor.style.opacity = "0";
  });
}

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let nodes = [];
const pointer = { x: -9999, y: -9999 };
let frame = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.max(28, Math.min(80, Math.round((width * height) / 22000)));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    r: Math.random() * 1.4 + 0.5,
  }));
}

function drawFrame() {
  ctx.clearRect(0, 0, width, height);
  for (const node of nodes) {
    if (!reduceMotion) {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
      const dx = pointer.x - node.x;
      const dy = pointer.y - node.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 160 && dist > 0) {
        node.x -= (dx / dist) * 0.35;
        node.y -= (dy / dist) * 0.35;
      }
    }
  }

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 130) {
        ctx.strokeStyle = `rgba(62, 231, 255, ${0.16 * (1 - dist / 130)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const node of nodes) {
    ctx.fillStyle = "rgba(231, 238, 248, 0.85)";
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop() {
  if (document.hidden) {
    frame = requestAnimationFrame(loop);
    return;
  }
  drawFrame();
  if (!reduceMotion) frame = requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});
resize();
loop();

const roles = [
  "Generative AI · Agentic systems · LLM applications",
  "Claims agents · tool calling · Azure OpenAI",
  "RAG over policies, scans, and PDFs",
  "Natural language in · SQL and charts out",
];
const roleLine = document.getElementById("roleLine");
let roleIndex = 0;
if (!reduceMotion) {
  setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleLine.textContent = roles[roleIndex];
  }, 2800);
}
