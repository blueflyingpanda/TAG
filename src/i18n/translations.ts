export interface Translations {
  // App nav
  nav_home: string;
  nav_history: string;
  nav_rules: string;
  nav_logout: string;
  nav_toggleDark: string;
  nav_profileAlt: string;

  // Login
  login_subtitle: string;
  login_loading: string;
  login_google: string;

  // ThemeSelection
  ts_title: string;
  ts_language: string;
  ts_langEnglish: string;
  ts_langRussian: string;
  ts_search: string;
  ts_searchPlaceholder: string;
  ts_orderBy: string;
  ts_orderByDate: string;
  ts_orderByName: string;
  ts_orderByLikes: string;
  ts_orderDirection: string;
  ts_ascending: string;
  ts_descending: string;
  ts_showUnverified: string;
  ts_onlyMine: string;
  ts_onlyFavorites: string;
  ts_import: string;
  ts_create: string;
  ts_unverifiedWarning: string;
  ts_noThemes: string;
  ts_importTitle: string;
  ts_importPlaceholder: string;
  ts_public: string;
  ts_importBtn: string;
  ts_cancel: string;

  // ThemeDetails
  td_verified: string;
  td_unverified: string;
  td_loading: string;
  td_notFound: string;
  td_back: string;
  td_select: string;
  td_language: (lang: string) => string;
  td_visibility: (isPublic: boolean) => string;
  td_publicLabel: string;
  td_privateLabel: string;
  td_createdBy: (email: string) => string;
  td_teams: (count: number) => string;
  td_words: (count: number) => string;
  td_moreWords: (count: number) => string;
  td_failedLoad: string;
  td_failedFavorite: string;

  // GameSetup
  gs_selectTeams: string;
  gs_selectedTeams: (selected: number, total: number) => string;
  gs_difficulty: string;
  gs_difficultyHint: (level: number) => string;
  gs_setDifficulty: (level: number) => string;
  gs_pointsRequired: (points: number) => string;
  gs_roundTimer: (seconds: number) => string;
  gs_skipPenalty: string;
  gs_back: string;
  gs_startGame: string;

  // GamePlay
  gp_round: (round: number) => string;
  gp_skipped: string;
  gp_guessed: string;
  gp_cheatingDetected: string;
  gp_roundPaused: string;
  gp_skipBtn: string;
  gp_guessedBtn: string;
  gp_pause: string;
  gp_paused: string;
  gp_resume: string;
  gp_shortcutHint: string;
  gp_gameOver: string;
  gp_singleWinner: (name: string) => string;
  gp_multipleWinners: (names: string) => string;
  gp_newGame: string;
  gp_currentScores: string;
  gp_score: (score: number, required: number) => string;
  gp_wordsRemaining: (count: number) => string;
  gp_startRound: string;

  // RoundResults
  rr_title: string;
  rr_hint: string;
  rr_noWords: string;
  rr_guessed: string;
  rr_earned: string;
  rr_skipped: string;
  rr_lastWord: string;
  rr_confirm: string;

  // GameHistory
  gh_backToGames: string;
  gh_gameDetails: string;
  gh_theme: (name: string) => string;
  gh_language: (lang: string) => string;
  gh_pointsRequired: (points: number) => string;
  gh_skipPenalty: (enabled: boolean) => string;
  gh_yes: string;
  gh_no: string;
  gh_started: (date: string) => string;
  gh_ended: (date: string) => string;
  gh_teams: string;
  gh_noTeams: string;
  gh_teamScore: (name: string, score: number) => string;
  gh_gameStatus: string;
  gh_currentRound: (round: number) => string;
  gh_currentTeam: (name: string) => string;
  gh_completed: string;
  gh_inProgress: string;
  gh_resumeGame: string;
  gh_loading: string;
  gh_title: string;
  gh_back: string;
  gh_noGames: string;
  gh_roundTime: (seconds: number) => string;

  // CreateTheme
  ct_title: string;
  ct_unverifiedNote: string;
  ct_language: string;
  ct_public: string;
  ct_makePublic: string;
  ct_nameLabel: string;
  ct_namePlaceholder: string;
  ct_nameCounter: (chars: number, words: number) => string;
  ct_teamsLabel: string;
  ct_teamPlaceholder: (index: number) => string;
  ct_removeTeam: string;
  ct_addTeam: string;
  ct_teamsCounter: (filled: number, total: number) => string;
  ct_teamsError: string;
  ct_wordsLabel: string;
  ct_importFromText: string;
  ct_wordPlaceholder: (index: number) => string;
  ct_difficulty: string;
  ct_setDifficulty: (level: number) => string;
  ct_addWord: string;
  ct_wordsCounter: (count: number) => string;
  ct_cancel: string;
  ct_submit: string;
  ct_submitting: string;
  ct_errNameRequired: string;
  ct_errNameTooLong: string;
  ct_errNameTooManyWords: string;
  ct_errTeamsCount: string;
  ct_errTeamsDuplicate: (duplicates: string) => string;
  ct_errTeamNameTooLong: (name: string) => string;
  ct_errTeamNameTooManyWords: (name: string) => string;
  ct_errWordsMin: string;
  ct_errWordsDuplicate: (duplicates: string) => string;
  ct_errWordTooLong: (word: string) => string;
  ct_errWordTooManyWords: (word: string) => string;
  ct_errWordDifficulty: (word: string) => string;
  ct_errFailed: string;

  // Rules
  rules_title: string;
  rules_basicGameplay: string;
  rules_intro: string;
  rules_rule1: string;
  rules_rule2: string;
  rules_rule3: string;
  rules_rule4: string;
  rules_rule5: string;
  rules_rule6: string;
  rules_scoring: string;
  rules_score1: string;
  rules_score2: string;
  rules_score3: string;
  rules_score4: string;
  rules_config: string;
  rules_pointsRequired: string;
  rules_pointsDesc: string;
  rules_roundTimer: string;
  rules_roundTimerDesc: string;
  rules_skipPenalty: string;
  rules_skipPenaltyDesc: string;
  rules_teamsLabel: string;
  rules_teamsDesc: string;
  rules_themeManagement: string;
  rules_feat1: string;
  rules_feat2: string;
  rules_feat3: string;
  rules_feat4: string;
  rules_feat5: string;
  rules_gameFeatures: string;
  rules_gameHistory: string;
  rules_gameHistoryDesc: string;
  rules_gameResumption: string;
  rules_gameResumptionDesc: string;
  rules_cheatingDetection: string;
  rules_cheatingDetectionDesc: string;
  rules_resultConfirmation: string;
  rules_resultConfirmationDesc: string;
  rules_howToPlay: string;
  rules_step1: string;
  rules_step2: string;
  rules_step3: string;
  rules_step4: string;
  rules_step5: string;
  rules_step6: string;
  rules_difficultyLevels: string;
  rules_veryEasy: string;
  rules_easy: string;
  rules_medium: string;
  rules_hard: string;
  rules_veryHard: string;

  // CardStack
  cs_cheatingTitle: string;
  cs_cheatingDesc: string;
  cs_pausedTitle: string;
  cs_pausedDesc: string;
}

export const en: Translations = {
  nav_home: "Home",
  nav_history: "History",
  nav_rules: "Rules",
  nav_logout: "Logout",
  nav_toggleDark: "Toggle dark mode",
  nav_profileAlt: "Profile",

  login_subtitle: "Themed Alias Game",
  login_loading: "Loading...",
  login_google: "Continue with Google",

  ts_title: "Select Theme",
  ts_language: "Language",
  ts_langEnglish: "English",
  ts_langRussian: "Russian",
  ts_search: "Search",
  ts_searchPlaceholder: "Search themes...",
  ts_orderBy: "Order By",
  ts_orderByDate: "Creation Date",
  ts_orderByName: "Name",
  ts_orderByLikes: "Likes",
  ts_orderDirection: "Order Direction",
  ts_ascending: "Ascending",
  ts_descending: "Descending",
  ts_showUnverified: "Show unverified themes",
  ts_onlyMine: "Only my themes",
  ts_onlyFavorites: "Only favorites",
  ts_import: "Import Theme",
  ts_create: "Create Theme",
  ts_unverifiedWarning: "Unverified themes may contain inappropriate content",
  ts_noThemes: "No themes available. Import or Create a theme to get started.",
  ts_importTitle: "Import Theme",
  ts_importPlaceholder: `Paste theme JSON here...\n\nExample format:\n{\n  "name": "My Theme",\n  "language": "en",\n  "description": {\n    "teams": ["Team 1", ...],\n    "words": { "word": 1, ... }\n  }\n}`,
  ts_public: "Public",
  ts_importBtn: "Import",
  ts_cancel: "Cancel",

  td_verified: "✅ Verified",
  td_unverified: "❌ Unverified",
  td_loading: "Loading theme details...",
  td_notFound: "Theme not found",
  td_back: "← Back",
  td_select: "Select Theme",
  td_language: (lang) => `Language: ${lang}`,
  td_visibility: (isPublic) => `Visibility: ${isPublic ? "Public" : "Private"}`,
  td_publicLabel: "Public",
  td_privateLabel: "Private",
  td_createdBy: (email) => `Created by: ${email}`,
  td_teams: (count) => `Teams (${count})`,
  td_words: (count) => `Words (${count})`,
  td_moreWords: (count) => `... and ${count} more words`,
  td_failedLoad: "Failed to load theme details",
  td_failedFavorite: "Failed to update favorite status",

  gs_selectTeams: "Select Teams",
  gs_selectedTeams: (s, t) => `Selected: ${s} / ${t}`,
  gs_difficulty: "Difficulty",
  gs_difficultyHint: (level) => `Show words with difficulty ${level} or lower`,
  gs_setDifficulty: (level) => `Set difficulty to ${level}`,
  gs_pointsRequired: (points) => `Points Required: ${points}`,
  gs_roundTimer: (seconds) => `Round Timer: ${seconds}s`,
  gs_skipPenalty: "Skip Penalty",
  gs_back: "Back",
  gs_startGame: "Start Game",

  gp_round: (round) => `Round ${round}`,
  gp_skipped: "Skipped",
  gp_guessed: "Guessed",
  gp_cheatingDetected: "Cheating detected — wait for round to end",
  gp_roundPaused: "Round paused — finish the round so data can be saved",
  gp_skipBtn: "Skip ❌",
  gp_guessedBtn: "Guessed ✅",
  gp_pause: "Pause",
  gp_paused: "Paused",
  gp_resume: "▶️ Resume",
  gp_shortcutHint: "Desktop shortcut: ← Skip, → Guessed",
  gp_gameOver: "Game Over!",
  gp_singleWinner: (name) => `${name} Wins!`,
  gp_multipleWinners: (names) => `${names} Win!`,
  gp_newGame: "New Game",
  gp_currentScores: "Current Scores",
  gp_score: (score, required) => `${score} / ${required}`,
  gp_wordsRemaining: (count) => `${count} words remaining`,
  gp_startRound: "Start Round",

  rr_title: "Round Results",
  rr_hint: "Tap words to toggle between ✅ and ❌",
  rr_noWords: "No words were processed in this round.",
  rr_guessed: "Guessed",
  rr_earned: "Earned",
  rr_skipped: "Skipped",
  rr_lastWord: "Last word",
  rr_confirm: "Confirm",

  gh_backToGames: "← Back to Games",
  gh_gameDetails: "Game Details",
  gh_theme: (name) => `Theme: ${name}`,
  gh_language: (lang) => `Language: ${lang}`,
  gh_pointsRequired: (points) => `Points Required: ${points}`,
  gh_skipPenalty: (enabled) => `Skip Penalty: ${enabled ? "Yes" : "No"}`,
  gh_yes: "Yes",
  gh_no: "No",
  gh_started: (date) => `Started: ${date}`,
  gh_ended: (date) => `Ended: ${date}`,
  gh_teams: "Teams",
  gh_noTeams: "No teams data available",
  gh_teamScore: (name, score) => `${name}: ${score} points`,
  gh_gameStatus: "Game Status",
  gh_currentRound: (round) => `Current Round: ${round}`,
  gh_currentTeam: (name) => `Current Team: ${name}`,
  gh_completed: "Completed",
  gh_inProgress: "In Progress",
  gh_resumeGame: "Resume Game",
  gh_loading: "Loading game history...",
  gh_title: "Game History",
  gh_back: "← Back",
  gh_noGames: "No games found. Start playing to see your game history!",
  gh_roundTime: (seconds) => `Round Time: ${seconds}`,

  ct_title: "Create Theme",
  ct_unverifiedNote: "New themes will be marked as unverified until admin review",
  ct_language: "Language *",
  ct_public: "Public",
  ct_makePublic: "Make this theme public",
  ct_nameLabel: "Theme Name * (max 64 chars, max 10 words)",
  ct_namePlaceholder: "e.g., Harry Potter",
  ct_nameCounter: (chars, words) => `${chars}/64 characters • ${words}/10 words`,
  ct_teamsLabel: "Teams * (exactly 10 teams, each max 64 chars, max 10 words)",
  ct_teamPlaceholder: (i) => `Team ${i}`,
  ct_removeTeam: "Remove",
  ct_addTeam: "+ Add Team",
  ct_teamsCounter: (filled, total) => `${filled} filled • ${total} entries • 10 required`,
  ct_teamsError: "You must provide exactly 10 filled team names to create a theme.",
  ct_wordsLabel: "Words * (at least 30 difficulty 1 words, each max 64 chars, max 10 words)",
  ct_importFromText: "Import from Text (one per line)",
  ct_wordPlaceholder: (i) => `Word ${i}`,
  ct_difficulty: "Difficulty",
  ct_setDifficulty: (level) => `Set difficulty to ${level}`,
  ct_addWord: "+ Add Word",
  ct_wordsCounter: (count) => `${count} / 30 difficulty 1 words (minimum)`,
  ct_cancel: "Cancel",
  ct_submit: "Create Theme",
  ct_submitting: "Submitting...",
  ct_errNameRequired: "Theme name is required",
  ct_errNameTooLong: "Theme name must be 64 characters or less",
  ct_errNameTooManyWords: "Theme name must be 10 words or less",
  ct_errTeamsCount: "Theme must contain exactly 10 teams",
  ct_errTeamsDuplicate: (d) => `Team names must be unique. Duplicates found: ${d}`,
  ct_errTeamNameTooLong: (name) => `Team name "${name}" must be 64 characters or less`,
  ct_errTeamNameTooManyWords: (name) => `Team name "${name}" must be 10 words or less`,
  ct_errWordsMin: "Theme must have at least 30 difficulty 1 words",
  ct_errWordsDuplicate: (d) => `Words must be unique within a theme. Duplicates found: ${d}`,
  ct_errWordTooLong: (word) => `Word "${word}" must be 64 characters or less`,
  ct_errWordTooManyWords: (word) => `Word "${word}" must be 10 words or less`,
  ct_errWordDifficulty: (word) => `Word "${word}" must have a difficulty between 1 and 5`,
  ct_errFailed: "Failed to create theme",

  rules_title: "Alias Game Rules",
  rules_basicGameplay: "Basic Gameplay",
  rules_intro: "Alias is a fun word-guessing game where teams compete to guess as many words as possible within a time limit.",
  rules_rule1: "Players are divided into teams",
  rules_rule2: "One team player plays at a time while others guess",
  rules_rule3: "The playing team gets a word and must describe it without saying the word itself",
  rules_rule4: "Teammates try to guess the word",
  rules_rule5: "Points are awarded for correct guesses",
  rules_rule6: "The round ends when time runs out or all words are used",
  rules_scoring: "Scoring",
  rules_score1: "Correct guess: +1 point",
  rules_score2: "Skip penalty: -1 point (if enabled)",
  rules_score3: "Win condition: First team to reach the target score wins",
  rules_score4: "Tiebreaker: If no team reaches the target when words run out, the team with highest score wins",
  rules_config: "Game Configuration",
  rules_pointsRequired: "Points Required",
  rules_pointsDesc: "Set the target score to win the game (default: 50 points)",
  rules_roundTimer: "Round Timer",
  rules_roundTimerDesc: "Time limit for each round (15-300 seconds, default: 60)",
  rules_skipPenalty: "Skip Penalty",
  rules_skipPenaltyDesc: "Enable/disable point deduction for skipped words",
  rules_teamsLabel: "Teams",
  rules_teamsDesc: "2-10 teams can play simultaneously",
  rules_themeManagement: "Theme Management",
  rules_feat1: "Theme Creation: Create custom word themes with your own word lists",
  rules_feat2: "Theme Import: Import themes from external sources in JSON format",
  rules_feat3: "Filtering: Filter by difficulty, language, your themes, favorites, verified status",
  rules_feat4: "Search: Find themes by name or description",
  rules_feat5: "Minimum words: Each theme must have at least 30 words",
  rules_gameFeatures: "Game Features",
  rules_gameHistory: "Game History",
  rules_gameHistoryDesc: "View all completed games and track statistics",
  rules_gameResumption: "Game Resumption",
  rules_gameResumptionDesc: "Resume unfinished games from where you left off",
  rules_cheatingDetection: "Cheating Detection",
  rules_cheatingDetectionDesc: "Monitors round start times to prevent unfair play",
  rules_resultConfirmation: "Result Confirmation",
  rules_resultConfirmationDesc: "Review and confirm round results before scoring",
  rules_howToPlay: "How to Play",
  rules_step1: "Choose a theme with words to guess",
  rules_step2: "Configure game settings (points, timer, teams)",
  rules_step3: "Take turns describing words to your team",
  rules_step4: 'Click "Guessed" for correct answers, "Skip" for difficult words',
  rules_step5: "Review and confirm results after each round",
  rules_step6: "Continue until a team reaches the target score",
  rules_difficultyLevels: "Difficulty Levels",
  rules_veryEasy: "Very Easy",
  rules_easy: "Easy",
  rules_medium: "Medium",
  rules_hard: "Hard",
  rules_veryHard: "Very Hard",

  cs_cheatingTitle: "Cheating Detected",
  cs_cheatingDesc: "Too many words guessed too quickly",
  cs_pausedTitle: "Round Paused",
  cs_pausedDesc: "Word is hidden until resumed",
};

export const ru: Translations = {
  nav_home: "Главная",
  nav_history: "История",
  nav_rules: "Правила",
  nav_logout: "Выйти",
  nav_toggleDark: "Сменить тему",
  nav_profileAlt: "Профиль",

  login_subtitle: "Тематическая игра Alias",
  login_loading: "Загрузка...",
  login_google: "Войти через Google",

  ts_title: "Выбор темы",
  ts_language: "Язык",
  ts_langEnglish: "Английский",
  ts_langRussian: "Русский",
  ts_search: "Поиск",
  ts_searchPlaceholder: "Поиск тем...",
  ts_orderBy: "Сортировать по",
  ts_orderByDate: "Дате создания",
  ts_orderByName: "Названию",
  ts_orderByLikes: "Лайкам",
  ts_orderDirection: "Порядок",
  ts_ascending: "По возрастанию",
  ts_descending: "По убыванию",
  ts_showUnverified: "Показать непроверенные темы",
  ts_onlyMine: "Только мои темы",
  ts_onlyFavorites: "Только избранные",
  ts_import: "Импорт темы",
  ts_create: "Создать тему",
  ts_unverifiedWarning: "Непроверенные темы могут содержать неподходящий контент",
  ts_noThemes: "Темы не найдены. Импортируйте или создайте тему.",
  ts_importTitle: "Импорт темы",
  ts_importPlaceholder: `Вставьте JSON темы сюда...\n\nПример формата:\n{\n  "name": "Моя тема",\n  "language": "ru",\n  "description": {\n    "teams": ["Команда 1", ...],\n    "words": { "слово": 1, ... }\n  }\n}`,
  ts_public: "Публичная",
  ts_importBtn: "Импортировать",
  ts_cancel: "Отмена",

  td_verified: "✅ Проверена",
  td_unverified: "❌ Не проверена",
  td_loading: "Загрузка темы...",
  td_notFound: "Тема не найдена",
  td_back: "← Назад",
  td_select: "Выбрать тему",
  td_language: (lang) => `Язык: ${lang}`,
  td_visibility: (isPublic) => `Видимость: ${isPublic ? "Публичная" : "Приватная"}`,
  td_publicLabel: "Публичная",
  td_privateLabel: "Приватная",
  td_createdBy: (email) => `Создано: ${email}`,
  td_teams: (count) => `Команды (${count})`,
  td_words: (count) => `Слова (${count})`,
  td_moreWords: (count) => `... и ещё ${count} слов`,
  td_failedLoad: "Не удалось загрузить тему",
  td_failedFavorite: "Не удалось обновить статус",

  gs_selectTeams: "Выбор команд",
  gs_selectedTeams: (s, total) => `Выбрано: ${s} / ${total}`,
  gs_difficulty: "Сложность",
  gs_difficultyHint: (level) => `Слова со сложностью ${level} и ниже`,
  gs_setDifficulty: (level) => `Установить сложность ${level}`,
  gs_pointsRequired: (points) => `Очков для победы: ${points}`,
  gs_roundTimer: (seconds) => `Таймер: ${seconds}с`,
  gs_skipPenalty: "Штраф за пропуск",
  gs_back: "Назад",
  gs_startGame: "Начать игру",

  gp_round: (round) => `Раунд ${round}`,
  gp_skipped: "Пропущено",
  gp_guessed: "Угадано",
  gp_cheatingDetected: "Читерство обнаружено — ждите конца раунда",
  gp_roundPaused: "Раунд на паузе — завершите раунд для сохранения",
  gp_skipBtn: "Пропуск ❌",
  gp_guessedBtn: "Угадано ✅",
  gp_pause: "Пауза",
  gp_paused: "Пауза",
  gp_resume: "▶️ Продолжить",
  gp_shortcutHint: "Горячие клавиши: ← Пропустить, → Угадано",
  gp_gameOver: "Игра окончена!",
  gp_singleWinner: (name) => `Победитель: ${name}`,
  gp_multipleWinners: (names) => `Победители: ${names}`,
  gp_newGame: "Новая игра",
  gp_currentScores: "Текущий счёт",
  gp_score: (score, required) => `${score} / ${required}`,
  gp_wordsRemaining: (count) => `Осталось слов: ${count}`,
  gp_startRound: "Начать раунд",

  rr_title: "Результаты раунда",
  rr_hint: "Нажмите на слово, чтобы изменить результат",
  rr_noWords: "В этом раунде слова не обрабатывались.",
  rr_guessed: "Угадано",
  rr_earned: "Заработано",
  rr_skipped: "Пропущено",
  rr_lastWord: "Последнее слово",
  rr_confirm: "Подтвердить",

  gh_backToGames: "← К играм",
  gh_gameDetails: "Детали игры",
  gh_theme: (name) => `Тема: ${name}`,
  gh_language: (lang) => `Язык: ${lang}`,
  gh_pointsRequired: (points) => `Очков для победы: ${points}`,
  gh_skipPenalty: (enabled) => `Штраф за пропуск: ${enabled ? "Да" : "Нет"}`,
  gh_yes: "Да",
  gh_no: "Нет",
  gh_started: (date) => `Начато: ${date}`,
  gh_ended: (date) => `Завершено: ${date}`,
  gh_teams: "Команды",
  gh_noTeams: "Нет данных о командах",
  gh_teamScore: (name, score) => `${name}: ${score} очков`,
  gh_gameStatus: "Статус игры",
  gh_currentRound: (round) => `Текущий раунд: ${round}`,
  gh_currentTeam: (name) => `Текущая команда: ${name}`,
  gh_completed: "Завершена",
  gh_inProgress: "В процессе",
  gh_resumeGame: "Продолжить игру",
  gh_loading: "Загрузка истории...",
  gh_title: "История игр",
  gh_back: "← Назад",
  gh_noGames: "Игры не найдены. Начните игру!",
  gh_roundTime: (seconds) => `Время раунда: ${seconds}`,

  ct_title: "Создать тему",
  ct_unverifiedNote: "Новые темы будут помечены как непроверенные до проверки администратором",
  ct_language: "Язык *",
  ct_public: "Публичная",
  ct_makePublic: "Сделать тему публичной",
  ct_nameLabel: "Название темы * (макс. 64 символа, макс. 10 слов)",
  ct_namePlaceholder: "Например: Гарри Поттер",
  ct_nameCounter: (chars, words) => `${chars}/64 символов • ${words}/10 слов`,
  ct_teamsLabel: "Команды * (ровно 10, макс. 64 символа, макс. 10 слов)",
  ct_teamPlaceholder: (i) => `Команда ${i}`,
  ct_removeTeam: "Удалить",
  ct_addTeam: "+ Добавить команду",
  ct_teamsCounter: (filled, total) => `${filled} заполнено • ${total} записей • нужно 10`,
  ct_teamsError: "Необходимо указать ровно 10 названий команд.",
  ct_wordsLabel: "Слова * (минимум 30 слов сложности 1, макс. 64 символа, макс. 10 слов)",
  ct_importFromText: "Импорт из текста (одно слово в строке)",
  ct_wordPlaceholder: (i) => `Слово ${i}`,
  ct_difficulty: "Сложность",
  ct_setDifficulty: (level) => `Установить сложность ${level}`,
  ct_addWord: "+ Добавить слово",
  ct_wordsCounter: (count) => `${count} / 30 слов сложности 1 (минимум)`,
  ct_cancel: "Отмена",
  ct_submit: "Создать тему",
  ct_submitting: "Отправка...",
  ct_errNameRequired: "Название темы обязательно",
  ct_errNameTooLong: "Название темы не более 64 символов",
  ct_errNameTooManyWords: "Название темы не более 10 слов",
  ct_errTeamsCount: "Тема должна содержать ровно 10 команд",
  ct_errTeamsDuplicate: (d) => `Названия команд должны быть уникальными. Дубликаты: ${d}`,
  ct_errTeamNameTooLong: (name) => `Название команды "${name}" не более 64 символов`,
  ct_errTeamNameTooManyWords: (name) => `Название команды "${name}" не более 10 слов`,
  ct_errWordsMin: "Тема должна содержать минимум 30 слов сложности 1",
  ct_errWordsDuplicate: (d) => `Слова должны быть уникальными. Дубликаты: ${d}`,
  ct_errWordTooLong: (word) => `Слово "${word}" не более 64 символов`,
  ct_errWordTooManyWords: (word) => `Слово "${word}" не более 10 слов`,
  ct_errWordDifficulty: (word) => `Слово "${word}" должно иметь сложность от 1 до 5`,
  ct_errFailed: "Не удалось создать тему",

  rules_title: "Правила игры Alias",
  rules_basicGameplay: "Основной геймплей",
  rules_intro: "Alias — весёлая игра в угадывание слов, в которой команды соревнуются, чтобы угадать как можно больше слов за отведённое время.",
  rules_rule1: "Игроки делятся на команды",
  rules_rule2: "По одному игроку от команды играет, пока остальные угадывают",
  rules_rule3: "Играющий получает слово и должен объяснить его, не называя само слово",
  rules_rule4: "Товарищи по команде пытаются угадать слово",
  rules_rule5: "За правильные ответы начисляются очки",
  rules_rule6: "Раунд заканчивается, когда истекает время или слова закончились",
  rules_scoring: "Очки",
  rules_score1: "Правильный ответ: +1 очко",
  rules_score2: "Штраф за пропуск: -1 очко (если включён)",
  rules_score3: "Победа: первая команда, набравшая целевое количество очков",
  rules_score4: "Ничья: если слова закончились — побеждает команда с наибольшим счётом",
  rules_config: "Настройки игры",
  rules_pointsRequired: "Очков для победы",
  rules_pointsDesc: "Целевое количество очков для победы (по умолчанию: 50)",
  rules_roundTimer: "Таймер раунда",
  rules_roundTimerDesc: "Лимит времени на раунд (15–300 секунд, по умолчанию: 60)",
  rules_skipPenalty: "Штраф за пропуск",
  rules_skipPenaltyDesc: "Включить/отключить вычет очков за пропущенные слова",
  rules_teamsLabel: "Команды",
  rules_teamsDesc: "Одновременно могут играть 2–10 команд",
  rules_themeManagement: "Управление темами",
  rules_feat1: "Создание тем: создайте собственные темы со своим набором слов",
  rules_feat2: "Импорт тем: импортируйте темы из внешних источников в формате JSON",
  rules_feat3: "Фильтрация: по сложности, языку, своим темам, избранным, статусу проверки",
  rules_feat4: "Поиск: найдите темы по названию или описанию",
  rules_feat5: "Минимум слов: каждая тема должна содержать не менее 30 слов",
  rules_gameFeatures: "Возможности игры",
  rules_gameHistory: "История игр",
  rules_gameHistoryDesc: "Просматривайте все завершённые игры и отслеживайте статистику",
  rules_gameResumption: "Продолжение игры",
  rules_gameResumptionDesc: "Возобновите незавершённые игры с того места, где остановились",
  rules_cheatingDetection: "Обнаружение читерства",
  rules_cheatingDetectionDesc: "Отслеживает время начала раундов для предотвращения нечестной игры",
  rules_resultConfirmation: "Подтверждение результатов",
  rules_resultConfirmationDesc: "Проверьте и подтвердите результаты раунда перед подсчётом очков",
  rules_howToPlay: "Как играть",
  rules_step1: "Выберите тему со словами для угадывания",
  rules_step2: "Настройте параметры игры (очки, таймер, команды)",
  rules_step3: "По очереди объясняйте слова своей команде",
  rules_step4: "Нажмите «Угадано» для правильных ответов, «Пропустить» для сложных слов",
  rules_step5: "Просмотрите и подтвердите результаты после каждого раунда",
  rules_step6: "Продолжайте, пока одна из команд не наберёт целевое количество очков",
  rules_difficultyLevels: "Уровни сложности",
  rules_veryEasy: "Очень лёгкий",
  rules_easy: "Лёгкий",
  rules_medium: "Средний",
  rules_hard: "Сложный",
  rules_veryHard: "Очень сложный",

  cs_cheatingTitle: "Читерство обнаружено",
  cs_cheatingDesc: "Слишком много слов угадано слишком быстро",
  cs_pausedTitle: "Раунд на паузе",
  cs_pausedDesc: "Слово скрыто до возобновления",
};

export const locales: Record<string, Translations> = { en, ru };

export type LocaleCode = keyof typeof locales;
