#!/usr/bin/env python3
"""Regenerate references/index.md from the vendored guides.

Usage (from the skill directory): python3 -I scripts/build-index.py
Each row lists a guide's ID (its file name), title (first H1) and the first
sentence of its first prose paragraph.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUIDES = os.path.join(ROOT, "guides")
SKIP_PREFIXES = ("#", "<", "```", "- [", "|")


def summarize(lines):
    """Return the first sentence of the first prose line, escaped for a table."""
    for line in lines:
        text = line.strip()
        if text and not text.startswith(SKIP_PREFIXES):
            text = re.sub(r"\s+", " ", text)
            return re.split(r"(?<=[.!?])\s", text)[0][:220].replace("|", "\\|")
    return ""


def main():
    rows = []
    for folder, _, files in os.walk(GUIDES):
        for name in files:
            if not name.endswith(".md"):
                continue
            path = os.path.join(folder, name)
            rel = os.path.relpath(path, ROOT)
            with open(path, encoding="utf-8") as handle:
                lines = handle.read().splitlines()
            title = next((l[2:].strip() for l in lines if l.startswith("# ")), name[:-3])
            rows.append((rel.split(os.sep)[1], name[:-3], rel, title, summarize(lines)))
    rows.sort()

    out = [
        "# Guide index",
        "",
        "Search this file for a capability or feature name, then read the guide at the "
        "listed path (relative to the skill directory). The ID is also the file name.",
        "",
    ]
    category = None
    for cat, guide_id, rel, title, summary in rows:
        if cat != category:
            out += ["", f"## {cat}", "", "| ID | Title | Summary |", "| --- | --- | --- |"]
            category = cat
        out.append(f"| [`{guide_id}`](../{rel}) | {title} | {summary} |")

    with open(os.path.join(ROOT, "references", "index.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(out) + "\n")
    print(f"Indexed {len(rows)} guides")


if __name__ == "__main__":
    main()
