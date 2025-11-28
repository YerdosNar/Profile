# Deployment Guide

## Quick Setup with Caddy

### 1. Install Dependencies
```bash
npm install --production
```

### 2. Set up the systemd service
```bash
# Copy the service file
sudo cp portfolio.service /etc/systemd/system/

# Edit the service file to match your paths
sudo nano /etc/systemd/system/portfolio.service

# Update these lines:
# User=your-username
# WorkingDirectory=/path/to/your/portfolio

# Reload systemd
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable portfolio

# Start the service
sudo systemctl start portfolio

# Check status
sudo systemctl status portfolio
```

### 3. Configure Caddy
```bash
# Copy Caddyfile to Caddy's config directory
sudo cp Caddyfile /etc/caddy/Caddyfile

# Edit the Caddyfile
sudo nano /etc/caddy/Caddyfile

# Replace 'yourdomain.com' with your actual domain

# Test the configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy
sudo systemctl reload caddy
```

### 4. Test Everything
```bash
# Test from browser
# Visit: https://yourdomain.com

# Test with curl
curl https://yourdomain.com
curl https://yourdomain.com/projects
curl https://yourdomain.com/resume
curl https://yourdomain.com/fun
```

## Useful Commands

### Service Management
```bash
# Start the service
sudo systemctl start portfolio

# Stop the service
sudo systemctl stop portfolio

# Restart the service
sudo systemctl restart portfolio

# View logs
sudo journalctl -u portfolio -f

# View last 100 lines
sudo journalctl -u portfolio -n 100
```

### Caddy Management
```bash
# Reload Caddy (no downtime)
sudo systemctl reload caddy

# Restart Caddy
sudo systemctl restart caddy

# Check Caddy logs
sudo journalctl -u caddy -f

# Validate Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
```

## Directory Structure on Server
```
/var/www/portfolio/
├── index.html
├── index.txt
├── style.css
├── script.js
├── server.js
├── package.json
└── node_modules/
```

## Troubleshooting

### Port already in use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 <PID>
```

### Permission issues
```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/portfolio

# Set correct permissions
sudo chmod -R 755 /var/www/portfolio
```

### Node.js not found
```bash
# Find node path
which node

# Update ExecStart in portfolio.service with the correct path
```

## How It Works

1. **Browser Request**: `https://yourdomain.com`
   - User-Agent: Mozilla/...
   - Caddy → Node.js server → Serves `index.html`
   - User sees interactive terminal website

2. **curl Request**: `curl https://yourdomain.com`
   - User-Agent: curl/...
   - Caddy → Node.js server → Serves `index.txt` with ANSI colors
   - User sees colored terminal output

## Security Notes

- Caddy automatically handles HTTPS with Let's Encrypt
- Security headers are configured in Caddyfile
- Node.js runs as www-data (non-root)
- Service restarts automatically on failure
