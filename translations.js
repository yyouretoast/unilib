// Remove the duplicate event listener and simplify the code
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language
    const userLang = localStorage.getItem('preferred-language') || 'en';
    applyLanguage(userLang);

    // Add single event listener for language toggle
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
});

function toggleLanguage() {
    const currentLang = localStorage.getItem('preferred-language') || 'en';
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    applyLanguage(newLang);
}

function applyLanguage(lang) {
    // Update HTML lang and direction
    document.documentElement.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    // Store preference
    localStorage.setItem('preferred-language', lang);
    // Update UI
    updateTranslations(lang);
    updateToggleButton(lang);
}

function updateToggleButton(currentLang) {
    const buttonText = currentLang === 'en' ? 'العربية' : 'English';
    const langText = document.querySelector('.lang-text');
    if (langText) {
        langText.textContent = buttonText;
    }
}

function updateTranslations(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
}

const translations = {
    en: {
        title: "University Library",
        search: "Search Books...",
        home: "Home",
        account: "Account",
        booking: "Booking",
        libraryCollection: "Library Collection",
        author: "Author",
        isbn: "ISBN",
        genre: "Genre",
        availableCopies: "Available Copies",
        reserveBook: "Reserve Book",
        notAvailable: "Not Available",
        welcome: "SAMS Library",
        welcomeText: "Search the Library's collection of books, find subject-specific resources.",
        searchButton: "SEARCH",
        contact: "Contact Us",
        about: "About Us",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        contact: "Contact Us",
        address: "Address",
        phone: "Phone",
        email: "Email",
        sendMessage: "Send Message",
        name: "Name",
        typeMessage: "Type your message",
        send: "Send"
    },
    ar: {
        title: "المكتبة الجامعية",
        search: "...ابحث في الكتب",
        home: "الرئيسية",
        account: "الحساب",
        booking: "حجز",
        libraryCollection: "مجموعة المكتبة",
        author: "المؤلف",
        isbn: "الرقم التسلسلي",
        genre: "النوع",
        availableCopies: "النسخ المتاحة",
        reserveBook: "احجز الكتاب",
        notAvailable: "غير متاح",
        welcome: "مكتبة اكاديمية السادات",
        welcomeText: "بحث في مجموعة الكتب الخاصة بالمكتبة، العثور على موارد خاصة بالموضوع",
        searchButton: "بحث",
        contact: "اتصل بنا",
        account: "الحساب",
        about: "عنا",
        privacy: "سياسة الخصوصية",
        terms: "الشروط والأحكام",
        contact: "اتصل بنا",
        address: "العنوان",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        sendMessage: "أرسل رسالة",
        name: "الاسم",
        typeMessage: "اكتب رسالتك",
        send: "إرسال"
    }
};