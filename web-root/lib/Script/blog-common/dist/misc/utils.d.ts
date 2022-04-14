export declare function parseQueryString<T extends Record<string, string | number>>(query: string): Partial<T>;
export declare function parseQueryString<T extends Record<string, string | number>>(query: string, defaultValue: T): T;
export declare function buildQueryString<T extends Record<string, string | number>>(query: T): string;
export declare function match<T extends string | number, P extends {
    [key in T]: any;
}>(value: T, patterns: P): P[T];
export declare function safeEmphasized(html: string): {
    __html: string;
};
//# sourceMappingURL=utils.d.ts.map