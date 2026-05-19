(function () {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const bg = isDarkMode ? '#121212' : '#f8f4ed';
    document.write(`<style>html{background-color:${bg}!important;}body{visibility:hidden;}</style>`);
})();

(function () {
    function updateThemeColor(isDark) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isDark ? '#121212' : '#f8f4ed');
        }
    }

    function applyTheme(isDarkMode) {
        document.documentElement.classList.toggle('dark-mode', isDarkMode);
        if (document.body) {
            document.body.classList.toggle('dark-mode', isDarkMode);
        }
        updateThemeColor(isDarkMode);
    }

    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const initialDark = media ? media.matches : false;

    applyTheme(initialDark);

    if (!document.body) {
        document.addEventListener('DOMContentLoaded', function () {
            applyTheme(initialDark);
        });
    }

    if (media && typeof media.addEventListener === 'function') {
        media.addEventListener('change', (event) => {
            applyTheme(event.matches);
        });
    }
})();

(function () {
    'use strict';

    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    function handleSamsungInternet() {
        if (navigator.userAgent.includes('SamsungBrowser')) {
            document.documentElement.style.setProperty('--samsung-fix', '1');
        }
    }

    function handleChromeMobile() {
        if (navigator.userAgent.includes('Chrome') && navigator.userAgent.includes('Mobile')) {
            document.documentElement.style.setProperty('--chrome-mobile-fix', '1');
        }
    }

    function initMobileViewportFixes() {
        setViewportHeight();
        handleSamsungInternet();
        handleChromeMobile();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileViewportFixes);
    } else {
        initMobileViewportFixes();
    }

    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', function () {
        setTimeout(setViewportHeight, 100);
    });

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            setTimeout(setViewportHeight, 100);
        }
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.style.visibility = 'visible';
        });
    });
});

// --- JST utilities (timezone.js) ---
function getJSTNow() {
    const now = new Date();
    return new Date(now.getTime() + (9 * 60 * 60 * 1000));
}

function parseJSTDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;

    const cleanDateString = dateString.trim();
    if (!cleanDateString) return null;

    const normalizedDate = cleanDateString
        .replace(/[年\-.]/g, '/')
        .replace(/月/g, '/')
        .replace(/日/g, '')
        .replace(/\s+/g, '');

    const parts = normalizedDate.split('/');
    if (parts.length < 2 || parts.length > 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parts[2] ? parseInt(parts[2], 10) : 1;

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    return createJSTDate(year, month - 1, day);
}

function formatJSTDate(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
}

function formatJSTDateJapanese(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    return `${year}年${month}月${day}日`;
}

function formatJSTDateTimeJapanese(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');

    return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

function getJSTMidnight() {
    const now = getJSTNow();
    return createJSTDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function getMillisecondsUntilJSTMidnight() {
    const now = getJSTNow();
    const midnight = getJSTMidnight();
    midnight.setUTCDate(midnight.getUTCDate() + 1);
    return midnight.getTime() - now.getTime();
}

function getJSTYear() { return getJSTNow().getUTCFullYear(); }
function getJSTMonth() { return getJSTNow().getUTCMonth(); }
function getJSTDate() { return getJSTNow().getUTCDate(); }
function getJSTHours() { return getJSTNow().getUTCHours(); }
function getJSTMinutes() { return getJSTNow().getUTCMinutes(); }
function getJSTSeconds() { return getJSTNow().getUTCSeconds(); }

function createJSTDate(year, month, day, hour = 0, minute = 0, second = 0) {
    return new Date(Date.UTC(year, month, day, hour, minute, second));
}

function isSameJSTDay(date1, date2) {
    if (!date1 || !date2) return false;
    return date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate();
}

function isJSTToday(date) {
    return isSameJSTDay(date, getJSTNow());
}

function getJSTDaysDifference(date1, date2) {
    const midnight1 = createJSTDate(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
    const midnight2 = createJSTDate(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());

    return Math.floor((midnight2.getTime() - midnight1.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
    return formatJSTDate(date);
}

function toJST(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return new Date(NaN);
    return new Date(date.getTime());
}

function getJSTNowString() {
    const now = getJSTNow();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} JST`;
}
