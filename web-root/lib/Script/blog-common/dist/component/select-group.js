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
exports.SelectGroup = void 0;
const clsx_1 = __importDefault(require("clsx"));
const react_1 = __importStar(require("react"));
const SelectContext = react_1.default.createContext({ selected: false, onClick: (_) => undefined });
function SelectGroup(props) {
    const [selected, setSelected] = (0, react_1.useState)(props.selectedKey);
    const select = (key) => {
        setSelected(key);
        if (key !== selected)
            props.onSelectChange?.(key);
    };
    const { selectedKey, onSelectChange, children, ...ulProps } = props;
    return (react_1.default.createElement("ul", { className: "select-group", ...ulProps }, react_1.default.Children.map(props.children, (child, idx) => (react_1.default.createElement(SelectContext.Provider, { key: idx, value: {
            selected: child.props.id === selected,
            onClick: () => select(child.props.id)
        } }, child)))));
}
exports.SelectGroup = SelectGroup;
SelectGroup.Item = SelectItem;
function SelectItem(props) {
    const context = (0, react_1.useContext)(SelectContext);
    (0, react_1.useEffect)(() => {
        if (context.selected)
            props.onSelected?.(props.id);
    }, [context.selected]);
    return (react_1.default.createElement("li", { className: (0, clsx_1.default)("select-item", { "selected": context.selected }), onClick: () => context.onClick(props.id) }, props.children));
}
//# sourceMappingURL=select-group.js.map