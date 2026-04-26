#!/bin/sh

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
MONGOD_BIN="$REPO_ROOT/mongodb-macos-x86_64-7.0.5/bin/mongod"
DB_PATH="$REPO_ROOT/.mongo-data"

if [ ! -x "$MONGOD_BIN" ]; then
  echo "mongod binary not found at $MONGOD_BIN"
  exit 1
fi

mkdir -p "$DB_PATH"

exec "$MONGOD_BIN" --dbpath "$DB_PATH" --bind_ip 127.0.0.1 --port 27017
