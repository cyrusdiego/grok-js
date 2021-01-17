import * as docs from './docs.json';

export interface DocItem {
    /** Short text blurb */
    inline: string;
    /** Title for popup*/
    title: string;
    /** Text for link to documentation*/
    linkText: string;
    /** Link to documentation*/
    link: string;
    /** Description of syntax*/
    description: string;
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
