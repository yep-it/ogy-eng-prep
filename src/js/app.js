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

        Object.keys(lessonAnswers).forEach(qId => {
            const userAns = lessonAnswers[qId];
            const q = lesson.sentences.find(s => s.id == qId);
            if (q) {
                if (q.correct === userAns) correct++;
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

// --- Components ---

function renderSidebar() {
    sidebarList.innerHTML = '';
    Store.state.lessons.forEach(lesson => {
        const item = document.createElement('div');
        const isActive = lesson.id === Store.state.currentLessonId;
        item.className = `lesson-item ${isActive ? 'active' : ''}`;

        const answers = Store.state.answers[lesson.id] || {};
        const answeredCount = Object.keys(answers).length;
        const total = lesson.sentences.length;
        const progressPct = Math.round((answeredCount / total) * 100);

        item.innerHTML = `
            <h4>${lesson.title}</h4>
            <div class="lesson-meta">
                <span class="tag">ELEMENTARY</span> 
                <span>${progressPct}% (${answeredCount}/${total})</span>
            </div>
        `;

        item.onclick = () => {
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

    // Update Header
    topBarTitle.innerHTML = `<h2>${lesson.title}</h2>`;

    const index = Store.state.currentQuestionIndex;
    if (index >= lesson.sentences.length) {
        return ResultView(lesson);
    }

    const question = lesson.sentences[index];
    const userAnswer = Store.state.answers[lessonId]?.[question.id];
    const isAnswered = !!userAnswer;
    const isCorrect = userAnswer === question.correct;

    // Split sentence
    const parts = (question.text || "").split('____');
    const prePart = parts[0];
    const postPart = parts[1] || '.';

    const container = document.createElement('div');
    container.className = 'question-container';

    container.innerHTML = `
        <div class="q-info">
            <span>${index + 1} / ${lesson.sentences.length}</span>
            <span class="tag">ELEMENTARY</span>
        </div>

        <div class="q-box">
            <div class="q-instruction">COMPLETE THE SENTENCE:</div>
            <div class="q-text">
                ${prePart} 
                <div class="gap-box ${isAnswered ? '' : 'empty'}">
                    ${isAnswered ? userAnswer : ''}
                </div>
                ${postPart}
            </div>
             <div class="explanation ${isAnswered ? 'visible' : ''}">
                ${isAnswered ? (isCorrect ? "Correct! " : "Incorrect. ") + question.explanation : ''}
            </div>
        </div>

        <div class="options-row" id="options-container">
            <!-- Options injected -->
        </div>

        <div class="action-footer">
            ${isAnswered ? `<button id="next-btn" class="btn-primary">NEXT EXERCISE</button>` : ''}
        </div>
    `;

    const optContainer = container.querySelector('#options-container');
    question.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt;

        if (isAnswered) {
            btn.disabled = true;
            if (opt === question.correct) btn.classList.add('correct');
            if (opt === userAnswer && !isCorrect) btn.classList.add('wrong');
        } else {
            btn.onclick = () => {
                Store.submitAnswer(lessonId, question.id, opt);
            };
        }
        optContainer.appendChild(btn);
    });

    const nextBtn = container.querySelector('#next-btn');
    if (nextBtn) {
        nextBtn.onclick = () => Store.nextQuestion();
    }

    return container;
}

function ResultView(lesson) {
    const total = lesson.sentences.length;
    let correct = 0;
    const answers = Store.state.answers[lesson.id] || {};

    lesson.sentences.forEach(s => {
        if (answers[s.id] === s.correct) correct++;
    });

    const container = document.createElement('div');
    container.className = 'question-container';
    container.style = "text-align: center;";

    container.innerHTML = `
        <div class="q-box">
            <h2>Lesson Completed!</h2>
            <div style="font-size: 3rem; font-weight: 700; color: var(--primary); margin: 1rem 0;">
                ${Math.round((correct / total) * 100)}%
            </div>
            <p>You got ${correct} out of ${total} correct.</p>
        </div>
        <div class="action-footer" style="justify-content: center;">
            <button id="retry-btn" class="btn-secondary">Retry Lesson</button>
            <button id="home-btn" class="btn-primary">Back to Menu</button>
        </div>
    `;

    container.querySelector('#retry-btn').onclick = () => {
        Store.state.answers[lesson.id] = {};
        Store.startLesson(lesson.id);
        Router.navigate(`#/lesson/${lesson.id}`);
    };

    container.querySelector('#home-btn').onclick = () => {
        Store.state.currentLessonId = null;
        Router.navigate('#/');
    };

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
}

async function init() {
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
