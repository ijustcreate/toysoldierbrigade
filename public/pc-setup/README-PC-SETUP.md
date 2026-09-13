# Lantern display PC setup

This package prepares a fresh Windows 11 mini PC to run one assigned museum recognition display.

## What the setup does

1. Asks for the hosted site URL, display ID, and monitor orientation. Use the display ID shown in the Lantern control center, such as `display-1`.
2. Finds the installed Google Chrome executable and saves the assigned display URL.
3. Copies the display launcher to `C:\ProgramData\LanternDisplay`.
4. Creates a full-screen Chrome launcher using a separate browser profile, so the display does not reuse a staff member's normal Chrome tabs or profile. The launcher uses a conventional Windows composition path and sRGB output to avoid solid-green fullscreen failures on some portrait HDMI displays.
5. Creates `Lantern Display.lnk` on the desktop for manual recovery and `Lantern Display Setup.lnk` to change the assignment later.
6. Registers the local `lantern-display:` launcher so the hosted site's **Present on TV** control can reopen the dedicated display in true kiosk mode.
7. Registers a Windows task that starts the player whenever the configured Windows account signs in.
8. Registers a second Windows task that performs a recovery check every day at 5:00 AM. If Chrome was closed, the player starts again.
9. Runs a small watchdog that reopens Chrome if it crashes or is closed. If Chrome reused the dedicated profile without kiosk mode or without the TV compatibility settings, the launcher closes only that profile and reopens it correctly.
10. Sets the AC monitor, sleep, and hibernate timers to never expire so the attached display stays available while the PC has power.
11. Pre-authorizes the configured Lantern site in Chrome for camera and microphone capture so the Room camera panel can detect the webcam attached to this display PC.

The package does not change museum board content, enable remote access, store a Windows password, or turn the TV on and off. The display page itself requests the browser Screen Wake Lock when supported, but Windows and the TV's own power settings still need to be tested on site.

## Install

1. Install current Google Chrome and connect the mini PC to the intended monitor.
2. Extract this ZIP to a local folder.
3. Right-click `Setup-LanternDisplay.bat` and choose **Run as administrator**.
4. Enter the hosted site URL, assigned display ID, and orientation when prompted.
5. Sign in once to the Windows account that should run the display, then restart the PC to verify automatic startup.

The setup can be run again over an existing installation. It updates the launcher, configuration, scheduled tasks, shortcuts, and Chrome camera/microphone authorization in place; it does not replace saved board data. After connecting a new webcam, open the display's Room camera panel and click its refresh-device button.

For unattended recovery after a reboot or power outage, Windows must sign in to this dedicated display account automatically. On a dedicated, physically secured display PC, press `Win+R`, run `netplwiz`, clear **Users must enter a user name and password to use this computer**, select the display account, and enter its password. Use a standard local account dedicated to the display; do not use a staff administrator account. This setting keeps a credential on the PC, so follow the museum's IT policy. If automatic sign-in is prohibited, an operator must sign in after the PC powers on, or IT should configure an approved Windows kiosk/MDM profile.

The setup is designed for a PC that remains powered on or sleeps. A Windows task can wake a sleeping PC only when wake timers are allowed by the power plan and hardware. If the PC is fully shut down, open BIOS/UEFI and look for one of these names: **Power On By RTC**, **Resume By Alarm**, **Wake on RTC**, or **Restore AC Power Loss**. Configure the daily 5:00 AM power-on and choose **Power On** after AC loss if the firmware offers it. Firmware menus vary by manufacturer; verify this on the delivered mini PC before mounting it.

For portrait displays, set Windows **Settings > System > Display > Display orientation** to **Portrait**. Leave the Lantern mount setting at `none`; do not rotate the screen in both Windows and the player.

After installing on a TV that previously turned green, open the desktop **Lantern Display** shortcut and leave it running for at least two minutes. Confirm that the board reaches all four edges, the taskbar and Chrome controls remain hidden, and the screen does not turn green. Press `Alt+F4` to leave kiosk mode. If the physical TV turns green, press `Win+Ctrl+Shift+B` once to reset the Windows graphics driver, then record the Windows resolution, refresh rate, HDR setting, mini-PC model, and TV model before changing other settings.

## Recovery and maintenance

Use the desktop setup shortcut to change the assigned display. Use Task Scheduler to inspect the tasks named `Lantern Display - Start at sign-in` and `Lantern Display - 5 AM check`. To stop the display temporarily, close Chrome and disable those tasks until maintenance is complete.

## Remote-access planning (not enabled by this package)

The safest first version is same-network Windows Remote Desktop when the mini PCs run Windows 11 Pro. Create a dedicated local support account with a strong unique password, enable Remote Desktop only on the **Private** network profile, allow it through Windows Firewall, and record each PC's name or reserved LAN address. Staff could then use `mstsc.exe` from another museum computer. Windows 11 Home cannot host the built-in RDP service, so it would need a separately approved tool such as Chrome Remote Desktop or RustDesk.

Before adding a guided button to the site, we should decide whether remote access is LAN-only, which Windows edition the PCs have, who is allowed to use it, and how credentials will be stored and rotated. The site should provide an explanation and a printable checklist; it should not expose passwords or silently open remote access from a browser click.
