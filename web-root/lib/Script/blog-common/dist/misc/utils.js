export function parseQueryString(query, defaultValue = {}) {
    return query.substring(query.startsWith("?") ? 1 : 0)
        .split("&")
        .map(part => part.split("="))
        .filter(part => part[0])
        .reduce((prev, curr) => ({ ...prev, [decodeURIComponent(curr[0])]: decodeURIComponent(curr[1]) }), defaultValue);
}
export function buildQueryString(query) {
    return "?" + Object.keys(query)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
        .join("&");
}
export function match(value, patterns) {
    return patterns[value];
}
export function safeEmphasized(html) {
    return { __html: html.replace(/<((?!\/?em)[^>]*?)>/g, "&lt;$1&gt;") };
}
export function error(msg) {
    throw new Error("msg");
}
export function timeout(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
export function minIndexOf(array, selector) {
    var minValue = Number.MAX_VALUE;
    var minIdx = -1;
    for (let i = 0; i < array.length; ++i) {
        var value = selector(array[i], i);
        if (value < minValue) {
            minIdx = i;
            minValue = value;
        }
    }
    return minIdx;
}
//# sourceMappingURL=utils.js.map