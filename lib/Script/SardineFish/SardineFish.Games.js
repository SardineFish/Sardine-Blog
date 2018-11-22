window.SardineFish = (function (sar)
{
    if (!sar)        sar = {};
    sar.Games = function () { }
    sar.Games.Score = function () { }
    sar.Games.Score.Get = function (game, page, count)
    {

    }
    sar.Games.Score.GetAsync = function (game, page, count, callback, obj)
    {
        if (!game || game == "")
        {
            if (callback)
                callback(null, obj);
            return;
        }
        if (!page || isNaN(page))
            page = 0;
        if (count == undefined || count == null || isNaN(count))
            count = 10;
        var url = "/games/score/get.php?game=" + encodeURIComponent(game) + "&page=" + encodeURIComponent(page.toString()) + "&count=" + encodeURIComponent(count.toString());
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(null, obj);
                return;
            }
            var json = request.responseText;
            var response = sar.Tools.JsonDecode(json);
            if (!response || response == null)
            {
                if (callback)
                    callback(null, obj);
                return;
            }
            if (response.status != "^_^")
            {
                if (callback)
                    callback(null, obj);
                return;
            }
            if (callback)
                callback(response.data, obj);
            return;
        }
        request.send();
    }
    sar.Games.Score.Post = function (game, uid, score)
    {
    }
    sar.Games.Score.PostAsync = function (game, uid, score, callback, obj)
    {
        if (!game || game == "")
        {
            if (callback)
                callback(false, "游戏名错误.", obj);
            return;
        }
        if (!uid)
        {
            if (callback)
                callback(false, "用户名不能为空", obj);
            return;
        }
        var reg = new RegExp("^[^`,\"\']+$");
        if (!reg.test(uid))
        {
            if (callback)
                callback(false, "用户名不允许包含[ \" ' ` , ]等符号.", obj);
            return;
        }
        if (score < 0)
        {
            if (callback)
                callback(false, "不科学的分数值.", obj);
            return;
        }
        var post = "game=" + encodeURIComponent(game) + "&uid=" + encodeURIComponent(uid) + "&score=" + encodeURIComponent(score.toString());
        var request = new XMLHttpRequest();
        request.open("POST", "/games/score/post.php", true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, "网络请求错误.", obj);
                return;
            }
            var json = request.responseText;
            var response = sar.Tools.JsonDecode(json);
            if (!response || response == null)
            {
                if (callback)
                    callback(false, "服务器返回错误.", obj);
                return;
            }
            if (response.status != "^_^")
            {
                if (callback)
                    callback(false, response.msg, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
            return;
        }
        request.send(post);
    }
    //Tools
    sar.Tools = function () { }
    sar.Tools.JsonDecode = function (json)
    {
        try
        {
            return eval('(' + json + ')');
        }
        catch (ex)
        {
            return null;
        }
    }
    sar.Tools.JsonEncode = function (obj)
    {
        try
        {
            return JSON.stringify(obj);
        }
        catch (ex)
        {
            return "null";
        }
    }
    return sar;
})(window.SardineFish);