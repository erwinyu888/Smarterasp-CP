# ehbkey.zip Inspection Notes

Attachment inspected:

- `/tmp/codex-remote-attachments/019eb47c-7c87-76f1-a71f-39d93d86a8fa/0C3335BD-D7D9-456B-A46D-3B031F8CC35B/1-ehbkey.zip`

The archive was inspected in `/tmp/ehbkey-inspect` only. It was not copied into `/Users/erwinyu/Downloads/cp8` or committed into this repo.

2026-06-12 update: the newer legacy archive in `/Users/erwinyu/Downloads/hosting` now includes `ehbdata`, `ehbkey`, and shared `includes` folders. Prefer `/Users/erwinyu/Downloads/hosting` for future source review, and keep this note as historical context for the earlier attachment.

## Summary

This archive contains the missing shared include/key/helper layer that was not present in `/Users/erwinyu/Downloads/cp8` except for top-level `config_api.asp` and `oms_api.asp`.

Important: the archive includes live connection strings, private keys, password-encryption keys, and SSH keys. Do not commit those raw files into this repo. If we need values for local development, move them into environment variables or user-secrets and keep the repo sanitized.

## Files Already Present In `/cp8`

- `includes/config_api.asp` already exists as `/Users/erwinyu/Downloads/cp8/config_api.asp`
- `includes/oms_api.asp` already exists as `/Users/erwinyu/Downloads/cp8/oms_api.asp`

## Newly Useful Missing Files

### Connection And Secret Context

- `ehbdata/conn.asp`
- `ehbdata/key`
- `ehbkey/key.asp`
- `includes/encryption.asp`
- `ehbdata/config.inc.php`
- `ehbdata/linux_private.pem`
- `ehbdata/linux_public`

Usefulness:

- Confirms password/encryption helpers for CP, DB, FTP, and server passwords.
- Confirms several connection strings and external API credentials exist in old includes.
- Helps rebuild decryption/encryption compatibility, but raw secrets should stay out of source control.

### DNS Helpers

- `includes/dnsfunctions.inc_`
- `includes/sdnsfunctions.inc`
- `includes/sdnsfunctions_AP.inc`
- `includes/pdns_func.asp`
- `includes/sdnsusage.htm`

Usefulness:

- Fills the DNS-provider gap from `PANEL_CP_SECTIONS_SPEC.md`.
- Contains zone and record operations such as add/delete zone, show records, and add/delete A/MX/TXT/CNAME/SRV records.
- Uses Simple DNS style APIs/COM helpers and HTTP API calls.

### SmarterMail Templates

- `includes/smartermailxml/AddDomain.txt`
- `includes/smartermailxml/AddUser2.txt`
- `includes/smartermailxml/DelDomain.txt`
- `includes/smartermailxml/GetAllDomains.txt`
- `includes/smartermailxml/GetDomainSetting.txt`
- `includes/smartermailxml/GetRequestedUserSettings.txt`
- `includes/smartermailxml/GetUser.txt`
- `includes/smartermailxml/GetUserQuotas.txt`
- `includes/smartermailxml/SetRequestedUserSettings.txt`
- `includes/smartermailxml/StartServices.txt`
- `includes/smartermailxml/StopServices.txt`
- `includes/smartermailxml/UpdateDomainSetting.txt`
- `includes/smartermailxml/UpdateUserForwardingInfo2.txt`

Usefulness:

- Fills the Email/SmarterMail API template gap.
- Gives the exact SOAP/XML payload shapes for domain creation, deletion, service start/stop, mailbox quota, user settings, and forwarding.

### RPC / Legacy Agent Wrapper

- `includes/rpc_cp8.inc`

Usefulness:

- Fills the remote command and CP-agent call details.
- Contains wrappers for remote command token calls, CP agent calls, HTTP calls, timeout variants, DNS lookup helpers, and server credential lookup/decryption.
- This is important for IIS, file manager, task scheduler, and any legacy `remote_cmd2` replacement.

### API Wrappers

- `includes/config_api.asp`
- `includes/oms_api.asp`

Usefulness:

- Confirms SOAP services used by account/CP flows.
- `oms_api.asp` includes `GetCredit(clientid)` and credit transaction helpers.
- These match the account-panel credit functions we previously searched for.

### Security/Input Helpers

- `ehbdata/hackcheck.asp`
- `includes/hackcheck.asp`
- `ehbdata/sqlinjectfilter.inc`
- `includes/sqlinjectfunc.inc`
- `includes/JSON.asp`

Usefulness:

- Gives old input-normalization behavior and SQL injection allowlist/filters.
- Useful for compatibility review, but the new app should keep using parameterized SQL and typed validators instead of porting ad hoc filters directly.

### Config And Messages

- `includes/configs.inc`
- `includes/configs_individual.inc`
- `includes/messages.inc`
- `includes/messages.inc.1`
- `includes/strings-cn.xml`
- `includes/translate.inc`

Usefulness:

- Confirms current DNS server values, mail quota API URLs, and user-facing legacy messages.
- Useful when matching old error text or plan-type behavior.

## Spec Gaps This Archive Helps Close

- DNS provider/API implementation details.
- SmarterMail XML payload templates and admin/service actions.
- Remote command / CP agent wrapper behavior.
- Password encryption/decryption compatibility.
- Scheduler connection information appears in old connection config.
- `GetCredit` and OMS credit transaction functions.

## Still Not Fully Solved By This Archive

- Namecheap SSL API wrapper details were not obvious in this archive.
- Cloudflare API wrapper details still mainly come from `/cp/cloudflare*.asp`.
- File manager remote API implementation still needs deeper review of `/cp/newfileman/*` and related remote endpoints.
- Live legacy agent reachability is still an environment/network issue; the file contents do not make `WIN8185.site4now.net:830` reachable.

## Recommended Next Step

When implementing DNS, Email, or legacy-agent functions, read from `/tmp/ehbkey-inspect` during the current session or copy only sanitized non-secret reference files into a private local reference folder. Do not commit raw `conn.asp`, key files, PEM files, or password-bearing config.
