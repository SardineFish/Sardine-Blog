export declare function parseQueryString<T extends Record<string, string | number>>(query: string): Partial<T>;
export declare function parseQueryString<T extends Record<string, string | number>>(query: string, defaultValue: T): T;
export declare function buildQueryString<T extends Record<string, string | number>>(query: Partial<T>): string;
export declare function match<T extends string | number, V>(value: T, patterns: Record<T, V>): V;
export declare function match<T extends string | number, P extends {
    [key in T]: any;
}>(value: T, patterns: P): P[T];
export declare function safeEmphasized(html: string): {
    __html: string;
};
export declare function error(msg: string): never;
export declare function timeout(time: number): Promise<void>;
export declare function minIndexOf<T>(array: T[], selector: (value: T, idx: number) => number): number;
export declare function catch_and_log<Ret>(f: () => Promise<Ret>): Promise<Ret | undefined>;
export declare function catch_and_log<Ret>(f: () => Promise<Ret>, defaultRet: Ret): Promise<Ret>;
//# sourceMappingURL=utils.d.ts.map