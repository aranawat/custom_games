// ==========================================
// ⚙️ CUSTOM SETUP - EDIT YOUR WORDS HERE
// ==========================================
const categories = [
    { desc: "FAVORITE DESSERTS", words: ["CAKE", "COOKIES", "ICECREAM", "PIE"] },
    { desc: "PLACES WE VISITED", words: ["PARIS", "TOKYO", "LONDON", "NEWYORK"] },
    { desc: "DOG BREEDS", words: ["PUG", "LABRADOR", "POODLE", "CORGI"] },
    { desc: "THINGS THAT ARE BLUE", words: ["SKY", "OCEAN", "JEANS", "BERRY"] }
];

const SECRET_WORD = "HEART"; // Must be exactly 5 letters!

// Universal Toast Alert Helper
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

// ROUTING
function switchScreen(screenId) {
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("connections-screen").classList.add("hidden");
    document.getElementById("wordle-screen").classList.add("hidden");
    document.getElementById(screenId).classList.remove("hidden");
}

// ==========================================
// 🧩 CONNECTIONS LOGIC
// ==========================================
let allWords = [];
let selectedWords = [];
let mistakesLeft = 4;
let solvedCategories = [];

const gridElement = document.getElementById("grid");
const submitBtn = document.getElementById("submit-btn");
const mistakesElement = document.getElementById("mistakes");

function initConnections() {
    allWords = [];
    categories.forEach((cat, index) => {
        cat.words.forEach(word => allWords.push({ text: word, catIndex: index }));
    });
    allWords.sort(() => Math.random() - 0.5);
    renderGrid();
}

function renderGrid() {
    // CRITICAL FIX: Completely wipe out old HTML data before rebuilding the layout
    gridElement.innerHTML = "";
    
    // 1. Create a dedicated container for banners if any exist
    solvedCategories.forEach(catIndex => {
        const cat = categories[catIndex];
        const banner = document.createElement("div");
        banner.className = `card solved-${catIndex}`;
        banner.style.gridColumn = "span 4";
        banner.innerHTML = `<strong>${cat.desc}</strong><br>${cat.words.join(", ")}`;
        gridElement.appendChild(banner);
    });

    // 2. Safely render only the remaining unsolved cards
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
    
    // CRITICAL FIX: Grab the category index from the FIRST item inside the guess array
    const firstCat = selectedWords[0].catIndex; 
    
    // Check if EVERY selected card matches that same category index
    const isCorrect = selectedWords.every(w => w.catIndex === firstCat);

    if (isCorrect) {
        solvedCategories.push(firstCat);
        allWords = allWords.filter(w => w.catIndex !== firstCat);
        selectedWords = [];
        if (solvedCategories.length === 4) {
            setTimeout(() => showToast("🎉 You cleared Connections!"), 400);
        }
    } else {
        mistakesLeft--;
        mistakesElement.innerText = `Mistakes remaining: ${"•".repeat(mistakesLeft)}`;
        showToast("❌ Wrong combination!");
        if (mistakesLeft === 0) showToast("Game Over! Try resetting.");
    }
    submitBtn.disabled = true;
    renderGrid();
};

// ==========================================
// 🟩 WORDLE LOGIC (LIVE DICTIONARY API LOOKUP)
// ==========================================
let currentAttempt = 0;
let currentLetter = 0;
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
    if (isAnimating) return; // 🔏 Blocks keys from registering mid-animation
    if (currentAttempt >= maxAttempts) return;

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
            checkWordleRow(); 
        } else {
            showToast("Not enough letters");
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

// Global lock variable to prevent typing while animation plays
let isAnimating = false;

async function checkWordleRow() {
    if (isAnimating) return; // Prevent double submissions
    
    const rowWords = wordleGrid[currentAttempt].join("").toLowerCase();
    
    // 1. Live Dictionary Validation check
    if (rowWords !== SECRET_WORD.toLowerCase()) {
        try {
            const response = await fetch(`https://dictionaryapi.dev{rowWords}`);
            if (!response.ok) {
                showToast("Not in word list");
                triggerRowShake();
                return; 
            }
        } catch (error) {
            console.warn("Dictionary API offline. Bypassing check.", error);
        }
    }

    // Lock board input during the reveal sequence
    isAnimating = true;

    const secretArr = SECRET_WORD.toUpperCase().split("");
    const guessArr = rowWords.toUpperCase().split("");
    let revealDelay = 300; 

    // 2. Trigger individual tile flip transitions sequentially
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        const letter = guessArr[i];
        
        setTimeout(() => {
            cell.classList.add("flip");
            
            setTimeout(() => {
                let statusClass = "absent";
                if (letter === secretArr[i]) {
                    statusClass = "correct";
                } else if (secretArr.includes(letter)) {
                    statusClass = "present";
                }
                
                cell.classList.add(statusClass);
                updateKeyboardKeyColor(letter, statusClass);
            }, 250);
        }, i * revealDelay);
    }

    // 3. CRITICAL FIX: Only advance game state AFTER the 5th tile finishes flipping
    setTimeout(() => {
        if (rowWords.toUpperCase() === SECRET_WORD.toUpperCase()) {
            showToast("🎉 Spectacular!");
            // Set attempt to max to freeze input on win
            currentAttempt = maxAttempts; 
            isAnimating = false;
        } else {
            // Move down by exactly ONE row increment cleanly
            currentAttempt++; 
            currentLetter = 0; 
            isAnimating = false; // Unlock input for the next row
            
            if (currentAttempt === maxAttempts) {
                showToast(`Game Over! Word was: ${SECRET_WORD.toUpperCase()}`);
            }
        }
    }, (4 * revealDelay) + 500); // Dynamic timer coordinates perfectly with CSS animations
}


function updateKeyboardKeyColor(letter, targetStatus) {
    const keyElement = document.getElementById(`key-${letter}`);
    if (!keyElement) return;

    if (keyElement.classList.contains("correct")) return;
    if (keyElement.classList.contains("present") && targetStatus === "absent") return;

    keyElement.classList.remove("present", "absent", "correct");
    keyElement.classList.add(targetStatus);
    
    if (targetStatus === "correct") { keyElement.style.backgroundColor = "#6aaa64"; keyElement.style.color = "white"; }
    if (targetStatus === "present") { keyElement.style.backgroundColor = "#c9b458"; keyElement.style.color = "white"; }
    if (targetStatus === "absent") { keyElement.style.backgroundColor = "#787c7e"; keyElement.style.color = "white"; }
}

// Start everything up on launch
initConnections();
initWordle();
