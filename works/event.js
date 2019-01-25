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
            if (pageCodeIconHold)
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
var nextPage = 0;
var loading = false;
function ShowNotice(text)
{
    $("#dialogBackground").css("display", "block");
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
//------------TopArea & userArea
var login = false;
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
                $("#textWelcome").animate({
                    opacity: 1.0
                }, 700, function ()
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
function loadUser()
{
    var cookie = $.cookie("login");
    if (cookie && cookie != "false")
    {
        login = true;
        $("#post").css("display", "block");
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
function userFaceClick(e)
{
    if (!login)
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

//------------TopBar
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
    if (e.target)
    {
        var button = $(e.target);
        $("#menuFocus").stop();
        var x = parseInt($("#menuFocus").css("left"));
        var tx = $("#buttonHere").offset().left - $("#topMenuButtons").offset().left;
        $("#menuFocus").animate({ left: tx }, Math.abs(x - tx));
        //$("#menuFocus").animate({ left: menuSelectOffset, backgroundColor: jQuery.Color("rgba(150,220,255,0.00)") }, 200);
        /*$(id).stop();
        $(id).animate({/* borderColor: jQuery.Color("white"), backgroundColor: jQuery.Color("white")}, 50);*/
    }
}
function windowScroll(e)
{
    var scrollTop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
    var topBarOffset = $("#topArea").offset().top;
    var dy = topBarOffset - scrollTop;
    if (scrollTop > topBarOffset && !topBarFied)
    {
        //$("#topBar").css("position", "fixed");
        //$("#topMenu").css("top", dy + "px");
        $("#topMenu").stop();
        $("#topMenu").animate({ height: 50 }, 100);
        $("#userArea").animate({ top: 2 }, 100);
        $("#userFace").animate({ height: 25, width: 25 }, 100);
        SardineFish.Web.UI.valueAnimate(56, 22, 100, 60, function (n)
        {
            $("#userFace").css("font-size", n + "px");
        });
        topBarFied = true;
    }
    else if (scrollTop <= topBarOffset)
    {
        //$("#topBar").css("position", "relative");
        $("#topMenu").stop();
        $("#topMenu").animate({ height: 75 }, 100);
        $("#userArea").animate({ top: 10 }, 100);
        $("#userFace").animate({ height: 64, width: 64 }, 100);
        SardineFish.Web.UI.valueAnimate(22, 56, 100, 60, function (n)
        {
            $("#userFace").css("font-size", n + "px");
        });
        topBarFied = false;
    }

    var bottomHeight = $("#pageBottom").height();
    var bodyHeight = $("#center").height();
    if (scrollTop + window.innerHeight > bodyHeight)
    {
    }
}

//------------Events
function loaded()
{
    loadUser();
}
function windowResize(e)
{
}
function addEventHandle()
{
    $(".menuButton").mouseover(menuButtonMouseOver);
    $(".menuButton").mouseout(menuButtonMouseOut);
    $("#userFace").click(userFaceClick);
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

//------------Init Controls
SardineFish.Web.UI.setButton($(".button"), ButtonStyle.ColorTransit);
SardineFish.Web.UI.setButton($(".iconButton"), ButtonStyle.TextIcon);
$(".textbox").attr("contenteditable", "true");