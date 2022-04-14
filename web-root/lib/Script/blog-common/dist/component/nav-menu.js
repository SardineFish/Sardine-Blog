"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavMenu = void 0;
const clsx_1 = __importDefault(require("clsx"));
const react_1 = __importDefault(require("react"));
const icons_1 = require("../misc/icons");
const use_toggle_1 = require("../misc/use-toggle");
const select_group_1 = require("./select-group");
function NavMenu(props) {
    const [expand, toggleExpand] = (0, use_toggle_1.useToggle)(false);
    return (react_1.default.createElement("nav", { className: (0, clsx_1.default)("nav-menu", props.className) },
        react_1.default.createElement(icons_1.Icons.Menu, { className: "button-menu", onClick: () => toggleExpand() }),
        react_1.default.createElement(select_group_1.SelectGroup, { className: (0, clsx_1.default)("nav-list", { "expand": expand }) },
            react_1.default.createElement(select_group_1.SelectGroup.Item, { id: "home" },
                react_1.default.createElement("a", { href: "/" }, "HOME")),
            react_1.default.createElement(select_group_1.SelectGroup.Item, { id: "blog" },
                react_1.default.createElement("a", { href: "/blog/" }, "BLOG")),
            react_1.default.createElement(select_group_1.SelectGroup.Item, { id: "note" },
                react_1.default.createElement("a", { href: "/note/" }, "NOTES")),
            react_1.default.createElement(select_group_1.SelectGroup.Item, { id: "lab" },
                react_1.default.createElement("a", { href: "https://lab.sardinefish.com/" }, "LAB")),
            react_1.default.createElement(select_group_1.SelectGroup.Item, { id: "github" },
                react_1.default.createElement("a", { href: "https://github.com/SardineFish" }, "GITHUB")),
            react_1.default.createElement(select_group_1.SelectGroup.Item, { id: "about" },
                react_1.default.createElement("a", { href: "/about/" }, "ABOUT")))));
}
exports.NavMenu = NavMenu;
//# sourceMappingURL=nav-menu.js.map