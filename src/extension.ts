// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  languages,
  TextDocument,
  Position,
  ExtensionContext,
  CancellationToken,
  MarkdownString,
} from 'vscode';

const hoverWidget = (title: String, link: String, description: String) => {
  return `# ${title} \n ## [${link}](https://developer.mozilla.org/en-US/) \n ${description}`;
};

// this method is called when your extension is activated
export function activate(context: ExtensionContext) {
  const hoverRegistration = languages.registerHoverProvider('javascript', {
    provideHover(
      document: TextDocument,
      position: Position,
      token: CancellationToken
    ) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);
      const title = 'Object instantiation';
      const documentation_link = 'Working with Objects';
      const documentation_blob = `JavaScript is designed on a simple object-based paradigm. 
                                An object is a collection of properties, and a property is an association between a name (or key)
                                and a value. A property's value can be a function, in which case the property is known as a method.
                                In addition to objects that are predefined in the browser, you can define your own objects.
                                This chapter describes how to use objects, properties, functions, and methods, and how to
                                create your own objects.`;
      return {
        contents: [
          new MarkdownString(
            hoverWidget(title, documentation_link, documentation_blob)
          ),
        ],
      };
    },
  });

  context.subscriptions.push(hoverRegistration);
}

// this method is called when your extension is deactivated
export function deactivate() {}
