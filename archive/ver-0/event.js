
var pageCodeEditor;
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
    if(pageCodeEditor)
    {
        var code = pageCodeEditor.getValue();
        evalCode(code);
    }
}
function skip()
{
    var t = 500;
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    $("#logoImg").stop(true);
    $("#mianTextFirstDiv").stop(true);
    $("#mainTextSecondDiv").stop(true);
    $("#mainFloat").stop(true);
    $("#skipDiv").stop(true);
    $("#logoImg").animate({ top: "-=" + (2 * height).toString() }, t);
    $("#mianTextFirstDiv").animate({ top: "-=" + (2 * height).toString() }, t);
    $("#mainTextSecondDiv").animate({ top: "-=" + (2 * height).toString() }, t);
    $("#mainFloat").animate({ top: "-=" + (2 * height).toString() }, t);
    $("#skipDiv").animate({ bottom: "+=" + (2 * height).toString() }, t, function ()
    {
        setTimeout(function ()
        {
            $("#mainFloat").css("display", "none");
            $("#helloWorldDiv").animate({ height: "140", borderWidth: "1", marginBottom: "10" }, 200, function ()
            {
                $("#helloWorldDiv").animate({ width: "1004" }, 700);
                $("#textHelloWorld").animate({ color: jQuery.Color("rgba(0,0,0,1.00)") }, 700, function ()
                {
                    setTimeout(function ()
                    {
                        $("#helloWorldDiv").animate({ borderColor: jQuery.Color("rgba(255,255,255,0.00)") }, 700);
                    }, 500);//边框消失延时
                });
            });
        },500);
    });
}
function loadLatest()
{
    SardineFish.All.GetPage(1, 1, 5, function (succeed, data)
    {
        for (var i = 0; i < data.length ; i++)
        {
            var item = data[i];
            var id = item.pid;
            var latestItem = $("<div></div>");
            latestItem.attr("id", id);
            latestItem.addClass("latestItem");
            var div = $("<div></div>");
            div.attr("id", "latestItem" + id.toString());
            div.css("margin-left", "10px");
            var title = $("<h5></h5>");
            title.addClass("latestTitle");
            title.attr("id", "latestTitle" + id.toString());
            var tag = $("<i></i>");
            tag.addClass("latestTag");
            switch (item.type)
            {
                case 'note':
                    tag.text("笔记");
                    break;
                case 'works':
                    tag.text("作品");
                    break;
                case 'article':
                    tag.text("文章");
                    break;
                default:
                    tag.text("其他");
            }
            title.append(tag);
            title.append(item.title);
            div.append(title);
            var time = $("<h6></h6>");
            time.addClass("latestTime");
            time.attr("id", "latestTime" + id.toString());
            time.text(item.time);
            div.append(time);
            var text = $("<h6></h6>");
            text.addClass("latestText");
            text.attr("id", "latestText" + id.toString());
            text.text(item.text.substr(0, 100) + "...");
            div.append(text);
            latestItem.append(div);
            var latestBottom = $("<div></div>");
            latestBottom.addClass("latestBottom");
            latestItem.append(latestBottom);
            var browseLink = $('<a class="textWithIcon"></a>');
            browseLink.attr("id", "latestBrowse" + id.toString());
            browseLink.attr("onselectstart", "return false");
            browseLink.append($('<i class="iconBrowse"></i>'));
            browseLink.append('浏览(<i id="latestBrowseNumber' + id.toString() + '"></i>)');
            SardineFish.Statistics.Browse.Get(id, item.type, function (data, id)
            {
                $("#latestBrowseNumber" + id.toString()).text(data);
            }, id);
            latestBottom.append(browseLink);
            var commentLink = $('<a class="textWithIcon"></a>');
            commentLink.attr("id", "latestComment" + id.toString());
            commentLink.attr("onselectstart", "return false");
            commentLink.append($('<i class="iconComment"></i>'));
            commentLink.append('回复(<i id="latestCommentNumber' + id.toString() + '"></i>)');
            SardineFish.Statistics.Comment.Get(id, item.type, function (data, id)
            {
                $("#latestCommentNumber" + id.toString()).text(data);
            }, id);
            latestBottom.append(commentLink);
            var likeLink = $('<a class="textWithIcon"></a>');
            likeLink.attr("id", "latestLike" + id.toString());
            likeLink.append($('<i class="iconLike"></i>'));
            likeLink.append('赞(<i id="latestLikeNumber' + id.toString() + '"></i>)');
            likeLink.attr("onclick", "addLike(" + id.toString() + ", '" + item.type + "', 'latestLikeNumber')");
            likeLink.attr("onselectstart", "return false");
            SardineFish.Statistics.Like.Get(id, item.type, function (data, id)
            {
                $("#latestLikeNumber" + id.toString()).text(data);
            }, id);
            latestBottom.append(likeLink);
            latestItem.append(latestBottom);
            $("#latestArea").append(latestItem);
        }
    });
}
function loadWorks()
{
    SardineFish.Works.GetPage(1, 0, 10, function (data)
    {
        for (var i = 0; i < data.length ; i++)
        {
            var item = data[i];
            var id = item.id.toString();
            var worksItem = $("<div></div>");
            worksItem.attr("id", "worksItme" + id);
            worksItem.addClass("worksItem");
            worksItem.attr("onselectstart", "return false");
            $("#worksArea").append(worksItem);
            var name = $('<a></a>');
            name.attr("id", "worksName" + id);
            name.attr("href", "/works/index.php?id=" + id);
            name.addClass("worksName");
            var icon = $("<i></i>");
            switch (item.type)
            {
                case "apps":
                    icon.addClass("worksTypeApp");
                    break;
                case "videos":
                    icon.addClass("worksTypeVideo");
                    break;
                case "musics":
                    icon.addClass("worksTypeMusic");
                    break;
                case "pictures":
                    icon.addClass("worksTypePicture");
                    break;
                default:
                    icon.addClass("worksTypeOther");
            }
            worksItem.append(icon);
            name.append(item.name);
            worksItem.append(name);
            worksItem.append("<br/>");
            var time = $('<h6></h6>');
            time.attr("id", "worksTime" + id);
            time.addClass("worksTime");
            time.text(item.time);
            worksItem.append(time);
            var tags = $('<h6></h6>');
            tags.addClass("worksTags");
            tags.text(item.tags);
            worksItem.append(tags);
            var text = $("<h6></h6>");
            text.addClass("worksText");
            text.text(item.summary.substr(0, 150));
            worksItem.append(text);
        }
    });
}
function loadArticle()
{
    SardineFish.Article.GetPage(1, 1, 10, function (succeed, data)
    {
        for (var i = 0; i < data.length ; i++)
        {
            var item = data[i];
            var id = item.pid.toString();
            var articleItem = $("<div></div>");
            articleItem.attr("id", "articleItme" + id);
            articleItem.addClass("articleItem");
            articleItem.attr("onselectstart", "return false");
            $("#articleArea").append(articleItem);
            var title = $('<a></a>');
            title.attr("id", "articleTitle" + id);
            title.attr("href", "/blog/index.php?id=" + id);
            title.addClass("articleTitle");
            title.append(item.title);
            articleItem.append(title);
            articleItem.append("<br/>");
            var time = $('<h6></h6>');
            time.attr("id", "articleTime" + id);
            time.addClass("articleTime");
            time.text(item.time);
            articleItem.append(time);
            var tags = $('<h6></h6>');
            tags.addClass("articleTags");
            tags.text(item.tags);
            articleItem.append(tags);
            var text = $("<h6></h6>");
            text.addClass("articleText");
            text.text(item.document.substr(0, 150));
            articleItem.append(text);
        }
    });
}
function getVisited()
{
    SardineFish.Statistics.Visited.Get("", function (result)
    {
        result = { data: result };
        var visited;
        switch (result.data % 10) {
            case 1:
                visited = result.data.toString() + "st";
                break;
            case 2:
                visited = result.data.toString() + "nd";
                break;
            case 3:
                visited = result.data.toString() + "rd";
                break;
            default:
                visited = result.data.toString() + "th";
        }
        var text = "You are the " + visited + " visitor.";
        $("#mainTextVisitor").text(text);
    });
    /*
    var request = new XMLHttpRequest();
    request.open("GET", "statistics/visited.php", true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function ()
    {
        if (request.readyState != 4)
            return;
        var json = request.responseText;
        var result;
        try
        {
            result = eval('(' + json + ')');
        }
        catch (ex) { throw new Error("JSON解析失败 json=" + json); }
        if (result.status != "^_^")
            throw new Error("获取访客数失败");
        
        
    };
    request.send();*/
}
function addLike(id, type, numberObject)
{
    SardineFish.Statistics.Like.Add(id, type, function (succeed, data, id)
    {
        if (!succeed)
            throw new Error(data);
        $("#" + numberObject + id.toString()).text(data);
    }, id);
}
//-----------------------------------------------Events-----------------------------------------------
function loaded()
{
    function animateSecond()
    {
        //var x = width - width * 0.05 - w;
        var x = (width - $("#mianTextFirstDiv").width());
        var y = k * x;
        var t = 1000;
        $("#logoImg").animate({ top: "+=" + y.toString(), left: "+=" + x.toString() }, t);
        $("#mianTextFirstDiv").animate({ top: "+=" + y.toString(), left: "+=" + x.toString() }, t);
        $("#mainTextSecondDiv").animate({ top: "+=" + y.toString(), left: "+=" + x.toString(), opacity: "1" }, t);
        setTimeout(skip, 5000);//结束延时
    }
    function animateFirst()
    {
        var x = width * 0.025;
        var y = k * x + b;
        $("#logoImg").animate({ left: x.toString(), top: y.toString() }, 1000, function ()
        {
            setTimeout(function ()
            {
                $("#textHey").animate({ color: jQuery.Color("rgba(128, 128, 128, 1.00)") }, 700, function ()
                {
                    setTimeout(function ()
                    {
                        var d = $("#mianTextFirstDiv").height() / 2;
                        $("#mianTextFirstDiv").animate({ top: "-="+d.toString() }, 300, function ()
                        {
                            $("#textI").animate({ width: "+="+(width*0.3).toString(), color: jQuery.Color("rgba(128,128,128,1.00)") }, 700, function ()
                            {
                                setTimeout(animateSecond, 1500);//第二幕延时
                            });
                        });
                    }, 700);//I'm 延时
                });

            }, 300);//Hey延时
        });
    }
    pageCodeEditor = CodeMirror.fromTextArea(document.getElementById("pageCodeInput"),
        {
            lineNumbers: true,
            extraKeys: { "Space": "autocomplete" },
            mode: { name: "javascript", globalVars: true }
        });
    var codeMirror = $("#pageCodeInputBorder div:first");
    codeMirror.css("height", "278px");
    loadLatest();
    loadWorks();
    loadArticle();
    var visited = $.cookie('visited');
    if (visited)
        return;
    $.cookie('visited',true);
    var left = height * 0.851;
    var right = width * -0.12890625 + left;
    var paint = window.document.getElementById("mainCanvas").getContext("2d");
    paint.beginPath();
    paint.lineWidth = "0";
    paint.moveTo(0, left);
    paint.lineTo(0, height);
    paint.lineTo(width, height);
    paint.lineTo(width, right);
    paint.fillStyle = "#FFEFB5";
    paint.closePath();
    paint.fill();
    var imgLogo = document.getElementById("logoImg");
    var w = 1024
    for (var i = 0; w > width / 2; i++)
    {
        w *= i % 2 == 0 ? 0.78125 : 0.64;
    }
    var h = w * 1.414;
    var dy = h * 0.595;
    var dx = w * 0.39;
    //y=kx+b
    var k = -0.12890625
    var b = left - dy;
    var b1 = left;
    var top = (width * 0.025 * k + b) + h * 0.359375 - $("#mianTextFirstDiv").height();
    //$("#mainTextSecondDiv").width();
    $("#mianTextFirstDiv").css("top", top.toString() + "px");
    $("#logoImg").css("top", (k * width + b).toString() + "px");
    $("#logoImg").css("left", (width).toString() + "px");
    var x = (width - $("#mianTextFirstDiv").width());
    var y = k * x;
    $("#mainTextSecondDiv").css("left", (width * 0.05 - x).toString() + "px");
    $("#mainTextSecondDiv").css("top", (top - y).toString() + "px");
    getVisited();
    //animate();
    setTimeout(animateFirst, 500);
    
}
var pageCodeContainerMouseDownLocationX = 0;
var pageCodeContainerMouseDownLocationY = 0;
var windowTop = 0;
var pageCodeContainerTop = 0;
var pageCodeContainerRight = 0;
var pageCodeContainerMouseDownHold = false;
var pageCodeContainerDrag = false;
var pageCodeIconHold = false;
var menuSelectOffset = 0;
function menuButtonMouseOver(sender)
{
    if (sender)
    {
        var id = "#" + sender.id;
        var x = $(id).offset().left - $("#buttonHome").offset().left;
        menuSelectOffset = x;
        $("#menuFocus").stop();
        if ($("#menuFocus").css("background-color") == "rgba(150, 220, 255, 0)")
        {
            $("#menuFocus").css("left", x.toString() + "px");
            $("#menuFocus").animate({backgroundColor: jQuery.Color("rgba(150,220,255,1.00)") }, 200);
        }
        else
            $("#menuFocus").animate({ left: x, backgroundColor: jQuery.Color("rgba(150,220,255,1.00)") }, 150);
        /*$(id).stop();
        $(id).animate({/* borderColor: jQuery.Color("#66CCFF"), backgroundColor: jQuery.Color("#66CCFF")}, 50);*/
    }
}
function menuButtonMouseOut(sender)
{
    if (sender)
    {
        var id = "#" + sender.id;
        $("#menuFocus").stop();
        $("#menuFocus").animate({ left: menuSelectOffset, backgroundColor: jQuery.Color("rgba(150,220,255,0.00)") }, 200);
        /*$(id).stop();
        $(id).animate({/* borderColor: jQuery.Color("white"), backgroundColor: jQuery.Color("white")}, 50);*/
    }
}
var pageCodeShown = false;
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
        if(pageCodeIconHold )
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
function Color(r, g, b, a)
{
    if (r == undefined)
        r = 0;
    if (g == undefined)
        g = 0;
    if (b == undefined)
        b = 0;
    if (a == undefined)
        a = 1;
    this.Red = r;
    this.Green = g;
    this.Blue = b;
    this.Alpha = a;
    this.toString = function ()
    {
        return "rgba(" + this.Red.toString() + "," + this.Green.toString() + "," + this.Blue.toString() + "," + this.Alpha.toString() + ")";
    };
}
function buttonMouseOver(sender)
{
    var id = sender.id;
    var obj = $("#" + id);
    var colorText = obj.css("background-color");
    var colorArray = colorText.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
    var r = parseInt(colorArray[0]);
    var g = parseInt(colorArray[1]);
    var b = parseInt(colorArray[2]);
    var a = 1.00;
    if (colorArray.length > 3)
        a = parseFloat(colorArray[3]);
    if (sender.color == undefined)
        sender.color = new Color(r, g, b, a);
    r = sender.color.Red + 20 > 255 ? 255 : sender.color.Red + 20;
    g = sender.color.Green + 20 > 255 ? 255 : sender.color.Green + 20;
    b = sender.color.Blue + 20 > 255 ? 255 : sender.color.Blue + 20;
    colorText = "rgba(" + r.toString() + "," + g.toString() + "," + b.toString() + "," + a.toString() + ")";
    obj.animate({ backgroundColor: jQuery.Color(colorText) }, 50);
}
function buttonMouseOut(sender)
{
    var id = sender.id;
    var obj = $("#" + id);
    obj.animate({ backgroundColor: jQuery.Color(sender.color.toString()) }, 50);
}
function buttonMouseDown(sender)
{
    var id = sender.id;
    var obj = $("#" + id);
    var r = 255
    var g = 255
    var b = 255
    var a = 1.00;
    if (sender.color)
    {
        r = sender.color.Red - 20 < 0 ? 0 : sender.color.Red - 20;
        g = sender.color.Green - 20 < 0 ? 0 : sender.color.Green - 20;
        b = sender.color.Blue - 20 < 0 ? 0 : sender.color.Blue - 20;
    }
    colorText = "rgba(" + r.toString() + "," + g.toString() + "," + b.toString() + "," + a.toString() + ")";
    obj.animate({ backgroundColor: jQuery.Color(colorText) }, 0);
}
function buttonMouseUp(sender)
{
    var id = sender.id;
    var obj = $("#" + id);
    var r = 255
    var g = 255
    var b = 255
    var a = 1.00;
    if (sender.color)
    {
        r = sender.color.Red + 20 > 255 ? 255 : sender.color.Red + 20;
        g = sender.color.Green + 20 > 255 ? 255 : sender.color.Green + 20;
        b = sender.color.Blue + 20 > 255 ? 255 : sender.color.Blue + 20;
    }
    colorText = "rgba(" + r.toString() + "," + g.toString() + "," + b.toString() + "," + a.toString() + ")";
    obj.animate({ backgroundColor: jQuery.Color(colorText) }, 50);
}
function setButton(button)
{
    button.attr("onselectstart", "return false");
    button.attr("onmouseover", "buttonMouseOver(this);");
    button.attr("onmousedown", "buttonMouseDown(this);");
    button.attr("onmouseup", "buttonMouseUp(this);");
    button.attr("onmouseout", "buttonMouseOut(this);");
}
function latestItemMouseOver(e)
{

}
function latestItemMouseOut(e)
{

}
function newsPieceMouseOver(e)
{
    var id = e.target.id;
    $("#" + id).stop();
    $("#" + id).animate({ backgroundColor: jQuery.Color("rgb(245,245,245)") }, 0);
}
function newsPieceMouseOut(e)
{
    var id = e.target.id;
    $("#" + id).stop();
    $("#" + id).animate({ backgroundColor: jQuery.Color("rgb(255,255,255)") }, 50);
}
function worksItemMouseOver(e)
{
    var id = e.target.id;
    $("#" + id).stop();
    $("#" + id).animate({ backgroundColor: jQuery.Color("rgb(245,245,245)") }, 0);
}
function worksItemMouseOut(e)
{
    var id = e.target.id;
    $("#" + id).stop();
    $("#" + id).animate({ backgroundColor: jQuery.Color("rgb(255,255,255)") }, 50);
}
function articleItemMouseOver(e)
{
    var id = e.target.id;

    $("#" + id).stop();
    $("#" + id).animate({ backgroundColor: jQuery.Color("rgb(245,245,245)") }, 0);
}
function articleItemMouseOut(e)
{
    var id = e.target.id;
    $("#" + id).stop();
    $("#" + id).animate({ backgroundColor: jQuery.Color("rgb(255,255,255)") }, 50);
}
function windowResize(e)
{
    var center = $("#centerRootDiv");
    var menu = $("#topMenu");
    $("#topBar").css("width", document.body.clientWidth.toString() + "px");
    var padding = ((document.body.clientWidth - 1024) / 2);
    if (padding < 0)
        padding = 0;
    center.css("padding-left", padding);
    center.css("padding-right", padding);
    menu.css("padding-right", padding.toString() + "px");
    padding -= 50;
    if (padding < 0)
        padding = 0;
    menu.css("padding-left", padding.toString() + "px");
}
function addEventHandle()
{
    window.onresize = windowResize;
    $(".menuButton").attr("onmouseover", "menuButtonMouseOver(this);");
    $(".menuButton").attr("onmouseout", "menuButtonMouseOut(this);");
    setButton($(".button"));
    var center = $("#centerRootDiv");
    var menu = $("#topMenu");
    $("#topBar").css("width", document.body.clientWidth.toString() + "px");
    var padding = ((document.body.clientWidth - 1024) / 2);
    center.css("padding-left", padding);
    center.css("padding-right", padding);
    menu.css("padding-left", (padding - 50).toString() + "px");
    menu.css("padding-right", padding.toString() + "px");
    window.onload = loaded;
    document.getElementById("pageCodeContainer").onmousedown = pageCodeContainerMouseDown;
    window.onmousemove = windowMouseMove;
    document.getElementById("pageCodeContainer").onmouseup = pageCodeContainerMouseUp;
    document.getElementById("pageCodeInputBorder").onmousedown = function (e) { e.stopPropagation() };
    document.getElementById("pageCodeIcon").onmousedown = function (e)
    {
        pageCodeIconHold = true;
    };
    document.getElementById("pageCodeIcon").onmouseup =function (e)
    {
        pageCodeIconHold = false;
    }
}
addEventHandle();

//---------------------------------------------------------------------------------------------------
/*if (height > width)
    fontSize = Math.floor($("#mainFloat").width() * 0.08);*/
var fontSize = Math.floor($("#mainFloat").width() * 0.04);
$(".text1").css("font-size", fontSize.toString() + "px");
$(".text2").css("font-size", (fontSize * 0.83333333).toString() + "px");
$(".text3").css("font-size", (fontSize * (2 / 3)).toString() + "px");
$(".text4").css("font-size", (fontSize * 0.5).toString() + "px");
$(".text5").css("font-size", (fontSize * (1 / 3)).toString() + "px");
$(".text6").css("font-size", (fontSize * 0.22222222222).toString() + "px");
var visited = $.cookie('visited');
if (!visited)
{
    $("#mainFloat").css("display", "block");
    var div = $("#mainFloat");
    var height = div.height() / 2;
    var width = div.width();
    var canvas = $("#mainCanvas");
    canvas.attr("width", width.toString());
    canvas.attr("height", height.toString());
}