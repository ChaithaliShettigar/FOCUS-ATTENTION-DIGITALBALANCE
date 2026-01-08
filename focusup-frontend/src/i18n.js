import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      tagline: 'Stay focused, learn smarter, and playfully keep yourself on track.',
      cta: 'Start Learning with FocusUp',
      dashboard: 'Dashboard',
      learn: 'Learn',
      groups: 'Groups',
      analytics: 'Analytics',
      profile: 'Profile',
      settings: 'Settings',
      login: 'Login',
      register: 'Register',
      startSession: 'Start session',
      uploadPdf: 'Upload PDF',
      addYoutube: 'Add YouTube Link',
      timerTarget: 'Set your target study time',
      focusScore: 'Focus score',
      streak: 'Streak',
      language: 'Language',
    },
  },
  hi: {
    translation: {
      tagline: 'ध्यान में रहो, समझदारी से सीखो, और मजेदार तरीके से ट्रैक पर रहो।',
      cta: 'FocusUp के साथ सीखना शुरू करें',
      dashboard: 'डैशबोर्ड',
      learn: 'सीखें',
      groups: 'ग्रुप्स',
      analytics: 'विश्लेषण',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      login: 'लॉगिन',
      register: 'रजिस्टर',
      startSession: 'पढ़ाई सत्र शुरू करें',
      uploadPdf: 'PDF अपलोड करें',
      addYoutube: 'YouTube लिंक जोड़ें',
      timerTarget: 'अपना लक्ष्य समय सेट करें',
      focusScore: 'फोकस स्कोर',
      streak: 'स्ट्रिक',
      language: 'भाषा',
    },
  },
  kn: {
    translation: {
      tagline: 'ಕೇಂದ್ರೀಕೃತವಾಗಿರಿ, ಚುರುಕಾಗಿ ಕಲಿಯಿರಿ, ಮತ್ತು ಮೋಜಿನಿಂದ ಟ್ರ್ಯಾಕ್‌ನಲ್ಲಿ ಇರಿ.',
      cta: 'FocusUp‌ನೊಂದಿಗೆ ಕಲಿಯಲು ಆರಂಭಿಸಿ',
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      learn: 'ಕಲಿ',
      groups: 'ಗುಂಪುಗಳು',
      analytics: 'ವಿಶ್ಲೇಷಣೆ',
      profile: 'ಪ್ರೊಫೈಲ್',
      settings: 'ಸೆಟ್ಟಿಂಗ್ಗಳು',
      login: 'ಲಾಗಿನ್',
      register: 'ರಿಜಿಸ್ಟರ್',
      startSession: 'ಅಭ್ಯಾಸ ಸತ್ರ ಪ್ರಾರಂಭಿಸಿ',
      uploadPdf: 'PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      addYoutube: 'YouTube ಲಿಂಕ್ ಸೇರಿಸಿ',
      timerTarget: 'ನಿಮ್ಮ ಗುರಿ ಸಮಯ ನಿಗದಿ ಮಾಡಿ',
      focusScore: 'ಫೋಕಸ್ ಸ್ಕೋರ್',
      streak: 'ಸತತ ದಿನಗಳು',
      language: 'ಭಾಷೆ',
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n
