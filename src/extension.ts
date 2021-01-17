/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import inlineDecorator from './inlineDecorator';
import { languages, TextDocument, Position, ExtensionContext, CancellationToken, MarkdownString } from 'vscode';
import { hoverWidgetContent } from './hoverWidget';

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

    const hoverRegistration = languages.registerHoverProvider('javascript', {
        provideHover(document: TextDocument, position: Position, token: CancellationToken) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
            const title = 'Object instantiation';
            const linkText = 'Working with Objects';
            const link = 'https://github.com/cyrusdiego/grok-js/tree/text-decorator';
            const blob = `JavaScript is designed on a simple object-based paradigm. 
                                An object is a collection of properties, and a property is an association between a name (or key)
                                and a value. A property's value can be a function, in which case the property is known as a method.
                                In addition to objects that are predefined in the browser, you can define your own objects.
                                This chapter describes how to use objects, properties, functions, and methods, and how to
                                create your own objects.`;

            return hoverWidgetContent(title, linkText, link, blob);
        },
    });

    context.subscriptions.push(hoverRegistration);

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
