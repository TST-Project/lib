import { Transliterate } from '../../js/transliterate.mjs';

const replaceEl = function(newdoc,par,parname,kidname,inplace = false) {
    const oldel = par.querySelector(`:scope > ${kidname}`);
    const newel = newdoc.querySelector(`${parname} > ${kidname}`);
    if(!newel) return;
    if(oldel) {
        if(inplace) par.replaceChild(newel,oldel);
        else {
            par.removeChild(oldel);
            par.appendChild(newel);
        }
    }
    else
        par.appendChild(newel);
};
const transliterateTitle = (doc,script) => {
    const allscripts = Transliterate.scripts();
    const pars = doc.querySelectorAll('unittitle[type="non-latin originel"]');
    for(const par of pars) {
        //const walker = doc.createTreeWalker(par,NodeFilter.SHOW_ALL);
        const walker = doc.createTreeWalker(par,4294967295);
        let curnode = walker.currentNode;
        curnode.lang = curnode.getAttribute('xml:lang') || 'en';
        while(curnode) {
            //if(curnode.nodeType === Node.ELEMENT_NODE) {
            if(curnode.nodeType === 1) {
                const nodelang = curnode.getAttribute('xml:lang');
                curnode.lang = nodelang || curnode.parentNode.lang;
            }
            //else if(curnode.nodeType === Node.TEXT_NODE) {
            else if(curnode.nodeType === 3) {
                if(curnode.parentNode.lang === 'ta')
                    curnode.data = Transliterate.to.tamil(curnode.data);
                else if(curnode.parentNode.lang === 'sa')
                    if(allscripts.has(script))
                        curnode.data = Transliterate.to[script](curnode.data);
            }
            curnode = walker.nextNode();
        }
        const newtxt = par.textContent.trim();
        par.innerHTML = '';
        par.append(newtxt);
    }
};

/*
const transliterateTitle = function(doc) {
    const els = doc.querySelectorAll('unittitle[type="non-latin originel"]');
    for(const el of els) {
        const toconverts = el.querySelectorAll('[xml:lang="ta"]');
        //const langs = el.querySelectorAll('[lang="sa"],[lang="ta"]');
        if(toconverts.length === 0) {
            el.remove();
        }
        else {
            for(const toconvert of toconverts) {
                toconvert.textContent = Transliterate.to.tamil(toconvert.textContent);
            }
            const newtxt = el.textContent.trim();
            el.innerHTML = '';
            el.appendChild(doc.createTextNode(newtxt));
        }
    }
};
*/
const convertFile = (indoc,outdoc) => {
    const eadheader = outdoc.querySelector('eadheader');
    if(eadheader) {
        replaceEl(indoc, eadheader,'eadheader','filedesc',true);
        replaceEl(indoc, eadheader,'eadheader','profiledesc',true);
    }
    const level = indoc.querySelector('archdesc[level="otherlevel"]') ? 'otherlevel' : 'item';
    const archname = `archdesc[level="${level}"]`;
    var archdesc = outdoc.querySelector(archname) || outdoc.querySelector('c');
    if(!archdesc && level === 'otherlevel') { // wasn't a collection before, change to collection
        archdesc = outdoc.querySelector('archdesc');
        archdesc.setAttribute('level','otherlevel');
    }
    replaceEl(indoc, archdesc,archname,'did',true);
    replaceEl(indoc, archdesc,archname,'scopecontent');
    replaceEl(indoc, archdesc,archname,'dsc');
    replaceEl(indoc, archdesc,archname,'bibliography');
    replaceEl(indoc, archdesc,archname,'custodhist');
    replaceEl(indoc, archdesc,archname,'acqinfo');
    replaceEl(indoc, archdesc,archname,'processinfo');

    return outdoc;
};

export { replaceEl, transliterateTitle, convertFile };
