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

// Assets authentication
let assetsAuthenticated = false;
const ASSETS_PASSWORD = 'your_secure_password_here'; // Change this to your desired password

// Public assets (always visible)
const publicAssets = {
    'arch.iso': 'assets/arch.iso'
};

// Protected assets (require authentication)
const protectedAssets = {
    '35_45_profile.png': 'assets/35_45_profile.png',
    'TOPIK_6lvl.png': 'assets/TOPIK_6lvl.png',
    'IELTS.png': 'assets/IELTS.png',
    'curl_index.png': 'assets/curl_index.png',
    'failed.jpg': 'assets/failed.jpg',
    'index_screenshot.png': 'assets/index_screenshot.png'
};

// Combined assets based on authentication
function getAssets() {
    if (assetsAuthenticated) {
        return { ...publicAssets, ...protectedAssets };
    }
    return publicAssets;
}

const directories = {
    '~': ['Projects', 'AboutMe', 'Contact', 'Assets', 'intro.txt'],
    '~/Projects': Object.keys(projects),
    '~/AboutMe': ['about.txt'],
    '~/Contact': ['contact.txt'],
    get '~/Assets'() {
        return Object.keys(getAssets());
    }
};

function updateTerminalPath(section) {
    const pathMap = {
        'home': '~',
        'projects': '~/Projects',
        'about': '~/AboutMe',
        'contact': '~/Contact',
        'assets': '~/Assets'
    };
    currentDir = pathMap[section] || currentDir;
    currentPath.textContent = currentDir;

    // Auto-execute commands when navigating to sections
    if (section === 'projects') {
        executeCommand('ls -la');
    } else if (section === 'about') {
        executeCommand('cat about.txt');
    } else if (section === 'contact') {
        executeCommand('cat contact.txt');
    } else if (section === 'assets') {
        executeCommand('ls -la');
    }
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
            let output = '';

            // Check if -la flag is present
            const isLongFormat = args.includes('-la') || args.includes('-l') || args.includes('-a');

            if (currentDir === '~/Projects' && isLongFormat) {
                // Show fancy ls -la output for Projects
                const projectsList = [
                    { name: 'PNG_file_reader', url: 'https://github.com/YerdosNar/png.git' },
                    { name: '3X-UI_auto_installer', url: 'https://github.com/YerdosNar/3x-ui-auto.git' },
                    { name: 'NN_handwritten_digits', url: 'https://github.com/YerdosNar/digitNN.git' },
                    { name: 'Profile', url: 'https://github.com/YerdosNar/Profile.git' }
                ];

                output = '<div class="file-list">';
                projectsList.forEach(project => {
                    output += `<div class="file-item">
                        <span class="permissions">drwxr-xr-x</span>
                        <span class="links">2</span>
                        <span class="owner">yerdos</span>
                        <span class="group">users</span>
                        <span class="size">4096</span>
                        <span class="date">Nov 29 2025</span>
                        <a href="${project.url}" class="file-name" target="_blank" rel="noopener">${project.name}/</a>
                    </div>`;
                });
                output += '</div>';
            } else if (currentDir === '~/Assets' && isLongFormat) {
                // Show fancy ls -la output for Assets
                const currentAssets = getAssets();
                output = '<div class="file-list">';
                Object.entries(currentAssets).forEach(([name, path]) => {
                    const size = name.includes('png') ? '2.3M' : name.includes('iso') ? '850M' : '156K';
                    output += `<div class="file-item">
                        <span class="permissions">-rw-r--r--</span>
                        <span class="links">1</span>
                        <span class="owner">yerdos</span>
                        <span class="group">users</span>
                        <span class="size">${size}</span>
                        <span class="date">Dec 04 2025</span>
                        <a href="${path}" class="file-name" target="_blank" rel="noopener">${name}</a>
                    </div>`;
                });
                output += '</div>';
                if (!assetsAuthenticated) {
                    output += '<p style="color: #ff6b6b; margin-top: 15px; padding: 10px; border: 1px solid #ff6b6b; border-radius: 4px;">⚠️ To access other files, contact me or use: <span style="color: #7dcfff;">auth &lt;password&gt;</span></p>';
                }
            } else {
                // Simple format
                output = items.map(item => {
                    if (currentDir === '~/Projects') {
                        return `<span class="file-name">${item}/</span>`;
                    }
                    return item.endsWith('.txt') ? item : `<span class="file-name">${item}/</span>`;
                }).join('  ');
            }

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
                    } else if (targetDir === 'Assets') {
                        currentDir = '~/Assets';
                        currentPath.textContent = '~/Assets';
                        addToHistory(input, '');
                        navButtons[4].click();
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
            } else if (currentDir === '~/Assets') {
                const currentAssets = getAssets();
                if (currentAssets[args[0]]) {
                    // For image files in Assets, show them as images
                    addToHistory(input, `<div class="asset-preview">
                        <img src="${currentAssets[args[0]]}" alt="${args[0]}" style="max-width: 100%; border: 2px solid #1793d1; border-radius: 4px; margin-top: 10px;">
                        <p style="margin-top: 10px; color: #8b949e;">Certificate: ${args[0]}</p>
                    </div>`);
                } else if (protectedAssets[args[0]] && !assetsAuthenticated) {
                    addToHistory(input, `cat: ${args[0]}: Permission denied. Use 'auth <password>' to access.`, true);
                } else {
                    addToHistory(input, `cat: ${args[0]}: No such file or directory`, true);
                }
            } else if (args[0] === 'intro.txt' && currentDir === '~') {
                addToHistory(input, `<h2>Welcome to My Portfolio</h2>
                            <p>I'm Yerdos, a 💻 Computer Science & Engineering student living in 🇰🇷 Korea.</p>
                            <p>I'm passionate about low-level programming, networking, and security — and I'm currently learning deeper C, Assembly, and system-level development.</p>`);
            } else if (args[0] === 'about.txt') {
                if (currentDir === '~/AboutMe' || currentDir === '~') {
                    addToHistory(input, `<h2>About Me</h2>
                            <p>I'm Yerdos, a 💻 Computer Science & Engineering student living in 🇰🇷 Korea.</p>
                            <p>I'm passionate about low-level programming, networking, and security — and I'm currently learning deeper C, Assembly, and system-level development.</p>
                            <p>I love exploring how computers work at the lowest levels, understanding network protocols, and building secure systems.</p>`);
                } else {
                    addToHistory(input, `cat: ${args[0]}: No such file or directory`, true);
                }
            } else if (args[0] === 'contact.txt') {
                if (currentDir === '~/Contact' || currentDir === '~') {
                    addToHistory(input, `<h2>Contact</h2>
                            <p>📧 Email: <span class="file-name">yerdosnarzhigit@gmail.com</span></p>
                            <p>👾 GitHub: <a href="https://github.com/YerdosNar" target="_blank" class="file-name">github.com/YerdosNar</a></p>
                            <p>💼 LinkedIn: <a href="https://linkedin.com/in/YerdosNar" class="file-name">YerdosNar</a></p>
                            <p>🐦 Twitter/X: <a href="https://x.com/YerdosNar" class="file-name">@YerdosNar</a></p>
                            <p>📷 Instagram: <a href="https://instagram.com/uvenni" class="file-name">@uvenni</a></p>`);
                } else {
                    addToHistory(input, `cat: ${args[0]}: No such file or directory`, true);
                }
            } else {
                addToHistory(input, `cat: ${args[0]}: No such file or directory`, true);
            }
            break;

        case 'auth':
            if (!args[0]) {
                addToHistory(input, 'auth: missing password. Usage: auth <password>', true);
            } else if (currentDir === '~/Assets') {
                if (args[0] === ASSETS_PASSWORD) {
                    assetsAuthenticated = true;
                    addToHistory(input, '<span style="color: #7dcfff;">✓ Authentication successful! All assets are now accessible.</span>');
                    // Refresh the display
                    setTimeout(() => executeCommand('ls -la'), 100);
                } else {
                    addToHistory(input, '<span style="color: #ff6b6b;">✗ Authentication failed. Invalid password.</span>', true);
                }
            } else {
                addToHistory(input, 'auth: command only works in ~/Assets directory', true);
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
                <span class="command">auth [password]</span> - authenticate for protected assets<br>
                <span class="command">clear</span> - clear terminal<br>
                <span class="command">help</span> - show this help message<br><br>
                <strong>Navigation:</strong><br>
                cd Projects, cd AboutMe, cd Contact, cd Assets<br>
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
