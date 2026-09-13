[CmdletBinding()]
param(
  [string]$SiteUrl,
  [string]$DisplayId,
  [ValidateSet("Landscape", "Portrait")]
  [string]$Orientation
)

$ErrorActionPreference = "Stop"
$defaultSiteUrl = "https://ijustcreate.github.io/toysoldierbrigade/"
$installDir = Join-Path $env:ProgramData "LanternDisplay"
$taskName = "Lantern Display - Start at sign-in"
$morningTaskName = "Lantern Display - 5 AM check"

function Require-Administrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Please right-click Setup-LanternDisplay.bat and choose Run as administrator."
  }
}

function New-DesktopShortcut([string]$path, [string]$target, [string]$arguments, [string]$description) {
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($path)
  $shortcut.TargetPath = $target
  $shortcut.Arguments = $arguments
  $shortcut.WorkingDirectory = $installDir
  $shortcut.Description = $description
  $shortcut.Save()
}

Require-Administrator

if ([string]::IsNullOrWhiteSpace($SiteUrl)) { $SiteUrl = Read-Host "Hosted Lantern site URL [$defaultSiteUrl]" }
if ([string]::IsNullOrWhiteSpace($SiteUrl)) { $SiteUrl = $defaultSiteUrl }
$SiteUrl = $SiteUrl.TrimEnd("/") + "/"
if ([string]::IsNullOrWhiteSpace($DisplayId)) { $DisplayId = Read-Host "Assigned display ID (for example display-1)" }
if ([string]::IsNullOrWhiteSpace($DisplayId)) { throw "A display ID is required." }
if ([string]::IsNullOrWhiteSpace($Orientation)) { $Orientation = Read-Host "Monitor orientation [Landscape or Portrait]" }
if ([string]::IsNullOrWhiteSpace($Orientation)) { $Orientation = "Landscape" }
$Orientation = $Orientation.Substring(0, 1).ToUpperInvariant() + $Orientation.Substring(1).ToLowerInvariant()
$mount = if ($Orientation -eq "Portrait") { "none" } else { "none" }
$launchUrl = "$SiteUrl#/display/$([Uri]::EscapeDataString($DisplayId))?tv=1&mount=$mount"

$chromeCandidates = @(
  (Join-Path ${env:ProgramFiles} "Google\Chrome\Application\chrome.exe"),
  (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe"),
  (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe")
)
$chromePath = $chromeCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $chromePath) { throw "Google Chrome was not found. Install Chrome, then run this setup again." }

New-Item -ItemType Directory -Path $installDir -Force | Out-Null
Copy-Item (Join-Path $PSScriptRoot "Launch-LanternDisplay.ps1") (Join-Path $installDir "Launch-LanternDisplay.ps1") -Force
$installedSetupScript = Join-Path $installDir "Setup-LanternDisplay.ps1"
$sourceSetupScript = Join-Path $PSScriptRoot "Setup-LanternDisplay.ps1"
if (([IO.Path]::GetFullPath($sourceSetupScript)) -ne ([IO.Path]::GetFullPath($installedSetupScript))) {
  Copy-Item $sourceSetupScript $installedSetupScript -Force
}
$config = [ordered]@{
  SiteUrl = $SiteUrl
  DisplayId = $DisplayId
  Orientation = $Orientation
  LaunchUrl = $launchUrl
  ChromePath = $chromePath
  UserDataDir = (Join-Path $installDir "ChromeProfile")
  InstallDir = $installDir
  WatchdogSeconds = 15
}
$config | ConvertTo-Json | Set-Content (Join-Path $installDir "config.json") -Encoding UTF8

# Pre-authorize the dedicated display site in Chrome so room-camera discovery
# can enumerate the attached webcam and microphone on first use. Re-running
# setup replaces these values for the configured site without touching board
# data or the dedicated Chrome profile.
$siteOrigin = ([Uri]$SiteUrl).GetLeftPart([UriPartial]::Authority)
$chromePolicyRoot = "HKLM:\Software\Policies\Google\Chrome"
New-Item -Path $chromePolicyRoot -Force | Out-Null
New-ItemProperty -Path $chromePolicyRoot -Name "VideoCaptureAllowedUrls" -PropertyType MultiString -Value @($siteOrigin) -Force | Out-Null
New-ItemProperty -Path $chromePolicyRoot -Name "AudioCaptureAllowedUrls" -PropertyType MultiString -Value @($siteOrigin) -Force | Out-Null
$launchScript = Join-Path $installDir "Launch-LanternDisplay.ps1"
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$launchScript`""
$signInTrigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$morningTrigger = New-ScheduledTaskTrigger -Daily -At 5:00AM
$taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $signInTrigger -Settings $taskSettings -User $env:USERNAME -RunLevel Highest -Force | Out-Null
Register-ScheduledTask -TaskName $morningTaskName -Action $action -Trigger $morningTrigger -Settings $taskSettings -User $env:USERNAME -RunLevel Highest -Force | Out-Null

# Allow the hosted display page to hand edge-to-edge presentation off to the
# trusted local launcher. The protocol ignores web-supplied URLs and always uses
# the display assignment saved in config.json.
$protocolRoot = "HKLM:\Software\Classes\lantern-display"
New-Item -Path $protocolRoot -Force | Out-Null
Set-Item -Path $protocolRoot -Value "URL:Lantern Display Protocol"
New-ItemProperty -Path $protocolRoot -Name "URL Protocol" -Value "" -PropertyType String -Force | Out-Null
$protocolCommand = "PowerShell.exe -NoLogo -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$launchScript`" -Once"
New-Item -Path (Join-Path $protocolRoot "shell\open\command") -Force | Out-Null
Set-Item -Path (Join-Path $protocolRoot "shell\open\command") -Value $protocolCommand

# Keep the wired display awake while the mini PC has AC power.
powercfg.exe /change monitor-timeout-ac 0 | Out-Null
powercfg.exe /change standby-timeout-ac 0 | Out-Null
powercfg.exe /change hibernate-timeout-ac 0 | Out-Null

$desktop = [Environment]::GetFolderPath("Desktop")
$launcherArgs = "-NoLogo -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$launchScript`" -Once"
New-DesktopShortcut (Join-Path $desktop "Lantern Display.lnk") "PowerShell.exe" $launcherArgs "Open the assigned Lantern recognition display edge to edge."
New-DesktopShortcut (Join-Path $desktop "Lantern Display Setup.lnk") "PowerShell.exe" "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$installDir\Setup-LanternDisplay.ps1`"" "Change the assigned Lantern display or monitor orientation."
Set-Content (Join-Path $installDir "Display-URL.txt") $launchUrl -Encoding UTF8

Write-Host ""
Write-Host "Lantern display setup is complete." -ForegroundColor Green
Write-Host "Display: $DisplayId ($Orientation)"
Write-Host "URL: $launchUrl"
Write-Host "The display starts at sign-in and has a daily 5:00 AM recovery check."
Write-Host "Chrome camera and microphone access is pre-authorized for the Lantern site."
Write-Host "For power-on after a complete shutdown, enable the mini PC BIOS option described in README-PC-SETUP.md."
Read-Host "Press Enter to close"
