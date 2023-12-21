import React, { useEffect, useMemo, useRef, useState } from "react";
import { API } from "sardinefish";
import { WindowEvent } from "./window-event";
import clsx from "clsx";
import BezierEasing from "bezier-easing";

type States = "idle" | "hit" | "hold";

export function LargeLikeButton(props: { pid: number })
{
    const [likes, setLikes] = useState<number>();
    const [state, setState] = useState<States>("idle");
    const [playingSequence, setPlaying] = useState<AnimHandle>();
    const [sharedStrength] = useState({ value: 0 });

    const loadStats = async () =>
    {
        const stats = await API.PostData.getStatsByPid({ pid: props.pid });
        setLikes(stats.likes);
    };

    useEffect(() =>
    {
        setLikes(undefined);
        setState("idle");
        playingSequence?.abort();
        setPlaying(undefined);
        loadStats();
        fillRef.current?.r.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0);
    }, [props.pid]);

    // const button = stats.querySelector(".like-button");

    const VIEWPORT = 24;
    // let playingSequence = null;
    const fillRef = useRef<SVGCircleElement>(null);
    const buttonRef = useRef<SVGSVGElement>(null);
    // const fill = button.querySelector(".heart-fill");

    const handleMoseDown = (e: React.MouseEvent<SVGElement> | React.Touch) =>
    {
        if (state === "hit")
            return;

        if (!fillRef.current)
            return;
        if (!buttonRef.current)
            return;

        const fill = fillRef.current;
        const button = buttonRef.current;

        // state = "hold";
        setState("hold");
        const rect = button.getBoundingClientRect();
        const x = (e.clientX - rect.x) / rect.width;
        const y = (e.clientY - rect.y) / rect.height;
        // console.log(fill, x, y);
        fill.cx.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, x * VIEWPORT);
        fill.cy.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, y * VIEWPORT);
        animate(t =>
        {
            fill.r.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 36 * t);
        }, 0.5, BezierEasing(0, 0, 0.55, 1));

        let strength = 1;
        const handle = sequence(async (provider) =>
        {
            for (let shakeDistance = 0; ; shakeDistance += 0.3)
            {
                strength += 0.1;
                strength = Math.min(2, strength);
                sharedStrength.value = strength;

                shakeDistance = Math.min(shakeDistance, 10);
                const duration = randRange(0.05, 0.05);
                const targetX = randRange(-shakeDistance, shakeDistance);
                const targetY = randRange(-shakeDistance, shakeDistance);
                await provider.animate(t =>
                {
                    const x = targetX * t;
                    const y = targetY * t;
                    button.style.translate = `${x}px ${y}px`;
                }, duration)
            }
        }
        );

        setPlaying(handle);
    }

    const handleCancel = () =>
    {
        if (!fillRef.current)
            return;
        if (!buttonRef.current)
            return;

        const fill = fillRef.current;
        const button = buttonRef.current;

        if (state === "hold")
        {
            playingSequence?.abort();
            button.style.translate = "";
            setState("idle");
            fill.r.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0);
        }
    };

    const handleRelease = (e: React.UIEvent<SVGElement>) =>
    {
        e.preventDefault();
        e.stopPropagation();

        if (!fillRef.current)
            return;
        if (!buttonRef.current)
            return;

        const fill = fillRef.current;
        const button = buttonRef.current;

        console.log(sharedStrength.value);

        if (state !== "idle")
        {
            playingSequence?.abort();
            button.style.translate = "";
            // state = "hit";
            setState("hit");
            // stats.classList.add("hit");

            if (props.pid > 0)
            {
                API.PostData.like({ pid: props.pid }, {})
                    .then(data =>
                    {
                        setLikes(data)
                    }).catch(err =>
                    {
                        console.error(err);
                    });

            }

            const colors = [
                "#3ed6fa",
                "#fa603e",
                "#9de35d",
                "#8f3bdd",
                "#ffe376"
            ]

            const count = 16;
            for (let i = 0; i < count; ++i)
            {
                const theta = i / count * Math.PI * 2;
                const dx = Math.cos(theta);
                const dy = Math.sin(theta);
                const inner = [14, 16][i % 2] * sharedStrength.value;
                const outer = [28, 24][i % 2] * sharedStrength.value * sharedStrength.value;

                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dx * inner);
                line.y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dy * inner);

                line.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dx * inner);
                line.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dy * inner);

                line.style.strokeWidth = [1.4, 1][i % 2].toString();
                line.style.stroke = colors[i % colors.length];
                line.style.opacity = "0";

                button.appendChild(line);

                sequence(async (provider) =>
                {
                    await timeout(0.15);
                    line.style.opacity = "1";
                    provider.animate(t =>
                    {
                        const endpoint = lerp(inner, outer, t);
                        line.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dx * endpoint);
                        line.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dy * endpoint);
                    }, 0.1, BezierEasing(0, 0, 0.4, 1));

                    await timeout(0.05);

                    await provider.animate(t =>
                    {
                        const endpoint = lerp(inner, outer, t);
                        line.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dx * endpoint);
                        line.y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER, 0.5 * VIEWPORT + dy * endpoint);
                    }, 0.3, BezierEasing(0, 0, 0.4, 1));

                    await provider.animate(t =>
                    {
                        line.style.opacity = `${1 - t}`;
                    }, 0.05);

                    button.removeChild(line);
                });
                sequence(async (provider) =>
                {
                    await provider.animate(t =>
                    {
                        button.style.transform = `scale(${lerp(1, 1.2, t)})`;
                    }, 0.1, BezierEasing(0.57, -0.77, 0.25, 1));

                    await provider.animate(t =>
                    {
                        button.style.transform = `scale(${lerp(1.1, 1, t)})`;
                    }, 0.2, BezierEasing(0, 0, 0.2, 1));
                })
            }
        }


        sharedStrength.value = 1;
    }

    // button.addEventListener("mousedown", handleMoseDown);
    // button.addEventListener("touchstart", e => handleMoseDown(e.touches[0]));
    // window.addEventListener("mouseup", handleCancel);
    // window.addEventListener("touchend", e =>
    // {
    //     handleCancel();
    // });

    // button.addEventListener("mouseup", handleRelease);
    // button.addEventListener("touchend", handleRelease);

    return (
        <div className={clsx("stats-like", "stats-item", state)}>
            <svg className="like-button" xmlns="http://www.w3.org/2000/svg" ref={buttonRef} viewBox="0 0 24 24" onMouseUp={handleRelease} onTouchEnd={handleRelease} onMouseDown={handleMoseDown} onTouchStart={e => handleMoseDown(e.touches[0])}>
                <g transform="translate(0, 1)">
                    <mask id="hart-mask">
                        <rect x="0" y="0" width="24" height="24" fill="black" />

                        <path
                            d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"
                            fill="white" />
                    </mask>

                    <g mask="url(#hart-mask)">
                        <circle id="heart-fill" className="heart-fill" cx="0" cy="0" r="0" fill="#ffbaca" ref={fillRef} />
                    </g>
                    <path
                        d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"
                        fill="none" stroke="#ff5c83" strokeWidth="1" />
                </g>
            </svg>
            <div className="stats-value">{likes?.toString() ?? "-"}</div>
            <WindowEvent event="mouseup" listener={handleCancel} />
            <WindowEvent event="touchend" listener={handleCancel} />
        </div>
    );
}

function animate(callback: (t: number) => void, t: number, timingFunc: (t: number) => number = t => t)
{
    return new Promise<void>((resolve, reject) =>
    {
        let offset = 0;
        let elapsed = 0;
        const update = (delay: number) =>
        {
            if (offset === 0)
                offset = delay;

            elapsed = (delay - offset) / 1000;
            if (elapsed >= t)
                elapsed = t;

            try
            {

                callback(timingFunc(elapsed / t));
            }
            catch (e)
            {
                reject(e);
                return;
            }

            if (elapsed === t)
                resolve();
            else
                requestAnimationFrame(update);

        }

        callback(0);

        requestAnimationFrame(update);
    });
}

const SEQUENCE_ABORTED = Symbol("SEQUENCE_ABORTED");

interface AnimProvider
{
    abortSignal: boolean,
    animate(callback: (t: number) => void, t: number, timingFunc?: (t: number) => number): void,
}

interface AnimHandle
{
    abort(): void,
}

function sequence(process: (provider: AnimProvider) => Promise<void>): AnimHandle
{
    const handle: AnimHandle = {
        abort: () =>
        {
            animProvider.abortSignal = true;
        }
    };

    const animateRuntime = animate;
    const animProvider: AnimProvider = {
        abortSignal: false,
        animate(callback, duration, timingFunc = t => t)
        {
            return animateRuntime(t =>
            {
                if (this.abortSignal)
                {
                    throw SEQUENCE_ABORTED;
                }
                else
                {
                    callback(t);
                }
            }, duration, timingFunc);
        }
    }
    process(animProvider).catch(e =>
    {
        if (e !== SEQUENCE_ABORTED)
        {
            throw e;
        }
    });

    return handle;
}

function randRange(a: number, b: number)
{
    return Math.random() * (b - a) + a;
}
function lerp(a: number, b: number, t: number)
{
    return (b - a) * t + a;
}
function timeout(t: number)
{
    return new Promise(resolve =>
    {
        setTimeout(resolve, t * 1000);
    });
}