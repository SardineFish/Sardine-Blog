import React, { HTMLAttributes, MouseEvent, WheelEvent, Ref, UIEvent } from "react";
interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Mouse button index that trigger dragging */
    button?: number;
    /** Scalling rate for each scroll delta. */
    scaleRate?: number;
    minScale?: number;
    maxScale?: number;
    /** CSS cursor value when dragging */
    grabCursor?: string;
    domRef?: Ref<HTMLDivElement>;
}
interface State {
    offsetX: number;
    offsetY: number;
    scale: number;
    drag: boolean;
    transition?: number;
    locked: boolean;
}
declare class Vector {
    x: number;
    y: number;
}
export default class FreeViewport extends React.Component<Props, State> {
    mouseDownPos: Vector;
    originalOffset: Vector;
    drag: boolean;
    viewportRef: React.RefObject<HTMLDivElement>;
    constructor(props: Props);
    reset(transitionSeconds?: number): void;
    mousePosition(clientPos: Vector): Vector;
    onMouseDown(e: MouseEvent<HTMLDivElement>): void;
    onMouseUp(e: MouseEvent<HTMLDivElement>): void;
    onMouseMove(e: MouseEvent<HTMLDivElement>): void;
    onWheel(e: WheelEvent<HTMLDivElement>): void;
    onScroll(e: UIEvent<HTMLDivElement>): void;
    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void;
    componentDidMount(): void;
    render(): React.JSX.Element;
}
export {};
//# sourceMappingURL=free-viewport.d.ts.map