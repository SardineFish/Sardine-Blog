const $ = document.querySelector.bind(document);

(() =>
{
    let expand = false;
    $("#search .icon-search").onclick = () =>
    {
        const value = $("#search-input").value;
        if (!expand)
        {
            expand = true;
            $("#search").classList.add("expand");
        }
        else if (!value)
        {
            expand = false;
            $("#search").classList.remove("expand");
        }
        else
        {
            $("#search").submit();
        }
    };
})();
$("#sun").onclick = () =>
{
    $("#root").classList.toggle("darken");
}
$("#button-menu").onclick = () =>
{
    $("#top").classList.toggle("extend-side");
};