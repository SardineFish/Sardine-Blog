import clsx from "clsx";
import React, { useContext, useEffect, useState } from "react";
const SelectContext = React.createContext({ selected: false, onClick: (_) => undefined });
export function SelectGroup(props) {
    const [selected, setSelected] = useState(props.selectedKey);
    const select = (key) => {
        setSelected(key);
        if (key !== selected)
            props.onSelectChange?.(key);
    };
    const { selectedKey, onSelectChange, children, ...ulProps } = props;
    useEffect(() => {
        if (props.selectedKey !== undefined)
            select(props.selectedKey);
    }, [props.selectedKey]);
    return (React.createElement("ul", { className: "select-group", ...ulProps }, React.Children.map(props.children, (child, idx) => (React.createElement(SelectContext.Provider, { key: idx, value: {
            selected: child.props.id === selected,
            onClick: () => select(child.props.id)
        } }, child)))));
}
SelectGroup.Item = SelectItem;
function SelectItem(props) {
    const context = useContext(SelectContext);
    useEffect(() => {
        if (context.selected)
            props.onSelected?.(props.id);
    }, [context.selected]);
    return (React.createElement("li", { className: clsx("select-item", { "selected": context.selected }), onClick: () => context.onClick(props.id) }, props.children));
}
//# sourceMappingURL=select-group.js.map