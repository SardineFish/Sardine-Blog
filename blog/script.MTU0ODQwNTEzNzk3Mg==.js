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

    var search = parseSearch();
    if (search["pid"])
    {
        pid = cid = search["pid"];
        loadBlog(search["pid"]);
        loadComment(search["pid"]);
    }
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
    SardineFish.API.Account.CheckLogin(function (data)
    {
        if (data)
        {
            document.querySelector("#account-area").className = "login";
            document.querySelector("#user-avatar").src = "/account/user/face/getFace.php?uid=" + data.uid;
            var uid = data.uid;
            SardineFish.API.Account.User.GetInfo(uid,
                function (data)
                {
                    $("#sender-avatar").src = data.face;
                    $("#input-name").value = data.name;
                    $("#input-email").value = data.email;
                },
                function (msg, code)
                {
                
                });
        }
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
    SardineFish.API.Article.Get(pid, function (data) {
        if (data.docType == "markdown")
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
                data.document = marked(data.document);
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
                    highlight: function (str, lang) {
                        if (lang && hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(lang, str).value;
                            } catch (__) {}
                        } else if (lang) {
                            unknowLanguages[lang] = true;
                        }
                        return hljs.highlightAuto(str).value;
                    }
                });
                markdownItImagePostProcess(md);
                md.use(markdownitEmoji);
                md.use(markdownitKatex);
                data.document = md.render(data.document);
                
                // Post highlight
                Object.keys(unknowLanguages).forEach(lang => {
                    fetch(`${hljsLib}/languages/${lang}.min.js`)
                        .then(response => response.text())
                        .then(code => {
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
    }, function (msg, code)
    {
        $("#error-code").innerText = code;
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

function loadComment(cid) {
    SardineFish.API.Comment.GetList(cid, 0, 500, Math.round(new Date().getTime() / 1000), function (succeed, data) {
        if (!succeed) {
            console.warn(data);
            return;
        }
        var templateElement = document.querySelector("#comment-template");
        templateElement.dataSource = data;
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
        SardineFish.API.Comment.Post(cid, name, email, text, function (succeed,data)
        {
            if (succeed)
            {
                $("#input-comment").innerHTML = "";
                loadComment(pid);
            }    
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

    var httpsImageHost = "https://cdn-img.sardinefish.com/";
    var defaultImageHost = "http://img.sardinefish.com/";
    var reg = /((?:https?:)?\/\/[^/]*.sardinefish.com\/)(.*)/;
    var webArchivePrefixReplacer = atob("aHR0cDovL2ltZy5zYXJkaW5lZmlzaC5jb20v");

    md.renderer.rules.image = function (tokens, idx, options, env, slf) {
        var token = tokens[idx];
        var imgUrl = token.attrs[token.attrIndex('src')][1];
        if (reg.test(imgUrl))
        {
            var img = reg.exec(imgUrl)[2];
            if (window.location.protocol === "https:")
                imgUrl = httpsImageHost + img;
            else
                imgUrl = defaultImageHost + img;
        }
        imgUrl = defaultImageHost.replace(webArchivePrefixReplacer, imgUrl);
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