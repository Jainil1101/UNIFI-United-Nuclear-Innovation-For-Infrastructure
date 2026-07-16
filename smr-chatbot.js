(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SMRChatbot = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const DEFAULT_KB_URL = "facts (1).json";
  const DEFAULT_CONTEXT = {
    model: "Akademik Lomonosov",
    reactor: "2 × KLT-40S",
    capacityMWe: 70,
    capacityFactor: 0.9,
    siteName: "Bangka Belitung",
    dataMode: "simulated",
    weatherProvider: "Open-Meteo"
  };

  const SOURCES = {
    iaeaAris: { name: "IAEA ARIS database", url: "https://aris.iaea.org/" },
    iaeaPris: { name: "IAEA PRIS", url: "https://pris.iaea.org/PRIS/" },
    iaeaSafety: { name: "IAEA Safety Standards", url: "https://www.iaea.org/resources/safety-standards" },
    iaeaEpr: { name: "IAEA Emergency Preparedness and Response", url: "https://www.iaea.org/topics/emergency-preparedness-and-response-epr" },
    nrc: { name: "US NRC — Doses in Our Daily Lives", url: "https://www.nrc.gov/about-nrc/radiation/around-us/doses-daily-lives.html" },
    openMeteo: { name: "Open-Meteo", url: "https://open-meteo.com/" }
  };

  const STOP_WORDS = new Set([
    "a", "an", "and", "are", "be", "can", "do", "for", "from", "how", "i", "if", "in", "is", "it", "me", "my", "of", "on", "or", "the", "to", "what", "when", "where", "who", "why", "with", "you",
    "apa", "apakah", "bagaimana", "bisa", "boleh", "dan", "dari", "di", "dengan", "ini", "ke", "mengapa", "saya", "siapa", "tentang", "yang"
  ]);

  const INTENT_DEFINITIONS = [
    { id: "accident", terms: ["accident", "explosion", "explode", "meltdown", "tsunami", "earthquake", "fukushima", "chernobyl", "kecelakaan", "meledak", "gempa", "tenggelam", "evakuasi"] },
    { id: "health", terms: ["radiation", "dose", "cancer", "leukemia", "pregnancy", "children", "sickness", "radiasi", "dosis", "kanker", "kehamilan", "anak", "sakit"] },
    { id: "food", terms: ["fish", "seafood", "food", "water", "drinking", "contamination", "ikan", "makanan", "air minum", "air tanah", "kontaminasi"] },
    { id: "environment", terms: ["environment", "ocean", "sea", "coral", "pollution", "emission", "carbon", "waste", "lingkungan", "laut", "karang", "polusi", "emisi", "limbah"] },
    { id: "agriculture", terms: ["farm", "farming", "agriculture", "crop", "soil", "livestock", "cattle", "pertanian", "tanaman", "sawah", "tanah", "ternak"] },
    { id: "trust", terms: ["trust", "regulator", "oversight", "bapeten", "transparent", "transparency", "jobs", "employment", "worried", "scared", "percaya", "pengawasan", "transparansi", "pekerjaan", "takut", "khawatir"] },
    { id: "housing", terms: ["house", "home", "housing", "property", "land value", "live near", "rumah", "tanah", "properti", "tinggal dekat"] },
    { id: "infrastructure", terms: ["hospital", "school", "clinic", "blackout", "grid", "reliable", "power outage", "rumah sakit", "sekolah", "listrik padam", "listrik stabil"] },
    { id: "economy", terms: ["cost", "price", "bill", "tariff", "economy", "training", "technology transfer", "biaya", "harga", "tagihan", "tarif", "ekonomi", "pelatihan"] },
    { id: "security", terms: ["security", "pirate", "hijack", "sabotage", "terrorist", "collision", "sensor", "hide data", "keamanan", "pembajakan", "sabotase", "teroris", "data disembunyikan"] }
  ];

  const BUILTIN_RULES = [
    {
      id: "greeting",
      terms: ["hello", "hi", "hey", "halo", "hai", "selamat pagi", "selamat siang", "selamat malam"],
      answer: {
        en: "Hello! I can answer questions about the floating SMR using the supplied public-source knowledge base. Try asking about safety, radiation, waste, jobs, regulation, or the dashboard numbers.",
        id: "Halo! Saya dapat menjawab pertanyaan tentang SMR terapung menggunakan basis pengetahuan bersumber publik. Tanyakan tentang keselamatan, radiasi, limbah, pekerjaan, regulasi, atau angka di dasbor."
      }
    },
    {
      id: "smr_overview",
      terms: ["what is smr", "small modular reactor", "how does smr work", "what is a floating reactor", "apa itu smr", "reaktor modular kecil", "cara kerja smr", "reaktor terapung"],
      answer: {
        en: "An SMR is a small modular reactor: a compact nuclear power unit designed for factory manufacture and repeatable deployment. The floating concept places the power unit on a marine platform and uses a pressurized-water reactor design. The exact plant must still be assessed and licensed by the national regulator before operation.",
        id: "SMR adalah reaktor modular kecil: unit tenaga nuklir yang ringkas dan dirancang untuk dibuat di pabrik serta dipasang berulang. Konsep terapung menempatkan unit pembangkit di platform laut dan menggunakan desain reaktor air bertekanan. Pembangkit yang sebenarnya tetap harus dievaluasi dan mendapat izin regulator nasional sebelum beroperasi."
      },
      source: SOURCES.iaeaAris
    },
    {
      id: "dashboard_numbers",
      terms: ["how much power", "capacity", "megawatt", "mwe", "how many homes", "berapa daya", "kapasitas", "megawatt", "berapa rumah"],
      answer: {
        en: "The dashboard models a 70 MWe example based on 2 × KLT-40S units, using a design-typical 90% capacity factor. These are modelled figures, not live plant telemetry; the host site can replace them with its own values.",
        id: "Dasbor memodelkan contoh 70 MWe berdasarkan 2 × KLT-40S, menggunakan faktor kapasitas tipikal desain 90%. Ini adalah angka model, bukan telemetri pembangkit langsung; situs utama dapat menggantinya dengan nilai aktual."
      },
      source: SOURCES.iaeaPris
    },
    {
      id: "live_data",
      terms: ["live data", "real time", "weather", "wind", "wave", "site conditions", "api", "data langsung", "waktu nyata", "cuaca", "angin", "ombak", "kondisi lokasi"],
      answer: {
        en: "Only site conditions are intended to be live in the dashboard. Weather and marine readings can be supplied by the host site from Open-Meteo; power, homes, avoided CO₂, and diesel figures are model outputs unless the host connects certified plant telemetry.",
        id: "Hanya kondisi lokasi yang dirancang untuk diperbarui langsung di dasbor. Data cuaca dan laut dapat diberikan oleh situs utama dari Open-Meteo; angka daya, rumah, CO₂ yang dihindari, dan diesel adalah hasil model kecuali situs menghubungkan telemetri pembangkit bersertifikat."
      },
      source: SOURCES.openMeteo
    },
    {
      id: "help",
      terms: ["help", "what can you answer", "topics", "bantuan", "bisa jawab apa", "topik"],
      answer: {
        en: "I can answer grounded questions about accidents and emergency planning, radiation and health, food and water, marine and environmental effects, farming, housing, regulation and transparency, security, infrastructure, jobs, costs, and dashboard data.",
        id: "Saya dapat menjawab pertanyaan berbasis sumber tentang kecelakaan dan rencana darurat, radiasi dan kesehatan, makanan dan air, dampak laut dan lingkungan, pertanian, perumahan, regulasi dan transparansi, keamanan, infrastruktur, pekerjaan, biaya, serta data dasbor."
      }
    }
  ];

  const SUGGESTIONS = {
    en: ["Will it explode like Chernobyl?", "Is radiation dangerous?", "What happens to the waste?", "Who regulates the plant?", "Is the dashboard data live?"],
    id: ["Apakah bisa meledak seperti Chernobyl?", "Apakah radiasinya berbahaya?", "Bagaimana limbahnya?", "Siapa yang mengawasi?", "Apakah data dasbor langsung?"]
  };

  function repairMojibake(value) {
    let text = String(value == null ? "" : value);
    const replacements = {
      "â€”": "—", "â€“": "–", "â€˜": "‘", "â€™": "’", "â€œ": "“", "â€": "”", "â€¦": "…", "Âµ": "µ", "Ã—": "×", "â‚‚": "₂", "â€¢": "•", "ðŸ‘‹": "👋", "â˜€ï¸": "☀️", "ðŸŒ™": "🌙"
    };
    Object.keys(replacements).forEach(function (bad) {
      text = text.split(bad).join(replacements[bad]);
    });
    return text;
  }

  function normalize(value) {
    return repairMojibake(value)
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  function tokens(value) {
    return normalize(value).split(/\s+/).filter(function (token) {
      return token && token.length > 1 && !STOP_WORDS.has(token);
    });
  }

  function phraseIncludes(question, phrase) {
    return normalize(question).includes(normalize(phrase));
  }

  function languageFor(value, preferred) {
    if (preferred === "en" || preferred === "id") return preferred;
    const idWords = new Set(["apa", "apakah", "bagaimana", "bisa", "dengan", "ini", "limbah", "radiasi", "siapa", "yang", "kecelakaan", "mengapa"]);
    const words = normalize(value).split(/\s+/);
    const idScore = words.reduce(function (score, word) { return score + (idWords.has(word) ? 1 : 0); }, 0);
    return idScore > 0 ? "id" : "en";
  }

  function editDistance(left, right) {
    if (left === right) return 0;
    if (!left.length) return right.length;
    if (!right.length) return left.length;
    const previous = Array.from({ length: right.length + 1 }, function (_, index) { return index; });
    for (let row = 1; row <= left.length; row += 1) {
      const current = [row];
      for (let column = 1; column <= right.length; column += 1) {
        const cost = left[row - 1] === right[column - 1] ? 0 : 1;
        current[column] = Math.min(current[column - 1] + 1, previous[column] + 1, previous[column - 1] + cost);
      }
      for (let index = 0; index < current.length; index += 1) previous[index] = current[index];
    }
    return previous[right.length];
  }

  function tokensMatch(left, right) {
    if (left === right) return true;
    if (left.length >= 5 && right.length >= 5 && (left.startsWith(right) || right.startsWith(left))) return true;
    return left.length >= 6 && right.length >= 6 && editDistance(left, right) <= 1;
  }

  function scoreTerms(question, terms) {
    const questionTokens = tokens(question);
    const normalizedQuestion = normalize(question);
    let score = 0;
    terms.forEach(function (term) {
      const normalizedTerm = normalize(term);
      const termTokens = tokens(term);
      if (!termTokens.length) return;
      if (normalizedQuestion === normalizedTerm) score = Math.max(score, 100);
      else if (phraseIncludes(question, term) && termTokens.length > 1) score = Math.max(score, 80 + termTokens.length * 4);
      const matched = termTokens.filter(function (termToken) {
        return questionTokens.some(function (questionToken) { return tokensMatch(termToken, questionToken); });
      }).length;
      score = Math.max(score, matched * 18 + (matched === termTokens.length ? (termTokens.length > 1 ? 20 : 27) : 0));
    });
    return score;
  }

  function safeSource(source) {
    if (!source) return null;
    const name = repairMojibake(source.name || source.s || "Public source");
    const url = source.url || source.u || "";
    if (!/^https?:\/\//i.test(url)) return { name: name, url: "" };
    return { name: name, url: url };
  }

  function normalizeEntries(input) {
    const source = Array.isArray(input) ? input : input && Array.isArray(input.entries) ? input.entries : [];
    return source.filter(function (entry) {
      return entry && Array.isArray(entry.k) && entry.k.length && (entry.en || entry.id);
    }).map(function (entry) {
      return Object.assign({}, entry, { k: entry.k.map(repairMojibake) });
    });
  }

  function scoreEntry(question, entry, intentScores) {
    const questionTokens = tokens(question);
    const normalizedQuestion = normalize(question);
    let score = 0;
    let matchedKeyword = "";
    (entry.k || []).forEach(function (keyword) {
      const normalizedKeyword = normalize(keyword);
      const keywordTokens = tokens(keyword);
      if (!keywordTokens.length) return;
      let keywordScore = 0;
      if (normalizedQuestion === normalizedKeyword) keywordScore = 150;
      else if (normalizedQuestion.includes(normalizedKeyword) && keywordTokens.length > 1) keywordScore = 105 + keywordTokens.length * 5;
      const matchedTokens = keywordTokens.filter(function (keywordToken) {
        return questionTokens.some(function (questionToken) { return tokensMatch(keywordToken, questionToken); });
      });
      keywordScore = Math.max(keywordScore, matchedTokens.length * 15 + (matchedTokens.length === keywordTokens.length && keywordTokens.length > 1 ? 35 : 0));
      if (keywordScore > score) {
        score = keywordScore;
        matchedKeyword = keyword;
      }
    });
    const categoryScore = intentScores[entry.cat] || 0;
    return { entry: entry, score: score + Math.min(30, categoryScore), matchedKeyword: matchedKeyword };
  }

  function detectIntents(question) {
    return INTENT_DEFINITIONS.map(function (definition) {
      return { id: definition.id, score: scoreTerms(question, definition.terms) };
    }).filter(function (result) { return result.score > 0; }).sort(function (left, right) { return right.score - left.score; });
  }

  function answerText(rule, lang, context) {
    let answer = repairMojibake(rule.answer[lang] || rule.answer.en);
    if (rule.id === "dashboard_numbers") {
      const capacity = context.capacityMWe;
      const factor = context.capacityFactor;
      if (Number.isFinite(capacity) && Number.isFinite(factor)) {
        const power = (capacity * factor).toFixed(1).replace(/\.0$/, "");
        const suffix = lang === "id" ? " Perkiraan keluaran stabilnya sekitar " + power + " MWe." : " Its modelled steady output is about " + power + " MWe.";
        answer += suffix;
      }
    }
    if (rule.id === "live_data" && context.liveWeather) {
      const weather = context.liveWeather;
      const parts = [];
      if (Number.isFinite(weather.temperatureC)) parts.push((lang === "id" ? "suhu " : "temperature ") + weather.temperatureC + "°C");
      if (Number.isFinite(weather.windSpeedMps)) parts.push((lang === "id" ? "angin " : "wind ") + weather.windSpeedMps + " m/s");
      if (Number.isFinite(weather.waveHeightM)) parts.push((lang === "id" ? "ombak " : "waves ") + weather.waveHeightM + " m");
      if (parts.length) answer += (lang === "id" ? " Pembacaan yang diberikan situs: " : " Site-provided readings: ") + parts.join(", ") + ".";
    }
    return answer;
  }

  function createEngine(options) {
    const config = Object.assign({
      language: "auto",
      knowledgeBase: null,
      kbUrl: DEFAULT_KB_URL,
      context: {}
    }, options || {});
    let entries = normalizeEntries(config.knowledgeBase);
    let loadPromise = null;
    const context = Object.assign({}, DEFAULT_CONTEXT, config.context || {});

    function setKnowledgeBase(value) {
      entries = normalizeEntries(value);
      return entries.length;
    }

    async function loadKnowledgeBase(url) {
      if (entries.length) return entries;
      if (loadPromise) return loadPromise;
      const fetcher = config.fetch || (root && root.fetch);
      if (typeof fetcher !== "function") return entries;
      loadPromise = fetcher(url || config.kbUrl, { cache: "no-store" }).then(function (response) {
        if (!response.ok) throw new Error("Knowledge base request failed: " + response.status);
        return response.json();
      }).then(function (data) {
        setKnowledgeBase(data);
        return entries;
      }).catch(function () {
        entries = [];
        return entries;
      });
      return loadPromise;
    }

    async function getContext() {
      const provided = typeof config.contextProvider === "function" ? await config.contextProvider() : {};
      return Object.assign({}, context, provided || {});
    }

    async function answer(question, answerOptions) {
      const query = String(question == null ? "" : question).trim();
      const lang = languageFor(query, answerOptions && answerOptions.language || config.language);
      if (!query) return { text: lang === "id" ? "Silakan tulis pertanyaan Anda." : "Please type a question.", language: lang, intent: "empty", confidence: 1, suggestions: SUGGESTIONS[lang] };
      const currentContext = await getContext();
      const builtin = BUILTIN_RULES.map(function (rule) { return { rule: rule, score: scoreTerms(query, rule.terms) }; }).sort(function (left, right) { return right.score - left.score; })[0];
      if (builtin && builtin.score >= 45) {
        return { text: answerText(builtin.rule, lang, currentContext), language: lang, intent: builtin.rule.id, confidence: Math.min(1, builtin.score / 100), source: safeSource(builtin.rule.source), suggestions: SUGGESTIONS[lang] };
      }
      await loadKnowledgeBase();
      const intents = detectIntents(query);
      const intentScores = intents.reduce(function (scores, intent) { scores[intent.id] = intent.score; return scores; }, {});
      const ranked = entries.map(function (entry) { return scoreEntry(query, entry, intentScores); }).filter(function (result) { return result.score > 0; }).sort(function (left, right) { return right.score - left.score; });
      const best = ranked[0];
      if (!best || best.score < 20) {
        return {
          text: lang === "id" ? "Saya belum menemukan fakta yang cukup spesifik untuk menjawab itu. Coba tanyakan tentang keselamatan, radiasi, limbah, lingkungan, regulator, pekerjaan, biaya, atau data dasbor." : "I could not find a sufficiently specific fact for that question. Try asking about safety, radiation, waste, the environment, regulation, jobs, costs, or dashboard data.",
          language: lang,
          intent: intents[0] ? intents[0].id : "unknown",
          confidence: 0,
          suggestions: SUGGESTIONS[lang]
        };
      }
      const entry = best.entry;
      const text = repairMojibake(entry[lang] || entry.en || entry.id);
      const action = lang === "id" ? entry.action_id || entry.action_en : entry.action_en || entry.action_id;
      return {
        text: action ? text + "\n\n" + repairMojibake(action) : text,
        language: lang,
        intent: entry.cat || intents[0] && intents[0].id || "knowledge",
        confidence: Math.min(1, best.score / 125),
        source: safeSource({ name: entry.s, url: entry.u }),
        suggestions: SUGGESTIONS[lang]
      };
    }

    function detectIntent(question) {
      const builtin = BUILTIN_RULES.map(function (rule) { return { id: rule.id, score: scoreTerms(question, rule.terms) }; }).sort(function (left, right) { return right.score - left.score; })[0];
      const intents = detectIntents(question);
      if (builtin && builtin.score >= 45 && (!intents[0] || builtin.score >= intents[0].score)) return builtin;
      return intents[0] || { id: "unknown", score: 0 };
    }

    return {
      answer: answer,
      detectIntent: detectIntent,
      loadKnowledgeBase: loadKnowledgeBase,
      setKnowledgeBase: setKnowledgeBase,
      getSuggestions: function (language) { return SUGGESTIONS[language === "id" ? "id" : "en"].slice(); },
      get entries() { return entries.slice(); }
    };
  }

  function addStyles(document) {
    if (document.getElementById("smr-chatbot-styles")) return;
    const style = document.createElement("style");
    style.id = "smr-chatbot-styles";
    style.textContent = ".smr-chatbot{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#12202a}.smr-chatbot *{box-sizing:border-box}.smr-chatbot__fab{position:fixed;right:18px;bottom:18px;z-index:1000;width:58px;height:58px;border:0;border-radius:50%;background:#13a7b8;color:#fff;font-size:25px;cursor:pointer;box-shadow:0 8px 28px #08243140}.smr-chatbot__fab:focus-visible,.smr-chatbot button:focus-visible,.smr-chatbot input:focus-visible{outline:3px solid #f5bd4d;outline-offset:2px}.smr-chatbot__panel{position:fixed;right:14px;bottom:86px;z-index:999;width:min(390px,calc(100vw - 28px));height:min(590px,calc(100vh - 105px));display:none;flex-direction:column;overflow:hidden;background:#f7fbfc;border:1px solid #cfe0e5;border-radius:16px;box-shadow:0 18px 50px #08243135}.smr-chatbot__panel.is-open{display:flex}.smr-chatbot__head{display:flex;align-items:center;gap:10px;padding:13px 15px;background:#092c3b;color:#fff}.smr-chatbot__head strong{display:block;font-size:15px}.smr-chatbot__head small{display:block;margin-top:2px;color:#bfe9ef;font-size:11px}.smr-chatbot__close{margin-left:auto;border:0;background:transparent;color:#cdeff2;font-size:20px;cursor:pointer}.smr-chatbot__body{display:flex;flex:1;flex-direction:column;gap:9px;overflow:auto;padding:14px}.smr-chatbot__message{max-width:88%;padding:10px 12px;border-radius:13px;white-space:pre-wrap;font-size:13px;line-height:1.48}.smr-chatbot__message--user{align-self:flex-end;background:#087c91;color:#fff;border-bottom-right-radius:4px}.smr-chatbot__message--bot{align-self:flex-start;background:#fff;border:1px solid #d8e7ea;border-bottom-left-radius:4px}.smr-chatbot__cite{display:block;margin-top:8px;padding-top:7px;border-top:1px dashed #cfe0e5;font-size:11px}.smr-chatbot__cite a{color:#087c91}.smr-chatbot__typing{align-self:flex-start;padding:11px 14px;background:#fff;border:1px solid #d8e7ea;border-radius:13px;color:#78a0a8}.smr-chatbot__typing i{display:inline-block;width:5px;height:5px;margin:0 2px;border-radius:50%;background:currentColor;animation:smr-chatbot-bounce 1s infinite}.smr-chatbot__typing i:nth-child(2){animation-delay:.15s}.smr-chatbot__typing i:nth-child(3){animation-delay:.3s}@keyframes smr-chatbot-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}.smr-chatbot__suggestions{display:flex;gap:6px;overflow:auto;padding:0 12px 9px}.smr-chatbot__suggestion{flex:0 0 auto;border:1px solid #b7dbe0;border-radius:999px;padding:6px 9px;background:#fff;color:#086b7c;font-size:11px;cursor:pointer}.smr-chatbot__form{display:flex;gap:7px;padding:10px;border-top:1px solid #d4e3e6;background:#fff}.smr-chatbot__input{min-width:0;flex:1;border:1px solid #c4dce0;border-radius:9px;padding:9px;font:inherit;font-size:13px}.smr-chatbot__send{border:0;border-radius:9px;padding:0 13px;background:#f5bd4d;color:#12202a;font-weight:700;cursor:pointer}.smr-chatbot__send:disabled{cursor:wait;opacity:.6}@media (prefers-color-scheme:dark){.smr-chatbot{color:#eaf7f8}.smr-chatbot__panel{background:#10252d;border-color:#2b4d57}.smr-chatbot__message--bot,.smr-chatbot__typing,.smr-chatbot__suggestion,.smr-chatbot__form{background:#18343d;border-color:#2b4d57}.smr-chatbot__input{background:#10252d;color:#eaf7f8;border-color:#2b4d57}}";
    document.head.appendChild(style);
  }

  function mount(options) {
    if (!root || !root.document) throw new Error("SMRChatbot.mount requires a browser document");
    const document = root.document;
    const config = Object.assign({
      target: document.body,
      title: "SMR Assistant",
      subtitle: "Grounded answers with public sources",
      language: "auto",
      autoOpen: false,
      typingDelay: 260
    }, options || {});
    addStyles(document);
    const target = typeof config.target === "string" ? document.querySelector(config.target) : config.target;
    if (!target) throw new Error("SMRChatbot target was not found");
    const shell = document.createElement("div");
    shell.className = "smr-chatbot";
    shell.innerHTML = "<button type=\"button\" class=\"smr-chatbot__fab\" aria-label=\"Open SMR assistant\">💬</button><section class=\"smr-chatbot__panel\" role=\"dialog\" aria-label=\"SMR assistant\" aria-modal=\"false\"><header class=\"smr-chatbot__head\"><div><strong></strong><small></small></div><button type=\"button\" class=\"smr-chatbot__close\" aria-label=\"Close assistant\">×</button></header><div class=\"smr-chatbot__body\" aria-live=\"polite\"></div><div class=\"smr-chatbot__suggestions\"></div><form class=\"smr-chatbot__form\"><input class=\"smr-chatbot__input\" autocomplete=\"off\"><button class=\"smr-chatbot__send\" type=\"submit\">Send</button></form></section>";
    target.appendChild(shell);
    const panel = shell.querySelector(".smr-chatbot__panel");
    const body = shell.querySelector(".smr-chatbot__body");
    const input = shell.querySelector(".smr-chatbot__input");
    const send = shell.querySelector(".smr-chatbot__send");
    shell.querySelector("strong").textContent = config.title;
    shell.querySelector("small").textContent = config.subtitle;
    input.placeholder = config.placeholder || "Ask about safety, radiation, waste…";
    send.textContent = config.sendLabel || "Send";
    const engine = createEngine(config);
    let currentLanguage = config.language === "id" ? "id" : "en";
    let busy = false;

    function appendMessage(text, type, source) {
      const message = document.createElement("div");
      message.className = "smr-chatbot__message smr-chatbot__message--" + type;
      message.textContent = text;
      if (source && source.name) {
        const cite = document.createElement("span");
        cite.className = "smr-chatbot__cite";
        cite.appendChild(document.createTextNode("Source: " + source.name));
        if (source.url) {
          const link = document.createElement("a");
          link.href = source.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = " Open";
          cite.appendChild(link);
        }
        message.appendChild(cite);
      }
      body.appendChild(message);
      body.scrollTop = body.scrollHeight;
      return message;
    }

    function renderSuggestions(language, suggestions) {
      const container = shell.querySelector(".smr-chatbot__suggestions");
      container.replaceChildren();
      (suggestions || engine.getSuggestions(language)).forEach(function (suggestion) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "smr-chatbot__suggestion";
        button.textContent = suggestion;
        button.addEventListener("click", function () {
          input.value = suggestion;
          submit();
        });
        container.appendChild(button);
      });
    }

    function setOpen(open) {
      panel.classList.toggle("is-open", open);
      shell.querySelector(".smr-chatbot__fab").setAttribute("aria-expanded", String(open));
      if (open) input.focus();
    }

    async function submit() {
      if (busy) return;
      const query = input.value.trim();
      if (!query) return;
      busy = true;
      send.disabled = true;
      input.value = "";
      appendMessage(query, "user");
      const typing = document.createElement("div");
      typing.className = "smr-chatbot__typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;
      const result = await engine.answer(query, { language: config.language });
      await new Promise(function (resolve) { root.setTimeout(resolve, config.typingDelay); });
      typing.remove();
      appendMessage(result.text, "bot", result.source);
      currentLanguage = result.language;
      renderSuggestions(currentLanguage, result.suggestions);
      if (typeof config.onAnswer === "function") config.onAnswer(result, query);
      busy = false;
      send.disabled = false;
      input.focus();
    }

    shell.querySelector(".smr-chatbot__fab").addEventListener("click", function () { setOpen(!panel.classList.contains("is-open")); });
    shell.querySelector(".smr-chatbot__close").addEventListener("click", function () { setOpen(false); });
    shell.querySelector(".smr-chatbot__form").addEventListener("submit", function (event) { event.preventDefault(); submit(); });
    renderSuggestions(currentLanguage, config.suggestions);
    appendMessage(config.welcome || (currentLanguage === "id" ? "Halo! Tanyakan apa saja tentang SMR terapung." : "Hello! Ask me anything about the floating SMR."), "bot");
    if (config.autoOpen) setOpen(true);

    return {
      element: shell,
      panel: panel,
      engine: engine,
      open: function () { setOpen(true); },
      close: function () { setOpen(false); },
      destroy: function () { shell.remove(); },
      ask: function (question) { input.value = question; return submit(); }
    };
  }

  return {
    createEngine: createEngine,
    mount: mount,
    loadKnowledgeBase: function (url, fetcher) {
      const engine = createEngine({ kbUrl: url, fetch: fetcher });
      return engine.loadKnowledgeBase();
    },
    sources: Object.assign({}, SOURCES),
    defaultContext: Object.assign({}, DEFAULT_CONTEXT)
  };
});
