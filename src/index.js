const cron = require('node-cron');
const puppeteer = require('puppeteer');

const dayNumberToStringArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const runFunction = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const [page] = await browser.pages();
  await page.goto('https://secure.rec1.com/AZ/oro-valley-az/catalog');
  const loginButton = await page.$('.rec1-login-trigger');
  await loginButton.click();
  await page.$eval('#login-username', el => el.value = 'yalungp@gmail.com');
  await page.$eval('#login-password', el => {
    el.value = 'Swimteam!1';
    el.blur
  });
  const password = await page.$('#login-password');
  await password.focus();
  await page.keyboard.press('Enter');

  await page.waitForNavigation({
    waitUntil: 'networkidle0',
  });

  const elements = await page.$$('.rec1-catalog-group-name');
  const today = new Date();
  const reserveDay = today.getDay() + 2;

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

    if (text.includes('Lap Swim 10-11:25am')) {
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

cron.schedule('1 5 * * *', runFunction);
