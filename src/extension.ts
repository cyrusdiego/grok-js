/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import { grok } from './api';
import inlineDecoratorType from './inlineDecoratorType';
import { languages, TextDocument, Position, ExtensionContext, CancellationToken, MarkdownString } from 'vscode';
import { hoverWidgetContent } from './hoverWidget';


function get_offset (pos: vscode.Position, lines: string[]) {
    let offset = 0;
    for (let i = 0; i < pos.line; i++) {
        offset += lines[i].length + 1
    }

    return offset + pos.character;
}


 // this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Global state to store what is currently highlighted
    let startOffset = 0;
    let endOffset = 0;
    let single_click = false
    
    const inlineDecorator = vscode.window.onDidChangeTextEditorSelection((selectionEvent) => {

        if (selectionEvent?.kind === undefined) return 

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

        startOffset = get_offset(start, lines)
        endOffset = startOffset + highlightedText.length;

        // Get classification from AST
        const result = grok(text, { start: startOffset, end: endOffset }, startOffset === endOffset);

        if (single_click) end = start
        decorations.push({
            // Display decorator for the entire line
            range: new vscode.Range(start.line, 0, end.line, lines[end.line].length),
            renderOptions: {
                after: {
                    contentText: result,
                },
            },
        });

        editor.setDecorations(inlineDecoratorType, decorations);
    });

    const hoverRegistration = languages.registerHoverProvider('javascript', {
        provideHover(document: TextDocument, position: Position, token: CancellationToken) {
            const hoverOffset = document.offsetAt(position);
            if (startOffset <= hoverOffset && hoverOffset <= endOffset) {
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
            }
        },
    });

    context.subscriptions.push(inlineDecorator);
    context.subscriptions.push(hoverRegistration);
}

export function deactivate() {}
