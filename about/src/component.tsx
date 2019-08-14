import React from "react";
import * as linq from "linq";
import { Color, animate, counter, interpolate, sleep, getPalette, Vector2, vec2, scale, minus, plus, forEachAsync, waitLoad } from "./lib";
import moment from "moment";
import { IconSend, IconReply, IconAdd, IconLoading } from "./icon";
import { APIResponse, CommentResponseData, SarAPI } from "./api";
import gravatar from "gravatar";

export interface ChartData
{
    name: string;
    value: number;
    note?: string;
}
export interface ChartRenderData extends ChartData
{
    color: Color;
    stroke: string;
    textColor: Color;
}
interface RoseChartProps
{
    id?: string;
    className?: string;
    width: number;
    height: number;
    data: ChartData[];
    style?: "pie" | "ring";
    innerRadius?: number;
    maxValue?: number;
    palette?: string[];
    startAngle?: number;
    animation?: boolean;
}
interface RoseChartState
{
    width: number;
    height: number;
    data: ChartData[];
}
export class RoseChart extends React.Component<RoseChartProps, RoseChartState>
{
    canvas: React.RefObject<HTMLCanvasElement>;
    constructor(props: RoseChartProps)
    {
        super(props);
        this.state = {
            width: props.width,
            height: props.height,
            data: props.data
        };
        this.canvas = React.createRef();
    }
    componentDidUpdate() { this.updateChart(); }
    componentDidMount() { this.updateChart(); }
    render()
    {
        return <canvas className={this.props.className} id={this.props.id} width={this.props.width} height={this.props.height} ref={this.canvas}></canvas>
    }
    async updateChart()
    {
        const ctx = this.canvas.current.getContext("2d");
        const style = this.props.style || "pie";
        const startAngle = (this.props.startAngle || 0) / 180 * Math.PI;
        const animation = this.props.animation || true;
        
        // Init canvas
        this.canvas.current.width = this.state.width;
        this.canvas.current.height = this.state.height;
        ctx.resetTransform();
        ctx.clearRect(0, 0, this.state.width, this.state.height);
        ctx.translate(this.state.width / 2, this.state.height / 2);
        //ctx.scale(1, -1);

        if (!this.state.data || this.state.data.length <= 0)
        {
            return;
        }

        if (animation)
            await this.chartAnimation();

        /*
        const maxRadius = Math.min(this.state.width / 2, this.state.height / 2);
        const maxValue = this.props.maxValue || linq.from(this.state.data).max(data => data.value);
        this.renderChart(this.state.data.map(data =>
        {
            return {
                name: data.name,
                value: data.value / maxValue,
                color: "",
                textColor: "#888",
                stroke: "white"
            };
        }), maxRadius);*/
    }

    renderChart(renderData: ChartRenderData[], maxRadius: number, startAngle: number)
    {
        const ctx = this.canvas.current.getContext("2d");
        const style = this.props.style || "pie";
        //const startAngle = (this.props.startAngle || 0) / 180 * Math.PI;
        const animation = this.props.animation || true;

        // Init canvas
        this.canvas.current.width = this.state.width;
        this.canvas.current.height = this.state.height;
        ctx.resetTransform();
        ctx.clearRect(0, 0, this.state.width, this.state.height);
        ctx.translate(this.state.width / 2, this.state.height / 2);

        if (!renderData || renderData.length <= 0)
        {
            return;
        }

        //const palette = this.getPalette(renderData.length);
        const innerRadius = this.props.innerRadius || 0.2 * maxRadius;

        renderData.forEach((data, i) =>
        {
            const startAng = startAngle + (i / renderData.length) * Math.PI * 2;
            const endAng = startAngle + ((i + 1) / renderData.length) * Math.PI * 2;
            const radius = (maxRadius - innerRadius) * data.value + innerRadius;

            // Render sector
            if (data.value > 0)
            {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(radius * Math.cos(startAng), radius * Math.sin(startAng));
                ctx.arc(0, 0, radius, startAng, endAng, false);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fillStyle = data.color.toString();
                ctx.fill();
            }

            // Render words
            const midAng = startAng + (endAng - startAng) * 0.5;//(0.5 - 0.5 * Math.random() * 0.6);
            const r1 = Math.max(0.8 * (radius - innerRadius) + innerRadius, radius - 20);
            const r2 = Math.max(0.6 * maxRadius, radius + 30);
            ctx.beginPath();
            ctx.moveTo(r1 * Math.cos(midAng), r1 * Math.sin(midAng));
            ctx.lineTo(r2 * Math.cos(midAng), r2 * Math.sin(midAng));
            ctx.strokeStyle = ctx.fillStyle = data.textColor.toString();
            ctx.font = '18px "Open Sans", Dengxian, Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
            if (Math.PI / 2 < midAng && midAng < Math.PI * 3 / 2)
            {
                ctx.lineTo(r2 * Math.cos(midAng) - ctx.measureText(data.name).width - 20, r2 * Math.sin(midAng));
                ctx.stroke();
                ctx.fillText(data.name, r2 * Math.cos(midAng) - ctx.measureText(data.name).width - 10, r2 * Math.sin(midAng) - 10);
            }
            else
            {
                ctx.lineTo(r2 * Math.cos(midAng) + ctx.measureText(data.name).width + 20, r2 * Math.sin(midAng));
                ctx.stroke();
                ctx.fillText(data.name, r2 * Math.cos(midAng) + 10, r2 * Math.sin(midAng) - 10);
            }
        });

        if (style === "ring")
        {
            ctx.beginPath();
            ctx.globalCompositeOperation = "destination-out";
            ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
        }
    }

    async chartAnimation()
    {
        const maxRadius = Math.min(this.state.width / 2, this.state.height / 2);
        const maxValue = this.props.maxValue || linq.from(this.state.data).max(data => data.value);
        let renderData = this.state.data.map(data =>
        {
            return {
                name: data.name,
                value: 0,
                color: new Color(0, 0, 0, 0),
                textColor: new Color(128, 128, 128, 0),
                stroke: "white"
            };
        });
        getPalette(renderData.length).forEach((color, i) => renderData[i].color = Color.fromString(color));
        await counter(this.state.data.length, async (i, T) =>
        {
            await animate(interpolate(0.05,0.1,Math.sqrt(T)), (t) =>
            {
                //t = Math.sqrt(t);
                renderData[i].value = this.state.data[i].value / maxValue * t;
                this.renderChart(renderData, maxRadius, 0);
            });
        });
        await sleep(.5);
        await counter(this.state.data.length, async (i) =>
        {
            await animate(0.2, (t) =>
            {
                renderData[i].textColor.alpha = t;
                this.renderChart(renderData, maxRadius, 0);
            }); 
        });
    }
}

export class Banner extends React.Component<{},{x:number,y:number, animate:boolean, show: boolean}>
{
    constructor(props:any)
    {
        super(props);
        this.state = {
            y: -10000,
            x: -10000,
            animate: false,
            show: false
        };
    }
    async init()
    {
        try
        {
            const visitCount: number = (await fetch("/statistics/visited.php")
                .then(response => response.json())).data;
            let visitText = "";
            switch (visitCount % 10)
            {
                case 1:
                    visitText = `${visitCount}st`;
                    break;
                case 2:
                    visitText = `${visitCount}nd`;
                    break;
                case 3:
                    visitText = `${visitCount}rd`;
                    break;
                default:
                    visitText = `${visitCount}th`;
            };
            (this.refs["visit"] as HTMLElement).innerText = visitText;
            await waitLoad(this.refs["img"] as HTMLImageElement);
        }
        catch (_)
        {
            console.warn("Faild to load banner");
        }
        this.setState({
            show: true
        });
        const k = Math.tan(5 / 180 * Math.PI);
        const width = (this.refs["img"] as HTMLElement).getBoundingClientRect().width;
        const x0 = -width;
        const y0 = k * x0;
        this.setState({
            x: x0,
            y: y0
        });
        await sleep(1.5);
        let x = window.innerWidth * 0.25;
        this.setState({
            x: x,
            y: k * x,
            animate: true
        });
        await sleep(2);
        let lastMoveTime = 0;
        let pos = vec2(x, k * x);
        const update = (delay: number) =>
        {
            const seedling = this.refs["seedling"] as HTMLElement;
            seedling.style.bottom = k * pos.x + "px";
            seedling.style.left = pos.x + "px";
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
        window.addEventListener("mousemove", e => pos = vec2(e.clientX, e.clientY));
    }
    componentDidMount()
    {
        this.init();
    }
    render()
    {
        const resource = window.location.protocol === "https:" ? "//cdn-global-static.sardinefish.com" : "//static.sardinefish.com";
        return (
            <div className={["wrapper",this.state.show?"show":""].join(" ")}>
                <div className="ground" ref="gound"></div>
                <picture className={`seedling ${this.state.animate ? "animate" : ""}`} ref="seedling" style={{ bottom: `${this.state.y}px`, left: `${this.state.x}px` }}>
                    <source media="(min-width: 1024px)" srcSet={resource + "/img/logo/Logo_Main_800.min.png"}></source>
                    <img src={resource + "/img/logo/Logo_Main_800.min.png"} alt="" ref="img" />
                </picture>
                <div className={["text-wrapper", this.state.animate ? "show" : ""].join(" ")}>
                    <div className="layout-wrapper">
                        <p>I'm SardineFish</p>
                        <p>Welcome to my website!</p>
                        <p>You are the <span ref="visit">?th</span> visitor here.</p>
                    </div>
                </div>
            </div>
        );
    }
}

interface BarChartProps
{
    id?: string;
    className?: string;
    data: ChartData[];
    maxValue?: number;
    animation?: boolean;
    palette?: string[];
}
interface BarChartRenderData
{
    name: string;
    value: number;
    color: string;
    note: string;
}
interface BarChartState
{
    data: BarChartRenderData[];
}
export class BarChart extends React.Component<BarChartProps, BarChartState>
{
    constructor(props: BarChartProps)
    {
        super(props);
        //const palette = getPalette(this.props.data.length);
        const palette = this.getPalette(this.props.data.length);
        const orderedData = linq.from(this.props.data).orderByDescending(data => data.value).toArray();

        this.state = {
            data: this.props.data.map((data, i) =>
            {
                return {
                    name: data.name,
                    value: data.value / (this.props.maxValue || linq.from(this.props.data).max(d => d.value)),
                    color: palette[orderedData.indexOf(data)],
                    note: data.note || ""
                }
            })
        };
    }
    async componentDidMount()
    {
        const maxValue = this.props.maxValue || (this.props.maxValue || linq.from(this.props.data).max(d => d.value));
        this.state.data.forEach(data => data.value = 0);
        this.setState(this.state);
        if (this.props.animation || this.props.animation === undefined)
        {
            for (let i = 0; i < this.state.data.length; i++)
            {
                this.state.data[i].value = this.props.data[i].value / maxValue;
                this.setState(this.state);
                await sleep(0.1);
            }
        }
    }
    getPalette(count: number)
    {
        const palette = this.props.palette || [
            "#03a9f4",
            "#81d4fa",
            "#0277bd",
            "#29b6f6",
            "#29b6f6",
            "#039be5",
            "#0288d1",
            "#b3e5fc",
            "#4fc3f7"
        ];
        return linq.from(palette).take(count).orderBy(str => Color.fromString(str).lightness).toArray();
    }
    render()
    {
        return (
            <div className={[this.props.className, "bar-chart"].join(" ")} id={this.props.id}>
                {
                    this.state.data.map((data, idx) => (
                        <div className="element" key={idx}>
                            <span className="name">{data.name}</span>
                            <span className="bar-wrapper" style={{ position: "relative" }}>
                                <span className="bar-value" style={{ position: "absolute", width: `${data.value * 100}%`, height: "100%", backgroundColor: data.color }}>
                                    <span className="note">{data.note}</span>
                                </span>
                            </span>
                        </div>
                    ))
                }
            </div>
        );
    }
}

interface DeferElementProps extends React.HtmlHTMLAttributes<HTMLElement>
{
    onShow?: () => void;
    visibleHeight: number;
}
export class DeferElement extends React.Component<DeferElementProps, { viewed: boolean }>
{
    constructor(props: DeferElementProps)
    {
        super(props);
        this.state = {
            viewed: false
        };
    }
    checkView()
    {
        let bound = (this.refs["element"] as HTMLElement).getBoundingClientRect();
        if (window.innerHeight - bound.top > this.props.visibleHeight)
        {
            this.setState({ viewed: true });
            if (this.props.onShow)
                this.props.onShow();
        }
    }
    componentDidMount()
    {
        this.checkView();
        document.addEventListener("scroll", (e) =>
        {
            if (!this.state.viewed)
            {
                this.checkView();
            }
        });
    }
    render()
    {
        let { className, visibleHeight, ...other } = this.props;
        className = [className, "defer-element", this.state.viewed ? "show" : ""].join(" ");
        return (
            <div className={className} ref="element" {...other}>
                {this.props.children}
            </div>
        )
    }
}

interface SectionProps extends React.HtmlHTMLAttributes<HTMLElement>
{
    header?: React.ReactNode
}
export class Section extends React.Component<SectionProps>
{
    get element()
    {
        return this.refs["element"] as HTMLElement;
    }
    render()
    {
        const { header, children, ...other } = this.props;
        return (
            <section {...other} ref="element">
                <header className="header">{header}</header>
                <main className="content-wrapper">{children}</main>
            </section>
        )
    }    
}


export class DeferSection extends React.Component<SectionProps, { viewed: boolean }>
{
    ref: React.RefObject<Section>;
    constructor(props: SectionProps)
    {
        super(props);
        this.state = {
            viewed: false
        };
        this.ref = React.createRef();
    }
    componentDidMount()
    {
        document.addEventListener("scroll", (e) =>
        {
            if (!this.state.viewed)
            {
                let bound = this.ref.current.element.getBoundingClientRect();
                if (bound.top < window.innerHeight / 2)
                    this.setState({ viewed: true });
            }
        });
    }
    render()
    {
        let { className, children, ...other } = this.props;
        className = `${this.props.className} defer-section ${this.state.viewed ? "show" : ""}`;
        return (
            <Section className={className} ref={this.ref} {...other}>
                {
                    this.state.viewed
                        ? this.props.children
                        : null
                }
            </Section>
        );
    }
}

export class LifeTimer extends React.Component<{},{t:number}>
{
    constructor(props:any)
    {
        super(props);
        this.state = {
            t: Math.floor((Date.now() - new Date("2015-11-25 0:0:0").getTime()) / 1000)
        };
    }
    componentDidMount()
    {
        setInterval(() =>
        {
            this.setState({
                t: Math.floor((Date.now() - new Date("2015-11-25 0:0:0").getTime()) / 1000)
            });
        }, 1000);
    }
    render()
    {
        return (
            <span>{this.state.t}</span>
        )
    }
}
export class Age extends React.Component<{}, { t: number }>
{
    constructor(props: any)
    {
        super(props);
        this.state = {
            t: moment.duration(Date.now() - new Date("1998-11-25 0:0:0").getTime()).years()
        };
    }
    componentDidMount()
    {
        setInterval(() =>
        {
            this.setState({
                t: moment.duration(Date.now()-new Date("1998-11-25 0:0:0").getTime()).years()
            });
        }, 1000);
    }
    render()
    {
        return (
            <span>{this.state.t}</span>
        )
    }
}
interface TextCloudProps
{
    data: ChartData[];
    maxSize: number;
    minSize: number;
    padding?: number;
    accuracy?: number;
    placeMode?: "center" | "random";
    id?: string;
    className?: string;
}
interface TextCloudRenderData
{
    text: string;
    size: number;
    order: number;
    x: number;
    y: number;
    opacity: number;
    show: boolean;
}
export class TextCloud extends React.Component<TextCloudProps,{data:TextCloudRenderData[]}>
{
    constructor(props: TextCloudProps)
    {
        super(props);
        const min = Math.min(...this.props.data.map(d => d.value));
        const max = Math.max(...this.props.data.map(d => d.value));
        this.state = {
            data: this.props.data.map(data =>
            {
                const t = (data.value - min) / (max - min);
                return {
                    text: data.name,
                    size: interpolate(this.props.minSize, this.props.maxSize, Math.sqrt(t)),
                    order: 1 - t, 
                    x: 0,
                    y: 0,
                    opacity: 0,
                    show: false,
                }
            })
        };
    }
    async componentDidMount()
    {
        type WordFigure = { pos: Vector2, size: Vector2 };
        const placedWords: WordFigure[] = [];
        const accuracy = this.props.accuracy || 3;
        const placeMode = this.props.placeMode || "center";
        const padding = this.props.padding || 5;
        const boundSize = vec2((this.refs["element"] as HTMLElement).getBoundingClientRect().width, (this.refs["element"] as HTMLElement).getBoundingClientRect().height);
        let dataSet = /*this.state.data;//*/linq.from(this.state.data).orderBy(d => d.order).toArray();
        for (let idx = 0; idx < this.state.data.length;idx++)
        //this.state.data.forEach((data, idx) =>
        {
            await sleep(0.01);
            const data = dataSet[idx];
            const bound = (this.refs[this.state.data.indexOf(data)] as HTMLElement).getBoundingClientRect();
            let figure: WordFigure = {
                pos: vec2(0, 0),
                size: vec2(bound.width, bound.height)
            };
            const basePos = placeMode === "center" ? vec2(0, 0) : scale(vec2(boundSize.x * (Math.random() - 0.5), boundSize.y * (Math.random() - 0.5)), 0.6);
            figure.pos = basePos;
            for (let phi = 0; ; phi += phi < 1 ? 1 / accuracy : 1 / phi)
            {
                let r = accuracy * phi;
                if (r > Math.hypot(boundSize.x / 2, boundSize.y / 2))
                {
                    console.error("Place Failed.");
                    return;
                }
                figure.pos = plus(basePos, vec2(r * Math.cos(phi), r * Math.sin(phi)));
            
                /*data.x = figure.pos.x + boundSize.x / 2;
                data.y = figure.pos.y + boundSize.y / 2;
                data.opacity = 1;
                this.setState({
                    data: this.state.data
                });

                await sleep(0.01);*/

                if (Math.abs(figure.pos.x) + figure.size.x / 2 > boundSize.x / 2 || Math.abs(figure.pos.y) + figure.size.y / 2 > boundSize.y / 2)
                    continue;

                if (placedWords.every(word => Math.max(
                    Math.abs(figure.pos.x - word.pos.x) - (figure.size.x / 2 + word.size.x / 2 + padding),
                    Math.abs(figure.pos.y - word.pos.y) - (figure.size.y / 2 + word.size.y / 2) + padding) > 0))
                {
                    placedWords.push(figure);
                    data.x = figure.pos.x + boundSize.x / 2;
                    data.y = figure.pos.y + boundSize.y / 2;
                    data.show = false;
                    data.size = 1;
                    break;
                }
            }
        }
        this.setState({
            data: this.state.data
        });

        await forEachAsync(linq.from(this.state.data).orderBy(d => d.order).toArray(), async (data, i) =>
        {
            await sleep(interpolate(0.3, 0.05, Math.sqrt(data.order)));
            let t = i / this.state.data.length;
            data.opacity = interpolate(0.5, 1, Math.sqrt(1 - data.order));
            data.show = true;
            data.size = interpolate(this.props.minSize, this.props.maxSize, Math.sqrt(1 - data.order))
            this.setState({
                data: this.state.data
            });
        });
        await sleep(0.7);
        this.state.data.forEach(data => data.show = false);
        this.setState({
            data: this.state.data
        });
    }
    render()
    {
        return (
            <div className={[this.props.className, "text-cloud"].join(" ")} id={this.props.id} ref="element" style={{position:"relative"}}>
                {
                    this.state.data.map((data, idx) => (
                        <span className={["word", data.show ? "show":""].join(" ")} key={idx} ref={idx.toString()} style={{
                            position: "absolute",
                            left: `${data.x}px`,
                            top: `${data.y}px`,
                            fontSize: `${data.size}px`,
                            opacity: data.opacity,
                            whiteSpace: "nowrap",
                            transform: "translate(-50%, -50%)",
                        }}>
                            {data.text}
                        </span>
                    ))
                }
            </div>
        )
    }
}

export interface FriendData
{
    name: string;
    link: string;
    avatar: string;
    note?: string;
}
export function FriendLink(props: { data: FriendData })
{
    return (
        <div className="friend-link">
            <a className="avatar-wrapper" href={props.data.link} target="_blank">
                <img className="friend-avatar" src={props.data.avatar} alt={props.data.name} />
            </a>
            <div className="friend-data">
                <a className="friend-name" href={props.data.link} target="_blank">{props.data.name}</a>
                <span className="friend-note">{props.data.note}</span>
            </div>
        </div>
    )
}
function processData(data: CommentResponseData):CommentProps
{
    return {
        avatar: data.avatar,
        name: data.name,
        postID: parseInt(data.pid),
        commentID: parseInt(data.cid),
        uid: data.uid,
        time: data.time,
        text: data.text,
        url: data.url,
        replies: parseInt(data.commentCount) > 0
            ? data.comments.map(c => processData(c))
            : []
    };
}
interface CommentSystemProps extends React.HtmlHTMLAttributes<HTMLElement>
{
    pageID: number;
    count?: number;
}
interface CommentSystemState
{
    sending: boolean;
    replyID: number;
    replyName: string;
    userAvatar: string;
    comments: CommentProps[];
    errorMsg: string;
}
export class CommentSystem extends React.Component<CommentSystemProps, CommentSystemState>
{
    constructor(props: CommentSystemProps)
    {
        super(props);
        this.state = {
            comments: [],
            replyID: this.props.pageID,
            replyName: "",
            userAvatar: "/img/decoration/unknown-user.png",
            errorMsg: " ",
            sending: false
        };
    }
    onReply(cid: number, name: string)
    {
        this.setState({
            replyID: cid,
            replyName: name
        });
    }
    onEmailInput(e: React.FocusEvent<HTMLInputElement>)
    {
        const email = (this.refs["input-email"] as HTMLInputElement).value;
        this.setState({
            userAvatar: gravatar.url(email, {
                default: "https://cdn-global-static.sardinefish.com/img/decoration/unknown-user.png",
            },true)
        });
    }
    async onSend()
    {
        if (this.state.sending)
            return;
        this.setState({
            sending: true,
            errorMsg: ""
        });
        const name = (this.refs["input-name"] as HTMLInputElement).value;
        const email = (this.refs["input-email"] as HTMLInputElement).value;
        const url = (this.refs["input-url"] as HTMLInputElement).value;
        const text = (this.refs["input-comment"] as HTMLElement).innerText;
        try
        {
            await SarAPI.Comment.Post(this.state.replyID, name, email, url, text);
            (this.refs["input-comment"] as HTMLElement).innerText = "";
            await this.reload();
            this.setState({
                sending: false
            });
        }
        catch (err)
        {
            this.setState({
                errorMsg: err.message,
                sending: false
            });
        }
    }
    async reload()
    {
        const count = this.props.count || 100;
        const response = (await fetch(`/comment/getList.php?cid=${this.props.pageID}&count=${count}`).then(r => r.json())) as APIResponse<CommentResponseData[]>;
        //let response: any = { "status": "^_^", "errorCode": null, "error": null, "data": [{ "pid": "315", "cid": 313, "uid": "b6f69dfdfd2bd7cdb4d79bafd0db0ab90c26ee00", "name": "%&*%*&\uffe5&\u2026\u2026", "text": "CXY\u5927\u50bb\u903c\uff01", "time": "2019-01-24 22:14:03", "avatar": "https:\/\/www.gravatar.com\/avatar\/1e0f7b027e1d6da3bc2dfb8d94858557?d=https:\/\/static.sardinefish.com\/img\/decoration\/unknown-user.png&s=256", "commentCount": "1", "comments": [{ "pid": "317", "cid": 315, "uid": "SardineFish", "name": "SardineFish", "text": "\u6211\u6c38\u8fdc\u559c\u6b22LYH\uff01", "time": "2019-01-25 00:22:22", "avatar": "https:\/\/cdn-img.sardinefish.com\/NjczODc3", "commentCount": "0", "like": "0" }], "like": "0" }, { "pid": "316", "cid": 313, "uid": "Dwscdv3", "name": "Dwscdv3", "text": "\u697c\u4e0a +1\uff08x", "time": "2019-01-25 00:22:14", "avatar": "http:\/\/img.sardinefish.com\/363", "commentCount": "0", "like": "0" }], "msg": "", "processTime": 1548690762500 };
        if (response.status != "^_^")
        {
            console.error(`Get comment failed. ${response.errorCode}: ${response.msg}`);
            return;
        }
        let data = response.data as CommentResponseData[];
        if (data && data.length > 0)
        {
            let props = data.map(d => processData(d));

            this.setState({
                comments: props
            });
        }
    }
    async componentDidMount()
    {
        await this.reload();
    }
    render()
    {
        const { className, children, pageID, ...others } = this.props;
        return (
            <section className={[className, "comment-system"].join(' ')} {...others}>
                <div className="post-area">
                    <div className="decoration">
                        <div className="circle-wrapper">
                            <div className="circle button button-reply" onClick={()=>this.onReply(this.props.pageID, "")}>
                                <IconAdd/>
                            </div>
                        </div>
                        <div className="line-wrapper">
                            <div className="line"></div>
                        </div>
                    </div>
                    <div className="hor-wrapper">
                        <div className="avatar-wrapper">
                            <img src={this.state.userAvatar} className="avatar" />
                            <div className="line"></div>
                        </div>
                        <div className="input-area">
                            <div className="info-wrapper">
                                <div className="user-info">
                                    <div className="hor-wrapper">
                                        <input type="text" className="text-input input-name" placeholder="名称（公开）" ref="input-name"/>
                                        <input type="email" className="text-input input-email" placeholder="邮箱（非公开）" ref="input-email" onBlur={e=>this.onEmailInput(e)}/>
                                    </div>
                                    <input type="url" className="text-input input-url" placeholder="Url（公开）" ref="input-url"/>
                                </div>
                                <div className={["button","button-send",this.state.sending?"sending":""].join(" ")} onClick={() => this.onSend()}>
                                    {
                                        this.state.sending
                                            ? <IconLoading/>
                                            : <IconSend></IconSend>
                                    }
                                </div>
                            </div>
                            <div
                                className="text-input input-comment"
                                contentEditable={true}
                                ref="input-comment"
                                data-placeholder={this.state.replyID === this.props.pageID
                                    ? "Tell me what you think"
                                    : `Reply to ${this.state.replyName}`}>
                            </div>
                            <p className="error-msg">{this.state.errorMsg}</p>
                        </div>
                    </div>
                </div>
                <ul className="comment-area">
                    {
                        linq.from(this.state.comments)
                            .orderByDescending(c => new Date(c.time).getTime())
                            .select((c, idx) => (<Comment {...c} key={idx} onReply={(cid, name) => this.onReply(cid, name)} />))
                            .toArray()
                    }
                </ul>
            </section>
        )
    }
}


interface CommentProps
{
    commentID: number;
    postID: number;
    uid: string;
    name: string;
    text: string;
    avatar: string;
    url: string;
    time: string;
    replies: CommentProps[];
    onReply?: (cid: number, name: string) => void;
}
export class Comment extends React.Component<CommentProps>
{
    onAvatarFailed(e: React.SyntheticEvent<HTMLElement, Event>)
    {
        (e.target as HTMLImageElement).src = "/img/decoration/unknown-user.png";   
    }
    onReplyBubble(cid: number, name:string)
    {
        if (this.props.onReply)
            this.props.onReply(cid, name);
    }
    onReplyClick()
    {
        if (this.props.onReply)
            this.props.onReply(this.props.postID, this.props.name);
    }
    render()
    {
        return (
            <li className="comment">
                <div className="decoration">
                    <div className="circle-wrapper">
                        <div className="circle button button-reply" onClick={()=>this.onReplyClick()}>
                            <IconReply />
                        </div>
                    </div>
                    <div className="line-wrapper">
                        <div className="line"></div>
                    </div>
                </div>
                <div className="ver-wrapper">
                    <div className="hor-wrapper">
                        <div className="avatar-wrapper">
                            <img src={this.props.avatar} className="avatar" onError={e=>this.onAvatarFailed(e)}/>
                            <div className={["line", this.props.replies.length > 0 ? "show" : "hide"].join(" ")}></div>
                        </div>
                        <div className="comment-wrapper">
                            <header className="sender-info">
                                <a className="name" href={this.props.url} target="_blank">{this.props.name}</a>
                                <span className="time">{this.props.time}</span>
                            </header>
                            <main className="comment-text">{this.props.text}</main>
                        </div>
                    </div>
                    <ul className="replies">
                        {
                            this.props.replies.map((reply, idx) => (<Comment key={idx} onReply={(cid, name)=>this.onReplyBubble(cid, name)} {...reply}></Comment>))
                        }
                    </ul>
                </div>
            </li>
        );
    }
}