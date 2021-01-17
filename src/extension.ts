/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import inlineDecorator from './inlineDecorator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const decorator = vscode.window.onDidChangeTextEditorSelection((selectionEvent) => {
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
			
			// get start and end position
			let start = new vscode.Position(editor.selection.start.line, editor.selection.start.character)
			let end = new vscode.Position(editor.selection.end.line, editor.selection.end.character)

			// get offsets
			let range = new vscode.Range(start, end);
			let highlight =  editor.document.getText(range);
			let start_offset = editor.document.getText().indexOf(highlight)
			let end_offset = start_offset + highlight.length

            decorations.push({
                range: new vscode.Range(firstLine, 0, firstLine, lines[firstLine].length),
                renderOptions: {
                    after: {
                        contentText: 'Brief description',
                    },
                },
            });
        }

        editor.setDecorations(inlineDecorator, decorations);
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
    context.subscriptions.push(decorator);
}

export function deactivate(){}
