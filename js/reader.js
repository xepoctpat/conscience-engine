/**
 * The Conscience Engine — Floodlit Archive reader
 * Loads chapters from /content/*.md via data/chapters.json.
 * No framework. Visuals stay in CSS. Immersive layers hook events only.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "ce.reader.v1";
  var MANIFEST_URL = "data/chapters.json";

  var els = {
    body: document.body,
    progress: document.getElementById("read-progress-bar"),
    toc: document.getElementById("toc"),
    tocList: document.getElementById("toc-list"),
    indexToggle: document.getElementById("index-toggle"),
    indexBackdrop: document.getElementById("index-backdrop"),
    status: document.getElementById("record-status"),
    cover: document.getElementById("cover"),
    coverOpen: document.getElementById("open-record"),
    coverMeta: document.getElementById("cover-meta"),
    coverAccession: document.getElementById("cover-accession"),
    homeLink: document.getElementById("home-link"),
    record: document.getElementById("record"),
    kicker: document.getElementById("record-kicker"),
    accession: document.getElementById("record-accession"),
    title: document.getElementById("record-title"),
    deck: document.getElementById("record-deck"),
    plate: document.getElementById("record-plate"),
    plateImg: document.getElementById("record-plate-img"),
    article: document.getElementById("record-body"),
    navPrev: document.getElementById("nav-prev"),
    navNext: document.getElementById("nav-next"),
    fault: document.getElementById("fault"),
    docTitle: document.getElementById("doc-title"),
    audioToggle: document.getElementById("audio-toggle"),
    speakToggle: document.getElementById("speak-toggle"),
    voicePick: document.getElementById("voice-pick"),
    voiceSelect: document.getElementById("voice-select"),
    recordClose: document.getElementById("record-close"),
    skip: document.getElementById("skip-link")
  };

  var state = {
    manifest: null,
    chapters: [],
    index: 0,
    view: "cover",
    cache: Object.create(null),
    loadSeq: 0,
    lastScrollY: 0,
    restoring: false,
    placeTimer: null
  };

  var audio = {
    enabled: false,
    started: false,
    heldForSpeech: false,
    currentSrc: "",
    incoming: null,
    outgoing: null,
    fadeTimer: null,
    volume: 0.28,
    fadeMs: 900
  };

  var speech = {
    available: false,
    status: "off",
    queue: [],
    index: 0,
    voice: null,
    generation: 0
  };

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", boot);

  function boot() {
    initAudio();
    initSpeech();
    bindChrome();
    loadManifest()
      .then(function (manifest) {
        state.manifest = manifest;
        state.chapters = manifest.chapters || [];
        renderIndex();
        routeFromLocation(true);
      })
      .catch(showServeFault);

    window.addEventListener("hashchange", function () {
      routeFromLocation(false);
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
  }

  function loadManifest() {
    return fetch(MANIFEST_URL, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("manifest " + res.status);
      return res.json();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Routing                                                             */
  /* ------------------------------------------------------------------ */

  function routeFromLocation(isFirst) {
    if (!state.chapters.length) return;
    var id = (location.hash || "").replace(/^#/, "");
    if (!id || id === "cover") {
      if (isFirst || id === "cover") {
        showCover();
        return;
      }
      openChapter(state.chapters[0].id, { store: false, scroll: "top" });
      return;
    }
    openChapter(id, { store: true, scroll: "restore" });
  }

  function showCover() {
    state.view = "cover";
    els.body.dataset.view = "cover";
    els.body.dataset.atmosphere = "floodwater";
    savePlace();
    stopSpeech();
    els.body.classList.remove("chrome-away");
    closeIndex();
    setSkip("#open-record");
    delete els.body.dataset.chapter;
    setStatus("Cover");
    var saved = readStore();
    if (saved && saved.chapterId && findIndex(saved.chapterId) >= 0) {
      els.coverOpen.setAttribute("href", "#" + saved.chapterId);
      els.coverOpen.textContent = "Continue the record";
    } else if (state.chapters[0]) {
      els.coverOpen.setAttribute("href", "#" + state.chapters[0].id);
      els.coverOpen.textContent = "Open the record";
    }
    if (els.docTitle) {
      els.docTitle.textContent = workTitle();
    }
    paintCoverCensus();
    var coverAudio = atmosphereAudio("floodwater");
    if (coverAudio) els.body.dataset.audio = coverAudio;
    else delete els.body.dataset.audio;
    syncAudio();
  }

  function openChapter(id, opts) {
    var index = findIndex(id);
    if (index < 0) {
      index = 0;
      id = state.chapters[0].id;
    }
    state.index = index;
    state.view = "reading";
    els.body.dataset.view = "reading";
    closeIndex();

    var chapter = state.chapters[index];
    var seq = (state.loadSeq += 1);
    stopSpeech();
    els.body.classList.remove("chrome-away");
    applyAtmosphere(chapter);
    setStatus(recordStatus(index));
    setSkip("#record");
    renderHeader(chapter, chapter);
    renderNav(index);
    paintClose(chapter);
    markIndexCurrent(chapter.id);
    if (els.docTitle) {
      els.docTitle.textContent = chapter.title + " — " + workTitle();
    }

    loadChapterText(chapter)
      .then(function (markdown) {
        if (seq !== state.loadSeq) return;
        var parsed = parseRecord(markdown, chapter);
        renderHeader(parsed.meta, chapter);
        els.article.innerHTML = parsed.html;
        markSpeech(els.article);
        applyPlate(chapter, seq, function () {
          if (seq !== state.loadSeq) return;
          if (opts && opts.scroll === "top") {
            window.scrollTo(0, 0);
          } else {
            restorePlace(chapter.id, seq);
          }
          updateProgress();
          state.lastScrollY = window.scrollY;
          els.title.focus({ preventScroll: true });
          emit("ce:chapterchange", chapter);
        });
      })
      .catch(function () {
        if (seq !== state.loadSeq) return;
        els.article.innerHTML =
          '<p class="archive-note">This record could not be retrieved from ' +
          escapeHtml(chapter.file) +
          ".</p>";
        els.plate.hidden = true;
      });

    if (opts && opts.store !== false) {
      writeStore({ chapterId: chapter.id });
    }
    if (location.hash.replace(/^#/, "") !== chapter.id) {
      history.replaceState(null, "", "#" + chapter.id);
    }
  }

  function findIndex(id) {
    for (var i = 0; i < state.chapters.length; i += 1) {
      if (state.chapters[i].id === id) return i;
    }
    return -1;
  }

  function loadChapterText(chapter) {
    if (state.cache[chapter.id]) {
      return Promise.resolve(state.cache[chapter.id]);
    }
    return fetch(chapter.file, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("chapter " + res.status);
      return res.text().then(function (text) {
        state.cache[chapter.id] = text;
        return text;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  function renderIndex() {
    var frag = document.createDocumentFragment();
    state.chapters.forEach(function (ch) {
      var li = document.createElement("li");
      li.className = "index-item";
      var a = document.createElement("a");
      a.className = "index-link";
      a.href = "#" + ch.id;
      a.dataset.chapterId = ch.id;
      a.innerHTML =
        '<span class="index-accession">' +
        escapeHtml(ch.accession || padOrder(ch.order)) +
        "</span>" +
        '<span class="index-copy">' +
        '<span class="index-label">' +
        escapeHtml(indexLabel(ch)) +
        "</span>" +
        '<span class="index-title">' +
        escapeHtml(ch.title || "") +
        "</span></span>";
      li.appendChild(a);
      frag.appendChild(li);
    });
    els.tocList.innerHTML = "";
    els.tocList.appendChild(frag);
  }

  function markIndexCurrent(id) {
    var links = els.tocList.querySelectorAll(".index-link");
    for (var i = 0; i < links.length; i += 1) {
      if (links[i].dataset.chapterId === id) {
        links[i].setAttribute("aria-current", "page");
      } else {
        links[i].removeAttribute("aria-current");
      }
    }
  }

  function renderHeader(meta, chapter) {
    els.kicker.textContent = meta.label || "";
    els.title.textContent = meta.title || "";
    if (els.accession) {
      var bits = [];
      if (chapter && chapter.accession) bits.push(chapter.accession);
      var weather = atmosphereLabel(chapter && chapter.atmosphere);
      if (weather) bits.push(weather);
      els.accession.textContent = bits.join(" · ");
      els.accession.hidden = bits.length === 0;
    }
    if (meta.deck) {
      els.deck.textContent = meta.deck;
      els.deck.classList.add("is-present");
    } else {
      els.deck.textContent = "";
      els.deck.classList.remove("is-present");
    }
  }

  function markSpeech(root) {
    if (!root) return;
    var nodes = root.querySelectorAll("p");
    for (var i = 0; i < nodes.length; i += 1) {
      var text = String(nodes[i].textContent || "").replace(/^\s+/, "");
      var mark = text.charAt(0);
      if (mark === "“" || mark === '"' || mark === "‘") {
        nodes[i].classList.add("is-speech");
      }
    }
  }

  function applyPlate(chapter, seq, done) {
    done = typeof done === "function" ? done : function () {};
    if (!chapter.plate) {
      els.plate.hidden = true;
      els.plateImg.removeAttribute("src");
      done();
      return;
    }
    els.plate.hidden = true;
    els.plateImg.onload = function () {
      if (seq && seq !== state.loadSeq) return;
      els.plate.hidden = false;
      done();
    };
    els.plateImg.onerror = function () {
      if (seq && seq !== state.loadSeq) return;
      els.plate.hidden = true;
      done();
    };
    els.plateImg.alt = "";
    els.plateImg.src = chapter.plate;
  }

  function paintClose(chapter) {
    if (!els.recordClose) return;
    var mark = (chapter && chapter.accession) || "";
    if (!mark) {
      els.recordClose.hidden = true;
      els.recordClose.textContent = "";
      return;
    }
    els.recordClose.hidden = false;
    els.recordClose.textContent = "End of record " + mark;
  }

  function renderNav(index) {
    var prev = state.chapters[index - 1];
    var next = state.chapters[index + 1];
    fillNav(els.navPrev, prev, "Previous record");
    fillNav(els.navNext, next, "Next record");
  }

  function fillNav(anchor, chapter, direction) {
    if (!chapter) {
      anchor.hidden = true;
      anchor.removeAttribute("href");
      return;
    }
    anchor.hidden = false;
    anchor.href = "#" + chapter.id;
    anchor.querySelector(".nav-dir").textContent = direction;
    anchor.querySelector(".nav-title").textContent =
      (chapter.label ? chapter.label + " — " : "") + chapter.title;
  }

  /* ------------------------------------------------------------------ */
  /* Markdown (subset sufficient for the current record)                 */
  /* ------------------------------------------------------------------ */

  function parseRecord(markdown, chapter) {
    var src = String(markdown || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    var meta = {
      label: chapter.label,
      title: chapter.title,
      deck: chapter.deck || ""
    };

    var heading = src.match(/^#\s+(.+?)\s*(?:\n+|$)/);
    if (heading) {
      var extracted = splitHeading(heading[1]);
      if (extracted.label) meta.label = extracted.label;
      if (extracted.title) meta.title = extracted.title;
      src = src.slice(heading[0].length);
    }

    return { meta: meta, html: renderMarkdown(src.trim()) };
  }

  function splitHeading(line) {
    var prologue = line.match(/^Prologue:\s*(.+)$/i);
    if (prologue) return { label: "Prologue", title: prologue[1] };
    var chapter = line.match(/^Chapter\s+(\d+)\s+[—–-]\s*(.+)$/i);
    if (chapter) {
      var n = chapter[1].length === 1 ? "0" + chapter[1] : chapter[1];
      return { label: "Chapter " + n, title: chapter[2] };
    }
    var epilogue = line.match(/^Epilogue\s+[—–-]\s*(.+)$/i);
    if (epilogue) return { label: "Epilogue", title: epilogue[1] };
    return { label: "", title: line };
  }

  function renderMarkdown(src) {
    if (!src) return "";
    var blocks = src.split(/\n{2,}/);
    var html = [];
    for (var i = 0; i < blocks.length; i += 1) {
      html.push(renderBlock(blocks[i]));
    }
    return html.join("\n");
  }

  function renderBlock(raw) {
    var block = raw.replace(/^\n+|\n+$/g, "");
    if (!block) return "";

    var fence = block.match(/^:::(hint|reveal|archive-note|bulletin)\s*\n([\s\S]*)$/);
    if (fence) {
      return (
        '<aside class="' +
        fence[1] +
        '" data-reveal="' +
        fence[1] +
        '">' +
        renderMarkdown(fence[2].trim()) +
        "</aside>"
      );
    }

    var heading = block.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      var level = heading[1].length;
      return "<h" + level + ">" + inline(heading[2]) + "</h" + level + ">";
    }

    if (/^>\s?/.test(block)) {
      var quoted = block
        .split("\n")
        .map(function (line) {
          return line.replace(/^>\s?/, "");
        })
        .join("\n");
      return '<aside class="archive-note">' + inline(quoted) + "</aside>";
    }

    if (/^\*\*[^*]+\*\*$/.test(block.replace(/\n/g, ""))) {
      return '<p class="emphasis-block">' + inline(block.replace(/\n/g, " ")) + "</p>";
    }

    if (isCivicBulletin(block) && block.indexOf("\n") === -1) {
      return '<p class="civic-bulletin">' + inline(block) + "</p>";
    }

    return "<p>" + renderParagraph(block) + "</p>";
  }

  function renderParagraph(block) {
    var lines = block.split("\n");
    var out = [];
    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i];
      var hard = / {2}$/.test(line) || /\\$/.test(line);
      var text = line.replace(/ {2}$/, "").replace(/\\$/, "");
      var piece = isCivicBulletin(text)
        ? '<span class="civic-bulletin">' + inline(text) + "</span>"
        : inline(text);
      var last = i === lines.length - 1;
      if (!last) {
        piece += hard || isCivicBulletin(text) ? "<br>\n" : " ";
      }
      out.push(piece);
    }
    return out.join("");
  }

  function isCivicBulletin(text) {
    var t = String(text || "").trim();
    if (t.length < 8) return false;
    if (!/[A-Z]{4,}/.test(t)) return false;
    return /^[A-Z0-9][A-Z0-9 .,'’"“”?:;()[\]/&—–-]*$/.test(t);
  }

  function inline(text) {
    var escaped = escapeHtml(text);
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return escaped;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ------------------------------------------------------------------ */
  /* Atmosphere, chrome, state                                           */
  /* ------------------------------------------------------------------ */

  function applyAtmosphere(chapter) {
    var atmosphere = chapter.atmosphere || "floodwater";
    els.body.dataset.atmosphere = atmosphere;
    els.body.dataset.chapter = chapter.id;
    if (chapter.audio) {
      els.body.dataset.audio = chapter.audio;
    } else {
      delete els.body.dataset.audio;
    }
    syncAudio();
  }

  function emit(name, chapter) {
    document.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          id: chapter.id,
          order: chapter.order,
          atmosphere: chapter.atmosphere,
          audio: chapter.audio || null,
          plate: chapter.plate || null,
          accession: chapter.accession
        }
      })
    );
  }

  function bindChrome() {
    if (els.audioToggle) {
      els.audioToggle.addEventListener("click", toggleAudio);
    }
    if (els.speakToggle) {
      els.speakToggle.addEventListener("click", onSpeakClick);
    }
    if (els.voiceSelect) {
      els.voiceSelect.addEventListener("change", onVoiceChange);
    }

    if (els.homeLink) {
      els.homeLink.addEventListener("click", function (event) {
        event.preventDefault();
        history.replaceState(null, "", location.pathname + location.search);
        showCover();
      });
    }

    els.indexToggle.addEventListener("click", function () {
      if (els.body.classList.contains("index-open")) {
        closeIndex({ restoreFocus: true });
      } else {
        openIndex();
      }
    });
    els.indexBackdrop.addEventListener("click", function () {
      closeIndex({ restoreFocus: true });
    });
    els.toc.addEventListener("click", function (event) {
      var link = event.target.closest("a[href^='#']");
      if (link) closeIndex({ restoreFocus: false });
    });

    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-reveal-target]");
      if (!trigger) return;
      var node = document.getElementById(trigger.getAttribute("data-reveal-target"));
      if (!node) return;
      event.preventDefault();
      node.hidden = !node.hidden;
    });

    document.addEventListener("keydown", function (event) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key === "Escape") {
        closeIndex({ restoreFocus: true });
        return;
      }
      if (event.key === "i" || event.key === "I") {
        if (els.body.classList.contains("index-open")) {
          closeIndex({ restoreFocus: true });
        } else {
          openIndex();
        }
        return;
      }
      if (event.key === "m" || event.key === "M") {
        toggleAudio();
        return;
      }
      if (event.key === "s" || event.key === "S") {
        onSpeakClick(event);
        return;
      }
      if (state.view !== "reading") return;
      if (event.key === "ArrowLeft" || event.key === "[") {
        goRelative(-1);
      } else if (event.key === "ArrowRight" || event.key === "]") {
        goRelative(1);
      }
    });
  }

  function goRelative(step) {
    var next = state.index + step;
    if (next < 0 || next >= state.chapters.length) return;
    location.hash = state.chapters[next].id;
  }

  function openIndex() {
    els.body.classList.remove("chrome-away");
    els.toc.inert = false;
    els.body.classList.add("index-open");
    els.indexToggle.setAttribute("aria-expanded", "true");
    els.toc.setAttribute("aria-hidden", "false");
    var current = els.tocList.querySelector("[aria-current='page']") ||
      els.tocList.querySelector(".index-link");
    if (current) current.focus();
  }

  function closeIndex(opts) {
    var restore = !!(opts && opts.restoreFocus);
    releaseIndexFocus(restore);
    els.body.classList.remove("index-open");
    els.indexToggle.setAttribute("aria-expanded", "false");
    els.toc.setAttribute("aria-hidden", "true");
    els.toc.inert = true;
  }

  function releaseIndexFocus(restoreToggle) {
    if (!els.toc.contains(document.activeElement)) return;
    var target = null;
    if (restoreToggle) {
      target = els.indexToggle;
    } else if (state.view === "reading" && els.title) {
      target = els.title;
    } else if (els.coverOpen) {
      target = els.coverOpen;
    } else {
      target = els.indexToggle;
    }
    if (target && typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  }

  function setSkip(href) {
    if (els.skip) els.skip.setAttribute("href", href);
  }

  function setStatus(text) {
    if (els.status) els.status.textContent = text;
  }

  function recordStatus(index) {
    var chapter = state.chapters[index];
    var accession = chapter && chapter.accession ? chapter.accession + " · " : "";
    return accession + (index + 1) + " of " + state.chapters.length;
  }

  function padOrder(n) {
    var s = String(n);
    return s.length === 1 ? "0" + s : s;
  }

  function workTitle() {
    return (state.manifest && state.manifest.work) || "The Conscience Engine";
  }

  function atmosphereLabel(name) {
    var atms = state.manifest && state.manifest.atmospheres;
    if (!name || !atms || !atms[name]) return "";
    return atms[name].label || "";
  }

  function indexLabel(chapter) {
    var label = chapter && chapter.label ? chapter.label : "";
    var weather = atmosphereLabel(chapter && chapter.atmosphere);
    if (label && weather) return label + " · " + weather;
    return label || weather;
  }

  function paintCoverCensus() {
    var chapters = state.chapters || [];
    var first = chapters[0];
    var last = chapters[chapters.length - 1];
    var span = "";
    if (first && last && first.accession && last.accession) {
      span = first.accession + "–" + last.accession;
    }
    if (els.coverAccession) {
      els.coverAccession.textContent = span
        ? "Recovered civic record · " + span
        : "Recovered civic record";
    }
    if (els.coverMeta) {
      var count = chapters.length;
      var word = count === 1 ? " record" : " records";
      els.coverMeta.textContent = span
        ? span + " · " + count + word
        : count + word;
    }
  }

  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max <= 0 ? 0 : window.scrollY / max;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    doc.style.setProperty("--read-progress", String(ratio));
  }

  function onScroll() {
    updateProgress();
    updateChrome();
    if (state.view !== "reading" || state.restoring) return;
    if (state.placeTimer) window.clearTimeout(state.placeTimer);
    state.placeTimer = window.setTimeout(savePlace, 350);
  }

  function updateChrome() {
    if (state.view !== "reading" || els.body.classList.contains("index-open")) {
      els.body.classList.remove("chrome-away");
      state.lastScrollY = window.scrollY;
      return;
    }
    var y = window.scrollY;
    if (y < 64) {
      els.body.classList.remove("chrome-away");
    } else if (y > state.lastScrollY + 10) {
      els.body.classList.add("chrome-away");
    } else if (y < state.lastScrollY - 10) {
      els.body.classList.remove("chrome-away");
    }
    state.lastScrollY = y;
  }

  function getPlace(id) {
    var saved = readStore();
    if (!saved || !saved.positions || saved.positions[id] == null) return null;
    return saved.positions[id];
  }

  function savePlace() {
    if (state.view !== "reading") return;
    var chapter = state.chapters[state.index];
    if (!chapter) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max <= 0 ? 0 : window.scrollY / max;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    var current = readStore() || {};
    var positions = current.positions || {};
    positions[chapter.id] = ratio;
    writeStore({ chapterId: chapter.id, positions: positions });
  }

  function restorePlace(id, seq) {
    var ratio = getPlace(id);
    if (ratio == null) {
      window.scrollTo(0, 0);
      return;
    }
    state.restoring = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (seq && seq !== state.loadSeq) {
          state.restoring = false;
          return;
        }
        var max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, ratio * Math.max(0, max));
        updateProgress();
        state.lastScrollY = window.scrollY;
        window.setTimeout(function () {
          state.restoring = false;
        }, 100);
      });
    });
  }

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (err) {
      return null;
    }
  }

  function writeStore(partial) {
    var current = readStore() || {};
    Object.keys(partial).forEach(function (key) {
      current[key] = partial[key];
    });
    current.updated = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (err) {
      /* private mode / blocked storage */
    }
  }

  function initAudio() {
    audio.incoming = new Audio();
    audio.outgoing = new Audio();
    audio.incoming.loop = true;
    audio.outgoing.loop = true;
    audio.incoming.preload = "none";
    audio.outgoing.preload = "none";
    audio.enabled = false;
    audio.started = false;
    paintAudioButton();
  }

  function paintAudioButton() {
    if (!els.audioToggle) return;
    els.audioToggle.setAttribute("aria-pressed", audio.enabled ? "true" : "false");
    els.audioToggle.textContent = audio.enabled ? "Atmosphere" : "Silent";
  }

  function atmosphereAudio(name) {
    var table = state.manifest && state.manifest.atmospheres;
    if (!table || !table[name] || !table[name].audio) return "";
    return table[name].audio;
  }

  function currentAudioSrc() {
    if (state.view === "cover") {
      return atmosphereAudio("floodwater") || "assets/audio/floodwater.mp3";
    }
    var chapter = state.chapters[state.index];
    return (chapter && chapter.audio) || "";
  }

  function toggleAudio() {
    audio.enabled = !audio.enabled;
    writeStore({ audioEnabled: audio.enabled });
    paintAudioButton();
    if (audio.enabled) {
      audio.started = true;
      if (speech.status === "playing" || speech.status === "paused") {
        audio.heldForSpeech = true;
      }
      syncAudio();
      if (audio.heldForSpeech && audio.incoming) audio.incoming.pause();
    } else {
      audio.started = false;
      audio.heldForSpeech = false;
      stopAudio();
    }
  }

  function syncAudio() {
    if (!audio.enabled || !audio.started) return;
    var src = currentAudioSrc();
    if (!src) {
      stopAudio();
      return;
    }
    if (src === audio.currentSrc) return;
    crossfadeTo(src);
  }

  function stopAudio() {
    if (audio.fadeTimer) {
      window.clearInterval(audio.fadeTimer);
      audio.fadeTimer = null;
    }
    [audio.incoming, audio.outgoing].forEach(function (node) {
      if (!node) return;
      node.pause();
      node.removeAttribute("src");
      node.volume = audio.volume;
    });
    audio.currentSrc = "";
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function onVisibility() {
    if (document.hidden) {
      if (audio.started && audio.enabled) {
        if (audio.incoming) audio.incoming.pause();
        if (audio.outgoing) audio.outgoing.pause();
      }
      if (speech.status === "playing") pauseSpeech();
      return;
    }
    if (speech.status === "paused") return;
    if (audio.heldForSpeech) return;
    if (audio.started && audio.enabled && audio.incoming && audio.incoming.src) {
      audio.incoming.play().catch(function () {});
    }
  }

  function crossfadeTo(src) {
    if (!audio.incoming || !audio.outgoing) return;
    var next = audio.outgoing;
    var prev = audio.incoming;
    next.pause();
    next.src = src;
    next.volume = prefersReducedMotion() ? audio.volume : 0;
    var playAttempt = next.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        audio.started = false;
        audio.enabled = false;
        paintAudioButton();
      });
    }
    audio.incoming = next;
    audio.outgoing = prev;
    audio.currentSrc = src;

    if (prefersReducedMotion()) {
      if (prev !== next) {
        prev.pause();
        prev.removeAttribute("src");
        prev.volume = audio.volume;
      }
      return;
    }

    if (audio.fadeTimer) window.clearInterval(audio.fadeTimer);
    var steps = 12;
    var step = 0;
    var startPrev = prev.src ? prev.volume : 0;
    audio.fadeTimer = window.setInterval(function () {
      step += 1;
      var t = step / steps;
      next.volume = audio.volume * t;
      if (prev.src) prev.volume = startPrev * (1 - t);
      if (step >= steps) {
        window.clearInterval(audio.fadeTimer);
        audio.fadeTimer = null;
        if (prev !== next) {
          prev.pause();
          prev.removeAttribute("src");
          prev.volume = audio.volume;
        }
      }
    }, Math.max(40, Math.floor(audio.fadeMs / steps)));
  }

  function duckAudio() {
    if (!audio.enabled || !audio.started) return;
    audio.heldForSpeech = true;
    if (audio.incoming) audio.incoming.pause();
    if (audio.outgoing) audio.outgoing.pause();
  }

  function unduckAudio() {
    if (!audio.heldForSpeech) return;
    audio.heldForSpeech = false;
    if (document.hidden) return;
    if (audio.enabled && audio.started && audio.incoming && audio.incoming.src) {
      audio.incoming.play().catch(function () {});
    }
  }

  function initSpeech() {
    if (!("speechSynthesis" in window) || !els.speakToggle) return;
    speech.available = true;
    els.speakToggle.hidden = false;
    if (typeof speechSynthesis.addEventListener === "function") {
      speechSynthesis.addEventListener("voiceschanged", function () {
        fillVoiceSelect();
        speech.voice = pickVoice();
      });
    }
    fillVoiceSelect();
    speech.voice = pickVoice();
    paintSpeakButton();
  }

  function listVoices() {
    if (!("speechSynthesis" in window)) return [];
    return speechSynthesis.getVoices() || [];
  }

  function englishVoices() {
    return listVoices().filter(function (voice) {
      return /^en\b/i.test(voice.lang || "");
    });
  }

  function voiceScore(voice) {
    var name = voice.name || "";
    var lang = voice.lang || "";
    var score = 0;
    if (/^en-GB/i.test(lang)) score += 50;
    else if (/^en-IE/i.test(lang)) score += 40;
    else if (/^en-AU/i.test(lang)) score += 28;
    else if (/^en/i.test(lang)) score += 20;
    else return -1;
    if (/natural|neural|online/i.test(name)) score += 40;
    if (/sonia|libby|ryan|jenny|aria|guy|sara|natasha|william/i.test(name)) {
      score += 8;
    }
    if (/desktop|mobile/i.test(name)) score -= 18;
    return score;
  }

  function voiceLabel(voice) {
    var name = String(voice.name || "");
    name = name.replace(/^Microsoft\s+/i, "");
    name = name.replace(/\s+Online\s*\(Natural\)/i, "");
    name = name.replace(/\s+\(Natural\)/i, "");
    name = name.replace(/\s+Desktop$/i, "");
    name = name.replace(/\s+-\s+English.*$/i, "");
    name = name.trim() || voice.name;
    var region = ((voice.lang || "").split("-")[1] || "").toUpperCase();
    return region ? name + " · " + region : name;
  }

  function pickVoice() {
    var voices = listVoices();
    if (!voices.length) return null;
    var saved = (readStore() || {}).voiceName;
    var i;
    if (saved) {
      for (i = 0; i < voices.length; i += 1) {
        if (voices[i].name === saved) return voices[i];
      }
    }
    var ranked = voices.slice().sort(function (a, b) {
      return voiceScore(b) - voiceScore(a);
    });
    if (ranked.length && voiceScore(ranked[0]) >= 0) return ranked[0];
    return voices[0] || null;
  }

  function fillVoiceSelect() {
    if (!els.voiceSelect || !els.voicePick) return;
    var voices = englishVoices();
    if (!voices.length) {
      els.voicePick.hidden = true;
      return;
    }
    voices.sort(function (a, b) {
      return voiceScore(b) - voiceScore(a);
    });
    var current = pickVoice();
    var html = [];
    for (var i = 0; i < voices.length; i += 1) {
      html.push(
        '<option value="' +
          escapeHtml(voices[i].name) +
          '">' +
          escapeHtml(voiceLabel(voices[i])) +
          "</option>"
      );
    }
    els.voiceSelect.innerHTML = html.join("");
    if (current) els.voiceSelect.value = current.name;
    els.voicePick.hidden = false;
  }

  function onVoiceChange() {
    if (!els.voiceSelect) return;
    var name = els.voiceSelect.value;
    var voices = listVoices();
    var next = null;
    for (var i = 0; i < voices.length; i += 1) {
      if (voices[i].name === name) {
        next = voices[i];
        break;
      }
    }
    if (!next) return;
    speech.voice = next;
    writeStore({ voiceName: next.name });
    if (speech.status === "playing" || speech.status === "paused") {
      var generation = (speech.generation += 1);
      try {
        speechSynthesis.cancel();
      } catch (err) {
        /* ignore */
      }
      speakNext(generation);
    }
  }

  function paintSpeakButton() {
    if (!els.speakToggle) return;
    var label = "Speak";
    if (speech.status === "playing") label = "Pause";
    else if (speech.status === "paused") label = "Resume";
    els.speakToggle.textContent = label;
    els.speakToggle.setAttribute(
      "aria-pressed",
      speech.status === "off" ? "false" : "true"
    );
  }

  function onSpeakClick(event) {
    if (!speech.available || state.view !== "reading") return;
    if (event && event.shiftKey) {
      stopSpeech();
      return;
    }
    if (speech.status === "playing") pauseSpeech();
    else if (speech.status === "paused") resumeSpeech();
    else startSpeech();
  }

  function speechChunks() {
    if (!els.article) return [];
    var nodes = els.article.querySelectorAll(
      "p, h2, h3, aside, .emphasis-block, .civic-bulletin"
    );
    var chunks = [];
    for (var i = 0; i < nodes.length; i += 1) {
      var text = nodes[i].textContent.replace(/\s+/g, " ").trim();
      if (text) chunks = chunks.concat(splitForSpeech(text));
    }
    return chunks;
  }

  function splitForSpeech(text) {
    var parts = text.match(/[^.!?]+[.!?]+(?:["”')\]]+)?|[^.!?]+$/g) || [text];
    var out = [];
    var buf = "";
    for (var i = 0; i < parts.length; i += 1) {
      var part = parts[i].trim();
      if (!part) continue;
      if (buf && (buf + " " + part).length > 280) {
        out.push(buf);
        buf = part;
      } else {
        buf = buf ? buf + " " + part : part;
      }
    }
    if (buf) out.push(buf);
    return out;
  }

  function startSpeech() {
    if (!speech.available) return;
    if ("speechSynthesis" in window) {
      try {
        speechSynthesis.cancel();
      } catch (err) {
        /* ignore */
      }
    }
    speech.queue = speechChunks();
    speech.index = 0;
    if (!speech.queue.length) return;
    var generation = (speech.generation += 1);
    speech.voice = pickVoice() || speech.voice;
    duckAudio();
    speakNext(generation);
  }

  function speakNext(generation) {
    if (generation !== speech.generation) return;
    if (speech.index >= speech.queue.length) {
      stopSpeech();
      return;
    }
    var utterance = new SpeechSynthesisUtterance(speech.queue[speech.index]);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = (speech.voice && speech.voice.lang) || "en-GB";
    if (speech.voice) utterance.voice = speech.voice;
    utterance.onend = function () {
      if (generation !== speech.generation) return;
      speech.index += 1;
      speakNext(generation);
    };
    utterance.onerror = function () {
      if (generation !== speech.generation) return;
      stopSpeech();
    };
    speech.status = "playing";
    paintSpeakButton();
    speechSynthesis.speak(utterance);
  }

  function pauseSpeech() {
    if (speech.status !== "playing") return;
    try {
      speechSynthesis.pause();
    } catch (err) {
      /* some engines reject pause */
    }
    /* Chrome/Edge often ignore pause(). Cancel the current chunk so Resume
       can replay it instead of leaving a stuck "Pause" that does nothing. */
    if (!speechSynthesis.paused) {
      try {
        speechSynthesis.cancel();
      } catch (err) {
        /* ignore */
      }
    }
    speech.status = "paused";
    paintSpeakButton();
  }

  function resumeSpeech() {
    if (speech.status !== "paused") return;
    if (speechSynthesis.paused) {
      try {
        speechSynthesis.resume();
        if (speechSynthesis.speaking || speechSynthesis.paused === false) {
          speech.status = "playing";
          paintSpeakButton();
          return;
        }
      } catch (err) {
        /* fall through and restart the current chunk */
      }
    }
    var generation = (speech.generation += 1);
    speakNext(generation);
  }

  function stopSpeech() {
    speech.generation += 1;
    speech.status = "off";
    speech.queue = [];
    speech.index = 0;
    if ("speechSynthesis" in window) {
      try {
        speechSynthesis.cancel();
      } catch (err) {
        /* ignore */
      }
    }
    paintSpeakButton();
    unduckAudio();
  }

  function showServeFault() {
    state.view = "error";
    els.body.dataset.view = "error";
    els.body.dataset.atmosphere = "floodwater";
    if (els.fault) els.fault.hidden = false;
    setStatus("Unserved");
  }
})();
