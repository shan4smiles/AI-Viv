import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Setup Lenis
const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

// --- Three.js Setup (Cinematic 3D Layer) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('particle-canvas'),
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Post-Processing (Bloom)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.2;
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// Neural Field (3D Background)
const particlesCount = 2000;
const positions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50;
}
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00f2ff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const neuralField = new THREE.Points(geometry, material);
scene.add(neuralField);

camera.position.z = 10;

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

function animate() {
    requestAnimationFrame(animate);
    neuralField.rotation.y += 0.001;
    neuralField.rotation.x += 0.0005;
    composer.render();
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

    // Building Windows (Distributed across 3 towers)
    const towers = [
        { x: 250, y: 350, w: 100, h: 250 },
        { x: 400, y: 250, w: 150, h: 350 },
        { x: 600, y: 400, w: 150, h: 200 }
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

// --- 3D Layer Setup (Set initial states) ---
gsap.set(".layer-3d", { transformPerspective: 1000 });
gsap.set("#layer-chip", { z: 50 });
gsap.set("#layer-lines", { z: 0 });
gsap.set("#layer-agent", { z: -100 });
gsap.set("#layer-building", { z: -200, rotationX: 10 });
gsap.set("#layer-reports", { z: 50, rotationY: -15 });

// --- Main GSAP Timeline ---
const masterTL = gsap.timeline({
    scrollTrigger: {
        trigger: ".story-content", start: "top top", end: "bottom bottom", scrub: 1
    }
});

// TOTAL DURATION = 60 (for 6 sections)

// Phase 1: Foundation (Section 1: 0-10)
masterTL.addLabel("foundation", 0);
masterTL.to(camera.position, { z: 5, duration: 10, ease: "power2.inOut" }, 0);
masterTL.to("#layer-chip", { z: 300, rotationY: 45, duration: 8, ease: "power2.inOut" }, 1);
masterTL.to(lines.slice(0, 3), {
    attr: {
        x1: 500, y1: 400,
        x2: (i) => 500 + (i - 1) * 200, y2: (i) => 100 + i * 150
    },
    duration: 8,
    ease: "power2.inOut"
}, 1);

// Phase 2: Chaos (Section 2: 10-20)
masterTL.addLabel("chaos", 10);
masterTL.to(camera.position, { z: 20, x: 2, duration: 10, ease: "power1.inOut" }, 10);
masterTL.to(neuralField.rotation, { y: Math.PI, duration: 10 }, 10);
masterTL.to("#layer-chip", { opacity: 0, z: 600, duration: 4 }, 10);
masterTL.to(lines, {
    attr: {
        x1: () => 300 + Math.random() * 400, y1: () => 200 + Math.random() * 400,
        x2: () => 300 + Math.random() * 400, y2: () => 200 + Math.random() * 400
    },
    opacity: 0.6,
    stagger: 0.01,
    duration: 8,
    ease: "none"
}, 11);

// Phase 3: Structure (Section 3: 20-30)
masterTL.addLabel("structure", 20);
masterTL.to(camera.position, { z: 12, x: 0, y: 3, duration: 10, ease: "power2.inOut" }, 20);
masterTL.to("#master-stage", { rotationX: 25, duration: 10 }, 20); // Tilt the world

masterTL.to(lines.slice(0, 6), { attr: { x1: 350, y1: (i) => 250 + i * 60, x2: 650, y2: (i) => 250 + i * 60 }, duration: 3 }, 21);
masterTL.to(lines.slice(6, 12), { attr: { x1: (i) => 350 + i * 60, y1: 250, x2: (i) => 350 + i * 60, y2: 550 }, duration: 3 }, 21);

masterTL.to(lines.slice(12), { opacity: 0, duration: 1 }, 21);
masterTL.to(nodes, { opacity: 0.8, stagger: 0.01, duration: 3 }, 24);

extraGrids.forEach((grid, i) => {
    masterTL.fromTo(grid.container,
        { x: corners[i].x, y: corners[i].y, opacity: 0, scale: 0.5, z: -500 },
        { x: 0, y: 0, opacity: 0.5, scale: 1, z: 0, duration: 4, ease: "power2.out" },
        24 + i * 0.5
    );
});

// Phase 4: Agent (Section 4: 30-40)
masterTL.addLabel("agent", 30);
masterTL.to(camera.position, { z: 15, y: 0, duration: 10 }, 30);
masterTL.to("#master-stage", { rotationX: 0, duration: 10 }, 30);

masterTL.to([nodes, lines.slice(0, 12), "#layer-lines", "#layer-extra-grids"], {
    opacity: 0, scale: 0.8, z: -300, duration: 2, ease: "power2.inOut"
}, 31);
masterTL.to("#bot-card", { opacity: 1, scale: 1, z: 200, duration: 2, ease: "power2.out" }, 32);
masterTL.from(".bot-eye, .bot-pupil, .bot-mouth", { opacity: 0, scale: 0.8, stagger: 0.2, duration: 2 }, 33);

masterTL.to("#bot-card", { rotationX: 90, scaleY: 0.01, opacity: 0, duration: 1.5, ease: "power2.inOut" }, 36);
masterTL.fromTo(".scanner-line", { opacity: 0, y: 200 }, { opacity: 1, y: 200, duration: 0.5 }, 37);
masterTL.to("#building-group", { opacity: 1, z: 0, duration: 0.5 }, 37.5);
masterTL.to(".building-outline", { opacity: 1, strokeDashoffset: 0, stagger: 0.3, duration: 1.5, ease: "power2.inOut" }, 38);
masterTL.to(".scanner-line", { y: 600, duration: 2, ease: "none" }, 38);
masterTL.to(buildingWindows.children, { opacity: 0.8, stagger: { each: 0.01, from: "top" }, duration: 0.3 }, 39);

// Phase 5: Value (Section 5: 40-50)
masterTL.addLabel("value", 40);
masterTL.to(camera.position, { x: -4, z: 12, duration: 10 }, 40);
masterTL.to(".scanner-line", { opacity: 0, duration: 1 }, 41);
masterTL.to("#layer-building", { opacity: 0, z: -400, duration: 1.5 }, 41);

masterTL.fromTo("#report-group",
    { x: 0, opacity: 0, scale: 0.8, rotationY: -45, z: -200 },
    { x: 200, opacity: 1, scale: 1, rotationY: -15, z: 100, duration: 2 }, 42);
masterTL.to(".report-base", { opacity: 1, duration: 1 }, 43);

masterTL.to(".report-item", { attr: { height: (i) => 20 + Math.random() * 60, y: (i) => 370 - (20 + Math.random() * 60) }, stagger: 0.1, duration: 2 }, 44);
masterTL.to("#report-pie", { scale: 1, z: 50, duration: 1.5, ease: "back.out(1.7)" }, 45);
masterTL.to(".pie-slice", { strokeDashoffset: 50, duration: 2, ease: "power2.inOut" }, 45);
masterTL.to(".pipeline-node", { opacity: 1, scale: 1, z: 30, stagger: 0.1, duration: 1 }, 46);
masterTL.to(".pipeline-link", { opacity: 0.4, strokeDashoffset: 0, stagger: 0.1, duration: 1.5 }, 46);
masterTL.to(".workflow-label", { opacity: 1, stagger: 0.05, duration: 1 }, 46);
masterTL.to("#workflow-icons g", { opacity: 1, z: 20, stagger: 0.2, duration: 1.5 }, 47);

// Phase 6: Logo Payoff (Section 6: 50-60)
masterTL.addLabel("logo", 50);
masterTL.to(camera.position, { x: 0, z: 30, duration: 10, ease: "power2.inOut" }, 50);
masterTL.to(".layer-3d", { opacity: 0, filter: "blur(20px)", z: -1000, duration: 3, stagger: 0.1 }, 51);
masterTL.to("#logo-payoff", { opacity: 1, scale: 1, z: 500, duration: 3, ease: "back.out(1.2)" }, 53);
masterTL.to(neuralField.material, { size: 0.2, opacity: 0, duration: 5 }, 55);
