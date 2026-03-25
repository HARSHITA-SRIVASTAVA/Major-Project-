import { useState, useEffect, useRef } from "react";

// ─── GOOGLE FONTS INJECTION ───────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ─── THEME (matches HTML version) ────────────────────────────────────────────
const C = {
  blush: "#f7d6e0", blushMid: "#f0a8be", blushDark: "#c2607e",
  sage: "#d4e9d6", sageMid: "#a8cfab", sageDark: "#5a9460",
  lavender: "#e4daf7", lavenderMid: "#c2afe8", lavenderDark: "#7c5cbf",
  peach: "#fde8d0", peachMid: "#f8c799", peachDark: "#c97b35",
  sky: "#d3eaf9", skyMid: "#9fcbee", skyDark: "#3a7db5",
  cream: "#fdf8f0", white: "#ffffff",
  text: "#3a3040", textMuted: "#7a6e80", textLight: "#a89fb0",
  border: "rgba(180,160,195,0.25)",
  shadow: "rgba(160,130,180,0.12)",
};

// ─── MOODS ────────────────────────────────────────────────────────────────────
const MOODS = [
  { label: "Joyful",   emoji: "😄", score: 5, color: "#fdf6d8", dark: "#c4a020" },
  { label: "Calm",     emoji: "😌", score: 4, color: C.sage,    dark: C.sageDark },
  { label: "Okay",     emoji: "😐", score: 3, color: C.sky,     dark: C.skyDark },
  { label: "Stressed", emoji: "😰", score: 2, color: C.peach,   dark: C.peachDark },
  { label: "Sad",      emoji: "😢", score: 1, color: C.blush,   dark: C.blushDark },
];
const moodMeta = (label) => MOODS.find(m => m.label === label) || MOODS[2];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EVENT_COLORS = [C.lavenderMid, C.sageMid, C.blushMid, C.peachMid, C.skyMid];
const TAGS = ["Study", "Wellbeing", "Gratitude", "Venting", "Goals", "Social", "Health"];

// ─── DEFAULT SEED DATA (10 entries over the last month) ───────────────────────
function buildSeedData() {
  const now = new Date();
  const seed = [
    { daysAgo: 28, mood: "Okay",     note: "Felt neutral today. Got through my readings.",        title: "Ordinary Tuesday" },
    { daysAgo: 25, mood: "Stressed", note: "Exam prep stress is building. Hard to focus.",        title: "Pre-exam anxiety" },
    { daysAgo: 22, mood: "Sad",      note: "Missing home a lot. Felt lonely in the library.",     title: "Homesick afternoon" },
    { daysAgo: 20, mood: "Okay",     note: "Things are manageable. Took a short walk outside.",   title: "Small relief" },
    { daysAgo: 17, mood: "Calm",     note: "Studied well in the morning. Evening was peaceful.",  title: "Peaceful study day" },
    { daysAgo: 14, mood: "Joyful",   note: "Got great feedback on my project. Really proud!",     title: "Project win 🎉" },
    { daysAgo: 11, mood: "Calm",     note: "Weekend was restorative. Slept in and cooked.",       title: "Weekend recharge" },
    { daysAgo: 8,  mood: "Stressed", note: "Assignment due tomorrow. Panic mode activated.",      title: "Deadline crunch" },
    { daysAgo: 5,  mood: "Okay",     note: "Submitted everything. Relief mixed with exhaustion.", title: "Post-deadline haze" },
    { daysAgo: 2,  mood: "Joyful",   note: "Hung out with friends. Laughed a lot. Needed that.", title: "Friends make it better" },
  ];

  return seed.map((s, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - s.daysAgo);
    d.setHours(9 + (i % 6), (i * 13) % 60, 0, 0);
    return {
      id: 1000 + i,
      mood: s.mood,
      title: s.title,
      body: s.note,
      tags: [TAGS[i % TAGS.length]],
      date: d.toISOString().split("T")[0],
      time: d.toISOString(),
      displayDate: d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      displayTime: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      isCheckin: false,
    };
  });
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const store = {
  async get(key) {
    try {
      if (typeof window.storage !== "undefined") {
        const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null;
      }
    } catch {}
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  async set(key, value) {
    try {
      if (typeof window.storage !== "undefined") { await window.storage.set(key, JSON.stringify(value)); return; }
    } catch {}
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
      padding: "1.25rem 1.5rem", boxShadow: `0 2px 12px ${C.shadow}`, ...style
    }}>
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <p style={{ fontSize: 12, letterSpacing: "0.8px", textTransform: "uppercase", color: C.textLight, marginBottom: "1rem", margin: "0 0 1rem" }}>
      {children}
    </p>
  );
}

function SubmitBtn({ children, onClick, disabled, color }) {
  const bg = color || C.lavenderDark;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "12px 28px", borderRadius: 12, border: "none",
      fontSize: 14, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? C.border : bg, color: disabled ? C.textMuted : "#fff",
      fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
    }}>
      {children}
    </button>
  );
}

// ─── SIDEBAR NAV ──────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab }) {
  const navSections = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", icon: "🏡", label: "Dashboard" },
        { id: "checkin",   icon: "✏️", label: "Daily Check-in" },
        { id: "journal",   icon: "📖", label: "Journal" },
        { id: "reflect",   icon: "📋", label: "Weekly Review" },
      ]
    },
    {
      title: "Insights",
      items: [
        { id: "trends",    icon: "📈", label: "Mood Trends" },
        { id: "calendar",  icon: "📅", label: "Calendar" },
      ]
    }
  ];

  return (
    <nav style={{
      width: 240, background: C.white, borderRight: `1px solid ${C.border}`,
      padding: "2rem 1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "2rem",
      position: "fixed", height: "100vh", overflowY: "auto", top: 0, left: 0, zIndex: 10,
      boxSizing: "border-box",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: C.lavender, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌸</div>
        <span style={{ fontFamily: "'Lora', serif", fontSize: 18, color: C.lavenderDark, fontWeight: 500 }}>MindBloom</span>
      </div>

      {/* Nav sections */}
      {navSections.map(section => (
        <div key={section.title}>
          <p style={{ fontSize: 10, letterSpacing: "1.2px", textTransform: "uppercase", color: C.textLight, padding: "0 0.5rem", marginBottom: 4 }}>{section.title}</p>
          {section.items.map(item => (
            <div key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 10, fontSize: 14, color: activeTab === item.id ? C.lavenderDark : C.textMuted,
              cursor: "pointer", transition: "all 0.2s", fontWeight: activeTab === item.id ? 500 : 400,
              background: activeTab === item.id ? C.lavender : "transparent",
            }}
              onMouseEnter={e => { if (activeTab !== item.id) { e.currentTarget.style.background = C.lavender; e.currentTarget.style.color = C.lavenderDark; } }}
              onMouseLeave={e => { if (activeTab !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; } }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      ))}

      {/* User card */}
      <div style={{ marginTop: "auto", background: C.blush, borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.blushMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: C.blushDark }}>A</div>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Arya Sharma</p>
          <span style={{ fontSize: 11, color: C.textMuted }}>3rd Year · CS</span>
        </div>
      </div>
    </nav>
  );
}

// ─── NOTIFICATIONS BANNER ────────────────────────────────────────────────────
function NotificationsBanner({ events }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urgent = events.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    const diff = Math.ceil((d - today) / 86400000);
    return diff >= 0 && diff <= 2 && e.reminder;
  });
  if (!urgent.length) return null;
  return (
    <div style={{
      background: "#fdf6d8", border: "1px solid #c4a020", borderRadius: 12,
      padding: "10px 16px", marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ fontSize: 18 }}>🔔</span>
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#7a6000" }}>Upcoming Deadline{urgent.length > 1 ? "s" : ""}!</p>
        {urgent.map(e => {
          const diff = Math.ceil((new Date(e.date + "T00:00:00") - today) / 86400000);
          return <p key={e.id} style={{ margin: "2px 0 0", fontSize: 12, color: C.text }}>{e.title} — {diff === 0 ? "today" : diff === 1 ? "tomorrow" : "in 2 days"}</p>;
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function Dashboard({ journalEntries, events, setActiveTab }) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const last7 = journalEntries.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    return (today - d) / 86400000 <= 7;
  });
  const todayEntries = journalEntries.filter(e => e.date === todayStr);
  const streak = (() => {
    let s = 0, d = new Date(today);
    while (true) {
      const ds = d.toISOString().split("T")[0];
      if (!journalEntries.some(e => e.date === ds)) break;
      s++; d.setDate(d.getDate() - 1);
    }
    return s;
  })();
  const dominant = (() => {
    const c = {};
    last7.forEach(e => c[e.mood] = (c[e.mood] || 0) + 1);
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  })();

  // Mini SVG mood line for dashboard (last 14 days from journal)
  const last14 = (() => {
    const byDate = {};
    [...journalEntries].sort((a, b) => a.time.localeCompare(b.time)).forEach(e => { byDate[e.date] = e; });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  })();

  // Doughnut data
  const moodCounts = {};
  journalEntries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
  const total = journalEntries.length;

  // Upcoming events
  const upcoming = events.filter(e => new Date(e.date + "T00:00:00") >= new Date(todayStr)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, color: C.text, fontWeight: 500, margin: 0 }}>Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"}, Arya 🌸</h1>
        <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Here's your wellness snapshot</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {[
          { label: "Entries this week", value: last7.length, sub: `${journalEntries.length} total entries`, dot: C.lavenderMid },
          { label: "Check-in streak", value: `${streak}d`, sub: streak > 0 ? "Keep it up! 🌿" : "Start your streak today", dot: C.sageMid },
          { label: "Today's entries", value: todayEntries.length, sub: todayEntries.length === 0 ? "No entry yet today" : "Great job checking in!", dot: C.blushMid },
        ].map(s => (
          <Card key={s.label}>
            <p style={{ fontSize: 12, color: C.textLight, marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: 28, color: C.text, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: s.dot, marginRight: 5 }} />
              {s.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {/* Mood trend mini */}
        <Card>
          <CardTitle>Mood over last 14 days</CardTitle>
          <MoodLineChart entries={last14} height={160} />
        </Card>

        {/* Mood doughnut */}
        <Card>
          <CardTitle>Mood breakdown (all time)</CardTitle>
          <MoodDoughnut moodCounts={moodCounts} total={total} />
        </Card>
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Quick actions */}
        <Card>
          <CardTitle>Quick actions</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Daily Check-in", emoji: "✏️", tab: "checkin", color: C.lavender, dark: C.lavenderDark },
              { label: "Write in Journal", emoji: "📖", tab: "journal", color: C.peach, dark: C.peachDark },
              { label: "View Calendar", emoji: "📅", tab: "calendar", color: C.sage, dark: C.sageDark },
            ].map(a => (
              <button key={a.tab} onClick={() => setActiveTab(a.tab)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: 12, border: `1px solid ${C.border}`, background: "white",
                cursor: "pointer", fontSize: 14, color: C.text, fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s", textAlign: "left",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = a.dark; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = C.text; }}
              >
                <span style={{ fontSize: 18 }}>{a.emoji}</span> {a.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Upcoming events */}
        <Card>
          <CardTitle>Upcoming deadlines</CardTitle>
          {upcoming.length === 0 ? (
            <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "1rem 0" }}>No upcoming events</p>
          ) : upcoming.map(e => {
            const diff = Math.ceil((new Date(e.date + "T00:00:00") - new Date(todayStr)) / 86400000);
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 10px", borderRadius: 10, background: C.cream, border: `1px solid ${C.border}` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>{e.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{e.type} · {e.date}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: diff <= 2 ? C.peach : C.lavender, color: diff <= 2 ? C.peachDark : C.lavenderDark }}>
                  {diff === 0 ? "Today!" : diff === 1 ? "Tomorrow!" : `${diff}d`}
                </span>
              </div>
            );
          })}
          <button onClick={() => setActiveTab("calendar")} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: `1px dashed ${C.lavenderMid}`, background: C.lavender, color: C.lavenderDark, fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", marginTop: 4 }}>
            View Calendar →
          </button>
        </Card>
      </div>
    </div>
  );
}

// ─── MOOD LINE CHART (SVG) ────────────────────────────────────────────────────
function MoodLineChart({ entries, height = 180, showMonthly = false }) {
  if (!entries || entries.length < 2) {
    return <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "2rem 0" }}>Not enough data yet. Keep journaling!</p>;
  }
  const W = 500, H = height, PAD_L = 34, PAD_R = 16, PAD_T = 12, PAD_B = 28;
  const xStep = (W - PAD_L - PAD_R) / (entries.length - 1);
  const yPos = s => PAD_T + ((5 - s) / 4) * (H - PAD_T - PAD_B);
  const pts = entries.map((e, i) => [PAD_L + i * xStep, yPos(moodMeta(e.mood).score)]);
  const pathD = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaD = pathD + ` L${pts[pts.length - 1][0]},${H - PAD_B} L${pts[0][0]},${H - PAD_B} Z`;
  const gridLines = [1, 2, 3, 4, 5];
  const moodLabels = ["😢", "😰", "😐", "😌", "😄"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.lavenderMid} stopOpacity="0.4" />
          <stop offset="100%" stopColor={C.lavenderMid} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map(v => (
        <line key={v} x1={PAD_L} x2={W - PAD_R} y1={yPos(v)} y2={yPos(v)} stroke={C.border} strokeWidth="1" strokeDasharray="4 3" />
      ))}
      {moodLabels.map((emoji, i) => (
        <text key={i} x={PAD_L - 4} y={yPos(i + 1) + 4} textAnchor="end" fontSize="10" fill={C.textLight}>{emoji}</text>
      ))}
      <path d={areaD} fill="url(#moodGrad)" />
      <path d={pathD} fill="none" stroke={C.lavenderDark} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => {
        const m = moodMeta(entries[i].mood);
        const d = new Date(entries[i].date + "T12:00:00");
        const label = showMonthly ? `${d.getDate()}/${d.getMonth() + 1}` : `${d.getDate()}/${d.getMonth() + 1}`;
        return (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={5} fill={m.color} stroke={C.white} strokeWidth="2" />
            {(i === 0 || i === entries.length - 1 || entries.length <= 10) && (
              <text x={p[0]} y={H - PAD_B + 12} textAnchor="middle" fontSize="9" fill={C.textLight}>{label}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── MOOD DOUGHNUT (SVG) ─────────────────────────────────────────────────────
function MoodDoughnut({ moodCounts, total }) {
  if (!total) return <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "1rem 0" }}>No entries yet</p>;
  const W = 200, CX = 100, CY = 85, R = 65, INNER = 38;
  const slices = []; let angle = -Math.PI / 2;
  MOODS.forEach(m => {
    const count = moodCounts[m.label] || 0;
    if (!count) return;
    const a = (count / total) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(angle), y1 = CY + R * Math.sin(angle);
    const x2 = CX + R * Math.cos(angle + a), y2 = CY + R * Math.sin(angle + a);
    slices.push({ d: `M${CX},${CY} L${x1},${y1} A${R},${R} 0 ${a > Math.PI ? 1 : 0},1 ${x2},${y2} Z`, ...m, count });
    angle += a;
  });
  const dominant = slices.reduce((a, b) => a.count > b.count ? a : b, slices[0]);
  return (
    <svg viewBox={`0 0 ${W} 175`} width="100%" style={{ display: "block" }}>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} stroke={C.white} strokeWidth="2" />)}
      <circle cx={CX} cy={CY} r={INNER} fill={C.white} />
      <text x={CX} y={CY - 4} textAnchor="middle" fontSize="18">{dominant?.emoji}</text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontSize="9" fill={C.textMuted}>most common</text>
      <text x={CX} y={CY + 22} textAnchor="middle" fontSize="9" fill={C.textMuted}>{total} entries</text>
      {slices.map((s, i) => (
        <g key={i} transform={`translate(${6 + (i % 3) * 64},${162 + Math.floor(i / 3) * 15})`}>
          <rect width="7" height="7" rx="2" fill={s.color} />
          <text x="10" y="7" fontSize="9" fill={C.text}>{s.label} ({s.count})</text>
        </g>
      ))}
    </svg>
  );
}

// ─── DAILY CHECK-IN ───────────────────────────────────────────────────────────
function DailyCheckin({ onCheckin }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState([]);
  const [done, setDone] = useState(false);
  const toggleTag = t => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);

  const submit = () => {
    if (!selected) return;
    const now = new Date();
    onCheckin({
      id: Date.now(),
      mood: selected,
      title: `Check-in — ${now.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
      body: note,
      tags,
      date: now.toISOString().split("T")[0],
      time: now.toISOString(),
      displayDate: now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      displayTime: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      isCheckin: true,
    });
    setDone(true);
  };

  if (done) {
    const m = moodMeta(selected);
    return (
      <Card style={{ background: C.lavender }}>
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{m.emoji}</div>
          <h2 style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 20, color: C.lavenderDark, fontWeight: 400, margin: "0 0 8px" }}>Check-in saved to your journal!</h2>
          <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>Feeling <strong>{selected}</strong> — great job showing up for yourself.</p>
          <button onClick={() => { setDone(false); setSelected(null); setNote(""); setTags([]); }} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 10, border: `1px solid ${C.lavenderDark}`, background: C.white, color: C.lavenderDark, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            Check in again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, color: C.text, fontWeight: 500, margin: 0 }}>Daily Check-in</h1>
        <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Saved to your journal with timestamp</p>
      </div>
      <Card>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 18, color: C.text, marginBottom: "1.25rem" }}>How are you feeling right now?</p>
        <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
          {MOODS.map(m => (
            <button key={m.label} onClick={() => setSelected(m.label)} style={{
              flex: 1, padding: "14px 8px", borderRadius: 14, border: selected === m.label ? `2px solid ${m.dark}` : `2px solid ${C.border}`,
              background: selected === m.label ? m.color : C.white, cursor: "pointer", textAlign: "center", transition: "all 0.2s",
              transform: selected === m.label ? "translateY(-2px)" : "none",
            }}>
              <div style={{ fontSize: 24 }}>{m.emoji}</div>
              <span style={{ display: "block", fontSize: 11, color: selected === m.label ? m.dark : C.textMuted, marginTop: 4 }}>{m.label}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>Add a note (optional)</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
          placeholder="What's on your mind today?"
          style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.cream, resize: "none", outline: "none", marginBottom: "1rem" }}
        />
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>Tags</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
          {TAGS.map(t => (
            <button key={t} onClick={() => toggleTag(t)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              border: `1px solid ${tags.includes(t) ? C.blushMid : C.border}`,
              background: tags.includes(t) ? C.blush : C.white, color: tags.includes(t) ? C.blushDark : C.textMuted,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>
        <SubmitBtn onClick={submit} disabled={!selected}>Save Check-in to Journal</SubmitBtn>
      </Card>
    </div>
  );
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
function Journal({ journalEntries, onAddEntry, onDeleteEntry }) {
  const [mood, setMood] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState("write");
  const [expand, setExpand] = useState(null);
  const toggleTag = t => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);

  const submit = () => {
    if (!mood || !body.trim()) return;
    const now = new Date();
    onAddEntry({
      id: Date.now(),
      mood, tags,
      title: title.trim() || `Journal — ${now.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
      body: body.trim(),
      date: now.toISOString().split("T")[0],
      time: now.toISOString(),
      displayDate: now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      displayTime: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      isCheckin: false,
    });
    setSaved(true);
    setTimeout(() => { setMood(null); setTitle(""); setBody(""); setTags([]); setSaved(false); }, 2000);
  };

  const grouped = journalEntries.reduce((acc, e) => { (acc[e.date] = acc[e.date] || []).push(e); return acc; }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, color: C.text, fontWeight: 500, margin: 0 }}>My Journal</h1>
        <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Your thoughts, check-ins, and reflections</p>
      </div>
      <Card>
        {/* Tab toggle */}
        <div style={{ display: "flex", gap: 6, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 5, width: "fit-content", marginBottom: "1.5rem" }}>
          {[["write", "✏️ Write"], ["history", `📚 History (${journalEntries.length})`]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "none",
              background: view === v ? C.lavender : "transparent", color: view === v ? C.lavenderDark : C.textMuted,
              fontWeight: view === v ? 500 : 400, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Write view */}
        {view === "write" && (saved ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🌸</div>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 18, color: C.lavenderDark }}>Entry saved!</p>
            <p style={{ fontSize: 13, color: C.textMuted }}>Your thoughts are safely stored.</p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 18, color: C.text, marginBottom: "1.25rem" }}>How are you feeling right now?</p>
            <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
              {MOODS.map(m => (
                <button key={m.label} onClick={() => setMood(m.label)} style={{
                  flex: 1, padding: "14px 8px", borderRadius: 14, border: mood === m.label ? `2px solid ${m.dark}` : `2px solid ${C.border}`,
                  background: mood === m.label ? m.color : C.white, cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                  transform: mood === m.label ? "translateY(-2px)" : "none",
                }}>
                  <div style={{ fontSize: 24 }}>{m.emoji}</div>
                  <span style={{ display: "block", fontSize: 11, color: mood === m.label ? m.dark : C.textMuted, marginTop: 4 }}>{m.label}</span>
                </button>
              ))}
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry title (optional)"
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.cream, outline: "none", marginBottom: "1rem" }} />
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>What's on your mind?</p>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
              placeholder="Write freely… What's on your mind? What went well? What felt hard?"
              style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.cream, resize: "none", outline: "none", marginBottom: "1rem", lineHeight: 1.6 }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem" }}>
              {TAGS.map(t => (
                <button key={t} onClick={() => toggleTag(t)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  border: `1px solid ${tags.includes(t) ? C.blushMid : C.border}`,
                  background: tags.includes(t) ? C.blush : C.white, color: tags.includes(t) ? C.blushDark : C.textMuted, transition: "all 0.2s",
                }}>{t}</button>
              ))}
            </div>
            <SubmitBtn onClick={submit} disabled={!mood || !body.trim()} color={C.lavenderDark}>Save Journal Entry</SubmitBtn>
          </>
        ))}

        {/* History view */}
        {view === "history" && (
          journalEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: C.textMuted, fontSize: 13 }}>No entries yet — start writing!</div>
          ) : (
            <div>
              {sortedDates.map(date => (
                <div key={date} style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, margin: "0 0 10px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {new Date(date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  {grouped[date].slice().reverse().map(e => {
                    const m = moodMeta(e.mood);
                    const isOpen = expand === e.id;
                    return (
                      <div key={e.id} style={{ borderRadius: 14, border: `1px solid ${C.border}`, background: isOpen ? m.color : C.cream, marginBottom: 8, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={() => setExpand(isOpen ? null : e.id)}>
                          <span style={{ fontSize: 20 }}>{m.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: C.text }}>{e.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>
                              {e.displayTime} · {e.mood}{e.isCheckin ? " · Check-in" : ""}{e.tags?.length ? ` · ${e.tags.join(", ")}` : ""}
                            </p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button onClick={ev => { ev.stopPropagation(); onDeleteEntry(e.id); }} style={{
                              background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 6, fontSize: 12, color: C.textLight,
                            }} title="Delete entry">✕</button>
                            <span style={{ color: C.textMuted, fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                          </div>
                        </div>
                        {isOpen && e.body && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${m.dark}30` }}>
                            <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{e.body}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )
        )}
      </Card>
    </div>
  );
}

// ─── QUESTIONNAIRE ────────────────────────────────────────────────────────────
const WEEKLY_Q = [
  "How well did you manage your study schedule this week?",
  "How connected did you feel to your friends and family?",
  "Did you take time for self-care and breaks?",
  "How confident do you feel about your upcoming assessments?",
  "Overall, how balanced did your week feel?",
];
const MONTHLY_Q = [
  "How satisfied are you with your academic progress this month?",
  "Have you been maintaining healthy sleep patterns?",
  "Are you feeling motivated toward your long-term goals?",
  "How well are you managing financial or logistical stress?",
  "Do you feel you have adequate support from your institution?",
];

function WeeklyReview() {
  const [type, setType] = useState("weekly");
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const questions = type === "weekly" ? WEEKLY_Q : MONTHLY_Q;
  const avg = Object.values(answers).length ? (Object.values(answers).reduce((a, b) => a + b, 0) / Object.values(answers).length).toFixed(1) : null;

  if (done) return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, color: C.text, fontWeight: 500, margin: 0 }}>Weekly Review</h1>
        <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Reflect on your week</p>
      </div>
      <Card style={{ background: C.sage }}>
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 20, color: C.sageDark }}>Score: {avg} / 5</p>
          <p style={{ fontSize: 14, color: C.sageDark }}>Your {type} reflection is recorded!</p>
          <button onClick={() => { setDone(false); setAnswers({}); }} style={{ marginTop: 12, padding: "8px 20px", borderRadius: 10, border: `1px solid ${C.sageDark}`, background: C.white, color: C.sageDark, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Retake</button>
        </div>
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, color: C.text, fontWeight: 500, margin: 0 }}>Weekly Review</h1>
        <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Reflect on your week</p>
      </div>
      <Card>
        {/* Progress bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem" }}>
          {questions.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: answers[i] !== undefined ? C.sageMid : answers[i] !== undefined - 1 ? C.lavenderMid : C.border }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 5, width: "fit-content", marginBottom: "1.5rem" }}>
          {["weekly", "monthly"].map(t => (
            <button key={t} onClick={() => { setType(t); setAnswers({}); }} style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "none",
              background: type === t ? C.sage : "transparent", color: type === t ? C.sageDark : C.textMuted,
              fontWeight: type === t ? 500 : 400, fontFamily: "'DM Sans', sans-serif",
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        {questions.map((q, i) => (
          <div key={i} style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: 14, color: C.text, margin: "0 0 10px" }}>{i + 1}. {q}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setAnswers(a => ({ ...a, [i]: n }))} style={{
                  flex: 1, padding: "8px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: `1px solid ${answers[i] === n ? C.sageMid : C.border}`,
                  background: answers[i] === n ? C.sage : C.white, color: answers[i] === n ? C.sageDark : C.textMuted,
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", fontWeight: answers[i] === n ? 500 : 400,
                }}>{n}</button>
              ))}
            </div>
          </div>
        ))}
        <SubmitBtn onClick={() => setDone(true)} disabled={Object.keys(answers).length < questions.length} color={C.sageDark}>
          Submit Review
        </SubmitBtn>
      </Card>
    </div>
  );
}

// ─── TRENDS PAGE ──────────────────────────────────────────────────────────────
function Trends({ journalEntries }) {
  const [period, setPeriod] = useState("month");
  const today = new Date();

  // Filter entries for selected period
  const filtered = journalEntries.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    if (period === "week") return (today - d) / 86400000 <= 7;
    if (period === "month") return (today - d) / 86400000 <= 30;
    return true;
  });

  // For month graph: deduplicate by date, last 30 days
  const byDate = {};
  [...filtered].sort((a, b) => a.time.localeCompare(b.time)).forEach(e => { byDate[e.date] = e; });
  const monthData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

  // For day/week pie: all entries in period
  const moodCounts = {};
  filtered.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });

  // Today's entries only for day chart
  const todayStr = today.toISOString().split("T")[0];
  const todayEntries = journalEntries.filter(e => e.date === todayStr);
  const weekEntries = journalEntries.filter(e => (today - new Date(e.date + "T00:00:00")) / 86400000 <= 7);

  const todayCounts = {}, weekCounts = {};
  todayEntries.forEach(e => { todayCounts[e.mood] = (todayCounts[e.mood] || 0) + 1; });
  weekEntries.forEach(e => { weekCounts[e.mood] = (weekCounts[e.mood] || 0) + 1; });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, color: C.text, fontWeight: 500, margin: 0 }}>Mood Trends</h1>
        <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Track your emotional patterns over time</p>
      </div>

      {/* Period tabs */}
      <div style={{ display: "flex", gap: 6, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 5, width: "fit-content", marginBottom: "2rem" }}>
        {[["week", "Last 7 days"], ["month", "Last 30 days"], ["all", "All time"]].map(([v, label]) => (
          <button key={v} onClick={() => setPeriod(v)} style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "none",
            background: period === v ? C.lavender : "transparent", color: period === v ? C.lavenderDark : C.textMuted,
            fontWeight: period === v ? 500 : 400, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* Mood trend line — pulls from journal history */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Card>
          <CardTitle>Mood over {period === "week" ? "last 7 days" : period === "month" ? "last 30 days" : "all time"} (from journal history)</CardTitle>
          <MoodLineChart entries={monthData} height={200} showMonthly />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {/* Today's mood chart */}
        <Card>
          <CardTitle>Today's mood</CardTitle>
          <MoodDoughnut moodCounts={todayCounts} total={todayEntries.length} />
          {todayEntries.length === 0 && <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", marginTop: 4 }}>No entries today yet</p>}
        </Card>

        {/* This week's mood chart */}
        <Card>
          <CardTitle>This week's mood</CardTitle>
          <MoodDoughnut moodCounts={weekCounts} total={weekEntries.length} />
        </Card>
      </div>

      {/* All-time summary */}
      <Card>
        <CardTitle>Mood breakdown — {filtered.length} entries in period</CardTitle>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {MOODS.map(m => {
            const count = moodCounts[m.label] || 0;
            const pct = filtered.length > 0 ? Math.round(count / filtered.length * 100) : 0;
            return (
              <div key={m.label} style={{ flex: "1 1 80px", background: m.color, borderRadius: 14, padding: "14px 10px", textAlign: "center", border: `1px solid ${m.dark}30` }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{m.emoji}</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 24, color: m.dark }}>{count}</div>
                <div style={{ fontSize: 11, color: m.dark, fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: m.dark, opacity: 0.7 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarPage({ events, setEvents }) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", type: "Exam", reminder: false });
  const [selectedDay, setSelectedDay] = useState(null);
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = day => {
    if (!day) return [];
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === ds);
  };

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    setEvents(ev => [...ev, { ...form, id: Date.now(), color: EVENT_COLORS[ev.length % EVENT_COLORS.length] }]);
    setForm({ title: "", date: "", type: "Exam", reminder: false });
    setShowForm(false);
  };

  const handleDelete = id => setEvents(ev => ev.filter(e => e.id !== id));

  const upcoming = events.filter(e => new Date(e.date + "T00:00:00") >= new Date(todayStr)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);

  const selectedDayStr = selectedDay ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}` : null;
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, color: C.text, fontWeight: 500, margin: 0 }}>Calendar</h1>
        <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Deadlines, exams, and reminders</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.25rem" }}>
        {/* Calendar grid */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.textMuted, padding: "0 4px" }}>‹</button>
            <span style={{ fontFamily: "'Lora', serif", fontSize: 17, color: C.text, fontWeight: 500 }}>{MONTHS_LONG[month]} {year}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.textMuted, padding: "0 4px" }}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
            {DAYS_SHORT.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 500, color: C.textLight, padding: "3px 0" }}>{d}</div>
            ))}
            {cells.map((day, i) => {
              const de = eventsForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;
              return (
                <div key={i} onClick={() => day && setSelectedDay(isSelected ? null : day)} style={{
                  minHeight: 38, borderRadius: 8, padding: "3px 4px", cursor: day ? "pointer" : "default",
                  background: isSelected ? C.lavenderMid : isToday ? C.lavender : day ? "white" : "transparent",
                  border: isToday ? `1px solid ${C.lavenderDark}` : isSelected ? `1px solid ${C.lavenderDark}` : "1px solid transparent",
                  transition: "all 0.15s",
                }}>
                  {day && <span style={{ fontSize: 11, color: isSelected ? C.white : isToday ? C.lavenderDark : C.text, fontWeight: isToday || isSelected ? 600 : 400 }}>{day}</span>}
                  {de.slice(0, 2).map((e, j) => (
                    <div key={j} style={{ height: 3, borderRadius: 2, background: e.color, marginTop: 2 }} title={e.title} />
                  ))}
                  {de.length > 2 && <div style={{ fontSize: 8, color: C.textLight, marginTop: 1 }}>+{de.length - 2}</div>}
                </div>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedDay && (
            <div style={{ marginTop: "1rem", borderTop: `1px solid ${C.border}`, paddingTop: "1rem" }}>
              <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>
                {new Date(selectedDayStr + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {selectedEvents.length === 0 ? (
                <p style={{ fontSize: 13, color: C.textLight, fontStyle: "italic" }}>No events on this day</p>
              ) : selectedEvents.map(e => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: C.cream, border: `1px solid ${C.border}`, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>{e.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{e.type}{e.reminder ? " · 🔔 Reminder on" : ""}</p>
                  </div>
                  <button onClick={() => handleDelete(e.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.textLight, padding: "2px 6px" }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Add event */}
          <button onClick={() => setShowForm(!showForm)} style={{
            width: "100%", padding: "9px 0", borderRadius: 10, marginTop: "1rem",
            border: `1px dashed ${C.blushMid}`, background: C.blush, color: C.blushDark,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, cursor: "pointer",
          }}>
            {showForm ? "— Cancel" : "+ Add Event / Reminder"}
          </button>
          {showForm && (
            <div style={{ marginTop: "1rem", background: C.cream, borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title (e.g. Math Final Exam)"
                style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, background: C.white, color: C.text, outline: "none", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }} />
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, background: C.white, color: C.text, outline: "none", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }} />
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {["Exam", "Assignment", "Reminder", "Other"].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                    flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    border: `1px solid ${form.type === t ? C.blushMid : C.border}`,
                    background: form.type === t ? C.blush : C.white, color: form.type === t ? C.blushDark : C.textMuted,
                  }}>{t}</button>
                ))}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textMuted, marginBottom: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={form.reminder} onChange={e => setForm(f => ({ ...f, reminder: e.target.checked }))} />
                🔔 Notify me 1 day before
              </label>
              <SubmitBtn onClick={handleAdd} disabled={!form.title || !form.date} color={C.blushDark}>Add Event</SubmitBtn>
            </div>
          )}
        </Card>

        {/* Upcoming list */}
        <div>
          <Card>
            <CardTitle>Upcoming events</CardTitle>
            {upcoming.length === 0 ? (
              <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "1rem 0" }}>No upcoming events</p>
            ) : upcoming.map(e => {
              const diff = Math.ceil((new Date(e.date + "T00:00:00") - new Date(todayStr)) / 86400000);
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, padding: "10px", borderRadius: 10, background: C.cream, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>{e.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{e.type} · {e.date}</p>
                    {e.reminder && <p style={{ margin: "2px 0 0", fontSize: 10, color: C.lavenderDark }}>🔔 Reminder set</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 8, background: diff <= 2 ? C.peach : C.lavender, color: diff <= 2 ? C.peachDark : C.lavenderDark, whiteSpace: "nowrap" }}>
                      {diff === 0 ? "Today!" : diff === 1 ? "Tomorrow!" : `${diff}d`}
                    </span>
                    <button onClick={() => handleDelete(e.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.textLight }}>✕ remove</button>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [journalEntries, setJournal] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [je, ev] = await Promise.all([store.get("mb_journal_v2"), store.get("mb_events_v2")]);
      setJournal(je ?? buildSeedData());
      setEvents(ev ?? [
        { id: 1, title: "Data Structures Final", date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0], type: "Exam", reminder: true, color: C.blushMid },
        { id: 2, title: "ML Assignment Due", date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split("T")[0], type: "Assignment", reminder: true, color: C.lavenderMid },
        { id: 3, title: "Project Review", date: new Date(new Date().setDate(new Date().getDate() + 9)).toISOString().split("T")[0], type: "Reminder", reminder: false, color: C.sageMid },
      ]);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) store.set("mb_journal_v2", journalEntries); }, [journalEntries, loaded]);
  useEffect(() => { if (loaded) store.set("mb_events_v2", events); }, [events, loaded]);

  const handleCheckin = entry => setJournal(j => [...j, entry]);
  const handleJournal = entry => setJournal(j => [...j, entry]);
  const handleDelete = id => setJournal(j => j.filter(e => e.id !== id));

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌸</div>
        <p style={{ color: C.textMuted, fontSize: 14 }}>Loading your space…</p>
      </div>
    </div>
  );

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: C.cream, color: C.text, minHeight: "100vh",
      width: "100vw", overflowX: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{ position: "fixed", top: -120, right: -120, width: 480, height: 480, background: "radial-gradient(circle, rgba(228,218,247,0.55) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(212,233,214,0.5) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1, width: "100%" }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ marginLeft: 240, flex: 1, padding: "2rem 2.5rem", minWidth: 0, boxSizing: "border-box" }}>
          <NotificationsBanner events={events} />

          {activeTab === "dashboard" && (
            <Dashboard journalEntries={journalEntries} events={events} setActiveTab={setActiveTab} />
          )}
          {activeTab === "checkin" && (
            <DailyCheckin onCheckin={handleCheckin} />
          )}
          {activeTab === "journal" && (
            <Journal journalEntries={journalEntries} onAddEntry={handleJournal} onDeleteEntry={handleDelete} />
          )}
          {activeTab === "reflect" && <WeeklyReview />}
          {activeTab === "trends" && <Trends journalEntries={journalEntries} />}
          {activeTab === "calendar" && <CalendarPage events={events} setEvents={setEvents} />}
        </main>
      </div>
    </div>
  );
}
