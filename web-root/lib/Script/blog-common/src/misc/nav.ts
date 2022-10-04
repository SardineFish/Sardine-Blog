export const BlogNavigation = {
    login: (redir: string) => `/account/login?redirect=` + encodeURIComponent(redir),
}