import * as docs from 'docs.json';

export interface DocItem {
    /** Contains short text blurb */
    inline: string;
    /** Contains markdown*/
    widget: string;
}

// TODO memoize loading the json
// TODO don't abuse any

export function getDocItem(key: string): DocItem {
    if (key in docs) {
        return (docs as any)[key];
    } else {
        return (docs as any)['default'];
    }
}
