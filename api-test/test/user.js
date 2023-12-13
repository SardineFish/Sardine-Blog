import { describe, it } from "mocha";
import sardinefish from "sardinefish";
import { loginRoot } from "./shared.js";
import assert from "assert"

describe("User account service", async () =>
{
    let authInfo;
    before(async () =>
    {
        authInfo = await loginRoot();
    });

    it("Login Root", async () =>
    {
        assert(authInfo.expire);
        assert(authInfo.session_id);
        assert(authInfo.token);

        const info = await SardineFish.API.User.getInfo.auth(authInfo.session_id, authInfo.token)();
        assert.equal(info.name, "Root User");
    })
});