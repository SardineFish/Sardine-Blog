export interface NavItem
{
    name: string;
    key: string;
    url: string;
}

export const SiteNavs: NavItem[] = [
    {
        name: "HOME",
        url: "/",
        key: "home"
    },
    {
        name: "BLOG",
        url: "/blog/",
        key: "blog",
    },
    {
        name: "NOTE",
        url: "/note/",
        key: "note",
    },
    {
        name: "GITHUB",
        url: "https://github.com/SardineFish",
        key: "github",
    },
    {
        name: "LAB",
        url: "https://lab.sardinefish.com",
        key: "lab",
    },
    {
        name: "ABOUT",
        url: "/about/",
        key: "about",
    }
];