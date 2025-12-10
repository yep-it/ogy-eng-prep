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
        stats: {},   // { lessonId: { gapId: { totalWrong: 0, mistakes: { 'wrongOpt': count } } } }
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
            const { answers, results, stats } = JSON.parse(saved);
            this.state.answers = answers || {};
            this.state.results = results || {};
            this.state.stats = stats || {};
        }
    },

    saveProgress() {
        localStorage.setItem('prep_progress', JSON.stringify({
            answers: this.state.answers,
            results: this.state.results,
            stats: this.state.stats
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

        // Check for correctness to update stats
        const lesson = this.getLesson(lessonId);
        if (lesson) {
            let gap = null;
            // Find gap across all sentences
            for (const s of lesson.sentences) {
                if (s.gaps) {
                    gap = s.gaps.find(g => g.id == questionId);
                } else if (s.id == questionId) {
                    gap = { id: s.id, correct: s.correct };
                }
                if (gap) break;
            }

            if (gap) {
                const isCorrect = answer.trim().toLowerCase() === gap.correct.trim().toLowerCase();
                if (!isCorrect) {
                    // Update stats
                    if (!this.state.stats[lessonId]) {
                        this.state.stats[lessonId] = {};
                    }
                    if (!this.state.stats[lessonId][questionId]) {
                        this.state.stats[lessonId][questionId] = { totalWrong: 0, mistakes: {} };
                    }

                    const stat = this.state.stats[lessonId][questionId];
                    stat.totalWrong++;
                    stat.mistakes[answer] = (stat.mistakes[answer] || 0) + 1;
                }
            }
        }

        this.saveProgress();
        this.notify();
    },

    nextQuestion() {
        if (this.state.currentQuestionIndex < this.state.lessons.find(l => l.id === this.state.currentLessonId).sentences.length) {
            this.state.currentQuestionIndex++;
            this.notify();
        }
    },

    prevQuestion() {
        if (this.state.currentQuestionIndex > 0) {
            this.state.currentQuestionIndex--;
            this.notify();
        }
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
