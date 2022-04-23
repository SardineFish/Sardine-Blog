"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconButton = exports.Button = void 0;
const clsx_1 = __importDefault(require("clsx"));
const react_1 = __importStar(require("react"));
function Button(props) {
    const [hover, setHover] = (0, react_1.useState)(false);
    const [hold, setHold] = (0, react_1.useState)(false);
    const [state, setState] = (0, react_1.useState)("normal");
    const onClick = () => {
        props.onClick && props.onClick();
    };
    const mouseDown = () => {
        setHold(true);
        setState("click");
    };
    const mouseUp = () => {
        setHold(false);
        setState(hover ? "hover" : "normal");
    };
    const mouseIn = () => {
        setHover(true);
        setState(hold ? "click" : "hover");
    };
    const mouseOut = () => {
        setHover(false);
        setState(hold ? "click" : "normal");
    };
    (0, react_1.useEffect)(() => {
        window.addEventListener("mouseup", mouseUp);
        return () => window.removeEventListener("mouseup", mouseUp);
    });
    return (react_1.default.createElement("span", { className: (0, clsx_1.default)("button", state, props.className), onClick: onClick, onMouseEnter: mouseIn, onMouseLeave: mouseOut, onMouseDown: mouseDown }, props.children));
}
exports.Button = Button;
function IconButton(props) {
    return (react_1.default.createElement(Button, { className: (0, clsx_1.default)("icon-button", props.className) }, props.icon));
}
exports.IconButton = IconButton;
//# sourceMappingURL=button.js.map