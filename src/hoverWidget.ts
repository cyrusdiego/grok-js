import { MarkdownString } from 'vscode';

export const hoverWidgetContent = (title: String, linkText: String, link: String, description: String) => {
    const content = new MarkdownString(`# ${title} \n ## [${linkText}](${link}) \n ${description}`);

    return {
        contents: [content],
    };
};
