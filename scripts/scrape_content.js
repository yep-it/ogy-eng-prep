import jsdom from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { JSDOM } = jsdom;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_FILE = './src/data/lessons.json';

// EXACT LIST
const EXERCISE_URLS = [
    "https://www.english-grammar.at/online_exercises/prepositions/prep042-in-at-on.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep041-in-at-on.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep040.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep039.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep038.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep037.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep036.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep035.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep034.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep033.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep032-prepositional-phrases.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep031.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep030-drugs.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep029.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep028.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep027.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep026-my-husband-harry.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep025-in-at-on-to.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep024.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep023-identical-twins.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep022.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep021-prepositional-phrases.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep020.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep019-roald-dahl.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep018-various-prepositions.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep017-in-at-on.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep016.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep015-on-at-in.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prep014.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions013.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions012.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions011.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions010.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions9.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions8.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions7.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/preposiitons6.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions1.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions2.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions3.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/preposiitons4.htm",
    "https://www.english-grammar.at/online_exercises/prepositions/prepositions5.htm"
];

function generateExplanation(preposition, sentence) {
    const p = preposition.toLowerCase().trim();
    const s = sentence.toLowerCase();
    if (p === 'at') {
        if (s.includes('time') || s.includes('night')) return "Use 'at' for specific times.";
        return "Use 'at' for specific points in time or place.";
    }
    if (p === 'on') {
        if (s.includes('day') || s.includes('date')) return "Use 'on' for days and dates.";
        return "Use 'on' for days, dates, or surfaces.";
    }
    if (p === 'in') {
        if (s.match(/\d{4}/)) return "Use 'in' for years.";
        return "Use 'in' for enclosed spaces or longer periods of time.";
    }
    return `The correct preposition here is '${preposition}'.`;
}

function generateOptions(correct) {
    const commonPreps = ['in', 'at', 'on', 'to', 'for', 'of', 'with', 'by', 'about', 'from', 'since'];
    const opts = new Set([correct.toLowerCase()]);
    while (opts.size < 3) {
        opts.add(commonPreps[Math.floor(Math.random() * commonPreps.length)]);
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
}

async function scrapeLesson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const id = url.split('/').pop().replace('.htm', '');
        const title = doc.querySelector('h1')?.textContent.trim() || doc.querySelector('h2')?.textContent.trim() || id;

        // Answers
        const scriptContent = Array.from(doc.querySelectorAll('script'))
            .find(s => s.textContent.includes('I = new Array();'))?.textContent;

        const answersMap = {};
        if (scriptContent) {
            const regex = /I\[(\d+)\]\[1\]\[0\]\[0\]\s*=\s*'([^']+)';/g;
            let match;
            while ((match = regex.exec(scriptContent)) !== null) {
                const idx = parseInt(match[1]);
                try { answersMap[idx] = JSON.parse(`"${match[2]}"`); }
                catch (e) { answersMap[idx] = match[2]; }
            }
        }

        const sentences = [];

        // 1. LIST CHECK (LI)
        const lis = doc.querySelectorAll('li');
        lis.forEach(li => {
            // Check for input OR select
            const inputs = li.querySelectorAll('input, select');
            if (inputs.length === 0) return;

            const input = inputs[0];
            const gapIdMatch = input.id.match(/\d+/);
            if (!gapIdMatch) return;
            const gapId = parseInt(gapIdMatch[0]);

            const correct = answersMap[gapId];
            if (!correct) return;

            // Clone to extract text
            const clone = li.cloneNode(true);
            const cloneInput = clone.querySelector(`#${input.id}`);
            if (cloneInput) {
                const placeholder = doc.createTextNode("____");
                cloneInput.parentNode.replaceChild(placeholder, cloneInput);
            }
            // Remove selects if any remaining
            clone.querySelectorAll('select').forEach(s => s.remove());

            let text = clone.textContent.replace(/\s+/g, ' ').trim();
            text = text.replace(/^(\d+\.)\s*/, '');

            sentences.push({
                id: gapId,
                text: text,
                correct: correct,
                options: generateOptions(correct),
                explanation: generateExplanation(correct, text)
            });
        });

        // 2. FALLBACK (Paragraph / Non-LI / Multiple gaps in text)
        // If LI extraction missed gaps (e.g. prep019 where no LI, or prep038 if structure differs)
        // We check if we have fewer sentences than answers, or just if sentences is empty.
        // Better: Iterate ALL inputs/selects in the container and process them if not already found.

        const knownGapIds = new Set(sentences.map(s => s.id));
        const container = doc.querySelector('.ClozeBody') || doc.forms[0];

        if (container) {
            const clone = container.cloneNode(true);
            const allInputs = clone.querySelectorAll('input, select');

            let hasNewGaps = false;
            allInputs.forEach(inp => {
                const m = inp.id.match(/\d+/);
                if (m) {
                    const gid = parseInt(m[0]);
                    if (!knownGapIds.has(gid) && answersMap[gid]) {
                        hasNewGaps = true;
                        // Tag it
                        const t = doc.createTextNode(`[[GAP_${gid}]]`);
                        inp.parentNode.replaceChild(t, inp);
                    }
                }
            });

            if (hasNewGaps) {
                clone.querySelectorAll('script, style, button').forEach(x => x.remove());
                let rawText = clone.textContent.replace(/\s+/g, ' ').trim();

                // Regex to find sentences containing at least one GAP marker
                // Looks for: (Start of string or punctuation+space) ... content ... [[GAP_d]] ... content ... (punctuation or End)
                // This is tricky. Simplified: Split by punctuation, keep parts, check parts for Gaps.

                const parts = rawText.split(/([.!?]+\s)/);
                // Reassemble chunks until we have a sentence logic (not perfect but good enough)

                let buffer = "";
                parts.forEach(part => {
                    buffer += part;
                    if (part.match(/[.!?]+\s/) || part === parts[parts.length - 1]) {
                        // Buffer is a potential sentence
                        const gaps = Array.from(buffer.matchAll(/\[\[GAP_(\d+)\]\]/g));
                        if (gaps.length > 0) {
                            // This sentence has gaps. Create a question for each.
                            gaps.forEach(g => {
                                const gapId = parseInt(g[1]);
                                const correct = answersMap[gapId];
                                if (correct && !knownGapIds.has(gapId)) {
                                    // Replace THIS gap with ____, others with ... or resolved
                                    let qText = buffer.replace(/\[\[GAP_(\d+)\]\]/g, (m, id) => {
                                        return (parseInt(id) === gapId) ? "____" : " ... ";
                                    });

                                    // Clean up common artifacts
                                    qText = qText.trim();

                                    sentences.push({
                                        id: gapId,
                                        text: qText,
                                        correct: correct,
                                        options: generateOptions(correct),
                                        explanation: generateExplanation(correct, qText)
                                    });
                                    knownGapIds.add(gapId);
                                }
                            });
                        }
                        buffer = "";
                    }
                });
            }
        }

        if (sentences.length === 0) return null;

        // Sort by ID to ensure order
        sentences.sort((a, b) => a.id - b.id);

        return {
            id,
            title,
            sentences
        };
    } catch (e) {
        console.error(`Error ${url}: ${e.message}`);
        return null;
    }
}

async function main() {
    const lessons = [];
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    console.log(`Starting scraper for ${EXERCISE_URLS.length} URLs...`);
    let count = 0;

    for (const url of EXERCISE_URLS) {
        count++;
        process.stdout.write(`[${count}/${EXERCISE_URLS.length}] ${url.split('/').pop()} ... `);
        const l = await scrapeLesson(url);
        if (l) {
            lessons.push(l);
            console.log(`OK (${l.sentences.length})`);
        } else {
            console.log(`FAILED`);
        }
        await new Promise(r => setTimeout(r, 200));
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(lessons, null, 2));
    console.log(`Saved ${lessons.length} lessons.`);
}

main();
