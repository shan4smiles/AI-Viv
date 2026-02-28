// Setup Lenis
const lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.registerPlugin(ScrollTrigger);

// Sync GSAP ticker with requestAnimationFrame
gsap.ticker.lagSmoothing(0);

// Particle Canvas (Simplified background)
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() { this.init(); }
    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        // Very short vertical dash length
        this.length = 8 + Math.random() * 15; // 8-23px
        this.width = 2;
        // Slow downward drift only
        this.vy = 0.5 + Math.random() * 0.8; // 0.5-1.3px per frame
        // Much more visible opacity
        this.opacity = 0.25 + Math.random() * 0.25; // 0.25-0.50
        // Strong glow
        this.glow = 6 + Math.random() * 8; // 6-14px blur
    }
    update() {
        this.y += this.vy;
        // Seamless loop: restart at top when off bottom
        if (this.y > canvas.height + this.length) {
            this.y = -this.length;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        // Motion blur effect with stronger glow
        ctx.shadowBlur = this.glow;
        ctx.shadowColor = `rgba(0, 242, 255, ${this.opacity * 0.8})`;

        // Draw vertical dash with bright cyan
        ctx.strokeStyle = `rgba(0, 242, 255, ${this.opacity})`;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;
    }
}
// Particle count for visible effect
for (let i = 0; i < 120; i++) particles.push(new Particle());
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}
animate();

// --- Narrative Element Initialization ---
const lineSystem = document.getElementById('line-system');
const nodeSystem = document.getElementById('node-system');
const buildingWindows = document.getElementById('building-windows');
const reportContent = document.getElementById('report-content');

const lines = [];
const nodes = [];
const extraGrids = [];

function createGrid(container, color = "var(--accent-blue)") {
    const gridLines = [];
    const gridNodes = [];
    // Horizontal lines
    for (let i = 0; i < 6; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 350); line.setAttribute("y1", 250 + i * 60);
        line.setAttribute("x2", 650); line.setAttribute("y2", 250 + i * 60);
        line.style.stroke = color;
        line.style.strokeWidth = "1";
        line.style.opacity = "0.4";
        container.appendChild(line);
        gridLines.push(line);
    }
    // Vertical lines
    for (let i = 0; i < 6; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 350 + i * 60); line.setAttribute("y1", 250);
        line.setAttribute("x2", 350 + i * 60); line.setAttribute("y2", 550);
        line.style.stroke = color;
        line.style.strokeWidth = "1";
        line.style.opacity = "0.4";
        container.appendChild(line);
        gridLines.push(line);
    }
    // Nodes
    for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 6; y++) {
            const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            node.setAttribute("cx", 350 + x * 60); node.setAttribute("cy", 250 + y * 60);
            node.setAttribute("r", 3);
            node.style.fill = color;
            node.style.opacity = "0.8";
            container.appendChild(node);
            gridNodes.push(node);
        }
    }
    return { lines: gridLines, nodes: gridNodes, container: container };
}

function initNarrative() {
    // Generate lines for the initial messy phase
    for (let i = 0; i < 40; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 500); line.setAttribute("y1", 400);
        line.setAttribute("x2", 500); line.setAttribute("y2", 400);
        line.classList.add('narrative-line');
        lineSystem.appendChild(line);
        lines.push(line);
    }
    // Set up the main node system for the first grid
    for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 6; y++) {
            const node = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            node.setAttribute("x", 345 + x * 60); node.setAttribute("y", 245 + y * 60);
            node.setAttribute("width", 10); node.setAttribute("height", 10);
            node.classList.add('node-square');
            nodeSystem.appendChild(node);
            nodes.push(node);
        }
    }
    // Prepare extra grid layers
    for (let i = 1; i <= 4; i++) {
        const container = document.getElementById(`grid-layer-${i}`);
        extraGrids.push(createGrid(container));
    }

    // Building Windows (Distributed across 3 towers - smaller and shifted right)
    const towers = [
        { x: 350, y: 400, w: 70, h: 200 },
        { x: 450, y: 320, w: 120, h: 280 },
        { x: 600, y: 420, w: 100, h: 180 }
    ];
    towers.forEach(t => {
        const cols = Math.floor(t.w / 25);
        const rows = Math.floor(t.h / 30);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const w = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                w.setAttribute("width", 8); w.setAttribute("height", 8);
                w.setAttribute("x", t.x + 10 + c * 25); w.setAttribute("y", t.y + 15 + r * 30);
                w.style.fill = "var(--accent-blue)"; w.style.opacity = "0";
                buildingWindows.appendChild(w);
            }
        }
    });
    // 6. Rich Insight Generation (Bars, Pie, Pipeline, Workflow)
    const reportBars = document.getElementById('report-bars');
    const mlPipeline = document.getElementById('ml-pipeline');
    const workflowIcons = document.getElementById('workflow-icons');

    // Bar Chart (Top Right - Relative to base)
    for (let i = 0; i < 6; i++) {
        const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bar.setAttribute("x", 550 + i * 20); bar.setAttribute("y", 370);
        bar.setAttribute("width", 12); bar.setAttribute("height", 0);
        bar.classList.add('report-item');
        reportBars.appendChild(bar);
    }

    // ML Pipeline Nodes & Links (Centered below Pie/Bars)
    const pipelineData = [
        { x: 40, y: 0, label: "DATA" },
        { x: 160, y: 0, label: "ML/AI" },
        { x: 280, y: 0, label: "ROI" }
    ];
    pipelineData.forEach((p, i) => {
        if (i < pipelineData.length - 1) {
            const link = document.createElementNS("http://www.w3.org/2000/svg", "line");
            link.setAttribute("x1", p.x + 15); link.setAttribute("y1", p.y);
            link.setAttribute("x2", pipelineData[i + 1].x - 15); link.setAttribute("y2", pipelineData[i + 1].y);
            link.classList.add("pipeline-link"); link.style.opacity = "0";
            mlPipeline.appendChild(link);
        }
        const node = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        node.setAttribute("x", p.x - 15); node.setAttribute("y", p.y - 15);
        node.setAttribute("width", 30); node.setAttribute("height", 30);
        node.setAttribute("rx", 6);
        node.classList.add("pipeline-node"); node.style.opacity = "0";
        mlPipeline.appendChild(node);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", p.x); label.setAttribute("y", p.y + 35);
        label.setAttribute("text-anchor", "middle");
        label.classList.add("workflow-label");
        label.textContent = p.label;
        mlPipeline.appendChild(label);
    });

    // Workflow Icons (Bottom Row)
    const workflowData = [80, 160, 240];
    const labels = ["CLEANSE", "TRAIN", "DEPLOY"];
    workflowData.forEach((x, i) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "path");
        icon.setAttribute("d", "M-10,0 L0,-10 L10,0 L0,10 Z"); // Diamond
        icon.setAttribute("transform", `translate(${x}, 0)`);
        icon.classList.add("workflow-icon");
        g.appendChild(icon);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x); text.setAttribute("y", 25);
        text.setAttribute("text-anchor", "middle");
        text.textContent = labels[i];
        text.classList.add("workflow-label");
        g.appendChild(text);
        g.style.opacity = "0";
        workflowIcons.appendChild(g);
    });

    // Report Charts (Legacy - keeping for safety but we used reportBars above)
    // Removed old bar loops
}
initNarrative();

// --- Main GSAP Timeline ---
const masterTL = gsap.timeline({
    scrollTrigger: {
        trigger: ".story-content",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        invalidateOnRefresh: true
    }
});

// TOTAL DURATION = 70 (for 7 sections)

// --- NEW PART: Bring in extra grids from corners ---
const corners = [
    { x: -800, y: -600 }, // TL
    { x: 800, y: -600 },  // TR
    { x: -800, y: 600 },  // BL
    { x: 800, y: 600 }   // BR
];

// Phase 1: Foundation (Section 1: 0-10)
masterTL.addLabel("foundation", 0);
masterTL.to(lines.slice(0, 3), {
    attr: {
        x1: 500, y1: 400,
        x2: (i) => 500 + (i - 1) * 200, y2: (i) => 100 + i * 150
    },
    duration: 8,
    ease: "power2.inOut"
}, 0);

// Phase 2: Chaos (Section 2: 10-20)
masterTL.addLabel("chaos", 10);
masterTL.to(lines, {
    attr: {
        x1: () => 300 + Math.random() * 400, y1: () => 200 + Math.random() * 400,
        x2: () => 300 + Math.random() * 400, y2: () => 200 + Math.random() * 400
    },
    opacity: 0.6,
    stagger: 0.01,
    duration: 9,
    ease: "power1.inOut"
}, 10);

// Phase 3: Structure (Section 3: 20-30)
masterTL.addLabel("structure", 20);
masterTL.to(lines.slice(0, 6), {
    attr: { x1: 350, y1: (i) => 250 + i * 60, x2: 650, y2: (i) => 250 + i * 60 },
    duration: 3,
    ease: "power2.out"
}, 20);
masterTL.to(lines.slice(6, 12), {
    attr: { x1: (i) => 350 + i * 60, y1: 250, x2: (i) => 350 + i * 60, y2: 550 },
    duration: 3,
    ease: "power2.out"
}, 20);
masterTL.to(lines.slice(12), { opacity: 0, duration: 1.5, ease: "power2.out" }, 20);
masterTL.to(nodes, { opacity: 0.8, stagger: 0.01, duration: 4, ease: "power2.out" }, 22);

extraGrids.forEach((grid, i) => {
    masterTL.fromTo(grid.container,
        { x: corners[i].x, y: corners[i].y, opacity: 0, scale: 0.5, rotation: 45 },
        { x: 0, y: 0, opacity: 0.5, scale: 1, rotation: 0, duration: 5, ease: "power2.out" },
        22 + i * 0.4
    );
});

// Phase 4: Agent (Section 4: 30-40)
masterTL.addLabel("agent", 30);
masterTL.to([nodes, lines.slice(0, 12), "#line-system", "[id^='grid-layer-']", ".node-square", "#chip-group"], {
    opacity: 0, scale: 0.8, duration: 2, ease: "power2.inOut"
}, 30);
masterTL.to("#bot-card", { opacity: 1, scale: 1, duration: 2.5, ease: "power2.out" }, 31);
masterTL.fromTo(".bot-eye, .bot-pupil, .bot-mouth",
    { opacity: 0, scale: 0 },
    { opacity: 1, scale: 1, stagger: 0.15, duration: 1.5, ease: "back.out(1.7)" },
    32
);

masterTL.to("#bot-card", { rotationX: 90, scaleY: 0.01, opacity: 0, duration: 2, ease: "power2.inOut" }, 36);
masterTL.fromTo(".scanner-line", { opacity: 0, y: 200 }, { opacity: 1, y: 200, duration: 0.5 }, 37);
masterTL.to("#building-group", { opacity: 1, duration: 0.5 }, 37.5);
masterTL.to(".building-outline", { opacity: 1, strokeDashoffset: 0, stagger: 0.3, duration: 1.5, ease: "power2.inOut" }, 38);

// Phase 5: Utilization - Slow Building Scan (Section 5: 40-50)
masterTL.addLabel("utilization", 40);
masterTL.to(".scanner-line", { y: 600, duration: 8, ease: "none" }, 40);
masterTL.to(buildingWindows.children, { opacity: 0.8, stagger: { each: 0.01, from: "top" }, duration: 6 }, 42);

// Phase 6: Value (Section 6: 50-60)
masterTL.addLabel("value", 50);
masterTL.to(".scanner-line", { opacity: 0, duration: 1.5, ease: "power2.inOut" }, 50);
masterTL.to("#building-group", { opacity: 0, duration: 2, ease: "power2.inOut" }, 50);
// Centered on screen
masterTL.fromTo("#report-group", { x: 0, opacity: 0, scale: 0.8 }, { x: 0, opacity: 1, scale: 1, duration: 2.5, ease: "power2.out" }, 51);
masterTL.to(".report-base", { opacity: 1, duration: 1.5 }, 52);

masterTL.to(".report-item", { attr: { height: (i) => 20 + Math.random() * 60, y: (i) => 370 - (20 + Math.random() * 60) }, stagger: 0.1, duration: 2, ease: "power2.out" }, 53);
masterTL.to("#report-pie", { scale: 1, duration: 2, ease: "back.out(1.7)" }, 54);
masterTL.to(".pie-slice", { strokeDashoffset: 50, duration: 2, ease: "power2.inOut" }, 54);
masterTL.to(".pipeline-node", { opacity: 1, scale: 1, stagger: 0.1, duration: 1.5, ease: "power2.out" }, 55);
masterTL.to(".pipeline-link", { opacity: 0.4, strokeDashoffset: 0, stagger: 0.1, duration: 1.5, ease: "power2.out" }, 55);
masterTL.to(".workflow-label", { opacity: 1, stagger: 0.05, duration: 1.5 }, 55);
masterTL.to("#workflow-icons g", { opacity: 1, stagger: 0.2, duration: 2, ease: "power2.out" }, 56);

// Phase 7: Logo Payoff (Section 7: 60-70)
masterTL.addLabel("logo", 60);
masterTL.to(".narrative-element", { opacity: 0, filter: "blur(20px)", scale: 0.9, duration: 4, ease: "power2.inOut" }, 60);
masterTL.to("#central-glow", { opacity: 0, scale: 1.5, duration: 4, ease: "power2.inOut" }, 60);
masterTL.to(lines.slice(0, 12), { attr: { x1: 600, y1: 400, x2: 600, y2: 400 }, opacity: 0, duration: 3, ease: "power2.inOut" }, 60);
masterTL.to("#logo-payoff", { opacity: 1, scale: 1, duration: 4, ease: "back.out(1.2)" }, 62);
