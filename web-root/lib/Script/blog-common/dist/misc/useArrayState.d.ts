export declare function useArrayState<T>(initial: T[], minLength?: number): [Array<T | undefined>, (idx: number, elem: T) => void, (arr: Array<T>) => void];
export declare function useArrayState<T>(initial: T[], minLength: number, defaultValue: T): [Array<T>, (idx: number, elem: T) => void, (arr: Array<T>) => void];
//# sourceMappingURL=useArrayState.d.ts.map