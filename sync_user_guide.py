#!/usr/bin/env python3
"""
Braze User Guide GitHub Sync
Purpose:
Sync public Braze User Guide markdown files from GitHub into a local directory
so they can be indexed by Gemini File Search or another retrieval system.

Source:
Public GitHub repo: braze-inc/release-notes
Branch: main
Docs path: docs/User Guide/**/*.md

SAFETY / GOVERNANCE:
This script is intentionally read-only against GitHub.
It only uses GET requests to fetch:
- repository tree metadata
- markdown file contents
- file metadata such as path and SHA

It must never:
- create commits
- create branches
- push changes
- open pull requests
- create or edit issues
- delete files in GitHub
- modify repository settings
- write anything back to GitHub
"""

import csv
import json
import os
import pathlib
import sys
from datetime import datetime, timezone
from typing import Dict, List
import urllib.request
import urllib.error

OWNER = "braze-inc"
REPO = "release-notes"
BRANCH = "main"
DOC_PREFIX = "docs/User Guide/"
OUT_DIR = pathlib.Path("braze_user_guide_md")
STATE_FILE = pathlib.Path("braze_user_guide_state.json")
MANIFEST_FILE = pathlib.Path("braze_user_guide_manifest.csv")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "braze-user-guide-read-only-sync",
}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"

def github_get(url: str) -> dict:
    """
    Read-only GitHub GET helper.
    This function must only perform GET requests.
    """
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"GitHub API HTTP error: {e.code} {e.reason}", file=sys.stderr)
        raise
    except Exception as e:
        print(f"Error fetching JSON from {url}: {e}", file=sys.stderr)
        raise

def raw_get(url: str) -> str:
    """
    Read-only raw content GET helper.
    This function must only perform GET requests.
    """
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        print(f"GitHub RAW HTTP error: {e.code} {e.reason}", file=sys.stderr)
        raise
    except Exception as e:
        print(f"Error fetching text from {url}: {e}", file=sys.stderr)
        raise

def load_state() -> Dict[str, dict]:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def save_state(state: Dict[str, dict]) -> None:
    STATE_FILE.write_text(
        json.dumps(state, indent=2, sort_keys=True),
        encoding="utf-8",
    )

def fetch_tree() -> List[dict]:
    """
    Fetch the full recursive GitHub tree using a read-only GET request.
    """
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/trees/{BRANCH}?recursive=1"
    data = github_get(url)

    if data.get("truncated"):
        raise RuntimeError(
            "GitHub tree response was truncated. "
            "Use a read-only git clone fallback or split tree requests by directory."
        )

    return data.get("tree", [])

def is_user_guide_markdown(item: dict) -> bool:
    path = item.get("path", "")
    return (
        item.get("type") == "blob"
        and path.startswith(DOC_PREFIX)
        and path.endswith(".md")
    )

def raw_url_for(path: str) -> str:
    return f"https://raw.githubusercontent.com/{OWNER}/{REPO}/{BRANCH}/{path}"

def download_markdown(path: str) -> str:
    """
    Download markdown content using a read-only raw.githubusercontent.com GET request.
    """
    return raw_get(raw_url_for(path))

def infer_section(path: str) -> str:
    relative = path.replace(DOC_PREFIX, "", 1)
    return relative.split("/", 1)[0] if "/" in relative else "root"

def safe_local_path(github_path: str) -> pathlib.Path:
    """
    Preserve the GitHub path under the output directory.
    """
    return OUT_DIR / github_path

def write_manifest(rows: List[dict]) -> None:
    fieldnames = [
        "github_path",
        "raw_url",
        "sha",
        "local_path",
        "filename",
        "section",
        "last_synced_at",
    ]
    with MANIFEST_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

def reindex_changed_files(changed_files: List[str]) -> None:
    """
    Placeholder for Gemini File Search or vector-store indexing.
    Replace this function with your approved indexing implementation.

    For each changed file:
    - read markdown content
    - attach metadata from the manifest:
      github_path, raw_url, section, sha
    - upsert into Gemini File Search or the app's vector store
    - use github_path as the source citation

    This function must not write anything back to GitHub.
    """
    if not changed_files:
        print("No changed files to re-index.")
        return

    print("")
    print("Files queued for re-indexing:")
    for file_path in changed_files:
        print(f"- {file_path}")

def sync() -> List[str]:
    state = load_state()
    try:
        tree = fetch_tree()
    except Exception as e:
        print(f"Error fetching repo tree from GitHub: {e}", file=sys.stderr)
        print("Falling back to local cache or manually declared file manifest.", file=sys.stderr)
        tree = []

    markdown_files = [item for item in tree if is_user_guide_markdown(item)]

    # If the rate limit or error causes zero markdown files found from API,
    # we avoid wiping out the state and instead keep any previous ones.
    if not markdown_files and state:
        print("Warning: No markdown files retrieved. Maintaining existing local files.")
        manifest_rows = []
        for path, info in state.items():
            manifest_rows.append({
                "github_path": path,
                "raw_url": info.get("raw_url", raw_url_for(path)),
                "sha": info.get("sha", ""),
                "local_path": info.get("local_path", str(safe_local_path(path))),
                "filename": info.get("filename", pathlib.Path(path).name),
                "section": info.get("section", infer_section(path)),
                "last_synced_at": info.get("last_synced_at"),
            })
        write_manifest(manifest_rows)
        return []

    changed_files = []
    manifest_rows = []

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    current_sync_time = datetime.now(timezone.utc).isoformat()

    for item in markdown_files:
        github_path = item["path"]
        sha = item["sha"]
        local_path = safe_local_path(github_path)
        filename = pathlib.Path(github_path).name
        section = infer_section(github_path)

        previous_sha = state.get(github_path, {}).get("sha")
        file_has_changed = previous_sha != sha or not local_path.exists()

        if file_has_changed:
            print(f"Syncing changed file: {github_path}")
            try:
                markdown_content = download_markdown(github_path)
                local_path.parent.mkdir(parents=True, exist_ok=True)
                local_path.write_text(markdown_content, encoding="utf-8")
                changed_files.append(str(local_path))

                state[github_path] = {
                    "sha": sha,
                    "raw_url": raw_url_for(github_path),
                    "local_path": str(local_path),
                    "filename": filename,
                    "section": section,
                    "last_synced_at": current_sync_time,
                }
            except Exception as e:
                print(f"Failed to download or write {github_path}: {e}", file=sys.stderr)

        existing_state = state.get(github_path, {})
        manifest_rows.append({
            "github_path": github_path,
            "raw_url": raw_url_for(github_path),
            "sha": sha,
            "local_path": str(local_path),
            "filename": filename,
            "section": section,
            "last_synced_at": existing_state.get("last_synced_at", current_sync_time),
        })

    save_state(state)
    write_manifest(manifest_rows)

    print("")
    print("Sync complete.")
    print(f"Total User Guide markdown files found: {len(markdown_files)}")
    print(f"New or changed files synced: {len(changed_files)}")
    print(f"Output directory: {OUT_DIR}")
    print(f"Manifest file: {MANIFEST_FILE}")
    print(f"State file: {STATE_FILE}")

    return changed_files

def main() -> int:
    try:
        changed_files = sync()
        reindex_changed_files(changed_files)
        return 0
    except urllib.error.HTTPError as error:
        print(f"GitHub HTTP error: {error.code} {error.reason}", file=sys.stderr)
        return 1
    except urllib.error.URLError as error:
        print(f"Network/request URL error: {error.reason}", file=sys.stderr)
        return 1
    except Exception as error:
        print(f"Unexpected error: {error}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
