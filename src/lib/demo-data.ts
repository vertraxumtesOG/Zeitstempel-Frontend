// Demo-Daten für die Zeiterfassungs-Übersicht
interface Mitarbeiter {
  id: number;
  firstName: string;
  lastName: string;
  uid: number;
}

interface Login {
  id: number;
  userId: number;
  time: Date;
  loggedIn: boolean;
}

const demoMitarbeiter: Mitarbeiter[] = [
  { id: 1, firstName: 'Max', lastName: 'Mustermann', uid: 12345 },
  { id: 2, firstName: 'Erika', lastName: 'Beispiel', uid: 54321 },
];

const demoLogins: Login[] = [
  // Max Mustermann
  { id: 1, userId: 1, time: new Date('2026-05-19T08:00:00'), loggedIn: true },
  { id: 2, userId: 1, time: new Date('2026-05-19T12:00:00'), loggedIn: false },
  { id: 3, userId: 1, time: new Date('2026-05-19T13:00:00'), loggedIn: true },
  { id: 4, userId: 1, time: new Date('2026-05-19T17:30:00'), loggedIn: false },

  { id: 5, userId: 1, time: new Date('2026-05-18T07:45:00'), loggedIn: true },
  { id: 6, userId: 1, time: new Date('2026-05-18T12:15:00'), loggedIn: false },
  { id: 7, userId: 1, time: new Date('2026-05-18T13:00:00'), loggedIn: true },
  { id: 8, userId: 1, time: new Date('2026-05-18T17:45:00'), loggedIn: false },

  { id: 9, userId: 1, time: new Date('2026-05-17T08:15:00'), loggedIn: true },
  { id: 10, userId: 1, time: new Date('2026-05-17T12:30:00'), loggedIn: false },
  { id: 11, userId: 1, time: new Date('2026-05-17T13:15:00'), loggedIn: true },
  { id: 12, userId: 1, time: new Date('2026-05-17T17:15:00'), loggedIn: false },

  { id: 13, userId: 1, time: new Date('2026-05-16T08:00:00'), loggedIn: true },
  { id: 14, userId: 1, time: new Date('2026-05-16T12:00:00'), loggedIn: false },
  { id: 15, userId: 1, time: new Date('2026-05-16T13:00:00'), loggedIn: true },
  { id: 16, userId: 1, time: new Date('2026-05-16T18:00:00'), loggedIn: false },

  // Erika Beispiel
  { id: 17, userId: 2, time: new Date('2026-05-19T09:00:00'), loggedIn: true },
  { id: 18, userId: 2, time: new Date('2026-05-19T12:30:00'), loggedIn: false },
  { id: 19, userId: 2, time: new Date('2026-05-19T13:30:00'), loggedIn: true },
  { id: 20, userId: 2, time: new Date('2026-05-19T17:00:00'), loggedIn: false },

  { id: 21, userId: 2, time: new Date('2026-05-18T08:45:00'), loggedIn: true },
  { id: 22, userId: 2, time: new Date('2026-05-18T12:45:00'), loggedIn: false },
  { id: 23, userId: 2, time: new Date('2026-05-18T13:45:00'), loggedIn: true },
  { id: 24, userId: 2, time: new Date('2026-05-18T17:30:00'), loggedIn: false },
  { id: 25, userId: 1, time: new Date('2026-05-01T08:10:00'), loggedIn: true },
  { id: 26, userId: 1, time: new Date('2026-05-01T16:50:00'), loggedIn: false },
  { id: 27, userId: 1, time: new Date('2026-04-15T08:05:00'), loggedIn: true },
  { id: 28, userId: 1, time: new Date('2026-04-15T17:05:00'), loggedIn: false },
  { id: 29, userId: 1, time: new Date('2026-03-15T07:50:00'), loggedIn: true },
  { id: 30, userId: 1, time: new Date('2026-03-15T16:30:00'), loggedIn: false },
  { id: 31, userId: 1, time: new Date('2026-02-15T08:00:00'), loggedIn: true },
  { id: 32, userId: 1, time: new Date('2026-02-15T17:00:00'), loggedIn: false },
  { id: 33, userId: 1, time: new Date('2026-01-15T08:20:00'), loggedIn: true },
  { id: 34, userId: 1, time: new Date('2026-01-15T17:10:00'), loggedIn: false },

  { id: 35, userId: 2, time: new Date('2026-05-01T09:00:00'), loggedIn: true },
  { id: 36, userId: 2, time: new Date('2026-05-01T17:00:00'), loggedIn: false },
  { id: 37, userId: 2, time: new Date('2026-04-15T08:45:00'), loggedIn: true },
  { id: 38, userId: 2, time: new Date('2026-04-15T17:15:00'), loggedIn: false },
  { id: 39, userId: 2, time: new Date('2026-03-15T09:10:00'), loggedIn: true },
  { id: 40, userId: 2, time: new Date('2026-03-15T16:45:00'), loggedIn: false },
  { id: 41, userId: 2, time: new Date('2026-02-15T08:50:00'), loggedIn: true },
  { id: 42, userId: 2, time: new Date('2026-02-15T16:30:00'), loggedIn: false },
  { id: 43, userId: 2, time: new Date('2026-01-15T09:05:00'), loggedIn: true },
  { id: 44, userId: 2, time: new Date('2026-01-15T16:55:00'), loggedIn: false },
];

// Demo-Service-Funktionen
export function getMitarbeiterByUid(uid: number): Mitarbeiter | undefined {
  return demoMitarbeiter.find((m) => m.uid === uid);
}

export function getLogins(userId: number): Login[] {
  return demoLogins
    .filter((l) => l.userId === userId)
    .sort((a, b) => b.time.getTime() - a.time.getTime());
}

export function getStatistics(userId: number) {
  const logins = getLogins(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay() + 1);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const calculateHours = (startDate: Date, endDate: Date): number => {
    let totalMinutes = 0;
    let inTime: Date | null = null;

    const filteredLogins = logins.filter((l) => l.time >= startDate && l.time <= endDate);

    for (const login of filteredLogins) {
      if (login.loggedIn) {
        inTime = login.time;
      } else if (inTime) {
        totalMinutes += (login.time.getTime() - inTime.getTime()) / (1000 * 60);
        inTime = null;
      }
    }

    return Math.round((totalMinutes / 60) * 10) / 10;
  };

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const endOfWeek = new Date(thisWeekStart);
  endOfWeek.setDate(thisWeekStart.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const endOfMonth = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return {
    hoursToday: calculateHours(today, endOfToday),
    hoursThisWeek: calculateHours(thisWeekStart, endOfWeek),
    hoursThisMonth: calculateHours(thisMonthStart, endOfMonth),
  };
}
