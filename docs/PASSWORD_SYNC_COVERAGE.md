# Password Sync Coverage

Source of truth:

- `/Users/erwinyu/Downloads/hosting/cp8/account/password_change_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/retrieve_password_reset_done.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/fn_db.inc`
- `/Users/erwinyu/Downloads/hosting/cp8/lcp/uFunctions.inc`

Implemented in the rebuilt CP:

- Main account password updates `customer_profile.pp1`, `securityversion`, `customerPassHash`, and `reVerify`.
- Active hosting account CP login hash updates `cp_config.pp1`.
- Active hosting account CP legacy encrypted password updates `cp_config.cpPasswordHash` when `LEGACY_ENCRYPTPWD_API_URL` or a validated legacy-compatible encrypt mode is configured.
- Windows root FTP password sync follows the active Classic ASP DB-only path in `updateFtpUserPassword(...)`: it updates `cp_config_FTP.ftp_password` with `encryptpwd(...)` output and `cp_config_FTP.pp1` with `encryptFTPpwd(...)` output when both legacy encrypt bridge endpoints are configured.
- Windows root FTP row recreation follows the active Classic ASP `createFTPSingle(...)` path when the root FTP row is missing: it inserts `cp_config_FTP` with the hosting root path, disk quota, `write` permission, and encrypted password values.
- Windows IIS Manager/Web Deploy password sync calls `/IIS_api.asp` with `SetIISManagerUser` `AddUser` and `ResetUser`, matching `SetIISManagerUser_rpc`.
- SSRS local user password sync checks `cp_config_SSR`, then calls `/aspuser.asp` with `LocalUserAdd` and `LocalUserPasswordReset`, matching `createWindowsLocalUser` and `updateWindowsLocalUser`.
- Linux/cPanel password sync calls WHM `/json-api/passwd`, matching `change_password`, when `LCP_WHM_AUTHORIZATION` is configured.
- Reset-token password changes run the same hosting sync as account password changes.

Known blockers:

- `cp_config.cpPasswordHash` is skipped unless exact Classic ASP `encryptpwd` output is configured.
- `cp_config_FTP.ftp_password` and `cp_config_FTP.pp1` are skipped unless exact Classic ASP `encryptpwd` and `encryptFTPpwd` output is configured.

Environment required:

- `LEGACY_SERVER_DOMAIN_NAME`, `LEGACY_AGENT_SCHEME`, and `LEGACY_AGENT_PORT` for Windows agent calls.
- `LCP_WHM_AUTHORIZATION`, `LCP_WHM_SCHEME`, and `LCP_WHM_PORT` for Linux/cPanel WHM password sync.
- `LEGACY_ENCRYPTPWD_API_URL` for Classic ASP `encryptpwd(...)` output.
- `LEGACY_ENCRYPTFTPPWD_API_URL` for Classic ASP `encryptFTPpwd(...)` output.
