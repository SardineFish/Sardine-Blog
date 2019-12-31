
export async function scrollToTop(time: number = .5)
{
    return new Promise(resolve =>
    {
        const func = (t: number) =>
        {
            if (t <= 0)
            {
                t = 0;
                window.scrollTo(0, 0);
                resolve();
            }
            else
            {
                const dt = 0.01667;
                const dh = window.scrollY / (t / dt);
                window.scrollTo(0, window.scrollY - dh);
                setTimeout(() => func(t - dt), 16);
            }
        }
        setTimeout(() => func(time), 16);
    });
}

export function urlWrapper(url: string)
{
    if (/^\s*$/.test(url))
        return "#";
    if (!/^https?:\/\//i.test(url))
        return `//${url}`;
    return url;
}