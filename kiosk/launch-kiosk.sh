#!/usr/bin/env bash
set -euo pipefail

APP_URL="http://127.0.0.1:8080/tv"
PROFILE_DIR="/home/obed/.config/rtah-kiosk"
LOG_DIR="/home/obed/rtah-program/logs"
LOG_FILE="${LOG_DIR}/kiosk.log"

mkdir -p "${PROFILE_DIR}" "${LOG_DIR}"

log() {
  printf '[kiosk] %s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "${LOG_FILE}"
}

chromium_command() {
  if command -v chromium >/dev/null 2>&1; then
    command -v chromium
    return 0
  fi
  if command -v chromium-browser >/dev/null 2>&1; then
    command -v chromium-browser
    return 0
  fi
  return 1
}

wait_for_app() {
  until curl -fsS --max-time 2 "${APP_URL}" >/dev/null 2>&1; do
    log "Waiting for ${APP_URL}"
    sleep 2
  done
}

disable_blanking() {
  if command -v xset >/dev/null 2>&1 && [[ -n "${DISPLAY:-}" ]]; then
    xset s off || true
    xset -dpms || true
    xset s noblank || true
  fi

  if command -v unclutter >/dev/null 2>&1 && [[ -n "${DISPLAY:-}" ]]; then
    if ! pgrep -u "$(id -u)" -x unclutter >/dev/null 2>&1; then
      (unclutter -idle 1 -root >/dev/null 2>&1 || true) &
    fi
  fi
}

CHROMIUM="$(chromium_command)" || {
  log "Chromium is not installed."
  exit 1
}

disable_blanking

while true; do
  wait_for_app
  log "Launching ${CHROMIUM} ${APP_URL}"
  "${CHROMIUM}" \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --disable-session-crashed-bubble \
    --disable-translate \
    --overscroll-history-navigation=0 \
    --disable-pinch \
    --check-for-update-interval=31536000 \
    --disable-features=Translate,OptimizationHints,MediaRouter \
    --user-data-dir="${PROFILE_DIR}" \
    "${APP_URL}" || true
  log "Chromium exited; relaunching in 3 seconds."
  sleep 3
done
