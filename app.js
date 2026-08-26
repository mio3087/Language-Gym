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

let appData = null;


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

function createDefaultData() {

    return {
        version: DEFAULT_DATA.version,

        settings: {
            ...DEFAULT_SETTINGS
        },

        decks: [],

        studyHistory: [],

        totalStudyTime: 0,

        totalAnswers: 0,

        totalCorrect: 0
    };

}


function normalizeCard(card) {

    if (!card || typeof card !== "object") {

        return {
            id: generateId("card"),
            front: "",
            back: "",
            example: "",
            note: "",
            createdAt: nowISO(),
            updatedAt: nowISO(),
            correct: 0,
            incorrect: 0
        };

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
                card.translation ??
                ""
            ),

        example:
            String(
                card.example ??
                ""
            ),

        note:
            String(
                card.note ??
                ""
            ),

        createdAt:
            card.createdAt ||
            nowISO(),

        updatedAt:
            card.updatedAt ||
            nowISO(),

        correct:
            Number(
                card.correct
            ) || 0,

        incorrect:
            Number(
                card.incorrect
            ) || 0
    };

}


function normalizeDeck(deck) {

    if (!deck || typeof deck !== "object") {

        return {

            id:
                generateId("deck"),

            name:
                "新しいデッキ",

            language:
                "zh",

            description:
                "",

            cards:
                [],

            createdAt:
                nowISO(),

            updatedAt:
                nowISO(),

            studyCount:
                0
        };

    }

    const cards =
        Array.isArray(deck.cards)
            ? deck.cards.map(
                normalizeCard
            )
            : [];

    return {

        id:
            deck.id ||
            generateId("deck"),

        name:
            String(
                deck.name ??
                "名称未設定"
            ),

        language:
            String(
                deck.language ??
                "zh"
            ),

        description:
            String(
                deck.description ??
                ""
            ),

        cards:

            cards,

        createdAt:
            deck.createdAt ||
            nowISO(),

        updatedAt:
            deck.updatedAt ||
            nowISO(),

        studyCount:
            Number(
                deck.studyCount
            ) || 0
    };

}


function normalizeHistoryItem(item) {

    if (!item || typeof item !== "object") {

        return {

            id:
                generateId("history"),

            deckId:
                null,

            date:
                nowISO(),

            duration:
                0,

            answers:
                0,

            correct:
                0
        };

    }

    return {

        id:
            item.id ||
            generateId("history"),

        deckId:
            item.deckId ??
            null,

        date:
            item.date ||
            nowISO(),

        duration:
            Number(
                item.duration
            ) || 0,

        answers:
            Number(
                item.answers
            ) || 0,

        correct:
            Number(
                item.correct
            ) || 0
    };

}


function normalizeData(data) {

    const source =
        data &&
        typeof data === "object"
            ? data
            : {};

    const settingsSource =
        source.settings &&
        typeof source.settings === "object"
            ? source.settings
            : {};

    const decks =
        Array.isArray(source.decks)
            ? source.decks.map(
                normalizeDeck
            )
            : [];

    const studyHistory =
        Array.isArray(
            source.studyHistory
        )
            ? source.studyHistory.map(
                normalizeHistoryItem
            )
            : [];

    return {

        version:
            Number(
                source.version
            ) || 1,

        settings: {

            ...DEFAULT_SETTINGS,

            ...settingsSource
        },

        decks:

            decks,

        studyHistory:

            studyHistory,

        totalStudyTime:
            Number(
                source.totalStudyTime
            ) || 0,

        totalAnswers:
            Number(
                source.totalAnswers
            ) || 0,

        totalCorrect:
            Number(
                source.totalCorrect
            ) || 0
    };

}


/* =========================================================
   LOAD / SAVE DATA
   ========================================================= */

function loadData() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!raw) {

            appData =
                createDefaultData();

            return appData;

        }

        const parsed =
            JSON.parse(raw);

        appData =
            normalizeData(
                parsed
            );

        return appData;

    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );

        appData =
            createDefaultData();

        return appData;

    }

}


function saveData() {

    try {

        if (!appData) {

            appData =
                createDefaultData();

        }

        appData =
            normalizeData(
                appData
            );

        const dataToSave =
            JSON.parse(
                JSON.stringify(
                    appData
                )
            );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                dataToSave
            )
        );

        try {

            localStorage.setItem(
                BACKUP_KEY,
                JSON.stringify(
                    dataToSave
                )
            );

        } catch (backupError) {

            console.warn(
                "自動バックアップ保存エラー:",
                backupError
            );

        }

        return true;

    } catch (error) {

        console.error(
            "データ保存エラー:",
            error
        );

        return false;

    }

}


/* =========================================================
   BACKUP
   ========================================================= */

function createBackupData() {

    if (!appData) {

        loadData();

    }

    return JSON.parse(
        JSON.stringify(
            appData
        )
    );

}


function restoreBackupData() {

    try {

        const raw =
            localStorage.getItem(
                BACKUP_KEY
            );

        if (!raw) {

            return false;

        }

        const parsed =
            JSON.parse(
                raw
            );

        appData =
            normalizeData(
                parsed
            );

        saveData();

        refreshAllUI();

        return true;

    } catch (error) {

        console.error(
            "バックアップ復元エラー:",
            error
        );

        return false;

    }

}


/* =========================================================
   DECK HELPERS
   ========================================================= */

function getDeckById(deckId) {

    if (!appData) {

        return null;

    }

    const decks =
        Array.isArray(
            appData.decks
        )
            ? appData.decks
            : [];

    return (
        decks.find(
            function (deck) {

                return (
                    deck.id ===
                    deckId
                );

            }
        ) ||
        null
    );

}


function getCurrentDeck() {

    if (
        !studyState ||
        !studyState.deckId
    ) {

        return null;

    }

    return getDeckById(
        studyState.deckId
    );

}


function getDeckCardCount(deck) {

    if (
        !deck ||
        !Array.isArray(
            deck.cards
        )
    ) {

        return 0;

    }

    return deck.cards.length;

}


function createDeck(
    name,
    language = "zh",
    description = ""
) {

    const deck = {

        id:
            generateId("deck"),

        name:
            String(
                name ||
                "新しいデッキ"
            ),

        language:
            String(
                language ||
                "zh"
            ),

        description:
            String(
                description ||
                ""
            ),

        cards:
            [],

        createdAt:
            nowISO(),

        updatedAt:
            nowISO(),

        studyCount:
            0
    };

    appData.decks.push(
        deck
    );

    saveData();

    return deck;

}


function addCardToDeck(
    deckId,
    front,
    back,
    example = "",
    note = ""
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return null;

    }

    if (
        !Array.isArray(
            deck.cards
        )
    ) {

        deck.cards = [];

    }

    const card = {

        id:
            generateId("card"),

        front:
            String(
                front ??
                ""
            ),

        back:
            String(
                back ??
                ""
            ),

        example:
            String(
                example ??
                ""
            ),

        note:
            String(
                note ??
                ""
            ),

        createdAt:
            nowISO(),

        updatedAt:
            nowISO(),

        correct:
            0,

        incorrect:
            0
    };

    deck.cards.push(
        card
    );

    deck.updatedAt =
        nowISO();

    saveData();

    return card;

}


function deleteCard(
    deckId,
    cardId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return false;

    }

    if (
        !Array.isArray(
            deck.cards
        )
    ) {

        return false;

    }

    const index =
        deck.cards.findIndex(
            function (card) {

                return (
                    card.id ===
                    cardId
                );

            }
        );

    if (index < 0) {

        return false;

    }

    deck.cards.splice(
        index,
        1
    );

    deck.updatedAt =
        nowISO();

    saveData();

    return true;

}


function deleteDeck(
    deckId
) {

    if (!appData) {

        return false;

    }

    const index =
        appData.decks.findIndex(
            function (deck) {

                return (
                    deck.id ===
                    deckId
                );

            }
        );

    if (index < 0) {

        return false;

    }

    appData.decks.splice(
        index,
        1
    );

    if (
        studyState.deckId ===
        deckId
    ) {

        stopStudyTimer();

        studyState = {

            deckId:
                null,

            cards:
                [],

            currentIndex:
                0,

            answered:
                false,

            startTime:
                null,

            timerInterval:
                null
        };

    }

    saveData();

    refreshAllUI();

    return true;

}


/* =========================================================
   STUDY TIME
   ========================================================= */

function formatStudyTime(
    milliseconds
) {

    const totalSeconds =
        Math.max(
            0,
            Math.floor(
                Number(
                    milliseconds
                ) / 1000
            )
        );

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (
                totalSeconds % 3600
            ) / 60
        );

    const seconds =
        totalSeconds % 60;

    if (hours > 0) {

        return (
            String(hours)
                .padStart(2, "0") +
            ":" +
            String(minutes)
                .padStart(2, "0") +
            ":" +
            String(seconds)
                .padStart(2, "0")
        );

    }

    return (
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(seconds)
            .padStart(2, "0")
    );

}


function startStudyTimer() {

    stopStudyTimer();

    studyState.startTime =
        Date.now();

    updateStudyTimerDisplay();

    studyState.timerInterval =
        setInterval(
            function () {

                updateStudyTimerDisplay();

            },
            1000
        );

}


function stopStudyTimer() {

    if (
        studyState &&
        studyState.timerInterval
    ) {

        clearInterval(
            studyState.timerInterval
        );

    }

    if (studyState) {

        studyState.timerInterval =
            null;

    }

}


function getCurrentStudyDuration() {

    if (
        !studyState ||
        !studyState.startTime
    ) {

        return 0;

    }

    return Math.max(
        0,
        Date.now() -
        studyState.startTime
    );

}


function updateStudyTimerDisplay() {

    const elements =
        document.querySelectorAll(
            "[data-study-timer]"
        );

    const duration =
        getCurrentStudyDuration();

    elements.forEach(
        function (element) {

            element.textContent =
                formatStudyTime(
                    duration
                );

        }
    );

}

/* =========================================================
   Language Gym
   Application
   ========================================================= */

"use strict";


/* =========================================================
   CONSTANTS
   ========================================================= */


/* =========================================================
   DEFAULT DATA
   ========================================================= */



    version: 1,


/* =========================================================
   GLOBAL DATA
   ========================================================= */


/* =========================================================
   STUDY STATE
   ========================================================= */



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

function createDefaultData() {

    return {
        version: DEFAULT_DATA.version,

        settings: {
            ...DEFAULT_SETTINGS
        },

        decks: [],

        studyHistory: [],

        totalStudyTime: 0,

        totalAnswers: 0,

        totalCorrect: 0
    };

}


function normalizeCard(card) {

    if (!card || typeof card !== "object") {

        return {
            id: generateId("card"),
            front: "",
            back: "",
            example: "",
            note: "",
            createdAt: nowISO(),
            updatedAt: nowISO(),
            correct: 0,
            incorrect: 0
        };

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
                card.translation ??
                ""
            ),

        example:
            String(
                card.example ??
                ""
            ),

        note:
            String(
                card.note ??
                ""
            ),

        createdAt:
            card.createdAt ||
            nowISO(),

        updatedAt:
            card.updatedAt ||
            nowISO(),

        correct:
            Number(
                card.correct
            ) || 0,

        incorrect:
            Number(
                card.incorrect
            ) || 0
    };

}


function normalizeDeck(deck) {

    if (!deck || typeof deck !== "object") {

        return {

            id:
                generateId("deck"),

            name:
                "新しいデッキ",

            language:
                "zh",

            description:
                "",

            cards:
                [],

            createdAt:
                nowISO(),

            updatedAt:
                nowISO(),

            studyCount:
                0
        };

    }

    const cards =
        Array.isArray(deck.cards)
            ? deck.cards.map(
                normalizeCard
            )
            : [];

    return {

        id:
            deck.id ||
            generateId("deck"),

        name:
            String(
                deck.name ??
                "名称未設定"
            ),

        language:
            String(
                deck.language ??
                "zh"
            ),

        description:
            String(
                deck.description ??
                ""
            ),

        cards:

            cards,

        createdAt:
            deck.createdAt ||
            nowISO(),

        updatedAt:
            deck.updatedAt ||
            nowISO(),

        studyCount:
            Number(
                deck.studyCount
            ) || 0
    };

}


function normalizeHistoryItem(item) {

    if (!item || typeof item !== "object") {

        return {

            id:
                generateId("history"),

            deckId:
                null,

            date:
                nowISO(),

            duration:
                0,

            answers:
                0,

            correct:
                0
        };

    }

    return {

        id:
            item.id ||
            generateId("history"),

        deckId:
            item.deckId ??
            null,

        date:
            item.date ||
            nowISO(),

        duration:
            Number(
                item.duration
            ) || 0,

        answers:
            Number(
                item.answers
            ) || 0,

        correct:
            Number(
                item.correct
            ) || 0
    };

}


function normalizeData(data) {

    const source =
        data &&
        typeof data === "object"
            ? data
            : {};

    const settingsSource =
        source.settings &&
        typeof source.settings === "object"
            ? source.settings
            : {};

    const decks =
        Array.isArray(source.decks)
            ? source.decks.map(
                normalizeDeck
            )
            : [];

    const studyHistory =
        Array.isArray(
            source.studyHistory
        )
            ? source.studyHistory.map(
                normalizeHistoryItem
            )
            : [];

    return {

        version:
            Number(
                source.version
            ) || 1,

        settings: {

            ...DEFAULT_SETTINGS,

            ...settingsSource
        },

        decks:

            decks,

        studyHistory:

            studyHistory,

        totalStudyTime:
            Number(
                source.totalStudyTime
            ) || 0,

        totalAnswers:
            Number(
                source.totalAnswers
            ) || 0,

        totalCorrect:
            Number(
                source.totalCorrect
            ) || 0
    };

}


/* =========================================================
   LOAD / SAVE DATA
   ========================================================= */

function loadData() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!raw) {

            appData =
                createDefaultData();

            return appData;

        }

        const parsed =
            JSON.parse(raw);

        appData =
            normalizeData(
                parsed
            );

        return appData;

    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );

        appData =
            createDefaultData();

        return appData;

    }

}


function saveData() {

    try {

        if (!appData) {

            appData =
                createDefaultData();

        }

        appData =
            normalizeData(
                appData
            );

        const dataToSave =
            JSON.parse(
                JSON.stringify(
                    appData
                )
            );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                dataToSave
            )
        );

        try {

            localStorage.setItem(
                BACKUP_KEY,
                JSON.stringify(
                    dataToSave
                )
            );

        } catch (backupError) {

            console.warn(
                "自動バックアップ保存エラー:",
                backupError
            );

        }

        return true;

    } catch (error) {

        console.error(
            "データ保存エラー:",
            error
        );

        return false;

    }

}


/* =========================================================
   BACKUP
   ========================================================= */

function createBackupData() {

    if (!appData) {

        loadData();

    }

    return JSON.parse(
        JSON.stringify(
            appData
        )
    );

}


function restoreBackupData() {

    try {

        const raw =
            localStorage.getItem(
                BACKUP_KEY
            );

        if (!raw) {

            return false;

        }

        const parsed =
            JSON.parse(
                raw
            );

        appData =
            normalizeData(
                parsed
            );

        saveData();

        refreshAllUI();

        return true;

    } catch (error) {

        console.error(
            "バックアップ復元エラー:",
            error
        );

        return false;

    }

}


/* =========================================================
   DECK HELPERS
   ========================================================= */

function getDeckById(deckId) {

    if (!appData) {

        return null;

    }

    const decks =
        Array.isArray(
            appData.decks
        )
            ? appData.decks
            : [];

    return (
        decks.find(
            function (deck) {

                return (
                    deck.id ===
                    deckId
                );

            }
        ) ||
        null
    );

}


function getCurrentDeck() {

    if (
        !studyState ||
        !studyState.deckId
    ) {

        return null;

    }

    return getDeckById(
        studyState.deckId
    );

}


function getDeckCardCount(deck) {

    if (
        !deck ||
        !Array.isArray(
            deck.cards
        )
    ) {

        return 0;

    }

    return deck.cards.length;

}


function createDeck(
    name,
    language = "zh",
    description = ""
) {

    const deck = {

        id:
            generateId("deck"),

        name:
            String(
                name ||
                "新しいデッキ"
            ),

        language:
            String(
                language ||
                "zh"
            ),

        description:
            String(
                description ||
                ""
            ),

        cards:
            [],

        createdAt:
            nowISO(),

        updatedAt:
            nowISO(),

        studyCount:
            0
    };

    appData.decks.push(
        deck
    );

    saveData();

    return deck;

}


function addCardToDeck(
    deckId,
    front,
    back,
    example = "",
    note = ""
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return null;

    }

    if (
        !Array.isArray(
            deck.cards
        )
    ) {

        deck.cards = [];

    }

    const card = {

        id:
            generateId("card"),

        front:
            String(
                front ??
                ""
            ),

        back:
            String(
                back ??
                ""
            ),

        example:
            String(
                example ??
                ""
            ),

        note:
            String(
                note ??
                ""
            ),

        createdAt:
            nowISO(),

        updatedAt:
            nowISO(),

        correct:
            0,

        incorrect:
            0
    };

    deck.cards.push(
        card
    );

    deck.updatedAt =
        nowISO();

    saveData();

    return card;

}


function deleteCard(
    deckId,
    cardId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return false;

    }

    if (
        !Array.isArray(
            deck.cards
        )
    ) {

        return false;

    }

    const index =
        deck.cards.findIndex(
            function (card) {

                return (
                    card.id ===
                    cardId
                );

            }
        );

    if (index < 0) {

        return false;

    }

    deck.cards.splice(
        index,
        1
    );

    deck.updatedAt =
        nowISO();

    saveData();

    return true;

}


function deleteDeck(
    deckId
) {

    if (!appData) {

        return false;

    }

    const index =
        appData.decks.findIndex(
            function (deck) {

                return (
                    deck.id ===
                    deckId
                );

            }
        );

    if (index < 0) {

        return false;

    }

    appData.decks.splice(
        index,
        1
    );

    if (
        studyState.deckId ===
        deckId
    ) {

        stopStudyTimer();

        studyState = {

            deckId:
                null,

            cards:
                [],

            currentIndex:
                0,

            answered:
                false,

            startTime:
                null,

            timerInterval:
                null
        };

    }

    saveData();

    refreshAllUI();

    return true;

}


/* =========================================================
   STUDY TIME
   ========================================================= */

function formatStudyTime(
    milliseconds
) {

    const totalSeconds =
        Math.max(
            0,
            Math.floor(
                Number(
                    milliseconds
                ) / 1000
            )
        );

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (
                totalSeconds % 3600
            ) / 60
        );

    const seconds =
        totalSeconds % 60;

    if (hours > 0) {

        return (
            String(hours)
                .padStart(2, "0") +
            ":" +
            String(minutes)
                .padStart(2, "0") +
            ":" +
            String(seconds)
                .padStart(2, "0")
        );

    }

    return (
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(seconds)
            .padStart(2, "0")
    );

}


function startStudyTimer() {

    stopStudyTimer();

    studyState.startTime =
        Date.now();

    updateStudyTimerDisplay();

    studyState.timerInterval =
        setInterval(
            function () {

                updateStudyTimerDisplay();

            },
            1000
        );

}


function stopStudyTimer() {

    if (
        studyState &&
        studyState.timerInterval
    ) {

        clearInterval(
            studyState.timerInterval
        );

    }

    if (studyState) {

        studyState.timerInterval =
            null;

    }

}


function getCurrentStudyDuration() {

    if (
        !studyState ||
        !studyState.startTime
    ) {

        return 0;

    }

    return Math.max(
        0,
        Date.now() -
        studyState.startTime
    );

}


function updateStudyTimerDisplay() {

    const elements =
        document.querySelectorAll(
            "[data-study-timer]"
        );

    const duration =
        getCurrentStudyDuration();

    elements.forEach(
        function (element) {

            element.textContent =
                formatStudyTime(
                    duration
                );

        }
    );

}

/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(
    pageId
) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    pages.forEach(
        function (page) {

            page.classList.remove(
                "active"
            );

        }
    );

    const target =
        document.getElementById(
            pageId
        );

    if (target) {

        target.classList.add(
            "active"
        );

    }

    const navItems =
        document.querySelectorAll(
            "[data-page]"
        );

    navItems.forEach(
        function (item) {

            item.classList.remove(
                "active"
            );

            if (
                item.dataset.page ===
                pageId
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

    if (
        pageId ===
        "home-page"
    ) {

        renderHome();

    }

    if (
        pageId ===
        "decks-page"
    ) {

        renderDecks();

    }

    if (
        pageId ===
        "study-page"
    ) {

        renderStudyPage();

    }

    if (
        pageId ===
        "progress-page"
    ) {

        renderProgress();

    }

    if (
        pageId ===
        "import-page"
    ) {

        renderImportDeckSelect();

    }

    if (
        pageId ===
        "data-share-page"
    ) {

        renderDataShare();

    }

    if (
        pageId ===
        "settings-page"
    ) {

        renderSettings();

    }

}


/* =========================================================
   NAVIGATION HELPERS
   ========================================================= */

function getPageIdFromElement(
    element
) {

    if (!element) {

        return null;

    }

    return (
        element.dataset.page ||
        element.getAttribute(
            "data-target"
        ) ||
        element.getAttribute(
            "data-page"
        )
    );

}


function handleNavigationClick(
    event
) {

    const element =
        event.target.closest(
            "[data-page], [data-target]"
        );

    if (!element) {

        return;

    }

    const pageId =
        getPageIdFromElement(
            element
        );

    if (!pageId) {

        return;

    }

    event.preventDefault();

    showPage(
        pageId
    );

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (!sidebar) {

        return;

    }

    sidebar.classList.toggle(
        "open"
    );

}


/* =========================================================
   HOME
   ========================================================= */

function getGreeting() {

    const hour =
        new Date().getHours();

    if (
        hour < 5
    ) {

        return "こんばんは";

    }

    if (
        hour < 12
    ) {

        return "おはようございます";

    }

    if (
        hour < 18
    ) {

        return "こんにちは";

    }

    return "こんばんは";

}


function getDailyMessage() {

    const messages = [

        "今日も少しずつ積み重ねましょう。",

        "完璧じゃなくて大丈夫。1枚でも進めば前進です。",

        "昨日の自分より1つできることを増やしましょう。",

        "短い時間でも、集中した学習は力になります。",

        "Language Gymで今日のトレーニングを始めましょう。",

        "間違いは成長のデータです。",

        "今日もあなたのペースで大丈夫です。",

        "続けた分だけ、あとで大きな差になります。"

    ];

    const day =
        Math.floor(
            Date.now() /
            86400000
        );

    return messages[
        day %
        messages.length
    ];

}


function renderHome() {

    const greeting =
        document.getElementById(
            "greeting-message"
        );

    if (greeting) {

        greeting.textContent =
            getGreeting();

    }

    const dailyMessage =
        document.getElementById(
            "daily-message"
        );

    if (dailyMessage) {

        dailyMessage.textContent =
            getDailyMessage();

    }

    const deckCount =
        document.getElementById(
            "home-deck-count"
        );

    if (deckCount) {

        deckCount.textContent =
            String(
                appData.decks.length
            );

    }

    const cardCount =
        document.getElementById(
            "home-card-count"
        );

    if (cardCount) {

        cardCount.textContent =
            String(
                getTotalCardCount()
            );

    }

    const totalTime =
        document.getElementById(
            "home-study-time"
        );

    if (totalTime) {

        totalTime.textContent =
            formatStudyTime(
                appData.totalStudyTime
            );

    }

    const accuracy =
        document.getElementById(
            "home-accuracy"
        );

    if (accuracy) {

        accuracy.textContent =
            getOverallAccuracy() +
            "%";

    }

}


/* =========================================================
   STATISTICS
   ========================================================= */

function getTotalCardCount() {

    if (
        !appData ||
        !Array.isArray(
            appData.decks
        )
    ) {

        return 0;

    }

    return appData.decks.reduce(
        function (total, deck) {

            return (
                total +
                getDeckCardCount(
                    deck
                )
            );

        },
        0
    );

}


function getOverallAccuracy() {

    if (
        !appData ||
        appData.totalAnswers <= 0
    ) {

        return 0;

    }

    return Math.round(
        (
            appData.totalCorrect /
            appData.totalAnswers
        ) * 100
    );

}


function getDeckAccuracy(
    deck
) {

    if (
        !deck ||
        !Array.isArray(
            deck.cards
        )
    ) {

        return 0;

    }

    let answers = 0;

    let correct = 0;

    deck.cards.forEach(
        function (card) {

            const c =
                Number(
                    card.correct
                ) || 0;

            const i =
                Number(
                    card.incorrect
                ) || 0;

            correct += c;

            answers +=
                c + i;

        }
    );

    if (
        answers <= 0
    ) {

        return 0;

    }

    return Math.round(
        (
            correct /
            answers
        ) * 100
    );

}


/* =========================================================
   DECK RENDER
   ========================================================= */

function renderDecks() {

    const container =
        document.getElementById(
            "decks-container"
        );

    if (!container) {

        return;

    }

    if (
        !appData.decks.length
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    📚
                </div>

                <h3>
                    デッキがありません
                </h3>

                <p>
                    新しいデッキを作成して
                    学習を始めましょう。
                </p>

                <button
                    type="button"
                    class="primary-button"
                    data-action="create-deck"
                >
                    ＋ デッキを作成
                </button>

            </div>
        `;

        return;

    }

    container.innerHTML =
        appData.decks
            .map(
                function (deck) {

                    const cardCount =
                        getDeckCardCount(
                            deck
                        );

                    const accuracy =
                        getDeckAccuracy(
                            deck
                        );

                    return `
                        <div
                            class="deck-card"
                            data-deck-id="${escapeHTML(
                                deck.id
                            )}"
                        >

                            <div class="deck-card-header">

                                <div class="deck-icon">
                                    📚
                                </div>

                                <div class="deck-card-title">

                                    <h3>
                                        ${escapeHTML(
                                            deck.name
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            deck.description ||
                                            "説明なし"
                                        )}
                                    </p>

                                </div>

                            </div>

                            <div class="deck-card-stats">

                                <div>
                                    <span>
                                        カード
                                    </span>

                                    <strong>
                                        ${cardCount}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        正答率
                                    </span>

                                    <strong>
                                        ${accuracy}%
                                    </strong>
                                </div>

                            </div>

                            <div class="deck-card-actions">

                                <button
                                    type="button"
                                    class="primary-button"
                                    data-action="start-study"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
                                >
                                    学習する
                                </button>

                                <button
                                    type="button"
                                    class="secondary-button"
                                    data-action="edit-deck"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
                                >
                                    編集
                                </button>

                                <button
                                    type="button"
                                    class="danger-button"
                                    data-action="delete-deck"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
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
   CREATE DECK
   ========================================================= */

function promptCreateDeck() {

    const name =
        window.prompt(
            "デッキ名を入力してください。",
            ""
        );

    if (
        name === null
    ) {

        return;

    }

    const trimmedName =
        name.trim();

    if (!trimmedName) {

        alert(
            "デッキ名を入力してください。"
        );

        return;

    }

    const deck =
        createDeck(
            trimmedName
        );

    if (deck) {

        refreshAllUI();

        showPage(
            "decks-page"
        );

    }

}


/* =========================================================
   EDIT DECK
   ========================================================= */

function editDeck(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return;

    }

    const name =
        window.prompt(
            "デッキ名",
            deck.name
        );

    if (
        name === null
    ) {

        return;

    }

    const trimmedName =
        name.trim();

    if (!trimmedName) {

        alert(
            "デッキ名を入力してください。"
        );

        return;

    }

    deck.name =
        trimmedName;

    deck.updatedAt =
        nowISO();

    saveData();

    refreshAllUI();

}


/* =========================================================
   DELETE DECK CONFIRMATION
   ========================================================= */

function confirmDeleteDeck(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return;

    }

    const confirmed =
        window.confirm(
            "「" +
            deck.name +
            "」を削除しますか？\n\n" +
            "この操作は元に戻せません。"
        );

    if (!confirmed) {

        return;

    }

    deleteDeck(
        deckId
    );

}


/* =========================================================
   STUDY
   ========================================================= */

function prepareStudy(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return false;

    }

    if (
        !Array.isArray(
            deck.cards
        ) ||
        deck.cards.length === 0
    ) {

        alert(
            "このデッキにはカードがありません。"
        );

        return false;

    }

    let cards =
        deck.cards.map(
            normalizeCard
        );

    if (
        appData.settings.randomStudy
    ) {

        cards =
            shuffleArray(
                cards
            );

    }

    stopStudyTimer();

    studyState = {

        deckId:
            deck.id,

        cards:
            cards,

        currentIndex:
            0,

        answered:
            false,

        startTime:
            null,

        timerInterval:
            null
    };

    startStudyTimer();

    deck.studyCount =
        (
            Number(
                deck.studyCount
            ) || 0
        ) + 1;

    deck.updatedAt =
        nowISO();

    saveData();

    return true;

}


function startStudy(
    deckId
) {

    if (
        !prepareStudy(
            deckId
        )
    ) {

        return;

    }

    showPage(
        "study-page"
    );

    renderStudyPage();

}


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
                (
                    i + 1
                )
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
   STUDY PAGE
   ========================================================= */

function renderStudyPage() {

    const container =
        document.getElementById(
            "study-container"
        );

    if (!container) {

        return;

    }

    if (
        !studyState.deckId ||
        !Array.isArray(
            studyState.cards
        ) ||
        studyState.cards.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    🎯
                </div>

                <h3>
                    学習するデッキを選択してください
                </h3>

                <button
                    type="button"
                    class="primary-button"
                    data-page="decks-page"
                >
                    デッキ一覧へ
                </button>

            </div>
        `;

        updateStudyTimerDisplay();

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

    const total =
        studyState.cards.length;

    const current =
        studyState.currentIndex + 1;

    const progress =
        Math.round(
            (
                current /
                total
            ) * 100
        );

    container.innerHTML = `

        <div class="study-header">

            <div>

                <span class="study-progress-text">
                    ${current} / ${total}
                </span>

                <div class="study-progress-bar">

                    <div
                        class="study-progress-fill"
                        style="width: ${progress}%"
                    ></div>

                </div>

            </div>

            <div
                class="study-timer"
                data-study-timer
            >
                00:00
            </div>

        </div>


        <div class="flashcard">

            <div class="flashcard-front">

                <div class="flashcard-label">
                    問題
                </div>

                <div class="flashcard-text">
                    ${escapeHTML(
                        card.front
                    )}
                </div>

            </div>


            <div
                class="flashcard-back ${
                    studyState.answered
                        ? "visible"
                        : ""
                }"
            >

                <div class="flashcard-label">
                    答え
                </div>

                <div class="flashcard-text">
                    ${escapeHTML(
                        card.back
                    )}
                </div>

                ${
                    card.example
                        ? `
                            <div class="flashcard-example">

                                <strong>
                                    例文
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        card.example
                                    )}
                                </p>

                            </div>
                        `
                        : ""
                }

                ${
                    card.note
                        ? `
                            <div class="flashcard-note">

                                <strong>
                                    メモ
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        card.note
                                    )}
                                </p>

                            </div>
                        `
                        : ""
                }

            </div>

        </div>


        <div class="study-actions">

            ${
                !studyState.answered
                    ? `
                        <button
                            type="button"
                            class="primary-button large-button"
                            data-action="show-answer"
                        >
                            答えを見る
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="danger-button large-button"
                            data-action="answer-wrong"
                        >
                            ✕ 間違えた
                        </button>

                        <button
                            type="button"
                            class="success-button large-button"
                            data-action="answer-correct"
                        >
                            ✓ 正解
                        </button>
                    `
            }

        </div>


        <div class="study-secondary-actions">

            <button
                type="button"
                class="secondary-button"
                data-action="end-study"
            >
                学習を終了
            </button>

        </div>

    `;

    updateStudyTimerDisplay();

}


/* =========================================================
   SHOW ANSWER
   ========================================================= */

function showStudyAnswer() {

    if (
        studyState.answered
    ) {

        return;

    }

    studyState.answered =
        true;

    renderStudyPage();

    speakCardAnswer();

}


/* =========================================================
   ANSWER CARD
   ========================================================= */

function answerCard(
    isCorrect
) {

    if (
        !studyState.answered
    ) {

        return;

    }

    const currentCard =
        studyState.cards[
            studyState.currentIndex
        ];

    if (!currentCard) {

        return;

    }

    const deck =
        getCurrentDeck();

    if (!deck) {

        return;

    }

    const actualCard =
        deck.cards.find(
            function (card) {

                return (
                    card.id ===
                    currentCard.id
                );

            }
        );

    if (actualCard) {

        if (isCorrect) {

            actualCard.correct =
                (
                    Number(
                        actualCard.correct
                    ) || 0
                ) + 1;

        } else {

            actualCard.incorrect =
                (
                    Number(
                        actualCard.incorrect
                    ) || 0
                ) + 1;

        }

        actualCard.updatedAt =
            nowISO();

    }

    appData.totalAnswers += 1;

    if (isCorrect) {

        appData.totalCorrect += 1;

    }

    studyState.currentIndex += 1;

    studyState.answered =
        false;

    saveData();

    if (
        studyState.currentIndex >=
        studyState.cards.length
    ) {

        finishStudy();

        return;

    }

    renderStudyPage();

}


/* =========================================================
   FINISH STUDY
   ========================================================= */

function finishStudy() {

    stopStudyTimer();

    const duration =
        getCurrentStudyDuration();

    const deckId =
        studyState.deckId;

    let answers = 0;

    let correct = 0;

    if (
        studyState.cards &&
        studyState.cards.length
    ) {

        const completed =
            Math.min(
                studyState.currentIndex,
                studyState.cards.length
            );

        answers =
            completed;

        /*
         * 現在のセッション内の正解数を
         * 履歴用にカードの更新値から計算
         */

        const deck =
            getDeckById(
                deckId
            );

        if (deck) {

            studyState.cards
                .slice(
                    0,
                    completed
                )
                .forEach(
                    function (sessionCard) {

                        const actual =
                            deck.cards.find(
                                function (card) {

                                    return (
                                        card.id ===
                                        sessionCard.id
                                    );

                                }
                            );

                        if (
                            actual &&
                            Number(
                                actual.correct
                            ) > 0
                        ) {

                            /*
                             * 既存の累積値から
                             * セッション単位の正解数を
                             * 正確に切り出すのが難しいため、
                             * 現在の回答状態を利用する。
                             */

                        }

                    }
                );

        }

    }

    /*
     * セッション終了時の正答数は
     * グローバル集計値との差分を
     * 直接保存するのではなく、
     * studySessionCorrect を利用する。
     */

    const sessionCorrect =
        Number(
            studyState.sessionCorrect
        ) || 0;

    correct =
        sessionCorrect;

    addStudyHistory(
        deckId,
        duration,
        answers,
        correct
    );

    studyState = {

        deckId:
            null,

        cards:
            [],

        currentIndex:
            0,

        answered:
            false,

        startTime:
            null,

        timerInterval:
            null,

        sessionCorrect:
            0
    };

    saveData();

    refreshAllUI();

    const container =
        document.getElementById(
            "study-container"
        );

    if (container) {

        container.innerHTML = `

            <div class="study-complete">

                <div class="study-complete-icon">
                    🎉
                </div>

                <h2>
                    学習完了！
                </h2>

                <p>
                    お疲れさまでした。
                </p>

                <div class="study-complete-stats">

                    <div>

                        <span>
                            回答
                        </span>

                        <strong>
                            ${answers}
                        </strong>

                    </div>

                    <div>

                        <span>
                            正解
                        </span>

                        <strong>
                            ${correct}
                        </strong>

                    </div>

                    <div>

                        <span>
                            正答率
                        </span>

                        <strong>
                            ${
                                answers > 0
                                    ? Math.round(
                                        (
                                            correct /
                                            answers
                                        ) * 100
                                    )
                                    : 0
                            }%
                        </strong>

                    </div>

                    <div>

                        <span>
                            時間
                        </span>

                        <strong>
                            ${formatStudyTime(
                                duration
                            )}
                        </strong>

                    </div>

                </div>

                <button
                    type="button"
                    class="primary-button"
                    data-page="decks-page"
                >
                    デッキ一覧へ
                </button>

            </div>

        `;

    }

}


/* =========================================================
   END STUDY
   ========================================================= */

function endStudy() {

    const hasProgress =
        studyState &&
        studyState.currentIndex > 0;

    if (
        hasProgress
    ) {

        const confirmed =
            window.confirm(
                "現在の学習を終了しますか？"
            );

        if (!confirmed) {

            return;

        }

    }

    finishStudy();

}


/* =========================================================
   SPEECH
   ========================================================= */

function getSpeechLanguage(
    language
) {

    const map = {

        zh:
            "zh-CN",

        "zh-CN":
            "zh-CN",

        "zh-TW":
            "zh-TW",

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

        en:
            "en-US"

    };

    return (
        map[
            language
        ] ||
        "zh-CN"
    );

}


function speakText(
    text,
    language
) {

    if (
        typeof speechSynthesis ===
        "undefined"
    ) {

        return;

    }

    if (!text) {

        return;

    }

    try {

        speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(
                String(text)
            );

        utterance.lang =
            getSpeechLanguage(
                language ||
                appData.settings.learningLanguage
            );

        utterance.rate =
            clamp(
                Number(
                    appData.settings.voiceRate
                ) || 1,
                0.5,
                2
            );

        utterance.pitch =
            clamp(
                Number(
                    appData.settings.voicePitch
                ) || 1,
                0,
                2
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


function speakCardAnswer() {

    if (
        !appData.settings.autoVoice
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

    speakText(
        card.back,
        appData.settings.learningLanguage
    );

}


/* =========================================================
   SESSION CORRECT PATCH
   ========================================================= */

function recordStudyAnswer(
    isCorrect
) {

    if (
        typeof studyState.sessionCorrect !==
        "number"
    ) {

        studyState.sessionCorrect =
            0;

    }

    if (isCorrect) {

        studyState.sessionCorrect +=
            1;

    }

    answerCard(
        isCorrect
    );

}
/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    const container =
        document.getElementById(
            "progress-container"
        );

    if (!container) {

        return;

    }

    const totalCards =
        getTotalCardCount();

    const totalAnswers =
        Number(
            appData.totalAnswers
        ) || 0;

    const totalCorrect =
        Number(
            appData.totalCorrect
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

    container.innerHTML = `

        <div class="progress-summary">

            <div class="stat-card">

                <div class="stat-icon">
                    📚
                </div>

                <div class="stat-content">

                    <span>
                        デッキ数
                    </span>

                    <strong>
                        ${appData.decks.length}
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon">
                    🃏
                </div>

                <div class="stat-content">

                    <span>
                        総カード数
                    </span>

                    <strong>
                        ${totalCards}
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon">
                    ⏱️
                </div>

                <div class="stat-content">

                    <span>
                        累計学習時間
                    </span>

                    <strong>
                        ${formatStudyTime(
                            appData.totalStudyTime
                        )}
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon">
                    🎯
                </div>

                <div class="stat-content">

                    <span>
                        総正答率
                    </span>

                    <strong>
                        ${accuracy}%
                    </strong>

                </div>

            </div>

        </div>


        <div class="progress-section">

            <h3>
                デッキ別進捗
            </h3>

            ${
                appData.decks.length === 0
                    ? `
                        <div class="empty-state">

                            <p>
                                まだデッキがありません。
                            </p>

                        </div>
                    `
                    : `
                        <div class="deck-progress-list">

                            ${
                                appData.decks
                                    .map(
                                        function (deck) {

                                            const cardCount =
                                                getDeckCardCount(
                                                    deck
                                                );

                                            const deckAccuracy =
                                                getDeckAccuracy(
                                                    deck
                                                );

                                            return `

                                                <div class="deck-progress-item">

                                                    <div class="deck-progress-header">

                                                        <strong>
                                                            ${escapeHTML(
                                                                deck.name
                                                            )}
                                                        </strong>

                                                        <span>
                                                            ${cardCount} cards
                                                        </span>

                                                    </div>

                                                    <div class="progress-bar">

                                                        <div
                                                            class="progress-fill"
                                                            style="width: ${deckAccuracy}%"
                                                        ></div>

                                                    </div>

                                                    <div class="deck-progress-footer">

                                                        <span>
                                                            正答率
                                                        </span>

                                                        <strong>
                                                            ${deckAccuracy}%
                                                        </strong>

                                                    </div>

                                                </div>

                                            `;

                                        }
                                    )
                                    .join("")
                            }

                        </div>
                    `
            }

        </div>


        <div class="progress-section">

            <h3>
                学習履歴
            </h3>

            <div id="history-container"></div>

        </div>

    `;

    renderHistory();

}


/* =========================================================
   DATA SHARE
   ========================================================= */

function renderDataShare() {

    const container =
        document.getElementById(
            "data-share-container"
        );

    if (!container) {

        return;

    }

    container.innerHTML = `

        <div class="data-share-section">

            <div class="data-share-card">

                <div class="data-share-icon">
                    📤
                </div>

                <div class="data-share-content">

                    <h3>
                        データを書き出す
                    </h3>

                    <p>
                        Language Gymのデータを
                        JSONファイルとして保存します。
                    </p>

                    <button
                        type="button"
                        class="primary-button"
                        data-action="export-data"
                    >
                        JSONを書き出す
                    </button>

                </div>

            </div>


            <div class="data-share-card">

                <div class="data-share-icon">
                    📥
                </div>

                <div class="data-share-content">

                    <h3>
                        データを読み込む
                    </h3>

                    <p>
                        保存したJSONファイルから
                        データを復元します。
                    </p>

                    <input
                        type="file"
                        id="data-import-input"
                        accept=".json,application/json"
                        hidden
                    >

                    <button
                        type="button"
                        class="secondary-button"
                        data-action="import-data"
                    >
                        JSONを読み込む
                    </button>

                </div>

            </div>


            <div class="data-share-card">

                <div class="data-share-icon">
                    💾
                </div>

                <div class="data-share-content">

                    <h3>
                        自動バックアップ
                    </h3>

                    <p>
                        現在のデータをブラウザ内に
                        バックアップします。
                    </p>

                    <button
                        type="button"
                        class="secondary-button"
                        data-action="backup-data"
                    >
                        バックアップを作成
                    </button>

                    <button
                        type="button"
                        class="secondary-button"
                        data-action="restore-backup"
                    >
                        バックアップから復元
                    </button>

                </div>

            </div>


            <div class="data-share-card danger-card">

                <div class="data-share-icon">
                    ⚠️
                </div>

                <div class="data-share-content">

                    <h3>
                        データをリセット
                    </h3>

                    <p>
                        すべてのデッキ・カード・
                        学習履歴を削除します。
                    </p>

                    <button
                        type="button"
                        class="danger-button"
                        data-action="reset-data"
                    >
                        すべて削除
                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   EXPORT DATA
   ========================================================= */

function exportData() {

    if (!appData) {

        loadData();

    }

    try {

        const exportObject = {

            app:
                "Language Gym",

            version:
                appData.version,

            exportedAt:
                nowISO(),

            data:
                normalizeData(
                    appData
                )

        };

        const json =
            JSON.stringify(
                exportObject,
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
                .slice(
                    0,
                    10
                );

        link.href =
            url;

        link.download =
            "language-gym-" +
            date +
            ".json";

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

    } catch (error) {

        console.error(
            "データ書き出しエラー:",
            error
        );

        alert(
            "データを書き出せませんでした。"
        );

    }

}


/* =========================================================
   IMPORT DATA
   ========================================================= */

function triggerDataImport() {

    const input =
        document.getElementById(
            "data-import-input"
        );

    if (!input) {

        return;

    }

    input.value =
        "";

    input.click();

}


async function importDataFile(
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

        const parsed =
            JSON.parse(
                text
            );

        let importedData =
            parsed;

        /*
         * exportData() で作った形式
         */

        if (
            parsed &&
            typeof parsed === "object" &&
            parsed.data
        ) {

            importedData =
                parsed.data;

        }

        const normalized =
            normalizeData(
                importedData
            );

        const confirmed =
            window.confirm(
                "JSONデータを読み込みます。\n\n" +
                "現在のデータは上書きされます。"
            );

        if (!confirmed) {

            return;

        }

        appData =
            normalized;

        saveData();

        refreshAllUI();

        alert(
            "データを読み込みました。"
        );

    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );

        alert(
            "JSONデータを読み込めませんでした。\n" +
            (
                error.message ||
                ""
            )
        );

    }

}


/* =========================================================
   RESET DATA
   ========================================================= */

function resetAllData() {

    const confirmed =
        window.confirm(
            "すべてのデータを削除しますか？\n\n" +
            "デッキ、カード、学習履歴がすべて削除されます。\n" +
            "この操作は元に戻せません。"
        );

    if (!confirmed) {

        return;

    }

    const secondConfirmed =
        window.confirm(
            "本当に削除しますか？"
        );

    if (!secondConfirmed) {

        return;

    }

    stopStudyTimer();

    appData =
        createDefaultData();

    studyState = {

        deckId:
            null,

        cards:
            [],

        currentIndex:
            0,

        answered:
            false,

        startTime:
            null,

        timerInterval:
            null,

        sessionCorrect:
            0
    };

    try {

        localStorage.removeItem(
            STORAGE_KEY
        );

        localStorage.removeItem(
            BACKUP_KEY
        );

    } catch (error) {

        console.warn(
            "localStorage削除エラー:",
            error
        );

    }

    saveData();

    refreshAllUI();

    showPage(
        "home-page"
    );

    alert(
        "データを削除しました。"
    );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettings() {

    const container =
        document.getElementById(
            "settings-container"
        );

    if (!container) {

        return;

    }

    const settings =
        appData.settings;

    container.innerHTML = `

        <div class="settings-section">

            <h3>
                学習設定
            </h3>


            <div class="setting-item">

                <div class="setting-info">

                    <strong>
                        学習言語
                    </strong>

                    <span>
                        音声などで使用する言語
                    </span>

                </div>

                <select
                    id="learning-language-setting"
                >

                    <option
                        value="zh"
                        ${
                            settings.learningLanguage ===
                            "zh"
                                ? "selected"
                                : ""
                        }
                    >
                        中国語（簡体字）
                    </option>

                    <option
                        value="zh-TW"
                        ${
                            settings.learningLanguage ===
                            "zh-TW"
                                ? "selected"
                                : ""
                        }
                    >
                        中国語（繁体字）
                    </option>

                    <option
                        value="ko"
                        ${
                            settings.learningLanguage ===
                            "ko"
                                ? "selected"
                                : ""
                        }
                    >
                        韓国語
                    </option>

                    <option
                        value="de"
                        ${
                            settings.learningLanguage ===
                            "de"
                                ? "selected"
                                : ""
                        }
                    >
                        ドイツ語
                    </option>

                    <option
                        value="fr"
                        ${
                            settings.learningLanguage ===
                            "fr"
                                ? "selected"
                                : ""
                        }
                    >
                        フランス語
                    </option>

                    <option
                        value="es"
                        ${
                            settings.learningLanguage ===
                            "es"
                                ? "selected"
                                : ""
                        }
                    >
                        スペイン語
                    </option>

                    <option
                        value="it"
                        ${
                            settings.learningLanguage ===
                            "it"
                                ? "selected"
                                : ""
                        }
                    >
                        イタリア語
                    </option>

                </select>

            </div>


            <div class="setting-item">

                <div class="setting-info">

                    <strong>
                        ランダム学習
                    </strong>

                    <span>
                        学習開始時にカードをシャッフルします
                    </span>

                </div>

                <label class="switch">

                    <input
                        type="checkbox"
                        id="random-study-setting"
                        ${
                            settings.randomStudy
                                ? "checked"
                                : ""
                        }
                    >

                    <span class="slider"></span>

                </label>

            </div>

        </div>


        <div class="settings-section">

            <h3>
                音声設定
            </h3>


            <div class="setting-item">

                <div class="setting-info">

                    <strong>
                        自動音声
                    </strong>

                    <span>
                        答えを表示したときに自動で読み上げます
                    </span>

                </div>

                <label class="switch">

                    <input
                        type="checkbox"
                        id="auto-voice-setting"
                        ${
                            settings.autoVoice
                                ? "checked"
                                : ""
                        }
                    >

                    <span class="slider"></span>

                </label>

            </div>


            <div class="setting-item">

                <div class="setting-info">

                    <strong>
                        音声速度
                    </strong>

                    <span
                        id="voice-rate-value"
                    >
                        ${Number(
                            settings.voiceRate
                        ).toFixed(1)}
                    </span>

                </div>

                <input
                    type="range"
                    id="voice-rate-setting"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value="${Number(
                        settings.voiceRate
                    )}"
                >

            </div>


            <div class="setting-item">

                <div class="setting-info">

                    <strong>
                        音声ピッチ
                    </strong>

                    <span
                        id="voice-pitch-value"
                    >
                        ${Number(
                            settings.voicePitch
                        ).toFixed(1)}
                    </span>

                </div>

                <input
                    type="range"
                    id="voice-pitch-setting"
                    min="0"
                    max="2"
                    step="0.1"
                    value="${Number(
                        settings.voicePitch
                    )}"
                >

            </div>

        </div>


        <div class="settings-section">

            <h3>
                外観
            </h3>


            <div class="setting-item">

                <div class="setting-info">

                    <strong>
                        テーマカラー
                    </strong>

                    <span>
                        アプリのメインカラー
                    </span>

                </div>

                <input
                    type="color"
                    id="theme-color-setting"
                    value="${escapeHTML(
                        settings.customColor
                    )}"
                >

            </div>

        </div>

    `;

    applyThemeColor(
        settings.customColor
    );

}


/* =========================================================
   SETTINGS UPDATE
   ========================================================= */

function updateSettingsFromUI() {

    if (!appData) {

        return;

    }

    const languageSelect =
        document.getElementById(
            "learning-language-setting"
        );

    if (languageSelect) {

        appData.settings.learningLanguage =
            languageSelect.value;

    }

    const randomStudy =
        document.getElementById(
            "random-study-setting"
        );

    if (randomStudy) {

        appData.settings.randomStudy =
            Boolean(
                randomStudy.checked
            );

    }

    const autoVoice =
        document.getElementById(
            "auto-voice-setting"
        );

    if (autoVoice) {

        appData.settings.autoVoice =
            Boolean(
                autoVoice.checked
            );

    }

    const voiceRate =
        document.getElementById(
            "voice-rate-setting"
        );

    if (voiceRate) {

        appData.settings.voiceRate =
            Number(
                voiceRate.value
            ) || 1;

    }

    const voicePitch =
        document.getElementById(
            "voice-pitch-setting"
        );

    if (voicePitch) {

        appData.settings.voicePitch =
            Number(
                voicePitch.value
            ) || 1;

    }

    const themeColor =
        document.getElementById(
            "theme-color-setting"
        );

    if (themeColor) {

        appData.settings.customColor =
            themeColor.value;

    }

    saveData();

    applyThemeColor(
        appData.settings.customColor
    );

    updateVoiceSettingLabels();

}


/* =========================================================
   VOICE SETTING LABELS
   ========================================================= */

function updateVoiceSettingLabels() {

    const rateInput =
        document.getElementById(
            "voice-rate-setting"
        );

    const rateValue =
        document.getElementById(
            "voice-rate-value"
        );

    if (
        rateInput &&
        rateValue
    ) {

        rateValue.textContent =
            Number(
                rateInput.value
            ).toFixed(1);

    }

    const pitchInput =
        document.getElementById(
            "voice-pitch-setting"
        );

    const pitchValue =
        document.getElementById(
            "voice-pitch-value"
        );

    if (
        pitchInput &&
        pitchValue
    ) {

        pitchValue.textContent =
            Number(
                pitchInput.value
            ).toFixed(1);

    }

}


/* =========================================================
   THEME
   ========================================================= */

function applyThemeColor(
    color
) {

    if (!color) {

        return;

    }

    const root =
        document.documentElement;

    root.style.setProperty(
        "--primary-color",
        color
    );

    /*
     * 明るさに応じて補助色を作成
     */

    const rgb =
        hexToRGB(
            color
        );

    if (rgb) {

        const lighter =
            mixColors(
                color,
                "#ffffff",
                0.85
            );

        const darker =
            mixColors(
                color,
                "#000000",
                0.15
            );

        root.style.setProperty(
            "--primary-light",
            lighter
        );

        root.style.setProperty(
            "--primary-dark",
            darker
        );

    }

}


function hexToRGB(
    hex
) {

    if (
        typeof hex !==
        "string"
    ) {

        return null;

    }

    const normalized =
        hex.replace(
            "#",
            ""
        );

    if (
        normalized.length !== 6
    ) {

        return null;

    }

    const number =
        parseInt(
            normalized,
            16
        );

    if (
        Number.isNaN(
            number
        )
    ) {

        return null;

    }

    return {

        r:
            (number >> 16) &
            255,

        g:
            (number >> 8) &
            255,

        b:
            number &
            255

    };

}


function mixColors(
    color1,
    color2,
    amount
) {

    const a =
        hexToRGB(
            color1
        );

    const b =
        hexToRGB(
            color2
        );

    if (!a || !b) {

        return color1;

    }

    const ratio =
        clamp(
            amount,
            0,
            1
        );

    const r =
        Math.round(
            a.r +
            (
                b.r -
                a.r
            ) *
            ratio
        );

    const g =
        Math.round(
            a.g +
            (
                b.g -
                a.g
            ) *
            ratio
        );

    const bl =
        Math.round(
            a.b +
            (
                b.b -
                a.b
            ) *
            ratio
        );

    return (
        "#" +
        [r, g, bl]
            .map(
                function (value) {

                    return value
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        );

                }
            )
            .join("")
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function searchCards(
    query
) {

    const normalizedQuery =
        String(
            query ||
            ""
        )
            .trim()
            .toLowerCase();

    if (!normalizedQuery) {

        return [];

    }

    const results = [];

    appData.decks.forEach(
        function (deck) {

            deck.cards.forEach(
                function (card) {

                    const front =
                        String(
                            card.front ||
                            ""
                        ).toLowerCase();

                    const back =
                        String(
                            card.back ||
                            ""
                        ).toLowerCase();

                    const example =
                        String(
                            card.example ||
                            ""
                        ).toLowerCase();

                    const note =
                        String(
                            card.note ||
                            ""
                        ).toLowerCase();

                    if (
                        front.includes(
                            normalizedQuery
                        ) ||
                        back.includes(
                            normalizedQuery
                        ) ||
                        example.includes(
                            normalizedQuery
                        ) ||
                        note.includes(
                            normalizedQuery
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

    return results;

}


/* =========================================================
   SEARCH RENDER
   ========================================================= */

function renderSearchResults(
    query
) {

    const container =
        document.getElementById(
            "search-results"
        );

    if (!container) {

        return;

    }

    const results =
        searchCards(
            query
        );

    if (
        results.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    🔍
                </div>

                <p>
                    該当するカードがありません。
                </p>

            </div>
        `;

        return;

    }

    container.innerHTML =
        results
            .map(
                function (result) {

                    return `

                        <div class="search-result-card">

                            <div class="search-result-deck">

                                📚
                                ${escapeHTML(
                                    result.deck.name
                                )}

                            </div>

                            <div class="search-result-front">

                                ${escapeHTML(
                                    result.card.front
                                )}

                            </div>

                            <div class="search-result-back">

                                ${escapeHTML(
                                    result.card.back
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   GLOBAL SEARCH
   ========================================================= */

function handleSearchInput(
    event
) {

    const query =
        event.target.value;

    renderSearchResults(
        query
    );

}


    renderHistory();


/* =========================================================
   DATA SHARE
   ========================================================= */

function renderDataShare() {

    const container =
        document.getElementById(
            "data-share-container"
        );

    if (!container) {

        return;

    }

    container.innerHTML = `


/* =========================================================
   EXPORT DATA
   ========================================================= */

function exportData() {

    if (!appData) {

        loadData();

    }

    try {

        const exportObject = {

            app:
                "Language Gym",

            version:
                appData.version,

            exportedAt:
                nowISO(),

            data:
                normalizeData(
                    appData
                )

        };

        const json =
            JSON.stringify(
                exportObject,
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
                .slice(
                    0,
                    10
                );

        link.href =
            url;

        link.download =
            "language-gym-" +
            date +
            ".json";

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

    } catch (error) {

        console.error(
            "データ書き出しエラー:",
            error
        );

        alert(
            "データを書き出せませんでした。"
        );

    }

}


/* =========================================================
   IMPORT DATA
   ========================================================= */

function triggerDataImport() {

    const input =
        document.getElementById(
            "data-import-input"
        );

    if (!input) {

        return;

    }

    input.value =
        "";

    input.click();

}


async function importDataFile(
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

        const parsed =
            JSON.parse(
                text
            );

        let importedData =
            parsed;

        /*
         * exportData() で作った形式
         */

        if (
            parsed &&
            typeof parsed === "object" &&
            parsed.data
        ) {

            importedData =
                parsed.data;

        }

        const normalized =
            normalizeData(
                importedData
            );

        const confirmed =
            window.confirm(
                "JSONデータを読み込みます。\n\n" +
                "現在のデータは上書きされます。"
            );

        if (!confirmed) {

            return;

        }

        appData =
            normalized;

        saveData();

        refreshAllUI();

        alert(
            "データを読み込みました。"
        );

    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );

        alert(
            "JSONデータを読み込めませんでした。\n" +
            (
                error.message ||
                ""
            )
        );

    }

}


/* =========================================================
   RESET DATA
   ========================================================= */

function resetAllData() {

    const confirmed =
        window.confirm(
            "すべてのデータを削除しますか？\n\n" +
            "デッキ、カード、学習履歴がすべて削除されます。\n" +
            "この操作は元に戻せません。"
        );

    if (!confirmed) {

        return;

    }

    const secondConfirmed =
        window.confirm(
            "本当に削除しますか？"
        );

    if (!secondConfirmed) {

        return;

    }

    stopStudyTimer();

    appData =
        createDefaultData();

    studyState = {

        deckId:
            null,

        cards:
            [],

        currentIndex:
            0,

        answered:
            false,

        startTime:
            null,

        timerInterval:
            null,

        sessionCorrect:
            0
    };

    try {

        localStorage.removeItem(
            STORAGE_KEY
        );

        localStorage.removeItem(
            BACKUP_KEY
        );

    } catch (error) {

        console.warn(
            "localStorage削除エラー:",
            error
        );

    }

    saveData();

    refreshAllUI();

    showPage(
        "home-page"
    );

    alert(
        "データを削除しました。"
    );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettings() {

    const container =
        document.getElementById(
            "settings-container"
        );

    if (!container) {

        return;

    }

    const settings =
        appData.settings;

    container.innerHTML = `




    `;

    applyThemeColor(
        settings.customColor
    );

}


/* =========================================================
   SETTINGS UPDATE
   ========================================================= */

function updateSettingsFromUI() {

    if (!appData) {

        return;

    }

    const languageSelect =
        document.getElementById(
            "learning-language-setting"
        );

    if (languageSelect) {

        appData.settings.learningLanguage =
            languageSelect.value;

    }

    const randomStudy =
        document.getElementById(
            "random-study-setting"
        );

    if (randomStudy) {

        appData.settings.randomStudy =
            Boolean(
                randomStudy.checked
            );

    }

    const autoVoice =
        document.getElementById(
            "auto-voice-setting"
        );

    if (autoVoice) {

        appData.settings.autoVoice =
            Boolean(
                autoVoice.checked
            );

    }

    const voiceRate =
        document.getElementById(
            "voice-rate-setting"
        );

    if (voiceRate) {

        appData.settings.voiceRate =
            Number(
                voiceRate.value
            ) || 1;

    }

    const voicePitch =
        document.getElementById(
            "voice-pitch-setting"
        );

    if (voicePitch) {

        appData.settings.voicePitch =
            Number(
                voicePitch.value
            ) || 1;

    }

    const themeColor =
        document.getElementById(
            "theme-color-setting"
        );

    if (themeColor) {

        appData.settings.customColor =
            themeColor.value;

    }

    saveData();

    applyThemeColor(
        appData.settings.customColor
    );

    updateVoiceSettingLabels();

}


/* =========================================================
   VOICE SETTING LABELS
   ========================================================= */

function updateVoiceSettingLabels() {

    const rateInput =
        document.getElementById(
            "voice-rate-setting"
        );

    const rateValue =
        document.getElementById(
            "voice-rate-value"
        );

    if (
        rateInput &&
        rateValue
    ) {

        rateValue.textContent =
            Number(
                rateInput.value
            ).toFixed(1);

    }

    const pitchInput =
        document.getElementById(
            "voice-pitch-setting"
        );

    const pitchValue =
        document.getElementById(
            "voice-pitch-value"
        );

    if (
        pitchInput &&
        pitchValue
    ) {

        pitchValue.textContent =
            Number(
                pitchInput.value
            ).toFixed(1);

    }

}


/* =========================================================
   THEME
   ========================================================= */

function applyThemeColor(
    color
) {

    if (!color) {

        return;

    }

    const root =
        document.documentElement;

    root.style.setProperty(
        "--primary-color",
        color
    );

    /*
     * 明るさに応じて補助色を作成
     */

    const rgb =
        hexToRGB(
            color
        );

    if (rgb) {

        const lighter =
            mixColors(
                color,
                "#ffffff",
                0.85
            );

        const darker =
            mixColors(
                color,
                "#000000",
                0.15
            );

        root.style.setProperty(
            "--primary-light",
            lighter
        );

        root.style.setProperty(
            "--primary-dark",
            darker
        );

    }

}


function hexToRGB(
    hex
) {

    if (
        typeof hex !==
        "string"
    ) {

        return null;

    }

    const normalized =
        hex.replace(
            "#",
            ""
        );

    if (
        normalized.length !== 6
    ) {

        return null;

    }

    const number =
        parseInt(
            normalized,
            16
        );

    if (
        Number.isNaN(
            number
        )
    ) {

        return null;

    }

    return {

        r:
            (number >> 16) &
            255,

        g:
            (number >> 8) &
            255,

        b:
            number &
            255

    };

}


function mixColors(
    color1,
    color2,
    amount
) {

    const a =
        hexToRGB(
            color1
        );

    const b =
        hexToRGB(
            color2
        );

    if (!a || !b) {

        return color1;

    }

    const ratio =
        clamp(
            amount,
            0,
            1
        );

    const r =
        Math.round(
            a.r +
            (
                b.r -
                a.r
            ) *
            ratio
        );

    const g =
        Math.round(
            a.g +
            (
                b.g -
                a.g
            ) *
            ratio
        );

    const bl =
        Math.round(
            a.b +
            (
                b.b -
                a.b
            ) *
            ratio
        );

    return (
        "#" +
        [r, g, bl]
            .map(
                function (value) {

                    return value
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        );

                }
            )
            .join("")
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function searchCards(
    query
) {

    const normalizedQuery =
        String(
            query ||
            ""
        )
            .trim()
            .toLowerCase();

    if (!normalizedQuery) {

        return [];

    }

    const results = [];

    appData.decks.forEach(
        function (deck) {

            deck.cards.forEach(
                function (card) {

                    const front =
                        String(
                            card.front ||
                            ""
                        ).toLowerCase();

                    const back =
                        String(
                            card.back ||
                            ""
                        ).toLowerCase();

                    const example =
                        String(
                            card.example ||
                            ""
                        ).toLowerCase();

                    const note =
                        String(
                            card.note ||
                            ""
                        ).toLowerCase();

                    if (
                        front.includes(
                            normalizedQuery
                        ) ||
                        back.includes(
                            normalizedQuery
                        ) ||
                        example.includes(
                            normalizedQuery
                        ) ||
                        note.includes(
                            normalizedQuery
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

    return results;

}


/* =========================================================
   SEARCH RENDER
   ========================================================= */

function renderSearchResults(
    query
) {

    const container =
        document.getElementById(
            "search-results"
        );

    if (!container) {

        return;

    }

    const results =
        searchCards(
            query
        );

    if (
        results.length === 0
    ) {

        container.innerHTML = `

        `;

        return;

    }

    container.innerHTML =
        results
            .map(
                function (result) {

                    return `


                }
        


/* =========================================================
   GLOBAL SEARCH
   ========================================================= */

function handleSearchInput(
    event
) {

    const query =
        event.target.value;

    renderSearchResults(
        query
    );

}



/* =========================================
   NORMALIZE IMPORTED DATA - CONTINUED
   ========================================= */

    /*
     * settings
     */




    /*
     * statistics
     */


    /*
     * studyHistory
     */

    
                



/* =========================================
   IMPORT JSON FILE
   ========================================= */

async function importDataJSON(
    file
) {

    if (!file) {

        return;

    }

    try {

        const text =
            await file.text();

        const imported =
            JSON.parse(
                text
            );

        const validation =
            validateImportedData(
                imported
            );

        if (
            !validation.valid
        ) {

            showStatus(
                validation.message,
                "error"
            );

            return;

        }


        const normalized =
            normalizeImportedData(
                imported
            );


        const confirmed =
            window.confirm(
                "現在のデータを上書きして、\n" +
                "JSONデータを読み込みますか？"
            );


        if (!confirmed) {

            return;

        }


        appData =
            normalized;


        saveData();


        refreshAllUI();


        showStatus(
            "データを読み込みました。",
            "success"
        );


        alert(
            "Language Gymのデータを読み込みました。"
        );


    } catch (error) {

        console.error(
            "Import JSON error:",
            error
        );


        showStatus(
            "JSONデータの読み込みに失敗しました。",
            "error"
        );


        alert(
            "JSONデータの読み込みに失敗しました。"
        );

    }

}


/* =========================================
   DATA SHARE FILE INPUT
   ========================================= */

function setupDataShareEvents() {

    const input =
        document.getElementById(
            "json-file-input"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "change",
        async function (event) {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;

            }


            await importDataJSON(
                file
            );


            /*
             * 同じファイルを
             * 再度選択できるようにする
             */

            input.value =
                "";

        }
    );

}


/* =========================================
   BACKUP
   ========================================= */

function createBackup() {

    try {

        localStorage.setItem(
            BACKUP_KEY,
            JSON.stringify(
                appData
            )
        );


        localStorage.setItem(
            BACKUP_DATE_KEY,
            nowISO()
        );


        showStatus(
            "バックアップを作成しました。",
            "success"
        );


    } catch (error) {

        console.error(
            "Backup error:",
            error
        );


        showStatus(
            "バックアップの作成に失敗しました。",
            "error"
        );

    }

}


/* =========================================
   RESTORE BACKUP
   ========================================= */

function restoreBackup() {

    try {

        const backup =
            localStorage.getItem(
                BACKUP_KEY
            );


        if (!backup) {

            alert(
                "バックアップがありません。"
            );

            return;

        }


        const parsed =
            JSON.parse(
                backup
            );


        const validation =
            validateImportedData(
                parsed
            );


        if (
            !validation.valid
        ) {

            alert(
                "バックアップデータが壊れています。"
            );

            return;

        }


        const confirmed =
            window.confirm(
                "バックアップから復元しますか？\n\n" +
                "現在のデータは上書きされます。"
            );


        if (!confirmed) {

            return;

        }


        appData =
            normalizeImportedData(
                parsed
            );


        saveData();


        refreshAllUI();


        showStatus(
            "バックアップを復元しました。",
            "success"
        );


    } catch (error) {

        console.error(
            "Backup restore error:",
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

function createId(
    prefix
) {

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

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   PAGE NAVIGATION
   ========================================= */

function showPage(
    pageName
) {

    const page =
        document.getElementById(
            "page-" +
            pageName
        );


    if (!page) {

        console.warn(
            "Page not found:",
            pageName
        );

        return;

    }


    document
        .querySelectorAll(
            ".page"
        )
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
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.page ===
                    pageName
                );

            }
        );

        pageName;


    updateHeader();


    if (
        pageName ===
        "home"
    ) {

        renderHome();

    }


    if (
        pageName ===
        "decks"
    ) {

        renderDecks();

        renderCardSearchResults(
            ""
        );

    }


    if (
        pageName ===
        "progress"
    ) {

        renderProgress();

    }


    if (
        pageName ===
        "import"
    ) {

        renderImportDeckSelect();

    }


    if (
        pageName ===
        "data-share"
    ) {

        renderDataShare();

    }


    if (
        pageName ===
        "settings"
    ) {

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
        appData.settings &&
        appData.settings.learningLanguage;


    header.textContent =
        languageNames[
            language
        ] ||
        "Language Gym";

}

/* =========================================
   CARD SEARCH
   ========================================= */

function searchAllCards(
    keyword
) {

    const query =
        String(
            keyword || ""
        )
            .trim()
            .toLowerCase();

    if (!query) {

        return [];

    }

    const results = [];

    appData.decks.forEach(
        function (deck) {

            if (
                !Array.isArray(
                    deck.cards
                )
            ) {

                return;

            }

            deck.cards.forEach(
                function (card) {

                    const front =
                        String(
                            card.front || ""
                        ).toLowerCase();

                    const back =
                        String(
                            card.back || ""
                        ).toLowerCase();

                    const example =
                        String(
                            card.example || ""
                        ).toLowerCase();

                    const note =
                        String(
                            card.note || ""
                        ).toLowerCase();

                    if (
                        front.includes(query) ||
                        back.includes(query) ||
                        example.includes(query) ||
                        note.includes(query)
                    ) {

                        results.push({
                            deck: deck,
                            card: card
                        });

                    }

                }
            );

        }
    );

    return results;

}


/* =========================================
   RENDER CARD SEARCH RESULTS
   ========================================= */

function renderCardSearchResults(
    keyword
) {

    const container =
        document.getElementById(
            "card-search-results"
        );

    if (!container) {

        return;

    }

    const query =
        String(
            keyword || ""
        ).trim();

    if (!query) {

        container.innerHTML =
            "";

        return;

    }

    const results =
        searchAllCards(
            query
        );

    if (
        results.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🔍
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

    container.innerHTML =
        results
            .map(
                function (result) {

                    return `

                        <div class="search-result-card">

                            <div class="search-result-header">

                                <span>
                                    📚
                                    ${escapeHTML(
                                        result.deck.name
                                    )}
                                </span>

                            </div>

                            <div class="search-result-front">

                                ${escapeHTML(
                                    result.card.front
                                )}

                            </div>

                            <div class="search-result-back">

                                ${escapeHTML(
                                    result.card.back
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================
   IMPORT PAGE
   ========================================= */

function renderImportDeckSelect() {

    const select =
        document.getElementById(
            "import-deck-select"
        );

    if (!select) {

        return;

    }

    select.innerHTML = `

        <option value="">
            新しいデッキを作成
        </option>

        ${
            appData.decks
                .map(
                    function (deck) {

                        return `

                            <option
                                value="${escapeHTML(
                                    deck.id
                                )}"
                            >
                                ${escapeHTML(
                                    deck.name
                                )}
                            </option>

                        `;

                    }
                )
                .join("")
        }

    `;

}


/* =========================================
   IMPORT LANGUAGE
   ========================================= */

function getSelectedImportLanguage() {

    const select =
        document.getElementById(
            "import-language-select"
        );

    if (!select) {

        return (
            appData.settings.learningLanguage ||
            "zh"
        );

    }

    return (
        select.value ||
        appData.settings.learningLanguage ||
        "zh"
    );

}


/* =========================================
   FILE TYPE
   ========================================= */

function getFileExtension(
    fileName
) {

    const name =
        String(
            fileName || ""
        );

    const index =
        name.lastIndexOf(
            "."
        );

    if (
        index === -1
    ) {

        return "";

    }

    return name
        .slice(
            index + 1
        )
        .toLowerCase();

}


/* =========================================
   IMPORT FILE
   ========================================= */

async function handleImportFile(
    file
) {

    if (!file) {

        return;

    }

    const extension =
        getFileExtension(
            file.name
        );

    try {

        if (
            extension === "json"
        ) {

            await importDataJSON(
                file
            );

            return;

        }

        if (
            extension === "txt" ||
            extension === "csv"
        ) {

            const text =
                await file.text();

            importTextData(
                text,
                extension
            );

            return;

        }

        if (
            extension === "pdf"
        ) {

            await importPDFFile(
                file
            );

            return;

        }

        alert(
            "対応していないファイル形式です。"
        );

    } catch (error) {

        console.error(
            "File import error:",
            error
        );

        alert(
            "ファイルの読み込みに失敗しました。"
        );

    }

}


/* =========================================
   TEXT IMPORT
   ========================================= */

function importTextData(
    text,
    extension
) {

    if (
        !text ||
        !text.trim()
    ) {

        alert(
            "ファイルにデータがありません。"
        );

        return;

    }

    const deckId =
        getImportDeckId();

    let deck =
        deckId
            ? getDeckById(
                deckId
            )
            : null;

    if (!deck) {

        const deckName =
            getImportDeckName();

        if (!deckName) {

            return;

        }

        deck =
            createDeck(
                deckName,
                getSelectedImportLanguage()
            );

    }

    if (!deck) {

        return;

    }

    const rows =
        extension === "csv"
            ? parseCSV(
                text
            )
            : parseTXT(
                text
            );

    if (
        rows.length === 0
    ) {

        alert(
            "カードとして読み込めるデータがありません。"
        );

        return;

    }

    let importedCount =
        0;

    rows.forEach(
        function (row) {

            if (
                !row.front &&
                !row.back
            ) {

                return;

            }

            const card =
                createCard(
                    row.front,
                    row.back,
                    row.example || "",
                    row.note || ""
                );

            deck.cards.push(
                card
            );

            importedCount +=
                1;

        }
    );

    deck.updatedAt =
        nowISO();

    saveData();

    refreshAllUI();

    alert(
        importedCount +
        "枚のカードを読み込みました。"
    );

}


/* =========================================
   IMPORT DECK ID
   ========================================= */

function getImportDeckId() {

    const select =
        document.getElementById(
            "import-deck-select"
        );

    if (!select) {

        return "";

    }

    return select.value || "";

}


/* =========================================
   IMPORT DECK NAME
   ========================================= */

function getImportDeckName() {

    const input =
        document.getElementById(
            "import-deck-name"
        );

    if (
        input &&
        input.value.trim()
    ) {

        return input.value.trim();

    }

    const name =
        window.prompt(
            "新しいデッキ名を入力してください。",
            ""
        );

    if (
        name === null
    ) {

        return "";

    }

    return name.trim();

}


/* =========================================
   TXT PARSER
   ========================================= */

function parseTXT(
    text
) {

    const lines =
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
            )
            .split(
                "\n"
            );

    const rows = [];

    lines.forEach(
        function (line) {

            const value =
                line.trim();

            if (!value) {

                return;

            }

            let front = "";

            let back = "";

            /*
             * タブ区切り
             */

            if (
                value.includes("\t")
            ) {

                const parts =
                    value.split(
                        "\t"
                    );

                front =
                    parts[0] ||
                    "";

                back =
                    parts.slice(
                        1
                    ).join("\t");

            }

            /*
             * | 区切り
             */

            else if (
                value.includes("|")
            ) {

                const parts =
                    value.split(
                        "|"
                    );

                front =
                    parts.shift() ||
                    "";

                back =
                    parts.join("|");

            }

            /*
             * カンマ区切り
             */

            else if (
                value.includes(",")
            ) {

                const parts =
                    parseCSVLine(
                        value
                    );

                front =
                    parts[0] ||
                    "";

                back =
                    parts
                        .slice(1)
                        .join(",");

            }

            /*
             * 区切りがない場合
             */

            else {

                front =
                    value;

                back =
                    "";

            }

            rows.push({

                front:
                    front.trim(),

                back:
                    back.trim(),

                example:
                    "",

                note:
                    ""

            });

        }
    );

    return rows;

}


/* =========================================
   CSV PARSER
   ========================================= */

function parseCSV(
    text
) {

    const lines =
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
            )
            .split(
                "\n"
            );

    const rows = [];

    lines.forEach(
        function (line) {

            if (
                !line.trim()
            ) {

                return;

            }

            const columns =
                parseCSVLine(
                    line
                );

            if (
                columns.length < 2
            ) {

                return;

            }

            rows.push({

                front:
                    String(
                        columns[0] || ""
                    ).trim(),

                back:
                    String(
                        columns[1] || ""
                    ).trim(),

                example:
                    String(
                        columns[2] || ""
                    ).trim(),

                note:
                    String(
                        columns[3] || ""
                    ).trim()

            });

        }
    );

    return rows;

}


/* =========================================
   CSV LINE
   ========================================= */

function parseCSVLine(
    line
) {

    const result = [];

    let current =
        "";

    let quoted =
        false;

    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const char =
            line[i];

        if (
            char === '"'
        ) {

            if (
                quoted &&
                line[i + 1] === '"'
            ) {

                current +=
                    '"';

                i += 1;

            } else {

                quoted =
                    !quoted;

            }

            continue;

        }

        if (
            char === "," &&
            !quoted
        ) {

            result.push(
                current
            );

            current =
                "";

            continue;

        }

        current +=
            char;

    }

    result.push(
        current
    );

    return result;

}


/* =========================================
   IMPORT PDF
   ========================================= */

async function importPDFFile(
    file
) {

    if (!file) {

        return;

    }

    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        alert(
            "PDF読み込み機能が利用できません。\n" +
            "PDF.jsが読み込まれているか確認してください。"
        );

        return;

    }

    try {

        const arrayBuffer =
            await file.arrayBuffer();

        const pdf =
            await pdfjsLib
                .getDocument({
                    data:
                        arrayBuffer
                })
                .promise;

        let fullText =
            "";

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

                            return (
                                item.str ||
                                ""
                            );

                        }
                    )
                    .join(" ");

            fullText +=
                pageText +
                "\n";

        }

        if (
            !fullText.trim()
        ) {

            alert(
                "PDFから文字を取得できませんでした。\n\n" +
                "画像だけのPDFの場合はOCRが必要です。"
            );

            return;

        }

        importTextData(
            fullText,
            "txt"
        );

    } catch (error) {

        console.error(
            "PDF import error:",
            error
        );

        alert(
            "PDFの読み込みに失敗しました。"
        );

    }

}


/* =========================================
   IMPORT STATUS
   ========================================= */

function showImportStatus(
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

    element.textContent =
        message || "";

    element.className =
        "import-status";

    if (type) {

        element.classList.add(
            type
        );

    }

}


/* =========================================
   IMPORT LANGUAGE CHANGE
   ========================================= */

function updateImportLanguage() {

    const select =
        document.getElementById(
            "import-language-select"
        );

    if (!select) {

        return;

    }

    appData.settings.learningLanguage =
        select.value;

    saveData();

}


/* =========================================
   CARD CREATION
   ========================================= */

function createCard(
    front,
    back,
    example,
    note
) {

    return {

        id:
            createId(
                "card"
            ),

        front:
            String(
                front || ""
            ).trim(),

        back:
            String(
                back || ""
            ).trim(),

        example:
            String(
                example || ""
            ).trim(),

        note:
            String(
                note || ""
            ).trim(),

        correct:
            0,

        incorrect:
            0,

        createdAt:
            nowISO(),

        updatedAt:
            nowISO()

    };

}


/* =========================================
   CREATE DECK
   ========================================= */

function createDeck(
    name,
    language
) {

    const deck = {

        id:
            createId(
                "deck"
            ),

        name:
            String(
                name || "新しいデッキ"
            ).trim(),

        description:
            "",

        language:
            language ||
            appData.settings.learningLanguage ||
            "zh",

        cards:
            [],

        studyCount:
            0,

        createdAt:
            nowISO(),

        updatedAt:
            nowISO()

    };

    appData.decks.push(
        deck
    );

    saveData();

    return deck;

}


/* =========================================
   ADD CARD TO DECK
   ========================================= */

function addCardToDeck(
    deckId,
    front,
    back,
    example,
    note
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return null;

    }

    const card =
        createCard(
            front,
            back,
            example,
            note
        );

    deck.cards.push(
        card
    );

    deck.updatedAt =
        nowISO();

    return card;

}


/* =========================================
   DELETE DECK
   ========================================= */

function deleteDeck(
    deckId
) {

    const index =
        appData.decks.findIndex(
            function (deck) {

                return (
                    deck.id ===
                    deckId
                );

            }
        );

    if (
        index === -1
    ) {

        return false;

    }

    appData.decks.splice(
        index,
        1
    );

    if (
        studyState.deckId ===
        deckId
    ) {

        stopStudyTimer();

        studyState =
            createDefaultStudyState();

    }

    saveData();

    refreshAllUI();

    return true;

}

/* =========================================
   DECK / CARD HELPERS
   ========================================= */

function getDeckById(
    deckId
) {

    if (!deckId) {

        return null;

    }

    return (
        appData.decks.find(
            function (deck) {

                return (
                    deck.id ===
                    deckId
                );

            }
        ) ||
        null
    );

}


function getCurrentDeck() {

    if (
        !studyState ||
        !studyState.deckId
    ) {

        return null;

    }

    return getDeckById(
        studyState.deckId
    );

}


function getDeckCardCount(
    deck
) {

    if (
        !deck ||
        !Array.isArray(
            deck.cards
        )
    ) {

        return 0;

    }

    return deck.cards.length;

}


/* =========================================
   NORMALIZE CARD
   ========================================= */

function normalizeCard(
    card
) {

    if (
        !card ||
        typeof card !== "object"
    ) {

        return null;

    }

    return {

        id:
            card.id ||
            createId(
                "card"
            ),

        front:
            String(
                card.front ||
                card.question ||
                ""
            ),

        back:
            String(
                card.back ||
                card.answer ||
                ""
            ),

        example:
            String(
                card.example ||
                ""
            ),

        note:
            String(
                card.note ||
                ""
            ),

        correct:
            Number(
                card.correct
            ) || 0,

        incorrect:
            Number(
                card.incorrect
            ) || 0,

        createdAt:
            card.createdAt ||
            nowISO(),

        updatedAt:
            card.updatedAt ||
            nowISO()

    };

}


/* =========================================
   NORMALIZE DECK
   ========================================= */

function normalizeDeck(
    deck
) {

    if (
        !deck ||
        typeof deck !== "object"
    ) {

        return null;

    }

    const cards =
        Array.isArray(
            deck.cards
        )
            ? deck.cards
                .map(
                    normalizeCard
                )
                .filter(
                    Boolean
                )
            : [];

    return {

        id:
            deck.id ||
            createId(
                "deck"
            ),

        name:
            String(
                deck.name ||
                "名称未設定"
            ),

        description:
            String(
                deck.description ||
                ""
            ),

        language:
            deck.language ||
            "zh",

        cards:
            cards,

        studyCount:
            Number(
                deck.studyCount
            ) || 0,

        createdAt:
            deck.createdAt ||
            nowISO(),

        updatedAt:
            deck.updatedAt ||
            nowISO()

    };

}


/* =========================================
   NORMALIZE ALL DECKS
   ========================================= */

function normalizeAllDecks() {

    if (
        !appData ||
        !Array.isArray(
            appData.decks
        )
    ) {

        appData.decks =
            [];

        return;

    }

    appData.decks =
        appData.decks
            .map(
                normalizeDeck
            )
            .filter(
                Boolean
            );

}


/* =========================================
   DEFAULT SETTINGS
   ========================================= */

function createDefaultSettings() {

    return {

        learningLanguage:
            "zh",

        randomStudy:
            false,

        autoVoice:
            false,

        voiceRate:
            1,

        voicePitch:
            1,

        customColor:
            "#8B7CF6"

    };

}


/* =========================================
   DEFAULT DATA
   ========================================= */

function createDefaultData() {

    return {

        version:
        
            [],

        settings:
            createDefaultSettings(),

        totalStudyTime:
            0,

        totalAnswers:
            0,

        totalCorrect:
            0,

        studyHistory:
            [],

        createdAt:
            nowISO(),

        updatedAt:
            nowISO()

    };

}


/* =========================================
   DEFAULT STUDY STATE
   ========================================= */

function createDefaultStudyState() {

    return {

        deckId:
            null,

        cards:
            [],

        currentIndex:
            0,

        answered:
            false,

        startTime:
            null,

        timerInterval:
            null,

        sessionCorrect:
            0,

        sessionAnswers:
            0

    };

}


/* =========================================
   NORMALIZE DATA
   ========================================= */

function normalizeData(
    data
) {

    const source =
        data &&
        typeof data === "object"
            ? data
            : {};

    const defaults =
        createDefaultData();

    const normalized = {

        version:
            source.version ||
            APP_VERSION,

        decks:
            Array.isArray(
                source.decks
            )
                ? source.decks
                    .map(
                        normalizeDeck
                    )
                    .filter(
                        Boolean
                    )
                : [],

        settings: {

            ...defaults.settings,

            ...(source.settings &&
            typeof source.settings === "object"
                ? source.settings
                : {})

        },

        totalStudyTime:
            Number(
                source.totalStudyTime
            ) || 0,

        totalAnswers:
            Number(
                source.totalAnswers
            ) || 0,

        totalCorrect:
            Number(
                source.totalCorrect
            ) || 0,

        studyHistory:
            Array.isArray(
                source.studyHistory
            )
                ? source.studyHistory
                : [],

        createdAt:
            source.createdAt ||
            nowISO(),

        updatedAt:
            source.updatedAt ||
            nowISO()

    };


    normalized.settings.voiceRate =
        clamp(
            Number(
                normalized.settings.voiceRate
            ) || 1,
            0.5,
            2
        );


    normalized.settings.voicePitch =
        clamp(
            Number(
                normalized.settings.voicePitch
            ) || 1,
            0,
            2
        );


    if (
        typeof normalized.settings.autoVoice !==
        "boolean"
    ) {

        normalized.settings.autoVoice =
            Boolean(
                normalized.settings.autoVoice
            );

    }


    if (
        typeof normalized.settings.randomStudy !==
        "boolean"
    ) {

        normalized.settings.randomStudy =
            Boolean(
                normalized.settings.randomStudy
            );

    }


    return normalized;

}


/* =========================================
   LOAD DATA
   ========================================= */

function loadData() {

    let stored = null;

    try {

        stored =
            localStorage.getItem(
                STORAGE_KEY
            );

    } catch (error) {

        console.error(
            "localStorage read error:",
            error
        );

    }


    if (!stored) {

        appData =
            createDefaultData();

        return appData;

    }


    try {

        const parsed =
            JSON.parse(
                stored
            );

        appData =
            normalizeData(
                parsed
            );

    } catch (error) {

        console.error(
            "Data parse error:",
            error
        );

        appData =
            createDefaultData();

    }


    return appData;

}


/* =========================================
   SAVE DATA
   ========================================= */

function saveData() {

    if (!appData) {

        return false;

    }


    appData.updatedAt =
        nowISO();


    try {

        const dataToSave =
            normalizeData(
                appData
            );


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                dataToSave
            )
        );


        appData =
            dataToSave;


        return true;

    } catch (error) {

        console.error(
            "Save data error:",
            error
        );

        return false;

    }

}


/* =========================================
   REFRESH ALL UI
   ========================================= */

function refreshAllUI() {

    if (!appData) {

        return;

    }


    normalizeAllDecks();


    renderHome();

    renderDecks();

    renderProgress();

    renderImportDeckSelect();

    renderDataShare();

    renderSettings();


    if (
        studyState &&
        studyState.deckId
    ) {

        renderStudyPage();

    }


    applyThemeColor(
        appData.settings.customColor
    );

}


/* =========================================
   STUDY TIMER
   ========================================= */

function startStudyTimer() {

    stopStudyTimer();


    studyState.startTime =
        Date.now();


    studyState.timerInterval =
        setInterval(
            function () {

                updateStudyTimerDisplay();

            },
            1000
        );


    updateStudyTimerDisplay();

}


function stopStudyTimer() {

    if (
        studyState &&
        studyState.timerInterval
    ) {

        clearInterval(
            studyState.timerInterval
        );

    }


    if (studyState) {

        studyState.timerInterval =
            null;

    }

}


function getCurrentStudyDuration() {

    if (
        !studyState ||
        !studyState.startTime
    ) {

        return 0;

    }

    return Math.max(
        0,
        Date.now() -
        studyState.startTime
    );

}


function updateStudyTimerDisplay() {

    const duration =
        getCurrentStudyDuration();


    document
        .querySelectorAll(
            "[data-study-timer]"
        )
        .forEach(
            function (element) {

                element.textContent =
                    formatStudyTime(
                        duration
                    );

            }
        );

}


/* =========================================
   STUDY HISTORY
   ========================================= */

function addStudyHistory(
    deckId,
    duration,
    answers,
    correct
) {

    if (
        !Array.isArray(
            appData.studyHistory
        )
    ) {

        appData.studyHistory =
            [];

    }


    appData.studyHistory.unshift({

        id:
            createId(
                "history"
            ),

        deckId:
            deckId,

        duration:
            Number(
                duration
            ) || 0,

        answers:
            Number(
                answers
            ) || 0,

        correct:
            Number(
                correct
            ) || 0,

        date:
            nowISO()

    });


    /*
     * 履歴を最大100件まで保存
     */

    if (
        appData.studyHistory.length >
        100
    ) {

        appData.studyHistory =
            appData.studyHistory.slice(
                0,
                100
            );

    }


    appData.totalStudyTime +=
        Number(
            duration
        ) || 0;

}


/* =========================================
   RENDER HISTORY
   ========================================= */

function renderHistory() {

    const container =
        document.getElementById(
            "history-container"
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

                <div class="empty-state-icon">
                    📊
                </div>

                <p>
                    まだ学習履歴がありません。
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        history
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


                    const accuracy =
                        answers > 0
                            ? Math.round(
                                (
                                    correct /
                                    answers
                                ) * 100
                            )
                            : 0;


                    return `

                        <div class="history-item">

                            <div class="history-date">

                                ${formatDateTime(
                                    item.date
                                )}

                            </div>

                            <div class="history-deck">

                                ${
                                    deck
                                        ? escapeHTML(
                                            deck.name
                                        )
                                        : "削除されたデッキ"
                                }

                            </div>

                            <div class="history-stats">

                                <span>
                                    ${answers}問
                                </span>

                                <span>
                                    ${correct}正解
                                </span>

                                <span>
                                    ${accuracy}%
                                </span>

                                <span>
                                    ${formatStudyTime(
                                        item.duration
                                    )}
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


}


/* =========================================
   DATE FORMAT
   ========================================= */

function formatDateTime(
    value
) {

    if (!value) {

        return "";

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

        return String(
            value
        );

    }


    return date.toLocaleString(
        "ja-JP",
        {
            year:
                "numeric",

            month:
                "numeric",

            day:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


/* =========================================
   FORMAT STUDY TIME
   ========================================= */

function formatStudyTime(
    milliseconds
) {

    const totalSeconds =
        Math.floor(
            (
                Number(
                    milliseconds
                ) || 0
            ) /
            1000
        );


    const hours =
        Math.floor(
            totalSeconds /
            3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds %
                3600
            ) /
            60
        );


    const seconds =
        totalSeconds %
        60;


    if (
        hours > 0
    ) {

        return (
            String(hours)
                .padStart(
                    2,
                    "0"
                ) +
            ":" +
            String(minutes)
                .padStart(
                    2,
                    "0"
                ) +
            ":" +
            String(seconds)
                .padStart(
                    2,
                    "0"
                )
        );

    }


    return (
        String(minutes)
            .padStart(
                2,
                "0"
            ) +
        ":" +
        String(seconds)
            .padStart(
                2,
                "0"
            )
    );

}


/* =========================================
   UTILITY
   ========================================= */

function nowISO() {

    return new Date()
        .toISOString();

}


function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            Number(value),
            min
        ),
        max
    );

}


/* =========================================
   FILE READER
   ========================================= */

function readFileAsText(
    file
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        reader.error ||
                        new Error(
                            "ファイルを読み込めませんでした。"
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


/* =========================================
   STATUS MESSAGE
   ========================================= */

function showStatus(
    message,
    type
) {

    const status =
        document.getElementById(
            "status-message"
        );


    if (!status) {

        return;

    }


    status.textContent =
        message || "";


    status.className =
        "status-message";


    if (type) {

        status.classList.add(
            type
        );

    }


    if (message) {

        setTimeout(
            function () {

                if (
                    status.textContent ===
                    message
                ) {

                    status.textContent =
                        "";

                }

            },
            4000
        );

    }

}


/* =========================================
   FINAL SAFETY INITIALIZATION
   ========================================= */

if (
    typeof appData ===
    "undefined" ||
    !appData
) {

    appData =
        createDefaultData();

}


if (
    typeof studyState ===
    "undefined" ||
    !studyState
) {

    studyState =
        createDefaultStudyState();

}
/* =========================================================
   EVENT BINDING - CONTINUED
   ========================================================= */

function goBack() {
    window.history.back();
}

function goForward() {
    window.history.forward();
}


function bindAppEvents() {

    document
        .querySelectorAll(
            ".btn-back"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    goBack
                );

            }
        );


    document
        .querySelectorAll(
            ".btn-forward"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    goForward
                );

            }
        );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        showPage(
                            button.dataset.page
                        )
                );

            }
        );


    document
        .querySelectorAll(
            "[data-go-page]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        showPage(
                            button.dataset.goPage
                        )
                );

            }
        );


    const search =
        document.getElementById(
            "card-search-input"
        );


    if (search) {

        search.addEventListener(
            "input",
            () =>
                renderCardSearchResults(
                    search.value
                )
        );

    }


    const showAnswer =
        document.getElementById(
            "show-answer-button"
        );

    const wrong =
        document.getElementById(
            "wrong-button"
        );

    const correct =
        document.getElementById(
            "correct-button"
        );

    const finish =
        document.getElementById(
            "finish-study-button"
        );


    if (showAnswer) {

        showAnswer.addEventListener(
            "click",
            showStudyAnswer
        );

    }


    if (wrong) {

        wrong.addEventListener(
            "click",
            handleStudyWrong
        );

    }


    if (correct) {

        correct.addEventListener(
            "click",
            handleStudyCorrect
        );

    }


    if (finish) {

        finish.addEventListener(
            "click",
            finishStudy
        );

    }


    /*
     * テーマカラー
     */

    const colorButtons =
        document.querySelectorAll(
            ".color-option"
        );


    colorButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const color =
                        button.dataset.color;

                    applyTheme(
                        color
                    );

                    saveSetting(
                        "customColor",
                        color.toUpperCase()
                    );

                }
            );

        }
    );


    /*
     * カスタムカラー
     */

    const customColor =
        document.getElementById(
            "custom-color"
        );


    if (customColor) {

        customColor.addEventListener(
            "input",
            () => {

                applyTheme(
                    customColor.value
                );

                saveSetting(
                    "customColor",
                    customColor.value.toUpperCase()
                );

            }
        );

    }


    /*
     * 自動音声
     */

    const autoVoice =
        document.getElementById(
            "auto-voice"
        );


    if (autoVoice) {

        autoVoice.addEventListener(
            "change",
            () =>
                saveSetting(
                    "autoVoice",
                    autoVoice.checked
                )
        );

    }


    /*
     * ランダム学習
     */

    const randomStudy =
        document.getElementById(
            "random-study"
        );


    if (randomStudy) {

        randomStudy.addEventListener(
            "change",
            () =>
                saveSetting(
                    "randomStudy",
                    randomStudy.checked
                )
        );

    }


    /*
     * 音声速度
     */

    const voiceRate =
        document.getElementById(
            "voice-rate"
        );


    if (voiceRate) {

        voiceRate.addEventListener(
            "change",
            () =>
                saveSetting(
                    "voiceRate",
                    Number(
                        voiceRate.value
                    ) || 1
                )
        );

    }


    /*
     * 音声ピッチ
     */

    const voicePitch =
        document.getElementById(
            "voice-pitch"
        );


    if (voicePitch) {

        voicePitch.addEventListener(
            "change",
            () =>
                saveSetting(
                    "voicePitch",
                    Number(
                        voicePitch.value
                    ) || 1
                )
        );

    }


    /*
     * UI言語
     */

    const uiLanguage =
        document.getElementById(
            "ui-language"
        );


    if (uiLanguage) {

        uiLanguage.addEventListener(
            "change",
            () =>
                saveSetting(
                    "uiLanguage",
                    uiLanguage.value
                )
        );

    }


    /*
     * 学習言語
     */

    const learningLanguage =
        document.getElementById(
            "learning-language"
        );


    if (learningLanguage) {

        learningLanguage.addEventListener(
            "change",
            () =>
                saveSetting(
                    "learningLanguage",
                    learningLanguage.value
                )
        );

    }


    /*
     * ファイル選択のchangeイベントは
     * index.html側のHTML Event Bridgeが担当。
     *
     * app.js側で二重登録しない。
     */

    const selectFileButton =
        document.getElementById(
            "select-file-button"
        );


    const fileInput =
        document.getElementById(
            "file-input"
        );


    if (
        selectFileButton &&
        fileInput
    ) {

        selectFileButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                fileInput.click();

            }
        );

    }

}
/* =========================================================
   IMPORT / EXPORT
   ========================================================= */

function exportData() {

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

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            "language-gym-backup.json";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            url
        );

        showStatus(
            "データを書き出しました。",
            "success"
        );

    } catch (error) {

        console.error(
            "Export error:",
            error
        );

        showStatus(
            "データの書き出しに失敗しました。",
            "error"
        );

    }

}


/* =========================================================
   IMPORT FILE
   ========================================================= */

function triggerDataImport() {

    const input =
        document.getElementById(
            "json-file-input"
        );

    if (!input) {

        return;

    }

    input.value =
        "";

    input.click();

}


/* =========================================================
   IMPORT VALIDATION
   ========================================================= */

function validateImportedData(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return {

            valid:
                false,

            message:
                "データ形式が正しくありません。"

        };

    }


    if (
        !Array.isArray(
            data.decks
        )
    ) {

        return {

            valid:
                false,

            message:
                "デッキデータが見つかりません。"

        };

    }


    return {

        valid:
            true,

        message:
            ""

    };

}


/* =========================================================
   NORMALIZE IMPORTED DATA
   ========================================================= */

function normalizeImportedData(
    imported
) {

    if (
        !imported ||
        typeof imported !== "object"
    ) {

        return createDefaultData();

    }


    const normalized =
        createDefaultData();


    normalized.version =
        imported.version ||
        APP_VERSION;


    /*
     * decks
     */

    if (
        Array.isArray(
            imported.decks
        )
    ) {

        normalized.decks =
            imported.decks
                .map(
                    normalizeDeck
                )
                .filter(
                    Boolean
                );

    }


    /*
     * settings
     */

    if (
        imported.settings &&
        typeof imported.settings === "object"
    ) {

        normalized.settings = {

            ...normalized.settings,

            ...imported.settings

        };

    }


    /*
     * statistics
     */

    if (
        imported.statistics &&
        typeof imported.statistics === "object"
    ) {

        normalized.statistics = {

            ...imported.statistics

        };

    }


    /*
     * studyHistory
     */

    if (
        Array.isArray(
            imported.studyHistory
        )
    ) {

        normalized.studyHistory =
            imported.studyHistory.filter(
                function (item) {

                    return (
                        item &&
                        typeof item === "object"
                    );

                }
            );

    }


    normalized.totalStudyTime =
        Number(
            imported.totalStudyTime
        ) || 0;


    normalized.totalAnswers =
        Number(
            imported.totalAnswers
        ) || 0;


    normalized.totalCorrect =
        Number(
            imported.totalCorrect
        ) || 0;


    normalized.createdAt =
        imported.createdAt ||
        nowISO();


    normalized.updatedAt =
        nowISO();


    return normalized;

}


/* =========================================================
   IMPORT JSON FILE
   ========================================================= */

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


        const imported =
            JSON.parse(
                text
            );


        const validation =
            validateImportedData(
                imported
            );


        if (
            !validation.valid
        ) {

            showStatus(
                validation.message,
                "error"
            );

            return;

        }


        const confirmed =
            window.confirm(
                "現在のデータを上書きして、" +
                "JSONデータを読み込みますか？"
            );


        if (!confirmed) {

            return;

        }


        appData =
            normalizeImportedData(
                imported
            );


        saveData();

        refreshAllUI();


        showStatus(
            "データを読み込みました。",
            "success"
        );


    } catch (error) {

        console.error(
            "Import JSON error:",
            error
        );


        showStatus(
            "JSONデータの読み込みに失敗しました。",
            "error"
        );

    }

}


/* =========================================================
   DATA SHARE EVENTS
   ========================================================= */

function setupDataShareEvents() {

    const input =
        document.getElementById(
            "json-file-input"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "change",
        async function (event) {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;

            }


            await importDataJSON(
                file
            );


            /*
             * 同じファイルを再選択可能にする
             */

            event.target.value =
                "";

        }
    );

}


/* =========================================================
   BACKUP
   ========================================================= */

function createBackup() {

    try {

        const data =
            JSON.stringify(
                appData
            );


        localStorage.setItem(
            BACKUP_KEY,
            data
        );


        localStorage.setItem(
            BACKUP_DATE_KEY,
            nowISO()
        );


        showStatus(
            "バックアップを作成しました。",
            "success"
        );


    } catch (error) {

        console.error(
            "Backup error:",
            error
        );


        showStatus(
            "バックアップの作成に失敗しました。",
            "error"
        );

    }

}


/* =========================================================
   RESTORE BACKUP
   ========================================================= */

function restoreBackup() {

    try {

        const backup =
            localStorage.getItem(
                BACKUP_KEY
            );


        if (!backup) {

            alert(
                "バックアップがありません。"
            );

            return;

        }


        const parsed =
            JSON.parse(
                backup
            );


        const validation =
            validateImportedData(
                parsed
            );


        if (
            !validation.valid
        ) {

            alert(
                "バックアップデータが壊れています。"
            );

            return;

        }


        const confirmed =
            window.confirm(
                "バックアップから復元しますか？\n\n" +
                "現在のデータは上書きされます。"
            );


        if (!confirmed) {

            return;

        }


        appData =
            normalizeImportedData(
                parsed
            );


        saveData();

        refreshAllUI();


        showStatus(
            "バックアップを復元しました。",
            "success"
        );


    } catch (error) {

        console.error(
            "Backup restore error:",
            error
        );


        showStatus(
            "バックアップの復元に失敗しました。",
            "error"
        );

    }

}

/* =========================================================
   RESET ALL DATA
   ========================================================= */

function resetAllData() {

    const confirmed =
        window.confirm(
            "すべてのデータを削除しますか？\n\n" +
            "この操作は元に戻せません。"
        );


    if (!confirmed) {

        return;

    }


    try {

        localStorage.removeItem(
            STORAGE_KEY
        );


        appData =
            createDefaultData();


        studyState =
            createDefaultStudyState();


        stopStudyTimer();


        saveData();


        refreshAllUI();


        showPage(
            "home"
        );


        alert(
            "すべてのデータを削除しました。"
        );


    } catch (error) {

        console.error(
            "Reset data error:",
            error
        );


        alert(
            "データの削除に失敗しました。"
        );

    }

}


/* =========================================================
   DECK CREATION
   ========================================================= */

function promptCreateDeck() {

    const name =
        window.prompt(
            "デッキ名を入力してください。",
            ""
        );


    if (
        name === null
    ) {

        return;

    }


    const trimmedName =
        name.trim();


    if (!trimmedName) {

        alert(
            "デッキ名を入力してください。"
        );

        return;

    }


    const description =
        window.prompt(
            "デッキの説明（任意）",
            ""
        );


    if (
        description === null
    ) {

        return;

    }


    const deck =
        createDeck(
            trimmedName,
            appData.settings.learningLanguage
        );


    if (!deck) {

        return;

    }


    deck.description =
        description.trim();


    deck.updatedAt =
        nowISO();


    saveData();


    refreshAllUI();


    showStatus(
        "デッキを作成しました。",
        "success"
    );


    openDeckDetail(
        deck.id
    );

}


/* =========================================================
   EDIT DECK
   ========================================================= */

function editDeck(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );


    if (!deck) {

        return;

    }


    const name =
        window.prompt(
            "デッキ名",
            deck.name
        );


    if (
        name === null
    ) {

        return;

    }


    const trimmedName =
        name.trim();


    if (!trimmedName) {

        alert(
            "デッキ名を入力してください。"
        );

        return;

    }


    const description =
        window.prompt(
            "デッキの説明",
            deck.description || ""
        );


    if (
        description === null
    ) {

        return;

    }


    deck.name =
        trimmedName;


    deck.description =
        description.trim();


    deck.updatedAt =
        nowISO();


    saveData();


    refreshAllUI();


    showStatus(
        "デッキを更新しました。",
        "success"
    );

}


/* =========================================================
   CONFIRM DELETE DECK
   ========================================================= */

function confirmDeleteDeck(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );


    if (!deck) {

        return;

    }


    const confirmed =
        window.confirm(
            "「" +
            deck.name +
            "」を削除しますか？\n\n" +
            "このデッキのカードと学習履歴の参照が削除されます。"
        );


    if (!confirmed) {

        return;

    }


    deleteDeck(
        deckId
    );


    showStatus(
        "デッキを削除しました。",
        "success"
    );


    showPage(
        "decks"
    );

}


/* =========================================================
   STUDY START
   ========================================================= */

function startStudy(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );


    if (!deck) {

        return;

    }


    if (
        !Array.isArray(
            deck.cards
        ) ||
        deck.cards.length === 0
    ) {

        alert(
            "このデッキにはカードがありません。"
        );

        return;

    }


    stopStudyTimer();


    let cards =
        deck.cards.slice();


    if (
        appData.settings.randomStudy
    ) {

        cards =
            shuffleArray(
                cards
            );

    }


    studyState =
        createDefaultStudyState();


    studyState.deckId =
        deck.id;


    studyState.cards =
        cards;


    studyState.currentIndex =
        0;


    studyState.answered =
        false;


    studyState.sessionCorrect =
        0;


    studyState.sessionAnswers =
        0;


    deck.studyCount =
        Number(
            deck.studyCount
        ) + 1;


    deck.updatedAt =
        nowISO();


    saveData();


    showPage(
        "study"
    );


    startStudyTimer();


    renderStudyPage();


    speakCurrentCard();

}


/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffleArray(
    array
) {

    const result =
        Array.isArray(
            array
        )
            ? array.slice()
            : [];


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


        const temporary =
            result[i];


        result[i] =
            result[j];


        result[j] =
            temporary;

    }


    return result;

}


/* =========================================================
   CURRENT STUDY CARD
   ========================================================= */

function getCurrentStudyCard() {

    if (
        !studyState ||
        !Array.isArray(
            studyState.cards
        )
    ) {

        return null;

    }


    return (
        studyState.cards[
            studyState.currentIndex
        ] ||
        null
    );

}


/* =========================================================
   RENDER STUDY PAGE
   ========================================================= */

function renderStudyPage() {

    const card =
        getCurrentStudyCard();


    const deck =
        getCurrentDeck();


    if (
        !card ||
        !deck
    ) {

        renderStudyEmpty();

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


    const counter =
        document.getElementById(
            "study-counter"
        );


    const answerButton =
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
            card.front || "";

    }


    if (back) {

        back.textContent =
            card.back || "";

        back.classList.toggle(
            "hidden",
            !studyState.answered
        );

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


    if (counter) {

        counter.textContent =
            deck.name;

    }


    if (answerButton) {

        answerButton.classList.toggle(
            "hidden",
            studyState.answered
        );

    }


    if (wrongButton) {

        wrongButton.classList.toggle(
            "hidden",
            !studyState.answered
        );

    }


    if (correctButton) {

        correctButton.classList.toggle(
            "hidden",
            !studyState.answered
        );

    }


    updateStudyTimerDisplay();

}


/* =========================================================
   STUDY EMPTY
   ========================================================= */

function renderStudyEmpty() {

    const front =
        document.getElementById(
            "study-front"
        );


    const back =
        document.getElementById(
            "study-back"
        );


    if (front) {

        front.textContent =
            "学習するカードがありません。";

    }


    if (back) {

        back.textContent =
            "";

        back.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   SHOW ANSWER
   ========================================================= */

function showStudyAnswer() {


    const card =
        getCurrentStudyCard();

        
    

        console.log("CURRENT CARD:", card);


    if (!card) {

        return;

    }


    studyState.answered =
        true;


    const back =
        document.getElementById(
            "study-back"
        );


    const answerButton =
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
            card.back || "";

        back.classList.remove(
            "hidden"
        );

    }


    if (answerButton) {

        answerButton.classList.add(
            "hidden"
        );

    }


    if (wrongButton) {

        wrongButton.classList.remove(
            "hidden"
        );

    }


    if (correctButton) {

        correctButton.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   STUDY ANSWER
   ========================================================= */

function handleStudyWrong() {

    recordStudyAnswer(
        false
    );

}


function handleStudyCorrect() {

    recordStudyAnswer(
        true
    );

}


/* =========================================================
   RECORD STUDY ANSWER
   ========================================================= */

function recordStudyAnswer(
    isCorrect
) {

    const card =
        getCurrentStudyCard();


    const deck =
        getCurrentDeck();


    if (
        !card ||
        !deck ||
        !studyState.answered
    ) {

        return;

    }


    if (isCorrect) {

        card.correct =
            Number(
                card.correct
            ) + 1;


        studyState.sessionCorrect +=
            1;

    } else {

        card.incorrect =
            Number(
                card.incorrect
            ) + 1;

    }


    studyState.sessionAnswers +=
        1;


    appData.totalAnswers +=
        1;


    if (isCorrect) {

        appData.totalCorrect +=
            1;

    }


    card.updatedAt =
        nowISO();


    deck.updatedAt =
        nowISO();


    saveData();


    moveToNextStudyCard();

}


/* =========================================================
   NEXT STUDY CARD
   ========================================================= */

function moveToNextStudyCard() {

    studyState.currentIndex +=
        1;


    studyState.answered =
        false;


    if (
        studyState.currentIndex >=
        studyState.cards.length
    ) {

        finishStudy();

        return;

    }


    renderStudyPage();


    speakCurrentCard();

}


/* =========================================================
   FINISH STUDY
   ========================================================= */

function finishStudy() {

    const duration =
        getCurrentStudyDuration();


    const deckId =
        studyState.deckId;


    const answers =
        studyState.sessionAnswers;


    const correct =
        studyState.sessionCorrect;


    stopStudyTimer();


    if (
        deckId
    ) {

        addStudyHistory(
            deckId,
            duration,
            answers,
            correct
        );

    }


    saveData();


    studyState =
        createDefaultStudyState();


    refreshAllUI();


    showPage(
        "progress"
    );


    showStatus(
        "学習セッションを終了しました。",
        "success"
    );

}

/* =========================================================
   SPEECH
   ========================================================= */

function speakCurrentCard() {

    if (
        !appData.settings.autoVoice
    ) {

        return;

    }

    const card =
        getCurrentStudyCard();

    if (!card) {

        return;

    }

    speakText(
        card.front
    );

}


/* =========================================================
   SPEAK TEXT
   ========================================================= */

function speakText(
    text
) {

    if (
        !text ||
        typeof window ===
        "undefined" ||
        !("speechSynthesis" in window)
    ) {

        return;

    }

    try {

        window.speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                String(
                    text
                )
            );


        utterance.rate =
            clamp(
                Number(
                    appData.settings.voiceRate
                ) || 1,
                0.5,
                2
            );


        utterance.pitch =
            clamp(
                Number(
                    appData.settings.voicePitch
                ) || 1,
                0,
                2
            );


        const language =
            appData.settings.learningLanguage;


        const speechLanguages = {

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
                "it-IT"

        };


        utterance.lang =
            speechLanguages[
                language
            ] ||
            "zh-CN";


        window.speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.warn(
            "Speech error:",
            error
        );

    }

}


/* =========================================================
   STOP SPEECH
   ========================================================= */

function stopSpeech() {

    if (
        typeof window !==
        "undefined" &&
        "speechSynthesis" in window
    ) {

        try {

            window.speechSynthesis.cancel();

        } catch (error) {

            console.warn(
                error
            );

        }

    }

}


/* =========================================================
   SETTINGS
   ========================================================= */

function saveSetting(
    key,
    value
) {

    if (
        !appData ||
        !appData.settings
    ) {

        return;

    }


    appData.settings[
        key
    ] =
        value;


    appData.updatedAt =
        nowISO();


    saveData();


    refreshSettingsUI();

}


/* =========================================================
   RENDER SETTINGS
   ========================================================= */

function renderSettings() {

    const language =
        document.getElementById(
            "learning-language"
        );


    const uiLanguage =
        document.getElementById(
            "ui-language"
        );


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


    const customColor =
        document.getElementById(
            "custom-color"
        );


    if (language) {

        language.value =
            appData.settings.learningLanguage ||
            "zh";

    }


    if (uiLanguage) {

        uiLanguage.value =
            appData.settings.uiLanguage ||
            "ja";

    }


    if (autoVoice) {

        autoVoice.checked =
            Boolean(
                appData.settings.autoVoice
            );

    }


    if (randomStudy) {

        randomStudy.checked =
            Boolean(
                appData.settings.randomStudy
            );

    }


    if (voiceRate) {

        voiceRate.value =
            String(
                appData.settings.voiceRate ||
                1
            );

    }


    if (voicePitch) {

        voicePitch.value =
            String(
                appData.settings.voicePitch ||
                1
            );

    }


    if (customColor) {

        customColor.value =
            appData.settings.customColor ||
            "#8B7CF6";

    }


    refreshSettingsUI();

}


/* =========================================================
   REFRESH SETTINGS UI
   ========================================================= */

function refreshSettingsUI() {

    const rateLabel =
        document.getElementById(
            "voice-rate-value"
        );


    const pitchLabel =
        document.getElementById(
            "voice-pitch-value"
        );


    if (rateLabel) {

        rateLabel.textContent =
            String(
                appData.settings.voiceRate ||
                1
            );

    }


    if (pitchLabel) {

        pitchLabel.textContent =
            String(
                appData.settings.voicePitch ||
                1
            );

    }


    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(
            function (button) {

                const selected =
                    String(
                        button.dataset.color ||
                        ""
                    ).toUpperCase() ===
                    String(
                        appData.settings.customColor ||
                        ""
                    ).toUpperCase();


                button.classList.toggle(
                    "selected",
                    selected
                );

            }
        );

}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme(
    color
) {

    const normalized =
        String(
            color ||
            "#8B7CF6"
        );


    document.documentElement.style.setProperty(
        "--primary-color",
        normalized
    );


    document.documentElement.style.setProperty(
        "--accent-color",
        normalized
    );


    document.documentElement.style.setProperty(
        "--theme-color",
        normalized
    );

}


function applyThemeColor(
    color
) {

    applyTheme(
        color
    );

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    const totalDecks =
        appData.decks.length;


    const totalCards =
        appData.decks.reduce(
            function (
                total,
                deck
            ) {

                return (
                    total +
                    (
                        Array.isArray(
                            deck.cards
                        )
                            ? deck.cards.length
                            : 0
                    )
                );

            },
            0
        );


    const totalAnswers =
        Number(
            appData.totalAnswers
        ) || 0;


    const totalCorrect =
        Number(
            appData.totalCorrect
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


    setText(
        "home-deck-count",
        totalDecks
    );


    setText(
        "home-card-count",
        totalCards
    );


    setText(
        "home-answer-count",
        totalAnswers
    );


    setText(
        "home-accuracy",
        accuracy + "%"
    );


    setText(
        "home-study-time",
        formatStudyTime(
            appData.totalStudyTime
        )
    );


    renderGreeting();

}


/* =========================================================
   GREETING
   ========================================================= */

function renderGreeting() {

    const element =
        document.getElementById(
            "daily-greeting"
        );


    if (!element) {

        return;

    }


    const hour =
        new Date()
            .getHours();


    let greeting = "";


    if (
        hour < 5
    ) {

        greeting =
            "夜遅くまでお疲れさまです。";

    } else if (
        hour < 11
    ) {

        greeting =
            "おはようございます。今日も少しずつ進めましょう。";

    } else if (
        hour < 17
    ) {

        greeting =
            "こんにちは。今日もLanguage Gymで頑張りましょう。";

    } else if (
        hour < 22
    ) {

        greeting =
            "こんばんは。今日の学習を積み重ねましょう。";

    } else {

        greeting =
            "今日も一日お疲れさまでした。";

    }


    element.textContent =
        greeting;

}


/* =========================================================
   DECK RENDER
   ========================================================= */

function renderDecks() {

    const container =
        document.getElementById(
            "decks-container"
        );


    if (!container) {

        return;

    }


    if (
        appData.decks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    📚
                </div>

                <h3>
                    まだデッキがありません
                </h3>

                <p>
                    最初のデッキを作成して、
                    学習カードを追加しましょう。
                </p>

                <button
                    type="button"
                    class="primary-button"
                    data-action="create-deck"
                >
                    ＋ デッキを作成
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML =
        appData.decks
            .map(
                function (deck) {

                    const count =
                        Array.isArray(
                            deck.cards
                        )
                            ? deck.cards.length
                            : 0;


                    return `

                        <div
                            class="deck-card"
                            data-deck-id="${escapeHTML(
                                deck.id
                            )}"
                        >

                            <div class="deck-card-main">

                                <h3>
                                    ${escapeHTML(
                                        deck.name
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        deck.description ||
                                        ""
                                    )}
                                </p>

                                <div class="deck-card-meta">

                                    <span>
                                        🃏 ${count}枚
                                    </span>

                                    <span>
                                        📖 ${Number(
                                            deck.studyCount
                                        ) || 0}回学習
                                    </span>

                                </div>

                            </div>

                            <div class="deck-card-actions">

                                <button
                                    type="button"
                                    class="primary-button"
                                    data-action="start-study"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
                                >
                                    学習
                                </button>

                                <button
                                    type="button"
                                    class="secondary-button"
                                    data-action="open-deck"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
                                >
                                    詳細
                                </button>

                                <button
                                    type="button"
                                    class="secondary-button"
                                    data-action="edit-deck"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
                                >
                                    編集
                                </button>

                                <button
                                    type="button"
                                    class="danger-button"
                                    data-action="delete-deck"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
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
   DECK DETAIL
   ========================================================= */

function openDeckDetail(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return;

    }

    window.currentDeckId =
        deckId;

    renderDeckDetail(
        deck
    );

    showPage(
        "deck-detail"
    );

}


/* =========================================================
   RENDER DECK DETAIL
   ========================================================= */

function renderDeckDetail(
    deck
) {

    const title =
        document.getElementById(
            "deck-detail-title"
        );

    const description =
        document.getElementById(
            "deck-detail-description"
        );

    const cardsContainer =
        document.getElementById(
            "deck-cards-container"
        );

    const count =
        document.getElementById(
            "deck-card-count"
        );


    if (title) {

        title.textContent =
            deck.name;

    }


    if (description) {

        description.textContent =
            deck.description || "";

    }


    if (count) {

        count.textContent =
            String(
                Array.isArray(
                    deck.cards
                )
                    ? deck.cards.length
                    : 0
            );

    }


    if (!cardsContainer) {

        return;

    }


    if (
        !Array.isArray(
            deck.cards
        ) ||
        deck.cards.length === 0
    ) {

        cardsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🃏
                </div>

                <h3>
                    まだカードがありません
                </h3>

                <p>
                    下のボタンからカードを追加できます。
                </p>

            </div>

        `;

        return;

    }


    cardsContainer.innerHTML =
        deck.cards
            .map(
                function (card, index) {

                    return `

                        <div
                            class="card-list-item"
                            data-card-id="${escapeHTML(
                                card.id
                            )}"
                        >

                            <div class="card-list-number">
                                ${index + 1}
                            </div>

                            <div class="card-list-content">

                                <div class="card-list-front">
                                    ${escapeHTML(
                                        card.front
                                    )}
                                </div>

                                <div class="card-list-back">
                                    ${escapeHTML(
                                        card.back
                                    )}
                                </div>

                            </div>

                            <div class="card-list-actions">

                                <button
                                    type="button"
                                    class="secondary-button"
                                    data-action="edit-card"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
                                    data-card-id="${escapeHTML(
                                        card.id
                                    )}"
                                >
                                    編集
                                </button>

                                <button
                                    type="button"
                                    class="danger-button"
                                    data-action="delete-card"
                                    data-deck-id="${escapeHTML(
                                        deck.id
                                    )}"
                                    data-card-id="${escapeHTML(
                                        card.id
                                    )}"
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
   ADD CARD
   ========================================================= */

function promptAddCard(
    deckId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return;

    }


    const front =
        window.prompt(
            "表面（問題・単語）",
            ""
        );


    if (
        front === null
    ) {

        return;

    }


    if (
        !front.trim()
    ) {

        alert(
            "表面を入力してください。"
        );

        return;

    }


    const back =
        window.prompt(
            "裏面（答え・意味）",
            ""
        );


    if (
        back === null
    ) {

        return;

    }


    const example =
        window.prompt(
            "例文（任意）",
            ""
        );


    if (
        example === null
    ) {

        return;

    }


    const note =
        window.prompt(
            "メモ（任意）",
            ""
        );


    if (
        note === null
    ) {

        return;

    }


    addCardToDeck(
        deck.id,
        front,
        back,
        example,
        note
    );


    saveData();


    renderDeckDetail(
        deck
    );


    refreshAllUI();


    showStatus(
        "カードを追加しました。",
        "success"
    );

}


/* =========================================================
   EDIT CARD
   ========================================================= */

function editCard(
    deckId,
    cardId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return;

    }


    const card =
        deck.cards.find(
            function (item) {

                return (
                    item.id ===
                    cardId
                );

            }
        );


    if (!card) {

        return;

    }


    const front =
        window.prompt(
            "表面",
            card.front || ""
        );


    if (
        front === null
    ) {

        return;

    }


    if (
        !front.trim()
    ) {

        alert(
            "表面を入力してください。"
        );

        return;

    }


    const back =
        window.prompt(
            "裏面",
            card.back || ""
        );


    if (
        back === null
    ) {

        return;

    }


    const example =
        window.prompt(
            "例文",
            card.example || ""
        );


    if (
        example === null
    ) {

        return;

    }


    const note =
        window.prompt(
            "メモ",
            card.note || ""
        );


    if (
        note === null
    ) {

        return;

    }


    card.front =
        front.trim();


    card.back =
        back.trim();


    card.example =
        example.trim();


    card.note =
        note.trim();


    card.updatedAt =
        nowISO();


    deck.updatedAt =
        nowISO();


    saveData();


    renderDeckDetail(
        deck
    );


    refreshAllUI();


    showStatus(
        "カードを更新しました。",
        "success"
    );

}


/* =========================================================
   DELETE CARD
   ========================================================= */

function deleteCard(
    deckId,
    cardId
) {

    const deck =
        getDeckById(
            deckId
        );

    if (!deck) {

        return false;

    }


    const index =
        deck.cards.findIndex(
            function (card) {

                return (
                    card.id ===
                    cardId
                );

            }
        );


    if (
        index === -1
    ) {

        return false;

    }


    const card =
        deck.cards[
            index
        ];


    const confirmed =
        window.confirm(
            "「" +
            card.front +
            "」を削除しますか？"
        );


    if (!confirmed) {

        return false;

    }


    deck.cards.splice(
        index,
        1
    );


    deck.updatedAt =
        nowISO();


    saveData();


    renderDeckDetail(
        deck
    );


    refreshAllUI();


    showStatus(
        "カードを削除しました。",
        "success"
    );


    return true;

}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    const totalCards =
        appData.decks.reduce(
            function (
                total,
                deck
            ) {

                return (
                    total +
                    (
                        Array.isArray(
                            deck.cards
                        )
                            ? deck.cards.length
                            : 0
                    )
                );

            },
            0
        );


    let correct =
        0;

    let incorrect =
        0;


    appData.decks.forEach(
        function (deck) {

            if (
                !Array.isArray(
                    deck.cards
                )
            ) {

                return;

            }


            deck.cards.forEach(
                function (card) {

                    correct +=
                        Number(
                            card.correct
                        ) || 0;


                    incorrect +=
                        Number(
                            card.incorrect
                        ) || 0;

                }
            );

        }
    );


    const totalAttempts =
        correct +
        incorrect;


    const accuracy =
        totalAttempts > 0
            ? Math.round(
                (
                    correct /
                    totalAttempts
                ) *
                100
            )
            : 0;


    setText(
        "progress-total-cards",
        totalCards
    );


    setText(
        "progress-correct",
        correct
    );


    setText(
        "progress-incorrect",
        incorrect
    );


    setText(
        "progress-accuracy",
        accuracy + "%"
    );


    setText(
        "progress-study-time",
        formatStudyTime(
            appData.totalStudyTime
        )
    );


    renderHistory();

}


/* =========================================================
   DECK DETAIL ACTIONS
   ========================================================= */

function bindDeckActionEvents() {

    const container =
        document.getElementById(
            "decks-container"
        );


    if (!container) {

        return;

    }


    container.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const deckId =
                button.dataset.deckId;


            if (
                action ===
                "start-study"
            ) {

                startStudy(
                    deckId
                );

                return;

            }


            if (
                action ===
                "open-deck"
            ) {

                openDeckDetail(
                    deckId
                );

                return;

            }


            if (
                action ===
                "edit-deck"
            ) {

                editDeck(
                    deckId
                );

                return;

            }


            if (
                action ===
                "delete-deck"
            ) {

                confirmDeleteDeck(
                    deckId
                );

                return;

            }

        }
    );

}


/* =========================================================
   CARD ACTION EVENTS
   ========================================================= */

function bindCardActionEvents() {

    const container =
        document.getElementById(
            "deck-cards-container"
        );


    if (!container) {

        return;

    }


    container.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const deckId =
                button.dataset.deckId;


            const cardId =
                button.dataset.cardId;


            if (
                action ===
                "edit-card"
            ) {

                editCard(
                    deckId,
                    cardId
                );

                return;

            }


            if (
                action ===
                "delete-card"
            ) {

                deleteCard(
                    deckId,
                    cardId
                );

                return;

            }

        }
    );

}


/* =========================================================
   UTILITY TEXT
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        value === undefined ||
        value === null
            ? ""
            : String(
                value
            );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value === undefined ||
        value === null
            ? ""
            : value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   ID GENERATOR
   ========================================================= */

function createId(
    prefix
) {

    const safePrefix =
        prefix ||
        "item";


    return (
        safePrefix +
        "_" +
        Date.now().toString(
            36
        ) +
        "_" +
        Math.random()
            .toString(
                36
            )
            .slice(
                2,
                9
            )
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeApp() {

    try {

        appData =
            loadData();


        appData =
            normalizeData(
                appData
            );


        studyState =
            createDefaultStudyState();


        applyTheme(
            appData.settings.customColor
        );


        refreshAllUI();


        bindAppEvents();

        bindDeckActionEvents();

        bindCardActionEvents();

        setupDataShareEvents();


        showPage(
            "home"
        );


        console.log(
            "Language Gym initialized."
        );

    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        alert(
            "Language Gymの初期化に失敗しました。"
        );

    }

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
        initializeApp
    );

} else {

    initializeApp();

}

            /*
             * 区切り文字がない行
             *
             * 単語だけのTXTも
             * カードとして読み込めるようにする。
             */

    
    

            
                    normalizeCard({
                        front:
                    

                
                            "",

                        language:
                            appData
                                .settings
                                .learningLanguage
                    })
            

        

            Boolean



/* =========================================================
   ADD IMPORTED CARDS
   ========================================================= */

function addImportedCards(
    cards,
    fileName
) {

    if (
        !Array.isArray(
            cards
        ) ||
        cards.length === 0
    ) {

        return;

    }


    const select =
        document.getElementById(
            "import-deck-select"
        );


    const selectedDeckId =
        select
            ? select.value
            : "";


    let deck =
        selectedDeckId
            ? getDeckById(
                selectedDeckId
            )
            : null;


    /*
     * 既存デッキが選択されていない場合は
     * ファイル名から新しいデッキを作る。
     */

    if (!deck) {

        const defaultName =
            String(
                fileName || "インポートデッキ"
            )
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
                .trim();


        const deckName =
            window.prompt(
                "新しいデッキ名を入力してください。",
                defaultName
            );


        if (
            deckName === null
        ) {

            return;

        }


        const trimmedName =
            deckName.trim();


        if (
            !trimmedName
        ) {

            showStatus(
                "デッキ名を入力してください。",
                "error"
            );

            return;

        }


        deck =
            createDeck(
                trimmedName,
                appData
                    .settings
                    .learningLanguage
            );

    }


    if (!deck) {

        showStatus(
            "デッキを作成できませんでした。",
            "error"
        );

        return;

    }


    /*
     * カードを追加
     */

    cards.forEach(
        function (card) {

            if (!card) {

                return;

            }


            const normalized =
                normalizeCard(
                    card
                );


            if (!normalized) {

                return;

            }


            deck.cards.push(
                normalized
            );

        }
    );


    deck.updatedAt =
        nowISO();


    saveData();


    refreshAllUI();


    showStatus(
        `${cards.length}枚のカードを「${deck.name}」に追加しました。`,
        "success"
    );


    /*
     * インポート完了後はデッキ一覧を表示
     */

    showPage(
        "decks"
    );

}


/* =========================================================
   PDF IMPORT
   ========================================================= */

async function importPDF(
    file
) {

    if (!file) {

        return;

    }


    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        showStatus(
            "PDF.jsが読み込まれていません。",
            "error"
        );

        return;

    }


    try {

        showImportStatus(
            "PDFを読み込んでいます……",
            "loading"
        );


        const arrayBuffer =
            await file.arrayBuffer();


        const loadingTask =
            pdfjsLib.getDocument({
                data:
                    arrayBuffer
            });


        const pdf =
            await loadingTask.promise;


        let fullText =
            "";


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
                        function (item) {

                            return (
                                item.str ||
                                ""
                            );

                        }
                    )
                    .join(" ");


            fullText +=
                pageText +
                "\n";

        }


        if (
            !fullText.trim()
        ) {

            showImportStatus(
                "PDFから文字を取得できませんでした。画像PDFの場合はOCRが必要です。",
                "error"
            );

            return;

        }


        const cards =
            parseTextToCards(
                fullText,
                "txt"
            );


        if (
            cards.length === 0
        ) {

            showImportStatus(
                "PDFからカードを作成できませんでした。",
                "error"
            );

            return;

        }


        addImportedCards(
            cards,
            file.name
        );


        showImportStatus(
            `${cards.length}枚のカードを作成しました。`,
            "success"
        );


    } catch (error) {

        console.error(
            "PDF import error:",
            error
        );


        showImportStatus(
            "PDFの読み込みに失敗しました。",
            "error"
        );

    }

}


/* =========================================================
   IMPORT STATUS
   ========================================================= */

function showImportStatus(
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


    element.textContent =
        message || "";


    element.className =
        "import-status";


    if (type) {

        element.classList.add(
            type
        );

    }

}


/* =========================================================
   IMPORT INPUT
   ========================================================= */

function setupImportInput() {

    const input =
        document.getElementById(
            "file-input"
        );


    if (!input) {

        return;

    }


    /*
     * 同じファイルを再選択した場合にも
     * changeイベントを発火させる。
     */

    input.addEventListener(
        "click",
        function () {

            input.value =
                "";

        }
    );


    input.addEventListener(
        "change",
        async function (event) {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;

            }


            

        }
    );

}


/* =========================================================
   JSON IMPORT INPUT
   ========================================================= */

function setupJSONImportInput() {

    const input =
        document.getElementById(
            "json-file-input"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "click",
        function () {

            input.value =
                "";

        }
    );


    input.addEventListener(
        "change",
        async function (event) {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;

            }


            await importDataJSON(
                file
            );

        }
    );

}


/* =========================================================
   IMPORT BUTTON
   ========================================================= */

function setupImportButton() {

    const button =
        document.getElementById(
            "select-file-button"
        );


    const input =
        document.getElementById(
            "file-input"
        );


    if (
        !button ||
        !input
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            input.click();

        }
    );

}


/* =========================================================
   DATA SHARE UI
   ========================================================= */

function renderDataShare() {

    const exportButton =
        document.getElementById(
            "export-data-button"
        );


    const importButton =
        document.getElementById(
            "import-data-button"
        );


    if (
        exportButton
    ) {

        exportButton.onclick =
            function (event) {

                event.preventDefault();

                exportData();

            };

    }


    if (
        importButton
    ) {

        importButton.onclick =
            function (event) {

                event.preventDefault();

                triggerDataImport();

            };

    }


    const backupDate =
        document.getElementById(
            "backup-date"
        );


    if (
        backupDate
    ) {

        const date =
            localStorage.getItem(
                BACKUP_DATE_KEY
            );


        backupDate.textContent =
            date
                ? formatDateTime(
                    date
                )
                : "バックアップなし";

    }

}


/* =========================================================
   ACTION DELEGATION
   ========================================================= */

function setupActionDelegation() {

    document.addEventListener(
        "click",
        function (event) {

            const target =
                event.target.closest(
                    "[data-action]"
                );


            if (!target) {

                return;

            }


            const action =
                target.dataset.action;


            const deckId =
                target.dataset.deckId;


            const cardId =
                target.dataset.cardId;


            switch (
                action
            ) {

                case "create-deck":

                    promptCreateDeck();

                    break;


                case "start-study":

                    if (
                        deckId
                    ) {

                        startStudy(
                            deckId
                        );

                    }

                    break;


                case "open-deck":

                    if (
                        deckId
                    ) {

                        openDeckDetail(
                            deckId
                        );

                    }

                    break;


                case "edit-deck":

                    if (
                        deckId
                    ) {

                        editDeck(
                            deckId
                        );

                    }

                    break;


                case "delete-deck":

                    if (
                        deckId
                    ) {

                        confirmDeleteDeck(
                            deckId
                        );

                    }

                    break;


                case "add-card":

                    if (
                        deckId
                    ) {

                        promptAddCard(
                            deckId
                        );

                    }

                    break;


                case "edit-card":

                    if (
                        deckId &&
                        cardId
                    ) {

                        editCard(
                            deckId,
                            cardId
                        );

                    }

                    break;


                case "delete-card":

                    if (
                        deckId &&
                        cardId
                    ) {

                        deleteCard(
                            deckId,
                            cardId
                        );

                    }

                    break;


                case "export-data":

                    exportData();

                    break;


                case "import-data":

                    triggerDataImport();

                    break;


                case "create-backup":

                    createBackup();

                    break;


                case "restore-backup":

                    restoreBackup();

                    break;


                case "reset-data":

                    resetAllData();

                    break;


                case "show-answer":

                    showStudyAnswer();

                    break;


                case "answer-wrong":

                    handleStudyWrong();

                    break;


                case "answer-correct":

                    handleStudyCorrect();

                    break;


                case "finish-study":

                    finishStudy();

                    break;


                case "stop-study":

                    stopStudy();

                    showPage(
                        "home"
                    );

                    break;


                default:

                    break;

            }

        }
    );

}