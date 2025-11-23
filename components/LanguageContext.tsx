import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ru' | 'uz';

export const translations = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      dashboard: 'Dashboard',
      newKey: 'New Key',
      logout: 'Logout',
      login: 'Login with Google',
      createKey: 'Create Key',
    },
    home: {
      status: 'Secure V3.0 Protocol Active',
      titleStart: 'The Ultimate',
      titleEnd: 'Mod Key',
      titleSuffix: 'Storage',
      desc: 'Secure, encrypted, and instant. Store your configuration files, mod menu keys, and scripts in a fortified vault. Better than Pastebin.',
      startBtn: 'Start Secure Session',
      dashboardBtn: 'Go to Dashboard',
      learnMore: 'Learn More',
      feat1Title: 'Military-Grade Encryption',
      feat1Desc: "Your data is protected by Google's robust security infrastructure. Only you decide who sees your keys.",
      feat2Title: 'Developer Friendly',
      feat2Desc: 'Syntax highlighting for JSON, Lua, and C++. Perfect for sharing mod configs and scripts.',
      feat3Title: 'Persistent Storage',
      feat3Desc: 'Unlike temporary clipboards, KeyVault stores your data indefinitely in the cloud.',
      poweredBy: 'Powered by Industry Leaders',
    },
    dashboard: {
      title: 'Your Vault',
      subtitle: 'Manage your secure keys and configuration files.',
      create: 'Create New',
      noKeysTitle: 'No keys generated yet',
      noKeysDesc: 'Create your first secure paste to get started.',
      createNow: 'Create Now',
      private: 'Private',
      public: 'Public',
      view: 'View',
      copied: 'Link copied!',
      loading: 'Loading Vault...',
      expires: 'Expires:',
      never: 'Never',
      expired: 'EXPIRED'
    },
    create: {
      header: 'Create New Secure Paste',
      generate: 'Generate Mod Key',
      titleLabel: 'Title',
      titlePlaceholder: 'e.g. PUBG Mobile Mod V1.3 Config',
      contentLabel: 'Content / Key',
      contentPlaceholder: 'Paste your script, JSON, or Key here...',
      visibility: 'Visibility:',
      type: 'Type:',
      duration: 'Duration:',
      private: 'Private',
      public: 'Public',
      text: 'Plain Text',
      json: 'JSON',
      key: 'License Key',
      save: 'Save to Vault',
      encrypting: 'Encrypting...',
      error: 'Error creating paste',
      timeout: 'Connection timed out. Please check your internet.',
      durations: {
        hour1: '1 Hour',
        day1: '1 Day',
        week1: '1 Week',
        month1: '1 Month',
        forever: 'Forever (No Limit)'
      }
    },
    view: {
      loading: 'Decrypting Vault Data...',
      notFoundTitle: 'Access Denied',
      notFoundDesc: 'Paste not found or access denied.',
      expiredTitle: 'Key Expired',
      expiredDesc: 'This secure key has reached its time limit and has been automatically deleted from view.',
      returnHome: 'Return Home',
      keyType: 'License Key',
      justNow: 'Just now',
      copied: 'Copied!',
      copyRaw: 'Copy Raw',
      readOnly: 'ReadOnly Mode',
      createOwn: 'Create your own secure paste',
      expiresIn: 'Expires in'
    },
    about: {
      tag: 'System Architecture v3.0',
      titleStart: 'Fortified Digital',
      titleEnd: 'Vault',
      desc: 'KeyVault Pro is engineered for the underground development community. We provide persistent, encrypted storage for mod configurations, scripts, and license keys.',
      status: 'System Status',
      operational: 'OPERATIONAL',
      encryption: 'Encryption',
      latency: 'Server Latency',
      totalKeys: 'Total Protected Keys',
      whyTitle: 'Why KeyVault over Pastebin?',
      whyDesc: "Pastebin deletes files, bans IPs, and lacks syntax highlighting for specific game configs. KeyVault is built specifically for modders. We don't throttle your access, we support raw JSON/Lua rendering, and our dark mode is designed for late-night coding sessions.",
      authTitle: 'Identity Protection',
      authDesc: 'We use Google OAuth 2.0 protocol for authentication, meaning we never see or store your password. Your identity is decoupled from your data via internal ID hashing.',
      infraTitle: 'Firebase Infrastructure',
      infraDesc: 'Our backend relies on Google Firebase, offering 99.99% uptime and global CDN distribution. Your keys are replicated across multiple data centers to prevent data loss.',
      supported: 'Supported Formats',
      securityNet: 'Global Security Net',
      ready: 'Ready to deploy?',
      join: 'Join thousands of developers storing their private configs securely.',
      createBtn: 'Create Secure Paste',
      features: [
        'DDoS Mitigation Active',
        'Cloud Firestore Realtime DB',
        'Auto-Scaling Infrastructure',
        'No IP Logging for Viewers',
        'Instant Raw Text Access'
      ]
    }
  },
  ru: {
    nav: {
      home: 'Главная',
      about: 'О нас',
      dashboard: 'Панель',
      newKey: 'Новый Ключ',
      logout: 'Выйти',
      login: 'Войти через Google',
      createKey: 'Создать Ключ',
    },
    home: {
      status: 'Протокол защиты V3.0 активен',
      titleStart: 'Лучшее хранилище',
      titleEnd: 'Мод-Ключей',
      titleSuffix: '',
      desc: 'Безопасно, зашифровано и мгновенно. Храните ваши конфигурации, ключи мод-меню и скрипты в защищенном хранилище. Лучше, чем Pastebin.',
      startBtn: 'Начать сессию',
      dashboardBtn: 'В панель управления',
      learnMore: 'Подробнее',
      feat1Title: 'Военный уровень шифрования',
      feat1Desc: 'Ваши данные защищены инфраструктурой безопасности Google. Только вы решаете, кто видит ваши ключи.',
      feat2Title: 'Для разработчиков',
      feat2Desc: 'Подсветка синтаксиса для JSON, Lua и C++. Идеально для обмена конфигами модов и скриптами.',
      feat3Title: 'Вечное хранение',
      feat3Desc: 'В отличие от временных буферов обмена, KeyVault хранит ваши данные в облаке бесконечно.',
      poweredBy: 'При поддержке лидеров индустрии',
    },
    dashboard: {
      title: 'Ваше Хранилище',
      subtitle: 'Управляйте вашими безопасными ключами и файлами конфигурации.',
      create: 'Создать',
      noKeysTitle: 'Ключи еще не созданы',
      noKeysDesc: 'Создайте свой первый безопасный файл, чтобы начать.',
      createNow: 'Создать сейчас',
      private: 'Приватный',
      public: 'Публичный',
      view: 'Открыть',
      copied: 'Ссылка скопирована!',
      loading: 'Загрузка хранилища...',
      expires: 'Истекает:',
      never: 'Никогда',
      expired: 'ИСТЕК'
    },
    create: {
      header: 'Создать безопасную запись',
      generate: 'Сгенерировать ключ',
      titleLabel: 'Название',
      titlePlaceholder: 'например, PUBG Mobile Mod V1.3 Config',
      contentLabel: 'Контент / Ключ',
      contentPlaceholder: 'Вставьте скрипт, JSON или ключ сюда...',
      visibility: 'Видимость:',
      type: 'Тип:',
      duration: 'Срок действия:',
      private: 'Приватный',
      public: 'Публичный',
      text: 'Текст',
      json: 'JSON',
      key: 'Лиценз. Ключ',
      save: 'Сохранить в сейф',
      encrypting: 'Шифрование...',
      error: 'Ошибка создания записи',
      timeout: 'Тайм-аут соединения. Проверьте интернет.',
      durations: {
        hour1: '1 Час',
        day1: '1 День',
        week1: '1 Неделя',
        month1: '1 Месяц',
        forever: 'Навсегда (Без лимита)'
      }
    },
    view: {
      loading: 'Расшифровка данных...',
      notFoundTitle: 'Доступ запрещен',
      notFoundDesc: 'Запись не найдена или доступ закрыт.',
      expiredTitle: 'Срок действия истек',
      expiredDesc: 'Срок действия этого безопасного ключа истек, и он был автоматически удален из просмотра.',
      returnHome: 'На главную',
      keyType: 'Лиценз. Ключ',
      justNow: 'Только что',
      copied: 'Скопировано!',
      copyRaw: 'Копировать',
      readOnly: 'Режим чтения',
      createOwn: 'Создать свою запись',
      expiresIn: 'Истекает через'
    },
    about: {
      tag: 'Архитектура системы v3.0',
      titleStart: 'Цифровой',
      titleEnd: 'Бункер',
      desc: 'KeyVault Pro разработан для андеграунд сообщества разработчиков. Мы обеспечиваем постоянное зашифрованное хранение конфигураций модов, скриптов и лицензионных ключей.',
      status: 'Статус Системы',
      operational: 'АКТИВЕН',
      encryption: 'Шифрование',
      latency: 'Задержка',
      totalKeys: 'Всего Ключей',
      whyTitle: 'Почему KeyVault, а не Pastebin?',
      whyDesc: "Pastebin удаляет файлы, банит IP и не имеет подсветки синтаксиса для игровых конфигов. KeyVault создан специально для моддеров. Мы не ограничиваем доступ и поддерживаем raw JSON/Lua.",
      authTitle: 'Защита личности',
      authDesc: 'Мы используем протокол Google OAuth 2.0. Мы никогда не видим и не храним ваши пароли. Ваша личность отделена от данных через хеширование.',
      infraTitle: 'Инфраструктура Firebase',
      infraDesc: 'Наш бэкенд работает на Google Firebase, обеспечивая 99.99% аптайма. Ваши ключи реплицируются в нескольких дата-центрах.',
      supported: 'Поддерживаемые форматы',
      securityNet: 'Глобальная безопасность',
      ready: 'Готовы к деплою?',
      join: 'Присоединяйтесь к тысячам разработчиков, хранящих свои конфиги безопасно.',
      createBtn: 'Создать запись',
      features: [
        'DDoS защита активна',
        'Cloud Firestore Realtime DB',
        'Авто-масштабирование',
        'Без логов IP для просмотров',
        'Мгновенный доступ к тексту'
      ]
    }
  },
  uz: {
    nav: {
      home: 'Bosh Sahifa',
      about: 'Haqida',
      dashboard: 'Kabinet',
      newKey: 'Yangi Kalit',
      logout: 'Chiqish',
      login: 'Google orqali kirish',
      createKey: 'Kalit Yaratish',
    },
    home: {
      status: 'Xavfsiz V3.0 Protokol Faol',
      titleStart: 'Eng Z o\'r',
      titleEnd: 'Mod Kalit',
      titleSuffix: 'Ombori',
      desc: 'Xavfsiz, shifrlangan va tezkor. Konfiguratsiya fayllaringizni, mod menyu kalitlari va skriptlarni mustahkam seyfda saqlang. Pastebin-dan yaxshiroq.',
      startBtn: 'Xavfsiz Seansni Boshlash',
      dashboardBtn: 'Kabinetga O\'tish',
      learnMore: 'Batafsil',
      feat1Title: 'Harbiy Darajadagi Shifrlash',
      feat1Desc: "Ma'lumotlaringiz Google xavfsizlik infratuzilmasi orqali himoyalangan. Kalitlaringizni kim ko'rishini faqat siz hal qilasiz.",
      feat2Title: 'Dasturchilar Uchun',
      feat2Desc: 'JSON, Lua va C++ uchun sintaksis yoritgichi. Mod konfiglari va skriptlarni ulashish uchun juda qulay.',
      feat3Title: 'Doimiy Saqlash',
      feat3Desc: 'Vaqtinchalik almashish buferlaridan farqli o\'laroq, KeyVault ma\'lumotlaringizni bulutda abadiy saqlaydi.',
      poweredBy: 'Sanoat yetakchilari tomonidan quvvatlanadi',
    },
    dashboard: {
      title: 'Sizning Seyfingiz',
      subtitle: 'Xavfsiz kalitlar va konfiguratsiya fayllarini boshqaring.',
      create: 'Yangi Yaratish',
      noKeysTitle: 'Hali kalitlar yaratilmagan',
      noKeysDesc: 'Boshlash uchun birinchi xavfsiz faylingizni yarating.',
      createNow: 'Hozir Yaratish',
      private: 'Maxfiy',
      public: 'Ommaviy',
      view: 'Ko\'rish',
      copied: 'Havola nusxalandi!',
      loading: 'Seyf yuklanmoqda...',
      expires: 'Muddati:',
      never: 'Cheksiz',
      expired: 'MUDDATI TUGAGAN'
    },
    create: {
      header: 'Yangi Xavfsiz Fayl Yaratish',
      generate: 'Mod Kalit Generatsiya Qilish',
      titleLabel: 'Sarlavha',
      titlePlaceholder: 'masalan, PUBG Mobile Mod V1.3 Config',
      contentLabel: 'Kontent / Kalit',
      contentPlaceholder: 'Skript, JSON yoki Kalitni shu yerga joylang...',
      visibility: 'Ko\'rinish:',
      type: 'Tur:',
      duration: 'Amal qilish muddati:',
      private: 'Maxfiy',
      public: 'Ommaviy',
      text: 'Oddiy Matn',
      json: 'JSON',
      key: 'Litsenziya Kaliti',
      save: 'Seyfga Saqlash',
      encrypting: 'Shifrlanmoqda...',
      error: 'Yaratishda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.',
      timeout: 'Internet aloqasi sekin. Qaytadan urinib ko\'ring.',
      durations: {
        hour1: '1 Soat',
        day1: '1 Kun',
        week1: '1 Hafta',
        month1: '1 Oy',
        forever: 'Cheksiz (Abadiy)'
      }
    },
    view: {
      loading: 'Ma\'lumotlar deshifrlanmoqda...',
      notFoundTitle: 'Kirish Taqiqlandi',
      notFoundDesc: 'Fayl topilmadi yoki kirish huquqi yo\'q.',
      expiredTitle: 'Kalit Muddati Tugagan',
      expiredDesc: 'Ushbu xavfsiz kalitning vaqti tugagan va u avtomatik ravishda o\'chirib tashlangan.',
      returnHome: 'Bosh Sahifaga',
      keyType: 'Litsenziya Kaliti',
      justNow: 'Hozirgina',
      copied: 'Nusxalandi!',
      copyRaw: 'Nusxalash',
      readOnly: 'O\'qish rejimi',
      createOwn: 'O\'z xavfsiz faylingizni yarating',
      expiresIn: 'Qolgan vaqt'
    },
    about: {
      tag: 'Tizim Arxitekturasi v3.0',
      titleStart: 'Raqamli',
      titleEnd: 'Bunker',
      desc: 'KeyVault Pro yashirin dasturchilar hamjamiyati uchun ishlab chiqilgan. Biz mod konfiguratsiyalari, skriptlar va litsenziya kalitlari uchun doimiy, shifrlangan saqlashni ta\'minlaymiz.',
      status: 'Tizim Holati',
      operational: 'FAOL',
      encryption: 'Shifrlash',
      latency: 'Kechikish',
      totalKeys: 'Jami Kalitlar',
      whyTitle: 'Nega Pastebin emas, KeyVault?',
      whyDesc: "Pastebin fayllarni o'chiradi, IP-larni bloklaydi va o'yin konfiglari uchun sintaksis yoritgichiga ega emas. KeyVault maxsus modderlar uchun qurilgan. Biz kirishni cheklamaymiz va raw JSON/Lua-ni qo'llab-quvvatlaymiz.",
      authTitle: 'Shaxsni Himoya Qilish',
      authDesc: 'Biz autentifikatsiya uchun Google OAuth 2.0 protokolidan foydalanamiz, ya\'ni parolingizni hech qachon ko\'rmaymiz va saqlamaymiz. Sizning shaxsingiz ma\'lumotlardan hash orqali ajratilgan.',
      infraTitle: 'Firebase Infratuzilmasi',
      infraDesc: 'Bizning backend Google Firebase-da ishlaydi, bu 99.99% ishlash vaqtini ta\'minlaydi. Ma\'lumotlar yo\'qolishining oldini olish uchun kalitlaringiz bir nechta ma\'lumot markazlarida nusxalanadi.',
      supported: 'Qo\'llab-quvvatlanadigan formatlar',
      securityNet: 'Global Xavfsizlik',
      ready: 'Ishga tushirishga tayyormisiz?',
      join: 'Konfiglarini xavfsiz saqlayotgan minglab dasturchilarga qo\'shiling.',
      createBtn: 'Xavfsiz Fayl Yaratish',
      features: [
        'DDoS himoyasi faol',
        'Cloud Firestore Realtime DB',
        'Avto-masshtablash',
        'IP loglari saqlanmaydi',
        'Tezkor matnli kirish'
      ]
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType>({ 
  language: 'en', 
  setLanguage: () => {}, 
  t: translations.en 
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ru' || savedLang === 'uz')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};