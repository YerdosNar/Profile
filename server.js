const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
const publicPath = path.join(__dirname, 'public');

// SECURITY: Store password hash instead of plain text
// generate hash using `generate-hash.js`
// Usage: ./generate-hash.js <your_password>
const SERVER_ASSET_PASSWORD_HASH = '$2b$10$example.hash.replace.this.with.your.actual.bcrypt.hash';

// SECURITY: Define protected assets here.
// These paths are only sent to the client after successful auth.
const protectedAssets = {
    '35_45_profile.png': 'assets/35_45_profile.png',
    'TOPIK_6lvl.png': 'assets/TOPIK_6lvl.png',
    'IELTS.png': 'assets/IELTS.png',
};

// --- MIDDLEWARE ---

// 1. Enable parsing of JSON bodies (Required for the auth API)
app.use(express.json());

// 2. Detect if the request is from curl or a browser
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    req.isCurl = userAgent.toLowerCase().includes('curl');
    next();
});

// 3. Serve static files ONLY from the 'public' directory
// This hides server.js and node_modules from the outside world.
app.use(express.static(publicPath, { index: false }));


// --- API ROUTES ---

// Auth Endpoint: Client sends password, Server validates and returns secret file list
app.post('/api/auth-assets', async (req, res) => {
    const { password } = req.body;

    try {
        // Compare the password with the stored hash
        const isValid = await bcrypt.compare(password, SERVER_ASSET_PASSWORD_HASH);

        if (isValid) {
            console.log(`[Auth] Successful access from ${req.ip}`);
            res.json({
                success: true,
                files: protectedAssets
            });
        } else {
            console.log(`[Auth] Failed attempt from ${req.ip}`);
            res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }
    } catch (error) {
        console.error('[Auth] Error during password verification:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
});


// --- PAGE ROUTES ---

// Main route
app.get('/', (req, res) => {
    if (req.isCurl) {
        // Read from 'public' folder
        const filePath = path.join(publicPath, 'index.txt');
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Process escape codes
            content = content.replace(/\\x1b/g, '\x1b');

            res.type('text/plain');
            res.send(content);
        } else {
            res.status(500).send('Error: index.txt not found on server.');
        }
    } else {
        // Serve HTML
        res.sendFile(path.join(publicPath, 'index.html'));
    }
});

// Projects route
app.get('/projects', (req, res) => {
    if (req.isCurl) {
        const filePath = path.join(publicPath, 'projects.txt');
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/\\x1b/g, '\x1b');
            res.type('text/plain');
            res.send(content);
        } else {
            res.status(404).send('Project list not found.');
        }
    } else {
        res.redirect('/#projects');
    }
});

// Resume route
app.get('/resume', (req, res) => {
    if (req.isCurl) {
        const filePath = path.join(publicPath, 'resume.txt');
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/\\x1b/g, '\x1b');
            res.type('text/plain');
            res.send(content);
        } else {
            res.status(404).send('Resume not found.');
        }
    } else {
        res.redirect('/#about');
    }
});

// Fun route
app.get('/fun', (req, res) => {
    if (req.isCurl) {
        const filePath = path.join(publicPath, 'fun.txt');
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/\\x1b/g, '\x1b');
            res.type('text/plain');
            res.send(content);
        } else {
            res.status(404).send('Fun file not found.');
        }
    } else {
        res.redirect('/');
    }
});

// Neofetch route
app.get('/neofetch', (req, res) => {
    if (req.isCurl) {
        const filePath = path.join(publicPath, 'neofetch.txt');
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/\\x1b/g, '\x1b');
            res.type('text/plain');
            res.send(content);
        } else {
            res.status(404).send('Neofetch file not found.');
        }
    } else {
        res.redirect('/');
    }
});

// Catch-all 404 handler
app.get('*', (req, res) => {
    if (req.isCurl) {
        res.type('text/plain');
        res.send('404 - Not Found\nTry: curl profile.linm-m.com/projects or curl profile.linm-m.com/resume\n');
    } else {
        // Redirect browser users back to home or show custom 404 page
        res.status(404).sendFile(path.join(publicPath, 'index.html'));
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving static files from: ${publicPath}`);
});
