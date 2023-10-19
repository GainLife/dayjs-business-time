import dayjs from 'dayjs';
import { businessTimeStatic } from '../../src';

let opts;

describe('Business Day Diff', () => {
  beforeAll(() => {
    dayjs.extend(businessTimeStatic);

    opts = {
      holidays: ['2021-01-01', '2021-01-25', '2021-06-03'],
    }
  });

  it('should get the 2 business days diff between 2 times', () => {
    const start = dayjs('2021-02-08 09:00:00');
    const end = dayjs('2021-02-10 11:00:00');

    const diff = dayjs.businessDaysDiff(start, end, opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(2);
  });

  it('should get the 8 business days diff between 2 times in different days', () => {
    const start = dayjs('2021-02-08 16:45:00');
    const end = dayjs('2021-02-18 16:45:00');

    const diff = dayjs.businessDaysDiff(start, end, opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(8);
  });

  it('should get the 3 business days diff between 2 times with a holiday', () => {
    const start = dayjs('2021-06-02 10:00:00');
    const end = dayjs('2021-06-08 12:00:00');

    const diff = dayjs.businessDaysDiff(start, end, opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(3);
  });

  it('should get the 1 business day diff between 2 times with a weekend', () => {
    const start = dayjs('2021-02-05 15:00:00');
    const end = dayjs('2021-02-08 14:30:00');

    const diff = dayjs.businessDaysDiff(start, end, opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(1);
  });

  it('should get the 2 business days diff between 2 times with a long weekend', () => {
    const start = dayjs('2021-01-22 14:00:00');
    const end = dayjs('2021-01-27 11:00:00');

    const diff = dayjs.businessDaysDiff(start, end, opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(2);
  });
});
