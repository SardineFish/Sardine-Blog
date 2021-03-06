
window.SardineFish=(function(sar){
try{
    if(!sar)
        sar=function(){};
    sar.Web=(function(web)
    {
        if(!web)
            web=function(){};
        return web;
    })(sar.Web);
    window.requestAnimationFrame = 
        window.requestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;
    sar.Web.Engine2D=(function(engine)
    {
        if(!engine)
            engine={};
        return engine;
    })(sar.Web.Engine2D);
    engine=sar.Web.Engine2D;
    engine.debug=function(){}
    engine.onError=null;
    engine.debug.write=null;
    engine.debug.writeLine=function(text,canvas)
    {
        if(!engine.debug.write)
            return;
        engine.debug.write(text+"\r\n");
        
    }
    engine.debug.clear=null;
    
    //-------LinkList
    function LinkList()
    {
        this.head=null;
        this.tail=null;
        this.count=0;
    }
    LinkList.Node=function(obj, last, next)
    {
        this.object=obj;
        if(last)
            this.last=last;
        else
            this.last=null;
        if(next)
            this.next=next;
        else
            this.next=null;
    }
    LinkList.prototype.add=function(obj)
    {
        if(this.count<=0)
        {
            this.head=new LinkList.Node(obj,null,null);
            this.head.parent=this;
            this.tail=this.head;
            this.count=1;
            return this.head;
        }
        var node=new LinkList.Node(obj,this.tail,null);
        node.parent=this;
        this.tail.next=node
        this.tail=node;
        this.count++;
        return node;
    }
    LinkList.prototype.remove=function(node)
    {
        if(node.parent!=this)
        {
            throw new Error("The node doesn't belong to this link list");
        }
        if(node.last==null)
        {
            this.head=node.next;
        }
        else
            node.last.next=node.next;
        if(node.next==null)
        {
            this.tail=node.last;
        }
        else
            node.next.last = node.last;
        this.count--;
    }
    LinkList.prototype.foreach=function(callback)
    {
        if(!callback)
            throw new Error("A callback function is require.");
        var p=this.head;
        for(var p=this.head;p;p=p.next)
        {
            var br = callback(p.object, p);
            if (br)
                return;
        }
    }

    

    //-------Align
    function Align(){}
    Align.topLeft=function (w,h)
    {
        return new Point(0,0);
    }
    Align.topCenter=function (w,h)
    {
        return new Point(w / 2, 0);
    }
    Align.topRight = function (w, h)
    {
        return new Point(w, 0);
    }
    Align.middleLeft = function (w, h)
    {
        return new Point(0, h / 2);
    }
    Align.center = function (w, h)
    {
        return new Point(w / 2, h / 2);
    }
    Align.middleRight = function (w, h)
    {
        return new Point(w, h / 2);
    }
    Align.bottomLeft = function (w, h)
    {
        return new Point(0, h);
    }
    Align.bottomCenter = function (w, h)
    {
        return new Point(w/2, h);
    }
    Align.bottomRight = function (w, h)
    {
        return new Point(w, h);
    }
    window.Align = Align;

    //-------Force
    function Force(x,y,f)
    {
        this.x=0;
        this.y=0;
        if(x==undefined)
            return;
        if(x instanceof Vector2)
        {
            this.x=x.x;
            this.y=x.y;
        }
        else if(f)
        {
            var l=Math.sqrt(x*x+y*y);
            this.x=x*f/l;
            this.y=y*f/l;
        }
        else
        {
            this.x=x;
            this.y=y;
        }
    }
    Force.prototype.copy=function()
    {
        return new Force(this.x,this.y,this.f);
    }
    Force.prototype.toString=function()
    {
        return "("+this.x+","+this.y+")";
    }
    Force.prototype.getValue=function()
    {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    Force.prototype.toAcceleration=function(m)
    {
        return new Vector(this.x/m,this.y/m);
    }
    engine.Force=Force;
    window.Force = Force;

    //-------Mouse
    function Mouse() { }
    Mouse.Buttons = {};
    Mouse.Buttons.Left = 0;
    Mouse.Buttons.Middle = 1;
    Mouse.Buttons.Right = 2;
    Mouse.ButtonState = {};
    Mouse.ButtonState.None = 0;
    Mouse.ButtonState.Pressed = 1;
    Mouse.ButtonState.Released = 2;
    Mouse.ButtonState.Click = 3;
    Mouse.ButtonState.DoubleClick = 4;
    function MouseEventArgs()
    {
        this.x = 0;
        this.y = 0;
        this.button = null;
        this.buttonState = Mouse.ButtonState.None;
        this.handled = false;
    }
    Mouse.MouseEventArgs = MouseEventArgs;
    window.Mouse = Mouse;

    //-------Keyboard
    function Keyboard() { }
    Keyboard.Keys = (function (keys)
    {
        keys = {};
        keys.BackSpace = 8;
        keys.Tab = 9;
        keys.Clear = 12;
        keys.Enter = 13;
        keys.Shift = 16;
        keys.Control = 17;
        keys.Alt = 18;
        keys.Pause = 19;
        keys.CapsLock = 20;
        keys.Escape = 27;
        keys.Space = 32;
        keys.Prior = 33;
        keys.Next = 34;
        keys.End = 35;
        keys.Home = 36;
        keys.Left = 37;
        keys.Up = 38;
        keys.Right = 39;
        keys.Down = 40;
        keys.Select = 41;
        keys.Print = 42;
        keys.Execute = 43;
        keys.Insert = 45;
        keys.Delete = 46;
        keys.Help = 47;
        keys.Num0 = 48;
        keys.Num1 = 49;
        keys.Num2 = 50;
        keys.Num3 = 51;
        keys.Num4 = 52;
        keys.Num5 = 53;
        keys.Num6 = 54;
        keys.Num7 = 55;
        keys.Num8 = 56;
        keys.Num9 = 57;
        keys.A = 65;
        keys.B = 66;
        keys.C = 67;
        keys.D = 68;
        keys.E = 69;
        keys.F = 70;
        keys.G = 71;
        keys.H = 72;
        keys.I = 73;
        keys.J = 74;
        keys.K = 75;
        keys.L = 76;
        keys.M = 77;
        keys.N = 78;
        keys.O = 79;
        keys.P = 80;
        keys.Q = 81;
        keys.R = 82;
        keys.S = 83;
        keys.T = 84;
        keys.U = 85;
        keys.V = 86;
        keys.W = 87;
        keys.X = 88;
        keys.Y = 89;
        keys.Z = 90;
        keys.KP0 = 96;
        keys.KP1 = 97;
        keys.KP2 = 98;
        keys.KP3 = 99;
        keys.KP4 = 100;
        keys.KP5 = 101;
        keys.KP6 = 102;
        keys.KP7 = 103;
        keys.KP8 = 104;
        keys.KP9 = 105;
        keys.KPMultiply = 106;
        keys.KPAdd = 107;
        keys.KPSeparator = 108;
        keys.KPSubtract = 109;
        keys.KPDecimal = 110;
        keys.KPDivide = 111;
        keys.F1 = 112;
        keys.F2 = 113;
        keys.F3 = 114;
        keys.F4 = 115;
        keys.F5 = 116;
        keys.F6 = 117;
        keys.F7 = 118;
        keys.F8 = 119;
        keys.F9 = 120;
        keys.F10 = 121;
        keys.F11 = 122;
        keys.F12 = 123;
        keys.F13 = 124;
        keys.F14 = 125;
        keys.F15 = 126;
        keys.F16 = 127;
        keys.F17 = 128;
        keys.F18 = 129;
        keys.F19 = 130;
        keys.F20 = 131;
        keys.F21 = 132;
        keys.F22 = 133;
        keys.F23 = 134;
        keys.F24 = 135;
        keys.NumLock = 136;
        keys.ScrollLock = 137;
        keys.toString = function (keyCode)
        {
            switch (keyCode)
            {
                case 8: return "BackSpace";
                case 9: return "Tab";
                case 12: return "Clear";
                case 13: return "Enter";
                case 16: return "Shift";
                case 17: return "Control";
                case 18: return "Alt";
                case 19: return "Pause";
                case 20: return "CapsLock";
                case 27: return "Escape";
                case 32: return "Space";
                case 33: return "Prior";
                case 34: return "Next";
                case 35: return "End";
                case 36: return "Home";
                case 37: return "Left";
                case 38: return "Up";
                case 39: return "Right";
                case 40: return "Down";
                case 41: return "Select";
                case 42: return "Print";
                case 43: return "Execute";
                case 45: return "Insert";
                case 46: return "Delete";
                case 47: return "Help";
                case 48: return "0";
                case 49: return "1";
                case 50: return "2";
                case 51: return "3";
                case 52: return "4";
                case 53: return "5";
                case 54: return "6";
                case 55: return "7";
                case 56: return "8";
                case 57: return "9";
                case 65: return "A";
                case 66: return "B";
                case 67: return "C";
                case 68: return "D";
                case 69: return "E";
                case 70: return "F";
                case 71: return "G";
                case 72: return "H";
                case 73: return "I";
                case 74: return "J";
                case 75: return "K";
                case 76: return "L";
                case 77: return "M";
                case 78: return "N";
                case 79: return "O";
                case 80: return "P";
                case 81: return "Q";
                case 82: return "R";
                case 83: return "S";
                case 84: return "T";
                case 85: return "U";
                case 86: return "V";
                case 87: return "W";
                case 88: return "X";
                case 89: return "Y";
                case 90: return "Z";
                case 96: return "KP0";
                case 97: return "KP1";
                case 98: return "KP2";
                case 99: return "KP3";
                case 100: return "KP4";
                case 101: return "KP5";
                case 102: return "KP6";
                case 103: return "KP7";
                case 104: return "KP8";
                case 105: return "KP9";
                case 106: return "KPMultiply";
                case 107: return "KPAdd";
                case 108: return "KPSeparator";
                case 109: return "KPSubtract";
                case 110: return "KPDecimal";
                case 111: return "KPDivide";
                case 112: return "F1";
                case 113: return "F2";
                case 114: return "F3";
                case 115: return "F4";
                case 116: return "F5";
                case 117: return "F6";
                case 118: return "F7";
                case 119: return "F8";
                case 120: return "F9";
                case 121: return "F10";
                case 122: return "F11";
                case 123: return "F12";
                case 124: return "F13";
                case 125: return "F14";
                case 126: return "F15";
                case 127: return "F16";
                case 128: return "F17";
                case 129: return "F18";
                case 130: return "F19";
                case 131: return "F20";
                case 132: return "F21";
                case 133: return "F22";
                case 134: return "F23";
                case 135: return "F24";
                case 136: return "NumLock";
                case 137: return "ScrollLock";
                default: return "Unknown";
            }
        }
        return keys;
    })(Keyboard.Keys);
    Keyboard.KeyState = {};
    Keyboard.KeyState.None = 0;
    Keyboard.KeyState.Down = 1;
    Keyboard.KeyState.Up = 2;
    Keyboard.KeyState.Pressed = 3;
    function KeyEventArgs()
    {
        this.key = 0;
        this.keyName = "Unknown";
        this.keyState = Keyboard.KeyState.None;
        this.ctrl = false;
        this.alt = false;
        this.shift = false;
        this.handled = false;
    }
    Keyboard.KeyEventArgs = KeyEventArgs;
    window.Keyboard = Keyboard;
    
    function int(x)
    {
        return parseInt(x);
    }

    function keyCodeToKey(keyCode)
    {
        
    }

    //-------Game
    function Game()
    {
        this.fps=0;
        this.scene=null;
        this.animationFrameId=null;
        this.started=false;
        this.onStart=null;
        this.onUpdate=null;
        this.onPause=null;
        this.onResume=null;
        this.onEnd=null;
        this.graphics = null;
        this.eventSource = null;
    }
    Game.createByCanvas=function(canvas)
    {
        var game=new Game();
        game.graphics = new Graphics(canvas);
        game.eventSource = canvas;
        return game;
    }
    Game.prototype.setScene=function(scene)
    {
        this.scene = scene;
        this.scene.eventSource = this.eventSource;
        scene.initEvents();
        scene.game=this;
    }
    Game.prototype.start=function()
    {
        var game=this;
        var lastDelay=0;
        var firstFrame=true;
        function animationFrame(delay)
        {
            try{
            if(!game.started)
            {
                if(game.onEnd)
                    game.onEnd();
                return;
            }
            var x=delay;
            delay=delay-lastDelay;
            lastDelay=x;
            if(firstFrame)
            {
                firstFrame=false;
                game.animationFrameId=requestAnimationFrame(animationFrame);
                return;
            }
            if(engine.debug.clear)
                engine.debug.clear();
            game.fps = int(1000 / delay);
         engine.debug.writeLine("fps="+game.fps);
            if(game.onUpdate)
                game.onUpdate(delay,this);
            game.scene.updateFrame(delay);
            game.animationFrameId=requestAnimationFrame(animationFrame);
            }
            catch(ex)
            {
console.warn(ex.message);
                if(engine.onError)
                    engine.onError(ex.message);
            }
        }
        if(!this.scene)
            return false;
        this.animationFrameId=requestAnimationFrame(animationFrame);
        this.started=true;
    }
    Game.prototype.end=function()
    {
        this.started=false;
    }
    engine.Game=Game;
    window.Game = Game;

    //-------Scene
    function Scene()
    {
        this.game = null;
        this.objectList = new LinkList();
        this._objList = new Array();
        this._objList.n = 0;
        this.physics = new Scene.Physics();
        this.camera = null;
        this.GUI=null;
        this.doubleClickDelay=200;
        this.eventSource = null;
        this.onMouseMove = null;
        this.onMouseOver = null;
        this.onMouseOut = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onClick = null;
        this.onDoubleClick=null;
        this.onKeyDown = null;
        this.onKeyUp = null;
        this.onKeyPress = null;
        this.onTouchStart = null;
        this.onTouchMove = null;
        this.onTouchEnd = null;

        this._frameComplete = null;

        this._objList.add = function (node)
        {
            this[this.n] = node;
            return this.n++;
        }
    }
    Scene.Physics=function()
    {
        this.g=new Vector2(0,0);
        this.f=0;
    }
    Scene.Physics.prototype.copy=function()
    {
        var phy=new Scene.Physics();
        phy.g=this.g.copy();
        phy.f=this.f;
        return phy;
    }
    Scene.Physics.prototype.reset=function()
    {
        return;
    }
    Scene.prototype.reset=function()
    {
        this.camera=null;
        this.objectList = new LinkList();
        this._objList = new Array();
        this._objList.n = 0;
        if(this.physics)
            this.physics.reset();
        this._objList.add = function (node)
        {
            this[this.n] = node;
            return this.n++;
        }
    }
    Scene.prototype.physicalSimulate=function(dt)
    {
        var scene=this;
        this.objectList.foreach(function(obj,node)
        {
            
            obj.a.x=(obj.F.x+obj.constantForce.x)/obj.mass;
            obj.a.y=(obj.F.y+obj.constantForce.y)/obj.mass;
            if(obj.gravity&&(!obj.collider||!obj.collider.landed))
            {
                obj.a.x+=scene.physics.g.x;
                obj.a.y+=scene.physics.g.y;
            }
            obj.moveTo(obj.position.x+obj.v.x*dt+0.5*obj.a.x*dt*dt,obj.position.y+obj.v.y*dt+0.5*obj.a.y*dt*dt);
            obj.v.x+=obj.a.x*dt;
            obj.v.y+=obj.a.y*dt;
            obj.resetForce();
            if(obj.collider)
                obj.collider.landed=false;
        });
        this.objectList.foreach(function(obj,node)
        {
try{
            if(obj.collider&&obj.collider.rigidBody)
            {
                for(p=node.next;p;p=p.next)
                {
                    var target=p.object;
                    if(target.collider&&target.collider.rigidBody)
                    {
                        if(obj.collider.isCollideWith(target.collider))
                        {
                            if(obj.collider instanceof Rectangle)
                                Rectangle.collide(obj,target,dt);
                            else if(obj.collider instanceof Ground)
                                Ground.collide(obj,target,dt);
                        }
                    }
                }
            }
}catch(ex){ console.warn("collide:"+ex.message);}
        });
    }
    Scene.prototype.render=function(dt)
    {
        var scene=this;
        if(!this.game.graphics)
            throw new Error("Game cannot render on a null");
        if (!this.camera)
            return;
        scene.camera.clear();
        //scene.camera.graphics.clearRect(scene.camera.center.x - scene.camera.width / 2, scene.camera.center.y + scene.camera.height / 2, scene.camera.width, scene.camera.height);
        this.objectList.foreach(function(obj,node)
        {
//console.warn(obj.graphic.r);
            if(obj.onRender)
                obj.onRender(obj, dt);
            obj.render(scene.camera.graphics, obj.position.x, obj.position.y, 0, dt);
            //obj.drawToCanvas(scene.game.graphics.canvas, obj.position.x, obj.position.y, 0, dt);
        });
        if(!scene.GUI)
            return;
        scene.camera.resetTransform();
        scene.GUI.render(scene.camera.graphics);
    }
    Scene.prototype.updateFrame=function(delay)
    {
        var scene=this;
        var dt=delay/1000;
        //dt=0.016;
        this.objectList.foreach(function(obj,node)
        {
            if (obj.deleted)
                return;
            if(obj.onUpdate)
                obj.onUpdate(obj,dt);
        });
        //this.render(dt);
        this.physicalSimulate(dt);
        this.render(dt);
        if (this._frameComplete)
            this._frameComplete();
    }
    Scene.prototype.initEvents = function ()
    {
        var scene = this;
        var pressedKeyList = [];
        var clickTime=0;
        this.eventSource.addEventListener("mousemove", function (e)
        {
            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            args.x = e.pageX;
            args.y = e.pageY;
            if (scene.GUI)
                scene.GUI.mouseMoveCallback(e);
            if (args.handled)
                return;

            args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);
            args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);

            if (scene.onMouseMove)
                scene.onMouseMove(args);
        });
        this.eventSource.addEventListener("mouseover", function (e)
        {
            var args = new MouseEventArgs();
            args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);
            args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            if (scene.onMouseOver)
                scene.onMouseOver(args);
        });
        this.eventSource.addEventListener("mouseout", function (e)
        {
            var args = new MouseEventArgs();
            args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);
            args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            if (scene.onMouseOut)
                scene.onMouseOut(args);
        });
        this.eventSource.addEventListener("mousedown", function (e)
        {
            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Pressed;
            args.handled = false;
            args.x = e.pageX;
            args.y = e.pageY;
            if (scene.GUI)
                scene.GUI.mouseDownCallback(e);
            if (args.handled)
                return;

            args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);
            args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);
            scene.objectList.foreach(function (obj, node)
            {
                if (obj.hitTest && obj.onMouseDown && obj.collider)
                {
                    var p = new Point(args.x, args.y);
                    if (obj.collider.isCollideWith(p))
                    {
                        obj.onMouseDown(args);
                        if (args.handled)
                            return true;
                    }
                }
            });
            if (args.handled)
                return;
            if (scene.onMouseDown)
                scene.onMouseDown(args);
        });
        this.eventSource.addEventListener("mouseup", function (e)
        {
            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Released;
            args.handled = false;
            args.x = e.pageX;
            args.y = e.pageY;
            if (scene.GUI)
                scene.GUI.mouseUpCallback(e);
            if (args.handled)
                return;

            args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);
            args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);

            scene.objectList.foreach(function (obj, node)
            {
                if (obj.hitTest && obj.onMouseUp && obj.collider)
                {
                    var p = new Point(args.x, args.y);
                    if (obj.collider.isCollideWith(p))
                    {
                        obj.onMouseUp(args);
                        if (args.handled)
                            return true;
                    }
                }
            });
            if (args.handled)
                return;
            if (scene.onMouseUp)
                scene.onMouseUp(args);
        });
        this.eventSource.addEventListener("click", function (e)
        {
            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Click;
            args.handled = false;

            var t=(new Date()).getTime();
            if(t-clickTime<=scene.doubleClickDelay)
            {
                args.buttonState = Mouse.ButtonState.DoubleClick; args.x = e.pageX;
                args.y = e.pageY;
                if (scene.GUI)
                    scene.GUI.doubleClickCallback(e);
                if (args.handled)
                    return;

                args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);
                args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);

                clickTime = 0;
                scene.objectList.foreach(function (obj, node)
                {
                    if (obj.hitTest && obj.onDoubleClick && obj.collider)
                    {
                        var p = new Point(args.x, args.y);
                        if (obj.collider.isCollideWith(p))
                        {
                            obj.onDoubleClick(args)
                            if (args.handled)
                                return true;
                        }
                    }
                });
                if (args.handled)
                    return;
                if (scene.onDoubleClick)
                    scene.onDoubleClick(args);
            }
            else
            {
                args.x = e.pageX;
                args.y = e.pageY;
                if (scene.GUI)
                    scene.GUI.clickCallback(e);
                if (args.handled)
                    return;

                args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);
                args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);

                clickTime = t;
                scene.objectList.foreach(function (obj, node)
                {
                    if (obj.hitTest && obj.onClick && obj.collider)
                    {
                        var p = new Point(args.x, args.y);
                        if (obj.collider.isCollideWith(p))
                        {
                            obj.onClick(args);
                            if (args.handled)
                                return true;
                        }
                    }
                });
                if (args.handled)
                    return;
                if (scene.onClick)
                    scene.onClick(args);
            }
        });
        window.addEventListener("keydown", function (e)
        {
            if (!pressedKeyList[e.keyCode])
            {
                pressedKeyList[e.keyCode] = true;
                var args = new KeyEventArgs();
                args.key = e.keyCode;
                args.keyName = Keyboard.Keys.toString(args.key);
                args.keyState = Keyboard.KeyState.Down;
                args.ctrl = e.ctrlKey;
                args.alt = e.altKey;
                args.shift = e.shiftKey;
                args.handled = false;
                e.key = keyCodeToKey(e.keyCode);
                if (scene.onKeyDown)
                    scene.onKeyDown(args);
            }
        });
        window.addEventListener("keyup", function (e)
        {
            if (pressedKeyList[e.key.toUpperCase()])
            {
                pressedKeyList[e.key.toUpperCase()] = false;
                var args = new KeyEventArgs();
                args.key = e.keyCode;
                args.keyName = Keyboard.Keys.toString(args.key);
                args.keyState = Keyboard.KeyState.Up;
                args.ctrl = e.ctrlKey;
                args.alt = e.altKey;
                args.shift = e.shiftKey;
                args.handled = false;
                if (scene.onKeyUp)
                    scene.onKeyUp(args);
            }
        });
        window.addEventListener("keypress", function (e)
        {
            var args = new KeyEventArgs();
            args.key = e.keyCode;
            args.keyName = Keyboard.Keys.toString(args.key);
            args.keyState = Keyboard.KeyState.Pressed;
            args.ctrl = e.ctrlKey;
            args.alt = e.altKey;
            args.shift = e.shiftKey;
            args.handled = false;
            if (scene.onKeyPress)
                scene.onKeyPress(args);
        });
        this.eventSource.addEventListener("touchstart", function (e)
        {
            if (scene.onTouchStart)
                scene.onTouchStart(e);
        });
        this.eventSource.addEventListener("touchmove", function (e)
        {
            if (scene.onTouchMove)
                scene.onTouchMove(e);
        });
        this.eventSource.addEventListener("touchend", function (e)
        {
            if (scene.onTouchEnd)
                scene.onTouchEnd(e);
        });
    }
    Scene.prototype.addGameObject=function(obj)
    { 
        var node=this.objectList.add(obj);
        obj.id=this._objList.add(node);
        return obj.id;
    }
    Scene.prototype.removeGameObject=function(id)
    {
        var node = this._objList[id];
        node.object.deleted = true;
        if(!node)
            throw new Error("The object has been removed.");
        this.objectList.remove(node);
        this._objList[id]=null;
    }
    engine.Scene=Scene;
    window.Scene = Scene;

    function Camera(x, y, w, h, z)
    {
        this.center = new Point(x, y);
        this.position = new Point(x, y);
        this.width = w;
        this.height = h;
        this.zoom = z;
        this.rotate = 0;
        this.graphics = null;
        this._clearColor = "rgba(0, 0, 0, 0)";
    }
    Camera.prototype.copy = function ()
    {
        var c = new Camera(this.x, this.y, this.width, this.height, this.zoom);
        c.graphics = this.graphics;
        return c;
    }
    Camera.prototype.setCenter = function (x, y, align)
    {
        if (!align)
            throw new Error("Align function is required!");
        this.position.x = x;
        this.position.y = y;
        this.center.x = x + this.width / 2 - align(this.width, this.height).x;
        this.center.y = y + this.height / 2 - align(this.width, this.height).y;
    }
    Camera.prototype.moveTo = function (x, y)
    {
        this.center.x += (x - this.position.x);
        this.center.y += (y - this.position.y);
        this.position.x = x;
        this.position.y = y;
        if (!this.graphics || !this.graphics.ctx)
            return;
        //this.resetTransform();
    }
    Camera.prototype.zoomTo = function (z)
    {
        this.zoom = z;
        if (!this.graphics || !this.graphics.ctx)
            return;
        //this.resetTransform();
    }
    Camera.prototype.rotateTo = function (angle)
    {
        throw new Error("Coming soon...");
        this.rotate = angle;
        if (!this.graphics || !this.graphics.ctx)
            return;
        //this.resetTransform();
    }
    Camera.prototype.resetTransform=function()
    {
        //console.warn(this.graphics);
        this.graphics.setTransform(1, 0, 0, 1, 0, 0);
    }
    Camera.prototype.clear=function()
    {
        if (!this.graphics || !this.graphics.ctx)
            return;
        this.resetTransform();
        this.graphics.ctx.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height);
        this.graphics.ctx.fillStyle = this._clearColor;
        this.graphics.ctx.fillRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height);
        this.applyTransform();
    }
    Camera.prototype.applyTransform=function ()
    {
        if (!this.graphics || !this.graphics.ctx)
            return;
        var sinA = Math.sin(this.rotate);
        var cosA = Math.cos(this.rotate);
        this.width = this.graphics.canvas.width;
        this.height = this.graphics.canvas.height;
        var x0 = -this.position.x + this.width / 2;
        var y0 = this.position.y + this.height / 2;
        this.width = this.graphics.canvas.width / this.zoom;
        this.height = this.graphics.canvas.height / this.zoom;
        var x1 = this.center.x * cosA + this.center.y * sinA - this.center.x;
        var y1 = -this.center.x * sinA + this.center.y * cosA - this.center.y;
        var x2 = (1 - 1 / this.zoom) * this.center.x * this.zoom;
        var y2 = (1 - 1 / this.zoom) * this.center.y * this.zoom;
        this.graphics.setTransform(1, 0, 0, 1, x0, y0);
        //this.graphics.setTransform(1, 0, 0, 1, 100, 100);
        this.graphics.transform(cosA, sinA, -sinA, cosA, 0, 0);
        this.graphics.transform(1, 0, 0, 1, x1, -y1);
        this.graphics.transform(this.zoom, 0, 0, this.zoom, -x2, +y2);
        //this.graphics.clearRect(this.center.x - this.width / 2, this.center.y - this.height / 2);
    }
    engine.Camera = Camera;
    window.Camera = Camera;

    function GUI()
    {
        
    }
    function Button(context)
    {
    }
    function TextBlock(text)
    {
    }
    function Joystick()
    {
    }
    

    //-------Graphics
    function Graphics(canvas)
    {
        if(!canvas)
            throw new Error("paramter error.");
        if(!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d");
        this.o = new Point(0, 0);
        this.zoom = 0;
        this.rotation = 0;
        this.fillStyle = "#000000";
        this.strokeStyle = "#000000";
        this.shadowColor = "#000000";
        this.shadowBlur = "#000000";
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.lineCap = "butt";
        this.lineJoin = "miter";
        this.lineWidth = 1;
        this.miterLimit = 10;
        this.font = new Font("sans-serif", "10px");
        this.textAlign = TextAlign.Start;
        this.textBaseline = TextBaseline.Alphabetic;
        this.globalAlpha = 1.0;
        var globalCompositeOperation = "source-over";
        var graphics = this;
        Object.defineProperty(this, "globalCompositeOperation", {
            get: function ()
            {
                return globalCompositeOperation;
            },
            set: function (value)
            {
                globalCompositeOperation = value;
                graphics.ctx.globalCompositeOperation = value;
            }
        });
    }
    Graphics.LineCap = (function () { var lineCap = {}; lineCap.Butt = "butt"; lineCap.Round = "round"; lineCap.Square = "square"; return lineCap; })();
    Graphics.LineJoin = (function () { var lineJoin = {}; lineJoin.Bevel = "bevel"; lineJoin.Round = "round"; lineJoin.Miter = "miter"; return lineJoin })();
    Graphics.CompositeOperation = (function (){ var co = {}; co.SourceOver = "source-over"; co.SourceAtop = "source-atop"; co.SourceIn = "source-in"; co.SourceOut = "source-out"; co.DestinationOver = "destination-over"; co.DestinationAtop = "destination-atop"; co.DestinationIn = "destination-in"; co.DestinationOut = "destination-out"; co.Lighter = "lighter"; co.Copy = "copy"; co.Xor = "xor"; return co; })();
    Graphics.drawLine=function(canvas, x1, y1, x2, y2, color)
    {
        if(!canvas)
            throw new Error("paramter error.");
        if(!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        
        ctx=canvas.getContext("2d");
        ctx.beginPath();    
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        if(color)
            ctx.strokeStyle=color;
        ctx.stroke();
    }
    Graphics.drawArc=function (canvas,x,y,r,ang1,ang2,clockwise,color)
    {
        var ctx=canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(x,y,r,ang1,ang2,clockwise);
        ctx.strokeStyle=color;
        ctx.stroke();
    }
    Graphics.drawCircle=function(canvas,x,y,r,strokeStyle,fillStyle,strokeWidth)
    {
        var ctx=canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(x,y,r,0,Math.PI*2);
        ctx.strokeStyle=strokeStyle;
        ctx.fillStyle=fillStyle;
        ctx.lineWidth=strokeWidth;
        ctx.fill();
        ctx.stroke();
    }
    Graphics.drawImage = function (canvas, img, sx, sy, swidth, sheight, x, y, width, height)
    {
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
    }
    Graphics.fillRect=function(canvas,x,y,w,h,color)
    {
        if(!canvas)
            throw new Error("paramter error.");
        if(!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        ctx=canvas.getContext("2d");
        ctx.fillStyle=color? color:"black";
        ctx.fillRect(x,y,w,h);
            
    }
    Graphics.clear=function(canvas, color)
    {
        if(!canvas)
            throw new Error("paramter error.");
        if(!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        var ctx=canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);
        /*/ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);*/
        if(color)
        {
            ctx.fillStyle=color;
            ctx.fillRect(0,0,width,height);
        }
    }
    Graphics.clearRect=function(canvas,x,y,width,height)
    {
        var ctx=canvas.getContext("2d");
        ctx.clearRect(x,y,width,height); 
    }
    Graphics.prototype.rect = function (x, y, width, height)
    {
        return this.ctx.rect(x, -y, width, height);
    }
    Graphics.prototype.roundRect = function (x, y, width, height, r)
    {
        if (!this.ctx)
            return;
        if (width < 2 * r)
            width = 2 * r;
        if (height < 2 * r)
            height = 2 * r;
        ctx.beginPath();
        ctx.moveTo(x + r, -y);
        ctx.lineTo(x + width - r, -y);
        ctx.arcTo(x + width, -y, x + width, -y + r, r);
        ctx.lineTo(x + width, -y + height - r);
        ctx.arcTo(x + width, -y + height, x + width - r, -y + height, r);
        ctx.lineTo(x + r, -y + height);
        ctx.arcTo(x, -y + height, x, -y + height - r, r);
        ctx.lineTo(x, -y + r);
        ctx.arcTo(x, -y, x + r, -y, r);
        ctx.closePath();
        return;
    }
    Graphics.prototype.fillRect = function (x, y, width, height)
    {
        this.ctx.fillStyle = this.fillStyle;
        return this.ctx.fillRect(x, -y, width, height);
    }
    Graphics.prototype.strokeRect = function (x, y, width, height)
    {
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;
        return this.ctx.strokeRect(x, -y, width, height);
    }
    Graphics.prototype.fillRoundRect = function (x, y, width, height, r)
    {
        this.roundRect(x, y, width, height, r);
        this.fill();
    }
    Graphics.prototype.strokeRoundRect = function (x, y, width, height, r)
    {
        this.roundRect(x, y, width, height, r);
        this.stroke();
    }
    Graphics.prototype.clearRect = function (x, y, width, height)
    {
        this.ctx.clearRect(x, -y, width, height);
    }
    Graphics.prototype.fill = function ()
    {
        this.ctx.fillStyle = this.fillStyle;
        return this.ctx.fill();
    }
    Graphics.prototype.stroke = function ()
    {
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;
        return this.ctx.stroke();
    }
    Graphics.prototype.beginPath = function ()
    {
        return this.ctx.beginPath();
    }
    Graphics.prototype.moveTo = function (x, y)
    {
        return this.ctx.moveTo(x, -y);
    }
    Graphics.prototype.closePath = function ()
    {
        return this.ctx.closePath();
    }
    Graphics.prototype.lineTo = function (x, y)
    {
        return this.ctx.lineTo(x, -y);
    }
    Graphics.prototype.clip = function ()
    {
        return this.ctx.clip();
    }
    Graphics.prototype.quadraticCurveTo = function (cpx, cpy, x, y)
    {
        return this.ctx.quadraticCurveTo(cpx, -cpy, x, -y);
    }
    Graphics.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y)
    {
        return this.ctx.bezierCurveTo(cp1x, -cp1y, cp2x, -cp2y, x, -y);
    }
    Graphics.prototype.arc = function (x, y, r, sAngle, eAngle, counterclockwise)
    {
        return this.ctx.arc(x, -y, r, sAngle, eAngle, counterclockwise);
    }
    Graphics.prototype.arcTo = function (x1, y1, x2, y2, r)
    {
        return this.ctx.arcTo(x1, -y1, x2, -y2, r);
    }
    Graphics.prototype.isPointInPath = function (x, y)
    {
        return this.ctx.isPointInPath(x, -y);
    }
    Graphics.prototype.scale = function (scalewidth, scaleheight)
    {
        return this.ctx.scale(scalewidth, scaleheight);
    }
    Graphics.prototype.rotate = function (angle)
    {
        return this.ctx.rotate(angle);
    }
    Graphics.prototype.translate = function (x, y)
    {
        return this.ctx.translate(x, -y);
    }
    Graphics.prototype.transform = function (a, b, c, d, e, f)
    {
        return this.ctx.transform(a, b, c, d, e, f);
    }
    Graphics.prototype.setTransform = function (a, b, c, d, e, f)
    {
        return this.ctx.setTransform(a, b, c, d, e, f);
    }
    Graphics.prototype.fillText = function (text, x, y, maxWidth)
    {
        this.ctx.font=this.font.toString();
        this.ctx.textAlign=this.textAlign;
        this.ctx.textBaseline=this.textBaseline;
        this.ctx.fillStyle = this.fillStyle;
//this.ctx.fillText("2333333", 100, 100, -1);
        if(maxWidth)
            return this.ctx.fillText(text, x, -y, maxWidth);
        else
            return this.ctx.fillText(text, x, -y);
    }
    Graphics.prototype.strokeText = function (text, x, y, maxWidth)
    {
        this.ctx.font=this.font.toString();
        this.ctx.fontAlign=this.fontAlign;
        this.ctx.textBaseline=this.textBaseline;
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;
        return this.ctx.strokeText(text, x, -y, maxWidth);
    }
    Graphics.prototype.measureText = function (text)
    {
        this.ctx.font=this.font.toString();
        this.ctx.fontAlign=this.fontAlign;
        this.ctx.textBaseline=this.textBaseline;
        return this.ctx.measureText(text);
    }
    Graphics.prototype.drawImage = function (img, sx, sy, swidth, sheight, x, y, width, height)
    {
        if (isNaN(x) && !isNaN(sx))
        {
            return this.ctx.drawImage(img, sx, -sy, swidth, sheight);
        }
        else
            return this.ctx.drawImage(img, sx, sy, swidth, sheight, x, -y, width, height);
    }
    Graphics.prototype.drawLine = function (x1, y1, x2, y2)
    {
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;

        this.beginPath();
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
        this.stroke();
    }
    
    sar.Color = (function (color)
    {
        Object.defineProperty(window, "Color", {
            get: function ()
            {
                return color;
            },
            set: function (value)
            {
                if (!color)
                    color = value;
                if (!value || !value.version || value.version < color.version)
                    return;
                color = value;
            }
        });
        if (color && color.version && color.version > 1.0)
            return;
        //-------Color
        function Color(r, g, b, a)
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
        }
        Color.version = 1.0;
        Color.random = function ()
        {
            return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1.0);
        }
        Color.prototype.copy = function ()
        {
            return new Color(this.red, this.green, this.blue, this.alpha);
        }
        Color.prototype.toString = function ()
        {
            return "rgba(" + this.red.toString() + "," + this.green.toString() + "," + this.blue.toString() + "," + this.alpha.toString() + ")";
        }
        window.Color = Color;
        return Color;
    })(sar.Color);

    engine.Graphics=Graphics;
    window.Graphics=Graphics;

    //-------Image
    /*function Image()
    {
        this.width=0;
        this.height=0;
        this.center=new Point(0,0);
    }
    Image.create=function (width,height,color)
    {
    }
    Image.fromUrl=function (url)
    {
    }
    Image.prototype.copy=function()
    {
    }
    Image.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
    }
    engine.Image=Image;
    window.Image=Image;*/

    //-------FontStyle
    function Font(fontFamily, fontSize)
    {
        fontFamily = fontFamily ? fontFamily : "sans-serif";
        fontSize = fontSize || fontSize == 0 ? fontSize : "10px";
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.fontStyle = FontStyle.Normal;
        this.fontVariant = FontVariant.Normal;
        this.fontWeight = FontWeight.Normal;
        this.caption = "";
        this.icon = "";
        this.menu = "";
        this.messageBox = "";
        this.smallCaption = "";
        this.statusBar = "";
    }
    Font.prototype.copy = function ()
    {
        var f = new Font(this.fontFamily, this.fontSize);
        f.fontStyle = this.fontStyle;
        f.fontVariant = this.fontVariant;
        f.fontWeight = this.fontWeight;
        f.caption = this.caption;
        f.icon = this.icon;
        f.menu = this.menu;
        f.messageBox = this.messageBox;
        f.smallCaption = this.smallCaption;
        f.statusBar = this.statusBar;
        return f;
    }
    Font.prototype.toString = function ()
    {
        return this.fontStyle + " " + this.fontVariant + " " + this.fontWeight + " " + this.fontSize + " " + this.fontFamily;
    }
    window.Font = Font;
    function FontStyle(){}
    FontStyle.Normal="normal";
    FontStyle.Italic="italic";
    FontStyle.Oblique = "oblique";
    window.FontStyle = FontStyle;
    function FontVariant(){}
    FontVariant.Normal="normal";
    FontVariant.SmallCaps = "small-caps";
    window.FontVariant = FontVariant;
    function FontWeight(){}
    FontWeight.Normal="normal";
    FontWeight.Bold="bold";
    FontWeight.Bolder="bolder";
    FontWeight.Lighter = "lighter";
    window.FontWeight = FontWeight;
    function TextAlign() { }
    TextAlign.Start = "start";
    TextAlign.End = "end";
    TextAlign.Center = "center";
    TextAlign.Left = "left";
    TextAlign.Right = "right";
    window.TextAlign = TextAlign;
    function TextBaseline() { }
    TextBaseline.Alphabetic = "alphabetic";
    TextBaseline.Top = "top";
    TextBaseline.Hanging = "hanging";
    TextBaseline.Middle = "middle";
    TextBaseline.Ideographic = "ideographic";
    TextBaseline.Bottom = "bottom";
    window.TextBaseline = TextBaseline;

    //-------Text
    function Text(text)
    {
        this.text = text;
        this.font = new Font("sans-serif", 16);
        this.position = new Point(0, 0);
        this.center = new Point(0, 0);
        this.fillStyle=new Color(0,0,0,1);
        this.strokeStyle = new Color(255, 255, 255, 0);
        this.onRender = null;
    }
    Text.prototype.copy=function()
    {
        var text=new Text(this.text);
        text.font = this.font.copy();
        text.position = this.position.copy();
        text.center = this.center.copy();
        text.onRender = this.onRender;
        if (this.fillStyle && this.fillStyle.copy)
            text.fillStyle = this.fillStyle.copy();
        else
            text.fillStyle = this.fillStyle;
        if (this.strokeStyle && this.strokeStyle.copy)
            text.strokeStyle = this.strokeStyle.copy();
        else
            text.strokeStyle = this.strokeStyle;
        return text;
    }
    Text.prototype.setCenter = function (x, y, align)
    {
        this.position = new Point(x, y);
        if (!align)
            throw new Error("未指定对齐方式");
        this.center = align(this.width, this.height);
        this.center.x = x - this.center.x;
        this.center.y = y + this.center.y;
    }
    Text.prototype.moveTo = function (x, y)
    {
        var rx = this.position.x;
        var ry = this.position.y;
        this.position.x = x;
        this.position.y = y;
        this.center.x = this.center.x - rx + x;
        this.center.y = this.center.y - ry + y;
    }
    Text.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        var ctx=canvas.getContext("2d");
        ctx.font = this.fontStyle + " " 
                 + this.fontVariant + " "
                 + this.fontWeight + " "
                 + this.fontSize + "px "
                 + this.fontFamily;
        ctx.fillStyle=this.fillStyle;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillText(this.text,x,y);
        ctx.strokeText(this.text,x,y);
    }
    Text.prototype.render = function (graphics, x, y, r, dt)
    {
        if (!graphics || !graphics.ctx)
            return;
        if (this.onRender)
            this.onRender();

        graphics.textAlign = TextAlign.Left;
        graphics.textBaseline = TextBaseline.Top;
        graphics.font = this.font;
        graphics.fillText(this.text, this.center.x, this.center.y);
    }
    engine.Text=Text;
    window.Text = Text;

    engine.Image = function (img)
    {
        if (!img)
            img = new window.Image();
        this.img = img;
        this.position = new Point(0, 0);
        this.o = new Point(0, 0);
        this.onRender = null;

        var obj = this;
        Object.defineProperty(this, "width", {
            get: function ()
            {
                return obj.img.width;
            },
            set: function (value)
            {
                obj.img.width = value;
            }
        });
        Object.defineProperty(this, "height", {
            get: function ()
            {
                return obj.img.height;
            },
            set: function (value)
            {
                obj.img.height = value;
            }
        });
    }
    engine.Image.prototype.copy = function ()
    {
        var img = new engine.Image(img);
        img.position = this.position.copy();
        img.o = this.o.copy();
        img.onRender = this.onRender;
    }
    engine.Image.prototype.setCenter = function (x, y, align)
    {
        this.position = new Point(x, y);
        if (!align)
            throw new Error("未指定对齐方式");
        this.o = align(this.width, this.height);
        this.o.x = x - this.o.x;
        this.o.y = y + this.o.y;
    }
    engine.Image.prototype.moveTo = function (x, y)
    {
        var rx = this.position.x;
        var ry = this.position.y;
        this.position.x = x;
        this.position.y = y;
        this.o.x = this.o.x - rx + x;
        this.o.y = this.o.y - ry + y;
    }
    engine.Image.prototype.loadFromUrl = function (url, width, height, callback)
    {
        this.img = new window.Image();
        this.img.crossOrigin = "Anonymous";
        var me = this;
        this.img.onload = function (e)
        {
            me.width = me.img.naturalWidth;
            me.height = me.img.naturalHeight;
            if (!width)
                return;
            if (!height)
            {
                width();
                return;
            }
            if (!callback)
            {
                me.img.width = width;
                me.img.height = height;
                return;
            }
            if (callback)
                callback();
        }
        this.img.src = url;
        if (this.img.complete)
        {
            return;
        }
    }
    engine.Image.prototype.render = function (graphics, x, y, r, dt)
    {
        if (!graphics)
            return;
        if (this.onRender)
            this.onRender();
        graphics.drawImage(this.img, this.o.x, this.o.y, this.width, this.height);
    }

    //-------ImageAnimation
    function ImageAnimation ()
    {
        this.center = new Point(0, 0);
        this.position = this.center.copy();
        this.fCount=0;
        this.fps = 0;
        this.clipX = 0;
        this.clipY = 0;
        this.fWidth = 0;
        this.fHeight = 0;
        this.time = 0;
        this.img = null;
        this.frame=0;
        this.playing=true;
        this.reverse=false;
        this.width = 0;
        this.heigh = 0;
        this.onBegine=null;
        this.onEnd=null;
        this.onFrameUpdate=null;
        this.loop = new ImageAnimation.Loop();
    }
    //---ImagImageAnimation.Loop
    ImageAnimation.Loop = function ()
    {
        this.from = 0;
        this.to = 0;
        this.length=0;
        this.loopTimes = -1;
        this.lt = 0;
        this.enable = true;
        this.onEnd = null;
        this.onStart = null;
    }
    ImageAnimation.Loop.prototype.copy = function ()
    {
        var loop = new ImageAnimation.Loop();
        loop.from = this.from;
        loop.to = this.to;
        loop.length = this.length;
        loop.loopTimes = this.loopTimes;
        loop.lt = this.lt;
        loop.enable = this.enable;
        loop.onEnd = this.onEnd;
        loop.onStart = this.onStart;
        return loop;
    }
    ImageAnimation.Loop.prototype.begin=function ()
    {
        this.enable = true;
        if (this.onStart)
            this.onStart();
    }
    ImageAnimation.Loop.prototype.end = function ()
    {
        var t=this.enable;
        this.enable = false;
        if (t && this.onEnd)
            this.onEnd();
    }
    ImageAnimation.loadFromUrl = function (url, clipX, clipY, fWidth, fHeight, width, height, fCount, fps, callback)
    {
        var ia = new ImageAnimation;
        ia.img = new Image();
        ia.img.onload = function (e)
        {
            ia.fps = fps;
            ia.width = width;
            ia.heigh = height;
            ia.clipFrame(clipX, clipY, fWidth, fHeight, fCount);
            if (callback)
                callback();
        }
        ia.img.src = url;
        return ia;
    }
    ImageAnimation.create=function (width,height,fCount,fps)
    {
    }
    ImageAnimation.prototype.copy=function()
    {
        var ia = new ImageAnimation;
        ia.img = this.img;
        ia.center = this.center.copy();
        ia.position = this.position.copy();
        ia.fCount = this.fCount;
        ia.fps = this.fps;
        ia.clipX = this.clipX;
        ia.clipY = this.clipY;
        ia.fWidth = this.fWidth;
        ia.fHeight = this.fHeight;
        ia.time = this.time;
        ia.width = this.width;
        ia.heigh = this.heigh;
        ia.frame=this.frame;
        ia.playing=this.playing;
        ia.reverse=this.reverse;
        ia.onBegine=this.onBegine;
        ia.onEnd=this.onEnd;
        ia.onFrameUpdate=this.onFrameUpdate;
        ia.loop = this.loop.copy();
        return ia;
    }
    ImageAnimation.prototype.setCenter = function (x, y, align)
    {
        this.position = new Point(x, y);
        if(!align)
            throw new Error("未指定对齐方式");
        this.center = align(this.width, this.heigh);
        this.center.x = x - this.center.x;
        this.center.y = y + this.center.y;
    }
    ImageAnimation.prototype.moveTo = function (x, y)
    {
        var rx = this.position.x;
        var ry = this.position.y;
        this.position.x = x;
        this.position.y = y;
        this.center.x = this.center.x - rx + x;
        this.center.y = this.center.y - ry + y;
    }
    ImageAnimation.prototype.clipFrame = function (clipX, clipY, fWidth, fHeight, fCount)
    {
        this.clipX = clipX;
        this.clipY = clipY;
        this.fWidth = fWidth;
        this.fHeight = fHeight;
        this.fCount = fCount;
        this.loop.from = 0;
        this.loop.to = fCount - 1;
    }
    ImageAnimation.prototype.begine=function()
    {
        this.playing=true;
        this.time=0;
        this.frame=0;
        this.loop.lt=0;
    }
    ImageAnimation.prototype.end=function()
    {
        var t = this.playing;
        this.playing=false;
        if(this.onEnd && t)
        {
            this.onEnd();
        }
    }
    ImageAnimation.prototype.play=function()
    {
        this.playing=true;
        this.time=0;
    }
    ImageAnimation.prototype.drawToCanvas = function (canvas, x, y, r, dt)
    {

    }
    ImageAnimation.prototype.render = function (graphics, x, y, r, dt)
    {
        if (this.time == 0 && this.onBegine)
            this.onBegine();
        this.time += dt;
        var f = Math.floor(this.time / (1 / this.fps));
        if (this.reverse)
            f = this.fCount - f;
        if (this.loop.enable)
        {
            if (f > this.loop.to)
            {
                this.loop.lt++;
                if (this.loop.loopTimes > 0 && this.loop.lt >= this.loop.loopTimes)
                {
                    this.loop.enable = false;
                    f = f % this.fCount;
                }
                else
                {
                    f -= this.loop.from;
                    f %= (this.loop.to - this.loop.from);
                    if (!f)
                        f = 0;
                    f = this.loop.from + f;
                }
            }
        }
        else if (this.playing)
        {
            if (f >= this.fCount && !this.reverse)
            {
                this.frame = f = this.fCount - 1;
                this.end();
            }
            if (f <= 0 && this.reverse)
            {
                this.frame = f = 0;
                this.end();
            }
            //f = f % this.fCount;
        }
        if (this.playing)
        {
            var F = f;
            if (this.frame != f && this.onFrameUpdate)
                F = this.onFrameUpdate(f);
            if (!isNaN(F))
                f = F;
            this.frame = f;
        }
        graphics.drawImage(this.img, this.clipX + (this.fWidth * this.frame), this.clipY, this.fWidth, this.fHeight, this.center.x, this.center.y, this.width, this.heigh);
    }
    engine.ImageAnimation=ImageAnimation;
    window.ImageAnimation=ImageAnimation;

    //-------Vector2
    function Vector2(x,y)
    {
        this.x=x;
        this.y=y;
        
    }
    Vector2.fromPoint=function(p1,p2)
    {
        return new Vector2(p2.x-p1.x,p2.y-p1.y);
    }
    Vector2.prototype.copy=function()
    {
        return new Vector2(this.x,this.y);
    }
    Vector2.prototype.toString=function()
    {
        return "("+this.x+","+this.y+")";
    }
    Vector2.prototype.getLength=function()
    {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    Vector2.prototype.plus=function(v)
    {
        if(!(v instanceof Vector2))
            throw new Error("v must be a Vector");
        this.x=this.x+v.x;
        this.y=this.y+v.y;
        return this;
    }
    Vector2.prototype.minus=function(v)
    {
        if(!(v instanceof Vector2))
            throw new Error("v must be a Vector");
        this.x=this.x-v.x;
        this.y=this.y-v.y;
        return this;
    }
    engine.Vector2=Vector2;
    window.Vector2 = Vector2;

    //-------Point
    function Point(x,y,l)
    {
        if(isNaN(x) || isNaN(y))
            throw "x and y must be numbers.";
        this.x=x;
        this.y=y;
        this.lines=new Array();
        if(l instanceof Line)
        {
            this.lines[0]=l;
        }
        if(l instanceof Array)
        {
            for(var i=0;i<l.length;i++)
            {
                if(!(l[i] instanceof Line))
                    throw "l["+i+"] is not a Line";
                this.lines[i]=l[i];
            }
        }
        
    }
    Point.prototype.copy=function()
    {
        return new Point(this.x,this.y);
    }
    Point.prototype.toString=function()
    {
        return "("+this.x+","+this.y+")";
    }
    Point.prototype.rotate=function (o, ang)
    {
        var x=this.x-o.x;
        var y=this.y-o.y;
        var dx=x*Math.cos(ang)-y*Math.sin(ang);
        var dy=y*Math.cos(ang)+x*Math.sin(ang);
        return new Point(o.x+dx,o.y+dy);
    }
    Point.prototype.isBelongTo=function(l)
    {
        if(!(this.lines instanceof Array))
            throw "this object has something wrong.";
        for(var i=0;i<this.lines.length;i++)
        {
            if(this.lines[i]==l)
                return true;
        }
        return false;
    }
    Point.prototype.addLine=function(l)
    {
        if(!(this.lines instanceof Array))
            throw "this object has something wrong.";
        this.lines[this.lines.length]=l;
    }
    Point.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
       
    }
    Point.prototype.render = function (graphics, x, y, r, dt)
    {

    }
    engine.Point=Point;
    window.Point=Point;

    //-------Line
    function Line(_p1,_p2,pol)
    {
        var p1=_p1,p2=_p2;
        if((_p1 instanceof Vector2) && (_p2 instanceof Vector2))
        {
            p1=new Point(_p1.x,_p1.y,this);
            p2=new Point(_p2.x,_p2.y,this);
        }
        else if(!(p1 instanceof Point) || !(p2 instanceof Point))
        {
            throw new Error("P1 or P2 is not a Point.");
        }
        p1.addLine(this);
        p2.addLine(this);
        this.p1=p1;
        this.p2=p2;
        this.center=new Point((p1.x+p2.x)/2,(p1.y+p2.y)/2);
        this.position=this.center
        this.polygon = pol;
        this.strokeStyle = new Color(0, 0, 0, 1.00);
    }
    Line.prototype.copy=function()
    {
        var p1=this.p1.copy();
        var p2=this.p2.copy();
        var line=new Line(p1,p2);
        line.setCenter(this.center.x,this.center.y);
        return line;
    }
    Line.prototype.setCenter=function(x,y)
    {
        this.center.x=x;
        this.center.y=y;
    }
    Line.prototype.moveTo=function(x,y)
    {
        if(x==this.center.x&&y==this.center.y)
            return;
        this.p1.x=this.p1.x-this.center.x+x;
        this.p1.y=this.p1.y-this.center.y+y;
        this.p2.x=this.p2.x-this.center.x+x;
        this.p2.y=this.p2.y-this.center.y+y;
        this.center.x=x;
        this.center.y=y;
    }
    Line.prototype.isCross=function (obj) 
    {
        if(obj instanceof Line)
        {
            var p1=this.p1;
            var p2=this.p2;
            var p3=obj.p1;
            var p4=obj.p2;
            var v13=new Vector2(p3.x-p1.x, p3.y-p1.y);
            var v14=new Vector2(p4.x-p1.x, p4.y-p1.y);
            var v31=new Vector2(p1.x-p3.x, p1.y-p3.y);
            var v32=new Vector2(p2.x-p3.x, p2.y-p3.y);
            var v12=new Vector2(p2.x-p1.x, p2.y-p1.y);
            var v34=new Vector2(p4.x-p3.x, p4.y-p3.y);
            if((v13.x*v12.y - v12.x*v13.y) * (v14.x*v12.y - v12.x*v14.y) < 0 && (v31.x*v34.y - v34.x*v31.y) * (v32.x*v34.y - v34.x*v32.y) < 0)
                return true;
            return false;
        }
        else if(obj instanceof Circle)
        {
            var v1=new Vector2(obj.center.x-this.p1.x,obj.center.y-this.p1.y);
            var v2=new Vector2(this.p2.x-this.p1.x, this.p2.y-this.p1.y);
            var v3=new Vector2(obj.center.x-this.p2.x,obj.center.y-this.p2.y);
            var v4=new Vector2(-v2.x,-v2.y);
            var d1=(obj.center.x-this.p1.x)*(obj.center.x-this.p1.x) + (obj.center.y-this.p1.y)*(obj.center.y-this.p1.y);
            d1=(d1<=obj.r*obj.r) ? 1:0;
            var d2=(obj.center.x-this.p2.x)*(obj.center.x-this.p2.x) + (obj.center.y-this.p2.y)*(obj.center.y-this.p2.y);
            d2=(d2<=obj.r*obj.r) ? 1:0;
            if(d1^d2)
                return true;
            if(d1&&d2)
                return false;
            if((v1.x*v2.x+v1.y*v2.y<0) || (v3.x*v4.x+v3.y*v4.y<0))
            {
                return false;
            }
            if(v3.x*v4.x+v3.y*v4.y<0)
            {
                
                
            }
            var x=v1.x*v2.y-v2.x*v1.y;
            var l=v2.x*v2.x+v2.y*v2.y;
            l=l*obj.r*obj.r;
            x*=x;
            
            if(x<=l)
                return true;
            return false;
        }
    }
    Line.prototype.render = function (graphics, x, y, r, dt)
    {
        graphics.beginPath();
        graphics.moveTo(this.p1.x, this.p1.y);
        graphics.lineTo(this.p2.x, this.p2.y);
        graphics.strokeStyle = this.strokeStyle;
        graphics.stroke();
    }
    engine.Line=Line;
    window.Line=Line;

    //-------GameObject
    function GameObject ()
    {
        this.id=null;
        this.name="GameObject";
        this.graphic=null;
        this.collider=null;
        this.layer=0;
        this.zIndex=0;
        this.mass=1;
        this.gravity=true;
        this.onGround=false;
        this.hitTest=false;
        this.F=new Force(0,0);
        this.constantForce=new Force(0,0);
        this.v=new Vector2(0,0);
        this.a=new Vector2(0,0);
        this.position=new Point(0,0);
        this.center=this.position;
        this.rotation=0.0;
        this.onRender=null;
        this.onUpdate=null;
        this.onStart=null;
        this.onCollide=null;
        this.onMouseDown=null;
        this.onMouseUp=null;
        this.onClick = null;
        this.onDoubleClick = null;
    }
    GameObject.CollideEventArgs=function(obj,target)
    {
        this.obj=obj;
        this.target=target;
        this.relativeV=new Vector2(0,0);
        this.rebound=true;
    }
    GameObject.prototype.copy=function()
    {
        var obj=new GameObject();
        obj.name=this.name;
        obj.layer=this.layer;
        obj.zIndex=this.zIndex;
        if(this.graphic)
        {
            obj.graphic = this.graphic.copy ? this.graphic.copy() : this.graphic;
        }
        if(this.collider)
        {
            obj.collider = this.collider.copy ? this.collider.copy() : this.collider;
        }
        obj.mass=this.mass;
        obj.gravity=this.gravity;
        obj.onGround=this.onGround;
        obj.hitTest=this.hitTest;
        obj.constantForce=this.constantForce;
        obj.F=this.F.copy();
        obj.v=this.v.copy();
        obj.a=this.a.copy();
        obj.position=this.position.copy();
        obj.center=obj.position;
        obj.rotation=this.rotation;
        obj.onRender=this.onRender;
        obj.onUpdate=this.onUpdate;
        obj.onStart=this.onStart;
        obj.onCollide=this.onCollider;
        obj.onMouseDown=this.onMouseDown;
        obj.onMouseUp=this.onMouseUp;
        obj.onClick = this.onClick;
        obj.onDoubleClick = this.onDoubleClick;
        return obj;
    }
    GameObject.prototype.resetForce=function()
    {
        this.F.x=0;
        this.F.y=0
    }
    GameObject.prototype.resetConstantForce=function()
    {
        this.constantForce.x=0;
        this.constantForce.y=0;
    }
    GameObject.prototype.force=function(a,b,c)
    {
        if(a instanceof Force)
        {
            if(b)
            {
                this.constantForce.x+=a.x;
                this.constantForce.y+=a.y;
                return this.constantForce;
            }
            this.F.x+=a.x;
            this.F.y+=a.y;
            return this.F;
        }
        else if(isNaN(a)||isNaN(b))
        {
            throw new Error("Paramate must be a Number.");
        }
        else
        {
            if(c)
            {
                this.constantForce.x+=a;
                this.constantForce.y+=b;
                return this.constantForce;
            }
            this.F.x+=a;
            this.F.y+=b;
            return this.F;
        }
    }
    GameObject.prototype.addMomenta=function(p)
    {
         
    }
    GameObject.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        if(this.graphic)
            this.graphic.drawToCanvas(canvas,x,y,r,dt);
    }
    GameObject.prototype.render = function (graphics, x, y, r, dt)
    {
        if (this._animCallback)
            this._animCallback(dt);
        if (this.graphic)
            this.graphic.render(graphics, x, y, r, dt);
    }
    GameObject.prototype.setCenter=function(x,y)
    {
        this.position.x = x;
        this.position.y = y;
    }
    GameObject.prototype.moveTo=function(x,y)
    {
        if(this.graphic)
        {
            this.graphic.moveTo(this.graphic.position.x-this.position.x+x,this.graphic.position.y-this.position.y+y);
        }
        if(this.collider && this.collider!=this.graphic)
        {
            this.collider.moveTo(this.collider.position.x-this.position.x+x,this.collider.position.y-this.position.y+y);
        }
        this.position.x=x;
        this.position.y=y;
    }
    GameObject.prototype.moveAnimateTo = function (x, y, t, callback)
    {
        var startPosition = this.position.copy();
        var time = 0;
        var gameObject = this;
        this._animCallback = function (dt)
        {
            time += dt;
            if (time >= t)
                time = t;
            gameObject.moveTo((x - startPosition.x) / t * time + startPosition.x, (y - startPosition.y) / t * time + startPosition.y);
            if(time == t )
            {
                gameObject._animCallback = null;
                if (callback)
                    callback();
            }
        }
    }
    engine.GameObject=GameObject;
    window.GameObject = GameObject;

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    //-------Colliders
    function Colliders() { }

    //-------Circle
    function Circle (x,y,r)
    {
        if(!x||!y)
        {
            x=0;
            y=0;
        }
        if(!r)
            r=0;
        this.r=r;
        this.o=new Point(x,y);
        this.center=new Point(x,y);
        this.position=this.center
        this.strokeWidth=1;
        this.strokeStyle=new Color(0,0,0,1);
        this.fillStyle=new Color(255,255,255,1);
    }
    Circle.prototype.copy=function()
    {
        var circle=new Circle(this.o.x,this.o.y,this.r);
        circle.setCenter(this.center.x,this.center.y);
        circle.strokeWidththis.strokeWidth;
        if(this.strokeStyle instanceof Color)
            circle.strokeStyle=this.strokeStyle.copy();
        else
            circle.strokeStyle=this.strokeStyle;
        if(this.fillStyle instanceof Color)
            circle.fillStyle=this.fillStyle.copy();
        else
            circle.fillStyle=this.fillStyle;
        return circle;
    }
    Circle.prototype.setCenter=function(x,y)
    {
        this.center.x=x;
        this.center.y=y;
    }
    Circle.prototype.moveTo=function(x,y)
    {
        if(x==this.center.x&&y==this.center.y)
            return;
        this.o.x=this.o.x-this.center.x+x;
        this.o.y=this.o.y-this.center.y+y;
        this.center.x=x;
        this.center.y=y;
    }
    Circle.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
         var ctx=canvas.getContext("2d");
         ctx.beginPath();
         ctx.arc(this.position.x,this.position.y,this.r,0,2*Math.PI);
         ctx.lineWidth=this.strokeWidth;
         ctx.strokeStyle=this.strokeStyle;
         ctx.fillStyle=this.fillStyle;
         ctx.fill();
         ctx.stroke();
    }
    Circle.prototype.render = function (graphics, x, y, r, dt)
    {
        graphics.beginPath();
        graphics.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
        graphics.lineWidth = this.strokeWidth;
        graphics.strokeStyle = this.strokeStyle;
        graphics.fillStyle = this.fillStyle;
        graphics.fill();
        graphics.stroke();
    }
    Circle.prototype.isCross=function(obj)
    {
        if(obj instanceof Line)
        {
            return obj.isCross(this);
        }
        else if(obj instanceof Circle)
        {
            return this.isCollideWith(obj);
        }
    }
    Circle.prototype.isCollideWith=function (col)
    {
        if(col instanceof Polygon)
        {
            for(var i=0;i<col.E.length;i++)
            {
                if(col.E[i].isCross(this))
                    return true;
            }
            return false;
        }
        else if(col instanceof Circle)
        {
            var dx=this.center.x-col.center.x;
            var dy=this.center.y-col.center.y;
            var d=dx*dx+dy*dy;
            if((this.r-col.r)*(this.r-col.r)<=d && d<=(this.r+col.r)*(this.r+col.r))
                return true;
            return false;
        }
    }
    Colliders.Circle = Circle;
    window.Circle=Circle;

    //-------Polygon
    function Polygon (v)
    {
        if(!(v instanceof Array))
            throw new Error("Paramater v must be a array of points");
        this.E=new Array();
        this.V=new Array();
        this.strokeWidth=1;
        this.strokeStyle=new Color(0,0,0,1);
        this.fillStyle=new Color(255,255,255,1);
        this.V=v;
        this.E=new Array();
        var sumX=0,sumY=0;
        for(var i=0;i<v.length;i++)
        {
            sumX+=v[i].x;
            sumY+=v[i].y;
            var j=(i+1)%v.length;
            this.E[i]=new Line(v[i],v[j]);
        }
        this.center=new Point(sumX/v.length,sumY/v.length);
        this.position=this.center;
    }
    Polygon.createRect=function (x,y,width,height)
    {
        var v=[];
        v[0]=new Point(x,y);
        v[1]=new Point(x+width,y);
        v[2]=new Point(x+width,y+height);
        v[3]=new Point(x,y+height);
        return new Polyon(v);
    }
    /*
    Polygon.prototype.addLine=function(l)
    {
        if(!(l instanceof Line))
            throw "paramter is not a line.";
        if(!(this.E instanceof Array))
        {
            this.E=new Array();
        }
        this.E[this.E.length]=l;
        l.polygon=this;
        if(!(this.V instanceof Array))
        {
            this.V=new Array();
        }
        var existed=false;
        for(var i=0;i<this.V.length;i++)
        {
            if(this.V[i].x==l.p1.x && this.V[i].y==l.p1.y)
            {
                existed=true;
                break;
            }
        }
        if(!existed)
            this.V[this.V.length]=l.p1;
        existed=false;
        for(var i=0;i<this.V.length;i++)
        {
            if(this.V[i].x==l.p2.x && this.V[i].y==l.p2.y)
            {
                existed=true;
                break;
            }
        }
        if(!existed)
            this.V[this.V.length]=l.p2;
    }
    */
    Polygon.prototype.copy=function()
    {
        var v=[];
        for(var i=0;i<this.V.length;i++)
        {
            v[i]=new Point(this.V[i].x,this.V[i].y);
        }
        var pol=new Polygon(v);
        pol.strokeWidth=this.strokeWidth;
        if(this.strokeStyle instanceof Color)
            pol.strokeStyle=this.strokeStyle.copy();
        else
            pol.strokeStyle=this.strokeStyle;

        if(this.fillStyle instanceof Color)
            pol.fillStyle=this.fillStyle.copy();
        else
            pol.fillStyle=this.fillStyle;

        pol.setCenter(this.center.x,this.center.y);
        return pol;
    }
    Polygon.prototype.moveTo=function (x,y)
    {
        for(var i=0;i<this.V.length;i++)
        {
            this.V[i].x=(this.V[i].x-this.center.x)+x;
            this.V[i].y=(this.V[i].y-this.center.y)+y;
        }
        this.center.x=x;
        this.center.y=y;
    }
    Polygon.prototype.setCenter=function(x,y)
    {
        this.center.x=x;
        this.center.y=y;
    }
    Polygon.prototype.isCollideWith=function(col)
    {
        if(!(col instanceof Polygon) && !(col instanceof Circle))
            throw new Error("The parameter is not a collider");
        if(!(this.E instanceof Array))
        {
            throw new Error("Something wrong with this polygon");
        }
        if(col instanceof Polygon)
        {
            if(!(col.E instanceof Array))
            {
                throw new Error("Something wrong with the polygon");
            }
            for(var i=0;i<this.E.length;i++)
                for(var j=0;j<col.E.length;j++)
                {
                    
                    if(this.E[i].isCross(col.E[j]))
                    {
                        //Graphics.drawLine(this.E[i], "red");
                        //Graphics.drawLine(col.E[j], "red");
                        return true;
                    }
                }
            return false;
        }
        else if(col instanceof Circle)
        {
            for(var i=0;i<this.E.length;i++)
            {
                if(this.E[i].isCross(col))
                    return true;
            }
            return false;
        }
        return false;
    }
    Polygon.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        var ctx=canvas.getContext("2d");
        ctx.beginPath();
        if(this.V.length<3)
            throw new Error("The polygen must contains at least 3 points.");
        ctx.moveTo(this.V[0].x,this.V[0].y);
        for(var i=1;i<this.V.length;i++)
            ctx.lineTo(this.V[i].x,this.V[i].y);
        ctx.lineTo(this.V[0].x,this.V[0].y);
        ctx.lineWidth=this.strokeWidth;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillStyle=this.fillStyle;
        ctx.fill();
        ctx.stroke();
    }
    Polygon.prototype.render = function (graphics, x, y, r, dt)
    {
        graphics.beginPath();
        if (this.V.length < 3)
            throw new Error("The polygen must contains at least 3 points.");
        graphics.moveTo(this.V[0].x, this.V[0].y);
        for (var i = 1; i < this.V.length; i++)
            graphics.lineTo(this.V[i].x, this.V[i].y);
        graphics.lineTo(this.V[0].x, this.V[0].y);
        graphics.lineWidth = this.strokeWidth;
        graphics.strokeStyle = this.strokeStyle;
        graphics.fillStyle = this.fillStyle;
        graphics.fill();
        graphics.stroke();
    }
    Colliders.Polygon = Polygon;
    window.Polygon = Polygon;

    //-------Rectangle
    function Rectangle(w,h)
    {
        w=isNaN(w)?0:w;
        h=isNaN(h)?0:h;
        this.width=w;
        this.height=h;
        this.o=new Point(0,0);
        this.position=new Point(0,0);
        this.rigidBody=false;
        this.bounce=1;
        this.dff=0;//dynamic friction factor
        this.static=false;
        this.soft=true;
        this.landed=false;
        this.fillStyle=new Color(255,255,255,1);
        this.strokeStyle=new Color(0,0,0,1);
    }
    Rectangle.prototype.copy=function()
    {
        var rect=new Rectangle(this.width,this.height);
        rect.o=this.o.copy();
        rect.position=this.position.copy();
        rect.rigidBody=this.rigidBody;
        rect.bounce=this.bounce;
        rect.dff=this.dff;
        rect.static=this.static;
        rect.soft=this.soft;
        rect.landed=this.landed;
        if(this.strokeStyle instanceof Color)
            rect.strokeStyle=this.strokeStyle.copy();
        else
            rect.strokeStyle=this.strokeStyle;
        if(this.fillStyle instanceof Color)
            rect.fillStyle=this.fillStyle.copy();
        else
            rect.fillStyle=this.fillStyle;
        return rect;
    }
    Rectangle.prototype.setCenter=function(x,y,align)
    {
        this.position.x=x;
        this.position.y=y;
        this.o.x=this.position.x-align(this.width,this.height).x;
        this.o.y=this.position.y+align(this.width,this.height).y;
    }
    Rectangle.prototype.moveTo=function(x,y)
    {
        this.o.x+=x-this.position.x;
        this.o.y+=y-this.position.y;
        this.position.x=x;
        this.position.y=y;
    }
    Rectangle.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        var ctx=canvas.getContext("2d");
        ctx.fillStyle=this.fillStyle;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillRect(this.o.x,this.o.y,this.width,this.height);
        ctx.strokeRect(this.o.x,this.o.y,this.width,this.height);
    }
    Rectangle.prototype.render = function (graphic, x, y, r, dt)
    {
        graphic.fillStyle = this.fillStyle;
        graphic.strokeStyle = this.strokeStyle;
        graphic.fillRect(this.o.x, this.o.y, this.width, this.height);
        graphic.strokeRect(this.o.x, this.o.y, this.width, this.height);
    }
    Rectangle.prototype.isCollideWith=function(obj)
    {
        if (obj instanceof Ground)
        {
            return (!(this.o.x > obj.xR || this.o.x + this.width < obj.xL) && (this.o.y >= obj.y && obj.y >= this.o.y - this.height));
        }
        else if (obj instanceof Wall)
        {
            return (!(this.o.y - this.height > obj.yH || this.o.y < obj.yL) && (this.o.x <= obj.x && obj.x <= this.o.x + this.width));
        }
        else if (obj instanceof Rectangle)
        {
            var x1 = (obj.o.x - this.o.x) * (obj.o.x + obj.width - this.o.x);
            var x2 = (obj.o.x - (this.o.x + this.width)) * (obj.o.x + obj.width - (this.o.x + this.width));
            var y1 = (obj.o.y - this.o.y) * (obj.o.y + obj.height - this.o.y);
            var y2 = (obj.o.y - (this.o.y + this.height)) * (obj.o.y + obj.height - (this.o.y + this.height));
            if (obj.o.x + obj.width < this.o.x || this.o.x + this.width < obj.o.x ||
               obj.o.y - obj.height > this.o.y || this.o.y - this.height > obj.o.y)
            {
                return false;
            }
            else
                return true;
        }
        else if (obj instanceof Point)
        {
            if (this.o.x <= obj.x && obj.x <= this.o.x + this.width && obj.y <= this.o.y && this.o.y - this.height<=obj.y)
                return true;
            else
                return false;
        }
    }
    Rectangle.collide=function(main,obj,dt)
    {
        if(main.collider.static&&obj.collider.static)
            return;
        if(main.onCollide)
        {
            var e=new GameObject.CollideEventArgs(main,obj);
            e.relativeV=new Vector2(obj.v.x-main.v.x,obj.v.y-main.v.y);
            main.onCollide(e);
        }
        if(obj.onCollide)
        {
            var e=new GameObject.CollideEventArgs(obj,main);
            e.relativeV=new Vector2(main.v.x-obj.v.x,main.v.y-obj.v.y);
            obj.onCollide(e);
        }
        if(obj.collider instanceof Rectangle)
        {
            var dx=-1,dy=-1;
            if(obj.v.x-main.v.x<0)
            {
                dx=Math.abs(main.collider.o.x+main.collider.width-obj.collider.o.x);
            }
            else if(obj.v.x-main.v.x>0)
            {
                dx=Math.abs(obj.collider.o.x+obj.collider.width-main.collider.o.x);
            }
            else if(obj.v.x-main.v.x==0)
            {
                dx=Math.min(Math.abs(main.collider.o.x+main.collider.width-obj.collider.o.x),Math.abs(obj.collider.o.x+obj.collider.width-main.collider.o.x));
            }
            if(obj.v.y-main.v.y<0)
            {
                dy=Math.abs(main.collider.o.y-(obj.collider.o.y-obj.collider.height));
            }
            else if(obj.v.y-main.v.y>0)
            {
                dy=Math.abs(obj.collider.o.y-(main.collider.o.y-main.collider.height));
            }
            else if(obj.v.y-main.v.y==0)
            {
                dy=Math.min(Math.abs(main.collider.o.y-(obj.collider.o.y-obj.collider.height)),Math.abs(obj.collider.o.y-(main.collider.o.y-main.collider.height)));
            }
            if((dx>=0&&dx<=dy) || dy<0)
            {
                var v1=obj.v.x-main.v.x;
                var v2=0;
                if(!main.collider.static&&!obj.collider.static)
                {
                    v2=2*obj.mass*v1/(obj.mass+main.mass);
                    v1=(obj.mass-main.mass)*v1/(obj.mass+main.mass);
                    v2+=main.v.x;
                    v1+=main.v.x;
                }
                else if(main.collider.static)
                {
                    
                    v1=-obj.v.x*obj.collider.bounce;
                    v2=main.v.x;
                }
                else
                {
                    v1=obj.v.x;
                    v2=-main.v.x*main.collider.bounce;
                }
                var t=dx/Math.abs(main.v.x-obj.v.x);
                t=isNaN(t)?0:t;
                t>dt?dt:t;
                if(!main.collider.soft||!obj.collider.soft)
                {
                    main.moveTo(main.position.x-(main.v.x*t)+(v2*(dt-t)),main.position.y);
                    obj.moveTo(obj.position.x-(obj.v.x*t)+(v1*(dt-t)),obj.position.y);
                }
                main.v.x=v2;
                obj.v.x=v1;
            }
            else if((dy>=0&&dy<=dx) || dx<0)
            {
                var v1=obj.v.y-main.v.y;
                var v2=0;
                if(!main.collider.static&&!obj.collider.static)
                {
                    v2=2*obj.mass*v1/(obj.mass+main.mass);
                    v1=(obj.mass-main.mass)*v1/(obj.mass+main.mass);
                    v2+=main.v.y;
                    v1+=main.v.y;
                }
                else if(main.collider.static)
                {
                    v1=-obj.v.y*obj.collider.bounce;
                    v2=main.v.y;
                    if(obj.v.y<=0&&obj.gravity)
                        obj.collider.landed=true;
                }
                else
                {
                    v1=obj.v.y;
                    v2=-main.v.y*main.collider.bounce;
                    if(main.v.y<=0&&main.gravity)
                        main.collider.landed=true;
                }
                var t=dy/Math.abs(main.v.y-obj.v.y);
                t=isNaN(t)?0:t;
                t>dt?dt:t;
                if(!main.collider.soft||!obj.collider.soft)
                {
                    main.moveTo(main.position.x,main.position.y-(main.v.y*t)+(v2*(dt-t)));
                    obj.moveTo(obj.position.x,obj.position.y-(obj.v.y*t)+(v1*(dt-t)));
                }
                main.v.y=v2;
                obj.v.y=v1;
            }
        }
        else if(obj.collider instanceof Ground)
        {
            if(main.collider.o.y-main.collider.height<=obj.collider.y)
            {
                var t=(main.collider.o.y-main.collider.height-obj.collider.y)/main.v.y;
                t=isNaN(t)?0:t;
                main.moveTo(main.position.x,main.position.y-main.v.y*t);
                main.v.y=-main.v.y*main.collider.bounce;
                if(main.gravity)
                    main.collider.landed=true;
            }
        }
        else if (obj.collider instanceof Wall)
        {
            
        }
    }
    Colliders.Rectangle = Rectangle;
    window.Rectangle = Rectangle;

    //-------Ground
    function Ground(y, xL, xR)
    {
        xL = isNaN(xL) ? 0 : xL;
        xR = isNaN(xR) ? Number.MAX_SAFE_INTEGER : xR;
        this.position = new Point(xL, y);
        this.y = y;
        this.width = xR - xL;
        this.xL = xL;
        this.xR = xR;
        this.static = true;
        this.rigidBody = true;
    }
    Ground.prototype.copy=function()
    {
        var g=new Ground(this.y,this.xL,this.xR);
        g.rigidBody=this.rigidBody;
        g.static = this.static;
        g.position=this.position.copy();
        return g;
    }
    Ground.prototype.moveTo=function(x,y)
    {
        this.y=y;
        this.position.x=x;
        this.position.y=y;
    }
    Ground.prototype.setCenter = function (x, y, align)
    {
        this.y = y;
        this.xL = x - align(this.xR - this.xL).x;
        this.xR = this.xL + this.width;
    }
    Ground.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        return;
        var ctx=canvas.getContext("2d");
        ctx.fillStyle=this.fillStyle;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillRect(this.center.x,this.center.y,canvas.width,this.height);
        ctx.strokeRect(this.center.x,this.center.y,canvas.width,this.height);
    }
    Ground.prototype.render = function (graphics, x, y, r, dt)
    {
        return;
    }
    Ground.prototype.toGameObject=function()
    {
        var obj=new GameObject();
        obj.collider=this;
        obj.graphic=this;
        obj.mass=1;
        obj.gravity=false;
        return obj;
    }
    Ground.prototype.isCollideWith=function(col)
    {
        if(col instanceof Rectangle)
            return col.isCollideWith(this);
    }
    Ground.collide=function(ground,obj,dt)
    {
        if(obj.collider instanceof Rectangle)
            return Rectangle.collide(obj,ground,dt);
    }
    Colliders.Ground = Ground;
    window.Ground = Ground;

    //-------Wall
    function Wall(x, yL, yH)
    {
        yL = isNaN(yL) ? 0 : yL;
        yH = isNaN(yH) ? Number.MAX_SAFE_INTEGER : yH;
        this.x = x;
        this.height = yH - yL;
        this.yL = yL;
        this.yH = yH;
        this.static = true;
        this.rigidBody = true;
        this.position = new Point(x, yL);
    }
    Wall.prototype.copy = function ()
    {
        var w = new Wall(this.x, this.yL, this.yH);
        w.rigidBody = this.rigidBody;
        w.static = this.static;
        w.position = this.position.copy();
    }
    Wall.prototype.toGameObject = function ()
    {
        var obj = new GameObject();
        obj.collider = this;
        obj.graphic = this;
        obj.mass = 1;
        obj.gravity = false;
        return obj;
    }
    Wall.prototype.setCenter = function (x, y, align)
    {
        this.x = x;
        this.yH = y + align(this.height);
        this.yL = this.yH - this.height;
        this.position.x = x;
        this.position.y = y;
    }
    Wall.prototype.moveTo = function (x, y)
    {
        this.x += (x - this.position.x);
        this.yH += (y - this.position.y);
        this.yL += (y - this.position.y);
        this.position.x = x;
        this.position.y = y;
    }
    Wall.prototype.isCollideWith = function (col)
    {
        if(col instanceof Rectangle )
            return col.isCollideWith (this);
    }
    Colliders.Wall = Wall;
    window.Wall = Wall;

    function OneWayGround()
    {

    }


    engine.Colliders=Colliders;
    window.Colliders=Colliders;
    sar.Web.Engine2D=engine;
    return sar;
}catch(ex){console.warn(ex.message);}
})(window.SardineFish);