const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to detect curl vs browser
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    req.isCurl = userAgent.toLowerCase().includes('curl');
    next();
});

// Main route
app.get('/', (req, res) => {
    if (req.isCurl) {
        // Serve the text file for curl users
        let indexTxt = fs.readFileSync(path.join(__dirname, 'index.txt'), 'utf8');
        
        // Convert \033 (literal text) to actual ESC character
        indexTxt = indexTxt.replace(/\\033/g, '\x1b');
        
        // Replace placeholder with actual IP
        const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        const output = indexTxt.replace('<public IP>', clientIP);
        
        res.type('text/plain');
        res.send(output);
    } else {
        // Serve the HTML for browser users
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Projects route for curl
app.get('/projects', (req, res) => {
    if (req.isCurl) {
        const projects = `
\x1b[38;2;23;147;209m+=========================================================================================+
|                                     MY PROJECTS                                         |
+=========================================================================================+\x1b[0m

\x1b[1;33m1. PNG File Reader\x1b[0m
   \x1b[1;34mhttps://github.com/YerdosNar/png.git\x1b[0m
   A PNG file format parser and reader

\x1b[1;33m2. 3X-UI Auto Installer\x1b[0m
   \x1b[1;34mhttps://github.com/YerdosNar/3x-ui-auto.git\x1b[0m
   Automated installation script for 3X-UI

\x1b[1;33m3. Neural Network - Handwritten Digits\x1b[0m
   \x1b[1;34mhttps://github.com/YerdosNar/digitNN.git\x1b[0m
   Neural network for recognizing handwritten digits

\x1b[1;33m4. Portfolio Website\x1b[0m
   \x1b[1;34mhttps://github.com/YerdosNar/Profile.git\x1b[0m
   This website! Terminal-styled portfolio

\x1b[38;2;23;147;209m+=========================================================================================+\x1b[0m
`;
        res.type('text/plain');
        res.send(projects);
    } else {
        res.redirect('/#projects');
    }
});

// Resume route for curl
app.get('/resume', (req, res) => {
    if (req.isCurl) {
        const resume = `
\x1b[38;2;23;147;209m+=========================================================================================+
|                                     RESUME / CV                                         |
+=========================================================================================+\x1b[0m

\x1b[1;33mYerdos - Software Developer\x1b[0m

\x1b[1;32mInterests:\x1b[0m
  • Low-level programming
  • Network programming & traffic obfuscation
  • Cyber Security
  • Systems programming

\x1b[1;32mSkills:\x1b[0m
  • Programming Languages: C, C++, Python, JavaScript
  • Technologies: Linux, Networking, Web Development
  • Tools: Git, Docker, Node.js

\x1b[38;2;23;147;209m+=========================================================================================+\x1b[0m
`;
        res.type('text/plain');
        res.send(resume);
    } else {
        res.redirect('/#about');
    }
});

// Fun route for curl
app.get('/fun', (req, res) => {
    if (req.isCurl) {
        const fun = `
\x1b[38;2;23;147;209m+=========================================================================================+\x1b[0m
                                     
    \x1b[1;31m _____                 _                    
   |_   _|__  _ __ _ __ (_)_ __   __ _ ___  
     | |/ _ \\| '__| '_ \\| | '_ \\ / _\` / __|
     | |  __/| |  | | | | | | | | (_| \\__ \\
     |_|\\___||_|  |_| |_|_|_| |_|\\__,_|___/\x1b[0m
                                     
\x1b[1;33m   "In theory, there is no difference between theory and practice.
    But in practice, there is."\x1b[0m
                                     - Yogi Berra
                                     
\x1b[38;2;23;147;209m+=========================================================================================+\x1b[0m
`;
        res.type('text/plain');
        res.send(fun);
    } else {
        res.redirect('/');
    }
});

// Serve static files (CSS, JS, assets)
app.use(express.static(__dirname));

// Handle other routes
app.get('*', (req, res) => {
    if (req.isCurl) {
        res.type('text/plain');
        res.send('404 - Not Found\nTry: curl domain.com/projects or curl domain.com/resume');
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Try: curl http://localhost:${PORT}`);
});
