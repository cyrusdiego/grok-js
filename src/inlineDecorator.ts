import * as vscode from 'vscode';

const inlineDecorator = vscode.window.createTextEditorDecorationType({
    after: {
        margin: '0 0 0 3em',
        color: new vscode.ThemeColor('editorWhitespace.foreground')
    },
});

export default inlineDecorator;
