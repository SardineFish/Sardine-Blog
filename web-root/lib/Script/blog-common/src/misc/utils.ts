export function parseQueryString<T extends Record<string, string | number>>(query: string): Partial<T>
export function parseQueryString<T extends Record<string, string | number>>(query: string, defaultValue: T): T
export function parseQueryString<T extends Record<string, string | number>>(query: string, defaultValue: Partial<T> = {}): T
{
    return query.substring(query.startsWith("?") ? 1 : 0)
        .split("&")
        .map(part => part.split("="))
        .filter(part => part[0])
        .reduce((prev, curr) =>
            ({ ...prev, [decodeURIComponent(curr[0])]: decodeURIComponent(curr[1])})
            , defaultValue as T
        );
}

export function buildQueryString<T extends Record<string, string | number>>(query: Partial<T>): string
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

export function timeout(time: number): Promise<void>
{
    return new Promise(resolve => setTimeout(resolve, time));
}

export function minIndexOf<T>(array: T[], selector: (value: T, idx: number) => number)
{
    var minValue = Number.MAX_VALUE;
    var minIdx = -1;
    for (let i = 0; i < array.length; ++i)
    {
        var value = selector(array[i], i);
        if (value < minValue)
        {
            minIdx = i;
            minValue = value;
        }
    }
    return minIdx;
}