import { type FormEvent, type ReactNode, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowUpRight, Check, ChevronRight, Clapperboard, CloudUpload, Copy, Film, FolderOpen, Gauge, Home as HomeIcon, Layers3, LogIn, LogOut, Menu, MoreHorizontal, Play, Plus, Search, Settings2, Sparkles, Upload, Users, X, Zap } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Redirect, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';

type Format = '9:16' | '16:9' | '1:1';
type Project = {
  id: string;
  title: string;
  format: Format;
  createdAt: string;
  status: 'Ready' | 'Draft' | 'Processing';
  files: { name: string; size: number; type: string }[];
  color: string;
};

const queryClient = new QueryClient();
const STORAGE_PROJECTS = 'clip-forge-projects';
const STORAGE_AUTH = 'clip-forge-auth';
const palette = ['#d6f542', '#f28d70', '#63d6df', '#e5aa52', '#b79be8'];

const seedProjects: Project[] = [
  { id: 'north-star', title: 'North Star / BTS', format: '9:16', createdAt: '2025-02-14T09:24:00.000Z', status: 'Ready', files: [{ name: 'north-star-day-01.mov', size: 1820000000, type: 'video/quicktime' }], color: '#d6f542' },
  { id: 'field-notes', title: 'Field Notes — Issue 04', format: '16:9', createdAt: '2025-02-11T16:40:00.000Z', status: 'Draft', files: [], color: '#f28d70' },
  { id: 'after-hours', title: 'After Hours / Cut 02', format: '1:1', createdAt: '2025-02-07T11:05:00.000Z', status: 'Ready', files: [{ name: 'after-hours-cam-a.mp4', size: 764000000, type: 'video/mp4' }, { name: 'street-audio.wav', size: 42000000, type: 'audio/wav' }], color: '#63d6df' },
];

function readProjects(): Project[] {
  try {
    const saved = localStorage.getItem(STORAGE_PROJECTS);
    return saved ? JSON.parse(saved) : seedProjects;
  } catch {
    return seedProjects;
  }
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="cf-focus inline-flex items-center gap-3" data-testid="link-logo">
      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-primary text-primary-foreground shadow-[3px_3px_0_#899f1e]">
        <Clapperboard className="h-4 w-4" strokeWidth={2.5} />
      </span>
      {!compact && <span className="text-[15px] font-bold tracking-[-.04em] text-foreground">CLIP FORGE<span className="text-primary">.</span></span>}
    </Link>
  );
}

function Button({ children, variant = 'primary', className = '', ...props }: { children: ReactNode; variant?: 'primary' | 'ghost' | 'outline' | 'soft'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-[3px_3px_0_#899f1e] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#899f1e]',
    ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
    outline: 'border border-border bg-transparent text-foreground hover:border-primary/70 hover:bg-primary/5',
    soft: 'bg-secondary text-foreground hover:bg-secondary/80',
  };
  return <button className={`cf-focus inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

function MarketingNav() {
  return (
    <header className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-6 md:px-8">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <a className="transition-colors hover:text-foreground" href="#method">Method</a>
        <a className="transition-colors hover:text-foreground" href="#signal">Signal</a>
        <a className="transition-colors hover:text-foreground" href="#pricing">For teams</a>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/login" className="cf-focus hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:block" data-testid="link-login">Sign in</Link>
        <Link href="/dashboard" className="cf-focus inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_#899f1e] transition-all hover:translate-x-[1px] hover:translate-y-[1px]" data-testid="link-start-forge">Open workspace <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <main className="cf-noise min-h-[100dvh] overflow-hidden bg-background">
      <MarketingNav />
      <section className="relative mx-auto max-w-[1240px] px-5 pb-24 pt-16 md:px-8 md:pb-32 md:pt-24">
        <div className="pointer-events-none absolute -right-20 top-2 h-[600px] w-[600px] rounded-full bg-[#d6f542]/[.07] blur-[110px]" />
        <div className="relative max-w-5xl">
          <p className="cf-reveal mb-7 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[.2em] text-primary"><span className="h-px w-10 bg-primary" />A workspace for the decisive cut</p>
          <h1 className="cf-reveal cf-delay-1 max-w-5xl text-[clamp(3.7rem,10vw,9.2rem)] font-semibold leading-[.86] tracking-[-.085em] text-foreground">MAKE THE<br /><span className="text-primary">MOMENT</span><br />MOVE<span className="text-accent">.</span></h1>
          <div className="cf-reveal cf-delay-2 mt-10 flex max-w-2xl flex-col justify-between gap-8 border-l border-primary/40 pl-5 md:ml-[33%] md:flex-row md:items-end md:pl-7">
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">Clip Forge turns the chaos of raw footage into a clean, charged edit. Find the signal. Shape the story. Ship the cut.</p>
            <Link href="/projects/new" className="cf-focus inline-flex w-fit shrink-0 items-center gap-3 rounded-lg bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_#899f1e] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#899f1e]" data-testid="link-create-first-project">Start a project <Plus className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="cf-reveal cf-delay-3 mt-24 grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr]">
          <div className="cf-scanline relative min-h-[300px] overflow-hidden rounded-2xl border border-border bg-[#171b29] p-7 md:min-h-[390px]">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 76% 30%, #f28d70 0, transparent 22%), linear-gradient(135deg, transparent 38%, #252a3c 38%, #252a3c 39%, transparent 39%)' }} />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">01 / The timeline</span><span className="flex items-center gap-2 font-mono text-[10px] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Live preview</span></div>
              <div><div className="mb-3 flex items-end gap-1"><span className="h-16 w-2 bg-primary/70" /><span className="h-28 w-2 bg-primary" /><span className="h-10 w-2 bg-accent/70" /><span className="h-20 w-2 bg-primary/80" /><span className="h-32 w-2 bg-primary" /><span className="h-12 w-2 bg-accent" /><span className="h-24 w-2 bg-primary/70" /><span className="h-9 w-2 bg-primary" /><span className="h-16 w-2 bg-primary/60" /></div><p className="font-mono text-xs text-muted-foreground">Your best take is closer than you think.</p></div>
            </div>
          </div>
          <div id="method" className="rounded-2xl border border-border bg-card p-7">
            <Sparkles className="mb-14 h-5 w-5 text-accent" />
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">02 / Less friction</p>
            <h2 className="max-w-xs text-3xl font-medium leading-tight tracking-[-.055em]">Your eye knows. The tool should keep up.</h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">One focused room for the raw, the rough, and the almost-there. No hunting through folders. No fighting the interface.</p>
          </div>
        </div>
      </section>
      <section id="signal" className="border-y border-border bg-[#121622] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-14 md:grid-cols-[.8fr_1.4fr] md:items-center">
          <div><span className="font-mono text-xs text-accent">03 / Signal over noise</span><h2 className="mt-5 max-w-sm text-4xl font-medium leading-[.98] tracking-[-.06em] md:text-5xl">A sharper path from footage to feeling.</h2></div>
          <div className="grid gap-0 border-t border-border">
            {['Drop everything into one room.', 'Mark what matters before you polish.', 'Export with your next move already clear.'].map((item, index) => <div className="flex items-center gap-5 border-b border-border py-5" key={item}><span className="font-mono text-xs text-primary">0{index + 1}</span><span className="text-lg text-foreground">{item}</span><ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" /></div>)}
          </div>
        </div>
      </section>
      <section id="pricing" className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 px-5 py-20 md:flex-row md:items-end md:px-8 md:py-28">
        <div><span className="font-mono text-xs text-primary">04 / Your next cut</span><h2 className="mt-4 max-w-2xl text-5xl font-medium leading-[.95] tracking-[-.07em] md:text-7xl">Keep the momentum.</h2></div>
        <Link href="/dashboard" className="cf-focus inline-flex items-center gap-3 border-b border-primary pb-2 text-sm font-bold text-primary transition-all hover:gap-5" data-testid="link-enter-workspace">Enter the workspace <ArrowUpRight className="h-4 w-4" /></Link>
      </section>
      <footer className="mx-auto flex max-w-[1240px] justify-between border-t border-border px-5 py-7 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground md:px-8"><span>Clip Forge / 2025</span><span>Made for the cut</span></footer>
    </main>
  );
}

function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('creator@clipforge.studio');
  const [loading, setLoading] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); setLoading(true); window.setTimeout(() => { localStorage.setItem(STORAGE_AUTH, 'true'); onLogin(); }, 650); };
  return <main className="cf-noise grid min-h-[100dvh] place-items-center bg-background px-5 py-10">
    <div className="w-full max-w-[460px]">
      <div className="mb-12 flex items-center justify-between"><Logo /><Link href="/" className="text-xs text-muted-foreground hover:text-foreground" data-testid="link-back-home">Back to site</Link></div>
      <div className="cf-reveal rounded-2xl border border-border bg-card p-7 shadow-2xl md:p-10">
        <div className="mb-10"><span className="mb-5 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[.16em] text-primary">Private workspace</span><h1 className="text-4xl font-medium tracking-[-.06em]">Back to the forge.</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Your timeline is waiting exactly where you left it.</p></div>
        <form onSubmit={submit} className="space-y-5">
          <label className="block"><span className="mb-2 block text-xs font-semibold text-muted-foreground">Email address</span><input className="cf-focus w-full rounded-lg border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required data-testid="input-email" /></label>
          <label className="block"><span className="mb-2 block text-xs font-semibold text-muted-foreground">Passphrase</span><input className="cf-focus w-full rounded-lg border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary" defaultValue="forge-demo" type="password" autoComplete="current-password" required data-testid="input-password" /></label>
          <Button className="w-full py-3.5" type="submit" disabled={loading} data-testid="button-login">{loading ? <><span className="h-4 w-4 animate-pulse rounded-full bg-primary-foreground/50" />Opening workspace...</> : <>Enter Clip Forge <LogIn className="h-4 w-4" /></>}</Button>
        </form>
        <div className="mt-7 flex items-center gap-3 text-[11px] text-muted-foreground"><span className="h-px flex-1 bg-border" />Demo access is enabled<span className="h-px flex-1 bg-border" /></div>
      </div>
      <p className="mt-7 text-center font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground/60">No account creation required for this preview</p>
    </div>
  </main>;
}

function AppShell({ children, onSignOut }: { children: ReactNode; onSignOut: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const nav = [{ label: 'Overview', href: '/dashboard', icon: HomeIcon }, { label: 'Projects', href: '/projects/new', icon: Layers3 }];
  return <div className="cf-noise flex min-h-[100dvh] bg-background">
    <aside className="hidden w-[238px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 md:flex">
      <div className="px-2 pb-10"><Logo /></div>
      <div className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground/70">Workspace</div>
      <nav className="space-y-1">{nav.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className={`cf-focus flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${location === href || (label === 'Projects' && location.startsWith('/projects/')) ? 'bg-sidebar-accent font-semibold text-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground'}`} data-testid={`link-nav-${label.toLowerCase()}`}><Icon className="h-4 w-4" /><span>{label}</span>{label === 'Projects' && <span className="ml-auto font-mono text-[10px] text-muted-foreground">03</span>}</Link>)}</nav>
      <div className="mt-auto space-y-5">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-4"><div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Storage</span><Gauge className="h-3.5 w-3.5 text-primary" /></div><div className="mb-2 h-1.5 overflow-hidden rounded-full bg-background"><div className="h-full w-[34%] rounded-full bg-primary" /></div><p className="font-mono text-[10px] text-muted-foreground">68.4 GB <span className="text-foreground">/ 200 GB</span></p></div>
        <button onClick={onSignOut} className="cf-focus flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground" data-testid="button-sign-out"><LogOut className="h-4 w-4" />Sign out</button>
        <div className="flex items-center gap-3 border-t border-sidebar-border pt-4"><div className="grid h-8 w-8 place-items-center rounded-full bg-accent font-mono text-xs font-medium text-accent-foreground">AR</div><div className="min-w-0"><p className="truncate text-xs font-semibold">Alex Rivera</p><p className="truncate font-mono text-[10px] text-muted-foreground">Director</p></div><Settings2 className="ml-auto h-4 w-4 text-muted-foreground" /></div>
      </div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="flex h-[70px] items-center justify-between border-b border-border px-5 md:px-9">
        <div className="md:hidden"><Logo compact /></div>
        <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground md:flex"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Alex Rivera's workspace</div>
        <div className="flex items-center gap-2 md:ml-auto"><button className="cf-focus rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" data-testid="button-search"><Search className="h-4 w-4" /></button><Link href="/projects/new" className="cf-focus inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-[2px_2px_0_#899f1e]" data-testid="link-new-project"><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">New project</span></Link><button className="cf-focus rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu"><Menu className="h-5 w-5" /></button></div>
      </header>
      {menuOpen && <div className="border-b border-border bg-sidebar p-4 md:hidden"><Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground" data-testid="link-mobile-overview">Overview</Link><Link href="/projects/new" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground" data-testid="link-mobile-projects">Projects</Link><button onClick={onSignOut} className="mt-2 w-full border-t border-border px-3 py-3 text-left text-sm text-muted-foreground" data-testid="button-mobile-sign-out">Sign out</button></div>}
      <div className="cf-scroll h-[calc(100dvh-70px)] overflow-y-auto">{children}</div>
    </div>
  </div>;
}

function Dashboard({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('');
  const visible = projects.filter((project) => project.title.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-[1280px] px-5 py-9 md:px-9 md:py-12">
    <div className="cf-reveal mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 font-mono text-[10px] uppercase tracking-[.18em] text-primary">Monday / February 17, 2025</p><h1 className="text-4xl font-medium tracking-[-.07em] md:text-5xl">Good morning, Alex<span className="text-accent">.</span></h1><p className="mt-3 text-sm text-muted-foreground">You have one cut close to ready.</p></div><Link href="/projects/new" className="cf-focus inline-flex w-fit items-center gap-2 rounded-lg border border-border px-3.5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary" data-testid="link-create-project-dashboard"><Plus className="h-4 w-4" /> Create a project</Link></div>
    <div className="cf-reveal cf-delay-1 mb-12 grid gap-3 sm:grid-cols-3"><Stat label="Active projects" value={String(projects.length).padStart(2, '0')} note="across 3 formats" accent="primary" /><Stat label="Footage in forge" value="68.4" suffix="GB" note="24 files indexed" accent="accent" /><Stat label="Edits shipped" value="12" note="this month" accent="cyan" /></div>
    <div className="cf-reveal cf-delay-2 mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold tracking-[-.03em]">Recent projects</h2><p className="mt-1 text-xs text-muted-foreground">Your latest rooms, ready for another pass.</p></div><div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><input className="cf-focus w-36 rounded-lg border border-border bg-card py-2 pl-8 pr-3 text-xs outline-none focus:border-primary sm:w-48" placeholder="Filter projects" value={query} onChange={(e) => setQuery(e.target.value)} data-testid="input-filter-projects" /></div></div>
    {visible.length ? <div className="cf-reveal cf-delay-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}<Link href="/projects/new" className="group flex min-h-[218px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center transition-all hover:border-primary/70 hover:bg-primary/[.03]" data-testid="link-empty-new-project"><span className="mb-4 grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary"><Plus className="h-4 w-4" /></span><span className="text-sm font-semibold">Start another cut</span><span className="mt-1 text-xs text-muted-foreground">Bring in new footage</span></Link></div> : <EmptyProjects />}
    <section className="cf-reveal cf-delay-4 mt-14 grid gap-4 lg:grid-cols-[1.3fr_.7fr]"><div className="rounded-xl border border-border bg-card p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-semibold tracking-[-.03em]">Recent activity</h2><p className="mt-1 text-xs text-muted-foreground">The last few things that moved.</p></div><span className="font-mono text-[10px] uppercase tracking-[.12em] text-primary">Live</span></div>{[['North Star / BTS', 'Exported vertical cut', '12 min ago', 'accent'], ['Field Notes — Issue 04', 'Project created', '2 hours ago', 'primary'], ['After Hours / Cut 02', 'Added 2 files', 'Yesterday', 'cyan']].map(([title, event, time, color], index) => <div className="flex items-center gap-3 border-t border-border py-3.5" key={title}><span className={`h-2 w-2 rounded-full ${color === 'accent' ? 'bg-accent' : color === 'cyan' ? 'bg-[#63d6df]' : 'bg-primary'}`} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{event}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{title}</p></div><span className="shrink-0 font-mono text-[10px] text-muted-foreground">{time}</span></div>)}</div><div className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground"><div className="absolute -right-14 -top-14 h-44 w-44 rounded-full border-[24px] border-primary-foreground/10" /><Zap className="mb-14 h-5 w-5" /><p className="font-mono text-[10px] uppercase tracking-[.16em] opacity-70">Forge note</p><p className="mt-3 max-w-[220px] text-2xl font-medium leading-tight tracking-[-.05em]">“Cut the hesitation, not the feeling.”</p><p className="mt-6 font-mono text-[10px] uppercase tracking-[.12em] opacity-70">— The edit room</p></div></section>
  </div>;
}

function Stat({ label, value, suffix, note, accent }: { label: string; value: string; suffix?: string; note: string; accent: string }) {
  return <div className="rounded-xl border border-border bg-card p-5"><div className="mb-8 flex items-center gap-2 text-[11px] text-muted-foreground"><span className={`h-1.5 w-1.5 rounded-full ${accent === 'accent' ? 'bg-accent' : accent === 'cyan' ? 'bg-[#63d6df]' : 'bg-primary'}`} />{label}</div><div className="flex items-baseline gap-2"><span className="text-4xl font-medium tracking-[-.07em]">{value}</span>{suffix && <span className="font-mono text-xs text-muted-foreground">{suffix}</span>}</div><p className="mt-2 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{note}</p></div>;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return <Link href={`/projects/${project.id}`} className="cf-focus group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl" data-testid={`card-project-${project.id}`}><div className="relative h-[122px] overflow-hidden p-4" style={{ background: `linear-gradient(135deg, ${project.color}20, #171b29 62%)` }}><div className="absolute inset-0 opacity-40" style={{ backgroundImage: `linear-gradient(120deg, transparent 20%, ${project.color}22 20%, ${project.color}22 21%, transparent 21%), linear-gradient(120deg, transparent 52%, ${project.color}15 52%, ${project.color}15 53%, transparent 53%)` }} /><div className="relative flex items-start justify-between"><span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[10px] text-foreground">{project.format}</span><span className={`rounded-md px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${project.status === 'Ready' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'}`}>{project.status}</span></div><Film className="absolute bottom-4 right-4 h-5 w-5" style={{ color: project.color }} /></div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-semibold group-hover:text-primary">{project.title}</h3><p className="mt-1 font-mono text-[10px] text-muted-foreground">{formatDate(project.createdAt)} · {project.files.length} {project.files.length === 1 ? 'file' : 'files'}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /></div></div></Link>;
}

function EmptyProjects() {
  return <div className="rounded-xl border border-dashed border-border py-16 text-center"><FolderOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><h3 className="text-sm font-semibold">No projects match that search</h3><p className="mt-2 text-xs text-muted-foreground">Try another title or start a new room.</p></div>;
}

function NewProject({ onCreate }: { onCreate: (project: Project) => void }) {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<Format>('9:16');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = (incoming: FileList | File[]) => setFiles((current) => [...current, ...Array.from(incoming).filter((file) => file.type.startsWith('video/') || file.type.startsWith('audio/'))]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!title.trim()) return; const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled'}-${Date.now().toString().slice(-5)}`; onCreate({ id, title: title.trim(), format, createdAt: new Date().toISOString(), status: files.length ? 'Ready' : 'Draft', files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })), color: palette[Math.floor(Math.random() * palette.length)] }); setLocation(`/projects/${id}`); };
  return <div className="mx-auto max-w-[900px] px-5 py-10 md:px-9 md:py-14"><Link href="/dashboard" className="cf-focus mb-12 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="link-back-dashboard"><ChevronRight className="h-3.5 w-3.5 rotate-180" />Back to overview</Link><div className="cf-reveal mb-10"><p className="mb-3 font-mono text-[10px] uppercase tracking-[.18em] text-primary">New room / 01</p><h1 className="text-5xl font-medium tracking-[-.08em] md:text-7xl">Name the cut<span className="text-accent">.</span></h1><p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">Set the frame before you bring in the noise. You can change everything else later.</p></div><form onSubmit={submit} className="cf-reveal cf-delay-1 grid gap-5"><div className="rounded-xl border border-border bg-card p-5 md:p-7"><label className="block"><span className="mb-3 block font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Project title</span><input autoFocus className="cf-focus w-full border-b border-border bg-transparent pb-3 text-2xl font-medium tracking-[-.05em] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary" placeholder="e.g. Summer in Oaxaca" value={title} onChange={(e) => setTitle(e.target.value)} required data-testid="input-project-title" /></label><div className="mt-10"><span className="mb-3 block font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Output format</span><div className="grid grid-cols-3 gap-2">{(['9:16', '16:9', '1:1'] as Format[]).map((item) => <button type="button" key={item} onClick={() => setFormat(item)} className={`cf-focus rounded-lg border p-3 text-left transition-all ${format === item ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`} data-testid={`button-format-${item.replace(':', '-')}`}><span className="mb-3 block text-lg font-semibold">{item}</span><span className="font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground">{item === '9:16' ? 'Vertical / shorts' : item === '16:9' ? 'Landscape / film' : 'Square / social'}</span></button>)}</div></div></div><div className={`rounded-xl border border-dashed p-7 text-center transition-colors md:p-12 ${dragging ? 'border-primary bg-primary/10' : 'border-border bg-card/40'}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}><input ref={inputRef} type="file" accept="video/*,audio/*" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} data-testid="input-file-upload" /><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary"><CloudUpload className="h-5 w-5" /></div><h2 className="text-lg font-semibold">{dragging ? 'Release to add footage' : 'Bring in your footage'}</h2><p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">Drop video or audio files here, or choose them from your drive. You can add more in the room.</p><Button type="button" variant="outline" className="mt-5" onClick={() => inputRef.current?.click()} data-testid="button-choose-files"><Upload className="h-4 w-4" />Choose files</Button>{files.length > 0 && <div className="mx-auto mt-6 max-w-md space-y-2 text-left">{files.map((file, index) => <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5" key={`${file.name}-${index}`}><Film className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate text-xs">{file.name}</span><span className="font-mono text-[10px] text-muted-foreground">{formatBytes(file.size)}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="text-muted-foreground hover:text-destructive" data-testid={`button-remove-file-${index}`}><X className="h-3.5 w-3.5" /></button></div>)}</div>}</div><div className="flex flex-col-reverse justify-between gap-3 pt-2 sm:flex-row sm:items-center"><p className="font-mono text-[10px] text-muted-foreground">You can add footage later</p><Button type="submit" disabled={!title.trim()} className="px-6 py-3" data-testid="button-create-project">Create project <ArrowUpRight className="h-4 w-4" /></Button></div></form></div>;
}

function ProjectWorkspace({ projects, onUpdate }: { projects: Project[]; onUpdate: (project: Project) => void }) {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const project = projects.find((item) => item.id === id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  if (!project) return <div className="mx-auto max-w-[700px] px-5 py-20 text-center"><div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground"><FolderOpen className="h-5 w-5" /></div><h1 className="text-2xl font-medium">Room not found</h1><p className="mt-2 text-sm text-muted-foreground">This project may have moved.</p><Link href="/dashboard" className="mt-6 inline-flex text-sm text-primary" data-testid="link-missing-project-dashboard">Return to overview <ArrowUpRight className="ml-2 h-4 w-4" /></Link></div>;
  const addFiles = (incoming: FileList | File[]) => { const added = Array.from(incoming).filter((file) => file.type.startsWith('video/') || file.type.startsWith('audio/')).map((file) => ({ name: file.name, size: file.size, type: file.type })); if (added.length) onUpdate({ ...project, files: [...project.files, ...added], status: 'Ready' }); };
  return <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-9 md:py-10"><Link href="/dashboard" className="cf-focus mb-9 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="link-workspace-back"><ChevronRight className="h-3.5 w-3.5 rotate-180" />All projects</Link><div className="cf-reveal flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end"><div><div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Project room <ChevronRight className="h-3 w-3" /> {project.format}</div><h1 className="text-4xl font-medium tracking-[-.07em] md:text-6xl">{project.title}<span className="text-accent">.</span></h1><p className="mt-3 text-xs text-muted-foreground">Created {formatDate(project.createdAt)} · {project.files.length} source {project.files.length === 1 ? 'file' : 'files'}</p></div><div className="flex items-center gap-2"><Button variant="outline" className="px-3" data-testid="button-share-project"><Copy className="h-3.5 w-3.5" /> Share</Button><Button className="px-3" data-testid="button-export-project"><Play className="h-3.5 w-3.5" /> Preview</Button></div></div><div className="cf-reveal cf-delay-1 grid gap-5 pt-8 lg:grid-cols-[1.4fr_.6fr]"><div><div className={`cf-scanline relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed p-6 text-center transition-colors md:min-h-[440px] ${dragging ? 'border-primary bg-primary/10' : 'border-border bg-card'}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}><input ref={inputRef} className="hidden" type="file" accept="video/*,audio/*" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} data-testid="input-workspace-upload" /><div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary"><Upload className="h-7 w-7" /></div><h2 className="text-2xl font-medium tracking-[-.05em]">{dragging ? 'Drop it in.' : 'Drop footage here.'}</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Bring in your next angle, room tone, or rough take. Clip Forge keeps everything in frame.</p><Button className="mt-7" onClick={() => inputRef.current?.click()} data-testid="button-upload-footage"><CloudUpload className="h-4 w-4" /> Browse footage</Button><p className="mt-4 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">MP4 · MOV · WAV · up to 4 GB</p></div></div><aside className="rounded-xl border border-border bg-card p-5"><div className="mb-6 flex items-center justify-between"><h2 className="text-sm font-semibold">Source bin</h2><span className="font-mono text-[10px] text-muted-foreground">{project.files.length.toString().padStart(2, '0')} files</span></div>{project.files.length ? <div className="space-y-2">{project.files.map((file, index) => <div className="group rounded-lg border border-border bg-background p-3" key={`${file.name}-${index}`}><div className="flex items-start gap-3"><div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-secondary text-primary"><Film className="h-3.5 w-3.5" /></div><div className="min-w-0"><p className="truncate text-xs font-medium" data-testid={`text-file-name-${index}`}>{file.name}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{formatBytes(file.size)} · {file.type.split('/')[1]?.toUpperCase()}</p></div><Check className="ml-auto h-3.5 w-3.5 text-primary" /></div></div>)}</div> : <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center"><Film className="mx-auto mb-3 h-5 w-5 text-muted-foreground" /><p className="text-xs text-muted-foreground">Your source bin is empty.</p><button onClick={() => inputRef.current?.click()} className="mt-3 text-xs font-semibold text-primary hover:underline" data-testid="button-empty-upload">Add first file</button></div>}<div className="mt-7 border-t border-border pt-5"><div className="mb-3 flex items-center justify-between text-xs"><span className="text-muted-foreground">Room status</span><span className={project.status === 'Ready' ? 'text-primary' : 'text-accent'}>{project.status}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${project.status === 'Ready' ? 'w-full bg-primary' : 'w-[18%] bg-accent'}`} /></div></div></aside></div><div className="cf-reveal cf-delay-2 mt-5 grid gap-3 sm:grid-cols-3"><MiniMeta label="Format" value={project.format} /><MiniMeta label="Canvas" value={project.format === '9:16' ? '1080 × 1920' : project.format === '16:9' ? '1920 × 1080' : '1080 × 1080'} /><MiniMeta label="Next up" value={project.files.length ? 'Start shaping' : 'Add footage'} /></div></div>;
}

function MiniMeta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-card px-4 py-3"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>; }

function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }

function Router({ authenticated, setAuthenticated, projects, setProjects }: { authenticated: boolean; setAuthenticated: (value: boolean) => void; projects: Project[]; setProjects: (projects: Project[]) => void }) {
  const [, setLocation] = useLocation();
  const createProject = (project: Project) => setProjects([...projects, project]);
  const updateProject = (project: Project) => setProjects(projects.map((item) => item.id === project.id ? project : item));
  const signOut = () => { localStorage.removeItem(STORAGE_AUTH); setAuthenticated(false); setLocation('/login'); };
  if (!authenticated) return <Switch><Route path="/login"><AuthScreen onLogin={() => { setAuthenticated(true); setLocation('/dashboard'); }} /></Route><Route path="/"><Landing /></Route><Route path="/dashboard"><Redirect to="/login" /></Route><Route path="/projects/new"><Redirect to="/login" /></Route><Route path="/projects/:id"><Redirect to="/login" /></Route><Route component={NotFound} /></Switch>;
  return <AppShell onSignOut={signOut}><Switch><Route path="/"><Landing /></Route><Route path="/dashboard"><Dashboard projects={projects} /></Route><Route path="/projects/new"><NewProject onCreate={createProject} /></Route><Route path="/projects/:id"><ProjectWorkspace projects={projects} onUpdate={updateProject} /></Route><Route component={NotFound} /></Switch></AppShell>;
}

function App() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem(STORAGE_AUTH) === 'true');
  const [projects, setProjectsState] = useState<Project[]>(readProjects);
  const setProjects = (next: Project[]) => { setProjectsState(next); localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(next)); };
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router authenticated={authenticated} setAuthenticated={setAuthenticated} projects={projects} setProjects={setProjects} /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;