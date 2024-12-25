import puppeteer from "puppeteer-core";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome-stable",
    userDataDir: "./session-data",
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

  await page
    .locator('#ngEventFormItem-8 input[aria-label="datetime input"]')
    .click();

  await page
    .locator(`.qtip-content button[aria-label^='\"2025-01-0']::-p-text(02)`)
    .click();

  await page
    .locator('#ngEventFormItem-8 input[aria-label="Start Time"]')
    .fill("6:00 pm");
  await page.keyboard.press("Tab");
  await page
    .locator('#ngEventFormItem-8 input[aria-label="End Time"]')
    .fill("7:00 pm");
  await page.locator(".patternButton").click();
  await page.select('select:has(option[label="Weekly"][value="2"])', "2");
  await page.locator('.modal-open [aria-label="datetime input"]').click();

  const nextButton = page.locator(
    ".modal-open .qtip-content i.b-datepicker-button-next",
  );

  await nextButton.click();
  await nextButton.click();
  await nextButton.click();
  await nextButton.click();
  await nextButton.click();

  await page
    .locator(`.modal-open .qtip-content [aria-label^='\"2025-05-11']`)
    .click();

  const tueIsChecked = await page.$eval(
    '.modal-content [data-label-id="Tue"] input',
    (box) => box.checked,
  );
  const thuIsChecked = await page.$eval(
    '.modal-content [data-label-id="Thu"] input',
    (box) => box.checked,
  );

  if (!tueIsChecked) {
    await page.locator('.modal-content [data-label-id="Tue"] label').click();
  }
  if (!thuIsChecked) {
    await page.locator('.modal-content [data-label-id="Thu"] label').click();
  }
  await page.locator(".modal-footer ::-p-text(Select Pattern)").click();

  // view the occurrences to give time for all of them to load before you search locations.
  await page.locator("#viewAllOccs").click();
  await page.waitForSelector("table");
  await page
    .locator(".modal-open .modal-footer button::-p-text(Close)")
    .click();
  await page
    .locator('textarea[aria-label="Search Locations"]')
    .fill("AFC MULTI-PURPOSE");

  await page.locator(".seriesQLSearch-btn button ::-p-text(Search)").click();

  const roomText = "AFC MULTI-PURPOSE ROOM 2";

  try {
    const reserveButton = await Promise.race([
      page.waitForSelector(
        `button[aria-label="Reserve Available ${roomText}"]`,
        { timeout: 10000 },
      ),
      page.waitForSelector(`button[aria-label="Reserve ${roomText}"]`, {
        timeout: 10000,
      }),
    ]);

    if (reserveButton) {
      await reserveButton.click();
    }
  } catch (error) {
    console.log("neither button appeared.");
  }

  // answer the bottom section
  await page.waitForSelector(
    '[aria-label="Phone Number and Additional Information"] .toggle-wrapper label::-p-text(No)',
  );
  const toggles = await page.$$(
    '[aria-label="Phone Number and Additional Information"] .toggle-wrapper label::-p-text(No)',
  );

  for (const toggle of toggles) {
    await toggle.click();
  }
  await page
    .locator(
      '#ngEventFormItem-15 input[type="text"]::-p-aria(Phone Number for primary event contact)',
    )
    .fill("7033623105");
  const textAreas = await page.$$("#ngEventFormItem-15 .editable-click");
  await textAreas[0].click();
  await textAreas[0].type(
    "The Virginia wushu club prepares for performances and competition.",
  );
  await textAreas[1].click();
  await textAreas[1].type("n/a");
  await page.locator('[aria-label="Affirmation, Required"] label').click();

  // delete all instances without a location.
  // the form doesn't let you submit if you have times without a location.
  await page.locator("#viewAllOccs").click();
  await page
    .locator(".ngDateOccTable button::-p-text(Include Only Missing Locations)")
    .click();
  await page.waitForSelector(".ngDateOccTable tbody"); // wait for table to reload
  await page.locator(".ngDateOccTable button::-p-text(View Included)").click();
  await page.waitForSelector(".ngDateOccTable tbody"); // wait for table to reload
  await page.waitForSelector(".ngDateOccTable button::-p-text(View All)");

  while (await page.$(".ngDateOccTable button.aw-button--danger--outline")) {
    await page
      .locator(".ngDateOccTable button.aw-button--danger--outline")
      .click();
  }
})();
