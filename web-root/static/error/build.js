import fs from "fs";
import path from "path";

const templateFile = "./template.html";
const styleFile = "./style.css";
const scriptFile = "./script.js";

const errors = {
    "400": "一定是打开方式不对 (≧ ﹏ ≦)",
    "401": "朋友，票子要伐？(～￣▽￣)～",
    "402": "给点，给点~ ( $ _ $ )",
    "403": "禁 忌 领 域",
    "404": "大概被扔到宇宙中去了吧 〇_〇",
    "405": "禁止操作事项 {{{(>_<)}}}",
    "406": "告白被 Server 酱拒绝 ＞﹏＜",
    "407": "Proxy Authentication Required",
    "408": "您呼叫的用户暂时无人接听，请稍后再拨……",
    "409": "请求撞车了",
    "410": "咖啡已经被倒掉了",
    "413": "那个……那个太大了……不要放进来啊……",
    "414": "那个(指 URI)……太长了……要溢出来了……",
    "415": "这个……这个真没有",
    "416": "您呼叫的用户不在服务区",
    "417": "对不起……你期待的那个，Server 酱做不到 (≧ ﹏ ≦)",
    "418": "我什么都不知道，我只是一只茶壶啦 (￣▽￣)\"",
    "425": "来早了，等吧",
    "426": "変身！",
    "429": "太……太多了……要溢出来了⭐",
    "431": "那个……头太大了……不要放进来啊……",
    "451": "【禁止说明事项】",
    "500": "别这样，要坏掉了",
    "501": "在做了，在做了",
    "502": "Server 酱身体检查中",
    "503": "Server 酱身体检查中",
    "504": "Server 酱你醒醒啊，醒醒！",
    "505": "致远星战况良好",
    "511": "交网费了没？"
}

const style = fs.readFileSync(styleFile).toString();
const script = fs.readFileSync(scriptFile).toString();
const htmlTemplate = fs.readFileSync(templateFile).toString().replace("${inject-css}", `
<style>
${style}
</style>`)
    .replace("${inject-script}", `
<script>
${script}
</script>`);
Object.keys(errors).forEach((code) =>
{
    const html = htmlTemplate.replace(/\${error-code}/g, code).replace(/\${error-msg}/g, errors[code]);
    fs.writeFileSync(`${code}.html`, html);
    console.log(`Built ${code}.html`);
})