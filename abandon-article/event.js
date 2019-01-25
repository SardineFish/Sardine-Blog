var pageCode = (function ()
{
    var pageCodeEditor;
    var pageCodeContainerMouseDownLocationX = 0;
    var pageCodeContainerMouseDownLocationY = 0;
    var pageCodeContainerTop = 0;
    var pageCodeContainerRight = 0;
    var pageCodeContainerMouseDownHold = false;
    var pageCodeContainerDrag = false;
    var pageCodeIconHold = false;
    var pageCodeShown = false;
    function evalCode(code)
    {
        try
        {
            eval(code);

        }
        catch (ex)
        {
            console.warn(ex.message);
        }
    }
    function pageCodeRun()
    {
        if (pageCodeEditor)
        {
            var code = pageCodeEditor.getValue();
            evalCode(code);
        }
    }
    function pageCodeIconClick()
    {
        if (pageCodeContainerDrag)
        {
            pageCodeContainerDrag = false;
            return;
        }
        if (!pageCodeShown)
        {
            pageCodeShown = true;
            $("#pageCodeContainer").stop(true);
            $("#pageCodeContainer").animate({ width: "500", boxShadow: "0 0 10px rgba(0,0,0,0.30)" }, 300);
            $("#pageCodeContainer").animate({ height: "384" }, 200);
        }
        else
        {
            pageCodeShown = false;
            $("#pageCodeContainer").stop(true);
            $("#pageCodeContainer").animate({ height: "42" }, 200);
            $("#pageCodeContainer").animate({ width: "42", boxShadow: "0 0 0px rgba(0,0,0,0.00)" }, 300);
        }
    }
    function pageCodeContainerMouseDown(e)
    {
        $("body").attr("onselectstart", "return false");
        pageCodeContainerMouseDownLocationX = e.screenX;
        pageCodeContainerMouseDownLocationY = e.screenY;
        pageCodeContainerTop = parseInt($("#pageCodeContainer").css("top").replace("px", ""));
        pageCodeContainerRight = parseInt($("#pageCodeContainer").css("right").replace("px", ""));
        pageCodeContainerMouseDownHold = true;
        //$("#debugText").text("down(" + pageCodeContainerMouseDownLocationX + "," + pageCodeContainerMouseDownLocationY + ")\r\n");
    }
    function pageCodeContainerMouseUp(e)
    {
        $("body").attr("onselectstart", "");
        pageCodeIconHold = false;
        pageCodeContainerMouseDownHold = false;
    }
    function windowMouseMove(e)
    {
        if (pageCodeContainerMouseDownHold)
        {
            if (pageCodeIconHold && (e.movementX !=0 || e.movementY!=0))
                pageCodeContainerDrag = true;
            //$("#debugText").text("down(" + pageCodeContainerMouseDownLocationX.toString() + "," + pageCodeContainerMouseDownLocationY.toString() + ") \r\ne(" + (e.pageX - document.body.scrollLeft).toString() + "," + (e.pageY - document.body.scrollTop).toString() + ") scrollTop:" + $("body").scrollTop().toString());
            var x = pageCodeContainerMouseDownLocationX - e.screenX;
            var y = e.screenY - pageCodeContainerMouseDownLocationY;
            var right = x + pageCodeContainerRight;
            var top = y + pageCodeContainerTop;
            if (right + $("#pageCodeContainer").width() + 50 > document.body.clientWidth)
                right = document.body.clientWidth - $("#pageCodeContainer").width() - 50;
            if (right < -50)
                right = -50;
            if (top < 50)
                top = 50;
            if (top > document.body.clientHeight - 42)
                top = document.body.clientHeight - 42;
            /*$("#pageCodeContainer").stop(true);
            $("#pageCodeContainer").animate({ top: top.toString(), right: right.toString() });*/
            $("#pageCodeContainer").css("top", top.toString() + "px");
            $("#pageCodeContainer").css("right", right.toString() + "px");
        }
    }
    function windowLoad(e)
    {
        pageCodeEditor = CodeMirror.fromTextArea(document.getElementById("pageCodeInput"),
            {
                lineNumbers: true,
                extraKeys: { "Space": "autocomplete" },
                mode: { name: "javascript", globalVars: true }
            });
        var codeMirror = $("#pageCodeInputBorder div:first");
        codeMirror.css("height", "278px");
    }
    window.addEventListener("load", windowLoad);
    window.addEventListener("mousemove", windowMouseMove);
    $("#pageCodeContainer").mousedown(pageCodeContainerMouseDown);
    $("#pageCodeContainer").mouseup(pageCodeContainerMouseUp);
    $("#pageCodeInputBorder").onmousedown = function (e) { e.stopPropagation() };
    $("#pageCodeIcon").mousedown(function (e)
    {
        pageCodeIconHold = true;
    });
    $("#pageCodeIcon").mouseup(function (e)
    {
        pageCodeIconHold = false;
    });
    $("#pageCodeIcon").click(pageCodeIconClick);
    $("#pageCodeButtonRun").click(pageCodeRun);
})();
var viewIndex = 0;
var loadTime = Math.round(new Date().getTime() / 1000);
var loading = false;
var articleList = new ObserveList();
var itemTemplate = $("#articleItemTemplate").get(0);
HTMLTemplate.Init();
function LoadArticle(count)
{
    if (loading)
        return;
    loading = true;
    /*articleList.add({
        title: "Test",
        tag: ["test", "tag"],
        document: "This article is for testing."
    });
    return;*/
    SardineFish.API.Article.GetList(loadTime, viewIndex, count, true, function (succeed, data)
    {
        if(!succeed)
        {
            console.warn(data);
        }
        for (var i = 0; i < data.length; i++)
        {
            articleList.add(data[i]);
        }
        viewIndex = articleList.length;
        loading = false
    });
}
itemTemplate.dataSource = articleList;
LoadArticle(10);

function ShowNotice(text)
{
    $("#dialogBackground").css("display","block");
    $("#noticeText").text(text);
    $("#noticeText").css("opacity", "0");
    $("#noticeText").css("display", "inline-block");
    $("#noticeText").animate({ opacity: 1 }, 500);
    setTimeout(function ()
    {
        $("#noticeText").animate({ opacity: 0 }, 500, function ()
        {
            $("#dialogBackground").css("display", "none");
            $("#noticeText").css("display", "none");
        });
    }, 2000);
    loadNotes(true, 1);
}
//------------TopBar
function initTopMenu()
{
    var extend = false;
    $("#button-menu").click(function ()
    {
        if (!extend)
        {
            $("#button-menu").addClass("extend");
            $("#topMenu").addClass("extend");
        }
        else
        {
            $("#button-menu").removeClass("extend");
            $("#topMenu").removeClass("extend");
        }
        extend = !extend;
    });
}

function checkLogin()
{
    SardineFish.API.Account.CheckLogin(function (data)
    {
        if (data)
        {
            $("#account-area").addClass("login");
            $("#user-avatar").get(0).src = "/account/user/face/getFace.php?uid=" + data.uid;
        }
    });
}

var windowTop = 0;
var menuSelectOffset = 0;
var topBarFied = false;
function menuButtonMouseOver(e)
{
    if (e.target)
    {
        var button = $(e.target);
        var x = parseInt($("#menuFocus").css("left6"));
        var tx = button.offset().left - $("#topMenuButtons").offset().left;
        menuSelectOffset = tx;
        $("#menuFocus").stop();
        $("#menuFocus").animate({ left: tx }, 200);
        /*
        if ($("#menuFocus").css("background-color") == "rgba(255, 255, 255, 0)")
        {
            $("#menuFocus").css("left", x.toString() + "px");
            $("#menuFocus").animate({backgroundColor: jQuery.Color("rgba(255,255,255,1.00)") }, 200);
        }
        else
            $("#menuFocus").animate({ left: x, backgroundColor: jQuery.Color("rgba(255,255,255,1.00)") }, 150);*/
        /*$(id).stop();
        $(id).animate({/* borderColor: jQuery.Color("#66CCFF"), backgroundColor: jQuery.Color("#66CCFF")}, 50);*/
    }
}
function menuButtonMouseOut(e)
{
        $("#menuFocus").stop();
        var x = parseInt($("#menuFocus").css("left"));
        var tx = $("#buttonHere").offset().left - $("#topMenuButtons").offset().left;
        $("#menuFocus").animate({ left: tx }, Math.abs(x - tx));
        //$("#menuFocus").animate({ left: menuSelectOffset, backgroundColor: jQuery.Color("rgba(150,220,255,0.00)") }, 200);
        /*$(id).stop();
        $(id).animate({/* borderColor: jQuery.Color("white"), backgroundColor: jQuery.Color("white")}, 50);*/
}
menuButtonMouseOut();
function windowScroll(e)
{
    var scrollTop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
    var topBarOffset = $("#topArea").offset().top;
    var dy = topBarOffset - scrollTop;
    if (scrollTop > topBarOffset && ! topBarFied)
    {
        $("#topBar").removeClass("extend");
        $("#topBar").addClass("fold");
    }
    else if (scrollTop <= topBarOffset)
    {
        $("#topBar").removeClass("fold");
        $("#topBar").addClass("extend");
    }
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight)
    {
        LoadArticle(10);
    }
    
    var bottomHeight = $("#pageBottom").height();
    var bodyHeight = $("#center").height();
}

//------------Events
function loaded()
{
    checkLogin();
    initTopMenu();
}
function windowResize(e)
{
}
function addEventHandle()
{
    $(".menuButton").mouseover(menuButtonMouseOver);
    $(".menuButton").mouseout(menuButtonMouseOut);
    window.addEventListener("load", loaded);
    window.addEventListener("scroll", windowScroll);
    

    $("#searchText").focus(function (e)
    {
        $("#searchText").css("border-bottom", "solid 2px #2196f3");
        $("#buttonSearch").css("color", "solid 2px #2196f3");
    });
    $("#searchText").blur(function (e)
    {
        $("#searchText").css("border-bottom", "solid 2px rgba(0,0,0,0.2)");
        $("#buttonSearch").css("color", "solid 2px solid 2px rgba(0,0,0,0.6)");
    });
}
addEventHandle();


var itemTemplate = $("#articleItemTemplate").get(0);
//------------Init Controls
SardineFish.Web.UI.setButton($(".button"), ButtonStyle.ColorTransit);
SardineFish.Web.UI.setButton($(".iconButton"), ButtonStyle.TextIcon);
$(".textbox").attr("contenteditable", "true");