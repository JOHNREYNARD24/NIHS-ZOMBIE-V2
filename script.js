/* =========================================================
   ZOMBIE²
   NEW ISRAEL HIGH SCHOOL ZOMBIE APOCALYPSE
   GAME LOGIC
========================================================= */

"use strict";

/* =========================================================
   BASIC HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const screens = document.querySelectorAll(".screen");

function showScreen(id) {
    screens.forEach(screen => {
        screen.classList.add("hidden");
        screen.classList.remove("active");
    });

    const target = $(id);

    if (!target) return;

    requestAnimationFrame(() => {
        target.classList.remove("hidden");
        target.classList.add("active");
    });
}

function hideElement(element) {
    if (element) element.classList.add("hidden");
}

function showElement(element) {
    if (element) element.classList.remove("hidden");
}


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    screen: "intro-screen",

    role: null,
    grade: null,
    gender: null,
    character: null,
    playType: null,

    room: 1,
    level: 1,

    health: 100,
    maxHealth: 100,

    coins: Number(localStorage.getItem("z2_coins") || 0),

    kills: 0,

    paused: false,
    running: false,

    gameTime: 0,

    lastTime: 0,

    keys: {},

    enemies: [],

    particles: [],

    projectiles: [],

    decorations: [],

    currentWeapon: "chalk",

    lastAttack: 0,

    lastDamageTime: 0,

    lastYawaTime: 0,

    roomTransition: false,

    roomTimer: 0,

    zombieSpawnTimer: 0,

    objectiveKills: 0,

    player: {
        x: 500,
        y: 350,
        radius: 22,
        speed: 190,
        direction: "down",
        attacking: false,
        attackTimer: 0,
        invulnerable: 0
    }
};


/* =========================================================
   CHARACTER DATABASE
========================================================= */

const characters = {

    student: {

        7: {

            male: [
                ["Steve", "boy", "#3b82f6", "#172554"],
                ["Cyber C", "boy", "#06b6d4", "#164e63"]
            ],

            female: [
                ["J", "girl", "#ec4899", "#831843"],
                ["Inday J", "girl", "#f59e0b", "#78350f"],
                ["A", "girl", "#22c55e", "#14532d"]
            ]
        },

        8: {

            male: [
                ["Nygien", "boy", "#ef4444", "#7f1d1d"],
                ["Boss H", "boy", "#8b5cf6", "#4c1d95"],
                ["Dodong O", "boy", "#14b8a6", "#134e4a"]
            ],

            female: [
                ["Xyhh", "girl", "#a855f7", "#581c87"],
                ["Ash", "girl", "#f97316", "#7c2d12"],
                ["Mitch", "girl", "#06b6d4", "#164e63"],
                ["Hyris C", "girl", "#eab308", "#713f12"],
                ["D", "girl", "#22c55e", "#14532d"],
                ["J", "girl", "#ec4899", "#831843"]
            ]
        },

        9: {

            male: [
                ["Boss J", "boy", "#2563eb", "#1e3a8a"],
                ["Boss R", "boy", "#dc2626", "#7f1d1d"],
                ["Dodong", "boy", "#16a34a", "#14532d"]
            ],

            female: [
                ["Inday Y", "girl", "#f43f5e", "#881337"],
                ["Miss H", "girl", "#8b5cf6", "#4c1d95"],
                ["V", "girl", "#0ea5e9", "#0c4a6e"]
            ]
        },

        10: {

            male: [
                ["John Reynard", "boy", "#2563eb", "#1e3a8a"],
                ["Kenth", "boy", "#f97316", "#7c2d12"],
                ["Clark", "boy", "#14b8a6", "#134e4a"],
                ["Carl", "boy", "#8b5cf6", "#4c1d95"],
                ["Archel", "boy", "#22c55e", "#14532d"],
                ["Rhey", "boy", "#eab308", "#713f12"],
                ["Johnson", "boy", "#ef4444", "#7f1d1d"],
                ["Cristian", "boy", "#06b6d4", "#164e63"],
                ["Rhamces", "boy", "#ec4899", "#831843"],
                ["Jester", "boy", "#6366f1", "#312e81"],
                ["Julius", "boy", "#84cc16", "#365314"],
                ["Archgel", "boy", "#f43f5e", "#881337"],
                ["Rencey", "boy", "#0ea5e9", "#0c4a6e"],
                ["Elm", "boy", "#a855f7", "#581c87"],
                ["Shr", "boy", "#f59e0b", "#78350f"],
                ["Rex", "boy", "#64748b", "#1e293b"]
            ],

            female: [
                ["A", "girl", "#ec4899", "#831843"],
                ["S", "girl", "#8b5cf6", "#4c1d95"],
                ["M", "girl", "#06b6d4", "#164e63"],
                ["J", "girl", "#f97316", "#7c2d12"],
                ["I", "girl", "#22c55e", "#14532d"],
                ["D", "girl", "#eab308", "#713f12"]
            ]
        },

        11: {

            male: [
                ["A", "boy", "#3b82f6", "#172554"],
                ["C", "boy", "#ef4444", "#7f1d1d"],
                ["R", "boy", "#14b8a6", "#134e4a"]
            ],

            female: [
                ["M", "girl", "#ec4899", "#831843"],
                ["D", "girl", "#a855f7", "#581c87"],
                ["J", "girl", "#f97316", "#7c2d12"],
                ["R", "girl", "#22c55e", "#14532d"]
            ]
        },

        12: {

            male: [
                ["Arv", "boy", "#8b5cf6", "#4c1d95"],
                ["S", "boy", "#06b6d4", "#164e63"],
                ["T", "boy", "#f97316", "#7c2d12"],
                ["D", "boy", "#22c55e", "#14532d"]
            ],

            female: [
                ["I", "girl", "#ec4899", "#831843"],
                ["J", "girl", "#3b82f6", "#172554"],
                ["P", "girl", "#eab308", "#713f12"]
            ]
        }
    },

    teacher: {

        7: {
            male: [
                ["Sir J", "teacher-boy", "#2563eb", "#1e3a8a"]
            ],
            female: [
                ["Maam J", "teacher-girl", "#ec4899", "#831843"],
                ["Maam M", "teacher-girl", "#8b5cf6", "#4c1d95"],
                ["Maam Ju", "teacher-girl", "#06b6d4", "#164e63"],
                ["Maam T", "teacher-girl", "#f97316", "#7c2d12"],
                ["Maam N", "teacher-girl", "#22c55e", "#14532d"],
                ["Maam P", "teacher-girl", "#eab308", "#713f12"],
                ["Maam MJ", "teacher-girl", "#f43f5e", "#881337"]
            ]
        },

        8: {
            male: [
                ["Sir J", "teacher-boy", "#2563eb", "#1e3a8a"]
            ],
            female: [
                ["Maam J", "teacher-girl", "#ec4899", "#831843"],
                ["Maam M", "teacher-girl", "#8b5cf6", "#4c1d95"],
                ["Maam Ju", "teacher-girl", "#06b6d4", "#164e63"],
                ["Maam T", "teacher-girl", "#f97316", "#7c2d12"],
                ["Maam N", "teacher-girl", "#22c55e", "#14532d"],
                ["Maam P", "teacher-girl", "#eab308", "#713f12"],
                ["Maam MJ", "teacher-girl", "#f43f5e", "#881337"]
            ]
        },

        9: {
            male: [
                ["Sir J", "teacher-boy", "#2563eb", "#1e3a8a"]
            ],
            female: [
                ["Maam J", "teacher-girl", "#ec4899", "#831843"],
                ["Maam M", "teacher-girl", "#8b5cf6", "#4c1d95"],
                ["Maam Ju", "teacher-girl", "#06b6d4", "#164e63"],
                ["Maam T", "teacher-girl", "#f97316", "#7c2d12"],
                ["Maam N", "teacher-girl", "#22c55e", "#14532d"],
                ["Maam P", "teacher-girl", "#eab308", "#713f12"],
                ["Maam MJ", "teacher-girl", "#f43f5e", "#881337"]
            ]
        },

        10: {
            male: [
                ["Sir J", "teacher-boy", "#2563eb", "#1e3a8a"]
            ],
            female: [
                ["Maam J", "teacher-girl", "#ec4899", "#831843"],
                ["Maam M", "teacher-girl", "#8b5cf6", "#4c1d95"],
                ["Maam Ju", "teacher-girl", "#06b6d4", "#164e63"],
                ["Maam T", "teacher-girl", "#f97316", "#7c2d12"],
                ["Maam N", "teacher-girl", "#22c55e", "#14532d"],
                ["Maam P", "teacher-girl", "#eab308", "#713f12"],
                ["Maam MJ", "teacher-girl", "#f43f5e", "#881337"]
            ]
        },

        11: {
            male: [
                ["Sir J", "teacher-boy", "#2563eb", "#1e3a8a"]
            ],
            female: [
                ["Maam J", "teacher-girl", "#ec4899", "#831843"],
                ["Maam M", "teacher-girl", "#8b5cf6", "#4c1d95"],
                ["Maam Ju", "teacher-girl", "#06b6d4", "#164e63"],
                ["Maam T", "teacher-girl", "#f97316", "#7c2d12"],
                ["Maam N", "teacher-girl", "#22c55e", "#14532d"],
                ["Maam P", "teacher-girl", "#eab308", "#713f12"],
                ["Maam MJ", "teacher-girl", "#f43f5e", "#881337"]
            ]
        },

        12: {
            male: [
                ["Sir J", "teacher-boy", "#2563eb", "#1e3a8a"]
            ],
            female: [
                ["Maam J", "teacher-girl", "#ec4899", "#831843"],
                ["Maam M", "teacher-girl", "#8b5cf6", "#4c1d95"],
                ["Maam Ju", "teacher-girl", "#06b6d4", "#164e63"],
                ["Maam T", "teacher-girl", "#f97316", "#7c2d12"],
                ["Maam N", "teacher-girl", "#22c55e", "#14532d"],
                ["Maam P", "teacher-girl", "#eab308", "#713f12"],
                ["Maam MJ", "teacher-girl", "#f43f5e", "#881337"]
            ]
        }
    }
};


/* =========================================================
   WEAPONS
========================================================= */

const weapons = {

    chalk: {
        name: "CHALK",
        icon: "🖍️",
        damage: 5,
        range: 120,
        cooldown: 350,
        speed: 500,
        price: 0
    },

    stone: {
        name: "BATO",
        icon: "🪨",
        damage: 10,
        range: 260,
        cooldown: 650,
        speed: 600,
        price: 20
    },

    slipper: {
        name: "SHENELAS",
        icon: "🩴",
        damage: 15,
        range: 170,
        cooldown: 500,
        speed: 550,
        price: 40
    },

    chair: {
        name: "UPUAN",
        icon: "🪑",
        damage: 25,
        range: 130,
        cooldown: 850,
        speed: 450,
        price: 80
    },

    laptop: {
        name: "LAPTOP",
        icon: "💻",
        damage: 30,
        range: 200,
        cooldown: 1000,
        speed: 500,
        price: 120
    },

    book: {
        name: "LIBRO",
        icon: "📕",
        damage: 12,
        range: 220,
        cooldown: 550,
        speed: 650,
        price: 30
    },

    marker: {
        name: "MARKER",
        icon: "🖊️",
        damage: 8,
        range: 180,
        cooldown: 300,
        speed: 700,
        price: 25
    }
};

let ownedWeapons = JSON.parse(
    localStorage.getItem("z2_weapons") ||
    '["chalk"]'
);


/* =========================================================
   CANVAS
========================================================= */

const canvas = $("game-canvas");
const ctx = canvas.getContext("2d");

let canvasWidth = 1000;
let canvasHeight = 650;

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    canvasWidth = rect.width;
    canvasHeight = rect.height;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

window.addEventListener("resize", resizeCanvas);


/* =========================================================
   INTRO SEQUENCE
========================================================= */

const introSteps = [
    "intro-logo",
    "intro-title",
    "intro-developer",
    "intro-warning",
    "intro-final"
];

let introIndex = 0;

function runIntro() {

    introSteps.forEach(id => {
        hideElement($(id));
    });

    const current = $(introSteps[introIndex]);

    showElement(current);

    if (introIndex < introSteps.length - 1) {

        setTimeout(() => {

            hideElement(current);

            introIndex++;

            setTimeout(runIntro, 300);

        }, 2500);

    } else {

        setTimeout(() => {

            showElement($("intro-start-btn"));

        }, 2500);
    }
}

setTimeout(runIntro, 700);


/* =========================================================
   NAVIGATION
========================================================= */

$("intro-start-btn").addEventListener(
    "click",
    () => showScreen("home-screen")
);

$("play-btn").addEventListener(
    "click",
    () => showScreen("role-screen")
);

$("settings-btn").addEventListener(
    "click",
    () => showScreen("settings-screen")
);

$("shop-btn").addEventListener(
    "click",
    () => {

        updateShopCoins();
        buildShop();

        showScreen("shop-screen");
    }
);


/* =========================================================
   ROLE
========================================================= */

document.querySelectorAll("[data-role]")
    .forEach(button => {

        button.addEventListener("click", () => {

            game.role = button.dataset.role;

            $("grade-description").textContent =
                game.role === "teacher"
                    ? "Pili-a ang grade level sa teacher mode."
                    : "Pili-a imong grade level.";

            showScreen("grade-screen");
        });
    });


/* =========================================================
   GRADE
========================================================= */

document.querySelectorAll("[data-grade]")
    .forEach(button => {

        button.addEventListener("click", () => {

            game.grade = Number(button.dataset.grade);

            showScreen("gender-screen");
        });
    });


/* =========================================================
   GENDER
========================================================= */

document.querySelectorAll("[data-gender]")
    .forEach(button => {

        button.addEventListener("click", () => {

            game.gender = button.dataset.gender;

            buildCharacterSelection();

            showScreen("character-screen");
        });
    });


/* =========================================================
   CHARACTER SELECT
========================================================= */

function buildCharacterSelection() {

    const grid = $("character-grid");

    grid.innerHTML = "";

    const list =
        characters?.[game.role]?.[game.grade]?.[game.gender] || [];

    $("character-category").textContent =
        `${game.role === "teacher" ? "Teacher" : "Estudyante"} • Grade ${game.grade}`;

    list.forEach((data, index) => {

        const [name, type, shirt, pants] = data;

        const card = document.createElement("button");

        card.className = "character-card";

        card.dataset.index = index;

        card.innerHTML = `
            <div class="character-body"
                 style="
                    --shirt:${shirt};
                    --pants:${pants};
                 ">
                <div class="character-head"></div>
                <div class="character-hair"></div>
                <div class="character-body-part"></div>
                <div class="character-legs"></div>
            </div>

            <h3>${escapeHTML(name)}</h3>

            <p>${game.gender === "male" ? "Lalaki" : "Babae"}</p>
        `;

        card.addEventListener("click", () => {

            document
                .querySelectorAll(".character-card")
                .forEach(c => c.classList.remove("selected"));

            card.classList.add("selected");

            game.character = {
                name,
                type,
                shirt,
                pants
            };

            updateCharacterPreview();
        });

        grid.appendChild(card);
    });
}


function updateCharacterPreview() {

    if (!game.character) return;

    const c = game.character;

    const preview =
        $("character-preview-body");

    preview.style.setProperty(
        "--shirt",
        c.shirt
    );

    preview.style.setProperty(
        "--pants",
        c.pants
    );

    $("preview-name").textContent =
        c.name;

    $("preview-info").textContent =
        `${game.gender === "male" ? "Lalaki" : "Babae"} • ${game.role === "teacher" ? "Teacher" : "Estudyante"} • Grade ${game.grade}`;

    $("character-confirm").disabled = false;
}


$("character-confirm").addEventListener(
    "click",
    () => {

        if (!game.character) return;

        updateLoadout();

        showScreen("type-screen");
    }
);


/* =========================================================
   HUMAN / ZOMBIE
========================================================= */

document.querySelectorAll("[data-playtype]")
    .forEach(button => {

        button.addEventListener("click", () => {

            game.playType =
                button.dataset.playtype;

            updateLoadout();

            showScreen("loadout-screen");
        });
    });


function updateLoadout() {

    if (!game.character) return;

    const c = game.character;

    const preview =
        $("selected-character-preview");

    preview.style.setProperty(
        "--shirt",
        c.shirt
    );

    preview.style.setProperty(
        "--pants",
        c.pants
    );

    $("selected-character-name").textContent =
        c.name;

    $("selected-character-details").textContent =
        `${game.role === "teacher" ? "Teacher" : "Grade " + game.grade} • ${game.gender === "male" ? "Lalaki" : "Babae"}`;

    $("starting-health").textContent =
        game.playType === "zombie"
            ? "200"
            : "100";

    $("starting-mode").textContent =
        game.playType === "zombie"
            ? "ZOMBIE"
            : "TAO";
}


/* =========================================================
   START GAME
========================================================= */

$("game-start-btn").addEventListener(
    "click",
    startGame
);


function startGame() {

    game.room = 1;
    game.level = 1;

    game.kills = 0;

    game.gameTime = 0;

    game.paused = false;
    game.running = true;

    game.health =
        game.playType === "zombie"
            ? 200
            : 100;

    game.maxHealth =
        game.playType === "zombie"
            ? 200
            : 100;

    game.enemies = [];
    game.projectiles = [];
    game.particles = [];

    game.player.x =
        canvasWidth / 2;

    game.player.y =
        canvasHeight / 2;

    game.player.speed =
        game.playType === "zombie"
            ? 155
            : 190;

    game.currentWeapon = "chalk";

    $("health-fill").style.width = "100%";

    showScreen("game-screen");

    resizeCanvas();

    buildRoom(game.room);

    updateHUD();

    showCountdown(() => {

        game.lastTime = performance.now();

        requestAnimationFrame(gameLoop);

    });
}


/* =========================================================
   COUNTDOWN
========================================================= */

function showCountdown(callback) {

    const overlay =
        $("countdown-overlay");

    const number =
        $("countdown-number");

    showElement(overlay);

    let count = 3;

    number.textContent = count;

    const timer = setInterval(() => {

        count--;

        if (count > 0) {

            number.textContent = count;

            number.style.animation = "none";

            void number.offsetWidth;

            number.style.animation =
                "countdownPop 0.9s ease";

        } else {

            number.textContent = "GO!";

            setTimeout(() => {

                hideElement(overlay);

                clearInterval(timer);

                callback();

            }, 700);
        }

    }, 1000);
}


/* =========================================================
   ROOM DATA
========================================================= */

const roomData = {

    1: {
        name: "CLASSROOM 1",
        wall: "#26212e",
        floor: "#776d62",
        enemyCount: 4,
        enemyHealth: 35,
        enemyDamage: 5,
        enemySpeed: 48
    },

    2: {
        name: "CLASSROOM 2",
        wall: "#202b31",
        floor: "#69635d",
        enemyCount: 6,
        enemyHealth: 45,
        enemyDamage: 5,
        enemySpeed: 55
    },

    3: {
        name: "SCHOOL HALL",
        wall: "#2a2030",
        floor: "#55515b",
        enemyCount: 8,
        enemyHealth: 55,
        enemyDamage: 10,
        enemySpeed: 63
    },

    4: {
        name: "SCIENCE ROOM",
        wall: "#202c2a",
        floor: "#585d59",
        enemyCount: 10,
        enemyHealth: 70,
        enemyDamage: 10,
        enemySpeed: 70
    },

    5: {
        name: "SCHOOL AREA",
        wall: "#302329",
        floor: "#595452",
        enemyCount: 13,
        enemyHealth: 85,
        enemyDamage: 15,
        enemySpeed: 78
    },

    6: {
        name: "FINAL ROOM",
        wall: "#17151c",
        floor: "#46434b",
        enemyCount: 16,
        enemyHealth: 105,
        enemyDamage: 15,
        enemySpeed: 86
    }
};


/* =========================================================
   BUILD ROOM
========================================================= */

function buildRoom(roomNumber) {

    const data = roomData[roomNumber];

    game.decorations = [];

    /*
       Room boundaries
    */

    const margin = 35;

    game.decorations.push({
        type: "desk",
        x: canvasWidth * 0.25,
        y: canvasHeight * 0.25
    });

    game.decorations.push({
        type: "desk",
        x: canvasWidth * 0.7,
        y: canvasHeight * 0.28
    });

    game.decorations.push({
        type: "chair",
        x: canvasWidth * 0.38,
        y: canvasHeight * 0.25
    });

    game.decorations.push({
        type: "chair",
        x: canvasWidth * 0.62,
        y: canvasHeight * 0.25
    });

    game.decorations.push({
        type: "table",
        x: canvasWidth * 0.5,
        y: canvasHeight * 0.7
    });

    game.decorations.push({
        type: "tv",
        x: canvasWidth * 0.82,
        y: canvasHeight * 0.15
    });

    game.decorations.push({
        type: "board",
        x: canvasWidth * 0.5,
        y: 60
    });

    /*
       Different room layouts
    */

    if (roomNumber === 2) {

        for (let i = 0; i < 4; i++) {

            game.decorations.push({
                type: "desk",
                x: 150 + i * 170,
                y: canvasHeight * 0.45
            });
        }
    }

    if (roomNumber === 3) {

        game.decorations.push({
            type: "locker",
            x: 90,
            y: canvasHeight * 0.5
        });

        game.decorations.push({
            type: "locker",
            x: canvasWidth - 90,
            y: canvasHeight * 0.5
        });

        game.decorations.push({
            type: "bench",
            x: canvasWidth * 0.5,
            y: canvasHeight * 0.35
        });
    }

    if (roomNumber === 4) {

        game.decorations.push({
            type: "lab",
            x: canvasWidth * 0.28,
            y: canvasHeight * 0.55
        });

        game.decorations.push({
            type: "lab",
            x: canvasWidth * 0.72,
            y: canvasHeight * 0.55
        });
    }

    if (roomNumber === 5) {

        for (let i = 0; i < 6; i++) {

            game.decorations.push({
                type: "desk",
                x: 120 + (i % 3) * 350,
                y: 180 + Math.floor(i / 3) * 250
            });
        }
    }

    if (roomNumber === 6) {

        game.decorations.push({
            type: "boss-desk",
            x: canvasWidth / 2,
            y: canvasHeight * 0.28
        });

        game.decorations.push({
            type: "locker",
            x: 90,
            y: canvasHeight * 0.25
        });

        game.decorations.push({
            type: "locker",
            x: canvasWidth - 90,
            y: canvasHeight * 0.25
        });
    }

    spawnRoomEnemies();

    $("room-label").textContent =
        data.name;

    $("level-label").textContent =
        `LEVEL ${roomNumber}`;
}


/* =========================================================
   ENEMIES
========================================================= */

function spawnRoomEnemies() {

    const data =
        roomData[game.room];

    game.enemies = [];

    const amount =
        data.enemyCount +
        (game.playType === "zombie"
            ? 2
            : 0);

    for (let i = 0; i < amount; i++) {

        spawnEnemy();
    }
}


function spawnEnemy() {

    const data =
        roomData[game.room];

    const side =
        Math.floor(Math.random() * 4);

    let x;
    let y;

    if (side === 0) {
        x = Math.random() * canvasWidth;
        y = 20;
    } else if (side === 1) {
        x = canvasWidth - 20;
        y = Math.random() * canvasHeight;
    } else if (side === 2) {
        x = Math.random() * canvasWidth;
        y = canvasHeight - 20;
    } else {
        x = 20;
        y = Math.random() * canvasHeight;
    }

    game.enemies.push({

        x,
        y,

        radius: 20,

        health: data.enemyHealth,

        maxHealth: data.enemyHealth,

        damage: data.enemyDamage,

        speed: data.enemySpeed,

        attackCooldown: 1000,

        lastAttack: 0,

        type:
            Math.random() < 0.15
                ? "fast"
                : "normal",

        color:
            Math.random() < 0.5
                ? "#5f8f61"
                : "#496b4b"
    });
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!game.running) return;

    const delta =
        Math.min(
            (timestamp - game.lastTime) / 1000,
            0.05
        );

    game.lastTime = timestamp;

    if (!game.paused) {

        update(delta);

        draw();
    }

    requestAnimationFrame(gameLoop);
}


/* =========================================================
   UPDATE
========================================================= */

function update(dt) {

    game.gameTime += dt;

    if (game.player.invulnerable > 0) {

        game.player.invulnerable -= dt;
    }

    if (game.player.attackTimer > 0) {

        game.player.attackTimer -= dt;

    } else {

        game.player.attacking = false;
    }

    updatePlayer(dt);

    updateEnemies(dt);

    updateProjectiles(dt);

    updateParticles(dt);

    regenerateHealth();

    updateYawa();

    checkRoomComplete();

    updateHUD();
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(dt) {

    let dx = 0;
    let dy = 0;

    if (game.keys["w"] || game.keys["arrowup"])
        dy--;

    if (game.keys["s"] || game.keys["arrowdown"])
        dy++;

    if (game.keys["a"] || game.keys["arrowleft"])
        dx--;

    if (game.keys["d"] || game.keys["arrowright"])
        dx++;

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        const speed =
            game.player.speed;

        const nx =
            game.player.x +
            dx * speed * dt;

        const ny =
            game.player.y +
            dy * speed * dt;

        if (dx < 0)
            game.player.direction = "left";

        if (dx > 0)
            game.player.direction = "right";

        if (dy < 0)
            game.player.direction = "up";

        if (dy > 0)
            game.player.direction = "down";

        if (!isBlocked(nx, game.player.y))
            game.player.x = nx;

        if (!isBlocked(game.player.x, ny))
            game.player.y = ny;
    }

    const r = game.player.radius;

    game.player.x =
        Math.max(
            r,
            Math.min(canvasWidth - r, game.player.x)
        );

    game.player.y =
        Math.max(
            r + 20,
            Math.min(canvasHeight - r, game.player.y)
        );
}


/* =========================================================
   COLLISION
========================================================= */

function isBlocked(x, y) {

    for (const d of game.decorations) {

        if (
            d.type === "desk" ||
            d.type === "table" ||
            d.type === "locker" ||
            d.type === "lab" ||
            d.type === "bench" ||
            d.type === "boss-desk"
        ) {

            const w =
                d.type === "locker"
                    ? 55
                    : 70;

            const h =
                d.type === "locker"
                    ? 130
                    : 50;

            if (
                x > d.x - w / 2 &&
                x < d.x + w / 2 &&
                y > d.y - h / 2 &&
                y < d.y + h / 2
            ) {

                return true;
            }
        }
    }

    return false;
}


/* =========================================================
   ENEMY UPDATE
========================================================= */

function updateEnemies(dt) {

    for (const enemy of game.enemies) {

        let dx =
            game.player.x - enemy.x;

        let dy =
            game.player.y - enemy.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance > 1) {

            dx /= distance;
            dy /= distance;

            const speed =
                enemy.type === "fast"
                    ? enemy.speed * 1.45
                    : enemy.speed;

            const nx =
                enemy.x +
                dx * speed * dt;

            const ny =
                enemy.y +
                dy * speed * dt;

            if (!isBlocked(nx, enemy.y))
                enemy.x = nx;

            if (!isBlocked(enemy.x, ny))
                enemy.y = ny;
        }

        if (
            distance <
            game.player.radius +
            enemy.radius +
            7
        ) {

            const now = performance.now();

            if (
                now - enemy.lastAttack >
                enemy.attackCooldown
            ) {

                enemy.lastAttack = now;

                damagePlayer(enemy.damage);
            }
        }
    }
}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(amount) {

    if (game.player.invulnerable > 0)
        return;

    game.player.invulnerable = 0.45;

    game.health =
        Math.max(
            0,
            game.health - amount
        );

    game.lastDamageTime =
        performance.now();

    createHitParticles(
        game.player.x,
        game.player.y
    );

    playSound("sfx-player-damage");

    if (game.health <= 0) {

        endGame(false);
    }
}


/* =========================================================
   HEALTH REGEN
========================================================= */

function regenerateHealth() {

    if (game.health >= game.maxHealth)
        return;

    if (
        performance.now() -
        game.lastDamageTime <
        10000
    ) {

        return;
    }

    game.health =
        Math.min(
            game.maxHealth,
            game.health + 0.10
        );
}


/* =========================================================
   ATTACK
========================================================= */

function attack() {

    if (!game.running || game.paused)
        return;

    if (game.playType === "zombie") {

        zombieBite();

        return;
    }

    const weapon =
        weapons[game.currentWeapon];

    if (!weapon)
        return;

    const now =
        performance.now();

    if (
        now - game.lastAttack <
        weapon.cooldown
    ) {

        return;
    }

    game.lastAttack = now;

    game.player.attacking = true;

    game.player.attackTimer = 0.22;

    playSound("sfx-attack");

    /*
       Melee weapon
    */

    if (
        game.currentWeapon === "chalk" ||
        game.currentWeapon === "slipper" ||
        game.currentWeapon === "chair" ||
        game.currentWeapon === "laptop"
    ) {

        meleeAttack(weapon);

    } else {

        throwWeapon(weapon);
    }
}


/* =========================================================
   MELEE
========================================================= */

function meleeAttack(weapon) {

    for (let i = game.enemies.length - 1; i >= 0; i--) {

        const enemy =
            game.enemies[i];

        const dx =
            enemy.x -
            game.player.x;

        const dy =
            enemy.y -
            game.player.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance <= weapon.range) {

            enemy.health -= weapon.damage;

            createHitParticles(
                enemy.x,
                enemy.y
            );

            playSound("sfx-hit");

            if (enemy.health <= 0) {

                killEnemy(i);
            }
        }
    }
}


/* =========================================================
   THROW WEAPON
========================================================= */

function throwWeapon(weapon) {

    const direction =
        getDirectionVector();

    game.projectiles.push({

        x: game.player.x,

        y: game.player.y,

        vx:
            direction.x *
            weapon.speed,

        vy:
            direction.y *
            weapon.speed,

        damage: weapon.damage,

        life: 1.5,

        radius: 8,

        icon: weapon.icon
    });

    playSound("sfx-weapon-throw");
}


/* =========================================================
   PROJECTILES
========================================================= */

function updateProjectiles(dt) {

    for (
        let i = game.projectiles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            game.projectiles[i];

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        p.life -= dt;

        let hit = false;

        for (
            let j = game.enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy =
                game.enemies[j];

            const distance =
                Math.hypot(
                    enemy.x - p.x,
                    enemy.y - p.y
                );

            if (
                distance <
                enemy.radius + p.radius
            ) {

                enemy.health -= p.damage;

                createHitParticles(
                    enemy.x,
                    enemy.y
                );

                playSound("sfx-hit");

                if (enemy.health <= 0) {

                    killEnemy(j);
                }

                hit = true;

                break;
            }
        }

        if (
            hit ||
            p.life <= 0 ||
            p.x < 0 ||
            p.x > canvasWidth ||
            p.y < 0 ||
            p.y > canvasHeight
        ) {

            game.projectiles.splice(i, 1);
        }
    }
}


/* =========================================================
   ZOMBIE BITE
========================================================= */

function zombieBite() {

    const now =
        performance.now();

    if (
        now - game.lastAttack <
        700
    ) {

        return;
    }

    game.lastAttack = now;

    game.player.attacking = true;

    game.player.attackTimer = 0.3;

    playSound("sfx-attack");

    for (
        let i = game.enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            game.enemies[i];

        const distance =
            Math.hypot(
                enemy.x - game.player.x,
                enemy.y - game.player.y
            );

        if (distance < 75) {

            enemy.health -= 35;

            createHitParticles(
                enemy.x,
                enemy.y
            );

            playSound("sfx-hit");

            if (enemy.health <= 0) {

                killEnemy(i);
            }
        }
    }
}


/* =========================================================
   KILL ENEMY
========================================================= */

function killEnemy(index) {

    const enemy =
        game.enemies[index];

    if (!enemy) return;

    game.enemies.splice(index, 1);

    game.kills++;

    game.objectiveKills++;

    game.coins += 3;

    localStorage.setItem(
        "z2_coins",
        game.coins
    );

    createDeathParticles(
        enemy.x,
        enemy.y
    );

    playSound("sfx-hit");
}


/* =========================================================
   ROOM COMPLETE
========================================================= */

function checkRoomComplete() {

    if (
        game.roomTransition ||
        game.enemies.length > 0
    ) {

        return;
    }

    game.roomTransition = true;

    if (game.room < 6) {

        showNotification(
            `ROOM ${game.room} NATAPOS! 🎉`
        );

        if (game.room === 3) {

            setTimeout(() => {

                showEventVideo(
                    "assets/videos/congratulations.mp4",
                    5000
                );

            }, 500);
        }

        setTimeout(() => {

            game.room++;

            game.level =
                game.room;

            game.roomTransition = false;

            buildRoom(game.room);

        }, 1600);

    } else {

        setTimeout(() => {

            endGame(true);

        }, 1000);
    }
}


/* =========================================================
   END GAME
========================================================= */

function endGame(victory) {

    if (!game.running)
        return;

    game.running = false;

    game.paused = false;

    if (victory) {

        $("victory-kills").textContent =
            game.kills;

        $("victory-coins").textContent =
            game.coins;

        $("victory-time").textContent =
            formatTime(game.gameTime);

        showScreen("victory-screen");

    } else {

        $("gameover-room").textContent =
            game.room;

        $("gameover-kills").textContent =
            game.kills;

        $("gameover-coins").textContent =
            game.coins;

        showScreen("gameover-screen");

        setTimeout(() => {

            showEventVideo(
                "assets/videos/gameover.mp4",
                30000
            );

        }, 500);
    }
}


/* =========================================================
   DRAWING
========================================================= */

function draw() {

    const data =
        roomData[game.room];

    ctx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    drawRoom(data);

    drawDecorations();

    drawProjectiles();

    drawEnemies();

    drawPlayer();

    drawParticles();

    drawRoomExit();
}


/* =========================================================
   DRAW ROOM
========================================================= */

function drawRoom(data) {

    ctx.fillStyle =
        data.floor;

    ctx.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    /*
       Floor tiles
    */

    ctx.strokeStyle =
        "rgba(0,0,0,0.12)";

    ctx.lineWidth = 1;

    const tile = 50;

    for (
        let x = 0;
        x < canvasWidth;
        x += tile
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);

        ctx.stroke();
    }

    for (
        let y = 0;
        y < canvasHeight;
        y += tile
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);

        ctx.stroke();
    }

    /*
       Walls
    */

    ctx.fillStyle =
        data.wall;

    ctx.fillRect(
        0,
        0,
        canvasWidth,
        30
    );

    ctx.fillRect(
        0,
        canvasHeight - 30,
        canvasWidth,
        30
    );

    ctx.fillRect(
        0,
        0,
        30,
        canvasHeight
    );

    ctx.fillRect(
        canvasWidth - 30,
        0,
        30,
        canvasHeight
    );
}


/* =========================================================
   DECORATIONS
========================================================= */

function drawDecorations() {

    for (const d of game.decorations) {

        ctx.save();

        ctx.translate(d.x, d.y);

        if (d.type === "desk")
            drawDesk();

        else if (d.type === "chair")
            drawChair();

        else if (d.type === "table")
            drawTable();

        else if (d.type === "tv")
            drawTV();

        else if (d.type === "board")
            drawBoard();

        else if (d.type === "locker")
            drawLocker();

        else if (d.type === "bench")
            drawBench();

        else if (d.type === "lab")
            drawLab();

        else if (d.type === "boss-desk")
            drawBossDesk();

        ctx.restore();
    }
}


function drawDesk() {

    ctx.fillStyle = "#704f35";

    ctx.fillRect(
        -35,
        -25,
        70,
        50
    );

    ctx.fillStyle = "#3b281d";

    ctx.fillRect(
        -30,
        25,
        8,
        25
    );

    ctx.fillRect(
        22,
        25,
        8,
        25
    );
}


function drawChair() {

    ctx.fillStyle = "#513b2b";

    ctx.fillRect(
        -17,
        -14,
        34,
        30
    );

    ctx.fillRect(
        -14,
        14,
        6,
        25
    );

    ctx.fillRect(
        8,
        14,
        6,
        25
    );
}


function drawTable() {

    ctx.fillStyle = "#6b4b31";

    ctx.fillRect(
        -55,
        -25,
        110,
        50
    );

    ctx.fillStyle = "#382519";

    ctx.fillRect(
        -48,
        25,
        8,
        35
    );

    ctx.fillRect(
        40,
        25,
        8,
        35
    );
}


function drawTV() {

    ctx.fillStyle = "#171717";

    ctx.fillRect(
        -38,
        -25,
        76,
        50
    );

    ctx.fillStyle = "#31415e";

    ctx.fillRect(
        -30,
        -17,
        60,
        34
    );

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -5,
        25,
        10,
        12
    );
}


function drawBoard() {

    ctx.fillStyle = "#222b25";

    ctx.fillRect(
        -160,
        -28,
        320,
        56
    );

    ctx.strokeStyle = "#806f52";

    ctx.lineWidth = 5;

    ctx.strokeRect(
        -160,
        -28,
        320,
        56
    );

    ctx.fillStyle = "rgba(255,255,255,0.25)";

    ctx.font = "16px Arial";

    ctx.fillText(
        "WELCOME SA NIHS 😂",
        -85,
        5
    );
}


function drawLocker() {

    ctx.fillStyle = "#343943";

    ctx.fillRect(
        -27,
        -65,
        54,
        130
    );

    ctx.strokeStyle = "#555b67";

    ctx.strokeRect(
        -27,
        -65,
        54,
        130
    );

    ctx.beginPath();

    ctx.moveTo(0, -65);
    ctx.lineTo(0, 65);

    ctx.stroke();
}


function drawBench() {

    ctx.fillStyle = "#725438";

    ctx.fillRect(
        -75,
        -14,
        150,
        28
    );

    ctx.fillStyle = "#3e2b1e";

    ctx.fillRect(
        -62,
        14,
        10,
        35
    );

    ctx.fillRect(
        52,
        14,
        10,
        35
    );
}


function drawLab() {

    ctx.fillStyle = "#42545a";

    ctx.fillRect(
        -55,
        -30,
        110,
        60
    );

    ctx.fillStyle = "#a8c8c9";

    ctx.fillRect(
        -43,
        -20,
        86,
        20
    );

    ctx.fillStyle = "#7d6044";

    ctx.beginPath();

    ctx.arc(
        0,
        18,
        12,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawBossDesk() {

    ctx.fillStyle = "#422f22";

    ctx.fillRect(
        -110,
        -30,
        220,
        60
    );

    ctx.fillStyle = "#6f4b30";

    ctx.fillRect(
        -100,
        -22,
        200,
        35
    );
}


/* =========================================================
   DRAW ENEMIES
========================================================= */

function drawEnemies() {

    for (const enemy of game.enemies) {

        ctx.save();

        ctx.translate(
            enemy.x,
            enemy.y
        );

        /*
           Shadow
        */

        ctx.fillStyle =
            "rgba(0,0,0,0.25)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            20,
            22,
            9,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
           Body
        */

        ctx.fillStyle =
            enemy.color;

        ctx.fillRect(
            -16,
            -2,
            32,
            35
        );

        /*
           Head
        */

        ctx.beginPath();

        ctx.arc(
            0,
            -17,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
           Hair
        */

        ctx.fillStyle =
            "#182018";

        ctx.beginPath();

        ctx.arc(
            0,
            -24,
            17,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();

        /*
           Eyes
        */

        ctx.fillStyle = "#f8fafc";

        ctx.beginPath();
        ctx.arc(-7, -18, 4, 0, Math.PI * 2);
        ctx.arc(7, -18, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#111";

        ctx.beginPath();
        ctx.arc(-7, -18, 2, 0, Math.PI * 2);
        ctx.arc(7, -18, 2, 0, Math.PI * 2);
        ctx.fill();

        /*
           Health bar
        */

        const width = 44;

        ctx.fillStyle =
            "rgba(0,0,0,0.5)";

        ctx.fillRect(
            -width / 2,
            -45,
            width,
            5
        );

        ctx.fillStyle =
            "#ef4444";

        ctx.fillRect(
            -width / 2,
            -45,
            width *
            (enemy.health / enemy.maxHealth),
            5
        );

        ctx.restore();
    }
}


/* =========================================================
   DRAW PLAYER
========================================================= */

function drawPlayer() {

    const c =
        game.character || {
            shirt: "#6366f1",
            pants: "#20232d",
            type: "boy"
        };

    ctx.save();

    ctx.translate(
        game.player.x,
        game.player.y
    );

    /*
       Invulnerability blink
    */

    if (
        game.player.invulnerable > 0 &&
        Math.floor(
            game.player.invulnerable * 12
        ) % 2 === 0
    ) {

        ctx.globalAlpha = 0.45;
    }

    /*
       Shadow
    */

    ctx.fillStyle =
        "rgba(0,0,0,0.28)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        23,
        24,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Legs
    */

    ctx.fillStyle =
        c.pants || "#20232d";

    ctx.fillRect(
        -13,
        10,
        10,
        27
    );

    ctx.fillRect(
        3,
        10,
        10,
        27
    );

    /*
       Body
    */

    ctx.fillStyle =
        c.shirt || "#6366f1";

    ctx.fillRect(
        -18,
        -10,
        36,
        38
    );

    /*
       Arms
    */

    ctx.fillStyle =
        c.shirt || "#6366f1";

    ctx.fillRect(
        -28,
        -7,
        10,
        30
    );

    ctx.fillRect(
        18,
        -7,
        10,
        30
    );

    /*
       Head
    */

    ctx.fillStyle =
        "#c98d6b";

    ctx.beginPath();

    ctx.arc(
        0,
        -29,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Hair
    */

    ctx.fillStyle =
        c.type.includes("girl")
            ? "#351d16"
            : "#1f1714";

    if (c.type.includes("girl")) {

        ctx.beginPath();

        ctx.arc(
            0,
            -31,
            21,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillRect(
            -20,
            -32,
            7,
            25
        );

        ctx.fillRect(
            13,
            -32,
            7,
            25
        );

    } else {

        ctx.beginPath();

        ctx.arc(
            0,
            -34,
            20,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();
    }

    /*
       Eyes
    */

    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(
        -7,
        -28,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        7,
        -28,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Attack effect
    */

    if (game.player.attacking) {

        ctx.strokeStyle =
            "rgba(196,181,253,0.9)";

        ctx.lineWidth = 6;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            48,
            -0.8,
            0.8
        );

        ctx.stroke();
    }

    /*
       Zombie mode indicator
    */

    if (game.playType === "zombie") {

        ctx.fillStyle = "#7f1d1d";

        ctx.font = "bold 10px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "ZOMBIE",
            0,
            48
        );
    }

    ctx.restore();
}


/* =========================================================
   PROJECTILE DRAW
========================================================= */

function drawProjectiles() {

    for (const p of game.projectiles) {

        ctx.font = "22px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            p.icon,
            p.x,
            p.y
        );
    }
}


/* =========================================================
   PARTICLES
========================================================= */

function createHitParticles(x, y) {

    for (let i = 0; i < 8; i++) {

        game.particles.push({

            x,
            y,

            vx:
                (Math.random() - 0.5) *
                140,

            vy:
                (Math.random() - 0.5) *
                140,

            life: 0.4,

            maxLife: 0.4,

            size:
                2 +
                Math.random() * 4
        });
    }
}


function createDeathParticles(x, y) {

    for (let i = 0; i < 15; i++) {

        game.particles.push({

            x,
            y,

            vx:
                (Math.random() - 0.5) *
                200,

            vy:
                (Math.random() - 0.5) *
                200,

            life: 0.7,

            maxLife: 0.7,

            size:
                3 +
                Math.random() * 5
        });
    }
}


function updateParticles(dt) {

    for (
        let i = game.particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            game.particles[i];

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        p.vx *= 0.94;
        p.vy *= 0.94;

        p.life -= dt;

        if (p.life <= 0) {

            game.particles.splice(i, 1);
        }
    }
}


function drawParticles() {

    for (const p of game.particles) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / p.maxLife
            );

        ctx.fillStyle =
            "#c4b5fd";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}


/* =========================================================
   ROOM EXIT
========================================================= */

function drawRoomExit() {

    if (
        game.enemies.length > 0 ||
        game.room >= 6
    ) {

        return;
    }

    ctx.save();

    ctx.fillStyle =
        "rgba(139,92,246,0.8)";

    ctx.fillRect(
        canvasWidth / 2 - 65,
        8,
        130,
        25
    );

    ctx.fillStyle = "#fff";

    ctx.font = "bold 12px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        game.room < 6
            ? "ROOM CLEAR →"
            : "FINISH!",
        canvasWidth / 2,
        25
    );

    ctx.restore();
}


/* =========================================================
   DIRECTION
========================================================= */

function getDirectionVector() {

    switch (game.player.direction) {

        case "up":
            return { x: 0, y: -1 };

        case "down":
            return { x: 0, y: 1 };

        case "left":
            return { x: -1, y: 0 };

        default:
            return { x: 1, y: 0 };
    }
}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    e => {

        const key =
            e.key.toLowerCase();

        game.keys[key] = true;

        if (
            key === " " ||
            key === "enter"
        ) {

            if (
                game.running &&
                !game.paused
            ) {

                attack();
            }
        }

        if (key === "escape") {

            togglePause();
        }

        if (key === "e") {

            attack();
        }
    }
);


window.addEventListener(
    "keyup",
    e => {

        game.keys[
            e.key.toLowerCase()
        ] = false;
    }
);


/* =========================================================
   MOBILE CONTROLLER
========================================================= */

document.querySelectorAll(
    "[data-direction]"
).forEach(button => {

    const direction =
        button.dataset.direction;

    const down = e => {

        e.preventDefault();

        game.keys[
            directionToKey(direction)
        ] = true;
    };

    const up = e => {

        e.preventDefault();

        game.keys[
            directionToKey(direction)
        ] = false;
    };

    button.addEventListener(
        "pointerdown",
        down
    );

    button.addEventListener(
        "pointerup",
        up
    );

    button.addEventListener(
        "pointercancel",
        up
    );

    button.addEventListener(
        "pointerleave",
        up
    );
});


function directionToKey(direction) {

    if (direction === "up")
        return "arrowup";

    if (direction === "down")
        return "arrowdown";

    if (direction === "left")
        return "arrowleft";

    return "arrowright";
}


$("attack-btn").addEventListener(
    "pointerdown",
    e => {

        e.preventDefault();

        attack();
    }
);


$("throw-btn").addEventListener(
    "pointerdown",
    e => {

        e.preventDefault();

        attack();
    }
);


/* =========================================================
   PAUSE
========================================================= */

$("pause-btn").addEventListener(
    "click",
    togglePause
);


$("resume-btn").addEventListener(
    "click",
    togglePause
);


function togglePause() {

    if (!game.running)
        return;

    game.paused =
        !game.paused;

    if (game.paused) {

        showElement(
            $("pause-overlay")
        );

    } else {

        hideElement(
            $("pause-overlay")
        );

        game.lastTime =
            performance.now();
    }
}


$("quit-game-btn").addEventListener(
    "click",
    () => {

        game.running = false;
        game.paused = false;

        hideElement(
            $("pause-overlay")
        );

        showScreen("home-screen");
    }
);


/* =========================================================
   SETTINGS
========================================================= */

const masterVolume =
    $("master-volume");

const musicVolume =
    $("music-volume");

const sfxVolume =
    $("sfx-volume");


function setupSlider(
    slider,
    output,
    storageKey
) {

    const saved =
        localStorage.getItem(
            storageKey
        );

    if (saved !== null) {

        slider.value = saved;
    }

    output.textContent =
        `${slider.value}%`;

    slider.addEventListener(
        "input",
        () => {

            output.textContent =
                `${slider.value}%`;

            localStorage.setItem(
                storageKey,
                slider.value
            );
        }
    );
}


setupSlider(
    masterVolume,
    $("master-volume-value"),
    "z2_master_volume"
);

setupSlider(
    musicVolume,
    $("music-volume-value"),
    "z2_music_volume"
);

setupSlider(
    sfxVolume,
    $("sfx-volume-value"),
    "z2_sfx_volume"
);


let soundEnabled =
    localStorage.getItem(
        "z2_sound"
    ) !== "off";


function updateSoundButton() {

    const button =
        $("sound-toggle");

    button.textContent =
        soundEnabled
            ? "ON"
            : "OFF";

    button.classList.toggle(
        "active",
        soundEnabled
    );
}


updateSoundButton();


$("sound-toggle").addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        localStorage.setItem(
            "z2_sound",
            soundEnabled
                ? "on"
                : "off"
        );

        updateSoundButton();
    }
);


/* =========================================================
   SOUND PLACEHOLDER SYSTEM
========================================================= */

function playSound(id) {

    if (!soundEnabled)
        return;

    const audio = $(id);

    if (!audio)
        return;

    try {

        audio.currentTime = 0;

        audio.volume =
            Number(
                sfxVolume.value
            ) / 100;

        audio.play().catch(() => {});

    } catch (error) {

        /* Audio files are optional. */
    }
}


/* =========================================================
   YAWA EVENT
========================================================= */

function updateYawa() {

    if (
        performance.now() -
        game.lastYawaTime <
        3000
    ) {

        return;
    }

    game.lastYawaTime =
        performance.now();

    if (game.running) {

        playSound("sfx-yawa");
    }
}


/* =========================================================
   VIDEO SYSTEM
========================================================= */

let videoTimer = null;


function showEventVideo(
    source,
    duration
) {

    const video =
        $("event-video");

    video.src = source;

    showScreen("video-overlay");

    video.currentTime = 0;

    video.play().catch(() => {});

    clearTimeout(videoTimer);

    videoTimer =
        setTimeout(() => {

            closeEventVideo();

        }, duration);
}


function closeEventVideo() {

    clearTimeout(videoTimer);

    const video =
        $("event-video");

    video.pause();

    video.removeAttribute("src");

    video.load();

    showScreen(
        game.running
            ? "game-screen"
            : "home-screen"
    );
}


$("video-close").addEventListener(
    "click",
    closeEventVideo
);


/* =========================================================
   VIDEO BUTTONS
========================================================= */

$("gameover-video-btn").addEventListener(
    "click",
    () => {

        showEventVideo(
            "assets/videos/gameover.mp4",
            30000
        );
    }
);


$("victory-video-btn").addEventListener(
    "click",
    () => {

        showEventVideo(
            "assets/videos/completed.mp4",
            5000
        );
    }
);


$("retry-btn").addEventListener(
    "click",
    () => {

        updateLoadout();

        startGame();
    }
);


$("gameover-menu-btn").addEventListener(
    "click",
    () => {

        showScreen("home-screen");
    }
);


$("victory-menu-btn").addEventListener(
    "click",
    () => {

        showScreen("home-screen");
    }
);


/* =========================================================
   SETTINGS BACK
========================================================= */

$("settings-back").addEventListener(
    "click",
    () => {

        showScreen("home-screen");
    }
);


$("shop-back").addEventListener(
    "click",
    () => {

        showScreen("home-screen");
    }
);


$("grade-back").addEventListener(
    "click",
    () => {

        showScreen("role-screen");
    }
);


$("gender-back").addEventListener(
    "click",
    () => {

        showScreen("grade-screen");
    }
);


$("character-back").addEventListener(
    "click",
    () => {

        showScreen("gender-screen");
    }
);


/* =========================================================
   SHOP
========================================================= */

function updateShopCoins() {

    $("shop-coins").textContent =
        game.coins;
}


function buildShop() {

    const grid =
        $("shop-grid");

    grid.innerHTML = "";

    Object.entries(weapons)
        .forEach(
            ([id, weapon]) => {

                const owned =
                    ownedWeapons.includes(id);

                const item =
                    document.createElement("div");

                item.className =
                    "shop-item";

                item.innerHTML = `

                    <div class="shop-icon">
                        ${weapon.icon}
                    </div>

                    <h3>
                        ${escapeHTML(weapon.name)}
                    </h3>

                    <p>
                        Damage: ${weapon.damage}<br>
                        Range: ${weapon.range}
                    </p>

                    <div class="shop-price">
                        ${
                            owned
                                ? "NABILI NA"
                                : "🪙 " + weapon.price
                        }
                    </div>

                    <button
                        class="shop-buy"
                        ${owned ? "disabled" : ""}
                    >
                        ${
                            owned
                                ? "OWNED"
                                : "PALIT"
                        }
                    </button>
                `;

                const buyButton =
                    item.querySelector(
                        ".shop-buy"
                    );

                if (!owned) {

                    buyButton.addEventListener(
                        "click",
                        () => {

                            buyWeapon(id);
                        }
                    );
                }

                grid.appendChild(item);
            }
        );
}


function buyWeapon(id) {

    const weapon =
        weapons[id];

    if (!weapon)
        return;

    if (
        game.coins <
        weapon.price
    ) {

        showNotification(
            "Kulang imong coins oy! 😂"
        );

        return;
    }

    game.coins -=
        weapon.price;

    ownedWeapons.push(id);

    localStorage.setItem(
        "z2_coins",
        game.coins
    );

    localStorage.setItem(
        "z2_weapons",
        JSON.stringify(
            ownedWeapons
        )
    );

    updateShopCoins();

    buildShop();

    showNotification(
        `${weapon.name} NADUGANG SA IMONG INVENTORY!`
    );
}


/* =========================================================
   NOTIFICATION
========================================================= */

let notificationTimer = null;


function showNotification(message) {

    const notification =
        $("notification");

    $("notification-text")
        .textContent = message;

    showElement(notification);

    clearTimeout(
        notificationTimer
    );

    notificationTimer =
        setTimeout(() => {

            hideElement(
                notification
            );

        }, 2500);
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    const healthPercent =
        Math.max(
            0,
            Math.min(
                100,
                (game.health /
                    game.maxHealth) *
                100
            )
        );

    $("health-fill").style.width =
        `${healthPercent}%`;

    $("health-text").textContent =
        `${Math.ceil(game.health)} / ${game.maxHealth}`;

    $("coin-count").textContent =
        game.coins;

    $("zombie-count").textContent =
        game.enemies.length;

    const weapon =
        weapons[game.currentWeapon];

    if (weapon) {

        $("weapon-name").textContent =
            weapon.name;

        $("weapon-damage").textContent =
            `DAMAGE ${weapon.damage}`;

        document.querySelector(
            ".weapon-icon"
        ).textContent =
            weapon.icon;
    }
}


/* =========================================================
   TIME FORMAT
========================================================= */

function formatTime(seconds) {

    const mins =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return (
        String(mins).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   SELECT OWNED WEAPONS
========================================================= */

window.addEventListener(
    "keydown",
    e => {

        const number =
            Number(e.key);

        const weaponIds =
            ownedWeapons;

        if (
            number >= 1 &&
            number <= weaponIds.length
        ) {

            const id =
                weaponIds[number - 1];

            if (weapons[id]) {

                game.currentWeapon =
                    id;

                updateHUD();

                showNotification(
                    `${weapons[id].icon} ${weapons[id].name} GIGAMIT`
                );
            }
        }
    }
);


/* =========================================================
   LOADOUT WEAPON SELECTION
========================================================= */

document.addEventListener(
    "contextmenu",
    e => {

        if (game.running)
            e.preventDefault();
    }
);


/* =========================================================
   INITIALIZE
========================================================= */

resizeCanvas();

updateShopCoins();

updateSoundButton();

console.log(
    "ZOMBIE² loaded successfully. 🧟🎮"
);
