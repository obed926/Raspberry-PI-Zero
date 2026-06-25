#!/usr/bin/env bash
set -euo pipefail

DESTINATION="${1:-obed@pi-zero.local}"
PACKAGE_ROOT="/Users/obed/Desktop/Coding/Raspberry-PI-Zero"
ARCHIVE="${PACKAGE_ROOT}/rtah-program-pi-package.tar.gz"
REMOTE_TMP="/tmp/rtah-program-pi-package.tar.gz"

log() {
  printf '[copy-to-pi] %s\n' "$*"
}

cd "${PACKAGE_ROOT}"
"${PACKAGE_ROOT}/scripts/build-app.sh"

log "Creating archive ${ARCHIVE}"
tar -czf "${ARCHIVE}" \
  README.md \
  deploy \
  scripts/serve_app.py \
  scripts/install-on-pi.sh \
  scripts/update-on-pi.sh \
  scripts/verify-pi.sh \
  systemd/rtah-program.service \
  kiosk/launch-kiosk.sh \
  kiosk/labwc-autostart-entry.txt

log "Copying archive to ${DESTINATION}:${REMOTE_TMP}"
scp "${ARCHIVE}" "${DESTINATION}:${REMOTE_TMP}"

cat <<EOF

Copied package to ${DESTINATION}.

Complete installation on the Raspberry Pi with:

  ssh ${DESTINATION}
  mkdir -p ~/rtah-program-install
  tar -xzf ${REMOTE_TMP} -C ~/rtah-program-install
  cd ~/rtah-program-install
  ./scripts/install-on-pi.sh

If pi-zero.local does not resolve, rerun this script with an IP address:

  ./scripts/copy-to-pi.sh obed@192.168.1.50
EOF
