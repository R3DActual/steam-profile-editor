const fs = require('fs');
const {
    execSync
} = require('child_process');
const path = require('path');
const SteamCommunity = require('steamcommunity');
const ReadLine = require('readline');
const {
    faker
} = require('@faker-js/faker');
const chalk = require('chalk');
const community = new SteamCommunity();
const randomQuotes = require('random-quotes');


execSync(`powershell -command "& {[Console]::Title='R3Ds Steam Profile Spoofer'}"`, {
    stdio: 'inherit'
});

const rl = ReadLine.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const configPath = process.cwd() + '/config.json';

function loadConfig() {
    try {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configContent);
    } catch (error) {

        // Make sure to return a default config object or an empty object based on your use case
        return {};
    }
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// Load config or create a new one if it doesn't exist
let config = loadConfig();

if (!config.accountName || !config.password || !fs.existsSync(configPath)) {
    // Set default
    config = {
        accountName: 'your__account_name',
        password: 'your__password',
        intervalSeconds: 15
    };
    console.clear();
    // Save the config to the file
    saveConfig(config);
    console.log(chalk.cyan('No config file found, created a new one. Please edit the config file and run the program again.'));
    rl.question(chalk.yellow("Press any key to close..."), function() {
        process.exit();
    });
    return;
}

function generateRandomProfile() {
    const userid = faker.string.numeric(17);
    const username = faker.internet.userName();
    const avatar = faker.image.urlLoremFlickr({
        category: 'people'
    });
    const realname = faker.person.firstName() + ' ' + faker.person.lastName();

    return {
        userId: userid,
        username: username,
        avatar: avatar,
        realName: realname,
    };
}

doLogin(config.accountName, config.password);

async function doLogin(accountName, password, authCode, captcha) {
    const currentDate = new Date();

    if (!accountName || !password) {
        console.clear();
        console.error(chalk.red('Error: Account name or password is missing.'));
        rl.question(chalk.yellow("Press any key to close..."), function() {
            process.exit();
        });
    }

    await community.login({
        accountName: accountName,
        password: password,
        authCode: authCode,
        captcha: captcha,
    }, async function(err, sessionID, cookies, steamguard) {
        if (err) {
            console.clear();
            if (err.message == 'SteamGuard') {
                console.log(chalk.yellow("An email has been sent to your address at " + err.emaildomain));
                rl.question(chalk.cyan("Steam Guard Code: "), async function(code) {
                    await doLogin(accountName, password, code);
                });
                return;
            }
            if (err.message == 'CAPTCHA') {
                console.log(chalk.yellow(err.captchaurl));
                rl.question(chalk.cyan("CAPTCHA: "), async function(captchaInput) {
                    await doLogin(accountName, password, null, captchaInput);
                });
                return;
            }

            if (err.message == 'SteamGuardMobile') {
                console.log(chalk.yellow("Check Steam app for Steam Guard code"));
                rl.question(chalk.cyan("Steam Guard Code: "), async function(code) {
                    await doLogin(accountName, password, code);
                });
                return;
            }

            if (err.message == 'RateLimitExceeded') {
                console.log(chalk.red("Rate limit exceeded, please try again later."));
                rl.question(chalk.yellow("Press any key to close..."), function() {
                    process.exit();
                });
                return;
            }

            if (err.message == 'InvalidPassword') {
                console.log(chalk.red("Invalid username or password."));
                rl.question(chalk.yellow("Press any key to close..."), function() {
                    process.exit();
                });
                return;
            }

            console.log(chalk.red(err));
            rl.question(chalk.yellow("Press any key to close..."), function() {
                process.exit();
            });
            return;
        }
        console.clear();
        console.log(`[${currentDate.toLocaleString()}] ` + chalk.green(`Logged in as ${accountName}!`));
        console.log(`[${currentDate.toLocaleString()}] ` + chalk.green(`Session ID: ${sessionID}`));
        setTimeout(() => {
            console.clear();
        }, config.intervalSeconds * 1000 - 1000);
        // Run the editProfile function every X seconds
        setInterval(() => {
            editProfile();
        }, config.intervalSeconds * 1000);
    });
}

async function editProfile() {
    try {
        const currentDate = new Date();
        // Set your new Steam profile status
        const {
            username,
            realName,
            userId,
            avatar
        } = generateRandomProfile();
        await community.uploadAvatar(avatar);


        await community.editProfile({
            name: username,
            realName: realName,
            customURL: userId,
            summary: randomQuotes.default().body + "\n-" + randomQuotes.default().author,
        }).catch((err) => 
        {
            console.error(chalk.red('Error editing profile:'), chalk.red(err));
        });

        await community.clearPersonaNameHistory();
        // Display time and date
        console.log(`[${currentDate.toLocaleString()}] ` + chalk.green(`Updated profile with new username, real name, avatar, vanity/custom url, summary and clear username history!`));
    } catch (err) {
        console.error(chalk.red('Error editing profile:'), chalk.red(err));
    }
}