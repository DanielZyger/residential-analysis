#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
API_PORT="${API_PORT:-3333}"
WEB_PORT="${WEB_PORT:-5173}"
URL="http://localhost:${WEB_PORT}/?transaction=rent"
LOG_DIR="${ROOT}/.logs"
DATASET="${ROOT}/apps/api/data/dataset.json"

info() { printf '\033[1;34m▸\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m✖\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<EOF
Uso: ./open_aluguel.sh [--scrape]

Sobe a API (:${API_PORT}) e a web (:${WEB_PORT}) e abre o ranking de aluguel no navegador.
  --scrape   faz uma coleta completa antes de subir (leva ~20 min)
Ctrl+C encerra tudo.
EOF
}

SCRAPE=false
for arg in "$@"; do
  case "$arg" in
    --scrape) SCRAPE=true ;;
    -h|--help) usage; exit 0 ;;
    *) usage; fail "opção desconhecida: $arg" ;;
  esac
done

command -v node >/dev/null || fail "Node.js não encontrado (requer Node 22+)."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
(( NODE_MAJOR >= 22 )) || fail "Node 22+ é necessário (encontrado $(node -v))."

port_in_use() { lsof -ti "tcp:$1" -sTCP:LISTEN >/dev/null 2>&1; }
for port in "$API_PORT" "$WEB_PORT"; do
  port_in_use "$port" && fail "A porta ${port} já está em uso. Encerre o processo (lsof -i :${port}) e tente de novo."
done

cd "$ROOT"
mkdir -p "$LOG_DIR"

if [[ ! -d node_modules ]]; then
  info "Instalando dependências..."
  npm install
fi

if [[ "$SCRAPE" == true ]]; then
  info "Coletando imóveis das imobiliárias (pode levar ~20 min)..."
  npm run scrape
elif [[ ! -f "$DATASET" ]]; then
  fail "Nenhum dado coletado ainda. Rode: ./open_aluguel.sh --scrape"
fi

PIDS=()
cleanup() {
  trap - EXIT INT TERM
  info "Encerrando..."
  for pid in "${PIDS[@]}"; do kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

info "Subindo API em :${API_PORT} (log: .logs/api.log)"
PORT="$API_PORT" setsid npm run dev -w @er/api >"${LOG_DIR}/api.log" 2>&1 &
PIDS+=($!)

info "Subindo web em :${WEB_PORT} (log: .logs/web.log)"
API_PORT="$API_PORT" setsid npm run dev -w @er/web -- --port "$WEB_PORT" --strictPort >"${LOG_DIR}/web.log" 2>&1 &
PIDS+=($!)

wait_for() {
  local url="$1" name="$2" log="$3"
  for _ in $(seq 1 60); do
    curl -sf -o /dev/null "$url" && return 0
    sleep 1
  done
  tail -20 "$log" >&2
  fail "${name} não respondeu em 60 s."
}

wait_for "http://localhost:${API_PORT}/api/health" "API" "${LOG_DIR}/api.log"
wait_for "http://localhost:${WEB_PORT}/" "Web" "${LOG_DIR}/web.log"

info "Pronto: ${URL}"
if [[ -n "${NO_BROWSER:-}" ]]; then
  :
elif command -v xdg-open >/dev/null; then
  xdg-open "$URL" >/dev/null 2>&1 || true
elif command -v open >/dev/null; then
  open "$URL" >/dev/null 2>&1 || true
fi

info "Ctrl+C para encerrar."
wait
