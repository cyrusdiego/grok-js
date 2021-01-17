/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext, window, Range, Position } from 'vscode';

import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	const outputChannel = window.createOutputChannel('Test');

	window.onDidChangeTextEditorSelection((e) => {

		if (e.kind?.toString() === undefined) return;
		
		let start = new Position(e.textEditor.selection.start.line, e.textEditor.selection.start.character)

		let end = new Position(e.textEditor.selection.end.line, e.textEditor.selection.end.character)

		if (start.line === end.line && start.character == end.character) {
			outputChannel.appendLine(e.textEditor.selection.start.line.toString())
			return
		}
		
		let range = new Range(start, end);
		let highlight =  e.textEditor.document.getText(range);

		outputChannel.appendLine(highlight);
		// TODO: Add delay to ensue click or highlight
	});
	
	//TODO: remove

    // The server is implemented in node
    let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions,
        },
    };

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'plaintext' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
        },
    };

    // Create the language client and start the client.
    client = new LanguageClient('grokJS', 'grokJS', serverOptions, clientOptions);

    // Start the client. This will also launch the server
	client.start();
	context.subscriptions.push();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
