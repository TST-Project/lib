import yargs from 'yargs';
import fs from 'fs';
import SaxonJS from 'saxon-js';

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

const main = function() {
    const infile = argv.in;
    if(!infile) { console.error('No input file.'); return; }
    const outfile = argv.out;
    if(!outfile) { console.error('No output file.'); return; }
    

    const intext = fs.readFileSync(infile,{encoding: 'utf-8'});
    
    const outtext = (fs.existsSync(outfile)) ?
        fs.readFileSync(outfile,{encoding: 'utf-8'}) :
        '<ead></ead>';

    const xsltSheet = fs.readFileSync('tei-to-ead.sef.json',{encoding: 'utf-8'});

    const processed = SaxonJS.transform({
        stylesheetText: xsltSheet,
        sourceText: intext,
        destination: 'serialized'},
        'sync');
    const res = processed.principalResult;
    fs.writeFile(outfile,res,{encoding: 'utf-8'},function(){return;});
};

main();
