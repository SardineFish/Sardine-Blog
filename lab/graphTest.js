
var height = $("#browserSize").height();
var width = $("#browserSize").width();
var themeDeepColor = "#66CCFF";
var themeLightColor = "white";
var lineCount = 1;
var usingTool = "drawPoint";
var G = new Graph();
function List(type)
{
    function Node(obj, next)
    {
        this.obj = obj;
        this.next = next;
    }
    this.type = type;
    this.linkList = new Node(null, null);
    this.count = 0;
    this.add=function (obj)
    {
        if (obj.constructor != this.type)
            throw new Error("类型不一致");
        var p = this.linkList;
        if (count == 0)
        {
            this.linkList = new Node(obj, null);
        }
        else
        {
            for (var i = 0; obj < count - 1; i++)
            {
                p = p.next;
            }
            p.next = new Node(obj, null);
        }
        return count++;
    }
    this.insert = function (index, obj)
    {
        if (isNaN(index) || index < 0 || index > this.count)
        {
            throw new Error("无效的索引值");
        }
        if (obj.constructor != this.type)
            throw new Error("类型不一致");
        if (index == 0)
        {
            var p = new Node(obj, this.linkList);
            this.linkList = p;
        }
        else
        {
            var p = this.linkList;
            for (var i = 0; i < index - 1; i++)
            {
                p = p.next;
            }
            var q = p.next;
            p.next = new Node(obj, q);
        }
        count++;
    }
    this.get=function(index)
    {
        if (isNaN(index) || index < 0 || index > this.count)
        {
            throw new Error("无效的索引值");
        }
        var p = this.linkList;
        for (var i = 0; i < index; i++)
        {
            p = p.next;
        }
        return p.obj;
    }
}
function Vertice(id)
{
    this.id = id;
    this.name = "";
    this.other = new Array(0);
}
function Edge(u, v, dir, weight)
{
    this.begin = u;
    this.end = v;
    this.weight = 0;
    this.dir = dir;
}
function Graph()
{
    this.V = new List(Vertice);
    this.E = new List(Edge);
}
function setButton(obj)
{

    obj.attr("onmousedown", "buttonMouseDown(this)");
    obj.attr("onmouseup", "buttonMouseUp(this)");
    obj.attr("onmouseout", "buttonMouseUp(this)");
    obj.attr("onselectstart", "return false");
}
function setTools()
{
    var tools = $(".tools");
    tools.css("background-color", "transparent");
    tools.css("border", "solid 1px transparent");
    tools.mouseenter(function (e)
    {
        var id = e.target.id;
        if (id && id != "")
            $("#" + id).css("background-color", "white");
    });
    tools.mouseout(function (e)
    {
        var id = e.target.id;

        $("#" + id).css("background-color", "transparent");
        /*if (usingTool != id)
        {
            $("#" + id).css("background-color", "transparent");
        }*/
    });
    tools.click(function (e)
    {
        $(".tools").css("background-color", "transparent");
        $(".tools").css("border", "solid 1px transparent");
        var sender = $(e.target);
        //sender.css("background-color", "white");
        sender.css("border", "solid 1px #66CCFF");
        usingTool = sender[0].id;
        toolChange();
    });
}
function setUnselectable()
{
    $(".unselectable").attr("onselectstart", "return false;");
}
function setColorPicker()
{
    $("#pointColorPicker").spectrum({
        color: "rgb(255, 109, 109)",
        showAlpha: true,
        showInitial: true,
        showInput: true,
        showPaletteOnly: true,
        togglePaletteOnly: true,
        togglePaletteMoreText: '更多',
        togglePaletteLessText: '收起',
        palette: [
            ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
            ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
            ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
            ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
            ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
            ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
            ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
            ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
        ]
    });
}
function setRelativeCenterObject()
{
    var objs = $(".relativeCenterObject");
    for (var i = 0; i < objs.length ; i++)
    {
        var obj = $(objs[i]);
        var w = obj.width();
        var h = obj.height();
        var parent = obj.parent();
        var left = (obj.parent().width() - w) / 2;
        left = left < 0 ? 0 : left;
        var top = (obj.parent().height() - h) / 2;
        top = top < 0 ? 0 : top;
        obj.css("left", left.toString() + "px");
        obj.css("top", top.toString() + "px");
        obj.resize(function (e)
        {
            var obj = $(e.target);
            var w = obj.width();
            var h = obj.height();
            var parent = obj.parent();
            var left = (obj.parent().width() - w) / 2;
            left = left < 0 ? 0 : left;
            var top = (obj.parent().height() - h) / 2;
            top = top < 0 ? 0 : top;
            obj.css("left", left.toString() + "px");
            obj.css("top", top.toString() + "px");
        });
    }
}
setTools();
setUnselectable();
setColorPicker();
function buttonMouseDown(obj)
{
    if (!obj)
        console.warn("!obj");
    var id = obj.id;
    if (!id)
        console.warn("!id");
    $("#" + id).css("background-color", themeDeepColor);
    $("#" + id).css("color", themeLightColor);
}
function buttonMouseUp(obj)
{
    if (!obj)
        console.warn("!obj");
    var id = obj.id;
    if (!id)
        console.warn("!id");
    $("#" + id).css("background-color", themeLightColor);
    $("#" + id).css("color", themeDeepColor);
}
$("#graphArea").mousemove(function (e)
{
    var scrollX = document.documentElement.scrollLeft + document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop + document.body.scrollTop;
    var offsetX = $("#mainArea")[0].offsetLeft;
    var offsetY = $("#mainArea")[0].offsetTop;
    var x = e.clientX + scrollX - offsetX;
    var y = e.clientY + scrollY - offsetY;
    if (usingTool == "drawPoint")
    {
        var point = $("#point");
        point.css("left", (x - 8).toString() + "px");
        point.css("top", (y - 8).toString() + "px");
    }
});
$("#graphArea").click(function (e)
{
    var scrollX = document.documentElement.scrollLeft + document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop + document.body.scrollTop;
    var offsetX = $("#mainArea")[0].offsetLeft;
    var offsetY = $("#mainArea")[0].offsetTop;
    var x = e.clientX + scrollX - offsetX;
    var y = e.clientY + scrollY - offsetY;
    if (usingTool == "drawPoint")
    {
        var point = $("<div class='point'></div>");
        point.css("left", (x - 8).toString() + "px");
        point.css("top", (y - 8).toString() + "px");
        $("#graphArea").append(point);
    }
});
function goBack()
{
    hide(visiting, 250, function ()
    {
        show(lastVisit, 250);
    });
}
function goTo(now, to, callback)
{
    lastVisit = now;
    visiting = to;
    $("#" + to).css("opacity", "0.00");
    $("#" + to).css("display", "block");
    hide(now, 250, function () { show(to, 250, callback); });
}
function hide(obj, t, callback)
{
    if (isNaN(t))
        t = 700;
    $("#" + obj).animate({ opacity: 0 }, t, function ()
    {
        $("#" + obj).css("display", "none");
        $("#" + obj).css("opacity", "1");
        if (callback)
            callback();
    });
}
function show(obj, t, callback)
{
    if (isNaN(t))
        t = 700;
    $("#" + obj).css("opacity", "0");
    $("#" + obj).css("display", "block");
    $("#" + obj).animate({ opacity: 1 }, t, callback);
}
function runCode(code)
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
function runButtonClick(sender)
{
    var code = $("#codeText").text();
    runCode(code);
}
function lineChange()
{
    var ps = $("#codeText p");
    var divs = $("#codeText div");
    var length = Math.max(ps.length, divs.length + 1);
    if (length > lineCount)
    {
        for (; lineCount < length; lineCount++)
            $("#lineNumber").append($("<p> </p>"));
    }
    else if (length < lineCount)
    {
        for (; lineCount > length; lineCount--)
            $($("#lineNumber p")[0]).remove();
    }
    //console.warn(length);
}
function toolChange()
{
    if (usingTool == "drawPoint")
    {
        $("#graphArea").css("cursor", "crosshair");
    }
    else if (usingTool == "drawLine")
    {
        $("#graphArea").css("cursor", "crosshair");
    }
    else if (usingTool == "selectTool")
    {
        $("#graphArea").css("cursor", "default");
    }
    else if (usingTool == "moveTool")
    {
        $("#graphArea").css("cursor", "move");
    }
}
function resize()
{
    //$("#mainArea").css("height",(height-$("#topArea").height()).toString()+"px");
    $("#graphArea").css("height", (height - $("#topArea").height()).toString() + "px");
    $("#codeArea").css("height", (height - $("#topArea").height()).toString() + "px");
    $("#codeEditor").css("height", (height - $("#topArea").height() - $("#buttonArea").height() - 20).toString() + "px");

    setRelativeCenterObject();
    //console.warn($("html").height()+","+$("#root").height()+","+$("#mainArea").height()+","+$("#graphArea").height());
}
$("#codeText").bind('DOMNodeInserted', lineChange);
resize();
setButton($(".button"));
setButton($(".smallButton"));