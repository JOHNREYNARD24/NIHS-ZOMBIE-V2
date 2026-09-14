/* =========================================================
   NIHS ZOMBIE APOCALYPSE
   COMPLETE SCRIPT.JS
   Single Joystick + 360° Aim/Throw
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    const introScreen = $("introScreen");
    const purokScreen = $("purokScreen");
    const reminderScreen = $("reminderScreen");
    const creatorScreen = $("creatorScreen");
    const titleScreen = $("titleScreen");
    const setupScreen = $("setupScreen");
    const gameScreen = $("gameScreen");
    const settingsScreen = $("settingsScreen");
    const gameOverScreen = $("gameOverScreen");

    const canvas = $("gameCanvas");
    const ctx = canvas.getContext("2d");

    const joystick = $("joystick");
    const joystickStick = $("joystickStick");
    const attackBtn = $("attackBtn");

    const pausePanel = $("pausePanel");
    const shopModal = $("shopModal");
    const levelVideoOverlay = $("levelVideoOverlay");

    /* =====================================================
       ASSETS
       Ilisi lang ang filenames kung naa na kay actual files.
    ===================================================== */

    const ASSETS = {
        logo: "nihs-logo.png",

        audio: {
            music: "",
            yawa: "",
            throw: "",
            hit: "",
            zombie: "",
            defeat: ""
        },

        videos: {
            level3: "",
            gameOver: "relapse.mp4",
            complete: ""
        }
    };

    /* =====================================================
       GAME STATE
    ===================================================== */

    const state = {
        screen: "intro",

        running: false,
        paused: false,
        gameOver: false,

        level: 1,
        maxLevel: 6,

        score: 0,
        coins: 0,

        player: null,
        zombies: [],
        projectiles: [],
        particles: [],

        selectedCharacter: null,
        selectedSide: "human",

        lastTime: 0,

        regenTimer: 0,
        yawaTimer: 0,

        levelTransition: false,

        joystick: {
            active: false,
            pointerId: null,
            x: 0,
            y: 0,
            strength: 0,
            angle: 0
        },

        keys: {},

        settings: {
            volume: Number(localStorage.getItem("nihsVolume") || 80),
            sound: localStorage.getItem("nihsSound") !== "off"
        }
    };

    /* =====================================================
       CHARACTER DATA
    ===================================================== */

    const characters = {

        "Grade 7": {
            Male: [
                "STEVE",
                "CYBER C"
            ],
            Female: [
                "J",
                "INDAY J",
                "A"
            ]
        },

        "Grade 8": {
            Male: [
                "NYGIEN",
                "BOSS H",
                "DODONG O"
            ],
            Female: [
                "XYHH",
                "ASH",
                "MITCH",
                "HYRIS C",
                "D",
                "J"
            ]
        },

        "Grade 9": {
            Male: [
                "BOSS J",
                "BOSS R",
                "DODONG"
            ],
            Female: [
                "INDAY Y",
                "MISS H",
                "V"
            ]
        },

        "Grade 10": {
            Male: [
                "JOHN REYNARD",
                "KENTH",
                "CLARK",
                "CARL",
                "ARCHEL",
                "RHEY",
                "JOHNSON",
                "CRISTIAN",
                "RHAMCES",
                "JESTER",
                "JULIUS",
                "ARCHGEL",
                "RENCEY",
                "ELM",
                "SHR",
                "REX"
            ],
            Female: [
                "A",
                "S",
                "M",
                "J",
                "I",
                "D"
            ]
        },

        "Grade 11": {
            Male: [
                "A",
                "C",
                "R"
            ],
            Female: [
                "M",
                "D",
                "J",
                "R"
            ]
        },

        "Grade 12": {
            Male: [
                "ARV",
                "S",
                "T",
                "D"
            ],
            Female: [
                "I",
                "J",
                "P"
            ]
        },

        Teacher: {
            Male: [
                "SIR J"
            ],
            Female: [
                "MAAM J",
                "MAAM M",
                "MAAM JU",
                "MAAM T",
                "MAAM N",
                "MAAM P",
                "MAAM M",
                "MAAM MJ"
            ]
        }
    };

    /* =====================================================
       WEAPONS
    ===================================================== */

    const weapons = [
        {
            id: "chalk",
            name: "CHALK",
            damage: 20,
            speed: 8,
            price: 0,
            color: "#f3f3f3"
        },
        {
            id: "stone",
            name: "BATO",
            damage: 30,
            speed: 7,
            price: 30,
            color: "#aaa"
        },
        {
            id: "book",
            name: "LIBRO",
            damage: 35,
            speed: 7,
            price: 45,
            color: "#ffb84d"
        },
        {
            id: "eraser",
            name: "ERASER",
            damage: 25,
            speed: 9,
            price: 35,
            color: "#ff8bc4"
        },
        {
            id: "slipper",
            name: "SHENELAS",
            damage: 45,
            speed: 8,
            price: 70,
            color: "#55aaff"
        },
        {
            id: "chair",
            name: "UPUAN",
            damage: 55,
            speed: 5,
            price: 100,
            color: "#8b5a35"
        },
        {
            id: "laptop",
            name: "LAPTOP",
            damage: 70,
            speed: 6,
            price: 150,
            color: "#777"
        }
    ];

    let ownedWeapons = JSON.parse(
        localStorage.getItem("nihsWeapons") || '["chalk"]'
    );

    let currentWeapon = "chalk";

    /* =====================================================
       COLORS
    ===================================================== */

    const outfitColors = [
        "#e74c3c",
        "#3498db",
        "#2ecc71",
        "#9b59b6",
        "#f39c12",
        "#1abc9c",
        "#e67e22",
        "#34495e",
        "#e84393",
        "#16a085"
    ];

    /* =====================================================
       CANVAS
    ===================================================== */

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();

        const dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);

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
    window.addEventListener("orientationchange", () => {
        setTimeout(resizeCanvas, 200);
    });

    /* =====================================================
       SCREEN CONTROL
    ===================================================== */

    function showScreen(screen) {

        [
            introScreen,
            purokScreen,
            reminderScreen,
            creatorScreen,
            titleScreen,
            setupScreen,
            settingsScreen,
            gameOverScreen
        ].forEach(el => {
            if (el) el.classList.add("hidden");
        });

        if (screen) {
            screen.classList.remove("hidden");
        }

        state.screen = screen;
    }

    /* =====================================================
       INTRO
    ===================================================== */

    function startIntro() {

        showScreen(introScreen);

        setTimeout(() => {
            introScreen.classList.add("fadeOut");

            setTimeout(() => {
                showScreen(purokScreen);

                setTimeout(() => {
                    purokScreen.classList.add("fadeOut");

                    setTimeout(() => {
                        showScreen(reminderScreen);
                    }, 700);

                }, 2500);

            }, 700);

        }, 2500);
    }

    /* =====================================================
       BUTTONS
    ===================================================== */

    $("toCreator")?.addEventListener("click", () => {
        showScreen(creatorScreen);
    });

    $("toTitle")?.addEventListener("click", () => {
        showScreen(titleScreen);
    });

    $("startSetup")?.addEventListener("click", () => {
        showScreen(setupScreen);
        updateCharacterGrid();
    });

    $("settingsBtn")?.addEventListener("click", () => {
        showScreen(settingsScreen);
        loadSettingsUI();
    });

    $("closeSettings")?.addEventListener("click", () => {
        showScreen(titleScreen);
    });

    /* =====================================================
       SETUP
    ===================================================== */

    $("grade")?.addEventListener("change", updateCharacterGrid);
    $("gender")?.addEventListener("change", updateCharacterGrid);
    $("role")?.addEventListener("change", updateCharacterGrid);

    function updateCharacterGrid() {

        const grid = $("charGrid");

        if (!grid) return;

        grid.innerHTML = "";

        const role = $("role")?.value || "Student";
        const gender = $("gender")?.value || "Male";
        const grade = $("grade")?.value || "Grade 7";

        const group =
            role === "Teacher"
                ? characters.Teacher
                : characters[grade];

        const list = group?.[gender] || [];

        state.selectedCharacter = null;

        list.forEach((name, index) => {

            const card = document.createElement("div");

            card.className = "char";

            const face = document.createElement("div");

            face.className = "face";

            face.textContent =
                gender === "Male"
                    ? "👨"
                    : "👩";

            const label = document.createElement("div");

            label.textContent = name;

            card.appendChild(face);
            card.appendChild(label);

            card.addEventListener("click", () => {

                document
                    .querySelectorAll(".char")
                    .forEach(c =>
                        c.classList.remove("selected")
                    );

                card.classList.add("selected");

                state.selectedCharacter = {
                    name,
                    gender,
                    grade,
                    role,
                    color: getCharacterColor(name, index)
                };
            });

            grid.appendChild(card);
        });
    }

    function getCharacterColor(name, index) {

        if (name === "JOHN REYNARD") {
            return "#2468e8";
        }

        if (name === "XYHH") {
            return "#8d3dcc";
        }

        return outfitColors[
            Math.abs(hashString(name) + index)
            % outfitColors.length
        ];
    }

    function hashString(text) {

        let hash = 0;

        for (let i = 0; i < text.length; i++) {
            hash =
                ((hash << 5) - hash) +
                text.charCodeAt(i);

            hash |= 0;
        }

        return hash;
    }

    /* =====================================================
       SIDE
    ===================================================== */

    $("humanSide")?.addEventListener("click", () => {

        state.selectedSide = "human";

        $("humanSide").classList.add("primary");
        $("zombieSide").classList.remove("primary");
    });

    $("zombieSide")?.addEventListener("click", () => {

        state.selectedSide = "zombie";

        $("zombieSide").classList.add("primary");
        $("humanSide").classList.remove("primary");
    });

    $("beginGame")?.addEventListener("click", beginGame);

    function beginGame() {

        if (!state.selectedCharacter) {

            const grade = $("grade")?.value || "Grade 7";
            const gender = $("gender")?.value || "Male";
            const role = $("role")?.value || "Student";

            const group =
                role === "Teacher"
                    ? characters.Teacher
                    : characters[grade];

            const first =
                group?.[gender]?.[0] ||
                "PLAYER";

            state.selectedCharacter = {
                name: first,
                gender,
                grade,
                role,
                color: getCharacterColor(first, 0)
            };
        }

        state.level = 1;
        state.score = 0;
        state.running = true;
        state.paused = false;
        state.gameOver = false;

        createPlayer();
        createLevel();

        showScreen(gameScreen);

        resizeCanvas();

        pausePanel?.classList.add("hidden");

        playBackgroundMusic();

        requestAnimationFrame(gameLoop);
    }

    /* =====================================================
       PLAYER
    ===================================================== */

    function createPlayer() {

        const w = canvas.clientWidth || 800;
        const h = canvas.clientHeight || 600;

        state.player = {

            x: w / 2,
            y: h / 2,

            radius: 22,

            hp: 100,
            maxHp: 100,

            speed:
                state.selectedSide === "zombie"
                    ? 2.7
                    : 3.4,

            angle: 0,

            color:
                state.selectedSide === "zombie"
                    ? "#4d9659"
                    : state.selectedCharacter.color,

            invincible: 0
        };

        updateHUD();
    }

    /* =====================================================
       LEVEL
    ===================================================== */

    function createLevel() {

        state.zombies = [];
        state.projectiles = [];
        state.particles = [];

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        state.player.x = w / 2;
        state.player.y = h / 2;

        const count =
            3 + state.level * 2;

        for (let i = 0; i < count; i++) {

            let x;
            let y;

            do {

                x =
                    60 +
                    Math.random() *
                    Math.max(100, w - 120);

                y =
                    100 +
                    Math.random() *
                    Math.max(100, h - 180);

            } while (
                distance(
                    x,
                    y,
                    state.player.x,
                    state.player.y
                ) < 180
            );

            state.zombies.push(
                createZombie(x, y, i)
            );
        }

        updateHUD();
    }

    function createZombie(x, y, index) {

        return {

            x,
            y,

            radius: 22,

            hp: 200,
            maxHp: 200,

            speed:
                0.65 +
                state.level * 0.10,

            damage:
                state.level >= 5
                    ? 15
                    : state.level >= 3
                        ? 10
                        : 5,

            attackCooldown: 0,

            color:
                index % 2
                    ? "#4f8f58"
                    : "#558f62"
        };
    }

    /* =====================================================
       GAME LOOP
    ===================================================== */

    function gameLoop(timestamp) {

        if (!state.running) return;

        if (!state.lastTime) {
            state.lastTime = timestamp;
        }

        const delta =
            Math.min(
                (timestamp - state.lastTime) / 16.67,
                2
            );

        state.lastTime = timestamp;

        if (!state.paused && !state.gameOver) {

            update(delta);
            draw();
        }

        requestAnimationFrame(gameLoop);
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    function update(dt) {

        if (!state.player) return;

        updatePlayer(dt);
        updateZombies(dt);
        updateProjectiles(dt);
        updateParticles(dt);

        healthRegeneration(dt);

        state.yawaTimer += dt * 16.67;

        if (
            state.yawaTimer >= 3000
        ) {

            state.yawaTimer = 0;

            playSound("yawa");
        }

        if (state.player.hp <= 0) {
            triggerGameOver();
        }

        if (
            state.zombies.length === 0 &&
            !state.levelTransition
        ) {
            completeLevel();
        }

        updateHUD();
    }

    /* =====================================================
       PLAYER MOVEMENT
       SINGLE JOYSTICK
       JOYSTICK DIRECTION = MOVEMENT + AIM
    ===================================================== */

    function updatePlayer(dt) {

        const p = state.player;

        let mx = state.joystick.x;
        let my = state.joystick.y;

        if (
            Math.abs(mx) < 0.05 &&
            Math.abs(my) < 0.05
        ) {
            mx = 0;
            my = 0;
        }

        /* Keyboard fallback */

        if (state.keys["ArrowLeft"] || state.keys["a"]) {
            mx -= 1;
        }

        if (state.keys["ArrowRight"] || state.keys["d"]) {
            mx += 1;
        }

        if (state.keys["ArrowUp"] || state.keys["w"]) {
            my -= 1;
        }

        if (state.keys["ArrowDown"] || state.keys["s"]) {
            my += 1;
        }

        const len =
            Math.hypot(mx, my);

        if (len > 0) {

            if (len > 1) {
                mx /= len;
                my /= len;
            }

            p.x +=
                mx *
                p.speed *
                dt;

            p.y +=
                my *
                p.speed *
                dt;

            p.angle =
                Math.atan2(my, mx);
        }

        /* Keep player inside room */

        const margin = 30;

        p.x = clamp(
            p.x,
            margin,
            canvas.clientWidth - margin
        );

        p.y = clamp(
            p.y,
            75,
            canvas.clientHeight - margin
        );

        if (p.invincible > 0) {
            p.invincible -= dt;
        }
    }

    /* =====================================================
       ZOMBIE AI
    ===================================================== */

    function updateZombies(dt) {

        const p = state.player;

        state.zombies.forEach(z => {

            const dx = p.x - z.x;
            const dy = p.y - z.y;

            const d =
                Math.hypot(dx, dy);

            if (d > 1) {

                z.x +=
                    (dx / d) *
                    z.speed *
                    dt;

                z.y +=
                    (dy / d) *
                    z.speed *
                    dt;
            }

            if (z.attackCooldown > 0) {
                z.attackCooldown -= dt;
            }

            if (
                d <
                z.radius + p.radius + 5 &&
                z.attackCooldown <= 0
            ) {

                if (p.invincible <= 0) {

                    p.hp -= z.damage;

                    p.hp = Math.max(
                        0,
                        p.hp
                    );

                    p.invincible = 35;

                    createHitParticles(
                        p.x,
                        p.y
                    );

                    playSound("zombie");
                }

                z.attackCooldown = 50;
            }

            z.x = clamp(
                z.x,
                25,
                canvas.clientWidth - 25
            );

            z.y = clamp(
                z.y,
                75,
                canvas.clientHeight - 25
            );
        });
    }

    /* =====================================================
       360° ATTACK
    ===================================================== */

    function attack() {

        if (
            !state.running ||
            state.paused ||
            state.gameOver ||
            !state.player
        ) {
            return;
        }

        const p = state.player;

        /* Zombie side uses bite */

        if (state.selectedSide === "zombie") {

            zombieAttack();

            return;
        }

        let angle =
            state.joystick.angle;

        /*
           If joystick is not currently moving,
           keep the last direction.
        */

        if (
            Math.abs(
                state.joystick.x
            ) < 0.05 &&
            Math.abs(
                state.joystick.y
            ) < 0.05
        ) {
            angle = p.angle;
        }

        const weapon =
            weapons.find(
                w => w.id === currentWeapon
            ) || weapons[0];

        const speed =
            weapon.speed;

        state.projectiles.push({

            x:
                p.x +
                Math.cos(angle) * 28,

            y:
                p.y +
                Math.sin(angle) * 28,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            radius: 7,

            damage:
                weapon.damage,

            life: 80,

            color:
                weapon.color
        });

        p.angle = angle;

        createThrowParticles(
            p.x +
            Math.cos(angle) * 25,

            p.y +
            Math.sin(angle) * 25,

            weapon.color
        );

        playSound("throw");
    }

    /* =====================================================
       ZOMBIE ATTACK
    ===================================================== */

    function zombieAttack() {

        const p = state.player;

        let target = null;
        let closest = Infinity;

        state.zombies.forEach(z => {

            const d =
                distance(
                    p.x,
                    p.y,
                    z.x,
                    z.y
                );

            if (
                d <
                closest &&
                d < 70
            ) {

                closest = d;
                target = z;
            }
        });

        if (target) {

            target.hp -= 45;

            createHitParticles(
                target.x,
                target.y
            );

            if (target.hp <= 0) {

                const index =
                    state.zombies.indexOf(
                        target
                    );

                if (index !== -1) {
                    state.zombies.splice(
                        index,
                        1
                    );
                }

                state.score += 20;
                state.coins += 5;
            }

            playSound("hit");
        }
    }

    /* =====================================================
       PROJECTILES
    ===================================================== */

    function updateProjectiles(dt) {

        for (
            let i = state.projectiles.length - 1;
            i >= 0;
            i--
        ) {

            const bullet =
                state.projectiles[i];

            bullet.x +=
                bullet.vx * dt;

            bullet.y +=
                bullet.vy * dt;

            bullet.life -= dt;

            let remove = false;

            if (
                bullet.life <= 0 ||
                bullet.x < -20 ||
                bullet.y < 50 ||
                bullet.x >
                    canvas.clientWidth + 20 ||
                bullet.y >
                    canvas.clientHeight + 20
            ) {
                remove = true;
            }

            if (!remove) {

                for (
                    let j = state.zombies.length - 1;
                    j >= 0;
                    j--
                ) {

                    const z =
                        state.zombies[j];

                    if (
                        distance(
                            bullet.x,
                            bullet.y,
                            z.x,
                            z.y
                        ) <
                        bullet.radius +
                        z.radius
                    ) {

                        z.hp -=
                            bullet.damage;

                        createHitParticles(
                            z.x,
                            z.y
                        );

                        playSound("hit");

                        remove = true;

                        if (z.hp <= 0) {

                            state.zombies.splice(
                                j,
                                1
                            );

                            state.score += 10;
                            state.coins += 3;
                        }

                        break;
                    }
                }
            }

            if (remove) {
                state.projectiles.splice(
                    i,
                    1
                );
            }
        }
    }

    /* =====================================================
       HEALTH REGEN
       +10 every 10 seconds
    ===================================================== */

    function healthRegeneration(dt) {

        if (
            !state.player ||
            state.player.hp >=
                state.player.maxHp
        ) {
            state.regenTimer = 0;
            return;
        }

        state.regenTimer +=
            dt * 16.67;

        if (
            state.regenTimer >= 10000
        ) {

            state.regenTimer = 0;

            state.player.hp =
                Math.min(
                    state.player.maxHp,
                    state.player.hp + 10
                );
        }
    }

    /* =====================================================
       PARTICLES
    ===================================================== */

    function createHitParticles(x, y) {

        for (let i = 0; i < 8; i++) {

            const angle =
                Math.random() *
                Math.PI * 2;

            const speed =
                1 +
                Math.random() * 2;

            state.particles.push({

                x,
                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                life: 22,

                size:
                    2 +
                    Math.random() * 3,

                color:
                    "#ff667d"
            });
        }
    }

    function createThrowParticles(
        x,
        y,
        color
    ) {

        for (let i = 0; i < 4; i++) {

            state.particles.push({

                x,
                y,

                vx:
                    (Math.random() - .5) * 2,

                vy:
                    (Math.random() - .5) * 2,

                life: 14,

                size: 2,

                color
            });
        }
    }

    function updateParticles(dt) {

        for (
            let i = state.particles.length - 1;
            i >= 0;
            i--
        ) {

            const p =
                state.particles[i];

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            p.life -= dt;

            if (p.life <= 0) {
                state.particles.splice(
                    i,
                    1
                );
            }
        }
    }

    /* =====================================================
       DRAW
    ===================================================== */

    function draw() {

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        ctx.clearRect(
            0,
            0,
            w,
            h
        );

        drawRoom(w, h);

        state.projectiles.forEach(
            drawProjectile
        );

        state.zombies.forEach(
            drawZombie
        );

        if (state.player) {
            drawPlayer(
                state.player
            );
        }

        state.particles.forEach(
            drawParticle
        );

        drawLevelEffects(w, h);
    }

    /* =====================================================
       CLASSROOM
    ===================================================== */

    function drawRoom(w, h) {

        /* Floor */

        ctx.fillStyle =
            levelFloorColor();

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        /* Tiles */

        ctx.strokeStyle =
            "rgba(40,40,40,.18)";

        ctx.lineWidth = 1;

        const tile = 64;

        for (
            let x = 0;
            x < w;
            x += tile
        ) {

            ctx.beginPath();
            ctx.moveTo(x, 60);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        for (
            let y = 60;
            y < h;
            y += tile
        ) {

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        /* Top wall */

        ctx.fillStyle =
            "#25272b";

        ctx.fillRect(
            0,
            0,
            w,
            60
        );

        /* Blackboard */

        ctx.fillStyle =
            "#182a24";

        ctx.fillRect(
            25,
            72,
            Math.min(
                400,
                w * .52
            ),
            105
        );

        ctx.strokeStyle =
            "#a77a45";

        ctx.lineWidth = 7;

        ctx.strokeRect(
            25,
            72,
            Math.min(
                400,
                w * .52
            ),
            105
        );

        ctx.fillStyle =
            "rgba(255,255,255,.5)";

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "WELCOME SA NIHS 😂",
            50,
            125
        );

        /* TV */

        const tvX =
            Math.max(
                w - 170,
                w * .72
            );

        ctx.fillStyle =
            "#171717";

        ctx.fillRect(
            tvX,
            85,
            115,
            75
        );

        ctx.fillStyle =
            "#354b75";

        ctx.fillRect(
            tvX + 10,
            95,
            95,
            55
        );

        ctx.fillStyle =
            "#333";

        ctx.fillRect(
            tvX + 48,
            160,
            20,
            18
        );

        drawFurniture(w, h);
    }

    function levelFloorColor() {

        const colors = [
            "#77736b",
            "#6d7772",
            "#77706a",
            "#696f7a",
            "#746d79",
            "#606e69"
        ];

        return colors[
            (state.level - 1) %
            colors.length
        ];
    }

    /* =====================================================
       DIFFERENT CLASSROOMS
    ===================================================== */

    function drawFurniture(w, h) {

        const layouts = [

            [
                [110, 220],
                [310, 240],
                [500, 210],
                [220, 480]
            ],

            [
                [90, 230],
                [300, 230],
                [510, 230],
                [180, 470],
                [430, 470]
            ],

            [
                [130, 220],
                [350, 220],
                [180, 430],
                [460, 430]
            ],

            [
                [90, 250],
                [280, 250],
                [470, 250],
                [180, 500],
                [420, 500]
            ],

            [
                [120, 230],
                [360, 230],
                [150, 470],
                [400, 470]
            ],

            [
                [80, 240],
                [250, 240],
                [420, 240],
                [170, 460],
                [390, 460]
            ]
        ];

        const layout =
            layouts[
                (state.level - 1) %
                layouts.length
            ];

        layout.forEach(
            ([x, y]) => drawDesk(
                x,
                y
            )
        );
    }

    function drawDesk(x, y) {

        ctx.fillStyle =
            "#754d32";

        ctx.fillRect(
            x,
            y,
            120,
            65
        );

        ctx.fillStyle =
            "#4a2d1d";

        ctx.fillRect(
            x + 10,
            y + 65,
            12,
            40
        );

        ctx.fillRect(
            x + 98,
            y + 65,
            12,
            40
        );

        /* chair */

        ctx.fillStyle =
            "#65442e";

        ctx.fillRect(
            x + 130,
            y + 18,
            48,
            50
        );

        ctx.fillRect(
            x + 138,
            y + 68,
            9,
            38
        );

        ctx.fillRect(
            x + 168,
            y + 68,
            9,
            38
        );
    }

    /* =====================================================
       DRAW PLAYER
    ===================================================== */

    function drawPlayer(p) {

        ctx.save();

        if (
            p.invincible > 0 &&
            Math.floor(
                p.invincible / 4
            ) % 2 === 0
        ) {
            ctx.globalAlpha = .45;
        }

        if (
            state.selectedSide ===
            "zombie"
        ) {

            drawZombieCharacter(
                p.x,
                p.y,
                p.color,
                state.selectedCharacter
            );

        } else {

            drawHumanCharacter(
                p.x,
                p.y,
                p.color,
                state.selectedCharacter
            );
        }

        /* Aim line */

        const aimX =
            p.x +
            Math.cos(p.angle) *
            38;

        const aimY =
            p.y +
            Math.sin(p.angle) *
            38;

        ctx.strokeStyle =
            "rgba(255,255,255,.22)";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            p.x,
            p.y
        );

        ctx.lineTo(
            aimX,
            aimY
        );

        ctx.stroke();

        ctx.restore();
    }

    function drawHumanCharacter(
        x,
        y,
        color,
        character
    ) {

        /* Body */

        ctx.fillStyle = color;

        ctx.fillRect(
            x - 19,
            y - 2,
            38,
            38
        );

        /* Head */

        ctx.fillStyle =
            "#d99b73";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 22,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* Hair */

        ctx.fillStyle =
            character.gender === "Female"
                ? "#30201b"
                : "#211b19";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 27,
            17,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();

        /* Eyes */

        ctx.fillStyle = "#fff";

        ctx.beginPath();

        ctx.arc(
            x - 6,
            y - 22,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 6,
            y - 22,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#111";

        ctx.beginPath();

        ctx.arc(
            x - 6,
            y - 22,
            1.5,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 6,
            y - 22,
            1.5,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    function drawZombieCharacter(
        x,
        y,
        color
    ) {

        ctx.fillStyle = color;

        ctx.fillRect(
            x - 19,
            y - 2,
            38,
            40
        );

        ctx.fillStyle =
            "#75aa75";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 23,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* Eyes */

        ctx.fillStyle = "#fff";

        ctx.beginPath();

        ctx.arc(
            x - 7,
            y - 25,
            6,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 7,
            y - 25,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#111";

        ctx.beginPath();

        ctx.arc(
            x - 7,
            y - 25,
            2,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 7,
            y - 25,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    /* =====================================================
       DRAW ZOMBIE
    ===================================================== */

    function drawZombie(z) {

        /* Health bar */

        const barW = 75;
        const barH = 7;

        ctx.fillStyle =
            "#35151c";

        ctx.fillRect(
            z.x - barW / 2,
            z.y - 48,
            barW,
            barH
        );

        ctx.fillStyle =
            "#ff4855";

        ctx.fillRect(
            z.x - barW / 2,
            z.y - 48,
            barW *
                (z.hp / z.maxHp),
            barH
        );

        drawZombieCharacter(
            z.x,
            z.y,
            z.color,
            {
                gender: "Male"
            }
        );
    }

    /* =====================================================
       DRAW PROJECTILE
    ===================================================== */

    function drawProjectile(b) {

        ctx.fillStyle =
            b.color;

        ctx.beginPath();

        ctx.arc(
            b.x,
            b.y,
            b.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /* =====================================================
       DRAW PARTICLE
    ===================================================== */

    function drawParticle(p) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / 22
            );

        ctx.fillStyle =
            p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha = 1;
    }

    /* =====================================================
       LEVEL EFFECTS
    ===================================================== */

    function drawLevelEffects(w, h) {

        ctx.fillStyle =
            "rgba(0,0,0,.15)";

        ctx.fillRect(
            0,
            0,
            w,
            4
        );
    }

    /* =====================================================
       LEVEL COMPLETE
    ===================================================== */

    function completeLevel() {

        state.levelTransition = true;

        if (
            state.level === 3 &&
            ASSETS.videos.level3
        ) {

            playLevelVideo(
                ASSETS.videos.level3,
                () => nextLevel()
            );

        } else {

            setTimeout(
                nextLevel,
                1200
            );
        }
    }

    function nextLevel() {

        state.levelTransition = false;

        if (
            state.level >=
            state.maxLevel
        ) {

            completeGame();

            return;
        }

        state.level++;

        createLevel();

        showMessage(
            "LEVEL " +
            state.level +
            "!",
            1200
        );
    }

    /* =====================================================
       COMPLETE GAME
    ===================================================== */

    function completeGame() {

        state.running = false;

        if (
            ASSETS.videos.complete
        ) {

            playLevelVideo(
                ASSETS.videos.complete,
                () => {
                    showScreen(titleScreen);
                }
            );

        } else {

            showMessage(
                "🎉 CONGRATULATIONS!",
                2500
            );

            setTimeout(
                () => showScreen(titleScreen),
                2500
            );
        }
    }

    /* =====================================================
       GAME OVER
    ===================================================== */

    function triggerGameOver() {

        if (state.gameOver) return;

        state.gameOver = true;
        state.running = false;

        stopBackgroundMusic();

        playSound("defeat");

        showScreen(gameOverScreen);

        const video =
            $("gameOverVideo");

        if (video) {

            video.currentTime = 0;

            if (
                ASSETS.videos.gameOver
            ) {
                video.src =
                    ASSETS.videos.gameOver;
            }

            video.volume =
                state.settings.volume /
                100;

            video.play().catch(
                () => {}
            );
        }
    }

    /* =====================================================
       GAME OVER VIDEO
    ===================================================== */

    $("skipVideoBtn")?.addEventListener(
        "click",
        skipGameOverVideo
    );

    function skipGameOverVideo() {

        const video =
            $("gameOverVideo");

        if (video) {
            video.pause();
            video.currentTime =
                video.duration || 0;
        }

        showGameOverButtons();
    }

    $("gameOverVideo")?.addEventListener(
        "ended",
        showGameOverButtons
    );

    function showGameOverButtons() {

        $("replayBtn")?.classList.remove(
            "hidden"
        );

        $("menuBtn")?.classList.remove(
            "hidden"
        );
    }

    $("replayBtn")?.addEventListener(
        "click",
        () => {

            state.gameOver = false;
            state.running = true;
            state.level = 1;
            state.score = 0;

            showScreen(gameScreen);

            createPlayer();
            createLevel();

            resizeCanvas();

            playBackgroundMusic();

            state.lastTime =
                performance.now();

            requestAnimationFrame(
                gameLoop
            );
        }
    );

    $("menuBtn")?.addEventListener(
        "click",
        () => {

            state.running = false;

            const video =
                $("gameOverVideo");

            if (video) {
                video.pause();
            }

            showScreen(titleScreen);
        }
    );

    /* =====================================================
       LEVEL VIDEO
    ===================================================== */

    function playLevelVideo(
        src,
        callback
    ) {

        const overlay =
            $("levelVideoOverlay");

        const video =
            $("levelVideo");

        if (
            !overlay ||
            !video ||
            !src
        ) {

            callback?.();

            return;
        }

        state.paused = true;

        overlay.classList.remove(
            "hidden"
        );

        video.src = src;

        video.currentTime = 0;

        video.volume =
            state.settings.volume /
            100;

        video.play().catch(
            () => {}
        );

        const finish = () => {

            video.pause();

            overlay.classList.add(
                "hidden"
            );

            video.onended = null;

            state.paused = false;

            callback?.();
        };

        video.onended = finish;

        $("skipLevelVideo")?.addEventListener(
            "click",
            finish,
            {
                once: true
            }
        );
    }

    /* =====================================================
       PAUSE
    ===================================================== */

    $("pauseBtn")?.addEventListener(
        "click",
        pauseGame
    );

    $("resumeBtn")?.addEventListener(
        "click",
        resumeGame
    );

    $("restartBtn")?.addEventListener(
        "click",
        () => {

            pausePanel?.classList.add(
                "hidden"
            );

            state.paused = false;
            state.level = 1;
            state.score = 0;

            createPlayer();
            createLevel();
        }
    );

    $("backMenuBtn")?.addEventListener(
        "click",
        () => {

            state.running = false;
            state.paused = false;

            pausePanel?.classList.add(
                "hidden"
            );

            stopBackgroundMusic();

            showScreen(titleScreen);
        }
    );

    function pauseGame() {

        if (
            !state.running ||
            state.gameOver
        ) {
            return;
        }

        state.paused = true;

        pausePanel?.classList.remove(
            "hidden"
        );
    }

    function resumeGame() {

        state.paused = false;

        pausePanel?.classList.add(
            "hidden"
        );

        state.lastTime =
            performance.now();
    }

    /* =====================================================
       SHOP
    ===================================================== */

    $("shopBtn")?.addEventListener(
        "click",
        openShop
    );

    $("closeShop")?.addEventListener(
        "click",
        closeShop
    );

    function openShop() {

        if (
            state.paused ||
            state.gameOver
        ) {
            return;
        }

        state.paused = true;

        shopModal?.classList.remove(
            "hidden"
        );

        renderShop();
    }

    function closeShop() {

        state.paused = false;

        shopModal?.classList.add(
            "hidden"
        );
    }

    function renderShop() {

        const box =
            $("shopItems");

        if (!box) return;

        box.innerHTML = "";

        weapons.forEach(
            weapon => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "item";

                const owned =
                    ownedWeapons.includes(
                        weapon.id
                    );

                item.innerHTML = `
                    <b>${weapon.name}</b>
                    <span>
                        DAMAGE:
                        ${weapon.damage}
                    </span>
                    <br>
                    <small>
                        ${
                            owned
                                ? "OWNED"
                                : "🪙 " +
                                  weapon.price
                        }
                    </small>
                `;

                item.addEventListener(
                    "click",
                    () => {

                        if (owned) {

                            currentWeapon =
                                weapon.id;

                            updateWeaponUI();

                            return;
                        }

                        if (
                            state.coins >=
                            weapon.price
                        ) {

                            state.coins -=
                                weapon.price;

                            ownedWeapons.push(
                                weapon.id
                            );

                            localStorage.setItem(
                                "nihsWeapons",
                                JSON.stringify(
                                    ownedWeapons
                                )
                            );

                            currentWeapon =
                                weapon.id;

                            renderShop();

                            updateHUD();
                            updateWeaponUI();

                        } else {

                            showMessage(
                                "KULANG ANG COINS 😂",
                                1000
                            );
                        }
                    }
                );

                box.appendChild(item);
            }
        );
    }

    /* =====================================================
       WEAPON UI
    ===================================================== */

    function updateWeaponUI() {

        const weapon =
            weapons.find(
                w => w.id === currentWeapon
            ) || weapons[0];

        if ($("weaponName")) {
            $("weaponName").textContent =
                weapon.name;
        }

        if ($("weaponDamage")) {
            $("weaponDamage").textContent =
                "DAMAGE: " +
                weapon.damage;
        }
    }

    /* =====================================================
       HUD
    ===================================================== */

    function updateHUD() {

        if (!state.player) return;

        if ($("hpText")) {
            $("hpText").textContent =
                "❤️ " +
                Math.ceil(
                    state.player.hp
                );
        }

        if ($("levelText")) {
            $("levelText").textContent =
                "LV " +
                state.level;
        }

        if ($("coinText")) {
            $("coinText").textContent =
                "🪙 " +
                state.coins;
        }

        if ($("scoreText")) {
            $("scoreText").textContent =
                "⭐ " +
                state.score;
        }

        if ($("enemyText")) {
            $("enemyText").textContent =
                "👾 " +
                state.zombies.length;
        }

        if ($("roomTitle")) {
            $("roomTitle").textContent =
                "CLASSROOM " +
                state.level;
        }

        updateWeaponUI();
    }

    /* =====================================================
       SETTINGS
    ===================================================== */

    function loadSettingsUI() {

        const slider =
            $("volumeSlider");

        const value =
            $("volumeValue");

        const toggle =
            $("soundToggle");

        if (slider) {
            slider.value =
                state.settings.volume;
        }

        if (value) {
            value.textContent =
                state.settings.volume +
                "%";
        }

        if (toggle) {
            toggle.textContent =
                state.settings.sound
                    ? "ON"
                    : "OFF";
        }
    }

    $("volumeSlider")?.addEventListener(
        "input",
        e => {

            state.settings.volume =
                Number(e.target.value);

            localStorage.setItem(
                "nihsVolume",
                state.settings.volume
            );

            $("volumeValue").textContent =
                state.settings.volume +
                "%";

            setAllAudioVolume();
        }
    );

    $("soundToggle")?.addEventListener(
        "click",
        () => {

            state.settings.sound =
                !state.settings.sound;

            localStorage.setItem(
                "nihsSound",
                state.settings.sound
                    ? "on"
                    : "off"
            );

            loadSettingsUI();
        }
    );

    /* =====================================================
       AUDIO
    ===================================================== */

    function setAllAudioVolume() {

        document
            .querySelectorAll("audio, video")
            .forEach(media => {

                media.volume =
                    state.settings.volume /
                    100;
            });
    }

    function playSound(name) {

        if (!state.settings.sound) {
            return;
        }

        const audioMap = {
            yawa: $("yawaSound"),
            throw: $("throwSound"),
            hit: $("hitSound"),
            zombie: $("zombieSound"),
            defeat: $("defeatSound")
        };

        const audio =
            audioMap[name];

        if (!audio) return;

        if (!audio.src) return;

        audio.currentTime = 0;

        audio.volume =
            state.settings.volume /
            100;

        audio.play().catch(
            () => {}
        );
    }

    function playBackgroundMusic() {

        if (!state.settings.sound) {
            return;
        }

        const music =
            $("bgMusic");

        if (!music) return;

        if (!music.src) return;

        music.volume =
            state.settings.volume /
            100;

        music.play().catch(
            () => {}
        );
    }

    function stopBackgroundMusic() {

        const music =
            $("bgMusic");

        if (!music) return;

        music.pause();

        music.currentTime = 0;
    }

    /* =====================================================
       SINGLE JOYSTICK
       FULL 360 DEGREES
    ===================================================== */

    let joystickCenter = {
        x: 0,
        y: 0
    };

    function getJoystickCenter() {

        const rect =
            joystick.getBoundingClientRect();

        joystickCenter.x =
            rect.left +
            rect.width / 2;

        joystickCenter.y =
            rect.top +
            rect.height / 2;
    }

    function updateJoystick(
        clientX,
        clientY
    ) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width / 2;

        const centerY =
            rect.top +
            rect.height / 2;

        let dx =
            clientX - centerX;

        let dy =
            clientY - centerY;

        const max =
            rect.width * .31;

        const rawDistance =
            Math.hypot(
                dx,
                dy
            );

        const angle =
            Math.atan2(
                dy,
                dx
            );

        if (
            rawDistance > max
        ) {

            dx =
                Math.cos(angle) *
                max;

            dy =
                Math.sin(angle) *
                max;
        }

        const strength =
            Math.min(
                rawDistance / max,
                1
            );

        state.joystick.x =
            dx / max;

        state.joystick.y =
            dy / max;

        state.joystick.strength =
            strength;

        state.joystick.angle =
            angle;

        /* Move visual stick */

        joystickStick.style.transform =
            `translate(
                calc(-50% + ${dx}px),
                calc(-50% + ${dy}px)
            )`;

        /* IMPORTANT:
           same joystick controls aim.
        */

        if (state.player && strength > .08) {
            state.player.angle =
                angle;
        }
    }

    function resetJoystick() {

        state.joystick.active = false;
        state.joystick.pointerId = null;

        state.joystick.x = 0;
        state.joystick.y = 0;
        state.joystick.strength = 0;

        joystickStick.style.transform =
            "translate(-50%, -50%)";
    }

    joystick?.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            state.joystick.active = true;
            state.joystick.pointerId =
                e.pointerId;

            joystick.setPointerCapture(
                e.pointerId
            );

            getJoystickCenter();

            updateJoystick(
                e.clientX,
                e.clientY
            );
        }
    );

    joystick?.addEventListener(
        "pointermove",
        e => {

            if (
                !state.joystick.active ||
                e.pointerId !==
                    state.joystick.pointerId
            ) {
                return;
            }

            e.preventDefault();

            updateJoystick(
                e.clientX,
                e.clientY
            );
        }
    );

    joystick?.addEventListener(
        "pointerup",
        e => {

            if (
                e.pointerId ===
                state.joystick.pointerId
            ) {
                resetJoystick();
            }
        }
    );

    joystick?.addEventListener(
        "pointercancel",
        resetJoystick
    );

    joystick?.addEventListener(
        "lostpointercapture",
        resetJoystick
    );

    /* =====================================================
       ATTACK BUTTON
    ===================================================== */

    attackBtn?.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            attack();
        }
    );

    /* =====================================================
       KEYBOARD
    ===================================================== */

    window.addEventListener(
        "keydown",
        e => {

            state.keys[e.key] = true;

            if (
                e.code === "Space"
            ) {

                e.preventDefault();

                attack();
            }

            if (
                e.key === "Escape"
            ) {

                if (
                    state.screen ===
                    gameScreen
                ) {

                    if (
                        state.paused
                    ) {
                        resumeGame();
                    } else {
                        pauseGame();
                    }
                }
            }
        }
    );

    window.addEventListener(
        "keyup",
        e => {
            state.keys[e.key] = false;
        }
    );

    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(
        text,
        duration = 1500
    ) {

        const message =
            document.createElement(
                "div"
            );

        message.textContent = text;

        Object.assign(
            message.style,
            {
                position: "fixed",
                left: "50%",
                top: "50%",
                transform:
                    "translate(-50%,-50%)",
                zIndex: "9999",
                padding: "18px 28px",
                borderRadius: "18px",
                background:
                    "rgba(20,8,30,.94)",
                border:
                    "2px solid #c45cff",
                color: "#fff",
                fontSize: "25px",
                fontWeight: "900",
                textAlign: "center",
                boxShadow:
                    "0 0 30px rgba(196,92,255,.5)",
                pointerEvents: "none"
            }
        );

        document.body.appendChild(
            message
        );

        setTimeout(() => {

            message.style.transition =
                "opacity .3s";

            message.style.opacity = "0";

            setTimeout(
                () =>
                    message.remove(),
                350
            );

        }, duration);
    }

    /* =====================================================
       MATH HELPERS
    ===================================================== */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );
    }

    function distance(
        x1,
        y1,
        x2,
        y2
    ) {

        return Math.hypot(
            x2 - x1,
            y2 - y1
        );
    }

    /* =====================================================
       MOBILE SAFETY
    ===================================================== */

    document.addEventListener(
        "contextmenu",
        e => {

            if (
                state.screen ===
                gameScreen
            ) {
                e.preventDefault();
            }
        }
    );

    document.addEventListener(
        "touchmove",
        e => {

            if (
                state.screen ===
                gameScreen
            ) {
                e.preventDefault();
            }

        },
        {
            passive: false
        }
    );

    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        state.settings.volume =
            Number(
                localStorage.getItem(
                    "nihsVolume"
                ) || 80
            );

        state.settings.sound =
            localStorage.getItem(
                "nihsSound"
            ) !== "off";

        setAllAudioVolume();

        if ($("replayBtn")) {
            $("replayBtn")
                .classList.remove(
                    "hidden"
                );
        }

        if ($("menuBtn")) {
            $("menuBtn")
                .classList.remove(
                    "hidden"
                );
        }

        updateCharacterGrid();

        updateWeaponUI();

        resizeCanvas();

        /*
           Start the intro automatically.
        */

        startIntro();
    }

    initialize();

})();
