#!/usr/bin/env bash
set -e
"$(dirname "$0")/scripts/tests/test_backend.sh" "$@"
