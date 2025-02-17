import dayjs from 'dayjs';
import businessTimeStatic from '../../src/static';

let opts;

describe('Subtract Business Minutes', () => {
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

  it('should subtract 30 business minutes on a date', () => {
    const date = dayjs('2021-02-08 15:00:00');
    const expected = dayjs('2021-02-08 14:30:00');

    const newDate = dayjs.subtractBusinessMinutes(date, 30, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 50 business minutes on a date in a day with 2 working segments', () => {
    const date = dayjs('2021-02-03 13:30:00');
    const expected = dayjs('2021-02-03 11:40:00');

    const newDate = dayjs.subtractBusinessMinutes(date, 50, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 33 business hours on a date after a weekend', () => {
    // february 25th, 2021 is a monday
    const date = dayjs('2021-02-22 09:30:00');

    // february 19th, 2021 is a friday
    const expected = dayjs('2021-02-19 16:57:00');

    const newDate = dayjs.subtractBusinessMinutes(date, 33, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 28 business minutes on a date after a holiday', () => {
    // june 4th, 2021 is a friday
    //   after corpus christ holiday
    const date = dayjs('2021-06-04 09:15:00');

    // june 2nd, 2021 is a wednesday
    const expected = dayjs('2021-06-02 17:47:00');

    const newDate = dayjs.subtractBusinessMinutes(date, 28, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 90 business minutes on a date after a long weekend', () => {
    // january 26th, 2021 is a tuesday
    //   after São Paulo City anniversary
    const date = dayjs('2021-01-26 10:00:00');

    // january 22nd, 2021 is a friday
    const expected = dayjs('2021-01-22 16:30:00');

    const newDate = dayjs.subtractBusinessMinutes(date, 90, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });
});
