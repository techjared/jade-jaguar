document.addEventListener('DOMContentLoaded', () => {
    // --- Get references to HTML elements ---
    const target1LabelInput = document.getElementById('target1Label');
    const target2LabelInput = document.getElementById('target2Label');
    const displayTarget1Label = document.getElementById('displayTarget1Label');
    const displayTarget2Label = document.getElementById('displayTarget2Label');

    const dataOutputPre = document.getElementById('dataOutput');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');

    // Store data for each target in an array of objects
    // Each object will have: { label: string, correct: number, incorrect: number, approx: number }
    let targets = [
        { label: 'Target 1', correct: 0, incorrect: 0, approx: 0,
          correctCountSpan: document.getElementById('correctCount1'),
          incorrectCountSpan: document.getElementById('incorrectCount1'),
          approxCountSpan: document.getElementById('approxCount1'),
          correctBtn: document.getElementById('correctBtn1'),
          incorrectBtn: document.getElementById('incorrectBtn1'),
          approxBtn: document.getElementById('approxBtn1')
        },
        { label: 'Target 2', correct: 0, incorrect: 0, approx: 0,
          correctCountSpan: document.getElementById('correctCount2'),
          incorrectCountSpan: document.getElementById('incorrectCount2'),
          approxCountSpan: document.getElementById('approxCount2'),
          correctBtn: document.getElementById('correctBtn2'),
          incorrectBtn: document.getElementById('incorrectBtn2'),
          approxBtn: document.getElementById('approxBtn2')
        }
    ];

    // --- Local Storage Functions ---
    const STORAGE_KEY = 'speechDataApp';

    function saveTargets() {
        // We only want to save the data (label, counts), not the DOM element references
        const dataToSave = targets.map(target => ({
            label: target.label,
            correct: target.correct,
            incorrect: target.incorrect,
            approx: target.approx
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }

    function loadTargets() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            // Iterate through parsedData and update our `targets` array
            parsedData.forEach((data, index) => {
                if (targets[index]) { // Ensure the target exists in our structure
                    targets[index].label = data.label;
                    targets[index].correct = data.correct;
                    targets[index].incorrect = data.incorrect;
                    targets[index].approx = data.approx;
                }
            });
        }
    }

    // --- Update Display Function ---
    function updateDisplay() {
        // Update label inputs
        target1LabelInput.value = targets[0].label;
        target2LabelInput.value = targets[1].label;

        // Update display labels
        displayTarget1Label.textContent = targets[0].label;
        displayTarget2Label.textContent = targets[1].label;

        // Update counts for each target
        targets.forEach(target => {
            target.correctCountSpan.textContent = target.correct;
            target.incorrectCountSpan.textContent = target.incorrect;
            target.approxCountSpan.textContent = target.approx;
        });

        generateOutput();
        saveTargets(); // Save data to localStorage after every display update
    }

    // --- Generate Plain Text Output ---
    function generateOutput() {
        let outputText = `--- Speech Data Summary ---\n\n`;

        targets.forEach((target, index) => {
            const totalTrials = target.correct + target.incorrect + target.approx;
            const correctPercentage = totalTrials > 0
                ? (target.correct / totalTrials * 100).toFixed(2)
                : 'N/A';

            outputText += `Target ${index + 1}: ${target.label}\n`;
            outputText += `  Correct (+): ${target.correct}\n`;
            outputText += `  Incorrect (-): ${target.incorrect}\n`;
            outputText += `  Approximations (~): ${target.approx}\n`;
            outputText += `  Total Trials: ${totalTrials}\n`;
            outputText += `  Correct Percentage: ${correctPercentage}%\n\n`;
        });

        dataOutputPre.textContent = outputText;
    }

    // --- Event Listeners ---

    // Listen for changes in the target label input fields
    target1LabelInput.addEventListener('input', () => {
        targets[0].label = target1LabelInput.value;
        updateDisplay();
    });

    target2LabelInput.addEventListener('input', () => {
        targets[1].label = target2LabelInput.value;
        updateDisplay();
    });

    // Attach event listeners to each target's buttons
    targets.forEach((target, index) => {
        target.correctBtn.addEventListener('click', () => {
            target.correct++;
            updateDisplay();
        });

        target.incorrectBtn.addEventListener('click', () => {
            target.incorrect++;
            updateDisplay();
        });

        target.approxBtn.addEventListener('click', () => {
            target.approx++;
            updateDisplay();
        });
    });

    resetAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset ALL data for both targets? This cannot be undone.')) {
            targets.forEach(target => {
                target.correct = 0;
                target.incorrect = 0;
                target.approx = 0;
            });
            updateDisplay();
        }
    });

    copyToClipboardBtn.addEventListener('click', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(dataOutputPre.textContent)
                .then(() => {
                    alert('Data copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    fallbackCopyToClipboard(dataOutputPre.textContent);
                });
        } else {
            fallbackCopyToClipboard(dataOutputPre.textContent);
        }
    });

    function fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '1px';
        textarea.style.height = '1px';
        textarea.style.padding = '0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.boxShadow = 'none';
        textarea.style.background = 'transparent';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            alert('Data copied to clipboard! (Fallback)');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Failed to copy data. Please select and copy manually.');
        }
        document.body.removeChild(textarea);
    }

    // --- Initialization ---
    loadTargets(); // Load data from localStorage first
    updateDisplay(); // Then update the UI
});
