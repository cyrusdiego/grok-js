import * as docs from 'docs.json';

export interface DocItem {
    /** Contains short text blurb */
    inline: string;
    /** Contains markdown*/
    widget: string;
}

// TODO memoize loading the json

export function getDocItem(key: string): DocItem {
    if (isKeyof(docs, key)) {
        return docs.
    }
}

// https://stackoverflow.com/questions/53519513/in-typescript-how-to-import-json-and-dynamically-lookup-by-key/53519985
function isKeyof<T extends object>(obj: T, possibleKey: keyof any): possibleKey is keyof T {
    return possibleKey in obj;
  }