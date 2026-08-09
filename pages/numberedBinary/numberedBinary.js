const input = document.getElementById('decimalInput');
const board = document.getElementById('boardScroll');
const displayOrig = document.getElementById('displayOriginal');
const displayRem = document.getElementById('displayRemaining');
const stepsList = document.getElementById('stepsList');
const binaryString = document.getElementById('binaryString');
const feedback = document.getElementById('feedback');
const hintBtn = document.getElementById('hintBtn');
const successModal = document.getElementById('successModal');
const finalEquation = document.getElementById('finalEquation');

let state = {
    original: 0,
    remaining: 0,
    bits: [],
    hintCount: 0
};

input.addEventListener('input', (e) => {
    const val = parseInt(e.target.value) || 0;

    if (val > 0) {
        init(val);
    } else {
        resetUI();
    }
});

function init(num) {
    state.original = num;
    state.remaining = num;
    state.hintCount = 0;
    displayOrig.textContent = num;
    displayRem.textContent = num;
    stepsList.innerHTML = '';
    binaryString.textContent = '0';

    successModal.classList.add('hidden');

    let largestPow = Math.pow(
        2,
        Math.floor(Math.log2(num))
    );

    state.bits = [];

    // Generate board: 2 powers higher down to 1
    let startPow = largestPow * 4;

    for (let p = startPow; p >= 1; p /= 2) {
        state.bits.push({
            pow: p,
            val: 0
        });
    }

    renderBoard();
}

function renderBoard() {
    board.innerHTML = '';

    state.bits.forEach((b, i) => {
        const card = document.createElement('button');

        card.type = 'button';
        card.className = 'bit-card';

        if (b.val === 1) {
            card.classList.add('active');
        }

        card.innerHTML = `
            <span class="bit-power">${b.pow}</span>

            <span class="bit-toggle">
                <span class="bit-toggle-knob"></span>
            </span>

            <span class="bit-value">${b.val}</span>
        `;

        card.addEventListener('click', () => {
            handleBitClick(i);
        });

        board.appendChild(card);
    });
}

function handleBitClick(i) {
    const bit = state.bits[i];

    if (bit.val === 1) {
        return;
    }

    // Check if too large
    if (bit.pow > state.remaining) {
        shake(i, `${bit.pow} is too large to fit.`);
        return;
    }

    // Check if there's a larger available power
    const largerAvailable =
        state.bits.slice(0, i)
            .find(
                b =>
                    b.pow <= state.remaining &&
                    b.val === 0
            );

    if (largerAvailable) {
        shake(i, `${bit.pow} fits, but there is a larger power (${largerAvailable.pow}) that also fits.`);
        return;
    }

    // Valid move
    const oldRem = state.remaining;
    state.remaining -= bit.pow;
    state.bits[i].val = 1;

    // UI Updates
    updateSteps(oldRem, bit.pow);
    updateDisplay();
    renderBoard();
    checkWin();
}

function updateSteps(old, sub) {
    if (stepsList.querySelector('p.italic')) {
        stepsList.innerHTML = ''
        ;
    }

    const step = document.createElement('p');
    step.textContent = `${old} - ${sub} = ${state.remaining}`;
    stepsList.appendChild(step);
}

function updateDisplay() {
    displayRem.textContent = state.remaining;
    binaryString.textContent = state.bits.map(b => b.val).join('');
}

function shake(i, msg) {
    const el = board.children[i];
    el.classList.add('shake', 'border-brand-red');
    feedback.textContent = msg;
    feedback.className = 'text-brand-red text-sm font-medium';
    setTimeout(() => {
        el.classList.remove('shake', 'border-brand-red');
    }, 500);
}

function checkWin() {
    if (state.remaining === 0) {
        successModal.classList.remove('hidden');
        finalEquation.textContent = `The Number ${state.original} is ${binaryString.textContent.slice(2)} in Binary`;
    }
}

hintBtn.onclick = () => {
    state.hintCount++;

    if (state.hintCount === 1) {
        feedback.textContent = "Start with the largest value that fits into the remaining total.";
    }

    if (state.hintCount === 2) {
        feedback.textContent = `Look for the power of 2 just below ${state.remaining}.`;
    }

    if (state.hintCount >= 3) {
        const best =
            state.bits.find(
                b =>
                    b.pow <= state.remaining &&
                    b.val === 0
            );

        feedback.textContent = `Try selecting the ${best.pow} card.`;
    }
};

function resetUI() {
    board.innerHTML = '';
    displayOrig.textContent = '0';
    displayRem.textContent = '0';
}