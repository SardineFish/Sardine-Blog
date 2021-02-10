window.SardineFish = (function (sar)
{
    if (!sar)
        sar = {};
    var api = (function (api)
    {
        if (!api)
            api = function () { }
        return api;
    })(sar.API);

    var version = 1.0;

    if (api.version && api.version > version)
        return;

    api.version = version;
    sar.API = api;


    function xhr(option)
    {
        var url = option['url'] || "/";
        var method = option['method'] || "GET";
        var requestParams = option['requestParams'] || {};
        var postData = option['postData'] || null;
        var complete = option['complete'] || function (request) { };
        var error = option['error'] || function (msg, code) { };
        var progress = option['progress'] || function (prg, loaded, total) { };

        var request = new XMLHttpRequest();

        // Handle request paramaters
        var idx = 0;
        for (var key in requestParams) 
        {
            if (requestParams.hasOwnProperty(key)) 
            {
                var value = requestParams[key];

                if (idx == 0)
                    url += "?";
                else
                    url += "&";
                
                url += encodeURIComponent(key.toString()) + "=" + encodeURIComponent(value.toString());
                idx++;
            }
        }

        request.open(method, url);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onprogress = function (e)
        {
            progress(e.loaded / e.total, e.loaded, e.total);
        }
        request.onreadystatechange = function (e)
        {
            if (request.readyState != 4)
                return;
            complete(request);
        }
        if (postData)
        {
            var postDataStr = "";
            for (var key in postData)
            {
                if (postData.hasOwnProperty(key))
                {
                    var value = postData[key];

                    if (idx == 0)
                        postDataStr += "";
                    else
                        postDataStr += "&";

                    postDataStr += encodeURIComponent(key.toString()) + "=" + encodeURIComponent(value.toString());
                    idx++;
                }
            }
            request.send(postDataStr);
        }
        else
            request.send();
    }
    /**
     * 
     * @param {{url:string, method?:"GET"|"POST"="GET", requestParams?:{[key:string]:string}, postData?:any, complete?:(data:any)=>void, error?:(msg, code)=>void, progress?:(progress:number)=>void}} option 
     */
    function requestAPI(option)
    {
        var url = option['url'] || "/";
        var method = option['method'] || "GET";
        var requestParams = option['requestParams'] || {};
        var postData = option['postData'] || null;
        var complete = option['complete'] || function (data) { };
        var error = option['error'] || function (msg, code) { };
        var progress = option['progress'] || function (prg) { };

        xhr({
            url: url,
            method: method,
            requestParams: requestParams,
            postData: postData,
            complete: function (request)
            {
                if (request.status != 200)
                {
                    error("Request Error." + request.status + " " + request.statusText, request.status);
                    return;
                }
                try
                {
                    var response = JSON.parse(request.responseText);
                    if (!response || !response.status)
                        throw new Error();
                }
                catch (ex)
                {
                    error("Server response error.", 1020201002);
                    return;
                }

                if (response.status != "^_^")
                {
                    error(response['msg'], response['errorCode'] || response['data']);
                    return;
                }

                complete(response.data);
            },
            error: error,
            progress: progress
        });
        
    }

    //Account
    api.Account = function () { };
    api.Account.Levels = {};
    api.Account.Levels.Developer = "developer";
    api.Account.Levels.Admin = "admin";
    api.Account.Levels.Default = "default";
    api.Account.Levels.Guest = "guest";
    api.Account.Levels.Visitor = "visitor";
    api.Account.Levels.Test = "test";
    api.Account.CheckUid = function (uid, callback, obj)
    {
        if (!uid || uid == "")
        {
            if (callback)
                callback(false, "用户名不能为空.", obj);
            return;
        }
        
        var reg = new RegExp("^[^`,\\\"\'\\s]+$");
        if (!reg.test(uid))
        {
            if (callback)
                callback(false, "用户名不允许包含空格[ \" ' ` , ]等符号.", obj);
            return;
        }
            var request = new XMLHttpRequest();
        request.open("GET", "/account/checkUid.php?uid=" + encodeURIComponent(uid));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function (e)
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, "网络请求失败.", obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                if (callback)
                    callback(false, "服务器返回错误.", obj);
                return;
            }
            if (response.status != "^_^")
            {
                if (callback)
                    callback(false, "查询失败." + response.msg, obj);
                return;
            }
            if (!response.data)
            {
                if (response.errorCode == 1010201004 && callback)
                    callback(false, "用户名已存在", obj);
                else if (response.errorCode == 1010201001 && callback)
                    callback(false, "非法的用户名", obj);
                return;
            }
            if (callback)
                callback(true, "用户名可用", obj);
            return;
        }
        request.send();
    }
    api.Account.GetEncryption = function (uid, callback, obj)
    {
        if (!uid || uid == "")
        {
            if (callback)
                callback(false, "用户名不能为空.", obj);
            return;
        }
        var reg = new RegExp("^[^`,\"\']+$");
        if (!reg.test(uid))
        {
            if (callback)
                callback(false, "用户名不允许包含[ \" ' ` , ]等符号.", obj);
            return;
        }
        var request = new XMLHttpRequest();
        request.open("GET", "/account/getEncryption.php?uid=" + encodeURIComponent(uid));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange =function (e)
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, "网络请求失败.", obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                if (callback)
                    callback(false, "服务器返回错误.", obj);
                return;
            }
            if (response.status != "^_^")
            {
                if (callback)
                    callback(false, "查询失败." + response.msg, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
            return;
        }
        request.send();
    }
    api.Account.Login = function (uid, pwd, callback, obj)
    {
        if (!uid || uid == "")
        {
            if (callback)
                callback(false, "用户名不能为空.", obj);
            return;
        }
        var reg = new RegExp("^[^`,\\\"\'\\s]+$");
        if (!reg.test(uid))
        {
            if (callback)
                callback(false, "用户名不允许包含空格及[ \" ' ` , ]等符号.", obj);
            return;
        }
        if (!pwd || pwd == "")
        {
            if (callback)
                callback(false, "密码不能为空.", obj);
            return;
        }
        api.Account.GetEncryption(uid, function (succeed, msg)
        {
            if (!succeed)
            {
                if (callback)
                    callback(false, "初始化登陆失败", obj);
                return;
            }

            var encryption = msg;
            if (msg == "SHA1")
                pwd = SHA1(pwd);
            else if (msg == "MD5")
                pwd = MD5(pwd);
            else if (msg == "none")
                pwd = pwd;
            else
            {
                if (callback)
                    callback(false, "加密数据获取失败", obj);
                return;
            }
            var post = "uid=" + encodeURIComponent(uid) + "&pwd=" + encodeURIComponent(pwd);
            var request = new XMLHttpRequest();
            request.open("POST", "/account/login.php");
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.onreadystatechange = function ()
            {
                if (request.readyState != 4)
                    return;
                if (request.status != 200)
                {
                    if (callback)
                        callback(false, "网络请求失败.", obj);
                    return;
                }
                var json = request.responseText;
                var response = jsonDecode(json);
                if (!response || response == null)
                {
                    if (callback)
                        callback(false, "服务器返回错误.", obj);
                    return;
                }
                if (response.status != "^_^")
                {
                    if (callback)
                        callback(false, "登陆失败." + response.msg, obj);
                    return;
                }
                if (callback)
                    callback(true, response.msg, obj);
                return;
            }
            request.send(post);
        });
        
    }
    api.Account.Register = function (uid, pwd, level, callback, obj)
    {
        api.Account.CheckUid(uid, function (succeed, msg)
        {
            if (!succeed)
            {
                if (callback)
                    callback(false, msg, obj);
                return;
            }
            
            pwd = SHA1(pwd);
            var request = new XMLHttpRequest();
            request.open("POST", "/account/register.php");
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            var postText = "uid=" + encodeURIComponent(uid) + "&pwd=" + encodeURIComponent(pwd) + "&level=" + encodeURIComponent(level) + "&encryption=SHA1";
            request.onreadystatechange = function (e)
            {
                if (request.readyState != 4)
                    return;
                if (request.status != 200)
                {
                    if (callback)
                        callback(false, "网络请求失败.", obj);
                    return;
                }
                var json = request.responseText;
                var response = jsonDecode(json);
                if (!response || response == null)
                {
                    if (callback)
                        callback(false, "服务器返回错误.", obj);
                    return;
                }
                if (response.status != "^_^")
                {
                    if (callback)
                        callback(false, "注册失败." + response.msg, obj);
                    return;
                }
                if (callback)
                    callback(true, response.msg, obj);
                return;
            }
            request.send(postText);
        });
    }
    api.Account.Check = function (token, uid, callback, obj)
    {
        if (!token || token == 0)
        {
            if (callback)
                callback(false, "Token不能为空.");
            return;
        }
        if (!uid || uid == "")
        {
            if (callback)
                callback(false, "Id不能为空.");
            return;
        }
        var request = new XMLHttpRequest();
        request.open("GET", "/account/check.php?token=" + encodeURIComponent(token) + "&uid=" + encodeURIComponent(uid));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, "网络请求失败.");
                return;
            }
            var response = request.responseText;
            if (response != "^_^")
            {
                if (callback)
                    callback(false, "验证失败.");
                return;
            }
            if (callback)
                callback(true, "");
            return;
        };
        request.send();
    };
    api.Account.User = function () { }
    api.Account.User.GetInfo = function (uid, complete, error,progress)
    {
        if (!uid)
        {
            if (error)
                error("非法的用户名.", 1010201001);
            return;
        }
        
        requestAPI({
            url: "/account/user/getInfo.php",
            requestParams: {
                uid: uid
            },
            complete: complete,
            error: error,
            progress: progress
        });
    }
    api.Account.User.Face = function () { }
    api.Account.User.Face.SetFace = function (uid, url, callback, obj)
    {
        if (!uid)
        {
            if (callback)
                callback(false, { errorCode: 1010201001, msg: "非法的用户名." });
            
        }
        var request = new XMLHttpRequest();
        request.open("POST", "/account/user/face/setFace.php");
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var postText = "uid=" + encodeURIComponent(uid) + "&url=" + encodeURIComponent(url);
        request.onreadystatechange = function (e)
        {
            if (request.readyState != 4)
                return;
            if(request.status !=200)
                if (callback)
                {
                    callback(false, "网络请求错误.", obj);
                    return;
                }
            var response = jsonDecode(request.responseText);
            if(!response.status || response.status !="^_^")
                if (callback)
                {
                    callback(false, response, obj);
                    return;
                }
            if (callback)
                callback(true, response, obj);
        }
        request.send(postText);
    }
    api.Account.CheckLogin = function (callback)
    {
        if (getCookie("login") === "true")
        {
            var uid = getCookie("uid");
            var token = getCookie("token");
            api.Account.Check(token, uid, function (succeed,data)
            {
                if (!succeed && callback)
                {
                    callback(null);    
                    return;
                }    
                if (callback)
                    callback({ uid: uid, token: token });    
            });
            return;
        }
        callback(null);
    }
    //All
    api.All = function () { };
    api.All.GetLatest = function (page, count, callback, obj)
    {
        if (isNaN(page))
            page = 1;
        if (isNaN(count))
            count = 0;
        var request = new XMLHttpRequest();
        request.open("GET", "/all/getLatest.php?page=" + page + "&count=" + count);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(new Array(0), obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (response.status != "^_^")
            {
                if (callback)
                    callback(false, "获取失败." + response.errorCode + ":" + response.msg, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
        };
        request.send();
    }
    //Article
    api.Article = function (type, title, tags, docType, doc)
    {
        if (type != api.Article.Type.Note && type != api.Article.Type.Blog)
            throw new Error("Invalid type.");
        if (docType != api.Article.DocType.Text && docType != api.Article.DocType.HTML && docType != api.Article.DocType.MarkDown)
            throw new Error("Invalid docType.");
        if (type == api.Article.Type.Blog && (!title || title == ""))
            throw new Error("Title cannot be empty.");
        if (!doc || doc == "")
            throw new Error("Document canno be empty.");
        this.pid = null;
        this.type = type;
        this.title = title;
        this.tags = tags;
        this.docType = docType;
        this.document = doc;
        this.author = null;
        this.time = null;
    };
    /**
     * Abandon
     */
    api.Article.GetPage = function (page, full, count, callback, obj)
    {
        if (!page)
            page = 1;
        if (!full)
            full = 0;
        if (full === false)
            full = 0;
        if (full === true)
            full = 1;
        if (!count)
            count = 10;
        var request = new XMLHttpRequest();
        request.open("GET", "/blog/get.php?page=" + page.toString() + "&full=" + full.toString() + "&count=" + count.toString());
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(new Array(0), obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (response.status != "^_^")
                response.data = new Array(0);
            if (callback)
                callback(response.data, obj);
        };
        request.send();
    }
    api.Article.Get = function (pid, onComplete, onError)
    {
        pid = parseInt(pid);
        if (!pid)
            throw new Error("Invalid pid.");
        requestAPI({
            url: "/blog/get.php",
            requestParams: {
                pid: pid,
            },
            complete: onComplete,
            error: onError
        });
    }
    api.Article.GetList = function (time, from, count, preview, callback, obj)
    {
        time = parseInt(time);
        from = parseInt(from);
        count = parseInt(count);
        if (preview)
            preview = true;
        else
            preview = false;
        if (!time)
            time = Math.round(new Date().getTime() / 1000);
        if (!from)
            from = 0;
        if (!count)
            count = 0;
        var request = new XMLHttpRequest();
        request.open("GET", "/blog/getList.php?time=" + encodeURIComponent(time) + "&from=" + encodeURIComponent(from) + "&count=" + encodeURIComponent(count) + "&preview=" + encodeURIComponent(preview));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(false, "网络请求异常:" + request.status, obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (response.status != "^_^" && callback)
            {
                callback(false, response.errorCode + ":获取失败." + response.error, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
        };
        request.send();
    }
    api.Article.GetOne = function (id, full)
    {

    }
    api.Article.Post = function (article, callback)
    {
        if(!(article instanceof api.Article))
        {
            var atc = new api.Article(article.type, article.title, article.tags, article.docType, article.document);
        }
        var request = new XMLHttpRequest();
        request.open("POST", "/blog/post.php");
        var postText =
            "type=" + encodeURIComponent(article.type) +
            "&title=" + encodeURIComponent(article.title) +
            "&tags=" + encodeURIComponent(article.tags) +
            "&docType=" + encodeURIComponent(article.docType) +
            "&doc=" + encodeURIComponent(article.document);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function (e)
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(false, "HTTP请求异常:" + request.status);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (response.status != "^_^" && callback)
            {
                callback(false, response.errorCode + "发布失败:" + response.error);
                return;
            }
            if (callback)
                callback(true, response.data);
        }
        request.send(postText);
    }
    api.Article.Edit = function (article, complete, error, progress)
    {
        requestAPI({
            url: "/blog/edit.php",
            method: "POST",
            postData: {
                pid: article.pid,
                type: article.type,
                title: article.title,
                tags: article.tags.join(","),
                docType:article.docType,
                doc: article.document,
            },
            complete: complete,
            error: error,
            progress: progress
        });
    }
    api.Article.Delete = function (id)
    {

    }
    api.Article.Type = { Blog: "blog", Note: "note" };
    api.Article.DocType = { Text: "text", HTML: "html", MarkDown: "markdown" };
    //Comment
    api.Comment = function () { };
    api.Comment.Get = function (cid, page, count, callback, obj)
    {

        if (isNaN(cid))
        {
            if (callback)
            {
                callback(new Array(0), obj);
                return;
            }
        }
        if (isNaN(page))
            page = 1;
        if (isNaN(count))
            count = 10;
        if (!page)
            page = 1;
        if (!count)
            count = 10;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(new Array(0), obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                if (callback)
                    callback(new Array(0), obj);
                return;
            }
            if (response.status != "^_^")
            {
                if (callback)
                    callback(new Array(0), obj);
                return;
            }
            if (callback)
                callback(response.data, obj);
            return;
        }
        request.open("GET", "/comment/get.php?cid=" + encodeURIComponent(cid.toString()) + "&page=" + encodeURIComponent(page.toString()) + "&count=" + encodeURIComponent(count.toString()), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }
    api.Comment.GetList = function (cid, from, count, time, callback, obj)
    {
        cid = parseInt(cid);
        from = parseInt(from);
        count = parseInt(count);
        time = parseInt(time);
        if (!cid)
            throw new Error("Invalid cid.");
        var request = new XMLHttpRequest();
        request.open("GET", "/comment/getList.php?cid=" + encodeURIComponent(cid) + "&time=" + encodeURIComponent(time) + "&from=" + encodeURIComponent(from) + "&count=" + encodeURIComponent(count));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(false, "网络请求异常:" + request.status, obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == "" && callback)
            {
                callback(false, "服务器返回错误.", obj);
                return;
            }
            if (response.status != "^_^" && callback)
            {
                callback(false, response.errorCode + ":获取失败." + response.error, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
        };
        request.send();
    }
    api.Comment.Post = function (cid, name, email, text, callback, obj)
    {
        if (!cid || isNaN(cid))
        {
            if (callback)
                callback(false, "id为整数且不允许为空或0.");
            return;
        }
        var reg = new RegExp("^[^`,\"\']+$");
        if (!reg.test(name))
        {
            if (callback)
                callback(false, "名字不允许包含[ \" ' ` , ]等符号.", obj);
            return;
        }
        if (!email || email === "")
            email = null;    
        if (text == "" || !text)
        {
            if (callback)
                callback(false, "内容不能为空.", obj);
            return;
        }
        var post = "cid=" + encodeURIComponent(cid.toString()) + "&name=" + encodeURIComponent(name) + "&email=" + encodeURIComponent(email) + "&text=" + encodeURIComponent(text) + "&url=#";
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, "网络请求错误:"+request.status, obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response)
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
                callback(true, "回复成功", obj);
            return;
        };
        request.open("post", "/comment/post.php", true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(post);
    }
    api.Comment.Edit = function (pid, title, tags, text)
    {

    }
    api.Comment.Delete = function (pid)
    {

    }
    //Img
    api.Img = function () { };
    api.Img.GetIdAsync = function (callback, obj)
    {
        var request = new XMLHttpRequest();
        request.open("GET", "/img/getId.php");
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(0, obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                if (callback)
                    callback(0, obj);
                return;
            }
            if (response.status != "^_^")
            {
                if (callback)
                    callback(new 0, obj);
                return;
            }
            if (callback)
                callback(response.data, obj);
            return;
        }
        request.send();
    }
    api.Img.GetId = function ()
    {
        var request = new XMLHttpRequest();
        request.open("GET", "/img/getId.php", false);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
        if (request.status != 200)
        {
            return 0;
        }
        var json = request.responseText;
        var response = jsonDecode(json);
        if (!response || response == null)
        {
            return 0;
        }
        if (response.status != "^_^")
        {
            return 0;
        }
        return response.data;
    }
    api.Img.Upload = function () { };
    api.Img.Upload.GetToken = function (callback, obj)
    {
        var request = new XMLHttpRequest();
        request.open("POST", "/img/upload/getToken.php", false);
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, "服务器错误.", obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (response.status != "^_^")
            {
                if (callback)
                    callback(false, response, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
            return;
        }
        request.send();
    }
    api.Img.Upload.GetTokenAsync = function (callback, obj)
    {
        var request = new XMLHttpRequest();
        request.open("POST", "/img/upload/getToken.php", true);
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if(request.status!=200)
            {
                if (callback)
                    callback(false, "服务器错误.", obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if(response.status!="^_^")
            {
                if (callback)
                    callback(false, response, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
            return;
        }
        request.send();
    }
    api.Img.Upload.Upload=function(file,option)
    {
        api.Img.Upload.GetTokenAsync(function (succeed, data)
        {
            if(!succeed)
            {
                if (option&&option['error'])
                    option.error({ errorCode: data.errorCode, error: data.error });
                return;
            }
            var formData = new FormData();
            formData.append("token", data.token);
            formData.append("key", data.key);
            formData.append("file", file);
            var request = new XMLHttpRequest();
            request.open("POST", data.url);
            request.upload.onprogress = function (e)
            {
                var progress = e.loaded / e.total;
                if (option && option['progress'])
                    option.progress(progress);
            }/*
            request.onload = function (e)
            {
                if (option && option['complete'])
                    option.complete();
            }*/
            request.onerror = function (e)
            {
                if (option && option['error'])
                    option.error({ errorCode: data.errorCode, error: data.error });
            }
            request.onreadystatechange = function (e)
            {
                if (request.readyState != 4)
                    return;
                var response = jsonDecode(request.responseText);
                if (response && response["error"])
                {
                    if (option && option["error"])
                    {
                        option({ errorCode: 0, error: response.error });
                    }
                }
                else
                {
                    if (option && option["complete"])
                    {
                        option.complete(response);
                    }
                }
            }
            request.send(formData);
                
        });
    }
    //Note
    api.Note = function () { };
    api.Note.GetPage = function (page, count, callback, obj)
    {
        if (!page)
            page = 1;
        if (!count)
            count = 10;
        var request = new XMLHttpRequest();
        request.open("GET", "/note/get.php?page=" + encodeURIComponent(page.toString()) + "&count=" + encodeURIComponent(count.toString()));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            try
            {
                if (request.readyState != 4)
                    return;
                if (request.status != 200 && callback)
                {
                    callback(false, { errorCode: 1020201001, msg: "网络请求错误." }, obj);
                    return;
                }
                var json = request.responseText;
                var response = jsonDecode(json);
                if (response.status != "^_^")
                {
                    if(callback)
                    {
                        callback(false, response, obj);
                        return;
                    }
                }
                if (callback)
                {
                    callback(true, response.data, obj);
                }
                return;
            }
            catch (ex)
            {
                if (callback)
                {
                    callback(false, { errorCode: 1020100001, msg: "内部错误." }, obj);
                }
                return;
            }
        };
        request.send();
    }
    api.Note.GetOne = function (id, full, callback, obj)
    {
        if (!id || isNaN(id))
        {
            if (callback)
                callback(null, obj);
            return;
        }
        if (!full)
            full = 0;
        if (full === false)
            full = 0;
        if (full === true)
            full = 1;
        var request = new XMLHttpRequest();
        request.open("GET", "/note/get.php?id=" + id.toString() + "&full=" + full.toString());
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(null, obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response)
            {
                if (callback)
                    callback(null, obj);
                return;
            }
            if (response.status != "^_^")
                response.data = null;
            if (callback)
                callback(response.data, obj);
            return;
        };
        request.send();
    }
    api.Note.Post = function (title, tags, text, callback, obj)
    {
        if (!title || title == "")
        {
            if (callback)
                callback(false, { errorCode: 1020100002, msg: "标题不能为空." }, obj);
            return;
        }
        if (!tags || tags == "")
        {
            if (callback)
                callback(false, { errorCode: 1020100002, msg: "标签不能为空." }, obj);
            return;
        }
        if (!text || text == "")
        {
            if (callback)
                callback(false, { errorCode: 1020100002, msg: "内容不能为空." }, obj);
            return;
        }
        var post = "title=" + encodeURIComponent(title) + "&tags=" + encodeURIComponent(tags) + "&text=" + encodeURIComponent(text);
        var request = new XMLHttpRequest();
        request.open("POST", "/note/post.php");
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, { errorCode: 1020201001, msg: "网络请求失败." }, obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                if (callback)
                    callback(false, { errorCode: 1020000000, msg: "服务器返回错误." }, obj);
                return;
            }
            if (response.status != "^_^")
            {
                if (callback)
                    callback(false, { errorCode: response.errorCode, msg: "发布失败." + response.msg }, obj);
                return;
            }
            if (callback)
                callback(true, response, obj);
            return;
        };
        request.send(post);
    }
    api.Note.Edit = function (id, title, tags, text)
    {

    }
    api.Note.Delete = function (id)
    {

    }
    //Token
    api.Token = function () { };
    api.Token.Qiniu = function (callback, obj)
    {
        var request = new XMLHttpRequest();
        request.open("GET", '/token/qiniu.php');
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
            var response = jsonDecode(json);
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
        };
        request.send();
    }
    //Works
    api.Works = function () { };
    api.Works.GetPage = function (page, full, count, callback, obj)
    {
        if (!page)
            page = 1;
        if (!full)
            full = 0;
        if (full === false)
            full = 0;
        if (full === true)
            full = 1;
        if (!count)
            count = 10;
        var request = new XMLHttpRequest();
        request.open("GET", "/works/get.php?page=" + page.toString() + "&full=" + full.toString() + "&count=" + count.toString());
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(new Array(0), obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (response.status != "^_^")
                response.data = new Array(0);
            if (callback)
                callback(response.data, obj);
            return;
        };
        request.send();
    }
    api.Works.GetList = function (from, count, time, callback, obj)
    {
        time = parseInt(time);
        from = parseInt(from);
        count = parseInt(count);
        if (!time)
            time = 0;
        if (!from)
            from = 0;
        if (!count)
            count = 0;
        var request = new XMLHttpRequest();
        request.open("GET", "/works/getList.php?time=" + encodeURIComponent(time) + "&from=" + encodeURIComponent(from) + "&count=" + encodeURIComponent(count));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(false, "网络请求异常:" + request.status, obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (response.status != "^_^" && callback)
            {
                callback(false, response.errorCode + ":获取失败." + response.error, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
        };
        request.send();
    }
    api.Works.GetOne = function (id, full, callback, obj)
    {
        if (!id | isNaN(id))
        {
            if (callback)
                callback(null, obj);
            return;
        }
        if (full == undefined || full == null || full)
            full = 1;
        if (!full)
            full = 0;
        var request = new XMLHttpRequest();
        request.open("GET", "/works/get.php?id=" + encodeURIComponent(id) + "&full=" + encodeURIComponent(full));
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
            var response = jsonDecode(json);
            if (!response)
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
            callback(response.data, obj);
            return;
        };
        request.send();
    }
    api.Works.Post = function (name, version, tags, type, detail, summary, description, downloadUrl, imgId, callback, obj)
    {
        function Exception(msg)
        {
            if (callback)
                callback(false, msg, obj);
        }
        if (!name || name == "")
        {
            Exception("名称不能为空.");
            return;
        }
        if (!version || version == "")
        {
            Exception("版本号不能为空");
            return;
        }
        if (!tags || tags == "")
        {
            Exception("标签不能为空.");
            return;
        }
        if (!(type == "videos" || type == "apps" || type == "musics" || type == "pictures" || type == "other"))
            type = "other";
        if (!detail || detail.length <= 0)
        {
            Exception("详细数据不能为空.");
            return;
        }
        if (!summary || summary == "")
        {
            Exception("简介不能为空.");
            return;
        }
        if (!description || description == "")
        {
            Exception("描述不能为空.");
            return;
        }
        if (!downloadUrl)
        {
            Exception("下载链接不能为空.");
            return;
        }
        if (isNaN(imgId))
            imgId = 0;
        var post = "name=" + encodeURIComponent(name) + "&version=" + encodeURIComponent(version) + "&tags=" + encodeURIComponent(tags) + "&type=" + encodeURIComponent(type) + "&imgId=" + encodeURIComponent(imgId) + "&detail=" + encodeURIComponent(jsonEncode(detail)) + "&summary=" + encodeURIComponent(summary) + "&description=" + encodeURIComponent(description) + "&urlDownload=" + encodeURIComponent(jsonEncode(downloadUrl));
        var request = new XMLHttpRequest();
        request.open("POST", "/works/post.php");
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                Exception("网络请求失败.");
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                Exception("服务器返回错误.");
                return;
            }
            if (response.status != "^_^")
            {
                Exception("发布失败." + response.msg);
                return;
            }
            if (callback)
                callback(true, response.msg, obj);
            return;
        };
        request.send(post);
    }
    api.Works.Edit = function (name, id, tags, type, detail, summary, description, downloadUrl, imgId, callback, obj)
    {
        function Exception(msg)
        {
            if (callback)
                callback(false, msg, obj);
        }
        if (!name || name == "")
        {
            Exception("名称不能为空.");
            return;
        }
        if (!id || id == "")
        {
            Exception("Id不能为空");
            return;
        }
        if (!tags || tags == "")
        {
            Exception("标签不能为空.");
            return;
        }
        if (!(type == "videos" || type == "apps" || type == "musics" || type == "pictures" || type == "other"))
            type = "other";
        if (!detail || detail.length <= 0)
        {
            Exception("详细数据不能为空.");
            return;
        }
        if (!summary || summary == "")
        {
            Exception("简介不能为空.");
            return;
        }
        if (!description || description == "")
        {
            Exception("描述不能为空.");
            return;
        }
        if (!downloadUrl)
        {
            Exception("下载链接不能为空.");
            return;
        }
        if (isNaN(imgId))
            imgId = 0;
        var post = "name=" + encodeURIComponent(name) + "&id=" + encodeURIComponent(id) + "&tags=" + encodeURIComponent(tags) + "&type=" + encodeURIComponent(type) + "&imgId=" + encodeURIComponent(imgId) + "&detail=" + encodeURIComponent(jsonEncode(detail)) + "&summary=" + encodeURIComponent(summary) + "&description=" + encodeURIComponent(description) + "&urlDownload=" + encodeURIComponent(jsonEncode(downloadUrl));
        var request = new XMLHttpRequest();
        request.open("POST", "/works/edit.php");
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                Exception("网络请求失败.");
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                Exception("服务器返回错误.");
                return;
            }
            if (response.status != "^_^")
            {
                Exception("发布失败." + response.msg);
                return;
            }
            if (callback)
                callback(true, response.msg, obj);
            return;
        };
        request.send(post);
    }
    api.Works.Update = function (name, id, version, tags, type, detail, summary, description, downloadUrl, imgId, callback, obj)
    {
        function Exception(msg)
        {
            if (callback)
                callback(false, msg, obj);
        }
        if (!name || name == "")
        {
            Exception("名称不能为空.");
            return;
        }
        if (!id || id == "")
        {
            Exception("Id不能为空");
            return;
        }
        if (!version || version == "")
        {
            Exception("版本号不能为空");
            return;
        }
        if (!tags || tags == "")
        {
            Exception("标签不能为空.");
            return;
        }
        if (!(type == "videos" || type == "apps" || type == "musics" || type == "pictures" || type == "other"))
            type = "other";
        if (!detail || detail.length <= 0)
        {
            Exception("详细数据不能为空.");
            return;
        }
        if (!summary || summary == "")
        {
            Exception("简介不能为空.");
            return;
        }
        if (!description || description == "")
        {
            Exception("描述不能为空.");
            return;
        }
        if (!downloadUrl)
        {
            Exception("下载链接不能为空.");
            return;
        }
        if (isNaN(imgId))
            imgId = 0;
        var post = "name=" + encodeURIComponent(name) + "&id=" + encodeURIComponent(id) + "&version=" + encodeURIComponent(version) + "&tags=" + encodeURIComponent(tags) + "&type=" + encodeURIComponent(type) + "&imgId=" + encodeURIComponent(imgId) + "&detail=" + encodeURIComponent(jsonEncode(detail)) + "&summary=" + encodeURIComponent(summary) + "&description=" + encodeURIComponent(description) + "&urlDownload=" + encodeURIComponent(jsonEncode(downloadUrl));
        var request = new XMLHttpRequest();
        request.open("POST", "/works/update.php");
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                Exception("网络请求失败.");
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                Exception("服务器返回错误.");
                return;
            }
            if (response.status != "^_^")
            {
                Exception("发布失败." + response.msg);
                return;
            }
            if (callback)
                callback(true, response.msg, obj);
            return;
        };
        request.send(post);
    }
    api.Works.Delete = function (id)
    {

    }
    //PostData
    api.PostData = function () { }
    api.PostData.Get = function (pid, keys, callback, obj)
    {
        if (isNaN(pid))
        {
            if (callback)
                callback(false, "无效的pid", obj);
            return;
        }
        if(!(keys instanceof Array))
        {
            if (callback)
                callback(false, "无效的keys", obj);
            return;
        }
        var request = new XMLHttpRequest();
        request.open("GET", "/postData/get.php?pid=" + encodeURIComponent(pid) + "&keys=" + encodeURIComponent(jsonEncode(keys)));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange =function (e)
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, "网络错误.", obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if(!response.status)
            {
                if (callback)
                    callback(false, "服务器错误.", obj);
                return;
            }
            if(response.status !="^_^")
            {
                if (callback)
                    callback(false, "获取失败." + response.errorCode + ":" + response.msg, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
            return;

        }
        request.send();
    }
    api.PostData.View = function (pid)
    {
        var request = new XMLHttpRequest();
        request.open("GET", "/postData/view.php?pid=" + encodeURIComponent(pid));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }
    api.PostData.DoLike = function (pid, callback, obj)
    {
        if (!pid || isNaN(pid))
        {
            if (callback)
                callback(false, { errorCode: 1020100002, msg: "参数错误." }, obj);
            return;
        }
        var request = new XMLHttpRequest();
        request.open("POST", "/postData/doLike.php");
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function (e)
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(false, "网络错误.", obj);
                return;
            }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response.status)
            {
                if (callback)
                    callback(false, "服务器错误.", obj);
                return;
            }
            if (response.status != "^_^")
            {
                if (callback)
                    callback(false, "赞失败." + response.errorCode + ":" + response.msg, obj);
                return;
            }
            if (callback)
                callback(true, response.data, obj);
            return;
        }
        request.send("pid=" + pid.toString());
    }
        //Statistics
    api.Statistics = function ()
    {
    }
    api.Statistics.Count = function () {
    }
    api.Statistics.Count.Get = function (x, callback, obj)
    {
        var request = new XMLHttpRequest();
        request.open("GET", "/statistics/count.php?x=" +encodeURIComponent(x));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200)
            {
                if (callback)
                    callback(0, obj);
                return;
        }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response == null)
            {
                if (callback)
                    callback(0, obj);
                return;
        }
            if (response.status != "^_^")
                response.data = 0;
            if (callback)
                callback(response.data, obj);
            return;
    };
        request.send();
    }
    api.Statistics.Download = function () {
    };
    api.Statistics.Download.Get = function (id, type, callback, obj)
    {
        if(isNaN(id))
        {
            if (callback)
                callback(0, obj);
            return;
    }
        if (type != 'works')
        {
            if (callback)
                callback(0, obj);
            return;
    }
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(0, obj);
                return;
        }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response)
            {
                if (callback)
                    callback(0, obj);
                return;
        }
            if (response.status == ">_<")
                response.data = 0;
            if (callback)
                callback(response.data, obj);
            return;
    }
        request.open("GET", "/statistics/download.php?id=" + encodeURIComponent(id) + "&type=" +encodeURIComponent(type), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }
    api.Statistics.Download.Add = function (id, type, callback, obj)
    {
        if(isNaN(id))
        {
            if (callback)
                callback(false, "id错误.", obj);
            return;
    }
        if (type != 'works')
        {
            if (callback)
                callback(false, "type错误.", obj);
            return;
    }
        var request = new XMLHttpRequest();
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
            var response = jsonDecode(json);
            if (!response)
            {
                if (callback)
                    callback(false, "服务器返回错误.", obj);
                return;
        }
            if (response.status == ">_<")
            {
                if (callback)
                    callback(false, response.msg, obj);
                return;
        }
            if (callback)
                callback(true, response.data, obj);
            return;
    }
        request.open("GET", "/statistics/download.php?methor=add&id=" + encodeURIComponent(id) + "&type=" +encodeURIComponent(type), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }
    api.Statistics.Visited = function () {
    }
    api.Statistics.Visited.Get = function (url, callback, obj)
    {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(0, obj);
                return;
        }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response || response.status == ">_<")
                response.data = 0;
            if (callback)
                callback(response.data, obj);
            return;
    }
        request.open("GET", "/statistics/visited.php?url=" +encodeURIComponent(url), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }
    api.Statistics.Browse = function () {
    }
    api.Statistics.Browse.Get = function (id, type, callback, obj)
    {
        if(isNaN(id))
        {
            if (callback)
                callback(0, obj);
            return;
    }
        if (!(type == 'note' || type == 'article' || type == 'works' || type=="blog"))
        {
            throw new Error("The type must be 'note', 'article' or 'works'.");
    }
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(0, obj);
                return;
        }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response)
            {
                if (callback)
                    callback(0, obj);
                return;
        }
            if (response.status == ">_<")
                response.data = 0;
            if (callback)
                callback(response.data, obj);
            return;
    }
        request.open("GET", "/statistics/browse.php?id=" + encodeURIComponent(id) + "&type=" +encodeURIComponent(type), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }
    api.Statistics.Comment = function () {
    }
    api.Statistics.Comment.Get = function (id, type, callback, obj)
    {
        if(isNaN(id))
        {
            if (callback)
                callback(0, obj);
            return;
    }
        if (!(type == 'note' || type == 'article' || type == 'works' || type == 'comment' || type == "blog"))
        {
            if (callback)
                callback(0, obj);
            return;
    }
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(0, obj);
                return;
        }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response)
            {
                if (callback)
                    callback(0, obj);
                return;
        }
            if (response.status == ">_<")
                response.data = 0;
            if (callback)
                callback(response.data, obj);
            return;
    }
        request.open("GET", "/statistics/comment.php?id=" + encodeURIComponent(id) + "&type=" +encodeURIComponent(type), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }
    api.Statistics.Like = function () {
    }
    api.Statistics.Like.Get = function (id, type, callback, obj)
    {
        if(isNaN(id))
        {
            if (callback)
                callback(0, obj);
            return;
    }
        if (!(type == 'note' || type == 'article' || type == 'works' || type == "blog"))
        {
            if (callback)
                callback(0, obj);
            return;
    }
        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState != 4)
                return;
            if (request.status != 200 && callback)
            {
                callback(0, obj);
                return;
        }
            var json = request.responseText;
            var response = jsonDecode(json);
            if (!response)
            {
                if (callback)
                    callback(0, obj);
                return;
        }
            if (response.status == ">_<")
                response.data = 0;
            if (callback)
                callback(response.data, obj);
            return;
    }
        request.open("GET", "/statistics/like.php?id=" + encodeURIComponent(id) + "&type=" +encodeURIComponent(type), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }
    api.Statistics.Like.Add = function (id, type, callback, obj)
    {
        if(isNaN(id))
        {
            if (callback)
                callback(false, "id错误.", obj);
            return;
    }
        if (!(type == 'note' || type == 'article' || type == 'works' || type == "blog"))
        {
            if (callback)
                callback(false, "type错误.", obj);
            return;
    }
        var request = new XMLHttpRequest();
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
            var response = jsonDecode(json);
            if (!response)
            {
                if (callback)
                    callback(false, "服务器返回错误.", obj);
                return;
        }
            if (response.status == ">_<")
            {
                if (callback)
                    callback(false, response.msg, obj);
                return;
        }
            if (callback)
                callback(true, response.data, obj);
            return;
    }
        request.open("GET", "/statistics/like.php?methor=add&id=" + encodeURIComponent(id) + "&type=" +encodeURIComponent(type), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
    }

        function jsonDecode(json)
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
    /**
 * Get all cookies as key-value pairs from document.cookie or only with the given key
 * @param {String} [key] - The key of the cookie
 */
    function getCookie(key)
    {
        var pairs = document.cookie.replace(/\s/g, "").split(';');
        var cookies = {};
        for (var i = 0; i < pairs.length; i++)
        {
            var _key = pairs[i].split("=")[0];
            var _value = pairs[i].split("=")[1];
            cookies[_key] = _value;
        }
        if (key === undefined)
            return cookies;
        if (cookies[key] === undefined)
            return null;
        return cookies[key];
    }
    sar.jsonDecode = jsonDecode;
    window.jsonDecode = jsonDecode;
        function jsonEncode(obj)
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
    sar.jsonEncode = jsonEncode;
    window.jsonEncode = jsonEncode;
        function SHA1(text)
        {
            function sha1(text)
            {
                function t(c, a, e)
                {
                var g = 0, b = [], d = 0, f, k, l, h, m, w, n, q = !1, r = !1, p = [], t =[], v, u = !1;
                e = e || {
                };
                f = e.encoding || "UTF8";
                v = e.numRounds || 1;
                l = y(a, f);
                if (v !== parseInt(v, 10) || 1 > v)
                    throw Error("numRounds must a integer >= 1");
                if ("SHA-1" === c)
                    m = 512, w = z, n = F, h = 160;
                else
                    throw Error("Chosen SHA variant is not supported");
                k = x(c);
                this.setHMACKey = function (a, b, d)
                {
                    var e;
                    if (!0 === r)
                        throw Error("HMAC key already set");
                    if (!0 === q)
                        throw Error("Cannot set HMAC key after finalizing hash");
                    if (!0 === u)
                        throw Error("Cannot set HMAC key after calling update");
                    f = (d || { }).encoding || "UTF8";
                    b = y(b, f) (a);
                    a = b.binLen;
                    b = b.value;
                    e = m >>> 3;
                    d = e / 4 -1;
                    if (e < a / 8)
                    {
                        for (b = n(b, a, 0, x(c)); b.length <= d;)
                            b.push(0);
                        b[d]&= 4294967040
                    } else if (e > a / 8)
                    {
                        for (; b.length <= d;)
                            b.push(0);
                        b[d]&= 4294967040
                }
                    for (a = 0; a <= d; a += 1)
                        p[a] = b[a]^ 909522486, t[a] = b[a]^ 1549556828;
                    k = w(p, k);
                    g = m;
                    r = !0
                };
                this.update = function (a)
                {
                    var c, e, f, h = 0, n = m >>> 5;
                    c = l(a, b, d);
                    a = c.binLen;
                    e = c.value;
                    c = a >>> 5;
                    for (f = 0; f < c; f += n)
                        h + m <= a && (k = w(e.slice(f, f +n), k), h += m);
                    g += h;
                    b = e.slice(h >>> 5);
                    d = a % m;
                    u = !0
                };
                this.getHash = function (a, e)
                {
                    var f, l, m;
                    if (!0 ===
                    r)
                        throw Error("Cannot call getHash after setting HMAC key");
                    m = A(e);
                    switch (a)
                    {
                        case "HEX":
                            f = function (a)
                            {
                                return B(a, m)
                        };
                            break;
                        case "B64":
                            f = function (a)
                            {
                                return C(a, m)
                        };
                            break;
                        case "BYTES":
                            f = D;
                            break;
                        default:
                            throw Error("format must be HEX, B64, or BYTES");
                }
                    if (!1 === q)
                        for (k = n(b, d, g, k), l = 1; l < v; l += 1)
                            k = n(k, h, 0, x(c));
                    q = !0;
                    return f(k)
                };
                this.getHMAC = function (a, e)
                {
                    var f, l, p;
                    if (!1 === r)
                        throw Error("Cannot call getHMAC without first setting HMAC key");
                    p = A(e);
                    switch (a)
                    {
                        case "HEX":
                            f = function (a)
                            {
                                return B(a, p)
                        };
                            break;
                        case "B64":
                            f =
                            function (a)
                            {
                                return C(a, p)
                        };
                            break;
                        case "BYTES":
                            f = D;
                            break;
                        default:
                            throw Error("outputFormat must be HEX, B64, or BYTES");
                }
                    !1 === q && (l = n(b, d, g, k), k = w(t, x(c)), k = n(l, h, m, k));
                    q = !0;
                    return f(k)
                }
            }
                function G(c, a, e)
                {
                var g = c.length, b, d, f, k, l;
                a = a ||[0];
                e = e || 0;
                l = e >>> 3;
                if (0 !== g % 2)
                    throw Error("String of HEX type must be in byte increments");
                for (b = 0; b < g; b += 2)
                    {
                    d = parseInt(c.substr(b, 2), 16);
                    if(isNaN(d))
                        throw Error("String of HEX type contains invalid characters");
                    k = (b >>> 1) +l;
                    for (f = k >>> 2; a.length <= f;)
                        a.push(0);
                    a[f] |= d <<
                    8 * (3 -k % 4)
                }
                return { value: a, binLen: 4 * g +e
                }
            }
                function H(c, a, e)
                {
                var g =[], b, d, f, k, g = a ||[0];
                e = e || 0;
                d = e >>> 3;
                for (b = 0; b < c.length; b += 1)
                    a = c.charCodeAt(b), k = b + d, f = k >>> 2, g.length <= f && g.push(0), g[f] |= a << 8 * (3 -k % 4);
                return { value: g, binLen: 8 * c.length +e
                }
            }
                function I(c, a, e)
                {
                var g = [], b = 0, d, f, k, l, h, m, g = a ||[0];
                e = e || 0;
                a = e >>> 3;
                if (- 1 === c.search(/^[a-zA-Z0-9=+\/]+$/))
                    throw Error("Invalid character in base-64 string");
                f = c.indexOf("=");
                c = c.replace(/\=/g, "");
                if (- 1 !== f && f < c.length)
                    throw Error("Invalid '=' found in base-64 string");
                for (f = 0; f < c.length; f += 4)
                    {
                    h = c.substr(f, 4);
                    for (k = l = 0; k < h.length; k += 1)
                        d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(h[k]), l |= d << 18 -6 * k;
                    for (k = 0; k < h.length - 1; k += 1)
                    {
                        m = b +a;
                        for (d = m >>> 2; g.length <= d;)
                            g.push(0);
                        g[d] |= (l >>> 16 - 8 * k & 255) << 8 * (3 -m % 4);
                        b += 1
                }
                }
                return { value: g, binLen: 8 * b +e
                }
            }
                function B(c, a)
                {
                var e = "", g = 4 * c.length, b, d;
                for (b = 0; b < g; b += 1)
                    d = c[b >>> 2] >>> 8 * (3 -b % 4), e += "0123456789abcdef".charAt(d >>> 4 & 15) + "0123456789abcdef".charAt(d & 15);
                return a.outputUpper ? e.toUpperCase(): e
            }
                function C(c, a)
                {
                var e = "", g = 4 * c.length, b, d, f;
                for (b = 0; b < g; b += 3)
                    for (f = b + 1 >>> 2, d = c.length <= f ? 0: c[f], f = b + 2 >>> 2, f = c.length <= f ? 0: c[f], f = (c[b >>> 2] >>> 8 * (3 - b % 4) & 255) << 16 | (d >>> 8 * (3 - (b + 1) % 4) & 255) << 8 | f >>> 8 * (3 - (b + 2) % 4) & 255, d = 0; 4 > d; d += 1)
                        8 * b + 6 * d <= 32 * c.length ? e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(f >>> 6 * (3 - d) & 63) : e += a.b64Pad;
                    return e
            }
                function D(c)
                {
                var a = "", e = 4 * c.length, g, b;
                for (g = 0; g < e; g += 1)
                    b = c[g >>> 2] >>> 8 * (3 - g % 4) & 255, a += String.fromCharCode(b);
                    return a
            }
                function A(c)
                {
                var a = { outputUpper: !1, b64Pad: "="
                };
                c = c || {
                };
                a.outputUpper = c.outputUpper || !1;
                a.b64Pad = c.b64Pad || "=";
                if ("boolean" !== typeof a.outputUpper)
                    throw Error("Invalid outputUpper formatting option");
                if ("string" !== typeof a.b64Pad)
                    throw Error("Invalid b64Pad formatting option");
                    return a
            }
                function y(c, a)
                {
                    var e;
                switch (a)
                    {
                    case "UTF8":
                    case "UTF16BE":
                    case "UTF16LE":
                        break;
                    default:
                        throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");
                }
                switch (c)
                    {
                    case "HEX":
                        e = G;
                        break;
                    case "TEXT":
                        e = function (e, b, d)
                        {
                            var f = [], c = [], l = 0, h, m, p, n, q, f = b ||[0];
                            b = d || 0;
                            p = b >>> 3;
                            if ("UTF8" ===
                            a)
                                for (h = 0; h < e.length; h += 1)
                                    for (d = e.charCodeAt(h), c =[], 128 > d ? c.push(d) : 2048 > d ? (c.push(192 | d >>> 6), c.push(128 | d & 63)): 55296 > d || 57344 <= d ? c.push(224 | d >>> 12, 128 | d >>> 6 & 63, 128 | d & 63) : (h += 1, d = 65536 + ((d & 1023) << 10 | e.charCodeAt(h) & 1023), c.push(240 | d >>> 18, 128 | d >>> 12 & 63, 128 | d >>> 6 & 63, 128 | d & 63)), m = 0; m < c.length; m += 1)
                                    {
                                        q = l +p;
                                        for (n = q >>> 2; f.length <= n;)
                                            f.push(0);
                                        f[n] |= c[m] << 8 * (3 -q % 4);
                                        l += 1
                            }
                            else if ("UTF16BE" === a || "UTF16LE" === a)
                                for (h = 0; h < e.length; h += 1)
                                {
                                    d = e.charCodeAt(h);
                                    "UTF16LE" === a && (m = d & 255, d = m << 8 | d >>> 8);
                                    q = l +p;
                                    for (n = q >>>
                                    2; f.length <= n;)
                                        f.push(0);
                                    f[n] |= d << 8 * (2 -q % 4);
                                    l += 2
                        }
                            return { value: f, binLen: 8 * l +b
                        }
                    };
                        break;
                    case "B64":
                        e = I;
                        break;
                    case "BYTES":
                        e = H;
                        break;
                    default:
                        throw Error("format must be HEX, TEXT, B64, or BYTES");
                }
                    return e
            }
                function r(c, a)
                {
                return c << a | c >>> 32 -a
            }
                function p(c, a)
                {
                var e = (c & 65535) + (a & 65535);
                return ((c >>> 16) + (a >>> 16) + (e >>> 16) & 65535) << 16 | e & 65535
            }
                function u(c, a, e, g, b)
                {
                var d = (c & 65535) + (a & 65535) + (e & 65535) + (g & 65535) + (b & 65535);
                return ((c >>> 16) + (a >>> 16) + (e >>> 16) + (g >>> 16) + (b >>> 16) + (d >>> 16) & 65535) << 16 | d & 65535
            }
                function x(c)
                {
                if ("SHA-1" ===
                c)
                    c =[1732584193, 4023233417, 2562383102, 271733878, 3285377520];
                else
                    throw Error("No SHA variants supported");
                    return c
            }
                function z(c, a)
                {
                var e =[], g, b, d, f, k, l, h;
                g = a[0];
                b = a[1];
                d = a[2];
                f = a[3];
                k = a[4];
                for (h = 0; 80 > h; h += 1)
                    e[h] = 16 > h ? c[h]: r(e[h - 3] ^ e[h - 8] ^ e[h - 14] ^ e[h -16], 1), l = 20 > h ? u(r(g, 5), b & d ^ ~b & f, k, 1518500249, e[h]) : 40 > h ? u(r(g, 5), b ^ d ^ f, k, 1859775393, e[h]) : 60 > h ? u(r(g, 5), b & d ^ b & f ^ d & f, k, 2400959708, e[h]): u(r(g, 5), b ^ d ^ f, k, 3395469782, e[h]), k = f, f = d, d = r(b, 30), b = g, g = l;
                a[0]= p(g, a[0]);
                a[1]= p(b, a[1]);
                a[2]= p(d, a[2]);
                a[3]= p(f, a[3]);
                a[4]= p(k, a[4]);
                    return a
            }
                function F(c, a, e, g)
                {
                    var b;
                for (b = (a + 65 >>> 9 << 4) +15; c.length <= b;)
                    c.push(0);
                c[a >>> 5] |= 128 << 24 -a % 32;
                c[b] = a +e;
                e = c.length;
                for (a = 0; a < e; a += 16)
                    g = z(c.slice(a, a +16), g);
                    return g
            }
                jsSHA = t;
            var shaObj = new jsSHA("SHA-1", "TEXT");
            shaObj.update(text);
            return shaObj.getHash("HEX");
        }
        return sha1(text);
    }
    sar.SHA1 = SHA1;
    window.SHA1 = SHA1;
        function MD5(text)
        {
            function md5(string, key, raw)
            {
                function safe_add(x, y)
                {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }
                function bit_rol(num, cnt)
                {
                return (num << cnt) | (num >>> (32 -cnt));
            }
                function md5_cmn(q, a, b, x, s, t)
                {
                return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
            }
                function md5_ff(a, b, c, d, x, s, t)
                {
                return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
            }
                function md5_gg(a, b, c, d, x, s, t)
                {
                return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
            }
                function md5_hh(a, b, c, d, x, s, t)
                {
                return md5_cmn(b ^ c ^ d, a, b, x, s, t);
            }
                function md5_ii(a, b, c, d, x, s, t)
                {
                return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
            }
                function binl_md5(x, len)
                {
                x[len >> 5] |= 0x80 << (len % 32);
                x[(((len + 64) >>> 9) << 4) + 14]= len;

                var i, olda, oldb, oldc, oldd,
                    a = 1732584193,
                    b = -271733879,
                    c = -1732584194,
                    d = 271733878;

                for (i = 0; i < x.length; i += 16)
                    {
                    olda = a;
                    oldb = b;
                    oldc = c;
                    oldd = d;

                    a = md5_ff(a, b, c, d, x[i], 7, -680876936);
                    d = md5_ff(d, a, b, c, x[i +1], 12, -389564586);
                    c = md5_ff(c, d, a, b, x[i +2], 17, 606105819);
                    b = md5_ff(b, c, d, a, x[i +3], 22, -1044525330);
                    a = md5_ff(a, b, c, d, x[i +4], 7, -176418897);
                    d = md5_ff(d, a, b, c, x[i +5], 12, 1200080426);
                    c = md5_ff(c, d, a, b, x[i +6], 17, -1473231341);
                    b = md5_ff(b, c, d, a, x[i +7], 22, -45705983);
                    a = md5_ff(a, b, c, d, x[i +8], 7, 1770035416);
                    d = md5_ff(d, a, b, c, x[i +9], 12, -1958414417);
                    c = md5_ff(c, d, a, b, x[i +10], 17, -42063);
                    b = md5_ff(b, c, d, a, x[i +11], 22, -1990404162);
                    a = md5_ff(a, b, c, d, x[i +12], 7, 1804603682);
                    d = md5_ff(d, a, b, c, x[i +13], 12, -40341101);
                    c = md5_ff(c, d, a, b, x[i +14], 17, -1502002290);
                    b = md5_ff(b, c, d, a, x[i +15], 22, 1236535329);

                    a = md5_gg(a, b, c, d, x[i +1], 5, -165796510);
                    d = md5_gg(d, a, b, c, x[i +6], 9, -1069501632);
                    c = md5_gg(c, d, a, b, x[i +11], 14, 643717713);
                    b = md5_gg(b, c, d, a, x[i], 20, -373897302);
                    a = md5_gg(a, b, c, d, x[i +5], 5, -701558691);
                    d = md5_gg(d, a, b, c, x[i +10], 9, 38016083);
                    c = md5_gg(c, d, a, b, x[i +15], 14, -660478335);
                    b = md5_gg(b, c, d, a, x[i +4], 20, -405537848);
                    a = md5_gg(a, b, c, d, x[i +9], 5, 568446438);
                    d = md5_gg(d, a, b, c, x[i +14], 9, -1019803690);
                    c = md5_gg(c, d, a, b, x[i +3], 14, -187363961);
                    b = md5_gg(b, c, d, a, x[i +8], 20, 1163531501);
                    a = md5_gg(a, b, c, d, x[i +13], 5, -1444681467);
                    d = md5_gg(d, a, b, c, x[i +2], 9, -51403784);
                    c = md5_gg(c, d, a, b, x[i +7], 14, 1735328473);
                    b = md5_gg(b, c, d, a, x[i +12], 20, -1926607734);

                    a = md5_hh(a, b, c, d, x[i +5], 4, -378558);
                    d = md5_hh(d, a, b, c, x[i +8], 11, -2022574463);
                    c = md5_hh(c, d, a, b, x[i +11], 16, 1839030562);
                    b = md5_hh(b, c, d, a, x[i +14], 23, -35309556);
                    a = md5_hh(a, b, c, d, x[i +1], 4, -1530992060);
                    d = md5_hh(d, a, b, c, x[i +4], 11, 1272893353);
                    c = md5_hh(c, d, a, b, x[i +7], 16, -155497632);
                    b = md5_hh(b, c, d, a, x[i +10], 23, -1094730640);
                    a = md5_hh(a, b, c, d, x[i +13], 4, 681279174);
                    d = md5_hh(d, a, b, c, x[i], 11, -358537222);
                    c = md5_hh(c, d, a, b, x[i +3], 16, -722521979);
                    b = md5_hh(b, c, d, a, x[i +6], 23, 76029189);
                    a = md5_hh(a, b, c, d, x[i +9], 4, -640364487);
                    d = md5_hh(d, a, b, c, x[i +12], 11, -421815835);
                    c = md5_hh(c, d, a, b, x[i +15], 16, 530742520);
                    b = md5_hh(b, c, d, a, x[i +2], 23, -995338651);

                    a = md5_ii(a, b, c, d, x[i], 6, -198630844);
                    d = md5_ii(d, a, b, c, x[i +7], 10, 1126891415);
                    c = md5_ii(c, d, a, b, x[i +14], 15, -1416354905);
                    b = md5_ii(b, c, d, a, x[i +5], 21, -57434055);
                    a = md5_ii(a, b, c, d, x[i +12], 6, 1700485571);
                    d = md5_ii(d, a, b, c, x[i +3], 10, -1894986606);
                    c = md5_ii(c, d, a, b, x[i +10], 15, -1051523);
                    b = md5_ii(b, c, d, a, x[i +1], 21, -2054922799);
                    a = md5_ii(a, b, c, d, x[i +8], 6, 1873313359);
                    d = md5_ii(d, a, b, c, x[i +15], 10, -30611744);
                    c = md5_ii(c, d, a, b, x[i +6], 15, -1560198380);
                    b = md5_ii(b, c, d, a, x[i +13], 21, 1309151649);
                    a = md5_ii(a, b, c, d, x[i +4], 6, -145523070);
                    d = md5_ii(d, a, b, c, x[i +11], 10, -1120210379);
                    c = md5_ii(c, d, a, b, x[i +2], 15, 718787259);
                    b = md5_ii(b, c, d, a, x[i +9], 21, -343485551);

                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                }
                return [a, b, c, d];
            }
                function binl2rstr(input)
                {
                var i,
                        output = '';
                for (i = 0; i < input.length * 32; i += 8)
                    {
                    output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
                }
                return output;
            }
                function rstr2binl(input)
                {
                var i,
                        output =[];
                output[(input.length >> 2) - 1]= undefined;
                for (i = 0; i < output.length; i += 1)
                    {
                    output[i]= 0;
                }
                for (i = 0; i < input.length * 8; i += 8)
                    {
                    output[i >> 5]|= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
                }
                return output;
            }
                function rstr_md5(s)
                {
                return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
            }
                function rstr_hmac_md5(key, data)
                {
                var i,
                    bkey = rstr2binl(key),
                    ipad =[],
                    opad =[],
                        hash;
                ipad[15]= opad[15]= undefined;
                if (bkey.length > 16)
                {
                    bkey = binl_md5(bkey, key.length * 8);
                }
                for (i = 0; i < 16; i += 1)
                    {
                    ipad[i]= bkey[i]^ 0x36363636;
                    opad[i]= bkey[i]^ 0x5C5C5C5C;
                }
                hash = binl_md5(ipad.concat(rstr2binl(data)), 512 +data.length * 8);
                return binl2rstr(binl_md5(opad.concat(hash), 512 +128));
            }
                function rstr2hex(input)
                {
                var hex_tab = '0123456789abcdef',
                    output = '',
                    x,
                        i;
                for (i = 0; i < input.length; i += 1)
                    {
                    x = input.charCodeAt(i);
                    output += hex_tab.charAt((x >>> 4) & 0x0F) +
                        hex_tab.charAt(x & 0x0F);
                }
                return output;
            }
                function str2rstr_utf8(input)
                {
                return unescape(encodeURIComponent(input));
            }
                function raw_md5(s)
                {
                return rstr_md5(str2rstr_utf8(s));
            }
                function hex_md5(s)
                {
                return rstr2hex(raw_md5(s));
            }
                function raw_hmac_md5(k, d)
                {
                return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
            }
                function hex_hmac_md5(k, d)
                {
                return rstr2hex(raw_hmac_md5(k, d));
            }

            if (!key)
            {
                if (!raw)
                {
                    return hex_md5(string);
            }
                return raw_md5(string);
            }
            if (!raw)
            {
                return hex_hmac_md5(key, string);
            }
            return raw_hmac_md5(key, string);
        }
        return md5(text);
    }
    sar.MD5 = MD5;
    window.MD5 = MD5;
        function UrlParamsDecode(paramText)
        {
        var paramList = paramText.replace("?", "").split("&");
        var paramArray = new Array();
        for (var i = 0; i < paramList.length ; i++)
            {
            var item = paramList[i].split("=");
            paramArray[item[0]]= item[1];
        }
        return paramArray;
    }
    sar.UrlParamsDecode = UrlParamsDecode;
    window.UrlParamsDecode = UrlParamsDecode;

    return sar;
})(window.SardineFish);