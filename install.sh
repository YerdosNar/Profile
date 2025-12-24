#!/usr/bin/env bash

readonly noc="\033[0m"
readonly red="\033[31m"
readonly grn="\033[32m"
readonly yel="\033[33m"
readonly blu="\033[34m"
readonly cyn="\033[36m"
readonly bld="\033[1m"

WIDTH=$(tput cols)
[ "$WIDTH" -gt 90 ] && WIDTH=85

# Logic to truncate and pad
print_line() {
    local symbol="$1"
    local color="$2"
    local raw_msg="$3"
    local out_stream="${4:-1}" # Default to stdout (1)

    # 1. Truncate the message to the WIDTH
    local msg="${raw_msg:0:$((WIDTH-3))}"
    local msg_len=${#msg}

    # 2. Calculate dots (if any)
    local dots_needed=$((WIDTH - msg_len))
    local dots=""
    if [ "$dots_needed" -gt 0 ]; then
        dots=$(printf '%*s' "$dots_needed" '' | tr ' ' '.')
    fi

    # 3. Print the formatted line
    printf "${color}${bld}[%s]>${noc}%s${color}${bld}%s<[%s]${noc}\n" \
        "$symbol" "$msg" "$dots" "$symbol" >&"$out_stream"
}

info()    { print_line "i" "$blu" "$1"       ;  }
success() { print_line "✓" "$grn" "$1"       ;  }
warn()    { print_line "!" "$yel" "$1"       ;  }
error()   { print_line "X" "$red" "$1" 2     ;  }
banner()    { echo -e "${cyn}${bld}$1${noc}" ;  }

log_info()      { echo "[ INFO ]  $1" >> "$LOG_FILE";       }
log_success()   { echo "[SUCCESS] $1" >> "$LOG_FILE"       &&
                  echo ""             >> "$LOG_FILE";       }
log_warn()      { echo "[ WARN ]  $1" >> "$LOG_FILE";       }
log_error()     { echo "[ ERROR ] $1" >> "$LOG_FILE" 2>&1;  }
log_banner()    { echo "[BANNER ] $1" >> "$LOG_FILE";       }

LOG_FILE="/tmp/.profile_$$.txt"
INSTALL_DIR="/var/www/profile_$$"

check_requirements() {
    info "Checking the requirements"
    info "Checking sudo"
    if ! sudo -v; then
        error "Sudo authentication failed. You need sudo privileges"
        exit 1
    fi

    info "Checking www-data"
    if ! id www-data &>/dev/null; then
        warn "No www-data user found"
        info "Creating user www-data"
        sudo useradd -r -s /usr/sbin/nologin www-data
        success "Created www-data user"
    else
        success "www-data user exists"
    fi

    info "Checking $INSTALL_DIR directory"
    if [ -d "$INSTALL_DIR" ] && [ "$(ls -A /var/www/profile* 2>/dev/null)" ]; then
        error "$INSTALL_DIR already exists and is not empty"
        warn "Remove it first with: sudo rm -rf $INSTALL_DIR"
        exit 1
    fi
    sudo mkdir -p "$INSTALL_DIR"
    success "Created $INSTALL_DIR directory"

    local missing_cmds=()
    for cmd in curl ufw systemctl caddy npm node; do
        if ! command -v $cmd &>/dev/null; then
            missing_cmds+=("$cmd")
        fi
    done

    if [ ${#missing_cmds[@]} -gt 0 ]; then
        error "Missing required commands: ${missing_cmds[*]}"
        warn "Install them and re-run '$ bash <(curl -Ls https://raw.githubusercontent.com/YerdosNar/Profile/master/install.sh)"
        exit 1
    fi

    success "System requirements check passed!"
}

validate_domain() {
    local domain="$1"
    info "Validating domain name..."
    if [[ ! "$domain" =~ ^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9]{2,}$ ]]; then
        error "Invalid domain name format: $domain"
        return 1
    fi
    success "Domain is valid!"
    return 0
}

write_caddyfile() {
    info "Caddyfile installation"
    local base_caddyfile=$(cat Caddyfile)
    local domain="$1"

    cat > caddyfile << EOF
# ==========================
# $domain config
# ==========================
# For browsing
$domain:443 {
    tls {
        protocols tls1.3
    }

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options nosniff
        X-Frame-Options SAMEORIGIN
        Referrer-Policy strict-origin-when-cross-origin
        -Server
        -X-Powered-By
    }

    reverse_proxy localhost:3000
}

# Support cURL without https
$domain:80 {
    root * $INSTALL_DIR/public
    @terminal {
        header User-Agent *curl*
        header User-Agent *wget*
        header User-Agent *fetch*
    }

    handle @terminal {
        header Content-Type "text/plain; charset=utf-8"

        rewrite /projects projects.txt
        rewrite /neofetch neofetch.txt
        rewrite /resume resume.txt
        rewrite /fun fun.txt
        rewrite / index.txt

        templates

        file_server
    }
}
EOF

    if [ -f /etc/caddy/Caddyfile ] && [ -s /etc/caddy/Caddyfile ]; then
        warn "Existing Caddyfile found"
        local append
        read -p "Should we append to existing Caddyfile? [Y/n]: " append
        append=${append:-Y}
        if [[ "$append" =~ ^[Yy]$ ]]; then
            info "Appending..."
            echo "# Appended in $(date)" | sudo tee -a /etc/caddy/Caddyfile
            cat caddyfile | sudo tee -a /etc/caddy/Caddyfile
            warn "Appended to existing Caddyfile. Review /etc/caddy/Caddyfile to remove any conflicting config."
            success "Appended!"
        else
            warn "Not appended. Caddyfile saved to /var/www/profile/Caddyfile_temp"
            sudo cp caddyfile /var/www/profile/
            return 0
        fi
    else
        sudo cp caddyfile /etc/caddy/Caddyfile
    fi

    sudo caddy fmt --overwrite /etc/caddy/Caddyfile 2>/dev/null || true
    if sudo caddy validate --config /etc/caddy/Caddyfile 2>&1 | grep -q "valid"; then
        success "Caddyfile validation successful"
    else
        error "Caddyfile validation failed"
        warn "Check /etc/caddy/Caddyfile for syntax errors"
        exit 1
    fi

    sudo systemctl daemon-reload
    sudo systemctl enable caddy
    sudo systemctl start caddy
    if systemctl is-active --quiet caddy; then
        success "Installed Caddyfile"
    else
        error "Cannot start Caddy"
    fi
}

install_git_clone() {
    info "Cloning repository"
    if ! sudo git clone https://github.com/YerdosNar/Profile.git /var/www/profile; then
        error "Failed to clone repository"
        exit 1
    fi
    success "Repository cloned"

    info "Copying profile.service"
    sudo cp /var/www/profile/profile.service /etc/systemd/system/

    info "Changing the ownership to www-data"
    sudo chown -R www-data:www-data /var/www/profile

    info "Installing dependencies"
    cd /var/www/profile || exit 1
    if ! sudo -u www-data npm install --production 2>&1 | tail -5; then
        error "Failed to install npm dependencies"
        exit 1
    fi
    success "Dependencies installed"

    info "Starting daemon/server"
    sudo systemctl daemon-reload
    sudo systemctl enable profile
    if sudo systemctl start profile; then
        success "Profile service started"
    else
        error "Failed to start profile service"
        sudo systemctl status profile
        exit 1
    fi
}

main() {
    clear
    banner "=========================================="
    banner "       Profile Page installer"
    banner "=========================================="

    check_requirements

    while true;
    do
        read -p "Please enter your domain name: " DOMAIN
        if [ -z "$DOMAIN" ]; then
            error "Domain cannot be empty"
            continue
        fi
        if validate_domain "$DOMAIN"; then
            success "Your domain is: $DOMAIN"
            break
        else
            continue
        fi
    done

    local USE_SUBDOMAIN
    read -p "Do you have a separate subdomain for curl (without https://)? [y/N]: " USE_SUBDOMAIN
    USE_SUBDOMAIN=${USE_SUBDOMAIN:-n}
    if [[ "$USE_SUBDOMAIN" =~ ^[Yy]$ ]]; then
        while true;
        do
            read -p "Please enter your curl subdomain: " SUBDOMAIN
            if [ -z "$SUBDOMAIN" ]; then
                error "Domain cannot be empty"
                continue
            fi
            if validate_domain "$SUBDOMAIN"; then
                success "Your curl subdomain is: $SUBDOMAIN"
                break
            else
                continue
            fi
        done
    else
        SUBDOMAIN="no"
    fi

    install_git_clone
    write_caddyfile "$SUBDOMAIN" "$DOMAIN"

    echo ""
    success "Installation completed!"
    echo ""
    info "Open in your browser: https://$DOMAIN"
    if [ "$SUBDOMAIN" != "no" ]; then
        info "Try: curl $SUBDOMAIN"
    else
        info "Try: curl https://$DOMAIN"
    fi
}

main "$@"
