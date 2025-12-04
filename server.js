const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const publicPath = path.join(__dirname, 'public');

// Middleware to detect curl vs browser
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    req.isCurl = userAgent.toLowerCase().includes('curl');
    next();
});

app.use(express.static(publicPath));

// Main route
app.get('/', (req, res) => {
    if (req.isCurl) {
        // Serve the text file for curl users
        let content = fs.readFileSync(path.join(publicPath, 'index.txt'), 'utf8');

        // Process escape codes (convert literal \x1b to actual ESC character)
        content = content.replace(/\\x1b/g, '\x1b');

        res.type('text/plain');
        res.send(content);
    } else {
        // Serve the HTML for browser users
        res.sendFile(path.join(publicPath, 'index.html'));
    }
});

// Projects route for curl
app.get('/projects', (req, res) => {
    if (req.isCurl) {
        let projects = fs.readFileSync(path.join(publicPath, 'projects.txt'), 'utf8');
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
        let resume = fs.readFileSync(path.join(publicPath, 'resume.txt'), 'utf8');
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
        let fun = fs.readFileSync(path.join(publicPath, 'fun.txt'), 'utf8');
        // Process escape codes
        fun = fun.replace(/\\x1b/g, '\x1b');
        res.type('text/plain');
        res.send(fun);
    } else {
        res.redirect('/');
    }
});

// Fun route for curl
app.get('/neofetch', (req, res) => {
    if (req.isCurl) {
        let fun = fs.readFileSync(path.join(publicPath, 'neofetch.txt'), 'utf8');
        // Process escape codes
        fun = fun.replace(/\\x1b/g, '\x1b');
        res.type('text/plain');
        res.send(fun);
    } else {
        res.redirect('/');
    }
});

// Serve static files (CSS, JS, assets)
app.use(express.static(publicPath));

// Handle other routes
app.get('*', (req, res) => {
    if (req.isCurl) {
        res.type('text/plain');
        res.send('404 - Not Found\nTry: curl profile.linm-m.com/projects or curl profile.linm-m.com/resume\n');
    } else {
        res.sendFile(path.join(publicPath, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Try: curl http://localhost:${PORT}`);
});

