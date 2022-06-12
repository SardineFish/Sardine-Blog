export function parseQueryString(query, defaultValue = {}) {
    return query.substr(query.startsWith("?") ? 1 : 0)
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
//# sourceMappingURL=utils.js.map