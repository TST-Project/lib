const _state = {
    tooltipTimeout: null,
    touched: false
};

const Events = {
    docMouseover: e => {
      const doc = e.target.getRootNode();
        const go = (ee,par) => {
            if(!par) par = ee.target;
            var targ = par.closest('[data-anno]');

            if(!targ || !targ.matches(`${targ.tagName}:hover`)) return; // need tagname; see https://stackoverflow.com/questions/14795099/pure-javascript-to-check-if-something-has-hover-without-setting-on-mouseover-ou

            while(targ && targ.hasAttribute('data-anno')) {
               
                //ignore if apparatus is already on the side
                if(doc.querySelector('.record.fat') && 
                   targ.classList.contains('app-inline') &&
                   !targ.closest('.teitext').querySelector('.diplo') ) {
                    targ = targ.parentNode;
                    continue;
                }

                ToolTip.make(ee,targ);
                targ = targ.parentNode;
            }
        };
        if(doc.getElementById('tooltip')) {
            go(e);
        }
        else {
            const targ = e.target; // target gets lost sometimes
            clearTimeout(_state.tooltipTimeout);
            _state.tooltipTimeout = setTimeout(() => {
                go(e,targ);
            },300);
        }

    },
    docTouchend: e => {
        const doc = e.target.getRootNode();
        const go = ee => {
            //if(!ee.target.matches(':hover')) return; // doesn't work on Chrome?
            var targ = ee.target.closest('[data-anno]');
            while(targ && targ.hasAttribute('data-anno')) {
                //ignore if apparatus is already on the side
                if(doc.querySelector('.record.fat') && 
                   targ.classList.contains('app-inline') &&
                   !targ.closest('.teitext').querySelector('.diplo') ) {
                    targ = targ.parentNode;
                    continue;
                }

                ToolTip.make(ee,targ,true);
                targ = targ.parentNode;
            }
        };

        if(doc.getElementById('tooltip'))
          ToolTip.remove();
        
        go(e);
        _state.touched = true;
    },
    docClick: e => {
      if(_state.touched) {
        _state.touched = false;
        return;
     }
      ToolTip.remove(e);
    }
};

const ToolTip = {
    make: function(e,targ,touch=false) {
        const doc = targ.getRootNode();
        const toolText = targ.classList.contains('msid') ?
          doc.getElementById(targ.dataset.id).querySelector('.expan')?.cloneNode(true) :
          targ.dataset.anno || targ.querySelector(':scope > .anno-inline')?.cloneNode(true);
        if(!toolText) return;

        var tBox = doc.getElementById('tooltip');
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
            const body = doc === document ? document.body : doc;
            body.appendChild(tBox);
            tBoxDiv.myTarget = targ;
            tBox.animate([
                {opacity: 0 },
                {opacity: 1, easing: 'ease-in'}
                ], 200);
        }
        const yCoord = e.clientY || e.changedTouches[0].clientY;
        const xCoord = e.clientX || e.changedTouches[0].clientX;
        tBox.style.top = (yCoord + 10) + 'px';
        tBox.style.left = (xCoord + 1) + 'px';
        tBoxDiv.append(toolText);
        tBoxDiv.myTarget = targ;
        tBox.appendChild(tBoxDiv);
        const ydiff = tBox.getBoundingClientRect().bottom - document.documentElement.clientHeight;
        if(ydiff > 0)
            tBox.style.top = (yCoord - ydiff + 10) + 'px';
        if(!touch) targ.addEventListener('mouseleave',ToolTip.remove,{once: true});
    },

    remove: function(e) {
        const doc = e.target.getRootNode();
        clearTimeout(_state.tooltipTimeout);

        const tBox = doc.getElementById('tooltip');
        if(!tBox) return;

        if(!e) {
          for(const kid of tBox.childNodes)
            kid.remove();
          tBox.remove(e);
          return;
        }

        if(tBox.children.length === 1) {
            tBox.remove(e);
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

const initToolTips = (par = document) => {
  par.addEventListener('mouseover',Events.docMouseover);
  par.addEventListener('touchend',Events.docTouchend);
  par.addEventListener('click',Events.docClick);
};

export default initToolTips;
