
/* =========================================================
   SAURABH PATEL PORTFOLIO — MAIN JAVASCRIPT
   Includes navigation, galleries, profile carousel, themes,
   animated electronics background, and EmailJS contact form.
   ========================================================= */

async function getPortfolioMedia() {
    if (Array.isArray(window.PORTFOLIO_MEDIA)) {
        return window.PORTFOLIO_MEDIA;
    }

    const response = await fetch("./media.json", {
        cache: "no-cache"
    });

    if (!response.ok) {
        throw new Error("media.json could not be loaded");
    }

    return response.json();
}

window.getPortfolioMedia = getPortfolioMedia;

/* ==================== BACK TO DASHBOARD ==================== */

(function addDashboardReturnLink() {
    const path = window.location.pathname;
    const fileName = path.split('/').filter(Boolean).pop() || 'index.html';
    const isHomePage = fileName.toLowerCase() === 'index.html' ||
        !fileName.includes('.');
    const main = document.querySelector('main');

    if (isHomePage || !main || document.querySelector('.view-toolbar')) return;

    function createToolbar(position) {
        const toolbar = document.createElement('div');
        toolbar.className = 'view-toolbar' + (position === 'bottom' ?
            ' view-toolbar-bottom' : '');

        const backLink = document.createElement('a');
        backLink.className = 'view-back';
        backLink.href = new URL('index.html#dashboard', document.baseURI).href;
        backLink.innerHTML = '<span aria-hidden="true">←</span><span>Back to Dashboard</span>';
        backLink.setAttribute('aria-label', 'Back to portfolio dashboard');

        const label = document.createElement('span');
        label.className = 'view-current-label';
        label.textContent = document.title.split('|')[0].trim() || 'Portfolio';

        toolbar.append(backLink, label);
        return toolbar;
    }

    main.parentNode.insertBefore(createToolbar('top'), main);

    if (!main.querySelector('.page-back')) {
        main.appendChild(createToolbar('bottom'));
    }
})();

/* ==================== MOBILE NAVIGATION ==================== */

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
        const open = navLinks.classList.toggle("active");
        menuBtn.textContent = open ? "✕" : "☰";
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
            menuBtn.textContent = "☰";
            menuBtn.setAttribute("aria-expanded", "false");
        });
    });
}


/* ==================== HACKATHONS SHOW/HIDE ==================== */

function toggleEventsList() {
    const eventsList = document.getElementById("eventsList");
    const toggleText = document.getElementById("toggleText");
    const toggleIcon = document.getElementById("toggleIcon");
    const toggleBtn = document.getElementById("toggleEvents");

    if (!eventsList) return;

    const collapsed = eventsList.classList.toggle("collapsed");

    if (toggleText) {
        toggleText.textContent = collapsed ? "View all" : "Show less";
    }

    if (toggleIcon) {
        toggleIcon.textContent = collapsed ? "＋" : "−";
    }

    if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    }

    if (collapsed) {
        const section = document.getElementById("events");

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }
}

document.getElementById("toggleEvents")
    ?.addEventListener("click", toggleEventsList);


/* ==================== SCROLL REVEAL ==================== */

(function initScrollReveal() {
    // Make sure the contact call-to-action heading participates in the reveal.
    document.querySelectorAll('h1, h2, h3').forEach(function (heading) {
        const text = (heading.textContent || '').replace(/[’‘]/g, "'").toLowerCase();
        if (text.includes("let's build something")) {
            heading.classList.add('reveal', 'contact-cta-heading');
            // Prevent an accidental sticky/fixed rule from pinning this heading.
            heading.style.position = 'relative';
            heading.style.top = 'auto';
            heading.style.bottom = 'auto';
        }
    });

    const revealElements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(function (element) {
            element.classList.add('visible');
        });
        return;
    }

    const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    revealElements.forEach(function (element) {
        revealObserver.observe(element);
    });
})();


/* ==================== ACTIVE NAVIGATION ==================== */

(function () {
    const links = Array.from(document.querySelectorAll(".nav-links a"));

    const sections = links.map(function (link) {
        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#")) return null;

        return document.querySelector(href);
    });

    function updateActiveLink() {
        const y = window.scrollY + 140;
        let current = -1;

        sections.forEach(function (section, index) {
            if (section && section.offsetTop <= y) {
                current = index;
            }
        });

        links.forEach(function (link, index) {
            if (current >= 0) {
                link.classList.toggle("active", index === current);
            }
        });
    }

    window.addEventListener("scroll", updateActiveLink, {
        passive: true
    });

    updateActiveLink();
})();


/* ==================== PROFILE CAROUSEL ==================== */

(function initProfileCarousel() {
    const carousel = document.getElementById("profileCarousel");
    const image = document.getElementById("profileCarouselImage");
    const dots = document.getElementById("profileDots");
    const prev = document.getElementById("profilePrev");
    const next = document.getElementById("profileNext");
    const progressBar = document.getElementById("profileProgressBar");

    if (!carousel || !image || !dots) return;

    const FALLBACK_IMAGE = "profile/profile1.jpg";
    const INTERVAL = 3000;

    let profileAssets = [];
    let currentIndex = 0;
    let timer = null;
    let resumeTimer = null;
    let requestToken = 0;

    function collectAssets(value, output) {
        if (Array.isArray(value)) {
            value.forEach(function (item) {
                collectAssets(item, output);
            });
            return;
        }

        if (!value || typeof value !== "object") return;

        const url = value.secure_url || value.url || value.src;

        if (typeof url === "string" && /^https?:\/\//i.test(url)) {
            output.push(value);
        }

        Object.values(value).forEach(function (item) {
            if (item && typeof item === "object") {
                collectAssets(item, output);
            }
        });
    }

    function getProfileNumber(asset) {
        const source = [
            asset.public_id,
            asset.display_name,
            asset.name,
            asset.path
        ].filter(Boolean).join(" ");

        const match = source.match(/profile\s*[-_ ]?(\d+)/i);

        return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
    }

    function getAssetUrl(asset) {
        return asset.secure_url || asset.url || asset.src || "";
    }

    function isImage(asset) {
        const type = String(
            asset.resource_type || asset.type || ""
        ).toLowerCase();

        const format = String(asset.format || "").toLowerCase();
        const url = getAssetUrl(asset);

        if (type === "video" || type === "raw") return false;

        return type === "image" ||
            /^(jpg|jpeg|png|webp|avif|gif)$/i.test(format) ||
            /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i.test(url);
    }

    function renderDots() {
        dots.replaceChildren();

        profileAssets.forEach(function (asset, index) {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "profile-dot" +
                (index === currentIndex ? " active" : "");

            dot.setAttribute(
                "aria-label",
                "Show profile photo " + (index + 1)
            );

            dot.setAttribute(
                "aria-current",
                index === currentIndex ? "true" : "false"
            );

            dot.addEventListener("click", function (event) {
                event.stopPropagation();
                showProfile(index, true);
            });

            dots.appendChild(dot);
        });
    }

    function updateDots() {
        dots.querySelectorAll(".profile-dot").forEach(function (dot, index) {
            const active = index === currentIndex;

            dot.classList.toggle("active", active);

            dot.setAttribute(
                "aria-current",
                active ? "true" : "false"
            );
        });
    }

    function restartProgress() {
        if (!progressBar) return;

        progressBar.style.animation = "none";
        void progressBar.offsetWidth;
        progressBar.style.animation = "";
    }

    function startAutoPlay() {
        stopAutoPlay();

        if (profileAssets.length < 2) {
            carousel.classList.remove("auto-playing");
            return;
        }

        carousel.classList.add("auto-playing");
        restartProgress();

        timer = window.setInterval(function () {
            showProfile(
                (currentIndex + 1) % profileAssets.length,
                false
            );
        }, INTERVAL);
    }

    function stopAutoPlay() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }

        carousel.classList.remove("auto-playing");
    }

    function restartAfterInteraction() {
        stopAutoPlay();

        if (resumeTimer) {
            window.clearTimeout(resumeTimer);
        }

        resumeTimer = window.setTimeout(function () {
            startAutoPlay();
        }, 4200);
    }

    function showProfile(index, userInitiated) {
        if (!profileAssets.length) return;

        currentIndex =
            (index + profileAssets.length) % profileAssets.length;

        const asset = profileAssets[currentIndex];
        const url = getAssetUrl(asset);

        if (!url) return;

        const token = ++requestToken;

        carousel.classList.add("is-changing");

        const preload = new Image();
        preload.decoding = "async";

        preload.onload = function () {
            if (token !== requestToken) return;

            window.setTimeout(function () {
                image.src = url;

                image.alt =
                    "Portrait of Saurabh Patel — profile photo " +
                    (currentIndex + 1);

                carousel.classList.remove("is-changing");

                updateDots();
                restartProgress();
            }, 420);
        };

        preload.onerror = function () {
            if (token !== requestToken) return;

            carousel.classList.remove("is-changing");
        };

        preload.src = url;

        if (userInitiated) {
            restartAfterInteraction();
        }
    }

    function setup(assets) {
        profileAssets = assets
            .filter(isImage)
            .filter(function (asset, index, list) {
                const url = getAssetUrl(asset);

                return url && list.findIndex(function (other) {
                    return getAssetUrl(other) === url;
                }) === index;
            })
            .sort(function (a, b) {
                const numberDiff =
                    getProfileNumber(a) - getProfileNumber(b);

                if (numberDiff !== 0) return numberDiff;

                const aName = String(a.public_id || a.name || "");
                const bName = String(b.public_id || b.name || "");

                return aName.localeCompare(bName);
            });

        if (!profileAssets.length) {
            carousel.classList.add("single-photo");
            image.src = FALLBACK_IMAGE;
            return;
        }

        currentIndex = 0;
        image.src = getAssetUrl(profileAssets[0]);
        image.alt = "Portrait of Saurabh Patel — profile photo 1";

        carousel.classList.toggle(
            "single-photo",
            profileAssets.length < 2
        );

        if (profileAssets.length > 1) {
            renderDots();
            startAutoPlay();
        }
    }

    image.addEventListener("click", function () {
        if (profileAssets.length > 1) {
            showProfile(
                (currentIndex + 1) % profileAssets.length,
                true
            );
        }
    });

    if (prev) {
        prev.addEventListener("click", function (event) {
            event.stopPropagation();

            if (profileAssets.length > 1) {
                showProfile(currentIndex - 1, true);
            }
        });
    }

    if (next) {
        next.addEventListener("click", function (event) {
            event.stopPropagation();

            if (profileAssets.length > 1) {
                showProfile(currentIndex + 1, true);
            }
        });
    }

    carousel.addEventListener("mouseenter", function () {
        carousel.classList.add("is-hovering");
    });

    carousel.addEventListener("mouseleave", function () {
        carousel.classList.remove("is-hovering");
    });

    carousel.addEventListener("focusin", function () {
        carousel.classList.add("is-focused");
    });

    carousel.addEventListener("focusout", function (event) {
        if (!carousel.contains(event.relatedTarget)) {
            carousel.classList.remove("is-focused");
        }
    });

    carousel.addEventListener("keydown", function (event) {
        if (profileAssets.length < 2) return;

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            showProfile(currentIndex - 1, true);
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            showProfile(currentIndex + 1, true);
        }
    });

    document.addEventListener("visibilitychange", function () {
        if (profileAssets.length < 2) return;

        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });

    // Swipe support for mobile devices.
    let touchStartX = 0;
    let touchStartY = 0;

    carousel.addEventListener("touchstart", function (event) {
        const touch = event.changedTouches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    carousel.addEventListener("touchend", function (event) {
        if (profileAssets.length < 2) return;

        const touch = event.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;

        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) {
            return;
        }

        if (dx < 0) {
            showProfile(currentIndex + 1, true);
        } else {
            showProfile(currentIndex - 1, true);
        }
    }, { passive: true });

    (async function loadProfileMedia() {
        carousel.classList.add("is-loading");

        try {
            const data = await window.getPortfolioMedia();
            const allAssets = [];

            collectAssets(data, allAssets);

            const profileOnly = allAssets.filter(function (asset) {
                const searchable = [
                    asset.asset_folder,
                    asset.folder,
                    asset.public_id,
                    asset.display_name,
                    asset.name,
                    asset.path
                ].filter(Boolean).join(" ").toLowerCase();

                return searchable.includes("portfolio/profile");
            });

            setup(profileOnly);
        } catch (error) {
            console.warn(
                "Profile carousel could not load Cloudinary media:",
                error
            );

            carousel.classList.add("single-photo");
            image.src = FALLBACK_IMAGE;
        } finally {
            carousel.classList.remove("is-loading");
        }
    })();
})();


/* ==================== CLOUDINARY CARD GALLERIES ==================== */

(async function loadExistingCardMedia() {
    const galleries = document.querySelectorAll(
        ".card-gallery[data-cloudinary-folder]"
    );

    if (!galleries.length) return;

    function collectAssets(value, output) {
        if (Array.isArray(value)) {
            value.forEach(function (item) {
                collectAssets(item, output);
            });
            return;
        }

        if (!value || typeof value !== "object") return;

        const url = value.secure_url || value.url || value.src;

        if (typeof url === "string" && /^https?:\/\//i.test(url)) {
            output.push(value);
        }

        Object.values(value).forEach(function (item) {
            if (item && typeof item === "object") {
                collectAssets(item, output);
            }
        });
    }

    function removeGallery(gallery) {
        const group = gallery.closest(".sih-year-group");
        const card = gallery.closest(".project-card");
        const media = gallery.closest(".project-media");

        if (group) {
            group.remove();
            return;
        }

        if (media && card) {
            media.remove();
            card.classList.add("no-media");
            return;
        }

        gallery.remove();
    }

    try {
        const data = await window.getPortfolioMedia();
        const allAssets = [];

        collectAssets(data, allAssets);

        galleries.forEach(function (gallery, galleryIndex) {
            const wanted =
                gallery.dataset.cloudinaryFolder.toLowerCase();

            const label =
                gallery.getAttribute("aria-label") || wanted;

            const matching = allAssets.filter(function (asset) {
                const searchable = [
                    asset.asset_folder,
                    asset.folder,
                    asset.public_id,
                    asset.display_name,
                    asset.name,
                    asset.path
                ].filter(Boolean).join(" ").toLowerCase();

                return searchable.includes(wanted);
            });

            if (!matching.length) {
                removeGallery(gallery);
                return;
            }

            gallery.replaceChildren();

            const photos = [];
            const videos = [];
            const ppts = [];

            matching.forEach(function (asset) {
                const url =
                    asset.secure_url || asset.url || asset.src || "";

                const type = (
                    asset.resource_type || asset.type || ""
                ).toLowerCase();

                const format = (asset.format || "").toLowerCase();

                const isVideo =
                    type === "video" ||
                    /\.(mp4|webm|mov)(\?|$)/i.test(url);

                const isPpt =
                    type === "raw" ||
                    /\.(ppt|pptx|pdf|doc|docx)(\?|$)/i.test(url) ||
                    ["pdf", "pptx", "ppt"].includes(format);

                if (isVideo) {
                    videos.push(asset);
                } else if (isPpt) {
                    ppts.push(asset);
                } else {
                    photos.push(asset);
                }
            });

            function renderCategory(categoryAssets, categoryName) {
                if (!categoryAssets.length) return;

                const heading = document.createElement("div");
                heading.className = "media-type-heading";
                heading.textContent = categoryName;

                gallery.appendChild(heading);

                let MAX_VISIBLE = 4;

                if (categoryName === "Video") {
                    MAX_VISIBLE = 2;
                }

                const galleryId = "gallery-" + galleryIndex;

                categoryAssets.forEach(function (asset, index) {
                    const url =
                        asset.secure_url || asset.url || asset.src;

                    const isVideo = categoryName === "Video";
                    const isPpt = categoryName === "PPT";
                    const isPdf = /\.pdf(\?|$)/i.test(url);

                    const link = document.createElement("a");
                    link.href = url;

                    if (isPpt && !isPdf) {
                        link.className = galleryId;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                    } else {
                        link.className = "glightbox " + galleryId;
                        link.setAttribute("data-gallery", galleryId);
                    }

                    link.setAttribute(
                        "aria-label",
                        "Open " + categoryName + ": " + label
                    );

                    if (isVideo) {
                        link.setAttribute("data-type", "video");
                    }

                    if (index >= MAX_VISIBLE) {
                        link.style.display = "none";
                        gallery.appendChild(link);
                        return;
                    }

                    const wrapper = document.createElement("div");
                    wrapper.className = "media-wrapper";

                    const img = document.createElement("img");
                    img.loading = "lazy";
                    img.decoding = "async";

                    if (isVideo) {
                        let thumbnail = url.replace(
                            /\.(mp4|webm|mov)(\?.*)?$/i,
                            ".jpg"
                        );

                        if (
                            thumbnail === url &&
                            asset.resource_type === "video"
                        ) {
                            thumbnail = url
                                .replace("/upload/", "/upload/so_0/")
                                .replace(/\.[^/.]+$/, ".jpg");
                        }

                        img.src = thumbnail;
                        img.alt = "Video thumbnail: " + label;

                        img.onerror = function () {
                            img.style.display = "none";
                        };

                        const playIcon = document.createElement("div");
                        playIcon.className = "video-indicator";
                        playIcon.textContent = "▶";

                        wrapper.appendChild(img);
                        wrapper.appendChild(playIcon);
                    } else if (isPpt) {
                        let thumbSrc = url;

                        if (isPdf) {
                            thumbSrc = url.replace(/\.pdf/i, ".jpg");
                        } else {
                            thumbSrc =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50' y='55' font-size='20' font-family='sans-serif' font-weight='bold' text-anchor='middle' fill='%2364748b'%3EDOC%3C/text%3E%3C/svg%3E";
                        }

                        img.src = thumbSrc;
                        img.alt = "Document: " + label;

                        wrapper.appendChild(img);
                    } else {
                        img.src = url;
                        img.alt = label;

                        wrapper.appendChild(img);
                    }

                    if (
                        index === MAX_VISIBLE - 1 &&
                        categoryAssets.length > MAX_VISIBLE
                    ) {
                        const overlay = document.createElement("div");
                        overlay.className = "more-overlay";

                        const hiddenCount =
                            categoryAssets.length - (MAX_VISIBLE - 1);

                        overlay.textContent = "+" + hiddenCount;
                        wrapper.appendChild(overlay);
                    }

                    link.appendChild(wrapper);
                    gallery.appendChild(link);
                });
            }

            renderCategory(photos, "Photo");
            renderCategory(videos, "Video");
            renderCategory(ppts, "PPT");
        });

        if (typeof GLightbox === "function") {
            GLightbox({
                selector: ".glightbox",
                touchNavigation: true,
                loop: true,
                autoplayVideos: false
            });
        }
    } catch (error) {
        galleries.forEach(removeGallery);
        console.error("Gallery error:", error);
    }
})();


/* ==================== ENVIRONMENT / THEME SWITCHER ==================== */

(function () {
    const switcher = document.getElementById("environmentSwitcher");
    const toggle = document.getElementById("environmentToggle");
    const label = document.getElementById("environmentLabel");

    if (!switcher || !toggle) return;

    const optionsContainer =
        switcher.querySelector(".environment-options");

    if (!optionsContainer) return;

    const themes = [
        { id: "day", name: "Day", icon: "☀️" },
        { id: "night", name: "Night", icon: "🌙" },
        { id: "netflix", name: "Netflix", icon: "▶" },
        { id: "rose", name: "Rose", icon: "🌸" },
        { id: "solarflare", name: "Solar Flare", icon: "🔆" },
        { id: "visionos", name: "VisionOS / Spatial Glass", icon: "◈" },
        { id: "missioncontrol", name: "Mission Control", icon: "⌁" },
        { id: "terminal", name: "Retro Terminal", icon: ">_" },
        { id: "swiss", name: "Swiss Editorial", icon: "▤" },
        { id: "blueprint", name: "Blueprint Engineering", icon: "⌗" },
        { id: "obsidian", name: "Obsidian / Luxury", icon: "◆" },
        { id: "isometric", name: "Isometric World", icon: "◇" },
        { id: "neural", name: "Neural Network", icon: "⌘" },
        { id: "zen", name: "Zen / Japanese Minimal", icon: "◯" },
        { id: "y2kchrome", name: "Y2K Chrome", icon: "✦" }
    ];
    const themesById = new Map(themes.map(function (theme) {
        return [theme.id, theme];
    }));

    themes.forEach(function (theme) {
        const option = document.createElement("button");
        const icon = document.createElement("span");
        const name = document.createElement("span");

        option.type = "button";
        option.className = "environment-option";
        option.dataset.themeChoice = theme.id;
        option.title = theme.name;
        option.setAttribute("aria-label", "Use " + theme.name + " theme");
        icon.className = "env-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = theme.icon;
        name.textContent = theme.name;
        option.append(icon, name);
        optionsContainer.appendChild(option);
    });

    const options =
        switcher.querySelectorAll(".environment-option");

    function applyTheme(theme, save = true) {
        const selectedTheme = themesById.get(theme) || themesById.get("missioncontrol");
        theme = selectedTheme.id;

        document.documentElement.setAttribute("data-theme", theme);

        toggle.textContent = selectedTheme.icon;
        toggle.setAttribute(
            "aria-label",
            "Current environment: " + selectedTheme.name
        );

        if (label) {
            label.textContent = selectedTheme.name;
        }

        options.forEach(function (button) {
            const active = button.dataset.themeChoice === theme;

            button.classList.toggle("active", active);
            button.setAttribute(
                "aria-pressed",
                active ? "true" : "false"
            );
        });

        if (save) {
            try {
                localStorage.setItem("saurabh-portfolio-theme", theme);
            } catch (error) {
                // Theme still works if browser storage is unavailable.
            }
        }
    }

    let saved = "missioncontrol";

    try {
        saved = localStorage.getItem("saurabh-portfolio-theme") || "missioncontrol";
    } catch (error) {
        // Use the default theme.
    }

    if (!themesById.has(saved)) {
        saved = "missioncontrol";
        try {
            localStorage.setItem("saurabh-portfolio-theme", saved);
        } catch (error) {
            // Keep the default theme if browser storage is unavailable.
        }
    }

    applyTheme(saved, false);

    const terminalRoutes = {
        home: "index.html",
        about: "about.html",
        projects: "projects.html",
        skills: "skills.html",
        education: "education.html",
        experience: "experience.html",
        leadership: "leadership.html",
        achievements: "achievements.html",
        events: "events.html",
        cv: "view-cv.html",
        contact: "contact.html"
    };

    let terminalDock = null;
    let terminalOutput = null;

    function ensureTerminalDock() {
        if (terminalDock || !document.querySelector("main")) return;

        terminalDock = document.createElement("section");
        terminalDock.className = "terminal-command-dock";
        terminalDock.setAttribute("aria-label", "Terminal navigation");
        terminalDock.innerHTML =
            '<form class="terminal-command-form">' +
            '<label for="terminalCommandInput">PORTFOLIO TERMINAL</label>' +
            '<div class="terminal-command-line"><span aria-hidden="true">&gt;</span>' +
            '<input id="terminalCommandInput" name="command" autocomplete="off" ' +
            'placeholder="type help, projects, skills, or contact" ' +
            'aria-label="Portfolio command">' +
            '<button type="submit">Run</button></div>' +
            '<p class="terminal-command-output" aria-live="polite">Type help to list navigation commands.</p>' +
            '</form>';

        document.querySelector("main").prepend(terminalDock);
        terminalOutput = terminalDock.querySelector(".terminal-command-output");
        terminalDock.querySelector("form").addEventListener("submit", function (event) {
            event.preventDefault();
            const input = terminalDock.querySelector("input");
            const command = input.value.trim().toLowerCase().replace(/\.html$/, "");

            if (command === "help") {
                terminalOutput.textContent =
                    "Commands: " + Object.keys(terminalRoutes).join(", ");
                return;
            }

            const route = terminalRoutes[command];
            if (!route) {
                terminalOutput.textContent =
                    "Unknown command. Type help to see available pages.";
                return;
            }

            window.location.href = route;
        });
    }

    function updateTerminalDock() {
        if (document.documentElement.dataset.theme === "terminal") {
            ensureTerminalDock();
        }
    }

    updateTerminalDock();
    new MutationObserver(updateTerminalDock).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });

    toggle.addEventListener("click", function (event) {
        event.stopPropagation();

        const open = switcher.classList.toggle("open");

        toggle.setAttribute("aria-expanded", String(open));
    });

    options.forEach(function (button) {
        button.addEventListener("click", function () {
            applyTheme(button.dataset.themeChoice);

            switcher.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", function (event) {
        if (!switcher.contains(event.target)) {
            switcher.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && switcher.classList.contains("open")) {
            switcher.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.focus();
        }
    });
})();


/* ==================== CARD DEPTH INTERACTION ==================== */

(function initCardDepth() {
    const supportsTilt = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!supportsTilt || reduceMotion) return;

    const cards = document.querySelectorAll(
        ".dashboard-card, .project-card, .additional-card, .event-card, " +
        ".timeline-card, .achievement-card, .experience-card, .leadership-card"
    );
    const depthThemes = new Set(["visionos", "y2kchrome"]);

    cards.forEach(function (card) {
        card.addEventListener("pointermove", function (event) {
            if (!depthThemes.has(document.documentElement.dataset.theme)) {
                card.style.removeProperty("--pointer-rx");
                card.style.removeProperty("--pointer-ry");
                return;
            }

            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;

            card.style.setProperty("--pointer-rx", ((0.5 - y) * 5) + "deg");
            card.style.setProperty("--pointer-ry", ((x - 0.5) * 5) + "deg");
        });

        card.addEventListener("pointerleave", function () {
            card.style.removeProperty("--pointer-rx");
            card.style.removeProperty("--pointer-ry");
        });
    });

    new MutationObserver(function () {
        cards.forEach(function (card) {
            card.style.removeProperty("--pointer-rx");
            card.style.removeProperty("--pointer-ry");
        });
    }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });
})();


/* ==================== LIVE ELECTRONICS BACKGROUND ==================== */

(function () {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const mobileViewport = window.matchMedia(
        "(max-width: 768px), (pointer: coarse)"
    );

    // No pointer-driven tilt on the profile carousel.
    const carousel = document.getElementById("profileCarousel");

    if (carousel) {
        carousel.classList.add("autonomous-motion");
    }

    const canvas = document.createElement("canvas");

    canvas.id = "electronics-live-bg";
    canvas.setAttribute("aria-hidden", "true");

    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        canvas.remove();
        return;
    }

    let w = 0;
    let h = 0;
    let dpr = 1;
    let last = 0;
    let animId = null;
    let lastWidth = window.innerWidth;
    let resizeTimer = null;

    let nodes = [];
    let traces = [];
    let pulses = [];
    let chips = [];
    const artDirectedThemes = new Set([
        "visionos",
        "missioncontrol",
        "terminal",
        "swiss",
        "blueprint",
        "obsidian",
        "isometric",
        "neural",
        "zen",
        "y2kchrome"
    ]);
    canvas.hidden = artDirectedThemes.has(
        document.documentElement.dataset.theme
    );

    function shouldAnimateBackdrop() {
        return !reduceMotion &&
            !mobileViewport.matches &&
            !artDirectedThemes.has(document.documentElement.dataset.theme);
    }

    function cssColor(name, fallback) {
        const value = getComputedStyle(
            document.documentElement
        ).getPropertyValue(name).trim();

        return value || fallback;
    }

    function cssNumber(name, fallback) {
        const value = parseFloat(cssColor(name, ""));
        return Number.isFinite(value) ? value : fallback;
    }

    function hexToRgb(value) {
        if (!value || value[0] !== "#") return null;

        let hex = value.slice(1);

        if (hex.length === 3) {
            hex = hex.split("").map(function (character) {
                return character + character;
            }).join("");
        }

        const number = parseInt(hex, 16);

        if (Number.isNaN(number)) return null;

        return {
            r: (number >> 16) & 255,
            g: (number >> 8) & 255,
            b: number & 255
        };
    }

    function rgba(color, alpha) {
        const rgb = hexToRgb(color);

        if (rgb) {
            return "rgba(" +
                rgb.r + "," +
                rgb.g + "," +
                rgb.b + "," +
                alpha + ")";
        }

        return "color-mix(in srgb, " +
            color + " " +
            Math.round(alpha * 100) +
            "%, transparent)";
    }

    function rebuild() {
        dpr = Math.min(
            window.devicePixelRatio || 1,
            mobileViewport.matches ? 1 : 2
        );

        w = window.innerWidth;
        h = window.innerHeight;

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);

        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(
            60,
            Math.max(24, Math.floor(w * h / 32000))
        );

        nodes = Array.from({ length: count }, function () {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.7 + 0.8,
                phase: Math.random() * Math.PI * 2,
                speed: 0.25 + Math.random() * 0.65
            };
        });

        const circuitGrid = 16;
        const snapToGrid = function (value) {
            return Math.round(value / circuitGrid) * circuitGrid;
        };
        chips = Array.from({
            length: Math.min(10, Math.max(5, Math.floor(w / 180)))
        }, function () {
            return {
                x: snapToGrid(36 + Math.random() * Math.max(1, w - 72)),
                y: snapToGrid(36 + Math.random() * Math.max(1, h - 72)),
                ww: 48 + Math.random() * 32,
                hh: 30 + Math.random() * 18,
                label: ["MCU", "SENS", "RF", "PWR", "I/O"][
                    Math.floor(Math.random() * 5)
                ]
            };
        });

        traces = [];

        for (
            let i = 0;
            i < Math.min(32, Math.max(16, Math.floor(w / 48)));
            i++
        ) {
            const chip = chips[i % chips.length];
            const side = Math.random() > 0.5 ? 1 : -1;
            const startX = snapToGrid(chip.x + side * chip.ww / 2);
            const startY = snapToGrid(
                chip.y + (Math.random() - 0.5) * chip.hh * 0.65
            );
            const targetX = snapToGrid(Math.random() * w);
            const targetY = snapToGrid(Math.random() * h);
            const horizontalFirst = Math.random() > 0.5;
            const bendX = snapToGrid(
                Math.max(0, Math.min(w, startX + side * (48 + Math.random() * 160)))
            );
            const bendY = snapToGrid(
                Math.max(0, Math.min(h, startY + (Math.random() > 0.5 ? 1 : -1) * (48 + Math.random() * 128)))
            );

            traces.push(horizontalFirst
                ? [[startX, startY], [bendX, startY], [bendX, targetY], [targetX, targetY]]
                : [[startX, startY], [startX, bendY], [targetX, bendY], [targetX, targetY]]);
        }

        pulses = [];

        if (!reduceMotion) {
            for (let i = 0; i < 16; i++) {
                pulses.push({
                    trace: Math.floor(
                        Math.random() * Math.max(1, traces.length)
                    ),
                    t: Math.random(),
                    speed: 0.00008 + Math.random() * 0.00018
                });
            }
        }
    }

    function pointOnTrace(points, t) {
        let total = 0;
        const lengths = [];

        for (let i = 1; i < points.length; i++) {
            const dx = points[i][0] - points[i - 1][0];
            const dy = points[i][1] - points[i - 1][1];
            const length = Math.hypot(dx, dy);

            lengths.push(length);
            total += length;
        }

        let distance = t * total;

        for (let i = 1; i < points.length; i++) {
            const length = lengths[i - 1];

            if (distance <= length) {
                const q = length ? distance / length : 0;

                return [
                    points[i - 1][0] +
                        (points[i][0] - points[i - 1][0]) * q,
                    points[i - 1][1] +
                        (points[i][1] - points[i - 1][1]) * q
                ];
            }

            distance -= length;
        }

        return points[points.length - 1];
    }

    function draw(timestamp) {
        const dt = Math.min(40, timestamp - last || 16);
        last = timestamp;

        ctx.clearRect(0, 0, w, h);

        const primary = cssColor("--circuit-primary", "#1d4ed8");
        const secondary = cssColor("--circuit-secondary", "#2563eb");
        const gridStep = cssNumber("--circuit-grid-step", 32);
        const gridAlpha = cssNumber("--circuit-grid-alpha", 0.075);
        const traceAlpha = cssNumber("--circuit-trace-alpha", 0.27);
        const chipAlpha = cssNumber("--circuit-chip-alpha", 0.28);

        // Fine copper grid with stronger board-registration lines.
        ctx.lineWidth = 1;
        const grid = gridStep;

        for (let x = 0; x < w; x += grid) {
            const majorLine = x % (grid * 4) === 0;
            ctx.strokeStyle = rgba(secondary, majorLine ? gridAlpha * 1.8 : gridAlpha * 0.55);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        for (let y = 0; y < h; y += grid) {
            const majorLine = y % (grid * 4) === 0;
            ctx.strokeStyle = rgba(secondary, majorLine ? gridAlpha * 1.8 : gridAlpha * 0.55);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Circuit traces and connection nodes.
        ctx.lineWidth = 1.4;

        traces.forEach(function (points) {
            ctx.strokeStyle = rgba(primary, traceAlpha);

            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);

            points.slice(1).forEach(function (point) {
                ctx.lineTo(point[0], point[1]);
            });

            ctx.stroke();

            const first = points[0];
            const lastPoint = points[points.length - 1];

            [first, lastPoint].forEach(function (point) {
                ctx.strokeStyle = rgba(primary, traceAlpha * 1.55);
                ctx.lineWidth = 1.2;

                ctx.beginPath();
                ctx.arc(point[0], point[1], 3.3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = rgba(primary, traceAlpha * 2);
                ctx.beginPath();
                ctx.arc(point[0], point[1], 1.15, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // Integrated circuit silhouettes.
        chips.forEach(function (chip) {
            ctx.save();

            ctx.translate(chip.x, chip.y);

            ctx.strokeStyle = rgba(primary, chipAlpha);
            ctx.fillStyle = rgba(primary, chipAlpha * 0.2);
            ctx.lineWidth = 1.2;

            ctx.beginPath();
            ctx.roundRect(
                -chip.ww / 2,
                -chip.hh / 2,
                chip.ww,
                chip.hh,
                4
            );

            ctx.fill();
            ctx.stroke();

            const pinCount = Math.max(4, Math.floor(chip.hh / 6));

            for (let j = 0; j < pinCount; j++) {
                const py = -chip.hh / 2 +
                    4 +
                    j * (chip.hh - 8) / (pinCount - 1 || 1);
                const px = -chip.ww / 2 +
                    4 +
                    j * (chip.ww - 8) / (pinCount - 1 || 1);

                ctx.strokeStyle = rgba(secondary, chipAlpha * 1.15);

                ctx.beginPath();
                ctx.moveTo(-chip.ww / 2 - 7, py);
                ctx.lineTo(-chip.ww / 2, py);
                ctx.moveTo(chip.ww / 2, py);
                ctx.lineTo(chip.ww / 2 + 7, py);
                ctx.moveTo(px, -chip.hh / 2 - 6);
                ctx.lineTo(px, -chip.hh / 2);
                ctx.moveTo(px, chip.hh / 2);
                ctx.lineTo(px, chip.hh / 2 + 6);
                ctx.stroke();
            }

            ctx.fillStyle = rgba(primary, chipAlpha * 2.2);
            ctx.font = "600 8px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(chip.label, 0, 1);

            ctx.restore();
        });

        // Floating electronic signal nodes.
        nodes.forEach(function (node) {
            const pulse = 0.5 + 0.5 * Math.sin(
                timestamp * 0.001 * node.speed + node.phase
            );

            ctx.fillStyle = rgba(secondary, gridAlpha * 1.5 + 0.08 * pulse);

            ctx.beginPath();
            ctx.arc(
                node.x,
                node.y,
                node.r + pulse * 0.8,
                0,
                Math.PI * 2
            );

            ctx.fill();
        });

        // Moving data packets.
        if (!reduceMotion) {
            pulses.forEach(function (pulse) {
                const trace = traces[pulse.trace];

                if (!trace) return;

                pulse.t += pulse.speed * dt;

                if (pulse.t > 1) pulse.t = 0;

                const point = pointOnTrace(trace, pulse.t);

                ctx.fillStyle = rgba(secondary, Math.min(1, traceAlpha * 2.6));
                ctx.shadowBlur = 10;
                ctx.shadowColor = secondary;

                ctx.beginPath();
                ctx.arc(point[0], point[1], 2.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
            });
        }

        if (shouldAnimateBackdrop()) {
            animId = requestAnimationFrame(draw);
        } else {
            animId = null;
        }
    }

    function startAnimation() {
        if (shouldAnimateBackdrop()) {
            if (!animId) {
                animId = requestAnimationFrame(draw);
            }
        } else {
            stopAnimation();
            draw(0);
        }
    }

    function stopAnimation() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    function handleResize() {
        const currentWidth = window.innerWidth;
        // On Android / mobile browsers, scrolling hides/shows the top browser URL address bar,
        // which triggers a window 'resize' event on every scroll gesture.
        // We only rebuild when innerWidth actually changes (e.g. orientation change or window resize).
        if (Math.abs(currentWidth - lastWidth) > 16) {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(function () {
                lastWidth = window.innerWidth;
                rebuild();
                startAnimation();
            }, 200);
        }
    }

    window.addEventListener("resize", handleResize, {
        passive: true
    });

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    lastWidth = window.innerWidth;
    rebuild();
    startAnimation();

    let previousTheme = document.documentElement.getAttribute("data-theme");
    const observer = new MutationObserver(function () {
        const theme = document.documentElement.getAttribute("data-theme");
        if (theme === previousTheme) return;
        previousTheme = theme;

        if (artDirectedThemes.has(theme)) {
            stopAnimation();
            canvas.hidden = true;
            ctx.clearRect(0, 0, w, h);
            return;
        }

        canvas.hidden = false;
        canvas.classList.remove("theme-refresh");
        void canvas.offsetWidth;
        canvas.classList.add("theme-refresh");
        startAnimation();
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme", "style"]
    });
})();


/* =========================================================
   EMAILJS CONTACT FORM
   Service: service_gqv6v6v
   Template: template_ocq49cj
   ========================================================= */

(function initEmailJSContactForm() {
    const EMAILJS_PUBLIC_KEY = "U-e_d7CYGOP3vlrzC";
    const EMAILJS_SERVICE_ID = "service_gqv6v6v";
    const EMAILJS_TEMPLATE_ID = "template_ocq49cj";

    function initializeContactForm() {
        const form = document.getElementById("contact-form");

        // The main script is shared across the portfolio's pages.
        if (!form || form.dataset.emailjsInitialized === "true") {
            return;
        }

        const status = document.getElementById("contact-status");
        const submitButton = document.getElementById("contact-submit");

        function showStatus(message, type) {
            if (!status) return;

            status.textContent = message;
            status.className = "contact-status" + (type ? " " + type : "");
        }

        if (!window.emailjs) {
            showStatus(
                "The email service could not load. Please refresh the page and try again.",
                "error"
            );
            return;
        }

        window.emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY
        });

        form.dataset.emailjsInitialized = "true";

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!form.reportValidity()) {
                return;
            }

            if (submitButton && submitButton.disabled) {
                return;
            }

            showStatus("Sending your message...", "");

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }

            try {
                await window.emailjs.sendForm(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_ID,
                    form
                );

                showStatus(
                    "Message sent successfully! Thank you for reaching out.",
                    "success"
                );

                form.reset();
            } catch (error) {
                console.error("EmailJS submission failed:", error);

                showStatus(
                    "Your message could not be sent. Please try again or email me directly.",
                    "error"
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Send Message →";
                }
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeContactForm
        );
    } else {
        initializeContactForm();
    }
})();

// Ensure local PDF documents (e.g. Internship Certificate, CV) always fetch the latest file from folder
(function () {
    function setupFreshPdfLinks() {
        const pdfLinks = document.querySelectorAll('a[href*=".pdf"]');
        pdfLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                if (window.location.protocol.startsWith("http")) {
                    const originalHref = link.getAttribute("href");
                    if (originalHref && !originalHref.startsWith("http") && !originalHref.startsWith("//")) {
                        const cleanPath = originalHref.split("?")[0];
                        link.href = cleanPath + "?v=" + Date.now();
                    }
                }
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupFreshPdfLinks);
    } else {
        setupFreshPdfLinks();
    }
})();
