// ==========================================
// ⚙️ CUSTOM SETUP - CONFIGURATION HUB
// ==========================================
const categories = [
    { desc: "PLACES YOU WANT TO GO", words: ["HONOLULU", "ANCHORAGE", "MIAMI", "LAS VEGAS"] },
    { desc: "PLACES YOU HAVE VACATIONED", words: ["DENVER", "CHARLESTON", "SAVANNAH", "NEWYORK"] },
    { desc: "FOOD YOU HAD IN NYC", words: ["PIZZA", "BAGELS", "FRIED RICE", "HOT CHOCOLATE"] },
    { desc: "INDIAN FAVORITES", words: ["PAV BHAJI", "MISAL PAV", "CHAAT", "DOSA"] }
];

const SECRET_WORD = "PURDUE"; // Wordle answer key

// ==========================================
// ⚙️ CUSTOM SETUP - 5x5 CROSSWORD DESIGN HUB
// ==========================================
// The Solution Map: Interlocks HELLO, HEART, LUNCH, and TRUCK
// Custom 5x5 Crossword Blueprint Solutions
const crosswordGridSolution  = [
    ['C', 'O', 'D', 'I', 'N', 'G', '.', 'J', 'A', 'M'],
    ['L', '.', '.', 'C', '.', 'R', '.', 'A', '.', 'O'],
    ['I', 'N', 'P', 'U', 'T', 'I', 'N', 'G', '.', 'U'],
    ['C', '.', '.', 'B', '.', 'D', '.', 'U', '.', 'S'],
    ['K', 'E', 'Y', 'B', 'O', 'A', 'R', 'D', '.', 'E'],
    ['.', '.', '.', 'E', '.', 'G', '.', '.', '.', '.'],
    ['S', 'C', 'R', 'E', 'E', 'N', '.', 'B', 'I', 'T'],
    ['H', '.', '.', '.', '.', 'I', '.', 'Y', '.', 'E'],
    ['I', 'N', 'T', 'E', 'R', 'N', 'E', 'T', '.', 'X'],
    ['F', '.', '.', '.', '.', 'G', '.', 'E', '.', 'T']
];

// 🎯 COMPLETELY FIXED MATRIX: Every row has explicit column integers
const CROSSWORD_NUMBERS_RAW = [
    "1, 2, 3, 0, 0, 0, 0, 0, 0, 0",
    "4, 0, 0, 0, 0, 0, 0, 0, 0, 0",
    "0, 0, 0, 0, 0, 0, 0, 0, 0, 0",
    "0, 0, 0, 0, 0, 0, 0, 0, 0, 0",
    "5, 0, 0, 0, 0, 0, 0, 0, 0, 0",
    "0, 0, 0, 0, 0, 0, 0, 0, 0, 0",
    "4, 0, 0, 0, 0, 0, 0, 0, 0, 0",
    "0, 0, 0, 0, 0, 0, 0, 0, 0, 0",
    "0, 0, 0, 0, 0, 0, 0, 0, 0, 0",
    "5, 0, 0, 0, 0, 0, 0, 0, 0, 0"
];

// Convert the safe string strings back into an executable grid layout object instantly
const CROSSWORD_NUMBERS = CROSSWORD_NUMBERS_RAW.map(rowStr => 
    rowStr.split(",").map(numStr => parseInt(numStr.trim()))
);

// Clue strings mapped cleanly to coordinates
const crosswordClues  = {
    across: [
        { number: 1, row: 0, col: 0, text: "Writing software instructions." },
        { number: 5, row: 0, col: 7, text: "Fruit preserve or stuck traffic." },
        { number: 6, row: 2, col: 0, text: "Entering data into a computer." },
        { number: 7, row: 4, col: 0, text: "Peripheral used for typing." },
        { number: 8, row: 6, col: 0, text: "Monitor display panel." },
        { number: 9, row: 6, col: 7, text: "Smallest unit of digital data." },
        { number: 10, row: 8, col: 0, text: "The World Wide Web." },
        { number: 12, row: 8, col: 9, text: "Unformatted text file layout extension." }
    ],
    down: [
        { number: 1, row: 0, col: 0, text: "Pressing a mouse button." },
        { number: 2, row: 0, col: 3, text: "Small graphic file or desktop shortcut." },
        { number: 3, row: 0, col: 5, text: "Line drawing or chart visualization." },
        { number: 4, row: 0, col: 7, text: "High-level programming language named after coffee." },
        { number: 5, row: 0, col: 9, text: "Handheld peripheral indicator controller." },
        { number: 11, row: 6, col: 0, text: "Keyboard modifier key for capitalizing letters." },
        { number: 13, row: 6, col: 7, text: "Binary unit containing 8 bits." }
    ]
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
let wordleGrid = Array(maxAttempts).fill().map(() => Array(6).fill(""));

function initWordle() {
    const board = document.getElementById("wordle-board");
    board.innerHTML = "";
    for (let r = 0; r < maxAttempts; r++) {
        const row = document.createElement("div");
        row.className = "wordle-row";
        row.id = `row-${r}`;
        for (let c = 0; c < 6; c++) {
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
        if (currentLetter === 6) {
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
        if (currentLetter < 6) {
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

    for (let i = 0; i < 6; i++) {
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
    const upperLetter = letter.toUpperCase();
    const keyElement = document.getElementById(`key-${upperLetter}`);
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
    const gridElement = document.getElementById("crossword-grid");
    const acrossContainer = document.getElementById("across-clues");
    const downContainer = document.getElementById("down-clues");
    
    // Safety exit check if container IDs are wrong
    if (!gridElement || !acrossContainer || !downContainer) return;
    
    gridElement.innerHTML = "";
    acrossContainer.innerHTML = "";
    downContainer.innerHTML = "";

    // 1. Build & Draw the 10x10 Grid Board Layout
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            const cellValue = crosswordGridSolution[r][c];
            const cell = document.createElement("div");
            cell.className = "crossword-cell";
            
            if (cellValue === '.') {
                cell.classList.add("black-block");
            } else {
                const input = document.createElement("input");
                input.type = "text";
                input.maxLength = 1;
                input.dataset.row = r;
                input.dataset.col = c;
                input.id = `cell-${r}-${c}`;
                
                // Form History Popup Protection Shields
                input.setAttribute("autocomplete", "off");
                input.setAttribute("autocorrect", "off");
                input.setAttribute("autocapitalize", "off");
                input.setAttribute("spellcheck", "false");
                
                // Advance typing cursor forward to the right automatically on key entry
                input.addEventListener("input", (e) => {
                    input.classList.remove("correct-cell", "incorrect-cell");
                    input.value = input.value.toUpperCase(); // Force letters uppercase
                    
                    if (e.target.value && c < 9 && crosswordGridSolution[r][c + 1] !== '.') {
                        const nextCell = document.getElementById(`cell-${r}-${c + 1}`);
                        if (nextCell) nextCell.focus();
                    }
                });

                cell.appendChild(input);
            }
            gridElement.appendChild(cell);
        }
    }

    // 2. Map Starting Micro Numbers into the Grid Cells
    const assignNumbers = (clueList) => {
        clueList.forEach(clue => {
            const cellInput = document.getElementById(`cell-${clue.row}-${clue.col}`);
            if (cellInput) {
                const cellParent = cellInput.parentElement;
                // Avoid duplicating if a square has both an Across and a Down clue start
                if (!cellParent.querySelector(".cell-number")) {
                    const numSpan = document.createElement("span");
                    numSpan.className = "cell-number";
                    numSpan.innerText = clue.number;
                    cellParent.appendChild(numSpan);
                }
            }
        });
    };
    assignNumbers(crosswordClues.across);
    assignNumbers(crosswordClues.down);

    // 3. Render Clue Text lists onto column UI buckets
    crosswordClues.across.forEach(c => {
        acrossContainer.innerHTML += `<li><strong>${c.number}.</strong> ${c.text}</li>`;
    });
    crosswordClues.down.forEach(c => {
        downContainer.innerHTML += `<li><strong>${c.number}.</strong> ${c.text}</li>`;
    });

    // 4. Hook up Verification Check Logic Engine Trigger
    const checkBtn = document.getElementById("check-crossword-btn");
    if (checkBtn) {
        checkBtn.onclick = checkCrosswordPuzzle;
    }
}

// ==========================================
// 🎛️ CROSSWORD VERIFICATION HANDLER
// ==========================================
function checkCrosswordPuzzle() {
    const inputs = document.querySelectorAll(".crossword-cell input");
    let missingInputs = false;
    let totalCorrect = 0;
    let totalExpected = inputs.length;
    
    inputs.forEach(input => {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        const solutionLetter = crosswordGridSolution[r][c];
        const userLetter = input.value.trim().toUpperCase();

        input.classList.remove("correct-cell", "incorrect-cell");

        if (userLetter === "") {
            missingInputs = true;
            return; // Leave empty inputs uncolored, skip checking further metrics for this tile
        }

        if (userLetter === solutionLetter) {
            input.classList.add("correct-cell");
            totalCorrect++;
        } else {
            input.classList.add("incorrect-cell");
        }
    });

    // Trigger toast banners based on calculation states
    if (missingInputs) {
        showToast("Fill in all the squares!");
    } else if (totalCorrect === totalExpected) {
        showToast("🎉 Incredible! 10x10 Puzzle Solved!");
    } else {
        showToast("❌ Some letters are incorrect.");
    }
}




// Global initialization triggers
initConnections();
initWordle();
initCrossword();