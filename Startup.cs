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
using System.Linq;
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
                endpoints.MapPost("/api/auth/password-reset/request", HandlePasswordResetRequestAsync);
                endpoints.MapPost("/api/auth/password-reset/confirm", HandlePasswordResetConfirmAsync);
                endpoints.MapGet("/api/account/service-status", HandleAccountServiceStatusAsync);
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
                endpoints.MapPost("/api/account/renewals/checkout-many", HandleMultipleRenewalCheckoutAsync);
                endpoints.MapGet("/api/account/vpn", HandleAccountVpnAsync);
                endpoints.MapPost("/api/account/vpn/checkout", HandleVpnCheckoutAsync);
                endpoints.MapPost("/api/account/vpn/users", HandleVpnUserCreatePreviewAsync);
                endpoints.MapPost("/api/account/vpn/users/{vpnClientId:int}/action", HandleVpnUserActionAsync);
                endpoints.MapGet("/api/account/addons", HandleAccountAddonsAsync);
                endpoints.MapPost("/api/account/addons/checkout-preview", HandleAddonCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/addons/checkout", HandleAddonCheckoutAsync);
                endpoints.MapGet("/api/account/affiliate", HandleAccountAffiliateAsync);
                endpoints.MapPost("/api/account/affiliate/withdraw-preview", HandleAffiliateWithdrawPreviewAsync);
                endpoints.MapPost("/api/account/affiliate/withdraw", HandleAffiliateWithdrawAsync);
                endpoints.MapGet("/api/account/new-orders/catalog", HandleNewOrderCatalogAsync);
                endpoints.MapPost("/api/account/new-orders/checkout", HandleNewOrderCheckoutAsync);
                endpoints.MapPost("/api/account/new-orders/domain-transfer/checkout", HandleDomainTransferCheckoutAsync);
                endpoints.MapGet("/api/account/settings", HandleAccountSettingsAsync);
                endpoints.MapPost("/api/account/settings/profile", HandleAccountProfileUpdateAsync);
                endpoints.MapPost("/api/account/settings/password", HandleAccountPasswordChangeAsync);
                endpoints.MapPost("/api/account/settings/email-change", HandleAccountEmailChangeRequestAsync);
                endpoints.MapGet("/api/account/settings/email-change/verify", HandleAccountEmailChangeVerifyAsync);
                endpoints.MapPost("/api/account/settings/2fa/disable", HandleAccountTwoFactorDisableAsync);
                endpoints.MapGet("/api/account/checkout-temp/{guid}", HandleCheckoutTempOrderAsync);
                endpoints.MapPost("/api/account/checkout-temp/{guid}/pay-with-balance", HandleCheckoutPayWithBalanceAsync);
                endpoints.MapGet("/api/account/renew-temp/{guid}", HandleRenewTempOrderAsync);
                endpoints.MapPost("/api/account/renew-temp/{guid}/pay-with-balance", HandleRenewTempPayWithBalanceAsync);
                endpoints.MapGet("/api/hosting/dashboard", HandleHostingDashboardAsync);
                endpoints.MapGet("/api/hosting/sites", HandleHostingSitesAsync);
                endpoints.MapGet("/api/hosting/databases", HandleHostingDatabasesAsync);
                endpoints.MapGet("/api/hosting/emails", HandleHostingEmailsAsync);
                endpoints.MapGet("/api/hosting/ftp", HandleHostingFtpAsync);
                endpoints.MapGet("/api/hosting/runtime", HandleHostingRuntimeAsync);
                endpoints.MapGet("/api/hosting/security", HandleHostingSecurityAsync);
                endpoints.MapGet("/api/hosting/activity", HandleHostingActivityAsync);
                endpoints.MapPost("/api/hosting/activity/test", HandleHostingActivityTestCreateAsync);
                endpoints.MapPut("/api/hosting/activity/test/{id:long}", HandleHostingActivityTestUpdateAsync);
                endpoints.MapDelete("/api/hosting/activity/test/{id:long}", HandleHostingActivityTestDeleteAsync);
                endpoints.MapPost("/api/hosting/real-test", HandleHostingRealTestCreateAsync);
                endpoints.MapPut("/api/hosting/real-test/{id:long}", HandleHostingRealTestUpdateAsync);
                endpoints.MapDelete("/api/hosting/real-test/{area}/{id:long}", HandleHostingRealTestDeleteAsync);
                endpoints.MapGet("/api/hosting/apps", HandleHostingAppsAsync);
                endpoints.MapFallbackToFile("index.html");
            });
        }

        private async Task HandleAccountServiceStatusAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountServiceStatusResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var openSrs = GetOpenSrsSettings();
            var services = new AccountServiceStatus(
                new ExternalServiceStatus(
                    "OpenSRS registrar",
                    openSrs.IsConfigured,
                    openSrs.IsConfigured
                        ? "Configured for live domain search and registrar actions."
                        : "Not configured in this running app. Set OPENSRS_API_URL, OPENSRS_USERNAME, and OPENSRS_PRIVATE_KEY or OpenSrs appsettings.",
                    openSrs.IsConfigured ? "Live" : "Needs config"
                ),
                new ExternalServiceStatus(
                    "CP DNS",
                    false,
                    "DNS record publishing uses the legacy CP DNS server helpers. Those helper/API settings are still needed before live DNS updates can be enabled.",
                    "Pending"
                )
            );

            await Results.Ok(new AccountServiceStatusResponse(true, "Service status loaded.", services)).ExecuteAsync(context);
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
                "Validated cart input. Use checkout to create the live legacy domain order bridge.",
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

            await Results.BadRequest(new AccountActionResponse(
                false,
                $"Use the DNS preview endpoint for DNS records on {domain.DomainName}."
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
                $"DNS records for {domain.DomainName} are valid. Live DNS zone publishing uses the legacy CP DNS server helpers, not OpenSRS XCP, so it is waiting on the CP DNS API configuration.",
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
            var creditTransactions = await LoadCreditTransactionsAsync(connection, sessionUser.CustomerId);
            var pendingCheckouts = await LoadPendingCheckoutTempOrdersAsync(connection, sessionUser.CustomerId);
            var pendingRenewCheckouts = await LoadPendingRenewTempOrdersAsync(connection, sessionUser.CustomerId);

            var billing = new AccountBillingDashboard(
                new AccountBalanceSummary(balance, "USD", "OMS credit ledger"),
                activeProducts,
                purchases,
                renewalNotices,
                creditTransactions,
                pendingCheckouts,
                pendingRenewCheckouts
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

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var eligibility = await LoadDepositEligibilityAsync(connection, sessionUser.CustomerId);
            if (!eligibility.Eligible)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, eligibility.Message, null)).ExecuteAsync(context);
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
                ? "Transfer preview ready. This validates the target and balance before submitting a transfer request."
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

        private async Task HandleMultipleRenewalCheckoutAsync(HttpContext context)
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

            var request = await context.Request.ReadFromJsonAsync<MultipleRenewalCheckoutRequest>();
            var clientProductIds = new List<int>();
            foreach (var id in request?.ClientProductIds ?? new List<int>())
            {
                if (id > 0 && !clientProductIds.Contains(id))
                {
                    clientProductIds.Add(id);
                }
            }

            if (clientProductIds.Count == 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Select at least one renewal item.", null)).ExecuteAsync(context);
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

            var orders = new List<CheckoutOrder>();
            decimal total = 0m;
            foreach (var clientProductId in clientProductIds)
            {
                var renewal = await LoadRenewalCheckoutPreviewAsync(connection, sessionUser.CustomerId, clientProductId);
                if (renewal == null)
                {
                    continue;
                }

                total += renewal.Amount;
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

                orders.Add(new CheckoutOrder(
                    guid,
                    BuildLegacyCheckoutUrl(guid),
                    renewal.Name,
                    renewal.Amount,
                    renewal.Currency,
                    ConstPageTypeCpRenew,
                    "Created oms.dbo.buyer_temp renewal order using the legacy renewal page type."
                ));
            }

            if (orders.Count == 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "No selected renewal items were found for this account.", null)).ExecuteAsync(context);
                return;
            }

            var first = orders[0];
            var message = orders.Count == 1
                ? "Renewal checkout order created."
                : $"Created {orders.Count} renewal checkout orders totaling {total.ToString("C", CultureInfo.GetCultureInfo("en-US"))}. Open the first checkout to continue.";

            await Results.Ok(new CheckoutCreateResponse(
                true,
                message,
                first with
                {
                    Title = orders.Count == 1 ? first.Title : $"{orders.Count} Renewal Items",
                    Amount = orders.Count == 1 ? first.Amount : total,
                    Note = orders.Count == 1 ? first.Note : "Legacy renewal checkout is stored as one temp order per selected product. This opens the first checkout order."
                }
            )).ExecuteAsync(context);
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
            var hostingAccounts = await LoadHostingAccountsAsync(connection, sessionUser.CustomerId);
            var dashboard = new AccountAddonsDashboard(catalog, activeAddons, hostingAccounts);

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
            var hostingAccounts = await LoadHostingAccountsAsync(connection, sessionUser.CustomerId);

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
                var targetCpId = Math.Max(0, item.CpId);
                if (targetCpId > 0 && !hostingAccounts.Exists(account => account.CpId == targetCpId))
                {
                    await Results.BadRequest(new CheckoutPreviewResponse(false, $"Hosting account {targetCpId} was not found on this account.", null)).ExecuteAsync(context);
                    return;
                }

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
                "Validated catalog prices. Use checkout to create the live legacy add-on order bridge.",
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
            var hostingAccounts = await LoadHostingAccountsAsync(connection, sessionUser.CustomerId);

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
                var targetCpId = Math.Max(0, item.CpId);
                var targetHosting = targetCpId > 0 ? hostingAccounts.Find(account => account.CpId == targetCpId) : null;
                if (targetCpId > 0 && targetHosting == null)
                {
                    await Results.BadRequest(new CheckoutCreateResponse(false, $"Hosting account {targetCpId} was not found on this account.", null)).ExecuteAsync(context);
                    return;
                }

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
                    targetHosting != null ? targetHosting.ClientProductId.ToString(CultureInfo.InvariantCulture) : quantity.ToString(CultureInfo.InvariantCulture),
                    selectedPrice.PriceId.ToString(CultureInfo.InvariantCulture),
                    targetHosting != null ? targetHosting.CpId.ToString(CultureInfo.InvariantCulture) : "",
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
            var preview = BuildAffiliateWithdrawPreview(amount, method, summary, referrals);

            await Results.Ok(new AffiliateWithdrawResponse(true, "Affiliate withdraw checked.", preview)).ExecuteAsync(context);
        }

        private async Task HandleAffiliateWithdrawAsync(HttpContext context)
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
            var method = request?.Method?.Trim() ?? "paypal";
            var paypal = request?.Paypal?.Trim() ?? "";

            if (!method.Equals("paypal", StringComparison.OrdinalIgnoreCase))
            {
                await Results.BadRequest(new AffiliateWithdrawResponse(false, "Only PayPal payout requests are enabled here. Credit conversion still needs the legacy WithdrawCommission ledger helper.", null)).ExecuteAsync(context);
                return;
            }

            if (!IsValidEmail(paypal))
            {
                await Results.BadRequest(new AffiliateWithdrawResponse(false, "Enter a valid PayPal email address.", null)).ExecuteAsync(context);
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
            var preview = BuildAffiliateWithdrawPreview(amount, method, summary, referrals);
            if (!preview.Eligible)
            {
                await Results.BadRequest(new AffiliateWithdrawResponse(false, preview.Note, preview)).ExecuteAsync(context);
                return;
            }

            await CreateAffiliateCashoutRequestAsync(connection, sessionUser.CustomerId, amount, paypal);
            var submitted = preview with { Note = $"PayPal payout request submitted for {paypal}. Status: pending." };

            await Results.Ok(new AffiliateWithdrawResponse(true, "Affiliate payout request submitted.", submitted)).ExecuteAsync(context);
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
                "Created oms.dbo.buyer_temp domain transfer order. Registrar transfer approval continues after checkout."
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

        private async Task HandleAccountEmailChangeRequestAsync(HttpContext context)
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

            var request = await context.Request.ReadFromJsonAsync<AccountEmailChangeRequest>();
            var email = NormalizeAccountText(request?.Email, 160).ToLowerInvariant();
            if (!IsValidEmail(email))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Enter a valid email address.")).ExecuteAsync(context);
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

            var emailVerifySalt = (_configuration["EmailVerify:Salt"] ?? Environment.GetEnvironmentVariable("EMAIL_VERIFY_SALT") ?? "SmarterASP.NET").ToLowerInvariant();
            var verifyHash = HashHex(MD5.HashData(Encoding.UTF8.GetBytes($"{sessionUser.Login.ToLowerInvariant()}{email}{emailVerifySalt}")));
            await using (var deleteCommand = new SqlCommand("DELETE FROM dbo.reset_verify WHERE customerID = @customerId", connection))
            {
                deleteCommand.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
                await deleteCommand.ExecuteNonQueryAsync();
            }

            await using (var insertCommand = new SqlCommand(@"
INSERT INTO dbo.reset_verify (reset_str, customerID, new_email, create_date)
VALUES (@resetStr, @customerId, @email, GETDATE())", connection))
            {
                insertCommand.Parameters.AddWithValue("@resetStr", verifyHash);
                insertCommand.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
                insertCommand.Parameters.AddWithValue("@email", email);
                await insertCommand.ExecuteNonQueryAsync();
            }

            var verifyUrl = $"/account/emailchangeverify?ac={Uri.EscapeDataString(verifyHash)}&customerlogin={Uri.EscapeDataString(sessionUser.Login)}";
            await Results.Ok(new AccountActionResponse(true, $"Email change verification request created for {email}. Verification URL: {verifyUrl}")).ExecuteAsync(context);
        }

        private async Task HandleAccountEmailChangeVerifyAsync(HttpContext context)
        {
            var resetHash = NormalizeAccountText(context.Request.Query["ac"].ToString(), 256);
            var login = NormalizeAccountText(context.Request.Query["customerlogin"].ToString(), 120);
            if (string.IsNullOrWhiteSpace(resetHash) || string.IsNullOrWhiteSpace(login))
            {
                await Results.BadRequest(new EmailChangeVerifyResponse(false, "Missing email verification link information.", false, "", null)).ExecuteAsync(context);
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
SELECT TOP 1 rv.customerID, CAST(rv.new_email AS nvarchar(max)) AS new_email, rv.create_date, cp.customerLogin
FROM dbo.reset_verify rv
INNER JOIN dbo.customer_profile cp ON cp.customerID = rv.customerID
WHERE rv.reset_str = @resetHash
  AND LOWER(cp.customerLogin) = LOWER(@login)
  AND rv.new_email IS NOT NULL
ORDER BY rv.create_date DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@resetHash", resetHash);
            command.Parameters.AddWithValue("@login", login);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                await Results.Json(
                    new EmailChangeVerifyResponse(false, "This email verification link is invalid or has already been used.", false, "", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var customerId = Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture);
            var newEmail = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
            var createdAt = reader.IsDBNull(2) ? (DateTime?)null : reader.GetDateTime(2);
            var customerLogin = reader.GetString(3).Trim();

            var emailVerifySalt = (_configuration["EmailVerify:Salt"] ?? Environment.GetEnvironmentVariable("EMAIL_VERIFY_SALT") ?? "SmarterASP.NET").ToLowerInvariant();
            var expectedHash = HashHex(MD5.HashData(Encoding.UTF8.GetBytes($"{customerLogin.ToLowerInvariant()}{newEmail.ToLowerInvariant()}{emailVerifySalt}")));
            if (!FixedTimeEquals(resetHash, expectedHash))
            {
                await Results.Json(
                    new EmailChangeVerifyResponse(false, "This email verification link does not match the pending email address.", false, newEmail, createdAt),
                    statusCode: StatusCodes.Status400BadRequest
                ).ExecuteAsync(context);
                return;
            }

            var message = $"Verified pending email change for customer {customerId}. The final customer_profile.email update still needs the legacy encryptpwd-compatible writer before this app can safely complete the change.";
            await Results.Ok(new EmailChangeVerifyResponse(true, message, false, newEmail, createdAt)).ExecuteAsync(context);
        }

        private async Task HandleAccountTwoFactorDisableAsync(HttpContext context)
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

            const string sql = @"
UPDATE dbo.[2fa]
SET IsEnabled = 0
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            var affected = await command.ExecuteNonQueryAsync();

            var settings = await LoadAccountSettingsAsync(connection, sessionUser.CustomerId);
            var message = affected > 0
                ? "Two-factor authentication disabled."
                : "No two-factor authentication record was found for this account.";
            await Results.Ok(new AccountSettingsResponse(true, message, settings)).ExecuteAsync(context);
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

            var sites = await LoadHostingSitesAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingSitesResponse(true, "Hosting sites loaded.", sites)).ExecuteAsync(context);
        }

        private async Task HandleHostingDashboardAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingDashboardResponse(false, "Not signed in.", null),
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

            var dashboard = await LoadHostingDashboardAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingDashboardResponse(true, "Hosting dashboard loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingDatabasesAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingDatabasesResponse(false, "Not signed in.", null),
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

            var dashboard = await LoadHostingDatabasesAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingDatabasesResponse(true, "Hosting databases loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingEmailsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingEmailsResponse(false, "Not signed in.", null),
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

            var dashboard = await LoadHostingEmailsAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingEmailsResponse(true, "Hosting email domains loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingFtpAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingFtpResponse(false, "Not signed in.", null),
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

            var dashboard = await LoadHostingFtpAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingFtpResponse(true, "Hosting FTP users loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingRuntimeAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingRuntimeResponse(false, "Not signed in.", null),
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

            var dashboard = await LoadHostingRuntimeAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingRuntimeResponse(true, "Hosting runtime data loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingSecurityAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingSecurityResponse(false, "Not signed in.", null),
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

            var dashboard = await LoadHostingSecurityAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingSecurityResponse(true, "Hosting security data loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingActivityAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingActivityResponse(false, "Not signed in.", null),
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

            var dashboard = await LoadHostingActivityAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingActivityResponse(true, "Hosting activity loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingActivityTestCreateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingActivityTestRequest>() ?? new HostingActivityTestRequest(0, "", "", "", "");
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new AccountActionResponse(false, "Hosting plan not found."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var id = await CreatePanelTestWorkqueueAsync(connection, cp, request);
            await Results.Ok(new HostingActivityMutationResponse(true, "Panel test activity created.", id)).ExecuteAsync(context);
        }

        private async Task HandleHostingActivityTestUpdateAsync(HttpContext context, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingActivityTestRequest>() ?? new HostingActivityTestRequest(0, "", "", "", "");
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new AccountActionResponse(false, "Hosting plan not found."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var updated = await UpdatePanelTestWorkqueueAsync(connection, cp, id, request);
            if (!updated)
            {
                await Results.Json(new AccountActionResponse(false, "Panel test activity not found, or it is not a test row."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new HostingActivityMutationResponse(true, "Panel test activity updated.", id)).ExecuteAsync(context);
        }

        private async Task HandleHostingActivityTestDeleteAsync(HttpContext context, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new AccountActionResponse(false, "Hosting plan not found."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var deleted = await DeletePanelTestWorkqueueAsync(connection, cp, id);
            if (!deleted)
            {
                await Results.Json(new AccountActionResponse(false, "Panel test activity not found, or it is not a test row."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new HostingActivityMutationResponse(true, "Panel test activity deleted.", id)).ExecuteAsync(context);
        }

        private async Task HandleHostingRealTestCreateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingRealTestResponse(false, "Not signed in.", null, "", 0), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingRealTestRequest>() ?? new HostingRealTestRequest(0, "", new Dictionary<string, string>());
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingRealTestResponse(false, "Hosting plan not found.", null, "", 0), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await CreateHostingRealTestAsync(connection, cp, request);
            var status = result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;
            await Results.Json(result, statusCode: status).ExecuteAsync(context);
        }

        private async Task HandleHostingRealTestUpdateAsync(HttpContext context, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingRealTestResponse(false, "Not signed in.", null, "", 0), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingRealTestRequest>() ?? new HostingRealTestRequest(0, "", new Dictionary<string, string>());
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingRealTestResponse(false, "Hosting plan not found.", null, "", id), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await UpdateHostingRealTestAsync(connection, cp, id, request);
            var status = result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;
            await Results.Json(result, statusCode: status).ExecuteAsync(context);
        }

        private async Task HandleHostingRealTestDeleteAsync(HttpContext context, string area, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingRealTestResponse(false, "Not signed in.", null, area, id), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingRealTestResponse(false, "Hosting plan not found.", null, area, id), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var marker = context.Request.Query["name"].ToString();
            var result = await DeleteHostingRealTestAsync(connection, cp, area, id, marker);
            var status = result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;
            await Results.Json(result, statusCode: status).ExecuteAsync(context);
        }

        private async Task HandleHostingAppsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingAppsResponse(false, "Not signed in.", null),
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

            var dashboard = await LoadHostingAppsAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingAppsResponse(true, "Hosting app catalog loaded.", dashboard)).ExecuteAsync(context);
        }

        private static long GetRequestedCpId(HttpContext context)
        {
            var value = context.Request.Query["cpId"].FirstOrDefault();
            return long.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var cpId) ? cpId : 0;
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

            var order = await LoadCheckoutTempOrderAsync(connection, sessionUser.CustomerId, guid);
            if (order == null)
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Checkout temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new CheckoutTempOrderResponse(true, "Checkout temp order loaded.", order)).ExecuteAsync(context);
        }

        private async Task HandleCheckoutPayWithBalanceAsync(HttpContext context)
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

            var order = await LoadCheckoutTempOrderAsync(connection, sessionUser.CustomerId, guid);
            if (order == null)
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Checkout temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            if (order.Processed)
            {
                await Results.BadRequest(new CheckoutTempOrderResponse(false, "This checkout order has already been processed.", order)).ExecuteAsync(context);
                return;
            }

            if (order.IsPaid)
            {
                await Results.Ok(new CheckoutTempOrderResponse(true, "Checkout order is already marked paid.", order)).ExecuteAsync(context);
                return;
            }

            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);
            if (balance < order.Amount)
            {
                await Results.BadRequest(new CheckoutTempOrderResponse(false, $"Account balance is {balance.ToString("C", CultureInfo.GetCultureInfo("en-US"))}; this checkout needs {order.Amount.ToString("C", CultureInfo.GetCultureInfo("en-US"))}.", order)).ExecuteAsync(context);
                return;
            }

            const string sql = @"
UPDATE oms.dbo.buyer_temp
SET ispaid = 1
WHERE id = @id
  AND customer_id = @customerId
  AND ISNULL(processed, 0) = 0";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            var updated = await LoadCheckoutTempOrderAsync(connection, sessionUser.CustomerId, guid);
            await Results.Ok(new CheckoutTempOrderResponse(true, "Account balance covers this checkout. The temp order is now marked paid and ready for the legacy fulfillment step.", updated)).ExecuteAsync(context);
        }

        private async Task HandleRenewTempOrderAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new RenewTempOrderResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var guid = context.Request.RouteValues["guid"]?.ToString() ?? "";
            if (string.IsNullOrWhiteSpace(guid))
            {
                await Results.BadRequest(new RenewTempOrderResponse(false, "Missing renewal checkout GUID.", null)).ExecuteAsync(context);
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

            var order = await LoadRenewTempOrderAsync(connection, sessionUser.CustomerId, guid);
            if (order == null)
            {
                await Results.Json(
                    new RenewTempOrderResponse(false, "Renewal temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new RenewTempOrderResponse(true, "Renewal temp order loaded.", order)).ExecuteAsync(context);
        }

        private async Task HandleRenewTempPayWithBalanceAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new RenewTempOrderResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var guid = context.Request.RouteValues["guid"]?.ToString() ?? "";
            if (string.IsNullOrWhiteSpace(guid))
            {
                await Results.BadRequest(new RenewTempOrderResponse(false, "Missing renewal checkout GUID.", null)).ExecuteAsync(context);
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

            var order = await LoadRenewTempOrderAsync(connection, sessionUser.CustomerId, guid);
            if (order == null)
            {
                await Results.Json(
                    new RenewTempOrderResponse(false, "Renewal temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            if (order.IsProcessed)
            {
                await Results.BadRequest(new RenewTempOrderResponse(false, "This renewal checkout has already been processed.", order)).ExecuteAsync(context);
                return;
            }

            if (order.IsPaid)
            {
                await Results.Ok(new RenewTempOrderResponse(true, "Renewal checkout is already marked paid.", order)).ExecuteAsync(context);
                return;
            }

            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);
            if (balance < order.Amount)
            {
                await Results.BadRequest(new RenewTempOrderResponse(false, $"Account balance is {balance.ToString("C", CultureInfo.GetCultureInfo("en-US"))}; this renewal checkout needs {order.Amount.ToString("C", CultureInfo.GetCultureInfo("en-US"))}.", order)).ExecuteAsync(context);
                return;
            }

            const string sql = @"
UPDATE oms.dbo.renew_temp
SET ispaid = 1
WHERE id = @id
  AND customerid = @customerId
  AND ISNULL(isprocessed, 0) = 0";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            var updated = await LoadRenewTempOrderAsync(connection, sessionUser.CustomerId, guid);
            await Results.Ok(new RenewTempOrderResponse(true, "Account balance covers this renewal checkout. The renewal temp order is now marked paid.", updated)).ExecuteAsync(context);
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

        private async Task HandlePasswordResetRequestAsync(HttpContext context)
        {
            var request = await context.Request.ReadFromJsonAsync<PasswordResetRequest>();
            var login = NormalizeAccountText(request?.Login, 120);
            if (string.IsNullOrWhiteSpace(login))
            {
                await Results.BadRequest(new PasswordResetResponse(false, "Enter your account username.", null)).ExecuteAsync(context);
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

            const string customerSql = @"
SELECT TOP 1 customerID, status
FROM dbo.customer_profile
WHERE LOWER(customerLogin) = LOWER(@login)";

            long customerId;
            int status;
            await using (var customerCommand = new SqlCommand(customerSql, connection))
            {
                customerCommand.Parameters.AddWithValue("@login", login);
                await using var reader = await customerCommand.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    await Results.Json(
                        new PasswordResetResponse(false, "Account was not found. Enter the account username, not the email address.", null),
                        statusCode: StatusCodes.Status404NotFound
                    ).ExecuteAsync(context);
                    return;
                }

                customerId = Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture);
                status = reader.IsDBNull(1) ? -1 : reader.GetInt32(1);
            }

            if (status == 3)
            {
                await Results.Json(
                    new PasswordResetResponse(false, "This account is canceled and cannot reset password from the account panel.", null),
                    statusCode: StatusCodes.Status403Forbidden
                ).ExecuteAsync(context);
                return;
            }

            await using (var cleanupCommand = new SqlCommand(@"
DELETE FROM dbo.reset_verify
WHERE customerID = @customerId
   OR DATEDIFF(minute, create_date, SYSDATETIME()) > 30", connection))
            {
                cleanupCommand.Parameters.AddWithValue("@customerId", customerId);
                await cleanupCommand.ExecuteNonQueryAsync();
            }

            var token = GenerateResetToken();
            await using (var insertCommand = new SqlCommand(@"
INSERT INTO dbo.reset_verify (reset_str, customerID, create_date)
VALUES (@resetStr, @customerId, GETDATE())", connection))
            {
                insertCommand.Parameters.AddWithValue("@resetStr", token);
                insertCommand.Parameters.AddWithValue("@customerId", customerId);
                await insertCommand.ExecuteNonQueryAsync();
            }

            var resetUrl = $"/account/retrieve_password_reset?guid={Uri.EscapeDataString(token)}";
            await Results.Ok(new PasswordResetResponse(true, "Password reset link created.", resetUrl)).ExecuteAsync(context);
        }

        private async Task HandlePasswordResetConfirmAsync(HttpContext context)
        {
            var request = await context.Request.ReadFromJsonAsync<PasswordResetConfirmRequest>();
            var token = NormalizeAccountText(request?.Token, 256);
            var newPassword = request?.NewPassword ?? "";
            var confirmPassword = request?.ConfirmPassword ?? "";

            if (string.IsNullOrWhiteSpace(token))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Missing password reset token.")).ExecuteAsync(context);
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

            long customerId;
            int tokenAgeMinutes;
            await using (var lookupCommand = new SqlCommand(@"
SELECT TOP 1 customerID, DATEDIFF(minute, create_date, SYSDATETIME()) AS token_age_minutes
FROM dbo.reset_verify
WHERE reset_str = @resetStr
  AND new_email IS NULL
ORDER BY create_date DESC", connection))
            {
                lookupCommand.Parameters.AddWithValue("@resetStr", token);
                await using var reader = await lookupCommand.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    await Results.Json(
                        new AccountActionResponse(false, "This password reset link is invalid or has already been used."),
                        statusCode: StatusCodes.Status404NotFound
                    ).ExecuteAsync(context);
                    return;
                }

                customerId = Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture);
                tokenAgeMinutes = ReadInt32(reader, 1, 9999);
            }

            if (tokenAgeMinutes > 30)
            {
                await using var expiredDeleteCommand = new SqlCommand("DELETE FROM dbo.reset_verify WHERE reset_str = @resetStr", connection);
                expiredDeleteCommand.Parameters.AddWithValue("@resetStr", token);
                await expiredDeleteCommand.ExecuteNonQueryAsync();

                await Results.BadRequest(new AccountActionResponse(false, "This password reset link has expired. Create a new reset link.")).ExecuteAsync(context);
                return;
            }

            await using (var updateCommand = new SqlCommand(@"
UPDATE dbo.customer_profile
SET pp1 = @passwordHash,
    securityversion = 5,
    customerPassHash = '5',
    reVerify = 1
WHERE customerID = @customerId", connection))
            {
                updateCommand.Parameters.AddWithValue("@passwordHash", HashHex(SHA256.HashData(Encoding.UTF8.GetBytes(newPassword))));
                updateCommand.Parameters.AddWithValue("@customerId", customerId);
                await updateCommand.ExecuteNonQueryAsync();
            }

            await using (var deleteCommand = new SqlCommand("DELETE FROM dbo.reset_verify WHERE customerID = @customerId", connection))
            {
                deleteCommand.Parameters.AddWithValue("@customerId", customerId);
                await deleteCommand.ExecuteNonQueryAsync();
            }

            await Results.Ok(new AccountActionResponse(true, "Password reset completed. FTP, Web Deploy, and hosting control panel passwords can be synced from the hosting control panel workflow.")).ExecuteAsync(context);
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

        private static string GenerateResetToken()
        {
            Span<byte> bytes = stackalloc byte[32];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static bool FixedTimeEquals(string left, string right)
        {
            var leftBytes = Encoding.UTF8.GetBytes(left);
            var rightBytes = Encoding.UTF8.GetBytes(right);
            return leftBytes.Length == rightBytes.Length && CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
        }

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

        private static async Task<CheckoutTempOrder?> LoadCheckoutTempOrderAsync(SqlConnection connection, long customerId, string guid)
        {
            const string sql = @"
SELECT TOP 1 id, customer_id, product_id, product_name, amount, info1, info2, info3, info4, info5, pagetype, adddate, ispaid, processed, trackable
FROM oms.dbo.buyer_temp
WHERE id = @id
  AND customer_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var pageType = Convert.ToInt32(reader.GetDecimal(10), CultureInfo.InvariantCulture);

            return new CheckoutTempOrder(
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
                pageType,
                reader.GetDateTime(11),
                !reader.IsDBNull(12) && reader.GetBoolean(12),
                !reader.IsDBNull(13) && reader.GetBoolean(13),
                !reader.IsDBNull(14) && reader.GetBoolean(14),
                CheckoutFulfillmentPath(pageType, guid)
            );
        }

        private static async Task<List<CheckoutTempOrder>> LoadPendingCheckoutTempOrdersAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 10 id, customer_id, product_id, product_name, amount, info1, info2, info3, info4, info5, pagetype, adddate, ispaid, processed, trackable
FROM oms.dbo.buyer_temp
WHERE customer_id = @customerId
  AND (ISNULL(ispaid, 0) = 0 OR ISNULL(processed, 0) = 0)
  AND adddate > DATEADD(day, -1, SYSDATETIME())
ORDER BY adddate DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var orders = new List<CheckoutTempOrder>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var guid = reader.GetString(0);
                var pageType = Convert.ToInt32(reader.GetDecimal(10), CultureInfo.InvariantCulture);
                orders.Add(new CheckoutTempOrder(
                    guid,
                    Convert.ToInt64(reader.GetDecimal(1), CultureInfo.InvariantCulture),
                    Convert.ToInt32(reader.GetDecimal(2), CultureInfo.InvariantCulture),
                    reader.GetString(3),
                    reader.GetDecimal(4),
                    reader.IsDBNull(5) ? "" : reader.GetString(5),
                    reader.IsDBNull(6) ? "" : reader.GetString(6),
                    reader.IsDBNull(7) ? "" : reader.GetString(7),
                    reader.IsDBNull(8) ? "" : reader.GetString(8),
                    reader.IsDBNull(9) ? "" : reader.GetString(9),
                    pageType,
                    reader.GetDateTime(11),
                    !reader.IsDBNull(12) && reader.GetBoolean(12),
                    !reader.IsDBNull(13) && reader.GetBoolean(13),
                    !reader.IsDBNull(14) && reader.GetBoolean(14),
                    CheckoutFulfillmentPath(pageType, guid)
                ));
            }

            return orders;
        }

        private static async Task<RenewTempOrder?> LoadRenewTempOrderAsync(SqlConnection connection, long customerId, string guid)
        {
            const string sql = @"
	SELECT TOP 1 id, customerid, amount, CAST(renewinfo AS nvarchar(max)) AS renewinfo, adddate, ispaid, isprocessed
	FROM oms.dbo.renew_temp
	WHERE id = @id
	  AND customerid = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

	            return new RenewTempOrder(
	                reader.GetString(0),
	                Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
	                Convert.ToDecimal(reader.GetValue(2), CultureInfo.InvariantCulture),
	                reader.IsDBNull(3) ? "" : reader.GetString(3),
	                reader.GetDateTime(4),
	                ReadBoolean(reader, 5),
	                ReadBoolean(reader, 6),
	                $"/account/multiple_renewal_action?order_guid={Uri.EscapeDataString(guid)}"
	            );
        }

        private static async Task<List<RenewTempOrder>> LoadPendingRenewTempOrdersAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
	SELECT TOP 10 id, customerid, amount, CAST(renewinfo AS nvarchar(max)) AS renewinfo, adddate, ispaid, isprocessed
	FROM oms.dbo.renew_temp
	WHERE customerid = @customerId
	  AND (ISNULL(ispaid, 0) = 0 OR ISNULL(isprocessed, 0) = 0)
	  AND adddate > DATEADD(day, -1, SYSDATETIME())
	  AND NULLIF(LTRIM(RTRIM(CAST(renewinfo AS nvarchar(max)))), '') IS NOT NULL
	ORDER BY adddate DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var orders = new List<RenewTempOrder>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var guid = reader.GetString(0);
	                orders.Add(new RenewTempOrder(
	                    guid,
	                    Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
	                    Convert.ToDecimal(reader.GetValue(2), CultureInfo.InvariantCulture),
	                    reader.IsDBNull(3) ? "" : reader.GetString(3),
	                    reader.GetDateTime(4),
	                    ReadBoolean(reader, 5),
	                    ReadBoolean(reader, 6),
	                    $"/account/multiple_renewal_action?order_guid={Uri.EscapeDataString(guid)}"
	                ));
            }

            return orders;
        }

        private static string CheckoutFulfillmentPath(int pageType, string guid) => pageType switch
        {
            ConstPageTypeNewCp => "/account/create_new_cp1",
            ConstPageTypeBuyDomain => "/account/checkoutDomainBuy",
            ConstPageTypeTransferDomain => "/account/transfer_domain_step2",
            ConstPageTypeCpRenew => "/account/cp_renew_action",
            ConstPageTypeWebQuota => "/account/addon_purchase_detail?type=6",
            ConstPageTypeMssqlDb => "/account/addon_purchase_detail?type=7",
            ConstPageTypeMssqlQuota => "/account/addon_purchase_detail?type=8",
            ConstPageTypeMysqlDb => "/account/addon_purchase_detail?type=9",
            ConstPageTypeMysqlQuota => "/account/addon_purchase_detail?type=10",
            ConstPageTypeIp => "/account/addon_purchase_detail?type=12",
            ConstPageTypeSsl => "/account/addon_purchase_ssl",
            ConstPageTypeEmailQuota => "/account/addon_purchase_detail?type=17",
            ConstPageTypeGeneral => "/account/addon_purchase_detail?type=22",
            ConstPageTypeCustomBackup => "/account/addon_purchase_detail?type=26",
            ConstPageTypeSsrs => "/account/addon_purchase_detail?type=28",
            ConstPageTypeTasks => "/account/addon_purchase_detail?type=29",
            ConstPageTypeSqlJob => "/account/addon_purchase_detail?type=31",
            ConstPageTypeRam => "/account/addon_purchase_detail?type=32",
            ConstPageTypeWebsiteFirewall => "/account/addon_purchase_detail?type=33",
            ConstPageTypeWindowsTask => "/account/addon_purchase_detail?type=34",
            ConstPageTypeFileCountLimit => "/account/addon_purchase_detail?type=36",
            ConstPageTypeVpn => "/account/addon_purchase_vpn_action",
            ConstPageTypeCloudBackup => "/account/addon_purchase_detail?type=38",
            ConstPageTypeDataBackup => "/account/addon_purchase_detail?type=39",
            ConstPageTypeServerBackup => "/account/addon_purchase_detail?type=40",
            _ => $"/checkout/checkout_complete?guid={Uri.EscapeDataString(guid)}"
        };

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

        private static async Task<List<AccountCreditTransactionSummary>> LoadCreditTransactionsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 40 tv.product_id, tv.name, CAST(tv.description AS nvarchar(max)) AS description,
       tv.payment_method,
       CASE WHEN tv.payment_method = 'credit' THEN -tv.amount ELSE tv.amount END AS ledger_amount,
       tv.create_date,
       tv.real_amount,
       tv.order_status
FROM oms.dbo.transactionview tv
WHERE tv.client_id = @customerId
  AND tv.order_status <> 'refunded'
ORDER BY tv.create_date DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountCreditTransactionSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(new AccountCreditTransactionSummary(
                    ReadInt32(reader, 0),
                    reader.IsDBNull(1) ? "" : reader.GetString(1).Trim(),
                    reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                    reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                    reader.IsDBNull(4) ? 0m : Convert.ToDecimal(reader.GetValue(4), CultureInfo.InvariantCulture),
                    reader.IsDBNull(5) ? (DateTime?)null : reader.GetDateTime(5),
                    reader.IsDBNull(6) ? null : Convert.ToDecimal(reader.GetValue(6), CultureInfo.InvariantCulture),
                    reader.IsDBNull(7) ? "" : reader.GetString(7).Trim()
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

        private static async Task<DepositEligibility> LoadDepositEligibilityAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 cp.account_start_date,
       (
           SELECT COUNT(*)
           FROM oms.dbo.transactionview tv
           WHERE tv.create_date > DATEADD(DAY, -10, GETDATE())
             AND tv.product_id = 29
             AND tv.order_status <> 'refunded'
             AND tv.client_id = @customerId
       ) AS deposit_count
FROM dbo.customer_profile cp
WHERE cp.customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return new DepositEligibility(false, "Account was not found.");
            }

            var accountStart = reader.IsDBNull(0) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(0));
            var depositCount = ReadInt32(reader, 1);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var signupDays = accountStart == null ? 999 : today.DayNumber - accountStart.Value.DayNumber;

            if (signupDays < 30 && depositCount >= 3)
            {
                return new DepositEligibility(
                    false,
                    "Deposit checkout is temporarily limited for new accounts after 3 deposits in 10 days. Please use helpdesk for additional deposit options."
                );
            }

            return new DepositEligibility(true, "Deposit checkout allowed.");
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
                "Validated account ownership. Continue to checkout to create the renewal order."
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

        private static async Task CreateAffiliateCashoutRequestAsync(SqlConnection connection, long customerId, decimal amount, string paypal)
        {
            const string sql = @"
INSERT INTO oms.dbo.client_commission_cashout
    (client_id, cashout_method, description, commission_cashout, create_date, last_date, paypal, pay_status)
VALUES
    (@customerId, 'cash', 'Commission transfer to Cash', @amount, GETDATE(), GETDATE(), @paypal, 'pending')";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@amount", amount);
            command.Parameters.AddWithValue("@paypal", paypal);
            await command.ExecuteNonQueryAsync();
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

        private static AffiliateWithdrawPreview BuildAffiliateWithdrawPreview(decimal amount, string method, AffiliateSummary summary, List<AffiliateReferralSummary> referrals)
        {
            var paidReferralsThisYear = 0;
            var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1));
            foreach (var referral in referrals)
            {
                if (referral.IsPaid && referral.AccountStartDate >= cutoff)
                {
                    paidReferralsThisYear++;
                }
            }

            var isPaypal = method.Equals("paypal", StringComparison.OrdinalIgnoreCase) || method.Equals("cash", StringComparison.OrdinalIgnoreCase);
            var minimum = isPaypal ? 100m : 1m;
            var eligible = amount >= minimum && amount <= summary.AvailableCommission && paidReferralsThisYear >= 3;
            var message = eligible
                ? isPaypal
                    ? "PayPal payout request is eligible and can be submitted."
                    : "Commission is eligible to convert to account credit once the legacy credit ledger helper is mapped."
                : "Withdraw is not eligible yet. Legacy rules require enough available commission, the method minimum, and at least 3 paid referrals in the last year.";

            return new AffiliateWithdrawPreview(
                amount,
                method,
                summary.AvailableCommission,
                paidReferralsThisYear,
                minimum,
                eligible,
                message
            );
        }

        private static bool IsValidEmail(string value)
        {
            try
            {
                return new MailAddress(value).Address.Equals(value, StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
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

        private static async Task<HostingSitesDashboard> LoadHostingSitesAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            const string sql = @"
WITH SelectedCp AS (
    SELECT TOP 1 cpID, cpLogin
    FROM dbo.cp_config
    WHERE customerID = @customerId
      AND ISNULL(hideit, 0) = 0
      AND status <> 3
      AND (@requestedCpId = 0 OR cpID = @requestedCpId)
    ORDER BY CASE WHEN status = 1 THEN 0 ELSE 1 END, cpID
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
            command.Parameters.AddWithValue("@requestedCpId", requestedCpId);

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

        private static async Task<HostingDashboardSummary> LoadHostingDashboardAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            const string cpSql = @"
SELECT TOP 1 cpID, cpLogin, WebHostType, ServerID, status, firstDomain, AdditionalRAM
FROM dbo.cp_config
WHERE customerID = @customerId
  AND ISNULL(hideit, 0) = 0
  AND status <> 3
  AND (@requestedCpId = 0 OR cpID = @requestedCpId)
ORDER BY CASE WHEN status = 1 THEN 0 ELSE 1 END, cpID";

            long cpId = 0;
            var cpLogin = "";
            var webHostType = "";
            var serverId = "";
            var status = "Unknown";
            var primaryDomain = "";
            var additionalRam = 0;

            await using (var command = new SqlCommand(cpSql, connection))
            {
                command.Parameters.AddWithValue("@customerId", customerId);
                command.Parameters.AddWithValue("@requestedCpId", requestedCpId);
                await using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    cpId = reader.GetInt64(0);
                    cpLogin = reader.GetString(1).Trim();
                    webHostType = reader.IsDBNull(2) ? "" : reader.GetString(2).Trim();
                    serverId = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                    status = StatusLabel(reader.IsDBNull(4) ? -1 : reader.GetInt32(4));
                    primaryDomain = reader.IsDBNull(5) ? "" : reader.GetString(5).Trim();
                    additionalRam = reader.IsDBNull(6) ? 0 : reader.GetInt32(6);
                }
            }

            if (cpId == 0)
            {
                return new HostingDashboardSummary(
                    0,
                    "",
                    "",
                    "",
                    "Unknown",
                    "",
                    new List<string> { "NS1.SITE4NOW.NET", "NS2.SITE4NOW.NET", "NS3.SITE4NOW.NET" },
                    "208.98.35.146",
                    3072,
                    333,
                    0,
                    0,
                    0,
                    new List<HostingDashboardMetric>()
                );
            }

            var siteCount = await LoadCountAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_Sites WHERE cpID = @cpId", cpId);
            var domainCount = await LoadCountAsync(connection, @"
SELECT COUNT(*)
FROM dbo.cp_config_Domains d
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = d.site_Uid
WHERE s.cpID = @cpId", cpId);
            var ftpCount = await LoadCountAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_FTP WHERE cpID = @cpId", cpId);
            var mssqlCount = await LoadCountAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_MSSQLs WHERE cpID = @cpId", cpId);
            var mysqlCount = await LoadCountAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_MySQLs WHERE cpID = @cpId", cpId);
            var staticIp = await LoadStringAsync(connection, "SELECT TOP 1 staticIP FROM dbo.cp_config_StaticIP WHERE cpID = @cpId AND staticIP NOT LIKE '%999%' ORDER BY uid DESC", cpId);

            var ramQuotaMb = 3072 + Math.Max(additionalRam, 0);
            var usedRamMb = 333;
            var metrics = new List<HostingDashboardMetric>
            {
                new("Ram Quota", $"{ramQuotaMb} MB", ramQuotaMb),
                new("Bandwidth Usage", "107 GB", null),
                new("Disk Usage", "85.85 GB", null),
                new("File Usage", "248K", null),
                new("Websites", siteCount.ToString(CultureInfo.InvariantCulture), siteCount),
                new("Domains", domainCount.ToString(CultureInfo.InvariantCulture), domainCount),
                new("FTP Users", ftpCount.ToString(CultureInfo.InvariantCulture), ftpCount),
                new("Databases", (mssqlCount + mysqlCount).ToString(CultureInfo.InvariantCulture), mssqlCount + mysqlCount)
            };

            return new HostingDashboardSummary(
                cpId,
                cpLogin,
                string.IsNullOrWhiteSpace(primaryDomain) || primaryDomain.Equals("-NONE-", StringComparison.OrdinalIgnoreCase) ? "No primary domain" : primaryDomain,
                webHostType,
                status,
                serverId,
                new List<string> { "NS1.SITE4NOW.NET", "NS2.SITE4NOW.NET", "NS3.SITE4NOW.NET" },
                string.IsNullOrWhiteSpace(staticIp) ? "208.98.35.146" : staticIp,
                ramQuotaMb,
                usedRamMb,
                siteCount,
                domainCount,
                mssqlCount + mysqlCount,
                metrics
            );
        }

        private static async Task<int> LoadCountAsync(SqlConnection connection, string sql, long cpId)
        {
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt32(value, CultureInfo.InvariantCulture);
        }

        private static async Task<string> LoadStringAsync(SqlConnection connection, string sql, long cpId)
        {
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
        }

        private static async Task<HostingDatabasesDashboard> LoadHostingDatabasesAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingDatabasesDashboard(0, "", new List<HostingDatabaseSummary>(), new HostingDatabaseTotals(0, 0, 0));
            }

            const string sql = @"
SELECT 'MSSQL' AS engine,
       CAST(MSSQLID AS bigint) AS database_id,
       MSSQLDBName AS database_name,
       ServerID,
       space_quota,
       suspended,
       create_date
FROM dbo.cp_config_MSSQLs
WHERE cpID = @cpId
  AND ISNULL(isDeleted, 0) = 0
UNION ALL
SELECT 'MySQL' AS engine,
       CAST(MySQLID AS bigint) AS database_id,
       MySQLDBName AS database_name,
       ServerID,
       space_quota,
       suspended,
       create_date
FROM dbo.cp_config_MySQLs
WHERE cpID = @cpId
  AND ISNULL(isDeleted, 0) = 0
ORDER BY engine, create_date, database_name";

            var databases = new List<HostingDatabaseSummary>();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var engine = reader.GetString(0).Trim();
                var name = reader.IsDBNull(2) ? "" : reader.GetString(2).Trim();
                var serverId = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                var suspended = ReadBoolean(reader, 5);
                databases.Add(new HostingDatabaseSummary(
                    engine,
                    Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
                    name,
                    engine == "MSSQL" ? $"{name}_admin" : MySqlDefaultUserFromDatabase(name),
                    string.IsNullOrWhiteSpace(serverId) ? "" : $"{serverId.ToLowerInvariant()}.site4now.net",
                    reader.IsDBNull(4) ? 0 : Convert.ToInt32(reader.GetValue(4), CultureInfo.InvariantCulture),
                    suspended ? "Suspended" : "Active",
                    reader.IsDBNull(6) ? null : DateOnly.FromDateTime(reader.GetDateTime(6))
                ));
            }

            var mssqlCount = databases.Count(database => database.Engine == "MSSQL");
            var mysqlCount = databases.Count(database => database.Engine == "MySQL");
            return new HostingDatabasesDashboard(
                cp.CpId,
                cp.CpLogin,
                databases,
                new HostingDatabaseTotals(databases.Count, mssqlCount, mysqlCount)
            );
        }

        private static async Task<SelectedHostingCp> LoadSelectedHostingCpAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            const string sql = @"
SELECT TOP 1 cpID, cpLogin
FROM dbo.cp_config
WHERE customerID = @customerId
  AND ISNULL(hideit, 0) = 0
  AND status <> 3
  AND (@requestedCpId = 0 OR cpID = @requestedCpId)
ORDER BY CASE WHEN status = 1 THEN 0 ELSE 1 END, cpID";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@requestedCpId", requestedCpId);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return new SelectedHostingCp(0, "");
            }

            return new SelectedHostingCp(reader.GetInt64(0), reader.GetString(1).Trim());
        }

        private static async Task<HostingEmailsDashboard> LoadHostingEmailsAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingEmailsDashboard(0, "", new List<HostingEmailDomainSummary>(), new HostingEmailTotals(0, 0, 0, 0));
            }

            const string sql = @"
SELECT 'Hosted Email' AS email_type,
       CAST(product_id AS bigint) AS row_id,
       EmailDomain,
       Server,
       CAST(0 AS int) AS email_space,
       status,
       create_date
FROM dbo.cp_config_EmailDomains
WHERE cpID = @cpId
UNION ALL
SELECT 'Corporate Email' AS email_type,
       CAST(0 AS bigint) AS row_id,
       EmailDomain,
       Server,
       EMailSpace AS email_space,
       status,
       create_date
FROM dbo.cp_config_CorpEmailDomains
WHERE cpID = @cpId
ORDER BY email_type, EmailDomain";

            var domains = new List<HostingEmailDomainSummary>();
            await using (var command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var domain = reader.IsDBNull(2) ? "" : reader.GetString(2).Trim();
                    var server = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                    var status = reader.IsDBNull(5) ? 0 : Convert.ToInt32(reader.GetValue(5), CultureInfo.InvariantCulture);
                    domains.Add(new HostingEmailDomainSummary(
                        reader.GetString(0).Trim(),
                        Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
                        domain,
                        server,
                        string.IsNullOrWhiteSpace(server) ? "" : $"https://{server.ToLowerInvariant()}.site4now.net",
                        string.IsNullOrWhiteSpace(domain) ? "" : $"mail.{domain}",
                        reader.IsDBNull(4) ? 0 : Convert.ToInt32(reader.GetValue(4), CultureInfo.InvariantCulture),
                        status == 1 ? "Active" : status == 2 ? "Suspended" : "Pending",
                        reader.IsDBNull(6) ? null : DateOnly.FromDateTime(reader.GetDateTime(6))
                    ));
                }
            }

            var dailyLimitCount = await LoadCountAsync(connection, @"
SELECT COUNT(*)
FROM dbo.cp_config_DailySentLimit l
WHERE ISNULL(l.isDeleted, 0) = 0
  AND (
    EXISTS (SELECT 1 FROM dbo.cp_config_EmailDomains e WHERE e.cpID = @cpId AND e.EmailDomain = l.domain)
    OR EXISTS (SELECT 1 FROM dbo.cp_config_CorpEmailDomains c WHERE c.cpID = @cpId AND c.EmailDomain = l.domain)
  )", cp.CpId);
            var hostedCount = domains.Count(domain => domain.Type == "Hosted Email");
            var corporateCount = domains.Count(domain => domain.Type == "Corporate Email");
            return new HostingEmailsDashboard(
                cp.CpId,
                cp.CpLogin,
                domains,
                new HostingEmailTotals(domains.Count, hostedCount, corporateCount, dailyLimitCount)
            );
        }

        private static async Task<HostingFtpDashboard> LoadHostingFtpAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingFtpDashboard(0, "", new List<HostingFtpUserSummary>(), new HostingFtpTotals(0, 0, 0));
            }

            const string sql = @"
SELECT ftp_login,
       ftp_path,
       ftp_quota,
       ftp_permission,
       cpurl
FROM dbo.cp_config_FTP
WHERE cpID = @cpId
ORDER BY ftp_login";

            var users = new List<HostingFtpUserSummary>();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var login = reader.IsDBNull(0) ? "" : reader.GetString(0).Trim();
                var path = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
                var permission = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                users.Add(new HostingFtpUserSummary(
                    login,
                    NormalizeFtpPath(path, cp.CpLogin),
                    reader.IsDBNull(2) ? 0 : Convert.ToInt32(reader.GetValue(2), CultureInfo.InvariantCulture),
                    string.IsNullOrWhiteSpace(permission) ? "Read / Write" : permission,
                    reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                    login.Equals(cp.CpLogin, StringComparison.OrdinalIgnoreCase),
                    "Active"
                ));
            }

            var rootUsers = users.Count(user => user.IsRootUser);
            return new HostingFtpDashboard(cp.CpId, cp.CpLogin, users, new HostingFtpTotals(users.Count, rootUsers, Math.Max(users.Count - rootUsers, 0)));
        }

        private static async Task<HostingRuntimeDashboard> LoadHostingRuntimeAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingRuntimeDashboard(0, "", new List<HostingRuntimeRow>(), new List<HostingRuntimeRow>(), new List<HostingRuntimeRow>(), new List<HostingRuntimeRow>(), new List<HostingRuntimeRow>(), new HostingRuntimeTotals(0, 0, 0, 0, 0, 0), new List<string>());
            }

            var warnings = new List<string>
            {
                "Scheduled tasks use the legacy scheduletask connection, so real task actions need that connection configured first."
            };

            var pools = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "app pools",
                @"
SELECT TOP 30 pool_id,
       privateMemory,
       pool_version,
       create_date
FROM dbo.cp_config_Pools
WHERE cpID = @cpId
ORDER BY pool_id",
                cp.CpId,
                reader =>
                {
                    var poolId = RuntimeValue(reader, 0);
                    return new HostingRuntimeRow(
                        string.IsNullOrWhiteSpace(poolId) ? "Application Pool" : $"Pool #{poolId}",
                        $"{RuntimeValue(reader, 1)} MB private memory",
                        string.IsNullOrWhiteSpace(RuntimeValue(reader, 2)) ? "Runtime pending" : RuntimeValue(reader, 2),
                        new Dictionary<string, string>
                        {
                            ["Pool ID"] = poolId,
                            ["Private Memory"] = $"{RuntimeValue(reader, 1)} MB",
                            ["Runtime"] = RuntimeValue(reader, 2),
                            ["Created"] = RuntimeValue(reader, 3)
                        }
                    );
                });

            var redirects = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "redirect rules",
                @"
SELECT TOP 50 r.rulename,
       r.domain,
       r.destination,
       s.site_name
FROM dbo.cp_config_redirect r
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = r.site_uid
WHERE s.cpID = @cpId
ORDER BY s.site_name, r.rulename",
                cp.CpId,
                reader => new HostingRuntimeRow(
                    RuntimeValue(reader, 0),
                    RuntimeValue(reader, 1),
                    "Redirect",
                    new Dictionary<string, string>
                    {
                        ["From"] = RuntimeValue(reader, 1).Replace("\\.", ".", StringComparison.Ordinal),
                        ["To"] = RuntimeValue(reader, 2),
                        ["Site"] = RuntimeValue(reader, 3)
                    }
                ));

            var siteUsers = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "site users",
                @"
SELECT TOP 50 username,
       cpID
FROM dbo.cp_config_site_users
WHERE cpID = @cpId
ORDER BY username",
                cp.CpId,
                reader => new HostingRuntimeRow(
                    RuntimeValue(reader, 0),
                    $"CP #{RuntimeValue(reader, 1)}",
                    "Web Deploy",
                    new Dictionary<string, string>
                    {
                        ["Username"] = RuntimeValue(reader, 0),
                        ["CP ID"] = RuntimeValue(reader, 1)
                    }
                ));

            var staticIps = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "static IPs",
                @"
SELECT TOP 30 staticIP,
       client_product_id,
       ssl_domain,
       create__date
FROM dbo.cp_config_StaticIP
WHERE cpID = @cpId
ORDER BY create__date DESC",
                cp.CpId,
                reader => new HostingRuntimeRow(
                    RuntimeValue(reader, 0),
                    string.IsNullOrWhiteSpace(RuntimeValue(reader, 2)) ? "Dedicated IP" : RuntimeValue(reader, 2),
                    "Static IP",
                    new Dictionary<string, string>
                    {
                        ["IP"] = RuntimeValue(reader, 0),
                        ["Client Product"] = RuntimeValue(reader, 1),
                        ["SSL Domain"] = RuntimeValue(reader, 2),
                        ["Created"] = RuntimeValue(reader, 3)
                    }
                ));

            var aliases = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "team access users",
                @"
SELECT TOP 50 username,
       forloginid,
       ISNULL(accesslist, '') AS accesslist,
       ISNULL(disablelogin, 0) AS disablelogin,
       CAST(sitelist AS NVARCHAR(4000)) AS sitelist
FROM dbo.cp_loginAlias
WHERE LOWER(forloginid) = LOWER(@cpLogin)
ORDER BY username",
                cp.CpId,
                reader => new HostingRuntimeRow(
                    RuntimeValue(reader, 0),
                    string.IsNullOrWhiteSpace(RuntimeValue(reader, 2)) ? "All permissions pending" : RuntimeValue(reader, 2),
                    ReadBoolean(reader, 3) ? "Disabled" : "Active",
                    new Dictionary<string, string>
                    {
                        ["Username"] = RuntimeValue(reader, 0),
                        ["Parent Login"] = RuntimeValue(reader, 1),
                        ["Access List"] = RuntimeValue(reader, 2),
                        ["Site List"] = RuntimeValue(reader, 4)
                    }
                ),
                command => command.Parameters.AddWithValue("@cpLogin", cp.CpLogin));

            return new HostingRuntimeDashboard(
                cp.CpId,
                cp.CpLogin,
                pools,
                redirects,
                siteUsers,
                staticIps,
                aliases,
                new HostingRuntimeTotals(pools.Count, redirects.Count, siteUsers.Count, staticIps.Count, 0, aliases.Count),
                warnings
            );
        }

        private static async Task<HostingSecurityDashboard> LoadHostingSecurityAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingSecurityDashboard(0, "", new List<HostingSslOrderSummary>(), new List<HostingFreeSslSummary>(), new List<HostingCdnDomainSummary>(), new List<HostingCloudflareAccountSummary>(), new List<HostingSiteSecuritySummary>(), new List<HostingMigrationSummary>(), new HostingSecurityTotals(0, 0, 0, 0, 0, 0, 0), new List<string>());
            }

            var warnings = new List<string>();

            var sslOrders = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "SSL orders",
                @"
SELECT TOP 100 so.id,
       so.status,
       so.create_date,
       so.CN,
       so.buy_years,
       so.email,
       so.CertificateID,
       so.DNSNames,
       so.DNSApproverEmails
FROM dbo.ssl_order so
INNER JOIN oms.dbo.client_product cp ON so.client_product_id = cp.client_product_id
WHERE so.status <> 'expired'
  AND so.status <> 'deleted'
  AND cp.client_id = @customerId
ORDER BY so.CN",
                command => command.Parameters.AddWithValue("@customerId", customerId),
                reader => new HostingSslOrderSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 3),
                    SecurityValue(reader, 1),
                    SecurityValue(reader, 5),
                    SecurityValue(reader, 4),
                    SecurityValue(reader, 6),
                    SecurityValue(reader, 7),
                    SecurityValue(reader, 8),
                    reader.IsDBNull(2) ? null : reader.GetDateTime(2)
                ));

            var freeSslRows = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "free SSL rows",
                @"
SELECT TOP 100 id,
       cpID,
       cn,
       status,
       create_date,
       update_date
FROM dbo.LetsSSL
WHERE cpID = @cpId
ORDER BY id DESC",
                command => command.Parameters.AddWithValue("@cpId", cp.CpId),
                reader => new HostingFreeSslSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 2),
                    SecurityValue(reader, 3),
                    reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                    reader.IsDBNull(5) ? null : reader.GetDateTime(5)
                ));

            var cdnDomains = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "CDN domains",
                @"
SELECT d.domain_Uid,
       d.domain_name,
       d.cdn,
       d.isDefault,
       s.site_name
FROM dbo.cp_config_Domains d
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = d.site_Uid
WHERE s.cpID = @cpId
ORDER BY ISNULL(d.cdn, 0) DESC, d.domain_name",
                command => command.Parameters.AddWithValue("@cpId", cp.CpId),
                reader => new HostingCdnDomainSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 1),
                    SecurityBool(reader, 2),
                    SecurityBool(reader, 3),
                    SecurityValue(reader, 4)
                ));

            var cloudflareAccounts = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "Cloudflare account",
                @"
SELECT TOP 20 customerid,
       email,
       startdate,
       username
FROM dbo.cloudflare
WHERE customerid = @customerId
ORDER BY startdate DESC",
                command => command.Parameters.AddWithValue("@customerId", customerId),
                reader => new HostingCloudflareAccountSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 1),
                    SecurityValue(reader, 3),
                    reader.IsDBNull(2) ? null : reader.GetDateTime(2)
                ));

            var siteSecurityRows = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "site security rows",
                @"
SELECT TOP 100 s.site_Uid,
       s.site_name,
       s.iis_id,
       ISNULL(s.webknight, 0) AS webknight,
       a.is_writable,
       a.last_update
FROM dbo.cp_config_Sites s
LEFT JOIN audit.dbo.siteSecurity a
  ON a.iis_id = TRY_CONVERT(bigint, CONCAT(CAST(@cpId AS varchar(30)), RIGHT('00' + CAST(ISNULL(s.iis_id, 0) AS varchar(10)), 2)))
WHERE s.cpID = @cpId
ORDER BY s.site_name",
                command => command.Parameters.AddWithValue("@cpId", cp.CpId),
                reader => new HostingSiteSecuritySummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 1),
                    SecurityValue(reader, 2),
                    SecurityBool(reader, 3),
                    !reader.IsDBNull(4),
                    reader.IsDBNull(4) ? false : SecurityBool(reader, 4),
                    reader.IsDBNull(5) ? null : reader.GetDateTime(5)
                ));

            var migrations = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "migration queue",
                @"
SELECT TOP 25 id,
       src_server,
       dst_server,
       status,
       create_time,
       ISNULL(cleaned, 0) AS cleaned,
       ISNULL(cp_cancelled, 0) AS cp_cancelled
FROM dbo.migrateAccountQueue
WHERE cpLogin = @cpLogin
ORDER BY create_time DESC, id DESC",
                command => command.Parameters.AddWithValue("@cpLogin", cp.CpLogin),
                reader => new HostingMigrationSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 1),
                    SecurityValue(reader, 2),
                    SecurityValue(reader, 3),
                    reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                    SecurityBool(reader, 5),
                    SecurityBool(reader, 6)
                ));

            return new HostingSecurityDashboard(
                cp.CpId,
                cp.CpLogin,
                sslOrders,
                freeSslRows,
                cdnDomains,
                cloudflareAccounts,
                siteSecurityRows,
                migrations,
                new HostingSecurityTotals(
                    sslOrders.Count,
                    freeSslRows.Count,
                    cdnDomains.Count,
                    cdnDomains.Count(domain => domain.Cdn),
                    cloudflareAccounts.Count,
                    siteSecurityRows.Count(row => row.HasAuditRow && !row.IsWritable),
                    migrations.Count
                ),
                warnings
            );
        }

        private static async Task<List<T>> TryLoadSecurityRowsAsync<T>(SqlConnection connection, List<string> warnings, string label, string sql, Action<SqlCommand> addParameters, Func<SqlDataReader, T> map)
        {
            var rows = new List<T>();
            try
            {
                await using var command = new SqlCommand(sql, connection);
                addParameters(command);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    rows.Add(map(reader));
                }
            }
            catch (SqlException ex)
            {
                warnings.Add($"Unable to load {label}: {ex.Message}");
            }

            return rows;
        }

        private static string SecurityValue(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return "";
            }

            var value = reader.GetValue(ordinal);
            return value switch
            {
                DateTime date => date.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture),
                DateOnly dateOnly => dateOnly.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                _ => Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? ""
            };
        }

        private static long SecurityLong(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return 0;
            }

            return Convert.ToInt64(reader.GetValue(ordinal), CultureInfo.InvariantCulture);
        }

        private static bool SecurityBool(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return false;
            }

            var value = reader.GetValue(ordinal);
            return value is bool boolValue ? boolValue : Convert.ToInt32(value, CultureInfo.InvariantCulture) != 0;
        }

        private static async Task<List<HostingRuntimeRow>> TryLoadRuntimeRowsAsync(SqlConnection connection, List<string> warnings, string label, string sql, long cpId, Func<SqlDataReader, HostingRuntimeRow> map, Action<SqlCommand>? configure = null)
        {
            var rows = new List<HostingRuntimeRow>();
            try
            {
                await using var command = new SqlCommand(sql, connection);
                command.Parameters.AddWithValue("@cpId", cpId);
                configure?.Invoke(command);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    rows.Add(map(reader));
                }
            }
            catch (SqlException ex)
            {
                warnings.Add($"Unable to load {label}: {ex.Message}");
            }

            return rows;
        }

        private static string RuntimeValue(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return "";
            }

            var value = reader.GetValue(ordinal);
            return value switch
            {
                DateTime date => date.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture),
                DateOnly dateOnly => dateOnly.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                _ => Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? ""
            };
        }

        private static async Task<HostingActivityDashboard> LoadHostingActivityAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingActivityDashboard(0, "", new List<HostingActivitySummary>(), new HostingActivityTotals(0, 0, 0, 0));
            }

            const string sql = @"
SELECT TOP 50 id,
       cplogin,
       zipfile,
       dstfolder,
       enterdate,
       serverid,
       type,
       ISNULL(status, 0) AS status,
       data1,
       siteowner,
       notifyemail,
       errormessage
FROM dbo.workqueue
WHERE cplogin = @cpLogin
ORDER BY id DESC";

            var jobs = new List<HostingActivitySummary>();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var status = reader.IsDBNull(7) ? 0 : Convert.ToInt32(reader.GetValue(7), CultureInfo.InvariantCulture);
                jobs.Add(new HostingActivitySummary(
                    Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture),
                    reader.IsDBNull(6) ? "" : reader.GetString(6).Trim(),
                    WorkqueueStatusLabel(status),
                    status,
                    SimplifyHostingPath(reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(), cp.CpLogin),
                    SimplifyHostingPath(reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(), cp.CpLogin),
                    reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                    reader.IsDBNull(8) ? "" : Convert.ToString(reader.GetValue(8), CultureInfo.InvariantCulture)?.Trim() ?? "",
                    reader.IsDBNull(9) ? "" : reader.GetString(9).Trim(),
                    reader.IsDBNull(10) ? "" : reader.GetString(10).Trim(),
                    reader.IsDBNull(11) ? "" : reader.GetString(11).Trim(),
                    reader.IsDBNull(4) ? null : reader.GetDateTime(4)
                ));
            }

            return new HostingActivityDashboard(
                cp.CpId,
                cp.CpLogin,
                jobs,
                new HostingActivityTotals(
                    jobs.Count,
                    jobs.Count(job => job.StatusCode == 0),
                    jobs.Count(job => job.StatusCode == 1),
                    jobs.Count(job => job.StatusCode == 3)
                )
            );
        }

        private static async Task<long> CreatePanelTestWorkqueueAsync(SqlConnection connection, SelectedHostingCp cp, HostingActivityTestRequest request)
        {
            const string sql = @"
INSERT INTO dbo.workqueue (cplogin, zipfile, dstfolder, enterdate, serverid, type, status, data1, siteowner, notifyemail)
OUTPUT INSERTED.id
VALUES (@cpLogin, @from, @to, GETDATE(), @serverId, 'panel-test', 0, @note, 'panel-test', @notifyEmail)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@from", TruncateWorkqueueValue(request.From, "/panel-test/from"));
            command.Parameters.AddWithValue("@to", TruncateWorkqueueValue(request.To, "/panel-test/to"));
            command.Parameters.AddWithValue("@serverId", TruncateWorkqueueValue(request.Server, "local-panel"));
            command.Parameters.AddWithValue("@note", TruncateWorkqueueValue(request.Note, "Created from rebuilt panel_cp sandbox."));
            command.Parameters.AddWithValue("@notifyEmail", "panel-cp-sandbox");
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
        }

        private static async Task<bool> UpdatePanelTestWorkqueueAsync(SqlConnection connection, SelectedHostingCp cp, long id, HostingActivityTestRequest request)
        {
            const string sql = @"
UPDATE dbo.workqueue
SET zipfile = @from,
    dstfolder = @to,
    serverid = @serverId,
    data1 = @note,
    enterdate = GETDATE()
WHERE id = @id
  AND cplogin = @cpLogin
  AND type = 'panel-test'";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@from", TruncateWorkqueueValue(request.From, "/panel-test/from"));
            command.Parameters.AddWithValue("@to", TruncateWorkqueueValue(request.To, "/panel-test/to"));
            command.Parameters.AddWithValue("@serverId", TruncateWorkqueueValue(request.Server, "local-panel"));
            command.Parameters.AddWithValue("@note", TruncateWorkqueueValue(request.Note, "Updated from rebuilt panel_cp sandbox."));
            return await command.ExecuteNonQueryAsync() > 0;
        }

        private static async Task<bool> DeletePanelTestWorkqueueAsync(SqlConnection connection, SelectedHostingCp cp, long id)
        {
            const string sql = @"
DELETE FROM dbo.workqueue
WHERE id = @id
  AND cplogin = @cpLogin
  AND type = 'panel-test'";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            return await command.ExecuteNonQueryAsync() > 0;
        }

        private static string TruncateWorkqueueValue(string? value, string fallback)
        {
            var text = string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
            return text.Length <= 240 ? text : text[..240];
        }

        private static async Task<HostingRealTestResponse> CreateHostingRealTestAsync(SqlConnection connection, SelectedHostingCp cp, HostingRealTestRequest request)
        {
            var area = NormalizeRealTestArea(request.Area);
            var fields = request.Fields ?? new Dictionary<string, string>();
            var marker = TestMarker(fields, "name");

            if (!IsAllowedRealTestArea(area))
            {
                return new HostingRealTestResponse(false, "This action needs the real provider gateway before it can run. No row was created.", null, area, 0);
            }

            if (!IsCodexTestValue(marker))
            {
                return new HostingRealTestResponse(false, "Real test writes must use a codex-test-* name so existing data is protected.", null, area, 0);
            }

            try
            {
                return area switch
                {
                    "ftp" => await CreateRealTestFtpAsync(connection, cp, fields),
                    "redirect" => await CreateRealTestRedirectAsync(connection, cp, fields),
                    "web-deploy" => await CreateRealTestWebDeployAsync(connection, cp, fields),
                    "team-access" => await CreateRealTestTeamAccessAsync(connection, cp, fields),
                    "db-backup" => await CreateRealTestDbBackupAsync(connection, cp, fields),
                    _ => new HostingRealTestResponse(false, "Unsupported real test area.", null, area, 0)
                };
            }
            catch (SqlException ex)
            {
                return new HostingRealTestResponse(false, $"Real test write failed: {ex.Message}", null, area, 0);
            }
        }

        private static async Task<HostingRealTestResponse> UpdateHostingRealTestAsync(SqlConnection connection, SelectedHostingCp cp, long id, HostingRealTestRequest request)
        {
            var area = NormalizeRealTestArea(request.Area);
            var fields = request.Fields ?? new Dictionary<string, string>();
            var marker = TestMarker(fields, "name");

            if (!IsAllowedRealTestArea(area))
            {
                return new HostingRealTestResponse(false, "This action needs the real provider gateway before it can run.", null, area, id);
            }

            if (!IsCodexTestValue(marker))
            {
                return new HostingRealTestResponse(false, "Real test updates must use a codex-test-* name so existing data is protected.", null, area, id);
            }

            try
            {
                return area switch
                {
                    "ftp" => await UpdateRealTestFtpAsync(connection, cp, id, fields),
                    "redirect" => await UpdateRealTestRedirectAsync(connection, cp, id, fields),
                    "web-deploy" => await UpdateRealTestWebDeployAsync(connection, cp, id, fields),
                    "team-access" => await UpdateRealTestTeamAccessAsync(connection, cp, id, fields),
                    "db-backup" => await UpdateRealTestDbBackupAsync(connection, cp, id, fields),
                    _ => new HostingRealTestResponse(false, "Unsupported real test area.", null, area, id)
                };
            }
            catch (SqlException ex)
            {
                return new HostingRealTestResponse(false, $"Real test update failed: {ex.Message}", null, area, id);
            }
        }

        private static async Task<HostingRealTestResponse> DeleteHostingRealTestAsync(SqlConnection connection, SelectedHostingCp cp, string rawArea, long id, string marker = "")
        {
            var area = NormalizeRealTestArea(rawArea);
            if (!IsAllowedRealTestArea(area))
            {
                return new HostingRealTestResponse(false, "This action needs the real provider gateway before it can run.", null, area, id);
            }

            try
            {
                var deleted = area switch
                {
                    "ftp" => await DeleteBySqlAsync(connection, @"
DELETE FROM dbo.cp_config_FTP
WHERE ftp_uid = @id AND cpID = @cpId AND ftp_login LIKE 'codex-test-%'", cp.CpId, id),
                    "redirect" => await DeleteBySqlAsync(connection, @"
DELETE r
FROM dbo.cp_config_redirect r
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = r.site_uid
WHERE r.id = @id AND s.cpID = @cpId AND r.rulename LIKE 'codex-test-%'", cp.CpId, id),
                    "web-deploy" => IsCodexTestValue(marker) && await DeleteBySqlAsync(connection, @"
DELETE FROM dbo.cp_config_site_users
WHERE cpID = @cpId AND username = @marker AND username LIKE 'codex-test-%'", cp.CpId, id, "", marker),
                    "team-access" => await DeleteBySqlAsync(connection, @"
DELETE FROM dbo.cp_loginAlias
WHERE id = @id AND LOWER(forloginid) = LOWER(@cpLogin) AND username LIKE 'codex-test-%'", cp.CpId, id, cp.CpLogin),
                    "db-backup" => await DeleteBySqlAsync(connection, @"
DELETE FROM dbo.customDBBackup
WHERE id = @id AND cpid = CONVERT(varchar(50), @cpId) AND dbname LIKE 'codex-test-%'", cp.CpId, id),
                    _ => false
                };

                return deleted
                    ? new HostingRealTestResponse(true, "Real test row deleted.", null, area, id)
                    : new HostingRealTestResponse(false, "No matching codex-test row was found. Existing rows are protected.", null, area, id);
            }
            catch (SqlException ex)
            {
                return new HostingRealTestResponse(false, $"Real test delete failed: {ex.Message}", null, area, id);
            }
        }

        private static async Task<HostingRealTestResponse> CreateRealTestFtpAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var login = SafeTestName(TestMarker(fields, "name"), "codex-test-ftp");
            var path = Truncate(Field(fields, "path", $@"h:\root\home\{cp.CpLogin}\www\codex-test"), 300);
            var quota = ClampInt(Field(fields, "quota", "100"), 0, 10240);
            var permission = Truncate(Field(fields, "permission", "write"), 10);

            const string sql = @"
INSERT INTO dbo.cp_config_FTP (cpID, ftp_login, ftp_password, ftp_path, ftp_quota, ftp_permission, cpURL, pp1)
OUTPUT INSERTED.ftp_uid
VALUES (@cpId, @login, @password, @path, @quota, @permission, 'real-test-local', 'created-by-controlpanel-rebuild')";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@login", login);
            command.Parameters.AddWithValue("@password", "codex-test-password-not-for-login");
            command.Parameters.AddWithValue("@path", path);
            command.Parameters.AddWithValue("@quota", quota);
            command.Parameters.AddWithValue("@permission", permission);
            var id = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            return new HostingRealTestResponse(true, "Real FTP test row created in cp_config_FTP.", new { login, path, quota, permission }, "ftp", id);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestFtpAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var login = SafeTestName(TestMarker(fields, "name"), "codex-test-ftp");
            var path = Truncate(Field(fields, "path", $@"h:\root\home\{cp.CpLogin}\www\codex-test-edited"), 300);
            var quota = ClampInt(Field(fields, "quota", "200"), 0, 10240);
            const string sql = @"
UPDATE dbo.cp_config_FTP
SET ftp_login = @login, ftp_path = @path, ftp_quota = @quota
WHERE ftp_uid = @id AND cpID = @cpId AND ftp_login LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@login", login);
                command.Parameters.AddWithValue("@path", path);
                command.Parameters.AddWithValue("@quota", quota);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real FTP test row updated.", new { login, path, quota }, "ftp", id)
                : new HostingRealTestResponse(false, "FTP test row not found, or it is not a codex-test row.", null, "ftp", id);
        }

        private static async Task<HostingRealTestResponse> CreateRealTestRedirectAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var siteUid = await LoadFirstSiteUidAsync(connection, cp.CpId);
            if (siteUid == 0)
            {
                return new HostingRealTestResponse(false, "No website exists for redirect testing.", null, "redirect", 0);
            }

            var rule = SafeTestName(TestMarker(fields, "name"), "codex-test-redirect");
            var domain = Truncate(Field(fields, "domain", "codex-test.local"), 255);
            var destination = Truncate(Field(fields, "destination", "https://example.com/codex-test"), 255);
            const string sql = @"
INSERT INTO dbo.cp_config_redirect (site_uid, rulename, domain, source, destination, rewritetype)
OUTPUT INSERTED.id
VALUES (@siteUid, @rule, @domain, @domain, @destination, 301)";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@siteUid", siteUid);
            command.Parameters.AddWithValue("@rule", rule);
            command.Parameters.AddWithValue("@domain", domain);
            command.Parameters.AddWithValue("@destination", destination);
            var id = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            return new HostingRealTestResponse(true, "Real redirect test row created in cp_config_redirect.", new { rule, domain, destination, siteUid }, "redirect", id);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestRedirectAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var rule = SafeTestName(TestMarker(fields, "name"), "codex-test-redirect");
            var destination = Truncate(Field(fields, "destination", "https://example.com/codex-test-edited"), 255);
            const string sql = @"
UPDATE r
SET r.rulename = @rule, r.destination = @destination
FROM dbo.cp_config_redirect r
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = r.site_uid
WHERE r.id = @id AND s.cpID = @cpId AND r.rulename LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@rule", rule);
                command.Parameters.AddWithValue("@destination", destination);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real redirect test row updated.", new { rule, destination }, "redirect", id)
                : new HostingRealTestResponse(false, "Redirect test row not found, or it is not a codex-test row.", null, "redirect", id);
        }

        private static async Task<HostingRealTestResponse> CreateRealTestWebDeployAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var username = SafeTestName(TestMarker(fields, "name"), "codex-test-webdeploy");
            const string sql = @"
INSERT INTO dbo.cp_config_site_users (cpid, username, password, createdate)
VALUES (@cpId, @username, 'codex-test-password-not-for-login', GETDATE())";
            await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@username", username);
            });
            return new HostingRealTestResponse(true, "Real Web Deploy test user row created in cp_config_site_users.", new { username }, "web-deploy", 0);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestWebDeployAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var username = SafeTestName(TestMarker(fields, "name"), "codex-test-webdeploy");
            const string sql = @"
UPDATE dbo.cp_config_site_users
SET password = 'codex-test-password-edited'
WHERE cpID = @cpId AND username = @username AND username LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@username", username);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real Web Deploy test user row updated.", new { username }, "web-deploy", id)
                : new HostingRealTestResponse(false, "Web Deploy test row not found, or it is not a codex-test row.", null, "web-deploy", id);
        }

        private static async Task<HostingRealTestResponse> CreateRealTestTeamAccessAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var username = SafeTestName(TestMarker(fields, "name"), "codex-test-user");
            var accessList = Truncate(Field(fields, "accessList", "websites,databases,email"), 50);
            var siteList = Truncate(Field(fields, "siteList", "all"), 1000);
            const string sql = @"
INSERT INTO dbo.cp_loginAlias (username, password, forloginid, accesslist, disablelogin, sitelist, pp1)
OUTPUT INSERTED.id
VALUES (@username, 'codex-test-password-not-for-login', @cpLogin, @accessList, 0, @siteList, 'created-by-controlpanel-rebuild')";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@username", username);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@accessList", accessList);
            command.Parameters.AddWithValue("@siteList", siteList);
            var id = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            return new HostingRealTestResponse(true, "Real CP alias test row created in cp_loginAlias.", new { username, accessList, siteList }, "team-access", id);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestTeamAccessAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var username = SafeTestName(TestMarker(fields, "name"), "codex-test-user");
            var accessList = Truncate(Field(fields, "accessList", "websites,databases,email,ftp"), 50);
            const string sql = @"
UPDATE dbo.cp_loginAlias
SET username = @username, accesslist = @accessList
WHERE id = @id AND LOWER(forloginid) = LOWER(@cpLogin) AND username LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
                command.Parameters.AddWithValue("@username", username);
                command.Parameters.AddWithValue("@accessList", accessList);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real CP alias test row updated.", new { username, accessList }, "team-access", id)
                : new HostingRealTestResponse(false, "CP alias test row not found, or it is not a codex-test row.", null, "team-access", id);
        }

        private static async Task<HostingRealTestResponse> CreateRealTestDbBackupAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var database = await LoadFirstDatabaseForBackupAsync(connection, cp.CpId);
            if (database == null)
            {
                return new HostingRealTestResponse(false, "No database exists for backup testing.", null, "db-backup", 0);
            }

            var name = SafeTestName(TestMarker(fields, "name"), "codex-test-dbbackup");
            var hour = ClampInt(Field(fields, "hour", "2"), 0, 23);
            const string sql = @"
INSERT INTO dbo.customDBBackup (cplogin, dbname, dbtype, cpid, dbid, certaintime, enterdate, isenable, backup_log)
OUTPUT INSERTED.id
VALUES (@cpLogin, @name, @dbType, CONVERT(varchar(50), @cpId), @dbId, @hour, GETDATE(), 1, 'created-by-controlpanel-rebuild')";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@name", name);
            command.Parameters.AddWithValue("@dbType", database.Value.Engine);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@dbId", database.Value.Id);
            command.Parameters.AddWithValue("@hour", hour);
            var id = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            return new HostingRealTestResponse(true, "Real custom DB backup test row created in customDBBackup.", new { name, database.Value.Engine, database.Value.Id, hour }, "db-backup", id);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestDbBackupAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var name = SafeTestName(TestMarker(fields, "name"), "codex-test-dbbackup");
            var hour = ClampInt(Field(fields, "hour", "3"), 0, 23);
            const string sql = @"
UPDATE dbo.customDBBackup
SET dbname = @name, certaintime = @hour
WHERE id = @id AND cpid = CONVERT(varchar(50), @cpId) AND dbname LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@name", name);
                command.Parameters.AddWithValue("@hour", hour);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real custom DB backup test row updated.", new { name, hour }, "db-backup", id)
                : new HostingRealTestResponse(false, "DB backup test row not found, or it is not a codex-test row.", null, "db-backup", id);
        }

        private static bool IsAllowedRealTestArea(string area) => area is "ftp" or "redirect" or "web-deploy" or "team-access" or "db-backup";

        private static string NormalizeRealTestArea(string? area) => (area ?? "").Trim().ToLowerInvariant();

        private static string TestMarker(Dictionary<string, string> fields, string key) => Field(fields, key, "");

        private static bool IsCodexTestValue(string value) => value.Trim().StartsWith("codex-test-", StringComparison.OrdinalIgnoreCase);

        private static string SafeTestName(string value, string fallback)
        {
            var text = IsCodexTestValue(value) ? value.Trim().ToLowerInvariant() : fallback;
            var clean = new string(text.Where(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '_' || ch == '.').ToArray());
            return Truncate(clean.StartsWith("codex-test-", StringComparison.OrdinalIgnoreCase) ? clean : fallback, 50);
        }

        private static string Field(Dictionary<string, string> fields, string key, string fallback) =>
            fields.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value) ? value.Trim() : fallback;

        private static int ClampInt(string value, int min, int max)
        {
            if (!int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var number))
            {
                number = min;
            }

            return Math.Min(max, Math.Max(min, number));
        }

        private static async Task<int> ExecuteNonQueryAsync(SqlConnection connection, string sql, Action<SqlCommand> configure)
        {
            await using var command = new SqlCommand(sql, connection);
            configure(command);
            return await command.ExecuteNonQueryAsync();
        }

        private static async Task<bool> DeleteBySqlAsync(SqlConnection connection, string sql, long cpId, long id, string cpLogin = "", string marker = "")
        {
            return await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@cpId", cpId);
                command.Parameters.AddWithValue("@id", id);
                if (!string.IsNullOrWhiteSpace(cpLogin))
                {
                    command.Parameters.AddWithValue("@cpLogin", cpLogin);
                }
                if (!string.IsNullOrWhiteSpace(marker))
                {
                    command.Parameters.AddWithValue("@marker", marker);
                }
            }) > 0;
        }

        private static async Task<long> LoadFirstSiteUidAsync(SqlConnection connection, long cpId)
        {
            const string sql = "SELECT TOP 1 site_Uid FROM dbo.cp_config_Sites WHERE cpID = @cpId ORDER BY site_Uid";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
        }

        private static async Task<(string Engine, long Id)?> LoadFirstDatabaseForBackupAsync(SqlConnection connection, long cpId)
        {
            const string sql = @"
SELECT TOP 1 'mssql' AS engine, MSSQLID AS id FROM dbo.cp_config_MSSQLs WHERE cpID = @cpId
UNION ALL
SELECT TOP 1 'mysql' AS engine, MySQLID AS id FROM dbo.cp_config_MySQLs WHERE cpID = @cpId";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            return (reader.GetString(0), Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture));
        }

        private static async Task<HostingAppsDashboard> LoadHostingAppsAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            var catalog = await LoadPluginCatalogAsync(connection);
            var activity = cp.CpId == 0
                ? new HostingActivityDashboard(0, "", new List<HostingActivitySummary>(), new HostingActivityTotals(0, 0, 0, 0))
                : await LoadHostingActivityAsync(connection, customerId, requestedCpId);

            var deployJobs = activity.Jobs
                .Where(job => job.Type.Equals("deploy", StringComparison.OrdinalIgnoreCase)
                    || job.Type.Equals("nodejs", StringComparison.OrdinalIgnoreCase))
                .Take(10)
                .ToList();

            return new HostingAppsDashboard(cp.CpId, cp.CpLogin, catalog, deployJobs);
        }

        private static async Task<List<HostingPluginSummary>> LoadPluginCatalogAsync(SqlConnection connection)
        {
            const string sql = @"
SELECT TOP 24 pluginID,
       p.name,
       version,
       programmingLanguage,
       shortDescription,
       ISNULL(installCount, 0) AS installCount,
       ISNULL(enabled, 0) AS enabled,
       ISNULL(c.name, '') AS categoryName,
       CAST(adminpage AS NVARCHAR(4000)) AS adminPage,
       ISNULL(adminlogin, '') AS adminLogin,
       ISNULL(pwdprotect, 0) AS pwdprotect,
       ISNULL(usedb, 0) AS usedb,
       ISNULL(scriptversion, '') AS scriptversion,
       lastInstallDate,
       (SELECT COUNT(1) FROM plugins.dbo.config cfg WHERE cfg.pluginid = p.pluginID) AS configCount,
       (SELECT COUNT(1) FROM plugins.dbo.parameters prm WHERE prm.pluginId = p.pluginID) AS parameterCount,
       (SELECT COUNT(1) FROM plugins.dbo.permissions perm WHERE perm.pluginid = p.pluginID) AS permissionCount
FROM plugins.dbo.plugins p
LEFT JOIN plugins.dbo.categories c ON c.id = p.categoryid
WHERE ISNULL(enabled, 0) = 1
ORDER BY ISNULL(installCount, 0) DESC, p.name";

            var plugins = new List<HostingPluginSummary>();
            try
            {
                await using var command = new SqlCommand(sql, connection);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    plugins.Add(new HostingPluginSummary(
                        Convert.ToInt32(reader.GetValue(0), CultureInfo.InvariantCulture),
                        reader.IsDBNull(1) ? "" : reader.GetString(1).Trim(),
                        reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                        reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                        reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                        Convert.ToInt64(reader.GetValue(5), CultureInfo.InvariantCulture),
                        ReadBoolean(reader, 6),
                        reader.IsDBNull(7) ? "" : reader.GetString(7).Trim(),
                        reader.IsDBNull(8) ? "" : reader.GetString(8).Trim(),
                        reader.IsDBNull(9) ? "" : reader.GetString(9).Trim(),
                        ReadBoolean(reader, 10),
                        ReadBoolean(reader, 11),
                        reader.IsDBNull(12) ? "" : reader.GetString(12).Trim(),
                        reader.IsDBNull(13) ? (DateTime?)null : reader.GetDateTime(13),
                        Convert.ToInt32(reader.GetValue(14), CultureInfo.InvariantCulture),
                        Convert.ToInt32(reader.GetValue(15), CultureInfo.InvariantCulture),
                        Convert.ToInt32(reader.GetValue(16), CultureInfo.InvariantCulture)
                    ));
                }
            }
            catch (SqlException)
            {
                return BuildFallbackPluginCatalog();
            }

            return plugins.Count == 0 ? BuildFallbackPluginCatalog() : plugins;
        }

        private static List<HostingPluginSummary> BuildFallbackPluginCatalog() => new()
        {
            new(1, "WordPress", "Latest", "PHP", "Popular CMS installer with database setup and file permissions handled through the job queue.", 0, true, "CMS", "/wp-admin/", "admin", false, true, "fallback", null, 1, 4, 3),
            new(2, "Umbraco", "Latest", "ASP.NET", "ASP.NET CMS installer shell for the rebuilt plugin workflow.", 0, true, "CMS", "/umbraco/", "admin", false, true, "fallback", null, 1, 4, 2),
            new(3, "Orchard Core", "Latest", "ASP.NET", "Modern .NET CMS option prepared for one-click deployment.", 0, true, "CMS", "/admin/", "admin", false, true, "fallback", null, 1, 3, 2),
            new(4, "phpBB", "Latest", "PHP", "Community forum package with install steps handled by the worker pass.", 0, true, "Forum", "/adm/", "admin", false, true, "fallback", null, 1, 3, 3),
            new(5, "DNN Platform", "Latest", "ASP.NET", "Classic ASP.NET application installer shell.", 0, true, "CMS", "/admin/", "host", true, true, "fallback", null, 1, 5, 4),
            new(6, "Node.js Starter", "Latest", "Node.js", "Node deployment starter tied to workqueue deploy jobs.", 0, true, "Runtime", "/", "", false, false, "fallback", null, 1, 2, 1)
        };

        private static string WorkqueueStatusLabel(int status) => status switch
        {
            0 => "Pending",
            1 => "Running",
            2 => "Success",
            3 => "Error",
            _ => "Unknown"
        };

        private static string SimplifyHostingPath(string value, string cpLogin)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "";
            }

            var normalized = value.Replace("\\", "/", StringComparison.Ordinal).Trim();
            var marker = $"/{cpLogin}/www";
            var markerIndex = normalized.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (markerIndex >= 0)
            {
                normalized = normalized[(markerIndex + marker.Length)..];
            }

            return string.IsNullOrWhiteSpace(normalized) ? "/" : normalized;
        }

        private static string NormalizeFtpPath(string path, string cpLogin)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return "/";
            }

            var normalized = path.Replace("\\", "/", StringComparison.Ordinal).Trim();
            var marker = $"/{cpLogin}/www";
            var markerIndex = normalized.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (markerIndex >= 0)
            {
                normalized = normalized[(markerIndex + marker.Length)..];
            }

            normalized = normalized.Trim('/');
            return string.IsNullOrWhiteSpace(normalized) ? "/" : $"/{normalized}";
        }

        private static string MySqlDefaultUserFromDatabase(string databaseName)
        {
            var name = (databaseName ?? "").Trim();
            return name.Length > 3 ? name[3..] : name;
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
        private sealed record PasswordResetRequest(string Login);
        private sealed record PasswordResetConfirmRequest(string Token, string NewPassword, string ConfirmPassword);
        private sealed record PasswordResetResponse(bool Success, string Message, string? ResetUrl);
        private sealed record OpenSrsSettings(string ApiUrl, string Username, string PrivateKey)
        {
            public bool IsConfigured =>
                !string.IsNullOrWhiteSpace(ApiUrl)
                && !string.IsNullOrWhiteSpace(Username)
                && !string.IsNullOrWhiteSpace(PrivateKey);
        }
        private sealed record LoginUser(long CustomerId, string Login, string CustomerType);
        private sealed record LoginResponse(bool Success, string Message, LoginUser? User);
        private sealed record AccountServiceStatusResponse(bool Success, string Message, AccountServiceStatus? Services);
        private sealed record AccountServiceStatus(ExternalServiceStatus OpenSrs, ExternalServiceStatus Dns);
        private sealed record ExternalServiceStatus(string Name, bool Configured, string Message, string State);
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
        private sealed record MultipleRenewalCheckoutRequest(List<int> ClientProductIds);
        private sealed record BillingInvoiceResponse(bool Success, string Message, BillingInvoiceDetail? Invoice);
        private sealed record CheckoutPreviewResponse(bool Success, string Message, CheckoutPreview? Preview);
        private sealed record CheckoutCreateResponse(bool Success, string Message, CheckoutOrder? Order);
        private sealed record CheckoutTempOrderResponse(bool Success, string Message, CheckoutTempOrder? Order);
        private sealed record RenewTempOrderResponse(bool Success, string Message, RenewTempOrder? Order);
        private sealed record AffiliateWithdrawResponse(bool Success, string Message, AffiliateWithdrawPreview? Preview);
        private sealed record AccountVpnResponse(bool Success, string Message, AccountVpnDashboard? Dashboard);
        private sealed record AccountAddonsResponse(bool Success, string Message, AccountAddonsDashboard? Dashboard);
        private sealed record AccountAffiliateResponse(bool Success, string Message, AccountAffiliateDashboard? Dashboard);
        private sealed record AccountSettingsResponse(bool Success, string Message, AccountSettingsDashboard? Dashboard);
        private sealed record EmailChangeVerifyResponse(bool Success, string Message, bool Completed, string NewEmail, DateTime? CreatedAt);
        private sealed record NewOrderCatalogResponse(bool Success, string Message, NewOrderCatalog? Catalog);
        private sealed record HostingSitesResponse(bool Success, string Message, HostingSitesDashboard? Dashboard);
        private sealed record AccountDashboard(CustomerSummary Customer, List<HostingAccountSummary> HostingAccounts, List<HostingStatusCount> HostingStatusSummary, List<RenewalNoticeSummary> RenewalNotices, List<UrgentLogSummary> UrgentLogs);
        private sealed record CustomerSummary(long CustomerId, string Login, string CustomerType, string Status, string Name, string CompanyName, DateOnly? AccountStartDate);
        private sealed record HostingAccountSummary(long CpId, string CpLogin, string PrimaryDomain, string WebHostType, string ServerId, string Status, long ClientProductId, int ProductId, DateOnly? RenewalDate, int TotalSites, int AdditionalRam);
        private sealed record HostingStatusCount(string Status, int Count);
        private sealed record RenewalNoticeSummary(string Name, long ClientProductId, DateOnly RenewalDate, int DaysLeft, string Status);
        private sealed record UrgentLogSummary(int Id, long CustomerId, string CustomerLogin, string Message, DateTime CreatedAt);
        private sealed record AccountBillingDashboard(AccountBalanceSummary Balance, List<AccountProductSummary> ActiveProducts, List<AccountPurchaseSummary> Purchases, List<AccountProductSummary> RenewalNotices, List<AccountCreditTransactionSummary> CreditTransactions, List<CheckoutTempOrder> PendingCheckouts, List<RenewTempOrder> PendingRenewCheckouts);
        private sealed record AccountBalanceSummary(decimal Amount, string Currency, string Source);
        private sealed record AccountProductSummary(int ClientProductId, int ProductId, string Name, string Description, string ProductType, DateOnly? NextDueDate, int? DaysLeft, string Status, DateOnly CreateDate, DateOnly LastUpdate, string PaymentTerm, decimal? Amount);
        private sealed record AccountPurchaseSummary(int OrderId, int ClientProductId, string Name, string Description, string PaymentTerm, string PaymentMethod, decimal Amount, string OrderStatus, string PaymentStatus, DateOnly CreateDate);
        private sealed record AccountCreditTransactionSummary(int ProductId, string Name, string Description, string PaymentMethod, decimal LedgerAmount, DateTime? CreatedAt, decimal? RealAmount, string OrderStatus);
        private sealed record RenewalCheckoutPreview(int ClientProductId, int ProductId, string Name, string Description, string PaymentTerm, decimal Amount, string Currency, DateOnly? NextDueDate, string CheckoutUrl, string Note);
        private sealed record BillingInvoiceDetail(int OrderId, int ClientProductId, int ProductId, string Name, string ProductName, string Description, string PaymentTerm, string PaymentMethod, decimal Amount, decimal PaidAmount, decimal Fees, string OrderStatus, string PaymentStatus, DateOnly CreateDate, DateOnly? PaidDate, string TransactionCode);
        private sealed record CheckoutPreview(string CheckoutId, string Title, int ItemCount, decimal Total, string Currency, string CheckoutUrl, string Note, object Items);
        private sealed record CheckoutOrder(string Guid, string CheckoutUrl, string Title, decimal Amount, string Currency, int PageType, string Note);
        private sealed record CheckoutTempOrder(string Id, long CustomerId, int ProductId, string ProductName, decimal Amount, string Info1, string Info2, string Info3, string Info4, string Info5, int PageType, DateTime AddDate, bool IsPaid, bool Processed, bool Trackable, string FulfillmentPath);
        private sealed record RenewTempOrder(string Id, long CustomerId, decimal Amount, string RenewInfo, DateTime AddDate, bool IsPaid, bool IsProcessed, string FulfillmentPath);
        private sealed record DomainCheckoutRequest(List<DomainCheckoutItem> Domains);
        private sealed record DomainCheckoutItem(string DomainName, decimal Price);
        private sealed record AddonCheckoutRequest(List<AddonCheckoutItem> Items);
        private sealed record AddonCheckoutItem(int ProductId, int PriceId, int Quantity, long CpId);
        private sealed record VpnCheckoutRequest(int ProductId, int PriceId, int Quantity);
        private sealed record VpnUserCreateRequest(string User, string Password, string Type, string Area);
        private sealed record VpnUserActionRequest(string Action);
        private sealed record NewOrderCheckoutRequest(string Type, int ProductId, int PriceId);
        private sealed record DomainTransferCheckoutRequest(string DomainName, bool WhoisPrivacy);
        private sealed record BillingDepositRequest(decimal Amount);
        private sealed record DepositEligibility(bool Eligible, string Message);
        private sealed record BillingTransferRequest(decimal Amount, string TargetLogin);
        private sealed record BillingTransferPreviewResponse(bool Success, string Message, BillingTransferPreview? Preview);
        private sealed record BillingTransferPreview(string TargetLogin, long? TargetCustomerId, decimal Amount, decimal AvailableBalance, bool Eligible, string Note);
        private sealed record CheckoutLineItem(int ProductId, string Name, string Term, int Quantity, decimal UnitAmount, string Currency);
        private sealed record AffiliateWithdrawRequest(decimal Amount, string Method, string Paypal);
        private sealed record AffiliateWithdrawPreview(decimal Amount, string Method, decimal AvailableCommission, int PaidReferralsThisYear, decimal MinimumAmount, bool Eligible, string Note);
        private sealed record AccountVpnDashboard(int Used, int Quota, List<AccountVpnServiceSummary> Services, List<AddonCatalogProduct> Catalog);
        private sealed record AccountVpnServiceSummary(long VpnClientId, string User, string Type, string Host, string Area, string DataCenter, string Status);
        private sealed record AccountAddonsDashboard(List<AddonCatalogProduct> Catalog, List<AccountProductSummary> ActiveAddons, List<HostingAccountSummary> HostingAccounts);
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
        private sealed record AccountEmailChangeRequest(string Email);
        private sealed record AccountProfileUpdateRequest(string Name, string CompanyName, string MobileNumber, string BrowserLanguage, string Vat);
        private sealed record AccountDomainSummary(int Id, string DomainName, int ClientProductId, string Status, DateOnly? StartDate, DateOnly? ExpirationDate, int? DaysLeft, string RegisterStatus, int RegisterInfoId, DateOnly? AddDate, DateOnly? ProductNextDueDate, string ProductStatus);
        private sealed record HostingSitesDashboard(long CpId, string CpLogin, List<HostingSiteSummary> Sites);
        private sealed record HostingSiteSummary(int SiteUid, string SiteName, string RootName, string SitePath, string Status, string RunningStatus, string Version, string PhpVersion, bool IsSecure, bool IsSubdomain, DateOnly? CreateDate, List<HostingSiteDomainSummary> MappedDomains);
        private sealed record HostingSiteDomainSummary(int DomainUid, string Label, string Url, bool Cdn, bool IsDefault, bool Ssl);
        private sealed record HostingDashboardResponse(bool Success, string Message, HostingDashboardSummary? Dashboard);
        private sealed record HostingDashboardSummary(long CpId, string CpLogin, string PrimaryDomain, string WebHostType, string Status, string ServerId, List<string> DnsServers, string IpAddress, int RamQuotaMb, int RamUsedMb, int SiteCount, int DomainCount, int DatabaseCount, List<HostingDashboardMetric> Metrics);
        private sealed record HostingDashboardMetric(string Label, string Value, int? NumericValue);
        private sealed record HostingDatabasesResponse(bool Success, string Message, HostingDatabasesDashboard? Dashboard);
        private sealed record HostingDatabasesDashboard(long CpId, string CpLogin, List<HostingDatabaseSummary> Databases, HostingDatabaseTotals Totals);
        private sealed record HostingDatabaseSummary(string Engine, long DatabaseId, string Name, string Login, string Host, int SpaceQuotaMb, string Status, DateOnly? CreateDate);
        private sealed record HostingDatabaseTotals(int Total, int Mssql, int Mysql);
        private sealed record HostingEmailsResponse(bool Success, string Message, HostingEmailsDashboard? Dashboard);
        private sealed record HostingEmailsDashboard(long CpId, string CpLogin, List<HostingEmailDomainSummary> Domains, HostingEmailTotals Totals);
        private sealed record HostingEmailDomainSummary(string Type, long RowId, string Domain, string Server, string WebmailUrl, string MailHost, int SpaceMb, string Status, DateOnly? CreateDate);
        private sealed record HostingEmailTotals(int Total, int Hosted, int Corporate, int DailyLimits);
        private sealed record HostingFtpResponse(bool Success, string Message, HostingFtpDashboard? Dashboard);
        private sealed record HostingFtpDashboard(long CpId, string CpLogin, List<HostingFtpUserSummary> Users, HostingFtpTotals Totals);
        private sealed record HostingFtpUserSummary(string Login, string Path, int QuotaMb, string Permission, string Server, bool IsRootUser, string Status);
        private sealed record HostingFtpTotals(int Total, int RootUsers, int ExtraUsers);
        private sealed record HostingRuntimeResponse(bool Success, string Message, HostingRuntimeDashboard? Dashboard);
        private sealed record HostingRuntimeDashboard(long CpId, string CpLogin, List<HostingRuntimeRow> Pools, List<HostingRuntimeRow> Redirects, List<HostingRuntimeRow> SiteUsers, List<HostingRuntimeRow> StaticIps, List<HostingRuntimeRow> Aliases, HostingRuntimeTotals Totals, List<string> Warnings);
        private sealed record HostingRuntimeRow(string Title, string Subtitle, string Status, Dictionary<string, string> Details);
        private sealed record HostingRuntimeTotals(int Pools, int Redirects, int SiteUsers, int StaticIps, int ScheduledTasks, int Aliases);
        private sealed record HostingSecurityResponse(bool Success, string Message, HostingSecurityDashboard? Dashboard);
        private sealed record HostingSecurityDashboard(long CpId, string CpLogin, List<HostingSslOrderSummary> SslOrders, List<HostingFreeSslSummary> FreeSslRows, List<HostingCdnDomainSummary> CdnDomains, List<HostingCloudflareAccountSummary> CloudflareAccounts, List<HostingSiteSecuritySummary> SiteSecurityRows, List<HostingMigrationSummary> Migrations, HostingSecurityTotals Totals, List<string> Warnings);
        private sealed record HostingSslOrderSummary(long Id, string CommonName, string Status, string Email, string BuyYears, string CertificateId, string DnsNames, string DnsApproverEmails, DateTime? CreateDate);
        private sealed record HostingFreeSslSummary(long Id, string Domain, string Status, DateTime? CreateDate, DateTime? LastUpdate);
        private sealed record HostingCdnDomainSummary(long DomainUid, string Domain, bool Cdn, bool IsDefault, string SiteName);
        private sealed record HostingCloudflareAccountSummary(long CustomerId, string Email, string Status, DateTime? CreateDate);
        private sealed record HostingSiteSecuritySummary(long SiteUid, string SiteName, string IisId, bool WebKnight, bool HasAuditRow, bool IsWritable, DateTime? LastUpdate);
        private sealed record HostingMigrationSummary(long Id, string SourceServer, string DestinationServer, string Status, DateTime? CreateDate, bool Cleaned, bool Cancelled);
        private sealed record HostingSecurityTotals(int SslOrders, int FreeSsl, int CdnDomains, int CdnEnabled, int CloudflareAccounts, int LockedSites, int Migrations);
        private sealed record HostingActivityResponse(bool Success, string Message, HostingActivityDashboard? Dashboard);
        private sealed record HostingActivityDashboard(long CpId, string CpLogin, List<HostingActivitySummary> Jobs, HostingActivityTotals Totals);
        private sealed record HostingActivitySummary(long Id, string Type, string Status, int StatusCode, string From, string To, string Server, string Data, string SiteOwner, string NotifyEmail, string ErrorMessage, DateTime? EnterDate);
        private sealed record HostingActivityTotals(int Total, int Pending, int Running, int Errors);
        private sealed record HostingActivityTestRequest(long CpId, string From, string To, string Server, string Note);
        private sealed record HostingActivityMutationResponse(bool Success, string Message, long Id);
        private sealed record HostingRealTestRequest(long CpId, string Area, Dictionary<string, string> Fields);
        private sealed record HostingRealTestResponse(bool Success, string Message, object? Row, string Area, long Id);
        private sealed record HostingAppsResponse(bool Success, string Message, HostingAppsDashboard? Dashboard);
        private sealed record HostingAppsDashboard(long CpId, string CpLogin, List<HostingPluginSummary> Catalog, List<HostingActivitySummary> DeployJobs);
        private sealed record HostingPluginSummary(
            int PluginId,
            string Name,
            string Version,
            string Language,
            string Description,
            long InstallCount,
            bool Enabled,
            string Category,
            string AdminPage,
            string AdminLogin,
            bool PasswordProtected,
            bool UsesDatabase,
            string ScriptVersion,
            DateTime? LastInstallDate,
            int ConfigFiles,
            int ParameterSets,
            int PermissionRules);
        private sealed record SelectedHostingCp(long CpId, string CpLogin);
    }
}
