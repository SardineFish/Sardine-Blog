import { useState } from "react";

export function makeThrottle<F extends (...args: any[]) => Promise<any>>(interval: number): (fn: F)=> F
{
    let handle = 0;
    
    return (fn: F) =>
    {
        return ((...args: Parameters<F>) => new Promise(resolve =>
        {
            if (handle)
            {
                console.log("cancel", handle);
                clearTimeout(handle);
            }
            const curr = window.setTimeout(() =>
            {
                console.log("fire", curr);
                fn(...args).then(r => resolve(r));
            }, interval);
            handle = curr
            console.log("set", curr);
        })) as F
    };
}

export function useThrottle<F extends (...args: any[]) => Promise<any>>(interval: number): (fn: F) => F
{
    let handle = 0;
    const [throttle, _] = useState<(fn: F) => F>(() => makeThrottle<F>(interval));

    return throttle;
}