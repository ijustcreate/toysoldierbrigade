$ErrorActionPreference = "Continue"
$configPath = Join-Path $PSScriptRoot "config.json"
if (-not (Test-Path $configPath)) { exit 1 }
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$chromePath = [string]$config.ChromePath
$profile = [string]$config.UserDataDir
$url = [string]$config.LaunchUrl
$delay = [int]$config.WatchdogSeconds

function Get-LanternChrome {
  Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" | Where-Object {
    [string]$_.CommandLine -like "*$profile*"
  }
}

while ($true) {
  $existing = @(Get-LanternChrome)
  if ($existing.Count -eq 0) {
    Start-Process -FilePath $chromePath -ArgumentList @(
      "--kiosk",
      "--start-fullscreen",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-session-crashed-bubble",
      "--disable-pinch",
      "--overscroll-history-navigation=0",
      "--user-data-dir=$profile",
      $url
    ) | Out-Null
  }
  Start-Sleep -Seconds ([Math]::Max(5, $delay))
}
