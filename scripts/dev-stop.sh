#!/usr/bin/env bash
set -euo pipefail

# Kill repo-associated Node processes on Windows (Git Bash).
powershell -NoProfile -Command "\$procs = @(Get-CimInstance Win32_Process | Where-Object { \$_.Name -eq 'node.exe' -and \$_.CommandLine -match 'takashi-portfolio-full-stack' }); if (\$procs.Count -eq 0) { Write-Host 'No matching dev processes found.'; exit 0 }; \$procs | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }; Write-Host ('Stopped ' + \$procs.Count + ' process(es).')"
