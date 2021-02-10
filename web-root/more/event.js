
var pageCodeEditor;
var NotesPage = 1;
var Notes = new Array;
var ViewingNote;
var CommentPage = 1;
var Comments = new Array;

function evalCode(code)
{
    try
    {
        eval(code);

    }
    catch(ex)
    {
        console.warn(ex.message);
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
function loadNotes(clear, page)
{
    if (!page || isNaN(page))
        page = 1;
    NotesPage = page;
    if (clear)
        $("#notesArea").html("");
    SardineFish.API.Note.GetPage(page, 1, 10, function (data)
    {
        for (var i = 0; i < data.length ; i++)
        {
            var item = data[i];
            var id = item.id;
            Notes[id] = item;
            var noteItem = $("<div></div>");
            noteItem.attr("id", "noteItem" + id.toString());
            noteItem.addClass("noteItem");
            var div = $("<div></div>");
            div.attr("id", id);
            div.css("margin-left", "20px");
            var title = $("<h5></h5>");
            title.addClass("noteTitle");
            title.attr("id", "noteTitle" + id.toString());
            title.append(item.title);
            div.append(title);
            var time = $("<h6></h6>");
            time.addClass("noteTime");
            time.attr("id", "noteTime" + id.toString());
            time.text(item.time);
            div.append(time);
            var tags = $("<h6></h6>");
            tags.addClass("noteTags");
            tags.attr("id", "noteTags" + id.toString());
            tags.text(item.tags);
            div.append(tags);
            div.append("<br/>")
            var text = $("<h6></h6>");
            text.addClass("noteText");
            text.attr("id", "noteText" + id.toString());
            text.html(item.text);
            div.append(text);
            noteItem.append(div);
            var noteBottom = $("<div></div>");
            noteBottom.addClass("noteBottom");
            noteItem.append(noteBottom);
            var browseLink = $('<a class="textWithIcon noteTextWithIcon"></a>');
            browseLink.attr("id", "noteBrowse" + id.toString());
            browseLink.attr("onselectstart", "return false");
            browseLink.append($('<i class="iconBrowse"></i>'));
            browseLink.append('浏览(<i id="noteBrowseNumber' + id.toString() + '"></i>)');
            noteBottom.append(browseLink);
            var commentLink = $('<a class="textWithIcon noteTextWithIcon"></a>');
            commentLink.attr("id", "noteComment" + id.toString());
            commentLink.attr("onselectstart", "return false");
            commentLink.attr("onclick", "commentLinkClick(this, " + id.toString() + ")");
            commentLink.append($('<i class="iconComment"></i>'));
            commentLink.append('评论(<i id="noteCommentNumber' + id.toString() + '"></i>)');
            noteBottom.append(commentLink);
            var likeLink = $('<a class="textWithIcon noteTextWithIcon"></a>');
            likeLink.attr("id", "noteLike" + id.toString());
            likeLink.attr("onselectstart", "return false");
            likeLink.attr("onclick", "addLike(" + id.toString() + ",'note','noteLikeNumber" + id.toString() + "')");
            likeLink.append($('<i class="iconLike"></i>'));
            likeLink.append('赞(<i id="noteLikeNumber' + id.toString() + '"></i>)');
            noteBottom.append(likeLink);
            noteItem.append(noteBottom);
            SardineFish.API.PostData.Get(id,["browse", "comment", "like"], function (succeed, data, id)
            {
                if(succeed)
                {
                    $("#noteBrowseNumber" + id.toString()).text(data.browse);
                    $("#noteCommentNumber" + id.toString()).text(data.comment);
                    $("#noteLikeNumber" + id.toString()).text(data.like);
                }
            }, id);
            $("#notesArea").append(noteItem);
        }
    });
}
function getNote(id)
{
    if (!id || isNaN(id))
        return;
    SardineFish.API.Note.GetOne(id, 1, function (data)
    {
        var item = data[0];
        ViewingNote = item;
        ViewingNote.page = 1;
        viewNoteId = id;
        replyId = id;
        $("#noteTitle").text(item.title);
        $("#noteTime").text(item.time);
        $("#noteTags").text(item.tags);
        $("#noteText").html(item.text);
        SardineFish.API.PostData.Get(id, ["browse", "comment", "like"], function (succeed, data)
        {
            if (succeed)
            {
                $("#noteBrowseNumber").text(data.browse);
                $("#noteCommentNumber").text(data.comment);
                $("#noteLikeNumber").text(data.like);
            }
        });
        $("#noteLike").attr("onclick", "addLike(" + id.toString() + ",'note','noteLikeNumber')");
    });
}
function loadComment(id, clear, page)
{
    if (!id || isNaN(id))
        return;
    if (!page || isNaN(page))
        page = 1;
    CommentPage = page;
    if (clear)
        $("#noteCommentContainer").html("");
    SardineFish.API.Comment.Get(id, page, 5, function (data)
    {
        if (!data)
            return;
        for(var i=0;i<data.length ;i++)
        {
            var item = data[i];
            var pid = item.pid;
            Comments[pid] = item;
            Comments[pid].page = 1;
            var commentBorder = $('<div id="noteCommentItemBorder' + pid.toString() + '" class="borderObject noteCommentItemBorder"></div>');
            var commentItem = $('<div id="noteCommentItem' + pid.toString() + '" class="noteCommentItem"></div>');
            var logo = $('<img id="noteCommentLogo' + pid.toString() + '" class="noteCommentLogo" src="' + resource.img.decoration.user[50].PNG + '"/>');
            commentItem.append(logo);
            var content = $('<div id="noteCommentContent' + pid.toString() + '" class="noteCommentContent"></div>');
            commentItem.append(content);
            var uid = $('<h6 id="noteCommentUid' + pid.toString() + '" class="noteCommentUid">' + item.uid + '</h6>');
            content.append(uid);
            var text = $('<h6 id="noteCommentText' + pid.toString() + '" class="noteCommentText">' + item.text + '</h6>');
            content.append(text);
            content.append('<br/>');
            var time = $('<h6 id="noteCommentTime' + pid.toString() + '" class="noteCommentTime">' + item.time + '</h6>');
            content.append(time);
            var replyButton = $('<a id="noteCommentReplyButton' + pid.toString() + '" class="noteCommentReplyButton" href="javascript:void(0)" onclick="noteCommentReplyButtonClick(this,' + pid.toString() + ')"></a>');
            content.append(replyButton);
            var replyArea = $('<div id="notedCommentReplyAera' + pid.toString() + '" class="noteCommentReplyAera"></div>');
            commentItem.append(replyArea);
            commentBorder.append(commentItem);
            var commentReplyPage = $('<div id="noteCommentReplyPageAera' + pid.toString() + '" class="noteCommentReplyPageAera"></div>');
            var commentReplyPageDownButton = $('<div id="noteCommentReplyPageDownButton' + pid.toString() + '" class="button noteCommentReplyPageDownButton" onclick="commentReplyPageDownButtonClick(this, ' + pid.toString() + ')">︾</div>');
            commentReplyPageDownButton.css("display", "none");
            setButton(commentReplyPageDownButton);
            commentReplyPage.append(commentReplyPageDownButton);
            commentBorder.append(commentReplyPage);
            $("#noteCommentContainer").append(commentBorder);
            loadReply(pid, replyArea, true, 1);
        }
    });
    SardineFish.API.Statistics.Comment.Get(id, 'note', function (data)
    {
        if (isNaN(data))
            data = 0;
        if (data > page * 5)
        {
            $("#noteCommentPageDownButton").css("display", "block");
        }
        else
        {
            $("#noteCommentPageDownButton").css("display", "none");
        }
    });
}
function loadReply(pid, container, clear, page)
{
    if (!pid || isNaN(pid))
        return;
    if (!page || isNaN(page))
        page = 1;
    Comments[pid].page = page;
    if (clear)
        container.html("");
    SardineFish.API.Comment.Get(pid, page, 5, function (replyData, objArray)
    {
        var replyArea = objArray[0];
        var commentPid = objArray[1];
        for (var j = 0; j < replyData.length ; j++)
        {
            var replyItem = replyData[j];
            var pid = replyItem.pid;
            var commentReplyItem = $('<div id="noteCommentReplyItem' + pid.toString() + '" class="noteCommentReplyItem"></div>');
            var replylogo = $('<img id="noteCommentREplyLogo' + pid.toString() + '" class="noteCommentReplyLogo" src="' + resource.img.decoration.user[32].PNG + '"/>');
            commentReplyItem.append(replylogo);
            var replyContent = $('<div id="noteCommentReplyContent' + pid.toString() + '" class="noteCommentReplyContent"></div>');
            var replyUid = $('<h6 id="noteCommentReplyUid' + pid.toString() + '" class="noteCommentReplyUid">' + replyItem.uid + '</h6>');
            replyContent.append(replyUid);
            var replyText = $('<h6 id="noteCommentReplyText' + pid.toString() + '" class="noteCommentReplyText">' + replyItem.text + '</h6>');
            replyContent.append(replyText);
            replyContent.append('<br/>');
            var replyTime = $('<h6 id="noteCommentReplyTime' + pid.toString() + '" class="noteCommentTime">' + replyItem.time + '</h6>');
            replyContent.append(replyTime);
            var replyReplyButton = $('<a id="noteCommentReplyReplyButton' + pid.toString() + '" class="noteCommentReplyButton" href="javascript:void(0)" onclick="noteCommentReplyReplyButtonClick(this,' + commentPid.toString() + ', ' + pid.toString() + ')"></a>');
            replyContent.append(replyReplyButton);
            commentReplyItem.append(replyContent);
            replyArea.append(commentReplyItem);
        } 
    }, new Array(container, pid));
    SardineFish.API.Statistics.Comment.Get(pid, 'comment', function (data)
    {
        if (isNaN(data))
            data = 0;
        if (page * 5 < data)
        {
            $('#noteCommentReplyPageDownButton' + pid.toString()).css("display", "block");
        }
        else 
        {
            $("#noteCommentReplyPageDownButton" + pid.toString()).css("display", "none");
        }
    });
}
function addLike(id,type,numObj)
{
    SardineFish.API.Statistics.Like.Add(id, type, function (succeed, data, id)
    {
        if (!succeed)
            throw new Error(data);
        $("#" + numObj).text(data);
    }, id);
}
function Admin()
{
    var login = $.cookie("login");
    if (!login || login == "false")
    {
        $.cookie("ref", window.location, { path: "/" });
        window.location = "/account/login.html";
        return;
    }
    var postArea = $("#notePostArea");
    postArea.css("height", "0px");
    postArea.css("border-color", "rgba(200,200,200,0.00)");
    postArea.css("display", "block");
    postArea.animate({ borderColor: jQuery.Color("rgba(200,200,200,1.00)"), height: "277.84" }, 500, function ()
    {
        postArea.css("height", "auto");
    });
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
    loadNotes();
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
var leftmenuSelectOffset = 0;
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
    }
}
function menuButtonMouseOut(sender)
{
    if (sender)
    {
        var id = "#" + sender.id;
        $("#menuFocus").stop();
        $("#menuFocus").animate({ left: menuSelectOffset, backgroundColor: jQuery.Color("rgba(150,220,255,0.00)") }, 200);
    }
}
function leftMenuButtonMouseOver(sender)
{
    if(sender)
    {
        var id = "#" + sender.id;
        var y = $(id).offset().top - $("#leftMenuButtonNote").offset().top;
        leftmenuSelectOffset = y;
        $("#leftMenuFocus").stop();
        if ($("#leftMenuFocus").css("background-color") == "rgba(150, 220, 255, 0)")
        {
            $("#leftMenuFocus").css("top", y.toString() + "px");
            $("#leftMenuFocus").animate({ backgroundColor: jQuery.Color("rgba(150,220,255,1.00)") }, 200);
        }
        else
            $("#leftMenuFocus").animate({ top: y, backgroundColor: jQuery.Color("rgba(150,220,255,1.00)") }, 150);
    }
}
function leftMenuButtonMouseOut(sender)
{
    var id = "#" + sender.id;
    $("#leftMenuFocus").stop();
    $("#leftMenuFocus").animate({ top: leftmenuSelectOffset, backgroundColor: jQuery.Color("rgba(150,220,255,0.00)") }, 200);
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
function windowScroll(e)
{
    var scrollTop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
    var bodyHeight = document.body.scrollHeight;
    var height = $("#leftFloat").height();
    var bottomHeight = $("#pageBottom").height();
    if (scrollTop + window.innerHeight > bodyHeight)
    {
        loadNotes(false, NotesPage + 1);
    }
    if (scrollTop + height + bottomHeight > bodyHeight)
    {
        var top = bodyHeight - bottomHeight - height;
        $("#leftFloat").css("position", "absolute");
        $("#leftFloat").css("top", top.toString() + "px");
    }
    else
    {
        $("#leftFloat").css("position", "fixed");
        $("#leftFloat").css("top", "0px");
    }
}
var noteCommentPostTextInputed = false;
var noteCommentPostUidTextInputed = false;
var viewNoteId = 0;
var replyId = 0;
var replyType = 'note';
function commentLinkClick(sender, id)
{
    $("#notesArea").css("display", "none");
    viewNoteId = id;
    getNote(id);
    $("#noteOneArea").css("display", "block");
    loadComment(id, true, 1);
}
function noteCommentClick(sender)
{
    loadComment(viewNoteId, true);
}
function noteCommentPostTextGotFocus(sender)
{
    if ($("#noteCommentPostText").text() == "说点啥吧 o(￣ヘ￣o)")
    {
        $("#noteCommentPostText").text("");
        $("#noteCommentPostText").css("color", "black");
        noteCommentPostTextInputed = true;
    }
    $("#noteCommentPostText").css("border-color", "rgba(200,200,200,1.00)");
    $("#noteCommentPostWarning").text("");
}
function noteCommentPostTextLostFocus(sender)
{
    if ($("#noteCommentPostText").text() == "")
    {
        $("#noteCommentPostText").text("说点啥吧 o(￣ヘ￣o)");
        $("#noteCommentPostText").css("color", "rgba(180,180,180,1.00)");
        noteCommentPostTextInputed = false;
    }
}
function noteCommentPostUidTextGotFocus(sender)
{
    if ($("#noteCommentPostUidText").text() == "起个名吧...")
    {
        $("#noteCommentPostUidText").text("");
        $("#noteCommentPostUidText").css("color", "black");
        noteCommentPostUidTextInputed = true;
    }
    $("#noteCommentPostUidText").css("border-color", "rgba(200,200,200,1.00)");
    $("#noteCommentPostWarning").text("");
}
function noteCommentPostUidTextLostFocus(sender)
{
    if ($("#noteCommentPostUidText").text() == "")
    {
        $("#noteCommentPostUidText").text("起个名吧...");
        $("#noteCommentPostUidText").css("color", "rgba(180,180,180,1.00)");
        noteCommentPostUidTextInputed = false;
    }
}
function noteCommentPostButtonClick(sender)
{
    var text = $("#noteCommentPostText").text();
    var uid = $("#noteCommentPostUidText").text();
    var warning = $("#noteCommentPostWarning");
    var reg = new RegExp("^[^`,\"\'/]+$", "m");
    var m = reg.exec(uid);
    var r = false;
    if(text==""||!text||!noteCommentPostTextInputed)
    {
        $("#noteCommentPostText").css("border-color", "rgba(255, 143, 143, 1)");
        r = true;
    }
    if (uid == "" || !uid || !noteCommentPostUidTextInputed)
    {
        $("#noteCommentPostUidText").css("border-color", "rgba(255, 143, 143, 1)");
        r = true;
    }
    else if (!reg.test(uid))
    {
        warning.text("名字不允许包含[ \" ' ` , ]等符号");
        r = true;
    }
    if(r)
        return;
    SardineFish.API.Comment.Post(replyId, uid, text, function (succeed, result)
    {
        if (!succeed)
            warning.text(result);
        else
        {
            $("#noteCommentPostText").text("说点啥吧 o(￣ヘ￣o)");
            $("#noteCommentPostText").css("color", "rgba(180,180,180,1.00)");
            $("#noteCommentPostWarning").text("");
            noteCommentPostTextInputed = false;
            replyType = 'note';
            replyId = viewNoteId;
            loadComment(viewNoteId, true);
        }
    });
}
function noteCommentReplyButtonClick(sender, pid)
{
    replyType = 'comment';
    replyId = pid;
    var name = $("#noteCommentUid" + pid.toString()).text();
    $("#noteCommentPostText").text("回复 " + name + " :");
    $("#noteCommentPostText").css("color", "black");
    noteCommentPostTextInputed = true;
}
function noteCommentReplyReplyButtonClick(sender, pid, id)
{
    replyType = 'comment';
    replyId = pid;
    var name = $("#noteCommentReplyUid" + id.toString()).text();
    $("#noteCommentPostText").text("回复 " + name + " :");
    $("#noteCommentPostText").css("color", "black");
    noteCommentPostTextInputed = true;
}
function noteCommentPageDownButtonClick(sender)
{
    loadComment(viewNoteId, false, CommentPage + 1);
}
function commentReplyPageDownButtonClick(sender, pid)
{
    loadReply(pid, $("#notedCommentReplyAera" + pid.toString()), false, Comments[pid].page + 1);
}
function leftMenuButtonNoteClick(sender)
{
    $("#noteOneArea").css("display", "none");
    $("#notesArea").css("display", "block");

    document.body.scrollTop = document.documentElement.scrollTop = 0;
    loadNotes(true, 1);
}
function notePostButtonClick(sender)
{
    $("#notePostWarningText").text("");
    var login = $.cookie("login");
    var uid = $.cookie("uid");
    if (!login || login == "false" || !uid || uid == "")
    {
        $("#notePostWarningText").text("用户未登陆.");
        return;
    }
    var r = false;
    var title = $("#notePostTitle").text();
    if (!title || title == "")
    {
        $("#notePostWarningText").text("标题不能为空.");
        r = true;
    }
    var tags = $("#notePostTags").text();
    if (!tags || tags == "")
    {
        $("#notePostWarningText").text("标签不能为空.");
        r = true;
    }
    var text = $("#notePostText").text();
    if (!text || text == "")
    {
        $("#notePostWarningText").text("内容不能为空.");
        r = true;
    }
    if (r)
        return;
    SardineFish.API.Note.Post(title, tags, text, function (succeed, msg)
    {
        if (!succeed)
        {
            $("#notePostWarningText").text(msg);
            return;
        }
        $("#notePostTitle").text("");
        $("#notePostTags").text("");
        $("#notePostText").text("");
        loadNotes(true, 1);
    });
}
function addEventHandle()
{
    $(".menuButton").attr("onmouseover", "menuButtonMouseOver(this);");
    $(".menuButton").attr("onmouseout", "menuButtonMouseOut(this);");
    $(".leftMenuButton").attr("onmouseover", "leftMenuButtonMouseOver(this);");
    $(".leftMenuButton").attr("onmouseout", "leftMenuButtonMouseOut(this);");
    window.onresize = windowResize;
    window.onscroll = windowScroll;
    
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
    $("#noteCommentPostTextFocus").onfocus = noteCommentPostTextGotFocus;
    $("#noteCommentPostTextFocus").onblur = noteCommentPostTextLostFocus;
}
addEventHandle();