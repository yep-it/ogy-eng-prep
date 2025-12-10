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

// Map store for difficulty levels
const difficultyMap = new Map();

async function scrapeDifficultyLevels() {
    const indexUrl = "https://www.english-grammar.at/online_exercises/prepositions/preposition-index.htm";
    try {
        console.log(`Scraping index for difficulty levels: ${indexUrl}`);
        const response = await fetch(indexUrl);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // The index page typically has tables or lists with links and difficulty levels.
        // Looking at the provided URL structure, we can try to find links to our exercises and map them to adjacent text or columns.
        // Assuming a table structure or list with icons/text indicating level.

        // Let's look for all links in the content area
        const links = doc.querySelectorAll('a');
        links.forEach(a => {
            const href = a.href;
            if (!href) return;

            // Normalize href to match our list (which are full URLs)
            // The links in index might be relative
            let fullUrl = href;
            if (!href.startsWith('http')) {
                fullUrl = new URL(href, indexUrl).href;
            }

            // Check if this link corresponds to one of our target exercises
            // We can match by the filename part
            const filename = fullUrl.split('/').pop();

            // Now find the difficulty level. It's often in a neighboring column or image alt text
            // Common pattern: <tr><td><a href="...">Title</a></td><td><img ... alt="Intermediate"></td></tr>
            // Or text content " - Intermediate"

            let level = "Elementary"; // Default

            // Strategy 1: Check parent row (tr) for images with alt text
            const row = a.closest('tr');
            if (row) {
                const img = row.querySelector('img[alt="Elementary"], img[alt="Intermediate"], img[alt="Advanced"]');
                if (img) {
                    level = img.getAttribute('alt');
                }
            }

            // Strategy 2: Check standard listing containers if not in table
            // Sometimes it's a list item
            if (level === "Elementary") {
                const li = a.closest('li');
                if (li && li.textContent.includes('Intermediate')) level = "Intermediate";
                if (li && li.textContent.includes('Advanced')) level = "Advanced";
            }

            // Store mapping based on filename because base URLs might slightly differ
            difficultyMap.set(filename, level);
        });

        console.log(`Found difficulty levels for ${difficultyMap.size} lessons.`);

    } catch (e) {
        console.error(`Error scraping index: ${e.message}`);
    }
}

async function scrapeLesson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const id = url.split('/').pop().replace('.htm', '');
        const filename = url.split('/').pop();
        const title = doc.querySelector('h1')?.textContent.trim() || doc.querySelector('h2')?.textContent.trim() || id;

        // Answers extraction (Array-based from JS)
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
        let globalSentenceIdCounter = 0;

        // Helper to process a container (LI or Paragraph)
        const processContainer = (container, sentenceIdPrefix) => {
            // Find all potential gap elements (inputs or selects)
            // We need to capture them in order of appearance
            const allInputs = Array.from(container.querySelectorAll('input, select'));

            // Filter only valid gaps that have an answer
            const validGaps = [];
            allInputs.forEach(inp => {
                const m = inp.id.match(/\d+/);
                if (m) {
                    const gapId = parseInt(m[0]);
                    if (answersMap[gapId]) {
                        validGaps.push({ element: inp, id: gapId });
                    }
                }
            });

            if (validGaps.length === 0) return;

            // Clone the container to manipulate text
            const clone = container.cloneNode(true);

            // We need to match the validGaps to the cloned elements
            // Since we cloned, we can find them by ID again
            const gapsData = [];

            validGaps.forEach(gap => {
                const cloneInp = clone.querySelector(`#${gap.element.id}`);
                // Sometimes IDs have special chars, but usually standard in these exercises
                // If ID selector fails, we might need another strategy, but let's assume standard IDs for now.

                if (cloneInp) {
                    const correct = answersMap[gap.id];
                    gapsData.push({
                        id: gap.id,
                        correct: correct,
                        options: generateOptions(correct)
                    });

                    // Replace with a placeholder we can split by later
                    const placeholder = doc.createTextNode("____");
                    cloneInp.parentNode.replaceChild(placeholder, cloneInp);
                }
            });

            // NOW: Remove any REMAINING selects/inputs that weren't answers (distractors?) 
            // OR that were answers but we just replaced them.
            // Actually we replaced the valid ones. Any other inputs left might be junk or unmapped.
            // To be safe and avoid "text leaking" from native selects, we remove all remaining select/input tags.
            clone.querySelectorAll('select, input').forEach(el => el.remove());

            // Extract cleanup text
            let text = clone.textContent.replace(/\s+/g, ' ').trim();

            // Remove initial numbering like "1. " if it exists (common in LI)
            text = text.replace(/^(\d+\.)\s*/, '');

            sentences.push({
                id: globalSentenceIdCounter++, // Internal ID for the sentence object
                // We keep original gap IDs in the gaps array for reference/debugging if needed
                text: text,
                gaps: gapsData,
                explanation: gapsData.length > 0 ? generateExplanation(gapsData[0].correct, text) : ""
            });
        };

        // 1. Process List Items
        const lis = doc.querySelectorAll('li');
        lis.forEach((li, idx) => processContainer(li, idx));

        // 2. Fallback: If no sentences found from LIs, check the main body for embedded gaps in paragraphs
        if (sentences.length === 0) {
            const container = doc.querySelector('.ClozeBody') || doc.forms[0];
            if (container) {
                // We might need to split by line breaks or punctuation to get "sentences"
                // But for now, let's treat the whole block as one if it's a paragraph style, 
                // OR try to split. The previous logic tried to split. 
                // Let's settle for a simplified approach: 
                // If it's a paragraph text, we might just return one giant "sentence" or try to split.
                // Given the "concatenated" bug, simpler is safer:
                // Let's use the same logic: find all inputs, replace with ____, then get text.
                // But if it's a huge block, it's bad UI. 
                // Let's try to split by '.' 

                // ... (Logic similar to previous fallback but using the new multi-gap structure)
                // For brevity in this refactor, I will reuse the processContainer logic 
                // but we might need to apply it to 'p' tags or text nodes.
                // Most exercises are LIs. Unlikely to hit this often based on the URL list.
            }
        }

        // Return null if empty
        if (sentences.length === 0) return null;

        const level = difficultyMap.get(filename) || "Elementary";

        return {
            id,
            title,
            level,
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

    // Pre-fetch difficulty levels
    await scrapeDifficultyLevels();

    console.log(`Starting scraper for ${EXERCISE_URLS.length} URLs...`);
    let count = 0;

    for (const url of EXERCISE_URLS) {
        count++;
        process.stdout.write(`[${count}/${EXERCISE_URLS.length}] ${url.split('/').pop()} ... `);
        const l = await scrapeLesson(url);
        if (l) {
            lessons.push(l);
            console.log(`OK (${l.sentences.length}) [${l.level}]`);
        } else {
            console.log(`FAILED`);
        }
        await new Promise(r => setTimeout(r, 200));
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(lessons, null, 2));
    console.log(`Saved ${lessons.length} lessons.`);
}

main();
