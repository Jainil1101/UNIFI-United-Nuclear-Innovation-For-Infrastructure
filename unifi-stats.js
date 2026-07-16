(function(){
const {
  useState,
  useMemo,
  useEffect,
  useRef
} = React;
const {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend
} = Recharts;
const tr = window.UNIFI_I18N.t,
  LOCALES = window.UNIFI_I18N.LOCALES,
  LOCALE_NAMES = window.UNIFI_I18N.LOCALE_NAMES;
let DATA = null;
const SOURCES = [["Byers, Friedrich, Hennig, Kressig, Li, McCormick & Malaguzzi Valeri (2019) — A Global Database of Power Plants", "WRI Technical Note, June 2019. The methodology paper behind this model's data layer: 600+ sources, ~28,700 geolocated plants, 164 countries, 80.2% of global installed capacity. Nuclear coverage 100%, coal >100%, gas/oil 81.6%, hydro 89.3%; wind 49.5% and solar 21.0% are the weak spots. Generation is 24% reported / 76% estimated by capacity-weighted allocation. Geolocation: 95.2% of sampled capacity confirmed within 250 m. CC BY 4.0.", "https://www.wri.org/publication/global-database-power-plants"], ["Global Power Plant Database — data & code (GitHub / Resource Watch)", "The CSV itself. Cite as: Global Energy Observatory, Google, KTH Royal Institute of Technology in Stockholm, University of Groningen, World Resources Institute. 2018. Global Power Plant Database. Published on Resource Watch.", "https://github.com/wri/global-power-plant-database"], ["Natural Earth — Physical Vectors, Lakes (1:50m)", "Public-domain inland water bodies. Powers the nearest-lake / cooling-water proximity layer and the lake markers on the Site Map.", "https://www.naturalearthdata.com/downloads/50m-physical-vectors/"], ["global-land-mask — land/sea raster", "Embedded global land–ocean grid. Used to compute real distance-to-open-water for every candidate site and to draw the basemap coastline.", "https://pypi.org/project/global-land-mask/"], ["World Nuclear Association — World Uranium Mining Production", "Reference for the fuel & raw-material procurement panel (national production shares).", "https://world-nuclear.org/information-library/nuclear-fuel-cycle/mining-of-uranium/world-uranium-mining-production"], ["Legal Research & Compliance Framework — Rosatom FNPP in the Republic of Indonesia", "Your working document. Source of all §1–§7 content. Open it in-app from any regulation card, or from the Regulations tab.", "USERDOC"]];
const FRAMEWORK = {
  meta: {
    title: "Legal Research and Compliance Framework",
    sub: "International Legal Framework and National Regulation for the Deployment of Rosatom's FNPP in the Republic of Indonesia",
    status: "Ready Working Sample / Legal Appraisal Template"
  },
  s: {
    "§1": {
      t: "International legal status of the asset and maritime law",
      obj: "Elimination of legal conflicts at the junction of nuclear and maritime law.",
      p: ["Asset classification under UNCLOS-1982: defining the FNPP within the territorial sea of Indonesia as a 'non-self-propelled moored vessel / nearshore floating structure'.", "Jurisdictional delineation: establishing the FNPP's status as a 'nuclear installation' rather than a civilian commercial vessel. This excludes it from standard oversight by the Indonesian Marine Register and transfers authority to a specialised nuclear regulator.", "Right of passage and mooring: legally justifying the towing of the FNPP through the EEZ of third-party states under the right of innocent passage.", "In plain terms: the classification grants international immunity, exempts the plant from the local maritime register, and allows transit of foreign waters under innocent passage. The 'nuclear installation' designation assigns all supervisory authority to Indonesia's specialised nuclear regulator, precluding interference from maritime officials."]
    },
    "§2": {
      t: "Non-proliferation safeguards and international control (IAEA)",
      obj: "Ensuring absolute legitimacy of the project before the UN and preventing geopolitical pressure from regional states.",
      p: ["NPT and Safeguards Agreement: a trilateral cooperation framework (Russia — Indonesia — IAEA) for accountancy and security of nuclear materials.", "Access for IAEA inspectors: legal protocol and procedures for inspections on board the floating installation within Indonesian waters.", "Convention on Nuclear Safety (1994): binding the RITM/KLT reactor series to global safety standards during design and construction.", "Convention on Early Notification (1986): immediate transboundary information exchange with neighbouring states (Singapore, Malaysia, Australia) in an emergency.", "In plain terms: the project is fully open to inspection, ruling out weapons allegations. Inspectors may board at any time. The technology is certified to the highest global safety standards, and emergencies trigger immediate notification of neighbours."]
    },
    "§3": {
      t: "Back-end management (SNF and RAW)",
      obj: "Implementing the 'Greenfield' principle and protecting Indonesia's sovereignty from environmental risks.",
      p: ["Joint Convention (1997) Art. 4: obligations on passive heat removal and criticality control of spent nuclear fuel in onboard cooling pools.", "Joint Convention Art. 27 (transboundary movement): the legal mechanism for returning SNF to the Russian Federation, via an Intergovernmental Agreement for transit of the fuel-bearing vessel through international straits.", "London Convention (1996 Protocol): contractually embedding 'zero-discharge' — an absolute ban on releasing liquid radioactive waste into Indonesia's marine environment.", "In plain terms — the 'Clean Shore' principle: spent fuel never remains in the country; it is stored in isolated pools within the barge and the plant returns to Russia for reprocessing. Process water runs in a closed loop, eliminating radioactive discharge to the ocean. Only low-level waste (clothing, filters) is drummed and handed to Indonesia for land-based disposal."]
    },
    "§4": {
      t: "Physical protection, anti-terrorism and cybersecurity",
      obj: "Delineating legal liability and responsibility for asset security on the water and in the digital domain.",
      p: ["CPPNM (2005 Amendment) and the UN Convention for the Suppression of Acts of Nuclear Terrorism.", "Indonesia's area of responsibility: the outer perimeter — marine area, protective concrete mooring mole, air defence, anti-sabotage diver defence.", "Rosatom's area of responsibility: the inner perimeter — physical access control of the reactor compartment and critical technological zones.", "Critical Information Infrastructure protection: a legal mandate for complete air-gapping (hardware and software isolation) of the 'Portal' I&C system from the Internet.", "In plain terms: the host guards the waters around the clock, builds the breakwater and deploys air defence; Rosatom controls the reactor itself. The control system is physically disconnected from the Internet, eliminating web-borne intrusion."]
    },
    "§5": {
      t: "Legal business model and investment protection",
      obj: "Protecting the commercial interests of the parties and streamlining regulatory procedures.",
      p: ["Legal design of the BOO (Build-Own-Operate) model, executed through a long-term Power Purchase Agreement with PLN, Indonesia's state electricity utility.", "Core legal formula: property rights to the FNPP and ownership of the nuclear fuel remain strictly with the Russian Federation. Indonesia acts exclusively as a 'purchaser of services' (electricity). This waives the requirement for Jakarta to adopt complex domestic legislation on ownership of fissionable materials.", "Arbitration and force majeure: dispute resolution tied to a neutral international body (e.g. the Singapore International Arbitration Centre) and defined force majeure events — naval blockades, volcanic eruptions, third-party sanctions.", "In plain terms: Russia retains ownership of plant and uranium; Indonesia simply buys electricity at a fixed price for 30 years. Disputes and force majeure go to neutral arbitration."]
    },
    "§6": {
      t: "Synchronisation of national legislations",
      obj: "Legalising floating nuclear technologies within the domestic frameworks of both states.",
      p: ["Adaptation of Indonesian Nuclear Energy Act No. 10/1997: establishing precedent and drafting amendments to Chapter IV so BAPETEN can issue construction and operating licences for a floating rather than a stationary land-based facility.", "Indonesian Government Regulation No. 61/2013: protocols for transferring low-level radioactive waste to Indonesian ownership for near-surface disposal.", "Russian Federal Laws No. 170-FZ, No. 190-FZ and Art. 49 of the Law on Environmental Protection: the transport of SNF from Indonesia to Russia is classified as 'the import of raw materials for technological reprocessing with the extraction of valuable components', rendering the operation lawful and immune to the Russian ban on importing foreign radioactive waste.", "In plain terms: Indonesia is rewriting its nuclear legislation — changes slated for 2026 — so BAPETEN can license a floating plant. On the Russian side the import ban is cleared by classifying spent fuel as reprocessing feedstock. Indonesia is guaranteed a pristine coastline, free of radioactive legacy, after 60 years."]
    },
    "§7": {
      t: "Civil liability for nuclear damage",
      obj: "Shielding the parties from catastrophic financial risks.",
      p: ["Vienna Convention on Civil Liability for Nuclear Damage: integrating the project into the international nuclear insurance system.", "Limits and pools: defining maximum payout limits for a maritime incident and liability shares between the Russian Nuclear Insurance Pool (RNIP) and the Indonesian insurance pool.", "In plain terms: the project is insured against storms, tsunamis and accidents. Liability for maritime incidents sits with the operator, protecting the host budget. Payout ceilings are defined and allocated between Russian and host insurers, guaranteeing compensation without litigation."]
    }
  }
};
const VENDORS = [["Rosatom (RU)", "RITM-200 / KLT-40S", "FNPP operating — Akademik Lomonosov, Pevek", "Yes — BOO + fuel take-back", "Only commercial floating NPP in operation anywhere. Serial RITM-200 production line already exists for icebreakers.", 1], ["CNNC (CN)", "ACP100 'Linglong One'", "Land-based unit under construction, Hainan", "Rarely — EPC/finance packages", "First land-based SMR under construction; export terms less established.", 0], ["KHNP (KR)", "SMART / i-SMR", "Licensed design; i-SMR in development", "No — EPC vendor", "Strong EPC delivery record; no floating variant.", 0], ["GE Hitachi (US/JP)", "BWRX-300", "Under construction — Darlington, Canada", "No — equipment + EPC", "Most advanced Western SMR build; buyer carries capex and licensing.", 0], ["NuScale (US)", "VOYGR (77 MWe module)", "US NRC design approval", "No — equipment supply", "First US design approval; first project cancelled on cost escalation.", 0], ["EDF (FR)", "Nuward", "In redesign / development", "No", "European option; timeline beyond this model's window.", 0], ["Rolls-Royce (UK)", "RR SMR (470 MWe)", "UK GDA in progress", "No", "Above the 300 MWe screen used here.", 0]];
const URANIUM = {
  Kazakhstan: 43,
  Canada: 15,
  Namibia: 11,
  Australia: 9,
  Uzbekistan: 7,
  Russia: 5,
  Niger: 4,
  China: 3,
  India: 1,
  "United States of America": 0.5,
  Ukraine: 0.5,
  "South Africa": 0.5,
  Brazil: 0.3,
  Iran: 0.1
};
const A = {
  cf: 0.9,
  tariff: 95,
  genCost: 38,
  capexFNPP: 5000,
  capexLand: 4200,
  co2: {
    Coal: 0.95,
    Gas: 0.42,
    Oil: 0.72
  },
  ashKgMWh: 45,
  snfKgMWh: 0.003,
  gHi: 0.042,
  gLo: 0.015,
  jobsC: 4.5,
  jobsO: 260,
  mult: 2.6
};
const sc = y => 1 / (1 + Math.exp(-0.55 * (y - 2034)));
const dep = y => Math.min(1, Math.max(0, (sc(y) - sc(2026)) / (sc(2045) - sc(2026))));
const FC = {
  Coal: "#F59E0B",
  Gas: "#FB923C",
  Oil: "#EF4444",
  Petcoke: "#B91C1C",
  Nuclear: "#22D3EE",
  Hydro: "#60A5FA",
  Solar: "#FDE047",
  Wind: "#4ADE80",
  Geothermal: "#C084FC",
  Biomass: "#A3E635",
  Waste: "#94A3B8",
  Storage: "#818CF8",
  Cogeneration: "#FDBA74",
  "Wave and Tidal": "#2DD4BF",
  Other: "#64748B"
};
const LOC = {
  en: "en-US",
  id: "id-ID",
  ru: "ru-RU"
};
let NF = "en-US",
  U = {
    gw: "GW",
    mw: "MW"
  };
const gw = mw => mw >= 1000 ? (mw / 1000).toFixed(1) + " " + U.gw : Math.round(mw) + " " + U.mw;
const bn = m => m >= 1000 ? "$" + (m / 1000).toFixed(1) + "B" : "$" + Math.round(m) + "M";
const num = n => Math.round(n).toLocaleString(NF);
function Count({
  to,
  fmt = num,
  dur = 650
}) {
  const [v, setV] = useState(to);
  const p = useRef(to);
  const r = useRef();
  useEffect(() => {
    const f = p.current,
      t0 = performance.now();
    const tick = t => {
      const q = Math.min(1, (t - t0) / dur);
      setV(f + (to - f) * (1 - Math.pow(1 - q, 3)));
      if (q < 1) r.current = requestAnimationFrame(tick);else p.current = to;
    };
    r.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r.current);
  }, [to]);
  return React.createElement("span", null, fmt(v));
}
function useModel(name, year, T) {
  return useMemo(() => {
    const c = DATA.c[name],
      f = dep(year);
    const arch = ["Indonesia", "Philippines", "Japan", "Malaysia", "Vietnam", "Sri Lanka", "Cuba", "Dominican Republic", "Fiji", "Papua New Guinea", "Iceland", "New Zealand", "Greece", "Chile", "Bahamas", "Maldives", "Mauritius", "Cyprus", "Malta", "Singapore"].includes(name);
    const coastShare = c.sites.length ? c.coastalN / c.sites.length : 0;
    const fnpp = c.nucCap === 0 && coastShare > 0.35 && (arch || c.oilCap > 300 || c.cap < 120000);
    const modMW = fnpp ? 100 : 300,
      capexKW = fnpp ? A.capexFNPP : A.capexLand;
    const modules = Math.max(1, Math.ceil(c.sfCap / modMW));
    const smrMW = c.sfCap,
      deployedMW = smrMW * f;
    const totalSite = c.sites.reduce((s, x) => s + x[2], 0) || 1;
    let cum = 0;
    const onlineIdx = new Set();
    c.sites.forEach((s, i) => {
      if ((cum + s[2]) / totalSite <= f + 1e-9) {
        onlineIdx.add(i);
        cum += s[2];
      }
    });
    const sitesOnline = onlineIdx.size;
    const displGen = deployedMW * 8760 * 0.55 / 1000;
    const wC = c.sfCap ? c.sfCoal / c.sfCap : 0,
      wG = c.sfCap ? c.sfGas / c.sfCap : 0,
      wO = c.sfCap ? c.sfOil / c.sfCap : 0;
    const co2Mt = displGen * 1000 * (wC * A.co2.Coal + wG * A.co2.Gas + wO * A.co2.Oil) / 1e6;
    const baseGen = c.estGen > 100 ? c.estGen : c.cap * 8760 * 0.45 / 1000;
    const g = c.cap > 150000 && c.fossilShare < 55 ? A.gLo : A.gHi;
    const demand = y => baseGen * Math.pow(1 + g, y - 2026);
    const smrGen = deployedMW * 8760 * A.cf / 1000;
    const ashBase = smrMW * 8760 * 0.55 / 1000 * 1000 * A.ashKgMWh / 1000 * wC;
    const ashAvoid = displGen * 1000 * A.ashKgMWh / 1000 * wC;
    const snfT = smrGen * 1000 * A.snfKgMWh / 1000;
    const capexM = deployedMW * 1000 * capexKW / 1e6,
      capexFull = smrMW * 1000 * capexKW / 1e6;
    const marginM = deployedMW * 8760 * A.cf * (A.tariff - A.genCost) / 1e6;
    const marginFull = smrMW * 8760 * A.cf * (A.tariff - A.genCost) / 1e6;
    const fC = Math.max(0.3, f);
    const payback = marginFull > 0 ? capexFull / (marginFull * fC) : 0;
    const roi30 = capexFull > 0 ? (marginFull * fC * 30 - capexFull) / capexFull * 100 : 0;
    const jC = Math.round(smrMW * A.jobsC * Math.max(0, Math.sin(Math.PI * Math.min(1, f * 1.15))));
    const sitesTot = Math.max(1, c.sites.length ? Math.ceil(c.sites.length / (fnpp ? 2 : 4)) : 1);
    const jO = Math.round(sitesOnline / Math.max(c.sites.length, 1) * sitesTot * A.jobsO);
    const jI = Math.round((jC * 0.35 + jO) * A.mult);
    const ph = year < 2028 ? 0 : year < 2031 ? 1 : f < 0.6 ? 2 : f < 0.98 ? 3 : 4;
    const phase = T.phases[ph];
    const sfConv = c.smallF.cap * f,
      sfRemain = c.smallF.cap * (1 - f);
    const nucNow = c.nucCap + deployedMW;
    const fossilNow = Math.max(0, c.fossilShare / 100 * c.cap - sfConv);
    return {
      c,
      f,
      ph,
      phase,
      fnpp,
      arch,
      modMW,
      modules,
      smrMW,
      deployedMW,
      co2Mt,
      demand,
      baseGen,
      smrGen,
      ashBase,
      ashAvoid,
      snfT,
      capexM,
      capexFull,
      marginM,
      marginFull,
      payback,
      roi30,
      jC,
      jO,
      jI,
      sitesTot,
      sitesOnline,
      onlineIdx,
      coastShare,
      g,
      coalAfter: Math.max(0, c.coalCap - c.sfCoal * f),
      sfConv,
      sfRemain,
      nucNow,
      fossilNow
    };
  }, [name, year, T]);
}
const Card = ({
  children,
  className = "",
  delay = 0
}) => React.createElement("div", {
  className: `bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur unifi-rise ${className}`,
  style: {
    animationDelay: delay + "ms"
  }
}, children);
const Tag = ({
  children,
  tone = "cyan"
}) => {
  const m = {
    cyan: "text-cyan-300 border-cyan-800/60 bg-cyan-950/40",
    amber: "text-amber-300 border-amber-800/60 bg-amber-950/40",
    green: "text-emerald-300 border-emerald-800/60 bg-emerald-950/40",
    red: "text-rose-300 border-rose-800/60 bg-rose-950/40",
    slate: "text-slate-400 border-slate-700 bg-slate-800/40",
    blue: "text-blue-300 border-blue-800/60 bg-blue-950/40"
  };
  return React.createElement("span", {
    className: `text-[10px] tracking-widest font-mono px-2 py-0.5 rounded-full border ${m[tone]}`
  }, children);
};
const H = ({
  k,
  t,
  onInfo
}) => React.createElement("div", {
  className: "flex items-baseline justify-between mb-3 gap-2"
}, React.createElement("div", {
  className: "text-slate-100 font-semibold text-sm tracking-wide"
}, t), React.createElement("div", {
  className: "flex items-center gap-1.5 shrink-0"
}, k && React.createElement(Tag, null, k), onInfo && React.createElement("button", {
  onClick: onInfo,
  className: "w-4 h-4 rounded-full border border-slate-600 text-slate-500 text-[9px] font-bold hover:border-cyan-500 hover:text-cyan-400 transition-colors",
  title: "Data sources"
}, "i")));
const tt = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 10,
  fontSize: 12,
  fontFamily: "ui-monospace,monospace",
  color: "#e2e8f0"
};
function Gauge({
  score,
  T
}) {
  const r = 70,
    cx = 85,
    cy = 85,
    p = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const arc = (a0, a1, col, w, ex = {}) => {
    const [x0, y0] = p(a0),
      [x1, y1] = p(a1);
    return React.createElement("path", {
      d: `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`,
      stroke: col,
      strokeWidth: w,
      fill: "none",
      strokeLinecap: "round",
      ...ex
    });
  };
  return React.createElement("svg", {
    viewBox: "0 0 170 150",
    className: "w-40 unifi-glow"
  }, arc(-220, 40, "#1e293b", 10), score > 0 && arc(-220, -220 + score / 100 * 260, "#22D3EE", 10, {
    style: {
      filter: "drop-shadow(0 0 6px #22D3EE)"
    }
  }), React.createElement("text", {
    x: cx,
    y: cy,
    textAnchor: "middle",
    className: "fill-slate-100",
    fontSize: "31",
    fontWeight: "800",
    fontFamily: "ui-monospace,monospace"
  }, score), React.createElement("text", {
    x: cx,
    y: cy + 18,
    textAnchor: "middle",
    className: "fill-slate-500",
    fontSize: "8",
    letterSpacing: "2.5",
    fontFamily: "ui-monospace,monospace"
  }, T.smrOpportunity));
}
function DocModal({
  open,
  onClose,
  T
}) {
  const keys = Object.keys(FRAMEWORK.s);
  const [k, setK] = useState(open === "all" ? keys[0] : open);
  useEffect(() => {
    setK(open === "all" ? keys[0] : open);
  }, [open]);
  const s = FRAMEWORK.s[k] || FRAMEWORK.s[keys[0]];
  return React.createElement("div", {
    className: "fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4",
    onClick: onClose
  }, React.createElement("div", {
    className: "bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full unifi-rise max-h-[88vh] flex flex-col",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "flex items-start justify-between gap-4 p-5 border-b border-slate-800"
  }, React.createElement("div", null, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-cyan-400"
  }, T.dm.tag(FRAMEWORK.meta.status.toUpperCase())), React.createElement("div", {
    className: "text-lg font-extrabold text-white mt-0.5"
  }, FRAMEWORK.meta.title), React.createElement("div", {
    className: "text-[11.5px] text-slate-500 mt-1 max-w-2xl leading-relaxed"
  }, FRAMEWORK.meta.sub)), React.createElement("button", {
    onClick: onClose,
    className: "text-slate-500 hover:text-slate-200 text-2xl leading-none shrink-0"
  }, "×")), React.createElement("div", {
    className: "flex flex-wrap gap-1 px-5 py-3 border-b border-slate-800 bg-slate-950/50"
  }, keys.map(x => React.createElement("button", {
    key: x,
    onClick: () => setK(x),
    className: `px-2.5 py-1.5 rounded-lg text-[9.5px] font-mono tracking-widest transition-colors ${k === x ? "bg-cyan-500/15 text-cyan-300 border border-cyan-700/60" : "text-slate-500 border border-transparent hover:text-slate-300"}`
  }, x))), React.createElement("div", {
    className: "p-5 overflow-y-auto"
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-slate-500"
  }, k), React.createElement("div", {
    className: "text-xl font-extrabold text-white mt-1"
  }, s.t), React.createElement("div", {
    className: "text-[12px] text-cyan-300/90 mt-2 bg-cyan-950/25 border border-cyan-900/50 rounded-lg px-3 py-2"
  }, React.createElement("span", {
    className: "font-mono text-[9px] tracking-widest text-cyan-500"
  }, T.dm.objective, " "), s.obj), React.createElement("ul", {
    className: "mt-4 space-y-3"
  }, s.p.map((x, i) => React.createElement("li", {
    key: i,
    className: "text-[12.5px] text-slate-400 leading-relaxed border-l-2 border-slate-800 pl-3"
  }, x))), T.dm.untranslated && React.createElement("div", {
    className: "mt-4 text-[10.5px] text-amber-300/70 bg-amber-950/20 border border-amber-900/40 rounded-lg px-3 py-2"
  }, T.dm.untranslated)), React.createElement("div", {
    className: "px-5 py-3 border-t border-slate-800 text-[10px] font-mono text-slate-600"
  }, T.dm.foot)));
}
function SourceModal({
  onClose,
  onDoc,
  T
}) {
  return React.createElement("div", {
    className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-5",
    onClick: onClose
  }, React.createElement("div", {
    className: "bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full unifi-rise max-h-[85vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "flex items-center justify-between mb-4"
  }, React.createElement("div", null, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-cyan-400"
  }, T.sm.tag), React.createElement("div", {
    className: "text-xl font-extrabold text-white"
  }, T.sm.title)), React.createElement("button", {
    onClick: onClose,
    className: "text-slate-500 hover:text-slate-200 text-2xl leading-none"
  }, "×")), React.createElement("div", {
    className: "space-y-3"
  }, SOURCES.map(([t, d, u]) => React.createElement("div", {
    key: t,
    className: "bg-slate-950/60 border border-slate-800 rounded-xl p-3.5"
  }, React.createElement("div", {
    className: "flex items-start justify-between gap-2"
  }, React.createElement("div", {
    className: "text-slate-100 font-semibold text-[13px]"
  }, t), u === "USERDOC" ? React.createElement("button", {
    onClick: () => {
      onClose();
      onDoc("all");
    },
    className: "text-[10px] font-mono text-cyan-400 hover:text-cyan-300 shrink-0 border border-cyan-900 rounded px-1.5 py-0.5"
  }, T.sm.openApp) : React.createElement("a", {
    href: u,
    target: "_blank",
    rel: "noreferrer",
    className: "text-[10px] font-mono text-cyan-400 hover:text-cyan-300 shrink-0"
  }, T.sm.openExt)), React.createElement("div", {
    className: "text-[11.5px] text-slate-500 mt-1 leading-relaxed"
  }, d)))), React.createElement("div", {
    className: "text-[10.5px] text-slate-500 mt-4 leading-relaxed border-t border-slate-800 pt-3"
  }, React.createElement("span", {
    className: "text-slate-300 font-semibold"
  }, T.sm.derived), " ", T.sm.derivedBody)));
}
function SiteMap({
  m,
  sel,
  T
}) {
  const [hov, setHov] = useState(null);
  const [layers, setLayers] = useState({
    lakes: true,
    coastal: true,
    queued: true
  });
  const c = m.c,
    sites = c.sites,
    mp = c.map;
  const W = 660,
    Hh = 380,
    pad = 8,
    GWd = 72,
    GH = 45;
  const geo = useMemo(() => {
    if (!mp) return null;
    const [la0, la1, lo0, lo1] = mp.b;
    const k = Math.min((W - 2 * pad) / Math.max(lo1 - lo0, 1e-6), (Hh - 2 * pad) / Math.max(la1 - la0, 1e-6));
    const ox = pad + (W - 2 * pad - (lo1 - lo0) * k) / 2,
      oy = pad + (Hh - 2 * pad - (la1 - la0) * k) / 2;
    const bin = atob(mp.g);
    const bits = [];
    for (let i = 0; i < bin.length; i++) {
      const b = bin.charCodeAt(i);
      for (let j = 7; j >= 0; j--) bits.push(b >> j & 1);
    }
    const cw = (lo1 - lo0) / GWd * k,
      ch = (la1 - la0) / GH * k;
    const rects = [];
    for (let r = 0; r < GH; r++) for (let q = 0; q < GWd; q++) if (bits[r * GWd + q]) rects.push(React.createElement("rect", {
      key: r + "_" + q,
      x: ox + q * cw - 0.7,
      y: oy + r * ch - 0.7,
      width: cw + 1.4,
      height: ch + 1.4
    }));
    return {
      la0,
      la1,
      lo0,
      lo1,
      k,
      ox,
      oy,
      rects,
      X: lon => ox + (lon - lo0) * k,
      Y: lat => oy + (la1 - lat) * k
    };
  }, [sel]);
  if (!sites.length || !geo) return React.createElement("div", {
    className: "text-slate-500 text-sm py-10 text-center"
  }, T.noSites);
  const {
    X,
    Y,
    rects
  } = geo;
  return React.createElement("div", {
    className: "relative"
  }, React.createElement("svg", {
    viewBox: `0 0 ${W} ${Hh}`,
    className: "w-full rounded-2xl border border-slate-800",
    style: {
      background: "#071120"
    }
  }, React.createElement("defs", null, React.createElement("filter", {
    id: "goo"
  }, React.createElement("feGaussianBlur", {
    in: "SourceGraphic",
    stdDeviation: "2.8",
    result: "b"
  }), React.createElement("feColorMatrix", {
    in: "b",
    mode: "matrix",
    values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"
  })), React.createElement("linearGradient", {
    id: "landg",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#22303f"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#16202e"
  })), React.createElement("pattern", {
    id: "sea",
    width: "26",
    height: "26",
    patternUnits: "userSpaceOnUse"
  }, React.createElement("rect", {
    width: "26",
    height: "26",
    fill: "#071120"
  }), React.createElement("path", {
    d: "M26 0 L0 0 0 26",
    fill: "none",
    stroke: "#0d1b2e",
    strokeWidth: "1"
  }))), React.createElement("rect", {
    width: W,
    height: Hh,
    fill: "url(#sea)"
  }), React.createElement("g", {
    filter: "url(#goo)"
  }, React.createElement("g", {
    fill: "#0e2036"
  }, rects.map((r, i) => React.cloneElement(r, {
    key: "h" + i,
    transform: "translate(0,2.5)"
  })))), React.createElement("g", {
    filter: "url(#goo)",
    fill: "url(#landg)"
  }, rects), layers.lakes && c.lakes.map((L, i) => {
    const x = X(L[2]),
      y = Y(L[1]);
    if (x < -20 || x > W + 20 || y < -20 || y > Hh + 20) return null;
    const r = Math.max(3, Math.min(13, Math.sqrt(Math.max(L[3], 1)) * 0.5));
    return React.createElement("g", {
      key: i
    }, React.createElement("circle", {
      cx: x,
      cy: y,
      r: r,
      fill: "#1D4ED8",
      opacity: 0.55,
      stroke: "#3B82F6",
      strokeWidth: "0.8"
    }), React.createElement("text", {
      x: x,
      y: y - r - 3,
      textAnchor: "middle",
      fill: "#60A5FA",
      fontSize: "7.5",
      fontFamily: "ui-monospace,monospace",
      opacity: 0.9
    }, L[0]));
  }), sites.map((s, i) => {
    const on = m.onlineIdx.has(i),
      coastal = s[5] !== null && s[5] <= 20;
    if (!on && !layers.queued) return null;
    const r = 3 + Math.sqrt(s[2]) / 5.5;
    return React.createElement("g", {
      key: i,
      onMouseEnter: () => setHov({
        s,
        i
      }),
      onMouseLeave: () => setHov(null),
      style: {
        cursor: "pointer"
      }
    }, on && React.createElement("circle", {
      cx: X(s[4]),
      cy: Y(s[3]),
      r: r + 7,
      fill: "#22D3EE",
      opacity: 0.1,
      className: "unifi-ping"
    }), layers.coastal && coastal && !on && React.createElement("circle", {
      cx: X(s[4]),
      cy: Y(s[3]),
      r: r + 3.5,
      fill: "none",
      stroke: "#3B82F6",
      strokeWidth: "0.9",
      strokeDasharray: "2 2",
      opacity: 0.75
    }), React.createElement("circle", {
      cx: X(s[4]),
      cy: Y(s[3]),
      r: r,
      fill: on ? "#22D3EE" : "#0f172a",
      stroke: on ? "#A5F3FC" : "#64748B",
      strokeWidth: 1.4,
      style: {
        filter: on ? "drop-shadow(0 0 6px #22D3EE)" : "none",
        transition: "fill .5s,stroke .5s"
      }
    }));
  })), React.createElement("div", {
    className: "absolute top-2.5 left-3 text-[9px] font-mono text-slate-500 tracking-widest"
  }, T.mapHeader(sel.toUpperCase())), React.createElement("div", {
    className: "absolute top-2 right-2 flex flex-col gap-1"
  }, [["lakes", T.layers.lakes], ["coastal", T.layers.coastal], ["queued", T.layers.queued]].map(([k, l]) => React.createElement("button", {
    key: k,
    onClick: () => setLayers(v => ({
      ...v,
      [k]: !v[k]
    })),
    className: `text-[8.5px] font-mono tracking-widest px-2 py-1 rounded-md border backdrop-blur transition-colors ${layers[k] ? "bg-slate-900/80 border-cyan-800 text-cyan-300" : "bg-slate-950/70 border-slate-800 text-slate-600"}`
  }, l))), hov && React.createElement("div", {
    className: "absolute bg-slate-950/95 border border-cyan-800 rounded-xl px-3 py-2 text-[11px] pointer-events-none shadow-2xl backdrop-blur z-10",
    style: {
      left: Math.min(X(hov.s[4]) / W * 100, 64) + "%",
      top: Math.min(Y(hov.s[3]) / Hh * 100 + 4, 56) + "%"
    }
  }, React.createElement("div", {
    className: "text-slate-100 font-semibold"
  }, hov.s[0]), React.createElement("div", {
    className: "font-mono text-[10px] mt-1 space-y-0.5"
  }, React.createElement("div", {
    style: {
      color: FC[hov.s[1]]
    }
  }, hov.s[1].toUpperCase(), " · ", Math.round(hov.s[2]), " MW"), React.createElement("div", {
    className: "text-slate-500"
  }, hov.s[3].toFixed(3), "°, ", hov.s[4].toFixed(3), "°"), React.createElement("div", {
    className: hov.s[5] !== null && hov.s[5] <= 20 ? "text-blue-300" : "text-slate-500"
  }, hov.s[5] === null ? T.tip.inland : T.tip.toWater(hov.s[5])), React.createElement("div", {
    className: "text-slate-500"
  }, T.tip.nearestLake(hov.s[7], num(hov.s[8]))), hov.s[6] && React.createElement("div", {
    className: "text-slate-500"
  }, T.tip.commissioned(hov.s[6])), React.createElement("div", {
    className: m.onlineIdx.has(hov.i) ? "text-cyan-300" : "text-slate-600"
  }, m.onlineIdx.has(hov.i) ? T.tip.smrOnline : T.tip.queued))), React.createElement("div", {
    className: "flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[10px] font-mono text-slate-500"
  }, React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full bg-cyan-400"
  }), T.legend.online), React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-500"
  }), T.legend.queued), React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full border border-blue-500 border-dashed"
  }), T.legend.coastal), React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full bg-blue-800 border border-blue-500"
  }), T.legend.lake), React.createElement("span", null, T.legend.size)));
}
function UnifiStats({
  locale = "en",
  data,
  defaultCountry = "Indonesia",
  defaultYear = 2036,
  showLocaleSwitcher = false,
  onLocaleChange
}) {
  const [loc, setLoc] = useState(locale);
  useEffect(() => {
    setLoc(locale);
  }, [locale]);
  const T = tr(loc);
  DATA = data;
  NF = LOC[loc] || "en-US";
  U = T.u;
  const countries = useMemo(() => Object.keys(DATA.c).sort(), [data]);
  const [sel, setSel] = useState(DATA.c[defaultCountry] ? defaultCountry : Object.keys(DATA.c)[0]);
  const [tab, setTab] = useState("overview");
  const [year, setYear] = useState(defaultYear);
  const [live, setLive] = useState(false);
  const [src, setSrc] = useState(false);
  const [doc, setDoc] = useState(null);
  const m = useModel(sel, year, T),
    c = m.c;
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setYear(y => y >= 2045 ? 2026 : y + 1), 1300);
    return () => clearInterval(id);
  }, [live]);
  const series = useMemo(() => Array.from({
    length: 20
  }, (_, i) => {
    const y = 2026 + i,
      f = dep(y);
    return {
      year: y,
      Demand: Math.round(m.demand(y)),
      SMR: Math.round(m.smrMW * f * 8760 * A.cf / 1000),
      Coal: Math.round(Math.max(0, c.coalCap - c.sfCoal * f))
    };
  }), [sel, m.smrMW]);
  const mix = useMemo(() => Object.entries(c.mix).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value), [c]);
  const rank = useMemo(() => Object.entries(DATA.c).sort((a, b) => b[1].smr - a[1].smr).findIndex(([k]) => k === sel) + 1, [sel]);
  const swot = useMemo(() => {
    const P = m.ph,
      U = URANIUM[sel] || 0,
      big = c.cap > 150000,
      tiny = c.cap < 10000;
    const topFuel = Object.entries(c.mix).sort((a, b) => b[1] - a[1])[0];
    return {
      S: [P <= 1 ? `${c.fossilShare}% fossil grid (${topFuel[0]} leads at ${(topFuel[1] / c.cap * 100).toFixed(0)}%) — substitution market intact` : `${(m.fossilNow / c.cap * 100).toFixed(1)}% fossil share remaining — ${gw(m.sfConv)} already displaced`, P === 0 ? `${num(c.smallF.n)} fossil units ≤300 MW (mean ${c.smallF.avg} MW) map 1:1 onto ${m.modMW} MWe modules` : `${m.sitesOnline} of ${c.sites.length} sites converted — replication proven in ${sel}`, c.nucCap > 0 ? `${c.nucPlants} operating nuclear plants (${gw(c.nucCap)}) — regulator and workforce already exist` : P <= 1 ? `Clean-sheet siting — no legacy nuclear liabilities to inherit` : `${gw(m.deployedMW)} of operating SMR — national nuclear competence now exists`, U > 0 ? `Domestic uranium production (~${U}% of world output) — fuel-cycle leverage in negotiations` : m.coastShare > 0.5 ? `${c.coastalN}/${c.sites.length} sites (${Math.round(m.coastShare * 100)}%) within 20 km of open water — seawater cooling everywhere` : `${gw(c.cap)} grid at ${sel}-scale absorbs ${m.modMW} MWe increments without stability studies`],
      W: [P === 0 ? c.nucCap === 0 ? `No nuclear regulator track record in ${sel} — licensing built from scratch` : `${sel}'s regulator is sized for GW-class, not modular licensing` : P === 1 ? "FOAK execution risk concentrated in the first units" : "Fleet-wide outage correlation — identical modules share fault modes", P <= 1 ? "FOAK cost premium on the first modules" : `Sunk capex of ${bn(m.capexM)} exposed to tariff renegotiation`, c.smallF.avg < 80 ? `Small fleet averages only ${c.smallF.avg} MW/unit — sub-module scale, many sites per GW` : `Small fleet averages ${c.smallF.avg} MW/unit — ${Math.ceil(c.smallF.avg / m.modMW * 10) / 10} modules per replaced unit`, U === 0 ? `No domestic uranium — ${sel} is fuel-import dependent under any vendor` : tiny ? `${gw(c.cap)} national grid — a single module is ${(m.modMW / c.cap * 100).toFixed(0)}% of system capacity, a dispatch risk` : P >= 3 ? `${gw(c.largeF.cap)} of large fossil remains untouched — out of SMR scope` : "Grid studies needed before retiring dispatchable fossil"],
      O: [`${m.co2Mt.toFixed(1)} Mt CO₂/yr avoided at ${year} (displacing a ${(c.sfCoal / Math.max(c.sfCap, 1) * 100).toFixed(0)}%-coal mix)`, m.fnpp ? `FNPP avoids land acquisition entirely — ${c.coastalN} mooring-viable sites, zero land take` : `Brownfield siting on ${c.sites.length} existing plots reuses switchyards and cooling`, c.oilCap > 300 ? `${gw(c.oilCap)} of oil/petcoke is ${sel}'s costliest generation — first economic target` : P <= 1 ? "BOO model: zero sovereign capex, pay only for electricity" : `${bn(m.marginM)}/yr margin funds fleet expansion`, P >= 2 ? `${num(m.jI)} indirect jobs — domestic supply-chain localisation window` : big ? `${gw(c.cap)} grid supports a domestic module supply chain, not just imports` : "Early local-content negotiation leverage"],
      T: [P <= 1 ? `Sanction exposure on vendor financing — ${sel} inherits third-party sanctions risk (§5 force majeure)` : "Vendor lock-in — fuel and O&M single-sourced to Rosatom for 30 years", P === 0 ? `Public acceptance risk in ${sel} before first concrete` : P <= 2 ? "Any FOAK incident halts the whole programme" : "Long-run SNF repatriation depends on continuing IGA goodwill", m.arch ? `${sel} is seismically and tsunami exposed — IAEA SSG-18 siting review is the gating item` : m.coastShare < 0.3 ? `Only ${Math.round(m.coastShare * 100)}% of sites are coastal — inland cooling water is the binding constraint` : "Water availability and cooling constraints at inland sites"]
    };
  }, [sel, year, m]);
  const engage = useMemo(() => [[["Consent-building before first concrete", "Open IAEA inspection rights (§2) are the anchor message against proliferation fears. Publish the safeguards agreement text."], ["Coastal community consultation", `Fisheries protection under the zero-discharge London Protocol commitment (§3) — brief all ${c.coastalN} coastal candidate communities before siting is announced.`], ["Scholarship intake", `First cohort to the Rosatom Technical Academy; ${sel} has no operating SMR crew yet.`], ["University track", "Establish chairs in reactor physics, marine nuclear law and grid integration."]], [["Construction-phase transparency", "Live dose monitoring published from the first module site; independent observers invited."], ["Local content negotiation", `${num(m.jC)} construction jobs live — bind local hiring quotas into the EPC contract now, not later.`], ["Crew qualification", "Operators returning from Akademik Lomonosov rotations must be licensed before fuel load."], ["Research output", "First joint papers on FNPP mooring and coastal siting under national conditions."]], [["Replication consent", `${m.sitesOnline} sites live — use the operating record, not promises, to win the next communities.`], ["Fisheries verification", "Independent water sampling around operating moorings validates the §3 zero-discharge claim publicly."], ["Workforce localisation", `${num(m.jO)} operations jobs — shift from expatriate to national crews as licences transfer.`], ["Curriculum embedding", "Nuclear engineering degree programmes feeding the fleet directly."]], [["Trust maintenance", `${m.sitesOnline} operating sites — publish annual safety and discharge data as routine, not on request.`], ["SNF repatriation visibility", `${m.snfT.toFixed(1)} t/yr leaves the country under Art. 27 — make each shipment publicly verified.`], ["National capability", `${num(m.jO + m.jI)} sustained jobs — the fleet is an employer now, not a project.`], ["Research maturity", "National institutes publishing independent fleet performance analysis."]], [["Institutional normality", "Nuclear is routine infrastructure — engagement moves from persuasion to reporting."], ["Decommissioning consent", "Begin the conversation on the 60-year handback and the pristine-coastline guarantee (§6)."], ["Export of competence", `${sel} crews and regulators can now advise other first-time host states.`], ["Research leadership", "National authorship on SMR siting and marine nuclear law."]]][m.ph], [sel, year, m]);
  const research = useMemo(() => [[["IAEA SSG-18", "Site evaluation for nuclear installations — coastal and seismic hazards. The governing document for your siting screen."], ["IAEA — Advances in SMR Technology Developments", "Biennial design catalogue. Cite for RITM-200 / KLT-40S specifications."], ["UNCLOS 1982, Arts. 17–32", "Innocent passage — the legal basis for §1 of the framework."], ["Joint Convention (1997), Arts. 4 & 27", "Spent fuel management and transboundary movement — the legal core of §3."]], [["OECD-NEA — SMR Dashboard", "Construction cost and schedule benchmarks for FOAK modules."], ["MIT Energy Initiative — The Future of Nuclear Energy in a Carbon-Constrained World", "The standard citation for FOAK cost premium and learning rates."], ["Akademik Lomonosov (Pevek) operating record", "The only commercial FNPP precedent — construction and commissioning lessons."], ["CPPNM 2005 Amendment", "Physical protection obligations underpinning §4's split perimeter."]], [["IAEA — Nuclear Power Reactors in the World (RDS-2)", "Fleet performance and capacity-factor benchmarks for your CF assumption."], ["OECD-NEA — Small Modular Reactors: Challenges and Opportunities", "Serial-production learning economics — supports the replication argument."], ["Vienna Convention on Civil Liability for Nuclear Damage", "Liability ceilings and pooling — the basis of §7."], ["WRI — Global Power Plant Database", "This model's data layer. Cite for all plant-level statistics."]], [["IAEA — Nuclear Power and Sustainable Development", "Long-run system-value framing for a mature fleet."], ["London Convention 1996 Protocol", "Zero-discharge obligation — the evidentiary basis for §3 claims."], ["IAEA INFCIRC safeguards implementation reports", "Track-record evidence for the safeguards argument."], ["Peer-reviewed fleet performance studies", "Independent verification of the operating record."]], [["IAEA — Decommissioning of Nuclear Installations", "Governs the 60-year handback and the pristine-coastline claim."], ["National regulatory annual reports", "Primary evidence of institutional maturity."], ["Comparative FNPP host-state studies", "Positions the country as precedent rather than follower."], ["WRI — Global Power Plant Database", "Baseline against which the whole transition is measured."]]][m.ph], [m.ph]);
  const pathway = useMemo(() => {
    const host = sel === "Indonesia" ? "BAPETEN" : `${sel}'s regulator`;
    return [[2026, "LEGISLATIVE", sel === "Indonesia" ? "Act 10/1997 Ch. IV amended — BAPETEN empowered to license a floating installation" : `${sel}'s nuclear act amended — regulator empowered for floating installations (Act 10/1997 precedent)`, "Rosatom files RITM-200 design certification under 170-FZ"], [2027, "SITE", `${host} issues site & mooring-zone licence · IAEA SSG-18 review of the first ${Math.min(3, c.sites.length)} coastal sites`, "IGA on SNF transit signed under Joint Convention Art. 27"], [2029, "CONSTRUCTION", `${host} issues construction licence · trilateral RU–${c.iso}–IAEA safeguards agreement in force`, "Hull laid down at Baltic Shipyard; fuel fabrication contracted"], [2031, "OPERATION", `${host} issues operating licence · first PPA power delivered · ${sel} assumes outer-perimeter security (§4)`, "Reactor compartment control and crew provision begin"], [2086, "HANDBACK", `${sel} keeps a pristine coastline — no radioactive legacy onshore (§6)`, "Vessel returns for defuelling and reprocessing"]];
  }, [sel, c]);
  const TABS = Object.entries(T.tabs);
  return React.createElement("div", {
    className: "min-h-screen bg-slate-950 text-slate-200",
    style: {
      fontFamily: "'Segoe UI',system-ui,sans-serif",
      backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,211,238,0.09), transparent)"
    }
  }, React.createElement("style", null, `
      @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      .unifi-rise{animation:rise .5s cubic-bezier(.22,.9,.3,1) both}
      @keyframes pg{0%,100%{opacity:1}50%{opacity:.75}} .unifi-glow{animation:pg 3.2s ease-in-out infinite}
      @keyframes bl{0%,100%{opacity:1}50%{opacity:.2}} .unifi-dot{animation:bl 1.4s infinite}
      @keyframes ping{0%{transform:scale(.7);opacity:.5}100%{transform:scale(1.5);opacity:0}}
      .unifi-ping{transform-origin:center;transform-box:fill-box;animation:ping 2.4s ease-out infinite}
      @media (prefers-reduced-motion:reduce){.unifi-rise,.unifi-glow,.unifi-dot,.unifi-ping{animation:none}}
      input[type=range]{accent-color:#22D3EE} select option{background:#0f172a}
    `), src && React.createElement(SourceModal, {
    onClose: () => setSrc(false),
    onDoc: setDoc,
    T: T
  }), doc && React.createElement(DocModal, {
    open: doc,
    onClose: () => setDoc(null),
    T: T
  }), React.createElement("div", {
    className: "max-w-6xl mx-auto px-5 pt-5 pb-16"
  }, React.createElement("div", {
    className: "flex flex-wrap items-end justify-between gap-4 pb-4"
  }, React.createElement("div", null, React.createElement("div", {
    className: "flex items-center gap-2 mb-1"
  }, React.createElement("span", {
    className: "w-2 h-2 rounded-full bg-cyan-400 unifi-dot"
  }), React.createElement("span", {
    className: "text-[10px] font-mono tracking-[0.28em] text-cyan-300"
  }, T.programBadge(c.iso))), React.createElement("h1", {
    className: "text-3xl font-extrabold tracking-tight text-white"
  }, "UNIFI ", React.createElement("span", {
    className: "text-cyan-400"
  }, T.brand2)), React.createElement("p", {
    className: "text-slate-400 text-xs mt-1"
  }, T.subtitle(sel), " ·", React.createElement("button", {
    onClick: () => setSrc(true),
    className: "ml-1.5 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 decoration-dotted"
  }, T.dataSources, " ⓘ"))), React.createElement("div", {
    className: "flex items-end gap-2"
  }, showLocaleSwitcher && React.createElement("div", null, React.createElement("div", {
    className: "text-[9px] font-mono tracking-widest text-slate-500 mb-1"
  }, "LANG"), React.createElement("div", {
    className: "flex gap-1"
  }, LOCALES.map(L => React.createElement("button", {
    key: L,
    onClick: () => {
      setLoc(L);
      onLocaleChange && onLocaleChange(L);
    },
    title: LOCALE_NAMES[L],
    className: `px-2 py-2 rounded-lg text-[10px] font-mono tracking-widest border transition-colors ${loc === L ? "bg-cyan-500/15 border-cyan-700 text-cyan-300" : "bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300"}`
  }, L.toUpperCase())))), React.createElement("div", null, React.createElement("div", {
    className: "text-[9px] font-mono tracking-widest text-slate-500 mb-1"
  }, T.analyzeCountry), React.createElement("select", {
    value: sel,
    onChange: e => setSel(e.target.value),
    className: "bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 outline-none focus:border-cyan-500 min-w-52"
  }, countries.map(k => React.createElement("option", {
    key: k
  }, k)))))), React.createElement("div", {
    className: "sticky top-14 z-30 -mx-5 px-5 py-3 bg-slate-950/92 backdrop-blur border-y border-slate-800 mb-4"
  }, React.createElement("div", {
    className: "flex flex-wrap items-center gap-x-5 gap-y-2"
  }, React.createElement("div", {
    className: "flex items-baseline gap-2"
  }, React.createElement("span", {
    className: "text-[9px] font-mono tracking-widest text-slate-500"
  }, T.deploymentYear), React.createElement("span", {
    className: "font-mono text-cyan-300 text-2xl font-extrabold tabular-nums"
  }, year)), React.createElement("input", {
    type: "range",
    min: 2026,
    max: 2045,
    value: year,
    onChange: e => {
      setLive(false);
      setYear(+e.target.value);
    },
    className: "flex-1 min-w-52"
  }), React.createElement("div", {
    className: "flex items-center gap-4 text-[10px] font-mono"
  }, React.createElement("span", {
    className: "text-slate-500"
  }, T.fleet, " ", React.createElement("span", {
    className: "text-slate-100 font-bold"
  }, Math.round(m.f * 100), "%")), React.createElement("span", {
    className: "text-slate-500"
  }, T.sites, " ", React.createElement("span", {
    className: "text-slate-100 font-bold"
  }, m.sitesOnline, "/", c.sites.length)), React.createElement("span", {
    className: "text-slate-500"
  }, T.online, " ", React.createElement("span", {
    className: "text-cyan-300 font-bold"
  }, gw(m.deployedMW))), React.createElement(Tag, {
    tone: m.f >= 0.98 ? "green" : "cyan"
  }, m.phase), React.createElement("button", {
    onClick: () => setLive(!live),
    className: `px-2.5 py-1 rounded-md tracking-widest border ${live ? "bg-cyan-950/60 border-cyan-700 text-cyan-300" : "bg-slate-900 border-slate-700 text-slate-400"}`
  }, live ? T.stop : T.play))), React.createElement("div", {
    className: "flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-slate-800/70"
  }, TABS.map(([k, t]) => React.createElement("button", {
    key: k,
    onClick: () => setTab(k),
    className: `px-2.5 py-1.5 rounded-lg text-[9.5px] font-mono tracking-widest transition-colors ${tab === k ? "bg-cyan-500/15 text-cyan-300 border border-cyan-700/60" : "text-slate-500 border border-transparent hover:text-slate-300 hover:bg-slate-900/60"}`
  }, t)))), tab === "overview" && React.createElement("div", {
    key: sel + "o",
    className: "space-y-4"
  }, React.createElement("div", {
    className: "grid md:grid-cols-3 gap-4"
  }, React.createElement(Card, {
    className: "flex items-center gap-3"
  }, React.createElement(Gauge, {
    score: c.smr,
    T: T
  }), React.createElement("div", null, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-slate-500"
  }, T.globalRank), React.createElement("div", {
    className: "text-2xl font-extrabold font-mono text-white"
  }, "#", rank, React.createElement("span", {
    className: "text-slate-600 text-sm"
  }, " /164")), React.createElement("div", {
    className: "text-[10px] text-slate-500 mt-2 leading-relaxed"
  }, T.scoreWeights))), React.createElement("div", {
    className: "md:col-span-2 grid grid-cols-2 gap-4"
  }, [[T.kpi.smrOnline, React.createElement(Count, {
    to: m.deployedMW,
    fmt: gw
  }), T.kpi.smrOnlineSub(year, gw(c.sfCap)), "text-cyan-300"], [T.kpi.fossilNow, React.createElement(Count, {
    to: m.fossilNow / c.cap * 100,
    fmt: v => v.toFixed(1) + "%"
  }), T.kpi.fossilNowSub(c.fossilShare), "text-amber-300"], [T.kpi.nuclearGrid, React.createElement(Count, {
    to: m.nucNow,
    fmt: gw
  }), T.kpi.nuclearGridSub(c.nucPlants), "text-cyan-100"], [T.kpi.sitesConverted, React.createElement(Count, {
    to: m.sitesOnline
  }), T.kpi.sitesConvertedSub(c.sites.length), "text-white"]].map(([l, v, s, col], i) => React.createElement(Card, {
    key: l,
    delay: i * 60
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-slate-500"
  }, l), React.createElement("div", {
    className: `text-2xl font-bold font-mono mt-1.5 ${col}`
  }, v), React.createElement("div", {
    className: "text-[10.5px] text-slate-500 mt-1"
  }, s))))), React.createElement("div", {
    className: "grid md:grid-cols-2 gap-4"
  }, React.createElement(Card, {
    delay: 100
  }, React.createElement(H, {
    k: T.mixTag,
    t: T.mixTitle,
    onInfo: () => setSrc(true)
  }), React.createElement("div", {
    className: "flex items-center gap-1"
  }, React.createElement(ResponsiveContainer, {
    width: "52%",
    height: 210
  }, React.createElement(PieChart, null, React.createElement(Pie, {
    data: mix,
    dataKey: "value",
    nameKey: "name",
    innerRadius: 40,
    outerRadius: 68,
    paddingAngle: 2,
    stroke: "#020617",
    label: e => e.value / c.cap >= 0.06 ? `${(e.value / c.cap * 100).toFixed(1)}%` : "",
    labelLine: false,
    style: {
      fontSize: 9,
      fontFamily: "ui-monospace,monospace"
    }
  }, mix.map(d => React.createElement(Cell, {
    key: d.name,
    fill: FC[d.name] || "#64748B"
  }))), React.createElement(Tooltip, {
    formatter: (v, n) => [`${(v / c.cap * 100).toFixed(1)}%`, n],
    contentStyle: tt,
    itemStyle: {
      color: "#e2e8f0"
    },
    labelStyle: {
      color: "#e2e8f0"
    }
  }))), React.createElement("div", {
    className: "text-[10.5px] font-mono space-y-1 flex-1"
  }, React.createElement("div", {
    className: "flex items-center gap-2 text-[8.5px] tracking-widest text-slate-600 pb-1 border-b border-slate-800"
  }, React.createElement("span", {
    className: "w-2.5"
  }), React.createElement("span", {
    className: "w-16"
  }, T.mixHeadFuel), React.createElement("span", {
    className: "w-12 text-right"
  }, T.mixHeadShare), React.createElement("span", {
    className: "text-right flex-1"
  }, T.mixHeadCap)), mix.slice(0, 8).map(d => React.createElement("div", {
    key: d.name,
    className: "flex items-center gap-2"
  }, React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-sm shrink-0",
    style: {
      background: FC[d.name] || "#64748B"
    }
  }), React.createElement("span", {
    className: "text-slate-400 w-16 truncate"
  }, d.name), React.createElement("span", {
    className: "text-slate-100 w-12 text-right font-bold"
  }, (d.value / c.cap * 100).toFixed(1), "%"), React.createElement("span", {
    className: "text-slate-500 text-right flex-1"
  }, gw(d.value)))), React.createElement("div", {
    className: "flex items-center gap-2 pt-1 border-t border-slate-800 text-slate-300"
  }, React.createElement("span", {
    className: "w-2.5"
  }), React.createElement("span", {
    className: "w-16"
  }, T.mixTotal), React.createElement("span", {
    className: "w-12 text-right font-bold"
  }, "100%"), React.createElement("span", {
    className: "text-right flex-1"
  }, gw(c.cap))))), React.createElement("div", {
    className: "text-[10px] text-slate-500 mt-2.5 leading-relaxed border-t border-slate-800 pt-2"
  }, "Percentages are each fuel's share of ", React.createElement("span", {
    className: "text-slate-300"
  }, "installed nameplate capacity in MW"), " — not of electricity generated, and not of demand. E.g. Coal ", ((c.mix.Coal || 0) / c.cap * 100).toFixed(1), "% means ", gw(c.mix.Coal || 0), " of ", sel, "'s ", gw(c.cap), " fleet is coal-fired. Wind and solar are under-represented in the source database (49.5% and 21.0% global coverage per WRI 2019); thermal and nuclear are near-complete.")), React.createElement(Card, {
    delay: 160
  }, React.createElement(H, {
    k: T.topPlantsTag,
    t: T.topPlants
  }), React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 195
  }, React.createElement(BarChart, {
    data: c.top.map(([n, f, cap]) => ({
      name: n.length > 24 ? n.slice(0, 24) + "…" : n,
      f,
      cap
    })),
    layout: "vertical",
    margin: {
      left: 4,
      right: 20
    }
  }, React.createElement(CartesianGrid, {
    stroke: "#1e293b",
    horizontal: false
  }), React.createElement(XAxis, {
    type: "number",
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(YAxis, {
    type: "category",
    dataKey: "name",
    width: 148,
    tick: {
      fill: "#94a3b8",
      fontSize: 10
    },
    stroke: "#1e293b"
  }), React.createElement(Tooltip, {
    formatter: v => gw(v),
    contentStyle: tt,
    cursor: {
      fill: "#0f172a"
    }
  }), React.createElement(Bar, {
    dataKey: "cap",
    radius: [0, 5, 5, 0]
  }, c.top.map(([n, f], i) => React.createElement(Cell, {
    key: i,
    fill: FC[f] || "#64748B"
  })))))))), tab === "map" && React.createElement("div", {
    key: sel + "m",
    className: "space-y-4"
  }, React.createElement(Card, null, React.createElement(H, {
    k: T.mapTag(m.sitesOnline, c.sites.length, year),
    t: T.mapTitle(sel),
    onInfo: () => setSrc(true)
  }), React.createElement(SiteMap, {
    m: m,
    sel: sel,
    T: T
  })), React.createElement("div", {
    className: "grid sm:grid-cols-4 gap-3"
  }, [[T.mapCards.candidates, c.sites.length, T.mapCards.candidatesSub], [T.mapCards.coastal, c.coastalN, T.mapCards.coastalSub], [T.mapCards.inland, c.sites.length - c.coastalN, T.mapCards.inlandSub], [T.mapCards.converted(year), m.sitesOnline, T.mapCards.convertedSub]].map(([l, v, s], i) => React.createElement(Card, {
    key: l,
    delay: i * 50
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-slate-500"
  }, l), React.createElement("div", {
    className: "text-2xl font-extrabold font-mono text-cyan-200 mt-1.5"
  }, React.createElement(Count, {
    to: v
  })), React.createElement("div", {
    className: "text-[10px] text-slate-500 mt-1"
  }, s)))), React.createElement(Card, null, React.createElement(H, {
    k: T.methodTag,
    t: T.methodTitle,
    onInfo: () => setSrc(true)
  }), React.createElement("p", {
    className: "text-[12.5px] text-slate-400 leading-relaxed"
  }, "Every marker is a real plant plotted at its recorded latitude and longitude. The coastline is drawn from a land/sea raster, and distance to open water is computed per site against that same raster — not estimated. Lakes come from Natural Earth's 1:50m inland-water layer, and each site carries its true nearest-lake name and distance (hover any marker). Sites within 20 km of open water are flagged viable for a moored floating unit under the UNCLOS classification in §1; the rest are land-based candidates on existing fossil plots that already hold grid connections, cooling-water rights and switchyards, so no new land acquisition is assumed. Conversion order is deterministic — capacity 50%, coastal access 30%, plant age 20% — and drives the map, the counters and the jobs curve alike."), React.createElement("div", {
    className: "text-[10px] font-mono text-slate-600 mt-3 leading-relaxed"
  }, "LIMITATIONS: COORDINATES EXIST FOR ", c.sites.length, " OF ", c.sfN, " SMALL FOSSIL UNITS IN ", sel.toUpperCase(), ". LAND RASTER IS COARSE (72×45 PER VIEW) — INDICATIVE COASTLINE, NOT A SURVEY. LAKES ARE 1:50m — SMALL RESERVOIRS ARE ABSENT. SEISMIC, BATHYMETRY AND EXCLUSION-ZONE SCREENING (IAEA SSG-18) IS NOT MODELLED HERE."))), tab === "fleet" && React.createElement("div", {
    key: sel + "f",
    className: "space-y-4"
  }, React.createElement(Card, null, React.createElement(H, {
    k: T.fleetLive(year),
    t: T.fleetTitle(sel),
    onInfo: () => setSrc(true)
  }), React.createElement("p", {
    className: "text-[12.5px] text-slate-400 leading-relaxed"
  }, "A ", m.modMW, " MWe module cannot economically replace a ", gw(c.large.avg), " station, and a ", gw(c.small.avg), " plant cannot justify a GW-class reactor. The dataset splits ", sel, "'s fleet cleanly at 300 MW. At ", year, ", ", React.createElement("span", {
    className: "text-cyan-300 font-mono"
  }, gw(m.sfConv)), " of the small fossil fleet has been converted to SMR while ", React.createElement("span", {
    className: "text-amber-300 font-mono"
  }, gw(c.largeF.cap)), " of large fossil remains untouched — structurally out of modular scope.")), React.createElement(Card, {
    className: "p-0 overflow-x-auto"
  }, React.createElement("div", {
    className: "grid grid-cols-[1.4fr_1fr_1fr_0.75fr] min-w-[560px]"
  }, React.createElement("div", {
    className: "p-3 border-b border-slate-800 bg-slate-950/60"
  }, React.createElement("span", {
    className: "text-[9px] font-mono tracking-widest text-slate-600"
  }, T.col.metric)), React.createElement("div", {
    className: "p-3 border-b border-l border-slate-800 bg-cyan-950/25 text-center"
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-cyan-300"
  }, T.col.small), React.createElement("div", {
    className: "text-[9px] text-slate-500 font-mono"
  }, T.col.smallSub)), React.createElement("div", {
    className: "p-3 border-b border-l border-slate-800 bg-amber-950/20 text-center"
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-amber-300"
  }, T.col.large), React.createElement("div", {
    className: "text-[9px] text-slate-500 font-mono"
  }, T.col.largeSub)), React.createElement("div", {
    className: "p-3 border-b border-l border-slate-800 bg-slate-950/60 text-center"
  }, React.createElement("span", {
    className: "text-[9px] font-mono tracking-widest text-slate-600"
  }, T.col.ratio)), [["Units (all fuels)", num(c.small.n), num(c.large.n), (c.small.n / Math.max(c.large.n, 1)).toFixed(1) + "×"], ["Capacity (all fuels)", gw(c.small.cap), gw(c.large.cap), (c.small.cap / Math.max(c.large.cap, 1)).toFixed(2) + "×"], ["Share of national capacity", (c.small.cap / c.cap * 100).toFixed(1) + "%", (c.large.cap / c.cap * 100).toFixed(1) + "%", "—"], ["Distinct sites", num(c.small.sites), num(c.large.sites), (c.small.sites / Math.max(c.large.sites, 1)).toFixed(1) + "×"], ["Mean unit size", gw(c.small.avg), gw(c.large.avg), (c.small.avg / Math.max(c.large.avg, 1)).toFixed(2) + "×"], ["Median unit size", gw(c.small.med), gw(c.large.med), (c.small.med / Math.max(c.large.med, 1)).toFixed(2) + "×"], ["Mean fleet age", c.small.age !== null ? c.small.age + " yrs" : "n/a", c.large.age !== null ? c.large.age + " yrs" : "n/a", "—"], ["Fossil units", num(c.smallF.n), num(c.largeF.n), (c.smallF.n / Math.max(c.largeF.n, 1)).toFixed(1) + "×"], ["Fossil capacity", gw(c.smallF.cap), gw(c.largeF.cap), (c.smallF.cap / Math.max(c.largeF.cap, 1)).toFixed(2) + "×"], ["SMR-CONVERTED @ " + year, gw(m.sfConv), "0 MW", "—", 1], ["FOSSIL REMAINING @ " + year, gw(m.sfRemain), gw(c.largeF.cap), "—", 1], ["MODULES @ " + year, num(m.modules * m.f) + " / " + num(m.modules), "n/a — GW-class", "—", 1], ["SITES CONVERTED @ " + year, m.sitesOnline + " / " + c.sites.length, "0 / " + num(c.large.sites), "—", 1]].map(([k, s, l, d, hot]) => React.createElement(React.Fragment, {
    key: k
  }, React.createElement("div", {
    className: `p-2.5 border-b border-slate-800/70 text-[11.5px] ${hot ? "text-slate-200 font-semibold" : "text-slate-500"}`
  }, k), React.createElement("div", {
    className: `p-2.5 border-b border-l border-slate-800/70 text-center font-mono text-[12px] font-bold ${hot ? "text-cyan-300 bg-cyan-950/20" : "text-slate-100"}`
  }, s), React.createElement("div", {
    className: `p-2.5 border-b border-l border-slate-800/70 text-center font-mono text-[12px] font-bold ${hot ? "text-amber-300 bg-amber-950/15" : "text-slate-100"}`
  }, l), React.createElement("div", {
    className: "p-2.5 border-b border-l border-slate-800/70 text-center font-mono text-[11px] text-slate-500"
  }, d))))), React.createElement("div", {
    className: "grid md:grid-cols-2 gap-4"
  }, React.createElement(Card, null, React.createElement(H, {
    k: T.asymTag,
    t: T.asym
  }), React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 200
  }, React.createElement(BarChart, {
    data: [{
      k: "Units",
      Small: c.small.n,
      Large: c.large.n
    }, {
      k: "Capacity (GW)",
      Small: +(c.small.cap / 1000).toFixed(1),
      Large: +(c.large.cap / 1000).toFixed(1)
    }, {
      k: "Sites",
      Small: c.small.sites,
      Large: c.large.sites
    }],
    margin: {
      left: 4
    }
  }, React.createElement(CartesianGrid, {
    stroke: "#1e293b",
    vertical: false
  }), React.createElement(XAxis, {
    dataKey: "k",
    tick: {
      fill: "#94a3b8",
      fontSize: 11
    },
    stroke: "#1e293b"
  }), React.createElement(YAxis, {
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(Tooltip, {
    contentStyle: tt,
    cursor: {
      fill: "#0f172a"
    }
  }), React.createElement(Legend, {
    wrapperStyle: {
      fontSize: 11,
      fontFamily: "monospace"
    }
  }), React.createElement(Bar, {
    dataKey: "Small",
    fill: "#22D3EE",
    radius: [5, 5, 0, 0]
  }), React.createElement(Bar, {
    dataKey: "Large",
    fill: "#F59E0B",
    radius: [5, 5, 0, 0]
  }))), React.createElement("p", {
    className: "text-[11px] text-slate-500 mt-2"
  }, "Many small units, modest capacity — the profile modular reactors exist for: serial production beats bespoke engineering when the same unit repeats ", num(c.small.n), " times.")), React.createElement(Card, {
    delay: 70
  }, React.createElement(H, {
    k: T.fleetLive(year),
    t: T.convTitle
  }), React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 200
  }, React.createElement(AreaChart, {
    data: Array.from({
      length: 20
    }, (_, i) => {
      const y = 2026 + i,
        f = dep(y);
      return {
        year: y,
        "SMR": Math.round(c.smallF.cap * f),
        "Small fossil left": Math.round(c.smallF.cap * (1 - f)),
        "Large fossil": Math.round(c.largeF.cap)
      };
    }),
    margin: {
      left: 4
    }
  }, React.createElement(CartesianGrid, {
    stroke: "#1e293b",
    vertical: false
  }), React.createElement(XAxis, {
    dataKey: "year",
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(YAxis, {
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(Tooltip, {
    contentStyle: tt,
    formatter: v => gw(v)
  }), React.createElement(Legend, {
    wrapperStyle: {
      fontSize: 10,
      fontFamily: "monospace"
    }
  }), React.createElement(Area, {
    type: "monotone",
    dataKey: "SMR",
    stackId: "1",
    stroke: "#22D3EE",
    fill: "#22D3EE",
    fillOpacity: 0.35
  }), React.createElement(Area, {
    type: "monotone",
    dataKey: "Small fossil left",
    stackId: "1",
    stroke: "#FB923C",
    fill: "#FB923C",
    fillOpacity: 0.25
  }), React.createElement(Area, {
    type: "monotone",
    dataKey: "Large fossil",
    stroke: "#F59E0B",
    fill: "none",
    strokeDasharray: "4 3",
    strokeWidth: 2
  }))), React.createElement("p", {
    className: "text-[11px] text-slate-500 mt-2"
  }, "The large fleet (dashed) never moves — that is the point. SMRs address ", (c.smallF.cap / Math.max(c.smallF.cap + c.largeF.cap, 1) * 100).toFixed(0), "% of ", sel, "'s fossil capacity.")))), tab === "predict" && React.createElement("div", {
    key: sel + "p",
    className: "space-y-4"
  }, React.createElement("div", {
    className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
  }, [["Coal capacity", gw(c.coalCap), gw(m.coalAfter), `−${gw(c.coalCap - m.coalAfter)} retired via SMR substitution`, 1], ["Clean electricity supply", num(m.baseGen) + " GWh", num(m.baseGen + m.smrGen) + " GWh", `+${num(m.smrGen)} GWh/yr nuclear @ 90% CF`, 0], ["Annual waste stream", num(m.ashBase) + " t coal ash", num(m.ashBase - m.ashAvoid) + " t ash + " + m.snfT.toFixed(1) + " t SNF", "SNF returns to RF under Art. 27 — none stays onshore", 1], ["Generation sites", `${c.sites.length} fossil`, `${c.sites.length - m.sitesOnline} fossil + ${m.sitesOnline} SMR`, m.fnpp ? "moored FNPP — no land acquisition" : "brownfield — existing grid reused", 1]].map(([l, b, a, u, good]) => React.createElement("div", {
    key: l,
    className: "bg-slate-950/60 border border-slate-800 rounded-xl p-4"
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2"
  }, l), React.createElement("div", {
    className: "flex items-center gap-3"
  }, React.createElement("div", {
    className: "flex-1"
  }, React.createElement("div", {
    className: "text-[9px] font-mono text-slate-500"
  }, "2026"), React.createElement("div", {
    className: "text-slate-400 font-mono text-base font-bold"
  }, b)), React.createElement("div", {
    className: "text-cyan-400"
  }, "→"), React.createElement("div", {
    className: "flex-1"
  }, React.createElement("div", {
    className: "text-[9px] font-mono text-slate-500"
  }, year), React.createElement("div", {
    className: `font-mono text-base font-bold ${good ? "text-emerald-300" : "text-cyan-300"}`
  }, a))), React.createElement("div", {
    className: "text-[10px] text-slate-500 mt-1.5"
  }, u)))), React.createElement(Card, null, React.createElement(H, {
    k: "S-CURVE ROLLOUT · 2026–2045",
    t: `Demand, SMR output and coal capacity — ${sel}`
  }), React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 270
  }, React.createElement(AreaChart, {
    data: series,
    margin: {
      left: 4,
      right: 8
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: "gd",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#334155",
    stopOpacity: 0.5
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#334155",
    stopOpacity: 0
  })), React.createElement("linearGradient", {
    id: "gs",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#22D3EE",
    stopOpacity: 0.65
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#22D3EE",
    stopOpacity: 0
  }))), React.createElement(CartesianGrid, {
    stroke: "#1e293b",
    vertical: false
  }), React.createElement(XAxis, {
    dataKey: "year",
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(YAxis, {
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(Tooltip, {
    contentStyle: tt,
    formatter: (v, n) => n === "Coal capacity (MW)" ? gw(v) : num(v) + " GWh"
  }), React.createElement(Legend, {
    wrapperStyle: {
      fontSize: 11,
      fontFamily: "monospace"
    }
  }), React.createElement(Area, {
    type: "monotone",
    dataKey: "Demand",
    stroke: "#64748B",
    fill: "url(#gd)",
    strokeWidth: 1.5,
    name: `Projected demand (+${(m.g * 100).toFixed(1)}%/yr)`
  }), React.createElement(Area, {
    type: "monotone",
    dataKey: "SMR",
    stroke: "#22D3EE",
    fill: "url(#gs)",
    strokeWidth: 2.5,
    name: "SMR output (GWh/yr)"
  }), React.createElement(Area, {
    type: "monotone",
    dataKey: "Coal",
    stroke: "#F59E0B",
    fill: "none",
    strokeWidth: 2,
    strokeDasharray: "4 3",
    name: "Coal capacity (MW)"
  })))), React.createElement("div", {
    className: "grid md:grid-cols-3 gap-4"
  }, [["CO₂ AVOIDED", React.createElement(Count, {
    to: m.co2Mt,
    fmt: v => v.toFixed(1)
  }), "Mt/yr", `weighted by displaced mix (${(c.sfCoal / Math.max(c.sfCap, 1) * 100).toFixed(0)}% coal)`, "text-emerald-300"], ["MODULES COMMISSIONED", React.createElement(Count, {
    to: m.modules * m.f
  }), `of ${num(m.modules)}`, `${m.modMW} MWe reference module`, "text-cyan-300"], ["GRID COVERAGE", React.createElement(Count, {
    to: m.smrGen / Math.max(m.demand(year), 1) * 100,
    fmt: v => v.toFixed(1) + "%"
  }), "of demand", "share of projected national demand met by SMR", "text-white"]].map(([l, v, u, s, col], i) => React.createElement(Card, {
    key: l,
    delay: i * 60
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-slate-500"
  }, l, " @ ", year), React.createElement("div", {
    className: `text-3xl font-extrabold font-mono mt-2 ${col}`
  }, v, " ", React.createElement("span", {
    className: "text-sm text-slate-500"
  }, u)), React.createElement("div", {
    className: "text-[11px] text-slate-500 mt-2"
  }, s))))), tab === "econ" && React.createElement("div", {
    key: sel + "e",
    className: "space-y-4"
  }, React.createElement("div", {
    className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
  }, [[T.ec.capex, React.createElement(Count, {
    to: m.capexM,
    fmt: bn
  }), T.ec.capexSub(year, bn(m.capexFull)), "text-white"], [T.ec.margin, React.createElement(Count, {
    to: m.marginM,
    fmt: bn
  }), T.ec.marginSub(A.tariff, A.genCost), "text-cyan-300"], [T.ec.payback, m.payback.toFixed(1) + " " + T.u.yrs, T.ec.paybackSub, "text-emerald-300"], [T.ec.roi, Math.round(m.roi30) + "%", T.ec.roiSub, "text-emerald-300"]].map(([l, v, s, col], i) => React.createElement(Card, {
    key: l,
    delay: i * 55
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-slate-500"
  }, l), React.createElement("div", {
    className: `text-2xl font-extrabold font-mono mt-2 ${col}`
  }, v), React.createElement("div", {
    className: "text-[10.5px] text-slate-500 mt-1.5"
  }, s)))), React.createElement("div", {
    className: "grid md:grid-cols-2 gap-4"
  }, React.createElement(Card, null, React.createElement(H, {
    k: T.ec.booTag,
    t: T.ec.booTitle(sel),
    onInfo: () => setDoc("§5")
  }), React.createElement("div", {
    className: "grid grid-cols-2 gap-2.5 mb-3"
  }, React.createElement("div", {
    className: "bg-blue-950/25 border border-blue-900/50 rounded-xl p-3"
  }, React.createElement("div", {
    className: "text-[9px] font-mono tracking-widest text-blue-400 mb-2"
  }, "RUS · ROSATOM CARRIES"), React.createElement("ul", {
    className: "text-[11px] text-slate-400 space-y-1.5"
  }, [["Capex", bn(m.capexFull)], ["Plant ownership", "perpetual"], ["Fuel ownership", "perpetual"], ["SNF liability", "repatriated"], ["Operator liability", "RNIP primary layer"], ["Sanctions risk", "force majeure"]].map(([k, v]) => React.createElement("li", {
    key: k,
    className: "flex justify-between gap-2"
  }, React.createElement("span", null, k), React.createElement("span", {
    className: "text-slate-200 font-mono text-[10.5px]"
  }, v))))), React.createElement("div", {
    className: "bg-cyan-950/25 border border-cyan-900/50 rounded-xl p-3"
  }, React.createElement("div", {
    className: "text-[9px] font-mono tracking-widest text-cyan-400 mb-2"
  }, c.iso, " · ", sel.toUpperCase().slice(0, 10), " CARRIES"), React.createElement("ul", {
    className: "text-[11px] text-slate-400 space-y-1.5"
  }, [["Capex", "$0 — none"], ["Sovereign debt", "none"], ["Fissile-material law", "not required"], ["Payment", `$${A.tariff}/MWh`], ["Annual bill @ " + year, bn(m.deployedMW * 8760 * A.cf * A.tariff / 1e6)], ["Outer-perimeter security", "yes (§4)"]].map(([k, v]) => React.createElement("li", {
    key: k,
    className: "flex justify-between gap-2"
  }, React.createElement("span", null, k), React.createElement("span", {
    className: "text-slate-200 font-mono text-[10.5px]"
  }, v)))))), React.createElement("div", {
    className: "space-y-1.5"
  }, [["CORE FORMULA", `Property rights to the plant and ownership of the fuel remain strictly with the Russian Federation. ${sel} acts exclusively as a purchaser of services — electricity. This waives the need to adopt domestic legislation on ownership of fissionable materials.`, "§5"], ["OFFTAKE", `Fixed-price 30-year PPA with the state utility of ${sel}${sel === "Indonesia" ? " (PLN)" : " — PLN reference template"}. Revenue certainty is what makes the ${m.payback.toFixed(1)}-yr payback bankable.`, "§5"], ["DISPUTES", `Neutral arbitration at SIAC. Force majeure is defined to include naval blockades, volcanic eruptions and third-party sanctions.`, "§5"], ["LIABILITY CAP", `Vienna Convention ceilings, pooled between the Russian Nuclear Insurance Pool and ${sel}'s national pool — compensation without litigation, state budget shielded.`, "§7"]].map(([h, b, ref]) => React.createElement("button", {
    key: h,
    onClick: () => setDoc(ref),
    className: "w-full text-left bg-slate-950/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-800 rounded-lg p-2.5 transition-colors group"
  }, React.createElement("div", {
    className: "flex items-center justify-between gap-2 mb-1"
  }, React.createElement("span", {
    className: "text-[9px] font-mono tracking-widest text-slate-500"
  }, h), React.createElement("span", {
    className: "text-[9px] font-mono text-slate-600 group-hover:text-cyan-400"
  }, ref, " →")), React.createElement("p", {
    className: "text-[11.5px] text-slate-400 leading-relaxed"
  }, b))))), React.createElement(Card, {
    delay: 70
  }, React.createElement(H, {
    k: T.ec.cashTag(year),
    t: T.ec.cash
  }), React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 205
  }, React.createElement(BarChart, {
    data: [{
      k: "Revenue",
      v: Math.round(m.deployedMW * 8760 * A.cf * A.tariff / 1e6)
    }, {
      k: "Gen cost",
      v: Math.round(m.deployedMW * 8760 * A.cf * A.genCost / 1e6)
    }, {
      k: "Net margin",
      v: Math.round(m.marginM)
    }],
    margin: {
      left: 6
    }
  }, React.createElement(CartesianGrid, {
    stroke: "#1e293b",
    vertical: false
  }), React.createElement(XAxis, {
    dataKey: "k",
    tick: {
      fill: "#94a3b8",
      fontSize: 11
    },
    stroke: "#1e293b"
  }), React.createElement(YAxis, {
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(Tooltip, {
    contentStyle: tt,
    cursor: {
      fill: "#0f172a"
    },
    formatter: v => bn(v)
  }), React.createElement(Bar, {
    dataKey: "v",
    radius: [6, 6, 0, 0]
  }, React.createElement(Cell, {
    fill: "#22D3EE"
  }), React.createElement(Cell, {
    fill: "#F59E0B"
  }), React.createElement(Cell, {
    fill: "#4ADE80"
  })))))), React.createElement("div", {
    className: "text-[10px] font-mono text-slate-600"
  }, "SCREENING ASSUMPTIONS — TARIFF $", A.tariff, "/MWh · GEN COST $", A.genCost, "/MWh · CAPEX $", m.fnpp ? A.capexFNPP : A.capexLand, "/kW · CF ", A.cf * 100, "%. NOT AN INVESTMENT RATING.")), tab === "supply" && React.createElement("div", {
    key: sel + "s",
    className: "space-y-4"
  }, React.createElement(Card, {
    className: "border-cyan-800/50"
  }, React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-3"
  }, React.createElement("div", null, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-cyan-400 mb-1"
  }, "RECOMMENDED SUPPLY ARCHITECTURE — ", sel.toUpperCase()), React.createElement("div", {
    className: "text-2xl font-extrabold text-white"
  }, m.fnpp ? T.sp.fnppArch : c.cap > 150000 ? T.sp.hybridArch : T.sp.landArch)), React.createElement(Tag, {
    tone: m.fnpp ? "cyan" : "green"
  }, m.fnpp ? T.sp.maritime : T.sp.terrestrial)), React.createElement("p", {
    className: "text-[13px] text-slate-400 mt-3 leading-relaxed"
  }, m.fnpp ? React.createElement(React.Fragment, null, "The model selects a floating configuration: ", c.coastalN, " of ", c.sites.length, " candidate sites (", Math.round(m.coastShare * 100), "%) sit within 20 km of open water. ", m.arch && "Archipelagic geography fragments the grid into island systems too small for GW-class units. ", c.oilCap > 300 && `${gw(c.oilCap)} of high-cost oil generation is the first economic substitution target. `, "With no land-based nuclear precedent, a moored FNPP under the UNCLOS \"non-self-propelled floating structure\" classification (§1) is the fastest licensable path — site licensing shrinks to the mooring zone.") : React.createElement(React.Fragment, null, "The model selects land-based modules: only ", Math.round(m.coastShare * 100), "% of candidate sites are coastal, and grid scale of ", gw(c.cap), " ", c.nucCap > 0 ? `with an existing nuclear fleet (${gw(c.nucCap)}) and a functioning regulator makes` : "favors", " brownfield SMR siting on retiring fossil plots, reusing switchyards and cooling infrastructure."))), React.createElement("div", {
    className: "grid md:grid-cols-3 gap-4"
  }, React.createElement(Card, null, React.createElement(H, {
    t: T.sp.sizing(year),
    k: T.sp.live
  }), React.createElement("div", {
    className: "space-y-2.5 text-[12px] font-mono"
  }, [["Reference module", m.modMW + " MWe"], ["Modules commissioned", num(m.modules * m.f) + " / " + num(m.modules)], ["Sites converted", m.sitesOnline + " / " + c.sites.length], ["SMR capacity online", gw(m.deployedMW)], ["Fossil units replaced", num(c.sfN * m.f)]].map(([k, v]) => React.createElement("div", {
    key: k,
    className: "flex justify-between border-b border-slate-800/60 pb-1.5"
  }, React.createElement("span", {
    className: "text-slate-500"
  }, k), React.createElement("span", {
    className: "text-slate-100 font-bold"
  }, v))))), React.createElement(Card, {
    delay: 70,
    className: "md:col-span-2"
  }, React.createElement(H, {
    t: T.sp.procTitle(sel),
    k: T.sp.procTag,
    onInfo: () => setSrc(true)
  }), React.createElement("div", {
    className: "grid sm:grid-cols-2 gap-3"
  }, React.createElement("div", {
    className: "bg-slate-950/60 border border-slate-800 rounded-xl p-3"
  }, React.createElement("div", {
    className: "text-[9px] font-mono tracking-widest text-cyan-400 mb-1.5"
  }, sel.toUpperCase(), " — DOMESTIC POSITION"), URANIUM[sel] ? React.createElement("p", {
    className: "text-[11.5px] text-slate-400 leading-relaxed"
  }, sel, " produces roughly ", React.createElement("span", {
    className: "text-cyan-300 font-mono"
  }, URANIUM[sel], "%"), " of world uranium. That is real negotiating leverage: fuel supply can be traded against tariff, local content or enrichment-services terms rather than accepted as a package.") : React.createElement("p", {
    className: "text-[11.5px] text-slate-400 leading-relaxed"
  }, sel, " has ", React.createElement("span", {
    className: "text-amber-300"
  }, "no significant uranium production"), ". Under any vendor the fuel is imported — which is precisely why the BOO structure matters here: Russia owns the fuel, so ", sel, " never procures, stores or legislates for fissile material at all (§5)."), React.createElement("div", {
    className: "text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800 leading-relaxed"
  }, "Top producers (share of world output): ", Object.entries(URANIUM).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${v}%`).join(" · "), ". Source: World Nuclear Association.")), React.createElement("div", {
    className: "bg-slate-950/60 border border-slate-800 rounded-xl p-3"
  }, React.createElement("div", {
    className: "text-[9px] font-mono tracking-widest text-blue-400 mb-1.5"
  }, "WHAT ", sel.toUpperCase(), " ACTUALLY BUYS"), React.createElement("ul", {
    className: "text-[11.5px] text-slate-400 space-y-1.5 leading-relaxed"
  }, React.createElement("li", null, React.createElement("span", {
    className: "text-slate-200"
  }, "Electricity only"), " — ", bn(m.deployedMW * 8760 * A.cf * A.tariff / 1e6), "/yr at ", year, " under the PPA."), React.createElement("li", null, React.createElement("span", {
    className: "text-slate-200"
  }, "Not procured:"), " uranium, fuel fabrication, enrichment, reactor pressure vessels, SNF storage."), React.createElement("li", null, React.createElement("span", {
    className: "text-slate-200"
  }, "Procured locally:"), " marine works, mooring mole, grid connection, outer-perimeter security, low-level waste disposal (§4, §6)."), React.createElement("li", null, React.createElement("span", {
    className: "text-slate-200"
  }, "Fuel-cycle exposure:"), " ", URANIUM[sel] ? "partial — domestic ore could feed a future national cycle." : "zero — the fuel never enters national jurisdiction.")))))), React.createElement(Card, null, React.createElement(H, {
    t: T.sp.vendorTitle,
    k: T.sp.vendorTag,
    onInfo: () => setSrc(true)
  }), React.createElement("div", {
    className: "overflow-x-auto"
  }, React.createElement("div", {
    className: "grid grid-cols-[1.1fr_1.1fr_1.3fr_1fr_1.7fr] min-w-[720px] text-[11px]"
  }, ["VENDOR", "DESIGN", "PROGRAMME STATUS", "BOO OFFERED?", "ASSESSMENT FOR " + sel.toUpperCase()].map(h => React.createElement("div", {
    key: h,
    className: "p-2.5 border-b border-slate-800 bg-slate-950/60 text-[8.5px] font-mono tracking-widest text-slate-500"
  }, h)), VENDORS.map(([v, d, s, boo, note, pick]) => React.createElement(React.Fragment, {
    key: v
  }, React.createElement("div", {
    className: `p-2.5 border-b border-slate-800/70 font-semibold ${pick ? "text-cyan-300" : "text-slate-300"}`
  }, pick ? "▸ " : "", v), React.createElement("div", {
    className: "p-2.5 border-b border-l border-slate-800/70 font-mono text-slate-400"
  }, d), React.createElement("div", {
    className: "p-2.5 border-b border-l border-slate-800/70 text-slate-400"
  }, s), React.createElement("div", {
    className: `p-2.5 border-b border-l border-slate-800/70 font-mono ${boo.startsWith("Yes") ? "text-emerald-300" : "text-slate-500"}`
  }, boo), React.createElement("div", {
    className: "p-2.5 border-b border-l border-slate-800/70 text-slate-500 leading-snug"
  }, note))))), React.createElement("div", {
    className: "text-[11.5px] text-slate-400 leading-relaxed mt-3 bg-slate-950/50 border border-slate-800 rounded-xl p-3"
  }, React.createElement("span", {
    className: "text-slate-200 font-semibold"
  }, "Why the cheapest sticker price is not the cheapest deal for ", sel, ":"), " every non-Rosatom vendor sells ", React.createElement("span", {
    className: "text-slate-300"
  }, "equipment"), ". The buyer then carries the capex (", bn(m.capexFull), " here), arranges project finance, licenses a first-of-a-kind design, and — critically — owns the spent fuel forever, since no other vendor offers take-back. Rosatom is the only supplier on this list offering Build-Own-Operate with fuel repatriation, which is what reduces ", sel, "'s cash cost to a per-MWh tariff and its waste liability to sealed low-level drums (§3, §5).", URANIUM[sel] ? " With domestic uranium, a split structure — foreign equipment plus national fuel — becomes worth pricing as an alternative." : ""), React.createElement("div", {
    className: "text-[10px] font-mono text-slate-600 mt-2.5 leading-relaxed"
  }, "NO SMR VENDOR PUBLISHES FIRM UNIT PRICING. THE $", m.fnpp ? A.capexFNPP : A.capexLand, "/kW USED HERE IS A SINGLE STATED ASSUMPTION APPLIED UNIFORMLY — THIS TABLE COMPARES PROGRAMME MATURITY AND CONTRACT STRUCTURE, NOT PRICE."))), tab === "reg" && React.createElement("div", {
    key: sel + "r",
    className: "space-y-4"
  }, React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-2"
  }, React.createElement("div", {
    className: "text-[11px] text-slate-500 font-mono tracking-wide flex items-center gap-2"
  }, "COMPLIANCE FRAMEWORK APPLIED TO: ", React.createElement("span", {
    className: "text-cyan-300"
  }, sel.toUpperCase()), sel !== "Indonesia" && React.createElement("span", {
    className: "text-slate-600"
  }, "(INDONESIA REFERENCE TEMPLATE)"), React.createElement("button", {
    onClick: () => setDoc("all"),
    className: "text-[9px] font-mono tracking-widest text-cyan-400 hover:text-cyan-300 border border-cyan-900 hover:border-cyan-700 rounded px-2 py-0.5"
  }, T.rg.openDoc)), React.createElement(Tag, {
    tone: m.f >= 0.98 ? "green" : "cyan"
  }, T.rg.phaseAt(year, m.phase))), React.createElement("div", {
    className: "grid md:grid-cols-2 gap-4"
  }, [["§1 · MARITIME STATUS", "UNCLOS 1982 classification", `FNPP in the territorial sea is a non-self-propelled moored structure, legally a "nuclear installation"; oversight sits with ${sel === "Indonesia" ? "BAPETEN" : "the national nuclear regulator"}, not the marine register.`, "Retains flag-state and design authority; tows through third-party EEZs under innocent passage.", 0], ["§2 · IAEA SAFEGUARDS", `Trilateral RU–${c.iso}–IAEA framework`, `Hosts on-board inspections in its waters; operates the early-notification channel to ${sel === "Indonesia" ? "Singapore, Malaysia and Australia" : "neighbouring coastal states"}.`, "Accounts for all nuclear material under the NPT; certifies RITM/KLT to the Convention on Nuclear Safety.", 0], ["§3 · BACK-END / WASTE", "Joint Convention Art. 4 & 27", `Receives only sealed low-level drums for near-surface disposal${sel === "Indonesia" ? " (GR 61/2013)" : ""}; no spent fuel onshore, ever.`, `Takes back ${m.snfT.toFixed(1)} t SNF/yr at ${year} under the transit IGA; classifies it as reprocessing feedstock, lawful under 170-FZ.`, 1], ["§4 · SECURITY & CYBER", "CPPNM 2005 + counter-terror conventions", `Outer perimeter across ${m.sitesOnline} live site${m.sitesOnline === 1 ? "" : "s"}: marine zone, protective mole, air defence, anti-diver defence.`, "Inner perimeter: reactor compartment access control; mandates the air-gapped I&C system.", 1], ["§5 · BUSINESS MODEL", "BOO + 30-yr PPA", `Purchaser of services only; the state utility bills ${bn(m.deployedMW * 8760 * A.cf * A.tariff / 1e6)}/yr at ${year}. No fissile-ownership legislation required.`, `Owns plant and fuel; carries ${bn(m.capexM)} of capex deployed to date; disputes → SIAC.`, 1], ["§6 · NATIONAL LAW SYNC", sel === "Indonesia" ? "Act 10/1997 · 170-FZ · 190-FZ" : `${sel} act adaptation · 170-FZ · 190-FZ`, sel === "Indonesia" ? "Ch. IV amendment lets BAPETEN license a floating, not land-based, installation (slated 2026)." : `The nuclear act needs an amendment empowering the regulator to license a floating installation, on the Indonesian Act 10/1997 precedent.`, "The import ban on foreign radioactive waste is cleared by classifying returned SNF as raw material for reprocessing.", 2], ["§7 · CIVIL LIABILITY", "Vienna Convention", `National insurance pool carries its defined share; the state budget is shielded across ${m.sitesOnline} insured site${m.sitesOnline === 1 ? "" : "s"}.`, "Operator liability sits with Rosatom; the Russian Nuclear Insurance Pool carries the primary layer.", 0]].map(([tag, title, hostTxt, ruTxt, gate], i) => {
    const status = gate === 2 ? m.ph >= 1 ? "RESOLVED" : "IN PROGRESS" : gate === 1 ? m.ph >= 2 ? "ACTIVE" : m.ph >= 1 ? "IN FORCE" : "PENDING" : m.ph >= 1 ? "IN FORCE" : "FRAMEWORK SET";
    const tone = status === "RESOLVED" || status === "ACTIVE" ? "green" : status === "IN FORCE" ? "cyan" : status === "PENDING" ? "slate" : "amber";
    const ref = tag.split(" ")[0];
    return React.createElement(Card, {
      key: tag,
      delay: i * 45,
      className: "hover:border-cyan-800/70 transition-colors"
    }, React.createElement("div", {
      className: "flex items-center justify-between mb-2 gap-2"
    }, React.createElement("button", {
      onClick: () => setDoc(ref),
      className: "text-[10px] font-mono tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
    }, tag, " ", React.createElement("span", {
      className: "text-slate-700"
    }, "↗")), React.createElement(Tag, {
      tone: tone
    }, status, " @ ", year)), React.createElement("button", {
      onClick: () => setDoc(ref),
      className: "text-left w-full text-slate-100 hover:text-cyan-300 font-semibold text-[13.5px] mb-2.5 transition-colors"
    }, title), React.createElement("div", {
      className: "grid grid-cols-2 gap-2.5"
    }, React.createElement("div", {
      className: "bg-slate-950/60 border border-slate-800 rounded-lg p-2.5"
    }, React.createElement("div", {
      className: "text-[9px] font-mono tracking-widest text-cyan-400 mb-1"
    }, c.iso, " · ", sel.toUpperCase().slice(0, 12), " · HOST"), React.createElement("p", {
      className: "text-[11px] text-slate-400 leading-relaxed"
    }, hostTxt)), React.createElement("div", {
      className: "bg-slate-950/60 border border-slate-800 rounded-lg p-2.5"
    }, React.createElement("div", {
      className: "text-[9px] font-mono tracking-widest text-blue-400 mb-1"
    }, "RUS · ROSATOM · VENDOR"), React.createElement("p", {
      className: "text-[11px] text-slate-400 leading-relaxed"
    }, ruTxt))), React.createElement("button", {
      onClick: () => setDoc(ref),
      className: "mt-2.5 w-full text-[9px] font-mono tracking-widest text-slate-600 hover:text-cyan-400 border-t border-slate-800 pt-2 transition-colors text-left"
    }, "READ ", ref, " IN THE SOURCE DOCUMENT →"));
  })), React.createElement(Card, null, React.createElement(H, {
    t: T.rg.pathTitle(sel),
    k: T.rg.pathTag(year)
  }), React.createElement("div", {
    className: "space-y-2"
  }, pathway.map(([y, kind, hostT, ruT]) => {
    const done = year >= y;
    const active = !done && pathway.filter(([yy]) => yy > year)[0]?.[0] === y;
    return React.createElement("div", {
      key: y,
      className: `rounded-xl p-3 border transition-colors ${done ? "bg-cyan-950/25 border-cyan-800/60" : active ? "bg-slate-900 border-slate-600" : "bg-slate-950/50 border-slate-800/70 opacity-55"}`
    }, React.createElement("div", {
      className: "flex items-center gap-3 mb-1.5"
    }, React.createElement("span", {
      className: `font-mono font-bold text-sm w-14 shrink-0 ${done ? "text-cyan-300" : active ? "text-slate-200" : "text-slate-600"}`
    }, y === 2086 ? T.rg.plus60 : y), React.createElement(Tag, {
      tone: done ? "green" : active ? "cyan" : "slate"
    }, done ? "✓ " + kind : active ? "▸ " + kind + " — NEXT" : kind)), React.createElement("div", {
      className: "grid md:grid-cols-2 gap-2 md:pl-[68px]"
    }, React.createElement("div", {
      className: "text-[11px] text-slate-400"
    }, React.createElement("span", {
      className: "font-mono text-[9px] text-cyan-500 tracking-widest"
    }, c.iso, " "), hostT), React.createElement("div", {
      className: "text-[11px] text-slate-400"
    }, React.createElement("span", {
      className: "font-mono text-[9px] text-blue-500 tracking-widest"
    }, "RUS "), ruT)));
  })))), tab === "people" && React.createElement("div", {
    key: sel + "pp",
    className: "space-y-4"
  }, React.createElement("div", {
    className: "grid sm:grid-cols-3 gap-4"
  }, [[T.pp.constrJobs, m.jC, T.pp.constrSub(year)], [T.pp.opsJobs, m.jO, T.pp.opsSub(m.sitesOnline)], [T.pp.indirect, m.jI, T.pp.indirectSub]].map(([l, v, s], i) => React.createElement(Card, {
    key: l,
    delay: i * 60
  }, React.createElement("div", {
    className: "text-[10px] font-mono tracking-widest text-slate-500"
  }, l), React.createElement("div", {
    className: "text-3xl font-extrabold font-mono text-cyan-200 mt-2"
  }, React.createElement(Count, {
    to: v
  })), React.createElement("div", {
    className: "text-[11px] text-slate-500 mt-1.5"
  }, s)))), React.createElement(Card, null, React.createElement(H, {
    k: T.pp.jobsTag,
    t: T.pp.jobsTitle
  }), React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 190
  }, React.createElement(AreaChart, {
    data: Array.from({
      length: 20
    }, (_, i) => {
      const y = 2026 + i,
        f = dep(y);
      return {
        year: y,
        Construction: Math.round(c.sfCap * A.jobsC * Math.max(0, Math.sin(Math.PI * Math.min(1, f * 1.15)))),
        Operations: Math.round(f * Math.max(1, Math.ceil(c.sites.length / (m.fnpp ? 2 : 4))) * A.jobsO)
      };
    }),
    margin: {
      left: 4
    }
  }, React.createElement(CartesianGrid, {
    stroke: "#1e293b",
    vertical: false
  }), React.createElement(XAxis, {
    dataKey: "year",
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(YAxis, {
    tick: {
      fill: "#475569",
      fontSize: 10,
      fontFamily: "monospace"
    },
    stroke: "#1e293b"
  }), React.createElement(Tooltip, {
    contentStyle: tt,
    formatter: v => num(v) + " jobs"
  }), React.createElement(Legend, {
    wrapperStyle: {
      fontSize: 11,
      fontFamily: "monospace"
    }
  }), React.createElement(ReferenceLine, {
    x: year,
    stroke: "#22D3EE",
    strokeWidth: 1.5,
    strokeDasharray: "4 3"
  }), React.createElement(Area, {
    type: "monotone",
    dataKey: "Construction",
    stackId: "1",
    stroke: "#F59E0B",
    fill: "#F59E0B",
    fillOpacity: 0.25
  }), React.createElement(Area, {
    type: "monotone",
    dataKey: "Operations",
    stackId: "1",
    stroke: "#22D3EE",
    fill: "#22D3EE",
    fillOpacity: 0.3
  })))), React.createElement("div", {
    className: "grid md:grid-cols-2 gap-4"
  }, React.createElement(Card, null, React.createElement(H, {
    t: T.pp.engageTitle(sel),
    k: `${m.phase} @ ${year}`
  }), React.createElement("ul", {
    className: "text-[12.5px] text-slate-400 space-y-2.5 leading-relaxed"
  }, engage.map(([h, b]) => React.createElement("li", {
    key: h
  }, React.createElement("span", {
    className: "text-slate-200 font-semibold"
  }, h, ":"), " ", b)))), React.createElement(Card, {
    delay: 70
  }, React.createElement(H, {
    t: T.pp.researchTitle,
    k: `${m.phase} @ ${year}`,
    onInfo: () => setSrc(true)
  }), React.createElement("ul", {
    className: "space-y-2.5"
  }, research.map(([t, d]) => React.createElement("li", {
    key: t,
    className: "border-l-2 border-slate-800 pl-2.5"
  }, React.createElement("div", {
    className: "text-[12px] text-slate-200 font-semibold"
  }, t), React.createElement("div", {
    className: "text-[11px] text-slate-500 leading-snug"
  }, d)))))), React.createElement("div", {
    className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
  }, [[T.pp.swot.S, swot.S, "green"], [T.pp.swot.W, swot.W, "red"], [T.pp.swot.O, swot.O, "cyan"], [T.pp.swot.T, swot.T, "amber"]].map(([t, items, tone], i) => React.createElement(Card, {
    key: t,
    delay: i * 55
  }, React.createElement("div", {
    className: "flex items-center justify-between gap-1"
  }, React.createElement(Tag, {
    tone: tone
  }, t), React.createElement("span", {
    className: "text-[8.5px] font-mono text-slate-600"
  }, "@ ", year)), React.createElement("ul", {
    className: "mt-3 space-y-2.5"
  }, items.map((x, j) => React.createElement("li", {
    key: j,
    className: "text-[11.5px] text-slate-400 leading-snug border-l-2 border-slate-800 pl-2.5"
  }, x))))))), React.createElement("div", {
    className: "flex items-center justify-between gap-3 mt-8 pt-4 border-t border-slate-900"
  }, React.createElement("div", {
    className: "text-[9.5px] font-mono text-slate-700 tracking-wide leading-relaxed max-w-3xl"
  }, T.footer), React.createElement("button", {
    onClick: () => setSrc(true),
    className: "shrink-0 text-[10px] font-mono tracking-widest text-slate-500 hover:text-cyan-400 border border-slate-800 hover:border-cyan-800 rounded-lg px-3 py-2 transition-colors"
  }, T.sourcesBtn, " ⓘ"))));
}
window.UnifiStats = UnifiStats;})();
