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

Remaining blockers:

- Email verification cannot safely update `customer_profile.email` until `encryptpwd(new_email)` is reproduced exactly or a trusted legacy encryption writer is configured.
- 2FA confirm cannot safely store `[2fa].secret` until `encryptpwd(secret)` is reproduced exactly or a trusted legacy encryption writer is configured.
- Login-time 2FA verification parity still needs the post-login gate that redirects enabled accounts to the 2FA verify screen before entering the panel.
- SMS/mobile verification from the old profile flow remains pending until the legacy SMS gateway behavior and disposable test target are confirmed.
