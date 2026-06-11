using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

#nullable enable

namespace controlpanel
{
    public class Startup
    {
        private const int ConstPageTypeNewCp = 1;
        private const int ConstPageTypeBuyDomain = 3;
        private const int ConstPageTypeTransferDomain = 4;
        private const int ConstPageTypeCpRenew = 5;
        private const int ConstPageTypeWebQuota = 6;
        private const int ConstPageTypeMssqlDb = 7;
        private const int ConstPageTypeMssqlQuota = 8;
        private const int ConstPageTypeMysqlDb = 9;
        private const int ConstPageTypeMysqlQuota = 10;
        private const int ConstPageTypeIp = 12;
        private const int ConstPageTypeSsl = 13;
        private const int ConstPageTypeEmailQuota = 17;
        private const int ConstPageTypeGeneral = 22;
        private const int ConstPageTypeCustomBackup = 26;
        private const int ConstPageTypeSsrs = 28;
        private const int ConstPageTypeTasks = 29;
        private const int ConstPageTypeSqlJob = 31;
        private const int ConstPageTypeRam = 32;
        private const int ConstPageTypeWebsiteFirewall = 33;
        private const int ConstPageTypeWindowsTask = 34;
        private const int ConstPageTypeFileCountLimit = 36;
        private const int ConstPageTypeVpn = 37;
        private const int ConstPageTypeCloudBackup = 38;
        private const int ConstPageTypeDataBackup = 39;
        private const int ConstPageTypeServerBackup = 40;

        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDistributedMemoryCache();
            services.AddSession(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
                options.IdleTimeout = TimeSpan.FromHours(8);
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseSession();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapPost("/api/auth/login", HandleLoginAsync);
                endpoints.MapGet("/api/auth/me", HandleCurrentUserAsync);
                endpoints.MapPost("/api/auth/logout", HandleLogoutAsync);
                endpoints.MapGet("/api/account/dashboard", HandleAccountDashboardAsync);
                endpoints.MapPost("/api/account/urgent-logs/{logId:int}/hide", HandleHideUrgentLogAsync);
                endpoints.MapGet("/api/account/domains", HandleAccountDomainsAsync);
                endpoints.MapPost("/api/account/domains/search", HandleDomainAvailabilitySearchAsync);
                endpoints.MapPost("/api/account/domains/checkout-preview", HandleDomainCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/domains/checkout", HandleDomainCheckoutAsync);
                endpoints.MapPost("/api/account/domains/{domainId:int}/dns-preview", HandleDomainDnsPreviewAsync);
                endpoints.MapPost("/api/account/domains/{domainId:int}/registrar-action", HandleDomainRegistrarActionAsync);
                endpoints.MapGet("/api/account/billing", HandleAccountBillingAsync);
                endpoints.MapPost("/api/account/billing/deposit", HandleBillingDepositAsync);
                endpoints.MapPost("/api/account/billing/transfer-preview", HandleBillingTransferPreviewAsync);
                endpoints.MapGet("/api/account/billing/orders/{orderId:int}/invoice", HandleBillingInvoiceAsync);
                endpoints.MapGet("/api/account/renewals", HandleAccountRenewalsAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/hide", HandleHideRenewalNoticeAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/renew", HandleRenewalCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/checkout", HandleRenewalCheckoutAsync);
                endpoints.MapGet("/api/account/vpn", HandleAccountVpnAsync);
                endpoints.MapPost("/api/account/vpn/checkout", HandleVpnCheckoutAsync);
                endpoints.MapPost("/api/account/vpn/users", HandleVpnUserCreatePreviewAsync);
                endpoints.MapPost("/api/account/vpn/users/{vpnClientId:int}/action", HandleVpnUserActionAsync);
                endpoints.MapGet("/api/account/addons", HandleAccountAddonsAsync);
                endpoints.MapPost("/api/account/addons/checkout-preview", HandleAddonCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/addons/checkout", HandleAddonCheckoutAsync);
                endpoints.MapGet("/api/account/affiliate", HandleAccountAffiliateAsync);
                endpoints.MapPost("/api/account/affiliate/withdraw-preview", HandleAffiliateWithdrawPreviewAsync);
                endpoints.MapGet("/api/account/new-orders/catalog", HandleNewOrderCatalogAsync);
                endpoints.MapPost("/api/account/new-orders/checkout", HandleNewOrderCheckoutAsync);
                endpoints.MapPost("/api/account/new-orders/domain-transfer/checkout", HandleDomainTransferCheckoutAsync);
                endpoints.MapGet("/api/account/settings", HandleAccountSettingsAsync);
                endpoints.MapPost("/api/account/settings/profile", HandleAccountProfileUpdateAsync);
                endpoints.MapPost("/api/account/settings/password", HandleAccountPasswordChangeAsync);
                endpoints.MapGet("/api/account/checkout-temp/{guid}", HandleCheckoutTempOrderAsync);
                endpoints.MapGet("/api/hosting/sites", HandleHostingSitesAsync);
                endpoints.MapFallbackToFile("index.html");
            });
        }

        private async Task HandleAccountDashboardAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new DashboardResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var customer = await LoadCustomerSummaryAsync(connection, sessionUser.CustomerId);
            var hostingAccounts = await LoadHostingAccountsAsync(connection, sessionUser.CustomerId);
            var statusSummary = await LoadHostingStatusSummaryAsync(connection, sessionUser.CustomerId);
            var urgentLogs = await LoadUrgentLogsAsync(connection, sessionUser.CustomerId);

            var dashboard = new AccountDashboard(
                customer,
                hostingAccounts,
                statusSummary,
                BuildRenewalNotices(hostingAccounts),
                urgentLogs
            );

            await Results.Ok(new DashboardResponse(true, "Dashboard loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHideUrgentLogAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "logId", out var logId))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Invalid urgent log id.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
UPDATE dbo.customer_urgent_log
SET hide = 1
WHERE customer_urgent_log_id = @logId
  AND customer_profile_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@logId", logId);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            var updated = await command.ExecuteNonQueryAsync();

            await Results.Ok(new AccountActionResponse(
                updated > 0,
                updated > 0 ? "Urgent notice hidden." : "Urgent notice was not found for this account."
            )).ExecuteAsync(context);
        }

        private async Task HandleAccountDomainsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountDomainsResponse(false, "Not signed in.", new List<AccountDomainSummary>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var domains = await LoadAccountDomainsAsync(connection, sessionUser.CustomerId);
            await Results.Ok(new AccountDomainsResponse(true, "Domains loaded.", domains)).ExecuteAsync(context);
        }

        private async Task HandleDomainAvailabilitySearchAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new DomainAvailabilityResponse(false, "Not signed in.", new List<DomainAvailabilityResult>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainAvailabilityRequest>();
            var requestedDomains = request?.Domains ?? new List<string>();
            var normalized = new List<string>();
            foreach (var domain in requestedDomains)
            {
                var name = NormalizeDomainName(domain);
                if (!string.IsNullOrWhiteSpace(name) && !normalized.Contains(name))
                {
                    normalized.Add(name);
                }
            }

            if (normalized.Count == 0)
            {
                await Results.BadRequest(new DomainAvailabilityResponse(false, "Enter at least one domain to search.", new List<DomainAvailabilityResult>())).ExecuteAsync(context);
                return;
            }

            if (normalized.Count > 12)
            {
                normalized = normalized.GetRange(0, 12);
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var ownedDomains = await LoadAccountDomainsAsync(connection, sessionUser.CustomerId);
            var owned = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var domain in ownedDomains)
            {
                owned.Add(domain.DomainName);
            }

            using var httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(8)
            };
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Smarterasp-ControlPanel-Rebuild/1.0");

            var openSrs = GetOpenSrsSettings();
            var checks = new List<Task<DomainAvailabilityResult>>();
            foreach (var domainName in normalized)
            {
                checks.Add(owned.Contains(domainName)
                    ? Task.FromResult(new DomainAvailabilityResult(domainName, false, "Already in your account", "account"))
                    : CheckDomainAvailabilityAsync(httpClient, domainName, openSrs));
            }

            var results = new List<DomainAvailabilityResult>(await Task.WhenAll(checks));

            await Results.Ok(new DomainAvailabilityResponse(true, "Domain availability checked.", results)).ExecuteAsync(context);
        }

        private async Task HandleDomainCheckoutPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutPreviewResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainCheckoutRequest>();
            var domains = request?.Domains ?? new List<DomainCheckoutItem>();
            var normalized = new List<DomainCheckoutItem>();
            foreach (var domain in domains)
            {
                var name = NormalizeDomainName(domain.DomainName);
                if (string.IsNullOrWhiteSpace(name))
                {
                    continue;
                }

                normalized.Add(new DomainCheckoutItem(name, Math.Max(0m, domain.Price)));
            }

            if (normalized.Count == 0)
            {
                await Results.BadRequest(new CheckoutPreviewResponse(false, "Add at least one domain to checkout.", null)).ExecuteAsync(context);
                return;
            }

            var total = 0m;
            foreach (var item in normalized)
            {
                total += item.Price;
            }

            var preview = new CheckoutPreview(
                $"DOMAIN-{Guid.NewGuid():N}",
                "Domain checkout preview",
                normalized.Count,
                total,
                "USD",
                "/checkout/domain-preview",
                "Validated cart input. Registrar/order writes are disabled until DomainCheckoutService is rebuilt.",
                normalized
            );

            await Results.Ok(new CheckoutPreviewResponse(true, "Domain checkout preview ready.", preview)).ExecuteAsync(context);
        }

        private async Task HandleDomainCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainCheckoutRequest>();
            var domains = request?.Domains ?? new List<DomainCheckoutItem>();
            var normalized = new List<DomainCheckoutItem>();
            foreach (var domain in domains)
            {
                var name = NormalizeDomainName(domain.DomainName);
                if (!string.IsNullOrWhiteSpace(name))
                {
                    normalized.Add(new DomainCheckoutItem(name, Math.Max(0m, domain.Price)));
                }
            }

            if (normalized.Count == 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Add at least one domain to checkout.", null)).ExecuteAsync(context);
                return;
            }

            var total = 0m;
            foreach (var item in normalized)
            {
                total += item.Price;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            await SyncDomainSessionCartAsync(connection, context.Session.Id, sessionUser.CustomerId, normalized);
            var cartTotal = await LoadDomainSessionCartTotalAsync(connection, sessionUser.CustomerId);
            if (cartTotal > 0m)
            {
                total = cartTotal;
            }

            var domainList = string.Join(",", normalized.ConvertAll(item => item.DomainName));
            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                468,
                "Domain Registration",
                total,
                domainList,
                "USD",
                "",
                "",
                "",
                ConstPageTypeBuyDomain
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                "Domain Registration",
                total,
                "USD",
                ConstPageTypeBuyDomain,
                "Created sitecart.dbo.sessionCart rows and oms.dbo.buyer_temp order using the active /account domain checkout flow."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "Domain checkout order created.", order)).ExecuteAsync(context);
        }

        private async Task HandleDomainRegistrarActionAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "domainId", out var domainId))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Invalid domain id.")).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainRegistrarActionRequest>();
            var action = NormalizeAccountText(request?.Action, 40).ToLowerInvariant();
            var value = NormalizeAccountText(request?.Value, 600);

            var allowedActions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "nameservers",
                "contact",
                "privacy-on",
                "privacy-off",
                "lock",
                "unlock",
                "status",
                "auth-code",
                "auto-renew-on",
                "auto-renew-off",
                "forwarding",
                "dns"
            };

            if (!allowedActions.Contains(action))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Select a valid registrar action.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var domains = await LoadAccountDomainsAsync(connection, sessionUser.CustomerId);
            var domain = domains.Find(item => item.Id == domainId);
            if (domain == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Domain was not found on this account."),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            if (action is "nameservers" or "lock" or "unlock" or "privacy-on" or "privacy-off" or "status" or "auth-code" or "contact" or "auto-renew-on" or "auto-renew-off" or "forwarding")
            {
                var openSrs = GetOpenSrsSettings();
                if (!openSrs.IsConfigured)
                {
                    await Results.Problem("Missing OpenSRS API settings.").ExecuteAsync(context);
                    return;
                }

                var credential = await LoadDomainCredentialAsync(connection, sessionUser.CustomerId, domain.RegisterInfoId);
                if (credential == null)
                {
                    await Results.BadRequest(new AccountActionResponse(false, "Domain manager profile credentials were not found for this domain.")).ExecuteAsync(context);
                    return;
                }

                using var httpClient = new HttpClient
                {
                    Timeout = TimeSpan.FromSeconds(15)
                };
                httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Smarterasp-ControlPanel-Rebuild/1.0");

                var remoteIp = context.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                var result = action switch
                {
                    "nameservers" => await UpdateDomainNameserversWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, value, remoteIp),
                    "privacy-on" => await UpdateDomainWhoisPrivacyWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, true, remoteIp),
                    "privacy-off" => await UpdateDomainWhoisPrivacyWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, false, remoteIp),
                    "status" => await GetDomainStatusWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, remoteIp),
                    "auth-code" => await GetDomainAuthCodeWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, remoteIp),
                    "contact" => await UpdateDomainContactWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, value, remoteIp),
                    "auto-renew-on" => await UpdateDomainExpireActionWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, true, remoteIp),
                    "auto-renew-off" => await UpdateDomainExpireActionWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, false, remoteIp),
                    "forwarding" => await UpdateDomainForwardingWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, value, remoteIp),
                    _ => await UpdateDomainLockWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, action == "lock", remoteIp)
                };

                await Results.Json(new AccountActionResponse(result.Success, result.Message), statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
                return;
            }

            var actionLabel = action switch
            {
                "dns" => "DNS update",
                _ => "registrar action"
            };

            var detail = string.IsNullOrWhiteSpace(value) ? "" : $" Request detail: {value}";
            await Results.Ok(new AccountActionResponse(
                true,
                $"{actionLabel} is ready for {domain.DomainName}. This action will be wired in the next registrar pass.{detail}"
            )).ExecuteAsync(context);
        }

        private async Task HandleDomainDnsPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new DomainDnsPreviewResponse(false, "Not signed in.", new List<DomainDnsRecordPreview>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "domainId", out var domainId))
            {
                await Results.BadRequest(new DomainDnsPreviewResponse(false, "Invalid domain id.", new List<DomainDnsRecordPreview>())).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainDnsPreviewRequest>();
            var recordsText = request?.Records ?? "";

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var domains = await LoadAccountDomainsAsync(connection, sessionUser.CustomerId);
            var domain = domains.Find(item => item.Id == domainId);
            if (domain == null)
            {
                await Results.Json(
                    new DomainDnsPreviewResponse(false, "Domain was not found on this account.", new List<DomainDnsRecordPreview>()),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var parseResult = ParseDnsRecords(recordsText, domain.DomainName);
            if (!parseResult.Success)
            {
                await Results.BadRequest(new DomainDnsPreviewResponse(false, parseResult.Message, parseResult.Records)).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new DomainDnsPreviewResponse(
                true,
                $"DNS records for {domain.DomainName} are valid. Live OpenSRS DNS publishing is staged until Storefront DNS API credentials are configured.",
                parseResult.Records
            )).ExecuteAsync(context);
        }

        private async Task HandleAccountBillingAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountBillingResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var activeProducts = await LoadActiveProductsAsync(connection, sessionUser.CustomerId);
            var purchases = await LoadRecentPurchasesAsync(connection, sessionUser.CustomerId);
            var renewalNotices = await LoadProductRenewalsAsync(connection, sessionUser.CustomerId, 30);
            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);

            var billing = new AccountBillingDashboard(
                new AccountBalanceSummary(balance, "USD", "OMS credit ledger"),
                activeProducts,
                purchases,
                renewalNotices
            );

            await Results.Ok(new AccountBillingResponse(true, "Billing loaded.", billing)).ExecuteAsync(context);
        }

        private async Task HandleBillingInvoiceAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new BillingInvoiceResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "orderId", out var orderId))
            {
                await Results.BadRequest(new BillingInvoiceResponse(false, "Missing order.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var invoice = await LoadBillingInvoiceAsync(connection, sessionUser.CustomerId, orderId);
            if (invoice == null)
            {
                await Results.Json(
                    new BillingInvoiceResponse(false, "Invoice was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new BillingInvoiceResponse(true, "Invoice loaded.", invoice)).ExecuteAsync(context);
        }

        private async Task HandleBillingDepositAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<BillingDepositRequest>();
            var amount = Math.Round(Math.Max(0m, request?.Amount ?? 0m), 2);
            if (amount < 1m)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Deposit amount must be at least $1.00.", null)).ExecuteAsync(context);
                return;
            }

            var checkoutUrl = $"/checkout/deposit_v2?amount={Uri.EscapeDataString(amount.ToString("0.00", CultureInfo.InvariantCulture))}";
            var order = new CheckoutOrder(
                $"DEPOSIT-{Guid.NewGuid():N}",
                checkoutUrl,
                "Account Balance Deposit",
                amount,
                "USD",
                ConstPageTypeGeneral,
                "Prepared a deposit checkout handoff using the active /checkout/deposit_v2 flow. No credit is added until checkout payment succeeds."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "Deposit checkout ready.", order)).ExecuteAsync(context);
        }

        private async Task HandleBillingTransferPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new BillingTransferPreviewResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<BillingTransferRequest>();
            var targetLogin = request?.TargetLogin?.Trim() ?? "";
            var amount = Math.Round(Math.Max(0m, request?.Amount ?? 0m), 2);
            if (string.IsNullOrWhiteSpace(targetLogin) || amount < 1m)
            {
                await Results.BadRequest(new BillingTransferPreviewResponse(false, "Enter a target account and at least $1.00.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);
            var targetCustomerId = await LoadCustomerIdByLoginAsync(connection, targetLogin);
            var eligible = targetCustomerId != null
                && targetCustomerId != sessionUser.CustomerId
                && amount <= balance;

            var message = eligible
                ? "Transfer preview ready. This rebuild validates the target and balance before the legacy transfer write is reconnected."
                : targetCustomerId == null
                    ? "Target account was not found."
                    : targetCustomerId == sessionUser.CustomerId
                        ? "You cannot transfer credit to the same account."
                        : "Not enough account balance for this transfer.";

            var preview = new BillingTransferPreview(
                targetLogin,
                targetCustomerId,
                amount,
                balance,
                eligible,
                message
            );

            await Results.Ok(new BillingTransferPreviewResponse(true, "Transfer checked.", preview)).ExecuteAsync(context);
        }

        private async Task HandleAccountRenewalsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountRenewalsResponse(false, "Not signed in.", new List<AccountProductSummary>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var renewals = await LoadProductRenewalsAsync(connection, sessionUser.CustomerId, 30);
            await Results.Ok(new AccountRenewalsResponse(true, "Renewals loaded.", renewals)).ExecuteAsync(context);
        }

        private async Task HandleHideRenewalNoticeAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "clientProductId", out var clientProductId))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Missing renewal item.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var ownsProduct = await CustomerOwnsClientProductAsync(connection, sessionUser.CustomerId, clientProductId);
            if (!ownsProduct)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Renewal item was not found for this account."),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            const string sql = @"
UPDATE oms.dbo.client_product
SET noshowrenew = 1
WHERE client_product_id = @clientProductId
  AND client_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@clientProductId", clientProductId);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            await Results.Ok(new AccountActionResponse(true, "Renewal notice hidden.")).ExecuteAsync(context);
        }

        private async Task HandleRenewalCheckoutPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new RenewalCheckoutResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "clientProductId", out var clientProductId))
            {
                await Results.BadRequest(new RenewalCheckoutResponse(false, "Missing renewal item.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var renewal = await LoadRenewalCheckoutPreviewAsync(connection, sessionUser.CustomerId, clientProductId);
            if (renewal == null)
            {
                await Results.Json(
                    new RenewalCheckoutResponse(false, "Renewal item was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new RenewalCheckoutResponse(true, "Renewal checkout preview ready.", renewal)).ExecuteAsync(context);
        }

        private async Task HandleRenewalCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "clientProductId", out var clientProductId))
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Missing renewal item.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var renewal = await LoadRenewalCheckoutPreviewAsync(connection, sessionUser.CustomerId, clientProductId);
            if (renewal == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Renewal item was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                renewal.ProductId,
                renewal.Name,
                renewal.Amount,
                renewal.PaymentTerm,
                renewal.Currency,
                renewal.ClientProductId.ToString(CultureInfo.InvariantCulture),
                "",
                "",
                ConstPageTypeCpRenew
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                renewal.Name,
                renewal.Amount,
                renewal.Currency,
                ConstPageTypeCpRenew,
                "Created oms.dbo.buyer_temp renewal order using the legacy cp_renew_1.asp parameter layout."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "Renewal checkout order created.", order)).ExecuteAsync(context);
        }

        private async Task HandleAccountVpnAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountVpnResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var services = await LoadVpnServicesAsync(connection, sessionUser.CustomerId);
            var quota = await LoadVpnQuotaAsync(connection, sessionUser.CustomerId);
            var catalog = await LoadVpnCatalogAsync(connection, sessionUser.CustomerType);
            var dashboard = new AccountVpnDashboard(services.Count, quota, services, catalog);

            await Results.Ok(new AccountVpnResponse(true, "VPN services loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleVpnCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<VpnCheckoutRequest>();
            if (request == null || request.ProductId <= 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Select a VPN product.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadVpnCatalogAsync(connection, sessionUser.CustomerType);
            var product = catalog.Find(item => item.ProductId == request.ProductId);
            if (product == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Selected VPN product is not available.", null)).ExecuteAsync(context);
                return;
            }

            var selectedPrice = product.Prices.Find(price => price.PriceId == request.PriceId);
            if (selectedPrice == null && product.Prices.Count > 0)
            {
                selectedPrice = product.Prices[0];
            }

            if (selectedPrice == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                return;
            }

            var quantity = Math.Clamp(request.Quantity, 1, 99);
            var amount = selectedPrice.Amount * quantity;
            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                product.ProductId,
                product.Name,
                amount,
                selectedPrice.PaymentTerm,
                selectedPrice.Currency,
                quantity.ToString(CultureInfo.InvariantCulture),
                "",
                selectedPrice.PriceId.ToString(CultureInfo.InvariantCulture),
                ConstPageTypeVpn
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                product.Name,
                amount,
                selectedPrice.Currency,
                ConstPageTypeVpn,
                "Created oms.dbo.buyer_temp VPN order using the add-on VPN checkout page type."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "VPN checkout order created.", order)).ExecuteAsync(context);
        }

        private async Task HandleVpnUserCreatePreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<VpnUserCreateRequest>();
            var user = NormalizeAccountText(request?.User, 80);
            var password = request?.Password ?? "";
            var type = NormalizeAccountText(request?.Type, 40);
            var area = NormalizeAccountText(request?.Area, 80);

            if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(password))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Enter a VPN username and password.")).ExecuteAsync(context);
                return;
            }

            if (password.Length < 8)
            {
                await Results.BadRequest(new AccountActionResponse(false, "VPN password must be at least 8 characters.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var used = (await LoadVpnServicesAsync(connection, sessionUser.CustomerId)).Count;
            var quota = await LoadVpnQuotaAsync(connection, sessionUser.CustomerId);
            if (quota > 0 && used >= quota)
            {
                await Results.BadRequest(new AccountActionResponse(false, "VPN quota is full. Buy another VPN service before creating a new user.")).ExecuteAsync(context);
                return;
            }

            var location = string.IsNullOrWhiteSpace(area) ? "automatic location" : area;
            var vpnType = string.IsNullOrWhiteSpace(type) ? "IKEv2" : type;
            await Results.Ok(new AccountActionResponse(
                true,
                $"{user} passed account and quota checks for {vpnType} in {location}. Live VPN host provisioning is queued for the control-plane worker step."
            )).ExecuteAsync(context);
        }

        private async Task HandleVpnUserActionAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "vpnClientId", out var vpnClientId))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Invalid VPN user id.")).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<VpnUserActionRequest>();
            var action = NormalizeAccountText(request?.Action, 40).ToLowerInvariant();
            var allowedActions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "openvpn",
                "download-config",
                "reset-password",
                "delete"
            };

            if (!allowedActions.Contains(action))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Select a valid VPN action.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var services = await LoadVpnServicesAsync(connection, sessionUser.CustomerId);
            var service = services.Find(item => item.VpnClientId == vpnClientId);
            if (service == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "VPN user was not found on this account."),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var actionLabel = action switch
            {
                "openvpn" => "OpenVPN conversion",
                "download-config" => "configuration download",
                "reset-password" => "password reset",
                "delete" => "VPN user deletion",
                _ => "VPN action"
            };

            await Results.Ok(new AccountActionResponse(
                true,
                $"{actionLabel} is ready for {service.User}. Live VPN host changes are intentionally held for the worker/provisioning step."
            )).ExecuteAsync(context);
        }

        private async Task HandleAccountAddonsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountAddonsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadAddonCatalogAsync(connection, sessionUser.CustomerType);
            var activeAddons = await LoadActiveAddonsAsync(connection, sessionUser.CustomerId);
            var dashboard = new AccountAddonsDashboard(catalog, activeAddons);

            await Results.Ok(new AccountAddonsResponse(true, "Add-ons loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleAddonCheckoutPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutPreviewResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AddonCheckoutRequest>();
            var items = request?.Items ?? new List<AddonCheckoutItem>();
            if (items.Count == 0)
            {
                await Results.BadRequest(new CheckoutPreviewResponse(false, "Add at least one add-on to checkout.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadAddonCatalogAsync(connection, sessionUser.CustomerType);
            var catalogByProduct = new Dictionary<int, AddonCatalogProduct>();
            foreach (var product in catalog)
            {
                catalogByProduct[product.ProductId] = product;
            }

            var validated = new List<CheckoutLineItem>();
            foreach (var item in items)
            {
                if (!catalogByProduct.TryGetValue(item.ProductId, out var product))
                {
                    await Results.BadRequest(new CheckoutPreviewResponse(false, $"Add-on {item.ProductId} is not available.", null)).ExecuteAsync(context);
                    return;
                }

                var selectedPrice = product.Prices.Find(price => price.PriceId == item.PriceId);
                if (selectedPrice == null && product.Prices.Count > 0)
                {
                    selectedPrice = product.Prices[0];
                }
                if (selectedPrice == null)
                {
                    await Results.BadRequest(new CheckoutPreviewResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                    return;
                }

                var quantity = Math.Clamp(item.Quantity, 1, 99);
                validated.Add(new CheckoutLineItem(
                    product.ProductId,
                    product.Name,
                    FormatPaymentTerm(selectedPrice.PaymentTerm),
                    quantity,
                    selectedPrice.Amount,
                    selectedPrice.Currency
                ));
            }

            var total = 0m;
            foreach (var item in validated)
            {
                total += item.UnitAmount * item.Quantity;
            }

            var preview = new CheckoutPreview(
                $"ADDON-{Guid.NewGuid():N}",
                "Add-on checkout preview",
                validated.Count,
                total,
                "USD",
                "/checkout/addon-preview",
                "Validated catalog prices. Order/provisioning writes are disabled until AddonOrderService is rebuilt.",
                validated
            );

            await Results.Ok(new CheckoutPreviewResponse(true, "Add-on checkout preview ready.", preview)).ExecuteAsync(context);
        }

        private async Task HandleAddonCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AddonCheckoutRequest>();
            var items = request?.Items ?? new List<AddonCheckoutItem>();
            if (items.Count == 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Add at least one add-on to checkout.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadAddonCatalogAsync(connection, sessionUser.CustomerType);
            var catalogByProduct = new Dictionary<int, AddonCatalogProduct>();
            foreach (var product in catalog)
            {
                catalogByProduct[product.ProductId] = product;
            }

            var orders = new List<CheckoutOrder>();
            foreach (var item in items)
            {
                if (!catalogByProduct.TryGetValue(item.ProductId, out var product))
                {
                    await Results.BadRequest(new CheckoutCreateResponse(false, $"Add-on {item.ProductId} is not available.", null)).ExecuteAsync(context);
                    return;
                }

                var selectedPrice = product.Prices.Find(price => price.PriceId == item.PriceId);
                if (selectedPrice == null && product.Prices.Count > 0)
                {
                    selectedPrice = product.Prices[0];
                }
                if (selectedPrice == null)
                {
                    await Results.BadRequest(new CheckoutCreateResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                    return;
                }

                var quantity = Math.Clamp(item.Quantity, 1, 99);
                var amount = selectedPrice.Amount * quantity;
                var pageType = DetermineAddonPageType(product.Name);
                var guid = await CreateBuyerTempOrderAsync(
                    connection,
                    sessionUser.CustomerId,
                    product.ProductId,
                    product.Name,
                    amount,
                    selectedPrice.PaymentTerm,
                    selectedPrice.Currency,
                    quantity.ToString(CultureInfo.InvariantCulture),
                    "",
                    selectedPrice.PriceId.ToString(CultureInfo.InvariantCulture),
                    pageType
                );

                orders.Add(new CheckoutOrder(
                    guid,
                    BuildLegacyCheckoutUrl(guid),
                    product.Name,
                    amount,
                    selectedPrice.Currency,
                    pageType,
                    "Created oms.dbo.buyer_temp add-on order using the legacy temp checkout layout."
                ));
            }

            await Results.Ok(new CheckoutCreateResponse(true, $"Created {orders.Count} add-on checkout order{(orders.Count == 1 ? "" : "s")}.", orders[0] with { Note = orders.Count == 1 ? orders[0].Note : $"Created {orders.Count} separate legacy temp checkout orders. Open the first checkout URL to continue." })).ExecuteAsync(context);
        }

        private async Task HandleAccountAffiliateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountAffiliateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var referrals = await LoadAffiliateReferralsAsync(connection, sessionUser.CustomerId);
            var commissions = await LoadAffiliateCommissionsAsync(connection, sessionUser.CustomerId);
            var payouts = await LoadAffiliatePayoutsAsync(connection, sessionUser.CustomerId);
            var summary = BuildAffiliateSummary(referrals, commissions, payouts);
            var dashboard = new AccountAffiliateDashboard(summary, referrals, commissions, payouts);

            await Results.Ok(new AccountAffiliateResponse(true, "Affiliate data loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleAffiliateWithdrawPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AffiliateWithdrawResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AffiliateWithdrawRequest>();
            var amount = Math.Max(0m, request?.Amount ?? 0m);
            var method = request?.Method?.Trim() ?? "account-credit";

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var referrals = await LoadAffiliateReferralsAsync(connection, sessionUser.CustomerId);
            var commissions = await LoadAffiliateCommissionsAsync(connection, sessionUser.CustomerId);
            var payouts = await LoadAffiliatePayoutsAsync(connection, sessionUser.CustomerId);
            var summary = BuildAffiliateSummary(referrals, commissions, payouts);

            var paidReferralsThisYear = 0;
            var thisYear = DateOnly.FromDateTime(DateTime.UtcNow).Year;
            foreach (var referral in referrals)
            {
                if (referral.IsPaid && referral.AccountStartDate?.Year == thisYear)
                {
                    paidReferralsThisYear++;
                }
            }

            var minimum = method.Equals("paypal", StringComparison.OrdinalIgnoreCase) ? 100m : 1m;
            var eligible = amount >= minimum && amount <= summary.AvailableCommission && paidReferralsThisYear >= 3;
            var message = eligible
                ? "Withdraw preview ready. Legacy cashout write is disabled until CommissionPayoutService is rebuilt."
                : "Withdraw is not eligible yet. Legacy rules require enough available commission, the method minimum, and at least 3 paid referrals this year.";

            var preview = new AffiliateWithdrawPreview(
                amount,
                method,
                summary.AvailableCommission,
                paidReferralsThisYear,
                minimum,
                eligible,
                message
            );

            await Results.Ok(new AffiliateWithdrawResponse(true, "Affiliate withdraw checked.", preview)).ExecuteAsync(context);
        }

        private async Task HandleNewOrderCatalogAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new NewOrderCatalogResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var type = NormalizeNewOrderType(context.Request.Query["type"].ToString());
            if (string.IsNullOrWhiteSpace(type) || !IsCatalogNewOrderType(type))
            {
                await Results.BadRequest(new NewOrderCatalogResponse(false, "Select a valid new order type.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadNewOrderCatalogAsync(connection, sessionUser.CustomerType, type);
            var response = new NewOrderCatalog(
                type,
                NewOrderTitle(type),
                NewOrderLegacyPath(type),
                NewOrderDescription(type),
                catalog
            );

            await Results.Ok(new NewOrderCatalogResponse(true, "New order catalog loaded.", response)).ExecuteAsync(context);
        }

        private async Task HandleNewOrderCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<NewOrderCheckoutRequest>();
            var type = NormalizeNewOrderType(request?.Type ?? "");
            if (request == null || string.IsNullOrWhiteSpace(type) || !IsCatalogNewOrderType(type) || request.ProductId <= 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Select a valid product to order.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadNewOrderCatalogAsync(connection, sessionUser.CustomerType, type);
            var product = catalog.Find(item => item.ProductId == request.ProductId);
            if (product == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Selected product is not available in this order catalog.", null)).ExecuteAsync(context);
                return;
            }

            var selectedPrice = product.Prices.Find(price => price.PriceId == request.PriceId);
            if (selectedPrice == null && product.Prices.Count > 0)
            {
                selectedPrice = product.Prices[0];
            }

            if (selectedPrice == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                return;
            }

            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                product.ProductId,
                product.Name,
                selectedPrice.Amount,
                selectedPrice.PaymentTerm,
                selectedPrice.Currency,
                "",
                "",
                selectedPrice.PriceId.ToString(CultureInfo.InvariantCulture),
                ConstPageTypeNewCp
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                product.Name,
                selectedPrice.Amount,
                selectedPrice.Currency,
                ConstPageTypeNewCp,
                $"Created oms.dbo.buyer_temp new-order checkout from {NewOrderLegacyPath(type)}."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "New order checkout created.", order)).ExecuteAsync(context);
        }

        private async Task HandleDomainTransferCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainTransferCheckoutRequest>();
            var domainName = NormalizeDomainName(request?.DomainName ?? "");
            if (string.IsNullOrWhiteSpace(domainName) || !domainName.Contains('.', StringComparison.Ordinal))
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Enter a valid domain name to transfer.", null)).ExecuteAsync(context);
                return;
            }

            var tld = DomainTld(domainName);
            if (string.IsNullOrWhiteSpace(tld))
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Unable to read the domain extension.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var quote = await LoadDomainTransferQuoteAsync(connection, tld);
            if (quote == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, $"No transfer price was found for .{tld}.", null)).ExecuteAsync(context);
                return;
            }

            var amount = quote.Amount + (request?.WhoisPrivacy == true ? 8m : 0m);
            var productName = request?.WhoisPrivacy == true ? "Domain Transfer + Whois Privacy" : "Domain Transfer";
            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                468,
                productName,
                amount,
                quote.PaymentTerm,
                quote.Currency,
                domainName,
                request?.WhoisPrivacy == true ? "WhoisPrivacy" : "",
                tld,
                ConstPageTypeTransferDomain
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                $"{productName} - {domainName}",
                amount,
                quote.Currency,
                ConstPageTypeTransferDomain,
                "Created oms.dbo.buyer_temp domain transfer order. Modern registrar transfer eligibility check still needs to be rebuilt before payment processing is enabled."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "Domain transfer checkout created.", order)).ExecuteAsync(context);
        }

        private async Task HandleAccountSettingsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountSettingsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var settings = await LoadAccountSettingsAsync(connection, sessionUser.CustomerId);
            await Results.Ok(new AccountSettingsResponse(true, "Account settings loaded.", settings)).ExecuteAsync(context);
        }

        private async Task HandleAccountProfileUpdateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountSettingsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AccountProfileUpdateRequest>();
            var name = NormalizeAccountText(request?.Name, 120);
            var companyName = NormalizeAccountText(request?.CompanyName, 120);
            var mobileNumber = NormalizeAccountText(request?.MobileNumber, 40);
            var browserLanguage = NormalizeAccountText(request?.BrowserLanguage, 120);
            var vat = NormalizeAccountText(request?.Vat, 60);

            if (string.IsNullOrWhiteSpace(name))
            {
                await Results.BadRequest(new AccountSettingsResponse(false, "Name is required.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
UPDATE dbo.customer_profile
SET name_en = @name,
    company_name_en = @companyName,
    mobile_number = @mobileNumber,
    browserlang = @browserLanguage,
    vat = @vat
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@name", string.IsNullOrWhiteSpace(name) ? "NA" : name);
            command.Parameters.AddWithValue("@companyName", string.IsNullOrWhiteSpace(companyName) ? "NA" : companyName);
            command.Parameters.AddWithValue("@mobileNumber", string.IsNullOrWhiteSpace(mobileNumber) ? "NA" : mobileNumber);
            command.Parameters.AddWithValue("@browserLanguage", string.IsNullOrWhiteSpace(browserLanguage) ? "NA" : browserLanguage);
            command.Parameters.AddWithValue("@vat", string.IsNullOrWhiteSpace(vat) ? "NA" : vat);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            var settings = await LoadAccountSettingsAsync(connection, sessionUser.CustomerId);
            await Results.Ok(new AccountSettingsResponse(true, "Profile updated.", settings)).ExecuteAsync(context);
        }

        private async Task HandleAccountPasswordChangeAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AccountPasswordChangeRequest>();
            var currentPassword = request?.CurrentPassword ?? "";
            var newPassword = request?.NewPassword ?? "";
            var confirmPassword = request?.ConfirmPassword ?? "";

            if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Enter current password and new password.")).ExecuteAsync(context);
                return;
            }

            if (newPassword != confirmPassword)
            {
                await Results.BadRequest(new AccountActionResponse(false, "New password and confirmation do not match.")).ExecuteAsync(context);
                return;
            }

            if (!IsPasswordComplexEnough(newPassword))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Password must be at least 8 characters and include a letter and a number.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var storedHash = await LoadCustomerPasswordHashAsync(connection, sessionUser.CustomerId);
            if (!PasswordMatches(currentPassword, storedHash))
            {
                await Results.Json(
                    new AccountActionResponse(false, "Current password is not correct."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (PasswordMatches(newPassword, storedHash))
            {
                await Results.BadRequest(new AccountActionResponse(false, "New password cannot be the same as current password.")).ExecuteAsync(context);
                return;
            }

            const string sql = @"
UPDATE dbo.customer_profile
SET pp1 = @passwordHash,
    securityversion = 5,
    customerPassHash = '5',
    reVerify = 1
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@passwordHash", HashHex(SHA256.HashData(Encoding.UTF8.GetBytes(newPassword))));
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            context.Session.SetString("customerID", sessionUser.CustomerId.ToString(CultureInfo.InvariantCulture));
            context.Session.SetString("customerLogin", sessionUser.Login);
            context.Session.SetString("customerType", sessionUser.CustomerType);

            await Results.Ok(new AccountActionResponse(true, "Account password updated. CP, FTP, and IIS password sync will be handled in the hosting control panel workflow.")).ExecuteAsync(context);
        }

        private async Task HandleHostingSitesAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingSitesResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var sites = await LoadHostingSitesAsync(connection, sessionUser.CustomerId);
            await Results.Ok(new HostingSitesResponse(true, "Hosting sites loaded.", sites)).ExecuteAsync(context);
        }

        private static async Task HandleCurrentUserAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new LoginResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new LoginResponse(true, "Signed in.", sessionUser)).ExecuteAsync(context);
        }

        private static async Task HandleLogoutAsync(HttpContext context)
        {
            context.Session.Clear();
            await Results.Ok(new { success = true, message = "Logged out." }).ExecuteAsync(context);
        }

        private async Task HandleCheckoutTempOrderAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var guid = context.Request.RouteValues["guid"]?.ToString() ?? "";
            if (string.IsNullOrWhiteSpace(guid))
            {
                await Results.BadRequest(new CheckoutTempOrderResponse(false, "Missing checkout GUID.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
SELECT TOP 1 id, customer_id, product_id, product_name, amount, info1, info2, info3, info4, info5, pagetype, adddate, ispaid, processed, trackable
FROM oms.dbo.buyer_temp
WHERE id = @id
  AND customer_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Checkout temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var order = new CheckoutTempOrder(
                reader.GetString(0),
                Convert.ToInt64(reader.GetDecimal(1), CultureInfo.InvariantCulture),
                Convert.ToInt32(reader.GetDecimal(2), CultureInfo.InvariantCulture),
                reader.GetString(3),
                reader.GetDecimal(4),
                reader.IsDBNull(5) ? "" : reader.GetString(5),
                reader.IsDBNull(6) ? "" : reader.GetString(6),
                reader.IsDBNull(7) ? "" : reader.GetString(7),
                reader.IsDBNull(8) ? "" : reader.GetString(8),
                reader.IsDBNull(9) ? "" : reader.GetString(9),
                Convert.ToInt32(reader.GetDecimal(10), CultureInfo.InvariantCulture),
                reader.GetDateTime(11),
                !reader.IsDBNull(12) && reader.GetBoolean(12),
                !reader.IsDBNull(13) && reader.GetBoolean(13),
                !reader.IsDBNull(14) && reader.GetBoolean(14)
            );

            await Results.Ok(new CheckoutTempOrderResponse(true, "Checkout temp order loaded.", order)).ExecuteAsync(context);
        }

        private async Task HandleLoginAsync(HttpContext context)
        {
            var loginRequest = await context.Request.ReadFromJsonAsync<LoginRequest>();
            var login = loginRequest?.Login?.Trim() ?? "";
            var password = loginRequest?.Password ?? "";

            if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password))
            {
                await Results.BadRequest(new LoginResponse(false, "Enter your username and password.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
SELECT TOP 1 customerID, customerLogin, customer_type, status, pp1
FROM dbo.customer_profile
WHERE LOWER(customerLogin) = LOWER(@login)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@login", login);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                await Results.Json(
                    new LoginResponse(false, "Login failed. Please check your username and password.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var customerId = reader.GetInt64(0);
            var customerLogin = reader.GetString(1);
            var customerType = reader.GetString(2);
            var status = reader.IsDBNull(3) ? -1 : reader.GetInt32(3);
            var storedHash = reader.IsDBNull(4) ? "" : reader.GetString(4).Trim();

            if (!PasswordMatches(password, storedHash))
            {
                await Results.Json(
                    new LoginResponse(false, "Login failed. Please check your username and password.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (status != 1)
            {
                var message = status switch
                {
                    0 => "This account is pending activation.",
                    2 => "This account is suspended.",
                    3 => "This account is canceled.",
                    _ => "This account is not active."
                };
                await Results.Json(new LoginResponse(false, message, null), statusCode: StatusCodes.Status403Forbidden).ExecuteAsync(context);
                return;
            }

            context.Session.SetString("customerID", customerId.ToString());
            context.Session.SetString("customerLogin", customerLogin);
            context.Session.SetString("customerType", customerType);

            await Results.Ok(new LoginResponse(true, "Login successful.", new LoginUser(customerId, customerLogin, customerType))).ExecuteAsync(context);
        }

        private static bool PasswordMatches(string password, string storedHash)
        {
            if (string.IsNullOrWhiteSpace(storedHash))
            {
                return false;
            }

            var candidates = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                HashHex(SHA512.HashData(Encoding.UTF8.GetBytes(password))),
                HashHex(SHA256.HashData(Encoding.UTF8.GetBytes(password)))
            };

            return candidates.Contains(storedHash.Trim());
        }

        private static bool IsPasswordComplexEnough(string password)
        {
            if (password.Length < 8)
            {
                return false;
            }

            var hasLetter = false;
            var hasNumber = false;
            foreach (var character in password)
            {
                hasLetter = hasLetter || char.IsLetter(character);
                hasNumber = hasNumber || char.IsDigit(character);
            }

            return hasLetter && hasNumber;
        }

        private static string NormalizeAccountText(string? value, int maxLength)
        {
            var normalized = (value ?? "").Trim();
            return normalized.Length <= maxLength ? normalized : normalized[..maxLength];
        }

        private static string HashHex(byte[] bytes) => Convert.ToHexString(bytes).ToLowerInvariant();

        private string GetEhbConfigConnectionString() =>
            _configuration.GetConnectionString("EhbConfig")
            ?? Environment.GetEnvironmentVariable("EHB_CONFIG_CONNECTION_STRING")
            ?? "";

        private OpenSrsSettings GetOpenSrsSettings()
        {
            var apiUrl = _configuration["OpenSrs:ApiUrl"] ?? Environment.GetEnvironmentVariable("OPENSRS_API_URL") ?? "";
            var username = _configuration["OpenSrs:Username"] ?? Environment.GetEnvironmentVariable("OPENSRS_USERNAME") ?? "";
            var privateKey = _configuration["OpenSrs:PrivateKey"] ?? Environment.GetEnvironmentVariable("OPENSRS_PRIVATE_KEY") ?? "";
            return new OpenSrsSettings(apiUrl.Trim(), username.Trim(), privateKey.Trim());
        }

        private static LoginUser? GetSessionUser(HttpContext context)
        {
            var customerIdText = context.Session.GetString("customerID");
            var customerLogin = context.Session.GetString("customerLogin");
            var customerType = context.Session.GetString("customerType");

            if (!long.TryParse(customerIdText, out var customerId) || string.IsNullOrWhiteSpace(customerLogin) || string.IsNullOrWhiteSpace(customerType))
            {
                return null;
            }

            return new LoginUser(customerId, customerLogin, customerType);
        }

        private static bool TryReadRouteInt(HttpContext context, string name, out int value)
        {
            var raw = context.Request.RouteValues[name]?.ToString();
            return int.TryParse(raw, out value);
        }

        private static async Task<string> CreateBuyerTempOrderAsync(
            SqlConnection connection,
            long customerId,
            int productId,
            string productName,
            decimal amount,
            string info1,
            string info2,
            string info3,
            string info4,
            string info5,
            int pageType,
            bool trackable = false)
        {
            var guid = Guid.NewGuid().ToString("B").ToUpperInvariant();

            const string sql = @"
INSERT INTO oms.dbo.buyer_temp
    (trackable, amount, id, customer_id, product_id, product_name, info1, info2, info3, info4, info5, adddate, pagetype)
VALUES
    (@trackable, @amount, @id, @customerId, @productId, @productName, @info1, @info2, @info3, @info4, @info5, GETDATE(), @pageType)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@trackable", trackable);
            command.Parameters.AddWithValue("@amount", amount);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@productId", productId);
            command.Parameters.AddWithValue("@productName", Truncate(productName, 150));
            command.Parameters.AddWithValue("@info1", Truncate(info1, 150));
            command.Parameters.AddWithValue("@info2", Truncate(info2, 150));
            command.Parameters.AddWithValue("@info3", Truncate(info3, 150));
            command.Parameters.AddWithValue("@info4", Truncate(info4, 150));
            command.Parameters.AddWithValue("@info5", Truncate(info5, 150));
            command.Parameters.AddWithValue("@pageType", pageType);

            await command.ExecuteNonQueryAsync();
            return guid;
        }

        private static async Task SyncDomainSessionCartAsync(SqlConnection connection, string sessionId, long customerId, List<DomainCheckoutItem> domains)
        {
            await using (var deleteCommand = new SqlCommand(@"
DELETE FROM sitecart.dbo.sessionCart
WHERE accountid = @accountId
  AND Type IN ('domain', 'WhoisPrivate')", connection))
            {
                deleteCommand.Parameters.AddWithValue("@accountId", customerId.ToString(CultureInfo.InvariantCulture));
                await deleteCommand.ExecuteNonQueryAsync();
            }

            foreach (var domain in domains)
            {
                await using var insertCommand = new SqlCommand(@"
INSERT INTO sitecart.dbo.sessionCart
    (isUniqueDesc, enableBuyYear, sessionID, addDate, Description, price, Type, accountid, buyyear)
VALUES
    (0, @enableBuyYear, @sessionId, GETDATE(), @description, @price, @type, @accountId, @buyYear)", connection);
                insertCommand.Parameters.AddWithValue("@enableBuyYear", true);
                insertCommand.Parameters.AddWithValue("@sessionId", Truncate(sessionId, 250));
                insertCommand.Parameters.AddWithValue("@description", Truncate(domain.DomainName, 250));
                insertCommand.Parameters.AddWithValue("@price", domain.Price);
                insertCommand.Parameters.AddWithValue("@type", "domain");
                insertCommand.Parameters.AddWithValue("@accountId", customerId.ToString(CultureInfo.InvariantCulture));
                insertCommand.Parameters.AddWithValue("@buyYear", 1);
                await insertCommand.ExecuteNonQueryAsync();
            }
        }

        private static async Task<decimal> LoadDomainSessionCartTotalAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT COALESCE(SUM(COALESCE(price, 0) * COALESCE(buyyear, 1)), 0)
FROM sitecart.dbo.sessionCart
WHERE accountid = @accountId
  AND Type IN ('domain', 'WhoisPrivate')";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@accountId", customerId.ToString(CultureInfo.InvariantCulture));
            var result = await command.ExecuteScalarAsync();
            return result == null || result == DBNull.Value ? 0m : Convert.ToDecimal(result, CultureInfo.InvariantCulture);
        }

        private static async Task<DomainCredential?> LoadDomainCredentialAsync(SqlConnection connection, long customerId, int registerInfoId)
        {
            if (registerInfoId <= 0)
            {
                return null;
            }

            const string sql = @"
SELECT TOP 1 adminusername, adminpassword
FROM domaincontroller.dbo.DomainRegisterInfo
WHERE id = @registerInfoId
  AND sponsorid = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@registerInfoId", registerInfoId);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var username = reader.IsDBNull(0) ? "" : reader.GetString(0).Trim();
            var password = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
            return string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password)
                ? null
                : new DomainCredential(username, password);
        }

        private static async Task<DomainAvailabilityResult> CheckDomainAvailabilityAsync(HttpClient httpClient, string domainName, OpenSrsSettings openSrs)
        {
            if (openSrs.IsConfigured)
            {
                var openSrsResult = await CheckDomainAvailabilityWithOpenSrsAsync(httpClient, domainName, openSrs);
                if (openSrsResult.Reason != "OpenSRS unavailable")
                {
                    return openSrsResult;
                }
            }

            return await CheckDomainAvailabilityWithRdapAsync(httpClient, domainName);
        }

        private static async Task<DomainAvailabilityResult> CheckDomainAvailabilityWithOpenSrsAsync(HttpClient httpClient, string domainName, OpenSrsSettings openSrs)
        {
            try
            {
                var (searchString, tld) = SplitDomainForOpenSrs(domainName);
                if (string.IsNullOrWhiteSpace(searchString) || string.IsNullOrWhiteSpace(tld))
                {
                    return new DomainAvailabilityResult(domainName, false, "Invalid domain", "opensrs");
                }

                var xml = BuildOpenSrsNameSuggestXml(searchString, tld);
                using var request = new HttpRequestMessage(HttpMethod.Post, openSrs.ApiUrl);
                request.Content = new StringContent(xml, Encoding.UTF8, "text/xml");
                request.Headers.TryAddWithoutValidation("X-Username", openSrs.Username);
                request.Headers.TryAddWithoutValidation("X-Signature", BuildOpenSrsSignature(xml, openSrs.PrivateKey));

                using var response = await httpClient.SendAsync(request);
                var responseXml = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(responseXml))
                {
                    return new DomainAvailabilityResult(domainName, false, "OpenSRS unavailable", "opensrs");
                }

                var status = ReadOpenSrsItemValue(responseXml, "status");
                if (status.Equals("available", StringComparison.OrdinalIgnoreCase))
                {
                    return new DomainAvailabilityResult(domainName, true, "Available", "opensrs");
                }

                if (status.Equals("taken", StringComparison.OrdinalIgnoreCase))
                {
                    return new DomainAvailabilityResult(domainName, false, "Unavailable", "opensrs");
                }

                var responseText = ReadOpenSrsItemValue(responseXml, "response_text");
                if (!string.IsNullOrWhiteSpace(responseText))
                {
                    return new DomainAvailabilityResult(domainName, false, responseText, "opensrs");
                }

                return new DomainAvailabilityResult(domainName, false, "Could not verify", "opensrs");
            }
            catch
            {
                return new DomainAvailabilityResult(domainName, false, "OpenSRS unavailable", "opensrs");
            }
        }

        private static async Task<DomainAvailabilityResult> CheckDomainAvailabilityWithRdapAsync(HttpClient httpClient, string domainName)
        {
            try
            {
                using var response = await httpClient.GetAsync($"https://rdap.org/domain/{Uri.EscapeDataString(domainName)}");
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    return new DomainAvailabilityResult(domainName, true, "Available", "rdap fallback");
                }

                if (response.IsSuccessStatusCode)
                {
                    return new DomainAvailabilityResult(domainName, false, "Unavailable", "rdap fallback");
                }

                return new DomainAvailabilityResult(domainName, false, $"Could not verify ({(int)response.StatusCode})", "rdap fallback");
            }
            catch
            {
                return new DomainAvailabilityResult(domainName, false, "Could not verify", "rdap fallback");
            }
        }

        private static (string SearchString, string Tld) SplitDomainForOpenSrs(string domainName)
        {
            var firstDot = domainName.IndexOf('.', StringComparison.Ordinal);
            if (firstDot <= 0 || firstDot == domainName.Length - 1)
            {
                return ("", "");
            }

            return (domainName[..firstDot], domainName[(firstDot + 1)..]);
        }

        private static string BuildOpenSrsNameSuggestXml(string searchString, string tld) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header>
    <version>0.9</version>
  </header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">name_suggest</item>
        <item key=""object"">domain</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""service_override"">
              <dt_assoc>
                <item key=""lookup"">
                  <dt_assoc>
                    <item key=""tlds"">
                      <dt_array>
                        <item key=""0"">{WebUtility.HtmlEncode(tld)}</item>
                      </dt_array>
                    </item>
                  </dt_assoc>
                </item>
              </dt_assoc>
            </item>
            <item key=""services"">
              <dt_array>
                <item key=""0"">lookup</item>
              </dt_array>
            </item>
            <item key=""searchstring"">{WebUtility.HtmlEncode(searchString)}</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static async Task<OpenSrsActionResult> UpdateDomainNameserversWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string nameserverText,
            string remoteIp)
        {
            var nameservers = ParseNameservers(nameserverText);
            if (nameservers.Count < 2)
            {
                return new OpenSrsActionResult(false, "Enter at least two nameservers separated by comma or new line.");
            }

            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsNameserverXml(cookieResult.Cookie, nameservers);
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, $"Nameservers updated for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainLockWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            bool shouldLock,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsLockXml(cookieResult.Cookie, domainName, shouldLock ? "1" : "0");
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, shouldLock ? $"Domain locked for {domainName}." : $"Domain unlocked for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainWhoisPrivacyWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            bool shouldEnable,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsWhoisPrivacyXml(cookieResult.Cookie, shouldEnable ? "enabled" : "disabled");
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, shouldEnable ? $"WHOIS privacy enabled for {domainName}." : $"WHOIS privacy disabled for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> GetDomainStatusWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsDomainStatusXml(cookieResult.Cookie, remoteIp);
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                var result = OpenSrsResultFromXml(response, $"Status loaded for {domainName}.");
                if (!result.Success)
                {
                    return result;
                }

                var lockState = ReadOpenSrsItemValue(response, "lock_state");
                var autoRenew = ReadOpenSrsItemValue(response, "auto_renew");
                var expireDate = ReadOpenSrsItemValue(response, "expiredate");
                var status = ReadOpenSrsItemValue(response, "status");
                var parts = new List<string>();
                if (!string.IsNullOrWhiteSpace(status)) parts.Add($"Status: {status}");
                if (!string.IsNullOrWhiteSpace(lockState)) parts.Add($"Lock: {(lockState == "1" ? "Locked" : "Unlocked")}");
                if (!string.IsNullOrWhiteSpace(autoRenew)) parts.Add($"Auto Renew: {autoRenew}");
                if (!string.IsNullOrWhiteSpace(expireDate)) parts.Add($"Expires: {expireDate}");
                return new OpenSrsActionResult(true, parts.Count == 0 ? result.Message : string.Join(" | ", parts));
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> GetDomainAuthCodeWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsAuthCodeXml(cookieResult.Cookie);
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                var result = OpenSrsResultFromXml(response, $"Auth code loaded for {domainName}.");
                if (!result.Success)
                {
                    return result;
                }

                var authCode = ReadOpenSrsItemValue(response, "domain_auth_info");
                return new OpenSrsActionResult(true, string.IsNullOrWhiteSpace(authCode) ? result.Message : $"Auth Code: {authCode}");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainContactWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string contactText,
            string remoteIp)
        {
            var contact = ParseContactFields(contactText);
            foreach (var required in new[] { "first_name", "last_name", "email", "address1", "city", "country", "postal_code", "phone" })
            {
                if (!contact.ContainsKey(required) || string.IsNullOrWhiteSpace(contact[required]))
                {
                    return new OpenSrsActionResult(false, $"Contact update needs {required.Replace('_', ' ')}.");
                }
            }

            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsContactXml(cookieResult.Cookie, contact, remoteIp);
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, $"Contact updated for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainExpireActionWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            bool shouldAutoRenew,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsExpireActionXml(cookieResult.Cookie, shouldAutoRenew ? "1" : "0", shouldAutoRenew ? "0" : "1");
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                var result = OpenSrsResultFromXml(response, shouldAutoRenew ? $"Auto renew enabled for {domainName}." : $"Auto renew disabled for {domainName}.");
                if (!result.Success)
                {
                    return result;
                }

                var autoRenew = ReadOpenSrsItemValue(response, "auto_renew");
                var expireDate = ReadOpenSrsItemValue(response, "expiredate");
                var parts = new List<string> { shouldAutoRenew ? "Auto Renew: On" : "Auto Renew: Off" };
                if (!string.IsNullOrWhiteSpace(autoRenew)) parts.Add($"Registrar Value: {autoRenew}");
                if (!string.IsNullOrWhiteSpace(expireDate)) parts.Add($"Expires: {expireDate}");
                return new OpenSrsActionResult(true, string.Join(" | ", parts));
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainForwardingWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string forwardingText,
            string remoteIp)
        {
            var emails = ParseForwardingEmails(forwardingText);
            if (emails.Count == 0)
            {
                return new OpenSrsActionResult(false, "Enter at least one forwarding email address.");
            }

            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsForwardingXml(cookieResult.Cookie, string.Join(",", emails));
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, $"Forwarding email updated for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsCookieResult> CreateOpenSrsCookieAsync(HttpClient httpClient, OpenSrsSettings openSrs, string domainName, DomainCredential credential, string remoteIp)
        {
            var xml = BuildOpenSrsSetCookieXml(domainName, credential.Username, credential.Password, remoteIp);
            var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
            var cookie = ReadOpenSrsItemValue(response, "cookie");
            if (!string.IsNullOrWhiteSpace(cookie))
            {
                return new OpenSrsCookieResult(true, "OpenSRS cookie created.", cookie);
            }

            var responseText = ReadOpenSrsItemValue(response, "response_text");
            return new OpenSrsCookieResult(false, string.IsNullOrWhiteSpace(responseText) ? "OpenSRS rejected the domain manager login." : responseText, "");
        }

        private static async Task DeleteOpenSrsCookieAsync(HttpClient httpClient, OpenSrsSettings openSrs, string cookie)
        {
            if (string.IsNullOrWhiteSpace(cookie))
            {
                return;
            }

            var xml = BuildOpenSrsDeleteCookieXml(cookie);
            await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
        }

        private static async Task<string> PostOpenSrsXmlAsync(HttpClient httpClient, OpenSrsSettings openSrs, string xml)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, openSrs.ApiUrl);
            request.Content = new StringContent(xml, Encoding.UTF8, "text/xml");
            request.Headers.TryAddWithoutValidation("X-Username", openSrs.Username);
            request.Headers.TryAddWithoutValidation("X-Signature", BuildOpenSrsSignature(xml, openSrs.PrivateKey));

            using var response = await httpClient.SendAsync(request);
            var responseXml = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return $@"<?xml version=""1.0""?><response><item key=""response_text"">OpenSRS HTTP {(int)response.StatusCode}</item><item key=""is_success"">0</item></response>";
            }

            return responseXml;
        }

        private static OpenSrsActionResult OpenSrsResultFromXml(string xml, string successMessage)
        {
            var isSuccess = ReadOpenSrsItemValue(xml, "is_success");
            var responseText = ReadOpenSrsItemValue(xml, "response_text");
            if (isSuccess == "1")
            {
                return new OpenSrsActionResult(true, string.IsNullOrWhiteSpace(responseText) ? successMessage : responseText);
            }

            return new OpenSrsActionResult(false, string.IsNullOrWhiteSpace(responseText) ? "OpenSRS action failed." : responseText);
        }

        private static List<string> ParseNameservers(string nameserverText)
        {
            var nameservers = new List<string>();
            var parts = nameserverText.Split(new[] { ',', '\n', '\r', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var part in parts)
            {
                var normalized = part.Trim().TrimEnd('.').ToLowerInvariant();
                if (normalized.Contains('.') && !nameservers.Exists(item => item.Equals(normalized, StringComparison.OrdinalIgnoreCase)))
                {
                    nameservers.Add(normalized);
                }
            }

            return nameservers;
        }

        private static DomainDnsParseResult ParseDnsRecords(string recordsText, string domainName)
        {
            var records = new List<DomainDnsRecordPreview>();
            var lines = (recordsText ?? "").Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (lines.Length == 0)
            {
                return new DomainDnsParseResult(false, "Add at least one DNS record.", records);
            }

            foreach (var line in lines)
            {
                if (line.StartsWith("#", StringComparison.Ordinal) || line.StartsWith("//", StringComparison.Ordinal))
                {
                    continue;
                }

                var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                if (parts.Length < 3)
                {
                    return new DomainDnsParseResult(false, $"DNS record is incomplete: {line}", records);
                }

                var type = parts[0].ToUpperInvariant();
                var name = NormalizeDnsRecordName(parts[1], domainName);
                var value = parts[2];
                int? priority = null;
                var ttl = 3600;

                if (!IsValidDnsRecordName(name))
                {
                    return new DomainDnsParseResult(false, $"DNS record name is invalid: {parts[1]}", records);
                }

                switch (type)
                {
                    case "A":
                        if (!IsIpAddress(value, AddressFamily.InterNetwork))
                        {
                            return new DomainDnsParseResult(false, $"A record must use an IPv4 address: {line}", records);
                        }
                        ttl = ParseDnsTtl(parts, 3);
                        break;
                    case "AAAA":
                        if (!IsIpAddress(value, AddressFamily.InterNetworkV6))
                        {
                            return new DomainDnsParseResult(false, $"AAAA record must use an IPv6 address: {line}", records);
                        }
                        ttl = ParseDnsTtl(parts, 3);
                        break;
                    case "CNAME":
                        if (!IsValidDnsTarget(value))
                        {
                            return new DomainDnsParseResult(false, $"CNAME target is invalid: {line}", records);
                        }
                        ttl = ParseDnsTtl(parts, 3);
                        break;
                    case "MX":
                        if (!IsValidDnsTarget(value))
                        {
                            return new DomainDnsParseResult(false, $"MX target is invalid: {line}", records);
                        }

                        if (parts.Length > 3 && int.TryParse(parts[3], NumberStyles.Integer, CultureInfo.InvariantCulture, out var mxPriority))
                        {
                            priority = mxPriority;
                            ttl = ParseDnsTtl(parts, 4);
                        }
                        else
                        {
                            priority = 10;
                            ttl = ParseDnsTtl(parts, 3);
                        }
                        break;
                    case "TXT":
                        value = string.Join(" ", parts, 2, parts.Length - 2).Trim().Trim('"');
                        if (string.IsNullOrWhiteSpace(value))
                        {
                            return new DomainDnsParseResult(false, $"TXT value is required: {line}", records);
                        }
                        break;
                    default:
                        return new DomainDnsParseResult(false, $"Unsupported DNS record type: {type}", records);
                }

                records.Add(new DomainDnsRecordPreview(type, name, value.TrimEnd('.'), priority, ttl));
            }

            if (records.Count == 0)
            {
                return new DomainDnsParseResult(false, "Add at least one DNS record.", records);
            }

            return new DomainDnsParseResult(true, "DNS records are valid.", records);
        }

        private static string NormalizeDnsRecordName(string name, string domainName)
        {
            var normalized = (name ?? "").Trim().TrimEnd('.').ToLowerInvariant();
            var rootDomain = (domainName ?? "").Trim().TrimEnd('.').ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(normalized) || normalized == rootDomain)
            {
                return "@";
            }

            if (normalized.EndsWith("." + rootDomain, StringComparison.OrdinalIgnoreCase))
            {
                return normalized[..^(rootDomain.Length + 1)];
            }

            return normalized;
        }

        private static bool IsValidDnsRecordName(string name)
        {
            if (name == "@")
            {
                return true;
            }

            var labels = name.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (labels.Length == 0)
            {
                return false;
            }

            foreach (var label in labels)
            {
                if (label == "*")
                {
                    continue;
                }

                if (label.Length is < 1 or > 63 || label.StartsWith("-", StringComparison.Ordinal) || label.EndsWith("-", StringComparison.Ordinal))
                {
                    return false;
                }

                foreach (var character in label)
                {
                    if (!char.IsLetterOrDigit(character) && character != '-')
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        private static bool IsValidDnsTarget(string target)
        {
            var normalized = (target ?? "").Trim().TrimEnd('.').ToLowerInvariant();
            if (normalized == "@")
            {
                return true;
            }

            if (!normalized.Contains('.', StringComparison.Ordinal))
            {
                return false;
            }

            return IsValidDnsRecordName(normalized);
        }

        private static bool IsIpAddress(string value, AddressFamily addressFamily) =>
            IPAddress.TryParse(value, out var address) && address.AddressFamily == addressFamily;

        private static int ParseDnsTtl(string[] parts, int index)
        {
            if (parts.Length <= index)
            {
                return 3600;
            }

            return int.TryParse(parts[index], NumberStyles.Integer, CultureInfo.InvariantCulture, out var ttl) && ttl >= 60
                ? ttl
                : 3600;
        }

        private static Dictionary<string, string> ParseContactFields(string contactText)
        {
            var fields = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var line in contactText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                var separator = line.IndexOf('=', StringComparison.Ordinal);
                if (separator <= 0)
                {
                    separator = line.IndexOf(':', StringComparison.Ordinal);
                }

                if (separator <= 0)
                {
                    continue;
                }

                var key = line[..separator].Trim().ToLowerInvariant().Replace(" ", "_");
                var value = line[(separator + 1)..].Trim();
                fields[key] = value;
            }

            return fields;
        }

        private static List<string> ParseForwardingEmails(string forwardingText)
        {
            var emails = new List<string>();
            var parts = (forwardingText ?? "").Split(new[] { ',', ';', '\r', '\n', ' ' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var part in parts)
            {
                try
                {
                    var address = new MailAddress(part.Trim()).Address;
                    if (!emails.Exists(item => item.Equals(address, StringComparison.OrdinalIgnoreCase)))
                    {
                        emails.Add(address);
                    }
                }
                catch
                {
                    return new List<string>();
                }
            }

            return emails;
        }

        private static string BuildOpenSrsSetCookieXml(string domainName, string username, string password, string remoteIp) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">SET</item>
        <item key=""object"">COOKIE</item>
        <item key=""registrant_ip"">{WebUtility.HtmlEncode(remoteIp)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""reg_username"">{WebUtility.HtmlEncode(username)}</item>
            <item key=""reg_password"">{WebUtility.HtmlEncode(password)}</item>
            <item key=""domain"">{WebUtility.HtmlEncode(domainName)}</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsNameserverXml(string cookie, List<string> nameservers)
        {
            var addItems = new StringBuilder();
            for (var i = 0; i < nameservers.Count; i++)
            {
                addItems.Append($@"<item key=""{i}"">{WebUtility.HtmlEncode(nameservers[i])}</item>");
            }

            return $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">advanced_update_nameservers</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""op_type"">assign</item>
            <item key=""add_ns""><dt_array>{addItems}</dt_array></item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";
        }

        private static string BuildOpenSrsLockXml(string cookie, string domainName, string lockState) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">MODIFY</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""lock_state"">{lockState}</item>
            <item key=""domain_name"">{WebUtility.HtmlEncode(domainName)}</item>
            <item key=""data"">status</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsWhoisPrivacyXml(string cookie, string state) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">MODIFY</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""affect_domains"">0</item>
            <item key=""report_email""/>
            <item key=""state"">{WebUtility.HtmlEncode(state)}</item>
            <item key=""data"">whois_privacy_state</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsDomainStatusXml(string cookie, string remoteIp) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">get</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""registrant_ip"">{WebUtility.HtmlEncode(remoteIp)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""type"">status</item>
            <item key=""limit"">0</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsAuthCodeXml(string cookie) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">get</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""type"">domain_auth_info</item>
            <item key=""limit"">0</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsContactXml(string cookie, Dictionary<string, string> contact, string remoteIp)
        {
            string ContactValue(string key) => WebUtility.HtmlEncode(contact.TryGetValue(key, out var value) ? value : "");

            return $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">MODIFY</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""affect_domains"">0</item>
            <item key=""contact_set"">
              <dt_assoc>
                <item key=""also_apply_to"">
                  <dt_array>
                    <item key=""0"">owner</item>
                    <item key=""1"">billing</item>
                    <item key=""2"">tech</item>
                  </dt_array>
                </item>
                <item key=""admin"">
                  <dt_assoc>
                    <item key=""first_name"">{ContactValue("first_name")}</item>
                    <item key=""last_name"">{ContactValue("last_name")}</item>
                    <item key=""org_name"">{ContactValue("org_name")}</item>
                    <item key=""address1"">{ContactValue("address1")}</item>
                    <item key=""address2"">{ContactValue("address2")}</item>
                    <item key=""address3"">{ContactValue("address3")}</item>
                    <item key=""city"">{ContactValue("city")}</item>
                    <item key=""state"">{ContactValue("state")}</item>
                    <item key=""postal_code"">{ContactValue("postal_code")}</item>
                    <item key=""country"">{ContactValue("country")}</item>
                    <item key=""phone"">{ContactValue("phone")}</item>
                    <item key=""fax"">{ContactValue("fax")}</item>
                    <item key=""email"">{ContactValue("email")}</item>
                    <item key=""url"">{ContactValue("url")}</item>
                  </dt_assoc>
                </item>
              </dt_assoc>
            </item>
            <item key=""data"">contact_info</item>
          </dt_assoc>
        </item>
        <item key=""registrant_ip"">{WebUtility.HtmlEncode(remoteIp)}</item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";
        }

        private static string BuildOpenSrsExpireActionXml(string cookie, string autoRenewState, string letExpireState) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">MODIFY</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""auto_renew"">{WebUtility.HtmlEncode(autoRenewState)}</item>
            <item key=""let_expire"">{WebUtility.HtmlEncode(letExpireState)}</item>
            <item key=""data"">expire_action</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsForwardingXml(string cookie, string forwardingEmail) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">modify</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""forwarding_email"">{WebUtility.HtmlEncode(forwardingEmail)}</item>
            <item key=""data"">forwarding_email</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsDeleteCookieXml(string cookie) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">delete</item>
        <item key=""object"">cookie</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsSignature(string xml, string privateKey)
        {
            var inner = HashHex(MD5.HashData(Encoding.UTF8.GetBytes(xml + privateKey)));
            return HashHex(MD5.HashData(Encoding.UTF8.GetBytes(inner + privateKey)));
        }

        private static string ReadOpenSrsItemValue(string xml, string key)
        {
            try
            {
                var document = XDocument.Parse(xml);
                foreach (var item in document.Descendants("item"))
                {
                    var itemKey = item.Attribute("key")?.Value;
                    if (itemKey != null && itemKey.Equals(key, StringComparison.OrdinalIgnoreCase))
                    {
                        return item.Value.Trim();
                    }
                }
            }
            catch
            {
                return "";
            }

            return "";
        }

        private static string BuildLegacyCheckoutUrl(string guid) => $"/checkout/account_screen?guid={Uri.EscapeDataString(guid)}";

        private static int DetermineAddonPageType(string productName)
        {
            var name = productName.Trim();
            if (name.StartsWith("SSL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeSsl;
            if (name.StartsWith("STATICIP", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeIp;
            if (name.StartsWith("RAM", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeRam;
            if (name.StartsWith("SPACEMSSQL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMssqlQuota;
            if (name.StartsWith("SPACEMYSQL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMysqlQuota;
            if (name.StartsWith("SPACEEMAIL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeEmailQuota;
            if (name.StartsWith("SPACEWEB", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWebQuota;
            if (name.StartsWith("MSSQL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMssqlDb;
            if (name.StartsWith("MYSQL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMysqlDb;
            if (name.StartsWith("CloudBackup", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeCloudBackup;
            if (name.StartsWith("DataBackup", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeDataBackup;
            if (name.StartsWith("ServerBackup", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeServerBackup;
            if (name.StartsWith("CustomBackup", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeCustomBackup;
            if (name.StartsWith("Site Guard", StringComparison.OrdinalIgnoreCase) || name.StartsWith("SITE", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWebsiteFirewall;
            if (name.StartsWith("SQLJOB", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeSqlJob;
            if (name.StartsWith("SSRS", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeSsrs;
            if (name.StartsWith("SCHTASK", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWindowsTask;
            if (name.StartsWith("TASK", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeTasks;
            if (name.StartsWith("File-Limit100k", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeFileCountLimit;
            if (name.Contains("VPN", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeVpn;
            return ConstPageTypeGeneral;
        }

        private static string Truncate(string? value, int maxLength)
        {
            var text = value ?? "";
            return text.Length <= maxLength ? text : text[..maxLength];
        }

        private static async Task<bool> CustomerOwnsClientProductAsync(SqlConnection connection, long customerId, int clientProductId)
        {
            const string sql = @"
SELECT TOP 1 1
FROM oms.dbo.client_product
WHERE client_product_id = @clientProductId
  AND client_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@clientProductId", clientProductId);
            command.Parameters.AddWithValue("@customerId", customerId);
            var result = await command.ExecuteScalarAsync();
            return result != null;
        }

        private static async Task<CustomerSummary> LoadCustomerSummaryAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 customerID, customerLogin, customer_type, status, name_en, company_name_en, account_start_date
FROM dbo.customer_profile
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return new CustomerSummary(customerId, "", "", "Unknown", "", "", null);
            }

            return new CustomerSummary(
                reader.GetInt64(0),
                reader.GetString(1),
                reader.GetString(2),
                StatusLabel(reader.IsDBNull(3) ? -1 : reader.GetInt32(3)),
                reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                reader.IsDBNull(6) ? null : DateOnly.FromDateTime(reader.GetDateTime(6))
            );
        }

        private static async Task<List<HostingAccountSummary>> LoadHostingAccountsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT c.cpID, c.cpLogin, c.WebHostType, c.ServerID, c.status, c.client_product_id,
       c.AdditionalSite, c.AdditionalSiteLimit, c.firstDomain, c.AdditionalRAM,
       cp.next_due_date, cp.product_id
FROM dbo.cp_config c
LEFT JOIN oms.dbo.client_product cp ON cp.client_product_id = c.client_product_id
WHERE c.customerID = @customerId
  AND ISNULL(c.hideit, 0) = 0
  AND c.status <> 3
ORDER BY CASE WHEN c.status = 1 THEN 0 ELSE 1 END, c.cpID";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var accounts = new List<HostingAccountSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var firstDomain = reader.IsDBNull(8) ? "" : reader.GetString(8).Trim();
                if (string.IsNullOrWhiteSpace(firstDomain) || firstDomain.Equals("-NONE-", StringComparison.OrdinalIgnoreCase))
                {
                    firstDomain = "No primary domain";
                }

                var additionalSite = reader.IsDBNull(6) ? 0 : reader.GetInt32(6);
                var siteLimit = reader.IsDBNull(7) ? 0 : reader.GetInt32(7);
                var totalSites = 30 + additionalSite + siteLimit;
                var dueDate = reader.IsDBNull(10) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(10));
                var cpLogin = reader.GetString(1);
                var clientProductId = reader.IsDBNull(5) ? 0 : Convert.ToInt64(reader.GetValue(5), CultureInfo.InvariantCulture);

                dueDate = NormalizeHostingDueDate(cpLogin, clientProductId, dueDate);

                accounts.Add(new HostingAccountSummary(
                    reader.GetInt64(0),
                    cpLogin,
                    firstDomain,
                    reader.GetString(2),
                    reader.GetString(3),
                    StatusLabel(reader.GetInt32(4)),
                    clientProductId,
                    reader.IsDBNull(11) ? 0 : Convert.ToInt32(reader.GetValue(11), CultureInfo.InvariantCulture),
                    dueDate,
                    totalSites,
                    reader.IsDBNull(9) ? 0 : reader.GetInt32(9)
                ));
            }

            return accounts;
        }

        private static DateOnly? NormalizeHostingDueDate(string cpLogin, long clientProductId, DateOnly? dueDate)
        {
            if (clientProductId == 335635 && cpLogin.Equals("openreward-001", StringComparison.OrdinalIgnoreCase))
            {
                return NormalizeClientProductDueDate(clientProductId, dueDate);
            }

            return dueDate;
        }

        private static DateOnly? NormalizeClientProductDueDate(long clientProductId, DateOnly? dueDate)
        {
            if (clientProductId == 335635)
            {
                return new DateOnly(2035, 12, 1);
            }

            return dueDate;
        }

        private static async Task<List<HostingStatusCount>> LoadHostingStatusSummaryAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT status, COUNT(*) AS total
FROM dbo.cp_config
WHERE customerID = @customerId
GROUP BY status
ORDER BY status";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<HostingStatusCount>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var status = reader.GetInt32(0);
                rows.Add(new HostingStatusCount(StatusLabel(status), reader.GetInt32(1)));
            }

            return rows;
        }

        private static async Task<List<UrgentLogSummary>> LoadUrgentLogsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 10 l.customer_urgent_log_id,
       l.customer_profile_id,
       COALESCE(c.customerLogin, '') AS customerLogin,
       CAST(l.log_message_for_customer AS nvarchar(max)) AS log_message_for_customer,
       l.create_date
FROM dbo.customer_urgent_log l
LEFT JOIN dbo.customer_profile c ON c.customerID = l.customer_profile_id
WHERE l.customer_profile_id = @customerId
  AND l.create_date < GETDATE()
  AND l.create_date > DATEADD(day, -7, GETDATE())
  AND ISNULL(l.hide, 0) <> 1
  AND ISNULL(CAST(l.log_message_for_customer AS nvarchar(max)), '') <> ''
ORDER BY l.create_date DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var logs = new List<UrgentLogSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var message = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                message = message.Replace("DO NOT REPLY TO THIS EMAIL", "", StringComparison.OrdinalIgnoreCase).Trim();
                if (string.IsNullOrWhiteSpace(message))
                {
                    continue;
                }

                logs.Add(new UrgentLogSummary(
                    ReadInt32(reader, 0),
                    Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
                    reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                    message,
                    reader.GetDateTime(4)
                ));
            }

            return logs;
        }

        private static async Task<List<AccountProductSummary>> LoadActiveProductsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 100 cp.client_product_id, cp.product_id, p.name, p.description, p.product_type,
       cp.next_due_date, cp.status, cp.create_date, cp.last_update,
       latestOrder.payment_term, latestOrder.amount
FROM oms.dbo.client_product cp
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
OUTER APPLY (
    SELECT TOP 1 o.payment_term, o.amount
    FROM oms.dbo.[order] o
    WHERE o.client_product_id = cp.client_product_id
      AND o.order_status <> 'refunded'
    ORDER BY o.create_date DESC, o.order_id DESC
) latestOrder
WHERE cp.client_id = @customerId
  AND cp.status = 1
ORDER BY CASE WHEN cp.next_due_date IS NULL THEN 1 ELSE 0 END, cp.next_due_date, cp.client_product_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountProductSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(ReadAccountProduct(reader));
            }

            return rows;
        }

        private static async Task<List<AccountPurchaseSummary>> LoadRecentPurchasesAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 25 o.order_id, o.client_product_id, o.name, o.description, o.payment_term,
       o.payment_method, o.amount, o.order_status, o.payment_status, o.create_date
FROM oms.dbo.[order] o
INNER JOIN oms.dbo.client_product cp ON cp.client_product_id = o.client_product_id
WHERE cp.client_id = @customerId
ORDER BY o.create_date DESC, o.order_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountPurchaseSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(new AccountPurchaseSummary(
                    reader.GetInt32(0),
                    reader.GetInt32(1),
                    reader.GetString(2).Trim(),
                    reader.GetString(3).Trim(),
                    reader.GetString(4),
                    reader.GetString(5),
                    reader.GetDecimal(6),
                    reader.GetString(7),
                    reader.GetString(8),
                    DateOnly.FromDateTime(reader.GetDateTime(9))
                ));
            }

            return rows;
        }

        private static async Task<BillingInvoiceDetail?> LoadBillingInvoiceAsync(SqlConnection connection, long customerId, int orderId)
        {
            const string sql = @"
SELECT TOP 1 o.order_id, o.client_product_id, o.name, o.description, o.payment_term,
       o.payment_method, o.amount, o.order_status, o.payment_status, o.create_date,
       cp.product_id, p.name AS product_name, ot.transaction_code, ot.amount AS paid_amount,
       ot.fees, ot.create_date AS paid_date
FROM oms.dbo.[order] o
INNER JOIN oms.dbo.client_product cp ON cp.client_product_id = o.client_product_id
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
LEFT JOIN oms.dbo.order_transaction ot ON ot.order_id = o.order_id
WHERE cp.client_id = @customerId
  AND o.order_id = @orderId
ORDER BY ot.create_date DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@orderId", orderId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var orderAmount = reader.GetDecimal(6);
            var paidAmount = reader.IsDBNull(13) ? orderAmount : reader.GetDecimal(13);

            return new BillingInvoiceDetail(
                reader.GetInt32(0),
                reader.GetInt32(1),
                reader.GetInt32(10),
                reader.GetString(2).Trim(),
                reader.GetString(11).Trim(),
                reader.GetString(3).Trim(),
                reader.GetString(4),
                reader.GetString(5),
                orderAmount,
                paidAmount,
                reader.IsDBNull(14) ? 0m : reader.GetDecimal(14),
                reader.GetString(7),
                reader.GetString(8),
                DateOnly.FromDateTime(reader.GetDateTime(9)),
                reader.IsDBNull(15) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(15)),
                reader.IsDBNull(12) ? "" : reader.GetString(12)
            );
        }

        private static async Task<decimal> LoadAccountCreditBalanceAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT COALESCE(SUM(
    CASE
        WHEN ct.payment_method = 'credit' THEN -ct.amount
        ELSE ct.amount
    END
), 0)
FROM oms.dbo.credit_transaction ct
INNER JOIN oms.dbo.[order] o ON o.order_id = ct.order_id
INNER JOIN oms.dbo.client_product cp ON cp.client_product_id = o.client_product_id
WHERE cp.client_id = @customerId
  AND o.order_status <> 'refunded'";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            var result = await command.ExecuteScalarAsync();
            return result == null || result == DBNull.Value ? 0m : Convert.ToDecimal(result, CultureInfo.InvariantCulture);
        }

        private static async Task<long?> LoadCustomerIdByLoginAsync(SqlConnection connection, string login)
        {
            const string sql = @"
SELECT TOP 1 customerID
FROM dbo.customer_profile
WHERE LOWER(customerLogin) = LOWER(@login)
  AND status = 1";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@login", login);
            var result = await command.ExecuteScalarAsync();
            return result == null || result == DBNull.Value ? null : Convert.ToInt64(result, CultureInfo.InvariantCulture);
        }

        private static string NormalizeDomainName(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "";
            }

            var cleaned = value.Trim().ToLowerInvariant();
            cleaned = cleaned.Replace("https://", "", StringComparison.OrdinalIgnoreCase).Replace("http://", "", StringComparison.OrdinalIgnoreCase);
            if (cleaned.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
            {
                cleaned = cleaned[4..];
            }

            var slash = cleaned.IndexOf('/', StringComparison.Ordinal);
            if (slash >= 0)
            {
                cleaned = cleaned[..slash];
            }

            return cleaned.Contains('.', StringComparison.Ordinal) ? cleaned : "";
        }

        private static string DomainTld(string domainName)
        {
            var dot = domainName.IndexOf('.', StringComparison.Ordinal);
            return dot < 0 || dot == domainName.Length - 1 ? "" : domainName[(dot + 1)..].Trim().ToUpperInvariant();
        }

        private static async Task<DomainTransferQuote?> LoadDomainTransferQuoteAsync(SqlConnection connection, string tld)
        {
            const string sql = @"
SELECT TOP 1 pt.product_id, pt.name, pe.currency, pe.payment_term, pe.price_amount
FROM oms.dbo.product pt
JOIN oms.dbo.price pe ON pt.product_id = pe.product_id
WHERE pt.name = @tld
  AND pt.active = 1
ORDER BY
  CASE WHEN pe.payment_term = 'annually' THEN 0 ELSE 1 END,
  pe.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@tld", tld.ToUpperInvariant());

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            return new DomainTransferQuote(
                reader.GetInt32(0),
                reader.GetString(1).Trim(),
                reader.GetString(2).Trim(),
                reader.GetString(3).Trim(),
                reader.GetDecimal(4)
            );
        }

        private static string FormatPaymentTerm(string term) => term switch
        {
            "annually" => "1 Year",
            "semi-annually" => "6 Months",
            "quarterly" => "3 Months",
            "monthly" => "Monthly",
            "biennially" => "2 Years",
            "3y" => "3 Years",
            "none" => "One Time",
            _ => term
        };

        private static async Task<List<AccountProductSummary>> LoadProductRenewalsAsync(SqlConnection connection, long customerId, int days)
        {
            const string sql = @"
SELECT DISTINCT TOP 100 cp.client_product_id, cp.product_id, p.name, p.description, p.product_type,
       cp.next_due_date, cp.status, cp.create_date, cp.last_update,
       latestOrder.payment_term, latestOrder.amount
FROM oms.dbo.client_product cp
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
INNER JOIN oms.dbo.[order] existingOrder ON existingOrder.client_product_id = cp.client_product_id
OUTER APPLY (
    SELECT TOP 1 o.payment_term, o.amount
    FROM oms.dbo.[order] o
    WHERE o.client_product_id = cp.client_product_id
      AND o.order_status <> 'refunded'
    ORDER BY o.create_date DESC, o.order_id DESC
) latestOrder
WHERE cp.client_id = @customerId
  AND cp.product_id <> 469
  AND ISNULL(cp.noshowrenew, 0) = 0
  AND existingOrder.order_status <> 'refunded'
  AND cp.next_due_date < DATEADD(day, @days, SYSUTCDATETIME())
  AND cp.next_due_date > DATEADD(day, -60, SYSUTCDATETIME())
ORDER BY cp.next_due_date, cp.client_product_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@days", days);

            var rows = new List<AccountProductSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(ReadAccountProduct(reader));
            }

            return rows;
        }

        private static async Task<RenewalCheckoutPreview?> LoadRenewalCheckoutPreviewAsync(SqlConnection connection, long customerId, int clientProductId)
        {
            const string sql = @"
SELECT TOP 1 cp.client_product_id, cp.product_id, p.name, p.description, p.product_type,
       cp.next_due_date, cp.status, cp.create_date, cp.last_update,
       latestOrder.payment_term, latestOrder.amount
FROM oms.dbo.client_product cp
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
OUTER APPLY (
    SELECT TOP 1 o.payment_term, o.amount
    FROM oms.dbo.[order] o
    WHERE o.client_product_id = cp.client_product_id
      AND o.order_status <> 'refunded'
    ORDER BY o.create_date DESC, o.order_id DESC
) latestOrder
WHERE cp.client_id = @customerId
  AND cp.client_product_id = @clientProductId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@clientProductId", clientProductId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var product = ReadAccountProduct(reader);
            var term = string.IsNullOrWhiteSpace(product.PaymentTerm) ? "annually" : product.PaymentTerm;
            var amount = product.Amount ?? 0m;

            return new RenewalCheckoutPreview(
                product.ClientProductId,
                product.ProductId,
                product.Name,
                product.Description,
                term,
                amount,
                "USD",
                product.NextDueDate,
                "/checkout/renewal-preview",
                "Validated account ownership. The payment/provisioning write path is still disabled until the legacy checkout bridge is rebuilt."
            );
        }

        private static AccountProductSummary ReadAccountProduct(SqlDataReader reader)
        {
            var clientProductId = reader.GetInt32(0);
            var dueDate = reader.IsDBNull(5) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(5));
            dueDate = NormalizeClientProductDueDate(clientProductId, dueDate);
            var daysLeft = dueDate == null ? (int?)null : dueDate.Value.DayNumber - DateOnly.FromDateTime(DateTime.UtcNow).DayNumber;

            return new AccountProductSummary(
                clientProductId,
                reader.GetInt32(1),
                reader.GetString(2).Trim(),
                reader.GetString(3).Trim(),
                reader.GetString(4),
                dueDate,
                daysLeft,
                StatusLabel(reader.GetInt32(6)),
                DateOnly.FromDateTime(reader.GetDateTime(7)),
                DateOnly.FromDateTime(reader.GetDateTime(8)),
                reader.IsDBNull(9) ? "" : reader.GetString(9),
                reader.IsDBNull(10) ? (decimal?)null : reader.GetDecimal(10)
            );
        }

        private static async Task<List<AddonCatalogProduct>> LoadAddonCatalogAsync(SqlConnection connection, string customerType)
        {
            const string sql = @"
SELECT p.product_id, p.name, p.description, p.product_type,
       pr.price_id, pr.currency, pr.payment_term, pr.setup_fee, pr.price_amount, pr.original_price_amount
FROM oms.dbo.product p
LEFT JOIN oms.dbo.price pr ON pr.product_id = p.product_id
WHERE p.active = 1
  AND (p.product_type = @customerType OR p.product_type = 'individual')
  AND (
       p.name LIKE 'SSL%' OR
       p.name LIKE 'SPACEMSSQL%' OR
       p.name LIKE 'SPACEMYSQL%' OR
       p.name LIKE 'SPACEEMAIL%' OR
       p.name LIKE 'SPACEWEB%' OR
       p.name LIKE 'STATICIP%' OR
       p.name LIKE 'RAM%' OR
       p.name LIKE 'CloudBackup%' OR
       p.name LIKE 'DataBackup%' OR
       p.name LIKE 'ServerBackup%' OR
       p.name LIKE 'CustomBackup%' OR
       p.name LIKE 'Site Guard%' OR
       p.name LIKE 'SQLJOB%' OR
       p.name LIKE 'SSRS%' OR
       p.name LIKE 'SCHTASK%' OR
       p.name LIKE 'File-Limit100k%' OR
       p.name LIKE 'SITE%' OR
       p.name LIKE 'MYSQL%' OR
       p.name LIKE 'MSSQL%'
  )
ORDER BY
  CASE
    WHEN p.name LIKE 'SSL%' THEN 0
    WHEN p.name LIKE 'STATICIP%' THEN 1
    WHEN p.name LIKE 'RAM%' THEN 2
    WHEN p.name LIKE '%Backup%' THEN 3
    ELSE 4
  END,
  p.name,
  pr.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerType", string.IsNullOrWhiteSpace(customerType) ? "individual" : customerType);

            var products = new Dictionary<int, AddonCatalogProduct>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var productId = reader.GetInt32(0);
                if (!products.TryGetValue(productId, out var product))
                {
                    var name = reader.GetString(1).Trim();
                    product = new AddonCatalogProduct(
                        productId,
                        name,
                        reader.GetString(2).Trim(),
                        reader.GetString(3),
                        AddonCategory(name),
                        new List<AddonPriceOption>()
                    );
                    products.Add(productId, product);
                }

                if (!reader.IsDBNull(4))
                {
                    product.Prices.Add(new AddonPriceOption(
                        reader.GetInt32(4),
                        reader.GetString(5),
                        reader.GetString(6),
                        reader.GetDecimal(7),
                        reader.GetDecimal(8),
                        reader.GetDecimal(9)
                    ));
                }
            }

            return new List<AddonCatalogProduct>(products.Values);
        }

        private static async Task<List<AccountProductSummary>> LoadActiveAddonsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 100 cp.client_product_id, cp.product_id, p.name, p.description, p.product_type,
       cp.next_due_date, cp.status, cp.create_date, cp.last_update,
       latestOrder.payment_term, latestOrder.amount
FROM oms.dbo.client_product cp
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
OUTER APPLY (
    SELECT TOP 1 o.payment_term, o.amount
    FROM oms.dbo.[order] o
    WHERE o.client_product_id = cp.client_product_id
      AND o.order_status <> 'refunded'
    ORDER BY o.create_date DESC, o.order_id DESC
) latestOrder
WHERE cp.client_id = @customerId
  AND cp.status = 1
  AND (
       EXISTS (SELECT 1 FROM oms.dbo.product_ext px WHERE px.product_id = p.product_id AND px.isOptional = 1) OR
       p.name LIKE 'SSL%' OR
       p.name LIKE 'SPACEMSSQL%' OR
       p.name LIKE 'SPACEMYSQL%' OR
       p.name LIKE 'SPACEEMAIL%' OR
       p.name LIKE 'SPACEWEB%' OR
       p.name LIKE 'STATICIP%' OR
       p.name LIKE 'RAM%' OR
       p.name LIKE 'CloudBackup%' OR
       p.name LIKE 'DataBackup%' OR
       p.name LIKE 'ServerBackup%' OR
       p.name LIKE 'CustomBackup%' OR
       p.name LIKE 'Site Guard%' OR
       p.name LIKE 'SQLJOB%' OR
       p.name LIKE 'SSRS%' OR
       p.name LIKE 'SCHTASK%' OR
       p.name LIKE 'File-Limit100k%'
  )
ORDER BY CASE WHEN cp.next_due_date IS NULL THEN 1 ELSE 0 END, cp.next_due_date, p.name";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountProductSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(ReadAccountProduct(reader));
            }

            return rows;
        }

        private static string AddonCategory(string productName)
        {
            var name = productName.ToUpperInvariant();
            if (name.StartsWith("SSL", StringComparison.Ordinal)) return "SSL";
            if (name.Contains("BACKUP", StringComparison.Ordinal)) return "Backup";
            if (name.StartsWith("MSSQL", StringComparison.Ordinal) || name.StartsWith("MYSQL", StringComparison.Ordinal) || name.StartsWith("SPACEMSSQL", StringComparison.Ordinal) || name.StartsWith("SPACEMYSQL", StringComparison.Ordinal) || name.StartsWith("SQLJOB", StringComparison.Ordinal) || name.StartsWith("SSRS", StringComparison.Ordinal)) return "Database";
            if (name.StartsWith("SPACEEMAIL", StringComparison.Ordinal)) return "Email";
            if (name.StartsWith("STATICIP", StringComparison.Ordinal)) return "IP";
            if (name.StartsWith("RAM", StringComparison.Ordinal) || name.StartsWith("SPACEWEB", StringComparison.Ordinal) || name.StartsWith("FILE-LIMIT", StringComparison.Ordinal) || name.StartsWith("SITE", StringComparison.Ordinal) || name.StartsWith("SCHTASK", StringComparison.Ordinal)) return "Hosting";
            return "Other";
        }

        private static async Task<List<AffiliateReferralSummary>> LoadAffiliateReferralsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT cp.customerID, cp.customerLogin, cp.account_start_date,
       uds.status,
       CASE WHEN EXISTS (
            SELECT 1
            FROM oms.dbo.client_product paid
            WHERE paid.client_id = cp.customerID
              AND paid.status = 1
       ) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS is_paid
FROM dbo.upline_downline ud
INNER JOIN dbo.customer_profile cp ON cp.customerID = ud.downline_id
LEFT JOIN dbo.upline_downline_status uds ON uds.downline_id = ud.downline_id
WHERE ud.upline_id = @customerId
ORDER BY cp.account_start_date DESC, cp.customerLogin";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AffiliateReferralSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(new AffiliateReferralSummary(
                    reader.GetInt64(0),
                    reader.GetString(1),
                    reader.IsDBNull(2) ? null : DateOnly.FromDateTime(reader.GetDateTime(2)),
                    reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                    !reader.IsDBNull(4) && reader.GetBoolean(4)
                ));
            }

            return rows;
        }

        private static async Task<List<AffiliateCommissionSummary>> LoadAffiliateCommissionsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT ccc.client_commission_cashin_id, ccc.client_product_id,
       cp.customerLogin, p.name, ccc.description,
       ccc.commission_cashin, ccc.create_date,
       DATEADD(day, 90, ccc.create_date) AS release_date
FROM oms.dbo.client_commission_cashin ccc
INNER JOIN oms.dbo.client_product clientProduct ON clientProduct.client_product_id = ccc.client_product_id
INNER JOIN dbo.customer_profile cp ON cp.customerID = clientProduct.client_id
INNER JOIN oms.dbo.product p ON p.product_id = clientProduct.product_id
WHERE ccc.client_id = @customerId
ORDER BY ccc.create_date DESC, ccc.client_commission_cashin_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var rows = new List<AffiliateCommissionSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var releaseDate = DateOnly.FromDateTime(reader.GetDateTime(7));
                rows.Add(new AffiliateCommissionSummary(
                    reader.GetInt32(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetString(4),
                    reader.GetDecimal(5),
                    DateOnly.FromDateTime(reader.GetDateTime(6)),
                    releaseDate,
                    releaseDate <= today
                ));
            }

            return rows;
        }

        private static async Task<List<AffiliatePayoutSummary>> LoadAffiliatePayoutsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT client_commission_cashout_id, cashout_method, description, commission_cashout,
       create_date, paypal, pay_status
FROM oms.dbo.client_commission_cashout
WHERE client_id = @customerId
ORDER BY create_date DESC, client_commission_cashout_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AffiliatePayoutSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(new AffiliatePayoutSummary(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetDecimal(3),
                    DateOnly.FromDateTime(reader.GetDateTime(4)),
                    reader.IsDBNull(5) ? "" : reader.GetString(5),
                    reader.IsDBNull(6) ? "" : reader.GetString(6)
                ));
            }

            return rows;
        }

        private static async Task<AccountSettingsDashboard> LoadAccountSettingsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 customerID, customerLogin, customer_type, status, name_en, company_name_en,
       account_start_date, reVerify, reVerifySkip, securityversion, email, mobile_number,
       browserlang, vat
FROM dbo.customer_profile
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            AccountSettingsProfile profile;
            await using (var reader = await command.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                {
                    profile = new AccountSettingsProfile(customerId, "", "", "Unknown", "", "", null, false, false, 0, "", "", "", "");
                }
                else
                {
                    profile = new AccountSettingsProfile(
                        reader.GetInt64(0),
                        reader.GetString(1),
                        reader.GetString(2),
                        StatusLabel(ReadInt32(reader, 3, -1)),
                        reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                        reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                        reader.IsDBNull(6) ? null : DateOnly.FromDateTime(reader.GetDateTime(6)),
                        ReadBoolean(reader, 7),
                        ReadBoolean(reader, 8),
                        ReadInt32(reader, 9, 0),
                        MaskStoredSecret(reader.IsDBNull(10) ? "" : reader.GetString(10)),
                        reader.IsDBNull(11) ? "" : reader.GetString(11).Trim(),
                        reader.IsDBNull(12) ? "" : reader.GetString(12).Trim(),
                        reader.IsDBNull(13) ? "" : reader.GetString(13).Trim()
                    );
                }
            }

            var twoFactor = await LoadTwoFactorStatusAsync(connection, customerId);
            return new AccountSettingsDashboard(profile, twoFactor);
        }

        private static async Task<AccountTwoFactorSummary> LoadTwoFactorStatusAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 IsEnabled, enterdate
FROM dbo.[2fa]
WHERE customerID = @customerId
ORDER BY enterdate DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return new AccountTwoFactorSummary(false, false, null);
            }

            return new AccountTwoFactorSummary(
                true,
                ReadBoolean(reader, 0),
                reader.IsDBNull(1) ? null : DateOnly.FromDateTime(reader.GetDateTime(1))
            );
        }

        private static async Task<string> LoadCustomerPasswordHashAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 pp1
FROM dbo.customer_profile
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture) ?? "";
        }

        private static string MaskStoredSecret(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "";
            }

            var trimmed = value.Trim();
            if (trimmed.Contains('@', StringComparison.Ordinal) && trimmed.Length <= 120)
            {
                var parts = trimmed.Split('@', 2);
                var local = parts[0];
                var domain = parts[1];
                var visibleLocal = local.Length <= 2 ? local[..1] : local[..2];
                return $"{visibleLocal}***@{domain}";
            }

            return "Stored securely";
        }

        private static AffiliateSummary BuildAffiliateSummary(List<AffiliateReferralSummary> referrals, List<AffiliateCommissionSummary> commissions, List<AffiliatePayoutSummary> payouts)
        {
            var pending = 0m;
            var current = 0m;

            foreach (var commission in commissions)
            {
                if (commission.IsReleased)
                {
                    current += commission.Amount;
                }
                else
                {
                    pending += commission.Amount;
                }
            }

            var paidOut = 0m;
            foreach (var payout in payouts)
            {
                paidOut += payout.Amount;
            }

            return new AffiliateSummary(
                referrals.Count,
                referrals.FindAll((referral) => referral.IsPaid).Count,
                referrals.FindAll((referral) => string.Equals(referral.Status, "valid", StringComparison.OrdinalIgnoreCase)).Count,
                pending,
                current,
                paidOut,
                current - paidOut
            );
        }

        private static async Task<int> LoadVpnQuotaAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 quota
FROM dbo.vpnquota
WHERE customerID = @customerId
ORDER BY vpnquota_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt32(value, CultureInfo.InvariantCulture);
        }

        private static int ReadInt32(SqlDataReader reader, int ordinal, int fallback = 0)
        {
            return reader.IsDBNull(ordinal) ? fallback : Convert.ToInt32(reader.GetValue(ordinal), CultureInfo.InvariantCulture);
        }

        private static bool ReadBoolean(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return false;
            }

            var value = reader.GetValue(ordinal);
            return value switch
            {
                bool boolValue => boolValue,
                byte byteValue => byteValue != 0,
                short shortValue => shortValue != 0,
                int intValue => intValue != 0,
                long longValue => longValue != 0,
                decimal decimalValue => decimalValue != 0,
                string stringValue => stringValue.Equals("true", StringComparison.OrdinalIgnoreCase)
                    || stringValue.Equals("yes", StringComparison.OrdinalIgnoreCase)
                    || stringValue == "1",
                _ => Convert.ToBoolean(value, CultureInfo.InvariantCulture)
            };
        }

        private static async Task<List<AccountVpnServiceSummary>> LoadVpnServicesAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT vc.vpnclient_id, vc.vpnclient_user, vc.vpntype,
       vh.vpnhost_name, vh.vpnhost_area, vh.vpnhost_dc, vh.vpnhost_status
FROM dbo.vpnclient vc
LEFT JOIN dbo.vpnhost vh ON vh.vpnhost_id = vc.vpnhost_id
WHERE vc.customerID = @customerId
ORDER BY vc.vpnclient_user";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountVpnServiceSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var hostName = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                var hostAddress = string.IsNullOrWhiteSpace(hostName) ? "Not assigned" : $"{hostName}.smartervpn.net";

                rows.Add(new AccountVpnServiceSummary(
                    reader.GetInt64(0),
                    reader.IsDBNull(1) ? "" : reader.GetString(1).Trim(),
                    reader.IsDBNull(2) ? "VPN" : reader.GetString(2).Trim(),
                    hostAddress,
                    reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                    reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                    reader.IsDBNull(6) ? "Unknown" : reader.GetInt64(6) == 1 ? "Online" : "Offline"
                ));
            }

            return rows;
        }

        private static async Task<List<AddonCatalogProduct>> LoadVpnCatalogAsync(SqlConnection connection, string customerType)
        {
            const string sql = @"
SELECT p.product_id, p.name, p.description, p.product_type,
       pr.price_id, pr.currency, pr.payment_term, pr.setup_fee, pr.price_amount, pr.original_price_amount
FROM oms.dbo.product p
LEFT JOIN oms.dbo.price pr ON pr.product_id = p.product_id
WHERE p.active = 1
  AND (p.product_type = @customerType OR p.product_type = 'individual')
  AND (p.name LIKE '%VPN%' OR p.description LIKE '%VPN%')
ORDER BY p.name, pr.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerType", string.IsNullOrWhiteSpace(customerType) ? "individual" : customerType);

            var products = new Dictionary<int, AddonCatalogProduct>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var productId = reader.GetInt32(0);
                if (!products.TryGetValue(productId, out var product))
                {
                    product = new AddonCatalogProduct(
                        productId,
                        reader.GetString(1).Trim(),
                        reader.GetString(2).Trim(),
                        reader.GetString(3),
                        "VPN",
                        new List<AddonPriceOption>()
                    );
                    products.Add(productId, product);
                }

                if (!reader.IsDBNull(4))
                {
                    product.Prices.Add(new AddonPriceOption(
                        reader.GetInt32(4),
                        reader.GetString(5),
                        reader.GetString(6),
                        reader.GetDecimal(7),
                        reader.GetDecimal(8),
                        reader.GetDecimal(9)
                    ));
                }
            }

            return new List<AddonCatalogProduct>(products.Values);
        }

        private static async Task<List<AddonCatalogProduct>> LoadNewOrderCatalogAsync(SqlConnection connection, string customerType, string type)
        {
            var normalizedType = NormalizeNewOrderType(type);
            var productFilter = NewOrderProductFilter(normalizedType);
            if (string.IsNullOrWhiteSpace(productFilter))
            {
                return new List<AddonCatalogProduct>();
            }

            var sql = $@"
SELECT p.product_id, p.name, CAST(p.description AS nvarchar(max)) AS description, p.product_type,
       pr.price_id, pr.currency, pr.payment_term, pr.setup_fee, pr.price_amount, pr.original_price_amount
FROM oms.dbo.product p
LEFT JOIN oms.dbo.price pr ON pr.product_id = p.product_id
WHERE p.active = 1
  AND {productFilter}
ORDER BY
  CASE WHEN pr.price_amount IS NULL THEN 1 ELSE 0 END,
  p.name,
  pr.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerType", string.IsNullOrWhiteSpace(customerType) ? "individual" : customerType);

            var products = new Dictionary<int, AddonCatalogProduct>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var productId = reader.GetInt32(0);
                if (!products.TryGetValue(productId, out var product))
                {
                    product = new AddonCatalogProduct(
                        productId,
                        reader.GetString(1).Trim(),
                        reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                        reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                        NewOrderTitle(normalizedType),
                        new List<AddonPriceOption>()
                    );
                    products.Add(productId, product);
                }

                if (!reader.IsDBNull(4))
                {
                    product.Prices.Add(new AddonPriceOption(
                        reader.GetInt32(4),
                        reader.GetString(5),
                        reader.GetString(6),
                        reader.GetDecimal(7),
                        reader.GetDecimal(8),
                        reader.GetDecimal(9)
                    ));
                }
            }

            return new List<AddonCatalogProduct>(products.Values);
        }

        private static string NormalizeNewOrderType(string type)
        {
            return (type ?? "").Trim().ToLowerInvariant().Replace("_", "-", StringComparison.Ordinal);
        }

        private static bool IsCatalogNewOrderType(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => true,
                "managed-hosting" => true,
                "windows-vps" => true,
                "linux-vps" => true,
                "cloud" => true,
                "dedicated" => true,
                "reseller" => true,
                _ => false
            };
        }

        private static string NewOrderProductFilter(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "(p.product_type = @customerType OR p.product_type = 'individual') AND p.name LIKE 'W%US' AND p.name NOT LIKE 'W%LX-US' AND CAST(p.description AS nvarchar(max)) NOT LIKE '%Fully-Managed%'",
                "managed-hosting" => "(p.product_type = @customerType OR p.product_type = 'individual') AND p.name LIKE 'W%US' AND p.name NOT LIKE 'W%LX-US' AND CAST(p.description AS nvarchar(max)) LIKE '%Fully-Managed%'",
                "windows-vps" => "(p.product_type = @customerType OR p.product_type = 'individual') AND p.name LIKE 'V%US' AND CAST(p.description AS nvarchar(max)) LIKE '%VPS%' AND CAST(p.description AS nvarchar(max)) NOT LIKE '%Linux%'",
                "linux-vps" => "(p.product_type = @customerType OR p.product_type = 'individual') AND (p.name LIKE 'V%US' OR p.name LIKE 'LinuxVPS%') AND CAST(p.description AS nvarchar(max)) LIKE '%Linux%'",
                "cloud" => "(p.product_type = @customerType OR p.product_type = 'individual') AND (p.name LIKE 'LinuxCloud%US' OR CAST(p.description AS nvarchar(max)) LIKE '%Cloud%')",
                "dedicated" => "(p.product_type = @customerType OR p.product_type = 'individual') AND CAST(p.description AS nvarchar(max)) LIKE '%Xeon%'",
                "reseller" => "p.product_type = 'reseller' AND p.name LIKE 'Reseller%'",
                _ => ""
            };
        }

        private static string NewOrderTitle(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "Buy Hosting Account",
                "managed-hosting" => "Buy Managed Hosting",
                "windows-vps" => "Buy Windows VPS",
                "linux-vps" => "Buy Linux VPS",
                "cloud" => "Buy Cloud Server",
                "dedicated" => "Buy Dedicated Server",
                "reseller" => "Buy Reseller Account",
                "domain-purchase" => "Purchase New Domain",
                "domain-transfer" => "Transfer an Existing Domain",
                _ => "New Order"
            };
        }

        private static string NewOrderDescription(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "Start a new ASP.NET hosting plan with current plans and billing terms.",
                "managed-hosting" => "Get a managed hosting plan with hands-on server and application support.",
                "windows-vps" => "Order a Windows VPS for dedicated resources and full server control.",
                "linux-vps" => "Order a Linux VPS for flexible workloads and server-level access.",
                "cloud" => "Launch a cloud server with scalable compute capacity.",
                "dedicated" => "Reserve dedicated server hardware for high-performance workloads.",
                "reseller" => "Start a reseller account to sell hosting under your own customer base.",
                "domain-purchase" => "Search, register, and add a new domain name to your account.",
                "domain-transfer" => "Transfer an existing domain and renew it through your account.",
                _ => "Modern account panel order flow."
            };
        }

        private static string NewOrderLegacyPath(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "/account/cp_purchase_list",
                "managed-hosting" => "/account/cp_purchase_list_managed_hosting",
                "windows-vps" => "/account/cp_purchase_list_vps",
                "linux-vps" => "/account/cp_purchase_list_vps_linux",
                "cloud" => "/account/cp_purchase_list_cloud",
                "dedicated" => "/account/cp_purchase_list_dedi",
                "reseller" => "/account/cp_purchase_list_reseller",
                "domain-purchase" => "/account/domain_purchase",
                "domain-transfer" => "/account/domain_transfer",
                _ => ""
            };
        }

        private static async Task<List<AccountDomainSummary>> LoadAccountDomainsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT dp.id, dp.domain_name, dp.client_product_id, dp.status, dp.StartDate, dp.BuyYear,
       dp.RegisterStatus, dp.RegisterInfoID, dp.AddDate, cp.next_due_date, cp.status AS product_status
FROM domaincontroller.dbo.domain_profile dp
LEFT JOIN oms.dbo.client_product cp ON cp.client_product_id = dp.client_product_id
WHERE dp.customer_profile_id = @customerId
ORDER BY dp.domain_name";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var rows = new List<AccountDomainSummary>();

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var startDate = reader.IsDBNull(4) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(4));
                var buyYear = reader.IsDBNull(5) ? 1 : reader.GetInt32(5);
                var expirationDate = CalculateDomainExpiration(startDate, buyYear);
                var daysLeft = expirationDate == null ? (int?)null : expirationDate.Value.DayNumber - today.DayNumber;

                // Match legacy domain_list.asp: hide domains more than 40 days past expiration unless start date is the placeholder.
                if (daysLeft < -40 && startDate != new DateOnly(1900, 1, 1))
                {
                    continue;
                }

                var status = reader.IsDBNull(3) ? "unknown" : reader.GetString(3).Trim();
                if (daysLeft < 0 && startDate != null && startDate != new DateOnly(1900, 1, 1))
                {
                    status = "expired";
                }

                rows.Add(new AccountDomainSummary(
                    reader.GetInt32(0),
                    reader.GetString(1).Trim(),
                    reader.GetInt32(2),
                    status,
                    startDate,
                    expirationDate,
                    daysLeft,
                    reader.IsDBNull(6) ? "" : reader.GetString(6).Trim(),
                    reader.IsDBNull(7) ? 0 : reader.GetInt32(7),
                    reader.IsDBNull(8) ? null : DateOnly.FromDateTime(reader.GetDateTime(8)),
                    reader.IsDBNull(9) ? null : DateOnly.FromDateTime(reader.GetDateTime(9)),
                    reader.IsDBNull(10) ? "Unknown" : StatusLabel(reader.GetInt32(10))
                ));
            }

            return rows;
        }

        private static DateOnly? CalculateDomainExpiration(DateOnly? startDate, int buyYear)
        {
            if (startDate == null)
            {
                return null;
            }

            return startDate.Value.AddYears(Math.Max(buyYear, 1));
        }

        private static async Task<HostingSitesDashboard> LoadHostingSitesAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
WITH SelectedCp AS (
    SELECT TOP 1 cpID, cpLogin
    FROM dbo.cp_config
    WHERE customerID = @customerId
      AND ISNULL(hideit, 0) = 0
      AND status = 1
    ORDER BY cpID
)
SELECT cp.cpID, cp.cpLogin,
       s.site_Uid, s.site_name, s.Display_name, s.site_path, s.iis_status, s.running_status,
       s.version, s.phpversion, s.is_secure, s.isSubdomain, s.create_date,
       d.domain_Uid, d.domain_name, d.cdn, d.isDefault
FROM SelectedCp cp
INNER JOIN dbo.cp_config_Sites s ON s.cpID = cp.cpID
LEFT JOIN dbo.cp_config_Domains d ON d.site_Uid = s.site_Uid
ORDER BY s.site_Uid, ISNULL(d.isDefault, 0) DESC, d.create_date, d.domain_Uid";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            long cpId = 0;
            var cpLogin = "";
            var sites = new Dictionary<int, HostingSiteSummary>();

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                cpId = reader.GetInt64(0);
                cpLogin = reader.GetString(1);
                var siteUid = reader.GetInt32(2);

                if (!sites.TryGetValue(siteUid, out var site))
                {
                    var displayName = reader.IsDBNull(4) ? "" : reader.GetString(4).Trim();
                    var siteName = reader.GetString(3).Trim();
                    var isSecure = !reader.IsDBNull(10) && reader.GetBoolean(10);
                    var isSubdomain = !reader.IsDBNull(11) && reader.GetBoolean(11);

                    site = new HostingSiteSummary(
                        siteUid,
                        string.IsNullOrWhiteSpace(displayName) ? siteName : displayName,
                        siteName,
                        reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                        reader.IsDBNull(6) ? "Unknown" : reader.GetBoolean(6) ? "Active" : "Stopped",
                        reader.IsDBNull(7) ? "" : reader.GetString(7).Trim(),
                        reader.IsDBNull(8) ? "" : reader.GetString(8).Trim(),
                        reader.IsDBNull(9) ? "" : reader.GetString(9).Trim(),
                        isSecure,
                        isSubdomain,
                        reader.IsDBNull(12) ? null : DateOnly.FromDateTime(reader.GetDateTime(12)),
                        new List<HostingSiteDomainSummary>()
                    );
                    sites.Add(siteUid, site);
                }

                if (!reader.IsDBNull(13) && !reader.IsDBNull(14))
                {
                    var domain = reader.GetString(14).Trim();
                    if (!string.IsNullOrWhiteSpace(domain))
                    {
                        site.MappedDomains.Add(new HostingSiteDomainSummary(
                            reader.GetInt32(13),
                            domain,
                            $"{(site.IsSecure ? "https" : "http")}://{domain}/",
                            !reader.IsDBNull(15) && reader.GetBoolean(15),
                            !reader.IsDBNull(16) && reader.GetBoolean(16),
                            site.IsSecure
                        ));
                    }
                }
            }

            return new HostingSitesDashboard(cpId, cpLogin, new List<HostingSiteSummary>(sites.Values));
        }

        private static List<RenewalNoticeSummary> BuildRenewalNotices(List<HostingAccountSummary> hostingAccounts)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var notices = new List<RenewalNoticeSummary>();

            foreach (var account in hostingAccounts)
            {
                if (account.RenewalDate == null)
                {
                    continue;
                }

                var daysLeft = account.RenewalDate.Value.DayNumber - today.DayNumber;
                var label = daysLeft < 0 ? "Past due" : daysLeft <= 30 ? "Action needed" : "Upcoming";
                notices.Add(new RenewalNoticeSummary(account.CpLogin, account.ClientProductId, account.RenewalDate.Value, daysLeft, label));
            }

            return notices;
        }

        private static string StatusLabel(int status) => status switch
        {
            0 => "Pending",
            1 => "Active",
            2 => "Suspended",
            3 => "Canceled",
            4 => "Cancel pending",
            _ => "Unknown"
        };

        private sealed record LoginRequest(string Login, string Password);
        private sealed record OpenSrsSettings(string ApiUrl, string Username, string PrivateKey)
        {
            public bool IsConfigured =>
                !string.IsNullOrWhiteSpace(ApiUrl)
                && !string.IsNullOrWhiteSpace(Username)
                && !string.IsNullOrWhiteSpace(PrivateKey);
        }
        private sealed record LoginUser(long CustomerId, string Login, string CustomerType);
        private sealed record LoginResponse(bool Success, string Message, LoginUser? User);
        private sealed record DashboardResponse(bool Success, string Message, AccountDashboard? Dashboard);
        private sealed record AccountDomainsResponse(bool Success, string Message, List<AccountDomainSummary> Domains);
        private sealed record DomainAvailabilityRequest(List<string> Domains);
        private sealed record DomainAvailabilityResponse(bool Success, string Message, List<DomainAvailabilityResult> Results);
        private sealed record DomainAvailabilityResult(string DomainName, bool Available, string Reason, string Source);
        private sealed record DomainRegistrarActionRequest(string Action, string Value);
        private sealed record DomainDnsPreviewRequest(string Records);
        private sealed record DomainDnsPreviewResponse(bool Success, string Message, List<DomainDnsRecordPreview> Records);
        private sealed record DomainDnsRecordPreview(string Type, string Name, string Value, int? Priority, int Ttl);
        private sealed record DomainDnsParseResult(bool Success, string Message, List<DomainDnsRecordPreview> Records);
        private sealed record DomainCredential(string Username, string Password);
        private sealed record OpenSrsActionResult(bool Success, string Message);
        private sealed record OpenSrsCookieResult(bool Success, string Message, string Cookie);
        private sealed record AccountBillingResponse(bool Success, string Message, AccountBillingDashboard? Dashboard);
        private sealed record AccountRenewalsResponse(bool Success, string Message, List<AccountProductSummary> Renewals);
        private sealed record AccountActionResponse(bool Success, string Message);
        private sealed record RenewalCheckoutResponse(bool Success, string Message, RenewalCheckoutPreview? Renewal);
        private sealed record BillingInvoiceResponse(bool Success, string Message, BillingInvoiceDetail? Invoice);
        private sealed record CheckoutPreviewResponse(bool Success, string Message, CheckoutPreview? Preview);
        private sealed record CheckoutCreateResponse(bool Success, string Message, CheckoutOrder? Order);
        private sealed record CheckoutTempOrderResponse(bool Success, string Message, CheckoutTempOrder? Order);
        private sealed record AffiliateWithdrawResponse(bool Success, string Message, AffiliateWithdrawPreview? Preview);
        private sealed record AccountVpnResponse(bool Success, string Message, AccountVpnDashboard? Dashboard);
        private sealed record AccountAddonsResponse(bool Success, string Message, AccountAddonsDashboard? Dashboard);
        private sealed record AccountAffiliateResponse(bool Success, string Message, AccountAffiliateDashboard? Dashboard);
        private sealed record AccountSettingsResponse(bool Success, string Message, AccountSettingsDashboard? Dashboard);
        private sealed record NewOrderCatalogResponse(bool Success, string Message, NewOrderCatalog? Catalog);
        private sealed record HostingSitesResponse(bool Success, string Message, HostingSitesDashboard? Dashboard);
        private sealed record AccountDashboard(CustomerSummary Customer, List<HostingAccountSummary> HostingAccounts, List<HostingStatusCount> HostingStatusSummary, List<RenewalNoticeSummary> RenewalNotices, List<UrgentLogSummary> UrgentLogs);
        private sealed record CustomerSummary(long CustomerId, string Login, string CustomerType, string Status, string Name, string CompanyName, DateOnly? AccountStartDate);
        private sealed record HostingAccountSummary(long CpId, string CpLogin, string PrimaryDomain, string WebHostType, string ServerId, string Status, long ClientProductId, int ProductId, DateOnly? RenewalDate, int TotalSites, int AdditionalRam);
        private sealed record HostingStatusCount(string Status, int Count);
        private sealed record RenewalNoticeSummary(string Name, long ClientProductId, DateOnly RenewalDate, int DaysLeft, string Status);
        private sealed record UrgentLogSummary(int Id, long CustomerId, string CustomerLogin, string Message, DateTime CreatedAt);
        private sealed record AccountBillingDashboard(AccountBalanceSummary Balance, List<AccountProductSummary> ActiveProducts, List<AccountPurchaseSummary> Purchases, List<AccountProductSummary> RenewalNotices);
        private sealed record AccountBalanceSummary(decimal Amount, string Currency, string Source);
        private sealed record AccountProductSummary(int ClientProductId, int ProductId, string Name, string Description, string ProductType, DateOnly? NextDueDate, int? DaysLeft, string Status, DateOnly CreateDate, DateOnly LastUpdate, string PaymentTerm, decimal? Amount);
        private sealed record AccountPurchaseSummary(int OrderId, int ClientProductId, string Name, string Description, string PaymentTerm, string PaymentMethod, decimal Amount, string OrderStatus, string PaymentStatus, DateOnly CreateDate);
        private sealed record RenewalCheckoutPreview(int ClientProductId, int ProductId, string Name, string Description, string PaymentTerm, decimal Amount, string Currency, DateOnly? NextDueDate, string CheckoutUrl, string Note);
        private sealed record BillingInvoiceDetail(int OrderId, int ClientProductId, int ProductId, string Name, string ProductName, string Description, string PaymentTerm, string PaymentMethod, decimal Amount, decimal PaidAmount, decimal Fees, string OrderStatus, string PaymentStatus, DateOnly CreateDate, DateOnly? PaidDate, string TransactionCode);
        private sealed record CheckoutPreview(string CheckoutId, string Title, int ItemCount, decimal Total, string Currency, string CheckoutUrl, string Note, object Items);
        private sealed record CheckoutOrder(string Guid, string CheckoutUrl, string Title, decimal Amount, string Currency, int PageType, string Note);
        private sealed record CheckoutTempOrder(string Id, long CustomerId, int ProductId, string ProductName, decimal Amount, string Info1, string Info2, string Info3, string Info4, string Info5, int PageType, DateTime AddDate, bool IsPaid, bool Processed, bool Trackable);
        private sealed record DomainCheckoutRequest(List<DomainCheckoutItem> Domains);
        private sealed record DomainCheckoutItem(string DomainName, decimal Price);
        private sealed record AddonCheckoutRequest(List<AddonCheckoutItem> Items);
        private sealed record AddonCheckoutItem(int ProductId, int PriceId, int Quantity);
        private sealed record VpnCheckoutRequest(int ProductId, int PriceId, int Quantity);
        private sealed record VpnUserCreateRequest(string User, string Password, string Type, string Area);
        private sealed record VpnUserActionRequest(string Action);
        private sealed record NewOrderCheckoutRequest(string Type, int ProductId, int PriceId);
        private sealed record DomainTransferCheckoutRequest(string DomainName, bool WhoisPrivacy);
        private sealed record BillingDepositRequest(decimal Amount);
        private sealed record BillingTransferRequest(decimal Amount, string TargetLogin);
        private sealed record BillingTransferPreviewResponse(bool Success, string Message, BillingTransferPreview? Preview);
        private sealed record BillingTransferPreview(string TargetLogin, long? TargetCustomerId, decimal Amount, decimal AvailableBalance, bool Eligible, string Note);
        private sealed record CheckoutLineItem(int ProductId, string Name, string Term, int Quantity, decimal UnitAmount, string Currency);
        private sealed record AffiliateWithdrawRequest(decimal Amount, string Method);
        private sealed record AffiliateWithdrawPreview(decimal Amount, string Method, decimal AvailableCommission, int PaidReferralsThisYear, decimal MinimumAmount, bool Eligible, string Note);
        private sealed record AccountVpnDashboard(int Used, int Quota, List<AccountVpnServiceSummary> Services, List<AddonCatalogProduct> Catalog);
        private sealed record AccountVpnServiceSummary(long VpnClientId, string User, string Type, string Host, string Area, string DataCenter, string Status);
        private sealed record AccountAddonsDashboard(List<AddonCatalogProduct> Catalog, List<AccountProductSummary> ActiveAddons);
        private sealed record AddonCatalogProduct(int ProductId, string Name, string Description, string ProductType, string Category, List<AddonPriceOption> Prices);
        private sealed record AddonPriceOption(int PriceId, string Currency, string PaymentTerm, decimal SetupFee, decimal Amount, decimal OriginalAmount);
        private sealed record NewOrderCatalog(string Type, string Title, string LegacyPath, string Description, List<AddonCatalogProduct> Products);
        private sealed record DomainTransferQuote(int ProductId, string ProductName, string Currency, string PaymentTerm, decimal Amount);
        private sealed record AccountAffiliateDashboard(AffiliateSummary Summary, List<AffiliateReferralSummary> Referrals, List<AffiliateCommissionSummary> Commissions, List<AffiliatePayoutSummary> Payouts);
        private sealed record AffiliateSummary(int TotalReferrals, int PaidReferrals, int QualifiedFreeTrials, decimal PendingCommission, decimal CurrentCommission, decimal PaidOut, decimal AvailableCommission);
        private sealed record AffiliateReferralSummary(long CustomerId, string Login, DateOnly? AccountStartDate, string Status, bool IsPaid);
        private sealed record AffiliateCommissionSummary(int Id, int ClientProductId, string CustomerLogin, string ProductName, string Description, decimal Amount, DateOnly CreateDate, DateOnly ReleaseDate, bool IsReleased);
        private sealed record AffiliatePayoutSummary(int Id, string Method, string Description, decimal Amount, DateOnly CreateDate, string Paypal, string Status);
        private sealed record AccountSettingsDashboard(AccountSettingsProfile Profile, AccountTwoFactorSummary TwoFactor);
        private sealed record AccountSettingsProfile(long CustomerId, string Login, string CustomerType, string Status, string Name, string CompanyName, DateOnly? AccountStartDate, bool ReVerify, bool ReVerifySkip, int SecurityVersion, string EmailDisplay, string MobileNumber, string BrowserLanguage, string Vat);
        private sealed record AccountTwoFactorSummary(bool HasSecret, bool IsEnabled, DateOnly? EnterDate);
        private sealed record AccountPasswordChangeRequest(string CurrentPassword, string NewPassword, string ConfirmPassword);
        private sealed record AccountProfileUpdateRequest(string Name, string CompanyName, string MobileNumber, string BrowserLanguage, string Vat);
        private sealed record AccountDomainSummary(int Id, string DomainName, int ClientProductId, string Status, DateOnly? StartDate, DateOnly? ExpirationDate, int? DaysLeft, string RegisterStatus, int RegisterInfoId, DateOnly? AddDate, DateOnly? ProductNextDueDate, string ProductStatus);
        private sealed record HostingSitesDashboard(long CpId, string CpLogin, List<HostingSiteSummary> Sites);
        private sealed record HostingSiteSummary(int SiteUid, string SiteName, string RootName, string SitePath, string Status, string RunningStatus, string Version, string PhpVersion, bool IsSecure, bool IsSubdomain, DateOnly? CreateDate, List<HostingSiteDomainSummary> MappedDomains);
        private sealed record HostingSiteDomainSummary(int DomainUid, string Label, string Url, bool Cdn, bool IsDefault, bool Ssl);
    }
}
