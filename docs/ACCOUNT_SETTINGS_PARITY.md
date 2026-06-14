# Account Settings Parity

Latest source checked:

- `/Users/erwinyu/Downloads/hosting/cp8/account/emailchangeverify.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/profile_update_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/2fa_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/2fa_change.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/2fa_verify.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/profile_update.inc`

Implemented updates:

- Email-change verification now validates the pending `reset_verify` row and hash, then only completes the DB update when a legacy-compatible `encryptpwd` writer is configured. It no longer returns a misleading completed state when the encrypted write cannot be done.
- Profile update now writes the Classic ASP profile helper columns for display/contact fields, including `name_zh_cn`, `company_name_zh_cn`, contact address, billing address, and VAT.
- 2FA disable now deletes the `[2fa]` row, matching `ga_delete`.
- 2FA setup now calls the same legacy `member5.smarterasp.net/2fa` helper flow to create a secret, QR URL, and verify a six-digit code.
- Existing legacy 2FA secrets are compatible with the rebuilt login flow. On 2026-06-14, live enabled `[2fa]` rows were sampled read-only, decrypted through the standalone Classic ASP `decryptpwd` bridge into valid 16-character TOTP secrets, and checked against the legacy verifier with a dummy code.

Remaining blockers:

- Email verification can complete the `customer_profile.email` update when the standalone Classic ASP `encryptpwd` bridge is configured.
- 2FA confirm stores `[2fa].secret` through the standalone Classic ASP `encryptpwd` bridge.
- Login-time 2FA verification parity is implemented through the rebuilt post-login verification gate and verified against existing legacy encrypted secrets.
- SMS/mobile verification from the old profile flow remains pending until the legacy SMS gateway behavior and disposable test target are confirmed.
