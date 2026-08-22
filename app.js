/* =========================================================
   LANGUAGE GYM
   Core Application
   ========================================================= */

/* =========================================================
   STORAGE & CONSTANTS
   ========================================================= */

const STORAGE_KEY = "languageGymData";
const THEME_KEY = "languageGymTheme";
const BACKUP_KEY = "languageGymBackup";

const APP_VERSION = 4;


/* =========================================================
   THEME COLORS
   既存6色 + 新規6色 = 12色
   ========================================================= */

const PRESET_COLORS = [
    "#F7B2C4", // 🌸 さくら
    "#8ED8F8", // 🩵 水色
    "#9AD88B", // 🌱 若葉
    "#F6A85F", // 🍊 みかん
    "#F5D77A", // 🧈 バター
    "#8B7CF6", // 💜 紫

    "#F28B82", // 🩷 コーラル
    "#7DD3C7", // 🌿 ミント
    "#4F6FAE", // 💙 ネイビー
    "#A8D64F", // 🍋 ライム
    "#A98274", // 🤎 モカ
    "#9B4D6A"  // 🍷 ワイン
];

const DEFAULT_THEME_COLOR = "#8B7CF6";


/* =========================================================
   DEFAULT DATA
   ========================================================= */

const defaultData = {
    version: APP_VERSION,

    decks: [],

    records: [],

    deletedItems: [],

    plans: [],

    messages: {},

    settings: {
        autoVoice: false,
        voiceRate: 1,
        voicePitch: 1,
        uiLanguage: "ja",
        learningLanguage: "zh",
        customColor: DEFAULT_THEME_COLOR
    }
};


/* =========================================================
   GLOBAL APP DATA
   ========================================================= */

let appData = loadData();


/* =========================================================
   STUDY STATE
   ========================================================= */

let studyState = {
    active: false,

    deckId: null,

    currentIndex: 0,

    sessionAnswers: 0,

    sessionCorrect: 0,

    sessionWrong: 0,

    startedAt: null,

    timerInterval: null,

    elapsedSeconds: 0,

    answerShown: false
};


/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 11)
    );
}


function removeExtension(filename) {

    return String(filename || "")
        .replace(/\.[^/.]+$/, "");
}


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


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date.toLocaleString(
        "ja-JP"
    );
}


function formatSeconds(seconds) {

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
            `${hours}時間` +
            `${minutes}分` +
            `${secs}秒`
        );
    }

    if (minutes > 0) {

        return (
            `${minutes}分` +
            `${secs}秒`
        );
    }

    return `${secs}秒`;
}


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {

    try {

        /*
         * 新しいキー
         */
        let saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        /*
         * 旧バージョンの
         * typoキーにも対応
         */
        if (!saved) {

            saved =
                localStorage.getItem(
                    "languageGymata"
                );
        }

        if (!saved) {

            return structuredClone(
                defaultData
            );
        }

        const parsed =
            JSON.parse(saved);

        return normalizeImportedData(
            parsed
        );

    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );

        return structuredClone(
            defaultData
        );
    }
}


function saveData() {

    try {

        appData.version =
            APP_VERSION;

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );

        createAutomaticBackup();

    } catch (error) {

        console.error(
            "データ保存エラー:",
            error
        );

        alert(
            "データの保存に失敗しました。"
        );
    }
}


/* =========================================================
   AUTOMATIC BACKUP
   ========================================================= */

function createAutomaticBackup() {

    try {

        const backup = {

            version:
                APP_VERSION,

            savedAt:
                new Date().toISOString(),

            data:
                structuredClone(
                    appData
                )
        };

        localStorage.setItem(
            BACKUP_KEY,
            JSON.stringify(
                backup
            )
        );

    } catch (error) {

        console.error(
            "バックアップ作成エラー:",
            error
        );
    }
}


function restoreAutomaticBackup() {

    try {

        const saved =
            localStorage.getItem(
                BACKUP_KEY
            );

        if (!saved) {

            alert(
                "バックアップが見つかりません。"
            );

            return false;
        }

        const backup =
            JSON.parse(saved);

        if (
            !backup ||
            !backup.data
        ) {

            alert(
                "バックアップデータが破損しています。"
            );

            return false;
        }

        appData =
            normalizeImportedData(
                backup.data
            );

        saveData();

        loadTheme();

        renderAll();

        alert(
            "バックアップから復元しました。"
        );

        return true;

    } catch (error) {

        console.error(
            "バックアップ復元エラー:",
            error
        );

        alert(
            "バックアップの復元に失敗しました。"
        );

        return false;
    }
}


/* =========================================================
   NORMALIZE IMPORTED DATA
   ========================================================= */

function normalizeImportedData(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return structuredClone(
            defaultData
        );
    }

    const normalized = {

        ...structuredClone(
            defaultData
        ),

        ...data,

        decks:
            Array.isArray(data.decks)
                ? data.decks.map(
                    normalizeDeck
                )
                : [],

        records:
            Array.isArray(data.records)
                ? data.records.map(
                    normalizeRecord
                )
                : [],

        deletedItems:
            Array.isArray(
                data.deletedItems
            )
                ? data.deletedItems
                : [],

        plans:
            Array.isArray(data.plans)
                ? data.plans
                : [],

        messages:
            data.messages &&
            typeof data.messages ===
                "object"
                ? data.messages
                : {},

        settings: {

            ...defaultData.settings,

            ...(data.settings || {})
        }
    };

    /*
     * 色データを安全化
     */

    if (
        !isValidHexColor(
            normalized.settings.customColor
        )
    ) {

        normalized.settings.customColor =
            DEFAULT_THEME_COLOR;
    }

    return normalized;
}


/* =========================================================
   NORMALIZE RECORD
   ========================================================= */

function normalizeRecord(record) {

    return {

        ...(record || {}),

        id:
            record?.id ||
            generateId(),

        deckId:
            record?.deckId ||
            null,

        deckName:
            record?.deckName ||
            "不明なデッキ",

        date:
            record?.date ||
            new Date().toISOString(),

        answers:
            Number(
                record?.answers
            ) || 0,

        correct:
            Number(
                record?.correct
            ) || 0,

        wrong:
            Number(
                record?.wrong
            ) || 0,

        accuracy:
            Number(
                record?.accuracy
            ) || 0,

        studyTime:
            Number(
                record?.studyTime
            ) || 0
    };
}


/* =========================================================
   NORMALIZE DECK
   ========================================================= */

function normalizeDeck(deck) {

    const normalizedItems =
        Array.isArray(
            deck?.items
        )
            ? deck.items.map(
                (item, index) =>
                    normalizeItem(
                        item,
                        index
                    )
            )
            : [];

    return {

        ...(deck || {}),

        id:
            deck?.id ||
            generateId(),

        name:
            deck?.name ||
            "無題のデッキ",

        language:
            deck?.language ||
            "unknown",

        type:
            deck?.type ||
            "text",

        items:
            normalizedItems,

        createdAt:
            deck?.createdAt ||
            new Date().toISOString(),

        updatedAt:
            deck?.updatedAt ||
            new Date().toISOString(),

        stats: {

            answers: 0,

            correct: 0,

            wrong: 0,

            studyTime: 0,

            ...(deck?.stats || {})
        },

        plan:
            deck?.plan ||
            null
    };
}


/* =========================================================
   NORMALIZE ITEM
   ========================================================= */

function normalizeItem(
    item,
    index = 0
) {

    return {

        ...(item || {}),

        id:
            item?.id ||
            generateId(),

        index:

            Number.isInteger(
                item?.index
            )
                ? item.index
                : index,

        createdAt:
            item?.createdAt ||
            new Date().toISOString(),

        updatedAt:
            item?.updatedAt ||
            new Date().toISOString(),

        deleted:
            Boolean(
                item?.deleted
            )
    };
}


/* =========================================================
   REINDEX ITEMS
   ========================================================= */

function reindexDeckItems(deck) {

    if (
        !deck ||
        !Array.isArray(
            deck.items
        )
    ) {
        return;
    }

    deck.items.forEach(
        (item, index) => {

            item.index =
                index;
        }
    );
}


/* =========================================================
   THEME
   ========================================================= */

function isValidHexColor(color) {

    return (
        typeof color === "string" &&
        /^#[0-9A-Fa-f]{6}$/.test(
            color
        )
    );
}


function createLightColor(hex) {

    if (
        !isValidHexColor(hex)
    ) {

        return "#EEEAFE";
    }

    const value =
        hex.substring(1);

    const r =
        parseInt(
            value.substring(0, 2),
            16
        );

    const g =
        parseInt(
            value.substring(2, 4),
            16
        );

    const b =
        parseInt(
            value.substring(4, 6),
            16
        );

    const mix = channel =>
        Math.round(
            channel +
            (255 - channel) *
            0.88
        );

    return (
        `rgb(` +
        `${mix(r)}, ` +
        `${mix(g)}, ` +
        `${mix(b)}` +
        `)`
    );
}


/* =========================================================
   APPLY THEME
   ========================================================= */

function applyTheme(color) {

    if (
        !isValidHexColor(color)
    ) {

        color =
            DEFAULT_THEME_COLOR;
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
            createLightColor(color)
        );

    const metaTheme =
        document.querySelector(
            'meta[name="theme-color"]'
        );

    if (metaTheme) {

        metaTheme.setAttribute(
            "content",
            color
        );
    }

    document
        .querySelectorAll(
            ".theme-color, [data-theme]"
        )
        .forEach(button => {

            const theme =
                button.getAttribute(
                    "data-theme"
                );

            if (!theme) {
                return;
            }

            button.classList.toggle(
                "selected",
                theme.toLowerCase() ===
                    color.toLowerCase()
            );

            if (
                theme.toLowerCase() ===
                color.toLowerCase()
            ) {

                button.style.borderColor =
                    "#333";

                button.style.boxShadow =
                    "0 0 0 2px #fff, 0 0 0 4px var(--primary)";
            } else {

                button.style.borderColor =
                    "transparent";

                button.style.boxShadow =
                    "none";
            }
        });

    document
        .querySelectorAll(
            'input[type="color"]'
        )
        .forEach(
            picker => {

                if (
                    picker.value
                        .toLowerCase() !==
                    color.toLowerCase()
                ) {

                    picker.value =
                        color;
                }
            }
        );

    if (appData?.settings) {

        appData.settings.customColor =
            color;
    }

    localStorage.setItem(
        THEME_KEY,
        color
    );
}


/* =========================================================
   LOAD THEME
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );

    const storedColor =
        appData.settings
            ?.customColor;

    const colorToApply =
        isValidHexColor(
            savedTheme
        )
            ? savedTheme
            : (
                isValidHexColor(
                    storedColor
                )
                    ? storedColor
                    : DEFAULT_THEME_COLOR
            );

    applyTheme(
        colorToApply
    );
}


/* =========================================================
   RENDER THEME COLORS
   ========================================================= */

function renderThemeColors() {

    const containers = [

        document.getElementById(
            "theme-colors"
        ),

        document.getElementById(
            "theme-color-list"
        ),

        document.querySelector(
            ".theme-colors"
        )
    ];

    const container =
        containers.find(Boolean);

    if (!container) {
        return;
    }

    const currentColor =
        isValidHexColor(
            appData.settings
                ?.customColor
        )
            ? appData.settings
                .customColor
            : DEFAULT_THEME_COLOR;

    container.innerHTML = `

        <div
            class="language-gym-theme-grid"
            style="
                display:grid;
                grid-template-columns:
                    repeat(6, minmax(38px, 1fr));
                gap:12px;
                align-items:center;
                width:100%;
                max-width:420px;
            "
        >

            ${PRESET_COLORS.map(
                (color, index) => `

                    <button
                        type="button"
                        class="theme-color"
                        data-theme="${color}"
                        title="テーマカラー ${index + 1}"
                        aria-label="テーマカラー ${index + 1}"
                        style="
                            width:42px;
                            height:42px;
                            padding:0;
                            border-radius:50%;
                            border:3px solid transparent;
                            background:${color};
                            cursor:pointer;
                            transition:
                                transform .15s ease,
                                box-shadow .15s ease,
                                border-color .15s ease;
                            box-sizing:border-box;
                        "
                    ></button>

                `
            ).join("")}

            <label
                class="custom-color-button"
                title="好きな色を選ぶ"
                aria-label="好きな色を選ぶ"
                style="
                    width:42px;
                    height:42px;
                    border-radius:50%;
                    border:3px solid #ddd;
                    background:
                        conic-gradient(
                            red,
                            yellow,
                            lime,
                            cyan,
                            blue,
                            magenta,
                            red
                        );
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    cursor:pointer;
                    position:relative;
                    overflow:hidden;
                    box-sizing:border-box;
                "
            >

                <input
                    type="color"
                    id="custom-color-picker"
                    value="${currentColor}"
                    style="
                        position:absolute;
                        inset:0;
                        width:100%;
                        height:100%;
                        opacity:0;
                        cursor:pointer;
                    "
                >

                <span
                    style="
                        pointer-events:none;
                        font-size:18px;
                    "
                >
                    🎨
                </span>

            </label>

        </div>

        <div
            id="custom-color-value"
            style="
                margin-top:10px;
                font-size:13px;
                color:#777;
            "
        >

            現在の色：

            <span
                style="
                    font-family:monospace;
                    font-weight:600;
                "
            >
                ${currentColor.toUpperCase()}
            </span>

        </div>
    `;

    applyTheme(
        currentColor
    );
}


/* =========================================================
   CUSTOM COLOR LABEL
   ========================================================= */

function updateCustomColorLabel(
    color
) {

    const label =
        document.getElementById(
            "custom-color-value"
        );

    if (!label) {
        return;
    }

    label.innerHTML = `

        現在の色：

        <span
            style="
                font-family:monospace;
                font-weight:600;
            "
        >
            ${escapeHTML(
                color.toUpperCase()
            )}
        </span>
    `;
}


/* =========================================================
   THEME EVENTS
   ========================================================= */

function setupThemeEvents() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-theme]"
                );

            if (!button) {
                return;
            }

            const color =
                button.getAttribute(
                    "data-theme"
                );

            if (
                !isValidHexColor(
                    color
                )
            ) {
                return;
            }

            applyTheme(
                color
            );

            saveData();

            updateCustomColorLabel(
                color
            );
        }
    );

    document.addEventListener(
        "input",
        event => {

            const target =
                event.target;

            if (
                !target ||
                target.type !== "color"
            ) {
                return;
            }

            const color =
                target.value;

            if (
                !isValidHexColor(
                    color
                )
            ) {
                return;
            }

            applyTheme(
                color
            );

            saveData();

            updateCustomColorLabel(
                color
            );
        }
    );
}


/* =========================================================
   IMPORT LANGUAGE
   ========================================================= */

function getImportLanguage() {

    const select =
        document.getElementById(
            "import-language-select"
        );

    if (!select) {

        return (
            appData.settings
                ?.learningLanguage ||
            "unknown"
        );
    }

    return (
        select.value ||
        appData.settings
            ?.learningLanguage ||
        "unknown"
    );
}


/* =========================================================
   CREATE TEXT DECK
   ========================================================= */

function createTextDeck(
    name,
    language,
    lines,
    type = "text"
) {

    const now =
        new Date().toISOString();

    return {

        id:
            generateId(),

        name:
            name ||
            "無題のデッキ",

        language:
            language ||
            "unknown",

        type:
            type ||
            "text",

        createdAt:
            now,

        updatedAt:
            now,

        items:
            lines.map(
                (line, index) =>
                    normalizeItem(
                        {
                            text:
                                String(
                                    line
                                )
                        },
                        index
                    )
            ),

        stats: {

            answers: 0,

            correct: 0,

            wrong: 0,

            studyTime: 0
        },

        plan: null
    };
}


/* =========================================================
   FILE IMPORT
   ========================================================= */

function setupFileImport() {

    const fileInput =
        document.getElementById(
            "file-input"
        );

    if (!fileInput) {
        return;
    }

    fileInput.addEventListener(
        "change",
        async event => {

            const files =
                Array.from(
                    event.target.files || []
                );

            if (!files.length) {
                return;
            }

            const selectedFile =
                document.getElementById(
                    "selected-file"
                );

            if (selectedFile) {

                selectedFile.textContent =
                    files.length === 1
                        ? `選択中: ${files[0].name}`
                        : `${files.length}個のファイルを選択中`;
            }

            let successCount = 0;

            try {

                for (
                    const file
                    of files
                ) {

                    const result =
                        await importFile(
                            file
                        );

                    if (result) {
                        successCount++;
                    }
                }

            } catch (error) {

                console.error(
                    "教材インポートエラー:",
                    error
                );

                alert(
                    "教材の読み込み中にエラーが発生しました。"
                );
            }

            fileInput.value = "";

            if (
                successCount > 0
            ) {

                renderAll();

                showPage(
                    "decks"
                );
            }
        }
    );
}


/* =========================================================
   FILE ROUTER
   ========================================================= */

async function importFile(file) {

    if (!file) {
        return false;
    }

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    try {

        if (
            extension === "txt"
        ) {

            return await importTXT(
                file
            );
        }

        if (
            extension === "csv"
        ) {

            return await importCSV(
                file
            );
        }

        if (
            extension === "pdf"
        ) {

            return await importPDF(
                file
            );
        }

        alert(
            `「${file.name}」は非対応形式です。\n\n対応形式：TXT / CSV / PDF`
        );

        return false;

    } catch (error) {

        console.error(
            "ファイル読み込みエラー:",
            error
        );

        alert(
            `「${file.name}」の読み込みに失敗しました。`
        );

        return false;
    }
}


/* =========================================================
   TXT IMPORT
   ========================================================= */

async function importTXT(file) {

    const text =
        await file.text();

    const lines =
        text
            .split(/\r?\n/)
            .map(
                line =>
                    line.trim()
            )
            .filter(Boolean);

    if (!lines.length) {

        alert(
            "TXTファイルに有効なデータがありません。"
        );

        return false;
    }

    const language =
        getImportLanguage();

    const deck =
        createTextDeck(
            removeExtension(
                file.name
            ),
            language,
            lines,
            "text"
        );

    appData.decks.push(
        deck
    );

    saveData();

    alert(
        `デッキ「${deck.name}」を作成しました。\n\n${deck.items.length}件のカードを登録しました。`
    );

    return true;
}


/* =========================================================
   PDF IMPORT
   ========================================================= */

async function importPDF(file) {

    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        showPDFSetupPopup();

        return false;
    }

    try {

        const buffer =
            await file.arrayBuffer();

        const pdf =
            await pdfjsLib
                .getDocument({
                    data:
                        buffer
                })
                .promise;

        const lines = [];

        for (
            let pageNumber = 1;
            pageNumber <=
                pdf.numPages;
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
                    .join(" ")
                    .trim();

            if (pageText) {

                lines.push(
                    pageText
                );
            }
        }

        if (!lines.length) {

            alert(
                "PDFからテキストを抽出できませんでした。\n\n画像PDFの場合はOCRが必要です。"
            );

            return false;
        }

        const language =
            getImportLanguage();

        const deck =
            createTextDeck(
                removeExtension(
                    file.name
                ),
                language,
                lines,
                "pdf"
            );

        appData.decks.push(
            deck
        );

        saveData();

        alert(
            `デッキ「${deck.name}」を作成しました。\n\n${deck.items.length}ページ分のデータを登録しました。`
        );

        return true;

    } catch (error) {

        console.error(
            "PDF読み込みエラー:",
            error
        );

        alert(
            "PDFの読み込みに失敗しました。"
        );

        return false;
    }
}


/* =========================================================
   PDF SETUP POPUP
   ========================================================= */

function showPDFSetupPopup() {

    const existing =
        document.getElementById(
            "pdf-setup-popup"
        );

    if (existing) {
        existing.remove();
    }

    const popup =
        document.createElement(
            "div"
        );

    popup.id =
        "pdf-setup-popup";

    popup.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.5);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9999;
        padding:20px;
        box-sizing:border-box;
    `;

    popup.innerHTML = `

        <div
            style="
                background:#fff;
                padding:24px;
                border-radius:16px;
                max-width:380px;
                width:100%;
                text-align:center;
                box-sizing:border-box;
            "
        >

            <div
                style="
                    font-size:40px;
                    margin-bottom:10px;
                "
            >
                📄
            </div>

            <h3>
                PDFライブラリ未検出
            </h3>

            <p
                style="
                    font-size:14px;
                    color:#666;
                    line-height:1.7;
                "
            >
                PDFを読み込むには
                PDF.jsライブラリが必要です。
            </p>

            <button
                type="button"
                id="close-pdf-setup-popup"
                style="
                    padding:10px 20px;
                    border:0;
                    border-radius:8px;
                    background:var(--primary);
                    color:#fff;
                    cursor:pointer;
                "
            >
                閉じる
            </button>

        </div>
    `;

    document.body.appendChild(
        popup
    );

    document
        .getElementById(
            "close-pdf-setup-popup"
        )
        ?.addEventListener(
            "click",
            () => popup.remove()
        );
}


/* =========================================================
   CSV IMPORT
   ========================================================= */

async function importCSV(file) {

    const text =
        await file.text();

    const rows =
        parseCSV(text);

    if (!rows.length) {

        alert(
            "CSVファイルに有効なデータがありません。"
        );

        return false;
    }

    const language =
        getImportLanguage();

    const now =
        new Date().toISOString();

    const deck = {

        id:
            generateId(),

        name:
            removeExtension(
                file.name
            ),

        language,

        type:
            "csv",

        createdAt:
            now,

        updatedAt:
            now,

        items:
            rows.map(
                (row, index) =>
                    normalizeItem(
                        {
                            data:
                                row
                        },
                        index
                    )
            ),

        stats: {

            answers: 0,

            correct: 0,

            wrong: 0,

            studyTime: 0
        },

        plan: null
    };

    appData.decks.push(
        deck
    );

    saveData();

    alert(
        `デッキ「${deck.name}」を作成しました。\n\n${deck.items.length}行を登録しました。`
    );

    return true;
}


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(text) {

    const rows = [];

    let row = [];

    let cell = "";

    let insideQuotes =
        false;

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

            row.push(
                cell
            );

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

            row.push(
                cell
            );

            if (
                row.some(
                    value =>
                        String(value)
                            .trim() !== ""
                )
            ) {

                rows.push(
                    row
                );
            }

            row = [];

            cell = "";

            continue;
        }

        cell += char;
    }

    row.push(
        cell
    );

    if (
        row.some(
            value =>
                String(value)
                    .trim() !== ""
        )
    ) {

        rows.push(
            row
        );
    }

    return rows;
}


/* =========================================================
   ADD FILE TO EXISTING DECK
   ========================================================= */

async function addFileToDeck(
    file,
    deckId
) {

    const deck =
        appData.decks.find(
            d =>
                d.id ===
                deckId
        );

    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return false;
    }

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    let newItems = [];

    try {

        /* =================================================
           TXT
           ================================================= */

        if (
            extension === "txt"
        ) {

            const text =
                await file.text();

            const lines =
                text
                    .split(/\r?\n/)
                    .map(
                        line =>
                            line.trim()
                    )
                    .filter(Boolean);

            newItems =
                lines.map(
                    line =>
                        normalizeItem(
                            {
                                text:
                                    line
                            }
                        )
                );
        }

        /* =================================================
           PDF
           ================================================= */

        else if (
            extension === "pdf"
        ) {

            if (
                typeof pdfjsLib ===
                "undefined"
            ) {

                showPDFSetupPopup();

                return false;
            }

            const buffer =
                await file.arrayBuffer();

            const pdf =
                await pdfjsLib
                    .getDocument({
                        data:
                            buffer
                    })
                    .promise;

            const lines = [];

            for (
                let pageNumber = 1;
                pageNumber <=
                    pdf.numPages;
                pageNumber++
            ) {

                const page =
                    await pdf.getPage(
                        pageNumber
                    );

                const content =
                    await page.getTextContent();

                const text =
                    content.items
                        .map(
                            item =>
                                item.str
                        )
                        .join(" ")
                        .trim();

                if (text) {

                    lines.push(
                        text
                    );
                }
            }

            newItems =
                lines.map(
                    line =>
                        normalizeItem(
                            {
                                text:
                                    line
                            }
                        )
                );
        }

        /* =================================================
           CSV
           ================================================= */

        else if (
            extension === "csv"
        ) {

            const text =
                await file.text();

            const rows =
                parseCSV(text);

            newItems =
                rows.map(
                    row =>
                        normalizeItem(
                            {
                                data:
                                    row
                            }
                        )
                );
        }

        else {

            alert(
                "TXT / CSV / PDFファイルのみ追加できます。"
            );

            return false;
        }

        if (!newItems.length) {

            alert(
                "追加できるデータがありません。"
            );

            return false;
        }

        deck.items.push(
            ...newItems
        );

        reindexDeckItems(
            deck
        );

        deck.updatedAt =
            new Date().toISOString();

        saveData();

        renderAll();

        alert(
            `${newItems.length}件を「${deck.name}」に追加しました。`
        );

        return true;

    } catch (error) {

        console.error(
            "既存デッキへの追加エラー:",
            error
        );

        alert(
            "教材の追加に失敗しました。"
        );

        return false;
    }
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(
    pageName
) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );
        });

    const targetPage =
        document.getElementById(
            `page-${pageName}`
        );

    if (targetPage) {

        targetPage.classList.add(
            "active-page"
        );
    }

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.classList.remove(
                "active"
            );

            if (
                item.dataset.page ===
                pageName
            ) {

                item.classList.add(
                    "active"
                );
            }
        });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (
        pageName === "study"
    ) {

        renderStudyPage();
    }

    if (
        pageName === "decks"
    ) {

        renderDecks();
    }

    if (
        pageName === "progress"
    ) {

        renderProgress();
    }

    if (
        pageName === "home"
    ) {

        renderHomeStats();

        renderDailyMessage();
    }

    if (
        pageName === "share" ||
        pageName === "data-share"
    ) {

        renderDataSharePage();
    }
}


/* =========================================================
   PAGE BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-page]"
            );

        if (!button) {
            return;
        }

        const pageName =
            button.dataset.page;

        if (pageName) {

            showPage(
                pageName
            );
        }
    }
);


/* =========================================================
   TRAINING CARDS
   ========================================================= */

function setupTrainingCards() {

    document
        .querySelectorAll(
            ".training-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    showPage(
                        "decks"
                    );
                }
            );
        });
}


/* =========================================================
   DECK RENDERING
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
        !appData.decks.length
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    デッキがありません
                </h3>

                <p>
                    教材ファイル
                    （PDF / TXT / CSV）
                    を読み込んで作成しましょう。
                </p>

                <button
                    class="primary-button"
                    data-page="import"
                    type="button"
                >
                    教材を追加する
                </button>

            </div>
        `;

        return;
    }

    container.innerHTML =
        appData.decks
            .map(
                deck => {

                    const total =
                        Array.isArray(
                            deck.items
                        )
                            ? deck.items.filter(
                                item =>
                                    !item.deleted
                            ).length
                            : 0;

                    const answers =
                        Number(
                            deck.stats?.answers
                        ) || 0;

                    const correct =
                        Number(
                            deck.stats?.correct
                        ) || 0;

                    const accuracy =
                        answers > 0
                            ? Math.round(
                                correct /
                                answers *
                                100
                            )
                            : 0;

                    return `

                        <div
                            class="deck-card"
                            data-id="${escapeHTML(
                                deck.id
                            )}"
                        >

                            <div
                                class="deck-header"
                            >

                                <span
                                    class="deck-type-tag"
                                    style="
                                        background:
                                            var(--primary-light);
                                        color:
                                            var(--primary);
                                        padding:
                                            2px 8px;
                                        border-radius:
                                            4px;
                                        font-size:
                                            12px;
                                        font-weight:
                                            bold;
                                    "
                                >
                                    ${escapeHTML(
                                        (
                                            deck.type ||
                                            "text"
                                        ).toUpperCase()
                                    )}
                                </span>

                                <h3
                                    class="deck-title"
                                    style="
                                        margin:
                                            8px 0;
                                    "
                                >
                                    ${escapeHTML(
                                        deck.name
                                    )}
                                </h3>

                            </div>

                            <div
                                class="deck-meta"
                                style="
                                    font-size:13px;
                                    color:#666;
                                    display:flex;
                                    gap:12px;
                                    margin-bottom:12px;
                                    flex-wrap:wrap;
                                "
                            >

                                <span>
                                    ${total} 項目
                                </span>

                                <span>
                                    正答率:
                                    ${accuracy}%
                                </span>

                                <span>
                                    学習時間:
                                    ${formatSeconds(
                                        deck.stats
                                            ?.studyTime
                                    )}
                                </span>

                            </div>

                            <div
                                class="deck-actions"
                            >

                                <button
                                    type="button"
                                    class="
                                        primary-button
                                        start-study-btn
                                    "
                                    data-id="${escapeHTML(
                                        deck.id
                                    )}"
                                    style="
                                        background:
                                            var(--primary);
                                        color:#fff;
                                        border:0;
                                        padding:
                                            8px 16px;
                                        border-radius:
                                            6px;
                                        cursor:pointer;
                                    "
                                >
                                    学習開始
                                </button>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   DECK BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".start-study-btn"
            );

        if (!button) {
            return;
        }

        const deckId =
            button.dataset.id;

        startStudy(
            deckId
        );
    }
);


/* =========================================================
   STUDY
   ========================================================= */

function startStudy(
    deckId
) {

    const deck =
        appData.decks.find(
            d =>
                d.id ===
                deckId
        );

    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return;
    }

    const activeItems =
        Array.isArray(
            deck.items
        )
            ? deck.items.filter(
                item =>
                    !item.deleted
            )
            : [];

    if (
        !activeItems.length
    ) {

        alert(
            "このデッキにはカードがありません。"
        );

        return;
    }

    studyState = {

        active: true,

        deckId,

        currentIndex: 0,

        sessionAnswers: 0,

        sessionCorrect: 0,

        sessionWrong: 0,

        startedAt:
            Date.now(),

        timerInterval:
            null,

        elapsedSeconds: 0,

        answerShown: false
    };

    startStudyTimer();

    showPage(
        "study"
    );
}


/* =========================================================
   STUDY TIMER
   ========================================================= */

function startStudyTimer() {

    stopStudyTimer();

    studyState.timerInterval =
        setInterval(
            () => {

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


function updateStudyTimer() {

    const elements =
        document.querySelectorAll(
            "[data-study-timer]"
        );

    const seconds =
        studyState.elapsedSeconds;

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remaining =
        seconds % 60;

    const formatted =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(remaining).padStart(2, "0")}`;

    elements.forEach(
        element => {

            element.textContent =
                formatted;
        }
    );
}


/* =========================================================
   STUDY PAGE
   ========================================================= */

function renderStudyPage() {

    const container =
        document.getElementById(
            "study-content"
        );

    if (!container) {
        return;
    }

    if (
        !studyState.active ||
        !studyState.deckId
    ) {

        container.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:40px 20px;
                "
            >

                <div
                    style="
                        font-size:48px;
                        margin-bottom:12px;
                    "
                >
                    📖
                </div>

                <h2>
                    学習するデッキを選んでください
                </h2>

                <button
                    type="button"
                    class="primary-button"
                    data-page="decks"
                >
                    デッキ一覧へ
                </button>

            </div>
        `;

        return;
    }

    const deck =
        appData.decks.find(
            d =>
                d.id ===
                studyState.deckId
        );

    if (!deck) {

        studyState.active =
            false;

        return;
    }

    const items =
        Array.isArray(
            deck.items
        )
            ? deck.items.filter(
                item =>
                    !item.deleted
            )
            : [];

    if (
        studyState.currentIndex >=
        items.length
    ) {

        finishStudy();

        return;
    }

    const item =
        items[
            studyState.currentIndex
        ];

    let content = "";

    if (
        item.text !== undefined &&
        item.text !== null
    ) {

        content =
            String(
                item.text
            );

    } else if (
        Array.isArray(
            item.data
        )
    ) {

        content =
            item.data
                .map(
                    value =>
                        String(value)
                )
                .join(" / ");

    } else if (
        item.data !== undefined
    ) {

        content =
            String(
                item.data
            );
    }

    container.innerHTML = `

        <div
            style="
                max-width:700px;
                margin:0 auto;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:
                        space-between;
                    align-items:center;
                    gap:16px;
                    margin-bottom:20px;
                "
            >

                <strong>
                    ${escapeHTML(
                        deck.name
                    )}
                </strong>

                <span
                    data-study-timer
                    style="
                        font-family:monospace;
                        font-weight:bold;
                    "
                >
                    00:00
                </span>

            </div>

            <div
                style="
                    margin-bottom:16px;
                    color:#666;
                "
            >
                ${studyState.currentIndex + 1}
                /
                ${items.length}
            </div>

            <div
                style="
                    padding:40px 24px;
                    border-radius:20px;
                    background:
                        var(--primary-light);
                    min-height:180px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    font-size:22px;
                    line-height:1.7;
                    margin-bottom:20px;
                    box-sizing:border-box;
                    word-break:break-word;
                "
            >
                ${escapeHTML(
                    content
                )}
            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(2,1fr);
                    gap:12px;
                "
            >

                <button
                    type="button"
                    data-study-answer="correct"
                    style="
                        padding:16px;
                        border:0;
                        border-radius:12px;
                        background:
                            var(--primary);
                        color:#fff;
                        cursor:pointer;
                        font-weight:bold;
                    "
                >
                    ✓ 正解
                </button>

                <button
                    type="button"
                    data-study-answer="wrong"
                    style="
                        padding:16px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        background:#fff;
                        cursor:pointer;
                        font-weight:bold;
                    "
                >
                    ✕ 不正解
                </button>

            </div>

        </div>
    `;

    updateStudyTimer();
}


/* =========================================================
   STUDY ANSWER EVENT
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-study-answer]"
            );

        if (!button) {
            return;
        }

        const result =
            button.dataset.studyAnswer;

        answerStudy(
            result === "correct"
        );
    }
);


/* =========================================================
   ANSWER STUDY
   ========================================================= */

function answerStudy(
    isCorrect
) {

    if (
        !studyState.active
    ) {
        return;
    }

    const deck =
        appData.decks.find(
            d =>
                d.id ===
                studyState.deckId
        );

    if (!deck) {
        return;
    }

    studyState.sessionAnswers++;

    if (isCorrect) {

        studyState.sessionCorrect++;

    } else {

        studyState.sessionWrong++;
    }

    if (!deck.stats) {

        deck.stats = {

            answers: 0,

            correct: 0,

            wrong: 0,

            studyTime: 0
        };
    }

    deck.stats.answers++;

    if (isCorrect) {

        deck.stats.correct++;

    } else {

        deck.stats.wrong++;
    }

    deck.updatedAt =
        new Date().toISOString();

    studyState.currentIndex++;

    saveData();

    renderStudyPage();
}


/* =========================================================
   FINISH STUDY
   ========================================================= */

function finishStudy() {

    if (
        !studyState.active
    ) {
        return;
    }

    const deck =
        appData.decks.find(
            d =>
                d.id ===
                studyState.deckId
        );

    const elapsed =
        studyState.elapsedSeconds;

    if (deck) {

        if (!deck.stats) {

            deck.stats = {

                answers: 0,

                correct: 0,

                wrong: 0,

                studyTime: 0
            };
        }

        deck.stats.studyTime =
            (
                Number(
                    deck.stats.studyTime
                ) || 0
            ) +
            elapsed;

        deck.updatedAt =
            new Date().toISOString();
    }

    const record = {

        id:
            generateId(),

        deckId:
            studyState.deckId,

        deckName:
            deck?.name ||
            "不明なデッキ",

        date:
            new Date().toISOString(),

        answers:
            studyState.sessionAnswers,

        correct:
            studyState.sessionCorrect,

        wrong:
            studyState.sessionWrong,

        accuracy:
            studyState.sessionAnswers
                ? Math.round(
                    studyState.sessionCorrect /
                    studyState.sessionAnswers *
                    100
                )
                : 0,

        studyTime:
            elapsed
    };

    if (
        !Array.isArray(
            appData.records
        )
    ) {

        appData.records = [];
    }

    appData.records.push(
        record
    );

    saveData();

    stopStudyTimer();

    const result = {
        ...studyState
    };

    studyState = {

        active: false,

        deckId: null,

        currentIndex: 0,

        sessionAnswers: 0,

        sessionCorrect: 0,

        sessionWrong: 0,

        startedAt: null,

        timerInterval: null,

        elapsedSeconds: 0,

        answerShown: false
    };

    renderProgress();

    alert(
        `学習終了！\n\n` +
        `回答数：${result.sessionAnswers}\n` +
        `正解：${result.sessionCorrect}\n` +
        `不正解：${result.sessionWrong}\n` +
        `学習時間：${formatSeconds(
            elapsed
        )}`
    );

    showPage(
        "progress"
    );
}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    const container =
        document.getElementById(
            "progress-content"
        );

    if (!container) {
        return;
    }

    const records =
        Array.isArray(
            appData.records
        )
            ? appData.records
            : [];

    const totalAnswers =
        records.reduce(
            (
                sum,
                record
            ) =>
                sum +
                (
                    Number(
                        record.answers
                    ) || 0
                ),
            0
        );

    const totalCorrect =
        records.reduce(
            (
                sum,
                record
            ) =>
                sum +
                (
                    Number(
                        record.correct
                    ) || 0
                ),
            0
        );

    const totalTime =
        appData.decks.reduce(
            (
                sum,
                deck
            ) =>
                sum +
                (
                    Number(
                        deck.stats
                            ?.studyTime
                    ) || 0
                ),
            0
        );

    const accuracy =
        totalAnswers > 0
            ? Math.round(
                totalCorrect /
                totalAnswers *
                100
            )
            : 0;

    container.innerHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(150px,1fr)
                    );
                gap:12px;
                margin-bottom:24px;
            "
        >

            <div
                style="
                    padding:20px;
                    border-radius:16px;
                    background:
                        var(--primary-light);
                    text-align:center;
                "
            >

                <strong
                    style="
                        font-size:28px;
                        color:
                            var(--primary);
                    "
                >
                    ${totalAnswers}
                </strong>

                <div>
                    総回答数
                </div>

            </div>

            <div
                style="
                    padding:20px;
                    border-radius:16px;
                    background:
                        var(--primary-light);
                    text-align:center;
                "
            >

                <strong
                    style="
                        font-size:28px;
                        color:
                            var(--primary);
                    "
                >
                    ${accuracy}%
                </strong>

                <div>
                    正答率
                </div>

            </div>

            <div
                style="
                    padding:20px;
                    border-radius:16px;
                    background:
                        var(--primary-light);
                    text-align:center;
                "
            >

                <strong
                    style="
                        font-size:28px;
                        color:
                            var(--primary);
                        display:block;
                        word-break:
                            break-word;
                    "
                >
                    ${formatSeconds(
                        totalTime
                    )}
                </strong>

                <div>
                    累計学習時間
                </div>

            </div>

        </div>

        <h3>
            学習履歴
        </h3>

        ${
            records.length
                ? `

                    <div
                        style="
                            display:flex;
                            flex-direction:column;
                            gap:10px;
                        "
                    >

                        ${records
                            .slice()
                            .reverse()
                            .map(
                                record => `

                                    <div
                                        style="
                                            padding:14px;
                                            border:
                                                1px solid #eee;
                                            border-radius:
                                                12px;
                                        "
                                    >

                                        <strong>
                                            ${escapeHTML(
                                                record.deckName
                                            )}
                                        </strong>

                                        <div
                                            style="
                                                font-size:
                                                    13px;
                                                color:#666;
                                                margin-top:
                                                    6px;
                                            "
                                        >
                                            ${formatDate(
                                                record.date
                                            )}
                                        </div>

                                        <div
                                            style="
                                                margin-top:
                                                    8px;
                                                line-height:
                                                    1.7;
                                            "
                                        >
                                            ${record.answers}問
                                            /
                                            正解 ${record.correct}
                                            /
                                            不正解 ${record.wrong}
                                            /
                                            ${record.accuracy}%
                                            /
                                            ${formatSeconds(
                                                record.studyTime
                                            )}
                                        </div>

                                    </div>

                                `
                            )
                            .join("")}

                    </div>

                `
                : `

                    <div
                        style="
                            padding:30px;
                            text-align:center;
                            color:#777;
                        "
                    >
                        まだ学習記録がありません。
                    </div>

                `
        }
    `;
}


/* =========================================================
   HOME STATS
   ========================================================= */

function renderHomeStats() {

    const containers = [

        document.getElementById(
            "home-stats"
        ),

        document.getElementById(
            "home-stat"
        ),

        document.querySelector(
            ".home-stats"
        )
    ];

    const container =
        containers.find(Boolean);

    if (!container) {
        return;
    }

    const decks =
        appData.decks.length;

    const records =
        appData.records.length;

    const answers =
        appData.records.reduce(
            (
                sum,
                record
            ) =>
                sum +
                (
                    Number(
                        record.answers
                    ) || 0
                ),
            0
        );

    container.innerHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(3,1fr);
                gap:12px;
            "
        >

            <div
                style="
                    padding:16px;
                    border-radius:14px;
                    background:
                        var(--primary-light);
                    text-align:center;
                "
            >

                <strong
                    style="
                        font-size:24px;
                        color:
                            var(--primary);
                    "
                >
                    ${decks}
                </strong>

                <div>
                    デッキ
                </div>

            </div>

            <div
                style="
                    padding:16px;
                    border-radius:14px;
                    background:
                        var(--primary-light);
                    text-align:center;
                "
            >

                <strong
                    style="
                        font-size:24px;
                        color:
                            var(--primary);
                    "
                >
                    ${records}
                </strong>

                <div>
                    学習記録
                </div>

            </div>

            <div
                style="
                    padding:16px;
                    border-radius:14px;
                    background:
                        var(--primary-light);
                    text-align:center;
                "
            >

                <strong
                    style="
                        font-size:24px;
                        color:
                            var(--primary);
                    "
                >
                    ${answers}
                </strong>

                <div>
                    総回答数
                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   DAILY MESSAGE
   ========================================================= */

function renderDailyMessage() {

    const containers = [

        document.getElementById(
            "daily-message"
        ),

        document.getElementById(
            "home-message"
        ),

        document.querySelector(
            ".daily-message"
        )
    ];

    const container =
        containers.find(Boolean);

    if (!container) {
        return;
    }

    const hour =
        new Date().getHours();

    let greeting;

    if (hour < 5) {

        greeting =
            "こんばんは";

    } else if (hour < 11) {

        greeting =
            "おはようございます";

    } else if (hour < 18) {

        greeting =
            "こんにちは";

    } else {

        greeting =
            "こんばんは";
    }

    container.innerHTML = `

        <div>
            ${greeting} ☀️
        </div>
    `;
}


/* =========================================================
   DATA SHARING PAGE
   ========================================================= */

function renderDataSharePage() {

    const containers = [

        document.getElementById(
            "data-share-content"
        ),

        document.getElementById(
            "data-sharing-content"
        ),

        document.getElementById(
            "share-data-content"
        )
    ];

    const container =
        containers.find(Boolean);

    if (!container) {
        return;
    }

    const deckCount =
        Array.isArray(
            appData.decks
        )
            ? appData.decks.length
            : 0;

    const recordCount =
        Array.isArray(
            appData.records
        )
            ? appData.records.length
            : 0;

    container.innerHTML = `

        <div
            style="
                max-width:600px;
                margin:0 auto;
            "
        >

            <div
                style="
                    text-align:center;
                    margin-bottom:24px;
                "
            >

                <div
                    style="
                        font-size:48px;
                        margin-bottom:8px;
                    "
                >
                    📦
                </div>

                <h2
                    style="
                        margin:
                            0 0 8px;
                    "
                >
                    データ共有
                </h2>

                <p
                    style="
                        color:#666;
                        line-height:1.7;
                        margin:0;
                    "
                >
                    Language Gymの学習データを
                    <br>
                    別の端末へ移動・共有できます。
                </p>

            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0,1fr)
                        );
                    gap:12px;
                    margin-bottom:24px;
                "
            >

                <div
                    style="
                        padding:16px;
                        border-radius:14px;
                        background:
                            var(--primary-light);
                        text-align:center;
                    "
                >

                    <div
                        style="
                            font-size:24px;
                            font-weight:bold;
                            color:
                                var(--primary);
                        "
                    >
                        ${deckCount}
                    </div>

                    <div
                        style="
                            font-size:13px;
                            color:#666;
                        "
                    >
                        デッキ
                    </div>

                </div>

                <div
                    style="
                        padding:16px;
                        border-radius:14px;
                        background:
                            var(--primary-light);
                        text-align:center;
                    "
                >

                    <div
                        style="
                            font-size:24px;
                            font-weight:bold;
                            color:
                                var(--primary);
                        "
                    >
                        ${recordCount}
                    </div>

                    <div
                        style="
                            font-size:13px;
                            color:#666;
                        "
                    >
                        学習記録
                    </div>

                </div>

            </div>

            <div
                style="
                    display:flex;
                    flex-direction:column;
                    gap:12px;
                "
            >

                <button
                    type="button"
                    data-action="share-data"
                    style="
                        width:100%;
                        padding:14px 18px;
                        border:0;
                        border-radius:12px;
                        background:
                            var(--primary);
                        color:#fff;
                        font-size:15px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    📤 データを共有する
                </button>

                <button
                    type="button"
                    data-action="export-data"
                    style="
                        width:100%;
                        padding:14px 18px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        background:#fff;
                        color:#333;
                        font-size:15px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    💾 JSONファイルとして保存
                </button>

                <button
                    type="button"
                    data-action="import-data"
                    style="
                        width:100%;
                        padding:14px 18px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        background:#fff;
                        color:#333;
                        font-size:15px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    📥 データを読み込む
                </button>

                <button
                    type="button"
                    data-action="restore-backup"
                    style="
                        width:100%;
                        padding:14px 18px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        background:#fff;
                        color:#333;
                        font-size:15px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    ♻️ 自動バックアップから復元
                </button>

            </div>

            <div
                style="
                    margin-top:24px;
                    padding:16px;
                    border-radius:12px;
                    background:#f7f7f7;
                    font-size:13px;
                    line-height:1.8;
                    color:#666;
                "
            >

                <strong
                    style="
                        color:#333;
                    "
                >
                    💡 データ移行
                </strong>

                <br><br>

                ① JSONファイルとして保存

                <br>

                ② 別の端末へファイルを送る

                <br>

                ③ 別の端末でLanguage Gymを開く

                <br>

                ④ 「データを読み込む」

                <br>

                ⑤ 「置き換える」または
                「追加する」を選択

            </div>

        </div>
    `;
}


/* =========================================================
   EXPORT DATA
   ========================================================= */

function createExportData() {

    return {

        appName:
            "Language Gym",

        version:
            APP_VERSION,

        exportedAt:
            new Date().toISOString(),

        data:
            structuredClone(
                appData
            )
    };
}


function exportDataAsJSON() {

    try {

        const exportData =
            createExportData();

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

        const date =
            new Date()
                .toISOString()
                .slice(0, 10);

        link.href =
            url;

        link.download =
            `Language-Gym-backup-${date}.json`;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            url
        );

        alert(
            "JSONファイルを保存しました。"
        );

    } catch (error) {

        console.error(
            "JSON書き出しエラー:",
            error
        );

        alert(
            "JSONファイルの作成に失敗しました。"
        );
    }
}


/* =========================================================
   SHARE DATA
   ========================================================= */

async function shareData() {

    try {

        const exportData =
            createExportData();

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

        const date =
            new Date()
                .toISOString()
                .slice(0, 10);

        const filename =
            `Language-Gym-backup-${date}.json`;

        if (
            navigator.share &&
            typeof File !==
                "undefined"
        ) {

            const file =
                new File(
                    [blob],
                    filename,
                    {
                        type:
                            "application/json"
                    }
                );

            if (
                !navigator.canShare ||
                navigator.canShare({
                    files: [file]
                })
            ) {

                await navigator.share({

                    title:
                        "Language Gym",

                    text:
                        "Language Gymの学習データ",

                    files:
                        [file]
                });

                return;
            }
        }

        exportDataAsJSON();

    } catch (error) {

        if (
            error?.name ===
            "AbortError"
        ) {
            return;
        }

        console.error(
            "データ共有エラー:",
            error
        );

        alert(
            "共有に失敗したため、JSONファイルとして保存します。"
        );

        exportDataAsJSON();
    }
}


/* =========================================================
   IMPORT JSON DATA
   ========================================================= */

function importDataFromJSON() {

    const input =
        document.createElement(
            "input"
        );

    input.type =
        "file";

    input.accept =
        ".json,application/json";

    input.addEventListener(
        "change",
        async event => {

            const file =
                event.target
                    .files?.[0];

            if (!file) {
                return;
            }

            try {

                const text =
                    await file.text();

                const parsed =
                    JSON.parse(
                        text
                    );

                let importedData;

                if (
                    parsed &&
                    parsed.data &&
                    typeof parsed.data ===
                        "object"
                ) {

                    importedData =
                        parsed.data;

                } else {

                    importedData =
                        parsed;
                }

                const normalized =
                    normalizeImportedData(
                        importedData
                    );

                showImportModeDialog(
                    normalized
                );

            } catch (error) {

                console.error(
                    "JSON読み込みエラー:",
                    error
                );

                alert(
                    "JSONファイルを読み込めませんでした。\n\n正しいLanguage Gymデータか確認してください。"
                );
            }
        }
    );

    input.click();
}


/* =========================================================
   IMPORT MODE DIALOG
   ========================================================= */

function showImportModeDialog(
    importedData
) {

    const existing =
        document.getElementById(
            "language-gym-import-dialog"
        );

    if (existing) {
        existing.remove();
    }

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "language-gym-import-dialog";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.45);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:10000;
        padding:20px;
        box-sizing:border-box;
    `;

    const deckCount =
        importedData.decks.length;

    const recordCount =
        importedData.records.length;

    overlay.innerHTML = `

        <div
            style="
                background:#fff;
                width:min(420px,100%);
                border-radius:20px;
                padding:24px;
                box-shadow:
                    0 20px 60px
                    rgba(0,0,0,.2);
                box-sizing:border-box;
            "
        >

            <div
                style="
                    font-size:36px;
                    text-align:center;
                    margin-bottom:8px;
                "
            >
                📥
            </div>

            <h3
                style="
                    text-align:center;
                    margin:
                        0 0 10px;
                "
            >
                データを読み込みます
            </h3>

            <p
                style="
                    text-align:center;
                    color:#666;
                    line-height:1.7;
                "
            >
                デッキ ${deckCount}個
                ／
                学習記録 ${recordCount}件
            </p>

            <div
                style="
                    display:flex;
                    flex-direction:column;
                    gap:10px;
                    margin-top:20px;
                "
            >

                <button
                    type="button"
                    data-import-mode="replace"
                    style="
                        padding:14px;
                        border:0;
                        border-radius:12px;
                        background:
                            var(--primary);
                        color:#fff;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    🔄 現在のデータを置き換える
                </button>

                <button
                    type="button"
                    data-import-mode="merge"
                    style="
                        padding:14px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        background:#fff;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    ➕ 現在のデータに追加する
                </button>

                <button
                    type="button"
                    data-import-mode="cancel"
                    style="
                        padding:12px;
                        border:0;
                        background:transparent;
                        color:#777;
                        cursor:pointer;
                    "
                >
                    キャンセル
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(
        overlay
    );

    overlay.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-import-mode]"
                );

            if (!button) {
                return;
            }

            const mode =
                button.dataset
                    .importMode;

            overlay.remove();

            if (
                mode === "replace"
            ) {

                replaceData(
                    importedData
                );

                return;
            }

            if (
                mode === "merge"
            ) {

                mergeData(
                    importedData
                );

                return;
            }
        }
    );
}


/* =========================================================
   REPLACE DATA
   ========================================================= */

function replaceData(
    importedData
) {

    const confirmed =
        confirm(
            "現在のLanguage Gymデータをすべて置き換えます。\n\n本当によろしいですか？"
        );

    if (!confirmed) {
        return;
    }

    appData =
        normalizeImportedData(
            importedData
        );

    saveData();

    loadTheme();

    renderAll();

    alert(
        "データを置き換えました。"
    );
}


/* =========================================================
   MERGE DATA
   ========================================================= */

function mergeData(
    importedData
) {

    const currentDeckIds =
        new Set(
            appData.decks.map(
                deck =>
                    deck.id
            )
        );

    const currentRecordIds =
        new Set(
            appData.records.map(
                record =>
                    record.id
            )
        );

    let addedDecks = 0;

    let addedRecords = 0;


    /* =====================================================
       DECKS
       ===================================================== */

    for (
        const importedDeck
        of importedData.decks
    ) {

        const deck =
            structuredClone(
                importedDeck
            );

        if (
            currentDeckIds.has(
                deck.id
            )
        ) {

            deck.id =
                generateId();
        }

        deck.items =
            Array.isArray(
                deck.items
            )
                ? deck.items.map(
                    item =>
                        normalizeItem(
                            item
                        )
                )
                : [];

        reindexDeckItems(
            deck
        );

        appData.decks.push(
            deck
        );

        currentDeckIds.add(
            deck.id
        );

        addedDecks++;
    }


    /* =====================================================
       RECORDS
       ===================================================== */

    for (
        const importedRecord
        of importedData.records
    ) {

        const record =
            normalizeRecord(
                structuredClone(
                    importedRecord
                )
            );

        if (
            currentRecordIds.has(
                record.id
            )
        ) {

            record.id =
                generateId();
        }

        appData.records.push(
            record
        );

        currentRecordIds.add(
            record.id
        );

        addedRecords++;
    }


    /* =====================================================
       OTHER DATA
       ===================================================== */

    if (
        Array.isArray(
            importedData.deletedItems
        )
    ) {

        appData.deletedItems.push(
            ...structuredClone(
                importedData.deletedItems
            )
        );
    }

    if (
        Array.isArray(
            importedData.plans
        )
    ) {

        appData.plans.push(
            ...structuredClone(
                importedData.plans
            )
        );
    }

    if (
        importedData.messages &&
        typeof importedData.messages ===
            "object"
    ) {

        appData.messages = {

            ...appData.messages,

            ...structuredClone(
                importedData.messages
            )
        };
    }

    saveData();

    loadTheme();

    renderAll();

    alert(
        `データを追加しました！\n\n` +
        `追加デッキ：${addedDecks}個\n\n` +
        `追加学習記録：${addedRecords}件`
    );
}


/* =========================================================
   DATA SHARE BUTTON EVENTS
   ========================================================= */

function setupDataShareEvents() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) {
                return;
            }

            const action =
                button.dataset.action;

            if (
                action ===
                "share-data"
            ) {

                shareData();

                return;
            }

            if (
                action ===
                "export-data"
            ) {

                exportDataAsJSON();

                return;
            }

            if (
                action ===
                "import-data"
            ) {

                importDataFromJSON();

                return;
            }

            if (
                action ===
                "restore-backup"
            ) {

                restoreAutomaticBackup();

                return;
            }
        }
    );
}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

    renderThemeColors();

    renderDecks();

    renderHomeStats();

    renderDailyMessage();

    renderProgress();

    renderDataSharePage();

    if (
        studyState.active
    ) {

        renderStudyPage();
    }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initApp() {

    /*
     * ① テーマ
     */

    loadTheme();


    /*
     * ② テーマUI
     */

    renderThemeColors();


    /*
     * ③ テーマイベント
     */

    setupThemeEvents();


    /*
     * ④ 教材インポート
     */

    setupFileImport();


    /*
     * ⑤ データ共有
     */

    setupDataShareEvents();


    /*
     * ⑥ トレーニングカード
     */

    setupTrainingCards();


    /*
     * ⑦ 全画面描画
     */

    renderAll();


    /*
     * ⑧ 現在時刻に合わせて
     *    挨拶を更新
     */

    setInterval(
        renderDailyMessage,
        60 * 1000
    );


    console.log(
        `Language Gym initialized. v${APP_VERSION}`
    );
}


/* =========================================================
   START APPLICATION
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();
}