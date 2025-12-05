# Profile page (`curl`able)

- ## Simple profile page for recruiters.
![index.html Page](./public/assets/index_screenshot.png)

- ## You can also `curl linm-m.com`
![curl linm-m.com](./public/assets/curl_index.png)

- ## Installation
    - #### Clone to profile directory
        ```bash
        sudo mkdir -p /var/www/profile
        sudo git clone https://github.com/YerdosNar/Profile.git /var/www/profile
        ```
    - #### Change owner to `www-data`
        >Usually `www-data` user exists by default.\
        >Check with `id www-data`\
        >If it doesn't exist, run `sudo useradd -r -s /usr/sbin/nologin www-data`
        ```bash
        sudo chown -R www-data:www-data /var/www/profile
        ```
    - #### Install dependencies as `www-data`
        ```bash
        cd /var/www/profile
        sudo -u www-data npm install
        ```
    - #### Copy `profile.service`
        ```bash
        sudo cp /var/www/profile/profile.service /etc/systemd/system/
        ```
    - #### Reload `daemon-reload` and start
        ```bash
        sudo systemctl daemon-reload
        sudo systemctl enable profile
        sudo systemctl start profile
        ```
    - #### Check status
        ```bash
        sudo systemctl status profile
        ```

    - #### Content of `profile.service`
        ```service
        [Unit]
        Description=Profile Portfolio Website
        After=network.target

        [Service]
        Type=simple
        User=www-data
        Group=www-data
        WorkingDirectory=/var/www/profile
        ExecStart=/usr/bin/node server.js
        Restart=on-failure
        RestartSec=10
        StandardOutput=syslog
        StandardError=syslog
        SyslogIdentifier=profile
        Environment=NODE_ENV=production
        Environment=PORT=3000

        [Install]
        WantedBy=multi-user.target
        ```

- ## `curl` support
    - #### `curl` without `https://`
        - ##### Caddyfile content
            >To run `curl your.website.com` without writing `https://` I recommend two domain names (because I am inexperienced, and I don't know other ways)

            ```Caddyfile
            your.website.com:80 { # This domain name for `curl`ing
                root * /var/www/profile/public # or your own
                @terminal {
                    header User-Agent *curl*
                    header User-Agent *wget*
                    header User-Agent *fetch*
                }

                handle @terminal {
                    header Content-Type "text/plain; charset=utf-8"

                    rewrite /projects projects.txt
                    rewrite /resume resume.txt
                    rewrite /fun fun.txt

                    rewrite / index.txt

                    file_server
                }

                handle {
                    header Content-Type "text/plain"
                    response "Terminal only. Use `curl your.website.com` or visit `secure.website.com`" 403
                }
            }

            secure.website.com:443 { # This domain name for browsing
                reverse_proxy localhost:3000
            }
            ```
            Try
            ```bash
            curl your.website.com
            ```
    - #### `curl` with `https://`
        - ##### Caddyfile content:
            ```Caddyfile
            your.website.com {
                reverse_proxy localhost:3000
            }
            ```
            Try
            ```
            curl https://your.website.com
            ```
    - #### Firewall
        ```bash
        sudo ufw allow 80
        sudo ufw allow 443
        sudo ufw enable
        ```
