import { useState } from "react";
export const ThrottleReject = Symbol("rejected call");
function makeFIFOThrottle(interval) {
    let handle = 0;
    return (fn) => {
        return ((...args) => new Promise((resolve, reject) => {
            if (handle) {
                console.info("rejected");
                reject(ThrottleReject);
                return;
            }
            handle = window.setTimeout(() => {
                handle = 0;
                console.log("release");
            }, interval);
            console.log("set and fire");
            fn(...args).then(r => resolve(r)).catch(reject);
        }));
    };
}
function makeFILOThrottle(interval) {
    let handle = 0;
    return (fn) => {
        return ((...args) => new Promise((resolve, reject) => {
            if (handle) {
                console.log("cancel", handle);
                clearTimeout(handle);
            }
            const curr = window.setTimeout(() => {
                console.log("fire", curr);
                fn(...args).then(r => resolve(r)).catch(reject);
            }, interval);
            handle = curr;
            console.log("set", curr);
        }));
    };
}
export function makeThrottle(interval, reject = "older") {
    switch (reject) {
        case "newer":
            return makeFIFOThrottle(interval);
        case "older":
            return makeFILOThrottle(interval);
    }
}
export function useThrottle(interval, reject = "older") {
    const [throttle, _] = useState(() => makeThrottle(interval, reject));
    return throttle;
}
//# sourceMappingURL=throttle.js.map