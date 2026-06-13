# Account New Purchase Flow Trace: `cp_purchase_list*.asp`

Source priority: latest active files under `/Users/erwinyu/Downloads/hosting/cp8/account`. Fallback `/Users/erwinyu/Downloads/cp8/account` has the same `cp_purchase_list*.asp` filenames, but was not used as the source of truth.

## Shared List Page Behavior

These pages are product selectors. They do not create hosting accounts directly. They list products, price terms, coupon-adjusted pricing, and post a selected row to a follow-up action.

Common setup used by most files:

- Include `/account/account_screen_top.asp`.
- If `session("buyerror")` exists, move it to `session("lastMessage")`.
- Reject inactive account status: `session("ac_status") = 0` redirects to `/account/activate_account`.
- If `request("plantype")` resolves to a reseller product description, redirect to `/account/cp_purchase_list_reseller`.
- Set `location = "ALC"` by default; `HKG` maps to `ALC`, `AMS` maps to `IFC`.
- Generate `scode = generateSCode()` and store `session("scode")`.
- Include `/account/couponinclude.asp`.
- For each product, skip trial products and trial prices.
- Price display uses:
  - `GetPrice(product_id, currency, payment_term)` when no coupon.
  - `GetPriceWithCoupon(product_id, currency, payment_term, customerID, purchase_couponcode)` when coupon is active.
  - Monthly display is calculated by dividing by term months.

## Shared Checkout Action

Most list pages submit to:

`/account/cp_purchase_list_action.asp`

Expected POST fields:

- `action=Buy`
- `para={currency}|{payment_term}|{payment_amount}`
- `product_id`
- `product_name`
- `token`
- `SCode`
- `product_mark`

Action flow:

1. Require `ac_checkLoginSession()`, else `goto_ac_loginform()`.
2. Validate `para`, `product_name`, and `product_id` with `generic_sqlinjection_prevent`.
3. Split `para` into:
   - `currencytype`
   - `payment_term`
   - `payment_amount`
4. Store selected purchase fields in session:
   - `purchase_product_id`
   - `purchase_payment_term`
   - `purchase_currencytype`
   - `purchase_product_name`
   - `purchase_payment_amount`
   - `purchase_token`
   - `product_mark`
5. Create a temp checkout row:
   - `SetupTempOrder(product_id, product_name, payment_term, currencytype, client_product_id, purchase_couponcode, cpID, constPageType_NewCP)`
6. `SetupTempOrder(...)` inserts into `ehbOrderSTR.buyer_temp`:
   - `amount = session("purchase_payment_amount")`
   - `id = generated GUID`
   - `customer_id = session("customerid")`
   - `product_id`
   - `product_name`
   - `info1 = payment_term`
   - `info2 = currencytype`
   - `info3 = client_product_id`
   - `info4 = purchase_couponcode`
   - `info5 = cpID`
   - `pagetype = constPageType_NewCP` (`1`)
7. Recommended add-on redirect happens before checkout:
   - Product name contains `W` or `V68`: `/account/addon_purchase_recommended`
   - Product name contains `V6` and not `V69`: `/account/addon_purchase_recommended_serverbackup`
   - Otherwise: `/account/addon_purchase_recommended_sitebackup`
8. Recommended add-on actions may call `SetupTempOrderTrackable(...)` for an extra product, add its amount to `session("purchase_payment_amount")`, then redirect to:
   - `/checkout/account_screen?guid={order_guid}`

Important quirk: `cp_purchase_list_action.asp` has `call goto_temp_checkout(order_guid)` after the recommended redirect block, but the redirects above end the response first in normal ASP behavior.

## `SetupTempOrder` And Checkout Handoff

Defined in `/functions/functions.inc`.

- `SetupTempOrder(...)` creates `buyer_temp`.
- `SetupTempOrderTrackable(...)` creates a separate `buyer_temp` row with `trackable = 1` for optional add-on products.
- `goto_temp_checkout(orderGUID)` redirects to `/checkout/account_screen?guid={orderGUID}`.
- `goto_temp_checkout_renew(orderGUID)` redirects to `/checkout/account_screen_renew?guid={orderGUID}`.

## File-by-File Trace

| File | Menu Offer | Product Source | Filter | Form Action | Product Mark | Next Flow |
|---|---|---|---|---|---|---|
| `cp_purchase_list.asp` | Buy Hosting Account / shared ASP.NET hosting | `getCpProductInfoByCustomerTypeAndLocation(customerType, location)` | Non-trial CP products; optional `?type=P` filters product name containing `-P-`; optional `plantype` selects one product | `cp_purchase_list_action` | `host` | Shared checkout action, then recommended add-on, then checkout |
| `cp_purchase_list_managed_hosting.asp` | Fully-Managed Server Hosting | `getVpsProductInfoByCustomerTypeAndLocation("individual", location)` | Product description contains `Fully-Managed` | `cp_purchase_list_action` | `vps` | Shared checkout action, product usually routes to recommended data/server backup based on product name |
| `cp_purchase_list_vps.asp` | Buy Windows VPS | `getVpsProductInfoByCustomerTypeAndLocation("individual", location)` | Product description contains `VPS` | `cp_purchase_list_action` | `vps` | Shared checkout action, product name contains `V6`, routes to server backup recommendation unless `V69` |
| `cp_purchase_list_vps_linux.asp` | Buy Linux VPS | `getVpsProductInfoByCustomerTypeAndLocation("individual", location)` | Product description contains `Linux` | `cp_purchase_list_action` | `vps` | Shared checkout action, product name contains `V6`, routes to server backup recommendation unless `V69` |
| `cp_purchase_list_cloud.asp` | Buy Cloud Server | `getVpsProductInfoByCustomerTypeAndLocation("individual", location)` | Product description contains `Cloud` | `cp_purchase_list_action` | `vps` | Shared checkout action, typically recommended backup then checkout |
| `cp_purchase_list_dedi.asp` | Buy Dedicated Server | `getVpsProductInfoByCustomerTypeAndLocation("individual", location)` | Product description contains `Xeon` | `cp_purchase_list_action` | `vps` | Shared checkout action; `V69` products avoid server-backup branch and go to site-backup recommendation |
| `cp_purchase_list_reseller.asp` | Buy Reseller Account | `getResellerProductInfoByCustomerTypeAndLocation("reseller", location)` | Non-trial reseller products; if already reseller, redirect `/account/cp_list_resell?listall=1` | `addon_purchase_action.asp` | `host`, `product_cat=reseller` | Add-on purchase action maps `product_cat=reseller` to `constPageType_reseller`, then checkout |
| `cp_purchase_list_resell.asp` | Create New Reseller Sub-Account | Reseller quota/template workflow, not a product list checkout | Uses existing reseller plan/session/quota values | `create_new_cp2_resell.asp` | `New Resell Account` session marker | Multi-step reseller child hosting-account creation, not `buyer_temp` checkout |
| `cp_purchase_list_action.asp` | Shared action | Posted selected product | `action=buy` | N/A | session `product_mark` | Creates `buyer_temp`, optional backup recommendation, checkout |
| `cp_purchase_list_action_paid.asp` | Paid/trial activation action | Posted selected paid product | `action=Activate` | N/A | optional session `product_mark` | Sets purchase session and redirects to `/account/create_new_cp1`; no `buyer_temp` row here |

## Reseller Sub-Account Flow: `cp_purchase_list_resell.asp`

This file is not the same as `cp_purchase_list_reseller.asp`.

Purpose:

- Used inside an existing reseller account to create a new child hosting account.
- Starts by setting fixed session purchase values:
  - `purchase_product_id = 498`
  - `purchase_payment_term = annually`
  - `purchase_currencytype = usd`
  - `purchase_product_name = WR-US`
  - `purchase_payment_amount = 0`
  - `product_mark = New Resell Account`

Page behavior:

1. Load reseller quota and optional quick plan template from `ehbconfig.dbo.reseller_plans`.
2. Form posts to `create_new_cp2_resell.asp`.
3. Required user inputs include:
   - `plannamealias`
   - `terms`
   - `login`
   - `email`
   - `pwd`
   - `pwd2`
   - `sitename`
   - `code_type`
   - `newversion`
   - `dotnetmode`
   - quota fields: `webspace`, `bandwidth`, `sitenum`, `ftpnum`, `mssqlnum`, `mssqlspace`, `mysqlnum`, `mysqlspace`, `emailnum`, `emailspace`, `task`
   - `combine`
   - `setResellerPlan`
4. `create_new_cp2_resell.asp` validates:
   - session purchase state exists
   - username is not already in `customer_profile`
   - CP login does not exist
   - password rules
   - login rules
   - per-account caps: sites <= 100, web/MSSQL/MySQL <= 10000 MB, email <= 20000 MB
   - reseller quota remaining for tasks, bandwidth, and disk usage
5. Special cases:
   - `location=ams` changes product to `WR-EU` or `WR-EU1`.
   - `combine=1` changes product to `WR-US1`, clears DB/email space.
   - `os_type=linux` changes product to `WRLX-US`, sets `remark=linuxshare`.
6. On success, redirect to `create_new_cp3_resell.asp`.
7. `create_new_cp3_resell.asp` confirms details.
8. If `remark=linuxshare`, redirects to `create_new_cp_action_resell_lx`.
9. Otherwise form posts `action=confirm-buy` to `create_new_cp_action_resell`.

## Paid Activation Flow: `cp_purchase_list_action_paid.asp`

Used by trial/paid activation pages, not the normal new order list.

1. Require account login.
2. For `action=Activate`, validate posted fields.
3. Parse `para`.
4. Store selected purchase fields in session.
5. Optionally set `session("product_mark")`.
6. Redirect via `goto_create_new_cp()` to `/account/create_new_cp1`.
7. Does not call `SetupTempOrder`.

## Implementation Notes For New React/ASP.NET Rebuild

- New Order page should not send users directly to `/checkout/checkout_overview` for these hosting purchases. The old flow creates `buyer_temp` then redirects to `/checkout/account_screen?guid={guid}`.
- For all normal hosting/server product rows, rebuild should:
  1. Query the matching product family.
  2. Query prices for each product.
  3. Apply coupon pricing when present.
  4. Post selected product to a new equivalent of `cp_purchase_list_action.asp`.
  5. Insert `buyer_temp` with `pagetype = 1`.
  6. Offer the same recommended backup add-on branch before final checkout.
- `cp_purchase_list_reseller.asp` is a reseller product checkout through `addon_purchase_action.asp`, not through `cp_purchase_list_action.asp`.
- `cp_purchase_list_resell.asp` is a reseller child-account provisioning wizard, not a checkout product selector.
- Do not invent product categories. The old filters are literal description/name checks:
  - Shared hosting: CP product source, customer type based.
  - Managed hosting: description contains `Fully-Managed`.
  - Windows VPS: description contains `VPS`.
  - Linux VPS: description contains `Linux`.
  - Cloud server: description contains `Cloud`.
  - Dedicated server: description contains `Xeon`.
  - Reseller: reseller product source.
