import fs from 'fs';
import xpath from 'xpath';
import jsdom from 'jsdom';

const make = {
    xml: (str) => {
        const dom = new jsdom.JSDOM('');
        const parser = new dom.window.DOMParser();
        return parser.parseFromString(str,'text/xml');
    },
    html: (str) => {
        return (new jsdom.JSDOM(str)).window.document;
    },
    header: (arr) => {
        const cells = arr.map(str => `<th>${str}</th>`).join('');
        return `<thead><tr id="head">${cells}</tr></thead>`;
    },
};

//const persDoc = new DOMParser().parseFromString( fs.readFileSync('../authority-files/authority/authority/persons_base.xml',{encoding:'utf-8'}) ).documentElement;
const persDoc = make.xml( fs.readFileSync('./authority-files/authority/authority/persons_base.xml',{encoding:'utf-8'}) );

const util = {
    innertext: el => {
        var synch, inner, milestone, placement;
        if(el.nodeName === 'seg') {
            milestone = util.milestone(el) || 
                el.closest('desc')?.querySelector('locus');
            placement = util.placement(el) || 
                el.closest('desc')?.getAttribute('subtype') || '';
            const text = el.closest('text');
            const desc = el.closest('desc');
            synch = text ? text.getAttribute('synch') :
                        desc ? desc.getAttribute('synch') :
                            '';
            inner = el.innerHTML;
        }
        else {
            const subtype = el.getAttribute('subtype') || '';
            milestone = el.querySelector('locus');
            placement = subtype.replace(/\s/g,', ').replace(/-/g,' ');
            synch = el.getAttribute('synch');
            inner = el.querySelector('q,quote')?.innerHTML || '';
        }
        return {inner: inner, synch: synch, milestone: milestone?.textContent || '', facs: milestone?.facs || '', placement: placement};
    },
    milestone: (el) => {
        const getUnit = (el) => {
            const m = el.ownerDocument.querySelector('extent > measure');
            if(m) return m.getAttribute('unit');
            return '';
        };

        var p = util.prev(el);
        while(p) {
            if(!p) return false;
            if(p.nodeName === 'text') return false;
            if(p.nodeName === 'pb' || 
                (p.nodeName === 'milestone' && check.isFolio(p.getAttribute('unit')) )
            ) {
                const content = (p.getAttribute('unit') || getUnit(p) || '') + ' ' + 
                                (p.getAttribute('n') || '');
                return {textContent: content, facs: p.getAttribute('facs')};
            }
            p = util.prev(p);
        }
    },

    placement: (el) => {
        const pp = el.firstChild;
        if(pp && pp.nodeType === 1 && pp.nodeName === 'milestone') {
            const attr = pp.getAttribute('unit');
            if(!check.isFolio(attr))
                return attr + ' ' + (pp.getAttribute('n') || '');
        }

        var p = util.prev(el);
        while(p) {
            if(!p) return '';
            if(p.nodeName === 'text') return '';
            if(p.nodeName === 'milestone') {
                if(check.isFolio(p.getAttribute('unit')) ) return ''; 
                const u = (p.getAttribute('unit') || '').replace(/-/g,' ');
                return u + ' ' + (p.getAttribute('n') || '');
            }
            p = util.prev(p);
        }
    },

    prev: (e)  => {
        if(e.previousElementSibling) return e.previousElementSibling;
        if(e.parentNode.previousElementSibling) {
            if(e.parentNode.previousElementSibling.lastChild)
                return e.parentNode.previousElementSibling.lastElementChild;
            else return e.parentNode.previousElementSibling;
        }
        return false;
    },

    personlookup: (str) => {

        const getStandard = (el) => el.closest('person').querySelector('persName[type="standard"]').textContent;

        const split = str.split(':',2);
        if(split.length > 1) {
            const result = xpath.select(`//*[local-name(.)="idno" and @type="${split[0]}" and text()="${split[1]}"]`,persDoc,true);
            if(result) return getStandard(result);
            else return false;
        }

        const result = xpath.select(`//*[local-name(.)="persName" and text()="${str}"]`,persDoc,true);
        if(result) return getStandard(result);
        else return false;
    },
};

const check = {
    isFolio: (str) => str === 'folio' || str === 'page' || str === 'plate',
};

export { util, make, check };
