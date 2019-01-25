window.onload = function () {
    HTMLTemplate.Init();
    checkLogin();
    initEditor();
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

function initEditor()
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
    $("#publish").addEventListener("click", function ()
    {
        var article = {
            type: SardineFish.API.Article.Type.Blog,
            title: $("#title").value,
            tags: ArrayList(),
            docType: $("#doc-types > .item.selected").dataset["docType"],
            document: $("#editor").contentWindow.getCode()
        };
        $$(".tag").forEach(function(element) {
            var text = element.innerText.replace(/^\s+/g, "").replace(/\s+$/g, "");
            if (text != "")
                article.tags.add(text);
        });
        SardineFish.API.Article.Post(article, function (succeed, data)
        {
            if (!succeed)
            {
                console.warn(data);
                return;
            }
            document.location = "/blog/?pid=" + data;
        });
    })
}