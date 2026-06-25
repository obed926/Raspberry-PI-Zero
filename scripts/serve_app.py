#!/usr/bin/env python3
import argparse
import http.server
import logging
import mimetypes
import os
from pathlib import Path
import socketserver
import sys
from urllib.parse import unquote, urlparse


DEFAULT_ROOT = Path("/home/obed/rtah-program/app")
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8080


class ReusableTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


class SpaFallbackHandler(http.server.SimpleHTTPRequestHandler):
    server_version = "RTAHProgramHTTP/1.0"

    def translate_path(self, path):
        parsed_path = urlparse(path).path
        decoded_path = unquote(parsed_path).lstrip("/")
        candidate = (self.server.app_root / decoded_path).resolve()
        try:
            candidate.relative_to(self.server.app_root)
        except ValueError:
            return str(self.server.app_root / "index.html")

        if candidate.is_file():
            return str(candidate)
        if candidate.is_dir() and (candidate / "index.html").is_file():
            return str(candidate / "index.html")

        if "." not in Path(decoded_path).name:
            return str(self.server.app_root / "index.html")

        return str(candidate)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, format, *args):
        logging.info("%s - %s", self.address_string(), format % args)

    def log_error(self, format, *args):
        logging.error("%s - %s", self.address_string(), format % args)


def main():
    parser = argparse.ArgumentParser(description="Serve the RTAH TV app with SPA fallback.")
    parser.add_argument("--root", default=os.environ.get("RTAH_APP_ROOT", str(DEFAULT_ROOT)))
    parser.add_argument("--host", default=os.environ.get("RTAH_HOST", DEFAULT_HOST))
    parser.add_argument("--port", type=int, default=int(os.environ.get("RTAH_PORT", DEFAULT_PORT)))
    args = parser.parse_args()

    app_root = Path(args.root).resolve()
    index_file = app_root / "index.html"
    if not index_file.is_file():
        print(f"ERROR: missing app index: {index_file}", file=sys.stderr)
        return 1

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("text/css", ".css")
    mimetypes.add_type("image/svg+xml", ".svg")

    with ReusableTCPServer((args.host, args.port), SpaFallbackHandler) as httpd:
        httpd.app_root = app_root
        logging.info("Serving RTAH app from %s at http://%s:%s/tv", app_root, args.host, args.port)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            logging.info("Server stopped")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
