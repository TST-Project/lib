import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import SaxonJS from 'saxon-js';
import jsdom from 'jsdom';
import serializer from 'w3c-xmlserializer';
import { Transliterate } from '../../js/transliterate.mjs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .option('in', {
        alias: 'i',
        description: 'Input file',
        type: 'string'
    })
    .option('out', {
        alias: 'o',
        description: 'Output file',
        type: 'string'
    })
    .help().alias('help','h').argv;

const parseXML = function(str) {
    const dom = new jsdom.JSDOM('');
    const parser = new dom.window.DOMParser();
    return parser.parseFromString(str,'text/xml');
};

const replaceEl = function(olddoc,newdoc,parname,kidname,inplace = false) {
    const par = olddoc.querySelector(parname);
    const oldel = par.querySelector(`:scope > ${kidname}`);
    const newel = newdoc.querySelector(`${parname} > ${kidname}`);
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

const transliterate = function(doc) {
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
            el.innerHTML = el.textContent.trim();
        }
    }
};

const main = function() {
    const infile = argv.in;
    if(!infile) { console.error('No input file.'); return; }
    const outfile = argv.out;
    if(!outfile) { console.error('No output file.'); return; }
    

    const intext = fs.readFileSync(infile,{encoding: 'utf-8'});
    
    const outtext = (fs.existsSync(outfile)) ?
        fs.readFileSync(outfile,{encoding: 'utf-8'}) : null;
    
    const xsltSheet = fs.readFileSync('tei-to-ead.sef.json',{encoding: 'utf-8'});

    const inxml = parseXML(intext);
    const subunits = inxml.querySelectorAll('msItem[source]');
    for(const subunit of subunits) {
        const dir = path.dirname(infile);
        const subfilename = dir + '/' + subunit.getAttribute('source');
        const subfile = fs.readFileSync(subfilename,{encoding: 'utf-8'});
        const subXML = parseXML(subfile);
        subunit.innerHTML = '';
        const tei = subXML.querySelector('TEI');
        subunit.appendChild(tei);
    };

    const processed = SaxonJS.transform({
        stylesheetText: xsltSheet,
        sourceText: serializer(inxml),
        destination: 'serialized'},
        'sync');
    const indoc = parseXML(processed.principalResult);

    const header = '<?xml version="1.0" encoding="UTF-8"?>';

    if(!outtext)
        fs.writeFile(outfile,header+serializer(indoc),{encoding: 'utf-8'},function(){return;});
    else {
        const outdoc = parseXML(outtext);
        replaceEl(outdoc, indoc, 'eadheader','filedesc',true);
        replaceEl(outdoc, indoc, 'eadheader','profiledesc',true);
        const level = indoc.querySelector('archdesc[level="otherlevel"]') ? 'otherlevel' : 'item';
        replaceEl(outdoc, indoc, `archdesc[level="${level}"]`,'did',true);
        replaceEl(outdoc, indoc, `archdesc[level="${level}"]`,'scopecontent');
        replaceEl(outdoc, indoc, `archdesc[level="${level}"]`,'dsc');
        replaceEl(outdoc, indoc, `archdesc[level="${level}"]`,'bibliography');
        replaceEl(outdoc, indoc, `archdesc[level="${level}"]`,'custodhist');
        replaceEl(outdoc, indoc, `archdesc[level="${level}"]`,'acqinfo');
        replaceEl(outdoc, indoc, `archdesc[level="${level}"]`,'processinfo');
        
        transliterate(outdoc);

        fs.writeFile(outfile,header+serializer(outdoc),{encoding: 'utf-8'},function(){return;});
    }
};

main();
