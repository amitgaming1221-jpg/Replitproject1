import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownLeft, Sun, Leaf, Wind, Plus, Bell,
  ChevronRight, Sparkles, Zap, BookOpen, ArrowRight, Search
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid
} from 'recharts';

const INK = '#241A15';
const PAPER = '#F4EDE3';
const ACCENT = '#D6244A';

const yieldData = {
  '1M': [
    { label: 'W1', value: 312 }, { label: 'W2', value: 348 },
    { label: 'W3', value: 296 }, { label: 'W4', value: 402 },
  ],
  '6M': [
    { label: 'Mar', value: 980 }, { label: 'Apr', value: 1240 },
    { label: 'May', value: 1510 }, { label: 'Jun', value: 1890 },
    { label: 'Jul', value: 2110 }, { label: 'Aug', value: 1960 },
  ],
  '1Y': [
    { label: 'Sep', value: 740 }, { label: 'Oct', value: 690 }, { label: 'Nov', value: 520 },
    { label: 'Dec', value: 430 }, { label: 'Jan', value: 480 }, { label: 'Feb', value: 660 },
    { label: 'Mar', value: 980 }, { label: 'Apr', value: 1240 }, { label: 'May', value: 1510 },
    { label: 'Jun', value: 1890 }, { label: 'Jul', value: 2110 }, { label: 'Aug', value: 1960 },
  ],
};

const transactions = [
  { id: 1, name: 'Helios Grid Co.', detail: 'Surplus sold back to the grid · 14.2 kWh', amount: 142.80, in: true, time: 'Today, 19:04' },
  { id: 2, name: 'Maison Verte Utilities', detail: 'August statement · night tariff', amount: -68.20, in: false, time: 'Today, 08:12' },
  { id: 3, name: 'Aurora Wind Trust', detail: 'Quarterly dividend · 38 shares', amount: 96.45, in: true, time: 'Yesterday' },
  { id: 4, name: 'Volta Charging', detail: 'EV charge · Rue Cler station', amount: -14.60, in: false, time: 'Yesterday' },
  { id: 5, name: 'Terre Brûlée Café', detail: 'Round-up reforested · +€0.60 to grove', amount: -6.40, in: false, time: 'Aug 27' },
];

const articles = [
  { no: '01', title: 'How to read your solar statement like a love letter', tag: 'Statements', mins: 6 },
  { no: '02', title: 'The slow art of compounding sunlight', tag: 'Yield', mins: 9 },
  { no: '03', title: 'Negotiating with the grid: when to sell your surplus', tag: 'Surplus', mins: 5 },
  { no: '04', title: 'Round-ups, reforested — a beginner\u2019s ritual', tag: 'Habits', mins: 4 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: INK, color: PAPER }} className="px-4 py-3 shadow-xl">
      <p className="mono text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">{label}</p>
      <p className="serif text-xl">{payload[0].value.toLocaleString()} <span className="text-sm opacity-70">kWh</span></p>
    </div>
  );
};

export default function App() {
  const [range, setRange] = useState('6M');
  const [roundUp, setRoundUp] = useState(true);
  const heroRef = useRef(null);
  const learnRef = useRef(null);

  const { scrollYProgress: heroProg } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const wordY = useTransform(heroProg, [0, 1], [0, 160]);
  const balanceY = useTransform(heroProg, [0, 1], [0, -60]);
  const cardAY = useTransform(heroProg, [0, 1], [0, -110]);
  const cardBY = useTransform(heroProg, [0, 1], [0, -50]);
  const cardCY = useTransform(heroProg, [0, 1], [0, -160]);

  const { scrollYProgress: learnProg } = useScroll({ target: learnRef, offset: ['start end', 'end start'] });
  const imgY = useTransform(learnProg, [0, 1], ['-12%', '12%']);
  const captionY = useTransform(learnProg, [0, 1], [40, -40]);

  return (
    <div style={{ background: PAPER, color: INK }} className="min-h-screen antialiased selection:bg-[#D6244A] selection:text-[#F4EDE3]">
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; }
        .serif { font-family: 'Fraunces', Georgia, serif; font-variation-settings: 'opsz' 144; }
        .mono { font-family: 'Spline Sans Mono', monospace; }
        .sans { font-family: 'Inter', sans-serif; }
        .outline-word {
          color: transparent;
          -webkit-text-stroke: 1px rgba(36,26,21,0.18);
        }
        .rule { border-color: rgba(36,26,21,0.16); }
        .duotone img { filter: grayscale(1) contrast(1.05) brightness(1.02); }
        .duotone::after {
          content: ''; position: absolute; inset: 0;
          background: ${ACCENT}; mix-blend-mode: color; opacity: 0.85; pointer-events: none;
        }
        .duotone::before {
          content: ''; position: absolute; inset: 0; z-index: 2;
          background: rgba(36,26,21,0.18); mix-blend-mode: multiply; pointer-events: none;
        }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 38s linear infinite; }
        .tx-row { transition: background 0.25s ease, padding-left 0.25s ease; }
        .tx-row:hover { background: rgba(36,26,21,0.04); padding-left: 1.25rem; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: ${PAPER}; }
        ::-webkit-scrollbar-thumb { background: rgba(36,26,21,0.25); }
        ::-webkit-scrollbar-thumb:hover { background: ${ACCENT}; }
      `}} />

      {/* ============ TOP BAR ============ */}
      <header className="sans sticky top-0 z-50 border-b rule" style={{ background: 'rgba(244,237,227,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-[1320px] mx-auto px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="serif text-[26px] tracking-tight font-medium">
              Solenne<span style={{ color: ACCENT }}>.</span>
            </div>
            <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium">
              {['Home', 'Portfolio', 'Transfers', 'The Practice', 'Cards'].map((item, i) => (
                <a key={item} href="#" className={`relative pb-0.5 transition-colors hover:text-[#D6244A] ${i === 0 ? '' : 'opacity-60 hover:opacity-100'}`}>
                  {item}
                  {i === 0 && <span className="absolute -bottom-[27px] left-0 right-0 h-[2px]" style={{ background: ACCENT }} />}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <Search size={17} className="opacity-50 hover:opacity-100 cursor-pointer transition-opacity" />
            <div className="relative cursor-pointer">
              <Bell size={17} className="opacity-50 hover:opacity-100 transition-opacity" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: ACCENT }} />
            </div>
            <div className="flex items-center gap-3 pl-5 border-l rule">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#241A15]/20">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" alt="Margaux" className="w-full h-full object-cover" />
              </div>
              <span className="text-[13px] font-medium hidden md:block">Margaux V.</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative overflow-hidden border-b rule">
        <motion.div style={{ y: wordY }} className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-full text-center">
          <span className="serif outline-word italic font-light leading-none whitespace-nowrap" style={{ fontSize: 'clamp(180px, 26vw, 380px)' }}>
            lumière
          </span>
        </motion.div>

        <div className="relative max-w-[1320px] mx-auto px-8 pt-16 pb-10">
          <div className="grid grid-cols-12 gap-8">
            {/* Left — greeting + balance */}
            <motion.div style={{ y: balanceY }} className="col-span-12 lg:col-span-5">
              <p className="mono text-[11px] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <span className="w-8 h-px" style={{ background: ACCENT }} />
                Thursday, 29 August · Golden hour
              </p>
              <h1 className="serif text-[44px] leading-[1.05] font-light">
                Good evening,<br />
                <span className="italic font-normal" style={{ color: ACCENT }}>Margaux.</span>
              </h1>
              <p className="sans text-[14px] leading-relaxed opacity-60 mt-5 max-w-[38ch]">
                Your panels held the afternoon light beautifully. Everything you earned, saved and offset — gathered here, in one place.
              </p>

              <div className="mt-10">
                <p className="mono text-[11px] uppercase tracking-[0.25em] opacity-50">Total holdings</p>
                <div className="flex items-end gap-4 mt-2">
                  <span className="serif font-light tracking-tight" style={{ fontSize: 'clamp(56px, 6vw, 84px)', lineHeight: 1 }}>
                    €84,926<span className="text-[0.45em] opacity-50">.12</span>
                  </span>
                </div>
                <div className="flex items-center gap-6 mt-4 sans text-[13px]">
                  <span className="flex items-center gap-1.5 font-semibold" style={{ color: ACCENT }}>
                    <ArrowUpRight size={15} /> +€1,204 this month
                  </span>
                  <span className="opacity-50">4.6% blended yield</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-10 sans">
                <button className="group flex items-center gap-2.5 px-6 py-3.5 text-[13px] font-semibold tracking-wide transition-all hover:gap-4"
                  style={{ background: INK, color: PAPER }}>
                  Move money <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" style={{ color: ACCENT }} />
                </button>
                <button className="flex items-center gap-2 px-6 py-3.5 text-[13px] font-semibold border transition-colors hover:border-[#D6244A] hover:text-[#D6244A]"
                  style={{ borderColor: 'rgba(36,26,21,0.3)' }}>
                  <Plus size={15} /> Add account
                </button>
              </div>
            </motion.div>

            {/* Right — layered account cards (parallax depth) */}
            <div className="col-span-12 lg:col-span-7 relative min-h-[520px] hidden lg:block">
              {/* Solar yield account */}
              <motion.div style={{ y: cardAY }} className="absolute top-10 right-0 w-[420px] p-8 shadow-[0_24px_60px_-20px_rgba(36,26,21,0.45)]"
                >
                <div className="absolute inset-0" style={{ background: INK }} />
                <div className="relative" style={{ color: PAPER }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Sun size={18} style={{ color: ACCENT }} />
                      <span className="mono text-[11px] uppercase tracking-[0.25em] opacity-70">Solar Yield Account</span>
                    </div>
                    <span className="mono text-[11px] opacity-50">·· 4471</span>
                  </div>
                  <p className="serif text-[42px] font-light mt-8">€48,210<span className="text-[0.5em] opacity-60">.55</span></p>
                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/15">
                    <span className="sans text-[12px] opacity-60">Earning while the sun sets</span>
                    <span className="sans text-[13px] font-semibold" style={{ color: ACCENT }}>4.2% APY</span>
                  </div>
                </div>
              </motion.div>

              {/* Green bond vault */}
              <motion.div style={{ y: cardBY }} className="absolute top-[270px] right-[180px] w-[380px] p-7 border rule bg-[#F4EDE3] shadow-[0_18px_44px_-18px_rgba(36,26,21,0.3)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Wind size={17} style={{ color: ACCENT }} />
                    <span className="mono text-[11px] uppercase tracking-[0.25em] opacity-60">Green Bond Vault</span>
                  </div>
                  <span className="mono text-[11px] opacity-40">5 yr · fixed</span>
                </div>
                <p className="serif text-[36px] font-light mt-6">€23,400<span className="text-[0.5em] opacity-50">.00</span></p>
                <div className="flex items-center justify-between mt-6 pt-4 border-t rule sans text-[12px]">
                  <span className="opacity-50">Matures Jun 2029</span>
                  <span className="font-semibold">5.8% fixed</span>
                </div>
              </motion.div>

              {/* Carbon wallet — accent card */}
              <motion.div style={{ y: cardCY }} className="absolute top-[455px] right-[60px] w-[330px] p-7 shadow-[0_20px_50px_-16px_rgba(214,36,74,0.5)]" style={{ background: ACCENT, y: cardCY }}>
                <div style={{ color: PAPER }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Leaf size={17} />
                      <span className="mono text-[11px] uppercase tracking-[0.25em]">Carbon Dividend</span>
                    </div>
                    <Sparkles size={15} className="opacity-80" />
                  </div>
                  <p className="serif text-[34px] font-light mt-5">1,284 <span className="text-[0.5em]">kg offset</span></p>
                  <p className="sans text-[12px] mt-4 opacity-90">Worth €312.40 in credits — equal to one slow train to Lisbon, and back.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative border-t rule overflow-hidden py-3" style={{ background: 'rgba(36,26,21,0.03)' }}>
          <div className="ticker-track flex whitespace-nowrap mono text-[11px] uppercase tracking-[0.22em]">
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center gap-10 pr-10">
                {[
                  'Grid intensity now · 112 g CO₂ / kWh',
                  'Surplus sold this week · 38.4 kWh',
                  'Round-ups reforested · 412 stems',
                  'Night tariff begins · 22:00',
                  'Solar yield, trailing 30 days · €204.16',
                  'Community grove, Provence · 61% funded',
                ].map((t) => (
                  <span key={t} className="flex items-center gap-10">
                    <span className="opacity-60">{t}</span>
                    <span style={{ color: ACCENT }}>✺</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LEDGER: CHART + TRANSACTIONS ============ */}
      <section className="max-w-[1320px] mx-auto px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.3em] opacity-50 mb-3">No. 02 — The Ledger</p>
            <h2 className="serif text-[38px] font-light leading-none">What the light <span className="italic" style={{ color: ACCENT }}>returned</span></h2>
          </div>
          <div className="hidden md:flex items-center gap-1 sans text-[12px] font-semibold border rule">
            {['1M', '6M', '1Y'].map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className="px-5 py-2.5 transition-colors"
                style={range === r ? { background: INK, color: PAPER } : { color: 'rgba(36,26,21,0.55)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-px border rule" style={{ background: 'rgba(36,26,21,0.16)' }}>
          {/* Chart */}
          <div className="col-span-12 lg:col-span-7 p-8" style={{ background: PAPER }}>
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="mono text-[11px] uppercase tracking-[0.25em] opacity-50">Energy generated</p>
                <p className="serif text-[30px] font-light mt-1">
                  {yieldData[range].reduce((a, b) => a + b.value, 0).toLocaleString()} <span className="text-[0.55em] opacity-60">kWh</span>
                </p>
              </div>
              <span className="sans text-[12px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
                <Zap size={13} /> +18% vs prior period
              </span>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yieldData[range]} margin={{ top: 6, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(36,26,21,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontFamily: 'Spline Sans Mono', fontSize: 10, fill: 'rgba(36,26,21,0.5)' }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fontFamily: 'Spline Sans Mono', fontSize: 10, fill: 'rgba(36,26,21,0.5)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: INK, strokeDasharray: '3 3', strokeOpacity: 0.3 }} />
                  <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} fill="url(#fillYield)"
                    dot={{ r: 3, fill: PAPER, stroke: ACCENT, strokeWidth: 1.5 }} activeDot={{ r: 5, fill: ACCENT, stroke: PAPER, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions */}
          <div className="col-span-12 lg:col-span-5 flex flex-col" style={{ background: PAPER }}>
            <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b rule">
              <p className="mono text-[11px] uppercase tracking-[0.25em] opacity-50">Recent movements</p>
              <a href="#" className="sans text-[12px] font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: ACCENT }}>
                View all <ChevronRight size={13} />
              </a>
            </div>
            <div className="flex-1">
              {transactions.map((tx, i) => (
                <div key={tx.id} className={`tx-row flex items-center gap-4 px-8 py-[18px] cursor-pointer ${i !== transactions.length - 1 ? 'border-b rule' : ''}`}>
                  <div className="w-9 h-9 flex items-center justify-center border rule shrink-0">
                    {tx.in
                      ? <ArrowDownLeft size={15} style={{ color: ACCENT }} />
                      : <ArrowUpRight size={15} className="opacity-50" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="sans text-[13.5px] font-semibold truncate">{tx.name}</p>
                    <p className="sans text-[11.5px] opacity-50 truncate mt-0.5">{tx.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="serif text-[16px]" style={tx.in ? { color: ACCENT } : {}}>
                      {tx.in ? '+' : '−'}€{Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="mono text-[10px] opacity-40 mt-0.5">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Round-up toggle */}
            <div className="px-8 py-5 border-t rule flex items-center justify-between" style={{ background: 'rgba(36,26,21,0.03)' }}>
              <div className="flex items-center gap-3">
                <Leaf size={15} style={{ color: ACCENT }} />
                <div>
                  <p className="sans text-[12.5px] font-semibold">Round up to the grove</p>
                  <p className="sans text-[11px] opacity-50">Spare cents become saplings in Provence</p>
                </div>
              </div>
              <button onClick={() => setRoundUp(!roundUp)}
                className="relative w-12 h-[26px] rounded-full transition-colors duration-300"
                style={{ background: roundUp ? ACCENT : 'rgba(36,26,21,0.2)' }}>
                <span className="absolute top-[3px] w-5 h-5 rounded-full transition-all duration-300"
                  style={{ background: PAPER, left: roundUp ? '26px' : '3px' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ THE PRACTICE — EDUCATIONAL ============ */}
      <section ref={learnRef} className="border-t rule" style={{ background: INK, color: PAPER }}>
        <div className="max-w-[1320px] mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-12">
            {/* Featured editorial */}
            <div className="col-span-12 lg:col-span-7">
              <p className="mono text-[11px] uppercase tracking-[0.3em] mb-3 flex items-center gap-3" style={{ color: ACCENT }}>
                <BookOpen size={13} /> No. 03 — The Practice
              </p>
              <h2 className="serif text-[42px] font-light leading-[1.08]">
                Learn to handle money the way<br className="hidden md:block" /> the sun handles an evening — <span className="italic" style={{ color: ACCENT }}>slowly, with intention.</span>
              </h2>

              <div className="relative mt-10 overflow-hidden" style={{ height: 380 }}>
                <div className="duotone absolute inset-0">
                  <motion.img
                    style={{ y: imgY, scale: 1.18 }}
                    src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=800&fit=crop"
                    alt="Solar field at dusk"
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div style={{ y: captionY }} className="absolute bottom-6 left-6 right-6 z-10 p-6" >
                  <div className="absolute inset-0" style={{ background: PAPER }} />
                  <div className="relative" style={{ color: INK }}>
                    <p className="mono text-[10px] uppercase tracking-[0.25em] opacity-50">Featured guide · 11 min read</p>
                    <p className="serif text-[22px] font-normal mt-2 leading-snug">A field guide to your first year of solar earnings</p>
                    <p className="sans text-[12.5px] opacity-60 mt-2 leading-relaxed">
                      <span className="serif text-[28px] float-left mr-2 leading-[0.8]" style={{ color: ACCENT }}>T</span>
                      he first statement always feels abstract — kilowatt-hours, feed-in tariffs, the grid's appetite. This guide walks you through every line, gently, until the numbers feel like yours.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Index of how-tos */}
            <div className="col-span-12 lg:col-span-5 lg:pt-[72px]">
              <div className="border-t border-white/20">
                {articles.map((a) => (
                  <a key={a.no} href="#" className="group flex items-baseline gap-6 py-6 border-b border-white/20 transition-colors hover:bg-white/[0.04] px-2">
                    <span className="serif italic text-[20px] shrink-0" style={{ color: ACCENT }}>{a.no}</span>
                    <div className="flex-1">
                      <p className="serif text-[19px] font-light leading-snug group-hover:translate-x-1 transition-transform">{a.title}</p>
                      <p className="mono text-[10px] uppercase tracking-[0.22em] opacity-50 mt-2">{a.tag} · {a.mins} min</p>
                    </div>
                    <ArrowUpRight size={16} className="opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" style={{ color: ACCENT }} />
                  </a>
                ))}
              </div>
              <button className="sans mt-8 w-full py-4 text-[13px] font-semibold tracking-wide flex items-center justify-center gap-3 transition-all hover:gap-5"
                style={{ background: ACCENT, color: PAPER }}>
                Open the full library <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t rule">
        <div className="max-w-[1320px] mx-auto px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="serif text-[20px]">Solenne<span style={{ color: ACCENT }}>.</span> <span className="sans text-[11px] opacity-50 ml-3">Banking for people in love with the sun.</span></div>
          <div className="mono text-[10px] uppercase tracking-[0.22em] opacity-50 flex gap-8">
            <a href="#" className="hover:opacity-100 hover:text-[#D6244A] transition-all">Privacy</a>
            <a href="#" className="hover:opacity-100 hover:text-[#D6244A] transition-all">Tariffs</a>
            <a href="#" className="hover:opacity-100 hover:text-[#D6244A] transition-all">FSCS Protected</a>
            <span>© 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}