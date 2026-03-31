#!/usr/bin/env bash
set -e
"$(dirname "$0")/scripts/ops/fix-cors-production.sh" "$@"
