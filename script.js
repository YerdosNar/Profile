// Terminal navigation
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.terminal-section');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSection = button.getAttribute('data-section');
        
        // Remove active class from all buttons and sections
        navButtons.forEach(btn => btn.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        // Add active class to clicked button and corresponding section
        button.classList.add('active');
        document.getElementById(targetSection).classList.add('active');
        
        // Update terminal path based on section
        updateTerminalPath(targetSection);
    });
});

// Blinking cursor effect
const prompts = document.querySelectorAll('.terminal-output .prompt');
prompts.forEach(prompt => {
    if (prompt.textContent.trim().endsWith('$')) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '\u2588';
        prompt.appendChild(cursor);
    }
});

// Add hover effect for file items
const fileItems = document.querySelectorAll('.file-item');
fileItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(23, 147, 209, 0.1)';
    });
    item.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
});

// Keyboard navigation (Ctrl/Cmd + Arrow keys)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        const activeIndex = Array.from(navButtons).findIndex(btn => btn.classList.contains('active'));
        let newIndex = activeIndex;

        if (e.key === 'ArrowRight' || e.key === 'l') {
            e.preventDefault();
            newIndex = (activeIndex + 1) % navButtons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'h') {
            e.preventDefault();
            newIndex = (activeIndex - 1 + navButtons.length) % navButtons.length;
        }

        if (newIndex !== activeIndex) {
            navButtons[newIndex].click();
        }
    }
});

// Interactive Terminal
const terminalInput = document.getElementById('terminalInput');
const terminalHistory = document.getElementById('terminalHistory');
const currentPath = document.getElementById('currentPath');
let currentDir = '~';
let commandHistory = [];
let historyIndex = -1;

// Project directories mapping
const projects = {
    'PNG_file_reader': 'https://github.com/YerdosNar/png.git',
    '3X-UI_auto_installer': 'https://github.com/YerdosNar/3x-ui-auto.git',
    'NN_handwritten_digits': 'https://github.com/YerdosNar/digitNN.git',
    'Profile': 'https://github.com/YerdosNar/Profile.git'
};

const directories = {
    '~': ['Projects', 'AboutMe', 'Contact', 'intro.txt'],
    '~/Projects': Object.keys(projects),
    '~/AboutMe': ['about.txt'],
    '~/Contact': ['contact.txt']
};

function updateTerminalPath(section) {
    const pathMap = {
        'home': '~',
        'projects': '~/Projects',
        'about': '~/AboutMe',
        'contact': '~/Contact'
    };
    currentDir = pathMap[section] || currentDir;
    currentPath.textContent = currentDir;
}

function addToHistory(command, output, isError = false) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const promptLine = document.createElement('p');
    promptLine.className = 'prompt';
    promptLine.innerHTML = `<span class="user">guest@portfolio</span>:<span class="path">${currentDir}</span>$ ${command}`;
    historyItem.appendChild(promptLine);
    
    if (output) {
        const outputDiv = document.createElement('div');
        outputDiv.className = isError ? 'output error' : 'output';
        outputDiv.innerHTML = output;
        historyItem.appendChild(outputDiv);
    }
    
    terminalHistory.appendChild(historyItem);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

function executeCommand(input) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    commandHistory.push(input);
    historyIndex = commandHistory.length;

    switch(command) {
        case 'ls':
            const items = directories[currentDir] || [];
            const output = items.map(item => {
                if (currentDir === '~/Projects') {
                    return `<span class="file-name">${item}/</span>`;
                }
                return item.endsWith('.txt') ? item : `<span class="file-name">${item}/</span>`;
            }).join('  ');
            addToHistory(input, output);
            break;

        case 'cd':
            if (!args[0] || args[0] === '~') {
                currentDir = '~';
                currentPath.textContent = '~';
                addToHistory(input, '');
                navButtons[0].click();
            } else if (args[0] === '..') {
                if (currentDir !== '~') {
                    currentDir = '~';
                    currentPath.textContent = '~';
                    addToHistory(input, '');
                    navButtons[0].click();
                } else {
                    addToHistory(input, '');
                }
            } else {
                const targetDir = args[0];
                
                // Check if it's a project directory - redirect to GitHub
                if (currentDir === '~/Projects' && projects[targetDir]) {
                    addToHistory(input, `Opening GitHub repository: ${targetDir}...`);
                    setTimeout(() => {
                        window.open(projects[targetDir], '_blank');
                    }, 500);
                    break;
                }
                
                // Check if it's a valid directory from current location
                if (directories[currentDir]?.includes(targetDir)) {
                    if (targetDir === 'Projects') {
                        currentDir = '~/Projects';
                        currentPath.textContent = '~/Projects';
                        addToHistory(input, '');
                        // Auto-switch to Projects tab
                        navButtons[1].click();
                    } else if (targetDir === 'AboutMe') {
                        currentDir = '~/AboutMe';
                        currentPath.textContent = '~/AboutMe';
                        addToHistory(input, '');
                        navButtons[2].click();
                    } else if (targetDir === 'Contact') {
                        currentDir = '~/Contact';
                        currentPath.textContent = '~/Contact';
                        addToHistory(input, '');
                        navButtons[3].click();
                    } else {
                        addToHistory(input, `bash: cd: ${targetDir}: Not a directory`, true);
                    }
                } else {
                    addToHistory(input, `bash: cd: ${targetDir}: No such file or directory`, true);
                }
            }
            break;

        case 'cat':
            if (!args[0]) {
                addToHistory(input, 'cat: missing operand', true);
            } else if (args[0] === 'intro.txt' && currentDir === '~') {
                addToHistory(input, `<h2>Welcome to My Portfolio</h2>
                            <p>I'm Yerdos, a 💻 Computer Science & Engineering student living in 🇰🇷 Korea.</p>
                            <p>I’m passionate about low-level programming, networking, and security — and I’m currently learning deeper C, Assembly, and system-level development.</p>`);
            } else if (args[0] === 'about.txt' && currentDir === '~/AboutMe') {
                addToHistory(input, 'About me content coming soon...');
            } else if (args[0] === 'contact.txt' && currentDir === '~/Contact') {
                addToHistory(input, 'Contact information coming soon...');
            } else {
                addToHistory(input, `cat: ${args[0]}: No such file or directory`, true);
            }
            break;

        case 'clear':
            terminalHistory.innerHTML = '';
            break;

        case 'help':
            addToHistory(input, `<strong>Available commands:</strong><br>
                <span class="command">ls</span> - list directory contents<br>
                <span class="command">cd [dir]</span> - change directory<br>
                <span class="command">cat [file]</span> - display file contents<br>
                <span class="command">clear</span> - clear terminal<br>
                <span class="command">help</span> - show this help message<br><br>
                <strong>Navigation:</strong><br>
                cd Projects, cd AboutMe, cd Contact<br>
                From ~/Projects, cd into any project to open GitHub`);
            break;

        case '':
            addToHistory(input, '');
            break;

        default:
            addToHistory(input, `bash: ${command}: command not found`, true);
    }
}

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = terminalInput.value;
        executeCommand(input);
        terminalInput.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            terminalInput.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        // Simple tab completion could be added here
    }
});

// Keep input focused
document.addEventListener('click', () => {
    terminalInput.focus();
});

// Focus input on page load
window.addEventListener('load', () => {
    terminalInput.focus();
});
