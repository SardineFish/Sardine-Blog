var isHttps = location.protocol === "https:";
var resourceDictionary = new Array();
var domain = isHttps ? "//cdn-static.sardinefish.com/" : '//static.sardinefish.com/';
resourceDictionary["img/logo/logo_01.jpg"] = domain + "Img/Logo/Logo_01.JPG";
resourceDictionary["img/logo/logo_00.jpg"] = domain + "Img/Logo/Logo_00.JPG";
resourceDictionary["img/logo/logo_01.bmp"] = domain + "Img/Logo/Logo_01.bmp";
resourceDictionary["img/logo/logo_00.bmp"] = domain + "Img/Logo/Logo_00.bmp";
resourceDictionary["img/logo/logo_main_1024.min.png"] = domain + "Img/Logo/Logo_Main_1024.min.png";
resourceDictionary["img/logo/logo_main_800.min.png"] = domain + "Img/Logo/Logo_Main_800.min.png";
resourceDictionary["img/logo/logo_main_512.min.png"] = domain + "Img/Logo/Logo_Main_512.min.png";
resourceDictionary["img/logo/logo_main_400.min.png"] = domain + "Img/Logo/Logo_Main_400.min.png";
resourceDictionary["img/logo/logo_main_256.min.png"] = domain + "Img/Logo/Logo_Main_256.min.png";
resourceDictionary["img/logo/logo_main_200.min.png"] = domain + "Img/Logo/Logo_Main_200.min.png";
resourceDictionary["img/logo/logo_main_128.min.png"] = domain + "Img/Logo/Logo_Main_128.min.png";
resourceDictionary["img/logo/logo_menubar_50.min.png"] = domain + "Img/Logo/logo_menubar_50.min.png";
resourceDictionary["img/logo/logo_menubar_50.png"] = domain + "Img/Logo/logo_menubar_50.png";

function resource()
{
}
function lib()
{
}
function style()
{
}
function script()
{
}
function minImgClass()
{
    this.JPG = "";
    this.PNG = "";
}
function imgClass()
{
    this.JPG = "";
    this.PNG = "";
    this.BMP = "";
    this.min = new minImgClass();
}
//-----------------------------------------Resource-----------------------------------------
resource.icon = function () { };
resource.font = function () { };
resource.domain = isHttps ? "//cdn-static.sardinefish.com/" : "http://static.sardinefish.com/";
//static/font/
resource.font.fontIcons = resource.domain + "static/font/fontIcons.woff";
resource.font.segmdl2 = resource.domain + "static/font/segmdl2.woff";
//Img/
resource.img = function () { };
//Img/Logo/
resource.img.logo = function () { };
//Img/Logo/Logo_
resource.img.logo.logo = new Array();
resource.img.logo.logo[256] = new imgClass();
resource.img.logo.logo[256].BMP = resource.domain + "img/logo/Logo_256.bmp";
resource.img.logo.logo[256].JPG = resource.domain + "img/logo/Logo_256.jpg";
resource.img.logo.logo[50] = new imgClass();
resource.img.logo.logo[50].PNG = resource.domain + "img/logo/Logo_50.png";
resource.img.logo.logo[50].min.PNG = resource.domain + "img/logo/Logo_50.min.png";
//img/logo/Logo_Main_
resource.img.logo.logoMain = new Array();
resource.img.logo.logoMain[1024] = new imgClass();
resource.img.logo.logoMain[1024].PNG = resource.domain + "img/logo/Logo_Main_1024.png";
resource.img.logo.logoMain[1024].min.PNG = resource.domain + "img/logo/Logo_Main_1024.min.png";
resource.img.logo.logoMain[800] = new imgClass();
resource.img.logo.logoMain[800].PNG = resource.domain + "img/logo/Logo_Main_800.png";
resource.img.logo.logoMain[800].min.PNG = resource.domain + "img/logo/Logo_Main_800.min.png";
resource.img.logo.logoMain[512] = new imgClass();
resource.img.logo.logoMain[512].PNG = resource.domain + "img/logo/Logo_Main_512.png";
resource.img.logo.logoMain[512].min.PNG = resource.domain + "img/logo/Logo_Main_512.min.png";
resource.img.logo.logoMain[400] = new imgClass();
resource.img.logo.logoMain[400].PNG = resource.domain + "img/logo/Logo_Main_400.png";
resource.img.logo.logoMain[400].min.PNG = resource.domain + "img/logo/Logo_Main_400.min.png";
resource.img.logo.logoMain[256] = new imgClass();
resource.img.logo.logoMain[256].PNG = resource.domain + "img/logo/Logo_Main_256.png";
resource.img.logo.logoMain[256].min.PNG = resource.domain + "img/logo/Logo_Main_256.min.png";
resource.img.logo.logoMain[200] = new imgClass();
resource.img.logo.logoMain[200].PNG = resource.domain + "img/logo/Logo_Main_200.png";
resource.img.logo.logoMain[200].min.PNG = resource.domain + "img/logo/Logo_Main_200.min.png";
resource.img.logo.logoMain[128] = new imgClass();
resource.img.logo.logoMain[128].PNG = resource.domain + "img/logo/Logo_Main_128.png";
resource.img.logo.logoMain[128].min.PNG = resource.domain + "img/logo/Logo_Main_128.min.png";

//img/logo/SardineFish_
resource.img.logo.sardineFish = [];
resource.img.logo.sardineFish[900] = new imgClass();
resource.img.logo.sardineFish[900].min.PNG = resource.domain + "img/logo/SardineFish_900.min.png";
resource.img.logo.sardineFish[400] = new imgClass();
resource.img.logo.sardineFish[400].min.PNG = resource.domain + "img/logo/SardineFish_400.min.png";
resource.img.logo.sardineFish[200] = new imgClass();
resource.img.logo.sardineFish[200].min.PNG = resource.domain + "img/logo/SardineFish_200.min.png";
resource.img.logo.sardineFish[100] = new imgClass();
resource.img.logo.sardineFish[100].min.PNG = resource.domain + "img/logo/SardineFish_100.min.png";

//Img/Decoration/
resource.img.decoration = function () { };
//Img/Decoration/Tag_
resource.img.decoration.tag = new Array();
resource.img.decoration.tag[20] = new imgClass();
resource.img.decoration.tag[20].PNG = resource.domain + "img/decoration/Tag_20.png";
resource.img.decoration.tag[20].min.PNG = resource.domain + "img/decoration/Tag_20.min.png";
//img/decoration/QQ_
resource.img.decoration.qq = new Array();
resource.img.decoration.qq[32] = new imgClass();
resource.img.decoration.qq[32].PNG = resource.domain + "img/decoration/QQ_32.png";
resource.img.decoration.qq[32].min.PNG = resource.domain + "img/decoration/QQ_32.min.png";
//img/decoration/Weibo_
resource.img.decoration.weibo = new Array();
resource.img.decoration.weibo[32] = new imgClass();
resource.img.decoration.weibo[32].PNG = resource.domain + "img/decoration/Weibo_32.png";
resource.img.decoration.weibo[32].min.PNG = resource.domain + "img/decoration/Weibo_32.min.png";
//img/decoration/GitHub_
resource.img.decoration.gitHub = new Array();
resource.img.decoration.gitHub[32] = new imgClass();
resource.img.decoration.gitHub[32].PNG = resource.domain + "img/decoration/GitHub_32.png";
resource.img.decoration.gitHub[32].min.PNG = resource.domain + "img/decoration/GitHub_32.min.png";
//img/decoration/User_
resource.img.decoration.user = new Array();
resource.img.decoration.user[50] = new imgClass();
resource.img.decoration.user[50].PNG = resource.domain + "img/decoration/User_50.png";
resource.img.decoration.user[50].min.PNG = resource.domain + "img/decoration/User_50.min.png";
resource.img.decoration.user[32] = new imgClass();
resource.img.decoration.user[32].PNG = resource.domain + "img/decoration/User_32.png";
resource.img.decoration.user[32].min.PNG = resource.domain + "img/decoration/User_32.min.png";

resource.img.decoration.register = {};
resource.img.decoration.register.large = new Array();
resource.img.decoration.register.large[800] = new imgClass();
resource.img.decoration.register.large[800].JPG = resource.domain + "img/decoration/Register-Large-800.jpg";
resource.img.decoration.register.large[1500] = new imgClass();
resource.img.decoration.register.large[1500].JPG = resource.domain + "img/decoration/Register-Large-1500.jpg";
resource.img.decoration.register.large[2000] = new imgClass();
resource.img.decoration.register.large[2000].JPG = resource.domain + "img/decoration/Register-Large-2000.jpg";
resource.img.decoration.register.large[3000] = new imgClass();
resource.img.decoration.register.large[3000].JPG = resource.domain + "img/decoration/Register-Large-3000.jpg";

//img/works/
resource.img.works = function () { };
resource.img.works.default = new imgClass();
resource.img.works.url = resource.domain + "img/works/";
resource.img.works.default.PNG = resource.img.works.url + "Works_Default.png";
resource.img.works.default.min.PNG = resource.img.works.url + "Works_Default.min.png";

resource.sardineImg = function () { };
resource.sardineImg.domain = isHttps ? "//cdn-img.sardinefish.com/" : "//img.sardinefish.com/";
resource.sardineImg.get=function(id)
{
    return resource.sardineImg.domain + id.toString();
}
//-----------------------------------------Style-----------------------------------------
style.id = "styleId.css";
style.class = "styleClass.css";
style.tag = "styleTag.css";

//-----------------------------------------CodeMirror-----------------------------------------
function codeMirror()
{
}
codeMirror.lib = function () { };
codeMirror.mode = function () { };
codeMirror.addon = function () { };
codeMirror.domain = "//cdn.jsdelivr.net/npm/codemirror@5.59.2/";
codeMirror.lib.css = codeMirror.domain + "lib/codemirror.css";
codeMirror.lib.script = codeMirror.domain + "lib/codemirror.min.js";
codeMirror.mode.clike = codeMirror.domain + "mode/clike/clike.js";
codeMirror.mode.css = codeMirror.domain + "mode/css/css.js";
codeMirror.mode.htmlembedded = codeMirror.domain + "mode/htmlembedded/htmlembedded.js";
codeMirror.mode.javascript = codeMirror.domain + "mode/javascript/javascript.js";
codeMirror.mode.pascal = codeMirror.domain + "mode/pascal/pascal.js";
codeMirror.mode.php = codeMirror.domain + "mode/php/php.js";
codeMirror.mode.python = codeMirror.domain + "mode/python/python.js";
codeMirror.mode.sql = codeMirror.domain + "mode/sql/sql.js";
codeMirror.mode.vb = codeMirror.domain + "mode/vb/vb.js";
codeMirror.mode.vbscript = codeMirror.domain + "mode/vbscript/vbscript.js";
codeMirror.mode.xml = codeMirror.domain + "mode/xml/xml.js";
codeMirror.mode.yaml = codeMirror.domain + "mode/yaml/yaml.js";
codeMirror.addon.hint = function () { };
codeMirror.addon.hint.showHintJS = codeMirror.domain + "addon/hint/show-hint.js";
codeMirror.addon.hint.showHintCSS = codeMirror.domain + "addon/hint/show-hint.css";
codeMirror.addon.hint.javaScriptHintJs = codeMirror.domain + "addon/hint/javascript-hint.js";

//-----------------------------------------SyntaxHighlighter-----------------------------------------
function syntaxHighlighter()
{
}
syntaxHighlighter.domain = "//apps.bdimg.com/libs/SyntaxHighlighter/3.0.83/";
syntaxHighlighter.styles = function () { }
syntaxHighlighter.scripts = function () { }
syntaxHighlighter.scripts.shCore = syntaxHighlighter.domain + "scripts/shCore.min.js";
syntaxHighlighter.scripts.shAutoloader = syntaxHighlighter.domain + "scripts/shAutoloader.min.js";
syntaxHighlighter.scripts.shBrushAppleScript = syntaxHighlighter.domain + "scripts/shBrushAppleScript.min.js";
syntaxHighlighter.scripts.shBrushAS3 = syntaxHighlighter.domain + "scripts/shBrushAS3.min.js";
syntaxHighlighter.scripts.shBrushBash = syntaxHighlighter.domain + "scripts/shBrushBash.min.js";
syntaxHighlighter.scripts.shBrushColdFusion = syntaxHighlighter.domain + "scripts/shBrushColdFusion.min.js";
syntaxHighlighter.scripts.shBrushCpp = syntaxHighlighter.domain + "scripts/shBrushCpp.min.js";
syntaxHighlighter.scripts.shBrushCSharp = syntaxHighlighter.domain + "scripts/shBrushCSharp.min.js";
syntaxHighlighter.scripts.shBrushCss = syntaxHighlighter.domain + "scripts/shBrushCss.min.js";
syntaxHighlighter.scripts.shBrushDelphi = syntaxHighlighter.domain + "scripts/shBrushDelphi.min.js";
syntaxHighlighter.scripts.shBrushDiff = syntaxHighlighter.domain + "scripts/shBrushDiff.min.js";
syntaxHighlighter.scripts.shBrushErlang = syntaxHighlighter.domain + "scripts/shBrushErlang.min.js";
syntaxHighlighter.scripts.shBrushGroovy = syntaxHighlighter.domain + "scripts/shBrushGroovy.min.js";
syntaxHighlighter.scripts.shBrushJava = syntaxHighlighter.domain + "scripts/shBrushJava.min.js";
syntaxHighlighter.scripts.shBrushJavaFX = syntaxHighlighter.domain + "scripts/shBrushJavaFX.min.js";
syntaxHighlighter.scripts.shBrushJScript = syntaxHighlighter.domain + "scripts/shBrushJScript.min.js";
syntaxHighlighter.scripts.shBrushPerl = syntaxHighlighter.domain + "scripts/shBrushPerl.min.js";
syntaxHighlighter.scripts.shBrushPhp = syntaxHighlighter.domain + "scripts/shBrushPhp.min.js";
syntaxHighlighter.scripts.shBrushPlain = syntaxHighlighter.domain + "scripts/shBrushPlain.min.js";
syntaxHighlighter.scripts.shBrushPowerShell = syntaxHighlighter.domain + "scripts/shBrushPowerShell.min.js";
syntaxHighlighter.scripts.shBrushPython = syntaxHighlighter.domain + "scripts/shBrushPython.min.js";
syntaxHighlighter.scripts.shBrushRuby = syntaxHighlighter.domain + "scripts/shBrushRuby.min.js";
syntaxHighlighter.scripts.shBrushSass = syntaxHighlighter.domain + "scripts/shBrushSass.min.js";
syntaxHighlighter.scripts.shBrushScala = syntaxHighlighter.domain + "scripts/shBrushScala.min.js";
syntaxHighlighter.scripts.shBrushSql = syntaxHighlighter.domain + "scripts/shBrushSql.min.js";
syntaxHighlighter.scripts.shBrushVb = syntaxHighlighter.domain + "scripts/shBrushVb.min.js";
syntaxHighlighter.scripts.shBrushXml = syntaxHighlighter.domain + "scripts/shBrushXml.min.js";
syntaxHighlighter.scripts.shLegacy = syntaxHighlighter.domain + "scripts/shLegacy.min.js";
syntaxHighlighter.styles.shCore = syntaxHighlighter.domain + "styles/shCore.min.css";
syntaxHighlighter.styles.shCoreDefault = syntaxHighlighter.domain + "styles/shCoreDefault.min.css";
syntaxHighlighter.styles.shCoreDjango = syntaxHighlighter.domain + "styles/shCoreDjango.min.css";
syntaxHighlighter.styles.shCoreEclipse = syntaxHighlighter.domain + "styles/shCoreEclipse.min.css";
syntaxHighlighter.styles.shCoreEmacs = syntaxHighlighter.domain + "styles/shCoreEmacs.min.css";
syntaxHighlighter.styles.shCoreFadeToGrey = syntaxHighlighter.domain + "styles/shCoreFadeToGrey.min.css";
syntaxHighlighter.styles.shCoreMDUltra = syntaxHighlighter.domain + "styles/shCoreMDUltra.min.css";
syntaxHighlighter.styles.shCoreMidnight = syntaxHighlighter.domain + "styles/shCoreMidnight.min.css";
syntaxHighlighter.styles.shCoreRDark = syntaxHighlighter.domain + "styles/shCoreRDark.min.css";
syntaxHighlighter.styles.shThemeDefault = syntaxHighlighter.domain + "styles/shThemeDefault.min.css";
syntaxHighlighter.styles.shThemeDjango = syntaxHighlighter.domain + "styles/shThemeDjango.min.css";
syntaxHighlighter.styles.shThemeEclipse = syntaxHighlighter.domain + "styles/shThemeEclipse.min.css";
syntaxHighlighter.styles.shThemeEmacs = syntaxHighlighter.domain + "styles/shThemeEmacs.min.css";
syntaxHighlighter.styles.shThemeFadeToGrey = syntaxHighlighter.domain + "styles/shThemeFadeToGrey.min.css";
syntaxHighlighter.styles.shThemeMDUltra = syntaxHighlighter.domain + "styles/shThemeMDUltra.min.css";
syntaxHighlighter.styles.shThemeMidnight = syntaxHighlighter.domain + "styles/shThemeMidnight.min.css";
syntaxHighlighter.styles.shThemeRDark = syntaxHighlighter.domain + "styles/shThemeRDark.min.css";

//-----------------------------------------Spectrum-----------------------------------------
function spectrum() { }
spectrum.scripts = function () { }
spectrum.domain = "//cdn.bootcss.com/spectrum/1.7.1/"
spectrum.css = spectrum.domain + "spectrum.min.css";
spectrum.js = spectrum.domain + "spectrum.min.js";

//-------------------------------------------------------------------------------------------------------------------------


lib.jQueryMinJs = "//cdn.bootcss.com/jquery/3.3.1/jquery.min.js";
lib.jQueryColorMinJs = "//cdn.bootcss.com/jquery-color/2.1.2/jquery.color.min.js";
lib.jQueryShadowAnimation = "/lib/Script/jQuery/jquery.shadow-animation.min.js";
lib.jQueryCookieMinJs = "//cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.min.js";
lib.pluploadMinJs = '//cdn.bootcss.com/jquery/3.1.0/jquery-3.1.0.min.js';
lib.pluploadMoxieSwf = '//cdn.staticfile.org/Plupload/2.1.1/Moxie.swf';
lib.qiniuMinJs = '/lib/Script/qiniu.min.js';
lib.codeMirror = codeMirror;
lib.syntaxHighlighter = syntaxHighlighter;


function toScriptHTMLTag(src)
{
    return '<script src="' + src + '"></script>';
}

function toCSSHTMLTag(href)
{
    return '<link type="text/css" rel="stylesheet" href="' + href + '"/>';
}

function toImgHTMLTag(src, id, className)
{
    id = id ? id : "";
    className = className ? className : "";
    return '<img id="' + id + '" class="' + className + '"  src="' + src + '" draggable="false"/>';
}