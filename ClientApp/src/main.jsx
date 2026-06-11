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
  { id: "billing", label: "Billing", stat: "0", icon: "card", statTone: "warning" }
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
        } else if (route !== "login") {
          window.history.replaceState({}, "", "/");
          setRoute("login");
        }
      } catch {
        if (isMounted && route !== "login") {
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
    if (!isAuthReady || currentUser || route === "login") return;

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

  return route === "panel"
    ? <Panel theme={theme} currentUser={currentUser} onLogout={handleLogout} onManageHosting={goToControlPanel} onToggleTheme={toggleTheme} />
    : <Login onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />;
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
              className={section.id === activeSection ? "nav-item active" : "nav-item"}
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-label">
                <MenuIcon name={section.icon} />
                <span>{section.label}</span>
              </span>
              <strong className={section.statTone === "warning" ? "nav-stat warning" : "nav-stat"}>{section.stat}</strong>
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
          <span className="user-dot green-dot"></span>
          <div>
            <strong>OPENREWARD</strong>
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
          <span className="user-dot green-dot"></span>
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

function HostingSection({ dashboard, dashboardError, isDashboardLoading, onManageHosting, onReloadDashboard, onShowAffiliate }) {
  const accounts = dashboard?.hostingAccounts?.length ? dashboard.hostingAccounts : [];
  const notices = dashboard?.renewalNotices?.length ? dashboard.renewalNotices : [];
  const statusSummary = dashboard?.hostingStatusSummary ?? [];
  const [renewalBusyId, setRenewalBusyId] = useState(null);
  const [renewalPreview, setRenewalPreview] = useState(null);
  const [renewalMessage, setRenewalMessage] = useState("");

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
  const [domainLookupMessage, setDomainLookupMessage] = useState("");
  const [isDomainSearching, setIsDomainSearching] = useState(false);
  const [isDomainCheckingOut, setIsDomainCheckingOut] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
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
            <button className="primary-button" type="button" disabled>Domain management bridge pending</button>
          </aside>
        )}
      </article>
    </section>
  );
}

function VpnSection() {
  const [vpn, setVpn] = useState(null);
  const [isLoadingVpn, setIsLoadingVpn] = useState(true);
  const [vpnError, setVpnError] = useState("");
  const [selectedVpn, setSelectedVpn] = useState(null);
  const [vpnCheckoutPreview, setVpnCheckoutPreview] = useState(null);

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
          <button className="primary-button" type="button" disabled>VPN management bridge pending</button>
        </aside>
      )}

      <article className="service-card purchase-card vpn-purchase-card">
        <span className="status-pill blue">New</span>
        <h2>Buy VPN Services</h2>
        <p>Reserve additional VPN seats for remote access.</p>
        <strong>From $9/month</strong>
        <button
          className="primary-button"
          type="button"
          onClick={() => setVpnCheckoutPreview({
            checkoutId: `VPN-${Date.now()}`,
            title: "VPN checkout preview",
            itemCount: 1,
            total: 9,
            currency: "USD",
            note: "VPN order/provisioning writes are disabled until VpnAccountService is rebuilt."
          })}
        >
          Buy VPN
        </button>
      </article>
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
            <button className="primary-button" type="button" disabled>Add-on management bridge pending</button>
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
          <p>Deposit and transfer checks are prepared without creating payment records.</p>
          <div className="billing-action-row">
            <button className="primary-button" type="button" onClick={() => setBalanceActionMessage("Deposit checkout bridge pending. Legacy DepositCredit writes are disabled in this preview.")}>Deposit Money</button>
            <button className="secondary-button" type="button" onClick={() => setBalanceActionMessage("Transfer credit bridge pending. Legacy TransferCredit writes are disabled in this preview.")}>Transfer Credit</button>
          </div>
          {balanceActionMessage && <p className="renewal-action-message">{balanceActionMessage}</p>}
        </div>
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
      <button className="primary-button" type="button" disabled>Printable invoice pending</button>
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
    <section className="panel-card affiliate-panel">
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
