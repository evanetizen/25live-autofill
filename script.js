import puppeteer from "puppeteer-core";

const chromeExecutable = "/usr/bin/google-chrome-stable"; // find chrome on your computer and paste the path.
const phoneNumber = "7033623105"; // leave a phone number for school to call back about reservation inquiries.
const roomSearchQuery = "SRC MULTI-PURPOSE"; // make sure this search query encompasses the two rooms you want to book.
const roomText1 = "SRC MULTI-PURPOSE ROOM 1"; // make sure the spacing is precise here. the script uses an exact match to find the reserve button
const roomText2 = "SRC MULTI-PURPOSE ROOM 2";
const startDate = "2025-01-02";
const endDate = "2025-05-09"; // this should be the last day of the semester, typically they don't allow reservations after

// Hopefully, you shouldn't need to edit past this point!

function monthDiff(startDate, endDate) {
  let startMonth = Number(startDate.slice(5, 7));
  let endMonth = Number(endDate.slice(5, 7));

  if (endMonth >= startMonth) {
    return endMonth - startMonth;
  } else {
    return 12 - startMonth + endMonth;
  }
}

function isValidTimePattern(str) {
  // Regular expression pattern
  const pattern = /^(1|2|3|4|5|6|7|8|9|10|11|12):([0-5][0-9])$/;
  // Test the string against the pattern
  return pattern.test(str);
}

if (process.argv.length !== 5) {
  console.log(
    "This program expects 3 arguments! days to repeat, start time, end time",
  );
  process.exit(1);
}

const repeatDays = process.argv[2];
let repeatDict = {
  Sun: false,
  Mon: false,
  Tue: false,
  Wed: false,
  Thu: false,
  Fri: false,
  Sat: false,
};
// Use a regular expression to match valid day abbreviations
const regex = /(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/g;
const matches = repeatDays.match(regex);
if (!matches) {
  console.error("Date string contains no valid day abbreviations");
  process.exit(1);
}
// Check for unrecognized characters or sequences
const recognizedString = matches.join("");
if (recognizedString.length !== repeatDays.length) {
  console.error(
    "Date string contains unrecognized characters or invalid sequences",
  );
  process.exit(1);
}
matches.forEach((day) => {
  repeatDict[day] = true;
});

if (!isValidTimePattern(process.argv[3])) {
  console.error("First time format is wrong! e.g. 8:00 or 2:00.");
  process.exit(1);
}

if (!isValidTimePattern(process.argv[4])) {
  console.error("Second time format is wrong! e.g. 8:00 or 2:00.");
  process.exit(1);
}

const startTime = process.argv[3] + " pm";
const endTime = process.argv[4] + " pm";
const today = new Date().toJSON().slice(0, 10);

console.log("---------------");
console.log(`Searching for availability in ${roomText1} and ${roomText2}`);
console.log(
  `on ${Object.keys(repeatDict).filter((day) => repeatDict[day])} from ${startTime} to ${endTime}`,
);
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

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
for (const day of daysOfWeek) {
  const isChecked = await page.$eval(
    `.modal-content [data-label-id="${day}"] input`,
    (box) => box.checked,
  );

  if (isChecked !== repeatDict[day]) {
    await page.locator(`.modal-content [data-label-id="${day}"] label`).click();
  }
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
  "\x1b[32m%s\x1b[0m",
  "Finished booking! You should be good to hit save in the bottom right.",
);
console.log(
  "Once it's saved, you can press CTRL C in this terminal to finish.",
);
