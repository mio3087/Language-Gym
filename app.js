/* =========================================================
   Language Gym
   Application
   ========================================================= */

"use strict";


/* =========================================================
   CONSTANTS
   ========================================================= */

const STORAGE_KEY = "languageGymData";
const BACKUP_KEY = "languageGymAutomaticBackup";


/* =========================================================
   DEFAULT DATA
   ========================================================= */

const DEFAULT_SETTINGS = {
    customColor: "#8B7CF6",
    autoVoice: false,
    voiceRate: 1,
    voicePitch: 1,
    uiLanguage: "ja",
    learningLanguage: "zh",
    randomStudy: true
};


const DEFAULT_DATA = {
    version: 1,

    settings: {
        ...DEFAULT_SETTINGS
    },

    decks: [],

    studyHistory: [],

    totalStudyTime: 0,

    totalAnswers: 0,

    totalCorrect: 0
};


/* =========================================================
   GLOBAL DATA
   ========================================================= */


/* =========================================================
   STUDY STATE
   ========================================================= */

let studyState = {
    deckId: null,
    cards: [],
    currentIndex: 0,
    answered: false,
    startTime: null,
    timerInterval: null
};


/* =========================================================
   UTILITY
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function generateId(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );

}


function nowISO() {

    return new Date().toISOString();

}


function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}


/* =========================================================
   DATA NORMALIZATION
   ========================================================= */

function normalizeCard(card) {

    if (!card || typeof card !== "object") {

        return null;

    }


    return {

        id:
            card.id ||
            generateId("card"),

        front:
            String(
                card.front ??
                card.question ??
                card.term ??
                ""
            ),

        back:
            String(
                card.back ??
                card.answer ??
                card.definition ??
                ""
            ),

        language:
            card.language ||
            appData?.settings?.learningLanguage ||
            "zh",

        createdAt:
            card.createdAt ||
            nowISO(),

        correct:
            Number(card.correct || 0),

        wrong:
            Number(card.wrong || 0),

        lastStudied:
            card.lastStudied ||
            null

    };

}


function normalizeDeck(deck) {

    if (!deck || typeof deck !== "object") {

        return null;

    }


    const cards =
        Array.isArray(deck.cards)
            ? deck.cards
                .map(normalizeCard)
                .filter(Boolean)
            : [];


    return {

        id:
            deck.id ||
            generateId("deck"),

        name:
            String(
                deck.name ||
                "新しいデッキ"
            ),

        language:
            deck.language ||
            appData?.settings?.learningLanguage ||
            "zh",

        createdAt:
            deck.createdAt ||
            nowISO(),

        cards

    };

}


function normalizeData(data) {

    const base = {
        ...DEFAULT_DATA
    };


    if (
        !data ||
        typeof data !== "object"
    ) {

        return base;

    }


    const settings = {
        ...DEFAULT_SETTINGS,
        ...(data.settings || {})
    };


    const decks =
        Array.isArray(data.decks)
            ? data.decks
                .map(normalizeDeck)
                .filter(Boolean)
            : [];


    const studyHistory =
        Array.isArray(data.studyHistory)
            ? data.studyHistory
            : [];


    return {

        version:
            data.version ||
            1,

        settings,

        decks,

        studyHistory,

        totalStudyTime:
            Number(
                data.totalStudyTime || 0
            ),

        totalAnswers:
            Number(
                data.totalAnswers || 0
            ),

        totalCorrect:
            Number(
                data.totalCorrect || 0
            )

    };

}


/* =========================================================
   LOAD / SAVE
   ========================================================= */

function loadData() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {

            return {
                ...DEFAULT_DATA,
                settings: {
                    ...DEFAULT_SETTINGS
                }
            };

        }


        const parsed =
            JSON.parse(raw);


        return normalizeData(parsed);

    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );


        return {
            ...DEFAULT_DATA,
            settings: {
                ...DEFAULT_SETTINGS
            }
        };

    }

}


function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );


        createAutomaticBackup();

        refreshAllUI();

        return true;

    } catch (error) {

        console.error(
            "データ保存エラー:",
            error
        );

        showStatus(
            "データの保存に失敗しました。",
            "error"
        );

        return false;

    }

}


/* =========================================================
   AUTOMATIC BACKUP
   ========================================================= */

function createAutomaticBackup() {

    try {

        localStorage.setItem(
            BACKUP_KEY,
            JSON.stringify({
                savedAt: nowISO(),
                data: appData
            })
        );

    } catch (error) {

        console.warn(
            "自動バックアップ作成失敗:",
            error
        );

    }

}


function restoreAutomaticBackup() {

    try {

        const raw =
            localStorage.getItem(
                BACKUP_KEY
            );


        if (!raw) {

            alert(
                "自動バックアップがありません。"
            );

            return;

        }


        const backup =
            JSON.parse(raw);


        if (
            !backup ||
            !backup.data
        ) {

            alert(
                "バックアップデータが壊れています。"
            );

            return;

        }


        const confirmed =
            confirm(
                "自動バックアップからデータを復元しますか？\n\n現在のデータはバックアップされてから復元されます。"
            );


        if (!confirmed) {

            return;

        }


        /*
         * 復元前に現在データを保護
         */

        try {

            localStorage.setItem(
                BACKUP_KEY,
                JSON.stringify({
                    savedAt: nowISO(),
                    data: appData
                })
            );

        } catch (backupError) {

            console.warn(
                "復元前バックアップ失敗:",
                backupError
            );

        }


        appData =
            normalizeData(
                backup.data
            );


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );


        refreshAllUI();


        alert(
            "バックアップから復元しました。"
        );


    } catch (error) {

        console.error(
            "バックアップ復元エラー:",
            error
        );


        alert(
            "バックアップの復元に失敗しました。"
        );

    }

}


/* =========================================================
   STATUS
   ========================================================= */

function showStatus(
    message,
    type = "success"
) {

    const element =
        document.getElementById(
            "import-status"
        );


    if (!element) {

        return;

    }


    const className =
        type === "error"
            ? "status-error"
            : "status-success";


    element.innerHTML =
        `
        <div
            class="${className}"
            style="
                padding:12px 14px;
                border-radius:12px;
                background:${
                    type === "error"
                        ? "#fff0f2"
                        : "var(--primary-light)"
                };
                color:${
                    type === "error"
                        ? "var(--danger)"
                        : "var(--primary)"
                };
            "
        >
            ${escapeHTML(message)}
        </div>
        `;

}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme(color) {

    if (
        !/^#[0-9A-Fa-f]{6}$/.test(color)
    ) {

        return;

    }


    document.documentElement
        .style
        .setProperty(
            "--primary",
            color
        );


    document.documentElement
        .style
        .setProperty(
            "--primary-light",
            makeLightColor(color)
        );


    if (
        document
            .querySelector(
                'meta[name="theme-color"]'
            )
    ) {

        document
            .querySelector(
                'meta[name="theme-color"]'
            )
            .setAttribute(
                "content",
                color
            );

    }


    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",
                    (
                        button.dataset.color ||
                        ""
                    ).toUpperCase() ===
                    color.toUpperCase()
                );

            }
        );

}


function makeLightColor(hex) {

    const clean =
        hex.replace("#", "");


    const r =
        parseInt(
            clean.substring(0, 2),
            16
        );

    const g =
        parseInt(
            clean.substring(2, 4),
            16
        );

    const b =
        parseInt(
            clean.substring(4, 6),
            16
        );


    const mix = value =>
        Math.round(
            value +
            (255 - value) * 0.86
        );


    return (
        "rgb(" +
        mix(r) +
        ", " +
        mix(g) +
        ", " +
        mix(b) +
        ")"
    );

}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

let pageHistory = ["home"];
let pageHistoryIndex = 0;


function showPage(pageName) {

    const page =
        document.getElementById(
            "page-" + pageName
        );


    if (!page) {

        return;

    }


    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "active-page"
                );

            }
        );


    page.classList.add(
        "active-page"
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.page ===
                    pageName
                );

            }
        );


    if (
        pageHistory[
            pageHistoryIndex
        ] !== pageName
    ) {

        pageHistory =
            pageHistory.slice(
                0,
                pageHistoryIndex + 1
            );


        pageHistory.push(
            pageName
        );


        pageHistoryIndex =
            pageHistory.length - 1;

    }


    updateNavigationButtons();


    if (pageName === "home") {

        renderHome();

    }


    if (pageName === "decks") {

        renderDecks();
        renderCardSearchResults(
            document.getElementById(
                "card-search-input"
            )?.value || ""
        );

    }


    if (pageName === "progress") {

        renderProgress();

    }


    if (pageName === "import") {

        renderImportDeckSelect();

    }


    if (pageName === "data-share") {

        renderDataShare();

    }


    if (pageName === "settings") {

        renderSettings();

    }

}


function updateNavigationButtons() {

    const back =
        document.querySelector(
            ".btn-back"
        );

    const forward =
        document.querySelector(
            ".btn-forward"
        );


    if (back) {

        back.disabled =
            pageHistoryIndex <= 0;

    }


    if (forward) {

        forward.disabled =
            pageHistoryIndex >=
            pageHistory.length - 1;

    }

}


function goBack() {

    if (
        pageHistoryIndex <= 0
    ) {

        return;

    }


    pageHistoryIndex--;


    showPageWithoutHistory(
        pageHistory[
            pageHistoryIndex
        ]
    );

}


function goForward() {

    if (
        pageHistoryIndex >=
        pageHistory.length - 1
    ) {

        return;

    }


    pageHistoryIndex++;


    showPageWithoutHistory(
        pageHistory[
            pageHistoryIndex
        ]
    );

}


function showPageWithoutHistory(
    pageName
) {

    const page =
        document.getElementById(
            "page-" + pageName
        );


    if (!page) {

        return;

    }


    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            element =>
                element.classList.remove(
                    "active-page"
                )
        );


    page.classList.add(
        "active-page"
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            button =>
                button.classList.toggle(
                    "active",
                    button.dataset.page ===
                    pageName
                )
        );


    updateNavigationButtons();

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    const deckCount =
        appData.decks.length;


    const cardCount =
        appData.decks.reduce(
            (total, deck) =>
                total +
                deck.cards.length,
            0
        );


    const studyTime =
        Number(
            appData.totalStudyTime || 0
        );


    const accuracy =
        appData.totalAnswers > 0
            ? Math.round(
                (
                    appData.totalCorrect /
                    appData.totalAnswers
                ) * 100
            )
            : 0;


    setText(
        "home-deck-count",
        deckCount
    );


    setText(
        "home-card-count",
        cardCount
    );


    setText(
        "home-study-time",
        formatTime(studyTime)
    );


    setText(
        "home-accuracy",
        accuracy + "%"
    );


    const message =
        document.getElementById(
            "daily-message"
        );


    if (message) {

        const messages = [
            "今日も一歩前進！",
            "少しずつでも、続けることが力になります。",
            "昨日の自分より、今日の自分を一歩先へ。",
            "5分だけでもやってみよう。",
            "Language Gymで今日も鍛えよう！"
        ];


        const day =
            new Date()
                .getDate();


        message.textContent =
            messages[
                day %
                messages.length
            ];

    }

}


/* =========================================================
   GENERIC TEXT
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            String(value);

    }

}


function formatTime(seconds) {

    seconds =
        Math.max(
            0,
            Math.floor(
                Number(seconds) || 0
            )
        );


    if (seconds < 60) {

        return seconds + "秒";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    if (minutes < 60) {

        return (
            minutes +
            "分 " +
            remainingSeconds +
            "秒"
        );

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remainingMinutes =
        minutes % 60;


    return (
        hours +
        "時間 " +
        remainingMinutes +
        "分"
    );

}


/* =========================================================
   DECKS
   ========================================================= */

function renderDecks() {

    const container =
        document.getElementById(
            "deck-list"
        );


    if (!container) {

        return;

    }


    if (
        appData.decks.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                <div class="empty-icon">
                    📚
                </div>

                <p>
                    まだデッキがありません。
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    data-go-page="import"
                    onclick="showPage('import')"
                >
                    教材をインポート
                </button>
            </div>
            `;

        return;

    }


    container.innerHTML =
        appData.decks
            .map(
                deck => {

                    return `
                    <div class="deck-card">

                        <div class="deck-name">
                            ${escapeHTML(
                                deck.name
                            )}
                        </div>

                        <div class="deck-meta">
                            ${escapeHTML(
                                deck.language ||
                                ""
                            )}
                            ・
                            ${deck.cards.length}
                            カード
                        </div>

                        <div
                            class="button-row"
                            style="margin-top:15px;"
                        >

                            <button
                                type="button"
                                class="btn btn-primary"
                                onclick="startStudy('${deck.id}')"
                            >
                                🏋️ 学習
                            </button>

                            <button
                                type="button"
                                class="btn btn-outline"
                                onclick="deleteDeck('${deck.id}')"
                            >
                                削除
                            </button>

                        </div>

                    </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   DECK DELETE
   ========================================================= */

function deleteDeck(
    deckId
) {

    const deck =
        appData.decks.find(
            item =>
                item.id === deckId
        );


    if (!deck) {

        return;

    }


    const confirmed =
        confirm(
            `「${deck.name}」を削除しますか？\n\nこのデッキのカードも削除されます。`
        );


    if (!confirmed) {

        return;

    }


    appData.decks =
        appData.decks.filter(
            item =>
                item.id !== deckId
        );


    saveData();

    renderDecks();

    renderImportDeckSelect();

    renderHome();

}


/* =========================================================
   IMPORT DECK SELECT
   ========================================================= */

function renderImportDeckSelect() {

    const select =
        document.getElementById(
            "import-deck-select"
        );


    if (!select) {

        return;

    }


    const current =
        select.value;


    select.innerHTML =
        `
        <option value="">
            新しいデッキを作成
        </option>
        `;


    appData.decks
        .forEach(
            deck => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    deck.id;


                option.textContent =
                    `${deck.name} (${deck.cards.length}カード)`;


                select.appendChild(
                    option
                );

            }
        );


    if (
        appData.decks.some(
            deck =>
                deck.id === current
        )
    ) {

        select.value =
            current;

    }

}


/* =========================================================
   CARD SEARCH
   ========================================================= */

function renderCardSearchResults(
    query = ""
) {

    const container =
        document.getElementById(
            "card-search-results"
        );


    if (!container) {

        return;

    }


    const normalizedQuery =
        String(query)
            .trim()
            .toLowerCase();


    if (!normalizedQuery) {

        container.innerHTML =
            `
            <div
                style="
                    color:var(--muted);
                    padding:15px 0;
                "
            >
                キーワードを入力するとカードを検索できます。
            </div>
            `;

        return;

    }


    const results = [];


    appData.decks.forEach(
        deck => {

            deck.cards.forEach(
                card => {

                    const front =
                        String(
                            card.front || ""
                        );

                    const back =
                        String(
                            card.back || ""
                        );


                    if (
                        (
                            front +
                            "\n" +
                            back
                        )
                            .toLowerCase()
                            .includes(
                                normalizedQuery
                            )
                    ) {

                        results.push({
                            deck,
                            card
                        });

                    }

                }
            );

        }
    );


    if (
        results.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                該当するカードがありません。
            </div>
            `;

        return;

    }


    container.innerHTML =
        results
            .map(
                result => {

                    return `
                    <div class="card-search-item">

                        <div class="search-card-front">
                            ${escapeHTML(
                                result.card.front
                            )}
                        </div>

                        <div class="search-card-back">
                            ${escapeHTML(
                                result.card.back
                            )}
                        </div>

                        <div class="search-card-meta">

                            <span>
                                📚
                                ${escapeHTML(
                                    result.deck.name
                                )}
                            </span>

                            <span>
                                ${escapeHTML(
                                    result.card.language ||
                                    result.deck.language ||
                                    ""
                                )}
                            </span>

                        </div>

                    </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   FILE IMPORT
   ========================================================= */

/*
 * スマホを含め、File.text() が使えない環境でも
 * FileReader で確実に読み込めるようにする。
 */

function readFileAsText(file) {

    return new Promise(
        function (resolve, reject) {

            if (!file) {

                reject(
                    new Error(
                        "ファイルがありません。"
                    )
                );

                return;

            }


            /*
             * File.text() が利用できる場合
             */

            if (
                typeof file.text ===
                "function"
            ) {

                file.text()
                    .then(resolve)
                    .catch(
                        function () {

                            readFileWithReader(
                                file
                            )
                                .then(resolve)
                                .catch(reject);

                        }
                    );

                return;

            }


            /*
             * FileReader fallback
             */

            readFileWithReader(file)
                .then(resolve)
                .catch(reject);

        }
    );

}


function readFileWithReader(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    resolve(
                        event.target.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "ファイルの読み込みに失敗しました。"
                        )
                    );

                };


            reader.onabort =
                function () {

                    reject(
                        new Error(
                            "ファイルの読み込みが中止されました。"
                        )
                    );

                };


            reader.readAsText(
                file,
                "UTF-8"
            );

        }
    );

}


/* =========================================================
   FILE TYPE
   ========================================================= */

function getFileExtension(file) {

    const name =
        String(
            file?.name || ""
        )
            .toLowerCase();


    const index =
        name.lastIndexOf(".");


    if (index === -1) {

        return "";

    }


    return name
        .substring(index + 1);

}


/* =========================================================
   TXT / CSV IMPORT
   ========================================================= */

async function handleFileImport(
    file
) {

    if (!file) {

        return;

    }


    const extension =
        getFileExtension(file);


    try {

        /*
         * PDF
         */

        if (
            extension === "pdf"
        ) {

            await importPDF(file);

            return;

        }


        /*
         * JSON
         *
         * 通常教材インポートとしてJSONが
         * 選ばれた場合にも対応。
         */

        if (
            extension === "json"
        ) {

            await importDataJSON(file);

            return;

        }


        /*
         * TXT / CSV
         */

        const text =
            await readFileAsText(file);


        if (
            !text ||
            !text.trim()
        ) {

            showStatus(
                `${file.name} は空のファイルです。`,
                "error"
            );

            return;

        }


        const cards =
            parseTextToCards(
                text,
                extension
            );


        if (
            cards.length === 0
        ) {

            showStatus(
                `${file.name} からカードを作成できませんでした。`,
                "error"
            );

            return;

        }


        addImportedCards(
            cards,
            file.name
        );


    } catch (error) {

        console.error(
            "教材インポートエラー:",
            error
        );


        showStatus(
            `${file.name} の読み込みに失敗しました。`,
            "error"
        );

    }

}


/* =========================================================
   TEXT PARSER
   ========================================================= */

function parseTextToCards(
    text,
    extension
) {

    const cards = [];


    /*
     * CSV
     */

    if (
        extension === "csv"
    ) {

        const rows =
            parseCSV(text);


        rows.forEach(
            function (row) {

                if (
                    row.length >= 2
                ) {

                    const front =
                        String(
                            row[0] || ""
                        ).trim();

                    const back =
                        String(
                            row[1] || ""
                        ).trim();


                    if (
                        front ||
                        back
                    ) {

                        cards.push(
                            normalizeCard({
                                front,
                                back,
                                language:
                                    appData
                                        .settings
                                        .learningLanguage
                            })
                        );

                    }

                }

            }
        );


        return cards
            .filter(Boolean);

    }


    /*
     * TXT
     *
     * 基本的には
     *
     * 表<TAB>裏
     *
     * 表,裏
     *
     * 表｜裏
     *
     * のような形式を扱う。
     */

    const lines =
        String(text)
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");


    lines.forEach(
        function (line) {

            const trimmed =
                line.trim();


            if (!trimmed) {

                return;

            }


            let parts = null;


            if (
                trimmed.includes("\t")
            ) {

                parts =
                    trimmed.split("\t");

            } else if (
                trimmed.includes("｜")
            ) {

                parts =
                    trimmed.split("｜");

            } else if (
                trimmed.includes("|")
            ) {

                parts =
                    trimmed.split("|");

            } else if (
                trimmed.includes(",")
            ) {

                parts =
                    trimmed.split(",");

            }


            if (
                parts &&
                parts.length >= 2
            ) {

                const front =
                    parts.shift()
                        .trim();

                const back =
                    parts.join(
                        extension === "csv"
                            ? ","
                            : " "
                    ).trim();


                if (
                    front ||
                    back
                ) {

                    cards.push(
                        normalizeCard({
                            front,
                            back,
                            language:
                                appData
                                    .settings
                                    .learningLanguage
                        })
                    );

                }


                return;

            }


            /*
             * 区切りがない場合は、
             * 1行を表面として扱い、
             * 裏面を空欄にする。
             *
             * データを捨てないための安全策。
             */

            cards.push(
                normalizeCard({
                    front: trimmed,
                    back: "",
                    language:
                        appData
                            .settings
                            .learningLanguage
                })
            );

        }
    );


    return cards
        .filter(Boolean);

}


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(text) {

    const rows = [];

    let row = [];

    let cell = "";

    let insideQuotes = false;


    const source =
        String(text)
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");


    for (
        let i = 0;
        i < source.length;
        i++
    ) {

        const char =
            source[i];


        const next =
            source[i + 1];


        if (
            char === '"'
        ) {

            if (
                insideQuotes &&
                next === '"'
            ) {

                cell += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;

            }


            continue;

        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";

            continue;

        }


        if (
            char === "\n" &&
            !insideQuotes
        ) {

            row.push(cell);

            rows.push(row);

            row = [];

            cell = "";

            continue;

        }


        cell += char;

    }


    if (
        cell !== "" ||
        row.length > 0
    ) {

        row.push(cell);

        rows.push(row);

    }


    return rows;

}


/* =========================================================
   ADD IMPORTED CARDS
   ========================================================= */

function addImportedCards(
    cards,
    fileName = ""
) {

    if (
        !Array.isArray(cards) ||
        cards.length === 0
    ) {

        return;

    }


    const deckSelect =
        document.getElementById(
            "import-deck-select"
        );


    const selectedDeckId =
        deckSelect
            ? deckSelect.value
            : "";


    let deck =
        selectedDeckId
            ? appData.decks.find(
                item =>
                    item.id ===
                    selectedDeckId
            )
            : null;


    /*
     * 新しいデッキ
     */

    if (!deck) {

        const baseName =
            String(
                fileName ||
                "新しいデッキ"
            )
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
                .trim();


        deck = {

            id:
                generateId("deck"),

            name:
                baseName ||
                "新しいデッキ",

            language:
                appData
                    .settings
                    .learningLanguage ||
                "zh",

            createdAt:
                nowISO(),

            cards: []

        };


        appData.decks.push(
            deck
        );

    }


    /*
     * 重複を避けながら追加
     */

    const existing =
        new Set(
            deck.cards.map(
                card =>
                    (
                        String(
                            card.front || ""
                        ) +
                        "\n" +
                        String(
                            card.back || ""
                        )
                    )
                        .trim()
                        .toLowerCase()
            )
        );


    let added = 0;


    cards.forEach(
        function (card) {

            if (!card) {

                return;

            }


            const key =
                (
                    String(
                        card.front || ""
                    ) +
                    "\n" +
                    String(
                        card.back || ""
                    )
                )
                    .trim()
                    .toLowerCase();


            /*
             * 完全に空のカードは追加しない。
             */

            if (!key) {

                return;

            }


            /*
             * 同じカードは重複追加しない。
             */

            if (
                existing.has(key)
            ) {

                return;

            }


            existing.add(key);


            deck.cards.push(
                normalizeCard({
                    ...card,
                    language:
                        card.language ||
                        deck.language
                })
            );


            added++;

        }
    );


    saveData();


    renderDecks();

    renderHome();

    renderImportDeckSelect();


    showStatus(
        `${added}枚のカードを「${deck.name}」に追加しました。`,
        "success"
    );


    /*
     * 選択ファイル一覧を少し残してから
     * 状態表示を更新。
     */

    setTimeout(
        function () {

            const selectedFiles =
                document.getElementById(
                    "selected-files"
                );


            if (selectedFiles) {

                selectedFiles.innerHTML =
                    `
                    <div
                        style="
                            color:var(--primary);
                            padding:10px 0;
                        "
                    >
                        ✅ ${added}枚を追加しました
                    </div>
                    `;

            }

        },
        300
    );

}


/* =========================================================
   PDF IMPORT
   ========================================================= */

async function importPDF(
    file
) {

    /*
     * PDF.js が読み込まれていない場合
     */

    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        showStatus(
            "PDF読み込み機能を読み込めませんでした。TXTまたはCSVを使用してください。",
            "error"
        );

        return;

    }


    try {

        const buffer =
            await file.arrayBuffer();


        const loadingTask =
            pdfjsLib.getDocument({
                data: buffer
            });


        const pdf =
            await loadingTask.promise;


        let fullText = "";


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(
                    pageNumber
                );


            const content =
                await page.getTextContent();


            const pageText =
                content.items
                    .map(
                        item =>
                            item.str
                    )
                    .join(" ");


            fullText +=
                pageText +
                "\n";

        }


        const cards =
            parseTextToCards(
                fullText,
                "txt"
            );


        if (
            cards.length === 0
        ) {

            showStatus(
                "PDFからカードを作成できませんでした。",
                "error"
            );

            return;

        }


        addImportedCards(
            cards,
            file.name
        );


    } catch (error) {

        console.error(
            "PDF読み込みエラー:",
            error
        );


        showStatus(
            "PDFの読み込みに失敗しました。",
            "error"
        );

    }

}


/* =========================================================
   JSON EXPORT
   ========================================================= */

function exportDataJSON() {

    try {

        /*
         * 書き出す前に最新データを保存。
         */

        saveData();


        const json =
            JSON.stringify(
                appData,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        const date =
            new Date()
                .toISOString()
                .slice(0, 10);


        link.download =
            `language-gym-backup-${date}.json`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


        alert(
            "データを書き出しました。"
        );


    } catch (error) {

        console.error(
            "JSON書き出しエラー:",
            error
        );


        alert(
            "データの書き出しに失敗しました。"
        );

    }

}


/* =========================================================
   JSON IMPORT
   ========================================================= */

/*
 * JSONファイルを確実に読み込む。
 *
 * 重要:
 * File.text() が動かないスマホ環境でも
 * FileReader を使って読み込む。
 */

async function importDataJSON(
    file
) {

    if (!file) {

        return;

    }


    try {

        const text =
            await readFileAsText(
                file
            );


        if (
            !text ||
            !text.trim()
        ) {

            throw new Error(
                "JSONファイルが空です。"
            );

        }


        let imported;


        try {

            imported =
                JSON.parse(text);

        } catch (parseError) {

            console.error(
                "JSON parse error:",
                parseError
            );


            throw new Error(
                "JSONファイルの形式が正しくありません。"
            );

        }


        /*
         * データ形式を検証
         */

        if (
            !imported ||
            typeof imported !==
            "object"
        ) {

            throw new Error(
                "読み込んだデータが正しくありません。"
            );

        }


        /*
         * 現在データをバックアップ
         * してから置換する。
         */

        createAutomaticBackup();


        const normalized =
            normalizeData(
                imported
            );


        /*
         * データを置換
         */

        appData =
            normalized;


        /*
         * 保存
         */

        const saved =
            saveData();


        if (!saved) {

            throw new Error(
                "読み込んだデータを保存できませんでした。"
            );

        }


        /*
         * UIをすべて更新
         */

        refreshAllUI();


        const deckCount =
            appData.decks.length;


        const cardCount =
            appData.decks.reduce(
                (
                    total,
                    deck
                ) =>
                    total +
                    deck.cards.length,
                0
            );


        alert(
            `データを読み込みました。\n\nデッキ: ${deckCount}\nカード: ${cardCount}`
        );


    } catch (error) {

        console.error(
            "JSON読み込みエラー:",
            error
        );


        alert(
            "JSONの読み込みに失敗しました。\n\n" +
            error.message
        );

    }

}


/* =========================================================
   STUDY
   ========================================================= */

function startStudy(
    deckId
) {

    const deck =
        appData.decks.find(
            item =>
                item.id === deckId
        );


    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return;

    }


    if (
        !deck.cards ||
        deck.cards.length === 0
    ) {

        alert(
            "このデッキにはカードがありません。"
        );

        return;

    }


    let cards =
        deck.cards
            .map(
                card =>
                    normalizeCard(card)
            )
            .filter(Boolean);


    /*
     * ランダム学習
     */

    if (
        appData.settings.randomStudy
    ) {

        cards =
            shuffleArray(cards);

    }


    studyState = {

        deckId:
            deck.id,

        cards,

        currentIndex:
            0,

        answered:
            false,

        startTime:
            Date.now(),

        timerInterval:
            null

    };


    const deckName =
        document.getElementById(
            "study-deck-name"
        );


    if (deckName) {

        deckName.textContent =
            deck.name;

    }


    showPage(
        "study"
    );


    startStudyTimer();

    renderCurrentStudyCard();

}


/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffleArray(
    array
) {

    const result =
        [...array];


    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];

    }


    return result;

}


/* =========================================================
   STUDY CARD
   ========================================================= */

function renderCurrentStudyCard() {

    const front =
        document.getElementById(
            "study-front"
        );

    const back =
        document.getElementById(
            "study-back"
        );

    const progress =
        document.getElementById(
            "study-progress"
        );

    const showButton =
        document.getElementById(
            "show-answer-button"
        );

    const wrongButton =
        document.getElementById(
            "wrong-button"
        );

    const correctButton =
        document.getElementById(
            "correct-button"
        );


    const card =
        studyState.cards[
            studyState.currentIndex
        ];


    if (!card) {

        finishStudy();

        return;

    }


    if (front) {

        front.textContent =
            card.front;

    }


    if (back) {

        back.textContent =
            card.back;

        back.hidden =
            true;

    }


    studyState.answered =
        false;


    if (showButton) {

        showButton.disabled =
            false;

    }


    if (wrongButton) {

        wrongButton.disabled =
            true;

    }


    if (correctButton) {

        correctButton.disabled =
            true;

    }


    if (progress) {

        progress.textContent =
            (
                studyState.currentIndex +
                1
            ) +
            " / " +
            studyState.cards.length;

    }


    if (
        appData.settings.autoVoice
    ) {

        speakCard(
            card
        );

    }

}


/* =========================================================
   SHOW ANSWER
   ========================================================= */

function showStudyAnswer() {

    const card =
        studyState.cards[
            studyState.currentIndex
        ];


    if (!card) {

        return;

    }


    const back =
        document.getElementById(
            "study-back"
        );


    const showButton =
        document.getElementById(
            "show-answer-button"
        );

    const wrongButton =
        document.getElementById(
            "wrong-button"
        );

    const correctButton =
        document.getElementById(
            "correct-button"
        );


    if (back) {

        back.hidden =
            false;

    }


    studyState.answered =
        true;


    if (showButton) {

        showButton.disabled =
            true;

    }


    if (wrongButton) {

        wrongButton.disabled =
            false;

    }


    if (correctButton) {

        correctButton.disabled =
            false;

    }

}


/* =========================================================
   STUDY ANSWER
   ========================================================= */

function handleStudyCorrect() {

    handleStudyAnswer(
        true
    );

}


function handleStudyWrong() {

    handleStudyAnswer(
        false
    );

}


function handleStudyAnswer(
    correct
) {

    if (
        !studyState.answered
    ) {

        return;

    }


    const card =
        studyState.cards[
            studyState.currentIndex
        ];


    if (!card) {

        return;

    }


    /*
     * 元デッキのカードを探す
     */

    const deck =
        appData.decks.find(
            item =>
                item.id ===
                studyState.deckId
        );


    if (deck) {

        const original =
            deck.cards.find(
                item =>
                    item.id ===
                    card.id
            );


        if (original) {

            if (correct) {

                original.correct =
                    Number(
                        original.correct ||
                        0
                    ) + 1;

            } else {

                original.wrong =
                    Number(
                        original.wrong ||
                        0
                    ) + 1;

            }


            original.lastStudied =
                nowISO();

        }

    }


    appData.totalAnswers =
        Number(
            appData.totalAnswers || 0
        ) + 1;


    if (correct) {

        appData.totalCorrect =
            Number(
                appData.totalCorrect || 0
            ) + 1;

    }


    appData.studyHistory.push({

        id:
            generateId("history"),

        deckId:
            studyState.deckId,

        cardId:
            card.id,

        correct:
            Boolean(correct),

        timestamp:
            nowISO()

    });


    saveData();


    studyState.currentIndex++;


    if (
        studyState.currentIndex >=
        studyState.cards.length
    ) {

        finishStudy();

        return;

    }


    renderCurrentStudyCard();

}


/* =========================================================
   STUDY TIMER
   ========================================================= */

function startStudyTimer() {

    stopStudyTimer();


    studyState.startTime =
        Date.now();


    const timer =
        document.getElementById(
            "study-timer"
        );


    if (timer) {

        timer.textContent =
            "0秒";

    }


    studyState.timerInterval =
        setInterval(
            function () {

                if (!studyState.startTime) {

                    return;

                }


                const elapsed =
                    Math.floor(
                        (
                            Date.now() -
                            studyState.startTime
                        ) /
                        1000
                    );


                if (timer) {

                    timer.textContent =
                        formatTime(
                            elapsed
                        );

                }

            },
            1000
        );

}


function stopStudyTimer() {

    if (
        studyState.timerInterval
    ) {

        clearInterval(
            studyState.timerInterval
        );

        studyState.timerInterval =
            null;

    }

}


/* =========================================================
   FINISH STUDY
   ========================================================= */

function finishStudy() {

    const started =
        studyState.startTime;


    stopStudyTimer();


    if (started) {

        const elapsed =
            Math.max(
                0,
                Math.floor(
                    (
                        Date.now() -
                        started
                    ) /
                    1000
                )
            );


        if (
            elapsed > 0
        ) {

            appData.totalStudyTime =
                Number(
                    appData.totalStudyTime ||
                    0
                ) +
                elapsed;

        }

    }


    saveData();


    studyState = {

        deckId: null,

        cards: [],

        currentIndex: 0,

        answered: false,

        startTime: null,

        timerInterval: null

    };


    showPage(
        "decks"
    );

}


/* =========================================================
   VOICE
   ========================================================= */

function speakCard(
    card
) {

    if (
        typeof speechSynthesis ===
        "undefined"
    ) {

        return;

    }


    if (!card) {

        return;

    }


    const text =
        String(
            card.front || ""
        )
            .trim();


    if (!text) {

        return;

    }


    try {

        speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                text
            );


        utterance.rate =
            clamp(
                Number(
                    appData
                        .settings
                        .voiceRate ||
                    1
                ),
                0.5,
                2
            );


        utterance.pitch =
            clamp(
                Number(
                    appData
                        .settings
                        .voicePitch ||
                    1
                ),
                0,
                2
            );


        const language =
            card.language ||
            appData
                .settings
                .learningLanguage ||
            "zh";


        utterance.lang =
            getSpeechLanguage(
                language
            );


        speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.warn(
            "音声再生エラー:",
            error
        );

    }

}


function getSpeechLanguage(
    language
) {

    const map = {

        zh: "zh-CN",

        ja: "ja-JP",

        ko: "ko-KR",

        de: "de-DE",

        fr: "fr-FR",

        es: "es-ES",

        it: "it-IT",

        fi: "fi-FI",

        en: "en-US"

    };


    return (
        map[language] ||
        "en-US"
    );

}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    setText(
        "progress-total-time",
        formatTime(
            appData.totalStudyTime
        )
    );


    setText(
        "progress-total-answers",
        appData.totalAnswers
    );


    setText(
        "progress-total-correct",
        appData.totalCorrect
    );


    const accuracy =
        appData.totalAnswers > 0
            ? Math.round(
                (
                    appData.totalCorrect /
                    appData.totalAnswers
                ) *
                100
            )
            : 0;


    setText(
        "progress-accuracy",
        accuracy + "%"
    );


    const container =
        document.getElementById(
            "progress-table"
        );


    if (!container) {

        return;

    }


    if (
        !appData.studyHistory ||
        appData.studyHistory.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                まだ学習記録がありません。
            </div>
            `;

        return;

    }


    const history =
        [
            ...appData.studyHistory
        ]
            .reverse()
            .slice(0, 100);


    container.innerHTML =
        `
        <table>

            <thead>

                <tr>

                    <th>
                        日時
                    </th>

                    <th>
                        デッキ
                    </th>

                    <th>
                        結果
                    </th>

                </tr>

            </thead>

            <tbody>

                ${
                    history
                        .map(
                            item => {

                                const deck =
                                    appData.decks.find(
                                        d =>
                                            d.id ===
                                            item.deckId
                                    );


                                const date =
                                    item.timestamp
                                        ? new Date(
                                            item.timestamp
                                        )
                                            .toLocaleString(
                                                "ja-JP"
                                            )
                                        : "";


                                return `
                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            date
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            deck?.name ||
                                            "削除されたデッキ"
                                        )}
                                    </td>

                                    <td>
                                        ${
                                            item.correct
                                                ? "⭕ 正解"
                                                : "❌ 不正解"
                                        }
                                    </td>

                                </tr>
                                `;

                            }
                        )
                        .join("")
                }

            </tbody>

        </table>
        `;

}


/* =========================================
   Language Gym
   app.js
   データ管理
   ========================================= */


let appData = loadData();

let currentPage = "home";



/* =========================================
   DEFAULT DATA
   ========================================= */

function createDefaultData() {

    return {
        decks: [],

        settings: {
            customColor: "#8B7CF6",
            autoVoice: false,
            voiceRate: 1,
            voicePitch: 1,
            uiLanguage: "ja",
            learningLanguage: "zh",
            randomStudy: true
        },

        statistics: {
            totalStudyTime: 0,
            totalAnswers: 0,
            totalCorrect: 0
        },

        studyHistory: [],

        version: 1
    };
}


/* =========================================
   SAFE DEEP COPY
   ========================================= */

function cloneData(data) {

    try {

        return JSON.parse(
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "データコピーに失敗しました",
            error
        );

        return null;
    }
}


/* =========================================
   DATA NORMALIZE
   ========================================= */

function normalizeData(data) {

    const defaultData =
        createDefaultData();

    if (
        !data ||
        typeof data !== "object"
    ) {

        return defaultData;
    }


    if (!Array.isArray(data.decks)) {
        data.decks = [];
    }


    if (
        !data.settings ||
        typeof data.settings !== "object"
    ) {

        data.settings =
            defaultData.settings;
    }


    if (
        !data.statistics ||
        typeof data.statistics !== "object"
    ) {

        data.statistics =
            defaultData.statistics;
    }


    if (
        !Array.isArray(data.studyHistory)
    ) {

        data.studyHistory = [];
    }


    data.settings.customColor =
        typeof data.settings.customColor ===
        "string"
            ? data.settings.customColor
            : "#8B7CF6";


    data.settings.autoVoice =
        Boolean(
            data.settings.autoVoice
        );


    data.settings.voiceRate =
        Number.isFinite(
            Number(data.settings.voiceRate)
        )
            ? Number(data.settings.voiceRate)
            : 1;


    data.settings.voicePitch =
        Number.isFinite(
            Number(data.settings.voicePitch)
        )
            ? Number(data.settings.voicePitch)
            : 1;


    data.settings.uiLanguage =
        data.settings.uiLanguage ||
        "ja";


    data.settings.learningLanguage =
        data.settings.learningLanguage ||
        "zh";


    data.settings.randomStudy =
        data.settings.randomStudy !== false;


    data.statistics.totalStudyTime =
        Number(
            data.statistics.totalStudyTime
        ) || 0;


    data.statistics.totalAnswers =
        Number(
            data.statistics.totalAnswers
        ) || 0;


    data.statistics.totalCorrect =
        Number(
            data.statistics.totalCorrect
        ) || 0;


    data.version =
        Number(data.version) || 1;


    return data;
}


/* =========================================
   LOAD DATA
   ========================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            return createDefaultData();
        }


        const parsed =
            JSON.parse(saved);


        return normalizeData(parsed);

    } catch (error) {

        console.error(
            "Language Gymデータ読み込みエラー:",
            error
        );


        /*
         * 壊れたデータを上書きしない。
         * 新規データとして動作させるだけ。
         */

        return createDefaultData();
    }
}


/* =========================================
   SAVE DATA
   ========================================= */

function saveData() {

    try {

        const backup =
            localStorage.getItem(
                STORAGE_KEY
            );


        /*
         * 現在保存されている正常なデータを
         * バックアップとして保持。
         */

        if (backup) {

            localStorage.setItem(
                BACKUP_KEY,
                backup
            );

        }


        const dataToSave =
            cloneData(appData);


        if (!dataToSave) {
            return false;
        }


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                dataToSave
            )
        );


        return true;

    } catch (error) {

        console.error(
            "Language Gymデータ保存エラー:",
            error
        );

        return false;
    }
}


/* =========================================
   AUTOMATIC BACKUP
   ========================================= */

function restoreAutomaticBackup() {

    try {

        const backup =
            localStorage.getItem(
                BACKUP_KEY
            );


        if (!backup) {

            alert(
                "復元できるバックアップがありません。"
            );

            return;
        }


        const parsed =
            JSON.parse(backup);


        const normalized =
            normalizeData(parsed);


        const confirmed =
            confirm(
                "バックアップからデータを復元します。\n\n" +
                "現在のデータはバックアップの内容に置き換わります。\n" +
                "復元しますか？"
            );


        if (!confirmed) {
            return;
        }


        appData =
            normalized;


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );


        alert(
            "バックアップから復元しました。"
        );


        refreshAll();

    } catch (error) {

        console.error(
            "バックアップ復元エラー:",
            error
        );


        alert(
            "バックアップの復元に失敗しました。"
        );
    }
}


/* =========================================
   ID
   ========================================= */

function createId(prefix) {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );
}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   PAGE NAVIGATION
   ========================================= */

function showPage(pageName) {

    const page =
        document.getElementById(
            "page-" + pageName
        );


    if (!page) {
        return;
    }


    document
        .querySelectorAll(".page")
        .forEach(
            function (element) {

                element.classList.remove(
                    "active-page"
                );

            }
        );


    page.classList.add(
        "active-page"
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.page ===
                    pageName
                );

            }
        );


    currentPage =
        pageName;


    updateHeader();


    if (pageName === "home") {
        renderHome();
    }

    if (pageName === "decks") {
        renderDecks();
        renderCardSearchResults("");
    }

    if (pageName === "progress") {
        renderProgress();
    }

    if (pageName === "import") {
        renderImportDeckSelect();
    }


    if (pageName === "settings") {
        renderSettings();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   HEADER
   ========================================= */

function updateHeader() {

    const header =
        document.getElementById(
            "header-language"
        );


    if (!header) {
        return;
    }


    const languageNames = {

        zh: "中国語",

        ja: "日本語",

        ko: "韓国語",

        de: "ドイツ語",

        fr: "フランス語",

        es: "スペイン語",

        it: "イタリア語",

        fi: "フィンランド語"

    };


    const language =
        appData.settings &&
        appData.settings.learningLanguage;


    header.textContent =
        languageNames[language] ||
        "Language Gym";
}


/* =========================================
   THEME
   ========================================= */

function applyTheme(color) {

    if (
        !color ||
        !/^#[0-9A-Fa-f]{6}$/.test(color)
    ) {

        color = "#8B7CF6";
    }


    document.documentElement.style
        .setProperty(
            "--primary",
            color
        );


    /*
     * primary-lightを自動生成
     */

    const hex =
        color.replace("#", "");


    const r =
        parseInt(
            hex.substring(0, 2),
            16
        );

    const g =
        parseInt(
            hex.substring(2, 4),
            16
        );

    const b =
        parseInt(
            hex.substring(4, 6),
            16
        );


    const mix =
        function (value) {

            return Math.round(
                value +
                (255 - value) * 0.88
            );

        };


    const lightColor =
        "rgb(" +
        mix(r) +
        ", " +
        mix(g) +
        ", " +
        mix(b) +
        ")";


    document.documentElement.style
        .setProperty(
            "--primary-light",
            lightColor
        );
}


/* =========================================
   SETTINGS RENDER
   ========================================= */

function renderSettings() {

    if (
        !appData.settings
    ) {
        return;
    }


    const autoVoice =
        document.getElementById(
            "auto-voice"
        );

    const randomStudy =
        document.getElementById(
            "random-study"
        );

    const voiceRate =
        document.getElementById(
            "voice-rate"
        );

    const voicePitch =
        document.getElementById(
            "voice-pitch"
        );

    const uiLanguage =
        document.getElementById(
            "ui-language"
        );

    const learningLanguage =
        document.getElementById(
            "learning-language"
        );

    const customColor =
        document.getElementById(
            "custom-color"
        );

    const customColorValue =
        document.getElementById(
            "custom-color-value"
        );


    if (autoVoice) {

        autoVoice.checked =
            Boolean(
                appData.settings.autoVoice
            );

    }


    if (randomStudy) {

        randomStudy.checked =
            appData.settings.randomStudy !== false;

    }


    if (voiceRate) {

        voiceRate.value =
            appData.settings.voiceRate || 1;

    }


    if (voicePitch) {

        voicePitch.value =
            appData.settings.voicePitch || 1;

    }


    if (uiLanguage) {

        uiLanguage.value =
            appData.settings.uiLanguage || "ja";

    }


    if (learningLanguage) {

        learningLanguage.value =
            appData.settings.learningLanguage ||
            "zh";

    }


    if (customColor) {

        customColor.value =
            appData.settings.customColor ||
            "#8B7CF6";

    }


    if (customColorValue) {

        customColorValue.textContent =
            (
                appData.settings.customColor ||
                "#8B7CF6"
            ).toUpperCase();

    }


    applyTheme(
        appData.settings.customColor ||
        "#8B7CF6"
    );


    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(
            function (button) {

                const selected =
                    button.dataset.color &&
                    button.dataset.color
                        .toUpperCase() ===
                    (
                        appData.settings.customColor ||
                        "#8B7CF6"
                    ).toUpperCase();


                button.classList.toggle(
                    "selected",
                    selected
                );

            }
        );
}




/* =========================================
   DECK FUNCTIONS
   ========================================= */

/*
 * デッキを取得
 */
function getDeck(deckId) {

    return appData.decks.find(
        function (deck) {
            return deck.id === deckId;
        }
    ) || null;
}


/*
 * デッキ名の重複を避ける
 */
function createUniqueDeckName(baseName) {

    const name =
        String(baseName || "新しいデッキ")
            .trim() ||
        "新しいデッキ";


    const existingNames =
        appData.decks.map(
            function (deck) {
                return String(deck.name || "");
            }
        );


    if (!existingNames.includes(name)) {
        return name;
    }


    let number = 2;

    while (
        existingNames.includes(
            name + " (" + number + ")"
        )
    ) {

        number++;
    }


    return name + " (" + number + ")";
}


/*
 * デッキ作成
 */
function createDeck(
    name,
    language
) {

    const deck = {

        id: createId("deck"),

        name:
            createUniqueDeckName(name),

        language:
            language ||
            appData.settings.learningLanguage ||
            "zh",

        cards: [],

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    appData.decks.push(deck);

    saveData();

    return deck;
}


/*
 * デッキ削除
 */
function deleteDeck(deckId) {

    const deck =
        getDeck(deckId);


    if (!deck) {
        return;
    }


    const confirmed =
        confirm(
            "「" +
            (deck.name || "このデッキ") +
            "」を削除しますか？\n\n" +
            "このデッキに入っているカードも削除されます。"
        );


    if (!confirmed) {
        return;
    }


    appData.decks =
        appData.decks.filter(
            function (item) {
                return item.id !== deckId;
            }
        );


    saveData();

    renderDecks();
    renderImportDeckSelect();
    renderHome();

    alert("デッキを削除しました。");
}


/*
 * デッキ表示
 */
function renderDecks() {

    const container =
        document.getElementById(
            "deck-list"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(
            appData.decks
        ) ||
        appData.decks.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>

                <p>
                    まだデッキがありません。
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    data-go-page="import"
                >
                    教材をインポート
                </button>
            </div>
        `;


        const button =
            container.querySelector(
                "[data-go-page='import']"
            );


        if (button) {

            button.addEventListener(
                "click",
                function () {

                    showPage("import");

                }
            );

        }


        return;
    }


    container.innerHTML =
        appData.decks
            .map(
                function (deck) {

                    const cards =
                        Array.isArray(
                            deck.cards
                        )
                            ? deck.cards
                            : [];


                    return `
                        <div class="deck-card">

                            <div class="deck-name">
                                ${escapeHTML(
                                    deck.name ||
                                    "名称未設定"
                                )}
                            </div>

                            <div class="deck-meta">
                                🌐
                                ${escapeHTML(
                                    getLanguageName(
                                        deck.language
                                    )
                                )}
                            </div>

                            <div class="deck-meta">
                                🃏
                                ${cards.length}
                                カード
                            </div>

                            <div
                                class="button-row"
                                style="margin-top:16px;"
                            >

                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    data-study-deck="${escapeHTML(
                                        deck.id
                                    )}"
                                >
                                    🏋️ 学習
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-outline"
                                    data-search-deck="${escapeHTML(
                                        deck.id
                                    )}"
                                >
                                    🔎 カードを見る
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    data-delete-deck="${escapeHTML(
                                        deck.id
                                    )}"
                                >
                                    🗑️ 削除
                                </button>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");


    /*
     * 学習ボタン
     */

    container
        .querySelectorAll(
            "[data-study-deck]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        startStudy(
                            this.dataset.studyDeck
                        );

                    }
                );

            }
        );


    /*
     * カード検索
     */

    container
        .querySelectorAll(
            "[data-search-deck]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const deckId =
                            this.dataset.searchDeck;


                        showPage("decks");


                        const input =
                            document.getElementById(
                                "card-search-input"
                            );


                        if (input) {

                            input.value = "";


                            input.focus();

                        }


                        renderCardSearchResults(
                            "",
                            deckId
                        );

                    }
                );

            }
        );


    /*
     * 削除ボタン
     */

    container
        .querySelectorAll(
            "[data-delete-deck]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteDeck(
                            this.dataset.deleteDeck
                        );

                    }
                );

            }
        );
}


/* =========================================
   LANGUAGE
   ========================================= */

function getLanguageName(
    language
) {

    const names = {

        zh: "中国語",

        ja: "日本語",

        ko: "韓国語",

        de: "ドイツ語",

        fr: "フランス語",

        es: "スペイン語",

        it: "イタリア語",

        fi: "フィンランド語"

    };


    return (
        names[language] ||
        language ||
        "不明"
    );
}


/* =========================================
   CARD NORMALIZATION
   ========================================= */

function normalizeCard(card) {

    if (
        !card ||
        typeof card !== "object"
    ) {

        return null;
    }


    /*
     * 以前のデータ形式にも
     * できるだけ対応する。
     */

    const front =
        card.front !== undefined
            ? card.front
            : (
                card.question !== undefined
                    ? card.question
                    : ""
            );


    const back =
        card.back !== undefined
            ? card.back
            : (
                card.answer !== undefined
                    ? card.answer
                    : ""
            );


    return {

        id:
            card.id ||
            createId("card"),

        front:
            String(front ?? ""),

        back:
            String(back ?? ""),

        language:
            card.language ||
            null,

        createdAt:
            card.createdAt ||
            new Date().toISOString(),

        updatedAt:
            card.updatedAt ||
            new Date().toISOString(),

        correctCount:
            Number(
                card.correctCount
            ) || 0,

        wrongCount:
            Number(
                card.wrongCount
            ) || 0,

        lastReviewedAt:
            card.lastReviewedAt ||
            null

    };
}


/* =========================================
   ADD CARD
   ========================================= */

function addCard(
    deck,
    front,
    back,
    language
) {

    if (!deck) {
        return null;
    }


    const normalizedFront =
        String(front ?? "").trim();


    const normalizedBack =
        String(back ?? "").trim();


    if (
        !normalizedFront &&
        !normalizedBack
    ) {

        return null;
    }


    if (
        !Array.isArray(deck.cards)
    ) {

        deck.cards = [];
    }


    const card = {

        id: createId("card"),

        front:
            normalizedFront,

        back:
            normalizedBack,

        language:
            language ||
            deck.language ||
            appData.settings.learningLanguage,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        correctCount: 0,

        wrongCount: 0,

        lastReviewedAt: null

    };


    deck.cards.push(card);

    deck.updatedAt =
        new Date().toISOString();


    return card;
}


/* =========================================
   HOME
   ========================================= */

function renderHome() {

    const deckCount =
        appData.decks.length;


    let cardCount = 0;


    appData.decks.forEach(
        function (deck) {

            if (
                Array.isArray(deck.cards)
            ) {

                cardCount +=
                    deck.cards.length;

            }

        }
    );


    const totalTime =
        Number(
            appData.statistics.totalStudyTime
        ) || 0;


    const totalAnswers =
        Number(
            appData.statistics.totalAnswers
        ) || 0;


    const totalCorrect =
        Number(
            appData.statistics.totalCorrect
        ) || 0;


    const accuracy =
        totalAnswers > 0
            ? Math.round(
                totalCorrect /
                totalAnswers *
                100
            )
            : 0;


    const deckElement =
        document.getElementById(
            "home-deck-count"
        );


    const cardElement =
        document.getElementById(
            "home-card-count"
        );


    const timeElement =
        document.getElementById(
            "home-study-time"
        );


    const accuracyElement =
        document.getElementById(
            "home-accuracy"
        );


    if (deckElement) {

        deckElement.textContent =
            deckCount;

    }


    if (cardElement) {

        cardElement.textContent =
            cardCount;

    }


    if (timeElement) {

        timeElement.textContent =
            formatStudyTime(
                totalTime
            );

    }


    if (accuracyElement) {

        accuracyElement.textContent =
            accuracy + "%";

    }


    renderDailyMessage();

    updateHeader();
}


/* =========================================
   DAILY MESSAGE
   ========================================= */

function renderDailyMessage() {

    const element =
        document.getElementById(
            "daily-message"
        );


    if (!element) {
        return;
    }


    const messages = [

        "今日も一歩前進！",

        "完璧じゃなくて大丈夫。1枚でも進めよう。",

        "昨日の自分より、ほんの少し強くなろう。",

        "5分だけでも立派な学習です。",

        "間違いは、次に覚えるためのヒントです。",

        "今日の1枚が、未来の語学力を作ります。",

        "少しずつでも、続けば大きな力になります。",

        "Language Gymで今日もトレーニング！"

    ];


    const day =
        new Date().getDate();


    element.textContent =
        messages[
            day % messages.length
        ];
}


/* =========================================
   TIME FORMAT
   ========================================= */

function formatStudyTime(
    seconds
) {

    seconds =
        Math.max(
            0,
            Math.floor(
                Number(seconds) || 0
            )
        );


    if (seconds < 60) {

        return seconds + "秒";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return minutes + "分";
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remainingMinutes =
        minutes % 60;


    return (
        hours +
        "時間 " +
        remainingMinutes +
        "分"
    );
}


/* =========================================
   IMPORT DECK SELECT
   ========================================= */

function renderImportDeckSelect() {

    const select =
        document.getElementById(
            "import-deck-select"
        );


    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            新しいデッキを作成
        </option>
    `;


    appData.decks.forEach(
        function (deck) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                deck.id;


            option.textContent =
                (
                    deck.name ||
                    "名称未設定"
                ) +
                " (" +
                (
                    Array.isArray(deck.cards)
                        ? deck.cards.length
                        : 0
                ) +
                "カード)";


            select.appendChild(
                option
            );

        }
    );


    if (
        currentValue &&
        appData.decks.some(
            function (deck) {
                return deck.id === currentValue;
            }
        )
    ) {

        select.value =
            currentValue;

    }
}


/* =========================================
   FILE IMPORT
   TXT / CSV / PDF
   ========================================= */

/*
 * ファイル名からデッキ名を作る
 */
function getDeckNameFromFile(
    fileName
) {

    return String(
        fileName || "インポート教材"
    )
        .replace(
            /\.[^/.]+$/,
            ""
        )
        .trim() ||
        "インポート教材";
}


/*
 * 現在選択されている
 * 学習言語を取得
 */
function getSelectedImportLanguage() {

    const select =
        document.getElementById(
            "import-language-select"
        );


    if (select && select.value) {

        return select.value;

    }


    if (
        appData &&
        appData.settings &&
        appData.settings.learningLanguage
    ) {

        return appData.settings.learningLanguage;

    }


    return "zh";
}


/*
 * 現在選択されている
 * 追加先デッキを取得
 */
function getSelectedImportDeck() {

    const select =
        document.getElementById(
            "import-deck-select"
        );


    if (!select || !select.value) {

        return null;

    }


    return getDeck(
        select.value
    );
}


/*
 * インポート状況を表示
 */
function setImportStatus(
    message,
    type
) {

    const element =
        document.getElementById(
            "import-status"
        );


    if (!element) {
        return;
    }


    let background =
        "var(--primary-light)";

    let color =
        "var(--primary)";


    if (type === "success") {

        background = "#edf9f0";
        color = "#278a46";

    }


    if (type === "error") {

        background = "#fff0f2";
        color = "var(--danger)";

    }


    if (type === "warning") {

        background = "#fff8e6";
        color = "#a06a00";

    }


    element.innerHTML = `
        <div
            style="
                padding:14px 16px;
                border-radius:12px;
                background:${background};
                color:${color};
                line-height:1.6;
            "
        >
            ${escapeHTML(message)}
        </div>
    `;
}


/*
 * 選択ファイル一覧を表示
 */
function renderSelectedFiles(
    files
) {

    const container =
        document.getElementById(
            "selected-files"
        );


    if (!container) {
        return;
    }


    if (
        !files ||
        files.length === 0
    ) {

        container.innerHTML = "";

        return;
    }


    container.innerHTML =
        Array.from(files)
            .map(
                function (file) {

                    return `
                        <div class="selected-file">

                            <span>
                                📄
                                ${escapeHTML(
                                    file.name
                                )}
                            </span>

                            <span
                                style="
                                    color:var(--muted);
                                    font-size:13px;
                                "
                            >
                                ${formatFileSize(
                                    file.size
                                )}
                            </span>

                        </div>
                    `;

                }
            )
            .join("");
}


/*
 * ファイルサイズ
 */
function formatFileSize(
    bytes
) {

    const size =
        Number(bytes) || 0;


    if (size < 1024) {

        return size + " B";

    }


    if (size < 1024 * 1024) {

        return (
            Math.round(
                size / 1024
            ) +
            " KB"
        );

    }


    return (
        (
            size /
            1024 /
            1024
        ).toFixed(1) +
        " MB"
    );
}


/*
 * TXTを読み込む
 */
async function readTextFile(
    file
) {

    return await file.text();

}


/*
 * CSVを読み込む
 *
 * シンプルなCSVに対応。
 * 1列目 = 表
 * 2列目 = 裏
 */
function parseCSV(
    text
) {

    const rows = [];

    let row = [];

    let cell = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];


        const next =
            text[i + 1];


        if (
            char === '"' &&
            insideQuotes &&
            next === '"'
        ) {

            cell += '"';

            i++;

            continue;
        }


        if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

            continue;
        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";

            continue;
        }


        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }


            row.push(cell);

            rows.push(row);

            row = [];

            cell = "";

            continue;
        }


        cell += char;
    }


    if (
        cell !== "" ||
        row.length > 0
    ) {

        row.push(cell);

        rows.push(row);

    }


    return rows
        .map(
            function (items) {

                return items.map(
                    function (item) {

                        return String(
                            item
                        ).trim();

                    }
                );

            }
        )
        .filter(
            function (items) {

                return items.some(
                    function (item) {

                        return item !== "";

                    }
                );

            }
        );
}


/*
 * CSVからカードを作る
 */
function cardsFromCSV(
    text
) {

    const rows =
        parseCSV(text);


    const cards = [];


    rows.forEach(
        function (row) {

            if (
                row.length < 2
            ) {

                return;

            }


            const front =
                String(
                    row[0] || ""
                ).trim();


            const back =
                String(
                    row[1] || ""
                ).trim();


            if (
                !front &&
                !back
            ) {

                return;

            }


            cards.push({

                front: front,

                back: back

            });

        }
    );


    return cards;
}


/*
 * TXTからカードを作る
 *
 * 対応形式：
 *
 * 表<TAB>裏
 *
 * 表 | 裏
 *
 * 表 / 裏
 *
 * 表
 * 裏
 *
 * 空行でカードを区切る形式
 */
function cardsFromTXT(
    text
) {

    const normalized =
        String(
            text || ""
        )
            .replace(
                /\r\n/g,
                "\n"
            )
            .replace(
                /\r/g,
                "\n"
            );


    /*
     * まず空行区切りを確認
     */

    const blocks =
        normalized
            .split(/\n\s*\n/)
            .map(
                function (block) {
                    return block.trim();
                }
            )
            .filter(
                function (block) {
                    return block !== "";
                }
            );


    const cards = [];


    /*
     * 1ブロックずつ処理
     */

    blocks.forEach(
        function (block) {

            const lines =
                block
                    .split("\n")
                    .map(
                        function (line) {
                            return line.trim();
                        }
                    )
                    .filter(
                        function (line) {
                            return line !== "";
                        }
                    );


            if (
                lines.length >= 2 &&
                !findSeparator(
                    lines[0]
                )
            ) {

                cards.push({

                    front: lines[0],

                    back:
                        lines
                            .slice(1)
                            .join("\n")

                });

                return;

            }


            lines.forEach(
                function (line) {

                    const pair =
                        splitCardLine(
                            line
                        );


                    if (pair) {

                        cards.push({

                            front:
                                pair.front,

                            back:
                                pair.back

                        });

                    }

                }
            );

        }
    );


    /*
     * 空行がなかった場合
     */

    if (
        cards.length === 0
    ) {

        normalized
            .split("\n")
            .map(
                function (line) {
                    return line.trim();
                }
            )
            .filter(
                function (line) {
                    return line !== "";
                }
            )
            .forEach(
                function (line) {

                    const pair =
                        splitCardLine(
                            line
                        );


                    if (pair) {

                        cards.push(pair);

                    }

                }
            );

    }


    return cards;
}


/*
 * 区切り文字を探す
 */
function findSeparator(
    line
) {

    const separators = [
        "\t",
        "｜",
        "|",
        "／",
        "/",
        "⇒",
        "→"
    ];


    return separators.find(
        function (separator) {

            return line.includes(
                separator
            );

        }
    ) || null;
}


/*
 * 1行から表・裏を分ける
 */
function splitCardLine(
    line
) {

    const text =
        String(
            line || ""
        ).trim();


    if (!text) {
        return null;
    }


    const separator =
        findSeparator(text);


    if (!separator) {
        return null;
    }


    const parts =
        text.split(separator);


    if (
        parts.length < 2
    ) {

        return null;

    }


    const front =
        String(
            parts.shift() || ""
        ).trim();


    const back =
        parts
            .join(separator)
            .trim();


    if (
        !front &&
        !back
    ) {

        return null;

    }


    return {

        front: front,

        back: back

    };
}


/*
 * PDF読み込み
 *
 * PDF.jsがページに存在する場合は
 * それを使用する。
 *
 * 存在しない場合は
 * エラーを表示して安全に終了する。
 */
async function readPDFFile(
    file
) {

    if (
        typeof pdfjsLib ===
            "undefined"
    ) {

        throw new Error(
            "PDF読み込みにはPDF.jsが必要です。"
        );

    }


    const buffer =
        await file.arrayBuffer();


    const pdf =
        await pdfjsLib
            .getDocument({
                data: buffer
            })
            .promise;


    let text = "";


    for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
    ) {

        const page =
            await pdf.getPage(
                pageNumber
            );


        const content =
            await page.getTextContent();


        const pageText =
            content.items
                .map(
                    function (item) {

                        return item.str || "";

                    }
                )
                .join(" ");


        text +=
            pageText +
            "\n\n";
    }


    return text;
}


/*
 * ファイルからカード候補を作る
 */
async function parseImportFile(
    file
) {

    const name =
        String(
            file.name || ""
        ).toLowerCase();


    if (
        name.endsWith(".csv")
    ) {

        const text =
            await readTextFile(file);


        return cardsFromCSV(text);

    }


    if (
        name.endsWith(".txt")
    ) {

        const text =
            await readTextFile(file);


        return cardsFromTXT(text);

    }


    if (
        name.endsWith(".pdf")
    ) {

        const text =
            await readPDFFile(file);


        /*
         * PDFはまずTXTと同じルールで
         * カード化を試みる。
         */

        return cardsFromTXT(text);

    }


    throw new Error(
        "対応していないファイル形式です。"
    );
}


/*
 * ファイルをインポート
 */
async function handleFileImport(
    file
) {

    if (!file) {
        return;
    }


    try {

        setImportStatus(
            "「" +
            file.name +
            "」を読み込んでいます…",
            "warning"
        );


        const cards =
            await parseImportFile(
                file
            );


        if (
            !Array.isArray(cards) ||
            cards.length === 0
        ) {

            setImportStatus(
                "カードを作成できませんでした。「表<TAB>裏」などの形式を確認してください。",
                "error"
            );

            return;
        }


        const language =
            getSelectedImportLanguage();


        let deck =
            getSelectedImportDeck();


        /*
         * 追加先が指定されていない場合
         * 新しいデッキを作る。
         */

        if (!deck) {

            deck =
                createDeck(
                    getDeckNameFromFile(
                        file.name
                    ),
                    language
                );

        }


        let addedCount = 0;


        cards.forEach(
            function (cardData) {

                const card =
                    addCard(
                        deck,
                        cardData.front,
                        cardData.back,
                        language
                    );


                if (card) {

                    addedCount++;

                }

            }
        );


        if (addedCount === 0) {

            setImportStatus(
                "追加できるカードがありませんでした。",
                "error"
            );

            return;
        }


        saveData();


        renderDecks();

        renderImportDeckSelect();

        renderHome();


        /*
         * 作成したデッキを
         * 追加先として選択状態にする
         */

        const deckSelect =
            document.getElementById(
                "import-deck-select"
            );


        if (deckSelect) {

            deckSelect.value =
                deck.id;

        }


        setImportStatus(
            "「" +
            file.name +
            "」から " +
            addedCount +
            " 枚のカードを追加しました。",
            "success"
        );


    } catch (error) {

        console.error(
            "Import error:",
            error
        );


        setImportStatus(
            "「" +
            file.name +
            "」の読み込みに失敗しました。\n" +
            (
                error &&
                error.message
                    ? error.message
                    : "不明なエラー"
            ),
            "error"
        );

    }

}


/* =========================================
   DRAG & DROP SUPPORT
   ========================================= */

function handleDroppedFiles(
    files
) {

    const fileArray =
        Array.from(
            files || []
        );


    if (
        fileArray.length === 0
    ) {

        return;

    }


    renderSelectedFiles(
        fileArray
    );


    processImportFiles(
        fileArray
    );
}


async function processImportFiles(
    files
) {

    for (
        const file of files
    ) {

        await handleFileImport(
            file
        );

    }


    /*
     * 最新状態を再描画
     */

    renderDecks();

    renderImportDeckSelect();

    renderHome();
}



/* =========================================
   DATA EXPORT / IMPORT
   JSON
   ========================================= */

/*
 * エクスポート用データを作成
 *
 * 元データを直接変更しないように
 * JSON化してコピーする。
 */
function createExportData() {

    try {

        return JSON.parse(
            JSON.stringify(appData)
        );

    } catch (error) {

        console.error(
            "Export data creation error:",
            error
        );

        return null;
    }
}


/*
 * JSONを書き出す
 */
function exportDataJSON() {

    try {

        const exportData =
            createExportData();


        if (!exportData) {

            alert(
                "データを書き出せませんでした。"
            );

            return;
        }


        /*
         * バージョン情報
         */

        exportData.exportVersion =
            1;


        exportData.exportedAt =
            new Date().toISOString();


        const json =
            JSON.stringify(
                exportData,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        const date =
            new Date();


        const dateText =
            date
                .toISOString()
                .slice(
                    0,
                    10
                );


        link.download =
            "language-gym-backup-" +
            dateText +
            ".json";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        /*
         * URLをすぐに解放しないように
         * 少し待ってから解放する。
         */
        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


        alert(
            "Language Gymのデータを書き出しました。"
        );


    } catch (error) {

        console.error(
            "Export error:",
            error
        );


        alert(
            "データの書き出しに失敗しました。"
        );

    }

}


/* =========================================
   JSON VALIDATION
   ========================================= */

/*
 * 読み込んだJSONが
 * Language Gymのデータとして使えるか確認
 */
function validateImportedData(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return {

            valid: false,

            message:
                "JSONデータが正しくありません。"

        };

    }


    /*
     * decksがない場合
     *
     * 古い形式の可能性もあるので、
     * ここでは完全拒否しない。
     */

    if (
        data.decks !== undefined &&
        !Array.isArray(data.decks)
    ) {

        return {

            valid: false,

            message:
                "デッキデータの形式が正しくありません。"

        };

    }


    if (
        data.settings !== undefined &&
        typeof data.settings !== "object"
    ) {

        return {

            valid: false,

            message:
                "設定データの形式が正しくありません。"

        };

    }


    if (
        data.statistics !== undefined &&
        typeof data.statistics !== "object"
    ) {

        return {

            valid: false,

            message:
                "学習記録データの形式が正しくありません。"

        };

    }


    return {

        valid: true,

        message: "OK"

    };
}


/* =========================================
   NORMALIZE IMPORTED DATA
   ========================================= */

/*
 * 読み込んだデータを
 * 現在のLanguage Gym形式に合わせる。
 */
function normalizeImportedData(
    imported
) {

    const normalized = {

        version:
            imported.version ||
            1,

        decks: [],

        settings: {},

        statistics: {},

        studyHistory: []

    };


    /*
     * デッキ
     */

    if (
        Array.isArray(
            imported.decks
        )
    ) {

        normalized.decks =
            imported.decks
                .map(
                    function (oldDeck) {

                        if (
                            !oldDeck ||
                            typeof oldDeck !== "object"
                        ) {

                            return null;

                        }


                        const deck = {

                            id:
                                oldDeck.id ||
                                createId("deck"),

                            name:
                                String(
                                    oldDeck.name ||
                                    "名称未設定"
                                ),

                            language:
                                oldDeck.language ||
                                "zh",

                            cards: [],

                            createdAt:
                                oldDeck.createdAt ||
                                new Date().toISOString(),

                            updatedAt:
                                oldDeck.updatedAt ||
                                new Date().toISOString()

                        };


                        /*
                         * カード
                         */

                        if (
                            Array.isArray(
                                oldDeck.cards
                            )
                        ) {

                            deck.cards =
                                oldDeck.cards
                                    .map(
                                        normalizeCard
                                    )
                                    .filter(
                                        Boolean
                                    );

                        }


                        return deck;

                    }
                )
                .filter(
                    Boolean
                );

    }


    /*
     * 設定
     */

    if (
        imported.settings &&
        typeof imported.settings === "object"
    ) {

        normalized.settings =
            {
                ...imported.settings
            };

    }


    /*
     * 統計
     */

    if (
        imported.statistics &&
        typeof imported.statistics === "object"
    ) {

        normalized.statistics =
            {
                ...imported.statistics
            };

    }


    /*
     * 学習履歴
     */

    if (
        Array.isArray(
            imported.studyHistory
        )
    ) {

        normalized.studyHistory =
            imported.studyHistory
                .filter(
                    function (item) {

                        return (
                            item &&
                            typeof item === "object"
                        );

                    }
                )
                .map(
                    function (item) {

                        return {
                            ...item
                        };

                    }
                );

    }


    return normalized;
}


/* =========================================
   MERGE OR REPLACE
   ========================================= */

/*
 * JSONデータを現在のデータに
 * 安全に反映する。
 *
 * デフォルトでは「置き換え」ではなく
 * 既存データを残して追加・統合する。
 */
function mergeImportedData(
    imported
) {

    const normalized =
        normalizeImportedData(
            imported
        );


    /*
     * デッキIDの重複を避ける
     */

    const existingDeckIds =
        new Set(
            appData.decks.map(
                function (deck) {
                    return deck.id;
                }
            )
        );


    normalized.decks.forEach(
        function (importedDeck) {

            let deck =
                appData.decks.find(
                    function (existingDeck) {

                        return (
                            existingDeck.id ===
                            importedDeck.id
                        );

                    }
                );


            /*
             * 同じIDのデッキがある場合
             * カードだけ統合する。
             */

            if (deck) {

                if (
                    !Array.isArray(
                        deck.cards
                    )
                ) {

                    deck.cards = [];

                }


                const existingCardIds =
                    new Set(
                        deck.cards.map(
                            function (card) {
                                return card.id;
                            }
                        )
                    );


                importedDeck.cards.forEach(
                    function (card) {

                        if (
                            !existingCardIds.has(
                                card.id
                            )
                        ) {

                            deck.cards.push(
                                card
                            );

                        }

                    }
                );


                deck.updatedAt =
                    new Date().toISOString();


                return;
            }


            /*
             * IDが重複する可能性がある場合
             */

            if (
                existingDeckIds.has(
                    importedDeck.id
                )
            ) {

                importedDeck.id =
                    createId("deck");

            }


            /*
             * 新しいデッキとして追加
             */

            appData.decks.push(
                importedDeck
            );


            existingDeckIds.add(
                importedDeck.id
            );

        }
    );


    /*
     * 設定は、
     * 読み込んだ値がある項目だけ反映。
     */

    if (
        normalized.settings &&
        typeof normalized.settings === "object"
    ) {

        appData.settings = {

            ...appData.settings,

            ...normalized.settings

        };

    }


    /*
     * 統計を統合
     *
     * 現在の統計と読み込んだ統計を
     * 単純に足し合わせる。
     */

    const importedStats =
        normalized.statistics;


    if (importedStats) {

        appData.statistics.totalStudyTime =
            Math.max(
                Number(
                    appData.statistics.totalStudyTime
                ) || 0,
                Number(
                    importedStats.totalStudyTime
                ) || 0
            );


        appData.statistics.totalAnswers =
            Math.max(
                Number(
                    appData.statistics.totalAnswers
                ) || 0,
                Number(
                    importedStats.totalAnswers
                ) || 0
            );


        appData.statistics.totalCorrect =
            Math.max(
                Number(
                    appData.statistics.totalCorrect
                ) || 0,
                Number(
                    importedStats.totalCorrect
                ) || 0
            );

    }


    /*
     * 学習履歴
     */

    if (
        Array.isArray(
            normalized.studyHistory
        )
    ) {

        if (
            !Array.isArray(
                appData.studyHistory
            )
        ) {

            appData.studyHistory = [];

        }


        const existingHistoryIds =
            new Set(
                appData.studyHistory
                    .map(
                        function (item) {
                            return item.id;
                        }
                    )
                    .filter(Boolean)
            );


        normalized.studyHistory.forEach(
            function (item) {

                if (
                    item.id &&
                    existingHistoryIds.has(
                        item.id
                    )
                ) {

                    return;

                }


                appData.studyHistory.push(
                    {
                        ...item,

                        id:
                            item.id ||
                            createId("history")

                    }
                );

            }
        );

    }

}


/* =========================================
   JSON IMPORT
   ========================================= */

async function importDataJSON(
    file
) {

    if (!file) {
        return;
    }


    try {

        /*
         * まず現在データをバックアップ
         */

        createAutomaticBackup();


        const text =
            await file.text();


        let imported;


        try {

            imported =
                JSON.parse(text);

        } catch (jsonError) {

            alert(
                "JSONファイルを読み込めませんでした。\n\n" +
                "正しいLanguage GymのJSONファイルか確認してください。"
            );

            return;
        }


        const validation =
            validateImportedData(
                imported
            );


        if (!validation.valid) {

            alert(
                validation.message
            );

            return;
        }


        const deckCountBefore =
            appData.decks.length;


        const cardCountBefore =
            appData.decks.reduce(
                function (total, deck) {

                    return total +
                        (
                            Array.isArray(deck.cards)
                                ? deck.cards.length
                                : 0
                        );

                },
                0
            );


        /*
         * 既存データを残したまま統合
         */

        mergeImportedData(
            imported
        );


        saveData();


        /*
         * 画面更新
         */

        renderDecks();

        renderImportDeckSelect();

        renderHome();

        renderProgress();


        const deckCountAfter =
            appData.decks.length;


        const cardCountAfter =
            appData.decks.reduce(
                function (total, deck) {

                    return total +
                        (
                            Array.isArray(deck.cards)
                                ? deck.cards.length
                                : 0
                        );

                },
                0
            );


        const addedDecks =
            Math.max(
                0,
                deckCountAfter -
                deckCountBefore
            );


        const addedCards =
            Math.max(
                0,
                cardCountAfter -
                cardCountBefore
            );


        alert(
            "データを読み込みました。\n\n" +
            "追加されたデッキ：" +
            addedDecks +
            "\n" +
            "追加されたカード：" +
            addedCards
        );


    } catch (error) {

        console.error(
            "JSON import error:",
            error
        );


        alert(
            "データの読み込み中にエラーが発生しました。\n\n" +
            (
                error &&
                error.message
                    ? error.message
                    : "不明なエラー"
            )
        );

    }

}


/* =========================================
   AUTOMATIC BACKUP
   ========================================= */

/*
 * 自動バックアップを保存
 *
 * localStorageとは別キーに保存する。
 */
function createAutomaticBackup() {

    try {

        const backup =
            JSON.stringify(
                appData
            );


        localStorage.setItem(
            "languageGymAutomaticBackup",
            backup
        );


        localStorage.setItem(
            "languageGymAutomaticBackupAt",
            new Date().toISOString()
        );


        return true;


    } catch (error) {

        console.error(
            "Backup error:",
            error
        );


        return false;
    }
}


/*
 * 自動バックアップから復元
 */
function restoreAutomaticBackup() {

    try {

        const backupText =
            localStorage.getItem(
                "languageGymAutomaticBackup"
            );


        if (!backupText) {

            alert(
                "自動バックアップがありません。"
            );

            return;
        }


        let backupData;


        try {

            backupData =
                JSON.parse(
                    backupText
                );

        } catch (error) {

            alert(
                "自動バックアップが壊れているため、復元できません。"
            );

            return;
        }


        const validation =
            validateImportedData(
                backupData
            );


        if (!validation.valid) {

            alert(
                "バックアップの形式が正しくありません。"
            );

            return;
        }


        const backupAt =
            localStorage.getItem(
                "languageGymAutomaticBackupAt"
            );


        let backupDateText =
            "";


        if (backupAt) {

            const date =
                new Date(
                    backupAt
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                backupDateText =
                    "\nバックアップ日時：" +
                    date.toLocaleString(
                        "ja-JP"
                    );

            }

        }


        const confirmed =
            confirm(
                "自動バックアップから復元しますか？" +
                backupDateText +
                "\n\n" +
                "現在のデータは上書きされます。"
            );


        if (!confirmed) {
            return;
        }


        /*
         * 復元前に現在のデータを
         * もう一度バックアップする。
         */

        createAutomaticBackup();


        const normalized =
            normalizeImportedData(
                backupData
            );


        /*
         * 現在のデータを完全に置き換える。
         */

        appData = {

            ...createDefaultAppData(),

            ...normalized,

            settings: {

                ...createDefaultAppData().settings,

                ...(normalized.settings || {})

            },

            statistics: {

                ...createDefaultAppData().statistics,

                ...(normalized.statistics || {})

            }

        };


        saveData();


        /*
         * 画面を更新
         */

        renderDecks();

        renderImportDeckSelect();

        renderHome();

        renderProgress();

        applyTheme(
            appData.settings.customColor
        );


        alert(
            "自動バックアップから復元しました。"
        );


    } catch (error) {

        console.error(
            "Restore backup error:",
            error
        );


        alert(
            "バックアップの復元に失敗しました。"
        );

    }

}


/* =========================================
   STUDY SYSTEM
   ========================================= */



/* =========================================
   STUDY SETTINGS
   ========================================= */

/*
 * ランダム学習がONかどうか
 */
function isRandomStudyEnabled() {

    if (
        typeof appData === "undefined" ||
        !appData.settings
    ) {

        return true;

    }


    /*
     * 未設定ならランダムON
     */

    if (
        appData.settings.randomStudy ===
        undefined
    ) {

        return true;

    }


    return Boolean(
        appData.settings.randomStudy
    );

}


/* =========================================
   SHUFFLE
   ========================================= */

/*
 * Fisher-Yates shuffle
 *
 * 元の配列を壊さない。
 */
function shuffleArray(
    array
) {

    const result =
        Array.isArray(array)
            ? [...array]
            : [];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        const temp =
            result[i];


        result[i] =
            result[j];


        result[j] =
            temp;

    }


    return result;
}


/* =========================================
   GET DECK
   ========================================= */

function getDeckById(
    deckId
) {

    if (
        typeof appData === "undefined" ||
        !Array.isArray(appData.decks)
    ) {

        return null;

    }


    return appData.decks.find(
        function (deck) {

            return (
                deck &&
                deck.id === deckId
            );

        }
    ) || null;

}


/* =========================================
   START STUDY
   ========================================= */

function startStudy(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );


    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return;

    }


    if (
        !Array.isArray(deck.cards) ||
        deck.cards.length === 0
    ) {

        alert(
            "このデッキにはカードがありません。"
        );

        return;

    }


    /*
     * 学習前に状態をリセット
     */

    stopStudyTimer();


    studyState = {

        active: true,

        deckId:
            deck.id,

        cards:
            isRandomStudyEnabled()
                ? shuffleArray(
                    deck.cards
                )
                : [...deck.cards],

        currentIndex: 0,

        answerShown: false,

        startedAt:
            Date.now(),

        timerId: null,

        elapsedSeconds: 0,

        answers: 0,

        correct: 0

    };


    /*
     * デッキ名を表示
     */

    const studyDeckName =
        document.getElementById(
            "study-deck-name"
        );


    if (studyDeckName) {

        studyDeckName.textContent =
            "📚 " +
            deck.name;

    }


    /*
     * 学習ページへ
     */

    showPage(
        "study"
    );


    /*
     * タイマー開始
     */

    startStudyTimer();


    /*
     * 最初のカード
     */

    renderStudyCard();

}


/* =========================================
   STUDY TIMER
   ========================================= */

function startStudyTimer() {

    stopStudyTimer();


    studyState.startedAt =
        Date.now();


    studyState.timerId =
        setInterval(
            function () {

                if (
                    !studyState.active
                ) {

                    return;

                }


                studyState.elapsedSeconds =
                    Math.floor(
                        (
                            Date.now() -
                            studyState.startedAt
                        ) / 1000
                    );


                updateStudyTimer();

            },
            1000
        );


    updateStudyTimer();

}


function stopStudyTimer() {

    if (
        studyState.timerId
    ) {

        clearInterval(
            studyState.timerId
        );

    }


    studyState.timerId =
        null;

}


function updateStudyTimer() {

    const element =
        document.getElementById(
            "study-timer"
        );


    if (!element) {
        return;
    }


    element.textContent =
        formatStudyTime(
            studyState.elapsedSeconds
        );

}


/* =========================================
   FORMAT TIME
   ========================================= */

function formatStudyTime(
    seconds
) {

    const total =
        Math.max(
            0,
            Number(seconds) || 0
        );


    const hours =
        Math.floor(
            total / 3600
        );


    const minutes =
        Math.floor(
            (total % 3600) / 60
        );


    const secs =
        total % 60;


    if (hours > 0) {

        return (
            hours +
            "時間 " +
            minutes +
            "分 " +
            secs +
            "秒"
        );

    }


    if (minutes > 0) {

        return (
            minutes +
            "分 " +
            secs +
            "秒"
        );

    }


    return (
        secs +
        "秒"
    );

}


/* =========================================
   CURRENT CARD
   ========================================= */

function getCurrentStudyCard() {

    if (
        !studyState.active
    ) {

        return null;

    }


    if (
        !Array.isArray(
            studyState.cards
        )
    ) {

        return null;

    }


    return (
        studyState.cards[
            studyState.currentIndex
        ] || null
    );

}


/* =========================================
   RENDER STUDY CARD
   ========================================= */

function renderStudyCard() {

    const front =
        document.getElementById(
            "study-front"
        );


    const back =
        document.getElementById(
            "study-back"
        );


    const progress =
        document.getElementById(
            "study-progress"
        );


    const showAnswerButton =
        document.getElementById(
            "show-answer-button"
        );


    const wrongButton =
        document.getElementById(
            "wrong-button"
        );


    const correctButton =
        document.getElementById(
            "correct-button"
        );


    const card =
        getCurrentStudyCard();


    /*
     * カードがない場合
     */

    if (!card) {

        if (front) {

            front.textContent =
                "学習するカードがありません。";

        }


        if (back) {

            back.hidden =
                true;

        }


        if (showAnswerButton) {

            showAnswerButton.disabled =
                true;

        }


        if (wrongButton) {

            wrongButton.disabled =
                true;

        }


        if (correctButton) {

            correctButton.disabled =
                true;

        }


        return;

    }


    /*
     * 表面
     */

    if (front) {

        front.textContent =
            String(
                card.front ||
                ""
            );

    }


    /*
     * 裏面
     */

    if (back) {

        back.textContent =
            String(
                card.back ||
                ""
            );


        back.hidden =
            !studyState.answerShown;

    }


    /*
     * 進捗
     */

    if (progress) {

        progress.textContent =
            (
                studyState.currentIndex +
                1
            ) +
            " / " +
            studyState.cards.length;

    }


    /*
     * 答えを見るボタン
     */

    if (showAnswerButton) {

        showAnswerButton.disabled =
            studyState.answerShown;

    }


    /*
     * 正解・不正解
     */

    if (wrongButton) {

        wrongButton.disabled =
            !studyState.answerShown;

    }


    if (correctButton) {

        correctButton.disabled =
            !studyState.answerShown;

    }


    /*
     * 自動音声
     */

    if (
        appData.settings &&
        appData.settings.autoVoice
    ) {

        speakStudyCard(
            card
        );

    }

}


/* =========================================
   SHOW ANSWER
   ========================================= */

function showStudyAnswer() {

    if (
        !studyState.active
    ) {

        return;

    }


    const card =
        getCurrentStudyCard();


    if (!card) {
        return;
    }


    studyState.answerShown =
        true;


    const back =
        document.getElementById(
            "study-back"
        );


    const showAnswerButton =
        document.getElementById(
            "show-answer-button"
        );


    const wrongButton =
        document.getElementById(
            "wrong-button"
        );


    const correctButton =
        document.getElementById(
            "correct-button"
        );


    if (back) {

        back.textContent =
            String(
                card.back ||
                ""
            );


        back.hidden =
            false;

    }


    if (showAnswerButton) {

        showAnswerButton.disabled =
            true;

    }


    if (wrongButton) {

        wrongButton.disabled =
            false;

    }


    if (correctButton) {

        correctButton.disabled =
            false;

    }


    /*
     * 答えを読み上げる
     */

    speakStudyCard(
        card,
        true
    );

}


/* =========================================
   STUDY RESULT
   ========================================= */

function handleStudyCorrect() {

    handleStudyAnswer(
        true
    );

}


function handleStudyWrong() {

    handleStudyAnswer(
        false
    );

}


function handleStudyAnswer(
    isCorrect
) {

    if (
        !studyState.active
    ) {

        return;

    }


    if (
        !studyState.answerShown
    ) {

        return;

    }


    const card =
        getCurrentStudyCard();


    if (!card) {
        return;
    }


    /*
     * 回答数
     */

    studyState.answers +=
        1;


    /*
     * 正解数
     */

    if (isCorrect) {

        studyState.correct +=
            1;

    }


    /*
     * カード側にも学習結果を保存
     */

    if (
        typeof card.correctCount !==
        "number"
    ) {

        card.correctCount =
            0;

    }


    if (
        typeof card.wrongCount !==
        "number"
    ) {

        card.wrongCount =
            0;

    }


    if (isCorrect) {

        card.correctCount +=
            1;

    } else {

        card.wrongCount +=
            1;

    }


    card.lastStudiedAt =
        new Date().toISOString();


    /*
     * 次のカードへ
     */

    studyState.currentIndex +=
        1;


    /*
     * 最後のカードだった場合
     */

    if (
        studyState.currentIndex >=
        studyState.cards.length
    ) {

        finishStudy();

        return;

    }


    /*
     * 次のカード
     */

    studyState.answerShown =
        false;


    renderStudyCard();


    /*
     * データ保存
     */

    saveData();

}


/* =========================================
   FINISH STUDY
   ========================================= */

function finishStudy() {

    if (
        !studyState.active
    ) {

        showPage(
            "decks"
        );

        return;

    }


    /*
     * 最終学習時間
     */

    if (
        studyState.startedAt
    ) {

        studyState.elapsedSeconds =
            Math.max(
                0,
                Math.floor(
                    (
                        Date.now() -
                        studyState.startedAt
                    ) / 1000
                )
            );

    }


    stopStudyTimer();


    /*
     * 統計オブジェクトを確保
     */

    if (
        !appData.statistics ||
        typeof appData.statistics !== "object"
    ) {

        appData.statistics = {};

    }


    /*
     * デフォルト値
     */

    if (
        typeof appData.statistics.totalStudyTime !==
        "number"
    ) {

        appData.statistics.totalStudyTime =
            0;

    }


    if (
        typeof appData.statistics.totalAnswers !==
        "number"
    ) {

        appData.statistics.totalAnswers =
            0;

    }


    if (
        typeof appData.statistics.totalCorrect !==
        "number"
    ) {

        appData.statistics.totalCorrect =
            0;

    }


    /*
     * 今回の学習を加算
     */

    appData.statistics.totalStudyTime +=
        studyState.elapsedSeconds;


    appData.statistics.totalAnswers +=
        studyState.answers;


    appData.statistics.totalCorrect +=
        studyState.correct;


    /*
     * 学習履歴
     */

    if (
        !Array.isArray(
            appData.studyHistory
        )
    ) {

        appData.studyHistory = [];

    }


    appData.studyHistory.push({

        id:
            createId("history"),

        deckId:
            studyState.deckId,

        date:
            new Date().toISOString(),

        duration:
            studyState.elapsedSeconds,

        answers:
            studyState.answers,

        correct:
            studyState.correct

    });


    /*
     * 保存
     */

    saveData();


    /*
     * バックアップ
     */

    createAutomaticBackup();


    /*
     * 結果表示
     */

    const accuracy =
        studyState.answers > 0
            ? Math.round(
                (
                    studyState.correct /
                    studyState.answers
                ) * 100
            )
            : 0;


    alert(
        "学習終了！\n\n" +

        "学習時間：" +
        formatStudyTime(
            studyState.elapsedSeconds
        ) +
        "\n" +

        "回答数：" +
        studyState.answers +
        "\n" +

        "正解数：" +
        studyState.correct +
        "\n" +

        "正答率：" +
        accuracy +
        "%"
    );


    /*
     * 学習状態を終了
     */

    studyState.active =
        false;


    studyState.deckId =
        null;


    studyState.cards =
        [];


    studyState.currentIndex =
        0;


    studyState.answerShown =
        false;


    /*
     * 画面更新
     */

    renderHome();

    renderProgress();

    renderDecks();


    /*
     * デッキ画面へ
     */

    showPage(
        "decks"
    );

}


/* =========================================
   CANCEL STUDY
   ========================================= */

function cancelStudy() {

    if (
        !studyState.active
    ) {

        return;

    }


    const confirmed =
        confirm(
            "現在の学習を終了しますか？\n\n" +
            "今回の学習結果は記録されます。"
        );


    if (!confirmed) {
        return;
    }


    finishStudy();

}


/* =========================================
   SPEECH
   ========================================= */

function speakStudyCard(
    card,
    speakBack
) {

    if (
        !card ||
        !("speechSynthesis" in window)
    ) {

        return;

    }


    const settings =
        appData.settings ||
        {};


    const text =
        speakBack
            ? String(
                card.back ||
                ""
            )
            : String(
                card.front ||
                ""
            );


    if (!text.trim()) {
        return;
    }


    /*
     * 現在の読み上げを停止
     */

    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    /*
     * 設定
     */

    utterance.rate =
        Number(
            settings.voiceRate
        ) || 1;


    utterance.pitch =
        Number(
            settings.voicePitch
        ) || 1;


    /*
     * 言語設定
     */

    const deck =
        getDeckById(
            studyState.deckId
        );


    const language =
        deck &&
        deck.language
            ? deck.language
            : (
                settings.learningLanguage ||
                "zh"
            );


    const speechLanguageMap = {

        zh:
            "zh-CN",

        ja:
            "ja-JP",

        ko:
            "ko-KR",

        de:
            "de-DE",

        fr:
            "fr-FR",

        es:
            "es-ES",

        it:
            "it-IT",

        fi:
            "fi-FI"

    };


    utterance.lang =
        speechLanguageMap[
            language
        ] ||
        "zh-CN";


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================
   STUDY CARD KEYBOARD
   ========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        /*
         * 入力欄では反応しない
         */

        const target =
            event.target;


        if (
            target &&
            (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT"
            )
        ) {

            return;

        }


        if (
            !studyState.active
        ) {

            return;

        }


        /*
         * Space
         * → 答えを見る
         */

        if (
            event.code === "Space"
        ) {

            event.preventDefault();


            if (
                !studyState.answerShown
            ) {

                showStudyAnswer();

            }

            return;

        }


        /*
         * 1 = わからない
         */

        if (
            event.key === "1" &&
            studyState.answerShown
        ) {

            handleStudyWrong();

            return;

        }


        /*
         * 2 = 正解
         */

        if (
            event.key === "2" &&
            studyState.answerShown
        ) {

            handleStudyCorrect();

            return;

        }


        /*
         * Escape
         */

        if (
            event.key === "Escape"
        ) {

            cancelStudy();

        }

    }
);


/* =========================================
   RANDOM STUDY SETTING
   ========================================= */

function initializeRandomStudySetting() {

    const randomStudy =
        document.getElementById(
            "random-study"
        );


    if (!randomStudy) {
        return;
    }


    /*
     * 初期値
     */

    if (
        !appData.settings
    ) {

        appData.settings = {};

    }


    if (
        appData.settings.randomStudy ===
        undefined
    ) {

        appData.settings.randomStudy =
            true;

    }


    randomStudy.checked =
        Boolean(
            appData.settings.randomStudy
        );


    randomStudy.addEventListener(
        "change",
        function () {

            appData.settings.randomStudy =
                this.checked;


            saveData();

        }
    );

}


/* =========================================
   INITIALIZE STUDY
   ========================================= */

initializeRandomStudySetting();



/* =========================================
   HOME / DECK / PROGRESS / SEARCH
   ========================================= */


/* =========================================
   HOME
   ========================================= */

function renderHome() {

    if (
        typeof appData === "undefined"
    ) {
        return;
    }


    const decks =
        Array.isArray(appData.decks)
            ? appData.decks
            : [];


    /*
     * デッキ数
     */

    const deckCount =
        decks.length;


    /*
     * カード総数
     */

    const cardCount =
        decks.reduce(
            function (total, deck) {

                if (
                    !deck ||
                    !Array.isArray(deck.cards)
                ) {

                    return total;

                }

                return (
                    total +
                    deck.cards.length
                );

            },
            0
        );


    /*
     * 学習時間
     */

    const statistics =
        appData.statistics || {};


    const totalStudyTime =
        Number(
            statistics.totalStudyTime
        ) || 0;


    /*
     * 正答率
     */

    const totalAnswers =
        Number(
            statistics.totalAnswers
        ) || 0;


    const totalCorrect =
        Number(
            statistics.totalCorrect
        ) || 0;


    const accuracy =
        totalAnswers > 0
            ? Math.round(
                (
                    totalCorrect /
                    totalAnswers
                ) * 100
            )
            : 0;


    /*
     * DOM
     */

    const deckElement =
        document.getElementById(
            "home-deck-count"
        );


    const cardElement =
        document.getElementById(
            "home-card-count"
        );


    const timeElement =
        document.getElementById(
            "home-study-time"
        );


    const accuracyElement =
        document.getElementById(
            "home-accuracy"
        );


    if (deckElement) {

        deckElement.textContent =
            deckCount;

    }


    if (cardElement) {

        cardElement.textContent =
            cardCount;

    }


    if (timeElement) {

        timeElement.textContent =
            formatStudyTime(
                totalStudyTime
            );

    }


    if (accuracyElement) {

        accuracyElement.textContent =
            accuracy +
            "%";

    }


    /*
     * 今日のメッセージ
     */

    renderDailyMessage();

}


/* =========================================
   DAILY MESSAGE
   ========================================= */

function renderDailyMessage() {

    const element =
        document.getElementById(
            "daily-message"
        );


    if (!element) {
        return;
    }


    const messages = [

        "今日も一歩前進！🌱",

        "少しだけでも続ければ、ちゃんと積み重なります。✨",

        "完璧じゃなくて大丈夫。今日できることを一つ。💪",

        "昨日の自分より、ほんの少し前へ。🌸",

        "外国語は筋トレと同じ。今日もLanguage Gym！🏋️",

        "分からないカードがあっても大丈夫。それは伸びしろです。📚",

        "5分でも立派な学習です。☕",

        "今日の一枚から始めよう。🎯",

        "忘れることも学習の一部です。もう一度出会えばOK。🌱",

        "焦らず、でも着実に。✨"

    ];


    /*
     * 日付によってメッセージを固定
     */

    const today =
        new Date();


    const dayNumber =
        Math.floor(
            today.getTime() /
            86400000
        );


    const index =
        Math.abs(
            dayNumber
        ) %
        messages.length;


    element.textContent =
        messages[index];

}


/* =========================================
   DECK LIST
   ========================================= */

function renderDecks() {

    const container =
        document.getElementById(
            "deck-list"
        );


    if (!container) {
        return;
    }


    const decks =
        Array.isArray(appData.decks)
            ? appData.decks
            : [];


    /*
     * デッキがない
     */

    if (
        decks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📚
                </div>

                <p>
                    まだデッキがありません。
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    data-go-page="import"
                >
                    教材をインポート
                </button>

            </div>

        `;


        const button =
            container.querySelector(
                "[data-go-page]"
            );


        if (button) {

            button.addEventListener(
                "click",
                function () {

                    showPage(
                        "import"
                    );

                }
            );

        }


        return;

    }


    /*
     * デッキ表示
     */

    container.innerHTML =
        decks
            .map(
                function (deck) {

                    return createDeckCardHTML(
                        deck
                    );

                }
            )
            .join("");


    /*
     * 学習ボタン
     */

    container
        .querySelectorAll(
            "[data-study-deck]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        startStudy(
                            this.dataset.studyDeck
                        );

                    }
                );

            }
        );


    /*
     * 削除ボタン
     */

    container
        .querySelectorAll(
            "[data-delete-deck]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteDeck(
                            this.dataset.deleteDeck
                        );

                    }
                );

            }
        );


    /*
     * 名前変更
     */

    container
        .querySelectorAll(
            "[data-rename-deck]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        renameDeck(
                            this.dataset.renameDeck
                        );

                    }
                );

            }
        );

}


/* =========================================
   DECK CARD HTML
   ========================================= */

function createDeckCardHTML(
    deck
) {

    const cardCount =
        Array.isArray(deck.cards)
            ? deck.cards.length
            : 0;


    const languageNames = {

        zh:
            "中国語",

        ja:
            "日本語",

        ko:
            "韓国語",

        de:
            "ドイツ語",

        fr:
            "フランス語",

        es:
            "スペイン語",

        it:
            "イタリア語",

        fi:
            "フィンランド語"

    };


    const language =
        languageNames[
            deck.language
        ] ||
        "その他";


    return `

        <div
            class="deck-card"
            data-deck-id="${escapeHTML(
                String(deck.id)
            )}"
        >

            <div class="deck-name">
                📚 ${escapeHTML(
                    deck.name ||
                    "名称未設定"
                )}
            </div>


            <div class="deck-meta">

                🌐 ${escapeHTML(
                    language
                )}

                <br>

                🃏 ${cardCount} カード

            </div>


            <div
                class="button-row"
                style="margin-top:18px;"
            >

                <button
                    type="button"
                    class="btn btn-primary"
                    data-study-deck="${escapeHTML(
                        String(deck.id)
                    )}"
                    ${
                        cardCount === 0
                            ? "disabled"
                            : ""
                    }
                >
                    🏋️ 学習
                </button>


                <button
                    type="button"
                    class="btn btn-outline"
                    data-rename-deck="${escapeHTML(
                        String(deck.id)
                    )}"
                >
                    ✏️ 名前変更
                </button>


                <button
                    type="button"
                    class="btn btn-danger"
                    data-delete-deck="${escapeHTML(
                        String(deck.id)
                    )}"
                >
                    🗑️ 削除
                </button>

            </div>

        </div>

    `;

}


/* =========================================
   RENAME DECK
   ========================================= */

function renameDeck(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );


    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return;

    }


    const newName =
        prompt(
            "デッキ名を入力してください。",
            deck.name || ""
        );


    if (
        newName === null
    ) {

        return;

    }


    const trimmed =
        newName.trim();


    if (!trimmed) {

        alert(
            "デッキ名を入力してください。"
        );

        return;

    }


    deck.name =
        trimmed;


    deck.updatedAt =
        new Date().toISOString();


    saveData();


    renderDecks();

    renderImportDeckSelect();

    renderHome();

}


/* =========================================
   DELETE DECK
   ========================================= */

function deleteDeck(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );


    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return;

    }


    const cardCount =
        Array.isArray(deck.cards)
            ? deck.cards.length
            : 0;


    const confirmed =
        confirm(
            "「" +
            deck.name +
            "」を削除しますか？\n\n" +
            cardCount +
            "枚のカードも削除されます。\n\n" +
            "この操作は元に戻せません。"
        );


    if (!confirmed) {
        return;
    }


    /*
     * 削除前バックアップ
     */

    createAutomaticBackup();


    appData.decks =
        appData.decks.filter(
            function (item) {

                return (
                    item.id !==
                    deckId
                );

            }
        );


    saveData();


    renderDecks();

    renderImportDeckSelect();

    renderHome();


    alert(
        "デッキを削除しました。"
    );

}


/* =========================================
   CARD SEARCH
   ========================================= */

function renderCardSearchResults(
    query
) {

    const container =
        document.getElementById(
            "card-search-results"
        );


    if (!container) {
        return;
    }


    const searchText =
        String(
            query || ""
        )
        .trim()
        .toLowerCase();


    /*
     * 空欄
     */

    if (!searchText) {

        container.innerHTML = `

            <div class="empty-state">

                🔎

                <p>
                    検索したいカードの
                    表や裏を入力してください。
                </p>

            </div>

        `;

        return;

    }


    const results = [];


    const decks =
        Array.isArray(appData.decks)
            ? appData.decks
            : [];


    decks.forEach(
        function (deck) {

            if (
                !deck ||
                !Array.isArray(deck.cards)
            ) {

                return;

            }


            deck.cards.forEach(
                function (card) {

                    if (!card) {
                        return;
                    }


                    const front =
                        String(
                            card.front || ""
                        );


                    const back =
                        String(
                            card.back || ""
                        );


                    const target =
                        (
                            front +
                            "\n" +
                            back
                        )
                        .toLowerCase();


                    if (
                        target.includes(
                            searchText
                        )
                    ) {

                        results.push({

                            deck:
                                deck,

                            card:
                                card

                        });

                    }

                }
            );

        }
    );


    /*
     * 結果なし
     */

    if (
        results.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔎
                </div>

                <p>
                    「${escapeHTML(
                        query
                    )}」に一致するカードはありません。
                </p>

            </div>

        `;

        return;

    }


    /*
     * 最大100件
     */

    const visibleResults =
        results.slice(
            0,
            100
        );


    container.innerHTML =
        visibleResults
            .map(
                function (item) {

                    const deck =
                        item.deck;


                    const card =
                        item.card;


                    const correct =
                        Number(
                            card.correctCount
                        ) || 0;


                    const wrong =
                        Number(
                            card.wrongCount
                        ) || 0;


                    return `

                        <div class="card-search-item">

                            <div class="search-card-front">
                                ${escapeHTML(
                                    card.front || ""
                                )}
                            </div>


                            <div class="search-card-back">
                                ${escapeHTML(
                                    card.back || ""
                                )}
                            </div>


                            <div class="search-card-meta">

                                <span>
                                    📚 ${escapeHTML(
                                        deck.name || ""
                                    )}
                                </span>


                                <span>
                                    ⭕ ${correct}
                                    /
                                    ❌ ${wrong}
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    if (
        results.length > 100
    ) {

        container.innerHTML += `

            <p
                style="
                    color:var(--muted);
                    margin-top:15px;
                "
            >
                最初の100件を表示しています。
            </p>

        `;

    }

}


/* =========================================
   PROGRESS
   ========================================= */

function renderProgress() {

    const statistics =
        appData.statistics ||
        {};


    const totalTime =
        Number(
            statistics.totalStudyTime
        ) || 0;


    const totalAnswers =
        Number(
            statistics.totalAnswers
        ) || 0;


    const totalCorrect =
        Number(
            statistics.totalCorrect
        ) || 0;


    const accuracy =
        totalAnswers > 0
            ? Math.round(
                (
                    totalCorrect /
                    totalAnswers
                ) * 100
            )
            : 0;


    /*
     * 上部統計
     */

    const timeElement =
        document.getElementById(
            "progress-total-time"
        );


    const answersElement =
        document.getElementById(
            "progress-total-answers"
        );


    const correctElement =
        document.getElementById(
            "progress-total-correct"
        );


    const accuracyElement =
        document.getElementById(
            "progress-accuracy"
        );


    if (timeElement) {

        timeElement.textContent =
            formatStudyTime(
                totalTime
            );

    }


    if (answersElement) {

        answersElement.textContent =
            totalAnswers;

    }


    if (correctElement) {

        correctElement.textContent =
            totalCorrect;

    }


    if (accuracyElement) {

        accuracyElement.textContent =
            accuracy +
            "%";

    }


    /*
     * 履歴
     */

    renderStudyHistory();

}


/* =========================================
   STUDY HISTORY
   ========================================= */

function renderStudyHistory() {

    const container =
        document.getElementById(
            "progress-table"
        );


    if (!container) {
        return;
    }


    const history =
        Array.isArray(
            appData.studyHistory
        )
            ? appData.studyHistory
            : [];


    if (
        history.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📊
                </div>

                まだ学習記録がありません。

            </div>

        `;

        return;

    }


    /*
     * 新しい順
     */

    const sorted =
        [...history]
            .sort(
                function (a, b) {

                    return (
                        new Date(
                            b.date || 0
                        ).getTime() -
                        new Date(
                            a.date || 0
                        ).getTime()
                    );

                }
            );


    container.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            日時
                        </th>

                        <th>
                            デッキ
                        </th>

                        <th>
                            時間
                        </th>

                        <th>
                            回答
                        </th>

                        <th>
                            正解
                        </th>

                        <th>
                            正答率
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        sorted
                            .map(
                                function (item) {

                                    const deck =
                                        getDeckById(
                                            item.deckId
                                        );


                                    const answers =
                                        Number(
                                            item.answers
                                        ) || 0;


                                    const correct =
                                        Number(
                                            item.correct
                                        ) || 0;


                                    const itemAccuracy =
                                        answers > 0
                                            ? Math.round(
                                                (
                                                    correct /
                                                    answers
                                                ) * 100
                                            )
                                            : 0;


                                    const date =
                                        formatHistoryDate(
                                            item.date
                                        );


                                    return `

                                        <tr>

                                            <td>
                                                ${escapeHTML(
                                                    date
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    deck
                                                        ? deck.name
                                                        : "削除されたデッキ"
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    formatStudyTime(
                                                        item.duration
                                                    )
                                                )}
                                            </td>

                                            <td>
                                                ${answers}
                                            </td>

                                            <td>
                                                ${correct}
                                            </td>

                                            <td>
                                                ${itemAccuracy}%
                                            </td>

                                        </tr>

                                    `;

                                }
                            )
                            .join("")
                    }

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================
   HISTORY DATE
   ========================================= */

function formatHistoryDate(
    value
) {

    if (!value) {

        return "日時不明";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "日時不明";

    }


    return date.toLocaleString(
        "ja-JP",
        {
            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


/* =========================================
   IMPORT DECK SELECT
   ========================================= */

function renderImportDeckSelect() {

    const select =
        document.getElementById(
            "import-deck-select"
        );


    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    const decks =
        Array.isArray(
            appData.decks
        )
            ? appData.decks
            : [];


    select.innerHTML = `

        <option value="">
            新しいデッキを作成
        </option>

    `;


    decks.forEach(
        function (deck) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                deck.id;


            option.textContent =
                "📚 " +
                (
                    deck.name ||
                    "名称未設定"
                );


            select.appendChild(
                option
            );

        }
    );


    /*
     * 以前の選択を復元
     */

    if (
        decks.some(
            function (deck) {

                return (
                    deck.id ===
                    currentValue
                );

            }
        )
    ) {

        select.value =
            currentValue;

    } else {

        select.value =
            "";

    }

}