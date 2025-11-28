# Terminal Portfolio

A terminal-styled portfolio website that serves different content for browser and curl users.

## Features

- 🖥️ **Terminal-styled UI** for browser users with interactive commands
- 🔧 **curl-friendly** with ANSI colored output
- 🎨 **Arch Linux themed** with neon blue accents
- ⚡ **Interactive terminal** with real bash-like commands

## Usage

### For Browser Users
Visit the website normally in your browser to see the interactive terminal interface.

### For curl Users
```bash
# Main page
curl yourdomain.com

# View projects
curl yourdomain.com/projects

# View resume
curl yourdomain.com/resume

# Fun stuff
curl yourdomain.com/fun
```

## Setup

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on port 3000 by default (or `PORT` environment variable).

## Testing Locally

```bash
# Start the server
npm start

# In another terminal, test with curl
curl http://localhost:3000
curl http://localhost:3000/projects
curl http://localhost:3000/resume
```

## Deployment

This can be deployed to:
- **Vercel** (with serverless functions)
- **Heroku**
- **DigitalOcean**
- **Any VPS** with Node.js

## File Structure

```
.
├── index.html      # Main HTML for browser users
├── index.txt       # Formatted text for curl users
├── style.css       # Styling
├── script.js       # Interactive terminal logic
├── server.js       # Express server (curl detection)
├── package.json    # Dependencies
└── README.md       # This file
```

## How It Works

The server detects the `User-Agent` header:
- If it contains "curl" → serves plain text with ANSI colors
- Otherwise → serves the HTML website

## License

MIT
