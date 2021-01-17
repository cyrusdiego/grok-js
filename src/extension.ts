/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import { grok } from './api';
import inlineDecoratorType from './inlineDecoratorType';
import { languages, TextDocument, Position, ExtensionContext, CancellationToken, MarkdownString, Selection, TextEditor } from 'vscode';
import { hoverWidgetContent, showHoverWidget } from './hoverWidget';
import { getDocItem } from './docs';

function get_offset(pos: vscode.Position, lines: string[]) {
    let offset = 0;
    for (let i = 0; i < pos.line; i++) {
        offset += lines[i].length + 1;
    }

    return offset + pos.character;
}

type State = {
    startOffset: number;
    endOffset: number;
    grokClassification: string;
};

function decorateInline(activeEditor: TextEditor): State {
    const selection = activeEditor.selection;
    const text = activeEditor.document.getText();
    const lines = text.split('\n');

    const decorations: vscode.DecorationOptions[] = [];

    // Get start and end position
    let start = new vscode.Position(selection.start.line, activeEditor.selection.start.character);
    let end = new vscode.Position(selection.end.line, activeEditor.selection.end.character);

    // Calculate offsets
    const highlightRange = new vscode.Range(start, end);
    const highlightedText = activeEditor.document.getText(highlightRange);

    const startOffset = get_offset(start, lines);
    const endOffset = startOffset + highlightedText.length;

    // Get classification from AST
    const grokClassification = grok(text, { start: startOffset, end: endOffset }, startOffset === endOffset);

    decorations.push({
        // Display decorator for the entire line
        range: new vscode.Range(start.line, 0, end.line, lines[end.line].length),
        renderOptions: {
            after: {
                contentText: getDocItem(grokClassification).inline,
            },
        },
    });

    activeEditor.setDecorations(inlineDecoratorType, decorations);
    return { startOffset, endOffset, grokClassification };
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Global state to store what is currently highlighted
    let startOffset = 0;
    let endOffset = 0;
    let grokClassification = '';

    // On startup
    const editor = vscode.window.activeTextEditor;
    if (editor !== undefined) {
        ({ startOffset, endOffset, grokClassification } = decorateInline(editor));
    }

    // On highlight changes
    const inlineDecorator = vscode.window.onDidChangeTextEditorSelection((_) => {
        const editor = vscode.window.activeTextEditor;
        if (editor !== undefined) {
            ({ startOffset, endOffset, grokClassification } = decorateInline(editor));
        }
    });

    const hoverRegistration = languages.registerHoverProvider('javascript', {
        provideHover(document: TextDocument, position: Position, token: CancellationToken) {
            const hoverOffset = document.offsetAt(position);
            if (startOffset <= hoverOffset && hoverOffset <= endOffset && showHoverWidget(grokClassification)) {
                const { title, linkText, link, description } = getDocItem(grokClassification);

                return hoverWidgetContent(title, linkText, link, description);
            }
        },
    });

    context.subscriptions.push(inlineDecorator);
    context.subscriptions.push(hoverRegistration);
}

export function deactivate() {}
