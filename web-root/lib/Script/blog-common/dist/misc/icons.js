"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icons = void 0;
const react_1 = __importDefault(require("react"));
function wrap() {
}
const icons = {
    Magnify: () => (react_1.default.createElement("svg", { viewBox: "0 0 24 24" },
        react_1.default.createElement("path", { fill: "currentColor", d: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" }))),
    AlertCircle: () => (react_1.default.createElement("svg", { viewBox: "0 0 24 24" },
        react_1.default.createElement("path", { fill: "currentColor", d: "M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" }))),
    AlertCircleOutline: () => (react_1.default.createElement("svg", { viewBox: "0 0 24 24" },
        react_1.default.createElement("path", { fill: "currentColor", d: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" }))),
    CloseCircle: () => (react_1.default.createElement("svg", { viewBox: "0 0 24 24" },
        react_1.default.createElement("path", { fill: "currentColor", d: "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" }))),
    Menu: () => (react_1.default.createElement("svg", { viewBox: "0 0 24 24" },
        react_1.default.createElement("path", { fill: "currentColor", d: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" }))),
};
exports.Icons = Object.keys(icons).map((key) => [key, (propsOverride) => {
        const element = icons[key]();
        if (element) {
            const { props, ...others } = element;
            return { props: { ...props, ...propsOverride }, ...others };
        }
    }])
    .reduce((prev, curr) => ({ [curr[0]]: curr[1], ...prev }), {});
//# sourceMappingURL=icons.js.map