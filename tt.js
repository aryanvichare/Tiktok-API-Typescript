import TikTokAPI, { getRequestParams } from "tiktok-api";
import { chromium, devices } from "playwright-chromium";

const iPhone11 = devices["iPhone 11 Pro"];

class Signer {
  userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36";
  args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-infobars",
    "--window-position=0,0",
    "--ignore-certifcate-errors",
    "--ignore-certifcate-errors-spki-list",
  ];

  constructor(userAgent, tac, browser) {
    if (userAgent) {
      this.userAgent = userAgent;
    }

    if (tac) {
      this.tac = tac;
    }

    if (browser) {
      this.browser = browser;
      this.isExternalBrowser = true;
    }

    this.args.push(`--user-agent="${this.userAgent}"`);

    this.options = {
      args: [],
      ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"],
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch(this.options);
    }

    let emulateTemplate = { ...iPhone11 };
    emulateTemplate.viewport.width = getRandomInt(320, 1920);
    emulateTemplate.viewport.height = getRandomInt(320, 1920);

    this.context = await this.browser.newContext({
      ...emulateTemplate,
      deviceScaleFactor: getRandomInt(1, 3),
      isMobile: Math.random() > 0.5,
      hasTouch: Math.random() > 0.5,
      userAgent: this.userAgent,
    });

    this.page = await this.context.newPage();
    await this.page.goto("https://www.tiktok.com/@salkhanacademy?lang=en", {
      waitUntil: "load",
    });
    // Uncomment the following line for unwanted audio
    // await this.page.click(".swiper-wrapper");

    if (this.tac) {
      await this.page.evaluate((x) => {
        window.tac = x;
      }, this.tac);
    }

    await this.page.evaluate(() => {
      if (typeof window.byted_acrawler.sign !== "function") {
        throw "No function found";
      }

      window.generateSignature = function generateSignature(
        url,
        verifyFp = null
      ) {
        let newUrl = url;
        if (verifyFp) {
          newUrl = newUrl + "&verifyFp=" + verifyFp;
        }
        return window.byted_acrawler.sign({ url: newUrl });
      };
    }, this.tac);

    return this;
  }

  async sign(str) {
    let verifyFp = await this.getVerifyFp();
    let res = await this.page.evaluate(
      `generateSignature("${str}", "${verifyFp}")`
    );
    return res;
  }

  async getVerifyFp() {
    var content = await this.context.cookies();
    for (let cookie of content) {
      if (cookie.name == "s_v_web_id") {
        return cookie.value;
      }
    }
    return null;
  }

  async getCookies() {
    return this.page.evaluate("document.cookie;");
  }

  async close() {
    if (this.browser && !this.isExternalBrowser) {
      await this.browser.close();
      this.browser = null;
    }
    if (this.page) {
      this.page = null;
    }
  }
}

function getRandomInt(a, b) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const diff = max - min + 1;
  return min + Math.floor(Math.random() * Math.floor(diff));
}

const init = async () => {
  const signer = new Signer(); // Create new signer
  await signer.init(); // Create page with. Returns promise
  // Required - a method that signs the URL with anti-spam parameters
  // You must provide an implementation yourself to successfully make
  // most requests with this library.
  const signURL = async (url, ts, deviceId) => {
    const r = await signer.sign(url);
    const fp = await signer.getVerifyFp();
    const newUrl = url + "&verifyFp=" + fp + "&_signature=" + r;
    console.log("before" + url + "; after " + newUrl);
    return newUrl;
  };
  await signURL("test").then((r) => console.log("ben" + r + ";;;ff"));
  const api = new TikTokAPI({}, { signURL });
  const r = await api.searchUsers({ keyword: "test" });
  console.log(r.data.user_list);
  await signer.close(); // Close browser. Returns promise
};

init();
