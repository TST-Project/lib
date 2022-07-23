import { Sanscript } from './sanscript.mjs';
import { viewPos } from './viewpos.mjs';
import Hypher from './hypher.mjs';
import { hyphenation_ta } from './ta.mjs';
import { hyphenation_ta_Latn } from './ta-Latn.mjs';
import { hyphenation_sa } from './sa.mjs';
'use strict';

const Transliterate = (function() {
    const _state = {
        //curlang: 'en',
        //availlangs: ['en'],
        scriptToIso: new Map([
            ['tamil','Taml'],
            ['bengali','Beng'],
            ['devanagari','Deva'],
            ['grantha','Gran'],
            ['malayalam','Mlym'],
            ['newa','Newa'],
            ['sarada','Shrd'],
            ['telugu','Telu'],
            ['nandinagari','Nand']
        ]),
        //scriptnames: new Set(['bengali','devanagari','grantha','malayalam','newa','sarada','telugu','nandinagari']),
        //features: new Set(),
        //langselector: '[lang|="ta"],[lang|="sa"]',
        otherlangs: ['ta','sa'],
        //otherscripts: ['ta-Taml'],
        savedtext: new Map(),
        //cleanedcache: new Map(),
        parEl: null,
        hyphenator: {
            'ta-Taml': new Hypher(hyphenation_ta),
            'sa-Latn': new Hypher(hyphenation_sa),
            'ta-Latn': new Hypher(hyphenation_ta_Latn)
        },
        defaultSanscript: null,
        reverselangs: new Map([
            ['ta-Latn-t-ta-Taml','ta-Taml-t-ta-Latn'],
            ['ta-Taml-t-ta-Latn','ta-Latn-t-ta-Taml']
        ]),
    };
    
    _state.scriptnames = new Set(_state.scriptToIso.keys());
    _state.isonames = new Set(_state.scriptToIso.values());
    for(const val of _state.isonames) {
        _state.reverselangs.set(`sa-${val}-t-sa-Latn`,`sa-Latn-t-sa-${val}`);
        _state.reverselangs.set(`sa-Latn-t-sa-${val}`,`sa-${val}-t-sa-Latn`);
    }

    const init = function(par = document.body) {

        // reset state
        _state.parEl = par; 
        if(!_state.parEl.lang) _state.parEl.lang = 'en';

        // prepare transliteration functions
        const foundTamil = par.querySelector('[lang|="ta"]');
        const foundSanskrit = par.querySelector('[lang|="sa"]');
        if(!foundTamil && !foundSanskrit) return;

        if(foundSanskrit) {
            const scripttags = [...par.getElementsByClassName('record_scripts')];
            const defaultSanscript = getScript(scripttags);
            if(!defaultSanscript && !foundTamil) {
                // hyphenate text even if no transliteration available
                const walker = document.createTreeWalker(par,NodeFilter.SHOW_ALL);
                textLangWalker(walker);
                return;
            }
            else _state.defaultSanscript = defaultSanscript;
        }
       
        // use BCP47 RFC6497: https://datatracker.ietf.org/doc/html/rfc6497
        tagTextLang();

        // initialize button
        _state.button = document.getElementById('transbutton');
        button.init(foundTamil);
    };

    const button = {
        init(tamil) {
            if(tamil) {
                _state.button.textContent = to.tamil('a');
                _state.button.lang = 'ta-Taml';
            }
            else {
                _state.button.textContent = to[_state.defaultSanscript]('a');
                _state.button.lang = `sa-${_state.scriptToIso.get(_state.defaultSanscript)}`;
            }
            _state.button.addEventListener('click',events.transClick);
            _state.button.style.display = 'block';
        },
        revert() {
            _state.button.textContent = _state.button.dataset.oldcontent;
            _state.button.lang = _state.button.dataset.oldlang;
        },
        transliterate() {
            _state.button.dataset.oldcontent = _state.button.textContent;
            _state.button.dataset.oldlang = _state.button.lang;
            _state.button.textContent = 'A';
            _state.button.lang = 'en';
        },
    };

    const cache = {
        set(txtnode) {
            // don't break before daṇḍa, or between daṇḍa and numeral/puṣpikā
            const nbsp = String.fromCodePoint('0x0A0');
            const txt = txtnode.data
                .replace(/\s+\|/g,`${nbsp}|`)
                .replace(/\|\s+(?=[\d❈꣸৽])/g,`|${nbsp}`);
            
            const getShortLang = (node) => {
                const s = node.lang.split('-t-');
                if(node.classList.contains('originalscript'))
                    return s[1];
                else
                    return s[0];
            };
            // hyphenate according to script (Tamil or Romanized)
            const lang = txtnode.parentNode.lang;
            const shortlang = getShortLang(txtnode.parentNode);
            if(_state.hyphenator.hasOwnProperty(shortlang)) {
                const hyphenated = _state.hyphenator[shortlang].hyphenateText(txt);
                _state.savedtext.set(txtnode,hyphenated);
                // convert Tamil (and others) to Roman
                if(shortlang === 'ta-Taml') {
                    // TODO: also deal with 'sa-Beng', 'sa-Deva', etc.
                    return to.iast(hyphenated);
                }
                else return hyphenated;
            }
            else {
                _state.savedtext.set(txtnode,txt);
                return txt;
            }
        },

        get: (txtnode) => //_state.cleanedcache.has(txtnode) ? 
                          //  _state.cleanedcache.get(txtnode) :
                            _state.savedtext.has(txtnode) ?
                               _state.savedtext.get(txtnode) :
                               txtnode.data,
    };
   
    const getScript = (handDescs) => {
        if(handDescs.length === 0) return _state.defaultSanscript;

        const scripts = [...handDescs].reduce((acc,cur) => {
            for(const s of cur.dataset.script.split(' '))
                acc.add(s);
                return acc;
        },new Set());
        
        // just take first script, or Tamil (Grantha) if necessary
        let maybetamil = false;
        for(const s of scripts) {
            if(s === 'tamil') maybetamil = true;
            if(_state.scriptnames.has(s)) return s;
        }
        return maybetamil ? 'grantha' : false;
    }

    const tagTextLang = () => {
        // tag codicological units associated with a script first
        const synchs = _state.parEl.querySelectorAll('[data-synch]');
        for(const synch of synchs) {
            synch.lang = synch.lang ? synch.lang : 'en';
            const units = synch.dataset.synch.split(' ');
            const scriptcode = (() => {
                // if this is a handDesc element
                if(synch.classList.contains('record_scripts'))
                    return _state.scriptToIso.get(synch.dataset.script.split(' ')[0]);
                // otherwise
                const unitselector = units.map(s => `li.record_scripts[data-synch~='${s}']`);
                const handDescs = _state.parEl.querySelectorAll(unitselector);
                const script = getScript(handDescs) || _state.defaultSanscript;
                return _state.scriptToIso.get(script);
            })();
            
            const walker = document.createTreeWalker(synch,NodeFilter.SHOW_ALL);
            textLangWalker(walker,scriptcode);
        }

        // tag rest of the document
        const isodefault = _state.scriptToIso.get(_state.defaultSanscript);
        const walker = document.createTreeWalker(_state.parEl,NodeFilter.SHOW_ALL, 
            { acceptNode(node) { return node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-synch') ?
                NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT} });
        textLangWalker(walker,isodefault);
    };
    
    const textLangWalker = (walker,scriptcode) => {
        //TODO: hyphenate the text if scriptcode is undefined
        let curnode = walker.currentNode;
        while(curnode) {
            if(curnode.nodeType === Node.ELEMENT_NODE) {
                if(curnode.parentNode.classList.contains('originalscript'))
                    curnode.classList.add('originalscript');
                if(curnode.lang) {
                // case 1: sa-Latn[-t-XXXX]
                // case 2: sa-XXXX
                // case 3: sa
                // case 4: undefined
                // what about script features? (e.g. valapalagilaka)
                    if(curnode.lang.startsWith('sa-')) {
                        if(!curnode.lang.startsWith('sa-Latn')) {
                            // Sanskrit written in a specific script
                            curnode.lang = curnode.lang + '-t-sa-Latn';
                            curnode.classList.add('originalscript');
                        }
                    }
                    else if(curnode.lang === 'sa') {
                        // assume transliterated in IAST
                        if(curnode.parentNode.lang.startsWith('sa-'))
                            // script is specified by parent
                            curnode.lang = curnode.parentNode.lang;
                            curnode.lang = scriptcode ? 
                                `sa-Latn-t-sa-${scriptcode}` : 'sa-Latn';
                    }
                    // what about Tamil in other scripts?
                    else if(curnode.lang === 'ta') {
                        curnode.lang = 'ta-Latn-t-ta-Taml';
                    }
                    else if(curnode.lang === 'ta-Taml') {
                        curnode.classList.add('originalscript');
                        curnode.lang = 'ta-Latn-t-ta-Taml';
                    }
                }
                else {
                    curnode.lang = curnode.parentNode.lang;
                }
            }
            else if(curnode.nodeType === Node.TEXT_NODE) {
                const curlang = curnode.parentNode.lang.split('-')[0];
                if(_state.otherlangs.includes(curlang)) {
                    curnode.data = cache.set(curnode);
                }
            }
            curnode = walker.nextNode();
        }
    };

    const events = {
        transClick(e) {
            const vpos = viewPos.getVP(_state.parEl);
            cycleScript();
            viewPos.setVP(_state.parEl,vpos);
        },
    };

    const cycleScript = () => {
        if(_state.button.lang === 'en') {
            revertText();

            const subst = _state.parEl.querySelectorAll('span.subst, span.choice, span.expan');
            for(const s of subst)
                unjiggle(s);
            button.revert();
        }
        else {
            const subst = _state.parEl.querySelectorAll('span.subst,span.choice,span.expan');
            //const subst = document.querySelectorAll(`span.subst[lang|="${tolang.lang}"],span.choice[lang|="${tolang.lang}"],span.expan[lang|="${tolang.lang}"`);
            for(const s of subst)
                jiggle(s);

            textWalk();

            button.transliterate();
        }
    };

    const revertText = () => {
        const puncs = _state.parEl.getElementsByClassName('invisible');
        for(const p of puncs) p.classList.remove('off');
         
        const walker = document.createTreeWalker(_state.parEl,NodeFilter.SHOW_ALL);
        var curnode = walker.currentNode;
        while(curnode) {
            if(curnode.nodeType === Node.ELEMENT_NODE) {
                const rev = _state.reverselangs.get(curnode.lang);
                if(rev) curnode.lang = rev;
            }
            else if(curnode.nodeType === Node.TEXT_NODE) {
                // lang attribute has already been reversed (hence take index 1)
                const fromLatn = curnode.parentNode.lang.split('-')[1];
                if(fromLatn === 'Latn') {
                    const result = (() => {
                        // bypass cleanedcache
                        const cached = cache.get(curnode);
                        if(curnode.parentNode.classList.contains('originalscript'))
                            //TODO: also do for sa-Beng, sa-Deva, etc.
                            return to.iast(cached);
                        else
                            return cached;
                    })();
                    if(result !== undefined) curnode.data = result;
                }
            }
            curnode = walker.nextNode();
        }
    };

    const textWalk = () => {
        //const puncs = _state.parEl.querySelectorAll(`.invisible[lang=${langcode}]`);
        const puncs = _state.parEl.getElementsByClassName('invisible');
        for(const p of puncs) {

            if(p.classList.contains('off')) continue;
            // if switching between brahmic scripts, switch everything back on first?
            p.classList.add('off');
            const prev = p.previousSibling;
            const next = p.nextSibling;
            if(prev && (prev.nodeType === Node.TEXT_NODE) &&
               next && (next.nodeType === Node.TEXT_NODE)) {
                next.data = prev.data + next.data;
                prev.data = '';
                //_state.cleanedcache.set(next,next.data);
                //_state.cleanedcache.set(prev,'');
            }
        }
         
        const walker = document.createTreeWalker(_state.parEl,NodeFilter.SHOW_ALL);
        var curnode = walker.currentNode;
        while(curnode) {
            if(curnode.nodeType === Node.ELEMENT_NODE) {
                const rev = _state.reverselangs.get(curnode.lang);
                if(rev) curnode.lang = rev;
            }
            else if(curnode.nodeType === Node.TEXT_NODE) {
                const [lang, script] = (() => {
                    const s = curnode.parentNode.lang.split('-');
                    return [s[0],s[1]];
                })();
                if(_state.otherlangs.includes(lang)) {
                    const scriptfunc = (() => {
                        if(to.hasOwnProperty(script))
                            return to[script];
                        return null;
                    })();
                    const result = (() => {
                        if(curnode.parentElement.dataset.hasOwnProperty('glyph'))
                            return curnode.parentElement.dataset.glyph;
                        if(curnode.parentElement.classList.contains('originalscript'))
                            return cache.get(curnode);
                        if(!scriptfunc) return undefined;
                        //const cached = cache.get(curnode);
                        //return scriptfunc(cached);
                        return scriptfunc(curnode.data);
                    })();
                    if(result !== undefined) curnode.data = result;
                }
            }
            curnode = walker.nextNode();
        }
    };

    const to = {

        smush: function(text,placeholder,d_conv = false) {
            // d_conv is DHARMA convention
            if(!d_conv) text = text.toLowerCase();
        
            // remove space between a word that ends in a consonant and a word that begins with a vowel
            text = text.replace(/([ḍdrmvynhs]) ([aāiīuūṛeēoōêô])/g, '$1$2'+placeholder);
        
            if(d_conv) text = text.toLowerCase();
        
            // remove space between a word that ends in a consonant and a word that begins with a consonant
            text = text.replace(/([kgcjñḍtdnpbmrlyẏvśṣsṙ]) ([kgcjṭḍtdnpbmyẏrlvśṣshḻ])/g, '$1'+placeholder+'$2');

            // join final o/e/ā and avagraha/anusvāra
            text = text.replace(/([oōeēā]) ([ṃ'])/g,'$1'+placeholder+'$2');

            text = text.replace(/ü/g,'\u200Cu');
            text = text.replace(/ï/g,'\u200Ci');

            text = text.replace(/_{1,2}(?=\s*)/g, function(match) {
                if(match === '__') return '\u200D';
                else if(match === '_') return '\u200C';
            });

            return text;
        },

        iast: function(text,from) {
            const f = from || 'tamil';
            return Sanscript.t(text,f,'iast')
                .replace(/^⁰|([^\d⁰])⁰/g,'$1¹⁰')
                .replace(/l̥/g,'ḷ');
        },
        
        tamil: function(text/*,placeholder*/) {
            /*const pl = placeholder || '';
            const txt = to.smush(text,pl);
            return Sanscript.t(txt,'iast','tamil');*/
            const grv = new Map([
                ['\u0B82','\u{11300}'],
                ['\u0BBE','\u{1133E}'],
                ['\u0BBF','\u{1133F}'],
                ['\u0BC0','\u{11340}'],
                ['\u0BC1','\u{11341}'],
                ['\u0BC2','\u{11342}'],
                ['\u0BC6','\u{11347}'],
                ['\u0BC7','\u{11347}'],
                ['\u0BC8','\u{11348}'],
                ['\u0BCA','\u{1134B}'],
                ['\u0BCB','\u{1134B}'],
                ['\u0BCC','\u{1134C}'],
                ['\u0BCD','\u{1134D}'],
                ['\u0BD7','\u{11357}']
            ]);
            const grc = ['\u{11316}','\u{11317}','\u{11318}','\u{1131B}','\u{1131D}','\u{11320}','\u{11321}','\u{11322}','\u{11325}','\u{11326}','\u{11327}','\u{1132B}','\u{1132C}','\u{1132D}'];

            const smushed = text
                .replace(/([kṅcñṭṇtnpmyrlvḻḷṟṉ])\s+([aāiīuūeēoō])/g, '$1$2')
                .replace(/ḷ/g,'l̥')
                .replace(/(^|\s)_ā/g,'$1\u0B85\u200D\u0BBE')
                .replace(/(\S)·/g,'$1\u200C')
                .toLowerCase();
            const rgex = new RegExp(`([${grc.join('')}])([${[...grv.keys()].join('')}])`,'g');
            const pretext = Sanscript.t(smushed,'iast','tamil');
            return pretext.replace(rgex, function(m,p1,p2) {
                return p1+grv.get(p2); 
            });
        },
        grantha: function(txt) {
            const grv = new Map([
                ['\u{11300}','\u0B82'],
                ['\u{1133E}','\u0BBE'],
                ['\u{1133F}','\u0BBF'],
                ['\u{11340}','\u0BC0'],
                ['\u{11341}','\u0BC1'],
                ['\u{11342}','\u0BC2'],
                ['\u{11347}','\u0BC6'],
                ['\u{11348}','\u0BC8'],
                ['\u{1134B}','\u0BCA'],
                ['\u{1134C}','\u0BCC'],
                ['\u{1134D}','\u0BCD'],
                ['\u{11357}','\u0BD7']
            ]);
            const tmc = ['\u0BA9','\u0BB1','\u0BB3','\u0BB4'];
            const rgex = new RegExp(`([${tmc.join('')}])([${[...grv.keys()].join('')}])`,'gu');
            //const smushed = txt
            //    .replace(/([kṅcñṭṇtnpmyrlvḻ])\s+([aāiīuūeēoō])/g, '$1$2')
            //    .toLowerCase()
            const smushed = to.smush(txt,'',true)
                .replace(/e/g,'ē')
                .replace(/o(?![ṁḿ])/g,'ō')
                .replace(/ḿ/g,'ṁ') // no Jaina oṃkāra
                .replace(/(\S)·/g,'$1\u200C');
                //.replace(/ḷ/g,'l̥');
            const pretext = Sanscript.t(smushed,'iast','grantha');
            return pretext.replace(rgex, function(m,p1,p2) {
                return p1+grv.get(p2); 
            });
        },
        malayalam: function(txt) {
            const chillu = {
                'ക':'ൿ',
                'ത':'ൽ',
                'ന':'ൻ',
                'മ':'ൔ',
                'ര':'ർ',
            };

            const smushed = to.smush(txt,'',true)
                .replace(/(^|\s)_ā/,'$1\u0D3D\u200D\u0D3E')
                //.replace(/(^|\s)_r/,"$1\u0D3D\u200D\u0D30\u0D4D");
                //FIXME (replaced by chillu r right now)
                .replace(/(\S)·/g,'$1\u200C');
            
            const newtxt = Sanscript.t(smushed,'iast','malayalam')
                // use chillu final consonants	
                .replace(/([കതനമര])്(?![^\s\u200C,—’―])/g, function(match,p1) {
                    return chillu[p1];
                });
	
            /*
            const replacedtxt = _state.features.has('dotReph') ?
                // use dot reph
                newtxt.replace(/(^|[^്])ര്(?=\S)/g,'$1ൎ') :
                newtxt;
            */
            const replacedtxt = newtxt.replace(/(^|[^്])ര്(?=\S)/g,'$1ൎ');

            return replacedtxt;
        },
        
        devanagari: function(txt,placeholder) {

            const pretext = txt.replace(/ṙ/g, 'r')
                .replace(/e/g,'ē')
                .replace(/o(?![ṁḿ])/g,'ō')
                .replace(/([^aāiīuūeēoōṛṝḷḹ])ṃ/,'$1\'\u200Dṃ') // standalone anusvāra
                .replace(/([^aāiīuūeēoōṛṝḷḹ])ḥ/,'$1\'\u200Dḥ') // standalone visarga
                .replace(/(^|\s)_y/,'$1\'\u200Dy') // half-form of ya
                .replace(/(^|\s)_ā/g,'$1\u093D\u200D\u093E')
                .replace(/(^|\s)_r/g,'$1\u093D\u200D\u0930\u094D');

            const smushed = to.smush(pretext, (placeholder || '') );

            const text = Sanscript.t(smushed,'iast','devanagari')
                .replace(/¯/g, 'ꣻ');

            return text;
        },

        bengali: function(txt,placeholder) {

            const pretext = txt.replace(/ṙ/g, 'r')
                .replace(/e/g,'ē')
                .replace(/o(?![ṁḿ])/g,'ō')
                .replace(/(^|\s)_ā/g,'$1\u093D\u200D\u093E')
                .replace(/(^|\s)_r/g,'$1\u093D\u200D\u0930\u094D');

            const smushed = to.smush(pretext, (placeholder || '') );

            const text = Sanscript.t(smushed,'iast','bengali')
                .replace(/¯/g, 'ꣻ')
                .replace(/ত্(?=\s)|ত্$/g,'ৎ');
            return text;
        },

        telugu: function(txt,placeholder) {

            const pretext = txt.replace(/(^|\s)_ā/,'$1\u0C3D\u200D\u0C3E')
                .replace(/(^|\s)_r/,'$1\u0C3D\u200D\u0C30\u0C4D');
            // FIXME: should be moved to the right of the following consonant

            const smushedtext = to.smush(pretext,(placeholder || ''));        
            //const replacedtext = _state.features.has('valapalagilaka') ?
            //    smushedtext.replace(/r(?=[kgcjṭḍṇtdnpbmyvlh])/,'ṙ') : smushedtext;
            const replacedtext = smushedtext.replace(/r(?=[kgcjṭḍṇtdnpbmyvlh])/,'ṙ');

            const posttext = replacedtext.replace(/ê/g,'e') // no pṛṣṭhamātrās
                .replace(/ô/g,'o') // same with o
                .replace(/ṙ/g,'r\u200D') // valapalagilaka
                //.replace(/ṁ/g,'ṃ') // no telugu oṃkāra sign
                .replace(/ḿ/g,'ṃ')
                .replace(/î/g,'i') // no pṛṣṭhamātrās
                .replace(/û/g,'u');

            return Sanscript.t(posttext,'iast','telugu');
        },
        
        newa: function(txt,placeholder) {

            const pretext = txt.replace(/ṙ/g, 'r')
                .replace(/e/g,'ē')
                .replace(/o(?![ṁḿ])/g,'ō')
                .replace(/(^|\s)_ā/g,'$1\u093D\u200D\u093E')
                .replace(/(^|\s)_r/g,'$1\u093D\u200D\u0930\u094D');

            const smushed = to.smush(pretext, (placeholder || '') );

            const text = Sanscript.t(smushed,'iast','newa')
                .replace(/¯/g, 'ꣻ');
            return text;
        },

        sarada: function(txt,placeholder) {

            const pretext = txt.replace(/ṙ/g, 'r')
                .replace(/e/g,'ē')
                .replace(/o(?![ṁḿ])/g,'ō')
                .replace(/(^|\s)_ā/g,'$1\u093D\u200D\u093E')
                .replace(/(^|\s)_r/g,'$1\u093D\u200D\u0930\u094D');

            const smushed = to.smush(pretext, (placeholder || '') );

            const text = Sanscript.t(smushed,'iast','sarada')
                .replace(/¯/g, 'ꣻ');
            return text;
        },

        nandinagari: function(txt,placeholder) {

            const pretext = txt.replace(/ṙ/g, 'r')
                .replace(/e/g,'ē')
                .replace(/o(?![ṁḿ])/g,'ō');

            const smushed = to.smush(pretext, (placeholder || '') );

            const text = Sanscript.t(smushed,'iast','nandinagari')
                .replace(/¯/g, '\u{119E3}');
            return text;
        },
    };
    
    for(const [key, val] of _state.scriptToIso) {
        to[val] = to[key];
    }
    
    const jiggle = function(node/*,script,lang*/) {
        if(node.firstChild.nodeType !== 3 && node.lastChild.nodeType !== 3) 
            return;
        
        unjiggle(node);
        
        const [lang,script] = (() => {
            const s = node.lang.split('-');
            return [s[0],s[s.length - 1]];
        })();
        
        if(!node.hasOwnProperty('origNode'))
            node.origNode = node.cloneNode(true);

        const kids = node.childNodes;
        const starts_with_vowel = /^[aāiīuūeoêôṛṝḷṃḥ]/;
        const ends_with_consonant = /[kgṅcjñṭḍṇtdnpbmyrlvṣśsh]$/;

        const telugu_vowels = ['ā','i','ī','e','o','_','ai','au'];
        const telu_cons_headstroke = ['h','k','ś','y','g','gh','c','ch','jh','ṭh','ḍ','ḍh','t','th','d','dh','n','p','ph','bh','m','r','ḻ','v','ṣ','s'];
        var telugu_del_headstroke = false;
        var telugu_kids = [];
        var add_at_beginning = [];
        const starts_with_text = (kids[0].nodeType === 3);

        for (let kid of kids) {
            if(kid.nodeType > 3) continue;

            const txt = kid.textContent.trim();
            if(txt === '') continue;
            if(txt === 'a') { 
                kid.textContent = '';
                continue;
            }
            if(txt === 'aḥ') {
                kid.textContent = 'ḥ';
                continue;
            }

            if(txt.match(ends_with_consonant)) {
                // add 'a' if node ends in a consonant
                const last_txt = findTextNode(kid,true);
                last_txt.textContent = last_txt.textContent.replace(/\s+$/,'') + 'a';
                if(script === 'Telu' &&
               telu_cons_headstroke.indexOf(txt) >= 0) {
                // if there's a vowel mark in the substitution, 
                // remove the headstroke from any consonants
                    telugu_kids.push(kid);
                }
            }
        
            // case 1, use aalt:
            // ta<subst>d <del>ip</del><add>it</add>i</subst>
            // case 2, use aalt:
            // <subst>d <del>apy </del><add>ity </add>i</subst>va
            // case 3, no aalt:
            // <subst><del>apy </del><add>ity </add>i</subst>va
        
            // use aalt if node is a text node
            if(kid === node.lastChild && kid.nodeType === 3) {
                const cap = document.createElement('span');
                cap.appendChild(kid.cloneNode(false));
                node.replaceChild(cap,kid);
                kid = cap; // redefines 'kid'
                //kid.classList.add('aalt',lang,script);
                kid.classList.add('aalt');
                kid.lang = node.lang;
            }
            else if(starts_with_text) {
            // use aalt if node starts with a vowel
            // or if there's a dangling consonant
                if( (kid.nodeType === 1 && txt.match(starts_with_vowel)) || 
                    (kid.nodeType === 1 && ends_with_consonant))
                    kid.classList.add('aalt');
            }
            switch (script) {
            case 'Deva':
            case 'Nand':
                if(txt === 'i') 
                    add_at_beginning.unshift(kid);
                else if(txt === 'ê') {
                    kid.classList.remove('aalt');
                    kid.classList.add('cv01');
                    add_at_beginning.unshift(kid);
                }
                else if(txt === 'ô') {
                    const new_e = kid.cloneNode(true);
                    replaceTextInNode('ô','ê',new_e);
                    new_e.classList.remove('aalt');
                    new_e.classList.add('cv01');
                    add_at_beginning.unshift(new_e);
                    replaceTextInNode('ô','ā',kid);
                }
                else if(txt === 'aî') {
                    const new_e = kid.cloneNode(true);
                    replaceTextInNode('aî','ê',new_e);
                    new_e.classList.remove('aalt');
                    new_e.classList.add('cv01');
                    add_at_beginning.unshift(new_e);
                    replaceTextInNode('aî','e',kid);
                }
                else if(txt === 'aû') {
                    const new_e = kid.cloneNode(true);
                    replaceTextInNode('aû','ê',new_e);
                    new_e.classList.remove('aalt');
                    new_e.classList.add('cv01');
                    add_at_beginning.unshift(new_e);
                    replaceTextInNode('aû','o',kid);
                }
                break;
            case 'Beng':
            case 'Newa':
            case 'Shrd':
                if(txt === 'i') 
                    add_at_beginning.unshift(kid);
                else if(txt === 'e' || txt === 'ai') {
                    add_at_beginning.unshift(kid);
                }
                else if(txt === 'o') {
                    const new_e = kid.cloneNode(true);
                    replaceTextInNode('o','e',new_e);
                    add_at_beginning.unshift(new_e);
                    replaceTextInNode('o','ā',kid);
                }
                else if(txt === 'au') {
                    const new_e = kid.cloneNode(true);
                    replaceTextInNode('au','e',new_e);
                    add_at_beginning.unshift(new_e);
                }
                break;
            case 'Gran':
            case 'Taml':
            case 'Mlym':
                if(txt === 'e' || txt === 'ē' || txt === 'ê' || 
                   txt === 'ai' || txt === 'aî')  {
                    add_at_beginning.unshift(kid);
                }
                else if(txt === 'o' || txt === 'ô') {
                    const new_e = kid.cloneNode(true);
                    replaceTextInNode(/[oōô]/,'e',new_e);
                    add_at_beginning.unshift(new_e);
                    replaceTextInNode(/[oōô]/,'ā',kid);
                }
                else if(txt === 'ō') {
                    const new_e = kid.cloneNode(true);
                    replaceTextInNode(/ō/,'ē',new_e);
                    add_at_beginning.unshift(new_e);
                    replaceTextInNode(/ō/,'ā',kid);
                }
                break;
            case 'Telu':
                if(!telugu_del_headstroke &&
                   telugu_vowels.indexOf(txt) >= 0)
                    
                    telugu_del_headstroke = true;
                break;

            }
        } // end for let kid of kids

        for (const el of add_at_beginning) {
            node.insertBefore(el,node.firstChild);
        }

        if(telugu_del_headstroke) {
            for (const el of telugu_kids) {
                const lasttxtnode = findTextNode(el,true);
                lasttxtnode.textContent = lasttxtnode.textContent + '\u200D\u0C4D';
                cache.set(lasttxtnode);
            }
        }
        
        // cache text again since elements are moved around
        const walker = document.createTreeWalker(node,NodeFilter.SHOW_TEXT,null,false);
        while(walker.nextNode()) cache.set(walker.currentNode);
    };
    
    const unjiggle = function(node) {
        if(node.hasOwnProperty('origNode'))
            node.replaceWith(node.origNode);
    };

    const findTextNode  = function(node,last = false) {
        if(node.nodeType === 3) return node;
        const walker = document.createTreeWalker(node,NodeFilter.SHOW_TEXT,null,false);
        if(!last) return walker.nextNode;
        else {
            let txt;
            while(walker.nextNode())
                txt = walker.currentNode;
            return txt;
        }
    };

    const replaceTextInNode = function(text, replace, node) {
        const walker = document.createTreeWalker(node,NodeFilter.SHOW_TEXT,null,false);
        while(walker.nextNode()) {
            const cur_txt = walker.currentNode.textContent;
            if(cur_txt.match(text))
                walker.currentNode.textContent = replace;
        }
    };
    
    return {
        init: init,
        to: to,
        scripts: function() { return _state.scriptnames},
    };
}());

export { Transliterate };
