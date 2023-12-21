import React, { ReactElement } from "react";
interface TabsProps {
    defaultTab?: string;
    children?: ReactElement<TabPageProps>[] | ReactElement<TabPageProps>;
}
export declare function Tabs(props: TabsProps): React.JSX.Element;
interface TabPageProps {
    id: string;
    title?: string;
    children?: ReactElement | ReactElement[];
}
export declare function TabPage(props: TabPageProps): React.JSX.Element;
export {};
//# sourceMappingURL=tab.d.ts.map