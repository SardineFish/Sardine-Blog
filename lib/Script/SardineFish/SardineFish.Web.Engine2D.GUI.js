window.SardineFish=(function(sar){try{    if(!sar)        sar={};    sar.Web=(function(web)    {        if(!web)            web={};        return web;    })(sar.Web);    sar.Web.Engine2D=(function(engine)    {        if(!engine)            engine={};        return engine;    })(sar.Web.Engine2D);    engine = sar.Web.Engine2D;    //-------LinkList    function LinkList()
    {
        this.head = null;        this.tail = null;        this.count = 0;
    }    LinkList.Node = function (obj, last, next)
    {
        this.object = obj;        if (last)            this.last = last;        else            this.last = null;        if (next)            this.next = next;        else            this.next = null;
    }    LinkList.prototype.add = function (obj)
    {
        if (this.count <= 0)
        {
            this.head = new LinkList.Node(obj, null, null);            this.head.parent = this;            this.tail = this.head;            this.count = 1;            return this.head;
        }        var node = new LinkList.Node(obj, this.tail, null);        node.parent = this;        this.tail.next = node        this.tail = node;        this.count++;        return node;
    }    LinkList.prototype.remove = function (node)
    {
        if (node.parent != this)
        {
            throw new Error("The node doesn't belong to this link list");
        }        if (node.last == null)
        {
            this.head = node.next;
        }        else            node.last.next = node.next;        if (node.next == null)
        {
            this.tail = node.last;
        }        else            node.next.last = node.last;        this.count--;
    }    LinkList.prototype.foreach = function (callback)
    {
        if (!callback)            throw new Error("A callback function is require.");        var p = this.head;        for (var p = this.head; p; p = p.next)
        {
            var br = callback(p.object, p);
            if (br)
                return;
        }
    }    int = parseInt;    //-------Color    sar.Color = (function (color)
    {
        if (color && color.version && color.version > 1.0)            return;        //-------Color        function Color(r, g, b, a)
        {
            r = int(r);            g = int(g);            b = int(b);            if (isNaN(r) || r >= 256)                r = 255;            else if (r < 0)                r = 0;            if (isNaN(g) || g >= 256)                g = 255;            else if (g < 0)                g = 0;            if (isNaN(b) || b >= 256)                b = 255;            else if (b < 0)                b = 0;            if (isNaN(a) || a > 1.0)                a = 1.0;            else if (a < 0)                a = 0;            this.red = r;            this.green = g;            this.blue = b;            this.alpha = a;
        }        Color.version = 1.0;        Color.random = function ()
        {
            return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1.0);
        }        Color.prototype.copy = function ()
        {
            return new Color(this.red, this.green, this.blue, this.alpha);
        }        Color.prototype.toString = function ()
        {
            return "rgba(" + this.red.toString() + "," + this.green.toString() + "," + this.blue.toString() + "," + this.alpha.toString() + ")";
        }
        window.Color = Color;
        return Color;
    })(sar.Color);    function Thickness(top,bottom,left,right)    {        if(isNaN(top))        {            top=bottom=left=right=0;        }        else if(isNaN(bottom))        {            bottom=left=right=top;        }        this.top=top;        this.bottom=bottom;        this.left=left;        this.right=right;    }    Thickness.prototype.copy = function ()
    {
        return new Thickness(this.top, this.bom, this.left, this.right);
    }    window.Thickness = Thickness;    var VerAlign={};    VerAlign.Top=1;    VerAlign.Bottom=2;    VerAlign.Center=0;    VerAlign.Stretch = 3;    window.VerAlign = VerAlign;        var HorAlign={};    HorAlign.Left=1;    HorAlign.Right=2;    HorAlign.Center=0;    HorAlign.Stretch = 3;    window.HorAlign = HorAlign;    function GUI()    {        this.scene = null;        this.children=new LinkList();        this.width = 0;        this.height = 0;        this.x = 0;        this.y = 0;        this.color = new Color(0, 0, 0, 1.00);        this.bgColor = new Color(0, 0, 0, 0);                this.onRender = null;        this.onMouseDown = null;        this.onMouseUp = null;        this.onMouseMove = null;        this.onClick = null;        this.onDoubleClick = null;        this.onTouchStart = null;        this.onTouchEnd = null;        this.onTouchMove = null;    }    GUI.prototype.copy=function()    {        var gui = new GUI;        gui.controls = this.controls;        gui.ctrlList = this.ctrlList;        gui.width = this.width;        gui.height = this.height;        gui.textCalcu = this.textCalcu;        this.onRender = this.onRender;        this.onMouseDown = this.onMouseDown;        this.onMouseUp = this.onMouseUp;        this.onMouseMove = this.onMouseMove;        this.onClick = this.onClick;        this.onDoubleClick = this.onDoubleClick;        this.onTouchStart = this.onTouchStart;        this.onTouchEnd = this.onTouchEnd;        this.onTouchMove = this.onTouchMove;    }    GUI.prototype.addControl=function(obj)    {        this.children.add(obj);        obj.parent = this;    }    GUI.prototype.render=function(graphics)    {        this.width = graphics.canvas.width;        this.height = graphics.canvas.height;        var gui = this;        if (this.onRender)
        {
            this.onRender();
        }        this.children.foreach(function(obj,node)        {            if(obj.render)                obj.render(graphics);        });    }    GUI.prototype.mouseMoveCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.mouseMoveCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.mouseMoveCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onMouseMove)
            this.onMouseMove(e);
    }    GUI.prototype.mouseDownCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.mouseDownCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.mouseDownCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onMouseDown)
            this.onMouseDown(e);
    }    GUI.prototype.mouseUpCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.mouseUpCallback)
            {
                child.mouseUpCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onMouseUp)
            this.onMouseUp(e);
    }    GUI.prototype.clickCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.clickCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.clickCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onClick)
            this.onClick(e);
    }    GUI.prototype.doubleClickCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.doubleClickCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.doubleClickCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onDoubleClick)
            this.onDoubleClick(e);
    }    GUI.prototype.touchStartCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.touchStartCallback)
            {
                child.touchStartCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onTouchStart)
            this.onTouchStart(e);
    }    GUI.prototype.touchEndCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.touchEndCallback)
            {
                child.touchEndCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onTouchEnd)
            this.onTouchEnd(e);
    }    GUI.prototype.touchMoveCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.touchMoveCallback)
            {
                child.touchMoveCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onTouchMove)
            this.onTouchMove(e);
    }    engine.GUI=GUI;    window.GUI = GUI;    function Block(width, height)
    {
        this.children = new LinkList();
        this.parent = null;
        

        this.widthAuto = false;
        this.heightAuto = true;
        if (isNaN(width))
        {
            width = 0;
            this.widthAuto = true;
        }
        if (isNaN(height))
        {
            height = 0;
            this.heightAuto = true;
        }
        this.width = width;
        this.height = height;        this.x = 0;        this.y = 0;        this.margin = new Thickness(0);        this.padding = new Thickness(0);        this.horAlign = HorAlign.Left;        this.verAlign = VerAlign.Top;

        this.color = null;        this.bgColor = null;        this.border = 1;        this.font = new Font();        this.collider = null;        this.onClick = null;        this.onMouseDown = null;        this.onMouseUp = null;        this.onMouseMove = null;        this.onTouchStart = null;        this.onTouchEnd = null;        this.onTouchMove = null;
    }    Block.prototype.render = function (graphics)
    {
        if ((this.bgColor && this.bgColor.alpha > 0) || (this.color && this.color.alpha > 0 && this.border > 0))
        {

        }
        this.children.foreach(function (child, node)
        {
            if (child.render)
                child.render(graphics);
        });
    }    function Button(content)    {        if (!content)            content = "button";        this.parent = null;        this.content = content;        this.width = 0;        this.widthAuto = true;        this.height = 0;        this.heightAuto = true;        this.x = 0;        this.y = 0;        this.margin=new Thickness(0);        this.padding=new Thickness(0);        this.horAlign=HorAlign.Left;        this.verAlign = VerAlign.Top;        this.color = new Color(0,0,0,1.00);        this.bgColor = new Color(0, 0, 0, 0);        this.border = 1;        this.radius = 5;        this.font=new Font();                this.collider = null;        this.onRender = null;        this.onClick = null;        this.onDoubleClick = null;        this.onMouseMove = null;        this.onMouseDown=null;        this.onMouseUp=null;        this.onMouseMove=null;        this.onTouchStart=null;        this.onTouchEnd=null;        this.onTouchMove = null;        this.isPressed = false;    }    Button.prototype.copy=function()    {        var button = new Button(this.content);        button.parent = this.parent;        button.width = this.width;        button.width = this.width;        button.widthAuto = this.widthAuto;        button.height = this.height;        button.heightAuto = this.heightAuto;        button.x = this.x;        button.y = this.y;                button.margin = this.margin.copy();        button.padding = this.padding.copy();        button.horAlign = this.horAlign;        button.verAlign = this.verAlign;        button.color = this.color.copy();        button.bgColor = this.bgColor.copy();        if (this.border instanceof Thickness)            button.border = this.border.copy();        else            button.border = this.border;        button.radius = this.radius;        button.font = this.font;        if (this.collider && this.collider.copy)            button.collider = this.collider.copy();        else            button.collider = this.collider;        button.onClick = this.onClick;        button.onMouseDown = this.onMouseDown;        button.onMouseUp = this.onMouseUp;        button.onMouseMove = this.onMouseMove;        button.onTouchStartthis.onTouchStart;        button.onTouchEnd = this.onTouchEnd;        button.onTouchMove = this.onTouchMove;        return button;    }    Button.prototype.render=function(graphics)    {
        if (this.onRender)
        {
            this.onRender();
        }
        graphics.font = this.font;        var h = parseInt(this.font.fontSize) * 1.15;//textHeight        var w = graphics.measureText(this.content).width;//textWidth        var x = 0, y = 0;//buttonX,buttonY        var wx = 0, wy = 0;//textX,textY        var mW = this.parent.width;//maxWidth        var mH = this.parent.height;//MaxHeight                if (this.widthAuto)        {            if (this.horAlign == HorAlign.Stretch)
            {
                this.width = mW - this.margin.left - this.margin.right;
                this.width = this.width < 0 ? 0 : this.width;
            }
            else
            {
                this.width = this.padding.left + w + this.padding.right;
                if (this.margin.left + this.width + this.margin.right > mW)
                {
                    this.width = mW - this.margin.left - this.margin.right;
                }
                this.width = this.width < 0 ? 0 : this.width;
            }
        }
        w = this.width - this.padding.left - this.padding.right;
        w = w < 0 ? 0 : w;        switch (this.horAlign)
        {
            case HorAlign.Left:                x = this.margin.left;                break;            case HorAlign.Right:                x = mW - this.margin.right - this.width;                break;            case HorAlign.Stretch:                x = (mW - this.margin.left - this.margin.right) / 2 - this.width / 2 + this.margin.left;                break;            case HorAlign.Center:                x = (mW - this.width) / 2 + this.margin.left - this.margin.right;                break;
        }        if (this.heightAuto)
        {
            if (this.verAlign == VerAlign.Stretch)
            {
                this.height = mH - this.margin.top - this.margin.bottom;
                this.height = this.height < 0 ? 0 : this.height;
            }
            else
            {
                this.height = this.padding.top + h + this.padding.bottom;
                if (this.margin.top + this.height + this.margin.bottom > mH)
                {
                    this.height = mH - this.margin.top - this.margin.bottom;
                }
                this.height = this.height < 0 ? 0 : this.height;
            }
        }        h = this.height - this.padding.top - this.padding.bottom;        h = h < 0 ? 0 : h;        switch(this.verAlign)        {            case VerAlign.Top:                y=this.margin.top;                break;            case VerAlign.Bottom:                y=mH-this.margin.bottom-this.height;                break;            case VerAlign.Stretch:                y=this.margin.top;                break;            case VerAlign.Center:                y = (mH - this.height) / 2 + this.margin.top + this.margin.bottom;                break;        }        x += this.parent.x;        y += this.parent.y;        this.x = x;        this.y = y;        wx = x + w / 2 + this.padding.left;        wy = y + h / 2 + this.padding.right;        graphics.textAlign = TextAlign.Center;        graphics.textAlign = "center";        graphics.textBaseline = "middle";        if (this.isPressed)
        {
            graphics.fillStyle = this.color.toString();            graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);            graphics.strokeStyle = this.color.toString();            graphics.strokeRoundRect(x, -y, this.width, this.height, this.radius);            graphics.globalCompositeOperation = Graphics.CompositeOperation.Xor;            graphics.fillStyle = this.color.toString();            graphics.fillText(this.content, wx, -wy);            graphics.globalCompositeOperation = Graphics.CompositeOperation.SourceOver;            graphics.fillStyle = this.bgColor.toString();            graphics.fillText(this.content, wx, -wy);
        }        else
        {            graphics.fillStyle = this.bgColor.toString();            graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);            graphics.strokeStyle = this.color.toString();            graphics.strokeRoundRect(x, -y, this.width, this.height, this.radius);            graphics.fillStyle = this.color.toString();            graphics.fillText(this.content, wx, -wy);
        }    }    Button.prototype.isPointIn = function (x, y)
    {
        if (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height)
        {
            return true;
        }
        return false;
    }    Button.prototype.mouseMoveCallback = function (e)
    {
        if (this.onMouseMove)
            this.onMouseMove(e);
    }    Button.prototype.mouseDownCallback = function (e)
    {
        this.isPressed = true;
        if (this.onMouseDown)
            this.onMouseDown(e);
    }    Button.prototype.mouseUpCallback = function (e)
    {
        this.isPressed = false;
        if (this.onMouseUp)
        {
            this.onMouseUp(e);
        }
    }    Button.prototype.clickCallback = function (e)
    {
        if (this.onClick)
            this.onClick(e);
    }    Button.prototype.doubleClickCallback = function (e)
    {
        if (this.onClick)
            this.onClick(e);
    }    Button.prototype.touchStartCallback = function (e)
    {
        //this.isPressed = true;
        if (this.onTouchStart)
            this.onTouchStart(e);
    }    Button.prototype.touchEndCallback = function (e)
    {
        //this.isPressed = false;
        if (this.onTouchEnd)
            this.onTouchEnd(e);
    }    Button.prototype.touchMoveCallback = function (e)
    {
        if (this.onTouchMove)
            this.onTouchMove();
    }    GUI.Button=Button;    function TextBlock(text)    {        if (!text)            text = "textBlock";        this.parent = null;        this.text = text;        this.width = 0;        this.widthAuto = true;        this.height = 0;        this.heightAuto = true;        this.x = 0;        this.y = 0;        this.margin = new Thickness(0);        this.padding = new Thickness(0);        this.horAlign = HorAlign.Left;        this.verAlign = VerAlign.Top;        this.color = new Color(0, 0, 0, 1.00);        this.borderColor = new Color(0, 0, 0, 1.00);        this.bgColor = new Color(0, 0, 0, 0);        this.border = new Thickness(0, 0, 0, 0);        this.font = new Font();        this.collider = null;        this.onRender = null;        this.onClick = null;        this.onMouseDown = null;        this.onMouseUp = null;        this.onMouseMove = null;        this.onTouchStart = null;        this.onTouchEnd = null;        this.onTouchMove = null;    }    TextBlock.prototype.copy = function ()
    {

        var textBlock = new Button(this.text);        textBlock.parent = this.parent;        textBlock.width = this.width;        textBlock.width = this.width;        textBlock.widthAuto = this.widthAuto;        textBlock.height = this.height;        textBlock.heightAuto = this.heightAuto;        textBlock.x = this.x;        textBlock.y = this.y;        textBlock.margin = this.margin.copy();        textBlock.padding = this.padding.copy();        textBlock.horAlign = this.horAlign;        textBlock.verAlign = this.verAlign;        textBlock.color = this.color.copy();        textBlock.borderColor = this.borderColor.copy();        textBlock.bgColor = this.bgColor.copy();        textBlock.font = this.font;        if (this.border instanceof Thickness)            textBlock.border = this.border.copy();        else            textBlock.border = this.border;        if (this.collider && this.collider.copy)            textBlock.collider = this.collider.copy();        else            textBlock.collider = this.collider;        textBlock.onClick = this.onClick;        textBlock.onMouseDown = this.onMouseDown;        textBlock.onMouseUp = this.onMouseUp;        textBlock.onMouseMove = this.onMouseMove;        textBlock.onTouchStartthis.onTouchStart;        textBlock.onTouchEnd = this.onTouchEnd;        textBlock.onTouchMove = this.onTouchMove;        return textBlock;
    }    TextBlock.prototype.render = function (graphics)
    {
        if (this.onRender)
        {
            this.onRender();
        }
        graphics.font = this.font;
        var h = parseInt(this.font.fontSize) * 1.15;        var w = graphics.measureText(this.text).width;        var x = 0, y = 0;        var wx = 0, wy = 0;        var mW = this.parent.width;        var mH = this.parent.height;        if (this.widthAuto)
        {
            if (this.horAlign == HorAlign.Stretch)
            {
                this.width = mW - this.margin.left - this.margin.right;
                this.width = this.width < 0 ? 0 : this.width;
            }
            else
            {
                this.width = this.padding.left + w + this.padding.right;
                if (this.margin.left + this.width + this.margin.right > mW)
                {
                    this.width = mW - this.margin.left - this.margin.right;
                }
                this.width = this.width < 0 ? 0 : this.width;
            }
        }
        w = this.width - this.padding.left - this.padding.right;
        w = w < 0 ? 0 : w;        switch (this.horAlign)
        {
            case HorAlign.Left:                x = this.margin.left;                break;            case HorAlign.Right:                x = mW - this.margin.right - this.width;                break;            case HorAlign.Stretch:                x = (mW - this.margin.left - this.margin.right) / 2 - this.width / 2 + this.margin.left;                break;            case HorAlign.Center:                x = (mW - this.width) / 2 + this.margin.left - this.margin.right;                break;
        }        if (this.heightAuto)
        {
            if (this.verAlign == VerAlign.Stretch)
            {
                this.height = mH - this.margin.top - this.margin.bottom;
                this.height = this.height < 0 ? 0 : this.height;
            }
            else
            {
                this.height = this.padding.top + h + this.padding.bottom;
                if (this.margin.top + this.height + this.margin.bottom > mH)
                {
                    this.height = mH - this.margin.top - this.margin.bottom;
                }
                this.height = this.height < 0 ? 0 : this.height;
            }
        }        h = this.height - this.padding.top - this.padding.bottom;        h = h < 0 ? 0 : h;        switch (this.verAlign)
        {
            case VerAlign.Top:                y = this.margin.top;                break;            case VerAlign.Bottom:                y = mH - this.margin.bottom - this.height;                break;            case VerAlign.Stretch:                y = this.margin.top;                break;            case VerAlign.Center:                y = (mH - this.height) / 2 + this.margin.top + this.margin.bottom;                break;
        }        x += this.parent.x;        y += this.parent.y;        this.x = x;        this.y = y;        wx = x + w / 2 + this.padding.left;        wy = y + h / 2 + this.padding.right;        graphics.textAlign = TextAlign.Center;        graphics.font = this.font;        graphics.fillStyle = this.bgColor.toString();        //graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);        graphics.strokeStyle = this.borderColor.toString();        graphics.lineCap = Graphics.LineCap.Butt;        //top        if (this.border.top > 0)        {
            graphics.lineWidth = this.border.top;            graphics.drawLine(x, -y, x + this.width, -y);
        }        //right        if (this.border.right > 0)
        {
            graphics.lineWidth = this.border.right;            graphics.drawLine(x + this.width, -y, x + this.width, -(y + this.height));
        }        //bottom        if (this.border.bottom > 0)
        {
            graphics.lineWidth = this.border.bottom;            graphics.drawLine(x + this.width, -(y + this.height), x, -(y + this.height));
        }        //left        if (this.border.left > 0)
        {
            graphics.lineWidth = this.border.left;            graphics.drawLine(x, -(y + this.height), x, -y);
        }        graphics.fillStyle = this.color.toString();        graphics.textAlign = "center";        graphics.textBaseline = "middle";        graphics.fillText(this.text, wx, -wy);
    }    TextBlock.prototype.isPointIn = function (x, y)
    {
        if (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height)
        {
            return true;
        }
        return false;
    }    TextBlock.prototype.mouseDownCallback = function (e)
    {

    }    TextBlock.prototype.mouseUpCallback = function (e)
    {

    }    TextBlock.prototype.clickCallback = function (e)
    {

    }    TextBlock.prototype.touchStartCallback = function (e)
    {

    }    TextBlock.prototype.touchEndCallback = function (e)
    {

    }    TextBlock.prototype.touchMoveCallback = function (e)
    {

    }    GUI.TextBlock=TextBlock;    function Joystick()    {        this.margin=new Thickness(0);        this.padding=new Thickness(0);        this.horAlign=HorAlign.Left;        this.verAlign=VerAlign.Top;        this.width=0;        this.height=0;        this.content="";        this.color=new Color(0,0,0,1.00);        this.bgColor=new Color(0,0,0,0);        this.border=1;        this.font=new Font();        this.onClick=null;    }    GUI.Joystick=Joystick;    return sar;}catch(ex){alert("GUI:"+ex.message);}})(window.SardineFish);