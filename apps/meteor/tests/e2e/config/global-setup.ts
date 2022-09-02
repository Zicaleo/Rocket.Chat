/* eslint no-await-in-loop: 0 */

import { chromium } from '@playwright/test';

import * as constants from './constants';
import injectInitialData from '../fixtures/inject-initial-data';

const loginProcedure = async (credentials: { username: string; password: string }) => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto(constants.BASE_URL);

	await page.locator('[name=username]').type(credentials.username);
	await page.locator('[name=password]').type(credentials.password);
	await page.locator('role=button >> text="Login"').click();

	await page.waitForSelector('[data-qa-id="home-header"]');
	await page.context().storageState({ path: `${credentials.username}-session.json` });

	await browser.close();
};

export default async function (): Promise<void> {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto(constants.BASE_URL);

	if (page.url().includes('setup-wizard')) {
		await page.locator('[name="organizationName"]').type('any_name');
		await page.locator('[name="organizationType"]').click();
		await page.locator('.rcx-options .rcx-option:first-child >> text="Community"').click();
		await page.locator('[name="organizationIndustry"]').click();
		await page.locator('.rcx-options .rcx-option:first-child >> text="Aerospace & Defense"').click();
		await page.locator('[name="organizationSize"]').click();
		await page.locator('.rcx-options .rcx-option:first-child >> text="1-10 people"').click();
		await page.locator('[name="country"]').click();
		await page.locator('.rcx-options .rcx-option:first-child >> text="Afghanistan"').click();
		await page.locator('.rcx-button--primary.rcx-button >> text="Next"').click();
		await page.locator('a.rcx-box.rcx-box--full >> text="Continue as standalone"').click();
		await page.locator('.rcx-button--primary.rcx-button >> text="Confirm"').click();
	}

	await browser.close();

	await loginProcedure({
		username: constants.ADMIN_CREDENTIALS.email,
		password: constants.ADMIN_CREDENTIALS.password,
	});

	const { usersFixtures } = await injectInitialData();

	for (const user of usersFixtures) {
		await loginProcedure({
			username: user.username,
			password: 'any_password',
		});
	}
}
