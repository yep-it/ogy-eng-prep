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

// Common idioms/phrases database with their explanations
const IDIOM_PATTERNS = [
    // BY idioms
    { pattern: /\bby\s+chance\b/i, prep: 'by', explanation: "'By chance' is an idiom meaning 'accidentally' or 'unexpectedly'." },
    { pattern: /\bby\s+heart\b/i, prep: 'by', explanation: "'By heart' means 'from memory' or 'memorized completely'." },
    { pattern: /\bby\s+mistake\b/i, prep: 'by', explanation: "'By mistake' means 'accidentally' or 'in error'." },
    { pattern: /\bby\s+hand\b/i, prep: 'by', explanation: "'By hand' means 'manually' or 'without machines'." },
    { pattern: /\bby\s+accident\b/i, prep: 'by', explanation: "'By accident' means 'unintentionally' or 'without planning'." },
    { pattern: /\bby\s+far\b/i, prep: 'by', explanation: "'By far' means 'by a great amount' or 'definitely'." },
    { pattern: /\bby\s+all\s+means\b/i, prep: 'by', explanation: "'By all means' means 'certainly' or 'of course'." },
    { pattern: /\bby\s+no\s+means\b/i, prep: 'by', explanation: "'By no means' means 'definitely not' or 'not at all'." },

    // OUT idioms
    { pattern: /\bout\s+of\s+(the\s+)?question\b/i, prep: 'out', explanation: "'Out of the question' means 'impossible' or 'not allowed'." },
    { pattern: /\bout\s+of\s+order\b/i, prep: 'out', explanation: "'Out of order' means 'not working' or 'broken'." },
    { pattern: /\bout\s+of\s+date\b/i, prep: 'out', explanation: "'Out of date' means 'no longer valid' or 'obsolete'." },
    { pattern: /\bout\s+of\s+work\b/i, prep: 'out', explanation: "'Out of work' means 'unemployed'." },
    { pattern: /\bout\s+of\s+breath\b/i, prep: 'out', explanation: "'Out of breath' means 'breathing heavily after exertion'." },
    { pattern: /\bout\s+of\s+touch\b/i, prep: 'out', explanation: "'Out of touch' means 'not informed' or 'not in contact'." },
    { pattern: /\bout\s+of\s+reach\b/i, prep: 'out', explanation: "'Out of reach' means 'too far away to touch or obtain'." },

    // IN idioms
    { pattern: /\bin\s+time\b/i, prep: 'in', explanation: "'In time' means 'early enough' or 'before it's too late'." },
    { pattern: /\bin\s+advance\b/i, prep: 'in', explanation: "'In advance' means 'beforehand' or 'ahead of time'." },
    { pattern: /\bin\s+common\b/i, prep: 'in', explanation: "'In common' means 'shared' or 'having the same features'." },
    { pattern: /\bin\s+charge\b/i, prep: 'in', explanation: "'In charge' means 'responsible for' or 'in control of'." },
    { pattern: /\bin\s+danger\b/i, prep: 'in', explanation: "'In danger' means 'at risk' or 'threatened'." },
    { pattern: /\bin\s+trouble\b/i, prep: 'in', explanation: "'In trouble' means 'having problems' or 'in difficulty'." },
    { pattern: /\bin\s+love\b/i, prep: 'in', explanation: "'In love' means 'feeling romantic love for someone'." },
    { pattern: /\bin\s+fact\b/i, prep: 'in', explanation: "'In fact' means 'actually' or 'in reality'." },
    { pattern: /\bin\s+general\b/i, prep: 'in', explanation: "'In general' means 'usually' or 'as a whole'." },
    { pattern: /\bin\s+particular\b/i, prep: 'in', explanation: "'In particular' means 'especially' or 'specifically'." },

    // ON idioms
    { pattern: /\bon\s+time\b/i, prep: 'on', explanation: "'On time' means 'punctually' or 'at the scheduled time'." },
    { pattern: /\bon\s+purpose\b/i, prep: 'on', explanation: "'On purpose' means 'intentionally' or 'deliberately'." },
    { pattern: /\bon\s+fire\b/i, prep: 'on', explanation: "'On fire' means 'burning' or figuratively 'doing very well'." },
    { pattern: /\bon\s+sale\b/i, prep: 'on', explanation: "'On sale' means 'available for purchase' or 'at a reduced price'." },
    { pattern: /\bon\s+holiday\b/i, prep: 'on', explanation: "'On holiday' means 'taking time off' or 'vacationing'." },
    { pattern: /\bon\s+business\b/i, prep: 'on', explanation: "'On business' means 'for work purposes' or 'professionally'." },
    { pattern: /\bon\s+average\b/i, prep: 'on', explanation: "'On average' means 'typically' or 'as a mean value'." },
    { pattern: /\bon\s+behalf\b/i, prep: 'on', explanation: "'On behalf of' means 'representing' or 'in place of'." },

    // AT idioms
    { pattern: /\bat\s+once\b/i, prep: 'at', explanation: "'At once' means 'immediately' or 'simultaneously'." },
    { pattern: /\bat\s+last\b/i, prep: 'at', explanation: "'At last' means 'finally' or 'after a long time'." },
    { pattern: /\bat\s+least\b/i, prep: 'at', explanation: "'At least' means 'at minimum' or 'no less than'." },
    { pattern: /\bat\s+first\b/i, prep: 'at', explanation: "'At first' means 'in the beginning' or 'initially'." },
    { pattern: /\bat\s+risk\b/i, prep: 'at', explanation: "'At risk' means 'in danger' or 'vulnerable to harm'." },
    { pattern: /\bat\s+ease\b/i, prep: 'at', explanation: "'At ease' means 'relaxed' or 'comfortable'." },

    // FOR idioms
    { pattern: /\bfor\s+good\b/i, prep: 'for', explanation: "'For good' means 'permanently' or 'forever'." },
    { pattern: /\bfor\s+instance\b/i, prep: 'for', explanation: "'For instance' means 'for example' or 'as an illustration'." },
    { pattern: /\bfor\s+granted\b/i, prep: 'for', explanation: "'Take for granted' means 'assume without question' or 'undervalue'." },
    { pattern: /\bfor\s+sale\b/i, prep: 'for', explanation: "'For sale' means 'available to be purchased'." },

    // UNDER idioms
    { pattern: /\bunder\s+control\b/i, prep: 'under', explanation: "'Under control' means 'being managed' or 'not causing problems'." },
    { pattern: /\bunder\s+pressure\b/i, prep: 'under', explanation: "'Under pressure' means 'experiencing stress' or 'being pushed to act'." },
    { pattern: /\bunder\s+construction\b/i, prep: 'under', explanation: "'Under construction' means 'being built' or 'not finished yet'." },

    // BEYOND idioms
    { pattern: /\bbeyond\s+belief\b/i, prep: 'beyond', explanation: "'Beyond belief' means 'unbelievable' or 'incredible'." },
    { pattern: /\bbeyond\s+doubt\b/i, prep: 'beyond', explanation: "'Beyond doubt' means 'certainly' or 'unquestionably'." },

    // WITH idioms
    { pattern: /\bwith\s+regard\s+to\b/i, prep: 'with', explanation: "'With regard to' means 'concerning' or 'about'." },
    { pattern: /\bwith\s+respect\s+to\b/i, prep: 'with', explanation: "'With respect to' means 'concerning' or 'in relation to'." },

    // WITHOUT idioms
    { pattern: /\bwithout\s+doubt\b/i, prep: 'without', explanation: "'Without doubt' means 'certainly' or 'definitely'." },
    { pattern: /\bwithout\s+fail\b/i, prep: 'without', explanation: "'Without fail' means 'definitely' or 'always'." },
];

function generateExplanation(preposition, sentence) {
    const p = preposition.toLowerCase().trim();
    const s = sentence.toLowerCase();
    const fullSentence = sentence; // Keep original for idiom matching with ____

    // First, check for idioms - reconstruct the sentence with the preposition filled in
    const sentenceWithPrep = fullSentence.replace(/____/, preposition.toLowerCase());

    for (const idiom of IDIOM_PATTERNS) {
        if (idiom.prep === p && idiom.pattern.test(sentenceWithPrep)) {
            return idiom.explanation;
        }
    }

    // AT - context-specific
    if (p === 'at') {
        if (s.match(/\bage\b/)) return `Here, 'at' is used with age to indicate a specific point in someone's life.`;
        if (s.match(/\b(midnight|noon|dawn|dusk|sunset|sunrise)\b/)) return `'At' is used for specific times of day like midnight, noon, etc.`;
        if (s.match(/\b(moment|present)\b/)) return `'At the moment/present' means 'right now' or 'currently'.`;
        if (s.match(/\b(night)\b/)) return `'At night' is a fixed expression for nighttime.`;
        if (s.match(/\b(weekend|christmas|easter)\b/)) return `'At' is used with certain holidays and weekend (in British English).`;
        if (s.match(/\b(home|school|work|university|college)\b/)) return `'At' indicates being present at a location for its purpose (at school = studying, at work = working).`;
        if (s.match(/\b(station|airport|party|concert)\b/)) return `'At' is used for events and specific locations where activities happen.`;
        if (s.match(/\b(door|desk|table)\b/)) return `'At' indicates position next to or near something.`;
        if (s.match(/\b(bottom|top|end|beginning)\b/)) return `'At' is used for positions at extremities or limits.`;
        if (s.match(/\b(corner)\b/)) return `'At the corner' means the exact point where two streets meet.`;
        if (s.match(/\b(lunch|dinner|breakfast)\b/)) return `'At' is used with meals to mean 'at the time of' or 'during'.`;
        if (s.match(/\b(\d+)\b/)) return `'At' is used with specific clock times.`;
        return `'At' indicates a specific point in time or place in this context.`;
    }

    // ON - context-specific  
    if (p === 'on') {
        if (s.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)) return `'On' is used with days of the week.`;
        if (s.match(/\bday\b/) && !s.match(/\beveryday\b/)) return `'On' is used with specific days, like 'on sunny days' or 'on Christmas Day'.`;
        if (s.match(/\b(birthday|anniversary)\b/)) return `'On' is used with specific dates and anniversaries.`;
        if (s.match(/\b(floor|shelf|wall|ceiling)\b/)) return `'On' indicates position on a surface.`;
        if (s.match(/\b(left|right)\b/)) return `'On the left/right' indicates relative position or direction.`;
        if (s.match(/\b(bus|train|plane|ship|boat)\b/)) return `'On' is used with larger public transport vehicles.`;
        if (s.match(/\b(bike|motorcycle|horse)\b/)) return `'On' is used with vehicles you sit on top of.`;
        if (s.match(/\b(tv|television|radio|phone)\b/)) return `'On' is used with communication devices (on TV, on the phone).`;
        if (s.match(/\b(weekdays?|weekends?)\b/)) return `'On' is used with weekdays/weekends (more common in American English).`;
        if (s.match(/\b(page|screen|menu|list|map)\b/)) return `'On' is used for things displayed or written on a surface.`;
        if (s.match(/\b\d{1,2}(st|nd|rd|th)?\b/) || s.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d/i)) return `'On' is used with specific dates.`;
        return `'On' indicates a surface, specific day, or date in this context.`;
    }

    // IN - context-specific
    if (p === 'in') {
        if (s.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i)) return `'In' is used with months of the year.`;
        if (s.match(/\b(morning|afternoon|evening)\b/)) return `'In' is used with parts of the day (except 'at night').`;
        if (s.match(/\b(spring|summer|autumn|fall|winter)\b/)) return `'In' is used with seasons.`;
        if (s.match(/\b\d{4}\b/)) return `'In' is used with years.`;
        if (s.match(/\b(century|decade)\b/)) return `'In' is used with centuries and decades.`;
        if (s.match(/\b(an?\s+hour|minutes?|weeks?|months?|years?)\b/)) return `'In' + time period means 'after that amount of time from now'.`;
        if (s.match(/\b(car|taxi)\b/)) return `'In' is used with smaller vehicles like cars and taxis.`;
        if (s.match(/\b(room|office|house|building|garden|park|forest)\b/)) return `'In' indicates being inside or within an enclosed or defined space.`;
        if (s.match(/\b(water|sea|river|ocean|pool)\b/)) return `'In' is used when surrounded by water.`;
        if (s.match(/\b(city|town|village|country|world)\b/)) return `'In' is used with cities, towns, countries, and regions.`;
        if (s.match(/\b(newspaper|book|magazine|article)\b/)) return `'In' is used for content appearing within publications.`;
        if (s.match(/\binterested\b/)) return `'Interested in' is a fixed combination meaning 'having interest about'.`;
        return `'In' indicates being inside, within a period, or enclosed in this context.`;
    }

    // TO - context-specific
    if (p === 'to') {
        if (s.match(/\b(go|went|going|gone)\b/)) return `'To' indicates the destination of movement with 'go'.`;
        if (s.match(/\b(walk|drive|fly|travel|move)\b/)) return `'To' indicates the direction or destination of travel.`;
        if (s.match(/\b(listen)\b/)) return `'Listen to' is a fixed combination - we always listen TO something.`;
        if (s.match(/\b(speak|talk)\b/)) return `'Speak/talk to' indicates the person being addressed.`;
        return `'To' indicates direction, movement toward, or the recipient of an action.`;
    }

    // FOR - context-specific
    if (p === 'for') {
        if (s.match(/\b(hours?|days?|weeks?|months?|years?|minutes?|seconds?|ages)\b/)) return `'For' indicates the duration of time something lasts.`;
        if (s.match(/\b(waiting|waited|wait)\b/)) return `'Wait for' indicates the duration of waiting.`;
        if (s.match(/\b(reason)\b/)) return `'For' introduces the purpose or reason for something.`;
        return `'For' indicates duration, purpose, or benefit in this context.`;
    }

    // SINCE - context-specific
    if (p === 'since') {
        if (s.match(/\b\d{4}\b/)) return `'Since' + year indicates the starting point of an ongoing action.`;
        if (s.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)) return `'Since' + day indicates from that day until now.`;
        if (s.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i)) return `'Since' + month indicates from that month until now.`;
        return `'Since' indicates the starting point in time of something that continues to now.`;
    }

    // BY - context-specific  
    if (p === 'by') {
        if (s.match(/\b(car|taxi|bus|train|plane|boat)\b/)) return `'By' + transport (without 'the') indicates the method of travel.`;
        if (s.match(/\b(tomorrow|next|end|time)\b/)) return `'By' + time means 'not later than' or 'before that deadline'.`;
        return `'By' indicates method, agent, or a deadline in this context.`;
    }

    // ABOUT - context-specific
    if (p === 'about') {
        if (s.match(/\b(think|thinking|thought)\b/)) return `'Think about' means to consider or reflect on something.`;
        if (s.match(/\b(talk|talking|talked|speak|speaking|spoke)\b/)) return `'Talk/speak about' means to discuss a topic.`;
        if (s.match(/\b(worry|worried|worrying)\b/)) return `'Worry about' means to feel anxious concerning something.`;
        return `'About' means 'concerning' or 'regarding' in this context.`;
    }

    // DURING - context-specific
    if (p === 'during') {
        return `'During' indicates something happening within a period or event (e.g., during lunch, during the movie).`;
    }

    // WHILE - context-specific
    if (p === 'while') {
        return `'While' + clause indicates two actions happening at the same time.`;
    }

    // OUT - context-specific
    if (p === 'out') {
        if (s.match(/\b(look|looked|looking)\b/)) return `'Look out of' means to look through a window or opening to see outside.`;
        if (s.match(/\b(run|ran|running)\b/)) return `'Run out of' means to have no more of something left.`;
        if (s.match(/\b(get|got|getting)\b/)) return `'Get out of' means to exit or leave something.`;
        if (s.match(/\b(work|job)\b/)) return `'Out of work' means unemployed or without a job.`;
        return `'Out' indicates movement away from inside, or exhaustion/depletion.`;
    }

    // WITH - context-specific
    if (p === 'with') {
        if (s.match(/\b(covered|cover|covering)\b/)) return `'Covered with' describes what is on top of or surrounding something.`;
        if (s.match(/\b(filled|fill|filling)\b/)) return `'Filled with' describes what something contains or is full of.`;
        if (s.match(/\b(agree|agreed|agreeing)\b/)) return `'Agree with' means to share the same opinion as someone.`;
        if (s.match(/\b(angry|annoyed|frustrated|pleased|happy|satisfied)\b/)) return `'With' after emotion adjectives indicates the cause or target of the emotion.`;
        if (s.match(/\b(deal|dealing|dealt)\b/)) return `'Deal with' means to handle or manage something.`;
        if (s.match(/\b(help|helps|helped)\b/)) return `'Help with' means to assist in doing something.`;
        return `'With' indicates accompaniment, means, or manner in this context.`;
    }

    // OF - context-specific
    if (p === 'of') {
        if (s.match(/\b(afraid|scared|frightened)\b/)) return `'Afraid/scared of' indicates what causes fear.`;
        if (s.match(/\b(tired)\b/)) return `'Tired of' means to be bored or frustrated with something.`;
        if (s.match(/\b(proud)\b/)) return `'Proud of' indicates the source of pride.`;
        if (s.match(/\b(kind|sort|type)\b/)) return `'Kind/sort/type of' shows classification or category.`;
        return `'Of' indicates belonging, origin, or relationship.`;
    }

    // Default fallback with context hint
    return `'${preposition.charAt(0).toUpperCase() + preposition.slice(1).toLowerCase()}' is the correct preposition in this phrase.`;
}

// Preposition similarity groups - prepositions that are commonly confused
const SIMILAR_PREPOSITIONS = {
    'in': ['at', 'on', 'into', 'within'],
    'at': ['in', 'on', 'to', 'by'],
    'on': ['in', 'at', 'upon', 'onto'],
    'to': ['at', 'for', 'into', 'towards'],
    'for': ['to', 'since', 'during', 'of'],
    'of': ['from', 'for', 'off', 'about'],
    'with': ['by', 'about', 'without', 'through'],
    'by': ['with', 'at', 'through', 'near'],
    'about': ['of', 'on', 'around', 'over'],
    'from': ['of', 'since', 'off', 'out'],
    'since': ['from', 'for', 'after', 'during'],
    'during': ['for', 'while', 'in', 'through'],
    'while': ['during', 'when', 'as', 'until'],
    'into': ['in', 'to', 'onto', 'inside'],
    'onto': ['on', 'into', 'upon', 'to'],
    'through': ['by', 'across', 'via', 'over'],
    'over': ['above', 'on', 'across', 'through'],
    'under': ['below', 'beneath', 'underneath', 'down'],
    'above': ['over', 'on', 'up', 'upon'],
    'below': ['under', 'beneath', 'down', 'underneath'],
    'between': ['among', 'within', 'amid', 'amongst'],
    'among': ['between', 'amid', 'amongst', 'within'],
    'before': ['after', 'until', 'by', 'prior'],
    'after': ['before', 'since', 'following', 'behind'],
    'behind': ['after', 'beyond', 'back', 'past'],
    'beyond': ['past', 'behind', 'after', 'through'],
    'against': ['for', 'towards', 'with', 'on'],
    'along': ['across', 'through', 'beside', 'by'],
    'around': ['about', 'round', 'near', 'around'],
    'out': ['in', 'off', 'outside', 'away'],
    'off': ['out', 'from', 'away', 'down'],
    'up': ['down', 'above', 'over', 'on'],
    'down': ['up', 'below', 'under', 'off'],
    'away': ['off', 'out', 'from', 'back'],
    'back': ['away', 'behind', 'return', 'again'],
    'across': ['through', 'over', 'along', 'past'],
    'past': ['beyond', 'through', 'by', 'after'],
    'beside': ['by', 'next', 'near', 'alongside'],
    'near': ['by', 'beside', 'close', 'around'],
    'inside': ['in', 'within', 'into', 'inside'],
    'outside': ['out', 'beyond', 'without', 'external'],
    'within': ['in', 'inside', 'during', 'among'],
    'without': ['with', 'outside', 'lacking', 'minus']
};

/**
 * Generate options for a gap, preferring prepositions from the lesson pool.
 * @param {string} correct - The correct answer
 * @param {string[]} lessonPrepositions - All unique prepositions used in this lesson
 * @returns {string[]} Array of 3 options including the correct one
 */
function generateOptions(correct, lessonPrepositions = []) {
    const correctLower = correct.toLowerCase().trim();
    const opts = new Set([correctLower]);

    // Get pool of available distractors from the lesson
    const lessonPool = lessonPrepositions
        .map(p => p.toLowerCase().trim())
        .filter(p => p !== correctLower);

    // Get the similarity list for the correct preposition
    const similarList = SIMILAR_PREPOSITIONS[correctLower] || [];

    // Prioritize distractors that are both in the lesson AND similar to correct
    const priorityDistractors = lessonPool.filter(p => similarList.includes(p));

    // Add priority distractors first
    for (const d of priorityDistractors) {
        if (opts.size >= 3) break;
        opts.add(d);
    }

    // Then add remaining lesson prepositions
    for (const d of lessonPool) {
        if (opts.size >= 3) break;
        opts.add(d);
    }

    // Fallback: if lesson has less than 3 unique prepositions, use similar ones
    if (opts.size < 3) {
        for (const d of similarList) {
            if (opts.size >= 3) break;
            opts.add(d);
        }
    }

    // Final fallback: random common prepositions
    const commonFallback = ['in', 'at', 'on', 'to', 'for', 'of', 'with', 'by'];
    for (const d of commonFallback) {
        if (opts.size >= 3) break;
        if (!opts.has(d)) opts.add(d);
    }

    // Shuffle and return
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

        // Collect all unique prepositions used in this lesson for option generation
        const lessonPrepositions = [...new Set(
            Object.values(answersMap).map(p => p.toLowerCase().trim())
        )];

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
                        options: generateOptions(correct, lessonPrepositions)
                        // explanation generated later
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

            // Update explanations now that we have the text
            gapsData.forEach(g => {
                g.explanation = generateExplanation(g.correct, text);
            });

            sentences.push({
                id: globalSentenceIdCounter++, // Internal ID for the sentence object
                // We keep original gap IDs in the gaps array for reference/debugging if needed
                text: text,
                gaps: gapsData
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
