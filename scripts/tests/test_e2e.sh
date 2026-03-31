#!/bin/bash

# End-to-End Test Runner for Role/Permission/Warranty System

echo "========================================"
echo "Running Role/Permission Workflow Tests"
echo "========================================"
echo ""

cd "$(dirname "$0")/backend" || exit 1

# Check if virtual environment exists
if [ ! -d ".venv" ] && [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please activate it first:"
    echo "  source .venv/Scripts/activate  # Windows Git Bash"
    echo "  source venv/bin/activate       # Linux/Mac"
    exit 1
fi

# Run the test
echo "Running Django test script..."
echo ""

python manage.py shell << 'EOF'
import sys
sys.path.insert(0, '.')
exec(open('test_role_permission_workflow.py').read())
EOF

exit_code=$?

echo ""
echo "========================================"
if [ $exit_code -eq 0 ]; then
    echo "✓ All tests passed!"
else
    echo "✗ Tests failed with exit code $exit_code"
fi
echo "========================================"

exit $exit_code
