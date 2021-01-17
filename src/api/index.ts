import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export interface Selection {
    start: number;
    end: number;
}

export enum Error {
    PARSE_FAILED = 'parse_failed',
    WALK_FAILED = 'walk_failed',
    NO_NODE_FOUND = 'no_node_found',
}

export type Result = string | Error;
// TODO build a memoize function
// let cache = {};
// function memoizedGrok(): any {
//     if
// }

// TODO add logic to tell a user what is more specific than what they selected when they highlight

// TODO don't return any but rather a proper type
export function grok(src: string, selection: Selection, isHighlighting: boolean): Result {
    // Parse the source code into an AST
    // TODO add more options?
    const opts: acorn.Options = {
        ecmaVersion: 'latest',
        sourceType: 'module',
    };
    let ast: acorn.Node = {} as acorn.Node;
    try {
        ast = acorn.parse(src, opts);
    } catch (error) {
        // TODO return something else
        console.log('Failed to parse AST.');
        return Error.PARSE_FAILED;
    }

    let found: walk.Found<acorn.Node> | undefined;
    try {
        if (isHighlighting) {
            // Highlighting, so find the most specific node in selection
            if (!(found = walk.findNodeAt(ast, selection.start, selection.end, anyNode))) {
                found = walk.findNodeAround(ast, selection.start, anyNode);
            }
        } else {
            // Not highlighting anything so find the least specific node after selection.start
            found = walk.findNodeAfter(ast, selection.start, anyNode);
        }
    } catch (error) {
        // TODO return something else
        console.log('Failed to walk AST.');
        return Error.WALK_FAILED;
    }

    return found?.node?.type || Error.NO_NODE_FOUND;
}

function anyNode(type: any, node: any): boolean {
    return true;
}
