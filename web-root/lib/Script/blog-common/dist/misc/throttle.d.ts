export declare const ThrottleReject: unique symbol;
declare type RejectType = "older" | "newer";
export declare function makeThrottle(interval: number, reject?: RejectType): <F extends (...args: any[]) => Promise<any>>(fn: F) => F;
export declare function useThrottle(interval: number, reject?: RejectType): <F extends (...args: any[]) => Promise<any>>(fn: F) => F;
export {};
//# sourceMappingURL=throttle.d.ts.map