# SMTP Coverage

Source reference root: `/Users/erwinyu/Downloads/hosting/cp8`.

All rebuilt SMTP sends use the centralized ASP.NET sender in `Startup.cs`.
It uses no authentication, tries `SMTP_PRIMARY_HOST:SMTP_PRIMARY_PORT` first, then `SMTP_FALLBACK_HOST:SMTP_FALLBACK_PORT`.

## Implemented In New CP

- `account/retrieve_password_action.asp`: forgot password now sends through `/api/auth/password-reset/request`.
- `account/profile_update_action.asp`: contact email-change verification now sends through `/api/account/settings/email-change`.
- `account/activate_account_action.asp`: activation resend now sends through `/api/account/activation/resend`.
- `account/re-verify_action.asp`: account re-verification now sends through `/api/account/reverify/send`.
- `account/password_change_expired_skip.asp`: password-expiring skip notice now sends through `/api/account/password-expiring/skip`.
- `account/password_change_sendcode.asp`: password change verification code now sends through `/api/account/password-change/code`.
- `account/ac-login.asp`: failed-login abuse alert now sends after more than three failures from the same IP/login window.

## Pending Because Flow Is Not Fully Ported Yet

- `account/addon_purchase_cloudbackup_action.asp`: cloud backup setup notice belongs to the cloud-backup activation/provisioning flow. New add-on checkout currently creates the temp checkout order, but the post-payment activation flow is still legacy-hosted.
- `account/create_new_cp_action*.asp`: CP creation/debug/payment issue alerts belong to post-payment CP provisioning. New purchase starts checkout, but the full CP activation workflow is not fully ported.
- `functions/functions.inc`: static IP assignment and VM storage alerts belong to legacy provisioning helpers. New CP should wire those alerts when the matching provisioning calls are fully ported.
- `helpdesk/SendReport.aspx.vb`, `helpdesk/UserReadTicket.aspx.vb`, `helpdesk/web.config`: helpdesk mail is a separate helpdesk app, not the rebuilt account/control panel runtime.

## Env Keys

- `SMTP_PRIMARY_HOST=mail.smarterasp.net`
- `SMTP_PRIMARY_PORT=8889`
- `SMTP_FALLBACK_HOST=gw5000`
- `SMTP_FALLBACK_PORT=8889`
- `SMTP_FROM_EMAIL=noreply@smarterasp.net`
- `SMTP_FROM_NAME=SmarterASP.NET`
- `SMTP_TIMEOUT_MS=12000`
- `SMTP_ADMIN_ALERT_RECIPIENTS=erwinyu888@gmail.com,307329698@qq.com`
