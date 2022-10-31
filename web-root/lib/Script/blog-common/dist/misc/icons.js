import clsx from "clsx";
import React from "react";
function wrap() {
}
const icons = {
    Magnify: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" }))),
    AlertCircle: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" }))),
    AlertCircleOutline: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" }))),
    CloseCircle: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" }))),
    Menu: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" }))),
    Send: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M2,21L23,12L2,3V10L17,12L2,14V21Z" }))),
    Plus: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" }))),
    Close: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" }))),
    DotsVertical: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" }))),
    DeleteForever: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8.46,11.88L9.87,10.47L12,12.59L14.12,10.47L15.53,11.88L13.41,14L15.53,16.12L14.12,17.53L12,15.41L9.88,17.53L8.47,16.12L10.59,14L8.46,11.88M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z" }))),
    TextBoxRemoveOutline: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M14.46,15.88L15.88,14.46L18,16.59L20.12,14.46L21.54,15.88L19.41,18L21.54,20.12L20.12,21.54L18,19.41L15.88,21.54L14.46,20.12L16.59,18L14.46,15.88M5,3H19C20.11,3 21,3.89 21,5V12.8C20.39,12.45 19.72,12.2 19,12.08V5H5V19H12.08C12.2,19.72 12.45,20.39 12.8,21H5C3.89,21 3,20.11 3,19V5C3,3.89 3.89,3 5,3M7,7H17V9H7V7M7,11H17V12.08C16.15,12.22 15.37,12.54 14.68,13H7V11M7,15H12V17H7V15Z" }))),
    InfoOutline: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" }))),
    DotsCircle: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M12 19C13.1 19 14 19.9 14 21S13.1 23 12 23 10 22.1 10 21 10.9 19 12 19M12 1C13.1 1 14 1.9 14 3S13.1 5 12 5 10 4.1 10 3 10.9 1 12 1M6 16C7.1 16 8 16.9 8 18S7.1 20 6 20 4 19.1 4 18 4.9 16 6 16M3 10C4.1 10 5 10.9 5 12S4.1 14 3 14 1 13.1 1 12 1.9 10 3 10M6 4C7.1 4 8 4.9 8 6S7.1 8 6 8 4 7.1 4 6 4.9 4 6 4M18 16C19.1 16 20 16.9 20 18S19.1 20 18 20 16 19.1 16 18 16.9 16 18 16M21 10C22.1 10 23 10.9 23 12S22.1 14 21 14 19 13.1 19 12 19.9 10 21 10M18 4C19.1 4 20 4.9 20 6S19.1 8 18 8 16 7.1 16 6 16.9 4 18 4Z" }))),
    CheckCircle: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" }))),
    Pencil: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" }))),
    Upload: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" }))),
    ImageArea: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M20,5A2,2 0 0,1 22,7V17A2,2 0 0,1 20,19H4C2.89,19 2,18.1 2,17V7C2,5.89 2.89,5 4,5H20M5,16H19L14.5,10L11,14.5L8.5,11.5L5,16Z" }))),
    ChefHat: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M12.5,1.5C10.73,1.5 9.17,2.67 8.67,4.37C8.14,4.13 7.58,4 7,4A4,4 0 0,0 3,8C3,9.82 4.24,11.41 6,11.87V19H19V11.87C20.76,11.41 22,9.82 22,8A4,4 0 0,0 18,4C17.42,4 16.86,4.13 16.33,4.37C15.83,2.67 14.27,1.5 12.5,1.5M12,10.5H13V17.5H12V10.5M9,12.5H10V17.5H9V12.5M15,12.5H16V17.5H15V12.5M6,20V21A1,1 0 0,0 7,22H18A1,1 0 0,0 19,21V20H6Z" }))),
    ForkKnife: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z" }))),
    Account: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" }))),
    ChevronRightL: () => (React.createElement("svg", { viewBox: "0 0 24 24" },
        React.createElement("path", { fill: "currentColor", d: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" }))),
};
export const Icons = Object.keys(icons).map((key) => [key, (propsOverride) => {
        const element = icons[key]();
        if (element) {
            const { props, ...others } = element;
            let { className, ...otherOverride } = propsOverride;
            className = clsx("icon", className);
            propsOverride = { className, ...otherOverride };
            return { props: { ...props, ...propsOverride }, ...others };
        }
    }])
    .reduce((prev, curr) => ({ [curr[0]]: curr[1], ...prev }), {});
//# sourceMappingURL=icons.js.map