import dayjs from 'dayjs';
import { businessTimeStatic } from '../../src';

let opts;

describe('Subtract Business Time', () => {
  beforeAll(() => {
    dayjs.extend(businessTimeStatic);

    opts = {
      holidays: ['2021-01-01', '2021-01-25', '2021-06-03'],
      businessHoursMap: {
        ...dayjs.getDefaultWorkingHours(),
        wednesday: [
          { start: '09:00:00', end: '12:00:00' },
          { start: '13:00:00', end: '18:00:00' },
        ]
      }
    }
  });

  it('should subtract 3 business day on a date', () => {
    const date = dayjs('2021-02-11');
    const expected = dayjs('2021-02-08');

    const newDate = dayjs.subtractBusinessTime(date, 3, 'days', opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 4 business day on a day after a weekend', () => {
    // february 25th, 2021 is a monday
    const date = dayjs('2021-02-25');

    // february 19th, 2021 is a friday
    const expected = dayjs('2021-02-19');

    const newDate = dayjs.subtractBusinessTime(date, 4, 'days', opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 5 business hours on a date in a day with 2 working segments', () => {
    const date = dayjs('2021-02-03 17:30:00');
    const expected = dayjs('2021-02-03 11:30:00');

    const newDate = dayjs.subtractBusinessTime(date, 5, 'hours', opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 4 business hours on a date after a weekend', () => {
    // february 25th, 2021 is a monday
    const date = dayjs('2021-02-22 11:00:00');

    // february 19th, 2021 is a friday
    const expected = dayjs('2021-02-19 15:00:00');

    const newDate = dayjs.subtractBusinessTime(date, 4, 'hours', opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 28 business minutes on a date after a holiday', () => {
    // june 4th, 2021 is a friday
    //   after corpus christ holiday
    const date = dayjs('2021-06-04 09:15:00');

    // june 2nd, 2021 is a wednesday
    const expected = dayjs('2021-06-02 17:47:00');

    const newDate = dayjs.subtractBusinessTime(date, 28, 'minutes', opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 90 business minutes on a date after a long weekend', () => {
    // january 26th, 2021 is a tuesday
    //   after São Paulo City anniversary
    const date = dayjs('2021-01-26 10:00:00');

    // january 22nd, 2021 is a friday
    const expected = dayjs('2021-01-22 16:30:00');

    const newDate = dayjs.subtractBusinessTime(date, 90, 'minutes', opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });
});
