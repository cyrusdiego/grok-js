import * as fs from "fs";
import * as acorn from "acorn";
import * as walk from "acorn-walk";

export interface Selection {
  start: number;
  end: number;
}

export enum Error {
  PARSE_FAILED = "parse_failed",
  WALK_FAILED = "walk_failed",
  NO_NODE_FOUND = "no_node_found",
}

export type Result = string | Error;
// TODO build a memoize function
// let cache = {};

// TODO don't return any but rather a proper type
export function grok(
  src: string,
  selection: Selection,
  isHighlighting: boolean
): Result {
  // Parse the source code into an AST
  // TODO add more options?
  const opts: acorn.Options = {
    ecmaVersion: "latest",
  };
  let ast: acorn.Node = {} as acorn.Node;
  try {
    ast = acorn.parse(src, opts);
  } catch (error) {
    // TODO return something else
    console.log("Failed to parse AST.");
    return Error.PARSE_FAILED;
  }

  let found: walk.Found<acorn.Node> | undefined;
  try {
    if (isHighlighting) {
      // Highlighting, so find the most specific node in selection
      if (
        (found = walk.findNodeAt(ast, selection.start, selection.end, anyNode))
      ) {
        found = walk.findNodeAround(ast, selection.start, anyNode);
      }
    } else {
      // Not highlighting anything so find the least specific node after selection.start
      found = walk.findNodeAfter(ast, selection.start, anyNode);
    }
  } catch (error) {
    // TODO return something else
    console.log("Failed to walk AST.");
    return Error.WALK_FAILED;
  }

  return found?.node?.type || Error.NO_NODE_FOUND;
}

function anyNode(type: any, node: any): boolean {
  return true;
}

// TODO remove this is just for testing
function test(selection: Selection, label: string, isHighlighting: boolean) {
  const src = fs.readFileSync("./src/api/example.js", "utf8");
  console.log(label);
  console.log("=============================================");
  console.log(`"${src.substring(selection.start, selection.end)}"`);
  console.log("=============================================");
  console.log(selection);
  console.log(grok(src, selection, isHighlighting));
  console.log("\n\n");
}

// TODO better tests
test({ start: 78, end: 85 }, "Rest element exact highlight", true);
test({ start: 77, end: 85 }, "Rest element missed highlight", true);
test({ start: 49, end: 108 }, "Rest element no highlight", false);

test({ start: 597, end: 609 }, "Multi-line no highlight", false);
test({ start: 613, end: 638 }, "Multi-line no highlight", false);
test({ start: 597, end: 609 }, "Multi-line no highlight", false);
