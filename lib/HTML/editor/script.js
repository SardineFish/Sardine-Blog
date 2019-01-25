try
{
    initDropBox();
    initFontSize();
    initEditorRender();
    initResizeDetect();
    var fontFamily = $("#fontFamily").get(0);
    var fontSize = $("#fontSizeBox").get(0);
    var richText = $("#text").get(0);
    var code = "";
    window.onSizeChanged = null;
    window.getHeight = getHeight;
    window.getCode = getCode;
    window.setCode = setCode;

    fontFamily.onchange = function (e)
    {
        $("#text").css("font-family", fontFamily.selected);
    };
    fontSize.onchange = function (e)
    {
        $("#text").css("font-size", fontSize.text);
    }
    richText.onselectstart = function (e) { }
    richText.onchange = function (e)
    {
        console.warn();
    }
    var EditorType = { Code: "code", HTML: "html", Markdown: "markdown" };
    var editorTyle = EditorType.Code;
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
            } else if (lang && !unknowLanguages[lang]) {
                unknowLanguages[lang] = fetch(`${hljsLib}/languages/${lang}.min.js`)
                    .then(response => response.text())
                    .then(code => {
                        eval(code);
                        $$(`code.lang-${lang}`).forEach(element => hljs.highlightBlock(element));
                    });
            }
            return hljs.highlightAuto(str).value;
        }
    });
    md.use(markdownitEmoji);

    function initEditorRender()
    {
        $("#code").click(function () { renderCode(); });
        $("#markdown").click(function () { renderMarkdown(); });
        $("#html").click(function () { renderHTML(); });
    }

    function getCode()
    {
        var text = $("#text").get(0);
        if (editorTyle == EditorType.Code)
            code = text.innerText;
        else if (editorTyle == EditorType.HTML)
            code = text.innerHTML;
        return code.replace(/\t/g, "    ");
    }

    function setCode(_code)
    {
        code = _code;
        if (editorTyle == EditorType.Code)
            renderCode(code);
        else if (editorTyle == EditorType.HTML)
            renderHTML(code);
        else if (editorTyle == EditorType.Markdown)
            renderMarkdown(code);
    }

    function getHeight()
    {
        return document.querySelector("#text").scrollHeight;
    }

    function renderCode(_code)
    {
        $("#render-types > .item").removeClass("selected");
        $("#code").addClass("selected");
        if (!_code)
            getCode();
        editorTyle = EditorType.Code;
        $("#text").get(0).innerText = code;
        $("#text").attr("contenteditable", "true");
    }
    function renderHTML(_code)
    {
        $("#render-types > .item").removeClass("selected");
        $("#html").addClass("selected");
        if (!_code)
            getCode();
        editorTyle = EditorType.HTML;
        $("#text").html(code);
        $("#text").attr("contenteditable", "true");
    }

    function renderMarkdown(_code)
    {
        $("#render-types > .item").removeClass("selected");
        $("#markdown").addClass("selected");
        if (!_code)
            getCode();
        code = insertBreaks(code);
        editorTyle = EditorType.Markdown;
        $("#text").get(0).innerHTML = md.render(code);
        $("#text").attr("contenteditable", "false");
    }

    function insertBreaks(_code)
    {
        const reg = /((?:\r\n|\r(?!\n)|(?<!\r)\n)(?:\r\n|\r(?!\n)|(?<!\r)\n))((?:\r\n|\r(?!\n)|(?<!\r)\n)(?:\r\n|\r(?!\n)|(?<!\r)\n))/;
        while (reg.test(_code))
        {
            _code = _code.replace(/((?:\r\n|\r(?!\n)|(?<!\r)\n)(?:\r\n|\r(?!\n)|(?<!\r)\n))((?:\r\n|\r(?!\n)|(?<!\r)\n)(?:\r\n|\r(?!\n)|(?<!\r)\n))/, "$1<br>$2");
        }
        return _code;
    }

    function initResizeDetect()
    {
        var height = getHeight();
        setInterval(function ()
        {
            if (getHeight() != height)
            {
                height = getHeight();
                if (window.onSizeChanged)
                    window.onSizeChanged(height);    
            }    
        }, 300);
    }

    function initDropBox() {
        var dropBoxList = $(".dropbox");
        for (var i = 0; i < dropBoxList.length; i++) {
            var dropbox = dropBoxList[i];

            var id = dropBoxList[i].id;
            var display = $("#" + id + " .display");
            var list = $("#" + id + " .list");
            var items = $("#" + id + " .list li");
            var selected = $("#" + id + " .list .selected");
            dropbox.selected = display.text();
            display.click(function (e) {
                selected.text(display.text());
                list.css("max-Height", "2em");
                list.css("display", "block");
                list.animate({
                    maxHeight: 200
                }, 200);
            });
            items.click(function (e) {
                if (display.text() != e.target.innerText) {
                    dropbox.selected = e.target.innerText;
                    selected.text(e.target.innerText);
                    display.text(e.target.innerText);

                    if (dropbox.onchange)
                        dropbox.onchange();
                }
                list.animate({
                    maxHeight: "2em"
                }, 200, function () {
                    list.css("display", "none");
                });
            });
        }
    }

    function initFontSize() {
        var fontSizeBox = $("#fontSizeBox").get(0);
        var inc = $("#fontSizeBox #plus");
        var dec = $("#fontSizeBox #minus");
        var display = $("#fontSizeBox #fontSize");
        fontSizeBox.text = display.text();
        fontSizeBox.num = parseInt(fontSizeBox.text);
        inc.click(function (e) {
            fontSizeBox.num += 1;
            fontSizeBox.text = fontSizeBox.num + "px";
            display.text(fontSizeBox.text);
            if (fontSizeBox.onchange)
                fontSizeBox.onchange();
        });
        dec.click(function (e) {
            fontSizeBox.num--;
            if (fontSizeBox.num < 0)
                fontSizeBox.num = 0;
            else {
                if (fontSizeBox.onchange)
                    fontSizeBox.onchange();
            }
            fontSizeBox.text = fontSizeBox.num + "px";
            display.text(fontSizeBox.text);

        });

    }
} catch (ex) {
    console.warn("global:" + ex.message);

}
