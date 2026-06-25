#!/usr/bin/env bash
set -euo pipefail

INSTALL_SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_USER="obed"
TARGET_USER="${RTAH_USER:-}"

log() {
  printf '[install-on-pi] %s\n' "$*"
}

warn() {
  printf '[install-on-pi] WARNING: %s\n' "$*" >&2
}

fail() {
  printf '[install-on-pi] ERROR: %s\n' "$*" >&2
  exit 1
}

require_sudo() {
  if [[ "${EUID}" -eq 0 ]]; then
    fail "Run this script as the desktop user, not root. It will use sudo when needed."
  fi
  sudo -v
}

detect_user() {
  if [[ -n "${TARGET_USER}" ]]; then
    id "${TARGET_USER}" >/dev/null 2>&1 || fail "Requested RTAH_USER does not exist: ${TARGET_USER}"
    return
  fi

  if id "${DEFAULT_USER}" >/dev/null 2>&1; then
    TARGET_USER="${DEFAULT_USER}"
  else
    TARGET_USER="$(id -un)"
    warn "User '${DEFAULT_USER}' was not found; using current user '${TARGET_USER}'."
  fi
}

install_packages() {
  local packages=(curl python3)

  if ! command -v chromium >/dev/null 2>&1 && ! command -v chromium-browser >/dev/null 2>&1; then
    packages+=(chromium-browser)
  fi

  if ! command -v unclutter >/dev/null 2>&1; then
    packages+=(unclutter)
  fi

  log "Installing required packages if missing: ${packages[*]}"
  sudo apt-get update
  sudo apt-get install -y "${packages[@]}"
}

configure_service() {
  local runtime_root="$1"
  local service_tmp
  service_tmp="$(mktemp)"
  sed \
    -e "s#User=obed#User=${TARGET_USER}#g" \
    -e "s#Group=obed#Group=${TARGET_USER}#g" \
    -e "s#/home/obed/rtah-program#${runtime_root}#g" \
    "${INSTALL_SOURCE}/systemd/rtah-program.service" > "${service_tmp}"
  sudo install -m 0644 "${service_tmp}" /etc/systemd/system/rtah-program.service
  rm -f "${service_tmp}"
  sudo systemctl daemon-reload
  sudo systemctl enable rtah-program.service
  sudo systemctl restart rtah-program.service
}

append_once() {
  local file="$1"
  local line="$2"
  sudo -u "${TARGET_USER}" mkdir -p "$(dirname "${file}")"
  sudo -u "${TARGET_USER}" touch "${file}"
  sudo -u "${TARGET_USER}" bash -c 'grep -Fqx "$1" "$2" || printf "%s\n" "$1" >> "$2"' bash "${line}" "${file}"
}

configure_autostart() {
  local runtime_root="$1"
  local autostart_line="${runtime_root}/launch-kiosk.sh &"
  local labwc="/home/${TARGET_USER}/.config/labwc/autostart"
  local lxde="/home/${TARGET_USER}/.config/lxsession/LXDE-pi/autostart"

  if [[ -d "/home/${TARGET_USER}/.config/labwc" ]] || pgrep -x labwc >/dev/null 2>&1; then
    log "Configuring Labwc autostart: ${labwc}"
    append_once "${labwc}" "${autostart_line}"
  elif [[ -d "/home/${TARGET_USER}/.config/lxsession/LXDE-pi" ]]; then
    log "Configuring LXDE autostart: ${lxde}"
    append_once "${lxde}" "${autostart_line}"
  else
    log "No existing desktop autostart directory found; creating Labwc autostart."
    append_once "${labwc}" "${autostart_line}"
  fi
}

configure_screen_blanking() {
  local labwc_rc="/home/${TARGET_USER}/.config/labwc/rc.xml"
  local lightdm_conf="/etc/lightdm/lightdm.conf.d/50-rtah-kiosk.conf"

  sudo mkdir -p /etc/lightdm/lightdm.conf.d
  printf '%s\n' \
    '[Seat:*]' \
    'xserver-command=X -s 0 -dpms' | sudo tee "${lightdm_conf}" >/dev/null

  if [[ -f "${labwc_rc}" ]]; then
    log "Labwc rc.xml exists; screen blanking is also handled in launch-kiosk.sh."
  fi
}

configure_autologin() {
  if command -v raspi-config >/dev/null 2>&1; then
    log "Attempting to enable desktop autologin for ${TARGET_USER}."
    sudo raspi-config nonint do_boot_behaviour B4 || warn "raspi-config autologin setup failed; configure desktop autologin manually."
  else
    warn "raspi-config is unavailable; configure desktop autologin manually if needed."
  fi
}

verify_pi() {
  log "OS: $(. /etc/os-release 2>/dev/null && printf '%s %s' "${PRETTY_NAME:-Linux}" "$(uname -m)" || uname -a)"
  case "$(uname -m)" in
    armv6l|armv7l|aarch64) ;;
    *) warn "This does not look like a Raspberry Pi ARM architecture: $(uname -m)" ;;
  esac
}

main() {
  require_sudo
  detect_user
  verify_pi

  local runtime_root="/home/${TARGET_USER}/rtah-program"
  local app_dir="${runtime_root}/app"
  local logs_dir="${runtime_root}/logs"

  [[ -f "${INSTALL_SOURCE}/deploy/index.html" ]] || fail "Missing deploy/index.html. Run scripts/build-app.sh before copying to the Pi."

  install_packages

  log "Creating runtime directories under ${runtime_root}"
  sudo -u "${TARGET_USER}" mkdir -p "${app_dir}" "${logs_dir}"
  find "${app_dir}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  cp -R "${INSTALL_SOURCE}/deploy/." "${app_dir}/"
  install -m 0755 "${INSTALL_SOURCE}/scripts/serve_app.py" "${runtime_root}/serve_app.py"
  sed "s#/home/obed/rtah-program#${runtime_root}#g; s#/home/obed/.config/rtah-kiosk#/home/${TARGET_USER}/.config/rtah-kiosk#g" \
    "${INSTALL_SOURCE}/kiosk/launch-kiosk.sh" > "${runtime_root}/launch-kiosk.sh"
  chmod 0755 "${runtime_root}/launch-kiosk.sh"
  install -m 0644 "${INSTALL_SOURCE}/README.md" "${runtime_root}/README.md"
  chown -R "${TARGET_USER}:${TARGET_USER}" "${runtime_root}"

  configure_service "${runtime_root}"
  configure_autostart "${runtime_root}"
  configure_screen_blanking
  configure_autologin

  log "Setting timezone to America/Chicago and enabling network time when available."
  sudo timedatectl set-timezone America/Chicago
  sudo timedatectl set-ntp true || warn "Could not enable NTP."

  sleep 2
  curl -fsS "http://127.0.0.1:8080/tv" >/dev/null || fail "Local TV URL did not respond."

  log "Installation complete."
  printf '\nSummary:\n'
  printf '  User: %s\n' "${TARGET_USER}"
  printf '  App: %s\n' "${app_dir}"
  printf '  URL: http://127.0.0.1:8080/tv\n'
  printf '  Timezone: %s\n' "$(timedatectl show -p Timezone --value 2>/dev/null || date +%Z)"
  printf '  Current time: %s\n' "$(date)"
  printf '\nRecommended next step: reboot the Raspberry Pi, then run scripts/verify-pi.sh.\n'
}

main "$@"
