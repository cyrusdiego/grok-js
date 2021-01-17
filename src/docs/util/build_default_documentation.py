import re
import json

def build(fout, fes5, fes2015):
    matches = re.findall('interface (.*) <:', fes5.read())
    doc_items = {}
    for match in matches:
        doc_items[match] = {}
        doc_items[match]['inline'] = "TODO"
        doc_items[match]['widget'] = "TODO"

    doc_items = json.dumps(doc_items)
    fout.write(doc_items)

if __name__ == "__main__":
    with open("../docs.default.json", 'w') as fout:
        with open("es5.md") as fes5:
            with open("es2015.md") as fes2015:
                build(fout, fes5, fes2015)
