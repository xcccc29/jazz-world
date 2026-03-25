const LS_KEY = 'jazzworld_gemini_key';

const EXAMPLES = [
    { label: 'Bach — Invention No. 1', value: 'Bach Two-Part Invention No. 1 in C Major, BWV 772' },
    { label: 'Bach — WTC Prelude I/1', value: 'Bach Prelude in C Major from Well-Tempered Clavier Book I, BWV 846' },
    { label: 'Bach — Crab Canon', value: 'Bach Crab Canon from Musical Offering, BWV 1079' },
    { label: 'Mozart — K. 331 Theme', value: 'Mozart Piano Sonata No. 11, K. 331 — Theme and Variations' },
    { label: 'Mozart — Symphony 40', value: 'Mozart Symphony No. 40 in G Minor, K. 550 — First Movement' },
    { label: 'Beethoven — Moonlight', value: "Beethoven Piano Sonata No. 14 'Moonlight', Op. 27 No. 2 — First Movement" },
    { label: 'Beethoven — Ode to Joy', value: "Beethoven Symphony No. 9, Op. 125 — 'Ode to Joy' Theme" },
    { label: 'Vivaldi — Winter', value: 'Vivaldi The Four Seasons — Winter, Op. 8 No. 4, RV 297' },
    { label: 'Handel — Passacaglia', value: 'Handel Suite No. 7 in G Minor, HWV 432 — Passacaglia' },
    { label: 'Pachelbel — Canon in D', value: 'Pachelbel Canon in D Major' }
];

const state = {
    apiKey: null,
    isLoading: false
};

let btnApiKey;
let searchForm;
let pieceInput;
let btnAnalyze;
let examplesContainer;
let loadingEl;
let resultsEl;
let errorEl;
let errorMessageEl;
let btnTryAgain;
let modalApiKey;
let modalError;
let apikeyInput;
let btnSaveKey;
let btnCancelKey;
let bpKey;
let bpMode;
let bpProgressions;
let bpTechniques;
let bpDevices;
let bpSummary;
let blueprintCard;
let jazzCard1;
let jazzCard2;
let jazzCard3;
let jazz1Track;
let jazz2Track;
let jazz3Track;
let jazz1Artist;
let jazz2Artist;
let jazz3Artist;
let jazz1Album;
let jazz2Album;
let jazz3Album;
let jazz1Year;
let jazz2Year;
let jazz3Year;
let jazz1Connection;
let jazz2Connection;
let jazz3Connection;

function loadApiKey() {
    try {
        const stored = localStorage.getItem(LS_KEY);
        state.apiKey = stored && stored.trim() ? stored.trim() : null;
    } catch (err) {
        console.warn('localStorage unavailable while loading API key.', err);
        state.apiKey = null;
    }
}

function saveApiKey(key) {
    try {
        localStorage.setItem(LS_KEY, key || '');
    } catch (err) {
        console.warn('localStorage unavailable while saving API key.', err);
    }
}

function openModal(errorMsg = null) {
    if (errorMsg) {
        modalError.textContent = errorMsg;
        modalError.classList.remove('hidden');
    } else {
        modalError.textContent = '';
        modalError.classList.add('hidden');
    }
    modalApiKey.showModal();
}

function closeModal() {
    modalError.textContent = '';
    modalError.classList.add('hidden');
    if (modalApiKey.open) {
        modalApiKey.close();
    }
}

function renderExamples() {
    examplesContainer.textContent = '';

    EXAMPLES.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'example-chip';
        button.textContent = item.label;
        button.addEventListener('click', () => {
            pieceInput.value = item.value;
            searchForm.dispatchEvent(new Event('submit', { cancelable: true }));
        });
        examplesContainer.appendChild(button);
    });
}

function buildSystemPrompt() {
    return `You are a world-class Musicologist specializing in the intersection of 18th-century European Counterpoint and Mid-Century Modern Jazz (approximately 1940–1970). Your expertise lies in tracing how Bach's contrapuntal language, Baroque harmonic structures, and Classical formal devices were absorbed, transformed, and reborn in the bebop, cool jazz, and modal jazz movements.

When given a Classical piece, you analyze its Harmonic Blueprint — its key, mode, characteristic chord progressions, contrapuntal techniques, and structural devices — and identify exactly which Jazz recordings evolved from the same musical DNA.

You MUST respond with ONLY valid JSON. No prose before or after. No markdown code fences. No explanation outside the JSON.

The JSON must exactly match this schema:
{
  "piece": "string — the piece name as you understand it",
  "harmonicBlueprint": {
    "key": "string — e.g. C Major or G Minor",
    "mode": "string — e.g. Ionian, Dorian, Mixolydian, Lydian, Phrygian, Aeolian",
    "chordProgressions": ["string — 2 to 4 items, use roman numeral analysis + descriptive name, e.g. I–IV–V–I (Tonic-Subdominant-Dominant cadence)"],
    "contrapuntalTechniques": ["string — 3 to 6 named techniques from: imitation, invertible counterpoint, canon, stretto, sequence, pedal point, contrary motion, augmentation, diminution, inversion, retrograde"],
    "structuralDevices": ["string — 2 to 5 named devices, e.g. ostinato bass, arch form, binary form, ground bass, ritornello, passacaglia, theme and variation"],
    "summary": "string — 3 to 5 sentence musicological synthesis of how this piece's harmonic and contrapuntal language makes it historically significant"
  },
  "jazzConnections": [
    {
      "track": "string — full track title",
      "artist": "string — performer name",
      "album": "string — album title",
      "year": number,
      "connection": "string — 4 to 6 sentences. MUST name at least two specific shared musical elements (e.g. a specific interval pattern, harmonic device, rhythmic technique, formal structure). Explain HOW the jazz musician transformed or reinterpreted the Classical idea, not just that a similarity exists."
    }
  ]
}

The jazzConnections array MUST contain exactly 3 items. Focus on Miles Davis, Bill Evans, John Coltrane, Thelonious Monk, Charlie Parker, Herbie Hancock, Keith Jarrett, Chick Corea, Dave Brubeck, Oscar Peterson, and their contemporaries from the 1940s–1970s.`;
}

async function callGemini(pieceInputValue) {
    const userText = `Analyze this Classical piece: "${pieceInputValue}"\n\nReturn ONLY valid JSON matching the schema. No markdown, no prose.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(state.apiKey)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: buildSystemPrompt() }]
                },
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: userText }]
                    }
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 4096,
                    responseMimeType: 'application/json'
                }
            })
        }
    );

    if (response.status === 400 || response.status === 403) {
        let errBody = {};
        try { errBody = await response.json(); } catch (_) { }
        const errMsg = errBody?.error?.message || '';
        if (response.status === 403 || errMsg.toLowerCase().includes('api key')) {
            throw new Error('INVALID_KEY: Your API key appears to be invalid.');
        }
        throw new Error(`API_ERROR: Gemini returned status ${response.status}: ${errMsg || 'Bad request.'}`);
    }

    if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(
            `RATE_LIMIT: Rate limit exceeded.${retryAfter ? ` Please wait ${retryAfter} seconds.` : ' Please wait a moment.'}`
        );
    }

    if (!response.ok) {
        throw new Error(`API_ERROR: Gemini returned status ${response.status}.`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0] ?? null;

    if (!candidate || !candidate.content || !Array.isArray(candidate.content.parts) || !candidate.content.parts[0]?.text) {
        throw new Error('API_ERROR: Gemini response was missing content.');
    }

    if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('Gemini response was truncated due to maxOutputTokens limit.');
    }

    return candidate.content.parts[0].text;
}

function parseResponse(rawContent) {
    let parsed;
    try {
        parsed = JSON.parse(rawContent);
    } catch (err) {
        const preview = String(rawContent || '').slice(0, 200);
        throw new Error(`PARSE_ERROR: Failed to parse JSON response. Preview: ${preview}`);
    }

    if (!parsed || !parsed.harmonicBlueprint || !Array.isArray(parsed.jazzConnections) || parsed.jazzConnections.length !== 3) {
        throw new Error('PARSE_ERROR: Response JSON did not match expected schema.');
    }

    return parsed;
}

function showLoading() {
    loadingEl.classList.remove('hidden');
    resultsEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    btnAnalyze.disabled = true;
    state.isLoading = true;
}

function hideLoading() {
    loadingEl.classList.add('hidden');
    btnAnalyze.disabled = false;
    state.isLoading = false;
}

function setError(message) {
    hideLoading();
    resultsEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    errorMessageEl.textContent = message;
}

function renderBlueprint(blueprint) {
    bpKey.textContent = blueprint && blueprint.key ? String(blueprint.key) : '';
    bpMode.textContent = blueprint && blueprint.mode ? String(blueprint.mode) : '';

    bpProgressions.textContent = '';
    (blueprint && Array.isArray(blueprint.chordProgressions) ? blueprint.chordProgressions : []).forEach((item) => {
        const li = document.createElement('li');
        li.textContent = String(item);
        bpProgressions.appendChild(li);
    });

    bpTechniques.textContent = '';
    (blueprint && Array.isArray(blueprint.contrapuntalTechniques) ? blueprint.contrapuntalTechniques : []).forEach((item) => {
        const li = document.createElement('li');
        li.textContent = String(item);
        bpTechniques.appendChild(li);
    });

    bpDevices.textContent = '';
    (blueprint && Array.isArray(blueprint.structuralDevices) ? blueprint.structuralDevices : []).forEach((item) => {
        const li = document.createElement('li');
        li.textContent = String(item);
        bpDevices.appendChild(li);
    });

    bpSummary.textContent = blueprint && blueprint.summary ? String(blueprint.summary) : '';
}

function renderJazzCard(index, jazz) {
    const safeJazz = jazz || {};

    const trackEl = document.getElementById(`jazz-${index}-track`);
    const artistEl = document.getElementById(`jazz-${index}-artist`);
    const albumEl = document.getElementById(`jazz-${index}-album`);
    const yearEl = document.getElementById(`jazz-${index}-year`);
    const connectionEl = document.getElementById(`jazz-${index}-connection`);
    const spotifyEl = document.getElementById(`jazz-${index}-spotify`);

    trackEl.textContent = safeJazz.track ? String(safeJazz.track) : '';
    artistEl.textContent = safeJazz.artist ? String(safeJazz.artist) : '';
    albumEl.textContent = safeJazz.album ? String(safeJazz.album) : '';
    yearEl.textContent = Number.isFinite(safeJazz.year) ? String(safeJazz.year) : safeJazz.year ? String(safeJazz.year) : '';
    connectionEl.textContent = safeJazz.connection ? String(safeJazz.connection) : '';

    if (spotifyEl) {
        const query = [safeJazz.track, safeJazz.artist].filter(Boolean).join(' ');
        if (query) {
            spotifyEl.href = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
        } else {
            spotifyEl.style.display = 'none';
        }
    }
}

function renderResults(data) {
    renderBlueprint(data.harmonicBlueprint);
    renderJazzCard(1, data.jazzConnections[0]);
    renderJazzCard(2, data.jazzConnections[1]);
    renderJazzCard(3, data.jazzConnections[2]);

    blueprintCard.classList.remove('visible');
    jazzCard1.classList.remove('visible');
    jazzCard2.classList.remove('visible');
    jazzCard3.classList.remove('visible');

    resultsEl.classList.remove('hidden');

    setTimeout(() => {
        blueprintCard.classList.add('visible');
    }, 0);

    setTimeout(() => {
        jazzCard1.classList.add('visible');
    }, 150);

    setTimeout(() => {
        jazzCard2.classList.add('visible');
    }, 300);

    setTimeout(() => {
        jazzCard3.classList.add('visible');
    }, 450);
}

async function analyze(pieceInputValue) {
    if (state.isLoading) {
        return;
    }

    const trimmed = pieceInputValue.trim().slice(0, 200);
    if (!trimmed) {
        return;
    }

    if (!state.apiKey) {
        openModal();
        return;
    }

    showLoading();

    try {
        const rawContent = await callGemini(trimmed);
        const data = parseResponse(rawContent);
        hideLoading();
        renderResults(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        if (message.startsWith('INVALID_KEY')) {
            saveApiKey('');
            state.apiKey = null;
            hideLoading();
            openModal('Your API key was rejected. Please enter a valid key.');
            return;
        }

        setError(message.replace(/^[A-Z_]+: /, ''));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    btnApiKey = document.getElementById('btn-apikey');
    searchForm = document.getElementById('search-form');
    pieceInput = document.getElementById('piece-input');
    btnAnalyze = document.getElementById('btn-analyze');
    examplesContainer = document.getElementById('examples');
    loadingEl = document.getElementById('loading');
    resultsEl = document.getElementById('results');
    errorEl = document.getElementById('error');
    errorMessageEl = document.getElementById('error-message');
    btnTryAgain = document.getElementById('btn-try-again');
    modalApiKey = document.getElementById('modal-apikey');
    modalError = document.getElementById('modal-error');
    apikeyInput = document.getElementById('apikey-input');
    btnSaveKey = document.getElementById('btn-save-key');
    btnCancelKey = document.getElementById('btn-cancel-key');
    bpKey = document.getElementById('bp-key');
    bpMode = document.getElementById('bp-mode');
    bpProgressions = document.getElementById('bp-progressions');
    bpTechniques = document.getElementById('bp-techniques');
    bpDevices = document.getElementById('bp-devices');
    bpSummary = document.getElementById('bp-summary');
    blueprintCard = document.getElementById('blueprint-card');
    jazzCard1 = document.getElementById('jazz-card-1');
    jazzCard2 = document.getElementById('jazz-card-2');
    jazzCard3 = document.getElementById('jazz-card-3');
    jazz1Track = document.getElementById('jazz-1-track');
    jazz2Track = document.getElementById('jazz-2-track');
    jazz3Track = document.getElementById('jazz-3-track');
    jazz1Artist = document.getElementById('jazz-1-artist');
    jazz2Artist = document.getElementById('jazz-2-artist');
    jazz3Artist = document.getElementById('jazz-3-artist');
    jazz1Album = document.getElementById('jazz-1-album');
    jazz2Album = document.getElementById('jazz-2-album');
    jazz3Album = document.getElementById('jazz-3-album');
    jazz1Year = document.getElementById('jazz-1-year');
    jazz2Year = document.getElementById('jazz-2-year');
    jazz3Year = document.getElementById('jazz-3-year');
    jazz1Connection = document.getElementById('jazz-1-connection');
    jazz2Connection = document.getElementById('jazz-2-connection');
    jazz3Connection = document.getElementById('jazz-3-connection');

    loadApiKey();
    renderExamples();

    if (!state.apiKey) {
        openModal();
    }

    btnApiKey.addEventListener('click', () => {
        openModal();
    });

    btnSaveKey.addEventListener('click', () => {
        const key = apikeyInput.value.trim();
        saveApiKey(key);
        state.apiKey = key || null;
        closeModal();
    });

    btnCancelKey.addEventListener('click', () => {
        closeModal();
    });

    btnTryAgain.addEventListener('click', () => {
        errorEl.classList.add('hidden');
    });

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await analyze(pieceInput.value);
    });

    apikeyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnSaveKey.click();
        }
    });
});
