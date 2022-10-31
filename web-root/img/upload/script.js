/**
 * @typedef {import("../../lib/Script/SardineFish/SardineFish.API")}
 */

function upload(img)
{
    $("#buttonUpload").stop();
    $("#buttonUpload").animate({ opacity: 0 }, 700, function ()
    {
        $("#buttonUpload").css("opacity", "0");
        $("#progressBar").css("opacity", "0");
        $("#progressBar").animate({ "opacity": 1 }, 1000);
    });
    SardineFish.API.Storage.getUploadInfo({}, {})
        .then(info =>
        {
            const formData = new FormData();
            formData.append("token", info.token);
            formData.append("key", info.key);
            formData.append("file", img);
            return SardineFish.API.Utils.requestProgress(info.upload, {
                method: "POST",
                onUploadProgress: (sent, total) =>
                {
                    $("#progress").stop();
                    $("#progress").animate({ width: sent / total * 100 + "%" }, 200);
                    console.log(sent);
                },
                body: formData,
            })
        })
        .then(response => response.json())
        .then(data =>
        {
            const urlBase = "https://img.sardinefish.com/";
            $("#progress").stop();
            $("#progress").animate({ width: "100%" }, 200);
            $("#link").attr("href", urlBase + data.key);
            $("#link").text(urlBase + data.key);

            $("#img-embed").text(`<img alt="" src="${urlBase + data.key}">`);
            $("#markdown").text(`![](${urlBase + data.key})`);
            uploadComplete({
                url: urlBase + data.key,
                key: data.key
            });
        })
        .catch(err =>
        {
            console.error(err);
        });
}
function resizeImg()
{
    return; // use flex instead
    if (imgArea.width() / imgArea.height() > imgPreview.width() / imgPreview.height())
    {
        imgPreview.css("width", "auto");
        imgPreview.css("height", "100%");
    }
    else
    {
        imgPreview.css("width", "100%");
        imgPreview.css("height", "auto");
    }
    imgPreview.css("top", ((imgArea.height() - imgPreview.height()) / 2) + "px");
    imgPreview.css("max-width", imgPreview.get(0).naturalWidth);
    imgPreview.css("max-height", imgPreview.get(0).naturalHeight);

}
function uploadComplete(data)
{
    imgPreview.get(0).onload = function ()
    {
        resizeImg();
        // $("#progressBar").animate({ "opacity": 0 }, 700);
        $("#buttonUpload").animate({ opacity: 1 }, 200);
    }
    const urlBase = "https://img.sardinefish.com/";
    imgPreview.get(0).src = urlBase + data.key;
    if (onUploaded)
    {
        onUploaded({
            url: urlBase + data.key,
            key: data.key
        });
        $("#progress").stop();
        $("#progress").animate({ width: "100%" }, 200);
        $("#link").attr("href", urlBase + data.key);
        $("#link").text(urlBase + data.key);
        uploadComplete({
            url: "https://img.sardinefish.com/" + data.key,
            key: data.key
        });
    }


}
//public Events
window.onUploaded = null;
$("#buttonUpload").mouseenter(function (e)
{
    $("#buttonUpload").stop();
    $("#buttonUpload").animate({ boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" }, 200);
});
$("#buttonUpload").mouseout(function (e)
{
    $("#buttonUpload").stop();
    $("#buttonUpload").animate({ boxShadow: "0px 2px 6px rgba(0,0,0,0.2)" }, 200);
});
$("#buttonUpload").click(function (e)
{
    $("#filePicker").get(0).click();
});
$("#filePicker").change(function (e)
{
    upload($("#filePicker").get(0).files[0]);
});
var imgArea = $("#imgArea");
var imgPreview = $("#imgPreview");
window.onresize = function (e)
{
    resizeImg();
}
window.onload = function (e)
{
    resizeImg();
}
window.document.addEventListener("paste", async e =>
{
    if (e.clipboardData.files.length == 1)
    {
        const file = e.clipboardData.files[0];
        upload(new Blob([await file.arrayBuffer()]));
        // const info = await SardineFish.API.Storage.getUploadInfo({});
        // const formData = new FormData();
        // formData.append("token", info.token);
        // formData.append("key", info.key);
        // formData.append("file", new Blob([await file.arrayBuffer()]));
        // const response = await SardineFish.API.Utils.requestProgress(info.upload, {
        //     method: "POST",
        //     onUploadProgress: (sent, total) =>
        //     {
        //         $("#progress").stop();
        //         $("#progress").animate({ width: sent / total * 100 + "%" }, 200);
        //         console.log(sent);
        //     },
        //     body: formData,
        // })
    }
})