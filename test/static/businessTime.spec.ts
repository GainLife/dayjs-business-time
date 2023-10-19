import dayjs from 'dayjs';
import { businessTimeStatic } from '../../src';

let opts;

describe('Business Time', () => {
  beforeAll(() => {
    dayjs.extend(businessTimeStatic);

    opts = {
      holidays: ['2021-01-01', '2021-01-25', '2021-06-03'],
    }
  });

  it('should successfully check business time in a business day', () => {
    const date = dayjs('2021-02-11 10:00:00');

    const isBusinessTime = dayjs.isBusinessTime(date, opts);

    expect(isBusinessTime).toBeDefined();
    expect(isBusinessTime).toBe(true);
  });

  it('should successfully check non business time is a business day', () => {
    const date = dayjs('2021-02-11 05:00:00');

    const isBusinessTime = dayjs.isBusinessTime(date, opts);

    expect(isBusinessTime).toBeDefined();
    expect(isBusinessTime).toBe(false);
  });

  it('should successfully check business time is a non business day', () => {
    const date = dayjs('2021-01-25 10:00:00');

    const isBusinessTime = dayjs.isBusinessTime(date, opts);

    expect(isBusinessTime).toBeDefined();
    expect(isBusinessTime).toBe(false);
  });
});
