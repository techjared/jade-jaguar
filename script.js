document.addEventListener('DOMContentLoaded', () => {
    // Array to store data for multiple targets
    let targetsData = [
        {
            name: "Target 1",
            correct: 0,
            incorrect: 0,
            approx: 0
        },
        {
            name: "Target 2",
            correct: 0,
            incorrect: 0,
            approx: 0
        }
    ];

    const dataOutputPre = document.getElementById('dataOutput');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');

    // --- Function to initialize and get references for each target ---
    function setupTarget(index) {
        const targetBlock = document.querySelector(`.target-block:nth-child(${index + 1})`);
        const targetNameInput = targetBlock.querySelector('.target-name-input');
        const correctCountSpan = targetBlock.querySelector(`#correctCount${index + 1}`);
        const incorrectCountSpan = targetBlock.querySelector(`#incorrectCount${index + 1}`);
        const approxCountSpan = targetBlock.querySelector(`#approxCount${index + 1}`);

        const correctBtn = targetBlock.querySelector(`#correctBtn${index + 1}`);
        const incorrectBtn = targetBlock.querySelector(`#incorrectBtn${index + 1}`);
        const approxBtn = targetBlock.querySelector(`#approxBtn${index + 1}`);

        // Set initial name from data or default
        targetNameInput.value = targetsData[index].name;

        // Add event listeners for name input
        targetNameInput.addEventListener('input', (event) => {
            targetsData[index].name = event.target.value;
            generateOutput(); // Update output when name changes
        });

        // Add event listeners for buttons
        correctBtn.addEventListener('click', () => {
            targetsData[index].correct++;
            updateDisplay(index);
        });

        incorrectBtn.addEventListener('click', () => {
            targetsData[index].incorrect++;
            updateDisplay(index);
        });

        approxBtn.addEventListener('click', () => {
            targetsData[index].approx++;
            updateDisplay(index);
        });

        return {
            correctCountSpan,
            incorrectCountSpan,
            approxCountSpan,
            targetNameInput
        };
    }

    // Store references to spans and inputs for quick access
    const targetElements = targetsData.map((_, index) => setupTarget(index));


    // --- Functions to update display and output ---
    function updateDisplay(index = null) {
        if (index === null) { // Update all targets if no specific index is given
            targetsData.forEach((data, i) => {
                targetElements[i].correctCountSpan.textContent = data.correct;
                targetElements[i].incorrectCountSpan.textContent = data.incorrect;
                targetElements[i].approxCountSpan.textContent = data.approx;
            });
        } else { // Update only a specific target
            targetElements[index].correctCountSpan.textContent = targetsData[index].correct;
            targetElements[index].incorrectCountSpan.textContent = targetsData[index].incorrect;
            targetElements[index].approxCountSpan.textContent = targetsData[index].approx;
        }
        generateOutput();
    }

    function generateOutput() {
        let outputText = `Speech Data Summary (${new Date().toLocaleString()}):\n\n`; // Add timestamp

        targetsData.forEach(target => {
            const totalTrials = target.correct + target.incorrect + target.approx;
            let correctPercentage = "N/A";
            if (totalTrials > 0) {
                correctPercentage = (target.correct / totalTrials * 100).toFixed(2) + "%";
            }

            outputText += `--- ${target.name} ---\n`;
            outputText += `Correct (+): ${target.correct}\n`;
            outputText += `Incorrect (-): ${target.incorrect}\n`;
            outputText += `Approximations (~): ${target.approx}\n`;
            outputText += `Total Trials: ${totalTrials}\n`;
            outputText += `Correct Percentage: ${correctPercentage}\n\n`;
        });

        dataOutputPre.textContent = outputText;
        saveData(); // Save data to localStorage after every change
    }

    // --- Reset Function ---
    resetAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset ALL data for ALL targets?')) {
            targetsData.forEach(target => {
                target.correct = 0;
                target.incorrect = 0;
                target.approx = 0;
                // Reset target names to default as well
                target.name = `Target ${targetsData.indexOf(target) + 1}`;
                targetElements[targetsData.indexOf(target)].targetNameInput.value = target.name;
            });
            updateDisplay(); // Update all displays and output
        }
    });

    // --- Copy to Clipboard Function ---
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

    // --- LocalStorage for Data Persistence ---
    function saveData() {
        localStorage.setItem('speechTargetsData', JSON.stringify(targetsData));
    }

    function loadData() {
        const savedData = localStorage.getItem('speechTargetsData');
        if (savedData) {
            targetsData = JSON.parse(savedData);
            // Ensure loaded data has necessary properties (e.g., if new features are added)
            // This loop updates the initial names for the inputs after loading.
            targetsData.forEach((target, index) => {
                if (targetElements[index] && targetElements[index].targetNameInput) {
                    targetElements[index].targetNameInput.value = target.name;
                }
            });
        }
    }

    // --- Initial Setup ---
    // Load data first, then set up target elements based on potentially loaded data
    loadData();
    // Re-initialize target elements after loading to ensure spans/inputs are correctly set up
    targetsData.forEach((_, index) => setupTarget(index)); // Re-run setup to connect inputs
    updateDisplay(); // Initial display update on page load
});
