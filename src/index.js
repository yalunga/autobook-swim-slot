const cron = require('node-cron');
const puppeteer = require('puppeteer');
const cliSelect = require('cli-select');


const dayNumberToStringArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const timeslotsMondayToThursday = [
  'Lap Swim 5am',
  'Lap Swim 6am',
  'Lap Swim 7am',
  'Lap Swim 8am',
  'Lap Swim 9am',
  'Lap Swim 10-11:25am',
  'Lap Swim 2pm',
  'Olympic Pool Lap Swim 3pm',
  'Recreation Pool Lap Swim 3-4:25pm',
  'Olympic Pool Lap Swim 7pm'
];

const timeslotsFriday = [
  'Lap Swim 5am',
  'Lap Swim 6am',
  'Lap Swim 7am',
  'Lap Swim 8am',
  'Lap Swim 9am',
  'Lap Swim 10-11:25am',
  'Lap Swim 12pm',
  'Lap Swim 1pm',
  'Lap Swim 2pm',
  'Olympic Pool Lap Swim 3pm'
];

const timeslotsSaturday = [
  'Lap Swim 6am',
  'Lap Swim 7am',
  'Lap Swim 8am',
  'Olympic Pool Lap Swim 9am',
  'Olympic Pool Lap Swim 10am',
  'Olympic Pool Lap Swim 11am',
  'Olympic Pool Lap Swim 12pm',
  'Lap Swim 1pm',
  'Lap Swim 2pm',
  'Lap Swim 3pm',
];

const timeslotsSunday = [
  'Lap Swim 12pm',
  'Lap Swim 1pm',
  'Lap Swim 2pm',
  'Lap Swim 3pm',
];

const timeslotsByDay = [
  timeslotsSunday,
  timeslotsMondayToThursday,
  timeslotsMondayToThursday,
  timeslotsMondayToThursday,
  timeslotsMondayToThursday,
  timeslotsFriday,
  timeslotsSaturday
];

const runFunction = async () => {
  const today = new Date();
  const reserveDay = today.getDay() + 2;

  console.log(`Reserve a lap swim lane for ${dayNumberToStringArray[reserveDay + 1]}`);

  const { value: timeslot } = await cliSelect({
    values: timeslotsByDay[reserveDay]
  });

  console.log(`Attempting to reserve ${timeslot} for ${dayNumberToStringArray[reserveDay + 1]}`);


  const browser = await puppeteer.launch({ headless: false });
  const [page] = await browser.pages();
  await page.goto('https://secure.rec1.com/AZ/oro-valley-az/catalog');
  const loginButton = await page.$('.rec1-login-trigger');
  await loginButton.click();
  await page.$eval('#login-username', el => el.value = 'email');
  await page.$eval('#login-password', el => {
    el.value = 'password';
    el.blur
  });
  const password = await page.$('#login-password');
  await password.focus();
  await page.keyboard.press('Enter');

  await page.waitForNavigation({
    waitUntil: 'networkidle0',
  });

  const elements = await page.$$('.rec1-catalog-group-name');


  for (const element of elements) {
    const textJson = await element.getProperty('textContent');
    const text = await textJson.jsonValue();

    if (text.includes(`Lap Lanes ${dayNumberToStringArray[reserveDay]}`)) {
      await element.click();
      break;
    }
  }

  try {
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
  } catch (e) {

  }

  const timeElements = await page.$$('.has-details');
  for (const element of timeElements) {
    const textJson = await element.getProperty('textContent');
    const text = await textJson.jsonValue();

    if (text.includes(timeslot)) {
      await element.click();
      break;
    }
  }

  try {
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
  } catch (e) { }

  const checkbox = await page.$('.checkable');
  await checkbox.click();

  const checkoutButton = await page.$('.rec1-catalog-item-action')
  await checkoutButton.click();

  try {
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
  } catch (e) { }

  const checkoutIcon = await page.$('.flaticon-cart-checkout');
  await checkoutIcon.click();

  try {
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
  } catch (e) { }

  // await browser.close();
};

// runFunction();

cron.schedule('1 5 * * *', runFunction);
