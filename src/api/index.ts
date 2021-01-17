import * as fs from "fs";
import * as acorn from "acorn";
import * as walk from "acorn-walk";

export interface Selection {
  start: number;
  end: number;
}

// TODO build a memoize function

// TODO don't return any but rather a proper type
export function grok(
  src: string,
  selection: Selection,
  isHighlighting: boolean
): string {
  // Parse the source code into an AST
  // TODO add more options?
  const opts: acorn.Options = {
    ecmaVersion: 2015,
  };
  let ast: acorn.Node = {} as acorn.Node;
  try {
    ast = acorn.parse(src, opts);
  } catch (error) {
    // TODO return something else
    console.log("Failed to parse AST.");
    return "ERROR";
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
    console.log("Failed to parse AST.");
    return "ERROR";
  }
  const subTree: acorn.Node = (found as walk.Found<acorn.Node>).node;

  return subTree.type;
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
  console.log(grok(src, selection, false));
  console.log("\n\n");
}

// TODO better tests
test({ start: 78, end: 85 }, "Rest element", false);
test({ start: 272, end: 302 }, "Arrow function", false);
test({ start: 530, end: 548 }, "Function", false);
test({ start: 381, end: 394 }, "Identifier", false);
test({ start: 509, end: 510 }, "Binary and literal", false);
test({ start: 383, end: 510 }, "Mid spread", false);
