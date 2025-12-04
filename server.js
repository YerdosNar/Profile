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
        let content = fs.readFileSync(path.join(__dirname, 'index.txt'), 'utf8');

        // Process escape codes (convert literal \x1b to actual ESC character)
        content = content.replace(/\\x1b/g, '\x1b');

        // Replace placeholder with actual IP if exists
        const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        content = content.replace(/<public IP>/g, clientIP);

        res.type('text/plain');
        res.send(content);
    } else {
        // Serve the HTML for browser users
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Projects route for curl
app.get('/projects', (req, res) => {
    if (req.isCurl) {
        let projects = fs.readFileSync(path.join(__dirname, 'projects.txt'), 'utf8');
        // Process escape codes
        projects = projects.replace(/\\x1b/g, '\x1b');
        res.type('text/plain');
        res.send(projects);
    } else {
        res.redirect('/#projects');
    }
});

// Resume route for curl
app.get('/resume', (req, res) => {
    if (req.isCurl) {
        let resume = fs.readFileSync(path.join(__dirname, 'resume.txt'), 'utf8');
        // Process escape codes
        resume = resume.replace(/\\x1b/g, '\x1b');
        res.type('text/plain');
        res.send(resume);
    } else {
        res.redirect('/#about');
    }
});

// Fun route for curl
app.get('/fun', (req, res) => {
    if (req.isCurl) {
        let fun = fs.readFileSync(path.join(__dirname, 'fun.txt'), 'utf8');
        // Process escape codes
        fun = fun.replace(/\\x1b/g, '\x1b');
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
