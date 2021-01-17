import * as vscode from 'vscode';

const inlineDecoratorType = vscode.window.createTextEditorDecorationType({
    after: {
        margin: '0 0 0 3em',
        color: new vscode.ThemeColor('editorWhitespace.foreground'),
    },
});

export default inlineDecoratorType;
