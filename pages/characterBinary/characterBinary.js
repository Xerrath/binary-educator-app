let bits = [0, 0, 0, 0, 0, 0, 0, 0];
let targetText = "";
let currentText = "";

const placeValues = [128, 64, 32, 16, 8, 4, 2, 1];

const bitGrid = document.getElementById("bitGrid");
const targetInput = document.getElementById("targetInput");
const progressText = document.getElementById("progressText");
const binDisplay = document.getElementById("binDisplay");
const decDisplay = document.getElementById("decDisplay");
const charDisplay = document.getElementById("charDisplay");
const feedback = document.getElementById("feedback");
const clearButton = document.getElementById("clearButton");
const enterCharacterButton = document.getElementById("enterCharacterButton");
const openCharacterSheet = document.getElementById("openCharacterSheet");
const closeCharacterSheet = document.getElementById("closeCharacterSheet");
const modal = document.getElementById("modal");
const modalSearch = document.getElementById("modalSearch");
const tableBody = document.getElementById("tableBody");

function initBuilder() {
    bitGrid.innerHTML = "";

    placeValues.forEach((placeValue, index) => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "bit-card";
        card.dataset.index = index;

        if (bits[index] === 1) {
            card.classList.add("active");
        }

        card.innerHTML = `
            <span class="bit-place-value">${placeValue}</span>
            <span class="bit-toggle">
                <span class="bit-toggle-knob"></span>
            </span>
            <span class="bit-value" id="b${index}">${bits[index]}</span>
        `;

        card.addEventListener("click", () => toggleBit(index));

        bitGrid.appendChild(card);
    });

    updateDisplays();
}

function toggleBit(index) {
    bits[index] = bits[index] === 0 ? 1 : 0;
    updateDisplays();
}

function updateDisplays() {
    const binaryString = bits.join("");
    const decimalValue = parseInt(binaryString, 2);

    binDisplay.textContent = binaryString;
    decDisplay.textContent = decimalValue;
    charDisplay.textContent = getCharName(decimalValue);

    bits.forEach((bit, index) => {
        const bitElement = document.getElementById(`b${index}`);
        const card = bitElement.parentElement;

        bitElement.textContent = bit;
        card.classList.toggle("active", bit === 1);
    });
}

function getCharName(code) {
    const controlCharacters = [
        "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL",
        "BS", "TAB", "LF", "VT", "FF", "CR", "SO", "SI",
        "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB",
        "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US"
    ];

    if (code < 32) {
        return controlCharacters[code];
    }

    if (code === 32) {
        return "SPACE";
    }

    if (code === 127) {
        return "DEL";
    }

    return String.fromCharCode(code);
}

function resetBits() {
    bits = [0, 0, 0, 0, 0, 0, 0, 0];
    initBuilder();
}

function handleTargetInput(event) {
    targetText = event.target.value;
    currentText = "";

    resetBits();
    clearFeedback();
    updateProgress();
}

function updateProgress() {
    let displayString = currentText;

    for (let i = currentText.length; i < targetText.length; i++) {
        displayString += "_ ";
    }

    progressText.textContent = displayString || "_ _ _ _ _";
}

function validateCharacter() {
    const decimalValue = parseInt(bits.join(""), 2);
    const nextCharacter = targetText[currentText.length];

    if (!nextCharacter) {
        feedback.textContent = "Target completed!";
        setFeedbackType("success");
        return;
    }

    const currentCharacter = String.fromCharCode(decimalValue);

    if (currentCharacter === nextCharacter) {
        currentText += nextCharacter;

        feedback.textContent = "Correct!";
        setFeedbackType("success");

        updateProgress();
        resetBits();
        return;
    }

    feedback.textContent = "Incorrect bit pattern. Try again!";
    setFeedbackType("error");
}

function setFeedbackType(type) {
    feedback.classList.remove("success", "error");

    if (type) {
        feedback.classList.add(type);
    }
}

function clearFeedback() {
    feedback.textContent = "";
    setFeedbackType("");
}

function buildCharacterTable() {
    tableBody.innerHTML = "";

    for (let value = 0; value < 128; value++) {
        const row = document.createElement("tr");
        const decimalCell = document.createElement("td");
        const characterCell = document.createElement("td");
        const binaryCell = document.createElement("td");

        decimalCell.textContent = value;
        characterCell.textContent = getCharName(value);
        binaryCell.textContent = value.toString(2).padStart(8, "0");

        row.appendChild(decimalCell);
        row.appendChild(characterCell);
        row.appendChild(binaryCell);

        tableBody.appendChild(row);
    }
}

function openModal() {
    modal.classList.remove("hidden");
    modalSearch.value = "";
    filterCharacterSheet("");
    modalSearch.focus();
}

function closeModal() {
    modal.classList.add("hidden");
    openCharacterSheet.focus();
}

function filterCharacterSheet(searchValue) {
    const search = searchValue.toLowerCase();
    const rows = Array.from(tableBody.children);

    rows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();
        row.style.display = rowText.includes(search) ? "" : "none";
    });
}

targetInput.addEventListener("input", handleTargetInput);

clearButton.addEventListener("click", () => {
    resetBits();
    clearFeedback();
});

enterCharacterButton.addEventListener("click", validateCharacter);
openCharacterSheet.addEventListener("click", openModal);
closeCharacterSheet.addEventListener("click", closeModal);

modalSearch.addEventListener("input", (event) => {
    filterCharacterSheet(event.target.value);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
    }
});

buildCharacterTable();
initBuilder();
updateProgress();