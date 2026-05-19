document.addEventListener('DOMContentLoaded', function () {
    initShowcase();
    setInterval(updateProgressBars, 60000);
});

function updateProgressBars() {
    const now = getJSTNow();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth(); // 0-11

    // 0. Century Progress (2000-2099)
    const centuryStart = Math.floor(year / 100) * 100;
    const startOfCentury = new Date(Date.UTC(centuryStart, 0, 1));
    const endOfCentury = new Date(Date.UTC(centuryStart + 100, 0, 1));
    const centuryProgress = (now - startOfCentury) / (endOfCentury - startOfCentury) * 100;
    updateBar('century', centuryProgress);
    const centuryLabel = document.getElementById('century-label');
    if (centuryLabel) {
        const century = Math.floor(year / 100) + 1;
        const suffix = (century % 10 === 1 && century % 100 !== 11) ? 'st' :
            (century % 10 === 2 && century % 100 !== 12) ? 'nd' :
                (century % 10 === 3 && century % 100 !== 13) ? 'rd' : 'th';
        centuryLabel.textContent = `${century}${suffix}C`;
    }

    // 1. Decade Progress (2020-2029)
    const startOfDecade = new Date(Date.UTC(Math.floor(year / 10) * 10, 0, 1));
    const endOfDecade = new Date(Date.UTC((Math.floor(year / 10) + 1) * 10, 0, 1));
    const decadeProgress = (now - startOfDecade) / (endOfDecade - startOfDecade) * 100;
    updateBar('decade', decadeProgress);
    const decadeLabel = document.getElementById('decade-label');
    if (decadeLabel) decadeLabel.textContent = `${Math.floor(year / 10) * 10}s`;

    // 2. Year Progress
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const endOfYear = new Date(Date.UTC(year + 1, 0, 1));
    const yearProgress = (now - startOfYear) / (endOfYear - startOfYear) * 100;
    updateBar('year', yearProgress);
    const yearLabel = document.getElementById('year-label');
    if (yearLabel) yearLabel.textContent = `${year}`;

    // 3. Quarter Progress
    const quarter = Math.floor(month / 3);
    const startOfQuarter = new Date(Date.UTC(year, quarter * 3, 1));
    const endOfQuarter = new Date(Date.UTC(year, (quarter + 1) * 3, 1));
    const quarterProgress = (now - startOfQuarter) / (endOfQuarter - startOfQuarter) * 100;
    updateBar('quarter', quarterProgress);
    const quarterLabel = document.getElementById('quarter-label');
    if (quarterLabel) quarterLabel.textContent = `Q${quarter + 1}`;

    // 4. Month Progress
    const startOfMonth = new Date(Date.UTC(year, month, 1));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 1));
    const monthProgress = (now - startOfMonth) / (endOfMonth - startOfMonth) * 100;
    updateBar('month', monthProgress);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthLabel = document.getElementById('month-label');
    if (monthLabel) monthLabel.textContent = `${monthNames[month]}`;

    // 5. Sakai Masato Age Progress
    // Born: 1973-10-14
    const birthMonth = 9; // October (0-indexed)
    const birthDay = 14;

    // Calculate current age
    let age = year - 1973;
    if (month < birthMonth || (month === birthMonth && now.getUTCDate() < birthDay)) {
        age--;
    }

    let lastBirthday = new Date(Date.UTC(year, birthMonth, birthDay));
    let nextBirthday = new Date(Date.UTC(year + 1, birthMonth, birthDay));

    if (now < lastBirthday) {
        lastBirthday = new Date(Date.UTC(year - 1, birthMonth, birthDay));
        nextBirthday = new Date(Date.UTC(year, birthMonth, birthDay));
    }

    const ageProgress = (now - lastBirthday) / (nextBirthday - lastBirthday) * 100;
    updateBar('age', ageProgress);
    const ageLabel = document.getElementById('age-label');
    if (ageLabel) ageLabel.textContent = `${age}`;

    // 6. 50s Decade Progress (or whatever decade he is in)
    const currentDecadeStartAge = Math.floor(age / 10) * 10;
    const currentDecadeEndAge = currentDecadeStartAge + 10;

    const decadeStartBirthday = new Date(Date.UTC(1973 + currentDecadeStartAge, birthMonth, birthDay));
    const decadeEndBirthday = new Date(Date.UTC(1973 + currentDecadeEndAge, birthMonth, birthDay));

    const lifeDecadeProgress = (now - decadeStartBirthday) / (decadeEndBirthday - decadeStartBirthday) * 100;
    updateBar('life-decade', lifeDecadeProgress);
    const lifeDecadeLabel = document.getElementById('life-decade-label');
    if (lifeDecadeLabel) lifeDecadeLabel.textContent = `${currentDecadeStartAge}s`;

    // 7. Website Uptime
    const launchDate = createJSTDate(1973, 9, 14);
    const diffTime = Math.abs(now - launchDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const uptimeDays = document.getElementById('uptime-days');
    if (uptimeDays) uptimeDays.textContent = `${diffDays}`;
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
    if (text) text.textContent = `${Math.floor(clampedPercentage)}%`;
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

    // 1. Sakai Tiles
    contentWrapper.appendChild(createTile('age', '--'));
    contentWrapper.appendChild(createTile('life-decade', '--s'));

    // 2. Now Tiles (Reordered: Month -> Century)
    contentWrapper.appendChild(createTile('month', 'Month'));
    contentWrapper.appendChild(createTile('quarter', 'QX'));
    contentWrapper.appendChild(createTile('year', 'YYYY'));
    contentWrapper.appendChild(createTile('decade', 'YYYYs'));
    contentWrapper.appendChild(createTile('century', 'XXthC'));

    // 3. Running Tile
    const runningTile = document.createElement('div');
    runningTile.className = 'progress-tile individual-tile running';
    runningTile.innerHTML = `
        <div class="progress-section">
            <div class="uptime-content">
                <div class="uptime-counter" id="uptime-days">--</div>
                <div class="uptime-label">Days</div>
            </div>
        </div>
    `;
    contentWrapper.appendChild(runningTile);
}
