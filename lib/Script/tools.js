/**
 * Parse url search as key-value pairs from location.search
 */
function parseSearch()
{
    var search = location.search.substring(1);
    var pair = search.split(/&/);
    var obj = {};
    for (var i = 0; i < pair.length; i++)
    {
        var key = pair[i].split(/=/)[0];
        var value = pair[i].split(/=/)[1];
        if (!isNaN(value))
            value = parseFloat(value);
        obj[key] = value;
    }
    return obj;
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
/**
 * Set the cookie
 * @param {String} key - Key
 * @param {Any} value - Value
 * @param {Date} expiers - Expires time
 */
function setCookie(key, value, expires)
{
    var cookie = key + "=" + value + "; expires=" + expires;
    if (expires === undefined)
        key + "=" + value;
    else 
        cookie = key + "=" + value + "; expires=" + expires;
    document.cookie = cookie;
}

/**
 * @returns {Array}
 */
function ArrayList()
{
    var list = [];
    list.add = function (obj)
    {
        list[list.length] = obj;
        return list.length - 1;
    }
    list.insert = function (obj, index)
    {
        if (isNaN(index) || index < 0)
        {
            throw new Error("Invalid index.");
        }
        for (var i = this.length - 1; i >= index; i--)
        {
            this[i + 1] = this[i];
        }
        this[index] = obj;
    }
    list.removeAt = function (index)
    {
        if (isNaN(index) || index < 0 || index >= list.length)
        {
            throw new Error("Invalid index.");
        }
        for (var i = index; i < list.length - 1; i++)
        {
            list[i] = list[i + 1];
        }
        list.length -= 1;
    }
    list.remove = function (obj)
    {
        for (var i = 0; i < list.length; i++)
        {
            if (list[i] == obj)
            {
                for (; i < list.length - 1; i++)
                {
                    list[i] = list[i + 1];
                }
                list.length -= 1;
                return;
            }
        }
        throw new Error("Object not found.");
    }
    list.clear = function ()
    {
        list.length = 0;
    }
    list.addRange = function (arr, startIndex, count)
    {
        if (!startIndex || isNaN(startIndex))
            startIndex = 0;
        if (!count || isNaN(count))
            count = arr.length;
        for (var i = startIndex; i < count; i++)
        {
            list[list.length] = arr[i];
        }
    }
    list.contain = function (obj)
    {
        return (list.indexOf(obj) >= 0);
    }
    return list;
}
