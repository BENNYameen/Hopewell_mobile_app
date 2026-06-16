# PWA Install Notes

## HTTPS Requirement
- Install prompts are available only on secure origins (`https://`) or localhost.
- LAN IP URLs such as `http://192.168.x.x` typically do not expose install prompts.

## Localhost Behavior
- `localhost` can qualify for install prompt testing.
- Service worker registration in this project is disabled in development mode (`__DEV__`) to avoid stale caches while developing.

## Deployment Requirements
- Deploy static web output over HTTPS.
- Ensure these files are publicly reachable:
  - `/manifest.json`
  - `/sw.js`
  - `/offline.html`
  - `/icon-192.png`, `/icon-512.png`, `/icon-maskable-192.png`, `/icon-maskable-512.png`

## Browser Support
- Android Chrome / Chromium / Edge: install prompt via `beforeinstallprompt` when criteria are met.
- Desktop Chrome / Edge: install button in address bar and custom prompt support.
- iOS Safari: no `beforeinstallprompt`; users must use `Share -> Add to Home Screen`.

## Testing Limitations
- Prompt timing is browser-controlled and may not appear immediately.
- If app was previously dismissed/installed, clear site data or uninstall and retry.
