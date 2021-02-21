
pub struct MessageMail {
    pub title: String,
    pub content: String,
}

pub fn format_message_mail(message: &MessageMail) -> String {
    
    return format!(r#"
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
    <table cellspacing="0" border="0" cellpadding="0" width="100%" style="background-color: white">
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
                                                    <h1 style="width:800px; text-align:left; color:#6bdae9; font-weight:normal; margin:0; margin-bottom: 30px">
                                                        {title}
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
                                                        {content}
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
                                                        <p>This is an error report from SardineFish's blog.</p>
                                                        <p>You are receiving this because the site is configured to send email notification to you.</p>
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
        title = message.title,
        content = message.content,
    );
}