import jsdom from 'jsdom';
const { JSDOM } = jsdom;

async function debug() {
    const url = "https://www.english-grammar.at/online_exercises/prepositions/prep035.htm";
    console.log(`Fetching ${url}...`);
    const resp = await fetch(url);
    const html = await resp.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const lis = doc.querySelectorAll('li');
    console.log(`Found ${lis.length} LIs`);

    if (lis.length > 0) {
        const first = lis[0];
        console.log("FIRST LI HTML:", first.innerHTML);
        console.log("FIRST LI TEXT:", first.textContent);

        const inputs = first.querySelectorAll('input, select');
        console.log(`Inputs found: ${inputs.length}`);
        inputs.forEach((inp, i) => {
            console.log(`Input ${i}: Tag=${inp.tagName}, ID=${inp.id}`);
        });

        // Test Cleaning logic
        const clone = first.cloneNode(true);
        // Simulate replacing all inputs
        inputs.forEach(inp => {
            const cInp = clone.querySelector(`#${inp.id}`);
            if (cInp) cInp.replaceWith("____");
        });

        // Remove selects
        clone.querySelectorAll('select').forEach(s => s.remove());

        console.log("CLEANED TEXT:", clone.textContent.replace(/\s+/g, ' ').trim());
    }
}

debug();
