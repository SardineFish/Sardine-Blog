import"./modulepreload-polyfill.c7c6310f.js";const view="";var NEWTON_ITERATIONS=4,NEWTON_MIN_SLOPE=.001,SUBDIVISION_PRECISION=1e-7,SUBDIVISION_MAX_ITERATIONS=10,kSplineTableSize=11,kSampleStepSize=1/(kSplineTableSize-1),float32ArraySupported=typeof Float32Array=="function";function A(t,n){return 1-3*n+3*t}function B(t,n){return 3*n-6*t}function C(t){return 3*t}function calcBezier(t,n,o){return((A(n,o)*t+B(n,o))*t+C(n))*t}function getSlope(t,n,o){return 3*A(n,o)*t*t+2*B(n,o)*t+C(n)}function binarySubdivide(t,n,o,i,a){var r,c,s=0;do c=n+(o-n)/2,r=calcBezier(c,i,a)-t,r>0?o=c:n=c;while(Math.abs(r)>SUBDIVISION_PRECISION&&++s<SUBDIVISION_MAX_ITERATIONS);return c}function newtonRaphsonIterate(t,n,o,i){for(var a=0;a<NEWTON_ITERATIONS;++a){var r=getSlope(n,o,i);if(r===0)return n;var c=calcBezier(n,o,i)-t;n-=c/r}return n}function LinearEasing(t){return t}var src=function(n,o,i,a){if(!(0<=n&&n<=1&&0<=i&&i<=1))throw new Error("bezier x values must be in [0, 1] range");if(n===o&&i===a)return LinearEasing;for(var r=float32ArraySupported?new Float32Array(kSplineTableSize):new Array(kSplineTableSize),c=0;c<kSplineTableSize;++c)r[c]=calcBezier(c*kSampleStepSize,n,i);function s(l){for(var d=0,u=1,h=kSplineTableSize-1;u!==h&&r[u]<=l;++u)d+=kSampleStepSize;--u;var S=(l-r[u])/(r[u+1]-r[u]),w=d+S*kSampleStepSize,p=getSlope(w,n,i);return p>=NEWTON_MIN_SLOPE?newtonRaphsonIterate(l,w,n,i):p===0?w:binarySubdivide(l,d,d+kSampleStepSize,n,i)}return function(d){return d===0?0:d===1?1:calcBezier(s(d),o,a)}};const hljsLib="https://cdn.staticfile.org/highlight.js/11.6.0";function $(t){return document.querySelector(t)}function $$(t){return document.querySelectorAll(t)}function addClass(t,n){return[t].concat(n).join(" ")}var cid=0,pid=0;window.onload=function(){if(HTMLTemplate.Init(),initTopBar(),window.location.pathname.endsWith("/preview")){const n=JSON.parse(localStorage.getItem("sardinefish.blog.preview"));loadBlogContent(n);return}let t=/\d+$/.exec(window.location.pathname);if(t)cid=pid=parseInt(t[0]);else if(t=/pid=(\d+)/.exec(window.location.search),t)cid=pid=parseInt(t[1]);else throw new Error("Invalid url");loadBlog(pid),loadComment(pid),checkLogin(),initCommentPost(),window.addEventListener("scroll",()=>{var n=document.querySelector("#side-area"),o=n.getBoundingClientRect();o.top+o.height<=0?document.querySelector("#side-float").className="show":document.querySelector("#side-float").className="hide"}),$("#button-to-top").addEventListener("click",()=>{scrollToTop(.5)})};function scrollToTop(t){var n=.01667,o=window.scrollY/(t/n);window.scrollTo(0,window.scrollY-o),window.scrollY>0&&setTimeout(()=>scrollToTop(t-n),16)}function checkLogin(){$("#login").href="/account/login?redirect="+encodeURIComponent(window.location),SardineFish.API.User.checkAuth({}).then(t=>{document.querySelector("#account-area").className="login",document.querySelector("#user-avatar").src=`/api/user/${t}/avatar`,SardineFish.API.User.getInfo({}).then(n=>{$("#sender-avatar").src=n.avatar,$("#input-name").value=n.name,$("#input-email").value=n.email})})}function initSearch(){let t=!1;$("#search .icon-search").onclick=()=>{const n=$("#search-input").value;t?n?$("#search").submit():(t=!1,$("#search").classList.remove("expand")):(t=!0,$("#search").classList.add("expand"))}}function initTopBar(){var t=!1;$("#button-menu").addEventListener("click",function(){t?$("#top").classList.remove("extend-side"):$("#top").classList.add("extend-side"),t=!t}),initSearch()}function loadBlogContent(data){if(data.time=SardineFish.API.Utils.formatDateTime(new Date(data.time)),data.doc_type===SardineFish.API.DocType.Markdown){var unknowLanguages={};if(new Date(data.time).getTime()<1546272e6){const marked=window.marked.marked;var renderer=markedImagePostProcess(marked);marked.setOptions({highlight:function(str,lang,callback){if(lang&&hljs.getLanguage(lang))try{return hljs.highlight(lang,str).value}catch{}else lang&&!unknowLanguages[lang]&&(unknowLanguages[lang]=fetch(`${hljsLib}/languages/${lang}.min.js`).then(t=>t.text()).then(code=>{eval(code),$$(`code.lang-${lang}`).forEach(t=>hljs.highlightBlock(t))}));return hljs.highlightAuto(str).value},renderer}),data.doc=marked(data.doc)}else{var md=window.markdownit({html:!0,xhtmlOut:!1,breaks:!0,langPrefix:"lang-",linkify:!0,typographer:!1,highlight:function(t,n){if(n&&hljs.getLanguage(n))try{return hljs.highlight(n,t).value}catch{}else n&&(unknowLanguages[n]=!0);return hljs.highlightAuto(t).value}});markdownItImagePostProcess(md),md.use(markdownitEmoji),md.use(markdownitKatex),data.doc=md.render(data.doc),Object.keys(unknowLanguages).forEach(lang=>{fetch(`${hljsLib}/languages/${lang}.min.js`).then(t=>t.text()).then(code=>{eval(code),$$(`code.lang-${lang}`).forEach(t=>hljs.highlightBlock(t))})})}}document.querySelector("#article-template").dataSource=data,loadContentNav(),$("#page-title").innerText=data.title,$("#loading").style.display="none",$$(".hide-loading").forEach(t=>t.className=t.className.replace("hide-loading","")),document.head.title=document.title=data.title,Promise.resolve().then(()=>{document.querySelectorAll("app").forEach(loadApp),new Date(data.time).getTime()>=1648567159e3&&loadImageNote(),initImagePreview()})}function loadBlog(t){$("#write").href="/blog/edit/"+t,SardineFish.API.Blog.getByPid({pid:t}).then(n=>{loadBlogContent(n),$(".stats-like .stats-value").innerText=n.stats.likes}).catch(n=>{switch(n.code){case 197122:n.code=404;break;default:n.code=`0x${n.code.toString(16)}`}$("#error-code").innerText=n.code,$("#load-error").className="show",$("#sun").onclick=()=>{$("#root").className.includes("darken")?$("#root").className=$("#root").className.replace("darken",""):$("#root").className=addClass($("#root").className,"darken")},loadPuzzle()})}function loadApp(t){const n=t.getAttribute("src"),o=t.getAttribute("name"),i=t.getAttribute("scale")||1,a=document.createElement("iframe"),r=document.createElement("div");{r.className="app-wrapper";const c=document.createElement("div");{c.className="app";const d=document.createElement("div");{d.className="cover";const u=document.createElement("header");u.innerText=o,d.appendChild(u);const h=document.createElement("div");h.className="button",h.innerText="CLICK TO LOAD",h.onclick=()=>{h.onclick=null,a.src=n,c.classList.add("load")},d.appendChild(h)}c.appendChild(d);{a.className="external";const u=t.getBoundingClientRect();console.log(u),a.width=u.width,a.height=window.innerWidth>window.innerHeight?Math.floor(a.width*9/16):Math.floor(a.width*16/9),c.style.width=`${a.width}px`,c.style.height=`${a.height}px`,a.width/=i,a.height/=i,a.style.transform=`scale(${i})`,a.style.transformOrigin="top left"}c.appendChild(a)}r.appendChild(c);const s=document.createElement("div");s.className="panel",s.innerHTML=`
<div class="icon-button button-reload">refresh</div>
<a class="icon-button button-new-tab" href="${n}" target="_blank">open_in_new</a>
<div class="icon-button button-full-window">aspect_ratio</div>
<div class="icon-button button-full-screen">fullscreen</div>
`,s.querySelector(".button-reload").onclick=()=>a.src=n,s.querySelector(".button-full-window").onclick=()=>{document.body.classList.add("full-window"),c.classList.add("full-window"),c.style.width="",c.style.height="",Promise.resolve().then(()=>l())},s.querySelector(".button-full-screen").onclick=()=>c.requestFullscreen({navigationUI:"hide"}),r.appendChild(s);const l=()=>{const d=c.getBoundingClientRect();console.log(d),a.width=d.width,a.height=window.innerWidth>window.innerHeight?Math.floor(a.width*9/16):Math.floor(a.width*16/9)};window.addEventListener("resize",l),c.addEventListener("fullscreenchange",l)}t.appendChild(r)}function loadImageNote(){const t=document.querySelectorAll("img"),n=Array.from(document.querySelectorAll(".img-row img")),o=document.querySelectorAll(".img-row");for(const i of t){if(n.includes(i))continue;const a=document.createElement("aside");a.innerText=i.alt,a.classList.add("img-note"),i.insertAdjacentElement("afterend",a)}for(const i of o){const a=i.querySelectorAll("img"),r=Array.from(a).map(s=>{const l=document.createElement("aside");return l.innerText=s.alt,l.classList.add("img-note"),l}),c=document.createElement("aside");c.classList.add("img-row-note"),r.forEach(s=>c.appendChild(s)),i.insertAdjacentElement("afterend",c)}}const SizeSufix=["w1k","w600","w1k_f","w2k","s600","s800"];function appendImgSizeOption(t,n){return t=removeImgSizeSufix(t),t+"-"+n}function removeImgSizeSufix(t){const n=SizeSufix.filter(o=>t.endsWith("-"+o))[0];return n&&(t=t.substring(0,t.length-n.length-1)),t}function initImagePreview(){const t=document.querySelectorAll(".markdown-body img"),n=document.querySelector(".img-viewer"),o=n.querySelector("img"),i=()=>{!a||(a=!1,n.classList.remove("show"))};n.querySelector(".button-close").onclick=i,n.onclick=r=>{r.preventDefault(),r.stopPropagation(),i()},o.onclick=r=>{r.preventDefault(),r.stopPropagation()},window.addEventListener("wheel",r=>{a&&r.preventDefault()}),window.addEventListener("scroll",r=>{a&&r.preventDefault()});let a=!1;for(const r of t)r.onclick=()=>{a||(o.src=removeImgSizeSufix(r.src),a=!0,setTimeout(()=>{n.classList.add("show")},34))}}function loadContentNav(){setTimeout(function(){var t=document.querySelector(".markdown-body"),n=document.querySelectorAll("#content-template"),o=Array.from(t.querySelectorAll("h2,h3,h4,h5,h6,h7,h8,h9"));const i=s=>{for(var l={header:"",url:"#",children:[]};a<o.length;a++){var d=parseInt(/H(\d)/.exec(o[a].tagName)[1]);if(o[a].id=o[a].innerText,d>=s){if(l.header!=""&&d<=s)return a--,l;d==s?l={header:o[a].innerText,url:`${location.protocol}//${location.host}${location.pathname}${location.search}#${o[a].id}`,children:[]}:d>s&&l.children.push(i(s+1))}else return a--,l}return l};var a=0,r=[];for(a=0;a<o.length;a++)r.push(i(2));var c={header:$("#title").innerText,url:`${location.protocol}//${location.host}${location.pathname}${location.search}#title`,children:r};n.forEach(s=>s.dataSource=c)})}function formatTime(t){t.time=SardineFish.API.Utils.formatDateTime(new Date(t.time)),t.comments.forEach(formatTime)}function loadComment(t){SardineFish.API.Comment.getByPid({pid:t,depth:6}).then(n=>{n.forEach(formatTime);var o=document.querySelector("#comment-template");n=n.sort((i,a)=>a.pid-i.pid),o.dataSource=n,$$(".comment-render .comment").forEach(function(i){var a=i.dataset.pid,r=i.dataset.name;i.querySelector(".button-reply").addEventListener("click",function(){t=parseInt(a),$("#input-comment").dataset.text="Reply to "+r,$("#input-comment").innerHTML=""})})})}function initCommentPost(){$("#button-add-comment").addEventListener("click",function(){cid=pid,$("#input-comment").dataset.text="Tell me what you think",$("#input-comment").innerHTML=""}),$("#button-comment-send").addEventListener("click",function(){var t=$("#input-name").value,n=$("#input-email").value,o=$("#input-comment").innerText,i=CryptoJS.MD5(n).toString(),a=`https://www.gravatar.com/avatar/${i}?s=256&d=${encodeURIComponent("https://cdn-static.sardinefish.com/img/unknown-user-grey.png")}`;SardineFish.API.Comment.post({pid:cid},{name:t,email:n,text:o,avatar:a}).then(()=>{$("#input-comment").innerHTML="",loadComment(pid)})})}function loadPuzzle(){require.config({paths:{"crypto-js":"/lib/Script/crypto-js"}}),require(["crypto-js/crypto-js"],function(CryptoJS){var ans="U2FsdGVkX1/A4SaZPLVgnDY3SJxhtkwV8EgRK3WYb+spfsIOaicFaHfBBJ7ZE9lechvHNqLNQaQhAjVJxKji+w==",ansHash="ec1599cd561886e2e75238c6e826f48135dc0f7cf1d14f61cf36d1b5e5c20ae5",hints=["\u4F60\u4E00\u5B9A\u662F\u591C\u7A7A\u4E2D\u6700\u4EAE\u7684\u90A3\u9897\u2B50","\u795E\u8BF4\uFF0C\u8981\u6709\u5149\u3002","\u8FD9\u91CC\u4EC0\u4E48\u4E5F\u6CA1\u6709\uFF0C\u5173\u706F\u7761\u5427\u3002"];window.CryptoJS=CryptoJS;function AES_CBC_Decrypt(t,n){return CryptoJS.AES.decrypt(t,n,{mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding}).toString(CryptoJS.enc.Utf8)}$$("*").forEach(el=>el.addEventListener("click",e=>{try{var x=Math.floor(e.pageX/2),y=Math.floor(e.pageY/2),key=`(${x}, ${y})`,dec=AES_CBC_Decrypt(ans,key),decHash=CryptoJS.SHA256(dec);decHash!=ansHash?$("#error-msg").innerText=hints[parseInt(Math.random()*hints.length)]:eval(dec)}catch(t){$("#error-msg").innerText=hints[parseInt(Math.random()*hints.length)]}}))})}function imagePostProcess(t){const n=t;var o="https://img.sardinefish.com/",i=/((?:https?:)?\/\/[^/]*.sardinefish.com\/|(?:localhost|127.0.0.1)(?:\:\d+)?\/)(.*)/;if(atob("aHR0cDovL2ltZy5zYXJkaW5lZmlzaC5jb20v"),i.test(t)){var a=i.exec(t)[2];t=o+a,t=appendImgSizeOption(t,"s800")}return console.log(`${n} -> ${t}`),t}function markdownItImagePostProcess(t){var n=t.renderer.rules.image;const o=t.renderer.rules.html_block,i=t.renderer.rules.html_inline;t.renderer.rules.image=function(r,c,s,l,d){var u=r[c],h=u.attrs[u.attrIndex("src")][1];return h=imagePostProcess(h),console.log(`${u.attrs[u.attrIndex("src")][1]} -> ${h}`),u.attrs[u.attrIndex("src")][1]=h,n(r,c,s,l,d)};const a=r=>{const c=r.content,s=document.createElement("div");s.innerHTML=c;for(const l of s.querySelectorAll("img"))l.src=imagePostProcess(l.src);r.content=s.innerHTML};t.renderer.rules.html_block=(r,c,s,l,d)=>{var u=r[c];return a(u),o(r,c,s,l,d)},t.renderer.rules.html_inline=(r,c,s,l,d)=>{var u=r[c];return a(u),i(r,c,s,l,d)}}function markedImagePostProcess(t){var n=new t.Renderer,o=n.image;return n.image=function(i,a,r){var c=i;return c=imagePostProcess(c),console.log(`${i} -> ${c}`),i=c,o.bind(n)(i,a,r)},n}function animate(t,n,o=i=>i){return new Promise((i,a)=>{let r=0,c=0;const s=l=>{r===0&&(r=l),c=(l-r)/1e3,c>=n&&(c=n);try{t(o(c/n))}catch(d){a(d);return}c===n?i():requestAnimationFrame(s)};t(0),requestAnimationFrame(s)})}const SEQUENCE_ABORTED=Symbol("SEQUENCE_ABORTED");function sequence(t){const n={abort:()=>{i.abortSignal=!0}},o=animate,i={abortSignal:!1,animate(a,r,c=s=>s){return o(s=>{if(this.abortSignal)throw SEQUENCE_ABORTED;a(s)},r,c)}};return t(i).catch(a=>{if(a!==SEQUENCE_ABORTED)throw a}),n}function randRange(t,n){return Math.random()*(n-t)+t}function lerp(t,n,o){return(n-t)*o+t}function timeout(t){return new Promise(n=>{setTimeout(n,t*1e3)})}function likeButton(){$$(".stats-like").forEach(t=>{const n=t.querySelector(".like-button"),o=24;let i="idle",a=null;const r=n.querySelector(".heart-fill"),c=t.querySelector(".stats-value");let s=1;const l=h=>{if(i==="hit")return;i="hold";const S=n.getBoundingClientRect(),w=(h.clientX-S.x)/S.width,p=(h.clientY-S.y)/S.height;console.log(r,w,p),r.cx.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,w*o),r.cy.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,p*o),animate(T=>{r.r.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,36*T)},.5,src(0,0,.55,1)),a=sequence(async T=>{for(let f=0;;f+=.3){s+=.1,s=Math.min(2,s),f=Math.min(f,10);const b=randRange(.05,.05),v=randRange(-f,f),L=randRange(-f,f);await T.animate(m=>{const E=v*m,g=L*m;n.style.translate=`${E}px ${g}px`},b)}})},d=()=>{i==="hold"&&(a.abort(),n.style.translate="",i="idle",r.r.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,0))},u=h=>{if(h.preventDefault(),h.stopPropagation(),i!=="idle"){a.abort(),n.style.translate="",i="hit",t.classList.add("hit"),pid>0&&SardineFish.API.PostData.like({pid}).catch(p=>{console.error(p)}).then(p=>{c.innerText=p});const S=["#3ed6fa","#fa603e","#9de35d","#8f3bdd","#ffe376"],w=16;for(let p=0;p<w;++p){const T=p/w*Math.PI*2,f=Math.cos(T),b=Math.sin(T),v=[14,16][p%2]*s,L=[28,24][p%2]*s*s,m=document.createElementNS("http://www.w3.org/2000/svg","line");m.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,.5*o+f*v),m.y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,.5*o+b*v),m.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,.5*o+f*v),m.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,.5*o+b*v),m.style.strokeWidth=[1.4,1][p%2],m.style.stroke=S[p%S.length],m.style.opacity=0,console.log(m),n.appendChild(m),sequence(async E=>{await timeout(.15),m.style.opacity=1,E.animate(g=>{const k=lerp(v,L,g);m.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,.5*o+f*k),m.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,.5*o+b*k)},.1,src(0,0,.4,1)),await timeout(.05),await E.animate(g=>{const k=lerp(v,L,g);m.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,.5*o+f*k),m.y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER,.5*o+b*k)},.3,src(0,0,.4,1)),await E.animate(g=>{m.style.opacity=1-g},.05),n.removeChild(m)}),sequence(async E=>{await E.animate(g=>{n.style.transform=`scale(${lerp(1,1.2,g)})`},.1,src(.57,-.77,.25,1)),await E.animate(g=>{n.style.transform=`scale(${lerp(1.1,1,g)})`},.2,src(0,0,.2,1))})}}s=1};n.addEventListener("mousedown",l),n.addEventListener("touchstart",h=>l(h.touches[0])),window.addEventListener("mouseup",d),window.addEventListener("touchend",h=>{d()}),n.addEventListener("mouseup",u),n.addEventListener("touchend",u)})}likeButton();