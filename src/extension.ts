/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import { grok } from './api';
import inlineDecoratorType from './inlineDecoratorType';
import { languages, TextDocument, Position, ExtensionContext, CancellationToken, MarkdownString } from 'vscode';
import { hoverWidgetContent } from './hoverWidget';
import { getDocItem } from './docs';

function get_offset(pos: vscode.Position, lines: string[]) {
    let offset = 0;
    for (let i = 0; i < pos.line; i++) {
        offset += lines[i].length + 1;
    }

    return offset + pos.character;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Global state to store what is currently highlighted
    let startOffset = 0;
    let endOffset = 0;
    let single_click = false;
    let grokClassification = '';

    const inlineDecorator = vscode.window.onDidChangeTextEditorSelection((selectionEvent) => {
        if (selectionEvent?.kind === undefined) return;

        const editor = selectionEvent.textEditor;

        const decorations: vscode.DecorationOptions[] = [];
        const text = editor.document.getText();

        const lines = text.split('\n');
        const selection = selectionEvent.selections[0]; // TODO: Verify if this will ever fail

        // Get start and end position
        let start = new vscode.Position(selection.start.line, editor.selection.start.character);
        let end = new vscode.Position(selection.end.line, editor.selection.end.character);

        if (start.character === end.character && start.line === end.line) {
            start = new vscode.Position(start.line, 0);
            end = new vscode.Position(start.line, lines[start.line].length);
        }

        // Calculate offsets
        const highlightRange = new vscode.Range(start, end);
        const highlightedText = editor.document.getText(highlightRange);

        startOffset = get_offset(start, lines);
        endOffset = startOffset + highlightedText.length;
        // Get classification from AST
        grokClassification = grok(text, { start: startOffset, end: endOffset }, startOffset === endOffset);
        // TODO handle errors
        const inlineOutput = getDocItem(grokClassification);

        if (single_click) end = start;
        decorations.push({
            // Display decorator for the entire line
            range: new vscode.Range(start.line, 0, end.line, lines[end.line].length),
            renderOptions: {
                after: {
                    contentText: inlineOutput.inline,
                },
            },
        });

        editor.setDecorations(inlineDecoratorType, decorations);
    });

    const hoverRegistration = languages.registerHoverProvider('javascript', {
        provideHover(document: TextDocument, position: Position, token: CancellationToken) {
            const hoverOffset = document.offsetAt(position);
            if (startOffset <= hoverOffset && hoverOffset <= endOffset && grokClassification) {
                const { title, linkText, link, description } = getDocItem(grokClassification);
                return hoverWidgetContent(title, linkText, link, description);
            }
        },
    });

    context.subscriptions.push(inlineDecorator);
    context.subscriptions.push(hoverRegistration);
}

export function deactivate() {}
