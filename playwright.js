const fs = require("fs");
const playwright = require("playwright-core");
const { devices } = require("playwright-core");

async function logToFileAfterAsyncTask(text, filePath) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);

    try {
      const timestamp = new Date().toISOString();
      // Append the log message to the file
      fs.appendFile(filePath, `${timestamp},\t${text}\n`, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      }); // Add newline character for clarity
    } catch (error) {
      reject("failed");
    }
  });
}

function chooseItemFromArrayWithEqualProbability(items) {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

function chooseItemWithProbability(items) {
  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
  const randomValue = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const item of items) {
    cumulativeWeight += item.weight;
    if (randomValue <= cumulativeWeight) {
      return item;
    }
  }

  // If somehow no item was chosen, return the last item
  return items[items.length - 1];
}

function chooseVersionWithProbability(versions) {
  const totalWeight = versions.reduce(
    (acc, version) => acc + version.weight,
    0
  );
  const randomValue = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const version of versions) {
    cumulativeWeight += version.weight;
    if (randomValue <= cumulativeWeight) {
      return version;
    }
  }

  // If somehow no version was chosen, return the last version
  return versions[versions.length - 1];
}

const browsers = [
  {
    browser: "chrome",
    weight: 45,
    versions: [
      { version: 109, weight: 20 },
      { version: 123, weight: 40 },
      { version: 124, weight: 20 },
      { version: 122, weight: 5 },
      { version: 121, weight: 5 },
      { version: 120, weight: 5 },
      { version: 119, weight: 5 },
    ],
  },
  {
    browser: "edge",
    weight: 30,
    versions: [
      { version: 123, weight: 60 },
      { version: 124, weight: 30 },
      { version: 122, weight: 10 },
    ],
  },
  {
    browser: "firefox",
    weight: 15,
    versions: [
      { version: 124, weight: 50 },
      { version: 125, weight: 35 },
      { version: 115, weight: 15 },
    ],
  },
  {
    browser: "safari",
    weight: 5,
    versions: [
      { version: 17.4, weight: 35 },
      { version: 17.3, weight: 35 },
      { version: 16.6, weight: 30 },
    ],
  },
];

const browserItems = {
  safari: ["Desktop Safari", "iPhone 14 Pro", "iPhone 14 Pro Max"],
  chrome: ["Desktop Chrome", "Desktop Chrome HiDPI"],
  firefox: ["Desktop Firefox", "Desktop Firefox HiDPI"],
  edge: ["Desktop Edge", "Desktop Edge"],
};

async function performTest(index) {
  const chosenBrowser = chooseItemWithProbability(browsers);
  const chosenVersion = chooseVersionWithProbability(chosenBrowser.versions);
  const deviceName = chooseItemFromArrayWithEqualProbability(
    browserItems[chosenBrowser.browser]
  );

  let fileName = `${__dirname}/public/my_logs.txt`;

  console.log(
    "Chosen version:",
    chosenBrowser.browser,
    chosenVersion.version,
    deviceName
  );
  try {
    // Choosing a browser

    const browserInstance = {
      chrome: playwright.chromium,
      firefox: playwright.firefox,
      edge: playwright.chromium,
      safari: playwright.webkit,
    };

    const browser = await browserInstance[chosenBrowser.browser].connect({
      wsEndpoint: `wss://cloud.testingbot.com/playwright?key=${process.env.api_key}&secret=${process.env.secret}&browserName=${chosenBrowser.browser}&browserVersion=${chosenVersion.version}`,
    });

    // const browser = await chromium.launch({ headless: false });
    // fileName = "my_logs_temp.txt";

    const context = await browser.newContext(devices[deviceName]);
    context.setDefaultTimeout(3000);
    context.setDefaultNavigationTimeout(3000);
    const page = await context.newPage();

    await page.goto(
      "https://github.com/prasanaworld/puppeteer-screen-recorder/discussions/91"
    );

    await page.locator(`a:text-is("Recall.ai")`).first().click();

    await page
      .locator(`h1:text-is("The universal API for meeting bots")`)
      .first();

    const shouldClickOnDemo = Math.floor(Math.random() * 2);

    if (shouldClickOnDemo === 1) {
      await page.locator(`a.w-button.dark`).last().click();
      await page.waitForTimeout(2000);
    }

    await browser.close();

    await logToFileAfterAsyncTask(
      `Iteration:${index},\tBrowser:${chosenBrowser.browser},\tversion: ${chosenVersion.version},\tDevice Name: ${deviceName},\t success`,
      fileName
    );
  } catch (e) {
    await logToFileAfterAsyncTask(
      `Iteration:${index},\tBrowser:${chosenBrowser.browser},\tversion: ${chosenVersion.version},\tDevice Name: ${deviceName},\t Failed`,
      fileName
    );
    console.log("e", e);
    throw e;
  }
}

module.exports = {
  performTest,
};
