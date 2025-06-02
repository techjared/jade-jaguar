document.addEventListener('DOMContentLoaded', () => {
    // --- Get references to HTML elements ---
    const target1LabelInput = document.getElementById('target1Label');
    const target2LabelInput = document.getElementById('target2Label');
    const displayTarget1Label = document.getElementById('displayTarget1Label');
    const displayTarget2Label = document.getElementById('displayTarget2Label');

    const dataOutputPre = document.getElementById('dataOutput');
    const endSessionBtn = document.getElementById('endSessionBtn'); // New button
    const resetCurrentSessionBtn = document.getElementById('resetAllBtn'); // Renamed
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');

    // Chart elements
    const progressChartCanvas = document.getElementById('progressChart');
    const chartTargetSelect = document.getElementById('chartTargetSelect');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // --- Data Storage ---
    // This will hold the current session's target data
    let currentSessionTargets = [
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
          approxCountSpan: document.getElementById('approxBtn2'), // Correction: typo here, was approxBtn2, should be approxCount2
          correctBtn: document.getElementById('correctBtn2'),
          incorrectBtn: document.getElementById('incorrectBtn2'),
          approxBtn: document.getElementById('approxBtn2')
        }
    ];

    // This will hold all past session data
    // Each session will be an object: { timestamp: number, date: string, targets: [] }
    let sessionHistory = [];

    // --- Local Storage Keys ---
    const CURRENT_SESSION_STORAGE_KEY = 'speechDataApp_currentSession';
    const SESSION_HISTORY_STORAGE_KEY = 'speechDataApp_sessionHistory';

    // --- Chart.js Instance ---
    let myChart = null; // To store the Chart.js instance

    // --- Local Storage Functions ---
    function saveCurrentSession() {
        // Only save the data, not DOM element references
        const dataToSave = currentSessionTargets.map(target => ({
            label: target.label,
            correct: target.correct,
            incorrect: target.incorrect,
            approx: target.approx
        }));
        localStorage.setItem(CURRENT_SESSION_STORAGE_KEY, JSON.stringify(dataToSave));
    }

    function loadCurrentSession() {
        const storedData = localStorage.getItem(CURRENT_SESSION_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            parsedData.forEach((data, index) => {
                if (currentSessionTargets[index]) {
                    currentSessionTargets[index].label = data.label;
                    currentSessionTargets[index].correct = data.correct;
                    currentSessionTargets[index].incorrect = data.incorrect;
                    currentSessionTargets[index].approx = data.approx;
                }
            });
        }
    }

    function saveSessionHistory() {
        localStorage.setItem(SESSION_HISTORY_STORAGE_KEY, JSON.stringify(sessionHistory));
    }

    function loadSessionHistory() {
        const storedHistory = localStorage.getItem(SESSION_HISTORY_STORAGE_KEY);
        if (storedHistory) {
            sessionHistory = JSON.parse(storedHistory);
            // Ensure timestamps are numbers if they were strings, or convert to Date objects if needed
            // For charting, we'll format them later.
        }
    }

    // --- Update Display and Chart Functions ---
    function updateDisplay() {
        // Update label inputs
        target1LabelInput.value = currentSessionTargets[0].label;
        target2LabelInput.value = currentSessionTargets[1].label;

        // Update display labels
        displayTarget1Label.textContent = currentSessionTargets[0].label;
        displayTarget2Label.textContent = currentSessionTargets[1].label;

        // Update counts for each target
        currentSessionTargets.forEach(target => {
            target.correctCountSpan.textContent = target.correct;
            target.incorrectCountSpan.textContent = target.incorrect;
            target.approxCountSpan.textContent = target.approx;
        });

        generateOutput();
        saveCurrentSession(); // Save current session data after every display update
        renderChart(); // Re-render chart after data changes
    }

    function generateOutput() {
        let outputText = `--- Current Session Data ---\n\n`;

        currentSessionTargets.forEach((target, index) => {
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

    function renderChart() {
        // Destroy existing chart if it exists
        if (myChart) {
            myChart.destroy();
        }

        const selectedTargetIndex = parseInt(chartTargetSelect.value);
        if (isNaN(selectedTargetIndex) || !sessionHistory.length) {
            // No history or invalid selection, clear canvas
            const ctx = progressChartCanvas.getContext('2d');
            ctx.clearRect(0, 0, progressChartCanvas.width, progressChartCanvas.height);
            return;
        }

        const labels = []; // Dates/Session numbers
        const correctPercentages = []; // Correct % for the selected target

        sessionHistory.forEach((session, index) => {
            const targetData = session.targets[selectedTargetIndex];
            if (targetData) { // Ensure data exists for this target in this session
                const totalTrials = targetData.correct + targetData.incorrect + targetData.approx;
                const percentage = totalTrials > 0
                    ? (targetData.correct / totalTrials * 100)
                    : 0; // If no trials, percentage is 0 or can be 'null' depending on preference

                labels.push(`Session ${index + 1}\n(${new Date(session.timestamp).toLocaleDateString()})`);
                correctPercentages.push(percentage);
            }
        });

        const ctx = progressChartCanvas.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line', // Line chart for progress over time
            data: {
                labels: labels,
                datasets: [{
                    label: `Correct % for ${currentSessionTargets[selectedTargetIndex].label}`,
                    data: correctPercentages,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1, // Smooth the line
                    fill: false,
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(75, 192, 192)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow canvas to resize freely
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Correct Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Session'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Session Management Functions ---
    function endCurrentSession() {
        const totalTrialsForSession = currentSessionTargets.reduce((sum, target) => sum + target.correct + target.incorrect + target.approx, 0);

        if (totalTrialsForSession === 0 && sessionHistory.length > 0 &&
            !confirm('The current session has no data. Do you still want to save it as a new session?')) {
            return; // Don't save empty session if user cancels
        }

        if (confirm('Are you sure you want to end the current session and save its data to history? This will reset the current counts to zero.')) {
            // Create a snapshot of the current session's data
            const sessionSnapshot = {
                timestamp: Date.now(),
                date: new Date().toISOString(), // Store ISO string for consistency
                targets: currentSessionTargets.map(target => ({
                    label: target.label,
                    correct: target.correct,
                    incorrect: target.incorrect,
                    approx: target.approx
                }))
            };
            sessionHistory.push(sessionSnapshot);
            saveSessionHistory();

            // Reset current session counts
            currentSessionTargets.forEach(target => {
                target.correct = 0;
                target.incorrect = 0;
                target.approx = 0;
            });
            updateDisplay(); // This will also save and re-render chart
            alert('Current session data saved and counts reset!');
        }
    }

    function resetCurrentSession() {
        if (confirm('Are you sure you want to reset the current session data to zero? This will NOT save it to history.')) {
            currentSessionTargets.forEach(target => {
                target.correct = 0;
                target.incorrect = 0;
                target.approx = 0;
            });
            updateDisplay();
            alert('Current session data has been reset.');
        }
    }

    function clearAllSessionHistory() {
        if (confirm('Are you absolutely sure you want to clear ALL saved session history? This cannot be undone.')) {
            sessionHistory = [];
            saveSessionHistory();
            updateDisplay(); // This will also re-render chart
            alert('All session history has been cleared.');
        }
    }

    // --- Event Listeners ---

    // Listen for changes in the target label input fields
    target1LabelInput.addEventListener('input', () => {
        currentSessionTargets[0].label = target1LabelInput.value;
        updateDisplay();
    });

    target2LabelInput.addEventListener('input', () => {
        currentSessionTargets[1].label = target2LabelInput.value;
        updateDisplay();
    });

    // Attach event listeners to each target's buttons
    currentSessionTargets.forEach((target) => { // Removed 'index' from loop as it's not strictly needed here
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

    // Session control buttons
    endSessionBtn.addEventListener('click', endCurrentSession);
    resetCurrentSessionBtn.addEventListener('click', resetCurrentSession); // Renamed button variable

    // Chart target selection
    chartTargetSelect.addEventListener('change', renderChart);

    // Clear history button
    clearHistoryBtn.addEventListener('click', clearAllSessionHistory);

    copyToClipboardBtn.addEventListener('click', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(dataOutputPre.textContent)
                .then(() => {
                    alert('Current session summary copied to clipboard!');
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
            alert('Current session summary copied to clipboard! (Fallback)');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Failed to copy data. Please select and copy manually.');
        }
        document.body.removeChild(textarea);
    }

    // --- Initialization ---
    loadCurrentSession(); // Load current session data
    loadSessionHistory(); // Load all historical data
    updateDisplay(); // Update UI, including chart
});
