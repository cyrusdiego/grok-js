import { MarkdownString } from 'vscode';
import { getDocItem } from './docs';

export const hoverWidgetContent = (title: String, linkText: String, link: String, description: String) => {
    const content = new MarkdownString(`# ${title} \n ## [${linkText}](${link}) \n ${description}`);

    return {
        contents: [content],
    };
};

export const showHoverWidget = (classification: string) => {
    return getDocItem(classification).title.length;
};
