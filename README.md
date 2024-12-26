# 25live autofill

A small side project. It's a script to fill out room reservations via robot ;)

This script is meant to be a greedy cannon. You fire it once, and it will simply book ALL POSSIBLE availabilities in the days of the week and times you specify in 2 rooms. (the default is the two SRC Multipurpose rooms).

Whether that means 56 practices booked or 2 practices booked, it will look at the two rooms specified
and book all possible practices in the days and time range you specify.

This means that if only one of the two rooms is available the whole semester, it will book all possible practice times in there.
This also means if that both rooms are available on any particular day, it will book both rooms at the same time for that day.

## Installation

1. Make sure you have Nodejs installed so you can run Javascript on your command line.

You can check by running `node -v` to see if you have it.
If you don't have it installed, you can find it [here](https://nodejs.org/en/)

2. Next, you want to install pnpm globally. This project only works with pnpm as a package manager.

```bash
npm install -g pnpm
```

3. Pull this git repository onto your computer and run `pnpm install` in the root directory of this project to install the dependencies.

```bash
git clone git@github.com:evanetizen/25live-autofill.git
cd 25live-autofill
pnpm install
```

4. You want to find the chromeExecutable variable at the top of script.js and change it to where the Google Chrome executable is on your computer.

5. There are some default settings in place at the top of script.js. Change the phone number!

```js
const chromeExecutable = "/usr/bin/google-chrome-stable"; // find chrome on your computer and paste the path.
const phoneNumber = "703XXXXXXX"; // leave a phone number for school to call back about reservation inquiries.

const roomSearchQuery = "SRC MULTI-PURPOSE"; // make sure this search query encompasses the two rooms you want to book.
const roomText1 = "SRC MULTI-PURPOSE ROOM 1"; // make sure the spacing is precise here. the script uses an exact match to find the reserve button
const roomText2 = "SRC MULTI-PURPOSE ROOM 2";
const startDate = "2025-01-02"; // sets the initial date of the repeated pattern.
const endDate = "2025-05-09"; // this should be the last day of the semester, typically they don't allow reservations after
```

## Usage

To run the script, make sure you are in the root of this project and go to the terminal and run:

```bash
node script.js TueThu 8:00 10:00
```

or

```bash
node script.js Sat 2:00 4:00
```

The script expects exactly three arguments:

1. A string with days of the week. Some combination of Sun, Mon, Tue, Wed, Thu, Fri, Sat. Notice all of these units are three letters. (e.g. TueThu, Sat, SunWedFri)
2. A string representing the start time of the reservation. (e.g. 8:00)
3. A string representing the end time of the reservation. (e.g. 10:00)

The script expects the two times to be in the format of one or two digits, followed by a colon, followed by two digits, such as 8:30 or 12:15. Do not include 'pm', the script assumes you are booking past noon.

This should open up a Chrome window and ask you to log into NetBadge.
Once you get into 25live, close out of any announcement windows and press the Event Form link on the top right.

![25live dash](25livedash.png)

The script will then run to fill out the form to the best of its abilities.
The script will book all available days in the two rooms in the times you specify, whether it is one room available or both.

Keep in mind that this script may only book a few practices if there's a lot of conflicts. So double check the occurrences before you submit to make sure you are happy with the results.

If the script doesn't find either of the two practice rooms available, it will tell you to CTRL C and restart from the command line. Before you CTRL C, I encourage you to view "Conflict Details" to see what's conflicting with your desired times. If you can book around the conflict, I encourage you to CTRL C and run the script again with a slightly offset time:

```
node script.js TueThu 8:30 10:30
```

The script will never save and submit the form by itself. Always check "Manage Occurrences" to make sure you have a general idea of what you are booking. Press the save button in the bottom right to submit!

## 25 Live Tips:

The 25 live form has a really confusing order of operations to it that makes it easy to be confused as to why it won't submit.

The key player here is the "Manage Occurrences" button after you set your repeating pattern.

![Manage Occurrences Button](./manageocc.png)

Basically, you tell 25live "These are all the practices I want to happen."
Then you go to the Location search and find a room (or two).

By pressing the "Reserve" or "Reserve Available" button in a particular room,
25 live books all occurrences in that room that do not have a conflict.

Seems pretty self explanatory right? Maybe not.

It won't let you press save for these rooms and just call it a day.
25 Live still thinks that you want to book for ALL of your occurrences, and some of those
do not have a location!!! For all the days that have no location, it doesn't know what to do,
and prevents you from submitting.

![No Location for occurrences](nolocation.png)

---

**TIP: DO NOT TOUCH THE THING UNDER LOCATION SEARCH. IT IS USELESS**
These are the things to manage each particular room. However, because 25live already books
every available instance for you, there is no point in messing around with each particular room.

![Do not touch this](donottouch.png)

What you want to go back to instead is the "Manage Occurrences" button from above.
**MODIFY YOUR OCCURRENCES HERE**. What this script does, and what I recommend you do,
is find all the occurrences without any location and press remove. This tells 25live that
you don't care about this date that you couldn't find a room for.

# Behind the scenes... and order of operations!

So if you're filling out a 25Live form by hand, you should replicate the order the script performs

1. fill out basic info at the top
2. fill out the practice time you want and repeating date pattern (to book all of the practices)
3. Do a location search.
4. Click "reserve" or "reserve available" for the rooms you want.
5. fill out the information at the bottom and hit "I agree" to the terms.
6. Go back to "Manage Occurrences" and delete all occurrences without a location.
7. Submit!

**AFTER YOU REMOVE ALL THE DATES WITHOUT LOCATIONS, YOU SHOULD BE ABLE TO PRESS SAVE ON THE BOTTOM RIGHT**.

Another small annoying bit: because you have modified the occurrences list, 25 live thinks you are trying to search for something else. Again, hopefully you don't need to search for more locations... but in theory you could, if you were really set on finding alternative locations. But that entails going to the "Manage Occurrences" button and changing the occurrences you want to include in your search. It's uhhh confusing stuff.

## griefing lol

One interesting thing I found while playing around with this: as soon as you press "Reserve" or "Reserve Available" for a room, 25 live puts a "pending" label on this event that prevents other people from reserving the same room at the same time. This pending label, as far as I can tell, lasts about 15-25 minutes after I close the form and before it is cleared. You could, in theory, use this to block out a particular room about 15 minutes before noon to prevent anyone from aiming for it. But be careful, 25live could just as easily flush their pending events at noon and it's a free for all. Hopefully this script gives you the speed you need.

Good luck out there!
