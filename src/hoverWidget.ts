import { MarkdownString } from 'vscode';
import { getDocItem } from './docs';

export const hoverWidgetContent = (title: String, linkText: String, link: String, description: String, code: String) => {
    const content = new MarkdownString(`# ${title} \n ## [${linkText}](${link}) \n ${description} \n \n *Labelled Code:* \`\`${code}\`\``);
    console.log(content.value);
    return {
        contents: [content],
    };
};

export const showHoverWidget = (classification: string) => {
    return getDocItem(classification).title.length;
};
