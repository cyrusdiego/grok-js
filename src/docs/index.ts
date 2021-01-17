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

export function getDocItem(key: string): DocItem {
    return isKeyOf(docs, key) ? docs[key] : docs['default'];
}

// https://stackoverflow.com/questions/53519513/in-typescript-how-to-import-json-and-dynamically-lookup-by-key/53519985
function isKeyOf<T extends object>(obj: T, key: keyof any): key is keyof T {
    return key in obj;
}
