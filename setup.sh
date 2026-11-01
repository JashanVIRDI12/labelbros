#!/usr/bin/env bash
# Label Bros: Claude Code project setup (skills + MCP + CLAUDE.md + reference)
# Usage:  bash setup.sh <project-dir> [--with-21st] [--update]
#   <project-dir>  folder to set up (created if missing), e.g. /Users/mac/DigiClicks-projects/labelbros
#   --with-21st    also add the 21st MCP server (needs API_KEY_21ST exported in your shell)
#   --update       re-fetch third-party skills even if they already exist
# Works on macOS (bash 3.2 / zsh via `bash setup.sh`) and Linux. Needs: node >= 18 (npx) or git.
set -euo pipefail

if [ $# -lt 1 ] || [ "${1#-}" != "$1" ]; then
  echo "Usage: bash setup.sh <project-dir> [--with-21st] [--update]" >&2; exit 1
fi
PROJECT_DIR="$1"; shift
WITH_21ST=0; UPDATE=0
for a in "$@"; do
  case "$a" in
    --with-21st) WITH_21ST=1 ;;
    --update) UPDATE=1 ;;
    *) echo "Unknown option: $a" >&2; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$PROJECT_DIR"
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
SKILLS_DIR="$PROJECT_DIR/.claude/skills"
mkdir -p "$SKILLS_DIR" "$PROJECT_DIR/.claude/agents" "$PROJECT_DIR/reference"
say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }

# copy_if_absent SRC DEST  (never overwrites; writes DEST.labelbros-new instead)
copy_if_absent() {
  if [ ! -e "$1" ]; then return 0; fi
  if [ -e "$2" ] && ! cmp -s "$1" "$2"; then
    cp "$1" "$2.labelbros-new"; echo "  kept existing $(basename "$2"); new version saved as $(basename "$2").labelbros-new"
  else
    cp "$1" "$2"; echo "  wrote $(basename "$2")"
  fi
}

say "1/5 Project files (CLAUDE.md, settings, agents, reference)"
if [ "$SCRIPT_DIR" != "$PROJECT_DIR" ]; then
  copy_if_absent "$SCRIPT_DIR/CLAUDE.md" "$PROJECT_DIR/CLAUDE.md"
  copy_if_absent "$SCRIPT_DIR/.claude/settings.json" "$PROJECT_DIR/.claude/settings.json"
  copy_if_absent "$SCRIPT_DIR/.claude/agents/design-reviewer.md" "$PROJECT_DIR/.claude/agents/design-reviewer.md"
  copy_if_absent "$SCRIPT_DIR/.mcp.21st.optional.json" "$PROJECT_DIR/.mcp.21st.optional.json"
  copy_if_absent "$SCRIPT_DIR/claude-prompt.md" "$PROJECT_DIR/claude-prompt.md"
  if [ -d "$SCRIPT_DIR/reference" ]; then cp -R "$SCRIPT_DIR/reference/." "$PROJECT_DIR/reference/"; echo "  copied reference/"; fi
  if [ -d "$SCRIPT_DIR/.claude/skills/labelbros-motion" ]; then
    rm -rf "$SKILLS_DIR/labelbros-motion"; cp -R "$SCRIPT_DIR/.claude/skills/labelbros-motion" "$SKILLS_DIR/"; echo "  installed skill labelbros-motion"
  fi
  if [ -f "$SCRIPT_DIR/.claude/skills/THIRD_PARTY_NOTICES.md" ]; then cp "$SCRIPT_DIR/.claude/skills/THIRD_PARTY_NOTICES.md" "$SKILLS_DIR/"; fi
  # bundled third-party skills (from the zip) are copied unless --update asks for a fresh fetch
  if [ "$UPDATE" -eq 0 ]; then
    for d in "$SCRIPT_DIR"/.claude/skills/*/; do
      [ -d "$d" ] || continue
      n="$(basename "$d")"; if [ "$n" = "labelbros-motion" ]; then continue; fi
      if [ ! -d "$SKILLS_DIR/$n" ]; then cp -R "$d" "$SKILLS_DIR/$n"; echo "  bundled skill $n"; fi
    done
  fi
fi

# repo|subdir-in-repo|skill names (space separated)
SOURCES="anthropics/skills|skills|frontend-design webapp-testing
greensock/gsap-skills|skills|gsap-core gsap-timeline gsap-scrolltrigger gsap-plugins gsap-react gsap-frameworks gsap-performance gsap-utils
cloudai-x/threejs-skills|skills|threejs-fundamentals threejs-geometry threejs-materials threejs-lighting threejs-textures threejs-animation threejs-loaders threejs-shaders threejs-postprocessing threejs-interaction threejs-performance threejs-react-three-fiber threejs-asset-pipeline
vercel-labs/agent-skills|skills|web-design-guidelines vercel-react-best-practices"

# folder name in the vercel repo differs from the skill name
repo_folder() { if [ "$1" = "vercel-react-best-practices" ]; then echo "react-best-practices"; else echo "$1"; fi; }

missing_skills() { # prints skills from list $1 not yet installed (or all if --update)
  for s in $1; do
    if [ "$UPDATE" -eq 1 ] || [ ! -f "$SKILLS_DIR/$s/SKILL.md" ]; then printf '%s ' "$s"; fi
  done
}

install_with_git() { # repo subdir "skills..."
  have git || return 1
  tmp="$(mktemp -d "${TMPDIR:-/tmp}/lbskills.XXXXXX")"
  git clone --quiet --depth 1 --filter=blob:none --sparse "https://github.com/$1.git" "$tmp/repo" || { rm -rf "$tmp"; return 1; }
  paths=""; for s in $3; do paths="$paths $2/$(repo_folder "$s")"; done
  # shellcheck disable=SC2086
  (cd "$tmp/repo" && git sparse-checkout set --no-cone $paths LICENSE) || { rm -rf "$tmp"; return 1; }
  for s in $3; do
    src="$tmp/repo/$2/$(repo_folder "$s")"
    [ -d "$src" ] || { echo "  ! $s not found in $1"; continue; }
    rm -rf "$SKILLS_DIR/$s"; cp -R "$src" "$SKILLS_DIR/$s"
    if [ -f "$tmp/repo/LICENSE" ] && [ ! -f "$SKILLS_DIR/$s/LICENSE" ] && [ ! -f "$SKILLS_DIR/$s/LICENSE.txt" ]; then cp "$tmp/repo/LICENSE" "$SKILLS_DIR/$s/LICENSE"; fi
    echo "  git: installed $s"
  done
  rm -rf "$tmp"
}

say "2/5 Third-party skills -> $SKILLS_DIR"
printf '%s\n' "$SOURCES" | while IFS='|' read -r repo sub list; do
  need="$(missing_skills "$list")"
  if [ -z "$need" ]; then echo "  $repo: already installed"; continue; fi
  ok=0
  if have npx; then
    # official installer: https://github.com/vercel-labs/skills  (project scope, Claude Code, real copies)
    # shellcheck disable=SC2086
    if (cd "$PROJECT_DIR" && npx -y skills@latest add "https://github.com/$repo" -a claude-code -s $need -y --copy </dev/null); then ok=1; fi
  fi
  if [ "$ok" -eq 0 ]; then
    echo "  npx skills failed or unavailable for $repo; falling back to git sparse-checkout"
    install_with_git "$repo" "$sub" "$need" || { echo "  ! could not install $repo (need node or git)"; }
  fi
done

say "3/5 MCP servers (.mcp.json: playwright, shadcn, optional 21st)"
MCP="$PROJECT_DIR/.mcp.json"
if have node; then
  WITH_21ST="$WITH_21ST" MCP="$MCP" node -e '
    const fs=require("fs"); const f=process.env.MCP;
    let j={}; try{ j=JSON.parse(fs.readFileSync(f,"utf8")); }catch(e){}
    j.mcpServers=j.mcpServers||{};
    j.mcpServers.playwright=j.mcpServers.playwright||{command:"npx",args:["@playwright/mcp@latest"]};
    j.mcpServers.shadcn=j.mcpServers.shadcn||{command:"npx",args:["shadcn@latest","mcp"]};
    if(process.env.WITH_21ST==="1"){ j.mcpServers["21st"]={type:"http",url:"https://21st.dev/api/mcp",headers:{"x-api-key":"${API_KEY_21ST}"}}; }
    fs.writeFileSync(f, JSON.stringify(j,null,2)+"\n");'
  echo "  merged into .mcp.json"
elif [ ! -f "$MCP" ]; then
  cp "$SCRIPT_DIR/.mcp.json" "$MCP" 2>/dev/null || printf '%s\n' '{"mcpServers":{"playwright":{"command":"npx","args":["@playwright/mcp@latest"]},"shadcn":{"command":"npx","args":["shadcn@latest","mcp"]}}}' > "$MCP"
  echo "  wrote .mcp.json (node not found, so no merge)"
else
  echo "  ! .mcp.json exists and node is missing; add playwright + shadcn manually"
fi
if [ "$WITH_21ST" -eq 1 ] && [ -z "${API_KEY_21ST:-}" ]; then
  echo "  ! 21st added but API_KEY_21ST is not set. Get a key at https://21st.dev/mcp and run: export API_KEY_21ST=..."
fi

say "4/5 Playwright browser for the MCP (optional, safe to skip)"
if have npx && npx -y playwright@latest install chromium >/dev/null 2>&1; then echo "  chromium ready"; else echo "  skipped (the MCP can use your installed Chrome)"; fi

say "5/5 .gitignore"
GI="$PROJECT_DIR/.gitignore"; touch "$GI"
for line in ".env*" ".claude/settings.local.json" "CLAUDE.local.md" ".playwright-mcp/"; do
  grep -qxF "$line" "$GI" || echo "$line" >> "$GI"
done
echo "  ok"

cat <<MSG

Done. Next:
  cd "$PROJECT_DIR"
  claude update            # Opus 5.5 needs Claude Code >= 2.1.280
  claude                   # accept the workspace-trust + project MCP prompts, then run /mcp and /skills to check
  # Paste the prompt from claude-prompt.md (everything from <role> down)
MSG
