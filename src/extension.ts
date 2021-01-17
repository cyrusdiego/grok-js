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

/**
 * Calculates a multiline string offset from a {line: number, column: number} data structure.
 * @param pos {line: number, column: number} data structure
 * @param lines multiline string split by newlines
 */
function getOffset(pos: vscode.Position, lines: string[]): number {
    let offset = 0;
    for (let i = 0; i < pos.line; i++) {
        offset += lines[i].length + 1; // +1 accounts for removed newline
    }

    return offset + pos.character;
}

/**
 * Defintion of the extension global state
 */
type State = {
    startOffset: number;
    endOffset: number;
    grokClassification: Result;
};

/**
 * Writes out the inline classification from grok beside the currently highlighted line of code.
 * If nothing is highlighted, the entire line is sent over to grok to be analyzed.
 * @param activeEditor taken from vscode.window
 * @param settings user settings for grok
 */
function decorateInline(): State {
    const activeEditor = vscode.window.activeTextEditor;

    // Start analyzing only if there's an active text editor with a javascript file open
    if (activeEditor === undefined || !activeEditor.document.fileName.endsWith('.js')) {
        return { startOffset: 0, endOffset: 0, grokClassification: { output: '', code: '' } };
    }

    const settings = getSettings();
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

/**
 * Helper to get user settings for grokJS
 */
function getSettings(): Settings {
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
    let settings = getSettings();
    let grokClassification = { output: '', code: '' };

    // On start-up
    ({ startOffset, endOffset, grokClassification } = decorateInline());

    // On configurations change
    const inlineDecoratorSettings = vscode.workspace.onDidChangeConfiguration((_) => {
        ({ startOffset, endOffset, grokClassification } = decorateInline());
    });

    // On highlight changes
    const inlineDecoratorHighlight = vscode.window.onDidChangeTextEditorSelection((_) => {
        ({ startOffset, endOffset, grokClassification } = decorateInline());
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

    context.subscriptions.push(inlineDecoratorHighlight);
    context.subscriptions.push(inlineDecoratorSettings);
    context.subscriptions.push(hoverRegistration);
}

export function deactivate() {}
