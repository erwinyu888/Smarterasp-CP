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
  { label: "More Functions", icon: "more" }
];

const deployActions = [
  { label: "Github", icon: "git" },
  { label: "VSDeploy", icon: "deploy" }
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

const affiliateTabs = [
  ["getting-started", "Getting Started", "affiliate-getting-started"],
  ["referrals", "My Referrals", "18 referred accounts, 4 converted hosting purchases."],
  ["pending", "Pending Commission", "$124.00 pending commission awaiting validation."],
  ["current", "Current Commission", "$342.00 current approved commission."],
  ["withdraw", "Withdraw", "Mock withdraw request form placeholder."],
  ["pay-log", "Pay Log", "Last mock payout: $88.00 on May 30, 2026."],
  ["promo-assets", "Promo Assets", "Banner, email copy, and landing page link placeholders."]
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

const billingTabs = [
  ["purchases", "My Purchases", "Recent mock purchases: Business Hosting, SSL-S, VPN Dedicated IP."],
  ["active", "Current Active Products", "8 active products across hosting, domains, VPN, and SSL add-ons."],
  ["balance", "Account Balance", "Account balance: $42.00 credit."],
  ["renewal", "Renewal Notice", "Next renewal notice: sample-client.org on July 15, 2026."]
];

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
        } else if (route !== "login" && route !== "checkout") {
          window.history.replaceState({}, "", "/");
          setRoute("login");
        }
      } catch {
        if (isMounted && route !== "login" && route !== "checkout") {
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
    if (!isAuthReady || currentUser || route === "login" || route === "checkout") return;

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

  return route === "panel"
    ? <Panel theme={theme} currentUser={currentUser} onLogout={handleLogout} onManageHosting={goToControlPanel} onToggleTheme={toggleTheme} />
    : <Login onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />;
}

function CheckoutHandoff({ theme, currentUser, onBackToPanel, onToggleTheme }) {
  const [order, setOrder] = useState(null);
  const [orderMessage, setOrderMessage] = useState("");
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const guid = query.get("guid") ?? "";
  const amount = query.get("amount") ?? "";
  const isDeposit = window.location.pathname.includes("deposit");

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      if (!guid) return;
      setOrderMessage("Loading checkout order...");
      try {
        const response = await fetch(`/api/account/checkout-temp/${encodeURIComponent(guid)}`);
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
  }, [guid]);

  const title = isDeposit ? "Account Balance Deposit" : order?.productName ?? "Checkout Handoff";
  const total = isDeposit ? Number(amount || 0) : order?.amount;

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
        <p>This page confirms the order handoff created by the Account Panel rebuild.</p>
        <dl className="card-meta single">
          {guid && <div><dt>GUID</dt><dd>{guid}</dd></div>}
          {order?.productId !== undefined && <div><dt>Product ID</dt><dd>{order.productId}</dd></div>}
          {order?.pageType !== undefined && <div><dt>Page Type</dt><dd>{order.pageType}</dd></div>}
          <div><dt>Total</dt><dd>{formatMoney(total || 0)}</dd></div>
          {order?.info1 && <div><dt>Info 1</dt><dd>{order.info1}</dd></div>}
          {order?.info2 && <div><dt>Info 2</dt><dd>{order.info2}</dd></div>}
        </dl>
        {orderMessage && <p className="renewal-action-message">{orderMessage}</p>}
        <button className="primary-button" type="button" onClick={onBackToPanel}>
          Back to Account Panel
        </button>
      </section>
    </main>
  );
}

function Login({ onLogin, theme, onToggleTheme }) {
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

      <section className="login-card" aria-label="Login mockup">
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
            <span className="account-chip">{currentUser?.login}</span>
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
  const [selectedHostingPlan, setSelectedHostingPlan] = useState("Hosting Plan 1");
  const [isHostingPlanMenuOpen, setIsHostingPlanMenuOpen] = useState(false);
  const activeTitle = useMemo(
    () => controlPanelSections.find((section) => section.id === activeSection)?.label ?? "Dashboard",
    [activeSection]
  );
  const hostingPlanOptions = ["Hosting Plan 1", "Hosting Plan 2", "Hosting Plan 3"];

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
                <span>{selectedHostingPlan}</span>
              </span>
              <MenuIcon name="chevron-down" />
            </button>
            {isHostingPlanMenuOpen && (
              <div className="mock-plan-menu" role="listbox" aria-label="Mock hosting plans">
                {hostingPlanOptions.map((plan) => (
                  <button
                    aria-selected={selectedHostingPlan === plan}
                    className={selectedHostingPlan === plan ? "mock-plan-option active" : "mock-plan-option"}
                    key={plan}
                    role="option"
                    type="button"
                    onClick={() => {
                      setSelectedHostingPlan(plan);
                      setIsHostingPlanMenuOpen(false);
                    }}
                  >
                    <span className="mock-plan-option-label">
                      <MenuIcon name="server" />
                      <span>{plan}</span>
                    </span>
                  </button>
                ))}
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
            <span className="account-chip">{currentUser?.login}</span>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <button className="secondary-button compact" type="button" onClick={onLogout}>Logout</button>
          </div>
        </div>
        {activeSection === "dashboard" && <HostingDashboard />}
        {activeSection === "websites" && <WebsitesSection />}
        {!["dashboard", "websites"].includes(activeSection) && <HostingCpPlaceholder title={activeTitle} />}
      </main>
    </div>
  );
}

function HostingDashboard() {
  const usageStats = [
    ["3072 MB", "Ram Quota"],
    ["107 GB", "Bandwidth Usage"],
    ["85.85 GB", "Disk Usage"],
    ["248K", "File Usage"]
  ];
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

  return (
    <section className="cp-dashboard">
      <article className="panel-card ram-card">
        <div className="ram-meter" aria-label="RAM usage 68 percent">
          <span>68%</span>
          <small>333 MB used</small>
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
            <dd>NS1.SITE4NOW.NET</dd>
            <dd>NS2.SITE4NOW.NET</dd>
            <dd>NS3.SITE4NOW.NET</dd>
          </div>
          <div>
            <dt>IP Address</dt>
            <dd>208.98.35.146</dd>
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

function WebsitesSection() {
  const [viewMode, setViewMode] = useState("cards");
  const [siteRecords, setSiteRecords] = useState(websites);
  const [sitesDashboard, setSitesDashboard] = useState(null);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [sitesError, setSitesError] = useState("");

  async function loadHostingSites() {
    setIsLoadingSites(true);
    setSitesError("");
    try {
      const response = await fetch("/api/hosting/sites");
      const result = await response.json();
      if (!response.ok || !result.success) {
        setSitesError(result?.message ?? "Unable to load websites.");
        return;
      }

      setSitesDashboard(result.dashboard);
      const loadedSites = result.dashboard?.sites?.map(mapHostingSiteToUi) ?? [];
      if (loadedSites.length) {
        setSiteRecords(loadedSites);
      } else {
        setSiteRecords([]);
      }
    } catch {
      setSitesError("Unable to reach website service.");
    } finally {
      setIsLoadingSites(false);
    }
  }

  useEffect(() => {
    loadHostingSites();
  }, []);

  function updateSiteName(index, siteName) {
    setSiteRecords((currentSites) =>
      currentSites.map((site, siteIndex) => (siteIndex === index ? { ...site, siteName } : site))
    );
  }

  return (
    <section className="websites-section">
      <div className="website-toolbar panel-card">
        <div className="website-actions">
          <button className="primary-button compact" type="button">+ New Site</button>
          <button className="secondary-button compact" type="button">+ Sub Domain</button>
          <button className="secondary-button compact" type="button">+ Automated Backups</button>
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
        <button className="secondary-button compact" type="button" onClick={loadHostingSites}>Refresh</button>
      </div>

      {isLoadingSites && <p className="empty-state">Loading websites from cp_config_Sites...</p>}
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
        <WebsiteCards sites={siteRecords} onUpdateSiteName={updateSiteName} />
      ) : (
        <WebsiteTable sites={siteRecords} onUpdateSiteName={updateSiteName} />
      ))}
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
    siteName: site.siteName || site.rootName || `site-${site.siteUid}`,
    mappedDomains: site.mappedDomains?.length
      ? site.mappedDomains
      : [{ label: "No mapped domains", url: "#" }],
    runtime,
    status: site.status || "Unknown"
  };
}

function WebsiteCards({ sites, onUpdateSiteName }) {
  return (
    <div className="website-card-grid">
      {sites.map((site, siteIndex) => (
        <article className="panel-card website-card" key={`${site.siteName}-${siteIndex}`}>
          <div className="website-card-header">
            <div className="website-title-group">
              <span className="status-pill">{site.status}</span>
              <div className="website-title-row">
                <SiteNameEditor siteName={site.siteName} onChange={(siteName) => onUpdateSiteName(siteIndex, siteName)} />
                <DeployButtons />
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
              <button className="add-domain-chip" type="button" title="+ Add Domain" aria-label="+ Add Domain">
                <MenuIcon name="add-domain" />
              </button>
            </div>
          </div>
          <WebsiteActionButtons />
        </article>
      ))}
    </div>
  );
}

function WebsiteTable({ sites, onUpdateSiteName }) {
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
                  <DeployButtons />
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
                  <button className="add-domain-chip" type="button" title="+ Add Domain" aria-label="+ Add Domain">
                    <MenuIcon name="add-domain" />
                  </button>
                </div>
              </td>
              <td>{site.runtime}</td>
              <td>{site.status}</td>
              <td><WebsiteActionButtons compact /></td>
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

function DeployButtons() {
  return (
    <div className="deploy-buttons" aria-label="Deploy options">
      {deployActions.map((action) => (
        <button className="deploy-button" type="button" key={action.label}>
          <MenuIcon name={action.icon} />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

function WebsiteActionButtons({ compact = false }) {
  return (
    <div className={compact ? "website-action-buttons compact-actions" : "website-action-buttons"}>
      {websiteActions.map((action) => (
        <button
          aria-label={action.label}
          className="secondary-button compact icon-only-button"
          title={action.label}
          type="button"
          key={action.label}
        >
          <MenuIcon name={action.icon} />
        </button>
      ))}
    </div>
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

function DashboardSection({ activeSection, dashboard, dashboardError, isDashboardLoading, onChangeSection, onManageHosting, onReloadDashboard }) {
  if (activeSection === "domain") return <DomainSection />;
  if (activeSection === "vpn") return <VpnSection />;
  if (activeSection === "addon") return <AddonSection />;
  if (activeSection === "affiliate") return <AffiliateSection />;
  if (activeSection === "billing") return <BillingSection />;
  if (activeSection === "settings") return <SettingsSection />;
  if (activeSection === "new-order") return <NewOrderSection onChangeSection={onChangeSection} />;
  return (
    <HostingSection
      dashboard={dashboard}
      dashboardError={dashboardError}
      isDashboardLoading={isDashboardLoading}
      onManageHosting={onManageHosting}
      onShowAffiliate={() => onChangeSection("affiliate")}
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

function HostingSection({ dashboard, dashboardError, isDashboardLoading, onManageHosting, onReloadDashboard, onShowAffiliate }) {
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
            <button className="secondary-button" type="button" onClick={onManageHosting}>Manage</button>
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
  }, []);

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

  return (
    <section className="domain-section">
      <article className="panel-card domain-search-panel">
        <div className="section-heading">
          <div>
            <h2>Search and Buy New Domain Name</h2>
          </div>
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
          <button className="secondary-button compact" type="button" onClick={loadAccountDomains}>Refresh</button>
        </div>
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
              {domainRegistrarForm.action !== "status" && domainRegistrarForm.action !== "auth-code" && domainRegistrarForm.action !== "lock" && domainRegistrarForm.action !== "unlock" && domainRegistrarForm.action !== "privacy-on" && domainRegistrarForm.action !== "privacy-off" && domainRegistrarForm.action !== "auto-renew-on" && domainRegistrarForm.action !== "auto-renew-off" && (
                <label>
                  {domainRegistrarForm.action === "dns" ? "DNS Records" : domainRegistrarForm.action === "forwarding" ? "Forwarding Email" : "Detail"}
                  <textarea
                    value={domainRegistrarForm.value}
                    onChange={(event) => setDomainRegistrarForm((form) => ({ ...form, value: event.target.value }))}
                  />
                </label>
              )}
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
          <button className="secondary-button compact" type="button" onClick={loadVpn}>Refresh</button>
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
      quantity: selected.quantity ?? 1
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
    setAddonCart((items) => {
      const existing = items.find((item) => item.productId === addon.productId && item.priceId === price.priceId);
      if (existing) {
        return items.map((item) => item === existing ? { ...item, qty: Math.min(99, item.qty + quantity) } : item);
      }
      return [...items, { productId: addon.productId, priceId: price.priceId, name: addon.name, term: price.paymentTerm, amount: price.amount, currency: price.currency, qty: quantity }];
    });
  }

  function removeAddonFromCart(productId, priceId) {
    setAddonCart((items) => items.filter((item) => item.productId !== productId || item.priceId !== priceId));
  }

  async function checkoutAddons() {
    setIsAddonCheckingOut(true);
    setAddonCheckoutMessage("");
    setAddonCheckoutPreview(null);

    try {
      const response = await fetch("/api/account/addons/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: addonCart.map((item) => ({ productId: item.productId, priceId: item.priceId, quantity: item.qty })) })
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

  const addonCartTotal = addonCart.reduce((total, item) => total + (Number(item.amount) * item.qty), 0);

  return (
    <section className="addon-section">
      <article className="panel-card addon-catalog-panel">
        <div className="billing-header">
          <div>
            <span className="status-pill blue">Live catalog</span>
            <h2>Available Add-Ons</h2>
          </div>
          <button className="secondary-button compact" type="button" onClick={loadAddons}>Refresh</button>
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
            columns={["Product Name", "Description", "Billing Terms", "Qty", "Action"]}
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
              <div className="domain-cart-item" key={`${item.productId}-${item.priceId}`}>
                <span>{item.name} · {formatPaymentTerm(item.term)} · Qty {item.qty}</span>
                <button className="ghost-button compact" type="button" onClick={() => removeAddonFromCart(item.productId, item.priceId)}>Remove</button>
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
              <button className="secondary-button" type="button" onClick={() => setAddonActionMessage("Provisioning changes for this add-on will be handled inside the hosting control panel after payment.")}>
                Provisioning Notes
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

function BillingSection() {
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
        <button className="secondary-button compact" type="button" onClick={loadBilling}>Refresh</button>
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
          <p>Deposit money into the account balance or validate a credit transfer to another account.</p>
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
              {isBalanceActionBusy ? "Checking..." : "Transfer Credit"}
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
            onManage={() => setProductActionMessage("Product management bridge pending. Use hosting/add-on/domain sections for live read-only detail for now.")}
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
        {renewalMessage && <p className="renewal-action-message">{renewalMessage}</p>}
        <DataTable
          columns={["Product", "Due Date", "Days Left", "Status", "Action"]}
          rows={renewals.map((product) => [
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
        {renewalPreview && <RenewalCheckoutPreview renewal={renewalPreview} onClose={() => setRenewalPreview(null)} onCheckout={createBillingRenewalCheckout} />}
      </div>
    ) : <p className="empty-state">No renewal notices found.</p>;
  }

  const purchases = billing?.purchases ?? [];
  return purchases.length ? (
    <div className="billing-detail-layout">
      {invoiceMessage && <p className="renewal-action-message">{invoiceMessage}</p>}
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
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
          <button className="secondary-button compact" type="button" onClick={loadSettings}>Refresh</button>
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
          <button className="secondary-button compact" type="button" onClick={loadAffiliate}>Refresh</button>
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
        <button className="secondary-button" type="button" disabled={isCheckingWithdraw || !paypalAccount.trim()} onClick={() => checkWithdraw("paypal", paypalAmount)}>
          {isCheckingWithdraw ? "Checking..." : "Submit Withdraw"}
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

function TabbedSection({ title, tabs, showHeading = true }) {
  const [activeTab, setActiveTab] = useState(tabs[0][0]);
  const current = tabs.find((tab) => tab[0] === activeTab) ?? tabs[0];

  return (
    <section className="panel-card">
      {showHeading && (
        <div className="section-heading">
          <div>
            <h2>{title}</h2>
            <p>Mock tabbed information for review only.</p>
          </div>
        </div>
      )}
      <div className="tabs" role="tablist" aria-label={`${title} tabs`}>
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
      <div className="tab-panel" role="tabpanel">
        {current[2] === "affiliate-getting-started" ? <AffiliateGettingStarted /> : <p>{current[2]}</p>}
      </div>
    </section>
  );
}

function AffiliateGettingStarted() {
  const [activeBanner, setActiveBanner] = useState(affiliateBanners[0]);
  const [copiedBanner, setCopiedBanner] = useState("");

  async function copyActiveBanner() {
    if (await writeTextToClipboard(activeBanner.code)) {
      setCopiedBanner(activeBanner.size);
      window.setTimeout(() => setCopiedBanner(""), 1600);
    } else {
      setCopiedBanner("failed");
      window.setTimeout(() => setCopiedBanner(""), 1600);
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
            <div>https://www.SmarterASP.NET/index?r=openreward</div>
            <div>https://www.SmarterASP.NET/index?r=100468564</div>
          </div>
          <p className="affiliate-note">
            <strong>Note:</strong> Once your customer visits our site through the URL above, your referral ID will be recorded in their browser's cookie. Anytime your customer decides to signup, you'll get credited.
          </p>
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
