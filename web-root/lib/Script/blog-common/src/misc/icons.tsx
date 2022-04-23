import clsx from "clsx";
import React from "react";

function wrap<T>()
{
    
}

const icons = {
    Magnify: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
    </svg>),
    AlertCircle: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
    </svg>),
    AlertCircleOutline: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
    </svg>),
    CloseCircle: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
    </svg>),
    Menu: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
    </svg>),
    Send: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
    </svg>),
    Plus: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
    </svg>),
    Close: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>),
    DotsVertical: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
    </svg>),
    DeleteForever: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8.46,11.88L9.87,10.47L12,12.59L14.12,10.47L15.53,11.88L13.41,14L15.53,16.12L14.12,17.53L12,15.41L9.88,17.53L8.47,16.12L10.59,14L8.46,11.88M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z" />
    </svg>),
    TextBoxRemoveOutline: () => (<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M14.46,15.88L15.88,14.46L18,16.59L20.12,14.46L21.54,15.88L19.41,18L21.54,20.12L20.12,21.54L18,19.41L15.88,21.54L14.46,20.12L16.59,18L14.46,15.88M5,3H19C20.11,3 21,3.89 21,5V12.8C20.39,12.45 19.72,12.2 19,12.08V5H5V19H12.08C12.2,19.72 12.45,20.39 12.8,21H5C3.89,21 3,20.11 3,19V5C3,3.89 3.89,3 5,3M7,7H17V9H7V7M7,11H17V12.08C16.15,12.22 15.37,12.54 14.68,13H7V11M7,15H12V17H7V15Z" />
    </svg>),
};

export const Icons = Object.keys(icons).map((key) => [key, (propsOverride: React.SVGProps<React.ReactSVGElement>) =>
{
    const element = icons[key as keyof typeof icons]();
    if (element)
    {
        const { props, ...others } = element;
        let { className, ...otherOverride } = propsOverride;
        className = clsx("icon", className);
        propsOverride = { className, ...otherOverride };
        return { props: { ...props, ...propsOverride }, ...others };
    }
}] as [string, React.FC<React.SVGProps<React.ReactSVGElement>>])
    .reduce((prev, curr) => ({ [curr[0]]: curr[1], ...prev }), {} as { [key in keyof typeof icons]: React.FC<React.SVGProps<React.ReactSVGElement>> });
