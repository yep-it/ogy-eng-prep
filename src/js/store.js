import lessonsData from '../data/lessons.json';

/**
 * Simple State Management Store
 */
export const Store = {
    state: {
        lessons: lessonsData,
        currentLessonId: null,
        currentQuestionIndex: 0,
        answers: {}, // { lessonId: { questionId: 'userAnswer' } }
        results: {}, // { lessonId: { score: 0, completed: false } }
        darkMode: localStorage.getItem('theme') === 'dark'
    },

    listeners: [],

    async init() {
        try {
            // Already loaded via import
            this.loadProgress();
            this.notify();
        } catch (e) {
            console.error("Failed to load lessons", e);
        }
    },

    loadProgress() {
        const saved = localStorage.getItem('prep_progress');
        if (saved) {
            const { answers, results } = JSON.parse(saved);
            this.state.answers = answers || {};
            this.state.results = results || {};
        }
    },

    saveProgress() {
        localStorage.setItem('prep_progress', JSON.stringify({
            answers: this.state.answers,
            results: this.state.results
        }));
    },

    getLesson(id) {
        if (!id) return null;
        // Normalize IDs to match leniently (spaces vs dashes, case)
        // e.g. "prep042-in-at-on" matches "prep042 in at on" matches "PREP042"
        // Also handle if ID is just prep042

        const normalize = (str) => {
            if (!str) return '';
            return str.toString().replace(/[\s-]/g, '').toLowerCase();
        };

        const target = normalize(id);

        // Exact match first (normalized)
        const match = this.state.lessons.find(l => normalize(l.id) === target);
        if (match) return match;

        // Fallback: Partial match if target is short? (e.g. legacy id)
        // Safer to just stick to normalized match.
        return null;
    },

    startLesson(id) {
        this.state.currentLessonId = id;
        // Check if we have progress
        const answers = this.state.answers[id] || {};
        const hasProgress = Object.keys(answers).length > 0;

        if (hasProgress) {
            // Jump to end to show ResultView (which will handle Continue/Retry logic)
            const lesson = this.getLesson(id);
            if (lesson) {
                this.state.currentQuestionIndex = lesson.sentences.length;
            } else {
                this.state.currentQuestionIndex = 0;
            }
        } else {
            this.state.currentQuestionIndex = 0;
        }

        this.notify();
    },

    submitAnswer(lessonId, questionId, answer) {
        if (!this.state.answers[lessonId]) {
            this.state.answers[lessonId] = {};
        }
        this.state.answers[lessonId][questionId] = answer;
        this.saveProgress();
        this.notify();
    },

    nextQuestion() {
        this.state.currentQuestionIndex++;
        this.notify();
    },

    completeLesson(lessonId, score) {
        if (!this.state.results[lessonId]) {
            this.state.results[lessonId] = {};
        }
        this.state.results[lessonId] = {
            score,
            completed: true,
            timestamp: Date.now()
        };
        this.saveProgress();
        this.notify();
    },

    toggleTheme() {
        this.state.darkMode = !this.state.darkMode;
        localStorage.setItem('theme', this.state.darkMode ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', this.state.darkMode ? 'dark' : 'light');
        this.notify();
    },

    subscribe(listener) {
        this.listeners.push(listener);
    },

    notify() {
        this.listeners.forEach(l => l(this.state));
    }
};
