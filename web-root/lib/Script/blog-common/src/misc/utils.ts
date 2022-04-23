export function parseQueryString<T extends Record<string, string | number>>(query: string): Partial<T>
export function parseQueryString<T extends Record<string, string | number>>(query: string, defaultValue: T): T
export function parseQueryString<T extends Record<string, string | number>>(query: string, defaultValue: Partial<T> = {}): T
{
    return query.substr(query.startsWith("?") ? 1 : 0)
        .split("&")
        .map(part => part.split("="))
        .filter(part => part[0])
        .reduce((prev, curr) =>
            ({ ...prev, [decodeURIComponent(curr[0])]: decodeURIComponent(curr[1])})
            , defaultValue as T
        );
}

export function buildQueryString<T extends Record<string, string | number>>(query: T): string
{
    return "?" + Object.keys(query)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
        .join("&");
}

export function match<T extends string | number, V>(value: T, patterns: Record<T, V>): V;
export function match<T extends string | number, P extends { [key in T]: any }>(value: T, patterns: P): P[T];
export function match<T extends string | number, P extends { [key in T]: any }>(value: T, patterns: P): P[T]
{
    return patterns[value];
}

export function safeEmphasized(html: string)
{
    return { __html: html.replace(/<((?!\/?em)[^>]*?)>/g, "&lt;$1&gt;") };
}

export function error(msg: string): never
{
    throw new Error("msg");
}