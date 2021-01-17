import * as fs from 'fs';
import { grok, Selection } from './index';

// TODO remove this is just for testing
function testGrok(selection: Selection, label: string, isHighlighting: boolean) {
    const src = fs.readFileSync('./src/api/example.js', 'utf8');
    console.log(label);
    console.log('=============================================');
    console.log(`"${src.substring(selection.start, selection.end)}"`);
    console.log('=============================================');
    console.log(selection);
    console.log(grok(src, selection, isHighlighting));
    console.log('\n\n');
}

// TODO better tests
testGrok({ start: 78, end: 85 }, 'Rest element exact highlight', true);
testGrok({ start: 77, end: 85 }, 'Rest element missed highlight', true);
testGrok({ start: 49, end: 108 }, 'Rest element no highlight', false);

testGrok({ start: 597, end: 609 }, 'Multi-line no highlight', false);
testGrok({ start: 613, end: 638 }, 'Multi-line no highlight', false);
testGrok({ start: 597, end: 609 }, 'Multi-line no highlight', false);
