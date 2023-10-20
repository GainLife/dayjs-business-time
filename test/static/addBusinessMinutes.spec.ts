import dayjs from 'dayjs';
import businessTimeStatic from '../../src/static';

let opts;

describe('Add Business Minutes', () => {
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

  it('should add 15 business minutes on a date', () => {
    const date = dayjs('2021-02-08 09:00:00');
    const expected = dayjs('2021-02-08 09:15:00');

    const newDate = dayjs.addBusinessMinutes(date, 15, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 33 business minutes on a date in a day with 2 working segments', () => {
    const date = dayjs('2021-02-03 11:30:00');
    const expected = dayjs('2021-02-03 13:03:00');

    const newDate = dayjs.addBusinessMinutes(date, 33, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 45 business minutes on a date before a weekend', () => {
    // february 19th, 2021 is a friday
    const date = dayjs('2021-02-19 16:30:00');

    // february 25th, 2021 is a monday
    const expected = dayjs('2021-02-22 09:15:00');

    const newDate = dayjs.addBusinessMinutes(date, 45, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 10 business hours on a date before a holiday', () => {
    // june 2nd, 2021 is a wednesday
    //   before corpus christ holiday
    const date = dayjs('2021-06-02 17:55');

    // june 4th, 2021 is a friday
    const expected = dayjs('2021-06-04 09:05:00');

    const newDate = dayjs.addBusinessMinutes(date, 10, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 16 business minutes on a date before a long weekend', () => {
    // january 22nd, 2021 is a friday
    //   before São Paulo City anniversary
    const date = dayjs('2021-01-22 17:00:00');

    // january 27th, 2021 is a wednesday
    const expected = dayjs('2021-01-26 09:16:00');

    const newDate = dayjs.addBusinessMinutes(date, 16, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });
});
