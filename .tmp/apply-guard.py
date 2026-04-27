import pathlib
p = pathlib.Path(r".github/workflows/control-website-ci.yml")
raw = p.read_bytes()
newline = b"\r\n" if b"\r\n" in raw else b"\n"
text = raw.decode("utf-8")
lines = text.split(newline.decode("ascii"))
idx = lines.index("  ci:")
new = [
    "  hygiene:",
    "    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')",
    "    runs-on: ubuntu-latest",
    "    name: Conflict Marker Guard",
    "    steps:",
    "      - uses: actions/checkout@v4",
    "",
    "      - name: Scan tracked files for unresolved git conflict markers",
    "        run: |",
    "          set -euo pipefail",
    "          pattern='^(<<<<<<<( |$)|=======$|>>>>>>>( |$))'",
    "          matches=$(git grep -nE \"$pattern\" -- ':!.github/workflows' || true)",
    "          if [ -n \"$matches\" ]; then",
    "            echo \"::error::Unresolved git conflict markers found in tracked files. Resolve before merging.\"",
    "            echo \"$matches\"",
    "            exit 1",
    "          fi",
    "          echo \"Clean \u2014 no conflict markers detected.\"",
    "",
]
out = lines[:idx] + new + lines[idx:]
# Preserve original newline style. Preserve trailing newline if the source had one.
sep = newline.decode("ascii")
joined = sep.join(out)
if raw.endswith(b"\n") and not joined.endswith(sep):
    joined += sep
p.write_bytes(joined.encode("utf-8"))
print("done", "newline=" + repr(sep))
