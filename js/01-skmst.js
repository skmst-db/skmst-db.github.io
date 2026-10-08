document.addEventListener('DOMContentLoaded', function () {
    initShowcase();
    setInterval(updateProgressBars, 60000);
});

function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function updateProgressBars() {
    const now = getJSTNow();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth(); // 0-11
    const date = now.getUTCDate();

    const birthDate = createJSTDate(1973, 9, 14); // Born: 1973-10-14
    const debutDate = createJSTDate(1992, 8, 23); // Debut: 1992-09-23

    // 1. 出道当前年的圆环进度条
    const debutMonth = 8; // September (0-indexed)
    const debutDay = 23;
    let debutAge = year - 1992;
    if (month < debutMonth || (month === debutMonth && date < debutDay)) {
        debutAge--;
    }

    let lastDebutAnniversary = createJSTDate(year, debutMonth, debutDay);
    let nextDebutAnniversary = createJSTDate(year + 1, debutMonth, debutDay);

    if (now < lastDebutAnniversary) {
        lastDebutAnniversary = createJSTDate(year - 1, debutMonth, debutDay);
        nextDebutAnniversary = createJSTDate(year, debutMonth, debutDay);
    }

    const debutYearProgress = (now - lastDebutAnniversary) / (nextDebutAnniversary - lastDebutAnniversary) * 100;
    updateBar('debut-year', debutYearProgress);
    const debutYearLabel = document.getElementById('debut-year-label');
    if (debutYearLabel) debutYearLabel.textContent = getOrdinal(debutAge + 1);

    // 2. 出道当前十年的圆环进度条
    const debutDecadeStartAge = Math.floor(debutAge / 10) * 10;
    const debutDecadeEndAge = debutDecadeStartAge + 10;

    const debutDecadeStart = createJSTDate(1992 + debutDecadeStartAge, debutMonth, debutDay);
    const debutDecadeEnd = createJSTDate(1992 + debutDecadeEndAge, debutMonth, debutDay);

    const debutDecadeProgress = (now - debutDecadeStart) / (debutDecadeEnd - debutDecadeStart) * 100;
    updateBar('debut-decade', debutDecadeProgress);
    const debutDecadeLabel = document.getElementById('debut-decade-label');
    if (debutDecadeLabel) debutDecadeLabel.textContent = getOrdinal(debutDecadeEndAge);

    // 3. 出道日的计数（起始日算作第1天）
    const debutDaysDiff = getJSTDaysDifference(debutDate, now) + 1;
    const debutDaysElem = document.getElementById('debut-counter-days');
    if (debutDaysElem) debutDaysElem.textContent = `${debutDaysDiff}`;
    const debutCounterLabel = document.getElementById('debut-counter-label');
    if (debutCounterLabel) debutCounterLabel.textContent = 'Days';

    // 4. 当前年龄的圆环进度条
    const birthMonth = 9; // October (0-indexed)
    const birthDay = 14;
    let age = year - 1973;
    if (month < birthMonth || (month === birthMonth && date < birthDay)) {
        age--;
    }

    let lastBirthday = createJSTDate(year, birthMonth, birthDay);
    let nextBirthday = createJSTDate(year + 1, birthMonth, birthDay);

    if (now < lastBirthday) {
        lastBirthday = createJSTDate(year - 1, birthMonth, birthDay);
        nextBirthday = createJSTDate(year, birthMonth, birthDay);
    }

    const ageProgress = (now - lastBirthday) / (nextBirthday - lastBirthday) * 100;
    updateBar('age', ageProgress);
    const ageLabel = document.getElementById('age-label');
    if (ageLabel) ageLabel.textContent = `${age}`;

    // 5. 当前年龄的十年的进度条
    const currentDecadeStartAge = Math.floor(age / 10) * 10;
    const currentDecadeEndAge = currentDecadeStartAge + 10;

    const decadeStartBirthday = createJSTDate(1973 + currentDecadeStartAge, birthMonth, birthDay);
    const decadeEndBirthday = createJSTDate(1973 + currentDecadeEndAge, birthMonth, birthDay);

    const lifeDecadeProgress = (now - decadeStartBirthday) / (decadeEndBirthday - decadeStartBirthday) * 100;
    updateBar('life-decade', lifeDecadeProgress);
    const lifeDecadeLabel = document.getElementById('life-decade-label');
    if (lifeDecadeLabel) lifeDecadeLabel.textContent = `${currentDecadeStartAge}s`;

    // 6. 当前年龄的计数（起始日算作第1天）
    const ageDaysDiff = getJSTDaysDifference(birthDate, now) + 1;
    const ageDaysElem = document.getElementById('age-counter-days');
    if (ageDaysElem) ageDaysElem.textContent = `${ageDaysDiff}`;
    const ageCounterLabel = document.getElementById('age-counter-label');
    if (ageCounterLabel) ageCounterLabel.textContent = 'Days';

    // 7. 出道日到现在占出生日到现在的比重
    const timeFromBirth = now - birthDate;
    const timeFromDebut = now - debutDate;
    const ratioProgress = (timeFromDebut / timeFromBirth) * 100;
    updateBar('debut-ratio', ratioProgress);
    const debutRatioLabel = document.getElementById('debut-ratio-label');
    if (debutRatioLabel) debutRatioLabel.textContent = `Debut`;
}

function updateBar(idPrefix, percentage) {
    const circle = document.getElementById(`${idPrefix}-bar`);
    const text = document.getElementById(`${idPrefix}-percent`);

    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    const circumference = 219.91;
    const offset = circumference - (clampedPercentage / 100) * circumference;

    if (circle) {
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 50);
    }
    if (text) text.textContent = `${Math.round(clampedPercentage)}%`;
}

// --- Showcase Logic ---

async function initShowcase() {
    const works = await fetchWorks();
    if (works.length === 0) return;
    renderShowcase('showcase-list', works);
}

async function fetchWorks() {
    try {
        const events = await fetchBiographyCSV();
        const works = events
            .map(event => {
                const noteWords = (event.note || '').toLowerCase().split(',').map(word => word.trim());
                if (noteWords.includes('memo') || noteWords.includes('uwasa')) return null;

                const dateAdd = (event.additionalDates || [])
                    .map(dateStr => parseJSTDate(dateStr))
                    .filter(Boolean);

                const years = new Set();
                if (event.startDate) years.add(event.startDate.getUTCFullYear());
                if (event.endDate) years.add(event.endDate.getUTCFullYear());
                dateAdd.forEach(date => years.add(date.getUTCFullYear()));
                const year = years.size > 0 ? Math.max(...years) : 0;

                return {
                    year,
                    name: event.name,
                    type: event.worksType,
                    dateStart: event.startDate || null,
                    dateEnd: event.endDate || event.startDate || null,
                    dateAdd,
                    url: event.url,
                    isLead: event.role && event.role.includes('主演'),
                    isAward: event.award && event.award.trim() !== ''
                };
            })
            .filter(work => {
                if (!work || !work.name || work.name.trim() === '') {
                    return false;
                }
                if (!work.year || work.year === 0) return false;
                return true;
            });

        const nameGroups = new Map();
        for (const work of works) {
            const key = work.name;
            if (!nameGroups.has(key)) {
                nameGroups.set(key, []);
            }
            nameGroups.get(key).push(work);
        }

        const consolidatedWorks = [];
        for (const [key, worksInGroup] of nameGroups) {
            worksInGroup.sort((a, b) => a.dateStart - b.dateStart);
            const earliestWork = worksInGroup[0];

            let minDateStart = null;
            let maxDateEnd = null;
            const allYears = new Set();
            let hasLeadRole = false;
            let hasAward = false;

            worksInGroup.forEach(w => {
                if (w.isLead) hasLeadRole = true;
                if (w.isAward) hasAward = true;
                if (w.dateStart) {
                    if (!minDateStart || w.dateStart < minDateStart) minDateStart = w.dateStart;
                    allYears.add(w.dateStart.getUTCFullYear());
                }
                if (w.dateEnd) {
                    if (!maxDateEnd || w.dateEnd > maxDateEnd) maxDateEnd = w.dateEnd;
                    allYears.add(w.dateEnd.getUTCFullYear());
                }
                if (w.dateAdd && w.dateAdd.length > 0) {
                    w.dateAdd.forEach(date => {
                        allYears.add(date.getUTCFullYear());
                        if (!minDateStart || date < minDateStart) minDateStart = date;
                        if (!maxDateEnd || date > maxDateEnd) maxDateEnd = date;
                    });
                }
            });

            const uniqueYears = [...allYears].sort((a, b) => a - b);
            const leadWorksCount = worksInGroup.filter(w => w.isLead).length;
            const isMultiYear = uniqueYears.length > 1 && leadWorksCount >= 2;
            const isSeries = uniqueYears.length > 1 && worksInGroup.length >= 2;

            const today = getJSTNow();
            today.setUTCHours(0, 0, 0, 0);

            const hasRecentActivity = worksInGroup.some(w => {
                const dates = [];
                if (w.dateStart) dates.push(w.dateStart);
                if (w.dateEnd) dates.push(w.dateEnd);
                if (w.dateAdd && w.dateAdd.length > 0) dates.push(...w.dateAdd);

                if (dates.length === 0) return false;

                const minDate = dates.reduce((a, b) => a < b ? a : b);
                const maxDate = dates.reduce((a, b) => a > b ? a : b);

                const startLimit = new Date(minDate);
                startLimit.setUTCDate(startLimit.getUTCDate() - 30);

                const endLimit = new Date(maxDate);
                endLimit.setUTCDate(endLimit.getUTCDate() + 30);

                return today >= startLimit && today <= endLimit;
            });

            consolidatedWorks.push({
                name: key,
                year: Math.max(...uniqueYears),
                years: uniqueYears.join(' '),
                type: earliestWork.type,
                url: earliestWork.url,
                dateStart: minDateStart,
                dateEnd: maxDateEnd,
                isMultiYear: isMultiYear,
                isSeries: isSeries,
                isLead: hasLeadRole,
                isRecent: hasRecentActivity,
                isAward: hasAward
            });
        }

        return consolidatedWorks.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            if (!a.dateStart && !b.dateStart) return 0;
            if (!a.dateStart) return 1;
            if (!b.dateStart) return -1;
            return b.dateStart - a.dateStart;
        });
    } catch (error) {
        console.error('Error fetching works:', error);
        return [];
    }
}

function renderShowcase(containerId, works) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // 1. Setup Filters at top
    renderFilters();

    const isPureEnglish = (str) => !/[^\x00-\x7F]/.test(str);

    // 2. Render Works
    works.forEach((work) => {
        const item = document.createElement('div');
        item.className = 'showcase-item';
        item.setAttribute('data-type', work.type || 'その他');
        item.setAttribute('data-lead', work.isLead ? 'true' : 'false');
        item.setAttribute('data-award', work.isAward ? 'true' : 'false');

        if (work.isMultiYear) {
            item.setAttribute('data-multi-year', 'true');
        }

        if (work.isSeries) {
            item.setAttribute('data-series', 'true');
        }

        if (work.isRecent) {
            item.setAttribute('data-recent', 'true');
        }

        const content = document.createElement('div');
        content.className = 'showcase-content';

        const title = document.createElement('div');
        title.className = 'showcase-title';
        title.textContent = work.name;

        const meta = document.createElement('div');
        meta.className = 'showcase-meta';
        meta.textContent = work.years;

        content.appendChild(title);
        content.appendChild(meta);
        item.appendChild(content);

        item.onclick = () => {
            if (work.url && work.url.trim() !== '') {
                window.open(work.url, '_blank');
            } else {
                window.open(`https://www.google.com/search?q=堺雅人 ${work.name}`, '_blank');
            }
        };

        container.appendChild(item);

        const style = window.getComputedStyle(item);
        const getSpanFromProp = (prop) => {
            const val = style[prop];
            if (!val) return 0;
            const match = val.match(/span\s+(\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        const colSpan = Math.max(getSpanFromProp('gridColumnStart'), getSpanFromProp('gridColumnEnd'), 1);
        const rowSpan = Math.max(getSpanFromProp('gridRowStart'), getSpanFromProp('gridRowEnd'), 1);

        if (rowSpan > colSpan && !isPureEnglish(work.name)) {
            item.classList.add('vertical-text');
        }
    });

    // 3. Render Progress Tiles at the end in their own container
    const endContainer = document.getElementById('progress-grid-end');
    if (endContainer) {
        renderProgressTiles(endContainer);
    }

    updateProgressBars();
    setupFilters();
}

function renderFilters() {
    const bar = document.getElementById('filter-bar');
    if (!bar) return;

    bar.innerHTML = `
        <div class="filter-bar-content">
            <div class="filter-btn" data-group="types" data-value="映画">
                <span class="filter-switch"></span><span class="filter-label">映画</span>
            </div>
            <div class="filter-btn" data-group="types" data-value="TV">
                <span class="filter-switch"></span><span class="filter-label">TV</span>
            </div>
            <div class="filter-btn" data-group="types" data-value="舞台">
                <span class="filter-switch"></span><span class="filter-label">舞台</span>
            </div>
            <div class="filter-btn" data-group="types" data-value="その他">
                <span class="filter-switch"></span><span class="filter-label">その他</span>
            </div>
            <div class="filter-btn" data-group="types" data-value="声の出演">
                <span class="filter-switch"></span><span class="filter-label">声の出演</span>
            </div>
            <div class="filter-btn" data-group="roles" data-value="シリーズ">
                <span class="filter-switch"></span><span class="filter-label">シリーズ</span>
            </div>
            <div class="filter-btn" data-group="roles" data-value="主演">
                <span class="filter-switch"></span><span class="filter-label">主演</span>
            </div>
            <div class="filter-btn" data-group="roles" data-value="非主演">
                <span class="filter-switch"></span><span class="filter-label">非主演</span>
            </div>
            <div class="filter-btn" data-group="roles" data-value="個人受賞">
                <span class="filter-switch"></span><span class="filter-label">個人受賞</span>
            </div>
        </div>
    `;
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.showcase-item');

    filterButtons.forEach(btn => {
        btn.onclick = () => {
            btn.classList.toggle('active');
            updateVisibility();
        };
    });

    function updateVisibility() {
        const activeTypeBtns = Array.from(document.querySelectorAll('.filter-btn.active[data-group="types"]'))
            .map(btn => btn.dataset.value);
        const activeRoleBtns = Array.from(document.querySelectorAll('.filter-btn.active[data-group="roles"]'))
            .map(btn => btn.dataset.value);

        items.forEach(item => {
            const type = item.getAttribute('data-type');
            const isLead = item.getAttribute('data-lead') === 'true';
            const isAward = item.getAttribute('data-award') === 'true';
            const isSeries = item.getAttribute('data-series') === 'true';

            let typeMatch = activeTypeBtns.length === 0 || activeTypeBtns.includes(type);

            let awardMatch = activeRoleBtns.includes('個人受賞') ? isAward : true;
            let seriesMatch = activeRoleBtns.includes('シリーズ') ? isSeries : true;

            let roleMatch = true;
            const hasLead = activeRoleBtns.includes('主演');
            const hasNonLead = activeRoleBtns.includes('非主演');

            if (hasLead && !hasNonLead) {
                roleMatch = isLead;
            } else if (!hasLead && hasNonLead) {
                roleMatch = !isLead;
            }

            if (typeMatch && awardMatch && seriesMatch && roleMatch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    updateVisibility();
}

function renderProgressTiles(container) {
    container.innerHTML = '';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'progress-grid-end-content';
    container.appendChild(contentWrapper);

    const createTile = (idPrefix, label) => {
        const tile = document.createElement('div');
        tile.className = `progress-tile individual-tile ${idPrefix}`;
        tile.innerHTML = `
            <div class="progress-section">
                <div class="progress-ring-wrapper">
                    <div class="progress-ring-container">
                        <svg class="progress-ring" width="80" height="80">
                            <circle class="progress-ring-circle-bg" cx="40" cy="40" r="35"></circle>
                            <circle class="progress-ring-circle-fill" id="${idPrefix}-bar" cx="40" cy="40" r="35"></circle>
                        </svg>
                        <div class="progress-text-center" id="${idPrefix}-percent">0%</div>
                    </div>
                </div>
                <div class="progress-label-bottom" id="${idPrefix}-label">${label}</div>
            </div>
        `;
        return tile;
    };

    const createCounterTile = (idPrefix, label) => {
        const tile = document.createElement('div');
        tile.className = `progress-tile individual-tile running ${idPrefix}`;
        tile.innerHTML = `
            <div class="progress-section">
                <div class="uptime-content">
                    <div class="uptime-counter" id="${idPrefix}-days">--</div>
                    <div class="uptime-label" id="${idPrefix}-label">${label}</div>
                </div>
            </div>
        `;
        return tile;
    };

    // 1. 出道当前年的圆环进度条
    contentWrapper.appendChild(createTile('debut-year', '35th'));
    // 2. 出道当前十年的圆环进度条
    contentWrapper.appendChild(createTile('debut-decade', '40th'));
    // 3. 出道日的计数
    contentWrapper.appendChild(createCounterTile('debut-counter', 'Days'));
    // 4. 当前年龄的圆环进度条
    contentWrapper.appendChild(createTile('age', '52'));
    // 5. 当前年龄的十年的进度条
    contentWrapper.appendChild(createTile('life-decade', '50s'));
    // 6. 当前年龄的计数
    contentWrapper.appendChild(createCounterTile('age-counter', 'Days'));
    // 7. 出道日到现在占出生日到现在的比重
    contentWrapper.appendChild(createTile('debut-ratio', 'Debut'));
}
