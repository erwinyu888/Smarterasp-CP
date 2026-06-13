I did the account-side parity check as a review only. I did not change code.
Source used: latest account ASP under /Users/erwinyu/Downloads/hosting/cp8/account, with the MD map from /Users/erwinyu/Downloads/cp8/ACCOUNT_FUNCTION_MAP_FULL.md.
Major Gaps
Login is not parity with ac-login.asp
Current new login only looks up customerLogin and sets session; it does not validate password right now, because we intentionally allowed dev login earlier. See Startup.cs (line 4504).
Old ac-login.asp includes security code/Turnstile checks, bad-login lockout, email login, CP-login shortcut, login alias, remember-me cookies, AP/reseller login paths, status handling, 2FA state, browser language update, login logging, and CP redirect logic. See ac-login.asp (line 14).
Password reset token timing differs
Old flow deletes reset rows older than 30 minutes when creating a reset link, but the reset completion page rejects links older than 20 minutes. See retrieve_password_action.asp (line 58) and retrieve_password_reset_done.asp (line 41).
New flow accepts reset links up to 30 minutes. See Startup.cs (line 4693).
Password change/reset does not sync CP, FTP, IIS, SSRS, Linux credentials
Old password_change_action.asp can update selected CP passwords, FTP passwords, IIS Manager passwords, SSRS/Linux-related credentials, and handles verification PIN/reverify cases. See password_change_action.asp (line 92).
New flow only updates customer_profile.pp1 and explicitly says sync will happen later. See Startup.cs (line 2388).
Email change verification does not complete the DB update
Old emailchangeverify.asp updates encrypted customer_profile.email, deletes reset_verify, and updates helpdesk login behavior. See emailchangeverify.asp (line 48).
New verify endpoint validates the link but returns a message saying final encrypted email write still needs legacy-compatible writer. See Startup.cs (line 2527).
Profile update is too direct
Old profile_update_action.asp calls helper functions for profile/contact/billing updates and has special email-change flow, VAT handling, sync behavior, and multiple action modes. See profile_update_action.asp (line 121).
New flow directly updates many customer_profile columns. It covers more fields than before, but it bypasses the old helper logic and does not include SMS/mobile verification. See Startup.cs (line 2249).
2FA is incomplete
MD maps 2fa_verify.asp, 2fa_action.asp, and 2fa_change.asp. Current new account side only has a disable endpoint. No enable/start/confirm/login verification parity exists yet. See Startup.cs (line 2535).

Renewal flow is only partially equivalent
Old cp_renew_1.asp creates buyer_temp and calls goto_temp_checkout; multiple_renewal1.asp creates Renew_temp through SetupRenewTempOrder and goes to /checkout/account_screen_renew. See cp_renew_1.asp (line 80) and multiple_renewal1.asp (line 31).

New single renewal creates buyer_temp, but multiple renewal creates multiple separate buyer_temp rows and opens the first checkout. That does not match the old grouped Renew_temp flow. See Startup.cs (line 1112).
Add-on purchase mapping is not exact
Old addon_purchase_action.asp maps by posted product_cat, stores session fields, carries coupon in info4, handles SSL limits, static IP special redirect, SSL cert request redirect, and many product-specific page types. See addon_purchase_action.asp (line 64).
New flow infers page type from product name with DetermineAddonPageType, stores price id in info4, and does not reproduce all product_cat branching. See Startup.cs (line 6274) and Startup.cs (line 1637).
Add-on completion/provisioning actions are mostly missing
The old flow has many post-payment action files that actually provision quotas/features: MSSQL/MySQL, disk, email, static IP, SSL, backups, sent limits, tasks, RAM, VPN quota, etc. New flow mostly creates checkout temp orders; it does not implement all completion actions from the mapped addon_purchase_*_action.asp files.

VPN user lifecycle is not real parity
Old vpn_action.asp creates VPN users in vpnclient, selects vpnhost, runs SSH commands for IKEv2/OpenVPN, streams .ovpn, converts users, deletes remote config, and deletes DB rows. See vpn_action.asp (line 49).

New VPN create/action endpoints are preview/placeholder style and say live host changes are held for worker/provisioning. See Startup.cs (line 1317).
Domain list is missing old table actions/behavior
Old domain_list.asp shows Whois privacy toggle, renew icon, DNS records icon, domain profile/settings icon, registrar verification status, transfer logs/resubmit links, and expired/deleted handling. See domain_list.asp (line 356).
New domain API loads domains and has registrar action endpoints, but the UI/API does not fully mirror all old list states and action links yet.
Domain purchase checkout is not exact
Old checkoutDomainBuy.asp consumes sessionCart, uses account balance, creates client_product, inserts DomainRegisterInfo, inserts domain_profile, deletes cart rows, and redirects to domain info or purchase list. See checkoutDomainBuy.asp (line 92).
New domain checkout syncs sessionCart and creates a buyer_temp order for “Domain Registration.” That is closer to /account/checkout.asp, not the full checkoutDomainBuy.asp completion path. See Startup.cs (line 535).
Domain DNS now uses the live legacy DNS agent
Old dns_action.asp modifies DNS records using legacy DNS helpers. See dns_action.asp (line 42).
New account DNS manager validates domain ownership, then calls legacy-agents/dnsAgent.asp through LEGACY_DNS_AGENT_URL. The agent reuses showRecord/add*/deleteRecordAt from includes/sdnsfunctions.inc.
Domain contact/nameserver/privacy/lock are not exact enough yet
New registrar actions call OpenSRS directly. Old files use legacy helper methods and local DB/session behavior around DomainRegisterInfo, privacy eligibility, lock state, nameserver fallback, and profile updates. See modifyContact_action.asp (line 507), modifyWhoisStatus.asp (line 20), modifynameserver.asp (line 73).

New Purchase is close, but still missing old catalog/session details
The newly rebuilt New Purchase flow now follows buyer_temp -> recommended add-on -> /checkout/account_screen, which is the right skeleton. Gaps remain: coupon pricing, SCode/token validation, brand/location rules, exact helper product lists, plantype, and trial/paid activation variants. See ACCOUNT_CP_PURCHASE_LIST_TRACE.md (line 1) and Startup.cs (line 1952).

Mostly Matching / Close
Dashboard data and renewal notice loading broadly match the mapped dashboard intent, but old include/UI behavior is not 1:1.
Billing history date-window behavior and invoice ownership checks look close based on the prior audit.
Affiliate cash payout rules look mostly aligned: PayPal required for cash, $3000 max, pending insert into client_commission_cashout. See commissionview_action.asp (line 70) and Startup.cs (line 1739).
New Purchase core temp-order handoff is now much closer than before.
