import { MarkdownString } from 'vscode';
import { isNode, Result } from './api';
import { getDocItem } from './docs';
import { getCodeSnippet } from './extension';

const docToMarkDown = (title: string, linkText: string, link: string, description: string, code: string, isChild = false) => {
    const header = isChild ? '##' : '#';
    const subheader = isChild ? '###' : '##';

    return new MarkdownString(
        `${header} ${title} \n ${subheader} [${linkText}](${link}) \n ${description} \n \n *Labelled Code:*`
    ).appendCodeblock(code, 'javascript');
};

export const getWidgetContent = (result: Result) => {
    console.log(`results: ${result}`);
    const root = getDocItem(result.output);
    const item = docToMarkDown(root.title, root.linkText, root.link, root.description, result.code);
    let content = [];
    content.push(item);

    if (result.children) {
        const children = new MarkdownString('# Children: \n');
        let docItem;
        let code;
        let child;
        let markdown;
        Object.keys(result.children).forEach((key: any) => {
            child = result.children[key];
            if (isNode(child)) {
                docItem = getDocItem(child.type);
                code = getCodeSnippet(child.start, child.end);
                markdown = docToMarkDown(docItem.title, docItem.linkText, docItem.link, docItem.description, code, true);
                children.appendMarkdown(markdown.value);
            }
        });

        if (children.value !== '# Children: \n') {
            content.push(children);
        }
    }

    return {
        contents: content,
    };
};

export const showHoverWidget = (classification: string) => {
    return getDocItem(classification).title.length;
};
