"use strict";(self.webpackChunktst_mirador=self.webpackChunktst_mirador||[]).push([[149],{37149:(e,t,n)=>{n.r(t),n.d(t,{default:()=>m});var r=n(28216),o=n(97779),i=n(87217),a=n(52543),c=n(11196),u=n(67294);function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function f(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function l(e,t){return l=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},l(e,t)}function p(e,t){return!t||"object"!=typeof t&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function d(e){return d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},d(e)}var y=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&l(e,t)}(a,e);var t,n,r,o,i=(r=a,o=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=d(r);if(o){var n=d(this).constructor;e=Reflect.construct(t,arguments,n)}else e=t.apply(this,arguments);return p(this,e)});function a(){return s(this,a),i.apply(this,arguments)}return t=a,(n=[{key:"render",value:function(){var e=this.props,t=e.captions,n=e.classes,r=e.audioOptions,o=e.audioResources;return u.createElement("div",{className:n.container},u.createElement("audio",Object.assign({className:n.audio},r),o.map((function(e){return u.createElement(u.Fragment,{key:e.id},u.createElement("source",{src:e.id,type:e.getFormat()}))})),t.map((function(e){return u.createElement(u.Fragment,{key:e.id},u.createElement("track",{src:e.id,label:e.getDefaultLabel(),srcLang:e.getProperty("language")}))}))))}}])&&f(t.prototype,n),a}(u.Component);y.defaultProps={audioOptions:{},audioResources:[],captions:[]};var b=n(1172),h=n(49455);const m=(0,o.qC)((0,i.Z)(),(0,a.Z)((function(){return{audio:{width:"100%"},container:{alignItems:"center",display:"flex",width:"100%"}}})),(0,r.$j)((function(e,t){var n=t.windowId;return{audioOptions:(0,b.iE)(e).audioOptions,audioResources:(0,h.Ul)(e,{windowId:n})||[],captions:(0,h.U$)(e,{windowId:n})||[]}}),null),(0,c.A)("AudioViewer"))(y)}}]);