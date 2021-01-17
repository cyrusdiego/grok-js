import axios from 'axios';
import { parse } from 'node-html-parser';
import { inspect } from 'util';

type Document = {
    title?: string;
    source?: string;
    summary?: string;
};

const urls: string[] = [
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment',
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions',
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator',
];

async function scrape(url: string) {
    const res = await axios.get(url);
    const root = parse(res.data);

    const doc: Document = {
        title: root.querySelector('title')?.innerText || '',
        source: url,
        summary: root.querySelector('p').innerText || '', // Assume summary is first paragraph shown
    };

    return doc;
}

(async () => {
    for (const url of urls) {
        console.log(inspect(await scrape(url)));
    }
})();
