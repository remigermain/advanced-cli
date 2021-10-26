var G=Object.create;var d=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var v=Object.getPrototypeOf,P=Object.prototype.hasOwnProperty;var E=o=>d(o,"__esModule",{value:!0});var R=(o,t)=>{E(o);for(var e in t)d(o,e,{get:t[e],enumerable:!0})},S=(o,t,e)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of k(t))!P.call(o,n)&&n!=="default"&&d(o,n,{get:()=>t[n],enumerable:!(e=V(t,n))||e.enumerable});return o},w=o=>S(E(d(o!=null?G(v(o)):{},"default",o&&o.__esModule&&"default"in o?{get:()=>o.default,enumerable:!0}:{value:o,enumerable:!0})),o);R(exports,{default:()=>T});var u=w(require("colorette"));function f(o){for(let t in o)return!1;return!0}function C(o,t){let e=[],n=-t.length,r=0;if(!o)return e;for(;r<o.length;)o[r]==t?(e.push(o.substring(n+t.length,r)),n=r,r+=t.length):t?r++:e.push(o[r++]);return t&&e.push(o.substring(n+t.length,o.length)),e}function O(o,t){for(let e=0;e<o.length;e++)if(o[e]===t)return!0;return!1}var c=w(require("colorette")),b=o=>`Found argument '${(0,c.yellow)(`-${o}`)}' which wasn't expected, or isn't valid in this context.`,A=o=>`Empty argument '${(0,c.yellow)(o)}' which wasn't expected.`,N=o=>`No Such command '${(0,c.yellow)(o)}'`,I=o=>`first argument '${(0,c.yellow)(o)}' need to be a command, not flags`,$=(o,t)=>`Invalid arugments for flag '${(0,c.yellow)(o)}', ${t}`,y=(o,t)=>`Need ${(0,c.yellow)(t)} arguments after flag '${(0,c.yellow)(`--${o}`)}'.`,F=`Invalid formating flag, need to be '${(0,c.yellow)("flag")}=${(0,c.yellow)("value")}(${(0,c.yellow)(",value...")})'`,D=o=>`need '${(0,c.yellow)(o.constructor.name.toLowerCase())}' arguments.`,_=`need a valid boolean, choice are '${(0,c.yellow)("true")}' or '${(0,c.yellow)("false")}'`,L=`need a valid ${(0,c.italic)((0,c.yellow)("number"))}.`;var j=class{constructor(t,e,n={}){this.name=t;this.description=e;this.commands={};this.arguments={};this.errors=[];this.argv=[];this.options={defaultArg:!0,...n},this.options.defaultArg&&(this.addArgument("help",{alias:"h",description:"Prints help information",call({parser:r}){r.usage()}}),this.options.version&&this.addArgument("version",{alias:"v",description:"Print version info and exit",call({options:r,name:s}){console.info(`${s} ${r.version}`)}}))}checkArguments(t,e){if(e.name in this.arguments)throw new Error(`duplicate options '${e.name}'`);if(e.name.length<2)throw new Error(`name arguments '${e.name}' need to be upper than one char`);if(this.options.inline&&O(e.name,"="))throw new Error(`name arguments '${e.name}' can't contains '${(0,u.yellow)("=")}' in here name`);e.params?e.params.forEach(r=>{if(r.type===void 0)throw new Error(`arguments '${e.name}' not have 'type'`)}):e.params=[];let n=e.alias;if(n){if(t[n]!==void 0)throw new Error(`duplicate alias options '${n}`);if(n.length!=1)throw new Error(`alias options '${n}' need to be only one char`);t[n]=e}}addArgument(t,e={}){let n=e;n.name=t,this.checkArguments(this.arguments,n),this.arguments[t]=n}addCommand(t,e,n={}){if(t in this.commands)throw new Error(`Command '${t}' already set`);if(t.length<=1)throw new Error(`Command '${t}' need to be more length`);let r=n;if(r.name=t,r.description=e,!n.arguments)r.arguments={};else{let s={...r.arguments};for(let i in n.arguments)r.arguments[i].name=i,this.checkArguments(s,r.arguments[i]);r.arguments=s}this.commands[t]=r}checkDefault(t){if(t.default!==void 0)return t.default;throw new Error(D(t.type))}convertValue(t,e,n){if(e.validator)return e.validator(n,t);if(e.type==Number){let r=Number(n);if(Number.isNaN(r))throw new Error(L);return r}else if(e.type===Boolean)switch(n){case"true":case"yes":return!0;case"false":case"no":return!1;default:throw new Error(_)}return n}advFlagInline(t,e,n,r,s){let i=n[s[0]],a=[];if(r[i.name]=a,i.alias&&(r[i.alias]=a),s.length!=2)return this.addError(F,e,2),e+1;let l=C(s[1],",");if(l.length>i.params.length)return this.addError(y(i.name,i.params.length),e,s[0].length+2),e+1;let h=2+i.name.length+1;for(let m=0;m<i.params.length;m++){let p=i.params[m],g=m>=l.length;try{g?a.push(this.checkDefault(p)):a.push(this.convertValue(a,p,l[m]))}catch(M){this.addError($(i.name,M.message),e,h,g?0:l[m].length)}finally{g||(h+=l[m].length+1)}}return e+1}advFlag(t,e,n,r,s){let i=[];if(n[r.name]=i,r.alias&&(n[r.alias]=i),!r.params.length)return e;let a=0;for(let l=0;l<r.params.length;l++){let h=r.params[l],m=e+l>=t.length,p=!m&&t[e+l][0]==="-"||!1;try{p?(a++,i.push(this.checkDefault(h))):m?i.push(this.checkDefault(h)):i.push(this.convertValue(i,h,t[e+l]))}catch(g){return this.addError($(s,g.message),e),e}}return e+r.params.length-a}parseMulti(t,e,n,r,s){if(n.length==2)return this.addError(A("--"),s,2,n.length-2),s+1;let i=n.substring(2),a=this.options.inline?C(i,"="):[i];return r[a[0]]===void 0?(this.addError(b(i),s,2,n.length-2),s+1):!this.options.inline||a.length==1?this.advFlag(e,s+1,t,r[i],i):this.advFlagInline(e,s,r,t,a)}parseSimple(t,e,n,r,s){let i=s;for(let a=1;a<=n.length-1;a++){let l=r[n[a]];l!==void 0?i=this.advFlag(e,i+1,t,l,n[a]):this.addError(b(n[a]),s,a,1)}return Math.max(s+1,i)}parseFlags(t,e,n=0){let r={},s=[];for(;n<t.length&&t[n]!==this.options.stopFlags;){let i=t[n];i[0]!="-"?(s.push(i),n++):i[1]=="-"?n=this.parseMulti(r,t,i,e,n):i.length!=1?n=this.parseSimple(r,t,i,e,n):this.addError(A("-"),n++)}for(t[n]===this.options.stopFlags&&n++;n<t.length;)s.push(t[n++]);return[r,s]}parse(t){if(this.argv=t,t.length==0)return this.usage(),!0;let e=this.arguments,n;if(!f(this.commands)){if(!(t[0]in this.commands))return this.addError(t[0][0]=="-"?I(t[0]):N(t[0]),0),!1;n=this.commands[t[0]],e={...e,...n.arguments},e.help&&(e.help.call=({parser:l,cmd:h})=>{h&&l.commandUsage(h)})}let[r,s]=this.parseFlags(t,e,n?1:0),i=this.createContext(r,s,n);if(this.errors.length)return!1;let a=this.getCall(r,e,n);return a&&a(i),!0}getCall(t,e,n){for(let r in t){let s=e[r].call;if(s)return s}if(n&&n.call)return n.call}get context(){if(this.ctx===void 0)throw new Error("You need to call 'parse' before access context");return this.ctx}createContext(t,e,n){return this.ctx={flags:t,anyArgs:e,parser:this,name:this.name,description:this.description,options:this.options,argv:this.argv},n&&(this.ctx.cmd=n),this.ctx}addError(t,e,n,r){let s=this.errors.find(i=>i.argvi===e&&i.start===n&&i.end===r);s?s.text.push(t):this.errors.push({text:[t],argvi:e,start:n,end:r})}printError(t){let e=`${this.name} ${this.argv.join(" ")}
`,n=t===void 0?this.errors:[...this.errors].splice(0,t),r="";if(n.forEach(s=>{r+=`${(0,u.red)((0,u.bold)("error"))}: ${s.text.join(`
`+" ".repeat(7))}
`;let i=s.argvi+this.name.length+1;for(let h=0;h<s.argvi;h++)i+=this.argv[h].length;r+=`${e}${" ".repeat(i)}`;let a=this.argv[s.argvi]?.length||1;s.start=s.start??0,s.end=s.end??a-s.start,r+=(0,u.red)("~".repeat(s.start))+(0,u.red)((0,u.bold)("^".repeat(s.end)));let l=a-(s.start+s.end);l>0&&(r+=(0,u.red)("~".repeat(l))),r+=`
`}),this.errors.length>=5){let s=this.errors.reduce((i,a)=>a.text.length+i,0);r+=`total errors: ${(0,u.red)((0,u.bold)(s))}`}console.error(r.trim())}formatOptions(t,e="Options:"){let n={};for(let a in t)n[t[a].name]=t[a];let r={},s=0;for(let a in n){let l=n[a];r[a]=a.length,l.params&&l.params.length&&(r[a]+=l.params.reduce((h,m)=>h+m.type.name.length+3,0)),s=Math.max(s,r[a])}let i=e+`
`;for(let a in n){let l=n[a];i+=`${l.alias?`-${l.alias}, `:"    "}--${a}`,l.params&&(i+=l.params.reduce((h,m)=>`${h}<${m.type.constructor.name.toLowerCase()}> `,"")),i+=`${" ".repeat(s-r[a]+1)}${l.description??(0,u.italic)("no information.")}
`}return i}formatCommands(t){let e=0;for(let r in t)e=Math.max(e,r.length);let n=`Commands:
`;for(let r in t)n+=`  ${r}${" ".repeat(e-r.length)} ${t[r].description}
`;return n}commandUsage(t){if(typeof t=="string"){let n=this.commands[t];if(!n)throw new Error(`not found '${t}' command.`);t=n}let e="";e+=`Usage: ${this.name} ${t.name} `,e+=this.options.info??`[OPTIONS]

`,e+=t.description,this.arguments&&(e+=`

`+this.formatOptions(this.arguments,"Global options:")),t.arguments&&(e+=`

`+this.formatOptions(t.arguments,"Command options:")),this.options.footer&&(e+=`

${this.options.footer}`),console.log(e.trim())}usage(){let t="";t+=`Usage: ${this.name} `,t+=this.options.info??`${f(this.commands)?"":"COMMAND"} [OPTIONS]

`,t+=this.description,f(this.arguments)||(t+=`

`+this.formatOptions(this.arguments)),f(this.commands)||(t+=`

`+this.formatCommands(this.commands)),this.options.footer&&(t+=`

${this.options.footer}`),console.info(t.trim())}},T=j;0&&(module.exports={});
