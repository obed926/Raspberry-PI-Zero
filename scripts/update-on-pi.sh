#!/usr/bin/env bash
set -euo pipefail

DESTINATION="${1:-obed@pi-zero.local}"
PACKAGE_ROOT="/Users/obed/Desktop/Coding/Raspberry-PI-Zero"
ARCHIVE="${PACKAGE_ROOT}/rtah-program-update.tar.gz"
REMOTE_ARCHIVE="/tmp/rtah-program-update.tar.gz"
REMOTE_SCRIPT="/tmp/rtah-program-update-apply.sh"

log() {
  printf '[update-on-pi] %s\n' "$*"
}

cd "${PACKAGE_ROOT}"
"${PACKAGE_ROOT}/scripts/build-app.sh"

log "Creating update archive ${ARCHIVE}"
tar -czf "${ARCHIVE}" deploy scripts/serve_app.py

log "Copying update archive to ${DESTINATION}:${REMOTE_ARCHIVE}"
scp "${ARCHIVE}" "${DESTINATION}:${REMOTE_ARCHIVE}"

ssh "${DESTINATION}" "cat > ${REMOTE_SCRIPT} && chmod +x ${REMOTE_SCRIPT}" <<'REMOTE'
#!/usr/bin/env bash
set -euo pipefail

TARGET_USER="${RTAH_USER:-obed}"
if ! id "${TARGET_USER}" >/dev/null 2>&1; then
  TARGET_USER="$(id -un)"
fi

RUNTIME_ROOT="/home/${TARGET_USER}/rtah-program"
APP_DIR="${RUNTIME_ROOT}/app"
BACKUP_DIR="${RUNTIME_ROOT}/app.backup.$(date +%Y%m%d%H%M%S)"
STAGING_DIR="${RUNTIME_ROOT}/app.staging"
ARCHIVE="/tmp/rtah-program-update.tar.gz"

echo "[update-on-pi] Applying update as ${TARGET_USER}"
mkdir -p "${STAGING_DIR}"
rm -rf "${STAGING_DIR:?}"/*
tar -xzf "${ARCHIVE}" -C "${STAGING_DIR}"
test -f "${STAGING_DIR}/deploy/index.html"

cp "${STAGING_DIR}/scripts/serve_app.py" "${RUNTIME_ROOT}/serve_app.py"
chmod 0755 "${RUNTIME_ROOT}/serve_app.py"

if [[ -d "${APP_DIR}" ]]; then
  mv "${APP_DIR}" "${BACKUP_DIR}"
fi
mkdir -p "${APP_DIR}"
find "${APP_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -R "${STAGING_DIR}/deploy/." "${APP_DIR}/"

sudo systemctl restart rtah-program.service
sleep 2
curl -fsS "http://127.0.0.1:8080/tv" >/dev/null

pkill -u "$(id -u "${TARGET_USER}")" -f 'chromium.*127.0.0.1:8080/tv' || true
rm -rf "${STAGING_DIR}"
echo "[update-on-pi] Update verified. Backup kept at ${BACKUP_DIR}"
REMOTE

log "Running update on ${DESTINATION}"
ssh "${DESTINATION}" "${REMOTE_SCRIPT}"
