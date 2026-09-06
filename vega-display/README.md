# Recognition Boards for Fire TV Stick 4K Select

This is native Vega app source and an SDK-template installer for the existing
Fire TV Stick 4K Select on Vega OS 1.2. The app runs on the Stick after sideloading;
the Mac is needed for building/installing, not as an HDMI player.

## 1. Finish Mac SDK installation

On the Intel Mac, finish Amazon's [SDK 0.24 installation](https://developer.amazon.com/docs/vega/0.24/install-vega-sdk).
Open a fresh Terminal and run:

```sh
vega --version
vega project list-templates
```

The list should include `vegaWebview`. Use SDK 0.24's own template so the native
entrypoint, package registration, WebView services and manifest agree with the SDK.
If this template is missing, stop and check the SDK selection instead of substituting
an Android project. These source files do not require a Windows SDK installation.

Amazon's 0.24 release notes require device OS 1.2 build **2101020054720**; check
My Fire TV > About and install the offered system update if necessary.

## 2. Prepare and build on the Mac

Copy this entire `vega-display` folder to the Mac, for example into Downloads.
Then run:

```sh
cd ~/Downloads/vega-display
node test.mjs
node prepare.mjs
cd generated
npm run build:app
```

`prepare.mjs` creates a new `generated` project, installs this app's source,
sets minimum/target OS to 1.2, resolves compatible dependencies and runs
`vega project doctor`. It refuses to replace an existing directory. To retry
after fixing an installation error, use another destination, for example
`node prepare.mjs ./generated-retry`.

Use the **armv7-release** `.vpkg` produced by the template build for the physical
Fire TV. A Mac simulator package is not the Stick package. If the template's build
script does not emit armv7-release, use Vega Studio's build configuration to select
Fire TV/armv7 and Release. A Release build must run without a Metro development server.

## 3. Enable Developer Mode and sideload

Follow Amazon's [Developer Mode instructions](https://developer.amazon.com/docs/vega/0.24/developer-mode)
and [device connection / installation guide](https://developer.amazon.com/docs/vega/0.23/run-apps).
Developer Mode requires the device/account authentication steps in that guide.
Then run on the Mac:

```sh
vega device list
```

With exactly one Fire TV connected, install the actual armv7-release file shown
by the build, then launch the component ID in `generated/manifest.toml`:

```sh
vega device install-app --packagePath build/armv7-release/RecognitionBoards_armv7.vpkg
vega device launch-app --appName org.ijustcreate.recognitionboards.main
```

The SDK template controls the filename and component suffix: if its generated
values differ, substitute those values. With multiple devices, add `-d` and the
Fire TV device serial after `vega device` in each command. The source package ID
is `org.ijustcreate.recognitionboards`.

Once installed, open Recognition Boards from the Fire TV app launcher. Use remote
arrows and Select to choose sideways mounting, turn direction and the existing
display. The display's existing schedules and board content are retained. Back
returns to display setup; reopening the app restores the last selected display.
Remove the Mac connection and verify the release app still works on the Stick.

## What this version does

- Opens the protected live site at `https://ijustcreate.github.io/toysoldierbrigade/#/tv`.
- Reuses its saved live boards, schedules and portrait rendering. It never bundles
  this worktree's potentially older board data into the app.
- Saves only the selected display route in device-local WebView storage. DOM
  storage is explicitly enabled because Vega defaults it off.
- Prevents dashboard navigation, HTTP mutations, beacon uploads and outgoing
  `state-update` relay messages. Live reads and display presence remain available.
- Retries failed main-page loads with a 10–60 second backoff; recreates an
  unresponsive foreground WebView after 90 seconds without a page heartbeat.
  Healthy pages are not periodically reloaded, including while Wi-Fi is lost.
- Uses normal foreground/background lifecycle behavior; a resumed page gets a
  grace period before recovery. Selection is saved when changed, without relying
  on a pre-kill callback.

## Internet, sleep and event acceptance

Native installation does not make remote content offline. This initial player
requires internet for initial loading and fresh updates. The existing web app
has local state fallback, but this version does **not** package the full website
or guarantee cached images/video and cold startup offline. Keeping an already
loaded board running during Wi-Fi loss is a separate device test.

This app does not claim an OS wake lock or automatic startup after a reboot.
Amazon confirms TimeoutManager/PERMANENT do not override `forceDisplayOff` on
4K Select. There is no supported automatic relaunch after that kill; reopen the
app from Home and it restores selection. Ambient Experience ON can preserve the
background app instead of killing it, but Ambient itself replaces the board.
Set the longest appropriate user-visible idle interval, then test it. No dummy
media, fabricated remote input or undocumented power commands are used.

Before the event, on the actual portrait VIZIO and Stick:

1. Confirm remote-only setup, both rotations and legible full-screen board content.
2. Confirm the intended existing display and its scheduled transitions; compare
   content with the operator dashboard without editing it for this test.
3. Home away, reopen, force-stop/reopen and reboot/reopen; verify saved selection.
4. After a board loads, disconnect Wi-Fi for 10 minutes, then restore it. Verify
   current content remains visible and subsequent updates recover. Separately
   test offline cold launch; do not count browser caching as a promised feature.
5. Leave the remote untouched for 5, 15, 30 and 60 minutes, then for the full event
   duration. Record when Ambient appears, display sleeps or the app exits. If any
   occurs before the required duration, this build has not passed unattended use.
6. Check live board/schedule counts and content remain unchanged. No content
   migration, production deployment or fixture upload is part of this workflow.

## Verification status and references

Windows checks cover the JavaScript bridge and source preparation. Native SDK
compilation, WebView prop compatibility, installation and real-device behavior
must still pass on the Mac/Stick. This folder is source, **not a built .vpkg**.

- [Amazon: native WebView template and build](https://developer.amazon.com/docs/vega/0.24/build-an-app)
- [Amazon: WebView props and injection](https://developer.amazon.com/docs/vega-api/0.24/webview-component-reference)
- [Amazon: OS compatibility](https://developer.amazon.com/docs/vega/0.24/target-os-version)
- [Amazon: SDK 0.24 release notes](https://developer.amazon.com/docs/vega/0.24/vega-release-notes)
- [Amazon support: independent display power path](https://community.amazondeveloper.com/t/4k-select-documenting-the-system-component-responsible-for-5-minute-display-force-off-power-service-core-forcedisplayoff/28268/4)
- [Amazon support: cold relaunch and restore](https://community.amazondeveloper.com/t/vega-ambient-mode-idle-behavior/28788)
- [Directable: Vega-native Select support](https://directable.com/help/important-device-compatibility-notice)

Directable now advertises a Vega-native player for this Stick. Its public notice
does not disclose a power-management API or demonstrate uninterrupted overnight
display. That precedent supports making a native player; it does not establish a
keep-awake technique we can copy. No third-party account is required for this app.
