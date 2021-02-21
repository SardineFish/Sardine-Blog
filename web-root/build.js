const child_process = require("child_process");
const path = require("path");

const npm = /^win/.test(process.platform)
    ? "npm.cmd"
    : "npm";

const packagePaths = {
    note: "note",
    about: "about",
    api: "lib/Script/SardineFish",
    "markdown-it-katex-bundle": "lib/Script/markdown-it-katex-bundle",
};
(async () =>
{
    await Promise.all(Object.keys(packagePaths).map(async (package) =>
    {
        console.log(`Building ${package}`);
        console.log(`[${package}] Install dependencies`);
        const workDir = path.resolve("./", packagePaths[package]);
        await onExit(child_process.spawn(npm, ["install"], {
            stdio: ['ignore', process.stdout, process.stderr],
            cwd: workDir,
        }));
        await onExit(child_process.spawn(npm, ["run", "build"], {
            cwd: workDir,
            stdio: ['ignore', process.stdout, process.stderr]
        }));
    }));
    console.log("Build completed");

})();

function onExit(target)
{
    return new Promise(resolve =>
    {
        target.once("exit", () => resolve());
    });
}