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

export interface Settings {
    ecmaversion?: any;
    sourcetype?: any;
    allowreserved?: boolean;
    allowreturnoutsidefunction?: boolean;
    allowimportexporteverywhere?: boolean;
    allowawaitoutsidefunction?: boolean;
    allowhashbang?: boolean;
}

export interface Result {
    output: string | Error;
    code: string;
}

export function grok(src: string, selection: Selection, isHighlighting: boolean, acorn_settings: Settings): Result {
    // Parse the source code into an AST
    const opts: acorn.Options = {
        ecmaVersion: acorn_settings.ecmaversion,
        sourceType: acorn_settings.sourcetype,
        allowReserved: acorn_settings.allowreserved,
        allowReturnOutsideFunction: acorn_settings.allowreturnoutsidefunction,
        allowImportExportEverywhere: acorn_settings.allowimportexporteverywhere,
        allowAwaitOutsideFunction: acorn_settings.allowawaitoutsidefunction,
        allowHashBang: acorn_settings.allowhashbang,
    };

    let ast: acorn.Node = {} as acorn.Node;
    try {
        ast = acorn.parse(src, opts);
    } catch (error) {
        // TODO return something else
        return { output: Error.PARSE_FAILED, code: '' };
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
            if (found && found.node && found.node.start > selection.end) {
                return { output: Error.NO_NODE_FOUND, code: '' };
            }
        }
    } catch (error) {
        return { output: Error.WALK_FAILED, code: '' };
    }

    if (!found || !found.node) {
        return { output: Error.NO_NODE_FOUND, code: '' };
    }

    const finalNode = found.node;
    const code: string = src.substring(finalNode.start, finalNode.end);
    return { output: finalNode.type || Error.NO_NODE_FOUND, code };
}

function anyNode(type: any, node: any): boolean {
    return true;
}
