window.onload = function () {
    HTMLTemplate.Init();
    checkLogin();
    pid = parseSearch()["pid"];
    initEditor(pid);
};
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
function checkLogin()
{
    SardineFish.API.Account.CheckLogin(function (data)
    {
        if (data)
        {
            $("#account-area").className = "login";
            $("#user-avatar").src = "/account/user/face/getFace.php?uid=" + data.uid;
        }
    });
}

function initEditor(pid)
{
    var tags = new ObserveList([""]);
    $("#tag-template").dataSource = tags;
    $("#editor").contentWindow.onSizeChanged = function (height)
    {
        $("#editor").style.height = height + "px";
    }
    $("#add-tag").addEventListener("click", function ()
    {
        tags.add("");
    });
    var lastSelect = $$("#doc-types > .item")[1];

    $$("#doc-types > .item").forEach(function (element)
    {
        element.addEventListener("click", function (e)
        {
            if (lastSelect)
                lastSelect.className = "item";
            lastSelect = e.target;
            e.target.className += " selected";
        });
    });
    if (pid)
    {
        SardineFish.API.Article.Get(pid, function (data)
        {
            $("#title").value = data.title;
            tags.addRange(data.tags);
            $("#editor").contentWindow.setCode(data.document);
        }, function (msg, code)
        {
            console.error(msg);
        });
    }    
    $("#publish").addEventListener("click", function ()
    {
        var article = {
            pid: pid,
            type: SardineFish.API.Article.Type.Blog,
            title: $("#title").value,
            tags: ArrayList(),
            docType: $("#doc-types > .item.selected").dataset["docType"],
            document: $("#editor").contentWindow.getCode()
        };
        $$(".tag").forEach(function (element)
        {
            var text = element.innerText.replace(/^\s+/g, "").replace(/\s+$/g, "");
            if (text != "")
                article.tags.add(text);
        });
        if (pid)
        {
            SardineFish.API.Article.Edit(article, function (data)
            {
                document.location = "/blog/?pid=" + pid;
            });
        }
        else
        {
            SardineFish.API.Article.Post(article, function (succeed, data)
            {
                if (!succeed)
                {
                    console.warn(data);
                    return;
                }
                document.location = "/blog/?pid=" + data;
            });
        }
    });

}