#!/usr/bin/env bash
set -e
"$(dirname "$0")/scripts/ops/readiness_check.sh" "$@"
