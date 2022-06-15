import fs from 'fs';
import xlsx from 'xlsx';
import SaxonJS from 'saxon-js';
import { Sanscript } from './sanscript.mjs';
import { util, make, check } from './utils.mjs';

const xsltSheet = fs.readFileSync('./lib/util/xslt/tei-to-html-reduced.json',{encoding:'utf-8'});
const templatestr = fs.readFileSync('./lib/util/template.html',{encoding:'utf8'});

const output = {
    index: (data, opts) => {
        const isMSPart = (str) => {
            const dot = /\d\.\d/.test(str);
            const letter = /\d[a-z]$/.test(str);
            if(dot && letter) return ' class="subsubpart"';
            if(dot || letter) return ' class="subpart"';
            else return '';
        };
        const template = make.html(templatestr);
        const title = template.querySelector('title');
        const ptitle = opts && opts.name ? opts.name[0].toUpperCase() + opts.name.slice(1) : 'Manuscripts';
        title.textContent = `${title.textContent}: ${ptitle}`;
        const table = template.getElementById('index');
        const thead = opts && opts.prefix ? 
            make.header(['Old Shelfmark','New Shelfmark','Repository','Title','Material','Extent','Width (mm)','Height (mm)','Date','Images']) :
            make.header(['Shelfmark','Repository','Title','Material','Extent','Width (mm)','Height (mm)','Date','Images']);

        const tstr = data.reduce((acc, cur) => {

            const poststr = 
`  <td>${cur.repo}</td>
  <td>${cur.title}</td>
  <td>${cur.material}</td>
  <td data-content="${cur.extent[0]}">${cur.extent[1]}</td>
  <td data-content="${cur.width.replace(/^-|-$/,'')}">${cur.width}</td>
  <td data-content="${cur.height.replace(/^-|-$/,'')}">${cur.height}</td>
  <td data-content="${cur.date[1]}">${cur.date[0]}</td>
  <td class="smallcaps">${cur.images}</td>
</tr>`;

            if(!opts || !opts.prefix) {
                return acc +            
`<tr>
  <th data-content="${cur.cote.sort}"${isMSPart(cur.cote.text)}><a href="${cur.fname}">${cur.cote.text}</a></th>` + poststr;
            }

            // with prefix
            const oldcote = ((idnos) => {
                for(const idno of idnos) {
                    const txt = idno.textContent;
                    if(txt.startsWith(opts.prefix))
                        return txt;
                }
                return '';
            })(cur.altcotes);

            const hascollector = (() => {
                if(!opts || !opts.keys) return false;
                for(const key of opts.keys)
                    if(cur.collectors.has(key)) return true;
                return false;
            })();

            if(!oldcote && !hascollector) return acc;

            const oldsort = oldcote.replace(/\d+/g,((match) => {
                return match.padStart(4,'0');
            }));
 
            return acc +
`<tr>
  <th data-content="${oldsort}"${isMSPart(cur.cote.text)}><a href="${cur.fname}">${oldcote}</th>
  <td data-content="${cur.cote.sort}"${isMSPart(cur.cote.text)}>${cur.cote.text}</td>` + poststr;
        },'');

    table.innerHTML = `${thead}<tbody>${tstr}</tbody>`;

    const ths = table.querySelectorAll('th');
    ths[0].classList.add('sorttable_alphanum');
    if(opts && opts.prefix) ths[1].classList.add('sorttable_alphanum');

    const fname = opts && opts.prefix ?
        opts.prefix.toLowerCase() + '.html' :
        'index.html';
    fs.writeFile(`../${fname}`,template.documentElement.outerHTML,{encoding: 'utf8'},function(){return;});
    },

    paratexts: (data, opts) => {
        
        const ptitle = opts.name ? opts.name[0].toUpperCase() + opts.name.slice(1) : 'Paratexts';
        const pprop = opts.prop;
        const pfilename = opts.name.replace(/\s+/g, '_') + '.html';
    
        const predux = function(acc,cur,cur1) {
            
            const ret = util.innertext(cur);
            const inner = ret.inner;
            const placement = ret.placement;
            const synch = ret.synch;
            const milestone = ret.facs ?
                `<a href="${cur1.fname}?facs=${ret.facs}">${ret.milestone}</a>` :
                ret.milestone;

            const unit = synch ? synch.replace(/^#/,'') : '';
            const processed = SaxonJS.transform({
                stylesheetText: xsltSheet,
                sourceText: '<TEI xmlns="http://www.tei-c.org/ns/1.0">'+inner+'</TEI>',
                destination: 'serialized'},'sync');
            const res = processed.principalResult || '';
            const txt = Sanscript.t(
                res.replace(/[\n\s]+/g,' ').replace(/\s%nobreak%/g,'').trim(),
                'tamil','iast');
            return acc + 
                `<tr>
                <td>
                ${txt}
                </td>
                <td><a href="${cur1.fname}">${cur1.cote.text}</a></td>
                <td>
                ${cur1.repo}
                </td>
                <td>
                ${cur1.title}
                </td>
                <td>
                ${unit}
                </td>
                <td>
                ${milestone}
                </td>
                <td>
                ${placement}
                </td>
                </tr>\n`;
        };
        
        const template = make.html(templatestr);

        const title = template.querySelector('title');
        title.textContent = `${title.textContent}: ${ptitle}`;

        const table = template.getElementById('index');
        const tstr = data.reduce((acc, cur) => {
            if(cur[pprop].length > 0) {
                const lines = [...cur[pprop]].reduce((acc2,cur2) => predux(acc2,cur2,cur),'');
                return acc + lines;
            }
            else return acc;
        },'');
        const thead = make.header([ptitle,'Shelfmark','Repository','Title','Unit','Page/folio','Placement']);
        table.innerHTML = `${thead}<tbody>${tstr}</tbody>`;
        table.querySelectorAll('th')[1].classList.add('sorttable_alphanum');
        fs.writeFile(`../${pfilename}`,template.documentElement.outerHTML,{encoding: 'utf8'},function(){return;});
    },
   
    xslx: (data,opts) => {

        const xslx_Sheet = fs.readFileSync('./lib/util/xslt/blessings-xlsx.json',{encoding:'utf-8'});
        const xslx_Sheet_clean = fs.readFileSync('./lib/util/xslt/blessings-xlsx-clean.json',{encoding:'utf-8'});
        const xlsxredux = function(acc,cur,cur1) {
            
            const ret = util.innertext(cur);
            const inner = ret.inner;
            const placement = ret.placement;
            const milestone = ret.milestone;
            const synch = ret.synch;

            const unit = synch ? synch.replace(/^#/,'') : '';

            const processed = SaxonJS.transform({
                stylesheetText: xslx_Sheet,
                sourceText: '<TEI xmlns="http://www.tei-c.org/ns/1.0">'+inner+'</TEI>',
                destination: 'serialized'},'sync');
            const processed2 = SaxonJS.transform({
                stylesheetText: xslx_Sheet_clean,
                sourceText: '<TEI xmlns="http://www.tei-c.org/ns/1.0">'+inner+'</TEI>',
                destination: 'serialized'},'sync');
            const txt = processed.principalResult.replace(/[\n\s]+/g,' ').replace(/\s%nobreak%/g,'').trim();
            const cleantxt = Sanscript.t(
                processed2.principalResult.replace(/[\n\s]+/g,' ').replace(/\s%nobreak%/g,'').replace(/[|•-]|=(?=\w)/g,'').trim(),
                'tamil','iast');
            const tunai = Array.from(cleantxt.matchAll(/tuṇai/g)).length;
            
            return acc + `<tr><td>${txt}</td><td>${cleantxt}</td><td>${cur1.cote.text}</td><td>${cur1.repo}</td><td>${cur1.title}</td><td>${unit}</td><td>${milestone}</td><td>${placement}</td><td>${tunai}</td></tr>`;
        };

        const xslxdoc = make.html('');
        const htmltab = xslxdoc.createElement('table');
        const tabbod = xslxdoc.createElement('tbody');
        const xslxstr = data.reduce((acc, cur) => {
            if(cur[opts.prop].length > 0) {
                const lines = [...cur[opts.prop]].reduce((acc2,cur2) => xlsxredux(acc2,cur2,cur),'');
                return acc + lines;
            }
            else return acc;
        },'');
        tabbod.innerHTML = xslxstr;
        htmltab.appendChild(tabbod);
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.table_to_sheet(htmltab);
        xlsx.utils.book_append_sheet(wb,ws,opts.name);
        xlsx.writeFile(wb,`../${opts.name}.xlsx`);
    },

    colophons: (data) => {
        const colophonredux = function(acc,cur,cur1) {
            
            const ret = util.innertext(cur);
            const inner = ret.inner;
            const placement = ret.placement;
            const unit = ret.synch ? ret.synch.replace(/^#/,'') : '';
            const milestone = ret.facs ?
                `<a href="${cur1.fname}?facs=${ret.facs}">${ret.milestone}</a>` :
                ret.milestone;

            const processed = SaxonJS.transform({
                stylesheetText: xsltSheet,
                sourceText: '<TEI xmlns="http://www.tei-c.org/ns/1.0">'+inner+'</TEI>',
                destination: 'serialized'},'sync');
            const res = processed.principalResult || '';
            const txt = Sanscript.t(
                res.replace(/[\n\s]+/g,' ').replace(/\s%nobreak%/g,'').trim(),
                'tamil','iast');
            return acc + 
        `<tr>
        <td>
        ${txt}
        </td>
        <td><a href="${cur1.fname}">${cur1.cote.text}</a></td>
        <td>
        ${cur1.repo}
        </td>
        <td>
        ${cur1.title}
        </td>
        <td>
        ${unit}
        </td>
        <td>
        ${milestone}
        </td>
        </tr>\n`;
        };

        const template = make.html(templatestr);

        const title = template.querySelector('title');
        title.textContent = `${title.textContent}: Colophons`;
        
        const thead = make.header(['Colophon','Shelfmark','Repository','Title','Unit','Page/Folio']);
        const tstr = data.reduce((acc, cur) => {
            if(cur.colophons.length > 0) {
                const lines = [...cur.colophons].reduce((acc2,cur2) => colophonredux(acc2,cur2,cur),'');
                return acc + lines;
            }
            else return acc;
        },'');

        const table = template.getElementById('index');
        table.innerHTML = `${thead}<tbody>${tstr}</tbody>`;
        table.querySelectorAll('th')[1].classList.add('sorttable_alphanum');

        fs.writeFile('../colophons.html',template.documentElement.outerHTML,{encoding: 'utf8'},function(){return;});
    },
    invocations: (data) => {
        
        const predux = function(acc,cur,cur1) {
            
            const ret = util.innertext(cur);
            const inner = ret.inner;
            const placement = ret.placement;
            const milestone = ret.facs ?
                `<a href="${cur1.fname}?facs=${ret.facs}">${ret.milestone}</a>` :
                ret.milestone;
            const synch = ret.synch;
            const is_satellite = 
                'satellite-stanza' === (cur.getAttribute('function') || cur.getAttribute('type')) ?
                '✓' : '';
            const unit = synch ? synch.replace(/^#/,'') : '';
            const processed = SaxonJS.transform({
                stylesheetText: xsltSheet,
                sourceText: '<TEI xmlns="http://www.tei-c.org/ns/1.0">'+inner+'</TEI>',
                destination: 'serialized'},'sync');
            const res = processed.principalResult || '';
            const txt = Sanscript.t(
                res.replace(/[\n\s]+/g,' ').replace(/\s%nobreak%/g,'').trim(),
                'tamil','iast');
            return acc + 
                `<tr>
                <td>
                ${txt}
                </td>
                <td><a href="${cur1.fname}">${cur1.cote.text}</a></td>
                <td>
                ${cur1.repo}
                </td>
                <td>
                ${cur1.title}
                </td>
                <td>
                ${unit}
                </td>
                <td>
                ${milestone}
                </td>
                <td>
                ${placement}
                </td>
                <td>
                ${is_satellite}
                </td>
                </tr>\n`;
        };
        
        const template = make.html(templatestr);

        const title = template.querySelector('title');
        title.textContent = `${title.textContent}: Invocations`;

        const table = template.getElementById('index');
        const tstr = data.reduce((acc, cur) => {
            const props = [...cur.invocations,...cur.satellites];
            if(props.length > 0) {
                const lines = props.reduce((acc2,cur2) => predux(acc2,cur2,cur),'');
                return acc + lines;
            }
            else return acc;
        },'');
        const thead = make.header(['Invocations','Shelfmark','Repository','Title','Unit','Page/folio','Placement','Satellite stanza']);
        table.innerHTML = `${thead}<tbody>${tstr}</tbody>`;
        table.querySelectorAll('th')[1].classList.add('sorttable_alphanum');
        fs.writeFile('../invocations.html',template.documentElement.outerHTML,{encoding: 'utf8'},function(){return;});
    },
    persons: (data) => {

        const peepredux = function(acc,cur,cur1) {
            const txt = Sanscript.t(
                cur.name.replace(/[\n\s]+/g,' ').trim(),
                'tamil','iast');
            return acc + 
        `<tr>
        <td>
        ${txt}
        </td>
        <td>
        ${cur.role}
        </td>
        <td><a href="${cur1.fname}">${cur1.cote.text}</a></td>
        <td>
        ${cur1.repo}
        </td>
        <td>
        ${cur1.title}
        </td>
        </tr>\n`;
        };
        const template = make.html(templatestr);
        const table = template.getElementById('index');

        const title = template.querySelector('title');
        title.textContent = `${title.textContent}: Persons`;

        const tstr = data.reduce((acc, cur) => {
            if(cur.persons.length > 0) {
                const lines = [...cur.persons].reduce((acc2,cur2) => peepredux(acc2,cur2,cur),'');
                return acc + lines;
            }
            else return acc;
        },'');
        const thead = make.header(['Person','Role','Shelfmark','Repository','Title']);
        table.innerHTML = `${thead}<tbody>${tstr}</tbody>`;
        //table.querySelectorAll('th')[2].classList.add('sorttable_alphanum');
        fs.writeFile('../persons.html',template.documentElement.outerHTML,{encoding: 'utf8'},function(){return;});
    },
    personsnetwork: (data) => {

        const peepmap = function(cur,cur1) {
            const txt = Sanscript.t(
                cur.name.replace(/[\n\s]+/g,' ').trim(),
                'tamil','iast');
            return {
                name: txt,
                role: cur.role,
                fname: cur1.fname,
                cote: cur1.repo + ' ' + cur1.cote.text,
            }
        };

        const bucketgroups = [
            ['author','editor','translator'],
            ['scribe','proofreader','annotator'],
            ['commissioner','owner','collector']
            ];
        const buckets = new Map(bucketgroups.flatMap(el => {
            const bucket = el.join(', ');
            return el.map(role => [role, bucket]);
        }));

        const peepredux = (acc, cur) => {
            
            if(!cur.role) return acc;
            
            const bucket = buckets.has(cur.role) ? buckets.get(cur.role) : 'other';

            if(!acc.has(cur.name))
                acc.set(cur.name, {buckets: new Set([bucket]), roles: new Set([cur.role]), texts: new Set([cur.cote])});
            else {
                const oldrec = acc.get(cur.name);
                oldrec.buckets.add(bucket);
                oldrec.texts.add(cur.cote);
                oldrec.roles.add(cur.role);
            }

            return acc;
        };

        const template = make.html(templatestr);
        template.body.style.margin = '0 auto';
        template.body.style.paddingLeft = '0';
        const section = template.querySelector('section');
        section.innerHTML = '';

        const title = template.querySelector('title');
        title.textContent = `${title.textContent}: Persons`;
        
        const persarr = data.reduce((acc, cur) => {
            if(cur.persons.length > 0) {
                return acc.concat( [...cur.persons].map((cur2) => peepmap(cur2,cur)) );
            }
            else return acc;
        },[]);

        const allpeeps = persarr.reduce(peepredux,new Map());
        
        const links = [];
        const nodes = [];
        const texts = new Set();

        allpeeps.forEach((peep,key) => {
            for(const text of peep.texts) {
                links.push({source: key, target: text, value: 1});
                texts.add(text);
            }
            const roles = [...peep.roles];
            const buckets = [...peep.buckets];
            const node = {id: key, size: peep.texts.size};
            roles.sort();
            node.roles = roles.join(', ');

            if(buckets.length === 1) node.group = buckets[0];
            else {
                buckets.sort();
                node.groups = buckets;
            }
            nodes.push(node);
            });

        for(const text of texts) nodes.push({id: text, group: 'manuscript', roles: 'manuscript'});
       
        const json = JSON.stringify({nodes: nodes, links: links});
        
        const script = template.createElement('script');
        script.setAttribute('type','module');
        script.innerHTML =`
import { makeChart, makeLegend, chartMouseover } from './persons.mjs';
const graph = ${json};
const section = document.querySelector('section');
const svg = makeChart(graph);

const legend = makeLegend(svg.scales.color);

section.appendChild(legend);
section.appendChild(svg);

section.addEventListener('mouseover',chartMouseover);
`
template.body.appendChild(script);
        fs.writeFile('../persons-network.html',template.documentElement.outerHTML,{encoding: 'utf8'},function(){return;});
    },
};

export { output };
