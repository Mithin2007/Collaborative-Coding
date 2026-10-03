import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

type Screen =
  | "landing"
  | "signup"
  | "login"
  | "dashboard"
  | "exchange"
  | "connect"
  | "wallet"
  | "projects"
  | "community"
  | "marketplace"
  | "settings"
  | "studio"
  | "providers"
  | "capacity"
  | "calculator"
  | "offer"
  | "agreement"
  | "entitlements"
  | "transaction"
  | "project-detail"
  | "new-project"
  | "notifications"
  | "security"
  | "developer"
  | "audit"
  | "pricing"
  | "admin"
  | "usage"
  | "capacity-detail"
  | "offer-detail"
  | "sync"
  | "forgot"
  | "reset"
  | "verify-email"
  | "mfa"
  | "onboarding"
  | "session-expired"
  | "account-locked"
  | "logout";

type Go = (s: Screen) => void;

type IconName =
  | "exchange" | "code" | "folder" | "users" | "store" | "wallet" | "settings" | "search" | "bell"
  | "arrow" | "plus" | "link" | "play" | "cloud" | "shield" | "coins" | "sparkle" | "check" | "clock"
  | "filter" | "terminal" | "send" | "heart" | "chat" | "up";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    exchange: <><path d="M4 7h14l-3-3M20 17H6l3 3" /></>,
    code: <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />,
    folder: <path d="M3 6h7l2 2h9v11H3z" />,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 2-6 6-6s6 2 6 6M16 5c3 0 4 2 4 4s-1 3-3 3M17 14c3 .5 4 2 4 5" /></>,
    store: <><path d="M4 9v11h16V9M3 9l2-5h14l2 5" /><path d="M3 9c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0" /></>,
    wallet: <><path d="M3 6h16v14H3z" /><path d="M3 8V4h13M15 12h6v4h-6z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
    search: <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></>,
    bell: <><path d="M6 17h12l-2-3V9a4 4 0 0 0-8 0v5z" /><path d="M10 20h4" /></>,
    arrow: <path d="M4 12h16M15 7l5 5-5 5" />,
    up: <path d="M7 17 17 7M8 7h9v9" />,
    plus: <path d="M12 5v14M5 12h14" />,
    link: <><path d="m9 15-1 1a4 4 0 0 1-6-6l3-3a4 4 0 0 1 6 0" /><path d="m15 9 1-1a4 4 0 0 1 6 6l-3 3a4 4 0 0 1-6 0M8 12h8" /></>,
    play: <path d="m8 5 11 7-11 7z" />,
    cloud: <><path d="M6 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11-2 5 5 0 0 0-1 10z" /></>,
    shield: <><path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5z" /><path d="m8 12 3 3 5-6" /></>,
    coins: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v5c0 2 3 3 7 3s7-1 7-3V6M5 11v5c0 2 3 3 7 3s7-1 7-3v-5" /></>,
    sparkle: <><path d="m12 2 1.5 5L18 9l-4.5 2-1.5 5-1.5-5L6 9l4.5-2z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    filter: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
    terminal: <path d="m5 8 4 4-4 4M11 17h8" />,
    send: <><path d="m3 4 18 8-18 8 4-8z" /><path d="M7 12h14" /></>,
    heart: <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" />,
    chat: <path d="M4 5h16v11H9l-5 4z" />,
  };
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(" ");
const delay = (i: number): CSSProperties => ({ ["--d" as string]: `${i * 70}ms` });

function useCountUp(target: number, ms = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function useLiveSeries(n = 36) {
  const [s, setS] = useState(() => Array.from({ length: n }, (_, i) => 40 + Math.sin(i / 3) * 18 + i * 0.9 + ((i * 37) % 11)));
  useEffect(() => {
    const id = setInterval(() => {
      setS(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(18, Math.min(98, last + (Math.random() - 0.45) * 16));
        return [...prev.slice(1), next];
      });
    }, 1300);
    return () => clearInterval(id);
  }, []);
  return s;
}

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Invenzo AI home">
      <span className="brand-mark"><i /><i /><i /><i /></span>
      <span className="brand-word">Invenzo<em> AI</em></span>
    </button>
  );
}

function ModelLogo({ type }: { type: "gemini" | "claude" | "openai" | "deepseek" | "other" }) {
  const map = { gemini: "G", claude: "A", openai: "◎", deepseek: "D", other: "+" } as const;
  return <span className={`model-logo ${type}`}>{map[type]}</span>;
}

const tickerItems = [
  ["Gemini 1.5 Flash", "30 EC", "-8%", "down"],
  ["Claude 3 Haiku", "25 EC", "+12%", "up"],
  ["GPT-4o", "95 EC", "+4%", "up"],
  ["Gemini 1.5 Pro", "50 EC", "+2%", "up"],
  ["DeepSeek R1", "20 EC", "-5%", "down"],
  ["Claude 3.5 Sonnet", "70 EC", "+9%", "up"],
  ["Demo network", "2.4M sample tokens", "147 sample providers", "up"],
];

function Ticker() {
  const row = (k: string) => tickerItems.map(([n, p, c, d]) => (
    <span className="tick" key={k + n}><b>{n}</b><span>{p}</span><em className={d}>{c}</em><i /></span>
  ));
  return <div className="ticker" aria-label="Demonstration market signals"><div className="ticker-track">{row("a")}{row("b")}</div></div>;
}

const nav: { label: string; screen: Screen }[] = [
  { label: "Home", screen: "dashboard" },
  { label: "Exchange", screen: "exchange" },
  { label: "Studio", screen: "studio" },
  { label: "Projects", screen: "projects" },
  { label: "Community", screen: "community" },
  { label: "Market", screen: "marketplace" },
];

function Shell({ screen, go, children, studio = false }: { screen: Screen; go: Go; children: ReactNode; studio?: boolean }) {
  const [layer, setLayer] = useState<"search" | "wallet" | "notifications" | "menu" | null>(null);
  const [query, setQuery] = useState("");
  const close = () => setLayer(null);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setLayer("search");
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);
  const searchResults = [
    ["Projects", "SkillSyncX", "Active build · 12 min ago", "project-detail"],
    ["Providers", "Google Gemini", "Verified · CAP-000421", "providers"],
    ["Exchange offers", "Gemini → Claude", "OFF-000192 · Open", "offer-detail"],
    ["Agreements", "Mithin K. ↔ Mukesh R.", "AGR-000083 · Active", "agreement"],
    ["Entitlements", "Claude 3.5 Sonnet", "ENT-000219 · 13,580 tokens", "entitlements"],
    ["Transactions", "Claude studio usage", "TXN-000981 · −20 EC", "transaction"],
    ["Marketplace", "SupportFlow AI", "35 EC · 4.9 rating", "marketplace"],
  ].filter(result => !query || result.join(" ").toLowerCase().includes(query.toLowerCase()));
  return (
    <div className={cx("shell", studio && "shell-studio")}>
      <header className="mast">
        <Brand onClick={() => go("landing")} />
        <nav className="mast-nav">
          {nav.map((n, i) => (
            <button key={n.label} className={cx(n.screen === screen && "on")} onClick={() => go(n.screen)}>
              <small>{String(i + 1).padStart(2, "0")}</small>{n.label}
            </button>
          ))}
        </nav>
        <div className="mast-right">
          <button className="net-status" onClick={() => go("sync")} aria-label="Network status: online"><i />Online</button>
          <button className="mast-search" aria-label="Search" onClick={() => setLayer("search")}><Icon name="search" size={16} /><kbd>⌘K</kbd></button>
          <button className={cx("ec-chip", screen === "wallet" && "on")} onClick={() => setLayer("wallet")}><i />65 <small>EC</small></button>
          <button className="mast-icon" aria-label="Notifications" onClick={() => setLayer("notifications")}><Icon name="bell" size={17} /><i /></button>
          <button className={cx("mast-avatar", screen === "settings" && "on")} onClick={() => go("settings")} aria-label="Settings">MK</button>
          <button className="mobile-menu" aria-label="Open menu" onClick={() => setLayer("menu")}><Icon name="filter" size={18} /></button>
        </div>
      </header>
      {!studio && <Ticker />}
      <main className={cx("page", studio && "page-studio")} key={screen}>{children}</main>
      <nav className="mobile-dock">
        {[["dashboard", "Home", "sparkle"], ["exchange", "Exchange", "exchange"], ["studio", "Studio", "code"], ["projects", "Projects", "folder"], ["settings", "More", "settings"]].map(([to, label, icon]) => (
          <button key={to} className={cx(screen === to && "on")} onClick={() => go(to as Screen)}><Icon name={icon as IconName} size={18} /><span>{label}</span></button>
        ))}
      </nav>
      {layer && (
        <div className="overlay" role="presentation" onMouseDown={close}>
          <section className={cx("overlay-card", layer === "menu" && "menu-card")} role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}>
            <button className="overlay-close" onClick={close} aria-label="Close">×</button>
            {layer === "search" && <>
              <span className="mono">Global search · ⌘ K</span><h2>Search Invenzo</h2>
              <label className="overlay-search"><Icon name="search" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Projects, providers, agreements…" /></label>
              {!query && <div className="recent-searches"><small className="mono">Recent</small><button onClick={() => setQuery("SkillSyncX")}>SkillSyncX</button><button onClick={() => setQuery("Gemini")}>Gemini capacity</button></div>}
              {searchResults.map(r => <button className="search-result" key={r[1]} onClick={() => go(r[3] as Screen)}><small>{r[0]}</small><b>{r[1]}</b><span>{r[2]}</span><Icon name="arrow" /></button>)}
              {query && searchResults.length === 0 && <div className="empty compact"><b>No results for “{query}”</b><span>Try a project, provider, agreement, entitlement, or transaction ID.</span><button className="link-btn" onClick={() => setQuery("")}>Clear search</button></div>}
            </>}
            {layer === "wallet" && <>
              <span className="mono">Available balance</span><div className="pop-balance">65 <small>EC</small></div>
              <div className="pop-stats"><span><small>Reserved</small><b>35 EC</b></span><span><small>Earned this month</small><b>250 EC</b></span><span><small>Spent</small><b>150 EC</b></span></div>
              <button className="btn gold" onClick={() => go("wallet")}>Open wallet<Icon name="arrow" size={15} /></button>
            </>}
            {layer === "notifications" && <>
              <span className="mono">Notification center</span><h2>What&apos;s happening</h2>
              {[["Exchange", "Demo capacity match", "Your Gemini capacity has a prepared match.", "2m"], ["Usage", "Claude entitlement at 20%", "13,580 tokens remain.", "1h"], ["System", "Settlement record prepared", "35 EC is reserved in the demo ledger.", "3h"]].map((n, i) => <button className={cx("notice", i === 0 && "unread")} key={n[1]} onClick={() => go("notifications")}><i /><span><small>{n[0]} · {n[3]}</small><b>{n[1]}</b><em>{n[2]}</em></span></button>)}
              <button className="btn ghost" onClick={() => go("notifications")}>Open notification center</button>
            </>}
            {layer === "menu" && <>
              <span className="mono">Invenzo network</span><h2>Workspace</h2>
              <div className="menu-list">{nav.map(n => <button key={n.label} onClick={() => go(n.screen)}>{n.label}<Icon name="arrow" size={15} /></button>)}</div>
              <div className="menu-list minor"><button onClick={() => go("providers")}>Providers</button><button onClick={() => go("capacity")}>My capacity</button><button onClick={() => go("wallet")}>EC wallet</button><button onClick={() => go("notifications")}>Notifications</button><button onClick={() => go("sync")}>Sync center</button></div>
            </>}
          </section>
        </div>
      )}
    </div>
  );
}

function Kicker({ n, children }: { n?: string; children: ReactNode }) {
  return <p className="kicker">{n && <b>{n}</b>}{children}</p>;
}

function SectionHead({ n, title, aside }: { n: string; title: ReactNode; aside?: ReactNode }) {
  return <div className="sec-head"><span className="mono">{n}</span><h2>{title}</h2><div>{aside}</div></div>;
}

/* ───────────────────────── Landing ───────────────────────── */

function Landing({ go }: { go: Go }) {
  const [idea, setIdea] = useState("");
  const suggestions = ["A customer support agent", "A habit tracker for students", "An invoice dashboard"];
  const flow = [
    ["Exchange", "Offer the AI capacity you are not using. Providers verify it in minutes, never touching your keys.", "exchange"],
    ["Earn", "Every token contributed becomes Exchange Credits, priced by a transparent live market.", "coins"],
    ["Build", "Spend EC on any model inside the Vibe Coding Studio and talk your product into existence.", "code"],
    ["Deploy", "Ship to a live URL with one click, then publish your creation to the marketplace.", "cloud"],
  ] as const;
  return (
    <div className="landing">
      <header className="l-nav">
        <Brand />
        <nav>
          <a href="#how">How it works</a><a href="#market">Live market</a><a href="#models">Models</a><a href="#join">Join</a>
        </nav>
        <div><button className="link-btn" onClick={() => go("signup")}>Sign in</button><button className="btn gold" onClick={() => go("login")}>Get started</button></div>
      </header>

      <section className="l-hero">
        <div className="l-orbital" aria-hidden="true">
          <div className="sun" />
          <div className="ring r1" /><div className="ring r2" /><div className="ring r3" />
          <div className="spin s1">
            <div className="sat" style={{ ["--a" as string]: "20deg", ["--r" as string]: "230px" }}><div className="sat-in"><ModelLogo type="claude" /><b>Claude</b></div></div>
            <div className="sat" style={{ ["--a" as string]: "200deg", ["--r" as string]: "230px" }}><div className="sat-in"><ModelLogo type="gemini" /><b>Gemini</b></div></div>
          </div>
          <div className="spin s2">
            <div className="sat" style={{ ["--a" as string]: "110deg", ["--r" as string]: "330px" }}><div className="sat-in"><ModelLogo type="openai" /><b>GPT-4o</b></div></div>
            <div className="sat" style={{ ["--a" as string]: "300deg", ["--r" as string]: "330px" }}><div className="sat-in"><ModelLogo type="deepseek" /><b>R1</b></div></div>
          </div>
          <div className="live-tag"><i />Demo network · illustrative data</div>
        </div>

        <div className="l-hero-copy">
          <Kicker n="Vol. 01">The AI capacity exchange</Kicker>
          <h1 className="rise">
            Unused AI<br /><em>capacity</em>,<br />turned into<br /><span>possibility.</span>
          </h1>
        </div>

        <div className="l-hero-foot">
          <p>Trade the AI you don&apos;t use for credits, then spend them building anything in a studio where every line is a conversation.</p>
          <div className="l-compose">
            <div className="l-compose-row">
              <Icon name="sparkle" size={18} />
              <input value={idea} onChange={e => setIdea(e.target.value)} onKeyDown={e => e.key === "Enter" && go("studio")} placeholder="Describe something you want to build…" />
              <button className="btn gold" onClick={() => go("studio")}>Start with AI<Icon name="arrow" size={15} /></button>
            </div>
            <div className="l-chips">{suggestions.map(s => <button key={s} onClick={() => setIdea(s)}>{s}</button>)}</div>
          </div>
        </div>
      </section>

      <Ticker />

      <section className="l-flow" id="how">
        <div className="l-flow-head">
          <Kicker n="01">How it works</Kicker>
          <h2>Four moves.<br /><em>One loop.</em></h2>
          <button className="btn ghost" onClick={() => go("connect")}>Become a provider<Icon name="arrow" size={15} /></button>
        </div>
        <div className="l-flow-list">
          {flow.map(([t, d, ic], i) => (
            <article key={t} className="flow-row">
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{t}</h3>
              <p>{d}</p>
              <span className="flow-ic"><Icon name={ic} size={22} /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="l-market" id="market">
        <div className="big-stat"><b>12.8K</b><span>builders on the network</span></div>
        <div className="big-stat"><b>3.2M</b><span>tokens exchanged today</span></div>
        <div className="big-stat"><b>42<small> EC</small></b><span>average price per 1K tokens</span></div>
        <div className="big-stat"><b>0</b><span>credentials ever shared</span></div>
      </section>

      <section className="l-models" id="models">
        <Kicker n="02">Powering ideas with</Kicker>
        <div className="model-wall">
          {["Gemini", "Claude", "OpenAI", "DeepSeek"].map((m, i) => <button key={m} onClick={() => go("exchange")} style={delay(i)}><span>{m}</span><Icon name="up" size={22} /></button>)}
        </div>
      </section>

      <section className="l-cta" id="join">
        <h2>Same AI resources.<br /><em>More possibilities.</em></h2>
        <div><button className="btn gold large" onClick={() => go("dashboard")}>Enter the platform<Icon name="arrow" size={16} /></button></div>
      </section>
      <footer className="l-foot"><span>© 2026 Invenzo AI</span><span>Chennai · Remote</span><span>Privacy · Terms</span></footer>
    </div>
  );
}

/* ───────────────────────── Authentication ───────────────────────── */

function Auth({ mode, go }: { mode: "signup" | "login"; go: Go }) {
  const signup = mode === "signup";
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    go(signup ? "verify-email" : "mfa");
  };

  return (
    <div className="auth">
      <header className="auth-nav">
        <Brand onClick={() => go("landing")} />
        <button className="auth-back" onClick={() => go("landing")}>Back to home <Icon name="up" size={15} /></button>
      </header>

      <main className="auth-layout">
        <section className="auth-story">
          <Kicker n={signup ? "New account" : "Welcome back"}>The AI capacity exchange</Kicker>
          <h1 className="rise">
            {signup ? <>Turn capacity<br />into <em>possibility.</em></> : <>Continue building<br /><em>what&apos;s next.</em></>}
          </h1>
          <p>{signup
            ? "Join builders and providers trading unused AI capacity for the credits that bring new ideas to life."
            : "Your credits, projects, and connected capacity are ready exactly where you left them."}</p>
          <div className="auth-signal">
            <span><i className="live-dot" /><b>2.4M</b><small>tokens live</small></span>
            <span><b>147</b><small>demo provider profiles</small></span>
            <span><b>12.8K</b><small>active builders</small></span>
          </div>
          <div className="auth-orbit" aria-hidden="true">
            <div className="ring r1" /><div className="ring r2" />
            <div className="auth-core"><span className="brand-mark"><i /><i /><i /><i /></span></div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-form-head">
            <span className="mono">{signup ? "01 / Create account" : "01 / Sign in"}</span>
            <h2>{signup ? <>Start your <em>journey.</em></> : <>Good to see<br /><em>you again.</em></>}</h2>
            <p>{signup ? "Create your account and begin with a 100 EC demo allocation." : "Enter your details to access your workspace."}</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {signup && <label><span>Full name</span><input name="name" type="text" autoComplete="name" placeholder="Your name" required /></label>}
            <label><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label>
            <label><span>Password</span><input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} placeholder="At least 8 characters" minLength={8} required /></label>
            {!signup && <button type="button" className="auth-forgot" onClick={() => go("forgot")}>Forgot password?</button>}
            <button className="btn gold large auth-submit" type="submit">
              {signup ? "Create account" : "Sign in"}<Icon name="arrow" size={16} />
            </button>
          </form>

          <div className="auth-switch">
            <span>{signup ? "Already part of the network?" : "New to Invenzo AI?"}</span>
            <button className="btn ghost" onClick={() => go(signup ? "login" : "signup")}>
              {signup ? "Log in" : "Sign up"}<Icon name="arrow" size={14} />
            </button>
          </div>
          <small className="auth-legal">By continuing, you agree to our Terms of Service and Privacy Policy.</small>
          {!signup && <div className="auth-state-links"><button onClick={() => go("session-expired")}>Session expired state</button><button onClick={() => go("account-locked")}>Locked account state</button></div>}
        </section>
      </main>
    </div>
  );
}

function AuthState({ screen, go }: { screen: Screen; go: Go }) {
  const [stage, setStage] = useState(0);
  const [sent, setSent] = useState(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (screen === "forgot") setSent(true);
    else if (screen === "reset") go("login");
    else if (screen === "mfa") stage === 0 ? setStage(1) : go("dashboard");
  };
  const configs: Partial<Record<Screen, [string, string, string]>> = {
    forgot: ["Password recovery", sent ? "Check your inbox." : "Reset your password.", sent ? "A demo recovery link has been prepared for mithun@example.com." : "Enter your account email to continue."],
    reset: ["Secure account", "Choose a new password.", "Use at least eight characters and avoid a password used elsewhere."],
    "verify-email": ["Email verification", "Verify your email.", "A six-digit demo code was sent to mithun@example.com."],
    mfa: ["Multi-factor security", stage ? "Enter your code." : "Secure your account.", stage ? "Enter the six-digit code from your authenticator." : "Set up an authenticator before entering the workspace."],
    "session-expired": ["Session expired", "Sign in again.", "Your session ended to protect your account. No local work was removed."],
    "account-locked": ["Security warning", "Account temporarily locked.", "Multiple unsuccessful sign-in attempts were detected. Recovery is available through your verified email."],
    logout: ["Sign out", "Leave this session?", "Saved work remains in your workspace. Pending local operations will synchronize when you return."],
  };
  if (screen === "onboarding") return <div className="auth onboarding"><header className="auth-nav"><Brand onClick={() => go("landing")} /><span className="demo-badge">Product tour · Demo</span></header><main className="onboarding-main"><Kicker n={`${stage + 1} / 5`}>First-time setup</Kicker><div className="onboard-step" key={stage}>{[
    ["Connect an AI provider", "Authorize a supported provider project or API capacity source. Credentials remain encrypted and private.", "link"],
    ["Verify capacity", "Invenzo prepares provider and model capacity for verification by the future backend.", "shield"],
    ["Receive EC value", "Verified provider capacity receives an illustrative value using a versioned pricing methodology.", "coins"],
    ["Exchange capacity", "Use EC to reserve a supported provider entitlement through an auditable agreement.", "exchange"],
    ["Build in Studio", "Consume the entitlement in Vibe Coding Studio. Demo usage is clearly separated from real metering.", "code"],
  ].map((item, i) => i === stage && <div key={item[0]}><span className="onboard-icon"><Icon name={item[2] as IconName} size={30} /></span><h1>{item[0]}.</h1><p>{item[1]}</p></div>)}</div><div className="onboard-foot"><div className="onboard-dots">{[0, 1, 2, 3, 4].map(i => <i className={cx(i <= stage && "on")} key={i} />)}</div><button className="btn ghost" onClick={() => go("dashboard")}>Skip tour</button><button className="btn gold" onClick={() => stage === 4 ? go("providers") : setStage(stage + 1)}>{stage === 4 ? "Connect provider" : "Continue"}<Icon name="arrow" size={15} /></button></div></main></div>;
  const config = configs[screen] || configs.forgot!;
  return <div className="auth"><header className="auth-nav"><Brand onClick={() => go("landing")} /><button className="auth-back" onClick={() => go("login")}>Back to sign in <Icon name="up" size={15} /></button></header><main className="auth-state-main"><section className="auth-state-card"><span className="mono">{config[0]}</span><h1>{config[1]}</h1><p>{config[2]}</p>
    {screen === "verify-email" ? <><div className="code-inputs" aria-label="Verification code">{[1, 2, 3, 4, 5, 6].map(i => <input key={i} inputMode="numeric" maxLength={1} aria-label={`Digit ${i}`} />)}</div><button className="btn gold" onClick={() => go("onboarding")}>Verify email</button><button className="link-btn" onClick={() => setSent(true)}>{sent ? "Demo code prepared again" : "Resend demo code"}</button></> :
    screen === "session-expired" ? <button className="btn gold" onClick={() => go("login")}>Return to sign in</button> :
    screen === "account-locked" ? <><button className="btn gold" onClick={() => go("forgot")}>Start account recovery</button><button className="link-btn" onClick={() => go("landing")}>Return home</button></> :
    screen === "logout" ? <div className="flow-actions"><button className="btn ghost" onClick={() => go("settings")}>Stay signed in</button><button className="btn gold" onClick={() => go("landing")}>Sign out</button></div> :
    <form className="auth-form compact-form" onSubmit={submit}>
      {screen === "forgot" && !sent && <label><span>Email address</span><input type="email" defaultValue="mithun@example.com" required /></label>}
      {screen === "reset" && <><label><span>New password</span><input type="password" minLength={8} required /></label><label><span>Confirm password</span><input type="password" minLength={8} required /></label></>}
      {screen === "mfa" && (stage === 0 ? <div className="mfa-setup"><div className="qr-demo" aria-label="Demo QR placeholder">MFA</div><span>Scan with an authenticator app. This is a demonstration placeholder and not a real secret.</span></div> : <label><span>Authenticator code</span><input inputMode="numeric" maxLength={6} placeholder="000 000" required /></label>)}
      {sent ? <><div className="secure"><Icon name="check" /><p><b>Recovery email prepared.</b> Email delivery requires backend integration.</p></div><button type="button" className="btn gold" onClick={() => go("reset")}>Open reset demo</button></> : <button className="btn gold" type="submit">{screen === "forgot" ? "Send recovery link" : screen === "reset" ? "Update password" : stage ? "Verify and continue" : "Set up MFA"}</button>}
    </form>}
  </section></main></div>;
}

/* ───────────────────────── Dashboard ───────────────────────── */

const projects = [
  { name: "SkillSyncX", desc: "AI skill matching for students and professionals.", tech: ["React", "Node.js", "MongoDB"], tone: "violet" },
  { name: "DevMeet", desc: "Developer community for learning and networking.", tech: ["Next.js", "PostgreSQL", "Tailwind"], tone: "navy" },
  { name: "Trivioo", desc: "Placement preparation with AI-driven practice.", tech: ["React", "Express", "MongoDB"], tone: "blue" },
  { name: "Plug-In", desc: "Community EV charging availability platform.", tech: ["React", "TypeScript", "Supabase"], tone: "green" },
  { name: "Milk Supply Billing", desc: "Billing and customer management for dairies.", tech: ["React", "Node.js", "MySQL"], tone: "amber" },
];

function Dashboard({ go }: { go: Go }) {
  const bal = useCountUp(65);
  const ledger = [
    ["gemini", "Exchanged Gemini capacity", "2 hours ago", "+50 EC"],
    ["claude", "Used Claude Haiku", "4 hours ago", "−20 EC"],
    ["openai", "Built with GPT-4o", "Yesterday", "−30 EC"],
    ["other", "Created SkillSyncX", "2 days ago", "—"],
  ] as const;
  return (
    <Shell screen="dashboard" go={go}>
      <section className="d-hero">
        <div className="d-greet">
          <Kicker n="Mon 12 Oct"><span className="live-dot" />Demo capacity network</Kicker>
          <h1 className="rise">Good morning,<br /><em>Mithun.</em></h1>
          <p className="lede">Your demo capacity record includes <b>50 EC</b> of illustrative earnings. What will you bring to life today?</p>
          <div className="row gap">
            <button className="btn gold large" onClick={() => go("studio")}><Icon name="sparkle" />Start creating</button>
            <button className="btn ghost large" onClick={() => go("exchange")}>Explore capacity<Icon name="arrow" size={15} /></button>
          </div>
        </div>
        <div className="d-orbit">
          <div className="ring r1" /><div className="ring r2" />
          <div className="spin s1"><div className="sat dot" style={{ ["--a" as string]: "40deg", ["--r" as string]: "170px" }} /><div className="sat dot sm" style={{ ["--a" as string]: "220deg", ["--r" as string]: "170px" }} /></div>
          <div className="spin s2"><div className="sat dot" style={{ ["--a" as string]: "130deg", ["--r" as string]: "245px" }} /></div>
          <button className="core" onClick={() => go("wallet")}>
            <small>Available</small><strong>{bal}</strong><span>EC balance</span><i>View wallet →</i>
          </button>
          <div className="tag t-earn"><small>Earned</small><b>+250 EC</b></div>
          <div className="tag t-spent"><small>Invested</small><b>150 EC</b></div>
        </div>
      </section>

      <section className="working">
        <span className="live-dot" /><p><b>Demo contribution state.</b> Gemini Flash · 25K tokens prepared</p>
        <div className="flow-line"><i /><i /><i /><i /><i /></div>
        <p><b>+50 EC</b> this week · 18% above your average</p>
        <button className="link-btn" onClick={() => go("connect")}>Manage contribution →</button>
      </section>

      <div className="d-cols">
        <section>
          <SectionHead n="01" title="Where to next" />
          <div className="index-list">
            {[
              ["Connect a provider", "Share unused AI capacity and earn credits", "connect"],
              ["Browse offers", "Find the right model at the right price", "exchange"],
              ["Open the studio", "Build your next idea with AI", "studio"],
            ].map(([t, s, to], i) => (
              <button key={t} className="index-row" onClick={() => go(to as Screen)}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span><b>{t}</b><small>{s}</small><Icon name="arrow" size={22} />
              </button>
            ))}
          </div>

          <SectionHead n="02" title="Pick up where you left off" aside={<button className="link-btn" onClick={() => go("projects")}>All projects →</button>} />
          <div className="strip">
            {projects.slice(0, 3).map(p => (
              <button key={p.name} className="strip-card" data-tone={p.tone} onClick={() => go("studio")}>
                <span className="mono">Edited 2h ago</span><b>{p.name}</b><small>{p.desc}</small>
              </button>
            ))}
            <button className="strip-card new" onClick={() => go("studio")}><Icon name="plus" size={26} /><b>New project</b></button>
          </div>
        </section>

        <aside>
          <SectionHead n="03" title="Ledger" />
          <div className="ledger">
            {ledger.map(([t, title, time, amt]) => (
              <div className="ledger-row" key={title}>
                <ModelLogo type={t} /><div><b>{title}</b><small>{time}</small></div><strong className={amt.startsWith("+") ? "pos" : amt.startsWith("−") ? "neg" : ""}>{amt}</strong>
              </div>
            ))}
          </div>
          <div className="note-card">
            <Icon name="sparkle" size={20} />
            <h3>Put your idle AI to work</h3>
            <p>Connect a provider and start earning EC from capacity you would otherwise waste.</p>
            <button className="link-btn" onClick={() => go("connect")}>Connect provider →</button>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

/* ───────────────────────── Exchange ───────────────────────── */

type OfferType = "gemini" | "claude" | "openai" | "deepseek";
const offers: { type: OfferType; name: string; provider: string; cap: number; price: number; label: string; rating: number; delta: string }[] = [
  { type: "gemini", name: "Gemini 1.5 Flash", provider: "Karthik D.", cap: 80, price: 30, label: "Fast & efficient", rating: 4.8, delta: "-8%" },
  { type: "claude", name: "Claude 3 Haiku", provider: "Meera R.", cap: 40, price: 25, label: "Great for code", rating: 4.7, delta: "+12%" },
  { type: "openai", name: "GPT-4o", provider: "Rahul V.", cap: 100, price: 95, label: "Multimodal", rating: 4.9, delta: "+4%" },
  { type: "gemini", name: "Gemini 1.5 Pro", provider: "Arjun K.", cap: 50, price: 50, label: "Recommended", rating: 4.8, delta: "+2%" },
  { type: "deepseek", name: "DeepSeek R1", provider: "Sneha M.", cap: 20, price: 20, label: "Reasoning", rating: 4.5, delta: "-5%" },
];

function Exchange({ go }: { go: Go }) {
  const [provider, setProvider] = useState("All");
  const [max, setMax] = useState(100);
  const [sort, setSort] = useState("Recommended");
  const [top, setTop] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const series = useLiveSeries(40);
  const shown = useMemo(() => {
    const list = offers.filter(o => (provider === "All" || o.type === provider.toLowerCase()) && o.price <= max && (!top || o.rating >= 4.8));
    if (sort === "Lowest price") list.sort((a, b) => a.price - b.price);
    if (sort === "Most capacity") list.sort((a, b) => b.cap - a.cap);
    return list;
  }, [provider, max, sort, top]);
  const last = series[series.length - 1];
  return (
    <Shell screen="exchange" go={go}>
      <section className="x-hero">
        <div>
          <Kicker n="02"><span className="live-dot" />Simulated capacity market</Kicker>
          <h1 className="rise">Intelligence,<br /><em>on demand.</em></h1>
          <p className="lede">Verified AI capacity at transparent prices. Choose a model, spend EC, start building instantly.</p>
          <div className="row gap"><button className="btn gold" onClick={() => go("connect")}><Icon name="plus" />Contribute capacity</button><button className="btn ghost" onClick={() => go("calculator")}>Calculate EC</button><span className="mono muted">147 demo providers</span></div>
        </div>
        <div className="pulse">
          <div className="pulse-top"><span className="mono">Market pulse · index</span><b>{last.toFixed(1)}<small className={last > 60 ? "pos" : "neg"}> {last > 60 ? "▲" : "▼"}</small></b></div>
          <div className="pulse-bars">{series.map((v, i) => <i key={i} style={{ height: `${v}%`, opacity: 0.35 + (i / series.length) * 0.65 }} />)}</div>
          <div className="pulse-foot"><span><small>Available</small><b>2.4M tok</b></span><span><small>Avg. price</small><b>42 EC</b></span><span><small>24h volume</small><b>18.7K EC</b></span></div>
        </div>
      </section>

      <div className="subnav">
        {[["Compatible Matches", "exchange"], ["Active Agreements", "agreement"], ["My Offers", "offer"], ["My Entitlements", "entitlements"], ["Audit Ledger", "audit"], ["EC Pricing", "pricing"]].map(([label, to], i) => (
          <button key={label} className={cx(i === 0 && "on")} onClick={() => go(to as Screen)}>{label}</button>
        ))}
      </div>
      <div className="x-bar">
        <div className="chips">
          {["All", "Gemini", "Claude", "OpenAI", "DeepSeek"].map(t => <button key={t} className={cx(provider === t && "on")} onClick={() => setProvider(t)}>{t}</button>)}
        </div>
        <label className="range"><span className="mono">Max price</span><input type="range" min="10" max="100" value={max} onChange={e => setMax(+e.target.value)} /><b>{max} EC</b></label>
        <button className={cx("toggle-pill", top && "on")} onClick={() => setTop(v => !v)}><i />Rated 4.8+</button>
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort offers"><option>Recommended</option><option>Lowest price</option><option>Most capacity</option></select>
      </div>

      <div className="book">
        <div className="book-head"><span>Model</span><span>Provider</span><span>Capacity</span><span>Price / 1K</span><span>24h</span><span /></div>
        {shown.length === 0 && <div className="empty">No offers match these filters. <button className="link-btn" onClick={() => { setProvider("All"); setMax(100); setTop(false); }}>Reset filters</button></div>}
        {shown.map((o, i) => (
          <div className={cx("book-row", picked === o.name && "picked")} key={o.name} style={delay(i)} onMouseEnter={() => setPicked(o.name)} onMouseLeave={() => setPicked(null)}>
            <div className="b-model"><ModelLogo type={o.type} /><div><h3>{o.name}</h3><small>{o.label}</small></div></div>
            <div><b>{o.provider}</b><small>★ {o.rating}</small></div>
            <div className="b-cap"><b>{o.cap}K tokens</b><span className="meter"><i style={{ width: `${o.cap}%` }} /></span></div>
            <div className="b-price">{o.price}<small> EC</small></div>
            <em className={o.delta.startsWith("+") ? "pos" : "neg"}>{o.delta}</em>
            <button className="btn gold small" onClick={() => go("entitlements")}>Use capacity</button>
          </div>
        ))}
      </div>
    </Shell>
  );
}

/* ───────────────────────── Connect ───────────────────────── */

function Connect({ go }: { go: Go }) {
  const [stage, setStage] = useState(0);
  const [provider, setProvider] = useState("Google Gemini");
  const [tokens, setTokens] = useState(25000);
  const stages = ["Connect", "Verify capacity", "Set contribution", "Start earning"];
  const next = () => (stage === 3 ? go("dashboard") : setStage(s => s + 1));
  const providers: [string, string, string][] = [
    ["gemini", "Google Gemini", "Connect your Gemini API account"],
    ["claude", "Anthropic Claude", "Connect your Claude API account"],
    ["openai", "OpenAI", "Connect your OpenAI API account"],
    ["other", "Other providers", "Connect another supported provider"],
  ];
  return (
    <Shell screen="connect" go={go}>
      <div className="c-split">
        <aside className="c-left">
          <Kicker n="Provider">Become a provider</Kicker>
          <h1 className="rise">Idle limits,<br /><em>creative currency.</em></h1>
          <div className="c-big">{String(stage + 1).padStart(2, "0")}</div>
          <ol className="c-steps">
            {stages.map((s, i) => (
              <li key={s} className={cx(i === stage && "on", i < stage && "done")}>
                <span>{i < stage ? <Icon name="check" size={13} /> : i + 1}</span>{s}
              </li>
            ))}
          </ol>
          <div className="converter"><Icon name="cloud" size={18} /><i /><Icon name="exchange" size={18} /><i /><Icon name="coins" size={18} /></div>
        </aside>

        <section className="c-right">
          {stage === 0 && (
            <>
              <h2>Choose your AI provider</h2>
              <p className="muted">Select the account with unused capacity. You can connect more later.</p>
              <div className="prov-list">
                {providers.map(([t, n, d]) => (
                  <button key={n} className={cx("prov", provider === n && "on")} onClick={() => setProvider(n)}>
                    <ModelLogo type={t as "gemini"} /><div><b>{n}</b><small>{d}</small></div><span>{provider === n ? <Icon name="check" size={16} /> : "Select"}</span>
                  </button>
                ))}
              </div>
              <div className="secure"><Icon name="shield" size={20} /><p><b>Your credentials stay private.</b> Encrypted, never shared. We only read the usage needed to verify capacity.</p></div>
            </>
          )}
          {stage === 1 && (
            <>
              <h2>Authorize {provider}</h2>
              <p className="muted">Connect an authorized project credential. Never enter a provider password.</p>
              <div className="credential-form">
                <label><span>Authorized API / project credential</span><input type="password" defaultValue="sk-prototype-credential" aria-label="Provider credential" /></label>
                <label><span>Project ID</span><input defaultValue="invenzo-ai-production" aria-label="Project ID" /></label>
              </div>
              <ul className="verify">
                <li><Icon name="check" size={16} />Credential format prepared locally</li>
                <li><Icon name="clock" size={16} />Provider contact requires backend</li>
                <li className="pending"><span className="spinner" />Previewing verification state…</li>
              </ul>
            </>
          )}
          {stage === 2 && (
            <>
              <h2>Set your contribution</h2>
              <p className="muted">Choose how much unused capacity to make available each month.</p>
              <div className="dial"><b>{tokens.toLocaleString()}</b><span>tokens / month</span></div>
              <input className="wide-range" type="range" min="5000" max="50000" step="1000" value={tokens} onChange={e => setTokens(+e.target.value)} />
              <div className="est"><span>Estimated monthly earnings</span><b>+{Math.round(tokens / 200)} EC</b></div>
            </>
          )}
          {stage === 3 && (
            <>
              <div className="done-mark"><Icon name="check" size={34} /></div>
              <h2>Demo connection prepared.</h2>
              <p className="muted">A real backend will verify {provider}, detect capacity, and activate contributions.</p>
              <div className="est three"><span><small>Proposed contribution</small><b>{Math.round(tokens / 1000)}K tok</b></span><span><small>Illustrative value</small><b>{Math.round(tokens / 200)} EC/mo</b></span><span><small>Status</small><b className="pos">Local demo</b></span></div>
            </>
          )}
          <div className="c-foot">
            <button className="btn ghost" onClick={() => (stage ? setStage(stage - 1) : go("dashboard"))}>Back</button>
            <button className="btn gold" onClick={next}>{["Continue with " + provider, "Preview verification", "Confirm demo contribution", "Return home"][stage]}<Icon name="arrow" size={15} /></button>
          </div>
        </section>
      </div>
    </Shell>
  );
}

/* ───────────────────────── Wallet ───────────────────────── */

const transactions = [
  ["Gemini 2.5 Flash", "CAPACITY_CONTRIBUTION", "Google Gemini", "Oct 12 · 10:42", "+50", "COMPLETED", "15", "65"],
  ["Claude 3.5 Sonnet", "STUDIO_USAGE", "ENT-000219", "Oct 12 · 08:14", "−20", "COMPLETED", "85", "65"],
  ["SupportFlow AI", "MARKETPLACE_PURCHASE", "Invenzo Market", "Oct 11 · 16:28", "−35", "COMPLETED", "120", "85"],
  ["Agreement AGR-000083", "EXCHANGE_SETTLEMENT", "Mukesh R.", "Oct 10 · 13:07", "+42", "PENDING", "78", "120"],
  ["Usage correction", "ADJUSTMENT", "Invenzo Ops", "Oct 8 · 11:32", "+8", "REVERSED", "70", "78"],
];

function Wallet({ go }: { go: Go }) {
  const bal = useCountUp(65, 1600);
  const [range, setRange] = useState("30D");
  const [filter, setFilter] = useState("All");
  const pts: Record<string, number[]> = {
    "7D": [60, 58, 66, 62, 74, 80, 100],
    "30D": [8, 14, 12, 22, 20, 34, 30, 46, 44, 58, 55, 70, 66, 82, 78, 100],
    "90D": [4, 6, 10, 9, 18, 16, 24, 30, 28, 40, 52, 48, 70, 66, 88, 100],
  };
  const p = pts[range];
  const w = 760, h = 220;
  const xy = p.map((v, i) => [(i / (p.length - 1)) * w, h - (v / 100) * (h - 20) - 10]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const rows = transactions.filter(t => filter === "All" || (filter === "Earned" ? t[4].startsWith("+") : t[4].startsWith("−")));
  return (
    <Shell screen="wallet" go={go}>
      <section className="w-hero">
        <div className="w-balance">
          <Kicker n="Wallet">Your creative balance</Kicker>
          <div className="w-num rise"><strong>{bal}</strong><span>EC</span></div>
          <p className="lede">Enough for roughly <b>3.3M Gemini Flash tokens</b>.</p>
          <div className="row gap"><button className="btn gold" onClick={() => go("exchange")}><Icon name="search" />Spend credits</button><button className="link-btn" onClick={() => go("connect")}>Earn more →</button></div>
        </div>
        <div className="w-chart">
          <div className="w-chart-top">
            <div><small className="mono">Available after reservations</small><b>65 EC</b></div>
            <div className="chips">{Object.keys(pts).map(r => <button key={r} className={cx(range === r && "on")} onClick={() => setRange(r)}>{r}</button>)}</div>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="area">
            <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f4c760" stopOpacity=".38" /><stop offset="1" stopColor="#f4c760" stopOpacity="0" /></linearGradient></defs>
            {[0.25, 0.5, 0.75].map(f => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} className="grid-l" />)}
            <path d={`${line} L${w} ${h} L0 ${h}Z`} fill="url(#g)" />
            <path d={line} className="curve" key={range} />
            <circle cx={xy[xy.length - 1][0] - 4} cy={xy[xy.length - 1][1]} r="5" className="end" />
          </svg>
        </div>
      </section>

      <Metrics items={[["Available", "65 EC", "spendable"], ["Reserved", "35 EC", "ENT-000219"], ["Pending", "42 EC", "settlement"], ["Earned", "250 EC", "lifetime"], ["Spent", "150 EC", "lifetime"]]} />

      <SectionHead n="Ledger" title="Every credit, accounted for" aside={<div className="chips">{["All", "Earned", "Spent"].map(f => <button key={f} className={cx(filter === f && "on")} onClick={() => setFilter(f)}>{f}</button>)}</div>} />
      <div className="table">
        <div className="t-head"><span>Transaction</span><span>Type</span><span>Source</span><span>Timestamp</span><span>Before → After</span><span>Amount</span><span>Status</span></div>
        {rows.map((t, i) => (
          <button className="t-row" key={t[0] + t[3]} style={delay(i)} onClick={() => go("transaction")}>
            <span className="mono">TXN-{String(981 - i).padStart(6, "0")}</span><b>{t[1]}</b><span>{t[0]}<small>{t[2]}</small></span><span className="muted">{t[3]}</span><span className="mono">{t[6]} → {t[7]} EC</span>
            <strong className={t[4].startsWith("+") ? "pos" : "neg"}>{t[4]} EC</strong><em className={cx("status", t[5] === "COMPLETED" && "ok", t[5] === "REVERSED" && "neg")}>{t[5]}</em>
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ───────────────────────── Projects ───────────────────────── */

function Projects({ go }: { go: Go }) {
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [fav, setFav] = useState<string[]>(["SkillSyncX"]);
  const shown = projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) && (filter !== "Favorites" || fav.includes(p.name)));
  return (
    <Shell screen="projects" go={go}>
      <section className="p-hero">
        <div>
          <Kicker n="04">Your creative universe</Kicker>
          <h1 className="rise">Ideas become<br /><em>real products.</em></h1>
        </div>
        <div className="p-stats"><span><b>5</b><small>Active builds</small></span><span><b>18h</b><small>Time saved</small></span><span><b>94%</b><small>AI generated</small></span></div>
        <button className="btn gold large" onClick={() => go("new-project")}><Icon name="plus" />New project</button>
      </section>

      <div className="x-bar">
        <div className="chips">{["All", "Favorites", "Shared with me"].map(t => <button key={t} className={cx(filter === t && "on")} onClick={() => setFilter(t)}>{t}</button>)}</div>
        <label className="search-line"><Icon name="search" size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects" /></label>
        <div className="chips seg"><button className={cx(view === "grid" && "on")} onClick={() => setView("grid")}>Grid</button><button className={cx(view === "list" && "on")} onClick={() => setView("list")}>List</button></div>
      </div>

      <div className={cx("p-grid", view === "list" && "list")}>
        {shown.map((p, i) => (
          <article key={p.name} className={cx("p-card", i === 0 && view === "grid" && "feature")} data-tone={p.tone} style={delay(i)}>
            <div className="p-cover">
              <span className="mono">{String(i + 1).padStart(2, "0")} · {i === 3 ? "Deployed" : "In progress"}</span>
              <h3>{p.name}</h3>
              <button className={cx("star", fav.includes(p.name) && "on")} aria-label="Favorite" onClick={() => setFav(v => (v.includes(p.name) ? v.filter(x => x !== p.name) : [...v, p.name]))}><Icon name="heart" size={16} /></button>
            </div>
            <div className="p-body">
              <p>{p.desc}</p>
              <div className="tags">{p.tech.map(t => <span key={t}>{t}</span>)}</div>
              <button className="link-btn" onClick={() => go("project-detail")}>Open project →</button>
            </div>
          </article>
        ))}
        {shown.length === 0 && <div className="empty">Nothing here yet.</div>}
      </div>
    </Shell>
  );
}

/* ───────────────────────── Community ───────────────────────── */

const posts = [
  { ini: "PS", name: "Priya Sharma", role: "AI Builder", time: "12 min", title: "Built a customer support agent with Claude Haiku in under two hours", body: "I connected our knowledge base and shipped version one before lunch. The capacity exchange made testing different models almost free, which changed how I iterate.", tags: ["Showcase", "Claude"], likes: 42, replies: 11, tone: "peach" },
  { ini: "AK", name: "Arjun Kumar", role: "Capacity Provider", time: "1 hour", title: "How to contribute Gemini capacity without ever running dry", body: "A quick guide to safe contribution limits that maximize your monthly EC earnings and keep headroom for your own work.", tags: ["Guide", "Gemini"], likes: 31, replies: 8, tone: "blue" },
  { ini: "SM", name: "Sneha Mehta", role: "Developer", time: "3 hours", title: "Looking for collaborators: an open-source multilingual learning assistant", body: "We are building an assistant for students across languages. Looking for React and prompt engineering contributors.", tags: ["Collaboration", "Open source"], likes: 27, replies: 16, tone: "violet" },
];

function Community({ go }: { go: Go }) {
  const [tab, setTab] = useState("For you");
  const [joined, setJoined] = useState<string[]>([]);
  const [liked, setLiked] = useState<number[]>([]);
  const [draft, setDraft] = useState("");
  const [mine, setMine] = useState<string[]>([]);
  const shown = tab === "Showcase" ? posts.filter(p => p.tags.includes("Showcase")) : tab === "Discussions" ? posts.filter(p => p.tags.includes("Collaboration") || p.tags.includes("Guide")) : posts;
  return (
    <Shell screen="community" go={go}>
      <section className="m-hero">
        <Kicker n="05"><span className="live-dot" />2,481 demo community profiles</Kicker>
        <h1 className="rise">Build in public.<br /><em>Grow together.</em></h1>
        <div className="faces">{["PS", "AK", "SM", "RV", "NJ", "+12K"].map((n, i) => <span key={n} data-i={i}>{n}</span>)}</div>
      </section>

      <div className="m-layout">
        <section>
          <div className="chips tabs">{["For you", "Following", "Showcase", "Discussions"].map(t => <button key={t} className={cx(tab === t && "on")} onClick={() => setTab(t)}>{t}</button>)}</div>
          <div className="composer">
            <span className="av gold">MK</span>
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { setMine(m => [draft, ...m]); setDraft(""); } }} placeholder="Share an idea, project, or question…" />
            <button className="btn gold small" onClick={() => { if (draft.trim()) { setMine(m => [draft, ...m]); setDraft(""); } }}>Post</button>
          </div>
          {mine.map(m => <article className="post mine" key={m}><div className="post-meta"><span className="av gold">MK</span><b>You</b><small>just now</small></div><h2>{m}</h2></article>)}
          {shown.map(p => {
            const i = posts.indexOf(p);
            return (
              <article className="post" key={p.title}>
                <div className="post-meta"><span className={`av ${p.tone}`}>{p.ini}</span><b>{p.name}</b><small>{p.role} · {p.time} ago</small></div>
                <h2>{p.title}</h2>
                <p>{p.body}</p>
                {i === 0 && <button className="embed" onClick={() => go("studio")}><span className="mono">Open in studio</span><b>SupportFlow AI</b><small>Customer support, powered by your knowledge</small><Icon name="arrow" size={18} /></button>}
                <div className="post-foot">
                  <div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
                  <button className={cx(liked.includes(i) && "liked")} onClick={() => setLiked(v => (v.includes(i) ? v.filter(n => n !== i) : [...v, i]))}><Icon name="heart" size={15} />{p.likes + (liked.includes(i) ? 1 : 0)}</button>
                  <button><Icon name="chat" size={15} />{p.replies}</button>
                </div>
              </article>
            );
          })}
        </section>
        <aside>
          <SectionHead n="A" title="Groups" />
          {[["AI Builders India", "4.2K members", "AB"], ["Vibe Coding", "2.8K members", "VC"], ["Capacity Providers", "1.6K members", "CP"]].map(g => (
            <div className="group" key={g[0]}><span>{g[2]}</span><div><b>{g[0]}</b><small>{g[1]}</small></div><button className={cx(joined.includes(g[0]) && "on")} onClick={() => setJoined(v => (v.includes(g[0]) ? v.filter(x => x !== g[0]) : [...v, g[0]]))}>{joined.includes(g[0]) ? "Joined" : "Join"}</button></div>
          ))}
          <SectionHead n="B" title="Trending" />
          {["#vibecoding", "#gemini-flash", "#buildinpublic", "#aiagents"].map((t, i) => (
            <button className="trend" key={t}><span className="mono">{i + 1}</span><b>{t}</b><small>{128 - i * 19} posts</small></button>
          ))}
        </aside>
      </div>
    </Shell>
  );
}

/* ───────────────────────── Marketplace ───────────────────────── */

const items = [
  { name: "SupportFlow AI", maker: "Aarya Labs", desc: "Deploy a knowledge-aware support agent in minutes.", cat: "Agents", price: "35 EC", rating: "4.9", tone: "gold" },
  { name: "Landing Page Builder", maker: "Studio Nine", desc: "Generate polished, responsive landing pages from a prompt.", cat: "Templates", price: "Free", rating: "4.8", tone: "violet" },
  { name: "DataLens", maker: "Karthik Dev", desc: "Turn CSV files into clear dashboards and insights.", cat: "Components", price: "20 EC", rating: "4.7", tone: "blue" },
  { name: "MeetingMind", maker: "DevMeet", desc: "Summarize calls, capture tasks, draft follow-ups.", cat: "Workflows", price: "25 EC", rating: "4.8", tone: "navy" },
  { name: "Auth Starter Kit", maker: "OpenStack", desc: "Production-ready authentication flows for React.", cat: "Starter projects", price: "Free", rating: "4.9", tone: "green" },
  { name: "ContentCraft", maker: "Priya S.", desc: "A multi-model writing workflow for social and long-form.", cat: "Prompts", price: "80 EC", rating: "4.6", tone: "peach" },
];

function Marketplace({ go }: { go: Go }) {
  const [cat, setCat] = useState("All");
  const [added, setAdded] = useState<string[]>([]);
  const [purchase, setPurchase] = useState<(typeof items)[number] | null>(null);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setPurchase(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const cats = ["All", "Templates", "Agents", "Prompts", "Components", "Starter projects", "Workflows"];
  const shown = items.filter(i => cat === "All" || i.cat === cat);
  return (
    <Shell screen="marketplace" go={go}>
      <section className="k-hero">
        <div>
          <Kicker n="06">Featured this week</Kicker>
          <h1 className="rise">Don&apos;t start from zero.<br />Start from <em>extraordinary.</em></h1>
          <p className="lede">Production-ready agents, tools and templates from the fastest-moving AI builders.</p>
          <div className="row gap"><button className="btn ink" onClick={() => go("studio")}>Explore SupportFlow<Icon name="arrow" size={15} /></button><button className="btn line" onClick={() => go("new-project")}><Icon name="store" size={16} />Publish your creation</button></div>
        </div>
        <div className="k-art" aria-hidden="true"><span>SF</span><i /><i /><i /></div>
      </section>

      <div className="x-bar">
        <div className="chips">{cats.map(c => <button key={c} className={cx(cat === c && "on")} onClick={() => setCat(c)}>{c}</button>)}</div>
        <span className="mono muted">{shown.length} items</span>
      </div>

      <div className="k-grid">
        {shown.map((it, i) => (
          <article className="k-card" data-tone={it.tone} key={it.name} style={delay(i)}>
            <div className="k-cover"><span>{it.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span><small className="mono">{it.cat}</small></div>
            <div className="k-body">
              <div className="k-title"><h3>{it.name}</h3><span>★ {it.rating}</span></div>
              <small className="muted">by {it.maker}</small>
              <p>{it.desc}</p>
              <div className="k-foot"><b>{it.price}</b><button className={cx("btn small", added.includes(it.name) ? "line" : "gold")} onClick={() => it.price === "Free" ? setAdded(v => [...v, it.name]) : setPurchase(it)}>{added.includes(it.name) ? <><Icon name="check" size={14} />Added</> : it.price === "Free" ? "Add to studio" : "Get template"}</button></div>
            </div>
          </article>
        ))}
      </div>
      {purchase && <div className="overlay" role="presentation" onMouseDown={() => setPurchase(null)}><section className="overlay-card confirm-card" role="dialog" aria-modal="true" aria-label="Purchase confirmation" onMouseDown={e => e.stopPropagation()}><button className="overlay-close" aria-label="Close" onClick={() => setPurchase(null)}>×</button><span className="mono">{Number.parseInt(purchase.price) > 65 ? "Insufficient EC balance" : "Demo purchase review"}</span><h2>{purchase.name}</h2><p className="muted">{purchase.desc}</p><div className="confirm-total"><span><small>Price</small><b>{purchase.price}</b></span><span><small>Available EC</small><b>65 EC</b></span><span><small>Projected remaining</small><b>{Math.max(0, 65 - Number.parseInt(purchase.price))} EC</b></span></div>{Number.parseInt(purchase.price) > 65 ? <div className="flow-actions"><button className="btn ghost" onClick={() => go("capacity")}>Add capacity</button><button className="btn gold" onClick={() => go("exchange")}>Exchange capacity</button></div> : <button className="btn gold" onClick={() => { setAdded(v => [...v, purchase.name]); setPurchase(null); setPurchaseComplete(true); }}>Preview purchase success<Icon name="arrow" size={15} /></button>}</section></div>}
      {purchaseComplete && <div className="toast" role="status"><Icon name="check" /><span><b>Demo purchase prepared</b><small>Pending backend · wallet balance remains 65 EC</small></span><button aria-label="Dismiss" onClick={() => setPurchaseComplete(false)}>×</button></div>}
    </Shell>
  );
}

/* ───────────────────────── Settings ───────────────────────── */

function Settings({ go }: { go: Go }) {
  const [section, setSection] = useState("Profile");
  const [saved, setSaved] = useState(false);
  const [n, setN] = useState<Record<string, boolean>>({ activity: true, credits: true, community: false, product: true });
  const secs = ["Profile", "Account", "Appearance", "Notifications", "Providers", "Security", "Developer"];
  const notes: [string, string, string][] = [
    ["activity", "Account activity", "Provider connections, exchanges and project updates."],
    ["credits", "Credit alerts", "Earnings, low balance alerts and summaries."],
    ["community", "Community updates", "Replies, follows and collaboration requests."],
    ["product", "Product announcements", "New models, features and improvements."],
  ];
  const field = (label: string, v?: string, full = false, ph?: string) => <label className={cx(full && "full")}><span>{label}</span><input defaultValue={v} placeholder={ph} onChange={() => setSaved(false)} /></label>;
  return (
    <Shell screen="settings" go={go}>
      <section className="s-hero">
        <div className="s-avatar">MK</div>
        <div><Kicker>Your Invenzo identity</Kicker><h1 className="rise">Mithun <em>Kumar</em></h1><p className="muted">Builder since October 2026 · Chennai, India</p></div>
        <div className="strength"><small className="mono">Profile strength</small><b>82%</b><span><i /></span></div>
      </section>
      <div className="s-layout">
        <ol className="s-nav">{secs.map((s, i) => <li key={s}><button className={cx(section === s && "on")} onClick={() => { setSection(s); setSaved(false); }}><span className="mono">{String(i + 1).padStart(2, "0")}</span>{s}</button></li>)}</ol>
        <section className="s-body" key={section}>
          <h2>{section}</h2>
          {section === "Profile" && <div className="form">{field("First name", "Mithun")}{field("Last name", "Kumar")}{field("Display name", "Mithun", true)}<label className="full"><span>Bio</span><textarea defaultValue="Student, builder and AI enthusiast. Turning ideas into useful products." onChange={() => setSaved(false)} /></label>{field("Location", "Chennai, India")}{field("Website", "", false, "https://yourwebsite.com")}</div>}
          {section === "Account" && <div className="form">{field("Email address", "mithun@example.com", true)}<label><span>Language</span><select><option>English</option><option>Hindi</option><option>Tamil</option></select></label><label><span>Time zone</span><select><option>India Standard Time</option><option>UTC</option></select></label><div className="toggle-row full"><div><b>Current session</b><p>Windows · Chrome · Chennai, India</p></div><button className="btn ghost small" onClick={() => go("logout")}>Sign out</button></div><div className="danger full"><div><b>Delete account</b><p>Permanently remove your projects, credits and data.</p></div><button>Delete</button></div></div>}
          {section === "Appearance" && <div className="toggles">{[["System theme", "Use Invenzo dark theme across this device."], ["Reduced motion", "Minimize non-essential interface animation."], ["Compact data", "Show denser exchange and ledger rows."]].map(([t, d], i) => <div className="toggle-row" key={t}><div><b>{t}</b><p>{d}</p></div><button role="switch" aria-checked={i === 0} className={cx("sw", i === 0 && "on")}><i /></button></div>)}</div>}
          {section === "Notifications" && <div className="toggles">{notes.map(([k, t, d]) => <div key={k} className="toggle-row"><div><b>{t}</b><p>{d}</p></div><button role="switch" aria-checked={n[k]} className={cx("sw", n[k] && "on")} onClick={() => { setN({ ...n, [k]: !n[k] }); setSaved(false); }}><i /></button></div>)}</div>}
          {section === "Providers" && <div className="toggles">{[["Connected providers", "Manage credentials, connections and verification.", "providers"], ["Provider usage", "Review metered input, cached and output usage.", "usage"], ["My capacity", "Control available, reserved and contributed capacity.", "capacity"]].map(([t, d, to]) => <div className="toggle-row" key={t}><div><b>{t}</b><p>{d}</p></div><button className="btn ghost small" onClick={() => go(to as Screen)}>Open</button></div>)}</div>}
          {section === "Security" && <div className="toggles">{[["Password", "Last changed 3 months ago", "Change"], ["Two-factor authentication", "Add an extra layer of protection.", "Enable"], ["Security center", "Sessions, credentials and security logs.", "Open"]].map(([t, d, b], i) => <div className="toggle-row" key={t}><div><b>{t}</b><p>{d}</p></div><button className="btn ghost small" onClick={() => i === 2 && go("security")}>{b}</button></div>)}<div className="secure"><Icon name="shield" size={20} /><p><b>Provider credentials are encrypted.</b> Invenzo never shares API credentials or private project data.</p></div></div>}
          {section === "Developer" && <div className="toggles">{[["API access", "Create scoped keys for your Invenzo account.", "developer"], ["Audit ledger", "Inspect operational events and references.", "audit"]].map(([t, d, to]) => <div className="toggle-row" key={t}><div><b>{t}</b><p>{d}</p></div><button className="btn ghost small" onClick={() => go(to as Screen)}>Open</button></div>)}</div>}
          <div className="s-foot">{saved && <span className="saved"><Icon name="check" size={15} />Changes saved</span>}<button className="btn ghost">Cancel</button><button className="btn gold" onClick={() => setSaved(true)}>Save changes</button></div>
        </section>
      </div>
    </Shell>
  );
}

/* ───────────────────────── Product depth ───────────────────────── */

function SuiteHead({ eyebrow, title, emphasis, copy, action }: { eyebrow: string; title: string; emphasis?: string; copy: string; action?: ReactNode }) {
  return <section className="suite-head"><div><Kicker n={eyebrow}>Invenzo network</Kicker><h1 className="rise">{title}{emphasis && <><br /><em>{emphasis}</em></>}</h1><p className="lede">{copy}</p></div>{action}</section>;
}

function Metrics({ items }: { items: [string, string, string?][] }) {
  return <div className="metric-grid">{items.map(([label, value, note]) => <span key={label}><small>{label}</small><b>{value}</b>{note && <em>{note}</em>}</span>)}</div>;
}

function ProductSuite({ screen, go }: { screen: Screen; go: Go }) {
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [apiKey, setApiKey] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setApiKey(false);
        if (screen === "project-detail") setCreated(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [screen]);
  const providers = [
    { type: "gemini" as const, name: "Google Gemini", state: "Verified", project: "invenzo-ai-production", models: "Gemini 2.5 Flash · 2.5 Pro", capacity: "128K", contributing: "80K", value: "+42 EC" },
    { type: "claude" as const, name: "Anthropic", state: "Connected", project: "skill-sync-production", models: "Claude 3.5 Sonnet · Haiku", capacity: "56K", contributing: "12K", value: "+18 EC" },
    { type: "openai" as const, name: "OpenAI", state: "Not connected", project: "—", models: "GPT-4o · o3", capacity: "—", contributing: "—", value: "—" },
  ];

  if (screen === "providers") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Profile / Providers" title="Connected" emphasis="capacity." copy="Connect the AI providers you already use and decide what verified capacity you want to contribute." action={<button className="btn gold" onClick={() => go("connect")}><Icon name="plus" />Connect provider</button>} />
    <div className="provider-grid">{providers.map((p, i) => <article className="provider-card" key={p.name}>
      <div className="provider-top"><ModelLogo type={p.type} /><span><small className="mono">{p.name}</small><b>{p.name}</b></span><em className={cx("status", i < 2 ? "ok" : "")}>● {p.state}</em></div>
      {i < 2 ? <><div className="detail-grid"><span><small>Project</small><b>{p.project}</b></span><span><small>Models</small><b>{p.models}</b></span><span><small>Capacity available</small><b>{p.capacity} tokens</b></span><span><small>Contributing</small><b>{p.contributing} tokens</b></span><span><small>Last verified</small><b>03 Oct · 11:28</b></span><span><small>Credential</small><b>Encrypted · Active</b></span><span><small>Usage status</small><b>Demo metering</b></span><span><small>Reference</small><b>PRV-000{184 + i}</b></span></div><div className="provider-value"><span><small>Illustrative network value</small><b>{p.value}</b></span><div><button className="btn ghost small" disabled title="Requires provider backend">Test connection</button><button className="btn ghost small" onClick={() => go("security")}>Manage</button><button className="btn gold small" onClick={() => go("capacity")}>View capacity</button></div></div></> : <div className="empty compact"><p>Authorize a provider connection to verify available capacity.</p><button className="btn ghost small" onClick={() => go("connect")}>Connect provider</button></div>}
    </article>)}</div>
    <div className="state-strip"><span className="mono">Connection states</span>{["Not connected", "Connecting", "Connected", "Verified", "Error", "Disconnected"].map((s, i) => <em className={cx(i === 3 && "pos", i === 4 && "neg")} key={s}>● {s}</em>)}</div>
    <div className="secure"><Icon name="shield" /><p><b>Secure by design.</b> Credentials are encrypted and stored securely by Invenzo. They are never shared with other users.</p></div>
  </Shell>;

  if (screen === "capacity-detail") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Capacity / CAP-000421" title="Gemini 2.5" emphasis="Flash." copy="A detailed view of verified provider capacity, reservations, contributions, usage, and illustrative EC settlement history." action={<button className="btn gold" onClick={() => go("capacity")}>Manage contribution</button>} />
    <div className="object-chain"><button onClick={() => go("providers")}>PRV-000184 · Google Gemini</button><Icon name="arrow" /><button className="on">CAP-000421 · Capacity</button><Icon name="arrow" /><button onClick={() => go("agreement")}>AGR-000083 · Agreement</button><Icon name="arrow" /><button onClick={() => go("entitlements")}>ENT-000219 · Entitlement</button></div>
    <Metrics items={[["Available", "42,000 tok"], ["Reserved", "10,000 tok"], ["Consumed", "18,000 tok"], ["Pending", "2,000 tok"], ["Remaining", "24,000 tok"]]} />
    <div className="capacity-detail-grid"><section className="flow-card"><span className="mono">Demo usage history</span><h2>Verified capacity</h2><div className="history-chart" aria-label="Illustrative capacity history">{[38, 52, 47, 68, 62, 76, 70, 84, 72, 65, 58, 70].map((v, i) => <i key={i} style={{ height: `${v}%` }} />)}</div><div className="detail-grid"><span><small>Capacity type</small><b>Input tokens</b></span><span><small>Last verified</small><b>03 Oct · 11:28</b></span><span><small>Verification</small><b className="pos">Demo verified</b></span><span><small>Pricing</small><b>PRC-000027</b></span></div></section><section><SectionHead n="History" title="Object activity" />{[["Contribution", "30,000 tokens", "CON-000118", "Active"], ["Reservation", "10,000 tokens", "RES-000082", "Reserved"], ["Settlement", "+18.4 EC", "TXN-000981", "Pending"], ["Verification", "Capacity snapshot", "AUD-001928", "Demo"]].map(row => <button className="history-row" key={row[2]} onClick={() => row[0] === "Settlement" ? go("transaction") : go("audit")}><span><small>{row[0]}</small><b>{row[1]}</b></span><code>{row[2]}</code><em>{row[3]}</em><Icon name="arrow" /></button>)}</section></div>
  </Shell>;

  if (screen === "capacity") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Providers / My capacity" title={step === 2 ? "Capacity is" : "Your capacity,"} emphasis={step === 2 ? "live." : "clearly accounted."} copy={step === 2 ? "30,000 Gemini 2.5 Flash tokens are now contributing to the network." : "Your own provider capacity stays separate from the public exchange until you choose to contribute it."} action={step === 0 && <button className="btn gold" onClick={() => setStep(1)}>Contribute capacity<Icon name="arrow" size={15} /></button>} />
    {step === 0 && <><Metrics items={[["Total connected", "184,200", "tokens"], ["Available", "68,200", "tokens"], ["Reserved", "24,000", "tokens"], ["Contributing", "92,000", "tokens"], ["Network value", "126 EC", "estimated"]]} />
      <div className="capacity-list">{[["gemini", "Gemini 2.5 Flash", "Google Gemini", "42,000", "30,000", "10,000", "+18.4 EC"], ["claude", "Claude 3.5 Sonnet", "Anthropic", "26,200", "12,000", "14,000", "+21.6 EC"]].map((c, i) => <article key={c[1]}><ModelLogo type={c[0] as "gemini"} /><div className="capacity-name"><b>{c[1]}</b><small>{c[2]} · <em className="pos">● Contributing</em></small></div>{[["Available", c[3]], ["Contributing", c[4]], ["Reserved", c[5]], ["Illustrative value", c[6]]].map(x => <span key={x[0]}><small>{x[0]}</small><b>{x[1]}{!x[1].includes("EC") && " tok"}</b></span>)}<div className="capacity-actions"><button className="link-btn" onClick={() => go("capacity-detail")}>View details</button><button className="btn ghost small" onClick={() => setStep(1)}>Contribute</button></div></article>)}</div></>}
    {step === 1 && <section className="flow-card"><span className="mono">Contribute capacity · 01—03</span><h2>Choose what goes live.</h2><div className="form flow-form"><label><span>Provider</span><select><option>Google Gemini</option><option>Anthropic</option></select></label><label><span>Model</span><select><option>Gemini 2.5 Flash</option><option>Gemini 2.5 Pro</option></select></label><label className="full"><span>Contribution</span><input defaultValue="30,000 tokens" /></label><label><span>Usage type</span><select><option>Input tokens</option><option>Cached input</option><option>Output tokens</option></select></label><label><span>Pricing version</span><input defaultValue="v2026.10.01" readOnly /></label></div><div className="estimate"><span><small>Provider economic value</small><b>$12.40</b></span><span><small>Estimated Invenzo value</small><b>18.4 EC</b></span></div><p className="fine">Estimated value. Final EC settlement is calculated from verified usage and the active Invenzo pricing version.</p><div className="flow-actions"><button className="btn ghost" onClick={() => setStep(0)}>Cancel</button><button className="btn gold" onClick={() => setStep(2)}>Start contributing<Icon name="arrow" size={15} /></button></div></section>}
    {step === 2 && <section className="success-state"><div className="done-mark"><Icon name="check" size={32} /></div><b>30,000 tokens</b><span>Gemini 2.5 Flash</span><em className="pos">● Contributing · +18.4 EC estimated</em><button className="btn gold" onClick={() => setStep(0)}>View capacity</button></section>}
  </Shell>;

  if (screen === "calculator") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="EC tools / Illustrative calculation" title="EC conversion" emphasis="calculator." copy="Estimate economic value using a versioned pricing example before creating an exchange offer. No provider rate is presented as permanent truth." />
    <section className="calculator-layout"><div className="flow-card"><div className="form flow-form"><label><span>Provider</span><select><option>Google Gemini</option><option>Anthropic</option></select></label><label><span>Model</span><select><option>Gemini 2.5 Flash</option><option>Gemini 2.5 Pro</option></select></label><label><span>Usage type</span><select><option>Input tokens</option><option>Cached input</option><option>Output tokens</option></select></label><label><span>Token quantity</span><input defaultValue="100,000" /></label><label className="full"><span>Pricing tier</span><select><option>Standard · Illustrative</option><option>Volume · Illustrative</option></select></label></div><button className="btn gold" onClick={() => setCreated(true)}>Calculate EC value</button></div><aside className="calc-result"><span className="mono">Illustrative calculation · PRC-000027</span><small>100,000 input tokens × example rate / 1M</small><b>$0.35 <em>/ 1M tokens</em></b><small>Provider USD equivalent</small><b>$0.035</b><small>Invenzo EC value</small><strong>{created ? "42 EC" : "— EC"}</strong><div className="calc-meta"><span>Version <b>v2026.10.01</b></span><span>Effective <b>01 Oct 2026</b></span><span>Source <b>Provider reference</b></span></div><p>Provider value → EC conversion → EC settlement. Final settlement may vary based on verified usage and the pricing version active at execution.</p><button className="link-btn" onClick={() => setShowMethod(!showMethod)}>View pricing methodology</button>{showMethod && <div className="method-note">Pricing records are versioned and historical transactions retain the exact rate reference used at settlement. This prototype uses illustrative values only.</div>}<button className="btn ghost" onClick={() => go("offer")}>Create exchange offer</button></aside></section>
  </Shell>;

  if (screen === "offer") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Exchange / My offers" title={created ? "Offer" : "Create exchange"} emphasis={created ? "live." : "offer."} copy={created ? "Your open offer is searching for compatible verified capacity." : "Exchange provider capacity through EC settlement—not a direct transfer of provider subscription credits."} />
    {!created ? <section className="split-flow"><div className="flow-card"><span className="mono">I have</span><h2>Verified capacity</h2><div className="form flow-form"><label><span>Provider</span><select><option>Google Gemini</option></select></label><label><span>Model</span><select><option>Gemini 2.5 Flash</option></select></label><label className="full"><span>Capacity</span><input defaultValue="100,000 tokens" /></label></div></div><div className="flow-card"><span className="mono">I need</span><h2>Target entitlement</h2><div className="form flow-form"><label><span>Provider</span><select><option>Anthropic</option></select></label><label><span>Model</span><select><option>Claude 3.5 Sonnet</option></select></label><label><span>Maximum EC</span><input defaultValue="60 EC" /></label><label><span>Offer type</span><select><option>Open</option><option>Matched</option><option>Private</option></select></label></div></div><button className="btn gold wide-action" onClick={() => setCreated(true)}>Publish demo offer<Icon name="arrow" size={15} /></button></section> : <section className="success-state"><span className="mono">OFF-000192 · Saved as demo</span><div className="spinner" /><b>Ready for backend matching</b><span>Gemini 100K → Claude entitlement · max 60 EC</span><button className="btn ghost" onClick={() => go("offer-detail")}>View offer details</button></section>}
  </Shell>;

  if (screen === "offer-detail") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Exchange / OFF-000192" title="Capacity offer" emphasis="review." copy="A demo open offer prepared for backend matching. No provider subscription credits are directly transferred." />
    <div className="object-chain"><button onClick={() => go("capacity-detail")}>CAP-000421 · Source</button><Icon name="arrow" /><button className="on">OFF-000192 · Offer</button><Icon name="arrow" /><button onClick={() => go("agreement")}>AGR-000083 · Match</button></div>
    <section className="agreement-card"><div className="detail-grid">{[["Provider", "Google Gemini"], ["Model", "Gemini 2.5 Flash"], ["Capacity", "100,000 tokens"], ["EC value", "42 EC · illustrative"], ["Requirement", "Claude entitlement"], ["Availability", "Prepared"], ["Created", "03 Oct 2026 · 10:14"], ["Expiration", "10 Oct 2026 · 10:14"], ["Status", "OPEN · DEMO"], ["Initiated by", "Mithin K. · USR-000184"], ["Pricing", "PRC-000027"], ["Audit", "AUD-001928"]].map(item => <span key={item[0]}><small>{item[0]}</small><b>{item[1]}</b></span>)}</div><div className="flow-actions"><button className="btn ghost">Cancel offer</button><button className="btn ghost">Reject match</button><button className="btn gold" onClick={() => go("agreement")}>Review proposed match</button></div></section>
  </Shell>;

  if (screen === "agreement") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Exchange / AGR-000083" title="Capacity" emphasis="agreement." copy="A demo agreement record connecting an offer, EC reservation, entitlement, usage, and eventual settlement." />
    <section className="agreement-card"><div className="parties"><span><i className="av gold">MK</i><b>Mithin K.</b><small>Initiated · USR-000184</small></span><Icon name="exchange" size={28} /><span><i className="av blue">MR</i><b>Mukesh R.</b><small>Accepted · demo identity</small></span></div><Metrics items={[["Provider", "Anthropic"], ["Model", "Claude 3.5"], ["Committed", "35 EC"], ["Consumed", "20 EC"], ["Remaining", "15 EC"]]} /><div className="detail-grid agreement-meta">{[["Committed capacity", "20,000 tokens"], ["Reserved amount", "35 EC"], ["Created", "03 Oct · 10:14"], ["Accepted", "03 Oct · 10:28"], ["Settlement", "Pending usage completion"], ["Source offer", "OFF-000192"]].map(item => <span key={item[0]}><small>{item[0]}</small><b>{item[1]}</b></span>)}</div><div className="lifecycle">{["Open", "Matched", "Proposed", "Accepted", "Active", "Settled"].map((s, i) => <span className={cx(i < 5 && "done", i === 4 && "current")} key={s}><i>{i < 4 ? "✓" : i + 1}</i>{s}</span>)}</div><div className="alternative-states"><span>Alternative outcomes</span><em>Cancelled</em><em>Expired</em><em>Disputed</em></div><div className="flow-actions"><button className="btn ghost">Cancel active agreement</button><button className="btn gold" onClick={() => go("entitlements")}>View entitlement</button></div></section>
  </Shell>;

  if (screen === "entitlements") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Exchange / Entitlements" title={reserved ? "Capacity" : "My"} emphasis={reserved ? "reserved." : "entitlements."} copy={reserved ? "20,000 Claude tokens are reserved and ready for metered use in Studio." : "Capacity allocations funded by EC, with transparent consumption and remaining balances."} />
    {!reserved ? <div className="entitlement-grid">{[
      { type: "claude", id: "ENT-000219", model: "Claude 3.5 Sonnet", provider: "Anthropic", total: 20000, reserved: "20,000", consumed: "6,420", remaining: "13,580", ec: "35", status: "ACTIVE", expiry: "31 Oct 2026" },
      { type: "gemini", id: "ENT-000220", model: "Gemini 2.5 Pro", provider: "Google", total: 50000, reserved: "50,000", consumed: "42,000", remaining: "8,000", ec: "42", status: "LOW BALANCE", expiry: "18 Oct 2026" },
      { type: "openai", id: "ENT-000147", model: "GPT-4o", provider: "OpenAI", total: 10000, reserved: "10,000", consumed: "10,000", remaining: "0", ec: "20", status: "EXHAUSTED", expiry: "28 Sep 2026" },
    ].map((e, i) => <article key={e.id}><div className="provider-top"><ModelLogo type={e.type as "claude"} /><span><small className="mono">{e.id} · AGR-000083</small><b>{e.model}</b></span><em className={cx("status", e.status === "ACTIVE" && "ok", e.status === "EXHAUSTED" && "neg")}>● {e.status}</em></div><div className="ent-bar"><i style={{ width: `${(+e.consumed.replace(",", "") / e.total) * 100}%` }} /></div><div className="detail-grid"><span><small>Provider</small><b>{e.provider}</b></span><span><small>Total capacity</small><b>{e.total.toLocaleString()} tok</b></span><span><small>Reserved</small><b>{e.reserved} tok</b></span><span><small>Consumed</small><b>{e.consumed} tok</b></span><span><small>Remaining</small><b>{e.remaining} tok</b></span><span><small>EC committed</small><b>{e.ec} EC</b></span><span><small>Expiration</small><b>{e.expiry}</b></span><span><small>Source</small><b>AGR-000083</b></span></div><button className={cx("btn", e.status === "EXHAUSTED" ? "ghost" : "gold")} disabled={e.status === "EXHAUSTED"} onClick={() => i ? go("studio") : setReserved(true)}>{e.status === "EXHAUSTED" ? "Entitlement exhausted" : "Use in Studio"}</button></article>)}</div> : <section className="flow-card reservation"><span className="mono">ENT-000219 · Reservation confirmation</span><h2>Claude 3.5 Sonnet</h2><div className="confirm-total"><span><small>Requested allocation</small><b>20,000 tok</b></span><span><small>EC reserved</small><b>35 EC</b></span><span><small>Available EC</small><b>65 EC</b></span></div><div className="secure"><Icon name="shield" /><p><b>Demo reservation prepared.</b> Final confirmation and settlement require backend usage verification.</p></div><button className="btn gold" onClick={() => go("studio")}>Open Studio with Claude<Icon name="arrow" size={15} /></button></section>}
  </Shell>;

  if (screen === "transaction") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Wallet / TXN-000981" title="−20 EC" emphasis="Claude usage." copy="A completed demo ledger record linked to simulated Studio usage and an immutable-looking audit event." />
    <section className="transaction-detail"><div className="detail-grid">{[["Status", "COMPLETED · DEMO"], ["Type", "STUDIO_USAGE"], ["Source", "ENT-000219"], ["Destination", "Invenzo usage ledger"], ["Balance before", "85 EC"], ["Balance after", "65 EC"], ["Project", "SkillSyncX · PRJ-000042"], ["Request", "REQ-000821"], ["Provider", "Anthropic"], ["Model", "Claude 3.5 Sonnet"], ["Pricing version", "PRC-000027"], ["Input tokens", "4,820 · simulated"], ["Cached input", "0"], ["Output tokens", "1,230 · simulated"], ["Provider value", "$0.020 · illustrative"], ["EC charged", "20 EC"], ["Timestamp", "03 Oct 2026 · 11:32"], ["Audit event", "AUD-001928"]].map(x => <span key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></span>)}</div><div className="audit-path">{["Requested", "Authorized", "Executed", "Metered", "Settled"].map(s => <span key={s}><Icon name="check" size={14} />{s}</span>)}</div><div className="flow-actions"><button className="btn ghost" onClick={() => go("entitlements")}>View entitlement</button><button className="btn gold" onClick={() => go("audit")}>View audit event</button></div></section>
  </Shell>;

  if (screen === "project-detail") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Projects / PRJ-000042" title="Build skills." emphasis="Find your match." copy="AI skill matching for students and professionals. Active demo project with simulated Claude usage." action={<button className="btn gold" onClick={() => go("studio")}>Open Studio<Icon name="arrow" size={15} /></button>} />
    <Metrics items={[["Status", "ACTIVE"], ["EC spent", "42 EC"], ["AI generated", "91% · demo"], ["Last active", "12 min"], ["Members", "4"]]} /><div className="project-actions"><button>Rename</button><button>Duplicate</button><button>Archive</button><button className="neg" onClick={() => setCreated(true)}>Delete project</button></div><div className="subnav">{["Overview", "Files", "Activity", "Usage", "Deployments", "Members", "Settings"].map((t, i) => <button className={cx(i === 0 && "on")} key={t}>{t}</button>)}</div><div className="project-overview"><article><span className="mono">Current sprint</span><h2>Matching intelligence</h2><p>Refining skill extraction, ranking logic, and recruiter-facing recommendations.</p><div className="tags"><span>React</span><span>Node.js</span><span>Claude</span></div></article><aside><SectionHead n="01" title="Recent demo AI sessions" />{["Refactor matching pipeline · 3.2 EC", "Build candidate card · 1.8 EC", "Explain ranking score · 0.6 EC"].map(x => <button className="trend" key={x} onClick={() => go("transaction")}><Icon name="sparkle" size={15} /><b>{x}</b><Icon name="arrow" size={14} /></button>)}</aside></div>{created && <div className="overlay" onMouseDown={() => setCreated(false)}><section className="overlay-card confirm-card" role="dialog" aria-modal="true" aria-label="Delete project" onMouseDown={event => event.stopPropagation()}><button className="overlay-close" aria-label="Close" onClick={() => setCreated(false)}>×</button><span className="mono neg">Destructive action</span><h2>Delete SkillSyncX?</h2><p className="muted">This prototype confirmation represents permanent deletion. Archive the project if you may need it later.</p><div className="flow-actions"><button className="btn ghost" onClick={() => setCreated(false)}>Cancel</button><button className="btn gold" onClick={() => go("projects")}>Confirm deletion</button></div></section></div>}
  </Shell>;

  if (screen === "new-project") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Projects / New" title="Start with" emphasis="an intention." copy="Choose a foundation, an AI model, and an optional EC budget. You can change every choice later." />
    <section className="flow-card project-form"><div className="form"><label><span>Project name</span><input placeholder="Untitled project" /></label><label><span>Default AI model</span><select><option>Claude 3.5 Sonnet</option><option>Gemini 2.5 Flash</option><option>GPT-4o</option></select></label><label className="full"><span>Description</span><textarea placeholder="What are you building?" /></label><label><span>Template</span><select><option>AI starter</option><option>Blank</option><option>React</option><option>Next.js</option><option>Vite</option></select></label><label><span>Starting EC budget · optional</span><input placeholder="50 EC" /></label></div><button className="btn gold" onClick={() => go("project-detail")}>Create project<Icon name="arrow" size={15} /></button></section>
  </Shell>;

  if (screen === "notifications") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Notification center" title="Stay aware," emphasis="not distracted." copy="Provider, exchange, entitlement, usage, transaction, security, and system events in one calm feed." action={<button className="btn ghost" onClick={() => setReadAll(true)}>Mark all as read</button>} />
    <div className="subnav">{["All", "Unread", "Read", "Provider", "Exchange", "Usage", "Security", "System"].map((t, i) => <button className={cx(i === 0 && "on")} key={t}>{t}</button>)}</div><div className="notification-list">{[["Provider verification", "Gemini capacity snapshot prepared", "CAP-000421 is ready for backend verification.", "2 min", true, "capacity-detail"], ["Low entitlement", "Claude entitlement is 20% remaining", "13,580 tokens remain available to SkillSyncX.", "1 hour", true, "entitlements"], ["EC transaction", "20 EC usage record completed", "TXN-000981 updated the available balance to 65 EC.", "3 hours", false, "transaction"], ["Security event", "Provider credential rotated", "Google Gemini credential remains encrypted.", "Yesterday", false, "security"]].map(n => <button className={cx("notice", n[4] && !readAll && "unread")} key={String(n[1])} onClick={() => go(n[5] as Screen)}><i /><span><small>{String(n[0])} · {String(n[3])}</small><b>{String(n[1])}</b><em>{String(n[2])}</em></span><span className="notice-action">{n[4] && !readAll ? "Mark read" : "Open"} <Icon name="arrow" size={14} /></span></button>)}</div>
  </Shell>;

  if (screen === "sync") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="System / Sync center" title="Local work," emphasis="clearly synchronized." copy="Offline-aware operations remain local until a backend confirms them. This prototype never presents queued work as globally completed." action={<button className="btn gold" onClick={() => setCreated(true)}>{created ? "Syncing demo…" : "Retry pending"}</button>} />
    <div className="state-strip"><span className="mono">Network states</span>{["Online", "Offline", "Syncing", "Sync required", "Sync error"].map((state, i) => <em className={cx(i === 0 && "pos", i === 4 && "neg")} key={state}>● {state}</em>)}</div>
    <Metrics items={[["Connection", "Online", "local preview"], ["Pending operations", "2", "saved locally"], ["Last sync", "11:42", "demo timestamp"], ["Sync errors", "0", "current queue"]]} />
    <SectionHead n="Queue" title="Pending synchronization" />
    <div className="sync-list">{[["Capacity contribution", "CON-000118", "03 Oct · 11:40", "Saved locally"], ["Studio usage record", "REQ-000821", "03 Oct · 11:41", "Pending backend"]].map((row, i) => <div className="audit-row" key={row[1]}><span><small>Operation</small><b>{row[0]}</b></span><code>{row[1]}</code><span>{row[2]}</span><em className={i ? "muted" : "pos"}>● {created ? "Syncing" : row[3]}</em><button className="btn ghost small" onClick={() => setCreated(true)}>Retry</button></div>)}</div>
    <div className="secure"><Icon name="cloud" /><p><b>Offline actions are not globally confirmed.</b> They remain labeled “Saved locally” or “Pending synchronization” until the future backend acknowledges them.</p></div>
    <SectionHead n="States" title="Reliable system feedback" />
    <div className="state-gallery">{[["Loading", "Checking local records…", "clock"], ["Empty", "No synchronized operations yet.", "folder"], ["Error", "The last synchronization could not finish.", "shield"], ["Permission denied", "Your role cannot retry this operation.", "shield"], ["Offline", "Changes will remain on this device.", "cloud"], ["Success", "Local records are synchronized.", "check"], ["Pending", "Waiting for backend acknowledgement.", "clock"], ["Disabled", "Action unavailable in this state.", "settings"]].map(state => <article key={state[0]}><Icon name={state[2] as IconName} /><span><small>{state[0]}</small><b>{state[1]}</b></span></article>)}</div>
  </Shell>;

  if (screen === "security") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Settings / Security" title="Protected by" emphasis="default." copy="Review passwords, MFA, sessions, connected providers, masked credentials, developer keys, and security events." action={<button className="btn ghost" onClick={() => go("mfa")}>Manage MFA</button>} />
    <div className="security-summary"><span><Icon name="shield" /><b>Password</b><small>Changed 3 months ago</small><button className="link-btn" onClick={() => go("reset")}>Change</button></span><span><Icon name="check" /><b>MFA</b><small>Authenticator enabled · demo</small><button className="link-btn" onClick={() => go("mfa")}>Review</button></span><span><Icon name="link" /><b>API keys</b><small>1 active · last used 2h ago</small><button className="link-btn" onClick={() => go("developer")}>Manage</button></span></div>
    <div className="security-grid"><section className="flow-card"><span className="mono">Active sessions</span><h2>Current browser</h2><div className="session"><Icon name="terminal" /><span><b>Windows · Chrome</b><small>Chennai, India · Active now</small></span><em className="pos">● Current</em></div><div className="session"><Icon name="terminal" /><span><b>Android · Chrome</b><small>Chennai, India · 2 hours ago</small></span><button className="link-btn">Sign out</button></div><button className="btn ghost small">Sign out all other sessions</button></section><section className="flow-card"><span className="mono">Provider credential · PRV-000184</span><h2>Google Gemini</h2><div className="masked-key">sk-••••••••••••91A2</div><div className="credential-meta"><span>Last verified <b>03 Oct · 11:28</b></span><span>Status <b className="pos">● Connected</b></span></div><div className="row gap credential-actions"><button className="btn ghost small">Copy masked</button><button className="btn ghost small">Replace</button><button className="btn ghost small">Test</button><button className="btn ghost small neg">Revoke</button></div><div className="secure"><Icon name="shield" /><p>Credentials are encrypted and stored securely. They are never visible to other users.</p></div></section></div><div className="state-strip"><span className="mono">Credential states</span>{["Connected", "Expired", "Rate limited", "Provider unavailable", "Revoked"].map((state, i) => <em className={cx(i === 0 && "pos", i > 0 && "neg")} key={state}>● {state}</em>)}</div><SectionHead n="Log" title="Security activity" />{["Provider connected · Google Gemini · AUD-001924", "Credential rotated · Google Gemini · AUD-001920", "New session · Windows Chrome · AUD-001902"].map(x => <div className="audit-row" key={x}><Icon name="shield" /><b>{x}</b><em className="status ok">Recorded</em></div>)}
  </Shell>;

  if (screen === "developer") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Settings / Developer" title="Developer" emphasis="API." copy="Backend-ready interfaces for scoped credentials, documentation, usage, webhooks, and rate limits." action={<button className="btn gold" onClick={() => { setApiKey(true); setStep(0); }}><Icon name="plus" />Create API key</button>} />
    <div className="subnav">{["API Keys", "Documentation", "Usage", "Webhooks", "Rate Limits"].map((tab, i) => <button className={cx(i === 0 && "on")} key={tab}>{tab}</button>)}</div><div className="api-table"><div className="audit-row developer-row"><span><small>Name</small><b>Production integration</b></span><span><small>Created</small><b>01 Oct 2026</b></span><span><small>Last used</small><b>2 hours ago</b></span><span><small>Scopes</small><b>projects:read · usage:read</b></span><span><small>Requests</small><b>1,284 / 5,000</b></span><code>inv_••••••••91A2</code><em className="status ok">● Active</em><button className="btn ghost small">Revoke</button></div></div><div className="secure"><Icon name="shield" /><p><b>Treat API keys like passwords.</b> Newly created secrets are shown once. Stored records remain masked.</p></div>{apiKey && <div className="overlay" onMouseDown={() => setApiKey(false)}><section className="overlay-card confirm-card" role="dialog" aria-modal="true" aria-label="Create API key" onMouseDown={event => event.stopPropagation()}><button className="overlay-close" aria-label="Close" onClick={() => setApiKey(false)}>×</button>{step === 0 ? <><span className="mono">Create API key · Pending backend</span><h2>Scoped access</h2><div className="form"><label className="full"><span>Name</span><input defaultValue="Studio automation" /></label><label><span>Environment</span><select><option>Production</option><option>Development</option></select></label><label><span>Expiration</span><select><option>90 days</option><option>30 days</option><option>Never</option></select></label></div><div className="scope-grid">{["projects:read", "projects:write", "usage:read", "exchange:read", "exchange:write", "studio:use"].map(scope => <label key={scope}><input type="checkbox" defaultChecked={scope.endsWith("read")} />{scope}</label>)}</div><button className="btn gold" onClick={() => setStep(1)}>Create demo key</button></> : <><span className="mono">Shown once · Local demo</span><h2>API key created</h2><div className="masked-key">inv_demo_8F21A9K4Q7</div><p className="muted">Copy this prototype secret now. A production key requires backend generation and secure storage.</p><button className="btn gold" onClick={() => setApiKey(false)}>I&apos;ve saved this key</button></>}</section></div>}
  </Shell>;

  if (screen === "audit") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="System / Audit ledger" title="Every action," emphasis="accounted for." copy="Structured demo audit events are distinct from user-visible wallet transactions and ready for immutable backend records." action={<button className="btn ghost"><Icon name="cloud" />Export CSV</button>} />
    <div className="x-bar audit-filters"><label className="search-line"><Icon name="search" /><input placeholder="Search event, actor, entity…" /></label><select><option>All actions</option><option>provider_verified</option><option>usage_metered</option><option>settlement_completed</option></select><select><option>All statuses</option><option>Recorded</option><option>Pending</option><option>Failed</option></select></div><div className="audit-table"><div className="audit-head"><span>Timestamp</span><span>Actor</span><span>Action</span><span>Entity</span><span>Status</span><span>Event ID</span></div>{[["03 Oct 11:32", "USR-000184", "usage_metered", "ENT-000219", "RECORDED", "AUD-001928"], ["03 Oct 11:31", "System", "studio_usage_started", "REQ-000821", "RECORDED", "AUD-001927"], ["03 Oct 10:14", "USR-000184", "reservation_created", "AGR-000083", "RECORDED", "AUD-001926"], ["02 Oct 16:40", "USR-000205", "api_key_revoked", "KEY-000017", "RECORDED", "AUD-001925"], ["01 Oct 09:20", "USR-000184", "capacity_contributed", "CAP-000421", "PENDING", "AUD-001924"]].map(r => <button className="audit-row" key={r[5]} onClick={() => go("transaction")}>{r.map((x, i) => <span key={i} className={i === 2 ? "mono" : ""}>{x}</span>)}</button>)}</div>
  </Shell>;

  if (screen === "pricing") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Exchange / EC pricing" title="Versioned" emphasis="methodology." copy="Read-only illustrative provider economics. Historical records retain the exact pricing version used at settlement; administrative rate controls remain restricted." />
    <div className="state-strip"><span className="mono">Pricing guarantees</span><em>Versioned rates</em><em>Effective dates</em><em>Source references</em><em>Historical retention</em></div><div className="audit-table"><div className="audit-head pricing-head"><span>Provider / model</span><span>Usage</span><span>Rate / 1M</span><span>Currency</span><span>Version</span><span>Effective</span><span>Source</span><span>Status</span></div>{[["Google · Gemini 2.5 Flash", "INPUT", "$0.35", "USD", "PRC-000027", "01 Oct → Open", "Provider ref.", "ACTIVE"], ["Anthropic · Claude Sonnet", "CACHED_INPUT", "$0.30", "USD", "PRC-000028", "01 Oct → Open", "Provider ref.", "ACTIVE"], ["OpenAI · GPT-4o", "OUTPUT", "$10.00", "USD", "PRC-000019", "15 Sep → 30 Sep", "Provider ref.", "HISTORICAL"]].map(r => <div className="audit-row pricing-head" key={r[0]}>{r.map((x, i) => <span key={x} className={i === 4 ? "mono" : ""}>{x}</span>)}</div>)}</div>
  </Shell>;

  if (screen === "usage") return <Shell screen={screen} go={go}>
    <SuiteHead eyebrow="Providers / Demo usage" title="Provider" emphasis="usage." copy="Illustrative usage visualization prepared for future verified metering across provider-supported categories." />
    <Metrics items={[["Today", "26.6K", "simulated tokens"], ["This week", "188K", "simulated tokens"], ["This month", "612K", "simulated tokens"], ["EC prepared", "84 EC", "illustrative"]]} /><div className="usage-grid">{[["gemini", "Google Gemini", "18.4K", "124K", "420K"], ["claude", "Anthropic Claude", "8.2K", "64K", "192K"]].map(p => <article className="provider-card" key={p[1]}><div className="provider-top"><ModelLogo type={p[0] as "gemini"} /><span><small className="mono">Simulated usage · Pending backend</small><b>{p[1]}</b></span></div><div className="usage-bars"><span><small>Today</small><i><b style={{ width: "42%" }} /></i><em>{p[2]}</em></span><span><small>This week</small><i><b style={{ width: "68%" }} /></i><em>{p[3]}</em></span><span><small>This month</small><i><b style={{ width: "84%" }} /></i><em>{p[4]}</em></span></div></article>)}</div>
  </Shell>;

  return <Shell screen="admin" go={go}>
    <SuiteHead eyebrow="Internal / Admin" title="Network control" emphasis="center." copy="Prototype-only operations for the Invenzo capacity, entitlement, usage, risk, and EC settlement network." />
    <div className="admin-layout"><aside className="admin-nav">{["Overview", "Users", "Providers", "Capacity", "Exchange", "Agreements", "EC Ledger", "Pricing Engine", "Risk & Security", "Audit Logs", "System Health"].map((x, i) => <button className={cx(i === 0 && "on")} key={x}>{x}</button>)}</aside><section><Metrics items={[["Users", "12,842"], ["Connected providers", "3,104"], ["Available capacity", "2.4M tok"], ["Active agreements", "1,247"], ["EC volume", "184K"], ["Studio demo usage", "8.7M tok"], ["Failed requests", "0.8%"], ["Pending settlements", "42"]]} /><SectionHead n="Health" title="Network operations · Demo data" /><div className="system-list">{[["Provider gateway", "Pending backend", "Demo"], ["Usage metering", "Pending backend", "Demo"], ["EC settlement", "Pending backend", "Demo"], ["Local preview", "Operational", "Local"]].map(x => <div className="audit-row" key={x[0]}><b>{x[0]}</b><span className={x[1] === "Operational" ? "pos" : "muted"}>● {x[1]}</span><em>{x[2]}</em></div>)}</div></section></div>
  </Shell>;
}

/* ───────────────────────── Studio ───────────────────────── */

const code = `import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Skill matching landing page
function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
    </div>
  );
}

export default App;`;

function hl(line: string): ReactNode {
  if (line.trim().startsWith("//")) return <span className="c-com">{line}</span>;
  return line.split(/(\s+|[(){};<>/=]|'[^']*'|"[^"]*")/).map((t, i) => {
    if (/^(import|from|function|return|export|default)$/.test(t)) return <span key={i} className="c-kw">{t}</span>;
    if (/^('|").*\1$/.test(t)) return <span key={i} className="c-str">{t}</span>;
    if (/^[A-Z]\w+$/.test(t)) return <span key={i} className="c-fn">{t}</span>;
    return t;
  });
}

function Studio({ go }: { go: Go }) {
  const [tab, setTab] = useState("Terminal");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("Claude 3.5 Sonnet");
  const [chat, setChat] = useState<{ role: "ai" | "me"; text: string }[]>([{ role: "ai", text: "What would you like to build today? Describe it and I will shape the code with you." }]);
  const [file, setFile] = useState("App.jsx");
  const [pane, setPane] = useState("Code");
  const [explorer, setExplorer] = useState(true);
  const [assistant, setAssistant] = useState(true);
  const [process, setProcess] = useState("Running");
  const [saved, setSaved] = useState(false);
  const send = (t = prompt) => {
    if (!t.trim()) return;
    if (model.startsWith("GPT")) {
      setChat(c => [...c, { role: "me", text: t }, { role: "ai", text: "No active OpenAI entitlement. Reserve supported capacity in Exchange before sending this request." }]);
      setPrompt("");
      return;
    }
    setChat(c => [...c, { role: "me", text: t }, { role: "ai", text: `Simulated response prepared for “${t}” with ${model}. Demo usage: 1,240 input / 684 output tokens · illustrative cost 2.4 EC.` }]);
    setPrompt("");
  };
  const files = ["App.jsx", "Home.jsx", "index.js", "package.json", "README.md"];
  return (
    <Shell screen="studio" go={go} studio>
      <div className="st-bar">
        <div><span className="live-dot" /><h1>SkillSyncX <small>/ main · v0.8 / {file}</small></h1></div>
        <div className="row gap">
          <span className="mono muted">ENT-000219 · 13,580 tok · 65 EC</span>
          <select value={model} onChange={e => setModel(e.target.value)} aria-label="AI model"><option>Claude 3.5 Sonnet · 13,580 tok</option><option>Gemini 2.5 Pro · 8,000 tok</option><option>GPT-4o · No entitlement</option></select>
          <button className="btn ghost small" onClick={() => setExplorer(!explorer)}>Explorer</button>
          <button className="btn ghost small" onClick={() => setAssistant(!assistant)}>Assistant</button>
          <button className="btn ghost small" onClick={() => setSaved(true)}><Icon name="check" size={14} />{saved ? "Saved locally" : "Save"}</button>
          <button className="btn gold small" onClick={() => setTab("Output")}><Icon name="play" size={14} />Run</button>
          <button className="btn ghost small" onClick={() => setTab("Preview")}><Icon name="search" size={14} />Preview</button>
          <button className="btn ghost small" onClick={() => setTab("Preview")}><Icon name="cloud" size={14} />Deploy</button>
        </div>
      </div>
      <div className="mobile-studio-tabs">{["Code", "Assistant", "Terminal", "Preview"].map(t => <button className={cx(pane === t && "on")} key={t} onClick={() => { setPane(t); if (t === "Preview") setTab("Preview"); }}>{t}</button>)}</div>
      <div className={cx("ide", !explorer && "no-explorer", !assistant && "no-assistant")}>
        {explorer && <aside className="files">
          <div className="files-head"><small className="mono">Explorer</small><button aria-label="Search files"><Icon name="search" size={14} /></button></div>
          <b>SkillSyncX</b>
          <span className="dir">src / components</span><span className="dir">src / pages</span>
          {files.map(f => <button key={f} className={cx(f === file && "on")} onClick={() => setFile(f)}>{f}</button>)}
        </aside>}
        <section className={cx("editor", pane !== "Code" && "mobile-hide")}>
          <div className="e-tabs"><span>{file}</span><button aria-label="Search editor"><Icon name="search" size={14} /></button><small>Demo editor · local only</small></div>
          <pre>{code.split("\n").map((l, i) => <div key={i}><i>{i + 1}</i><span>{hl(l)}</span></div>)}</pre>
        </section>
        {assistant && <aside className={cx("ai", pane !== "Assistant" && "mobile-hide")}>
          <div className="ai-head"><ModelLogo type={model.startsWith("Gemini") ? "gemini" : model.startsWith("GPT") ? "openai" : "claude"} /><b>AI Assistant</b><small className="mono">Simulated · {model}</small></div>
          <div className="ai-meter"><span><small>Demo input</small><b>1,240 tok</b></span><span><small>Demo output</small><b>684 tok</b></span><span><small>Illustrative cost</small><b>2.4 EC</b></span></div>
          <div className="msgs">{chat.map((m, i) => <p key={i} className={m.role}>{m.text}</p>)}</div>
          {model.startsWith("GPT") && <button className="btn ghost small" onClick={() => go("exchange")}>No active entitlement · View Exchange</button>}
          <div className="quick">{["Build feature", "Fix bug", "Refactor", "Explain"].map(a => <button key={a} onClick={() => send(a)}>{a}</button>)}</div>
          <div className="prompt"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask anything…" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} /><button onClick={() => send()} aria-label="Send"><Icon name="send" size={16} /></button></div>
        </aside>}
        <section className={cx("term", pane !== "Terminal" && pane !== "Preview" && "mobile-hide")}>
          <div className="t-tabs">{["Terminal", "Output", "Problems", "Preview"].map(t => <button key={t} className={cx(tab === t && "on")} onClick={() => setTab(t)}>{t}</button>)}<span className="term-tools"><em className={process === "Running" ? "pos" : "muted"}>● {process}</em><button onClick={() => setProcess(process === "Running" ? "Stopped" : "Running")}>{process === "Running" ? "Stop" : "Restart"}</button><button onClick={() => setTab("Terminal")}>Clear</button></span></div>
          <div className="t-body">{tab === "Terminal" ? <><b>LOCAL DEMO PROCESS</b> · VITE preview<br /><span className="pos">➜</span> Local: <u>http://localhost:5173/</u><br /><label className="terminal-input"><span>➜</span><input aria-label="Terminal input" placeholder="Enter a local command…" /></label></> : tab === "Preview" ? <div className="preview-bar"><Icon name="cloud" /><input readOnly value="https://preview.invenzo.local/skillsyncx" aria-label="Preview URL" /><button onClick={() => setProcess("Running")}><Icon name="clock" size={14} />Refresh</button><span>Local preview</span></div> : <><b>{tab}</b><br /><span className="pos">✓</span> Demo output is ready. No provider execution has occurred.</>}</div>
        </section>
      </div>
    </Shell>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const go: Go = next => { setScreen(next); window.scrollTo({ top: 0 }); };
  switch (screen) {
    case "landing": return <Landing go={go} />;
    case "signup": return <Auth mode="signup" go={go} />;
    case "login": return <Auth mode="login" go={go} />;
    case "forgot":
    case "reset":
    case "verify-email":
    case "mfa":
    case "onboarding":
    case "session-expired":
    case "account-locked":
    case "logout": return <AuthState screen={screen} go={go} />;
    case "dashboard": return <Dashboard go={go} />;
    case "exchange": return <Exchange go={go} />;
    case "connect": return <Connect go={go} />;
    case "wallet": return <Wallet go={go} />;
    case "projects": return <Projects go={go} />;
    case "community": return <Community go={go} />;
    case "marketplace": return <Marketplace go={go} />;
    case "settings": return <Settings go={go} />;
    case "studio": return <Studio go={go} />;
    default: return <ProductSuite screen={screen} go={go} />;
  }
}
