import { api, Validators } from "./api-builder";

export interface RankedScore
{
    name: String,
    score: number,
    time: number,
}

const GameAPI = (baseUrl = "") => ({
    Rank: {
        getRankedScores: api("GET", "/api/rank/{key}")
            .base(baseUrl)
            .path({ key: "string" })
            .query({
                skip: {
                    type: "number",
                    optional: true,
                    validator: Validators.bypass,
                },
                count: {
                    type: "number",
                    optional: true,
                    validator: Validators.bypass,
                }
            })
            .response<RankedScore[]>(),
        postScore: api("POST", "/api/rank/{key}")
            .base(baseUrl)
            .path({ key: "string" })
            .body<{
                name: string,
                score: number,
                data?: any,
            }>()
            .response<number>(),
    },
});

const SardineFish = (window as any).SardineFish || {};
(window as any).SardineFish = {
    ...SardineFish,
    Games: GameAPI
};

declare global
{
    namespace SardineFish
    {
        const Games: typeof GameAPI;
    }
}

export default GameAPI;