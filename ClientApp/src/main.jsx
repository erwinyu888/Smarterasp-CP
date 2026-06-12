import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const hostingAccounts = [
  {
    hosting_account_name: "sample.com",
    siteHosted: "Total: 30 sites",
    renewal: "Aug 14, 2026",
    planName: "Starter"
  },
  {
    hosting_account_name: "clientportal.io Business",
    siteHosted: "ATotal: 3 sites",
    renewal: "Nov 02, 2026",
    planName: "Business"
  },
  {
    hosting_account_name: "staging-controlpanel.dev",
    siteHosted: "Total: 11 sites",
    renewal: "Jan 18, 2027",
    planName: "Preview"
  }
];

const renewalNotices = [
  {
    name: "sample.com",
    renewal: "Aug 14, 2026",
    daysLeft: 64,
    status: "Renew soon"
  },
  {
    name: "controlpaneldemo.com",
    renewal: "Sep 20, 2026",
    daysLeft: 101,
    status: "Upcoming"
  },
  {
    name: "SSL-S Certificate",
    renewal: "Jul 15, 2026",
    daysLeft: 34,
    status: "Action needed"
  }
];

const domains = [
  { name: "controlpaneldemo.com", status: "Active", renewal: "Sep 20, 2026" },
  { name: "myhostingaccount.net", status: "Active", renewal: "Dec 04, 2026" },
  { name: "sample-client.org", status: "Renew soon", renewal: "Jul 15, 2026" }
];

const vpnServices = [
  {
    name: "VPN Business Seat",
    details: "5 users, Asia gateway",
    billing: "Monthly billing",
    price: "$24/mo"
  },
  {
    name: "VPN Dedicated IP",
    details: "1 dedicated IP, US gateway",
    billing: "Annual billing",
    price: "$99/yr"
  }
];

const addons = [
  {
    name: "SSL-S",
    description: "Comodo SSL Certificate - Single Domain or Subdomain",
    terms: "1 Year $29",
    qty: 1
  },
  {
    name: "SSL-W",
    description: "Comodo SSL Certificate - Multiple Subdomains (*.yourdomain.com)",
    terms: "1 Year $169",
    qty: 1
  },
  {
    name: "SSL-M",
    description: "Comodo SSL Certificate - Multiple Domains (3 domains included)",
    terms: "1 Year $59",
    qty: 1
  },
  {
    name: "SSL-E",
    description: "Comodo SSL Certificate - Extended Validation (Companies and Organizations)",
    terms: "1 Year $199",
    qty: 1
  }
];

const sections = [
  { id: "hosting", label: "Hosting Plans", stat: "12", icon: "server" },
  { id: "domain", label: "Domain", stat: "8", icon: "globe" },
  { id: "vpn", label: "VPN", stat: "2", icon: "shield" },
  { id: "addon", label: "Add-On", stat: "4", icon: "plus" },
  { id: "affiliate", label: "Affiliate", stat: "Earn 60%", icon: "share" },
  { id: "billing", label: "Billing", stat: "0", icon: "card", statTone: "warning" },
  { id: "settings", label: "Settings", stat: "Sec", icon: "settings" },
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

const websiteMoreFunctionGroups = [
  {
    badge: "Domains",
    title: "Domain and Site Binding",
    description: "Add, move, remove, and bind domains or subdomains to this website.",
    actions: ["Add Domain", "Add Subdomain", "Move Domain", "Remove Domain", "Change Site Path", "Bind VPS Domain"]
  },
  {
    badge: "Runtime",
    title: "Runtime and IIS Features",
    description: "Review ASP.NET, .NET Core, PHP, custom errors, caching, compression, and directory browsing changes.",
    actions: ["Change Runtime", "Detailed Errors", "HTTP Compression", "Output Caching", "Directory Browsing", "Encrypt web.config"]
  },
  {
    badge: "Pool",
    title: "Application Pool",
    description: "Recycle, start, stop, isolate, resize, and adjust app pool platform options.",
    actions: ["Recycle Pool", "Start Pool", "Stop Pool", "Create Dedicated Pool", "Pool Memory", "32/64-bit Mode"]
  },
  {
    badge: "Security",
    title: "Security and Access",
    description: "Review Site Guard, IP restrictions, executable/API flags, password protection, and lock-state changes.",
    actions: ["Site Guard", "IP Deny", "Dynamic IP Protection", "Allow EXE", "Allow FB API", "Lock Site"]
  },
  {
    badge: "Ops",
    title: "Operations",
    description: "Visitor statistics, raw logs, automated backups, migration, related DB cleanup, and site removal planning.",
    actions: ["Visitor Stats", "Raw Logs", "Automated Backups", "WP Migration", "Remove Related DB", "Delete Website"]
  }
];

const websites = [
  {
    siteName: "agapepapa",
    mappedDomains: [
      { label: "openreward-001-site29.etempurl.com", url: "http://openreward-001-site29.etempurl.com/" },
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
      { label: "openreward-001-api.etempurl.com", url: "http://openreward-001-api.etempurl.com/" }
    ],
    runtime: "ASP.NET Web API",
    status: "Active"
  }
];

const affiliateBanners = [
  { size: "728X90", file: "728X90.gif" },
  { size: "468x60", file: "468X60.gif" },
  { size: "300x250", file: "300x250.gif" },
  { size: "234x60", file: "234x60.gif" }
].map((banner) => ({
  ...banner,
  url: `https://www.SmarterASP.NET/affiliate/${banner.file}`,
  code: `<a href="https://www.SmarterASP.NET/index?r=openreward"><img src="https://www.SmarterASP.NET/affiliate/${banner.file}" border="0"></a>`
}));

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
  const [route, setRoute] = useState(() => {
    if (window.location.pathname === "/panel") return "panel";
    if (window.location.pathname === "/panel_cp") return "panel_cp";
    if (window.location.pathname.startsWith("/checkout")) return "checkout";
    if (window.location.pathname === "/account/emailchangeverify") return "email-verify";
    if (window.location.pathname === "/account/retrieve_password") return "password-reset-request";
    if (window.location.pathname === "/account/retrieve_password_reset") return "password-reset-confirm";
    return "login";
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("controlpanel-theme") ?? "dark");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("controlpanel-theme", theme);
  }, [theme]);

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

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));

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
          <div className="product-mark" aria-hidden="true">CP</div>
          <p>Checking session...</p>
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

function isPublicRoute(route) {
  return ["login", "checkout", "email-verify", "password-reset-request", "password-reset-confirm"].includes(route);
}

function CheckoutHandoff({ theme, currentUser, onBackToPanel, onToggleTheme }) {
  const [order, setOrder] = useState(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [isPayingWithBalance, setIsPayingWithBalance] = useState(false);
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const guid = query.get("guid") ?? "";
  const amount = query.get("amount") ?? "";
  const isDeposit = window.location.pathname.includes("deposit");
  const isRenewTemp = window.location.pathname.includes("/checkout/renew") || query.get("kind") === "renew";

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      if (!guid) return;
      setOrderMessage("Loading checkout order...");
      try {
        const response = await fetch(isRenewTemp
          ? `/api/account/renew-temp/${encodeURIComponent(guid)}`
          : `/api/account/checkout-temp/${encodeURIComponent(guid)}`);
        const result = await response.json().catch(() => null);
        if (!isMounted) return;
        if (!response.ok || !result?.success) {
          setOrderMessage(result?.message ?? "Unable to load checkout order.");
          return;
        }

        setOrder(result.order);
        setOrderMessage(result.message);
      } catch {
        if (isMounted) setOrderMessage("Unable to reach checkout order service.");
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [guid, isRenewTemp]);

  async function payWithBalance() {
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
  const canUseBalance = !!order && !orderPaid && !orderProcessed && !isDeposit;

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
        <span className="status-pill blue">Checkout Handoff</span>
        <h1>{title}</h1>
        <p>This page confirms the order handoff created by the Account Panel rebuild and mirrors the legacy checkout temp-order state.</p>
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
          {order?.fulfillmentPath && <div><dt>Legacy Fulfillment</dt><dd>{order.fulfillmentPath}</dd></div>}
        </dl>
        {orderMessage && <p className="renewal-action-message">{orderMessage}</p>}
        <div className="checkout-action-row">
          {canUseBalance && (
            <button className="primary-button" type="button" disabled={isPayingWithBalance} onClick={payWithBalance}>
              {isPayingWithBalance ? "Checking..." : "Pay with Account Balance"}
            </button>
          )}
          {orderPaid && !orderProcessed && order.fulfillmentPath && (
            <a className="secondary-button as-link" href={order.fulfillmentPath}>Continue Fulfillment</a>
          )}
        </div>
        <button className="primary-button" type="button" onClick={onBackToPanel}>
          Back to Account Panel
        </button>
      </section>
    </main>
  );
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
        <button className="theme-toggle" type="button" onClick={onToggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>
      <section className="handoff-card">
        <span className={status.success ? "status-pill" : "status-pill muted"}>
          {status.loading ? "Checking" : status.success ? "Verified" : "Needs attention"}
        </span>
        <h1>Email Verification</h1>
        {status.loading ? (
          <p>Checking email verification link...</p>
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
  const [login, setLogin] = useState("openreward");
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
            {isSubmitting ? "Creating..." : "Create Reset Link"}
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
            {isSubmitting ? "Saving..." : "Reset Password"}
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
  const [login, setLogin] = useState("openreward");
  const [password, setPassword] = useState("abcd1234");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password })
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setLoginError(result?.message ?? "Login failed. Please check your username and password.");
        return;
      }

      onLogin(result.user, event);
    } catch {
      setLoginError("Unable to reach the login service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand" href="/" aria-label="ControlPanel home">
          <span className="brand-mark">CP</span>
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
          <div className="product-mark" aria-hidden="true">CP</div>
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
          {loginError && <p className="login-error">{loginError}</p>}
          <button className="primary-button full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
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
  const [activeSection, setActiveSection] = useState("hosting");
  const [dashboard, setDashboard] = useState(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [accountStats, setAccountStats] = useState({
    domains: null,
    vpn: null,
    addons: null,
    billingRenewals: null,
    balance: null
  });
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
    () => renderedSections.find((section) => section.id === activeSection)?.label ?? "Hosting Plans",
    [activeSection, renderedSections]
  );
  const browserDomain = useMemo(() => {
    const hostname = window.location.hostname;
    if (!hostname) return "LocalHost";
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return "LocalHost";
    return hostname;
  }, []);

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

  useEffect(() => {
    loadDashboard();
    loadAccountStats();
  }, []);

  const accountFunds = accountStats.balance === null ? "$179.92" : formatUsdFull(accountStats.balance);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <a className="brand project-brand" href="/panel">
            <span className="brand-name">{browserDomain}</span>
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
              <strong className={[
                "nav-stat",
                section.statTone === "warning" ? "warning" : "",
                section.tone === "order" ? "order" : ""
              ].filter(Boolean).join(" ")}>
                {section.stat}
              </strong>
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
          <a href="https://member3.smarterasp.net/account/helpdesk">
            <MenuIcon name="ticket" />
            <span>Helpdesk</span>
          </a>
        </div>
        <div className="reward-card" aria-label="Account balance">
          <ProfileAvatar username={currentUser?.login ?? "OPENREWARD"} />
          <div>
            <strong>{(currentUser?.login ?? "OPENREWARD").toUpperCase()}</strong>
            <span>Funds {accountFunds}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <div className="workspace-header">
          <div>
            <p className="kicker">Your Account Panel</p>
            <h1>{activeTitle}</h1>
          </div>
          <div className="workspace-actions">
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <button className="secondary-button compact" type="button" onClick={onLogout}>Logout</button>
          </div>
        </div>
        <DashboardSection
          activeSection={activeSection}
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
        const response = await fetch("/api/account/dashboard");
        const result = await response.json().catch(() => null);
        if (!isMounted || !response.ok || !result?.success) return;

        const plans = result.dashboard?.hostingAccounts ?? [];
        setHostingPlanOptions(plans);
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
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
                      <span>Loading plans...</span>
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
        <div className="reward-card" aria-label="Account balance">
          <ProfileAvatar username="OPENREWARD" />
          <div>
            <strong>OPENREWARD</strong>
            <span>Funds $179.92</span>
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
  return cpId ? `${path}?cpId=${encodeURIComponent(cpId)}` : path;
}

async function createPanelTestActivity(cpId, payload) {
  throw new Error(`${payload?.from || payload?.server || "This action"} needs a real provider gateway before it can run. No row was created.`);
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

function HostingDashboard({ cpId }) {
  const [dashboard, setDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const serverLogs = [
    {
      timeCreated: "6/10/2026 6:16:49 PM",
      message: "A process serving application pool 'openreward-001' suffered a fatal communication error with the Windows Process Activation Service. The process id was '13612'. The data field contains the error number."
    },
    {
      timeCreated: "6/9/2026 2:16:59 PM",
      message: "A process serving application pool 'openreward-001' suffered a fatal communication error with the Windows Process Activation Service. The process id was '84032'. The data field contains the error number."
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
        .catch(() => {});
    } catch {
      setDashboardError("Unable to reach hosting dashboard service.");
    } finally {
      setIsLoadingDashboard(false);
    }
  }

  useEffect(() => {
    loadHostingDashboard();
  }, [cpId]);

  return (
    <section className="cp-dashboard">
      <article className="panel-card cp-context-card">
        <div>
          <span className="status-pill blue">{isLoadingDashboard ? "Loading" : dashboard?.status ?? "Live CP"}</span>
          <h2>{dashboard?.cpLogin || "Mock Up Hosting"}</h2>
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
          <button className="secondary-button compact" type="button" onClick={loadHostingDashboard}>Retry</button>
        </div>
      )}
      {!!visibleMigrations.length && (
        <article className="panel-card migration-notice-card">
          <div>
            <span className="status-pill warning">Migration Notice</span>
            <h2>Recent Server Migration</h2>
            <p>Your hosting account has recent migration activity. Repair actions are requires real gateway from the Files page before real migration queue writes are enabled.</p>
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
            <dt>DNS Servers</dt>
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
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [viewMode, setViewMode] = useState("cards");
  const [siteRecords, setSiteRecords] = useState(websites);
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [sitesError, setSitesError] = useState("");
  const [websiteMessage, setWebsiteMessage] = useState("");
  const [selectedSiteKey, setSelectedSiteKey] = useState("");
  const [newSiteDraft, setNewSiteDraft] = useState({ name: "newsite", folder: "/www/newsite", runtime: "ASP.NET 4.x Integrated" });
  const [domainDraft, setDomainDraft] = useState({ domain: "newdomain.com", mode: "Add Domain", createDns: true });
  const [pathDraft, setPathDraft] = useState({ path: "/www/sample.com", runtime: "ASP.NET 4.x Integrated", coreMode: "In Process" });
  const [ipDenyDraft, setIpDenyDraft] = useState({ ip: "203.0.113.10", mask: "255.255.255.255", mode: "Deny IP" });
  const [envDraft, setEnvDraft] = useState({ key: "ASPNETCORE_ENVIRONMENT", value: "Production", scope: "Site" });
  const [poolDraft, setPoolDraft] = useState({ action: "Recycle Pool", memory: "1024", mode: "64-bit" });

  async function loadHostingSites() {
    setIsLoadingSites(true);
    setSitesError("");
    try {
      const response = await fetch(hostingApiUrl("/api/hosting/sites", cpId));
      const result = await response.json();
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
      setSitesError("Unable to reach website service.");
    } finally {
      setIsLoadingSites(false);
    }
  }

  useEffect(() => {
    loadHostingSites();
  }, [cpId]);

  const websiteJobs = (activity?.jobs ?? []).filter((job) =>
    job.server === "website-manager" ||
    String(job.from ?? "").toLowerCase().startsWith("site:") ||
    String(job.from ?? "").toLowerCase().startsWith("website:")
  );

  function updateSiteName(index, siteName) {
    setSiteRecords((currentSites) =>
      currentSites.map((site, siteIndex) => (siteIndex === index ? { ...site, siteName } : site))
    );
  }

  const selectedSite = siteRecords.find((site) => site.siteKey === selectedSiteKey) ?? siteRecords[0] ?? null;

  async function queueWebsiteTest(action, site = null, target = "", details = "") {
    setWebsiteMessage("");
    try {
      await createPanelTestActivity(cpId, {
        from: site ? `site:${site.siteName}` : `website:${action}`,
        to: target || (site ? site.mappedDomains?.[0]?.label || site.siteName : "/panel-test/websites"),
        server: "website-manager",
        note: details || `Safe website planning row for ${action}`
      });
      setWebsiteMessage(`${action} test activity created.`);
      await reloadActivity();
    } catch (error) {
      setWebsiteMessage(error.message);
    }
  }

  function queueSelectedWebsiteAction(action, details = "") {
    queueWebsiteTest(action, selectedSite, "", details);
  }

  function submitNewSiteDraft(event) {
    event.preventDefault();
    queueWebsiteTest(
      "+ New Site",
      null,
      newSiteDraft.folder,
      `Safe addnewsite draft: site ${newSiteDraft.name}; folder ${newSiteDraft.folder}; runtime ${newSiteDraft.runtime}`
    );
  }

  function submitDomainDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      domainDraft.mode,
      `Safe domainbind draft: site ${selectedSite?.siteName || "selected site"}; domain ${domainDraft.domain}; action ${domainDraft.mode}; create DNS ${domainDraft.createDns ? "yes" : "no"}`
    );
  }

  function submitPathRuntimeDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      "Path / Runtime",
      `Safe website runtime draft: site ${selectedSite?.siteName || "selected site"}; path ${pathDraft.path}; runtime ${pathDraft.runtime}; core mode ${pathDraft.coreMode}`
    );
  }

  function submitIpDenyDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      ipDenyDraft.mode,
      `Safe IP deny draft: site ${selectedSite?.siteName || "selected site"}; ip ${ipDenyDraft.ip}; mask ${ipDenyDraft.mask}; action ${ipDenyDraft.mode}`
    );
  }

  function submitEnvDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      "Environment Variable",
      `Safe environment variable draft: site ${selectedSite?.siteName || "selected site"}; scope ${envDraft.scope}; ${envDraft.key}=${envDraft.value}`
    );
  }

  function submitPoolDraft(event) {
    event.preventDefault();
    queueSelectedWebsiteAction(
      poolDraft.action,
      `Safe app pool draft: site ${selectedSite?.siteName || "selected site"}; action ${poolDraft.action}; memory ${poolDraft.memory} MB; mode ${poolDraft.mode}`
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
          <button className="primary-button compact" type="button" onClick={() => queueWebsiteTest("+ New Site")}>+ New Site</button>
          <button className="secondary-button compact" type="button" onClick={() => queueWebsiteTest("+ Sub Domain")}>+ Sub Domain</button>
          <button className="secondary-button compact" type="button" onClick={() => queueWebsiteTest("+ Automated Backups")}>+ Automated Backups</button>
        </div>
        <div className="view-toggle" aria-label="Website view mode">
          <button
            className={viewMode === "cards" ? "active" : ""}
            type="button"
            onClick={() => setViewMode("cards")}
            title="Cards"
            aria-label="Cards"
          >
            <MenuIcon name="cards" />
          </button>
          <button
            className={viewMode === "table" ? "active" : ""}
            type="button"
            onClick={() => setViewMode("table")}
            title="Table"
            aria-label="Table"
          >
            <MenuIcon name="table" />
          </button>
        </div>
      </div>

      <div className="panel-card website-live-summary">
        <div>
          <span className="status-pill blue">Live websites</span>
          <p>{sitesDashboard?.cpLogin ? `${sitesDashboard.cpLogin} · ${siteRecords.length} sites` : "Loading hosting websites"}</p>
        </div>
        <RefreshButton onClick={refreshWebsitesSection} />
      </div>

      {isLoadingSites && <p className="empty-state">Loading websites from cp_config_Sites...</p>}
      {websiteMessage && <p className="sandbox-message">{websiteMessage}</p>}
      {sitesError && (
        <div className="panel-card dashboard-error-panel">
          <p>{sitesError}</p>
          <button className="secondary-button compact" type="button" onClick={loadHostingSites}>Retry</button>
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
        <WebsiteCards sites={siteRecords} onUpdateSiteName={updateSiteName} onQueueAction={queueWebsiteTest} />
      ) : (
        <WebsiteTable sites={siteRecords} onUpdateSiteName={updateSiteName} onQueueAction={queueWebsiteTest} />
      ))}

      {!!siteRecords.length && (
        <section className="panel-card website-more-functions">
          <div className="website-more-header">
            <div>
              <span className="status-pill blue">More Functions</span>
              <h2>Website Tools</h2>
              <p>Rebuilt staging surface for the legacy domainbind, app pool, runtime, stats, protection, and IIS feature flows.</p>
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

          <div className="website-more-grid">
            {websiteMoreFunctionGroups.map((group) => (
              <article className="website-more-card" key={group.title}>
                <div>
                  <span className="status-pill muted">{group.badge}</span>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
                <div className="website-more-actions">
                  {group.actions.map((action) => (
                    <button className="secondary-button compact" type="button" key={action} onClick={() => queueSelectedWebsiteAction(action)}>
                      {action}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="website-function-form-grid">
            <form className="website-function-form" onSubmit={submitNewSiteDraft}>
              <span className="status-pill blue">New Site Draft</span>
              <label>
                Site Name
                <input value={newSiteDraft.name} onChange={(event) => setNewSiteDraft((draft) => ({ ...draft, name: event.target.value }))} />
              </label>
              <label>
                Folder
                <input value={newSiteDraft.folder} onChange={(event) => setNewSiteDraft((draft) => ({ ...draft, folder: event.target.value }))} />
              </label>
              <label>
                Runtime
                <select value={newSiteDraft.runtime} onChange={(event) => setNewSiteDraft((draft) => ({ ...draft, runtime: event.target.value }))}>
                  <option>ASP.NET 4.x Integrated</option>
                  <option>ASP.NET 4.x Classic</option>
                  <option>.NET Core</option>
                  <option>PHP</option>
                </select>
              </label>
              <button className="primary-button compact" type="submit">Run Real Test</button>
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
              <button className="primary-button compact" type="submit">Run Real Test</button>
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
              <button className="primary-button compact" type="submit">Run Real Test</button>
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
              <button className="primary-button compact" type="submit">Run Real Test</button>
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
              <button className="primary-button compact" type="submit">Run Real Test</button>
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
              <button className="primary-button compact" type="submit">Run Real Test</button>
            </form>
          </div>
        </section>
      )}

      <ActivityList jobs={websiteJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle="No recent website jobs" onRetry={reloadActivity} />
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

function WebsiteCards({ sites, onUpdateSiteName, onQueueAction }) {
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
          <WebsiteActionButtons onAction={(action) => onQueueAction(action, site)} />
        </article>
      ))}
    </div>
  );
}

function WebsiteTable({ sites, onUpdateSiteName, onQueueAction }) {
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
              <td><WebsiteActionButtons compact onAction={(action) => onQueueAction(action, site)} /></td>
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

function WebsiteActionButtons({ compact = false, onAction }) {
  return (
    <div className={compact ? "website-action-buttons compact-actions" : "website-action-buttons"}>
      {websiteActions.map((action) => (
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

function DatabasesSection({ cpId }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [databaseDashboard, setDatabaseDashboard] = useState(null);
  const [activeEngine, setActiveEngine] = useState("All");
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(true);
  const [databaseError, setDatabaseError] = useState("");
  const [databaseMessage, setDatabaseMessage] = useState("");
  const [connectionPreview, setConnectionPreview] = useState(null);
  const [backupDraft, setBackupDraft] = useState({ databaseKey: "", hour: "2", name: "codex-test-dbbackup" });
  const [newDatabaseDraft, setNewDatabaseDraft] = useState({ engine: "MSSQL", name: "codex-test-db", login: "codex-test-user", quota: "100" });
  const [restoreDraft, setRestoreDraft] = useState({ databaseKey: "", backupFile: "/db_backup/testdb.bak", mode: "Restore from backup" });
  const [sqlDraft, setSqlDraft] = useState({ databaseKey: "", filePath: "/www/sql/update.sql", action: "Run SQL File" });

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
  }, [cpId]);

  const databases = databaseDashboard?.databases ?? [];
  const visibleDatabases = activeEngine === "All"
    ? databases
    : databases.filter((database) => database.engine === activeEngine);
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
        note: details || `Safe database planning row for ${action}`
      });
      setDatabaseMessage(`${action} test activity created.`);
      await reloadActivity();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  function showConnectionString(database) {
    setConnectionPreview({
      name: database.name,
      engine: database.engine,
      host: database.host || (database.engine === "MSSQL" ? "mssql.site4now.net" : "mysql.site4now.net"),
      login: database.login,
      text: database.engine === "MSSQL"
        ? `Server=${database.host || "mssql.site4now.net"};Database=${database.name};User ID=${database.login};Password=YOUR_DB_PASSWORD;TrustServerCertificate=True;`
        : `Driver={MySQL ODBC 8.0 UNICODE Driver};Server=${database.host || "mysql.site4now.net"};Database=${database.name};Uid=${database.login};Password=YOUR_DB_PASSWORD;`
    });
  }

  async function submitBackupDraft(event) {
    event.preventDefault();
    const database = visibleDatabases.find((item) => `${item.engine}:${item.databaseId}` === backupDraft.databaseKey) ?? visibleDatabases[0] ?? databases[0];
    if (!database) {
      setDatabaseMessage("Choose a database before staging a scheduled backup.");
      return;
    }

    const hour = Math.max(0, Math.min(23, Number(backupDraft.hour) || 0));
    try {
      const result = await createHostingRealTest(cpId, "db-backup", { name: backupDraft.name, hour: String(hour) });
      setDatabaseMessage(result.message);
      await loadDatabases();
    } catch (error) {
      setDatabaseMessage(error.message);
    }
  }

  function submitNewDatabaseDraft(event) {
    event.preventDefault();
    const quota = Math.max(10, Math.min(10240, Number(newDatabaseDraft.quota) || 100));
    queueDatabaseTest(
      `Create ${newDatabaseDraft.engine} Database`,
      null,
      `Safe database create draft: engine ${newDatabaseDraft.engine}; name ${newDatabaseDraft.name}; login ${newDatabaseDraft.login}; quota ${quota} MB; cpid ${cpId}`
    );
  }

  function submitRestoreDraft(event) {
    event.preventDefault();
    const database = databases.find((item) => `${item.engine}:${item.databaseId}` === restoreDraft.databaseKey) ?? visibleDatabases[0] ?? databases[0];
    if (!database) {
      setDatabaseMessage("Choose a database before staging a restore.");
      return;
    }

    queueDatabaseTest(
      restoreDraft.mode,
      database,
      `Safe database restore draft: ${database.engine}|${database.name}|${database.databaseId}; file ${restoreDraft.backupFile}; mode ${restoreDraft.mode}`
    );
  }

  function submitSqlDraft(event) {
    event.preventDefault();
    const database = databases.find((item) => `${item.engine}:${item.databaseId}` === sqlDraft.databaseKey) ?? visibleDatabases[0] ?? databases[0];
    if (!database) {
      setDatabaseMessage("Choose a database before staging a SQL file.");
      return;
    }

    queueDatabaseTest(
      sqlDraft.action,
      database,
      `Safe SQL worker draft: ${database.engine}|${database.name}|${database.databaseId}; file ${sqlDraft.filePath}; action ${sqlDraft.action}`
    );
  }

  return (
    <section className="databases-section">
      <article className="panel-card database-summary-card">
        <div>
          <span className="status-pill blue">Live databases</span>
          <h2>{databaseDashboard?.cpLogin || "Database Manager"}</h2>
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
          <button className="primary-button compact" type="button" onClick={() => queueDatabaseTest("+ Database")}>+ Database</button>
          <button className="secondary-button compact" type="button" onClick={() => queueDatabaseTest("+ Quota")}>+ Quota</button>
          <button className="secondary-button compact" type="button" onClick={() => queueDatabaseTest("+ Advanced Backup")}>+ Advanced Backup</button>
          <button className="secondary-button compact" type="button" onClick={() => queueDatabaseTest("Run SQL File")}>Run SQL File</button>
          <button className="secondary-button compact" type="button" onClick={() => queueDatabaseTest("Deleted DBs")}>Deleted DBs</button>
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
      </div>

      {!!visibleDatabases.length && (
        <article className="panel-card database-schedule-card">
          <div>
            <span className="status-pill blue">Scheduled database backups</span>
            <h3>Custom Backup Draft</h3>
            <p>Requires real gateway for the legacy `customDBBackup` values without writing a real backup schedule.</p>
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
              Test Name
              <input value={backupDraft.name} onChange={(event) => setBackupDraft((draft) => ({ ...draft, name: event.target.value }))} />
            </label>
            <button className="primary-button compact" type="submit">Create Real Test</button>
          </form>
        </article>
      )}

      <div className="advance-form-grid">
        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Create Database</span>
            <h3>MSSQL / MySQL Draft</h3>
            <p>Requires real gateway for the legacy create form values with CP prefix, login, and quota review.</p>
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
              Quota MB
              <input type="number" min="10" max="10240" value={newDatabaseDraft.quota} onChange={(event) => setNewDatabaseDraft((draft) => ({ ...draft, quota: event.target.value }))} />
            </label>
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Restore / Backup</span>
            <h3>Server Backup Draft</h3>
            <p>Requires real gateway for restore mode and backup file path for the compatible database worker queue.</p>
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
                <option>Queue MSSQL Backup</option>
                <option>Queue MySQL Backup</option>
                <option>Show Deleted DBs</option>
              </select>
            </label>
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Run SQL</span>
            <h3>SQL File Worker</h3>
            <p>Requires real gateway for a SQL file run against an owned database without executing it directly.</p>
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
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>
      </div>

      {isLoadingDatabases && <p className="empty-state">Loading databases from cp_config_MSSQLs and cp_config_MySQLs...</p>}
      {databaseMessage && <p className="sandbox-message">{databaseMessage}</p>}
      {connectionPreview && (
        <article className="panel-card connection-preview-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">{connectionPreview.engine}</span>
              <h3>{connectionPreview.name} connection string</h3>
              <p>Password is intentionally not displayed.</p>
            </div>
            <button className="secondary-button compact" type="button" onClick={() => setConnectionPreview(null)}>Close</button>
          </div>
          <code>{connectionPreview.text}</code>
        </article>
      )}
      {databaseError && (
        <div className="panel-card dashboard-error-panel">
          <p>{databaseError}</p>
          <button className="secondary-button compact" type="button" onClick={loadDatabases}>Retry</button>
        </div>
      )}
      {!isLoadingDatabases && !databaseError && !visibleDatabases.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No databases</span>
          <h2>No {activeEngine === "All" ? "" : activeEngine} databases found</h2>
          <p>This hosting account does not have visible database rows for the selected engine.</p>
        </div>
      )}

      {!!visibleDatabases.length && (
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
                {["Backup", "Restore", "Connection String", "More"].map((action) => (
                  <button className="secondary-button compact" type="button" key={action} onClick={() => action === "Connection String" ? showConnectionString(database) : queueDatabaseTest(action, database)}>
                    {action}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      <ActivityList jobs={databaseJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle="No recent database jobs" onRetry={reloadActivity} />
    </section>
  );
}

function ThemeToggle({ theme, onToggleTheme }) {
  return (
    <button
      aria-label={theme === "dark" ? "Switch to day mode" : "Switch to dark mode"}
      className="theme-toggle"
      type="button"
      onClick={onToggleTheme}
    >
      <span className="theme-icon" aria-hidden="true">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.8v2.4M12 18.8v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M20.2 14.6A7.7 7.7 0 0 1 9.4 3.8 8.7 8.7 0 1 0 20.2 14.6Z" />
          </svg>
        )}
      </span>
      <span>{theme === "dark" ? "Day" : "Dark"}</span>
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
  const [emailDomainDraft, setEmailDomainDraft] = useState({ domain: "mail.example.com", type: "Hosted Email", quota: "1000" });
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
        note: details || `Safe email planning row for ${action}`
      });
      setEmailMessage(`${action} test activity created.`);
      await reloadActivity();
    } catch (error) {
      setEmailMessage(error.message);
    }
  }

  function submitEmailDomainDraft(event) {
    event.preventDefault();
    queueEmailTest(
      `Add ${emailDomainDraft.type}`,
      { domain: emailDomainDraft.domain, mailHost: "mail-manager" },
      `Safe email domain draft: domain ${emailDomainDraft.domain}; type ${emailDomainDraft.type}; quota ${emailDomainDraft.quota} MB`
    );
  }

  function submitMailboxDraft(event) {
    event.preventDefault();
    const selectedDomain = domains.find((domain) => domain.domain === mailboxDraft.domain) ?? primaryDomain;
    queueEmailTest(
      mailboxDraft.action,
      selectedDomain,
      `Safe mailbox draft: ${mailboxDraft.mailbox}@${selectedDomain?.domain || mailboxDraft.domain || "domain"}; quota ${mailboxDraft.quota} MB; action ${mailboxDraft.action}`
    );
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
          <h2>{emailDashboard?.cpLogin || "Email Manager"}</h2>
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
          <button className="primary-button compact" type="button" onClick={() => queueEmailTest("+ Email Domain")}>+ Email Domain</button>
          <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("+ Corporate Email")}>+ Corporate Email</button>
          <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("+ Mailbox")}>+ Mailbox</button>
          <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("Daily Send Limit")}>Daily Send Limit</button>
          <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("DNS Records", primaryDomain)}>DNS Records</button>
          <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("Webmail Login", primaryDomain)}>Webmail Login</button>
          <button className="secondary-button compact" type="button" onClick={() => queueEmailTest("DKIM Setup", primaryDomain)}>DKIM Setup</button>
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
            <p>Requires real gateway for hosted, corporate, and VPS email domain values before SmarterMail writes are enabled.</p>
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
              Quota MB
              <input type="number" min="100" max="10240" value={emailDomainDraft.quota} onChange={(event) => setEmailDomainDraft((draft) => ({ ...draft, quota: event.target.value }))} />
            </label>
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Mailbox</span>
            <h3>Mailbox / Alias Draft</h3>
            <p>Requires real gateway for mailbox, alias, forwarding, quota, and password actions for the selected email domain.</p>
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
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>
      </div>

      {isLoadingEmails && <p className="empty-state">Loading email domains from cp_config_EmailDomains...</p>}
      {emailMessage && <p className="sandbox-message">{emailMessage}</p>}
      {emailError && (
        <div className="panel-card dashboard-error-panel">
          <p>{emailError}</p>
          <button className="secondary-button compact" type="button" onClick={loadEmails}>Retry</button>
        </div>
      )}
      {!isLoadingEmails && !emailError && !visibleDomains.length && (
        <div className="panel-card cp-placeholder">
          <span className="status-pill muted">No email domains</span>
          <h2>No {activeType === "All" ? "" : activeType} email domains found</h2>
          <p>This hosting account does not have visible email domain rows for the selected type.</p>
        </div>
      )}

      {!!visibleDomains.length && (
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
                {["Manage Mailboxes", "Alias", "Forwarding", "Password", "DNS", "Webmail", "Delete"].map((action) => (
                  <button className="secondary-button compact" type="button" key={action} onClick={() => queueEmailTest(action, domain)}>
                    {action}
                  </button>
                ))}
              </div>
            </article>
          ))}
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
  const [ftpDraft, setFtpDraft] = useState({ login: "codex-test-ftp", path: "h:/root/home/openreward-001/www/codex-test", quota: "500", permission: "write" });

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

  async function queueFtpTest(action, user = null, details = "") {
    setFtpMessage("");
    try {
      await createPanelTestActivity(cpId, {
        from: user ? `ftp:${user.login}` : `ftp:${action}`,
        to: user ? user.path || "/www" : "/panel-test/ftp",
        server: user?.server || "ftp-manager",
        note: details || `Safe FTP planning row for ${action}`
      });
      setFtpMessage(`${action} test activity created.`);
      await reloadActivity();
    } catch (error) {
      setFtpMessage(error.message);
    }
  }

  async function submitFtpDraft(event) {
    event.preventDefault();
    setFtpMessage("");
    try {
      const result = await createHostingRealTest(cpId, "ftp", {
        name: ftpDraft.login,
        path: ftpDraft.path,
        quota: ftpDraft.quota,
        permission: ftpDraft.permission
      });
      setFtpMessage(result.message);
      await loadFtp();
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
          <h2>{ftpDashboard?.cpLogin || "FTP Manager"}</h2>
          <p>FTP account inventory from cp_config_FTP. Remote agent actions are requires real gateway for the next pass.</p>
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
          <button className="primary-button compact" type="button" onClick={() => queueFtpTest("+ FTP User")}>+ FTP User</button>
          <button className="secondary-button compact" type="button" onClick={() => queueFtpTest("Import Users")}>Import Users</button>
          <button className="secondary-button compact" type="button" onClick={() => queueFtpTest("Reset Root Path")}>Reset Root Path</button>
        </div>
      </div>

      <article className="panel-card advance-form-card">
        <div>
          <span className="status-pill blue">FTP User Draft</span>
          <h3>Create / Edit FTP</h3>
          <p>Requires real gateway for FTP login, path, quota, and permission values without changing existing FTP users.</p>
        </div>
        <form className="advance-inline-form" onSubmit={submitFtpDraft}>
          <label>
            Login
            <input value={ftpDraft.login} onChange={(event) => setFtpDraft((draft) => ({ ...draft, login: event.target.value }))} />
          </label>
          <label>
            Path
            <input value={ftpDraft.path} onChange={(event) => setFtpDraft((draft) => ({ ...draft, path: event.target.value }))} />
          </label>
          <label>
            Quota MB
            <input type="number" min="0" max="10240" value={ftpDraft.quota} onChange={(event) => setFtpDraft((draft) => ({ ...draft, quota: event.target.value }))} />
          </label>
          <label>
            Permission
            <select value={ftpDraft.permission} onChange={(event) => setFtpDraft((draft) => ({ ...draft, permission: event.target.value }))}>
              <option>Read / Write</option>
              <option>Read Only</option>
              <option>Write Only</option>
            </select>
          </label>
          <button className="primary-button compact" type="submit">Create Real Test</button>
        </form>
      </article>

      {isLoadingFtp && <p className="empty-state">Loading FTP users from cp_config_FTP...</p>}
      {ftpMessage && <p className="sandbox-message">{ftpMessage}</p>}
      {ftpError && (
        <div className="panel-card dashboard-error-panel">
          <p>{ftpError}</p>
          <button className="secondary-button compact" type="button" onClick={loadFtp}>Retry</button>
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
                <th>Path</th>
                <th>Quota</th>
                <th>Permission</th>
                <th>Server</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.login}>
                  <td>
                    <span className="ftp-login-cell">
                      <MenuIcon name="ftp" />
                      {user.login}
                      {user.isRootUser && <span className="status-pill blue">Root</span>}
                    </span>
                  </td>
                  <td>{user.path}</td>
                  <td>{user.quotaMb > 0 ? `${user.quotaMb} MB` : "Unlimited"}</td>
                  <td>{user.permission}</td>
                  <td>{user.server || "Default FTP server"}</td>
                  <td><span className="status-pill">{user.status}</span></td>
                  <td>
                    <div className="website-action-buttons compact-actions">
                      {["Edit", "Password", "Enable", "Disable", "Delete"].map((action) => (
                        <button className="secondary-button compact" type="button" key={action} onClick={() => queueFtpTest(action, user)}>
                          {action}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ActivityList jobs={ftpJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle="No recent FTP jobs" onRetry={reloadActivity} />
    </section>
  );
}

function FilesSection({ cpId }) {
  const { activity, isLoading, error, reload } = useHostingActivity(cpId);
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [sitesError, setSitesError] = useState("");
  const [filesMessage, setFilesMessage] = useState("");
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
        .catch(() => {});
    } catch {
      setSitesError("Unable to reach site folder service.");
    }
  }

  useEffect(() => {
    loadFileSites();
  }, [cpId]);

  const siteFolders = (sitesDashboard?.sites ?? []).slice(0, 12);
  const securityBySite = new Map((securityDashboard?.siteSecurityRows ?? []).map((row) => [String(row.siteUid), row]));

  async function queueFileTest(action, site = null, details = "") {
    setFilesMessage("");
    try {
      await createPanelTestActivity(cpId, {
        from: site ? simplifySitePath(site.sitePath, sitesDashboard?.cpLogin) : `/www/${action.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        to: site ? `${action}:${site.siteName}` : `/panel-test/files/${action.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        server: "file-manager",
        note: details || `Safe file-manager planning row for ${action}`
      });
      setFilesMessage(`${action} test activity created.`);
      await reload();
    } catch (error) {
      setFilesMessage(error.message);
    }
  }

  function submitProtectionDraft(event) {
    event.preventDefault();
    queueFileTest(
      protectionDraft.action,
      null,
      `Safe site protection draft: site ${protectionDraft.site}; path ${protectionDraft.path}; user ${protectionDraft.username}; action ${protectionDraft.action}`
    );
  }

  function submitMigrationDraft(event) {
    event.preventDefault();
    queueFileTest(
      migrationDraft.action,
      null,
      `Safe migration repair draft: source ${migrationDraft.source}; target ${migrationDraft.target}; action ${migrationDraft.action}`
    );
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">File Manager</span>
          <h2>{activity?.cpLogin || "Files"}</h2>
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

      <div className="database-toolbar panel-card">
        <div className="database-actions">
          {["Upload", "New Folder", "Zip", "Unzip", "Permissions", "Scan Virus", "Lock Site", "Unlock Site", "Raw Logs"].map((action, index) => (
            <button className={index === 0 ? "primary-button compact" : "secondary-button compact"} type="button" key={action} onClick={() => queueFileTest(action)}>
              {action}
            </button>
          ))}
        </div>
      </div>
      {filesMessage && <p className="sandbox-message">{filesMessage}</p>}

      <article className="panel-card file-root-card">
        <div className="database-card-header">
          <div>
            <span className="status-pill">Root</span>
            <h3>/www</h3>
            <p>Remote file browsing, uploads, and edits need the file manager gateway before writes are enabled.</p>
          </div>
          <MenuIcon name="folder" />
        </div>
        <dl className="card-meta single">
          <div><dt>Queue Types</dt><dd>zip, Unzip, perm, scanvirus</dd></div>
          <div><dt>Processing</dt><dd>Legacy worker-compatible workqueue rows</dd></div>
        </dl>
      </article>

      <div className="advance-form-grid">
        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Site Protection Draft</span>
            <h3>Password Protection</h3>
            <p>Requires real gateway for lock site, unlock site, password protection, and FB API access planning without changing files or IIS rules.</p>
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
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>

        <article className="panel-card advance-form-card">
          <div>
            <span className="status-pill blue">Migration Draft</span>
            <h3>Repair Queue</h3>
            <p>Requires real gateway for migration completion checks and permission repair steps from the migration repair flow.</p>
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
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>
      </div>

      {sitesError && (
        <div className="panel-card dashboard-error-panel">
          <p>{sitesError}</p>
          <button className="secondary-button compact" type="button" onClick={loadFileSites}>Retry</button>
        </div>
      )}

      {!!siteFolders.length && (
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
                    <button className="secondary-button compact" type="button" key={action} onClick={() => queueFileTest(action, site)}>{action}</button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ActivityList activity={activity} jobs={fileJobs} isLoading={isLoading} error={error} emptyTitle="No recent file jobs" onRetry={reload} />
    </section>
  );
}

function AppsSection({ cpId }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [appsDashboard, setAppsDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState("");
  const [appsMessage, setAppsMessage] = useState("");
  const [previewPluginId, setPreviewPluginId] = useState(null);
  const [appSearch, setAppSearch] = useState("");
  const [activeAppType, setActiveAppType] = useState("All");
  const [wpDraft, setWpDraft] = useState({
    site: "sample.com",
    url: "https://sample.com/wp-admin",
    note: "WordPress Desk safe review"
  });
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
      fetch(hostingApiUrl("/api/hosting/security", cpId))
        .then((response) => response.json().then((securityResult) => ({ response, securityResult })))
        .then(({ response, securityResult }) => {
          if (response.ok && securityResult?.success) {
            setSecurityDashboard(securityResult.dashboard);
          }
        })
        .catch(() => {});
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
  const deployJobs = appsDashboard?.deployJobs ?? [];
  const siteSecurityRows = securityDashboard?.siteSecurityRows ?? [];
  const firewallSites = siteSecurityRows.filter((row) => row.webKnight);
  const lockedSites = siteSecurityRows.filter((row) => row.hasAuditRow && !row.isWritable);
  const appJobs = [
    ...deployJobs,
    ...(activity?.jobs ?? []).filter((job) =>
      job.server === "plugin-installer" ||
      job.server === "wordpress-manager" ||
      String(job.from ?? "").toLowerCase().startsWith("plugin:") ||
      String(job.from ?? "").toLowerCase().startsWith("wordpress:") ||
      String(job.from ?? "").toLowerCase().startsWith("requirements:")
    )
  ].filter((job, index, list) => list.findIndex((candidate) => candidate.id === job.id) === index);

  async function createPluginInstallTest(plugin) {
    setAppsMessage("");
    try {
      const result = await createPanelTestActivity(cpId, {
        from: `plugin:${plugin.name}`,
        to: `/www/${plugin.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "app"}`,
        server: "plugin-installer",
        note: `Safe install planning row for ${plugin.name} ${plugin.version || ""}`.trim()
      });
      setAppsMessage(result.message);
      await loadApps();
      await reloadActivity();
    } catch (error) {
      setAppsMessage(error.message);
    }
  }

  async function createPluginRequirementTest(plugin) {
    setAppsMessage("");
    try {
      const result = await createPanelTestActivity(cpId, {
        from: `requirements:${plugin.name}`,
        to: plugin.language || "app-runtime",
        server: "plugin-installer",
        note: `Safe requirements planning row for ${plugin.name} ${plugin.version || ""}`.trim()
      });
      setAppsMessage(result.message);
      await loadApps();
      await reloadActivity();
    } catch (error) {
      setAppsMessage(error.message);
    }
  }

  async function createWordPressDeskTest(action) {
    setAppsMessage("");
    try {
      const result = await createPanelTestActivity(cpId, {
        from: `wordpress:${action}`,
        to: wpDraft.site || "wordpress-site",
        server: "wordpress-manager",
        note: `Safe WordPress Desk draft: ${action}; site ${wpDraft.site}; admin ${wpDraft.url}; ${wpDraft.note}`
      });
      setAppsMessage(result.message);
      await reloadActivity();
    } catch (error) {
      setAppsMessage(error.message);
    }
  }

  async function createNodeDeployTest(event) {
    event.preventDefault();
    setAppsMessage("");
    try {
      const result = await createPanelTestActivity(cpId, {
        from: `node:${nodeDraft.mode}`,
        to: nodeDraft.site || "node-site",
        server: "plugin-installer",
        note: `Safe Node.js deploy draft: site ${nodeDraft.site}; source ${nodeDraft.source}; mode ${nodeDraft.mode}; handler ${nodeDraft.handler}`
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
          <h2>{appsDashboard?.cpLogin || "Application Installer"}</h2>
          <p>Plugin catalog and deploy history for ASP.NET, PHP, WordPress, and Node.js installers.</p>
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
      </div>

      {isLoadingApps && <p className="empty-state">Loading app catalog...</p>}
      {appsError && (
        <div className="panel-card dashboard-error-panel">
          <p>{appsError}</p>
          <button className="secondary-button compact" type="button" onClick={loadApps}>Retry</button>
        </div>
      )}
      {appsMessage && <p className="sandbox-message">{appsMessage}</p>}

      <article className="panel-card wordpress-desk-panel">
        <div className="database-card-header">
          <div>
            <span className="status-pill blue">WordPress Desk</span>
            <h3>Site Security and WordPress Tools</h3>
            <p>Requires real gateway for the wpdesk CDN, firewall, and security checks without changing Cloudflare, WebKnight, or site files.</p>
          </div>
          <MenuIcon name="apps" />
        </div>
        <form className="advance-inline-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Site
            <input value={wpDraft.site} onChange={(event) => setWpDraft((draft) => ({ ...draft, site: event.target.value }))} />
          </label>
          <label>
            Admin URL
            <input value={wpDraft.url} onChange={(event) => setWpDraft((draft) => ({ ...draft, url: event.target.value }))} />
          </label>
          <label>
            Note
            <input value={wpDraft.note} onChange={(event) => setWpDraft((draft) => ({ ...draft, note: event.target.value }))} />
          </label>
        </form>
        <div className="database-action-row">
          {["Scan WordPress Sites", "Check Site Security", "Enable WordPress CDN", "Disable WordPress CDN", "Toggle Firewall", "Repair Permissions"].map((action, index) => (
            <button
              className={index === 0 ? "primary-button compact" : "secondary-button compact"}
              type="button"
              key={action}
              onClick={() => createWordPressDeskTest(action)}
            >
              {action}
            </button>
          ))}
        </div>
        {!!siteSecurityRows.length && (
          <div className="service-status-grid">
            <div className="service-status-card">
              <div><span>Known Sites</span><strong>{siteSecurityRows.length}</strong></div>
              <p>Site rows available to WordPress Desk.</p>
            </div>
            <div className="service-status-card">
              <div><span>Firewall On</span><strong>{firewallSites.length}</strong></div>
              <p>WebKnight flags currently enabled.</p>
            </div>
            <div className="service-status-card">
              <div><span>Locked</span><strong>{lockedSites.length}</strong></div>
              <p>Sites currently marked not writable.</p>
            </div>
          </div>
        )}
      </article>

      <article className="panel-card wordpress-desk-panel">
        <div className="database-card-header">
          <div>
            <span className="status-pill blue">Node.js Deploy</span>
            <h3>IISNode / HTTP Platform</h3>
            <p>Requires real gateway for Node.js mode, Git/ZIP source, sub-application, and deploy worker values.</p>
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
          <button className="primary-button compact" type="submit">Run Real Test</button>
        </form>
      </article>

      {!!filteredCatalog.length && (
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
    try {
      await createPanelTestActivity(cpId, {
        from: `advanced:${action}`,
        to: `/panel-test/advance/${action.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        server: "advanced-manager",
        note: details || `Safe advanced planning row for ${action}`
      });
      setSandboxMessage(`${action} test activity created.`);
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
      `Safe scheduled task draft: ${url}; timeout ${timeout}s; every ${interval} minutes; type ${taskDraft.taskType}`
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
      `Safe Static IP/VPS draft: domain ${staticIpDraft.domain}; ip ${staticIpDraft.ipAddress}; action ${staticIpDraft.action}`
    );
  }

  return (
    <section className="cp-inventory-section">
      <article className="panel-card cp-inventory-summary">
        <div>
          <span className="status-pill blue">Advanced Tools</span>
          <h2>{activity?.cpLogin || "Advance"}</h2>
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
            <h3>{runtimeDashboard?.cpLogin || "Runtime Inventory"}</h3>
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
        {isLoadingRuntime && <p className="empty-state">Loading runtime inventory...</p>}
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
            <p>Requires real gateway for the old task form values without writing to the legacy `tasks` table.</p>
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
            <button className="primary-button compact" type="submit">Run Real Test</button>
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
            <p>Requires real gateway for static IP, VPS domain binding, snapshot, and backup planning without touching provider data.</p>
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
            <button className="primary-button compact" type="submit">Run Real Test</button>
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
  if (isLoading) return <p className="empty-state">Loading workqueue activity...</p>;
  if (error) {
    return (
      <div className="panel-card dashboard-error-panel">
        <p>{error}</p>
        <button className="secondary-button compact" type="button" onClick={onRetry}>Retry</button>
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
        ["Worker Name", "{cpLogin}-{taskID}"]
      ],
      actions: ["Add URL Task", "Add Windows Task", "Task Logs", "Delete Task"]
    },
    {
      badge: "Node",
      title: "Node.js Deploy",
      description: "IISNode, HTTP Platform Handler, sub-application, Git deploy, and ZIP deploy staging.",
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

function DomainServicesSection({ mode, cpId }) {
  const { activity, isLoading: isLoadingActivity, error: activityError, reload: reloadActivity } = useHostingActivity(cpId);
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [domainError, setDomainError] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [domainMessage, setDomainMessage] = useState("");
  const [dnsDraft, setDnsDraft] = useState({
    host: "@",
    type: "A",
    value: "208.98.35.146",
    ttl: "3600",
    priority: "10"
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
    sslMode: "Full",
    redirectWww: true
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
  const modeCopy = {
    dns: {
      title: "DNS",
      label: "Live DNS",
      description: "Mapped domains that can move into DNS record management once the DNS helper gateway is wired.",
      actions: ["Preview Records", "Add A Record", "Add CNAME", "Add MX", "Import Zone", "Scan Records", "Publish DNS"],
      statOne: "Domains",
      statTwo: "Default Domains",
      statThree: "Sites"
    },
    cdn: {
      title: "CDN",
      label: "Live CDN",
      description: "Cloudflare/CDN readiness from mapped hosting domains. Purge and mode changes stay requires real gateway for the remote gateway pass.",
      actions: ["Create Tenant", "Invite User", "Add Zone", "Enable CDN", "Disable CDN", "Purge Cache", "SSL Mode", "WWW Redirect"],
      statOne: "Domains",
      statTwo: "CDN Enabled",
      statThree: "Sites"
    },
    ssl: {
      title: "SSL",
      label: "Live SSL",
      description: "SSL binding inventory from mapped domains. Free SSL and certificate install flows are requires real gateway for the Namecheap/LetSSL pass.",
      actions: ["Free SSL", "Import SSL", "Install Certificate", "Reinstall", "Approver Email", "Renew SSL", "Delete SSL"],
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

  async function queueDomainServiceTest(action, domain = null, details = "") {
    setDomainMessage("");
    try {
      await createPanelTestActivity(cpId, {
        from: domain ? `${mode}:${domain.label}` : `${mode}:${action}`,
        to: domain ? domain.siteName : `/panel-test/${mode}`,
        server: `${mode}-manager`,
        note: details || `Safe ${mode.toUpperCase()} planning row for ${action}`
      });
      setDomainMessage(`${action} test activity created.`);
      await reloadActivity();
    } catch (error) {
      setDomainMessage(error.message);
    }
  }

  function submitDnsDraft(event) {
    event.preventDefault();
    const ttl = Math.max(300, Math.min(86400, Number(dnsDraft.ttl) || 3600));
    const priorityNote = ["MX", "SRV"].includes(dnsDraft.type) ? `; priority ${dnsDraft.priority || "10"}` : "";
    queueDomainServiceTest(
      `${dnsDraft.type} Record`,
      null,
      `Safe DNS record draft: host ${dnsDraft.host || "@"}; type ${dnsDraft.type}; value ${dnsDraft.value}; ttl ${ttl}${priorityNote}`
    );
  }

  function submitSslDraft(event) {
    event.preventDefault();
    queueDomainServiceTest(
      sslDraft.action,
      null,
      `Safe SSL certificate draft: domain ${sslDraft.domain}; type ${sslDraft.certificateType}; approver ${sslDraft.approverEmail}; action ${sslDraft.action}`
    );
  }

  function submitCdnDraft(event) {
    event.preventDefault();
    queueDomainServiceTest(
      cdnDraft.mode,
      null,
      `Safe CDN/Cloudflare draft: domain ${cdnDraft.domain}; mode ${cdnDraft.mode}; SSL mode ${cdnDraft.sslMode}; redirect www ${cdnDraft.redirectWww ? "yes" : "no"}`
    );
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
          <h2>{sitesDashboard?.cpLogin || `${modeCopy.title} Manager`}</h2>
          <p>{modeCopy.description}</p>
        </div>
        <div className="database-total-grid">
          <div><span>{modeCopy.statOne}</span><strong>{domains.length}</strong></div>
          <div><span>{modeCopy.statTwo}</span><strong>{enabledCount}</strong></div>
          <div><span>{modeCopy.statThree}</span><strong>{uniqueSites}</strong></div>
        </div>
        <RefreshButton onClick={refreshDomainServiceSection} />
      </article>

      <div className="database-toolbar panel-card">
        <div className="database-actions">
          {modeCopy.actions.map((action, index) => (
            <button className={index === 0 ? "primary-button compact" : "secondary-button compact"} type="button" key={action} onClick={() => queueDomainServiceTest(action)}>
              {action}
            </button>
          ))}
        </div>
      </div>

      {mode === "dns" && (
        <article className="panel-card dns-record-draft-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">DNS Draft</span>
              <h3>Record Editor</h3>
              <p>Requires real gateway for DNS record values for the rebuilt DNS action flow without publishing provider changes.</p>
            </div>
            <MenuIcon name="dns" />
          </div>
          <form className="advance-inline-form" onSubmit={submitDnsDraft}>
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
                <option value="TXT">TXT</option>
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
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>
      )}

      {mode === "ssl" && (
        <article className="panel-card dns-record-draft-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">SSL Draft</span>
              <h3>Certificate Workflow</h3>
              <p>Requires real gateway for free SSL, import, install, approver email, renewal, and delete requests without touching certificate bindings.</p>
            </div>
            <MenuIcon name="ssl" />
          </div>
          <form className="advance-inline-form" onSubmit={submitSslDraft}>
            <label>
              Domain
              <input value={sslDraft.domain} onChange={(event) => setSslDraft((draft) => ({ ...draft, domain: event.target.value }))} />
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
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>
      )}

      {mode === "cdn" && (
        <article className="panel-card dns-record-draft-card">
          <div className="database-card-header">
            <div>
              <span className="status-pill blue">CDN Draft</span>
              <h3>Cloudflare / CDN Workflow</h3>
              <p>Requires real gateway for tenant, zone, purge, SSL mode, and redirect actions without changing Cloudflare provider data.</p>
            </div>
            <MenuIcon name="cdn" />
          </div>
          <form className="advance-inline-form" onSubmit={submitCdnDraft}>
            <label>
              Domain
              <input value={cdnDraft.domain} onChange={(event) => setCdnDraft((draft) => ({ ...draft, domain: event.target.value }))} />
            </label>
            <label>
              Mode
              <select value={cdnDraft.mode} onChange={(event) => setCdnDraft((draft) => ({ ...draft, mode: event.target.value }))}>
                <option>Create Tenant</option>
                <option>Invite User</option>
                <option>Add Zone</option>
                <option>Enable CDN</option>
                <option>Disable CDN</option>
                <option>Purge Cache</option>
                <option>Set SSL Mode</option>
              </select>
            </label>
            <label>
              SSL Mode
              <select value={cdnDraft.sslMode} onChange={(event) => setCdnDraft((draft) => ({ ...draft, sslMode: event.target.value }))}>
                <option>Flexible</option>
                <option>Full</option>
                <option>Full Strict</option>
              </select>
            </label>
            <label className="checkbox-line">
              <input type="checkbox" checked={cdnDraft.redirectWww} onChange={(event) => setCdnDraft((draft) => ({ ...draft, redirectWww: event.target.checked }))} />
              Redirect non-www to www
            </label>
            <button className="primary-button compact" type="submit">Run Real Test</button>
          </form>
        </article>
      )}

      {isLoadingDomains && <p className="empty-state">Loading mapped domains from cp_config_Domains...</p>}
      {isLoadingSecurity && <p className="empty-state">Loading {mode.toUpperCase()} legacy inventory...</p>}
      {domainMessage && <p className="sandbox-message">{domainMessage}</p>}
      {securityError && <p className="inline-status">{securityError}</p>}
      {domainError && (
        <div className="panel-card dashboard-error-panel">
          <p>{domainError}</p>
          <button className="secondary-button compact" type="button" onClick={loadDomainServices}>Retry</button>
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
      {securityRows.map((section) => (
        <RuntimeRows key={section.title} title={section.title} rows={section.rows} emptyText={section.emptyText} />
      ))}

      {!!domains.length && (
        <div className="domain-service-grid">
          {domains.map((domain) => (
            <article className="panel-card domain-service-card" key={`${mode}-${domain.domainUid}-${domain.label}`}>
              <div className="database-card-header">
                <div>
                  <span className={domain.ssl ? "status-pill" : "status-pill muted"}>
                    {mode === "cdn" ? (domain.cdn ? "CDN on" : "CDN off") : mode === "ssl" ? (domain.ssl ? "SSL ready" : "SSL pending") : (domain.isDefault ? "Default" : "Mapped")}
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
                {modeCopy.actions.slice(0, 3).map((action) => (
                  <button className="secondary-button compact" type="button" key={action} onClick={() => queueDomainServiceTest(action, domain)}>{action}</button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      <ActivityList jobs={domainJobs} isLoading={isLoadingActivity} error={activityError} emptyTitle={`No recent ${mode.toUpperCase()} jobs`} onRetry={reloadActivity} />
    </section>
  );
}

function MenuIcon({ name }) {
  const icons = {
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
    settings: (
      <>
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21a2 2 0 0 1-4 0v-.08a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.05.05a2 2 0 0 1-2.83-2.83l.05-.05A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.66-1.1H2.9a2 2 0 0 1 0-4h.08A1.8 1.8 0 0 0 4.6 8.8a1.8 1.8 0 0 0-.36-1.98l-.05-.05a2 2 0 0 1 2.83-2.83l.05.05a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.1-1.66V2.6a2 2 0 0 1 4 0v.08a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.05-.05a2 2 0 0 1 2.83 2.83l-.05.05a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.66 1.1h.08a2 2 0 0 1 0 4h-.08A1.8 1.8 0 0 0 19.4 15Z" />
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

function DashboardSection({ activeSection, dashboard, dashboardError, isDashboardLoading, onChangeSection, onManageHosting, onReloadDashboard }) {
  if (activeSection === "domain") return <DomainSection />;
  if (activeSection === "vpn") return <VpnSection />;
  if (activeSection === "addon") return <AddonSection />;
  if (activeSection === "affiliate") return <AffiliateSection />;
  if (activeSection === "billing") return <BillingSection onChangeSection={onChangeSection} />;
  if (activeSection === "settings") return <SettingsSection />;
  if (activeSection === "new-order") return <NewOrderSection onChangeSection={onChangeSection} />;
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
    { type: "domain-transfer", title: "Transfer an Existing Domain", icon: "globe", description: "Move an existing domain to this account." }
  ];
  const [activeType, setActiveType] = useState("hosting");
  const [catalog, setCatalog] = useState(null);
  const [selectedPrices, setSelectedPrices] = useState({});
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [busyProductId, setBusyProductId] = useState(null);
  const [transferDomain, setTransferDomain] = useState("");
  const [transferWhois, setTransferWhois] = useState(false);
  const [isTransferBusy, setIsTransferBusy] = useState(false);

  const activeOption = orderOptions.find((option) => option.type === activeType) ?? orderOptions[0];

  useEffect(() => {
    let ignore = false;
    const option = orderOptions.find((item) => item.type === activeType);
    setCatalog(null);
    setCheckoutOrder(null);
    setMessage("");

    if (!option?.catalog) {
      return () => {
        ignore = true;
      };
    }

    async function loadCatalog() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/account/new-orders/catalog?type=${encodeURIComponent(activeType)}`);
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
    setCheckoutOrder(null);

    try {
      const response = await fetch("/api/account/new-orders/checkout", {
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

      setCheckoutOrder(result.order);
      setMessage("Checkout order created.");
    } catch {
      setMessage("Unable to reach checkout service.");
    } finally {
      setBusyProductId(null);
    }
  }

  async function createTransferCheckout() {
    setIsTransferBusy(true);
    setMessage("");
    setCheckoutOrder(null);

    try {
      const response = await fetch("/api/account/new-orders/domain-transfer/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: transferDomain,
          whoisPrivacy: transferWhois
        })
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setMessage(result?.message ?? "Unable to create transfer checkout.");
        return;
      }

      setCheckoutOrder(result.order);
      setMessage("Domain transfer checkout created.");
    } catch {
      setMessage("Unable to reach domain transfer checkout.");
    } finally {
      setIsTransferBusy(false);
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
              <span className="eyebrow">New Order</span>
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

          {activeType === "domain-transfer" && (
            <div className="new-order-empty">
              <p>Enter a domain to transfer. Pricing comes from the same TLD product price table used by the old transfer page.</p>
              <div className="new-order-transfer-row">
                <input
                  type="text"
                  placeholder="example.com"
                  aria-label="Domain to transfer"
                  value={transferDomain}
                  onChange={(event) => setTransferDomain(event.target.value)}
                />
                <button className="primary-button compact" type="button" disabled={isTransferBusy} onClick={createTransferCheckout}>
                  {isTransferBusy ? "Creating..." : "Create Checkout"}
                </button>
              </div>
              <label className="new-order-checkbox">
                <input type="checkbox" checked={transferWhois} onChange={(event) => setTransferWhois(event.target.checked)} />
                <span>Add Whois Privacy (+$8)</span>
              </label>
            </div>
          )}

          {activeOption.catalog && (
            <>
              {isLoading && <p className="inline-status">Loading live catalog...</p>}
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
                          {busyProductId === product.productId ? "Creating..." : "Create Checkout"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

            </>
          )}

          {checkoutOrder && (
            <aside className="checkout-ready-row new-order-checkout">
              <span>{checkoutOrder.guid}</span>
              <a className="primary-button compact as-link" href={checkoutOrder.checkoutUrl}>Open Checkout</a>
            </aside>
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
  const statusSummary = dashboard?.hostingStatusSummary ?? [];
  const [renewalBusyId, setRenewalBusyId] = useState(null);
  const [renewalPreview, setRenewalPreview] = useState(null);
  const [renewalMessage, setRenewalMessage] = useState("");
  const [urgentBusyId, setUrgentBusyId] = useState(null);
  const [urgentMessage, setUrgentMessage] = useState("");

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

  return (
    <section className="hosting-stack">
      <article className="panel-card account-summary-panel">
        <div>
          <span className="status-pill blue">Live account data</span>
          <h2>{dashboard?.customer?.login ?? "Account"}</h2>
          <p>
            Customer ID {dashboard?.customer?.customerId ?? "loading"} · {dashboard?.customer?.customerType ?? "loading"}
          </p>
        </div>
        <div className="account-summary-stats">
          {statusSummary.length ? statusSummary.map((item) => (
            <div key={item.status}>
              <strong>{item.count}</strong>
              <span>{item.status}</span>
            </div>
          )) : (
            <div>
              <strong>{isDashboardLoading ? "..." : "0"}</strong>
              <span>Hosting plans</span>
            </div>
          )}
        </div>
      </article>

      {dashboardError && (
        <article className="panel-card dashboard-error-panel">
          <p>{dashboardError}</p>
          <button className="secondary-button compact" type="button" onClick={onReloadDashboard}>Retry</button>
        </article>
      )}

      {(isDashboardLoading || urgentLogs.length > 0 || urgentMessage) && (
        <div className="panel-card urgent-panel">
          <div className="renewal-panel-header">
            <h2>Urgent Notices</h2>
            <span>{isDashboardLoading ? "Loading" : `${urgentLogs.length} items`}</span>
          </div>
          <div className="urgent-list">
            {isDashboardLoading && <p className="empty-state">Loading urgent notices...</p>}
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
                  {urgentBusyId === log.id ? "Hiding..." : "Dismiss"}
                </button>
              </article>
            ))}
          </div>
          {urgentMessage && <p className="renewal-action-message">{urgentMessage}</p>}
        </div>
      )}

      <div className="panel-card renewal-panel">
        <div className="renewal-panel-header">
          <h2>Renewal Notice</h2>
          <span>{isDashboardLoading ? "Loading" : `${notices.length} items`}</span>
        </div>
        <div className="renewal-list">
          {isDashboardLoading && <p className="empty-state">Loading renewal notices...</p>}
          {!isDashboardLoading && !notices.length && <p className="empty-state">No renewal notices found for this account.</p>}
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
                  {renewalBusyId === notice.clientProductId ? "Checking..." : "Renew"}
                </button>
              </div>
            </article>
          ))}
        </div>
        {renewalMessage && <p className="renewal-action-message">{renewalMessage}</p>}
        {renewalPreview && <RenewalCheckoutPreview renewal={renewalPreview} onClose={() => setRenewalPreview(null)} onCheckout={createHostingRenewalCheckout} />}
      </div>

      <div className="card-grid">
        {isDashboardLoading && (
          <article className="service-card">
            <span className="status-pill blue">Loading</span>
            <h2>Loading hosting plans...</h2>
            <p>Pulling your hosting accounts from ehbconfig.</p>
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
              <p>{account.primaryDomain}</p>
            </div>
            <dl className="card-meta">
              <div><dt>Renewal</dt><dd>{formatDate(account.renewalDate)}</dd></div>
              <div><dt>Plan</dt><dd>{account.webHostType}</dd></div>
              <div><dt>Total Sites</dt><dd>{account.totalSites}</dd></div>
              <div><dt>Server</dt><dd>{account.serverId}</dd></div>
            </dl>
            <div className="hosting-card-actions">
              <button className="secondary-button" type="button" onClick={onManageHosting}>Manage</button>
              <button
                className="secondary-button"
                type="button"
                disabled={!account.clientProductId || renewalBusyId !== null}
                onClick={() => loadHostingRenewalPreview({
                  clientProductId: account.clientProductId,
                  name: account.cpLogin
                })}
              >
                {renewalBusyId === account.clientProductId ? "Checking..." : "Renew"}
              </button>
              <button className="primary-button" type="button" onClick={onOpenNewOrder}>
                Upgrade
              </button>
            </div>
          </article>
        ))}
      </div>

      <KnowledgeBaseCard title="Hosting Guides" articles={hostingKbArticles} />

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

function formatDateTime(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
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

const domainRegistrarActionDefaults = {
  nameservers: "NS1.SITE4NOW.NET, NS2.SITE4NOW.NET",
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
  const [domainTransferWhois, setDomainTransferWhois] = useState(false);
  const [domainTransferPreview, setDomainTransferPreview] = useState(null);
  const [domainTransferMessage, setDomainTransferMessage] = useState("");
  const [isDomainTransferBusy, setIsDomainTransferBusy] = useState(false);
  const [domainLookupMessage, setDomainLookupMessage] = useState("");
  const [isDomainSearching, setIsDomainSearching] = useState(false);
  const [isDomainCheckingOut, setIsDomainCheckingOut] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [domainServiceStatus, setDomainServiceStatus] = useState(null);
  const [domainRenewalPreview, setDomainRenewalPreview] = useState(null);
  const [domainActionMessage, setDomainActionMessage] = useState("");
  const [domainDnsPreview, setDomainDnsPreview] = useState([]);
  const [isDomainActionBusy, setIsDomainActionBusy] = useState(false);
  const [domainRegistrarForm, setDomainRegistrarForm] = useState({
    action: "nameservers",
    value: domainRegistrarActionDefaults.nameservers
  });
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
          domainName: domainTransferName,
          whoisPrivacy: domainTransferWhois
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainTransferMessage(result?.message ?? "Unable to create domain transfer checkout.");
        return;
      }

      setDomainTransferPreview(toCheckoutPreview(result.order, 1));
      setDomainTransferMessage(result.message);
    } catch {
      setDomainTransferMessage("Unable to reach domain transfer checkout service.");
    } finally {
      setIsDomainTransferBusy(false);
    }
  }

  async function renewSelectedDomain() {
    if (!selectedDomain?.clientProductId) return;
    setIsDomainActionBusy(true);
    setDomainActionMessage("");
    setDomainRenewalPreview(null);

    try {
      const response = await fetch(`/api/account/renewals/${selectedDomain.clientProductId}/renew`, { method: "POST" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setDomainActionMessage(result?.message ?? "Unable to prepare domain renewal.");
        return;
      }

      setDomainRenewalPreview(result.renewal);
      setDomainActionMessage(result.message);
    } catch {
      setDomainActionMessage("Unable to reach domain renewal service.");
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
    setDomainRegistrarForm({
      action,
      value: action === "dns" ? dnsDefault : domainRegistrarActionDefaults[action] ?? ""
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

  return (
    <section className="domain-section">
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
            {isDomainSearching ? "Searching..." : "Search"}
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
              {isDomainCheckingOut ? "Checking..." : "Checkout Domains"}
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
            <p>Move a domain into this account and create the transfer checkout from the live TLD price table.</p>
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
          <label className="domain-transfer-checkbox">
            <input
              type="checkbox"
              checked={domainTransferWhois}
              onChange={(event) => setDomainTransferWhois(event.target.checked)}
            />
            <span>Add Whois Privacy (+$8)</span>
          </label>
          <button className="primary-button compact" type="submit" disabled={isDomainTransferBusy}>
            {isDomainTransferBusy ? "Creating..." : "Create Transfer Checkout"}
          </button>
        </form>
        {domainTransferMessage && <p className="inline-status">{domainTransferMessage}</p>}
        {domainTransferPreview && <CheckoutPreviewCard preview={domainTransferPreview} onClose={() => setDomainTransferPreview(null)} />}
      </article>

      <article className="panel-card domain-live-panel">
        <div className="domain-live-header">
          <div>
            <span className="status-pill blue">Live domains</span>
            <h2>My Domain Names</h2>
          </div>
          <RefreshButton onClick={loadAccountDomains} />
        </div>
        {domainServiceStatus && (
          <div className="service-status-grid">
            {[domainServiceStatus.openSrs, domainServiceStatus.dns].map((service) => (
              <div className="service-status-card" key={service.name}>
                <div>
                  <span>{service.name}</span>
                  <strong>{service.state}</strong>
                </div>
                <p>{service.message}</p>
              </div>
            ))}
          </div>
        )}
        <div className="search-row compact-search">
          <input
            type="search"
            placeholder="Filter my domains..."
            value={domainSearch}
            onChange={(event) => setDomainSearch(event.target.value)}
          />
        </div>
        {isLoadingDomains && <p className="empty-state">Loading domains from domain_profile...</p>}
        {domainError && (
          <div className="dashboard-error-panel inline-error">
            <p>{domainError}</p>
            <button className="secondary-button compact" type="button" onClick={loadAccountDomains}>Retry</button>
          </div>
        )}
        {!isLoadingDomains && !domainError && !filteredDomains.length && (
          <p className="empty-state">No domains found for this account.</p>
        )}
        {!!filteredDomains.length && (
          <DataTable
            columns={["Domain Name", "Status", "Expiration", "Days Left", "Action"]}
            rows={filteredDomains.map((domain) => [
              domain.domainName,
              <span className={domain.status === "completed" ? "status-pill" : "status-pill muted"}>{domain.status}</span>,
              formatDate(domain.expirationDate),
              domain.daysLeft ?? "N/A",
              <button className="secondary-button compact" type="button" onClick={() => setSelectedDomain(domain)}>Manage</button>
            ])}
          />
        )}
        {selectedDomain && (
          <aside className="billing-detail-card">
            <div className="billing-detail-header">
              <span className="status-pill blue">Domain</span>
              <button className="ghost-button compact" type="button" onClick={() => setSelectedDomain(null)}>Close</button>
            </div>
            <h3>{selectedDomain.domainName}</h3>
            <dl className="card-meta single">
              <div><dt>Domain Profile ID</dt><dd>{selectedDomain.id}</dd></div>
              <div><dt>Client Product ID</dt><dd>{selectedDomain.clientProductId || "N/A"}</dd></div>
              <div><dt>Status</dt><dd>{selectedDomain.status}</dd></div>
              <div><dt>Registrar Status</dt><dd>{selectedDomain.registerStatus || "N/A"}</dd></div>
              <div><dt>Expiration</dt><dd>{formatDate(selectedDomain.expirationDate)}</dd></div>
              <div><dt>Days Left</dt><dd>{selectedDomain.daysLeft ?? "N/A"}</dd></div>
            </dl>
            <div className="billing-action-row">
              <button
                className="primary-button"
                type="button"
                disabled={!selectedDomain.clientProductId || isDomainActionBusy}
                onClick={renewSelectedDomain}
              >
                {isDomainActionBusy ? "Checking..." : "Renew Domain"}
              </button>
            </div>
            <div className="domain-quick-actions" aria-label="Domain quick actions">
              {[
                ["status", "Status"],
                ["auth-code", "Auth Code"],
                ["lock", "Lock"],
                ["unlock", "Unlock"],
                ["privacy-on", "Privacy On"],
                ["privacy-off", "Privacy Off"],
                ["auto-renew-on", "Auto Renew On"],
                ["auto-renew-off", "Auto Renew Off"],
                ["dns", "DNS"]
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
              <label>
                Registrar Action
                <select
                  className="inline-select"
                  value={domainRegistrarForm.action}
                  onChange={(event) => selectDomainRegistrarAction(event.target.value)}
                >
                  <option value="nameservers">Update Nameservers</option>
                  <option value="contact">Update Contact</option>
                  <option value="privacy-on">Enable WHOIS Privacy</option>
                  <option value="privacy-off">Disable WHOIS Privacy</option>
                  <option value="lock">Lock Domain</option>
                  <option value="unlock">Unlock Domain</option>
                  <option value="status">Refresh Registrar Status</option>
                  <option value="auth-code">Get Auth Code</option>
                  <option value="auto-renew-on">Enable Auto Renew</option>
                  <option value="auto-renew-off">Disable Auto Renew</option>
                  <option value="forwarding">Update Forwarding Email</option>
                  <option value="dns">Update DNS</option>
                </select>
              </label>
              {renderDomainRegistrarFields()}
              <button className="secondary-button" type="submit" disabled={isDomainActionBusy}>
                {isDomainActionBusy ? "Working..." : "Run Action"}
              </button>
            </form>
            {domainActionMessage && <p className="renewal-action-message">{domainActionMessage}</p>}
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
      <article className="panel-card vpn-summary">
        <div className="billing-header">
          <div>
            <span className="status-pill blue">Live VPN</span>
            <h2>VPN Services</h2>
          </div>
          <RefreshButton onClick={loadVpn} />
        </div>
        <div className="vpn-quota-row">
          <div>
            <span>VPN User Quota</span>
            <strong>{quotaLabel}</strong>
          </div>
          <div className="vpn-quota-meter" aria-label={`VPN quota ${quotaPercent}% used`}>
            <span style={{ width: `${quotaPercent}%` }} />
          </div>
        </div>
      </article>

      {isLoadingVpn && <p className="empty-state">Loading VPN services...</p>}
      {vpnError && (
        <div className="dashboard-error-panel inline-error">
          <p>{vpnError}</p>
          <button className="secondary-button compact" type="button" onClick={loadVpn}>Retry</button>
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
            {isVpnCheckingOut ? "Creating..." : "Buy VPN"}
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
  const [addonCart, setAddonCart] = useState([]);
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

  function addAddonToCart(addon) {
    const selection = getAddonSelection(addon);
    const price = addon.prices.find((item) => item.priceId === Number(selection.priceId)) ?? addon.prices[0];
    if (!price) return;
    const quantity = Math.max(1, Math.min(99, Number(selection.quantity) || 1));
    const cpId = Number(selection.cpId) || 0;
    const hostingAccount = addonHostingAccounts.find((account) => Number(account.cpId) === cpId);
    setAddonCart((items) => {
      const existing = items.find((item) => item.productId === addon.productId && item.priceId === price.priceId && item.cpId === cpId);
      if (existing) {
        return items.map((item) => item === existing ? { ...item, qty: Math.min(99, item.qty + quantity) } : item);
      }
      return [...items, {
        productId: addon.productId,
        priceId: price.priceId,
        cpId,
        cpLabel: hostingAccount?.cpLogin ?? "No hosting target",
        name: addon.name,
        term: price.paymentTerm,
        amount: price.amount,
        currency: price.currency,
        qty: quantity
      }];
    });
  }

  function removeAddonFromCart(productId, priceId, cpId) {
    setAddonCart((items) => items.filter((item) => item.productId !== productId || item.priceId !== priceId || item.cpId !== cpId));
  }

  async function checkoutAddons() {
    setIsAddonCheckingOut(true);
    setAddonCheckoutMessage("");
    setAddonCheckoutPreview(null);

    try {
      const response = await fetch("/api/account/addons/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: addonCart.map((item) => ({ productId: item.productId, priceId: item.priceId, quantity: item.qty, cpId: item.cpId })) })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setAddonCheckoutMessage(result?.message ?? "Unable to create add-on checkout.");
        return;
      }

      setAddonCheckoutPreview(toCheckoutPreview(result.order, addonCart.length));
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

  const addonCartTotal = addonCart.reduce((total, item) => total + (Number(item.amount) * item.qty), 0);

  return (
    <section className="addon-section">
      <article className="panel-card addon-catalog-panel">
        <div className="billing-header">
          <div>
            <span className="status-pill blue">Live catalog</span>
            <h2>Available Add-Ons</h2>
          </div>
          <RefreshButton onClick={loadAddons} />
        </div>
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
                {category}
              </button>
            ))}
          </div>
        )}
        {isLoadingAddons && <p className="empty-state">Loading add-on catalog...</p>}
        {addonError && (
          <div className="dashboard-error-panel inline-error">
            <p>{addonError}</p>
            <button className="secondary-button compact" type="button" onClick={loadAddons}>Retry</button>
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
                <button className="secondary-button compact" type="button" onClick={() => addAddonToCart(addon)}>Add</button>
              ];
            })}
          />
        )}
        {!!addonCart.length && (
          <div className="domain-cart">
            <div className="domain-cart-header">
              <span>Add-On Order Summary</span>
              <strong>{formatMoney(addonCartTotal)}</strong>
            </div>
            {addonCart.map((item) => (
              <div className="domain-cart-item" key={`${item.productId}-${item.priceId}-${item.cpId}`}>
                <span>{item.name} · {formatPaymentTerm(item.term)} · {item.cpLabel} · Qty {item.qty}</span>
                <button className="ghost-button compact" type="button" onClick={() => removeAddonFromCart(item.productId, item.priceId, item.cpId)}>Remove</button>
              </div>
            ))}
            <button className="primary-button" type="button" disabled={isAddonCheckingOut} onClick={checkoutAddons}>
              {isAddonCheckingOut ? "Checking..." : "Checkout Add-Ons"}
            </button>
            {addonCheckoutMessage && <p className="renewal-action-message">{addonCheckoutMessage}</p>}
            {addonCheckoutPreview && <CheckoutPreviewCard preview={addonCheckoutPreview} onClose={() => setAddonCheckoutPreview(null)} />}
          </div>
        )}
      </article>

      <article className="panel-card addon-active-panel">
        <div className="billing-header">
          <div>
            <span className="status-pill">Current</span>
            <h2>My Active Add-Ons</h2>
          </div>
          <span className="muted-count">{activeAddons.length} items</span>
        </div>
        {isLoadingAddons && <p className="empty-state">Loading active add-ons...</p>}
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
                {isAddonActionBusy ? "Checking..." : "Renew Add-On"}
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

function BillingSection({ onChangeSection }) {
  const billingTabsLive = [
    ["purchases", "My Purchases"],
    ["active", "Current Active Products"],
    ["balance", "Account Balance"],
    ["renewal", "Renewal Notice"]
  ];
  const [activeTab, setActiveTab] = useState("purchases");
  const [billing, setBilling] = useState(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(true);
  const [billingError, setBillingError] = useState("");

  async function loadBilling() {
    setIsLoadingBilling(true);
    setBillingError("");
    try {
      const response = await fetch("/api/account/billing");
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
  }, []);

  return (
    <section className="panel-card billing-panel">
      <div className="billing-header">
        <div>
          <span className="status-pill blue">Live billing</span>
          <h2>Billing</h2>
        </div>
        <RefreshButton onClick={loadBilling} />
      </div>
      <div className="tabs" role="tablist" aria-label="Billing tabs">
        {billingTabsLive.map(([id, label]) => (
          <button
            aria-selected={id === activeTab}
            className={id === activeTab ? "tab active" : "tab"}
            key={id}
            role="tab"
            type="button"
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoadingBilling && <p className="empty-state">Loading billing data...</p>}
      {billingError && (
        <div className="dashboard-error-panel inline-error">
          <p>{billingError}</p>
          <button className="secondary-button compact" type="button" onClick={loadBilling}>Retry</button>
        </div>
      )}
      {!isLoadingBilling && !billingError && (
        <BillingTabPanel activeTab={activeTab} billing={billing} onReloadBilling={loadBilling} />
      )}
    </section>
  );
}

function BillingTabPanel({ activeTab, billing, onReloadBilling }) {
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [renewalPreview, setRenewalPreview] = useState(null);
  const [selectedRenewalCheckoutPreview, setSelectedRenewalCheckoutPreview] = useState(null);
  const [renewalMessage, setRenewalMessage] = useState("");
  const [renewalBusyId, setRenewalBusyId] = useState(null);
  const [invoiceMessage, setInvoiceMessage] = useState("");
  const [invoiceBusyId, setInvoiceBusyId] = useState(null);
  const [balanceActionMessage, setBalanceActionMessage] = useState("");
  const [depositAmount, setDepositAmount] = useState("25.00");
  const [transferAmount, setTransferAmount] = useState("10.00");
  const [transferTarget, setTransferTarget] = useState("");
  const [balanceCheckoutPreview, setBalanceCheckoutPreview] = useState(null);
  const [transferPreview, setTransferPreview] = useState(null);
  const [isBalanceActionBusy, setIsBalanceActionBusy] = useState(false);
  const [productActionMessage, setProductActionMessage] = useState("");
  const [selectedRenewalIds, setSelectedRenewalIds] = useState([]);
  const creditTransactions = billing?.creditTransactions ?? [];

  async function loadInvoice(purchase) {
    setInvoiceBusyId(purchase.orderId);
    setInvoiceMessage("");
    setSelectedPurchase(null);

    try {
      const response = await fetch(`/api/account/billing/orders/${purchase.orderId}/invoice`);
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setInvoiceMessage(result?.message ?? "Unable to load invoice.");
        return;
      }

      setSelectedPurchase(result.invoice);
    } catch {
      setInvoiceMessage("Unable to reach invoice service.");
    } finally {
      setInvoiceBusyId(null);
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

  async function createDepositCheckout() {
    setIsBalanceActionBusy(true);
    setBalanceActionMessage("");
    setBalanceCheckoutPreview(null);
    setTransferPreview(null);

    try {
      const response = await fetch("/api/account/billing/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(depositAmount) })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setBalanceActionMessage(result?.message ?? "Unable to create deposit checkout.");
        return;
      }

      setBalanceCheckoutPreview(toCheckoutPreview(result.order));
      setBalanceActionMessage(result.message);
    } catch {
      setBalanceActionMessage("Unable to reach deposit checkout service.");
    } finally {
      setIsBalanceActionBusy(false);
    }
  }

  async function checkTransferCredit() {
    setIsBalanceActionBusy(true);
    setBalanceActionMessage("");
    setBalanceCheckoutPreview(null);
    setTransferPreview(null);

    try {
      const response = await fetch("/api/account/billing/transfer-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(transferAmount), targetLogin: transferTarget })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setBalanceActionMessage(result?.message ?? "Unable to check transfer.");
        return;
      }

      setTransferPreview(result.preview);
      setBalanceActionMessage(result.preview?.note ?? result.message);
    } catch {
      setBalanceActionMessage("Unable to reach transfer service.");
    } finally {
      setIsBalanceActionBusy(false);
    }
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
          <p>Deposit money into the account balance or check whether a credit transfer can be made to another account.</p>
          <div className="balance-action-grid">
            <label>
              Deposit Amount
              <input type="number" min="1" step="0.01" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} />
            </label>
            <button className="primary-button" type="button" disabled={isBalanceActionBusy} onClick={createDepositCheckout}>
              {isBalanceActionBusy ? "Checking..." : "Deposit Money"}
            </button>
            <label>
              Transfer To
              <input type="text" placeholder="customer login" value={transferTarget} onChange={(event) => setTransferTarget(event.target.value)} />
            </label>
            <label>
              Transfer Amount
              <input type="number" min="1" step="0.01" value={transferAmount} onChange={(event) => setTransferAmount(event.target.value)} />
            </label>
            <button className="secondary-button" type="button" disabled={isBalanceActionBusy || !transferTarget.trim()} onClick={checkTransferCredit}>
              {isBalanceActionBusy ? "Checking..." : "Check Transfer"}
            </button>
          </div>
          {balanceActionMessage && <p className="renewal-action-message">{balanceActionMessage}</p>}
          {balanceCheckoutPreview && <CheckoutPreviewCard preview={balanceCheckoutPreview} onClose={() => setBalanceCheckoutPreview(null)} />}
          {transferPreview && (
            <div className="transfer-preview-card">
              <span className={transferPreview.eligible ? "status-pill" : "status-pill muted"}>
                {transferPreview.eligible ? "Eligible" : "Not eligible"}
              </span>
              <dl className="card-meta single">
                <div><dt>Target</dt><dd>{transferPreview.targetLogin}</dd></div>
                <div><dt>Target ID</dt><dd>{transferPreview.targetCustomerId ?? "N/A"}</dd></div>
                <div><dt>Amount</dt><dd>{formatMoney(transferPreview.amount)}</dd></div>
                <div><dt>Available Balance</dt><dd>{formatMoney(transferPreview.availableBalance)}</dd></div>
              </dl>
            </div>
          )}
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
              <p>Bank wire processing fee is $30. Include the fee with the transfer.</p>
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
            <button className="secondary-button compact" type="button" onClick={() => setSelectedProduct(product)}>Details</button>
          ])}
        />
        {selectedProduct && (
          <BillingProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onManage={() => manageProduct(selectedProduct)}
            onRenew={() => runRenewalAction(selectedProduct, "renew")}
          />
        )}
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
            {renewalBusyId === "many" ? "Creating..." : "Renew Selected"}
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
                {renewalBusyId === `renew-${product.clientProductId}` ? "Checking..." : "Renew"}
              </button>
              <button
                className="ghost-button compact"
                type="button"
                disabled={renewalBusyId !== null}
                onClick={() => runRenewalAction(product, "hide")}
              >
                {renewalBusyId === `hide-${product.clientProductId}` ? "Hiding..." : "Hide"}
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
  const pendingCheckouts = billing?.pendingCheckouts ?? [];
  const pendingRenewCheckouts = billing?.pendingRenewCheckouts ?? [];
  return purchases.length || pendingCheckouts.length || pendingRenewCheckouts.length ? (
    <div className="billing-detail-layout">
      {!!(pendingCheckouts.length || pendingRenewCheckouts.length) && (
        <section className="pending-checkout-panel">
          <div className="billing-detail-header">
            <div>
              <span className="status-pill blue">Checkout Recovery</span>
              <h3>Pending Checkouts</h3>
            </div>
          </div>
          <DataTable
            columns={["Created", "Product", "Total", "Payment", "Fulfillment", "Action"]}
            rows={[
              ...pendingCheckouts.map((checkout) => [
                formatDate(checkout.addDate),
                checkout.productName,
                formatMoney(checkout.amount),
                <span className={checkout.isPaid ? "status-pill" : "status-pill muted"}>{checkout.isPaid ? "Paid" : "Unpaid"}</span>,
                <span className={checkout.processed ? "status-pill" : "status-pill muted"}>{checkout.processed ? "Processed" : "Waiting"}</span>,
                <a className="secondary-button compact as-link" href={`/checkout?guid=${encodeURIComponent(checkout.id)}`}>Open</a>
              ]),
              ...pendingRenewCheckouts.map((checkout) => [
                formatDate(checkout.addDate),
                "Multiple Renewal",
                formatMoney(checkout.amount),
                <span className={checkout.isPaid ? "status-pill" : "status-pill muted"}>{checkout.isPaid ? "Paid" : "Unpaid"}</span>,
                <span className={checkout.isProcessed ? "status-pill" : "status-pill muted"}>{checkout.isProcessed ? "Processed" : "Waiting"}</span>,
                <a className="secondary-button compact as-link" href={`/checkout/renew?guid=${encodeURIComponent(checkout.id)}`}>Open</a>
              ])
            ]}
          />
        </section>
      )}
      {invoiceMessage && <p className="renewal-action-message">{invoiceMessage}</p>}
      {purchases.length ? (
        <DataTable
          columns={["Date", "Product", "Term", "Amount", "Status", "Action"]}
          rows={purchases.map((purchase) => [
            formatDate(purchase.createDate),
            purchase.name,
            purchase.paymentTerm,
            formatMoney(purchase.amount),
            <span className={purchase.paymentStatus === "completed" ? "status-pill" : "status-pill muted"}>{purchase.paymentStatus}</span>,
            <button
              className="secondary-button compact"
              type="button"
              disabled={invoiceBusyId !== null}
              onClick={() => loadInvoice(purchase)}
            >
              {invoiceBusyId === purchase.orderId ? "Loading..." : "Invoice"}
            </button>
          ])}
        />
      ) : (
        <p className="empty-state">No completed purchases found.</p>
      )}
      {selectedPurchase && <BillingPurchaseDetail purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} />}
    </div>
  ) : <p className="empty-state">No purchases found.</p>;
}

function CheckoutPreviewCard({ preview, onClose }) {
  return (
    <aside className="billing-detail-card checkout-preview-card">
      <div className="billing-detail-header">
        <span className="status-pill blue">{preview.isOrder ? "Checkout Ready" : "Checkout Preview"}</span>
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
        <a className="primary-button as-link" href={preview.checkoutUrl}>Open Checkout</a>
      ) : (
        <button className="primary-button" type="button" disabled>Checkout unavailable</button>
      )}
    </aside>
  );
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
          {isCheckingOut ? "Creating..." : "Create Checkout"}
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
    vat: editableAccountValue(profile?.vat)
  };
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
    vat: ""
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

  function showTwoFactorSetupNotice() {
    setTwoFactorMessage("Authenticator setup needs the legacy encrypted secret writer before this rebuilt panel can create compatible 2FA secrets.");
  }

  const profile = settings?.profile;
  const twoFactor = settings?.twoFactor;

  return (
    <section className="settings-section">
      <article className="panel-card settings-overview-card">
        <div className="billing-header">
          <div>
            <span className="status-pill blue">Live account</span>
            <h2>Account Settings</h2>
          </div>
          <RefreshButton onClick={loadSettings} />
        </div>
        {isLoadingSettings && <p className="empty-state">Loading account settings...</p>}
        {settingsError && (
          <div className="dashboard-error-panel inline-error">
            <p>{settingsError}</p>
            <button className="secondary-button compact" type="button" onClick={loadSettings}>Retry</button>
          </div>
        )}
        {profile && (
          <div className="settings-card-grid">
            <article className="settings-info-card">
              <span className="status-pill">Profile</span>
              <dl className="card-meta single">
                <div><dt>Customer ID</dt><dd>{profile.customerId}</dd></div>
                <div><dt>Login</dt><dd>{profile.login}</dd></div>
                <div><dt>Account Type</dt><dd>{profile.customerType}</dd></div>
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
                <div><dt>Security Version</dt><dd>{profile.securityVersion || "N/A"}</dd></div>
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
              onChange={(event) => updateProfileField("mobileNumber", event.target.value)}
            />
          </label>
          <label>
            Browser Language
            <input
              type="text"
              value={profileForm.browserLanguage}
              onChange={(event) => updateProfileField("browserLanguage", event.target.value)}
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
          <div className="settings-form-actions">
            <button className="primary-button" type="submit" disabled={isSavingProfile || !profileForm.name.trim()}>
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
        {profileMessage && <p className="renewal-action-message">{profileMessage}</p>}
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
            {isRequestingEmailChange ? "Creating..." : "Create Verification Request"}
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
            <button className="secondary-button compact" type="button" onClick={showTwoFactorSetupNotice}>
              Setup 2FA
            </button>
          )}
          <span>{twoFactor?.hasSecret ? `Created ${formatDate(twoFactor.enterDate)}` : "No authenticator secret on file"}</span>
        </div>
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
    ["getting-started", "Getting Started"],
    ["referrals", "My Referrals"],
    ["pending", "Pending Commission"],
    ["current", "Current Commission"],
    ["withdraw", "Withdraw"],
    ["pay-log", "Pay Log"],
    ["promo-assets", "Promo Assets"]
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
        <div className="billing-header">
          <div>
            <span className="status-pill blue">Pays 60%</span>
            <h2>Affiliate Program</h2>
          </div>
          <RefreshButton onClick={loadAffiliate} />
        </div>

        <div className="affiliate-summary-grid">
          <AffiliateMetric label="Referrals" value={summary?.totalReferrals ?? "..."} />
          <AffiliateMetric label="Paid Referrals" value={summary?.paidReferrals ?? "..."} />
          <AffiliateMetric label="Pending" value={formatMoney(summary?.pendingCommission ?? 0)} />
          <AffiliateMetric label="Available" value={formatMoney(summary?.availableCommission ?? 0)} />
        </div>

        <div className="tabs" role="tablist" aria-label="Affiliate tabs">
          {tabs.map(([id, label]) => (
            <button
              aria-selected={id === activeTab}
              className={id === activeTab ? "tab active" : "tab"}
              key={id}
              role="tab"
              type="button"
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoadingAffiliate && <p className="empty-state">Loading affiliate data...</p>}
        {affiliateError && (
          <div className="dashboard-error-panel inline-error">
            <p>{affiliateError}</p>
            <button className="secondary-button compact" type="button" onClick={loadAffiliate}>Retry</button>
          </div>
        )}
        {!isLoadingAffiliate && !affiliateError && (
          <div className="tab-panel" role="tabpanel">
            {activeTab === "getting-started" && <AffiliateGettingStarted />}
            {activeTab === "referrals" && <AffiliateReferrals referrals={affiliate?.referrals ?? []} />}
            {activeTab === "pending" && <AffiliateCommissions commissions={pendingCommissions} emptyText="No pending commissions found." showRelease />}
            {activeTab === "current" && <AffiliateCommissions commissions={currentCommissions} emptyText="No released commissions found." />}
            {activeTab === "withdraw" && <AffiliateWithdraw summary={summary} />}
            {activeTab === "pay-log" && <AffiliatePayLog payouts={affiliate?.payouts ?? []} />}
            {activeTab === "promo-assets" && <AffiliatePromoAssets />}
          </div>
        )}
      </article>
      <KnowledgeBaseCard title="Reseller Guides" articles={resellerKbArticles} />
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

  async function checkWithdraw(method, amountText) {
    setIsCheckingWithdraw(true);
    setWithdrawMessage("");
    setWithdrawPreview(null);

    try {
      const response = await fetch("/api/account/affiliate/withdraw-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amountText), method })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setWithdrawMessage(result?.message ?? "Unable to check withdraw.");
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

  return (
    <div className="affiliate-withdraw-grid">
      <article className="affiliate-withdraw-card">
        <h3>Convert Commission to Account Balance</h3>
        <p>Convert available affiliate commission into account funds.</p>
        <label>
          Amount
          <input type="number" min="0" step="0.01" value={creditAmount} onChange={(event) => setCreditAmount(event.target.value)} />
        </label>
        <button className="primary-button" type="button" disabled={isCheckingWithdraw} onClick={() => checkWithdraw("account-credit", creditAmount)}>
          {isCheckingWithdraw ? "Checking..." : "Convert to Credit"}
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

function AffiliatePromoAssets() {
  const [copiedSize, setCopiedSize] = useState("");

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
      {affiliateBanners.map((banner) => (
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

function AffiliateGettingStarted() {
  const [activeBanner, setActiveBanner] = useState(affiliateBanners[0]);
  const [copiedBanner, setCopiedBanner] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteCopied, setInviteCopied] = useState("");
  const referralUrl = "https://www.SmarterASP.NET/index?r=openreward";
  const referralIdUrl = "https://www.SmarterASP.NET/index?r=100468564";
  const inviteSubject = "Try SmarterASP.NET hosting";
  const inviteBody = [
    `Hi${inviteName.trim() ? ` ${inviteName.trim()}` : ""},`,
    "",
    "I wanted to share SmarterASP.NET with you. They offer Windows ASP.NET hosting, domains, VPN services, SSL certificates, and add-ons.",
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
            <div>
              <span>{referralIdUrl}</span>
              <button type="button" onClick={() => copyReferralUrl("id")}>{inviteCopied === "id" ? "Copied" : "Copy"}</button>
            </div>
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
            {affiliateBanners.map((banner) => (
              <button
                className={activeBanner.size === banner.size ? "active" : ""}
                key={banner.size}
                type="button"
                onClick={() => setActiveBanner(banner)}
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
          <textarea readOnly value={activeBanner.code} aria-label="Affiliate banner code" />
          <p>Example:</p>
          <div className="affiliate-real-banner-preview">
            <img src={activeBanner.url} alt={`${activeBanner.size} affiliate banner preview`} />
          </div>
        </div>
        <a className="affiliate-terms" href="#affiliate-terms">*Click here to see our Affiliate Terms and Condition</a>
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
