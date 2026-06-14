import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const nativeFetch = window.fetch.bind(window);
const authRedirectExemptPaths = [
  "/api/auth/login",
  "/api/auth/login-config",
  "/api/auth/me",
  "/api/auth/logout",
  "/api/auth/2fa/verify",
  "/api/auth/password-reset/request",
  "/api/auth/password-reset/confirm"
];

const cloudflareTurnstileTestSiteKey = "1x00000000000000000000AA";
const chatbaseChatbotId = "qWoqKCVt6Tnryaeqcq6vA";
const chatbaseDomain = "www.chatbase.co";
const olarkSiteId = "8133-389-10-5171";
const liveChatFallbackUrl = "https://member3.smarterasp.net/account/chat";
const liveChatSessionKey = "controlpanel-live-chat-opened";
let liveChatOpenedInMemory = false;

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
  { id: "databases", label: "Databases", icon: "database", children: [
    { id: "mssql", label: "MSSQL", icon: "database" },
    { id: "mysql", label: "MySQL", icon: "database" },
    { id: "sql-reporting", label: "SQL Reporting", icon: "database" },
    { id: "advanced-customer-backup", label: "Advance Customer Backup", icon: "backup" },
    { id: "postgresql", label: "PostgreSQL", icon: "database", disabled: true }
  ] },
  { id: "emails", label: "Emails", icon: "mail", children: [
    { id: "email", label: "Email", icon: "mail" },
    { id: "corporate-email", label: "Corporate Email", icon: "mail" }
  ] },
  { id: "files", label: "Files", icon: "folder" },
  { id: "apps", label: "Apps", icon: "apps" },
  { id: "ftp", label: "FTP", icon: "ftp" },
  { id: "cdn", label: "CDN", icon: "cdn" },
  { id: "dns", label: "DNS", icon: "dns" },
  { id: "ssl", label: "SSL", icon: "ssl" },
  { id: "advance", label: "Advance", icon: "advance", children: [
    { id: "schedule-tasks", label: "Schedule Tasks", icon: "tasks" },
    { id: "outgoing-port", label: "Outgoing Port", icon: "outgoing" },
    { id: "control-panel-users", label: "Control Panel User(s)", icon: "settings" },
    { id: "webconfig-encrypt", label: "Webconfig Encrypt", icon: "ssl" },
    { id: "work-queue", label: "Work Queue", icon: "work-queue" },
    { id: "remote-site-backup", label: "Remote Site Backup", icon: "backup" }
  ] }
];

const websiteActions = [
  { label: "SSL", icon: "ssl" },
  { label: "CDN", icon: "cdn" },
  { label: "File Manager", icon: "folder" },
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
  "New File": "new-file",
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
  "Delete SSL": "trash",
  "Work Queue": "work-queue"
};

function iconForAction(label) {
  const normalized = String(label ?? "").replace(/^\+\s*/, "").trim();
  return actionIconByLabel[normalized] ?? actionIconByLabel[label] ?? "more";
}

const websiteMoreFunctionColumns = [
  {
    title: "Website Configuration",
    items: [
      { label: "Site Name", icon: "site-name" },
      { label: "Mapped Path", icon: "folder" },
      { label: "Site On/Off", icon: "power" },
      { label: "Domain Manager", icon: "globe" },
      { label: "Default Doc", icon: "default-doc" },
      { label: "Mime Type", icon: "mime" },
      { label: "Custom Errors", icon: "warning" },
      { label: "Detail Error Message Display", icon: "warning" },
      { label: "Delete Website", icon: "trash" }
    ]
  },
  {
    title: "Application & Runtime",
    items: [
      { label: "ASP.NET Version", icon: "aspnet" },
      { label: ".NET Core Mode", icon: "core" },
      { label: "PHP Version", icon: "php" },
      { label: "PHP Settings", icon: "checklist" },
      { label: "Node.js App", icon: "node" },
      { label: "Create .Net App", icon: "apps" },
      { label: "Virtual Dir", icon: "virtual-dir" },
      { label: "ScriptMap", icon: "scriptmap" },
      { label: "SMTP Sample Code", icon: "mail" }
    ]
  },
  {
    title: "Security & Access",
    items: [
      { label: "IP Deny", icon: "shield" },
      { label: "Force HTTPS", icon: "force-https" },
      { label: "Site Guard", icon: "shield" },
      { label: "Outgoing Port", icon: "outgoing" },
      { label: "IIS Log Manager", icon: "logs" },
      { label: "Visitor Stats", icon: "stats" },
      { label: "Remote IIS Manager", icon: "remote-iis" },
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
websiteMoreFunctionKeyByLabel["Detail Error Message Display"] = "detail-error";

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
  const [twoFactorLogin, setTwoFactorLogin] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("controlpanel-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("auth-route", route === "login");
    return () => document.documentElement.classList.remove("auth-route");
  }, [route]);

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
          if (result.user?.isControlPanelLogin && (route === "panel" || route === "login")) {
            window.history.replaceState({}, "", savedPanelPath("/panel_cp", "hosting-panel-section"));
            setRoute("panel_cp");
          }
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

  useEffect(() => {
    if (!isAuthReady || !currentUser?.isControlPanelLogin) return;
    if (route === "panel" || route === "login") {
      window.history.replaceState({}, "", savedPanelPath("/panel_cp", "hosting-panel-section"));
      setRoute("panel_cp");
    }
  }, [currentUser, isAuthReady, route]);

  const goToPanel = (event) => {
    event?.preventDefault();
    if (currentUser?.isControlPanelLogin) {
      window.history.pushState({}, "", savedPanelPath("/panel_cp", "hosting-panel-section"));
      setRoute("panel_cp");
      return;
    }

    window.history.pushState({}, "", "/panel");
    setRoute("panel");
  };

  const goToControlPanel = (event) => {
    event?.preventDefault();
    window.history.pushState({}, "", savedPanelPath("/panel_cp", "hosting-panel-section"));
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
    resetChatWidgetsForNewLogin();
    setTwoFactorLogin("");
    setCurrentUser(user);
    if (user?.isControlPanelLogin) {
      window.history.pushState({}, "", savedPanelPath("/panel_cp", "hosting-panel-section"));
      setRoute("panel_cp");
      return;
    }

    window.history.pushState({}, "", "/panel");
    setRoute("panel");
  };

  const handleTwoFactorRequired = (login, event) => {
    event?.preventDefault();
    setTwoFactorLogin(login || "");
    window.history.pushState({}, "", "/account/2fa_verify");
    setRoute("two-factor");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
    resetChatWidgetsForNewLogin();
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

  if ((route === "panel" || route === "panel_cp" || route === "cp-renew-promotion" || route === "cp-renew" || route === "cp-upgrade-list") && !currentUser) return null;

  if (route === "panel_cp") {
    return (
      <>
        <HostingControlPanel theme={theme} currentUser={currentUser} onBackToPanel={goToPanel} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        <ChatbaseChatbot />
      </>
    );
  }

  if (route === "checkout") {
    return <CheckoutHandoff theme={theme} currentUser={currentUser} onBackToPanel={goToPanel} onToggleTheme={toggleTheme} />;
  }

  if (route === "cp-renew-promotion") {
    return (
      <>
        <AccountPanelShell theme={theme} currentUser={currentUser} activeTitle="Product Renew" onLogout={handleLogout} onToggleTheme={toggleTheme}>
          <CpRenewPromotionPage theme={theme} currentUser={currentUser} onBackToPanel={goToPanel} onToggleTheme={toggleTheme} embedded />
        </AccountPanelShell>
        <ChatbaseChatbot forceVisible />
      </>
    );
  }

  if (route === "cp-renew") {
    return (
      <>
        <AccountPanelShell theme={theme} currentUser={currentUser} activeTitle="Product Renew" onLogout={handleLogout} onToggleTheme={toggleTheme}>
          <CpRenewPage theme={theme} currentUser={currentUser} onBackToPanel={goToPanel} onToggleTheme={toggleTheme} embedded />
        </AccountPanelShell>
        <ChatbaseChatbot forceVisible />
      </>
    );
  }

  if (route === "cp-upgrade-list") {
    return (
      <>
        <AccountPanelShell theme={theme} currentUser={currentUser} activeTitle="Upgrade Hosting" onLogout={handleLogout} onToggleTheme={toggleTheme}>
          <CpUpgradeListPage embedded />
        </AccountPanelShell>
        <ChatbaseChatbot forceVisible />
      </>
    );
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

  if (route === "two-factor") {
    return <TwoFactorVerify theme={theme} login={twoFactorLogin} onVerified={handleLogin} onCancel={handleLogout} onToggleTheme={toggleTheme} />;
  }

  return route === "panel"
    ? (
      <>
        <Panel theme={theme} currentUser={currentUser} onLogout={handleLogout} onManageHosting={goToControlPanel} onToggleTheme={toggleTheme} />
        <ChatbaseChatbot />
      </>
    )
    : <Login onLogin={handleLogin} onTwoFactorRequired={handleTwoFactorRequired} theme={theme} onToggleTheme={toggleTheme} onForgotPassword={goToPasswordResetRequest} />;
}

function ChatbaseChatbot({ forceVisible = false }) {
  const [isHidden, setIsHidden] = useState(() => !forceVisible && getLiveChatSessionFlag());
  const [isCollapsed, setIsCollapsed] = useState(() => !forceVisible);

  useEffect(() => {
    if (forceVisible) {
      document.documentElement.classList.remove("ai-chat-hidden");
      document.documentElement.classList.remove("ai-chat-collapsed");
      for (const selector of ["#chatbase-message-bubbles", "#chatbase-bubble-button", "#chatbase-bubble-window"]) {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement) {
          element.style.display = "";
        }
      }
      return;
    }

    document.documentElement.classList.toggle("ai-chat-hidden", isHidden);
    document.documentElement.classList.toggle("ai-chat-collapsed", !isHidden && isCollapsed);
  }, [forceVisible, isHidden, isCollapsed]);

  useEffect(() => {
    if (forceVisible) {
      setIsHidden(false);
      setIsCollapsed(false);
      return undefined;
    }

    const handleLiveChatOpened = () => setIsHidden(true);
    window.addEventListener("controlpanel:live-chat-opened", handleLiveChatOpened);
    return () => {
      window.removeEventListener("controlpanel:live-chat-opened", handleLiveChatOpened);
      document.documentElement.classList.remove("ai-chat-hidden");
      document.documentElement.classList.remove("ai-chat-collapsed");
    };
  }, [forceVisible]);

  useEffect(() => {
    if (!forceVisible && isHidden) return;

    window.embeddedChatbotConfig = {
      chatbotId: chatbaseChatbotId,
      domain: chatbaseDomain
    };

    const existingScript = document.querySelector(`script[data-chatbase-chatbot="${chatbaseChatbotId}"]`);
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.defer = true;
    script.setAttribute("chatbotId", chatbaseChatbotId);
    script.setAttribute("domain", chatbaseDomain);
    script.setAttribute("data-chatbase-chatbot", chatbaseChatbotId);
    document.body.appendChild(script);
  }, [isHidden]);

  useEffect(() => {
    if (forceVisible || isHidden) return undefined;

    const collapseChatWindow = () => {
      if (!isCollapsed) return;
      const bubbleWindow = document.querySelector("#chatbase-bubble-window");
      if (bubbleWindow instanceof HTMLElement) {
        bubbleWindow.style.setProperty("display", "none", "important");
      }
    };

    const handleClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("#chatbase-bubble-button, #chatbase-message-bubbles")) {
        setIsCollapsed(false);
        document.documentElement.classList.remove("ai-chat-collapsed");
        const bubbleWindow = document.querySelector("#chatbase-bubble-window");
        if (bubbleWindow instanceof HTMLElement) {
          bubbleWindow.style.display = "";
        }
      }
    };

    collapseChatWindow();
    const observer = new MutationObserver(collapseChatWindow);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
    document.addEventListener("click", handleClick, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
    };
  }, [forceVisible, isHidden, isCollapsed]);

  return null;
}

function ensureOlarkLiveChat() {
  if (typeof window.olark === "function") {
    return Promise.resolve();
  }

  const queueState = { s: [], t: [+new Date()], c: {}, l: "static.olark.com/jsclient/loader.js" };
  const olarkQueue = function olarkQueue() {
    queueState.s.push(arguments);
    queueState.t.push(+new Date());
  };
  olarkQueue._ = queueState;
  olarkQueue.extend = function extendOlark(name, value) {
    olarkQueue("extend", name, value);
  };
  olarkQueue.identify = function identifyOlark(siteId) {
    olarkQueue("identify", queueState.i = siteId);
  };
  olarkQueue.configure = function configureOlark(name, value) {
    olarkQueue("configure", name, value);
    queueState.c[name] = value;
  };
  window.olark = olarkQueue;
  window.olark.configure("system.hb_position", "left");
  window.olark.identify(olarkSiteId);

  const existingScript = document.querySelector("script[data-olark-loader='true']");
  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    const firstScript = document.getElementsByTagName("script")[0];
    script.async = true;
    script.src = "https://static.olark.com/jsclient/loader.js";
    script.setAttribute("data-olark-loader", "true");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => resolve(), { once: true });
    firstScript.parentNode.insertBefore(script, firstScript);
  });
}

async function openOlarkLiveChat() {
  setLiveChatSessionFlag();
  window.dispatchEvent(new CustomEvent("controlpanel:live-chat-opened"));
  await ensureOlarkLiveChat();
  injectOlarkCompactLauncherStyle();

  if (typeof window.olark === "function") {
    window.olark.configure?.("system.hb_position", "left");
    window.olark("api.box.expand");
  }

  window.setTimeout(() => {
    injectOlarkCompactLauncherStyle();
    positionOlarkLauncherLeft();
    const launchButton = document.querySelector(".olark-launch-button");
    if (launchButton instanceof HTMLButtonElement) {
      launchButton.click();
    }
  }, 350);

  window.setTimeout(positionOlarkLauncherLeft, 900);
  window.setTimeout(positionOlarkLauncherLeft, 1800);

  window.setTimeout(() => {
    if (document.querySelector("#olark-container")) return;
    window.open(liveChatFallbackUrl, "_blank", "noopener,noreferrer");
  }, 2000);
}

function positionOlarkLauncherLeft() {
  const wrapper = document.querySelector(".olark-launch-button-wrapper");
  if (wrapper instanceof HTMLElement) {
    wrapper.style.setProperty("left", "22px", "important");
    wrapper.style.setProperty("right", "auto", "important");
    wrapper.style.setProperty("bottom", "22px", "important");
  }

  const launchButton = document.querySelector(".olark-launch-button");
  if (launchButton instanceof HTMLElement) {
    launchButton.style.setProperty("align-items", "center", "important");
    launchButton.style.setProperty("border-radius", "999px", "important");
    launchButton.style.setProperty("display", "flex", "important");
    launchButton.style.setProperty("height", "52px", "important");
    launchButton.style.setProperty("justify-content", "center", "important");
    launchButton.style.setProperty("left", "0", "important");
    launchButton.style.setProperty("min-height", "52px", "important");
    launchButton.style.setProperty("min-width", "52px", "important");
    launchButton.style.setProperty("overflow", "hidden", "important");
    launchButton.style.setProperty("padding", "0", "important");
    launchButton.style.setProperty("right", "auto", "important");
    launchButton.style.setProperty("width", "52px", "important");
  }
}

function injectOlarkCompactLauncherStyle() {
  const styleId = "controlpanel-olark-compact-launcher";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .olark-launch-button-wrapper {
      bottom: 22px !important;
      left: 22px !important;
      right: auto !important;
    }
    .olark-launch-button {
      align-items: center !important;
      background: #0f172a !important;
      border: 1px solid rgba(147, 197, 253, 0.55) !important;
      border-radius: 999px !important;
      bottom: 22px !important;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.42) !important;
      display: flex !important;
      height: 52px !important;
      justify-content: center !important;
      min-height: 52px !important;
      min-width: 52px !important;
      overflow: hidden !important;
      padding: 0 !important;
      left: 22px !important;
      right: auto !important;
      width: 52px !important;
    }
    .olark-launch-button::before {
      background-color: #ffffff;
      content: "";
      display: block;
      height: 22px;
      width: 22px;
      -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.6 8.6 0 0 1-7.7 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.6A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 11h.01M12 11h.01M16 11h.01' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E") center / contain no-repeat;
      mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.6 8.6 0 0 1-7.7 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.6A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 11h.01M12 11h.01M16 11h.01' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E") center / contain no-repeat;
    }
    .olark-launch-button svg,
    .olark-launch-button img,
    .olark-launch-button span,
    .olark-launch-button div,
    .olark-launch-button p {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

function restoreAiChatForNewLogin() {
  clearLiveChatSessionFlag();
  document.documentElement.classList.remove("ai-chat-hidden");
  for (const selector of ["#chatbase-message-bubbles", "#chatbase-bubble-button", "#chatbase-bubble-window"]) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      element.style.display = "";
    }
  }
}

function hideOlarkWidget() {
  const olarkContainer = document.querySelector("#olark-container");
  if (olarkContainer instanceof HTMLElement) {
    olarkContainer.style.display = "none";
  }
  const olarkWrapper = document.querySelector("#olark-wrapper");
  if (olarkWrapper instanceof HTMLElement) {
    olarkWrapper.style.display = "none";
  }
  const olarkLaunch = document.querySelector(".olark-launch-button");
  if (olarkLaunch instanceof HTMLElement) {
    olarkLaunch.style.display = "none";
  }
}

function resetChatWidgetsForNewLogin() {
  restoreAiChatForNewLogin();
  hideOlarkWidget();
}

function getLiveChatSessionFlag() {
  try {
    return window.sessionStorage?.getItem(liveChatSessionKey) === "1" || liveChatOpenedInMemory;
  } catch {
    return liveChatOpenedInMemory;
  }
}

function setLiveChatSessionFlag() {
  liveChatOpenedInMemory = true;
  try {
    window.sessionStorage?.setItem(liveChatSessionKey, "1");
  } catch {
    // Some embedded browsers disable sessionStorage; the in-memory flag still covers this login.
  }
}

function clearLiveChatSessionFlag() {
  liveChatOpenedInMemory = false;
  try {
    window.sessionStorage?.removeItem(liveChatSessionKey);
  } catch {
    // Ignore storage restrictions.
  }
}

function appRouteFromPath(pathname) {
  if (pathname === "/panel") return "panel";
  if (pathname === "/panel_cp") return "panel_cp";
  if (pathname === "/account/cp_renew_promotion") return "cp-renew-promotion";
  if (pathname === "/account/cp_renew") return "cp-renew";
  if (pathname === "/account/cp_upgrade_list") return "cp-upgrade-list";
  if (pathname === "/account/printreceipt" || pathname === "/invoice") return "invoice";
  if (pathname.startsWith("/checkout")) return "checkout";
  if (pathname === "/account/emailchangeverify") return "email-verify";
  if (pathname === "/account/retrieve_password") return "password-reset-request";
  if (pathname === "/account/retrieve_password_reset") return "password-reset-confirm";
  if (pathname === "/account/2fa_verify") return "two-factor";
  return "login";
}

function isPublicRoute(route) {
  return ["login", "checkout", "invoice", "email-verify", "password-reset-request", "password-reset-confirm", "two-factor"].includes(route);
}

function activeSectionFromUrl(allowedSections, fallback, storageKey = "") {
  const section = new URLSearchParams(window.location.search).get("section");
  if (allowedSections.includes(section)) return section;
  if (storageKey) {
    const savedSection = localStorage.getItem(storageKey);
    if (allowedSections.includes(savedSection)) return savedSection;
  }
  return fallback;
}

function rememberSection(path, section, storageKey) {
  if (!section) return;
  if (storageKey) localStorage.setItem(storageKey, section);
  const url = new URL(window.location.href);
  if (url.pathname !== path) return;
  url.searchParams.set("section", section);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function savedPanelPath(path, storageKey) {
  const section = localStorage.getItem(storageKey);
  return section ? `${path}?section=${encodeURIComponent(section)}` : path;
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
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
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

  async function applyCoupon(event) {
    event.preventDefault();
    if (!guid || !couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setOrderMessage("");

    try {
      const response = await fetch(`/api/account/checkout-temp/${encodeURIComponent(guid)}/coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode })
      });
      const result = await response.json().catch(() => null);
      setOrderMessage(result?.message ?? "Unable to apply coupon.");
      if (response.ok && result?.success) {
        setOrder(result.order);
        setCheckoutState(result);
        setCouponCode("");
      }
    } catch {
      setOrderMessage("Unable to reach coupon service.");
    } finally {
      setIsApplyingCoupon(false);
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
          {order?.info4 && <div><dt>Coupon</dt><dd>{order.info4}</dd></div>}
          {order?.renewInfo && <div><dt>Renew Info</dt><dd>{order.renewInfo}</dd></div>}
          {order?.fulfillmentPath && <div><dt>Next Step</dt><dd>{order.fulfillmentPath}</dd></div>}
          {!!shortfall && <div><dt>Remaining</dt><dd>{formatMoney(shortfall)}</dd></div>}
        </dl>
        {!isRenewTemp && order && !orderPaid && !orderProcessed && (
          <form className="checkout-coupon-form" onSubmit={applyCoupon}>
            <label>
              Coupon Code
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Extra3Mo"
                autoComplete="off"
              />
            </label>
            <button className="secondary-button checkout-dark-button" type="submit" disabled={isApplyingCoupon || !couponCode.trim()}>
              {isApplyingCoupon ? <LoadingIcon label="Applying coupon" /> : "Apply"}
            </button>
          </form>
        )}
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

function TwoFactorVerify({ theme, login, onVerified, onCancel, onToggleTheme }) {
  const [oneCode, setOneCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerifySubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ oneCode })
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success || !result?.user) {
        setMessage(result?.message ?? "Invalid PIN.");
        return;
      }

      onVerified(result.user, event);
    } catch {
      setMessage("Unable to reach the 2FA verification service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand" href="/" aria-label="ControlPanel home" onClick={onCancel}>
          <span className="brand-mark login-server-icon" aria-hidden="true"><MenuIcon name="server" /></span>
          <span>ControlPanel</span>
        </a>
        <nav className="login-links" aria-label="Top navigation">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </nav>
      </header>

      <section className="login-card" aria-label="Two-step authentication">
        <div className="login-card-header">
          <div className="product-mark login-server-icon" aria-hidden="true"><MenuIcon name="shield" /></div>
          <h1>Two-step authentication</h1>
          <p>Enter the six-digit code from your authenticator app{login ? ` for ${login}` : ""}.</p>
        </div>

        <form className="login-form" onSubmit={handleVerifySubmit}>
          <label>
            Authenticator code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={oneCode}
              onChange={(event) => setOneCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>
          {message && <p className="login-error">{message}</p>}
          <button className="primary-button full" type="submit" disabled={isSubmitting || oneCode.length !== 6}>
            {isSubmitting ? <LoadingIcon label="Verifying code" /> : "Verify"}
          </button>
          <button className="secondary-button full" type="button" onClick={onCancel}>
            Back to Login
          </button>
        </form>
      </section>
    </main>
  );
}

function Login({ onLogin, onTwoFactorRequired, theme, onToggleTheme, onForgotPassword }) {
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

    const isTurnstileTestKey = turnstileConfig.siteKey === cloudflareTurnstileTestSiteKey;
    if (turnstileConfig.turnstileEnabled && !turnstileToken && !isTurnstileTestKey) {
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

      if (result.requiresTwoFactor) {
        onTwoFactorRequired(result.login || login, event);
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
    const allowedSections = [...sections.map((item) => item.id), "new-order", "helpdesk"];
    return activeSectionFromUrl(allowedSections, "hosting", "account-panel-section");
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
      const latestOpenTicket = openTickets[0];
      if (latestOpenTicket) {
        setHelpdeskStatus(helpdeskStatusInfo(latestOpenTicket).tone);
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
    rememberSection("/panel", activeSection, "account-panel-section");
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
          <button type="button" onClick={openOlarkLiveChat}>
            <MenuIcon name="chat" />
            <span>24/7 Live Chat</span>
          </button>
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
                helpdeskStatus === "staff" ? "red" : "",
                helpdeskStatus === "waiting" ? "grey" : ""
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
            <p className="kicker">Account Panel</p>
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

function AccountPanelShell({ theme, currentUser, activeTitle = "Account Panel", onLogout, onToggleTheme, children }) {
  const [dashboard, setDashboard] = useState(null);
  const [accountStats, setAccountStats] = useState({
    domains: null,
    vpn: null,
    addons: null,
    billingRenewals: null,
    balance: null
  });
  const [helpdeskStatus, setHelpdeskStatus] = useState("unknown");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const realHostingCount = dashboard?.hostingAccounts?.filter((account) => account.status === "Active").length;
  const renderedSections = sections.map((section) => {
    if (section.id === "hosting" && realHostingCount !== undefined) return { ...section, stat: String(realHostingCount) };
    if (section.id === "domain" && accountStats.domains !== null) return { ...section, stat: String(accountStats.domains) };
    if (section.id === "vpn" && accountStats.vpn !== null) return { ...section, stat: String(accountStats.vpn) };
    if (section.id === "addon" && accountStats.addons !== null) return { ...section, stat: String(accountStats.addons) };
    if (section.id === "billing" && accountStats.billingRenewals !== null) return { ...section, stat: String(accountStats.billingRenewals), statTone: "warning" };
    return section;
  });
  const sidebarBrandName = (dashboard?.customer?.brandDomain || "smarterasp.net").toUpperCase();
  const accountFunds = accountStats.balance === null ? "$0.00" : formatUsdFull(accountStats.balance);
  const headerAccountLogin = dashboard?.customer?.login ?? currentUser?.login ?? "";
  const headerCustomerId = dashboard?.customer?.customerId ?? currentUser?.customerId ?? "";

  useEffect(() => {
    let isMounted = true;

    async function loadShellData() {
      const [dashboardResult, domainResult, vpnResult, addonResult, billingResult, helpdeskResult] = await Promise.allSettled([
        fetch("/api/account/dashboard").then((response) => response.json()),
        fetch("/api/account/domains").then((response) => response.json()),
        fetch("/api/account/vpn").then((response) => response.json()),
        fetch("/api/account/addons").then((response) => response.json()),
        fetch("/api/account/billing").then((response) => response.json()),
        fetch("/api/account/helpdesk").then((response) => response.json())
      ]);
      if (!isMounted) return;

      if (dashboardResult.status === "fulfilled" && dashboardResult.value?.success) {
        setDashboard(dashboardResult.value.dashboard);
      }

      setAccountStats({
        domains: domainResult.status === "fulfilled" && domainResult.value?.success ? domainResult.value.domains?.length ?? 0 : null,
        vpn: vpnResult.status === "fulfilled" && vpnResult.value?.success ? vpnResult.value.dashboard?.used ?? 0 : null,
        addons: addonResult.status === "fulfilled" && addonResult.value?.success ? addonResult.value.dashboard?.activeAddons?.length ?? 0 : null,
        billingRenewals: billingResult.status === "fulfilled" && billingResult.value?.success ? billingResult.value.dashboard?.renewalNotices?.length ?? 0 : null,
        balance: billingResult.status === "fulfilled" && billingResult.value?.success ? billingResult.value.dashboard?.balance?.amount ?? null : null
      });

      if (helpdeskResult.status === "fulfilled" && helpdeskResult.value?.success) {
        const latestOpenTicket = helpdeskResult.value.dashboard?.openTickets?.[0];
        setHelpdeskStatus(latestOpenTicket ? helpdeskStatusInfo(latestOpenTicket).tone : "none");
      }
    }

    loadShellData();
    return () => {
      isMounted = false;
    };
  }, []);

  function goToAccountSection(sectionId) {
    window.location.href = `/panel?section=${encodeURIComponent(sectionId)}`;
  }

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
                section.id === "hosting" ? "active" : "",
                section.tone === "order" ? "new-order-item" : ""
              ].filter(Boolean).join(" ")}
              key={section.id}
              type="button"
              onClick={() => goToAccountSection(section.id)}
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
          <button type="button" onClick={openOlarkLiveChat}>
            <MenuIcon name="chat" />
            <span>24/7 Live Chat</span>
          </button>
          <button type="button" onClick={() => goToAccountSection("knowledge-base")}>
            <MenuIcon name="book" />
            <span>Knowledge Base</span>
          </button>
          <button type="button" onClick={() => goToAccountSection("helpdesk")}>
            <MenuIcon name="ticket" />
            <span>24/7 Helpdesk</span>
            <span
              aria-hidden="true"
              className={[
                "support-status-dot",
                helpdeskStatus === "staff" ? "red" : "",
                helpdeskStatus === "waiting" ? "grey" : ""
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
            <p className="kicker">Account Panel</p>
            <div className="workspace-title-row">
              <h1>{activeTitle}</h1>
            </div>
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
        {children}
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
  const initialSection = useMemo(() => {
    const allowedSections = [
      ...controlPanelSections.map((section) => section.id),
      ...controlPanelSections.flatMap((section) => section.children?.map((child) => child.id) ?? []),
      "helpdesk"
    ];
    return activeSectionFromUrl(allowedSections, "dashboard", "hosting-panel-section");
  }, []);
  const [activeSection, setActiveSection] = useState(initialSection);
  const databaseSectionIds = ["databases", "mssql", "mysql", "sql-reporting", "advanced-customer-backup", "postgresql"];
  const [isDatabaseMenuOpen, setIsDatabaseMenuOpen] = useState(databaseSectionIds.includes(initialSection));
  const emailSectionIds = ["emails", "email", "corporate-email"];
  const [isEmailMenuOpen, setIsEmailMenuOpen] = useState(emailSectionIds.includes(initialSection));
  const [isAdvanceMenuOpen, setIsAdvanceMenuOpen] = useState(["advance", "schedule-tasks", "outgoing-port", "control-panel-users", "webconfig-encrypt", "work-queue", "remote-site-backup"].includes(initialSection));
  const [hostingPlanOptions, setHostingPlanOptions] = useState([]);
  const [selectedCpId, setSelectedCpId] = useState(0);
  const [isHostingPlanMenuOpen, setIsHostingPlanMenuOpen] = useState(false);
  const [accountFunds, setAccountFunds] = useState(null);
  const [sectionCounts, setSectionCounts] = useState({ websites: null, databases: null });
  const [sidebarBrandName, setSidebarBrandName] = useState("SMARTERASP.NET");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fileManagerContext, setFileManagerContext] = useState({ path: "", fromWebsites: false });
  const activeTitle = useMemo(
    () => activeSection === "helpdesk"
      ? "24/7 Helpdesk"
      : activeSection === "mssql"
        ? "MSSQL"
      : activeSection === "mysql"
        ? "MySQL"
        : activeSection === "sql-reporting"
          ? "SQL Reporting"
          : activeSection === "advanced-customer-backup"
            ? "Advance Customer Backup"
        : activeSection === "postgresql"
          ? "PostgreSQL"
        : activeSection === "email"
          ? "Email"
          : activeSection === "corporate-email"
            ? "Corporate Email"
      : controlPanelSections.find((section) => section.id === activeSection)?.label
        ?? controlPanelSections.flatMap((section) => section.children ?? []).find((section) => section.id === activeSection)?.label
        ?? "Dashboard",
    [activeSection]
  );
  const isControlPanelLogin = Boolean(currentUser?.isControlPanelLogin);
  const displayLogin = currentUser?.cpLogin || currentUser?.login || "Account";
  const selectedHostingPlan = hostingPlanOptions.find((plan) => Number(plan.cpId) === Number(selectedCpId)) ?? hostingPlanOptions[0];
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

        const rawPlans = result.dashboard?.hostingAccounts ?? [];
        setSidebarBrandName((result.dashboard?.customer?.brandDomain || "smarterasp.net").toUpperCase());
        const currentCpId = Number(currentUser?.cpId) || 0;
        const currentCpLogin = String(currentUser?.cpLogin || "").trim().toLowerCase();
        const plans = currentUser?.isControlPanelLogin
          ? rawPlans.filter((plan) => {
            const planCpId = Number(plan.cpId) || 0;
            const planCpLogin = String(plan.cpLogin || "").trim().toLowerCase();
            return (currentCpId > 0 && planCpId === currentCpId) || (currentCpLogin && planCpLogin === currentCpLogin);
          })
          : rawPlans;
        setHostingPlanOptions(plans);
        if (billingResponse.ok && billingResult?.success) {
          setAccountFunds(formatUsdFull(billingResult.dashboard?.balance?.amount ?? 0));
        }
        if (plans.length) {
          setSelectedCpId((currentSelectedCpId) => currentUser?.isControlPanelLogin ? plans[0].cpId : currentSelectedCpId || plans[0].cpId);
        }
      } catch {
        if (isMounted) setHostingPlanOptions([]);
      }
    }

    loadHostingPlans();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.cpId, currentUser?.isControlPanelLogin]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    rememberSection("/panel_cp", activeSection, "hosting-panel-section");
  }, [activeSection, selectedCpId]);

  function openFileManagerAtPath(path) {
    setFileManagerContext({ path: path || "", fromWebsites: true });
    setActiveSection("files");
  }

  useEffect(() => {
    if (!selectedCpId) {
      setSectionCounts({ websites: null, databases: null });
      return;
    }

    let isMounted = true;
    setSectionCounts({ websites: null, databases: null });

    async function loadSectionCounts() {
      const [sitesResult, databasesResult] = await Promise.allSettled([
        fetch(hostingApiUrl("/api/hosting/sites", selectedCpId)).then((response) => response.json().then((body) => ({ ok: response.ok, body }))),
        fetch(hostingApiUrl("/api/hosting/databases", selectedCpId)).then((response) => response.json().then((body) => ({ ok: response.ok, body })))
      ]);

      if (!isMounted) return;

      setSectionCounts({
        websites: sitesResult.status === "fulfilled" && sitesResult.value.ok && sitesResult.value.body?.success
          ? sitesResult.value.body.dashboard?.sites?.length ?? 0
          : 0,
        databases: databasesResult.status === "fulfilled" && databasesResult.value.ok && databasesResult.value.body?.success
          ? databasesResult.value.body.dashboard?.totals?.total ?? databasesResult.value.body.dashboard?.databases?.length ?? 0
          : 0
      });
    }

    loadSectionCounts();
    return () => {
      isMounted = false;
    };
  }, [selectedCpId]);

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
          {isControlPanelLogin ? (
            <div className="brand project-brand cp-static-brand" aria-label="Current brand">
              <span className="brand-server-icon" aria-hidden="true">
                <MenuIcon name="server" />
              </span>
              <span className="brand-name">{sidebarBrandName}</span>
            </div>
          ) : (
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
                      aria-selected={Number(selectedCpId) === Number(plan.cpId)}
                      className={Number(selectedCpId) === Number(plan.cpId) ? "mock-plan-option active" : "mock-plan-option"}
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
          )}
        </div>
        <nav className="side-nav" aria-label="Hosting control panel sections">
          {!isControlPanelLogin && (
            <button className="nav-item back-account-item" type="button" onClick={onBackToPanel}>
              <span className="nav-label">
                <MenuIcon name="back" />
                <span>Back to Account</span>
              </span>
            </button>
          )}
          {controlPanelSections.map((section) => {
            const isDatabaseSection = section.id === "databases";
            const isDatabaseActive = isDatabaseSection && databaseSectionIds.includes(activeSection);
            const isEmailSection = section.id === "emails";
            const isEmailActive = isEmailSection && emailSectionIds.includes(activeSection);
            const isAdvanceSection = section.id === "advance";
            const isAdvanceActive = isAdvanceSection && ["advance", "schedule-tasks", "outgoing-port", "control-panel-users", "webconfig-encrypt", "work-queue", "remote-site-backup"].includes(activeSection);
            return (
              <div className={(isDatabaseSection || isEmailSection || isAdvanceSection) ? "nav-group" : ""} key={section.id}>
                <button
                  className={(section.id === activeSection || isDatabaseActive || isEmailActive || isAdvanceActive) ? "nav-item active" : "nav-item"}
                  type="button"
                  onClick={() => {
                    if (isDatabaseSection) {
                      setIsDatabaseMenuOpen((open) => !open);
                      return;
                    }
                    if (isEmailSection) {
                      setIsEmailMenuOpen((open) => !open);
                      return;
                    }
                    if (isAdvanceSection) {
                      setIsAdvanceMenuOpen((open) => !open);
                      return;
                    }
                    if (section.id === "files") {
                      setFileManagerContext({ path: "", fromWebsites: false });
                    }
                    setActiveSection(section.id);
                  }}
                >
                  <span className="nav-label">
                    <MenuIcon name={section.icon} />
                    <span>{section.label}</span>
                  </span>
                  {isDatabaseSection || isEmailSection || isAdvanceSection ? (
                    <MenuIcon name="chevron-down" />
                  ) : ["websites"].includes(section.id) && sectionCounts[section.id] !== null ? (
                    <span className="nav-stat badge-counter" aria-label={`${section.label} count`}>
                      {sectionCounts[section.id]}
                    </span>
                  ) : null}
                </button>
                {isDatabaseSection && isDatabaseMenuOpen && (
                  <div className="nav-submenu" aria-label="Database engines">
                    {section.children.map((child) => (
                      <button
                        className={activeSection === child.id ? "nav-subitem active" : "nav-subitem"}
                        disabled={Boolean(child.disabled)}
                        key={child.id}
                        type="button"
                        onClick={() => {
                          if (!child.disabled) setActiveSection(child.id);
                        }}
                      >
                        <span className="nav-label">
                          <MenuIcon name={child.icon} />
                          <span>{child.label}</span>
                        </span>
                        {child.id === "postgresql" && <span className="nav-stat muted">Soon</span>}
                      </button>
                    ))}
                  </div>
                )}
                {isEmailSection && isEmailMenuOpen && (
                  <div className="nav-submenu" aria-label="Email services">
                    {section.children.map((child) => (
                      <button
                        className={activeSection === child.id ? "nav-subitem active" : "nav-subitem"}
                        key={child.id}
                        type="button"
                        onClick={() => setActiveSection(child.id)}
                      >
                        <span className="nav-label">
                          <MenuIcon name={child.icon} />
                          <span>{child.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {isAdvanceSection && isAdvanceMenuOpen && (
                  <div className="nav-submenu" aria-label="Advanced tools">
                    {section.children.map((child) => (
                      <button
                        className={activeSection === child.id ? "nav-subitem active" : "nav-subitem"}
                        key={child.id}
                        type="button"
                        onClick={() => setActiveSection(child.id)}
                      >
                        <span className="nav-label">
                          <MenuIcon name={child.icon} />
                          <span>{child.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="support-links" aria-label="Support links">
          <p className="support-title">
            <MenuIcon name="support" />
            <span>Support</span>
          </p>
          <button type="button" onClick={openOlarkLiveChat}>
            <MenuIcon name="chat" />
            <span>24/7 Live Chat</span>
          </button>
          <a href="http://localhost:5056/panel#knowledge-base">
            <MenuIcon name="book" />
            <span>Knowledge Base</span>
          </a>
          <button type="button" onClick={() => setActiveSection("helpdesk")}>
            <MenuIcon name="ticket" />
            <span>24/7 Helpdesk</span>
          </button>
        </div>
      </aside>

      <main className="workspace">
        <div className="workspace-header">
          <div>
            <p className="kicker">Hosting Control Panel</p>
            <h1>{activeTitle}</h1>
          </div>
          <div className="workspace-actions">
            <button className="secondary-button compact" type="button" onClick={onBackToPanel}>Back to Plans</button>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <button className="secondary-button compact" type="button" onClick={onLogout}>Logout</button>
          </div>
        </div>
        {activeSection === "dashboard" && <HostingDashboard cpId={selectedCpId} currentUser={currentUser} />}
        {activeSection === "websites" && <WebsitesSection cpId={selectedCpId} currentUser={currentUser} onChangeSection={setActiveSection} onOpenFileManager={openFileManagerAtPath} />}
        {activeSection === "databases" && <DatabasesSection cpId={selectedCpId} engine="All" />}
        {activeSection === "mssql" && <DatabasesSection cpId={selectedCpId} engine="MSSQL" />}
        {activeSection === "mysql" && <DatabasesSection cpId={selectedCpId} engine="MySQL" />}
        {activeSection === "sql-reporting" && <SqlReportingSection cpId={selectedCpId} />}
        {activeSection === "advanced-customer-backup" && <AdvancedCustomerBackupSection cpId={selectedCpId} />}
        {activeSection === "postgresql" && <HostingCpPlaceholder title="PostgreSQL" />}
        {activeSection === "emails" && <EmailsSection cpId={selectedCpId} mode="all" />}
        {activeSection === "email" && <EmailsSection cpId={selectedCpId} mode="hosted" />}
        {activeSection === "corporate-email" && <EmailsSection cpId={selectedCpId} mode="corporate" />}
        {activeSection === "files" && (
          <FilesSection
            cpId={selectedCpId}
            initialPath={fileManagerContext.path}
            showBackToWebsites={fileManagerContext.fromWebsites}
            onBackToWebsites={() => setActiveSection("websites")}
          />
        )}
        {activeSection === "apps" && <AppsSection cpId={selectedCpId} />}
        {activeSection === "ftp" && <FtpSection cpId={selectedCpId} />}
        {activeSection === "dns" && <DomainServicesSection mode="dns" cpId={selectedCpId} />}
        {activeSection === "cdn" && <DomainServicesSection mode="cdn" cpId={selectedCpId} />}
        {activeSection === "ssl" && <DomainServicesSection mode="ssl" cpId={selectedCpId} />}
        {activeSection === "advance" && <AdvanceSection cpId={selectedCpId} />}
        {activeSection === "helpdesk" && <HelpdeskSection />}
        {![
          "dashboard",
          "websites",
          "databases",
          "mssql",
          "mysql",
          "sql-reporting",
          "advanced-customer-backup",
          "postgresql",
          "emails",
          "email",
          "corporate-email",
          "files",
          "apps",
          "ftp",
          "dns",
          "cdn",
          "ssl",
          "advance",
          "schedule-tasks",
          "outgoing-port",
          "control-panel-users",
          "webconfig-encrypt",
          "work-queue",
          "remote-site-backup",
          "helpdesk"
        ].includes(activeSection) && <HostingCpPlaceholder title={activeTitle} />}
        {["schedule-tasks", "outgoing-port", "control-panel-users", "webconfig-encrypt", "work-queue", "remote-site-backup"].includes(activeSection) && <HostingCpPlaceholder title={activeTitle} />}
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
  return domain.endsWith("tempurl.com") || domain.endsWith(".site4now.net") || domain.endsWith(".mysitepanel.net");
}

function shouldShowTemporaryUrlWaitTip(message) {
  return /Website created with temporary URL:/i.test(String(message || ""));
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

async function deleteHostingWorkqueue(cpId, id) {
  const response = await fetch(hostingApiUrl(`/api/hosting/workqueue/${id}`, cpId), {
    method: "DELETE"
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? "Unable to delete queue item.");
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

function HostingDashboard({ cpId, currentUser }) {
  const [dashboard, setDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [poolDrawer, setPoolDrawer] = useState(null);
  const [poolRuntime, setPoolRuntime] = useState(null);
  const [poolMessage, setPoolMessage] = useState("");
  const [poolActionDetails, setPoolActionDetails] = useState(null);
  const [isLoadingPools, setIsLoadingPools] = useState(false);
  const [isRunningPoolAction, setIsRunningPoolAction] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [copiedDns, setCopiedDns] = useState(false);
  const serverLogs = dashboard?.healthLogs ?? [];
  const usageStats = dashboard?.metrics?.length
    ? dashboard.metrics.map((metric) => [metric.value, metric.label])
    : [];
  const ramQuota = dashboard?.ramQuotaMb ?? 0;
  const ramUsed = dashboard?.ramUsedMb ?? 0;
  const ramPercentage = Math.max(0, Math.min(100, Math.round((ramUsed / Math.max(ramQuota, 1)) * 100)));
  const dnsServers = dashboard?.dnsServers?.length ? dashboard.dnsServers : ["NS1.SITE4NOW.NET", "NS2.SITE4NOW.NET", "NS3.SITE4NOW.NET"];
  const migrations = securityDashboard?.migrations ?? [];
  const visibleMigrations = migrations.slice(0, 3);
  const healthSummary = dashboard?.healthSummary ?? {};
  const healthIssueCount = healthSummary.totalPast7Days ?? serverLogs.length;
  const communicationErrorCount = healthSummary.communicationErrorsPast7Days ?? 0;
  const recycleCount = healthSummary.recyclesPast7Days ?? 0;

  async function loadHostingDashboard(options = {}) {
    setIsLoadingDashboard(true);
    setDashboardError("");
    try {
      const dashboardResponse = await fetch(hostingApiUrl(`/api/hosting/dashboard${options.forceRefresh ? "?refresh=1" : ""}`, cpId));
      const result = await dashboardResponse.json().catch(() => null);
      if (!dashboardResponse.ok || !result?.success) {
        setDashboardError(result?.message ?? "Unable to load hosting dashboard.");
        return;
      }

      setDashboard(result.dashboard);
      fetch(hostingApiUrl("/api/hosting/security?includeSiteSecurity=1", cpId))
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

  async function loadPoolRuntime() {
    setIsLoadingPools(true);
    setPoolMessage("");
    setPoolActionDetails(null);
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/runtime", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setPoolMessage(result?.message ?? "Unable to load application pools.");
        return;
      }

      setPoolRuntime(result.dashboard);
    } catch {
      setPoolMessage("Unable to reach application pool service.");
    } finally {
      setIsLoadingPools(false);
    }
  }

  function openPoolDrawer(mode) {
    setPoolDrawer(mode);
    setPoolMessage("");
    setPoolActionDetails(null);
    if (mode !== "ram") {
      loadPoolRuntime();
    }
  }

  async function runPoolAction(action, pool = null, fields = {}) {
    setIsRunningPoolAction(true);
    setPoolMessage("");
    setPoolActionDetails(null);
    try {
      const response = await fetch("/api/hosting/pools/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpId,
          poolId: Number(pool?.details?.["Pool ID"] || pool?.poolId || 0),
          action,
          fields
        })
      });
      const result = await response.json().catch(() => null);
      setPoolMessage(result?.message ?? (response.ok ? "Application Pool action completed." : "Application Pool action failed."));
      setPoolActionDetails(result?.details ?? null);
      if (response.ok && result?.success) {
        const refreshTasks = [loadHostingDashboard({ forceRefresh: true })];
        if (pool) {
          refreshTasks.push(loadPoolRuntime());
        }
        await Promise.all(refreshTasks);
      }
    } catch (error) {
      setPoolMessage(error.message);
    } finally {
      setIsRunningPoolAction(false);
    }
  }

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
          {dashboard?.primaryDomain && <p>{dashboard.primaryDomain}</p>}
        </div>
        <dl className="cp-context-meta">
          <div><dt>Plan Type</dt><dd>{dashboard?.webHostType || "ASP.NET hosting"}</dd></div>
          <div><dt>Server</dt><dd>{dashboard?.serverId || "winhost"}</dd></div>
        </dl>
        <RefreshButton onClick={() => loadHostingDashboard({ forceRefresh: true })} />
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
        <div className="ram-usage-pane">
          <div className="ram-meter" style={{ "--ram-percent": `${ramPercentage}%` }} aria-label={`RAM usage ${ramPercentage} percent`}>
            <span>{ramPercentage}%</span>
            <small>{ramUsed} MB used</small>
          </div>
          <div className="ram-copy">
            <span className="status-pill blue">RAM Usage</span>
            <h2>Ram Usage</h2>
            <p>Memory usage for this hosting plan. (Click refresh to update)</p>
            <div className="ram-actions">
              <button className="secondary-button compact" type="button" disabled={isRunningPoolAction} onClick={() => runPoolAction("recycle")}>
                {isRunningPoolAction ? <LoadingIcon label="Recycling pool" /> : "Recycle Pool"}
              </button>
              <button className="secondary-button compact" type="button" onClick={() => openPoolDrawer("manage")}>Manage Pool</button>
              <button className="primary-button compact" type="button" onClick={() => openPoolDrawer("ram")}>+ Ram</button>
            </div>
            {poolMessage && <p className="ram-action-result">{poolMessage}</p>}
          </div>
        </div>
        <div className="health-summary-pane">
          <span className={healthIssueCount > 0 ? "status-pill warning" : "status-pill blue"}>Past 7 Days</span>
          <h2>{healthIssueCount} Health Issue{healthIssueCount === 1 ? "" : "s"}</h2>
          {(healthIssueCount > 1 || recycleCount > 1) && (
            <p className="health-ram-recommendation">Recommend Adding More Ram</p>
          )}
          <div className="health-counter-grid">
            <div>
              <strong>{communicationErrorCount}</strong>
              <span>Communication Error{communicationErrorCount === 1 ? "" : "s"}</span>
            </div>
            <div>
              <strong>{recycleCount}</strong>
              <span>Recycle{recycleCount === 1 ? "" : "s"}</span>
            </div>
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

      {!!usageStats.length && (
        <div className="usage-grid">
          {usageStats.map(([value, label]) => (
            <article className="panel-card usage-stat" key={label}>
              <span className="usage-stat-icon" aria-hidden="true">
                <UsageMetricIcon label={label} />
              </span>
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {serverLogs.length > 0 && (
        <article className="panel-card server-log-card">
          <h2>Health Log</h2>
          <div className="server-log-table" role="table" aria-label="Health Log">
            <div className="server-log-head" role="row">
              <span role="columnheader">TimeCreated</span>
              <span role="columnheader">Pool</span>
              <span role="columnheader">Message</span>
            </div>
            {serverLogs.map((log, index) => (
              <div className="server-log-row" role="row" key={`${log.poolName || "pool"}-${log.timeCreated}-${index}`}>
                <time dateTime={log.timeCreated}>{log.timeCreated}</time>
                <span>{log.poolName || dashboard?.cpLogin || "Pool"}</span>
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        </article>
      )}
      {poolDrawer && (
        <HostingPoolDrawer
          mode={poolDrawer}
          cpId={cpId}
          currentUser={currentUser}
          dashboard={dashboard}
          runtime={poolRuntime}
          isLoading={isLoadingPools}
          isRunning={isRunningPoolAction}
          message={poolMessage}
          actionDetails={poolActionDetails}
          onClose={() => setPoolDrawer(null)}
          onRefresh={loadPoolRuntime}
          onRunAction={runPoolAction}
        />
      )}
    </section>
  );
}

function UsageMetricIcon({ label }) {
  const normalized = String(label || "").toLowerCase();
  if (normalized.includes("ram")) {
    return (
      <svg viewBox="0 0 24 24">
        <rect x="5" y="6" width="14" height="12" rx="2" />
        <path d="M8 10h8M8 14h5M8 3v3M12 3v3M16 3v3M8 18v3M12 18v3M16 18v3" />
      </svg>
    );
  }

  if (normalized.includes("bandwidth")) {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="M12 14 16 9" />
        <path d="M6 18h12" />
      </svg>
    );
  }

  if (normalized.includes("disk")) {
    return (
      <svg viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v10c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
        <path d="M5 11c0 1.7 3.1 3 7 3s7-1.3 7-3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

function HostingPoolDrawer({ mode, cpId, currentUser, dashboard, runtime, isLoading, isRunning, message, actionDetails, onClose, onRefresh, onRunAction }) {
  const pools = runtime?.pools ?? [];
  const cpLogin = runtime?.cpLogin || dashboard?.cpLogin || "";
  const [ramEditorPool, setRamEditorPool] = useState(null);
  const [accountUserWarning, setAccountUserWarning] = useState("");
  const defaultPool = pools.find((pool) => String(pool.title || "").toLowerCase().includes(String(cpLogin).toLowerCase())) || pools[0] || null;

  function openAccountAddonSection(itemLabel = "this add-on") {
    if (currentUser?.isControlPanelLogin) {
      setAccountUserWarning(`You are currently signed in with a hosting control panel login. Please sign in with the main account login to purchase or manage ${itemLabel}.`);
      return;
    }

    window.location.href = "/panel?section=addon";
  }

  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="function-drawer panel-card settings-drawer hosting-pool-drawer" role="dialog" aria-modal="true" aria-label="Application Pool">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">Application Pool</span>
            <h2>{mode === "recycle" ? "Recycle Pool" : mode === "ram" ? "+ Ram" : "Manage Pool"}</h2>
            <p>{mode === "ram" ? "Upgrade RAM through the account billing flow." : "Manage application pools."}</p>
          </div>
          <div className="function-drawer-actions">
            {mode !== "ram" && <RefreshButton onClick={onRefresh} />}
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={onClose} aria-label="Close">
              <MenuIcon name="Close" />
            </button>
          </div>
        </header>

        {mode === "ram" ? (
          <article className="panel-card settings-drawer-card">
            <div className="database-card-header">
              <div>
                <span className="status-pill blue">RAM</span>
                <h3>Upgrade RAM</h3>
                <p>RAM upgrades are routed through the correct add-on or plan upgrade page for this hosting plan.</p>
              </div>
              <MenuIcon name="upgrade" />
            </div>
            <dl className="cp-context-meta drawer-meta">
              <div><dt>Current Usage</dt><dd>{dashboard?.ramUsedMb ?? 0} MB</dd></div>
              <div><dt>RAM Quota</dt><dd>{dashboard?.ramQuotaMb ?? 0} MB</dd></div>
              <div><dt>Plan</dt><dd>{dashboard?.webHostType || "-"}</dd></div>
            </dl>
            <button className="primary-button compact drawer-full-button" type="button" onClick={() => openAccountAddonSection("RAM")}>Continue to RAM Order</button>
          </article>
        ) : (
          <>
            {isLoading && <LoadingState label="Loading application pools" />}
            {message && <p className="sandbox-message">{message}</p>}
            {actionDetails?.logText && (
              <article className="pool-log-viewer" aria-label="Application Pool Log">
                <span className="status-pill blue">Pool Log</span>
                <pre>{actionDetails.logText}</pre>
              </article>
            )}
            {mode === "recycle" && (
              <article className="panel-card settings-drawer-card">
                <div className="database-card-header">
                  <div>
                    <span className="status-pill warning">Default Pool</span>
                    <h3>{defaultPool?.title || cpLogin || "Application Pool"}</h3>
                    <p>{defaultPool?.subtitle || "Restart the selected application pool."}</p>
                  </div>
                  <MenuIcon name="refresh" />
                </div>
                <button className="primary-button compact drawer-full-button" type="button" disabled={isRunning || !defaultPool} onClick={() => onRunAction("recycle", defaultPool)}>
                  {isRunning ? <LoadingIcon label="Recycling pool" /> : "Recycle Pool"}
                </button>
              </article>
            )}
            {mode === "manage" && (
              <div className="pool-manager-shell">
                <div className="pool-manager-toolbar">
                  <button className="secondary-button compact" type="button" onClick={() => openAccountAddonSection("additional application pools")}>+ Pool</button>
                  <button className="primary-button compact" type="button" onClick={() => openAccountAddonSection("RAM")}>+ Ram</button>
                </div>
                {!pools.length && !isLoading && <p className="runtime-empty">No application pool rows found.</p>}
                {!!pools.length && (
                  <div className="table-wrap pool-manager-table-wrap">
                    <table className="pool-manager-table">
                      <thead>
                        <tr>
                          <th>Pool Name</th>
                          <th>Current Version</th>
                          <th>Ram Configuration</th>
                          <th>Bit</th>
                          <th>Load User Profile</th>
                          <th>Websites</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pools.map((pool) => (
                          <PoolManagerRow key={`${pool.title}-${pool.details?.["Pool ID"]}`} pool={pool} isRunning={isRunning} onRunAction={onRunAction} onEditRam={setRamEditorPool} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {ramEditorPool && (
                  <PoolRamEditor
                    pool={ramEditorPool}
                    dashboard={dashboard}
                    isRunning={isRunning}
                    onClose={() => setRamEditorPool(null)}
                    onSave={(memory) => onRunAction("ram", ramEditorPool, { memory })}
                  />
                )}
                <PoolManagerTips />
              </div>
            )}
          </>
        )}
        {accountUserWarning && (
          <div className="modal-backdrop inline-modal-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAccountUserWarning("");
          }}>
            <section className="panel-card confirm-modal" role="dialog" aria-modal="true" aria-labelledby="account-user-required-title">
              <h2 id="account-user-required-title">Account Login Required</h2>
              <p>{accountUserWarning}</p>
              <div className="confirm-actions">
                <button className="primary-button compact" type="button" onClick={() => setAccountUserWarning("")}>OK</button>
              </div>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}

function PoolManagerRow({ pool, isRunning, onRunAction, onEditRam }) {
  const [selectedAction, setSelectedAction] = useState("");
  const details = pool.details ?? {};
  const poolName = details["Pool Name"] || pool.title || "-";
  const websites = details.Websites || "";
  const websiteCount = details["Website Count"] || (websites ? String(websites.split(",").length) : "0");
  const privateMemory = String(details["Private Memory"] || pool.subtitle || "").replace(/private memory/i, "").trim() || "-";

  function handleActionChange(value) {
    setSelectedAction(value);
    if (!value) return;
    if (value === "ram") {
      onEditRam(pool);
      return;
    }
    onRunAction(value, pool);
  }

  return (
    <tr>
      <td>{poolName}</td>
      <td>{details.Runtime || pool.status || "Runtime pending"}</td>
      <td>
        <span className="pool-memory-display">
          <span>{privateMemory}</span>
          <button className="secondary-button compact icon-only-button" type="button" onClick={() => onEditRam(pool)} title="Edit RAM" aria-label="Edit RAM">
            <MenuIcon name="edit" />
          </button>
        </span>
      </td>
      <td>{details.Bit || "-"}</td>
      <td>{details["Load User Profile"] || "-"}</td>
      <td>
        <span className="pool-websites" title={websites || "No websites assigned"}>
          {websiteCount === "0" ? "No websites" : `${websiteCount} site${websiteCount === "1" ? "" : "s"}`}
        </span>
      </td>
      <td>
        <div className="pool-table-actions">
          <select value={selectedAction} onChange={(event) => handleActionChange(event.target.value)} disabled={isRunning}>
            <option value="">Action</option>
            <option value="recycle">Restart Pool</option>
            <option value="stop">Stop Pool</option>
            <option value="start">Start Pool</option>
            <option value="environment-variables">Environment Variables</option>
            <option value="net-core">Change to .Net Core</option>
            <option value="aspnet-4-integrated">Change to ASP.NET 4.X Integrated</option>
            <option value="aspnet-4-classic">Change to ASP.NET 4.X Classic</option>
            <option value="aspnet-2-integrated">Change to ASP.NET 2.0/3.0/3.5 SP1 Integrated</option>
            <option value="aspnet-2-classic">Change to ASP.NET 2.0/3.0/3.5 SP1 Classic</option>
            <option value="32-bit">Change to 32-bit</option>
            <option value="64-bit">Change to 64-bit</option>
            <option value="enable-load-user-profile">Enable Load User Profile</option>
            <option value="disable-load-user-profile">Disable Load User Profile</option>
            <option value="view-log">View Pool Log</option>
            <option value="delete">Delete Pool</option>
            <option value="ram">Update RAM</option>
          </select>
          {isRunning && selectedAction && <LoadingIcon label="Running pool action" />}
        </div>
      </td>
    </tr>
  );
}

function PoolRamEditor({ pool, dashboard, isRunning, onClose, onSave }) {
  const details = pool.details ?? {};
  const poolName = details["Pool Name"] || pool.title || "-";
  const currentQuota = Number(String(details["Private Memory"] || "").replace(/[^\d.]/g, "")) || 1024;
  const hasNoMax = String(dashboard?.webHostType || "").startsWith("W2") || String(dashboard?.webHostType || "").includes("V68");
  const maxQuota = hasNoMax ? 40960 : currentQuota;
  const [memory, setMemory] = useState(String(currentQuota || 1024));
  const [error, setError] = useState("");

  function submitRam(event) {
    event.preventDefault();
    const parsed = Number(memory);
    if (!Number.isFinite(parsed)) {
      setError("New Quota cannot be empty.");
      return;
    }
    if (parsed < 256) {
      setError("Minimum 256 MB.");
      return;
    }
    if (!hasNoMax && parsed > maxQuota) {
      setError(`Maximum ${maxQuota} MB.`);
      return;
    }
    onSave(String(Math.round(parsed)));
  }

  return (
    <div className="pool-ram-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className="pool-ram-modal panel-card" onSubmit={submitRam}>
        <header>
          <span className="status-pill blue">Pool Memory</span>
          <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={onClose} aria-label="Close">
            <MenuIcon name="Close" />
          </button>
        </header>
        <p><strong>Pool Name</strong>: {poolName}</p>
        <label>
          <strong>New Quota in MB:</strong>
          <input
            inputMode="numeric"
            maxLength={5}
            min={256}
            max={maxQuota}
            type="number"
            value={memory}
            onChange={(event) => setMemory(event.target.value.replace(/[^\d]/g, ""))}
          />
        </label>
        <p className="pool-ram-limits">{hasNoMax ? "(Minimum 256 MB)" : `(Minimum 256 MB, Maximum ${maxQuota} MB)`}</p>
        {error && <p className="sandbox-message danger">{error}</p>}
        <button className="primary-button compact drawer-full-button" disabled={isRunning} type="submit">
          {isRunning ? <LoadingIcon label="Updating RAM" /> : "Submit"}
        </button>
      </form>
    </div>
  );
}

function PoolManagerTips() {
  return (
    <article className="pool-tips-card">
      <h3>Tips</h3>
      <p>For performance reason, each hosting account only have 1 application pool and each application pool can only support one .net version. If you need multiple version, please purchase another hosting account.</p>
      <p><strong>How to fix High memory usage for ASP.NET Core?</strong><br />Configure the .net core application to use workstation garbage collection will lower the memory consumption. You don't require rebuilding the project, just set the value in the runtimeconfig.json file: "System.GC.Server": false</p>
      <p><strong>How to choose .net version of pool for ASP.NET Core?</strong><br />It is not necessary to change IIS pool setting, because asp.net core IIS module will load .NET Core CLR itself, without IIS intervention.</p>
      <p><strong>Can I run multiple ASP.NET Core APPs?</strong><br />Yes, you can do it as long as you use Out-of-process hosting model in all your core apps.</p>
      <a href="http://www.smarterasp.net/support/kb/a1999/what-should-we-do-when-get-http-error-500_34-ancm-mixed-hosting-models-not-supported.aspx" target="_blank" rel="noreferrer">
        [KB Article] ASP.NET Core does not support multiple apps in the same app pool
      </a>
    </article>
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

function WebsitesSection({ cpId, currentUser, onChangeSection, onOpenFileManager }) {
  const { reload: reloadActivity } = useHostingActivity(cpId);
  const sitesRequestId = useRef(0);
  const [siteRecords, setSiteRecords] = useState([]);
  const [viewMode, setViewMode] = useSectionViewMode("cp-websites", siteRecords.length);
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [sitesError, setSitesError] = useState("");
  const [websiteMessage, setWebsiteMessage] = useState("");
  const [selectedSiteKey, setSelectedSiteKey] = useState("");
  const [newSiteDraft, setNewSiteDraft] = useState({ name: "", disablePhp: true });
  const [isNewSiteDrawerOpen, setIsNewSiteDrawerOpen] = useState(false);
  const [isCreatingNewSite, setIsCreatingNewSite] = useState(false);
  const [newSiteMessage, setNewSiteMessage] = useState("");
  const [subdomainDraft, setSubdomainDraft] = useState({ host: "", parentDomainUid: "", sitePath: "{create new folder}" });
  const [isSubdomainDrawerOpen, setIsSubdomainDrawerOpen] = useState(false);
  const [isCreatingSubdomain, setIsCreatingSubdomain] = useState(false);
  const [subdomainMessage, setSubdomainMessage] = useState("");
  const [subdomainFolderPicker, setSubdomainFolderPicker] = useState(null);
  const [isSubdomainFolderPickerOpen, setIsSubdomainFolderPickerOpen] = useState(false);
  const [isLoadingSubdomainFolders, setIsLoadingSubdomainFolders] = useState(false);
  const [subdomainFolderError, setSubdomainFolderError] = useState("");
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
  const [websiteFunctionBusyAction, setWebsiteFunctionBusyAction] = useState("");
  const [websiteSearch, setWebsiteSearch] = useState("");
  const [websiteSort, setWebsiteSort] = useState("siteName");
  const [isWebsiteSortOpen, setIsWebsiteSortOpen] = useState(false);
  const websiteSortRef = useRef(null);
  const [githubDeploySite, setGithubDeploySite] = useState(null);
  const [githubDeployMessage, setGithubDeployMessage] = useState("");
  const [isGithubDeployBusy, setIsGithubDeployBusy] = useState(false);
  const [moreFunctionsSite, setMoreFunctionsSite] = useState(null);
  const [websiteFolderPicker, setWebsiteFolderPicker] = useState(null);
  const [isWebsiteFolderPickerOpen, setIsWebsiteFolderPickerOpen] = useState(false);
  const [isLoadingWebsiteFolders, setIsLoadingWebsiteFolders] = useState(false);
  const [websiteFolderError, setWebsiteFolderError] = useState("");
  const [poolDrawer, setPoolDrawer] = useState(null);
  const [poolRuntime, setPoolRuntime] = useState(null);
  const [poolMessage, setPoolMessage] = useState("");
  const [poolActionDetails, setPoolActionDetails] = useState(null);
  const [isLoadingPools, setIsLoadingPools] = useState(false);
  const [isRunningPoolAction, setIsRunningPoolAction] = useState(false);

  function websiteCacheKey() {
    return `cp-websites-cache:${cpId || "none"}`;
  }

  useEffect(() => {
    if (!isWebsiteSortOpen) return undefined;

    function closeWebsiteSort(event) {
      if (websiteSortRef.current && !websiteSortRef.current.contains(event.target)) {
        setIsWebsiteSortOpen(false);
      }
    }

    document.addEventListener("mousedown", closeWebsiteSort);
    return () => document.removeEventListener("mousedown", closeWebsiteSort);
  }, [isWebsiteSortOpen]);

  function applyWebsitesDashboard(dashboard) {
    setSitesDashboard(dashboard);
    const loadedSites = dashboard?.sites?.map(mapHostingSiteToUi) ?? [];
    if (loadedSites.length) {
      setSiteRecords(loadedSites);
      setSelectedSiteKey((current) => current || loadedSites[0].siteKey);
    } else {
      setSiteRecords([]);
      setSelectedSiteKey("");
    }
  }

  function readCachedWebsites() {
    if (!cpId) return false;
    try {
      const cached = sessionStorage.getItem(websiteCacheKey());
      if (!cached) return false;
      const parsed = JSON.parse(cached);
      if (!parsed?.dashboard) return false;
      applyWebsitesDashboard(parsed.dashboard);
      return true;
    } catch {
      return false;
    }
  }

  function writeCachedWebsites(dashboard) {
    if (!cpId || !dashboard) return;
    try {
      sessionStorage.setItem(websiteCacheKey(), JSON.stringify({ dashboard, cachedAt: Date.now() }));
    } catch {
      // Session cache is an optimization only.
    }
  }

  async function loadHostingSites({ force = false, keepExisting = false } = {}) {
    if (!force && readCachedWebsites()) {
      setSitesError("");
      setIsLoadingSites(false);
      return;
    }

    const requestId = ++sitesRequestId.current;
    setIsLoadingSites(true);
    if (!keepExisting) {
      setSiteRecords([]);
      setSitesDashboard(null);
      setSelectedSiteKey("");
    }
    setSitesError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/sites", cpId));
      const result = await response.json();
      if (requestId !== sitesRequestId.current) return;

      if (!response.ok || !result.success) {
        setSitesError(result?.message ?? "Unable to load websites.");
        return;
      }

      applyWebsitesDashboard(result.dashboard);
      writeCachedWebsites(result.dashboard);
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
    if (!readCachedWebsites()) {
      setIsLoadingSites(true);
      loadHostingSites();
    } else {
      setIsLoadingSites(false);
    }
  }, [cpId]);

  function updateCachedWebsiteName(siteKey, siteName) {
    setSiteRecords((currentSites) => currentSites.map((site) => (site.siteKey === siteKey ? { ...site, siteName } : site)));
    setSitesDashboard((currentDashboard) => {
      if (!currentDashboard) return currentDashboard;
      const nextDashboard = {
        ...currentDashboard,
        sites: (currentDashboard.sites ?? []).map((site) => {
          const key = String(site.siteUid ?? site.siteName ?? site.rootName);
          return key === String(siteKey)
            ? { ...site, siteName, displayName: siteName }
            : site;
        })
      };
      writeCachedWebsites(nextDashboard);
      return nextDashboard;
    });
  }

  function updateCachedWebsiteStatus(siteKey, status) {
    const isActive = String(status).toLowerCase() !== "stopped";
    setSiteRecords((currentSites) => currentSites.map((site) => (site.siteKey === siteKey ? { ...site, status } : site)));
    setSitesDashboard((currentDashboard) => {
      if (!currentDashboard) return currentDashboard;
      const nextDashboard = {
        ...currentDashboard,
        sites: (currentDashboard.sites ?? []).map((site) => {
          const key = String(site.siteUid ?? site.siteName ?? site.rootName);
          return key === String(siteKey)
            ? { ...site, status, iisStatus: isActive, runningStatus: status }
            : site;
        })
      };
      writeCachedWebsites(nextDashboard);
      return nextDashboard;
    });
  }

  function removeCachedWebsite(siteKey) {
    setSiteRecords((currentSites) => {
      const nextSites = currentSites.filter((site) => String(site.siteKey) !== String(siteKey));
      setSelectedSiteKey((current) => (String(current) === String(siteKey) ? nextSites[0]?.siteKey || "" : current));
      return nextSites;
    });
    setSitesDashboard((currentDashboard) => {
      if (!currentDashboard) return currentDashboard;
      const nextDashboard = {
        ...currentDashboard,
        sites: (currentDashboard.sites ?? []).filter((site) => {
          const key = String(site.siteUid ?? site.siteName ?? site.rootName);
          return key !== String(siteKey);
        })
      };
      writeCachedWebsites(nextDashboard);
      return nextDashboard;
    });
  }

  async function updateSiteName(siteKey, siteName) {
    const site = siteRecords.find((item) => item.siteKey === siteKey);
    if (!site) {
      throw new Error("Website was not found in the current list.");
    }

    const nextName = String(siteName ?? "").trim();
    if (!nextName || nextName === site.siteName) {
      return site.siteName;
    }

    setWebsiteMessage("");
    const response = await fetch(`/api/hosting/sites/${site.siteUid}/functions/site-name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpId, action: "save", fields: { siteName: nextName } })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.message ?? "Unable to update site name.");
    }

    updateCachedWebsiteName(siteKey, nextName);
    setWebsiteMessage(result.message || "Site name updated.");
    return nextName;
  }

  const selectedSite = siteRecords.find((site) => site.siteKey === selectedSiteKey) ?? siteRecords[0] ?? null;
  const visibleSites = useMemo(() => {
    const search = websiteSearch.trim().toLowerCase();
    const filtered = !search
      ? siteRecords
      : siteRecords.filter((site) => {
        const haystack = [
          site.siteName,
          site.rootName,
          site.status,
          site.runtime,
          ...(site.mappedDomains ?? []).map((domain) => domain.label)
        ].join(" ").toLowerCase();
        return haystack.includes(search);
      });

    return [...filtered].sort((first, second) => {
      if (websiteSort === "status") {
        const statusCompare = String(first.status || "").localeCompare(String(second.status || ""), undefined, { sensitivity: "base" });
        if (statusCompare !== 0) return statusCompare;
      }

      return String(first.siteName || "").localeCompare(String(second.siteName || ""), undefined, { numeric: true, sensitivity: "base" });
    });
  }, [siteRecords, websiteSearch, websiteSort]);

  const subdomainDomainOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    for (const site of siteRecords) {
      if (site.isSubdomain) continue;
      for (const domain of site.mappedDomains ?? []) {
        const label = String(domain.label ?? domain.domain ?? "").trim().toLowerCase();
        const domainUid = domain.domainUid ?? domain.DomainUid ?? domain.id ?? domain.Id;
        if (!label || label === "no mapped domains" || !domainUid || isTemporaryHostingDomain(label) || seen.has(domainUid)) {
          continue;
        }

        seen.add(domainUid);
        options.push({
          domainUid: String(domainUid),
          domain: label,
          siteName: site.siteName
        });
      }
    }

    return options.sort((first, second) => first.domain.localeCompare(second.domain, undefined, { numeric: true, sensitivity: "base" }));
  }, [siteRecords]);

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
      setWebsiteMessage(`${action} needs the website service gateway before it can run.`);
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
    if (key === "aspnet-version") {
      setActiveWebsiteFunction(null);
      setMoreFunctionsSite(null);
      openPoolDrawer("manage");
      return;
    }
    if (key === "schedule-tasks") {
      setActiveWebsiteFunction(null);
      setMoreFunctionsSite(null);
      onChangeSection?.("schedule-tasks");
      return;
    }
    if (!selected?.siteUid || !key) {
      queueWebsiteTest(action, selected);
      return;
    }

    setWebsiteFunctionError("");
    setWebsiteFunctionMessage("");
    setWebsiteFunctionBusyAction("");
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
      if (key === "default-doc" && result.function?.data?.defaultDocs) {
        fields.documents = result.function.data.defaultDocs;
      }
      setWebsiteFunctionFields(fields);
      setActiveWebsiteFunction({ site: selected, label: result.function?.label ?? action, key, details: result.function });
    } catch {
      setWebsiteFunctionError("Unable to reach website function API.");
    } finally {
      setIsLoadingWebsiteFunction(false);
    }
  }

  async function loadPoolRuntime() {
    setIsLoadingPools(true);
    setPoolMessage("");
    setPoolActionDetails(null);
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/runtime", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setPoolMessage(result?.message ?? "Unable to load application pools.");
        return;
      }

      setPoolRuntime(result.dashboard);
    } catch {
      setPoolMessage("Unable to reach application pool service.");
    } finally {
      setIsLoadingPools(false);
    }
  }

  function openPoolDrawer(mode) {
    setPoolDrawer(mode);
    setPoolMessage("");
    setPoolActionDetails(null);
    if (mode !== "ram") {
      loadPoolRuntime();
    }
  }

  async function runPoolAction(action, pool = null, fields = {}) {
    setIsRunningPoolAction(true);
    setPoolMessage("");
    setPoolActionDetails(null);
    try {
      const response = await fetch("/api/hosting/pools/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpId,
          poolId: Number(pool?.details?.["Pool ID"] || pool?.poolId || 0),
          action,
          fields
        })
      });
      const result = await response.json().catch(() => null);
      setPoolMessage(result?.message ?? "Application pool action finished.");
      setPoolActionDetails(result?.details ?? result?.agent ?? null);
      if (response.ok && result?.success) {
        await loadPoolRuntime();
      }
    } catch {
      setPoolMessage("Unable to reach application pool service.");
    } finally {
      setIsRunningPoolAction(false);
    }
  }

  async function browseWebsiteFunctionFolders(path = websiteFunctionFields.target || "/") {
    setIsLoadingWebsiteFolders(true);
    setWebsiteFolderError("");
    try {
      const params = new URLSearchParams({
        path: path === "/" ? "" : path,
        sortBy: "name",
        orderBy: "asc"
      });
      const response = await fetch(hostingApiUrl(`/api/hosting/files/browse?${params.toString()}`, cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setWebsiteFolderError(formatFileManagerMessage(result?.message ?? "Unable to load folders."));
        return;
      }

      setWebsiteFolderPicker(result.fileManager);
    } catch {
      setWebsiteFolderError("Unable to reach folder picker API.");
    } finally {
      setIsLoadingWebsiteFolders(false);
    }
  }

  function openWebsiteFolderPicker() {
    setIsWebsiteFolderPickerOpen(true);
    const path = activeWebsiteFunction?.key === "virtual-dir"
      ? websiteFunctionFields.physicalPath || activeWebsiteFunction?.site?.sitePath || "/"
      : websiteFunctionFields.target || activeWebsiteFunction?.site?.sitePath || "/";
    browseWebsiteFunctionFolders(path);
  }

  function chooseWebsiteFunctionFolder(path) {
    const fieldName = activeWebsiteFunction?.key === "virtual-dir" ? "physicalPath" : "target";
    setWebsiteFunctionFields((current) => ({
      ...current,
      [fieldName]: normalizeFtpPickerPath(path, sitesDashboard?.cpLogin)
    }));
    setIsWebsiteFolderPickerOpen(false);
  }

  async function submitWebsiteFunction(action = "", extraFields = {}) {
    if (!activeWebsiteFunction?.site?.siteUid || !activeWebsiteFunction?.key) return;
    setWebsiteFunctionMessage("");
    setWebsiteFunctionError("");
    setWebsiteFunctionBusyAction(action || "save");
    try {
      const mergedFields = { ...websiteFunctionFields, ...extraFields };
      const submitFields = activeWebsiteFunction.key === "detail-error"
        ? { ...mergedFields, enabled: action === "disable" ? "false" : "true" }
        : mergedFields;
      const response = await fetch(`/api/hosting/sites/${activeWebsiteFunction.site.siteUid}/functions/${activeWebsiteFunction.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId, action, fields: submitFields })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setWebsiteFunctionError(result?.message ?? "Website function failed.");
        return;
      }

      setWebsiteFunctionMessage(result.message);
      const refreshWebsiteListKeys = new Set(["domain-manager", "site-name"]);
      if (activeWebsiteFunction.key === "detail-error") {
        const enabled = action !== "disable";
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              detailError: {
                ...(current.details.data?.detailError ?? {}),
                enabled,
                status: enabled ? "ON" : "OFF"
              }
            }
          } : current.details
        } : current);
        return;
      }

      if (activeWebsiteFunction.key === "vs-webdeploy" || activeWebsiteFunction.key === "remote-iis-manager") {
        if (action === "enable" || action === "disable") {
          const enabled = action === "enable";
          setActiveWebsiteFunction((current) => current ? {
            ...current,
            details: current.details ? {
              ...current.details,
              data: {
                ...(current.details.data ?? {}),
                webDeploy: {
                  ...(current.details.data?.webDeploy ?? {}),
                  enabled,
                  status: enabled ? "On" : "Off"
                }
              }
            } : current.details
          } : current);
        }
        return;
      }

      if (activeWebsiteFunction.key === "mime-type") {
        const rawExtension = String((submitFields.extension ?? extraFields.extension ?? "")).trim();
        const extensionWithoutDot = rawExtension.replace(/^\.+/, "");
        const nextExtension = extensionWithoutDot ? `.${extensionWithoutDot}` : "";
        const nextMimeType = String(submitFields.mimeType ?? extraFields.mimeType ?? "").trim();
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              mimeMaps: action === "remove" || action === "delete"
                ? (current.details.data?.mimeMaps ?? []).filter((row) => String(row.extension ?? "").toLowerCase() !== nextExtension.toLowerCase())
                : [
                    ...(current.details.data?.mimeMaps ?? []).filter((row) => String(row.extension ?? "").toLowerCase() !== nextExtension.toLowerCase()),
                    { extension: nextExtension, mimeType: nextMimeType }
                  ]
            }
          } : current.details
        } : current);
        if (action !== "remove" && action !== "delete") {
          setWebsiteFunctionFields((current) => ({ ...current, extension: "", mimeType: "" }));
        }
        return;
      }

      if (activeWebsiteFunction.key === "script-map") {
        const rawExtension = String((submitFields.extension ?? extraFields.extension ?? "")).trim();
        const extensionWithoutDot = rawExtension.replace(/^\.+/, "");
        const nextExtension = extensionWithoutDot ? `.${extensionWithoutDot}` : "";
        const nextTagName = String(submitFields.tagName ?? extraFields.tagName ?? `Custom-${nextExtension.replace(/^\./, "")}`).trim();
        const scriptTypeIndex = String(submitFields.scriptTypeIndex ?? extraFields.scriptTypeIndex ?? "85");
        const selectedScript = [
          { value: "85", label: "PHP 8.5.x" },
          { value: "83", label: "PHP 8.3.x" },
          { value: "82", label: "PHP 8.2.x" },
          { value: "14", label: "PHP 8.1.x" },
          { value: "13", label: "PHP 8.0.x" },
          { value: "12", label: "PHP 7.4.x" },
          { value: "11", label: "PHP 7.3.x" },
          { value: "10", label: "PHP 7.2.x" },
          { value: "9", label: "PHP 7.0.x" },
          { value: "8", label: "PHP 5.6.x" },
          { value: "7", label: "Perl" },
          { value: "6", label: "Python" }
        ].find((option) => option.value === scriptTypeIndex);
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              scriptMaps: action === "remove" || action === "delete"
                ? (current.details.data?.scriptMaps ?? []).filter((row) => (
                    String(row.tagName ?? "").toLowerCase() !== nextTagName.toLowerCase()
                    && String(row.extension ?? "").toLowerCase() !== nextExtension.toLowerCase()
                  ))
                : [
                    ...(current.details.data?.scriptMaps ?? []).filter((row) => String(row.extension ?? "").toLowerCase() !== nextExtension.toLowerCase()),
                    { tagName: nextTagName, extension: nextExtension, scriptTypeIndex, processor: selectedScript?.label ?? "Custom Script" }
                  ]
            }
          } : current.details
        } : current);
        if (action !== "remove" && action !== "delete") {
          setWebsiteFunctionFields((current) => ({ ...current, extension: "" }));
        }
        return;
      }

      if (activeWebsiteFunction.key === "custom-errors") {
        const statusCode = String(submitFields.errorType ?? submitFields.statusCode ?? extraFields.errorType ?? "404");
        const isReset = action === "reset" || action === "default";
        const nextPath = isReset
          ? statusCode === "404" ? "C:\\hosting\\public\\404-3.htm" : `C:\\inetpub\\custerr\\en-US\\${statusCode}.htm`
          : `/${String(submitFields.filepath ?? submitFields.path ?? "").replace(/^\/+/, "")}`;
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              errorPages: (current.details.data?.errorPages ?? []).map((row) => (
                String(row.statusCode) === statusCode ? { ...row, path: nextPath } : row
              ))
            }
          } : current.details
        } : current);
        return;
      }

      if (activeWebsiteFunction.key === "force-https") {
        const ruleName = String(submitFields.ruleName ?? extraFields.ruleName ?? "httpTohttps").trim() || "httpTohttps";
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              runtime: action === "delete" || action === "remove" || action === "disable"
                ? (current.details.data?.runtime ?? []).filter((row) => String(row.id ?? row.rulename ?? "").toLowerCase() !== ruleName.toLowerCase())
                : [
                    ...(current.details.data?.runtime ?? []).filter((row) => String(row.id ?? row.rulename ?? "").toLowerCase() !== ruleName.toLowerCase()),
                    { row_type: "Redirect", id: ruleName, title: "http", status: "https", servername: ruleName }
                  ]
            }
          } : current.details
        } : current);
        return;
      }

      if (activeWebsiteFunction.key === "site-guard") {
        const enabled = action === "enable" || action === "on" || String(submitFields.enabled ?? extraFields.enabled ?? "").toLowerCase() === "true";
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              site: {
                ...(current.details.data?.site ?? {}),
                webknight: enabled
              },
              security: (current.details.data?.security ?? []).map((row) => (
                String(row.site_Uid ?? row.site_uid ?? "") === String(activeWebsiteFunction.site?.siteUid ?? "")
                  ? { ...row, webknight: enabled }
                  : row
              ))
            }
          } : current.details
        } : current);
        return;
      }

      if (activeWebsiteFunction.key === "outgoing-port") {
        const ipid = String(submitFields.ipid ?? extraFields.ipid ?? "");
        const ip = String(submitFields.ip ?? extraFields.ip ?? "");
        const port = String(submitFields.port ?? extraFields.port ?? "");
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              outgoingPorts: action === "delete" || action === "remove"
                ? (current.details.data?.outgoingPorts ?? []).filter((row) => String(row.ipid ?? row.id ?? "") !== ipid)
                : [
                    ...(current.details.data?.outgoingPorts ?? []),
                    { ipid: Date.now(), remoteip: ip, port, adddate: new Date().toLocaleString(), rulename: `CP${activeWebsiteFunction.site?.cpId ?? ""}${ip.replaceAll(".", "")}${port}` }
                  ]
            }
          } : current.details
        } : current);
        if (action !== "delete" && action !== "remove") {
          setWebsiteFunctionFields((current) => ({ ...current, ip: "", port: "1433" }));
        }
        return;
      }

      if (activeWebsiteFunction.key === "create-net-app") {
        const appPath = `/${String(submitFields.appPath ?? extraFields.appPath ?? "").replace(/^\/+/, "")}`;
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              iisApps: action === "delete" || action === "remove"
                ? (current.details.data?.iisApps ?? []).filter((row) => String(row.appPath ?? "").toLowerCase() !== appPath.toLowerCase())
                : [
                    ...(current.details.data?.iisApps ?? []).filter((row) => String(row.appPath ?? "").toLowerCase() !== appPath.toLowerCase()),
                    { appPath }
                  ]
            }
          } : current.details
        } : current);
        if (action !== "delete" && action !== "remove") {
          setWebsiteFunctionFields((current) => ({ ...current, appPath: "" }));
        }
        return;
      }

      if (activeWebsiteFunction.key === "virtual-dir") {
        const name = String(submitFields.vdirname ?? submitFields.virtualPath ?? extraFields.vdirname ?? extraFields.virtualPath ?? "").trim();
        const path = String(submitFields.physicalPath ?? submitFields.vdpath ?? extraFields.physicalPath ?? extraFields.vdpath ?? "").trim();
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              virtualDirs: action === "delete" || action === "remove"
                ? (current.details.data?.virtualDirs ?? []).filter((row) => String(row.name ?? "").toLowerCase() !== name.toLowerCase())
                : [
                    ...(current.details.data?.virtualDirs ?? []).filter((row) => String(row.name ?? "").toLowerCase() !== name.toLowerCase()),
                    { name, path }
                  ]
            }
          } : current.details
        } : current);
        if (action !== "delete" && action !== "remove") {
          setWebsiteFunctionFields((current) => ({ ...current, vdirname: "", virtualPath: "", physicalPath: "" }));
        }
        return;
      }

      if (activeWebsiteFunction.key === "site-on-off") {
        const nextStatus = action === "stop" || action === "off" ? "Stopped" : "Active";
        updateCachedWebsiteStatus(activeWebsiteFunction.site.siteKey, nextStatus);
        setActiveWebsiteFunction((current) => current ? {
          ...current,
          site: { ...current.site, status: nextStatus },
          details: current.details ? {
            ...current.details,
            data: {
              ...(current.details.data ?? {}),
              site: {
                ...(current.details.data?.site ?? {}),
                status: nextStatus,
                runningStatus: nextStatus
              }
            }
          } : current.details
        } : current);
        await reloadActivity();
        return;
      }

      if (activeWebsiteFunction.key === "delete-website") {
        removeCachedWebsite(activeWebsiteFunction.site.siteKey);
        setActiveWebsiteFunction(null);
        await reloadActivity();
        return;
      }

      if (refreshWebsiteListKeys.has(activeWebsiteFunction.key)) {
        await loadHostingSites({ force: true, keepExisting: true });
        await reloadActivity();
      }
    } catch {
      setWebsiteFunctionError("Unable to run website function.");
    } finally {
      setWebsiteFunctionBusyAction("");
    }
  }

  async function submitNewSiteDraft(event) {
    event?.preventDefault();
    setWebsiteMessage("");
    setNewSiteMessage("");
    const siteName = String(newSiteDraft.name ?? "").trim();
    if (!siteName) {
      setNewSiteMessage("Website/folder name cannot be empty.");
      return;
    }
    if (siteName.length < 2) {
      setNewSiteMessage("Website/folder name must be at least 2 characters.");
      return;
    }
    if (siteName.length > 20) {
      setNewSiteMessage("Website/folder name cannot be longer than 20 characters.");
      return;
    }
    if (!/^[A-Za-z0-9-]+$/.test(siteName)) {
      setNewSiteMessage("Website/folder name can only use letters, numbers, and dash.");
      return;
    }

    setIsCreatingNewSite(true);
    try {
      const result = await provisionHosting("/api/hosting/sites/provision", cpId, {
        siteName,
        domain: "",
        folder: "",
        netVersion: "v4",
        serverId: "",
        disablePhp: Boolean(newSiteDraft.disablePhp)
      });
      setWebsiteMessage(result.message);
      setNewSiteMessage(result);
      await loadHostingSites({ force: true, keepExisting: true });
      await reloadActivity();
    } catch (error) {
      setNewSiteMessage(error.message);
    } finally {
      setIsCreatingNewSite(false);
    }
  }

  function openAutomatedBackupsAddon() {
    if (currentUser?.isControlPanelLogin) {
      setWebsiteMessage("Automated Backups are managed from the Account Panel. Please sign in with the main account login to purchase or manage this add-on.");
      return;
    }

    window.history.pushState({}, "", "/panel?section=addon");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function openSubdomainDrawer() {
    setSubdomainMessage("");
    setSubdomainDraft((current) => ({
      ...current,
      parentDomainUid: current.parentDomainUid || subdomainDomainOptions[0]?.domainUid || "",
      sitePath: current.sitePath || "{create new folder}"
    }));
    setIsSubdomainDrawerOpen(true);
  }

  async function browseSubdomainFolders(path = subdomainDraft.sitePath || "/") {
    setIsLoadingSubdomainFolders(true);
    setSubdomainFolderError("");
    try {
      const pickerPath = path === "{create new folder}" ? "/" : path;
      const params = new URLSearchParams({
        path: pickerPath === "/" ? "" : pickerPath,
        sortBy: "name",
        orderBy: "asc"
      });
      const response = await fetch(hostingApiUrl(`/api/hosting/files/browse?${params.toString()}`, cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setSubdomainFolderError(formatFileManagerMessage(result?.message ?? "Unable to load folders."));
        return;
      }

      setSubdomainFolderPicker(result.fileManager);
    } catch {
      setSubdomainFolderError("Unable to reach folder picker API.");
    } finally {
      setIsLoadingSubdomainFolders(false);
    }
  }

  function openSubdomainFolderPicker() {
    setIsSubdomainFolderPickerOpen(true);
    browseSubdomainFolders(subdomainDraft.sitePath || "/");
  }

  function chooseSubdomainFolder(path) {
    setSubdomainDraft((current) => ({
      ...current,
      sitePath: normalizeFtpPickerPath(path, sitesDashboard?.cpLogin)
    }));
    setIsSubdomainFolderPickerOpen(false);
  }

  async function submitSubdomainDraft(event) {
    event?.preventDefault();
    setWebsiteMessage("");
    setSubdomainMessage("");
    const host = String(subdomainDraft.host ?? "").trim().toLowerCase();
    if (!host) {
      setSubdomainMessage("Subdomain name is required.");
      return;
    }
    if (host === "www") {
      setSubdomainMessage("Subdomain name cannot be www.");
      return;
    }
    if (host.length > 30) {
      setSubdomainMessage("Subdomain name cannot be longer than 30 characters.");
      return;
    }
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(host)) {
      setSubdomainMessage("Subdomain name can only use letters, numbers, and dash.");
      return;
    }
    if (!subdomainDraft.parentDomainUid) {
      setSubdomainMessage("Choose a domain name.");
      return;
    }

    setIsCreatingSubdomain(true);
    try {
      const result = await provisionHosting("/api/hosting/sites/provision", cpId, {
        isSubdomain: true,
        host,
        parentDomainUid: Number(subdomainDraft.parentDomainUid),
        sitePath: subdomainDraft.sitePath || "{create new folder}",
        siteName: "",
        domain: "",
        folder: "",
        netVersion: "v4",
        serverId: "",
        disablePhp: false
      });
      setWebsiteMessage(result.message);
      setSubdomainMessage(result.message);
      setIsSubdomainDrawerOpen(false);
      setSubdomainDraft({ host: "", parentDomainUid: subdomainDomainOptions[0]?.domainUid || "", sitePath: "{create new folder}" });
      try {
        sessionStorage.removeItem(websiteCacheKey());
      } catch {
        // Ignore cache cleanup failures.
      }
      await loadHostingSites({ force: true, keepExisting: true });
      await reloadActivity();
    } catch (error) {
      setSubdomainMessage(error.message);
    } finally {
      setIsCreatingSubdomain(false);
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
    try {
      sessionStorage.removeItem(websiteCacheKey());
    } catch {
      // Ignore cache cleanup failures.
    }
    loadHostingSites({ force: true, keepExisting: true });
    reloadActivity();
  }

  function runWebsiteDeployAction(action, site) {
    if (action === "VSDeploy") {
      openWebsiteFunction("VS Webdeploy", site);
      return;
    }

    if (action === "Github") {
      setGithubDeploySite(site);
      setGithubDeployMessage("");
      return;
    }

    if (action === "File Manager") {
      onOpenFileManager?.(site.sitePath);
      return;
    }

    queueWebsiteTest(action, site);
  }

  async function submitGithubDeploy(fields) {
    if (!githubDeploySite?.siteUid) return;
    setGithubDeployMessage("");
    setIsGithubDeployBusy(true);
    try {
      const response = await fetch(`/api/hosting/sites/${githubDeploySite.siteUid}/functions/github-deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId, action: "deploy", fields })
      });
      const result = await response.json().catch(() => null);
      setGithubDeployMessage(result?.message ?? "GitHub deployment request completed.");
      if (response.ok && result?.success) {
        await reloadActivity();
      }
      return result;
    } catch {
      setGithubDeployMessage("Unable to reach GitHub deploy service.");
      return null;
    } finally {
      setIsGithubDeployBusy(false);
    }
  }

  if (githubDeploySite) {
    return (
      <GithubDeployPage
        site={githubDeploySite}
        cpId={cpId}
        cpLogin={sitesDashboard?.cpLogin}
        isBusy={isGithubDeployBusy}
        message={githubDeployMessage}
        onBack={() => {
          setGithubDeploySite(null);
          setGithubDeployMessage("");
        }}
        onSubmit={submitGithubDeploy}
      />
    );
  }

  return (
    <section className="websites-section">
      <div className="website-toolbar panel-card">
        <div className="website-actions">
          <button className="primary-button compact" type="button" onClick={() => {
            setNewSiteMessage("");
            setIsNewSiteDrawerOpen(true);
          }}>+ New Site</button>
          <button className="secondary-button compact" type="button" onClick={openSubdomainDrawer}>+ Sub Domain</button>
          <button className="secondary-button compact" type="button" onClick={openAutomatedBackupsAddon}>+ Automated Backups</button>
        </div>
        <div className="website-toolbar-controls">
          <label className="website-search-field">
            <MenuIcon name="search" />
            <input
              aria-label="Search websites"
              type="search"
              value={websiteSearch}
              onChange={(event) => setWebsiteSearch(event.target.value)}
              placeholder="Search websites"
            />
          </label>
          <div className="website-sort-field custom-sort-field" ref={websiteSortRef}>
            <span>Sort</span>
            <button
              aria-expanded={isWebsiteSortOpen}
              aria-haspopup="listbox"
              className="sort-selected-value sort-menu-button"
              type="button"
              onClick={() => setIsWebsiteSortOpen((open) => !open)}
            >
              <strong>{websiteSort === "status" ? "Status" : "Site Name"}</strong>
              <MenuIcon name="chevron-down" />
            </button>
            {isWebsiteSortOpen && (
              <div className="sort-options-menu" role="listbox" aria-label="Sort websites">
                {[
                  { value: "siteName", label: "Site Name" },
                  { value: "status", label: "Status" }
                ].map((option) => (
                  <button
                    aria-selected={websiteSort === option.value}
                    className={websiteSort === option.value ? "sort-option active" : "sort-option"}
                    key={option.value}
                    role="option"
                    type="button"
                    onClick={() => {
                      setWebsiteSort(option.value);
                      setIsWebsiteSortOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label="Website view mode" />
          <RefreshButton onClick={refreshWebsitesSection} />
        </div>
      </div>

      {websiteMessage && (
        <div className="website-message-stack">
          <p className="sandbox-message">{websiteMessage}</p>
          {shouldShowTemporaryUrlWaitTip(websiteMessage) && (
            <p className="orange-tip">Please wait 10 to 15 minutes before visiting this URL.</p>
          )}
        </div>
      )}
      {sitesError && (
        <div className="panel-card dashboard-error-panel">
          <p>{sitesError}</p>
          <IconActionButton label="Retry" onClick={loadHostingSites} />
        </div>
      )}
      {isLoadingSites && !sitesError && (
        <div className="panel-card website-list-loading">
          <LoadingIcon label="Loading websites" />
        </div>
      )}
      {!isLoadingSites && !sitesError && !siteRecords.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No websites</span>
          <h2>No websites found</h2>
          <p>This hosting account does not have any visible website rows in cp_config_Sites.</p>
        </div>
      )}
      {!isLoadingSites && !sitesError && !!siteRecords.length && !visibleSites.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No matches</span>
          <h2>No websites match your search</h2>
          <p>Try a different site name, domain, runtime, or status.</p>
        </div>
      )}

      {!!visibleSites.length && (viewMode === "cards" ? (
        <WebsiteCards sites={visibleSites} onUpdateSiteName={updateSiteName} onQueueAction={runWebsiteDeployAction} onFunctionAction={openWebsiteFunction} onMoreFunctions={setMoreFunctionsSite} onChangeSection={onChangeSection} />
      ) : (
        <WebsiteTable sites={visibleSites} onUpdateSiteName={updateSiteName} onQueueAction={runWebsiteDeployAction} onFunctionAction={openWebsiteFunction} onMoreFunctions={setMoreFunctionsSite} onChangeSection={onChangeSection} />
      ))}

      {activeWebsiteFunction && (
        <WebsiteFunctionDrawer
          activeFunction={activeWebsiteFunction}
          fields={websiteFunctionFields}
          siteOptions={siteRecords}
          error={websiteFunctionError}
          isLoading={isLoadingWebsiteFunction}
          busyAction={websiteFunctionBusyAction}
          message={websiteFunctionMessage}
          onChangeField={(field, value) => setWebsiteFunctionFields((current) => ({ ...current, [field]: value }))}
          onClose={() => setActiveWebsiteFunction(null)}
          onRefresh={() => openWebsiteFunction(activeWebsiteFunction.label, activeWebsiteFunction.site)}
          onSubmit={submitWebsiteFunction}
          onOpenFolderPicker={openWebsiteFolderPicker}
        />
      )}
      {isNewSiteDrawerOpen && (
        <NewSiteDrawer
          draft={newSiteDraft}
          message={newSiteMessage}
          isBusy={isCreatingNewSite}
          cpLogin={sitesDashboard?.cpLogin}
          onChange={setNewSiteDraft}
          onClose={() => {
            if (isCreatingNewSite) return;
            setIsNewSiteDrawerOpen(false);
            setNewSiteMessage("");
          }}
          onSubmit={submitNewSiteDraft}
        />
      )}
      {isSubdomainDrawerOpen && (
        <SubdomainDrawer
          draft={subdomainDraft}
          domains={subdomainDomainOptions}
          message={subdomainMessage}
          isBusy={isCreatingSubdomain}
          onChange={setSubdomainDraft}
          onClose={() => {
            if (isCreatingSubdomain) return;
            setIsSubdomainDrawerOpen(false);
            setSubdomainMessage("");
          }}
          onSubmit={submitSubdomainDraft}
          onOpenFolderPicker={openSubdomainFolderPicker}
        />
      )}
      {isWebsiteFolderPickerOpen && (
        <FolderPickerModal
          title="Select Target Folder"
          currentPath={normalizeFtpPickerPath(websiteFolderPicker?.currentPath || websiteFunctionFields.target || "/", sitesDashboard?.cpLogin)}
          folders={websiteFolderPicker?.folders ?? []}
          parentPath={websiteFolderPicker?.parentPath || ""}
          isLoading={isLoadingWebsiteFolders}
          error={websiteFolderError}
          onBrowse={browseWebsiteFunctionFolders}
          onChoose={() => chooseWebsiteFunctionFolder(websiteFolderPicker?.currentPath || websiteFunctionFields.target || "/")}
          onClose={() => setIsWebsiteFolderPickerOpen(false)}
        />
      )}
      {isSubdomainFolderPickerOpen && (
        <FolderPickerModal
          title="Select Subdomain Folder"
          currentPath={normalizeFtpPickerPath(subdomainFolderPicker?.currentPath || subdomainDraft.sitePath || "/", sitesDashboard?.cpLogin)}
          folders={subdomainFolderPicker?.folders ?? []}
          parentPath={subdomainFolderPicker?.parentPath || ""}
          isLoading={isLoadingSubdomainFolders}
          error={subdomainFolderError}
          onBrowse={browseSubdomainFolders}
          onChoose={() => chooseSubdomainFolder(subdomainFolderPicker?.currentPath || subdomainDraft.sitePath || "/")}
          onClose={() => setIsSubdomainFolderPickerOpen(false)}
        />
      )}
      {moreFunctionsSite && (
        <WebsiteMoreFunctionsDrawer
          site={moreFunctionsSite}
          onClose={() => setMoreFunctionsSite(null)}
          onAction={(action) => {
            setMoreFunctionsSite(null);
            openWebsiteFunction(action, moreFunctionsSite);
          }}
        />
      )}
      {poolDrawer && (
        <HostingPoolDrawer
          mode={poolDrawer}
          cpId={cpId}
          currentUser={currentUser}
          dashboard={sitesDashboard}
          runtime={poolRuntime}
          isLoading={isLoadingPools}
          isRunning={isRunningPoolAction}
          message={poolMessage}
          actionDetails={poolActionDetails}
          onClose={() => setPoolDrawer(null)}
          onRefresh={loadPoolRuntime}
          onRunAction={runPoolAction}
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
    isSubdomain: Boolean(site.isSubdomain),
    siteName: site.siteName || site.rootName || `site-${site.siteUid}`,
    mappedDomains: site.mappedDomains?.length
      ? site.mappedDomains
      : [{ label: "No mapped domains", url: "#" }],
    runtime,
    status: site.status || "Unknown"
  };
}

function NewSiteDrawer({ draft, message, isBusy, cpLogin, onChange, onClose, onSubmit }) {
  const resultMessage = typeof message === "string" ? message : message?.message || "";
  const steps = Array.isArray(message?.details?.steps) ? message.details.steps : [];
  const isSuccess = Boolean(message?.success) || resultMessage.toLowerCase().includes("created");
  const hasSubmitted = isBusy || Boolean(resultMessage);
  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isBusy) onClose();
    }}>
      <aside className="function-drawer panel-card" aria-label="New Site" role="dialog" aria-modal="true">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">Website</span>
            <h2>+ New Site</h2>
            <p>Create a new website.</p>
          </div>
          <div className="function-drawer-actions">
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" disabled={isBusy} onClick={onClose} aria-label="Close">
              <MenuIcon name="x" />
            </button>
          </div>
        </header>

        <form className="function-field-form compact-site-name-form" onSubmit={onSubmit}>
          <label>
            Website / Folder Name
            <input
              autoFocus
              maxLength={20}
              value={draft.name ?? ""}
              onChange={(event) => onChange((current) => ({ ...current, name: event.target.value.replace(/[^A-Za-z0-9-]/g, "") }))}
              placeholder="site name"
              disabled={hasSubmitted}
            />
          </label>
          <p className="drawer-helper-text">You can change this name later.</p>
          <label className="file-action-checkbox">
            <input
              type="checkbox"
              checked={Boolean(draft.disablePhp)}
              onChange={(event) => onChange((current) => ({ ...current, disablePhp: event.target.checked }))}
              disabled={hasSubmitted}
            />
            Disable PHP Support
          </label>
          {resultMessage && (
            <div className="website-message-stack">
              <p className={isSuccess ? "sandbox-message" : "sandbox-message danger"}>{resultMessage}</p>
              {isSuccess && shouldShowTemporaryUrlWaitTip(resultMessage) && (
                <p className="orange-tip">Please wait 10 to 15 minutes before visiting this URL.</p>
              )}
            </div>
          )}
          {!!steps.length && (
            <div className="provision-step-list" aria-label="Website creation steps">
              {steps.map((step, index) => (
                <div className={`provision-step ${step.status || "ok"}`} key={`${step.title || "step"}-${index}`}>
                  <span className="provision-step-index">{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!hasSubmitted && (
            <div className="function-submit-row">
              <button className="primary-button compact" type="submit">
                Submit
              </button>
            </div>
          )}
          {isBusy && <LoadingIcon label="Creating website" />}
        </form>
      </aside>
    </div>
  );
}

function SubdomainDrawer({ draft, domains, message, isBusy, onChange, onClose, onSubmit, onOpenFolderPicker }) {
  const selectedDomain = domains.find((domain) => domain.domainUid === String(draft.parentDomainUid));
  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isBusy) onClose();
    }}>
      <aside className="function-drawer panel-card" aria-label="New Subdomain" role="dialog" aria-modal="true">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">Subdomain</span>
            <h2>+ Sub Domain</h2>
            <p>Create a subdomain site from one owned mapped domain.</p>
          </div>
          <div className="function-drawer-actions">
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" disabled={isBusy} onClick={onClose} aria-label="Close">
              <MenuIcon name="x" />
            </button>
          </div>
        </header>

        <form className="function-field-form compact-site-name-form" onSubmit={onSubmit}>
          <label>
            Subdomain Name
            <input
              autoFocus
              maxLength={30}
              value={draft.host ?? ""}
              onChange={(event) => onChange((current) => ({ ...current, host: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
              placeholder="blog"
            />
          </label>
          <label>
            Domain
            <span className="subdomain-domain-select">
              <select
                value={draft.parentDomainUid ?? ""}
                onChange={(event) => onChange((current) => ({ ...current, parentDomainUid: event.target.value }))}
                disabled={!domains.length}
              >
                {!domains.length && <option value="">No mapped domains available</option>}
                {domains.map((domain) => (
                  <option key={domain.domainUid} value={domain.domainUid}>
                    {domain.domain}
                  </option>
                ))}
              </select>
              <MenuIcon name="chevron-down" />
            </span>
          </label>
          <label>
            Target Folder
            <div className="folder-picker-input-row">
              <input
                value={draft.sitePath || "{create new folder}"}
                readOnly
                aria-label="Target folder"
              />
              <IconActionButton label="Select Folder" icon="folder" onClick={onOpenFolderPicker} disabled={isBusy} />
            </div>
          </label>
          {selectedDomain && draft.host && (
            <p className="drawer-helper-text">{draft.host}.{selectedDomain.domain}</p>
          )}
          {message && <p className={message.toLowerCase().includes("created") ? "sandbox-message" : "sandbox-message danger"}>{message}</p>}
          <div className="function-submit-row">
            <button className="primary-button compact" type="submit" disabled={isBusy || !domains.length}>
              {isBusy ? <LoadingIcon label="Creating subdomain" /> : "Submit"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function GithubDeployPage({ site, cpId, cpLogin, isBusy, message, onBack, onSubmit }) {
  const [deployMethod, setDeployMethod] = useState("git");
  const [gitMethod, setGitMethod] = useState("token");
  const [showMore, setShowMore] = useState(false);
  const [githubStatus, setGithubStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isHookPanelOpen, setIsHookPanelOpen] = useState(false);
  const [isEnvironmentPanelOpen, setIsEnvironmentPanelOpen] = useState(false);
  const [environmentDraft, setEnvironmentDraft] = useState("");
  const [isSavingEnvironment, setIsSavingEnvironment] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState(null);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const [isRevokingHook, setIsRevokingHook] = useState(false);
  const [draft, setDraft] = useState({
    repourl: "https://github.com/User/MyRepository.git",
    gitBranch: "",
    gitToken: "",
    gitPassphrase: "",
    buildcmd: "",
    startcmd: "",
    createDeployhook: false
  });
  const sitePath = simplifySitePath(site?.sitePath, cpLogin);

  const loadGithubStatus = useCallback(async () => {
    if (!site?.siteUid) return;
    setIsLoadingStatus(true);
    setStatusMessage("");
    try {
      const query = cpId ? `?cpId=${encodeURIComponent(cpId)}` : "";
      const response = await fetch(`/api/hosting/sites/${site.siteUid}/github${query}`);
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setStatusMessage(result?.message || "Unable to load Github deploy status.");
        return;
      }
      setGithubStatus(result.github);
      setEnvironmentDraft(result.github?.environmentSettings || "");
    } catch {
      setStatusMessage("Unable to reach Github deploy status service.");
    } finally {
      setIsLoadingStatus(false);
    }
  }, [cpId, site?.siteUid]);

  useEffect(() => {
    loadGithubStatus();
  }, [loadGithubStatus]);

  useEffect(() => {
    function onGithubMessage(event) {
      if (event.origin !== window.location.origin || event.data?.type !== "github-auth-complete") return;
      loadGithubStatus();
    }

    window.addEventListener("message", onGithubMessage);
    return () => window.removeEventListener("message", onGithubMessage);
  }, [loadGithubStatus]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function openGitHubAuth(action) {
    const query = new URLSearchParams({
      action,
      cpId: String(cpId || ""),
      returnUrl: `${window.location.pathname}${window.location.search}`
    });
    const url = `/github/callback?${query.toString()}`;
    const title = "GitHub Authentication";
    const width = 600;
    const height = 700;
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screen.left;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screen.top;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;
    const systemZoom = viewportWidth / window.screen.availWidth;
    const left = (viewportWidth - width) / 2 / systemZoom + dualScreenLeft;
    const top = (viewportHeight - height) / 2 / systemZoom + dualScreenTop;
    const popup = window.open(
      url,
      title,
      `scrollbars=yes,width=${width / systemZoom},height=${height / systemZoom},top=${top},left=${left}`
    );

    if (window.focus && popup) popup.focus();

    const timer = window.setInterval(() => {
      if (!popup || popup.closed) {
        window.clearInterval(timer);
        loadGithubStatus();
      }
    }, 1000);
  }

  async function revokeDeployHook() {
    if (!site?.siteUid) return;
    setIsRevokingHook(true);
    setStatusMessage("");
    try {
      const query = cpId ? `?cpId=${encodeURIComponent(cpId)}` : "";
      const response = await fetch(`/api/hosting/sites/${site.siteUid}/github/deployhook/revoke${query}`, {
        method: "POST"
      });
      const result = await response.json().catch(() => null);
      setStatusMessage(result?.message || "Deploy hook updated.");
      await loadGithubStatus();
    } catch {
      setStatusMessage("Unable to revoke deploy hook.");
    } finally {
      setIsRevokingHook(false);
    }
  }

  async function copyDeployHook() {
    if (!githubStatus?.hookUrl) return;
    await navigator.clipboard?.writeText(githubStatus.hookUrl);
    setStatusMessage("Deploy hook URL copied.");
  }

  async function saveEnvironmentSettings(event) {
    event.preventDefault();
    if (!site?.siteUid) return;
    setIsSavingEnvironment(true);
    setStatusMessage("");
    try {
      const response = await fetch(`/api/hosting/sites/${site.siteUid}/github/environment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId, environmentSettings: environmentDraft })
      });
      const result = await response.json().catch(() => null);
      setStatusMessage(result?.message || "Environment variables saved.");
      if (response.ok && result?.success) {
        await loadGithubStatus();
      }
    } catch {
      setStatusMessage("Unable to save environment variables.");
    } finally {
      setIsSavingEnvironment(false);
    }
  }

  async function openDeploymentLog(deployment) {
    if (!deployment?.id || !site?.siteUid) return;
    setIsLoadingLog(true);
    setDeploymentLog({ deployment, log: "" });
    try {
      const query = cpId ? `?cpId=${encodeURIComponent(cpId)}` : "";
      const response = await fetch(`/api/hosting/sites/${site.siteUid}/github/deployments/${deployment.id}/log${query}`);
      const result = await response.json().catch(() => null);
      if (response.ok && result?.success) {
        setDeploymentLog({ deployment: result.deployment, log: result.deployment?.log || "" });
      } else {
        setDeploymentLog({ deployment, log: result?.message || "Deployment log not found." });
      }
    } catch {
      setDeploymentLog({ deployment, log: "Unable to load deployment log." });
    } finally {
      setIsLoadingLog(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const fields = {
      source: deployMethod === "git" ? draft.repourl : "uploaded-zip",
      target: site?.sitePath || sitePath || "/",
      deployMethod,
      gitMethod,
      gitBranch: draft.gitBranch || "main",
      gitToken: draft.gitToken,
      gitPassphrase: draft.gitPassphrase,
      buildcmd: draft.buildcmd,
      startcmd: draft.startcmd,
      createDeployhook: draft.createDeployhook ? "true" : "false"
    };
    const result = await onSubmit(fields);
    if (result?.success) {
      await loadGithubStatus();
      if (draft.createDeployhook) {
        setIsHookPanelOpen(true);
      }
    }
  }

  const isConnected = Boolean(githubStatus?.connected);
  const hasGitHubAppInstalled = Boolean(githubStatus?.hasInstallation);
  const connectAction = hasGitHubAppInstalled ? "auth" : "install";
  const connectionLabel = isConnected ? "Connected" : hasGitHubAppInstalled ? "App Installed" : "Not connected";
  const connectButtonLabel = isConnected ? "Reconnect GitHub Account" : hasGitHubAppInstalled ? "Authorize GitHub Account" : "Connect GitHub Account";
  const deployments = githubStatus?.deployments || [];
  const repositories = githubStatus?.repositories || [];
  const repositoryOptions = [
    { value: "", label: "-- Select a Repository to Deploy --" },
    ...repositories.map((repository) => ({
      value: repository.cloneUrl,
      label: repository.fullName || repository.name || repository.cloneUrl
    }))
  ];

  return (
    <section className="github-deploy-page">
      <div className="panel-card github-deploy-header">
        <div>
          <h2>Auto Build and Deploy</h2>
          <p>Build and deploy frontend, backend, and full-stack projects by connecting to a Git repository or uploading a ZIP file.</p>
        </div>
        <button className="secondary-button compact" type="button" onClick={onBack}>Back to Websites</button>
      </div>

      <div className="panel-card github-deployments-card">
        <div className="section-heading-row">
          <div>
            <h3>Deployments History</h3>
          </div>
          {isLoadingStatus && <LoadingIcon label="Loading deployments" />}
        </div>
        <div className="solid-table-wrap">
          <table className="solid-table github-deployments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Source</th>
                <th>Created</th>
                <th>Status</th>
                <th>Build Logs</th>
              </tr>
            </thead>
            <tbody>
              {deployments.length ? deployments.map((deployment) => (
                <tr key={deployment.id}>
                  <td>#{deployment.id}</td>
                  <td className="table-source-cell">{deployment.source || "Git Repository"}</td>
                  <td>{deployment.createdAt ? new Date(deployment.createdAt).toLocaleString() : "Not available"}</td>
                  <td><GithubDeploymentStatusBadge status={deployment.status} /></td>
                  <td>
                    {(deployment.status === 2 || deployment.status === 3) ? (
                      <button className="secondary-button compact icon-only-button" type="button" onClick={() => openDeploymentLog(deployment)} title="Build Logs" aria-label="Build Logs">
                        <MenuIcon name="file" />
                      </button>
                    ) : (
                      <span className="muted-text">Not ready</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">No deployments found in the past 90 days.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel-card github-connect-card">
        <div>
          <h3>{site?.siteName}</h3>
          <p>Deploy target: {sitePath}</p>
          <div className="github-status-row">
            <span className={isConnected ? "status-pill green" : hasGitHubAppInstalled ? "status-pill blue" : "status-pill muted"}>
              {isLoadingStatus ? <LoadingIcon label="Loading Github status" /> : connectionLabel}
            </span>
            {githubStatus?.hasDeployHook && <span className="status-pill blue">Deploy Hook Ready</span>}
          </div>
        </div>
        <div className="github-connect-actions">
          <button className="github-auth-button compact" type="button" onClick={() => openGitHubAuth(connectAction)}>
            <GithubLogoIcon />
            {connectButtonLabel}
          </button>
          {isConnected && (
            <button className="secondary-button compact danger" type="button" onClick={() => openGitHubAuth("disconnect")}>
              Disconnect GitHub Account
            </button>
          )}
          <button className="secondary-button compact" type="button" onClick={() => setIsHookPanelOpen((open) => !open)}>
            Deploy Hooks
          </button>
          <button className="secondary-button compact" type="button" onClick={() => setIsEnvironmentPanelOpen(true)}>
            Environment Variables
          </button>
        </div>
      </div>

      {statusMessage && <p className="sandbox-message">{statusMessage}</p>}
      {message && <p className="sandbox-message">{message}</p>}

      {isHookPanelOpen && (
        <div className="panel-card github-hook-card">
          <div>
            <span className="status-pill blue">Deploy Hook</span>
            <h3>GitHub Webhook URL</h3>
            {githubStatus?.hookUrl ? (
              <>
                <p>Use this URL as the GitHub webhook target for this deploy job.</p>
                <code>{githubStatus.hookUrl}</code>
              </>
            ) : (
              <p>Please submit a deploy request with Create Deploy Hook selected.</p>
            )}
          </div>
          <div className="github-connect-actions">
            <button className="secondary-button compact" type="button" onClick={copyDeployHook} disabled={!githubStatus?.hookUrl}>Copy</button>
            <button className="secondary-button compact danger" type="button" onClick={revokeDeployHook} disabled={!githubStatus?.hasDeployHook || isRevokingHook}>
              {isRevokingHook ? <LoadingIcon label="Revoking hook" /> : "Revoke"}
            </button>
          </div>
        </div>
      )}

      {isEnvironmentPanelOpen && (
        <GithubEnvironmentDrawer
          siteName={site?.siteName}
          value={environmentDraft}
          onChange={setEnvironmentDraft}
          onClose={() => setIsEnvironmentPanelOpen(false)}
          onSubmit={saveEnvironmentSettings}
          isSaving={isSavingEnvironment}
        />
      )}

      {deploymentLog && (
        <GithubDeploymentLogDrawer
          deploymentLog={deploymentLog}
          isLoading={isLoadingLog}
          onClose={() => setDeploymentLog(null)}
        />
      )}

      <form className="panel-card github-deploy-form" onSubmit={submit}>
        <fieldset className="choice-fieldset">
          <legend>Deployment Method</legend>
          <label className="radio-card">
            <input type="radio" checked={deployMethod === "git"} onChange={() => setDeployMethod("git")} />
            <span>Git Repository</span>
            <small>Recommended for GitHub, GitLab, Bitbucket, and private repositories.</small>
          </label>
          <label className="radio-card">
            <input type="radio" checked={deployMethod === "zip"} onChange={() => setDeployMethod("zip")} />
            <span>Upload A Zip File</span>
            <small>Max size 200MB. Only .zip files are allowed.</small>
          </label>
        </fieldset>

        {deployMethod === "git" ? (
          isConnected && repositories.length ? (
            <label>
              Target Repository
              <select
                className="github-repository-select"
                value={repositories.some((repository) => repository.cloneUrl === draft.repourl) ? draft.repourl : ""}
                onChange={(event) => updateDraft("repourl", event.target.value)}
                required
              >
                {repositoryOptions.map((option) => (
                  <option key={`${option.value}-${option.label}`} value={option.value}>{option.label}</option>
                ))}
              </select>
              <small>Select the project repository you intend to build and deploy.</small>
            </label>
          ) : (
            <label>
              Git Repository URL
              <input value={draft.repourl} onChange={(event) => updateDraft("repourl", event.target.value)} placeholder="https://github.com/User/MyRepository.git" required />
              <small>Access token or deploy key is needed for private repositories.</small>
            </label>
          )
        ) : (
          <label>
            Select ZIP File
            <input type="file" accept=".zip" />
            <small>ZIP upload is prepared here; deployment still follows the old nodejs_action flow.</small>
          </label>
        )}

        <button className="secondary-button compact show-more-button" type="button" onClick={() => setShowMore((visible) => !visible)}>
          {showMore ? "Show Less" : "Show More Options"}
        </button>

        {showMore && (
          <div className="github-more-fields">
            {deployMethod === "git" && (
              <>
                <label>
                  Git Branch
                  <input value={draft.gitBranch} onChange={(event) => updateDraft("gitBranch", event.target.value)} placeholder="main" />
                  <small>The default branch is usually main or master.</small>
                </label>
                <fieldset className="choice-fieldset compact-choice">
                  <legend>Deployment Key</legend>
                  <label className="radio-line">
                    <input type="radio" checked={gitMethod === "token"} onChange={() => setGitMethod("token")} />
                    Personal Access Token
                  </label>
                  <label className="radio-line">
                    <input type="radio" checked={gitMethod === "key"} onChange={() => setGitMethod("key")} />
                    Deploy Key
                  </label>
                </fieldset>
                {gitMethod === "token" ? (
                  <label>
                    Personal Access Token
                    <input value={draft.gitToken} onChange={(event) => updateDraft("gitToken", event.target.value)} placeholder="ghp_XXXXXXXXXXXXXX" />
                    <small>Needed only for private repositories.</small>
                  </label>
                ) : (
                  <>
                    <label>
                      Select Deploy Key
                      <input type="file" />
                      <small>Deploy keys grant access to one repository.</small>
                    </label>
                    <label>
                      Passphrase
                      <input value={draft.gitPassphrase} onChange={(event) => updateDraft("gitPassphrase", event.target.value)} />
                    </label>
                  </>
                )}
              </>
            )}
            <label>
              Build Command
              <input value={draft.buildcmd} onChange={(event) => updateDraft("buildcmd", event.target.value)} placeholder="npm run build" />
              <small>Automatically detected if left blank for most frameworks.</small>
            </label>
            <label>
              Start Command
              <input value={draft.startcmd} onChange={(event) => updateDraft("startcmd", event.target.value)} placeholder="npm run start" />
              <small>Automatically detected if left blank.</small>
            </label>
            {deployMethod === "git" && (
              <label className="checkbox-line">
                <input type="checkbox" checked={draft.createDeployhook} onChange={(event) => updateDraft("createDeployhook", event.target.checked)} />
                Create Deploy Hook
              </label>
            )}
          </div>
        )}

        <div className="function-submit-row">
          <button className="primary-button compact" type="submit" disabled={isBusy}>
            {isBusy ? <LoadingIcon label="Deploying from Github" /> : "Deploy Now"}
          </button>
          <button className="orange-action-button compact" type="button" onClick={() => setIsEnvironmentPanelOpen(true)}>
            Environment Variables
          </button>
        </div>
      </form>

      <GithubFaqSection />
    </section>
  );
}

function GithubLogoIcon() {
  return (
    <svg className="github-logo-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.52-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.15-.68-.52-.01-.53.63-.01 1.08.59 1.23.83.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.63.82-2.2-.08-.21-.36-1.04.08-2.17 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 4c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.13.16 1.96.08 2.17.51.57.82 1.3.82 2.2 0 3.14-1.87 3.83-3.65 4.04.29.26.54.75.54 1.52 0 1.09-.01 1.97-.01 2.24 0 .21.15.47.55.39A8.05 8.05 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
    </svg>
  );
}

function GithubDeploymentStatusBadge({ status }) {
  if (status === 2) return <span className="status-pill green">Success</span>;
  if (status === 3) return <span className="status-pill danger">Failed</span>;
  if (status === 1) return <span className="status-pill blue"><LoadingIcon label="Building" /> Building</span>;
  return <span className="status-pill blue">Building</span>;
}

function GithubEnvironmentDrawer({ siteName, value, onChange, onClose, onSubmit, isSaving }) {
  const [isDraggingEnvFile, setIsDraggingEnvFile] = useState(false);

  function importEnvFile(file) {
    if (!file) return;
    if (file.name !== ".env") {
      onChange(value);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsText(file);
  }

  function handleEnvFileInput(event) {
    importEnvFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleEnvFileDrop(event) {
    event.preventDefault();
    setIsDraggingEnvFile(false);
    importEnvFile(event.dataTransfer?.files?.[0]);
  }

  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="function-drawer panel-card settings-drawer github-env-drawer" role="dialog" aria-modal="true" aria-label="Environment Variables">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">Environment</span>
            <h2>Environment Variables</h2>
            <p>Environment Variables for {siteName}</p>
          </div>
          <div className="function-drawer-actions">
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={onClose} aria-label="Close">
              <MenuIcon name="Close" />
            </button>
          </div>
        </header>
        <form className="settings-form github-env-form" onSubmit={onSubmit}>
          <label>
            .env
            <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={15} />
          </label>
          <section className="github-env-dropzone-wrap">
            <span className="helpdesk-dropzone-label">Import .env</span>
            <label
              className={["helpdesk-dropzone github-env-dropzone", isDraggingEnvFile ? "dragging" : ""].filter(Boolean).join(" ")}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingEnvFile(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDraggingEnvFile(false)}
              onDrop={handleEnvFileDrop}
            >
              <span className="helpdesk-dropzone-icon" aria-hidden="true"><MenuIcon name="upload" /></span>
              <span className="helpdesk-dropzone-copy">
                <strong>Drop .env here or click to choose</strong>
                <small>All existing environment variables will be overwritten.</small>
              </span>
              <input className="helpdesk-dropzone-input" type="file" accept=".env" onChange={handleEnvFileInput} />
            </label>
          </section>
          <button className="primary-button compact drawer-full-button" type="submit" disabled={isSaving}>
            {isSaving ? <LoadingIcon label="Saving environment variables" /> : "Save Environment Variables"}
          </button>
        </form>
      </aside>
    </div>
  );
}

function GithubDeploymentLogDrawer({ deploymentLog, isLoading, onClose }) {
  const deployment = deploymentLog.deployment || {};
  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="function-drawer panel-card settings-drawer github-log-drawer" role="dialog" aria-modal="true" aria-label="Build Logs">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">Build Logs</span>
            <h2>Deployment #{deployment.id}</h2>
            <p>{deployment.source || "Git Repository"}</p>
          </div>
          <div className="function-drawer-actions">
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={onClose} aria-label="Close">
              <MenuIcon name="Close" />
            </button>
          </div>
        </header>
        {isLoading ? <LoadingIcon label="Loading build log" /> : <pre className="github-build-log">{deploymentLog.log || "No build log was returned."}</pre>}
      </aside>
    </div>
  );
}

function GithubFaqSection() {
  const faqs = [
    ["What frameworks are supported?", "Our platform automatically detects and supports all major modern frameworks, including Next.js, Express, Fastify, Nest.js, Remix, Nuxt, Astro, SvelteKit, React, Vue, Angular, Solid, Sails, and more."],
    ["Why hosting Node.js application with us?", "We provide a full-stack cloud platform where hosting, CDN, security, and compute are built in. Push code and the platform builds, runs, and serves your application globally."],
    ["How to deploy Node.js app?", "Connect to Git Repository such as GitHub, GitLab, or Bitbucket, or upload a ZIP file of your project. We create a secure build environment, build the app, and upload the output to your site root."],
    ["My app runs fine locally. Why does it fail to deploy?", "Please check the logs first. Common issues include missing PORT configuration, an invalid start command, or missing environment variables."]
  ];
  return (
    <section className="panel-card github-faq-card">
      <span className="status-pill blue">FAQs</span>
      <div className="github-faq-grid">
        {faqs.map(([title, body]) => (
          <article className="panel-card github-faq-item" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WebsiteCards({ sites, onUpdateSiteName, onQueueAction, onFunctionAction, onMoreFunctions, onChangeSection }) {
  return (
    <div className="website-card-grid">
      {sites.map((site) => (
        <article className="panel-card website-card" key={site.siteKey}>
          <div className="website-card-header">
            <div className="website-title-group">
              <span className="status-pill">{site.status}</span>
              <div className="website-title-row">
                <SiteNameEditor siteName={site.siteName} onChange={(siteName) => onUpdateSiteName(site.siteKey, siteName)} />
              </div>
            </div>
            <span className="runtime-pill">{site.runtime}</span>
          </div>
          <div className="mapped-domains">
            <span>Mapped Domains</span>
            <div>
              {site.mappedDomains.map((domain) => (
                <a href={domain.url} key={domain.label} target="_blank" rel="noreferrer">
                  <span>{domain.label}</span>
                  {domain.ssl && <span className="ssl-domain-badge">SSL</span>}
                </a>
              ))}
              <button className="add-domain-chip" type="button" aria-label="+ Add Domain" onClick={() => onFunctionAction("Domain Manager", site)}>
                <MenuIcon name="add-domain" />
              </button>
            </div>
          </div>
          <WebsiteActionButtons
            onAction={(action) => onQueueAction(action, site)}
            onFunctionAction={(action) => onFunctionAction(action, site)}
            onMoreFunctions={() => onMoreFunctions(site)}
            onChangeSection={onChangeSection}
          />
        </article>
      ))}
    </div>
  );
}

function WebsiteTable({ sites, onUpdateSiteName, onQueueAction, onFunctionAction, onMoreFunctions, onChangeSection }) {
  return (
    <div className="table-wrap website-table">
      <table>
        <thead>
          <tr>
            <th>Site Name</th>
            <th>Mapped Domains</th>
            <th className="website-status-column">Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.siteKey}>
              <td>
                <div className="website-table-name">
                  <SiteNameEditor siteName={site.siteName} onChange={(siteName) => onUpdateSiteName(site.siteKey, siteName)} />
                </div>
              </td>
              <td>
                <div className="table-domain-list">
                  {site.mappedDomains.map((domain) => (
                    <a href={domain.url} key={domain.label} target="_blank" rel="noreferrer">
                      <span>{domain.label}</span>
                      {domain.ssl && <span className="ssl-domain-badge">SSL</span>}
                    </a>
                  ))}
                  <button className="add-domain-chip" type="button" aria-label="+ Add Domain" onClick={() => onFunctionAction("Domain Manager", site)}>
                    <MenuIcon name="add-domain" />
                  </button>
                </div>
              </td>
              <td className="website-status-column"><WebsiteStatusIndicator status={site.status} compact /></td>
              <td>
                <WebsiteActionButtons
                  compact
                  onAction={(action) => onQueueAction(action, site)}
                  onFunctionAction={(action) => onFunctionAction(action, site)}
                  onMoreFunctions={() => onMoreFunctions(site)}
                  onChangeSection={onChangeSection}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WebsiteStatusIndicator({ status, compact = false }) {
  const isStopped = String(status ?? "").trim().toLowerCase() === "stopped";
  if (isStopped && compact) {
    return (
      <span className="website-stopped-icon" title="Site Stopped" aria-label="Site Stopped">
        <MenuIcon name="x" />
      </span>
    );
  }

  return <span className={isStopped ? "status-pill danger" : "status-pill"}>{status || "Active"}</span>;
}

function SiteNameEditor({ siteName, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(siteName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) setDraftName(siteName);
  }, [siteName, isEditing]);

  async function commitName() {
    const nextName = draftName.trim();
    if (!nextName || nextName === siteName) {
      setDraftName(siteName);
      setIsEditing(false);
      setError("");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const savedName = await onChange(nextName);
      setDraftName(savedName || nextName);
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Unable to update site name.");
      setDraftName(siteName);
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <span className="site-name-edit-wrap">
        <input
          autoFocus
          className="site-name-input"
          disabled={isSaving}
          value={draftName}
          onBlur={commitName}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commitName();
            if (event.key === "Escape") {
              setDraftName(siteName);
              setIsEditing(false);
              setError("");
            }
          }}
        />
        {isSaving && <LoadingIcon label="Saving site name" />}
        {error && <small className="site-name-error">{error}</small>}
      </span>
    );
  }

  return (
    <button className="site-name-button" type="button" onClick={() => setIsEditing(true)} title="Edit site name">
      {siteName}
    </button>
  );
}

function WebsiteActionButtons({ compact = false, onAction, onFunctionAction, onMoreFunctions, onChangeSection }) {
  const runAction = (label) => {
    if (label === "SSL" && onChangeSection) {
      onChangeSection("ssl");
      return;
    }

    if (label === "CDN" && onChangeSection) {
      onChangeSection("cdn");
      return;
    }

    if (onFunctionAction && websiteMoreFunctionKeyByLabel[label]) {
      onFunctionAction(label);
      return;
    }

    onAction(label);
  };

  return (
    <div className={compact ? "website-action-buttons compact-actions" : "website-action-buttons"}>
      {websiteActions.map((action) => action.label === "More Functions" ? (
        <button
          aria-label={action.label}
          className="secondary-button compact icon-only-button"
          type="button"
          key={action.label}
          onClick={onMoreFunctions}
        >
          <MenuIcon name={action.icon} />
        </button>
      ) : (
        <button
          aria-label={action.label}
          className="secondary-button compact icon-only-button"
          type="button"
          key={action.label}
          onClick={() => runAction(action.label)}
        >
          <MenuIcon name={action.icon} />
        </button>
      ))}
      {deployActions.map((action) => (
        <button
          className="secondary-button compact deploy-action-text-button"
          type="button"
          key={action.label}
          onClick={() => onAction(action.label)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function WebsiteMoreFunctionsDrawer({ site, onAction, onClose }) {
  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="function-drawer panel-card" aria-label="More website functions" role="dialog">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">More Functions</span>
            <h2>Website Tools</h2>
            <p>{site?.siteName || "Selected website"}</p>
          </div>
          <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={onClose} aria-label="Close">
            <MenuIcon name="x" />
          </button>
        </header>
        <div className="website-more-drawer-list">
          {websiteMoreFunctionColumns.map((column) => (
            <section className="website-more-column" key={column.title}>
              <h3>{column.title}</h3>
              <div className="website-more-list">
                {column.items.map((item) => (
                  <button type="button" key={item.label} onClick={() => onAction(item.label)}>
                    <MenuIcon name={item.icon} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}

function WebsiteFunctionDrawer({ activeFunction, fields, siteOptions = [], error, isLoading, busyAction, message, onChangeField, onClose, onRefresh, onSubmit, onOpenFolderPicker }) {
  const details = activeFunction.details;
  const data = details?.data ?? {};
  const isSiteNameEditor = details?.key === "site-name" || activeFunction.key === "site-name";
  const isDetailError = details?.key === "detail-error" || activeFunction.key === "detail-error";
  const functionKey = details?.key ?? activeFunction.key;
  const isMappedPath = functionKey === "mapped-path";
  const isDomainManager = functionKey === "domain-manager";
  const isDeleteWebsite = functionKey === "delete-website";
  const isCoreMode = functionKey === "core-mode";
  const isNodeJsApp = functionKey === "nodejs-app";
  const isPhpVersion = functionKey === "php-version";
  const isPhpSettings = functionKey === "php-settings";
  const isVisitorStats = functionKey === "visitor-stats";
  const isFtpAccess = functionKey === "ftp-access";
  const isSmtpSampleCode = functionKey === "smtp-sample-code";
  const isIpDeny = functionKey === "ip-deny";
  const isIisLogManager = functionKey === "iis-log-manager";
  const isDefaultDoc = functionKey === "default-doc";
  const isMimeType = functionKey === "mime-type";
  const isScriptMap = functionKey === "script-map";
  const isCustomErrors = functionKey === "custom-errors";
  const isForceHttps = functionKey === "force-https";
  const isSiteGuard = functionKey === "site-guard";
  const isOutgoingPort = functionKey === "outgoing-port";
  const isCreateNetApp = functionKey === "create-net-app";
  const isVirtualDir = functionKey === "virtual-dir";
  const visitorStatsRows = Array.isArray(data.visitorStats?.rows) ? data.visitorStats.rows : [];
  const visitorStatsRow = visitorStatsRows[0] ?? {};
  const visitorStatsEnabled = Boolean(visitorStatsRow.stats_enabled ?? visitorStatsRow.statsEnabled);
  const visitorStatsDomain = visitorStatsRow.stats_domain ?? visitorStatsRow.statsDomain ?? "";
  const visitorDomainOptions = (Array.isArray(data.domains) ? data.domains : [])
    .map((domain) => domain.domain_name ?? domain.domainName ?? domain.title ?? "")
    .filter(Boolean)
    .map((domain) => ({ value: domain, label: domain }));
  const ftpRows = Array.isArray(data.ftpUsers) ? data.ftpUsers : [];
  const mappedDomains = (activeFunction.site?.mappedDomains ?? []).filter((domain) => {
    const label = String(domain.label ?? domain.domain ?? domain.domainName ?? "").trim();
    return label && label !== "No mapped domains";
  });
  const moveSiteOptions = siteOptions
    .filter((site) => !site.isSubdomain && String(site.siteKey) !== String(activeFunction.site?.siteKey))
    .map((site) => ({
      value: String(site.siteUid ?? site.siteKey),
      label: `${site.siteName || site.rootName || "Website"}${site.sitePath ? ` - ${site.sitePath}` : ""}`
    }));
  const rootFtp = ftpRows.find((row) => String(row.ftp_login ?? row.ftpLogin ?? "").toLowerCase() === String(data.site?.cpLogin ?? activeFunction.site?.cpLogin ?? "").toLowerCase()) ?? ftpRows[0] ?? {};
  const ftpServer = rootFtp.cpurl ?? rootFtp.cpURL ?? `${String(data.site?.serverId ?? activeFunction.site?.serverId ?? "").toLowerCase()}.site4now.net`;
  const ipDenyRows = Array.isArray(data.ipDeny?.denyList) ? data.ipDeny.denyList : [];
  const dynamicIp = data.ipDeny?.dynamic ?? {};
  const iisLogs = data.iisLogs ?? {};
  const mimeMaps = Array.isArray(data.mimeMaps) ? data.mimeMaps : [];
  const scriptMaps = Array.isArray(data.scriptMaps) ? data.scriptMaps : [];
  const errorPages = Array.isArray(data.errorPages) ? data.errorPages : [];
  const outgoingPorts = Array.isArray(data.outgoingPorts) ? data.outgoingPorts : [];
  const iisApps = Array.isArray(data.iisApps) ? data.iisApps : [];
  const virtualDirs = Array.isArray(data.virtualDirs) ? data.virtualDirs : [];
  const redirectRows = (Array.isArray(data.runtime) ? data.runtime : [])
    .filter((row) => String(row.row_type ?? row.rowType ?? "").toLowerCase() === "redirect");
  const siteGuardEnabled = Boolean(
    data.site?.webknight
    ?? data.security?.find?.((row) => String(row.site_Uid ?? row.site_uid ?? "") === String(activeFunction.site?.siteUid ?? ""))?.webknight
    ?? activeFunction.site?.webknight
  );
  const customErrorOptions = ["401", "403", "404", "405", "406", "412", "500", "501"].map((code) => ({ value: code, label: `${code} Error` }));
  const scriptMapOptions = [
    { value: "85", label: "PHP 8.5.x" },
    { value: "83", label: "PHP 8.3.x" },
    { value: "82", label: "PHP 8.2.x" },
    { value: "14", label: "PHP 8.1.x" },
    { value: "13", label: "PHP 8.0.x" },
    { value: "12", label: "PHP 7.4.x" },
    { value: "11", label: "PHP 7.3.x" },
    { value: "10", label: "PHP 7.2.x" },
    { value: "9", label: "PHP 7.0.x" },
    { value: "8", label: "PHP 5.6.x" },
    { value: "7", label: "Perl" },
    { value: "6", label: "Python" }
  ];
  const siteRootPath = String(data.site?.sitePath ?? activeFunction.site?.sitePath ?? "").replaceAll("/", "\\");
  const smtpDomains = mappedDomains
    .map((domain) => String(domain.label ?? domain.domain ?? domain.domainName ?? "").trim())
    .filter((domain) => domain && !isTemporaryHostingDomain(domain));
  const smtpDomainOptions = (smtpDomains.length ? smtpDomains : mappedDomains.map((domain) => String(domain.label ?? domain.domain ?? domain.domainName ?? "").trim()).filter(Boolean))
    .map((domain) => ({ value: domain, label: domain }));
  const actionResult = (
    <>
      {error && <p className="sandbox-message danger function-action-message">{error}</p>}
      {message && <p className="sandbox-message function-action-message">{message}</p>}
    </>
  );

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
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={onClose} aria-label="Close">
              <MenuIcon name="x" />
            </button>
          </div>
        </header>

        {isLoading && <LoadingState label="Loading live website data" />}
        {!details && actionResult}

        {isSiteNameEditor && (
          <form className="function-field-form compact-site-name-form" onSubmit={(event) => {
            event.preventDefault();
            onSubmit("save");
          }}>
            <label>
              Current Site Name
              <input value={activeFunction.site?.siteName ?? ""} readOnly />
            </label>
            <label>
              New Site Name
              <input
                value={fields.siteName ?? ""}
                onChange={(event) => onChangeField("siteName", event.target.value)}
                placeholder="New site name"
              />
            </label>
            <div className="function-submit-row">
              <button className="primary-button compact" type="submit" disabled={isLoading || !(fields.siteName ?? "").trim()}>
                Submit
              </button>
            </div>
            {actionResult}
          </form>
        )}

        {details && !isSiteNameEditor && (
          <>
            {!!details.warnings?.length && (
              <div className="function-warning-list">
                {details.warnings.map((warning) => <p key={warning}>{warning}</p>)}
              </div>
            )}

            {isDetailError && (
              <section className="function-field-form detail-error-panel">
                <div className="detail-error-status-row">
                  <div>
                    <h3>Detail Error Message Display</h3>
                    <p>When enabled, IIS shows detailed diagnostic errors instead of a generic error page.</p>
                  </div>
                  <span className={data.detailError?.enabled ? "status-pill blue" : "status-pill muted"}>
                    {data.detailError?.status ?? "OFF"}
                  </span>
                </div>
                <div className="function-tip-box">
                  <p>For .NET Core and Node.js apps, application logs are saved in the <strong>/logs</strong> folder at the site root.</p>
                  <p>Restarting the application pool usually resolves most unexpected issues.</p>
                </div>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("enable")}>
                    {busyAction === "enable" ? <LoadingIcon label="Turning on detail error message display" /> : "Turn On"}
                  </button>
                  <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("disable")}>
                    {busyAction === "disable" ? <LoadingIcon label="Turning off detail error message display" /> : "Turn Off"}
                  </button>
                </div>
                {actionResult}
              </section>
            )}

            {isDomainManager && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit("add");
              }}>
                <h3>Domain Manager</h3>
                <p>Map domain names to this website, remove existing mapped domains, or move a domain to another website.</p>
                <div className="domain-manager-list">
                  {mappedDomains.length ? mappedDomains.map((domain) => {
                    const label = String(domain.label ?? domain.domain ?? domain.domainName ?? "").trim();
                    const domainUid = domain.domainUid ?? domain.DomainUid ?? domain.id ?? domain.Id ?? "";
                    const isTempDomain = isTemporaryHostingDomain(label);
                    return (
                      <article className="domain-manager-row" key={`${domainUid || label}`}>
                        <div>
                          <strong>{label}</strong>
                          {domain.ssl && <span className="ssl-domain-badge">SSL</span>}
                          {isTempDomain && <span className="status-pill muted">Temp URL</span>}
                        </div>
                        <div className="domain-manager-actions">
                          <button
                            className="secondary-button compact danger-button"
                            type="button"
                            disabled={Boolean(busyAction) || !domainUid}
                            onClick={() => onSubmit(isTempDomain ? "deletetempurl" : "delete", {
                              domain: label,
                              domainUid: String(domainUid)
                            })}
                          >
                            {busyAction === "delete" || busyAction === "deletetempurl" ? <LoadingIcon label="Removing domain" /> : "Delete"}
                          </button>
                          {!isTempDomain && (
                            <>
                              <CustomSelect
                                value={fields.toSiteUid ?? ""}
                                ariaLabel={`Move ${label} to another website`}
                                placeholder="Move to..."
                                onChange={(value) => {
                                  onChangeField("domain", label);
                                  onChangeField("domainUid", String(domainUid));
                                  onChangeField("toSiteUid", value);
                                }}
                                options={moveSiteOptions}
                              />
                              <button
                                className="secondary-button compact"
                                type="button"
                                disabled={Boolean(busyAction) || !domainUid || !fields.toSiteUid}
                                onClick={() => onSubmit("move", {
                                  domain: label,
                                  domainUid: String(domainUid),
                                  toSiteUid: fields.toSiteUid
                                })}
                              >
                                {busyAction === "move" ? <LoadingIcon label="Moving domain" /> : "Move"}
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No mapped domains found for this website.</p>
                  )}
                </div>
                <label>
                  New Domain
                  <input
                    value={fields.domain ?? ""}
                    onChange={(event) => onChangeField("domain", event.target.value)}
                    placeholder="example.com"
                  />
                </label>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.domain ?? "").trim()}>
                    {busyAction === "add" ? <LoadingIcon label="Adding domain" /> : "Add Domain"}
                  </button>
                </div>
                {actionResult}
              </form>
            )}

            {isDeleteWebsite && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit("delete");
              }}>
                <h3>Delete Website</h3>
                <p>This removes the IIS website and its domain records. Any related databases remain available for separate cleanup.</p>
                <label className="file-action-checkbox">
                  <input
                    type="checkbox"
                    checked={fields.confirmDelete === "true"}
                    onChange={(event) => onChangeField("confirmDelete", event.target.checked ? "true" : "false")}
                  />
                  I understand and want to delete this website.
                </label>
                <label className="file-action-checkbox">
                  <input
                    type="checkbox"
                    checked={fields.deleteFiles === "true"}
                    onChange={(event) => onChangeField("deleteFiles", event.target.checked ? "true" : "false")}
                  />
                  Also delete the website folder.
                </label>
                <div className="function-submit-row">
                  <button className="danger-button compact" type="submit" disabled={Boolean(busyAction) || fields.confirmDelete !== "true"}>
                    {busyAction === "delete" ? <LoadingIcon label="Deleting website" /> : "Delete Website"}
                  </button>
                </div>
                {actionResult}
              </form>
            )}

            {isCoreMode && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit("save");
              }}>
                <div className="function-tip-box">
                  <p>To host multiple ASP.NET Core apps, use OutOfProcess hosting model in all core apps.</p>
                </div>
                <p>Current Core Model: <strong>{data.coreMode?.current ?? data.runtime?.coreMode ?? "Not available"}</strong></p>
                <label>
                  Core Model
                  <CustomSelect
                    value={fields.hostingModel || "OutOfProcess"}
                    ariaLabel="Choose .NET Core hosting model"
                    onChange={(value) => onChangeField("hostingModel", value)}
                    options={[
                      { value: "OutOfProcess", label: "OutOfProcess" },
                      { value: "InProcess", label: "InProcess" }
                    ]}
                  />
                </label>
                <label className="file-action-checkbox">
                  <input
                    type="checkbox"
                    checked={(fields.applyAll ?? "true") === "true"}
                    onChange={(event) => onChangeField("applyAll", event.target.checked ? "true" : "false")}
                  />
                  Apply to all core APPs
                </label>
                <p>
                  <span className="kb-badge">KB Article</span>{" "}
                  <a href="http://www.smarterasp.net/support/kb/a1999/what-should-we-do-when-get-http-error-500_34-ancm-mixed-hosting-models-not-supported.aspx" target="_blank" rel="noreferrer">
                    How to change core hosting model manually
                  </a>
                </p>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="submit" disabled={Boolean(busyAction)}>
                    {busyAction ? <LoadingIcon label="Saving .NET Core mode" /> : "Save"}
                  </button>
                </div>
                {actionResult}
              </form>
            )}

            {isNodeJsApp && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit("save");
              }}>
                <div className="function-tip-box">
                  <p>Please update your code to use the dynamic port, for example: app.listen(process.env.PORT || 3000).</p>
                </div>
                <p>Current Node.JS Status: <strong>{data.nodejs?.status ?? "Not available"}</strong></p>
                <label>
                  Node.JS Module
                  <CustomSelect
                    value={fields.mode || "httpPlatformHandler"}
                    ariaLabel="Choose Node.js module"
                    onChange={(value) => onChangeField("mode", value)}
                    options={[
                      { value: "httpPlatformHandler", label: "Enable Node.JS" },
                      { value: "none", label: "Disable Node.JS" }
                    ]}
                  />
                </label>
                {(fields.mode || "httpPlatformHandler") !== "none" && (
                  <label>
                    Application startup file*
                    <input
                      value={fields.startupfile ?? fields.entryPoint ?? ""}
                      onChange={(event) => onChangeField("startupfile", event.target.value)}
                      placeholder="app.js"
                      required
                    />
                    <small>The name of the .js file that Node.js will start, such as app.js, server.js, or main.js.</small>
                  </label>
                )}
                <div className="function-submit-row">
                  <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || ((fields.mode || "httpPlatformHandler") !== "none" && !(fields.startupfile ?? fields.entryPoint ?? "").trim())}>
                    {busyAction ? <LoadingIcon label="Saving Node.js app" /> : "Save"}
                  </button>
                </div>
                <div className="function-submit-row">
                  <button className="secondary-button compact" type="button" onClick={() => window.location.href = `/panel_cp?section=websites&nodeSubfolder=${activeFunction.site?.siteUid ?? ""}`}>
                    Create Node.js App For Subfolder
                  </button>
                  <button className="secondary-button compact github-button" type="button" onClick={() => window.location.href = `/github/deploy?siteUid=${activeFunction.site?.siteUid ?? ""}`}>
                    Github Deploy
                  </button>
                </div>
                <div className="kb-link-list">
                  {[
                    ["Quick Start Node.JS", "http://www.smarterasp.net/support/kb/a1970/quick-start-node_js.aspx"],
                    ["Quick Start Next.JS", "http://www.smarterasp.net/support/kb/a2233/how-to-publish-a-next_js-project-to-your-hosting-account.aspx"],
                    ["Quick Start React.JS", "http://www.smarterasp.net/support/kb/a2176/how-to-publish-a-react_js-project-to-your-hosting-account.aspx"],
                    ["Quick Start Nest.JS", "http://www.smarterasp.net/support/kb/a2259/how-to-publish-a-nestjs-project-to-your-hosting-account.aspx"],
                    ["Quick Start Vue.JS", "http://www.smarterasp.net/support/kb/a2170/how-to-publish-a-vue_js-project-to-your-hosting-account.aspx"],
                    ["Quick Start Peer.JS", "http://www.smarterasp.net/support/kb/a2193/how-to-deploy-peerjs.aspx"]
                  ].map(([label, href]) => (
                    <a key={href} href={href} target="_blank" rel="noreferrer"><span className="kb-badge">KB Article</span> {label}</a>
                  ))}
                </div>
                {actionResult}
              </form>
            )}

            {isPhpVersion && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit("save");
              }}>
                <div className="function-tip-box">
                  <p>Make sure your site can run on the selected PHP version before changing it.</p>
                </div>
                <p>Current PHP Version: <strong>{activeFunction.site?.phpVersion || "Not available"}</strong></p>
                <label>
                  PHP Version
                  <CustomSelect
                    value={fields.phpversion || fields.phpVersion || "83"}
                    ariaLabel="Choose PHP version"
                    onChange={(value) => onChangeField("phpversion", value)}
                    options={[
                      { value: "85", label: "PHP 8.5.x" },
                      { value: "83", label: "PHP 8.3.x" },
                      { value: "82", label: "PHP 8.2.x" },
                      { value: "14", label: "PHP 8.1.x" },
                      { value: "13", label: "PHP 8.0.x" },
                      { value: "12", label: "PHP 7.4.x" },
                      { value: "11", label: "PHP 7.3.x" },
                      { value: "10", label: "PHP 7.2.x" },
                      { value: "9", label: "PHP 7.0.x" },
                      { value: "8", label: "PHP 5.6.x" },
                      { value: "4", label: "PHP 5.5.x" },
                      { value: "3", label: "PHP 5.4.x" },
                      { value: "1", label: "PHP 5.2.x" },
                      { value: "250", label: "Disable PHP" }
                    ]}
                  />
                </label>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="submit" disabled={Boolean(busyAction)}>
                    {busyAction ? <LoadingIcon label="Saving PHP version" /> : "Save"}
                  </button>
                </div>
                {actionResult}
              </form>
            )}

            {isPhpSettings && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit("save");
              }}>
                <div className="function-tip-box">
                  <p>You can define PHP parameters using the same syntax as php.ini.</p>
                  <p>Examples: memory_limit = 128M, max_execution_time = 60, post_max_size = 8M, upload_max_filesize = 2M, opcache.enable=0</p>
                </div>
                <p>PHP Settings for <strong>{activeFunction.site?.siteName ?? "site"}</strong></p>
                <label>
                  .user.ini
                  <textarea
                    className="code-textarea"
                    value={fields.phpsettings ?? fields.settings ?? ""}
                    onChange={(event) => onChangeField("phpsettings", event.target.value)}
                    rows={12}
                    placeholder={"memory_limit = 128M\nmax_execution_time = 60"}
                  />
                </label>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="submit" disabled={Boolean(busyAction)}>
                    {busyAction ? <LoadingIcon label="Saving PHP settings" /> : "Save"}
                  </button>
                </div>
                {actionResult}
              </form>
            )}

            {isVisitorStats && (
              <section className="function-field-form">
                {data.visitorStats?.available === false ? (
                  <p className="sandbox-message danger">Visitor stats are not available for sub-sites.</p>
                ) : (
                  <>
                    <div className="detail-error-status-row">
                      <div>
                        <h3>Visitor Stats</h3>
                        <p>Stats take about 24 hours before the first update.</p>
                      </div>
                      <span className={visitorStatsEnabled ? "status-pill blue" : "status-pill muted"}>
                        {visitorStatsEnabled ? "ON" : "OFF"}
                      </span>
                    </div>
                    <label>
                      Domain Name
                      {visitorStatsEnabled ? (
                        <input value={visitorStatsDomain} readOnly />
                      ) : (
                        <CustomSelect
                          value={fields.mainDomain || visitorDomainOptions[0]?.value || ""}
                          ariaLabel="Choose stats domain"
                          onChange={(value) => onChangeField("mainDomain", value)}
                          options={visitorDomainOptions}
                        />
                      )}
                    </label>
                    <div className="function-submit-row">
                      <button className="primary-button compact" type="button" disabled={Boolean(busyAction) || (!visitorStatsEnabled && !(fields.mainDomain || visitorDomainOptions[0]?.value))} onClick={() => onSubmit("enable")}>
                        {busyAction === "enable" ? <LoadingIcon label="Enabling visitor stats" /> : "Turn On"}
                      </button>
                      <button className="secondary-button compact" type="button" disabled={Boolean(busyAction) || !visitorStatsEnabled} onClick={() => onSubmit("disable")}>
                        {busyAction === "disable" ? <LoadingIcon label="Disabling visitor stats" /> : "Turn Off"}
                      </button>
                      {visitorStatsEnabled && data.visitorStats?.statsUrl && (
                        <a className="secondary-button compact" href={data.visitorStats.statsUrl} target="_blank" rel="noreferrer">View</a>
                      )}
                    </div>
                  </>
                )}
                {actionResult}
              </section>
            )}

            {isFtpAccess && (
              <section className="function-field-form">
                <dl className="webdeploy-info-list">
                  <div>
                    <dt>Server IP</dt>
                    <dd>{ftpServer}</dd>
                  </div>
                  <div>
                    <dt>Username</dt>
                    <dd>{data.site?.cpLogin ?? activeFunction.site?.cpLogin ?? "Not available"}</dd>
                  </div>
                  <div>
                    <dt>Password</dt>
                    <dd>Same as control panel</dd>
                  </div>
                  <div>
                    <dt>FTP Path and Folder</dt>
                    <dd>{formatWebsiteRelativePath(data.site?.sitePath ?? activeFunction.site?.sitePath ?? "")}</dd>
                  </div>
                </dl>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="button" onClick={() => window.location.href = "/panel_cp?section=ftp"}>
                    Add FTP User
                  </button>
                </div>
              </section>
            )}

            {isSmtpSampleCode && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit("install");
              }}>
                <div className="function-tip-box">
                  <p>This function will copy our ASP.NET/PHP SMTP testing script into your account. You can run it to test SMTP and review the source code.</p>
                </div>
                <label>
                  Domain
                  <CustomSelect
                    value={fields.domain || smtpDomainOptions[0]?.value || ""}
                    ariaLabel="Choose SMTP sample domain"
                    onChange={(value) => onChangeField("domain", value)}
                    options={smtpDomainOptions}
                  />
                </label>
                <label>
                  Type
                  <CustomSelect
                    value={fields.scripttype || "1"}
                    ariaLabel="Choose SMTP sample type"
                    onChange={(value) => onChangeField("scripttype", value)}
                    options={[
                      { value: "1", label: "ASP.NET C#" },
                      { value: "2", label: "ASP.NET VB" },
                      { value: "4", label: "ASP" },
                      { value: "3", label: "PHP" }
                    ]}
                  />
                </label>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.domain || smtpDomainOptions[0]?.value)}>
                    {busyAction ? <LoadingIcon label="Installing SMTP sample code" /> : "Submit"}
                  </button>
                </div>
                {actionResult}
              </form>
            )}

            {isIpDeny && (
              <section className="function-field-form">
                <h3>Current Deny List</h3>
                <div className="function-row-list">
                  {ipDenyRows.length ? ipDenyRows.map((row, index) => (
                    <article className="function-row-card ip-deny-row" key={`${row.ipAddress}-${row.subnetMask}-${index}`}>
                      <div>
                        <dt>IP Address</dt>
                        <dd>{row.ipAddress}</dd>
                      </div>
                      <div>
                        <dt>Mask</dt>
                        <dd>{row.subnetMask}</dd>
                      </div>
                      <button
                        className="secondary-button compact danger-button"
                        type="button"
                        disabled={Boolean(busyAction)}
                        onClick={() => onSubmit("remove", { ipAddress: row.ipAddress, subnetMask: row.subnetMask })}
                      >
                        {busyAction === "remove" ? <LoadingIcon label="Removing denied IP" /> : "Delete"}
                      </button>
                    </article>
                  )) : (
                    <p className="empty-state">No denied IP addresses found.</p>
                  )}
                </div>
                <h3>Add Deny IP</h3>
                <label>
                  IP Address
                  <input value={fields.ipAddress ?? ""} onChange={(event) => onChangeField("ipAddress", event.target.value)} placeholder="123.123.123.123" />
                </label>
                <label>
                  Mask
                  <input value={fields.subnetMask ?? "255.255.255.255"} onChange={(event) => onChangeField("subnetMask", event.target.value)} placeholder="255.255.255.255" />
                </label>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="button" disabled={Boolean(busyAction) || !(fields.ipAddress ?? "").trim()} onClick={() => onSubmit("create")}>
                    {busyAction === "create" ? <LoadingIcon label="Adding denied IP" /> : "Add"}
                  </button>
                </div>
                <h3>Dynamic IP Restriction Settings</h3>
                <label className="file-action-checkbox">
                  <input
                    type="checkbox"
                    checked={(fields.denyConcurrent ?? String(dynamicIp.denyConcurrent ?? false)) === "true"}
                    onChange={(event) => onChangeField("denyConcurrent", event.target.checked ? "true" : "false")}
                  />
                  Deny IP Address based on the number of concurrent requests
                </label>
                <label>
                  Maximum number of concurrent requests
                  <input value={fields.maxDenyConcurrentNumber ?? dynamicIp.maxDenyConcurrentNumber ?? "5"} onChange={(event) => onChangeField("maxDenyConcurrentNumber", event.target.value.replace(/\D/g, ""))} />
                </label>
                <label className="file-action-checkbox">
                  <input
                    type="checkbox"
                    checked={(fields.denyOverPeriod ?? String(dynamicIp.denyOverPeriod ?? false)) === "true"}
                    onChange={(event) => onChangeField("denyOverPeriod", event.target.checked ? "true" : "false")}
                  />
                  Deny IP Address based on the number of requests over a period of time
                </label>
                <label>
                  Maximum number of requests
                  <input value={fields.maxDenyNumber ?? dynamicIp.maxDenyNumber ?? "20"} onChange={(event) => onChangeField("maxDenyNumber", event.target.value.replace(/\D/g, ""))} />
                </label>
                <label>
                  Time Period (in milliseconds)
                  <input value={fields.timePeriod ?? dynamicIp.timePeriod ?? "200"} onChange={(event) => onChangeField("timePeriod", event.target.value.replace(/\D/g, ""))} />
                </label>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("dynamicip")}>
                    {busyAction === "dynamicip" ? <LoadingIcon label="Saving dynamic IP restriction settings" /> : "Submit"}
                  </button>
                </div>
                {actionResult}
              </section>
            )}

            {isIisLogManager && (
              <section className="function-field-form">
                <div className="function-tip-box">
                  <p>Copy raw IIS log files into this hosting account so they can be downloaded from File Manager.</p>
                </div>
                <dl className="webdeploy-info-list">
                  <div>
                    <dt>Site Name</dt>
                    <dd>{activeFunction.site?.siteName ?? "Not available"}</dd>
                  </div>
                  <div>
                    <dt>Primary Domain</dt>
                    <dd>{iisLogs.primaryDomain ?? smtpDomainOptions[0]?.value ?? "Not available"}</dd>
                  </div>
                  <div>
                    <dt>Log Folder</dt>
                    <dd>{iisLogs.destination ?? "Not available"}</dd>
                  </div>
                </dl>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("download")}>
                    {busyAction === "download" ? <LoadingIcon label="Copying IIS raw logs" /> : "Download"}
                  </button>
                </div>
                {actionResult}
              </section>
            )}

            {(details.key === "vs-webdeploy" || details.key === "remote-iis-manager") && (
              <section className="function-field-form webdeploy-info-panel">
                <div className="detail-error-status-row">
                  <div>
                    <h3>Visual Studio Web Deploy</h3>
                    <p>Use these settings in your Visual Studio publish profile.</p>
                  </div>
                  <span className={data.webDeploy?.enabled ? "status-pill blue" : "status-pill muted"}>
                    {data.webDeploy?.status ?? "Off"}
                  </span>
                </div>
                <dl className="webdeploy-info-list">
                  <div>
                    <dt>Service URL</dt>
                    <dd>{data.webDeploy?.serviceUrl ?? "Not available"}</dd>
                  </div>
                  <div>
                    <dt>Site Name</dt>
                    <dd>{data.webDeploy?.siteName ?? activeFunction.site?.siteName ?? "Not available"}</dd>
                  </div>
                  <div>
                    <dt>Username</dt>
                    <dd>{data.webDeploy?.username ?? "Not available"}</dd>
                  </div>
                  <div>
                    <dt>Password</dt>
                    <dd>
                      <button className="secondary-button compact" type="button" onClick={() => window.location.href = "/panel?section=settings"}>
                        Modify
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt>Publish Setting XML</dt>
                    <dd>
                      <button className="secondary-button compact" type="button" disabled>
                        Get Publish Setting
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt>KB Article</dt>
                    <dd>
                      <a href="http://www.smarterasp.net/support/kb/a2211/core-to-core-converting-a-framework-dependent-app-to-self-contained-in-visual-studio-2022.aspx" target="_blank" rel="noreferrer">
                        How to publish ASP.NET site?
                      </a>
                    </dd>
                  </div>
                </dl>
                <div className="function-tip-box warning-tip">
                  <p>Restarting the application pool before deploying the site can help prevent file lock issues.</p>
                </div>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("fix-acl")}>
                    {busyAction === "fix-acl" ? <LoadingIcon label="Fixing ACL" /> : "Fix ACL"}
                  </button>
                  <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("enable")}>
                    {busyAction === "enable" ? <LoadingIcon label="Turning on WebDeploy" /> : "Turn On"}
                  </button>
                  <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("disable")}>
                    {busyAction === "disable" ? <LoadingIcon label="Turning off WebDeploy" /> : "Turn Off"}
                  </button>
                </div>
                {actionResult}
              </section>
            )}

            {details.key === "site-on-off" && (
              <section className="function-action-only">
                <div className="function-submit-row">
                  <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("start")}>
                    {busyAction === "start" ? <LoadingIcon label="Starting site" /> : "Start"}
                  </button>
                  <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("stop")}>
                    {busyAction === "stop" ? <LoadingIcon label="Stopping site" /> : "Stop"}
                  </button>
                </div>
                {actionResult}
              </section>
            )}

            {isDefaultDoc && (
              <form className="function-field-form default-doc-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit("update");
              }}>
                <div className="function-tip-box">
                  <p>Default documents are checked from top to bottom when a visitor opens this website without a file name.</p>
                </div>
                <label>
                  Default Documents
                  <textarea
                    value={fields.documents ?? ""}
                    onChange={(event) => onChangeField("documents", event.target.value)}
                    rows={12}
                    spellCheck="false"
                  />
                </label>
                <div className="function-submit-row">
                  <button
                    className="secondary-button compact"
                    type="button"
                    disabled={Boolean(busyAction)}
                    onClick={() => onChangeField("documents", defaultWebsiteFunctionField("documents", activeFunction.site))}
                  >
                    Load Default Setting
                  </button>
                  <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.documents ?? "").trim()}>
                    {busyAction === "update" || busyAction === "save" ? <LoadingIcon label="Saving default documents" /> : "Submit"}
                  </button>
                </div>
                {actionResult}
              </form>
            )}

            {isMimeType && (
              <section className="function-field-form mime-type-panel">
                <h3>Current Mimemap List</h3>
                <div className="mime-map-list">
                  {mimeMaps.length ? mimeMaps.map((row) => {
                    const extension = String(row.extension ?? "");
                    const mimeType = String(row.mimeType ?? "");
                    return (
                      <article className="mime-map-row" key={`${extension}-${mimeType}`}>
                        <div>
                          <dt>File Ext</dt>
                          <dd>{extension}</dd>
                        </div>
                        <div>
                          <dt>MIME Type</dt>
                          <dd>{mimeType}</dd>
                        </div>
                        <button
                          className="secondary-button compact icon-only-button danger-button"
                          type="button"
                          disabled={Boolean(busyAction)}
                          onClick={() => onSubmit("remove", { extension })}
                          aria-label={`Delete ${extension}`}
                          title={`Delete ${extension}`}
                        >
                          {busyAction === "remove" || busyAction === "delete" ? <LoadingIcon label="Deleting MIME map" /> : <MenuIcon name="trash" />}
                        </button>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No MIME maps found.</p>
                  )}
                </div>
                <h3>Create MIME Type</h3>
                <form className="mime-map-create-form" onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit("create");
                }}>
                  <label>
                    File Ext
                    <input
                      value={fields.extension ?? ""}
                      onChange={(event) => onChangeField("extension", event.target.value)}
                      placeholder=".abc"
                    />
                  </label>
                  <label>
                    MIME Type
                    <input
                      value={fields.mimeType ?? ""}
                      onChange={(event) => onChangeField("mimeType", event.target.value)}
                      placeholder="text/html"
                    />
                  </label>
                  <div className="function-submit-row">
                    <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.extension ?? "").trim() || !(fields.mimeType ?? "").trim()}>
                      {busyAction === "create" || busyAction === "add" ? <LoadingIcon label="Adding MIME map" /> : "Add"}
                    </button>
                  </div>
                </form>
                {actionResult}
              </section>
            )}

            {isCustomErrors && (
              <section className="function-field-form custom-errors-panel">
                <h3>Current Custom Error Pages</h3>
                <div className="custom-error-list">
                  {errorPages.length ? errorPages.map((row) => (
                    <article className="custom-error-row" key={row.statusCode}>
                      <strong>{row.statusCode} Error</strong>
                      <span>{row.path}</span>
                    </article>
                  )) : (
                    <p className="empty-state">No custom error rows were returned by IIS.</p>
                  )}
                </div>
                <h3>Update Custom Error</h3>
                <form className="custom-error-form" onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit("update", { errorType: fields.errorType || "401" });
                }}>
                  <label>
                    Error Type
                    <CustomSelect
                      value={fields.errorType || "401"}
                      ariaLabel="Choose error type"
                      onChange={(value) => onChangeField("errorType", value)}
                      options={customErrorOptions}
                    />
                  </label>
                  <label>
                    File Path
                    <span className="custom-error-path-input">
                      <span>{siteRootPath ? `${siteRootPath}\\` : "\\"}</span>
                      <input
                        value={fields.path ?? ""}
                        onChange={(event) => onChangeField("path", event.target.value)}
                        placeholder="404.html"
                      />
                    </span>
                  </label>
                  <div className="function-submit-row">
                    <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.path ?? "").trim()}>
                      {busyAction === "update" ? <LoadingIcon label="Updating custom error page" /> : "Update"}
                    </button>
                    <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("reset", { errorType: fields.errorType || "401", path: fields.path ?? "" })}>
                      {busyAction === "reset" ? <LoadingIcon label="Resetting custom error page" /> : "Reset to Default"}
                    </button>
                  </div>
                </form>
                {actionResult}
              </section>
            )}

            {isScriptMap && (
              <section className="function-field-form script-map-panel">
                <h3>Current ScriptMap List</h3>
                <div className="mime-map-list">
                  {scriptMaps.length ? scriptMaps.map((row) => {
                    const tagName = String(row.tagName ?? "");
                    const extension = String(row.extension ?? "");
                    const processor = String(row.processor ?? "");
                    return (
                      <article className="mime-map-row script-map-row" key={`${tagName}-${extension}`}>
                        <div>
                          <dt>File Ext</dt>
                          <dd>{extension}</dd>
                        </div>
                        <div>
                          <dt>Script Engine</dt>
                          <dd>{processor}</dd>
                        </div>
                        <button
                          className="secondary-button compact icon-only-button danger-button"
                          type="button"
                          disabled={Boolean(busyAction)}
                          onClick={() => onSubmit("remove", { tagName, extension })}
                          aria-label={`Delete ${extension}`}
                          title={`Delete ${extension}`}
                        >
                          {busyAction === "remove" || busyAction === "delete" ? <LoadingIcon label="Deleting ScriptMap" /> : <MenuIcon name="trash" />}
                        </button>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No ScriptMap entries found.</p>
                  )}
                </div>
                <h3>Create ScriptMap</h3>
                <form className="mime-map-create-form" onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit("create");
                }}>
                  <label>
                    File Ext
                    <span className="inline-prefix-input">
                      <span>*.</span>
                      <input
                        value={fields.extension ?? ""}
                        onChange={(event) => onChangeField("extension", event.target.value.replace(/^\.+/, ""))}
                        placeholder="php"
                      />
                    </span>
                  </label>
                  <label>
                    Script Engine
                    <CustomSelect
                      value={fields.scriptTypeIndex || "85"}
                      ariaLabel="Choose script engine"
                      onChange={(value) => onChangeField("scriptTypeIndex", value)}
                      options={scriptMapOptions}
                    />
                  </label>
                  <div className="function-submit-row">
                    <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.extension ?? "").trim()}>
                      {busyAction === "create" || busyAction === "add" ? <LoadingIcon label="Adding ScriptMap" /> : "Add"}
                    </button>
                  </div>
                </form>
                {actionResult}
              </section>
            )}

            {isForceHttps && (
              <section className="function-field-form force-https-panel">
                <h3>Current Redirect Rules</h3>
                <div className="function-row-list">
                  {redirectRows.length ? redirectRows.map((row) => {
                    const ruleName = String(row.id ?? row.rulename ?? row.ruleName ?? "");
                    const domain = String(row.title ?? row.domain ?? "");
                    const destination = String(row.status ?? row.destination ?? "");
                    return (
                      <article className="function-row-card force-https-row" key={`${ruleName}-${domain}`}>
                        <div>
                          <dt>Rule Name</dt>
                          <dd>{ruleName || "httpTohttps"}</dd>
                        </div>
                        <div>
                          <dt>Domain</dt>
                          <dd>{domain}</dd>
                        </div>
                        <div>
                          <dt>Redirect To</dt>
                          <dd>{destination}</dd>
                        </div>
                        <button
                          className="secondary-button compact icon-only-button danger-button"
                          type="button"
                          disabled={Boolean(busyAction)}
                          onClick={() => onSubmit("delete", { ruleName: ruleName || "httpTohttps" })}
                          aria-label={`Delete ${ruleName || "redirect rule"}`}
                          title={`Delete ${ruleName || "redirect rule"}`}
                        >
                          {busyAction === "delete" || busyAction === "remove" ? <LoadingIcon label="Removing redirect rule" /> : <MenuIcon name="trash" />}
                        </button>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No redirect rules found.</p>
                  )}
                </div>
                <div className="function-tip-box warning-tip">
                  <p>Only enable this setting once your site is already running securely over HTTPS.</p>
                </div>
                <div className="function-submit-row">
                  <button
                    className="primary-button compact"
                    type="button"
                    disabled={Boolean(busyAction)}
                    onClick={() => onSubmit("create", { ruleName: "httpTohttps", fromDomain: "http", toDomain: "https" })}
                  >
                    {busyAction === "create" || busyAction === "enable" ? <LoadingIcon label="Creating HTTPS redirect" /> : "1-Click Force HTTPS"}
                  </button>
                </div>
                {actionResult}
              </section>
            )}

            {isSiteGuard && (
              <section className="function-field-form site-guard-panel">
                <div className="function-tip-box warning-tip">
                  <p>This free protection helps block common attacks and exploits. Test your site after turning it on.</p>
                </div>
                <div className="detail-error-status-row">
                  <div>
                    <h3>Current Status</h3>
                    <p>{activeFunction.site?.siteName ?? "Website"}</p>
                  </div>
                  <span className={siteGuardEnabled ? "status-pill blue" : "status-pill muted"}>
                    {siteGuardEnabled ? "ON" : "OFF"}
                  </span>
                </div>
                <div className="function-submit-row">
                  <button className="primary-button compact" type="button" disabled={Boolean(busyAction) || siteGuardEnabled} onClick={() => onSubmit("enable", { enabled: "true" })}>
                    {busyAction === "enable" ? <LoadingIcon label="Turning Site Guard on" /> : "Turn On"}
                  </button>
                  <button className="secondary-button compact" type="button" disabled={Boolean(busyAction) || !siteGuardEnabled} onClick={() => onSubmit("disable", { enabled: "false" })}>
                    {busyAction === "disable" ? <LoadingIcon label="Turning Site Guard off" /> : "Turn Off"}
                  </button>
                </div>
                {actionResult}
              </section>
            )}

            {isOutgoingPort && (
              <section className="function-field-form outgoing-port-panel">
                <h3>Current Enabled Port List</h3>
                <div className="function-row-list">
                  {outgoingPorts.length ? outgoingPorts.map((row) => {
                    const ipid = String(row.ipid ?? row.id ?? "");
                    const ip = String(row.remoteip ?? row.ip ?? "");
                    const port = String(row.port ?? "");
                    return (
                      <article className="function-row-card force-https-row" key={`${ipid}-${ip}-${port}`}>
                        <div>
                          <dt>Server IP</dt>
                          <dd>{ip}</dd>
                        </div>
                        <div>
                          <dt>Server Port</dt>
                          <dd>{port}</dd>
                        </div>
                        <div>
                          <dt>Add Date</dt>
                          <dd>{formatFunctionValue(row.adddate)}</dd>
                        </div>
                        <button
                          className="secondary-button compact icon-only-button danger-button"
                          type="button"
                          disabled={Boolean(busyAction)}
                          onClick={() => onSubmit("delete", { ipid, ip, port, rulename: row.rulename ?? "" })}
                          aria-label={`Delete ${ip}:${port}`}
                          title={`Delete ${ip}:${port}`}
                        >
                          {busyAction === "delete" || busyAction === "remove" ? <LoadingIcon label="Deleting outgoing port rule" /> : <MenuIcon name="trash" />}
                        </button>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No outgoing port rules found.</p>
                  )}
                </div>
                <h3>Add</h3>
                <form className="mime-map-create-form" onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit("add");
                }}>
                  <label>
                    Server IP
                    <input value={fields.ip ?? ""} onChange={(event) => onChangeField("ip", event.target.value)} placeholder="123.123.123.123" />
                  </label>
                  <label>
                    Port
                    <input value={fields.port ?? "1433"} onChange={(event) => onChangeField("port", event.target.value.replace(/\D/g, ""))} placeholder="1433" />
                  </label>
                  <div className="function-submit-row">
                    <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.ip ?? "").trim() || !(fields.port ?? "").trim()}>
                      {busyAction === "add" ? <LoadingIcon label="Adding outgoing port rule" /> : "Submit"}
                    </button>
                  </div>
                </form>
                {actionResult}
              </section>
            )}

            {isCreateNetApp && (
              <section className="function-field-form create-net-app-panel">
                <h3>ASP.NET Applications</h3>
                <div className="function-row-list">
                  {iisApps.length ? iisApps.map((row) => {
                    const appPath = String(row.appPath ?? "");
                    return (
                      <article className="function-row-card app-path-row" key={appPath}>
                        <div>
                          <dt>Application</dt>
                          <dd>{appPath}</dd>
                        </div>
                        <button
                          className="secondary-button compact icon-only-button danger-button"
                          type="button"
                          disabled={Boolean(busyAction)}
                          onClick={() => onSubmit("delete", { appPath })}
                          aria-label={`Delete ${appPath}`}
                          title={`Delete ${appPath}`}
                        >
                          {busyAction === "delete" || busyAction === "remove" ? <LoadingIcon label="Deleting ASP.NET application" /> : <MenuIcon name="trash" />}
                        </button>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No ASP.NET applications found.</p>
                  )}
                </div>
                <h3>Create ASP.NET Application</h3>
                <form className="mime-map-create-form" onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit("create");
                }}>
                  <label>
                    Application Path
                    <input
                      value={fields.appPath ?? ""}
                      onChange={(event) => onChangeField("appPath", event.target.value)}
                      placeholder="app"
                    />
                  </label>
                  <label>
                    ASP.NET Version
                    <CustomSelect
                      value={fields.version || "4.x"}
                      ariaLabel="Choose ASP.NET version"
                      onChange={(value) => onChangeField("version", value)}
                      options={[
                        { value: "4.x", label: "ASP.NET 4.x" },
                        { value: "2/3.5", label: "ASP.NET 2.0 / 3.5" }
                      ]}
                    />
                  </label>
                  <div className="function-submit-row">
                    <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.appPath ?? "").trim()}>
                      {busyAction === "create" || busyAction === "add" ? <LoadingIcon label="Creating ASP.NET application" /> : "Create"}
                    </button>
                  </div>
                </form>
                {actionResult}
              </section>
            )}

            {isVirtualDir && (
              <section className="function-field-form virtual-dir-panel">
                <h3>Virtual Directories</h3>
                <div className="function-row-list">
                  {virtualDirs.length ? virtualDirs.map((row) => {
                    const name = String(row.name ?? "");
                    return (
                      <article className="function-row-card force-https-row" key={name}>
                        <div>
                          <dt>Virtual Dir</dt>
                          <dd>{name}</dd>
                        </div>
                        <div>
                          <dt>Path</dt>
                          <dd>{row.path}</dd>
                        </div>
                        <div />
                        <button
                          className="secondary-button compact icon-only-button danger-button"
                          type="button"
                          disabled={Boolean(busyAction)}
                          onClick={() => onSubmit("delete", { vdirname: name, virtualPath: name })}
                          aria-label={`Delete ${name}`}
                          title={`Delete ${name}`}
                        >
                          {busyAction === "delete" || busyAction === "remove" ? <LoadingIcon label="Deleting virtual directory" /> : <MenuIcon name="trash" />}
                        </button>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No virtual directories found.</p>
                  )}
                </div>
                <h3>Create Virtual Directory</h3>
                <form className="function-field-form" onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit("create", { vdirname: fields.vdirname ?? fields.virtualPath ?? "", physicalPath: fields.physicalPath ?? "" });
                }}>
                  <label>
                    Virtual Dir Name
                    <input value={fields.vdirname ?? fields.virtualPath ?? ""} onChange={(event) => {
                      onChangeField("vdirname", event.target.value);
                      onChangeField("virtualPath", event.target.value);
                    }} placeholder="assets" />
                  </label>
                  <label>
                    Virtual Path
                    <span className="ftp-path-control">
                      <input value={fields.physicalPath ?? ""} readOnly placeholder="Select a folder" />
                      <button className="secondary-button compact icon-only-button" type="button" onClick={onOpenFolderPicker} title="Select folder" aria-label="Select folder">
                        <MenuIcon name="folder" />
                      </button>
                    </span>
                  </label>
                  <label className="file-action-checkbox">
                    <input
                      type="checkbox"
                      checked={(fields.isapp ?? "false") === "true"}
                      onChange={(event) => onChangeField("isapp", event.target.checked ? "true" : "false")}
                    />
                    Set as IIS application
                  </label>
                  <div className="function-submit-row">
                    <button className="primary-button compact" type="submit" disabled={Boolean(busyAction) || !(fields.vdirname ?? fields.virtualPath ?? "").trim() || !(fields.physicalPath ?? "").trim()}>
                      {busyAction === "create" || busyAction === "add" ? <LoadingIcon label="Creating virtual directory" /> : "Create"}
                    </button>
                  </div>
                </form>
                {actionResult}
              </section>
            )}

            {!!details.fields?.length && details.key !== "site-on-off" && !isDetailError && !isDomainManager && !isDeleteWebsite && !isCoreMode && !isNodeJsApp && !isPhpVersion && !isPhpSettings && !isVisitorStats && !isFtpAccess && !isSmtpSampleCode && !isIpDeny && !isIisLogManager && !isDefaultDoc && !isMimeType && !isScriptMap && !isCustomErrors && !isForceHttps && !isSiteGuard && !isOutgoingPort && !isCreateNetApp && !isVirtualDir && details.key !== "vs-webdeploy" && details.key !== "remote-iis-manager" && (
              <form className="function-field-form" onSubmit={(event) => {
                event.preventDefault();
                onSubmit(fields.action || defaultWebsiteFunctionAction(details.key));
              }}>
                <h3>Action Fields</h3>
                {details.fields.map((field) => (
                  <label key={field}>
                    {humanizeFunctionField(field)}
                    {isMappedPath && field === "target" ? (
                      <span className="ftp-path-control">
                        <input
                          value={fields[field] ?? ""}
                          readOnly
                          placeholder={humanizeFunctionField(field)}
                        />
                        <button className="secondary-button compact icon-only-button" type="button" onClick={onOpenFolderPicker} title="Select folder" aria-label="Select folder">
                          <MenuIcon name="folder" />
                        </button>
                      </span>
                    ) : (
                      <input
                        value={fields[field] ?? ""}
                        onChange={(event) => onChangeField(field, event.target.value)}
                        placeholder={humanizeFunctionField(field)}
                      />
                    )}
                  </label>
                ))}
                <div className="function-submit-row">
                  {details.key === "outgoing-port" ? (
                    <>
                      <button className="primary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("add")}>{busyAction === "add" ? <LoadingIcon label="Adding rule" /> : "Add Rule"}</button>
                      <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("delete")}>{busyAction === "delete" ? <LoadingIcon label="Removing rule" /> : "Remove Rule"}</button>
                    </>
                  ) : details.key === "vs-webdeploy" || details.key === "remote-iis-manager" ? (
                    <>
                      <button className="primary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("fix-acl")}>{busyAction === "fix-acl" ? <LoadingIcon label="Fixing ACL" /> : "Fix ACL"}</button>
                      <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("enable")}>{busyAction === "enable" ? <LoadingIcon label="Turning on" /> : "Turn On"}</button>
                      <button className="secondary-button compact" type="button" disabled={Boolean(busyAction)} onClick={() => onSubmit("disable")}>{busyAction === "disable" ? <LoadingIcon label="Turning off" /> : "Turn Off"}</button>
                    </>
                  ) : details.supportsWrite ? (
                    <button className="primary-button compact" type="submit" disabled={Boolean(busyAction)}>
                      {busyAction ? <LoadingIcon label={isMappedPath ? "Saving mapped path" : "Running function"} /> : isMappedPath ? "Save" : "Run Function"}
                    </button>
                  ) : (
                    <span className="status-pill muted">Read only</span>
                  )}
                </div>
                {actionResult}
              </form>
            )}
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
  if (field === "hostingModel") return "OutOfProcess";
  if (field === "applyAll") return "true";
  if (field === "mode") return "httpPlatformHandler";
  if (field === "startupfile" || field === "entryPoint") return "";
  if (field === "phpversion" || field === "phpVersion") return site?.phpVersion === "8.5.x" ? "85" : site?.phpVersion === "8.3.x" ? "83" : site?.phpVersion === "8.2.x" ? "82" : site?.phpVersion === "8.1.x" ? "14" : site?.phpVersion === "8.0.x" ? "13" : site?.phpVersion === "7.4.x" ? "12" : site?.phpVersion === "7.3.x" ? "11" : site?.phpVersion === "7.2.x" ? "10" : site?.phpVersion === "7.0.x" ? "9" : site?.phpVersion === "5.6.x" ? "8" : site?.phpVersion === "5.5.x" ? "4" : site?.phpVersion === "5.4.x" ? "3" : site?.phpVersion === "5.2.x" ? "1" : "85";
  if (field === "phpsettings" || field === "settings") return "";
  if (field === "confirmDelete" || field === "deleteFiles") return "false";
  if (field === "action") return "save";
  if (field === "permission") return "write";
  if (field === "password") return "";
  if (field === "appPath") return "/codex-test-app";
  if (field === "virtualPath") return "codex-test-vdir";
  if (field === "extension") return "";
  if (field === "processor") return "1";
  if (field === "mimeType") return "";
  if (field === "documents") return "index.aspx\r\nindex.php\r\nindex.asp\r\nDefault.htm\r\nDefault.asp\r\nindex.htm\r\nindex.html\r\niisstart.htm\r\ndefault.aspx";
  if (field === "statusCode") return "404";
  return "";
}

function formatWebsiteRelativePath(path) {
  const normalized = String(path ?? "").replaceAll("\\", "/");
  const marker = "/www/";
  const index = normalized.toLowerCase().indexOf(marker);
  if (index >= 0) {
    return `/${normalized.slice(index + marker.length).replace(/^\/+/, "")}`.replace(/\/$/, "") || "/";
  }

  return normalized || "/";
}

function defaultWebsiteFunctionAction(key) {
  return {
    "create-net-app": "create",
    "virtual-dir": "create",
    "mime-type": "add",
    "script-map": "add",
    "outgoing-port": "add",
    "schedule-tasks": "create",
    "visitor-stats": "enable",
    "site-guard": "enable",
    "force-https": "enable"
  }[key] ?? "save";
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

function DatabasesSection({ cpId, engine = "All" }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [databaseDashboard, setDatabaseDashboard] = useState(null);
  const [activeEngine, setActiveEngine] = useState(engine);
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

  useEffect(() => {
    setActiveEngine(engine);
    if (engine !== "All") {
      setNewDatabaseDraft((draft) => ({ ...draft, engine }));
    }
  }, [engine]);

  const databases = databaseDashboard?.databases ?? [];
  const visibleDatabases = activeEngine === "All"
    ? databases
    : databases.filter((database) => database.engine === activeEngine);
  const [viewMode, setViewMode] = useSectionViewMode("cp-databases", visibleDatabases.length);
  const totals = databaseDashboard?.totals ?? { total: 0, mssql: 0, mysql: 0 };
  const isEngineLocked = engine !== "All";
  const pageTitle = activeEngine === "MSSQL" ? "MSSQL Manager" : activeEngine === "MySQL" ? "MySQL Manager" : "Database Manager";
  const pageDescription = activeEngine === "MSSQL"
    ? "MSSQL database inventory and actions from the hosting control panel."
    : activeEngine === "MySQL"
      ? "MySQL database inventory and actions from the hosting control panel."
      : "Unified MSSQL and MySQL inventory from the hosting control panel.";
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
      setDatabaseMessage(`${action} needs the database service gateway before it can run.`);
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
      setDatabaseMessage("Run SQL File is available for MSSQL worker jobs. MySQL import is not enabled yet.");
      return;
    }

    if (sqlDraft.action !== "Run SQL File") {
      setDatabaseMessage(`${sqlDraft.action} is not enabled for worker jobs yet.`);
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
          <h2>{pageTitle}</h2>
          <p>{pageDescription}</p>
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
          <button className="primary-button compact" type="button" onClick={() => setDatabaseMessage("Create Database form is ready below. Fill in the database details and submit.")}>+ Database</button>
          <button className="secondary-button compact" type="button" onClick={() => setDatabaseMessage("Database quota changes are handled through Add-On purchases and product quota mapping. Use Account Panel > Add-On for extra database quota.")}>+ Quota</button>
          <button className="secondary-button compact" type="button" onClick={() => setDatabaseMessage("Automated Backups form is ready above. Choose a database, hour, and retention window.")}>+ Advanced Backup</button>
          <button className="secondary-button compact" type="button" onClick={() => setDatabaseMessage("Run SQL form is ready below. Choose an MSSQL database and SQL file path.")}>Run SQL File</button>
          <button className="secondary-button compact" type="button" onClick={loadDeletedDatabases}>Deleted DBs</button>
        </div>
        {!isEngineLocked && (
          <div className="engine-tabs" aria-label="Database engine filter">
            {["All", "MSSQL", "MySQL"].map((engineName) => (
              <button
                className={activeEngine === engineName ? "active" : ""}
                type="button"
                key={engineName}
                onClick={() => setActiveEngine(engineName)}
              >
                {engineName}
              </button>
            ))}
          </div>
        )}
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label="Database view mode" />
      </div>

      {!!visibleDatabases.length && (
        <article className="panel-card database-schedule-card">
          <div>
            <span className="status-pill blue">Scheduled database backups</span>
            <h3>Automated Backups</h3>
            <p>Enable a custom database backup schedule for a selected MSSQL or MySQL database.</p>
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
            <p>Creates a database with the correct account prefix, login, quota, and server assignment.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitNewDatabaseDraft}>
            <label>
              Engine
              <select disabled={isEngineLocked} value={newDatabaseDraft.engine} onChange={(event) => setNewDatabaseDraft((draft) => ({ ...draft, engine: event.target.value }))}>
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
            <p>Queues backup, restore, and compatible database worker jobs.</p>
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
            <p>Queues an MSSQL file execution job for the selected database.</p>
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
              <p>Recoverable deleted database rows from the seven-day recovery window.</p>
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
                      setDatabaseMessage(database.engine === "MSSQL" ? "Use Run SQL to queue a SQL file for this database." : "MySQL import is not enabled yet.");
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
                        setDatabaseMessage(database.engine === "MSSQL" ? "Use Run SQL to queue a SQL file for this database." : "MySQL import is not enabled yet.");
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

function AdvancedCustomerBackupSection({ cpId }) {
  const [databaseDashboard, setDatabaseDashboard] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [draft, setDraft] = useState({ databaseKey: "", hour: "5", retentionDays: "7" });
  const [editingScheduleId, setEditingScheduleId] = useState(0);
  const [editingRetention, setEditingRetention] = useState("7");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBackupPage() {
    setIsLoading(true);
    setError("");
    try {
      const [databasesResponse, schedulesResponse] = await Promise.all([
        fetch(hostingApiUrl("/api/hosting/databases", cpId)),
        fetch(hostingApiUrl("/api/hosting/databases/backup-schedules", cpId))
      ]);
      const databasesResult = await databasesResponse.json().catch(() => null);
      const schedulesResult = await schedulesResponse.json().catch(() => null);
      if (!databasesResponse.ok || !databasesResult?.success) {
        throw new Error(databasesResult?.message ?? "Unable to load databases.");
      }
      if (!schedulesResponse.ok || !schedulesResult?.success) {
        throw new Error(schedulesResult?.message ?? "Unable to load backup schedules.");
      }

      setDatabaseDashboard(databasesResult.dashboard);
      setSchedules(schedulesResult.schedules ?? []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBackupPage();
  }, [cpId]);

  const databases = databaseDashboard?.databases ?? [];
  const databaseOptions = databases.map((database) => ({
    value: `${database.engine}:${database.databaseId}`,
    label: `${database.name} (${database.engine})`
  }));
  const selectedDatabase = databases.find((database) => `${database.engine}:${database.databaseId}` === (draft.databaseKey || databaseOptions[0]?.value));

  async function createBackupSchedule(event) {
    event.preventDefault();
    setMessage("");
    if (!selectedDatabase) {
      setMessage("Choose a database before enabling automated backup.");
      return;
    }

    const hour = Math.max(0, Math.min(23, Number(draft.hour) || 0));
    const retentionDays = Math.max(1, Math.min(7, Number(draft.retentionDays) || 7));
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/databases/${encodeURIComponent(selectedDatabase.engine)}/${selectedDatabase.databaseId}/backup-schedules`, cpId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId, hour, retentionDays })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to enable automated backup.");
      }

      setMessage(result.message);
      await loadBackupPage();
    } catch (actionError) {
      setMessage(actionError.message);
    }
  }

  async function updateCleanupDays(schedule) {
    setMessage("");
    const retentionDays = Math.max(1, Math.min(7, Number(editingRetention) || 7));
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/databases/backup-schedules/${schedule.id}`, cpId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId, hour: schedule.hour, retentionDays })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to change cleanup days.");
      }

      setMessage(result.message);
      setEditingScheduleId(0);
      await loadBackupPage();
    } catch (actionError) {
      setMessage(actionError.message);
    }
  }

  async function disableBackupSchedule(schedule) {
    setMessage("");
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/databases/backup-schedules/${schedule.id}`, cpId), {
        method: "DELETE"
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to disable automated backup.");
      }

      setMessage(result.message);
      await loadBackupPage();
    } catch (actionError) {
      setMessage(actionError.message);
    }
  }

  return (
    <section className="databases-section">
      <article className="panel-card database-summary-card">
        <div>
          <h2>Advance Customer Backup</h2>
          <p>Daily automated MSSQL and MySQL database backups. Backup destination: /db.</p>
        </div>
        <RefreshButton onClick={loadBackupPage} />
      </article>

      <article className="panel-card database-schedule-card">
        <div>
          <h3>Create Custom DB Backup</h3>
          <p>Choose a database, backup hour, and cleanup window.</p>
        </div>
        <form className="advance-inline-form backup-create-form" onSubmit={createBackupSchedule}>
          <label>
            Database
            <CustomSelect
              ariaLabel="Choose database"
              value={draft.databaseKey || databaseOptions[0]?.value || ""}
              options={databaseOptions}
              disabled={!databaseOptions.length}
              onChange={(value) => setDraft((current) => ({ ...current, databaseKey: value }))}
            />
          </label>
          <label>
            Backup Hour
            <input type="number" min="0" max="23" value={draft.hour} onChange={(event) => setDraft((current) => ({ ...current, hour: event.target.value }))} />
            <small>0 - 23, PST time</small>
          </label>
          <label>
            Maximum Backups
            <input type="number" min="1" max="7" value={draft.retentionDays} onChange={(event) => setDraft((current) => ({ ...current, retentionDays: event.target.value }))} />
            <small>Cleanup days, 1 - 7</small>
          </label>
          <button className="primary-button compact" type="submit" disabled={!databaseOptions.length}>+ Create</button>
        </form>
      </article>

      {isLoading && <LoadingState label="Loading backup schedules" />}
      {message && <p className="sandbox-message">{message}</p>}
      {error && (
        <div className="panel-card dashboard-error-panel">
          <p>{error}</p>
          <IconActionButton label="Retry" onClick={loadBackupPage} />
        </div>
      )}

      {!isLoading && !error && (
        <div className="table-wrap website-table solid-table">
          <table>
            <thead>
              <tr>
                <th>Database Name</th>
                <th>Backup Hour</th>
                <th>Last Run Time</th>
                <th>Last Result</th>
                <th>Cleanup Days</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!schedules.length && (
                <tr>
                  <td colSpan={6}>No custom database backups found.</td>
                </tr>
              )}
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.name}</td>
                  <td>{schedule.hour}:00 PST</td>
                  <td>{formatDate(schedule.createdAt)}</td>
                  <td>{schedule.enabled ? "Enabled" : "Disabled"}</td>
                  <td>
                    {editingScheduleId === schedule.id ? (
                      <div className="inline-edit-row">
                        <input type="number" min="1" max="7" value={editingRetention} onChange={(event) => setEditingRetention(event.target.value)} />
                        <IconActionButton label="Save" icon="save" onClick={() => updateCleanupDays(schedule)} />
                      </div>
                    ) : (
                      <span className="inline-edit-row">
                        {schedule.retentionDays}
                        <IconActionButton label="Edit cleanup days" icon="edit" onClick={() => {
                          setEditingScheduleId(schedule.id);
                          setEditingRetention(String(schedule.retentionDays || 7));
                        }} />
                      </span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <IconActionButton label="Disable" icon="delete" onClick={() => disableBackupSchedule(schedule)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SqlReportingSection({ cpId }) {
  const [dashboard, setDashboard] = useState(null);
  const [draft, setDraft] = useState({ username: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSqlReporting() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/databases/mssql-report-users", cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to load MSSQL Reporting Service.");
      }

      setDashboard(result.dashboard);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSqlReporting();
  }, [cpId]);

  const serverId = String(dashboard?.serverId || "").replace(/\.site4now\.net$/i, "");
  const portalHost = serverId ? `${serverId}.site4now.net` : "";
  const webPortal = portalHost && dashboard?.cpLogin
    ? `https://${portalHost}/Reports/Pages/Folder.aspx?ItemPath=/${dashboard.cpLogin}`
    : "";
  const targetServerUrl = portalHost ? `https://${portalHost}/ReportServer` : "";
  const kbHost = "www.smarterasp.net";

  async function runReportUserAction(method, url, body = null) {
    setMessage("");
    try {
      const response = await fetch(hostingApiUrl(url, cpId), {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify({ cpId, ...body }) : undefined
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "Unable to update MSSQL Reporting Service user.");
      }

      setMessage(result.message);
      setDraft({ username: "", password: "", confirmPassword: "" });
      await loadSqlReporting();
    } catch (actionError) {
      setMessage(actionError.message);
    }
  }

  function addReportUser(event) {
    event.preventDefault();
    if (!draft.username.trim() || !draft.password) {
      setMessage("Username and password are required.");
      return;
    }
    if (draft.password !== draft.confirmPassword) {
      setMessage("Confirm password does not match.");
      return;
    }
    runReportUserAction("POST", "/api/hosting/databases/mssql-report-users", {
      username: draft.username.trim(),
      password: draft.password
    });
  }

  return (
    <section className="databases-section">
      <article className="panel-card database-summary-card">
        <div>
          <h2>MSSQL Reporting Service</h2>
          <p>{dashboard?.enabled ? "Reporting Service is enabled for this hosting plan." : "Reporting Service is not enabled for this hosting plan."}</p>
        </div>
        <div className="database-actions">
          <a className="primary-button compact" href="/account/addon_purchase_special?cat=SSRS">+ Order Reporting Service</a>
          <RefreshButton onClick={loadSqlReporting} />
        </div>
      </article>

      {isLoading && <LoadingState label="Loading MSSQL Reporting Service" />}
      {message && <p className="sandbox-message">{message}</p>}
      {error && (
        <div className="panel-card dashboard-error-panel">
          <p>{error}</p>
          <IconActionButton label="Retry" onClick={loadSqlReporting} />
        </div>
      )}

      {!isLoading && !error && (
        <>
          <article className="panel-card report-info-card">
            <div>
              <span className={dashboard?.enabled ? "status-pill" : "status-pill muted"}>{dashboard?.enabled ? "Enabled" : "Not enabled"}</span>
              <h3>Reporting Service Info</h3>
            </div>
            {dashboard?.enabled ? (
              <dl className="connection-snippet-list">
                <div><dt>Web Portal</dt><dd><a href={webPortal} target="_blank" rel="noreferrer">{webPortal}</a></dd></div>
                <div><dt>TargetServerURL</dt><dd>{targetServerUrl}</dd></div>
                <div><dt>Primary User</dt><dd>{dashboard.cpLogin}</dd></div>
                <div><dt>Users</dt><dd>{dashboard.userCount} / {dashboard.userQuota}</dd></div>
              </dl>
            ) : (
              <p className="empty-state">Order Reporting Service before enabling report users.</p>
            )}
          </article>

          <article className="panel-card report-info-card">
            <div>
              <h3>MSSQL Reporting Service Users</h3>
              <p>You will still need to assign report roles from the report web portal.</p>
            </div>
            <div className="table-wrap website-table solid-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Password Stored</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard?.users?.map((user) => (
                    <tr key={user.username}>
                      <td>{user.username}</td>
                      <td>{user.hasPassword ? "Yes" : "No"}</td>
                      <td className="actions-cell">
                        {!user.isPrimaryUser && (
                          <IconActionButton
                            label="Delete"
                            icon="delete"
                            onClick={() => runReportUserAction("DELETE", `/api/hosting/databases/mssql-report-users/${encodeURIComponent(user.username)}`)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                  {!dashboard?.users?.length && (
                    <tr><td colSpan={3}>No Reporting Service users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <form className="advance-inline-form report-user-form" onSubmit={addReportUser}>
              <label>
                Username
                <input value={draft.username} onChange={(event) => setDraft((current) => ({ ...current, username: event.target.value }))} />
              </label>
              <label>
                Password
                <input type="password" value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} />
              </label>
              <label>
                Confirm Password
                <input type="password" value={draft.confirmPassword} onChange={(event) => setDraft((current) => ({ ...current, confirmPassword: event.target.value }))} />
              </label>
              <button className="primary-button compact" type="submit">Add User</button>
            </form>
          </article>

          <article className="panel-card kb-card">
            <a href={`http://${kbHost}/support/kb/a388/how-to-publish-reports-to-reporting-server-via-visual-studio-2012.aspx`} target="_blank" rel="noreferrer"><span className="status-pill muted">KB Article</span> How to Publish Reports Using Visual Studio</a>
            <a href={`http://${kbHost}/support/kb/a428/how-to-create-data-source-via-report-managerssrs.aspx`} target="_blank" rel="noreferrer"><span className="status-pill muted">KB Article</span> How to Create Data Source</a>
            <a href={`http://${kbHost}/support/kb/a1705/how-to-integrate-ssrs-into-asp_net.aspx`} target="_blank" rel="noreferrer"><span className="status-pill muted">KB Article</span> How to Integrate SSRS into ASP.NET</a>
          </article>
        </>
      )}
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

function EmailsSection({ cpId, mode = "all" }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [emailDashboard, setEmailDashboard] = useState(null);
  const fixedType = mode === "hosted" ? "Hosted Email" : mode === "corporate" ? "Corporate Email" : "All";
  const [activeType, setActiveType] = useState(fixedType);
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

  useEffect(() => {
    setActiveType(fixedType);
    setEmailDomainDraft((draft) => ({ ...draft, type: fixedType === "All" ? draft.type : fixedType }));
  }, [fixedType]);

  const domains = emailDashboard?.domains ?? [];
  const visibleDomains = activeType === "All" ? domains : domains.filter((domain) => domain.type === activeType);
  const [viewMode, setViewMode] = useSectionViewMode("cp-emails", visibleDomains.length);
  const totals = emailDashboard?.totals ?? { total: 0, hosted: 0, corporate: 0, dailyLimits: 0 };
  const primaryDomain = visibleDomains[0] ?? domains[0] ?? null;
  const mailSetupRows = buildMailSetupRows(primaryDomain);
  const pageTitle = fixedType === "Corporate Email" ? "Corporate Email" : fixedType === "Hosted Email" ? "Email Manager" : "Email Manager";
  const pageDescription = fixedType === "Corporate Email"
    ? "Corporate Email is designed for users with heavy space requirements."
    : fixedType === "Hosted Email"
      ? "Manage hosted email domains, mailbox access, quotas, and mail setup."
      : "Hosted email and corporate email domains from the hosting control panel.";
  const pageDomainCount = fixedType === "Corporate Email" ? totals.corporate : fixedType === "Hosted Email" ? totals.hosted : totals.total;
  const orderButton = fixedType === "Corporate Email"
    ? { href: "/account/addon_purchase_special?cat=corpemail", label: "+ Order Corporate Email" }
    : { href: "/account/addon_purchase_special?cat=email", label: "+ Order Email" };
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
    if (!window.confirm(`Delete email domain ${domain.domain}? This removes the mail service domain and its hosted email record.`)) return;
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
          <h2>{pageTitle}</h2>
          <p>{pageDescription}</p>
        </div>
        <div className="database-total-grid">
          <div><span>Email Domains</span><strong>{pageDomainCount}</strong></div>
          {fixedType === "All" && <div><span>Hosted</span><strong>{totals.hosted}</strong></div>}
          {fixedType === "All" && <div><span>Corporate</span><strong>{totals.corporate}</strong></div>}
          <div><span>Daily Limits</span><strong>{totals.dailyLimits}</strong></div>
        </div>
        <RefreshButton onClick={refreshEmailSection} />
      </article>

      <div className="database-toolbar panel-card">
        <div className="database-actions">
          <button className="primary-button compact" type="button" onClick={() => setEmailMessage(`${pageTitle} activation form is ready below.`)}>+ Email Domain</button>
          {fixedType !== "Hosted Email" && <a className="secondary-button compact" href={orderButton.href}>{orderButton.label}</a>}
          <button className="secondary-button compact" type="button" onClick={() => setEmailMessage("Mailbox draft is ready below. Choose a domain, mailbox name, quota, and mailbox action.")}>+ Mailbox</button>
          <button className="secondary-button compact" type="button" onClick={() => setEmailMessage("Daily Send Limit uses cp_config_DailySentLimit. Purchase and active-user flows still need the exact masssmtp action ported before write.")}>Daily Send Limit</button>
          <button className="secondary-button compact" type="button" onClick={() => primaryDomain ? handleEmailDomainAction("DNS", primaryDomain) : setEmailMessage("No email domain selected.")}>DNS Records</button>
          <button className="secondary-button compact" type="button" onClick={() => primaryDomain ? handleEmailDomainAction("Webmail", primaryDomain) : setEmailMessage("No email domain selected.")}>Webmail Login</button>
          <button className="secondary-button compact" type="button" onClick={() => setEmailMessage("DKIM values are shown in Mail Setup when present. The SmarterMail DKIM generation SOAP action still needs exact template mapping before write.")}>DKIM Setup</button>
        </div>
        {fixedType === "All" && <div className="engine-tabs" aria-label="Email type filter">
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
        </div>}
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
            <h3>{fixedType === "Corporate Email" ? "Activate Corporate Email" : "Activate Email"}</h3>
            <p>Choose an owned domain and assign email space before activation.</p>
          </div>
          <form className="advance-inline-form" onSubmit={submitEmailDomainDraft}>
            <label>
              Domain
              <input value={emailDomainDraft.domain} onChange={(event) => setEmailDomainDraft((draft) => ({ ...draft, domain: event.target.value }))} />
            </label>
            <label>
              Type
              <CustomSelect
                ariaLabel="Choose email type"
                value={emailDomainDraft.type}
                options={(fixedType === "All" ? ["Hosted Email", "Corporate Email"] : [fixedType]).map((value) => ({ value, label: value }))}
                onChange={(value) => setEmailDomainDraft((draft) => ({ ...draft, type: value }))}
              />
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
  const [ftpDashboard, setFtpDashboard] = useState(null);
  const [isLoadingFtp, setIsLoadingFtp] = useState(true);
  const [ftpError, setFtpError] = useState("");
  const [ftpMessage, setFtpMessage] = useState("");
  const [ftpDraft, setFtpDraft] = useState({ login: "codex-test-ftp", password: "CodexFtp123!", confirmPassword: "CodexFtp123!", path: "/" });
  const [isFtpCreateOpen, setIsFtpCreateOpen] = useState(false);
  const [isFtpMutating, setIsFtpMutating] = useState(false);
  const [isFtpFolderPickerOpen, setIsFtpFolderPickerOpen] = useState(false);
  const [isLoadingFtpFolders, setIsLoadingFtpFolders] = useState(false);
  const [ftpFolderPicker, setFtpFolderPicker] = useState(null);
  const [ftpFolderError, setFtpFolderError] = useState("");

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
  const visibleUsers = users.filter((user) => !user.isRootUser);
  const totals = ftpDashboard?.totals ?? { total: 0, rootUsers: 0, extraUsers: 0 };
  useEffect(() => {
    if (!ftpDashboard?.cpLogin) return;
    setFtpDraft((draft) => {
      if (draft.path && !draft.path.includes("openreward-001") && !draft.path.includes("jyu001-001")) return draft;
      return { ...draft, path: "/" };
    });
  }, [ftpDashboard?.cpLogin]);

  async function browseFtpFolders(path = ftpDraft.path || "/") {
    setIsLoadingFtpFolders(true);
    setFtpFolderError("");
    try {
      const params = new URLSearchParams({
        path: path === "/" ? "" : path,
        sortBy: "name",
        orderBy: "asc"
      });
      const response = await fetch(hostingApiUrl(`/api/hosting/files/browse?${params.toString()}`, cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setFtpFolderError(formatFileManagerMessage(result?.message ?? "Unable to load folders."));
        return;
      }

      setFtpFolderPicker(result.fileManager);
    } catch {
      setFtpFolderError("Unable to reach file manager folder API.");
    } finally {
      setIsLoadingFtpFolders(false);
    }
  }

  function openFtpFolderPicker() {
    setIsFtpFolderPickerOpen(true);
    browseFtpFolders(ftpDraft.path || "/");
  }

  function chooseFtpFolder(path) {
    setFtpDraft((draft) => ({ ...draft, path: normalizeFtpPickerPath(path, ftpDashboard?.cpLogin) }));
    setIsFtpFolderPickerOpen(false);
  }

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
      return result;
    } finally {
      setIsFtpMutating(false);
    }
  }

  async function submitFtpDraft(event) {
    event.preventDefault();
    setFtpMessage("");
    if (ftpDraft.password !== ftpDraft.confirmPassword) {
      setFtpMessage("FTP passwords do not match.");
      return;
    }

    setIsFtpMutating(true);
    try {
      const payload = {
        cpId,
        login: ftpDraft.login,
        password: ftpDraft.password,
        path: ftpDraft.path,
        quotaMb: 0,
        permission: "write"
      };
      const result = await provisionHosting("/api/hosting/ftp/users", cpId, payload);
      setFtpMessage(result.message);
      setFtpDraft((draft) => ({ ...draft, login: "codex-test-ftp", password: "CodexFtp123!", confirmPassword: "CodexFtp123!", path: "/" }));
      setIsFtpCreateOpen(false);
      await loadFtp();
    } catch (error) {
      setFtpMessage(error.message);
    } finally {
      setIsFtpMutating(false);
    }
  }

  async function deleteFtpUser(user) {
    if (user.isRootUser) {
      setFtpMessage("Root FTP user cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete FTP user ${displayFtpLogin(user.login, ftpDashboard?.cpLogin)}? This removes the FTP account record.`)) return;
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
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">Live FTP</span>
          <h2>FTP Manager</h2>
          <p>FTP account inventory for this hosting plan. Create and delete update the live FTP account records.</p>
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
            setFtpDraft({ login: "codex-test-ftp", password: "CodexFtp123!", confirmPassword: "CodexFtp123!", path: "/" });
            setIsFtpCreateOpen(true);
          }}>+ FTP User</button>
        </div>
      </div>

      {isFtpCreateOpen && (
        <FtpCreateDrawer
          draft={ftpDraft}
          isBusy={isFtpMutating}
          onChange={setFtpDraft}
          onClose={() => {
            if (isFtpMutating) return;
            setIsFtpCreateOpen(false);
          }}
          onOpenFolderPicker={openFtpFolderPicker}
          onSubmit={submitFtpDraft}
        />
      )}

      {isFtpFolderPickerOpen && (
        <FolderPickerModal
          title="Select FTP Root Folder"
          currentPath={normalizeFtpPickerPath(ftpFolderPicker?.currentPath || ftpDraft.path || "/", ftpDashboard?.cpLogin)}
          folders={ftpFolderPicker?.folders ?? []}
          parentPath={ftpFolderPicker?.parentPath || ""}
          isLoading={isLoadingFtpFolders}
          error={ftpFolderError}
          onBrowse={browseFtpFolders}
          onChoose={() => chooseFtpFolder(ftpFolderPicker?.currentPath || "/")}
          onClose={() => setIsFtpFolderPickerOpen(false)}
        />
      )}

      {isLoadingFtp && <LoadingState label="Loading FTP users" />}
      {ftpMessage && <p className="sandbox-message">{ftpMessage}</p>}
      {ftpError && (
        <div className="panel-card dashboard-error-panel">
          <p>{ftpError}</p>
          <IconActionButton label="Retry" onClick={loadFtp} />
        </div>
      )}
      {!isLoadingFtp && !ftpError && !visibleUsers.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No FTP users</span>
          <h2>No FTP users found</h2>
          <p>This hosting account does not have any visible FTP rows.</p>
        </div>
      )}

      {!!visibleUsers.length && (
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
              {visibleUsers.map((user) => (
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

    </section>
  );
}

function FtpCreateDrawer({ draft, isBusy, onChange, onClose, onOpenFolderPicker, onSubmit }) {
  const passwordMismatch = Boolean(draft.password || draft.confirmPassword) && draft.password !== draft.confirmPassword;
  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isBusy) onClose();
    }}>
      <aside className="function-drawer panel-card settings-drawer" aria-label="Create FTP User" role="dialog" aria-modal="true">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">FTP</span>
            <h2>Create FTP User</h2>
            <p>Create an FTP user with login, password, confirm password, and folder access.</p>
          </div>
          <div className="function-drawer-actions">
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" disabled={isBusy} onClick={onClose} aria-label="Close">
              <MenuIcon name="x" />
            </button>
          </div>
        </header>

        <form className="function-field-form compact-site-name-form" onSubmit={onSubmit}>
          <label>
            Login
            <input value={draft.login} onChange={(event) => onChange((current) => ({ ...current, login: event.target.value }))} />
          </label>
          <label>
            Password
            <input type="password" value={draft.password} onChange={(event) => onChange((current) => ({ ...current, password: event.target.value }))} />
          </label>
          <label>
            Confirm Password
            <input type="password" value={draft.confirmPassword ?? ""} onChange={(event) => onChange((current) => ({ ...current, confirmPassword: event.target.value }))} />
          </label>
          {passwordMismatch && <p className="field-warning">Passwords do not match.</p>}
          <label>
            Path
            <span className="ftp-path-control">
              <input value={draft.path} readOnly />
              <IconActionButton label="Select Folder" icon="folder" onClick={onOpenFolderPicker} disabled={isBusy} />
            </span>
          </label>
          <div className="function-submit-row">
            <button className="primary-button compact" type="submit" disabled={isBusy || passwordMismatch}>
              {isBusy ? <LoadingIcon label="Creating FTP user" /> : "Create FTP User"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function displayFtpLogin(login, cpLogin) {
  const text = String(login ?? "").trim();
  if (cpLogin && text.toLowerCase() === String(cpLogin).toLowerCase()) {
    return "Root FTP User";
  }
  return text || "FTP User";
}

function normalizeFtpPickerPath(path, cpLogin = "") {
  let text = String(path ?? "").replace(/\\/g, "/").trim();
  if (!text || text === ".") return "/";

  const login = String(cpLogin ?? "").trim();
  if (login) {
    const absoluteBasePattern = new RegExp(`^/?[a-z]:/root/home/${escapeRegExp(login)}/www(?:/|$)`, "i");
    text = text.replace(absoluteBasePattern, "/");

    const accountBasePattern = new RegExp(`^/?${escapeRegExp(login)}/www(?:/|$)`, "i");
    text = text.replace(accountBasePattern, "/");
  }

  text = text.replace(/^\/+/, "/").replace(/\/+$/, "");
  return text.startsWith("/") ? text : `/${text}`;
}

function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function FilesSection({ cpId, initialPath = "", showBackToWebsites = false, onBackToWebsites }) {
  const { activity, isLoading, error, reload } = useHostingActivity(cpId);
  const fileUploadInputRef = useRef(null);
  const initialPathRef = useRef("");
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [sitesError, setSitesError] = useState("");
  const [filesMessage, setFilesMessage] = useState("");
  const [fileManagerPreview, setFileManagerPreview] = useState(null);
  const [currentFilePath, setCurrentFilePath] = useState("");
  const [fileEditor, setFileEditor] = useState(null);
  const [isFileSaving, setIsFileSaving] = useState(false);
  const [isFileManagerBrowsing, setIsFileManagerBrowsing] = useState(false);
  const [isFileManagerMutating, setIsFileManagerMutating] = useState(false);
  const [fileAction, setFileAction] = useState(null);
  const [fileActionDraft, setFileActionDraft] = useState({});
  const [isFileFolderPickerOpen, setIsFileFolderPickerOpen] = useState(false);
  const [isLoadingFileFolders, setIsLoadingFileFolders] = useState(false);
  const [fileFolderPicker, setFileFolderPicker] = useState(null);
  const [fileFolderError, setFileFolderError] = useState("");
  const [deleteFileItem, setDeleteFileItem] = useState(null);
  const [isFileWorkQueueOpen, setIsFileWorkQueueOpen] = useState(false);
  const [deletingQueueId, setDeletingQueueId] = useState(0);
  const fileJobs = (activity?.jobs ?? []).filter((job) =>
    ["zip", "Unzip", "perm", "scanvirus"].includes(job.type) ||
    job.server === "file-manager" ||
    String(job.from ?? "").toLowerCase().startsWith("/www/")
  );
  const activeFileQueueCount = fileJobs.filter((job) => job.statusCode === 0 || job.statusCode === 1).length;

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
    } catch {
      setSitesError("Unable to reach site folder service.");
    }
  }

  useEffect(() => {
    loadFileSites();
  }, [cpId]);

  const siteFolders = (sitesDashboard?.sites ?? []).slice(0, 12);
  const securityBySite = new Map((securityDashboard?.siteSecurityRows ?? []).map((row) => [String(row.siteUid), row]));
  const managerFolders = fileManagerPreview?.folders ?? [];
  const managerFiles = fileManagerPreview?.files ?? [];
  const managerItems = [...managerFolders, ...managerFiles];

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
        : "\\www";
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

  async function deleteFileQueueItem(id) {
    setFilesMessage("");
    setDeletingQueueId(id);
    try {
      const result = await deleteHostingWorkqueue(cpId, id);
      setFilesMessage(result.message);
      await reload();
    } catch (error) {
      setFilesMessage(error.message);
    } finally {
      setDeletingQueueId(0);
    }
  }

  async function browseFileManager(path = currentFilePath) {
    setFilesMessage("");
    setIsFileManagerBrowsing(true);
    const nextPath = path ?? "";
    const params = new URLSearchParams();
    params.set("path", nextPath);
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/files/browse?${params.toString()}`, cpId));
      const result = await response.json().catch(() => null);
      setFileManagerPreview(result?.fileManager ?? null);
      if (result?.fileManager) {
        setCurrentFilePath(result.fileManager.relativePath || nextPath);
      }
      setFilesMessage(formatFileManagerMessage(result?.message ?? "File manager browse completed."));
    } catch (error) {
      setFilesMessage(error.message);
    } finally {
      setIsFileManagerBrowsing(false);
    }
  }

  useEffect(() => {
    const nextInitialPath = String(initialPath ?? "").trim();
    const browseKey = `${cpId}:${nextInitialPath || "/"}`;
    if (!cpId || initialPathRef.current === browseKey) return;

    initialPathRef.current = browseKey;
    setCurrentFilePath(nextInitialPath);
    browseFileManager(nextInitialPath);
  }, [cpId, initialPath]);

  function openFileManagerItem(item) {
    if (item?.isFolder) {
      browseFileManager(item.relativePath || item.name || "");
    }
  }

  async function createNewFolder(event) {
    event?.preventDefault();
    const folderName = String(fileActionDraft.name ?? "").trim();
    if (!folderName) {
      setFilesMessage("Folder name is required.");
      return;
    }

    setFilesMessage("");
    setIsFileManagerMutating(true);
    try {
      const result = await runFileManagerAction({
        action: "new-folder",
        path: currentFilePath || fileManagerPreview?.relativePath || "",
        name: folderName,
        targetPath: "",
        targetName: "",
        overwrite: false
      });
      setFilesMessage(result.message);
      await browseFileManager(currentFilePath);
      closeFileAction();
    } catch (error) {
      setFilesMessage(error.message);
    } finally {
      setIsFileManagerMutating(false);
    }
  }

  async function createNewFile() {
    const fileName = String(fileActionDraft.name ?? "").trim();
    if (!fileName) {
      setFilesMessage("File name is required.");
      return;
    }

    setFilesMessage("");
    setIsFileManagerMutating(true);
    try {
      const result = await runFileManagerAction({
        action: "new-file",
        path: currentFilePath || fileManagerPreview?.relativePath || "",
        name: fileName,
        targetPath: "",
        targetName: fileName,
        overwrite: false,
        content: ""
      });
      setFilesMessage(result.message);
      await browseFileManager(currentFilePath);
      setFileEditor({
        name: fileName,
        path: currentFilePath || fileManagerPreview?.relativePath || "",
        content: "",
        originalContent: ""
      });
      closeFileAction();
    } catch (error) {
      setFilesMessage(error.message);
    } finally {
      setIsFileManagerMutating(false);
    }
  }

  function openFileAction(action, item = null) {
    const basePath = currentFilePath || fileManagerPreview?.relativePath || "/";
    const defaults = {
      name: "",
      targetName: "",
      targetPath: basePath || "/",
      overwrite: false
    };

    if (action === "new-file") {
      defaults.name = "";
    } else if (action === "rename") {
      defaults.targetName = item?.name ?? "";
    } else if (action === "zip") {
      defaults.targetName = item?.name ? `${item.name}.zip` : "";
    }

    setFilesMessage("");
    setFileAction({ action, item });
    setFileActionDraft(defaults);
  }

  function closeFileAction() {
    setFileAction(null);
    setFileActionDraft({});
    setIsFileFolderPickerOpen(false);
    setFileFolderError("");
  }

  async function browseFileActionFolders(path = fileActionDraft.targetPath || "/") {
    setIsLoadingFileFolders(true);
    setFileFolderError("");
    try {
      const params = new URLSearchParams({
        path: path === "/" ? "" : path,
        sortBy: "name",
        orderBy: "asc"
      });
      const response = await fetch(hostingApiUrl(`/api/hosting/files/browse?${params.toString()}`, cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setFileFolderError(formatFileManagerMessage(result?.message ?? "Unable to load folders."));
        return;
      }

      setFileFolderPicker(result.fileManager);
    } catch {
      setFileFolderError("Unable to reach file manager folder API.");
    } finally {
      setIsLoadingFileFolders(false);
    }
  }

  function openFileFolderPicker() {
    setIsFileFolderPickerOpen(true);
    browseFileActionFolders(fileActionDraft.targetPath || "/");
  }

  function chooseFileActionFolder(path) {
    setFileActionDraft((draft) => ({ ...draft, targetPath: normalizeFtpPickerPath(path, sitesDashboard?.cpLogin) }));
    setIsFileFolderPickerOpen(false);
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
      await browseFileManager(currentFilePath);
    } catch (error) {
      setFilesMessage(error.message);
    }
  }

  async function runFileItemAction(action, item) {
    if (!item) return false;
    const folderToReload = currentFilePath || fileManagerPreview?.relativePath || "";
    let targetPath = folderToReload;
    let targetName = "";
    let overwrite = false;

    if (action === "rename") {
      const nextName = String(fileActionDraft.targetName ?? "").trim();
      if (!nextName || nextName === item.name) {
        setFilesMessage("Enter a new file or folder name.");
        return false;
      }
      targetName = nextName;
    }

    if (action === "copy" || action === "move") {
      const destination = String(fileActionDraft.targetPath ?? "").trim();
      if (!destination) {
        setFilesMessage("Choose a destination folder path.");
        return false;
      }
      targetPath = destination;
      overwrite = Boolean(fileActionDraft.overwrite);
    }

    if (action === "zip") {
      const zipName = String(fileActionDraft.targetName ?? "").trim();
      if (!zipName) {
        setFilesMessage("Zip file name is required.");
        return false;
      }
      targetName = zipName;
    }

    if (action === "unzip") {
      const destination = String(fileActionDraft.targetPath ?? "").trim();
      if (!destination) {
        setFilesMessage("Choose a destination folder path.");
        return false;
      }
      targetPath = destination;
    }

    setFilesMessage("");
    setIsFileManagerMutating(true);
    try {
      const result = await runFileManagerAction({
        action,
        path: folderToReload,
        name: item.name,
        targetPath,
        targetName,
        overwrite
      });
      setFileManagerPreview(result?.fileManager ?? fileManagerPreview);
      setFilesMessage(result.message);
      if (action === "zip" || action === "unzip") {
        await reload();
      }
      await browseFileManager(folderToReload);
      closeFileAction();
      return true;
    } catch (error) {
      setFilesMessage(error.message);
      return false;
    } finally {
      setIsFileManagerMutating(false);
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
      await browseFileManager(fileEditor.path);
    } catch (error) {
      setFilesMessage(error.message);
    } finally {
      setIsFileSaving(false);
    }
  }

  return (
    <section className="cp-inventory-section">
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

      <div className="database-toolbar panel-card">
        <div className="database-actions">
          {showBackToWebsites && (
            <button className="secondary-button compact file-manager-back-button" type="button" onClick={onBackToWebsites}>
              <MenuIcon name="back" />
              <span>Back to Websites</span>
            </button>
          )}
          <IconActionButton label="Browse Root" className="primary-button compact icon-only-button" onClick={() => browseFileManager("")} />
          <IconActionButton label="Parent Folder" disabled={!fileManagerPreview?.parentPath} onClick={() => browseFileManager(fileManagerPreview?.parentPath || "")} />
          <IconActionButton label="New Folder" icon="new-folder" disabled={isFileManagerMutating} onClick={() => openFileAction("new-folder")} />
          <IconActionButton label="New File" icon="new-file" disabled={isFileManagerMutating} onClick={() => openFileAction("new-file")} />
          <IconActionButton label="Upload" onClick={openUploadPicker} />
          <button className="secondary-button compact icon-only-button badge-icon-button" type="button" title="Work Queue" aria-label="Work Queue" onClick={() => setIsFileWorkQueueOpen(true)}>
            <MenuIcon name="work-queue" />
            {activeFileQueueCount > 0 && <span className="icon-count-badge">{activeFileQueueCount}</span>}
          </button>
          <input
            ref={fileUploadInputRef}
            type="file"
            className="visually-hidden"
            onChange={uploadFileManagerItem}
          />
        </div>
        <RefreshButton onClick={() => { reload(); loadFileSites(); browseFileManager(currentFilePath); }} />
      </div>
      {fileAction && (
        <FileManagerActionDrawer
          action={fileAction.action}
          item={fileAction.item}
          draft={fileActionDraft}
          isBusy={isFileManagerMutating}
          onChange={setFileActionDraft}
          onCancel={closeFileAction}
          onOpenFolderPicker={openFileFolderPicker}
          onSubmit={(event) => {
            event.preventDefault();
            if (fileAction.action === "new-file") {
              createNewFile();
              return;
            }
            if (fileAction.action === "new-folder") {
              createNewFolder(event);
              return;
            }
            runFileItemAction(fileAction.action, fileAction.item);
          }}
        />
      )}
      {isFileFolderPickerOpen && (
        <FolderPickerModal
          title="Select Destination Folder"
          currentPath={normalizeFtpPickerPath(fileFolderPicker?.currentPath || fileActionDraft.targetPath || "/", sitesDashboard?.cpLogin)}
          folders={fileFolderPicker?.folders ?? []}
          parentPath={fileFolderPicker?.parentPath || ""}
          isLoading={isLoadingFileFolders}
          error={fileFolderError}
          onBrowse={browseFileActionFolders}
          onChoose={() => chooseFileActionFolder(fileFolderPicker?.currentPath || "/")}
          onClose={() => setIsFileFolderPickerOpen(false)}
        />
      )}
      {deleteFileItem && (
        <FileDeleteConfirmModal
          item={deleteFileItem}
          isBusy={isFileManagerMutating}
          onClose={() => setDeleteFileItem(null)}
          onConfirm={async () => {
            const didDelete = await runFileItemAction("delete", deleteFileItem);
            if (didDelete) setDeleteFileItem(null);
          }}
        />
      )}
      {isFileWorkQueueOpen && (
        <FileWorkQueueDrawer
          jobs={fileJobs}
          isLoading={isLoading}
          error={error}
          deletingId={deletingQueueId}
          onClose={() => setIsFileWorkQueueOpen(false)}
          onRetry={reload}
          onDelete={deleteFileQueueItem}
        />
      )}
      {filesMessage && <p className="sandbox-message">{filesMessage}</p>}

      <article className="panel-card file-root-card">
        <div className="database-card-header">
          <div>
            <span className="status-pill">Root</span>
            <h3>{fileManagerPreview?.relativePath || currentFilePath || "/www"}</h3>
          </div>
          <MenuIcon name="folder" />
        </div>
        <div className="file-manager-meta">
          <span>{managerFolders.length} folders</span>
          <span>{managerFiles.length} files</span>
        </div>

        {isFileManagerBrowsing && (
          <div className="panel-card website-list-loading file-manager-loading">
            <LoadingIcon label="Loading files" />
          </div>
        )}
        {isFileManagerMutating && (
          <div className="panel-card website-list-loading file-manager-loading">
            <LoadingIcon label="Running file action" />
          </div>
        )}

        {!isFileManagerBrowsing && !isFileManagerMutating && !fileManagerPreview && (
          <div className="empty-state file-empty-state">
            <MenuIcon name="folder-search" />
            <p>Use the folder icon to browse the hosting root once the server agent is uploaded.</p>
          </div>
        )}

        {!isFileManagerBrowsing && !isFileManagerMutating && fileManagerPreview && managerItems.length === 0 && (
          <div className="empty-state file-empty-state">
            <MenuIcon name="folder" />
            <p>No files or folders returned for this path.</p>
          </div>
        )}

        {!isFileManagerBrowsing && !isFileManagerMutating && !!managerItems.length && (
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
                        <IconActionButton label="Rename" onClick={() => openFileAction("rename", item)} />
                        <IconActionButton label="Copy" onClick={() => openFileAction("copy", item)} />
                        <IconActionButton label="Move" onClick={() => openFileAction("move", item)} />
                        <IconActionButton label="Zip" onClick={() => openFileAction("zip", item)} />
                        {!item.isFolder && item.extension?.toLowerCase() === "zip" && <IconActionButton label="Unzip" onClick={() => openFileAction("unzip", item)} />}
                        <IconActionButton label="Delete" onClick={() => setDeleteFileItem(item)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </article>

      {fileEditor && (
        <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setFileEditor(null);
        }}>
          <aside className="function-drawer panel-card settings-drawer file-editor-drawer" role="dialog" aria-modal="true" aria-label={`Edit ${fileEditor.name}`}>
            <header className="function-drawer-header">
              <div>
                <span className="status-pill blue">Editor</span>
                <h2>{fileEditor.name}</h2>
                <p>{fileEditor.path || "Hosting root"}</p>
              </div>
              <div className="function-drawer-actions">
                <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={() => setFileEditor(null)} aria-label="Close">
                  <MenuIcon name="x" />
                </button>
              </div>
            </header>
            <form className="file-editor-form file-editor-drawer-form" onSubmit={saveFileEditor}>
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
          </aside>
        </div>
      )}

      {sitesError && (
        <div className="panel-card dashboard-error-panel">
          <p>{sitesError}</p>
          <IconActionButton label="Retry" onClick={loadFileSites} />
        </div>
      )}
    </section>
  );
}

function FileManagerActionDrawer(props) {
  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !props.isBusy) props.onCancel();
    }}>
      <aside className="function-drawer panel-card settings-drawer file-action-drawer" role="dialog" aria-modal="true" aria-label="File manager action">
        <FileManagerActionPanel {...props} />
      </aside>
    </div>
  );
}

function FileWorkQueueDrawer({ jobs, isLoading, error, deletingId, onClose, onRetry, onDelete }) {
  const pending = jobs.filter((job) => job.statusCode === 0).length;
  const running = jobs.filter((job) => job.statusCode === 1).length;
  const errors = jobs.filter((job) => job.statusCode === 3).length;

  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="function-drawer panel-card settings-drawer file-workqueue-drawer" role="dialog" aria-modal="true" aria-label="File Manager Work Queue">
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">Work Queue</span>
            <h2>File Manager Queue</h2>
            <p>Recent queued file jobs for this hosting plan.</p>
          </div>
          <div className="function-drawer-actions">
            <IconActionButton label="Refresh" onClick={onRetry} />
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={onClose} aria-label="Close">
              <MenuIcon name="x" />
            </button>
          </div>
        </header>
        <div className="queue-summary-row">
          <span><strong>{pending}</strong> Pending</span>
          <span><strong>{running}</strong> Running</span>
          <span><strong>{errors}</strong> Errors</span>
        </div>
        <FileWorkQueueCards jobs={jobs} isLoading={isLoading} error={error} deletingId={deletingId} onRetry={onRetry} onDelete={onDelete} />
      </aside>
    </div>
  );
}

function FileWorkQueueCards({ jobs, isLoading, error, deletingId, onRetry, onDelete }) {
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
        <h2>No file workqueue activity</h2>
        <p>No File Manager workqueue rows were found for this hosting plan.</p>
      </div>
    );
  }

  return (
    <div className="file-workqueue-card-list">
      {jobs.map((job) => (
        <article className="file-workqueue-card" key={job.id}>
          <div className="file-workqueue-card-main">
            <div>
              <span className={job.statusCode === 3 ? "status-pill danger" : job.statusCode === 2 ? "status-pill" : "status-pill blue"}>
                {job.status}
              </span>
              <h3>#{job.id} {job.type || "Job"}</h3>
              <p>{job.from || "No source path"}</p>
            </div>
            <div className="file-workqueue-card-actions">
              <time>{formatDateTime(job.enterDate)}</time>
              <IconActionButton
                label={job.statusCode === 0 ? "Delete" : "Delete disabled"}
                icon="trash"
                disabled={job.statusCode !== 0 || deletingId === job.id}
                onClick={() => onDelete(job.id)}
              />
            </div>
          </div>
          <dl className="file-workqueue-meta">
            <div>
              <dt>To</dt>
              <dd>{job.to || "-"}</dd>
            </div>
            <div>
              <dt>Server</dt>
              <dd>{job.server || "-"}</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>{job.siteOwner || "-"}</dd>
            </div>
            <div>
              <dt>Notify</dt>
              <dd>{job.notifyEmail || "-"}</dd>
            </div>
          </dl>
          {job.data1 && <p className="file-workqueue-note">{job.data1}</p>}
          {job.errorMessage && <p className="job-error-message">{job.errorMessage}</p>}
        </article>
      ))}
    </div>
  );
}

function FileManagerActionPanel({ action, item, draft, isBusy, onChange, onCancel, onOpenFolderPicker, onSubmit }) {
  const titleMap = {
    "new-folder": "Create Folder",
    "new-file": "Create New File",
    rename: "Rename",
    copy: "Copy",
    move: "Move",
    zip: "Zip",
    unzip: "Unzip"
  };
  const title = titleMap[action] ?? "File Action";
  const currentName = item?.name ?? "";
  const needsDestination = action === "copy" || action === "move" || action === "unzip";
  const needsTargetName = action === "rename" || action === "zip";
  const isSubmitDisabled = isBusy ||
    (action === "new-folder" && !String(draft.name ?? "").trim()) ||
    (action === "new-file" && !String(draft.name ?? "").trim()) ||
    (needsTargetName && !String(draft.targetName ?? "").trim()) ||
    (needsDestination && !String(draft.targetPath ?? "").trim());

  return (
    <form className="file-action-panel" onSubmit={onSubmit}>
      <header className="function-drawer-header file-action-drawer-header">
        <div>
          <span className="status-pill blue">File Manager</span>
          <h2>{title}</h2>
          {currentName && <p>{currentName}</p>}
        </div>
        <div className="function-drawer-actions">
          <button className="secondary-button compact icon-only-button drawer-close-button" type="button" disabled={isBusy} onClick={onCancel} aria-label="Close">
            <MenuIcon name="x" />
          </button>
        </div>
      </header>

      <div className="file-action-fields">
        {action === "new-file" && (
          <label>
            File Name
            <input
              autoFocus
              value={draft.name ?? ""}
              onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
              placeholder="example.txt"
            />
          </label>
        )}

        {action === "new-folder" && (
          <label>
            Folder Name
            <input
              autoFocus
              value={draft.name ?? ""}
              onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
              placeholder="folder-name"
            />
          </label>
        )}

        {action === "rename" && (
          <>
            <label>
              Current Name
              <input value={currentName} readOnly />
            </label>
            <label>
              New Name
              <input
                autoFocus
                value={draft.targetName ?? ""}
                onChange={(event) => onChange((current) => ({ ...current, targetName: event.target.value }))}
                placeholder="new-name"
              />
            </label>
          </>
        )}

        {needsDestination && (
          <label>
            Destination Folder
            <span className="ftp-path-control">
              <input
                autoFocus
                value={draft.targetPath ?? ""}
                readOnly
                placeholder="/"
              />
              <IconActionButton label="Select Folder" icon="folder" onClick={onOpenFolderPicker} />
            </span>
          </label>
        )}

        {action === "zip" && (
          <label>
            Zip File Name
            <input
              autoFocus
              value={draft.targetName ?? ""}
              onChange={(event) => onChange((current) => ({ ...current, targetName: event.target.value }))}
              placeholder={`${currentName || "archive"}.zip`}
            />
          </label>
        )}

        {(action === "copy" || action === "move") && (
          <label className="file-action-checkbox">
            <input
              type="checkbox"
              checked={Boolean(draft.overwrite)}
              onChange={(event) => onChange((current) => ({ ...current, overwrite: event.target.checked }))}
            />
            Overwrite if target exists
          </label>
        )}
      </div>

      <div className="file-action-buttons">
        <button className="primary-button compact" type="submit" disabled={isSubmitDisabled}>
          {isBusy ? <LoadingIcon label={`Running ${title}`} /> : title}
        </button>
      </div>
    </form>
  );
}

function FileDeleteConfirmModal({ item, isBusy, onClose, onConfirm }) {
  const itemType = item?.isFolder ? "Folder" : "File";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isBusy) onClose();
    }}>
      <article className="panel-card confirm-modal" role="dialog" aria-modal="true" aria-labelledby="file-delete-title">
        <span className="status-pill warning">Delete</span>
        <h2 id="file-delete-title">Delete {itemType}</h2>
        <p>Are you sure you want to delete <strong>{item?.name}</strong>? This cannot be undone.</p>
        <div className="confirm-actions">
          <button className="secondary-button compact" type="button" disabled={isBusy} onClick={onClose}>
            Cancel
          </button>
          <button className="danger-button compact" type="button" disabled={isBusy} onClick={onConfirm}>
            {isBusy ? <LoadingIcon label="Deleting item" /> : "Delete"}
          </button>
        </div>
      </article>
    </div>
  );
}

function FolderPickerModal({ title, currentPath, folders, parentPath, isLoading, error, onBrowse, onChoose, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <article className="panel-card confirm-modal ftp-folder-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="ftp-folder-modal-header">
          <div>
            <span className="status-pill blue">Folder</span>
            <h2>{title}</h2>
            <p>{currentPath}</p>
          </div>
          <button className="secondary-button compact icon-only-button" type="button" aria-label="Close" onClick={onClose}>
            <MenuIcon name="x" />
          </button>
        </div>
        <div className="ftp-folder-actions">
          <button className="secondary-button compact" type="button" disabled={isLoading} onClick={() => onBrowse("/")}>
            <MenuIcon name="folder" />
            Root
          </button>
          <button className="secondary-button compact" type="button" disabled={isLoading || !parentPath} onClick={() => onBrowse(parentPath || "/")}>
            <MenuIcon name="back" />
            Parent
          </button>
          <button className="primary-button compact" type="button" onClick={onChoose}>
            Select This Folder
          </button>
        </div>
        {isLoading && <LoadingState label="Loading folders" />}
        {error && <p className="renewal-action-message">{error}</p>}
        {!isLoading && !error && (
          <div className="ftp-folder-list">
            {folders.length === 0 && <p className="empty-state-text">No folders found here.</p>}
            {folders.map((folder) => (
              <button
                className="ftp-folder-row"
                key={folder.relativePath || folder.name}
                type="button"
                onClick={() => onBrowse(folder.relativePath || folder.name)}
              >
                <MenuIcon name="folder" />
                <span>{folder.name}</span>
              </button>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

function formatFileManagerMessage(message) {
  const text = message || "";
  if (text.includes("Legacy JSON agent rejected the request")) {
    return "File Manager agent rejected the encrypted request.";
  }
  if (text.includes("Legacy agent rejected the request")) {
    return "File Manager action was rejected by the hosting server.";
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
              <span className="status-pill blue">Requirements</span>
              <h3>{appRequirements.plugin?.name} {appRequirements.plugin?.version}</h3>
              <p>Plugin requirements loaded from the installer configuration tables.</p>
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
        </article>
      )}

      <article className="panel-card app-deploy-panel">
        <div className="database-card-header">
          <div>
            <span className="status-pill blue">Node.js Deploy</span>
            <h3>IISNode / HTTP Platform</h3>
            <p>Queues Node.js deploy and runtime jobs.</p>
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
                  <li>Create an install job and track deploy progress.</li>
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
    setSandboxMessage("This test queue is read-only now. Use the real test forms above, which only allow codex-test-* rows.");
  }

  async function updateSandboxJob(job) {
    setSandboxMessage(`Test job #${job.id} is read-only. Real tests must create codex-test-* rows through the forms above.`);
  }

  async function deleteSandboxJob(job) {
    setSandboxMessage(`Test job #${job.id} was not deleted automatically. Existing rows are protected.`);
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
      setSandboxMessage(`${action} needs the advanced service gateway before it can run.`);
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
            <p>Runtime inventory loaded without changing IIS, DNS, task, or deploy settings.</p>
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
            <p>Task scheduling needs the task service gateway before writing production task rows.</p>
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
            <span className="status-pill blue">Test Queue</span>
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
    "Application Pool": "Recycle, isolate, or create application pools.",
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
        ["Access Table", "cp_loginAlias"],
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
    return trimmed ? `/${trimmed}` : "/";
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

function SslLegacyContent({ securityDashboard, actionableDomains, runDomainServiceAction, sslDraft, setSslDraft, domainMessage, serviceResult }) {
  const sslOrders = securityDashboard?.sslOrders ?? [];
  const firstDomain = actionableDomains[0] || null;
  const [activeWorkflow, setActiveWorkflow] = useState("");

  function runSslOrderAction(action, order) {
    setActiveWorkflow(action);
    if (action === "Re-import SSL") {
      setActiveWorkflow("Import SSL");
      setSslDraft((draft) => ({
        ...draft,
        action,
        domain: order.commonName || "",
        certificateType: order.buyYears ? "Paid SSL" : "Free SSL",
        sslOrderId: String(order.id ?? "")
      }));
      return;
    }

    setSslDraft((draft) => ({
      ...draft,
      action,
      domain: order.commonName || firstDomain?.label || "",
      sslOrderId: String(order.id ?? ""),
      certificateId: String(order.certificateId ?? ""),
      certificateType: order.buyYears ? "Paid SSL" : "Free SSL",
      approverEmail: order.email || ""
    }));
    runDomainServiceAction("ssl", action, firstDomain, {
      domain: order.commonName || firstDomain?.label || "",
      sslOrderId: String(order.id ?? ""),
      certificateId: String(order.certificateId ?? ""),
      certificateType: order.buyYears ? "Paid SSL" : "Free SSL",
      approverEmail: order.email || "",
      action
    });
  }

  function chooseSslWorkflow(action) {
    setActiveWorkflow(action);
    setSslDraft((draft) => ({
      ...draft,
      action,
      domain: draft.domain || firstDomain?.label || "",
      approverEmail: draft.approverEmail || (firstDomain ? `admin@${firstDomain.label}` : "")
    }));
    if (action === "Request Free SSL") {
      runDomainServiceAction("ssl", action, firstDomain, {
        domain: firstDomain?.label || "",
        action
      });
    }
  }

  function submitCsr(event) {
    event.preventDefault();
    runDomainServiceAction("ssl", "CSR Request", firstDomain, {
      ...sslDraft,
      commonName: sslDraft.commonName || sslDraft.domain || firstDomain?.label || "",
      action: "CSR Request"
    });
  }

  function submitImport(event) {
    event.preventDefault();
    runDomainServiceAction("ssl", sslDraft.action || "Import SSL", firstDomain, {
      ...sslDraft,
      domain: firstDomain?.label || "",
      action: sslDraft.action || "Import SSL"
    });
  }

  return (
    <>
      <article className="panel-card ssl-legacy-notice">
        <div>
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

      {activeWorkflow && (
        <SslActionDrawer
          activeWorkflow={activeWorkflow}
          firstDomain={firstDomain}
          sslDraft={sslDraft}
          setSslDraft={setSslDraft}
          domainMessage={domainMessage}
          serviceResult={serviceResult}
          onClose={() => setActiveWorkflow("")}
          onSubmitCsr={submitCsr}
          onSubmitImport={submitImport}
        />
      )}

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

function SslActionDrawer({ activeWorkflow, firstDomain, sslDraft, setSslDraft, domainMessage, serviceResult, onClose, onSubmitCsr, onSubmitImport }) {
  const isCsr = activeWorkflow === "CSR Request";
  const isImport = activeWorkflow === "Import SSL";
  const title = isCsr
    ? "Create CSR"
    : isImport
      ? (sslDraft.action === "Re-import SSL" ? "Re-Import SSL Cert" : "Import SSL Cert")
      : activeWorkflow;
  const badge = isCsr
    ? "CSR Request"
    : isImport
      ? (sslDraft.action === "Re-import SSL" ? "Re-Import SSL Cert" : "Import SSL")
      : "SSL Action";

  return (
    <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="function-drawer panel-card settings-drawer ssl-action-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header className="function-drawer-header">
          <div>
            <span className="status-pill blue">{badge}</span>
            <h2>{title}</h2>
            <p>{isCsr ? "Creates a certificate signing request for this domain." : isImport ? "Upload a .cer, .crt, or .pfx certificate before installing it." : "Runs the selected SSL action for this domain."}</p>
          </div>
          <div className="function-drawer-actions">
            <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={onClose} aria-label="Close">
              <MenuIcon name="Close" />
            </button>
          </div>
        </header>

        {isCsr && (
          <article className="panel-card settings-drawer-card ssl-workflow-card">
            <form className="advance-inline-form ssl-csr-form drawer-form" onSubmit={onSubmitCsr}>
              <label>
                Common Name
                <input value={sslDraft.commonName || sslDraft.domain || firstDomain?.label || ""} onChange={(event) => setSslDraft((draft) => ({ ...draft, commonName: event.target.value }))} />
              </label>
              <label>
                Organization
                <input value={sslDraft.organization || ""} onChange={(event) => setSslDraft((draft) => ({ ...draft, organization: event.target.value }))} />
              </label>
              <label>
                Department
                <input value={sslDraft.department || ""} onChange={(event) => setSslDraft((draft) => ({ ...draft, department: event.target.value }))} />
              </label>
              <label>
                City
                <input value={sslDraft.city || ""} onChange={(event) => setSslDraft((draft) => ({ ...draft, city: event.target.value }))} />
              </label>
              <label>
                State
                <input value={sslDraft.state || ""} onChange={(event) => setSslDraft((draft) => ({ ...draft, state: event.target.value }))} />
              </label>
              <label>
                Country
                <input maxLength={2} value={sslDraft.country || "US"} onChange={(event) => setSslDraft((draft) => ({ ...draft, country: event.target.value.toUpperCase() }))} />
              </label>
              <button className="primary-button compact drawer-full-button" type="submit">Create CSR</button>
            </form>
          </article>
        )}

        {isImport && (
          <article className="panel-card settings-drawer-card ssl-workflow-card">
            <form className="advance-inline-form ssl-csr-form drawer-form" onSubmit={onSubmitImport}>
              <label>
                Common Name
                <input value={sslDraft.domain || ""} onChange={(event) => setSslDraft((draft) => ({ ...draft, domain: event.target.value }))} />
              </label>
              <label>
                Certificate Type
                <select value={sslDraft.certType || ".pfx"} onChange={(event) => setSslDraft((draft) => ({ ...draft, certType: event.target.value }))}>
                  <option value=".pfx">.pfx</option>
                  <option value=".cer">.cer / .crt</option>
                </select>
              </label>
              <label>
                Import Password
                <input value={sslDraft.sslpwd || ""} onChange={(event) => setSslDraft((draft) => ({ ...draft, sslpwd: event.target.value }))} />
              </label>
              <label>
                Cert File
                <input type="file" accept=".cer,.crt,.pfx" />
              </label>
              <button className="primary-button compact drawer-full-button" type="submit">{sslDraft.action === "Re-import SSL" ? "Re-Import SSL Cert" : "Import SSL Cert"}</button>
            </form>
          </article>
        )}

        {!isCsr && !isImport && (
          <article className="panel-card settings-drawer-card">
            <dl className="cp-context-meta drawer-meta">
              <div><dt>Domain</dt><dd>{sslDraft.domain || "-"}</dd></div>
              <div><dt>Certificate Type</dt><dd>{sslDraft.certificateType || "-"}</dd></div>
              <div><dt>Order ID</dt><dd>{sslDraft.sslOrderId || "-"}</dd></div>
            </dl>
          </article>
        )}

        {domainMessage && <p className="sandbox-message">{domainMessage}</p>}
        {serviceResult?.details?.csr && (
          <article className="panel-card settings-drawer-card">
            <div className="database-card-header">
              <div>
                <span className="status-pill blue">CSR</span>
                <h3>Generated CSR</h3>
              </div>
              <MenuIcon name="invoice" />
            </div>
            <textarea className="ssl-csr-output" readOnly value={serviceResult.details.csr} />
          </article>
        )}
        {serviceResult?.details && !serviceResult.details.csr && (
          <article className="panel-card settings-drawer-card">
            <div className="database-card-header">
              <div>
                <span className="status-pill blue">Result</span>
                <h3>Action Detail</h3>
              </div>
              <MenuIcon name="logs" />
            </div>
            <dl className="cp-context-meta drawer-meta">
              {Object.entries(serviceResult.details).map(([key, value]) => (
                <div key={key}><dt>{key}</dt><dd>{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>
              ))}
            </dl>
          </article>
        )}
      </aside>
    </div>
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
  const [selectedCpDnsDomain, setSelectedCpDnsDomain] = useState(null);
  const [cpDnsManager, setCpDnsManager] = useState(null);
  const [cpDnsMessage, setCpDnsMessage] = useState("");
  const [isCpDnsLoading, setIsCpDnsLoading] = useState(false);
  const [isCpDnsBusy, setIsCpDnsBusy] = useState(false);
  const [cpDnsDraft, setCpDnsDraft] = useState({
    recordType: "A",
    name: "@",
    value: "208.98.35.146",
    ttl: "300",
    priority: "10",
    weight: "1",
    port: "443"
  });
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
  const dnsDomains = domains.filter((domain) => {
    const label = String(domain.label ?? "").trim().replace(/\.$/, "");
    return label && !isTemporaryHostingDomain(label) && (label.match(/\./g) ?? []).length === 1;
  });
  const cdnDomains = domains.filter((domain) => {
    const label = String(domain.label ?? "").trim();
    return label && !isTemporaryHostingDomain(label);
  });
  const visibleDomains = mode === "dns" ? dnsDomains : mode === "cdn" ? cdnDomains : domains;
  const actionableDomains = visibleDomains.filter((domain) => !isTemporaryHostingDomain(domain.label));
  const modeCopy = {
    dns: {
      title: "DNS",
      label: "Live DNS",
      description: "Manage DNS records for mapped customer domains.",
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
      description: "SSL certificate inventory, free SSL requests, imports, install actions, and SSL order guidance.",
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
      : visibleDomains.filter((domain) => domain.isDefault).length;
  const uniqueSites = new Set(visibleDomains.map((domain) => domain.siteName)).size;
  const securityRows = buildSecurityRows(mode, securityDashboard);
  const domainJobs = (activity?.jobs ?? []).filter((job) =>
    job.server === `${mode}-manager` ||
    String(job.from ?? "").toLowerCase().startsWith(`${mode}:`)
  );
  const [viewMode, setViewMode] = useSectionViewMode(`cp-${mode}`, visibleDomains.length);
  const effectiveViewMode = mode === "dns" ? "table" : viewMode;

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
    const targetDomain = domain?.label || fields.domain || fields.commonName || "";
    const canRunWithoutMappedDomain = area === "ssl" && ["CSR Request", "Re-install SSL Cert", "Export SSL Cert", "Delete SSL", "Re-import SSL", "Resend Approver Email"].includes(action);
    const canRunCdnAccountAction = area === "cdn" && ["Enable Account", "Resend Invite"].includes(action);
    if (!domain && !canRunWithoutMappedDomain && !canRunCdnAccountAction) {
      setDomainMessage(`${area.toUpperCase()} actions need a mapped customer domain. Temporary hosting URLs are skipped.`);
      return;
    }
    if (!canRunWithoutMappedDomain && isTemporaryHostingDomain(targetDomain)) {
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
          domain: targetDomain,
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

  async function openCpDnsManager(domain) {
    if (!domain || isTemporaryHostingDomain(domain.label)) {
      setDomainMessage("DNS changes are blocked for temporary URL domains.");
      return;
    }

    setSelectedCpDnsDomain(domain);
    setCpDnsManager(null);
    setCpDnsMessage("");
    setCpDnsDraft((draft) => ({
      ...draft,
      recordType: "A",
      name: "@",
      value: "208.98.35.146",
      ttl: "300"
    }));
    await loadCpDnsManager(domain);
  }

  async function loadCpDnsManager(domain = selectedCpDnsDomain) {
    if (!domain?.domainUid) return;

    setIsCpDnsLoading(true);
    setCpDnsMessage("");
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/domains/${domain.domainUid}/dns`, cpId));
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setCpDnsManager(null);
        setCpDnsMessage(result?.message ?? "Unable to load DNS manager.");
        return;
      }

      setCpDnsManager(result.manager);
    } catch {
      setCpDnsMessage("Unable to reach DNS manager service.");
    } finally {
      setIsCpDnsLoading(false);
    }
  }

  async function submitCpDnsAction(action, recordIndex = null, recordDraft = null) {
    if (!selectedCpDnsDomain?.domainUid) return;

    const draft = recordDraft ?? cpDnsDraft;
    setIsCpDnsBusy(true);
    setCpDnsMessage("");
    try {
      const response = await fetch(hostingApiUrl(`/api/hosting/domains/${selectedCpDnsDomain.domainUid}/dns/action`, cpId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          recordType: draft.recordType,
          name: draft.name,
          value: draft.value,
          ttl: Number(draft.ttl) || 300,
          priority: draft.priority === "" ? null : Number(draft.priority),
          weight: draft.weight === "" ? null : Number(draft.weight),
          port: draft.port === "" ? null : Number(draft.port),
          recordIndex
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setCpDnsMessage(result?.message ?? "Unable to run DNS action.");
        return;
      }

      setCpDnsManager((current) => current ? { ...current, records: result.records ?? [] } : current);
      setCpDnsMessage(result.message);
    } catch {
      setCpDnsMessage("Unable to reach DNS action service.");
    } finally {
      setIsCpDnsBusy(false);
    }
  }

  useEffect(() => {
    if (mode !== "dns" || isLoadingDomains) return;

    if (!dnsDomains.length) {
      setSelectedCpDnsDomain(null);
      setCpDnsManager(null);
      return;
    }

    const selectedStillExists = selectedCpDnsDomain?.domainUid &&
      dnsDomains.some((domain) => String(domain.domainUid) === String(selectedCpDnsDomain.domainUid));
    if (!selectedStillExists) {
      openCpDnsManager(dnsDomains[0]);
    }
  }, [mode, isLoadingDomains, dnsDomains.map((domain) => domain.domainUid).join("|"), selectedCpDnsDomain?.domainUid]);

  function handleCpDnsDomainChange(domainUid) {
    const nextDomain = dnsDomains.find((domain) => String(domain.domainUid) === String(domainUid));
    if (nextDomain) {
      openCpDnsManager(nextDomain);
    }
  }

  if (mode === "dns") {
    return (
      <section className="cp-inventory-section">
        {selectedCpDnsDomain ? (
          <DnsManagementPage
            domain={{ domainName: selectedCpDnsDomain.label }}
            manager={cpDnsManager}
            isLoading={isCpDnsLoading || isLoadingDomains}
            message={cpDnsMessage}
            recordsPreview={[]}
            busy={isCpDnsBusy}
            draft={cpDnsDraft}
            onDraftChange={setCpDnsDraft}
            onReload={() => loadCpDnsManager(selectedCpDnsDomain)}
            onSubmitAction={submitCpDnsAction}
            domainOptions={dnsDomains}
            selectedDomainId={String(selectedCpDnsDomain.domainUid)}
            onDomainChange={handleCpDnsDomainChange}
          />
        ) : isLoadingDomains ? (
          <LoadingState label="Loading DNS domains" />
        ) : (
          <div className="panel-card cp-placeholder">
            <span className="status-pill muted">No domains</span>
            <h2>No root domains found</h2>
            <p>This hosting account does not have a DNS-manageable root domain.</p>
          </div>
        )}
      </section>
    );
  }

  if (mode === "cdn") {
    const cloudflareAccount = securityDashboard?.cloudflareAccounts?.[0] ?? null;
    return (
      <section className="cp-inventory-section cdn-legacy-section">
        {isLoadingSecurity && <LoadingState label="Loading CDN account" />}
        {isLoadingDomains && <LoadingState label="Loading CDN domains" />}
        {securityError && <p className="inline-status">{securityError}</p>}
        {domainError && (
          <div className="panel-card dashboard-error-panel">
            <p>{domainError}</p>
            <IconActionButton label="Retry" onClick={loadDomainServices} />
          </div>
        )}

        {!cloudflareAccount && (
          <article className="panel-card cdn-account-card">
            <div>
              <h3>Enable CDN Service</h3>
              <p>After enabling CDN, Cloudflare will send an invitation to your account contact email. Please accept the invitation from Cloudflare to complete setup.</p>
            </div>
            <button className="primary-button compact" type="button" onClick={() => runDomainServiceAction("cdn", "Enable Account", null, {})}>
              Enable
            </button>
          </article>
        )}

        {domainMessage && <p className="sandbox-message">{domainMessage}</p>}
        {!isLoadingDomains && !domainError && !visibleDomains.length && (
          <div className="panel-card cp-placeholder">
            <span className="status-pill muted">No domains</span>
            <h2>No mapped domains found</h2>
            <p>This hosting account does not have domains available for CDN.</p>
          </div>
        )}
        {!!visibleDomains.length && (
          <div className="cdn-workspace-grid">
            <div className="table-wrap website-table cdn-domain-table">
              <table>
                <thead>
                  <tr>
                    <th>Domain To Enable</th>
                    <th>CDN</th>
                    <th>Purge Cache Files</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDomains.map((domain) => (
                    <tr key={`cdn-${domain.domainUid}-${domain.label}`}>
                      <td>{domain.label}</td>
                      <td>
                        <button
                          className={domain.cdn ? "toggle-pill is-on" : "toggle-pill"}
                          type="button"
                          onClick={() => runDomainServiceAction("cdn", domain.cdn ? "Disable CDN" : "Enable CDN", domain)}
                        >
                          {domain.cdn ? "On" : "Off"}
                        </button>
                      </td>
                      <td>
                        {domain.cdn ? (
                          <button className="secondary-button compact" type="button" onClick={() => runDomainServiceAction("cdn", "Purge Cache", domain)}>
                            Purge
                          </button>
                        ) : (
                          <span className="muted-cell">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cdn-side-column">
              <article className="panel-card cdn-account-card">
                <h3>Cloudflare Login Info</h3>
                <dl className="card-meta single">
                  <div><dt>Login Name</dt><dd>{cloudflareAccount?.email || "Same as Account Contact"}</dd></div>
                  <div><dt>Password</dt><dd>{cloudflareAccount?.password || "-"}</dd></div>
                  <div><dt>URL</dt><dd><a href="https://www.cloudflare.com" target="_blank" rel="noreferrer">https://www.cloudflare.com</a></dd></div>
                </dl>
              </article>
              <article className="panel-card knowledge-card">
                <span className="status-pill muted">KB Article</span>
                <a href="http://www.smarterasp.net/support/KB/a1688/how-do-i-test-if-my-domain-name-is-now-on-cloudflare.aspx" target="_blank" rel="noreferrer">How do I test if my domain name is now on Cloudflare?</a>
                <a href="http://www.smarterasp.net/support/kb/a300/301-redirect-www-redirect-domain-redirect.aspx" target="_blank" rel="noreferrer">How do I redirect all requests from non-www to www domain?</a>
                <a href="http://www.smarterasp.net/support/kb/a1691/how-do-i-add-ssl-to-my-cdn.aspx" target="_blank" rel="noreferrer">How do I activate free SSL from CloudFlare?</a>
                <a href="http://www.smarterasp.net/support/kb/a345/redirect-http-to-https.aspx" target="_blank" rel="noreferrer">How do I force using https?</a>
              </article>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="cp-inventory-section">
      {mode !== "ssl" && <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">{modeCopy.label}</span>
          <h2>{modeCopy.title} Manager</h2>
          <p>{modeCopy.description}</p>
        </div>
        {mode !== "dns" && (
          <div className="database-total-grid">
            <div><span>{modeCopy.statOne}</span><strong>{visibleDomains.length}</strong></div>
            <div><span>{modeCopy.statTwo}</span><strong>{enabledCount}</strong></div>
            <div><span>{modeCopy.statThree}</span><strong>{uniqueSites}</strong></div>
          </div>
        )}
        <RefreshButton onClick={refreshDomainServiceSection} />
      </article>}

      {mode !== "ssl" && mode !== "dns" && <div className="database-toolbar panel-card">
        <div className="database-actions">
          {mode === "cdn" && <span className="inline-status">Use the per-domain table actions below. Tenant enable/resend invite follows the old Cloudflare tenant page.</span>}
        </div>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} label={`${modeCopy.title} view mode`} />
      </div>}

      {mode === "ssl" && (
        <SslLegacyContent
          securityDashboard={securityDashboard}
          actionableDomains={actionableDomains}
          runDomainServiceAction={runDomainServiceAction}
          sslDraft={sslDraft}
          setSslDraft={setSslDraft}
          domainMessage={domainMessage}
          serviceResult={serviceResult}
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
      {mode === "cdn" && (
        <article className="panel-card knowledge-card">
          <span className="status-pill muted">KB Article</span>
          <a href="http://www.smarterasp.net/support/KB/a1688/how-do-i-test-if-my-domain-name-is-now-on-cloudflare.aspx" target="_blank" rel="noreferrer">How do I test if my domain name is now on Cloudflare?</a>
          <a href="http://www.smarterasp.net/support/kb/a300/301-redirect-www-redirect-domain-redirect.aspx" target="_blank" rel="noreferrer">How do I redirect all requests from non-www to www domain?</a>
          <a href="http://www.smarterasp.net/support/kb/a1691/how-do-i-add-ssl-to-my-cdn.aspx" target="_blank" rel="noreferrer">How do I activate free SSL from CloudFlare?</a>
          <a href="http://www.smarterasp.net/support/kb/a345/redirect-http-to-https.aspx" target="_blank" rel="noreferrer">How do I force using https?</a>
        </article>
      )}

      {mode === "ssl" ? (
        (isLoadingDomains || isLoadingSecurity) && <LoadingState label="Loading SSL inventory" />
      ) : (
        <>
          {isLoadingDomains && <LoadingState label="Loading mapped domains" />}
          {isLoadingSecurity && <LoadingState label={`Loading ${mode.toUpperCase()} inventory`} />}
        </>
      )}
      {mode !== "ssl" && domainMessage && <p className="sandbox-message">{domainMessage}</p>}
      {mode !== "ssl" && serviceResult?.details?.records?.length > 0 && (
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
      {mode !== "ssl" && serviceResult?.details && !serviceResult.details.records && (
        <RuntimeRows
          title={`${serviceResult.area.toUpperCase()} Action Detail`}
          rows={[{
            title: serviceResult.action,
            subtitle: serviceResult.details.domain || "Service action",
            status: "Checked",
            details: Object.fromEntries(Object.entries(serviceResult.details)
              .filter(([key]) => key !== "legacySource")
              .map(([key, value]) => [key, typeof value === "object" ? JSON.stringify(value) : String(value)]))
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
      {!isLoadingDomains && !domainError && !visibleDomains.length && (
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

      {mode !== "ssl" && !!visibleDomains.length && effectiveViewMode === "cards" && (
        <div className="domain-service-grid">
          {visibleDomains.map((domain) => (
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
                  <IconActionButton
                    label={action}
                    key={action}
                    disabled={isTemporaryHostingDomain(domain.label)}
                    onClick={() => mode === "dns" ? openCpDnsManager(domain) : runDomainServiceAction(mode, action, domain)}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      {mode !== "ssl" && !!visibleDomains.length && effectiveViewMode === "table" && (
        <div className="table-wrap website-table">
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                {mode !== "dns" && <th>Website</th>}
                {mode !== "dns" && <th>Runtime</th>}
                {mode !== "dns" && <th>Status</th>}
                {mode !== "dns" && <th>CDN</th>}
                {mode !== "dns" && <th>SSL</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDomains.map((domain) => (
                <tr key={`${mode}-${domain.domainUid}-${domain.label}`}>
                  <td>{domain.label}</td>
                  {mode !== "dns" && <td>{domain.siteName}</td>}
                  {mode !== "dns" && <td>{domain.runtime}</td>}
                  {mode !== "dns" && <td>{domain.siteStatus}</td>}
                  {mode !== "dns" && <td>{domain.cdn ? "Enabled" : "Not enabled"}</td>}
                  {mode !== "dns" && <td>{domain.ssl ? "Enabled" : "Pending"}</td>}
                  <td>
                    <div className="website-action-buttons compact-actions">
                      {domainServiceRowActions(mode, domain).map((action) => (
                        <IconActionButton
                          label={action}
                          key={action}
                          disabled={isTemporaryHostingDomain(domain.label)}
                          onClick={() => mode === "dns" ? openCpDnsManager(domain) : runDomainServiceAction(mode, action, domain)}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {mode !== "ssl" && mode !== "dns" && <ActivityList jobs={domainJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle={`No recent ${mode.toUpperCase()} jobs`} onRetry={reloadActivity} />}
    </section>
  );
}

function domainServiceRowActions(mode, domain) {
  if (mode === "dns") {
    return ["DNS Manager"];
  }

  if (mode === "cdn") {
    return domain?.cdn ? ["Disable CDN", "Purge Cache"] : ["Enable CDN"];
  }

  return ["CSR Request", "Request Free SSL", "Import SSL"];
}

function dnsRecordExample(type) {
  switch (type) {
    case "AAAA":
      return "Example Name: blog          Address: 2610:150:4000:1db:f816:3eff:fef4:262f";
    case "CNAME":
      return "Example Name: blog          Address: www.google.com";
    case "MX":
      return "Address: igw5002.site4now.net          Priority: 10";
    case "TXT":
      return "SPF Example: Address: v=spf1 a mx include:_spf.site4now.net -all\nDMARC Example: Name: _dmarc      Address: v=DMARC1;p=reject;pct=100;rua=mailto:postmaster@agapepapa.com";
    case "SRV":
      return "Example Name: _sip._tls      Address: sipdir.online.lync.com      Priority: 10      Weight: 1      Port: 443";
    case "A":
    default:
      return "Example Name: blog          Address: 123.123.123.123";
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

function CustomSelect({ value, options = [], onChange, ariaLabel = "Choose option", disabled = false, className = "", menuWidth = "compact" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const normalizedOptions = options.map((option) => (
    typeof option === "object" ? option : { value: option, label: option }
  ));
  const selectedOption = normalizedOptions.find((option) => String(option.value) === String(value));

  function updateMenuPosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportPadding = 8;
    const targetWidth = menuWidth === "trigger"
      ? Math.min(Math.max(rect.width, 220), window.innerWidth - (viewportPadding * 2))
      : Math.min(150, Math.max(120, window.innerWidth - (viewportPadding * 2)));
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - targetWidth - 8));
    const optionCount = Math.max(1, normalizedOptions.length);
    const estimatedHeight = Math.min(280, (optionCount * 36) + 12);
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    const top = openUp
      ? Math.max(viewportPadding, rect.top - estimatedHeight - 6)
      : rect.bottom + 6;
    setMenuPosition({
      left,
      top,
      width: targetWidth,
      maxHeight: openUp ? Math.min(280, Math.max(120, spaceAbove - 12)) : Math.min(280, Math.max(120, spaceBelow - 6))
    });
  }

  useEffect(() => {
    if (!isOpen) return undefined;
    updateMenuPosition();

    function closeMenu(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function repositionMenu() {
      updateMenuPosition();
    }

    document.addEventListener("mousedown", closeMenu);
    window.addEventListener("resize", repositionMenu);
    window.addEventListener("scroll", repositionMenu, true);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("resize", repositionMenu);
      window.removeEventListener("scroll", repositionMenu, true);
    };
  }, [isOpen]);

  return (
    <div className={`custom-select-menu ${className}`.trim()} ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="custom-select-button"
        disabled={disabled}
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedOption?.label ?? "Please choose"}</span>
        <MenuIcon name="chevron-down" />
      </button>
      {isOpen && !disabled && (
        <div
          className="custom-select-options floating-custom-select-options"
          role="listbox"
          aria-label={ariaLabel}
          style={menuPosition ? {
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
            width: `${menuPosition.width}px`,
            maxHeight: `${menuPosition.maxHeight}px`
          } : undefined}
        >
          {normalizedOptions.map((option) => (
            <button
              aria-selected={String(option.value) === String(value)}
              className={String(option.value) === String(value) ? "custom-select-option active" : "custom-select-option"}
              disabled={option.disabled}
              key={`${option.value}-${option.label}`}
              role="option"
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IconActionButton({ label, icon = "", onClick, disabled = false, className = "secondary-button compact icon-only-button", type = "button" }) {
  return (
    <button
      aria-label={label}
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      <MenuIcon name={icon || iconForAction(label)} />
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
    file: (
      <>
        <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
        <path d="M14 3.5V8h4M9 12h6M9 15h6" />
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
    "new-file": (
      <>
        <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
        <path d="M14 3.5V8h4M12 11.5v6M9 14.5h6" />
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
    "work-queue": (
      <>
        <path d="M5 5h14v4H5zM5 10.5h14v4H5zM5 16h14v3H5z" />
        <path d="M8 7h4M8 12.5h6M8 17.5h3" />
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

  const iconName = icons[name] ? name : iconForAction(name);

  return (
    <svg className="menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[iconName] ?? icons.more}
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
  const [trialUpgradeAccount, setTrialUpgradeAccount] = useState(null);

  const activeOption = orderOptions.find((option) => option.type === activeType) ?? orderOptions[0];

  useEffect(() => {
    let ignore = false;
    async function loadTrialStatus() {
      try {
        const response = await fetch("/api/account/dashboard");
        const result = await response.json().catch(() => null);
        if (ignore || !response.ok || !result?.success) return;
        const trialAccount = (result.dashboard?.hostingAccounts ?? []).find((account) => account.isActiveTrialOnly || account.isTrial);
        setTrialUpgradeAccount(trialAccount ?? null);
      } catch {
        if (!ignore) setTrialUpgradeAccount(null);
      }
    }

    loadTrialStatus();
    return () => {
      ignore = true;
    };
  }, []);

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
    if (["hosting", "managed-hosting", "windows-vps", "linux-vps", "cloud", "dedicated"].includes(activeType) && trialUpgradeAccount?.cpId) {
      window.location.href = hostingRenewUrl(trialUpgradeAccount, "/account/cp_upgrade_list");
      return;
    }

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
                <p className="inline-status">No active products were found for this catalog.</p>
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
                        <CustomSelect
                          aria-label={`${product.name} billing term`}
                          value={selectedPrice?.priceId ?? ""}
                          ariaLabel={`${product.name} billing term`}
                          onChange={(value) => setSelectedPrices((current) => ({
                            ...current,
                            [product.productId]: Number(value)
                          }))}
                          options={(product.prices ?? []).map((price) => ({
                            value: price.priceId,
                            label: `${formatPaymentTerm(price.paymentTerm)} - ${formatMoney(price.amount, price.currency)}`
                          }))}
                        />
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
  const activeTrialAccount = accounts.find((account) => account.isActiveTrialOnly);
  const trialOfferMessage = activeTrialAccount?.trialUpgradeOffer;

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

  function openHostingRenewPromotion(account) {
    if (!account?.clientProductId) return;
    if (account.isTrial) {
      window.location.href = hostingRenewUrl(account, "/account/cp_upgrade_list");
      return;
    }
    window.location.href = hostingRenewUrl(account, "/account/cp_renew_promotion");
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

      {trialOfferMessage && (
        <article className="trial-upgrade-offer panel-card">
          <span className="status-pill warning">Limited-Time Offer</span>
          <p>{trialOfferMessage}</p>
          <button className="primary-button compact" type="button" onClick={() => openHostingRenewPromotion(activeTrialAccount)}>
            Upgrade to paid plan
          </button>
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
              <p>{upgradeCatalog?.legacyTrace ?? "Loading upgrade options for this hosting plan."}</p>
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
                  <CustomSelect
                    className="hosting-upgrade-target-select"
                    value={upgradeTargetId}
                    disabled={upgradeCalculating}
                    ariaLabel="Upgrade to"
                    onChange={(value) => {
                      const nextTargetId = value;
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
                    options={[
                      { value: "", label: "Please choose a plan" },
                      ...(upgradeCatalog.targets ?? []).map((target) => ({
                        value: target.productId,
                        label: target.description || target.name
                      }))
                    ]}
                  />
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
        <div className="card-grid hosting-plan-card-grid">
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
              </div>
              <dl className="card-meta">
                <div><dt>Renewal</dt><dd>{formatDate(account.renewalDate)}</dd></div>
                <div><dt>Plan</dt><dd>{account.webHostType}</dd></div>
              </dl>
              <div className="hosting-card-actions">
                <button className="primary-button hosting-manage-button" type="button" onClick={onManageHosting}>
                  <MenuIcon name="rocket" /> Manage
                </button>
                <button
                  className={account.isTrial ? "secondary-button trial-upgrade-action-button" : "secondary-button"}
                  type="button"
                  disabled={!account.clientProductId || renewalBusyId !== null}
                  onClick={() => openHostingRenewPromotion(account)}
                >
                  <MenuIcon name="order" /> {account.isTrial ? "Upgrade to paid plan" : "Renew"}
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
                <th>Status</th>
                <th>Renewal</th>
                <th>Plan</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.cpId}>
                  <td>{account.cpLogin}</td>
                  <td><span className={account.status === "Active" ? "status-pill" : "status-pill muted"}>{account.status}</span></td>
                  <td>{formatDate(account.renewalDate)}</td>
                  <td>{account.webHostType}</td>
                  <td>
                    <div className="website-action-buttons compact-actions">
                      <button className="primary-button compact icon-only-button hosting-manage-button" type="button" onClick={onManageHosting} title="Manage" aria-label="Manage">
                        <MenuIcon name="rocket" />
                      </button>
                      <button
                        className={account.isTrial ? "secondary-button compact icon-only-button trial-upgrade-action-button" : "secondary-button compact icon-only-button"}
                        type="button"
                        disabled={!account.clientProductId || renewalBusyId !== null}
                        title={account.isTrial ? "Upgrade to paid plan" : "Renew"}
                        aria-label={account.isTrial ? "Upgrade to paid plan" : "Renew"}
                        onClick={() => openHostingRenewPromotion(account)}
                      >
                        <MenuIcon name="order" />
                      </button>
                      <button
                        className="secondary-button compact icon-only-button"
                        type="button"
                        onClick={() => openHostingUpgrade(account)}
                        title="Upgrade"
                        aria-label="Upgrade"
                      >
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

function hostingRenewUrl(account, path = "/account/cp_renew", extra = {}) {
  const params = new URLSearchParams();
  if (account?.cpId) params.set("cpId", account.cpId);
  if (account?.clientProductId) params.set("clientProductId", account.clientProductId);
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, value);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function currentRenewParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    cpId: Number(params.get("cpId") || 0),
    clientProductId: Number(params.get("clientProductId") || 0),
    billingTerm: params.get("billingterm") || ""
  };
}

function findHostingAccountForRenewal(accounts, renewParams) {
  return accounts.find((account) => (
    (renewParams.cpId && Number(account.cpId) === renewParams.cpId)
    || (renewParams.clientProductId && Number(account.clientProductId) === renewParams.clientProductId)
  )) ?? accounts[0] ?? null;
}

function CpUpgradeListPage({ embedded = false }) {
  const [account, setAccount] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [targetId, setTargetId] = useState("");
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const renewParams = currentRenewParams();

  useEffect(() => {
    let isMounted = true;

    async function loadUpgradeList() {
      setIsLoading(true);
      setMessage("");
      setCatalog(null);
      setPreview(null);
      setTargetId("");
      try {
        const dashboardResponse = await fetch("/api/account/dashboard");
        const dashboardResult = await dashboardResponse.json().catch(() => null);
        if (!dashboardResponse.ok || !dashboardResult?.success) {
          throw new Error(dashboardResult?.message ?? "Unable to load hosting plans.");
        }

        const selectedAccount = findHostingAccountForRenewal(dashboardResult.dashboard?.hostingAccounts ?? [], renewParams);
        if (!selectedAccount?.cpId) {
          throw new Error("Unable to find the hosting plan for upgrade.");
        }

        const catalogResponse = await fetch(`/api/account/hosting-upgrade/${selectedAccount.cpId}`);
        const catalogResult = await catalogResponse.json().catch(() => null);
        if (!catalogResponse.ok || !catalogResult?.success) {
          throw new Error(catalogResult?.message ?? "Unable to load upgrade options.");
        }

        if (!isMounted) return;
        setAccount(selectedAccount);
        setCatalog(catalogResult.catalog);
        setMessage(catalogResult.catalog?.targets?.length ? "Please choose a plan." : "No upgrade targets were found for this hosting plan.");
      } catch (error) {
        if (isMounted) setMessage(error.message || "Unable to load upgrade options.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUpgradeList();
    return () => {
      isMounted = false;
    };
  }, [renewParams.cpId, renewParams.clientProductId]);

  async function calculateUpgrade(nextTargetId) {
    if (!account?.cpId || !nextTargetId) return;
    setIsCalculating(true);
    setPreview(null);
    setMessage("");
    try {
      const response = await fetch("/api/account/hosting-upgrade/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId: account.cpId, targetProductId: Number(nextTargetId) })
      });
      const result = await response.json().catch(() => null);
      setPreview(result?.preview ?? null);
      setMessage(result?.message ?? "Unable to calculate upgrade price.");
    } catch {
      setMessage("Unable to reach hosting upgrade service.");
    } finally {
      setIsCalculating(false);
    }
  }

  async function createUpgradeCheckout() {
    if (!account?.cpId || !targetId) return;
    setIsBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/hosting-upgrade/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpId: account.cpId, targetProductId: Number(targetId) })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setMessage(result?.message ?? "Unable to create upgrade checkout.");
        return;
      }

      if (goToCheckoutOrder(result.order)) return;
      setMessage("Upgrade checkout order created.");
    } catch {
      setMessage("Unable to reach hosting upgrade checkout.");
    } finally {
      setIsBusy(false);
    }
  }

  const content = (
    <section className="checkout-handoff-card account-embedded-renew-card">
      <span className="status-pill blue">Upgrade Hosting</span>
      <h1>Upgrade Hosting Account</h1>
      <p>Choose an eligible paid hosting plan for this trial account.</p>
      {isLoading && <LoadingState label="Loading upgrade options" />}
      {account && (
        <dl className="card-meta single">
          <div><dt>Hosting Plan</dt><dd>{account.cpLogin}</dd></div>
          <div><dt>Current Plan</dt><dd>{account.webHostType}</dd></div>
          <div><dt>Due Date</dt><dd>{formatDate(account.renewalDate)}</dd></div>
        </dl>
      )}
      {catalog && (
        <div className="hosting-upgrade-grid">
          <div className="upgrade-summary-box">
            <label className="form-label">Upgrade To</label>
            <CustomSelect
              className="hosting-upgrade-target-select"
              value={targetId}
              disabled={isCalculating || isBusy}
              ariaLabel="Upgrade to"
              onChange={(value) => {
                setTargetId(value);
                setPreview(null);
                if (value) {
                  calculateUpgrade(value);
                } else {
                  setMessage("Please choose a plan.");
                }
              }}
              options={[
                { value: "", label: "Please choose a plan" },
                ...(catalog.targets ?? []).map((target) => ({
                  value: target.productId,
                  label: target.description || target.name
                }))
              ]}
            />
            {isCalculating && (
              <p className="inline-help-text loading-help-text">
                <span>Calculating upgrade price...</span>
                <LoadingIcon label="Calculating upgrade price" />
              </p>
            )}
          </div>
        </div>
      )}
      {message && !isCalculating && <p className="renewal-action-message">{message}</p>}
      {preview && !isCalculating && (
        <div className="checkout-preview-card">
          <dl className="card-meta">
            <div><dt>Current Price</dt><dd>{formatMoney(preview.currentPrice, "USD")}</dd></div>
            <div><dt>Target Price</dt><dd>{formatMoney(preview.targetPrice, "USD")}</dd></div>
            <div><dt>Days Left</dt><dd>{preview.daysLeft}</dd></div>
            <div><dt>Total Upgrade</dt><dd>{formatMoney(preview.totalAmount, "USD")}</dd></div>
          </dl>
          <div className="upgrade-action-row">
            <button className="primary-button compact hosting-upgrade-now-button" type="button" disabled={!preview.canCheckout || isBusy} onClick={createUpgradeCheckout}>
              {isBusy ? <LoadingIcon label="Creating checkout" /> : "Upgrade Now"}
            </button>
          </div>
        </div>
      )}
    </section>
  );

  return embedded ? content : (
    <main className="checkout-page account-standalone-page">
      {content}
    </main>
  );
}

function hostingPromotionType(account) {
  const planCode = String(account?.productName || account?.webHostType || account?.description || "").trim().toUpperCase();
  if (planCode.startsWith("W500")) return "upgrade-advance";
  if (planCode.startsWith("W1000")) return "upgrade-premium";
  if (planCode.startsWith("W2") || planCode.startsWith("W1050")) return "renew";
  return "";
}

function CpRenewPromotionPage({ theme, currentUser, onBackToPanel, onToggleTheme, embedded = false }) {
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const renewParams = currentRenewParams();
  const promotionType = hostingPromotionType(account);

  useEffect(() => {
    let isMounted = true;

    async function loadPromotionAccount() {
      setIsLoading(true);
      setMessage("");
      try {
        const response = await fetch("/api/account/dashboard");
        const result = await response.json().catch(() => null);
        if (!isMounted) return;

        if (!response.ok || !result?.success) {
          setMessage(result?.message ?? "Unable to load hosting renewal details.");
          return;
        }

        const selectedAccount = findHostingAccountForRenewal(result.dashboard?.hostingAccounts ?? [], renewParams);
        if (!selectedAccount) {
          setMessage("Unable to find the hosting plan for this renewal.");
          return;
        }

        const type = hostingPromotionType(selectedAccount);
        if (!type) {
          window.location.replace(hostingRenewUrl(selectedAccount, "/account/cp_renew"));
          return;
        }

        setAccount(selectedAccount);
      } catch {
        if (isMounted) setMessage("Unable to reach hosting renewal service.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPromotionAccount();
    return () => {
      isMounted = false;
    };
  }, [renewParams.cpId, renewParams.clientProductId]);

  const renewUrl = account ? hostingRenewUrl(account, "/account/cp_renew") : "/panel?section=hosting";
  const biennialRenewUrl = account ? hostingRenewUrl(account, "/account/cp_renew", { billingterm: "biennially" }) : renewUrl;
  const upgradeUrl = account ? `/panel?section=hosting&upgradeCpId=${encodeURIComponent(account.cpId)}` : "/panel?section=hosting";

  const content = (
    <section className="checkout-handoff-card renew-promotion-card account-embedded-renew-card">
      <span className="status-pill blue">Hosting Renewal</span>
      <h1>Get Automatically Backup For Free!</h1>
      <p>
        Automatically back up your files, databases, and emails. Backup storage and restoration are included with the eligible renewal promotion.
      </p>
      {isLoading && <LoadingState label="Loading renewal promotion" />}
      {message && <p className="renewal-action-message">{message}</p>}
      {account && (
        <div className="renew-promotion-layout">
          <div className="renew-promotion-copy">
            <dl className="card-meta single">
              <div><dt>Hosting Plan</dt><dd>{account.cpLogin}</dd></div>
              <div><dt>Plan Code</dt><dd>{account.webHostType}</dd></div>
              <div><dt>Due Date</dt><dd>{formatDate(account.renewalDate)}</dd></div>
            </dl>

            {promotionType === "renew" && (
              <>
                <p className="renew-promotion-highlight">
                  Receive a 10% discount when you renew for 2 years, along with free Data Backup Service and unlimited free SSL certificates!
                </p>
                <p className="renew-promotion-warning">
                  This is a saving of $24/yr for Data Backup + $53/yr per SSL + 10% off hosting fee.
                </p>
                <div className="renew-promotion-actions">
                  <a className="primary-button as-link" href={biennialRenewUrl}>Renew 2 years and save $100+ now!</a>
                  <a className="secondary-button as-link" href={renewUrl}>No thanks</a>
                </div>
              </>
            )}

            {promotionType === "upgrade-advance" && (
              <>
                <p className="renew-promotion-highlight">
                  Upgrade Basic Plan to Advance Plan or above and get free Data Backup Service and free SSL certificates.
                </p>
                <div className="renew-promotion-actions">
                  <a className="primary-button as-link" href={upgradeUrl}>Upgrade and save $77 now!</a>
                  <a className="secondary-button as-link" href={renewUrl}>No thanks, just renew me</a>
                </div>
              </>
            )}

            {promotionType === "upgrade-premium" && (
              <>
                <p className="renew-promotion-highlight">
                  Upgrade Advance Plan to Premium Plan or above and get free Data Backup Service and free SSL certificates.
                </p>
                <div className="renew-promotion-actions">
                  <a className="primary-button as-link" href={upgradeUrl}>Upgrade and save $77 now!</a>
                  <a className="secondary-button as-link" href={renewUrl}>No thanks, just renew me</a>
                </div>
              </>
            )}
          </div>
          <div className="renew-promotion-visual" aria-hidden="true">
            <MenuIcon name="backup" />
          </div>
        </div>
      )}
    </section>
  );

  return embedded ? content : (
    <main className="checkout-page account-standalone-page">
      <header className="login-header">
        <a className="brand" href="/panel" onClick={onBackToPanel} aria-label="Back to Account Panel">
          <span className="brand-mark"><MenuIcon name="server" /></span>
          <span>Account Panel</span>
        </a>
        <nav className="login-links" aria-label="Renewal navigation">
          {currentUser && <span>{currentUser.login}</span>}
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </nav>
      </header>
      {content}
    </main>
  );
}

function CpRenewPage({ theme, currentUser, onBackToPanel, onToggleTheme, embedded = false }) {
  const [product, setProduct] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const renewParams = currentRenewParams();

  useEffect(() => {
    let isMounted = true;

    async function loadRenewalPage() {
      setBusy(true);
      setMessage("");
      setProduct(null);
      setCatalog(null);
      try {
        const dashboardResponse = await fetch("/api/account/dashboard");
        const dashboardResult = await dashboardResponse.json().catch(() => null);
        if (!dashboardResponse.ok || !dashboardResult?.success) {
          throw new Error(dashboardResult?.message ?? "Unable to load hosting renewal details.");
        }

        const selectedAccount = findHostingAccountForRenewal(dashboardResult.dashboard?.hostingAccounts ?? [], renewParams);
        if (!selectedAccount?.clientProductId) {
          throw new Error("Unable to find the hosting plan for this renewal.");
        }

        const selectedProduct = {
          clientProductId: selectedAccount.clientProductId,
          name: selectedAccount.cpLogin,
          description: selectedAccount.webHostType,
          nextDueDate: selectedAccount.renewalDate,
          paymentTerm: selectedAccount.paymentTerm || ""
        };

        const catalogResponse = await fetch(`/api/account/renewals/${selectedAccount.clientProductId}/options`);
        const catalogResult = await catalogResponse.json().catch(() => null);
        if (!catalogResponse.ok || !catalogResult?.success) {
          throw new Error(catalogResult?.message ?? "Unable to load renewal payment terms.");
        }

        if (!isMounted) return;
        setProduct(selectedProduct);
        setCatalog(catalogResult.catalog);
      } catch (error) {
        if (isMounted) setMessage(error.message || "Unable to load renewal payment terms.");
      } finally {
        if (isMounted) setBusy(false);
      }
    }

    loadRenewalPage();
    return () => {
      isMounted = false;
    };
  }, [renewParams.cpId, renewParams.clientProductId]);

  async function createRenewalCheckout(option) {
    if (!product) return;
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/account/renewals/${product.clientProductId}/checkout-option`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentTerm: option.paymentTerm, currency: option.currency })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setMessage(result?.message ?? "Unable to create renewal checkout.");
        return;
      }

      if (goToCheckoutOrder(result.order)) return;
      setMessage("Renewal checkout order created.");
    } catch {
      setMessage("Unable to reach renewal checkout service.");
    } finally {
      setBusy(false);
    }
  }

  const content = product ? (
    <ProductRenewPage
      product={product}
      catalog={catalog}
      message={message}
      busy={busy}
      initialPaymentTerm={renewParams.billingTerm}
      onBack={() => { window.location.href = hostingRenewUrl(product, "/account/cp_renew_promotion"); }}
      onCheckout={createRenewalCheckout}
    />
  ) : (
    <section className="checkout-handoff-card account-embedded-renew-card">
      <span className="status-pill blue">Product Renew</span>
      <h1>Renew Hosting Plan</h1>
      {busy && <LoadingState label="Loading renewal terms" />}
      {message && <p className="renewal-action-message">{message}</p>}
    </section>
  );

  return embedded ? content : (
    <main className="checkout-page account-standalone-page">
      <header className="login-header">
        <a className="brand" href="/panel" onClick={onBackToPanel} aria-label="Back to Account Panel">
          <span className="brand-mark"><MenuIcon name="server" /></span>
          <span>Account Panel</span>
        </a>
        <nav className="login-links" aria-label="Renewal navigation">
          {currentUser && <span>{currentUser.login}</span>}
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </nav>
      </header>
      {content}
    </main>
  );
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
  forwarding: "support@example.com"
};

function DnsManagementPage({ domain, manager, isLoading, message, recordsPreview, busy, draft, onDraftChange, onBack, onReload, onSubmitAction, domainOptions = [], selectedDomainId = "", onDomainChange = null }) {
  const recordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV"];
  const dnsServers = manager?.dnsServers?.length ? manager.dnsServers : ["NS1.SITE4NOW.NET", "NS2.SITE4NOW.NET", "NS3.SITE4NOW.NET"];
  const rows = (recordsPreview?.length ? recordsPreview : manager?.records ?? [])
    .filter((record) => String(record?.type ?? "").toUpperCase() !== "NS");
  const example = dnsRecordExample(draft.recordType === "TXT" ? "SPF/TXT" : draft.recordType);
  const [editingRecordIndex, setEditingRecordIndex] = useState(null);
  const [editingRecordDraft, setEditingRecordDraft] = useState(null);
  const [isDomainMenuOpen, setIsDomainMenuOpen] = useState(false);
  const [isRecordTypeMenuOpen, setIsRecordTypeMenuOpen] = useState(false);
  const [inlineRecordTypeMenuIndex, setInlineRecordTypeMenuIndex] = useState(null);
  const domainMenuRef = useRef(null);
  const recordTypeMenuRef = useRef(null);
  const inlineRecordTypeMenuRef = useRef(null);
  const sortedDomainOptions = [...domainOptions].sort((left, right) => String(left.label ?? "").localeCompare(String(right.label ?? ""), undefined, { sensitivity: "base" }));
  const selectedDomainOption = sortedDomainOptions.find((option) => String(option.domainUid) === String(selectedDomainId));

  useEffect(() => {
    if (!isDomainMenuOpen) return undefined;

    function closeDomainMenu(event) {
      if (domainMenuRef.current && !domainMenuRef.current.contains(event.target)) {
        setIsDomainMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeDomainMenu);
    return () => document.removeEventListener("mousedown", closeDomainMenu);
  }, [isDomainMenuOpen]);

  useEffect(() => {
    if (!isRecordTypeMenuOpen) return undefined;

    function closeRecordTypeMenu(event) {
      if (recordTypeMenuRef.current && !recordTypeMenuRef.current.contains(event.target)) {
        setIsRecordTypeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeRecordTypeMenu);
    return () => document.removeEventListener("mousedown", closeRecordTypeMenu);
  }, [isRecordTypeMenuOpen]);

  useEffect(() => {
    if (inlineRecordTypeMenuIndex == null) return undefined;

    function closeInlineRecordTypeMenu(event) {
      if (inlineRecordTypeMenuRef.current && !inlineRecordTypeMenuRef.current.contains(event.target)) {
        setInlineRecordTypeMenuIndex(null);
      }
    }

    document.addEventListener("mousedown", closeInlineRecordTypeMenu);
    return () => document.removeEventListener("mousedown", closeInlineRecordTypeMenu);
  }, [inlineRecordTypeMenuIndex]);

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
          <div className="dns-type-menu inline-dns-type-menu" ref={inlineRecordTypeMenuRef}>
            <button
              aria-expanded={inlineRecordTypeMenuIndex === index}
              aria-haspopup="listbox"
              aria-label={label}
              className="dns-type-select dns-record-inline-control"
              type="button"
              onClick={() => setInlineRecordTypeMenuIndex((current) => current === index ? null : index)}
            >
              <span>{editingRecordDraft.recordType === "TXT" ? "SPF/TXT" : editingRecordDraft.recordType}</span>
              <MenuIcon name="chevron-down" />
            </button>
            {inlineRecordTypeMenuIndex === index && (
              <div className="dns-type-options" role="listbox" aria-label={label}>
                {recordTypes.map((type) => (
                  <button
                    aria-selected={editingRecordDraft.recordType === type}
                    className={editingRecordDraft.recordType === type ? "dns-type-option active" : "dns-type-option"}
                    key={type}
                    role="option"
                    type="button"
                    onClick={() => {
                      updateEditingRecord("recordType", type);
                      setInlineRecordTypeMenuIndex(null);
                    }}
                  >
                    {type === "TXT" ? "SPF/TXT" : type}
                  </button>
                ))}
              </div>
            )}
          </div>
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
        {onBack ? (
          <button className="secondary-button compact" type="button" onClick={onBack}>
            <MenuIcon name="back" />
            Back to Domains
          </button>
        ) : <span />}
      </div>
      <div className="database-card-header dns-manager-title">
        <div>
          {!!domainOptions.length && onDomainChange && (
            <div className="dns-domain-select-row" ref={domainMenuRef}>
              <div className="dns-domain-menu">
                <button
                  aria-expanded={isDomainMenuOpen}
                  aria-haspopup="listbox"
                  className="dns-domain-select"
                  type="button"
                  onClick={() => setIsDomainMenuOpen((open) => !open)}
                >
                  <span>{selectedDomainOption?.label ?? domain?.domainName ?? manager?.domainName ?? "Choose domain"}</span>
                  <MenuIcon name="chevron-down" />
                </button>
                {isDomainMenuOpen && (
                  <div className="dns-domain-options" role="listbox" aria-label="Choose DNS domain">
                    {sortedDomainOptions.map((option) => (
                      <button
                        aria-selected={String(option.domainUid) === String(selectedDomainId)}
                        className={String(option.domainUid) === String(selectedDomainId) ? "dns-domain-option active" : "dns-domain-option"}
                        key={option.domainUid}
                        role="option"
                        type="button"
                        onClick={() => {
                          setIsDomainMenuOpen(false);
                          onDomainChange(String(option.domainUid));
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RefreshButton onClick={onReload} />
            </div>
          )}
          <p>Manage DNS records using the same A, AAAA, CNAME, MX, SPF/TXT, and SRV.</p>
        </div>
      </div>

      <section className="dns-server-strip" aria-label="DNS servers">
        {dnsServers.map((server) => (
          <span key={server}>{server}</span>
        ))}
      </section>

      <article className="panel-card knowledge-card dns-kb-card">
        <span className="status-pill muted">KB Article</span>
        <a href="http://www.smarterasp.net/support/kb/a1544/how-to-set-mx-records-for-google-mail.aspx" target="_blank" rel="noreferrer">How to set MX records for Google Mail</a>
      </article>

      {isLoading && <LoadingState label="Loading DNS manager" />}
      {message && <p className="renewal-action-message">{message}</p>}

      <article className="panel-card dns-record-draft-card flush-card">
        <form className="advance-inline-form dns-management-form" onSubmit={(event) => submit(event, "add")}>
          <label>
            Type
            <div className="dns-type-menu" ref={recordTypeMenuRef}>
              <button
                aria-expanded={isRecordTypeMenuOpen}
                aria-haspopup="listbox"
                className="dns-type-select"
                type="button"
                onClick={() => setIsRecordTypeMenuOpen((open) => !open)}
              >
                <span>{draft.recordType === "TXT" ? "SPF/TXT" : draft.recordType}</span>
                <MenuIcon name="chevron-down" />
              </button>
              {isRecordTypeMenuOpen && (
                <div className="dns-type-options" role="listbox" aria-label="Choose DNS record type">
                  {recordTypes.map((type) => (
                    <button
                      aria-selected={draft.recordType === type}
                      className={draft.recordType === type ? "dns-type-option active" : "dns-type-option"}
                      key={type}
                      role="option"
                      type="button"
                      onClick={() => {
                        updateDraft("recordType", type);
                        setIsRecordTypeMenuOpen(false);
                      }}
                    >
                      {type === "TXT" ? "SPF/TXT" : type}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
      const response = await fetch(`/api/account/domains/${selectedDomain.id}/registrar-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(domainRegistrarForm)
      });
      const result = await response.json().catch(() => null);
      setDomainActionMessage(result?.message ?? "Unable to prepare registrar action.");
      setDomainActionUrl(result?.actionUrl ?? "");
    } catch {
      setDomainActionMessage("Unable to reach registrar action service.");
    } finally {
      setIsDomainActionBusy(false);
    }
  }

  function selectDomainRegistrarAction(action) {
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
      value: action === "contact"
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

  function domainContactTypeForTab(tab) {
    return {
      registrant: "owner",
      admin: "admin",
      billing: "billing",
      technical: "tech"
    }[tab] ?? "owner";
  }

  function contactValueFromProfile(contact, tab = activeDomainContactTab) {
    return [
      `contact_type=${domainContactTypeForTab(tab)}`,
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
      value: contactValueFromProfile(contact, tab)
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
                            aria-label={privacyLabel}
                            className={domain.whoisPrivacySupported ? "domain-privacy-toggle" : "domain-privacy-toggle disabled"}
                            disabled={privacyDisabled}
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
                            aria-label={lockEnabled ? "Domain Locked" : "Domain Unlocked"}
                            className="domain-privacy-toggle domain-lock-toggle"
                            disabled={lockDisabled}
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
                                className="secondary-button compact icon-only-button domain-row-action-button"
                                disabled={isDomainActionBusy}
                                type="button"
                                onClick={() => renewSelectedDomain(domain)}
                              >
                                <MenuIcon name="order" />
                              </button>
                            )}
                            {canManageDns && (
                              <button
                                aria-label="DNS Manager"
                                className="secondary-button compact icon-only-button domain-row-action-button"
                                type="button"
                                onClick={() => openDomainDnsManager(domain)}
                              >
                                DNS
                              </button>
                            )}
                            {canManage && (
                              <button
                                aria-label="Manage"
                                className="secondary-button compact icon-only-button domain-row-action-button manage"
                                type="button"
                                onClick={() => openDomainSettings(domain)}
                              >
                                Manage
                              </button>
                            )}
                            {!canManage && domain.transferActionLabel && (
                              <button
                                aria-label={domain.transferActionLabel}
                                className="secondary-button compact domain-transfer-action"
                                type="button"
                                onClick={() => {
                                  setSelectedDomain(domain);
                                  setDomainActionDomainId(domain.id);
                                  setDomainActionUrl("");
                                  setDomainActionMessage(`${domain.transferActionLabel}: ${domain.transferActionUrl || "Transfer action"}`);
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
              <CustomSelect
                className="inline-select"
                value={vpnUserForm.type}
                ariaLabel="VPN type"
                onChange={(value) => setVpnUserForm((form) => ({ ...form, type: value }))}
                options={[
                  { value: "IKEv2", label: "IKEv2" },
                  { value: "OpenVPN", label: "OpenVPN" }
                ]}
              />
            </label>
            <label>
              Location
              <CustomSelect
                className="inline-select"
                value={vpnUserForm.area}
                ariaLabel="VPN location"
                onChange={(value) => setVpnUserForm((form) => ({ ...form, area: value }))}
                options={[
                  { value: "US", label: "US" },
                  { value: "EU", label: "EU" },
                  { value: "Asia", label: "Asia" }
                ]}
              />
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
                <CustomSelect
                  className="inline-select"
                  value={selectedVpnProduct?.productId ?? ""}
                  ariaLabel="VPN product"
                  onChange={(value) => setVpnSelection({ productId: Number(value), quantity: vpnSelection.quantity ?? 1 })}
                  options={vpnCatalog.map((product) => ({ value: product.productId, label: product.name }))}
                />
              </label>
              <label>
                Billing
                <CustomSelect
                  className="inline-select"
                  value={selectedVpnPrice?.priceId ?? ""}
                  ariaLabel="VPN billing"
                  onChange={(value) => setVpnSelection((selection) => ({ ...selection, priceId: Number(value) }))}
                  options={(selectedVpnProduct?.prices ?? []).map((price) => ({
                    value: price.priceId,
                    label: formatVpnPriceOption(price)
                  }))}
                />
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
                <CustomSelect
                  className="inline-select"
                  aria-label={`${addon.name} billing term`}
                  value={selection.priceId ?? ""}
                  ariaLabel={`${addon.name} billing term`}
                  onChange={(value) => updateAddonSelection(addon.productId, { priceId: Number(value) })}
                  options={addon.prices.length ? addon.prices.map((price) => ({
                    value: price.priceId,
                    label: `${formatPaymentTerm(price.paymentTerm)} ${formatMoney(price.amount, price.currency)}`
                  })) : [{ value: "", label: "No price available", disabled: true }]}
                />,
                <CustomSelect
                  className="inline-select"
                  aria-label={`${addon.name} target hosting account`}
                  value={selection.cpId}
                  ariaLabel={`${addon.name} target hosting account`}
                  onChange={(value) => updateAddonSelection(addon.productId, { cpId: value })}
                  options={[
                    { value: "", label: "No hosting target" },
                    ...addonHostingAccounts.map((account) => ({
                      value: account.cpId,
                      label: account.cpLogin || account.primaryDomain || `CP ${account.cpId}`
                    }))
                  ]}
                />,
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
      start: "2000-01-01",
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

function ProductRenewPage({ product, catalog, message, busy, initialPaymentTerm = "", onBack, onCheckout }) {
  const [selectedKey, setSelectedKey] = useState("");
  const options = catalog?.options ?? [];
  const selectedOption = options.find((option) => renewalOptionKey(option) === selectedKey);

  useEffect(() => {
    if (!initialPaymentTerm || !options.length) {
      setSelectedKey("");
      return;
    }

    const targetTerm = normalizeRenewalPaymentTerm(initialPaymentTerm);
    const match = options.find((option) => normalizeRenewalPaymentTerm(option.paymentTerm) === targetTerm);
    setSelectedKey(match ? renewalOptionKey(match) : "");
  }, [product?.clientProductId, initialPaymentTerm, options.length]);

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
          {product.paymentTerm && <div><dt>Current Term</dt><dd>{formatPaymentTerm(product.paymentTerm)}</dd></div>}
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
              <CustomSelect
                value={selectedKey}
                ariaLabel="Payment terms"
                className="payment-term-select"
                menuWidth="trigger"
                onChange={(value) => setSelectedKey(value)}
                options={[
                  { value: "", label: "Please choose a payment term" },
                  ...options.map((option) => ({
                    value: renewalOptionKey(option),
                    label: renewalOptionLabel(catalog, option)
                  }))
                ]}
              />
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

function normalizeRenewalPaymentTerm(term) {
  const value = String(term ?? "").trim().toLowerCase();
  const aliases = {
    monthly: "1m",
    quarterly: "3m",
    semiannually: "6m",
    semiannuallyly: "6m",
    annually: "1y",
    biennially: "2y",
    triennially: "3y",
    "1 month": "1m",
    "3 months": "3m",
    "6 months": "6m",
    "1 year": "1y",
    "2 years": "2y",
    "3 years": "3y"
  };
  return aliases[value] ?? value;
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

function plainHelpdeskText(html) {
  if (!html) return "";
  const withBreaks = String(html)
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "");

  if (typeof document === "undefined") {
    return withBreaks
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = withBreaks;
  return textarea.value;
}

function HelpdeskMessageBody({ html }) {
  const text = plainHelpdeskText(html);
  const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) nodes.push(before);

    const rawUrl = match[0].replace(/[),.;]+$/g, "");
    const trailing = match[0].slice(rawUrl.length);
    nodes.push(
      <a href={rawUrl} key={`${rawUrl}-${match.index}`} target="_blank" rel="noreferrer">
        {rawUrl}
      </a>
    );
    if (trailing) nodes.push(trailing);
    lastIndex = match.index + match[0].length;
  }

  const after = text.slice(lastIndex);
  if (after) nodes.push(after);

  return <div className="helpdesk-message-body">{nodes}</div>;
}

function defaultPasswordSyncTargets(accounts = []) {
  return accounts
    .filter((account) => account?.status === "Active")
    .flatMap((account) => {
      const targets = [`cp_${account.cpId}`];
      if (!(account.webHostType || "").includes("LX")) {
        targets.push(`ftp_${account.cpId}`, `iis_${account.cpId}`);
      }
      return targets;
    });
}

function HelpdeskSection() {
  const [dashboard, setDashboard] = useState(null);
  const [form, setForm] = useState(null);
  const [activeTab, setActiveTab] = useState("my");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isReadingTicket, setIsReadingTicket] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const [isReplying, setIsReplying] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isClosingTicket, setIsClosingTicket] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ticketFiles, setTicketFiles] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    email: "",
    url: "",
    description: ""
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
      const formData = new FormData();
      formData.set("subject", ticketForm.subject);
      formData.set("email", ticketForm.email);
      formData.set("url", ticketForm.url);
      formData.set("description", ticketForm.description);
      ticketFiles.forEach((file) => formData.append("files", file));
      const response = await fetch("/api/account/helpdesk/tickets", {
        method: "POST",
        body: formData
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
        description: ""
      }));
      setTicketFiles([]);
      setIsCreating(false);
      await loadHelpdesk();
    } catch {
      setError("Unable to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openTicket(callId) {
    setIsReadingTicket(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/account/helpdesk/tickets/${callId}`);
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.message ?? "Unable to load ticket.");
        return;
      }

      setSelectedTicket(result.ticket);
      setReplyText("");
      setReplyFiles([]);
    } catch {
      setError("Unable to load ticket.");
    } finally {
      setIsReadingTicket(false);
    }
  }

  async function submitReply(event) {
    event.preventDefault();
    if (!selectedTicket?.summary?.callId) return;
    setIsReplying(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.set("description", replyText);
      replyFiles.forEach((file) => formData.append("files", file));
      const response = await fetch(`/api/account/helpdesk/tickets/${selectedTicket.summary.callId}/reply`, {
        method: "POST",
        body: formData
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.message ?? "Unable to submit reply.");
        return;
      }

      setSelectedTicket(result.ticket);
      setReplyText("");
      setReplyFiles([]);
      setMessage(result.message ?? "Reply submitted.");
      await loadHelpdesk();
    } catch {
      setError("Unable to submit reply.");
    } finally {
      setIsReplying(false);
    }
  }

  async function closeTicket() {
    if (!selectedTicket?.summary?.callId) return;
    setIsClosingTicket(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/account/helpdesk/tickets/${selectedTicket.summary.callId}/close`, {
        method: "POST"
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.message ?? "Unable to close ticket.");
        return;
      }

      setIsCloseConfirmOpen(false);
      setSelectedTicket(null);
      setMessage(result.message ?? "Ticket marked as resolved.");
      await loadHelpdesk();
    } catch {
      setError("Unable to close ticket.");
    } finally {
      setIsClosingTicket(false);
    }
  }

  function chooseTicketFiles(input) {
    const files = input?.target?.files ?? input;
    setTicketFiles(normalizeHelpdeskFiles(files));
    if (input?.target) input.target.value = "";
  }

  function chooseReplyFiles(input) {
    const files = input?.target?.files ?? input;
    setReplyFiles(normalizeHelpdeskFiles(files));
    if (input?.target) input.target.value = "";
  }

  function removeTicketFile(indexToRemove) {
    setTicketFiles((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function removeReplyFile(indexToRemove) {
    setReplyFiles((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function switchHelpdeskTab(tab) {
    setTicketFiles([]);
    setActiveTab(tab);
    setIsCreating(false);
  }

  function closeCreateTicketPanel() {
    setTicketFiles([]);
    setIsCreating(false);
  }

  return (
    <section className="helpdesk-section">
      <div className="helpdesk-toolbar">
        <div className="tabs" role="tablist" aria-label="Helpdesk tickets" onMouseDownCapture={closeCreateTicketPanel} onClickCapture={closeCreateTicketPanel}>
          <button className={activeTab === "my" ? "tab active" : "tab"} type="button" role="tab" aria-selected={activeTab === "my"} onPointerDown={closeCreateTicketPanel} onClick={() => switchHelpdeskTab("my")}>
            <MenuIcon name="ticket" />
            <span>My Tickets</span>
          </button>
          <button className={activeTab === "closed" ? "tab active" : "tab"} type="button" role="tab" aria-selected={activeTab === "closed"} onPointerDown={closeCreateTicketPanel} onClick={() => switchHelpdeskTab("closed")}>
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
              <textarea className="helpdesk-large-textarea" value={ticketForm.description} onChange={(event) => setTicketForm((current) => ({ ...current, description: event.target.value }))} rows={18} required />
            </label>
            <HelpdeskDropZone files={ticketFiles} onChange={chooseTicketFiles} onRemove={removeTicketFile} />

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
      {!isCreating && message && <p className="renewal-action-message success">{message}</p>}

      {isLoading && <LoadingState label="Loading helpdesk tickets" />}
      {dashboard && (
        <article className="panel-card helpdesk-ticket-panel">
          <HelpdeskTicketTable
            tickets={activeTab === "my" ? dashboard.openTickets ?? [] : dashboard.closedTickets ?? []}
            emptyText={activeTab === "my" ? "No current tickets." : "No closed tickets."}
            mode={activeTab}
            onOpen={openTicket}
          />
        </article>
      )}
      {dashboard?.user?.username && (
        <div className="helpdesk-user-indicator" aria-label="Current Helpdesk username">
          <span>Helpdesk user</span>
          <strong>{dashboard.user.username}</strong>
        </div>
      )}
      {isReadingTicket && <LoadingState label="Loading ticket" />}
      {selectedTicket && (
        <article className="panel-card helpdesk-ticket-detail">
          <div className="function-drawer-header">
            <div>
              <span className="eyebrow">Ticket #{selectedTicket.summary.callId}</span>
              <h2>{selectedTicket.summary.subject}</h2>
              <p>{selectedTicket.url || "No domain provided"} · {formatDateTime(selectedTicket.summary.enterDate)}</p>
            </div>
            {!selectedTicket.summary.closeDate && (
              <button className="danger-button compact" type="button" onClick={() => setIsCloseConfirmOpen(true)}>Mark Ticket as Resolved (Close)</button>
            )}
          </div>
          <div className="helpdesk-message">
            <strong>Original Request</strong>
            <HelpdeskMessageBody html={selectedTicket.description} />
          </div>
          <div className="helpdesk-note-list">
            {(selectedTicket.notes ?? []).map((note) => (
              <div className={`helpdesk-note ${note.authorType}`} key={note.noteId || `${note.enterDate}-${note.authorName}`}>
                <div>
                  <strong>{note.authorName || (note.authorType === "staff" ? "Support" : selectedTicket.user?.username)}</strong>
                  <span>{formatDateTime(note.enterDate)}</span>
                </div>
                <HelpdeskMessageBody html={note.comment} />
              </div>
            ))}
          </div>
          {!selectedTicket.summary.closeDate && (
            <form className="helpdesk-form" onSubmit={submitReply}>
              <label>
                Reply
                <textarea className="helpdesk-large-textarea" value={replyText} onChange={(event) => setReplyText(event.target.value)} rows={15} required={replyFiles.length === 0} />
              </label>
              <HelpdeskDropZone files={replyFiles} onChange={chooseReplyFiles} onRemove={removeReplyFile} compact />
              <div className="form-actions right">
                <button className="primary-button compact" type="submit" disabled={isReplying}>
                  {isReplying ? <LoadingIcon label="Submitting reply" /> : "Submit Reply"}
                </button>
              </div>
            </form>
          )}
        </article>
      )}
      {isCloseConfirmOpen && selectedTicket && (
        <div className="modal-backdrop" role="presentation">
          <section className="panel-card confirm-modal" role="dialog" aria-modal="true" aria-labelledby="close-ticket-title">
            <h2 id="close-ticket-title">Mark ticket as resolved?</h2>
            <p>This will close ticket #{selectedTicket.summary.callId}. You can still view it in Closed Tickets after it is marked resolved.</p>
            <div className="confirm-actions">
              <button className="secondary-button compact" type="button" disabled={isClosingTicket} onClick={() => setIsCloseConfirmOpen(false)}>No</button>
              <button className="danger-button compact" type="button" disabled={isClosingTicket} onClick={closeTicket}>
                {isClosingTicket ? <LoadingIcon label="Closing ticket" /> : "Yes, Close Ticket"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function helpdeskStatusInfo(ticket) {
  const state = String(ticket.state ?? "").toLowerCase();
  const staffReplied = ticket.replyCount > 0 && !state.includes("pending") && !state.includes("q");
  return staffReplied
    ? { label: "Staff Replied", tone: "staff" }
    : { label: "Waiting for Staff", tone: "waiting" };
}

function normalizeHelpdeskFiles(files) {
  return Array.from(files ?? []).slice(0, 5);
}

function formatHelpdeskFileSize(size) {
  if (!Number.isFinite(size)) return "";
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${size} B`;
}

function HelpdeskDropZone({ files, onChange, onRemove, compact = false }) {
  const inputId = useMemo(() => `helpdesk-upload-${Math.random().toString(36).slice(2)}`, []);
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    onChange(event.dataTransfer.files);
  }

  return (
    <section className={["helpdesk-dropzone-wrap", compact ? "compact" : ""].filter(Boolean).join(" ")}>
      <span className="helpdesk-dropzone-label">Attachments</span>
      <label
        className={["helpdesk-dropzone", isDragging ? "dragging" : ""].filter(Boolean).join(" ")}
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="helpdesk-dropzone-icon" aria-hidden="true"><MenuIcon name="upload" /></span>
        <span className="helpdesk-dropzone-copy">
          <strong>Drop files here or click to browse</strong>
          <small>Images, Word, PDF, Excel, or CSV. Up to 5 files, 5MB each.</small>
        </span>
        <input
          id={inputId}
          className="helpdesk-dropzone-input"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.doc,.docx,.pdf,.xls,.xlsx,.csv"
          onChange={onChange}
        />
      </label>
      {files.length > 0 && (
        <div className="helpdesk-file-list" aria-label="Selected attachments">
          {files.map((file, index) => (
            <span className="helpdesk-file-chip" key={`${file.name}-${file.size}-${index}`}>
              <MenuIcon name="file" />
              <span>{file.name}</span>
              <small>{formatHelpdeskFileSize(file.size)}</small>
              <button type="button" onClick={() => onRemove(index)} aria-label={`Remove ${file.name}`}>×</button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function HelpdeskTicketTable({ tickets, emptyText, mode = "my", onOpen }) {
  if (mode === "closed") {
    return tickets.length ? (
      <DataTable
        columns={["Username", "Ticket ID", "Priority", "Subject", "Closed Time"]}
        rows={tickets.map((ticket) => [
          ticket.username || "--",
          <button className="table-link-button" type="button" onClick={() => onOpen?.(ticket.callId)}>{ticket.callId}</button>,
          ticket.priority,
          <button className="table-link-button" type="button" onClick={() => onOpen?.(ticket.callId)}>{ticket.subject}</button>,
          formatDateTime(ticket.closeDate)
        ])}
      />
    ) : (
      <p className="empty-text">{emptyText}</p>
    );
  }

  return tickets.length ? (
    <DataTable
      columns={["Username", "Ticket ID", "Priority", "Subject", "Created Time", "Status"]}
      rows={tickets.map((ticket) => {
        const status = helpdeskStatusInfo(ticket);
        return [
          ticket.username || "--",
          <button className="table-link-button" type="button" onClick={() => onOpen?.(ticket.callId)}>{ticket.callId}</button>,
          `Priority${ticket.priority}`,
          <button className="table-link-button" type="button" onClick={() => onOpen?.(ticket.callId)}>{ticket.subject}</button>,
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
  const [mobileForm, setMobileForm] = useState({ countryCode: "", mobileNumber: "", pin: "" });
  const [mobileMessage, setMobileMessage] = useState("");
  const [isSendingMobilePin, setIsSendingMobilePin] = useState(false);
  const [isVerifyingMobilePin, setIsVerifyingMobilePin] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSyncTargets, setPasswordSyncTargets] = useState([]);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [isUpdatingTwoFactor, setIsUpdatingTwoFactor] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [settingsEditor, setSettingsEditor] = useState("");

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
      setPasswordSyncTargets(defaultPasswordSyncTargets(result.dashboard?.hostingAccounts));
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

  function togglePasswordSyncTarget(target, isChecked) {
    setPasswordSyncTargets((current) => {
      const next = new Set(current);
      if (isChecked) {
        next.add(target);
      } else {
        next.delete(target);
      }
      return Array.from(next);
    });
  }

  function toggleAllPasswordSyncTargets(isChecked) {
    setPasswordSyncTargets(isChecked ? defaultPasswordSyncTargets(settings?.hostingAccounts) : []);
  }

  function updateProfileField(field, value) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  function updateMobileField(field, value) {
    setMobileForm((current) => ({ ...current, [field]: value }));
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
        body: JSON.stringify({ ...passwordForm, syncTargets: passwordSyncTargets })
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

  async function sendMobilePin(event) {
    event.preventDefault();
    setIsSendingMobilePin(true);
    setMobileMessage("");

    try {
      const response = await fetch("/api/account/settings/mobile/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: mobileForm.countryCode,
          mobileNumber: mobileForm.mobileNumber
        })
      });
      const result = await response.json().catch(() => null);
      setMobileMessage(result?.message ?? "Unable to send SMS PIN.");
    } catch {
      setMobileMessage("Unable to reach SMS verification service.");
    } finally {
      setIsSendingMobilePin(false);
    }
  }

  async function verifyMobilePin(event) {
    event.preventDefault();
    setIsVerifyingMobilePin(true);
    setMobileMessage("");

    try {
      const response = await fetch("/api/account/settings/mobile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: mobileForm.countryCode,
          mobileNumber: mobileForm.mobileNumber,
          pin: mobileForm.pin
        })
      });
      const result = await response.json().catch(() => null);
      setMobileMessage(result?.message ?? "Unable to verify SMS PIN.");
      if (response.ok && result?.success) {
        setSettings(result.dashboard);
        setProfileForm(profileFormFromSettings(result.dashboard?.profile));
        setMobileForm((current) => ({ ...current, pin: "" }));
      }
    } catch {
      setMobileMessage("Unable to reach SMS verification service.");
    } finally {
      setIsVerifyingMobilePin(false);
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
  const staffAccess = settings?.staffAccess;
  const isStaffAutoLogin = Boolean(staffAccess?.isStaffAutoLogin);
  const canEditProfile = staffAccess?.canEditCustomerProfile !== false;
  const canChangeEmail = staffAccess?.canChangeCustomerEmail !== false;
  const canChangeMobile = !isStaffAutoLogin;
  const canChangeTwoFactor = staffAccess?.canChangeCustomerTwoFactor !== false;
  const canChangePassword = staffAccess?.canChangeCustomerPassword !== false;
  const activeHostingAccounts = (settings?.hostingAccounts ?? []).filter((account) => account.status === "Active");
  const availablePasswordSyncTargets = defaultPasswordSyncTargets(activeHostingAccounts);
  const isEveryPasswordSyncTargetChecked = availablePasswordSyncTargets.length > 0
    && availablePasswordSyncTargets.every((target) => passwordSyncTargets.includes(target));

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
              <div className="settings-info-heading">
                <span className="status-pill">Profile</span>
                {canEditProfile && (
                  <button className="settings-edit-button" type="button" title="Edit Profile" aria-label="Edit Profile" onClick={() => setSettingsEditor((current) => current === "profile" ? "" : "profile")}>
                    <MenuIcon name="edit" />
                  </button>
                )}
              </div>
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
                <div>
                  <dt>Email</dt>
                  <dd className="settings-inline-action">
                    <span>{profile.emailDisplay || "Stored securely"}</span>
                    {canChangeEmail && (
                      <button className="settings-edit-button" type="button" title="Edit Email Address" aria-label="Edit Email Address" onClick={() => setSettingsEditor((current) => current === "email" ? "" : "email")}>
                        <MenuIcon name="edit" />
                      </button>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Mobile</dt>
                  <dd className="settings-inline-action">
                    <span>{profile.mobileNumber || "N/A"}</span>
                    {canChangeMobile && (
                      <button className="settings-edit-button" type="button" title="Verify Mobile Number" aria-label="Verify Mobile Number" onClick={() => setSettingsEditor((current) => current === "mobile" ? "" : "mobile")}>
                        <MenuIcon name="edit" />
                      </button>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>2FA Status</dt>
                  <dd className="settings-inline-action">
                    <span>{twoFactor?.isEnabled ? "Enabled" : "Disabled"}</span>
                    {canChangeTwoFactor && (
                      <button className="settings-edit-button" type="button" title="Edit 2FA Status" aria-label="Edit 2FA Status" onClick={() => setSettingsEditor((current) => current === "twoFactor" ? "" : "twoFactor")}>
                        <MenuIcon name="edit" />
                      </button>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Password</dt>
                  <dd className="settings-inline-action">
                    <span>********</span>
                    {canChangePassword && (
                      <button className="settings-edit-button" type="button" title="Change Password" aria-label="Change Password" onClick={() => setSettingsEditor((current) => current === "password" ? "" : "password")}>
                        <MenuIcon name="edit" />
                      </button>
                    )}
                  </dd>
                </div>
                <div><dt>2FA Created</dt><dd>{formatDate(twoFactor?.enterDate)}</dd></div>
              </dl>
            </article>
          </div>
        )}
        {isStaffAutoLogin && (
          <div className="settings-staff-notice">
            Staff auto-login is view-only for customer profile, email, mobile, password, and 2FA changes.
          </div>
        )}
      </article>

      {settingsEditor && <div className="function-drawer-backdrop" role="presentation" onMouseDown={(event) => {
        if (event.target === event.currentTarget) setSettingsEditor("");
      }}>
        <aside className="function-drawer panel-card settings-drawer" role="dialog" aria-modal="true" aria-label="Account settings editor">
          <header className="function-drawer-header">
            <div>
              <span className="status-pill blue">Settings</span>
              <h2>{settingsEditorTitle(settingsEditor)}</h2>
              <p>{settingsEditorDescription(settingsEditor)}</p>
            </div>
            <div className="function-drawer-actions">
              <button className="secondary-button compact icon-only-button drawer-close-button" type="button" onClick={() => setSettingsEditor("")} aria-label="Close">
                <MenuIcon name="x" />
              </button>
            </div>
          </header>

          {settingsEditor === "profile" && <article className="panel-card profile-card settings-drawer-card">
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
          </article>}

          {settingsEditor === "email" && <article className="panel-card password-card settings-drawer-card">
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
          </article>}

          {settingsEditor === "mobile" && <article className="panel-card password-card settings-drawer-card">
            <div>
              <span className="status-pill blue">Mobile</span>
              <h2>Verify Mobile Number</h2>
              <p>Send a one-time PIN to verify this mobile number.</p>
            </div>
            <form className="settings-form" onSubmit={sendMobilePin}>
              <label>
                Country Code
                <input
                  type="text"
                  value={mobileForm.countryCode}
                  onChange={(event) => updateMobileField("countryCode", event.target.value)}
                />
              </label>
              <label>
                Mobile Number
                <input
                  type="tel"
                  value={mobileForm.mobileNumber}
                  onChange={(event) => updateMobileField("mobileNumber", event.target.value)}
                />
              </label>
              <button className="primary-button compact" type="submit" disabled={isSendingMobilePin || !mobileForm.mobileNumber.trim()}>
                {isSendingMobilePin ? <LoadingIcon label="Sending SMS PIN" /> : "Send PIN"}
              </button>
            </form>
            <form className="settings-form" onSubmit={verifyMobilePin}>
              <label>
                PIN
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={mobileForm.pin}
                  onChange={(event) => updateMobileField("pin", event.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </label>
              <button className="primary-button compact" type="submit" disabled={isVerifyingMobilePin || mobileForm.pin.length !== 4}>
                {isVerifyingMobilePin ? <LoadingIcon label="Verifying SMS PIN" /> : "Verify PIN"}
              </button>
            </form>
            {mobileMessage && <p className="renewal-action-message">{mobileMessage}</p>}
          </article>}

          {settingsEditor === "twoFactor" && <article className="panel-card password-card settings-drawer-card">
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
          </article>}

          {settingsEditor === "password" && <article className="panel-card password-card settings-drawer-card">
            <div>
              <span className="status-pill blue">Password</span>
              <h2>Change Account Password</h2>
              <p>This updates the main account login password and can sync selected hosting passwords.</p>
            </div>
            <form className="settings-form password-change-form" onSubmit={changePassword}>
              <div className="password-change-fields">
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
              </div>
              <div className="password-sync-panel">
                <div className="password-sync-heading">
                  <span>Password Sync To (Suggested):</span>
                  {activeHostingAccounts.length > 0 && (
                    <label className="checkbox-row compact">
                      <input
                        type="checkbox"
                        checked={isEveryPasswordSyncTargetChecked}
                        onChange={(event) => toggleAllPasswordSyncTargets(event.target.checked)}
                      />
                      Check All
                    </label>
                  )}
                </div>
                {activeHostingAccounts.length > 0 ? (
                  <div className="password-sync-list">
                    {activeHostingAccounts.map((account) => {
                      const isLinux = (account.webHostType || "").includes("LX");
                      return (
                        <div className="password-sync-group" key={account.cpId}>
                          <label className="checkbox-row">
                            <input
                              type="checkbox"
                              checked={passwordSyncTargets.includes(`cp_${account.cpId}`)}
                              onChange={(event) => togglePasswordSyncTarget(`cp_${account.cpId}`, event.target.checked)}
                            />
                            <span>"{account.cpLogin}" account password</span>
                          </label>
                          {!isLinux && (
                            <>
                              <label className="checkbox-row">
                                <input
                                  type="checkbox"
                                  checked={passwordSyncTargets.includes(`ftp_${account.cpId}`)}
                                  onChange={(event) => togglePasswordSyncTarget(`ftp_${account.cpId}`, event.target.checked)}
                                />
                                <span>"{account.cpLogin}" FTP password</span>
                              </label>
                              <label className="checkbox-row">
                                <input
                                  type="checkbox"
                                  checked={passwordSyncTargets.includes(`iis_${account.cpId}`)}
                                  onChange={(event) => togglePasswordSyncTarget(`iis_${account.cpId}`, event.target.checked)}
                                />
                                <span>"{account.cpLogin}" WebDeploy / Remote IIS password</span>
                              </label>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="settings-helper-text">No active hosting plans were found for password sync.</p>
                )}
              </div>
            </form>
            {passwordMessage && <p className="renewal-action-message">{passwordMessage}</p>}
          </article>}
        </aside>
      </div>}
      <KnowledgeBaseCard title="Security App Guides" articles={securityGuideArticles} badge="2FA Guides" />
    </section>
  );
}

function settingsEditorTitle(editor) {
  return {
    profile: "Edit Profile",
    email: "Change Email",
    mobile: "Verify Mobile",
    twoFactor: "Two-Factor Authentication",
    password: "Change Password"
  }[editor] ?? "Account Settings";
}

function settingsEditorDescription(editor) {
  return {
    profile: "Update account profile, contact, and billing information.",
    email: "Create a verification request for a new account email.",
    mobile: "Send and confirm an SMS PIN before saving the mobile number.",
    twoFactor: "Set up or disable authenticator-based login protection.",
    password: "Update the account password and sync selected hosting credentials."
  }[editor] ?? "Update account settings.";
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
  const [inviteCopied, setInviteCopied] = useState("");
  const activeBanner = banners.find((banner) => banner.size === activeBannerSize) ?? banners[0];
  const referralUrl = `https://www.${brandDomain}/index?r=${encodeURIComponent(referralCode)}`;
  const referralIdUrl = referralCustomerId ? `https://www.${brandDomain}/index?r=${encodeURIComponent(referralCustomerId)}` : "";

  async function copyActiveBanner() {
    if (await writeTextToClipboard(activeBanner.code)) {
      setCopiedBanner(activeBanner.size);
      window.setTimeout(() => setCopiedBanner(""), 1600);
    } else {
      setCopiedBanner("failed");
      window.setTimeout(() => setCopiedBanner(""), 1600);
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
