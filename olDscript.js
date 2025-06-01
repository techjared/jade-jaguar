document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const correctCountSpan = document.getElementById('correctCount');
    const incorrectCountSpan = document.getElementById('incorrectCount');
    const approxCountSpan = document.getElementById('approxCount');
    const dataOutputPre = document.getElementById('dataOutput');

    const correctBtn = document.getElementById('correctBtn');
    const incorrectBtn = document.getElementById('incorrectBtn');
    const approxBtn = document.getElementById('approxBtn');
    const resetBtn = document.getElementById('resetBtn');
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');

    // Initialize counts
    let correct = 0;
    let incorrect = 0;
    let approx = 0;

    // Function to update the display and output
    function updateDisplay() {
        correctCountSpan.textContent = correct;
        incorrectCountSpan.textContent = incorrect;
        approxCountSpan.textContent = approx;
        generateOutput();
    }

    // Function to generate plain text output
    function generateOutput() {
        const totalTrials = correct + incorrect + approx;
        let outputText = `Speech Data Summary:\n\n`;
        outputText += `Total Trials: ${totalTrials}\n`;
        outputText += `Correct Productions (+): ${correct}\n`;
        outputText += `Incorrect Productions (-): ${incorrect}\n`;
        outputText += `Approximations (~): ${approx}\n\n`;

        if (totalTrials > 0) {
            const correctPercentage = (correct / totalTrials * 100).toFixed(2);
            outputText += `Correct Percentage: ${correctPercentage}%\n`;
        } else {
            outputText += `Correct Percentage: N/A (no trials recorded)\n`;
        }

        dataOutputPre.textContent = outputText;
    }

    // Event Listeners for buttons
    correctBtn.addEventListener('click', () => {
        correct++;
        updateDisplay();
    });

    incorrectBtn.addEventListener('click', () => {
        incorrect++;
        updateDisplay();
    });

    approxBtn.addEventListener('click', () => {
        approx++;
        updateDisplay();
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data?')) {
            correct = 0;
            incorrect = 0;
            approx = 0;
            updateDisplay();
        }
    });

    copyToClipboardBtn.addEventListener('click', () => {
        // Use the Clipboard API if available (modern browsers, recommended)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(dataOutputPre.textContent)
                .then(() => {
                    alert('Data copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Fallback for older browsers
                    fallbackCopyToClipboard(dataOutputPre.textContent);
                });
        } else {
            // Fallback for older browsers (less ideal user experience)
            fallbackCopyToClipboard(dataOutputPre.textContent);
        }
    });

    function fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page
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

    // Initial display update when the page loads
    updateDisplay();
});
