import { describe, it, before } from "mocha";
import * as sardinefish from "sardinefish";
import assert from "assert";
import { RootUserName, config, loginRoot, shouldThrowAsync } from "./shared.js";
import { v4 as uuidv4 } from "uuid";

describe("Gallery", async () =>
{
    let authInfo;
    let pid = 0;
    const testContent = {
        title: uuidv4(),
        description: uuidv4(),
        url: `https://example.com/${uuidv4}`,
        meta: {
            [uuidv4()]: uuidv4(),
            [uuidv4()]: uuidv4(),
            [uuidv4()]: uuidv4(),
        }
    };

    before(async () =>
    {
        authInfo = await loginRoot();

        pid = await SardineFish.API.Gallery.post.auth(authInfo.session_id, authInfo.token)({}, testContent);
        assert(pid > 0);
    });

    it("Get List", async () =>
    {
        const list = await SardineFish.API.Gallery.getList({ from: 0, count: 1 });
        assert(list instanceof Array);
        assert(list.length > 0);
        assert.equal(list[0].pid, pid);
        assert.deepEqual(list[0].content, testContent);
        assert.equal(list[0].author.name, RootUserName);
    });

    it("Update exhibit", async () =>
    {
        const oldTitle = testContent.title;
        testContent.title = uuidv4();
        assert.notEqual(oldTitle, testContent.title);
        const result = await SardineFish.API.Gallery.update.auth(authInfo.session_id, authInfo.token)({ pid: pid }, testContent);
        assert.equal(result, pid);
    });

    it("Get exhibit", async () =>
    {
        const fetchContent = await SardineFish.API.Gallery.get({ pid: pid });
        assert.deepEqual(fetchContent.content, testContent);
    });

    it("Delete exhibit", async () =>
    {
        const deleted = await SardineFish.API.Gallery.delete.auth(authInfo.session_id, authInfo.token)({ pid });
        assert(deleted);
        assert.deepEqual(deleted, testContent);
        const nullResult = await SardineFish.API.Gallery.delete.auth(authInfo.session_id, authInfo.token)({ pid });
        assert(nullResult === null);

        await shouldThrowAsync(async () =>
        {
            await SardineFish.API.Gallery.get({ pid: pid })
        });
    });

});