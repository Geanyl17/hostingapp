#!/usr/bin/env python3
"""Watches a screenshot folder and auto-uploads new files to the media app.

Configured entirely via environment variables (see media-app-uploader.env.example):
  MEDIA_APP_URL        e.g. https://your-domain.com
  MEDIA_APP_TOKEN       API_UPLOAD_TOKEN from the app's .env.local/.env.production
  MEDIA_APP_WATCH_DIR   defaults to ~/Pictures/Screenshots
  MEDIA_APP_POLL_SECONDS defaults to 2

No third-party dependencies: uses only the Python standard library so it runs
on a stock system without pip installs.
"""

import json
import mimetypes
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

APP_URL = os.environ["MEDIA_APP_URL"].rstrip("/")
TOKEN = os.environ["MEDIA_APP_TOKEN"]
WATCH_DIR = Path(os.environ.get("MEDIA_APP_WATCH_DIR", "~/Pictures/Screenshots")).expanduser()
POLL_SECONDS = float(os.environ.get("MEDIA_APP_POLL_SECONDS", "2"))

STATE_DIR = Path(os.environ.get("XDG_STATE_HOME", "~/.local/state")).expanduser() / "media-app-uploader"
STATE_FILE = STATE_DIR / "uploaded.json"

SUPPORTED_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".mp4", ".webm", ".mov"}


def load_uploaded() -> set[str]:
    if not STATE_FILE.exists():
        return set()
    return set(json.loads(STATE_FILE.read_text()))


def save_uploaded(uploaded: set[str]) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(sorted(uploaded)))


def wait_until_stable(path: Path, checks: int = 3, interval: float = 0.3) -> None:
    last_size = -1
    stable_count = 0
    while stable_count < checks:
        size = path.stat().st_size
        if size == last_size:
            stable_count += 1
        else:
            stable_count = 0
        last_size = size
        time.sleep(interval)


def build_multipart(field_name: str, filename: str, content: bytes, content_type: str):
    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n"
    ).encode() + content + f"\r\n--{boundary}--\r\n".encode()
    return body, f"multipart/form-data; boundary={boundary}"


def upload(path: Path) -> str:
    content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    body, content_type_header = build_multipart("file", path.name, path.read_bytes(), content_type)

    request = urllib.request.Request(
        f"{APP_URL}/api/upload",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": content_type_header,
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        result = json.loads(response.read())
    return result["url"]


def notify(title: str, message: str) -> None:
    try:
        subprocess.run(["notify-send", title, message], check=False)
    except FileNotFoundError:
        pass


def copy_to_clipboard(text: str) -> None:
    try:
        subprocess.run(["wl-copy"], input=text.encode(), check=False)
    except FileNotFoundError:
        pass


def main() -> None:
    if not WATCH_DIR.is_dir():
        print(f"Watch directory does not exist: {WATCH_DIR}", file=sys.stderr)
        sys.exit(1)

    uploaded = load_uploaded()
    print(f"Watching {WATCH_DIR} for new screenshots...")

    while True:
        for path in sorted(WATCH_DIR.iterdir()):
            key = path.name
            if (
                key in uploaded
                or not path.is_file()
                or path.suffix.lower() not in SUPPORTED_SUFFIXES
            ):
                continue

            wait_until_stable(path)
            try:
                url = upload(path)
            except (urllib.error.URLError, urllib.error.HTTPError, OSError) as exc:
                print(f"Failed to upload {path}: {exc}", file=sys.stderr)
                continue

            uploaded.add(key)
            save_uploaded(uploaded)
            copy_to_clipboard(url)
            notify("Screenshot uploaded", url)
            print(f"Uploaded {path.name} -> {url}")

        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
