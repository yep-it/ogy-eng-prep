import jsdom from 'jsdom';
import fs from 'fs';
const { JSDOM } = jsdom;

const url = "https://www.english-grammar.at/online_exercises/prepositions/prep019-roald-dahl.htm";

async function test() {
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Check script
    const scriptContent = Array.from(doc.querySelectorAll('script'))
        .find(s => s.textContent.includes('I = new Array();'))?.textContent;

    if (scriptContent) {
        console.log("Found answer script!");
        const regex = /I\[(\d+)\]\[1\]\[0\]\[0\]\s*=\s*'([^']+)';/g;
        let count = 0;
        let m;
        while ((m = regex.exec(scriptContent)) !== null) count++;
        console.log(`Found ${count} answers in script.`);
    } else {
        console.log("NO answer script found.");
    }

    const sentences = [];
    const lis = doc.querySelectorAll('li');
    console.log(`Found ${lis.length} LIs.`);

    const container = doc.querySelector('.ClozeBody') || doc.forms[0];
    console.log(`Fallback Container found: ${!!container}`);
    if (container) {
        const inputs = container.querySelectorAll('input');
        console.log(`Found ${inputs.length} inputs in container.`);
        inputs.forEach(i => console.log(` Input ID: ${i.id}`));
    }
}

test();
