import { useState } from "react";


export function useArrayState<T>(initial: T[], minLength?: number): [Array<T | undefined>, (idx: number, elem: T) => void]
export function useArrayState<T>(initial: T[], minLength: number, defaultValue: T): [Array<T>, (idx: number, elem: T) => void]
export function useArrayState<T, TDefault = undefined>(initial: T[], minLength: number = 0, defaultValue?: TDefault): [Array<T | TDefault>, (idx: number, elem: T) => void]
{
    const [array, setArray] = useState(initial);
    const [_, setUpdate] = useState({});

    const setElement = (idx: number, elem: T) =>
    {
        let dirty = false;
        if (idx >= array.length)
        {
            var originalLength = array.length;
            array.length = idx;
            array.fill(defaultValue as any, originalLength, array.length);
            dirty = true;
        }
        if (!Object.is(array[idx], elem))
        {
            array[idx] = elem;
            dirty = true;
        }
        if (dirty)
            setUpdate({});
    };

    if (array.length < minLength)
    {
        var originalLength = array.length;
        array.length = minLength;
        array.fill(defaultValue as any, originalLength, array.length);
    }

    return [array, setElement];
}