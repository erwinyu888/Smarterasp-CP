# Dashboard, Billing, Affiliate Parity

Latest source checked:

- `/Users/erwinyu/Downloads/hosting/cp8/account/account_screen_main.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/account_renew_list.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/currentproduct.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/commissionview_action.asp`

Implemented updates:

- Dashboard renewal notices now use the broader `client_product` renewal query used by the billing section, instead of only visible hosting accounts from `cp_config`.
- Billing invoice loading keeps ownership checks through `client_product.client_id = @customerId`.
- Affiliate cash payout rules match the old cash path: PayPal email is required, available commission must cover the request, minimum cash payout is `$100`, maximum monthly cash request is `$3000`, and the request inserts a pending `oms.dbo.client_commission_cashout` row.
- Account-credit affiliate withdrawal still uses the legacy OMS `WithdrawCommission` operation, matching the old helper boundary.

Remaining differences:

- Old dashboard include/UI behavior is not pixel or interaction identical; the rebuilt panel summarizes the same data in the Vercel-style layout.
- Old renewal notice has additional presentation-specific behavior, such as multiple-renew button visibility, W60 trial upgrade text, shared-hosting promotion review prompts, and per-product description overrides. The rebuilt dashboard now uses the same broad renewal data source, but those exact UI branches are not all recreated yet.
