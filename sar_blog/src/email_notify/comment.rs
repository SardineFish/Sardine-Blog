pub struct CommentNotifyInfo {
    pub receiver_name: String,
    pub author_name: String,
    pub author_avatar: String,
    pub author_url: String,
    pub url: String,
    pub unsubscribe_url: String,
    pub time: String,
    pub comment_text: String,
}

pub fn format_comment_email(info: &CommentNotifyInfo) -> String {
    format!(
        r#"
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification Mail</title>
    <style>
        #body {{
            margin: 0;
            padding: 0;
            font-family: 'Open Sans', 'Roboto', 'Segoe UI', 'Microsoft YaHei UI', Tahoma, Geneva, Verdana, sans-serif;
        }}
    </style>
</head>

<body id="body" style="height: 100%; margin: 0; padding: 0; font-family: 'Open Sans', 'Roboto', 'Segoe UI', 'Microsoft YaHei UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table cellspacing="0" border="0" cellpadding="0" width="100%" style="background-color: #eee">
        <tbody>
            <tr stype="padding:32px; background-color: white">
                <td>
                    <table align="center" width="100%" style="background-color:white; ">
                        <tbody>
                            <tr height="30px"></tr>
                            <tr>
                                <td align="center">
                                    <table width=800>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <h1
                                                        style="width:800px; text-align:left; color:#6bdae9; font-weight:normal; margin:0; margin-bottom: 30px">
                                                        A New Reply to Your
                                                        Comment
                                                    </h1>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr height=54>

            </tr>
            <tr>
                <td align="center">
                    <table width="800" style="background-color: white; border-radius: 10px">
                        <tbody>
                            <tr height=30 width="100%">
                                <td width=30></td>
                                <td width=64></td>
                                <td width=16></td>
                                <td>
                                </td>
                                <td width=30></td>
                            </tr>
                            <tr>
                                <td width=30></td>
                                <td width=64>
                                    <img height="64" width="64" style="border-radius: 100%"
                                        src="{author_avatar}"
                                        alt="">
                                </td>
                                <td width=16></td>
                                <td>
                                    <table>
                                        <tbody>
                                            <tr valign="center">
                                                <td>
                                                    <a href="{author_url}"
                                                        style="font-size: 16pt; font-weight: bolder; color: black; text-decoration: none; ">{author_name}</a>
                                                </td>
                                                <td width="8"></td>
                                                <td>
                                                    <span style="color:#ccc; font-size:10pt;">{time}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td width=30></td>
                            </tr>
                            <tr>
                                <td width=30></td>
                                <td width=64></td>
                                <td width=16></td>
                                <td>
                                    <p style="margin: 0">{comment_text}</p>
                                </td>
                                <td width=30></td>
                            </tr>
                            <tr height=30></tr>
                        </tbody>
                    </table>

                </td>
            </tr>

            <tr height=160>
                <td align="center" valign="center">
                    <table width="240" style="background-color: #80DEEA; border-radius:5px; box-shadow: 0 0 20px #ddf6fa">
                        <tbody>
                            <tr height=40>
                                <td align="center">
                                    <a href="{url}"
                                        style="font-size: 16pt; background-color:#80DEEA; color:white; padding: 5px 60px; margin: 30px 0; text-decoration: none; border-radius:5px">View
                                        It</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </td>
            </tr>

            <tr>
                <td>
                    <table align="center" width="100%" style="background: white">
                        <tbody>
                            <tr>
                                <td align="center">
                                    <table width=800>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div style="text-align:left; margin-top: 40px">
                                                        <p>This is a new reply to you from {author_name}</p>
                                                        <p>You are receiving this because you commented on this website and
                                                            agree to receive
                                                            email notify.</p>
                                                        <p>You can <a href="{url}"
                                                                style="color:#26c5da">View the
                                                                comment</a>, or <a href="{unsubscribe_url}"
                                                                style="color:#26c5da">unsubscribe</a></p>
                                                        <p style="margin-top:60px; color:#aaa">Sent by SardineFish
                                                            Push Service, source code available on
                                                                <a
                                                                href="https://github.com/SardineFish/sar-push-service"
                                                                style="color:#6bdae9">GitHub</a></p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>

</body>

</html>
"#,
        author_name = info.author_name,
        author_url = info.author_url,
        author_avatar = info.author_avatar,
        url = info.url,
        unsubscribe_url = info.unsubscribe_url,
        time = info.time,
        comment_text = info.comment_text
    )
}
