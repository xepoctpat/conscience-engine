"""Localhost-only static server for the Floodlit Archive reader."""

from __future__ import annotations

import argparse
import http.server
import os
import socket
from pathlib import Path

# Other local software probes this port. Answer 404, do not log.
SILENT_PREFIXES = (
    "/wyvrn/",
    "/.well-known/appspecific/",
)


class QuietProbesHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt: str, *args: object) -> None:
        path = self.path.split("?", 1)[0]
        if any(path.startswith(prefix) for prefix in SILENT_PREFIXES):
            return
        super().log_message(fmt, *args)


class LocalServer(http.server.ThreadingHTTPServer):
    # Windows SO_REUSEADDR lets a second process bind the same port and
    # then HTTP responses end mid-stream. Exclusive bind, then reuse off.
    allow_reuse_address = False

    def server_bind(self) -> None:
        if os.name == "nt":
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=18780)
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument(
        "--root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Directory to serve (project root).",
    )
    args = parser.parse_args()

    os.chdir(args.root)

    try:
        server = LocalServer((args.bind, args.port), QuietProbesHandler)
    except OSError as exc:
        raise SystemExit(
            f"Could not bind {args.bind}:{args.port}. "
            f"If a Floodlit preview is already running, open that address. "
            f"Otherwise stop the other process and try again.\n{exc}"
        ) from exc

    print(
        f"Serving HTTP on {args.bind} port {args.port} "
        f"(http://{args.bind}:{args.port}/) ...",
        flush=True,
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)


if __name__ == "__main__":
    main()
