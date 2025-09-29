
export enum Month {
    January = 0,
    February,
    March,
    April,
    May,
    June,
    July,
    August,
    September,
    October,
    November,
    December
}

export type YearExceptions = Map<Month, number[]>

export type Calendar = {
    dayoffs: YearExceptions,
    extraDays: YearExceptions
}

export type YearWithGeo = {
    mainCalendar: Calendar,
    regional: Map<number, Calendar>
}

export const combineExceptions = (main: YearExceptions, regional: YearExceptions) => {
    const result = new Map<Month, number[]>(main)
    for (let m of regional.keys()) {
        result.set(m, [...result.get(m) ?? [], ...regional.get(m) ?? []])
    }
    return result
}

const dayoffs2025: YearExceptions = new Map<Month, number[]>([
    [Month.January, [1, 2, 3, 6, 7, 8]],
    [Month.May, [1, 2, 8, 9]],
    [Month.June, [12, 13]],
    [Month.November, [3, 4]],
    [Month.December, [31]],
])

const extraDays2025: YearExceptions = new Map<Month, number[]>([
    [Month.November, [1]]
])

const dayoffs2025Tatarstan: YearExceptions = new Map<Month, number[]>([
    [Month.June, [6]],
    [Month.November, [6]]
])

const extraDays2025Tatarstan: YearExceptions = new Map<Month, number[]>()

const mainCalendar2025: Calendar = {
    dayoffs: dayoffs2025,
    extraDays: extraDays2025
}

const tatarstanCalendar: Calendar = {
    dayoffs: combineExceptions(dayoffs2025, dayoffs2025Tatarstan),
    extraDays: combineExceptions(extraDays2025, extraDays2025Tatarstan)
}

export const calendars2025: YearWithGeo = {
    mainCalendar: mainCalendar2025,
    regional: new Map<number, Calendar>([
        [16, tatarstanCalendar]
    ])
}

const years = new Map<number, YearWithGeo>([
    [2025, calendars2025]
])

const isExceptionContainsDate = (yearExceptions: YearExceptions, date: Date) => {
    const daysInMonth = new Set<number>(yearExceptions.get(date.getMonth() as Month) ?? []);
    return daysInMonth.has(date.getDate());
}

const isDayOffInCalendar = (calendar: Calendar, date: Date) => {
    if (isExceptionContainsDate(calendar.extraDays, date)) return false;
    if (isExceptionContainsDate(calendar.dayoffs, date)) return true;
    // saturday / sunday
    return date.getDay() == 6 || date.getDay() == 0;
}

const emptyYearCalendar: YearWithGeo = {
    mainCalendar: {
        dayoffs: new Map<Month, number[]>(),
        extraDays: new Map<Month, number[]>()
    },
    regional: new Map<number, Calendar>()
}

export const isDayOff = (date: Date, region: number) => {
    const yearCalendar = (years.get(date.getFullYear()) ?? emptyYearCalendar);
    const calendar = yearCalendar.regional.get(region) ?? yearCalendar.mainCalendar;
    return isDayOffInCalendar(calendar, date);
}

const drawMonth = (year: number, month: Month, region: number) => {
    console.log(`${Month[month]} ${year} in region [${region}]`)
    const Dim = "\x1b[2m"
    const FgRed = "\x1b[31m"
    const FgGreen = "\x1b[32m"
    const Reset = "\x1b[0m"

    const firstDayOfMonth = new Date(Date.UTC(year, month, 1))
    const daysToSkip = (firstDayOfMonth.getUTCDay() == 0 ? 7 : firstDayOfMonth.getUTCDay()) - 1
    let currentDate = new Date(firstDayOfMonth)
    currentDate.setDate(currentDate.getUTCDate() - daysToSkip)

    // todo: decide how many rows to draw
    for (let week = 0; week <= 5; week++) {
        let str = "";
        for (let weekDay = 1; weekDay <= 7; weekDay++) {
            if (currentDate.getMonth() != month) {
                str += Dim
            } else {
                str += Reset
            }
            str += isDayOff(currentDate, region) ? FgRed : FgGreen;

            str += String(currentDate.getDate()).padStart(2, " ") + " "

            currentDate.setDate(currentDate.getDate() + 1)
        }

        console.log(`${str}${Reset}`)
    }
}

const month = Month.December
drawMonth(2025, month, 78)
console.log()
drawMonth(2025, month, 16)
