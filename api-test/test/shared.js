import assert from "assert";
import fs from "fs";
import path from "path";
import sardinefish from "sardinefish";

/**@type {{site_url: string}} */
export const config = JSON.parse(fs.readFileSync(path.resolve("../config/config.json")));

SardineFish.API.setBaseUrl(config.site_url);

export const RootUserName = "Root User";

export async function loginRoot()
{
    const uid = "root";
    const challenge = await SardineFish.API.User.getChallenge({ uid });
    return await SardineFish.API.User.login({}, {
        uid,
        pwd_hash: challenge.salt + challenge.challenge,
        session_id: challenge.session_id
    });
}

export async function shouldThrowAsync(fn)
{
    let err = false;
    try
    {
        await fn();
    }
    catch (_)
    {
        err = true;
    }

    assert(err, "Should throw");
}