const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
const publicPath = path.join(__dirname, 'public');
const publicAssetsPath = path.join(publicPath, 'assets');
const protectedAssetsPath = path.join(__dirname, 'protected-assets');

// SECURITY: Store password hash instead of plain text
// generate hash using `generate-hash.js`
// Usage: ./generate-hash.js <your_password>
const SERVER_ASSET_PASSWORD_HASH = '$hashed_password';

// Store authenticated tokens (in production, use Redis or a proper session store)
const authTokens = new Map(); // token -> { expires: Date }
const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Helper function to read files from a directory
function getFilesFromDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            return {};
        }
        const files = fs.readdirSync(dirPath);
        const result = {};
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                result[file] = file;
            }
        });
        return result;
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return {};
    }
}

// Get public assets dynamically
function getPublicAssets() {
    return getFilesFromDirectory(publicAssetsPath);
}

// Get protected assets dynamically
function getProtectedAssets() {
    return getFilesFromDirectory(protectedAssetsPath);
}

// Clean up expired tokens periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, data] of authTokens.entries()) {
        if (now > data.expires) {
            authTokens.delete(token);
        }
    }
}, 60 * 1000); // Check every minute

// --- MIDDLEWARE ---

// 1. Enable parsing of JSON bodies (Required for the auth API)
app.use(express.json());

// 2. Detect if the request is from curl or a browser
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    req.isCurl = userAgent.toLowerCase().includes('curl');
    next();
});

// 3. SECURITY: Block direct access to protected-assets directory
// This middleware runs BEFORE express.static
app.use('/protected-assets', (req, res) => {
    res.status(403).send('Access denied');
});

// 4. Serve static files ONLY from the 'public' directory
// This hides server.js and node_modules from the outside world.
app.use(express.static(publicPath, { index: false }));


// --- API ROUTES ---

// Get public assets list (no auth required)
app.get('/api/public-assets', (req, res) => {
    const assets = getPublicAssets();
    res.json({ files: assets });
});

// Auth Endpoint: Client sends password, Server validates and returns token + protected file list
app.post('/api/auth-assets', async (req, res) => {
    const { password } = req.body;

    try {
        // Compare the password with the stored hash
        const isValid = await bcrypt.compare(password, SERVER_ASSET_PASSWORD_HASH);

        if (isValid) {
            console.log(`[Auth] Successful access from ${req.ip}`);

            // Generate a secure token
            const token = crypto.randomBytes(32).toString('hex');
            authTokens.set(token, { expires: Date.now() + TOKEN_EXPIRY_MS });

            // Get protected assets dynamically
            const protectedAssets = getProtectedAssets();

            res.json({
                success: true,
                token: token,
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

// Protected asset serving endpoint - requires valid token
app.get('/api/protected-asset/:filename', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const tokenData = authTokens.get(token);

    if (!tokenData || Date.now() > tokenData.expires) {
        authTokens.delete(token);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const filename = req.params.filename;
    const filePath = path.join(protectedAssetsPath, filename);

    // Security: Prevent directory traversal
    if (!filePath.startsWith(protectedAssetsPath)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists in protected assets
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    console.log(`[Protected] Serving ${filename} to authenticated user from ${req.ip}`);
    res.sendFile(filePath);
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
        res.send('404 - Not Found\nTry: curl example.com or curl https://example.com\n');
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
