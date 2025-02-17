import dayjs from 'dayjs';
import businessTimeStatic from '../../src/static';

let opts;

describe('Subtract Business Days', () => {
  beforeAll(() => {
    dayjs.extend(businessTimeStatic);

    opts = {
      holidays: ['2021-01-01', '2021-01-25', '2021-06-03'],
    }
  });

  it('should subtract 3 business day on a date', () => {
    const date = dayjs('2021-02-11');
    const expected = dayjs('2021-02-08');

    const newDate = dayjs.subtractBusinessDays(date, 3, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 4 business day on a day after a weekend', () => {
    // february 25th, 2021 is a monday
    const date = dayjs('2021-02-25');

    // february 19th, 2021 is a friday
    const expected = dayjs('2021-02-19');

    const newDate = dayjs.subtractBusinessDays(date, 4, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 2 business days on a day after a holiday', () => {
    // june 7th, 2021 is a monday
    //   after corpus christ holiday
    const date = dayjs('2021-06-07');

    // june 2nd, 2021 is a wednesday
    const expected = dayjs('2021-06-02');

    const newDate = dayjs.subtractBusinessDays(date, 2, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should subtract 3 business days on a day after a long weekend', () => {
    // january 28th, 2021 is a thursday
    //   after São Paulo City anniversary
    const date = dayjs('2021-01-28');

    // january 22nd, 2021 is a friday
    const expected = dayjs('2021-01-22');

    const newDate = dayjs.subtractBusinessDays(date, 3, opts);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });
});
