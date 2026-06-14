# Account Panel Parity Review

Date: 2026-06-13

This review compares the rebuilt React/ASP.NET account panel against the latest Classic ASP sources under `/Users/erwinyu/Downloads/hosting/cp8/account`, using `/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc` and `/Users/erwinyu/Downloads/hosting/includes/oms_api.asp` for shared checkout, product, billing, and credit behavior.

## Review Rule

- Use the latest exact Classic ASP file for each feature.
- Do not infer behavior from similarly named files in other folders.
- Ignore disabled Classic ASP branches inside `if 1 = 2 then ... end if`.
- Do not mutate existing customer data during review.
- Only create new disposable checkout/temp rows when the legacy flow itself creates temp rows.

## Live `jyu001` Smoke Tests

These read paths passed against the running app on `http://localhost:5056`:

| Area | Endpoint | Result |
|---|---|---|
| Session | `POST /api/auth/login` with `jyu001` and empty password | Passed |
| Service status | `GET /api/account/service-status` | Passed |
| Dashboard / hosting list | `GET /api/account/dashboard` | Passed |
| Domains | `GET /api/account/domains` | Passed, 21 domains |
| Domain profile | `GET /api/account/domains/{id}/profile` | Passed for owned domain |
| Billing | `GET /api/account/billing` | Passed |
| Invoice detail | `GET /api/account/billing/orders/2498597/invoice` | Passed |
| Renewals | `GET /api/account/renewals` | Passed |
| VPN | `GET /api/account/vpn` | Passed |
| Add-ons | `GET /api/account/addons` | Passed |
| Affiliate | `GET /api/account/affiliate` | Passed |
| New order catalogs | hosting, managed hosting, Windows VPS, Linux VPS, reseller | Passed |
| Settings | `GET /api/account/settings` | Passed |
| OpenSRS search | disposable domain plus `sample.com` | Passed, live OpenSRS source |
| Checkout redirect | local `/checkout/checkout_overview?...` | Passed, redirects to member3 |

## Parity Status By Feature

| Feature group | Classic ASP source | Rebuilt status | Notes |
|---|---|---|---|
| Login/logout/session | `loginform.asp`, `ac-login.asp`, `logout.asp` | Working for dev login | Dev phase intentionally allows login without password once username exists. Production password/2FA enforcement must be restored before launch. |
| Dashboard / hosting cards | `account_screen*.asp`, `account_screen_cplist.asp`, `showCPListTable*.asp` | Working | Reads live `customer_profile`, `cp_config`, renewal notices, urgent logs. |
| Urgent log hide | `hide_log_ajax.asp` | Implemented | Ownership-scoped hide action exists. |
| Hosting renewal notice | `account_renew_list.asp`, `cp_renew_1.asp`, `hiderenewnotice.asp` | Implemented | Renewal checkout creates temp order and handoff; hide notice updates `noshowrenew`. |
| New hosting/VPS/cloud/dedicated/reseller order | `account_screen_Top_part2.asp`, `cp_purchase_list*.asp`, `cp_purchase_list_action.asp` | Implemented with compatibility fix | Catalogs read live products; checkout creates `buyer_temp` with `constPageType_NewCP`. API accepts `cloud-server` and `dedicated-server` aliases. |
| Domain list | `domain_list.asp` | Working | Includes status, renewal, Whois privacy support/purchase, grace period logic. |
| Domain profile/settings | `domain_profile.asp`, `domain_form_body_inc.asp` | Read working | Contact details load read-only. Registrar write actions are implemented through OpenSRS where safe, but should be tested only on disposable domains. |
| Domain search | `domain_purchase.asp`, OpenSRS lookup flow | Working | Live OpenSRS availability used; owned domains are blocked as account-owned. |
| Domain purchase checkout | `addtocart.asp`, `sitecart.asp`, `checkout.asp`, `checkoutDomainBuy.asp` | Temp order working | Creates `sitecart.dbo.sessionCart` rows and `oms.dbo.buyer_temp`, then redirects to `https://member3.smarterasp.net/checkout/checkout_overview`. |
| Domain transfer checkout | `domain_transfer.asp`, `transfer_domain_action.asp`, `transfer_domain_step*.asp` | Partially implemented | Duplicate DB guard and temp order exist. OpenSRS transferability pre-check is blocked because exact `xmlsample/checktransfer.txt` is missing. |
| DNS manager for account domains | `editdns.asp`, `dns_action.asp`, `includes/sdnsfunctions.inc` | Live agent wired | ASP.NET validates account ownership, then calls `legacy-agents/dnsAgent.asp`, which reuses `showRecord`, `addARecordOpt`, `addCNAMERecord`, `addMXRecord`, `addTXTRecord`, `addSRVRecord`, and `deleteRecordAt`. Requires `LEGACY_DNS_AGENT_URL` in production. |
| Billing balance/history | `accountbalance.asp`, `billings.asp` | Working | Uses live credit, transactions, active products, purchases, pending temp orders. |
| Invoice/receipt | `printreceipt.asp`, `generateinvoice.asp`, `getinvoice.asp` | Working | Ownership check and receipt fields implemented; tested with order `2498597`. |
| Deposit checkout | `accountbalance.asp`, `deposit_more.asp`, checkout pages | Handoff implemented | Deposit eligibility implemented and redirects to member3 `/checkout/deposit_v2`. Provider internals remain in Classic ASP checkout. |
| Add-on catalog | `addon_purchase.asp`, `addon_purchase_special.asp`, `addon_purchase_detail.asp` | Working | Catalog and live active add-ons load. |
| Add-on checkout | `addon_purchase_action.asp`, `functions.inc` page constants | Implemented | Creates `buyer_temp` with mapped page type and member3 checkout URL. Product-specific post-payment provisioning remains in Classic ASP fulfillment pages. |
| Add-on renewal | `addon_renew*.asp`, `option_addon_renew*.asp` | Basic renewal handoff implemented | Full option/domain/SSL renewal packing that uses legacy encrypted `Purchase_para` is not fully rebuilt. |
| VPN catalog/checkout | `vpn.asp`, `vpn_info.asp`, `addon_purchase_vpn_action.asp` | Catalog/checkout working | VPN user lifecycle actions exist but must be tested only with disposable VPN users. |
| VPN user lifecycle | `vpn_create.asp`, `vpn_action.asp` | Partially implemented | Create/action endpoints exist; full SSH/OpenVPN config parity should be verified against disposable users. |
| Affiliate summary/referrals/commission | `affiliate*.asp` | Read working | Summary, referrals, commissions, payout log load from live data. |
| Affiliate withdraw | `commissionview_action.asp`, `affiliate_withdraw.asp` | Implemented with OMS gateway dependency | Validates annual paid referral minimum and payout rules; cashout depends on configured legacy OMS service. |
| Profile settings | `profile.asp`, `profile_update_action.asp` | Mostly implemented | Contact/billing fields mapped. Mobile/SMS PIN verification remains blocked by SMS test target/gateway policy. |
| Password change/reset | `password_change*.asp`, `retrieve_password*.asp` | Account, CP password hash, root FTP, and IIS Manager/WebDeploy password sync use the configured legacy encrypt bridge | SSRS/Linux credential parity still needs disposable remote targets. |
| Email change verification | `profile_update_action.asp`, `emailchangeverify.asp` | Request/verify records and final encrypted `customer_profile.email` write implemented through the legacy encrypt bridge | Helpdesk sync depends on `HELPDESK_USER_UPDATE_API` when configured. |
| 2FA status/disable | `2fa_verify.asp`, `2fa_action.asp`, `2fa_change.asp` | Login verification, setup, confirm, legacy encrypted secret read, and disable implemented through the legacy 2FA helpers plus encrypt/decrypt bridge | Live legacy 2FA rows were sampled on 2026-06-14: encrypted secrets decrypted through the standalone `decryptpwd` bridge into valid 16-character TOTP secrets, and the legacy verifier returned the expected invalid response for a dummy code. |
| Support links | `chat.asp`, `helpdesk.asp` | Linked | External support links present. |

## Items Not Complete

These are not bugs in the current implementation; they are intentionally blocked until exact legacy dependencies or disposable test targets exist:

1. SMS phone verification: needs SMS gateway policy and disposable phone number.
2. Account re-verification email: production template is wired, encrypted email decrypt is wired, and the endpoint now fails closed until the deployed standalone encryption bridge supports `encryptimportkey2`.
3. Domain transferability check: rebuilt checkout now uses the exact `check_transfer` OpenSRS payload from fallback `/Users/erwinyu/Downloads/cp8/account/xmlSample/checktransfer.txt` because the latest hosting dump is missing that referenced file outside ignored folders.
4. Full payment-provider internals: currently redirects to Classic ASP member3 checkout pages.
5. Product-specific post-payment add-on fulfillment: still belongs to Classic ASP fulfillment pages after checkout.
6. Full domain contact/write parity: selected contact type now maps to the old `modifyContact(domain,..., mycontacttype)` flow and syncs `DomainRegisterInfo`; live write test should only be run as an explicit no-op or against a disposable owned domain.
7. SSRS/Linux credential sync after password change: needs the exact remote targets and disposable users before live parity testing.

## Fixes From This Review

- Added `cloud-server` and `dedicated-server` aliases to new-order catalog normalization so API calls match the old menu wording.
- Confirmed local checkout routes now redirect to `https://member3.smarterasp.net/checkout/...` instead of rendering the React handoff page.
