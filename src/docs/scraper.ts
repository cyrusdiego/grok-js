import axios from 'axios';
import { parse } from 'node-html-parser';
import { inspect } from 'util';
import * as topics from './docs.default.json';

type Document = {
    title?: string;
    source?: string;
    summary?: string;
};

async function search(searchString: string): Promise<(string | undefined)[]> {
    const res = await axios.get('https://www.google.com/search', {
        params: {
            q: searchString,
        },
    });
    const root = parse(res.data);
    const links = root.querySelectorAll('a');

    if (links.length < 1) {
        return [];
    }

    return links.map((link) => {
        if (link === undefined) {
            return undefined;
        }

        const matches = link.getAttribute('href')!.match(/https?:\/\/.*\//g);
        if (matches !== undefined && matches !== null) {
            return matches[0];
        }

        return undefined;
    });
}

async function getMozillaLink(searchString: string): Promise<string | undefined> {
    const links = await search(searchString);
    for (const link of links) {
        if (link?.includes('developer.mozilla.org')) {
            return link;
        }
    }
    return undefined;
}

async function scrape(url: string): Promise<Document> {
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
    let i = 0;
    for (const key in topics) {
        if (i === 10) {
            return;
        }
        const title = (topics as any)[key].title;
        const mozillaLink = await getMozillaLink(`javascript ${title}`);
        if (mozillaLink !== undefined) {
            const doc = await scrape(mozillaLink);
            if (doc.title === '') {
                console.error(`Could not find docs for ${title}`);
            }
            (topics as any)[key].link = doc.source;
            (topics as any)[key].description = doc.summary;
        }
        console.error(`Could not find docs for ${title}`);
        i++;
    }
})();
