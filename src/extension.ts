/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

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
            // Get start and end position
            let start = new vscode.Position(selection.start.line, editor.selection.start.character);
            let end = new vscode.Position(selection.end.line, editor.selection.end.character);

            // Calculate offsets
            const highlightRange = new vscode.Range(start, end);
            const highlightedText = editor.document.getText(highlightRange);

            const startOffset = editor.document.getText().indexOf(highlightedText);
            const endOffset = startOffset + highlightedText.length;

            // Get classification from AST
            const result = grok(text, { start: startOffset, end: endOffset }, startOffset === endOffset);

            decorations.push({
                // Display decorator for the entire line
                range: new vscode.Range(start.line, 0, end.line, lines[end.line].length),
                renderOptions: {
                    after: {
                        contentText: result,
                    },
                },
            });
        }

        editor.setDecorations(inlineDecoratorType, decorations);
    });

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

export function deactivate() {}
