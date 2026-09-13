$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$source = Join-Path $root "public\pc-setup"
$zip = Join-Path $source "lantern-pc-display-setup.zip"
$temp = Join-Path ([IO.Path]::GetTempPath()) ("lantern-pc-setup-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temp -Force | Out-Null
try {
  Copy-Item (Join-Path $source "Setup-LanternDisplay.bat") $temp
  Copy-Item (Join-Path $source "Setup-LanternDisplay.ps1") $temp
  Copy-Item (Join-Path $source "Launch-LanternDisplay.ps1") $temp
  Copy-Item (Join-Path $source "README-PC-SETUP.md") $temp
  Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $zip -Force
} finally {
  Remove-Item $temp -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "Created $zip"
