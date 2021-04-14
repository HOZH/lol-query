const puppeteer = require("puppeteer-extra");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const { JSDOM } = require("jsdom");

puppeteer.use(AdblockerPlugin());

exports.getStats = async (user, region, refresh) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const context = browser.defaultBrowserContext();
    context.overridePermissions(`https://${region}.op.gg`, [
      "geolocation",
      "notifications",
    ]);
    const page = await browser.newPage();
    await page.goto(`https://${region}.op.gg/summoner/userName=${user}`);

    if (refresh === true) {
      await page.click("#SummonerRefreshButton");
      page.on("dialog", async (dialog) => {
        await dialog.accept();
      });
      await page.waitForSelector("div.GameItemList");
      await page.waitForTimeout(5000);
    } else {
    }

    await page.waitForTimeout(1000);
    await page.click("#right_gametype_soloranked");
    await page.waitForTimeout(1000);

    const wins = await page
      .$eval("span.win", (e) => e.innerText)
      .catch(() => {
        return "unraked";
      });
    const loses = await page
      .$eval("span.lose", (e) => e.innerText)
      .catch(() => {
        return "unraked";
      });
    const level = await page.$eval(".Level", (e) => e.innerText);
    const kdaRatio = await page.$eval(
      ".KDARatio",
      (e) => e.firstElementChild.textContent
    );
    const rank = await page.$eval(".TierRank", (e) => e.innerText);
    const pdl = await page
      .$eval(".LeaguePoints", (e) => e.innerText)
      .catch(() => {
        return "Unranked";
      });
    const main = await page
      .$$eval(".PositionStatContent .Name", (e) => e[0].innerHTML)
      .catch(() => {
        return "unraked";
      });
    const mainChampion = await page
      .$$eval(".MostChampionContent .ChampionName", (e) => e[0].innerText)
      .catch(() => {
        return "unraked";
      });
    const winrate = await page
      .$eval("#GameAverageStatsBox-matches div.Text", (e) => e.innerText)
      .catch(() => {
        return "none";
      });
    const lastTime = await page
      .$$eval(".TimeStamp ._timeago", (e) => e[0].innerText)
      .catch(() => {
        return "inactive player";
      });

    const stats = {
      Name: user,
      Level: level,
      RecentWins: wins,
      RecentLoses: loses,
      Rank: rank,
      KDARatio: kdaRatio,
      RankedLP: pdl,
      WinRate: winrate,
      MainLane: main,
      MainChampion: mainChampion,
      LastTimeOnline: lastTime,
    };
    await browser.close();
    return stats;
  } catch (e) {
    console.error(e);
  }
};

exports.getLiveMatch = async (user, region) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const context = browser.defaultBrowserContext();
    context.overridePermissions(`https://${region}.op.gg`, [
      "geolocation",
      "notifications",
    ]);
    const page = await browser.newPage();
    await page.goto(`https://${region}.op.gg/summoner/userName=${user}`);

    await page.waitForTimeout(1000);
    await page.click("dd.inGame");
    await page.waitForTimeout(2000);

    const isNotActive = await page
      .$eval(".SpectatorError", (e) => e.outerHTML)
      .catch(() => {
        return "unraked";
      });

    if (isNotActive != undefined) {
          await browser.close();

      return { error: 1 };
    }
    const team1 = await page
      .$eval("table.Team-100", (e) => e.outerHTML)
      .catch(() => {
        return "unraked";
      });

    const team2 = await page
      .$eval("table.Team-200", (e) => e.outerHTML)
      .catch(() => {
        return "unraked";
      });

    data = {
      teamA: [],
      teamB: [],
      error: 0,
    };

    let document1 = new JSDOM(team1).window.document;

    for (let i = 1; i < 6; i++) {
      let tempRow = {};

      let currentRow = document1.querySelector(
        `tbody>tr:nth-of-type(${JSON.stringify(i)})`
      );

      let championName = currentRow.children[0].children[0].href;
      championName = championName.substring(10, championName.length - 11);
      tempRow["champion"] = championName;

      tempRow["spell1"] = currentRow.children[1].children[0].title;
      tempRow["spell2"] = currentRow.children[1].children[1].title;
      tempRow[
        "tierRank"
      ] = currentRow.children[5].children[0].innerHTML.replace(/\s/g, "");

      tempRow["currentSeasonPlayed"] =
        currentRow.children[6].children[1] === undefined
          ? "-"
          : currentRow.children[6].children[1].innerHTML.replace(/\s/g, "");

      tempRow["winRatio"] =
        currentRow.children[6].children[0] === undefined
          ? "-"
          : currentRow.children[6].children[0].innerHTML;

      tempRow["currentChampionPlayed"] =
        currentRow.children[7].children[0] === undefined
          ? "-"
          : currentRow.children[7].children[0].children[1].innerHTML;

      tempRow["currentChampionWinRatio"] =
        currentRow.children[7].children[0] === undefined
          ? "-"
          : currentRow.children[7].children[0].children[0].innerHTML;

      tempRow["currentChampionKDA"] =
        currentRow.children[8].children[0] === undefined
          ? "-"
          : currentRow.children[8].children[0].children[0].innerHTML;

      data.teamA.push(tempRow);
    }

    let document2 = new JSDOM(team2).window.document;

    for (let i = 1; i < 6; i++) {
      let tempRow = {};

      let currentRow = document2.querySelector(
        `tbody>tr:nth-of-type(${JSON.stringify(i)})`
      );

      let championName = currentRow.children[0].children[0].href;
      championName = championName.substring(10, championName.length - 11);
      tempRow["champion"] = championName;

      tempRow["spell1"] = currentRow.children[1].children[0].title;
      tempRow["spell2"] = currentRow.children[1].children[1].title;
      tempRow[
        "tierRank"
      ] = currentRow.children[5].children[0].innerHTML.replace(/\s/g, "");

      tempRow["currentSeasonPlayed"] =
        currentRow.children[6].children[1] === undefined
          ? "-"
          : currentRow.children[6].children[1].innerHTML.replace(/\s/g, "");

      tempRow["winRatio"] =
        currentRow.children[6].children[0] === undefined
          ? "-"
          : currentRow.children[6].children[0].innerHTML;

      tempRow["currentChampionPlayed"] =
        currentRow.children[7].children[0] === undefined
          ? "-"
          : currentRow.children[7].children[0].children[1].innerHTML;

      tempRow["currentChampionWinRatio"] =
        currentRow.children[7].children[0] === undefined
          ? "-"
          : currentRow.children[7].children[0].children[0].innerHTML;

      tempRow["currentChampionKDA"] =
        currentRow.children[8].children[0] === undefined
          ? "-"
          : currentRow.children[8].children[0].children[0].innerHTML;

      data.teamB.push(tempRow);
    }

    await browser.close();
    return data;
  } catch (e) {
    console.error(e);
  }
};
