import { useState } from "react";
export function useToggle(initial = true) {
    const [state, setState] = useState(initial);
    return [state, () => setState(!state)];
}
//# sourceMappingURL=use-toggle.js.map