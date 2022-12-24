import { Transliterate } from './transliterate.mjs';
import { MiradorModule } from './mirador.mjs';
import TSTStorageAdapter from './tstStorageAdapter.mjs';

const Mirador = MiradorModule.Mirador;
const miradorImageTools = MiradorModule.miradorImageToolsPlugin;
const miradorAnnotations = MiradorModule.miradorAnnotationPlugin;

const TSTViewer = (function() {
    'use strict';

    const _state = Object.seal({
        manifest: null,
        winname: 'win1',
        mirador: null,
        annoMap: new Map()
    });
    
    //const Mirador = window.Mirador || null;

    const init = function() {

        // load image viewer if facsimile available
        const viewer = document.getElementById('viewer');
        if(viewer) {
            _state.manifest = viewer.dataset.manifest;
            const param = (new URLSearchParams(window.location.search)).get('facs');
            const page = param ? parseInt(param) - 1 : null;
            if(_state.mirador)
                refreshMirador(_state.mirador,viewer.dataset.manifest, page || viewer.dataset.start);
            else
                _state.mirador = newMirador('viewer',viewer.dataset.manifest,page || viewer.dataset.start);
        }        
        

        // initialize events for the record text
        const recordcontainer = document.getElementById('recordcontainer');

        cleanLb(recordcontainer);

        Transliterate.init(recordcontainer);
        
        // start all texts in diplomatic view
        for(const l of recordcontainer.querySelectorAll('.line-view-icon')) {
            const lb = l.closest('.teitext').querySelector('.lb, .pb');
            if(!lb)
                l.style.display = 'none';
            else
                lineView(l);
        }

        // check for GitHub commit history
        latestCommits();

        recordcontainer.addEventListener('click',events.docClick);
        recordcontainer.addEventListener('mouseover',events.docMouseover);
        recordcontainer.addEventListener('mouseout',events.docMouseout);
        recordcontainer.addEventListener('copy',events.removeHyphens);

    };

    const newMirador = function(id,manifest,start = 0,annoMap = _state.annoMap, annotate = false) {
        _state.annoMap = annoMap;
        //const plugins = annotate ?
        //  [...miradorImageTools,...miradorAnnotations] :
        //  [...miradorImageTools];
        const plugins = [...miradorImageTools,...miradorAnnotations];
        const opts = {
            id: id,
            windows: [{
                id: _state.winname,
                loadedManifest: manifest,
                canvasIndex: start
            }],
            window: {
                allowClose: false,
                allowFullscreen: false,
                allowMaximize: false,
                defaultSideBarPanel: 'annotations',
                //highlightAllAnnotations: true,
                sideBarOpenByDefault: false,
                imageToolsEnabled: true,
                imageToolsOpen: false,
            },
            workspace: {
                showZoomControls: true,
                type: 'mosaic',
            },
            workspaceControlPanel: {
                enabled: false,
            },
        };
        opts.annotation = {
            adapter: (canvasId) => new TSTStorageAdapter(canvasId,annoMap),
            exportLocalStorageAnnotations: false,
            };
        const viewer = Mirador.viewer(opts,plugins);
        const act = Mirador.actions.setWindowViewType(_state.winname,'single');
        viewer.store.dispatch(act);
            
        if(annoMap) annotateMirador(viewer,annoMap);
        /*if(!annotate) {
            const el = document.createElement('style');
            el.innerHTML = '[aria-label="Create new annotation"] { display: none !important;}';
            document.head.appendChild(el);
        }*/
        return viewer;
    };
        
    const annotateMirador = function(win = _state.mirador, annoMap) {
        for(const annoarr of annoMap) {
            for(const anno of annoarr) {
                const act = Mirador.actions.receiveAnnotation(anno.page, anno.id, anno.obj);
                win.store.dispatch(act);
            }
        }
        /*
        const act4 = Mirador.actions.toggleAnnotationDisplay(_state.winname);
        win.store.dispatch(act4);
        */
    };

    const refreshMirador = function(win = _state.mirador,manifest,start,annoMap = null) {
        const act = Mirador.actions.addWindow({
            id: _state.winname,
            manifestId: manifest,
            canvasIndex: start
        });
        win.store.dispatch(act);
        if(annoMap) annotateMirador(win,annoMap);
    };

    const killMirador = function(win = _state.mirador) {
        if(win) {
            const act = Mirador.actions.removeWindow(_state.winname);
            win.store.dispatch(act);
        }
    };

    const getMirador = function() {return _state.mirador;};
    
    const getMiradorCanvasId = function(win = _state.mirador) {
            const win1 = win.store.getState().windows[_state.winname];
            return win1 ? win1.canvasId : null;
    };

    const setAnnotations = function(obj) {
        _state.annoMap = new Map(obj);
    };

    const events = {

        docClick: function(e) {
            const locel = e.target.closest('[data-loc]');
            if(locel) {
                jumpTo(locel.dataset.loc);
                return;
            }
            const lineview = e.target.closest('.line-view-icon');
            if(lineview) {
                lineView(lineview);
                return;
            }
            
            if(e.target.dataset.hasOwnProperty('scroll')) {
                e.preventDefault();
                const el = document.getElementById(e.target.href.split('#')[1]);
                el.scrollIntoView({behavior: 'smooth', inline:'end'});
            }
        },
        
        docMouseover(e) {

            const lem_inline = e.target.closest('.lem-inline');
            if(lem_inline) highlight.inline(lem_inline);
            const lem = e.target.closest('.lem');
            if(lem) highlight.apparatus(lem);

            var targ = e.target.closest('[data-anno]');
            while(targ && targ.hasAttribute('data-anno')) {
               
                //ignore if apparatus is already on the side
                if(document.getElementById('record-fat') && 
                   targ.classList.contains('app-inline') &&
                   !targ.closest('.teitext').querySelector('.diplo') ) {
                    targ = targ.parentNode;
                    continue;
                }

                toolTip.make(e,targ);
                targ = targ.parentNode;
            }
        },

        docMouseout(e) {
            if(e.target.closest('.lem') ||
               e.target.closest('.lem-inline'))
                highlight.unhighlight(e.target);
        },

        removeHyphens: function(ev) {
            ev.preventDefault();
            const hyphenRegex = new RegExp('\u00AD','g');
            var sel = window.getSelection().toString();
            sel = ev.target.closest('textarea') ? 
                sel :
                sel.replace(hyphenRegex,'');
            (ev.clipboardData || window.clipboardData).setData('Text',sel);
        },
    };

    const highlight = {
        inline(targ) {
            const par = targ.closest('div.text-block');
            if(!par) return;

            const allleft = [...par.querySelectorAll('.lem-inline')];
            const pos = allleft.indexOf(targ);
            const right = par.parentElement.querySelector('.apparatus-block');
            const allright = right.querySelectorAll('.lem');
            allright[pos].classList.add('highlit');
        },
        apparatus(targ) {
            const par = targ.closest('div.apparatus-block');
            if(!par) return;
            const allright = [...par.querySelectorAll(':scope > .app > .lem')];
            const pos = allright.indexOf(targ);
            const left = par.parentElement.querySelector('.text-block');
            const allleft = left.querySelectorAll('.lem-inline');
            allleft[pos].classList.add('highlit');
        },
        unhighlight(targ) {
            const par = targ.closest('div.wide');
            if(!par) return;
            for(const h of par.querySelectorAll('.highlit'))
                h.classList.remove('highlit');
        },
    };


    const toolTip = {
        make: function(e,targ) {
            const toolText = targ.dataset.anno || targ.querySelector('.anno-inline')?.cloneNode(true);
            if(!toolText) return;

            var tBox = document.getElementById('tooltip');
            const tBoxDiv = document.createElement('div');

            if(tBox) {
                for(const kid of tBox.childNodes) {
                    if(kid.myTarget === targ)
                        return;
                }
                tBoxDiv.appendChild(document.createElement('hr'));
            }
            else {
                tBox = document.createElement('div');
                tBox.id = 'tooltip';
                tBox.style.opacity = 0;
                tBox.style.transition = 'opacity 0.2s ease-in';
                document.body.appendChild(tBox);
                tBoxDiv.myTarget = targ;
            }

            tBox.style.top = (e.clientY + 10) + 'px';
            tBox.style.left = e.clientX + 'px';
            tBoxDiv.append(toolText);
            tBoxDiv.myTarget = targ;
            tBox.appendChild(tBoxDiv);
            targ.addEventListener('mouseleave',toolTip.remove,{once: true});
            window.getComputedStyle(tBox).opacity;
            tBox.style.opacity = 1;
        },
        remove: function(e) {
            const tBox = document.getElementById('tooltip');
            if(tBox.children.length === 1) {
                tBox.remove();
                return;
            }

            const targ = e.target;
            for(const kid of tBox.childNodes) {
                if(kid.myTarget === targ) {
                    kid.remove();
                    break;
                }
            }
            if(tBox.children.length === 1) {
                const kid = tBox.firstChild.firstChild;
                if(kid.tagName === 'HR')
                    kid.remove();
            }
        },
    };

    const jumpTo = function(n) {
        const split = n.split(':');
        const page = split[0];
        const manif = _state.mirador.store.getState().manifests[_state.manifest].json;
        // n-1 because f1 is image 0
        const canvasid = manif.sequences[0].canvases[page-1]['@id'];
        const act = Mirador.actions.setCanvas(_state.winname,canvasid);
        _state.mirador.store.dispatch(act);

        if(split[1]) {
            const annos = _state.annoMap.get(canvasid);
            // n-1 because annotation 1 is indexed 0
            const annoid = annos.items[split[1] - 1].id;
            const act2 = Mirador.actions.selectAnnotation(_state.winname,annoid);
            _state.mirador.store.dispatch(act2);
        }
    };
    
    const jumpToId = function(win = _state.mirador,id) {
        const act = Mirador.actions.setCanvas(_state.winname,id);
        win.store.dispatch(act);
    };

    const cleanLb = (par) => {
        const lbs = par.querySelectorAll('[data-nobreak]');
        for(const lb of lbs) {
            const prev = lb.previousSibling;
            if(prev && prev.nodeType === 3)
                prev.data = prev.data.trimEnd();
        }
    };

    const latestCommits = () => {
        const loc = window.location;
        if(loc.hostname.endsWith('.github.io')) {
            const sub = loc.hostname.split('.',1)[0];
            const pathsplit = loc.pathname.split('/');
            pathsplit.shift(); // pathname starts with a slash
            const repo = pathsplit.shift();
            const path = pathsplit.join('/');
            const apiurl = `https://api.github.com/repos/${sub}/${repo}/commits?path=${path}`;
            fetch(apiurl)
                .then((resp) => {
                    if(resp.ok)
                        return resp.json();
                })
                .then((data) => {
                    if(data) {
                        const date = new Date(data[0].commit.committer.date);
                        const datestr = date.toLocaleString('en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        const span = document.getElementById('latestcommit');
                        span.innerHTML = `Last updated <a href="${data[0].html_url}">${datestr}</a>.`;
                    }
                });
        }
    };

    const lineView = function(icon) {
        const par = icon.closest('.teitext');
        if(icon.classList.contains('diplo')) {
            par.classList.remove('diplo');

            const els = par.querySelectorAll('.diplo');
            for(const el of els)
                el.classList.remove('diplo');
            
            if(document.getElementById('record-fat')) {
                const apps = par.querySelectorAll('.app');
                for(const app of apps)
                    app.style.display = 'initial';
            }

            icon.title = 'diplomatic view';
        }
        else {
            icon.classList.add('diplo');
            par.classList.add('diplo');
            
            const els = par.querySelectorAll('p,div.lg,div.l,div.ab,.pb,.lb,.cb,.caesura,.milestone');
            for(const el of els)
                el.classList.add('diplo');
            
            if(document.getElementById('record-fat')) {
                const apps = par.querySelectorAll('.app');
                for(const app of apps)
                    app.style.display = 'none';
            } 
            icon.title = 'paragraph view';
        }

    };

    //window.addEventListener('load',init);

    return Object.freeze({
        init: init,
        newMirador: newMirador,
        killMirador: killMirador,
        getMirador: getMirador,
        getMiradorCanvasId: getMiradorCanvasId,
        refreshMirador: refreshMirador,
        jumpToId: jumpToId,
        annotateMirador: annotateMirador,
        setAnnotations: setAnnotations
    });
}());

export { TSTViewer };
