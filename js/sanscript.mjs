/**
 * Sanscript
 *
 * Sanscript is a Sanskrit transliteration library. Currently, it supports
 * other Indian languages only incidentally.
 *
 * Released under the MIT and GPL Licenses.
 */

const Sanscript = {};

'use strict';

Sanscript.defaults = {
    skip_sgml: false,
    syncope: false
};

/* Schemes
 * =======
 * Schemes are of two kinds: "Brahmic" and "roman." "Brahmic" schemes
 * describe abugida scripts found in India. "Roman" schemes describe
 * manufactured alphabets that are meant to describe or encode Brahmi
 * scripts. Abugidas and alphabets are processed by separate algorithms
 * because of the unique difficulties involved with each.
 *
 * Brahmic consonants are stated without a virama. Roman consonants are
 * stated without the vowel 'a'.
 *
 * (Since "abugida" is not a well-known term, Sanscript uses "Brahmic"
 * and "roman" for clarity.)
 */
var schemes = Sanscript.schemes = {
    /* Tamil
     * -----
     * Missing R/RR/lR/lRR vowel marks and voice/aspiration distinctions.
     * The most incomplete of the Sanskrit schemes here.
     */
        tamil: {
            vowels: ['அ','ஆ',
            'இ','ஈ',
            'உ','ஊ',
            '𑌋','𑍠',
            '𑌌','𑍡',
            'எ','ஏ','ஐ',
            'ஒ','ஓ','ஔ'],
            vowel_marks: ['ா',
            'ி','ீ',
            'ு','ூ',
            '𑍃','𑍄',
            '𑍢','𑍣',
            'ெ','ே','ை',
            'ொ','ோ','ௌ'],
            other_marks: ['𑌂','𑌃','𑌁','','','ஃ'], // ṃ ḥ m̐ ẖ ḫ ḵ 
            virama: ['்'],
            consonants: ['க','𑌖','𑌗','𑌘','ங',
            'ச','𑌛','ஜ','𑌝','ஞ',
            'ட','𑌠','𑌡','𑌢','ண',
            'த','𑌥','𑌦','𑌧','ந',
            'ப','𑌫','𑌬','𑌭','ம',
            'ய','ர','ல','வ',
            'ஶ','ஷ','ஸ','ஹ',
            'ள','ழ','ற','ன'],
            symbols: ['௦','௧','௨','௩','௪','௫','௬','௭','௮','௯','ௐ','','𑌽','।','॥','௰','௱','௲'],
        },
        grantha: {
            vowels: ['𑌅','𑌆',
                '𑌇','𑌈',
                '𑌉','𑌊',
                '𑌋','𑍠',
                '𑌌','𑍡',
                'எ','𑌏','𑌐',
                'ஒ','𑌓','𑌔'
              
            ],
            vowel_marks: ['𑌾',
                '𑌿','𑍀',
                '𑍁','𑍂',
                '𑍃','𑍄',
                '𑍢','𑍣',
                'ெ','𑍇','𑍈',
                'ொ','𑍋','𑍌'
            ],
            other_marks: ['𑌂','𑌃','𑌁','𑍞','𑍟','ஃ'], // ṃ ḥ m̐ ẖ ḫ ḵ 
            virama: ['𑍍'],
            consonants: ['𑌕','𑌖','𑌗','𑌘','𑌙',
                '𑌚','𑌛','𑌜','𑌝','𑌞',
                '𑌟','𑌠','𑌡','𑌢','𑌣',
                '𑌤','𑌥','𑌦','𑌧','𑌨',
                '𑌪','𑌫','𑌬','𑌭','𑌮',
                '𑌯','𑌰','𑌲','𑌵',
                '𑌶','𑌷','𑌸','𑌹',
                '𑌳','ழ','ற','ன',
            ],
            symbols: ['௦','௧','௨','௩','௪','௫','௬','௭','௮','௯','𑍐','','𑌽','।','॥','௰','௱','௲'],
        },
        
        malayalam: {
            vowels: ['\u{0D05}','\u{0D06}',
                '\u{0D07}','\u{0D08}',
                '\u{0D09}','\u{0D0A}',
                '\u{0D0B}','\u{0D60}',
                '\u{0D0C}','\u{0D63}',
                '\u{0D0E}','\u{0D0F}','\u{0D10}',
                '\u{0D12}','\u{0D13}','\u{0D14}'

            ],
            vowel_marks: ['\u{0D3E}',
                '\u{0D3F}','\u{0D40}',
                '\u{0D41}','\u{0D42}',
                '\u{0D43}','\u{0D44}',
                '\u{0D62}','\u{0D63}',
                '\u{0D46}','\u{0D47}','\u{0D48}',
                '\u{0D4A}','\u{0D4B}','\u{0D4C}'
            ],
            other_marks: ['\u{0D02}','\u{0D03}','\u{0D01}','','',''],
            virama: ['\u{0D4D}'],

            consonants: ['\u{0D15}','\u{0D16}','\u{0D17}','\u{0D18}','\u{0D19}',
                '\u{0D1A}','\u{0D1B}','\u{0D1C}','\u{0D1D}','\u{0D1E}',
                '\u{0D1F}','\u{0D20}','\u{0D21}','\u{0D22}','\u{0D23}',
                '\u{0D24}','\u{0D25}','\u{0D26}','\u{0D27}','\u{0D28}',
                '\u{0D2A}','\u{0D2B}','\u{0D2C}','\u{0D2D}','\u{0D2E}',
                '\u{0D2F}','\u{0D30}','\u{0D32}','\u{0D35}',
                '\u{0D36}','\u{0D37}','\u{0D38}','\u{0D39}',
                '\u{0D33}','','',''
            ],
            symbols: '\u{0D66} \u{0D67} \u{0D68} \u{0D69} \u{0D6A} \u{0D6B} \u{0D6C} \u{0D6D} \u{0D6E} \u{0D6F} \u{0D12}\u{0D01}  \u{0D3D} । ॥ \u{0D70} \u{0D71} \u{0D72}'.split(' '),
        },
        newa: {
            vowels: ['\u{11400}','\u{11401}',
                '\u{11402}','\u{11403}',
                '\u{11404}','\u{11405}',
                '\u{11406}','\u{11407}',
                '\u{11408}','\u{11409}',
                '','\u{1140A}','\u{1140B}',
                '','\u{1140C}','\u{1140D}'
            ],
            vowel_marks: ['\u{11435}',
                '\u{11436}','\u{11437}',
                '\u{11438}','\u{11439}',
                '\u{1143A}','\u{1143B}',
                '\u{1143C}','\u{1143D}',
                '','\u{1143E}','\u{1143F}',
                '','\u{11440}','\u{11441}',
            ],
            other_marks: ['\u{11444}','\u{11445}','\u{11443}','\u{11460}','\u{11461}',''],
            virama: ['\u{11442}'],
            consonants: ['\u{1140E}','\u{1140F}','\u{11410}','\u{11411}','\u{11412}',
                '\u{11414}','\u{11415}','\u{11416}','\u{11417}','\u{11418}',
                '\u{1141A}','\u{1141B}','\u{1141C}','\u{1141D}','\u{1141E}',
                '\u{1141F}','\u{11420}','\u{11421}','\u{11422}','\u{11423}',
                '\u{11425}','\u{11426}','\u{11427}','\u{11428}','\u{11429}',
                '\u{1142B}','\u{1142C}','\u{1142E}','\u{11430}',
                '\u{11431}','\u{11432}','\u{11433}','\u{11434}'
            ],
            symbols: ['\u{11450}','\u{11451}','\u{11452}','\u{11453}','\u{11454}','\u{11455}','\u{11456}','\u{11457}','\u{11458}','\u{11459}',
                '\u{11449}','','\u{11447}','\u{1144B}','\u{1144C}']

        },
        
        sarada: {
            vowels: ['\u{11183}','\u{11184}',
                '\u{11185}','\u{11186}',
                '\u{11187}','\u{11188}',
                '\u{11189}','\u{1118A}',
                '\u{1118B}','\u{1118C}',
                '','\u{1118D}','\u{1118E}',
                '','\u{1118F}','\u{11190}'
            ],
            vowel_marks: ['\u{111B3}',
                '\u{111B4}','\u{111B5}',
                '\u{111B6}','\u{111B7}',
                '\u{111B8}','\u{111B9}',
                '\u{111BA}','\u{111BB}',
                '','\u{111BC}','\u{111BD}',
                '','\u{111BE}','\u{111BF}'
            ],
            other_marks: ['\u{11181}','\u{11182}','\u{11180}','\u{111C1}','\u{111C2}',''],
            virama: ['\u{111C0}'],
            consonants: ['\u{11191}','\u{11192}','\u{11193}','\u{11194}','\u{11195}',
                '\u{11196}','\u{11197}','\u{11198}','\u{11199}','\u{1119A}',
                '\u{1119B}','\u{1119C}','\u{1119D}','\u{1119E}','\u{1119F}',
                '\u{111A0}','\u{111A1}','\u{111A2}','\u{111A3}','\u{111A4}',
                '\u{111A5}','\u{111A6}','\u{111A7}','\u{111A8}','\u{111A9}',
                '\u{111AA}','\u{111AB}','\u{111AC}','\u{111AE}',
                '\u{111AF}','\u{111B0}','\u{111B1}','\u{111B2}',
                '\u{111AD}'
            ],
            symbols: ['\u{111D0}','\u{111D1}','\u{111D2}','\u{111D3}','\u{111D4}','\u{111D5}',
                '\u{111D6}','\u{111D7}','\u{111D8}','\u{111D9}',
                '\u{111C4}','','\u{111C1}','\u{111C5}','\u{111C6}']
        },

        nandinagari: {
            vowels: ['\u{119A0}','\u{119A1}',
                '\u{119A2}','\u{119A3}',
                '\u{1194}','\u{119A5}',
                '\u{119A6}','\u{119A7}',
                '\u{119C9}\u{119D6}','\u{119C9}\u{119D7}',
                '','\u{119AA}','\u{119AB}',
                '','\u{119AC}','\u{119AD}'
            ],
            vowel_marks: ['\u{119D1}',
                '\u{119D2}','\u{119D3}',
                '\u{119D4}','\u{119D5}',
                '\u{119D6}','\u{119D7}',
                '\u{119C9}\u{119D6}','\u{119C9}\u{119D7}',
                '','\u{119DA}','\u{119DB}',
                '','\u{119DC}','\u{119DD}'
            ],
            other_marks: ['\u{119DE}','\u{119DF}','','',''],
            virama: ['\u{119E0}'],
            consonants: ['\u{119AE}','\u{119AF}','\u{119B0}','\u{119B1}','\u{11B2}',
                '\u{119B3}','\u{119B4}','\u{119B5}','\u{119B6}','\u{119B7}',
                '\u{119B8}','\u{119B9}','\u{119BA}','\u{119BB}','\u{119BC}',
                '\u{119BD}','\u{119BE}','\u{119BF}','\u{119C0}','\u{119C1}',
                '\u{119C2}','\u{119C3}','\u{119C4}','\u{119C5}','\u{119C6}',
                '\u{119C7}','\u{119C8}','\u{119C9}','\u{119CA}',
                '\u{119CB}','\u{119CC}','\u{119CD}','\u{119CE}',
                '\u{119CF}','','\u{119D0}'
            ],
            // use Kannada numerals & Devanagari daṇḍas
            symbols: ['\u{0CE6}','\u{0CE7}','\u{0CE8}','\u{0CE9}','\u{0CEA}','\u{0CEB}',
                '\u{0CEC}','\u{0CED}','\u{0CEE}','\u{0CEF}',
                '','','\u{119E1}','।','॥']
        },

        bengali: {
            vowels: ['অ','আ',
            'ই','ঈ',
            'উ','ঊ',
            'ঋ','ৠ',
            'ঌ','ৡ',
            '','এ','ঐ',
            '','ও','ঔ'],
            vowel_marks: ['া',
            'ি','ী',
            'ু','ূ',
            'ৃ','ৄ',
            'ৢ','ৣ',
            '','ে','ৈ',
            'ো','ৌ'],
            other_marks: ['ং','ঃ','ঁ','','',''],
            virama: ['্'],
            consonants: ['ক','খ','গ','ঘ','ঙ',
            'চ','ছ','জ','ঝ','ঞ',
            'ট','ঠ','ড','ঢ','ণ',
            'ত','থ','দ','ধ','ন',
            'প','ফ','ব','ভ','ম',
            'য','র','ল','ব',
            'শ','ষ','স','হ',
            'ळ','','','',
            'য়',
            '','','','','','','ড়','ঢ়' // (q qh ġ z zh f) ṙ ṙh (ṫh ḋh w)
            ],
            symbols: ['০','১','২','৩','৪','৫','৬','৭','৮','৯','ওঁ','','ঽ','।','॥'],
        },
        devanagari: {
            vowels: ['अ','आ', // a ā
            'इ','ई', // i ī
            'उ','ऊ', // u ū
            'ऋ','ॠ', // ṛ ṝ
            'ऌ','ॡ', // l̥ l̥̄
            'ऎ','ए','ऐ', // e ē ai
            'ऒ','ओ','औ' // o ō au
            ],
            vowel_marks: ['ा', // ā
            'ि','ी', // i ī
            'ु','ू', // u ū
            'ृ','ॄ', // ṛ ṝ
            'ॢ','ॣ', // l̥ l̥̄
            'ॆ','े','ै', // e ē ai
            'ॊ','ो','ौ', // o ō au
            'ॎ','ॎे','ॎा','ॎो' // e ai o au
            ],
            
            other_marks: ['ं','ः','ँ','ᳵ','ᳶ',''], // ṃ ḥ m̐ ẖ ḫ ḵ 

            virama: ['्'],

            consonants: ['क','ख','ग','घ','ङ',
            'च','छ','ज','झ','ञ',
            'ट','ठ','ड','ढ','ण',
            'त','थ','द','ध','न',
            'प','फ','ब','भ','म',     
            'य','र','ल','व',
            'श','ष','स','ह',
            'ळ','ऴ','ऱ','ऩ',
            'य़',
            'क़','ख़','ग़','ज़','झ़','फ़','ड़','ढ़','थ़','ध़','व़' // q qh ġ z zh f ṙ ṙh ṫh ḋh w
            ],

            symbols: ['०','१','२','३','४','५','६','७','८','९','ॐ','ꣽ','ऽ','।','॥'],

            zwj: ['\u200D'],

            // Dummy consonant. This is used in ITRANS to prevert certain types
            // of parser ambiguity. Thus "barau" -> बरौ but "bara_u" -> बरउ.
            skip: [''],

            // Vedic accent. Udatta and anudatta.
            accent: ['\u0951', '\u0952'],

            // Accent combined with anusvara and and visarga. For compatibility
            // with ITRANS, which allows the reverse of these four.
            combo_accent: 'ः॑ ः॒ ं॑ ं॒'.split(' '),
        },
        telugu: {
            vowels: ['అ','ఆ', // a ā
            'ఇ','ఈ', // i ī
            'ఉ','ఊ', // u ū
            'ఋ','ౠ', // ṛ ṝ
            'ఌ','ౡ', // l̥ l̥̄
            'ఎ','ఏ','ఐ', // e ē ai
            'ఒ','ఓ','ఔ' // o ō au
            ],
            vowel_marks: ['ా', // ā
            'ి','ీ', // i ī
            'ు','ూ', // u ū
            'ృ','ౄ', // ṛ r̄,
            'ౢ','ౣ', // l̥ l̥̄
            'ె','ే','ై', // e ē ai
            'ొ','ో','ౌ' // o ō au
            ],
            other_marks: ['ం','ః','ఀ','','',''], // ṃ ḥ m̐ ẖ ḫ ḵ (what about ardhānusvāra?)
            virama: ['్'],
            consonants: ['క','ఖ','గ','ఘ','ఙ', // k kh g gh ṅ
            'చ','ఛ','జ','ఝ','ఞ', // c ch j jh ñ
            'ట','ఠ','డ','ఢ','ణ', // ṭ ṭh ḍ ḍh ṇ
            'త','థ','ద','ధ','న', // t th d dh n
            'ప','ఫ','బ','భ','మ', // p ph b bh m
            'య','ర','ల','వ', // y r l v
            'శ','ష','స','హ', // ś ṣ s h
            'ళ','ఴ','ఱ'], // ḷ ḻ ṟ
            symbols: ['౦','౧','౨','౩','౪','౫','౬','౭','౮','౯','ఓం','','ఽ','।','॥'],
        },

        iast: {
            vowels: ['a','ā',
            'i','ī',
            'u','ū',
            'ṛ','ṝ',
            'l̥','l̥̄',
            'e','ē','ai',
            'o','ō','au',
            'ê','aî','ô','aû'], // Devanāgarī pṛṣthamātrās
            other_marks: ['ṃ','ḥ','m̐','ẖ','ḫ','ḵ'],
            virama: [''],
            consonants: ['k','kh','g','gh','ṅ',
            'c','ch','j','jh','ñ',
            'ṭ','ṭh','ḍ','ḍh','ṇ',
            't','th','d','dh','n',
            'p','ph','b','bh','m',
            'y','r','l','v',
            'ś','ṣ','s','h',
            'ḷ','ḻ','ṟ','ṉ', // Dravidian
            'ẏ', // Bengali
            'q','qh','ġ','z','zh','f','ṙ','ṙh','ṫh','ḋh','w'],
            symbols: ['0','1','2','3','4','5','6','7','8','9','oṁ','oḿ','\'','|','||','⁰','⁰⁰','⁰⁰⁰'],
        }
    },

    // Set of names of schemes
    romanSchemes = {},

    // Map of alternate encodings.
    allAlternates = {
    },

    // object cache
    cache = {};

/**
 * Check whether the given scheme encodes romanized Sanskrit.
 *
 * @param name  the scheme name
 * @return      boolean
 */
Sanscript.isRomanScheme = function(name) {
    return romanSchemes.hasOwnProperty(name);
};

/**
 * Add a Brahmic scheme to Sanscript.
 *
 * Schemes are of two types: "Brahmic" and "roman". Brahmic consonants
 * have an inherent vowel sound, but roman consonants do not. This is the
 * main difference between these two types of scheme.
 *
 * A scheme definition is an object ("{}") that maps a group name to a
 * list of characters. For illustration, see the "devanagari" scheme at
 * the top of this file.
 *
 * You can use whatever group names you like, but for the best results,
 * you should use the same group names that Sanscript does.
 *
 * @param name    the scheme name
 * @param scheme  the scheme data itself. This should be constructed as
 *                described above.
 */
Sanscript.addBrahmicScheme = function(name, scheme) {
    Sanscript.schemes[name] = scheme;
};

/**
 * Add a roman scheme to Sanscript.
 *
 * See the comments on Sanscript.addBrahmicScheme. The "vowel_marks" field
 * can be omitted.
 *
 * @param name    the scheme name
 * @param scheme  the scheme data itself
 */
Sanscript.addRomanScheme = function(name, scheme) {
    if (!('vowel_marks' in scheme)) {
        scheme.vowel_marks = scheme.vowels.slice(1);
    }
    Sanscript.schemes[name] = scheme;
    romanSchemes[name] = true;
};

/**
 * Create a deep copy of an object, for certain kinds of objects.
 *
 * @param scheme  the scheme to copy
 * @return        the copy
 */
/*
var cheapCopy = function(scheme) {
    var copy = {};
    for (var key in scheme) {
        if (!scheme.hasOwnProperty(key)) {
            continue;
        }
        copy[key] = scheme[key].slice(0);
    }
    return copy;
};
*/
// Set up various schemes
(function() {
    // Set up roman schemes
    /*
    var kolkata = schemes.kolkata = cheapCopy(schemes.iast),
        schemeNames = 'iast itrans hk kolkata slp1 velthuis wx'.split(' ');
    kolkata.vowels = 'a ā i ī u ū ṛ ṝ ḷ ḹ e ē ai o ō au'.split(' ');
    */
    var schemeNames = ['iast'];
    // These schemes already belong to Sanscript.schemes. But by adding
    // them again with `addRomanScheme`, we automatically build up
    // `romanSchemes` and define a `vowel_marks` field for each one.
    for (var i = 0, name; (name = schemeNames[i]); i++) {
        Sanscript.addRomanScheme(name, schemes[name]);
    }
    /*
    // ITRANS variant, which supports Dravidian short 'e' and 'o'.
    var itrans_dravidian = cheapCopy(schemes.itrans);
    itrans_dravidian.vowels = 'a A i I u U Ri RRI LLi LLi e E ai o O au'.split(' ');
    itrans_dravidian.vowel_marks = itrans_dravidian.vowels.slice(1);
    allAlternates.itrans_dravidian = allAlternates.itrans;
    Sanscript.addRomanScheme('itrans_dravidian', itrans_dravidian);
*/
}());

/**
 * Create a map from every character in `from` to its partner in `to`.
 * Also, store any "marks" that `from` might have.
 *
 * @param from     input scheme
 * @param to       output scheme
 * @param options  scheme options
 */
var makeMap = function(from, to, /*options*/) {
    var alternates = allAlternates[from] || {},
        consonants = {},
        fromScheme = Sanscript.schemes[from],
        letters = {},
        tokenLengths = [],
        marks = {},
        toScheme = Sanscript.schemes[to];

    for (var group in fromScheme) {
        if (!fromScheme.hasOwnProperty(group)) {
            continue;
        }
        var fromGroup = fromScheme[group],
            toGroup = toScheme[group];
        if (toGroup === undefined) {
            continue;
        }
        for (var i = 0; i < fromGroup.length; i++) {
            var F = fromGroup[i],
                T = toGroup[i],
                alts = alternates[F] || [],
                numAlts = alts.length,
                j = 0;

            tokenLengths.push(F.length);
            for (j = 0; j < numAlts; j++) {
                tokenLengths.push(alts[j].length);
            }

            if (group === 'vowel_marks' || group === 'virama') {
                marks[F] = T;
                for (j = 0; j < numAlts; j++) {
                    marks[alts[j]] = T;
                }
            } else {
                letters[F] = T;
                for (j = 0; j < numAlts; j++) {
                    letters[alts[j]] = T;
                }
                if (group === 'consonants' || group === 'other') {
                    consonants[F] = T;

                    for (j = 0; j < numAlts; j++) {
                        consonants[alts[j]] = T;
                    }
                }
            }
        }
    }
    return {consonants: consonants,
        fromRoman: Sanscript.isRomanScheme(from),
        letters: letters,
        marks: marks,
        maxTokenLength: Math.max.apply(Math, tokenLengths),
        toRoman: Sanscript.isRomanScheme(to),
        virama: toScheme.virama};
};

/**
 * Transliterate from a romanized script.
 *
 * @param data     the string to transliterate
 * @param map      map data generated from makeMap()
 * @param options  transliteration options
 * @return         the finished string
 */
var transliterateRoman = function(data, map, options) {
    var buf = [],
        consonants = map.consonants,
        dataLength = data.length,
        hadConsonant = false,
        letters = map.letters,
        marks = map.marks,
        maxTokenLength = map.maxTokenLength,
        optSkipSGML = options.skip_sgml,
        optSyncope = options.syncope,
        tempLetter,
        tempMark,
        tokenBuffer = '',
        toRoman = map.toRoman,
        virama = map.virama;

    // Transliteration state. It's controlled by these values:
    // - `skippingSGML`: are we in SGML?
    // - `toggledTrans`: are we in a toggled region?
    //
    // We combine these values into a single variable `skippingTrans`:
    //
    //     `skippingTrans` = skippingSGML || toggledTrans;
    //
    // If (and only if) this value is true, don't transliterate.
    var skippingSGML = false,
        skippingTrans = false,
        toggledTrans = false;

    for (var i = 0, L; (L = data.charAt(i)) || tokenBuffer; i++) {
        // Fill the token buffer, if possible.
        var difference = maxTokenLength - tokenBuffer.length;
        if (difference > 0 && i < dataLength) {
            tokenBuffer += L;
            if (difference > 1) {
                continue;
            }
        }

        // Match all token substrings to our map.
        for (var j = 0; j < maxTokenLength; j++) {
            var token = tokenBuffer.substr(0,maxTokenLength-j);

            if (skippingSGML === true) {
                skippingSGML = (token !== '>');
            } else if (token === '<') {
                skippingSGML = optSkipSGML;
            } else if (token === '##') {
                toggledTrans = !toggledTrans;
                tokenBuffer = tokenBuffer.substr(2);
                break;
            }
            skippingTrans = skippingSGML || toggledTrans;
            if ((tempLetter = letters[token]) !== undefined && !skippingTrans) {
                if (toRoman) {
                    buf.push(tempLetter);
                } else {
                    // Handle the implicit vowel. Ignore 'a' and force
                    // vowels to appear as marks if we've just seen a
                    // consonant.
                    if (hadConsonant) {
                        if ((tempMark = marks[token])) {
                            buf.push(tempMark);
                        } else if (token !== 'a') {
                            buf.push(virama);
                            buf.push(tempLetter);
                        }
                    } else {
                        buf.push(tempLetter);
                    }
                    hadConsonant = token in consonants;
                }
                tokenBuffer = tokenBuffer.substr(maxTokenLength-j);
                break;
            } else if (j === maxTokenLength - 1) {
                if (hadConsonant) {
                    hadConsonant = false;
                    if (!optSyncope) {
                        buf.push(virama);
                    }
                }
                buf.push(token);
                tokenBuffer = tokenBuffer.substr(1);
                // 'break' is redundant here, "j == ..." is true only on
                // the last iteration.
            }
        }
    }
    if (hadConsonant && !optSyncope) {
        buf.push(virama);
    }
    return buf.join('');
};

/**
 * Transliterate from a Brahmic script.
 *
 * @param data     the string to transliterate
 * @param map      map data generated from makeMap()
 * @param options  transliteration options
 * @return         the finished string
 */
var transliterateBrahmic = function(data, map, /*options*/) {
    var buf = [],
        consonants = map.consonants,
        hadRomanConsonant = false,
        letters = map.letters,
        marks = map.marks,
        dataLength = data.length,
        maxTokenLength = map.maxTokenLength,
        tempLetter,
        tokenBuffer = '',
        toRoman = map.toRoman,
        skippingTrans = false;

    for (var i = 0, L; (L = data.charAt(i)) || tokenBuffer; i++) {
        // Fill the token buffer, if possible.
        var difference = maxTokenLength - tokenBuffer.length;
        if (difference > 0 && i < dataLength) {
            tokenBuffer += L;
            if (difference > 1) {
                continue;
            }
        }

        // Match all token substrings to our map.
        for (var j = 0; j < maxTokenLength; j++) {
            var token = tokenBuffer.substr(0,maxTokenLength-j);

            if((tempLetter = marks[token]) !== undefined && !skippingTrans) {
                buf.push(tempLetter);
                hadRomanConsonant = false;
                tokenBuffer = tokenBuffer.substr(maxTokenLength-j);
                break;
            } 
            else if((tempLetter = letters[token])) {
                if (hadRomanConsonant) {
                    buf.push('a');
                    hadRomanConsonant = false;
                }
                buf.push(tempLetter);
                hadRomanConsonant = toRoman && (token in consonants);
                tokenBuffer = tokenBuffer.substr(maxTokenLength-j);
                break;

            } else if (j === maxTokenLength - 1) {
                if (hadRomanConsonant) {
                    buf.push('a');
                    hadRomanConsonant = false;
                }
                buf.push(token);
                tokenBuffer = tokenBuffer.substr(1);
            }
        }
    }
    if (hadRomanConsonant) {
        buf.push('a');
    }
    return buf.join('');
};

/**
 * Transliterate from one script to another.
 *
 * @param data     the string to transliterate
 * @param from     the source script
 * @param to       the destination script
 * @param options  transliteration options
 * @return         the finished string
 */
Sanscript.t = function(data, from, to, options) {
    options = options || {};
    var cachedOptions = cache.options || {},
        defaults = Sanscript.defaults,
        hasPriorState = (cache.from === from && cache.to === to),
        map;

    // Here we simultaneously build up an `options` object and compare
    // these options to the options from the last run.
    for (var key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            var value = defaults[key];
            if (key in options) {
                value = options[key];
            }
            options[key] = value;

            // This comparison method is not generalizable, but since these
            // objects are associative arrays with identical keys and with
            // values of known type, it works fine here.
            if (value !== cachedOptions[key]) {
                hasPriorState = false;
            }
        }
    }

    if (hasPriorState) {
        map = cache.map;
    } else {
        map = makeMap(from, to, options);
        cache = {
            from: from,
            map: map,
            options: options,
            to: to};
    }
    /*
    // Easy way out for "{\m+}", "\", and ".h".
    if (from === 'itrans') {
        data = data.replace(/\{\\m\+\}/g, '.h.N');
        data = data.replace(/\.h/g, '');
        data = data.replace(/\\([^'`_]|$)/g, '##$1##');
    }
    */
    if (map.fromRoman) {
        return transliterateRoman(data, map, options);
    } else {
        return transliterateBrahmic(data, map, options);
    }
};

export { Sanscript };
