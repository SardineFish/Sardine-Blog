import React, { MouseEvent } from 'react';
interface ButtonProps {
    className?: string;
    type?: "normal" | "link";
    href?: string;
    onClick?: (e: MouseEvent<HTMLSpanElement>) => void;
    children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): React.JSX.Element;
export declare function IconButton(props: {
    icon: React.ReactNode;
} & ButtonProps): React.JSX.Element;
export {};
//# sourceMappingURL=button.d.ts.map