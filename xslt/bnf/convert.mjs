import yargs from 'yargs';
import fs from 'fs';
import SaxonJS from 'saxon-js';
import jsdom from 'jsdom';
import serializer from 'w3c-xmlserializer';

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

const replaceEl = function(olddoc,newdoc,parname,kidname) {
    const par = olddoc.querySelector(parname);
    const oldel = par.querySelector(kidname);
    const newel = newdoc.querySelector(`${parname} > ${kidname}`);
    if(oldel)
        oldel.parentNode.replaceChild(newel,oldel);
    else
        par.appendChild(newel);
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

    const processed = SaxonJS.transform({
        stylesheetText: xsltSheet,
        sourceText: intext,
        destination: 'serialized'},
        'sync');
    const indoc = parseXML(processed.principalResult);
    
    if(!outtext)
        fs.writeFile(outfile,serializer(indoc),{encoding: 'utf-8'},function(){return;});
    else {
        const outdoc = parseXML(outtext);
        replaceEl(outdoc, indoc, 'eadheader','filedesc');
        replaceEl(outdoc, indoc, 'eadheader','profiledesc');
        replaceEl(outdoc, indoc, 'archdesc[level="item"]','did');
        replaceEl(outdoc, indoc, 'archdesc[level="item"]','scopecontent');
        replaceEl(outdoc, indoc, 'archdesc[level="item"]','bibliography');
        replaceEl(outdoc, indoc, 'archdesc[level="item"]','custodhist');
        replaceEl(outdoc, indoc, 'archdesc[level="item"]','acqinfo');
        replaceEl(outdoc, indoc, 'archdesc[level="item"]','processinfo');
        const writeout = '<?xml version="1.0" encoding="UTF-8"?>' + serializer(outdoc);
        fs.writeFile(outfile,writeout,{encoding: 'utf-8'},function(){return;});
    }
};

main();
