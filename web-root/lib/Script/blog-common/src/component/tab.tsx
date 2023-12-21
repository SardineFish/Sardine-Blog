import clsx from "clsx";
import React, { ReactElement, createContext, useContext, useState } from "react";

const TabContext = createContext({ selected: "" });

interface TabsProps
{
    defaultTab?: string,
    children?: ReactElement<TabPageProps>[] | ReactElement<TabPageProps>
}

export function Tabs(props: TabsProps)
{
    const tabs = React.Children.map(props.children, child => child?.props.id)?.filter(x => x) || [];
    const titles = React.Children.map(props.children, child => child?.props.title || child?.props.id)?.filter(x => x) || [];
    const tabIndex = tabs.reduce((map, name, idx) =>
    {
        map[name] = idx;
        return map;
    }, {} as Record<string, number>);

    const [selected, setSelected] = useState(props.defaultTab || tabs[0]);

    const onClick = (id: string) =>
    {
        setSelected(id);
    };

    return (
        <div className="tabs">
            <header className="tabs-header">
                <ul className="tabs-list">
                    {tabs.map((name, idx) => (
                        <li
                            className={clsx("tab-item", `tab-${name}`, { "active": name === selected })}
                            key={idx}
                            onClick={() => onClick(name)}
                        >
                            {titles[idx]}
                        </li>
                    ))}
                </ul>
            </header>
            <div className="tab-content">
                <TabContext.Provider value={{ selected: selected }}>
                    {props.children}
                </TabContext.Provider>
            </div>
        </div>
    )
}

interface TabPageProps
{
    id: string,
    title?: string,
    children?: ReactElement | ReactElement[],
}

export function TabPage(props: TabPageProps)
{
    const context = useContext(TabContext);

    return (
        <section className={clsx("tab-page", `tab-page-${props.id}`, { "active": context.selected === props.id })}>
            {props.children}
        </section>
    );
}