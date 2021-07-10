import { useState } from "react";

export const ThrottleReject = Symbol("rejected call");

type RejectType = "older" | "newer";

function makeFIFOThrottle(interval: number): <F extends (...args: any[]) => Promise<any>>(fn: F) => F
{
    let handle = 0;
    return <F extends (...args: any[]) => Promise<any>>(fn: F) =>
    {
        return ((...args: Parameters<F>) => new Promise((resolve, reject) =>
        {
            if (handle)
            {
                console.info("rejected");
                reject(ThrottleReject);
                return;
            }
            handle = window.setTimeout(() =>
            {
                handle = 0;
                console.log("release");
            }, interval);
            console.log("set and fire");

            fn(...args).then(r => resolve(r)).catch(reject);
        })) as F
    }
}

function makeFILOThrottle(interval: number): <F extends (...args: any[]) => Promise<any>>(fn: F) => F
{
    let handle = 0;

    return <F extends (...args: any[]) => Promise<any>>(fn: F) =>
    {
        return ((...args: Parameters<F>) => new Promise((resolve, reject) =>
        {
            if (handle)
            {
                console.log("cancel", handle);
                clearTimeout(handle);
            }
            const curr = window.setTimeout(() =>
            {
                console.log("fire", curr);
                fn(...args).then(r => resolve(r)).catch(reject);
            }, interval);
            handle = curr
            console.log("set", curr);
        })) as F
    };
}

export function makeThrottle(interval: number, reject: RejectType = "older"): <F extends (...args: any[]) => Promise<any>>(fn: F)=> F
{
    switch (reject)
    {
        case "newer":
            return makeFIFOThrottle(interval);
        case "older":
            return makeFILOThrottle(interval);
    }
}

export function useThrottle(interval: number, reject: RejectType = "older"): <F extends (...args: any[]) => Promise<any>>(fn: F) => F
{
    const [throttle, _] = useState<<F extends (...args: any[]) => Promise<any>>(fn: F) => F>(() => makeThrottle(interval, reject));

    return throttle;
}