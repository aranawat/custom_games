// ==========================================
// ⚙️ CUSTOM SETUP - CONFIGURATION HUB
// ==========================================
const categories = [
    { desc: "FAVORITE DESSERTS", words: ["CAKE", "COOKIES", "ICECREAM", "PIE"] },
    { desc: "PLACES WE VISITED", words: ["PARIS", "TOKYO", "LONDON", "NEWYORK"] },
    { desc: "DOG BREEDS", words: ["PUG", "LABRADOR", "POODLE", "CORGI"] },
    { desc: "THINGS THAT ARE BLUE", words: ["SKY", "OCEAN", "JEANS", "BERRY"] }
];

const SECRET_WORD = "HEART"; // Wordle answer key

// ==========================================
// ⚙️ CUSTOM SETUP - 5x5 CROSSWORD DESIGN HUB
// ==========================================
// The Solution Map: Interlocks HELLO, HEART, LUNCH, and TRUCK
// Custom 5x5 Crossword Blueprint Solutions
const CROSSWORD_SOLUTION = [
    ['H', 'E', 'L', 'L', 'O'],
    ['E', 'X', 'U', 'X', 'X'],
    ['A', 'X', 'N', 'X', 'X'],
    ['R', 'X', 'C', 'X', 'X'],
    ['T', 'R', 'U', 'C', 'K']
];

// 🎯 COMPLETELY FIXED MATRIX: Every row has explicit column integers
const CROSSWORD_NUMBERS_RAW = [
    "1, 2, 3, 0, 0",
    "4, 0, 0, 0, 0",
    "0, 0, 0, 0, 0",
    "0, 0, 0, 0, 0",
    "5, 0, 0, 0, 0"
];

// Convert the safe string strings back into an executable grid layout object instantly
const CROSSWORD_NUMBERS = CROSSWORD_NUMBERS_RAW.map(rowStr => 
    rowStr.split(",").map(numStr => parseInt(numStr.trim()))
);

// Clue strings mapped cleanly to coordinates
const CROSSWORD_CLUES = {
    "1-Across": "A standard greeting or friendly welcome 👋",
    "5-Across": "Large vehicle used for carrying heavy cargo 🚚",
    "1-Down": "The symbol of love, or the answer to our Wordle game! ❤️",
    "2-Down": "Midday meal eaten between breakfast and dinner 🥪",
    "3-Down": "Midday meal eaten between breakfast and dinner 🥪" // Shared tracking coordinate
};


// ==========================================
// 🔄 UNIVERSAL CORE OPERATIONS
// ==========================================
let isAnimating = false;

function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function switchScreen(screenId) {
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("connections-screen").classList.add("hidden");
    document.getElementById("wordle-screen").classList.add("hidden");
    document.getElementById("crossword-screen").classList.add("hidden");
    document.getElementById(screenId).classList.remove("hidden");
}

// ==========================================
// 🧩 CONNECTIONS MODULE
// ==========================================
let allWords = [], selectedWords = [], mistakesLeft = 4, solvedCategories = [];
const gridElement = document.getElementById("grid");
const submitBtn = document.getElementById("submit-btn");
const mistakesElement = document.getElementById("mistakes");

function initConnections() {
    allWords = [];
    categories.forEach((cat, index) => {
        cat.words.forEach(word => allWords.push({ text: word, catIndex: index }));
    });
    allWords.sort(() => Math.random() - 0.5);
        // Connect your new Shuffle Button trigger rule
    const shuffleBtn = document.getElementById("shuffle-btn");
    if (shuffleBtn) {
        shuffleBtn.onclick = () => {
            // Randomly scrambles ONLY the remaining unsolved items
            allWords.sort(() => Math.random() - 0.5);
            renderGrid();
        };
    }
    renderGrid();
}

function renderGrid() {
    gridElement.innerHTML = "";
    solvedCategories.forEach(catIndex => {
        const cat = categories[catIndex];
        const banner = document.createElement("div");
        banner.className = `card solved-${catIndex}`;
        banner.style.gridColumn = "span 4";
        banner.style.display = "flex";
        banner.style.flexDirection = "column";
        banner.style.justifyContent = "center";
        banner.style.alignItems = "center";
        banner.style.textAlign = "center";
        banner.innerHTML = `<strong>${cat.desc}</strong><br>${cat.words.join(", ")}`;
        gridElement.appendChild(banner);
    });

    allWords.forEach(wordObj => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerText = wordObj.text;
        if (selectedWords.includes(wordObj)) card.classList.add("selected");
        card.addEventListener("click", () => selectWord(wordObj));
        gridElement.appendChild(card);
    });
}

function selectWord(wordObj) {
    if (selectedWords.includes(wordObj)) {
        selectedWords = selectedWords.filter(w => w !== wordObj);
    } else if (selectedWords.length < 4) {
        selectedWords.push(wordObj);
    }
    submitBtn.disabled = selectedWords.length !== 4;
    renderGrid();
}

submitBtn.onclick = () => {
    if (selectedWords.length !== 4) return;
    const firstCat = selectedWords[0].catIndex;
    const isCorrect = selectedWords.every(w => w.catIndex === firstCat);

    if (isCorrect) {
        solvedCategories.push(firstCat);
        allWords = allWords.filter(w => w.catIndex !== firstCat);
        selectedWords = [];
        if (solvedCategories.length === 4) setTimeout(() => showToast("🎉 You cleared Connections!"), 400);
    } else {
        mistakesLeft--;
        mistakesElement.innerText = `Mistakes remaining: ${"•".repeat(mistakesLeft)}`;
        showToast("❌ Wrong combination!");
        if (mistakesLeft===0){
            showToast("Game Over...");
            reveal_connections();
        }
            
    }
    submitBtn.disabled = true;
    renderGrid();
};

// Sequential helper function to create timing delays
//const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function reveal_connections() {
    // Disable inputs so the user cannot click anything during reveal animation
    submitBtn.disabled = true;
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => card.style.pointerEvents = "none");
    
    const shuffleBtn = document.getElementById("shuffle-btn");
    if (shuffleBtn) shuffleBtn.style.pointerEvents = "none";

    // Loop through all 4 categories sequentially using their original array indices
    for (let catIndex = 0; catIndex < categories.length; catIndex++) {
        
        // Skip it if the user already solved this category during regular gameplay
        if (solvedCategories.includes(catIndex)) continue;

        // 1. Pause for 1.2 seconds before revealing the next answer banner
        await delay(800);

        // 2. Add the missed category index to your solved tracker
        solvedCategories.push(catIndex);

        // 3. Purge this category's active words out of the remaining un-solved grid pool
        allWords = allWords.filter(w => w.catIndex !== catIndex);

        // 4. Force clear any currently selected letters to avoid grid breakage
        selectedWords = [];

        // 5. Trigger your existing UI refresh routine to animate the new banner into view
        renderGrid();
    }
}




// ==========================================
// 🟩 WORDLE MODULE
// ==========================================
let currentAttempt = 0, currentLetter = 0;
const maxAttempts = 6;
let wordleGrid = Array(maxAttempts).fill().map(() => Array(5).fill(""));

function initWordle() {
    const board = document.getElementById("wordle-board");
    board.innerHTML = "";
    for (let r = 0; r < maxAttempts; r++) {
        const row = document.createElement("div");
        row.className = "wordle-row";
        row.id = `row-${r}`;
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement("div");
            cell.className = "wordle-cell";
            cell.id = `cell-${r}-${c}`;
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
    buildKeyboard();
}

function buildKeyboard() {
    const kb = document.getElementById("keyboard");
    kb.innerHTML = "";
    const layout = [
        ["Q","W","E","R","T","Y","U","I","O","P"],
        ["A","S","D","F","G","H","J","K","L"],
        ["ENTER","Z","X","C","V","B","N","M","DELETE"]
    ];
    layout.forEach(rowArr => {
        const row = document.createElement("div");
        row.className = "keyboard-row";
        rowArr.forEach(key => {
            const btn = document.createElement("button");
            btn.innerText = key;
            btn.id = `key-${key}`;
            btn.className = "key" + (key === "ENTER" || key === "DELETE" ? " wide" : "");
            btn.onclick = () => handleKeyPress(key);
            row.appendChild(btn);
        });
        kb.appendChild(row);
    });
}

function handleKeyPress(key) {
    if (isAnimating || currentAttempt >= maxAttempts) return;

    if (key === "DELETE") {
        if (currentLetter > 0) {
            currentLetter--;
            wordleGrid[currentAttempt][currentLetter] = "";
            const cell = document.getElementById(`cell-${currentAttempt}-${currentLetter}`);
            cell.innerText = "";
            cell.classList.remove("toggled");
        }
    } else if (key === "ENTER") {
        if (currentLetter === 5) {
            (async () => {
                const isValid = await checkWordleRow();
                if (!isValid){
                    triggerRowShake();
                    return; // Stops execution if word is invalid
                    }

                    currentLetter = 0; // Reset letter pointer
            })();
        } else {
            showToast("Umm....missing something??");
            triggerRowShake();
        }
    } else {
        if (currentLetter < 5) {
            wordleGrid[currentAttempt][currentLetter] = key;
            const cell = document.getElementById(`cell-${currentAttempt}-${currentLetter}`);
            cell.innerText = key;
            cell.classList.add("toggled");
            currentLetter++;
        }
    }
}

function triggerRowShake() {
    const row = document.getElementById(`row-${currentAttempt}`);
    row.classList.add("shake");
    setTimeout(() => row.classList.remove("shake"), 500);
}

async function checkWordleRow() {
    if (isAnimating) return;
    const rowWords = wordleGrid[currentAttempt].join("").toLowerCase();
    
    if (rowWords !== SECRET_WORD.toLowerCase()) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${rowWords}`);
            if (!response.ok) {
                showToast("I dont think thats a word 🤦‍♂️");
                triggerRowShake();
                return false;
            }
        } catch (error) {
            console.warn("Dictionary API offline. Bypassing check.", error);
            showToast("Dictionary error. Try again.");
            triggerRowShake();
            return false;
        }
    }

    isAnimating = true;
    const secretArr = SECRET_WORD.toUpperCase().split("");
    const guessArr = rowWords.toUpperCase().split("");
    let revealDelay = 200;

    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        const letter = guessArr[i];
        
        setTimeout(() => {
            cell.classList.add("flip");
            setTimeout(() => {
                let statusClass = "absent";
                if (letter === secretArr[i]) statusClass = "correct";
                else if (secretArr.includes(letter)) statusClass = "present";
                cell.classList.add(statusClass);
                updateKeyboardKeyColor(letter, statusClass);
            }, 250);
        }, i * revealDelay);
    }

   if (rowWords.toUpperCase() === SECRET_WORD.toUpperCase()) {
        // Wait for tiles to finish flipping before showing win state toast
        setTimeout(() => {
            showToast("🎉 Spectacular!");
            currentAttempt = maxAttempts;
            isAnimating = false;
        }, 5 * revealDelay);
    } else {
        // Wait for tiles to finish flipping before incrementing the attempt row
        setTimeout(() => {
            currentAttempt++;
            isAnimating = false;
            if (currentAttempt === maxAttempts) {
                showToast(`Oh no! Game Over! Word was: ${SECRET_WORD.toUpperCase()}`);
            }
        }, 5 * revealDelay);
    }

    return true; // FIXED: Explicitly return true so the keypress handler blocks correctly
}

function updateKeyboardKeyColor(letter, targetStatus) {
    const keyElement = document.getElementById(`key-${letter}`);
    if (!keyElement) return;
    if (keyElement.classList.contains("correct")) return;
    if (keyElement.classList.contains("present") && targetStatus === "absent") return;
    keyElement.classList.remove("present", "absent", "correct");
    keyElement.classList.add(targetStatus);
}



// ==========================================
// 🧭 MINI CROSSWORD MODULE
// ==========================================
function initCrossword() {
    // Target the new 5x5 grid container element
    const container = document.getElementById("crossword-grid-5x5");
    container.innerHTML = "";

    // Run loops to calculate a complete 5x5 coordinate footprint (25 tiles total)
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const wrapper = document.createElement("div");
            wrapper.className = "cell-wrapper";
            wrapper.style.position = "relative";
            wrapper.style.width = "100%";
            wrapper.style.height = "100%";

            if (CROSSWORD_SOLUTION[r][c] === 'X') {
                const block = document.createElement("div");
                block.className = "crossword-cell black-block";
                wrapper.appendChild(block);
            } else {
                const input = document.createElement("input");
                input.className = "crossword-cell";
                input.type = "text";
                input.maxLength = 1;
                input.id = `cw-${r}-${c}`;
                input.style.width = "100%";
                input.style.height = "100%";
                input.style.zIndex = "1";

                // Autocomplete/History Blockers
                input.setAttribute("autocomplete", "off");
                input.setAttribute("autocorrect", "off");
                input.setAttribute("autocapitalize", "off");
                input.setAttribute("spellcheck", "false");

                if (CROSSWORD_NUMBERS[r][c] !== 0) {
                    const numLabel = document.createElement("span");
                    numLabel.className = "cell-number";
                    numLabel.innerText = CROSSWORD_NUMBERS[r][c];
                    wrapper.appendChild(numLabel);
                }

                input.addEventListener("focus", () => {
                    document.querySelectorAll(".crossword-cell").forEach(el => el.classList.remove("selected-cell"));
                    input.classList.add("selected-cell");
                    updateCrosswordClueDisplay(r, c);
                });

                input.addEventListener("input", () => {
                    input.value = input.value.toUpperCase();
                    // Auto-advance cursor rightwards if next tile isn't blocked
                    if (input.value && c < 4 && CROSSWORD_SOLUTION[r][c+1] !== 'X') {
                        document.getElementById(`cw-${r}-${c+1}`)?.focus();
                    }
                });

                wrapper.appendChild(input);
            }
            container.appendChild(wrapper);
        }
    }
    document.getElementById("check-crossword-btn").onclick = evaluateCrosswordPuzzle;
}

function updateCrosswordClueDisplay(r, c) {
    const clueDisplay = document.getElementById("clue-display");
    let cluesFound = [];

    // 1. Across Clues row position checking boundaries
    if (r === 0) cluesFound.push(`🧩 1-Across: ${CROSSWORD_CLUES["1-Across"]}`);
    if (r === 4) cluesFound.push(`🧩 5-Across: ${CROSSWORD_CLUES["5-Across"]}`);
    
    // 2. Down Clues column position checking boundaries
    if (c === 0) cluesFound.push(`🧩 1-Down: ${CROSSWORD_CLUES["1-Down"]}`);
    if (c === 1 && r === 4) cluesFound.push(`🧩 5-Across: ${CROSSWORD_CLUES["5-Across"]}`); // Cross intersection tracker
    if (c === 2) cluesFound.push(`🧩 2-Down: ${CROSSWORD_CLUES["2-Down"]}`);

    if (cluesFound.length > 0) {
        clueDisplay.innerHTML = cluesFound.join("<br><br>");
    } else {
        clueDisplay.innerText = "Tap a valid letter box square!";
    }
}

function evaluateCrosswordPuzzle() {
    let allCorrect = true;
    let missingInputs = false;

    // Check all 25 grid slots
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (CROSSWORD_SOLUTION[r][c] !== 'X') {
                const cell = document.getElementById(`cw-${r}-${c}`);
                const value = cell.value.trim().toUpperCase();

                cell.classList.remove("cw-correct", "cw-wrong");

                if (!value) {
                    missingInputs = true;
                    allCorrect = false;
                } else if (value === CROSSWORD_SOLUTION[r][c]) {
                    cell.classList.add("cw-correct");
                } else {
                    cell.classList.add("cw-wrong");
                    allCorrect = false;
                }
            }
        }
    }

    if (missingInputs) showToast("Fill in all the squares!");
    else if (allCorrect) showToast("🎉 Incredible! Custom Crossword Solved!");
    else showToast("❌ Some letters are incorrect.");
}


// Global initialization triggers
initConnections();
initWordle();
initCrossword();