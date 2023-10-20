import dayjs from 'dayjs';
import businessTimeStatic from '../../src/static';

let opts;

describe('Add Business Days', () => {
  beforeAll(() => {
    dayjs.extend(businessTimeStatic);

    opts = {
      holidays: ['2021-01-01', '2021-01-25', '2021-06-03'],
    }
  });

  it('should add 3 business day on a date', () => {
    const date = dayjs('2021-02-08');
    const expected = dayjs('2021-02-11');

    const newDate = dayjs.addBusinessDays(date, 3, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 4 business day on a day before a weekend', () => {
    // february 19th, 2021 is a friday
    const date = dayjs('2021-02-19');

    // february 25th, 2021 is a monday
    const expected = dayjs('2021-02-25');

    const newDate = dayjs.addBusinessDays(date, 4, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 2 business days on a day before a holiday', () => {
    // june 2nd, 2021 is a wednesday
    //   before corpus christ holiday
    const date = dayjs('2021-06-02');

    // june 7th, 2021 is a monday
    const expected = dayjs('2021-06-07');

    const newDate = dayjs.addBusinessDays(date, 2, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 3 business days on a day before a long weekend', () => {
    // january 22nd, 2021 is a friday
    //   before São Paulo City anniversary
    const date = dayjs('2021-01-22');

    // january 28th, 2021 is a thursday
    const expected = dayjs('2021-01-28');

    const newDate = dayjs.addBusinessDays(date, 3, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });
});
