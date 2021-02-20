/**
 * @typedef {import("../../lib/Script/SardineFish/SardineFish.API")}
 */

window.onload = function ()
{
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
    SardineFish.API.User.checkAuth({}).then(uid =>
    {
        $("#account-area").className = "login";
        $("#user-avatar").src = SardineFish.API.User.avatarUrl(uid);
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
        SardineFish.API.Blog.getByPid({ pid }).then(blog =>
        {
            $("#title").value = blog.title;
            tags.addRange(blog.tags);
            $("#editor").contentWindow.setCode(blog.doc);
        });
    }    
    $("#publish").addEventListener("click", function ()
    {
        const tags = [];
        $$(".tag").forEach(function (element)
        {
            var text = element.innerText.replace(/^\s+/g, "").replace(/\s+$/g, "");
            if (text != "")
                tags.push(text);
        });
        const blog = {
            title: $("#title").value,
            tags: tags,
            doc_type: $("#doc-types > .item.selected").dataset["docType"],
            doc: $("#editor").contentWindow.getCode()
        };

        if (pid)
        {
            SardineFish.API.Blog.update({ pid }, blog).then(pid =>
            {
                document.location = "/blog/" + pid;
            }).catch(err =>
            {
                alert(`${err.code}: ${err.message}`);
            });
        }
        else
        {
            SardineFish.API.Blog.post({}, blog).then(pid =>
            {
                document.location = "/blog/" + pid;
            }).catch(err =>
            {
                alert(`${err.code}: ${err.message}`);
            });
        }
    });

}