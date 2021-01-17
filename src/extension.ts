// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { grok } from './api';
import inlineDecoratorType from './inlineDecoratorType';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const inlineDecorator = vscode.window.onDidChangeTextEditorSelection((selectionEvent) => {
        const editor = selectionEvent.textEditor;

        const decorations: vscode.DecorationOptions[] = [];
        const text = editor.document.getText();

        const lines = text.split('\n');

        for (const selection of selectionEvent.selections) {
            const firstLine = selection.start.line;

            let selectedText = '';
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                if (i === selection.start.line) {
                    selectedText += lines[i].substr(selection.start.character, lines[i].length);
                } else if (i < selection.end.line) {
                    selectedText += lines[i];
                } else {
                    selectedText += lines[i].substr(0, selection.end.character);
                }
			}
			console.log(selectedText);

            // TODO: get global offset from Daniel
            const result = grok(text, { start: 49, end: 108 }, false);

            decorations.push({
                range: new vscode.Range(firstLine, 0, firstLine, lines[firstLine].length),
                renderOptions: {
                    after: {
                        contentText: result,
                    },
                },
            });
        }

        editor.setDecorations(inlineDecoratorType, decorations);
    });

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "grok-js" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('grok-js.helloWorld', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from grok-js!');
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(inlineDecorator);
}

// this method is called when your extension is deactivated
export function deactivate() {}
