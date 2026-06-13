import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const nativeFetch = window.fetch.bind(window);
const authRedirectExemptPaths = [
  "/api/auth/login",
  "/api/auth/login-config",
  "/api/auth/me",
  "/api/auth/logout",
  "/api/auth/password-reset/request",
  "/api/auth/password-reset/confirm"
];

function fetchUrlPath(input) {
  const rawUrl = typeof input === "string" ? input : input?.url;
  if (!rawUrl) return "";

  try {
    return new URL(rawUrl, window.location.origin).pathname;
  } catch {
    return rawUrl;
  }
}

function shouldRedirectToLogin(response, input) {
  if (response.status !== 401) return false;
  const path = fetchUrlPath(input);
  if (!path.startsWith("/api/")) return false;
  return !authRedirectExemptPaths.includes(path);
}

window.fetch = async (input, init) => {
  const response = await nativeFetch(input, init);
  if (shouldRedirectToLogin(response, input) && window.location.pathname !== "/") {
    window.history.replaceState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  return response;
};

const sections = [
  { id: "hosting", label: "Hosting Plans", stat: "", icon: "server" },
  { id: "domain", label: "Domain", stat: "", icon: "globe" },
  { id: "vpn", label: "VPN", stat: "", icon: "shield" },
  { id: "addon", label: "Add-On", stat: "", icon: "plus" },
  { id: "affiliate", label: "Affiliate", stat: "Earn 60%", icon: "share" },
  { id: "billing", label: "Billing", stat: "", icon: "card", statTone: "warning" },
  { id: "settings", label: "Settings", stat: "", icon: "settings" },
  { id: "new-order", label: "+ New Order", stat: "Buy", icon: "order", tone: "order" }
];

const controlPanelSections = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "websites", label: "Websites", icon: "website" },
  { id: "databases", label: "Databases", icon: "database" },
  { id: "emails", label: "Emails", icon: "mail" },
  { id: "files", label: "Files", icon: "folder" },
  { id: "apps", label: "Apps", icon: "apps" },
  { id: "ftp", label: "FTP", icon: "ftp" },
  { id: "cdn", label: "CDN", icon: "cdn" },
  { id: "dns", label: "DNS", icon: "dns" },
  { id: "ssl", label: "SSL", icon: "ssl" },
  { id: "advance", label: "Advance", icon: "advance" }
];

const websiteActions = [
  { label: "Error Logs", icon: "logs" },
  { label: "SSL", icon: "ssl" },
  { label: "CDN", icon: "cdn" },
  { label: "File Manager", icon: "folder" },
  { label: "App Pool", icon: "server" },
  { label: "Runtime Settings", icon: "advance" },
  { label: "More Functions", icon: "more" }
];

const deployActions = [
  { label: "Github", icon: "git" },
  { label: "VSDeploy", icon: "deploy" }
];

const actionIconByLabel = {
  "Add Domain": "add-domain",
  Alias: "share",
  "Automated Backups": "backup",
  Back: "back",
  Backup: "backup",
  "Browse Root": "folder-search",
  Connection: "server",
  "Connection String": "server",
  "Parent Folder": "back",
  Cancel: "x",
  Close: "x",
  Copy: "copy",
  Create: "plus",
  "Create Checkout": "order",
  Delete: "trash",
  Disable: "power-off",
  Dismiss: "x",
  Download: "download",
  Edit: "edit",
  Enable: "power",
  Invoice: "invoice",
  "Lock Site": "lock",
  "Manage Mailboxes": "mail",
  "New Folder": "new-folder",
  "New Site": "website-plus",
  Open: "open",
  Permissions: "permissions",
  Password: "lock",
  Quota: "server",
  Move: "open",
  Refresh: "refresh",
  Renew: "order",
  Reset: "reset",
  Restore: "retry",
  Retry: "retry",
  "Scan Virus": "virus",
  Search: "search",
  "Sub Domain": "add-domain",
  Unlock: "unlock",
  "Unlock Site": "unlock",
  Unzip: "unzip",
  Upload: "upload",
  Webmail: "open",
  Zip: "zip",
  DNS: "dns",
  Forwarding: "share",
  "Raw Logs": "logs",
  "DNS Manager": "dns",
  "Domain Settings": "settings",
  "Whois Privacy": "shield",
  "Privacy On": "shield",
  "Privacy Off": "shield",
  "Auth Code": "lock",
  "CSR Request": "invoice",
  "Request Free SSL": "ssl",
  "Buy SSL": "order",
  "Import SSL": "upload",
  "Re-import SSL": "upload",
  "Install Certificate": "ssl",
  "Reinstall Certificate": "refresh",
  "Re-install SSL Cert": "refresh",
  "Install to all subdomains": "add-domain",
  "Export SSL Cert": "download",
  "Edit Validation Method": "edit",
  "Resend Approver Email": "mail",
  "View Free SSL Log": "logs",
  "Delete SSL": "trash"
};

function iconForAction(label) {
  const normalized = String(label ?? "").replace(/^\+\s*/, "").trim();
  return actionIconByLabel[normalized] ?? actionIconByLabel[label] ?? "more";
}

const websiteMoreFunctionColumns = [
  {
    title: "Settings",
    items: [
      { label: "Site Name", icon: "site-name" },
      { label: "Mapped Path", icon: "folder" },
      { label: "ASP.NET Version", icon: "aspnet" },
      { label: ".NET Core Mode", icon: "core" },
      { label: "Node.js App", icon: "node" },
      { label: "PHP Version", icon: "php" },
      { label: "PHP Settings", icon: "checklist" },
      { label: "Detail Error", icon: "warning" },
      { label: "Site On/Off", icon: "power" },
      { label: "Delete Website", icon: "trash" }
    ]
  },
  {
    title: "Basic",
    items: [
      { label: "Domain Manager", icon: "globe" },
      { label: "Visitor Stats", icon: "stats" },
      { label: "FTP Access", icon: "ftp" },
      { label: "VS Webdeploy", icon: "deploy" },
      { label: "Github Deploy", icon: "git" },
      { label: "SMTP Sample Code", icon: "mail" },
      { label: "IP Deny", icon: "shield" },
      { label: "IIS Log Manager", icon: "logs" },
      { label: "Application Pool 🔥", icon: "server" },
      { label: "Outgoing Port", icon: "outgoing" }
    ]
  },
  {
    title: "Advanced Features",
    items: [
      { label: "Create .Net App", icon: "apps" },
      { label: "Create Virtual Dir", icon: "virtual-dir" },
      { label: "Force HTTPS", icon: "force-https" },
      { label: "Default Doc", icon: "default-doc" },
      { label: "Custom Errors", icon: "warning" },
      { label: "Mime Type", icon: "mime" },
      { label: "ScriptMap", icon: "scriptmap" },
      { label: "Remote IIS Manager", icon: "remote-iis" },
      { label: "Site Guard", icon: "shield" },
      { label: "Schedule Tasks", icon: "tasks" }
    ]
  }
];

const websiteMoreFunctionKeyByLabel = Object.fromEntries(
  websiteMoreFunctionColumns
    .flatMap((column) => column.items)
    .map((item) => [item.label, item.label.toLowerCase().replace("🔥", "").trim().replace(/\./g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")])
);

websiteMoreFunctionKeyByLabel["ASP.NET Version"] = "aspnet-version";
websiteMoreFunctionKeyByLabel[".NET Core Mode"] = "core-mode";
websiteMoreFunctionKeyByLabel["Node.js App"] = "nodejs-app";
websiteMoreFunctionKeyByLabel["Create .Net App"] = "create-net-app";
websiteMoreFunctionKeyByLabel["Create Virtual Dir"] = "virtual-dir";
websiteMoreFunctionKeyByLabel["ScriptMap"] = "script-map";
websiteMoreFunctionKeyByLabel["Application Pool 🔥"] = "application-pool";

const websites = [
  {
    siteName: "agapepapa",
    mappedDomains: [
      { label: "site29.etempurl.com", url: "http://site29.etempurl.com/" },
      { label: "agapepapa.com", url: "http://agapepapa.com/" },
      { label: "yesjesus.app", url: "https://yesjesus.app/" }
    ],
    runtime: "ASP.NET 8",
    status: "Active"
  },
  {
    siteName: "sample",
    mappedDomains: [
      { label: "sample.com", url: "https://sample.com/" },
      { label: "www.sample.com", url: "https://www.sample.com/" }
    ],
    runtime: "ASP.NET 4.8",
    status: "Active"
  },
  {
    siteName: "clientportal",
    mappedDomains: [
      { label: "clientportal.io", url: "https://clientportal.io/" },
      { label: "portal.clientportal.io", url: "https://portal.clientportal.io/" }
    ],
    runtime: "Node.js",
    status: "Active"
  },
  {
    siteName: "staging-controlpanel",
    mappedDomains: [
      { label: "staging-controlpanel.dev", url: "https://staging-controlpanel.dev/" },
      { label: "preview.staging-controlpanel.dev", url: "https://preview.staging-controlpanel.dev/" }
    ],
    runtime: "ASP.NET Core",
    status: "Preview"
  },
  {
    siteName: "marketing-site",
    mappedDomains: [
      { label: "marketing.openreward.com", url: "https://marketing.openreward.com/" },
      { label: "campaign.openreward.com", url: "https://campaign.openreward.com/" }
    ],
    runtime: "Static",
    status: "Active"
  },
  {
    siteName: "api-service",
    mappedDomains: [
      { label: "api.openreward.com", url: "https://api.openreward.com/" },
      { label: "api-preview.etempurl.com", url: "http://api-preview.etempurl.com/" }
    ],
    runtime: "ASP.NET Web API",
    status: "Active"
  }
];

const affiliateBannerDefinitions = [
  { size: "728X90", file: "728X90.gif" },
  { size: "468x60", file: "468X60.gif" },
  { size: "300x250", file: "300x250.gif" },
  { size: "234x60", file: "234x60.gif" }
];

function normalizeAffiliateBrandDomain(brandDomain) {
  return String(brandDomain || "smarterasp.net").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "") || "smarterasp.net";
}

function buildAffiliateBanners(referralCode, brandDomain) {
  const code = encodeURIComponent(referralCode || "jyu001");
  const domain = normalizeAffiliateBrandDomain(brandDomain);
  return affiliateBannerDefinitions.map((banner) => ({
    ...banner,
    url: `https://www.${domain}/affiliate/${banner.file}`,
    code: `<a href="https://www.${domain}/index?r=${code}"><img src="https://www.${domain}/affiliate/${banner.file}" border="0"></a>`
  }));
}

const vpnKbArticles = [
  ["How to set up VPN with your Windows 10 PC?", "http://www.smarterasp.net/support/kb/a2180/how-to-set-up-vpn-with-your-windows-10-pc.aspx"],
  ["How to set up VPN with your Andriod phone?", "http://www.smarterasp.net/support/kb/a2183/how-to-set-up-vpn-with-your-andriod-phone.aspx"],
  ["How to set up VPN with your iPhone or iPad?", "http://www.smarterasp.net/support/kb/a2181/how-to-set-up-vpn-with-your-iphone-or-ipad.aspx"],
  ["How to set up VPN with your Mac?", "http://www.smarterasp.net/support/kb/a2182/how-to-set-up-vpn-with-your-mac.aspx"],
  ["How to set up VPN with your Ubuntu?", "http://www.smarterasp.net/support/kb/a2191/how-to-setup-vpn-with-your-ubuntu.aspx"],
  ["How to set up OpenVPN?", "http://www.smarterasp.net/support/kb/a2245/how-to-change-vpn-configuration-to-openvpn-and-set-it-up-in-client-apps.aspx"],
  ["How to fix \"IKE authentication credentials are unacceptable\"?", "http://www.smarterasp.net/support/kb/a2195/how-to-fix-ike-authentication-credentials-are-unacceptable-when-connect-to-our-vpn-service.aspx"]
];

const hostingKbArticles = [
  ["Why do you need dedicated pool per site?", "http://www.smarterasp.net/support/kb/a2247/why-do-you-need-dedicated-pool-per-site.aspx"],
  ["What's the purpose of the email field when creating new hosting?", "http://www.smarterasp.net/support/KB/a333/whats-purpose-the-email-field-when-creating-new-hosting.aspx"]
];

const domainKbArticles = [
  ["Registrant verification FAQs", "http://www.smarterasp.net/support/KB/a1555/registrant-verification-faqs.aspx"],
  ["What is transfer verification email address?", "http://www.smarterasp.net/support/KB/a1453/what-is-transfer-verification-email-address.aspx"],
  ["How to setup MX records for Google Mail/Gmail?", "http://www.smarterasp.net/support/KB/a303/how-to-setup-mx-records-for-google-mail-gmail.aspx"]
];

const emailKbArticles = [
  ["Move your email from your old web host using IMAP", "http://www.smarterasp.net/support/kb/a1451/move-your-email-from-your-old-web-host-to-smarterasp_net-using-imap.aspx"],
  ["Set up DKIM and Domain Key", "http://www.smarterasp.net/support/kb/a1781/set-up-dkim-and-domain-key.aspx"],
  ["How to setup MX records for Google Mail/Gmail?", "http://www.smarterasp.net/support/KB/a303/how-to-setup-mx-records-for-google-mail-gmail.aspx"]
];

const billingKbArticles = [
  ["Why do I need to deposit money?", "http://www.smarterasp.net/support/KB/a188/why-do-i-need-to-deposit-money.aspx"]
];

const resellerKbArticles = [
  ["Quick start of reseller plan", "http://www.smarterasp.net/support/KB/a1512/quick-start-of-reseller-plan.aspx"],
  ["What's the URL/control panel for my resold client to login?", "http://www.smarterasp.net/support/KB/a336/whats-the-urlcontrol-panel-for-my-resold-client-to-login.aspx"],
  ["How to set your own domain name servers?", "http://www.smarterasp.net/support/KB/a343/how-to-set-your-own-domain-name-servers.aspx"],
  ["API documentation", "https://www.smarterasp.net/support/KB/c61/api.aspx"],
  ["How to integrate WHMCS?", "https://www.smarterasp.net/support/KB/a1647/how-to-integrate-whmcs.aspx"]
];

const securityGuideArticles = [
  ["Google Authenticator help", "https://support.google.com/accounts/answer/1066447?hl=en"],
  ["Authy download", "https://authy.com/download/"]
];

const domainExtensions = [
  ".com", ".net", ".org", ".io", ".app", ".ai", ".co", ".dev", ".shop", ".store", ".online", ".site", ".website", ".tech", ".cloud", ".host", ".hosting", ".digital", ".software", ".systems",
  ".biz", ".info", ".name", ".pro", ".mobi", ".me", ".tv", ".cc", ".us", ".ca", ".uk", ".co.uk", ".de", ".fr", ".it", ".es", ".nl", ".be", ".ch", ".at",
  ".se", ".no", ".dk", ".fi", ".ie", ".pl", ".cz", ".sk", ".pt", ".gr", ".hu", ".ro", ".bg", ".lt", ".lv", ".ee", ".is", ".lu", ".li", ".si",
  ".hr", ".rs", ".ua", ".ru", ".com.au", ".net.au", ".au", ".nz", ".co.nz", ".jp", ".co.jp", ".kr", ".cn", ".com.cn", ".hk", ".tw", ".sg", ".my", ".th", ".id",
  ".ph", ".vn", ".in", ".co.in", ".ae", ".sa", ".qa", ".il", ".tr", ".za", ".com.br", ".mx", ".com.mx", ".ar", ".cl", ".pe", ".uy", ".ec", ".cr",
  ".agency", ".academy", ".accountants", ".accountant", ".apartments", ".associates", ".business", ".capital", ".care", ".careers", ".center", ".company", ".consulting", ".contractors", ".enterprises", ".estate", ".exchange", ".expert", ".finance", ".financial",
  ".fund", ".group", ".gmbh", ".holdings", ".industries", ".international", ".investments", ".limited", ".llc", ".ltd", ".management", ".marketing", ".media", ".network", ".partners", ".properties", ".services", ".solutions", ".support", ".ventures",
  ".art", ".audio", ".blog", ".camera", ".chat", ".community", ".design", ".email", ".events", ".family", ".fans", ".fashion", ".fitness", ".gallery", ".games", ".graphics", ".guru", ".life", ".live", ".news",
  ".photo", ".photos", ".pics", ".press", ".productions", ".social", ".space", ".studio", ".today", ".tools", ".video", ".wiki", ".world", ".works", ".zone", ".one", ".page", ".plus", ".run", ".team",
  ".cafe", ".catering", ".coffee", ".delivery", ".dental", ".doctor", ".education", ".energy", ".engineer", ".engineering", ".farm", ".florist", ".health", ".hospital", ".kitchen", ".law", ".legal", ".money", ".pizza", ".restaurant",
  ".school", ".science", ".security", ".solar", ".tax", ".taxi", ".training", ".travel", ".university", ".vet", ".vin", ".wine", ".xxx"
];

const domainExtensionPriceOverrides = {
  ".com": 12.9,
  ".net": 14.9,
  ".org": 13.9,
  ".io": 39,
  ".app": 18,
  ".ai": 79,
  ".co": 29,
  ".dev": 18,
  ".shop": 24,
  ".store": 28,
  ".online": 22,
  ".tech": 34,
  ".cloud": 22,
  ".tv": 39,
  ".cc": 29,
  ".us": 12,
  ".ca": 18,
  ".uk": 12,
  ".co.uk": 12,
  ".com.au": 18,
  ".com.br": 24,
  ".co.jp": 45
};

function getDomainExtensionPrice(extension) {
  return domainExtensionPriceOverrides[extension] ?? 19.9;
}

function App() {
  const [route, setRoute] = useState(() => appRouteFromPath(window.location.pathname));
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("controlpanel-theme");
    return ["dark", "light", "class"].includes(savedTheme) ? savedTheme : "dark";
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("controlpanel-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleRouteChange = () => setRoute(appRouteFromPath(window.location.pathname));
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me");
        const result = await response.json().catch(() => null);
        if (!isMounted) return;

        if (response.ok && result?.success) {
          setCurrentUser(result.user);
        } else if (!isPublicRoute(route)) {
          window.history.replaceState({}, "", "/");
          setRoute("login");
        }
      } catch {
        if (isMounted && !isPublicRoute(route)) {
          window.history.replaceState({}, "", "/");
          setRoute("login");
        }
      } finally {
        if (isMounted) setIsAuthReady(true);
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || currentUser || isPublicRoute(route)) return;

    window.history.replaceState({}, "", "/");
    setRoute("login");
  }, [currentUser, isAuthReady, route]);

  const goToPanel = (event) => {
    event?.preventDefault();
    window.history.pushState({}, "", "/panel");
    setRoute("panel");
  };

  const goToControlPanel = (event) => {
    event?.preventDefault();
    window.history.pushState({}, "", "/panel_cp");
    setRoute("panel_cp");
  };

  const toggleTheme = () => setTheme((currentTheme) => {
    if (currentTheme === "dark") return "light";
    if (currentTheme === "light") return "class";
    return "dark";
  });

  const goToPasswordResetRequest = (event) => {
    event?.preventDefault();
    window.history.pushState({}, "", "/account/retrieve_password");
    setRoute("password-reset-request");
  };

  const handleLogin = (user, event) => {
    event?.preventDefault();
    setCurrentUser(user);
    window.history.pushState({}, "", "/panel");
    setRoute("panel");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
    setCurrentUser(null);
    window.history.pushState({}, "", "/");
    setRoute("login");
  };

  if (!isAuthReady) {
    return (
      <main className="login-page">
        <section className="login-card auth-loading" aria-label="Loading session">
          <div className="product-mark login-server-icon" aria-hidden="true"><MenuIcon name="server" /></div>
          <LoadingIcon label="Checking session" />
        </section>
      </main>
    );
  }

  if ((route === "panel" || route === "panel_cp") && !currentUser) return null;

  if (route === "panel_cp") {
    return <HostingControlPanel theme={theme} currentUser={currentUser} onBackToPanel={goToPanel} onLogout={handleLogout} onToggleTheme={toggleTheme} />;
  }

  if (route === "checkout") {
    return <CheckoutHandoff theme={theme} currentUser={currentUser} onBackToPanel={goToPanel} onToggleTheme={toggleTheme} />;
  }

  if (route === "invoice") {
    return <InvoicePage theme={theme} onBackToPanel={goToPanel} />;
  }

  if (route === "email-verify") {
    return <EmailChangeVerify theme={theme} onBackToPanel={goToPanel} onToggleTheme={toggleTheme} />;
  }

  if (route === "password-reset-request") {
    return <PasswordResetRequest theme={theme} onBackToLogin={() => {
      window.history.pushState({}, "", "/");
      setRoute("login");
    }} onToggleTheme={toggleTheme} />;
  }

  if (route === "password-reset-confirm") {
    return <PasswordResetConfirm theme={theme} onBackToLogin={() => {
      window.history.pushState({}, "", "/");
      setRoute("login");
    }} onToggleTheme={toggleTheme} />;
  }

  return route === "panel"
    ? <Panel theme={theme} currentUser={currentUser} onLogout={handleLogout} onManageHosting={goToControlPanel} onToggleTheme={toggleTheme} />
    : <Login onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} onForgotPassword={goToPasswordResetRequest} />;
}

function appRouteFromPath(pathname) {
  if (pathname === "/panel") return "panel";
  if (pathname === "/panel_cp") return "panel_cp";
  if (pathname === "/account/printreceipt" || pathname === "/invoice") return "invoice";
  if (pathname.startsWith("/checkout")) return "checkout";
  if (pathname === "/account/emailchangeverify") return "email-verify";
  if (pathname === "/account/retrieve_password") return "password-reset-request";
  if (pathname === "/account/retrieve_password_reset") return "password-reset-confirm";
  return "login";
}

function isPublicRoute(route) {
  return ["login", "checkout", "invoice", "email-verify", "password-reset-request", "password-reset-confirm"].includes(route);
}

function InvoicePage({ theme, onBackToPanel }) {
  const [invoice, setInvoice] = useState(null);
  const [message, setMessage] = useState("Loading invoice...");
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const orderId = query.get("id") ?? query.get("orderId") ?? "";

  useEffect(() => {
    let active = true;

    async function loadInvoice() {
      if (!orderId) {
        setMessage("Missing invoice number.");
        return;
      }

      try {
        const response = await fetch(`/api/account/billing/orders/${encodeURIComponent(orderId)}/invoice`);
        const result = await response.json().catch(() => null);
        if (!active) return;
        if (!response.ok || !result?.success) {
          setMessage(result?.message ?? "Unable to load invoice.");
          return;
        }

        setInvoice(result.invoice);
        setMessage("");
      } catch {
        if (active) setMessage("Unable to reach invoice service.");
      }
    }

    loadInvoice();
    return () => {
      active = false;
    };
  }, [orderId]);

  const brandName = (invoice?.brandName || "smarterasp.net").toUpperCase();
  const address = [
    invoice?.receiptAddress,
    [invoice?.receiptCity, invoice?.receiptProvince].filter(Boolean).join(", "),
    [invoice?.receiptPostcode, invoice?.receiptCountry].filter(Boolean).join(", ")
  ].filter(Boolean).join(" ");

  return (
    <main className={`invoice-page ${theme}`}>
      <section className="invoice-shell">
        <div className="invoice-toolbar">
          <button className="secondary-button compact" type="button" onClick={onBackToPanel}>Back</button>
          <button className="primary-button compact" type="button" onClick={() => window.print()} disabled={!invoice}>Print</button>
        </div>
        {message && (
          <div className="invoice-card">
            <LoadingIcon label={message} />
            <p>{message}</p>
          </div>
        )}
        {invoice && (
          <article className="invoice-document">
            <h1>{brandName}</h1>
            <div className="invoice-summary-row">
              <div>
                <span>Receipt No.</span>
                <strong>{invoice.orderId}</strong>
              </div>
              <div>
                <span>Order Date</span>
                <strong>{formatDate(invoice.createDate)}</strong>
              </div>
            </div>
            <section className="invoice-band">
              <h2>BusinessICS Intl Limited (DBA {brandName})</h2>
              <p>1455 Monterey Pass Road #204, Monterey Park, CA 91754 US</p>
            </section>
            <section className="invoice-customer-grid">
              <div><span>Name</span><strong>{invoice.receiptName || "N/A"}</strong></div>
              <div><span>Address</span><strong>{address || "N/A"}</strong></div>
              {invoice.vat && <div><span>VAT No.</span><strong>{invoice.vat}</strong></div>}
              <div><span>Paid By</span><strong>{invoice.paymentMethod || "Paypal/Credit Card"}</strong></div>
            </section>
            <section className="invoice-line-card">
              <DataTable
                columns={["Account Name", "Product Name", "Description", "Payment Term", "Amount", "Total"]}
                rows={[[
                  invoice.accountName || "N/A",
                  invoice.name,
                  invoice.description,
                  invoice.paymentTerm,
                  formatMoney(invoice.amount),
                  formatMoney(invoice.amount)
                ]]}
              />
            </section>
            <section className="invoice-total-card">
              <div><span>Subtotal</span><strong>{formatMoney(invoice.amount)}</strong></div>
              <div><span>Shipping & Handling</span><strong>$0.00</strong></div>
              <div><span>Tax</span><strong>$0.00</strong></div>
              <div className="invoice-total"><span>Total (United States Dollars)</span><strong>{formatMoney(invoice.amount)}</strong></div>
            </section>
          </article>
        )}
      </section>
    </main>
  );
}

function CheckoutHandoff({ theme, currentUser, onBackToPanel, onToggleTheme }) {
  const [order, setOrder] = useState(null);
  const [checkoutState, setCheckoutState] = useState(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [isPayingWithBalance, setIsPayingWithBalance] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const paymentPopupTimerRef = useRef(null);
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const guid = query.get("guid") ?? "";
  const amount = query.get("amount") ?? "";
  const isDeposit = window.location.pathname.includes("deposit");
  const isRenewTemp = window.location.pathname.includes("/checkout/renew") || query.get("kind") === "renew";

  async function loadOrder({ quiet = false } = {}) {
    if (!guid) return;
    if (!quiet) setOrderMessage("Loading checkout order...");
    setIsRefreshing(true);
    try {
      const response = await fetch(isRenewTemp
        ? `/api/account/renew-temp/${encodeURIComponent(guid)}`
        : `/api/account/checkout-temp/${encodeURIComponent(guid)}`);
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setOrderMessage(result?.message ?? "Unable to load checkout order.");
        return;
      }

      setOrder(result.order);
      setCheckoutState(result);
      setOrderMessage(result.message);
    } catch {
      setOrderMessage("Unable to reach checkout order service.");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [guid, isRenewTemp]);

  useEffect(() => () => {
    if (paymentPopupTimerRef.current) {
      window.clearInterval(paymentPopupTimerRef.current);
    }
  }, []);

  async function continuePurchaseSetup() {
    if (!guid) return;
    setIsPayingWithBalance(true);
    setOrderMessage("");

    try {
      const response = await fetch(isRenewTemp
        ? `/api/account/renew-temp/${encodeURIComponent(guid)}/pay-with-balance`
        : `/api/account/checkout-temp/${encodeURIComponent(guid)}/pay-with-balance`, { method: "POST" });
      const result = await response.json().catch(() => null);
      setOrderMessage(result?.message ?? "Unable to mark checkout paid.");
      if (response.ok && result?.success) {
        setOrder(result.order);
        setCheckoutState(result);
        if (result.order?.fulfillmentPath) {
          window.location.href = result.order.fulfillmentPath;
        }
      }
    } catch {
      setOrderMessage("Unable to reach checkout balance service.");
    } finally {
      setIsPayingWithBalance(false);
    }
  }

  const title = isDeposit ? "Account Balance Deposit" : isRenewTemp ? "Renewal Checkout" : order?.productName ?? "Checkout Handoff";
  const total = isDeposit ? Number(amount || 0) : order?.amount;
  const orderPaid = !!order?.isPaid;
  const orderProcessed = !!(order?.processed ?? order?.isProcessed);
  const balance = checkoutState?.balance?.amount;
  const shortfall = checkoutState?.shortfall ?? 0;
  const canContinueWithBalance = !!checkoutState?.canContinueWithBalance && !!order && !orderProcessed && !isDeposit;
  const depositAmount = Math.max(Number(shortfall || 0), 0);
  const depositBrandName = checkoutState?.brandName || window.location.hostname;
  const paymentDepositUrl = depositAmount > 0
    ? `https://member5.smarterasp.net/checkout_standalone/deposit?username=${encodeURIComponent(currentUser?.login ?? "")}&amount=${encodeURIComponent(depositAmount.toFixed(2))}&brandname=${encodeURIComponent(depositBrandName)}`
    : "";

  function openPaymentPopup(url) {
    const popup = openCenteredPopup(url, "AccountPayment");
    if (!popup) {
      setOrderMessage("Your browser blocked the payment popup. Allow popups for this site, then try again.");
      return;
    }

    setIsPaymentPopupOpen(true);
    setOrderMessage("Payment popup opened. This cart will recheck your account balance when it closes.");
    if (window.focus) popup.focus();

    if (paymentPopupTimerRef.current) {
      window.clearInterval(paymentPopupTimerRef.current);
    }

    paymentPopupTimerRef.current = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(paymentPopupTimerRef.current);
        paymentPopupTimerRef.current = null;
        setIsPaymentPopupOpen(false);
        setOrderMessage("Payment popup closed. Rechecking account balance.");
        loadOrder({ quiet: true });
      }
    }, 1000);
  }

  return (
    <main className="checkout-page">
      <header className="login-header">
        <a className="brand" href="/panel" onClick={onBackToPanel} aria-label="Back to Account Panel">
          <span className="brand-mark">CP</span>
          <span>ControlPanel</span>
        </a>
        <nav className="login-links" aria-label="Checkout navigation">
          {currentUser && <span>{currentUser.login}</span>}
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </nav>
      </header>
      <section className="checkout-handoff-card">
        <span className="status-pill blue">Cart + Payment</span>
        <h1>{title}</h1>
        <p>This cart checks account balance first. If the balance is short, add funds in the secure payment popup, then this cart will recheck the balance when the popup closes.</p>
        {order && (
          <div className="checkout-status-grid">
            <div>
              <span>Payment</span>
              <strong>{orderPaid ? "Paid" : "Unpaid"}</strong>
            </div>
            <div>
              <span>Fulfillment</span>
              <strong>{orderProcessed ? "Processed" : "Waiting"}</strong>
            </div>
            <div>
              <span>Trackable</span>
              <strong>{order.trackable ? "Yes" : isRenewTemp ? "Renewal" : "No"}</strong>
            </div>
            <div>
              <span>Balance</span>
              <strong>{balance !== undefined ? formatMoney(balance) : "Checking"}</strong>
            </div>
          </div>
        )}
        <dl className="card-meta single">
          {guid && <div><dt>GUID</dt><dd>{guid}</dd></div>}
          {order?.productId !== undefined && <div><dt>Product ID</dt><dd>{order.productId}</dd></div>}
          {order?.pageType !== undefined && <div><dt>Page Type</dt><dd>{order.pageType}</dd></div>}
          <div><dt>Total</dt><dd>{formatMoney(total || 0)}</dd></div>
          {order?.info1 && <div><dt>Info 1</dt><dd>{order.info1}</dd></div>}
          {order?.info2 && <div><dt>Info 2</dt><dd>{order.info2}</dd></div>}
          {order?.renewInfo && <div><dt>Renew Info</dt><dd>{order.renewInfo}</dd></div>}
          {order?.fulfillmentPath && <div><dt>Next Step</dt><dd>{order.fulfillmentPath}</dd></div>}
          {!!shortfall && <div><dt>Remaining</dt><dd>{formatMoney(shortfall)}</dd></div>}
        </dl>
        {orderMessage && (
          orderMessage.startsWith("Loading")
            ? <LoadingState label="Loading checkout order" />
            : <p className="renewal-action-message">{orderMessage}</p>
        )}
        <div className="checkout-action-row">
          <button className="secondary-button checkout-dark-button" type="button" onClick={onBackToPanel}>
            Back
          </button>
          <button className="secondary-button checkout-dark-button" type="button" disabled={isRefreshing} onClick={() => loadOrder({ quiet: true })} title="Refresh cart">
            {isRefreshing ? <LoadingIcon label="Refreshing cart" /> : <MenuIcon name="refresh" />}
          </button>
          {canContinueWithBalance && (
            <button className="primary-button" type="button" disabled={isPayingWithBalance} onClick={continuePurchaseSetup}>
              {isPayingWithBalance ? <LoadingIcon label="Finishing purchase" /> : "Continue & Finish Purchase"}
            </button>
          )}
          {!canContinueWithBalance && paymentDepositUrl && !orderProcessed && (
            <button className="primary-button" type="button" disabled={isPaymentPopupOpen} onClick={() => openPaymentPopup(paymentDepositUrl)}>
              {isPaymentPopupOpen ? <LoadingIcon label="Payment popup open" /> : "Make Payment"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function openCenteredPopup(url, title = "Payment") {
  if (!url) return null;

  const w = 600;
  const h = 700;
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screen.left;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screen.top;
  const width = window.innerWidth || document.documentElement.clientWidth || window.screen.width;
  const height = window.innerHeight || document.documentElement.clientHeight || window.screen.height;
  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  const popupFeatures = [
    "popup=yes",
    "scrollbars=yes",
    "resizable=yes",
    `width=${Math.round(w / systemZoom)}`,
    `height=${Math.round(h / systemZoom)}`,
    `top=${Math.round(top)}`,
    `left=${Math.round(left)}`
  ].join(",");

  return window.open(url, title, popupFeatures);
}

function EmailChangeVerify({ theme, onBackToPanel, onToggleTheme }) {
  const [status, setStatus] = useState({ loading: true, success: false, message: "", newEmail: "", createdAt: null });
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const resetHash = query.get("ac") ?? "";
  const customerLogin = query.get("customerlogin") ?? "";

  useEffect(() => {
    let isMounted = true;

    async function verifyEmailChange() {
      if (!resetHash || !customerLogin) {
        setStatus({
          loading: false,
          success: false,
          message: "This email verification link is missing required information.",
          newEmail: "",
          createdAt: null
        });
        return;
      }

      try {
        const response = await fetch(`/api/account/settings/email-change/verify?ac=${encodeURIComponent(resetHash)}&customerlogin=${encodeURIComponent(customerLogin)}`);
        const result = await response.json().catch(() => null);
        if (!isMounted) return;

        setStatus({
          loading: false,
          success: response.ok && !!result?.success,
          message: result?.message ?? "Unable to verify email change link.",
          newEmail: result?.newEmail ?? "",
          createdAt: result?.createdAt ?? null
        });
      } catch {
        if (isMounted) {
          setStatus({
            loading: false,
            success: false,
            message: "Unable to reach email verification service.",
            newEmail: "",
            createdAt: null
          });
        }
      }
    }

    verifyEmailChange();
    return () => {
      isMounted = false;
    };
  }, [resetHash, customerLogin]);

  return (
    <main className="handoff-page">
      <header className="handoff-header">
        <a href="/panel" onClick={onBackToPanel}>ControlPanel</a>
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
      </header>
      <section className="handoff-card">
        <span className={status.success ? "status-pill" : "status-pill muted"}>
          {status.loading ? <LoadingIcon label="Checking email verification" /> : status.success ? "Verified" : "Needs attention"}
        </span>
        <h1>Email Verification</h1>
        {status.loading ? (
          <LoadingState label="Checking email verification link" />
        ) : (
          <>
            <p>{status.message}</p>
            <dl className="card-meta single">
              <div><dt>Account</dt><dd>{customerLogin || "N/A"}</dd></div>
              <div><dt>Pending Email</dt><dd>{status.newEmail || "N/A"}</dd></div>
              <div><dt>Created</dt><dd>{formatDate(status.createdAt)}</dd></div>
            </dl>
          </>
        )}
        <div className="checkout-actions">
          <a className="primary-button as-link" href="/panel" onClick={onBackToPanel}>Back to Account Panel</a>
        </div>
      </section>
    </main>
  );
}

function PasswordResetRequest({ theme, onBackToLogin, onToggleTheme }) {
  const [login, setLogin] = useState("jyu001");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestReset(event) {
    event.preventDefault();
    setMessage("");
    setResetUrl("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login })
      });
      const result = await response.json().catch(() => null);
      setMessage(result?.message ?? "Unable to create password reset link.");
      if (response.ok && result?.success) {
        setResetUrl(result.resetUrl ?? "");
      }
    } catch {
      setMessage("Unable to reach password reset service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand" href="/" onClick={onBackToLogin} aria-label="ControlPanel login">
          <span className="brand-mark">CP</span>
          <span>ControlPanel</span>
        </a>
        <nav className="login-links" aria-label="Top navigation">
          <button className="link-button" type="button" onClick={onBackToLogin}>Login</button>
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </nav>
      </header>

      <section className="login-card" aria-label="Password reset request">
        <div className="login-card-header">
          <div className="product-mark" aria-hidden="true">CP</div>
          <h1>Reset Password</h1>
          <p>Create a password reset link for your account username.</p>
        </div>
        <form className="login-form" onSubmit={requestReset}>
          <label>
            Username
            <input
              type="text"
              autoComplete="username"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
            />
          </label>
          {message && <p className={resetUrl ? "login-success" : "login-error"}>{message}</p>}
          {resetUrl && (
            <a className="primary-button as-link full" href={resetUrl}>
              Open Reset Link
            </a>
          )}
          <button className="primary-button full" type="submit" disabled={isSubmitting || !login.trim()}>
            {isSubmitting ? <LoadingIcon label="Creating reset link" /> : "Create Reset Link"}
          </button>
          <button className="secondary-button full" type="button" onClick={onBackToLogin}>
            Back to Login
          </button>
        </form>
      </section>
    </main>
  );
}

function PasswordResetConfirm({ theme, onBackToLogin, onToggleTheme }) {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = query.get("guid") ?? "";
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function confirmReset(event) {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
      });
      const result = await response.json().catch(() => null);
      setMessage(result?.message ?? "Unable to reset password.");
      setIsSuccess(response.ok && !!result?.success);
      if (response.ok && result?.success) {
        setPasswordForm({ newPassword: "", confirmPassword: "" });
      }
    } catch {
      setMessage("Unable to reach password reset service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand" href="/" onClick={onBackToLogin} aria-label="ControlPanel login">
          <span className="brand-mark">CP</span>
          <span>ControlPanel</span>
        </a>
        <nav className="login-links" aria-label="Top navigation">
          <button className="link-button" type="button" onClick={onBackToLogin}>Login</button>
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </nav>
      </header>

      <section className="login-card" aria-label="Password reset">
        <div className="login-card-header">
          <div className="product-mark" aria-hidden="true">CP</div>
          <h1>Choose New Password</h1>
          <p>Enter a new password with at least eight characters, one letter, and one number.</p>
        </div>
        <form className="login-form" onSubmit={confirmReset}>
          {!token && <p className="login-error">This reset link is missing its token.</p>}
          <label>
            New Password
            <input
              type="password"
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
            />
          </label>
          <label>
            Confirm New Password
            <input
              type="password"
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            />
          </label>
          {message && <p className={isSuccess ? "login-success" : "login-error"}>{message}</p>}
          <button className="primary-button full" type="submit" disabled={isSubmitting || !token}>
            {isSubmitting ? <LoadingIcon label="Saving password" /> : "Reset Password"}
          </button>
          <button className="secondary-button full" type="button" onClick={onBackToLogin}>
            Back to Login
          </button>
        </form>
      </section>
    </main>
  );
}

function Login({ onLogin, theme, onToggleTheme, onForgotPassword }) {
  const [login, setLogin] = useState("jyu001");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileConfig, setTurnstileConfig] = useState({ turnstileEnabled: false, siteKey: "" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLoginConfig() {
      try {
        const response = await fetch("/api/auth/login-config");
        const result = await response.json().catch(() => null);
        if (!cancelled && response.ok && result) {
          setTurnstileConfig({
            turnstileEnabled: !!result.turnstileEnabled,
            siteKey: result.siteKey ?? ""
          });
        }
      } catch {
        if (!cancelled) {
          setTurnstileConfig({ turnstileEnabled: false, siteKey: "" });
        }
      }
    }

    loadLoginConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!turnstileConfig.turnstileEnabled || !turnstileConfig.siteKey || !turnstileRef.current) return;

    function renderTurnstile() {
      if (!window.turnstile || !turnstileRef.current || turnstileWidgetId.current !== null) return;
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileConfig.siteKey,
        theme: theme === "light" ? "light" : "dark",
        size: "flexible",
        callback: (token) => {
          setTurnstileToken(token);
          setLoginError("");
        },
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken("")
      });
    }

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const existingScript = document.querySelector("script[data-turnstile-script='true']");
    if (existingScript) {
      existingScript.addEventListener("load", renderTurnstile, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    script.addEventListener("load", renderTurnstile, { once: true });
    document.head.appendChild(script);
  }, [turnstileConfig, theme]);

  function resetTurnstile() {
    setTurnstileToken("");
    if (window.turnstile && turnstileWidgetId.current !== null) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginError("");

    if (turnstileConfig.turnstileEnabled && !turnstileToken) {
      setLoginError("Complete the bot check before logging in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password, turnstileToken })
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setLoginError(result?.message ?? "Login failed. Please check your username and password.");
        if (turnstileConfig.turnstileEnabled) resetTurnstile();
        return;
      }

      onLogin(result.user, event);
    } catch {
      setLoginError("Unable to reach the login service. Please try again.");
      if (turnstileConfig.turnstileEnabled) resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand" href="/" aria-label="ControlPanel home">
          <span className="brand-mark login-server-icon" aria-hidden="true"><MenuIcon name="server" /></span>
          <span>ControlPanel</span>
        </a>
        <nav className="login-links" aria-label="Top navigation">
          <a href="#help">Help</a>
          <a href="#contact">Contact</a>
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </nav>
      </header>

      <section className="login-card" aria-label="Account login">
        <div className="login-card-header">
          <div className="product-mark login-server-icon" aria-hidden="true"><MenuIcon name="server" /></div>
          <h1>Log in to ControlPanel</h1>
          <p>Manage hosting, domains, VPN services, add-ons, affiliate activity, and billing in one place.</p>
        </div>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <label>
            Username
            <input
              type="text"
              placeholder="account username"
              autoComplete="username"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {turnstileConfig.turnstileEnabled && (
            <div className="turnstile-check" ref={turnstileRef} aria-label="Cloudflare bot check" />
          )}
          {loginError && <p className="login-error">{loginError}</p>}
          <button className="primary-button full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoadingIcon label="Logging in" /> : "Login"}
          </button>
          <button className="link-button login-form-link" type="button" onClick={onForgotPassword}>
            Forgot password?
          </button>
        </form>
      </section>
    </main>
  );
}

function Panel({ theme, currentUser, onLogout, onManageHosting, onToggleTheme }) {
  const initialSection = useMemo(() => {
    const section = new URLSearchParams(window.location.search).get("section");
    return sections.some((item) => item.id === section) || section === "new-order" || section === "helpdesk" ? section : "hosting";
  }, []);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [dashboard, setDashboard] = useState(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountStats, setAccountStats] = useState({
    domains: null,
    vpn: null,
    addons: null,
    billingRenewals: null,
    balance: null
  });
  const [helpdeskStatus, setHelpdeskStatus] = useState("unknown");
  const realHostingCount = dashboard?.hostingAccounts?.filter((account) => account.status === "Active").length;
  const renderedSections = sections.map((section) => {
    if (section.id === "hosting" && realHostingCount !== undefined) return { ...section, stat: String(realHostingCount) };
    if (section.id === "domain" && accountStats.domains !== null) return { ...section, stat: String(accountStats.domains) };
    if (section.id === "vpn" && accountStats.vpn !== null) return { ...section, stat: String(accountStats.vpn) };
    if (section.id === "addon" && accountStats.addons !== null) return { ...section, stat: String(accountStats.addons) };
    if (section.id === "billing" && accountStats.billingRenewals !== null) return { ...section, stat: String(accountStats.billingRenewals), statTone: "warning" };
    return section;
  });
  const activeTitle = useMemo(
    () => activeSection === "helpdesk" ? "Helpdesk" : renderedSections.find((section) => section.id === activeSection)?.label ?? "Hosting Plans",
    [activeSection, renderedSections]
  );
  const browserDomain = useMemo(() => {
    const hostname = window.location.hostname;
    if (!hostname) return "LocalHost";
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return "LocalHost";
    return hostname;
  }, []);
  const sidebarBrandName = (dashboard?.customer?.brandDomain || "smarterasp.net").toUpperCase();

  async function loadDashboard() {
    setIsDashboardLoading(true);
    setDashboardError("");

    try {
      const response = await fetch("/api/account/dashboard");
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setDashboardError(result?.message ?? "Unable to load account dashboard.");
        return;
      }

      setDashboard(result.dashboard);
    } catch {
      setDashboardError("Unable to reach account dashboard service.");
    } finally {
      setIsDashboardLoading(false);
    }
  }

  async function loadAccountStats() {
    const [domainResult, vpnResult, addonResult, billingResult] = await Promise.allSettled([
      fetch("/api/account/domains").then((response) => response.json()),
      fetch("/api/account/vpn").then((response) => response.json()),
      fetch("/api/account/addons").then((response) => response.json()),
      fetch("/api/account/billing").then((response) => response.json())
    ]);

    setAccountStats({
      domains: domainResult.status === "fulfilled" && domainResult.value?.success
        ? domainResult.value.domains?.length ?? 0
        : null,
      vpn: vpnResult.status === "fulfilled" && vpnResult.value?.success
        ? vpnResult.value.dashboard?.used ?? 0
        : null,
      addons: addonResult.status === "fulfilled" && addonResult.value?.success
        ? addonResult.value.dashboard?.activeAddons?.length ?? 0
        : null,
      billingRenewals: billingResult.status === "fulfilled" && billingResult.value?.success
        ? billingResult.value.dashboard?.renewalNotices?.length ?? 0
        : null,
      balance: billingResult.status === "fulfilled" && billingResult.value?.success
        ? billingResult.value.dashboard?.balance?.amount ?? null
        : null
    });
  }

  async function loadHelpdeskStatus() {
    try {
      const response = await fetch("/api/account/helpdesk");
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setHelpdeskStatus("unknown");
        return;
      }

      const openTickets = result.dashboard?.openTickets ?? [];
      const hasStaffReply = openTickets.some((ticket) => helpdeskStatusInfo(ticket).tone === "staff");
      if (hasStaffReply) {
        setHelpdeskStatus("staff");
      } else if (openTickets.length) {
        setHelpdeskStatus("pending");
      } else {
        setHelpdeskStatus("none");
      }
    } catch {
      setHelpdeskStatus("unknown");
    }
  }

  useEffect(() => {
    loadDashboard();
    loadAccountStats();
    loadHelpdeskStatus();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeSection]);

  const accountFunds = accountStats.balance === null ? "$0.00" : formatUsdFull(accountStats.balance);
  const headerAccountLogin = dashboard?.customer?.login ?? currentUser?.login ?? "";
  const headerCustomerId = dashboard?.customer?.customerId ?? currentUser?.customerId ?? "";
  const activeHostingPlanLabel = realHostingCount === undefined
    ? ""
    : `${realHostingCount} Active ${realHostingCount === 1 ? "Plan" : "Plans"}`;

  return (
    <div className={isMobileMenuOpen ? "app-shell mobile-menu-open" : "app-shell"}>
      <button className="mobile-menu-button" type="button" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
        <MenuIcon name="menu" />
        <span>{activeTitle}</span>
      </button>
      <button className="mobile-menu-overlay" type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" />
      <aside className="sidebar">
        <button className="mobile-menu-close" type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
          <MenuIcon name="x" />
        </button>
        <div className="sidebar-top">
          <a className="brand project-brand" href="/panel">
            <span className="brand-server-icon" aria-hidden="true">
              <MenuIcon name="server" />
            </span>
            <span className="brand-name">{sidebarBrandName}</span>
          </a>
        </div>
        <nav className="side-nav" aria-label="Account panel sections">
          {renderedSections.map((section) => (
            <button
              className={[
                "nav-item",
                section.id === activeSection ? "active" : "",
                section.tone === "order" ? "new-order-item" : ""
              ].filter(Boolean).join(" ")}
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-label">
                <MenuIcon name={section.icon} />
                <span>{section.label}</span>
              </span>
              {section.stat && (
                <strong className={[
                  "nav-stat",
                  section.statTone === "warning" ? "warning" : "",
                  section.tone === "order" ? "order" : ""
                ].filter(Boolean).join(" ")}>
                  {section.stat}
                </strong>
              )}
            </button>
          ))}
        </nav>
        <div className="support-links" aria-label="Support links">
          <p className="support-title">
            <MenuIcon name="support" />
            <span>Support</span>
          </p>
          <a href="https://member3.smarterasp.net/account/chat">
            <MenuIcon name="chat" />
            <span>24/7 Live Chat</span>
          </a>
          <a href="#knowledge-base">
            <MenuIcon name="book" />
            <span>Knowledge Base</span>
          </a>
          <button type="button" onClick={() => setActiveSection("helpdesk")}>
            <MenuIcon name="ticket" />
            <span>24/7 Helpdesk</span>
            <span
              aria-hidden="true"
              className={[
                "support-status-dot",
                helpdeskStatus === "staff" ? "blue" : "",
                helpdeskStatus === "pending" ? "red" : ""
              ].filter(Boolean).join(" ")}
            />
          </button>
        </div>
        <div className="reward-card" aria-label="Account balance">
          <ProfileAvatar username={currentUser?.login ?? "Account"} />
          <div>
            <strong>{(currentUser?.login ?? "Account").toUpperCase()}</strong>
            <span>Funds {accountFunds}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <div className="workspace-header">
          <div>
            <p className="kicker">Your Account Panel</p>
            <div className="workspace-title-row">
              <h1>{activeTitle}</h1>
              {activeSection === "affiliate" ? <span className="status-pill blue title-badge">Pays 60%</span> : null}
            </div>
            {activeSection === "hosting" && activeHostingPlanLabel ? (
              <p className="workspace-title-meta">{activeHostingPlanLabel}</p>
            ) : null}
          </div>
          <div className="workspace-actions">
            {headerAccountLogin ? (
              <span className="workspace-account-label">
                {headerAccountLogin}{headerCustomerId ? ` (ID: ${headerCustomerId})` : ""}
              </span>
            ) : null}
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <button className="secondary-button compact" type="button" onClick={onLogout}>Logout</button>
          </div>
        </div>
        <DashboardSection
          activeSection={activeSection}
          currentUser={currentUser}
          dashboard={dashboard}
          dashboardError={dashboardError}
          isDashboardLoading={isDashboardLoading}
          onChangeSection={setActiveSection}
          onManageHosting={onManageHosting}
          onReloadDashboard={loadDashboard}
        />
      </main>
    </div>
  );
}

function formatUsdShort(amount) {
  if (amount === null || amount === undefined || amount === "") return "$0";
  const value = Number(amount);
  if (Number.isNaN(value)) return "$0";
  return `$${Math.round(value)}`;
}

function formatUsdFull(amount) {
  if (amount === null || amount === undefined || amount === "") return "$0.00";
  const value = Number(amount);
  if (Number.isNaN(value)) return "$0.00";
  return `$${value.toFixed(2)}`;
}

function profileAvatarStyle(username) {
  const palette = [
    ["#30a46c", "#ffffff"],
    ["#3291ff", "#ffffff"],
    ["#f59e0b", "#111111"],
    ["#ef4444", "#ffffff"],
    ["#8b5cf6", "#ffffff"],
    ["#14b8a6", "#06201d"]
  ];
  const seed = [...(username || "account")].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  const [backgroundColor, color] = palette[seed % palette.length];
  return { backgroundColor, color };
}

function ProfileAvatar({ username }) {
  const label = (username || "account").trim();
  const initial = label.charAt(0).toUpperCase() || "A";
  return (
    <span className="profile-avatar" style={profileAvatarStyle(label)} aria-hidden="true">
      {initial}
    </span>
  );
}

async function writeTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.left = "-9999px";
    textarea.style.position = "fixed";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    try {
      document.execCommand("copy");
      return true;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

function HostingControlPanel({ theme, currentUser, onBackToPanel, onLogout, onToggleTheme }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [hostingPlanOptions, setHostingPlanOptions] = useState([]);
  const [selectedCpId, setSelectedCpId] = useState(0);
  const [isHostingPlanMenuOpen, setIsHostingPlanMenuOpen] = useState(false);
  const [accountFunds, setAccountFunds] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeTitle = useMemo(
    () => controlPanelSections.find((section) => section.id === activeSection)?.label ?? "Dashboard",
    [activeSection]
  );
  const selectedHostingPlan = hostingPlanOptions.find((plan) => plan.cpId === selectedCpId) ?? hostingPlanOptions[0];
  const selectedPlanLabel = selectedHostingPlan?.cpLogin || selectedHostingPlan?.primaryDomain || "Select Hosting Plan";

  useEffect(() => {
    let isMounted = true;

    async function loadHostingPlans() {
      try {
        const [dashboardResponse, billingResponse] = await Promise.all([
          fetch("/api/account/dashboard"),
          fetch("/api/account/billing")
        ]);
        const result = await dashboardResponse.json().catch(() => null);
        const billingResult = await billingResponse.json().catch(() => null);
        if (!isMounted || !dashboardResponse.ok || !result?.success) return;

        const plans = result.dashboard?.hostingAccounts ?? [];
        setHostingPlanOptions(plans);
        if (billingResponse.ok && billingResult?.success) {
          setAccountFunds(formatUsdFull(billingResult.dashboard?.balance?.amount ?? 0));
        }
        if (plans.length) {
          setSelectedCpId((currentCpId) => currentCpId || plans[0].cpId);
        }
      } catch {
        if (isMounted) setHostingPlanOptions([]);
      }
    }

    loadHostingPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeSection, selectedCpId]);

  return (
    <div className={isMobileMenuOpen ? "app-shell mobile-menu-open" : "app-shell"}>
      <button className="mobile-menu-button" type="button" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
        <MenuIcon name="menu" />
        <span>{activeTitle}</span>
      </button>
      <button className="mobile-menu-overlay" type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" />
      <aside className="sidebar">
        <button className="mobile-menu-close" type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
          <MenuIcon name="x" />
        </button>
        <div className="sidebar-top">
          <div className="mock-plan-select-wrap">
            <button
              aria-expanded={isHostingPlanMenuOpen}
              aria-haspopup="listbox"
              className="mock-plan-trigger"
              type="button"
              onClick={() => setIsHostingPlanMenuOpen((open) => !open)}
            >
              <span className="mock-plan-trigger-label">
                <MenuIcon name="server" />
                <span>{selectedPlanLabel}</span>
              </span>
              <MenuIcon name="chevron-down" />
            </button>
            {isHostingPlanMenuOpen && (
              <div className="mock-plan-menu" role="listbox" aria-label="Hosting plans">
                {hostingPlanOptions.map((plan) => (
                  <button
                    aria-selected={selectedCpId === plan.cpId}
                    className={selectedCpId === plan.cpId ? "mock-plan-option active" : "mock-plan-option"}
                    key={plan.cpId}
                    role="option"
                    type="button"
                    onClick={() => {
                      setSelectedCpId(plan.cpId);
                      setIsHostingPlanMenuOpen(false);
                    }}
                  >
                    <span className="mock-plan-option-label">
                      <MenuIcon name="server" />
                      <span>{plan.cpLogin || plan.primaryDomain}</span>
                    </span>
                  </button>
                ))}
                {!hostingPlanOptions.length && (
                  <button className="mock-plan-option" type="button">
                    <span className="mock-plan-option-label">
                      <MenuIcon name="server" />
                      <LoadingIcon label="Loading plans" />
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <nav className="side-nav" aria-label="Hosting control panel sections">
          <button className="nav-item back-account-item" type="button" onClick={onBackToPanel}>
            <span className="nav-label">
              <MenuIcon name="back" />
              <span>Back to Account</span>
            </span>
          </button>
          {controlPanelSections.map((section) => (
            <button
              className={section.id === activeSection ? "nav-item active" : "nav-item"}
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-label">
                <MenuIcon name={section.icon} />
                <span>{section.label}</span>
              </span>
            </button>
          ))}
        </nav>
        <div className="support-links" aria-label="Support links">
          <p className="support-title">
            <MenuIcon name="support" />
            <span>Support</span>
          </p>
          <a href="https://member3.smarterasp.net/account/chat">
            <MenuIcon name="chat" />
            <span>24/7 Live Chat</span>
          </a>
          <a href="http://localhost:5056/panel#knowledge-base">
            <MenuIcon name="book" />
            <span>Knowledge Base</span>
          </a>
          <a href="https://member3.smarterasp.net/account/helpdesk">
            <MenuIcon name="ticket" />
            <span>Helpdesk</span>
          </a>
        </div>
        <div className="reward-card" aria-label="Account balance">
          <ProfileAvatar username={currentUser?.login ?? "Account"} />
          <div>
            <strong>{(currentUser?.login ?? "Account").toUpperCase()}</strong>
            <span>Funds {accountFunds ?? "--"}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <div className="workspace-header">
          <div>
            <p className="kicker">Your hosting control panel</p>
            <h1>{activeTitle}</h1>
          </div>
          <div className="workspace-actions">
            <button className="secondary-button compact" type="button" onClick={onBackToPanel}>Back to Plans</button>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <button className="secondary-button compact" type="button" onClick={onLogout}>Logout</button>
          </div>
        </div>
        {activeSection === "dashboard" && <HostingDashboard cpId={selectedCpId} />}
        {activeSection === "websites" && <WebsitesSection cpId={selectedCpId} />}
        {activeSection === "databases" && <DatabasesSection cpId={selectedCpId} />}
        {activeSection === "emails" && <EmailsSection cpId={selectedCpId} />}
        {activeSection === "files" && <FilesSection cpId={selectedCpId} />}
        {activeSection === "apps" && <AppsSection cpId={selectedCpId} />}
        {activeSection === "ftp" && <FtpSection cpId={selectedCpId} />}
        {activeSection === "dns" && <DomainServicesSection mode="dns" cpId={selectedCpId} />}
        {activeSection === "cdn" && <DomainServicesSection mode="cdn" cpId={selectedCpId} />}
        {activeSection === "ssl" && <DomainServicesSection mode="ssl" cpId={selectedCpId} />}
        {activeSection === "advance" && <AdvanceSection cpId={selectedCpId} />}
        {!["dashboard", "websites", "databases", "emails", "files", "apps", "ftp", "dns", "cdn", "ssl", "advance"].includes(activeSection) && <HostingCpPlaceholder title={activeTitle} />}
      </main>
    </div>
  );
}

function hostingApiUrl(path, cpId) {
  if (!cpId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}cpId=${encodeURIComponent(cpId)}`;
}

function useSectionViewMode(sectionKey, itemCount) {
  const storageKey = `controlpanel-view-${sectionKey}`;
  const automaticMode = itemCount > 4 ? "table" : "cards";
  const [viewMode, setViewModeState] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved === "cards" || saved === "table" ? saved : automaticMode;
  });
  const [hasUserPreference, setHasUserPreference] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved === "cards" || saved === "table";
  });

  useEffect(() => {
    if (!hasUserPreference) {
      setViewModeState(automaticMode);
    }
  }, [automaticMode, hasUserPreference]);

  function setViewMode(nextMode) {
    setHasUserPreference(true);
    setViewModeState(nextMode);
    localStorage.setItem(storageKey, nextMode);
  }

  return [viewMode, setViewMode];
}

function ViewModeToggle({ viewMode, onChange, label }) {
  return (
    <div className="view-toggle" aria-label={label}>
      <button
        className={viewMode === "cards" ? "active" : ""}
        type="button"
        onClick={() => onChange("cards")}
        title="Cards"
        aria-label="Cards"
      >
        <MenuIcon name="cards" />
      </button>
      <button
        className={viewMode === "table" ? "active" : ""}
        type="button"
        onClick={() => onChange("table")}
        title="Table"
        aria-label="Table"
      >
        <MenuIcon name="table" />
      </button>
    </div>
  );
}

function isTemporaryHostingDomain(value) {
  const domain = String(value || "").toLowerCase();
  return domain.endsWith(".etempurl.com") || domain.includes("-site") && domain.endsWith(".etempurl.com") || domain.endsWith(".site4now.net");
}

async function createPanelTestActivity(cpId, payload) {
  throw new Error(`${payload?.from || payload?.server || "This action"} needs a real provider gateway before it can run. No row was created.`);
}

async function createHostingWorkqueue(cpId, payload) {
  const response = await fetch("/api/hosting/workqueue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpId, ...payload })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? "Unable to queue worker job.");
  }

  return result;
}

async function createHostingRealTest(cpId, area, fields) {
  const response = await fetch("/api/hosting/real-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpId, area, fields })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? "Unable to create real test data.");
  }

  return result;
}

async function provisionHosting(path, cpId, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpId, ...payload })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? "Unable to run provisioning action.");
  }

  return result;
}

function HostingDashboard({ cpId }) {
  const [dashboard, setDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [copiedDns, setCopiedDns] = useState(false);
  const serverLogs = [
    {
      timeCreated: "6/10/2026 6:16:49 PM",
      message: "A process serving the selected hosting application pool suffered a fatal communication error with the Windows Process Activation Service. The process id was '13612'. The data field contains the error number."
    },
    {
      timeCreated: "6/9/2026 2:16:59 PM",
      message: "A process serving the selected hosting application pool suffered a fatal communication error with the Windows Process Activation Service. The process id was '84032'. The data field contains the error number."
    }
  ];
  const usageStats = dashboard?.metrics?.length
    ? dashboard.metrics.map((metric) => [metric.value, metric.label])
    : [
      ["3072 MB", "Ram Quota"],
      ["107 GB", "Bandwidth Usage"],
      ["85.85 GB", "Disk Usage"],
      ["248K", "File Usage"]
    ];
  const ramQuota = dashboard?.ramQuotaMb ?? 3072;
  const ramUsed = dashboard?.ramUsedMb ?? 333;
  const ramPercentage = Math.max(0, Math.min(100, Math.round((ramUsed / Math.max(ramQuota, 1)) * 100)));
  const dnsServers = dashboard?.dnsServers?.length ? dashboard.dnsServers : ["NS1.SITE4NOW.NET", "NS2.SITE4NOW.NET", "NS3.SITE4NOW.NET"];
  const migrations = securityDashboard?.migrations ?? [];
  const visibleMigrations = migrations.slice(0, 3);

  async function loadHostingDashboard() {
    setIsLoadingDashboard(true);
    setDashboardError("");
    try {
      const dashboardResponse = await fetch(hostingApiUrl("/api/hosting/dashboard", cpId));
      const result = await dashboardResponse.json().catch(() => null);
      if (!dashboardResponse.ok || !result?.success) {
        setDashboardError(result?.message ?? "Unable to load hosting dashboard.");
        return;
      }

      setDashboard(result.dashboard);
      fetch(hostingApiUrl("/api/hosting/security", cpId))
        .then((response) => response.json().then((securityResult) => ({ response, securityResult })))
        .then(({ response, securityResult }) => {
          if (response.ok && securityResult?.success) {
            setSecurityDashboard(securityResult.dashboard);
          }
        })
        .catch(() => { });
    } catch {
      setDashboardError("Unable to reach hosting dashboard service.");
    } finally {
      setIsLoadingDashboard(false);
    }
  }

  useEffect(() => {
    loadHostingDashboard();
  }, [cpId]);

  async function copyDnsServers() {
    const ok = await writeTextToClipboard(dnsServers.join("\n"));
    if (!ok) return;
    setCopiedDns(true);
    window.setTimeout(() => setCopiedDns(false), 1400);
  }

  return (
    <section className="cp-dashboard">
      <article className="panel-card cp-context-card">
        <div>
          <span className="status-pill blue">{isLoadingDashboard ? <LoadingIcon label="Loading dashboard" /> : dashboard?.status ?? "Live CP"}</span>
          <h2>Hosting Overview</h2>
          <p>{dashboard?.primaryDomain || "Primary hosting context"}</p>
        </div>
        <dl className="cp-context-meta">
          <div><dt>Plan Type</dt><dd>{dashboard?.webHostType || "ASP.NET hosting"}</dd></div>
          <div><dt>Server</dt><dd>{dashboard?.serverId || "winhost"}</dd></div>
          <div><dt>Websites</dt><dd>{dashboard?.siteCount ?? 0}</dd></div>
          <div><dt>Domains</dt><dd>{dashboard?.domainCount ?? 0}</dd></div>
        </dl>
        <RefreshButton onClick={loadHostingDashboard} />
      </article>
      {dashboardError && (
        <div className="panel-card dashboard-error-panel">
          <p>{dashboardError}</p>
          <IconActionButton label="Retry" onClick={loadHostingDashboard} />
        </div>
      )}
      {!!visibleMigrations.length && (
        <article className="panel-card migration-notice-card">
          <div>
            <span className="status-pill warning">Migration Notice</span>
            <h2>Recent Server Migration</h2>
            <p>Your hosting account has been migrated to the new server. The old server will be off soon. If you see any issues, please contact support.</p>
          </div>
          <div className="runtime-row-grid">
            {visibleMigrations.map((migration) => (
              <article className="runtime-row-card" key={migration.id}>
                <div>
                  <span className="status-pill muted">{migration.status || "Migration"}</span>
                  <strong>Migration #{migration.id}</strong>
                  <p>{migration.sourceServer || "source"} to {migration.destinationServer || "destination"}</p>
                </div>
                <dl>
                  <div><dt>Created</dt><dd>{migration.createDate ? formatDateTime(migration.createDate) : "-"}</dd></div>
                  <div><dt>Cleaned</dt><dd>{migration.cleaned ? "Yes" : "No"}</dd></div>
                  <div><dt>Cancelled</dt><dd>{migration.cancelled ? "Yes" : "No"}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </article>
      )}
      <article className="panel-card ram-card">
        <div className="ram-meter" style={{ "--ram-percent": `${ramPercentage}%` }} aria-label={`RAM usage ${ramPercentage} percent`}>
          <span>{ramPercentage}%</span>
          <small>{ramUsed} MB used</small>
        </div>
        <div className="ram-copy">
          <span className="status-pill blue">RAM Usage</span>
          <h2>Ram Usage</h2>
          <p>Current memory usage for this hosting plan.</p>
          <div className="ram-actions">
            <button className="secondary-button compact" type="button">Recycle Pool</button>
            <button className="secondary-button compact" type="button">Manage Pool</button>
            <button className="primary-button compact" type="button">+ Ram</button>
          </div>
        </div>
      </article>

      <article className="panel-card dns-card">
        <h2>Server Details</h2>
        <dl>
          <div>
            <dt className="dns-label-row">
              <span>DNS Servers</span>
              <button
                aria-label="Copy DNS servers"
                className="icon-copy-button"
                title={copiedDns ? "Copied" : "Copy DNS servers"}
                type="button"
                onClick={copyDnsServers}
              >
                {copiedDns ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="9" y="9" width="10" height="10" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </dt>
            {dnsServers.map((server) => <dd key={server}>{server}</dd>)}
          </div>
          <div>
            <dt>IP Address</dt>
            <dd>{dashboard?.ipAddress || "208.98.35.146"}</dd>
          </div>
        </dl>
      </article>

      <div className="usage-grid">
        {usageStats.map(([value, label]) => (
          <article className="panel-card usage-stat" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>

      <article className="panel-card server-log-card">
        <h2>Server Log</h2>
        <div className="server-log-table" role="table" aria-label="Server Log">
          <div className="server-log-head" role="row">
            <span role="columnheader">TimeCreated</span>
            <span role="columnheader">Message</span>
          </div>
          {serverLogs.map((log) => (
            <div className="server-log-row" role="row" key={log.timeCreated}>
              <time dateTime={log.timeCreated}>{log.timeCreated}</time>
              <p>{log.message}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function HostingCpPlaceholder({ title }) {
  return (
    <section className="panel-card cp-placeholder">
      <span className="status-pill blue">Mock page</span>
      <h2>{title}</h2>
      <p>This section is reserved for the future hosting control panel. No real functions are connected yet.</p>
    </section>
  );
}

function WebsitesSection({ cpId }) {
  const { reload: reloadActivity } = useHostingActivity(cpId);
  const sitesRequestId = useRef(0);
  const [siteRecords, setSiteRecords] = useState([]);
  const [viewMode, setViewMode] = useSectionViewMode("cp-websites", siteRecords.length);
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [sitesError, setSitesError] = useState("");
  const [websiteMessage, setWebsiteMessage] = useState("");
  const [selectedSiteKey, setSelectedSiteKey] = useState("");
  const [newSiteDraft, setNewSiteDraft] = useState({ name: "codex-test-site", domain: "codex-test.local", folder: "www\\codex-test-site", runtime: "v4.0" });
  const [domainDraft, setDomainDraft] = useState({ domain: "newdomain.com", mode: "Add Domain", createDns: true });
  const [pathDraft, setPathDraft] = useState({ path: "/www/sample.com", runtime: "ASP.NET 4.x Integrated", coreMode: "In Process" });
  const [ipDenyDraft, setIpDenyDraft] = useState({ ip: "203.0.113.10", mask: "255.255.255.255", mode: "Deny IP" });
  const [envDraft, setEnvDraft] = useState({ key: "ASPNETCORE_ENVIRONMENT", value: "Production", scope: "Site" });
  const [poolDraft, setPoolDraft] = useState({ action: "Recycle Pool", memory: "1024", mode: "64-bit" });
  const [activeWebsiteFunction, setActiveWebsiteFunction] = useState(null);
  const [isLoadingWebsiteFunction, setIsLoadingWebsiteFunction] = useState(false);
  const [websiteFunctionError, setWebsiteFunctionError] = useState("");
  const [websiteFunctionFields, setWebsiteFunctionFields] = useState({});
  const [websiteFunctionMessage, setWebsiteFunctionMessage] = useState("");

  async function loadHostingSites() {
    const requestId = ++sitesRequestId.current;
    setIsLoadingSites(true);
    setSiteRecords([]);
    setSitesDashboard(null);
    setSelectedSiteKey("");
    setSitesError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/sites", cpId));
      const result = await response.json();
      if (requestId !== sitesRequestId.current) return;

      if (!response.ok || !result.success) {
        setSitesError(result?.message ?? "Unable to load websites.");
        return;
      }

      setSitesDashboard(result.dashboard);
      const loadedSites = result.dashboard?.sites?.map(mapHostingSiteToUi) ?? [];
      if (loadedSites.length) {
        setSiteRecords(loadedSites);
        setSelectedSiteKey((current) => current || loadedSites[0].siteKey);
      } else {
        setSiteRecords([]);
        setSelectedSiteKey("");
      }
    } catch {
      if (requestId !== sitesRequestId.current) return;
      setSitesError("Unable to reach website service.");
    } finally {
      if (requestId !== sitesRequestId.current) return;
      setIsLoadingSites(false);
    }
  }

  useEffect(() => {
    setSiteRecords([]);
    setSitesDashboard(null);
    setSelectedSiteKey("");
    setSitesError("");
    setIsLoadingSites(true);
    loadHostingSites();
  }, [cpId]);

  function updateSiteName(index, siteName) {
    setSiteRecords((currentSites) =>
      currentSites.map((site, siteIndex) => (siteIndex === index ? { ...site, siteName } : site))
    );
  }

  const selectedSite = siteRecords.find((site) => site.siteKey === selectedSiteKey) ?? siteRecords[0] ?? null;

  async function queueWebsiteTest(action, site = null, target = "", details = "") {
    setWebsiteMessage("");
    const selected = site ?? selectedSite;
    if (["Lock Site", "Unlock Site", "Permissions"].includes(action) && selected) {
      try {
        const result = await createHostingWorkqueue(cpId, {
          type: "perm",
          zipFile: legacySitePath(selected, sitesDashboard?.cpLogin),
          dstFolder: action === "Lock Site" ? "1" : "3",
          serverId: "",
          data1: details || action,
          siteOwner: selected.siteName,
          notifyEmail: "website-manager"
        });
        setWebsiteMessage(result.message);
        await reloadActivity();
        return;
      } catch (error) {
        setWebsiteMessage(error.message);
        return;
      }
    }

    if (action === "Create Dedicated Pool" && selected) {
      try {
        const poolName = `${sitesDashboard?.cpLogin || "pool"}-${workerSlug(selected.siteName)}`;
        const result = await createHostingWorkqueue(cpId, {
          type: "createpool",
          zipFile: "createpool",
          dstFolder: poolName,
          serverId: "",
          data1: details || poolDraft.mode,
          siteOwner: selected.siteName,
          notifyEmail: "website-manager"
        });
        setWebsiteMessage(result.message);
        await reloadActivity();
        return;
      } catch (error) {
        setWebsiteMessage(error.message);
        return;
      }
    }

    try {
      await createPanelTestActivity(cpId, {
        from: site ? `site:${site.siteName}` : `website:${action}`,
        to: target || (site ? site.mappedDomains?.[0]?.label || site.siteName : "/panel-test/websites"),
        server: "website-manager",
        note: details || `Website gateway required for ${action}`
      });
      setWebsiteMessage(`${action} needs the legacy website gateway before it can run.`);
      await reloadActivity();
    } catch (error) {
      setWebsiteMessage(error.message);
    }
  }

  function queueSelectedWebsiteAction(action, details = "") {
    queueWebsiteTest(action, selectedSite, "", details);
  }

  async function openWebsiteFunction(action, site = null) {
    const selected = site ?? selectedSite;
    const key = websiteMoreFunctionKeyByLabel[action] ?? action;
    if (!selected?.siteUid || !key) {
      queueWebsiteTest(action, selected);
      return;
    }

    setWebsiteFunctionError("");
    setWebsiteFunctionMessage("");
    setWebsiteFunctionFields({});
    setIsLoadingWebsiteFunction(true);
    setActiveWebsiteFunction({ site: selected, label: action, key, details: null });
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/sites/${selected.siteUid}/functions/${key}`, cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setWebsiteFunctionError(result?.message ?? "Unable to load website function.");
        return;
      }

      const fields = Object.fromEntries((result.function?.fields ?? []).map((field) => [field, defaultWebsiteFunctionField(field, selected)]));
      setWebsiteFunctionFields(fields);
      setActiveWebsiteFunction({ site: selected, label: result.function?.label ?? action, key, details: result.function });
    } catch {
      setWebsiteFunctionError("Unable to reach website function API.");
    } finally {
      setIsLoadingWebsiteFunction(false);
    }
  }

  async function submitWebsiteFunction(action = "") {
    if (!activeWebsiteFunction?.site?.siteUid || !activeWebsiteFunction?.key) return;
    setWebsiteFunctionMessage("");
    setWebsiteFunctionError("");
    try {
      const response = await fetch(`/api/hosting/sites/${activeWebsiteFunction.site.siteUid}/functions/${activeWebsiteFunction.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId, action, fields: websiteFunctionFields })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setWebsiteFunctionError(result?.message ?? "Website function failed.");
        return;
      }

      setWebsiteFunctionMessage(result.message);
      await loadHostingSites();
      await reloadActivity();
      await openWebsiteFunction(activeWebsiteFunction.label, activeWebsiteFunction.site);
    } catch {
      setWebsiteFunctionError("Unable to run website function.");
    }
  }

  async function submitNewSiteDraft(event) {
    event?.preventDefault();
    setWebsiteMessage("");
    try {
      const result = await provisionHosting("/api/hosting/sites/provision", cpId, {
        siteName: newSiteDraft.name,
        domain: newSiteDraft.domain,
        folder: newSiteDraft.folder,
        netVersion: newSiteDraft.runtime,
        serverId: ""
      });
      setWebsiteMessage(result.message);
      await loadHostingSites();
      await reloadActivity();
    } catch (error) {
      setWebsiteMessage(error.message);
    }
  }

  function submitDomainDraft(event) {
    event.preventDefault();
    if (isTemporaryHostingDomain(domainDraft.domain)) {
      setWebsiteMessage("Domain functions are not tested on temporary hosting URLs. Use a mapped customer domain instead.");
      return;
    }
    queueSelectedWebsiteAction(
      domainDraft.mode,
      `Domain binding request: site ${selectedSite?.siteName || "selected site"}; domain ${domainDraft.domain}; action ${domainDraft.mode}; create DNS ${domainDraft.createDns ? "yes" : "no"}`
    );
  }

  function submitPathRuntimeDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      "Path / Runtime",
      `Runtime request: site ${selectedSite?.siteName || "selected site"}; path ${pathDraft.path}; runtime ${pathDraft.runtime}; core mode ${pathDraft.coreMode}`
    );
  }

  function submitIpDenyDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      ipDenyDraft.mode,
      `IP restriction request: site ${selectedSite?.siteName || "selected site"}; ip ${ipDenyDraft.ip}; mask ${ipDenyDraft.mask}; action ${ipDenyDraft.mode}`
    );
  }

  function submitEnvDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      "Environment Variable",
      `Environment variable request: site ${selectedSite?.siteName || "selected site"}; scope ${envDraft.scope}; ${envDraft.key}=${envDraft.value}`
    );
  }

  function submitPoolDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      poolDraft.action,
      `App pool request: site ${selectedSite?.siteName || "selected site"}; action ${poolDraft.action}; memory ${poolDraft.memory} MB; mode ${poolDraft.mode}`
    );
  }

  function refreshWebsitesSection() {
    loadHostingSites();
    reloadActivity();
  }

  return (
    <section className="websites-section">
      <div className="website-toolbar panel-card">
        <div className="website-actions">
          <button className="primary-button compact" type="button" onClick={() => submitNewSiteDraft()}>+ New Site</button>
          <button className="secondary-button compact" type="button" onClick={() => queueWebsiteTest("+ Sub Domain")}>+ Sub Domain</button>
          <button className="secondary-button compact" type="button" onClick={() => queueWebsiteTest("+ Automated Backups")}>+ Automated Backups</button>
        </div>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label="Website view mode" />
      </div>

      <div className="panel-card website-live-summary">
        <div>
          <span className="status-pill blue">{isLoadingSites ? <LoadingIcon label="Loading hosting websites" /> : "Live websites"}</span>
          <p>{sitesDashboard ? `${siteRecords.length} sites` : "Checking website list"}</p>
        </div>
        <RefreshButton onClick={refreshWebsitesSection} />
      </div>

      {websiteMessage && <p className="sandbox-message">{websiteMessage}</p>}
      {sitesError && (
        <div className="panel-card dashboard-error-panel">
          <p>{sitesError}</p>
          <IconActionButton label="Retry" onClick={loadHostingSites} />
        </div>
      )}
      {!isLoadingSites && !sitesError && !siteRecords.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No websites</span>
          <h2>No websites found</h2>
          <p>This hosting account does not have any visible website rows in cp_config_Sites.</p>
        </div>
      )}

      {!!siteRecords.length && (viewMode === "cards" ? (
        <WebsiteCards sites={siteRecords} onUpdateSiteName={updateSiteName} onQueueAction={queueWebsiteTest} onFunctionAction={openWebsiteFunction} />
      ) : (
        <WebsiteTable sites={siteRecords} onUpdateSiteName={updateSiteName} onQueueAction={queueWebsiteTest} onFunctionAction={openWebsiteFunction} />
      ))}

      {!!siteRecords.length && (
        <section className="panel-card website-more-functions">
          <div className="website-more-header">
            <div>
              <span className="status-pill blue">More Functions</span>
              <h2>Website Tools</h2>
              <p>Worker-backed actions queue immediately. IIS/domain/provider actions stay gated until their remote helper is mapped.</p>
            </div>
            <label>
              Site
              <select value={selectedSite?.siteKey || ""} onChange={(event) => setSelectedSiteKey(event.target.value)}>
                {siteRecords.map((site) => (
                  <option key={site.siteKey} value={site.siteKey}>{site.siteName}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="website-function-form-grid">
            <form className="website-function-form" onSubmit={submitNewSiteDraft}>
              <span className="status-pill blue">New Site</span>
              <label>
                Site Name
                <input value={newSiteDraft.name} onChange={(event) => setNewSiteDraft((draft) => ({ ...draft, name: event.target.value }))} />
              </label>
              <label>
                Domain
                <input value={newSiteDraft.domain} onChange={(event) => setNewSiteDraft((draft) => ({ ...draft, domain: event.target.value }))} />
              </label>
              <label>
                Folder
                <input value={newSiteDraft.folder} onChange={(event) => setNewSiteDraft((draft) => ({ ...draft, folder: event.target.value }))} />
              </label>
              <label>
                Runtime
                <select value={newSiteDraft.runtime} onChange={(event) => setNewSiteDraft((draft) => ({ ...draft, runtime: event.target.value }))}>
                  <option value="v4.0">ASP.NET 4.x Integrated</option>
                  <option value="v4.0-Classic">ASP.NET 4.x Classic</option>
                  <option value="core">.NET Core</option>
                  <option value="php">PHP</option>
                </select>
              </label>
              <button className="primary-button compact" type="submit">Create Site</button>
            </form>

            <form className="website-function-form" onSubmit={submitDomainDraft}>
              <span className="status-pill blue">Domain Binding</span>
              <label>
                Domain
                <input value={domainDraft.domain} onChange={(event) => setDomainDraft((draft) => ({ ...draft, domain: event.target.value }))} />
              </label>
              <label>
                Action
                <select value={domainDraft.mode} onChange={(event) => setDomainDraft((draft) => ({ ...draft, mode: event.target.value }))}>
                  <option>Add Domain</option>
                  <option>Add Subdomain</option>
                  <option>Move Domain</option>
                  <option>Remove Domain</option>
                  <option>Bind VPS Domain</option>
                </select>
              </label>
              <label className="checkbox-line">
                <input type="checkbox" checked={domainDraft.createDns} onChange={(event) => setDomainDraft((draft) => ({ ...draft, createDns: event.target.checked }))} />
                Create DNS zone
              </label>
              <button className="primary-button compact" type="submit">Review Action</button>
            </form>

            <form className="website-function-form" onSubmit={submitPathRuntimeDraft}>
              <span className="status-pill blue">Path / Runtime</span>
              <label>
                Site Path
                <input value={pathDraft.path} onChange={(event) => setPathDraft((draft) => ({ ...draft, path: event.target.value }))} />
              </label>
              <label>
                Runtime
                <select value={pathDraft.runtime} onChange={(event) => setPathDraft((draft) => ({ ...draft, runtime: event.target.value }))}>
                  <option>ASP.NET 4.x Integrated</option>
                  <option>ASP.NET 4.x Classic</option>
                  <option>ASP.NET 2.0 Classic</option>
                  <option>.NET Core</option>
                  <option>PHP 8.x</option>
                </select>
              </label>
              <label>
                Core Mode
                <select value={pathDraft.coreMode} onChange={(event) => setPathDraft((draft) => ({ ...draft, coreMode: event.target.value }))}>
                  <option>In Process</option>
                  <option>Out of Process</option>
                </select>
              </label>
              <button className="primary-button compact" type="submit">Review Action</button>
            </form>

            <form className="website-function-form" onSubmit={submitIpDenyDraft}>
              <span className="status-pill blue">IP Restrictions</span>
              <label>
                IP Address
                <input value={ipDenyDraft.ip} onChange={(event) => setIpDenyDraft((draft) => ({ ...draft, ip: event.target.value }))} />
              </label>
              <label>
                Subnet Mask
                <input value={ipDenyDraft.mask} onChange={(event) => setIpDenyDraft((draft) => ({ ...draft, mask: event.target.value }))} />
              </label>
              <label>
                Mode
                <select value={ipDenyDraft.mode} onChange={(event) => setIpDenyDraft((draft) => ({ ...draft, mode: event.target.value }))}>
                  <option>Deny IP</option>
                  <option>Remove Deny Rule</option>
                  <option>Dynamic IP Protection</option>
                </select>
              </label>
              <button className="primary-button compact" type="submit">Review Action</button>
            </form>

            <form className="website-function-form" onSubmit={submitEnvDraft}>
              <span className="status-pill blue">Environment</span>
              <label>
                Key
                <input value={envDraft.key} onChange={(event) => setEnvDraft((draft) => ({ ...draft, key: event.target.value }))} />
              </label>
              <label>
                Value
                <input value={envDraft.value} onChange={(event) => setEnvDraft((draft) => ({ ...draft, value: event.target.value }))} />
              </label>
              <label>
                Scope
                <select value={envDraft.scope} onChange={(event) => setEnvDraft((draft) => ({ ...draft, scope: event.target.value }))}>
                  <option>Site</option>
                  <option>Application Pool</option>
                </select>
              </label>
              <button className="primary-button compact" type="submit">Review Action</button>
            </form>

            <form className="website-function-form" onSubmit={submitPoolDraft}>
              <span className="status-pill blue">App Pool</span>
              <label>
                Action
                <select value={poolDraft.action} onChange={(event) => setPoolDraft((draft) => ({ ...draft, action: event.target.value }))}>
                  <option>Recycle Pool</option>
                  <option>Start Pool</option>
                  <option>Stop Pool</option>
                  <option>Create Dedicated Pool</option>
                  <option>Delete Pool</option>
                  <option>Enable Load User Profile</option>
                </select>
              </label>
              <label>
                Memory MB
                <input type="number" min="128" max="8192" value={poolDraft.memory} onChange={(event) => setPoolDraft((draft) => ({ ...draft, memory: event.target.value }))} />
              </label>
              <label>
                Mode
                <select value={poolDraft.mode} onChange={(event) => setPoolDraft((draft) => ({ ...draft, mode: event.target.value }))}>
                  <option>64-bit</option>
                  <option>32-bit</option>
                  <option>.NET Core</option>
                </select>
              </label>
              <button className="primary-button compact" type="submit">Queue / Check Action</button>
            </form>
          </div>
        </section>
      )}

      {activeWebsiteFunction && (
        <WebsiteFunctionDrawer
          activeFunction={activeWebsiteFunction}
          fields={websiteFunctionFields}
          error={websiteFunctionError}
          isLoading={isLoadingWebsiteFunction}
          message={websiteFunctionMessage}
          onChangeField={(field, value) => setWebsiteFunctionFields((current) => ({ ...current, [field]: value }))}
          onClose={() => setActiveWebsiteFunction(null)}
          onRefresh={() => openWebsiteFunction(activeWebsiteFunction.label, activeWebsiteFunction.site)}
          onSubmit={submitWebsiteFunction}
        />
      )}

    </section>
  );
}

function mapHostingSiteToUi(site) {
  const runtime = site.version
    ? `.NET ${site.version}`
    : site.phpVersion
      ? `PHP ${site.phpVersion}`
      : site.isSubdomain
        ? "Subdomain"
        : "Website";

  return {
    siteKey: String(site.siteUid ?? site.siteName ?? site.rootName),
    siteUid: site.siteUid,
    rootName: site.rootName,
    sitePath: site.sitePath,
    siteName: site.siteName || site.rootName || `site-${site.siteUid}`,
    mappedDomains: site.mappedDomains?.length
      ? site.mappedDomains
      : [{ label: "No mapped domains", url: "#" }],
    runtime,
    status: site.status || "Unknown"
  };
}

function WebsiteCards({ sites, onUpdateSiteName, onQueueAction, onFunctionAction }) {
  return (
    <div className="website-card-grid">
      {sites.map((site, siteIndex) => (
        <article className="panel-card website-card" key={`${site.siteName}-${siteIndex}`}>
          <div className="website-card-header">
            <div className="website-title-group">
              <span className="status-pill">{site.status}</span>
              <div className="website-title-row">
                <SiteNameEditor siteName={site.siteName} onChange={(siteName) => onUpdateSiteName(siteIndex, siteName)} />
                <DeployButtons onAction={(action) => onQueueAction(action, site)} />
              </div>
            </div>
            <span className="runtime-pill">{site.runtime}</span>
          </div>
          <div className="mapped-domains">
            <span>Mapped Domains</span>
            <div>
              {site.mappedDomains.map((domain) => (
                <a href={domain.url} key={domain.label}>
                  <span>{domain.label}</span>
                  <span className="ssl-domain-badge">SSL</span>
                </a>
              ))}
              <button className="add-domain-chip" type="button" title="+ Add Domain" aria-label="+ Add Domain" onClick={() => onQueueAction("+ Add Domain", site)}>
                <MenuIcon name="add-domain" />
              </button>
            </div>
          </div>
          <WebsiteActionButtons
            onAction={(action) => onQueueAction(action, site)}
            onFunctionAction={(action) => onFunctionAction(action, site)}
          />
        </article>
      ))}
    </div>
  );
}

function WebsiteTable({ sites, onUpdateSiteName, onQueueAction, onFunctionAction }) {
  return (
    <div className="table-wrap website-table">
      <table>
        <thead>
          <tr>
            <th>Site Name</th>
            <th>Mapped Domains</th>
            <th>Runtime</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, siteIndex) => (
            <tr key={`${site.siteName}-${siteIndex}`}>
              <td>
                <div className="website-table-name">
                  <SiteNameEditor siteName={site.siteName} onChange={(siteName) => onUpdateSiteName(siteIndex, siteName)} />
                  <DeployButtons onAction={(action) => onQueueAction(action, site)} />
                </div>
              </td>
              <td>
                <div className="table-domain-list">
                  {site.mappedDomains.map((domain) => (
                    <a href={domain.url} key={domain.label}>
                      <span>{domain.label}</span>
                      <span className="ssl-domain-badge">SSL</span>
                    </a>
                  ))}
                  <button className="add-domain-chip" type="button" title="+ Add Domain" aria-label="+ Add Domain" onClick={() => onQueueAction("+ Add Domain", site)}>
                    <MenuIcon name="add-domain" />
                  </button>
                </div>
              </td>
              <td>{site.runtime}</td>
              <td>{site.status}</td>
              <td>
                <WebsiteActionButtons
                  compact
                  onAction={(action) => onQueueAction(action, site)}
                  onFunctionAction={(action) => onFunctionAction(action, site)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SiteNameEditor({ siteName, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(siteName);

  function commitName() {
    const nextName = draftName.trim();
    onChange(nextName || siteName);
    setDraftName(nextName || siteName);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        className="site-name-input"
        value={draftName}
        onBlur={commitName}
        onChange={(event) => setDraftName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitName();
          if (event.key === "Escape") {
            setDraftName(siteName);
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button className="site-name-button" type="button" onClick={() => setIsEditing(true)} title="Edit site name">
      {siteName}
    </button>
  );
}

function DeployButtons({ onAction }) {
  return (
    <div className="deploy-buttons" aria-label="Deploy options">
      {deployActions.map((action) => (
        <button className="deploy-button" type="button" key={action.label} onClick={() => onAction(action.label)}>
          <MenuIcon name={action.icon} />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

function WebsiteActionButtons({ compact = false, onAction, onFunctionAction }) {
  const [morePopoverStyle, setMorePopoverStyle] = useState(null);

  const openMorePopover = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const sidebar = document.querySelector(".cp-sidebar, .sidebar, aside");
    const sidebarRight = sidebar?.getBoundingClientRect().right ?? 0;
    const gutter = 24;
    const minLeft = Math.max(sidebarRight + 28, gutter);
    const availableWidth = window.innerWidth - minLeft - gutter;
    const width = Math.min(720, Math.max(360, availableWidth));
    const left = Math.min(Math.max(rect.right - width, minLeft), window.innerWidth - width - gutter);
    const estimatedHeight = 520;
    const preferredTop = rect.bottom + 12;
    const top = Math.min(preferredTop, Math.max(gutter, window.innerHeight - estimatedHeight - gutter));

    setMorePopoverStyle({
      "--popover-arrow-left": `${Math.min(Math.max(rect.left + rect.width / 2 - left - 7, 18), width - 32)}px`,
      left: `${left}px`,
      maxHeight: `calc(100vh - ${Math.round(top + gutter)}px)`,
      top: `${top}px`,
      width: `${width}px`
    });
  };

  const closeMorePopover = () => setMorePopoverStyle(null);

  return (
    <div className={compact ? "website-action-buttons compact-actions" : "website-action-buttons"}>
      {websiteActions.map((action) => action.label === "More Functions" ? (
        <div
          className="website-action-more"
          key={action.label}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              closeMorePopover();
            }
          }}
          onFocus={openMorePopover}
          onMouseEnter={openMorePopover}
          onMouseLeave={closeMorePopover}
        >
          <button
            aria-label={action.label}
            className="secondary-button compact icon-only-button"
            title={action.label}
            type="button"
          >
            <MenuIcon name={action.icon} />
          </button>
          <WebsiteMoreFunctionsPopover isOpen={Boolean(morePopoverStyle)} onAction={onFunctionAction ?? onAction} style={morePopoverStyle} />
        </div>
      ) : (
        <button
          aria-label={action.label}
          className="secondary-button compact icon-only-button"
          title={action.label}
          type="button"
          key={action.label}
          onClick={() => onAction(action.label)}
        >
          <MenuIcon name={action.icon} />
        </button>
      ))}
    </div>
  );
}

function WebsiteMoreFunctionsPopover({ isOpen, onAction, style }) {
  return (
    <div
      className={`website-more-popover${isOpen ? " is-open" : ""}`}
      role="menu"
      aria-label="More website functions"
      style={style ?? undefined}
    >
      {websiteMoreFunctionColumns.map((column) => (
        <section className="website-more-column" key={column.title}>
          <h3>{column.title}</h3>
          <div className="website-more-list">
            {column.items.map((item) => (
              <button type="button" role="menuitem" key={item.label} onClick={() => onAction(item.label)}>
                <MenuIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function WebsiteFunctionDrawer({ activeFunction, fields, error, isLoading, message, onChangeField, onClose, onRefresh, onSubmit }) {
  const details = activeFunction.details;
  const data = details?.data ?? {};
  const visibleGroups = Object.entries(data).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Object.keys(value).length > 0;
    return value !== null && value !== undefined && value !== "";
  });

  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="function-drawer panel-card" aria-label={`${activeFunction.label} function`} role="dialog">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">{details?.group ?? "More Functions"}</span>
            <h2>{activeFunction.label}</h2>
            <p>{details?.description ?? <LoadingIcon label="Loading website function details" />}</p>
          </div>
          <div className="function-drawer-actions">
            <RefreshButton onClick={onRefresh} />
            <button className="secondary-button compact icon-only-button" type="button" onClick={onClose} title="Close" aria-label="Close">
              <MenuIcon name="x" />
            </button>
          </div>
        </header>

        {isLoading && <LoadingState label="Loading live website data" />}
        {error && <p className="sandbox-message danger">{error}</p>}
        {message && <p className="sandbox-message">{message}</p>}

        {details && (
          <>
            <dl className="function-meta">
              <div><dt>Site</dt><dd>{activeFunction.site?.siteName}</dd></div>
              <div><dt>Legacy Entry</dt><dd>{details.legacyEntry}</dd></div>
              <div><dt>Underlying API</dt><dd>{details.underlyingApi}</dd></div>
              <div><dt>Remote Agent</dt><dd>{details.usesRemoteAgent ? "Required" : "Not required"}</dd></div>
            </dl>

            {!!details.warnings?.length && (
              <div className="function-warning-list">
                {details.warnings.map((warning) => <p key={warning}>{warning}</p>)}
              </div>
            )}

            {!!details.fields?.length && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit(fields.action || "save");
              }}>
                <h3>Action Fields</h3>
                {details.fields.map((field) => (
                  <label key={field}>
                    {humanizeFunctionField(field)}
                    <input
                      value={fields[field] ?? ""}
                      onChange={(event) => onChangeField(field, event.target.value)}
                      placeholder={humanizeFunctionField(field)}
                    />
                  </label>
                ))}
                <div className="function-submit-row">
                  {details.key === "site-on-off" ? (
                    <>
                      <button className="secondary-button compact" type="button" onClick={() => onSubmit("start")}>Start</button>
                      <button className="secondary-button compact" type="button" onClick={() => onSubmit("stop")}>Stop</button>
                    </>
                  ) : details.key === "outgoing-port" ? (
                    <>
                      <button className="primary-button compact" type="button" onClick={() => onSubmit("add")}>Add Rule</button>
                      <button className="secondary-button compact" type="button" onClick={() => onSubmit("delete")}>Remove Rule</button>
                    </>
                  ) : details.key === "vs-webdeploy" || details.key === "remote-iis-manager" ? (
                    <>
                      <button className="primary-button compact" type="button" onClick={() => onSubmit("fix-acl")}>Fix ACL</button>
                      <button className="secondary-button compact" type="button" onClick={() => onSubmit("enable")}>Turn On</button>
                      <button className="secondary-button compact" type="button" onClick={() => onSubmit("disable")}>Turn Off</button>
                    </>
                  ) : details.supportsWrite ? (
                    <button className="primary-button compact" type="submit">Run Function</button>
                  ) : (
                    <span className="status-pill muted">Read only</span>
                  )}
                </div>
              </form>
            )}

            <div className="function-data-stack">
              {visibleGroups.map(([name, value]) => (
                <WebsiteFunctionDataGroup key={name} name={name} value={value} />
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function WebsiteFunctionDataGroup({ name, value }) {
  if (Array.isArray(value)) {
    return (
      <section className="function-data-group">
        <h3>{humanizeFunctionField(name)}</h3>
        <div className="function-row-list">
          {value.slice(0, 12).map((row, index) => (
            <dl key={`${name}-${index}`} className="function-row-card">
              {Object.entries(row).slice(0, 8).map(([key, cell]) => (
                <div key={key}>
                  <dt>{humanizeFunctionField(key)}</dt>
                  <dd>{formatFunctionValue(cell)}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      </section>
    );
  }

  if (value && typeof value === "object") {
    return (
      <section className="function-data-group">
        <h3>{humanizeFunctionField(name)}</h3>
        <dl className="function-row-card">
          {Object.entries(value).map(([key, cell]) => (
            <div key={key}>
              <dt>{humanizeFunctionField(key)}</dt>
              <dd>{formatFunctionValue(cell)}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return null;
}

function defaultWebsiteFunctionField(field, site) {
  if (field === "siteName") return site?.siteName ?? "";
  if (field === "source" || field === "target" || field === "path" || field === "physicalPath") return site?.sitePath ?? "";
  if (field === "enabled") return "true";
  if (field === "action") return "save";
  if (field === "permission") return "write";
  if (field === "password") return "";
  return "";
}

function humanizeFunctionField(value) {
  return String(value ?? "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFunctionValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DatabasesSection({ cpId }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [databaseDashboard, setDatabaseDashboard] = useState(null);
  const [activeEngine, setActiveEngine] = useState("All");
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(true);
  const [databaseError, setDatabaseError] = useState("");
  const [databaseMessage, setDatabaseMessage] = useState("");
  const [connectionPreview, setConnectionPreview] = useState(null);
  const [deletedDatabases, setDeletedDatabases] = useState([]);
  const [showDeletedDatabases, setShowDeletedDatabases] = useState(false);
  const [backupSchedules, setBackupSchedules] = useState([]);
  const [backupDraft, setBackupDraft] = useState({ databaseKey: "", hour: "2", retentionDays: "7" });
  const [newDatabaseDraft, setNewDatabaseDraft] = useState({ engine: "MSSQL", name: "codex_test_db", login: "codex_test_user", password: "CodexTest123!", quota: "100", serverId: "" });
  const [restoreDraft, setRestoreDraft] = useState({ databaseKey: "", backupFile: "/db/testdb.bak", mode: "Restore from backup" });
  const [sqlDraft, setSqlDraft] = useState({ databaseKey: "", filePath: "/sql/update.sql", action: "Run SQL File" });

  async function loadDatabases() {
    setIsLoadingDatabases(true);
    setDatabaseError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/databases", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDatabaseError(result?.message ?? "Unable to load databases.");
        return;
      }

      setDatabaseDashboard(result.dashboard);
    } catch {
      setDatabaseError("Unable to reach database service.");
    } finally {
      setIsLoadingDatabases(false);
    }
  }

  useEffect(() => {
    loadDatabases();
    loadBackupSchedules();
  }, [cpId]);

  const databases = databaseDashboard?.databases ?? [];
  const visibleDatabases = activeEngine === "All"
    ? databases
    : databases.filter((database) => database.engine === activeEngine);
  const [viewMode, setViewMode] = useSectionViewMode("cp-databases", visibleDatabases.length);
  const totals = databaseDashboard?.totals ?? { total: 0, mssql: 0, mysql: 0 };
  const databaseJobs = (activity?.jobs ?? []).filter((job) =>
    ["Queue MSSQL Backup", "Queue MSSQL Restore", "Queue MySQL Backup", "Queue MySQL Restore", "Run MSSQL File", "panel-test"].includes(job.type)
    && (job.server === "database-manager" || job.type !== "panel-test")
  );

  async function queueDatabaseTest(action, database = null, details = "") {
    setDatabaseMessage("");
    try {
      await createPanelTestActivity(cpId, {
        from: database ? `${database.engine}:${database.name}` : `database:${action}`,
        to: database ? database.host || "database-server" : "/panel-test/database",
        server: "database-manager",
        note: details || `Database gateway required for ${action}`
      });
      setDatabaseMessage(`${action} needs the legacy database gateway before it can run.`);
      await reloadActivity();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function postDatabaseAction(database, action, payload = {}) {
    const response = await fetch(hostingApiUrl(`/api/hosting/databases/${encodeURIComponent(database.engine)}/${database.databaseId}/${action}`, cpId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpId, ...payload })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.message ?? "Unable to run database action.");
    }

    return result;
  }

  async function loadBackupSchedules() {
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/databases/backup-schedules", cpId));
      const result = await response.json().catch(() => null);
      if (response.ok && result?.success) {
        setBackupSchedules(result.schedules ?? []);
      }
    } catch {
      setBackupSchedules([]);
    }
  }

  async function backupDatabaseNow(database) {
    setDatabaseMessage("");
    try {
      const result = await postDatabaseAction(database, "backup");
      setDatabaseMessage(result.message);
      await reloadActivity();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function showConnectionString(database) {
    setDatabaseMessage("");
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/databases/${encodeURIComponent(database.engine)}/${database.databaseId}/connection-string`, cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to load connection strings.");
      }

      setConnectionPreview(result.connection);
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function deleteDatabase(database) {
    setDatabaseMessage("");
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/databases/${encodeURIComponent(database.engine)}/${database.databaseId}`, cpId), {
        method: "DELETE"
      });
      const result = await response.json().catch(() => null);
      setDatabaseMessage(result?.message ?? "Database delete request finished.");
      if (response.ok && result?.success) {
        await loadDatabases();
        await loadBackupSchedules();
      }
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function loadDeletedDatabases() {
    setDatabaseMessage("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/databases/deleted", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to load deleted databases.");
      }

      setDeletedDatabases(result.databases ?? []);
      setShowDeletedDatabases(true);
      setDatabaseMessage((result.databases ?? []).length ? "Deleted databases loaded." : "No recoverable deleted databases were found.");
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function submitBackupDraft(event) {
    event.preventDefault();
    const database = visibleDatabases.find((item) => `${item.engine}:${item.databaseId}` === backupDraft.databaseKey) ?? visibleDatabases[0] ?? databases[0];
    if (!database) {
      setDatabaseMessage("Choose a database before creating a scheduled backup.");
      return;
    }

    const hour = Math.max(0, Math.min(23, Number(backupDraft.hour) || 0));
    const retentionDays = Math.max(1, Math.min(7, Number(backupDraft.retentionDays) || 7));
    try {
      const result = await postDatabaseAction(database, "backup-schedules", { hour, retentionDays });
      setDatabaseMessage(result.message);
      await loadBackupSchedules();
      await loadDatabases();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function submitNewDatabaseDraft(event) {
    event.preventDefault();
    setDatabaseMessage("");
    const quota = Math.max(10, Math.min(10240, Number(newDatabaseDraft.quota) || 100));
    try {
      const result = await provisionHosting("/api/hosting/databases/provision", cpId, {
        engine: newDatabaseDraft.engine,
        name: newDatabaseDraft.name,
        login: newDatabaseDraft.login,
        password: newDatabaseDraft.password,
        quotaMb: quota,
        collation: "SQL_Latin1_General_CP1_CI_AS",
        serverId: newDatabaseDraft.serverId
      });
      setDatabaseMessage(result.message);
      await loadDatabases();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function deleteBackupSchedule(schedule) {
    setDatabaseMessage("");
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/databases/backup-schedules/${schedule.id}`, cpId), {
        method: "DELETE"
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to disable backup schedule.");
      }

      setDatabaseMessage(result.message);
      await loadBackupSchedules();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function submitRestoreDraft(event) {
    event.preventDefault();
    const database = databases.find((item) => `${item.engine}:${item.databaseId}` === restoreDraft.databaseKey) ?? visibleDatabases[0] ?? databases[0];
    if (!database) {
      setDatabaseMessage("Choose a database before queueing this database job.");
      return;
    }

    if (restoreDraft.mode === "Show Deleted DBs") {
      await loadDeletedDatabases();
      return;
    }

    try {
      const result = restoreDraft.mode === "Backup now"
        ? await postDatabaseAction(database, "backup")
        : await postDatabaseAction(database, "restore", { path: restoreDraft.backupFile });
      setDatabaseMessage(result.message);
      await reloadActivity();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  async function submitSqlDraft(event) {
    event.preventDefault();
    const database = databases.find((item) => `${item.engine}:${item.databaseId}` === sqlDraft.databaseKey) ?? visibleDatabases[0] ?? databases[0];
    if (!database) {
      setDatabaseMessage("Choose a database before queueing a SQL file.");
      return;
    }

    if (database.engine !== "MSSQL") {
      setDatabaseMessage("Run SQL File is mapped for MSSQL worker jobs. MySQL import still needs the exact legacy gateway.");
      return;
    }

    if (sqlDraft.action !== "Run SQL File") {
      setDatabaseMessage(`${sqlDraft.action} is not mapped to a legacy worker job yet.`);
      return;
    }

    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/databases/mssql/${database.databaseId}/run-sql-file`, cpId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId, path: sqlDraft.filePath })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to queue SQL file.");
      }

      setDatabaseMessage(result.message);
      await reloadActivity();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  return (
    <section className="databases-section">
      <article className="panel-card database-summary-card">
        <div>
          <span className="status-pill blue">Live databases</span>
          <h2>Database Manager</h2>
          <p>Unified MSSQL and MySQL inventory from the hosting control panel.</p>
        </div>
        <div className="database-total-grid">
          <div><span>Total</span><strong>{totals.total}</strong></div>
          <div><span>MSSQL</span><strong>{totals.mssql}</strong></div>
          <div><span>MySQL</span><strong>{totals.mysql}</strong></div>
        </div>
        <RefreshButton onClick={loadDatabases} />
      </article>

      <div className="database-toolbar panel-card">
        <div className="database-actions">
          <button className="primary-button compact" type="button" onClick={() => setDatabaseMessage("Create Database form is ready below. Fill in the database details and submit to call the legacy database create gateway.")}>+ Database</button>
          <button className="secondary-button compact" type="button" onClick={() => setDatabaseMessage("Database quota changes are handled through Add-On purchases and product quota mapping. Use Account Panel > Add-On for extra database quota.")}>+ Quota</button>
          <button className="secondary-button compact" type="button" onClick={() => setDatabaseMessage("Automated Backups form is ready above. Choose a database, hour, and retention window.")}>+ Advanced Backup</button>
          <button className="secondary-button compact" type="button" onClick={() => setDatabaseMessage("Run SQL form is ready below. Choose an MSSQL database and SQL file path.")}>Run SQL File</button>
          <button className="secondary-button compact" type="button" onClick={loadDeletedDatabases}>Deleted DBs</button>
        </div>
        <div className="engine-tabs" aria-label="Database engine filter">
          {["All", "MSSQL", "MySQL"].map((engine) => (
            <button
              className={activeEngine === engine ? "active" : ""}
              type="button"
              key={engine}
              onClick={() => setActiveEngine(engine)}
            >
              {engine}
            </button>
          ))}
        </div>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label="Database view mode" />
      </div>

      {!!visibleDatabases.length && (
        <article className="panel-card database-schedule-card">
          <div>
            <span className="status-pill blue">Scheduled database backups</span>
            <h3>Automated Backups</h3>
            <p>Enable the legacy custom database backup schedule for a selected MSSQL or MySQL database.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitBackupDraft}>
            <label>
              Database
              <select value={backupDraft.databaseKey || `${visibleDatabases[0].engine}:${visibleDatabases[0].databaseId}`} onChange={(event) => setBackupDraft((draft) => ({ ...draft, databaseKey: event.target.value }))}>
                {visibleDatabases.map((database) => (
                  <option value={`${database.engine}:${database.databaseId}`} key={`${database.engine}:${database.databaseId}`}>
                    {database.engine} · {database.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Backup Hour
              <input type="number" min="0" max="23" value={backupDraft.hour} onChange={(event) => setBackupDraft((draft) => ({ ...draft, hour: event.target.value }))} />
            </label>
            <label>
              Retention Days
              <input type="number" min="1" max="7" value={backupDraft.retentionDays} onChange={(event) => setBackupDraft((draft) => ({ ...draft, retentionDays: event.target.value }))} />
            </label>
            <button className="primary-button compact" type="submit">Enable Backup</button>
          </form>
          {!!backupSchedules.length && (
            <div className="database-schedule-list">
              {backupSchedules.map((schedule) => (
                <div className="database-schedule-row" key={schedule.id}>
                  <span>{schedule.engine} · {schedule.name}</span>
                  <small>{schedule.hour}:00 · keep {schedule.retentionDays} days</small>
                  <button className="secondary-button compact" type="button" onClick={() => deleteBackupSchedule(schedule)}>Disable</button>
                </div>
              ))}
            </div>
          )}
        </article>
      )}

      <div className="advance-form-grid">
        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Create Database</span>
            <h3>MSSQL / MySQL Draft</h3>
            <p>Needs the legacy database create gateway for CP prefix, login, quota, and remote server provisioning.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitNewDatabaseDraft}>
            <label>
              Engine
              <select value={newDatabaseDraft.engine} onChange={(event) => setNewDatabaseDraft((draft) => ({ ...draft, engine: event.target.value }))}>
                <option value="MSSQL">MSSQL</option>
                <option value="MySQL">MySQL</option>
              </select>
            </label>
            <label>
              Database Name
              <input value={newDatabaseDraft.name} onChange={(event) => setNewDatabaseDraft((draft) => ({ ...draft, name: event.target.value }))} />
            </label>
            <label>
              Login
              <input value={newDatabaseDraft.login} onChange={(event) => setNewDatabaseDraft((draft) => ({ ...draft, login: event.target.value }))} />
            </label>
            <label>
              Password
              <input type="password" value={newDatabaseDraft.password} onChange={(event) => setNewDatabaseDraft((draft) => ({ ...draft, password: event.target.value }))} />
            </label>
            <label>
              Quota MB
              <input type="number" min="10" max="10240" value={newDatabaseDraft.quota} onChange={(event) => setNewDatabaseDraft((draft) => ({ ...draft, quota: event.target.value }))} />
            </label>
            <label>
              Server ID
              <input placeholder="Optional, defaults to hosting server" value={newDatabaseDraft.serverId} onChange={(event) => setNewDatabaseDraft((draft) => ({ ...draft, serverId: event.target.value }))} />
            </label>
            <button className="primary-button compact" type="submit">Create Database</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Restore / Backup</span>
            <h3>Server Backup</h3>
            <p>Queues backup, restore, and compatible database worker jobs through the legacy worker.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitRestoreDraft}>
            <label>
              Database
              <select value={restoreDraft.databaseKey || (databases[0] ? `${databases[0].engine}:${databases[0].databaseId}` : "")} onChange={(event) => setRestoreDraft((draft) => ({ ...draft, databaseKey: event.target.value }))}>
                {databases.map((database) => (
                  <option value={`${database.engine}:${database.databaseId}`} key={`restore-${database.engine}-${database.databaseId}`}>
                    {database.engine} · {database.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Backup File
              <input value={restoreDraft.backupFile} onChange={(event) => setRestoreDraft((draft) => ({ ...draft, backupFile: event.target.value }))} />
            </label>
            <label>
              Mode
              <select value={restoreDraft.mode} onChange={(event) => setRestoreDraft((draft) => ({ ...draft, mode: event.target.value }))}>
                <option>Restore from backup</option>
                <option>Backup now</option>
                <option>Show Deleted DBs</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Queue Worker Job</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Run SQL</span>
            <h3>SQL File Worker</h3>
            <p>Queues a legacy MSSQL file execution job for the selected database.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitSqlDraft}>
            <label>
              Database
              <select value={sqlDraft.databaseKey || (databases[0] ? `${databases[0].engine}:${databases[0].databaseId}` : "")} onChange={(event) => setSqlDraft((draft) => ({ ...draft, databaseKey: event.target.value }))}>
                {databases.map((database) => (
                  <option value={`${database.engine}:${database.databaseId}`} key={`sql-${database.engine}-${database.databaseId}`}>
                    {database.engine} · {database.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              SQL File
              <input value={sqlDraft.filePath} onChange={(event) => setSqlDraft((draft) => ({ ...draft, filePath: event.target.value }))} />
            </label>
            <label>
              Action
              <select value={sqlDraft.action} onChange={(event) => setSqlDraft((draft) => ({ ...draft, action: event.target.value }))}>
                <option>Run SQL File</option>
                <option>Validate SQL File</option>
                <option>Import SQL Dump</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Queue SQL Job</button>
          </form>
        </article>
      </div>

      {isLoadingDatabases && <LoadingState label="Loading databases" />}
      {databaseMessage && <p className="sandbox-message">{databaseMessage}</p>}
      {connectionPreview && (
        <article className="panel-card connection-preview-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">{connectionPreview.engine}</span>
              <h3>{connectionPreview.name} connection strings</h3>
              <p>Password is intentionally not displayed.</p>
            </div>
            <button className="secondary-button compact" type="button" onClick={() => setConnectionPreview(null)}>Close</button>
          </div>
          <dl className="connection-snippet-list">
            <div><dt>Server Name</dt><dd>{connectionPreview.host}</dd></div>
            <div><dt>Database Name</dt><dd>{connectionPreview.name}</dd></div>
            <div><dt>User Name</dt><dd>{connectionPreview.login}</dd></div>
          </dl>
          {Object.entries(connectionPreview.snippets ?? {}).map(([label, value]) => (
            <div className="connection-snippet" key={label}>
              <span>{label}</span>
              <code>{value}</code>
            </div>
          ))}
        </article>
      )}
      {showDeletedDatabases && (
        <article className="panel-card connection-preview-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill orange">Recovery</span>
              <h3>Deleted Databases</h3>
              <p>Recoverable deleted database rows from the seven-day legacy recovery window.</p>
            </div>
            <button className="secondary-button compact" type="button" onClick={() => setShowDeletedDatabases(false)}>Close</button>
          </div>
          {!deletedDatabases.length && <p className="empty-state">No recoverable deleted databases found.</p>}
          {!!deletedDatabases.length && (
            <div className="table-wrap website-table">
              <table>
                <thead>
                  <tr>
                    <th>Database</th>
                    <th>Engine</th>
                    <th>Server</th>
                    <th>Deleted</th>
                    <th>Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedDatabases.map((database) => (
                    <tr key={`${database.engine}-${database.databaseId}`}>
                      <td>{database.name}</td>
                      <td>{database.engine}</td>
                      <td>{database.host || "Server pending"}</td>
                      <td>{formatDate(database.deletedAt)}</td>
                      <td><span className="status-pill orange">{database.daysLeft}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      )}
      {databaseError && (
        <div className="panel-card dashboard-error-panel">
          <p>{databaseError}</p>
          <IconActionButton label="Retry" onClick={loadDatabases} />
        </div>
      )}
      {!isLoadingDatabases && !databaseError && !visibleDatabases.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No databases</span>
          <h2>No {activeEngine === "All" ? "" : activeEngine} databases found</h2>
          <p>This hosting account does not have visible database rows for the selected engine.</p>
        </div>
      )}

      {!!visibleDatabases.length && viewMode === "cards" && (
        <div className="database-card-grid">
          {visibleDatabases.map((database) => (
            <article className="panel-card database-card" key={`${database.engine}-${database.databaseId}`}>
              <div className="database-card-header">
                <div>
                  <span className={database.status === "Active" ? "status-pill" : "status-pill muted"}>{database.status}</span>
                  <h3>{database.name}</h3>
                  <p>{database.engine} · {database.host || "Server pending"}</p>
                </div>
                <MenuIcon name="database" />
              </div>
              <dl className="card-meta single">
                <div><dt>Login ID</dt><dd>{database.login}</dd></div>
                <div><dt>Quota</dt><dd>{database.spaceQuotaMb} MB</dd></div>
                <div><dt>Created</dt><dd>{formatDate(database.createDate)}</dd></div>
              </dl>
              <div className="database-action-row">
                {["Backup", "Restore", "Connection String", "More", "Delete"].map((action) => (
                  <IconActionButton
                    label={action}
                    key={action}
                    onClick={() => {
                      if (action === "Delete") {
                        deleteDatabase(database);
                        return;
                      }

                      if (action === "Connection String") {
                        showConnectionString(database);
                        return;
                      }

                      if (action === "Backup") {
                        backupDatabaseNow(database);
                        return;
                      }

                      if (action === "Restore") {
                        setRestoreDraft((draft) => ({ ...draft, databaseKey: `${database.engine}:${database.databaseId}`, backupFile: database.engine === "MSSQL" ? "/db/backup.bak" : "/db/backup.sql", mode: "Restore from backup" }));
                        setDatabaseMessage("Enter the backup file path in Server Backup, then queue the restore.");
                        return;
                      }

                      setSqlDraft((draft) => ({ ...draft, databaseKey: `${database.engine}:${database.databaseId}` }));
                      setDatabaseMessage(database.engine === "MSSQL" ? "Use Run SQL to queue a SQL file for this database." : "MySQL import needs the exact legacy import gateway before it can be enabled.");
                    }}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      {!!visibleDatabases.length && viewMode === "table" && (
        <div className="table-wrap website-table">
          <table>
            <thead>
              <tr>
                <th>Database</th>
                <th>Engine</th>
                <th>Server</th>
                <th>Login</th>
                <th>Quota</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDatabases.map((database) => (
                <tr key={`${database.engine}-${database.databaseId}`}>
                  <td>{database.name}</td>
                  <td>{database.engine}</td>
                  <td>{database.host || "Server pending"}</td>
                  <td>{database.login}</td>
                  <td>{database.spaceQuotaMb} MB</td>
                  <td><span className={database.status === "Active" ? "status-pill" : "status-pill muted"}>{database.status}</span></td>
                  <td>{formatDate(database.createDate)}</td>
                  <td>
                    <div className="website-action-buttons compact-actions">
                      <IconActionButton label="Backup" onClick={() => backupDatabaseNow(database)} />
                      <IconActionButton label="Restore" onClick={() => {
                        setRestoreDraft((draft) => ({ ...draft, databaseKey: `${database.engine}:${database.databaseId}`, backupFile: database.engine === "MSSQL" ? "/db/backup.bak" : "/db/backup.sql", mode: "Restore from backup" }));
                        setDatabaseMessage("Enter the backup file path in Server Backup, then queue the restore.");
                      }} />
                      <IconActionButton label="Connection" onClick={() => showConnectionString(database)} />
                      <IconActionButton label="More" onClick={() => {
                        setSqlDraft((draft) => ({ ...draft, databaseKey: `${database.engine}:${database.databaseId}` }));
                        setDatabaseMessage(database.engine === "MSSQL" ? "Use Run SQL to queue a SQL file for this database." : "MySQL import needs the exact legacy import gateway before it can be enabled.");
                      }} />
                      <IconActionButton label="Delete" onClick={() => deleteDatabase(database)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ActivityList jobs={databaseJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle="No recent database jobs" onRetry={reloadActivity} />
    </section>
  );
}

function ThemeToggle({ theme, onToggleTheme }) {
  const currentThemeLabel = theme === "dark" ? "Dark" : theme === "light" ? "Day" : "Classic";
  const nextThemeLabel = theme === "dark" ? "Day" : theme === "light" ? "Classic" : "Dark";
  return (
    <button
      aria-label={`Current mode: ${currentThemeLabel}. Switch to ${nextThemeLabel} mode`}
      className="theme-toggle"
      title={`Current mode: ${currentThemeLabel}`}
      type="button"
      onClick={onToggleTheme}
    >
      <span className="theme-icon" aria-hidden="true">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.8v2.4M12 18.8v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
          </svg>
        ) : theme === "light" ? (
          <svg viewBox="0 0 24 24">
            <path d="M4 18.5 10.2 5l3.6 7.8L16 9l4 9.5H4Z" />
            <path d="M10.2 5 13 18.5M16 9l-1.1 9.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M20.2 14.6A7.7 7.7 0 0 1 9.4 3.8 8.7 8.7 0 1 0 20.2 14.6Z" />
          </svg>
        )}
      </span>
      <span>{currentThemeLabel}</span>
    </button>
  );
}

function EmailsSection({ cpId }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [emailDashboard, setEmailDashboard] = useState(null);
  const [activeType, setActiveType] = useState("All");
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailDomainDraft, setEmailDomainDraft] = useState({ domain: "codex-test-mail.local", type: "Hosted Email", password: "CodexMail123!", quota: "1000", mailboxQuota: "2", mailServer: "" });
  const [mailboxDraft, setMailboxDraft] = useState({ domain: "", mailbox: "info", quota: "500", action: "Create Mailbox" });

  async function loadEmails() {
    setIsLoadingEmails(true);
    setEmailError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/emails", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setEmailError(result?.message ?? "Unable to load email domains.");
        return;
      }

      setEmailDashboard(result.dashboard);
    } catch {
      setEmailError("Unable to reach email domain service.");
    } finally {
      setIsLoadingEmails(false);
    }
  }

  useEffect(() => {
    loadEmails();
  }, [cpId]);

  const domains = emailDashboard?.domains ?? [];
  const visibleDomains = activeType === "All" ? domains : domains.filter((domain) => domain.type === activeType);
  const [viewMode, setViewMode] = useSectionViewMode("cp-emails", visibleDomains.length);
  const totals = emailDashboard?.totals ?? { total: 0, hosted: 0, corporate: 0, dailyLimits: 0 };
  const primaryDomain = visibleDomains[0] ?? domains[0] ?? null;
  const mailSetupRows = buildMailSetupRows(primaryDomain);
  const mailJobs = (activity?.jobs ?? []).filter((job) =>
    job.server === "mail-manager" ||
    String(job.type ?? "").toLowerCase().includes("mail") ||
    String(job.from ?? "").toLowerCase().startsWith("email:")
  );

  async function queueEmailTest(action, domain = null, details = "") {
    setEmailMessage("");
    try {
      await createPanelTestActivity(cpId, {
        from: domain ? `email:${domain.domain}` : `email:${action}`,
        to: domain ? domain.mailHost || domain.webmailUrl || "mail-server" : "/panel-test/email",
        server: "mail-manager",
        note: details || `Email gateway required for ${action}`
      });
      setEmailMessage(`${action} needs the SmarterMail gateway before it can run.`);
      await reloadActivity();
    } catch (error) {
      setEmailMessage(error.message);
    }
  }

  async function submitEmailDomainDraft(event) {
    event.preventDefault();
    setEmailMessage("");
    try {
      const result = await provisionHosting("/api/hosting/emails/provision", cpId, {
        domain: emailDomainDraft.domain,
        password: emailDomainDraft.password,
        quotaMb: Number(emailDomainDraft.quota) || 1000,
        mailboxQuota: Number(emailDomainDraft.mailboxQuota) || 2,
        mailServer: emailDomainDraft.mailServer
      });
      setEmailMessage(result.message);
      await loadEmails();
    } catch (error) {
      setEmailMessage(error.message);
    }
  }

  function submitMailboxDraft(event) {
    event.preventDefault();
    const selectedDomain = domains.find((domain) => domain.domain === mailboxDraft.domain) ?? primaryDomain;
    queueEmailTest(
      mailboxDraft.action,
      selectedDomain,
      `Mailbox request: ${mailboxDraft.mailbox}@${selectedDomain?.domain || mailboxDraft.domain || "domain"}; quota ${mailboxDraft.quota} MB; action ${mailboxDraft.action}`
    );
  }

  async function runEmailDomainRequest(domain, path, options = {}) {
    setEmailMessage("");
    try {
      const response = await fetch(path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? `Unable to update ${domain.domain}.`);
      }

      setEmailMessage(result.message);
      await loadEmails();
      await reloadActivity();
    } catch (error) {
      setEmailMessage(error.message);
    }
  }

  function resetPostmasterPassword(domain) {
    const password = window.prompt(`New postmaster password for ${domain.domain}. Leave blank to generate one.`, "");
    if (password === null) return;
    runEmailDomainRequest(
      domain,
      `/api/hosting/emails/${encodeURIComponent(domain.domain)}/password-reset`,
      {
        method: "POST",
        body: JSON.stringify({ cpId, password, quotaMb: 0 })
      }
    );
  }

  function updateEmailQuota(domain) {
    const quota = window.prompt(`Quota MB for ${domain.domain}`, String(domain.spaceMb > 0 ? domain.spaceMb : 100));
    if (quota === null) return;
    runEmailDomainRequest(
      domain,
      `/api/hosting/emails/${encodeURIComponent(domain.domain)}/quota`,
      {
        method: "PUT",
        body: JSON.stringify({ cpId, password: "", quotaMb: Number(quota) || 100 })
      }
    );
  }

  function deleteEmailDomain(domain) {
    if (!window.confirm(`Delete email domain ${domain.domain}? This calls the legacy SmarterMail delete flow and then removes the hosted email DB row.`)) return;
    runEmailDomainRequest(
      domain,
      `/api/hosting/emails/${encodeURIComponent(domain.domain)}?cpId=${encodeURIComponent(cpId)}`,
      { method: "DELETE" }
    );
  }

  function handleEmailDomainAction(action, domain) {
    if (action === "Manage Mailboxes") {
      setMailboxDraft((draft) => ({ ...draft, domain: domain.domain, action: "Create Mailbox" }));
      setEmailMessage(`Mailbox tools are ready for ${domain.domain}. Choose the mailbox action below.`);
      return;
    }

    if (action === "Alias" || action === "Forwarding") {
      setMailboxDraft((draft) => ({ ...draft, domain: domain.domain, action: action === "Alias" ? "Create Alias" : "Create Forwarding" }));
      setEmailMessage(`${action} setup selected for ${domain.domain}. Complete the mailbox draft below.`);
      return;
    }

    if (action === "DNS") {
      setEmailMessage(`DNS records for ${domain.domain}: ${buildMailSetupRows(domain).map((record) => `${record.label}: ${record.value}`).join(" | ")}`);
      return;
    }

    if (action === "Webmail") {
      if (domain.webmailUrl) {
        window.open(domain.webmailUrl, "_blank", "noopener,noreferrer");
        setEmailMessage(`Opened webmail for ${domain.domain}.`);
      } else {
        setEmailMessage(`No webmail URL is available for ${domain.domain}.`);
      }
      return;
    }

    if (action === "Password") {
      resetPostmasterPassword(domain);
      return;
    }

    if (action === "Quota") {
      updateEmailQuota(domain);
      return;
    }

    if (action === "Delete") {
      deleteEmailDomain(domain);
      return;
    }

    queueEmailTest(action, domain);
  }

  function refreshEmailSection() {
    loadEmails();
    reloadActivity();
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">Live email</span>
          <h2>Email Manager</h2>
          <p>Hosted email and corporate email domains from the hosting control panel.</p>
        </div>
        <div className="database-total-grid">
          <div><span>Total</span><strong>{totals.total}</strong></div>
          <div><span>Hosted</span><strong>{totals.hosted}</strong></div>
          <div><span>Corporate</span><strong>{totals.corporate}</strong></div>
          <div><span>Daily Limits</span><strong>{totals.dailyLimits}</strong></div>
        </div>
        <RefreshButton onClick={refreshEmailSection} />
      </article>

      <div className="database-toolbar panel-card">
        <div className="database-actions">
          <button className="primary-button compact" type="button" onClick={() => setEmailMessage("Email Domain form is ready below. Hosted email writes call the latest SmarterMail gateway.")}>+ Email Domain</button>
          <button className="secondary-button compact" type="button" onClick={() => setEmailDomainDraft((draft) => ({ ...draft, type: "Corporate Email" }))}>+ Corporate Email</button>
          <button className="secondary-button compact" type="button" onClick={() => setEmailMessage("Mailbox draft is ready below. Choose a domain, mailbox name, quota, and mailbox action.")}>+ Mailbox</button>
          <button className="secondary-button compact" type="button" onClick={() => setEmailMessage("Daily Send Limit uses cp_config_DailySentLimit. Purchase and active-user flows still need the exact masssmtp action ported before write.")}>Daily Send Limit</button>
          <button className="secondary-button compact" type="button" onClick={() => primaryDomain ? handleEmailDomainAction("DNS", primaryDomain) : setEmailMessage("No email domain selected.")}>DNS Records</button>
          <button className="secondary-button compact" type="button" onClick={() => primaryDomain ? handleEmailDomainAction("Webmail", primaryDomain) : setEmailMessage("No email domain selected.")}>Webmail Login</button>
          <button className="secondary-button compact" type="button" onClick={() => setEmailMessage("DKIM values are shown in Mail Setup when present. The SmarterMail DKIM generation SOAP action still needs exact template mapping before write.")}>DKIM Setup</button>
        </div>
        <div className="engine-tabs" aria-label="Email type filter">
          {["All", "Hosted Email", "Corporate Email"].map((type) => (
            <button
              className={activeType === type ? "active" : ""}
              type="button"
              key={type}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label="Email view mode" />
      </div>

      <div className="email-tools-grid">
        <article className="panel-card mail-setup-card">
          <div>
            <span className="status-pill blue">Mail Setup</span>
            <h2>{primaryDomain?.domain || "No email domain selected"}</h2>
            <p>DNS and SmarterMail setup values for the selected email domain.</p>
          </div>
          <div className="mail-setup-records">
            {mailSetupRows.map((record) => (
              <div className="mail-setup-record" key={record.label}>
                <span>{record.label}</span>
                <code>{record.value}</code>
              </div>
            ))}
          </div>
          <div className="database-action-row">
            <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("Verify MX", primaryDomain)}>Verify MX</button>
            <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("Generate DKIM", primaryDomain)}>Generate DKIM</button>
            <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("Sync SmarterMail", primaryDomain)}>Sync SmarterMail</button>
          </div>
        </article>
        <KnowledgeBaseCard title="Email Guides" articles={emailKbArticles} />
      </div>

      <div className="advance-form-grid">
        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Email Domain</span>
            <h3>Hosted / Corporate Draft</h3>
            <p>Needs the SmarterMail gateway before hosted, corporate, and VPS email domain writes are enabled.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitEmailDomainDraft}>
            <label>
              Domain
              <input value={emailDomainDraft.domain} onChange={(event) => setEmailDomainDraft((draft) => ({ ...draft, domain: event.target.value }))} />
            </label>
            <label>
              Type
              <select value={emailDomainDraft.type} onChange={(event) => setEmailDomainDraft((draft) => ({ ...draft, type: event.target.value }))}>
                <option>Hosted Email</option>
                <option>Corporate Email</option>
                <option>VPS Email</option>
              </select>
            </label>
            <label>
              Postmaster Password
              <input type="password" value={emailDomainDraft.password} onChange={(event) => setEmailDomainDraft((draft) => ({ ...draft, password: event.target.value }))} />
            </label>
            <label>
              Quota MB
              <input type="number" min="100" max="10240" value={emailDomainDraft.quota} onChange={(event) => setEmailDomainDraft((draft) => ({ ...draft, quota: event.target.value }))} />
            </label>
            <label>
              Mailboxes
              <input type="number" min="1" max="5000" value={emailDomainDraft.mailboxQuota} onChange={(event) => setEmailDomainDraft((draft) => ({ ...draft, mailboxQuota: event.target.value }))} />
            </label>
            <label>
              Mail Server
              <input placeholder="Optional default server" value={emailDomainDraft.mailServer} onChange={(event) => setEmailDomainDraft((draft) => ({ ...draft, mailServer: event.target.value }))} />
            </label>
            <button className="primary-button compact" type="submit">Create Email Domain</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Mailbox</span>
            <h3>Mailbox / Alias Draft</h3>
            <p>Needs the SmarterMail gateway for mailbox, alias, forwarding, quota, and password actions.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitMailboxDraft}>
            <label>
              Domain
              <select value={mailboxDraft.domain || primaryDomain?.domain || ""} onChange={(event) => setMailboxDraft((draft) => ({ ...draft, domain: event.target.value }))}>
                {domains.map((domain) => (
                  <option value={domain.domain} key={`mailbox-${domain.domain}`}>{domain.domain}</option>
                ))}
              </select>
            </label>
            <label>
              Mailbox
              <input value={mailboxDraft.mailbox} onChange={(event) => setMailboxDraft((draft) => ({ ...draft, mailbox: event.target.value }))} />
            </label>
            <label>
              Quota MB
              <input type="number" min="50" max="10240" value={mailboxDraft.quota} onChange={(event) => setMailboxDraft((draft) => ({ ...draft, quota: event.target.value }))} />
            </label>
            <label>
              Action
              <select value={mailboxDraft.action} onChange={(event) => setMailboxDraft((draft) => ({ ...draft, action: event.target.value }))}>
                <option>Create Mailbox</option>
                <option>Reset Password</option>
                <option>Update Quota</option>
                <option>Create Alias</option>
                <option>Create Forwarding</option>
                <option>Delete Mailbox</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Review Action</button>
          </form>
        </article>
      </div>

      {isLoadingEmails && <LoadingState label="Loading email domains" />}
      {emailMessage && <p className="sandbox-message">{emailMessage}</p>}
      {emailError && (
        <div className="panel-card dashboard-error-panel">
          <p>{emailError}</p>
          <IconActionButton label="Retry" onClick={loadEmails} />
        </div>
      )}
      {!isLoadingEmails && !emailError && !visibleDomains.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No email domains</span>
          <h2>No {activeType === "All" ? "" : activeType} email domains found</h2>
          <p>This hosting account does not have visible email domain rows for the selected type.</p>
        </div>
      )}

      {!!visibleDomains.length && viewMode === "cards" && (
        <div className="database-card-grid">
          {visibleDomains.map((domain) => (
            <article className="panel-card database-card" key={`${domain.type}-${domain.domain}`}>
              <div className="database-card-header">
                <div>
                  <span className={domain.status === "Active" ? "status-pill" : "status-pill muted"}>{domain.status}</span>
                  <h3>{domain.domain}</h3>
                  <p>{domain.type} · {domain.server || "Mail server pending"}</p>
                </div>
                <MenuIcon name="mail" />
              </div>
              <dl className="card-meta single">
                <div><dt>Webmail</dt><dd>{domain.webmailUrl || "Pending"}</dd></div>
                <div><dt>SMTP / POP / IMAP</dt><dd>{domain.mailHost || "Pending"}</dd></div>
                <div><dt>Space</dt><dd>{domain.spaceMb > 0 ? `${domain.spaceMb} MB` : "Product quota"}</dd></div>
                <div><dt>Created</dt><dd>{formatDate(domain.createDate)}</dd></div>
              </dl>
              <div className="database-action-row">
                {["Manage Mailboxes", "Alias", "Forwarding", "Password", "Quota", "DNS", "Webmail", "Delete"].map((action) => (
                  <IconActionButton key={action} label={action} onClick={() => handleEmailDomainAction(action, domain)} />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      {!!visibleDomains.length && viewMode === "table" && (
        <div className="table-wrap website-table">
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Type</th>
                <th>Server</th>
                <th>Webmail</th>
                <th>Mail Host</th>
                <th>Space</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDomains.map((domain) => (
                <tr key={`${domain.type}-${domain.domain}`}>
                  <td>{domain.domain}</td>
                  <td>{domain.type}</td>
                  <td>{domain.server || "Mail server pending"}</td>
                  <td>{domain.webmailUrl || "Pending"}</td>
                  <td>{domain.mailHost || "Pending"}</td>
                  <td>{domain.spaceMb > 0 ? `${domain.spaceMb} MB` : "Product quota"}</td>
                  <td><span className={domain.status === "Active" ? "status-pill" : "status-pill muted"}>{domain.status}</span></td>
                  <td>
                    <div className="website-action-buttons compact-actions">
                      {["Password", "Quota", "DNS", "Webmail", "Delete"].map((action) => (
                        <IconActionButton key={action} label={action} onClick={() => handleEmailDomainAction(action, domain)} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ActivityList jobs={mailJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle="No recent email jobs" onRetry={reloadActivity} />
    </section>
  );
}

function buildMailSetupRows(domain) {
  if (!domain) {
    return [
      { label: "MX", value: "Add an email domain to preview MX records." },
      { label: "SPF", value: "Add an email domain to preview SPF records." },
      { label: "DKIM", value: "Add an email domain to preview DKIM setup." }
    ];
  }

  const host = domain.mailHost || domain.webmailUrl || "mail.site4now.net";
  const domainName = domain.domain || "example.com";

  return [
    { label: "MX", value: `${domainName} -> ${host}` },
    { label: "POP / IMAP / SMTP", value: host },
    { label: "SPF", value: "v=spf1 a mx include:_spf.site4now.net -all" },
    { label: "DKIM", value: `default._domainkey.${domainName}` },
    { label: "Webmail", value: domain.webmailUrl || `https://${host}` }
  ];
}

function FtpSection({ cpId }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [ftpDashboard, setFtpDashboard] = useState(null);
  const [isLoadingFtp, setIsLoadingFtp] = useState(true);
  const [ftpError, setFtpError] = useState("");
  const [ftpMessage, setFtpMessage] = useState("");
  const [ftpDraft, setFtpDraft] = useState({ login: "codex-test-ftp", password: "CodexFtp123!", path: "www\\codex-test" });
  const [editingFtpLogin, setEditingFtpLogin] = useState("");
  const [isFtpMutating, setIsFtpMutating] = useState(false);

  async function loadFtp() {
    setIsLoadingFtp(true);
    setFtpError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/ftp", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setFtpError(result?.message ?? "Unable to load FTP users.");
        return;
      }

      setFtpDashboard(result.dashboard);
    } catch {
      setFtpError("Unable to reach FTP service.");
    } finally {
      setIsLoadingFtp(false);
    }
  }

  useEffect(() => {
    loadFtp();
  }, [cpId]);

  const users = ftpDashboard?.users ?? [];
  const totals = ftpDashboard?.totals ?? { total: 0, rootUsers: 0, extraUsers: 0 };
  const ftpJobs = (activity?.jobs ?? []).filter((job) =>
    job.server === "ftp-manager" ||
    String(job.from ?? "").toLowerCase().startsWith("ftp:") ||
    String(job.type ?? "").toLowerCase().includes("ftp")
  );

  useEffect(() => {
    if (!ftpDashboard?.cpLogin || editingFtpLogin) return;
    setFtpDraft((draft) => {
      if (draft.path && !draft.path.includes("openreward-001") && !draft.path.includes("jyu001-001")) return draft;
      return { ...draft, path: "www\\codex-test" };
    });
  }, [ftpDashboard?.cpLogin, editingFtpLogin]);

  async function runFtpRequest(path, options = {}) {
    setFtpMessage("");
    setIsFtpMutating(true);
    try {
      const response = await fetch(path, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to run FTP action.");
      }

      setFtpMessage(result.message);
      await loadFtp();
      await reloadActivity();
      return result;
    } finally {
      setIsFtpMutating(false);
    }
  }

  async function submitFtpDraft(event) {
    event.preventDefault();
    setFtpMessage("");
    try {
      const payload = {
        cpId,
        login: ftpDraft.login,
        password: ftpDraft.password,
        path: ftpDraft.path,
        quotaMb: 0,
        permission: "write"
      };
      const result = editingFtpLogin
        ? await runFtpRequest(`/api/hosting/ftp/users/${encodeURIComponent(editingFtpLogin)}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        })
        : await provisionHosting("/api/hosting/ftp/users", cpId, payload);
      setFtpMessage(result.message);
      setEditingFtpLogin("");
      setFtpDraft((draft) => ({ ...draft, login: "codex-test-ftp", password: "CodexFtp123!" }));
      await loadFtp();
    } catch (error) {
      setFtpMessage(error.message);
    }
  }

  function editFtpUser(user) {
    setEditingFtpLogin(user.login);
    setFtpDraft({
      login: user.login,
      password: "",
      path: simplifySitePath(user.rawPath || user.path || "", ftpDashboard?.cpLogin)
    });
    setFtpMessage("Editing live FTP user. The active Classic ASP edit page only changes the password.");
  }

  async function deleteFtpUser(user) {
    if (user.isRootUser) {
      setFtpMessage("Root FTP user cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete FTP user ${displayFtpLogin(user.login, ftpDashboard?.cpLogin)}? This deletes the cp_config_FTP row, matching active Classic ASP behavior.`)) return;
    try {
      await runFtpRequest(`/api/hosting/ftp/users/${encodeURIComponent(user.login)}?cpId=${encodeURIComponent(cpId)}`, {
        method: "DELETE"
      });
    } catch (error) {
      setFtpMessage(error.message);
    }
  }

  function refreshFtpSection() {
    loadFtp();
    reloadActivity();
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">Live FTP</span>
          <h2>FTP Manager</h2>
          <p>FTP account inventory from cp_config_FTP. Active Classic ASP create/delete writes this table directly; password writes need Persits-compatible encryption before they are enabled.</p>
        </div>
        <div className="database-total-grid">
          <div><span>Total</span><strong>{totals.total}</strong></div>
          <div><span>Root</span><strong>{totals.rootUsers}</strong></div>
          <div><span>Extra</span><strong>{totals.extraUsers}</strong></div>
        </div>
        <RefreshButton onClick={refreshFtpSection} />
      </article>

      <div className="database-toolbar panel-card">
        <div className="database-actions">
          <button className="primary-button compact" type="button" onClick={() => {
            setEditingFtpLogin("");
            setFtpDraft({ login: "codex-test-ftp", password: "CodexFtp123!", path: "www\\codex-test" });
          }}>+ FTP User</button>
        </div>
      </div>

      <article className="panel-card advance-form-card">
        <div>
          <span className="status-pill blue">FTP User Draft</span>
          <h3>{editingFtpLogin ? `Edit ${displayFtpLogin(editingFtpLogin, ftpDashboard?.cpLogin)}` : "Create FTP User"}</h3>
          <p>{editingFtpLogin ? "The active Classic ASP ftpedit page exposes password update only." : "Matches the active Classic ASP Add FTP User form: login, password, confirm password, and folder."}</p>
        </div>
        <form className="advance-inline-form" onSubmit={submitFtpDraft}>
          <label>
            Login
            <input value={ftpDraft.login} onChange={(event) => setFtpDraft((draft) => ({ ...draft, login: event.target.value }))} />
          </label>
          <label>
            Password
            <input type="password" value={ftpDraft.password} onChange={(event) => setFtpDraft((draft) => ({ ...draft, password: event.target.value }))} />
          </label>
          <label>
            Path
            <input value={ftpDraft.path} disabled={!!editingFtpLogin} onChange={(event) => setFtpDraft((draft) => ({ ...draft, path: event.target.value }))} />
          </label>
          <button className="primary-button compact" type="submit" disabled={isFtpMutating}>{editingFtpLogin ? "Save FTP User" : "Create FTP User"}</button>
          {editingFtpLogin && (
            <button className="secondary-button compact" type="button" onClick={() => {
              setEditingFtpLogin("");
              setFtpDraft({ login: "codex-test-ftp", password: "CodexFtp123!", path: "www\\codex-test" });
            }}>Cancel</button>
          )}
        </form>
      </article>

      {isLoadingFtp && <LoadingState label="Loading FTP users" />}
      {ftpMessage && <p className="sandbox-message">{ftpMessage}</p>}
      {ftpError && (
        <div className="panel-card dashboard-error-panel">
          <p>{ftpError}</p>
          <IconActionButton label="Retry" onClick={loadFtp} />
        </div>
      )}
      {!isLoadingFtp && !ftpError && !users.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No FTP users</span>
          <h2>No FTP users found</h2>
          <p>This hosting account does not have any visible FTP rows.</p>
        </div>
      )}

      {!!users.length && (
        <div className="table-wrap website-table">
          <table>
            <thead>
              <tr>
                <th>Login</th>
                <th>Password</th>
                <th>Server IP</th>
                <th>Path</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.login}>
                  <td>
                    <span className="ftp-login-cell">
                      <MenuIcon name="ftp" />
                      {displayFtpLogin(user.login, ftpDashboard?.cpLogin)}
                      {user.isRootUser && <span className="status-pill blue">Root</span>}
                    </span>
                  </td>
                  <td>********</td>
                  <td>{user.server || "Default FTP server"}</td>
                  <td>{simplifySitePath(user.rawPath || user.path, ftpDashboard?.cpLogin)}</td>
                  <td>
                    <div className="website-action-buttons compact-actions">
                      <IconActionButton label="Edit" onClick={() => editFtpUser(user)} />
                      <IconActionButton label="Delete" className="secondary-button compact icon-only-button danger" disabled={isFtpMutating || user.isRootUser} onClick={() => deleteFtpUser(user)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <article className="panel-card knowledge-card">
        <span className="status-pill muted">KB Article</span>
        <a href="http://www.smarterasp.net/support/kb/c8/ftp.aspx" target="_blank" rel="noreferrer">How to use FTP</a>
        <a href="http://www.smarterasp.net/support/KB/a7/deploying-visual-studio-2010-web-application-project.aspx" target="_blank" rel="noreferrer">How to Deploy Web Project using Visual Studio + FTP</a>
        <a href="http://www.smarterasp.net/support/KB/a8/deploying-visual-studio-2010-web-site-project-to.aspx" target="_blank" rel="noreferrer">How to Deploy Web Application using Visual Studio + FTP</a>
        <a href="http://www.smarterasp.net/support/KB/c34/ftp-program-configuration.aspx" target="_blank" rel="noreferrer">How to Deploy Files using other FTP Tools</a>
      </article>

      <ActivityList jobs={ftpJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle="No recent FTP jobs" onRetry={reloadActivity} />
    </section>
  );
}

function displayFtpLogin(login, cpLogin) {
  const text = String(login ?? "").trim();
  if (cpLogin && text.toLowerCase() === String(cpLogin).toLowerCase()) {
    return "Root FTP User";
  }
  return text || "FTP User";
}

function FilesSection({ cpId }) {
  const { activity, isLoading, error, reload } = useHostingActivity(cpId);
  const fileUploadInputRef = useRef(null);
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [fileAgentHealth, setFileAgentHealth] = useState(null);
  const [sitesError, setSitesError] = useState("");
  const [filesMessage, setFilesMessage] = useState("");
  const [fileManagerPreview, setFileManagerPreview] = useState(null);
  const [currentFilePath, setCurrentFilePath] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  const [fileEditor, setFileEditor] = useState(null);
  const [isFileSaving, setIsFileSaving] = useState(false);
  const [protectionDraft, setProtectionDraft] = useState({
    site: "sample.com",
    path: "/www/sample.com",
    action: "Enable Password Protection",
    username: "protected-user"
  });
  const [migrationDraft, setMigrationDraft] = useState({
    source: "legacy-panel",
    target: "/www/sample.com",
    action: "Repair Migration Permissions"
  });
  const fileJobs = (activity?.jobs ?? []).filter((job) =>
    ["zip", "Unzip", "perm", "scanvirus"].includes(job.type) ||
    job.server === "file-manager" ||
    String(job.from ?? "").toLowerCase().startsWith("/www/")
  );
  const totals = activity?.totals ?? { total: 0, pending: 0, running: 0, errors: 0 };

  async function loadFileSites() {
    setSitesError("");
    try {
      const sitesResponse = await fetch(hostingApiUrl("/api/hosting/sites", cpId));
      const result = await sitesResponse.json().catch(() => null);
      if (!sitesResponse.ok || !result?.success) {
        setSitesError(result?.message ?? "Unable to load site folders.");
        return;
      }

      setSitesDashboard(result.dashboard);
      fetch(hostingApiUrl("/api/hosting/security", cpId))
        .then((response) => response.json().then((securityResult) => ({ response, securityResult })))
        .then(({ response, securityResult }) => {
          if (response.ok && securityResult?.success) {
            setSecurityDashboard(securityResult.dashboard);
          }
        })
        .catch(() => { });
      fetch(hostingApiUrl("/api/hosting/files/agent-health", cpId))
        .then((response) => response.json().then((healthResult) => ({ response, healthResult })))
        .then(({ healthResult }) => setFileAgentHealth(healthResult))
        .catch(() => setFileAgentHealth({ success: false, message: "Unable to reach file-manager agent health check." }));
    } catch {
      setSitesError("Unable to reach site folder service.");
    }
  }

  useEffect(() => {
    loadFileSites();
  }, [cpId]);

  const siteFolders = (sitesDashboard?.sites ?? []).slice(0, 12);
  const [viewMode, setViewMode] = useSectionViewMode("cp-files", siteFolders.length);
  const securityBySite = new Map((securityDashboard?.siteSecurityRows ?? []).map((row) => [String(row.siteUid), row]));
  const managerFolders = fileManagerPreview?.folders ?? [];
  const managerFiles = fileManagerPreview?.files ?? [];
  const managerItems = [...managerFolders, ...managerFiles];
  const [managerViewMode, setManagerViewMode] = useSectionViewMode("cp-file-manager", managerItems.length);

  async function queueFileTest(action, site = null, details = "") {
    setFilesMessage("");
    const workerAction = {
      Zip: "zip",
      Unzip: "Unzip",
      Permissions: "perm",
      "Repair Migration Permissions": "perm",
      "Scan Virus": "scanvirus",
      "Rescan Migrated Files": "scanvirus"
    }[action];

    if (workerAction) {
      const targetSite = site ?? siteFolders[0] ?? null;
      const sourcePath = targetSite
        ? legacySitePath(targetSite, sitesDashboard?.cpLogin)
        : migrationDraft.source || protectionDraft.path || "\\www";
      const destination = action === "Zip"
        ? `${sourcePath}.zip`
        : action === "Unzip"
          ? sourcePath.replace(/\.zip$/i, "") || "\\www"
          : action.includes("Permissions")
            ? "read,write"
            : "";

      try {
        const result = await createHostingWorkqueue(cpId, {
          type: workerAction,
          zipFile: sourcePath,
          dstFolder: destination,
          serverId: "",
          data1: details || action,
          siteOwner: targetSite?.siteName ?? "",
          notifyEmail: "file-manager"
        });
        setFilesMessage(result.message);
        await reload();
        return;
      } catch (error) {
        setFilesMessage(error.message);
        return;
      }
    }

    try {
      await createPanelTestActivity(cpId, {
        from: site ? simplifySitePath(site.sitePath, sitesDashboard?.cpLogin) : `/www/${workerSlug(action)}`,
        to: site ? `${action}:${site.siteName}` : `/panel-test/files/${workerSlug(action)}`,
        server: "file-manager",
        note: details || `File gateway required for ${action}`
      });
      setFilesMessage(`${action} needs the file manager gateway before it can run.`);
      await reload();
    } catch (error) {
      setFilesMessage(error.message);
    }
  }

  async function browseFileManager(path = currentFilePath, searchValue = fileSearch) {
    setFilesMessage("");
    const nextPath = path ?? "";
    const params = new URLSearchParams();
    params.set("path", nextPath);
    if (searchValue) params.set("search", searchValue);
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/files/browse?${params.toString()}`, cpId));
      const result = await response.json().catch(() => null);
      setFileManagerPreview(result?.fileManager ?? null);
      if (result?.fileManager) {
        setCurrentFilePath(result.fileManager.relativePath || nextPath);
      }
      setFilesMessage(formatFileManagerMessage(result?.message ?? "File manager browse completed."));
    } catch {
      setFilesMessage("Unable to reach file manager API.");
    }
  }

  function submitFileSearch(event) {
    event.preventDefault();
    browseFileManager(currentFilePath, fileSearch);
  }

  function openFileManagerItem(item) {
    if (item?.isFolder) {
      browseFileManager(item.relativePath || item.name || "");
    }
  }

  async function createTestFolder() {
    setFilesMessage("");
    try {
      const response = await fetch("/api/hosting/files/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpId,
          action: "new-folder",
          path: "",
          name: `codex-test-${Date.now()}`,
          targetPath: "",
          targetName: "",
          overwrite: false
        })
      });
      const result = await response.json().catch(() => null);
      setFileManagerPreview(result?.fileManager ?? null);
      setFilesMessage(formatFileManagerMessage(result?.message ?? "File manager action completed."));
    } catch {
      setFilesMessage("Unable to reach file manager API.");
    }
  }

  async function runFileManagerAction(payload) {
    const response = await fetch("/api/hosting/files/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpId, ...payload })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(formatFileManagerMessage(result?.message ?? "File manager action failed."));
    }
    return result;
  }

  async function readFileForEdit(item) {
    setFilesMessage("");
    try {
      const result = await runFileManagerAction({
        action: "read-file",
        path: currentFilePath || fileManagerPreview?.relativePath || "",
        name: item.name,
        targetPath: "",
        targetName: "",
        overwrite: false
      });
      setFileEditor({
        name: item.name,
        path: currentFilePath || fileManagerPreview?.relativePath || "",
        content: result?.fileManager?.preview ?? "",
        originalContent: result?.fileManager?.preview ?? ""
      });
      setFilesMessage(result.message);
    } catch (error) {
      setFilesMessage(error.message);
    }
  }

  async function downloadFileManagerItem(item) {
    if (!item || item.isFolder) return;
    setFilesMessage("");
    try {
      const result = await runFileManagerAction({
        action: "read-file",
        path: currentFilePath || fileManagerPreview?.relativePath || "",
        name: item.name,
        targetPath: "",
        targetName: "",
        overwrite: false
      });
      const blob = new Blob([result?.fileManager?.preview ?? ""], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setFilesMessage("File downloaded.");
    } catch (error) {
      setFilesMessage(error.message);
    }
  }

  function openUploadPicker() {
    fileUploadInputRef.current?.click();
  }

  async function uploadFileManagerItem(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1048576) {
      setFilesMessage("Upload is limited to 1 MB text files until binary streaming is wired.");
      return;
    }

    setFilesMessage("");
    try {
      const content = await file.text();
      const result = await runFileManagerAction({
        action: "save-file",
        path: currentFilePath || fileManagerPreview?.relativePath || "",
        name: file.name,
        targetPath: "",
        targetName: file.name,
        overwrite: true,
        content,
        encoding: ""
      });
      setFilesMessage(result.message);
      await browseFileManager(currentFilePath, fileSearch);
    } catch (error) {
      setFilesMessage(error.message);
    }
  }

  async function runFileItemAction(action, item) {
    setFilesMessage("");
    try {
      const result = await runFileManagerAction({
        action,
        path: currentFilePath || fileManagerPreview?.relativePath || "",
        name: item.name,
        targetPath: currentFilePath || fileManagerPreview?.relativePath || "",
        targetName: action === "zip" ? `${item.name}.zip` : "",
        overwrite: false
      });
      setFileManagerPreview(result?.fileManager ?? fileManagerPreview);
      setFilesMessage(result.message);
      if (action === "zip" || action === "unzip") {
        await reload();
      } else {
        await browseFileManager(currentFilePath, fileSearch);
      }
    } catch (error) {
      setFilesMessage(error.message);
    }
  }

  async function saveFileEditor(event) {
    event.preventDefault();
    if (!fileEditor) return;
    setIsFileSaving(true);
    setFilesMessage("");
    try {
      const result = await runFileManagerAction({
        action: "save-file",
        path: fileEditor.path,
        name: fileEditor.name,
        targetPath: "",
        targetName: fileEditor.name,
        overwrite: true,
        content: fileEditor.content,
        encoding: ""
      });
      setFilesMessage(result.message);
      setFileEditor((editor) => editor ? { ...editor, originalContent: editor.content } : editor);
      await browseFileManager(fileEditor.path, fileSearch);
    } catch (error) {
      setFilesMessage(error.message);
    } finally {
      setIsFileSaving(false);
    }
  }

  function submitProtectionDraft(event) {
    event.preventDefault();
    queueFileTest(
      protectionDraft.action,
      null,
      `Site protection request: site ${protectionDraft.site}; path ${protectionDraft.path}; user ${protectionDraft.username}; action ${protectionDraft.action}`
    );
  }

  function submitMigrationDraft(event) {
    event.preventDefault();
    queueFileTest(
      migrationDraft.action,
      null,
      `Migration repair request: source ${migrationDraft.source}; target ${migrationDraft.target}; action ${migrationDraft.action}`
    );
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">File Manager</span>
          <h2>File Manager</h2>
          <p>File operations use the legacy work queue for long-running zip, unzip, permission, and scan jobs.</p>
        </div>
        <div className="database-total-grid">
          <div><span>Recent Jobs</span><strong>{fileJobs.length}</strong></div>
          <div><span>Pending</span><strong>{totals.pending}</strong></div>
          <div><span>Running</span><strong>{totals.running}</strong></div>
          <div><span>Errors</span><strong>{totals.errors}</strong></div>
        </div>
        <RefreshButton onClick={() => { reload(); loadFileSites(); }} />
      </article>

      {!!securityDashboard?.siteSecurityRows?.length && (
        <article className="panel-card site-security-summary-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">Site Security</span>
              <h3>Lock and Firewall Inventory</h3>
              <p>Read-only view from `audit.dbo.siteSecurity` and site WebKnight flags.</p>
            </div>
            <MenuIcon name="shield" />
          </div>
          <div className="service-status-grid">
            <div className="service-status-card">
              <div><span>Locked Sites</span><strong>{securityDashboard.totals?.lockedSites ?? 0}</strong></div>
              <p>Sites with audit rows marked not writable.</p>
            </div>
            <div className="service-status-card">
              <div><span>Firewall On</span><strong>{securityDashboard.siteSecurityRows.filter((row) => row.webKnight).length}</strong></div>
              <p>Sites with WebKnight enabled in CP config.</p>
            </div>
            <div className="service-status-card">
              <div><span>Audit Rows</span><strong>{securityDashboard.siteSecurityRows.filter((row) => row.hasAuditRow).length}</strong></div>
              <p>Existing file lock records from audit DB.</p>
            </div>
          </div>
        </article>
      )}

      {fileAgentHealth && (
        <article className="panel-card site-security-summary-card">
          <div className="database-card-header">
            <div>
              <span className={fileAgentHealth.success ? "status-pill" : "status-pill muted"}>
                {fileAgentHealth.success ? "Agents healthy" : "Agent attention"}
              </span>
              <h3>File Manager Agents</h3>
              <p>{fileAgentHealth.message}</p>
            </div>
            <MenuIcon name="server" />
          </div>
          <div className="service-status-grid">
            {[
              ["Browse", fileAgentHealth.browse],
              ["Action", fileAgentHealth.action]
            ].map(([label, agent]) => (
              <div className="service-status-card" key={label}>
                <div><span>{label}</span><strong>{agent?.success ? "OK" : "Check"}</strong></div>
                <p>{agent?.path || "Agent path not available"}</p>
              </div>
            ))}
          </div>
        </article>
      )}

      <div className="database-toolbar panel-card">
        <div className="database-actions">
          <IconActionButton label="Browse Root" className="primary-button compact icon-only-button" onClick={() => browseFileManager("")} />
          <IconActionButton label="Parent Folder" disabled={!fileManagerPreview?.parentPath} onClick={() => browseFileManager(fileManagerPreview?.parentPath || "")} />
          <IconActionButton label="New Folder" onClick={createTestFolder} />
          <IconActionButton label="Upload" onClick={openUploadPicker} />
          {["Zip", "Unzip", "Permissions", "Scan Virus", "Lock Site", "Unlock Site", "Raw Logs"].map((action) => (
            <IconActionButton label={action} key={action} onClick={() => queueFileTest(action)} />
          ))}
          <input
            ref={fileUploadInputRef}
            type="file"
            className="visually-hidden"
            onChange={uploadFileManagerItem}
          />
        </div>
        <form className="file-search-form" onSubmit={submitFileSearch}>
          <MenuIcon name="search" />
          <input
            value={fileSearch}
            onChange={(event) => setFileSearch(event.target.value)}
            placeholder="Search files..."
          />
          <IconActionButton label="Search" className="primary-button compact icon-only-button" type="submit" />
        </form>
        <ViewModeToggle viewMode={managerViewMode} onChange={setManagerViewMode} label="File manager view mode" />
      </div>
      {filesMessage && <p className="sandbox-message">{filesMessage}</p>}

      <article className="panel-card file-root-card">
        <div className="database-card-header">
          <div>
            <span className="status-pill">Root</span>
            <h3>{fileManagerPreview?.relativePath || currentFilePath || "/www"}</h3>
            <p>Remote browsing and guarded file actions use encrypted JSON agents on the hosting server.</p>
          </div>
          <MenuIcon name="folder" />
        </div>
        <div className="file-manager-meta">
          <span>{managerFolders.length} folders</span>
          <span>{managerFiles.length} files</span>
          <span>{fileManagerPreview?.url || "Gateway not called yet"}</span>
        </div>

        {!fileManagerPreview && (
          <div className="empty-state file-empty-state">
            <MenuIcon name="folder-search" />
            <p>Use the folder icon to browse the hosting root once the server agent is uploaded.</p>
          </div>
        )}

        {fileManagerPreview && managerItems.length === 0 && (
          <div className="empty-state file-empty-state">
            <MenuIcon name="folder" />
            <p>No files or folders returned for this path.</p>
          </div>
        )}

        {!!managerItems.length && managerViewMode === "cards" && (
          <div className="file-manager-grid">
            {managerItems.map((item) => (
              <article className="file-item-card" key={`${item.type}-${item.relativePath}-${item.name}`}>
                <button
                  className="file-item-main"
                  type="button"
                  onClick={() => openFileManagerItem(item)}
                  disabled={!item.isFolder}
                  title={item.isFolder ? "Open folder" : item.name}
                >
                  <MenuIcon name={item.isFolder ? "folder" : "invoice"} />
                  <span>{item.name}</span>
                </button>
                <dl>
                  <div><dt>Type</dt><dd>{item.isFolder ? "Folder" : item.extension ? `.${item.extension}` : "File"}</dd></div>
                  <div><dt>Size</dt><dd>{item.isFolder ? "-" : formatFileSize(item.size)}</dd></div>
                  <div><dt>Modified</dt><dd>{formatDateTime(item.modified)}</dd></div>
                </dl>
                <div className="website-action-buttons compact-actions">
                  {item.isFolder && <IconActionButton label="Open" onClick={() => openFileManagerItem(item)} />}
                  {!item.isFolder && item.isEditable && <IconActionButton label="Edit" onClick={() => readFileForEdit(item)} />}
                  {!item.isFolder && item.isEditable && <IconActionButton label="Download" onClick={() => downloadFileManagerItem(item)} />}
                  <IconActionButton label="Permissions" onClick={() => queueFileTest("Permissions", null, `Permissions for ${item.relativePath}`)} />
                  <IconActionButton label="Copy" onClick={() => runFileItemAction("copy", item)} />
                  <IconActionButton label="Move" onClick={() => runFileItemAction("move", item)} />
                  <IconActionButton label="Zip" onClick={() => runFileItemAction("zip", item)} />
                  {!item.isFolder && item.extension?.toLowerCase() === "zip" && <IconActionButton label="Unzip" onClick={() => runFileItemAction("unzip", item)} />}
                </div>
              </article>
            ))}
          </div>
        )}

        {!!managerItems.length && managerViewMode === "table" && (
          <div className="table-wrap file-manager-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managerItems.map((item) => (
                  <tr key={`${item.type}-${item.relativePath}-${item.name}`}>
                    <td>
                      <button
                        className="table-link-button file-name-button"
                        type="button"
                        disabled={!item.isFolder}
                        onClick={() => openFileManagerItem(item)}
                        title={item.isFolder ? "Open folder" : item.name}
                      >
                        <MenuIcon name={item.isFolder ? "folder" : "invoice"} />
                        <span>{item.name}</span>
                      </button>
                    </td>
                    <td>{item.isFolder ? "Folder" : item.extension ? `.${item.extension}` : "File"}</td>
                    <td>{item.isFolder ? "-" : formatFileSize(item.size)}</td>
                    <td>{formatDateTime(item.modified)}</td>
                    <td>
                      <div className="website-action-buttons compact-actions">
                        {item.isFolder && <IconActionButton label="Open" onClick={() => openFileManagerItem(item)} />}
                        {!item.isFolder && item.isEditable && <IconActionButton label="Edit" onClick={() => readFileForEdit(item)} />}
                        {!item.isFolder && item.isEditable && <IconActionButton label="Download" onClick={() => downloadFileManagerItem(item)} />}
                        <IconActionButton label="Permissions" onClick={() => queueFileTest("Permissions", null, `Permissions for ${item.relativePath}`)} />
                        <IconActionButton label="Copy" onClick={() => runFileItemAction("copy", item)} />
                        <IconActionButton label="Move" onClick={() => runFileItemAction("move", item)} />
                        <IconActionButton label="Zip" onClick={() => runFileItemAction("zip", item)} />
                        {!item.isFolder && item.extension?.toLowerCase() === "zip" && <IconActionButton label="Unzip" onClick={() => runFileItemAction("unzip", item)} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {fileManagerPreview?.preview && <pre className="gateway-preview">{fileManagerPreview.preview}</pre>}
      </article>

      {fileEditor && (
        <article className="panel-card file-editor-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">Editor</span>
              <h3>{fileEditor.name}</h3>
              <p>{fileEditor.path || "Hosting root"}</p>
            </div>
            <IconActionButton label="Close" onClick={() => setFileEditor(null)} />
          </div>
          <form className="file-editor-form" onSubmit={saveFileEditor}>
            <textarea
              value={fileEditor.content}
              onChange={(event) => setFileEditor((editor) => editor ? { ...editor, content: event.target.value } : editor)}
              spellCheck="false"
            />
            <div className="file-editor-actions">
              <span>{fileEditor.content === fileEditor.originalContent ? "No unsaved changes" : "Unsaved changes"}</span>
              <button className="primary-button compact" disabled={isFileSaving} type="submit">
                {isFileSaving ? <LoadingIcon label="Saving file" /> : "Save"}
              </button>
            </div>
          </form>
        </article>
      )}

      <div className="advance-form-grid">
        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Site Protection Draft</span>
            <h3>Password Protection</h3>
            <p>Permission repair can queue to the legacy worker. Password protection still needs the file gateway mapping.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitProtectionDraft}>
            <label>
              Site
              <input value={protectionDraft.site} onChange={(event) => setProtectionDraft((draft) => ({ ...draft, site: event.target.value }))} />
            </label>
            <label>
              Path
              <input value={protectionDraft.path} onChange={(event) => setProtectionDraft((draft) => ({ ...draft, path: event.target.value }))} />
            </label>
            <label>
              User
              <input value={protectionDraft.username} onChange={(event) => setProtectionDraft((draft) => ({ ...draft, username: event.target.value }))} />
            </label>
            <label>
              Action
              <select value={protectionDraft.action} onChange={(event) => setProtectionDraft((draft) => ({ ...draft, action: event.target.value }))}>
                <option value="Enable Password Protection">Enable Password Protection</option>
                <option value="Disable Password Protection">Disable Password Protection</option>
                <option value="Lock Site">Lock Site</option>
                <option value="Unlock Site">Unlock Site</option>
                <option value="Allow FB API">Allow FB API</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Queue / Check Action</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Migration Draft</span>
            <h3>Repair Queue</h3>
            <p>Permission repair and scans queue through the legacy worker; migration status remains read-only.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitMigrationDraft}>
            <label>
              Source
              <input value={migrationDraft.source} onChange={(event) => setMigrationDraft((draft) => ({ ...draft, source: event.target.value }))} />
            </label>
            <label>
              Target
              <input value={migrationDraft.target} onChange={(event) => setMigrationDraft((draft) => ({ ...draft, target: event.target.value }))} />
            </label>
            <label>
              Action
              <select value={migrationDraft.action} onChange={(event) => setMigrationDraft((draft) => ({ ...draft, action: event.target.value }))}>
                <option value="Repair Migration Permissions">Repair Permissions</option>
                <option value="Check Migration Status">Check Migration Status</option>
                <option value="Rescan Migrated Files">Rescan Migrated Files</option>
                <option value="Queue Migration Notice">Queue Migration Notice</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Queue / Check Action</button>
          </form>
        </article>
      </div>

      {sitesError && (
        <div className="panel-card dashboard-error-panel">
          <p>{sitesError}</p>
          <IconActionButton label="Retry" onClick={loadFileSites} />
        </div>
      )}

      {!!siteFolders.length && viewMode === "cards" && (
        <div className="domain-service-grid">
          {siteFolders.map((site) => {
            const security = securityBySite.get(String(site.siteUid));
            const locked = !!security?.hasAuditRow && !security?.isWritable;
            return (
              <article className="panel-card domain-service-card" key={site.siteUid}>
                <div className="database-card-header">
                  <div>
                    <span className={locked ? "status-pill warning" : site.status === "Running" ? "status-pill" : "status-pill muted"}>
                      {locked ? "Locked" : site.status}
                    </span>
                    <h3>{site.siteName}</h3>
                    <p>{site.rootName || "Website folder"}</p>
                  </div>
                  <MenuIcon name="folder" />
                </div>
                <dl className="card-meta single">
                  <div><dt>Path</dt><dd>{simplifySitePath(site.sitePath, sitesDashboard?.cpLogin)}</dd></div>
                  <div><dt>Runtime</dt><dd>{site.version ? `.NET ${site.version}` : site.phpVersion ? `PHP ${site.phpVersion}` : "Website"}</dd></div>
                  <div><dt>Domains</dt><dd>{site.mappedDomains?.length ?? 0}</dd></div>
                  <div><dt>Firewall</dt><dd>{security?.webKnight ? "Enabled" : "Off"}</dd></div>
                  <div><dt>Writable</dt><dd>{security?.hasAuditRow ? security.isWritable ? "Yes" : "No" : "No audit row"}</dd></div>
                </dl>
                <div className="database-action-row">
                  {["Open", "Upload", "Permissions", "Lock Site"].map((action) => (
                    <IconActionButton
                      label={action}
                      key={action}
                      onClick={() => action === "Open" ? browseFileManager(site.sitePath) : queueFileTest(action, site)}
                    />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {!!siteFolders.length && viewMode === "table" && (
        <div className="table-wrap website-table">
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th>Root</th>
                <th>Path</th>
                <th>Status</th>
                <th>Security</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {siteFolders.map((site) => {
                const security = securityBySite.get(String(site.siteUid));
                const locked = !!security?.hasAuditRow && !security?.isWritable;
                return (
                  <tr key={site.siteUid}>
                    <td>{site.siteName}</td>
                    <td>{site.rootName || "Website folder"}</td>
                    <td>{simplifySitePath(site.sitePath, sitesDashboard?.cpLogin)}</td>
                    <td><span className={site.status === "Running" ? "status-pill" : "status-pill muted"}>{site.status}</span></td>
                    <td>{locked ? "Locked" : security?.webKnight ? "Firewall on" : "Standard"}</td>
                    <td>
                      <div className="website-action-buttons compact-actions">
                        <IconActionButton label="Open" onClick={() => browseFileManager(site.sitePath)} />
                        {["Zip", "Unzip", "Permissions", "Scan Virus"].map((action) => (
                          <IconActionButton label={action} key={action} onClick={() => queueFileTest(action, site)} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ActivityList activity={activity} jobs={fileJobs} isLoading={isLoading} error={error} emptyTitle="No recent file jobs" onRetry={reload} />
    </section>
  );
}

function formatFileManagerMessage(message) {
  const text = message || "";
  if (text.includes("Legacy JSON agent rejected the request")) {
    return "File Manager agent rejected the encrypted request. Upload the latest getFilesFolder.asp/fileManagerAction.asp pair and confirm FILE_MANAGER_ENCRYPT_KEY matches.";
  }
  if (text.includes("Legacy agent rejected the request")) {
    return "Legacy File Manager action was rejected by the hosting server. Upload the latest encrypted fileManagerAction.asp agent.";
  }
  return text;
}

function AppsSection({ cpId }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [appsDashboard, setAppsDashboard] = useState(null);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState("");
  const [appsMessage, setAppsMessage] = useState("");
  const [previewPluginId, setPreviewPluginId] = useState(null);
  const [appRequirements, setAppRequirements] = useState(null);
  const [appInstallPlan, setAppInstallPlan] = useState(null);
  const [appSearch, setAppSearch] = useState("");
  const [activeAppType, setActiveAppType] = useState("All");
  const [nodeDraft, setNodeDraft] = useState({
    site: "sample.com",
    source: "https://github.com/example/node-app.git",
    mode: "Deploy from Git",
    handler: "HTTP Platform"
  });

  async function loadApps() {
    setIsLoadingApps(true);
    setAppsError("");
    try {
      const appsResponse = await fetch(hostingApiUrl("/api/hosting/apps", cpId));
      const result = await appsResponse.json().catch(() => null);
      if (!appsResponse.ok || !result?.success) {
        setAppsError(result?.message ?? "Unable to load app catalog.");
        return;
      }

      setAppsDashboard(result.dashboard);
    } catch {
      setAppsError("Unable to reach app catalog service.");
    } finally {
      setIsLoadingApps(false);
    }
  }

  useEffect(() => {
    loadApps();
  }, [cpId]);

  const catalog = appsDashboard?.catalog ?? [];
  const appTypes = ["All", ...Array.from(new Set(catalog.map((plugin) => appTypeName(plugin)))).sort()];
  const filteredCatalog = catalog.filter((plugin) => {
    const appType = appTypeName(plugin);
    const matchesType = activeAppType === "All" || appType === activeAppType;
    const haystack = `${plugin.name} ${plugin.version} ${plugin.language} ${plugin.category} ${plugin.description}`.toLowerCase();
    return matchesType && haystack.includes(appSearch.trim().toLowerCase());
  });
  const [viewMode, setViewMode] = useSectionViewMode("cp-apps", filteredCatalog.length);
  const deployJobs = appsDashboard?.deployJobs ?? [];
  const appJobs = [
    ...deployJobs,
    ...(activity?.jobs ?? []).filter((job) =>
      job.server === "plugin-installer" ||
      job.type === "nodejs" ||
      job.type === "deploy" ||
      String(job.from ?? "").toLowerCase().startsWith("plugin:") ||
      String(job.from ?? "").toLowerCase().startsWith("requirements:")
    )
  ].filter((job, index, list) => list.findIndex((candidate) => candidate.id === job.id) === index);

  async function createPluginInstallTest(plugin) {
    setAppsMessage("");
    setAppInstallPlan(null);
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/apps/install", cpId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpId,
          pluginId: plugin.pluginId,
          siteUid: 0,
          installPath: "",
          databaseId: 0,
          databaseEngine: "",
          parameters: {}
        })
      });
      const result = await response.json().catch(() => null);
      if (result?.plan) {
        setAppInstallPlan(result.plan);
        setAppRequirements({
          plugin: result.plan.plugin,
          parameters: "",
          configFiles: [],
          permissions: [],
          legacySources: result.plan.legacySources ?? []
        });
      }
      setAppsMessage(result?.message ?? `${plugin.name} install plan could not be loaded.`);
    } catch (error) {
      setAppsMessage(error.message);
    }
  }

  async function createPluginRequirementTest(plugin) {
    setAppsMessage("");
    setAppInstallPlan(null);
    setAppRequirements(null);
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/apps/${plugin.pluginId}/requirements`, cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to load app requirements.");
      }

      setAppsMessage(result.message);
      setAppRequirements(result.requirements);
    } catch (error) {
      setAppsMessage(error.message);
    }
  }

  async function createNodeDeployTest(event) {
    event.preventDefault();
    setAppsMessage("");
    try {
      const isDeploy = nodeDraft.mode === "Deploy from Git";
      const siteName = nodeDraft.site || "node-site";
      const result = await createHostingWorkqueue(cpId, {
        type: isDeploy ? "deploy" : "nodejs",
        zipFile: isDeploy ? nodeDraft.source : siteName,
        dstFolder: siteName,
        serverId: "",
        data1: `${nodeDraft.mode}; ${nodeDraft.handler}`,
        siteOwner: siteName,
        notifyEmail: "node-manager"
      });
      setAppsMessage(result.message);
      await reloadActivity();
    } catch (error) {
      setAppsMessage(error.message);
    }
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">One-click Apps</span>
          <h2>Application Installer</h2>
          <p>Plugin catalog and deploy history for ASP.NET, PHP, CMS, and Node.js installers.</p>
        </div>
        <div className="database-total-grid">
          <div><span>Apps</span><strong>{catalog.length}</strong></div>
          <div><span>Deploy Jobs</span><strong>{appJobs.length}</strong></div>
          <div><span>Enabled</span><strong>{catalog.filter((plugin) => plugin.enabled).length}</strong></div>
          <div><span>DB Required</span><strong>{catalog.filter((plugin) => plugin.usesDatabase).length}</strong></div>
        </div>
        <RefreshButton onClick={() => { loadApps(); reloadActivity(); }} />
      </article>

      <div className="database-toolbar panel-card">
        <label className="app-search-field">
          <MenuIcon name="apps" />
          <input
            value={appSearch}
            onChange={(event) => setAppSearch(event.target.value)}
            placeholder="Search apps..."
          />
        </label>
        <div className="engine-tabs" aria-label="App language filter">
          {appTypes.map((type) => (
            <button
              className={activeAppType === type ? "active" : ""}
              type="button"
              key={type}
              onClick={() => setActiveAppType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label="App catalog view mode" />
      </div>

      {isLoadingApps && <LoadingState label="Loading app catalog" />}
      {appsError && (
        <div className="panel-card dashboard-error-panel">
          <p>{appsError}</p>
          <IconActionButton label="Retry" onClick={loadApps} />
        </div>
      )}
      {appsMessage && <p className="sandbox-message">{appsMessage}</p>}
      {appInstallPlan && (
        <article className="panel-card app-requirements-panel">
          <div className="database-card-header">
            <div>
              <span className="status-pill orange">Install Plan</span>
              <h3>{appInstallPlan.plugin?.name}</h3>
              <p>{appInstallPlan.blocker}</p>
            </div>
            <button className="secondary-button compact" type="button" onClick={() => setAppInstallPlan(null)}>Close</button>
          </div>
          <div className="app-requirement-grid">
            <div>
              <strong>Target Path</strong>
              <code>{appInstallPlan.installPath}</code>
            </div>
            <div>
              <strong>Website</strong>
              <span>{appInstallPlan.site?.name ?? "Choose during install"}</span>
            </div>
            <div>
              <strong>Database</strong>
              <span>{appInstallPlan.database ? `${appInstallPlan.database.engine} · ${appInstallPlan.database.name}` : "Not selected"}</span>
            </div>
          </div>
          <ol className="plugin-step-list">
            {(appInstallPlan.steps ?? []).map((step) => <li key={step}>{step}</li>)}
          </ol>
        </article>
      )}
      {appRequirements && (
        <article className="panel-card app-requirements-panel">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">Legacy Requirements</span>
              <h3>{appRequirements.plugin?.name} {appRequirements.plugin?.version}</h3>
              <p>Read from the same plugin tables used by the Classic ASP installer flow.</p>
            </div>
            <button className="secondary-button compact" type="button" onClick={() => setAppRequirements(null)}>Close</button>
          </div>
          <div className="app-requirement-grid">
            <div>
              <strong>Parameters</strong>
              <code>{appRequirements.parameters || "No parameters row."}</code>
            </div>
            <div>
              <strong>Config Files</strong>
              <span>{appRequirements.configFiles?.length ?? 0}</span>
            </div>
            <div>
              <strong>Permissions</strong>
              <span>{appRequirements.permissions?.length ?? 0}</span>
            </div>
          </div>
          <WebsiteFunctionDataGroup name="configFiles" value={appRequirements.configFiles ?? []} />
          <WebsiteFunctionDataGroup name="permissions" value={appRequirements.permissions ?? []} />
          <WebsiteFunctionDataGroup name="legacySources" value={(appRequirements.legacySources ?? []).map((source) => ({ source }))} />
        </article>
      )}

      <article className="panel-card app-deploy-panel">
        <div className="database-card-header">
          <div>
            <span className="status-pill blue">Node.js Deploy</span>
            <h3>IISNode / HTTP Platform</h3>
            <p>Queues Node.js deploy and runtime jobs through the legacy worker.</p>
          </div>
          <MenuIcon name="deploy" />
        </div>
        <form className="advance-inline-form" onSubmit={createNodeDeployTest}>
          <label>
            Site
            <input value={nodeDraft.site} onChange={(event) => setNodeDraft((draft) => ({ ...draft, site: event.target.value }))} />
          </label>
          <label>
            Source
            <input value={nodeDraft.source} onChange={(event) => setNodeDraft((draft) => ({ ...draft, source: event.target.value }))} />
          </label>
          <label>
            Mode
            <select value={nodeDraft.mode} onChange={(event) => setNodeDraft((draft) => ({ ...draft, mode: event.target.value }))}>
              <option>Deploy from Git</option>
              <option>Deploy from ZIP</option>
              <option>Create Node Sub App</option>
              <option>Enable Node.js</option>
              <option>Disable Node.js</option>
            </select>
          </label>
          <label>
            Handler
            <select value={nodeDraft.handler} onChange={(event) => setNodeDraft((draft) => ({ ...draft, handler: event.target.value }))}>
              <option>HTTP Platform</option>
              <option>IISNode</option>
            </select>
          </label>
          <button className="primary-button compact" type="submit">Queue Node Job</button>
        </form>
      </article>

      {!!filteredCatalog.length && viewMode === "cards" && (
        <div className="domain-service-grid">
          {filteredCatalog.map((plugin) => (
            <article className="panel-card domain-service-card" key={plugin.pluginId}>
              <div className="database-card-header">
                <div>
                  <span className="status-pill">{appTypeName(plugin)}</span>
                  <h3>{plugin.name}</h3>
                  <p>{plugin.version || "Latest"} · {plugin.installCount} installs · {plugin.category || "Catalog"}</p>
                </div>
                <MenuIcon name="apps" />
              </div>
              <p className="catalog-description">{plainCatalogText(plugin.description) || "Application package ready for the rebuilt installer workflow."}</p>
              <dl className="card-meta single">
                <div><dt>Database</dt><dd>{plugin.usesDatabase ? "Required" : "Not required"}</dd></div>
                <div><dt>Admin</dt><dd>{plugin.adminPage || "Configured after install"}</dd></div>
                <div><dt>Script</dt><dd>{plugin.scriptVersion || "Default"}</dd></div>
                <div><dt>Rules</dt><dd>{plugin.configFiles} config · {plugin.parameterSets} params · {plugin.permissionRules} permissions</dd></div>
              </dl>
              {previewPluginId === plugin.pluginId && (
                <ol className="plugin-step-list">
                  <li>Select target website folder.</li>
                  {plugin.usesDatabase && <li>Choose database engine and create a database/user pair.</li>}
                  <li>Apply {plugin.configFiles || "the"} config template{plugin.configFiles === 1 ? "" : "s"} and collect installer parameters.</li>
                  <li>Apply {plugin.permissionRules || "required"} file permission rule{plugin.permissionRules === 1 ? "" : "s"}.</li>
                  <li>Create legacy worker-compatible install job and track deploy progress.</li>
                </ol>
              )}
              <div className="database-action-row">
                <button className="primary-button compact" type="button" onClick={() => createPluginInstallTest(plugin)}>Install</button>
                <button className="secondary-button compact" type="button" onClick={() => createPluginRequirementTest(plugin)}>Requirements</button>
                <button className="secondary-button compact" type="button" onClick={() => setPreviewPluginId((currentId) => currentId === plugin.pluginId ? null : plugin.pluginId)}>Preview Steps</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {!!filteredCatalog.length && viewMode === "table" && (
        <div className="table-wrap website-table">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Type</th>
                <th>Version</th>
                <th>Database</th>
                <th>Installs</th>
                <th>Rules</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCatalog.map((plugin) => (
                <tr key={plugin.pluginId}>
                  <td>{plugin.name}</td>
                  <td>{appTypeName(plugin)}</td>
                  <td>{plugin.version || "Latest"}</td>
                  <td>{plugin.usesDatabase ? "Required" : "No"}</td>
                  <td>{plugin.installCount}</td>
                  <td>{plugin.configFiles} config · {plugin.parameterSets} params · {plugin.permissionRules} permissions</td>
                  <td>
                    <div className="website-action-buttons compact-actions">
                      <button className="secondary-button compact" type="button" onClick={() => setPreviewPluginId((currentId) => currentId === plugin.pluginId ? null : plugin.pluginId)}>Preview</button>
                      <button className="secondary-button compact" type="button" onClick={() => createPluginRequirementTest(plugin)}>Check</button>
                      <button className="primary-button compact" type="button" onClick={() => createPluginInstallTest(plugin)}>Install</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoadingApps && !appsError && !filteredCatalog.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No apps</span>
          <h2>No catalog matches</h2>
          <p>Adjust the app search or language filter.</p>
        </div>
      )}

      <ActivityList
        activity={appsDashboard ? { cpLogin: appsDashboard.cpLogin, jobs: deployJobs, totals: { total: deployJobs.length, pending: 0, running: 0, errors: deployJobs.filter((job) => job.statusCode === 3).length } } : null}
        jobs={appJobs}
        isLoading={isLoadingApps || isLoadingActivity}
        error={appsError || activityError}
        emptyTitle="No recent deploy jobs"
        onRetry={() => { loadApps(); reloadActivity(); }}
      />
    </section>
  );
}

function appTypeName(plugin) {
  return String(plugin?.language || plugin?.category || "App").trim() || "App";
}

function plainCatalogText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function AdvanceSection({ cpId }) {
  const { activity, isLoading, error, reload } = useHostingActivity(cpId);
  const [runtimeDashboard, setRuntimeDashboard] = useState(null);
  const [isLoadingRuntime, setIsLoadingRuntime] = useState(true);
  const [runtimeError, setRuntimeError] = useState("");
  const [sandboxMessage, setSandboxMessage] = useState("");
  const [sandboxDraft, setSandboxDraft] = useState({
    from: "/real-gateway/source",
    to: "/real-gateway/destination",
    server: "local-panel",
    note: "Sandbox row created by rebuilt panel_cp."
  });
  const [taskDraft, setTaskDraft] = useState({
    protocol: "https://",
    url: "example.com/health",
    timeout: "20",
    interval: "30",
    taskType: "sharedtask"
  });
  const [teamDraft, setTeamDraft] = useState({
    username: "codex-test-user",
    accessList: "websites,databases,email",
    siteList: "all"
  });
  const [redirectDraft, setRedirectDraft] = useState({
    source: "/old-page",
    target: "https://sample.com/new-page",
    statusCode: "301",
    site: "sample.com",
    ruleName: "codex-test-redirect"
  });
  const [webDeployDraft, setWebDeployDraft] = useState({
    username: "codex-test-webdeploy",
    site: "sample.com",
    action: "Generate Web Deploy"
  });
  const [staticIpDraft, setStaticIpDraft] = useState({
    domain: "sample.com",
    ipAddress: "208.98.35.146",
    action: "Review Binding"
  });
  const runtimeActions = [
    "Application Pool",
    "ASP.NET Version",
    "PHP Settings",
    "Node.js App",
    "Environment Variables",
    "Remote IIS",
    "Redirect Rules",
    "Web Deploy Users",
    "Scheduled Tasks",
    "Team Access",
    "Static IP",
    "Work Queue"
  ];

  const testJobs = (activity?.jobs ?? []).filter((job) => job.type === "panel-test");

  async function loadRuntimeDashboard() {
    setIsLoadingRuntime(true);
    setRuntimeError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/runtime", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setRuntimeError(result?.message ?? "Unable to load runtime inventory.");
        return;
      }

      setRuntimeDashboard(result.dashboard);
    } catch {
      setRuntimeError("Unable to reach runtime inventory service.");
    } finally {
      setIsLoadingRuntime(false);
    }
  }

  useEffect(() => {
    loadRuntimeDashboard();
  }, [cpId]);

  async function submitSandboxJob(event) {
    event.preventDefault();
    setSandboxMessage("This legacy test queue is read-only now. Use the real test forms above, which only allow codex-test-* rows.");
  }

  async function updateSandboxJob(job) {
    setSandboxMessage(`Legacy test job #${job.id} is read-only. Real tests must create codex-test-* rows through the forms above.`);
  }

  async function deleteSandboxJob(job) {
    setSandboxMessage(`Legacy test job #${job.id} was not deleted automatically. Existing rows are protected.`);
  }

  async function queueAdvanceTool(action, details = "") {
    setSandboxMessage("");
    const nodeActionTypes = {
      "Enable IISNode": "nodejs",
      "Enable HTTP Platform": "nodejs",
      "Create Node Sub App": "nodejs",
      "Deploy from Git": "deploy",
      "Deploy from ZIP": "deploy",
      "Node.js App": "nodejs"
    };

    if (nodeActionTypes[action]) {
      const type = nodeActionTypes[action];
      try {
        const result = await createHostingWorkqueue(cpId, {
          type,
          zipFile: type === "deploy" ? `advance-${workerSlug(action)}` : action,
          dstFolder: runtimeDashboard?.cpLogin || "node-site",
          serverId: "",
          data1: details || action,
          siteOwner: runtimeDashboard?.cpLogin || "",
          notifyEmail: "advanced-manager"
        });
        setSandboxMessage(result.message);
        await reload();
        return;
      } catch (error) {
        setSandboxMessage(error.message);
        return;
      }
    }

    try {
      await createPanelTestActivity(cpId, {
        from: `advanced:${action}`,
        to: `/panel-test/advance/${workerSlug(action)}`,
        server: "advanced-manager",
        note: details || `Advanced gateway required for ${action}`
      });
      setSandboxMessage(`${action} needs the legacy advanced gateway before it can run.`);
      await reload();
    } catch (error) {
      setSandboxMessage(error.message);
    }
  }

  function advanceToolTone(action, index) {
    if (["Application Pool", "ASP.NET Version", "PHP Settings", "Node.js App"].includes(action)) return "Runtime";
    if (["Redirect Rules", "Web Deploy Users", "Team Access"].includes(action)) return "Access";
    if (["Static IP", "Scheduled Tasks", "Work Queue"].includes(action)) return "Worker";
    return index < 4 ? "Runtime" : "Worker";
  }

  const workflowGroups = buildAdvanceWorkflowGroups(runtimeDashboard);

  function submitTaskDraft(event) {
    event.preventDefault();
    const timeout = Math.max(20, Math.min(300, Number(taskDraft.timeout) || 20));
    const interval = Math.max(5, Math.min(1440, Number(taskDraft.interval) || 30));
    const url = `${taskDraft.protocol}${taskDraft.url.replace(/^https?:\/\//i, "")}`;
    queueAdvanceTool(
      taskDraft.taskType === "wintask" ? "Add Windows Task" : "Add URL Task",
      `Scheduled task request: ${url}; timeout ${timeout}s; every ${interval} minutes; type ${taskDraft.taskType}`
    );
  }

  async function submitTeamDraft(event) {
    event.preventDefault();
    setSandboxMessage("");
    try {
      const result = await createHostingRealTest(cpId, "team-access", {
        name: teamDraft.username,
        accessList: teamDraft.accessList,
        siteList: teamDraft.siteList
      });
      setSandboxMessage(result.message);
      await loadRuntimeDashboard();
    } catch (error) {
      setSandboxMessage(error.message);
    }
  }

  async function submitRedirectDraft(event) {
    event.preventDefault();
    setSandboxMessage("");
    try {
      const result = await createHostingRealTest(cpId, "redirect", {
        name: redirectDraft.ruleName,
        domain: redirectDraft.site,
        destination: redirectDraft.target,
        statusCode: redirectDraft.statusCode
      });
      setSandboxMessage(result.message);
      await loadRuntimeDashboard();
    } catch (error) {
      setSandboxMessage(error.message);
    }
  }

  async function submitWebDeployDraft(event) {
    event.preventDefault();
    setSandboxMessage("");
    try {
      const result = await createHostingRealTest(cpId, "web-deploy", {
        name: webDeployDraft.username,
        site: webDeployDraft.site,
        action: webDeployDraft.action
      });
      setSandboxMessage(result.message);
      await loadRuntimeDashboard();
    } catch (error) {
      setSandboxMessage(error.message);
    }
  }

  function submitStaticIpDraft(event) {
    event.preventDefault();
    queueAdvanceTool(
      staticIpDraft.action,
      `Static IP/VPS request: domain ${staticIpDraft.domain}; ip ${staticIpDraft.ipAddress}; action ${staticIpDraft.action}`
    );
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">Advanced Tools</span>
          <h2>Advanced Tools</h2>
          <p>Runtime and worker-backed operations for app pools, deployments, permissions, scheduled tasks, and long-running jobs.</p>
        </div>
        <div className="database-total-grid">
          <div><span>Total Jobs</span><strong>{activity?.totals?.total ?? 0}</strong></div>
          <div><span>Pending</span><strong>{activity?.totals?.pending ?? 0}</strong></div>
          <div><span>Running</span><strong>{activity?.totals?.running ?? 0}</strong></div>
          <div><span>Errors</span><strong>{activity?.totals?.errors ?? 0}</strong></div>
        </div>
        <RefreshButton onClick={() => { reload(); loadRuntimeDashboard(); }} />
      </article>

      <article className="panel-card cp-runtime-panel">
        <div className="database-card-header">
          <div>
            <span className="status-pill blue">Read-only inventory</span>
            <h3>Runtime Inventory</h3>
            <p>Legacy runtime tables loaded without changing IIS, DNS, task, or deploy settings.</p>
          </div>
          <MenuIcon name="advance" />
        </div>
        <div className="database-total-grid">
          <div><span>Pools</span><strong>{runtimeDashboard?.totals?.pools ?? 0}</strong></div>
          <div><span>Redirects</span><strong>{runtimeDashboard?.totals?.redirects ?? 0}</strong></div>
          <div><span>Web Deploy</span><strong>{runtimeDashboard?.totals?.siteUsers ?? 0}</strong></div>
          <div><span>Static IPs</span><strong>{runtimeDashboard?.totals?.staticIps ?? 0}</strong></div>
          <div><span>Team Users</span><strong>{runtimeDashboard?.totals?.aliases ?? 0}</strong></div>
        </div>
        {isLoadingRuntime && <LoadingState label="Loading runtime inventory" />}
        {runtimeError && <p className="inline-status">{runtimeError}</p>}
        {!!runtimeDashboard?.warnings?.length && (
          <div className="runtime-warning-list">
            {runtimeDashboard.warnings.map((warning) => <p key={warning}>{warning}</p>)}
          </div>
        )}
        <RuntimeRows title="Application Pools" rows={runtimeDashboard?.pools ?? []} emptyText="No app pool rows found." />
        <RuntimeRows title="Redirect Rules" rows={runtimeDashboard?.redirects ?? []} emptyText="No redirect rules found." />
        <RuntimeRows title="Web Deploy Users" rows={runtimeDashboard?.siteUsers ?? []} emptyText="No Web Deploy users found." />
        <RuntimeRows title="Static IPs" rows={runtimeDashboard?.staticIps ?? []} emptyText="No static IP rows found." />
        <RuntimeRows title="Team Access Users" rows={runtimeDashboard?.aliases ?? []} emptyText="No CP alias users found." />
      </article>

      <div className="advance-tool-grid">
        {runtimeActions.map((action, index) => (
          <article className="panel-card advance-tool-card" key={action}>
            <div>
              <span className={index < 4 ? "status-pill" : "status-pill muted"}>{advanceToolTone(action, index)}</span>
              <h3>{action}</h3>
              <p>{advancedToolDescription(action)}</p>
            </div>
            <button className={action === "Work Queue" ? "primary-button compact" : "secondary-button compact"} type="button" onClick={() => queueAdvanceTool(action)}>
              Requires Gateway
            </button>
          </article>
        ))}
      </div>

      <div className="advance-workflow-grid">
        {workflowGroups.map((group) => (
          <article className="panel-card advance-workflow-card" key={group.title}>
            <div>
              <span className="status-pill blue">{group.badge}</span>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
            </div>
            <dl className="card-meta single">
              {group.meta.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
            <div className="database-action-row">
              {group.actions.map((action, index) => (
                <button
                  className={index === 0 ? "primary-button compact" : "secondary-button compact"}
                  type="button"
                  key={action}
                  onClick={() => queueAdvanceTool(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="advance-form-grid">
        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Scheduled Task Draft</span>
            <h3>HTTP / Windows Task</h3>
            <p>Needs the legacy task gateway before writing to the production task tables.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitTaskDraft}>
            <label>
              Protocol
              <select value={taskDraft.protocol} onChange={(event) => setTaskDraft((draft) => ({ ...draft, protocol: event.target.value }))}>
                <option value="https://">https://</option>
                <option value="http://">http://</option>
              </select>
            </label>
            <label>
              URL
              <input value={taskDraft.url} onChange={(event) => setTaskDraft((draft) => ({ ...draft, url: event.target.value }))} />
            </label>
            <label>
              Timeout
              <input type="number" min="20" max="300" value={taskDraft.timeout} onChange={(event) => setTaskDraft((draft) => ({ ...draft, timeout: event.target.value }))} />
            </label>
            <label>
              Every Minutes
              <input type="number" min="5" max="1440" value={taskDraft.interval} onChange={(event) => setTaskDraft((draft) => ({ ...draft, interval: event.target.value }))} />
            </label>
            <label>
              Type
              <select value={taskDraft.taskType} onChange={(event) => setTaskDraft((draft) => ({ ...draft, taskType: event.target.value }))}>
                <option value="sharedtask">Schedule Task</option>
                <option value="wintask">Dedicated Windows Task</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Review Action</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Team Access Draft</span>
            <h3>CP Alias User</h3>
            <p>Creates a real `codex-test-*` CP alias row in `cp_loginAlias` for testing.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitTeamDraft}>
            <label>
              Username
              <input value={teamDraft.username} onChange={(event) => setTeamDraft((draft) => ({ ...draft, username: event.target.value }))} />
            </label>
            <label>
              Access List
              <input value={teamDraft.accessList} onChange={(event) => setTeamDraft((draft) => ({ ...draft, accessList: event.target.value }))} />
            </label>
            <label>
              Site List
              <input value={teamDraft.siteList} onChange={(event) => setTeamDraft((draft) => ({ ...draft, siteList: event.target.value }))} />
            </label>
            <button className="primary-button compact" type="submit">Create Real Test</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Redirect Draft</span>
            <h3>URL Rewrite Rule</h3>
            <p>Creates a real `codex-test-*` redirect row in `cp_config_redirect` for testing.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitRedirectDraft}>
            <label>
              Site
              <input value={redirectDraft.site} onChange={(event) => setRedirectDraft((draft) => ({ ...draft, site: event.target.value }))} />
            </label>
            <label>
              Rule Name
              <input value={redirectDraft.ruleName} onChange={(event) => setRedirectDraft((draft) => ({ ...draft, ruleName: event.target.value }))} />
            </label>
            <label>
              From
              <input value={redirectDraft.source} onChange={(event) => setRedirectDraft((draft) => ({ ...draft, source: event.target.value }))} />
            </label>
            <label>
              To
              <input value={redirectDraft.target} onChange={(event) => setRedirectDraft((draft) => ({ ...draft, target: event.target.value }))} />
            </label>
            <label>
              Code
              <select value={redirectDraft.statusCode} onChange={(event) => setRedirectDraft((draft) => ({ ...draft, statusCode: event.target.value }))}>
                <option value="301">301 Permanent</option>
                <option value="302">302 Temporary</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Create Real Test</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Web Deploy Draft</span>
            <h3>Deploy Credentials</h3>
            <p>Creates a real `codex-test-*` Web Deploy user row in `cp_config_site_users` for testing.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitWebDeployDraft}>
            <label>
              Username
              <input value={webDeployDraft.username} onChange={(event) => setWebDeployDraft((draft) => ({ ...draft, username: event.target.value }))} />
            </label>
            <label>
              Site
              <input value={webDeployDraft.site} onChange={(event) => setWebDeployDraft((draft) => ({ ...draft, site: event.target.value }))} />
            </label>
            <label>
              Action
              <select value={webDeployDraft.action} onChange={(event) => setWebDeployDraft((draft) => ({ ...draft, action: event.target.value }))}>
                <option value="Generate Web Deploy">Generate Web Deploy</option>
                <option value="Reset Web Deploy Password">Reset Password</option>
                <option value="Remote IIS User">Remote IIS User</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Create Real Test</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Static IP / VPS Draft</span>
            <h3>Domain Binding</h3>
            <p>Needs the provider gateway for static IP, VPS domain binding, snapshots, and backups.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitStaticIpDraft}>
            <label>
              Domain
              <input value={staticIpDraft.domain} onChange={(event) => setStaticIpDraft((draft) => ({ ...draft, domain: event.target.value }))} />
            </label>
            <label>
              IP Address
              <input value={staticIpDraft.ipAddress} onChange={(event) => setStaticIpDraft((draft) => ({ ...draft, ipAddress: event.target.value }))} />
            </label>
            <label>
              Action
              <select value={staticIpDraft.action} onChange={(event) => setStaticIpDraft((draft) => ({ ...draft, action: event.target.value }))}>
                <option value="Review Binding">Review Binding</option>
                <option value="Bind Domain to VPS">Bind Domain to VPS</option>
                <option value="Create Snapshot">Create Snapshot</option>
                <option value="Update Cloud Backup">Update Cloud Backup</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Review Action</button>
          </form>
        </article>
      </div>

      {!!testJobs.length && (
        <article className="panel-card sandbox-card">
          <div>
            <span className="status-pill blue">Legacy Test Queue</span>
            <h3>Read Only</h3>
            <p>Old test queue rows are shown for reference only. New testing uses real `codex-test-*` rows above.</p>
          </div>
          {sandboxMessage && <p className="sandbox-message">{sandboxMessage}</p>}
          <div className="sandbox-job-list">
            {testJobs.map((job) => (
              <div className="sandbox-job-row" key={job.id}>
                <span>#{job.id}</span>
                <strong>{job.from}</strong>
                <small>{job.data || job.to}</small>
              </div>
            ))}
          </div>
        </article>
      )}

      <ActivityList activity={activity} jobs={activity?.jobs ?? []} isLoading={isLoading} error={error} emptyTitle="No workqueue activity" onRetry={reload} />
    </section>
  );
}

function RuntimeRows({ title, rows, emptyText }) {
  return (
    <section className="runtime-row-section">
      <h4>{title}</h4>
      {!rows.length ? (
        <p className="runtime-empty">{emptyText}</p>
      ) : (
        <div className="runtime-row-grid">
          {rows.slice(0, 6).map((row, index) => (
            <article className="runtime-row-card" key={`${title}-${row.title}-${index}`}>
              <div>
                <span className="status-pill muted">{row.status}</span>
                <strong>{row.title || "Item"}</strong>
                <p>{row.subtitle || "No details"}</p>
              </div>
              <dl>
                {Object.entries(row.details ?? {}).slice(0, 4).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value || "-"}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function useHostingActivity(cpId) {
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadActivity() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/activity", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.message ?? "Unable to load activity.");
        return;
      }

      setActivity(result.dashboard);
    } catch {
      setError("Unable to reach activity service.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadActivity();
  }, [cpId]);

  return { activity, isLoading, error, reload: loadActivity };
}

function ActivityList({ jobs, isLoading, error, emptyTitle, onRetry }) {
  if (isLoading) return <LoadingState label="Loading workqueue activity" />;
  if (error) {
    return (
      <div className="panel-card dashboard-error-panel">
        <p>{error}</p>
        <IconActionButton label="Retry" onClick={onRetry} />
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="panel-card cp-placeholder">
        <span className="status-pill muted">No jobs</span>
        <h2>{emptyTitle}</h2>
        <p>No matching workqueue rows were found for this hosting plan.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap website-table activity-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Server</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.type || "Job"}</td>
              <td>{job.from || "-"}</td>
              <td>{job.to || "-"}</td>
              <td>{job.server || "-"}</td>
              <td>{formatDateTime(job.enterDate)}</td>
              <td>
                <span className={job.statusCode === 3 ? "status-pill danger" : job.statusCode === 2 ? "status-pill" : "status-pill blue"}>
                  {job.status}
                </span>
                {job.errorMessage && <p className="job-error-message">{job.errorMessage}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function advancedToolDescription(action) {
  const descriptions = {
    "Application Pool": "Recycle, isolate, or create application pools through the legacy worker path.",
    "ASP.NET Version": "Review .NET runtime selection and prepare version-change jobs.",
    "PHP Settings": "Manage PHP runtime and handler settings per website.",
    "Node.js App": "Prepare IISNode configuration and deployment jobs.",
    "Environment Variables": "View app pool environment variable changes.",
    "Remote IIS": "Manage IIS Manager credential workflows.",
    "Redirect Rules": "Prepare URL rewrite redirects from the cp_config_redirect flow.",
    "Web Deploy Users": "Create real test Web Deploy users and review reset workflows.",
    "Scheduled Tasks": "Prepare URL and Windows scheduled task worker integration.",
    "Team Access": "Create real test CP alias users and review permission workflows.",
    "Static IP": "Review dedicated IP binding and VPS-domain routing workflows.",
    "Work Queue": "Read pending, running, successful, and failed worker jobs."
  };

  return descriptions[action] ?? "Advanced hosting control panel tool.";
}

function buildAdvanceWorkflowGroups(runtimeDashboard) {
  const totals = runtimeDashboard?.totals ?? { pools: 0, redirects: 0, siteUsers: 0, staticIps: 0, aliases: 0 };

  return [
    {
      badge: "Tasks",
      title: "Scheduled Tasks",
      description: "URL pings and Windows Task Scheduler jobs with interval, timeout, and worker validation.",
      meta: [
        ["Interval Rule", "5-1440 minutes"],
        ["Timeout Rule", "20-300 seconds"],
        ["Worker Name", "{hosting-plan}-{taskID}"]
      ],
      actions: ["Add URL Task", "Add Windows Task", "Task Logs", "Delete Task"]
    },
    {
      badge: "Node",
      title: "Node.js Deploy",
      description: "IISNode, HTTP Platform Handler, sub-application, Git deploy, and ZIP deploy worker jobs.",
      meta: [
        ["Queue Types", "nodejs, deploy"],
        ["Current Redirects", totals.redirects],
        ["Deploy Source", "Git or uploaded ZIP"]
      ],
      actions: ["Enable IISNode", "Enable HTTP Platform", "Create Node Sub App", "Deploy from Git", "Deploy from ZIP"]
    },
    {
      badge: "Access",
      title: "Redirects and Web Deploy",
      description: "URL rewrite rules, Web Deploy users, IIS Manager credentials, and generated deployment config.",
      meta: [
        ["Redirect Rules", totals.redirects],
        ["Web Deploy Users", totals.siteUsers],
        ["Remote IIS", "Credential workflow"]
      ],
      actions: ["Add Redirect", "Generate Web Deploy", "Reset Web Deploy Password", "Remote IIS User"]
    },
    {
      badge: "Users",
      title: "Team Access",
      description: "CP alias users and permission review before real cp_loginAlias writes are enabled.",
      meta: [
        ["Legacy Table", "cp_loginAlias"],
        ["Alias Users", totals.aliases],
        ["Permission Mode", "Review first"],
        ["Static IPs", totals.staticIps]
      ],
      actions: ["Invite CP User", "Review Permissions", "Disable CP User", "Audit Access"]
    }
  ];
}

function simplifySitePath(path, cpLogin) {
  const text = String(path ?? "").replace(/\\/g, "/");
  if (!text) return "/";
  const marker = cpLogin ? `/${cpLogin}/www` : "/www";
  const markerIndex = text.toLowerCase().indexOf(marker.toLowerCase());
  if (markerIndex >= 0) {
    const trimmed = text.slice(markerIndex + marker.length).replace(/^\/+/, "");
    return trimmed ? `/${trimmed}` : "/www";
  }
  return text;
}

function legacyServerToken(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.split(".")[0].trim();
}

function legacySitePath(site, cpLogin) {
  const rawPath = String(site?.sitePath ?? "").trim();
  if (rawPath) return rawPath;
  const simplified = simplifySitePath(site?.siteName || "", cpLogin);
  return simplified === "/" ? "\\www" : simplified.replace(/\//g, "\\");
}

function workerSlug(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "job";
}

function buildSecurityRows(mode, securityDashboard) {
  if (!securityDashboard || !["cdn", "ssl"].includes(mode)) return [];

  if (mode === "cdn") {
    return [
      {
        title: "Cloudflare Account",
        emptyText: "No Cloudflare account row found for this customer.",
        rows: (securityDashboard.cloudflareAccounts ?? []).map((account) => ({
          title: account.email || `Customer #${account.customerId}`,
          subtitle: account.createDate ? formatDateTime(account.createDate) : "Cloudflare tenant",
          status: account.status || "Cloudflare",
          details: {
            "Customer ID": String(account.customerId || ""),
            Email: account.email || "-",
            Status: account.status || "-",
            Created: account.createDate ? formatDateTime(account.createDate) : "-"
          }
        }))
      },
      {
        title: "CDN Domain Flags",
        emptyText: "No mapped CDN domain rows found.",
        rows: (securityDashboard.cdnDomains ?? []).filter((domain) => domain.cdn).slice(0, 12).map((domain) => ({
          title: domain.domain,
          subtitle: domain.siteName || "Mapped domain",
          status: domain.cdn ? "CDN on" : "CDN off",
          details: {
            "Domain UID": String(domain.domainUid || ""),
            Site: domain.siteName || "-",
            Default: domain.isDefault ? "Yes" : "No",
            CDN: domain.cdn ? "Enabled" : "Disabled"
          }
        }))
      }
    ];
  }

  return [
    {
      title: "SSL Orders",
      emptyText: "No paid SSL order rows found.",
      rows: (securityDashboard.sslOrders ?? []).map((order) => ({
        title: order.commonName || `SSL #${order.id}`,
        subtitle: order.email || "No approver email",
        status: order.status || "SSL",
        details: {
          "Order ID": String(order.id || ""),
          Years: order.buyYears || "Free/unknown",
          Certificate: order.certificateId || "-",
          Created: order.createDate ? formatDateTime(order.createDate) : "-"
        }
      }))
    },
    {
      title: "Free SSL",
      emptyText: "No Let's SSL rows found for this hosting plan.",
      rows: (securityDashboard.freeSslRows ?? []).map((row) => ({
        title: row.domain || `Free SSL #${row.id}`,
        subtitle: row.lastUpdate ? `Updated ${formatDateTime(row.lastUpdate)}` : "Let's SSL",
        status: row.status || "Free SSL",
        details: {
          "Row ID": String(row.id || ""),
          Domain: row.domain || "-",
          Created: row.createDate ? formatDateTime(row.createDate) : "-",
          Updated: row.lastUpdate ? formatDateTime(row.lastUpdate) : "-"
        }
      }))
    }
  ];
}

const sslValidityNotice = [
  "Beginning March 15, 2026, any paid certificate issued on or after that date must comply with the new 200-day maximum validity period.",
  "Shorter lifespans minimize the window of exposure for compromised keys and keep domain validation data fresh.",
  "You do not need to purchase a new certificate twice as often. Existing SSL certificates will be reissued for free and reinstalled automatically every 200 days."
];

const sslKbArticles = [
  ["How to force HTTPS?", "http://www.smarterasp.net/support/kb/a345/redirect-http-to-https.aspx"],
  ["How to order new SSL?", "http://www.smarterasp.net/support/kb/a2118/how-to-order-ssl-certificate.aspx"],
  ["How to import SSL?", "http://www.smarterasp.net/support/kb/a2034/how-to-import-my-ssl-certificate-to-your-web-server.aspx"],
  ["How to export SSL?", "http://www.smarterasp.net/support/kb/a2036/how-to-export-your-ssl-certificate.aspx"],
  ["How to install SSL to sub sites?", "http://www.smarterasp.net/support/kb/a2035/how-to-install-your-ssl-m-or-ssl-w-to-your-other-domain-names-or-subdomains.aspx"]
];

function splitSslList(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSslApproverEmails(order) {
  return [order.email, ...splitSslList(order.dnsApproverEmails)].filter(Boolean);
}

function sslStatusHint(status) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "pending") return "normally within 15 minutes";
  if (normalized === "invalid") return "validation log available";
  return "";
}

function sslOrderActions(order, runAction) {
  const status = String(order.status ?? "").toLowerCase();
  const actions = [];
  if (status === "ordered") {
    actions.push("Edit Validation Method", "Resend Approver Email");
  }
  actions.push("Re-import SSL");
  if (status === "installed" || status === "completed") {
    actions.push("Re-install SSL Cert", "Export SSL Cert");
  }
  if (String(order.commonName ?? "").includes("*.")) {
    actions.push("Install to all subdomains");
  }
  if (!order.email) {
    actions.push("Delete SSL");
  }
  if (status === "invalid") {
    actions.unshift("View Free SSL Log");
  }

  return actions.map((action) => (
    <IconActionButton
      key={`${order.id}-${action}`}
      label={action}
      onClick={() => runAction(action, order)}
    />
  ));
}

function SslLegacyContent({ securityDashboard, actionableDomains, runDomainServiceAction, setSslDraft }) {
  const sslOrders = securityDashboard?.sslOrders ?? [];
  const freeSslRows = securityDashboard?.freeSslRows ?? [];
  const firstDomain = actionableDomains[0] || null;

  function runSslOrderAction(action, order) {
    runDomainServiceAction("ssl", action, firstDomain, {
      domain: order.commonName || firstDomain?.label || "",
      sslOrderId: order.id,
      certificateId: order.certificateId,
      certificateType: order.buyYears ? "Paid SSL" : "Free SSL",
      approverEmail: order.email || "",
      action
    });
  }

  function chooseSslWorkflow(action) {
    setSslDraft((draft) => ({
      ...draft,
      action,
      domain: draft.domain || firstDomain?.label || "",
      approverEmail: draft.approverEmail || (firstDomain ? `admin@${firstDomain.label}` : "")
    }));
    runDomainServiceAction("ssl", action, firstDomain, {
      domain: firstDomain?.label || "",
      action
    });
  }

  return (
    <>
      <article className="panel-card ssl-legacy-notice">
        <div>
          <span className="status-pill warning">SSL List</span>
          <h3>SSL Validity Notice</h3>
          {sslValidityNotice.map((line) => <p key={line}>{line}</p>)}
        </div>
      </article>

      <div className="database-toolbar panel-card ssl-legacy-actions">
        <div className="database-actions">
          <button className="secondary-button compact" type="button" onClick={() => chooseSslWorkflow("CSR Request")}>
            <MenuIcon name="invoice" /> CSR Request
          </button>
          <button className="primary-button compact" type="button" onClick={() => chooseSslWorkflow("Request Free SSL")}>
            <MenuIcon name="ssl" /> Request Free SSL
          </button>
          <a className="primary-button compact success-link-button" href="/account/addon_purchase_special?cat=SSL">
            <MenuIcon name="order" /> Buy SSL
          </a>
          <button className="secondary-button compact" type="button" onClick={() => chooseSslWorkflow("Import SSL")}>
            <MenuIcon name="upload" /> Import SSL
          </button>
        </div>
      </div>

      <section className="runtime-row-section ssl-legacy-table-section">
        <h4>SSL Certificates</h4>
        {!sslOrders.length ? (
          <p className="runtime-empty">No items</p>
        ) : (
          <div className="table-wrap website-table">
            <table>
              <thead>
                <tr>
                  <th>Common Name</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Approver Email</th>
                  <th className="domain-actions-header"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {sslOrders.map((order) => {
                  const otherDomains = splitSslList(order.dnsNames);
                  const approverEmails = formatSslApproverEmails(order);
                  const hint = sslStatusHint(order.status);
                  return (
                    <tr key={`ssl-order-${order.id}`}>
                      <td>
                        <div className="ssl-common-name-cell">
                          <strong>{order.commonName || `SSL #${order.id}`}</strong>
                          {otherDomains.map((domain) => <span key={`${order.id}-${domain}`}>{domain}</span>)}
                        </div>
                      </td>
                      <td>{order.createDate ? formatDateTime(order.createDate) : "-"}</td>
                      <td>
                        <span className={String(order.status).toLowerCase() === "invalid" ? "status-pill warning" : "status-pill muted"}>{order.status || "SSL"}</span>
                        {hint && <small className="ssl-status-hint">{hint}</small>}
                      </td>
                      <td>
                        {approverEmails.length ? (
                          <div className="ssl-email-list">
                            {approverEmails.map((email) => <span key={`${order.id}-${email}`}>{email}</span>)}
                          </div>
                        ) : "-"}
                        {String(order.status).toLowerCase() === "ordered" && (
                          <button className="text-link-button" type="button" onClick={() => runSslOrderAction("Resend Approver Email", order)}>
                            Resend Approver Email
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="website-action-buttons compact-actions">
                          {sslOrderActions(order, runSslOrderAction)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="runtime-row-section">
        <h4>Free SSL</h4>
        {!freeSslRows.length ? (
          <p className="runtime-empty">No Let's SSL rows found for this hosting plan.</p>
        ) : (
          <div className="runtime-row-grid">
            {freeSslRows.slice(0, 12).map((row) => (
              <article className="runtime-row-card" key={`free-ssl-${row.id}`}>
                <div>
                  <span className="status-pill muted">{row.status || "Free SSL"}</span>
                  <strong>{row.domain || `Free SSL #${row.id}`}</strong>
                  <p>{row.lastUpdate ? `Updated ${formatDateTime(row.lastUpdate)}` : "Let's SSL"}</p>
                </div>
                <dl>
                  <div><dt>Row ID</dt><dd>{row.id}</dd></div>
                  <div><dt>Created</dt><dd>{row.createDate ? formatDateTime(row.createDate) : "-"}</dd></div>
                  <div><dt>Updated</dt><dd>{row.lastUpdate ? formatDateTime(row.lastUpdate) : "-"}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <article className="panel-card ssl-kb-card">
        <div>
          <span className="status-pill blue">Tips</span>
          <h3>Order Status and FAQs</h3>
        </div>
        <div className="kb-link-list">
          {sslKbArticles.map(([label, href]) => (
            <a href={href} target="_blank" rel="noreferrer" key={href}>
              <span>[KB Article]</span> {label}
            </a>
          ))}
        </div>
      </article>
    </>
  );
}

function DomainServicesSection({ mode, cpId }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [domainError, setDomainError] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [domainMessage, setDomainMessage] = useState("");
  const [serviceResult, setServiceResult] = useState(null);
  const [dnsDraft, setDnsDraft] = useState({
    host: "@",
    type: "A",
    value: "208.98.35.146",
    ttl: "300",
    priority: "10",
    weight: "1",
    port: "443"
  });
  const [sslDraft, setSslDraft] = useState({
    domain: "sample.com",
    certificateType: "Free SSL",
    approverEmail: "admin@sample.com",
    action: "Request Free SSL"
  });
  const [cdnDraft, setCdnDraft] = useState({
    domain: "sample.com",
    mode: "Enable CDN",
    sslMode: "Full"
  });

  async function loadDomainServices() {
    setIsLoadingDomains(true);
    setDomainError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/sites", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainError(result?.message ?? "Unable to load domains.");
        return;
      }

      setSitesDashboard(result.dashboard);
    } catch {
      setDomainError("Unable to reach domain inventory service.");
    } finally {
      setIsLoadingDomains(false);
    }
  }

  useEffect(() => {
    loadDomainServices();
  }, [cpId]);

  async function loadSecurityServices() {
    if (!["cdn", "ssl"].includes(mode)) return;

    setIsLoadingSecurity(true);
    setSecurityError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/security", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setSecurityError(result?.message ?? "Unable to load security inventory.");
        return;
      }

      setSecurityDashboard(result.dashboard);
    } catch {
      setSecurityError("Unable to reach security inventory service.");
    } finally {
      setIsLoadingSecurity(false);
    }
  }

  useEffect(() => {
    loadSecurityServices();
  }, [cpId, mode]);

  const domains = (sitesDashboard?.sites ?? []).flatMap((site) =>
    (site.mappedDomains ?? []).map((domain) => ({
      ...domain,
      siteName: site.siteName || site.rootName || `site-${site.siteUid}`,
      siteStatus: site.status,
      runtime: site.version ? `.NET ${site.version}` : site.phpVersion ? `PHP ${site.phpVersion}` : "Website"
    }))
  );
  const actionableDomains = domains.filter((domain) => !isTemporaryHostingDomain(domain.label));
  const modeCopy = {
    dns: {
      title: "DNS",
      label: "Live DNS",
      description: "DNS record add/edit/delete flow from cp/dns/editdns.asp. Publishing waits for the exact DNS gateway functions.",
      actions: ["Add Record"],
      statOne: "Domains",
      statTwo: "Default Domains",
      statThree: "Sites"
    },
    cdn: {
      title: "CDN",
      label: "Live CDN",
      description: "Cloudflare tenant and per-domain CDN controls from cloudflare_tenant.asp.",
      actions: ["Enable CDN", "Disable CDN", "Purge Cache", "Resend Invite"],
      statOne: "Domains",
      statTwo: "CDN Enabled",
      statThree: "Sites"
    },
    ssl: {
      title: "SSL",
      label: "Live SSL",
      description: "SSL certificate inventory, free SSL requests, imports, install actions, and SSL order guidance from the legacy SSL manager.",
      actions: ["CSR Request", "Request Free SSL", "Buy SSL", "Import SSL"],
      statOne: "Domains",
      statTwo: "SSL Ready",
      statThree: "Sites"
    }
  }[mode];
  const enabledCount = mode === "cdn"
    ? securityDashboard?.totals?.cdnEnabled ?? domains.filter((domain) => domain.cdn).length
    : mode === "ssl"
      ? securityDashboard?.totals?.sslOrders ?? domains.filter((domain) => domain.ssl).length
      : domains.filter((domain) => domain.isDefault).length;
  const uniqueSites = new Set(domains.map((domain) => domain.siteName)).size;
  const securityRows = buildSecurityRows(mode, securityDashboard);
  const domainJobs = (activity?.jobs ?? []).filter((job) =>
    job.server === `${mode}-manager` ||
    String(job.from ?? "").toLowerCase().startsWith(`${mode}:`)
  );
  const [viewMode, setViewMode] = useSectionViewMode(`cp-${mode}`, domains.length);

  const selectedDnsDomain = actionableDomains.find((domain) => domain.label === dnsDraft.domain) || actionableDomains[0] || null;
  const selectedSslDomain = actionableDomains.find((domain) => domain.label === sslDraft.domain) || actionableDomains[0] || null;
  const selectedCdnDomain = actionableDomains.find((domain) => domain.label === cdnDraft.domain) || actionableDomains[0] || null;

  useEffect(() => {
    if (!actionableDomains.length) return;
    const first = actionableDomains[0].label;
    setDnsDraft((draft) => ({ ...draft, domain: draft.domain || first }));
    setSslDraft((draft) => ({
      ...draft,
      domain: draft.domain && draft.domain !== "sample.com" ? draft.domain : first,
      approverEmail: draft.approverEmail && draft.approverEmail !== "admin@sample.com" ? draft.approverEmail : `admin@${first}`
    }));
    setCdnDraft((draft) => ({ ...draft, domain: draft.domain && draft.domain !== "sample.com" ? draft.domain : first }));
  }, [actionableDomains.map((domain) => domain.label).join("|")]);

  async function runDomainServiceAction(area, action, domain, fields = {}) {
    setDomainMessage("");
    setServiceResult(null);
    if (!domain) {
      setDomainMessage(`${area.toUpperCase()} actions need a mapped customer domain. Temporary hosting URLs are skipped.`);
      return;
    }
    if (isTemporaryHostingDomain(domain.label || fields.domain)) {
      setDomainMessage(`${area.toUpperCase()} actions are not tested on temporary hosting URLs. Choose a mapped customer domain.`);
      return;
    }
    try {
      const endpoint = area === "dns"
        ? "/api/hosting/dns/preview"
        : area === "cdn"
          ? "/api/hosting/cdn/action"
          : "/api/hosting/ssl/action";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpId,
          domain: domain?.label || fields.domain || "",
          action,
          fields
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainMessage(result?.message ?? `${action} could not run.`);
        setServiceResult(result?.details ? { area, action, details: result.details } : null);
        return;
      }

      setDomainMessage(result.message);
      setServiceResult({ area, action, details: result.details });
      await reloadActivity();
    } catch (error) {
      setDomainMessage(error.message);
    }
  }

  function submitDnsDraft(event) {
    event.preventDefault();
    const ttl = Math.max(300, Math.min(86400, Number(dnsDraft.ttl) || 300));
    runDomainServiceAction("dns", `${dnsDraft.type} Record`, selectedDnsDomain, { ...dnsDraft, ttl: String(ttl) });
  }

  function submitSslDraft(event) {
    event.preventDefault();
    runDomainServiceAction("ssl", sslDraft.action, selectedSslDomain, sslDraft);
  }

  function submitCdnDraft(event) {
    event.preventDefault();
    runDomainServiceAction("cdn", cdnDraft.mode, selectedCdnDomain, cdnDraft);
  }

  function refreshDomainServiceSection() {
    loadDomainServices();
    loadSecurityServices();
    reloadActivity();
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">{modeCopy.label}</span>
          <h2>{modeCopy.title} Manager</h2>
          <p>{modeCopy.description}</p>
        </div>
        <div className="database-total-grid">
          <div><span>{modeCopy.statOne}</span><strong>{domains.length}</strong></div>
          <div><span>{modeCopy.statTwo}</span><strong>{enabledCount}</strong></div>
          <div><span>{modeCopy.statThree}</span><strong>{uniqueSites}</strong></div>
        </div>
        <RefreshButton onClick={refreshDomainServiceSection} />
      </article>

      {mode !== "ssl" && <div className="database-toolbar panel-card">
        <div className="database-actions">
          {mode === "dns" && <span className="inline-status">Add A, AAAA, CNAME, MX, SPF/TXT, and SRV records just like the old DNS editor.</span>}
          {mode === "cdn" && <span className="inline-status">Use the per-domain table actions below. Tenant enable/resend invite follows the old Cloudflare tenant page.</span>}
        </div>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label={`${modeCopy.title} view mode`} />
      </div>}

      {mode === "dns" && (
        <article className="panel-card dns-record-draft-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">DNS Draft</span>
              <h3>Record Editor</h3>
              <p>Needs the DNS provider gateway before publishing record changes.</p>
            </div>
            <MenuIcon name="dns" />
          </div>
          <form className="advance-inline-form" onSubmit={submitDnsDraft}>
            <label>
              Domain
              <select value={dnsDraft.domain || selectedDnsDomain?.label || ""} onChange={(event) => setDnsDraft((draft) => ({ ...draft, domain: event.target.value }))}>
                {actionableDomains.map((domain) => <option key={domain.domainUid} value={domain.label}>{domain.label}</option>)}
              </select>
            </label>
            <label>
              Host
              <input value={dnsDraft.host} onChange={(event) => setDnsDraft((draft) => ({ ...draft, host: event.target.value }))} />
            </label>
            <label>
              Type
              <select value={dnsDraft.type} onChange={(event) => setDnsDraft((draft) => ({ ...draft, type: event.target.value }))}>
                <option value="A">A</option>
                <option value="AAAA">AAAA</option>
                <option value="CNAME">CNAME</option>
                <option value="MX">MX</option>
                <option value="TXT">SPF/TXT</option>
                <option value="SRV">SRV</option>
              </select>
            </label>
            <label>
              Value
              <input value={dnsDraft.value} onChange={(event) => setDnsDraft((draft) => ({ ...draft, value: event.target.value }))} />
            </label>
            <label>
              TTL
              <input type="number" min="300" max="86400" value={dnsDraft.ttl} onChange={(event) => setDnsDraft((draft) => ({ ...draft, ttl: event.target.value }))} />
            </label>
            {["MX", "SRV"].includes(dnsDraft.type) && (
              <label>
                Priority
                <input type="number" min="0" max="100" value={dnsDraft.priority} onChange={(event) => setDnsDraft((draft) => ({ ...draft, priority: event.target.value }))} />
              </label>
            )}
            {dnsDraft.type === "SRV" && (
              <>
                <label>
                  Weight
                  <input type="number" min="0" max="100" value={dnsDraft.weight} onChange={(event) => setDnsDraft((draft) => ({ ...draft, weight: event.target.value }))} />
                </label>
                <label>
                  Port
                  <input type="number" min="1" max="65535" value={dnsDraft.port} onChange={(event) => setDnsDraft((draft) => ({ ...draft, port: event.target.value }))} />
                </label>
              </>
            )}
            <button className="primary-button compact" type="submit">Preview DNS</button>
          </form>
          <div className="dns-example-panel">
            <span className="status-pill muted">Example</span>
            <p>{dnsRecordExample(dnsDraft.type)}</p>
          </div>
        </article>
      )}

      {mode === "ssl" && (
        <article className="panel-card dns-record-draft-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">SSL Workflow</span>
              <h3>Certificate Workflow</h3>
              <p>Use the SSL List below for certificate rows and row actions. Write actions remain guarded until each exact legacy SSL gateway path is enabled.</p>
            </div>
            <MenuIcon name="ssl" />
          </div>
          <form className="advance-inline-form" onSubmit={submitSslDraft}>
            <label>
              Domain
              <select value={sslDraft.domain || selectedSslDomain?.label || ""} onChange={(event) => setSslDraft((draft) => ({ ...draft, domain: event.target.value, approverEmail: `admin@${event.target.value}` }))}>
                {actionableDomains.map((domain) => <option key={domain.domainUid} value={domain.label}>{domain.label}</option>)}
              </select>
            </label>
            <label>
              Certificate
              <select value={sslDraft.certificateType} onChange={(event) => setSslDraft((draft) => ({ ...draft, certificateType: event.target.value }))}>
                <option>Free SSL</option>
                <option>Comodo SSL</option>
                <option>Wildcard SSL</option>
                <option>Imported Certificate</option>
              </select>
            </label>
            <label>
              Approver Email
              <input type="email" value={sslDraft.approverEmail} onChange={(event) => setSslDraft((draft) => ({ ...draft, approverEmail: event.target.value }))} />
            </label>
            <label>
              Action
              <select value={sslDraft.action} onChange={(event) => setSslDraft((draft) => ({ ...draft, action: event.target.value }))}>
                <option>Request Free SSL</option>
                <option>Import SSL</option>
                <option>Install Certificate</option>
                <option>Reinstall Certificate</option>
                <option>Resend Approver Email</option>
                <option>Renew SSL</option>
                <option>Delete SSL</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Run SSL Action</button>
          </form>
        </article>
      )}

      {mode === "ssl" && (
        <SslLegacyContent
          securityDashboard={securityDashboard}
          actionableDomains={actionableDomains}
          runDomainServiceAction={runDomainServiceAction}
          setSslDraft={setSslDraft}
        />
      )}

      {mode === "cdn" && (
        <article className="panel-card dns-record-draft-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">CDN Draft</span>
              <h3>Cloudflare / CDN Workflow</h3>
              <p>Needs the Cloudflare gateway for tenant, zone, purge, SSL mode, and redirect actions.</p>
            </div>
            <MenuIcon name="cdn" />
          </div>
          <form className="advance-inline-form" onSubmit={submitCdnDraft}>
            <label>
              Domain
              <select value={cdnDraft.domain || selectedCdnDomain?.label || ""} onChange={(event) => setCdnDraft((draft) => ({ ...draft, domain: event.target.value }))}>
                {actionableDomains.map((domain) => <option key={domain.domainUid} value={domain.label}>{domain.label}</option>)}
              </select>
            </label>
            <label>
              Mode
              <select value={cdnDraft.mode} onChange={(event) => setCdnDraft((draft) => ({ ...draft, mode: event.target.value }))}>
                <option>Enable CDN</option>
                <option>Disable CDN</option>
                <option>Purge Cache</option>
                <option>Resend Invite</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Run CDN Action</button>
          </form>
        </article>
      )}
      {mode === "dns" && (
        <article className="panel-card knowledge-card">
          <span className="status-pill muted">KB Article</span>
          <a href="http://www.smarterasp.net/support/kb/a1544/how-to-set-mx-records-for-google-mail.aspx" target="_blank" rel="noreferrer">How to set MX records for Google Mail</a>
        </article>
      )}
      {mode === "cdn" && (
        <article className="panel-card knowledge-card">
          <span className="status-pill muted">KB Article</span>
          <a href="http://www.smarterasp.net/support/KB/a1688/how-do-i-test-if-my-domain-name-is-now-on-cloudflare.aspx" target="_blank" rel="noreferrer">How do I test if my domain name is now on Cloudflare?</a>
          <a href="http://www.smarterasp.net/support/kb/a300/301-redirect-www-redirect-domain-redirect.aspx" target="_blank" rel="noreferrer">How do I redirect all requests from non-www to www domain?</a>
          <a href="http://www.smarterasp.net/support/kb/a1691/how-do-i-add-ssl-to-my-cdn.aspx" target="_blank" rel="noreferrer">How do I activate free SSL from CloudFlare?</a>
          <a href="http://www.smarterasp.net/support/kb/a345/redirect-http-to-https.aspx" target="_blank" rel="noreferrer">How do I force using https?</a>
        </article>
      )}

      {isLoadingDomains && <LoadingState label="Loading mapped domains" />}
      {isLoadingSecurity && <LoadingState label={`Loading ${mode.toUpperCase()} legacy inventory`} />}
      {domainMessage && <p className="sandbox-message">{domainMessage}</p>}
      {serviceResult?.details?.records?.length > 0 && (
        <RuntimeRows
          title={`${serviceResult.area.toUpperCase()} Preview`}
          rows={serviceResult.details.records.map((record) => ({
            title: `${record.type} ${record.name}`,
            subtitle: record.value,
            status: record.priority == null ? `TTL ${record.ttl}` : `Priority ${record.priority} · TTL ${record.ttl}`,
            details: {
              Type: record.type,
              Name: record.name,
              Value: record.value,
              Priority: record.priority == null ? "-" : String(record.priority),
              TTL: String(record.ttl)
            }
          }))}
          emptyText="No preview records."
        />
      )}
      {serviceResult?.details && !serviceResult.details.records && (
        <RuntimeRows
          title={`${serviceResult.area.toUpperCase()} Action Detail`}
          rows={[{
            title: serviceResult.action,
            subtitle: serviceResult.details.domain || serviceResult.details.legacySource || "Legacy action",
            status: "Checked",
            details: Object.fromEntries(Object.entries(serviceResult.details).map(([key, value]) => [key, typeof value === "object" ? JSON.stringify(value) : String(value)]))
          }]}
          emptyText="No action detail."
        />
      )}
      {securityError && <p className="inline-status">{securityError}</p>}
      {domainError && (
        <div className="panel-card dashboard-error-panel">
          <p>{domainError}</p>
          <IconActionButton label="Retry" onClick={loadDomainServices} />
        </div>
      )}
      {!isLoadingDomains && !domainError && !domains.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No domains</span>
          <h2>No mapped domains found</h2>
          <p>This hosting account does not have visible mapped domain rows.</p>
        </div>
      )}
      {!!securityDashboard?.warnings?.length && (
        <div className="runtime-warning-list">
          {securityDashboard.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </div>
      )}
      {mode !== "ssl" && securityRows.map((section) => (
        <RuntimeRows key={section.title} title={section.title} rows={section.rows} emptyText={section.emptyText} />
      ))}

      {!!domains.length && viewMode === "cards" && (
        <div className="domain-service-grid">
          {domains.map((domain) => (
            <article className="panel-card domain-service-card" key={`${mode}-${domain.domainUid}-${domain.label}`}>
              <div className="database-card-header">
                <div>
                  <span className={domain.ssl ? "status-pill" : "status-pill muted"}>
                    {isTemporaryHostingDomain(domain.label) ? "Temp URL" : mode === "cdn" ? (domain.cdn ? "CDN on" : "CDN off") : mode === "ssl" ? (domain.ssl ? "SSL ready" : "SSL pending") : (domain.isDefault ? "Default" : "Mapped")}
                  </span>
                  <h3>{domain.label}</h3>
                  <p>{domain.siteName} · {domain.runtime}</p>
                </div>
                <MenuIcon name={mode} />
              </div>
              <dl className="card-meta single">
                <div><dt>URL</dt><dd>{domain.url}</dd></div>
                <div><dt>Website Status</dt><dd>{domain.siteStatus}</dd></div>
                <div><dt>CDN</dt><dd>{domain.cdn ? "Enabled" : "Not enabled"}</dd></div>
                <div><dt>SSL</dt><dd>{domain.ssl ? "Enabled" : "Pending"}</dd></div>
              </dl>
              <div className="database-action-row">
                {domainServiceRowActions(mode, domain).map((action) => (
                  <IconActionButton label={action} key={action} disabled={isTemporaryHostingDomain(domain.label)} onClick={() => runDomainServiceAction(mode, action, domain)} />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      {!!domains.length && viewMode === "table" && (
        <div className="table-wrap website-table">
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Website</th>
                <th>Runtime</th>
                <th>Status</th>
                <th>CDN</th>
                <th>SSL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr key={`${mode}-${domain.domainUid}-${domain.label}`}>
                  <td>{domain.label}</td>
                  <td>{domain.siteName}</td>
                  <td>{domain.runtime}</td>
                  <td>{domain.siteStatus}</td>
                  <td>{domain.cdn ? "Enabled" : "Not enabled"}</td>
                  <td>{domain.ssl ? "Enabled" : "Pending"}</td>
                  <td>
                    <div className="website-action-buttons compact-actions">
                      {domainServiceRowActions(mode, domain).map((action) => (
                        <IconActionButton label={action} key={action} disabled={isTemporaryHostingDomain(domain.label)} onClick={() => runDomainServiceAction(mode, action, domain)} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ActivityList jobs={domainJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle={`No recent ${mode.toUpperCase()} jobs`} onRetry={reloadActivity} />
    </section>
  );
}

function domainServiceRowActions(mode, domain) {
  if (mode === "dns") {
    return ["Add Record"];
  }

  if (mode === "cdn") {
    return domain?.cdn ? ["Disable CDN", "Purge Cache"] : ["Enable CDN"];
  }

  return ["CSR Request", "Request Free SSL", "Import SSL"];
}

function dnsRecordExample(type) {
  switch (type) {
    case "AAAA":
      return "Name: blog, Address: 2001:0db8:85a3:0000:0000:8a2e:0370:7334";
    case "CNAME":
      return "Name: blog, Address: www.google.com";
    case "MX":
      return "Address: igw5002.site4now.net, Priority: 10";
    case "TXT":
      return "SPF: v=spf1 a mx include:_spf.site4now.net -all; DMARC: v=DMARC1; p=none";
    case "SRV":
      return "Name: _sip._tls, Address: sipdir.online.lync.com, Priority: 10, Weight: 1, Port: 443";
    case "A":
    default:
      return "Name: blog, Address: 123.123.123.123";
  }
}

function LoadingIcon({ label = "Loading" }) {
  return (
    <span className="loading-icon" role="status" aria-label={label} title={label}>
      <span aria-hidden="true" />
    </span>
  );
}

function LoadingState({ label = "Loading" }) {
  return (
    <p className="empty-state loading-state">
      <LoadingIcon label={label} />
    </p>
  );
}

function IconActionButton({ label, onClick, disabled = false, className = "secondary-button compact icon-only-button", type = "button" }) {
  return (
    <button
      aria-label={label}
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type={type}
    >
      <MenuIcon name={iconForAction(label)} />
    </button>
  );
}

function MenuIcon({ name }) {
  const icons = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 4 4" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <rect x="5" y="5" width="11" height="11" rx="2" />
      </>
    ),
    save: (
      <>
        <path d="M5 4h12l2 2v14H5Z" />
        <path d="M8 4v6h8V4M8 20v-6h8v6" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4 10-10" />
      </>
    ),
    edit: (
      <>
        <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
        <path d="m13.5 7.5 3 3" />
      </>
    ),
    open: (
      <>
        <path d="M8 7H5.5A1.5 1.5 0 0 0 4 8.5v10A1.5 1.5 0 0 0 5.5 20h10a1.5 1.5 0 0 0 1.5-1.5V16" />
        <path d="M13 4h7v7M20 4l-9 9" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 16v3h14v-3" />
      </>
    ),
    download: (
      <>
        <path d="M12 4v12" />
        <path d="m8 12 4 4 4-4" />
        <path d="M5 16v3h14v-3" />
      </>
    ),
    zip: (
      <>
        <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
        <path d="M14 3.5V8h4M10 7h2M12 9h2M10 11h2M12 13h2M10 15h2" />
      </>
    ),
    unzip: (
      <>
        <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
        <path d="M14 3.5V8h4M10 7h2M12 9h2M10 11h2M9 16h6M12 13v6" />
      </>
    ),
    permissions: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7.5a4 4 0 0 1 7.5-1.9M12 14v2" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
      </>
    ),
    unlock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M15.5 10V7.5a3.5 3.5 0 0 0-6.6-1.6" />
      </>
    ),
    virus: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2.1 2.1M15.9 15.9 18 18M18 6l-2.1 2.1M8.1 15.9 6 18" />
      </>
    ),
    "new-folder": (
      <>
        <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
        <path d="M12 10.5v6M9 13.5h6" />
      </>
    ),
    "folder-search": (
      <>
        <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V12" />
        <path d="M4 10h10" />
        <circle cx="15" cy="16" r="3.2" />
        <path d="m17.4 18.4 2.1 2.1" />
      </>
    ),
    "website-plus": (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="M3.5 9h17M15 12v5M12.5 14.5h5" />
      </>
    ),
    backup: (
      <>
        <path d="M20 13a6 6 0 0 0-11.5-2.4A4.5 4.5 0 0 0 5 19h13" />
        <path d="M12 13v5M9.5 15.5 12 13l2.5 2.5" />
      </>
    ),
    invoice: (
      <>
        <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-2-1.4V6a2 2 0 0 1 2-2Z" />
        <path d="M8 9h8M8 13h8M8 17h4" />
      </>
    ),
    retry: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M20 12a8 8 0 1 1-2.35-5.65L20 8.7" />
      </>
    ),
    renew: (
      <>
        <path d="M20 6v5h-5" />
        <path d="M4 18v-5h5" />
        <path d="M18.1 9A7 7 0 0 0 6.3 6.4L4 8.8" />
        <path d="M5.9 15A7 7 0 0 0 17.7 17.6L20 15.2" />
      </>
    ),
    reset: (
      <>
        <path d="M4 6v5h5" />
        <path d="M4 11a8 8 0 1 0 2.35-5.65L4 7.7" />
      </>
    ),
    "power-off": (
      <>
        <path d="M12 4v5" />
        <path d="M8 6.5a7 7 0 1 0 8 0" />
        <path d="M4 4l16 16" />
      </>
    ),
    server: (
      <>
        <rect x="3.5" y="4" width="17" height="6" rx="1.5" />
        <rect x="3.5" y="14" width="17" height="6" rx="1.5" />
        <path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
      </>
    ),
    "chevron-down": (
      <>
        <path d="m7 10 5 5 5-5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 6v5h-5" />
        <path d="M4 18v-5h5" />
        <path d="M18.1 9A7 7 0 0 0 6.3 6.4L4 8.8" />
        <path d="M5.9 15A7 7 0 0 0 17.7 17.6L20 15.2" />
      </>
    ),
    x: (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    ),
    back: (
      <>
        <path d="M10.5 6 4.5 12l6 6" />
        <path d="M5 12h14" />
      </>
    ),
    dashboard: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
    cards: (
      <>
        <rect x="4" y="5" width="7" height="6" rx="1.5" />
        <rect x="13" y="5" width="7" height="6" rx="1.5" />
        <rect x="4" y="13" width="7" height="6" rx="1.5" />
        <rect x="13" y="13" width="7" height="6" rx="1.5" />
      </>
    ),
    table: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 10h16M4 14h16M10 5v14" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.2 2.35 3.3 5.18 3.3 8.5s-1.1 6.15-3.3 8.5M12 3.5C9.8 5.85 8.7 8.68 8.7 12s1.1 6.15 3.3 8.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3.5 19 6v5.5c0 4.3-2.65 7.25-7 9-4.35-1.75-7-4.7-7-9V6l7-2.5Z" />
        <path d="m8.8 12 2.1 2.1 4.5-4.8" />
      </>
    ),
    plus: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    share: (
      <>
        <circle cx="7" cy="12" r="2.5" />
        <circle cx="17" cy="6.5" r="2.5" />
        <circle cx="17" cy="17.5" r="2.5" />
        <path d="m9.2 10.8 5.6-3.1M9.2 13.2l5.6 3.1" />
      </>
    ),
    card: (
      <>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path d="M3.5 9.5h17M7 14.5h3.5" />
      </>
    ),
    support: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.7 9.5a2.4 2.4 0 0 1 4.55 1.1c0 1.7-2.25 2-2.25 3.55M12 17h.01" />
      </>
    ),
    chat: (
      <>
        <path d="M4 6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8v6.4a2.8 2.8 0 0 1-2.8 2.8H11l-4.8 3v-3A2.8 2.8 0 0 1 4 13.2Z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    book: (
      <>
        <path d="M5 5.8A2.8 2.8 0 0 1 7.8 3H20v16H7.8A2.8 2.8 0 0 0 5 21Z" />
        <path d="M5 5.8V21M9 7h7M9 10h5" />
      </>
    ),
    ticket: (
      <>
        <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.25a2 2 0 0 0 0 3.5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.25a2 2 0 0 0 0-3.5Z" />
        <path d="M9 9h6M9 15h6M12 6v12" />
      </>
    ),
    logs: (
      <>
        <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-2-1.4V6a2 2 0 0 1 2-2Z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    "add-domain": (
      <>
        <circle cx="11" cy="12" r="7.5" />
        <path d="M3.5 12h15M11 4.5c2 2.1 3 4.6 3 7.5s-1 5.4-3 7.5M19 7v6M16 10h6" />
      </>
    ),
    website: (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="M3.5 9h17M7 7h.01M10 7h.01M7 13h10M7 16h6" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5.5" rx="7" ry="3" />
        <path d="M5 5.5v13c0 1.65 3.13 3 7 3s7-1.35 7-3v-13M5 12c0 1.65 3.13 3 7 3s7-1.35 7-3" />
      </>
    ),
    mail: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    folder: (
      <>
        <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
      </>
    ),
    apps: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    ftp: (
      <>
        <path d="M12 4v16M6 8h12M8 14h8" />
        <circle cx="12" cy="4" r="1.5" />
        <circle cx="6" cy="8" r="1.5" />
        <circle cx="18" cy="8" r="1.5" />
      </>
    ),
    git: (
      <>
        <path d="M12 4.2c-4.2 0-7.6 3.4-7.6 7.6 0 3.35 2.18 6.2 5.2 7.2.38.07.52-.16.52-.37v-1.4c-2.12.46-2.56-.9-2.56-.9-.34-.88-.85-1.12-.85-1.12-.7-.48.05-.47.05-.47.77.05 1.17.79 1.17.79.69 1.18 1.8.84 2.24.64.07-.5.27-.84.49-1.03-1.7-.19-3.48-.85-3.48-3.8 0-.84.3-1.53.79-2.07-.08-.19-.34-.95.08-1.98 0 0 .65-.21 2.12.79a7.2 7.2 0 0 1 3.86 0c1.47-1 2.11-.79 2.11-.79.43 1.03.17 1.79.09 1.98.49.54.79 1.23.79 2.07 0 2.96-1.79 3.61-3.49 3.79.28.24.52.71.52 1.44v2.13c0 .21.14.45.53.37 3.01-1 5.19-3.85 5.19-7.2 0-4.2-3.4-7.6-7.6-7.6Z" />
      </>
    ),
    deploy: (
      <>
        <path d="M12 4v10" />
        <path d="m8.5 8 3.5-4 3.5 4" />
        <rect x="5" y="14" width="14" height="6" rx="2" />
        <path d="M8 17h.01M12 17h4" />
      </>
    ),
    cdn: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M7.5 12h9M12 7.5v9M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8" />
      </>
    ),
    dns: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8 10h8M8 14h5M12 3.5v17" />
      </>
    ),
    ssl: (
      <>
        <rect x="5.5" y="10" width="13" height="10" rx="2" />
        <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10M12 14v2" />
      </>
    ),
    advance: (
      <>
        <path d="M12 3.5v17M4 8h16M4 16h16" />
        <circle cx="8" cy="8" r="1.8" />
        <circle cx="16" cy="16" r="1.8" />
      </>
    ),
    more: (
      <>
        <circle cx="5.5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="18.5" cy="12" r="1.6" />
      </>
    ),
    "site-name": (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8 10h8M8 14h5" />
      </>
    ),
    aspnet: (
      <>
        <rect x="4" y="4" width="7" height="7" />
        <rect x="13" y="4" width="7" height="7" />
        <rect x="4" y="13" width="7" height="7" />
        <rect x="13" y="13" width="7" height="7" />
      </>
    ),
    core: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v16M4 12h16" />
      </>
    ),
    node: (
      <>
        <path d="M12 3.5 19 7.5v9L12 20.5 5 16.5v-9Z" />
        <path d="M9 14V9l6 6V10" />
      </>
    ),
    php: (
      <>
        <ellipse cx="12" cy="12" rx="9" ry="5.5" />
        <path d="M7 14V9h2.8a1.6 1.6 0 0 1 0 3.2H7M12 14l1-5M14 14l1-5M16 9h2.5a1.5 1.5 0 0 1 0 3H16" />
      </>
    ),
    checklist: (
      <>
        <path d="m5 7 1.6 1.6L10 5.5M5 12l1.6 1.6L10 10.5M5 17l1.6 1.6L10 15.5" />
        <path d="M12.5 8h6M12.5 13h6M12.5 18h6" />
      </>
    ),
    warning: (
      <>
        <path d="M12 4 21 20H3Z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
    power: (
      <>
        <path d="M12 4v8" />
        <path d="M8 6.5a7 7 0 1 0 8 0" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </>
    ),
    stats: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8 16V9M12 16V6M16 16v-4" />
      </>
    ),
    outgoing: (
      <>
        <path d="M5 12h12" />
        <path d="m13 7 5 5-5 5" />
        <path d="M5 5v14" />
      </>
    ),
    "virtual-dir": (
      <>
        <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
        <path d="M12 10v6M9 13h6" />
      </>
    ),
    "force-https": (
      <>
        <path d="M20 4 4 11l7 2 2 7Z" />
        <path d="m11 13 4-4" />
      </>
    ),
    "default-doc": (
      <>
        <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
        <path d="M14 3.5V8h4M9 12h6M9 16h6" />
      </>
    ),
    mime: (
      <>
        <circle cx="12" cy="12" r="2" />
        <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" />
      </>
    ),
    scriptmap: (
      <>
        <path d="M12 4v5M12 15v5M5 12h14" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </>
    ),
    "remote-iis": (
      <>
        <rect x="5" y="5" width="14" height="10" rx="1.5" />
        <path d="M8 19h8M12 15v4M8 9h8M9 12h6" />
      </>
    ),
    tasks: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </>
    ),
    settings: (
      <>
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21a2 2 0 0 1-4 0v-.08a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.05.05a2 2 0 0 1-2.83-2.83l.05-.05A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.66-1.1H2.9a2 2 0 0 1 0-4h.08A1.8 1.8 0 0 0 4.6 8.8a1.8 1.8 0 0 0-.36-1.98l-.05-.05a2 2 0 0 1 2.83-2.83l.05.05a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.1-1.66V2.6a2 2 0 0 1 4 0v.08a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.05-.05a2 2 0 0 1 2.83 2.83l-.05.05a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.66 1.1h.08a2 2 0 0 1 0 4h-.08A1.8 1.8 0 0 0 19.4 15Z" />
      </>
    ),
    rocket: (
      <>
        <path d="M13.5 4.2c2.1-.7 4.2-.7 6.3 0 .7 2.1.7 4.2 0 6.3L14 16.3l-6.3-6.3 5.8-5.8Z" />
        <path d="M8.8 9.2 5.5 8.8 3.8 10.5l4.1 1.3M14.8 15.2l.4 3.3-1.7 1.7-1.3-4.1" />
        <circle cx="16.3" cy="7.7" r="1.3" />
        <path d="M6.8 17.2 4 20" />
      </>
    ),
    "arrow-up": (
      <>
        <path d="M12 19V5" />
        <path d="m6.5 10.5 5.5-5.5 5.5 5.5" />
      </>
    ),
    order: (
      <>
        <path d="M6 6h15l-1.6 8.2a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6L5.8 3.8H3" />
        <path d="M10 10h6M13 7v6" />
        <circle cx="9.5" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
      </>
    )
  };

  return (
    <svg className="menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function RefreshButton({ onClick, label = "Refresh" }) {
  return (
    <button
      className="secondary-button compact icon-only-button refresh-icon-button"
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <MenuIcon name="refresh" />
    </button>
  );
}

function DashboardSection({ activeSection, currentUser, dashboard, dashboardError, isDashboardLoading, onChangeSection, onManageHosting, onReloadDashboard }) {
  if (activeSection === "domain") return <DomainSection />;
  if (activeSection === "vpn") return <VpnSection />;
  if (activeSection === "addon") return <AddonSection />;
  if (activeSection === "affiliate") return <AffiliateSection />;
  if (activeSection === "billing") return <BillingSection currentUser={currentUser} onChangeSection={onChangeSection} />;
  if (activeSection === "settings") return <SettingsSection />;
  if (activeSection === "new-order") return <NewOrderSection onChangeSection={onChangeSection} />;
  if (activeSection === "helpdesk") return <HelpdeskSection />;
  return (
    <HostingSection
      dashboard={dashboard}
      dashboardError={dashboardError}
      isDashboardLoading={isDashboardLoading}
      onManageHosting={onManageHosting}
      onShowAffiliate={() => onChangeSection("affiliate")}
      onOpenNewOrder={() => onChangeSection("new-order")}
      onReloadDashboard={onReloadDashboard}
    />
  );
}

function NewOrderSection({ onChangeSection }) {
  const orderOptions = [
    { type: "hosting", title: "Buy Hosting Account", description: "ASP.NET hosting plans", icon: "server", catalog: true },
    { type: "managed-hosting", title: "Buy Managed Hosting", badge: "NEW", description: "Fully managed ASP.NET hosting", icon: "server", catalog: true },
    { type: "windows-vps", title: "Buy Windows VPS", description: "Windows virtual private servers", icon: "server", catalog: true },
    { type: "linux-vps", title: "Buy Linux VPS", badge: "NEW", description: "Linux virtual private servers", icon: "server", catalog: true },
    { type: "cloud", title: "Buy Cloud Server", description: "Scalable cloud servers", icon: "server", catalog: true },
    { type: "dedicated", title: "Buy Dedicated Server", description: "Dedicated hardware servers", icon: "server", catalog: true },
    { type: "reseller", title: "Buy Reseller Account", description: "Resell hosting to your clients", icon: "share", catalog: true },
    { type: "domain-purchase", title: "Purchase New Domain", icon: "globe", section: "domain", description: "Search and register a new domain name." },
    { type: "domain-transfer", title: "Transfer an Existing Domain", icon: "globe", section: "domain", description: "Move an existing domain to this account." }
  ];
  const [activeType, setActiveType] = useState("hosting");
  const [catalog, setCatalog] = useState(null);
  const [selectedPrices, setSelectedPrices] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [busyProductId, setBusyProductId] = useState(null);

  const activeOption = orderOptions.find((option) => option.type === activeType) ?? orderOptions[0];

  useEffect(() => {
    let ignore = false;
    const option = orderOptions.find((item) => item.type === activeType);
    setCatalog(null);
    setMessage("");

    if (!option?.catalog) {
      return () => {
        ignore = true;
      };
    }

    async function loadCatalog() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/account/new-purchase/catalog?type=${encodeURIComponent(activeType)}`);
        const result = await response.json().catch(() => null);
        if (ignore) return;

        if (!response.ok || !result?.success) {
          setMessage(result?.message ?? "Unable to load this catalog.");
          return;
        }

        setCatalog(result.catalog);
      } catch {
        if (!ignore) setMessage("Unable to reach the new order catalog.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadCatalog();
    return () => {
      ignore = true;
    };
  }, [activeType]);

  function selectOption(option) {
    setActiveType(option.type);
    if (option.section) {
      onChangeSection(option.section);
    }
  }

  function selectedPriceFor(product) {
    const selectedPriceId = selectedPrices[product.productId];
    return product.prices?.find((price) => price.priceId === selectedPriceId) ?? product.prices?.[0] ?? null;
  }

  async function createNewOrder(product) {
    const selectedPrice = selectedPriceFor(product);
    if (!selectedPrice) {
      setMessage(`${product.name} has no available billing terms.`);
      return;
    }

    setBusyProductId(product.productId);
    setMessage("");

    try {
      const response = await fetch("/api/account/new-purchase/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeType,
          productId: product.productId,
          priceId: selectedPrice.priceId
        })
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setMessage(result?.message ?? "Unable to create checkout.");
        return;
      }

      if (goToCheckoutOrder(result.purchase?.order)) return;
      if (result.purchase?.orderGuid) {
        window.location.href = `/checkout?guid=${encodeURIComponent(result.purchase.orderGuid)}`;
        return;
      }

      setMessage("Purchase is ready for checkout.");
    } catch {
      setMessage("Unable to reach checkout service.");
    } finally {
      setBusyProductId(null);
    }
  }

  return (
    <section className="new-order-section">
      <article className="panel-card new-order-hero">
        <span className="status-pill order-pill">Quick order</span>
        <h2>Start a New Order</h2>
        <p>Choose a product category, review the live catalog, select the billing term, and continue to checkout.</p>
      </article>

      <div className="new-order-workspace">
        <nav className="new-order-list" aria-label="New order options">
          {orderOptions.map((option) => (
            <button
              className={`new-order-card ${activeType === option.type ? "active" : ""}`}
              key={option.title}
              type="button"
              onClick={() => selectOption(option)}
            >
              <span className="new-order-icon"><MenuIcon name={option.icon} /></span>
              <span className="new-order-card-copy">
                <span>
                  {option.title}
                  {option.badge && <em>{option.badge}</em>}
                </span>
                <small>{option.description}</small>
              </span>
            </button>
          ))}
        </nav>

        <article className="panel-card new-order-detail">
          <div className="section-heading">
            <div>
              <span className="eyebrow">New Purchase</span>
              <h2>{activeOption.title}</h2>
              <p>{catalog?.description ?? activeOption.description ?? "Modern account panel order flow."}</p>
            </div>
          </div>

          {activeOption.section === "domain" && (
            <div className="new-order-empty">
              <p>Domain purchase is already rebuilt with live OpenSRS availability search and checkout.</p>
              <button className="primary-button compact" type="button" onClick={() => onChangeSection("domain")}>Search Domains</button>
            </div>
          )}

          {activeOption.catalog && (
            <>
              {isLoading && <LoadingState label="Loading live catalog" />}
              {message && <p className="inline-status">{message}</p>}
              {!isLoading && !message && catalog?.products?.length === 0 && (
                <p className="inline-status">No active products were found for this legacy catalog.</p>
              )}
              <div className="new-order-products">
                {(catalog?.products ?? []).map((product) => {
                  const selectedPrice = selectedPriceFor(product);
                  return (
                    <article className="new-order-product" key={product.productId}>
                      <div>
                        <span className="status-pill muted">Product #{product.productId}</span>
                        <h3>{product.name}</h3>
                        <p>{product.description || product.productType}</p>
                      </div>
                      <div className="new-order-product-actions">
                        <select
                          aria-label={`${product.name} billing term`}
                          value={selectedPrice?.priceId ?? ""}
                          onChange={(event) => setSelectedPrices((current) => ({
                            ...current,
                            [product.productId]: Number(event.target.value)
                          }))}
                        >
                          {(product.prices ?? []).map((price) => (
                            <option key={price.priceId} value={price.priceId}>
                              {formatPaymentTerm(price.paymentTerm)} - {formatMoney(price.amount, price.currency)}
                            </option>
                          ))}
                        </select>
                        <button
                          className="primary-button compact"
                          type="button"
                          disabled={!selectedPrice || busyProductId === product.productId}
                          onClick={() => createNewOrder(product)}
                        >
                          {busyProductId === product.productId ? <LoadingIcon label="Creating purchase" /> : "Start Purchase"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

            </>
          )}
        </article>
      </div>
    </section>
  );
}

function HostingSection({ dashboard, dashboardError, isDashboardLoading, onManageHosting, onReloadDashboard, onShowAffiliate, onOpenNewOrder }) {
  const accounts = dashboard?.hostingAccounts?.length ? dashboard.hostingAccounts : [];
  const notices = dashboard?.renewalNotices?.length ? dashboard.renewalNotices : [];
  const urgentLogs = dashboard?.urgentLogs ?? [];
  const [renewalBusyId, setRenewalBusyId] = useState(null);
  const [renewalPreview, setRenewalPreview] = useState(null);
  const [renewalMessage, setRenewalMessage] = useState("");
  const [urgentBusyId, setUrgentBusyId] = useState(null);
  const [urgentMessage, setUrgentMessage] = useState("");
  const [upgradeCatalog, setUpgradeCatalog] = useState(null);
  const [upgradeTargetId, setUpgradeTargetId] = useState("");
  const [upgradePreview, setUpgradePreview] = useState(null);
  const [upgradeOrder, setUpgradeOrder] = useState(null);
  const [upgradeBusy, setUpgradeBusy] = useState(false);
  const [upgradeCalculating, setUpgradeCalculating] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [viewMode, setViewMode] = useSectionViewMode("account-hosting-plans", accounts.length);
  const planDomains = (account) => (account.domains ?? []).filter((domain) => !String(domain).toLowerCase().includes("tempurl"));
  const planDomainList = (account) => {
    const domains = planDomains(account);
    return domains.length ? domains.join(", ") : "No Primary domain";
  };
  const planCardDomainList = (account) => {
    const domains = planDomains(account).slice(0, 3);
    return domains.length ? domains.join(", ") : "No Primary domain";
  };
  const planFirstDomain = (account) => planDomains(account)[0] ?? "No Primary domain";
  const planDomainCount = (account) => planDomains(account).length;

  async function loadHostingRenewalPreview(notice) {
    setRenewalBusyId(notice.clientProductId);
    setRenewalMessage("");
    setRenewalPreview(null);

    try {
      const response = await fetch(`/api/account/renewals/${notice.clientProductId}/renew`, { method: "POST" });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setRenewalMessage(result?.message ?? "Unable to prepare renewal preview.");
        return;
      }

      setRenewalPreview(result.renewal);
      setRenewalMessage(result.message);
    } catch {
      setRenewalMessage("Unable to reach renewal service.");
    } finally {
      setRenewalBusyId(null);
    }
  }

  async function createHostingRenewalCheckout(renewal) {
    const response = await fetch(`/api/account/renewals/${renewal.clientProductId}/checkout`, { method: "POST" });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.message ?? "Unable to create renewal checkout.");
    }

    return result.order;
  }

  async function hideUrgentLog(logId) {
    setUrgentBusyId(logId);
    setUrgentMessage("");

    try {
      const response = await fetch(`/api/account/urgent-logs/${logId}/hide`, { method: "POST" });
      const result = await response.json().catch(() => null);
      setUrgentMessage(result?.message ?? "Unable to hide urgent notice.");
      if (response.ok && result?.success) {
        onReloadDashboard();
      }
    } catch {
      setUrgentMessage("Unable to reach urgent notice service.");
    } finally {
      setUrgentBusyId(null);
    }
  }

  async function openHostingUpgrade(account) {
    setUpgradeBusy(true);
    setUpgradeMessage("");
    setUpgradePreview(null);
    setUpgradeOrder(null);
    setUpgradeCalculating(false);
    setUpgradeTargetId("");

    try {
      const response = await fetch(`/api/account/hosting-upgrade/${account.cpId}`);
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setUpgradeCatalog(null);
        setUpgradeMessage(result?.message ?? "Unable to load upgrade options.");
        return;
      }

      setUpgradeCatalog(result.catalog);
      setUpgradeTargetId("");
      setUpgradeMessage(result.catalog?.targets?.length ? "Please choose a plan." : "No upgrade targets were found for this hosting plan.");
    } catch {
      setUpgradeCatalog(null);
      setUpgradeMessage("Unable to reach hosting upgrade service.");
    } finally {
      setUpgradeBusy(false);
    }
  }

  async function calculateHostingUpgrade(targetProductId = upgradeTargetId) {
    if (!upgradeCatalog?.current?.cpId || !targetProductId) return;
    setUpgradeCalculating(true);
    setUpgradePreview(null);
    setUpgradeOrder(null);
    setUpgradeMessage("");

    try {
      const response = await fetch("/api/account/hosting-upgrade/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpId: upgradeCatalog.current.cpId,
          targetProductId: Number(targetProductId)
        })
      });
      const result = await response.json().catch(() => null);
      setUpgradePreview(result?.preview ?? null);
      setUpgradeMessage(result?.message ?? "Unable to calculate upgrade price.");
    } catch {
      setUpgradeMessage("Unable to reach hosting upgrade service.");
    } finally {
      setUpgradeCalculating(false);
    }
  }

  async function createHostingUpgradeCheckout() {
    if (!upgradeCatalog?.current?.cpId || !upgradeTargetId) return;
    setUpgradeBusy(true);
    setUpgradeMessage("");

    try {
      const response = await fetch("/api/account/hosting-upgrade/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpId: upgradeCatalog.current.cpId,
          targetProductId: Number(upgradeTargetId)
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setUpgradeMessage(result?.message ?? "Unable to create upgrade checkout.");
        return;
      }

      setUpgradeOrder(result.order);
      setUpgradeMessage("Upgrade checkout order created.");
      goToCheckoutOrder(result.order);
    } catch {
      setUpgradeMessage("Unable to reach hosting upgrade checkout.");
    } finally {
      setUpgradeBusy(false);
    }
  }

  async function applyHostingDowngrade() {
    if (!upgradeCatalog?.current?.cpId || !upgradeTargetId) return;
    setUpgradeBusy(true);
    setUpgradeMessage("");

    try {
      const response = await fetch("/api/account/hosting-upgrade/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpId: upgradeCatalog.current.cpId,
          targetProductId: Number(upgradeTargetId)
        })
      });
      const result = await response.json().catch(() => null);
      setUpgradeMessage(result?.message ?? "Unable to apply downgrade.");
      if (response.ok && result?.success) {
        setUpgradeCatalog(null);
        setUpgradePreview(null);
        setUpgradeOrder(null);
        onReloadDashboard();
      }
    } catch {
      setUpgradeMessage("Unable to reach hosting downgrade service.");
    } finally {
      setUpgradeBusy(false);
    }
  }

  return (
    <section className="hosting-stack">
      {dashboardError && (
        <article className="panel-card dashboard-error-panel">
          <p>{dashboardError}</p>
          <IconActionButton label="Retry" onClick={onReloadDashboard} />
        </article>
      )}

      {(isDashboardLoading || urgentLogs.length > 0 || urgentMessage) && (
        <div className="panel-card urgent-panel">
          <div className="renewal-panel-header">
            <h2>Urgent Notices</h2>
            <span>{isDashboardLoading ? <LoadingIcon label="Loading urgent notices" /> : `${urgentLogs.length} items`}</span>
          </div>
          <div className="urgent-list">
            {!isDashboardLoading && urgentLogs.map((log) => (
              <article className="urgent-item" key={log.id}>
                <div>
                  <span>{formatDateTime(log.createdAt)} · {log.customerLogin || "Account"}</span>
                  <p>{log.message}</p>
                </div>
                <button
                  className="secondary-button compact"
                  type="button"
                  disabled={urgentBusyId !== null}
                  onClick={() => hideUrgentLog(log.id)}
                >
                  {urgentBusyId === log.id ? <LoadingIcon label="Hiding urgent notice" /> : <MenuIcon name="x" />}
                </button>
              </article>
            ))}
          </div>
          {urgentMessage && <p className="renewal-action-message">{urgentMessage}</p>}
        </div>
      )}

      {(upgradeBusy || upgradeCatalog || upgradeMessage) && (
        <article className="panel-card hosting-upgrade-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Hosting Upgrade</span>
              <h2>{upgradeCatalog?.current?.cpLogin ? `Upgrade ${upgradeCatalog.current.cpLogin}` : "Upgrade Hosting Plan"}</h2>
              <p>{upgradeCatalog?.legacyTrace ?? "Loading upgrade options from the old account-panel flow."}</p>
            </div>
            <button className="secondary-button compact" type="button" onClick={() => {
              setUpgradeCatalog(null);
              setUpgradePreview(null);
              setUpgradeOrder(null);
              setUpgradeCalculating(false);
              setUpgradeMessage("");
            }}>
              <MenuIcon name="x" />
            </button>
          </div>

          {upgradeBusy && !upgradeCatalog && <LoadingState label="Loading upgrade options" />}

          {upgradeCatalog && (
            <div className="hosting-upgrade-grid">
              <div className="upgrade-summary-box">
                <span className="status-pill muted">Current Plan</span>
                <h3>{upgradeCatalog.current.productName || upgradeCatalog.current.webHostType}</h3>
                <dl className="card-meta">
                  <div><dt>CP Login</dt><dd>{upgradeCatalog.current.cpLogin}</dd></div>
                  <div><dt>Due Date</dt><dd>{formatDate(upgradeCatalog.current.dueDate)}</dd></div>
                  <div><dt>Billing Term</dt><dd>{formatPaymentTerm(upgradeCatalog.current.paymentTerm)}</dd></div>
                  <div><dt>Server</dt><dd>{upgradeCatalog.current.serverId}</dd></div>
                </dl>
              </div>

              <div className="upgrade-summary-box">
                <label className="form-label" htmlFor="hosting-upgrade-target">Upgrade To</label>
                <div className="upgrade-select-row">
                  <select
                    id="hosting-upgrade-target"
                    value={upgradeTargetId}
                    disabled={upgradeCalculating}
                    onChange={(event) => {
                      const nextTargetId = event.target.value;
                      setUpgradeTargetId(nextTargetId);
                      setUpgradePreview(null);
                      setUpgradeOrder(null);
                      if (nextTargetId) {
                        calculateHostingUpgrade(nextTargetId);
                      } else {
                        setUpgradeCalculating(false);
                        setUpgradeMessage("Please choose a plan.");
                      }
                    }}
                  >
                    <option value="">Please choose a plan</option>
                    {(upgradeCatalog.targets ?? []).map((target) => (
                      <option key={target.productId} value={target.productId}>
                        {target.description || target.name}
                      </option>
                    ))}
                  </select>
                </div>
                {upgradeCalculating && (
                  <p className="inline-help-text loading-help-text">
                    <span>Calculating upgrade price...</span>
                    <LoadingIcon label="Calculating upgrade price" />
                  </p>
                )}
              </div>
            </div>
          )}

          {upgradeMessage && !upgradeCalculating && <p className="renewal-action-message">{upgradeMessage}</p>}

          {upgradePreview && !upgradeCalculating && (
            <div className="checkout-preview-card">
              {upgradePreview.isDowngrade ? (
                <p className="upgrade-downgrade-tip">Downgrade is non refundable</p>
              ) : (
                <dl className="card-meta">
                  <div><dt>Current Price</dt><dd>{formatMoney(upgradePreview.currentPrice, "USD")}</dd></div>
                  <div><dt>Target Price</dt><dd>{formatMoney(upgradePreview.targetPrice, "USD")}</dd></div>
                  <div><dt>Days Left</dt><dd>{upgradePreview.daysLeft}</dd></div>
                  <div><dt>Total Upgrade</dt><dd>{formatMoney(upgradePreview.totalAmount, "USD")}</dd></div>
                </dl>
              )}
              <div className="upgrade-action-row">
                <button
                  className="primary-button compact hosting-upgrade-now-button"
                  type="button"
                  disabled={!upgradePreview?.canCheckout || upgradeBusy}
                  onClick={upgradePreview.isDowngrade ? applyHostingDowngrade : createHostingUpgradeCheckout}
                >
                  {upgradeBusy
                    ? <LoadingIcon label={upgradePreview.isDowngrade ? "Applying downgrade" : "Creating checkout"} />
                    : upgradePreview.isDowngrade ? "Downgrade Now" : "Upgrade Now"}
                </button>
              </div>
            </div>
          )}

          {upgradeOrder && (
            <aside className="checkout-ready-row">
              <span>{upgradeOrder.guid}</span>
              <a className="primary-button compact as-link" href={upgradeOrder.checkoutUrl}>Open Checkout</a>
            </aside>
          )}
        </article>
      )}

      {(isDashboardLoading || notices.length > 0 || renewalMessage || renewalPreview) && (
        <div className="panel-card renewal-panel">
          <div className="renewal-panel-header">
            <h2>Renewal Notice</h2>
            <span>{isDashboardLoading ? <LoadingIcon label="Loading renewal notices" /> : `${notices.length} items`}</span>
          </div>
          <div className="renewal-list">
            {notices.map((notice) => (
              <article className="renewal-item" key={notice.name}>
                <div>
                  <h3>{notice.name}</h3>
                  <p>Renewal {formatDate(notice.renewalDate)}</p>
                </div>
                <div className="renewal-days">
                  <strong>{notice.daysLeft}</strong>
                  <span>days left</span>
                </div>
                <div className="renewal-item-actions">
                  <span className="renewal-status">{notice.status}</span>
                  <button
                    className="secondary-button compact"
                    type="button"
                    disabled={renewalBusyId !== null}
                    onClick={() => loadHostingRenewalPreview(notice)}
                  >
                    {renewalBusyId === notice.clientProductId ? <LoadingIcon label="Checking renewal" /> : <MenuIcon name="order" />}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {renewalMessage && <p className="renewal-action-message">{renewalMessage}</p>}
          {renewalPreview && <RenewalCheckoutPreview renewal={renewalPreview} onClose={() => setRenewalPreview(null)} onCheckout={createHostingRenewalCheckout} />}
        </div>
      )}

      <div className="hosting-list-toolbar">
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label="Hosting plan view" />
      </div>

      {(viewMode === "cards" || isDashboardLoading || !accounts.length) && (
        <div className="card-grid">
          {isDashboardLoading && (
            <article className="service-card">
              <span className="status-pill blue"><LoadingIcon label="Loading hosting plans" /></span>
            </article>
          )}
          {!isDashboardLoading && !accounts.length && (
            <article className="service-card">
              <span className="status-pill blue">Empty</span>
              <h2>No active hosting plans found</h2>
              <p>This account has no visible hosting plans in cp_config.</p>
            </article>
          )}
          {accounts.map((account) => (
            <article className="service-card" key={account.cpId}>
              <div>
                <span className={account.status === "Active" ? "status-pill" : "status-pill muted"}>{account.status}</span>
                <h2>{account.cpLogin}</h2>
                <p className="hosting-card-domains" title={planDomainList(account)}>
                  <span>{planCardDomainList(account)}</span>
                  {planDomainCount(account) > 0 ? <span className="domain-count-badge">{planDomainCount(account)}+</span> : null}
                </p>
              </div>
              <dl className="card-meta">
                <div><dt>Renewal</dt><dd>{formatDate(account.renewalDate)}</dd></div>
                <div><dt>Plan</dt><dd>{account.webHostType}</dd></div>
                <div><dt>Total Sites</dt><dd>{account.totalSites}</dd></div>
                <div><dt>Server</dt><dd>{account.serverId}</dd></div>
              </dl>
              <div className="hosting-card-actions">
                <button className="primary-button hosting-manage-button" type="button" onClick={onManageHosting}>
                  <MenuIcon name="rocket" /> Manage
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={!account.clientProductId || renewalBusyId !== null}
                  onClick={() => loadHostingRenewalPreview({
                    clientProductId: account.clientProductId,
                    name: account.cpLogin
                  })}
                >
                  {renewalBusyId === account.clientProductId ? <LoadingIcon label="Checking renewal" /> : <><MenuIcon name="order" /> Renew</>}
                </button>
                <button className="secondary-button" type="button" onClick={() => openHostingUpgrade(account)}>
                  <MenuIcon name="arrow-up" /> Upgrade
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!!accounts.length && viewMode === "table" && (
        <div className="table-wrap website-table hosting-plan-table">
          <table>
            <thead>
              <tr>
                <th>Hosting Plan</th>
                <th>Domains</th>
                <th>Status</th>
                <th>Renewal</th>
                <th>Plan</th>
                <th>Total Sites</th>
                <th>Server</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.cpId}>
                  <td>{account.cpLogin}</td>
                  <td>
                    <span className="hosting-domain-cell">
                      <span>{planFirstDomain(account)}</span>
                      {planDomainCount(account) > 0 ? <span className="domain-count-badge">{planDomainCount(account)}+</span> : null}
                    </span>
                  </td>
                  <td><span className={account.status === "Active" ? "status-pill" : "status-pill muted"}>{account.status}</span></td>
                  <td>{formatDate(account.renewalDate)}</td>
                  <td>{account.webHostType}</td>
                  <td>{account.totalSites}</td>
                  <td>{account.serverId}</td>
                  <td>
                    <div className="website-action-buttons compact-actions">
                      <button className="primary-button compact icon-only-button hosting-manage-button" type="button" onClick={onManageHosting} title="Manage" aria-label="Manage">
                        <MenuIcon name="rocket" />
                      </button>
                      <button
                        className="secondary-button compact icon-only-button"
                        type="button"
                        disabled={!account.clientProductId || renewalBusyId !== null}
                        title="Renew"
                        aria-label="Renew"
                        onClick={() => loadHostingRenewalPreview({
                          clientProductId: account.clientProductId,
                          name: account.cpLogin
                        })}
                      >
                        {renewalBusyId === account.clientProductId ? <LoadingIcon label="Checking renewal" /> : <MenuIcon name="order" />}
                      </button>
                      <button className="secondary-button compact icon-only-button hosting-upgrade-button" type="button" onClick={() => openHostingUpgrade(account)} title="Upgrade" aria-label="Upgrade">
                        <MenuIcon name="arrow-up" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <article className="affiliate-promo panel-card">
        <div>
          <span className="status-pill blue">Pays 60%</span>
          <h2>Join Affiliate Program</h2>
          <p>
            For every paid customer your refer to us, you get 60% of what we charge.
            For every Free Trial customer, you get $5 USD.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onShowAffiliate}>View Affiliate Program</button>
      </article>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function addYears(date, years) {
  const copy = new Date(date.getTime());
  copy.setFullYear(copy.getFullYear() + years);
  return copy;
}

function formatDateForInput(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatFileSize(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const amount = bytes / 1024 ** index;
  return `${amount >= 10 || index === 0 ? amount.toFixed(0) : amount.toFixed(1)} ${units[index]}`;
}

function cleanLegacyText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toCheckoutPreview(order, itemCount = 1) {
  return {
    checkoutId: order.guid,
    title: order.title,
    itemCount,
    total: order.amount,
    currency: order.currency,
    checkoutUrl: order.checkoutUrl,
    note: order.note,
    isOrder: true
  };
}

function goToCheckoutOrder(order) {
  if (order?.checkoutUrl) {
    window.location.href = order.checkoutUrl;
    return true;
  }

  return false;
}

const domainRegistrarActionDefaults = {
  nameservers: "NS1.SITE4NOW.NET, NS2.SITE4NOW.NET, NS3.SITE4NOW.NET",
  contact: [
    "first_name=Open",
    "last_name=Reward",
    "org_name=OPENREWARD",
    "address1=123 Sample Street",
    "address2=",
    "address3=",
    "city=Los Angeles",
    "state=CA",
    "postal_code=90001",
    "country=US",
    "phone=+1.5555555555",
    "fax=",
    "email=support@example.com",
    "url="
  ].join("\n"),
  "privacy-on": "",
  "privacy-off": "",
  lock: "",
  unlock: "",
  status: "",
  "auth-code": "",
  "auto-renew-on": "",
  "auto-renew-off": "",
  forwarding: "support@example.com",
  dns: "A @ 208.98.35.146\nCNAME www sample.com\nMX @ mail.sample.com 10\nTXT @ v=spf1 a mx include:_spf.site4now.net -all"
};

function DnsManagementPage({ domain, manager, isLoading, message, recordsPreview, busy, draft, onDraftChange, onBack, onReload, onSubmitAction }) {
  const recordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV"];
  const dnsServers = manager?.dnsServers?.length ? manager.dnsServers : ["NS1.SITE4NOW.NET", "NS2.SITE4NOW.NET", "NS3.SITE4NOW.NET"];
  const rows = recordsPreview?.length ? recordsPreview : manager?.records ?? [];
  const example = dnsRecordExample(draft.recordType === "TXT" ? "SPF/TXT" : draft.recordType);
  const [editingRecordIndex, setEditingRecordIndex] = useState(null);
  const [editingRecordDraft, setEditingRecordDraft] = useState(null);

  function updateDraft(field, value) {
    onDraftChange((current) => ({ ...current, [field]: value }));
  }

  function submit(event, action) {
    event.preventDefault();
    onSubmitAction(action);
  }

  function beginEditRecord(record, index) {
    setEditingRecordIndex(index);
    setEditingRecordDraft({
      recordType: record.type || "A",
      name: record.name || "@",
      value: record.value || "",
      ttl: String(record.ttl || 300),
      priority: String(record.priority ?? 10),
      weight: String(record.weight ?? 1),
      port: String(record.port ?? 443)
    });
  }

  function updateEditingRecord(field, value) {
    setEditingRecordDraft((current) => ({ ...(current ?? {}), [field]: value }));
  }

  function saveEditingRecord() {
    if (editingRecordIndex == null || !editingRecordDraft) return;
    onSubmitAction("edit", rows[editingRecordIndex]?.index ?? editingRecordIndex, editingRecordDraft);
    setEditingRecordIndex(null);
    setEditingRecordDraft(null);
  }

  function renderDnsEditableCell(record, index, field, label) {
    const isEditing = editingRecordIndex === index;
    if (isEditing && editingRecordDraft) {
      if (field === "recordType") {
        return (
          <select
            aria-label={label}
            className="dns-record-inline-control"
            value={editingRecordDraft.recordType}
            onChange={(event) => updateEditingRecord("recordType", event.target.value)}
          >
            {recordTypes.map((type) => <option key={type} value={type}>{type === "TXT" ? "SPF/TXT" : type}</option>)}
          </select>
        );
      }

      return (
        <input
          aria-label={label}
          className="dns-record-inline-control"
          type={field === "ttl" ? "number" : "text"}
          min={field === "ttl" ? "300" : undefined}
          max={field === "ttl" ? "86400" : undefined}
          value={editingRecordDraft[field] ?? ""}
          onChange={(event) => updateEditingRecord(field, event.target.value)}
        />
      );
    }

    const value = field === "recordType" ? record.type : field === "ttl" ? `${record.ttl}s` : record[field];
    return (
      <button
        className={field === "recordType" ? "dns-record-click-cell domain-dns-type" : "dns-record-click-cell"}
        type="button"
        title={`Edit ${label}`}
        onClick={() => beginEditRecord(record, index)}
      >
        {value || "-"}
      </button>
    );
  }

  return (
    <aside className="domain-settings-page dns-management-page">
      <div className="domain-settings-header">
        <button className="secondary-button compact" type="button" onClick={onBack}>
          <MenuIcon name="back" />
          Back to Domains
        </button>
        <div className="dns-page-actions">
          <RefreshButton onClick={onReload} />
        </div>
      </div>
      <div className="database-card-header dns-manager-title">
        <div>
          <span className="status-pill blue">DNS Manager</span>
          <h3>{domain?.domainName ?? manager?.domainName}</h3>
          <p>Manage DNS records using the same A, AAAA, CNAME, MX, SPF/TXT, and SRV.</p>
        </div>
      </div>

      <section className="dns-server-strip" aria-label="DNS servers">
        {dnsServers.map((server) => (
          <span key={server}>{server}</span>
        ))}
      </section>

      {isLoading && <LoadingState label="Loading DNS manager" />}
      {message && <p className="renewal-action-message">{message}</p>}

      <article className="panel-card dns-record-draft-card flush-card">
        <form className="advance-inline-form dns-management-form" onSubmit={(event) => submit(event, "add")}>
          <div className="dns-add-edit-badge-cell">
            <span className="status-pill muted">Add / Edit Record</span>
          </div>
          <label>
            Type
            <select value={draft.recordType} onChange={(event) => updateDraft("recordType", event.target.value)}>
              {recordTypes.map((type) => <option key={type} value={type}>{type === "TXT" ? "SPF/TXT" : type}</option>)}
            </select>
          </label>
          <label>
            Name
            <input value={draft.name} placeholder={draft.recordType === "MX" ? "@" : "blog"} onChange={(event) => updateDraft("name", event.target.value)} />
          </label>
          <label>
            Address
            <input value={draft.value} placeholder={draft.recordType === "A" ? "123.123.123.123" : "target.example.com"} onChange={(event) => updateDraft("value", event.target.value)} />
          </label>
          {["MX", "SRV"].includes(draft.recordType) && (
            <label>
              Priority
              <input type="number" min="0" max="100" value={draft.priority} onChange={(event) => updateDraft("priority", event.target.value)} />
            </label>
          )}
          {draft.recordType === "SRV" && (
            <>
              <label>
                Weight
                <input type="number" min="0" max="100" value={draft.weight} onChange={(event) => updateDraft("weight", event.target.value)} />
              </label>
              <label>
                Port
                <input type="number" min="1" max="65535" value={draft.port} onChange={(event) => updateDraft("port", event.target.value)} />
              </label>
            </>
          )}
          <label>
            TTL
            <input type="number" min="300" max="86400" value={draft.ttl} onChange={(event) => updateDraft("ttl", event.target.value)} />
          </label>
          <button className="primary-button compact" type="submit" disabled={busy}>
            {busy ? <LoadingIcon label="Adding DNS record" /> : "Add Record"}
          </button>
        </form>
        <div className="dns-example-panel">
          <span className="status-pill muted">Example</span>
          <p>{example}</p>
        </div>
      </article>

      <div className="domain-dns-preview">
        <span>DNS Records</span>
        <div className="domain-dns-preview-grid">
          {rows.map((record, index) => (
            <div className="domain-dns-preview-row dns-manager-row" key={`${record.type}-${record.name}-${record.value}-${index}`}>
              <span>{renderDnsEditableCell(record, index, "recordType", "Type")}</span>
              <span>{renderDnsEditableCell(record, index, "name", "Name")}</span>
              <span>{renderDnsEditableCell(record, index, "value", "Address")}</span>
              <span>{record.priority ?? "-"}</span>
              <span>{renderDnsEditableCell(record, index, "ttl", "TTL")}</span>
              <button
                aria-label={editingRecordIndex === index ? `Save ${record.type} ${record.name}` : `Delete ${record.type} ${record.name}`}
                className="secondary-button compact icon-only"
                disabled={busy}
                title={editingRecordIndex === index ? "Save" : "Delete"}
                type="button"
                onClick={() => editingRecordIndex === index ? saveEditingRecord() : onSubmitAction("delete", record.index ?? index)}
              >
                <MenuIcon name={editingRecordIndex === index ? "save" : "trash"} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function DomainSection() {
  const [accountDomains, setAccountDomains] = useState([]);
  const [domainSearch, setDomainSearch] = useState("");
  const [domainQuery, setDomainQuery] = useState("sample");
  const [domainExtension, setDomainExtension] = useState(".com");
  const [domainExtensionFilter, setDomainExtensionFilter] = useState("");
  const [isDomainExtensionOpen, setIsDomainExtensionOpen] = useState(false);
  const [domainResults, setDomainResults] = useState([]);
  const [domainCart, setDomainCart] = useState([]);
  const [domainCheckoutPreview, setDomainCheckoutPreview] = useState(null);
  const [domainCheckoutMessage, setDomainCheckoutMessage] = useState("");
  const [domainTransferName, setDomainTransferName] = useState("");
  const [domainTransferPreview, setDomainTransferPreview] = useState(null);
  const [domainTransferMessage, setDomainTransferMessage] = useState("");
  const [isDomainTransferBusy, setIsDomainTransferBusy] = useState(false);
  const [domainLookupMessage, setDomainLookupMessage] = useState("");
  const [isDomainSearching, setIsDomainSearching] = useState(false);
  const [isDomainCheckingOut, setIsDomainCheckingOut] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedDomainProfile, setSelectedDomainProfile] = useState(null);
  const [domainProfileError, setDomainProfileError] = useState("");
  const [isLoadingDomainProfile, setIsLoadingDomainProfile] = useState(false);
  const [domainPanelView, setDomainPanelView] = useState("list");
  const [domainServiceStatus, setDomainServiceStatus] = useState(null);
  const [domainRenewalPreview, setDomainRenewalPreview] = useState(null);
  const [domainRenewalCheckoutPreview, setDomainRenewalCheckoutPreview] = useState(null);
  const [domainPrivacyCheckoutPreview, setDomainPrivacyCheckoutPreview] = useState(null);
  const [domainActionMessage, setDomainActionMessage] = useState("");
  const [domainAuthCodeMessage, setDomainAuthCodeMessage] = useState("");
  const [domainActionUrl, setDomainActionUrl] = useState("");
  const [domainActionDomainId, setDomainActionDomainId] = useState(null);
  const [domainDnsPreview, setDomainDnsPreview] = useState([]);
  const [domainDnsManager, setDomainDnsManager] = useState(null);
  const [domainDnsMessage, setDomainDnsMessage] = useState("");
  const [isDomainDnsLoading, setIsDomainDnsLoading] = useState(false);
  const [domainDnsDraft, setDomainDnsDraft] = useState({
    recordType: "A",
    name: "@",
    value: "208.98.35.146",
    ttl: "300",
    priority: "10",
    weight: "1",
    port: "443"
  });
  const [isDomainActionBusy, setIsDomainActionBusy] = useState(false);
  const [domainPrivacyOverrides, setDomainPrivacyOverrides] = useState({});
  const [domainLockOverrides, setDomainLockOverrides] = useState({});
  const [activeDomainContactTab, setActiveDomainContactTab] = useState("registrant");
  const [domainRegistrarForm, setDomainRegistrarForm] = useState({
    action: "nameservers",
    value: domainRegistrarActionDefaults.nameservers
  });
  const [isEditingNameservers, setIsEditingNameservers] = useState(false);
  const [nameserverDraft, setNameserverDraft] = useState(() => parseNameserverText(domainRegistrarActionDefaults.nameservers));
  const [nameserverSaveState, setNameserverSaveState] = useState({ state: "idle", message: "" });
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [domainError, setDomainError] = useState("");

  async function loadAccountDomains() {
    setIsLoadingDomains(true);
    setDomainError("");
    try {
      const response = await fetch("/api/account/domains");
      const result = await response.json();
      if (!response.ok || !result.success) {
        setDomainError(result?.message ?? "Unable to load domains.");
        return;
      }

      setAccountDomains(result.domains ?? []);
    } catch {
      setDomainError("Unable to reach domain service.");
    } finally {
      setIsLoadingDomains(false);
    }
  }

  useEffect(() => {
    loadAccountDomains();
    loadDomainServiceStatus();
  }, []);

  useEffect(() => {
    if (!selectedDomain?.id) {
      setSelectedDomainProfile(null);
      setDomainProfileError("");
      return;
    }

    let isCurrent = true;
    async function loadDomainProfile() {
      setIsLoadingDomainProfile(true);
      setDomainProfileError("");
      try {
        const response = await fetch(`/api/account/domains/${selectedDomain.id}/profile`);
        const result = await response.json().catch(() => null);
        if (!isCurrent) return;
        if (!response.ok || !result?.success) {
          setSelectedDomainProfile(null);
          setDomainProfileError(result?.message ?? "Unable to load domain profile.");
          return;
        }
        setSelectedDomainProfile(result.profile);
        setIsEditingNameservers(false);
        setNameserverDraft(parseNameserverText(result.profile?.nameservers?.join(", ") || domainRegistrarActionDefaults.nameservers));
        setNameserverSaveState({ state: "idle", message: "" });
        setActiveDomainContactTab("registrant");
        setDomainRegistrarForm({
          action: "contact",
          value: contactValueFromProfile(result.profile?.registrant)
        });
      } catch {
        if (isCurrent) {
          setSelectedDomainProfile(null);
          setDomainProfileError("Unable to reach domain profile service.");
        }
      } finally {
        if (isCurrent) setIsLoadingDomainProfile(false);
      }
    }

    loadDomainProfile();
    return () => {
      isCurrent = false;
    };
  }, [selectedDomain?.id]);

  async function loadDomainServiceStatus() {
    try {
      const response = await fetch("/api/account/service-status");
      const result = await response.json();
      if (response.ok && result.success) {
        setDomainServiceStatus(result.services);
      }
    } catch {
      setDomainServiceStatus(null);
    }
  }

  const filteredDomains = accountDomains.filter((domain) =>
    domain.domainName.toLowerCase().includes(domainSearch.trim().toLowerCase())
  );
  const visibleDomainExtensions = domainExtensions.filter((extension) => {
    const filter = domainExtensionFilter.trim().toLowerCase().replace(/^\./, "");
    return !filter || extension.replace(/^\./, "").includes(filter);
  });

  function normalizeDomainSearch(value, extension) {
    const cleaned = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (!cleaned) return "";
    return cleaned.includes(".") ? cleaned : `${cleaned}${extension}`;
  }

  function selectDomainExtension(extension) {
    setDomainExtension(extension);
    setDomainExtensionFilter("");
    setIsDomainExtensionOpen(false);
  }

  async function handleDomainSearch(event) {
    event.preventDefault();
    const primary = normalizeDomainSearch(domainQuery, domainExtension);
    if (!primary) {
      setDomainResults([]);
      return;
    }

    const base = primary.split(".")[0];
    const featuredExtensions = [domainExtension, ".com", ".net", ".org", ".io", ".app", ".ai", ".co", ".dev", ".shop", ".store", ".online", ".tech"];
    const options = Array.from(new Set([primary, ...featuredExtensions.map((extension) => `${base}${extension}`)]));
    const pricedOptions = options.map((domainName) => {
      const extension = domainExtensions
        .filter((candidate) => domainName.endsWith(candidate))
        .sort((a, b) => b.length - a.length)[0] ?? `.${domainName.split(".").pop()}`;
      const basePrice = getDomainExtensionPrice(extension);
      return {
        domainName,
        available: false,
        reason: "Checking...",
        price: basePrice
      };
    });

    setIsDomainSearching(true);
    setDomainLookupMessage("");
    setDomainCheckoutPreview(null);
    setDomainResults(pricedOptions);

    try {
      const response = await fetch("/api/account/domains/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: options })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainResults(pricedOptions.map((item) => ({ ...item, reason: "Could not verify" })));
        setDomainLookupMessage(result?.message ?? "Unable to verify domain availability.");
        return;
      }

      const availability = new Map((result.results ?? []).map((item) => [item.domainName, item]));
      setDomainResults(pricedOptions.map((item) => {
        const checked = availability.get(item.domainName);
        return checked
          ? { ...item, available: checked.available, reason: checked.reason }
          : { ...item, available: false, reason: "Could not verify" };
      }));
      setDomainLookupMessage(result.message);
    } catch {
      setDomainResults(pricedOptions.map((item) => ({ ...item, reason: "Could not verify" })));
      setDomainLookupMessage("Unable to reach domain availability service.");
    } finally {
      setIsDomainSearching(false);
    }
  }

  function addDomainToCart(result) {
    if (!result.available || domainCart.some((item) => item.domainName === result.domainName)) return;
    setDomainCart((items) => [...items, result]);
  }

  function removeDomainFromCart(domainName) {
    setDomainCart((items) => items.filter((item) => item.domainName !== domainName));
  }

  async function checkoutDomains() {
    setIsDomainCheckingOut(true);
    setDomainCheckoutMessage("");
    setDomainCheckoutPreview(null);

    try {
      const response = await fetch("/api/account/domains/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: domainCart })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainCheckoutMessage(result?.message ?? "Unable to create domain checkout.");
        return;
      }

      if (goToCheckoutOrder(result.order)) return;
      setDomainCheckoutPreview(toCheckoutPreview(result.order, domainCart.length));
      setDomainCheckoutMessage(result.message);
    } catch {
      setDomainCheckoutMessage("Unable to reach domain checkout service.");
    } finally {
      setIsDomainCheckingOut(false);
    }
  }

  async function createDomainTransferCheckout(event) {
    event.preventDefault();
    setIsDomainTransferBusy(true);
    setDomainTransferMessage("");
    setDomainTransferPreview(null);

    try {
      const response = await fetch("/api/account/new-orders/domain-transfer/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: domainTransferName
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainTransferMessage(result?.message ?? "Unable to create domain transfer checkout.");
        return;
      }

      if (goToCheckoutOrder(result.order)) return;
      setDomainTransferPreview(toCheckoutPreview(result.order, 1));
      setDomainTransferMessage(result.message);
    } catch {
      setDomainTransferMessage("Unable to reach domain transfer checkout service.");
    } finally {
      setIsDomainTransferBusy(false);
    }
  }

  async function renewSelectedDomain(domain = selectedDomain) {
    if (!domain?.id) return;
    setSelectedDomain(domain);
    setDomainActionDomainId(domain.id);
    setIsDomainActionBusy(true);
    setDomainActionMessage("");
    setDomainActionUrl("");
    setDomainRenewalPreview(null);
    setDomainRenewalCheckoutPreview(null);

    try {
      const response = await fetch(`/api/account/domains/${domain.id}/renew-checkout`, { method: "POST" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainActionMessage(result?.message ?? "Unable to prepare domain renewal.");
        return;
      }

      if (goToCheckoutOrder(result.order)) return;
      setDomainRenewalCheckoutPreview(toCheckoutPreview(result.order, 1));
      setDomainActionMessage(result.message);
    } catch {
      setDomainActionMessage("Unable to reach domain renewal service.");
    } finally {
      setIsDomainActionBusy(false);
    }
  }

  function openDomainSettings(domain) {
    setSelectedDomain(domain);
    setDomainActionDomainId(null);
    setDomainPanelView("settings");
    setActiveDomainContactTab("registrant");
    setDomainActionMessage("");
    setDomainAuthCodeMessage("");
    setDomainDnsPreview([]);
    setDomainRegistrarForm({
      action: "contact",
      value: domainRegistrarActionDefaults.contact
    });
  }

  function openDomainDnsManager(domain) {
    setSelectedDomain(domain);
    setDomainActionDomainId(null);
    setDomainPanelView("dns");
    setDomainActionMessage("");
    setDomainAuthCodeMessage("");
    setDomainDnsPreview([]);
    setDomainDnsMessage("");
    setDomainDnsDraft((draft) => ({
      ...draft,
      recordType: "A",
      name: "@",
      value: "208.98.35.146",
      ttl: "300"
    }));
    loadDomainDnsManager(domain.id);
  }

  async function loadDomainDnsManager(domainId = selectedDomain?.id) {
    if (!domainId) return;
    setIsDomainDnsLoading(true);
    setDomainDnsMessage("");
    try {
      const response = await fetch(`/api/account/domains/${domainId}/dns`);
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainDnsManager(null);
        setDomainDnsMessage(result?.message ?? "Unable to load DNS manager.");
        return;
      }

      setDomainDnsManager(result.manager);
    } catch {
      setDomainDnsMessage("Unable to reach DNS manager service.");
    } finally {
      setIsDomainDnsLoading(false);
    }
  }

  async function submitDomainDnsAction(action, recordIndex = null, recordDraft = null) {
    if (!selectedDomain?.id) return;
    const dnsActionDraft = recordDraft ?? domainDnsDraft;
    setIsDomainActionBusy(true);
    setDomainDnsMessage("");
    try {
      const response = await fetch(`/api/account/domains/${selectedDomain.id}/dns/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          recordType: dnsActionDraft.recordType,
          name: dnsActionDraft.name,
          value: dnsActionDraft.value,
          ttl: Number(dnsActionDraft.ttl) || 300,
          priority: Number(dnsActionDraft.priority) || 10,
          weight: Number(dnsActionDraft.weight) || 1,
          port: Number(dnsActionDraft.port) || 443,
          recordIndex
        })
      });
      const result = await response.json().catch(() => null);
      setDomainDnsMessage(result?.message ?? "Unable to run DNS action.");
      if (!response.ok || !result?.success) {
        return;
      }

      setDomainDnsPreview([]);
      setDomainDnsManager((current) => current ? { ...current, records: result.records ?? [] } : current);
    } catch {
      setDomainDnsMessage("Unable to reach DNS action service.");
    } finally {
      setIsDomainActionBusy(false);
    }
  }

  async function toggleDomainPrivacy(domain, enabled) {
    if (!domain?.id || !domain.whoisPrivacySupported) return;

    setSelectedDomain(domain);
    setDomainActionDomainId(domain.id);
    setIsDomainActionBusy(true);
    setDomainActionMessage("");
    setDomainActionUrl("");
    try {
      const response = await fetch(`/api/account/domains/${domain.id}/registrar-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: enabled ? "privacy-on" : "privacy-off", value: "" })
      });
      const result = await response.json().catch(() => null);
      setDomainActionMessage(result?.message ?? "Unable to update Whois Privacy.");
      setDomainActionUrl(result?.actionUrl ?? "");
      if (result?.success) {
        setDomainPrivacyOverrides((current) => ({ ...current, [domain.id]: enabled }));
        await loadAccountDomains();
      }
    } catch {
      setDomainActionMessage("Unable to reach Whois Privacy service.");
    } finally {
      setIsDomainActionBusy(false);
    }
  }

  async function toggleDomainLock(domain, locked) {
    if (!domain?.id || domain.status !== "completed") return;

    setSelectedDomain(domain);
    setIsDomainActionBusy(true);
    setDomainActionMessage("");
    setDomainActionUrl("");
    try {
      const response = await fetch(`/api/account/domains/${domain.id}/registrar-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: locked ? "lock" : "unlock", value: "" })
      });
      const result = await response.json().catch(() => null);
      setDomainActionMessage(result?.message ?? "Unable to update Domain Lock.");
      if (result?.success) {
        setDomainLockOverrides((current) => ({ ...current, [domain.id]: locked }));
      }
    } catch {
      setDomainActionMessage("Unable to reach Domain Lock service.");
    } finally {
      setIsDomainActionBusy(false);
    }
  }

  async function createDomainPrivacyCheckout() {
    if (!selectedDomain?.id || !domainActionUrl) return;
    setDomainActionDomainId(selectedDomain.id);
    setIsDomainActionBusy(true);
    setDomainPrivacyCheckoutPreview(null);
    try {
      const response = await fetch(domainActionUrl, { method: "POST" });
      const result = await response.json().catch(() => null);
      setDomainActionMessage(result?.message ?? "Unable to create Whois Privacy checkout.");
      if (!response.ok || !result?.success) {
        return;
      }
      setDomainActionUrl("");
      if (goToCheckoutOrder(result.order)) return;
      setDomainPrivacyCheckoutPreview(toCheckoutPreview(result.order, 1));
    } catch {
      setDomainActionMessage("Unable to reach Whois Privacy checkout service.");
    } finally {
      setIsDomainActionBusy(false);
    }
  }

  async function createDomainRenewalCheckout(renewal) {
    const response = await fetch(`/api/account/renewals/${renewal.clientProductId}/checkout`, { method: "POST" });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.message ?? "Unable to create domain renewal checkout.");
    }

    return result.order;
  }

  async function submitDomainRegistrarAction(event) {
    event.preventDefault();
    if (!selectedDomain?.id) return;
    setIsDomainActionBusy(true);
    setDomainActionMessage("");
    setDomainActionUrl("");
    setDomainDnsPreview([]);

    try {
      const isDnsAction = domainRegistrarForm.action === "dns";
      const response = await fetch(`/api/account/domains/${selectedDomain.id}/${isDnsAction ? "dns-preview" : "registrar-action"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isDnsAction ? { records: domainRegistrarForm.value } : domainRegistrarForm)
      });
      const result = await response.json().catch(() => null);
      setDomainActionMessage(result?.message ?? "Unable to prepare registrar action.");
      setDomainActionUrl(result?.actionUrl ?? "");
      if (isDnsAction && result?.success) {
        setDomainDnsPreview(result.records ?? []);
      }
    } catch {
      setDomainActionMessage("Unable to reach registrar action service.");
    } finally {
      setIsDomainActionBusy(false);
    }
  }

  function selectDomainRegistrarAction(action) {
    const dnsDefault = selectedDomain?.domainName
      ? [
        "A @ 208.98.35.146",
        `CNAME www ${selectedDomain.domainName}`,
        `MX @ mail.${selectedDomain.domainName} 10`,
        "TXT @ v=spf1 a mx include:_spf.site4now.net -all"
      ].join("\n")
      : domainRegistrarActionDefaults.dns;
    const contact = selectedDomainProfile?.registrant;
    const contactDefault = contact
      ? [
        `first_name=${contact.firstName ?? ""}`,
        `last_name=${contact.lastName ?? ""}`,
        `org_name=${contact.organization ?? ""}`,
        `address1=${contact.address1 ?? ""}`,
        `address2=${contact.address2 ?? ""}`,
        "address3=",
        `city=${contact.city ?? ""}`,
        `state=${contact.state || contact.province || ""}`,
        `postal_code=${contact.postalCode ?? ""}`,
        `country=${contact.country ?? ""}`,
        `phone=${contact.phone ?? ""}`,
        `fax=${contact.fax ?? ""}`,
        `email=${contact.email ?? ""}`,
        "url="
      ].join("\n")
      : domainRegistrarActionDefaults.contact;
    setDomainRegistrarForm({
      action,
      value: action === "dns"
        ? dnsDefault
        : action === "contact"
          ? contactDefault
          : domainRegistrarActionDefaults[action] ?? ""
    });
    setDomainActionMessage("");
    setDomainDnsPreview([]);
  }

  function updateNameserverAt(index, value) {
    const nameservers = domainRegistrarForm.value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
    while (nameservers.length < 5) {
      nameservers.push("");
    }
    nameservers[index] = value.trim();
    setDomainRegistrarForm((form) => ({
      ...form,
      value: nameservers.filter(Boolean).join(", ")
    }));
  }

  function parseNameserverText(text) {
    const nameservers = String(text || "")
      .split(/[,\n\r;|]/)
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
    return nameservers.length ? nameservers : parseNameserverText(domainRegistrarActionDefaults.nameservers);
  }

  function updateInlineNameserverAt(index, value) {
    setNameserverSaveState({ state: "idle", message: "" });
    setNameserverDraft((current) => {
      const next = [...current];
      while (next.length < 5) next.push("");
      next[index] = value;
      return next;
    });
  }

  async function saveInlineNameservers() {
    if (!selectedDomain?.id || nameserverSaveState.state === "saving") return;
    const nameservers = nameserverDraft.map((item) => item.trim().toUpperCase()).filter(Boolean);
    if (nameservers.length < 2) {
      setNameserverSaveState({ state: "error", message: "Enter at least two nameservers." });
      return;
    }

    setNameserverSaveState({ state: "saving", message: "Saving nameservers..." });
    setDomainActionMessage("");
    setDomainActionUrl("");

    try {
      const response = await fetch(`/api/account/domains/${selectedDomain.id}/registrar-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "nameservers", value: nameservers.join(", ") })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setNameserverSaveState({ state: "error", message: result?.message ?? "Unable to update nameservers." });
        return;
      }

      setNameserverDraft(nameservers);
      setIsEditingNameservers(false);
      setNameserverSaveState({ state: "saved", message: result?.message ?? "Nameservers updated." });
    } catch {
      setNameserverSaveState({ state: "error", message: "Unable to reach registrar action service." });
    }
  }

  function handleNameserverEditorBlur(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    saveInlineNameservers();
  }

  function cancelInlineNameserverEdit() {
    setIsEditingNameservers(false);
    setNameserverSaveState({ state: "idle", message: "" });
  }

  function renderNameserverDetailRow() {
    const nameservers = nameserverDraft.map((item) => item.trim().toUpperCase()).filter(Boolean);
    const rows = nameservers.length ? nameservers : parseNameserverText(domainRegistrarActionDefaults.nameservers);
    const editableRows = [...nameserverDraft];
    while (editableRows.length < 5) editableRows.push("");

    return (
      <div className="domain-nameserver-row">
        <dt>Nameservers</dt>
        <dd>
          {isEditingNameservers ? (
            <div
              className="domain-nameserver-editor"
              onBlur={handleNameserverEditorBlur}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  cancelInlineNameserverEdit();
                }
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  saveInlineNameservers();
                }
              }}
            >
              {editableRows.map((value, index) => (
                <input
                  aria-label={`Nameserver ${index + 1}`}
                  key={index}
                  type="text"
                  value={value}
                  placeholder={index < 2 ? `Nameserver ${index + 1}` : `Nameserver ${index + 1} optional`}
                  onChange={(event) => updateInlineNameserverAt(index, event.target.value)}
                />
              ))}
              <div className="domain-nameserver-editor-actions">
                {nameserverSaveState.state === "saving" ? (
                  <LoadingIcon label="Saving nameservers" />
                ) : (
                  <button className="primary-button compact" type="button" onMouseDown={(event) => event.preventDefault()} onClick={saveInlineNameservers}>
                    Save
                  </button>
                )}
                {nameserverSaveState.state === "error" && <span className="inline-status error">{nameserverSaveState.message}</span>}
              </div>
            </div>
          ) : (
            <button
              className="domain-nameserver-display"
              type="button"
              title="Click to edit nameservers"
              onClick={() => {
                setIsEditingNameservers(true);
                setNameserverSaveState({ state: "idle", message: "" });
              }}
            >
              <span>
                {rows.map((nameserver) => (
                  <React.Fragment key={nameserver}>
                    {nameserver}
                    <br />
                  </React.Fragment>
                ))}
              </span>
              {nameserverSaveState.state === "saved" && (
                <span className="domain-nameserver-saved-icon" title={nameserverSaveState.message || "Nameservers saved"}>
                  <MenuIcon name="check" />
                </span>
              )}
            </button>
          )}
        </dd>
      </div>
    );
  }

  function getContactValue(key) {
    const line = domainRegistrarForm.value
      .split("\n")
      .find((item) => item.toLowerCase().startsWith(`${key.toLowerCase()}=`));
    return line ? line.slice(line.indexOf("=") + 1) : "";
  }

  function updateContactValue(key, value) {
    const fields = new Map();
    domainRegistrarForm.value.split("\n").forEach((line) => {
      const separator = line.indexOf("=");
      if (separator > -1) {
        fields.set(line.slice(0, separator), line.slice(separator + 1));
      }
    });
    fields.set(key, value);
    const order = ["first_name", "last_name", "org_name", "address1", "address2", "address3", "city", "state", "postal_code", "country", "phone", "fax", "email", "url"];
    setDomainRegistrarForm((form) => ({
      ...form,
      value: order.map((field) => `${field}=${fields.get(field) ?? ""}`).join("\n")
    }));
  }

  async function runDomainRegistrarAction(action, value = "") {
    if (!selectedDomain?.id) return;
    setIsDomainActionBusy(true);
    setDomainActionMessage("");
    if (action === "auth-code") {
      setDomainAuthCodeMessage("");
    }
    setDomainActionUrl("");

    try {
      const response = await fetch(`/api/account/domains/${selectedDomain.id}/registrar-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value })
      });
      const result = await response.json().catch(() => null);
      const message = result?.message ?? "Unable to run domain action.";
      if (action === "auth-code") {
        setDomainAuthCodeMessage(message);
      } else {
        setDomainActionMessage(message);
      }
      setDomainActionUrl(result?.actionUrl ?? "");
      if (result?.success && action === "contact") {
        await loadAccountDomains();
      }
    } catch {
      if (action === "auth-code") {
        setDomainAuthCodeMessage("Unable to reach registrar action service.");
      } else {
        setDomainActionMessage("Unable to reach registrar action service.");
      }
    } finally {
      setIsDomainActionBusy(false);
    }
  }

  const domainContactTabs = [
    ["registrant", "Registrant"],
    ["admin", "Admin"],
    ["billing", "Billing"],
    ["technical", "Technical"]
  ];

  function domainContactForTab(tab = activeDomainContactTab) {
    if (!selectedDomainProfile) return null;
    return selectedDomainProfile[tab] ?? null;
  }

  function contactValueFromProfile(contact) {
    return [
      `first_name=${contact?.firstName ?? ""}`,
      `last_name=${contact?.lastName ?? ""}`,
      `org_name=${contact?.organization ?? ""}`,
      `address1=${contact?.address1 ?? ""}`,
      `address2=${contact?.address2 ?? ""}`,
      "address3=",
      `city=${contact?.city ?? ""}`,
      `state=${contact?.state || contact?.province || ""}`,
      `postal_code=${contact?.postalCode ?? ""}`,
      `country=${contact?.country ?? ""}`,
      `phone=${contact?.phone ?? ""}`,
      `fax=${contact?.fax ?? ""}`,
      `email=${contact?.email ?? ""}`,
      "url="
    ].join("\n");
  }

  function domainContactName(contact) {
    return [contact?.firstName, contact?.lastName].filter(Boolean).join(" ") || contact?.organization || "N/A";
  }

  function domainContactAddress(contact) {
    return [
      contact?.address1,
      contact?.address2,
      contact?.city,
      contact?.state || contact?.province,
      contact?.postalCode,
      contact?.country
    ].filter(Boolean).join(", ") || "No address";
  }

  function domainContactPhone(contact) {
    return contact?.phone || contact?.fax || "No phone";
  }

  function selectDomainContactTab(tab) {
    setActiveDomainContactTab(tab);
    const contact = domainContactForTab(tab);
    setDomainRegistrarForm({
      action: "contact",
      value: contactValueFromProfile(contact)
    });
    setDomainActionMessage("");
    setDomainAuthCodeMessage("");
    setDomainActionUrl("");
  }

  function renderDomainRegistrarFields() {
    const action = domainRegistrarForm.action;
    if (["status", "auth-code", "lock", "unlock", "privacy-on", "privacy-off", "auto-renew-on", "auto-renew-off"].includes(action)) {
      return null;
    }

    if (action === "nameservers") {
      const nameservers = domainRegistrarForm.value.split(/[,\n]/).map((item) => item.trim());
      return (
        <div className="domain-field-grid">
          {[0, 1, 2, 3, 4].map((index) => (
            <label key={index}>
              {index < 2 ? `Nameserver ${index + 1}` : `Nameserver ${index + 1} optional`}
              <input
                type="text"
                value={nameservers[index] ?? ""}
                onChange={(event) => updateNameserverAt(index, event.target.value)}
              />
            </label>
          ))}
        </div>
      );
    }

    if (action === "contact") {
      const fields = [
        ["first_name", "First Name"],
        ["last_name", "Last Name"],
        ["org_name", "Organization"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["address1", "Address 1"],
        ["address2", "Address 2"],
        ["city", "City"],
        ["state", "State"],
        ["postal_code", "Postal Code"],
        ["country", "Country"],
        ["url", "URL"]
      ];
      return (
        <div className="domain-field-grid">
          {fields.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type={key === "email" ? "email" : "text"}
                value={getContactValue(key)}
                onChange={(event) => updateContactValue(key, event.target.value)}
              />
            </label>
          ))}
        </div>
      );
    }

    if (action === "forwarding") {
      return (
        <label>
          Forwarding Email
          <input
            type="email"
            value={domainRegistrarForm.value}
            onChange={(event) => setDomainRegistrarForm((form) => ({ ...form, value: event.target.value }))}
          />
        </label>
      );
    }

    return (
      <label>
        DNS Records
        <textarea
          value={domainRegistrarForm.value}
          onChange={(event) => setDomainRegistrarForm((form) => ({ ...form, value: event.target.value }))}
        />
      </label>
    );
  }

  const domainSettingsPanel = selectedDomain ? (
    <aside className="domain-settings-page">
      <div className="domain-settings-header">
        <button className="secondary-button compact" type="button" onClick={() => setDomainPanelView("list")}>
          <MenuIcon name="back" />
          Back to Domains
        </button>
        <span className="status-pill blue">Domain Settings</span>
      </div>
      <h3>{selectedDomain.domainName}</h3>
      <section className="domain-profile-block">
        <div className="billing-detail-header compact">
          <span className="status-pill blue">Domain Details</span>
          {isLoadingDomainProfile && <LoadingIcon label="Loading domain profile" />}
        </div>
        {domainProfileError && <p className="inline-status">{domainProfileError}</p>}
        <dl className="domain-detail-list">
          <div><dt>Domain Name</dt><dd>{selectedDomain.domainName}</dd></div>
          <div><dt>Expires</dt><dd>{formatDate(selectedDomain.expirationDate)}</dd></div>
          {renderNameserverDetailRow()}
          <div>
            <dt>Auth Code</dt>
            <dd>
              <div className="domain-auth-code-action-row">
                <button className="secondary-button compact" type="button" disabled={isDomainActionBusy} onClick={() => runDomainRegistrarAction("auth-code")}>
                  {isDomainActionBusy ? <LoadingIcon label="Sending auth code" /> : "Send Auth Code"}
                </button>
                {domainAuthCodeMessage && (
                  <div className="renewal-action-message domain-auth-code-message success">
                    {domainAuthCodeMessage}
                  </div>
                )}
              </div>
            </dd>
          </div>
          <div><dt>Registrar Status</dt><dd>{selectedDomain.registerStatus || "N/A"}</dd></div>
          <div><dt>Grace Period</dt><dd>{selectedDomain.gracePeriodDays ?? 0} days</dd></div>
        </dl>
      </section>
      <section className="domain-profile-block">
        <div className="billing-detail-header compact">
          <span className="status-pill muted">Domain Contacts</span>
          {isLoadingDomainProfile && <LoadingIcon label="Loading domain profile" />}
        </div>
        <div className="domain-contact-tabs" role="tablist" aria-label="Domain contact tabs">
          {domainContactTabs.map(([tab, label]) => {
            const contact = selectedDomainProfile?.[tab];
            return (
              <button
                aria-selected={activeDomainContactTab === tab}
                className={activeDomainContactTab === tab ? "tab active" : "tab"}
                key={tab}
                role="tab"
                type="button"
                onClick={() => selectDomainContactTab(tab)}
              >
                <MenuIcon name={tab === "registrant" ? "shield" : tab === "admin" ? "settings" : tab === "billing" ? "card" : "server"} />
                <span>{label}</span>
                <strong>{domainContactName(contact)}</strong>
                <small>{contact?.email || "N/A"}</small>
                <small>{domainContactAddress(contact)}</small>
                <small>{domainContactPhone(contact)}</small>
              </button>
            );
          })}
        </div>
      </section>
      <div className="domain-quick-actions hidden-domain-actions" aria-label="Domain quick actions">
        {[
          ["status", "Status"],
          ["auth-code", "Auth Code"],
          ["auto-renew-on", "Auto Renew On"],
          ["auto-renew-off", "Auto Renew Off"]
        ].map(([action, label]) => (
          <button
            className={domainRegistrarForm.action === action ? "secondary-button compact active" : "secondary-button compact"}
            key={action}
            type="button"
            onClick={() => selectDomainRegistrarAction(action)}
          >
            {label}
          </button>
        ))}
      </div>
      <form className="domain-action-form" onSubmit={submitDomainRegistrarAction}>
        <input type="hidden" value={domainRegistrarForm.action} readOnly />
        <div className="billing-detail-header compact">
          <span className="status-pill blue">Edit {domainContactTabs.find(([tab]) => tab === activeDomainContactTab)?.[1] ?? "Contact"}</span>
        </div>
        {renderDomainRegistrarFields()}
        {domainActionMessage && (
          <div className={
            domainActionMessage.toLowerCase().includes("completed successfully")
              ? "renewal-action-message domain-contact-save-message success"
              : "renewal-action-message domain-contact-save-message"
          }>
            <span>{domainActionMessage}</span>
            {domainActionUrl && (
              <button
                className="primary-button compact success-link-button"
                disabled={isDomainActionBusy}
                type="button"
                onClick={createDomainPrivacyCheckout}
              >
                {isDomainActionBusy ? <LoadingIcon label="Creating Whois Privacy checkout" /> : "Buy Whois Privacy"}
              </button>
            )}
          </div>
        )}
        <button className="primary-button compact" type="submit" disabled={isDomainActionBusy || domainRegistrarForm.action !== "contact"}>
          {isDomainActionBusy ? <LoadingIcon label="Saving domain contact" /> : "Save Contact"}
        </button>
      </form>
      {domainPrivacyCheckoutPreview && (
        <CheckoutPreviewCard preview={domainPrivacyCheckoutPreview} onClose={() => setDomainPrivacyCheckoutPreview(null)} />
      )}
      {domainRenewalCheckoutPreview && (
        <CheckoutPreviewCard preview={domainRenewalCheckoutPreview} onClose={() => setDomainRenewalCheckoutPreview(null)} />
      )}
      {domainDnsPreview.length > 0 && (
        <div className="domain-dns-preview">
          <span>DNS Preview</span>
          <div className="domain-dns-preview-grid">
            {domainDnsPreview.map((record, index) => (
              <div className="domain-dns-preview-row" key={`${record.type}-${record.name}-${index}`}>
                <span className="domain-dns-type">{record.type}</span>
                <span>{record.name}</span>
                <span>{record.value}</span>
                <span>{record.priority ?? "-"}</span>
                <span>{record.ttl}s</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {domainRenewalPreview && (
        <RenewalCheckoutPreview
          renewal={domainRenewalPreview}
          onClose={() => setDomainRenewalPreview(null)}
          onCheckout={createDomainRenewalCheckout}
        />
      )}
    </aside>
  ) : null;

  if (selectedDomain && domainPanelView === "dns") {
    return (
      <section className="domain-section">
        <DnsManagementPage
          domain={selectedDomain}
          manager={domainDnsManager}
          isLoading={isDomainDnsLoading}
          message={domainDnsMessage}
          recordsPreview={domainDnsPreview}
          busy={isDomainActionBusy}
          draft={domainDnsDraft}
          onDraftChange={setDomainDnsDraft}
          onBack={() => {
            setDomainPanelView("list");
            setDomainDnsPreview([]);
            setDomainDnsMessage("");
          }}
          onReload={() => loadDomainDnsManager(selectedDomain.id)}
          onSubmitAction={submitDomainDnsAction}
        />
      </section>
    );
  }

  if (selectedDomain && domainPanelView === "settings") {
    return (
      <section className="domain-section">
        {domainSettingsPanel}
      </section>
    );
  }

  return (
    <section className="domain-section">
      <div className="domain-order-grid">
        <article className="panel-card domain-search-panel">
          <div className="section-heading">
            <div>
              <h2>Search and Buy New Domain Name</h2>
            </div>
            {domainServiceStatus?.openSrs && (
              <span
                className={domainServiceStatus.openSrs.configured ? "service-status-pill live" : "service-status-pill pending"}
                title={domainServiceStatus.openSrs.message}
              >
                {domainServiceStatus.openSrs.state}
              </span>
            )}
          </div>
          <form className="search-row" onSubmit={handleDomainSearch}>
            <input
              type="search"
              placeholder="Search a domain, e.g. mybrand.com"
              value={domainQuery}
              onChange={(event) => setDomainQuery(event.target.value)}
            />
            <div
              className="extension-picker"
              onBlur={() => window.setTimeout(() => setIsDomainExtensionOpen(false), 120)}
            >
              <button
                aria-expanded={isDomainExtensionOpen}
                aria-haspopup="listbox"
                className="extension-picker-button"
                type="button"
                onClick={() => setIsDomainExtensionOpen((open) => !open)}
              >
                <span>{domainExtension}</span>
                <MenuIcon name="chevron-down" />
              </button>
              {isDomainExtensionOpen && (
                <div className="extension-picker-menu">
                  <input
                    aria-label="Search domain extension"
                    type="search"
                    placeholder="Search extension..."
                    value={domainExtensionFilter}
                    onChange={(event) => setDomainExtensionFilter(event.target.value)}
                  />
                  <div className="extension-picker-list" role="listbox">
                    {visibleDomainExtensions.length ? visibleDomainExtensions.map((extension) => (
                      <button
                        aria-selected={extension === domainExtension}
                        className={extension === domainExtension ? "extension-option active" : "extension-option"}
                        key={extension}
                        role="option"
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectDomainExtension(extension)}
                      >
                        <span>{extension}</span>
                        <span>{formatMoney(getDomainExtensionPrice(extension))}</span>
                      </button>
                    )) : (
                      <p className="extension-empty">No extension found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="primary-button" type="submit" disabled={isDomainSearching}>
              {isDomainSearching ? <LoadingIcon label="Searching domains" /> : "Search"}
            </button>
          </form>
          {domainLookupMessage && <p className="renewal-action-message">{domainLookupMessage}</p>}
          {!!domainResults.length && (
            <div className="domain-results">
              {domainResults.map((result) => (
                <article className="domain-result-row" key={result.domainName}>
                  <div>
                    <strong>{result.domainName}</strong>
                    <span className={result.available ? "status-pill" : "status-pill muted"}>{result.reason}</span>
                  </div>
                  <div className="domain-result-action">
                    <span>{formatMoney(result.price)}</span>
                    <button
                      className="secondary-button compact"
                      type="button"
                      disabled={!result.available}
                      onClick={() => addDomainToCart(result)}
                    >
                      Add
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!!domainCart.length && (
            <div className="domain-cart">
              <div className="domain-cart-header">
                <span>Domain Cart</span>
                <strong>{formatMoney(domainCart.reduce((total, item) => total + item.price, 0))}</strong>
              </div>
              {domainCart.map((item) => (
                <div className="domain-cart-item" key={item.domainName}>
                  <span>{item.domainName}</span>
                  <button className="ghost-button compact" type="button" onClick={() => removeDomainFromCart(item.domainName)}>Remove</button>
                </div>
              ))}
              <button className="primary-button" type="button" disabled={isDomainCheckingOut} onClick={checkoutDomains}>
                {isDomainCheckingOut ? <LoadingIcon label="Checking domains" /> : "Checkout Domains"}
              </button>
              {domainCheckoutMessage && <p className="renewal-action-message">{domainCheckoutMessage}</p>}
              {domainCheckoutPreview && <CheckoutPreviewCard preview={domainCheckoutPreview} onClose={() => setDomainCheckoutPreview(null)} />}
            </div>
          )}
        </article>

        <article className="panel-card domain-transfer-panel">
          <div className="section-heading">
            <div>
              <h2>Transfer an Existing Domain</h2>
            </div>
          </div>
          <form className="domain-transfer-form" onSubmit={createDomainTransferCheckout}>
            <input
              type="text"
              placeholder="example.com"
              aria-label="Domain to transfer"
              value={domainTransferName}
              onChange={(event) => setDomainTransferName(event.target.value)}
            />
            <button className="primary-button compact" type="submit" disabled={isDomainTransferBusy}>
              {isDomainTransferBusy ? <LoadingIcon label="Checking transfer" /> : "Transfer"}
            </button>
          </form>
          {domainTransferMessage && <p className="inline-status">{domainTransferMessage}</p>}
          {domainTransferPreview && <CheckoutPreviewCard preview={domainTransferPreview} onClose={() => setDomainTransferPreview(null)} />}
        </article>
      </div>

      <article className="panel-card domain-live-panel">
        <div className="domain-live-header">
          <div>
            <span className="status-pill blue">{isLoadingDomains ? <LoadingIcon label="Loading domains" /> : "Live domains"}</span>
            <h2>My Domain Names</h2>
          </div>
          <RefreshButton onClick={loadAccountDomains} />
        </div>
        <div className="search-row compact-search">
          <input
            type="search"
            placeholder="Filter my domains..."
            value={domainSearch}
            onChange={(event) => setDomainSearch(event.target.value)}
          />
        </div>
        {domainError && (
          <div className="dashboard-error-panel inline-error">
            <p>{domainError}</p>
            <IconActionButton label="Retry" onClick={loadAccountDomains} />
          </div>
        )}
        {!isLoadingDomains && !domainError && !filteredDomains.length && (
          <p className="empty-state">No domains found for this account.</p>
        )}
        {!!filteredDomains.length && domainPanelView === "list" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Whois Privacy</th>
                  <th>Domain Lock</th>
                  <th className="domain-actions-header"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredDomains.map((domain) => {
                  const canRenew = domain.canRenew ?? (!!domain.clientProductId && (domain.status === "completed" || domain.status === "expired"));
                  const canManage = domain.canManage ?? domain.status === "completed";
                  const canManageDns = Boolean(domain.dnsUrl) || canManage;
                  const privacyEnabled = domainPrivacyOverrides[domain.id] ?? domain.whoisPrivacyPurchased;
                  const privacyDisabled = !domain.whoisPrivacySupported || domain.status !== "completed" || domain.daysLeft < 0 || isDomainActionBusy;
                  const privacyLabel = !domain.whoisPrivacySupported
                    ? "Privacy N/A"
                    : privacyEnabled
                      ? "Privacy On"
                      : "Privacy Off";
                  const lockEnabled = domainLockOverrides[domain.id] ?? true;
                  const lockDisabled = domain.status !== "completed" || domain.daysLeft < 0 || isDomainActionBusy;
                  const showDomainInlineActionMessage = domainActionDomainId === domain.id && domainActionMessage;
                  return (
                    <React.Fragment key={domain.id}>
                      <tr>
                        <td>
                          <div className="domain-name-cell">
                            <span>{domain.domainName}</span>
                            <small>Expiration Date: {formatDate(domain.expirationDate)}{domain.daysLeft < 0 ? " - Expired" : ""}</small>
                          </div>
                        </td>
                        <td>
                          <span className={domain.status === "completed" ? "status-pill" : domain.status === "expired" ? "status-pill warning" : "status-pill muted"}>
                            {domain.registerStatus && domain.registerStatus !== "verified" ? domain.registerStatus : domain.status}
                          </span>
                        </td>
                        <td>
                          <button
                            aria-pressed={privacyEnabled}
                            className={domain.whoisPrivacySupported ? "domain-privacy-toggle" : "domain-privacy-toggle disabled"}
                            disabled={privacyDisabled}
                            title={privacyLabel}
                            type="button"
                            onClick={() => toggleDomainPrivacy(domain, !privacyEnabled)}
                          >
                            <span className="domain-privacy-knob" aria-hidden="true" />
                            <span>{privacyEnabled ? "PRIVACY ON" : domain.whoisPrivacySupported ? "PRIVACY OFF" : "PRIVACY N/A"}</span>
                          </button>
                        </td>
                        <td>
                          <button
                            aria-pressed={lockEnabled}
                            className="domain-privacy-toggle domain-lock-toggle"
                            disabled={lockDisabled}
                            title={lockEnabled ? "Domain Locked" : "Domain Unlocked"}
                            type="button"
                            onClick={() => toggleDomainLock(domain, !lockEnabled)}
                          >
                            <span className="domain-privacy-knob" aria-hidden="true" />
                            <span>{lockEnabled ? "LOCKED" : "UNLOCKED"}</span>
                          </button>
                        </td>
                        <td>
                          <div className="domain-table-actions">
                            {canRenew && (
                              <button
                                aria-label="Renew"
                                className="secondary-button compact domain-row-action-button"
                                disabled={isDomainActionBusy}
                                title="Renew"
                                type="button"
                                onClick={() => renewSelectedDomain(domain)}
                              >
                                <MenuIcon name="order" />
                              </button>
                            )}
                            {canManageDns && (
                              <button
                                className="secondary-button compact domain-row-action-button"
                                title="DNS Manager"
                                type="button"
                                onClick={() => openDomainDnsManager(domain)}
                              >
                                DNS
                              </button>
                            )}
                            {canManage && (
                              <button
                                className="secondary-button compact domain-row-action-button manage"
                                title="Manage"
                                type="button"
                                onClick={() => openDomainSettings(domain)}
                              >
                                Manage
                              </button>
                            )}
                            {!canManage && domain.transferActionLabel && (
                              <button
                                className="secondary-button compact domain-transfer-action"
                                type="button"
                                title={domain.transferActionUrl || domain.transferActionLabel}
                                onClick={() => {
                                  setSelectedDomain(domain);
                                  setDomainActionDomainId(domain.id);
                                  setDomainActionUrl("");
                                  setDomainActionMessage(`${domain.transferActionLabel}: ${domain.transferActionUrl || "legacy transfer action"}`);
                                }}
                              >
                                {domain.transferActionLabel}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {showDomainInlineActionMessage && (
                        <tr className="domain-inline-action-row">
                          <td colSpan={5}>
                            <div className="renewal-action-message action-message-with-link">
                              <span>{domainActionMessage}</span>
                              {domainActionUrl && (
                                <button
                                  className="primary-button compact success-link-button"
                                  disabled={isDomainActionBusy}
                                  type="button"
                                  onClick={createDomainPrivacyCheckout}
                                >
                                  {isDomainActionBusy ? <LoadingIcon label="Creating Whois Privacy checkout" /> : "Buy Whois Privacy"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {domainPanelView === "list" && domainRenewalCheckoutPreview && (
          <CheckoutPreviewCard preview={domainRenewalCheckoutPreview} onClose={() => setDomainRenewalCheckoutPreview(null)} />
        )}
        {domainPanelView === "list" && domainPrivacyCheckoutPreview && (
          <CheckoutPreviewCard preview={domainPrivacyCheckoutPreview} onClose={() => setDomainPrivacyCheckoutPreview(null)} />
        )}
        {selectedDomain && domainPanelView === "settings" && (
          <aside className="domain-settings-page">
            <div className="domain-settings-header">
              <button className="secondary-button compact" type="button" onClick={() => setDomainPanelView("list")}>
                <MenuIcon name="back" />
                Back to Domains
              </button>
              <span className="status-pill blue">Domain Settings</span>
            </div>
            <h3>{selectedDomain.domainName}</h3>
            <section className="domain-profile-block">
              <div className="billing-detail-header compact">
                <span className="status-pill blue">Domain Details</span>
                {isLoadingDomainProfile && <LoadingIcon label="Loading domain profile" />}
              </div>
              {domainProfileError && <p className="inline-status">{domainProfileError}</p>}
              <dl className="domain-detail-list">
                <div><dt>Domain Name</dt><dd>{selectedDomain.domainName}</dd></div>
                <div><dt>Expires</dt><dd>{formatDate(selectedDomain.expirationDate)}</dd></div>
                {renderNameserverDetailRow()}
                <div>
                  <dt>Auth Code</dt>
                  <dd>
                    <div className="domain-auth-code-action-row">
                      <button className="secondary-button compact" type="button" disabled={isDomainActionBusy} onClick={() => runDomainRegistrarAction("auth-code")}>
                        {isDomainActionBusy ? <LoadingIcon label="Sending auth code" /> : "Send Auth Code"}
                      </button>
                      {domainAuthCodeMessage && (
                        <div className="renewal-action-message domain-auth-code-message success">
                          {domainAuthCodeMessage}
                        </div>
                      )}
                    </div>
                  </dd>
                </div>
                <div><dt>Registrar Status</dt><dd>{selectedDomain.registerStatus || "N/A"}</dd></div>
                <div><dt>Grace Period</dt><dd>{selectedDomain.gracePeriodDays ?? 0} days</dd></div>
              </dl>
            </section>
            <section className="domain-profile-block">
              <div className="billing-detail-header compact">
                <span className="status-pill muted">Domain Contacts</span>
                {isLoadingDomainProfile && <LoadingIcon label="Loading domain profile" />}
              </div>
              <div className="domain-contact-tabs" role="tablist" aria-label="Domain contact tabs">
                {domainContactTabs.map(([tab, label]) => {
                  const contact = selectedDomainProfile?.[tab];
                  return (
                    <button
                      aria-selected={activeDomainContactTab === tab}
                      className={activeDomainContactTab === tab ? "tab active" : "tab"}
                      key={tab}
                      role="tab"
                      type="button"
                      onClick={() => selectDomainContactTab(tab)}
                    >
                      <MenuIcon name={tab === "registrant" ? "shield" : tab === "admin" ? "settings" : tab === "billing" ? "card" : "server"} />
                      <span>{label}</span>
                      <strong>{domainContactName(contact)}</strong>
                      <small>{contact?.email || "N/A"}</small>
                      <small>{domainContactAddress(contact)}</small>
                      <small>{domainContactPhone(contact)}</small>
                    </button>
                  );
                })}
              </div>
            </section>
            <div className="domain-quick-actions hidden-domain-actions" aria-label="Domain quick actions">
              {[
                ["status", "Status"],
                ["auth-code", "Auth Code"],
                ["auto-renew-on", "Auto Renew On"],
                ["auto-renew-off", "Auto Renew Off"]
              ].map(([action, label]) => (
                <button
                  className={domainRegistrarForm.action === action ? "secondary-button compact active" : "secondary-button compact"}
                  key={action}
                  type="button"
                  onClick={() => selectDomainRegistrarAction(action)}
                >
                  {label}
                </button>
              ))}
            </div>
            <form className="domain-action-form" onSubmit={submitDomainRegistrarAction}>
              <input type="hidden" value={domainRegistrarForm.action} readOnly />
              <div className="billing-detail-header compact">
                <span className="status-pill blue">Edit {domainContactTabs.find(([tab]) => tab === activeDomainContactTab)?.[1] ?? "Contact"}</span>
              </div>
              {renderDomainRegistrarFields()}
              {domainActionMessage && (
                <div className={
                  domainActionMessage.toLowerCase().includes("completed successfully")
                    ? "renewal-action-message domain-contact-save-message success"
                    : "renewal-action-message domain-contact-save-message"
                }>
                  <span>{domainActionMessage}</span>
                  {domainActionUrl && (
                    <button
                      className="primary-button compact success-link-button"
                      disabled={isDomainActionBusy}
                      type="button"
                      onClick={createDomainPrivacyCheckout}
                    >
                      {isDomainActionBusy ? <LoadingIcon label="Creating Whois Privacy checkout" /> : "Buy Whois Privacy"}
                    </button>
                  )}
                </div>
              )}
              <button className="primary-button compact" type="submit" disabled={isDomainActionBusy || domainRegistrarForm.action !== "contact"}>
                {isDomainActionBusy ? <LoadingIcon label="Saving domain contact" /> : "Save Contact"}
              </button>
            </form>
            {domainPrivacyCheckoutPreview && (
              <CheckoutPreviewCard preview={domainPrivacyCheckoutPreview} onClose={() => setDomainPrivacyCheckoutPreview(null)} />
            )}
            {domainRenewalCheckoutPreview && (
              <CheckoutPreviewCard preview={domainRenewalCheckoutPreview} onClose={() => setDomainRenewalCheckoutPreview(null)} />
            )}
            {domainDnsPreview.length > 0 && (
              <div className="domain-dns-preview">
                <span>DNS Preview</span>
                <div className="domain-dns-preview-grid">
                  {domainDnsPreview.map((record, index) => (
                    <div className="domain-dns-preview-row" key={`${record.type}-${record.name}-${index}`}>
                      <span className="domain-dns-type">{record.type}</span>
                      <span>{record.name}</span>
                      <span>{record.value}</span>
                      <span>{record.priority ?? "-"}</span>
                      <span>{record.ttl}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {domainRenewalPreview && (
              <RenewalCheckoutPreview
                renewal={domainRenewalPreview}
                onClose={() => setDomainRenewalPreview(null)}
                onCheckout={createDomainRenewalCheckout}
              />
            )}
          </aside>
        )}
      </article>
      <KnowledgeBaseCard title="Domain Guides" articles={domainKbArticles} />
    </section>
  );
}

function VpnSection() {
  const [vpn, setVpn] = useState(null);
  const [isLoadingVpn, setIsLoadingVpn] = useState(true);
  const [vpnError, setVpnError] = useState("");
  const [selectedVpn, setSelectedVpn] = useState(null);
  const [vpnCheckoutPreview, setVpnCheckoutPreview] = useState(null);
  const [vpnSelection, setVpnSelection] = useState({});
  const [vpnCheckoutMessage, setVpnCheckoutMessage] = useState("");
  const [isVpnCheckingOut, setIsVpnCheckingOut] = useState(false);
  const [vpnUserForm, setVpnUserForm] = useState({
    user: "",
    password: "",
    type: "IKEv2",
    area: "US"
  });
  const [vpnActionMessage, setVpnActionMessage] = useState("");
  const [isVpnActionBusy, setIsVpnActionBusy] = useState(false);

  async function loadVpn() {
    setIsLoadingVpn(true);
    setVpnError("");
    try {
      const response = await fetch("/api/account/vpn");
      const result = await response.json();
      if (!response.ok || !result.success) {
        setVpnError(result?.message ?? "Unable to load VPN services.");
        return;
      }

      setVpn(result.dashboard);
    } catch {
      setVpnError("Unable to reach VPN service.");
    } finally {
      setIsLoadingVpn(false);
    }
  }

  useEffect(() => {
    loadVpn();
  }, []);

  const used = vpn?.used ?? 0;
  const quota = vpn?.quota ?? 0;
  const quotaLabel = quota > 0 ? `${used} of ${quota} users` : `${used} active users`;
  const quotaPercent = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const services = vpn?.services ?? [];
  const vpnCatalog = vpn?.catalog ?? [];
  const selectedVpnProduct = vpnCatalog.find((product) => product.productId === Number(vpnSelection.productId)) ?? vpnCatalog[0];
  const selectedVpnPrice = selectedVpnProduct?.prices?.find((price) => price.priceId === Number(vpnSelection.priceId)) ?? selectedVpnProduct?.prices?.[0];

  async function checkoutVpn() {
    if (!selectedVpnProduct || !selectedVpnPrice) {
      setVpnCheckoutMessage("No VPN product is available for checkout.");
      return;
    }

    setIsVpnCheckingOut(true);
    setVpnCheckoutMessage("");
    setVpnCheckoutPreview(null);

    try {
      const response = await fetch("/api/account/vpn/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedVpnProduct.productId,
          priceId: selectedVpnPrice.priceId,
          quantity: Number(vpnSelection.quantity) || 1
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setVpnCheckoutMessage(result?.message ?? "Unable to create VPN checkout.");
        return;
      }

      if (goToCheckoutOrder(result.order)) return;
      setVpnCheckoutPreview(toCheckoutPreview(result.order, Number(vpnSelection.quantity) || 1));
      setVpnCheckoutMessage(result.message);
    } catch {
      setVpnCheckoutMessage("Unable to reach VPN checkout service.");
    } finally {
      setIsVpnCheckingOut(false);
    }
  }

  async function createVpnUser(event) {
    event.preventDefault();
    setIsVpnActionBusy(true);
    setVpnActionMessage("");

    try {
      const response = await fetch("/api/account/vpn/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vpnUserForm)
      });
      const result = await response.json().catch(() => null);
      setVpnActionMessage(result?.message ?? "Unable to prepare VPN user.");
    } catch {
      setVpnActionMessage("Unable to reach VPN user service.");
    } finally {
      setIsVpnActionBusy(false);
    }
  }

  async function runVpnUserAction(action) {
    if (!selectedVpn?.vpnClientId) return;
    setIsVpnActionBusy(true);
    setVpnActionMessage("");

    try {
      const response = await fetch(`/api/account/vpn/users/${selectedVpn.vpnClientId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const result = await response.json().catch(() => null);
      setVpnActionMessage(result?.message ?? "Unable to prepare VPN action.");
    } catch {
      setVpnActionMessage("Unable to reach VPN action service.");
    } finally {
      setIsVpnActionBusy(false);
    }
  }

  return (
    <section className="vpn-section">
      {isLoadingVpn && <LoadingState label="Loading VPN services" />}
      {vpnError && (
        <div className="dashboard-error-panel inline-error">
          <p>{vpnError}</p>
          <IconActionButton label="Retry" onClick={loadVpn} />
        </div>
      )}

      {!isLoadingVpn && !vpnError && !services.length && (
        <article className="panel-card empty-panel">
          <p>No VPN services found for this account.</p>
        </article>
      )}

      {!!services.length && (
        <section className="card-grid">
          {services.map((service) => (
            <article className="service-card" key={service.vpnClientId}>
              <span className={service.status === "Online" ? "status-pill" : "status-pill muted"}>{service.status}</span>
              <h2>{service.user || "VPN User"}</h2>
              <p>{service.host}</p>
              <dl className="card-meta">
                <div><dt>Type</dt><dd>{service.type || "VPN"}</dd></div>
                <div><dt>Location</dt><dd>{[service.area, service.dataCenter].filter(Boolean).join(" · ") || "Not assigned"}</dd></div>
              </dl>
              <button className="secondary-button" type="button" onClick={() => setSelectedVpn(service)}>Manage</button>
            </article>
          ))}
        </section>
      )}

      {selectedVpn && (
        <aside className="billing-detail-card">
          <div className="billing-detail-header">
            <span className="status-pill blue">VPN User</span>
            <button className="ghost-button compact" type="button" onClick={() => setSelectedVpn(null)}>Close</button>
          </div>
          <h3>{selectedVpn.user || "VPN User"}</h3>
          <dl className="card-meta single">
            <div><dt>VPN Client ID</dt><dd>{selectedVpn.vpnClientId}</dd></div>
            <div><dt>Type</dt><dd>{selectedVpn.type || "VPN"}</dd></div>
            <div><dt>Host</dt><dd>{selectedVpn.host}</dd></div>
            <div><dt>Location</dt><dd>{[selectedVpn.area, selectedVpn.dataCenter].filter(Boolean).join(" · ") || "Not assigned"}</dd></div>
            <div><dt>Status</dt><dd>{selectedVpn.status}</dd></div>
          </dl>
          <div className="vpn-user-actions">
            <button className="secondary-button compact" type="button" disabled={isVpnActionBusy} onClick={() => runVpnUserAction("openvpn")}>OpenVPN</button>
            <button className="secondary-button compact" type="button" disabled={isVpnActionBusy} onClick={() => runVpnUserAction("download-config")}>Config</button>
            <button className="secondary-button compact" type="button" disabled={isVpnActionBusy} onClick={() => runVpnUserAction("reset-password")}>Reset Password</button>
            <button className="secondary-button compact danger-button" type="button" disabled={isVpnActionBusy} onClick={() => runVpnUserAction("delete")}>Delete</button>
          </div>
        </aside>
      )}

      {!!services.length && (
        <article className="panel-card vpn-user-card">
          <div className="billing-header">
            <div>
              <span className="status-pill blue">User</span>
              <h2>Create VPN User</h2>
            </div>
          </div>
          <form className="vpn-user-form" onSubmit={createVpnUser}>
            <label>
              Username
              <input
                type="text"
                value={vpnUserForm.user}
                onChange={(event) => setVpnUserForm((form) => ({ ...form, user: event.target.value }))}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={vpnUserForm.password}
                onChange={(event) => setVpnUserForm((form) => ({ ...form, password: event.target.value }))}
              />
            </label>
            <label>
              Type
              <select
                className="inline-select"
                value={vpnUserForm.type}
                onChange={(event) => setVpnUserForm((form) => ({ ...form, type: event.target.value }))}
              >
                <option value="IKEv2">IKEv2</option>
                <option value="OpenVPN">OpenVPN</option>
              </select>
            </label>
            <label>
              Location
              <select
                className="inline-select"
                value={vpnUserForm.area}
                onChange={(event) => setVpnUserForm((form) => ({ ...form, area: event.target.value }))}
              >
                <option value="US">US</option>
                <option value="EU">EU</option>
                <option value="Asia">Asia</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit" disabled={isVpnActionBusy}>
              {isVpnActionBusy ? "Preparing..." : "Create User"}
            </button>
          </form>
        </article>
      )}

      <div className="vpn-purchase-grid">
        <article className="service-card purchase-card vpn-purchase-card">
          <div className="vpn-purchase-title">
            <h2>Buy VPN Services</h2>
            <span>as low as $1/month!</span>
          </div>
          <p>Reserve additional VPN seats for remote access.</p>
          {vpnCatalog.length ? (
            <div className="vpn-buy-form">
              <label>
                Product
                <select
                  className="inline-select"
                  value={selectedVpnProduct?.productId ?? ""}
                  onChange={(event) => setVpnSelection({ productId: Number(event.target.value), quantity: vpnSelection.quantity ?? 1 })}
                >
                  {vpnCatalog.map((product) => (
                    <option key={product.productId} value={product.productId}>{product.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Billing
                <select
                  className="inline-select"
                  value={selectedVpnPrice?.priceId ?? ""}
                  onChange={(event) => setVpnSelection((selection) => ({ ...selection, priceId: Number(event.target.value) }))}
                >
                  {(selectedVpnProduct?.prices ?? []).map((price) => (
                    <option key={price.priceId} value={price.priceId}>
                      {formatVpnPriceOption(price)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Qty
                <input
                  className="qty-input"
                  type="number"
                  min="1"
                  max="99"
                  value={vpnSelection.quantity ?? 1}
                  onChange={(event) => setVpnSelection((selection) => ({ ...selection, quantity: event.target.value }))}
                />
              </label>
            </div>
          ) : (
            <strong>No VPN products available</strong>
          )}
          <button
            className="primary-button compact vpn-buy-button"
            type="button"
            disabled={isVpnCheckingOut || !vpnCatalog.length}
            onClick={checkoutVpn}
          >
            {isVpnCheckingOut ? <LoadingIcon label="Creating VPN checkout" /> : "Buy VPN"}
          </button>
        </article>

        <KnowledgeBaseCard title="VPN Setup Guides" articles={vpnKbArticles} />
      </div>
      {vpnActionMessage && <p className="renewal-action-message">{vpnActionMessage}</p>}
      {vpnCheckoutMessage && <p className="renewal-action-message">{vpnCheckoutMessage}</p>}
      {vpnCheckoutPreview && <CheckoutPreviewCard preview={vpnCheckoutPreview} onClose={() => setVpnCheckoutPreview(null)} />}
    </section>
  );
}

function AddonSection() {
  const [addonDashboard, setAddonDashboard] = useState(null);
  const [activeCategory, setActiveCategory] = useState("SSL");
  const [addonSearch, setAddonSearch] = useState("");
  const [addonSelections, setAddonSelections] = useState({});
  const [addonCheckoutPreview, setAddonCheckoutPreview] = useState(null);
  const [addonCheckoutMessage, setAddonCheckoutMessage] = useState("");
  const [isAddonCheckingOut, setIsAddonCheckingOut] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [addonRenewalPreview, setAddonRenewalPreview] = useState(null);
  const [addonActionMessage, setAddonActionMessage] = useState("");
  const [isAddonActionBusy, setIsAddonActionBusy] = useState(false);
  const [isLoadingAddons, setIsLoadingAddons] = useState(true);
  const [addonError, setAddonError] = useState("");

  async function loadAddons() {
    setIsLoadingAddons(true);
    setAddonError("");
    try {
      const response = await fetch("/api/account/addons");
      const result = await response.json();
      if (!response.ok || !result.success) {
        setAddonError(result?.message ?? "Unable to load add-ons.");
        return;
      }

      setAddonDashboard(result.dashboard);
    } catch {
      setAddonError("Unable to reach add-on service.");
    } finally {
      setIsLoadingAddons(false);
    }
  }

  useEffect(() => {
    loadAddons();
  }, []);

  const catalog = addonDashboard?.catalog ?? [];
  const activeAddons = addonDashboard?.activeAddons ?? [];
  const addonHostingAccounts = addonDashboard?.hostingAccounts ?? [];
  const categories = ["All", ...Array.from(new Set(catalog.map((product) => product.category))).sort()];
  const visibleCatalog = catalog.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const search = addonSearch.trim().toLowerCase();
    const matchesSearch = !search || `${product.name} ${product.description}`.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  function getAddonSelection(addon) {
    const selected = addonSelections[addon.productId] ?? {};
    return {
      priceId: selected.priceId ?? addon.prices[0]?.priceId,
      quantity: selected.quantity ?? 1,
      cpId: selected.cpId ?? addonHostingAccounts[0]?.cpId ?? ""
    };
  }

  function updateAddonSelection(productId, patch) {
    setAddonSelections((selections) => ({
      ...selections,
      [productId]: {
        ...(selections[productId] ?? {}),
        ...patch
      }
    }));
  }

  async function checkoutAddon(addon) {
    const selection = getAddonSelection(addon);
    const price = addon.prices.find((item) => item.priceId === Number(selection.priceId)) ?? addon.prices[0];
    if (!price) return;
    const quantity = Math.max(1, Math.min(99, Number(selection.quantity) || 1));
    const cpId = Number(selection.cpId) || 0;
    setIsAddonCheckingOut(true);
    setAddonCheckoutMessage("");
    setAddonCheckoutPreview(null);

    try {
      const response = await fetch("/api/account/addons/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ productId: addon.productId, priceId: price.priceId, quantity, cpId }] })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setAddonCheckoutMessage(result?.message ?? "Unable to create add-on checkout.");
        return;
      }

      if (goToCheckoutOrder(result.order)) return;
      setAddonCheckoutPreview(toCheckoutPreview(result.order, 1));
      setAddonCheckoutMessage(result.message);
    } catch {
      setAddonCheckoutMessage("Unable to reach add-on checkout service.");
    } finally {
      setIsAddonCheckingOut(false);
    }
  }

  async function renewSelectedAddon() {
    if (!selectedAddon?.clientProductId) return;
    setIsAddonActionBusy(true);
    setAddonActionMessage("");
    setAddonRenewalPreview(null);

    try {
      const response = await fetch(`/api/account/renewals/${selectedAddon.clientProductId}/renew`, { method: "POST" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setAddonActionMessage(result?.message ?? "Unable to prepare add-on renewal.");
        return;
      }

      setAddonRenewalPreview(result.renewal);
      setAddonActionMessage(result.message);
    } catch {
      setAddonActionMessage("Unable to reach add-on renewal service.");
    } finally {
      setIsAddonActionBusy(false);
    }
  }

  async function createAddonRenewalCheckout(renewal) {
    const response = await fetch(`/api/account/renewals/${renewal.clientProductId}/checkout`, { method: "POST" });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.message ?? "Unable to create add-on renewal checkout.");
    }

    return result.order;
  }

  function findMatchingAddons(addon) {
    const category = addon.productType || "All";
    setActiveCategory(categories.includes(category) ? category : "All");
    setAddonSearch(addon.name.split(/\s+/).slice(0, 2).join(" "));
    setSelectedAddon(null);
    setAddonActionMessage("");
  }

  return (
    <section className="addon-section">
      <article className="panel-card addon-catalog-panel">
        <div className="search-row compact-search">
          <input
            type="search"
            placeholder="Search SSL, backup, database, RAM..."
            value={addonSearch}
            onChange={(event) => setAddonSearch(event.target.value)}
          />
        </div>
        {!!categories.length && (
          <div className="addon-category-tabs" role="tablist" aria-label="Add-on categories">
            {categories.map((category) => (
              <button
                aria-selected={category === activeCategory}
                className={category === activeCategory ? "tab active" : "tab"}
                key={category}
                role="tab"
                type="button"
                onClick={() => setActiveCategory(category)}
              >
                <MenuIcon name={addonCategoryIcon(category)} />
                <span>{category}</span>
              </button>
            ))}
          </div>
        )}
        {isLoadingAddons && <LoadingState label="Loading add-on catalog" />}
        {addonError && (
          <div className="dashboard-error-panel inline-error">
            <p>{addonError}</p>
            <IconActionButton label="Retry" onClick={loadAddons} />
          </div>
        )}
        {!isLoadingAddons && !addonError && !visibleCatalog.length && (
          <p className="empty-state">No add-ons found.</p>
        )}
        {!!visibleCatalog.length && (
          <DataTable
            columns={["Product Name", "Description", "Billing Terms", "Apply To", "Qty", "Action"]}
            rows={visibleCatalog.map((addon) => {
              const selection = getAddonSelection(addon);
              return [
                <span className="addon-product-name">{addon.name}</span>,
                addon.description,
                <select
                  className="inline-select"
                  aria-label={`${addon.name} billing term`}
                  value={selection.priceId ?? ""}
                  onChange={(event) => updateAddonSelection(addon.productId, { priceId: Number(event.target.value) })}
                >
                  {addon.prices.length ? addon.prices.map((price) => (
                    <option key={price.priceId} value={price.priceId}>
                      {formatPaymentTerm(price.paymentTerm)} {formatMoney(price.amount, price.currency)}
                    </option>
                  )) : <option value="">No price available</option>}
                </select>,
                <select
                  className="inline-select"
                  aria-label={`${addon.name} target hosting account`}
                  value={selection.cpId}
                  onChange={(event) => updateAddonSelection(addon.productId, { cpId: event.target.value })}
                >
                  <option value="">No hosting target</option>
                  {addonHostingAccounts.map((account) => (
                    <option key={account.cpId} value={account.cpId}>
                      {account.cpLogin || account.primaryDomain || `CP ${account.cpId}`}
                    </option>
                  ))}
                </select>,
                <input
                  className="qty-input"
                  type="number"
                  min="1"
                  max="99"
                  value={selection.quantity}
                  aria-label={`${addon.name} quantity`}
                  onChange={(event) => updateAddonSelection(addon.productId, { quantity: event.target.value })}
                />,
                <button
                  aria-label={`Buy ${addon.name}`}
                  className="secondary-button compact icon-only-button"
                  disabled={isAddonCheckingOut}
                  title={`Buy ${addon.name}`}
                  type="button"
                  onClick={() => checkoutAddon(addon)}
                >
                  {isAddonCheckingOut ? <LoadingIcon label="Creating add-on checkout" /> : "+"}
                </button>
              ];
            })}
          />
        )}
        {addonCheckoutMessage && <p className="renewal-action-message">{addonCheckoutMessage}</p>}
        {addonCheckoutPreview && <CheckoutPreviewCard preview={addonCheckoutPreview} onClose={() => setAddonCheckoutPreview(null)} />}
      </article>

      <article className="panel-card addon-active-panel">
        <div className="billing-header">
          <div>
            <span className="status-pill">Current</span>
            <h2>My Active Add-Ons</h2>
          </div>
          <span className="muted-count">{activeAddons.length} items</span>
        </div>
        {isLoadingAddons && <LoadingState label="Loading active add-ons" />}
        {!isLoadingAddons && !activeAddons.length && <p className="empty-state">No active add-ons found for this account.</p>}
        {!!activeAddons.length && (
          <DataTable
            columns={["Product", "Status", "Due Date", "Term", "Amount", "Action"]}
            rows={activeAddons.map((addon) => [
              addon.name,
              <span className={addon.status === "Active" ? "status-pill" : "status-pill muted"}>{addon.status}</span>,
              formatDate(addon.nextDueDate),
              addon.paymentTerm || "N/A",
              formatMoney(addon.amount),
              <button className="secondary-button compact" type="button" onClick={() => setSelectedAddon(addon)}>Manage</button>
            ])}
          />
        )}
        {selectedAddon && (
          <aside className="billing-detail-card">
            <div className="billing-detail-header">
              <span className="status-pill blue">Add-On</span>
              <button className="ghost-button compact" type="button" onClick={() => setSelectedAddon(null)}>Close</button>
            </div>
            <h3>{selectedAddon.name}</h3>
            <dl className="card-meta single">
              <div><dt>Client Product ID</dt><dd>{selectedAddon.clientProductId}</dd></div>
              <div><dt>Product ID</dt><dd>{selectedAddon.productId}</dd></div>
              <div><dt>Description</dt><dd>{selectedAddon.description}</dd></div>
              <div><dt>Status</dt><dd>{selectedAddon.status}</dd></div>
              <div><dt>Next Due Date</dt><dd>{formatDate(selectedAddon.nextDueDate)}</dd></div>
              <div><dt>Payment Term</dt><dd>{selectedAddon.paymentTerm || "N/A"}</dd></div>
              <div><dt>Amount</dt><dd>{formatMoney(selectedAddon.amount)}</dd></div>
            </dl>
            <div className="billing-action-row">
              <button className="primary-button" type="button" disabled={isAddonActionBusy} onClick={renewSelectedAddon}>
                {isAddonActionBusy ? <LoadingIcon label="Checking add-on renewal" /> : "Renew Add-On"}
              </button>
              <button className="secondary-button" type="button" onClick={() => findMatchingAddons(selectedAddon)}>
                Find Matching Add-Ons
              </button>
            </div>
            {addonActionMessage && <p className="renewal-action-message">{addonActionMessage}</p>}
            {addonRenewalPreview && (
              <RenewalCheckoutPreview
                renewal={addonRenewalPreview}
                onClose={() => setAddonRenewalPreview(null)}
                onCheckout={createAddonRenewalCheckout}
              />
            )}
          </aside>
        )}
      </article>
    </section>
  );
}

function addonCategoryIcon(category) {
  const normalized = String(category || "").toLowerCase();
  if (normalized.includes("ssl")) return "ssl";
  if (normalized.includes("backup")) return "backup";
  if (normalized.includes("database") || normalized.includes("sql")) return "database";
  if (normalized.includes("ram") || normalized.includes("memory")) return "server";
  if (normalized.includes("domain")) return "globe";
  if (normalized.includes("email") || normalized.includes("mail")) return "mail";
  if (normalized.includes("security")) return "shield";
  if (normalized.includes("all")) return "cards";
  return "plus";
}

function BillingSection({ currentUser, onChangeSection }) {
  const billingTabsLive = [
    ["purchases", "My Purchases", "invoice"],
    ["active", "Current Active Products", "checklist"],
    ["balance", "Account Balance", "card"],
    ["renewal", "Renewal Notice", "warning"]
  ];
  const [activeTab, setActiveTab] = useState("purchases");
  const [billing, setBilling] = useState(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(true);
  const [billingError, setBillingError] = useState("");
  const [purchaseDates, setPurchaseDates] = useState(() => {
    const now = new Date();
    return {
      start: formatDateForInput(addYears(now, -1)),
      end: formatDateForInput(addYears(now, 1))
    };
  });

  async function loadBilling() {
    setIsLoadingBilling(true);
    setBillingError("");
    try {
      const params = new URLSearchParams();
      params.set("mode", activeTab);
      if (purchaseDates.start) params.set("purchaseStart", purchaseDates.start);
      if (purchaseDates.end) params.set("purchaseEnd", purchaseDates.end);
      const response = await fetch(`/api/account/billing?${params.toString()}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        setBillingError(result?.message ?? "Unable to load billing.");
        return;
      }

      setBilling(result.dashboard);
    } catch {
      setBillingError("Unable to reach billing service.");
    } finally {
      setIsLoadingBilling(false);
    }
  }

  useEffect(() => {
    loadBilling();
  }, [activeTab]);

  function updatePurchaseDate(field, value) {
    setPurchaseDates((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="panel-card billing-panel">
      <div className="tabs" role="tablist" aria-label="Billing tabs">
        {billingTabsLive.map(([id, label, icon]) => (
          <button
            aria-selected={id === activeTab}
            className={id === activeTab ? "tab active" : "tab"}
            key={id}
            role="tab"
            type="button"
            onClick={() => setActiveTab(id)}
          >
            <MenuIcon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {isLoadingBilling && <LoadingState label="Loading billing data" />}
      {billingError && (
        <div className="dashboard-error-panel inline-error">
          <p>{billingError}</p>
          <IconActionButton label="Retry" onClick={loadBilling} />
        </div>
      )}
      {!isLoadingBilling && !billingError && (
        <BillingTabPanel
          activeTab={activeTab}
          billing={billing}
          currentUser={currentUser}
          onReloadBilling={loadBilling}
          purchaseDates={purchaseDates}
          onPurchaseDateChange={updatePurchaseDate}
        />
      )}
    </section>
  );
}

function BillingTabPanel({ activeTab, billing, currentUser, onReloadBilling, purchaseDates, onPurchaseDateChange }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [renewalCatalog, setRenewalCatalog] = useState(null);
  const [renewalPreview, setRenewalPreview] = useState(null);
  const [selectedRenewalCheckoutPreview, setSelectedRenewalCheckoutPreview] = useState(null);
  const [renewalMessage, setRenewalMessage] = useState("");
  const [renewalBusyId, setRenewalBusyId] = useState(null);
  const [isRenewalPageLoading, setIsRenewalPageLoading] = useState(false);
  const [balanceActionMessage, setBalanceActionMessage] = useState("");
  const [depositAmount, setDepositAmount] = useState("25.00");
  const [balanceCheckoutPreview, setBalanceCheckoutPreview] = useState(null);
  const [isBalanceActionBusy, setIsBalanceActionBusy] = useState(false);
  const [productActionMessage, setProductActionMessage] = useState("");
  const [selectedRenewalIds, setSelectedRenewalIds] = useState([]);
  const creditTransactions = billing?.creditTransactions ?? [];

  async function openProductRenewPage(product) {
    setSelectedProduct(product);
    setRenewalCatalog(null);
    setRenewalPreview(null);
    setRenewalMessage("");
    setIsRenewalPageLoading(true);

    try {
      const response = await fetch(`/api/account/renewals/${product.clientProductId}/options`);
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setRenewalMessage(result?.message ?? "Unable to load renewal payment terms.");
        return;
      }

      setRenewalCatalog(result.catalog);
    } catch {
      setRenewalMessage("Unable to reach renewal payment term service.");
    } finally {
      setIsRenewalPageLoading(false);
    }
  }

  async function runRenewalAction(product, action) {
    setRenewalBusyId(`${action}-${product.clientProductId}`);
    setRenewalMessage("");
    setSelectedRenewalCheckoutPreview(null);

    try {
      const response = await fetch(`/api/account/renewals/${product.clientProductId}/${action}`, { method: "POST" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setRenewalMessage(result?.message ?? `Unable to ${action} renewal.`);
        return;
      }

      if (action === "renew") {
        setRenewalPreview(result.renewal);
        setRenewalMessage(result.message);
      } else {
        setRenewalPreview(null);
        setRenewalMessage(result.message);
        await onReloadBilling();
      }
    } catch {
      setRenewalMessage(`Unable to reach the renewal ${action} service.`);
    } finally {
      setRenewalBusyId(null);
    }
  }

  async function createBillingRenewalCheckout(renewal) {
    const response = await fetch(`/api/account/renewals/${renewal.clientProductId}/checkout`, { method: "POST" });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.message ?? "Unable to create renewal checkout.");
    }

    return result.order;
  }

  async function createProductRenewalCheckout(option) {
    if (!renewalCatalog) return;
    setRenewalBusyId(`product-renew-${renewalCatalog.product.clientProductId}`);
    setRenewalMessage("");

    try {
      const response = await fetch(`/api/account/renewals/${renewalCatalog.product.clientProductId}/checkout-option`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentTerm: option.paymentTerm, currency: option.currency })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setRenewalMessage(result?.message ?? "Unable to create renewal checkout.");
        return;
      }

      if (goToCheckoutOrder(result.order)) return;
      setRenewalMessage("Renewal checkout order created.");
    } catch {
      setRenewalMessage("Unable to reach renewal checkout service.");
    } finally {
      setRenewalBusyId(null);
    }
  }

  async function createDepositCheckout() {
    setIsBalanceActionBusy(true);
    setBalanceActionMessage("");
    setBalanceCheckoutPreview(null);

    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setBalanceActionMessage("Please enter a deposit amount greater than $0.");
      setIsBalanceActionBusy(false);
      return;
    }

    const brandName = billing?.balance?.brandName || "smarterasp.net";
    const depositUrl = `https://member5.smarterasp.net/checkout_standalone/deposit?username=${encodeURIComponent(currentUser?.login ?? "")}&amount=${encodeURIComponent(amount.toFixed(2))}&brandname=${encodeURIComponent(brandName)}`;
    const popup = openCenteredPopup(depositUrl, "AccountDeposit");
    if (!popup) {
      setBalanceActionMessage("Your browser blocked the deposit popup. Allow popups for this site, then try again.");
      setIsBalanceActionBusy(false);
      return;
    }

    setBalanceActionMessage("Deposit popup opened. Account balance will refresh when it closes.");
    if (window.focus) popup.focus();

    const popupTimer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(popupTimer);
        setIsBalanceActionBusy(false);
        setBalanceActionMessage("Deposit popup closed. Refreshing account balance.");
        onReloadBilling();
      }
    }, 1000);
  }

  function toggleRenewalSelection(clientProductId) {
    setSelectedRenewalIds((selected) =>
      selected.includes(clientProductId)
        ? selected.filter((id) => id !== clientProductId)
        : [...selected, clientProductId]
    );
  }

  function toggleAllRenewals(renewals) {
    const renewalIds = renewals.map((product) => product.clientProductId);
    setSelectedRenewalIds((selected) =>
      renewalIds.every((id) => selected.includes(id)) ? [] : renewalIds
    );
  }

  async function createSelectedRenewalCheckout() {
    if (!selectedRenewalIds.length) return;
    setRenewalBusyId("many");
    setRenewalMessage("");
    setRenewalPreview(null);
    setSelectedRenewalCheckoutPreview(null);

    try {
      const response = await fetch("/api/account/renewals/checkout-many", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientProductIds: selectedRenewalIds })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setRenewalMessage(result?.message ?? "Unable to create selected renewal checkout.");
        return;
      }

      setRenewalMessage(result.message);
      if (goToCheckoutOrder(result.order)) return;
      setSelectedRenewalCheckoutPreview(toCheckoutPreview(result.order, selectedRenewalIds.length));
    } catch {
      setRenewalMessage("Unable to reach selected renewal checkout service.");
    } finally {
      setRenewalBusyId(null);
    }
  }

  function getProductManageTarget(product) {
    const text = `${product.name ?? ""} ${product.description ?? ""} ${product.productType ?? ""}`.toLowerCase();
    if (text.includes("domain")) return "domain";
    if (text.includes("vpn")) return "vpn";
    if (text.includes("ssl") || text.includes("addon") || text.includes("add-on") || text.includes("backup") || text.includes("ram") || text.includes("quota")) return "addon";
    if (text.includes("hosting") || text.startsWith("w") || text.includes("asp.net")) return "hosting";
    return "new-order";
  }

  function manageProduct(product) {
    const target = getProductManageTarget(product);
    setSelectedProduct(null);
    setProductActionMessage("");
    onChangeSection?.(target);
  }

  if (activeTab === "balance") {
    return (
      <div className="billing-balance-layout">
        <div className="billing-balance-card">
          <span>Available Balance</span>
          <strong>{formatMoney(billing?.balance?.amount, billing?.balance?.currency)}</strong>
          <p>{billing?.balance?.source}</p>
        </div>
        <div className="billing-action-card">
          <h3>Add Funds</h3>
          <p>Deposit money into the account balance before planned purchases.</p>
          <div className="balance-action-grid">
            <label>
              Deposit Amount
              <input type="number" min="1" step="0.01" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} />
            </label>
            <button className="primary-button" type="button" disabled={isBalanceActionBusy} onClick={createDepositCheckout}>
              {isBalanceActionBusy ? <LoadingIcon label="Checking balance deposit" /> : "Deposit Money"}
            </button>
          </div>
          {balanceActionMessage && <p className="renewal-action-message">{balanceActionMessage}</p>}
          {balanceCheckoutPreview && <CheckoutPreviewCard preview={balanceCheckoutPreview} onClose={() => setBalanceCheckoutPreview(null)} />}
        </div>
        <div className="billing-action-card alternate-deposit-card">
          <h3>Other Deposit Methods</h3>
          <p>For bank transfer, USDT, or other manual deposits, send the payment details to helpdesk after payment so support can credit the account.</p>
          <div className="alternate-deposit-grid">
            <section>
              <span>Bank Transfer</span>
              <dl>
                <div><dt>Account Name</dt><dd>Smarterasp Limited</dd></div>
                <div><dt>Account No.</dt><dd>862019599099</dd></div>
                <div><dt>Bank</dt><dd>ZA Bank Limited</dd></div>
                <div><dt>SWIFT</dt><dd>AABLHKHH</dd></div>
                <div><dt>Bank Code</dt><dd>387</dd></div>
                <div><dt>Branch No.</dt><dd>747</dd></div>
              </dl>
              <p className="wire-fee-note">
                <span>Bank wire processing fee</span>
                <strong>$45</strong>
                <em>Include the fee with the transfer.</em>
              </p>
            </section>
            <section>
              <span>USDT Transfer</span>
              <dl>
                <div><dt>Wallet</dt><dd>0x59e731952884d0327ad9afc3a70c0b8bd52b2cc0</dd></div>
                <div><dt>Networks</dt><dd>BNB Smart Chain (BEP20), Ethereum (ERC20)</dd></div>
              </dl>
              <p>Cover network fees on your end before sending the payment detail to helpdesk.</p>
            </section>
          </div>
        </div>
        <div className="billing-action-card credit-history-card">
          <div className="billing-header compact">
            <div>
              <span className="status-pill">Ledger</span>
              <h3>Credit Transactions</h3>
            </div>
            <span className="muted-count">{creditTransactions.length} rows</span>
          </div>
          {creditTransactions.length ? (
            <DataTable
              columns={["Date", "Description", "Method", "Amount", "Status"]}
              rows={creditTransactions.map((transaction) => [
                formatDateTime(transaction.createdAt),
                cleanLegacyText(transaction.description || transaction.name || `Product #${transaction.productId}`),
                transaction.paymentMethod,
                <span className={Number(transaction.ledgerAmount) >= 0 ? "credit-amount positive" : "credit-amount negative"}>
                  {formatMoney(transaction.ledgerAmount)}
                </span>,
                <span className="status-pill muted">{transaction.orderStatus}</span>
              ])}
            />
          ) : (
            <p className="empty-state">No credit ledger transactions found.</p>
          )}
        </div>
        <KnowledgeBaseCard title="Billing Guides" articles={billingKbArticles} />
      </div>
    );
  }

  if (activeTab === "active") {
    const products = billing?.activeProducts ?? [];
    if (selectedProduct) {
      return (
        <ProductRenewPage
          product={selectedProduct}
          catalog={renewalCatalog}
          message={renewalMessage}
          busy={isRenewalPageLoading || renewalBusyId === `product-renew-${selectedProduct.clientProductId}`}
          onBack={() => {
            setSelectedProduct(null);
            setRenewalCatalog(null);
            setRenewalMessage("");
          }}
          onCheckout={createProductRenewalCheckout}
        />
      );
    }

    return products.length ? (
      <div className="billing-detail-layout">
        {productActionMessage && <p className="renewal-action-message">{productActionMessage}</p>}
        <DataTable
          columns={["Product", "Description", "Status", "Due Date", "Amount", "Action"]}
          rows={products.map((product) => [
            product.name,
            product.description,
            <span className={product.status === "Active" ? "status-pill" : "status-pill muted"}>{product.status}</span>,
            formatDate(product.nextDueDate),
            formatMoney(product.amount),
            product.nextDueDate ? (
              <button className="primary-button compact" type="button" onClick={() => openProductRenewPage(product)}>
                <MenuIcon name="order" />
                <span>Renew</span>
              </button>
            ) : (
              <span className="muted-count">N/A</span>
            )
          ])}
        />
        {renewalMessage && <p className="renewal-action-message">{renewalMessage}</p>}
        {renewalPreview && <RenewalCheckoutPreview renewal={renewalPreview} onClose={() => setRenewalPreview(null)} onCheckout={createBillingRenewalCheckout} />}
      </div>
    ) : <p className="empty-state">No active products found.</p>;
  }

  if (activeTab === "renewal") {
    const renewals = billing?.renewalNotices ?? [];
    return renewals.length ? (
      <div className="billing-detail-layout">
        <div className="renewal-bulk-bar">
          <label>
            <input
              type="checkbox"
              checked={renewals.every((product) => selectedRenewalIds.includes(product.clientProductId))}
              onChange={() => toggleAllRenewals(renewals)}
            />
            <span>{selectedRenewalIds.length ? `${selectedRenewalIds.length} selected` : "Select all"}</span>
          </label>
          <button
            className="primary-button compact"
            type="button"
            disabled={!selectedRenewalIds.length || renewalBusyId !== null}
            onClick={createSelectedRenewalCheckout}
          >
            {renewalBusyId === "many" ? <LoadingIcon label="Creating renewal checkout" /> : "Renew Selected"}
          </button>
        </div>
        {renewalMessage && <p className="renewal-action-message">{renewalMessage}</p>}
        <DataTable
          columns={["Select", "Product", "Due Date", "Days Left", "Status", "Action"]}
          rows={renewals.map((product) => [
            <input
              aria-label={`Select ${product.name}`}
              checked={selectedRenewalIds.includes(product.clientProductId)}
              type="checkbox"
              onChange={() => toggleRenewalSelection(product.clientProductId)}
            />,
            product.name,
            formatDate(product.nextDueDate),
            product.daysLeft ?? "N/A",
            <span className={product.daysLeft < 0 ? "status-pill muted" : "status-pill"}>{product.daysLeft < 0 ? "Past due" : "Upcoming"}</span>,
            <div className="billing-action-row compact-row">
              <button
                className="secondary-button compact"
                type="button"
                disabled={renewalBusyId !== null}
                onClick={() => runRenewalAction(product, "renew")}
              >
                {renewalBusyId === `renew-${product.clientProductId}` ? <LoadingIcon label="Checking renewal" /> : <MenuIcon name="order" />}
              </button>
              <button
                className="ghost-button compact"
                type="button"
                disabled={renewalBusyId !== null}
                onClick={() => runRenewalAction(product, "hide")}
              >
                {renewalBusyId === `hide-${product.clientProductId}` ? <LoadingIcon label="Hiding renewal notice" /> : <MenuIcon name="x" />}
              </button>
            </div>
          ])}
        />
        {selectedRenewalCheckoutPreview && (
          <CheckoutPreviewCard preview={selectedRenewalCheckoutPreview} onClose={() => setSelectedRenewalCheckoutPreview(null)} />
        )}
        {renewalPreview && <RenewalCheckoutPreview renewal={renewalPreview} onClose={() => setRenewalPreview(null)} onCheckout={createBillingRenewalCheckout} />}
      </div>
    ) : <p className="empty-state">No renewal notices found.</p>;
  }

  const purchases = billing?.purchases ?? [];
  return purchases.length ? (
    <div className="billing-detail-layout">
      <div className="billing-filter-bar">
        <label>
          From
          <input
            type="date"
            value={purchaseDates.start}
            onChange={(event) => onPurchaseDateChange("start", event.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={purchaseDates.end}
            onChange={(event) => onPurchaseDateChange("end", event.target.value)}
          />
        </label>
        <button className="secondary-button compact icon-only-button billing-search-button" type="button" title="Search Purchases" aria-label="Search Purchases" onClick={onReloadBilling}>
          <MenuIcon name="search" />
        </button>
      </div>
      {purchases.length ? (
        <DataTable
          columns={["Date", "Product", "Term", "Amount", "Status", "Action"]}
          rows={purchases.map((purchase) => [
            formatDate(purchase.createDate),
            purchase.name,
            purchase.paymentTerm,
            formatMoney(purchase.amount),
            <span className={purchase.paymentStatus === "completed" ? "status-pill" : "status-pill muted"}>{purchase.paymentStatus}</span>,
            <a
              className="secondary-button compact icon-only-button"
              href={`/account/printreceipt?id=${encodeURIComponent(purchase.orderId)}`}
              aria-label="Invoice"
              title="Invoice"
            >
              <MenuIcon name="invoice" />
            </a>
          ])}
        />
      ) : (
        <p className="empty-state">No completed purchases found.</p>
      )}
    </div>
  ) : <p className="empty-state">No purchases found.</p>;
}

function CheckoutPreviewCard({ preview, onClose }) {
  return (
    <aside className="billing-detail-card checkout-preview-card">
      <div className="billing-detail-header">
        <span className="status-pill blue">{preview.isOrder ? "Checkout Order" : "Checkout Check"}</span>
        <button className="ghost-button compact" type="button" onClick={onClose}>Close</button>
      </div>
      <h3>{preview.title}</h3>
      <dl className="card-meta single">
        <div><dt>Checkout ID</dt><dd>{preview.checkoutId}</dd></div>
        <div><dt>Items</dt><dd>{preview.itemCount}</dd></div>
        <div><dt>Total</dt><dd>{formatMoney(preview.total, preview.currency)}</dd></div>
      </dl>
      <p>{preview.note}</p>
      {preview.checkoutUrl ? (
        <a className="primary-button as-link" href={preview.checkoutUrl}>Continue Checkout</a>
      ) : (
        <button className="primary-button" type="button" disabled>Checkout unavailable</button>
      )}
    </aside>
  );
}

function ProductRenewPage({ product, catalog, message, busy, onBack, onCheckout }) {
  const [selectedKey, setSelectedKey] = useState("");
  const options = catalog?.options ?? [];
  const selectedOption = options.find((option) => renewalOptionKey(option) === selectedKey);

  useEffect(() => {
    setSelectedKey("");
  }, [product?.clientProductId]);

  return (
    <div className="billing-detail-layout">
      <div className="billing-detail-card product-renew-page">
        <div className="billing-detail-header">
          <div>
            <span className="status-pill blue">Product Renew</span>
            <h3>{catalog?.renewalProductName || product.name}</h3>
          </div>
          <button className="secondary-button compact" type="button" onClick={onBack}>Back</button>
        </div>
        <dl className="card-meta single">
          <div><dt>Product</dt><dd>{product.name}</dd></div>
          <div><dt>Description</dt><dd>{product.description}</dd></div>
          <div><dt>Due Date</dt><dd>{formatDate(product.nextDueDate)}</dd></div>
          <div><dt>Current Term</dt><dd>{product.paymentTerm || "N/A"}</dd></div>
        </dl>
        {busy && !catalog && (
          <div className="inline-loading-row">
            <LoadingIcon label="Loading renewal terms" />
          </div>
        )}
        {catalog && (
          <div className="product-renew-grid">
            <label>
              Payment Terms
              <select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
                <option value="">Please choose a payment term</option>
                {options.map((option) => (
                  <option key={renewalOptionKey(option)} value={renewalOptionKey(option)}>
                    {renewalOptionLabel(catalog, option)}
                  </option>
                ))}
              </select>
            </label>
            {selectedOption && (
              <section className="renewal-price-section">
                <div><span>Payment Term</span><strong>{formatPaymentTerm(selectedOption.paymentTerm)}</strong></div>
                <div><span>Total Price</span><strong>{formatMoney(selectedOption.amount, selectedOption.currency)}</strong></div>
                <div><span>Monthly Price</span><strong>{formatMoney(selectedOption.monthlyAmount, selectedOption.currency)}</strong></div>
                {Number(selectedOption.originalAmount) > Number(selectedOption.amount) && (
                  <div><span>Original Price</span><strong>{formatMoney(selectedOption.originalAmount, selectedOption.currency)}</strong></div>
                )}
                <button className="primary-button" type="button" disabled={busy} onClick={() => onCheckout(selectedOption)}>
                  {busy ? <LoadingIcon label="Creating renewal checkout" /> : "Continue to Cart"}
                </button>
              </section>
            )}
            {options.length === 1 && (
              <p className="renewal-action-message">
                Only one renewal term is available for this product in the live price table.
              </p>
            )}
            {!options.length && <p className="empty-state">No renewal payment terms were found for this product.</p>}
          </div>
        )}
        {message && <p className="renewal-action-message">{message}</p>}
      </div>
    </div>
  );
}

function renewalOptionKey(option) {
  return `${option.paymentTerm}|${option.currency}`;
}

function renewalOptionLabel(catalog, option) {
  const monthly = Number(option.monthlyAmount) > 0 ? ` - ${formatMoney(option.monthlyAmount, option.currency)}/mo` : "";
  return `${catalog.product.name} - ${formatPaymentTerm(option.paymentTerm)} - ${formatMoney(option.amount, option.currency)}${monthly}`;
}

function RenewalCheckoutPreview({ renewal, onClose, onCheckout }) {
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function createCheckout() {
    if (!onCheckout) return;
    setIsCheckingOut(true);
    setCheckoutMessage("");
    setCheckoutOrder(null);

    try {
      const order = await onCheckout(renewal);
      if (goToCheckoutOrder(order)) return;
      setCheckoutOrder(order);
      setCheckoutMessage("Checkout order created.");
    } catch (error) {
      setCheckoutMessage(error.message || "Unable to create checkout order.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <aside className="billing-detail-card">
      <div className="billing-detail-header">
        <span className="status-pill blue">Renewal Preview</span>
        <button className="ghost-button compact" type="button" onClick={onClose}>Close</button>
      </div>
      <h3>{renewal.name}</h3>
      <dl>
        <div><dt>Client Product ID</dt><dd>{renewal.clientProductId}</dd></div>
        <div><dt>Description</dt><dd>{renewal.description}</dd></div>
        <div><dt>Billing Term</dt><dd>{renewal.paymentTerm}</dd></div>
        <div><dt>Amount</dt><dd>{formatMoney(renewal.amount, renewal.currency)}</dd></div>
        <div><dt>Current Due Date</dt><dd>{formatDate(renewal.nextDueDate)}</dd></div>
      </dl>
      <p>{renewal.note}</p>
      {!checkoutOrder && (
        <button className="primary-button" type="button" disabled={isCheckingOut || !onCheckout} onClick={createCheckout}>
          {isCheckingOut ? <LoadingIcon label="Creating checkout" /> : "Create Checkout"}
        </button>
      )}
      {checkoutMessage && <p className="renewal-action-message">{checkoutMessage}</p>}
      {checkoutOrder && (
        <div className="checkout-ready-row">
          <span>{checkoutOrder.guid}</span>
          <a className="primary-button as-link" href={checkoutOrder.checkoutUrl}>Open Checkout</a>
        </div>
      )}
    </aside>
  );
}

function BillingPurchaseDetail({ purchase, onClose }) {
  return (
    <aside className="billing-detail-card">
      <div className="billing-detail-header">
        <span className="status-pill">Invoice</span>
        <button className="ghost-button compact" type="button" onClick={onClose}>Close</button>
      </div>
      <h3>{purchase.name}</h3>
      <dl className="card-meta single">
        <div><dt>Order ID</dt><dd>{purchase.orderId}</dd></div>
        <div><dt>Account Name</dt><dd>{purchase.accountName || "N/A"}</dd></div>
        <div><dt>Receipt Name</dt><dd>{purchase.receiptName || "N/A"}</dd></div>
        <div><dt>Receipt Address</dt><dd>{[purchase.receiptAddress, purchase.receiptCity, purchase.receiptProvince, purchase.receiptPostcode, purchase.receiptCountry].filter(Boolean).join(", ") || "N/A"}</dd></div>
        {purchase.vat && <div><dt>VAT No.</dt><dd>{purchase.vat}</dd></div>}
        <div><dt>Product ID</dt><dd>{purchase.productId}</dd></div>
        <div><dt>Description</dt><dd>{purchase.description}</dd></div>
        <div><dt>Payment Term</dt><dd>{purchase.paymentTerm}</dd></div>
        <div><dt>Payment Method</dt><dd>{purchase.paymentMethod}</dd></div>
        <div><dt>Order Status</dt><dd>{purchase.orderStatus}</dd></div>
        <div><dt>Payment Status</dt><dd>{purchase.paymentStatus}</dd></div>
        <div><dt>Amount</dt><dd>{formatMoney(purchase.amount)}</dd></div>
        <div><dt>Paid Amount</dt><dd>{formatMoney(purchase.paidAmount)}</dd></div>
        <div><dt>Fees</dt><dd>{formatMoney(purchase.fees)}</dd></div>
        <div><dt>Transaction</dt><dd>{purchase.transactionCode || "N/A"}</dd></div>
      </dl>
      <button className="primary-button" type="button" onClick={() => window.print()}>Print Invoice</button>
    </aside>
  );
}

function BillingProductDetail({ product, onClose, onRenew, onManage }) {
  return (
    <aside className="billing-detail-card">
      <div className="billing-detail-header">
        <span className="status-pill">Product</span>
        <button className="ghost-button compact" type="button" onClick={onClose}>Close</button>
      </div>
      <h3>{product.name}</h3>
      <dl className="card-meta single">
        <div><dt>Client Product ID</dt><dd>{product.clientProductId}</dd></div>
        <div><dt>Description</dt><dd>{product.description}</dd></div>
        <div><dt>Type</dt><dd>{product.productType}</dd></div>
        <div><dt>Status</dt><dd>{product.status}</dd></div>
        <div><dt>Next Due Date</dt><dd>{formatDate(product.nextDueDate)}</dd></div>
        <div><dt>Payment Term</dt><dd>{product.paymentTerm || "N/A"}</dd></div>
      </dl>
      <div className="billing-action-row">
        <button className="primary-button" type="button" onClick={onRenew}>Renew</button>
        <button className="secondary-button" type="button" onClick={onManage}>Manage</button>
      </div>
    </aside>
  );
}

function formatMoney(amount, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "N/A";
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
}

function formatPaymentTerm(term) {
  const labels = {
    annually: "1 Year",
    "semi-annually": "6 Months",
    quarterly: "3 Months",
    monthly: "Monthly",
    biennially: "2 Years",
    "3y": "3 Years",
    none: "One Time"
  };
  return labels[term] ?? term;
}

function paymentTermMonths(term) {
  const months = {
    monthly: 1,
    quarterly: 3,
    "semi-annually": 6,
    annually: 12,
    biennially: 24,
    "3y": 36
  };
  return months[term] ?? 0;
}

function formatVpnPriceOption(price) {
  const term = formatPaymentTerm(price.paymentTerm);
  const total = formatMoney(price.amount, price.currency);
  const months = paymentTermMonths(price.paymentTerm);
  if (!months || months === 1) {
    return `${term} ${total}`;
  }

  return `${term} ${total} total (${formatMoney(Number(price.amount) / months, price.currency)}/mo)`;
}

function KnowledgeBaseCard({ title, articles, badge = "KB Articles" }) {
  return (
    <article className="panel-card kb-card">
      <div>
        <span className="status-pill blue">{badge}</span>
        <h2>{title}</h2>
      </div>
      <div className="kb-list">
        {articles.map(([articleTitle, url]) => (
          <a href={url} key={url} target="_blank" rel="noreferrer">
            <span>KB Article</span>
            <strong>{articleTitle}</strong>
          </a>
        ))}
      </div>
    </article>
  );
}

function editableAccountValue(value) {
  if (!value || value === "NA" || value === "N/A") return "";
  return value;
}

function profileFormFromSettings(profile) {
  return {
    name: editableAccountValue(profile?.name),
    companyName: editableAccountValue(profile?.companyName),
    mobileNumber: editableAccountValue(profile?.mobileNumber),
    browserLanguage: editableAccountValue(profile?.browserLanguage),
    vat: editableAccountValue(profile?.vat),
    contactCountry: editableAccountValue(profile?.contactCountry),
    contactProvince: editableAccountValue(profile?.contactProvince),
    contactCity: editableAccountValue(profile?.contactCity),
    contactArea: editableAccountValue(profile?.contactArea),
    contactAddress: editableAccountValue(profile?.contactAddress),
    contactPostcode: editableAccountValue(profile?.contactPostcode),
    billingCountry: editableAccountValue(profile?.billingCountry),
    billingProvince: editableAccountValue(profile?.billingProvince),
    billingCity: editableAccountValue(profile?.billingCity),
    billingArea: editableAccountValue(profile?.billingArea),
    billingAddress: editableAccountValue(profile?.billingAddress),
    billingPostcode: editableAccountValue(profile?.billingPostcode)
  };
}

function HelpdeskSection() {
  const [dashboard, setDashboard] = useState(null);
  const [form, setForm] = useState(null);
  const [activeTab, setActiveTab] = useState("my");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    email: "",
    url: "",
    description: "",
    attachment: ""
  });

  async function loadHelpdesk() {
    setIsLoading(true);
    setError("");
    try {
      const [dashboardResponse, formResponse] = await Promise.all([
        fetch("/api/account/helpdesk").then((response) => response.json()),
        fetch("/api/account/helpdesk/form").then((response) => response.json())
      ]);

      if (!dashboardResponse.success) {
        setError(dashboardResponse.message ?? "Unable to load helpdesk tickets.");
      } else {
        setDashboard(dashboardResponse.dashboard);
      }

      if (formResponse.success) {
        setForm(formResponse.form);
        setTicketForm((current) => ({
          ...current,
          email: current.email || formResponse.form?.defaultEmail || ""
        }));
      } else if (!dashboardResponse.success) {
        setError(formResponse.message ?? "Unable to load helpdesk form.");
      }
    } catch {
      setError("Unable to reach helpdesk service.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHelpdesk();
  }, []);

  async function submitTicket(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/account/helpdesk/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketForm.subject,
          email: ticketForm.email,
          url: ticketForm.url,
          description: ticketForm.description,
          attachment: ticketForm.attachment
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.message ?? "Unable to submit ticket.");
        return;
      }

      setMessage(result.message ?? "Ticket submitted.");
      setTicketForm((current) => ({
        ...current,
        subject: "",
        url: "",
        description: "",
        attachment: ""
      }));
      await loadHelpdesk();
    } catch {
      setError("Unable to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="helpdesk-section">
      <div className="helpdesk-toolbar">
        <div className="tabs" role="tablist" aria-label="Helpdesk tickets">
          <button className={activeTab === "my" ? "tab active" : "tab"} type="button" role="tab" aria-selected={activeTab === "my"} onClick={() => setActiveTab("my")}>
            <MenuIcon name="ticket" />
            <span>My Tickets</span>
          </button>
          <button className={activeTab === "closed" ? "tab active" : "tab"} type="button" role="tab" aria-selected={activeTab === "closed"} onClick={() => setActiveTab("closed")}>
            <MenuIcon name="checklist" />
            <span>Closed Tickets</span>
          </button>
        </div>
        <button className="primary-button compact" type="button" onClick={() => setIsCreating((value) => !value)}>
          {isCreating ? "Close" : "+ Create New Ticket"}
        </button>
      </div>

      {isCreating && (
        <article className="panel-card helpdesk-submit-card">
          <form className="helpdesk-form" onSubmit={submitTicket}>
            <div className="form-grid two">
              <label>
                Subject
                <input value={ticketForm.subject} onChange={(event) => setTicketForm((current) => ({ ...current, subject: event.target.value }))} required />
              </label>
              <label>
                Domain
                <input value={ticketForm.url} onChange={(event) => setTicketForm((current) => ({ ...current, url: event.target.value }))} required />
              </label>
              <label>
                Contact Email
                <input value={ticketForm.email} onChange={(event) => setTicketForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
            </div>

            <label>
              Description
              <textarea value={ticketForm.description} onChange={(event) => setTicketForm((current) => ({ ...current, description: event.target.value }))} rows={6} required />
            </label>
            <label>
              Attachment
              <textarea value={ticketForm.attachment} onChange={(event) => setTicketForm((current) => ({ ...current, attachment: event.target.value }))} rows={3} />
            </label>

            <div className="form-actions right">
              <button className="primary-button compact" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingIcon label="Submitting ticket" /> : "Submit Ticket"}
              </button>
            </div>
          </form>
          {message && <p className="renewal-action-message success">{message}</p>}
          {error && <p className="renewal-action-message error">{error}</p>}
        </article>
      )}

      {!isCreating && error && <p className="renewal-action-message error">{error}</p>}

      {isLoading && <LoadingState label="Loading helpdesk tickets" />}
      {dashboard && (
        <article className="panel-card helpdesk-ticket-panel">
          <HelpdeskTicketTable
            tickets={activeTab === "my" ? dashboard.openTickets ?? [] : dashboard.closedTickets ?? []}
            emptyText={activeTab === "my" ? "No current tickets." : "No closed tickets."}
            mode={activeTab}
          />
        </article>
      )}
    </section>
  );
}

function helpdeskStatusInfo(ticket) {
  const state = String(ticket.state ?? "").toLowerCase();
  const staffReplied = ticket.replyCount > 0 && !state.includes("pending") && !state.includes("q");
  return staffReplied
    ? { label: "Staff Replied", tone: "staff" }
    : { label: "Pending", tone: "pending" };
}

function HelpdeskTicketTable({ tickets, emptyText, mode = "my" }) {
  if (mode === "closed") {
    return tickets.length ? (
      <DataTable
        columns={["Ticket ID", "Priority", "Subject", "Closed Time"]}
        rows={tickets.map((ticket) => [
          ticket.callId,
          ticket.priority,
          ticket.subject,
          formatDateTime(ticket.closeDate)
        ])}
      />
    ) : (
      <p className="empty-text">{emptyText}</p>
    );
  }

  return tickets.length ? (
    <DataTable
      columns={["Ticket ID", "Priority", "Subject", "Created Time", "Status"]}
      rows={tickets.map((ticket) => {
        const status = helpdeskStatusInfo(ticket);
        return [
          ticket.callId,
          `Priority${ticket.priority}`,
          ticket.subject,
          formatDateTime(ticket.enterDate),
          <span className={`helpdesk-status ${status.tone}`}><span />{status.label}</span>
        ];
      })}
    />
  ) : (
    <p className="empty-text">{emptyText}</p>
  );
}

function SettingsSection() {
  const [settings, setSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    companyName: "",
    mobileNumber: "",
    browserLanguage: "",
    vat: "",
    contactCountry: "",
    contactProvince: "",
    contactCity: "",
    contactArea: "",
    contactAddress: "",
    contactPostcode: "",
    billingCountry: "",
    billingProvince: "",
    billingCity: "",
    billingArea: "",
    billingAddress: "",
    billingPostcode: ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [emailChange, setEmailChange] = useState("");
  const [emailChangeMessage, setEmailChangeMessage] = useState("");
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [isUpdatingTwoFactor, setIsUpdatingTwoFactor] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  async function loadSettings() {
    setIsLoadingSettings(true);
    setSettingsError("");
    try {
      const response = await fetch("/api/account/settings");
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setSettingsError(result?.message ?? "Unable to load account settings.");
        return;
      }

      setSettings(result.dashboard);
      setProfileForm(profileFormFromSettings(result.dashboard?.profile));
    } catch {
      setSettingsError("Unable to reach account settings service.");
    } finally {
      setIsLoadingSettings(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updatePasswordField(field, value) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  }

  function updateProfileField(field, value) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  function copyContactAddressToBilling() {
    setProfileForm((current) => ({
      ...current,
      billingCountry: current.contactCountry,
      billingProvince: current.contactProvince,
      billingCity: current.contactCity,
      billingArea: current.contactArea,
      billingAddress: current.contactAddress,
      billingPostcode: current.contactPostcode
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage("");

    try {
      const response = await fetch("/api/account/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      const result = await response.json().catch(() => null);
      setProfileMessage(result?.message ?? "Unable to update profile.");
      if (response.ok && result?.success) {
        setSettings(result.dashboard);
        setProfileForm(profileFormFromSettings(result.dashboard?.profile));
      }
    } catch {
      setProfileMessage("Unable to reach profile update service.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage("");

    try {
      const response = await fetch("/api/account/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm)
      });
      const result = await response.json().catch(() => null);
      setPasswordMessage(result?.message ?? "Unable to update password.");
      if (response.ok && result?.success) {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setPasswordMessage("Unable to reach password update service.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function requestEmailChange(event) {
    event.preventDefault();
    setIsRequestingEmailChange(true);
    setEmailChangeMessage("");

    try {
      const response = await fetch("/api/account/settings/email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailChange })
      });
      const result = await response.json().catch(() => null);
      setEmailChangeMessage(result?.message ?? "Unable to create email verification request.");
      if (response.ok && result?.success) {
        setEmailChange("");
      }
    } catch {
      setEmailChangeMessage("Unable to reach email verification service.");
    } finally {
      setIsRequestingEmailChange(false);
    }
  }

  async function disableTwoFactor() {
    setIsUpdatingTwoFactor(true);
    setTwoFactorMessage("");

    try {
      const response = await fetch("/api/account/settings/2fa/disable", { method: "POST" });
      const result = await response.json().catch(() => null);
      setTwoFactorMessage(result?.message ?? "Unable to update two-factor authentication.");
      if (response.ok && result?.success) {
        setSettings(result.dashboard);
      }
    } catch {
      setTwoFactorMessage("Unable to reach two-factor authentication service.");
    } finally {
      setIsUpdatingTwoFactor(false);
    }
  }

  async function startTwoFactorSetup() {
    setIsUpdatingTwoFactor(true);
    setTwoFactorMessage("");
    setTwoFactorSetup(null);
    setTwoFactorCode("");

    try {
      const response = await fetch("/api/account/settings/2fa/start", { method: "POST" });
      const result = await response.json().catch(() => null);
      setTwoFactorMessage(result?.message ?? "Unable to start two-factor authentication setup.");
      if (response.ok && result?.success) {
        setTwoFactorSetup(result.setup);
      }
    } catch {
      setTwoFactorMessage("Unable to reach two-factor authentication service.");
    } finally {
      setIsUpdatingTwoFactor(false);
    }
  }

  async function confirmTwoFactorSetup(event) {
    event.preventDefault();
    setIsUpdatingTwoFactor(true);
    setTwoFactorMessage("");

    try {
      const response = await fetch("/api/account/settings/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oneCode: twoFactorCode })
      });
      const result = await response.json().catch(() => null);
      setTwoFactorMessage(result?.message ?? "Unable to confirm two-factor authentication setup.");
      if (response.ok && result?.success) {
        setSettings(result.dashboard);
        setTwoFactorSetup(null);
        setTwoFactorCode("");
      }
    } catch {
      setTwoFactorMessage("Unable to reach two-factor authentication service.");
    } finally {
      setIsUpdatingTwoFactor(false);
    }
  }

  const profile = settings?.profile;
  const twoFactor = settings?.twoFactor;

  return (
    <section className="settings-section">
      <article className="panel-card settings-overview-card">
        {isLoadingSettings && <LoadingState label="Loading account settings" />}
        {settingsError && (
          <div className="dashboard-error-panel inline-error">
            <p>{settingsError}</p>
            <IconActionButton label="Retry" onClick={loadSettings} />
          </div>
        )}
        {profile && (
          <div className="settings-card-grid">
            <article className="settings-info-card">
              <span className="status-pill">Profile</span>
              <dl className="card-meta single">
                <div><dt>Customer ID</dt><dd>{profile.customerId}</dd></div>
                <div><dt>Login</dt><dd>{profile.login}</dd></div>
                <div><dt>Status</dt><dd>{profile.status}</dd></div>
                <div><dt>Name</dt><dd>{profile.name || "N/A"}</dd></div>
                <div><dt>Company</dt><dd>{profile.companyName || "N/A"}</dd></div>
                <div><dt>Start Date</dt><dd>{formatDate(profile.accountStartDate)}</dd></div>
              </dl>
            </article>

            <article className="settings-info-card">
              <span className="status-pill">Security</span>
              <dl className="card-meta single">
                <div><dt>Email</dt><dd>{profile.emailDisplay || "Stored securely"}</dd></div>
                <div><dt>Mobile</dt><dd>{profile.mobileNumber || "N/A"}</dd></div>
                <div><dt>Email Verified</dt><dd>{profile.reVerify ? "Yes" : "Needs verification"}</dd></div>
                <div><dt>2FA Status</dt><dd>{twoFactor?.isEnabled ? "Enabled" : "Disabled"}</dd></div>
                <div><dt>2FA Created</dt><dd>{formatDate(twoFactor?.enterDate)}</dd></div>
              </dl>
            </article>
          </div>
        )}
      </article>

      <article className="panel-card profile-card">
        <div>
          <span className="status-pill blue">Profile</span>
          <h2>Update Profile</h2>
          <p>Update the account display and contact fields used across the account panel.</p>
        </div>
        <form className="settings-form settings-form-grid" onSubmit={saveProfile}>
          <label>
            Name
            <input
              type="text"
              value={profileForm.name}
              onChange={(event) => updateProfileField("name", event.target.value)}
            />
          </label>
          <label>
            Company
            <input
              type="text"
              value={profileForm.companyName}
              onChange={(event) => updateProfileField("companyName", event.target.value)}
            />
          </label>
          <label>
            Mobile
            <input
              type="tel"
              value={profileForm.mobileNumber}
              disabled
              title="Mobile changes require SMS PIN verification in the Classic ASP flow."
              onChange={(event) => updateProfileField("mobileNumber", event.target.value)}
            />
          </label>
          <label>
            VAT
            <input
              type="text"
              value={profileForm.vat}
              onChange={(event) => updateProfileField("vat", event.target.value)}
            />
          </label>
          <div className="settings-form-section-title">Contact Address</div>
          <label>
            Country
            <input type="text" value={profileForm.contactCountry} onChange={(event) => updateProfileField("contactCountry", event.target.value)} />
          </label>
          <label>
            Province / State
            <input type="text" value={profileForm.contactProvince} onChange={(event) => updateProfileField("contactProvince", event.target.value)} />
          </label>
          <label>
            City
            <input type="text" value={profileForm.contactCity} onChange={(event) => updateProfileField("contactCity", event.target.value)} />
          </label>
          <label>
            Area
            <input type="text" value={profileForm.contactArea} onChange={(event) => updateProfileField("contactArea", event.target.value)} />
          </label>
          <label className="settings-wide-field">
            Address
            <input type="text" value={profileForm.contactAddress} onChange={(event) => updateProfileField("contactAddress", event.target.value)} />
          </label>
          <label>
            Postal Code
            <input type="text" value={profileForm.contactPostcode} onChange={(event) => updateProfileField("contactPostcode", event.target.value)} />
          </label>
          <div className="settings-form-section-title with-action">
            <span>Billing Address</span>
            <button className="secondary-button compact" type="button" onClick={copyContactAddressToBilling}>Use Contact</button>
          </div>
          <label>
            Billing Country
            <input type="text" value={profileForm.billingCountry} onChange={(event) => updateProfileField("billingCountry", event.target.value)} />
          </label>
          <label>
            Billing Province / State
            <input type="text" value={profileForm.billingProvince} onChange={(event) => updateProfileField("billingProvince", event.target.value)} />
          </label>
          <label>
            Billing City
            <input type="text" value={profileForm.billingCity} onChange={(event) => updateProfileField("billingCity", event.target.value)} />
          </label>
          <label>
            Billing Area
            <input type="text" value={profileForm.billingArea} onChange={(event) => updateProfileField("billingArea", event.target.value)} />
          </label>
          <label className="settings-wide-field">
            Billing Address
            <input type="text" value={profileForm.billingAddress} onChange={(event) => updateProfileField("billingAddress", event.target.value)} />
          </label>
          <label>
            Billing Postal Code
            <input type="text" value={profileForm.billingPostcode} onChange={(event) => updateProfileField("billingPostcode", event.target.value)} />
          </label>
          <div className="settings-form-actions">
            <button className="primary-button" type="submit" disabled={isSavingProfile || !profileForm.name.trim()}>
              {isSavingProfile ? <LoadingIcon label="Saving profile" /> : "Save Profile"}
            </button>
          </div>
        </form>
        {profileMessage && <p className="renewal-action-message">{profileMessage}</p>}
        <p className="settings-helper-text">Mobile changes require SMS PIN verification; that write path is blocked until the legacy SMS gateway test target is confirmed.</p>
      </article>

      <article className="panel-card password-card">
        <div>
          <span className="status-pill blue">Email</span>
          <h2>Change Email Address</h2>
          <p>Create a verification request for a new account contact email.</p>
        </div>
        <form className="settings-form" onSubmit={requestEmailChange}>
          <label>
            New Email
            <input
              type="email"
              autoComplete="email"
              value={emailChange}
              onChange={(event) => setEmailChange(event.target.value)}
            />
          </label>
          <button className="primary-button" type="submit" disabled={isRequestingEmailChange || !emailChange.trim()}>
            {isRequestingEmailChange ? <LoadingIcon label="Creating verification request" /> : "Create Verification Request"}
          </button>
        </form>
        {emailChangeMessage && <p className="renewal-action-message">{emailChangeMessage}</p>}
      </article>

      <article className="panel-card password-card">
        <div>
          <span className={twoFactor?.isEnabled ? "status-pill" : "status-pill muted"}>
            {twoFactor?.isEnabled ? "Enabled" : "Disabled"}
          </span>
          <h2>Two-Factor Authentication</h2>
          <p>Review the current authenticator status and disable 2FA when an account needs recovery.</p>
        </div>
        <div className="settings-action-strip">
          {twoFactor?.isEnabled ? (
            <button className="primary-button" type="button" onClick={disableTwoFactor} disabled={isUpdatingTwoFactor}>
              {isUpdatingTwoFactor ? "Disabling..." : "Disable 2FA"}
            </button>
          ) : (
            <button className="secondary-button compact" type="button" onClick={startTwoFactorSetup} disabled={isUpdatingTwoFactor}>
              {isUpdatingTwoFactor ? <LoadingIcon label="Starting 2FA setup" /> : "Setup 2FA"}
            </button>
          )}
          <span>{twoFactor?.hasSecret ? `Created ${formatDate(twoFactor.enterDate)}` : "No authenticator secret on file"}</span>
        </div>
        {twoFactorSetup && (
          <form className="settings-form two-factor-setup-form" onSubmit={confirmTwoFactorSetup}>
            {twoFactorSetup.qrCodeUrl && <img className="two-factor-qr" src={twoFactorSetup.qrCodeUrl} alt="2FA QR code" />}
            <label>
              Secret
              <input value={twoFactorSetup.secret || ""} readOnly />
            </label>
            <label>
              Six-digit code
              <input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </label>
            <button className="primary-button compact" type="submit" disabled={isUpdatingTwoFactor || twoFactorCode.length !== 6}>
              {isUpdatingTwoFactor ? <LoadingIcon label="Confirming 2FA" /> : "Finish"}
            </button>
          </form>
        )}
        {twoFactorMessage && <p className="renewal-action-message">{twoFactorMessage}</p>}
      </article>

      <article className="panel-card password-card">
        <div>
          <span className="status-pill blue">Password</span>
          <h2>Change Account Password</h2>
          <p>This updates the main account login password. Hosting control panel, FTP, and IIS user sync will be handled in the hosting control panel workflow.</p>
        </div>
        <form className="settings-form" onSubmit={changePassword}>
          <label>
            Current Password
            <input
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(event) => updatePasswordField("currentPassword", event.target.value)}
            />
          </label>
          <label>
            New Password
            <input
              type="password"
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={(event) => updatePasswordField("newPassword", event.target.value)}
            />
          </label>
          <label>
            Confirm New Password
            <input
              type="password"
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
            />
          </label>
          <button className="primary-button" type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
        {passwordMessage && <p className="renewal-action-message">{passwordMessage}</p>}
      </article>
      <KnowledgeBaseCard title="Security App Guides" articles={securityGuideArticles} badge="2FA Guides" />
    </section>
  );
}

function AffiliateSection() {
  const tabs = [
    ["getting-started", "Getting Started", "rocket"],
    ["referrals", "My Referrals", "share"],
    ["pending", "Pending Commission", "warning"],
    ["current", "Current Commission", "stats"],
    ["withdraw", "Withdraw", "download"],
    ["pay-log", "Pay Log", "invoice"],
    ["promo-assets", "Promo Assets", "cards"]
  ];
  const [activeTab, setActiveTab] = useState("getting-started");
  const [affiliate, setAffiliate] = useState(null);
  const [isLoadingAffiliate, setIsLoadingAffiliate] = useState(true);
  const [affiliateError, setAffiliateError] = useState("");

  async function loadAffiliate() {
    setIsLoadingAffiliate(true);
    setAffiliateError("");
    try {
      const response = await fetch("/api/account/affiliate");
      const result = await response.json();
      if (!response.ok || !result.success) {
        setAffiliateError(result?.message ?? "Unable to load affiliate data.");
        return;
      }

      setAffiliate(result.dashboard);
    } catch {
      setAffiliateError("Unable to reach affiliate service.");
    } finally {
      setIsLoadingAffiliate(false);
    }
  }

  useEffect(() => {
    loadAffiliate();
  }, []);

  const summary = affiliate?.summary;
  const commissions = affiliate?.commissions ?? [];
  const pendingCommissions = commissions.filter((commission) => !commission.isReleased);
  const currentCommissions = commissions.filter((commission) => commission.isReleased);

  return (
    <section className="affiliate-stack">
      <article className="panel-card affiliate-panel">
        <div className="affiliate-summary-grid">
          <AffiliateMetric label="Referrals" value={summary?.totalReferrals ?? "..."} />
          <AffiliateMetric label="Paid Referrals" value={summary?.paidReferrals ?? "..."} />
          <AffiliateMetric label="Pending" value={formatMoney(summary?.pendingCommission ?? 0)} />
          <AffiliateMetric label="Available" value={formatMoney(summary?.availableCommission ?? 0)} />
        </div>

        <div className="tabs" role="tablist" aria-label="Affiliate tabs">
          {tabs.map(([id, label, icon]) => (
            <button
              aria-selected={id === activeTab}
              className={id === activeTab ? "tab active" : "tab"}
              key={id}
              role="tab"
              type="button"
              onClick={() => setActiveTab(id)}
            >
              <MenuIcon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {isLoadingAffiliate && <LoadingState label="Loading affiliate data" />}
        {affiliateError && (
          <div className="dashboard-error-panel inline-error">
            <p>{affiliateError}</p>
            <IconActionButton label="Retry" onClick={loadAffiliate} />
          </div>
        )}
        {!isLoadingAffiliate && !affiliateError && (
          <div className="tab-panel" role="tabpanel">
            {activeTab === "getting-started" && <AffiliateGettingStarted affiliate={affiliate} />}
            {activeTab === "referrals" && <AffiliateReferrals referrals={affiliate?.referrals ?? []} />}
            {activeTab === "pending" && <AffiliateCommissions commissions={pendingCommissions} emptyText="No pending commissions found." showRelease />}
            {activeTab === "current" && <AffiliateCommissions commissions={currentCommissions} emptyText="No released commissions found." />}
            {activeTab === "withdraw" && <AffiliateWithdraw summary={summary} />}
            {activeTab === "pay-log" && <AffiliatePayLog payouts={affiliate?.payouts ?? []} />}
            {activeTab === "promo-assets" && <AffiliatePromoAssets affiliate={affiliate} />}
          </div>
        )}
      </article>
    </section>
  );
}

function AffiliateMetric({ label, value }) {
  return (
    <div className="affiliate-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AffiliateReferrals({ referrals }) {
  if (!referrals.length) return <p className="empty-state">No referrals found.</p>;
  return (
    <DataTable
      columns={["Member ID", "Status", "Start Date", "Qualified"]}
      rows={referrals.map((referral) => [
        referral.login,
        <span className={referral.isPaid ? "status-pill" : "status-pill muted"}>{referral.isPaid ? "Converted to Paid" : "Still Trial"}</span>,
        formatDate(referral.accountStartDate),
        referral.status || "N/A"
      ])}
    />
  );
}

function AffiliateCommissions({ commissions, emptyText, showRelease = false }) {
  if (!commissions.length) return <p className="empty-state">{emptyText}</p>;
  return (
    <DataTable
      columns={showRelease ? ["Date", "Member ID", "Product", "Release Date", "Amount"] : ["Date", "Member ID", "Product", "Description", "Amount"]}
      rows={commissions.map((commission) => showRelease ? [
        formatDate(commission.createDate),
        commission.customerLogin,
        commission.productName,
        formatDate(commission.releaseDate),
        formatMoney(commission.amount)
      ] : [
        formatDate(commission.createDate),
        commission.customerLogin,
        commission.productName,
        commission.description,
        formatMoney(commission.amount)
      ])}
    />
  );
}

function AffiliateWithdraw({ summary }) {
  const available = summary?.availableCommission ?? 0;
  const [creditAmount, setCreditAmount] = useState(available.toFixed(2));
  const [paypalAmount, setPaypalAmount] = useState(Math.max(available, 0).toFixed(2));
  const [paypalAccount, setPaypalAccount] = useState("");
  const [withdrawPreview, setWithdrawPreview] = useState(null);
  const [withdrawMessage, setWithdrawMessage] = useState("");
  const [isCheckingWithdraw, setIsCheckingWithdraw] = useState(false);

  useEffect(() => {
    setCreditAmount(available.toFixed(2));
    setPaypalAmount(Math.max(available, 0).toFixed(2));
  }, [available]);

  async function submitPaypalWithdraw() {
    setIsCheckingWithdraw(true);
    setWithdrawMessage("");
    setWithdrawPreview(null);

    try {
      const response = await fetch("/api/account/affiliate/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(paypalAmount), method: "paypal", paypal: paypalAccount })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setWithdrawPreview(result?.preview ?? null);
        setWithdrawMessage(result?.message ?? "Unable to submit payout request.");
        return;
      }

      setWithdrawPreview(result.preview);
      setWithdrawMessage(result.preview?.note ?? result.message);
    } catch {
      setWithdrawMessage("Unable to reach affiliate payout service.");
    } finally {
      setIsCheckingWithdraw(false);
    }
  }

  async function submitCreditWithdraw() {
    setIsCheckingWithdraw(true);
    setWithdrawMessage("");
    setWithdrawPreview(null);

    try {
      const response = await fetch("/api/account/affiliate/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(creditAmount), method: "account-credit", paypal: "" })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setWithdrawPreview(result?.preview ?? null);
        setWithdrawMessage(result?.message ?? "Unable to convert commission.");
        return;
      }

      setWithdrawPreview(result.preview);
      setWithdrawMessage(result.preview?.note ?? result.message);
    } catch {
      setWithdrawMessage("Unable to reach affiliate withdraw service.");
    } finally {
      setIsCheckingWithdraw(false);
    }
  }

  return (
    <div className="affiliate-withdraw-grid">
      <article className="affiliate-withdraw-card">
        <h3>Convert Commission to Account Balance</h3>
        <p>Convert available affiliate commission into account funds.</p>
        <label>
          Amount
          <input type="number" min="0" step="0.01" value={creditAmount} onChange={(event) => setCreditAmount(event.target.value)} />
        </label>
        <button className="primary-button" type="button" disabled={isCheckingWithdraw} onClick={submitCreditWithdraw}>
          {isCheckingWithdraw ? <LoadingIcon label="Converting commission" /> : "Convert to Credit"}
        </button>
      </article>
      <article className="affiliate-withdraw-card">
        <h3>Withdraw to PayPal</h3>
        <p>You can withdraw when your earnings reach $100. Payments are sent through PayPal mass payout.</p>
        <label>
          PayPal Account
          <input type="email" placeholder="paypal@example.com" value={paypalAccount} onChange={(event) => setPaypalAccount(event.target.value)} />
        </label>
        <label>
          Amount
          <input type="number" min="100" step="0.01" value={paypalAmount} onChange={(event) => setPaypalAmount(event.target.value)} />
        </label>
        <button className="secondary-button" type="button" disabled={isCheckingWithdraw || !paypalAccount.trim()} onClick={submitPaypalWithdraw}>
          {isCheckingWithdraw ? "Submitting..." : "Submit Withdraw"}
        </button>
      </article>
      {(withdrawMessage || withdrawPreview) && (
        <article className="affiliate-withdraw-card withdraw-preview-card">
          <h3>Withdraw Check</h3>
          {withdrawMessage && <p>{withdrawMessage}</p>}
          {withdrawPreview && (
            <dl className="card-meta single">
              <div><dt>Requested</dt><dd>{formatMoney(withdrawPreview.amount)}</dd></div>
              <div><dt>Available</dt><dd>{formatMoney(withdrawPreview.availableCommission)}</dd></div>
              <div><dt>Minimum</dt><dd>{formatMoney(withdrawPreview.minimumAmount)}</dd></div>
              <div><dt>Paid referrals this year</dt><dd>{withdrawPreview.paidReferralsThisYear}</dd></div>
              <div><dt>Status</dt><dd>{withdrawPreview.eligible ? "Eligible" : "Not eligible"}</dd></div>
            </dl>
          )}
        </article>
      )}
    </div>
  );
}

function AffiliatePayLog({ payouts }) {
  if (!payouts.length) return <p className="empty-state">No payout history found.</p>;
  return (
    <DataTable
      columns={["Date", "Method", "Description", "Amount", "Status"]}
      rows={payouts.map((payout) => [
        formatDate(payout.createDate),
        payout.method,
        payout.description,
        formatMoney(payout.amount),
        <span className={payout.status ? "status-pill" : "status-pill muted"}>{payout.status || "Recorded"}</span>
      ])}
    />
  );
}

function AffiliatePromoAssets({ affiliate }) {
  const [copiedSize, setCopiedSize] = useState("");
  const referralCode = affiliate?.login || "jyu001";
  const brandDomain = normalizeAffiliateBrandDomain(affiliate?.brandDomain);
  const banners = buildAffiliateBanners(referralCode, brandDomain);

  async function copyBannerCode(banner) {
    if (await writeTextToClipboard(banner.code)) {
      setCopiedSize(banner.size);
      window.setTimeout(() => setCopiedSize(""), 1600);
    } else {
      setCopiedSize("failed");
      window.setTimeout(() => setCopiedSize(""), 1600);
    }
  }

  return (
    <div className="promo-assets-grid">
      {banners.map((banner) => (
        <article className="promo-asset-card" key={banner.size}>
          <span className="status-pill">{banner.size}</span>
          <p>{banner.url}</p>
          <textarea readOnly value={banner.code} aria-label={`${banner.size} affiliate banner code`} />
          <button className="secondary-button compact" type="button" onClick={() => copyBannerCode(banner)}>
            {copiedSize === banner.size ? "Copied" : copiedSize === "failed" ? "Copy Failed" : "Copy Code"}
          </button>
        </article>
      ))}
    </div>
  );
}

function AffiliateGettingStarted({ affiliate }) {
  const referralCode = affiliate?.login || "jyu001";
  const referralCustomerId = affiliate?.customerId ? String(affiliate.customerId) : "";
  const brandDomain = normalizeAffiliateBrandDomain(affiliate?.brandDomain);
  const banners = buildAffiliateBanners(referralCode, brandDomain);
  const [activeBannerSize, setActiveBannerSize] = useState(banners[0]?.size ?? "728X90");
  const [copiedBanner, setCopiedBanner] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteCopied, setInviteCopied] = useState("");
  const activeBanner = banners.find((banner) => banner.size === activeBannerSize) ?? banners[0];
  const referralUrl = `https://www.${brandDomain}/index?r=${encodeURIComponent(referralCode)}`;
  const referralIdUrl = referralCustomerId ? `https://www.${brandDomain}/index?r=${encodeURIComponent(referralCustomerId)}` : "";
  const inviteSubject = `Try ${brandDomain} hosting`;
  const inviteBody = [
    `Hi${inviteName.trim() ? ` ${inviteName.trim()}` : ""},`,
    "",
    `I wanted to share ${brandDomain} with you. They offer Windows ASP.NET hosting, domains, VPN services, SSL certificates, and add-ons.`,
    "",
    `You can start here: ${referralUrl}`,
    "",
    "Thanks!"
  ].join("\n");

  async function copyActiveBanner() {
    if (await writeTextToClipboard(activeBanner.code)) {
      setCopiedBanner(activeBanner.size);
      window.setTimeout(() => setCopiedBanner(""), 1600);
    } else {
      setCopiedBanner("failed");
      window.setTimeout(() => setCopiedBanner(""), 1600);
    }
  }

  async function copyInviteDraft() {
    const draft = `To: ${inviteEmail || "customer@example.com"}\nSubject: ${inviteSubject}\n\n${inviteBody}`;
    if (await writeTextToClipboard(draft)) {
      setInviteCopied("draft");
      window.setTimeout(() => setInviteCopied(""), 1600);
    } else {
      setInviteCopied("failed");
      window.setTimeout(() => setInviteCopied(""), 1600);
    }
  }

  async function copyReferralUrl(urlKey) {
    const url = urlKey === "id" ? referralIdUrl : referralUrl;
    if (!url) return;
    if (await writeTextToClipboard(url)) {
      setInviteCopied(urlKey);
      window.setTimeout(() => setInviteCopied(""), 1600);
    } else {
      setInviteCopied("failed");
      window.setTimeout(() => setInviteCopied(""), 1600);
    }
  }

  return (
    <div className="affiliate-start">
      <div className="affiliate-offers">
        <article className="affiliate-offer-card">
          <h3>$5 For Free Trial Customer</h3>
          <div>For every Free/Trial customer you refer to us, you get $5 USD.*</div>
        </article>
        <article className="affiliate-offer-card">
          <h3>60% For New Paid Customer</h3>
          <div>For every paid customer your refer to us, you get 60% of what we charge!*</div>
        </article>
      </div>

      <article className="affiliate-guide">
        <h3>Simple Enough? Get Started now!</h3>
        <div className="affiliate-guide-box">
          <p>To refer a customer to us, you can use the following URLs:</p>
          <div className="affiliate-url-list">
            <div>
              <span>{referralUrl}</span>
              <button type="button" onClick={() => copyReferralUrl("login")}>{inviteCopied === "login" ? "Copied" : "Copy"}</button>
            </div>
            {referralIdUrl && (
              <div>
                <span>{referralIdUrl}</span>
                <button type="button" onClick={() => copyReferralUrl("id")}>{inviteCopied === "id" ? "Copied" : "Copy"}</button>
              </div>
            )}
          </div>
          <p className="affiliate-note">
            <strong>Note:</strong> Once your customer visits our site through the URL above, your referral ID will be recorded in their browser's cookie. Anytime your customer decides to signup, you'll get credited.
          </p>
          <div className="affiliate-invite-card">
            <h4>Invite Customer</h4>
            <div className="affiliate-invite-fields">
              <label>
                Customer Name
                <input type="text" value={inviteName} onChange={(event) => setInviteName(event.target.value)} />
              </label>
              <label>
                Customer Email
                <input type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} />
              </label>
            </div>
            <textarea readOnly value={`Subject: ${inviteSubject}\n\n${inviteBody}`} aria-label="Affiliate invitation email draft" />
            <button className="secondary-button compact" type="button" onClick={copyInviteDraft}>
              {inviteCopied === "draft" ? "Copied" : inviteCopied === "failed" ? "Copy Failed" : "Copy Invite Draft"}
            </button>
          </div>
          <p>You can also use the following banners we provide:</p>
          <div className="banner-tabs" aria-label="Banner sizes">
            {banners.map((banner) => (
              <button
                className={activeBanner?.size === banner.size ? "active" : ""}
                key={banner.size}
                type="button"
                onClick={() => setActiveBannerSize(banner.size)}
              >
                {banner.size}
              </button>
            ))}
          </div>
          <div className="affiliate-code-row">
            <span>Code:</span>
            <button type="button" onClick={copyActiveBanner}>
              {copiedBanner === activeBanner.size ? "Copied" : copiedBanner === "failed" ? "Copy Failed" : "Copy"}
            </button>
          </div>
          <textarea readOnly value={activeBanner?.code ?? ""} aria-label="Affiliate banner code" />
          <p>Example:</p>
          <div className="affiliate-real-banner-preview">
            <img src={activeBanner?.url ?? ""} alt={`${activeBanner?.size ?? "Affiliate"} banner preview`} />
          </div>
        </div>
        <a className="affiliate-terms" href={`https://www.${brandDomain}/affiliate_terms`} target="_blank" rel="noreferrer">*Click here to see our Affiliate Terms and Condition</a>
      </article>
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
