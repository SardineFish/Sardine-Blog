import clsx from "clsx";
import React, { createContext, useContext, useState } from "react";
const TabContext = createContext({ selected: "" });
export function Tabs(props) {
    const tabs = React.Children.map(props.children, child => child?.props.id)?.filter(x => x) || [];
    const titles = React.Children.map(props.children, child => child?.props.title || child?.props.id)?.filter(x => x) || [];
    const tabIndex = tabs.reduce((map, name, idx) => {
        map[name] = idx;
        return map;
    }, {});
    const [selected, setSelected] = useState(props.defaultTab || tabs[0]);
    const onClick = (id) => {
        setSelected(id);
    };
    return (React.createElement("div", { className: "tabs" },
        React.createElement("header", { className: "tabs-header" },
            React.createElement("ul", { className: "tabs-list" }, tabs.map((name, idx) => (React.createElement("li", { className: clsx("tab-item", `tab-${name}`, { "active": name === selected }), key: idx, onClick: () => onClick(name) }, titles[idx]))))),
        React.createElement("div", { className: "tab-content" },
            React.createElement(TabContext.Provider, { value: { selected: selected } }, props.children))));
}
export function TabPage(props) {
    const context = useContext(TabContext);
    return (React.createElement("section", { className: clsx("tab-page", `tab-page-${props.id}`, { "active": context.selected === props.id }) }, props.children));
}
//# sourceMappingURL=tab.js.map