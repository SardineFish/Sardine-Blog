import"./modulepreload-polyfill.c7c6310f.js";const view="",hljsLib="https://cdn.staticfile.org/highlight.js/11.6.0";function $(t){return document.querySelector(t)}function $$(t){return document.querySelectorAll(t)}function addClass(t,n){return[t].concat(n).join(" ")}var cid=0,pid=0;window.onload=function(){if(HTMLTemplate.Init(),initTopBar(),window.location.pathname.endsWith("/preview")){const n=JSON.parse(localStorage.getItem("sardinefish.blog.preview"));loadBlogContent(n);return}let t=/\d+$/.exec(window.location.pathname);if(t)cid=pid=parseInt(t[0]);else if(t=/pid=(\d+)/.exec(window.location.search),t)cid=pid=parseInt(t[1]);else throw new Error("Invalid url");loadBlog(pid),loadComment(pid),checkLogin(),initCommentPost(),window.addEventListener("scroll",()=>{var n=document.querySelector("#side-area"),c=n.getBoundingClientRect();c.top+c.height<=0?document.querySelector("#side-float").className="show":document.querySelector("#side-float").className="hide"}),$("#button-to-top").addEventListener("click",()=>{scrollToTop(.5)})};function scrollToTop(t){var n=.01667,c=window.scrollY/(t/n);window.scrollTo(0,window.scrollY-c),window.scrollY>0&&setTimeout(()=>scrollToTop(t-n),16)}function checkLogin(){$("#login").href="/account/login?redirect="+encodeURIComponent(window.location),SardineFish.API.User.checkAuth({}).then(t=>{document.querySelector("#account-area").className="login",document.querySelector("#user-avatar").src=`/api/user/${t}/avatar`,SardineFish.API.User.getInfo({}).then(n=>{$("#sender-avatar").src=n.avatar,$("#input-name").value=n.name,$("#input-email").value=n.email})})}function initSearch(){let t=!1;$("#search .icon-search").onclick=()=>{const n=$("#search-input").value;t?n?$("#search").submit():(t=!1,$("#search").classList.remove("expand")):(t=!0,$("#search").classList.add("expand"))}}function initTopBar(){var t=!1;$("#button-menu").addEventListener("click",function(){t?$("#top").classList.remove("extend-side"):$("#top").classList.add("extend-side"),t=!t}),initSearch()}function loadBlogContent(data){if(data.time=SardineFish.API.Utils.formatDateTime(new Date(data.time)),data.doc_type===SardineFish.API.DocType.Markdown){var unknowLanguages={};if(new Date(data.time).getTime()<1546272e6){const marked=window.marked.marked;var renderer=markedImagePostProcess(marked);marked.setOptions({highlight:function(str,lang,callback){if(lang&&hljs.getLanguage(lang))try{return hljs.highlight(lang,str).value}catch{}else lang&&!unknowLanguages[lang]&&(unknowLanguages[lang]=fetch(`${hljsLib}/languages/${lang}.min.js`).then(t=>t.text()).then(code=>{eval(code),$$(`code.lang-${lang}`).forEach(t=>hljs.highlightBlock(t))}));return hljs.highlightAuto(str).value},renderer}),data.doc=marked(data.doc)}else{var md=window.markdownit({html:!0,xhtmlOut:!1,breaks:!0,langPrefix:"lang-",linkify:!0,typographer:!1,highlight:function(t,n){if(n&&hljs.getLanguage(n))try{return hljs.highlight(n,t).value}catch{}else n&&(unknowLanguages[n]=!0);return hljs.highlightAuto(t).value}});markdownItImagePostProcess(md),md.use(markdownitEmoji),md.use(markdownitKatex),data.doc=md.render(data.doc),Object.keys(unknowLanguages).forEach(lang=>{fetch(`${hljsLib}/languages/${lang}.min.js`).then(t=>t.text()).then(code=>{eval(code),$$(`code.lang-${lang}`).forEach(t=>hljs.highlightBlock(t))})})}}document.querySelector("#article-template").dataSource=data,loadContentNav(),$("#page-title").innerText=data.title,$("#loading").style.display="none",$$(".hide-loading").forEach(t=>t.className=t.className.replace("hide-loading","")),document.head.title=document.title=data.title,Promise.resolve().then(()=>{document.querySelectorAll("app").forEach(loadApp),new Date(data.time).getTime()>=1648567159e3&&loadImageNote(),initImagePreview()})}function loadBlog(t){$("#write").href="/blog/edit/"+t,SardineFish.API.Blog.getByPid({pid:t}).then(n=>{loadBlogContent(n)}).catch(n=>{switch(n.code){case 197122:n.code=404;break;default:n.code=`0x${n.code.toString(16)}`}$("#error-code").innerText=n.code,$("#load-error").className="show",$("#sun").onclick=()=>{$("#root").className.includes("darken")?$("#root").className=$("#root").className.replace("darken",""):$("#root").className=addClass($("#root").className,"darken")},loadPuzzle()})}function loadApp(t){const n=t.getAttribute("src"),c=t.getAttribute("name"),i=t.getAttribute("scale")||1,o=document.createElement("iframe"),a=document.createElement("div");{a.className="app-wrapper";const r=document.createElement("div");{r.className="app";const d=document.createElement("div");{d.className="cover";const u=document.createElement("header");u.innerText=c,d.appendChild(u);const m=document.createElement("div");m.className="button",m.innerText="CLICK TO LOAD",m.onclick=()=>{m.onclick=null,o.src=n,r.classList.add("load")},d.appendChild(m)}r.appendChild(d);{o.className="external";const u=t.getBoundingClientRect();console.log(u),o.width=u.width,o.height=window.innerWidth>window.innerHeight?Math.floor(o.width*9/16):Math.floor(o.width*16/9),r.style.width=`${o.width}px`,r.style.height=`${o.height}px`,o.width/=i,o.height/=i,o.style.transform=`scale(${i})`,o.style.transformOrigin="top left"}r.appendChild(o)}a.appendChild(r);const s=document.createElement("div");s.className="panel",s.innerHTML=`
<div class="icon-button button-reload">refresh</div>
<a class="icon-button button-new-tab" href="${n}" target="_blank">open_in_new</a>
<div class="icon-button button-full-window">aspect_ratio</div>
<div class="icon-button button-full-screen">fullscreen</div>
`,s.querySelector(".button-reload").onclick=()=>o.src=n,s.querySelector(".button-full-window").onclick=()=>{document.body.classList.add("full-window"),r.classList.add("full-window"),r.style.width="",r.style.height="",Promise.resolve().then(()=>l())},s.querySelector(".button-full-screen").onclick=()=>r.requestFullscreen({navigationUI:"hide"}),a.appendChild(s);const l=()=>{const d=r.getBoundingClientRect();console.log(d),o.width=d.width,o.height=window.innerWidth>window.innerHeight?Math.floor(o.width*9/16):Math.floor(o.width*16/9)};window.addEventListener("resize",l),r.addEventListener("fullscreenchange",l)}t.appendChild(a)}function loadImageNote(){const t=document.querySelectorAll("img"),n=Array.from(document.querySelectorAll(".img-row img")),c=document.querySelectorAll(".img-row");for(const i of t){if(n.includes(i))continue;const o=document.createElement("aside");o.innerText=i.alt,o.classList.add("img-note"),i.insertAdjacentElement("afterend",o)}for(const i of c){const o=i.querySelectorAll("img"),a=Array.from(o).map(s=>{const l=document.createElement("aside");return l.innerText=s.alt,l.classList.add("img-note"),l}),r=document.createElement("aside");r.classList.add("img-row-note"),a.forEach(s=>r.appendChild(s)),i.insertAdjacentElement("afterend",r)}}const SizeSufix=["w1k","w600","w1k_f","w2k","s600","s800"];function appendImgSizeOption(t,n){return t=removeImgSizeSufix(t),t+"-"+n}function removeImgSizeSufix(t){const n=SizeSufix.filter(c=>t.endsWith("-"+c))[0];return n&&(t=t.substring(0,t.length-n.length-1)),t}function initImagePreview(){const t=document.querySelectorAll(".markdown-body img"),n=document.querySelector(".img-viewer"),c=n.querySelector("img"),i=()=>{!o||(o=!1,n.classList.remove("show"))};n.querySelector(".button-close").onclick=i,n.onclick=a=>{a.preventDefault(),a.stopPropagation(),i()},c.onclick=a=>{a.preventDefault(),a.stopPropagation()},window.addEventListener("wheel",a=>{o&&a.preventDefault()}),window.addEventListener("scroll",a=>{o&&a.preventDefault()});let o=!1;for(const a of t)a.onclick=()=>{o||(c.src=removeImgSizeSufix(a.src),o=!0,setTimeout(()=>{n.classList.add("show")},34))}}function loadContentNav(){setTimeout(function(){var t=document.querySelector(".markdown-body"),n=document.querySelectorAll("#content-template"),c=Array.from(t.querySelectorAll("h2,h3,h4,h5,h6,h7,h8,h9"));const i=s=>{for(var l={header:"",url:"#",children:[]};o<c.length;o++){var d=parseInt(/H(\d)/.exec(c[o].tagName)[1]);if(c[o].id=c[o].innerText,d>=s){if(l.header!=""&&d<=s)return o--,l;d==s?l={header:c[o].innerText,url:`${location.protocol}//${location.host}${location.pathname}${location.search}#${c[o].id}`,children:[]}:d>s&&l.children.push(i(s+1))}else return o--,l}return l};var o=0,a=[];for(o=0;o<c.length;o++)a.push(i(2));var r={header:$("#title").innerText,url:`${location.protocol}//${location.host}${location.pathname}${location.search}#title`,children:a};n.forEach(s=>s.dataSource=r)})}function formatTime(t){t.time=SardineFish.API.Utils.formatDateTime(new Date(t.time)),t.comments.forEach(formatTime)}function loadComment(t){SardineFish.API.Comment.getByPid({pid:t,depth:6}).then(n=>{n.forEach(formatTime);var c=document.querySelector("#comment-template");n=n.sort((i,o)=>o.pid-i.pid),c.dataSource=n,$$(".comment-render .comment").forEach(function(i){var o=i.dataset.pid,a=i.dataset.name;i.querySelector(".button-reply").addEventListener("click",function(){window.cid=parseInt(o),$("#input-comment").dataset.text="Reply to "+a,$("#input-comment").innerHTML=""})})})}function initCommentPost(){$("#button-add-comment").addEventListener("click",function(){cid=pid,$("#input-comment").dataset.text="Tell me what you think",$("#input-comment").innerHTML=""}),$("#button-comment-send").addEventListener("click",function(){var t=$("#input-name").value,n=$("#input-email").value,c=$("#input-comment").innerText,i=CryptoJS.MD5(n).toString(),o=`https://www.gravatar.com/avatar/${i}?s=256&d=${encodeURIComponent("https://cdn-static.sardinefish.com/img/unknown-user-grey.png")}`;SardineFish.API.Comment.post({pid:cid},{name:t,email:n,text:c,avatar:o}).then(()=>{$("#input-comment").innerHTML="",loadComment(pid)})})}function loadPuzzle(){require.config({paths:{"crypto-js":"/lib/Script/crypto-js"}}),require(["crypto-js/crypto-js"],function(CryptoJS){var ans="U2FsdGVkX1/A4SaZPLVgnDY3SJxhtkwV8EgRK3WYb+spfsIOaicFaHfBBJ7ZE9lechvHNqLNQaQhAjVJxKji+w==",ansHash="ec1599cd561886e2e75238c6e826f48135dc0f7cf1d14f61cf36d1b5e5c20ae5",hints=["\u4F60\u4E00\u5B9A\u662F\u591C\u7A7A\u4E2D\u6700\u4EAE\u7684\u90A3\u9897\u2B50","\u795E\u8BF4\uFF0C\u8981\u6709\u5149\u3002","\u8FD9\u91CC\u4EC0\u4E48\u4E5F\u6CA1\u6709\uFF0C\u5173\u706F\u7761\u5427\u3002"];window.CryptoJS=CryptoJS;function AES_CBC_Decrypt(t,n){return CryptoJS.AES.decrypt(t,n,{mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding}).toString(CryptoJS.enc.Utf8)}$$("*").forEach(el=>el.addEventListener("click",e=>{try{var x=Math.floor(e.pageX/2),y=Math.floor(e.pageY/2),key=`(${x}, ${y})`,dec=AES_CBC_Decrypt(ans,key),decHash=CryptoJS.SHA256(dec);decHash!=ansHash?$("#error-msg").innerText=hints[parseInt(Math.random()*hints.length)]:eval(dec)}catch(t){$("#error-msg").innerText=hints[parseInt(Math.random()*hints.length)]}}))})}function imagePostProcess(t){const n=t;var c="https://img.sardinefish.com/",i=/((?:https?:)?\/\/[^/]*.sardinefish.com\/|(?:localhost|127.0.0.1)(?:\:\d+)?\/)(.*)/;if(atob("aHR0cDovL2ltZy5zYXJkaW5lZmlzaC5jb20v"),i.test(t)){var o=i.exec(t)[2];t=c+o,t=appendImgSizeOption(t,"s800")}return console.log(`${n} -> ${t}`),t}function markdownItImagePostProcess(t){var n=t.renderer.rules.image;const c=t.renderer.rules.html_block,i=t.renderer.rules.html_inline;t.renderer.rules.image=function(a,r,s,l,d){var u=a[r],m=u.attrs[u.attrIndex("src")][1];return m=imagePostProcess(m),console.log(`${u.attrs[u.attrIndex("src")][1]} -> ${m}`),u.attrs[u.attrIndex("src")][1]=m,n(a,r,s,l,d)};const o=a=>{const r=a.content,s=document.createElement("div");s.innerHTML=r;for(const l of s.querySelectorAll("img"))l.src=imagePostProcess(l.src);a.content=s.innerHTML};t.renderer.rules.html_block=(a,r,s,l,d)=>{var u=a[r];return o(u),c(a,r,s,l,d)},t.renderer.rules.html_inline=(a,r,s,l,d)=>{var u=a[r];return o(u),i(a,r,s,l,d)}}function markedImagePostProcess(t){var n=new t.Renderer,c=n.image;return n.image=function(i,o,a){var r=i;return r=imagePostProcess(r),console.log(`${i} -> ${r}`),i=r,c.bind(n)(i,o,a)},n}