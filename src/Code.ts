// import { Calendar } from 'google-apps-script'

function scope(): string[] {
  const today = new Date();
  const theFirstOfTheMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const theEndOfTheMonthAfterNext = new Date(today.getFullYear(), today.getMonth() + 3, 0);
  return [theFirstOfTheMonth.toISOString(), theEndOfTheMonthAfterNext.toISOString()]
}

function myEventTitles(): string[] {
  const [start, end] = scope()
  const summaries = Calendar.Events.list('primary', {
    timeMin: start,
    timeMax: end,
    singleEvents: true,
  }).items.map(i => i.summary);
  return Array.from(new Set(summaries));
}

function listHolidays(): GoogleAppsScript.Calendar.Schema.Event[] {
  const calendarId = 'ja.japanese#holiday@group.v.calendar.google.com';
  const [start, end] = scope()
  const holidays = Calendar.Events.list(calendarId, {
    timeMin: start,
    timeMax: end,
  });
  return holidays.items;
}

function createEvent(holiday: GoogleAppsScript.Calendar.Schema.Event) {
  const startDate = new Date(holiday.start.date + 'T09:30:00')
  const endDate = new Date(holiday.start.date + 'T18:00:00');
  const event: GoogleAppsScript.Calendar.Schema.Event = {
    summary: holiday.summary,
    start: {
      dateTime: startDate.toISOString(),
    },
    end: {
      dateTime: endDate.toISOString(),
    },
    colorId: '11', // Red
  };
  const res = Calendar.Events.insert(event, 'primary');
  console.log(`${res.summary}（${res.start.dateTime}）`);
}

function main() {
  const titles = myEventTitles()
  const holidayEvents = listHolidays();
  holidayEvents.forEach((event) => {
    const found = titles.find(t => t == event.summary)
    if (found) {
      return
    } else {
      createEvent(event);
    }
  });
}
