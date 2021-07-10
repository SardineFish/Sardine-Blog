import React from "react";

function wrap<T>()
{
    
}

const icons = {
    Magnify: () => (<svg viewBox="0 0 24 24">
        <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
    </svg>),
};



export const Icons = Object.keys(icons).map((key) => [key, (propsOverride: React.SVGProps<React.ReactSVGElement>) =>
{
    const element = icons[key as keyof typeof icons]();
    if (element)
    {
        const { props, ...others } = element;
        return { props: { ...props, ...propsOverride }, ...others };
    }
}] as [string, React.FC<React.SVGProps<React.ReactSVGElement>>])
    .reduce((prev, curr) => ({ [curr[0]]: curr[1], ...prev }), {} as { [key in keyof typeof icons]: React.FC<React.SVGProps<React.ReactSVGElement>> });
