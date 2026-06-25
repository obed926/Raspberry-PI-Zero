# RTAH Program Raspberry Pi TV Kiosk

This package builds the RTAH program web app from `/Users/obed/Desktop/Coding/RTAH-003S-PROGRAM` and installs it as an offline local kiosk on a Raspberry Pi connected to a TV by HDMI.

The Pi serves the built Vite files from:

```bash
/home/obed/rtah-program/app
```

The kiosk opens locally on the Pi:

```bash
http://127.0.0.1:8080/tv
```

The installed server binds to `0.0.0.0:8080`, so the app is also reachable from trusted devices on the same LAN, for example:

```bash
http://10.0.0.115:8080/tv
```

Do not port-forward this service or expose it to the public internet.

## Source App Inspection

- Build command: `npm run build`
- Build output: `dist`
- Framework: Vite + React
- Routing: React Router `BrowserRouter`
- TV route: `/tv`
- Static fallback requirement: unknown routes such as `/tv` must return `index.html`
- Runtime server: local Python 3 HTTP server with SPA fallback
- Runtime network: no internet is required to display the app after installation

The QR code in the TV view is generated locally by `qrcode.react`, but the encoded QR target is the public Vercel app:

```text
https://rtah-003-s-program.vercel.app
```

That QR target is intentionally online. The Pi does not need to reach it to display the local kiosk.

## Raspberry Pi OS Recommendation

Use Raspberry Pi OS with Desktop, preferably the current 64-bit release for a Pi Zero 2 W. A Pi Zero 1 may work but will be slow with Chromium; keep expectations modest and avoid running extra desktop applications.

Do not use Docker for this setup.

## Initial SD Card Setup

In Raspberry Pi Imager:

1. Select Raspberry Pi OS with Desktop.
2. Set the username to `obed` if possible.
3. Enable SSH.
4. Configure Wi-Fi only if you need it for setup or clock sync.
5. Set locale/timezone to `America/Chicago` if available.

Connect the Pi to the TV by HDMI before booting when possible.

## SSH Setup

Default copy target:

```bash
obed@pi-zero.local
```

If mDNS does not resolve, find the Pi IP address and use that instead:

```bash
./scripts/copy-to-pi.sh obed@192.168.1.50
```

## Build And Copy From Mac

From this folder:

```bash
cd /Users/obed/Desktop/Coding/Raspberry-PI-Zero
./scripts/copy-to-pi.sh
```

Or with an explicit IP:

```bash
./scripts/copy-to-pi.sh obed@192.168.1.50
```

The copy script builds the Vite app, packages this installer, copies it with `scp`, and prints the install commands.

## Install On Pi

After copying, SSH into the Pi and run:

```bash
ssh obed@pi-zero.local
mkdir -p ~/rtah-program-install
tar -xzf /tmp/rtah-program-pi-package.tar.gz -C ~/rtah-program-install
cd ~/rtah-program-install
./scripts/install-on-pi.sh
```

The installer:

- Installs Chromium, Python 3, curl, and optional `unclutter`
- Copies the production build into `/home/obed/rtah-program/app`
- Installs `rtah-program.service`
- Configures desktop autostart
- Sets timezone to `America/Chicago`
- Enables NTP when internet is available
- Disables screen blanking where possible
- Starts and verifies the local server

## HDMI Connection

Connect HDMI before booting when possible. If the screen stays blank, check the display, cable, and power supply first. Run:

```bash
./scripts/verify-pi.sh
```

The script reports HDMI status where the Pi OS exposes it.

## Automatic Startup

The local server starts with systemd:

```bash
sudo systemctl status rtah-program.service
```

The desktop starts Chromium through autostart. Current Raspberry Pi OS uses:

```bash
/home/obed/.config/labwc/autostart
```

Older Raspberry Pi OS releases may use:

```bash
/home/obed/.config/lxsession/LXDE-pi/autostart
```

The installer detects the available environment and appends this line only if it is not already present:

```bash
/home/obed/rtah-program/launch-kiosk.sh &
```

## Offline Operation

After installation, the app runs from local files and the local Python server. It does not depend on Vercel, GitHub, external APIs, external fonts, external images, CDN JavaScript, or analytics scripts for display.

The browser opens a local URL:

```bash
http://127.0.0.1:8080/tv
```

Other trusted devices on the same LAN can also view the TV route by using the Pi IP address:

```bash
http://<pi-ip-address>:8080/tv
```

## Timezone And Clock

The app reads the Raspberry Pi system clock. The event timezone is `America/Chicago`, and the installer runs:

```bash
sudo timedatectl set-timezone America/Chicago
sudo timedatectl set-ntp true
```

Verify time with:

```bash
timedatectl
date
```

Without a battery-backed RTC, a Raspberry Pi may lose accurate time after complete power loss while offline. Before the event, use one of these options:

- Briefly connect the Pi to internet so NTP can sync.
- Manually set the date/time.
- Install a supported RTC module.

Manual time example:

```bash
sudo date -s "2026-07-03 08:30:00"
```

Do not run that example unless you actually need to set the clock.

## Preventing Screen Blanking

The kiosk launcher runs these commands when available:

```bash
xset s off
xset -dpms
xset s noblank
unclutter -idle 1 -root
```

The installer also writes a LightDM display setting to disable DPMS where supported. Missing optional tools do not fail the installation.

## Updating The App

From the Mac:

```bash
cd /Users/obed/Desktop/Coding/Raspberry-PI-Zero
./scripts/update-on-pi.sh
```

Or:

```bash
./scripts/update-on-pi.sh obed@192.168.1.50
```

The update script:

1. Builds the current source app.
2. Copies the new `deploy` files to the Pi.
3. Backs up the previous installed app.
4. Replaces `/home/obed/rtah-program/app`.
5. Restarts `rtah-program.service`.
6. Restarts Chromium kiosk.
7. Verifies `http://127.0.0.1:8080/tv`.

## Verification

On the Pi:

```bash
cd ~/rtah-program-install
./scripts/verify-pi.sh
```

It checks timezone, local date/time, systemd status, HTTP response, Chromium, HDMI detection where possible, disk space, memory, and installed app version.

## Logs

Server logs:

```bash
journalctl -u rtah-program.service -f
```

Kiosk launcher log:

```bash
tail -f /home/obed/rtah-program/logs/kiosk.log
```

## Restart Commands

Restart the local server:

```bash
sudo systemctl restart rtah-program.service
```

Restart Chromium kiosk:

```bash
pkill chromium
```

The launcher will reopen Chromium automatically.

## Manual Launch

For testing from a desktop terminal:

```bash
/home/obed/rtah-program/launch-kiosk.sh
```

For server-only testing:

```bash
python3 /home/obed/rtah-program/serve_app.py --root /home/obed/rtah-program/app --host 127.0.0.1 --port 8080
```

## Exit Kiosk Mode

Use a keyboard:

```text
Alt+F4
```

Or SSH into the Pi:

```bash
pkill chromium
```

If the autostart launcher is still running, Chromium will reopen. To stop it temporarily, comment out the autostart line and reboot, or kill the launcher shell process.

## QR Code Check

The QR code should still point to:

```text
https://rtah-003-s-program.vercel.app
```

To verify in the built app, inspect the bundled assets:

```bash
grep -R "rtah-003-s-program.vercel.app" /home/obed/rtah-program/app/assets
```

The QR target is public by design. It is not needed for offline display on the TV.

## Troubleshooting

If `/tv` does not load:

```bash
curl -i http://127.0.0.1:8080/tv
journalctl -u rtah-program.service -n 100 --no-pager
```

If Chromium shows a toolbar or restore bubble, restart the kiosk:

```bash
pkill chromium
```

If the screen sleeps, verify `xset` from a terminal in the desktop session:

```bash
xset q
```

If the displayed program time is wrong, check:

```bash
timedatectl
date
```

Set Central Time again if needed:

```bash
sudo timedatectl set-timezone America/Chicago
```
