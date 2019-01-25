
function Snake(x, y, l)
{
    function Node(x, y, next)
    {
        this.x = x;
        this.y = y;
        this.next = next;
    }
    this.toArrat = function ()
    {
        var a = new Array(this.length);
        var p = this.tail;
        for (var i = this.length - 1; i >= 0; i--)
        {
            a[i] = p;
            p = p.next;
        }
        return a;
    }
    this.move = function (x, y)
    {
        this.head.next = new Node(x, y, null);
        this.head = this.head.next;
        this.tail = this.tail.next;
    }
    this.eat = function (x, y)
    {
        this.length++;
        this.head.next = new Node(x, y, null);
        this.head = this.head.next;
    }
    this.isBody = function (x, y)
    {
        var p = this.tail;
        while (p != null)
        {
            if (p.x == x && p.y == y)
                return true;
            p = p.next;
        }
        return false;
    }
    this.length = l;
    this.head = new Node(x, y, null);
    this.tail = this.head;
    for (var i = 0; i < l; i++)
    {
        var p = new Node(x + 1, y, null);
        p.next = this.tail;
        this.tail = p;
    }
}
var Color = (function (color)
{
    color = function (r, g, b, a)
    {
        r = int(r);
        g = int(g);
        b = int(b);
        if (isNaN(r) || r >= 256)
            r = 255;
        else if (r < 0)
            r = 0;
        if (isNaN(g) || g >= 256)
            g = 255;
        else if (g < 0)
            g = 0;
        if (isNaN(b) || b >= 256)
            b = 255;
        else if (b < 0)
            b = 0;
        if (isNaN(a) || a > 1.0)
            a = 1.0;
        else if (a < 0)
            a = 0;
        this.red = r;
        this.green = g;
        this.blue = b;
        this.alpha = a;
        this.toString = function ()
        {
            return "rgba(" + this.red.toString() + "," + this.green.toString() + "," + this.blue.toString() + "," + this.alpha.toString() + ")";
        }
    }
    color.random = function ()
    {
        return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1.0);
    }
    return color;
}(Color));
function Direction(x, y)
{
    this.x = sign(x);
    this.y = sign(y);
}
function DirectionList()
{
    function Node(x, y, next)
    {
        this.x = x;
        this.y = y;
        this.next = next;
    }
    this.first = null;
    this.last = this.first;
    this.add = function (x, y)
    {
        if (this.last == null)
        {
            this.last = new Node(x, y, null);
            this.first = this.last;
        }
        else
        {
            this.last.next = new Node(x, y, null);
            this.last = this.last.next;
        }
    }
    this.get = function ()
    {
        return this.first;
    }
    this.out = function ()
    {
        var p = this.first;
        if (this.first != null)
            this.first = this.first.next;
        if (this.first == null)
            this.last = null;
        return p;
    }
}
function Point(x, y)
{
    this.x = x;
    this.y = y;
}

var height = screen.availHeight;
var width = screen.availWidth;
var snake = new Snake(0, 0, 1);
var food;
var canvas = document.getElementById("paint");
var drawer = canvas.getContext("2d");
var bw = 0;//blockWidth
var sw = 0;//snakeWidth
var sl = 4;//snakeLength
var w = 24;
var h = 14;
var ph = 0;//paintHeight
var pw = 0;//paintWidth
var v0 = 3;// blocks/s
var a = 0;// blocks/s
var vMax = 6;// blocks/s
var v = v0;
var fps = 60;
var sen = 0.05;//sensitivity
var themeColor = new Color(102, 204, 255, 1);
var themeBackgroundColor = new Color(255, 255, 255, 1.00);
var themeColor2 = new Color(255, 169, 56, 1);
var bColor = new Color(250, 250, 250, 1);//backgroundColor
var sColor = new Color(102, 204, 255, 1);//snakeColor
var fColor = new Color(255, 208, 132, 1);//foodColor
var borderColor = new Color(200, 200, 200, 1.00);
var started = false;
var dir = new Direction(-1, 0);
var dirList = new DirectionList();
var lastTime;
var fpsCount = 0;
var downX = 0;
var downY = 0;
var slideX = 0;
var slideY = 0;
var touching = false;
var moved = true;
var lastVisit = "startMenu";
var visiting = "startMenu";
var holdTime = 0;
var keyhold = 0;
var control = "slide";
var keyboard = "on";
var speedUp = "hold";
var hasHeldSpeedUp = false;
var hasSlidedSpeedUp = false;
var sensitivityBlockHold=false;
function int(x)
{
    return parseInt(x);
}
function sign(x)
{
    if (x < 0)
        return -1;
    else if (x == 0)
        return 0;
    return 1;
}
function abs(x)
{
    if (x < 0)
        return -x;
    return x;
}
function sensitivity(x)
{
    return 0.18*x*x-0.37*x+0.2;
}
function arcSensitivity(y)
{
    return (0.37-Math.sqrt(0.37*0.37-4*0.18*(0.2-y)))/(2*0.18);
}
function drawRect(drawer, x1, y1, x2, y2)
{
    if (!drawer)
        return;
    if (isNaN(x1) || isNaN(x2) || isNaN(y1) || isNaN(y2))
        return;
    var x = Math.min(x1, x2);
    var y = Math.min(y1, y2);
    var w = abs(x1 - x2) + 1;
    var h = abs(y1 - y2) + 1;
    drawer.fillRect(x, y, w, h);
}
function drawBorder()
{
    $("body").css("background-color", borderColor.toString());
    drawer.fillStyle = borderColor.toString();
    drawer.fillRect(0, 0, pw, int((bw - sw) / 2));
    drawer.fillRect(0, 0, int((bw - sw) / 2), ph);
    drawer.fillRect(pw - (bw - sw) / 2, 0, int((bw - sw) / 2), ph);
    drawer.fillRect(0, ph - (bw - sw) / 2, pw, int((bw - sw) / 2));
}
function start()
{
    if (started)
        return;
    started = true;
    hide("menu",500);
    hide("startMenu",500);
    hide("menuOver",500);
    canvas.width = pw;
    canvas.height = ph;
    drawBorder();
    snake = new Snake(w / 2, h / 2, 4);
    //drawer.fillStyle=sColor.toString();
    //drawer.fillRect(snake.head.x*bw+(bw-sw),snake.head.y*bw+(bw-sw),4*sw+3*(bw-sw),sw);
    dir = new Direction(-1, 0);
    setFood();
    lastTime = new Date().getTime();
    move();
}
function over()
{
    started = false;
    $("#gameScore").text(snake.length.toString() + "cm");
    /*$("#menu").css("display", "block");
    $("#overMenu").css("display", "block");
    $("#menu").animate({ opacity: "1.0" }, 700);
    $("#scorePostArea").css("display", "block");*/
    show("overMenu");
    show("menu");
    show("scorePostArea");
    //console.warn("Σ(?ω??)?! Game Over！"+snake.length.toString()+"cm");
    //start();
}
function setFood()
{
    var x = int(Math.random() * w) % w;
    var y = int(Math.random() * h) % h;
    while (snake.isBody(x, y))
    {
        x = int(Math.random() * w) % w;
        y = int(Math.random() * h) % h;
    }
    food = new Point(x, y);
    drawer.fillStyle = fColor.toString();
    drawer.fillRect(x * bw + (bw - sw) / 2, y * bw + (bw - sw) / 2, sw, sw);
}
function showFps()
{
    $("#debugFPS").text(fpsCount.toString() + "fps");
    fpsCount = 0;
    setTimeout(showFps, 1000);
}
function move()
{
    /*try
    {*/
        if (!started)
            return;
        var d = dirList.out();
        if (d != null)
        {
            if (!(d.x == -dir.x && d.y == -dir.y))
                dir = d;
        }
        var eating = false;
        if (snake.head.x + dir.x == food.x && snake.head.y + dir.y == food.y)
            eating = true;
        var crashed = false;
        if (snake.isBody(snake.head.x + dir.x, snake.head.y + dir.y))
        {
            crashed = true;
        }
        if (snake.head.x + dir.x < 0 || snake.head.x + dir.x >= w)
        {
            over();
            return;
        }
        if (snake.head.y + dir.y < 0 || snake.head.y + dir.y >= h)
        {
            over();
            return;
        }
        moved = true;
        var head = snake.head;
        var tail = snake.tail;
        var x = head.x * bw + (bw - sw) / 2;
        var y = head.y * bw + (bw - sw) / 2;
        var tx = snake.tail.x * bw + (bw - sw) / 2;
        var ty = snake.tail.y * bw + (bw - sw) / 2;
        var tdx = sign(snake.tail.next.x - snake.tail.x);
        var tdy = sign(snake.tail.next.y - snake.tail.y);
        var dx = dir.x;
        var dy = dir.y;
        $("#debugMove").text("head(" + head.x.toString() + "," + head.y.toString() + ")");
        var tw = 0;
        var th = sw - 1;
        var dw = 0;
        var dh = sw - 1;
        var moveX = 0;
        var moveY = 0;
        var tMoveX = 0;
        var tMoveY = 0;
        if (dx == 0)
        {
            dw = sw - 1;
            dh = 0;
        }
        if (tdx == 0)
        {
            tw = sw - 1;
            th = 0;
        }
        if (dx > 0) { x += sw; }
        else if (dx < 0) { x -= 1; }
        else if (dy > 0) { y += sw; }
        else if (dy < 0) { y -= 1; }
        if (tdx > 0 || tdy > 0) { }
        else if (tdx < 0) { tx += sw - 1; }
        else if (tdy < 0) { ty += sw - 1; }
        if (eating)
        {
            snake.eat(snake.head.x + dx, snake.head.y + dy);
            setFood();
        }
        function draw()
        {
            if (!started)
                return;
            fpsCount++;
            var t = new Date().getTime() - lastTime;
            lastTime = new Date().getTime();
            moveX += sign(dx) * v * bw * (1 / fps);
            moveY += sign(dy) * v * bw * (1 / fps);
            tMoveX += sign(tdx) * v * bw * (1 / fps);
            tMoveY += sign(tdy) * v * bw * (1 / fps);
            if (crashed && (abs(moveX) >= bw - sw || abs(moveY) >= bw - sw))
            {
                over();
                return;
            }
            if (abs(moveX) >= sw + (bw - sw) || abs(moveY) >= sw + (bw - sw))
            {
                if (abs(moveX) >= sw + (bw - sw))
                    moveX = dx * (sw + (bw - sw) - 1);
                else
                    moveY = dy * (sw + (bw - sw) - 1);
                if (abs(tMoveX) >= (bw - sw))
                    tMoveX = tdx * (sw + (bw - sw) - 1);
                else
                    tMoveY = tdy * (sw + (bw - sw) - 1);
                drawer.fillStyle = sColor.toString();
                drawRect(drawer, x, y, x + int(moveX) + dw, y + int(moveY) + dh);
                drawer.fillStyle = bColor.toString();
                if (!eating)
                {
                    drawRect(drawer, tx, ty, tx + int(tMoveX) + tw, ty + int(tMoveY) + th);
                    snake.move(snake.head.x + dx, snake.head.y + dy);
                }
                move();
                return;
            }
            //drawer.fillRect(x+int(moveX),y+int(moveY),dw,dh);
            drawer.fillStyle = sColor.toString();
            drawRect(drawer, x, y, x + int(moveX) + dw, y + int(moveY) + dh);
            drawer.fillStyle = bColor.toString();
            if (!eating)
                drawRect(drawer, tx, ty, tx + int(tMoveX) + tw, ty + int(tMoveY) + th);
            setTimeout(draw, int(1000 / fps));
        }
        draw();
   /* } catch (ex) { console.warn(ex.message); }*/
}
function controlSpeedUp(t)
{
    if (holdTime == t)
    {
        v = vMax;
        hasHeldSpeedUp = true;
    }
}
function mouseDown(e)
{
    if (speedUp == "slide")
        v = v0;
    if (!touching)
    {
        if (speedUp == "hold")
        {
            holdTime = new Date().getTime();
            setTimeout("controlSpeedUp(" + holdTime.toString() + ")", 200);
        }
    }
    if (e.type == "pointerover")
        return;
    v = v0;
    touching = true;
    if (e.touches && e.touches[0])
    {
        downX = e.touches[0].screenX;
        downY = e.touches[0].screenY;
    }
    else
    {
        downX = e.screenX;
        downY = e.screenY;
    }
    $("#debugControl").text("down");
    $("#debugControlPosition").text("(" + downX + "," + downY + ")");
}
function mouseUp(e)
{
    sensitivityBlockHold=false;
    if (speedUp == "hold")
    {
        holdTime = 0;
        v = v0;
    }
    touching=false;
    //$("#debugControl").text("up");
}
function mouseMove(e)
{
    try
    {
        if(sensitivityBlockHold)
        {
            var clientX=0;
              var clientY=0;
            if (e.touches && e.touches[0])
            {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            else
            {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            moveSenBar(clientX);
        }
        if (!touching)
            $("#debugControl").text("move without touching");
        if (!moved)
            $("#debugControl").text("move not moved");
        var x = 0;
        var y = 0;
        if (e.touches && e.touches[0])
        {
            x = e.touches[0].screenX;
            y = e.touches[0].screenY;
        }
        else
        {
            x = e.screenX;
            y = e.screenY;
        }
        var dx = slideX = x - downX;
        var dy = slideY = y - downY;
        $("#debugControlPosition").text("(" + dx + "," + dy + ")");
        if (!touching)
            return;
        if (abs(dx) >= Math.min(width, height) * sen)
        {
            touching = false;
            var d = new Direction(sign(dx), 0);
            if (d.x == dir.x)
            {
                if (speedUp == "slide")
                {
                    v = vMax;
                    hasSlidedSpeedUp = true;
                }
            }
            if (d.x != -dir.x)
            {
                if (control == "slide")
                    dirList.add(d.x, d.y);
            }
            $("#debugDir").text("dx(" + dir.x.toString() + "," + dir.y.toString() + ")");
            return;
        }
        else if (abs(dy) > Math.min(width, height) * sen)
        {
            touching = false;
            var d = new Direction(0, sign(dy));
            if (d.y == dir.y)
            {
                if (speedUp == "slide")
                {
                    v = vMax;
                    hasSlidedSpeedUp = true;
                }
            }
            if (d.y != -dir.y)
            {
                if (control == "slide")
                    dirList.add(d.x, d.y);
            }
            $("#debugDir").text("dy(" + dir.x.toString() + "," + dir.y.toString() + ")");
            return;
        }
    }
    catch (ex) { console.warn(ex.message);}
}
canvas.onclick = function (e)
{
    if (control == "slide" || hasHeldSpeedUp || hasSlidedSpeedUp)
    {
        hasSlidedSpeedUp = false;
        hasHeldSpeedUp = false;
        return;
    }
    var cx = int($("#paint").css("margin-left").replace("px",""));
    var cy = int($("#paint").css("margin-top").replace("px", ""));
    var x = e.clientX - cx;
    var y = e.clientY - cy;
    $("#debugControlPosition").text("click");
    $("#debugControlPosition").text("(" + x.toString() + "," + y.toString() + ")");
    var hx = snake.head.x * bw + (bw / 2);
    var hy = snake.head.y * bw + (bw / 2);
    var dx = sign(x - hx);
    var dy = sign(y - hy);
    if(dir.x ==0)
        dirList.add(dx, 0);
    if (dir.y == 0)
        dirList.add(0, dy);
}
window.onscroll = function (e)
{
    return;
    var scroll = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
    if (touching&&moved)
    {

        if (scroll > 2)
            scroll = -1;
        else if (scroll < 1)
            scroll = 1;
        var d = new Direction(0, sign(scroll));
        if (d.y != -dir.y)
        {
            touching = false;
            dir = d;
            moved = false;
        }
        $("#debugDir").text("dy(" + dir.x.toString() + "," + dir.y.toString() + ")");
    }
    $("#debugControl").text("scroll");
    $("#debugControlPosition").text(scroll.toString());
}
window.onkeydown = function (e)
{
    if (keyboard == "off")
        return;
    $("#debugControl").text("keyDown");
    var code = Math.max(e.keyCode, e.which);
    if (keyhold != code)
    {
        keyhold = code;
        holdTime = new Date().getTime();
        setTimeout("controlSpeedUp(" + holdTime.toString() + ")", 200);
        var d = dir;
        if (code == 37 || code == 65)//Left
        {
            $("#debugControlPosition").text("Left");
            d = new Direction(-1, 0);
        }
        else if (code == 38 || code == 87)//Up
        {
            $("#debugControlPosition").text("UP");
            d = new Direction(0, -1);
        }
        else if (code == 39 || code == 68)//Right
        {
            $("#debugControlPosition").text("Right");
            d = new Direction(1, 0);
        }
        else if (code == 40 || code == 83)//Down
        {
            $("#debugControlPosition").text("Down");
            d = new Direction(0, 1);
        }
        else
            return;
        if (d.x == -dir.x && d.y == -dir.y)
        {
            return;
        }
        dirList.add(d.x, d.y);
    }
}
window.onkeyup = function (e)
{
    holdTime = 0;
    keyhold = 0;
    $("#debugControl").text("keyUp");
    v = v0;
}
function setButton(obj)
{
    obj.attr("onmousedown", "buttonMouseDown(this)");
    obj.attr("onmouseup", "buttonMouseUp(this)");
    obj.attr("onmouseout", "buttonMouseUp(this)");
    obj.attr("onselectstart", "return false");
}
function buttonMouseDown(obj)
{
    if (!obj)
        console.warn("!obj");
    var id = obj.id;
    if (!id)
        console.warn("!id");
    $("#" + id).css("background-color", themeColor);
    var fc = $("#" + id).css("color", themeBackgroundColor);
}
function buttonMouseUp(obj)
{
    if (!obj)
        console.warn("!obj");
    var id = obj.id;
    if (!id)
        console.warn("!id");
    $("#" + id).css("background-color", themeBackgroundColor);
    var fc = $("#" + id).css("color", themeColor);
}
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
    $("#"+to).css("opacity","0.00");
    $("#"+to).css("display","block");
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
function getRank(clear, page, count)
{
    if (!page || isNaN(page))
        page = 1;
    if (isNaN(count))
        count = 10;
    if (count < 0)
        count = 0;
    var container = $("#rankContainer");
    if (clear)
        container.html("");
    if (!SardineFish || !SardineFish.Games)
        console.warn("组件缺失.");
    SardineFish.Games.Score.GetAsync("snakeWeb", page, count, function (data)
    {
        if (!data)
            return;
        if (clear)
            container.html("");
        for (var i = 0; i < data.length ; i++)
        {
            var item = data[i];
            var rankItem = $('<div id="rankItem' + i.toString() + '" class="rankItem"></div>');
            var no = $('<p id="No' + i.toString() + '" class="No">' + (i + 1).toString() + '</p>');
            rankItem.append(no);
            var rankName = $('<p id="rankName' + i.toString() + '" class="rankName">' + item.uid + '</p>');
            rankItem.append(rankName);
            var rankScore = $('<p id="rankScore' + i.toString() + '" class="rankScore">' + item.score.toString() + '</p>');
            rankItem.append(rankScore);
            container.append(rankItem);
        }
    });
}
function postScore(name)
{
    if (!SardineFish || !SardineFish.Games)
        console.warn("组件缺失.");
    SardineFish.Games.Score.PostAsync("snakeWeb", name, snake.length, function (succeed, data)
    {
        if (!succeed)
        {
            if (data)
                console.warn(data);
            return;
        }
        $("#selfRank").text("你排在No." + data.toString());
        getRank(true, 1, 10);
        $("#scorePostArea").css("display", "none");
        goTo("overMenu", "rankArea");
    });
}
function buttonOverSettingClick(obj)
{
    showSettings();
    goTo("overMenu", "settingsMenu");
}
function buttonSartSettingClick(obj)
{
    goTo("startMenu", "settingsMenu");
    showSettings();
}
function showSettings()
{
    if (control == "slide")
    {
        $("#controlDescription").text("用手指滑动屏幕控制方向");
        $("#controlSlide").css("background-color", themeColor.toString());
        $("#controlSlide").css("color", themeBackgroundColor.toString());
    }
    else if (control == "touch")
    {
        $("#controlDescription").text("以贪吃蛇头部为中心，通过触击屏幕改变方向");
        $("#controlTouch").css("background-color", themeColor.toString());
        $("#controlTouch").css("color", themeBackgroundColor.toString());
    }
    if (keyboard == 'on')
    {
        $("#keyboardOn").css("background-color", themeColor.toString());
        $("#keyboardOn").css("color", themeBackgroundColor.toString());
    }
    else if (keyboard == "off")
    {
        $("#keyboardOff").css("background-color", themeColor.toString());
        $("#keyboardOff").css("color", themeBackgroundColor.toString());
    }
    if(speedUp=="slide")
    {
        $("#speedUpDescription").text("向同一方向滑动屏幕加速，按住即恢复");
        $("#speedUpSlide").css("background-color", themeColor.toString());
        $("#speedUpSlide").css("color", themeBackgroundColor.toString());
    }
    else if(speedUp=="hold")
    {
        $("#speedUpDescription").text("按住屏幕加速，松手即恢复");
        $("#speedUpHold").css("background-color", themeColor.toString());
        $("#speedUpHold").css("color", themeBackgroundColor.toString());
    }
try{
    var x=arcSensitivity(sen);
}catch(ex){console.warn(ex.message);}
    if(isNaN(x))
        x=1;
    if(x<0)
        x=0;
    var max = int($("#sensitivityB").width());
//console.warn(max.toString());
    $("#sensitivityBlock").css("left",(max*x).toString()+"px");
    $("#sensitivityF").css("width",(max*x).toString()+"px");
}
function controlSelect(selected)
{
    if (selected == "slide")
    {
        control = "slide";
        $("#controlDescription").text("用手指滑动屏幕控制方向");
        $("#controlSlide").css("background-color", themeColor.toString());
        $("#controlSlide").css("color", themeBackgroundColor.toString());
        $("#controlTouch").css("background-color", themeBackgroundColor.toString());
        $("#controlTouch").css("color", themeColor.toString());
    }
    else if (selected == "touch")
    {
        control = "touch";
        $("#controlDescription").text("以贪吃蛇头部为中心，戳屏幕改变方向");
        $("#controlSlide").css("background-color", themeBackgroundColor.toString());
        $("#controlSlide").css("color", themeColor.toString());
        $("#controlTouch").css("background-color", themeColor.toString());
        $("#controlTouch").css("color", themeBackgroundColor.toString());
    }
}
function keyboardSelect(selected)
{
    if (selected == "on")
    {
        keyboard = "on";
        $("#keyboardOn").css("background-color", themeColor.toString());
        $("#keyboardOn").css("color", themeBackgroundColor.toString());
        $("#keyboardOff").css("background-color", themeBackgroundColor.toString());
        $("#keyboardOff").css("color", themeColor.toString());
    }
    else if (selected == "off")
    {
        keyboard = "off";
        $("#keyboardOn").css("background-color", themeBackgroundColor.toString());
        $("#keyboardOn").css("color", themeColor.toString());
        $("#keyboardOff").css("background-color", themeColor.toString());
        $("#keyboardOff").css("color", themeBackgroundColor.toString());
    }
}
function speedUpSelect(selected)
{
    if (selected == "slide")
    {
        speedUp = "slide";
        $("#speedUpDescription").text("向同一方向滑动屏幕加速，按住即恢复");
        $("#speedUpSlide").css("background-color", themeColor.toString());
        $("#speedUpSlide").css("color", themeBackgroundColor.toString());
        $("#speedUpHold").css("background-color", themeBackgroundColor.toString());
        $("#speedUpHold").css("color", themeColor.toString());
    }
    else if (selected == "hold")
    {
        speedUp = "hold";
        $("#speedUpDescription").text("按住屏幕加速，松手即恢复");
        $("#speedUpSlide").css("background-color", themeBackgroundColor.toString());
        $("#speedUpSlide").css("color", themeColor.toString());
        $("#speedUpHold").css("background-color", themeColor.toString());
        $("#speedUpHold").css("color", themeBackgroundColor.toString());
    }
}
function buttonRankClick(sender)
{
    getRank(true, 1, 20);
    goTo("overMenu", "rankArea");
}
function moveSenBar(x)
{
    var margin=int($("#settingsMenu").css("margin-left").replace("px",""));
    var left=x-30-margin;
    var max = int($("#sensitivityB").width());
    //console.warn(max.toString());
    if(left<0)
        left=0;
    if(left>max)
        left=max;
    sen=sensitivity((left/max));
    $("#sensitivityBlock").css("left",left.toString()+"px");
    $("#sensitivityF").css("width",left.toString()+"px");
}
function sensitivityBlockMouseDown(e)
{
    sensitivityBlockHold=true;
    //console.warn("down");
    var clientX=0;
    var clientY=0;
    if (e.touches && e.touches[0])
    {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    else
    {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    moveSenBar(clientX);
}
function resize(blockSize)
{
    try
    {
        
        height = int($("#root").height());
        width = int($("#root").width());
        var centerObjs = $(".centerObj");
        for (var i = 0; i < centerObjs.length ; i++)
        {
            var id = centerObjs[i].id;
            var oh = int($("#" + id).height());
            var ow = int($("#" + id).width());
            var top = (height - oh) / 2;
            var left = (width - ow) / 2;
            $("#" + id).css("margin-top", top.toString() + "px");
            $("#" + id).css("margin-left", left.toString() + "px");
        }
        if (width < height)
        {
            var x = w;
            w = h;
            h = x;
        }
        if (blockSize) {
            bw = blockSize;
            w = parseInt(width / blockSize);
            h = parseInt(height / blockSize);
            pw = w * blockSize;
            ph = h * blockSize;
            
        }
        else
        {
            bw = Math.min(int(height / h), int(width / w));// block width
            ph = bw * h;//paintHeight
            pw = bw * w;//paintWidth
        }
        sw = int(bw * 0.8);// snake width
        sw -= ((bw - sw) % 2 == 0 ? 0 : 1);
        $("#debugScreen").text("width=" + width.toString() + " height=" + height.toString() + " pw=" + pw.toString() + " ph=" + ph.toString());
        $("#debugDrawing").text("w=" + w.toString() + " h=" + h.toString() + " bw=" + bw.toString() + " sw=" + sw.toString());
        $("#paint").css("height", ph.toString() + "px");
        $("#paint").css("width", pw.toString() + "px");
        if (ph < height)
        {
            var top = (height - ph) / 2;
            $("#paint").css("margin-top", top.toString() + "px");
        }
        if (pw < width)
        {
            var left = (width - pw) / 2;
            $("#paint").css("margin-left", left.toString() + "px");
        }
        var innerHeight = window.innerHeight;
        var innerWidth = window.innerWidth;
        //console.warn(innerHeight.toString()+","+innerWidth.toString());
        $("body").css("height", (innerHeight).toString() + "px");
        //$("body").css("width",(width*10).toString()+"px");
        /*function noScroll()
        {
            document.body.scrollTop = document.documentElement.scrollTop = 1;
            //document.body.scrollLeft=document.documentElement.scrollLeft=1;
            setTimeout(noScroll, 30);
        }
        noScroll();*/
        //document.body.scrollTop=document.documentElement.scrollTop=height;
        //setTimeout(function(){document.body.scrollTop=document.documentElement.scrollTop=height},1000);
    } catch (ex) { console.warn(ex.message); }
}
resize();
window.onmousedown = mouseDown;
window.addEventListener("touchstart", mouseDown);
//window.addEventListener("pointerover", mouseDown);
window.addEventListener("MSPointerOver", mouseDown);
window.onmousemove = mouseMove;
window.addEventListener("touchmove", mouseMove);
//window.addEventListener("pointermove", mouseMove);
window.addEventListener("MSPointerMove", mouseMove);
window.onmouseup = mouseUp;
window.addEventListener("touchend", mouseUp);
//window.addEventListener("pointerout", mouseUp);
window.addEventListener("MSPointerOut", mouseUp);
window.onload = function ()
{
    //getRank(true, 1, 20);
    $(".selectItem").attr("onselectstart", "return false");
    setButton($(".button"));
    showFps();
}









