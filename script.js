"use strict"

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { findTimeZone, getZonedTime, listTimeZones, getUnixTime} from 'timezone-support';

const rl = readline.createInterface({ input, output }); 
const timezones = listTimeZones();


let userInput;
displayOptions();

let timezoneObj = {
    targetTimezone: '',
    originTimezone: '',
    year: '',
    month: '',
    day: '',
    hours: '',
    minutes: '',
    addDate(date) {
        let dateArr = date.split("/");
        timezoneObj.day = dateArr[0].length === 2 ? dateArr[0] : `0${dateArr[0]}`;
        timezoneObj.month = dateArr[1].length === 2 ? dateArr[1] : `0${dateArr[1]}`;
        timezoneObj.year = dateArr[2];
    },
    addTime(time) {
        let timeArr = time.split(":");
        timezoneObj.hours = timeArr[0].length === 2 ? timeArr[0] : `0${timeArr[0]}`;
        timezoneObj.minutes = timeArr[1].length === 2 ? timeArr[1] : `0${timeArr[1]}`;
        console.log(this.hours);
        console.log(this.minutes);
    },
    checkData() {
        // check if user entered all necessary data
        let missingData = [];
        for (let key in this) {
            if (!this[key]) {
                missingData.push(key);
            }
        }
        if (missingData.length > 0) {
            console.log(`You are still missing ${missingData.length} items: ` );
            for (let item of missingData) {
                console.log(item);
            }
            return false;
        } else {
        return true;
        }
    },
    convertTimezone() {
        let originTime = { 
            year: this.year,
            month: this.month,
            day: this.day,
            hours: this.hours,
        }
        this.originTimezone = findTimeZone(this.originTimezone);
        this.targetTimezone = findTimeZone(this.targetTimezone);

        // convert origin timezone to unix time, then convert unix time to target timezone
        let unixTime = getUnixTime(originTime, this.originTimezone);
        let targetTime = getZonedTime(unixTime, this.targetTimezone);
        console.log(`Date: ${targetTime.day}/${targetTime.month}/${targetTime.year}\nTime: ${targetTime.hours}:${this.minutes}`);
    }
}

// needs to be async/await because otherwise code will continue while waiting for question to resolve, since that is an async method
async function displayOptions() {
    console.log("Press 0 to exit");
    console.log("Press 1 to list all available timezones");
    console.log("Press 2 to enter the target timezone");
    console.log("Press 3 to enter the timezone of origin");
    console.log("Press 4 to enter the date and time");
    console.log("Press 5 to convert the time");
    console.log("Press 6 to log object properties");
    userInput = await rl.question("Pick an option: ");

    await handleInput(userInput);
    displayOptions();
}

async function handleInput(input) {
    switch (userInput) {
        case '0':
            process.exit();
        case '1':
            displayTimezones();
            break;
        case '2':
            timezoneObj.targetTimezone = await rl.question("Enter the target timezone: ");
            break;
        case '3':
            timezoneObj.originTimezone = await rl.question("Enter the timezone of origin: ");
            break;
        case '4':
            let newDate = await rl.question("Enter the date (DD/MM/YYYY): ");
            if (checkDateValidity(newDate)) {
                timezoneObj.addDate(newDate);
            } else {
                console.log("Invalid date, please try again");
                break;
            }
            let newTime = await rl.question("Enter the time (hh:mm): ");
            if (checkTimeValidity(newTime)) {
                timezoneObj.addTime(newTime);
            } else {
                console.log("Invalid time, please try again");
                break;
            }
            break;
        case '5':
            if (timezoneObj.checkData()) {
                timezoneObj.convertTimezone();
            }
            break;
        case '6':
            for (let key in timezoneObj) {
                console.log(timezoneObj[key]);
            } 
            break;
    }
}

async function displayTimezones() {
    let filter = await rl.question("Filter timezones by region(), other keywords, or leave it blank for a complete list: ")
    for (let i in timezones) {
        if ((timezones[i]).includes(filter)) {
            console.log(timezones[i]);
        }
    }
}

function checkDateValidity(date) {
    try {
        let dateArr = date.split("/");
        let day = +dateArr[0];
        let month = +dateArr[1];
        let year = +dateArr[2];
        let leap = 0;
        if (year < 0) {
            return false;
        }
        // check for leap year (https://learn.microsoft.com/en-us/office/troubleshoot/excel/determine-a-leap-year)
        if (year % 4 === 0) {
            if (year % 100 === 0) {
                if (year % 400 === 0) {
                    leap = 1;
                }
            }
            leap = 1;
        }
        if (month < 1 || month > 12) {
            return false;
        }
        switch(month) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                if (day < 1 || day > 31) {
                    return false;
                }
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                if (day < 1 || day > 30) {
                    return false;
                }
                break
            case 2:
                if (day < 1 || day > 28 + leap) {
                    return false;
                }
                break
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

function checkTimeValidity(time) {
    try {
        let timeArr = time.split(":");
        let hours = timeArr[0];
        let minutes = timeArr[1];
        if (hours < 0 || hours > 23) {
            return false;
        }
        if (minutes < 0 || minutes > 59) {
            return false;
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

/* 
rl.on('line', (input) => {
    if (input.toLowerCase() === 'menu') {
        displayOptions();
    }
}) */