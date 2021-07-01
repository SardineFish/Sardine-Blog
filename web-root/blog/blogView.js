/**
 * @typedef {import("../lib/Script/SardineFish/SardineFish.API")}
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

    const caps = /\d+$/.exec(window.location.pathname);
    if (!caps)
        throw new Error("Invalid url");
    cid = pid = parseInt(caps[0]);

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

    $("#write").href = "/blog/write/?pid=" + pid;

    SardineFish.API.Blog.getByPid({ pid: pid }).then(data =>
    {
        data.time = SardineFish.API.Utils.formatDateTime(new Date(data.time));
        if (data.doc_type === SardineFish.API.DocType.Markdown)
        {
            var unknowLanguages = {};
            if (new Date(data.time).getTime() < 1546272000000)
            {
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
                    }
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
        });
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
                window.cid = parseInt(commentPid);
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

function markdownItImagePostProcess(md)
{
    var imgProcess = md.renderer.rules.image;

    var httpsImageHost = "https://img.sardinefish.com/";
    var defaultImageHost = "https://img.sardinefish.com/";
    var reg = /((?:https?:)?\/\/[^/]*.sardinefish.com\/)(.*)/;
    var webArchivePrefixReplacer = atob("aHR0cDovL2ltZy5zYXJkaW5lZmlzaC5jb20v");

    md.renderer.rules.image = function (tokens, idx, options, env, slf) {
        var token = tokens[idx];
        var imgUrl = token.attrs[token.attrIndex('src')][1];

        // Replace all http image with https

        if (reg.test(imgUrl))
        {
            var img = reg.exec(imgUrl)[2];

            // if (window.location.protocol === "https:")
            //     imgUrl = httpsImageHost + img;
            // else
            //     imgUrl = defaultImageHost + img;
            imgUrl = httpsImageHost + img;
        }

        //imgUrl = defaultImageHost.replace(webArchivePrefixReplacer, imgUrl);
        console.log(`${token.attrs[token.attrIndex('src')][1]} -> ${imgUrl}`);
        token.attrs[token.attrIndex('src')][1] = imgUrl;
        return imgProcess(tokens, idx, options, env, slf);
    };
}

function markedImagePostProcess(marked)
{
    var renderer = new marked.Renderer();
    var imgRenderer = renderer.image;

    var httpsImageHost = "https://cdn-img.sardinefish.com/";
    var defaultImageHost = "http://img.sardinefish.com/";
    var reg = /((?:https?:)?\/\/[^/]*.sardinefish.com\/)(.*)/;
    var webArchivePrefixReplacer = atob("aHR0cDovL2ltZy5zYXJkaW5lZmlzaC5jb20v");

    renderer.image = function (src, title, text)
    {
        var imgUrl = src;
        if (reg.test(imgUrl)) {
            var img = reg.exec(imgUrl)[2];
            if (window.location.protocol === "https:")
                imgUrl = httpsImageHost + img;
            else
                imgUrl = defaultImageHost + img;
        }
        imgUrl = defaultImageHost.replace(webArchivePrefixReplacer, imgUrl);
        console.log(`${src} -> ${imgUrl}`);
        src = imgUrl;
        return imgRenderer.bind(renderer)(src, title, text);
    }
    return renderer;
}