const BaseOption = require("./build.base");

require("esbuild").build({
    ...BaseOption,
    minify: true,
});