"use strict";function n(n,o){const s=[];let t=0,r=0;if(!n)return s;for(;n[r]==o;)r++;for(;r<n.length;)if(n[r]==o){for(s.push(n.substring(t,r));n[r]==o;)r++;t=r}else r++;return t!=n.length&&s.push(n.substring(t,n.length)),s}function o(n,o,s){return s+1}function s(n,o,s){return s+1}function t(o,s,t,r){if(!r.length)return t+1;if(o.options.inline){const[s,...e]=n(r,"=");e.length?1==e.length?o.flags[s]=n(e[0],","):o.errors.push({text:"invalid formating flag",argv:t}):o.flags[r]=[]}else o.flags[r]=[];return t+1}function r(n,o,s){for(let t=1;t<o[s].length;t++){const r=o[s][t];n.flags[r]=[]}return s+1}Object.defineProperty(exports,"__esModule",{value:!0}),exports.debug=function(n){console.log(`_: [ ${n._.join(", ")} ]`),console.log("flags: {"),Object.keys(n.flags).forEach((o=>{console.log(`\t${o}: [ ${n.flags[o].join(", ")} ]`)})),console.log("}"),console.log(`errors: [ ${n.errors.join(", ")} ]`)},exports.haveErrors=function(n){return 0!=n.errors.length},exports.parser=function(n,e={}){const l={_:[],flags:{},errors:[],options:Object.assign({inline:!0,stopFlags:null},e)};let g,u;l.options.arguments||(l.options.arguments={}),l.options.commands||(l.options.commands={}),!function(n){for(const o in n)return!1;return!0}(l.options.arguments)?(g=o,u=s):(g=t,u=r);let i=0;for(;i<n.length&&n[i]!==e.stopFlags;){const o=n[i];"-"!==o[0]?l._.push(n[i++]):i="-"===o[1]?g(l,n,i,o.substring(2)):u(l,n,i)}for(;i<n.length;)l._.push(n[i++]);return l},exports.printErrors=function(n){console.log("printErrors")},exports.usage=function(n){console.log("usage")},exports.usageCommand=function(n){console.log("usageCommand")};
