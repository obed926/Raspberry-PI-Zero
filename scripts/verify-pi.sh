#!/usr/bin/env bash
set -euo pipefail

TARGET_USER="${RTAH_USER:-obed}"
if ! id "${TARGET_USER}" >/dev/null 2>&1; then
  TARGET_USER="$(id -un)"
fi

APP_ROOT="/home/${TARGET_USER}/rtah-program/app"
URL="http://127.0.0.1:8080/tv"

check() {
  local label="$1"
  shift
  if "$@"; then
    printf '[ok] %s\n' "${label}"
  else
    printf '[fail] %s\n' "${label}"
    return 1
  fi
}

printf 'RTAH Pi verification\n'
printf 'User: %s\n' "${TARGET_USER}"
printf 'Date: %s\n' "$(date)"
printf 'Timezone: %s\n' "$(timedatectl show -p Timezone --value 2>/dev/null || printf 'unknown')"

check "timezone is America/Chicago" test "$(timedatectl show -p Timezone --value 2>/dev/null)" = "America/Chicago"
check "rtah-program.service is active" systemctl is-active --quiet rtah-program.service
check "port 8080 responds" curl -fsS --max-time 3 "http://127.0.0.1:8080/" >/dev/null

status_code="$(curl -o /dev/null -s -w '%{http_code}' --max-time 3 "${URL}" || true)"
if [[ "${status_code}" = "200" ]]; then
  printf '[ok] /tv returns HTTP 200\n'
else
  printf '[fail] /tv returned HTTP %s\n' "${status_code:-none}"
fi

if pgrep -f 'chromium.*127.0.0.1:8080/tv' >/dev/null 2>&1 || pgrep -f 'chromium-browser.*127.0.0.1:8080/tv' >/dev/null 2>&1; then
  printf '[ok] Chromium kiosk process is running\n'
else
  printf '[warn] Chromium kiosk process was not found\n'
fi

if command -v tvservice >/dev/null 2>&1; then
  tvservice -s || true
elif command -v xrandr >/dev/null 2>&1 && [[ -n "${DISPLAY:-}" ]]; then
  xrandr --query | sed -n '/ connected/p'
else
  printf '[warn] HDMI display detection tool not available in this shell\n'
fi

printf '\nDisk space:\n'
df -h / "${APP_ROOT}" 2>/dev/null || df -h /

printf '\nMemory:\n'
free -h || true

printf '\nInstalled app version:\n'
if [[ -f "${APP_ROOT}/rtah-build-info.txt" ]]; then
  cat "${APP_ROOT}/rtah-build-info.txt"
else
  printf 'No rtah-build-info.txt found in %s\n' "${APP_ROOT}"
fi
