import fs from 'fs';
import path from 'path';

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

const lessons = JSON.parse(fs.readFileSync('./src/data/lessons.json', 'utf-8'));
const savedIds = new Set(lessons.map(l => l.id));

console.log(`Saved: ${savedIds.size}`);
console.log("Missing:");

EXERCISE_URLS.forEach(url => {
    const id = url.split('/').pop().replace('.htm', '');
    if (!savedIds.has(id)) {
        console.log(` - ${id} (${url})`);
    }
});
