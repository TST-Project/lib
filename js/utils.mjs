const isDuplicateParam = (nodeToImport, existingParamNames) => {
  if (nodeToImport.localName !== 'param' || 
      nodeToImport.namespaceURI !== 'http://www.w3.org/1999/XSL/Transform')
    return false;

  return existingParamNames.has(nodeToImport.getAttribute('name'));
}

const getTopLevelParamNames = (xsltsheet, xslns) => {
  const params = xsltsheet.documentElement.getElementsByTagNameNS(xslns, 'param');
  const names = new Set();
  for (const param of params) {
    if (param.parentElement === xsltsheet.documentElement)
      names.add(param.getAttribute('name'));
  }
  return names;
}

const compileImports = async (xsltsheet, relurl) => {
  const xslns = 'http://www.w3.org/1999/XSL/Transform';
  const imports = Array.from(xsltsheet.getElementsByTagNameNS(xslns, 'import'));
  if (!imports.length) return xsltsheet;
  if (!relurl) relurl = window.location.href;

  const existingParamNames = getTopLevelParamNames(xsltsheet, xslns);

  // Fetch all imports at this level in parallel.
  const importDocs = await Promise.all(
    imports.map(async importElement => {
      const href = new URL(importElement.getAttribute('href'), relurl).href;
      const importedDoc = await loadDoc(href, 'default');
      return { importElement, importedDoc, href };
    }),
  );

  for (const { importElement, importedDoc, href } of importDocs) {
    if (!importedDoc || !importedDoc.documentElement) {
      importElement.remove();
      continue;
    }

    // Recursively compile imports within the imported document.
    await compileImports(importedDoc, href);

    // namespace-aware attributes
    const importedDocRoot = importedDoc.documentElement;
    const xsltDocRoot = xsltsheet.documentElement;
    for(const attr of importedDocRoot.attributes) {
      if(!xsltDocRoot.getAttributeNS(attr.namespaceURI,attr.localName)) {
        xsltDocRoot.setAttributeNS(attr.namespaceURI,attr.name,attr.value);
      }
    }

    // Move all children from the imported document to the main document.
    // Special case: skip duplicate parameters if they were already merged.
    let child = importedDocRoot.firstChild;
    while (child) {
      const next = child.nextSibling;
      if (isDuplicateParam(child, existingParamNames)) {
        child.remove();
      } else {
        if (child.localName === 'param' && child.namespaceURI === xslns) {
          existingParamNames.add(child.getAttribute('name'));
        }
        importElement.before(child);
      }
      child = next;
    }
    importElement.remove();
  }
  return xsltsheet;
}

const XSLTransform = async (xsltsheet, doc) => {
    const xproc = new XSLTProcessor();
    const compiled = await compileImports(xsltsheet);
    xproc.importStylesheet(compiled);
    return xproc.transformToDocument(doc);
};

const parseXML = str => {
    const parser = new DOMParser();
    const newd = parser.parseFromString(str,'text/xml');
    if(newd.documentElement.nodeName === 'parsererror')
        alert(`The XML file could not be loaded. Please contact your friendly local system administrator. Error: ${newd.documentElement.textContent}`);
    else
        return newd;
};

export { parseXML, XSLTransform };
