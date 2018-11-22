window.SardineFish=(function(sar){    if(!jQuery)    {        throw new Error("jQuery is required!");    }try{    if(!sar)        sar={};    sar.Web=(function(web)    {        if(!web)            web={};        return web;    })(sar.Web);    sar.Color = (function (color)
    {        if (color && color.version && color.version > 2.0)            return;        //-------Color        function Color(r, g, b, a)
        {
            r = parseInt(r);            g = parseInt(g);            b = parseInt(b);            if (isNaN(r) || r >= 256)                r = 255;            else if (r < 0)                r = 0;            if (isNaN(g) || g >= 256)                g = 255;            else if (g < 0)                g = 0;            if (isNaN(b) || b >= 256)                b = 255;            else if (b < 0)                b = 0;            if (isNaN(a) || a > 1.0)                a = 1.0;            else if (a < 0)                a = 0;            this.red = r;            this.green = g;            this.blue = b;            this.alpha = a;
        }        Color.version = 2.0;        Color.random = function ()
        {
            return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1.0);
        }        Color.fromString = function (str)
        {
            str = str.replace(new RegExp(/\s/g), "");
            
            var reg = new RegExp("#[0-9a-fA-F]{6}");
            if (reg.test(str))
            {
                str = str.replace("#", "");
                var strR = str.charAt(0) + str.charAt(1);
                var strG = str.charAt(2) + str.charAt(3);
                var strB = str.charAt(4) + str.charAt(5);
                var r = parseInt(strR, 16);
                var g = parseInt(strG, 16);
                var b = parseInt(strB, 16);
                return new Color(r, g, b, 1.0);
            }
            reg = new RegExp("rgb\\(([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1})\\)");
            if (reg.test(str))
            {
                var colorArray = str.replace("rgb(", "").replace(")", "").split(",");
                var r = parseInt(colorArray[0]);
                var g = parseInt(colorArray[1]);
                var b = parseInt(colorArray[2]);
                var a = 1.00;
                return new Color(r, g, b, a);
            }
            reg = new RegExp("rgba\\(([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1})\\)");
            if (reg.test(str))
            {
                var colorArray = str.replace("rgba(", "").replace(")", "").split(",");
                var r = parseInt(colorArray[0]);
                var g = parseInt(colorArray[1]);
                var b = parseInt(colorArray[2]);
                var a = parseFloat(colorArray[3]);
                return new Color(r, g, b, a);
            }
            switch (str)
            {
                case "transparent":
                    return new Color(255, 255, 255, 0);
                case "aliceblue":
                    return new Color(240, 248, 255, 1.0);
                case "antiquewhite":
                    return new Color(250, 235, 215, 1.0);
                case "aqua":
                    return new Color(0, 255, 255, 1.0);
                case "aquamarine":
                    return new Color(127, 255, 212, 1.0);
                case "azure":
                    return new Color(240, 255, 255, 1.0);
                case "beige":
                    return new Color(245, 245, 220, 1.0);
                case "bisque":
                    return new Color(255, 228, 196, 1.0);
                case "black":
                    return new Color(0, 0, 0, 1.0);
                case "blanchedalmond":
                    return new Color(255, 235, 205, 1.0);
                case "blue":
                    return new Color(0, 0, 255, 1.0);
                case "blueviolet":
                    return new Color(138, 43, 226, 1.0);
                case "brown":
                    return new Color(165, 42, 42, 1.0);
                case "burlywood":
                    return new Color(222, 184, 135, 1.0);
                case "cadetblue":
                    return new Color(95, 158, 160, 1.0);
                case "chartreuse":
                    return new Color(127, 255, 0, 1.0);
                case "chocolate":
                    return new Color(210, 105, 30, 1.0);
                case "coral":
                    return new Color(255, 127, 80, 1.0);
                case "cornflowerblue":
                    return new Color(100, 149, 237, 1.0);
                case "cornsilk":
                    return new Color(255, 248, 220, 1.0);
                case "crimson":
                    return new Color(220, 20, 60, 1.0);
                case "cyan":
                    return new Color(0, 255, 255, 1.0);
                case "darkblue":
                    return new Color(0, 0, 139, 1.0);
                case "darkcyan":
                    return new Color(0, 139, 139, 1.0);
                case "darkgoldenrod":
                    return new Color(184, 134, 11, 1.0);
                case "darkgray":
                    return new Color(169, 169, 169, 1.0);
                case "darkgreen":
                    return new Color(0, 100, 0, 1.0);
                case "darkgrey":
                    return new Color(169, 169, 169, 1.0);
                case "darkkhaki":
                    return new Color(189, 183, 107, 1.0);
                case "darkmagenta":
                    return new Color(139, 0, 139, 1.0);
                case "darkolivegreen":
                    return new Color(85, 107, 47, 1.0);
                case "darkorange":
                    return new Color(255, 140, 0, 1.0);
                case "darkorchid":
                    return new Color(153, 50, 204, 1.0);
                case "darkred":
                    return new Color(139, 0, 0, 1.0);
                case "darksalmon":
                    return new Color(233, 150, 122, 1.0);
                case "darkseagreen":
                    return new Color(143, 188, 143, 1.0);
                case "darkslateblue":
                    return new Color(72, 61, 139, 1.0);
                case "darkslategray":
                    return new Color(47, 79, 79, 1.0);
                case "darkslategrey":
                    return new Color(47, 79, 79, 1.0);
                case "darkturquoise":
                    return new Color(0, 206, 209, 1.0);
                case "darkviolet":
                    return new Color(148, 0, 211, 1.0);
                case "deeppink":
                    return new Color(255, 20, 147, 1.0);
                case "deepskyblue":
                    return new Color(0, 191, 255, 1.0);
                case "dimgray":
                    return new Color(105, 105, 105, 1.0);
                case "dimgrey":
                    return new Color(105, 105, 105, 1.0);
                case "dodgerblue":
                    return new Color(30, 144, 255, 1.0);
                case "firebrick":
                    return new Color(178, 34, 34, 1.0);
                case "floralwhite":
                    return new Color(255, 250, 240, 1.0);
                case "forestgreen":
                    return new Color(34, 139, 34, 1.0);
                case "fuchsia":
                    return new Color(255, 0, 255, 1.0);
                case "gainsboro":
                    return new Color(220, 220, 220, 1.0);
                case "ghostwhite":
                    return new Color(248, 248, 255, 1.0);
                case "gold":
                    return new Color(255, 215, 0, 1.0);
                case "goldenrod":
                    return new Color(218, 165, 32, 1.0);
                case "gray":
                    return new Color(128, 128, 128, 1.0);
                case "green":
                    return new Color(0, 128, 0, 1.0);
                case "greenyellow":
                    return new Color(173, 255, 47, 1.0);
                case "grey":
                    return new Color(128, 128, 128, 1.0);
                case "honeydew":
                    return new Color(240, 255, 240, 1.0);
                case "hotpink":
                    return new Color(255, 105, 180, 1.0);
                case "indianred":
                    return new Color(205, 92, 92, 1.0);
                case "indigo":
                    return new Color(75, 0, 130, 1.0);
                case "ivory":
                    return new Color(255, 255, 240, 1.0);
                case "khaki":
                    return new Color(240, 230, 140, 1.0);
                case "lavender":
                    return new Color(230, 230, 250, 1.0);
                case "lavenderblush":
                    return new Color(255, 240, 245, 1.0);
                case "lawngreen":
                    return new Color(124, 252, 0, 1.0);
                case "lemonchiffon":
                    return new Color(255, 250, 205, 1.0);
                case "lightblue":
                    return new Color(173, 216, 230, 1.0);
                case "lightcoral":
                    return new Color(240, 128, 128, 1.0);
                case "lightcyan":
                    return new Color(224, 255, 255, 1.0);
                case "lightgoldenrodyellow":
                    return new Color(250, 250, 210, 1.0);
                case "lightgray":
                    return new Color(211, 211, 211, 1.0);
                case "lightgreen":
                    return new Color(144, 238, 144, 1.0);
                case "lightgrey":
                    return new Color(211, 211, 211, 1.0);
                case "lightpink":
                    return new Color(255, 182, 193, 1.0);
                case "lightsalmon":
                    return new Color(255, 160, 122, 1.0);
                case "lightseagreen":
                    return new Color(32, 178, 170, 1.0);
                case "lightskyblue":
                    return new Color(135, 206, 250, 1.0);
                case "lightslategray":
                    return new Color(119, 136, 153, 1.0);
                case "lightslategrey":
                    return new Color(119, 136, 153, 1.0);
                case "lightsteelblue":
                    return new Color(176, 196, 222, 1.0);
                case "lightyellow":
                    return new Color(255, 255, 224, 1.0);
                case "lime":
                    return new Color(0, 255, 0, 1.0);
                case "limegreen":
                    return new Color(50, 205, 50, 1.0);
                case "linen":
                    return new Color(250, 240, 230, 1.0);
                case "magenta":
                    return new Color(255, 0, 255, 1.0);
                case "maroon":
                    return new Color(128, 0, 0, 1.0);
                case "mediumaquamarine":
                    return new Color(102, 205, 170, 1.0);
                case "mediumblue":
                    return new Color(0, 0, 205, 1.0);
                case "mediumorchid":
                    return new Color(186, 85, 211, 1.0);
                case "mediumpurple":
                    return new Color(147, 112, 219, 1.0);
                case "mediumseagreen":
                    return new Color(60, 179, 113, 1.0);
                case "mediumslateblue":
                    return new Color(123, 104, 238, 1.0);
                case "mediumspringgreen":
                    return new Color(0, 250, 154, 1.0);
                case "mediumturquoise":
                    return new Color(72, 209, 204, 1.0);
                case "mediumvioletred":
                    return new Color(199, 21, 133, 1.0);
                case "midnightblue":
                    return new Color(25, 25, 112, 1.0);
                case "mintcream":
                    return new Color(245, 255, 250, 1.0);
                case "mistyrose":
                    return new Color(255, 228, 225, 1.0);
                case "moccasin":
                    return new Color(255, 228, 181, 1.0);
                case "navajowhite":
                    return new Color(255, 222, 173, 1.0);
                case "navy":
                    return new Color(0, 0, 128, 1.0);
                case "oldlace":
                    return new Color(253, 245, 230, 1.0);
                case "olive":
                    return new Color(128, 128, 0, 1.0);
                case "olivedrab":
                    return new Color(107, 142, 35, 1.0);
                case "orange":
                    return new Color(255, 165, 0, 1.0);
                case "orangered":
                    return new Color(255, 69, 0, 1.0);
                case "orchid":
                    return new Color(218, 112, 214, 1.0);
                case "palegoldenrod":
                    return new Color(238, 232, 170, 1.0);
                case "palegreen":
                    return new Color(152, 251, 152, 1.0);
                case "paleturquoise":
                    return new Color(175, 238, 238, 1.0);
                case "palevioletred":
                    return new Color(219, 112, 147, 1.0);
                case "papayawhip":
                    return new Color(255, 239, 213, 1.0);
                case "peachpuff":
                    return new Color(255, 218, 185, 1.0);
                case "peru":
                    return new Color(205, 133, 63, 1.0);
                case "pink":
                    return new Color(255, 192, 203, 1.0);
                case "plum":
                    return new Color(221, 160, 221, 1.0);
                case "powderblue":
                    return new Color(176, 224, 230, 1.0);
                case "purple":
                    return new Color(128, 0, 128, 1.0);
                case "red":
                    return new Color(255, 0, 0, 1.0);
                case "rosybrown":
                    return new Color(188, 143, 143, 1.0);
                case "royalblue":
                    return new Color(65, 105, 225, 1.0);
                case "saddlebrown":
                    return new Color(139, 69, 19, 1.0);
                case "salmon":
                    return new Color(250, 128, 114, 1.0);
                case "sandybrown":
                    return new Color(244, 164, 96, 1.0);
                case "seagreen":
                    return new Color(46, 139, 87, 1.0);
                case "seashell":
                    return new Color(255, 245, 238, 1.0);
                case "sienna":
                    return new Color(160, 82, 45, 1.0);
                case "silver":
                    return new Color(192, 192, 192, 1.0);
                case "skyblue":
                    return new Color(135, 206, 235, 1.0);
                case "slateblue":
                    return new Color(106, 90, 205, 1.0);
                case "slategray":
                    return new Color(112, 128, 144, 1.0);
                case "slategrey":
                    return new Color(112, 128, 144, 1.0);
                case "snow":
                    return new Color(255, 250, 250, 1.0);
                case "springgreen":
                    return new Color(0, 255, 127, 1.0);
                case "steelblue":
                    return new Color(70, 130, 180, 1.0);
                case "tan":
                    return new Color(210, 180, 140, 1.0);
                case "teal":
                    return new Color(0, 128, 128, 1.0);
                case "thistle":
                    return new Color(216, 191, 216, 1.0);
                case "tomato":
                    return new Color(255, 99, 71, 1.0);
                case "turquoise":
                    return new Color(64, 224, 208, 1.0);
                case "violet":
                    return new Color(238, 130, 238, 1.0);
                case "wheat":
                    return new Color(245, 222, 179, 1.0);
                case "white":
                    return new Color(255, 255, 255, 1.0);
                case "whitesmoke":
                    return new Color(245, 245, 245, 1.0);
                case "yellow":
                    return new Color(255, 255, 0, 1.0);
                case "yellowgreen":
                    return new Color(154, 205, 50, 1.0);
                default:
                    return new Color(0, 0, 0, 1.0);
            }
        }        Color.prototype.copy = function ()
        {
            return new Color(this.red, this.green, this.blue, this.alpha);
        }        Color.prototype.toString = function ()
        {
            this.red = this.red > 255 ? 255 : this.red;
            this.green = this.green > 255 ? 255 : this.green;
            this.blue = this.blue > 255 ? 255 : this.blue;
            this.alpha = this.realphad > 1.0 ? 1.0 : this.alpha;

            this.red = this.red < 0 ? 0 : this.red;
            this.green = this.green < 0 ? 0 : this.green;
            this.blue = this.blue < 0 ? 0 : this.blue;
            this.alpha = this.alpha < 0.0 ? 0.0 : this.alpha;
            return "rgba(" + parseInt(this.red).toString() + "," + parseInt(this.green).toString() + "," + parseInt(this.blue).toString() + "," + this.alpha.toString() + ")";
        }
        Color.prototype.equal = function (color)
        {
            if (!color instanceof Color)
                return false;
            if (color.red == this.red && color.green == this.green && color.blue == this.blue && color.alpha == this.alpha)
                return true;
            return false;
        }


        window.Color = Color;
        return Color;
    })(sar.Color);    var UI={};    UI.themeColor="black";    UI.themeBgColor = "white";    var ButtonSyle = (function (buttonStyle)
    {
        buttonStyle = {};
        buttonStyle.None = 0;        buttonStyle.ColorExchange = 1;        buttonStyle.ColorTransit = 2;        buttonStyle.TextIcon = 3;        window.ButtonStyle = buttonStyle;
        return buttonStyle;
    })(ButtonSyle);    function setButton(obj, buttonStyle)    {        if (isNaN(buttonStyle))            buttonStyle = ButtonStyle.ColorExchange;        for(var i=0;i<obj.length;i++)        {            obj.get(i).buttonStyle = buttonStyle;            obj.get(i).addEventListener("touchstart",buttonMouseDown);            obj.get(i).addEventListener("touchend", buttonMouseUp);            obj.get(i).addEventListener("mousedown", buttonMouseDown);            obj.get(i).addEventListener("mouseup", buttonMouseUp);            obj.get(i).addEventListener("mouseover", buttonMouseEnter);            obj.get(i).addEventListener("mouseout", buttonMouseOut);        }                obj.attr("onselectstart", "return false");    }    function createTextButton(text)
    {
        var button = $('<a>' + text + '</a>');
        setButton(button, ButtonSyle.TextIcon);
        return button;
    }    UI.setButton = setButton;    function buttonMouseEnter(e)
    {
        var button = e.target;
        var color = window.Color.fromString($(button).css("color"));
        var bgColor = Color.fromString($(button).css("background-color"));
        var borderTopColor = Color.fromString($(button).css("border-top-color"));
        var borderLeftColor = Color.fromString($(button).css("border-left-color"));
        var borderRightColor = Color.fromString($(button).css("border-right-color"));
        var borderBottomColor = Color.fromString($(button).css("border-bottom-color"));
        button.color = color.copy();
        button.bgColor = bgColor.copy();
        button.borderTopColor = borderTopColor.copy();
        button.borderLeftColor = borderLeftColor.copy();
        button.borderRightColor = borderRightColor.copy();
        button.borderBottomColor = borderBottomColor.copy();

        if (button.buttonStyle == ButtonStyle.ColorTransit)
        {
            var r = color.red - bgColor.red;
            var g = color.green - bgColor.green;
            var b = color.blue - bgColor.blue;
            var a = color.alpha - bgColor.alpha;

            r *= 0.25;
            g *= 0.25;
            b *= 0.25;
            a *= 0.25;
            bgColor.red += r;
            bgColor.green += g;
            bgColor.blue += b;
            bgColor.alpha += a;
            $(button).css("background-color", bgColor.toString());
            if (button.borderTopColor.equal(button.bgColor))
            {
                $(button).css("border-top-color", bgColor.toString());
            }
            if (button.borderBottomColor.equal(button.bgColor))
            {
                $(button).css("border-bottom-color", bgColor.toString());
            }
            if (button.borderLeftColor.equal(button.bgColor))
            {
                $(button).css("border-left-color", bgColor.toString());
            }
            if (button.borderRightColor.equal(button.bgColor))
            {
                $(button).css("border-right-color", bgColor.toString());
            }
        }
        else if (button.buttonStyle == ButtonStyle.ColorExchange)
        {

        }
        else if (button.buttonStyle == ButtonStyle.TextIcon)
        {
            var r = color.red < 128 ? (0 - color.red) * 0.25 : (255 - color.red) * 0.25;
            var g = color.green < 128 ? (0 - color.green) * 0.25 : (255 - color.green) * 0.25;
            var b = color.blue < 128 ? (0 - color.blue) * 0.25 : (255 - color.blue) * 0.25;
            var a = color.alpha < 128 ? (0 - color.alpha) * 0.25 : (255 - color.alpha) * 0.25;
            color.red += r;
            color.green += g;
            color.blue += b;
            color.alpha += a;
            $(button).css("color", color.toString());
        }
    }    function buttonMouseOut(e)
    {
        var button = e.target;        var color = button.color.copy();
        var bgColor = button.bgColor.copy();

        if (button.buttonStyle == ButtonSyle.ColorTransit)
        {
            $(button).css("color", button.color.toString());
            //$(button).css("border-color", button.color.toString());
            $(button).css("background-color", button.bgColor.toString());
            if (button.borderTopColor.equal(button.bgColor))
            {
                $(button).css("border-top-color", button.bgColor.toString());
            }
            if (button.borderBottomColor.equal(button.bgColor))
            {
                $(button).css("border-bottom-color", button.bgColor.toString());
            }
            if (button.borderLeftColor.equal(button.bgColor))
            {
                $(button).css("border-left-color", button.bgColor.toString());
            }
            if (button.borderRightColor.equal(button.bgColor))
            {
                $(button).css("border-right-color", button.bgColor.toString());
            }
        }
        else if (button.buttonStyle == ButtonStyle.ColorExchange)
        {
            $(button).css("background-color", bgColor.toString());
            $(button).css("color", color.toString());
        }
        else if (button.buttonStyle == ButtonStyle.TextIcon)
        {
            $(button).css("color", button.color.toString());
        }
    }    function buttonMouseDown(e)    {
        var button = e.target;        if (!button.color)
        {            button.color = Color.fromString($(button).css("color"));
            button.bgColor = Color.fromString($(button).css("background-color"));
        }        var color = button.color.copy();
        var bgColor = button.bgColor.copy();


        if (button.buttonStyle == ButtonStyle.ColorTransit)
        {
            var r = color.red - bgColor.red;
            var g = color.green - bgColor.green;
            var b = color.blue - bgColor.blue;
            var a = color.alpha - bgColor.alpha;

            r *= 0.5;
            g *= 0.5;
            b *= 0.5;
            a *= 0.5;
            bgColor.red += r;
            bgColor.green += g;
            bgColor.blue += b;
            bgColor.alpha += a;
            $(button).css("background-color", bgColor.toString());
            if (button.borderTopColor.equal(button.bgColor))
            {
                $(button).css("border-top-color", bgColor.toString());
            }
            if (button.borderBottomColor.equal(button.bgColor))
            {
                $(button).css("border-bottom-color", bgColor.toString());
            }
            if (button.borderLeftColor.equal(button.bgColor))
            {
                $(button).css("border-left-color", bgColor.toString());
            }
            if (button.borderRightColor.equal(button.bgColor))
            {
                $(button).css("border-right-color", bgColor.toString());
            }
        }        else if (button.buttonStyle == ButtonStyle.ColorExchange)
        {
            $(button).css("background-color", color.toString());
            $(button).css("color", bgColor.toString());
            if (bgColor.alpha <= 0)
            {
                $(button).css("color", "white");
            }

        }
        else if (button.buttonStyle == ButtonStyle.TextIcon)
        {
            var r = color.red < 128 ? (0 - color.red) * 0.5 : (255 - color.red) * 0.5;
            var g = color.green < 128 ? (0 - color.green) * 0.5 : (255 - color.green) * 0.5;
            var b = color.blue < 128 ? (0 - color.blue) * 0.5 : (255 - color.blue) * 0.5;
            var a = color.alpha < 128 ? (0 - color.alpha) * 0.5 : (255 - color.alpha) * 0.5;
            color.red += r;
            color.green += g;
            color.blue += b;
            color.alpha += a;
            $(button).css("color", color.toString());
        }    }    function buttonMouseUp(e)    {        var button = e.target;        if (!button.color)
        {
            button.color = Color.fromString($(button).css("color"));
            button.bgColor = Color.fromString($(button).css("background-color"));
        }        var color = button.color.copy();
        var bgColor = button.bgColor.copy();

        if (button.buttonStyle == ButtonStyle.ColorTransit)
        {
            var dc = new Color(color.red - bgColor.red, color.green - bgColor.green, color.blue - bgColor.blue, color.alpha - bgColor.alpha);
            dc.red *= 0.25;
            dc.green *= 0.25;
            dc.blue *= 0.25;
            dc.alpha *= 0.25;
            bgColor.red += dc.red;
            bgColor.green += dc.green;
            bgColor.blue += dc.blue;
            bgColor.alpha += dc.alpha;
            $(button).css("background-color", bgColor.toString());
            if (button.borderTopColor.equal(button.bgColor))
            {
                $(button).css("border-top-color", bgColor.toString());
            }
            if (button.borderBottomColor.equal(button.bgColor))
            {
                $(button).css("border-bottom-color", bgColor.toString());
            }
            if (button.borderLeftColor.equal(button.bgColor))
            {
                $(button).css("border-left-color", bgColor.toString());
            }
            if (button.borderRightColor.equal(button.bgColor))
            {
                $(button).css("border-right-color", bgColor.toString());
            }
        }        else if (button.buttonStyle == ButtonStyle.ColorExchange)
        {
            $(button).css("background-color", bgColor.toString());
            $(button).css("color", color.toString());
        }
        else if (button.buttonStyle == ButtonStyle.TextIcon)
        {
            var r = color.red < 128 ? (0 - color.red) * 0.25 : (255 - color.red) * 0.25;
            var g = color.green < 128 ? (0 - color.green) * 0.25 : (255 - color.green) * 0.25;
            var b = color.blue < 128 ? (0 - color.blue) * 0.25 : (255 - color.blue) * 0.25;
            var a = color.alpha < 128 ? (0 - color.alpha) * 0.25 : (255 - color.alpha) * 0.25;
            color.red += r;
            color.green += g;
            color.blue += b;
            color.alpha += a;
            $(button).css("color", color.toString());
        }    }    function valueAnimate(from,to,time,fps,callback,complete)    {
        if (isNaN(from))
            from = 0;
        if (isNaN(to))
            to = 0;
        if (isNaN(time))
            time = 0;
        if (isNaN(fps))
            fps = 60;
        var dt = 1000 / fps;
        var t = 0;
        var v = from;
        function handle()
        {
            t += dt;
            v = from + ((to - from) * t / time);
            v = v > to ? to : v;
            if (callback)
            {
                callback(v);
            }
            if (t > time)
            {
                if (complete)
                    complete();
                return;
            }
            setTimeout(handle, Math.floor(dt));
        }
        setTimeout(handle, Math.floor(dt));
    }    UI.valueAnimate = valueAnimate;    function TextBox(dom)
    {
        var textbox = this;

        if (!dom)
        {
            dom = $('<div></div>');
        }
        dom = $(dom.get(0));//only one
        var edit = $('<input type="text" style="margin: 0px; padding: 0px; width: 100%; color: rgb(128, 128, 128); display: inline-block; border:none" contenteditable="true"/>');
        dom.html("");
        var div = $('<div></div>');
        div.css("position", "relative");
        div.append(edit);
        dom.append(div);

        var editDom = edit.get(0);
        this.editDom = editDom;
        editDom.color = Color.fromString(edit.css("color"));
        
        this.dom = dom.get(0);
        var button = null;
        var emptyText = "";
        Object.defineProperty(this, "button", {
            get: function ()
            {
                return button;
            },
            set: function (value)
            {
                button = value;
                button.css("display", "inline-block");
                button.css("vertical-align", "middle");
                button.addClass("textboxButton");
                div.append(button);
                var w = button.width();
                edit.css("width", "calc(100% - " + w.toString() + "px)");
            }
        });
        Object.defineProperty(this, "emptyText", {
            get: function () { return emptyText },
            set: function (value)
            {
                emptyText = value;
                edit.attr("placeholder", value);
            }
        });

        Object.defineProperty(this, "width", {
            get: function () { return $(dom).width(); },
            set: function (value) { $(dom).css("width", value.toString() + "px"); }
        });
        Object.defineProperty(this, "height", {
            get: function () { return $(dom).height(); },
            set: function (value) { $(dom).css("height", value.toString() + "px"); }
        });
        Object.defineProperty(this, "text", {
            get: function () { return edit.get(0).value },
            set: function (value) { edit.get(0).value = value; }
        });
    }    UI.TextBox = TextBox;    function setTextBox(obj, button)
    {
        if (!obj instanceof $)
        {
            throw new Error("the object must be an $ object");
        }
        for (var i = 0; i < obj.length ; i++)
        {
            new TextBox(obj, button);
            
        }
    }    UI.setTextBox = setTextBox;        sar.Web.UI=UI;    return sar;}catch(ex){alert("SardineFish.Web.UI:"+ex.message);}})(window.SardineFish);