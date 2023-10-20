import dayjs from 'dayjs';
import businessTimeStatic from '../../src/static';

let opts;

describe('Add Business Hours', () => {
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

  it('should add 3 business hours on a date', () => {
    const date = dayjs('2021-02-08 09:00:00');
    const expected = dayjs('2021-02-08 12:00:00');

    const newDate = dayjs.addBusinessHours(date, 3, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 5 business hours on a date in a day with 2 working segments', () => {
    const date = dayjs('2021-02-03 11:30:00');
    const expected = dayjs('2021-02-03 17:30:00');

    const newDate = dayjs.addBusinessHours(date, 5, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 4 business hours on a date before a weekend', () => {
    // february 19th, 2021 is a friday
    const date = dayjs('2021-02-19 15:00:00');

    // february 25th, 2021 is a monday
    const expected = dayjs('2021-02-22 11:00:00');

    const newDate = dayjs.addBusinessHours(date, 4, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 2 business hours on a date before a holiday', () => {
    // june 2nd, 2021 is a wednesday
    //   before corpus christ holiday
    const date = dayjs('2021-06-02 17:00');

    // june 4th, 2021 is a friday
    const expected = dayjs('2021-06-04 10:00:00');

    const newDate = dayjs.addBusinessHours(date, 2, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 16 business hours on a date before a long weekend', () => {
    // january 22nd, 2021 is a friday
    //   before São Paulo City anniversary
    const date = dayjs('2021-01-22 12:00:00');

    // january 27th, 2021 is a wednesday
    const expected = dayjs('2021-01-27 12:00:00');

    const newDate = dayjs.addBusinessHours(date, 16, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });
});
