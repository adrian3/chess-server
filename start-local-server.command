#!/bin/zsh
set -euo pipefail

APP_NAME="Chess Server (Local)"
APP_ID="chess-server"
START_PORT="${PORT:-4400}"
PORT_SPAN=40
PORT="$START_PORT"
URL=""
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$APP_DIR/.run"
PID_FILE="$RUN_DIR/${APP_ID}.pid"
LOG_FILE="$RUN_DIR/${APP_ID}.log"
PORT_FILE="$RUN_DIR/${APP_ID}.port"

mkdir -p "$RUN_DIR"

alert() {
  osascript -e "display alert \"$APP_NAME\" message \"$1\""
}

# Finder-launched .command files get a minimal PATH that often lacks node (nvm or
# Homebrew). Add the common locations and, as a last resort, source nvm.
ensure_node() {
  export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
  if ! command -v node >/dev/null 2>&1 && [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    export NVM_DIR="$HOME/.nvm"
    . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
  fi
  if ! command -v node >/dev/null 2>&1; then
    alert "Could not find 'node'. Install Node.js (or fix PATH in this launcher)."
    exit 1
  fi
}

process_details() {
  local pid="$1"
  ps eww -p "$pid" -o command= 2>/dev/null || ps -p "$pid" -o command= 2>/dev/null || true
}

matches_app_process() {
  local pid="$1"
  local details
  details="$(process_details "$pid")"
  [[ -n "$details" ]] || return 1

  # Primary match: marker added to the launched process's environment.
  [[ "$details" == *"ADE_APPS_LAUNCHER_ID=$APP_ID"* ]] && return 0

  # Fallback for a node process running this app's dev server.
  [[ "$details" == *"dev-server.js"* ]] && [[ "$details" == *"$APP_ID"* ]]
}

stop_pid_if_matches() {
  local pid="$1"
  if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null && matches_app_process "$pid"; then
    kill "$pid" 2>/dev/null || true
    sleep 0.8
    kill -9 "$pid" 2>/dev/null || true
  fi
}

stop_previous_app() {
  if [[ -f "$PID_FILE" ]]; then
    stop_pid_if_matches "$(cat "$PID_FILE" 2>/dev/null || true)"
    rm -f "$PID_FILE"
  fi
}

port_owner_pid() {
  local port="$1"
  lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true
}

choose_port() {
  local candidate limit pids pid
  limit=$((START_PORT + PORT_SPAN - 1))

  for (( candidate = START_PORT; candidate <= limit; candidate++ )); do
    pids="$(port_owner_pid "$candidate")"
    if [[ -z "${pids:-}" ]]; then
      PORT="$candidate"
      URL="http://127.0.0.1:${PORT}/"
      echo "$PORT" > "$PORT_FILE"
      return 0
    fi

    for pid in ${(f)pids}; do
      [[ -n "${pid:-}" ]] || continue
      if matches_app_process "$pid"; then
        stop_pid_if_matches "$pid"
      fi
    done

    pids="$(port_owner_pid "$candidate")"
    if [[ -z "${pids:-}" ]]; then
      PORT="$candidate"
      URL="http://127.0.0.1:${PORT}/"
      echo "$PORT" > "$PORT_FILE"
      return 0
    fi
  done

  alert "No free port found from $START_PORT through $limit."
  exit 1
}

ensure_dependencies() {
  if [[ ! -d "$APP_DIR/server/node_modules/ws" ]]; then
    ( cd "$APP_DIR/server" && npm install >> "$LOG_FILE" 2>&1 ) || {
      open -a "TextEdit" "$LOG_FILE" >/dev/null 2>&1 || true
      alert "npm install failed. A log file has been opened."
      exit 1
    }
  fi
}

start_server() {
  cd "$APP_DIR"
  : > "$LOG_FILE"
  nohup env ADE_APPS_LAUNCHER_ID="$APP_ID" PORT="$PORT" node server/dev-server.js >> "$LOG_FILE" 2>&1 &
}

wait_until_ready() {
  for _ in {1..20}; do
    if curl -s "$URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  return 1
}

record_server_pid() {
  local live_pid
  live_pid="$(port_owner_pid "$PORT")"
  if [[ -n "${live_pid:-}" ]]; then
    echo "$live_pid" > "$PID_FILE"
    return 0
  fi
  return 1
}

main() {
  ensure_node
  stop_previous_app
  choose_port
  ensure_dependencies
  start_server

  if wait_until_ready; then
    record_server_pid || true
    open "$URL"
    exit 0
  fi

  open -a "TextEdit" "$LOG_FILE" >/dev/null 2>&1 || true
  alert "The server did not start. A log file has been opened."
  exit 1
}

main "$@"
