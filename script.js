/* =========================================================
   LANGUAGE GYM
   Core Application
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "languageGymData";
const THEME_KEY = "languageGymTheme";

const defaultData = {
    decks: [],
    records: [],
    settings: {}
};

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
   DATA STORAGE
   ========================================================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                decks: [],
                records: [],
                settings: {}
            };
        }

        const parsed = JSON.parse(saved);

        return {
            decks: Array.isArray(parsed.decks)
                ? parsed.decks.map(normalizeDeck)
                : [],

            records: Array.isArray(parsed.records)
                ? parsed.records
                : [],

            settings: {
                ...defaultData.settings,
                ...(parsed.settings || {})
            }
        };

    } catch (error) {
        console.error("データ読み込みエラー:", error);

        return {
            decks: [],
            records: [],
            settings: {}
        };
    }
}


function normalizeDeck(deck) {
    return {
        ...deck,

        id: deck.id || generateId(),

        name:
            deck.name ||
            "無題のデッキ",

        language:
            deck.language ||
            "unknown",

        type:
            deck.type ||
            "text",

        createdAt:
            deck.createdAt ||
            new Date().toISOString(),

        items:
            Array.isArray(deck.items)
                ? deck.items
                : [],

        stats: {
            answers: 0,
            correct: 0,
            wrong: 0,
            studyTime: 0,
            ...(deck.stats || {})
        }
    };
}


function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );

        updateDataShareStats();

    } catch (error) {
        console.error("データ保存エラー:", error);

        alert(
            "データの保存に失敗しました。"
        );
    }
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
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
        .querySelectorAll(".nav-item")
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


    if (pageName === "study") {
        renderStudyPage();
    }

    if (pageName === "decks") {
        renderDecks();
    }

    if (pageName === "progress") {
        renderProgress();
    }

    if (pageName === "home") {
        renderHomeStats();
    }

    if (pageName === "data-share") {
        updateDataShareStats();
    }
}


/* =========================================================
   PAGE BUTTONS
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
            showPage(pageName);
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
                    showPage("decks");
                }
            );
        });
}


/* =========================================================
   THEME
   ========================================================= */

function createLightColor(hex) {

    if (
        !hex ||
        typeof hex !== "string" ||
        !hex.startsWith("#")
    ) {
        return "#EEEAFE";
    }

    const value =
        hex.replace("#", "");

    if (value.length !== 6) {
        return "#EEEAFE";
    }

    const r = parseInt(
        value.substring(0, 2),
        16
    );

    const g = parseInt(
        value.substring(2, 4),
        16
    );

    const b = parseInt(
        value.substring(4, 6),
        16
    );

    const mix = channel =>
        Math.round(
            channel +
            (255 - channel) * 0.88
        );

    return `rgb(
        ${mix(r)},
        ${mix(g)},
        ${mix(b)}
    )`;
}


function applyTheme(color) {

    if (!color) {
        color = "#8B7CF6";
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
            ".theme-color"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.theme ===
                color
            );
        });

    localStorage.setItem(
        THEME_KEY,
        color
    );
}


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );

    applyTheme(
        savedTheme ||
        "#8B7CF6"
    );
}


function setupThemeButtons() {

    document
        .querySelectorAll(
            ".theme-color"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    applyTheme(
                        button.dataset.theme
                    );

                }
            );
        });
}


/* =========================================================
   DATA SHARING
   ========================================================= */

function setupDataSharing() {

    const exportButton =
        document.getElementById(
            "export-data"
        );

    const importButton =
        document.getElementById(
            "import-data"
        );

    const importInput =
        document.getElementById(
            "data-import-input"
        );


    /*
       JSON保存
    */

    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportDataAsJSON
        );

    }


    /*
       JSON読み込みボタン
    */

    if (importButton && importInput) {

        importButton.addEventListener(
            "click",
            () => {
                importInput.click();
            }
        );

    }


    /*
       ファイル選択
    */

    if (importInput) {

        importInput.addEventListener(
            "change",
            handleDataImport
        );

    }


    /*
       「データを共有する」
       ボタンにも対応
    */

    document
        .querySelectorAll(
            "[data-export-data]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                exportDataAsJSON
            );

        });


    document
        .querySelectorAll(
            "[data-import-data]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (importInput) {
                        importInput.click();
                    }

                }
            );

        });


    updateDataShareStats();
}


/* =========================================================
   DATA EXPORT
   ========================================================= */

function exportDataAsJSON() {

    const exportData = {

        app: "Language Gym",

        version: 1,

        exportedAt:
            new Date().toISOString(),

        decks:
            appData.decks,

        records:
            appData.records,

        settings:
            appData.settings

    };


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
        getLocalDateString();


    link.href = url;

    link.download =
        `Language-Gym-${date}.json`;


    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    setTimeout(() => {
        URL.revokeObjectURL(
            url
        );
    }, 1000);


    alert(
        "Language GymのデータをJSONファイルとして保存しました。\n\nこのファイルを別の端末へ送って、「データを読み込む」から読み込めます。"
    );
}


/* =========================================================
   DATA IMPORT
   ========================================================= */

async function handleDataImport(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    try {

        const text =
            await file.text();

        const imported =
            JSON.parse(text);


        if (
            !imported ||
            !Array.isArray(
                imported.decks
            ) ||
            !Array.isArray(
                imported.records
            )
        ) {

            throw new Error(
                "Language Gym形式ではありません"
            );

        }


        const mode =
            await askImportMode();


        if (!mode) {
            event.target.value = "";
            return;
        }


        if (
            mode === "replace"
        ) {

            importReplace(
                imported
            );

        } else {

            importMerge(
                imported
            );

        }

    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );

        alert(
            "JSONファイルを読み込めませんでした。\n\nLanguage Gymから保存したJSONファイルを選択してください。"
        );

    }


    event.target.value = "";
}


/* =========================================================
   IMPORT MODE
   ========================================================= */

function askImportMode() {

    return new Promise(resolve => {

        const existing =
            document.getElementById(
                "data-import-modal"
            );

        if (existing) {
            existing.remove();
        }


        const modal =
            document.createElement(
                "div"
            );

        modal.id =
            "data-import-modal";


        modal.innerHTML = `

            <div class="pdf-popup-overlay">

                <div class="pdf-popup-card">

                    <div class="pdf-popup-icon">
                        📥
                    </div>

                    <h2>
                        データを読み込み
                    </h2>

                    <p>
                        現在のLanguage Gymデータを
                        どうしますか？
                    </p>

                    <div
                        style="
                            display:flex;
                            flex-direction:column;
                            gap:12px;
                            margin-top:20px;
                        "
                    >

                        <button
                            type="button"
                            class="primary-button"
                            id="import-replace"
                        >
                            🔄 置き換える
                        </button>

                        <button
                            type="button"
                            class="secondary-button"
                            id="import-merge"
                        >
                            ➕ 追加する
                        </button>

                        <button
                            type="button"
                            class="secondary-button"
                            id="import-cancel"
                        >
                            キャンセル
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "import-replace"
            )
            ?.addEventListener(
                "click",
                () => {

                    modal.remove();

                    resolve(
                        "replace"
                    );

                }
            );


        document
            .getElementById(
                "import-merge"
            )
            ?.addEventListener(
                "click",
                () => {

                    modal.remove();

                    resolve(
                        "merge"
                    );

                }
            );


        document
            .getElementById(
                "import-cancel"
            )
            ?.addEventListener(
                "click",
                () => {

                    modal.remove();

                    resolve(
                        null
                    );

                }
            );

    });
}


/* =========================================================
   IMPORT REPLACE
   ========================================================= */

function importReplace(imported) {

    const oldDeckCount =
        appData.decks.length;

    const oldRecordCount =
        appData.records.length;


    stopStudyTimer();


    appData = {

        decks:
            imported.decks
                .map(normalizeDeck),

        records:
            imported.records
                .map(normalizeRecord),

        settings: {
            ...defaultData.settings,
            ...(imported.settings || {})
        }

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


    saveData();

    renderAll();

    updateDataShareStats();


    alert(
        `データを置き換えました。\n\nデッキ：${oldDeckCount} → ${appData.decks.length}\n学習記録：${oldRecordCount} → ${appData.records.length}`
    );


    showPage(
        "data-share"
    );
}


/* =========================================================
   IMPORT MERGE
   ========================================================= */

function importMerge(imported) {

    let addedDecks = 0;
    let addedRecords = 0;


    /*
       デッキ追加
    */

    imported.decks.forEach(
        importedDeck => {

            const normalized =
                normalizeDeck(
                    importedDeck
                );


            let newId =
                normalized.id;


            /*
               IDが既存と重複したら
               新しいIDを作る
            */

            if (
                appData.decks.some(
                    deck =>
                        deck.id ===
                        newId
                )
            ) {

                newId =
                    generateId();

                normalized.id =
                    newId;
            }


            /*
               教材IDも重複を避ける
            */

            normalized.items =
                normalized.items.map(
                    item => {

                        const newItem = {
                            ...item
                        };

                        newItem.id =
                            generateId();

                        return newItem;

                    }
                );


            appData.decks.push(
                normalized
            );


            /*
               対応する記録を追加
            */

            imported.records
                .filter(
                    record =>
                        record.deckId ===
                        importedDeck.id
                )
                .forEach(
                    record => {

                        const newRecord =
                            normalizeRecord(
                                record
                            );

                        newRecord.id =
                            generateId();

                        newRecord.deckId =
                            newId;

                        newRecord.deckName =
                            normalized.name;

                        appData.records.push(
                            newRecord
                        );

                        addedRecords++;

                    }
                );


            addedDecks++;

        }
    );


    /*
       settingsは基本的に
       現在の設定を維持
    */


    saveData();

    renderAll();

    updateDataShareStats();


    alert(
        `データを追加しました。\n\n追加したデッキ：${addedDecks}\n追加した学習記録：${addedRecords}`
    );


    showPage(
        "data-share"
    );
}


/* =========================================================
   NORMALIZE RECORD
   ========================================================= */

function normalizeRecord(record) {

    return {

        id:
            record.id ||
            generateId(),

        date:
            record.date ||
            getLocalDateString(),

        deckId:
            record.deckId ||
            null,

        deckName:
            record.deckName ||
            "無題のデッキ",

        answers:
            Number(
                record.answers
            ) || 0,

        correct:
            Number(
                record.correct
            ) || 0,

        wrong:
            Number(
                record.wrong
            ) || 0,

        studyTime:
            Number(
                record.studyTime
            ) || 0

    };
}


/* =========================================================
   DATA SHARE STATS
   ========================================================= */

function updateDataShareStats() {

    setText(
        "data-deck-count",
        appData.decks.length
    );

    setText(
        "data-record-count",
        appData.records.length
    );

    /*
       別名にも対応
    */

    setText(
        "share-deck-count",
        appData.decks.length
    );

    setText(
        "share-record-count",
        appData.records.length
    );
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

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }


            const selectedFile =
                document.getElementById(
                    "selected-file"
                );


            if (selectedFile) {

                selectedFile.textContent =
                    `選択中: ${file.name}`;

            }


            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            try {

                if (
                    extension ===
                    "txt"
                ) {

                    await importTXT(
                        file
                    );

                }

                else if (
                    extension ===
                    "csv"
                ) {

                    await importCSV(
                        file
                    );

                }

                else if (
                    extension ===
                    "pdf"
                ) {

                    showPDFComingSoonPopup();

                }

                else {

                    alert(
                        "対応していないファイル形式です。\n\n現在対応：TXT / CSV\nPDF：次の開発で実装予定"
                    );

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

        }
    );
}


/* =========================================================
   PDF COMING SOON POPUP
   ========================================================= */

function showPDFComingSoonPopup() {

    const existingPopup =
        document.getElementById(
            "pdf-coming-soon-popup"
        );


    if (existingPopup) {
        existingPopup.remove();
    }


    const popup =
        document.createElement(
            "div"
        );


    popup.id =
        "pdf-coming-soon-popup";


    popup.innerHTML = `

        <div class="pdf-popup-overlay">

            <div class="pdf-popup-card">

                <div class="pdf-popup-icon">
                    📄
                </div>

                <h2>
                    PDFインポート
                </h2>

                <p>
                    PDF教材のインポート機能は
                    <strong>
                        次の開発で実装予定
                    </strong>
                    です。
                </p>

                <p class="pdf-popup-subtext">
                    現在は TXT / CSV ファイルを
                    インポートできます。
                </p>

                <button
                    type="button"
                    class="primary-button"
                    id="close-pdf-popup"
                >
                    わかりました
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        popup
    );


    document
        .getElementById(
            "close-pdf-popup"
        )
        ?.addEventListener(
            "click",
            () => {
                popup.remove();
            }
        );


    popup
        .querySelector(
            ".pdf-popup-overlay"
        )
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.classList.contains(
                        "pdf-popup-overlay"
                    )
                ) {
                    popup.remove();
                }

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
        return "unknown";
    }

    return (
        select.value ||
        "unknown"
    );
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
            "TXTファイルに教材がありません。"
        );

        return;
    }


    const selectedLanguage =
        getImportLanguage();


    const deck = {

        id:
            generateId(),

        name:
            removeExtension(
                file.name
            ),

        language:
            selectedLanguage,

        type:
            "text",

        createdAt:
            new Date().toISOString(),

        items:
            lines.map(
                (line, index) => ({

                    id:
                        generateId(),

                    index:
                        index,

                    text:
                        line

                })
            ),

        stats: {

            answers: 0,

            correct: 0,

            wrong: 0,

            studyTime: 0

        }

    };


    appData.decks.push(
        deck
    );


    saveData();

    renderAll();

    showPage(
        "decks"
    );


    alert(
        `${deck.name} を追加しました。\n${deck.items.length}件の教材を読み込みました。`
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
            "CSVにデータがありません。"
        );

        return;
    }


    const selectedLanguage =
        getImportLanguage();


    const deck = {

        id:
            generateId(),

        name:
            removeExtension(
                file.name
            ),

        language:
            selectedLanguage,

        type:
            "csv",

        createdAt:
            new Date().toISOString(),

        items:
            rows.map(
                (row, index) => ({

                    id:
                        generateId(),

                    index:
                        index,

                    data:
                        row

                })
            ),

        stats: {

            answers: 0,

            correct: 0,

            wrong: 0,

            studyTime: 0

        }

    };


    appData.decks.push(
        deck
    );


    saveData();

    renderAll();

    showPage(
        "decks"
    );


    alert(
        `${deck.name} を追加しました。\n${deck.items.length}行を読み込みました。`
    );
}


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(text) {

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


        if (char === '"') {

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


            if (
                row.some(
                    value =>
                        value.trim() !== ""
                )
            ) {

                rows.push(row);

            }


            row = [];

            cell = "";

            continue;
        }


        cell += char;
    }


    row.push(cell);


    if (
        row.some(
            value =>
                value.trim() !== ""
        )
    ) {

        rows.push(row);

    }


    return rows;
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
                    教材を追加して、
                    最初のデッキを作りましょう。
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
            .map(deck => {

                const total =
                    deck.items?.length ||
                    0;

                const answers =
                    Number(
                        deck.stats?.answers
                    ) || 0;

                const correct =
                    Number(
                        deck.stats?.correct
                    ) || 0;

                const accuracy =
                    answers
                        ? Math.round(
                            correct /
                            answers *
                            100
                        )
                        : 0;


                return `

                    <div class="deck-card">

                        <h3>
                            ${escapeHTML(
                                deck.name
                            )}
                        </h3>

                        <p>
                            ${total} 件
                        </p>

                        <p>
                            言語:
                            ${getLanguageName(
                                deck.language
                            )}
                        </p>

                        <p>
                            回答数:
                            ${answers}
                            ／
                            正答率:
                            ${accuracy}%
                        </p>

                        <div class="deck-actions">

                            <button
                                class="primary-button"
                                data-start-deck="${deck.id}"
                                type="button"
                            >
                                学習開始
                            </button>

                            <button
                                class="secondary-button"
                                data-edit-deck="${deck.id}"
                                type="button"
                            >
                                ✏️ 編集
                            </button>

                            <button
                                class="secondary-button"
                                data-delete-deck="${deck.id}"
                                type="button"
                            >
                                🗑️ 削除
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");
}


/* =========================================================
   DECK BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const startButton =
            event.target.closest(
                "[data-start-deck]"
            );


        if (startButton) {

            prepareStudy(
                startButton.dataset.startDeck
            );

            return;
        }


        const editButton =
            event.target.closest(
                "[data-edit-deck]"
            );


        if (editButton) {

            editDeck(
                editButton.dataset.editDeck
            );

            return;
        }


        const deleteButton =
            event.target.closest(
                "[data-delete-deck]"
            );


        if (deleteButton) {

            deleteDeck(
                deleteButton.dataset.deleteDeck
            );

            return;
        }

    }
);


/* =========================================================
   EDIT DECK
   ========================================================= */

function editDeck(deckId) {

    const deck =
        appData.decks.find(
            d =>
                d.id === deckId
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
            deck.name
        );


    if (newName === null) {
        return;
    }


    const trimmedName =
        newName.trim();


    if (!trimmedName) {

        alert(
            "デッキ名を空にすることはできません。"
        );

        return;
    }


    const oldName =
        deck.name;


    deck.name =
        trimmedName;


    appData.records
        .filter(
            record =>
                record.deckId ===
                deck.id
        )
        .forEach(record => {

            record.deckName =
                trimmedName;

        });


    saveData();

    renderAll();


    if (
        studyState.deckId ===
        deck.id &&
        !studyState.active
    ) {

        renderStudyStart(
            deck
        );

    }


    alert(
        `デッキ名を「${oldName}」から「${trimmedName}」に変更しました。`
    );
}


/* =========================================================
   DELETE DECK
   ========================================================= */

function deleteDeck(deckId) {

    const deck =
        appData.decks.find(
            d =>
                d.id === deckId
        );


    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return;
    }


    const confirmed =
        confirm(
            `「${deck.name}」を削除しますか？\n\nこのデッキの教材と学習記録もすべて削除されます。\nこの操作は元に戻せません。`
        );


    if (!confirmed) {
        return;
    }


    if (
        studyState.deckId ===
        deckId
    ) {

        studyState.active =
            false;

        stopStudyTimer();

        studyState.deckId =
            null;
    }


    appData.decks =
        appData.decks.filter(
            d =>
                d.id !== deckId
        );


    appData.records =
        appData.records.filter(
            record =>
                record.deckId !==
                deckId
        );


    saveData();

    renderAll();

    showPage(
        "decks"
    );


    alert(
        `「${deck.name}」を削除しました。`
    );
}


/* =========================================================
   PREPARE STUDY
   ========================================================= */

function prepareStudy(deckId) {

    const deck =
        appData.decks.find(
            d =>
                d.id === deckId
        );


    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return;
    }


    if (!deck.items.length) {

        alert(
            "このデッキには教材がありません。"
        );

        return;
    }


    stopStudyTimer();


    studyState = {

        active: false,

        deckId: deckId,

        currentIndex: 0,

        sessionAnswers: 0,

        sessionCorrect: 0,

        sessionWrong: 0,

        startedAt: null,

        timerInterval: null,

        elapsedSeconds: 0,

        answerShown: false

    };


    showPage(
        "study"
    );


    renderStudyStart(
        deck
    );
}


/* =========================================================
   STUDY START SCREEN
   ========================================================= */

function renderStudyStart(deck) {

    const container =
        document.getElementById(
            "study-content"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="import-card">

            <h2>
                ${escapeHTML(
                    deck.name
                )}
            </h2>

            <p>
                ${deck.items.length}件の教材があります。
            </p>

            <p>
                言語:
                ${getLanguageName(
                    deck.language
                )}
            </p>

            <br>

            <button
                class="primary-button"
                id="real-start-study"
                type="button"
            >
                学習を開始する
            </button>

            <div class="deck-actions">

                <button
                    class="secondary-button"
                    data-edit-deck="${deck.id}"
                    type="button"
                >
                    ✏️ 編集
                </button>

                <button
                    class="secondary-button"
                    data-delete-deck="${deck.id}"
                    type="button"
                >
                    🗑️ 削除
                </button>

            </div>

            <button
                class="secondary-button"
                id="back-to-decks"
                type="button"
            >
                デッキに戻る
            </button>

        </div>

    `;


    document
        .getElementById(
            "real-start-study"
        )
        ?.addEventListener(
            "click",
            () => {

                startStudy(
                    deck
                );

            }
        );


    document
        .getElementById(
            "back-to-decks"
        )
        ?.addEventListener(
            "click",
            () => {

                showPage(
                    "decks"
                );

            }
        );
}


/* =========================================================
   START STUDY
   ========================================================= */

function startStudy(deck) {

    stopStudyTimer();


    studyState.active =
        true;

    studyState.currentIndex =
        0;

    studyState.sessionAnswers =
        0;

    studyState.sessionCorrect =
        0;

    studyState.sessionWrong =
        0;

    studyState.startedAt =
        Date.now();

    studyState.elapsedSeconds =
        0;

    studyState.answerShown =
        false;


    startStudyTimer();

    renderCurrentQuestion();
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


                studyState.elapsedSeconds++;


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

    const timer =
        document.getElementById(
            "study-timer"
        );


    if (timer) {

        timer.textContent =
            formatStudyTimeWithSeconds(
                studyState.elapsedSeconds
            );

    }
}


/* =========================================================
   CURRENT QUESTION
   ========================================================= */

function renderCurrentQuestion() {

    const deck =
        getCurrentDeck();


    if (!deck) {

        finishStudy();

        return;
    }


    const item =
        deck.items[
            studyState.currentIndex
        ];


    if (!item) {

        finishStudy();

        return;
    }


    studyState.answerShown =
        false;


    const container =
        document.getElementById(
            "study-content"
        );


    if (!container) {
        return;
    }


    const progress =
        studyState.currentIndex + 1;


    const total =
        deck.items.length;


    const progressPercent =
        total
            ? Math.round(
                progress /
                total *
                100
            )
            : 0;


    container.innerHTML = `

        <div class="study-header">

            <div>

                <p class="eyebrow">
                    ${escapeHTML(
                        deck.name
                    )}
                </p>

                <h2>
                    トレーニング
                </h2>

            </div>

            <div
                class="study-timer"
                id="study-timer"
            >
                ${formatStudyTimeWithSeconds(
                    studyState.elapsedSeconds
                )}
            </div>

        </div>


        <div class="study-progress">

            <div>
                ${progress} / ${total}
            </div>

            <div class="study-progress-bar">

                <div
                    style="width:${progressPercent}%"
                ></div>

            </div>

        </div>


        <div class="study-card">

            <div class="study-card-label">
                問題
            </div>

            <div class="study-question">

                ${renderItem(
                    item,
                    deck.type
                )}

            </div>


            <div id="answer-area">

                <button
                    class="primary-button"
                    id="show-answer"
                    type="button"
                >
                    答えを見る
                </button>

            </div>

        </div>


        <button
            class="secondary-button"
            id="finish-study"
            type="button"
        >
            学習を終了
        </button>

    `;


    document
        .getElementById(
            "show-answer"
        )
        ?.addEventListener(
            "click",
            showAnswer
        );


    document
        .getElementById(
            "finish-study"
        )
        ?.addEventListener(
            "click",
            () => {

                if (
                    confirm(
                        "学習を終了しますか？"
                    )
                ) {

                    finishStudy();

                }

            }
        );
}


/* =========================================================
   ITEM RENDERING
   ========================================================= */

function renderItem(
    item,
    type
) {

    if (type === "csv") {

        const data =
            Array.isArray(
                item.data
            )
                ? item.data
                : [];


        return `

            <div class="csv-study-item">

                ${data
                    .map(
                        value =>
                            `

                            <div>
                                ${escapeHTML(
                                    value
                                )}
                            </div>

                            `
                    )
                    .join("")}

            </div>

        `;
    }


    return `

        <div class="text-study-item">

            ${escapeHTML(
                item.text ||
                ""
            )}

        </div>

    `;
}


/* =========================================================
   SHOW ANSWER
   ========================================================= */

function showAnswer() {

    if (
        studyState.answerShown
    ) {
        return;
    }


    studyState.answerShown =
        true;


    const deck =
        getCurrentDeck();


    if (!deck) {
        return;
    }


    const item =
        deck.items[
            studyState.currentIndex
        ];


    if (!item) {
        return;
    }


    const answerArea =
        document.getElementById(
            "answer-area"
        );


    if (!answerArea) {
        return;
    }


    let answerHTML = "";


    if (
        deck.type === "csv"
    ) {

        const data =
            Array.isArray(
                item.data
            )
                ? item.data
                : [];


        answerHTML = `

            <div class="study-answer">

                <div class="study-card-label">
                    内容
                </div>

                ${data
                    .map(
                        value =>
                            `

                            <div>
                                ${escapeHTML(
                                    value
                                )}
                            </div>

                            `
                    )
                    .join("")}

            </div>

        `;

    } else {

        answerHTML = `

            <div class="study-answer">

                ${escapeHTML(
                    item.text ||
                    ""
                )}

            </div>

        `;

    }


    answerArea.innerHTML = `

        ${answerHTML}

        <p class="study-feedback-title">
            この問題はどうでしたか？
        </p>

        <div class="answer-buttons">

            <button
                class="wrong-button"
                id="wrong-answer"
                type="button"
            >
                もう一度
            </button>

            <button
                class="correct-button"
                id="correct-answer"
                type="button"
            >
                正解
            </button>

        </div>

    `;


    document
        .getElementById(
            "wrong-answer"
        )
        ?.addEventListener(
            "click",
            () =>
                registerAnswer(
                    false
                )
        );


    document
        .getElementById(
            "correct-answer"
        )
        ?.addEventListener(
            "click",
            () =>
                registerAnswer(
                    true
                )
        );
}


/* =========================================================
   REGISTER ANSWER
   ========================================================= */

function registerAnswer(
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


    studyState.sessionAnswers++;


    if (isCorrect) {

        studyState.sessionCorrect++;

    } else {

        studyState.sessionWrong++;

    }


    moveToNextQuestion();
}


/* =========================================================
   NEXT QUESTION
   ========================================================= */

function moveToNextQuestion() {

    studyState.currentIndex++;


    const deck =
        getCurrentDeck();


    if (
        !deck ||
        studyState.currentIndex >=
        deck.items.length
    ) {

        finishStudy();

        return;
    }


    renderCurrentQuestion();
}


/* =========================================================
   GET CURRENT DECK
   ========================================================= */

function getCurrentDeck() {

    return appData.decks.find(
        deck =>
            deck.id ===
            studyState.deckId
    );
}


/* =========================================================
   FINISH STUDY
   ========================================================= */

function finishStudy() {

    if (
        !studyState.active
    ) {

        showPage(
            "decks"
        );

        return;
    }


    studyState.active =
        false;


    stopStudyTimer();


    const deck =
        getCurrentDeck();


    if (!deck) {
        return;
    }


    const time =
        Number(
            studyState.elapsedSeconds
        ) || 0;


    if (!deck.stats) {

        deck.stats = {

            answers: 0,

            correct: 0,

            wrong: 0,

            studyTime: 0

        };

    }


    deck.stats.answers +=
        studyState.sessionAnswers;


    deck.stats.correct +=
        studyState.sessionCorrect;


    deck.stats.wrong +=
        studyState.sessionWrong;


    deck.stats.studyTime +=
        time;


    const date =
        getLocalDateString();


    let record =
        appData.records.find(
            r =>
                r.date === date &&
                r.deckId === deck.id
        );


    if (!record) {

        record = {

            id:
                generateId(),

            date:
                date,

            deckId:
                deck.id,

            deckName:
                deck.name,

            answers: 0,

            correct: 0,

            wrong: 0,

            studyTime: 0

        };


        appData.records.push(
            record
        );

    }


    record.deckName =
        deck.name;


    record.answers +=
        studyState.sessionAnswers;


    record.correct +=
        studyState.sessionCorrect;


    record.wrong +=
        studyState.sessionWrong;


    record.studyTime +=
        time;


    saveData();

    renderAll();


    renderStudyResult(
        deck,
        time
    );
}


/* =========================================================
   STUDY RESULT
   ========================================================= */

function renderStudyResult(
    deck,
    time
) {

    const container =
        document.getElementById(
            "study-content"
        );


    if (!container) {
        return;
    }


    const accuracy =
        studyState.sessionAnswers
            ? Math.round(
                studyState.sessionCorrect /
                studyState.sessionAnswers *
                100
            )
            : 0;


    container.innerHTML = `

        <div class="import-card">

            <h2>
                トレーニング完了
            </h2>

            <p>
                ${escapeHTML(
                    deck.name
                )}
            </p>


            <div class="progress-overview">

                <div class="progress-card">

                    <span>
                        回答数
                    </span>

                    <strong>
                        ${studyState.sessionAnswers}
                    </strong>

                </div>


                <div class="progress-card">

                    <span>
                        正答率
                    </span>

                    <strong>
                        ${accuracy}%
                    </strong>

                </div>


                <div class="progress-card">

                    <span>
                        不正解
                    </span>

                    <strong>
                        ${studyState.sessionWrong}
                    </strong>

                </div>


                <div class="progress-card">

                    <span>
                        学習時間
                    </span>

                    <strong>
                        ${formatStudyTime(
                            time
                        )}
                    </strong>

                </div>

            </div>


            <br>


            <button
                class="primary-button"
                id="study-again"
                type="button"
            >
                もう一度学習する
            </button>


            <button
                class="secondary-button"
                id="result-decks"
                type="button"
            >
                デッキに戻る
            </button>


            <button
                class="secondary-button"
                id="result-progress"
                type="button"
            >
                学習記録を見る
            </button>

        </div>

    `;


    document
        .getElementById(
            "study-again"
        )
        ?.addEventListener(
            "click",
            () => {

                prepareStudy(
                    deck.id
                );

            }
        );


    document
        .getElementById(
            "result-decks"
        )
        ?.addEventListener(
            "click",
            () => {

                showPage(
                    "decks"
                );

            }
        );


    document
        .getElementById(
            "result-progress"
        )
        ?.addEventListener(
            "click",
            () => {

                showPage(
                    "progress"
                );

            }
        );
}


/* =========================================================
   STUDY PAGE
   ========================================================= */

function renderStudyPage() {

    if (
        studyState.active
    ) {

        renderCurrentQuestion();

        return;
    }


    const container =
        document.getElementById(
            "study-content"
        );


    if (!container) {
        return;
    }


    if (
        !appData.decks.length
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    デッキがありません
                </h3>

                <p>
                    まず教材を追加してください。
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


    container.innerHTML = `

        <div class="section-header">

            <div>

                <h2>
                    学習するデッキを選択
                </h2>

                <p>
                    デッキを選ぶと学習開始画面が表示されます。
                </p>

            </div>

        </div>


        <div class="deck-list">

            ${appData.decks
                .map(
                    deck =>
                        `

                        <div class="deck-card">

                            <h3>
                                ${escapeHTML(
                                    deck.name
                                )}
                            </h3>

                            <p>
                                ${deck.items.length} 件
                            </p>

                            <p>
                                ${getLanguageName(
                                    deck.language
                                )}
                            </p>

                            <div class="deck-actions">

                                <button
                                    class="primary-button"
                                    data-start-deck="${deck.id}"
                                    type="button"
                                >
                                    学習開始
                                </button>

                                <button
                                    class="secondary-button"
                                    data-edit-deck="${deck.id}"
                                    type="button"
                                >
                                    ✏️ 編集
                                </button>

                                <button
                                    class="secondary-button"
                                    data-delete-deck="${deck.id}"
                                    type="button"
                                >
                                    🗑️ 削除
                                </button>

                            </div>

                        </div>

                        `
                )
                .join("")}

        </div>

    `;
}


/* =========================================================
   PROGRESS CALCULATION
   ========================================================= */

function calculateProgress() {

    let totalAnswers = 0;

    let totalCorrect = 0;

    let totalWrong = 0;

    let totalTime = 0;


    appData.decks.forEach(
        deck => {

            const stats =
                deck.stats || {};


            totalAnswers +=
                Number(
                    stats.answers
                ) || 0;


            totalCorrect +=
                Number(
                    stats.correct
                ) || 0;


            totalWrong +=
                Number(
                    stats.wrong
                ) || 0;


            totalTime +=
                Number(
                    stats.studyTime
                ) || 0;

        }
    );


    return {

        totalAnswers,

        totalCorrect,

        totalWrong,

        totalTime,

        accuracy:
            totalAnswers
                ? Math.round(
                    totalCorrect /
                    totalAnswers *
                    100
                )
                : 0

    };
}


/* =========================================================
   PROGRESS RENDER
   ========================================================= */

function renderProgress() {

    const progress =
        calculateProgress();


    setText(
        "total-time",
        formatStudyTime(
            progress.totalTime
        )
    );


    setText(
        "total-answers",
        progress.totalAnswers
    );


    setText(
        "total-accuracy",
        `${progress.accuracy}%`
    );


    setText(
        "total-wrong",
        progress.totalWrong
    );


    renderDeckProgress();
}


/* =========================================================
   DECK PROGRESS
   ========================================================= */

function renderDeckProgress() {

    const container =
        document.getElementById(
            "deck-progress"
        );


    if (!container) {
        return;
    }


    if (
        !appData.decks.length
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    まだ記録がありません
                </h3>

                <p>
                    学習を始めると、
                    ここに記録が表示されます。
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        appData.decks
            .map(deck => {

                const stats =
                    deck.stats || {};


                const answers =
                    Number(
                        stats.answers
                    ) || 0;


                const correct =
                    Number(
                        stats.correct
                    ) || 0;


                const wrong =
                    Number(
                        stats.wrong
                    ) || 0;


                const accuracy =
                    answers
                        ? Math.round(
                            correct /
                            answers *
                            100
                        )
                        : 0;


                return `

                    <div class="deck-card">

                        <h3>
                            ${escapeHTML(
                                deck.name
                            )}
                        </h3>

                        <p>
                            言語:
                            ${getLanguageName(
                                deck.language
                            )}
                        </p>

                        <p>
                            回答数:
                            ${answers}
                        </p>

                        <p>
                            正答率:
                            ${accuracy}%
                        </p>

                        <p>
                            不正解:
                            ${wrong}
                        </p>

                        <p>
                            学習時間:
                            ${formatStudyTime(
                                stats.studyTime ||
                                0
                            )}
                        </p>

                    </div>

                `;

            })
            .join("");
}


/* =========================================================
   HOME STATS
   ========================================================= */

function renderHomeStats() {

    const today =
        getLocalDateString();


    let answers = 0;

    let correct = 0;

    let time = 0;


    appData.records
        .filter(
            record =>
                record.date ===
                today
        )
        .forEach(record => {

            answers +=
                Number(
                    record.answers
                ) || 0;


            correct +=
                Number(
                    record.correct
                ) || 0;


            time +=
                Number(
                    record.studyTime
                ) || 0;

        });


    const accuracy =
        answers
            ? Math.round(
                correct /
                answers *
                100
            )
            : 0;


    setText(
        "today-time",
        formatStudyTime(
            time
        )
    );


    setText(
        "today-answers",
        answers
    );


    setText(
        "today-accuracy",
        `${accuracy}%`
    );


    setText(
        "deck-count",
        appData.decks.length
    );
}


/* =========================================================
   LANGUAGE NAMES
   ========================================================= */

function getLanguageName(
    language
) {

    const languages = {

        zh: "中文",

        en: "English",

        de: "Deutsch",

        es: "Español",

        it: "Italiano",

        fr: "Français",

        ko: "한국어",

        ja: "日本語",

        pt: "Português",

        ru: "Русский",

        other: "Other",

        unknown: "未設定"

    };


    return (
        languages[language] ||
        "未設定"
    );
}


/* =========================================================
   UTILITIES
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }
}


/* =========================================================
   FORMAT STUDY TIME
   ========================================================= */

function formatStudyTime(
    seconds
) {

    seconds =
        Number(seconds) || 0;


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) /
            60
        );


    if (hours > 0) {

        return `${hours}時間${minutes}分`;

    }


    return `${minutes}分`;
}


/* =========================================================
   FORMAT STUDY TIME WITH SECONDS
   ========================================================= */

function formatStudyTimeWithSeconds(
    seconds
) {

    seconds =
        Number(seconds) || 0;


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    return (
        `${String(
            minutes
        ).padStart(2, "0")}:` +

        `${String(
            remaining
        ).padStart(2, "0")}`
    );
}


/* =========================================================
   LOCAL DATE
   ========================================================= */

function getLocalDateString() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


/* =========================================================
   ID
   ========================================================= */

function generateId() {

    return (
        Date.now().toString(36) +

        Math.random()
            .toString(36)
            .substring(
                2,
                10
            )
    );
}


/* =========================================================
   REMOVE EXTENSION
   ========================================================= */

function removeExtension(
    filename
) {

    return filename.replace(
        /\.[^/.]+$/,
        ""
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

    renderDecks();

    renderProgress();

    renderHomeStats();

    updateDataShareStats();


    if (
        document
            .getElementById(
                "page-study"
            )
            ?.classList.contains(
                "active-page"
            )
    ) {

        renderStudyPage();

    }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

let appInitialized =
    false;


function initializeApp() {

    if (appInitialized) {
        return;
    }


    appInitialized =
        true;


    loadTheme();

    setupThemeButtons();

    setupFileImport();

    setupDataSharing();

    setupTrainingCards();

    renderAll();


    console.log(
        "Language Gym initialized!"
    );

    console.log(
        "Data sharing system ready!"
    );
}


/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp,
        {
            once: true
        }
    );

} else {

    initializeApp();

}