#!/usr/bin/env bash
set -euo pipefail

SOURCE_APP="/Users/obed/Desktop/Coding/RTAH-003S-PROGRAM"
PACKAGE_ROOT="/Users/obed/Desktop/Coding/Raspberry-PI-Zero"
DEPLOY_DIR="${PACKAGE_ROOT}/deploy"
DIST_DIR="${SOURCE_APP}/dist"

log() {
  printf '[build-app] %s\n' "$*"
}

fail() {
  printf '[build-app] ERROR: %s\n' "$*" >&2
  exit 1
}

command -v npm >/dev/null 2>&1 || fail "npm is required on the Mac build machine."

log "Building source app at ${SOURCE_APP}"
cd "${SOURCE_APP}"
npm install
npm run build

[[ -d "${DIST_DIR}" ]] || fail "Vite output directory was not created: ${DIST_DIR}"

log "Refreshing deployment directory at ${DEPLOY_DIR}"
mkdir -p "${DEPLOY_DIR}"
find "${DEPLOY_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -R "${DIST_DIR}/." "${DEPLOY_DIR}/"
find "${DEPLOY_DIR}" -name '.DS_Store' -delete

[[ -f "${DEPLOY_DIR}/index.html" ]] || fail "Missing deploy/index.html"
find "${DEPLOY_DIR}/assets" -type f \( -name '*.js' -o -name '*.mjs' \) -print -quit | grep -q . \
  || fail "Missing built JavaScript assets under deploy/assets"

for image in friday-image.jpg saturday-image.jpg sunday-image.jpg; do
  [[ -f "${DEPLOY_DIR}/${image}" ]] || fail "Missing required image asset: deploy/${image}"
done

if grep -R "QRCodeSVG" "${SOURCE_APP}/src" >/dev/null 2>&1; then
  grep -R "rtah-003-s-program.vercel.app" "${DEPLOY_DIR}/assets" >/dev/null 2>&1 \
    || fail "QR code public URL was expected but not found in built assets."
fi

BUILD_VERSION="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
{
  printf 'build_time_utc=%s\n' "${BUILD_VERSION}"
  printf 'source_app=%s\n' "${SOURCE_APP}"
  printf 'source_version=%s\n' "$(git -C "${SOURCE_APP}" rev-parse --short HEAD 2>/dev/null || printf 'unknown')"
} > "${DEPLOY_DIR}/rtah-build-info.txt"

log "Deployment build complete."
log "Output: ${DEPLOY_DIR}"
