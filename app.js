/* =========================================================
   LANGUAGE GYM
   Complete Application
   APP VERSION 9
   ========================================================= */

"use strict";


/* =========================================================
   CONSTANTS
   ========================================================= */

const STORAGE_KEY = "languageGymData";
const THEME_KEY = "languageGymTheme";
const BACKUP_KEY = "languageGymBackup";

const APP_VERSION = 9;

const PRESET_COLORS = [
    "#F7B2C4",
    "#8ED8F8",
    "#9AD88B",
    "#F6A85F",
    "#F5D77A",
    "#8B7CF6",
    "#F28B82",
    "#7DD3C7",
    "#4F6FAE",
    "#A8D64F",
    "#A98274",
    "#9B4D6A"
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
    customColor: DEFAULT_THEME_COLOR,
    randomStudy: true
}
};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let appData = loadData();

let studyState = createEmptyStudyState();

const navigationState = {

    currentPage: "home",

    history: ["home"],

    historyIndex: 0
};


/* =========================================================
   BASIC UTILITIES
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


function formatSeconds(seconds) {

    const total =
        Math.max(
            0,
            Math.floor(
                Number(seconds) || 0
            )
        );

    const hours =
        Math.floor(total / 3600);

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


/* =========================================================
   DATA LOAD / SAVE
   ========================================================= */

function loadData() {

    try {

        let saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        /*
         * 過去バージョンのキーにも対応
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

        return normalizeImportedData(
            JSON.parse(saved)
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
   NORMALIZE DATA
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

        ...data
    };


    normalized.decks =
        Array.isArray(data.decks)
            ? data.decks.map(
                normalizeDeck
            )
            : [];


    normalized.records =
        Array.isArray(data.records)
            ? data.records.map(
                normalizeRecord
            )
            : [];


    normalized.deletedItems =
        Array.isArray(
            data.deletedItems
        )
            ? data.deletedItems
            : [];


    normalized.plans =
        Array.isArray(data.plans)
            ? data.plans
            : [];


    normalized.messages =
        data.messages &&
        typeof data.messages === "object"
            ? data.messages
            : {};


    normalized.settings = {

        ...defaultData.settings,

        ...(data.settings || {})
    };


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


function normalizeDeck(deck) {

    const items =
        Array.isArray(deck?.items)
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
            "csv",

        items,

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


function normalizeItem(
    item,
    index = 0
) {

    return {

        ...(item || {}),

        id:
            item?.id ||
            generateId(),

        front:
            item?.front !== undefined
                ? String(item.front)
                : "",

        back:
            item?.back !== undefined
                ? String(item.back)
                : "",

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
            Boolean(item?.deleted)
    };
}


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
            Number(record?.answers) || 0,

        correct:
            Number(record?.correct) || 0,

        wrong:
            Number(record?.wrong) || 0,

        accuracy:
            Number(record?.accuracy) || 0,

        studyTime:
            Number(record?.studyTime) || 0
    };
}


function reindexDeckItems(deck) {

    if (
        !deck ||
        !Array.isArray(deck.items)
    ) {
        return;
    }

    deck.items.forEach(
        (item, index) => {

            item.index = index;
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

    const mix = c =>
        Math.round(
            c +
            (255 - c) * 0.88
        );

    return (
        `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
    );
}


function applyTheme(color) {

    if (
        !isValidHexColor(color)
    ) {

        color =
            DEFAULT_THEME_COLOR;
    }

    document.documentElement.style
        .setProperty(
            "--primary",
            color
        );

    document.documentElement.style
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


    if (appData?.settings) {

        appData.settings.customColor =
            color;
    }


    localStorage.setItem(
        THEME_KEY,
        color
    );

    updateColorUI(color);
}


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );

    const storedColor =
        appData.settings?.customColor;

    const color =
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

    applyTheme(color);
}


function updateColorUI(color) {

    const custom =
        document.getElementById(
            "custom-color"
        );

    const value =
        document.getElementById(
            "custom-color-value"
        );

    if (custom) {

        custom.value = color;
    }

    if (value) {

        value.textContent =
            color.toUpperCase();
    }


    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(button => {

            const buttonColor =
                String(
                    button.dataset.color ||
                    ""
                ).toUpperCase();

            button.classList.toggle(
                "selected",
                buttonColor ===
                color.toUpperCase()
            );
        });
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(
    pageName,
    options = {}
) {

    const {

        pushHistory = true,

        browserHistory = true,

        scroll = true

    } = options;


    if (!pageName) {
        return;
    }


    const targetPage =
        document.getElementById(
            `page-${pageName}`
        );


    if (!targetPage) {

        console.warn(
            `ページが見つかりません: page-${pageName}`
        );

        return;
    }


    const previousPage =
        navigationState.currentPage;


    /*
     * 学習中に別ページへ移動
     */

    if (
        previousPage === "study" &&
        pageName !== "study" &&
        studyState.active
    ) {

        const confirmed =
            confirm(
                "現在、学習中です。\n\n" +
                "このページを離れると、今回の学習セッションを終了します。\n\n" +
                "移動しますか？"
            );

        if (!confirmed) {
            return;
        }

        finishStudy({

            silent: true,

            redirect: false
        });
    }


    document
        .querySelectorAll(
            ".page"
        )
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );
        });


    targetPage.classList.add(
        "active-page"
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page ===
                pageName
            );
        });


    navigationState.currentPage =
        pageName;


    if (pushHistory) {

        addNavigationHistory(
            pageName
        );
    }


    if (browserHistory) {

        try {

            history.pushState(

                {
                    languageGym: true,

                    page: pageName
                },

                "",

                `#${encodeURIComponent(
                    pageName
                )}`
            );

        } catch (error) {

            console.warn(error);
        }
    }


    if (scroll) {

        window.scrollTo({

            top: 0,

            behavior: "smooth"
        });
    }


    renderPageContent(
        pageName
    );


    closeMobileMenu();

    updateNavigationButtons();
}


function addNavigationHistory(
    pageName
) {

    if (
        navigationState.history[
            navigationState.historyIndex
        ] === pageName
    ) {

        return;
    }


    if (
        navigationState.historyIndex <
        navigationState.history.length - 1
    ) {

        navigationState.history =
            navigationState.history.slice(
                0,
                navigationState.historyIndex + 1
            );
    }


    navigationState.history.push(
        pageName
    );


    navigationState.historyIndex =
        navigationState.history.length - 1;
}


function goBack() {

    if (
        studyState.active &&
        navigationState.currentPage ===
        "study"
    ) {

        const confirmed =
            confirm(
                "学習を中断しますか？\n\n" +
                "今回の学習結果は保存されません。"
            );

        if (!confirmed) {
            return;
        }

        stopStudyTimer();

        studyState =
            createEmptyStudyState();
    }


    if (
        navigationState.historyIndex > 0
    ) {

        navigationState.historyIndex--;

        const previous =
            navigationState.history[
                navigationState.historyIndex
            ];

        showPage(

            previous,

            {
                pushHistory: false,

                browserHistory: false
            }
        );

        return;
    }


    if (
        navigationState.currentPage !==
        "home"
    ) {

        showPage(

            "home",

            {
                pushHistory: false,

                browserHistory: false
            }
        );
    }


    updateNavigationButtons();
}


function goForward() {

    if (
        navigationState.historyIndex <
        navigationState.history.length - 1
    ) {

        navigationState.historyIndex++;

        const next =
            navigationState.history[
                navigationState.historyIndex
            ];

        showPage(

            next,

            {
                pushHistory: false,

                browserHistory: false
            }
        );
    }

    updateNavigationButtons();
}


function updateNavigationButtons() {

    const backButtons =
        document.querySelectorAll(
            ".btn-back, [data-action='back']"
        );

    const forwardButtons =
        document.querySelectorAll(
            ".btn-forward, [data-action='forward']"
        );


    backButtons.forEach(button => {

        button.disabled =
            navigationState.historyIndex <= 0 &&
            navigationState.currentPage ===
            "home";
    });


    forwardButtons.forEach(button => {

        button.disabled =
            navigationState.historyIndex >=
            navigationState.history.length - 1;
    });
}


function closeMobileMenu() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );
    }
}


/* =========================================================
   STUDY STATE
   ========================================================= */



   /* =========================================================
   CARD SHUFFLE
   ========================================================= */

function shuffleCards(cards) {

    const shuffled = [...cards];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}




function createEmptyStudyState() {

    return {

        active: false,

        deckId: null,

        cards: [],

        currentIndex: 0,

        sessionAnswers: 0,

        sessionCorrect: 0,

        sessionWrong: 0,

        startedAt: null,

        timerInterval: null,

        elapsedSeconds: 0,

        answerShown: false
    };
}


/* =========================================================
   STUDY
   ========================================================= */

function startStudy(deckId) {

    const deck =
        appData.decks.find(
            d => d.id === deckId
        );


    if (!deck) {

        alert(
            "デッキが見つかりません。"
        );

        return;
    }


    let cards =
    deck.items.filter(
        item => !item.deleted
    );

if (appData.settings.randomStudy) {
    cards = shuffleCards(cards);
}

    if (!cards.length) {

        alert(
            "このデッキにはカードがありません。"
        );

        return;
    }


    stopStudyTimer();


    studyState =
        createEmptyStudyState();


    studyState.active = true;

    studyState.deckId =
        deck.id;

    studyState.cards =
        cards;

    studyState.currentIndex =
        0;

    studyState.startedAt =
        Date.now();

    studyState.elapsedSeconds =
        0;


    studyState.timerInterval =
        setInterval(
            updateStudyTimer,
            1000
        );


    showPage("study");

    renderStudyCard();
}


function updateStudyTimer() {

    if (
        !studyState.active ||
        !studyState.startedAt
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


    const timer =
        document.getElementById(
            "study-timer"
        );


    if (timer) {

        timer.textContent =
            formatSeconds(
                studyState.elapsedSeconds
            );
    }
}


function renderStudyCard() {

    if (
        !studyState.active
    ) {
        return;
    }


    const card =
        studyState.cards[
            studyState.currentIndex
        ];


    if (!card) {

        finishStudy();

        return;
    }


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

    const deckName =
        document.getElementById(
            "study-deck-name"
        );

    const showAnswer =
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


    if (front) {

        front.textContent =
            card.front;
    }


    if (back) {

        back.textContent =
            card.back;

        back.hidden = true;
    }


    if (progress) {

        progress.textContent =
            `${studyState.currentIndex + 1} / ${studyState.cards.length}`;
    }


    const deck =
        appData.decks.find(
            d =>
                d.id ===
                studyState.deckId
        );


    if (
        deckName &&
        deck
    ) {

        deckName.textContent =
            deck.name;
    }


    if (showAnswer) {

        showAnswer.disabled =
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


    studyState.answerShown =
        false;


    if (
        appData.settings.autoVoice
    ) {

        speakText(

            card.front,

            studyState.deckId
        );
    }
}


function showStudyAnswer() {

    if (
        !studyState.active
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


    const back =
        document.getElementById(
            "study-back"
        );


    if (back) {

        back.hidden = false;
    }


    const wrong =
        document.getElementById(
            "wrong-button"
        );

    const correct =
        document.getElementById(
            "correct-button"
        );


    if (wrong) {

        wrong.disabled =
            false;
    }


    if (correct) {

        correct.disabled =
            false;
    }


    const show =
        document.getElementById(
            "show-answer-button"
        );


    if (show) {

        show.disabled =
            true;
    }


    studyState.answerShown =
        true;


    if (
        appData.settings.autoVoice
    ) {

        speakText(

            card.back,

            studyState.deckId
        );
    }
}


function answerStudy(
    isCorrect
) {

    if (
        !studyState.active ||
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


    const deck =
        appData.decks.find(
            d =>
                d.id ===
                studyState.deckId
        );


    if (deck) {

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
    }


    studyState.currentIndex++;


    if (
        studyState.currentIndex >=
        studyState.cards.length
    ) {

        const answerCount =
            studyState.sessionAnswers;

        finishStudy();


        alert(
            "学習終了！\n\n" +
            `回答数：${answerCount}`
        );

        return;
    }


    renderStudyCard();

    saveData();
}


function finishStudy(
    options = {}
) {

    stopStudyTimer();


    if (
        studyState.active &&
        studyState.sessionAnswers > 0
    ) {

        const deck =
            appData.decks.find(
                d =>
                    d.id ===
                    studyState.deckId
            );


        saveStudyRecord({

            deckId:
                studyState.deckId,

            deckName:
                deck
                    ? deck.name
                    : "不明なデッキ",

            answers:
                studyState.sessionAnswers,

            correct:
                studyState.sessionCorrect,

            wrong:
                studyState.sessionWrong,

            accuracy:
                Math.round(

                    (
                        studyState.sessionCorrect /
                        studyState.sessionAnswers
                    ) * 100
                ),

            studyTime:
                studyState.elapsedSeconds
        });
    }


    studyState =
        createEmptyStudyState();


    if (!options.silent) {

        showPage(

            options.redirect === false
                ? navigationState.currentPage
                : "home"
        );
    }
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
   STUDY RECORD
   ========================================================= */

function saveStudyRecord(
    recordData
) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const index =
        appData.records.findIndex(
            record =>

                record.deckId ===
                recordData.deckId &&

                record.date.startsWith(
                    today
                )
        );


    if (index >= 0) {

        appData.records[index] =
            normalizeRecord({

                ...appData.records[index],

                ...recordData,

                date:
                    new Date()
                        .toISOString()
            });

    } else {

        appData.records.push(

            normalizeRecord({

                ...recordData,

                date:
                    new Date()
                        .toISOString()
            })
        );
    }


    saveData();
}


/* =========================================================
   DECK MANAGEMENT
   ========================================================= */

function createDeck(
    name,
    language = "unknown"
) {

    const deck = {

        id:
            generateId(),

        name:
            name ||
            "無題のデッキ",

        language,

        type:
            "csv",

        items: [],

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

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

    return deck;
}


function findDeckByName(
    name
) {

    return appData.decks.find(
        deck =>
            deck.name === name
    );
}


function findDeckById(
    id
) {

    return appData.decks.find(
        deck =>
            deck.id === id
    );
}


function addCardToDeck(
    deckId,
    front,
    back
) {

    const deck =
        findDeckById(
            deckId
        );


    if (!deck) {
        return null;
    }


    const item =
        normalizeItem(

            {
                front,
                back
            },

            deck.items.length
        );


    deck.items.push(
        item
    );


    deck.updatedAt =
        new Date().toISOString();


    saveData();


    return item;
}


function editCardInDeck(
    deckId,
    cardId,
    front,
    back
) {

    const deck =
        findDeckById(
            deckId
        );


    if (!deck) {
        return false;
    }


    const item =
        deck.items.find(
            i =>
                i.id === cardId
        );


    if (!item) {
        return false;
    }


    item.front =
        String(front);

    item.back =
        String(back);

    item.updatedAt =
        new Date().toISOString();


    deck.updatedAt =
        new Date().toISOString();


    saveData();

    return true;
}


function deleteCardFromDeck(
    deckId,
    cardId
) {

    const deck =
        findDeckById(
            deckId
        );


    if (!deck) {
        return false;
    }


    const item =
        deck.items.find(
            i =>
                i.id === cardId
        );


    if (!item) {
        return false;
    }


    /*
     * 削除履歴を残す
     */

    appData.deletedItems.push({

        ...item,

        deckId,

        deletedAt:
            new Date().toISOString()
    });


    deck.items =
        deck.items.filter(
            item =>
                item.id !== cardId
        );


    reindexDeckItems(
        deck
    );


    deck.updatedAt =
        new Date().toISOString();


    saveData();


    renderDecks();

    renderHome();

    return true;
}


function deleteDeck(
    deckId
) {

    const deck =
        findDeckById(
            deckId
        );


    if (!deck) {
        return;
    }


    const confirmed =
        confirm(

            `「${deck.name}」を削除しますか？\n\n` +
            "このデッキのカードも削除されます。"
        );


    if (!confirmed) {
        return;
    }


    /*
     * 削除カードを履歴に保存
     */

    deck.items.forEach(
        item => {

            appData.deletedItems.push({

                ...item,

                deckId,

                deletedAt:
                    new Date()
                        .toISOString()
            });
        }
    );


    appData.decks =
        appData.decks.filter(
            d =>
                d.id !== deckId
        );


    saveData();

    renderAll();
}


/* =========================================================
   CARD SEARCH
   ========================================================= */

function searchCards(
    keyword
) {

    const lower =
        String(
            keyword || ""
        )
            .trim()
            .toLowerCase();


    /*
     * 空欄なら全カード
     *
     * → 編集画面などでも使いやすくする
     */

    if (!lower) {

        return [];
    }


    const results = [];


    appData.decks.forEach(
        deck => {

            deck.items.forEach(
                item => {

                    if (
                        item.deleted
                    ) {
                        return;
                    }


                    const front =
                        String(
                            item.front ||
                            ""
                        );

                    const back =
                        String(
                            item.back ||
                            ""
                        );


                    if (

                        front
                            .toLowerCase()
                            .includes(lower)

                        ||

                        back
                            .toLowerCase()
                            .includes(lower)

                    ) {

                        results.push({

                            deckId:
                                deck.id,

                            deckName:
                                deck.name,

                            ...item
                        });
                    }
                }
            );
        }
    );


    return results;
}


function renderSearchResults() {

    const input =
        document.getElementById(
            "card-search-input"
        );

    const container =
        document.getElementById(
            "card-search-results"
        );


    if (
        !input ||
        !container
    ) {
        return;
    }


    const keyword =
        input.value.trim();


    if (!keyword) {

        container.innerHTML =
            `
            <div class="empty-state">
                🔎 カードを検索すると、
                ここに結果が表示されます。
            </div>
            `;

        return;
    }


    const results =
        searchCards(
            keyword
        );


    if (!results.length) {

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
                item => {

                    return `

                    <div
                        class="card"
                        style="
                            margin-top:12px;
                            box-shadow:none;
                        "
                    >

                        <div
                            style="
                                color:var(--primary);
                                font-size:13px;
                                margin-bottom:8px;
                                font-weight:700;
                            "
                        >
                            📚 ${escapeHTML(
                                item.deckName
                            )}
                        </div>


                        <div
                            style="
                                font-weight:700;
                                white-space:pre-wrap;
                                overflow-wrap:anywhere;
                            "
                        >
                            ${escapeHTML(
                                item.front
                            )}
                        </div>


                        <div
                            style="
                                margin-top:8px;
                                color:var(--muted);
                                white-space:pre-wrap;
                                overflow-wrap:anywhere;
                            "
                        >
                            ${escapeHTML(
                                item.back
                            )}
                        </div>


                        <div
                            class="button-row"
                            style="
                                margin-top:14px;
                            "
                        >

                            <button

                                type="button"

                                class="btn btn-secondary"

                                data-edit-card="${escapeHTML(
                                    item.id
                                )}"

                                data-deck-id="${escapeHTML(
                                    item.deckId
                                )}"

                            >
                                ✏️ 編集
                            </button>


                            <button

                                type="button"

                                class="btn btn-danger"

                                data-delete-card="${escapeHTML(
                                    item.id
                                )}"

                                data-deck-id="${escapeHTML(
                                    item.deckId
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
}


function editCardPrompt(
    deckId,
    cardId
) {

    const deck =
        findDeckById(
            deckId
        );


    if (!deck) {
        return;
    }


    const card =
        deck.items.find(
            item =>
                item.id === cardId
        );


    if (!card) {
        return;
    }


    const newFront =
        prompt(
            "カード表面を編集",
            card.front
        );


    if (
        newFront === null
    ) {
        return;
    }


    const newBack =
        prompt(
            "カード裏面を編集",
            card.back
        );


    if (
        newBack === null
    ) {
        return;
    }


    editCardInDeck(

        deckId,

        cardId,

        newFront,

        newBack
    );


    renderSearchResults();

    renderDecks();

    renderHome();
}


/* =========================================================
   CSV PARSER
   ========================================================= */

/*
 * 通常のCSVにも対応
 *
 * 例：
 *
 * "Ich denke, dass er kommt.",I think he will come.
 *
 *
 * さらに、
 *
 * Ich denke, dass er kommt.,I think he will come.
 *
 * のように、表面が引用符で囲まれていない
 * 「カンマを含む2列CSV」にも対応。
 *
 * この場合は
 *
 * 最後のカンマを
 * 表面と裏面の境界
 *
 * として扱う。
 */


function parseCSV(text) {

    const rows = [];

    let row = [];

    let field = "";

    let insideQuotes = false;

    let hadQuotes = false;


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
            char === '"'
        ) {

            if (
                insideQuotes &&
                next === '"'
            ) {

                field += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;

                hadQuotes = true;
            }

            continue;
        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(field);

            field = "";

            continue;
        }


        if (

            (
                char === "\n" ||
                char === "\r"
            )

            &&

            !insideQuotes

        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;
            }


            row.push(field);


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

            field = "";

            hadQuotes = false;

            continue;
        }


        field += char;
    }


    if (
        field !== "" ||
        row.length > 0
    ) {

        row.push(field);


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
    }


    return rows;
}


/*
 * CSVの1行を
 * 表 / 裏 に分ける。
 *
 * ポイント：
 *
 * 2列なら普通に2列。
 *
 * 3列以上になった場合、
 * 「最後の列を裏」
 * 「それ以前を表」
 * とする。
 *
 * これで
 *
 * Ich denke, dass er kommt.,答え
 *
 * が
 *
 * 表：
 * Ich denke
 * dass er kommt.
 *
 * ではなく、
 *
 * 表：
 * Ich denke, dass er kommt.
 *
 * 裏：
 * 答え
 *
 * になる。
 */

function splitCSVRow(
    row
) {

    if (
        !Array.isArray(row) ||
        row.length === 0
    ) {

        return {
            front: "",
            back: ""
        };
    }


    if (
        row.length === 1
    ) {

        return {

            front:
                String(
                    row[0] ?? ""
                ).trim(),

            back: ""
        };
    }


    /*
     * 2列
     *
     * ただし元CSVで
     * カンマが文章内にある場合は
     * ここには3列以上で来る。
     */

    if (
        row.length === 2
    ) {

        return {

            front:
                String(
                    row[0] ?? ""
                ).trim(),

            back:
                String(
                    row[1] ?? ""
                ).trim()
        };
    }


    /*
     * 3列以上
     *
     * 最後を裏面にする。
     */

    const back =
        String(
            row[row.length - 1] ?? ""
        ).trim();


    const front =
        row
            .slice(
                0,
                row.length - 1
            )
            .join(",")
            .trim();


    return {
        front,
        back
    };
}


/* =========================================================
   CSV HEADER
   ========================================================= */

function looksLikeCSVHeader(
    row
) {

    if (
        !Array.isArray(row)
    ) {
        return false;
    }


    const values =
        row.map(
            cell =>
                String(cell)
                    .trim()
                    .toLowerCase()
        );


    const headerWords = [

        "front",

        "back",

        "表",

        "裏",

        "表面",

        "裏面",

        "question",

        "answer",

        "word",

        "meaning",

        "question",

        "answer",

        "term",

        "definition",

        "deutsch",

        "japanese",

        "german"
    ];


    return values.some(
        value =>
            headerWords.includes(
                value
            )
    );
}


/* =========================================================
   CSV IMPORT
   ========================================================= */

function importCSVText(

    text,

    filename,

    language,

    targetDeckId = null

) {

    const rows =
        parseCSV(text);


    if (
        !rows.length
    ) {

        alert(
            "CSVにデータがありません。"
        );

        return null;
    }


    let startIndex = 0;


    if (
        looksLikeCSVHeader(
            rows[0]
        )
    ) {

        startIndex = 1;
    }


    /*
     * 既存デッキへの追加
     *
     * targetDeckId があれば
     * そこへ追加。
     */

    let deck = null;


    if (
        targetDeckId
    ) {

        deck =
            findDeckById(
                targetDeckId
            );
    }


    /*
     * targetDeckIdがない場合は
     * ファイル名と同じデッキを探す。
     */

    if (!deck) {

        const deckName =
            removeExtension(
                filename
            );

        deck =
            findDeckByName(
                deckName
            );


        /*
         * なければ新規作成
         */

        if (!deck) {

            deck =
                createDeck(

                    deckName,

                    language
                );
        }
    }


    let added = 0;


    for (
        let i = startIndex;
        i < rows.length;
        i++
    ) {

        const row =
            rows[i];


        if (
            !row ||
            !row.length
        ) {
            continue;
        }


        const {

            front,

            back

        } =
            splitCSVRow(
                row
            );


        /*
         * 空カードは無視
         */

        if (
            !front &&
            !back
        ) {
            continue;
        }


        addCardToDeck(

            deck.id,

            front,

            back
        );


        added++;
    }


    deck.updatedAt =
        new Date()
            .toISOString();


    saveData();

    renderAll();


    return {

        deck,

        added
    };
}


/* =========================================================
   TXT IMPORT
   ========================================================= */

function importTXTText(

    text,

    filename,

    language,

    targetDeckId = null

) {

    const lines =
        text
            .split(/\r?\n/)
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line !== ""
            );


    if (
        !lines.length
    ) {

        alert(
            "TXTにデータがありません。"
        );

        return null;
    }


    let deck = null;


    /*
     * 既存デッキへの追加
     */

    if (
        targetDeckId
    ) {

        deck =
            findDeckById(
                targetDeckId
            );
    }


    if (!deck) {

        const deckName =
            removeExtension(
                filename
            );


        deck =
            findDeckByName(
                deckName
            );


        if (!deck) {

            deck =
                createDeck(

                    deckName,

                    language
                );
        }
    }


    let added = 0;


    lines.forEach(
        line => {

            /*
             * TAB
             */

            const separatorIndex =
                line.indexOf("\t");


            if (
                separatorIndex >= 0
            ) {

                const front =
                    line
                        .substring(
                            0,
                            separatorIndex
                        )
                        .trim();


                const back =
                    line
                        .substring(
                            separatorIndex + 1
                        )
                        .trim();


                if (
                    front ||
                    back
                ) {

                    addCardToDeck(

                        deck.id,

                        front,

                        back
                    );

                    added++;
                }


                return;
            }


            /*
             * |
             */

            const pipeIndex =
                line.indexOf("|");


            if (
                pipeIndex >= 0
            ) {

                const front =
                    line
                        .substring(
                            0,
                            pipeIndex
                        )
                        .trim();


                const back =
                    line
                        .substring(
                            pipeIndex + 1
                        )
                        .trim();


                addCardToDeck(

                    deck.id,

                    front,

                    back
                );


                added++;

                return;
            }


            /*
             * 区切りなし
             */

            addCardToDeck(

                deck.id,

                line,

                ""
            );


            added++;
        }
    );


    saveData();

    renderAll();


    return {

        deck,

        added
    };
}


/* =========================================================
   FILE IMPORT
   ========================================================= */

async function handleFileImport(
    file
) {

    if (!file) {
        return;
    }


    const status =
        document.getElementById(
            "import-status"
        );


    const languageSelect =
        document.getElementById(
            "import-language-select"
        );


    const language =
        languageSelect

            ? languageSelect.value

            : (
                appData.settings
                    .learningLanguage ||
                "unknown"
            );


    /*
     * index.htmlに
     * import-target-deck
     * がある場合は
     * 既存デッキへ追加できる。
     */

    const targetSelect =
        document.getElementById(
            "import-target-deck"
        );


    const targetDeckId =
        targetSelect
            ? targetSelect.value
            : null;


    if (status) {

        status.innerHTML =
            `
            <div class="card">
                📖 読み込み中...
            </div>
            `;
    }


    try {

        const filename =
            file.name ||
            "教材";


        const lower =
            filename.toLowerCase();


        if (
            lower.endsWith(".csv")
        ) {

            const text =
                await file.text();


            const result =
                importCSVText(

                    text,

                    filename,

                    language,

                    targetDeckId
                );


            if (
                result &&
                status
            ) {

                status.innerHTML =
                    `
                    <div class="card">

                        <strong>
                            ✅ インポート完了
                        </strong>

                        <br><br>

                        デッキ：
                        ${escapeHTML(
                            result.deck.name
                        )}

                        <br>

                        追加カード：
                        ${result.added}枚

                        <br><br>

                        <small>
                            このデッキに別のCSVを
                            追加することもできます。
                        </small>

                    </div>
                    `;
            }


            /*
             * 次回選択用に
             * デッキ一覧を更新
             */

            renderImportDeckSelect();

            return;
        }


        if (
            lower.endsWith(".txt")
        ) {

            const text =
                await file.text();


            const result =
                importTXTText(

                    text,

                    filename,

                    language,

                    targetDeckId
                );


            if (
                result &&
                status
            ) {

                status.innerHTML =
                    `
                    <div class="card">

                        <strong>
                            ✅ インポート完了
                        </strong>

                        <br><br>

                        デッキ：
                        ${escapeHTML(
                            result.deck.name
                        )}

                        <br>

                        追加カード：
                        ${result.added}枚

                    </div>
                    `;
            }


            renderImportDeckSelect();

            return;
        }


        if (
            lower.endsWith(".pdf")
        ) {

            await importPDFFile(

                file,

                filename,

                language,

                status,

                targetDeckId
            );


            renderImportDeckSelect();

            return;
        }


        alert(
            "TXT、CSV、PDFファイルを選択してください。"
        );

    } catch (error) {

        console.error(
            "ファイルインポートエラー:",
            error
        );


        if (status) {

            status.innerHTML =
                `
                <div class="card">

                    ❌ 読み込みに失敗しました。

                    <br>

                    ${escapeHTML(
                        error.message
                    )}

                </div>
                `;
        }
    }
}


/* =========================================================
   IMPORT DECK SELECT
   ========================================================= */

function renderImportDeckSelect() {

    const select =
        document.getElementById(
            "import-target-deck"
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

        ${
            appData.decks
                .map(
                    deck =>
                        `
                        <option
                            value="${escapeHTML(
                                deck.id
                            )}"
                        >
                            既存：
                            ${escapeHTML(
                                deck.name
                            )}
                            （${
                                deck.items.filter(
                                    item =>
                                        !item.deleted
                                ).length
                            }枚）
                        </option>
                        `
                )
                .join("")
        }
        `;


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
   PDF IMPORT
   ========================================================= */

async function importPDFFile(

    file,

    filename,

    language,

    status,

    targetDeckId = null

) {

    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        alert(

            "PDF読み込み機能を使用するにはPDF.jsが必要です。\n\n" +
            "現在はTXTまたはCSVをご利用ください。"
        );

        return;
    }


    if (status) {

        status.innerHTML =
            `
            <div class="card">
                📖 PDFを解析しています...
            </div>
            `;
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
                .join(" ");


        text +=
            pageText +
            "\n";
    }


    const result =
        importTXTText(

            text,

            filename,

            language,

            targetDeckId
        );


    if (
        status &&
        result
    ) {

        status.innerHTML =
            `
            <div class="card">

                <strong>
                    ✅ PDFインポート完了
                </strong>

                <br><br>

                デッキ：
                ${escapeHTML(
                    result.deck.name
                )}

                <br>

                追加カード：
                ${result.added}枚

            </div>
            `;
    }
}


/* =========================================================
   DATA EXPORT
   ========================================================= */

function exportDataJSON() {

    try {

        const data =
            JSON.stringify(

                appData,

                null,

                2
            );


        const blob =
            new Blob(

                [data],

                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const anchor =
            document.createElement(
                "a"
            );


        anchor.href =
            url;


        anchor.download =
            `language_gym_backup_${
                new Date()
                    .toISOString()
                    .slice(0, 10)
            }.json`;


        document.body.appendChild(
            anchor
        );


        anchor.click();

        anchor.remove();


        URL.revokeObjectURL(
            url
        );

    } catch (error) {

        console.error(error);

        alert(
            "データの書き出しに失敗しました。"
        );
    }
}


function importDataJSON(
    file
) {

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            try {

                const imported =
                    JSON.parse(
                        event.target.result
                    );


                appData =
                    normalizeImportedData(
                        imported
                    );


                saveData();

                loadTheme();

                renderAll();

                renderImportDeckSelect();


                alert(
                    "データを正常に復元しました！"
                );

            } catch (error) {

                console.error(error);

                alert(
                    "無効なJSONファイルです。"
                );
            }
        };


    reader.onerror =
        function() {

            alert(
                "ファイルの読み込みに失敗しました。"
            );
        };


    reader.readAsText(
        file
    );
}


/* =========================================================
   BACKUP
   ========================================================= */

function createAutomaticBackup() {

    try {

        const backup = {

            version:
                APP_VERSION,

            savedAt:
                new Date()
                    .toISOString(),

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
                "バックアップがありません。"
            );

            return false;
        }


        const backup =
            JSON.parse(
                saved
            );


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

        renderImportDeckSelect();


        alert(
            "バックアップから復元しました。"
        );


        return true;

    } catch (error) {

        console.error(error);

        alert(
            "バックアップの復元に失敗しました。"
        );

        return false;
    }
}


/* =========================================================
   HOME RENDER
   ========================================================= */

function renderHome() {

    const deckCount =
        document.getElementById(
            "home-deck-count"
        );


    const cardCount =
        document.getElementById(
            "home-card-count"
        );


    const studyTime =
        document.getElementById(
            "home-study-time"
        );


    const accuracy =
        document.getElementById(
            "home-accuracy"
        );


    const totalCards =
        appData.decks.reduce(

            (sum, deck) =>

                sum +

                deck.items.filter(
                    item =>
                        !item.deleted
                ).length,

            0
        );


    const totalTime =
        appData.records.reduce(

            (sum, record) =>

                sum +

                Number(
                    record.studyTime || 0
                ),

            0
        );


    const totalAnswers =
        appData.records.reduce(

            (sum, record) =>

                sum +

                Number(
                    record.answers || 0
                ),

            0
        );


    const totalCorrect =
        appData.records.reduce(

            (sum, record) =>

                sum +

                Number(
                    record.correct || 0
                ),

            0
        );


    if (deckCount) {

        deckCount.textContent =
            appData.decks.length;
    }


    if (cardCount) {

        cardCount.textContent =
            totalCards;
    }


    if (studyTime) {

        studyTime.textContent =
            formatSeconds(
                totalTime
            );
    }


    if (accuracy) {

        accuracy.textContent =

            totalAnswers > 0

                ? Math.round(

                    (
                        totalCorrect /
                        totalAnswers
                    ) * 100

                ) + "%"

                : "0%";
    }


    const message =
        document.getElementById(
            "daily-message"
        );


    if (message) {

        const messages = [

            "今日も一歩前進！🌱",

            "少しだけでも続ければ力になる。💪",

            "昨日の自分より、今日の自分へ。✨",

            "言葉は使うほど強くなる。🌍",

            "Language Gymで今日もトレーニング！🏋️"
        ];


        const day =
            Math.floor(
                Date.now() /
                86400000
            );


        message.textContent =
            messages[
                day % messages.length
            ];
    }
}


/* =========================================================
   DECK RENDER
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

                    const count =
                        deck.items.filter(
                            item =>
                                !item.deleted
                        ).length;


                    return `
                    <div class="deck-card">

                        <div class="deck-name">

                            ${escapeHTML(
                                deck.name
                            )}

                        </div>


                        <div class="deck-meta">

                            ${escapeHTML(
                                deck.language
                            )}

                            ・

                            ${count}カード

                        </div>


                        <div
                            class="button-row"
                            style="
                                margin-top:16px;
                            "
                        >

                            <button
                                type="button"
                                class="btn btn-primary"
                                data-start-deck="${escapeHTML(
                                    deck.id
                                )}"
                            >
                                🏋️ 学習
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
}


/* =========================================================
   PROGRESS RENDER
   ========================================================= */

function renderProgress() {

    const totalTime =
        appData.records.reduce(

            (sum, record) =>

                sum +

                Number(
                    record.studyTime || 0
                ),

            0
        );


    const totalAnswers =
        appData.records.reduce(

            (sum, record) =>

                sum +

                Number(
                    record.answers || 0
                ),

            0
        );


    const totalCorrect =
        appData.records.reduce(

            (sum, record) =>

                sum +

                Number(
                    record.correct || 0
                ),

            0
        );


    const totalAccuracy =
        totalAnswers > 0

            ? Math.round(

                (
                    totalCorrect /
                    totalAnswers
                ) * 100

            )

            : 0;


    const time =
        document.getElementById(
            "progress-total-time"
        );


    const answers =
        document.getElementById(
            "progress-total-answers"
        );


    const correct =
        document.getElementById(
            "progress-total-correct"
        );


    const accuracy =
        document.getElementById(
            "progress-accuracy"
        );


    if (time) {

        time.textContent =
            formatSeconds(
                totalTime
            );
    }


    if (answers) {

        answers.textContent =
            totalAnswers;
    }


    if (correct) {

        correct.textContent =
            totalCorrect;
    }


    if (accuracy) {

        accuracy.textContent =
            `${totalAccuracy}%`;
    }


    const table =
        document.getElementById(
            "progress-table"
        );


    if (!table) {
        return;
    }


    if (
        !appData.records.length
    ) {

        table.innerHTML =
            `
            <div class="empty-state">
                まだ学習記録がありません。
            </div>
            `;

        return;
    }


    const records =
        [...appData.records]
            .sort(

                (a, b) =>

                    new Date(b.date) -
                    new Date(a.date)
            );


    table.innerHTML =
        `

        <table>

            <thead>

                <tr>

                    <th>日時</th>

                    <th>デッキ</th>

                    <th>回答</th>

                    <th>正解</th>

                    <th>正答率</th>

                    <th>時間</th>

                </tr>

            </thead>


            <tbody>

                ${
                    records
                        .map(
                            record =>
                                `
                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            formatDate(
                                                record.date
                                            )
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            record.deckName
                                        )}
                                    </td>

                                    <td>
                                        ${record.answers}
                                    </td>

                                    <td>
                                        ${record.correct}
                                    </td>

                                    <td>
                                        ${record.accuracy}%
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            formatSeconds(
                                                record.studyTime
                                            )
                                        )}
                                    </td>

                                </tr>
                                `
                        )
                        .join("")
                }

            </tbody>

        </table>

        `;
}


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettings() {

    const settings =
        appData.settings;


    const autoVoice =
        document.getElementById(
            "auto-voice"
        );

        const randomStudy =
    document.getElementById(
        "random-study"
    );


    const rate =
        document.getElementById(
            "voice-rate"
        );


    const pitch =
        document.getElementById(
            "voice-pitch"
        );


    const ui =
        document.getElementById(
            "ui-language"
        );


    const learning =
        document.getElementById(
            "learning-language"
        );


    if (autoVoice) {

        autoVoice.checked =
            Boolean(
                settings.autoVoice
            );
    }
if (randomStudy) {
    randomStudy.checked =
        settings.randomStudy !== false;
}

    if (rate) {

        rate.value =
            settings.voiceRate || 1;
    }


    if (pitch) {

        pitch.value =
            settings.voicePitch || 1;
    }


    if (ui) {

        ui.value =
            settings.uiLanguage ||
            "ja";
    }


    if (learning) {

        learning.value =
            settings.learningLanguage ||
            "zh";
    }


    updateColorUI(

        settings.customColor ||

        DEFAULT_THEME_COLOR
    );
}


function saveSettingsValue(
    key,
    value
) {

    if (
        !appData.settings
    ) {
        return;
    }


    appData.settings[key] =
        value;


    saveData();
}


/* =========================================================
   SPEECH
   ========================================================= */

function speakText(
    text,
    deckId
) {

    if (

        !text ||

        typeof speechSynthesis ===
        "undefined"

    ) {

        return;
    }


    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


    utterance.rate =
        Number(
            appData.settings.voiceRate
        ) || 1;


    utterance.pitch =
        Number(
            appData.settings.voicePitch
        ) || 1;


    const deck =
        findDeckById(
            deckId
        );


    if (deck) {

        const language =
            deck.language;


        const langMap = {

            zh: "zh-CN",

            de: "de-DE",

            es: "es-ES",

            fr: "fr-FR",

            it: "it-IT",

            ko: "ko-KR",

            fi: "fi-FI",

            ja: "ja-JP"
        };


        if (
            langMap[language]
        ) {

            utterance.lang =
                langMap[language];
        }
    }


    speechSynthesis.cancel();


    speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   PAGE RENDER
   ========================================================= */

function renderPageContent(
    pageName
) {

    switch (pageName) {

        case "home":

            renderHome();

            break;


        case "decks":

            renderDecks();

            break;


        case "study":

            renderStudyCard();

            break;


        case "progress":

            renderProgress();

            break;


        case "settings":

            renderSettings();

            break;


        case "import":

            renderImportDeckSelect();

            break;


        case "data-share":

            break;
    }
}


function renderAll() {

    loadTheme();

    renderHome();

    renderDecks();

    renderProgress();

    renderSettings();

    renderImportDeckSelect();

    renderSearchResults();


    if (
        navigationState.currentPage ===
        "study"
    ) {

        renderStudyCard();
    }
}


/* =========================================================
   EVENT HANDLERS
   ========================================================= */

function setupEvents() {
    
    /*
     * bodyのイベント委譲
     *
     * 動的に生成されたボタンでも
     * 動作する。
     */

    document.body.addEventListener(
        "click",
        function(event) {

            /*
             * 戻る
             */

            const back =
                event.target.closest(
                    ".btn-back, [data-action='back']"
                );


            if (back) {

                event.preventDefault();

                goBack();

                return;
            }


            /*
             * 進む
             */

            const forward =
                event.target.closest(
                    ".btn-forward, [data-action='forward']"
                );


            if (forward) {

                event.preventDefault();

                goForward();

                return;
            }


            /*
             * 学習開始
             */

            const startDeck =
                event.target.closest(
                    "[data-start-deck]"
                );


            if (startDeck) {

                event.preventDefault();

                startStudy(

                    startDeck.dataset
                        .startDeck
                );

                return;
            }


            /*
             * デッキ削除
             */

            const deleteDeckButton =
                event.target.closest(
                    "[data-delete-deck]"
                );


            if (
                deleteDeckButton
            ) {

                event.preventDefault();

                deleteDeck(

                    deleteDeckButton
                        .dataset
                        .deleteDeck
                );

                return;
            }


            /*
             * カード削除
             */

            const deleteCard =
                event.target.closest(
                    "[data-delete-card]"
                );


            if (deleteCard) {

                event.preventDefault();


                const confirmed =
                    confirm(
                        "このカードを削除しますか？"
                    );


                if (!confirmed) {
                    return;
                }


                deleteCardFromDeck(

                    deleteCard.dataset
                        .deckId,

                    deleteCard.dataset
                        .deleteCard
                );


                renderSearchResults();

                return;
            }


            /*
             * カード編集
             */

            const editCard =
                event.target.closest(
                    "[data-edit-card]"
                );


            if (editCard) {

                event.preventDefault();


                editCardPrompt(

                    editCard.dataset
                        .deckId,

                    editCard.dataset
                        .editCard
                );


                return;
            }


            /*
             * カラー
             */

            const colorButton =
                event.target.closest(
                    ".color-option"
                );


            if (colorButton) {

                event.preventDefault();


                const color =
                    colorButton.dataset.color;


                if (
                    isValidHexColor(
                        color
                    )
                ) {

                    appData.settings
                        .customColor =
                        color;


                    applyTheme(
                        color
                    );


                    saveData();
                }


                return;
            }
        }
    );


    /*
     * 答えを見る
     */

    const showAnswer =
        document.getElementById(
            "show-answer-button"
        );


    if (showAnswer) {

        showAnswer.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                showStudyAnswer();
            }
        );
    }


    /*
     * 正解
     */

    const correct =
        document.getElementById(
            "correct-button"
        );


    if (correct) {

        correct.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                answerStudy(true);
            }
        );
    }


    /*
     * わからない
     */

    const wrong =
        document.getElementById(
            "wrong-button"
        );


    if (wrong) {

        wrong.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                answerStudy(false);
            }
        );
    }


    /*
     * カード検索
     */

    const search =
        document.getElementById(
            "card-search-input"
        );


    if (search) {

        search.addEventListener(
            "input",
            renderSearchResults
        );
    }


    /*
     * ファイル選択
     */

    const selectFile =
        document.getElementById(
            "select-file-button"
        );


    const fileInput =
        document.getElementById(
            "file-input"
        );


    if (
        selectFile &&
        fileInput
    ) {

        selectFile.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                fileInput.click();
            }
        );


        fileInput.addEventListener(
            "change",
            function() {

                const file =
                    this.files?.[0];


                if (file) {

                    handleFileImport(
                        file
                    );
                }


                this.value = "";
            }
        );
    }


    /*
     * JSON import
     */

    const importButton =
        document.getElementById(
            "data-import-button"
        );


    const importInput =
        document.getElementById(
            "data-import-input"
        );


    if (
        importButton &&
        importInput
    ) {

        importButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                importInput.click();
            }
        );


        importInput.addEventListener(
            "change",
            function() {

                const file =
                    this.files?.[0];


                if (file) {

                    importDataJSON(
                        file
                    );
                }


                this.value = "";
            }
        );
    }


    /*
     * custom color
     */

    const customColor =
        document.getElementById(
            "custom-color"
        );


    if (customColor) {

        customColor.addEventListener(
            "input",
            function() {

                if (
                    isValidHexColor(
                        this.value
                    )
                ) {

                    appData.settings
                        .customColor =
                        this.value;


                    applyTheme(
                        this.value
                    );


                    saveData();
                }
            }
        );
    }


    /*
     * auto voice
     */

    const autoVoice =
        document.getElementById(
            "auto-voice"
        );


    if (autoVoice) {

        autoVoice.addEventListener(
            "change",
            function() {

                saveSettingsValue(

                    "autoVoice",

                    this.checked
                );
            }
        );
    }


    

    /*
     * voice rate
     */

    const voiceRate =
        document.getElementById(
            "voice-rate"
        );


    if (voiceRate) {

        voiceRate.addEventListener(
            "change",
            function() {

                saveSettingsValue(

                    "voiceRate",

                    Number(
                        this.value
                    )
                );
            }
        );
    }


    /*
     * voice pitch
     */

    const voicePitch =
        document.getElementById(
            "voice-pitch"
        );


    if (voicePitch) {

        voicePitch.addEventListener(
            "change",
            function() {

                saveSettingsValue(

                    "voicePitch",

                    Number(
                        this.value
                    )
                );
            }
        );
    }


    /*
     * UI language
     */

    const uiLanguage =
        document.getElementById(
            "ui-language"
        );


    if (uiLanguage) {

        uiLanguage.addEventListener(
            "change",
            function() {

                saveSettingsValue(

                    "uiLanguage",

                    this.value
                );
            }
        );
    }


    /*
     * learning language
     */

    const learningLanguage =
        document.getElementById(
            "learning-language"
        );


    if (learningLanguage) {

        learningLanguage.addEventListener(
            "change",
            function() {

                saveSettingsValue(

                    "learningLanguage",

                    this.value
                );
            }
        );
    }



        /*
     * Mobile menu
     *
     * スマホで確実に反応するように
     * document側でイベントを受け取る。
     */

    document.addEventListener(

        "click",
        function(event) {

            const menuButton =
                event.target.closest(
                    "#mobile-menu-button"
                );

            if (!menuButton) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const sidebar =
                document.getElementById(
                    "sidebar"
                );

            if (!sidebar) {
                console.warn(
                    "sidebar が見つかりません。"
                );
                return;
            }

            const isOpen =
                sidebar.classList.toggle(
                    "open"
                );

            /*
             * アクセシビリティ用
             */

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        },
        true
    );


    /*
     * サイドバー外をタップしたら閉じる
     */

    document.addEventListener(
        "click",
        function(event) {

            const sidebar =
                document.getElementById(
                    "sidebar"
                );

            const menuButton =
                document.getElementById(
                    "mobile-menu-button"
                );

            if (
                !sidebar ||
                !menuButton
            ) {
                return;
            }


            if (
                !sidebar.classList.contains(
                    "open"
                )
            ) {
                return;
            }


            if (
                sidebar.contains(
                    event.target
                ) ||
                menuButton.contains(
                    event.target
                )
            ) {
                return;
            }


            sidebar.classList.remove(
                "open"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        },
        true
    );


    /*
     * ESCキーでも閉じる
     */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            const sidebar =
                document.getElementById(
                    "sidebar"
                );

            const menuButton =
                document.getElementById(
                    "mobile-menu-button"
                );

            if (sidebar) {

                sidebar.classList.remove(
                    "open"
                );
            }

            if (menuButton) {

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );


    /*
     * ナビゲーション
     */

    document
        .querySelectorAll(
            ".nav-item[data-page]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    showPage(

                        this.dataset.page
                    );
                }
            );
        });


    /*
     * Browser back / forward
     */

    window.addEventListener(
        "popstate",
        function(event) {

            const state =
                event.state;


            let page =

                state &&
                state.languageGym &&
                state.page

                    ? state.page

                    : (

                        window.location.hash

                            ? decodeURIComponent(
                                window.location.hash
                                    .substring(1)
                            )

                            : "home"
                    );


            if (
                document.getElementById(
                    `page-${page}`
                )
            ) {

                showPage(

                    page,

                    {
                        pushHistory: false,

                        browserHistory: false
                    }
                );
            }
        }
    );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
         * イベントを最初に設定
         *
         * ハンバーガーメニュー、
         * ナビゲーション、
         * 学習ボタン、
         * 戻る・進む、
         * 設定など
         * すべてここで有効になる。
         */
        setupEvents();


        /*
         * 初期ページ
         */

        const hash =
            window.location.hash
                ? decodeURIComponent(
                    window.location.hash.substring(1)
                )
                : "";


        const initialPage =
            hash &&
            document.getElementById(
                `page-${hash}`
            )
                ? hash
                : "home";


        navigationState.currentPage =
            initialPage;


        navigationState.history =
            ["home"];


        navigationState.historyIndex =
            0;


        if (
            initialPage !== "home"
        ) {

            navigationState.history.push(
                initialPage
            );

            navigationState.historyIndex =
                1;
        }


        /*
         * 初期ページを表示
         */

        showPage(
            initialPage,
            {
                pushHistory: false,
                browserHistory: false,
                scroll: false
            }
        );


        /*
         * 全画面を描画
         */

        renderAll();


        /*
         * 戻る・進むボタンを更新
         */

        updateNavigationButtons();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.showPage =
    showPage;

window.goBack =
    goBack;

window.goForward =
    goForward;

window.startStudy =
    startStudy;

window.finishStudy =
    finishStudy;

window.exportDataJSON =
    exportDataJSON;

window.importDataJSON =
    importDataJSON;

window.restoreAutomaticBackup =
    restoreAutomaticBackup;

window.handleFileImport =
    handleFileImport;

window.searchCards =
    searchCards;

window.deleteCardFromDeck =
    deleteCardFromDeck;

window.editCardInDeck =
    editCardInDeck;

window.addCardToDeck =
    addCardToDeck;

window.speakText =
    speakText;

window.renderImportDeckSelect =
    renderImportDeckSelect;

window.importCSVText =
    importCSVText;