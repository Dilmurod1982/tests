// src/i18n/strings.js
export const STRINGS = {
    // ─── Common ───
    loading: { lat: "Yuklanmoqda...", cyr: "Юкланмоқда..." },
    total: { lat: "Jami", cyr: "Жами" },
    shown: { lat: "koʻrsatilgan", cyr: "кўрсатилган" },
    create: { lat: "Yaratish", cyr: "Яратиш" },
    creating: { lat: "Yaratilmoqda...", cyr: "Яратилмоқда..." },
    cancel: { lat: "Bekor qilish", cyr: "Бекор қилиш" },
    delete: { lat: "Oʻchirish", cyr: "Ўчириш" },
    close: { lat: "Yopish", cyr: "Ёпиш" },
    clear: { lat: "Tozalash", cyr: "Тозалаш" },
    back: { lat: "Orqaga", cyr: "Орқага" },
    confirmDelete: { lat: "Oʻchirilsinmi?", cyr: "Ўчирилсинми?" },
    errorOccurred: { lat: "Xatolik yuz berdi", cyr: "Хатолик юз берди" },
    fillAllFields: {
      lat: "Barcha maydonlarni toʻldiring",
      cyr: "Барча майдонларни тўлдиринг",
    },
    nameRequired: { lat: "Nomni kiriting", cyr: "Номни киритинг" },
  
    // ─── Navbar / Menu ───
    profile: { lat: "Profil", cyr: "Профил" },
    logout: { lat: "Chiqish", cyr: "Чиқиш" },
    admin: { lat: "Administrator", cyr: "Администратор" },
    user: { lat: "Foydalanuvchi", cyr: "Фойдаланувчи" },
    users: { lat: "Foydalanuvchilar", cyr: "Фойдаланувчилар" },
    usersShort: { lat: "Foyd.", cyr: "Фойд." },
    subjects: { lat: "Fanlar", cyr: "Фанлар" },
    tests: { lat: "Testlar", cyr: "Тестлар" },
    allQuestions: { lat: "Barcha savollar", cyr: "Барча саволлар" },
    allQuestionsShort: { lat: "Savollar", cyr: "Саволлар" },
    dashboard: { lat: "Statistika", cyr: "Статистика" },
    dashboardShort: { lat: "Stat.", cyr: "Стат." },
  
    // ─── Login ───
    welcome: { lat: "Xush kelibsiz", cyr: "Хуш келибсиз" },
    loginToApp: { lat: "TestApp kirish", cyr: "TestApp кириш" },
    password: { lat: "Parol", cyr: "Парол" },
    login: { lat: "Kirish", cyr: "Кириш" },
    loggingIn: { lat: "Kirilmoqda...", cyr: "Кирилмоқда..." },
  
    // ─── Login errors ───
    errInvalidEmail: { lat: "Notoʻgʻri email", cyr: "Нотўғри email" },
    errUserNotFound: {
      lat: "Foydalanuvchi topilmadi",
      cyr: "Фойдаланувчи топилмади",
    },
    errWrongPassword: { lat: "Parol notoʻgʻri", cyr: "Парол нотўғри" },
    errInvalidCredential: {
      lat: "Email yoki parol notoʻgʻri",
      cyr: "Email ёки парол нотўғри",
    },
    errTooManyRequests: {
      lat: "Juda koʻp urinish. Keyinroq urinib koʻring",
      cyr: "Жуда кўп уриниш. Кейинроқ уриниб кўринг",
    },
  
    // ─── Profile ───
    joined: { lat: "Roʻyxatdan oʻtgan", cyr: "Рўйхатдан ўтган" },
    lastSignIn: { lat: "Soʻnggi kirish", cyr: "Сўнгги кириш" },
    changePassword: {
      lat: "Parolni oʻzgartirish",
      cyr: "Паролни ўзгартириш",
    },
    currentPassword: { lat: "Joriy parol", cyr: "Жорий парол" },
    newPassword: { lat: "Yangi parol", cyr: "Янги парол" },
    confirmPassword: {
      lat: "Yangi parolni tasdiqlash",
      cyr: "Янги паролни тасдиқлаш",
    },
    passwordHint: { lat: "kamida 6 ta belgi", cyr: "камида 6 та белги" },
    passwordTooShort: {
      lat: "Parol kamida 6 ta belgi boʻlishi kerak",
      cyr: "Парол камида 6 та белги бўлиши керак",
    },
    passwordsDontMatch: { lat: "Parollar mos emas", cyr: "Пароллар мос эмас" },
    newPasswordMustDiffer: {
      lat: "Yangi parol eskisidan farqli boʻlishi kerak",
      cyr: "Янги парол эскисидан фарқли бўлиши керак",
    },
    passwordChanged: {
      lat: "Parol muvaffaqiyatli oʻzgartirildi",
      cyr: "Парол муваффақиятли ўзгартирилди",
    },
    change: { lat: "Oʻzgartirish", cyr: "Ўзгартириш" },
    changing: { lat: "Oʻzgartirilmoqda...", cyr: "Ўзгартирилмоқда..." },
    currentPasswordWrong: {
      lat: "Joriy parol notoʻgʻri",
      cyr: "Жорий парол нотўғри",
    },
    weakPassword: { lat: "Yangi parol juda oddiy", cyr: "Янги парол жуда оддий" },
    requiresRecentLogin: {
      lat: "Iltimos, qayta kiring",
      cyr: "Илтимос, қайта киринг",
    },
    tooManyRequests: {
      lat: "Juda koʻp urinish. Keyinroq urinib koʻring",
      cyr: "Жуда кўп уриниш. Кейинроқ уриниб кўринг",
    },
    userNotFound: {
      lat: "Foydalanuvchi topilmadi",
      cyr: "Фойдаланувчи топилмади",
    },
  
    // ─── Users ───
    usersPageTitle: { lat: "Foydalanuvchilar", cyr: "Фойдаланувчилар" },
    createUser: {
      lat: "Foydalanuvchi yaratish",
      cyr: "Фойдаланувчи яратиш",
    },
    name: { lat: "Ism", cyr: "Исм" },
    role: { lat: "Rol", cyr: "Роль" },
    roleUser: { lat: "Foydalanuvchi", cyr: "Фойдаланувчи" },
    roleAdmin: { lat: "Administrator", cyr: "Администратор" },
    displayName: {
      lat: "Koʻrsatiladigan ism",
      cyr: "Кўрсатиладиган исм",
    },
    noUsers: {
      lat: "Hozircha foydalanuvchilar yoʻq",
      cyr: "Ҳозирча фойдаланувчилар йўқ",
    },
  
    // ─── Subjects ───
    subjectsTitle: { lat: "Fanlar", cyr: "Фанлар" },
    createSubject: { lat: "Fan yaratish", cyr: "Фан яратиш" },
    subject: { lat: "Fan", cyr: "Фан" },
    subjectName: { lat: "Fan nomi", cyr: "Фан номи" },
    subjectPlaceholder: {
      lat: "Misol: Matematika",
      cyr: "Мисол: Математика",
    },
    subjectEmpty: {
      lat: "Hozircha fanlar yoʻq. Birinchisini yarating!",
      cyr: "Ҳозирча фанлар йўқ. Биринчисини яратинг!",
    },
    cannotDelete: { lat: "Oʻchirib boʻlmaydi", cyr: "Ўчириб бўлмайди" },
    testsCount: { lat: "ta test mavjud", cyr: "та тест мавжуд" },
  
    // ─── Tests ───
    testsTitle: { lat: "Testlar", cyr: "Тестлар" },
    createTest: { lat: "Test yaratish", cyr: "Тест яратиш" },
    testName: { lat: "Test nomi", cyr: "Тест номи" },
    testNamePlaceholder: {
      lat: "Misol: Huquq asoslari",
      cyr: "Мисол: Ҳуқуқ асослари",
    },
    testText: { lat: "Test matni", cyr: "Тест матни" },
    selectSubject: {
      lat: "— Fanni tanlang —",
      cyr: "— Фанни танланг —",
    },
    questionsCount: { lat: "ta savol", cyr: "та савол" },
    noSubject: { lat: "Fansiz", cyr: "Фансиз" },
    noTests: {
      lat: "Hozircha testlar mavjud emas.",
      cyr: "Ҳозирча тестлар мавжуд эмас.",
    },
    testNameRequired: {
      lat: "Test nomini kiriting",
      cyr: "Тест номини киритинг",
    },
    subjectRequired: { lat: "Fanni tanlang", cyr: "Фанни танланг" },
    noQuestionsFound: {
      lat: "Birorta savol topilmadi (# bilan boshlanishi kerak)",
      cyr: "Биронта савол топилмади (# билан бошланиши керак)",
    },
    formatHint: {
      lat: "(++++ / ==== / # — Word formati yoki # / + / - — oddiy format)",
      cyr: "(++++ / ==== / # — Word формати ёки # / + / - — оддий формат)",
    },
    foundQuestions: {
      lat: "Topilgan savollar",
      cyr: "Топилган саволлар",
    },
    fixWarningsFirst: {
      lat: "Avval ogohlantirishlarni tuzating",
      cyr: "Аввал огоҳлантиришларни тузатинг",
    },
  
    // ─── Excel export ───
    exportExcel: {
      lat: "Excelʻga yuklab olish",
      cyr: "Excelʻга юклаб олиш",
    },
    downloadExcel: {
      lat: "Testni Excelʻga yuklab olish",
      cyr: "Тестни Excelʻга юклаб олиш",
    },
    exportAll: {
      lat: "Barcha testlarni Excelʻga eksport qilish",
      cyr: "Барча тестларни Excelʻга экспорт қилиш",
    },
    exportSuccess: {
      lat: "Excel fayli yuklab olindi",
      cyr: "Excel файли юклаб олинди",
    },
  
    // ─── All questions ───
    allQuestionsTitle: {
      lat: "Barcha savollar",
      cyr: "Барча саволлар",
    },
    pickTest: {
      lat: "Testni tanlang",
      cyr: "Тестни танланг",
    },
    allTestsCombined: {
      lat: "Barcha testlar (birlashtirilgan)",
      cyr: "Барча тестлар (бирлаштирилган)",
    },
    searchPlaceholder: {
      lat: "Qidirish... (masalan: huquq yoki dav huquq)",
      cyr: "Қидириш... (масалан: ҳуқуқ ёки дав ҳуқуқ)",
    },
    searchHint: {
      lat: "Bir soʻz kiriting — shu soʻz bilan boshlanadigan savollar topiladi. Bir nechta soʻz kiriting (boʻsh joy bilan) — savolda har bir soʻz alohida boshlanishi kerak.",
      cyr: "Бир сўз киритинг — шу сўз билан бошланадиган саволлар топилади. Бир нечта сўз киритинг (бўш жой билан) — саволда ҳар бир сўз алоҳида бошланиши керак.",
    },
    nothingFound: {
      lat: "Hech narsa topilmadi",
      cyr: "Ҳеч нарса топилмади",
    },
  
    // ─── TestRunner ───
    startTest: { lat: "Testni boshlash?", cyr: "Тестни бошлаш?" },
    start: { lat: "Boshlash", cyr: "Бошлаш" },
    showAnswers: {
      lat: "Javoblar koʻrsatilsinmi?",
      cyr: "Жавоблар кўрсатилсинми?",
    },
    yes: { lat: "Ha", cyr: "Ҳа" },
    no: { lat: "Yoʻq", cyr: "Йўқ" },
    learnMode: { lat: "Oʻquv rejimi", cyr: "Ўқув режими" },
    examMode: { lat: "Imtihon rejimi", cyr: "Имтиҳон режими" },
    learnModeDescription: {
      lat: "Toʻgʻri javob darhol yashil rangda koʻrsatiladi. Natija statistikaga qoʻshilmaydi.",
      cyr: "Тўғри жавоб дарҳол яшил рангда кўрсатилади. Натижа статистикага қўшилмайди.",
    },
    examModeDescription: {
      lat: "Javoblar yashiriladi. Vaqt: {n} daqiqa. Natija statistikaga qoʻshiladi.",
      cyr: "Жавоблар яширилади. Вақт: {n} дақиқа. Натижа статистикага қўшилади.",
    },
    randomOrder: {
      lat: "savollar va javoblar tasodifiy tartibda",
      cyr: "саволлар ва жавоблар тасодифий тартибда",
    },
    question: { lat: "Savol", cyr: "Савол" },
    answered: { lat: "Javob", cyr: "Жавоб" },
    youAnswered: { lat: "Siz javob berdingiz", cyr: "Сиз жавоб бердингиз" },
    prev: { lat: "Oldingi", cyr: "Олдинги" },
    next: { lat: "Keyingi", cyr: "Кейинги" },
    finishTest: { lat: "Yakunlash", cyr: "Якунлаш" },
    confirmFinish: {
      lat: "Testni yakunlashni xohlaysizmi?",
      cyr: "Тестни якунлашни хоҳлайсизми?",
    },
    unanswered: {
      lat: "ta savol javobsiz qoldi",
      cyr: "та савол жавобсиз қолди",
    },
    goToQuestion: { lat: "Savolga oʻtish", cyr: "Саволга ўтиш" },
    left: { lat: "Qoldi", cyr: "Қолди" },
    testFinished: { lat: "Test yakunlandi", cyr: "Тест якунланди" },
    rightAnswers: { lat: "Toʻgʻri javoblar", cyr: "Тўғри жавоблар" },
    yourAnswer: { lat: "Sizning javobingiz", cyr: "Сизнинг жавобингиз" },
    correctAnswer: { lat: "Toʻgʻri javob", cyr: "Тўғри жавоб" },
    backToTests: {
      lat: "Testlar roʻyxatiga",
      cyr: "Тестлар рўйхатига",
    },
    toDashboard: { lat: "Statistikaga", cyr: "Статистикага" },
    elapsed: { lat: "Sarflangan vaqt", cyr: "Сарфланган вақт" },
    learnHint: {
      lat: "Toʻgʻri javob yashil rangda koʻrsatildi. Keyingi savolga oʻting.",
      cyr: "Тўғри жавоб яшил рангда кўрсатилди. Кейинги саволга ўтинг.",
    },
    learnWarning: {
      lat: "⚠️ Oʻquv rejimi — bu natija statistikaga qoʻshilmadi",
      cyr: "⚠️ Ўқув режими — бу натижа статистикага қўшилмади",
    },
    min: { lat: "daq", cyr: "дақ" },
    sec: { lat: "son", cyr: "сон" },
  
    // ─── Dashboard ───
    statsTitle: { lat: "Statistika", cyr: "Статистика" },
    greeting: { lat: "Salom", cyr: "Салом" },
    yourResults: {
      lat: "Sizning natijalaringiz",
      cyr: "Сизнинг натижаларингиз",
    },
    goToTests: { lat: "Testlarga oʻtish", cyr: "Тестларга ўтиш" },
    totalAttempts: { lat: "Topshirilgan", cyr: "Топширилган" },
    totalAttemptsHint: { lat: "jami urinish", cyr: "жами уриниш" },
    average: { lat: "Oʻrtacha", cyr: "Ўртача" },
    allTests: { lat: "Barcha testlar", cyr: "Барча тестлар" },
    best: { lat: "Eng yaxshi", cyr: "Энг яхши" },
    topScore: { lat: "eng yuqori", cyr: "энг юқори" },
    streak: { lat: "Seriya", cyr: "Серия" },
    days: { lat: "kun", cyr: "кун" },
    bestStreak: { lat: "eng uzoq", cyr: "энu uzоқ" },
    dayByDay: { lat: "kunma-kun", cyr: "кунма-кун" },
    lastTen: { lat: "Soʻnggi 10 ta urinish", cyr: "Сўнгги 10 та уриниш" },
    percentView: { lat: "Foiz koʻrinishida", cyr: "Фоиз кўринишида" },
    recentResults: { lat: "Soʻnggi natijalar", cyr: "Сўнгги натижалар" },
    achievements: { lat: "Yutuqlar", cyr: "Ютуқлар" },
    unlocked: { lat: "ochildi", cyr: "очилди" },
    weakTopics: { lat: "Kuchsiz mavzular", cyr: "Кучсиз мавзулар" },
    weakTopicsHint: {
      lat: "Oʻrtacha natija past boʻlgan fanlar",
      cyr: "Ўртача натижа паст бўлган фанлар",
    },
    needsAttention: { lat: "Diqqat talab", cyr: "Диққат талаб" },
    attemptsShort: { lat: "ta", cyr: "та" },
    correct: { lat: "Toʻgʻri", cyr: "Тўғри" },
    time: { lat: "Vaqt", cyr: "Вақт" },
    noResultsYet: {
      lat: "Hozircha natijalar yoʻq",
      cyr: "Ҳозирча натижалар йўқ",
    },
    firstTestHint: {
      lat: "Birinchi testni topshiring — natijalaringiz, seriya va yutuqlaringiz shu yerda paydo boʻladi.",
      cyr: "Биринчи тестни топширинг — натижаларингиз, серия ва ютуқларингиз шу ерда пайдо бўлади.",
    },
    startTests: { lat: "Testlarni boshlash", cyr: "Тестларни бошлаш" },
  
    // ─── Badges ───
    badgeFirst: { lat: "Birinchi qadam", cyr: "Биринчи қадам" },
    badgeFirstDesc: {
      lat: "Birinchi testni topshirdingiz",
      cyr: "Биринчи тестни топширдингиз",
    },
    badgeTen: { lat: "Kitobxon", cyr: "Китобхон" },
    badgeTenDesc: {
      lat: "10 ta test topshirildi",
      cyr: "10 та тест топширилди",
    },
    badgeFifty: { lat: "Marafonchi", cyr: "Марафончи" },
    badgeFiftyDesc: {
      lat: "50 ta test topshirildi",
      cyr: "50 та тест топширилди",
    },
    badgeHundred: { lat: "Yuzlik", cyr: "Юзлик" },
    badgeHundredDesc: {
      lat: "100 ta test topshirildi",
      cyr: "100 та тест топширилди",
    },
    badgePerfect: { lat: "Mukammal", cyr: "Мукаммал" },
    badgePerfectDesc: {
      lat: "100% natijaga erishdingiz",
      cyr: "100% натижага эришдингиз",
    },
    badgePerfect5: { lat: "Sohibkor", cyr: "Соҳибкор" },
    badgePerfect5Desc: {
      lat: "5 ta mukammal natija",
      cyr: "5 та мукаммал натижа",
    },
    badgeTop90: { lat: "Snayper", cyr: "Снайпер" },
    badgeTop90Desc: {
      lat: "Eng yaxshi natija ≥ 90%",
      cyr: "Энг яхши натижа ≥ 90%",
    },
    badgeStreak3: { lat: "3 kunlik seriya", cyr: "3 кунлик серия" },
    badgeStreak3Desc: {
      lat: "3 kun ketma-ket mashq",
      cyr: "3 кун кетма-кет машқ",
    },
    badgeStreak7: { lat: "Bir hafta", cyr: "Бир ҳафта" },
    badgeStreak7Desc: {
      lat: "7 kun ketma-ket mashq",
      cyr: "7 кун кетма-кет машқ",
    },
    badgeStreak30: { lat: "Bir oy", cyr: "Бир ой" },
    badgeStreak30Desc: {
      lat: "30 kun ketma-ket mashq",
      cyr: "30 кун кетма-кет машқ",
    },
  };
  
  export function pick(key, lang) {
    const entry = STRINGS[key];
    if (!entry) return key;
    return entry[lang] || entry.lat;
  }