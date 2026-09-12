param(
  [switch]$Once
)

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

function Get-LanternKioskChrome {
  @(Get-LanternChrome) | Where-Object {
    $commandLine = [string]$_.CommandLine
    $commandLine -match '(?i)(^|\s)--kiosk(?:\s|$)' -and
      $commandLine -match '(?i)(^|\s)--disable-direct-composition(?:\s|$)' -and
      $commandLine -match '(?i)(^|\s)--force-color-profile=srgb(?:\s|$)'
  }
}

function Start-LanternKiosk {
  $profileProcesses = @(Get-LanternChrome)
  $kioskProcesses = @(Get-LanternKioskChrome)
  if ($kioskProcesses.Count -gt 0) { return }

  # Chrome reuses an existing process for the same profile and silently ignores
  # new kiosk flags. Close only this dedicated Lantern profile before relaunching,
  # including an older kiosk session that lacks the TV compatibility switches.
  foreach ($process in $profileProcesses) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }
  if ($profileProcesses.Count -gt 0) { Start-Sleep -Milliseconds 800 }

  Start-Process -FilePath $chromePath -ArgumentList @(
    "--kiosk",
    "--start-fullscreen",
    # Keep this dedicated TV session on Chrome's conventional Windows
    # composition path. Some rotated HDMI displays render a solid green frame
    # when Chrome promotes a fullscreen surface through DirectComposition.
    "--disable-direct-composition",
    # Prevent fullscreen from negotiating an unexpected HDR/YUV color profile
    # with a display whose EDID differs from ordinary desktop monitors.
    "--force-color-profile=srgb",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-session-crashed-bubble",
    "--disable-background-mode",
    "--disable-pinch",
    "--overscroll-history-navigation=0",
    "--user-data-dir=$profile",
    $url
  ) | Out-Null
}

while ($true) {
  Start-LanternKiosk
  if ($Once) { break }
  Start-Sleep -Seconds ([Math]::Max(5, $delay))
}
