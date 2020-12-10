import React, { RefObject } from "react";
import ReactDOM from "react-dom";
import { RoseChart, ChartData, DeferSection, Banner, DeferElement, LifeTimer, Age, BarChart, TextCloud, FriendLink, CommentSystem } from "./component";
import { languageSkillsData, summaryData, toolsData, toolsChartPalette, gameData, friendsData } from "./data";
import { GithubLogo, SteamLogo, EmailIcon, IconAdd, IconArrowUp } from "./icon";
import { animate } from "./lib";

class App extends React.Component
{
    render()
    {
        return (
            <div>
                <section id="banner">
                    <nav id="nav-bar">
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/blog/">Blog</a></li>
                            <li><a href="/note/">Note</a></li>
                            <li><a href="/lab/">Lab</a></li>
                            <li><a href="//github.com/SardineFish">GitHub</a></li>
                            <li><a href="/about/">About</a></li>
                        </ul>
                    </nav>
                    <Banner></Banner>
                </section>
                <DeferSection className="section text-light" id="summary" header="Summary">
                    <RoseChart className="chart" id="summary-chart" width={1200} height={800} data={summaryData} maxValue={1} style="ring"></RoseChart>
                    <DeferElement className="summary-text" visibleHeight={innerHeight / 5}>
                        <p style={{fontSize:"1.6em"}}>SardineFish</p>
                    </DeferElement>
                    <DeferElement className="summary-text" visibleHeight={innerHeight / 5}>
                        <p>一个语言表达能力极差，不善于社交的人</p>
                        <p className="weak">语文是什么，能吃么？？？</p>
                    </DeferElement>
                    <DeferElement className="summary-text" visibleHeight={innerHeight / 5}>
                        <p>17岁<sub>+{<LifeTimer />}s</sub>JK<del className="line"></del></p>
                        <p className="weak"><Age/>岁，是学生</p>
                    </DeferElement>
                    <DeferElement className="summary-text" visibleHeight={innerHeight / 5}>
                        <p>不是女装dalao，没有女装，不会女装的</p>
                        <p className="weak">我不是，我没有，我不会</p>
                    </DeferElement>
                </DeferSection>
                <DeferSection className="section" id="skills" header="Skills">
                    <div id="skill-language" className="hor-split">
                        <BarChart id="skills-chart" data={languageSkillsData} maxValue={1}></BarChart>
                        <div className="text text-light">
                            <p>因为NOIP而入坑编程</p>
                            <p className="weak">因为太菜了，最后一年以全0成绩从OI毕业</p>
                            <p className="weak">是C#拯救了差点步入VB歧途的<del>少女</del></p>
                            <p className="weak">Native已死，Web是人类的希望</p>
                            <p className="weak">曾经想在Web上做游戏开发</p>
                        </div>
                    </div>
                    <div id="skill-tools" className="hor-split">
                        <div className="text">
                            <p>喜欢各种技术相关的事情和有趣的事情</p>
                            <p className="weak">喜欢画画，因为没有天赋和时间而放弃</p>
                            <p className="weak">想做3D，因为没有美术基础和时间而放弃</p>
                            <p className="weak">想学音乐，因为五音不全和手残而放弃</p>
                        </div>
                        <BarChart id="tools-chart" data={toolsData} maxValue={1} palette={toolsChartPalette}></BarChart>
                    </div>
                </DeferSection>
                <DeferSection className="section" id="gaming" header="Gaming">
                    <TextCloud id="game-data" data={gameData} maxSize={60} minSize={12} placeMode="random"></TextCloud>
                    <DeferElement className="text-main text-light" visibleHeight={innerHeight / 4}>
                        <p>宅的时间除了写代码就是玩游戏了</p>
                        <p className="weak">或者一边玩自己做的游戏一边写BUG</p>
                        <p>游戏涉猎不广，遇到好玩的游戏会一直玩</p>
                        <p className="weak">因为穷和没时间</p>
                        <p>喜欢单人剧<sub>(养)</sub>情<sub>(老)</sub>向 FPS / TPS / ACT</p>
                        <p className="weak">太菜了只能打Normal的AI _(:з)∠)_</p>
                        <p className="weak">曾经很喜欢红警之类的RTS</p>
                        <p>喜欢和朋友一起玩多人游戏</p>
                        <p className="weak">这里点名表扬全境封锁和 HFF</p>
                        <p>不喜欢竞技类和卡牌类游戏</p>
                        <p className="weak">太菜了玩不出快乐 _(:з)∠)_</p>
                    </DeferElement>
                </DeferSection>
                <DeferSection id="contact">
                    <p className="header">在哪可以找到我</p>
                    <ul id="ext-links">
                        <li>
                            <a href="https://github.com/SardineFish" target="_blank">
                                <GithubLogo></GithubLogo>
                            </a>
                        </li>
                        <li id="osu">
                            <a href="https://osu.ppy.sh/users/11342845" target="_blank">
                                <img src="/img/decoration/Osu-240.png" alt="osu-logo" />
                            </a>
                        </li>
                        <li>
                            <a href="https://steamcommunity.com/id/sardineeefish/" target="_blank">
                                <SteamLogo></SteamLogo>
                            </a>
                        </li>
                        <li id="contact-email">
                            <a href="mailto://me@sardinefish.com">
                                <EmailIcon></EmailIcon>
                            </a>
                        </li>
                    </ul>
                    <div className="text-main">
                        <p>欢迎勾搭</p>
                    </div>
                </DeferSection>
                <DeferSection id="friends" className="section" header="Friends">
                    <div className="layout-wrapper">
                        <div className="wrapper">
                            {friendsData.map((friend, idx) => (<FriendLink data={friend} key={idx}></FriendLink>))}
                            <div className="friend-link">
                                <a className="friend-add" href="#comment-area">
                                    <IconAdd></IconAdd>
                                </a>
                                <div className="friend-data">
                                    <a className="friend-name" href="#comment-area">这里缺个人</a>
                                    <span className="friend-note">快来勾搭我认识你哇 (。・∀・)ノ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </DeferSection>
                <section className="section" id="comment-area">
                    <div className="decoration">
                        <div className="triangle"></div>
                    </div>
                    <header className="header">Comment</header>
                    <main className="content-wrapper">
                        <CommentSystem pageID={1}/>
                    </main>
                </section>
                <footer id="footer">
                    <p className="copyright">Copyright © 2015-2019 SardineFish, All Rights Reserved</p>
                    <p className="powered-by">Designed {'&'} Powered by SardineFish</p>
                </footer>
                <div className="to-top">
                    <IconArrowUp/>
                </div>
            </div>
        )
    }
}
window.addEventListener("load", () =>
{
    const nav = /#?(.*)/.exec(window.location.hash)[1];
    
    const element = (<App></App>);
    const root = document.querySelector("#root");
    root.innerHTML = "";
    ReactDOM.render(element, document.querySelector("#root"));

    setTimeout(() =>
    {
        if (!nav)
            return;
        let element = document.querySelector(`#${nav}`);
        if (!element)
            return;
        animate(2, (t) =>
        {
            let rest = element.getBoundingClientRect().top;
            window.scrollBy(0, 0.15 * rest);
        })
    }, 500);
})







