#!/usr/bin/env bash
set -euo pipefail

# Kill repo-associated Node processes on Windows (Git Bash).
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { \$_.Name -eq 'node.exe' -and \$_.CommandLine -match 'takashi-portfolio-full-stack' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force }"
