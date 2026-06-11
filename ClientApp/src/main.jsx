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
  { id: "affiliate", label: "Affiliate", stat: "Pays 60%", icon: "share" },
  { id: "billing", label: "Billing", stat: "$42", icon: "card" }
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

const billingTabs = [
  ["purchases", "My Purchases", "Recent mock purchases: Business Hosting, SSL-S, VPN Dedicated IP."],
  ["active", "Current Active Products", "8 active products across hosting, domains, VPN, and SSL add-ons."],
  ["balance", "Account Balance", "Account balance: $42.00 credit."],
  ["renewal", "Renewal Notice", "Next renewal notice: sample-client.org on July 15, 2026."]
];

function App() {
  const [route, setRoute] = useState(() => {
    if (window.location.pathname === "/panel") return "panel";
    if (window.location.pathname === "/panel_cp") return "panel_cp";
    return "login";
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("controlpanel-theme") ?? "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("controlpanel-theme", theme);
  }, [theme]);

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

  if (route === "panel_cp") {
    return <HostingControlPanel theme={theme} onBackToPanel={goToPanel} onToggleTheme={toggleTheme} />;
  }

  return route === "panel"
    ? <Panel theme={theme} onManageHosting={goToControlPanel} onToggleTheme={toggleTheme} />
    : <Login onLogin={goToPanel} theme={theme} onToggleTheme={toggleTheme} />;
}

function Login({ onLogin, theme, onToggleTheme }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
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

      onLogin(event);
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
          <a href="/panel" onClick={onLogin}>Demo Panel</a>
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

function Panel({ theme, onManageHosting, onToggleTheme }) {
  const [activeSection, setActiveSection] = useState("hosting");
  const activeTitle = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label ?? "Hosting Plans",
    [activeSection]
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <a className="brand project-brand" href="/panel">
            <span className="user-dot blue-dot"></span>
            <span className="brand-name">Control Panel</span>
            <span className="plan-pill">Hobby</span>
          </a>
        </div>
        <nav className="side-nav" aria-label="Account panel sections">
          {sections.map((section) => (
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
              <strong>{section.stat}</strong>
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
            <span>Funds $179.92</span>
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
          </div>
        </div>
        <DashboardSection activeSection={activeSection} onManageHosting={onManageHosting} />
      </main>
    </div>
  );
}

function HostingControlPanel({ theme, onBackToPanel, onToggleTheme }) {
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
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
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

      {viewMode === "cards" ? (
        <WebsiteCards sites={siteRecords} onUpdateSiteName={updateSiteName} />
      ) : (
        <WebsiteTable sites={siteRecords} onUpdateSiteName={updateSiteName} />
      )}
    </section>
  );
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

function DashboardSection({ activeSection, onManageHosting }) {
  if (activeSection === "domain") return <DomainSection />;
  if (activeSection === "vpn") return <VpnSection />;
  if (activeSection === "addon") return <AddonSection />;
  if (activeSection === "affiliate") return <TabbedSection title="Affiliate" tabs={affiliateTabs} showHeading={false} />;
  if (activeSection === "billing") return <TabbedSection title="Billing" tabs={billingTabs} showHeading={false} />;
  return <HostingSection onManageHosting={onManageHosting} />;
}

function HostingSection({ onManageHosting }) {
  return (
    <section className="hosting-stack">
      <div className="panel-card renewal-panel">
        <div className="renewal-panel-header">
          <h2>Renewal Notice</h2>
          <span>{renewalNotices.length} items</span>
        </div>
        <div className="renewal-list">
          {renewalNotices.map((notice) => (
            <article className="renewal-item" key={notice.name}>
              <div>
                <h3>{notice.name}</h3>
                <p>Renewal {notice.renewal}</p>
              </div>
              <div className="renewal-days">
                <strong>{notice.daysLeft}</strong>
                <span>days left</span>
              </div>
              <span className="renewal-status">{notice.status}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="card-grid">
        {hostingAccounts.map((account) => (
          <article className="service-card" key={account.hosting_account_name}>
            <div>
              <span className="status-pill">Active</span>
              <h2>{account.hosting_account_name}</h2>
              <p>{account.siteHosted}</p>
            </div>
            <dl className="card-meta">
              <div><dt>Renewal</dt><dd>{account.renewal}</dd></div>
              <div><dt>Plan Name</dt><dd>{account.planName}</dd></div>
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
        <button className="primary-button" type="button">View Affiliate Program</button>
      </article>
    </section>
  );
}

function DomainSection() {
  return (
    <section className="panel-card">
      <div className="section-heading">
        <div>
          <h2>Search and Buy New Domain Name</h2>
          <p>Mock search controls for finding a new domain.</p>
        </div>
      </div>
      <div className="search-row">
        <input type="search" placeholder="Search a domain, e.g. mybrand.com" />
        <select aria-label="Domain extension" defaultValue=".com">
          <option>.com</option>
          <option>.net</option>
          <option>.org</option>
          <option>.io</option>
        </select>
        <button className="primary-button" type="button">Search</button>
      </div>
      <DataTable
        columns={["Domain Name", "Status", "Renewal", "Action"]}
        rows={domains.map((domain) => [
          domain.name,
          domain.status,
          domain.renewal,
          <button className="secondary-button compact" type="button">Manage</button>
        ])}
      />
    </section>
  );
}

function VpnSection() {
  return (
    <section className="card-grid">
      {vpnServices.map((service) => (
        <article className="service-card" key={service.name}>
          <span className="status-pill">Active</span>
          <h2>{service.name}</h2>
          <p>{service.details}</p>
          <dl className="card-meta">
            <div><dt>Billing</dt><dd>{service.billing}</dd></div>
            <div><dt>Price</dt><dd>{service.price}</dd></div>
          </dl>
          <button className="secondary-button" type="button">Manage</button>
        </article>
      ))}
      <article className="service-card purchase-card">
        <span className="status-pill blue">New</span>
        <h2>Buy VPN Services</h2>
        <p>Mock plan cards for new VPN service purchases.</p>
        <strong>From $9/month</strong>
        <button className="primary-button" type="button">Buy VPN</button>
      </article>
    </section>
  );
}

function AddonSection() {
  return (
    <section className="panel-card">
      <DataTable
        columns={["Product Name", "Description", "Billing Terms", "Qty", "Action"]}
        rows={addons.map((addon) => [
          addon.name,
          addon.description,
          addon.terms,
          addon.qty,
          <button className="secondary-button compact" type="button">Add</button>
        ])}
      />
    </section>
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
  const bannerCode = '<a href="https://www.SmarterASP.NET/index?r=openreward"><img src="https://www.SmarterASP.NET/affiliate/728X90.gif" border="0"></a>';

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
            <button className="active" type="button">728X90</button>
            <button type="button">468x60</button>
            <button type="button">300x250</button>
            <button type="button">234x60</button>
          </div>
          <div className="affiliate-code-row">
            <span>Code:</span>
            <button type="button">Copy</button>
          </div>
          <textarea readOnly value={bannerCode} aria-label="Affiliate banner code" />
          <p>Example:</p>
          <div className="affiliate-banner-preview">
            <div>
              <span>SmarterASP.NET</span>
              <strong>Looking for fast and affordable ASP.NET hosting?</strong>
            </div>
            <div className="trial-pill">60-Day Free Trial</div>
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
