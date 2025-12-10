import { Store } from './store.js';
import { Router } from './router.js';

// DOM Elements
const sidebarList = document.getElementById('nav-list');
const contentArea = document.getElementById('content-area');
const topBarTitle = document.getElementById('lesson-header-info');

// Stats Elements
const statCorrect = document.getElementById('stat-correct');
const statMistakes = document.getElementById('stat-mistakes');
const statAccuracy = document.getElementById('stat-accuracy');

function updateGlobalStats() {
    let correct = 0;
    let mistakes = 0;

    Object.keys(Store.state.answers).forEach(lId => {
        const lessonAnswers = Store.state.answers[lId];
        const lesson = Store.getLesson(lId);
        if (!lesson) return;

        // Create a lookup for all gaps in the lesson
        const gapMap = new Map();
        lesson.sentences.forEach(s => {
            if (s.gaps) {
                s.gaps.forEach(g => gapMap.set(g.id, g));
            } else {
                // Fallback for legacy data if any
                gapMap.set(s.id, { id: s.id, correct: s.correct });
            }
        });

        Object.keys(lessonAnswers).forEach(qId => {
            const userAns = lessonAnswers[qId];
            // ID keys in object are strings, convert to int for lookup if needed
            const gap = gapMap.get(parseInt(qId)) || gapMap.get(qId);

            if (gap) {
                if (userAns.trim().toLowerCase() === gap.correct.trim().toLowerCase()) correct++;
                else mistakes++;
            }
        });
    });

    const total = correct + mistakes;
    const acc = total === 0 ? 0 : Math.round((correct / total) * 100);

    statCorrect.textContent = correct;
    statMistakes.textContent = mistakes;
    statAccuracy.textContent = `${acc}%`;
}

function updateGlobalProgress() {
    const progressEl = document.getElementById('mini-progress');
    if (!progressEl) return;

    let totalSentences = 0;
    let completedSentences = 0;

    Store.state.lessons.forEach(lesson => {
        lesson.sentences.forEach(s => {
            totalSentences++;

            // Check if sentence is completed
            const gaps = s.gaps || [{ id: s.id, correct: s.correct }];
            let allCorrect = true;

            gaps.forEach(g => {
                const ans = Store.state.answers[lesson.id]?.[g.id];
                if (!ans || ans.trim().toLowerCase() !== g.correct.trim().toLowerCase()) {
                    allCorrect = false;
                }
            });

            if (allCorrect) {
                completedSentences++;
            }
        });
    });

    const percent = totalSentences === 0 ? 0 : Math.round((completedSentences / totalSentences) * 100);

    progressEl.innerHTML = `
        <div class="global-progress-container">
            <div class="global-progress-bar">
                <div class="global-progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="global-progress-text">
                <strong>${percent}%</strong> <span style="opacity: 0.7">(${completedSentences}/${totalSentences} Finished)</span>
            </div>
        </div>
    `;
}

// --- Components ---

function renderSidebar() {
    sidebarList.innerHTML = '';
    Store.state.lessons.forEach(lesson => {
        const item = document.createElement('div');
        const isActive = lesson.id === Store.state.currentLessonId;
        item.className = `lesson-item ${isActive ? 'active' : ''}`;

        const answers = Store.state.answers[lesson.id] || {};
        const answeredCount = Object.keys(answers).length;

        // Calculate total gaps and extract unique prepositions
        let total = 0;
        const prepositionsSet = new Set();
        lesson.sentences.forEach(s => {
            if (s.gaps) {
                total += s.gaps.length;
                s.gaps.forEach(g => {
                    if (g.correct) {
                        prepositionsSet.add(g.correct.toLowerCase());
                    }
                });
            } else {
                total += 1; // Legacy fallback
                if (s.correct) {
                    prepositionsSet.add(s.correct.toLowerCase());
                }
            }
        });

        // Create display name from unique prepositions
        const prepositionsList = Array.from(prepositionsSet).sort().join(', ').toUpperCase();
        const displayName = prepositionsList || lesson.title;

        const progressPct = total === 0 ? 0 : Math.round((answeredCount / total) * 100);

        item.innerHTML = `
            <div class="lesson-info">
                <h4 title="${lesson.title}">${displayName}</h4>
                <div class="lesson-meta">
                    <span class="tag tag-${(lesson.level || 'elementary').toLowerCase()}">${lesson.level || 'Elementary'}</span> 
                    <span>${progressPct}% (${answeredCount}/${total})</span>
                </div>
            </div>
        `;

        // Click on item to navigate
        item.onclick = (e) => {
            Router.navigate(`#/lesson/${lesson.id}`);
        };
        sidebarList.appendChild(item);
    });
}

function WelcomeView() {
    const container = document.createElement('div');
    container.style = "text-align: center; color: var(--text-muted); margin-top: 100px;";
    container.innerHTML = `
        <h2>Select a lesson from the sidebar to start practicing.</h2>
        <p>Master your prepositions with interactive exercises.</p>
    `;
    return container;
}

function QuestionView(lessonId) {
    const lesson = Store.getLesson(lessonId);
    if (!lesson) return WelcomeView();

    // Force update state if mismatch (important for direct link entry)
    if (Store.state.currentLessonId !== lessonId) {
        Store.startLesson(lessonId);
    }

    // Update Header - extract unique prepositions for display name
    const prepositionsSet = new Set();
    lesson.sentences.forEach(s => {
        const gaps = s.gaps || [{ correct: s.correct }];
        gaps.forEach(g => {
            if (g.correct) {
                prepositionsSet.add(g.correct.toLowerCase());
            }
        });
    });
    const headerDisplayName = Array.from(prepositionsSet).sort().join(', ').toUpperCase() || lesson.title;
    topBarTitle.innerHTML = `<h2 title="${lesson.title}">${headerDisplayName}</h2>`;

    const index = Store.state.currentQuestionIndex;
    if (index >= lesson.sentences.length) {
        return ResultView(lesson);
    }

    const question = lesson.sentences[index];
    // Support new 'gaps' format or legacy single-gap format
    const gaps = question.gaps || [{
        id: question.id,
        correct: question.correct,
        options: question.options
    }];

    // Determine progress within the sentence
    let firstUnansweredIndex = 0;
    while (firstUnansweredIndex < gaps.length) {
        const g = gaps[firstUnansweredIndex];
        const ans = Store.state.answers[lessonId]?.[g.id];
        const isCorrect = ans && (ans.trim().toLowerCase() === g.correct.trim().toLowerCase());

        // Stop if no answer OR if answer is wrong (so user can retry and see explanation)
        if (!ans || !isCorrect) break;

        firstUnansweredIndex++;
    }

    const isSentenceComplete = firstUnansweredIndex >= gaps.length;

    // Active gap is the first unanswered one, unless sentence is done
    const activeGapIndex = isSentenceComplete ? -1 : firstUnansweredIndex;
    const activeGap = activeGapIndex >= 0 ? gaps[activeGapIndex] : null;

    // Check if the ACTIVE gap has been attempted (to separate "fresh" vs "wrong" state)
    const activeGapAns = activeGap ? Store.state.answers[lessonId]?.[activeGap.id] : null;
    const isErrorState = !!activeGapAns; // It's active but has an answer, so must be wrong

    const container = document.createElement('div');
    container.className = 'question-container';

    // Construct the sentence HTML with interspersed gaps
    const parts = (question.text || "").split('____');
    let sentenceHtml = '';

    parts.forEach((part, i) => {
        sentenceHtml += `<span>${part}</span>`;
        if (i < gaps.length) {
            const gap = gaps[i];
            const ans = Store.state.answers[lessonId]?.[gap.id];
            const filled = !!ans;
            const isCorrect = filled && (ans.trim().toLowerCase() === gap.correct.trim().toLowerCase());
            const isActive = (i === activeGapIndex);

            let classes = 'gap-box';
            if (!filled) classes += ' empty';
            if (isActive) classes += ' active-gap';
            if (filled) classes += isCorrect ? ' correct' : ' wrong';

            sentenceHtml += `<div class="${classes}" data-index="${i}">
                ${filled ? ans : (isActive ? '?' : '')}
            </div>`;
        }
    });

    // Explanation should be visible if:
    // 1. Sentence is fully complete (summary/review)
    // 2. OR The active gap has been attempted (isErrorState) -> Show explanation for correction
    const showExplanation = isSentenceComplete || (activeGap && isErrorState);
    const explanationText = isSentenceComplete
        ? (question.explanation || (gaps[0]?.explanation) || '')
        : (activeGap?.explanation || '');

    container.innerHTML = `
        <div class="q-info">
            <span class="tag tag-${(lesson.level || 'elementary').toLowerCase()}">${lesson.level || 'Elementary'}</span>
            <span>${index + 1} / ${lesson.sentences.length}</span>
        </div>

        <!-- Navigation Arrows -->
        <div class="nav-arrow left ${index === 0 ? 'disabled' : ''}" id="prev-btn" title="Previous (Left Arrow)">
            &#8592;
        </div>
        <div class="nav-arrow right" id="next-nav-btn" title="Next (Right Arrow)">
            &#8594;
        </div>

        <div class="q-box">
            <div class="q-instruction">COMPLETE THE SENTENCE:</div>
            <div class="q-text">
                ${sentenceHtml}
            </div>
             <div class="explanation ${showExplanation ? 'visible' : ''}">
                ${explanationText}
            </div>
        </div>

        <div class="options-row" id="options-container">
            <!-- Options injected -->
        </div>

        <div class="action-footer">
            ${isSentenceComplete ? `<button id="next-btn" class="btn-primary">NEXT EXERCISE</button>` : ''}
        </div>
    `;

    // Render Options for the ACTIVE gap
    const optContainer = container.querySelector('#options-container');
    if (activeGap) {
        activeGap.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerHTML = `${opt} <span class="key-hint">(${i + 1})</span>`;
            btn.dataset.key = i + 1; // Mark for keyboard selection

            // Should we show incorrect state immediately if they pick wrong?
            // Yes, standard behavior.

            btn.onclick = () => {
                Store.submitAnswer(lessonId, activeGap.id, opt);
            };
            optContainer.appendChild(btn);
        });
    }

    const nextBtn = container.querySelector('#next-btn');
    if (nextBtn) {
        nextBtn.onclick = () => Store.nextQuestion();
    }

    // Navigation Arrow Handlers
    const prevBtn = container.querySelector('#prev-btn');
    if (prevBtn) prevBtn.onclick = () => Store.prevQuestion();

    const nextNavBtn = container.querySelector('#next-nav-btn');
    if (nextNavBtn) nextNavBtn.onclick = () => Store.nextQuestion();

    return container;
}

function ResultView(lesson) {
    let totalGaps = 0;
    let correctGaps = 0;
    const answers = Store.state.answers[lesson.id] || {};

    let firstUnfinishedIndex = -1;

    lesson.sentences.forEach((s, sIndex) => {
        const gaps = s.gaps || [{ id: s.id, correct: s.correct }];
        let sentenceComplete = true;

        gaps.forEach(g => {
            totalGaps++;
            const userAns = answers[g.id];
            if (userAns && userAns.trim().toLowerCase() === g.correct.trim().toLowerCase()) {
                correctGaps++;
            } else {
                sentenceComplete = false;
            }
        });

        if (!sentenceComplete && firstUnfinishedIndex === -1) {
            firstUnfinishedIndex = sIndex;
        }
    });

    // If completely correct, totalGaps match correctGaps
    // (Wait, if totalGaps is 0, handle that edge case, though lessons usually have content)
    const isComplete = totalGaps > 0 && totalGaps === correctGaps;
    const progressPct = totalGaps === 0 ? 0 : Math.round((correctGaps / totalGaps) * 100);

    const container = document.createElement('div');
    container.className = 'question-container';
    container.style = "text-align: center;";

    container.innerHTML = `
        <div class="q-box">
            <h2>${isComplete ? 'Lesson Completed!' : 'Lesson Paused'}</h2>
            <div style="font-size: 3rem; font-weight: 700; color: var(--primary); margin: 1rem 0;">
                ${progressPct}%
            </div>
            <p>You got ${correctGaps} out of ${totalGaps} correct.</p>
        </div>

        <div class="action-footer" style="justify-content: center;">
            <button id="retry-btn" class="btn-secondary">Retry Lesson</button>
            ${!isComplete ? `<button id="continue-btn" class="btn-primary">Continue</button>` : ''}
            ${isComplete ? `<button id="next-btn" class="btn-primary">Next Lesson</button>` : ''}
        </div>
        
        <div id="stats-container" style="text-align: left; margin: 2rem 0; width: 100%;">
            <!-- Stats injected here -->
        </div>
    `;

    // Render Detailed Stats
    const statsContainer = container.querySelector('#stats-container');
    const lessonStats = Store.state.stats[lesson.id] || {};
    let hasMistakesOfType = false;

    // Check if we have any relevant stats to show
    // We want to show stats for all gaps that have > 0 mistakes in history
    let statsHtml = '';

    lesson.sentences.forEach((s, sIndex) => {
        const gaps = s.gaps || [{ id: s.id, correct: s.correct }];
        let sentenceHasMistakes = false;
        let gapDetails = [];

        gaps.forEach((g, gIndex) => {
            const stat = lessonStats[g.id];
            if (stat && stat.totalWrong > 0) {
                sentenceHasMistakes = true;
                hasMistakesOfType = true; // global flag

                // Format mistakes list: "on (2), at (1)"
                const mistakesList = Object.entries(stat.mistakes)
                    .map(([opt, count]) => `<span class="mistake-tag">${opt} <small>x${count}</small></span>`)
                    .join(', ');

                gapDetails.push(`
                    <div class="stat-gap-row">
                        <span class="badg-gap-idx">Gap ${gIndex + 1}</span>
                        <span class="stat-correct">Correct: <strong>${g.correct}</strong></span>
                        <div class="stat-wrong-list">
                            Mistakes: ${mistakesList}
                        </div>
                    </div>
                `);
            }
        });

        if (sentenceHasMistakes) {
            statsHtml += `
                <div class="stat-item">
                    <div class="stat-sentence">${s.text}</div>
                    ${gapDetails.join('')}
                </div>
            `;
        }
    });

    if (hasMistakesOfType) {
        statsContainer.innerHTML = `
            <h3>Your Struggle History</h3>
            <p class="text-muted small">Cumulative mistakes for this lesson</p>
            <div class="stats-list">
                ${statsHtml}
            </div>
        `;
    } else {
        statsContainer.innerHTML = `<p class="text-muted text-center">Perfect history for this lesson! No cached mistakes.</p>`;
    }

    container.querySelector('#retry-btn').onclick = () => {
        // Clear answers for this lesson
        Store.state.answers[lesson.id] = {};
        Store.saveProgress(); // Ensure cleared state is saved
        Store.startLesson(lesson.id);
        // Explicitly navigate to ensure reset (though startLesson sets index 0)
        // If we are already at #/lesson/id, Router might not re-render if hash doesn't change
        // But Store.notify() should trigger render.
        // To be safe, we just let the Store state change trigger the render
    };

    const continueBtn = container.querySelector('#continue-btn');
    if (continueBtn) {
        continueBtn.onclick = () => {
            // Jump to firstUnfinishedIndex
            if (firstUnfinishedIndex !== -1) {
                Store.state.currentQuestionIndex = firstUnfinishedIndex;
                Store.notify();
            } else {
                // Fallback if somehow calculated wrong, goes to start
                Store.state.currentQuestionIndex = 0;
                Store.notify();
            }
        };
    }

    const nextBtn = container.querySelector('#next-btn');
    if (nextBtn) {
        nextBtn.onclick = () => {
            // Find current index
            const allLessons = Store.state.lessons;
            const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
            if (currentIndex !== -1) {
                // Wrap around
                const nextIndex = (currentIndex + 1) % allLessons.length;
                const nextLesson = allLessons[nextIndex];
                Router.navigate(`#/lesson/${nextLesson.id}`);
            }
        };
    }

    return container;
}

// --- App Initialization ---

function render() {
    const hash = window.location.hash;
    let view = WelcomeView();

    // Check for route match
    if (hash.startsWith('#/lesson/')) {
        try {
            const rawId = hash.split('/')[2];
            const id = decodeURIComponent(rawId);
            if (id) {
                view = QuestionView(id);
            }
        } catch (e) {
            console.error("Render error:", e);
        }
    }

    contentArea.innerHTML = '';
    contentArea.appendChild(view);

    renderSidebar();
    updateGlobalStats();
    updateGlobalProgress();
}

async function init() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only valid if in lesson view
        if (!window.location.hash.startsWith('#/lesson/')) return;

        // 1, 2, 3 for variants selection
        if (['1', '2', '3'].includes(e.key)) {
            const btns = document.querySelectorAll('.opt-btn');
            const target = Array.from(btns).find(b => b.dataset.key === e.key);
            if (target) {
                target.click();
                // Add a small visual feedback or just trust the click handler
            }
        }

        // Enter for "Next" or "Continue"
        if (e.key === 'Enter') {
            const nextBtn = document.getElementById('next-btn'); // Next Exercise
            const continueBtn = document.getElementById('continue-btn'); // Continue from Result

            // Note: In ResultView, next lesson btn id is 'next-btn', in QuestionView next exercise is 'next-btn'.
            // Priority: visible button.
            if (nextBtn && nextBtn.offsetParent !== null) nextBtn.click();
            else if (continueBtn && continueBtn.offsetParent !== null) continueBtn.click();
        }

        // Arrows for navigation
        if (e.key === 'ArrowLeft') {
            Store.prevQuestion();
        }
        if (e.key === 'ArrowRight') {
            const nextBtn = document.getElementById('next-btn');
            // If the "Next Exercise" button is visible (meaning question completed), Enter is preferred for that flow.
            // But ArrowRight should also just move generally if desired. 
            // The user wanted "move back and force... using right and left".
            // So we just call Store.nextQuestion();
            Store.nextQuestion();
        }
    });

    await Store.init();

    Store.subscribe(() => {
        render();
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash.startsWith('#/lesson/')) {
            try {
                const id = decodeURIComponent(hash.split('/')[2]);
                if (Store.state.currentLessonId !== id) {
                    Store.startLesson(id);
                }
            } catch (e) { console.error(e); }
        } else {
            if (Store.state.currentLessonId) {
                Store.state.currentLessonId = null;
                Store.notify();
            }
        }
        render();
    });

    const hash = window.location.hash;
    if (hash.startsWith('#/lesson/')) {
        try {
            // Handle initial load with encoded IDs
            const id = decodeURIComponent(hash.split('/')[2]);
            Store.startLesson(id);
        } catch (e) { }
    }

    render();
}

init();
