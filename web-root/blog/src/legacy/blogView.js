import "../style/view.scss";
import BezierEasing from "bezier-easing";
// import SardineFish from "sardinefish";

const hljsLib = "https://cdn.staticfile.org/highlight.js/11.6.0";

/**
 * @typedef {import("sardinefish")}
 */

/**
 * 
 * @param {String} selector
 * @returns {HTMLElement} 
 */
function $(selector)
{
    return document.querySelector(selector);
}
/**
 * 
 * @param {String} selector
 * @returns {Array<HTMLElement>} 
 */
function $$(selector)
{
    return document.querySelectorAll(selector);
}

function addClass(className, newClass)
{
    return [className].concat(newClass).join(" ");
}

var cid = 0;
var pid = 0;

window.onload = function ()
{
    HTMLTemplate.Init();
    initTopBar();

    if (window.location.pathname.endsWith("/preview"))
    {
        const blog = JSON.parse(localStorage.getItem("sardinefish.blog.preview"));
        loadBlogContent(blog);
        return;
    }

    let caps = /\d+$/.exec(window.location.pathname);
    if (!caps)
    {
        caps = /pid=(\d+)/.exec(window.location.search);
        if (caps)
            cid = pid = parseInt(caps[1]);
        else
            throw new Error("Invalid url");
    }
    else
    {
        cid = pid = parseInt(caps[0]);
    }
    

    loadBlog(pid);
    loadComment(pid);

    checkLogin();
    initCommentPost();


    window.addEventListener("scroll", () =>
    {
        var content = document.querySelector("#side-area");
        var bound = content.getBoundingClientRect();
        if (bound.top + bound.height <= 0)
        {
            document.querySelector("#side-float").className = "show";
        }
        else
        {
            document.querySelector("#side-float").className = "hide";
        }
    });

    $("#button-to-top").addEventListener("click", () =>
    {
        scrollToTop(0.5);
    });

};

function scrollToTop(time)
{
    var dt = 0.01667;
    var dh = window.scrollY / (time / dt);
    window.scrollTo(0, window.scrollY - dh);
    if (window.scrollY > 0)
        setTimeout(() => scrollToTop(time - dt), 16);
}

function checkLogin()
{
    $("#login").href = "/account/login?redirect=" + encodeURIComponent(window.location);
    SardineFish.API.User.checkAuth({}).then(uid =>
    {
        document.querySelector("#account-area").className = "login";
        document.querySelector("#user-avatar").src = `/api/user/${uid}/avatar`;
        SardineFish.API.User.getInfo({}).then(info =>
        {
            $("#sender-avatar").src = info.avatar;
            $("#input-name").value = info.name;
            $("#input-email").value = info.email;
        });
    });
}

function initSearch()
{
    let expand = false;
    $("#search .icon-search").onclick = () =>
    {
        const value = $("#search-input").value;
        if (!expand)
        {
            expand = true;
            $("#search").classList.add("expand");
        }
        else if (!value)
        {
            expand = false;
            $("#search").classList.remove("expand");
        }
        else
        {
            $("#search").submit();
        }
    };
}

function initTopBar()
{
    var extend = false;
    $("#button-menu").addEventListener("click", function ()
    {
        if (!extend)
        {
           
            $("#top").classList.add("extend-side");
        }
        else
            $("#top").classList.remove("extend-side");
        extend = !extend;
    });
    initSearch();
}

function loadBlogContent(data)
{
    data.time = SardineFish.API.Utils.formatDateTime(new Date(data.time));
    if (data.doc_type === SardineFish.API.DocType.Markdown)
    {
        var unknowLanguages = {};
        if (new Date(data.time).getTime() < 1546272000000)
        {
            const marked = window.marked.marked;
            var renderer = markedImagePostProcess(marked);
            marked.setOptions({
                highlight: function (str, lang, callback)
                {
                    if (lang && hljs.getLanguage(lang))
                    {
                        try
                        {
                            return hljs.highlight(lang, str).value;
                        } catch (__) { }
                    }
                    else if (lang && !unknowLanguages[lang])
                    {
                        unknowLanguages[lang] = fetch(`${hljsLib}/languages/${lang}.min.js`)
                            .then(response => response.text())
                            .then(code =>
                            {
                                eval(code);
                                $$(`code.lang-${lang}`).forEach(element => hljs.highlightBlock(element));
                            });
                    }
                    return hljs.highlightAuto(str).value;
                },
                renderer: renderer
            });
            data.doc = marked(data.doc);
        }
        else
        {
            var md = window.markdownit({
                html: true, // Enable HTML tags in source
                xhtmlOut: false, // Use '/' to close single tags (<br />).
                breaks: true, // Convert '\n' in paragraphs into <br>
                langPrefix: 'lang-', // CSS language prefix for fenced blocks. Can be
                linkify: true, // Autoconvert URL-like text to links
                typographer: false,
                highlight: function (str, lang)
                {
                    if (lang && hljs.getLanguage(lang))
                    {
                        try
                        {
                            return hljs.highlight(lang, str).value;
                        } catch (__) { }
                    } else if (lang)
                    {
                        unknowLanguages[lang] = true;
                    }
                    return hljs.highlightAuto(str).value;
                },
            });

            markdownItImagePostProcess(md);
            md.use(markdownitEmoji);
            md.use(markdownitKatex);
            data.doc = md.render(data.doc);

            // Post highlight
            Object.keys(unknowLanguages).forEach(lang =>
            {
                fetch(`${hljsLib}/languages/${lang}.min.js`)
                    .then(response => response.text())
                    .then(code =>
                    {
                        eval(code);
                        $$(`code.lang-${lang}`).forEach(element => hljs.highlightBlock(element));
                    });
            });
        }
    }

    document.querySelector("#article-template").dataSource = data;
    loadContentNav();
    $("#page-title").innerText = data.title;
    $("#loading").style.display = "none";
    $$(".hide-loading").forEach(el => el.className = el.className.replace("hide-loading", ""));
    document.head.title = document.title = data.title;
    Promise.resolve().then(() =>
    {
        document.querySelectorAll("app").forEach(loadApp);

        // Time before this post dose not include image note
        if (new Date(data.time).getTime() >= 1648567159000)
            loadImageNote();
        initImagePreview();
    });
}

function loadBlog(pid) {
    /*var data = {
        title: "The Title of This Article",
        time: "2017-12-27",
        uid: "SardineFish",
        tags: [
            "Test",
            "Blog",
            "Template"
        ],
        document:"Document"
    };
    document.querySelector("#article-template").dataSource = data;
    return;*/

    var hljsLib = "//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1";

    $("#write").href = "/blog/edit/" + pid;

    SardineFish.API.Blog.getByPid({ pid: pid }).then(data =>
    {
        loadBlogContent(data);
        $(".stats-like .stats-value").innerText = data.stats.likes;
    }).catch(err =>
    {
        switch (err.code)
        {
            case 0x30202:
                err.code = 404;
                break;
            default:
                err.code = `0x${err.code.toString(16)}`;
        }
        $("#error-code").innerText = err.code;
        $("#load-error").className = "show";
        $("#sun").onclick = () =>
        {
            if ($("#root").className.includes("darken"))
                $("#root").className = $("#root").className.replace("darken", "");
            else
                $("#root").className = addClass($("#root").className, "darken");

        }
        loadPuzzle();
    });
}

/** 
 * @param {HTMLDivElement} element
*/
function loadApp(element)
{
    const src = element.getAttribute("src");
    const name = element.getAttribute("name");
    const scale = element.getAttribute("scale") || 1;

    const iframe = document.createElement("iframe");

    const wrapper = document.createElement("div");
    {
        wrapper.className = "app-wrapper";


        const app = document.createElement("div");
        {
            app.className = "app";

            const cover = document.createElement("div");
            {
                cover.className = "cover";

                const header = document.createElement("header");
                header.innerText = name;
                cover.appendChild(header);

                const button = document.createElement("div");
                button.className = "button";
                button.innerText = "CLICK TO LOAD";
                button.onclick = () =>
                {
                    button.onclick = null;

                    iframe.src = src;

                    app.classList.add("load");
                }
                cover.appendChild(button);
            }
            app.appendChild(cover);

            {
                iframe.className = "external";
                const bound = element.getBoundingClientRect();
                console.log(bound);
                iframe.width = bound.width;
                iframe.height = window.innerWidth > window.innerHeight
                    ? Math.floor(iframe.width * 9 / 16)
                    : Math.floor(iframe.width * 16 / 9);
                app.style.width = `${iframe.width}px`;
                app.style.height = `${iframe.height}px`;
                iframe.width /= scale;
                iframe.height /= scale;
                iframe.style.transform = `scale(${scale})`;
                iframe.style.transformOrigin = "top left";
            }
            app.appendChild(iframe);


            
        }
        wrapper.appendChild(app);


        const panel = document.createElement("div");
        {
            panel.className = "panel";
            panel.innerHTML = `
<div class="icon-button button-reload">refresh</div>
<a class="icon-button button-new-tab" href="${src}" target="_blank">open_in_new</a>
<div class="icon-button button-full-window">aspect_ratio</div>
<div class="icon-button button-full-screen">fullscreen</div>
`;
            panel.querySelector(".button-reload").onclick = () => iframe.src = src;
            panel.querySelector(".button-full-window").onclick = () =>
            {
                document.body.classList.add("full-window");
                app.classList.add("full-window");
                app.style.width = "";
                app.style.height = "";
                Promise.resolve().then(() => resize());
            }
            panel.querySelector(".button-full-screen").onclick = () => app.requestFullscreen({ navigationUI: "hide" }); 
        }
        wrapper.appendChild(panel);

        const resize = () =>
        {
            const bound = app.getBoundingClientRect();
            console.log(bound);
            iframe.width = bound.width;
            iframe.height = window.innerWidth > window.innerHeight
                ? Math.floor(iframe.width * 9 / 16)
                : Math.floor(iframe.width * 16 / 9);
        };

        window.addEventListener("resize", resize);
        app.addEventListener("fullscreenchange", resize);
    }
    element.appendChild(wrapper);

}

function loadImageNote()
{
    const imgs = document.querySelectorAll("img");
    const groupImgs = Array.from(document.querySelectorAll(".img-row img"));
    const imgGroups = document.querySelectorAll(".img-row");

    for (const img of imgs)
    {
        if (groupImgs.includes(img))
            continue;
        
        const element = document.createElement("aside");
        element.innerText = img.alt;
        element.classList.add("img-note");
        img.insertAdjacentElement("afterend", element);
    }

    for (const group of imgGroups)
    {
        const imgs = group.querySelectorAll("img");
        const notes = Array.from(imgs).map(img =>
        {
            const element = document.createElement("aside");
            element.innerText = img.alt;
            element.classList.add("img-note");
            return element;
        });
        const noteElement = document.createElement("aside");
        noteElement.classList.add("img-row-note");
        notes.forEach(node => noteElement.appendChild(node));
        group.insertAdjacentElement("afterend", noteElement);
    }
}

const SizeSufix = ["w1k", "w600", "w1k_f", "w2k", "s600", "s800"];

/**
 * 
 * @param {string} url 
 * @param {"w1k" | "w600" | "w1k_f" | "w2k" | "s600" | "s800"} size 
 */
function appendImgSizeOption(url, size)
{
    url = removeImgSizeSufix(url);
    return url + "-" + size;
}

/**
 * 
 * @param {string} url 
 */
function removeImgSizeSufix(url)
{
    const sufx = SizeSufix.filter(sufix => url.endsWith("-" + sufix))[0];
    if (sufx) {
        url = url.substring(0, url.length - sufx.length - 1);
    }
    return url;
}

function initImagePreview()
{
    const imgs = document.querySelectorAll(".markdown-body img");
    /** @type {HTMLDivElement} */
    const imageView = document.querySelector(".img-viewer");
    const imageViewImg = imageView.querySelector("img");

    const hide = () =>
    {
        if (!shown)
            return;
        shown = false;
        imageView.classList.remove("show");
    };

    imageView.querySelector(".button-close").onclick = hide;
    imageView.onclick = (e) =>
    {
        e.preventDefault();
        e.stopPropagation();
        hide();
    }
    imageViewImg.onclick = (e) =>
    {
        e.preventDefault();
        e.stopPropagation(); 
    }

    window.addEventListener("wheel", e =>
    {
        if (shown)
            e.preventDefault();
    })
    window.addEventListener("scroll", e =>
    {
        if (shown)
            e.preventDefault();
    });

    let shown = false;

    for (const img of imgs)
    {
        img.onclick = () =>
        {
            if (shown)
                return;
            
            imageViewImg.src = removeImgSizeSufix(img.src);
            shown = true;
            setTimeout(() =>
            {
                imageView.classList.add("show");
            }, 34);
        }
    }
}

function loadContentNav()
{
    setTimeout(function ()
    {
        var doc = document.querySelector(".markdown-body");
        var template = document.querySelectorAll("#content-template");
        var headers = Array.from(doc.querySelectorAll("h2,h3,h4,h5,h6,h7,h8,h9"));

        const headerSelector = (level) =>
        {
            var header = {
                header: "",
                url: "#",
                children: []
            };
            for (; i < headers.length; i++)
            {
                var currentLevel = parseInt(/H(\d)/.exec(headers[i].tagName)[1]);
                headers[i].id = headers[i].innerText;
                if (currentLevel >= level)
                {
                    if (header.header!="" && currentLevel <= level)
                    {
                        i--;
                        return header;
                    }
                    if (currentLevel == level)
                        header = {
                            header: headers[i].innerText,
                            url: `${location.protocol}//${location.host}${location.pathname}${location.search}#${headers[i].id}`,
                            children: []
                        };
                    else if (currentLevel > level)
                        header.children.push(headerSelector(level + 1));
                }
                else 
                {
                    i--;
                    return header;
                }
            }
            return header;
        }

        var i = 0;
        var h2 = [];
        for (i = 0; i < headers.length; i++)
        {
            h2.push(headerSelector(2));
        }
        var h1 = {
            header: $("#title").innerText,
            url: `${location.protocol}//${location.host}${location.pathname}${location.search}#title`,
            children: h2
        };
        template.forEach(t => t.dataSource = h1);
        
    });
}

function formatTime(comment)
{
    comment.time = SardineFish.API.Utils.formatDateTime(new Date(comment.time));
    comment.comments.forEach(formatTime);
}

function loadComment(cid)
{
    SardineFish.API.Comment.getByPid({ pid: cid, depth: 6 }).then(comments =>
    {
        comments.forEach(formatTime);
        var templateElement = document.querySelector("#comment-template");
        comments = comments.sort((a, b) => b.pid - a.pid);
        templateElement.dataSource = comments;
        $$(".comment-render .comment").forEach(function (element)
        {
            var commentPid = element.dataset['pid'];
            var commentName = element.dataset['name'];
            element.querySelector(".button-reply").addEventListener("click", function ()
            {
                cid = parseInt(commentPid);
                $("#input-comment").dataset['text'] = "Reply to " + commentName;
                $("#input-comment").innerHTML = "";
            });
        });
    });
}
function initCommentPost()
{
    $("#button-add-comment").addEventListener("click", function ()
    {
        cid = pid;
        $("#input-comment").dataset['text'] = "Tell me what you think";
        $("#input-comment").innerHTML = "";
    })
    $("#button-comment-send").addEventListener("click", function ()
    {
        var name = $("#input-name").value;
        var email = $("#input-email").value;
        var text = $("#input-comment").innerText;
        var hash = CryptoJS.MD5(email).toString();
        var avatar = `https://www.gravatar.com/avatar/${hash}?s=256&d=${encodeURIComponent("https://cdn-static.sardinefish.com/img/unknown-user-grey.png")}`;
        SardineFish.API.Comment.post({ pid: cid }, {
            name: name,
            email: email,
            text: text,
            avatar: avatar
        }).then(() =>
        {
            $("#input-comment").innerHTML = "";
            loadComment(pid);
        });
    });
}

function loadPuzzle()
{
    require.config({
        paths: {
            'crypto-js': '/lib/Script/crypto-js'
        }
    });
    require(["crypto-js/crypto-js"], function (CryptoJS)
    {
        var ans = "U2FsdGVkX1/A4SaZPLVgnDY3SJxhtkwV8EgRK3WYb+spfsIOaicFaHfBBJ7ZE9lechvHNqLNQaQhAjVJxKji+w==";
        var ansHash = "ec1599cd561886e2e75238c6e826f48135dc0f7cf1d14f61cf36d1b5e5c20ae5";
        var hints = [
            "你一定是夜空中最亮的那颗⭐", 
            "神说，要有光。",
            "这里什么也没有，关灯睡吧。"
        ]
        window.CryptoJS = CryptoJS;
        function AES_CBC_Encrypt(data, key) {
            return CryptoJS.AES.encrypt(data, key, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.ZeroPadding
            }).toString();
        }

        function AES_CBC_Decrypt(data, key) {
            return CryptoJS.AES.decrypt(data, key, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.ZeroPadding
            }).toString(CryptoJS.enc.Utf8);
        }

        $$("*").forEach(el => el.addEventListener("click", (e) =>
        {
            try
            {
                var x = Math.floor(e.pageX / 2);
                var y = Math.floor(e.pageY / 2);
                var key = `(${x}, ${y})`;
                var dec = AES_CBC_Decrypt(ans, key);
                var decHash = CryptoJS.SHA256(dec);
                if (decHash != ansHash)
                    $("#error-msg").innerText = hints[parseInt(Math.random() * hints.length)];
                else
                    eval(dec);
            }
            catch (ex)
            {
                $("#error-msg").innerText = hints[parseInt(Math.random() * hints.length)];
            }

        }));
    });
}

function imagePostProcess(imgUrl)
{
    const src = imgUrl;
    // The image address in blog content are dynamic
    // This will make WebArchive failed to save our images.
    // WebArchive will relpace all url in this JS script to its archive address,
    // So I encode the original address into b64 to avoid changing.
    // Then these address in images will be replaced to `defaultImageHost` that modified by WebArchive
    var httpsImageHost = "https://img.sardinefish.com/";
    var defaultImageHost = "https://img.sardinefish.com/";
    var reg = /((?:https?:)?\/\/[^/]*.sardinefish.com\/|(?:localhost|127.0.0.1)(?:\:\d+)?\/)(.*)/;
    var webArchivePrefixReplacer = atob("aHR0cDovL2ltZy5zYXJkaW5lZmlzaC5jb20v");


    if (reg.test(imgUrl))
    {
        var img = reg.exec(imgUrl)[2];

        // if (window.location.protocol === "https:")
        //     imgUrl = httpsImageHost + img;
        // else
        //     imgUrl = defaultImageHost + img;
        imgUrl = httpsImageHost + img;

        imgUrl = appendImgSizeOption(imgUrl, "s800");
        
    }

    // imgUrl = defaultImageHost.replace(webArchivePrefixReplacer, imgUrl);

    console.log(`${src} -> ${imgUrl}`);
    
    return imgUrl;
}

function markdownItImagePostProcess(md)
{
    var imgProcess = md.renderer.rules.image;
    const htmlBlockProcess = md.renderer.rules.html_block;
    const htmlInlineProcess = md.renderer.rules.html_inline;

    md.renderer.rules.image = function (tokens, idx, options, env, slf)
    {
        var token = tokens[idx];
        var imgUrl = token.attrs[token.attrIndex('src')][1];
        imgUrl = imagePostProcess(imgUrl);

        //imgUrl = defaultImageHost.replace(webArchivePrefixReplacer, imgUrl);
        console.log(`${token.attrs[token.attrIndex('src')][1]} -> ${imgUrl}`);
        token.attrs[token.attrIndex('src')][1] = imgUrl;
        return imgProcess(tokens, idx, options, env, slf);
    };

    const handleHTML = (token) =>
    {
        const html = token.content;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        for (const img of wrapper.querySelectorAll("img"))
        {
            img.src = imagePostProcess(img.src);
        }
        // console.log(wrapper.innerHTML);
        token.content = wrapper.innerHTML;
    }

    md.renderer.rules.html_block = (tokens, idx, options, env, slf) =>
    {
        var token = tokens[idx];
        handleHTML(token);
        return htmlBlockProcess(tokens, idx, options, env, slf);
    };

    md.renderer.rules.html_inline = (tokens, idx, options, env, slf) =>
    {
        var token = tokens[idx];
        handleHTML(token);
        return htmlInlineProcess    (tokens, idx, options, env, slf);
    }
}

function markedImagePostProcess(marked)
{
    var renderer = new marked.Renderer();
    var imgRenderer = renderer.image;

    // The image address in blog content are dynamic
    // This will make WebArchive failed to save our images.
    // WebArchive will relpace all url in this JS script to its archive address,
    // So I encode the original address into b64 to avoid changing.
    // Then these address in images will be replaced to `defaultImageHost` that modified by WebArchive

    renderer.image = function (src, title, text)
    {
        var imgUrl = src;
        imgUrl = imagePostProcess(imgUrl);

        // imgUrl = defaultImageHost.replace(webArchivePrefixReplacer, imgUrl);
        console.log(`${src} -> ${imgUrl}`);
        src = imgUrl;
        return imgRenderer.bind(renderer)(src, title, text);
    }
    return renderer;
}

function animate(callback, t, timingFunc = t => t)
{ 
    return new Promise((resolve, reject) =>
    {
        let offset = 0;
        let elapsed = 0;
        const update = (delay) =>
        {
            if (offset === 0)
                offset = delay;
                
            elapsed = (delay - offset) / 1000;
            if (elapsed >= t)
                elapsed = t;

            try
            {

                callback(timingFunc(elapsed / t));
            }
            catch (e)
            { 
                reject(e);
                return;
            }

            if (elapsed === t)
                resolve();
            else
                requestAnimationFrame(update);
                
        }

        callback(0);

        requestAnimationFrame(update); 
    });
}

const SEQUENCE_ABORTED = Symbol("SEQUENCE_ABORTED");

function sequence(process)
{
    const handle = {
        abort: () =>
        {
            animProvider.abortSignal = true;
        }
    };

    const animateRuntime = animate;
    const animProvider = {
        abortSignal: false,
        animate(callback, duration, timingFunc = t => t)
        {
            return animateRuntime(t =>
            {
                if (this.abortSignal)
                {
                    throw SEQUENCE_ABORTED;
                }
                else
                {
                    callback(t);
                }
            }, duration, timingFunc);
        }
    }
    process(animProvider).catch(e =>
    {
        if (e !== SEQUENCE_ABORTED)
        {
            throw e;
        }
    });

    return handle;
}
function randRange(a, b)
{
    return Math.random() * (b - a) + a;
}
function lerp(a, b, t)
{
    return (b - a) * t + a;
}
function timeout(t)
{
    return new Promise(resolve =>
    {
        setTimeout(resolve, t * 1000);
    });
}

function likeButton()
{
    $$(".stats-like").forEach(stats =>
    {
        const button = stats.querySelector(".like-button");

        const VIEWPORT = 24;
        let state = "idle";
        let playingSequence = null;
        const fill = button.querySelector(".heart-fill");
        const value = stats.querySelector(".stats-value");
        let strength = 1;

        const handleMoseDown = e =>
        {
            if (state === "hit")
                return;

            state = "hold";
            const rect = button.getBoundingClientRect();
            const x = (e.clientX - rect.x) / rect.width;
            const y = (e.clientY - rect.y) / rect.height;
            console.log(fill, x, y);
            fill.cx.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, x * VIEWPORT);
            fill.cy.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, y * VIEWPORT);
            animate(t =>
            {
                fill.r.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 36 * t);
            }, 0.5, BezierEasing(0, 0, 0.55, 1));

            playingSequence = sequence(async (provider) =>
            {
                for (let shakeDistance = 0; ; shakeDistance += 0.3)
                {
                    strength += 0.1;
                    strength = Math.min(2, strength);

                    shakeDistance = Math.min(shakeDistance, 10);
                    const duration = randRange(0.05, 0.05);
                    const targetX = randRange(-shakeDistance, shakeDistance);
                    const targetY = randRange(-shakeDistance, shakeDistance);
                    await provider.animate(t =>
                    {
                        const x = targetX * t;
                        const y = targetY * t;
                        button.style.translate = `${x}px ${y}px`;
                    }, duration)
                }
            }
            );
        }

        const handleCancel = () =>
        {
            if (state === "hold")
            {
                playingSequence.abort();
                button.style.translate = "";
                state = "idle";
                fill.r.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0);
            }
        };

        const handleRelease = (e) =>
        {
            e.preventDefault();
            e.stopPropagation();

            if (state !== "idle")
            {
                playingSequence.abort();
                button.style.translate = "";
                state = "hit";
                stats.classList.add("hit");

                if (pid > 0)
                {
                    SardineFish.API.PostData.like({ pid: pid }).catch(err =>
                    {
                        console.error(err);
                    }).then(data =>
                    {
                        value.innerText = data;
                    });

                }

                const colors = [
                    "#3ed6fa",
                    "#fa603e",
                    "#9de35d",
                    "#8f3bdd",
                    "#ffe376"
                ]

                const count = 16;
                for (let i = 0; i < count; ++i)
                {
                    const theta = i / count * Math.PI * 2;
                    const dx = Math.cos(theta);
                    const dy = Math.sin(theta);
                    const inner = [14, 16][i % 2] * strength;
                    const outer = [28, 24][i % 2] * strength * strength;

                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dx * inner);
                    line.y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dy * inner);

                    line.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dx * inner);
                    line.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dy * inner);

                    line.style.strokeWidth = [1.4, 1][i % 2];
                    line.style.stroke = colors[i % colors.length];
                    line.style.opacity = 0;

                    console.log(line);
                    button.appendChild(line);

                    sequence(async (provider) =>
                    {
                        await timeout(0.15);
                        line.style.opacity = 1;
                        provider.animate(t =>
                        {
                            const endpoint = lerp(inner, outer, t);
                            line.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dx * endpoint);
                            line.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dy * endpoint);
                        }, 0.1, BezierEasing(0, 0, 0.4, 1));

                        await timeout(0.05);

                        await provider.animate(t =>
                        {
                            const endpoint = lerp(inner, outer, t);
                            line.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dx * endpoint);
                            line.y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dy * endpoint);
                        }, 0.3, BezierEasing(0, 0, 0.4, 1));

                        await provider.animate(t =>
                        {
                            line.style.opacity = 1 - t;
                        }, 0.05);

                        button.removeChild(line);
                    });
                    sequence(async (provider) =>
                    {
                        await provider.animate(t =>
                        {
                            button.style.transform = `scale(${lerp(1, 1.2, t)})`;
                        }, 0.1, BezierEasing(0.57, -0.77, 0.25, 1));

                        await provider.animate(t =>
                        {
                            button.style.transform = `scale(${lerp(1.1, 1, t)})`;
                        }, 0.2, BezierEasing(0, 0, 0.2, 1));
                    })
                }
            }


            strength = 1;
        }

        button.addEventListener("mousedown", handleMoseDown);
        button.addEventListener("touchstart", e => handleMoseDown(e.touches[0]));
        window.addEventListener("mouseup", handleCancel);
        window.addEventListener("touchend", e =>
        {
            handleCancel();
        });

        button.addEventListener("mouseup", handleRelease);
        button.addEventListener("touchend", handleRelease);
    });
}
likeButton();