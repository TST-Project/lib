var Transliterate;
const setTransliterator = (obj) => Transliterate = obj;

const nextSibling = (node) => {
    let start = node;
    while(start) {
        const sib = start.nextSibling;
        if(sib) return sib;
        else start = start.parentElement; 
    }
    return null;
};
/*
const nextTextNode = (start) => {
    let next = nextSibling(start);
    while(next) {
        if(next.nodeType === 3) return next;
        else next = next.firstChild || nextSibling(next);
    }
    return null;
};

const prevSibling = (node) => {
    let start = node;
    while(start) {
        const sib = start.previousSibling;
        if(sib) return sib;
        else start = start.parentElement; 
    }
    return null;
};

const prevTextNode = (start) => {
    let prev = prevSibling(start);
    while(prev) {
        if(prev.nodeType === 3) return prev;
        else prev = prev.lastChild || prevSibling(prev);
    }
    return null;
};
*/
const countpos = (str, pos) => {
    if(pos === 0) {
        return str[0].match(/[\u00AD\s]/) ? 1 : 0;
    }
    let realn = 0;
    for(let n=0;n<str.length;n++) {
        if(realn === pos) {
            if(str[n].match(/[\u00AD\s]/))
                return n+1;
            else 
                return n;
        }
        if(str[n].match(/[\u00AD\s]/) === null)
           realn = realn + 1;
    }
    return str.length;
};

const findEls = (range) => {
    const container = range.cloneContents();
    if(container.firstElementChild) return true;
    return false;
};

const getIgnoreTags = par => {
    const ignorediv = par.querySelector('.ignoredtags');
    if(!ignorediv) return new Set();
    return new Set(
        [...ignorediv.querySelectorAll('.tagselector')].map(el => el.textContent)
    );
};

const highlight = {
    inline(targ) {
        const par = targ.closest('div.text-block');
        if(!par) return;

        const allleft = [...par.querySelectorAll('.lem-inline')];
        const pos = allleft.indexOf(targ);
        const right = par.parentElement.querySelector('.apparatus-block');
        const allright = right.querySelectorAll(':scope > .app > .lem');
        allright[pos].classList.add('highlit');
    },
    apparatus(targ) {
        const par = targ.closest('div.apparatus-block');
        if(!par) return;
        const left = par.parentElement.querySelector('.text-block'); // or .edition?
        if(targ.dataset.corresp) {
            const ignoretags = getIgnoreTags(par);
            if(document.getElementById('transbutton').lang === 'en') {
                Transliterate.revert(left);
            }
            highlightcoords(targ,left,ignoretags);
            if(document.getElementById('transbutton').lang === 'en') {
                Transliterate.refreshCache(left);
                Transliterate.activate(left);
            }
        }
        else {
            const allright = [...par.querySelectorAll(':scope > .app > .lem')];
            const pos = allright.indexOf(targ);
            const allleft = left.querySelectorAll('.lem-inline');
            if(allleft.length !== 0)
               allleft[pos].classList.add('highlit');
        }
    },
};

const rangeFromCoords = (positions, lem, target, ignoretags=new Set()) => {
    const range = document.createRange();

    const realNextSibling = (walker) => {
        let cur = walker.currentNode;
        while(cur) {
            const sib = walker.nextSibling();
            if(sib) return sib;
            cur = walker.parentNode();
        }
        return null;
    };

    const walker = document.createTreeWalker(target,NodeFilter.SHOW_ALL, { acceptNode() {return NodeFilter.FILTER_ACCEPT;}});
    let start = 0;
    let started = false;
    //let last;
    let cur = walker.nextNode();
    while(cur) {
        if(cur.nodeType === 1) {
            if(cur.classList.contains('choiceseg') && 
               cur !== cur.parentNode.firstChild) {

                cur = realNextSibling(walker);
                continue;
            }
            
            if(cur.classList.contains('ignored') || ignoretags.has(cur.dataset.teiname)) {
                cur = realNextSibling(walker);
                continue;
            }
        }
        
        else if(cur.nodeType === 3) {
            const nodecount = cur.data.trim().replaceAll(/[\s\u00AD]/g,'').length;
            const end = start + nodecount;
            if(!started && positions[0] <= end) {
                const realpos = countpos(cur.data,positions[0]-start);
                // TODO: if realpos === cur.data.length, move to beginning of next node
                // then if next node starts with a space, +1
                // then if the node consists only of spaces, move again to beginning of next node
                range.setStart(cur,realpos);
                started = true;
            }
            if(positions[1] <= end) {
                const realpos = countpos(cur.data,positions[1]-start);
                if(cur.data[realpos-1] === ' ')
                    range.setEnd(cur,realpos-1);
                else
                    range.setEnd(cur,realpos);
                break;
            }
            start = end;
            //last = cur;
        }
        cur = walker.nextNode();
    }
    //if(range.collapsed) range.setEnd(last,last.data.length);
    // shouldn't need this
    return range;
};

const highlightcoords = (lem,target,ignoretags) => {
    const multiple = lem.dataset.corresp.split(';').reverse();
    for(const coord of multiple) highlightcoord(coord.split(','), lem, target, ignoretags);
};

const wrongSeg = (txtnode) => {
    const ignored = txtnode.parentNode.closest('.ignored');
    if(ignored) return ignored;
    const el = txtnode.parentNode.closest('.choiceseg');
    return el && el !== el.parentNode.firstChild;
};

const highlightrange = (range,classname = 'highlit') => {
    const lemma = document.createElement('span');
    lemma.className = `${classname} temporary`;
    lemma.append(range.extractContents());
    if(lemma.innerHTML.trim() === '') return; // avoid highlighting blank spaces/lines

    range.insertNode(lemma);
    lemma.lang = lemma.parentElement.lang;
    return lemma;
};

const matchCounts = (alignment,m,pos='start') => {
    let matchcount = 0;
    for(let n=0;n<alignment[0].length;n++) {
        if(matchcount === m) {
            if(pos === 'start' && alignment[0][n] === 'G') n = n + 1; // |vēḻa_|vēṇ|, |vēḻam|veḷ|

            const line2 = alignment[1].slice(0,n);
            const matches = [...line2].reduce((acc, cur) => cur === 'M' ?  acc + 1 : acc,0);
            return matches;
        }
        if(alignment[0][n] === 'M') matchcount = matchcount + 1;
    }
    
    // no match; go to end of the block
    const matches = [...alignment[1]].reduce((acc, cur) => cur === 'M' ?  acc + 1 : acc,0); //-1;
    // why was there -1 here??
    return matches;
};

const highlightcoord = (positions, lem, target, ignoretags, highlightfn = highlightrange) => {
    // if there is an alignment, update coords 
    if(target.dataset.alignment) {
        const alignment = target.dataset.alignment.split(',');
        positions = [matchCounts(alignment,parseInt(positions[0]),'start'),
                     matchCounts(alignment,parseInt(positions[1]),'end')
                    ];
    }
    const range = rangeFromCoords(positions, lem, target, ignoretags);
    if(!findEls(range))
        return highlightfn(range);

    const toHighlight = [];
    const start = (range.startContainer.nodeType === 3) ?
        range.startContainer :
        range.startContainer.childNodes[range.startOffset];

    const end = (range.endContainer.nodeType === 3) ?
        range.endContainer :
        range.endContainer.childNodes[range.endOffset-1];

    if(start.nodeType === 3 && range.startOffset !== start.length && !wrongSeg(start)) {
        const textRange = document.createRange();
        textRange.setStart(start,range.startOffset);
        textRange.setEnd(start,start.length);
        toHighlight.push(textRange);
    }
    
    const getNextNode = (n) => n.firstChild || nextSibling(n);

    for(let node = getNextNode(start); node !== end; node = getNextNode(node)) {
        if(node.nodeType === 3 && !wrongSeg(node)) {
            const textRange = document.createRange();
            textRange.selectNode(node);
            toHighlight.push(textRange);
        }
    }

    if(end.nodeType === 3 && range.endOffset > 0 && !wrongSeg(end)) {
        const textRange = document.createRange();
        textRange.setStart(end,0);
        textRange.setEnd(end,range.endOffset);
        toHighlight.push(textRange);
    }
    
    const firsthighlit = highlightfn(toHighlight.shift());

    for(const hiNode of toHighlight)
        highlightfn(hiNode);
    target.normalize();
    return firsthighlit;
};

const unhighlight = (targ) => {
    let highlit = /*par*/document.querySelectorAll('.highlit');
    if(highlit.length === 0) return;
    
    targ = targ ? targ.closest('div.wide') : highlit[0].closest('div.wide');
    const par = targ.querySelector('.text-block'); // or .edition?
    if(!par) return;
    
    if(document.getElementById('transbutton').lang === 'en') {
        Transliterate.revert(par);
        highlit = document.querySelectorAll('.highlit'); // in case things changed (via jiggle)
    }
    
    for(const h of highlit) {
        if(h.classList.contains('temporary')) {
            while(h.firstChild)
                h.after(h.firstChild);
            h.remove();
        }
        else h.classList.remove('highlit');
    }
    par.normalize();
    Transliterate.refreshCache(par);
    
    if(document.getElementById('transbutton').lang === 'en')
        Transliterate.activate(par);
};

const switchReading = el => {
    if(el.querySelector('.rdg-alt')) return;
    const par = el.closest('.rdg') || el.closest('.app').querySelector('.lem');
    const id = el.dataset.id;
    //par.querySelector('.rdg-text').style.display = 'none';
    //par.querySelector(`.rdg-alt[data-wit~="${id}"]`).style.display = 'block';
    const rdgalt = par.querySelector(`.rdg-alt[data-wit~="${id}"]`).cloneNode(true);
    rdgalt.style.display = 'inline';
    el.appendChild(rdgalt);
};

const restoreReading = par => {
    /*
    par.querySelector('.rdg-text').style.display = 'inline';
    for(const alt of par.querySelectorAll('.rdg-alt'))
        alt.style.display = 'none';
    */
    par.querySelector('.rdg-alt')?.remove();
};

const Events = { 
    docMouseover(e) {
        const lem_inline = e.target.closest('.lem-inline');
        if(lem_inline) {
            highlight.inline(lem_inline);
            return;
        }
        const lem = e.target.closest('.lem');
        if(lem) {
            highlight.apparatus(lem);
            return;
        }
        const msid = e.target.closest('.mshover');
        if(msid) {
            switchReading(msid);
            msid.addEventListener('mouseleave',restoreReading.bind(null,msid),{once: true});
        }
        const anchor = e.target.closest('.anchor');
        if(anchor) {
            const note = document.querySelector(`[data-target='#${anchor.id}']`);
            if(note) {
                anchor.classList.add('highlit');
                note.classList.add('highlit');
                document.addEventListener('mouseout',() => {
                    anchor.classList.remove('highlit');
                    note.classList.remove('highlit');
                },{once: true});
            }
        }
        const note = e.target.closest('.anchored-note');
        if(note) {
            const anchor = document.querySelector(note.dataset.target);
            if(anchor) {
                anchor.classList.add('highlit');
                note.classList.add('highlit');
                document.addEventListener('mouseout',() => {
                    anchor.classList.remove('highlit');
                    note.classList.remove('highlit');
                },{once: true});
            }
        }
    },

    docMouseout(e) {
        if(e.target.closest('.lem') ||
           e.target.closest('.lem-inline'))
            unhighlight(e.target);
    },
    docClick(e) {
        const msid = e.target.closest('.mshover');
        if(msid) restoreReading.bind(msid);
    },
    toggleApparatus(e) {
        const apparatussvg = document.getElementById('apparatussvg');
        const translationsvg = document.getElementById('translationsvg');
        const apparati = document.querySelectorAll('.apparatus-block');

        if(!translationsvg.checkVisibility()) {
            for(const apparatus of apparati) {
                //apparatus.previousElementSibling.style.width = '60%';
                apparatus.parentNode.querySelector('.edition').classList.remove('nolemmaunderline');
                const translation = apparatus.parentNode.querySelector('.translation');
                if(translation) translation.classList.add('hidden');
                apparatus.classList.remove('hidden');
            }
            apparatussvg.style.display = 'none';
            translationsvg.style.display = 'block';
            translationsvg.parentNode.dataset.anno = 'translation';
        }
        else {
            for(const apparatus of apparati) {
                //apparatus.previousElementSibling.style.width = 'unset';
                apparatus.parentNode.querySelector('.edition').classList.add('nolemmaunderline');
                const translation = apparatus.parentNode.querySelector('.translation');
                if(translation) translation.classList.remove('hidden');
                apparatus.classList.add('hidden');
            }
            translationsvg.style.display = 'none';
            apparatussvg.style.display = 'block';
            translationsvg.parentNode.dataset.anno = 'apparatus of variants';
        }
    }
};

const init = () => {
    document.addEventListener('mouseover',Events.docMouseover);
    document.addEventListener('mouseout',Events.docMouseout);
    document.addEventListener('click',Events.docClick);

    const apparatusbutton = document.getElementById('apparatusbutton');
    apparatusbutton.addEventListener('click',Events.toggleApparatus);
    if(document.querySelector('.apparatus-block.hidden'))
        apparatusbutton.style.display = 'block';
};

const ApparatusViewer = {
    init: init,
    setTransliterator: setTransliterator,
};

export { ApparatusViewer };
