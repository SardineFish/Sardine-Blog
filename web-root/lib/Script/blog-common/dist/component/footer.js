"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = void 0;
const react_1 = __importDefault(require("react"));
function Footer() {
    return (react_1.default.createElement("footer", { className: "page-footer" },
        react_1.default.createElement("p", null, "POWERED BY SardineFish"),
        react_1.default.createElement("p", null,
            "Copyright \u00A9 2015-",
            react_1.default.createElement("span", null, new Date().getFullYear()))));
}
exports.Footer = Footer;
//# sourceMappingURL=footer.js.map