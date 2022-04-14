"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToggle = void 0;
const react_1 = require("react");
function useToggle(initial = true) {
    const [state, setState] = (0, react_1.useState)(initial);
    return [state, () => setState(!state)];
}
exports.useToggle = useToggle;
//# sourceMappingURL=use-toggle.js.map