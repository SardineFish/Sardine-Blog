"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.safeEmphasized = exports.match = exports.buildQueryString = exports.parseQueryString = void 0;
function parseQueryString(query, defaultValue = {}) {
    return query.substr(query.startsWith("?") ? 1 : 0)
        .split("&")
        .map(part => part.split("="))
        .filter(part => part[0])
        .reduce((prev, curr) => ({ ...prev, [decodeURIComponent(curr[0])]: decodeURIComponent(curr[1]) }), defaultValue);
}
exports.parseQueryString = parseQueryString;
function buildQueryString(query) {
    return "?" + Object.keys(query)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
        .join("&");
}
exports.buildQueryString = buildQueryString;
function match(value, patterns) {
    return patterns[value];
}
exports.match = match;
function safeEmphasized(html) {
    return { __html: html.replace(/<((?!\/?em)[^>]*?)>/g, "&lt;$1&gt;") };
}
exports.safeEmphasized = safeEmphasized;
function error(msg) {
    throw new Error("msg");
}
exports.error = error;
//# sourceMappingURL=utils.js.map