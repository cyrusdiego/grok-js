/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import { grok, Result, Settings } from './api';
import inlineDecoratorType from './inlineDecoratorType';
import { languages, TextDocument, Position, ExtensionContext, CancellationToken, MarkdownString, Selection, TextEditor } from 'vscode';
import { hoverWidgetContent, showHoverWidget } from './hoverWidget';
import { getDocItem } from './docs';

function getOffset(pos: vscode.Position, lines: string[]) {
    let offset = 0;
    for (let i = 0; i < pos.line; i++) {
        offset += lines[i].length + 1; // +1 accounts for removed newline
    }

    return offset + pos.character;
}

type State = {
    startOffset: number;
    endOffset: number;
    grokClassification: Result;
};

function decorateInline(activeEditor: TextEditor, settings: Settings): State {
    const selection = activeEditor.selection;
    const text = activeEditor.document.getText();
    const lines = text.split('\n');

    const decorations: vscode.DecorationOptions[] = [];

    // Get start and end position
    let start = new vscode.Position(selection.start.line, activeEditor.selection.start.character);
    let end = new vscode.Position(selection.end.line, activeEditor.selection.end.character);

    // If there is no highlight, send the entire line
    if (start.character === end.character && start.line === end.line) {
        start = new vscode.Position(start.line, 0);
        end = new vscode.Position(start.line, lines[start.line].length);
    }

    // Calculate offsets
    const highlightRange = new vscode.Range(start, end);
    const highlightedText = activeEditor.document.getText(highlightRange);

    const startOffset = getOffset(start, lines);
    const endOffset = startOffset + highlightedText.length;

    // Get classification from AST
    const grokClassification = grok(text, { start: startOffset, end: endOffset }, startOffset !== endOffset, settings);

    decorations.push({
        // Display decorator for the entire line
        range: new vscode.Range(start.line, 0, end.line, lines[end.line].length),
        renderOptions: {
            after: {
                contentText: getDocItem(grokClassification.output).inline,
            },
        },
    });

    activeEditor.setDecorations(inlineDecoratorType, decorations);
    return { startOffset, endOffset, grokClassification };
}

function get_settings(): Settings {
    const config = vscode.workspace.getConfiguration();

    return {
        ecmaversion: config.get('grokJS.ecmaVersion'),
        sourcetype: config.get('grokJS.sourceType'),
        allowreserved: config.get('grokJS.allowReserved'),
        allowreturnoutsidefunction: config.get('grokJS.allowReturnOutsideFunction'),
        allowimportexporteverywhere: config.get('grokJS.allowImportExportEverywhere'),
        allowawaitoutsidefunction: config.get('grokJS.allowAwaitOutsideFunction'),
        allowhashbang: config.get('grokJS.allowHashBang'),
    };
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Global state to store what is currently highlighted
    let startOffset = 0;
    let endOffset = 0;
    let settings = get_settings();
    let grokClassification = { output: '', code: '' };

    // On configurations change
    vscode.workspace.onDidChangeConfiguration((event) => {
        settings = get_settings();
        if (editor !== undefined && editor.document.fileName.endsWith('.js')) {
            ({ startOffset, endOffset, grokClassification } = decorateInline(editor, settings));
        }
    });

    // On start-up
    const editor = vscode.window.activeTextEditor;
    if (editor !== undefined && editor.document.fileName.endsWith('.js')) {
        ({ startOffset, endOffset, grokClassification } = decorateInline(editor, settings));
    }

    // On highlight changes
    const inlineDecorator = vscode.window.onDidChangeTextEditorSelection((_) => {
        const editor = vscode.window.activeTextEditor;
        if (editor !== undefined && editor.document.fileName.endsWith('.js')) {
            ({ startOffset, endOffset, grokClassification } = decorateInline(editor, settings));
        }
    });

    const hoverRegistration = languages.registerHoverProvider('javascript', {
        provideHover(document: TextDocument, position: Position, token: CancellationToken) {
            const hoverOffset = document.offsetAt(position);
            if (startOffset <= hoverOffset && hoverOffset <= endOffset && showHoverWidget(grokClassification.output)) {
                const { title, linkText, link, description } = getDocItem(grokClassification.output);

                return hoverWidgetContent(title, linkText, link, description, grokClassification.code);
            }
        },
    });

    context.subscriptions.push(inlineDecorator);
    context.subscriptions.push(hoverRegistration);
}

export function deactivate() {}
