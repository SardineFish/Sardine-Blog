import React, { HTMLAttributes, MouseEvent, WheelEvent, Ref, ClassAttributes, RefObject, UIEvent } from "react";
import { WindowEvent } from "./window-event";
interface Props extends HTMLAttributes<HTMLDivElement>
{
    /** Mouse button index that trigger dragging */
    button?: number;

    /** Scalling rate for each scroll delta. */
    scaleRate?: number;

    minScale?: number;

    maxScale?: number;

    /** CSS cursor value when dragging */
    grabCursor?: string;

    domRef?: Ref<HTMLDivElement>;

    // key?: string;
}
interface State
{
    offsetX: number;
    offsetY: number;
    scale: number;
    drag: boolean;
    transition?: number,
    locked: boolean,
}
class Vector
{
    x: number = 0;
    y: number = 0;
}
const vec2 = (x: number, y: number) => { return { x: x, y: y } };
export default class FreeViewport extends React.Component<Props, State>
{
    mouseDownPos: Vector = { x: 0, y: 0 };
    originalOffset: Vector = { x: 0, y: 0 };
    drag: boolean = false;
    viewportRef: React.RefObject<HTMLDivElement>;
    constructor(props: Props)
    {
        super(props);
        this.state = {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            drag: false,
            locked: false,
        };
        this.viewportRef = this.props.domRef ? this.props.domRef as RefObject<HTMLDivElement> : React.createRef<HTMLDivElement>();
    }

    public reset(transitionSeconds?: number)
    {
        this.setState({
            offsetX: 0,
            offsetY: 0,
            scale: 1
        });
        if (transitionSeconds)
        {
            this.setState({
                transition: transitionSeconds,
                locked: true
            });

            setTimeout(() =>
            {
                this.setState({
                    transition: undefined,
                    locked: false
                });
            }, transitionSeconds * 1000);
        }
    }

    mousePosition(clientPos: Vector): Vector
    {
        let element = this.viewportRef.current as HTMLDivElement;
        let rect = element.getBoundingClientRect();
        let style = getComputedStyle(element);
        return {
            x: (clientPos.x - rect.left - parseFloat(style.paddingLeft as string) - this.state.offsetX) / this.state.scale,
            y: (clientPos.y - rect.top - parseFloat(style.paddingTop as string) - this.state.offsetY) / this.state.scale
        };
    }
    onMouseDown(e: MouseEvent<HTMLDivElement>)
    {
        if (this.state.locked)
            return;
        if (this.props.onMouseDown)
            this.props.onMouseDown(e);
        let button = this.props.button === undefined ? 0 : this.props.button;
        if (e.button === button)
        {
            this.originalOffset = { x: this.state.offsetX, y: this.state.offsetY };
            this.mouseDownPos = { x: e.clientX, y: e.clientY };
            this.drag = true;
            this.setState({ drag: true });
        }
    }
    onMouseUp(e: MouseEvent<HTMLDivElement>)
    {
        if (this.props.onMouseUp)
            this.props.onMouseUp(e);
        let button = this.props.button === undefined ? 0 : this.props.button;
        if (e.button === button)
        {
            this.drag = false;
            this.setState({ drag: false });
        }
    }
    onMouseMove(e: MouseEvent<HTMLDivElement>)
    {
        if (this.state.locked)
            return;
        if (this.props.onMouseMove)
            this.props.onMouseMove(e);
        if (!this.drag)
            return;
        let dPos: Vector = { x: e.clientX - this.mouseDownPos.x, y: e.clientY - this.mouseDownPos.y };
        this.setState({
            offsetX: this.originalOffset.x + dPos.x,
            offsetY: this.originalOffset.y + dPos.y
        });
    }
    onWheel(e: WheelEvent<HTMLDivElement>)
    {
        if (this.state.locked)
        {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (this.props.onWheel)
            this.props.onWheel(e);
        const scaleFactor = this.props.scaleRate || 1.2;
        let pos = this.mousePosition(vec2(e.clientX, e.clientY));
        let zoom = 1;
        if (e.deltaY < 0)
        {
            zoom = scaleFactor;
        }
        else if (e.deltaY > 0)
        {
            zoom = 1 / scaleFactor;
        }

        let targetScale = this.state.scale * zoom;
        if (this.props.minScale)
            targetScale = Math.max(this.props.minScale, targetScale);
        if (this.props.maxScale)
            targetScale = Math.min(this.props.maxScale, targetScale);

        console.log("scale to", zoom);
        this.setState({
            scale: targetScale,
            offsetX: this.state.offsetX - (pos.x * (targetScale - this.state.scale)),
            offsetY: this.state.offsetY - (pos.y * (targetScale - this.state.scale))
        });
        e.preventDefault();
        e.stopPropagation();
    }
    onScroll(e: UIEvent<HTMLDivElement>)
    {
        this.viewportRef.current!.scrollTo(0, 0);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void
    {

    }

    componentDidMount(): void
    {
        this.viewportRef.current?.addEventListener("wheel", e => this.onWheel(e as any));
    }

    render()
    {
        const grabCursor = this.props.grabCursor || "-webkit-grabbing";

        let { className, children, onMouseDown, onMouseUp, onMouseMove, onWheel, style, minScale, maxScale, scaleRate, ...other } = this.props;
        style = style ? style : {};
        style.cursor = this.drag ? grabCursor : "inherit";
        className = className ? [className].concat(["viewport"]).join(" ") : "viewport";

        return (
            <div
                className={className}
                ref={this.viewportRef}
                style={style}
                onMouseDown={(e) => this.onMouseDown(e)}
                onMouseUp={(e) => this.onMouseUp(e)}
                onMouseMove={(e) => this.onMouseMove(e)}
                onWheel={(e) => this.onWheel(e)}
                // onScroll={(e) => this.onScroll(e)}
                {...other}>
                <div
                    className="viewport-transform"
                    style={
                        {
                            transformOrigin: "0 0",
                            /*translate: `${this.state.offsetX}px, ${this.state.offsetY}px`,
                            scale: `${this.state.scale}, ${this.state.scale}`*/
                            transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.scale}, ${this.state.scale})`,
                            transition: this.state.transition ? `transform ${this.state.transition}s ease-in-out` : undefined
                        }}>
                    {
                        children
                    }
                </div>
                <WindowEvent event="mouseup" listener={e => this.onMouseUp(e as any)} />
            </div>
        );
    }
}