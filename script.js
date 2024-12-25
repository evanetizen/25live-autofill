import puppeteer from "puppeteer-core";

const chromeExecutable = "/usr/bin/google-chrome-stable"; // find chrome on your computer and paste the path.
const phoneNumber = "7033623105"; // leave a phone number for school to call back about reservation inquiries.
const roomSearchQuery = "SRC MULTI-PURPOSE"; // make sure this search query encompasses the two rooms you want to book.
const roomText1 = "SRC MULTI-PURPOSE ROOM 1";
const roomText2 = "SRC MULTI-PURPOSE ROOM 2";
const startDate = "2025-01-14"; // make sure this is either a Tuesday or Thursday.
const endDate = "2025-05-09"; // this should be the last day of the semester, typically they don't allow reservations after

let startTime = "8:00 pm"; // this is the default start time, can be changed with command line argument.
let endTime = "10:00 pm"; // this is the default end time, can be changed with command line argument.

// Hopefully, you shouldn't need to edit past this point!

const dateCheck = new Date(startDate);
if (!(dateCheck.getUTCDay() === 2 || dateCheck.getUTCDay() === 4)) {
  console.log("The start day is not a Tuesday or Thursday.");
  console.log(
    "This program only works to book days repeating on Tuesday and Thursday!",
  );
  process.exit(1);
}

if (!(process.argv.length === 2 || process.argv.length === 4)) {
  console.log("This program expects either no arguments or 2!");
  process.exit(1);
}
if (process.argv.length === 4) {
  if (!isValidTimePattern(process.argv[2])) {
    console.log("First time format is wrong! e.g. 8:00 or 2:00.");
    process.exit(1);
  }
  if (!isValidTimePattern(process.argv[3])) {
    console.log("Second time format is wrong! e.g. 8:00 or 2:00.");
    process.exit(1);
  }
  startTime = process.argv[2] + " pm";
  endTime = process.argv[3] + " pm";
}

function isValidTimePattern(str) {
  // Regular expression pattern
  const pattern = /^(1|2|3|4|5|6|7|8|9|10|11|12):([0-5][0-9])$/;
  // Test the string against the pattern
  return pattern.test(str);
}

function monthDiff(startDate, endDate) {
  let startMonth = Number(startDate.slice(5, 7));
  let endMonth = Number(endDate.slice(5, 7));

  if (endMonth >= startMonth) {
    return endMonth - startMonth;
  } else {
    return 12 - startMonth + endMonth;
  }
}

const today = new Date().toJSON().slice(0, 10);
console.log("---------------");
console.log(`Searching for availability in ${roomText1} and ${roomText2}`);
console.log(`from ${startTime} to ${endTime}`);
console.log("---------------");
// Launch the browser and open a new blank page
const browser = await puppeteer.launch({
  executablePath: chromeExecutable,
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
const editableBody = await iframe.waitForSelector(
  'body[contenteditable="true"]',
);
await editableBody.focus();
await editableBody.type(
  "The Virginia Wushu Club prepares for competition and performances.",
);

// Selecting time and repeating pattern
await page
  .locator('#ngEventFormItem-8 input[aria-label="datetime input"]')
  .click();

const nextMonthButton = await page.locator(
  ".qtip-content i.b-datepicker-button-next",
);
//for some reason, you need to click once more than expected. Dunno why this happens.
for (let i = 0; i <= monthDiff(today, startDate); i++) {
  await nextMonthButton.click();
}

await page
  .locator(
    `.qtip-content button[aria-label^='\"${startDate.slice(0, 8)}']::-p-text(${startDate.slice(8, 10)})`,
  )
  .click();

await page
  .locator('#ngEventFormItem-8 input[aria-label="Start Time"]')
  .fill(startTime);
await page.keyboard.press("Tab");
await page
  .locator('#ngEventFormItem-8 input[aria-label="End Time"]')
  .fill(endTime);
await page.locator(".patternButton").click();
await page.select('select:has(option[label="Weekly"][value="2"])', "2");
await page.locator('.modal-open [aria-label="datetime input"]').click();

const nextMonthButtonEnd = await page.locator(
  ".modal-open .qtip-content i.b-datepicker-button-next",
);
// for some reason, you need to click one more time than expected. Dunno why.
for (let i = 0; i <= monthDiff(startDate, endDate); i++) {
  await nextMonthButtonEnd.click();
}

await page
  .locator(
    `.modal-open .qtip-content [aria-label^='\"${endDate}']::-p-text(${endDate.slice(8, 10)})`,
  )
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
await page.locator(".modal-open .modal-footer button::-p-text(Close)").click();
await page
  .locator('textarea[aria-label="Search Locations"]')
  .fill(roomSearchQuery);

await page.locator(".seriesQLSearch-btn button ::-p-text(Search)").click();

let room1Available = true;
try {
  const reserveButton = await Promise.race([
    page.waitForSelector(
      `button[aria-label="Reserve Available ${roomText1}"]`,
      { timeout: 10000 },
    ),
    page.waitForSelector(`button[aria-label="Reserve ${roomText1}"]`, {
      timeout: 10000,
    }),
  ]);

  if (reserveButton) {
    await reserveButton.click();
  }
} catch (error) {
  room1Available = false;
  console.log(
    `Reserve button for ${roomText1} didn't appear. It may not be available.`,
  );
}

let room2Available = true;
try {
  const reserveButton = await Promise.race([
    page.waitForSelector(
      `button[aria-label="Reserve Available ${roomText2}"]`,
      { timeout: 10000 },
    ),
    page.waitForSelector(`button[aria-label="Reserve ${roomText2}"]`, {
      timeout: 10000,
    }),
  ]);

  if (reserveButton) {
    await reserveButton.click();
  }
} catch (error) {
  room2Available = false;
  console.log(
    `Reserve button for ${roomText2} didn't appear. It may not be available.`,
  );
}

if (!room1Available && !room2Available) {
  console.log(
    "The reserve button wasn't available for either room! Try again with another time maybe.",
  );
  console.log('See the "Conflict Details" button to see what is conflicting');
  console.log("You can hit CTRL C to stop this program and retry.");
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
  .fill(phoneNumber);
const textAreas = await page.$$("#ngEventFormItem-15 .editable-click");
await textAreas[0].click();
await textAreas[0].type(
  "The Virginia Wushu Club prepares for competition and performances.",
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

console.log(
  "Finished booking! You should be good to hit save in the bottom right.",
);
console.log(
  "Once it's saved, you can press CTRL C in this terminal to finish.",
);
