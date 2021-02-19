const $ = (selector) => document.querySelector(selector);
$(".time-year").innerText = new Date().getFullYear();
$("#button-retry").href = `./${location.search}`;

$("#button-unsubscribe").addEventListener("click", () =>
{
    $("#unsubscribe .action").classList.add("state-pending");
    fetch(`unsubscribe.php${location.search}`)
        .then(response => response.json())
        .then(data =>
        {
            if (data.status != "^_^")
            {
                $("#root").className = "state-error";
            }
            else
            {
                $("#root").className = "state-success";
            }
        });
});