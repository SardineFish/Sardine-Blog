/**
 * @typedef {import("../lib/Script/SardineFish/SardineFish.API")}
 */
function buttonLoginClick(sender)
{
    $("#loginRing").stop();
    $("#loginInputArea").stop();
    $("#loginInputArea").animate({ opacity: 0 }, 150, function ()
    {
        $("#loginRing").animate({ opacity: 1 }, 300);
    });
    $("#warningText").html("&nbsp;");
    var uid = document.getElementById("uidText").value;
    var pwd = document.getElementById("pwdText").value;
    SardineFish.API.User.getChallenge({ uid: uid })
        .then(challenge =>
        {
            let hashFunc;
            switch (challenge.method)
            {
                case SardineFish.API.HashMethod.SHA256:
                    hashFunc = p => CryptoJS.SHA256(p).toString();
                    break;
                case SardineFish.API.HashMethod.SHA1:
                    hashFunc = p => CryptoJS.SHA1(p).toString();
                    break;
                case SardineFish.API.HashMethod.MD5:
                    hashFunc = p => CryptoJS.MD5(p).toString();
                    break;
                case SardineFish.API.HashMethod.NoLogin:
                    throw new Error("User disabled.");
            }
            let pwdHash = hashFunc(hashFunc(hashFunc(pwd) + challenge.salt) + challenge.challenge);
            return SardineFish.API.User.login({}, {
                uid: uid,
                pwd_hash: pwdHash
            });
        }).then(token =>
        {
            var url = $.cookie("ref");
            if (!url || url == "")
                url = "/";
            window.location = url;
        }).catch(err =>
        {
            $("#loginRing").stop();
            $("#loginInputArea").stop();
            $("#loginRing").animate({ opacity: 0 }, 300, function ()
            {
                $("#loginInputArea").animate({ opacity: 1 }, 100);
                $("#warningText").text(err.message);
            });
        });
}
function loginAreaKeyPress(e)
{
    if (!e)
        return;
    if (e.char == '\n')
        buttonLoginClick(null);
}
SardineFish.Web.UI.setButton($("#buttonLogin"), ButtonStyle.ColorTransit);
SardineFish.Web.UI.setButton($("#buttonRegister"), ButtonStyle.ColorTransit);
document.getElementById("loginArea").onkeypress = loginAreaKeyPress;