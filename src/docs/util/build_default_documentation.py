import re
import json

def grab(f, doc_items):
    matches = re.findall('interface (.*) <:', f.read())
    for match in matches:
        doc_items[match] = {}
        split = " ".join(camel_case_split(match))
        doc_items[match]['inline'] = split
        doc_items[match]['title'] = split
        doc_items[match]['linkText'] = "Working with " + split
        doc_items[match]['link'] = ""
        doc_items[match]['description'] = ""

# https://stackoverflow.com/questions/29916065/how-to-do-camelcase-split-in-python
def camel_case_split(identifier):
    matches = re.finditer('.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)', identifier)
    return [m.group(0) for m in matches]

if __name__ == "__main__":
    doc_items = {}
    sources = ["es5.md", "es2015.md", "es2016.md", "es2017.md", "es2018.md", "es2019.md", "es2020.md", "es2021.md"]

    for src in sources:
        with open(src) as f:
            grab(f, doc_items)

    with open("../docs.default.json", 'w') as fout:
        doc_items = json.dumps(doc_items)
        fout.write(doc_items)
