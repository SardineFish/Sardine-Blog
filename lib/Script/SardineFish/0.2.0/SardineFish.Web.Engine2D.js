window.SardineFish = (function (sar)
{
    try
    {
        if (!sar)            sar = function () { };        sar.Version = 0.20;        sar.Web = (function (web)
        {
            if (!web)                web = function () { };            return web;
        })(sar.Web);        window.requestAnimationFrame =            window.requestAnimationFrame ||            window.mozRequestAnimationFrame ||            window.webkitRequestAnimationFrame ||            window.msRequestAnimationFrame;        sar.Web.Engine2D = (function (engine)
        {
            if (!engine)                engine = {};            return engine;
        })(sar.Web.Engine2D);        engine = sar.Web.Engine2D;        engine.debug = function () { }        engine.onError = null;        engine.debug.write = null;        engine.debug.writeLine = function (text, canvas)
        {
            if (!engine.debug.write)                return;            engine.debug.write(text + "\r\n");
        }        engine.debug.clear = null;        //-------LinkList        function LinkList()
        {
            this.head = null;            this.tail = null;            this.count = 0;
        }        LinkList.version = 1.2;        LinkList.Node = function (obj, last, next)
        {
            this.object = obj;            if (last)                this.last = last;            else                this.last = null;            if (next)                this.next = next;            else                this.next = null;
        }        LinkList.prototype.add = function (obj)
        {
            if (this.count <= 0)
            {
                this.head = new LinkList.Node(obj, null, null);                this.head.parent = this;                this.tail = this.head;                this.count = 1;                return this.head;
            }            var node = new LinkList.Node(obj, this.tail, null);            node.parent = this;            this.tail.next = node            this.tail = node;            this.count++;            return node;
        }        LinkList.prototype.remove = function (node)
        {
            if (!(node instanceof LinkList.Node))
            {
                for (var p = this.head ; p != null; p = p.next)
                {
                    if (p.object == node)                        node = p;
                }
            }            if (node.parent != this)
            {
                throw new Error("The node doesn't belong to this link list");
            }            if (node.last == null)
            {
                this.head = node.next;
            }            else                node.last.next = node.next;            if (node.next == null)
            {
                this.tail = node.last;
            }            else                node.next.last = node.last;            this.count--;
        }        LinkList.prototype.foreach = function (callback)
        {
            if (!callback)                throw new Error("A callback function is require.");            var p = this.head;            for (var p = this.head; p; p = p.next)
            {
                var br = callback(p.object, p);                if (br)                    return;
            }
        }        LinkList.prototype.toArray = function ()
        {
            var ar = [];            var i = 0;            this.foreach(function (obj, node)
            {
                ar[i] = obj;                i++;
            });            return ar;
        }        if (!sar.Web.LinkList || !sar.Web.LinkList.version || sar.Web.LinkList.version < LinkList.version)
        {
            sar.Web.LinkList = LinkList;            window.LinkList = LinkList;
        }        //-------Align        function Align() { }        Align.topLeft = function (w, h)
        {
            return new Point(0, 0);
        }        Align.topCenter = function (w, h)
        {
            return new Point(w / 2, 0);
        }        Align.topRight = function (w, h)
        {
            return new Point(w, 0);
        }        Align.middleLeft = function (w, h)
        {
            return new Point(0, h / 2);
        }        Align.center = function (w, h)
        {
            return new Point(w / 2, h / 2);
        }        Align.middleRight = function (w, h)
        {
            return new Point(w, h / 2);
        }        Align.bottomLeft = function (w, h)
        {
            return new Point(0, h);
        }        Align.bottomCenter = function (w, h)
        {
            return new Point(w / 2, h);
        }        Align.bottomRight = function (w, h)
        {
            return new Point(w, h);
        }        window.Align = Align;        //-------Force        function Force(x, y, f)
        {
            this.x = 0;            this.y = 0;            if (x == undefined)                return;            if (x instanceof Vector2)
            {
                this.x = x.x;                this.y = x.y;
            }            else if (f)
            {
                var l = Math.sqrt(x * x + y * y);                this.x = x * f / l;                this.y = y * f / l;
            }            else
            {
                this.x = x;                this.y = y;
            }
        }        Force.prototype.copy = function ()
        {
            return new Force(this.x, this.y, this.f);
        }        Force.prototype.toString = function ()
        {
            return "(" + this.x + "," + this.y + ")";
        }        Force.prototype.getValue = function ()
        {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }        Force.prototype.toAcceleration = function (m)
        {
            return new Vector(this.x / m, this.y / m);
        }        engine.Force = Force;        window.Force = Force;        //-------Mouse        function Mouse() { }        Mouse.Buttons = {};        Mouse.Buttons.Left = 0;        Mouse.Buttons.Middle = 1;        Mouse.Buttons.Right = 2;        Mouse.ButtonState = {};        Mouse.ButtonState.None = 0;        Mouse.ButtonState.Pressed = 1;        Mouse.ButtonState.Released = 2;        Mouse.ButtonState.Click = 3;        Mouse.ButtonState.DoubleClick = 4;        function MouseEventArgs()
        {
            this.x = 0;            this.y = 0;            this.button = null;            this.buttonState = Mouse.ButtonState.None;            this.handled = false;
        }        Mouse.MouseEventArgs = MouseEventArgs;        engine.Mouse = Mouse;        window.Mouse = Mouse;        function Touch() { }        Touch.Types = {};        Touch.Types.None = 0;        Touch.Types.Start = 1;        Touch.Types.Move = 2;        Touch.Types.End = 3;        function TouchEventArgs()
        {
            this.x = 0;            this.y = 0;            this.type = Touch.Types.None;            this.touches = null;            this.id = 0;            this.handled = false;
        }        TouchEventArgs.prototype.copy = function ()
        {
            var args = new TouchEventArgs();            args.x = this.x;            args.y = this.y;            args.type = this.type;            args.touches = this.touches;            args.id = this.id;            args.handled = this.handled;            return args;
        }        Touch.TouchEventArgs = TouchEventArgs;        engine.Touch = Touch;        window.Touch = Touch;        //-------Keyboard        function Keyboard() { }        Keyboard.Keys = (function (keys)
        {
            keys = {};            keys.BackSpace = 8;            keys.Tab = 9;            keys.Clear = 12;            keys.Enter = 13;            keys.Shift = 16;            keys.Control = 17;            keys.Alt = 18;            keys.Pause = 19;            keys.CapsLock = 20;            keys.Escape = 27;            keys.Space = 32;            keys.Prior = 33;            keys.Next = 34;            keys.End = 35;            keys.Home = 36;            keys.Left = 37;            keys.Up = 38;            keys.Right = 39;            keys.Down = 40;            keys.Select = 41;            keys.Print = 42;            keys.Execute = 43;            keys.Insert = 45;            keys.Delete = 46;            keys.Help = 47;            keys.Num0 = 48;            keys.Num1 = 49;            keys.Num2 = 50;            keys.Num3 = 51;            keys.Num4 = 52;            keys.Num5 = 53;            keys.Num6 = 54;            keys.Num7 = 55;            keys.Num8 = 56;            keys.Num9 = 57;            keys.A = 65;            keys.B = 66;            keys.C = 67;            keys.D = 68;            keys.E = 69;            keys.F = 70;            keys.G = 71;            keys.H = 72;            keys.I = 73;            keys.J = 74;            keys.K = 75;            keys.L = 76;            keys.M = 77;            keys.N = 78;            keys.O = 79;            keys.P = 80;            keys.Q = 81;            keys.R = 82;            keys.S = 83;            keys.T = 84;            keys.U = 85;            keys.V = 86;            keys.W = 87;            keys.X = 88;            keys.Y = 89;            keys.Z = 90;            keys.KP0 = 96;            keys.KP1 = 97;            keys.KP2 = 98;            keys.KP3 = 99;            keys.KP4 = 100;            keys.KP5 = 101;            keys.KP6 = 102;            keys.KP7 = 103;            keys.KP8 = 104;            keys.KP9 = 105;            keys.KPMultiply = 106;            keys.KPAdd = 107;            keys.KPSeparator = 108;            keys.KPSubtract = 109;            keys.KPDecimal = 110;            keys.KPDivide = 111;            keys.F1 = 112;            keys.F2 = 113;            keys.F3 = 114;            keys.F4 = 115;            keys.F5 = 116;            keys.F6 = 117;            keys.F7 = 118;            keys.F8 = 119;            keys.F9 = 120;            keys.F10 = 121;            keys.F11 = 122;            keys.F12 = 123;            keys.F13 = 124;            keys.F14 = 125;            keys.F15 = 126;            keys.F16 = 127;            keys.F17 = 128;            keys.F18 = 129;            keys.F19 = 130;            keys.F20 = 131;            keys.F21 = 132;            keys.F22 = 133;            keys.F23 = 134;            keys.F24 = 135;            keys.NumLock = 136;            keys.ScrollLock = 137;            keys.toString = function (keyCode)
            {
                switch (keyCode)
                {
                    case 8: return "BackSpace";                    case 9: return "Tab";                    case 12: return "Clear";                    case 13: return "Enter";                    case 16: return "Shift";                    case 17: return "Control";                    case 18: return "Alt";                    case 19: return "Pause";                    case 20: return "CapsLock";                    case 27: return "Escape";                    case 32: return "Space";                    case 33: return "Prior";                    case 34: return "Next";                    case 35: return "End";                    case 36: return "Home";                    case 37: return "Left";                    case 38: return "Up";                    case 39: return "Right";                    case 40: return "Down";                    case 41: return "Select";                    case 42: return "Print";                    case 43: return "Execute";                    case 45: return "Insert";                    case 46: return "Delete";                    case 47: return "Help";                    case 48: return "0";                    case 49: return "1";                    case 50: return "2";                    case 51: return "3";                    case 52: return "4";                    case 53: return "5";                    case 54: return "6";                    case 55: return "7";                    case 56: return "8";                    case 57: return "9";                    case 65: return "A";                    case 66: return "B";                    case 67: return "C";                    case 68: return "D";                    case 69: return "E";                    case 70: return "F";                    case 71: return "G";                    case 72: return "H";                    case 73: return "I";                    case 74: return "J";                    case 75: return "K";                    case 76: return "L";                    case 77: return "M";                    case 78: return "N";                    case 79: return "O";                    case 80: return "P";                    case 81: return "Q";                    case 82: return "R";                    case 83: return "S";                    case 84: return "T";                    case 85: return "U";                    case 86: return "V";                    case 87: return "W";                    case 88: return "X";                    case 89: return "Y";                    case 90: return "Z";                    case 96: return "KP0";                    case 97: return "KP1";                    case 98: return "KP2";                    case 99: return "KP3";                    case 100: return "KP4";                    case 101: return "KP5";                    case 102: return "KP6";                    case 103: return "KP7";                    case 104: return "KP8";                    case 105: return "KP9";                    case 106: return "KPMultiply";                    case 107: return "KPAdd";                    case 108: return "KPSeparator";                    case 109: return "KPSubtract";                    case 110: return "KPDecimal";                    case 111: return "KPDivide";                    case 112: return "F1";                    case 113: return "F2";                    case 114: return "F3";                    case 115: return "F4";                    case 116: return "F5";                    case 117: return "F6";                    case 118: return "F7";                    case 119: return "F8";                    case 120: return "F9";                    case 121: return "F10";                    case 122: return "F11";                    case 123: return "F12";                    case 124: return "F13";                    case 125: return "F14";                    case 126: return "F15";                    case 127: return "F16";                    case 128: return "F17";                    case 129: return "F18";                    case 130: return "F19";                    case 131: return "F20";                    case 132: return "F21";                    case 133: return "F22";                    case 134: return "F23";                    case 135: return "F24";                    case 136: return "NumLock";                    case 137: return "ScrollLock";                    default: return "Unknown";
                }
            }            return keys;
        })(Keyboard.Keys);        Keyboard.KeyState = {};        Keyboard.KeyState.None = 0;        Keyboard.KeyState.Down = 1;        Keyboard.KeyState.Up = 2;        Keyboard.KeyState.Pressed = 3;        function KeyEventArgs()
        {
            this.key = 0;            this.keyName = "Unknown";            this.keyState = Keyboard.KeyState.None;            this.ctrl = false;            this.alt = false;            this.shift = false;            this.handled = false;
        }        Keyboard.KeyEventArgs = KeyEventArgs;        engine.Keyboard = Keyboard;        window.Keyboard = Keyboard;        function int(x)
        {
            return parseInt(x);
        }        function keyCodeToKey(keyCode)
        {
        }        //-------Game        function Game()
        {
            this.fps = 0;            this.scene = null;            this.animationFrameId = null;            this.started = false;            this.onStart = null;            this.onUpdate = null;            this.onPause = null;            this.onResume = null;            this.onEnd = null;            this.graphics = null;            this.eventSource = null;
        }        Game.createByCanvas = function (canvas)
        {
            var game = new Game();            game.graphics = new Graphics(canvas);            game.eventSource = canvas;            game.scene = new Scene();            game.setScene(game.scene);            var camera = new Camera(0, 0, 0, 0, 1);            camera.graphics = game.graphics;            game.scene.camera = camera;            return game;
        }        Game.prototype.setScene = function (scene)
        {
            this.scene = scene;            this.scene.eventSource = this.eventSource;            scene.initEvents();            scene.game = this;
        }        Game.prototype.start = function ()
        {
            var error = null;
            var game = this;            var lastDelay = 0;            var firstFrame = true;            function animationFrame(delay)
            {                try{                if (!game.started)
                {
                    if (game.onEnd)                        game.onEnd();                    return;
                }                var x = delay;                delay = delay - lastDelay;                //delay = 30;                lastDelay = x;                if (firstFrame)
                {
                    firstFrame = false;                    game.animationFrameId = requestAnimationFrame(animationFrame);                    return;
                }                if (engine.debug.clear)                    engine.debug.clear();                game.fps = int(1000 / delay);                engine.debug.writeLine("fps=" + game.fps);                if (game.onUpdate)                    game.onUpdate(delay, this);                game.scene.updateFrame(delay);                }                catch(ex)                {                    error=ex;                }                game.animationFrameId = requestAnimationFrame(animationFrame);                if (error && engine.onError)                    engine.onError(ex.message);
                else if (error)
                    throw error;

            }            if (!this.scene)                return false;            this.animationFrameId = requestAnimationFrame(animationFrame);            this.started = true;
        }        Game.prototype.end = function ()
        {
            this.started = false;
        }        engine.Game = Game;        window.Game = Game;        //-------Scene        function Scene()
        {
            this.game = null;            this.objectList = new LinkList();            this._objList = new Array();            this._objList.n = 0;            this.physics = new Scene.Physics();            this.camera = null;            this.GUI = null;            this.doubleClickDelay = 200;            this.eventSource = null;            this.onMouseMove = null;            this.onMouseOver = null;            this.onMouseOut = null;            this.onMouseDown = null;            this.onMouseUp = null;            this.onClick = null;            this.onDoubleClick = null;            this.onKeyDown = null;            this.onKeyUp = null;            this.onKeyPress = null;            this.onTouchStart = null;            this.onTouchMove = null;            this.onTouchEnd = null;            this._objList.add = function (node)
            {
                this[this.n] = node;                return this.n++;
            }
        }        Scene.Physics = function ()
        {
            this.g = new Vector2(0, 0);            this.f = 0;
        }        Scene.Physics.prototype.copy = function ()
        {
            var phy = new Scene.Physics();            phy.g = this.g.copy();            phy.f = this.f;            return phy;
        }        Scene.Physics.prototype.reset = function ()
        {
            return;
        }        Scene.prototype.reset = function ()
        {
            this.camera = null;            this.objectList = new LinkList();            this._objList = new Array();            this._objList.n = 0;            if (this.physics)                this.physics.reset();            this._objList.add = function (node)
            {
                this[this.n] = node;                return this.n++;
            }
        }        Scene.prototype.physicalSimulate = function (dt)
        {
            var scene = this;            this.objectList.foreach(function (obj, node)
            {
                obj.a.x = (obj.F.x + obj.constantForce.x) / obj.mass;                obj.a.y = (obj.F.y + obj.constantForce.y) / obj.mass;                if (obj.gravity && (!obj.collider || !obj.collider.landed))
                {
                    obj.a.x += scene.physics.g.x;                    obj.a.y += scene.physics.g.y;
                }                obj.moveTo(obj.position.x + obj.v.x * dt + 0.5 * obj.a.x * dt * dt, obj.position.y + obj.v.y * dt + 0.5 * obj.a.y * dt * dt);                obj.v.x += obj.a.x * dt;                obj.v.y += obj.a.y * dt;                obj.resetForce();                if (obj.collider)                    obj.collider.landed = false;
            });            this.objectList.foreach(function (obj, node)
            {                //try{                if (obj.collider && obj.collider.rigidBody)
                {
                    for (p = node.next; p; p = p.next)
                    {
                        var target = p.object;                        if (target.collider && target.collider.rigidBody)
                        {
                            if (obj.collider.isCollideWith(target.collider))
                            {
                                obj.collider.collide(obj, target, dt);
                            }
                        }
                    }
                }                //}catch(ex){ alert("collide:"+ex.message);}            });
        }        Scene.prototype.render = function (dt)
        {
            var scene = this;            if (!this.game.graphics)                throw new Error("Game cannot render on a null");            if (!this.camera)                return;            scene.camera.clear();            //scene.camera.graphics.clearRect(scene.camera.center.x - scene.camera.width / 2, scene.camera.center.y + scene.camera.height / 2, scene.camera.width, scene.camera.height);            this.objectList.foreach(function (obj, node)
            {                //alert(obj.graphic.r);                if (obj.onRender)                    obj.onRender(obj, dt);                obj.render(scene.camera.graphics, obj.position.x, obj.position.y, 0, dt);                //obj.drawToCanvas(scene.game.graphics.canvas, obj.position.x, obj.position.y, 0, dt);            });            if (!scene.GUI)                return;            scene.camera.resetTransform();            scene.GUI.render(scene.camera.graphics);
        }        Scene.prototype.updateFrame = function (delay)
        {
            var scene = this;            var dt = delay / 1000;            //dt=0.016;            this.objectList.foreach(function (obj, node)
            {
                if (obj.deleted)                    return;                if (obj.onUpdate)                    obj.onUpdate(obj, dt);
            });            //this.render(dt);            this.physicalSimulate(dt);            this.render(dt);
        }        Scene.prototype.initEvents = function ()
        {
            var scene = this;            var pressedKeyList = [];            var touchArray = [];            var touchArrayGUI = [];            var touchList = new LinkList();            var touchListGUI = new LinkList();            var clickTime = 0;            this.eventSource.addEventListener("mousemove", function (e)
            {
                var args = new MouseEventArgs();                args.button = e.button;                args.buttonState = Mouse.ButtonState.None;                args.handled = false;                args.x = e.pageX;                args.y = e.pageY;                if (scene.GUI)                    scene.GUI.mouseMoveCallback(e);                if (args.handled)                    return;                /*args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);                args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);*/                args.x = scene.camera.map(e.pageX, e.pageY).x;                args.y = scene.camera.map(e.pageX, e.pageY).y;                if (scene.onMouseMove)                    scene.onMouseMove(args);
            });            this.eventSource.addEventListener("mouseover", function (e)
            {
                var args = new MouseEventArgs();                args.x = scene.camera.map(e.pageX, e.pageY).x;                args.y = scene.camera.map(e.pageX, e.pageY).y;                args.button = e.button;                args.buttonState = Mouse.ButtonState.None;                args.handled = false;                if (scene.onMouseOver)                    scene.onMouseOver(args);
            });            this.eventSource.addEventListener("mouseout", function (e)
            {
                var args = new MouseEventArgs();                args.x = scene.camera.map(e.pageX, e.pageY).x;                args.y = scene.camera.map(e.pageX, e.pageY).y;                args.button = e.button;                args.buttonState = Mouse.ButtonState.None;                args.handled = false;                if (scene.onMouseOut)                    scene.onMouseOut(args);
            });            this.eventSource.addEventListener("mousedown", function (e)
            {
                var args = new MouseEventArgs();                args.button = e.button;                args.buttonState = Mouse.ButtonState.Pressed;                args.handled = false;                args.x = e.pageX;                args.y = e.pageY;                if (scene.GUI)                    scene.GUI.mouseDownCallback(args);                if (args.handled)                    return;                args.x = scene.camera.map(e.pageX, e.pageY).x;                args.y = scene.camera.map(e.pageX, e.pageY).y;                scene.objectList.foreach(function (obj, node)
                {
                    if (obj.hitTest && obj.onMouseDown && obj.collider)
                    {
                        var p = new Point(args.x, args.y);                        if (obj.collider.isCollideWith(p))
                        {
                            obj.onMouseDown(args);                            if (args.handled)                                return true;
                        }
                    }
                });                if (args.handled)                    return;                if (scene.onMouseDown)                    scene.onMouseDown(args);
            });            this.eventSource.addEventListener("mouseup", function (e)
            {
                var args = new MouseEventArgs();                args.button = e.button;                args.buttonState = Mouse.ButtonState.Released;                args.handled = false;                args.x = e.pageX;                args.y = e.pageY;                if (scene.GUI)                    scene.GUI.mouseUpCallback(args);                if (args.handled)                    return;                args.x = scene.camera.map(e.pageX, e.pageY).x;                args.y = scene.camera.map(e.pageX, e.pageY).y;                scene.objectList.foreach(function (obj, node)
                {
                    if (obj.hitTest && obj.onMouseUp && obj.collider)
                    {
                        var p = new Point(args.x, args.y);                        if (obj.collider.isCollideWith(p))
                        {
                            obj.onMouseUp(args);                            if (args.handled)                                return true;
                        }
                    }
                });                if (args.handled)                    return;                if (scene.onMouseUp)                    scene.onMouseUp(args);
            });            this.eventSource.addEventListener("click", function (e)
            {
                var args = new MouseEventArgs();                args.button = e.button;                args.buttonState = Mouse.ButtonState.Click;                args.handled = false;                var t = (new Date()).getTime();                if (t - clickTime <= scene.doubleClickDelay)
                {
                    args.buttonState = Mouse.ButtonState.DoubleClick; args.x = e.pageX;                    args.y = e.pageY;                    if (scene.GUI)                        scene.GUI.doubleClickCallback(args);                    if (args.handled)                        return;                    args.x = scene.camera.map(e.pageX, e.pageY).x;                    args.y = scene.camera.map(e.pageX, e.pageY).y;                    clickTime = 0;                    scene.objectList.foreach(function (obj, node)
                    {
                        if (obj.hitTest && obj.onDoubleClick && obj.collider)
                        {
                            var p = new Point(args.x, args.y);                            if (obj.collider.isCollideWith(p))
                            {
                                obj.onDoubleClick(args)                                if (args.handled)                                    return true;
                            }
                        }
                    });                    if (args.handled)                        return;                    if (scene.onDoubleClick)                        scene.onDoubleClick(args);
                }                else
                {
                    args.x = e.pageX;                    args.y = e.pageY;                    if (scene.GUI)                        scene.GUI.clickCallback(args);                    if (args.handled)                        return;                    args.x = scene.camera.map(e.pageX, e.pageY).x;                    args.y = scene.camera.map(e.pageX, e.pageY).y;                    clickTime = t;                    scene.objectList.foreach(function (obj, node)
                    {
                        if (obj.hitTest && obj.onClick && obj.collider)
                        {
                            var p = new Point(args.x, args.y);                            if (obj.collider.isCollideWith(p))
                            {
                                obj.onClick(args);                                if (args.handled)                                    return true;
                            }
                        }
                    });                    if (args.handled)                        return;                    if (scene.onClick)                        scene.onClick(args);
                }
            });            window.addEventListener("keydown", function (e)
            {
                if (!pressedKeyList[e.keyCode])
                {
                    pressedKeyList[e.keyCode] = true;                    var args = new KeyEventArgs();                    args.key = e.keyCode;                    args.keyName = Keyboard.Keys.toString(args.key);                    args.keyState = Keyboard.KeyState.Down;                    args.ctrl = e.ctrlKey;                    args.alt = e.altKey;                    args.shift = e.shiftKey;                    args.handled = false;                    e.key = keyCodeToKey(e.keyCode);                    if (scene.onKeyDown)                        scene.onKeyDown(args);
                }
            });            window.addEventListener("keyup", function (e)
            {
                if (pressedKeyList[e.key.toUpperCase()])
                {
                    pressedKeyList[e.key.toUpperCase()] = false;                    var args = new KeyEventArgs();                    args.key = e.keyCode;                    args.keyName = Keyboard.Keys.toString(args.key);                    args.keyState = Keyboard.KeyState.Up;                    args.ctrl = e.ctrlKey;                    args.alt = e.altKey;                    args.shift = e.shiftKey;                    args.handled = false;                    if (scene.onKeyUp)                        scene.onKeyUp(args);
                }
            });            window.addEventListener("keypress", function (e)
            {
                var args = new KeyEventArgs();                args.key = e.keyCode;                args.keyName = Keyboard.Keys.toString(args.key);                args.keyState = Keyboard.KeyState.Pressed;                args.ctrl = e.ctrlKey;                args.alt = e.altKey;                args.shift = e.shiftKey;                args.handled = false;                if (scene.onKeyPress)                    scene.onKeyPress(args);
            });            this.eventSource.addEventListener("touchstart", function (e)
            {
                for (var i = 0; i < e.changedTouches.length ; i++)
                {
                    var argsGUI = new Touch.TouchEventArgs();                    argsGUI.type = Touch.Types.Start;                    argsGUI.id = e.changedTouches[i].identifier;                    argsGUI.x = e.changedTouches[i].pageX;                    argsGUI.y = e.changedTouches[i].pageY;                    touchListGUI.add(argsGUI);                    touchArrayGUI[argsGUI.id] = argsGUI;                    argsGUI.touches = touchListGUI.toArray();                    var args = argsGUI.copy();                    args.x = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;                    args.y = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;                    touchList.add(args);                    touchArray[args.id] = args;                    args.touches = touchList.toArray();                    if (scene.GUI)                        scene.GUI.touchStartCallback(argsGUI);                    if (argsGUI.handled)                        continue;                    if (scene.onTouchStart)                        scene.onTouchStart(args);
                }
            });            this.eventSource.addEventListener("touchmove", function (e)
            {
                for (var i = 0; i < e.changedTouches.length ; i++)
                {
                    var id = e.changedTouches[i].identifier;                    if (!touchArray[id] || !touchArrayGUI[id])                        continue;                    var argsGUI = touchArrayGUI[id];                    argsGUI.type = Touch.Types.Move;                    argsGUI.touches = touchListGUI.toArray();                    argsGUI.x = e.changedTouches[i].pageX;                    argsGUI.y = e.changedTouches[i].pageY;                    var args = touchArray[id];                    args.type = Touch.Types.Move;                    args.x = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;                    args.y = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;                    args.touches = touchList.toArray();                    if (scene.GUI)                        scene.GUI.touchMoveCallback(argsGUI);                    if (argsGUI.handled)                        continue;                    if (scene.onTouchMove)                        scene.onTouchMove(args);
                }
            });            this.eventSource.addEventListener("touchend", function (e)
            {
                try
                {
                    for (var i = 0; i < e.changedTouches.length ; i++)
                    {
                        var id = e.changedTouches[i].identifier;                        if (!touchArray[id] || !touchArrayGUI[id])                            continue;                        var argsGUI = touchArrayGUI[id];                        touchArrayGUI[id] = null;                        touchListGUI.remove(argsGUI);                        argsGUI.type = Touch.Types.End;                        argsGUI.id = e.changedTouches[i].identifier;                        argsGUI.touches = touchListGUI.toArray();                        argsGUI.x = e.changedTouches[i].pageX;                        argsGUI.y = e.changedTouches[i].pageY;                        var args = touchArray[id];                        args.type = Touch.Types.End;                        args.touches = touchList.toArray();                        args.x = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;                        args.y = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;                        if (scene.GUI)                            scene.GUI.touchEndCallback(argsGUI);                        if (args.handled)                            continue;                        if (scene.onTouchEnd)                            scene.onTouchEnd(args);
                    }
                }                catch (ex)
                {
                    alert(ex.message);
                }
            });
        }        Scene.prototype.addGameObject = function (obj)
        {
            var node = this.objectList.add(obj);            obj.id = this._objList.add(node);            return obj.id;
        }        Scene.prototype.removeGameObject = function (id)
        {
            var node = this._objList[id];            node.object.deleted = true;            if (!node)                throw new Error("The object has been removed.");            this.objectList.remove(node);            this._objList[id] = null;
        }        engine.Scene = Scene;        window.Scene = Scene;        function Camera(x, y, w, h, z)
        {
            this.center = new Point(x, y);            this.position = new Point(x, y);            this.width = w;            this.height = h;            this.zoom = z;            this.rotate = 0;            this.graphics = null;
        }        Camera.prototype.copy = function ()
        {
            var c = new Camera(this.x, this.y, this.width, this.height, this.zoom);            c.graphics = this.graphics;            return c;
        }        Camera.prototype.setCenter = function (x, y, align)
        {
            if (!align)                throw new Error("Align function is required!");            this.position.x = x;            this.position.y = y;            this.center.x = x + this.width / 2 - align(this.width, this.height).x;            this.center.y = y + this.height / 2 - align(this.width, this.height).y;
        }        Camera.prototype.moveTo = function (x, y)
        {
            this.center.x += (x - this.position.x);            this.center.y += (y - this.position.y);            this.position.x = x;            this.position.y = y;            if (!this.graphics || !this.graphics.ctx)                return;            //this.resetTransform();        }        Camera.prototype.zoomTo = function (z)
        {
            this.zoom = z;            if (!this.graphics || !this.graphics.ctx)                return;            //this.resetTransform();        }        Camera.prototype.rotateTo = function (angle)
        {
            throw new Error("Coming soon...");            this.rotate = angle;            if (!this.graphics || !this.graphics.ctx)                return;            //this.resetTransform();        }        Camera.prototype.resetTransform = function ()
        {            //alert(this.graphics);            this.graphics.setTransform(1, 0, 0, 1, 0, 0);
        }        Camera.prototype.clear = function ()
        {
            if (!this.graphics || !this.graphics.ctx)                return;            this.resetTransform();            this.graphics.ctx.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height);            this.applyTransform();
        }        Camera.prototype.applyTransform = function ()
        {
            if (!this.graphics || !this.graphics.ctx)                return;            var sinA = Math.sin(this.rotate);            var cosA = Math.cos(this.rotate);            this.width = this.graphics.canvas.width;            this.height = this.graphics.canvas.height;            var x0 = -this.position.x + this.width / 2;            var y0 = this.position.y + this.height / 2;            this.width = this.graphics.canvas.width / this.zoom;            this.height = this.graphics.canvas.height / this.zoom;            var x1 = this.center.x * cosA + this.center.y * sinA - this.center.x;            var y1 = -this.center.x * sinA + this.center.y * cosA - this.center.y;            var x2 = (1 - 1 / this.zoom) * this.center.x * this.zoom;            var y2 = (1 - 1 / this.zoom) * this.center.y * this.zoom;            this.graphics.setTransform(1, 0, 0, 1, x0, y0);            //this.graphics.setTransform(1, 0, 0, 1, 100, 100);            this.graphics.transform(cosA, sinA, -sinA, cosA, 0, 0);            this.graphics.transform(1, 0, 0, 1, x1, -y1);            this.graphics.transform(this.zoom, 0, 0, this.zoom, -x2, +y2);            //this.graphics.clearRect(this.center.x - this.width / 2, this.center.y - this.height / 2);        }        Camera.prototype.map = function (x, y)
        {
            return new Point((x / this.zoom) + (this.center.x - this.width / 2), (this.height - y / this.zoom) + (this.center.y - this.height / 2));
        }        engine.Camera = Camera;        window.Camera = Camera;        function GUI()
        {
        }        function Button(context)
        {
        }        function TextBlock(text)
        {
        }        function Joystick()
        {
        }        //-------Graphics        function Graphics(canvas)
        {
            if (!canvas)                throw new Error("paramter error.");            if (!canvas.getContext)                throw new Error("paramter 1 must be a canvas");            this.canvas = canvas;            this.ctx = canvas.getContext("2d");            this.o = new Point(0, 0);            this.zoom = 0;            this.rotation = 0;            this.fillStyle = "#000000";            this.strokeStyle = "#000000";            this.shadowColor = "#000000";            this.shadowBlur = "#000000";            this.shadowOffsetX = 0;            this.shadowOffsetY = 0;            this.lineCap = "butt";            this.lineJoin = "miter";            this.lineWidth = 1;            this.miterLimit = 10;            this.font = new Font("sans-serif", "10px");            this.textAlign = TextAlign.Start;            this.textBaseline = TextBaseline.Alphabetic;            this.globalAlpha = 1.0;            var globalCompositeOperation = "source-over";            var graphics = this;            Object.defineProperty(this, "globalCompositeOperation", {
                get: function ()
                {
                    return globalCompositeOperation;
                },                set: function (value)
                {
                    globalCompositeOperation = value;                    graphics.ctx.globalCompositeOperation = value;
                }
            });
        }        Graphics.LineCap = (function () { var lineCap = {}; lineCap.Butt = "butt"; lineCap.Round = "round"; lineCap.Square = "square"; return lineCap; })();        Graphics.LineJoin = (function () { var lineJoin = {}; lineJoin.Bevel = "bevel"; lineJoin.Round = "round"; lineJoin.Miter = "miter"; return lineJoin })();        Graphics.CompositeOperation = (function () { var co = {}; co.SourceOver = "source-over"; co.SourceAtop = "source-atop"; co.SourceIn = "source-in"; co.SourceOut = "source-out"; co.DestinationOver = "destination-over"; co.DestinationAtop = "destination-atop"; co.DestinationIn = "destination-in"; co.DestinationOut = "destination-out"; co.Lighter = "lighter"; co.Copy = "copy"; co.Xor = "xor"; return co; })();        Graphics.drawLine = function (canvas, x1, y1, x2, y2, color)
        {
            if (!canvas)                throw new Error("paramter error.");            if (!canvas.getContext)                throw new Error("paramter 1 must be a canvas");            ctx = canvas.getContext("2d");            ctx.beginPath();            ctx.moveTo(x1, y1);            ctx.lineTo(x2, y2);            if (color)                ctx.strokeStyle = color;            ctx.stroke();
        }        Graphics.drawArc = function (canvas, x, y, r, ang1, ang2, clockwise, color)
        {
            var ctx = canvas.getContext("2d");            ctx.beginPath();            ctx.arc(x, y, r, ang1, ang2, clockwise);            ctx.strokeStyle = color;            ctx.stroke();
        }        Graphics.drawCircle = function (canvas, x, y, r, strokeStyle, fillStyle, strokeWidth)
        {
            var ctx = canvas.getContext("2d");            ctx.beginPath();            ctx.arc(x, y, r, 0, Math.PI * 2);            ctx.strokeStyle = strokeStyle;            ctx.fillStyle = fillStyle;            ctx.lineWidth = strokeWidth;            ctx.fill();            ctx.stroke();
        }        Graphics.drawImage = function (canvas, img, sx, sy, swidth, sheight, x, y, width, height)
        {
            var ctx = canvas.getContext("2d");            ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
        }        Graphics.fillRect = function (canvas, x, y, w, h, color)
        {
            if (!canvas)                throw new Error("paramter error.");            if (!canvas.getContext)                throw new Error("paramter 1 must be a canvas");            ctx = canvas.getContext("2d");            ctx.fillStyle = color ? color : "black";            ctx.fillRect(x, y, w, h);
        }        Graphics.clear = function (canvas, color)
        {
            if (!canvas)                throw new Error("paramter error.");            if (!canvas.getContext)                throw new Error("paramter 1 must be a canvas");            var ctx = canvas.getContext("2d");            ctx.clearRect(0, 0, canvas.width, canvas.height);            /*/ctx.fillStyle = 'rgba(255,255,255,0.05)';            ctx.fillRect(0, 0, canvas.width, canvas.height);*/            if (color)
            {
                ctx.fillStyle = color;                ctx.fillRect(0, 0, width, height);
            }
        }        Graphics.clearRect = function (canvas, x, y, width, height)
        {
            var ctx = canvas.getContext("2d");            ctx.clearRect(x, y, width, height);
        }        Graphics.prototype.rect = function (x, y, width, height)
        {
            return this.ctx.rect(x, -y, width, height);
        }        Graphics.prototype.roundRect = function (x, y, width, height, r)
        {
            if (!this.ctx)                return;            if (width < 2 * r)                width = 2 * r;            if (height < 2 * r)                height = 2 * r;            this.ctx.beginPath();            this.ctx.moveTo(x + r, -y);            this.ctx.lineTo(x + width - r, -y);            this.ctx.arcTo(x + width, -y, x + width, -y + r, r);            this.ctx.lineTo(x + width, -y + height - r);            this.ctx.arcTo(x + width, -y + height, x + width - r, -y + height, r);            this.ctx.lineTo(x + r, -y + height);            this.ctx.arcTo(x, -y + height, x, -y + height - r, r);            this.ctx.lineTo(x, -y + r);            this.ctx.arcTo(x, -y, x + r, -y, r);            this.ctx.closePath();            return;
        }        Graphics.prototype.fillRect = function (x, y, width, height)
        {
            this.ctx.fillStyle = this.fillStyle;            return this.ctx.fillRect(x, -y, width, height);
        }        Graphics.prototype.strokeRect = function (x, y, width, height)
        {
            this.ctx.lineCap = this.lineCap;            this.ctx.lineJoin = this.lineJoin;            this.ctx.lineWidth = this.lineWidth;            this.ctx.miterLimit = this.miterLimit;            this.ctx.strokeStyle = this.strokeStyle;            return this.ctx.strokeRect(x, -y, width, height);
        }        Graphics.prototype.fillRoundRect = function (x, y, width, height, r)
        {
            this.roundRect(x, y, width, height, r);            this.fill();
        }        Graphics.prototype.strokeRoundRect = function (x, y, width, height, r)
        {
            this.roundRect(x, y, width, height, r);            this.stroke();
        }        Graphics.prototype.clearRect = function (x, y, width, height)
        {
            this.ctx.clearRect(x, -y, width, height);
        }        Graphics.prototype.fill = function ()
        {
            this.ctx.fillStyle = this.fillStyle;            return this.ctx.fill();
        }        Graphics.prototype.stroke = function ()
        {
            this.ctx.lineCap = this.lineCap;            this.ctx.lineJoin = this.lineJoin;            this.ctx.lineWidth = this.lineWidth;            this.ctx.miterLimit = this.miterLimit;            this.ctx.strokeStyle = this.strokeStyle;            return this.ctx.stroke();
        }        Graphics.prototype.beginPath = function ()
        {
            return this.ctx.beginPath();
        }        Graphics.prototype.moveTo = function (x, y)
        {
            return this.ctx.moveTo(x, -y);
        }        Graphics.prototype.closePath = function ()
        {
            return this.ctx.closePath();
        }        Graphics.prototype.lineTo = function (x, y)
        {
            return this.ctx.lineTo(x, -y);
        }        Graphics.prototype.clip = function ()
        {
            return this.ctx.clip();
        }        Graphics.prototype.quadraticCurveTo = function (cpx, cpy, x, y)
        {
            return this.ctx.quadraticCurveTo(cpx, -cpy, x, -y);
        }        Graphics.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y)
        {
            return this.ctx.bezierCurveTo(cp1x, -cp1y, cp2x, -cp2y, x, -y);
        }        Graphics.prototype.arc = function (x, y, r, sAngle, eAngle, counterclockwise)
        {
            return this.ctx.arc(x, -y, r, sAngle, eAngle, counterclockwise);
        }        Graphics.prototype.arcTo = function (x1, y1, x2, y2, r)
        {
            return this.ctx.arcTo(x1, -y1, x2, -y2, r);
        }        Graphics.prototype.isPointInPath = function (x, y)
        {
            return this.ctx.isPointInPath(x, -y);
        }        Graphics.prototype.scale = function (scalewidth, scaleheight)
        {
            return this.ctx.scale(scalewidth, scaleheight);
        }        Graphics.prototype.rotate = function (angle)
        {
            return this.ctx.rotate(angle);
        }        Graphics.prototype.translate = function (x, y)
        {
            return this.ctx.translate(x, -y);
        }        Graphics.prototype.transform = function (a, b, c, d, e, f)
        {
            return this.ctx.transform(a, b, c, d, e, f);
        }        Graphics.prototype.setTransform = function (a, b, c, d, e, f)
        {
            return this.ctx.setTransform(a, b, c, d, e, f);
        }        Graphics.prototype.fillText = function (text, x, y, maxWidth)
        {
            this.ctx.font = this.font.toString();            this.ctx.textAlign = this.textAlign;            this.ctx.textBaseline = this.textBaseline;            this.ctx.fillStyle = this.fillStyle;            //this.ctx.fillText("2333333", 100, 100, -1);            if (maxWidth)                return this.ctx.fillText(text, x, -y, maxWidth);            else                return this.ctx.fillText(text, x, -y);
        }        Graphics.prototype.strokeText = function (text, x, y, maxWidth)
        {
            this.ctx.font = this.font.toString();            this.ctx.fontAlign = this.fontAlign;            this.ctx.textBaseline = this.textBaseline;            this.ctx.lineCap = this.lineCap;            this.ctx.lineJoin = this.lineJoin;            this.ctx.lineWidth = this.lineWidth;            this.ctx.miterLimit = this.miterLimit;            this.ctx.strokeStyle = this.strokeStyle;            return this.ctx.strokeText(text, x, -y, maxWidth);
        }        Graphics.prototype.measureText = function (text)
        {
            this.ctx.font = this.font.toString();            this.ctx.fontAlign = this.fontAlign;            this.ctx.textBaseline = this.textBaseline;            return this.ctx.measureText(text);
        }        Graphics.prototype.drawImage = function (img, sx, sy, swidth, sheight, x, y, width, height)
        {
            if (isNaN(x) && !isNaN(sx))
            {
                return this.ctx.drawImage(img, sx, -sy, swidth, sheight);
            }            else                return this.ctx.drawImage(img, sx, sy, swidth, sheight, x, -y, width, height);
        }        Graphics.prototype.drawLine = function (x1, y1, x2, y2)
        {
            this.ctx.lineCap = this.lineCap;            this.ctx.lineJoin = this.lineJoin;            this.ctx.lineWidth = this.lineWidth;            this.ctx.miterLimit = this.miterLimit;            this.ctx.strokeStyle = this.strokeStyle;            this.beginPath();            this.moveTo(x1, y1);            this.lineTo(x2, y2);            this.stroke();
        }        sar.Color = (function (color)
        {
            Object.defineProperty(window, "Color", {
                get: function ()
                {
                    return color;
                },                set: function (value)
                {
                    if (!color)                        color = value;                    if (!value || !value.version || value.version < color.version)                        return;                    color = value;
                }
            });            if (color && color.version && color.version > 1.0)                return;            //-------Color            function Color(r, g, b, a)
            {
                r = int(r);                g = int(g);                b = int(b);                if (isNaN(r) || r >= 256)                    r = 255;                else if (r < 0)                    r = 0;                if (isNaN(g) || g >= 256)                    g = 255;                else if (g < 0)                    g = 0;                if (isNaN(b) || b >= 256)                    b = 255;                else if (b < 0)                    b = 0;                if (isNaN(a) || a > 1.0)                    a = 1.0;                else if (a < 0)                    a = 0;                this.red = r;                this.green = g;                this.blue = b;                this.alpha = a;
            }            Color.version = 1.0;            Color.random = function ()
            {
                return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1.0);
            }            Color.prototype.copy = function ()
            {
                return new Color(this.red, this.green, this.blue, this.alpha);
            }            Color.prototype.toString = function ()
            {
                return "rgba(" + this.red.toString() + "," + this.green.toString() + "," + this.blue.toString() + "," + this.alpha.toString() + ")";
            }            window.Color = Color;            return Color;
        })(sar.Color);        engine.Graphics = Graphics;        window.Graphics = Graphics;        //--------------GUI        function Thickness(top, bottom, left, right)
        {
            if (isNaN(top))
            {
                top = bottom = left = right = 0;
            }            else if (isNaN(bottom))
            {
                bottom = left = right = top;
            }            this.top = top;            this.bottom = bottom;            this.left = left;            this.right = right;
        }        Thickness.prototype.copy = function ()
        {
            return new Thickness(this.top, this.bottom, this.left, this.right);
        }        window.Thickness = Thickness;        var VerAlign = {};        VerAlign.Top = 1;        VerAlign.Bottom = 2;        VerAlign.Center = 0;        VerAlign.Stretch = 3;        window.VerAlign = VerAlign;        var HorAlign = {};        HorAlign.Left = 1;        HorAlign.Right = 2;        HorAlign.Center = 0;        HorAlign.Stretch = 3;        window.HorAlign = HorAlign;        function GUI()
        {
            this.scene = null;            this.children = new LinkList();            this.width = 0;            this.height = 0;            this.x = 0;            this.y = 0;            this.color = new Color(0, 0, 0, 1.00);            this.bgColor = new Color(0, 0, 0, 0);            this.onRender = null;            this.onMouseDown = null;            this.onMouseUp = null;            this.onMouseMove = null;            this.onClick = null;            this.onDoubleClick = null;            this.onTouchStart = null;            this.onTouchEnd = null;            this.onTouchMove = null;
        }        GUI.prototype.copy = function ()
        {
            var gui = new GUI;            gui.controls = this.controls;            gui.ctrlList = this.ctrlList;            gui.width = this.width;            gui.height = this.height;            gui.textCalcu = this.textCalcu;            this.onRender = this.onRender;            this.onMouseDown = this.onMouseDown;            this.onMouseUp = this.onMouseUp;            this.onMouseMove = this.onMouseMove;            this.onClick = this.onClick;            this.onDoubleClick = this.onDoubleClick;            this.onTouchStart = this.onTouchStart;            this.onTouchEnd = this.onTouchEnd;            this.onTouchMove = this.onTouchMove;
        }        GUI.prototype.addControl = function (obj)
        {
            this.children.add(obj);            obj.parent = this;
        }        GUI.prototype.render = function (graphics)
        {
            this.width = graphics.canvas.width;            this.height = graphics.canvas.height;            var gui = this;            if (this.onRender)
            {
                this.onRender();
            }            this.children.foreach(function (obj, node)
            {
                if (obj.render)                    obj.render(graphics);
            });
        }        GUI.prototype.mouseMoveCallback = function (e)
        {
            this.children.foreach(function (child, node)
            {
                if (child.mouseMoveCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.mouseMoveCallback(e);                    if (e.handled)                        return true;
                }
            });            if (e.handled)                return;            if (this.onMouseMove)                this.onMouseMove(e);
        }        GUI.prototype.mouseDownCallback = function (e)
        {
            this.children.foreach(function (child, node)
            {
                if (child.mouseDownCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.mouseDownCallback(e);                    if (e.handled)                        return true;
                }
            });            if (e.handled)                return;            if (this.onMouseDown)                this.onMouseDown(e);
        }        GUI.prototype.mouseUpCallback = function (e)
        {
            this.children.foreach(function (child, node)
            {
                if (child.mouseUpCallback)
                {
                    child.mouseUpCallback(e);                    if (e.handled)                        return true;
                }
            });            if (e.handled)                return;            if (this.onMouseUp)                this.onMouseUp(e);
        }        GUI.prototype.clickCallback = function (e)
        {
            this.children.foreach(function (child, node)
            {
                if (child.clickCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.clickCallback(e);                    if (e.handled)                        return true;
                }
            });            if (e.handled)                return;            if (this.onClick)                this.onClick(e);
        }        GUI.prototype.doubleClickCallback = function (e)
        {
            this.children.foreach(function (child, node)
            {
                if (child.doubleClickCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.doubleClickCallback(e);                    if (e.handled)                        return true;
                }
            });            if (e.handled)                return;            if (this.onDoubleClick)                this.onDoubleClick(e);
        }        GUI.prototype.touchStartCallback = function (e)
        {
            this.children.foreach(function (child, node)
            {
                if (child.touchStartCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.touchStartCallback(e);                    if (e.handled)                        return true;
                }
            });            if (e.handled)                return;            if (this.onTouchStart)                this.onTouchStart(e);
        }        GUI.prototype.touchEndCallback = function (e)
        {
            this.children.foreach(function (child, node)
            {
                for (var i = 0; i < e.touches.length; i++)
                {                    //alert(e.touches[i].x + "," + e.touches[i].y);                    //alert(child.isPointIn(e.touches[i].x, e.touches[i].y));                    if (child.isPointIn && child.isPointIn(e.touches[i].x, e.touches[i].y))                        return;
                }                if (child.touchEndCallback)
                {
                    child.touchEndCallback(e);                    if (e.handled)                        return true;
                }
            });            if (e.handled)                return;            if (this.onTouchEnd)                this.onTouchEnd(e);
        }        GUI.prototype.touchMoveCallback = function (e)
        {
            this.children.foreach(function (child, node)
            {
                if (child.touchMoveCallback)
                {
                    child.touchMoveCallback(e);                    if (e.handled)                        return true;
                }
            });            if (e.handled)                return;            if (this.onTouchMove)                this.onTouchMove(e);
        }        engine.GUI = GUI;        window.GUI = GUI;        function Block(width, height)
        {
            this.children = new LinkList();            this.parent = null;            this.widthAuto = false;            this.heightAuto = true;            if (isNaN(width))
            {
                width = 0;                this.widthAuto = true;
            }            if (isNaN(height))
            {
                height = 0;                this.heightAuto = true;
            }            this.width = width;            this.height = height;            this.x = 0;            this.y = 0;            this.margin = new Thickness(0);            this.padding = new Thickness(0);            this.horAlign = HorAlign.Left;            this.verAlign = VerAlign.Top;            this.color = null;            this.bgColor = null;            this.border = 1;            this.font = new Font();            this.collider = null;            this.onClick = null;            this.onMouseDown = null;            this.onMouseUp = null;            this.onMouseMove = null;            this.onTouchStart = null;            this.onTouchEnd = null;            this.onTouchMove = null;
        }        Block.prototype.render = function (graphics)
        {
            if ((this.bgColor && this.bgColor.alpha > 0) || (this.color && this.color.alpha > 0 && this.border > 0))
            {
            }            this.children.foreach(function (child, node)
            {
                if (child.render)                    child.render(graphics);
            });
        }        function Button(content)
        {
            if (!content)                content = "button";            this.parent = null;            this.content = content;            this.width = 0;            this.widthAuto = true;            this.height = 0;            this.heightAuto = true;            this.x = 0;            this.y = 0;            this.margin = new Thickness(0);            this.padding = new Thickness(0);            this.horAlign = HorAlign.Left;            this.verAlign = VerAlign.Top;            this.color = new Color(0, 0, 0, 1.00);            this.bgColor = new Color(0, 0, 0, 0);            this.border = 1;            this.radius = 5;            this.font = new Font();            this.collider = null;            this.onRender = null;            this.onClick = null;            this.onDoubleClick = null;            this.onMouseMove = null;            this.onMouseDown = null;            this.onMouseUp = null;            this.onMouseMove = null;            this.onTouchStart = null;            this.onTouchEnd = null;            this.onTouchMove = null;            this.isPressed = false;
        }        Button.prototype.copy = function ()
        {
            var button = new Button(this.content);            button.parent = this.parent;            button.width = this.width;            button.width = this.width;            button.widthAuto = this.widthAuto;            button.height = this.height;            button.heightAuto = this.heightAuto;            button.x = this.x;            button.y = this.y;            button.margin = this.margin.copy();            button.padding = this.padding.copy();            button.horAlign = this.horAlign;            button.verAlign = this.verAlign;            button.color = this.color.copy();            button.bgColor = this.bgColor.copy();            if (this.border instanceof Thickness)                button.border = this.border.copy();            else                button.border = this.border;            button.radius = this.radius;            button.font = this.font;            if (this.collider && this.collider.copy)                button.collider = this.collider.copy();            else                button.collider = this.collider;            button.onClick = this.onClick;            button.onMouseDown = this.onMouseDown;            button.onMouseUp = this.onMouseUp;            button.onMouseMove = this.onMouseMove;            button.onTouchStart = this.onTouchStart;            button.onTouchEnd = this.onTouchEnd;            button.onTouchMove = this.onTouchMove;            return button;
        }        Button.prototype.render = function (graphics)
        {
            if (this.onRender)
            {
                this.onRender();
            }            graphics.font = this.font;            var h = parseInt(this.font.fontSize) * 1.15;//textHeight            var w = graphics.measureText(this.content).width;//textWidth            var x = 0, y = 0;//buttonX,buttonY            var wx = 0, wy = 0;//textX,textY            var mW = this.parent.width;//maxWidth            var mH = this.parent.height;//MaxHeight            if (this.widthAuto)
            {
                if (this.horAlign == HorAlign.Stretch)
                {
                    this.width = mW - this.margin.left - this.margin.right;                    this.width = this.width < 0 ? 0 : this.width;
                }                else
                {
                    this.width = this.padding.left + w + this.padding.right;                    if (this.margin.left + this.width + this.margin.right > mW)
                    {
                        this.width = mW - this.margin.left - this.margin.right;
                    }                    this.width = this.width < 0 ? 0 : this.width;
                }
            }            w = this.width - this.padding.left - this.padding.right;            w = w < 0 ? 0 : w;            switch (this.horAlign)
            {
                case HorAlign.Left:                    x = this.margin.left;                    break;                case HorAlign.Right:                    x = mW - this.margin.right - this.width;                    break;                case HorAlign.Stretch:                    x = (mW - this.margin.left - this.margin.right) / 2 - this.width / 2 + this.margin.left;                    break;                case HorAlign.Center:                    x = (mW - this.width) / 2 + this.margin.left - this.margin.right;                    break;
            }            if (this.heightAuto)
            {
                if (this.verAlign == VerAlign.Stretch)
                {
                    this.height = mH - this.margin.top - this.margin.bottom;                    this.height = this.height < 0 ? 0 : this.height;
                }                else
                {
                    this.height = this.padding.top + h + this.padding.bottom;                    if (this.margin.top + this.height + this.margin.bottom > mH)
                    {
                        this.height = mH - this.margin.top - this.margin.bottom;
                    }                    this.height = this.height < 0 ? 0 : this.height;
                }
            }            h = this.height - this.padding.top - this.padding.bottom;            h = h < 0 ? 0 : h;            switch (this.verAlign)
            {
                case VerAlign.Top:                    y = this.margin.top;                    break;                case VerAlign.Bottom:                    y = mH - this.margin.bottom - this.height;                    break;                case VerAlign.Stretch:                    y = this.margin.top;                    break;                case VerAlign.Center:                    y = (mH - this.height) / 2 + this.margin.top + this.margin.bottom;                    break;
            }            x += this.parent.x;            y += this.parent.y;            this.x = x;            this.y = y;            wx = x + w / 2 + this.padding.left;            wy = y + h / 2 + this.padding.right;            graphics.textAlign = TextAlign.Center;            graphics.textAlign = "center";            graphics.textBaseline = "middle";            if (this.isPressed)
            {
                graphics.fillStyle = this.color.toString();                graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);                graphics.strokeStyle = this.color.toString();                graphics.strokeRoundRect(x, -y, this.width, this.height, this.radius);                graphics.globalCompositeOperation = Graphics.CompositeOperation.Xor;                graphics.fillStyle = this.color.toString();                graphics.fillText(this.content, wx, -wy);                graphics.globalCompositeOperation = Graphics.CompositeOperation.SourceOver;                graphics.fillStyle = this.bgColor.toString();                graphics.fillText(this.content, wx, -wy);
            }            else
            {
                graphics.fillStyle = this.bgColor.toString();                graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);                graphics.strokeStyle = this.color.toString();                graphics.strokeRoundRect(x, -y, this.width, this.height, this.radius);                graphics.fillStyle = this.color.toString();                graphics.fillText(this.content, wx, -wy);
            }
        }        Button.prototype.isPointIn = function (x, y)
        {            //alert("["+this.x+","+(this.x+this.width)+"]["+this.y+","+(this.y+this.height)+"]"+x+","+y);            if (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height)
            {
                return true;
            }            return false;
        }        Button.prototype.mouseMoveCallback = function (e)
        {
            if (this.onMouseMove)                this.onMouseMove(e);
        }        Button.prototype.mouseDownCallback = function (e)
        {
            this.isPressed = true;            if (this.onMouseDown)                this.onMouseDown(e);
        }        Button.prototype.mouseUpCallback = function (e)
        {
            var t = this.isPressed;            this.isPressed = false;            if (t && this.onMouseUp)
            {
                this.onMouseUp(e);
            }
        }        Button.prototype.clickCallback = function (e)
        {
            if (this.onClick)                this.onClick(e);
        }        Button.prototype.doubleClickCallback = function (e)
        {
            if (this.onClick)                this.onClick(e);
        }        Button.prototype.touchStartCallback = function (e)
        {
            this.isPressed = true;            if (this.onTouchStart)                this.onTouchStart(e);
        }        Button.prototype.touchEndCallback = function (e)
        {
            var t = this.isPressed;            this.isPressed = false;            if (t && this.onTouchEnd)                this.onTouchEnd(e);
        }        Button.prototype.touchMoveCallback = function (e)
        {
            if (this.onTouchMove)                this.onTouchMove();
        }        GUI.Button = Button;        function TextBlock(text)
        {
            if (!text)                text = "textBlock";            this.parent = null;            this.text = text;            this.width = 0;            this.widthAuto = true;            this.height = 0;            this.heightAuto = true;            this.x = 0;            this.y = 0;            this.margin = new Thickness(0);            this.padding = new Thickness(0);            this.horAlign = HorAlign.Left;            this.verAlign = VerAlign.Top;            this.color = new Color(0, 0, 0, 1.00);            this.borderColor = new Color(0, 0, 0, 1.00);            this.bgColor = new Color(0, 0, 0, 0);            this.border = new Thickness(0, 0, 0, 0);            this.font = new Font();            this.collider = null;            this.onRender = null;            this.onClick = null;            this.onMouseDown = null;            this.onMouseUp = null;            this.onMouseMove = null;            this.onTouchStart = null;            this.onTouchEnd = null;            this.onTouchMove = null;
        }        TextBlock.prototype.copy = function ()
        {
            var textBlock = new Button(this.text);            textBlock.parent = this.parent;            textBlock.width = this.width;            textBlock.width = this.width;            textBlock.widthAuto = this.widthAuto;            textBlock.height = this.height;            textBlock.heightAuto = this.heightAuto;            textBlock.x = this.x;            textBlock.y = this.y;            textBlock.margin = this.margin.copy();            textBlock.padding = this.padding.copy();            textBlock.horAlign = this.horAlign;            textBlock.verAlign = this.verAlign;            textBlock.color = this.color.copy();            textBlock.borderColor = this.borderColor.copy();            textBlock.bgColor = this.bgColor.copy();            textBlock.font = this.font;            if (this.border instanceof Thickness)                textBlock.border = this.border.copy();            else                textBlock.border = this.border;            if (this.collider && this.collider.copy)                textBlock.collider = this.collider.copy();            else                textBlock.collider = this.collider;            textBlock.onClick = this.onClick;            textBlock.onMouseDown = this.onMouseDown;            textBlock.onMouseUp = this.onMouseUp;            textBlock.onMouseMove = this.onMouseMove;            textBlock.onTouchStartthis.onTouchStart;            textBlock.onTouchEnd = this.onTouchEnd;            textBlock.onTouchMove = this.onTouchMove;            return textBlock;
        }        TextBlock.prototype.render = function (graphics)
        {
            if (this.onRender)
            {
                this.onRender();
            }            graphics.font = this.font;            var h = parseInt(this.font.fontSize) * 1.15;            var w = graphics.measureText(this.text).width;            var x = 0, y = 0;            var wx = 0, wy = 0;            var mW = this.parent.width;            var mH = this.parent.height;            if (this.widthAuto)
            {
                if (this.horAlign == HorAlign.Stretch)
                {
                    this.width = mW - this.margin.left - this.margin.right;                    this.width = this.width < 0 ? 0 : this.width;
                }                else
                {
                    this.width = this.padding.left + w + this.padding.right;                    if (this.margin.left + this.width + this.margin.right > mW)
                    {
                        this.width = mW - this.margin.left - this.margin.right;
                    }                    this.width = this.width < 0 ? 0 : this.width;
                }
            }            w = this.width - this.padding.left - this.padding.right;            w = w < 0 ? 0 : w;            switch (this.horAlign)
            {
                case HorAlign.Left:                    x = this.margin.left;                    break;                case HorAlign.Right:                    x = mW - this.margin.right - this.width;                    break;                case HorAlign.Stretch:                    x = (mW - this.margin.left - this.margin.right) / 2 - this.width / 2 + this.margin.left;                    break;                case HorAlign.Center:                    x = (mW - this.width) / 2 + this.margin.left - this.margin.right;                    break;
            }            if (this.heightAuto)
            {
                if (this.verAlign == VerAlign.Stretch)
                {
                    this.height = mH - this.margin.top - this.margin.bottom;                    this.height = this.height < 0 ? 0 : this.height;
                }                else
                {
                    this.height = this.padding.top + h + this.padding.bottom;                    if (this.margin.top + this.height + this.margin.bottom > mH)
                    {
                        this.height = mH - this.margin.top - this.margin.bottom;
                    }                    this.height = this.height < 0 ? 0 : this.height;
                }
            }            h = this.height - this.padding.top - this.padding.bottom;            h = h < 0 ? 0 : h;            switch (this.verAlign)
            {
                case VerAlign.Top:                    y = this.margin.top;                    break;                case VerAlign.Bottom:                    y = mH - this.margin.bottom - this.height;                    break;                case VerAlign.Stretch:                    y = this.margin.top;                    break;                case VerAlign.Center:                    y = (mH - this.height) / 2 + this.margin.top + this.margin.bottom;                    break;
            }            x += this.parent.x;            y += this.parent.y;            this.x = x;            this.y = y;            wx = x + w / 2 + this.padding.left;            wy = y + h / 2 + this.padding.right;            graphics.textAlign = TextAlign.Center;            graphics.font = this.font;            graphics.fillStyle = this.bgColor.toString();            //graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);            graphics.strokeStyle = this.borderColor.toString();            graphics.lineCap = Graphics.LineCap.Butt;            //top            if (this.border.top > 0)
            {
                graphics.lineWidth = this.border.top;                graphics.drawLine(x, -y, x + this.width, -y);
            }            //right            if (this.border.right > 0)
            {
                graphics.lineWidth = this.border.right;                graphics.drawLine(x + this.width, -y, x + this.width, -(y + this.height));
            }            //bottom            if (this.border.bottom > 0)
            {
                graphics.lineWidth = this.border.bottom;                graphics.drawLine(x + this.width, -(y + this.height), x, -(y + this.height));
            }            //left            if (this.border.left > 0)
            {
                graphics.lineWidth = this.border.left;                graphics.drawLine(x, -(y + this.height), x, -y);
            }            graphics.fillStyle = this.color.toString();            graphics.textAlign = "center";            graphics.textBaseline = "middle";            graphics.fillText(this.text, wx, -wy);
        }        TextBlock.prototype.isPointIn = function (x, y)
        {
            if (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height)
            {
                return true;
            }            return false;
        }        TextBlock.prototype.mouseDownCallback = function (e)
        {
        }        TextBlock.prototype.mouseUpCallback = function (e)
        {
        }        TextBlock.prototype.clickCallback = function (e)
        {
        }        TextBlock.prototype.touchStartCallback = function (e)
        {
        }        TextBlock.prototype.touchEndCallback = function (e)
        {
        }        TextBlock.prototype.touchMoveCallback = function (e)
        {
        }        GUI.TextBlock = TextBlock;        function Joystick()
        {
            this.margin = new Thickness(0);            this.padding = new Thickness(0);            this.horAlign = HorAlign.Left;            this.verAlign = VerAlign.Top;            this.width = 0;            this.height = 0;            this.content = "";            this.color = new Color(0, 0, 0, 1.00);            this.bgColor = new Color(0, 0, 0, 0);            this.border = 1;            this.font = new Font();            this.onClick = null;
        }        GUI.Joystick = Joystick;        //-----------------        //-------Image        /*function Image()        {            this.width=0;            this.height=0;            this.center=new Point(0,0);        }        Image.create=function (width,height,color)        {        }        Image.fromUrl=function (url)        {        }        Image.prototype.copy=function()        {        }        Image.prototype.drawToCanvas=function(canvas,x,y,r,dt)        {        }        engine.Image=Image;        window.Image=Image;*/        //-------FontStyle        function Font(fontFamily, fontSize)
        {
            fontFamily = fontFamily ? fontFamily : "sans-serif";            fontSize = fontSize || fontSize == 0 ? fontSize : "10px";            this.fontFamily = fontFamily;            this.fontSize = fontSize;            this.fontStyle = FontStyle.Normal;            this.fontVariant = FontVariant.Normal;            this.fontWeight = FontWeight.Normal;            this.caption = "";            this.icon = "";            this.menu = "";            this.messageBox = "";            this.smallCaption = "";            this.statusBar = "";
        }        Font.prototype.copy = function ()
        {
            var f = new Font(this.fontFamily, this.fontSize);            f.fontStyle = this.fontStyle;            f.fontVariant = this.fontVariant;            f.fontWeight = this.fontWeight;            f.caption = this.caption;            f.icon = this.icon;            f.menu = this.menu;            f.messageBox = this.messageBox;            f.smallCaption = this.smallCaption;            f.statusBar = this.statusBar;            return f;
        }        Font.prototype.toString = function ()
        {
            return this.fontStyle + " " + this.fontVariant + " " + this.fontWeight + " " + this.fontSize + " " + this.fontFamily;
        }        window.Font = Font;        function FontStyle() { }        FontStyle.Normal = "normal";        FontStyle.Italic = "italic";        FontStyle.Oblique = "oblique";        window.FontStyle = FontStyle;        function FontVariant() { }        FontVariant.Normal = "normal";        FontVariant.SmallCaps = "small-caps";        window.FontVariant = FontVariant;        function FontWeight() { }        FontWeight.Normal = "normal";        FontWeight.Bold = "bold";        FontWeight.Bolder = "bolder";        FontWeight.Lighter = "lighter";        window.FontWeight = FontWeight;        function TextAlign() { }        TextAlign.Start = "start";        TextAlign.End = "end";        TextAlign.Center = "center";        TextAlign.Left = "left";        TextAlign.Right = "right";        window.TextAlign = TextAlign;        function TextBaseline() { }        TextBaseline.Alphabetic = "alphabetic";        TextBaseline.Top = "top";        TextBaseline.Hanging = "hanging";        TextBaseline.Middle = "middle";        TextBaseline.Ideographic = "ideographic";        TextBaseline.Bottom = "bottom";        window.TextBaseline = TextBaseline;        //-------Text        function Text(text)
        {
            this.text = text;            this.font = new Font("sans-serif", 16);            this.position = new Point(0, 0);            this.center = new Point(0, 0);            this.fillStyle = new Color(0, 0, 0, 1);            this.strokeStyle = new Color(255, 255, 255, 0);            this.onRender = null;
        }        Text.prototype.copy = function ()
        {
            var text = new Text(this.text);            text.font = this.font.copy();            text.position = this.position.copy();            text.center = this.center.copy();            text.onRender = this.onRender;            if (this.fillStyle && this.fillStyle.copy)                text.fillStyle = this.fillStyle.copy();            else                text.fillStyle = this.fillStyle;            if (this.strokeStyle && this.strokeStyle.copy)                text.strokeStyle = this.strokeStyle.copy();            else                text.strokeStyle = this.strokeStyle;            return text;
        }        Text.prototype.setCenter = function (x, y, align)
        {
            this.position = new Point(x, y);            if (!align)                throw new Error("未指定对齐方式");            this.center = align(this.width, this.height);            this.center.x = x - this.center.x;            this.center.y = y + this.center.y;
        }        Text.prototype.moveTo = function (x, y)
        {
            var rx = this.position.x;            var ry = this.position.y;            this.position.x = x;            this.position.y = y;            this.center.x = this.center.x - rx + x;            this.center.y = this.center.y - ry + y;
        }        Text.prototype.drawToCanvas = function (canvas, x, y, r, dt)
        {
            var ctx = canvas.getContext("2d");            ctx.font = this.fontStyle + " "                     + this.fontVariant + " "                     + this.fontWeight + " "                     + this.fontSize + "px "                     + this.fontFamily;            ctx.fillStyle = this.fillStyle;            ctx.strokeStyle = this.strokeStyle;            ctx.fillText(this.text, x, y);            ctx.strokeText(this.text, x, y);
        }        Text.prototype.render = function (graphics, x, y, r, dt)
        {
            if (!graphics || !graphics.ctx)                return;            if (this.onRender)                this.onRender();            graphics.textAlign = TextAlign.Left;            graphics.textBaseline = TextBaseline.Top;            graphics.font = this.font;            graphics.fillText(this.text, this.center.x, this.center.y);
        }        engine.Text = Text;        window.Text = Text;        engine.Image = function (img)
        {
            if (!img)                img = new window.Image();            this.img = img;            this.position = new Point(0, 0);            this.o = new Point(0, 0);            this.onRender = null;            var obj = this;            Object.defineProperty(this, "width", {
                get: function ()
                {
                    return obj.img.width;
                },                set: function (value)
                {
                    obj.img.width = value;
                }
            });            Object.defineProperty(this, "height", {
                get: function ()
                {
                    return obj.img.height;
                },                set: function (value)
                {
                    obj.img.height = value;
                }
            });
        }        engine.Image.prototype.copy = function ()
        {
            var img = new engine.Image(img);            img.position = this.position.copy();            img.o = this.o.copy();            img.onRender = this.onRender;
        }        engine.Image.prototype.setCenter = function (x, y, align)
        {
            this.position = new Point(x, y);            if (!align)                throw new Error("未指定对齐方式");            this.o = align(this.width, this.height);            this.o.x = x - this.o.x;            this.o.y = y + this.o.y;
        }        engine.Image.prototype.moveTo = function (x, y)
        {
            var rx = this.position.x;            var ry = this.position.y;            this.position.x = x;            this.position.y = y;            this.o.x = this.o.x - rx + x;            this.o.y = this.o.y - ry + y;
        }        engine.Image.prototype.loadFromUrl = function (url, width, height, callback)
        {
            this.img = new window.Image();            var me = this;            this.img.onload = function (e)
            {
                me.width = me.img.naturalWidth;                me.height = me.img.naturalHeight;                if (!width)                    return;                if (!height)
                {
                    width();                    return;
                }                if (!callback)
                {
                    me.img.width = width;                    me.img.height = height;                    return;
                }                if (callback)                    callback();
            }            this.img.src = url;            if (this.img.complete)
            {
                return;
            }
        }        engine.Image.prototype.render = function (graphics, x, y, r, dt)
        {
            if (!graphics)                return;            if (this.onRender)                this.onRender();            graphics.drawImage(this.img, this.o.x, this.o.y, this.width, this.height);
        }        //-------ImageAnimation        function ImageAnimation()
        {
            this.center = new Point(0, 0);            this.position = this.center.copy();            this.fCount = 0;            this.fps = 0;            this.clipX = 0;            this.clipY = 0;            this.fWidth = 0;            this.fHeight = 0;            this.time = 0;            this.img = null;            this.frame = 0;            this.playing = true;            this.reverse = false;            this.width = 0;            this.heigh = 0;            this.onBegine = null;            this.onEnd = null;            this.onFrameUpdate = null;            this.loop = new ImageAnimation.Loop();
        }        //---ImagImageAnimation.Loop        ImageAnimation.Loop = function ()
        {
            this.from = 0;            this.to = 0;            this.length = 0;            this.loopTimes = -1;            this.lt = 0;            this.enable = true;            this.onEnd = null;            this.onStart = null;
        }        ImageAnimation.Loop.prototype.copy = function ()
        {
            var loop = new ImageAnimation.Loop();            loop.from = this.from;            loop.to = this.to;            loop.length = this.length;            loop.loopTimes = this.loopTimes;            loop.lt = this.lt;            loop.enable = this.enable;            loop.onEnd = this.onEnd;            loop.onStart = this.onStart;            return loop;
        }        ImageAnimation.Loop.prototype.begin = function ()
        {
            this.enable = true;            if (this.onStart)                this.onStart();
        }        ImageAnimation.Loop.prototype.end = function ()
        {
            var t = this.enable;            this.enable = false;            if (t && this.onEnd)                this.onEnd();
        }        ImageAnimation.loadFromUrl = function (url, clipX, clipY, fWidth, fHeight, width, height, fCount, fps, callback)
        {
            var ia = new ImageAnimation;            ia.img = new Image();            ia.img.onload = function (e)
            {
                ia.fps = fps;                ia.width = width;                ia.heigh = height;                ia.clipFrame(clipX, clipY, fWidth, fHeight, fCount);                if (callback)                    callback();
            }            ia.img.src = url;            return ia;
        }        ImageAnimation.create = function (width, height, fCount, fps)
        {
        }        ImageAnimation.prototype.copy = function ()
        {
            var ia = new ImageAnimation;            ia.img = this.img;            ia.center = this.center.copy();            ia.position = this.position.copy();            ia.fCount = this.fCount;            ia.fps = this.fps;            ia.clipX = this.clipX;            ia.clipY = this.clipY;            ia.fWidth = this.fWidth;            ia.fHeight = this.fHeight;            ia.time = this.time;            ia.width = this.width;            ia.heigh = this.heigh;            ia.frame = this.frame;            ia.playing = this.playing;            ia.reverse = this.reverse;            ia.onBegine = this.onBegine;            ia.onEnd = this.onEnd;            ia.onFrameUpdate = this.onFrameUpdate;            ia.loop = this.loop.copy();            return ia;
        }        ImageAnimation.prototype.setCenter = function (x, y, align)
        {
            this.position = new Point(x, y);            if (!align)                throw new Error("未指定对齐方式");            this.center = align(this.width, this.heigh);            this.center.x = x - this.center.x;            this.center.y = y + this.center.y;
        }        ImageAnimation.prototype.moveTo = function (x, y)
        {
            var rx = this.position.x;            var ry = this.position.y;            this.position.x = x;            this.position.y = y;            this.center.x = this.center.x - rx + x;            this.center.y = this.center.y - ry + y;
        }        ImageAnimation.prototype.clipFrame = function (clipX, clipY, fWidth, fHeight, fCount)
        {
            this.clipX = clipX;            this.clipY = clipY;            this.fWidth = fWidth;            this.fHeight = fHeight;            this.fCount = fCount;            this.loop.from = 0;            this.loop.to = fCount - 1;
        }        ImageAnimation.prototype.begine = function ()
        {
            this.playing = true;            this.time = 0;            this.frame = 0;            this.loop.lt = 0;
        }        ImageAnimation.prototype.end = function ()
        {
            var t = this.playing;            this.playing = false;            if (this.onEnd && t)
            {
                this.onEnd();
            }
        }        ImageAnimation.prototype.play = function ()
        {
            this.playing = true;            this.time = 0;
        }        ImageAnimation.prototype.drawToCanvas = function (canvas, x, y, r, dt)
        {
        }        ImageAnimation.prototype.preload = function (graphics)
        {
            graphics.drawImage(this.img, 0, 0, this.fWidth, this.fHeight, 0, 0, this.width, this.heigh);            graphics.clearRect(0, 0, this.width, this.height);
        }        ImageAnimation.prototype.render = function (graphics, x, y, r, dt)
        {
            if (this.time == 0 && this.onBegine)                this.onBegine();            this.time += dt;            var f = Math.floor(this.time / (1 / this.fps));            if (this.reverse)                f = this.fCount - f;            if (this.loop.enable)
            {
                if (f > this.loop.to)
                {
                    this.loop.lt++;                    if (this.loop.loopTimes > 0 && this.loop.lt >= this.loop.loopTimes)
                    {
                        this.loop.enable = false;                        f = f % this.fCount;
                    }                    else
                    {
                        f -= this.loop.from;                        f %= (this.loop.to - this.loop.from);                        if (!f)                            f = 0;                        f = this.loop.from + f;
                    }
                }
            }            else if (this.playing)
            {
                if (f >= this.fCount && !this.reverse)
                {
                    this.frame = f = this.fCount - 1;                    this.end();
                }                if (f <= 0 && this.reverse)
                {
                    this.frame = f = 0;                    this.end();
                }                //f = f % this.fCount;            }            if (this.playing)
            {
                var F = f;                if (this.frame != f && this.onFrameUpdate)                    F = this.onFrameUpdate(f);                if (!isNaN(F))                    f = F;                this.frame = f;
            }            graphics.drawImage(this.img, this.clipX + (this.fWidth * this.frame), this.clipY, this.fWidth, this.fHeight, this.center.x, this.center.y, this.width, this.heigh);
        }        engine.ImageAnimation = ImageAnimation;        window.ImageAnimation = ImageAnimation;        //--------------Collider        //-------Vector2        function Vector2(x, y)
        {
            this.x = x;            this.y = y;
        }        Vector2.fromPoint = function (p1, p2)
        {
            return new Vector2(p2.x - p1.x, p2.y - p1.y);
        }        Vector2.prototype.copy = function ()
        {
            return new Vector2(this.x, this.y);
        }        Vector2.prototype.toString = function ()
        {
            return "(" + this.x + "," + this.y + ")";
        }        Vector2.prototype.getLength = function ()
        {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }        Vector2.prototype.mod = function ()
        {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }        Vector2.prototype.plus = function (v)
        {
            if (!(v instanceof Vector2))                throw new Error("v must be a Vector");            this.x = this.x + v.x;            this.y = this.y + v.y;            return this;
        }        Vector2.prototype.minus = function (v)
        {
            if (!(v instanceof Vector2))                throw new Error("v must be a Vector");            this.x = this.x - v.x;            this.y = this.y - v.y;            return this;
        }        Vector2.prototype.multi = function (n)
        {
            if (!isNaN(n))
            {
                this.x *= n;                this.y *= n;                return this;
            }
        }        Vector2.plus = function (u, v)
        {
            if (!(u instanceof Vector2) || !(u instanceof Vector2))
            {
                throw new Error("u and v must be an Vector2.");
            }            return new Vector2(u.x + v.x, u.y + v.y);
        }        Vector2.minus = function (u, v)
        {
            if (!(u instanceof Vector2) || !(u instanceof Vector2))
            {
                throw new Error("u and v must be an Vector2.");
            }            return new Vector2(u.x - v.x, u.y - v.y);
        }        Vector2.multi = function (u, v)
        {
            if (!(u instanceof Vector2))
            {
                throw new Error("u must be an Vector2.");
            }            if (v instanceof Vector2)
            {
                return (u.x * v.x + u.y * v.y);
            }            else if (!isNaN(v))
            {
                return (new Vector2(u.x * v, u.y * v));
            }
        }        engine.Vector2 = Vector2;        window.Vector2 = Vector2;        //-------Point        function Point(x, y)
        {
            if (isNaN(x) || isNaN(y))                throw "x and y must be numbers.";            this.x = x;            this.y = y;
        }        Point.prototype.copy = function ()
        {
            return new Point(this.x, this.y);
        }        Point.prototype.toString = function ()
        {
            return "(" + this.x + "," + this.y + ")";
        }        Point.prototype.rotate = function (o, ang)
        {
            var x = this.x - o.x;            var y = this.y - o.y;            var dx = x * Math.cos(ang) - y * Math.sin(ang);            var dy = y * Math.cos(ang) + x * Math.sin(ang);            return new Point(o.x + dx, o.y + dy);
        }        Point.prototype.isBelongTo = function (l)
        {
            if (!(this.lines instanceof Array))                throw "this object has something wrong.";            for (var i = 0; i < this.lines.length; i++)
            {
                if (this.lines[i] == l)                    return true;
            }            return false;
        }        Point.prototype.addLine = function (l)
        {
            if (!(this.lines instanceof Array))                throw "this object has something wrong.";            this.lines[this.lines.length] = l;
        }        Point.prototype.render = function (graphics, x, y, r, dt)
        {
        }        engine.Point = Point;        window.Point = Point;        //-------Line        function Line(_p1, _p2)
        {
            var p1 = _p1, p2 = _p2;            if ((_p1 instanceof Vector2) && (_p2 instanceof Vector2))
            {
                p1 = new Point(_p1.x, _p1.y, this);                p2 = new Point(_p2.x, _p2.y, this);
            }            else if (!(p1 instanceof Point) || !(p2 instanceof Point))
            {
                throw new Error("P1 or P2 is not a Point.");
            }            this.p1 = p1;            this.p2 = p2;            this.center = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);            this.position = this.center;            this.strokeStyle = new Color(0, 0, 0, 1.00);
        }        Line.prototype.copy = function ()
        {
            var p1 = this.p1.copy();            var p2 = this.p2.copy();            var line = new Line(p1, p2);            line.setCenter(this.center.x, this.center.y);            return line;
        }        Line.prototype.setCenter = function (x, y)
        {
            this.center.x = x;            this.center.y = y;
        }        Line.prototype.moveTo = function (x, y)
        {
            if (x == this.center.x && y == this.center.y)                return;            this.p1.x = this.p1.x - this.center.x + x;            this.p1.y = this.p1.y - this.center.y + y;            this.p2.x = this.p2.x - this.center.x + x;            this.p2.y = this.p2.y - this.center.y + y;            this.center.x = x;            this.center.y = y;
        }        Line.prototype.isCross = function (obj)
        {
            if (obj instanceof Line)
            {
                var p1 = this.p1;                var p2 = this.p2;                var p3 = obj.p1;                var p4 = obj.p2;                var v13 = new Vector2(p3.x - p1.x, p3.y - p1.y);                var v14 = new Vector2(p4.x - p1.x, p4.y - p1.y);                var v31 = new Vector2(p1.x - p3.x, p1.y - p3.y);                var v32 = new Vector2(p2.x - p3.x, p2.y - p3.y);                var v12 = new Vector2(p2.x - p1.x, p2.y - p1.y);                var v34 = new Vector2(p4.x - p3.x, p4.y - p3.y);                if ((v13.x * v12.y - v12.x * v13.y) * (v14.x * v12.y - v12.x * v14.y) < 0 && (v31.x * v34.y - v34.x * v31.y) * (v32.x * v34.y - v34.x * v32.y) < 0)                    return true;                return false;
            }            else if (obj instanceof Circle)
            {
                var v1 = new Vector2(obj.o.x - this.p1.x, obj.o.y - this.p1.y);                var v2 = new Vector2(this.p2.x - this.p1.x, this.p2.y - this.p1.y);                var v3 = new Vector2(obj.o.x - this.p2.x, obj.o.y - this.p2.y);                var v4 = new Vector2(-v2.x, -v2.y);                var d1 = (obj.o.x - this.p1.x) * (obj.o.x - this.p1.x) + (obj.o.y - this.p1.y) * (obj.o.y - this.p1.y);                d1 = (d1 <= obj.r * obj.r) ? 1 : 0;                var d2 = (obj.o.x - this.p2.x) * (obj.o.x - this.p2.x) + (obj.o.y - this.p2.y) * (obj.o.y - this.p2.y);                d2 = (d2 <= obj.r * obj.r) ? 1 : 0;                if (d1 ^ d2)                    return true;                if (d1 && d2)                    return false;                if ((v1.x * v2.x + v1.y * v2.y < 0) || (v3.x * v4.x + v3.y * v4.y < 0))
                {
                    return false;
                }                if (v3.x * v4.x + v3.y * v4.y < 0)
                {
                }                var x = v1.x * v2.y - v2.x * v1.y;                var l = v2.x * v2.x + v2.y * v2.y;                l = l * obj.r * obj.r;                x *= x;                if (x <= l)                    return true;                return false;
            }
        }        Line.prototype.render = function (graphics, x, y, r, dt)
        {
            graphics.beginPath();            graphics.moveTo(this.p1.x, this.p1.y);            graphics.lineTo(this.p2.x, this.p2.y);            graphics.strokeStyle = this.strokeStyle;            graphics.stroke();
        }        engine.Line = Line;        window.Line = Line;        //-------GameObject        function GameObject()
        {
            this.id = null;            this.name = "GameObject";            this.graphic = null;            this.collider = null;            this.layer = 0;            this.zIndex = 0;            this.mass = 1;            this.gravity = true;            this.onGround = false;            this.hitTest = false;            this.F = new Force(0, 0);            this.constantForce = new Force(0, 0);            this.v = new Vector2(0, 0);            this.a = new Vector2(0, 0);            this.position = new Point(0, 0);            this.center = this.position;            this.rotation = 0.0;            this.onRender = null;            this.onUpdate = null;            this.onStart = null;            this.onCollide = null;            this.onMouseDown = null;            this.onMouseUp = null;            this.onClick = null;            this.onDoubleClick = null;
        }        GameObject.CollideEventArgs = function (target)
        {
            this.target = target;            this.e = 1;            this.dff = 0;            this.ignore = false;
        }        GameObject.prototype.copy = function ()
        {
            var obj = new GameObject();            obj.name = this.name;            obj.layer = this.layer;            obj.zIndex = this.zIndex;            if (this.graphic)
            {
                obj.graphic = this.graphic.copy ? this.graphic.copy() : this.graphic;
            }            if (this.collider)
            {
                obj.collider = this.collider.copy ? this.collider.copy() : this.collider;
            }            obj.mass = this.mass;            obj.gravity = this.gravity;            obj.onGround = this.onGround;            obj.hitTest = this.hitTest;            obj.constantForce = this.constantForce;            obj.F = this.F.copy();            obj.v = this.v.copy();            obj.a = this.a.copy();            obj.position = this.position.copy();            obj.center = obj.position;            obj.rotation = this.rotation;            obj.onRender = this.onRender;            obj.onUpdate = this.onUpdate;            obj.onStart = this.onStart;            obj.onCollide = this.onCollider;            obj.onMouseDown = this.onMouseDown;            obj.onMouseUp = this.onMouseUp;            obj.onClick = this.onClick;            obj.onDoubleClick = this.onDoubleClick;            return obj;
        }        GameObject.prototype.resetForce = function ()
        {
            this.F.x = 0;            this.F.y = 0
        }        GameObject.prototype.resetConstantForce = function ()
        {
            this.constantForce.x = 0;            this.constantForce.y = 0;
        }        GameObject.prototype.force = function (a, b, c)
        {
            if (a instanceof Force)
            {
                if (b)
                {
                    this.constantForce.x += a.x;                    this.constantForce.y += a.y;                    return this.constantForce;
                }                this.F.x += a.x;                this.F.y += a.y;                return this.F;
            }            else if (isNaN(a) || isNaN(b))
            {
                throw new Error("Paramate must be a Number.");
            }            else
            {
                if (c)
                {
                    this.constantForce.x += a;                    this.constantForce.y += b;                    return this.constantForce;
                }                this.F.x += a;                this.F.y += b;                return this.F;
            }
        }        GameObject.prototype.addMomenta = function (p)
        {
        }        GameObject.prototype.drawToCanvas = function (canvas, x, y, r, dt)
        {
            if (this.graphic)                this.graphic.drawToCanvas(canvas, x, y, r, dt);
        }        GameObject.prototype.render = function (graphics, x, y, r, dt)
        {
            if (this._animCallback)                this._animCallback(dt);            if (this.graphic)                this.graphic.render(graphics, x, y, r, dt);
        }        GameObject.prototype.setCenter = function (x, y)
        {
            this.position.x = x;            this.position.y = y;
        }        GameObject.prototype.moveTo = function (x, y)
        {
            if (this.graphic)
            {
                this.graphic.moveTo(this.graphic.position.x - this.position.x + x, this.graphic.position.y - this.position.y + y);
            }            if (this.collider && this.collider != this.graphic)
            {
                this.collider.moveTo(this.collider.position.x - this.position.x + x, this.collider.position.y - this.position.y + y);
            }            this.position.x = x;            this.position.y = y;
        }        GameObject.prototype.moveAnimateTo = function (x, y, t, callback)
        {
            var startPosition = this.position.copy();            var time = 0;            var gameObject = this;            this._animCallback = function (dt)
            {
                time += dt;                if (time >= t)                    time = t;                gameObject.moveTo((x - startPosition.x) / t * time + startPosition.x, (y - startPosition.y) / t * time + startPosition.y);                if (time == t)
                {
                    gameObject._animCallback = null;                    if (callback)                        callback();
                }
            }
        }        engine.GameObject = GameObject;        window.GameObject = GameObject;        //-------Colliders        function Colliders() { }        //-------Circle        function Circle(r)
        {
            if (!r)                r = 0;            this.r = r;            this.o = new Point(0, 0);            this.position = new Point(0, 0);            this.center = this.position;            this.angV = 0;            this.rotate = 0;            this.rigidBody = false;            this.e = 1;            this.I = 1;//moment of inercial            this.mass = 1;            this.dff = 0;//dynamic friction factor            this.static = false;            this.soft = true;            this.landed = false;            this.strokeWidth = 1;            this.strokeStyle = new Color(0, 0, 0, 1);            this.fillStyle = new Color(255, 255, 255, 1);
        }        Circle.prototype.copy = function ()
        {
            var circle = new Circle(this.r);            circle.setCenter(this.o.x, this.o.y);            circle.strokeWidththis.strokeWidth;            if (this.strokeStyle instanceof Color)                circle.strokeStyle = this.strokeStyle.copy();            else                circle.strokeStyle = this.strokeStyle;            if (this.fillStyle instanceof Color)                circle.fillStyle = this.fillStyle.copy();            else                circle.fillStyle = this.fillStyle;            return circle;
        }        Circle.prototype.setPosition = function (x, y)
        {
            this.o.x += x - this.position.x;            this.o.y += y - this.position.y;            this.position.x = x;            this.position.y = y;
        }        Circle.prototype.setCenter = function (x, y)
        {
            this.position.x = x;            this.position.y = y;
        }        Circle.prototype.moveTo = function (x, y)
        {
            if (x == this.position.x && y == this.position.y)                return;            this.o.x = this.o.x - this.position.x + x;            this.o.y = this.o.y - this.position.y + y;            this.position.x = x;            this.position.y = y;
        }        Circle.prototype.drawToCanvas = function (canvas, x, y, r, dt)
        {
            var ctx = canvas.getContext("2d");            ctx.beginPath();            ctx.arc(this.o.x, this.o.y, this.r, 0, 2 * Math.PI);            ctx.lineWidth = this.strokeWidth;            ctx.strokeStyle = this.strokeStyle;            ctx.fillStyle = this.fillStyle;            ctx.fill();            ctx.stroke();
        }        Circle.prototype.render = function (graphics, x, y, r, dt)
        {
            graphics.beginPath();            graphics.arc(this.o.x, this.o.y, this.r, 0, 2 * Math.PI);            graphics.lineWidth = this.strokeWidth;            graphics.strokeStyle = this.strokeStyle;            graphics.fillStyle = this.fillStyle;            graphics.fill();            graphics.stroke();
        }        Circle.prototype.isCross = function (obj)
        {
            if (obj instanceof Line)
            {
                return obj.isCross(this);
            }            else if (obj instanceof Circle)
            {
                return this.isCollideWith(obj);
            }
        }        Circle.prototype.isCollideWith = function (col)
        {
            if (col instanceof Polygon)
            {
                for (var i = 0; i < col.E.length; i++)
                {
                    if (col.E[i].isCross(this))                        return true;
                }                return false;
            }            else if (col instanceof Circle)
            {
                var dx = this.o.x - col.o.x;                var dy = this.o.y - col.o.y;                var d = dx * dx + dy * dy;                if ((this.r - col.r) * (this.r - col.r) <= d && d <= (this.r + col.r) * (this.r + col.r))                    return true;                return false;
            }            else if (col instanceof Rectangle)
            {
                if (col.o.x <= this.o.x && this.o.x <= col.o.x + col.width)
                {
                    if (col.o.y - this.r <= this.o.y && this.o.y <= col.o.y + col.height + this.r)
                        return true;
                }
                if (col.o.y <= this.o.y && this.o.y <= col.o.y + col.height)
                {
                    if (col.o.x - this.r <= this.o.x && this.o.x <= col.o.x + col.width + this.r)
                        return true;
                }
                for (var i = 0; i < 4; i++)
                {
                    var p = col.V[i];
                    if (((p.x - this.o.x) * (p.x - this.o.x) + (p.y - this.o.y) * (p.y - this.o.y)) <= this.r * this.r)
                        return true;
                }
                return false;
            }
        }        Circle.prototype.collide = function (self, target, dt)
        {
            if (self.collider.static && target.collider.static)                return;            if (target.collider instanceof Circle)
            {
                var args = new GameObject.CollideEventArgs();                args.dff = Math.min(self.collider.dff, target.collider.dff);                args.e = Math.min(self.collider.e, target.collider.e);                if (self.onCollide)
                {
                    args.target = target;                    self.onCollide(args);                    if (args.ignore)                        return;
                }                if (target.onCollide)
                {
                    args.target = self;                    target.onCollide(args);                    if (args.ignore)                        return;
                }                var o1 = self.collider.o;                var o2 = target.collider.o;                var m1 = self.collider.mass;                var m2 = target.collider.mass;                var v0 = self.v;                var e = args.e;                var dff = args.dff;                var v1 = new Vector2(0, 0);                var v2 = new Vector2(target.v.x - v0.x, target.v.y - v0.y);                var o21 = new Vector2(o1.x - o2.x, o1.y - o2.y);                var n = new Vector2(o21.y, -o21.x);                var Lo21 = o21.x * o21.x + o21.y * o21.y;                var Ln = n.x * n.x + n.y * n.y;                var vt = Vector2.multi(n, (v2.x * n.x + v2.y * n.y) / Ln);                var Lvn = v2.x * o21.x + v2.y * o21.y;                if (Lvn <= 0)
                {
                    return;
                }                var vn = Vector2.multi(o21, Lvn / Lo21);                //alert((v2.x*o21.x+v2.y*o21.y)/Lo21);                v1 = Vector2.multi(vn, (m2 + e * m2) / (m1 + m2));                v2 = Vector2.multi(vn, (m2 - e * m1) / (m1 + m2));                v1.plus(v0);                v2.plus(vt);                v2.plus(v0);                self.v = v1;                target.v = v2;
            }            else if (target.collider instanceof Rectangle)
            {
                var args = new GameObject.CollideEventArgs();                args.dff = Math.min(self.collider.dff, target.collider.dff);                args.e = Math.min(self.collider.e, target.collider.e);                if (self.onCollide)
                {
                    args.target = target;                    self.onCollide(args);                    if (args.ignore)                        return;
                }                if (target.onCollide)
                {
                    args.target = self;                    target.onCollide(args);                    if (args.ignore)                        return;
                }                var e = args.e;                var dff = args.dff;                var m1 = target.mass;                var m2 = self.mass;                var rect = target.collider;                var circle = self.collider;                var dx = -1, dy = -1;                var v0 = target.v;                var v1 = new Vector2(0, 0);                var v2 = new Vector2(self.v.x - v0.x, self.v.y - v0.y);                var minL = null;                var minLD = -1;                for (var i = 0; i < 4; i++)
                {
                    var l = rect.E[i];
                    if (v2.x * l.norV.x + v2.y * l.norV.y > 0) //Away from edge
                        continue;
                    var n = new Vector2(circle.o.x - l.p1.x, circle.o.y - l.p1.y);
                    var t = l.tanV.x * n.x + l.tanV.y * n.y;
                    if (0 <= t && t <= l.length) //In edge
                    {
                        var d = (n.x * l.norV.x + n.y * l.norV.y);
                        if (0 <= d && d <= circle.r) //Touch
                        {
                            if (d < minLD || minLD < 0)
                            {
                                minL = l;
                                minLD = d;
                            }
                        }
                    }
                }                minP = null;                minPD = -1;                for (var i = 0; i < 4; i++)
                {
                    var p = rect.V[i];
                    if (v2.x * p.norV.x + v2.y * p.norV.y > 0) //Away from Point
                        continue;
                    var n = new Vector2(circle.o.x - p.x, circle.o.y - p.y);
                    var d = n.mod();
                    if (0 <= d && d <= circle.r)
                    {
                        if (d < minPD || minPD < 0)
                        {
                            minP = p;
                            minPD = d;
                        }
                    }
                }                if (minLD < 0 && minPD < 0)                    return;                var vn = null, vt = null;                if (minPD < 0 || (minLD > 0 && minLD <= minPD)) //Collide with edge
                {
                    vn = Vector2.multi(minL.norV, (v2.x * minL.norV.x + v2.y * minL.norV.y));
                    vt = new Vector2(v2.x - vn.x, v2.y - vn.y);
                }                else if (minLD < 0 || (minPD >= 0 && minPD < minLD)) //Collide with Point                {
                    var n = new Vector2(minP.x - circle.o.x, minP.y - circle.o.y);
                    var Ln = n.x * n.x + n.y * n.y;
                    vn = Vector2.multi(n, (n.x * v2.x + n.y * v2.y) / Ln);
                    vt = new Vector2(v2.x - vn.x, v2.y - vn.y);
                }
                else
                    return;
                if (!vn || !vt)
                    return;
                if (self.collider.static)
                {
                    v1.x = 2 * vn.x;
                    v1.y = 2 * vn.y;
                }
                else if (target.collider.static)
                {
                    v2.x = -vn.x;
                    v2.y = -vn.y;
                }
                else
                {
                    v1 = Vector2.multi(vn, (m2 + e * m2) / (m1 + m2));
                    v2 = Vector2.multi(vn, (m2 - e * m1) / (m1 + m2));
                }                v2.plus(vt);                v2.plus(v0);                v1.plus(v0);                target.v = v1;                self.v = v2;
            }            else
            {
                return;                return target.collider.collide(target, self, dt);
            }
        }        Colliders.Circle = Circle;        window.Circle = Circle;        //-------Polygon        function Polygon(v)
        {
            if (!(v instanceof Array))                throw new Error("Paramater v must be a array of points");            this.E = new Array();            this.V = new Array();            this.strokeWidth = 1;            this.strokeStyle = new Color(0, 0, 0, 1);            this.fillStyle = new Color(255, 255, 255, 1);            this.V = v;            this.E = new Array();            this.rigidBody = false;            this.bounce = 1;            this.dff = 0;//dynamic friction factor            this.static = false;            this.soft = true;            this.landed = false;            var sumX = 0, sumY = 0;            for (var i = 0; i < v.length; i++)
            {
                sumX += v[i].x;                sumY += v[i].y;                var j = (i + 1) % v.length;                this.E[i] = new Line(v[i], v[j]);
            }            this.center = new Point(sumX / v.length, sumY / v.length);            this.position = this.center;
        }        Polygon.createRect = function (x, y, width, height)
        {
            var v = [];            v[0] = new Point(x, y);            v[1] = new Point(x + width, y);            v[2] = new Point(x + width, y + height);            v[3] = new Point(x, y + height);            return new Polyon(v);
        }        /*        Polygon.prototype.addLine=function(l)        {            if(!(l instanceof Line))                throw "paramter is not a line.";            if(!(this.E instanceof Array))            {                this.E=new Array();            }            this.E[this.E.length]=l;            l.polygon=this;            if(!(this.V instanceof Array))            {                this.V=new Array();            }            var existed=false;            for(var i=0;i<this.V.length;i++)            {                if(this.V[i].x==l.p1.x && this.V[i].y==l.p1.y)                {                    existed=true;                    break;                }            }            if(!existed)                this.V[this.V.length]=l.p1;            existed=false;            for(var i=0;i<this.V.length;i++)            {                if(this.V[i].x==l.p2.x && this.V[i].y==l.p2.y)                {                    existed=true;                    break;                }            }            if(!existed)                this.V[this.V.length]=l.p2;        }        */        Polygon.prototype.copy = function ()
        {
            var v = [];            for (var i = 0; i < this.V.length; i++)
            {
                v[i] = new Point(this.V[i].x, this.V[i].y);
            }            var pol = new Polygon(v);            pol.strokeWidth = this.strokeWidth;            if (this.strokeStyle instanceof Color)                pol.strokeStyle = this.strokeStyle.copy();            else                pol.strokeStyle = this.strokeStyle;            if (this.fillStyle instanceof Color)                pol.fillStyle = this.fillStyle.copy();            else                pol.fillStyle = this.fillStyle;            pol.setCenter(this.center.x, this.center.y);            return pol;
        }        Polygon.prototype.moveTo = function (x, y)
        {
            for (var i = 0; i < this.V.length; i++)
            {
                this.V[i].x = (this.V[i].x - this.center.x) + x;                this.V[i].y = (this.V[i].y - this.center.y) + y;
            }            this.center.x = x;            this.center.y = y;
        }        Polygon.prototype.setCenter = function (x, y)
        {
            this.center.x = x;            this.center.y = y;
        }        Polygon.prototype.isCollideWith = function (col)
        {
            if (!(col instanceof Polygon) && !(col instanceof Circle))                throw new Error("The parameter is not a collider");            if (!(this.E instanceof Array))
            {
                throw new Error("Something wrong with this polygon");
            }            if (col instanceof Polygon)
            {
                if (!(col.E instanceof Array))
                {
                    throw new Error("Something wrong with the polygon");
                }                for (var i = 0; i < this.E.length; i++)                    for (var j = 0; j < col.E.length; j++)
                    {
                        if (this.E[i].isCross(col.E[j]))
                        {                            //Graphics.drawLine(this.E[i], "red");                            //Graphics.drawLine(col.E[j], "red");                            return true;
                        }
                    }                return false;
            }            else if (col instanceof Circle)
            {
                for (var i = 0; i < this.E.length; i++)
                {
                    if (this.E[i].isCross(col))                        return true;
                }                return false;
            }            return false;
        }        Polygon.prototype.render = function (graphics, x, y, r, dt)
        {
            graphics.beginPath();            if (this.V.length < 3)                throw new Error("The polygen must contains at least 3 points.");            graphics.moveTo(this.V[0].x, this.V[0].y);            for (var i = 1; i < this.V.length; i++)                graphics.lineTo(this.V[i].x, this.V[i].y);            graphics.lineTo(this.V[0].x, this.V[0].y);            graphics.lineWidth = this.strokeWidth;            graphics.strokeStyle = this.strokeStyle;            graphics.fillStyle = this.fillStyle;            graphics.fill();            graphics.stroke();
        }        Colliders.Polygon = Polygon;        window.Polygon = Polygon;        //-------Rectangle        function Rectangle(w, h)
        {
            w = isNaN(w) ? 0 : w;            h = isNaN(h) ? 0 : h;            this.width = w;            this.height = h;            this.o = new Point(0, 0);            this.position = new Point(w / 2, h / 2);            this.center = this.position;            this.rigidBody = false;            this.dff = 0;//dynamic friction factor            this.e = 1;            this.I = 1;//moment of inercial            this.mass = 1;            this.static = false;            this.soft = true;            this.landed = false;            this.fillStyle = new Color(255, 255, 255, 1);            this.strokeStyle = new Color(0, 0, 0, 1);            this.V = [                new Point(0, 0),                new Point(w, 0),                new Point(w, h),                new Point(0, h)];            this.E = [                    new Line(this.V[0], this.V[1]),                    new Line(this.V[1], this.V[2]),                    new Line(this.V[2], this.V[3]),                    new Line(this.V[3], this.V[0])];            for (var i = 0; i < 4; i++)
            {
                var p = this.V[i];
                p.norV = new Vector2(p.x - this.center.x, p.y - this.center.y);
                p.tanV = new Vector2(-p.norV.y, p.norV.x);
            }            //Length            this.E[0].length = w;            this.E[1].length = h;            this.E[2].length = w;            this.E[3].length = h;            //Normal Vector            this.E[0].norV = new Vector2(0, -1);            this.E[1].norV = new Vector2(1, 0);            this.E[2].norV = new Vector2(0, 1);            this.E[3].norV = new Vector2(-1, 0);            //Tangent Vector            this.E[0].tanV = new Vector2(1, 0);            this.E[1].tanV = new Vector2(0, 1);            this.E[2].tanV = new Vector2(-1, 0);            this.E[3].tanV = new Vector2(0, -1);
        }        Rectangle.prototype.copy = function ()
        {
            var rect = new Rectangle(this.width, this.height);            rect.o = this.o.copy();            rect.position = this.position.copy();            rect.rigidBody = this.rigidBody;            rect.bounce = this.bounce;            rect.dff = this.dff;            rect.static = this.static;            rect.soft = this.soft;            rect.landed = this.landed;            if (this.strokeStyle instanceof Color)                rect.strokeStyle = this.strokeStyle.copy();            else                rect.strokeStyle = this.strokeStyle;            if (this.fillStyle instanceof Color)                rect.fillStyle = this.fillStyle.copy();            else                rect.fillStyle = this.fillStyle;            return rect;
        }        Rectangle.prototype.setCenter = function (x, y)
        {
            if (!isNaN(x) && !isNaN(y))
            {
                this.position.x = x;                this.position.y = y;
            }            else
            {
                this.position.x = this.o.x + (x(this.width, this.height)).x;                this.position.y = this.o.y + this.height - (x(this.width, this.height)).y;
            }
        }        Rectangle.prototype.moveTo = function (x, y)
        {
            var dx = x - this.position.x;            var dy = y - this.position.y;            this.o.x += dx;            this.o.y += dy;            for (var i = 0; i < 4; i++)
            {
                this.V[i].x += dx;
                this.V[i].y += dy;
            }            this.position.x = x;            this.position.y = y;
        }        Rectangle.prototype.setPosition = Rectangle.prototype.moveTo;        Rectangle.prototype.drawToCanvas = function (canvas, x, y, r, dt)
        {
            var ctx = canvas.getContext("2d");            ctx.fillStyle = this.fillStyle;            ctx.strokeStyle = this.strokeStyle;            ctx.fillRect(this.o.x, this.o.y, this.width, this.height);            ctx.strokeRect(this.o.x, this.o.y, this.width, this.height);
        }        Rectangle.prototype.render = function (graphic, x, y, r, dt)
        {
            graphic.fillStyle = this.fillStyle;            graphic.strokeStyle = this.strokeStyle;            graphic.fillRect(this.o.x, this.o.y + this.height, this.width, this.height);            graphic.strokeRect(this.o.x, this.o.y + this.height, this.width, this.height);
        }        Rectangle.prototype.isCollideWith = function (obj)
        {
            if (obj instanceof Ground)
            {
                return (!(this.o.x > obj.xR || this.o.x + this.width < obj.xL) && (this.o.y >= obj.y && obj.y >= this.o.y - this.height));
            }            else if (obj instanceof Wall)
            {
                return (!(this.o.y - this.height > obj.yH || this.o.y < obj.yL) && (this.o.x <= obj.x && obj.x <= this.o.x + this.width));
            }            else if (obj instanceof Rectangle)
            {
                if (this.o.x - obj.width <= obj.o.x && obj.o.x <= this.o.x + this.width
                 && this.o.y - obj.height <= obj.o.y && obj.o.y <= this.o.y + this.height)
                    return true;
                return false;
                var x1 = (obj.o.x - this.o.x) * (obj.o.x + obj.width - this.o.x);                var x2 = (obj.o.x - (this.o.x + this.width)) * (obj.o.x + obj.width - (this.o.x + this.width));                var y1 = (obj.o.y - this.o.y) * (obj.o.y + obj.height - this.o.y);                var y2 = (obj.o.y - (this.o.y + this.height)) * (obj.o.y + obj.height - (this.o.y + this.height));                if (obj.o.x + obj.width < this.o.x || this.o.x + this.width < obj.o.x ||                   obj.o.y - obj.height > this.o.y || this.o.y - this.height > obj.o.y)
                {
                    return false;
                }                else                    return true;
            }            else if (obj instanceof Point)
            {
                if (this.o.x <= obj.x && obj.x <= this.o.x + this.width && obj.y <= this.o.y && this.o.y - this.height <= obj.y)                    return true;                else                    return false;
            }            else if (obj instanceof Circle)                return obj.isCollideWith(this);
        }        Rectangle.prototype.collide = function (self, target, dt)
        {
            if (self.collider.static && target.collider.static)                return;            if (target.collider instanceof Rectangle)
            {
                var args = new GameObject.CollideEventArgs();                args.dff = Math.min(self.collider.dff, target.collider.dff);                args.e = Math.min(self.collider.e, target.collider.e);                if (self.onCollide)
                {
                    args.target = target;                    self.onCollide(args);                    if (args.ignore)                        return;
                }                if (target.onCollide)
                {
                    args.target = self;                    target.onCollide(args);                    if (args.ignore)                        return;
                }                var dff = args.dff;                var e = args.e;                var dx = -1, dy = -1;                var v0 = self.v;                var v1 = new Vector2(0, 0);                var v2 = new Vector2(target.v.x - v0.x, target.v.y - v0.y);                var rect1 = self.collider;                var rect2 = target.collider;                var m1 = rect1.mass;                var m2 = rect2.mass;                /*if (rect1.o.x - rect2.width <= rect2.o.x && rect2.o.x <= rect1.o.x + rect1.width) 
                {
                    var dBottom = rect1.o.y - (rect2.o.y + rect2.height);
                    var dTop = (rect1.o.y + rect1.height) - rect2.o.y;
                    if (Math.abs(dBottom) < Math.abs(dTop))
                    {
    
                    }
                }*/                if (target.v.x - self.v.x < 0)
                {
                    dx = Math.abs((rect1.o.x + rect1.width) - rect2.o.x); //Distance from rect1.right to rect2.left                }                else if (target.v.x - self.v.x > 0)
                {
                    dx = Math.abs((rect2.o.x + rect2.width) - rect1.o.x); //Distance from rect1.left to rect2.right                }                else if (target.v.x - self.v.x == 0)
                {
                    dx = Math.min(Math.abs(rect1.o.x + rect1.width - rect2.o.x), Math.abs(rect2.o.x + rect2.width - rect1.o.x)); //Get min distance                }                if (target.v.y - self.v.y < 0)
                {
                    dy = Math.abs((rect1.o.y + rect1.height) - rect2.o.y); //Distance from rect1.top to rect2.bottom                }                else if (target.v.y - self.v.y > 0)
                {
                    dy = Math.abs((rect2.o.y + rect2.height) - rect1.o.y); //Distance from rect1.bottom to rect2.top                }                else if (target.v.y - self.v.y == 0)
                {
                    dy = Math.min(Math.abs(rect1.o.y + rect1.height - rect2.o.y), Math.abs(rect2.o.y + rect2.height - rect1.o.y)); //Get min distance                }                if ((dx >= 0 && dx <= dy) || dy < 0) //Collide x                {
                    if (!rect1.static && !rect2.static)
                    {
                        v1.x = v2.x * ((m2 + e * m2) / (m1 + m2));                        v2.x = v2.x * ((m2 - e * m1) / (m1 + m2));                        /*                        v2 = 2 * target.mass * v1 / (target.mass + self.mass);                        v1=(target.mass-self.mass)*v1/(target.mass+self.mass);                        v2+=self.v.x;                        v1+=self.v.x;*/
                    }                    else if (rect1.static)
                    {
                        v2.x = -v2.x * e;
                    }                    else //rect2.static = true                    {
                        v1 = -v1.x * e;
                    }                    v2.plus(v0);                    v1.plus(v0);                    var t = dx / Math.abs(self.v.x - target.v.x);                    t = isNaN(t) ? 0 : t;                    t > dt ? dt : t;                    self.v = v1;                    target.v = v2;                    if (!rect1.soft || !rect2.soft)
                    {
                        self.moveTo(self.position.x + v1.x * t, self.position.y);
                        target.moveTo(target.position.x + v2.x * t, target.position.y);
                        /*
                        self.moveTo(self.position.x - (self.v.x * t) + (v1.x * (dt - t)), self.position.y);                        target.moveTo(target.position.x - (target.v.x * t) + (v2.x * (dt - t)), target.position.y);
                        */
                    }
                }                else if ((dy >= 0 && dy <= dx) || dx < 0) //Collide y                {
                    if (!rect1.static && !rect2.static)
                    {
                        v1.y = v2.y * ((m2 + e * m2) / (m1 + m2));                        v2.y = v2.y * ((m2 - e * m1) / (m1 + m2));
                    }                    else if (rect1.static)
                    {
                        v2.y = -v2.y * e;
                    }                    else //rect2.static = true
                    {
                        v1 = -v1.y * e;
                    }                    v2.plus(v0);                    v1.plus(v0);                    var t = dy / Math.abs(self.v.y - target.v.y);                    t = isNaN(t) ? 0 : t;                    t > dt ? dt : t;                    self.v = v1;                    target.v = v2;                    if (!rect1.soft || !rect2.soft)
                    {
                        self.moveTo(self.position.x, self.position.y + v1.y * t);
                        target.moveTo(target.position.x, target.position.y + v2.y * t);
                    }
                }
            }            else if (target.collider instanceof Ground)
            {
                if (self.collider.o.y - self.collider.height <= target.collider.y)
                {
                    var t = (self.collider.o.y - self.collider.height - target.collider.y) / self.v.y;                    t = isNaN(t) ? 0 : t;                    self.moveTo(self.position.x, self.position.y - self.v.y * t);                    self.v.y = -self.v.y * self.collider.bounce;                    if (self.gravity)                        self.collider.landed = true;
                }
            }            else if (target.collider instanceof Wall)
            {
            }            else if (target.collider instanceof Circle)
            {
                return target.collider.collide(target, self, dt);
            }
        }        Colliders.Rectangle = Rectangle;        window.Rectangle = Rectangle;        //-------Ground        function Ground(y, xL, xR)
        {
            xL = isNaN(xL) ? 0 : xL;            xR = isNaN(xR) ? Number.MAX_SAFE_INTEGER : xR;            this.position = new Point(xL, y);            this.y = y;            this.width = xR - xL;            this.xL = xL;            this.xR = xR;            this.static = true;            this.rigidBody = true;
        }        Ground.prototype.copy = function ()
        {
            var g = new Ground(this.y, this.xL, this.xR);            g.rigidBody = this.rigidBody;            g.static = this.static;            g.position = this.position.copy();            return g;
        }        Ground.prototype.moveTo = function (x, y)
        {
            this.y = y;            this.position.x = x;            this.position.y = y;
        }        Ground.prototype.setCenter = function (x, y, align)
        {
            this.y = y;            this.xL = x - align(this.xR - this.xL).x;            this.xR = this.xL + this.width;
        }        Ground.prototype.drawToCanvas = function (canvas, x, y, r, dt)
        {
            return;            var ctx = canvas.getContext("2d");            ctx.fillStyle = this.fillStyle;            ctx.strokeStyle = this.strokeStyle;            ctx.fillRect(this.center.x, this.center.y, canvas.width, this.height);            ctx.strokeRect(this.center.x, this.center.y, canvas.width, this.height);
        }        Ground.prototype.render = function (graphics, x, y, r, dt)
        {
            return;
        }        Ground.prototype.toGameObject = function ()
        {
            var obj = new GameObject();            obj.collider = this;            obj.graphic = this;            obj.mass = 1;            obj.gravity = false;            return obj;
        }        Ground.prototype.isCollideWith = function (col)
        {
            if (col instanceof Rectangle)                return col.isCollideWith(this);            else if (col instanceof Circle)                return col.isCollideWith(this);
        }        Ground.prototype.collide = function (ground, obj, dt)
        {
            if (obj.collider instanceof Rectangle)                return obj.collider.collide(obj, ground, dt);
        }        Colliders.Ground = Ground;        window.Ground = Ground;        //-------Wall        function Wall(x, yL, yH)
        {
            yL = isNaN(yL) ? 0 : yL;            yH = isNaN(yH) ? Number.MAX_SAFE_INTEGER : yH;            this.x = x;            this.height = yH - yL;            this.yL = yL;            this.yH = yH;            this.static = true;            this.rigidBody = true;            this.position = new Point(x, yL);
        }        Wall.prototype.copy = function ()
        {
            var w = new Wall(this.x, this.yL, this.yH);            w.rigidBody = this.rigidBody;            w.static = this.static;            w.position = this.position.copy();
        }        Wall.prototype.toGameObject = function ()
        {
            var obj = new GameObject();            obj.collider = this;            obj.graphic = this;            obj.mass = 1;            obj.gravity = false;            return obj;
        }        Wall.prototype.setCenter = function (x, y, align)
        {
            this.x = x;            this.yH = y + align(this.height);            this.yL = this.yH - this.height;            this.position.x = x;            this.position.y = y;
        }        Wall.prototype.moveTo = function (x, y)
        {
            this.x += (x - this.position.x);            this.yH += (y - this.position.y);            this.yL += (y - this.position.y);            this.position.x = x;            this.position.y = y;
        }        Wall.prototype.isCollideWith = function (col)
        {
            if (col instanceof Rectangle)                return col.isCollideWith(this);
        }        Colliders.Wall = Wall;        window.Wall = Wall;        function OneWayGround()
        {
        }        engine.Colliders = Colliders;        window.Colliders = Colliders;        //----------------------        sar.Web.Engine2D = engine;        return sar;
    } catch (ex) { alert(ex.message); }
})(window.SardineFish);