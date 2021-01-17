import { DecorationRangeBehavior, window } from 'vscode';

const inlineDecorator = window.createTextEditorDecorationType({
	after: {
		margin: '0 0 0 3em',
		textDecoration: 'none',
	},
	rangeBehavior: DecorationRangeBehavior.ClosedOpen,
});

export default inlineDecorator;
