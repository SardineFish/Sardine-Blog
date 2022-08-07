import { useState } from "react";
export function useArrayState(initial, minLength = 0, defaultValue) {
    const [array, setArray] = useState(initial);
    const [_, setUpdate] = useState({});
    const setElement = (idx, elem) => {
        let dirty = false;
        if (idx >= array.length) {
            var originalLength = array.length;
            array.length = idx;
            array.fill(defaultValue, originalLength, array.length);
            dirty = true;
        }
        if (!Object.is(array[idx], elem)) {
            array[idx] = elem;
            dirty = true;
        }
        if (dirty)
            setUpdate({});
    };
    if (array.length < minLength) {
        var originalLength = array.length;
        array.length = minLength;
        array.fill(defaultValue, originalLength, array.length);
    }
    return [array, setElement, setArray];
}
//# sourceMappingURL=useArrayState.js.map