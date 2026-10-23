/* =========================================================
   FUTURISTIC CYBER-PHYSICAL SUITE
   - Web Audio API Sci-Fi Synthesizer (Zero-dependency SFX)
   - Real-Time Cyber Telemetry Bar & Clock
   - Global Sci-Fi Command Palette (Ctrl+K / Cmd+K)
   - Biometric Profile HUD Overlays
   - Interactive MineSafe-X V2V Radar Simulator
   - Interactive Aerial Fire Drone Telemetry HUD Simulator
   ========================================================= */

(function () {
  "use strict";

  /* ==================== 1. WEB AUDIO SFX SYNTHESIZER ==================== */

  let audioCtx = null;
  let sfxEnabled = true;

  try {
    const savedSfx = localStorage.getItem("saurabh_sfx");
    sfxEnabled = savedSfx !== "false";
  } catch (e) {
    sfxEnabled = true;
  }

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const Sound = {
    // Soft high-frequency sci-fi click on hover
    blip: function () {
      if (!sfxEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.035, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } catch (err) {}
    },

    // Futuristic confirmation chirp on click / select
    chirp: function () {
      if (!sfxEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } catch (err) {}
    },

    // Proximity / Collision Alarm
    warning: function () {
      if (!sfxEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (err) {}
    },

    // Power-up hum for modal openings
    launch: function () {
      if (!sfxEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } catch (err) {}
    }
  };

  function toggleSfx(forceState) {
    sfxEnabled = typeof forceState === "boolean" ? forceState : !sfxEnabled;
    try {
      localStorage.setItem("saurabh_sfx", String(sfxEnabled));
    } catch (e) {}

    const btn = document.getElementById("cyberSfxBtn");
    if (btn) {
      btn.innerHTML = sfxEnabled
        ? '<span>🔊</span><span>SFX: ON</span>'
        : '<span>🔇</span><span>SFX: OFF</span>';
      btn.classList.toggle("active", sfxEnabled);
    }
    if (sfxEnabled) Sound.chirp();
  }

  /* ==================== 2. TOP TELEMETRY HUD BAR ==================== */

  function initTelemetryBar() {
    if (document.getElementById("cyberHudBar")) return;

    const bar = document.createElement("div");
    bar.id = "cyberHudBar";
    bar.className = "cyber-hud-bar";
    bar.innerHTML = `
      <div class="cyber-hud-container">
        <div class="cyber-hud-left">
          <div class="cyber-status-badge">
            <span class="cyber-pulse-dot" aria-hidden="true"></span>
            <span>SYSTEM: NOMINAL</span>
          </div>
          <div class="cyber-telemetry-tag">
            <span>STATION:</span> NIT NAGALAND [25.86°N, 93.75°E]
          </div>
          <div class="cyber-telemetry-tag">
            <span>TIME:</span> <span id="cyberHudClock">--:--:--</span> IST
          </div>
        </div>
        <div class="cyber-hud-right">
          <button type="button" class="cyber-hud-btn" id="cyberLaunchV2V">
            <span>⚡</span><span>V2V Radar</span>
          </button>
          <button type="button" class="cyber-hud-btn" id="cyberLaunchDrone">
            <span>🎯</span><span>Drone HUD</span>
          </button>
          <button type="button" class="cyber-hud-btn ${sfxEnabled ? "active" : ""}" id="cyberSfxBtn" title="Toggle Sci-Fi Audio SFX">
            <span>${sfxEnabled ? "🔊" : "🔇"}</span><span>SFX: ${sfxEnabled ? "ON" : "OFF"}</span>
          </button>
          <button type="button" class="cyber-hud-btn" id="cyberPaletteTrigger" title="Open Command Palette (Ctrl+K)">
            <span>⌘</span><span>Search</span><span class="cyber-key-badge">Ctrl+K</span>
          </button>
        </div>
      </div>
    `;

    const header = document.querySelector("header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(bar, header.nextSibling);
    } else {
      document.body.prepend(bar);
    }

    // Dynamic Clock
    function updateClock() {
      const clockEl = document.getElementById("cyberHudClock");
      if (!clockEl) return;
      const now = new Date();
      // IST is UTC+5:30
      const istTime = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
      const hours = String(istTime.getHours()).padStart(2, "0");
      const mins = String(istTime.getMinutes()).padStart(2, "0");
      const secs = String(istTime.getSeconds()).padStart(2, "0");
      clockEl.textContent = `${hours}:${mins}:${secs}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Event handlers
    document.getElementById("cyberSfxBtn")?.addEventListener("click", function () {
      toggleSfx();
    });

    document.getElementById("cyberLaunchV2V")?.addEventListener("click", function () {
      Sound.launch();
      openV2VSimulator();
    });

    document.getElementById("cyberLaunchDrone")?.addEventListener("click", function () {
      Sound.launch();
      openDroneSimulator();
    });

    document.getElementById("cyberPaletteTrigger")?.addEventListener("click", function () {
      Sound.chirp();
      openCommandPalette();
    });
  }

  /* ==================== 3. BIOMETRIC PROFILE HUD OVERLAYS ==================== */

  function initProfileHud() {
    const frame = document.querySelector(".profile-photo-frame");
    if (!frame || frame.querySelector(".profile-hud-bracket")) return;

    const brackets = ["tl", "tr", "bl", "br"].map(function (pos) {
      const el = document.createElement("div");
      el.className = `profile-hud-bracket ${pos}`;
      el.setAttribute("aria-hidden", "true");
      return el;
    });

    const scanLine = document.createElement("div");
    scanLine.className = "profile-scan-line";
    scanLine.setAttribute("aria-hidden", "true");

    const tag = document.createElement("div");
    tag.className = "profile-hud-overlay-tag";
    tag.innerHTML = `
      <span class="hud-id">SAURABH PATEL</span>
      <span>EMBEDDED · ROBOTICS · IOT</span>
    `;

    frame.append(...brackets, scanLine, tag);
  }

  /* ==================== 4. COMMAND PALETTE (Ctrl+K) ==================== */

  const COMMAND_ITEMS = [
    // Navigation
    { title: "Home", desc: "Main portfolio overview & hero", category: "Navigation", icon: "⌂", url: "index.html" },
    { title: "Projects", desc: "Major & minor engineering builds", category: "Navigation", icon: "⌘", url: "projects.html" },
    { title: "Skills", desc: "Technical toolkit & hardware proficiencies", category: "Navigation", icon: "▣", url: "skills.html" },
    { title: "Experience", desc: "Professional background & outreach", category: "Navigation", icon: "↗", url: "experience.html" },
    { title: "Elexoplus Internship", desc: "Electronics manufacturing & production workflows (June–July 2026)", category: "Experience", icon: "🏭", url: "experience.html#elexoplus" },
    { title: "Education", desc: "Academic journey & NIT Nagaland", category: "Navigation", icon: "▤", url: "education.html" },
    { title: "Leadership", desc: "Club coordination & event leadership", category: "Navigation", icon: "✳", url: "leadership.html" },
    { title: "Achievements", desc: "Milestones, SIH & recognitions", category: "Navigation", icon: "✧", url: "achievements.html" },
    { title: "Hackathons & Events", desc: "SIH, TxG Expo, photos & videos", category: "Navigation", icon: "▧", url: "events.html" },
    { title: "View CV / Resume", desc: "Full curriculum vitae PDF", category: "Navigation", icon: "📄", url: "view-cv.html" },
    { title: "Contact", desc: "Get in touch & direct email form", category: "Navigation", icon: "✉", url: "contact.html" },

    // Hardware Simulators
    { title: "Launch MineSafe-X V2V Radar", desc: "Interactive mining collision avoidance simulator", category: "Interactive Simulators", icon: "⚡", action: "v2v" },
    { title: "Launch Aerial Fire Drone HUD", desc: "Interactive flight HUD with thermal vision toggle", category: "Interactive Simulators", icon: "🎯", action: "drone" },

    // Theme Switchers
    { title: "Theme: Mission Control", desc: "Dark cyber-tactical telemetry mode", category: "Themes", icon: "⌁", theme: "missioncontrol" },
    { title: "Theme: VisionOS / Spatial Glass", desc: "Ultra-sleek frosted glassmorphism", category: "Themes", icon: "◈", theme: "visionos" },
    { title: "Theme: Neural Network", desc: "Deep purple & cyber-node styling", category: "Themes", icon: "⌘", theme: "neural" },
    { title: "Theme: Retro Terminal", desc: "CRT phosphor green command terminal", category: "Themes", icon: ">_", theme: "terminal" },
    { title: "Theme: Obsidian Luxury", desc: "Gold & rich midnight black aesthetic", category: "Themes", icon: "◆", theme: "obsidian" },
    { title: "Theme: Blueprint Engineering", desc: "Technical CAD blueprint styling", category: "Themes", icon: "⌗", theme: "blueprint" },
    { title: "Theme: Night Mode", desc: "Deep blue dark mode", category: "Themes", icon: "🌙", theme: "night" },
    { title: "Theme: Day Mode", desc: "Crisp modern light mode", category: "Themes", icon: "☀️", theme: "day" },

    // System Utilities
    { title: "Toggle Sci-Fi SFX Audio", desc: "Turn sound effects on or off", category: "System", icon: "🔊", action: "togglesfx" }
  ];

  let paletteBackdrop = null;
  let paletteInput = null;
  let paletteList = null;
  let selectedIndex = 0;
  let filteredItems = [...COMMAND_ITEMS];

  function createCommandPalette() {
    if (paletteBackdrop) return;

    paletteBackdrop = document.createElement("div");
    paletteBackdrop.className = "cyber-modal-backdrop";
    paletteBackdrop.id = "cyberPaletteBackdrop";
    paletteBackdrop.setAttribute("role", "dialog");
    paletteBackdrop.setAttribute("aria-modal", "true");
    paletteBackdrop.setAttribute("aria-label", "Command Palette");

    paletteBackdrop.innerHTML = `
      <div class="cyber-palette-window">
        <div class="cyber-palette-header">
          <span class="cyber-palette-icon" aria-hidden="true">⌘</span>
          <input type="text" class="cyber-palette-input" id="cyberPaletteInput"
            placeholder="Type a command, project, theme, or page..."
            autocomplete="off" spellcheck="false" aria-label="Search portfolio">
          <button type="button" class="cyber-palette-close" id="cyberPaletteClose" aria-label="Close command palette">✕</button>
        </div>
        <div class="cyber-palette-body" id="cyberPaletteBody" role="listbox"></div>
        <div class="cyber-palette-footer">
          <span>Navigation: <b class="cyber-key-badge">↑</b> <b class="cyber-key-badge">↓</b> to navigate</span>
          <span>Select: <b class="cyber-key-badge">↵ Enter</b></span>
          <span>Close: <b class="cyber-key-badge">Esc</b></span>
        </div>
      </div>
    `;

    document.body.appendChild(paletteBackdrop);

    paletteInput = document.getElementById("cyberPaletteInput");
    paletteList = document.getElementById("cyberPaletteBody");

    document.getElementById("cyberPaletteClose").addEventListener("click", closeCommandPalette);

    paletteBackdrop.addEventListener("click", function (e) {
      if (e.target === paletteBackdrop) closeCommandPalette();
    });

    paletteInput.addEventListener("input", function () {
      renderPaletteResults(paletteInput.value);
    });

    paletteInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        Sound.blip();
        selectedIndex = (selectedIndex + 1) % Math.max(1, filteredItems.length);
        updatePaletteSelection();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        Sound.blip();
        selectedIndex = (selectedIndex - 1 + filteredItems.length) % Math.max(1, filteredItems.length);
        updatePaletteSelection();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          executePaletteItem(filteredItems[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        closeCommandPalette();
      }
    });
  }

  function renderPaletteResults(query) {
    query = (query || "").toLowerCase().trim();
    filteredItems = COMMAND_ITEMS.filter(function (item) {
      return (
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });

    selectedIndex = 0;
    paletteList.innerHTML = "";

    if (filteredItems.length === 0) {
      paletteList.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-family: var(--hud-font-mono);">No matching cyber commands found.</div>';
      return;
    }

    let currentCat = "";
    filteredItems.forEach(function (item, idx) {
      if (item.category !== currentCat) {
        currentCat = item.category;
        const catHeader = document.createElement("div");
        catHeader.className = "cyber-palette-group-title";
        catHeader.textContent = currentCat;
        paletteList.appendChild(catHeader);
      }

      const row = document.createElement("div");
      row.className = `cyber-palette-item ${idx === selectedIndex ? "selected" : ""}`;
      row.role = "option";
      row.id = `paletteItem-${idx}`;
      row.innerHTML = `
        <div class="cyber-palette-item-left">
          <span class="cyber-item-icon" aria-hidden="true">${item.icon}</span>
          <div>
            <span class="cyber-item-title">${item.title}</span>
            <span class="cyber-item-desc">${item.desc}</span>
          </div>
        </div>
        <span class="cyber-key-badge">↵</span>
      `;

      row.addEventListener("mouseenter", function () {
        selectedIndex = idx;
        updatePaletteSelection();
      });

      row.addEventListener("click", function () {
        executePaletteItem(item);
      });

      paletteList.appendChild(row);
    });
  }

  function updatePaletteSelection() {
    const items = paletteList.querySelectorAll(".cyber-palette-item");
    items.forEach(function (el, idx) {
      el.classList.toggle("selected", idx === selectedIndex);
      if (idx === selectedIndex) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }

  function executePaletteItem(item) {
    Sound.chirp();
    closeCommandPalette();

    if (item.url) {
      window.location.href = item.url;
    } else if (item.action === "v2v") {
      openV2VSimulator();
    } else if (item.action === "drone") {
      openDroneSimulator();
    } else if (item.action === "togglesfx") {
      toggleSfx();
    } else if (item.theme) {
      const themeBtn = document.querySelector(`.environment-option[data-theme-choice="${item.theme}"]`);
      if (themeBtn) {
        themeBtn.click();
      } else {
        document.documentElement.setAttribute("data-theme", item.theme);
        try {
          localStorage.setItem("saurabh-portfolio-theme", item.theme);
        } catch (e) {}
      }
    }
  }

  function openCommandPalette() {
    createCommandPalette();
    renderPaletteResults("");
    paletteBackdrop.classList.add("open");
    setTimeout(function () {
      if (paletteInput) paletteInput.focus();
    }, 50);
  }

  function closeCommandPalette() {
    if (paletteBackdrop) {
      paletteBackdrop.classList.remove("open");
    }
  }

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      Sound.chirp();
      if (paletteBackdrop && paletteBackdrop.classList.contains("open")) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
  });

  /* ==================== 5. MINESAFE-X V2V RADAR SIMULATOR ==================== */

  let v2vModal = null;
  let v2vCanvas = null;
  let v2vCtx = null;
  let v2vAnimId = null;
  let v2vDistance = 65; // meters (simulated)
  let v2vAngle = 0;
  let gasLeakSim = false;

  function createV2VSimulator() {
    if (v2vModal) return;

    v2vModal = document.createElement("div");
    v2vModal.className = "cyber-modal-backdrop";
    v2vModal.id = "v2vModalBackdrop";
    v2vModal.innerHTML = `
      <div class="cyber-sim-window">
        <div class="cyber-sim-header">
          <div class="cyber-sim-title">
            <span class="pulse">⚡</span>
            <span>MineSafe-X · V2V Collision & Hazard Radar Simulator</span>
          </div>
          <button type="button" class="cyber-palette-close" id="v2vCloseBtn" aria-label="Close V2V simulator">✕</button>
        </div>
        <div class="cyber-sim-content">
          <div class="v2v-sim-grid">
            <div>
              <div class="v2v-radar-frame">
                <canvas id="v2vRadarCanvas" width="340" height="340"></canvas>
              </div>
            </div>
            <div class="v2v-telemetry-panel">
              <div class="v2v-alert-banner safe" id="v2vAlertBanner">
                <span>●</span> <span id="v2vAlertText">STATUS: CLEAR · SAFE DISTANCE</span>
              </div>
              <div class="v2v-metric-row">
                <div class="v2v-metric-card">
                  <div class="v2v-metric-label">Target Distance</div>
                  <div class="v2v-metric-val"><span id="v2vDistVal">65</span> m</div>
                </div>
                <div class="v2v-metric-card">
                  <div class="v2v-metric-label">ESP-NOW Signal</div>
                  <div class="v2v-metric-val"><span id="v2vRssiVal">-58</span> dBm</div>
                </div>
              </div>
              <div class="v2v-metric-row">
                <div class="v2v-metric-card">
                  <div class="v2v-metric-label">Methane (CH₄)</div>
                  <div class="v2v-metric-val" id="v2vCh4Val">0.08 <span>%</span></div>
                </div>
                <div class="v2v-metric-card">
                  <div class="v2v-metric-label">Carbon Monoxide (CO)</div>
                  <div class="v2v-metric-val" id="v2vCoVal">12 <span>ppm</span></div>
                </div>
              </div>
              <div class="v2v-controls">
                <label for="v2vDistSlider">Simulate Mine Haul Truck Approach Distance:</label>
                <input type="range" class="v2v-slider" id="v2vDistSlider" min="5" max="100" value="65">
              </div>
              <div style="display: flex; gap: 10px; margin-top: 8px;">
                <button type="button" class="cyber-hud-btn" id="v2vSimGasBtn" style="flex: 1; justify-content: center;">
                  <span>⚠️</span><span>Simulate Gas Hazard Spike</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(v2vModal);

    document.getElementById("v2vCloseBtn").addEventListener("click", closeV2VSimulator);
    v2vModal.addEventListener("click", function (e) {
      if (e.target === v2vModal) closeV2VSimulator();
    });

    const distSlider = document.getElementById("v2vDistSlider");
    distSlider.addEventListener("input", function (e) {
      v2vDistance = parseInt(e.target.value, 10);
      updateV2VTelemetry();
    });

    document.getElementById("v2vSimGasBtn").addEventListener("click", function () {
      gasLeakSim = !gasLeakSim;
      this.classList.toggle("active", gasLeakSim);
      if (gasLeakSim) {
        Sound.warning();
      } else {
        Sound.chirp();
      }
      updateV2VTelemetry();
    });

    v2vCanvas = document.getElementById("v2vRadarCanvas");
    v2vCtx = v2vCanvas.getContext("2d");
  }

  function updateV2VTelemetry() {
    const distVal = document.getElementById("v2vDistVal");
    const rssiVal = document.getElementById("v2vRssiVal");
    const banner = document.getElementById("v2vAlertBanner");
    const alertText = document.getElementById("v2vAlertText");
    const ch4Val = document.getElementById("v2vCh4Val");
    const coVal = document.getElementById("v2vCoVal");

    if (!distVal) return;

    distVal.textContent = v2vDistance;

    // Simulated RSSI proportional to distance
    const rssi = Math.round(-40 - (v2vDistance / 100) * 45);
    rssiVal.textContent = rssi;

    if (gasLeakSim) {
      ch4Val.innerHTML = '<span style="color:#f43f5e; font-weight:800;">4.85% (LETHAL)</span>';
      coVal.innerHTML = '<span style="color:#f43f5e; font-weight:800;">145 ppm (HAZARD)</span>';
      banner.className = "v2v-alert-banner danger";
      alertText.textContent = "🚨 CRITICAL: HAZARDOUS GAS SPIKE · EVACUATE MINE SECTOR";
      return;
    } else {
      ch4Val.innerHTML = '0.08 <span>%</span>';
      coVal.innerHTML = '12 <span>ppm</span>';
    }

    if (v2vDistance <= 18) {
      banner.className = "v2v-alert-banner danger";
      alertText.textContent = "🚨 COLLISION IMMINENT: ESP-NOW EMERGENCY BRAKE ENGAGED!";
      Sound.warning();
    } else if (v2vDistance <= 38) {
      banner.className = "v2v-alert-banner warning";
      alertText.textContent = "⚠️ PROXIMITY ALERT: REDUCE SPEED (< 40m)";
    } else {
      banner.className = "v2v-alert-banner safe";
      alertText.textContent = "● STATUS: CLEAR · SAFE DISTANCE";
    }
  }

  function drawV2VRadar() {
    if (!v2vCtx || !v2vCanvas) return;
    const w = v2vCanvas.width;
    const h = v2vCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = w * 0.44;

    v2vCtx.fillStyle = "rgba(4, 12, 20, 0.28)";
    v2vCtx.fillRect(0, 0, w, h);

    // Range rings
    v2vCtx.strokeStyle = "rgba(88, 214, 196, 0.25)";
    v2vCtx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(function (frac) {
      v2vCtx.beginPath();
      v2vCtx.arc(cx, cy, maxR * frac, 0, Math.PI * 2);
      v2vCtx.stroke();
    });

    // Crosshairs
    v2vCtx.strokeStyle = "rgba(88, 214, 196, 0.15)";
    v2vCtx.beginPath();
    v2vCtx.moveTo(cx, 10);
    v2vCtx.lineTo(cx, h - 10);
    v2vCtx.moveTo(10, cy);
    v2vCtx.lineTo(w - 10, cy);
    v2vCtx.stroke();

    // Rotating Radar Sweep Line
    v2vAngle = (v2vAngle + 0.035) % (Math.PI * 2);
    const sweepGrad = v2vCtx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    sweepGrad.addColorStop(0, "rgba(88, 214, 196, 0.4)");
    sweepGrad.addColorStop(1, "rgba(88, 214, 196, 0)");

    v2vCtx.save();
    v2vCtx.beginPath();
    v2vCtx.moveTo(cx, cy);
    v2vCtx.arc(cx, cy, maxR, v2vAngle, v2vAngle + 0.35);
    v2vCtx.closePath();
    v2vCtx.fillStyle = sweepGrad;
    v2vCtx.fill();
    v2vCtx.restore();

    // Host Vehicle (Mine Truck Alpha) in center
    v2vCtx.fillStyle = "#58d6c4";
    v2vCtx.beginPath();
    v2vCtx.arc(cx, cy, 6, 0, Math.PI * 2);
    v2vCtx.fill();
    v2vCtx.fillStyle = "rgba(88, 214, 196, 0.9)";
    v2vCtx.font = "600 10px monospace";
    v2vCtx.fillText("TRUCK-A (HOST)", cx - 40, cy + 18);

    // Target Vehicle (Mine Truck Beta) approaching
    const targetDistNorm = (v2vDistance / 100) * maxR;
    const targetX = cx + targetDistNorm * Math.cos(-Math.PI * 0.25);
    const targetY = cy + targetDistNorm * Math.sin(-Math.PI * 0.25);

    const isHazard = v2vDistance <= 20 || gasLeakSim;
    v2vCtx.fillStyle = isHazard ? "#f43f5e" : (v2vDistance <= 40 ? "#fbbf24" : "#10b981");
    v2vCtx.beginPath();
    v2vCtx.arc(targetX, targetY, isHazard ? 8 : 6, 0, Math.PI * 2);
    v2vCtx.fill();

    // Pulsing target ping ring
    const pingR = (Date.now() / 30) % 24;
    v2vCtx.strokeStyle = isHazard ? "rgba(244, 63, 94, 0.6)" : "rgba(88, 214, 196, 0.6)";
    v2vCtx.lineWidth = 1.5;
    v2vCtx.beginPath();
    v2vCtx.arc(targetX, targetY, pingR, 0, Math.PI * 2);
    v2vCtx.stroke();

    v2vCtx.fillStyle = isHazard ? "#ff6b81" : "#94a3b8";
    v2vCtx.font = "600 10px monospace";
    v2vCtx.fillText(`TRUCK-B [${v2vDistance}m]`, targetX + 10, targetY - 4);

    // ESP-NOW Mesh Packet Waves
    const packetT = (Date.now() / 400) % 1;
    const packetX = cx + (targetX - cx) * packetT;
    const packetY = cy + (targetY - cy) * packetT;
    v2vCtx.fillStyle = "#00f2fe";
    v2vCtx.beginPath();
    v2vCtx.arc(packetX, packetY, 3, 0, Math.PI * 2);
    v2vCtx.fill();

    v2vAnimId = requestAnimationFrame(drawV2VRadar);
  }

  function openV2VSimulator() {
    createV2VSimulator();
    v2vModal.classList.add("open");
    updateV2VTelemetry();
    if (!v2vAnimId) {
      drawV2VRadar();
    }
  }

  function closeV2VSimulator() {
    if (v2vModal) {
      v2vModal.classList.remove("open");
    }
    if (v2vAnimId) {
      cancelAnimationFrame(v2vAnimId);
      v2vAnimId = null;
    }
  }

  /* ==================== 6. AERIAL FIRE DRONE TELEMETRY HUD ==================== */

  let droneModal = null;
  let droneCanvas = null;
  let droneCtx = null;
  let droneAnimId = null;
  let thermalMode = false;
  let payloadDeployed = false;

  function createDroneSimulator() {
    if (droneModal) return;

    droneModal = document.createElement("div");
    droneModal.className = "cyber-modal-backdrop";
    droneModal.id = "droneModalBackdrop";
    droneModal.innerHTML = `
      <div class="cyber-sim-window">
        <div class="cyber-sim-header">
          <div class="cyber-sim-title">
            <span class="pulse">🎯</span>
            <span>Aerial Fire Drone · ML Detection & Flight Telemetry HUD</span>
          </div>
          <button type="button" class="cyber-palette-close" id="droneCloseBtn" aria-label="Close drone simulator">✕</button>
        </div>
        <div class="cyber-sim-content">
          <div class="drone-hud-frame">
            <canvas id="droneHudCanvas" width="800" height="380"></canvas>
          </div>
          <div class="drone-hud-controls">
            <div>
              <button type="button" class="drone-toggle-btn" id="droneThermalBtn">
                <span>🔥</span><span>Mode: Optical Vision</span>
              </button>
              <button type="button" class="drone-toggle-btn" id="dronePayloadBtn" style="margin-left: 10px;">
                <span>💣</span><span>Arm Suppression Payload</span>
              </button>
            </div>
            <div style="font-family: var(--hud-font-mono); font-size: 0.8rem; color: var(--text-muted);">
              <span>GPS: 25.8624°N, 93.7512°E</span> · <span style="color: var(--hud-teal);">18 SATS</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(droneModal);

    document.getElementById("droneCloseBtn").addEventListener("click", closeDroneSimulator);
    droneModal.addEventListener("click", function (e) {
      if (e.target === droneModal) closeDroneSimulator();
    });

    const thermalBtn = document.getElementById("droneThermalBtn");
    thermalBtn.addEventListener("click", function () {
      thermalMode = !thermalMode;
      thermalBtn.innerHTML = thermalMode
        ? '<span>🌡️</span><span>Mode: Thermal Infrared (FLIR)</span>'
        : '<span>🔥</span><span>Mode: Optical Vision</span>';
      thermalBtn.classList.toggle("active", thermalMode);
      Sound.chirp();
    });

    const payloadBtn = document.getElementById("dronePayloadBtn");
    payloadBtn.addEventListener("click", function () {
      payloadDeployed = true;
      payloadBtn.innerHTML = '<span>✅</span><span>Payload Dispatched!</span>';
      payloadBtn.classList.add("active");
      Sound.launch();
      setTimeout(function () {
        payloadDeployed = false;
        payloadBtn.innerHTML = '<span>💣</span><span>Arm Suppression Payload</span>';
        payloadBtn.classList.remove("active");
      }, 3500);
    });

    droneCanvas = document.getElementById("droneHudCanvas");
    droneCtx = droneCanvas.getContext("2d");
  }

  function drawDroneHUD() {
    if (!droneCtx || !droneCanvas) return;
    const w = droneCanvas.width;
    const h = droneCanvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Background: Simulated camera feed or Thermal infrared
    if (thermalMode) {
      const grad = droneCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#1a0033");
      grad.addColorStop(0.5, "#4d004d");
      grad.addColorStop(1, "#001a33");
      droneCtx.fillStyle = grad;
      droneCtx.fillRect(0, 0, w, h);

      // Thermal fire heat signatures
      const fireGrad = droneCtx.createRadialGradient(cx + 90, cy - 30, 5, cx + 90, cy - 30, 60);
      fireGrad.addColorStop(0, "#ffffff");
      fireGrad.addColorStop(0.25, "#ffff00");
      fireGrad.addColorStop(0.65, "#ff3300");
      fireGrad.addColorStop(1, "transparent");
      droneCtx.fillStyle = fireGrad;
      droneCtx.beginPath();
      droneCtx.arc(cx + 90, cy - 30, 60, 0, Math.PI * 2);
      droneCtx.fill();
    } else {
      droneCtx.fillStyle = "#071321";
      droneCtx.fillRect(0, 0, w, h);

      // Simulated landscape grid
      droneCtx.strokeStyle = "rgba(88, 214, 196, 0.08)";
      droneCtx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        droneCtx.beginPath();
        droneCtx.moveTo(x, 0);
        droneCtx.lineTo(x, h);
        droneCtx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        droneCtx.beginPath();
        droneCtx.moveTo(0, y);
        droneCtx.lineTo(w, y);
        droneCtx.stroke();
      }
    }

    // Artificial Horizon & Gyro Lines
    const roll = Math.sin(Date.now() / 2000) * 0.05;
    droneCtx.save();
    droneCtx.translate(cx, cy);
    droneCtx.rotate(roll);

    // Horizon line
    droneCtx.strokeStyle = "rgba(0, 242, 254, 0.6)";
    droneCtx.lineWidth = 2;
    droneCtx.beginPath();
    droneCtx.moveTo(-120, 0);
    droneCtx.lineTo(-30, 0);
    droneCtx.moveTo(30, 0);
    droneCtx.lineTo(120, 0);
    droneCtx.stroke();

    // Pitch markers
    [-40, -20, 20, 40].forEach(function (offset) {
      droneCtx.strokeStyle = "rgba(0, 242, 254, 0.35)";
      droneCtx.beginPath();
      droneCtx.moveTo(-25, offset);
      droneCtx.lineTo(25, offset);
      droneCtx.stroke();
    });

    // Center crosshair
    droneCtx.strokeStyle = "#58d6c4";
    droneCtx.lineWidth = 2;
    droneCtx.beginPath();
    droneCtx.arc(0, 0, 8, 0, Math.PI * 2);
    droneCtx.stroke();
    droneCtx.restore();

    // Telemetry Ticker (Altimeter & Speed)
    droneCtx.fillStyle = "#f8fafc";
    droneCtx.font = "600 13px monospace";
    droneCtx.fillText("ALT: 42.6 m AGL", 24, 40);
    droneCtx.fillText("SPD: 14.2 m/s", 24, 62);
    droneCtx.fillText("BAT: 15.4V (92%)", 24, 84);
    droneCtx.fillText("IMU: STM32 DUAL-CORE", 24, 106);

    droneCtx.textAlign = "right";
    droneCtx.fillText("CAM: 1080p 60FPS", w - 24, 40);
    droneCtx.fillText("AI: EDGE IMPULSE ML", w - 24, 62);
    droneCtx.fillText(thermalMode ? "SENSOR: FLIR THERMAL" : "SENSOR: OPTICAL CMOS", w - 24, 84);
    droneCtx.textAlign = "left";

    // AI Bounding Box Target Lock
    const targetBoxX = cx + 50;
    const targetBoxY = cy - 70;
    const targetBoxW = 90;
    const targetBoxH = 80;

    droneCtx.strokeStyle = "#f43f5e";
    droneCtx.lineWidth = 2;
    droneCtx.strokeRect(targetBoxX, targetBoxY, targetBoxW, targetBoxH);

    // Corner brackets on target
    droneCtx.fillStyle = "#f43f5e";
    droneCtx.font = "700 11px monospace";
    droneCtx.fillText("🔥 FIRE DETECTED: 98.4%", targetBoxX, targetBoxY - 8);

    if (payloadDeployed) {
      droneCtx.fillStyle = "#00ff88";
      droneCtx.font = "700 14px monospace";
      droneCtx.textAlign = "center";
      droneCtx.fillText(">>> SUPPRESSION AGENT RELEASED <<<", cx, h - 30);
      droneCtx.textAlign = "left";
    }

    droneAnimId = requestAnimationFrame(drawDroneHUD);
  }

  function openDroneSimulator() {
    createDroneSimulator();
    droneModal.classList.add("open");
    if (!droneAnimId) {
      drawDroneHUD();
    }
  }

  function closeDroneSimulator() {
    if (droneModal) {
      droneModal.classList.remove("open");
    }
    if (droneAnimId) {
      cancelAnimationFrame(droneAnimId);
      droneAnimId = null;
    }
  }

  /* ==================== 7. HOOK INTO PROJECT CARDS ==================== */

  function injectProjectSimButtons() {
    const cards = document.querySelectorAll(".project-card");
    cards.forEach(function (card) {
      const title = card.querySelector("h3");
      if (!title) return;
      const text = title.textContent.toLowerCase();

      if (text.includes("fire detection") && !card.querySelector(".drone-sim-btn")) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "project-sim-cta drone-sim-btn";
        btn.innerHTML = '<span>🎯</span><span>Launch Flight Telemetry HUD</span>';
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          Sound.launch();
          openDroneSimulator();
        });
        const details = card.querySelector(".project-details");
        if (details) details.appendChild(btn);
      }

      if (text.includes("minesafe") && !card.querySelector(".v2v-sim-btn")) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "project-sim-cta v2v-sim-btn";
        btn.innerHTML = '<span>⚡</span><span>Launch V2V Radar Simulator</span>';
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          Sound.launch();
          openV2VSimulator();
        });
        const details = card.querySelector(".project-details");
        if (details) details.appendChild(btn);
      }
    });
  }

  /* ==================== 8. SOUND EFFECTS HOOK FOR CARDS & BUTTONS ==================== */

  function attachSoundHooks() {
    document.querySelectorAll(".dashboard-card, .btn, .nav-links a, .environment-toggle").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        Sound.blip();
      });
      el.addEventListener("click", function () {
        Sound.chirp();
      });
    });
  }

  /* ==================== INITIALIZATION ==================== */

  function initializeFuturisticSuite() {
    initTelemetryBar();
    initProfileHud();
    injectProjectSimButtons();
    attachSoundHooks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeFuturisticSuite);
  } else {
    initializeFuturisticSuite();
  }

  // Export globally for direct interactive execution
  window.CyberSuite = {
    openCommandPalette: openCommandPalette,
    openV2VSimulator: openV2VSimulator,
    openDroneSimulator: openDroneSimulator,
    toggleSfx: toggleSfx,
    Sound: Sound
  };
})();
