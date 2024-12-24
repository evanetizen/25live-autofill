import puppeteer from "puppeteer-core";
(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome-stable",
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(0);
  await page.goto("https://25live.collegenet.com/pro/virginia#!/home/dash");

  await page.waitForSelector(".eventFormMessage");
  await page.locator("#ngEventFormItem-1").fill("Virginia Wushu Club Practice");

  await page.locator('[aria-label="Event Type, Required"] a').click();
  await page
    .locator('[aria-label="Event Type, Required"] ::-p-text(CIO Club Sport)')
    .click();

  await page
    .locator(
      '[aria-label="Primary Organization for this Event, Required Search organizations"] a',
    )
    .click();

  await page
    .locator(
      '[aria-label="Primary Organization for this Event, Required Search organizations"] input',
    )
    .fill("VIRGINIA WUSHU CLUB");

  await page
    .locator(
      '[aria-label="Primary Organization for this Event, Required Search organizations"] choice ::-p-text(VIRGINIA WUSHU CLUB)',
    )
    .click();

  await page
    .locator('input[aria-label="Expected Head Count, Required"]')
    .fill("25");

  const iframeHandle = await page.locator("iframe").waitHandle();
  const iframe = await iframeHandle.contentFrame();
  await iframe.waitForSelector('body[contenteditable="true"]');
  await iframe.evaluate(() => {
    const editableBody = document.querySelector('body[contenteditable="true"]');
    editableBody.innerHTML =
      "Virginia Wushu Club practices for competition and performances.";
  });

  await page.locator('input[aria-label="datetime input"]').click();
  await page.locator(`.qtip-content [aria-label^='\"2024-12-26']`).click();

  await page
    .locator('input[aria-label="Start Time"]')
    .click({ count: 3 })
    .fill("8:00 pm");
  await page
    .locator('input[aria-label="End Time]')
    .click({ count: 3 })
    .fill("10:00 pm");

  await page.locator(".patternButton").click();
  await page
    .locator('select:has(option[label="Weekly"])')
    .select('select:has(option[label="Weekly"][value="2")', "2");

  page
    .locator('[data-label-id="Tue"] input')
    .filter((checkbox) => checkbox.classList.contains("ng-empty"))
    .click();

  page
    .locator('[data-label-id="Thu"] input')
    .filter((checkbox) => checkbox.classList.contains("ng-empty"))
    .click();

  await page.locator('.modal-open [aria-label="datetime input"]').click();

  let selectedMonth = await page
    .locator(".modal-open .qtip-content .h-col-title")
    .map((titleDiv) => titleDiv.textContent)
    .wait();

  console.log(selectedMonth);

  await page
    .locator(`.modal-open .qtip-content [aria-label^='\"2024-12-26']`)
    .click();
})();
