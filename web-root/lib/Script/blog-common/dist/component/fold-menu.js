"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoldMenu = void 0;
const react_1 = __importDefault(require("react"));
const clsx_1 = __importDefault(require("clsx"));
const misc_1 = require("../misc");
const button_1 = require("./button");
function FoldMenu(props) {
    const icon = props.icon ?? react_1.default.createElement(misc_1.Icons.Menu, null);
    const [expand, toggleExpand] = (0, misc_1.useToggle)(false);
    return (react_1.default.createElement("aside", { className: (0, clsx_1.default)("fold-menu", props.className) },
        react_1.default.createElement(button_1.IconButton, { className: "button-menu", onClick: () => toggleExpand(), icon: icon }),
        react_1.default.createElement("div", { className: (0, clsx_1.default)("menu-content", { "expand": expand }) }, props.children)));
}
exports.FoldMenu = FoldMenu;
//# sourceMappingURL=fold-menu.js.map