[1mdiff --git a/app.js b/app.js[m
[1mindex be072ea..72efc9f 100644[m
[1m--- a/app.js[m
[1m+++ b/app.js[m
[36m@@ -1,1354 +1,207 @@[m
 /* =========================================================[m
    Language Gym[m
[31m-   app.js[m
[31m-   Complete version[m
[32m+[m[32m   Application[m
    ========================================================= */[m
 [m
 "use strict";[m
 [m
[32m+[m
 /* =========================================================[m
    CONSTANTS[m
    ========================================================= */[m
 [m
 const STORAGE_KEY = "languageGymData";[m
[31m-const BACKUP_KEY = "languageGymBackup";[m
[31m-const HISTORY_KEY = "languageGymHistory";[m
[31m-[m
[31m-const DEFAULT_COLOR = "#8B7CF6";[m
[31m-[m
[31m-const LANGUAGE_NAMES = {[m
[31m-    ja: "日本語",[m
[31m-    en: "English",[m
[31m-    zh: "中文",[m
[31m-    de: "Deutsch",[m
[31m-    es: "Español",[m
[31m-    fr: "Français",[m
[31m-    ko: "한국어",[m
[31m-    it: "Italiano",[m
[31m-    fi: "Suomi",[m
[31m-    ru: "Русский",[m
[31m-    pt: "Português"[m
[31m-};[m
[31m-[m
[31m-const LANGUAGE_LOCALES = {[m
[31m-    ja: "ja-JP",[m
[31m-    en: "en-US",[m
[31m-    zh: "zh-CN",[m
[31m-    de: "de-DE",[m
[31m-    es: "es-ES",[m
[31m-    fr: "fr-FR",[m
[31m-    ko: "ko-KR",[m
[31m-    it: "it-IT",[m
[31m-    fi: "fi-FI",[m
[31m-    ru: "ru-RU",[m
[31m-    pt: "pt-PT"[m
[31m-};[m
[32m+[m[32mconst BACKUP_KEY = "languageGymAutomaticBackup";[m
 [m
 [m
 /* =========================================================[m
[31m-   TRANSLATIONS[m
[32m+[m[32m   DEFAULT DATA[m
    ========================================================= */[m
 [m
[31m-const I18N = {[m
[31m-[m
[31m-    ja: {[m
[31m-        home: "ホーム",[m
[31m-        decks: "デッキ",[m
[31m-        study: "学習",[m
[31m-        progress: "学習記録",[m
[31m-        import: "インポート",[m
[31m-        dataShare: "データ共有",[m
[31m-        settings: "設定",[m
[31m-[m
[31m-        subtitle: "多言語学習トレーニング",[m
[31m-[m
[31m-        homeTitle: "Language Gym",[m
[31m-        homeDescription: "今日も少しずつ、外国語を鍛えよう。",[m
[31m-        deck: "デッキ",[m
[31m-        cards: "カード",[m
[31m-        totalStudyTime: "累計学習時間",[m
[31m-        accuracy: "正答率",[m
[31m-        startLearning: "🚀 学習を始める",[m
[31m-        chooseDeck: "デッキを選んで学習を開始しましょう。",[m
[31m-        viewDecks: "📚 デッキを見る",[m
[31m-        importMaterial: "📥 教材を取り込む",[m
[31m-        todayMessage: "🌱 今日のメッセージ",[m
[31m-        todayForward: "今日も一歩前進！",[m
[31m-[m
[31m-        deckTitle: "📚 デッキ",[m
[31m-        deckDescription: "学習する教材を管理します。",[m
[31m-        noDecks: "まだデッキがありません。",[m
[31m-        createDeck: "教材をインポート",[m
[31m-        cardSearch: "🔎 カード検索",[m
[31m-        searchPlaceholder: "カードの表・裏を検索",[m
[31m-        edit: "編集",[m
[31m-        delete: "削除",[m
[31m-        cardsCount: "カード",[m
[31m-[m
[31m-        studyTitle: "🏋️ 学習",[m
[31m-        chooseDeckToStudy: "デッキを選択してください。",[m
[31m-        studyStartMessage: "学習を開始するとここにカードが表示されます。",[m
[31m-        showAnswer: "👀 答えを見る",[m
[31m-        dontKnow: "❌ わからない",[m
[31m-        correct: "⭕ 正解",[m
[31m-        finishStudy: "学習終了",[m
[31m-        noCards: "このデッキにはカードがありません。",[m
[31m-        studyFinished: "学習を終了しました。",[m
[31m-        correctRate: "正答率",[m
[31m-[m
[31m-        progressTitle: "📊 学習記録",[m
[31m-        progressDescription: "学習時間・回答数・正答率を確認できます。",[m
[31m-        totalAnswers: "累計回答数",[m
[31m-        correctAnswers: "正解数",[m
[31m-        history: "学習履歴",[m
[31m-        noHistory: "まだ学習記録がありません。",[m
[31m-        date: "日時",[m
[31m-        deckName: "デッキ",[m
[31m-        answers: "回答",[m
[31m-        correctColumn: "正解",[m
[31m-[m
[31m-        importTitle: "📥 インポート",[m
[31m-        importDescription: "TXT・CSV・PDFなどの教材を取り込みます。",[m
[31m-        targetDeck: "📚 追加先デッキ",[m
[31m-        newDeck: "新しいデッキを作成",[m
[31m-        addToExisting: "既存デッキを選ぶと、そのデッキにカードを追加します。",[m
[31m-        learningLanguage: "🌐 学習言語",[m
[31m-        selectMaterial: "教材を選択",[m
[31m-        multipleFiles: "複数ファイルをまとめて選択できます",[m
[31m-        selectFile: "📂 ファイルを選択",[m
[31m-        importing: "インポート中…",[m
[31m-        imported: "インポートしました",[m
[31m-        importError: "インポートに失敗しました",[m
[31m-        noCardsDetected: "カードとして読み取れる内容がありませんでした。",[m
[31m-[m
[31m-        dataShareTitle: "🔄 データ共有",[m
[31m-        dataShareDescription: "PC・スマホ間でLanguage Gymのデータを共有します。",[m
[31m-        exportTitle: "📤 データを書き出す",[m
[31m-        exportDescription: "学習記録・デッキ・設定などをJSONファイルとして保存します。",[m
[31m-        exportData: "データを書き出す",[m
[31m-        importData: "📥 データを読み込む",[m
[31m-        importDataDescription: "別の端末で書き出したJSONファイルを読み込みます。",[m
[31m-        readJSON: "JSONを読み込む",[m
[31m-        backupTitle: "🛟 自動バックアップ",[m
[31m-        backupDescription: "最新データの自動バックアップから復元します。",[m
[31m-        restoreBackup: "バックアップから復元",[m
[31m-[m
[31m-        settingsTitle: "⚙️ 設定",[m
[31m-        settingsDescription: "Language Gymを自分好みに設定できます。",[m
[31m-        themeColor: "🎨 テーマカラー",[m
[31m-        themeDescription: "12色から好きな色を選べます。",[m
[31m-        customColor: "カスタムカラー",[m
[31m-        voice: "🔊 音声",[m
[31m-        autoVoice: "自動音声",[m
[31m-        autoVoiceDescription: "カード表示時に自動再生",[m
[31m-        randomStudy: "🎲 学習カードをランダムにする",[m
[31m-        voiceRate: "音声速度",[m
[31m-        voicePitch: "音声ピッチ",[m
[31m-        languageSettings: "🌐 言語設定",[m
[31m-        uiLanguage: "UI言語",[m
[31m-        learningLanguageSetting: "学習言語",[m
[31m-[m
[31m-        languageChanged: "UI言語を変更しました。",[m
[31m-        learningLanguageChanged: "学習言語を変更しました。",[m
[31m-        deleteConfirm: "このカードを削除しますか？",[m
[31m-        deckDeleteConfirm: "このデッキを削除しますか？",[m
[31m-        backupRestored: "バックアップから復元しました。",[m
[31m-        dataImported: "データを読み込みました。",[m
[31m-        dataExported: "データを書き出しました。",[m
[31m-[m
[31m-        back: "戻る",[m
[31m-        forward: "進む"[m
[31m-    },[m
[31m-[m
[31m-    en: {[m
[31m-        home: "Home",[m
[31m-        decks: "Decks",[m
[31m-        study: "Study",[m
[31m-        progress: "Progress",[m
[31m-        import: "Import",[m
[31m-        dataShare: "Data",[m
[31m-        settings: "Settings",[m
[31m-[m
[31m-        subtitle: "Multilingual Learning Training",[m
[31m-[m
[31m-        homeTitle: "Language Gym",[m
[31m-        homeDescription: "Train your languages little by little every day.",[m
[31m-        deck: "Decks",[m
[31m-        cards: "Cards",[m
[31m-        totalStudyTime: "Total Study Time",[m
[31m-        accuracy: "Accuracy",[m
[31m-        startLearning: "🚀 Start Learning",[m
[31m-        chooseDeck: "Choose a deck to start learning.",[m
[31m-        viewDecks: "📚 View Decks",[m
[31m-        importMaterial: "📥 Import Materials",[m
[31m-        todayMessage: "🌱 Today's Message",[m
[31m-        todayForward: "One step forward today!",[m
[31m-[m
[31m-        deckTitle: "📚 Decks",[m
[31m-        deckDescription: "Manage your study materials.",[m
[31m-        noDecks: "There are no decks yet.",[m
[31m-        createDeck: "Import Materials",[m
[31m-        cardSearch: "🔎 Search Cards",[m
[31m-        searchPlaceholder: "Search front or back",[m
[31m-        edit: "Edit",[m
[31m-        delete: "Delete",[m
[31m-        cardsCount: "cards",[m
[31m-[m
[31m-        studyTitle: "🏋️ Study",[m
[31m-        chooseDeckToStudy: "Please select a deck.",[m
[31m-        studyStartMessage: "Cards will appear here when you start studying.",[m
[31m-        showAnswer: "👀 Show Answer",[m
[31m-        dontKnow: "❌ Don't Know",[m
[31m-        correct: "⭕ Correct",[m
[31m-        finishStudy: "Finish",[m
[31m-        noCards: "This deck has no cards.",[m
[31m-        studyFinished: "Study session finished.",[m
[31m-        correctRate: "Accuracy",[m
[31m-[m
[31m-        progressTitle: "📊 Progress",[m
[31m-        progressDescription: "Check your study time, answers, and accuracy.",[m
[31m-        totalAnswers: "Total Answers",[m
[31m-        correctAnswers: "Correct Answers",[m
[31m-        history: "Study History",[m
[31m-        noHistory: "There is no study history yet.",[m
[31m-        date: "Date",[m
[31m-        deckName: "Deck",[m
[31m-        answers: "Answers",[m
[31m-        correctColumn: "Correct",[m
[31m-[m
[31m-        importTitle: "📥 Import",[m
[31m-        importDescription: "Import TXT, CSV, PDF and other study materials.",[m
[31m-        targetDeck: "📚 Target Deck",[m
[31m-        newDeck: "Create a new deck",[m
[31m-        addToExisting: "Choose an existing deck to add cards to it.",[m
[31m-        learningLanguage: "🌐 Learning Language",[m
[31m-        selectMaterial: "Select Materials",[m
[31m-        multipleFiles: "You can select multiple files at once.",[m
[31m-        selectFile: "📂 Select Files",[m
[31m-        importing: "Importing…",[m
[31m-        imported: "Imported",[m
[31m-        importError: "Import failed",[m
[31m-        noCardsDetected: "No card-like content was found.",[m
[31m-[m
[31m-        dataShareTitle: "🔄 Data Sharing",[m
[31m-        dataShareDescription: "Share Language Gym data between PC and smartphone.",[m
[31m-        exportTitle: "📤 Export Data",[m
[31m-        exportDescription: "Save study records, decks, and settings as a JSON file.",[m
[31m-        exportData: "Export Data",[m
[31m-        importData: "📥 Import Data",[m
[31m-        importDataDescription: "Import a JSON file exported from another device.",[m
[31m-        readJSON: "Import JSON",[m
[31m-        backupTitle: "🛟 Automatic Backup",[m
[31m-        backupDescription: "Restore from the latest automatic backup.",[m
[31m-        restoreBackup: "Restore Backup",[m
[31m-[m
[31m-        settingsTitle: "⚙️ Settings",[m
[31m-        settingsDescription: "Customize Language Gym.",[m
[31m-        themeColor: "🎨 Theme Color",[m
[31m-        themeDescription: "Choose your favorite color from 12 presets.",[m
[31m-        customColor: "Custom Color",[m
[31m-        voice: "🔊 Voice",[m
[31m-        autoVoice: "Auto Voice",[m
[31m-        autoVoiceDescription: "Play automatically when a card appears",[m
[31m-        randomStudy: "🎲 Randomize study cards",[m
[31m-        voiceRate: "Voice Rate",[m
[31m-        voicePitch: "Voice Pitch",[m
[31m-        languageSettings: "🌐 Language Settings",[m
[31m-        uiLanguage: "UI Language",[m
[31m-        learningLanguageSetting: "Learning Language",[m
[31m-[m
[31m-        languageChanged: "UI language changed.",[m
[31m-        learningLanguageChanged: "Learning language changed.",[m
[31m-        deleteConfirm: "Delete this card?",[m
[31m-        deckDeleteConfirm: "Delete this deck?",[m
[31m-        backupRestored: "Backup restored.",[m
[31m-        dataImported: "Data imported.",[m
[31m-        dataExported: "Data exported.",[m
[31m-[m
[31m-        back: "Back",[m
[31m-        forward: "Forward"[m
[31m-    },[m
[31m-[m
[31m-    zh: {[m
[31m-        home: "首页",[m
[31m-        decks: "卡组",[m
[31m-        study: "学习",[m
[31m-        progress: "学习记录",[m
[31m-        import: "导入",[m
[31m-        dataShare: "数据共享",[m
[31m-        settings: "设置",[m
[31m-[m
[31m-        subtitle: "多语言学习训练",[m
[31m-[m
[31m-        homeTitle: "Language Gym",[m
[31m-        homeDescription: "每天一点点，持续提升外语能力。",[m
[31m-        deck: "卡组",[m
[31m-        cards: "卡片",[m
[31m-        totalStudyTime: "累计学习时间",[m
[31m-        accuracy: "正确率",[m
[31m-        startLearning: "🚀 开始学习",[m
[31m-        chooseDeck: "选择卡组开始学习。",[m
[31m-        viewDecks: "📚 查看卡组",[m
[31m-        importMaterial: "📥 导入教材",[m
[31m-        todayMessage: "🌱 今日消息",[m
[31m-        todayForward: "今天也向前一步！",[m
[31m-[m
[31m-        deckTitle: "📚 卡组",[m
[31m-        deckDescription: "管理学习教材。",[m
[31m-        noDecks: "还没有卡组。",[m
[31m-        createDeck: "导入教材",[m
[31m-        cardSearch: "🔎 搜索卡片",[m
[31m-        searchPlaceholder: "搜索正面或背面",[m
[31m-        edit: "编辑",[m
[31m-        delete: "删除",[m
[31m-        cardsCount: "张卡片",[m
[31m-[m
[31m-        studyTitle: "🏋️ 学习",[m
[31m-        chooseDeckToStudy: "请选择卡组。",[m
[31m-        studyStartMessage: "开始学习后，卡片会显示在这里。",[m
[31m-        showAnswer: "👀 查看答案",[m
[31m-        dontKnow: "❌ 不知道",[m
[31m-        correct: "⭕ 正确",[m
[31m-        finishStudy: "结束学习",[m
[31m-        noCards: "这个卡组没有卡片。",[m
[31m-        studyFinished: "学习结束。",[m
[31m-        correctRate: "正确率",[m
[31m-[m
[31m-        progressTitle: "📊 学习记录",[m
[31m-        progressDescription: "查看学习时间、回答次数和正确率。",[m
[31m-        totalAnswers: "累计回答",[m
[31m-        correctAnswers: "正确数",[m
[31m-        history: "学习历史",[m
[31m-        noHistory: "还没有学习记录。",[m
[31m-        date: "日期",[m
[31m-        deckName: "卡组",[m
[31m-        answers: "回答",[m
[31m-        correctColumn: "正确",[m
[31m-[m
[31m-        importTitle: "📥 导入",[m
[31m-        importDescription: "导入TXT、CSV、PDF等教材。",[m
[31m-        targetDeck: "📚 添加到卡组",[m
[31m-        newDeck: "创建新卡组",[m
[31m-        addToExisting: "选择已有卡组即可添加卡片。",[m
[31m-        learningLanguage: "🌐 学习语言",[m
[31m-        selectMaterial: "选择教材",[m
[31m-        multipleFiles: "可以一次选择多个文件。",[m
[31m-        selectFile: "📂 选择文件",[m
[31m-        importing: "正在导入…",[m
[31m-        imported: "导入成功",[m
[31m-        importError: "导入失败",[m
[31m-        noCardsDetected: "没有找到可以制作成卡片的内容。",[m
[31m-[m
[31m-        dataShareTitle: "🔄 数据共享",[m
[31m-        dataShareDescription: "在电脑和手机之间共享Language Gym数据。",[m
[31m-        exportTitle: "📤 导出数据",[m
[31m-        exportDescription: "将学习记录、卡�