document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const searchBar = document.getElementById('search-bar');
    let schedule = [];

    fetch('/api/talks')
        .then(response => response.json())
        .then(talks => {
            buildSchedule(talks);
            renderSchedule(schedule);
        });

    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length > 0) {
            const filteredSchedule = schedule.filter(item => {
                if (item.type === 'talk') {
                    return item.category.some(cat => cat.toLowerCase().includes(searchTerm));
                }
                return true; // Always show breaks
            });
            renderSchedule(filteredSchedule);
        } else {
            renderSchedule(schedule);
        }
    });

    function buildSchedule(talks) {
        let currentTime = new Date();
        currentTime.setHours(10, 0, 0, 0); // Event starts at 10:00 AM

        talks.forEach((talk, index) => {
            if (index === 3) {
                // Add lunch break
                const breakStartTime = new Date(currentTime);
                currentTime.setHours(currentTime.getHours() + 1);
                const breakEndTime = new Date(currentTime);
                schedule.push({
                    type: 'break',
                    title: 'Lunch Break',
                    startTime: breakStartTime,
                    endTime: breakEndTime
                });
            }

            const talkStartTime = new Date(currentTime);
            currentTime.setHours(currentTime.getHours() + 1);
            const talkEndTime = new Date(currentTime);
            schedule.push({ ...talk, type: 'talk', startTime: talkStartTime, endTime: talkEndTime });

            // Add transition time, but not after the last talk
            if (index < talks.length - 1 && index !== 2) { // also not before lunch
                 currentTime.setMinutes(currentTime.getMinutes() + 10);
            }
        });
    }

    function renderSchedule(scheduleToRender) {
        scheduleContainer.innerHTML = '';
        const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        scheduleToRender.forEach(item => {
            const itemElement = document.createElement('div');
            if (item.type === 'talk') {
                itemElement.className = 'schedule-item';
                itemElement.innerHTML = `
                    <div class="time-slot">${formatTime(item.startTime)} - ${formatTime(item.endTime)}</div>
                    <h2 class="talk-title">${item.title}</h2>
                    <div class="speakers">By: ${item.speakers.join(', ')}</div>
                    <p>${item.description}</p>
                    <div class="categories">
                        ${item.category.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                    </div>
                `;
            } else if (item.type === 'break') {
                itemElement.className = 'schedule-item break';
                itemElement.innerHTML = `
                    <div class="time-slot">${formatTime(item.startTime)} - ${formatTime(item.endTime)}</div>
                    <h2 class="talk-title">${item.title}</h2>
                `;
            }
            scheduleContainer.appendChild(itemElement);
        });
    }
});