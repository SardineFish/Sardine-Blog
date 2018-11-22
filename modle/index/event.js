var pageCodeEditor;
function loadTopArea(callback)
{
    var width = $("#topImgArea").width();
    var height = 400;

    var canvas = $("#canvas").get(0);
    $("#canvas").css("background-color", "#beefff");
    var ctx = canvas.getContext("2d");

    var game = Game.createByCanvas(canvas);
    var graphics = game.graphics;
    var scene = new Scene();
    game.setScene(scene);
    var camera = new Camera(0, 0, 0, 0, 1);
    camera.graphics = graphics;
    scene.camera = camera;
    game.start();
    canvas.width = width;
    canvas.height = height;
    camera.moveTo(width / 2, height / 2);

    var left = 50;
    var right = 200;
    var k = (right - left) / width;
    var b = left - 20;
    //ground
    var groundGraphic = new Polygon([new Point(0, left), new Point(0, 0), new Point(width, 0), new Point(width, right)]);
    groundGraphic.setCenter(width, right);
    groundGraphic.strokeStyle = "#FFEFB5";
    groundGraphic.fillStyle = "#FFEFB5";
    var ground = new GameObject();
    ground.graphic = groundGraphic;
    ground.setCenter(width, right);
    ground.moveTo(width, 0);
    scene.addGameObject(ground);
    var seedImg = new SardineFish.Web.Engine2D.Image();
    var seedling = new GameObject();
    seedling.graphic = seedImg;
    seedImg.loadFromUrl(resource.img.logo.logoMain[800].min.PNG, function ()
    {
        seedImg.height = height;
        seedImg.width = seedImg.height / 1.414;
        seedImg.setCenter(0 - seedImg.width, (0 - seedImg.width) * k + b, function (w, h)
        {
            return new Point(w / 1024 * 400, h / 1447 * 940);
        });
        seedling.setCenter(seedImg.position.x, seedImg.position.y);

        //moveGround
        ground.moveAnimateTo(width, right, 0.7, function ()
        {
            scene.addGameObject(seedling);
            //moveSeedling
            seedling.moveAnimateTo(width / 3, width / 3 * k + b, 1, function ()
            {
                //shoeText
                $("#textWelcome").animate({ opacity: 1.0 }, 700, function ()
                {
                    window.addEventListener("mousemove", function (e)
                    {
                        seedling.moveAnimateTo(e.pageX, e.pageX * k + b, 0.3);
                    });
                    if (callback)
                        callback();
                });

            });
        })
    });
    //seedling

}
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
function loadUser()
{
    var cookie = $.cookie("login");
    if (cookie && cookie != "false")
    {
        login = true;
        var uid = $.cookie("uid");
        SardineFish.Web.UI.valueAnimate(0, 90, 300, 60, function (v)
        {
            $("#userFace").css("transform", "rotateY(" + v + "deg)");
        },
        function ()
        {
            $("#userFace").css("background-image", 'url("/account/user/face/getFace.php?uid=' + encodeURIComponent(uid) + '");');
            $("#loginIcon").css("display", "none");
            SardineFish.Web.UI.valueAnimate(-90, 0, 300, 60, function (v)
            {
                $("#userFace").css("transform", "rotateY(" + v + "deg)");
            });
        });
        //$("#userFace").text("");
    }
}
//-----------------------------------------------Events-----------------------------------------------
function loaded()
{
    height = 400;
    pageCodeEditor = CodeMirror.fromTextArea(document.getElementById("pageCodeInput"),
        {
            lineNumbers: true,
            extraKeys: { "Space": "autocomplete" },
            mode: { name: "javascript", globalVars: true }
        });
    var codeMirror = $("#pageCodeInputBorder div:first");
    codeMirror.css("height", "278px");
    loadUser();
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
var pageCodeShown = false;
var login = false;
/*var searchTextBox = new SardineFish.Web.UI.TextBox($("#textboxSearch"));
var topBarOffset;
searchTextBox.emptyText = "Search [施工中]";
searchTextBox.button = $('<a class="iconButton" style="font-family:fontIcon;">&#xE1A3</a>');*/
function userFaceClick(e)
{
    if(!login )
    {
        window.location = "/account/login";
    }
    else 
    {
        window.location = "/account/user/face/upload.html";
    }
    /*
    $("#userFace").css('ry', "45");
    SardineFish.Web.UI.valueAnimate(0, 900, 2000, 60, function (v)
    {
        $("#userFace").css("transform", "rotateY(" + v + "deg)");
    });*/
    /*$("#userFace").animate({ ry: 90 }, {
        start: 45,
        end:90,
        step: function (now, xt)
        {
            $("#userFace").css("transform", "rotateY(" + now + "deg)");
        }
    });*/
}
function menuButtonMouseOver(sender)
{
    if (sender)
    {
        var id = "#" + sender.id;
        var x = parseInt($("#menuFocus").css("left"));
        var tx = $(id).offset().left - $("#buttonHome").offset().left;
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
function menuButtonMouseOut(sender)
{
    if (sender)
    {
        var id = "#" + sender.id;
        $("#menuFocus").stop();
        var x = parseInt($("#menuFocus").css("left"));
        var tx = $("#buttonHome").offset().left-$("#buttonHome").offset().left;
        $("#menuFocus").animate({ left: tx }, Math.abs(x - tx) * 1000 / 700);
        //$("#menuFocus").animate({ left: menuSelectOffset, backgroundColor: jQuery.Color("rgba(150,220,255,0.00)") }, 200);
        /*$(id).stop();
        $(id).animate({/* borderColor: jQuery.Color("white"), backgroundColor: jQuery.Color("white")}, 50);*/
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
    loadTopArea();
}
function windowScroll(e)
{
    var scrollTop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
    if (scrollTop > topBarOffset)
    {
        $("#topBar").css("position", "fixed");
        $("#topBar").css("top", "0");
    }
    else
    {
        $("#topBar").css("position", "relative");
    }
}
function addEventHandle()
{
    window.onresize = windowResize;
    window.onscroll = windowScroll;
    $(".menuButton").attr("onmouseover", "menuButtonMouseOver(this);");
    $(".menuButton").attr("onmouseout", "menuButtonMouseOut(this);");
    //setButton($(".button"));
    topBarOffset = $("#topBar").offset().top;
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
    $("#userFace").click(userFaceClick);
}
addEventHandle();

SardineFish.Web.UI.setButton($(".button"), ButtonStyle.ColorTransit);
SardineFish.Web.UI.setButton($(".iconButton"), ButtonStyle.TextIcon);