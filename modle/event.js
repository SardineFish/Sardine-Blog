
var pageCodeEditor;
function evalCode(code)
{
    try
    {
        eval(code);

    }
    catch (ex)
    {
        alert(ex.message);
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
//-----------------------------------------------Events-----------------------------------------------
function loaded()
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
    $(".menuButton").attr("onmouseover", "menuButtonMouseOver(this);");
    $(".menuButton").attr("onmouseout", "menuButtonMouseOut(this);");
    window.onresize = windowResize;
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