import { useState } from "react";

export function useToggle(initial = true): [boolean, ()=> void]
{
    const [state, setState] = useState(initial);
    return [state, () => setState(!state)];
}