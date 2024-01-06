import React from "react";
import { WindowEvent } from "./window-event";
class Vector {
    x = 0;
    y = 0;
}
const vec2 = (x, y) => { return { x: x, y: y }; };
export default class FreeViewport extends React.Component {
    mouseDownPos = { x: 0, y: 0 };
    originalOffset = { x: 0, y: 0 };
    drag = false;
    viewportRef;
    constructor(props) {
        super(props);
        this.state = {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            drag: false,
            locked: false,
        };
        this.viewportRef = this.props.domRef ? this.props.domRef : React.createRef();
    }
    reset(transitionSeconds) {
        this.setState({
            offsetX: 0,
            offsetY: 0,
            scale: 1
        });
        if (transitionSeconds) {
            this.setState({
                transition: transitionSeconds,
                locked: true
            });
            setTimeout(() => {
                this.setState({
                    transition: undefined,
                    locked: false
                });
            }, transitionSeconds * 1000);
        }
    }
    mousePosition(clientPos) {
        let element = this.viewportRef.current;
        let rect = element.getBoundingClientRect();
        let style = getComputedStyle(element);
        return {
            x: (clientPos.x - rect.left - parseFloat(style.paddingLeft) - this.state.offsetX) / this.state.scale,
            y: (clientPos.y - rect.top - parseFloat(style.paddingTop) - this.state.offsetY) / this.state.scale
        };
    }
    onMouseDown(e) {
        if (this.state.locked)
            return;
        if (this.props.onMouseDown)
            this.props.onMouseDown(e);
        let button = this.props.button === undefined ? 0 : this.props.button;
        if (e.button === button) {
            this.originalOffset = { x: this.state.offsetX, y: this.state.offsetY };
            this.mouseDownPos = { x: e.clientX, y: e.clientY };
            this.drag = true;
            this.setState({ drag: true });
        }
    }
    onMouseUp(e) {
        if (this.props.onMouseUp)
            this.props.onMouseUp(e);
        let button = this.props.button === undefined ? 0 : this.props.button;
        if (e.button === button) {
            this.drag = false;
            this.setState({ drag: false });
        }
    }
    onMouseMove(e) {
        if (this.state.locked)
            return;
        if (this.props.onMouseMove)
            this.props.onMouseMove(e);
        if (!this.drag)
            return;
        let dPos = { x: e.clientX - this.mouseDownPos.x, y: e.clientY - this.mouseDownPos.y };
        this.setState({
            offsetX: this.originalOffset.x + dPos.x,
            offsetY: this.originalOffset.y + dPos.y
        });
    }
    onWheel(e) {
        if (this.state.locked) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (this.props.onWheel)
            this.props.onWheel(e);
        const scaleFactor = this.props.scaleRate || 1.2;
        let pos = this.mousePosition(vec2(e.clientX, e.clientY));
        let zoom = 1;
        if (e.deltaY < 0) {
            zoom = scaleFactor;
        }
        else if (e.deltaY > 0) {
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
    onScroll(e) {
        this.viewportRef.current.scrollTo(0, 0);
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
    }
    componentDidMount() {
        this.viewportRef.current?.addEventListener("wheel", e => this.onWheel(e));
    }
    render() {
        const grabCursor = this.props.grabCursor || "-webkit-grabbing";
        let { className, children, onMouseDown, onMouseUp, onMouseMove, onWheel, style, minScale, maxScale, scaleRate, ...other } = this.props;
        style = style ? style : {};
        style.cursor = this.drag ? grabCursor : "inherit";
        className = className ? [className].concat(["viewport"]).join(" ") : "viewport";
        return (React.createElement("div", { className: className, ref: this.viewportRef, style: style, onMouseDown: (e) => this.onMouseDown(e), onMouseUp: (e) => this.onMouseUp(e), onMouseMove: (e) => this.onMouseMove(e), onWheel: (e) => this.onWheel(e), ...other },
            React.createElement("div", { className: "viewport-transform", style: {
                    transformOrigin: "0 0",
                    /*translate: `${this.state.offsetX}px, ${this.state.offsetY}px`,
                    scale: `${this.state.scale}, ${this.state.scale}`*/
                    transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.scale}, ${this.state.scale})`,
                    transition: this.state.transition ? `transform ${this.state.transition}s ease-in-out` : undefined
                } }, children),
            React.createElement(WindowEvent, { event: "mouseup", listener: e => this.onMouseUp(e) })));
    }
}
//# sourceMappingURL=free-viewport.js.map