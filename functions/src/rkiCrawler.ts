import * as  puppeteer from 'puppeteer';

export const crawlRKIRiskList = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Risikogebiete_neu.html');
    const [riskList] = await page.$$('#main>.text>ul');

    const countriesList = await riskList
        .$$eval("li", countries =>
            countries.map(country => {
                if (country.children.length === 0) {
                    const text = country?.textContent?.split("(");
                    return {
                        name: text?.[0].trim() ?? '',
                        added: text?.[text.length - 1].replace(")", "").replace("seit ", "") ?? '',
                    }
                } else {
                    return null;
                }
            }).filter(country => country)
        );
    await browser.close();

    return countriesList;
}
