# Pre-Launch Checklist

## Security
- [x] Remove production `console.log` statements from app flows.
- [x] Disable Redux DevTools in app builds.
- [x] Store auth tokens in `expo-secure-store`.
- [x] Enforce secure production URLs:
  - API must be `https://...`
  - WebSocket must be `wss://...` (when configured)
- [x] Validate authentication by checking stored token pair with `/me`.

## Performance
- [x] Hermes enabled via Expo config (`jsEngine: "hermes"`).
- [x] Lazy-load tab screens (`lazy: true`) and freeze inactive tabs.
- [x] Minor rerender optimizations for repeated navigation callbacks.
- [ ] Image optimization pass:
  - Ensure compressed assets (`webp`/optimized jpeg/png)
  - Avoid oversized images shipped in bundle

## Legal & Compliance
- [x] In-app Privacy Policy screen added.
- [x] In-app Terms of Service screen added.
- [ ] Host final legal documents on public URLs and link them from app/store listing.
- [ ] Confirm Play Store / App Store data safety forms match actual data use.

## Final Sanity
- [x] App icon and splash are configured.
- [ ] Remove any test data/dummy endpoints from release env.
- [ ] Confirm production backend URL and keys in release profile.
- [ ] Run crash-free testing on physical Android + iOS devices.
- [x] Version incremented (`1.0.1`, iOS build `2`, Android versionCode `2`).
- [x] Permission rationale present for location in Expo config.
- [ ] Verify camera/location purpose strings in store listing text and policy.
