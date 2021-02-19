/**
 * @typedef {import("../../lib/Script/SardineFish/SardineFish.API")}
 */

const $ = (selector) => document.querySelector(selector);
$(".time-year").innerText = new Date().getFullYear();
$("#button-retry").href = `./${location.search}`;

$("#button-unsubscribe").addEventListener("click", () =>
{
    $("#unsubscribe .action").classList.add("state-pending");
    let uid = /\/([^\/]+)$/.exec(window.location.pathname)[1].toString();
    SardineFish.API.User.deleteEmail({ uid: uid })
        .then(() =>
        {
            $("#root").className = "state-success";
        }).catch(err =>
        {
            if (err.code == 0x0003_0900)
                window.location = `/account/login?redirect=${encodeURIComponent(window.location)}`;
            else
                $("#root").className = "state-error";
        });
});