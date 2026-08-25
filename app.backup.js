/* =========================================================
   Language Gym
   app.js
   Complete version
   ========================================================= */

"use strict";

/* =========================================================
   CONSTANTS
   ========================================================= */

const STORAGE_KEY = "languageGymData";
const BACKUP_KEY = "languageGymBackup";
const HISTORY_KEY = "languageGymHistory";

const DEFAULT_COLOR = "#8B7CF6";

const LANGUAGE_NAMES = {
    ja: "日本語",
    en: "English",
    zh: "中文",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    ko: "한국어",
    it: "Italiano",
    fi: "Suomi",
    ru: "Русский",
    pt: "Português"
};

const LANGUAGE_LOCALES = {
    ja: "ja-JP",
    en: "en-US",
    zh: "zh-CN",
    de: "de-DE",
    es: "es-ES",
    fr: "fr-FR",
    ko: "ko-KR",
    it: "it-IT",
    fi: "fi-FI",
    ru: "ru-RU",
    pt: "pt-PT"
};


/* =========================================================
   TRANSLATIONS
   ========================================================= */

const I18N = {

    ja: {
        home: "ホーム",
        decks: "デッキ",
        study: "学習",
        progress: "学習記録",
        import: "インポート",
        dataShare: "データ共有",
        settings: "設定",

        subtitle: "多言語学習トレーニング",

        homeTitle: "Language Gym",
        homeDescription: "今日も少しずつ、外国語を鍛えよう。",
        deck: "デッキ",
        cards: "カード",
        totalStudyTime: "累計学習時間",
        accuracy: "正答率",
        startLearning: "🚀 学習を始める",
        chooseDeck: "デッキを選んで学習を開始しましょう。",
        viewDecks: "📚 デッキを見る",
        importMaterial: "📥 教材を取り込む",
        todayMessage: "🌱 今日のメッセージ",
        todayForward: "今日も一歩前進！",

        deckTitle: "📚 デッキ",
        deckDescription: "学習する教材を管理します。",
        noDecks: "まだデッキがありません。",
        createDeck: "教材をインポート",
        cardSearch: "🔎 カード検索",
        searchPlaceholder: "カードの表・裏を検索",
        edit: "編集",
        delete: "削除",
        cardsCount: "カード",

        studyTitle: "🏋️ 学習",
        chooseDeckToStudy: "デッキを選択してください。",
        studyStartMessage: "学習を開始するとここにカードが表示されます。",
        showAnswer: "👀 答えを見る",
        dontKnow: "❌ わからない",
        correct: "⭕ 正解",
        finishStudy: "学習終了",
        noCards: "このデッキにはカードがありません。",
        studyFinished: "学習を終了しました。",
        correctRate: "正答率",

        progressTitle: "📊 学習記録",
        progressDescription: "学習時間・回答数・正答率を確認できます。",
        totalAnswers: "累計回答数",
        correctAnswers: "正解数",
        history: "学習履歴",
        noHistory: "まだ学習記録がありません。",
        date: "日時",
        deckName: "デッキ",
        answers: "回答",
        correctColumn: "正解",

        importTitle: "📥 インポート",
        importDescription: "TXT・CSV・PDFなどの教材を取り込みます。",
        targetDeck: "📚 追加先デッキ",
        newDeck: "新しいデッキを作成",
        addToExisting: "既存デッキを選ぶと、そのデッキにカードを追加します。",
        learningLanguage: "🌐 学習言語",
        selectMaterial: "教材を選択",
        multipleFiles: "複数ファイルをまとめて選択できます",
        selectFile: "📂 ファイルを選択",
        importing: "インポート中…",
        imported: "インポートしました",
        importError: "インポートに失敗しました",
        noCardsDetected: "カードとして読み取れる内容がありませんでした。",

        dataShareTitle: "🔄 データ共有",
        dataShareDescription: "PC・スマホ間でLanguage Gymのデータを共有します。",
        exportTitle: "📤 データを書き出す",
        exportDescription: "学習記録・デッキ・設定などをJSONファイルとして保存します。",
        exportData: "データを書き出す",
        importData: "📥 データを読み込む",
        importDataDescription: "別の端末で書き出したJSONファイルを読み込みます。",
        readJSON: "JSONを読み込む",
        backupTitle: "🛟 自動バックアップ",
        backupDescription: "最新データの自動バックアップから復元します。",
        restoreBackup: "バックアップから復元",

        settingsTitle: "⚙️ 設定",
        settingsDescription: "Language Gymを自分好みに設定できます。",
        themeColor: "🎨 テーマカラー",
        themeDescription: "12色から好きな色を選べます。",
        customColor: "カスタムカラー",
        voice: "🔊 音声",
        autoVoice: "自動音声",
        autoVoiceDescription: "カード表示時に自動再生",
        randomStudy: "🎲 学習カードをランダムにする",
        voiceRate: "音声速度",
        voicePitch: "音声ピッチ",
        languageSettings: "🌐 言語設定",
        uiLanguage: "UI言語",
        learningLanguageSetting: "学習言語",

        languageChanged: "UI言語を変更しました。",
        learningLanguageChanged: "学習言語を変更しました。",
        deleteConfirm: "このカードを削除しますか？",
        deckDeleteConfirm: "このデッキを削除しますか？",
        backupRestored: "バックアップから復元しました。",
        dataImported: "データを読み込みました。",
        dataExported: "データを書き出しました。",

        back: "戻る",
        forward: "進む"
    },

    en: {
        home: "Home",
        decks: "Decks",
        study: "Study",
        progress: "Progress",
        import: "Import",
        dataShare: "Data",
        settings: "Settings",

        subtitle: "Multilingual Learning Training",

        homeTitle: "Language Gym",
        homeDescription: "Train your languages little by little every day.",
        deck: "Decks",
        cards: "Cards",
        totalStudyTime: "Total Study Time",
        accuracy: "Accuracy",
        startLearning: "🚀 Start Learning",
        chooseDeck: "Choose a deck to start learning.",
        viewDecks: "📚 View Decks",
        importMaterial: "📥 Import Materials",
        todayMessage: "🌱 Today's Message",
        todayForward: "One step forward today!",

        deckTitle: "📚 Decks",
        deckDescription: "Manage your study materials.",
        noDecks: "There are no decks yet.",
        createDeck: "Import Materials",
        cardSearch: "🔎 Search Cards",
        searchPlaceholder: "Search front or back",
        edit: "Edit",
        delete: "Delete",
        cardsCount: "cards",

        studyTitle: "🏋️ Study",
        chooseDeckToStudy: "Please select a deck.",
        studyStartMessage: "Cards will appear here when you start studying.",
        showAnswer: "👀 Show Answer",
        dontKnow: "❌ Don't Know",
        correct: "⭕ Correct",
        finishStudy: "Finish",
        noCards: "This deck has no cards.",
        studyFinished: "Study session finished.",
        correctRate: "Accuracy",

        progressTitle: "📊 Progress",
        progressDescription: "Check your study time, answers, and accuracy.",
        totalAnswers: "Total Answers",
        correctAnswers: "Correct Answers",
        history: "Study History",
        noHistory: "There is no study history yet.",
        date: "Date",
        deckName: "Deck",
        answers: "Answers",
        correctColumn: "Correct",

        importTitle: "📥 Import",
        importDescription: "Import TXT, CSV, PDF and other study materials.",
        targetDeck: "📚 Target Deck",
        newDeck: "Create a new deck",
        addToExisting: "Choose an existing deck to add cards to it.",
        learningLanguage: "🌐 Learning Language",
        selectMaterial: "Select Materials",
        multipleFiles: "You can select multiple files at once.",
        selectFile: "📂 Select Files",
        importing: "Importing…",
        imported: "Imported",
        importError: "Import failed",
        noCardsDetected: "No card-like content was found.",

        dataShareTitle: "🔄 Data Sharing",
        dataShareDescription: "Share Language Gym data between PC and smartphone.",
        exportTitle: "📤 Export Data",
        exportDescription: "Save study records, decks, and settings as a JSON file.",
        exportData: "Export Data",
        importData: "📥 Import Data",
        importDataDescription: "Import a JSON file exported from another device.",
        readJSON: "Import JSON",
        backupTitle: "🛟 Automatic Backup",
        backupDescription: "Restore from the latest automatic backup.",
        restoreBackup: "Restore Backup",

        settingsTitle: "⚙️ Settings",
        settingsDescription: "Customize Language Gym.",
        themeColor: "🎨 Theme Color",
        themeDescription: "Choose your favorite color from 12 presets.",
        customColor: "Custom Color",
        voice: "🔊 Voice",
        autoVoice: "Auto Voice",
        autoVoiceDescription: "Play automatically when a card appears",
        randomStudy: "🎲 Randomize study cards",
        voiceRate: "Voice Rate",
        voicePitch: "Voice Pitch",
        languageSettings: "🌐 Language Settings",
        uiLanguage: "UI Language",
        learningLanguageSetting: "Learning Language",

        languageChanged: "UI language changed.",
        learningLanguageChanged: "Learning language changed.",
        deleteConfirm: "Delete this card?",
        deckDeleteConfirm: "Delete this deck?",
        backupRestored: "Backup restored.",
        dataImported: "Data imported.",
        dataExported: "Data exported.",

        back: "Back",
        forward: "Forward"
    },

    zh: {
        home: "首页",
        decks: "卡组",
        study: "学习",
        progress: "学习记录",
        import: "导入",
        dataShare: "数据共享",
        settings: "设置",

        subtitle: "多语言学习训练",

        homeTitle: "Language Gym",
        homeDescription: "每天一点点，持续提升外语能力。",
        deck: "卡组",
        cards: "卡片",
        totalStudyTime: "累计学习时间",
        accuracy: "正确率",
        startLearning: "🚀 开始学习",
        chooseDeck: "选择卡组开始学习。",
        viewDecks: "📚 查看卡组",
        importMaterial: "📥 导入教材",
        todayMessage: "🌱 今日消息",
        todayForward: "今天也向前一步！",

        deckTitle: "📚 卡组",
        deckDescription: "管理学习教材。",
        noDecks: "还没有卡组。",
        createDeck: "导入教材",
        cardSearch: "🔎 搜索卡片",
        searchPlaceholder: "搜索正面或背面",
        edit: "编辑",
        delete: "删除",
        cardsCount: "张卡片",

        studyTitle: "🏋️ 学习",
        chooseDeckToStudy: "请选择卡组。",
        studyStartMessage: "开始学习后，卡片会显示在这里。",
        showAnswer: "👀 查看答案",
        dontKnow: "❌ 不知道",
        correct: "⭕ 正确",
        finishStudy: "结束学习",
        noCards: "这个卡组没有卡片。",
        studyFinished: "学习结束。",
        correctRate: "正确率",

        progressTitle: "📊 学习记录",
        progressDescription: "查看学习时间、回答次数和正确率。",
        totalAnswers: "累计回答",
        correctAnswers: "正确数",
        history: "学习历史",
        noHistory: "还没有学习记录。",
        date: "日期",
        deckName: "卡组",
        answers: "回答",
        correctColumn: "正确",

        importTitle: "📥 导入",
        importDescription: "导入TXT、CSV、PDF等教材。",
        targetDeck: "📚 添加到卡组",
        newDeck: "创建新卡组",
        addToExisting: "选择已有卡组即可添加卡片。",
        learningLanguage: "🌐 学习语言",
        selectMaterial: "选择教材",
        multipleFiles: "可以一次选择多个文件。",
        selectFile: "📂 选择文件",
        importing: "正在导入…",
        imported: "导入成功",
        importError: "导入失败",
        noCardsDetected: "没有找到可以制作成卡片的内容。",

        dataShareTitle: "🔄 数据共享",
        dataShareDescription: "在电脑和手机之间共享Language Gym数据。",
        exportTitle: "📤 导出数据",
        exportDescription: "将学习记录、卡组和设置保存为JSON文件。",
        exportData: "导出数据",
        importData: "📥 导入数据",
        importDataDescription: "导入其他设备导出的JSON文件。",
        readJSON: "导入JSON",
        backupTitle: "🛟 自动备份",
        backupDescription: "从最新的自动备份恢复。",
        restoreBackup: "恢复备份",

        settingsTitle: "⚙️ 设置",
        settingsDescription: "自定义Language Gym。",
        themeColor: "🎨 主题颜色",
        themeDescription: "从12种颜色中选择喜欢的颜色。",
        customColor: "自定义颜色",
        voice: "🔊 语音",
        autoVoice: "自动语音",
        autoVoiceDescription: "显示卡片时自动播放",
        randomStudy: "🎲 随机学习卡片",
        voiceRate: "语速",
        voicePitch: "音调",
        languageSettings: "🌐 语言设置",
        uiLanguage: "界面语言",
        learningLanguageSetting: "学习语言",

        languageChanged: "界面语言已更改。",
        learningLanguageChanged: "学习语言已更改。",
        deleteConfirm: "删除这张卡片吗？",
        deckDeleteConfirm: "删除这个卡组吗？",
        backupRestored: "已从备份恢复。",
        dataImported: "数据已导入。",
        dataExported: "数据已导出。",

        back: "返回",
        forward: "前进"
    },

    de: {
        home: "Start",
        decks: "Decks",
        study: "Lernen",
        progress: "Fortschritt",
        import: "Import",
        dataShare: "Daten",
        settings: "Einstellungen",
        subtitle: "Mehrsprachiges Sprachtraining",
        homeTitle: "Language Gym",
        homeDescription: "Trainiere deine Sprachen jeden Tag ein bisschen.",
        deck: "Decks",
        cards: "Karten",
        totalStudyTime: "Gesamte Lernzeit",
        accuracy: "Trefferquote",
        startLearning: "🚀 Lernen beginnen",
        chooseDeck: "Wähle ein Deck zum Lernen.",
        viewDecks: "📚 Decks ansehen",
        importMaterial: "📥 Material importieren",
        todayMessage: "🌱 Nachricht des Tages",
        todayForward: "Heute einen Schritt weiter!",
        deckTitle: "📚 Decks",
        deckDescription: "Verwalte deine Lernmaterialien.",
        noDecks: "Noch keine Decks vorhanden.",
        createDeck: "Material importieren",
        cardSearch: "🔎 Karten suchen",
        searchPlaceholder: "Vorder- oder Rückseite suchen",
        edit: "Bearbeiten",
        delete: "Löschen",
        cardsCount: "Karten",
        studyTitle: "🏋️ Lernen",
        chooseDeckToStudy: "Bitte wähle ein Deck.",
        studyStartMessage: "Beim Starten des Lernens werden hier Karten angezeigt.",
        showAnswer: "👀 Antwort zeigen",
        dontKnow: "❌ Nicht gewusst",
        correct: "⭕ Richtig",
        finishStudy: "Beenden",
        noCards: "Dieses Deck enthält keine Karten.",
        studyFinished: "Lerneinheit beendet.",
        correctRate: "Trefferquote",
        progressTitle: "📊 Fortschritt",
        progressDescription: "Lernzeit, Antworten und Trefferquote anzeigen.",
        totalAnswers: "Antworten insgesamt",
        correctAnswers: "Richtig",
        history: "Lernverlauf",
        noHistory: "Noch kein Lernverlauf vorhanden.",
        date: "Datum",
        deckName: "Deck",
        answers: "Antworten",
        correctColumn: "Richtig",
        importTitle: "📥 Import",
        importDescription: "TXT-, CSV-, PDF- und andere Materialien importieren.",
        targetDeck: "📚 Ziel-Deck",
        newDeck: "Neues Deck erstellen",
        addToExisting: "Wähle ein vorhandenes Deck, um Karten hinzuzufügen.",
        learningLanguage: "🌐 Lernsprache",
        selectMaterial: "Material auswählen",
        multipleFiles: "Mehrere Dateien können gleichzeitig ausgewählt werden.",
        selectFile: "📂 Dateien auswählen",
        importing: "Importiere…",
        imported: "Importiert",
        importError: "Import fehlgeschlagen",
        noCardsDetected: "Keine Karteninhalte gefunden.",
        dataShareTitle: "🔄 Datenaustausch",
        dataShareDescription: "Language-Gym-Daten zwischen PC und Smartphone teilen.",
        exportTitle: "📤 Daten exportieren",
        exportDescription: "Lernverlauf, Decks und Einstellungen als JSON speichern.",
        exportData: "Daten exportieren",
        importData: "📥 Daten importieren",
        importDataDescription: "Eine JSON-Datei von einem anderen Gerät importieren.",
        readJSON: "JSON importieren",
        backupTitle: "🛟 Automatisches Backup",
        backupDescription: "Aus dem letzten automatischen Backup wiederherstellen.",
        restoreBackup: "Backup wiederherstellen",
        settingsTitle: "⚙️ Einstellungen",
        settingsDescription: "Language Gym anpassen.",
        themeColor: "🎨 Themenfarbe",
        themeDescription: "Wähle eine von 12 Farben.",
        customColor: "Benutzerdefinierte Farbe",
        voice: "🔊 Stimme",
        autoVoice: "Automatische Stimme",
        autoVoiceDescription: "Beim Anzeigen einer Karte automatisch abspielen",
        randomStudy: "🎲 Lernkarten zufällig auswählen",
        voiceRate: "Sprechgeschwindigkeit",
        voicePitch: "Tonhöhe",
        languageSettings: "🌐 Spracheinstellungen",
        uiLanguage: "Oberflächensprache",
        learningLanguageSetting: "Lernsprache",
        languageChanged: "Oberflächensprache geändert.",
        learningLanguageChanged: "Lernsprache geändert.",
        deleteConfirm: "Diese Karte löschen?",
        deckDeleteConfirm: "Dieses Deck löschen?",
        backupRestored: "Backup wiederhergestellt.",
        dataImported: "Daten importiert.",
        dataExported: "Daten exportiert.",
        back: "Zurück",
        forward: "Weiter"
    },

    es: {
        home: "Inicio",
        decks: "Mazos",
        study: "Estudiar",
        progress: "Progreso",
        import: "Importar",
        dataShare: "Datos",
        settings: "Configuración",
        subtitle: "Entrenamiento multilingüe",
        homeTitle: "Language Gym",
        homeDescription: "Entrena tus idiomas un poco cada día.",
        deck: "Mazos",
        cards: "Tarjetas",
        totalStudyTime: "Tiempo total de estudio",
        accuracy: "Precisión",
        startLearning: "🚀 Empezar a estudiar",
        chooseDeck: "Elige un mazo para empezar.",
        viewDecks: "📚 Ver mazos",
        importMaterial: "📥 Importar material",
        todayMessage: "🌱 Mensaje de hoy",
        todayForward: "¡Hoy también, un paso adelante!",
        deckTitle: "📚 Mazos",
        deckDescription: "Gestiona tus materiales de estudio.",
        noDecks: "Todavía no hay mazos.",
        createDeck: "Importar material",
        cardSearch: "🔎 Buscar tarjetas",
        searchPlaceholder: "Buscar delante o detrás",
        edit: "Editar",
        delete: "Eliminar",
        cardsCount: "tarjetas",
        studyTitle: "🏋️ Estudiar",
        chooseDeckToStudy: "Selecciona un mazo.",
        studyStartMessage: "Las tarjetas aparecerán aquí al comenzar.",
        showAnswer: "👀 Ver respuesta",
        dontKnow: "❌ No lo sé",
        correct: "⭕ Correcto",
        finishStudy: "Terminar",
        noCards: "Este mazo no tiene tarjetas.",
        studyFinished: "Sesión terminada.",
        correctRate: "Precisión",
        progressTitle: "📊 Progreso",
        progressDescription: "Consulta tiempo, respuestas y precisión.",
        totalAnswers: "Respuestas totales",
        correctAnswers: "Correctas",
        history: "Historial",
        noHistory: "Todavía no hay historial.",
        date: "Fecha",
        deckName: "Mazo",
        answers: "Respuestas",
        correctColumn: "Correctas",
        importTitle: "📥 Importar",
        importDescription: "Importa materiales TXT, CSV, PDF y más.",
        targetDeck: "📚 Mazo de destino",
        newDeck: "Crear un nuevo mazo",
        addToExisting: "Elige un mazo existente para añadir tarjetas.",
        learningLanguage: "🌐 Idioma de aprendizaje",
        selectMaterial: "Seleccionar material",
        multipleFiles: "Puedes seleccionar varios archivos a la vez.",
        selectFile: "📂 Seleccionar archivos",
        importing: "Importando…",
        imported: "Importado",
        importError: "Error de importación",
        noCardsDetected: "No se encontraron contenidos para tarjetas.",
        dataShareTitle: "🔄 Compartir datos",
        dataShareDescription: "Comparte datos entre PC y móvil.",
        exportTitle: "📤 Exportar datos",
        exportDescription: "Guarda registros, mazos y configuración como JSON.",
        exportData: "Exportar datos",
        importData: "📥 Importar datos",
        importDataDescription: "Importa un JSON exportado desde otro dispositivo.",
        readJSON: "Importar JSON",
        backupTitle: "🛟 Copia de seguridad",
        backupDescription: "Restaura desde la última copia automática.",
        restoreBackup: "Restaurar copia",
        settingsTitle: "⚙️ Configuración",
        settingsDescription: "Personaliza Language Gym.",
        themeColor: "🎨 Color del tema",
        themeDescription: "Elige uno de los 12 colores.",
        customColor: "Color personalizado",
        voice: "🔊 Voz",
        autoVoice: "Voz automática",
        autoVoiceDescription: "Reproducir automáticamente al mostrar una tarjeta",
        randomStudy: "🎲 Tarjetas aleatorias",
        voiceRate: "Velocidad",
        voicePitch: "Tono",
        languageSettings: "🌐 Idiomas",
        uiLanguage: "Idioma de la interfaz",
        learningLanguageSetting: "Idioma de aprendizaje",
        languageChanged: "Idioma de la interfaz cambiado.",
        learningLanguageChanged: "Idioma de aprendizaje cambiado.",
        deleteConfirm: "¿Eliminar esta tarjeta?",
        deckDeleteConfirm: "¿Eliminar este mazo?",
        backupRestored: "Copia restaurada.",
        dataImported: "Datos importados.",
        dataExported: "Datos exportados.",
        back: "Atrás",
        forward: "Adelante"
    },

    fr: {
        home: "Accueil",
        decks: "Paquets",
        study: "Étudier",
        progress: "Progression",
        import: "Importer",
        dataShare: "Données",
        settings: "Paramètres",
        subtitle: "Entraînement multilingue",
        homeTitle: "Language Gym",
        homeDescription: "Entraînez vos langues un peu chaque jour.",
        deck: "Paquets",
        cards: "Cartes",
        totalStudyTime: "Temps total d'étude",
        accuracy: "Précision",
        startLearning: "🚀 Commencer",
        chooseDeck: "Choisissez un paquet.",
        viewDecks: "📚 Voir les paquets",
        importMaterial: "📥 Importer du matériel",
        todayMessage: "🌱 Message du jour",
        todayForward: "Un pas de plus aujourd'hui !",
        deckTitle: "📚 Paquets",
        deckDescription: "Gérez vos supports d'étude.",
        noDecks: "Aucun paquet pour le moment.",
        createDeck: "Importer du matériel",
        cardSearch: "🔎 Rechercher des cartes",
        searchPlaceholder: "Rechercher recto ou verso",
        edit: "Modifier",
        delete: "Supprimer",
        cardsCount: "cartes",
        studyTitle: "🏋️ Étudier",
        chooseDeckToStudy: "Veuillez choisir un paquet.",
        studyStartMessage: "Les cartes apparaîtront ici.",
        showAnswer: "👀 Voir la réponse",
        dontKnow: "❌ Je ne sais pas",
        correct: "⭕ Correct",
        finishStudy: "Terminer",
        noCards: "Ce paquet ne contient aucune carte.",
        studyFinished: "Session terminée.",
        correctRate: "Précision",
        progressTitle: "📊 Progression",
        progressDescription: "Consultez le temps, les réponses et la précision.",
        totalAnswers: "Réponses totales",
        correctAnswers: "Réponses correctes",
        history: "Historique",
        noHistory: "Aucun historique.",
        date: "Date",
        deckName: "Paquet",
        answers: "Réponses",
        correctColumn: "Correctes",
        importTitle: "📥 Importer",
        importDescription: "Importez des fichiers TXT, CSV, PDF et plus.",
        targetDeck: "📚 Paquet cible",
        newDeck: "Créer un nouveau paquet",
        addToExisting: "Choisissez un paquet existant.",
        learningLanguage: "🌐 Langue d'apprentissage",
        selectMaterial: "Sélectionner",
        multipleFiles: "Plusieurs fichiers peuvent être sélectionnés.",
        selectFile: "📂 Sélectionner les fichiers",
        importing: "Importation…",
        imported: "Importé",
        importError: "Échec de l'importation",
        noCardsDetected: "Aucun contenu exploitable trouvé.",
        dataShareTitle: "🔄 Partage de données",
        dataShareDescription: "Partagez vos données entre PC et smartphone.",
        exportTitle: "📤 Exporter les données",
        exportDescription: "Enregistrez vos données au format JSON.",
        exportData: "Exporter",
        importData: "📥 Importer les données",
        importDataDescription: "Importez un fichier JSON.",
        readJSON: "Importer JSON",
        backupTitle: "🛟 Sauvegarde automatique",
        backupDescription: "Restaurer la dernière sauvegarde.",
        restoreBackup: "Restaurer",
        settingsTitle: "⚙️ Paramètres",
        settingsDescription: "Personnalisez Language Gym.",
        themeColor: "🎨 Couleur du thème",
        themeDescription: "Choisissez parmi 12 couleurs.",
        customColor: "Couleur personnalisée",
        voice: "🔊 Voix",
        autoVoice: "Voix automatique",
        autoVoiceDescription: "Lire automatiquement à l'affichage",
        randomStudy: "🎲 Mélanger les cartes",
        voiceRate: "Vitesse",
        voicePitch: "Hauteur",
        languageSettings: "🌐 Langues",
        uiLanguage: "Langue de l'interface",
        learningLanguageSetting: "Langue d'apprentissage",
        languageChanged: "Langue de l'interface modifiée.",
        learningLanguageChanged: "Langue d'apprentissage modifiée.",
        deleteConfirm: "Supprimer cette carte ?",
        deckDeleteConfirm: "Supprimer ce paquet ?",
        backupRestored: "Sauvegarde restaurée.",
        dataImported: "Données importées.",
        dataExported: "Données exportées.",
        back: "Retour",
        forward: "Avancer"
    },

    ko: {
        home: "홈",
        decks: "덱",
        study: "학습",
        progress: "학습 기록",
        import: "가져오기",
        dataShare: "데이터",
        settings: "설정",
        subtitle: "다국어 학습 트레이닝",
        homeTitle: "Language Gym",
        homeDescription: "매일 조금씩 외국어를 훈련해 보세요.",
        deck: "덱",
        cards: "카드",
        totalStudyTime: "총 학습 시간",
        accuracy: "정답률",
        startLearning: "🚀 학습 시작",
        chooseDeck: "덱을 선택하세요.",
        viewDecks: "📚 덱 보기",
        importMaterial: "📥 교재 가져오기",
        todayMessage: "🌱 오늘의 메시지",
        todayForward: "오늘도 한 걸음 앞으로!",
        deckTitle: "📚 덱",
        deckDescription: "학습 자료를 관리합니다.",
        noDecks: "아직 덱이 없습니다.",
        createDeck: "교재 가져오기",
        cardSearch: "🔎 카드 검색",
        searchPlaceholder: "앞면 또는 뒷면 검색",
        edit: "편집",
        delete: "삭제",
        cardsCount: "카드",
        studyTitle: "🏋️ 학습",
        chooseDeckToStudy: "덱을 선택하세요.",
        studyStartMessage: "학습을 시작하면 카드가 표시됩니다.",
        showAnswer: "👀 정답 보기",
        dontKnow: "❌ 모르겠음",
        correct: "⭕ 정답",
        finishStudy: "학습 종료",
        noCards: "이 덱에는 카드가 없습니다.",
        studyFinished: "학습을 종료했습니다.",
        correctRate: "정답률",
        progressTitle: "📊 학습 기록",
        progressDescription: "학습 시간, 답변 수, 정답률을 확인하세요.",
        totalAnswers: "총 답변 수",
        correctAnswers: "정답 수",
        history: "학습 기록",
        noHistory: "아직 학습 기록이 없습니다.",
        date: "날짜",
        deckName: "덱",
        answers: "답변",
        correctColumn: "정답",
        importTitle: "📥 가져오기",
        importDescription: "TXT, CSV, PDF 등의 교재를 가져옵니다.",
        targetDeck: "📚 대상 덱",
        newDeck: "새 덱 만들기",
        addToExisting: "기존 덱을 선택하면 카드가 추가됩니다.",
        learningLanguage: "🌐 학습 언어",
        selectMaterial: "교재 선택",
        multipleFiles: "여러 파일을 한 번에 선택할 수 있습니다.",
        selectFile: "📂 파일 선택",
        importing: "가져오는 중…",
        imported: "가져왔습니다",
        importError: "가져오기 실패",
        noCardsDetected: "카드로 만들 수 있는 내용을 찾지 못했습니다.",
        dataShareTitle: "🔄 데이터 공유",
        dataShareDescription: "PC와 스마트폰 사이에서 데이터를 공유합니다.",
        exportTitle: "📤 데이터 내보내기",
        exportDescription: "학습 기록, 덱, 설정을 JSON으로 저장합니다.",
        exportData: "데이터 내보내기",
        importData: "📥 데이터 가져오기",
        importDataDescription: "다른 기기에서 내보낸 JSON을 가져옵니다.",
        readJSON: "JSON 가져오기",
        backupTitle: "🛟 자동 백업",
        backupDescription: "최신 자동 백업에서 복원합니다.",
        restoreBackup: "백업 복원",
        settingsTitle: "⚙️ 설정",
        settingsDescription: "Language Gym을 원하는 대로 설정합니다.",
        themeColor: "🎨 테마 색상",
        themeDescription: "12가지 색상 중 선택하세요.",
        customColor: "사용자 지정 색상",
        voice: "🔊 음성",
        autoVoice: "자동 음성",
        autoVoiceDescription: "카드 표시 시 자동 재생",
        randomStudy: "🎲 학습 카드를 무작위로",
        voiceRate: "음성 속도",
        voicePitch: "음성 높이",
        languageSettings: "🌐 언어 설정",
        uiLanguage: "UI 언어",
        learningLanguageSetting: "학습 언어",
        languageChanged: "UI 언어가 변경되었습니다.",
        learningLanguageChanged: "학습 언어가 변경되었습니다.",
        deleteConfirm: "이 카드를 삭제할까요?",
        deckDeleteConfirm: "이 덱을 삭제할까요?",
        backupRestored: "백업에서 복원했습니다.",
        dataImported: "데이터를 가져왔습니다.",
        dataExported: "데이터를 내보냈습니다.",
        back: "뒤로",
        forward: "앞으로"
    },

    it: {
        home: "Home",
        decks: "Mazzi",
        study: "Studio",
        progress: "Progressi",
        import: "Importa",
        dataShare: "Dati",
        settings: "Impostazioni",
        subtitle: "Allenamento multilingue",
        homeTitle: "Language Gym",
        homeDescription: "Allena le tue lingue un po' ogni giorno.",
        deck: "Mazzi",
        cards: "Carte",
        totalStudyTime: "Tempo totale",
        accuracy: "Precisione",
        startLearning: "🚀 Inizia a studiare",
        chooseDeck: "Scegli un mazzo.",
        viewDecks: "📚 Vedi mazzi",
        importMaterial: "📥 Importa materiale",
        todayMessage: "🌱 Messaggio di oggi",
        todayForward: "Un passo avanti anche oggi!",
        deckTitle: "📚 Mazzi",
        deckDescription: "Gestisci il materiale di studio.",
        noDecks: "Nessun mazzo.",
        createDeck: "Importa materiale",
        cardSearch: "🔎 Cerca carte",
        searchPlaceholder: "Cerca fronte o retro",
        edit: "Modifica",
        delete: "Elimina",
        cardsCount: "carte",
        studyTitle: "🏋️ Studio",
        chooseDeckToStudy: "Seleziona un mazzo.",
        studyStartMessage: "Le carte appariranno qui.",
        showAnswer: "👀 Mostra risposta",
        dontKnow: "❌ Non lo so",
        correct: "⭕ Corretto",
        finishStudy: "Termina",
        noCards: "Questo mazzo non contiene carte.",
        studyFinished: "Sessione terminata.",
        correctRate: "Precisione",
        progressTitle: "📊 Progressi",
        progressDescription: "Controlla tempo, risposte e precisione.",
        totalAnswers: "Risposte totali",
        correctAnswers: "Risposte corrette",
        history: "Cronologia",
        noHistory: "Nessuna cronologia.",
        date: "Data",
        deckName: "Mazzo",
        answers: "Risposte",
        correctColumn: "Corrette",
        importTitle: "📥 Importa",
        importDescription: "Importa materiali TXT, CSV, PDF e altro.",
        targetDeck: "📚 Mazzo di destinazione",
        newDeck: "Crea un nuovo mazzo",
        addToExisting: "Scegli un mazzo esistente.",
        learningLanguage: "🌐 Lingua di studio",
        selectMaterial: "Seleziona materiale",
        multipleFiles: "Puoi selezionare più file.",
        selectFile: "📂 Seleziona file",
        importing: "Importazione…",
        imported: "Importato",
        importError: "Importazione fallita",
        noCardsDetected: "Nessun contenuto trovato.",
        dataShareTitle: "🔄 Condivisione dati",
        dataShareDescription: "Condividi i dati tra PC e smartphone.",
        exportTitle: "📤 Esporta dati",
        exportDescription: "Salva dati e impostazioni in JSON.",
        exportData: "Esporta dati",
        importData: "📥 Importa dati",
        importDataDescription: "Importa un JSON da un altro dispositivo.",
        readJSON: "Importa JSON",
        backupTitle: "🛟 Backup automatico",
        backupDescription: "Ripristina l'ultimo backup.",
        restoreBackup: "Ripristina backup",
        settingsTitle: "⚙️ Impostazioni",
        settingsDescription: "Personalizza Language Gym.",
        themeColor: "🎨 Colore tema",
        themeDescription: "Scegli tra 12 colori.",
        customColor: "Colore personalizzato",
        voice: "🔊 Voce",
        autoVoice: "Voce automatica",
        autoVoiceDescription: "Riproduci automaticamente quando appare una carta",
        randomStudy: "🎲 Carte casuali",
        voiceRate: "Velocità",
        voicePitch: "Tono",
        languageSettings: "🌐 Lingue",
        uiLanguage: "Lingua interfaccia",
        learningLanguageSetting: "Lingua di studio",
        languageChanged: "Lingua dell'interfaccia modificata.",
        learningLanguageChanged: "Lingua di studio modificata.",
        deleteConfirm: "Eliminare questa carta?",
        deckDeleteConfirm: "Eliminare questo mazzo?",
        backupRestored: "Backup ripristinato.",
        dataImported: "Dati importati.",
        dataExported: "Dati esportati.",
        back: "Indietro",
        forward: "Avanti"
    },

    fi: {
        home: "Etusivu",
        decks: "Pakot",
        study: "Opiskelu",
        progress: "Edistyminen",
        import: "Tuo",
        dataShare: "Data",
        settings: "Asetukset",
        subtitle: "Monikielinen kieliharjoittelu",
        homeTitle: "Language Gym",
        homeDescription: "Harjoittele kieliäsi vähän joka päivä.",
        deck: "Pakot",
        cards: "Kortit",
        totalStudyTime: "Opiskeluaika",
        accuracy: "Tarkkuus",
        startLearning: "🚀 Aloita opiskelu",
        chooseDeck: "Valitse pakka.",
        viewDecks: "📚 Näytä pakat",
        importMaterial: "📥 Tuo materiaalia",
        todayMessage: "🌱 Päivän viesti",
        todayForward: "Askel eteenpäin tänäänkin!",
        deckTitle: "📚 Pakot",
        deckDescription: "Hallitse opiskelumateriaaleja.",
        noDecks: "Pakkoja ei vielä ole.",
        createDeck: "Tuo materiaalia",
        cardSearch: "🔎 Hae kortteja",
        searchPlaceholder: "Hae etu- tai takapuolelta",
        edit: "Muokkaa",
        delete: "Poista",
        cardsCount: "korttia",
        studyTitle: "🏋️ Opiskelu",
        chooseDeckToStudy: "Valitse pakka.",
        studyStartMessage: "Kortit näkyvät tässä, kun aloitat.",
        showAnswer: "👀 Näytä vastaus",
        dontKnow: "❌ En tiedä",
        correct: "⭕ Oikein",
        finishStudy: "Lopeta",
        noCards: "Tässä pakassa ei ole kortteja.",
        studyFinished: "Opiskelu päättyi.",
        correctRate: "Tarkkuus",
        progressTitle: "📊 Edistyminen",
        progressDescription: "Tarkista opiskeluaika, vastaukset ja tarkkuus.",
        totalAnswers: "Vastauksia yhteensä",
        correctAnswers: "Oikeat vastaukset",
        history: "Opiskeluhistoria",
        noHistory: "Opiskeluhistoriaa ei vielä ole.",
        date: "Päivä",
        deckName: "Pakka",
        answers: "Vastaukset",
        correctColumn: "Oikein",
        importTitle: "📥 Tuo",
        importDescription: "Tuo TXT-, CSV- ja PDF-materiaaleja.",
        targetDeck: "📚 Kohdepakka",
        newDeck: "Luo uusi pakka",
        addToExisting: "Valitse olemassa oleva pakka.",
        learningLanguage: "🌐 Opiskelukieli",
        selectMaterial: "Valitse materiaali",
        multipleFiles: "Voit valita useita tiedostoja.",
        selectFile: "📂 Valitse tiedostot",
        importing: "Tuodaan…",
        imported: "Tuotu",
        importError: "Tuonti epäonnistui",
        noCardsDetected: "Korttisisältöä ei löytynyt.",
        dataShareTitle: "🔄 Tietojen jako",
        dataShareDescription: "Jaa tiedot tietokoneen ja puhelimen välillä.",
        exportTitle: "📤 Vie tiedot",
        exportDescription: "Tallenna tiedot JSON-tiedostona.",
        exportData: "Vie tiedot",
        importData: "📥 Tuo tiedot",
        importDataDescription: "Tuo toisella laitteella viety JSON.",
        readJSON: "Tuo JSON",
        backupTitle: "🛟 Automaattinen varmuuskopio",
        backupDescription: "Palauta viimeisin varmuuskopio.",
        restoreBackup: "Palauta varmuuskopio",
        settingsTitle: "⚙️ Asetukset",
        settingsDescription: "Muokkaa Language Gymiä.",
        themeColor: "🎨 Teemaväri",
        themeDescription: "Valitse 12 väristä.",
        customColor: "Mukautettu väri",
        voice: "🔊 Ääni",
        autoVoice: "Automaattinen ääni",
        autoVoiceDescription: "Toista automaattisesti kortin näkyessä",
        randomStudy: "🎲 Satunnaiset kortit",
        voiceRate: "Puhenopeus",
        voicePitch: "Äänen korkeus",
        languageSettings: "🌐 Kieliasetukset",
        uiLanguage: "Käyttöliittymän kieli",
        learningLanguageSetting: "Opiskelukieli",
        languageChanged: "Käyttöliittymän kieli vaihdettu.",
        learningLanguageChanged: "Opiskelukieli vaihdettu.",
        deleteConfirm: "Poistetaanko tämä kortti?",
        deckDeleteConfirm: "Poistetaanko tämä pakka?",
        backupRestored: "Varmuuskopio palautettu.",
        dataImported: "Tiedot tuotu.",
        dataExported: "Tiedot viety.",
        back: "Takaisin",
        forward: "Eteenpäin"
    },

    ru: {
        home: "Главная",
        decks: "Колоды",
        study: "Обучение",
        progress: "Прогресс",
        import: "Импорт",
        dataShare: "Данные",
        settings: "Настройки",
        subtitle: "Многоязычная тренировка",
        homeTitle: "Language Gym",
        homeDescription: "Тренируйте языки понемногу каждый день.",
        deck: "Колоды",
        cards: "Карточки",
        totalStudyTime: "Общее время",
        accuracy: "Точность",
        startLearning: "🚀 Начать обучение",
        chooseDeck: "Выберите колоду.",
        viewDecks: "📚 Колоды",
        importMaterial: "📥 Импортировать",
        todayMessage: "🌱 Сообщение дня",
        todayForward: "Ещё один шаг вперёд!",
        deckTitle: "📚 Колоды",
        deckDescription: "Управляйте учебными материалами.",
        noDecks: "Колод пока нет.",
        createDeck: "Импортировать материал",
        cardSearch: "🔎 Поиск карточек",
        searchPlaceholder: "Поиск по лицевой или обратной стороне",
        edit: "Изменить",
        delete: "Удалить",
        cardsCount: "карточек",
        studyTitle: "🏋️ Обучение",
        chooseDeckToStudy: "Выберите колоду.",
        studyStartMessage: "После начала обучения здесь появятся карточки.",
        showAnswer: "👀 Показать ответ",
        dontKnow: "❌ Не знаю",
        correct: "⭕ Верно",
        finishStudy: "Завершить",
        noCards: "В этой колоде нет карточек.",
        studyFinished: "Сеанс завершён.",
        correctRate: "Точность",
        progressTitle: "📊 Прогресс",
        progressDescription: "Проверяйте время, ответы и точность.",
        totalAnswers: "Всего ответов",
        correctAnswers: "Правильных",
        history: "История обучения",
        noHistory: "Истории пока нет.",
        date: "Дата",
        deckName: "Колода",
        answers: "Ответы",
        correctColumn: "Верно",
        importTitle: "📥 Импорт",
        importDescription: "Импортируйте TXT, CSV, PDF и другие материалы.",
        targetDeck: "📚 Целевая колода",
        newDeck: "Создать новую колоду",
        addToExisting: "Выберите существующую колоду.",
        learningLanguage: "🌐 Язык обучения",
        selectMaterial: "Выбрать материал",
        multipleFiles: "Можно выбрать несколько файлов.",
        selectFile: "📂 Выбрать файлы",
        importing: "Импорт…",
        imported: "Импортировано",
        importError: "Ошибка импорта",
        noCardsDetected: "Подходящего содержимого не найдено.",
        dataShareTitle: "🔄 Обмен данными",
        dataShareDescription: "Обменивайтесь данными между ПК и телефоном.",
        exportTitle: "📤 Экспорт данных",
        exportDescription: "Сохраните данные и настройки в JSON.",
        exportData: "Экспортировать",
        importData: "📥 Импорт данных",
        importDataDescription: "Импортируйте JSON с другого устройства.",
        readJSON: "Импортировать JSON",
        backupTitle: "🛟 Резервная копия",
        backupDescription: "Восстановить последнюю копию.",
        restoreBackup: "Восстановить",
        settingsTitle: "⚙️ Настройки",
        settingsDescription: "Настройте Language Gym.",
        themeColor: "🎨 Цвет темы",
        themeDescription: "Выберите один из 12 цветов.",
        customColor: "Пользовательский цвет",
        voice: "🔊 Голос",
        autoVoice: "Автоматический голос",
        autoVoiceDescription: "Автоматически воспроизводить при показе карточки",
        randomStudy: "🎲 Случайные карточки",
        voiceRate: "Скорость",
        voicePitch: "Высота",
        languageSettings: "🌐 Языки",
        uiLanguage: "Язык интерфейса",
        learningLanguageSetting: "Язык обучения",
        languageChanged: "Язык интерфейса изменён.",
        learningLanguageChanged: "Язык обучения изменён.",
        deleteConfirm: "Удалить эту карточку?",
        deckDeleteConfirm: "Удалить эту колоду?",
        backupRestored: "Резервная копия восстановлена.",
        dataImported: "Данные импортированы.",
        dataExported: "Данные экспортированы.",
        back: "Назад",
        forward: "Вперёд"
    },

    pt: {
        home: "Início",
        decks: "Baralhos",
        study: "Estudar",
        progress: "Progresso",
        import: "Importar",
        dataShare: "Dados",
        settings: "Definições",
        subtitle: "Treino multilingue",
        homeTitle: "Language Gym",
        homeDescription: "Treine os seus idiomas um pouco todos os dias.",
        deck: "Baralhos",
        cards: "Cartões",
        totalStudyTime: "Tempo total",
        accuracy: "Precisão",
        startLearning: "🚀 Começar",
        chooseDeck: "Escolha um baralho.",
        viewDecks: "📚 Ver baralhos",
        importMaterial: "📥 Importar material",
        todayMessage: "🌱 Mensagem do dia",
        todayForward: "Mais um passo hoje!",
        deckTitle: "📚 Baralhos",
        deckDescription: "Gira os seus materiais de estudo.",
        noDecks: "Ainda não existem baralhos.",
        createDeck: "Importar material",
        cardSearch: "🔎 Pesquisar cartões",
        searchPlaceholder: "Pesquisar frente ou verso",
        edit: "Editar",
        delete: "Eliminar",
        cardsCount: "cartões",
        studyTitle: "🏋️ Estudar",
        chooseDeckToStudy: "Selecione um baralho.",
        studyStartMessage: "Os cartões aparecerão aqui.",
        showAnswer: "👀 Ver resposta",
        dontKnow: "❌ Não sei",
        correct: "⭕ Correto",
        finishStudy: "Terminar",
        noCards: "Este baralho não tem cartões.",
        studyFinished: "Sessão terminada.",
        correctRate: "Precisão",
        progressTitle: "📊 Progresso",
        progressDescription: "Consulte tempo, respostas e precisão.",
        totalAnswers: "Respostas totais",
        correctAnswers: "Respostas corretas",
        history: "Histórico",
        noHistory: "Ainda não existe histórico.",
        date: "Data",
        deckName: "Baralho",
        answers: "Respostas",
        correctColumn: "Corretas",
        importTitle: "📥 Importar",
        importDescription: "Importe TXT, CSV, PDF e outros materiais.",
        targetDeck: "📚 Baralho de destino",
        newDeck: "Criar novo baralho",
        addToExisting: "Escolha um baralho existente.",
        learningLanguage: "🌐 Idioma de estudo",
        selectMaterial: "Selecionar material",
        multipleFiles: "Pode selecionar vários ficheiros.",
        selectFile: "📂 Selecionar ficheiros",
        importing: "A importar…",
        imported: "Importado",
        importError: "Falha na importação",
        noCardsDetected: "Não foi encontrado conteúdo para cartões.",
        dataShareTitle: "🔄 Partilha de dados",
        dataShareDescription: "Partilhe dados entre PC e smartphone.",
        exportTitle: "📤 Exportar dados",
        exportDescription: "Guarde dados e definições em JSON.",
        exportData: "Exportar dados",
        importData: "📥 Importar dados",
        importDataDescription: "Importe um JSON de outro dispositivo.",
        readJSON: "Importar JSON",
        backupTitle: "🛟 Cópia de segurança",
        backupDescription: "Restaurar a última cópia automática.",
        restoreBackup: "Restaurar cópia",
        settingsTitle: "⚙️ Definições",
        settingsDescription: "Personalize o Language Gym.",
        themeColor: "🎨 Cor do tema",
        themeDescription: "Escolha uma das 12 cores.",
        customColor: "Cor personalizada",
        voice: "🔊 Voz",
        autoVoice: "Voz automática",
        autoVoiceDescription: "Reproduzir automaticamente ao mostrar um cartão",
        randomStudy: "🎲 Cartões aleatórios",
        voiceRate: "Velocidade",
        voicePitch: "Tom",
        languageSettings: "🌐 Idiomas",
        uiLanguage: "Idioma da interface",
        learningLanguageSetting: "Idioma de estudo",
        languageChanged: "Idioma da interface alterado.",
        learningLanguageChanged: "Idioma de estudo alterado.",
        deleteConfirm: "Eliminar este cartão?",
        deckDeleteConfirm: "Eliminar este baralho?",
        backupRestored: "Cópia restaurada.",
        dataImported: "Dados importados.",
        dataExported: "Dados exportados.",
        back: "Voltar",
        forward: "Avançar"
    }
};


/* =========================================================
   DATA
   ========================================================= */

let appData = loadData();

let studyState = {
    deckId: null,
    cards: [],
    index: 0,
    answerShown: false,
    startedAt: null,
    timerId: null,
    correct: 0,
    answers: 0
};

let pageHistory = [];
let historyIndex = -1;


/* =========================================================
   DEFAULT DATA
   ========================================================= */

function createDefaultData() {

    return {
        version: 2,

        decks: [],

        settings: {
            themeColor: DEFAULT_COLOR,
            customColor: DEFAULT_COLOR,

            autoVoice: false,
            voiceRate: 1,
            voicePitch: 1,

            uiLanguage: "ja",
            learningLanguage: "zh",

            randomStudy: true
        },

        progress: {
            totalStudyTime: 0,
            totalAnswers: 0,
            totalCorrect: 0,
            history: []
        }
    };
}


/* =========================================================
   LOAD / SAVE
   ========================================================= */

function loadData() {

    const defaults = createDefaultData();

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!raw) {
            return defaults;
        }

        const parsed =
            JSON.parse(raw);

        const data = {
            ...defaults,
            ...parsed,

            settings: {
                ...defaults.settings,
                ...(parsed.settings || {})
            },

            progress: {
                ...defaults.progress,
                ...(parsed.progress || {})
            }
        };

        if (!Array.isArray(data.decks)) {
            data.decks = [];
        }

        if (!Array.isArray(data.progress.history)) {
            data.progress.history = [];
        }

        data.decks =
            data.decks.map(normalizeDeck);

        return data;

    } catch (error) {

        console.error(
            "Language Gym load error:",
            error
        );

        return defaults;
    }
}


function saveData() {

    try {

        /*
         * 自動バックアップ
         */

        const oldData =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (oldData) {

            localStorage.setItem(
                BACKUP_KEY,
                oldData
            );

        }


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );

    } catch (error) {

        console.error(
            "Language Gym save error:",
            error
        );

        showStatus(
            "データの保存に失敗しました。",
            "error"
        );

    }
}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalizeDeck(deck) {

    const normalized = {

        id:
            deck.id ||
            createId("deck"),

        name:
            deck.name ||
            "Untitled Deck",

        language:
            deck.language ||
            appData?.settings?.learningLanguage ||
            "zh",

        createdAt:
            deck.createdAt ||
            new Date().toISOString(),

        updatedAt:
            deck.updatedAt ||
            new Date().toISOString(),

        cards:
            Array.isArray(deck.cards)
                ? deck.cards.map(normalizeCard)
                : []

    };

    return normalized;
}


function normalizeCard(card) {

    return {

        id:
            card.id ||
            createId("card"),

        front:
            String(
                card.front ??
                card.question ??
                ""
            ),

        back:
            String(
                card.back ??
                card.answer ??
                ""
            ),

        language:
            card.language ||
            appData?.settings?.learningLanguage ||
            "zh",

        createdAt:
            card.createdAt ||
            new Date().toISOString(),

        updatedAt:
            card.updatedAt ||
            new Date().toISOString(),

        stats: {
            answers:
                Number(
                    card.stats?.answers || 0
                ),

            correct:
                Number(
                    card.stats?.correct || 0
                )
        }
    };
}


/* =========================================================
   UTILS
   ========================================================= */

function createId(prefix) {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function t(key) {

    const lang =
        appData.settings.uiLanguage || "ja";

    return (
        I18N[lang]?.[key] ??
        I18N.ja[key] ??
        key
    );
}


function formatTime(seconds) {

    seconds =
        Math.max(
            0,
            Math.floor(Number(seconds) || 0)
        );

    const h =
        Math.floor(seconds / 3600);

    const m =
        Math.floor(
            (seconds % 3600) / 60
        );

    const s =
        seconds % 60;

    if (h > 0) {

        return `${h}時間 ${m}分 ${s}秒`;

    }

    if (m > 0) {

        return `${m}分 ${s}秒`;

    }

    return `${s}秒`;
}


function getLearningLanguage() {

    return (
        appData.settings.learningLanguage ||
        "zh"
    );
}


function getLearningLanguageName() {

    return (
        LANGUAGE_NAMES[
            getLearningLanguage()
        ] ||
        getLearningLanguage()
    );
}


function getLearningLocale() {

    return (
        LANGUAGE_LOCALES[
            getLearningLanguage()
        ] ||
        "en-US"
    );
}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme(color) {

    if (
        !/^#[0-9a-fA-F]{6}$/.test(color)
    ) {
        return;
    }

    const root =
        document.documentElement;

    root.style.setProperty(
        "--primary",
        color
    );

    root.style.setProperty(
        "--primary-light",
        hexToLight(color)
    );

    appData.settings.themeColor =
        color;

    updateColorSelection(color);
}


function hexToLight(hex) {

    const r =
        parseInt(
            hex.slice(1, 3),
            16
        );

    const g =
        parseInt(
            hex.slice(3, 5),
            16
        );

    const b =
        parseInt(
            hex.slice(5, 7),
            16
        );

    const factor = 0.86;

    return (
        "#" +
        [r, g, b]
            .map(
                value =>
                    Math.round(
                        value +
                        (255 - value) *
                        factor
                    )
                        .toString(16)
                        .padStart(2, "0")
                )
            .join("")
    );
}


function updateColorSelection(color) {

    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                (
                    button.dataset.color ||
                    ""
                ).toUpperCase() ===
                color.toUpperCase()
            );

        });

    const custom =
        document.getElementById(
            "custom-color"
        );

    const customValue =
        document.getElementById(
            "custom-color-value"
        );

    if (custom) {
        custom.value = color;
    }

    if (customValue) {
        customValue.textContent =
            color.toUpperCase();
    }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageName, addHistory = true) {

    const page =
        document.getElementById(
            "page-" + pageName
        );

    if (!page) {
        return;
    }


    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active-page"
            );

        });


    page.classList.add(
        "active-page"
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page ===
                pageName
            );

        });


    if (addHistory) {

        pageHistory =
            pageHistory.slice(
                0,
                historyIndex + 1
            );

        pageHistory.push(
            pageName
        );

        historyIndex =
            pageHistory.length - 1;

    }


    if (pageName === "home") {
        renderHome();
    }

    if (pageName === "decks") {
        renderDecks();
    }

    if (pageName === "progress") {
        renderProgress();
    }

    if (pageName === "import") {
        renderImportDeckSelect();
        syncImportLanguage();
    }

    if (pageName === "settings") {
        renderSettings();
    }

    closeMobileMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function goBack() {

    if (historyIndex <= 0) {
        return;
    }

    historyIndex--;

    const page =
        pageHistory[historyIndex];

    showPage(
        page,
        false
    );
}


function goForward() {

    if (
        historyIndex >=
        pageHistory.length - 1
    ) {
        return;
    }

    historyIndex++;

    const page =
        pageHistory[historyIndex];

    showPage(
        page,
        false
    );
}


/* =========================================================
   HOME
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

    if (deckCount) {

        deckCount.textContent =
            appData.decks.length;

    }

    if (cardCount) {

        cardCount.textContent =
            appData.decks.reduce(
                (total, deck) =>
                    total + deck.cards.length,
                0
            );

    }

    if (studyTime) {

        studyTime.textContent =
            formatTime(
                appData.progress.totalStudyTime
            );

    }

    if (accuracy) {

        accuracy.textContent =
            calculateAccuracy() + "%";

    }

    const header =
        document.getElementById(
            "header-language"
        );

    if (header) {

        header.textContent =
            getLearningLanguageName();

    }
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


    if (!appData.decks.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📚
                </div>

                <p>
                    ${escapeHTML(t("noDecks"))}
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    data-go-page="import"
                    onclick="showPage('import')"
                >
                    ${escapeHTML(t("createDeck"))}
                </button>

            </div>

        `;

        return;
    }


    container.innerHTML =
        appData.decks
            .map(
                deck => {

                    const langName =
                        LANGUAGE_NAMES[
                            deck.language
                        ] ||
                        deck.language ||
                        "";

                    return `

                        <div
                            class="deck-card"
                            data-deck-id="${escapeHTML(deck.id)}"
                        >

                            <div class="deck-name">
                                ${escapeHTML(deck.name)}
                            </div>

                            <div class="deck-meta">
                                ${escapeHTML(langName)}
                                ・
                                ${deck.cards.length}
                                ${escapeHTML(t("cardsCount"))}
                            </div>

                            <div
                                style="
                                    margin-top:16px;
                                    display:flex;
                                    flex-wrap:wrap;
                                    gap:8px;
                                "
                            >

                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    onclick="
                                        startStudyFromDeck(
                                            '${escapeHTML(deck.id)}'
                                        )
                                    "
                                >
                                    🏋️ ${escapeHTML(t("study"))}
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-secondary"
                                    onclick="
                                        renameDeck(
                                            '${escapeHTML(deck.id)}'
                                        )
                                    "
                                >
                                    ✏️ ${escapeHTML(t("edit"))}
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    onclick="
                                        deleteDeck(
                                            '${escapeHTML(deck.id)}'
                                        )
                                    "
                                >
                                    🗑️ ${escapeHTML(t("delete"))}
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    renderCardSearchResults(
        document.getElementById(
            "card-search-input"
        )?.value || ""
    );
}


function renameDeck(deckId) {

    const deck =
        appData.decks.find(
            item =>
                item.id === deckId
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
        name === null ||
        !name.trim()
    ) {
        return;
    }

    deck.name =
        name.trim();

    deck.updatedAt =
        new Date().toISOString();

    saveData();
    renderDecks();
    renderImportDeckSelect();
    renderHome();
}


function deleteDeck(deckId) {

    const deck =
        appData.decks.find(
            item =>
                item.id === deckId
        );

    if (!deck) {
        return;
    }

    if (
        !window.confirm(
            t("deckDeleteConfirm") +
            "\n\n" +
            deck.name
        )
    ) {
        return;
    }

    appData.decks =
        appData.decks.filter(
            item =>
                item.id !== deckId
        );

    saveData();

    renderDecks();
    renderHome();
    renderImportDeckSelect();
}


/* =========================================================
   SEARCH
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


    const q =
        query
            .trim()
            .toLowerCase();


    const results = [];


    appData.decks.forEach(
        deck => {

            deck.cards.forEach(
                card => {

                    if (
                        !q ||
                        card.front
                            .toLowerCase()
                            .includes(q) ||
                        card.back
                            .toLowerCase()
                            .includes(q)
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


    if (!results.length) {

        container.innerHTML = `
            <div
                style="
                    padding:20px 0;
                    color:var(--muted);
                "
            >
                ${escapeHTML(
                    q
                        ? "検索結果がありません。"
                        : "カードがありません。"
                )}
            </div>
        `;

        return;
    }


    container.innerHTML =
        results
            .map(
                result => `

                    <div
                        class="card-search-item"
                    >

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

                            <span
                                style="
                                    color:var(--muted);
                                    font-size:13px;
                                "
                            >
                                ${escapeHTML(
                                    result.deck.name
                                )}
                            </span>

                            <span
                                style="
                                    display:flex;
                                    gap:6px;
                                "
                            >

                                <button
                                    type="button"
                                    class="btn btn-secondary"
                                    onclick="
                                        editCard(
                                            '${escapeHTML(result.deck.id)}',
                                            '${escapeHTML(result.card.id)}'
                                        )
                                    "
                                >
                                    ✏️
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    onclick="
                                        deleteCard(
                                            '${escapeHTML(result.deck.id)}',
                                            '${escapeHTML(result.card.id)}'
                                        )
                                    "
                                >
                                    🗑️
                                </button>

                            </span>

                        </div>

                    </div>

                `
            )
            .join("");
}


function editCard(
    deckId,
    cardId
) {

    const deck =
        appData.decks.find(
            item =>
                item.id === deckId
        );

    if (!deck) {
        return;
    }

    const card =
        deck.cards.find(
            item =>
                item.id === cardId
        );

    if (!card) {
        return;
    }


    const front =
        window.prompt(
            "カード表",
            card.front
        );

    if (front === null) {
        return;
    }


    const back =
        window.prompt(
            "カード裏",
            card.back
        );

    if (back === null) {
        return;
    }


    card.front =
        front.trim();

    card.back =
        back.trim();

    card.updatedAt =
        new Date().toISOString();

    deck.updatedAt =
        new Date().toISOString();

    saveData();

    renderDecks();
    renderHome();
}


function deleteCard(
    deckId,
    cardId
) {

    const deck =
        appData.decks.find(
            item =>
                item.id === deckId
        );

    if (!deck) {
        return;
    }


    if (
        !window.confirm(
            t("deleteConfirm")
        )
    ) {
        return;
    }


    deck.cards =
        deck.cards.filter(
            card =>
                card.id !== cardId
        );

    deck.updatedAt =
        new Date().toISOString();

    saveData();

    renderDecks();
    renderHome();
}


/* =========================================================
   STUDY
   ========================================================= */

function startStudyFromDeck(
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

    if (!deck.cards.length) {

        showStatus(
            t("noCards"),
            "error"
        );

        showPage("decks");

        return;
    }


    let cards =
        deck.cards.map(
            card =>
                normalizeCard(card)
        );


    if (
        appData.settings.randomStudy
    ) {

        cards =
            shuffleArray(cards);

    }


    studyState = {

        deckId: deck.id,

        cards,

        index: 0,

        answerShown: false,

        startedAt: Date.now(),

        timerId: null,

        correct: 0,

        answers: 0

    };


    showPage("study");

    startStudyTimer();

    renderStudy();

    speakCurrentCard();

}


function startStudyTimer() {

    stopStudyTimer();

    studyState.timerId =
        setInterval(
            function () {

                const timer =
                    document.getElementById(
                        "study-timer"
                    );

                if (!timer) {
                    return;
                }

                const elapsed =
                    Math.floor(
                        (
                            Date.now() -
                            studyState.startedAt
                        ) / 1000
                    );

                timer.textContent =
                    formatTime(elapsed);

            },
            1000
        );
}


function stopStudyTimer() {

    if (
        studyState.timerId
    ) {

        clearInterval(
            studyState.timerId
        );

        studyState.timerId = null;

    }
}


function renderStudy() {

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

    const wrong =
        document.getElementById(
            "wrong-button"
        );

    const correct =
        document.getElementById(
            "correct-button"
        );


    const deck =
        appData.decks.find(
            item =>
                item.id ===
                studyState.deckId
        );


    if (deckName) {

        deckName.textContent =
            deck
                ? `${deck.name} ・ ${LANGUAGE_NAMES[deck.language] || deck.language}`
                : t("chooseDeckToStudy");

    }


    if (
        !studyState.cards.length
    ) {

        if (front) {
            front.textContent =
                t("noCards");
        }

        if (back) {
            back.hidden = true;
        }

        return;
    }


    const card =
        studyState.cards[
            studyState.index
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
            !studyState.answerShown;

    }


    if (progress) {

        progress.textContent =
            `${studyState.index + 1} / ${studyState.cards.length}`;

    }


    if (showAnswer) {

        showAnswer.disabled =
            studyState.answerShown;

    }


    if (wrong) {

        wrong.disabled =
            !studyState.answerShown;

    }


    if (correct) {

        correct.disabled =
            !studyState.answerShown;

    }


    const timer =
        document.getElementById(
            "study-timer"
        );

    if (timer) {

        const elapsed =
            Math.floor(
                (
                    Date.now() -
                    studyState.startedAt
                ) / 1000
            );

        timer.textContent =
            formatTime(elapsed);

    }
}


function showStudyAnswer() {

    if (
        !studyState.cards.length
    ) {
        return;
    }

    studyState.answerShown =
        true;

    renderStudy();

    speakCurrentCard();
}


function handleStudyCorrect() {

    handleStudyAnswer(true);
}


function handleStudyWrong() {

    handleStudyAnswer(false);
}


function handleStudyAnswer(
    isCorrect
) {

    if (
        !studyState.answerShown
    ) {
        return;
    }


    const card =
        studyState.cards[
            studyState.index
        ];


    if (!card) {
        return;
    }


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

            original.stats =
                original.stats || {
                    answers: 0,
                    correct: 0
                };

            original.stats.answers++;

            if (isCorrect) {
                original.stats.correct++;
            }

        }

    }


    studyState.answers++;

    if (isCorrect) {
        studyState.correct++;
    }


    appData.progress.totalAnswers++;

    if (isCorrect) {
        appData.progress.totalCorrect++;
    }


    studyState.index++;

    studyState.answerShown =
        false;


    if (
        studyState.index >=
        studyState.cards.length
    ) {

        finishStudy();

        return;
    }


    saveData();

    renderStudy();

    speakCurrentCard();
}


function finishStudy() {

    stopStudyTimer();


    if (
        !studyState.startedAt
    ) {

        showPage("decks");

        return;
    }


    const elapsed =
        Math.floor(
            (
                Date.now() -
                studyState.startedAt
            ) / 1000
        );


    appData.progress.totalStudyTime +=
        Math.max(0, elapsed);


    if (
        studyState.answers > 0
    ) {

        appData.progress.history.unshift({

            id:
                createId("history"),

            date:
                new Date().toISOString(),

            deckId:
                studyState.deckId,

            deckName:
                getDeckName(
                    studyState.deckId
                ),

            answers:
                studyState.answers,

            correct:
                studyState.correct,

            accuracy:
                Math.round(
                    (
                        studyState.correct /
                        studyState.answers
                    ) * 100
                ),

            duration:
                elapsed

        });

        appData.progress.history =
            appData.progress.history
                .slice(0, 100);

    }


    saveData();

    const finishedAnswers =
        studyState.answers;

    const finishedCorrect =
        studyState.correct;


    studyState = {

        deckId: null,
        cards: [],
        index: 0,
        answerShown: false,
        startedAt: null,
        timerId: null,
        correct: 0,
        answers: 0

    };


    renderHome();
    renderProgress();

    showPage("progress");

    if (finishedAnswers > 0) {

        showStatus(
            `${t("studyFinished")} ` +
            `${finishedCorrect}/${finishedAnswers}`,
            "success"
        );

    }
}


function getDeckName(deckId) {

    const deck =
        appData.decks.find(
            item =>
                item.id === deckId
        );

    return deck
        ? deck.name
        : "";
}


/* =========================================================
   VOICE
   ========================================================= */

function speakCurrentCard() {

    if (
        !appData.settings.autoVoice
    ) {
        return;
    }

    speakText(
        studyState.answerShown
            ? studyState.cards[
                studyState.index
            ]?.back
            : studyState.cards[
                studyState.index
            ]?.front
    );
}


function speakText(text) {

    if (
        !text ||
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


    utterance.lang =
        getLearningLocale();

    utterance.rate =
        Number(
            appData.settings.voiceRate
        ) || 1;

    utterance.pitch =
        Number(
            appData.settings.voicePitch
        ) || 1;


    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   PROGRESS
   ========================================================= */

function calculateAccuracy() {

    const total =
        Number(
            appData.progress.totalAnswers
        ) || 0;

    const correct =
        Number(
            appData.progress.totalCorrect
        ) || 0;

    if (!total) {
        return 0;
    }

    return Math.round(
        (correct / total) * 100
    );
}


function renderProgress() {

    const totalTime =
        document.getElementById(
            "progress-total-time"
        );

    const totalAnswers =
        document.getElementById(
            "progress-total-answers"
        );

    const totalCorrect =
        document.getElementById(
            "progress-total-correct"
        );

    const accuracy =
        document.getElementById(
            "progress-accuracy"
        );


    if (totalTime) {

        totalTime.textContent =
            formatTime(
                appData.progress.totalStudyTime
            );

    }

    if (totalAnswers) {

        totalAnswers.textContent =
            appData.progress.totalAnswers;

    }

    if (totalCorrect) {

        totalCorrect.textContent =
            appData.progress.totalCorrect;

    }

    if (accuracy) {

        accuracy.textContent =
            calculateAccuracy() + "%";

    }


    const table =
        document.getElementById(
            "progress-table"
        );

    if (!table) {
        return;
    }


    const history =
        appData.progress.history || [];


    if (!history.length) {

        table.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(t("noHistory"))}
            </div>
        `;

        return;
    }


    table.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            ${escapeHTML(t("date"))}
                        </th>

                        <th>
                            ${escapeHTML(t("deckName"))}
                        </th>

                        <th>
                            ${escapeHTML(t("answers"))}
                        </th>

                        <th>
                            ${escapeHTML(t("correctColumn"))}
                        </th>

                        <th>
                            ${escapeHTML(t("correctRate"))}
                        </th>

                        <th>
                            ${escapeHTML(t("totalStudyTime"))}
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${history
                        .map(
                            item => `

                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            new Date(
                                                item.date
                                            ).toLocaleString(
                                                appData.settings.uiLanguage
                                            )
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            item.deckName
                                        )}
                                    </td>

                                    <td>
                                        ${item.answers}
                                    </td>

                                    <td>
                                        ${item.correct}
                                    </td>

                                    <td>
                                        ${item.accuracy}%
                                    </td>

                                    <td>
                                        ${formatTime(
                                            item.duration
                                        )}
                                    </td>

                                </tr>

                            `
                        )
                        .join("")}

                </tbody>

            </table>

        </div>

    `;
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


    select.innerHTML = `

        <option value="">
            ${escapeHTML(t("newDeck"))}
        </option>

    `;


    appData.decks.forEach(
        deck => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                deck.id;

            option.textContent =
                `${deck.name} ・ ${LANGUAGE_NAMES[deck.language] || deck.language}`;

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


function syncImportLanguage() {

    const select =
        document.getElementById(
            "import-language-select"
        );

    if (!select) {
        return;
    }


    const learning =
        getLearningLanguage();


    /*
     * index.htmlに存在しない言語でも
     * 自動的にoptionを追加する。
     */

    ensureLanguageOption(
        select,
        learning
    );


    select.value =
        learning;
}


function ensureLanguageOption(
    select,
    code
) {

    if (
        select.querySelector(
            `option[value="${code}"]`
        )
    ) {
        return;
    }


    const option =
        document.createElement(
            "option"
        );

    option.value =
        code;

    option.textContent =
        LANGUAGE_NAMES[code] ||
        code;

    select.appendChild(
        option
    );
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


    if (status) {

        status.innerHTML = `
            <div
                style="
                    padding:14px;
                    border-radius:12px;
                    background:var(--primary-light);
                    color:var(--primary);
                "
            >
                ${escapeHTML(t("importing"))}
                <br>
                ${escapeHTML(file.name)}
            </div>
        `;

    }


    try {

        const extension =
            getFileExtension(
                file.name
            );


        let cards = [];


        if (
            extension === "txt"
        ) {

            const text =
                await file.text();

            cards =
                parseTextToCards(
                    text
                );

        } else if (
            extension === "csv"
        ) {

            const text =
                await file.text();

            cards =
                parseCSVToCards(
                    text
                );

        } else if (
            extension === "pdf"
        ) {

            cards =
                await parsePDFToCards(
                    file
                );

        } else {

            throw new Error(
                "Unsupported file type"
            );

        }


        if (!cards.length) {

            throw new Error(
                t("noCardsDetected")
            );

        }


        const deckSelect =
            document.getElementById(
                "import-deck-select"
            );

        const languageSelect =
            document.getElementById(
                "import-language-select"
            );


        const selectedDeckId =
            deckSelect?.value || "";


        const language =
            languageSelect?.value ||
            getLearningLanguage();


        let deck;


        if (selectedDeckId) {

            deck =
                appData.decks.find(
                    item =>
                        item.id ===
                        selectedDeckId
                );

        }


        if (!deck) {

            const baseName =
                file.name
                    .replace(
                        /\.[^/.]+$/,
                        ""
                    )
                    .trim() ||
                "Imported Deck";


            deck = {

                id:
                    createId("deck"),

                name:
                    baseName,

                language,

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString(),

                cards: []

            };


            appData.decks.push(
                deck
            );

        }


        const normalizedCards =
            cards.map(
                card => ({

                    ...normalizeCard(
                        card
                    ),

                    language

                })
            );


        deck.cards.push(
            ...normalizedCards
        );


        deck.language =
            language;

        deck.updatedAt =
            new Date().toISOString();


        saveData();

        renderHome();
        renderDecks();
        renderImportDeckSelect();


        if (status) {

            status.innerHTML = `

                <div
                    style="
                        padding:14px;
                        border-radius:12px;
                        background:#edf9f0;
                        color:#287a3e;
                    "
                >
                    ✅
                    ${escapeHTML(t("imported"))}
                    <strong>
                        ${escapeHTML(file.name)}
                    </strong>
                    <br>
                    ${normalizedCards.length}
                    ${escapeHTML(t("cardsCount"))}
                    ・
                    ${escapeHTML(
                        LANGUAGE_NAMES[language] ||
                        language
                    )}
                </div>

            `;

        }


    } catch (error) {

        console.error(
            "Import error:",
            error
        );


        if (status) {

            status.innerHTML = `

                <div
                    style="
                        padding:14px;
                        border-radius:12px;
                        background:#fff0f2;
                        color:#c43e59;
                    "
                >
                    ❌
                    ${escapeHTML(t("importError"))}
                    <br>
                    ${escapeHTML(
                        error.message ||
                        String(error)
                    )}
                </div>

            `;

        }

    }
}


function getFileExtension(
    fileName
) {

    const parts =
        String(fileName)
            .toLowerCase()
            .split(".");

    return parts.length > 1
        ? parts.pop()
        : "";
}


/* =========================================================
   TXT PARSER
   ========================================================= */

function parseTextToCards(
    text
) {

    const normalized =
        String(text || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");


    const lines =
        normalized
            .split("\n")
            .map(
                line =>
                    line.trim()
            )
            .filter(Boolean);


    const cards = [];


    lines.forEach(
        line => {

            let front = "";
            let back = "";


            /*
             * タブ
             */

            if (
                line.includes("\t")
            ) {

                const parts =
                    line.split("\t");

                front =
                    parts.shift().trim();

                back =
                    parts.join("\t").trim();

            }


            /*
             * |||
             */

            else if (
                line.includes("|||")
            ) {

                const parts =
                    line.split("|||");

                front =
                    parts.shift().trim();

                back =
                    parts.join("|||").trim();

            }


            /*
             * =>
             */

            else if (
                line.includes("=>")
            ) {

                const parts =
                    line.split("=>");

                front =
                    parts.shift().trim();

                back =
                    parts.join("=>").trim();

            }


            /*
             * →
             */

            else if (
                line.includes("→")
            ) {

                const parts =
                    line.split("→");

                front =
                    parts.shift().trim();

                back =
                    parts.join("→").trim();

            }


            /*
             * ｜ 
             */

            else if (
                line.includes("｜")
            ) {

                const parts =
                    line.split("｜");

                front =
                    parts.shift().trim();

                back =
                    parts.join("｜").trim();

            }


            /*
             * 通常の | 
             */

            else if (
                line.includes("|")
            ) {

                const parts =
                    line.split("|");

                front =
                    parts.shift().trim();

                back =
                    parts.join("|").trim();

            }


            /*
             * セミコロン
             */

            else if (
                line.includes(";")
            ) {

                const parts =
                    line.split(";");

                if (parts.length >= 2) {

                    front =
                        parts.shift().trim();

                    back =
                        parts.join(";").trim();

                }

            }


            /*
             * それ以外は
             * 1行を表面として扱い、
             * 次の行を裏面にする処理は
             * 後段で行う。
             */

            if (front && back) {

                cards.push({
                    front,
                    back
                });

            }

        }
    );


    /*
     * 区切り記号がない教材用。
     * 2行1組としてカード化。
     */

    if (!cards.length) {

        for (
            let i = 0;
            i < lines.length - 1;
            i += 2
        ) {

            const front =
                lines[i];

            const back =
                lines[i + 1];

            if (front && back) {

                cards.push({
                    front,
                    back
                });

            }

        }

    }


    return removeDuplicateCards(
        cards
    );
}


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSVToCards(
    text
) {

    const rows =
        parseCSVRows(
            String(text || "")
        );


    if (!rows.length) {
        return [];
    }


    let startIndex = 0;


    /*
     * 先頭行が
     * front/back/question/answer
     * ならヘッダーとして扱う。
     */

    const first =
        rows[0]
            .map(
                cell =>
                    cell
                        .trim()
                        .toLowerCase()
            );


    const looksLikeHeader =
        first.some(
            value =>
                [
                    "front",
                    "back",
                    "question",
                    "answer",
                    "表",
                    "裏",
                    "問題",
                    "答え"
                ].includes(value)
        );


    if (looksLikeHeader) {
        startIndex = 1;
    }


    const cards = [];


    for (
        let i = startIndex;
        i < rows.length;
        i++
    ) {

        const row =
            rows[i];

        if (
            !row ||
            row.length < 2
        ) {
            continue;
        }


        const front =
            String(
                row[0] || ""
            ).trim();

        const back =
            row
                .slice(1)
                .join(",")
                .trim();


        if (
            front &&
            back
        ) {

            cards.push({
                front,
                back
            });

        }

    }


    return removeDuplicateCards(
        cards
    );
}


function parseCSVRows(
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


        if (char === '"') {

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
            (char === "\n" ||
                char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }

            row.push(cell);
            cell = "";

            if (
                row.some(
                    value =>
                        value.trim() !== ""
                )
            ) {

                rows.push(row);

            }

            row = [];

            continue;
        }


        cell += char;

    }


    if (
        cell !== "" ||
        row.length
    ) {

        row.push(cell);

        if (
            row.some(
                value =>
                    value.trim() !== ""
            )
        ) {

            rows.push(row);

        }

    }


    return rows;
}


/* =========================================================
   PDF PARSER
   ========================================================= */

let pdfjsPromise = null;


async function loadPDFJS() {

    if (pdfjsPromise) {
        return pdfjsPromise;
    }


    pdfjsPromise =
        new Promise(
            (resolve, reject) => {

                if (
                    window.pdfjsLib
                ) {

                    resolve(
                        window.pdfjsLib
                    );

                    return;
                }


                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

                script.type =
                    "module";


                /*
                 * PDF.jsのES moduleを
                 * dynamic importで読み込む。
                 */

                import(
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs"
                )
                    .then(
                        pdfjs => {

                            window.pdfjsLib =
                                pdfjs;

                            resolve(pdfjs);

                        }
                    )
                    .catch(
                        error => {

                            pdfjsPromise =
                                null;

                            reject(error);

                        }
                    );

            }
        );


    return pdfjsPromise;
}


async function parsePDFToCards(
    file
) {

    const pdfjsLib =
        await loadPDFJS();


    const buffer =
        await file.arrayBuffer();


    const pdf =
        await pdfjsLib.getDocument({
            data: buffer
        }).promise;


    const pageTexts = [];


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


        const text =
            content.items
                .map(
                    item =>
                        item.str || ""
                )
                .join(" ");


        pageTexts.push(
            text
        );

    }


    const fullText =
        pageTexts.join("\n");


    return parseTextToCards(
        fullText
    );
}


/* =========================================================
   CARD HELPERS
   ========================================================= */

function removeDuplicateCards(
    cards
) {

    const seen =
        new Set();

    return cards.filter(
        card => {

            const key =
                (
                    card.front +
                    "\n" +
                    card.back
                )
                    .trim()
                    .toLowerCase();

            if (!key) {
                return false;
            }

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);

            return true;

        }
    );
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


        const a =
            document.createElement(
                "a"
            );

        a.href =
            url;

        a.download =
            `language-gym-backup-${getDateStamp()}.json`;

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(
            url
        );


        showStatus(
            t("dataExported"),
            "success"
        );

    } catch (error) {

        console.error(error);

        showStatus(
            "JSON export failed.",
            "error"
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
        function () {

            try {

                const imported =
                    JSON.parse(
                        reader.result
                    );


                if (
                    !imported ||
                    !Array.isArray(
                        imported.decks
                    )
                ) {

                    throw new Error(
                        "Invalid Language Gym data."
                    );

                }


                const defaults =
                    createDefaultData();


                appData = {

                    ...defaults,

                    ...imported,

                    settings: {
                        ...defaults.settings,
                        ...(imported.settings || {})
                    },

                    progress: {
                        ...defaults.progress,
                        ...(imported.progress || {})
                    }

                };


                appData.decks =
                    appData.decks.map(
                        normalizeDeck
                    );


                saveData();

                applyTheme(
                    appData.settings.themeColor ||
                    DEFAULT_COLOR
                );

                applyUILanguage();

                renderHome();
                renderDecks();
                renderProgress();
                renderImportDeckSelect();
                renderSettings();


                showStatus(
                    t("dataImported"),
                    "success"
                );


            } catch (error) {

                console.error(
                    "JSON import error:",
                    error
                );


                showStatus(
                    "JSONデータを読み込めませんでした。",
                    "error"
                );

            }

        };


    reader.readAsText(
        file,
        "utf-8"
    );
}


/* =========================================================
   BACKUP
   ========================================================= */

function restoreAutomaticBackup() {

    try {

        const raw =
            localStorage.getItem(
                BACKUP_KEY
            );


        if (!raw) {

            showStatus(
                "自動バックアップがありません。",
                "error"
            );

            return;
        }


        if (
            !window.confirm(
                "最新の自動バックアップから復元しますか？"
            )
        ) {
            return;
        }


        appData =
            JSON.parse(raw);


        appData =
            {
                ...createDefaultData(),
                ...appData,

                settings: {
                    ...createDefaultData().settings,
                    ...(appData.settings || {})
                },

                progress: {
                    ...createDefaultData().progress,
                    ...(appData.progress || {})
                }
            };


        appData.decks =
            Array.isArray(appData.decks)
                ? appData.decks.map(
                    normalizeDeck
                )
                : [];


        saveData();


        applyTheme(
            appData.settings.themeColor ||
            DEFAULT_COLOR
        );

        applyUILanguage();

        renderHome();
        renderDecks();
        renderProgress();
        renderImportDeckSelect();
        renderSettings();


        showStatus(
            t("backupRestored"),
            "success"
        );


    } catch (error) {

        console.error(
            "Backup restore error:",
            error
        );


        showStatus(
            "バックアップを復元できませんでした。",
            "error"
        );

    }
}


/* =========================================================
   SETTINGS
   ========================================================= */

function saveSetting(
    key,
    value
) {

    appData.settings[key] =
        value;

    saveData();
}


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


    if (voiceRate) {

        voiceRate.value =
            settings.voiceRate || 1;

    }


    if (voicePitch) {

        voicePitch.value =
            settings.voicePitch || 1;

    }


    if (uiLanguage) {

        ensureUILanguageOptions(
            uiLanguage
        );

        uiLanguage.value =
            settings.uiLanguage || "ja";

    }


    if (learningLanguage) {

        ensureLearningLanguageOptions(
            learningLanguage
        );

        learningLanguage.value =
            settings.learningLanguage ||
            "zh";

    }


    applyTheme(
        settings.themeColor ||
        DEFAULT_COLOR
    );
}


/* =========================================================
   UI LANGUAGE OPTIONS
   ========================================================= */

function ensureUILanguageOptions(
    select
) {

    const current =
        select.value;


    select.innerHTML = "";


    Object.entries(
        LANGUAGE_NAMES
    ).forEach(
        ([code, name]) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                code;

            option.textContent =
                name;

            select.appendChild(
                option
            );

        }
    );


    select.value =
        current ||
        appData.settings.uiLanguage ||
        "ja";
}


function ensureLearningLanguageOptions(
    select
) {

    const current =
        select.value;


    select.innerHTML = "";


    Object.entries(
        LANGUAGE_NAMES
    )
        .filter(
            ([code]) =>
                code !== "en" ||
                true
        )
        .forEach(
            ([code, name]) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    code;

                option.textContent =
                    name;

                select.appendChild(
                    option
                );

            }
        );


    select.value =
        current ||
        appData.settings.learningLanguage ||
        "zh";
}


/* =========================================================
   UI TRANSLATION
   ========================================================= */

function applyUILanguage() {

    const lang =
        appData.settings.uiLanguage ||
        "ja";


    document.documentElement.lang =
        lang;


    /*
     * Sidebar
     */

    setText(
        '[data-page="home"]',
        `🏠 ${t("home")}`
    );

    setText(
        '[data-page="decks"]',
        `📚 ${t("decks")}`
    );

    setText(
        '[data-page="study"]',
        `🏋️ ${t("study")}`
    );

    setText(
        '[data-page="progress"]',
        `📊 ${t("progress")}`
    );

    setText(
        '[data-page="import"]',
        `📥 ${t("import")}`
    );

    setText(
        '[data-page="data-share"]',
        `🔄 ${t("dataShare")}`
    );

    setText(
        '[data-page="settings"]',
        `⚙️ ${t("settings")}`
    );


    /*
     * Logo
     */

    const subtitle =
        document.querySelector(
            ".logo-subtitle"
        );

    if (subtitle) {

        subtitle.textContent =
            t("subtitle");

    }


    /*
     * Home
     */

    setText(
        "#page-home .page-title",
        t("homeTitle")
    );

    setText(
        "#page-home .page-description",
        t("homeDescription")
    );


    setText(
        "#page-home .stat-label:nth-of-type(1)",
        t("deck")
    );


    /*
     * より安全にstat-labelを順番で処理
     */

    const homeLabels =
        document.querySelectorAll(
            "#page-home .stat-label"
        );

    if (homeLabels[0]) {
        homeLabels[0].textContent =
            t("deck");
    }

    if (homeLabels[1]) {
        homeLabels[1].textContent =
            t("cards");
    }

    if (homeLabels[2]) {
        homeLabels[2].textContent =
            t("totalStudyTime");
    }

    if (homeLabels[3]) {
        homeLabels[3].textContent =
            t("accuracy");
    }


    const homeStart =
        document.querySelector(
            "#page-home .card h2"
        );

    /*
     * 固定文言は以下で直接指定
     */

    const homeCards =
        document.querySelectorAll(
            "#page-home .card"
        );


    if (homeCards[4]) {

        const h2 =
            homeCards[4]
                .querySelector("h2");

        const p =
            homeCards[4]
                .querySelector("p");

        if (h2) {
            h2.textContent =
                t("startLearning");
        }

        if (p) {
            p.textContent =
                t("chooseDeck");
        }

        const buttons =
            homeCards[4]
                .querySelectorAll(
                    "[data-go-page]"
                );

        if (buttons[0]) {
            buttons[0].textContent =
                t("viewDecks");
        }

        if (buttons[1]) {
            buttons[1].textContent =
                t("importMaterial");
        }

    }


    if (homeCards[5]) {

        const h2 =
            homeCards[5]
                .querySelector("h2");

        if (h2) {
            h2.textContent =
                t("todayMessage");
        }

    }


    const daily =
        document.getElementById(
            "daily-message"
        );

    if (daily) {
        daily.textContent =
            t("todayForward");
    }


    /*
     * Deck
     */

    setText(
        "#page-decks .page-title",
        t("deckTitle")
    );

    setText(
        "#page-decks .page-description",
        t("deckDescription")
    );


    const searchTitle =
        document.querySelector(
            "#page-decks .card h2"
        );

    if (searchTitle) {
        searchTitle.textContent =
            t("cardSearch");
    }


    const searchInput =
        document.getElementById(
            "card-search-input"
        );

    if (searchInput) {

        searchInput.placeholder =
            t("searchPlaceholder");

    }


    /*
     * Study
     */

    setText(
        "#page-study .page-title",
        t("studyTitle")
    );

    setText(
        "#show-answer-button",
        t("showAnswer")
    );

    setText(
        "#wrong-button",
        t("dontKnow")
    );

    setText(
        "#correct-button",
        t("correct")
    );

    setText(
        "#finish-study-button",
        t("finishStudy")
    );


    /*
     * Progress
     */

    setText(
        "#page-progress .page-title",
        t("progressTitle")
    );

    setText(
        "#page-progress .page-description",
        t("progressDescription")
    );


    const progressLabels =
        document.querySelectorAll(
            "#page-progress .stat-label"
        );

    if (progressLabels[0]) {
        progressLabels[0].textContent =
            t("totalStudyTime");
    }

    if (progressLabels[1]) {
        progressLabels[1].textContent =
            t("totalAnswers");
    }

    if (progressLabels[2]) {
        progressLabels[2].textContent =
            t("correctAnswers");
    }

    if (progressLabels[3]) {
        progressLabels[3].textContent =
            t("accuracy");
    }


    const progressH2 =
        document.querySelector(
            "#page-progress .card h2"
        );

    if (progressH2) {
        progressH2.textContent =
            t("history");
    }


    /*
     * Import
     */

    setText(
        "#page-import .page-title",
        t("importTitle")
    );

    setText(
        "#page-import .page-description",
        t("importDescription")
    );


    const importLabels =
        document.querySelectorAll(
            "#page-import .form-label"
        );

    if (importLabels[0]) {
        importLabels[0].textContent =
            t("targetDeck");
    }

    if (importLabels[1]) {
        importLabels[1].textContent =
            t("learningLanguage");
    }


    const selectFileButton =
        document.getElementById(
            "select-file-button"
        );

    if (selectFileButton) {

        selectFileButton.textContent =
            t("selectFile");

    }


    /*
     * Data Share
     */

    setText(
        "#page-data-share .page-title",
        t("dataShareTitle")
    );

    setText(
        "#page-data-share .page-description",
        t("dataShareDescription")
    );


    const shareCards =
        document.querySelectorAll(
            "#page-data-share .card"
        );

    if (shareCards[0]) {

        const h2 =
            shareCards[0]
                .querySelector("h2");

        const p =
            shareCards[0]
                .querySelector("p");

        const button =
            shareCards[0]
                .querySelector("button");

        if (h2) {
            h2.textContent =
                t("exportTitle");
        }

        if (p) {
            p.textContent =
                t("exportDescription");
        }

        if (button) {
            button.textContent =
                t("exportData");
        }

    }


    if (shareCards[1]) {

        const h2 =
            shareCards[1]
                .querySelector("h2");

        const p =
            shareCards[1]
                .querySelector("p");

        const button =
            shareCards[1]
                .querySelector("button");

        if (h2) {
            h2.textContent =
                t("importData");
        }

        if (p) {
            p.textContent =
                t("importDataDescription");
        }

        if (button) {
            button.textContent =
                t("readJSON");
        }

    }


    if (shareCards[2]) {

        const h2 =
            shareCards[2]
                .querySelector("h2");

        const p =
            shareCards[2]
                .querySelector("p");

        const button =
            shareCards[2]
                .querySelector("button");

        if (h2) {
            h2.textContent =
                t("backupTitle");
        }

        if (p) {
            p.textContent =
                t("backupDescription");
        }

        if (button) {
            button.textContent =
                t("restoreBackup");
        }

    }


    /*
     * Settings
     */

    setText(
        "#page-settings .page-title",
        t("settingsTitle")
    );

    setText(
        "#page-settings .page-description",
        t("settingsDescription")
    );


    const settingsCards =
        document.querySelectorAll(
            "#page-settings .card"
        );


    if (settingsCards[0]) {

        const h2 =
            settingsCards[0]
                .querySelector("h2");

        const p =
            settingsCards[0]
                .querySelector("p");

        if (h2) {
            h2.textContent =
                t("themeColor");
        }

        if (p) {
            p.textContent =
                t("themeDescription");
        }

    }


    if (settingsCards[1]) {

        const h2 =
            settingsCards[1]
                .querySelector("h2");

        if (h2) {
            h2.textContent =
                t("voice");
        }

        const labels =
            settingsCards[1]
                .querySelectorAll(
                    ".form-label"
                );

        if (labels[0]) {
            labels[0].textContent =
                t("autoVoice");
        }

        if (labels[1]) {
            labels[1].textContent =
                t("voiceRate");
        }

        if (labels[2]) {
            labels[2].textContent =
                t("voicePitch");
        }

        const autoLabel =
            settingsCards[1]
                .querySelector(
                    'label[style*="display:flex"]'
                );

        if (autoLabel) {

            const span =
                autoLabel.querySelector(
                    "span"
                );

            if (span) {
                span.textContent =
                    t("randomStudy");
            }

        }

    }


    if (settingsCards[2]) {

        const h2 =
            settingsCards[2]
                .querySelector("h2");

        if (h2) {
            h2.textContent =
                t("languageSettings");
        }

        const labels =
            settingsCards[2]
                .querySelectorAll(
                    ".form-label"
                );

        if (labels[0]) {
            labels[0].textContent =
                t("uiLanguage");
        }

        if (labels[1]) {
            labels[1].textContent =
                t("learningLanguageSetting");
        }

    }


    /*
     * UI language options
     */

    const uiSelect =
        document.getElementById(
            "ui-language"
        );

    if (uiSelect) {
        ensureUILanguageOptions(
            uiSelect
        );
    }


    /*
     * Learning language options
     */

    const learningSelect =
        document.getElementById(
            "learning-language"
        );

    if (learningSelect) {
        ensureLearningLanguageOptions(
            learningSelect
        );
    }


    /*
     * Import language options
     */

    const importLanguage =
        document.getElementById(
            "import-language-select"
        );

    if (importLanguage) {

        Object.entries(
            LANGUAGE_NAMES
        ).forEach(
            ([code, name]) =>
                ensureLanguageOption(
                    importLanguage,
                    code
                )
        );

    }


    /*
     * Header language
     */

    const header =
        document.getElementById(
            "header-language"
        );

    if (header) {

        header.textContent =
            getLearningLanguageName();

    }


    /*
     * Buttons
     */

    const back =
        document.querySelector(
            ".btn-back"
        );

    const forward =
        document.querySelector(
            ".btn-forward"
        );

    if (back) {
        back.title = t("back");
        back.setAttribute(
            "aria-label",
            t("back")
        );
    }

    if (forward) {
        forward.title = t("forward");
        forward.setAttribute(
            "aria-label",
            t("forward")
        );
    }


    /*
     * 再描画
     */

    renderHome();
    renderDecks();
    renderProgress();
    renderImportDeckSelect();
    syncImportLanguage();

}


function setText(
    selector,
    text
) {

    const element =
        document.querySelector(
            selector
        );

    if (element) {
        element.textContent =
            text;
    }
}


/* =========================================================
   STATUS
   ========================================================= */

function showStatus(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "import-status"
        );

    if (!container) {
        return;
    }


    const isError =
        type === "error";


    container.innerHTML = `

        <div
            style="
                margin-top:15px;
                padding:14px;
                border-radius:12px;
                background:
                    ${isError
                        ? "#fff0f2"
                        : "#edf9f0"};
                color:
                    ${isError
                        ? "#c43e59"
                        : "#287a3e"};
            "
        >
            ${isError ? "❌" : "✅"}
            ${escapeHTML(message)}
        </div>

    `;


    setTimeout(
        function () {

            if (
                container.textContent
            ) {

                container.innerHTML =
                    "";

            }

        },
        3500
    );
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function closeMobileMenu() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "mobile-menu-overlay"
        );

    const button =
        document.getElementById(
            "mobile-menu-button"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

    if (overlay) {

        overlay.classList.remove(
            "open"
        );

    }

    document.body.classList.remove(
        "mobile-menu-open"
    );


    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        button.setAttribute(
            "aria-label",
            "メニューを開く"
        );

    }
}


/* =========================================================
   DATE
   ========================================================= */

function getDateStamp() {

    const date =
        new Date();

    return [
        date.getFullYear(),
        String(
            date.getMonth() + 1
        ).padStart(2, "0"),
        String(
            date.getDate()
        ).padStart(2, "0")
    ].join("-");
}


/* =========================================================
   GLOBAL EXPORTS
   ========================================================= */

window.appData = appData;

window.showPage =
    showPage;

window.goBack =
    goBack;

window.goForward =
    goForward;

window.saveData =
    saveData;

window.applyTheme =
    applyTheme;

window.escapeHTML =
    escapeHTML;

window.handleFileImport =
    handleFileImport;

window.importDataJSON =
    importDataJSON;

window.exportDataJSON =
    exportDataJSON;

window.restoreAutomaticBackup =
    restoreAutomaticBackup;

window.renderImportDeckSelect =
    renderImportDeckSelect;

window.renderCardSearchResults =
    renderCardSearchResults;

window.showStudyAnswer =
    showStudyAnswer;

window.handleStudyWrong =
    handleStudyWrong;

window.handleStudyCorrect =
    handleStudyCorrect;

window.finishStudy =
    finishStudy;

window.startStudyFromDeck =
    startStudyFromDeck;

window.editCard =
    editCard;

window.deleteCard =
    deleteCard;

window.deleteDeck =
    deleteDeck;

window.renameDeck =
    renameDeck;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * 初期テーマ
         */

        applyTheme(
            appData.settings.themeColor ||
            DEFAULT_COLOR
        );


        /*
         * 初期UI言語
         */

        applyUILanguage();


        /*
         * 初期ページ
         */

        pageHistory = ["home"];
        historyIndex = 0;

        showPage(
            "home",
            false
        );


        /* =================================================
           BACK / FORWARD
           ================================================= */

        document
            .querySelector(
                ".btn-back"
            )
            ?.addEventListener(
                "click",
                goBack
            );


        document
            .querySelector(
                ".btn-forward"
            )
            ?.addEventListener(
                "click",
                goForward
            );


        /* =================================================
           NAVIGATION
           ================================================= */

        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const page =
                                this.dataset.page;

                            if (page) {

                                showPage(
                                    page
                                );

                            }

                        }
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
                        function () {

                            const page =
                                this.dataset.goPage;

                            if (page) {

                                showPage(
                                    page
                                );

                            }

                        }
                    );

                }
            );


        /* =================================================
           MOBILE MENU
           ================================================= */

        const menuButton =
            document.getElementById(
                "mobile-menu-button"
            );

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        let overlay =
            document.getElementById(
                "mobile-menu-overlay"
            );


        if (!overlay) {

            overlay =
                document.createElement(
                    "div"
                );

            overlay.id =
                "mobile-menu-overlay";

            overlay.className =
                "mobile-menu-overlay";

            document.body.appendChild(
                overlay
            );

        }


        function toggleMenu() {

            if (!sidebar) {
                return;
            }

            const open =
                !sidebar.classList.contains(
                    "open"
                );


            if (open) {

                sidebar.classList.add(
                    "open"
                );

                overlay.classList.add(
                    "open"
                );

                document.body.classList.add(
                    "mobile-menu-open"
                );

                menuButton?.setAttribute(
                    "aria-expanded",
                    "true"
                );

            } else {

                closeMobileMenu();

            }

        }


        menuButton?.addEventListener(
            "click",
            toggleMenu
        );


        overlay?.addEventListener(
            "click",
            closeMobileMenu
        );


        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 800
                ) {

                    closeMobileMenu();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* =================================================
           STUDY BUTTONS
           ================================================= */

        document
            .getElementById(
                "show-answer-button"
            )
            ?.addEventListener(
                "click",
                showStudyAnswer
            );


        document
            .getElementById(
                "wrong-button"
            )
            ?.addEventListener(
                "click",
                handleStudyWrong
            );


        document
            .getElementById(
                "correct-button"
            )
            ?.addEventListener(
                "click",
                handleStudyCorrect
            );


        document
            .getElementById(
                "finish-study-button"
            )
            ?.addEventListener(
                "click",
                finishStudy
            );


        /* =================================================
           SEARCH
           ================================================= */

        document
            .getElementById(
                "card-search-input"
            )
            ?.addEventListener(
                "input",
                function () {

                    renderCardSearchResults(
                        this.value
                    );

                }
            );


        /* =================================================
           FILE IMPORT
           ================================================= */

        const fileInput =
            document.getElementById(
                "file-input"
            );

        const selectFileButton =
            document.getElementById(
                "select-file-button"
            );


        selectFileButton?.addEventListener(
            "click",
            function () {

                fileInput?.click();

            }
        );


        fileInput?.addEventListener(
            "change",
            async function () {

                const files =
                    Array.from(
                        this.files || []
                    );


                renderSelectedFiles(
                    files
                );


                for (
                    const file of files
                ) {

                    await handleFileImport(
                        file
                    );

                }


                this.value = "";

            }
        );


        /* =================================================
           DROP ZONE
           ================================================= */

        const dropZone =
            document.getElementById(
                "drop-zone"
            );


        dropZone?.addEventListener(
            "dragover",
            function (event) {

                event.preventDefault();

                this.classList.add(
                    "dragover"
                );

            }
        );


        dropZone?.addEventListener(
            "dragleave",
            function () {

                this.classList.remove(
                    "dragover"
                );

            }
        );


        dropZone?.addEventListener(
            "drop",
            async function (event) {

                event.preventDefault();

                this.classList.remove(
                    "dragover"
                );


                const files =
                    Array.from(
                        event.dataTransfer
                            ?.files || []
                    );


                renderSelectedFiles(
                    files
                );


                for (
                    const file of files
                ) {

                    await handleFileImport(
                        file
                    );

                }

            }
        );


        /* =================================================
           JSON IMPORT / EXPORT
           ================================================= */

        const dataImportButton =
            document.getElementById(
                "data-import-button"
            );

        const dataImportInput =
            document.getElementById(
                "data-import-input"
            );


        dataImportButton?.addEventListener(
            "click",
            function () {

                dataImportInput?.click();

            }
        );


        dataImportInput?.addEventListener(
            "change",
            function () {

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


        document
            .getElementById(
                "export-data-button"
            )
            ?.addEventListener(
                "click",
                exportDataJSON
            );


        document
            .getElementById(
                "restore-backup-button"
            )
            ?.addEventListener(
                "click",
                restoreAutomaticBackup
            );


        /* =================================================
           COLORS
           ================================================= */

        document
            .querySelectorAll(
                ".color-option"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const color =
                                this.dataset.color;

                            if (!color) {
                                return;
                            }

                            applyTheme(
                                color
                            );

                            saveSetting(
                                "themeColor",
                                color
                            );

                        }
                    );

                }
            );


        document
            .getElementById(
                "custom-color"
            )
            ?.addEventListener(
                "input",
                function () {

                    applyTheme(
                        this.value
                    );

                    saveSetting(
                        "themeColor",
                        this.value
                    );

                }
            );


        /* =================================================
           SETTINGS
           ================================================= */

        document
            .getElementById(
                "auto-voice"
            )
            ?.addEventListener(
                "change",
                function () {

                    saveSetting(
                        "autoVoice",
                        this.checked
                    );

                }
            );


        document
            .getElementById(
                "random-study"
            )
            ?.addEventListener(
                "change",
                function () {

                    saveSetting(
                        "randomStudy",
                        this.checked
                    );

                }
            );


        document
            .getElementById(
                "voice-rate"
            )
            ?.addEventListener(
                "change",
                function () {

                    let value =
                        Number(
                            this.value
                        );

                    value =
                        Math.min(
                            2,
                            Math.max(
                                0.5,
                                value || 1
                            )
                        );

                    this.value =
                        value;

                    saveSetting(
                        "voiceRate",
                        value
                    );

                }
            );


        document
            .getElementById(
                "voice-pitch"
            )
            ?.addEventListener(
                "change",
                function () {

                    let value =
                        Number(
                            this.value
                        );

                    value =
                        Math.min(
                            2,
                            Math.max(
                                0,
                                value || 1
                            )
                        );

                    this.value =
                        value;

                    saveSetting(
                        "voicePitch",
                        value
                    );

                }
            );


        /* =================================================
           UI LANGUAGE
           ================================================= */

        const uiLanguage =
            document.getElementById(
                "ui-language"
            );


        if (uiLanguage) {

            ensureUILanguageOptions(
                uiLanguage
            );


            uiLanguage.value =
                appData.settings.uiLanguage ||
                "ja";


            uiLanguage.addEventListener(
                "change",
                function () {

                    saveSetting(
                        "uiLanguage",
                        this.value
                    );


                    applyUILanguage();


                    showStatus(
                        t("languageChanged"),
                        "success"
                    );

                }
            );

        }


        /* =================================================
           LEARNING LANGUAGE
           ================================================= */

        const learningLanguage =
            document.getElementById(
                "learning-language"
            );


        if (learningLanguage) {

            ensureLearningLanguageOptions(
                learningLanguage
            );


            learningLanguage.value =
                appData.settings.learningLanguage ||
                "zh";


            learningLanguage.addEventListener(
                "change",
                function () {

                    const language =
                        this.value;


                    saveSetting(
                        "learningLanguage",
                        language
                    );


                    /*
                     * インポート画面にも即反映
                     */

                    const importLanguage =
                        document.getElementById(
                            "import-language-select"
                        );


                    if (importLanguage) {

                        ensureLanguageOption(
                            importLanguage,
                            language
                        );

                        importLanguage.value =
                            language;

                    }


                    /*
                     * ヘッダーにも反映
                     */

                    const header =
                        document.getElementById(
                            "header-language"
                        );

                    if (header) {

                        header.textContent =
                            LANGUAGE_NAMES[
                                language
                            ] ||
                            language;

                    }


                    /*
                     * 既存デッキは勝手に変更しない。
                     * 「現在これから学ぶ言語」
                     * として反映する。
                     */

                    renderHome();
                    renderDecks();


                    showStatus(
                        `${t("learningLanguageChanged")} ` +
                        `${LANGUAGE_NAMES[language] || language}`,
                        "success"
                    );

                }
            );

        }


        /* =================================================
           IMPORT LANGUAGE
           ================================================= */

        const importLanguage =
            document.getElementById(
                "import-language-select"
            );


        if (importLanguage) {

            Object.entries(
                LANGUAGE_NAMES
            ).forEach(
                ([code]) => {

                    ensureLanguageOption(
                        importLanguage,
                        code
                    );

                }
            );


            importLanguage.value =
                getLearningLanguage();

        }


        /* =================================================
           IMPORT DECK SELECT
           ================================================= */

        renderImportDeckSelect();


        /* =================================================
           INITIAL RENDER
           ================================================= */

        renderHome();
        renderDecks();
        renderProgress();
        renderSettings();

    }
);