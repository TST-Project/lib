import { Transliterate } from './transliterate.mjs';
import { MiradorModule } from './mirador.mjs';
import TSTStorageAdapter from './tstStorageAdapter.mjs';

const Mirador = MiradorModule.Mirador;
const miradorImageTools = MiradorModule.miradorImageToolsPlugin;
const miradorAnnotations = MiradorModule.miradorAnnotationPlugin;

'use strict';

const TSTViewer = (function() {
    const _state = {
        manifest: null,
        winname: 'win1',
        annoMap: new Map()
    };
    
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
        for(const l of recordcontainer.querySelectorAll('.line-view-icon'))
            lineView(l);

        recordcontainer.addEventListener('click',events.docClick);
        recordcontainer.addEventListener('mouseover',events.docMouseover);
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
        
        docMouseover: function(e) {
            var targ = e.target.closest('[data-anno]');
            while(targ && targ.hasAttribute('data-anno')) {
                toolTip.make(e,targ);
                targ = targ.parentNode;
            }

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

    const toolTip = {
        make: function(e,targ) {
            const toolText = targ.dataset.anno;
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
                tBox.style.top = (e.clientY + 10) + 'px';
                tBox.style.left = e.clientX + 'px';
                tBox.style.opacity = 0;
                tBox.style.transition = 'opacity 0.2s ease-in';
                document.body.appendChild(tBox);
                tBoxDiv.myTarget = targ;
            }

            tBoxDiv.appendChild(document.createTextNode(toolText));
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

    const cleanLb = function(par) {
        const lbs = par.querySelectorAll('[data-nobreak]');
        for(const lb of lbs) {
            const prev = lb.previousSibling;
            if(prev && prev.nodeType === 3)
                prev.data = prev.data.trimEnd();
        }
    };

    const lineView = function(icon) {
        const par = icon.closest('.teitext');
        if(icon.classList.contains('diplo')) {
            par.classList.remove('diplo');
            const els = par.querySelectorAll('.diplo');
            for(const el of els)
                el.classList.remove('diplo');
            icon.title = 'diplomatic view';
        }
        else {
            icon.classList.add('diplo');
            par.classList.add('diplo');
            const els = par.querySelectorAll('p,div.lg,div.l,.pb,.lb,.caesura,.milestone');
            for(const el of els)
                el.classList.add('diplo');
            icon.title = 'paragraph view';
        }

    };

    //window.addEventListener('load',init);

    return {
        init: init,
        newMirador: newMirador,
        killMirador: killMirador,
        getMirador: getMirador,
        getMiradorCanvasId: getMiradorCanvasId,
        refreshMirador: refreshMirador,
        jumpToId: jumpToId,
        annotateMirador: annotateMirador,
        setAnnotations: setAnnotations
    };
}());

export { TSTViewer };
