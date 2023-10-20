import dayjs from 'dayjs';
import businessTimeStatic from '../../src/static';

let opts;

describe('Business Minutes Diff', () => {
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

  it('should get the 30 business minutes diff between 2 times', () => {
    const start = dayjs('2021-02-08 09:00:00');
    const end = dayjs('2021-02-08 09:30:00');

    const diff = dayjs.businessTimeDiff(start, end, 'minutes', opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(30);
  });

  it('should get the 90 business minutes diff between 2 times in different days', () => {
    const start = dayjs('2021-02-08 16:45:00');
    const end = dayjs('2021-02-09 10:15:00');

    const diff = dayjs.businessTimeDiff(start, end, 'minutes', opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(90);
  });

  it('should get the 4.5 business hours diff between 2 times in different segments at same day', () => {
    const start = dayjs('2021-02-10 10:30:00');
    const end = dayjs('2021-02-10 16:00:00');

    const diff = dayjs.businessTimeDiff(start, end, 'hours', opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(4.5);
  });

  it('should get the 10 business hours diff between 2 times with a holiday', () => {
    const start = dayjs('2021-06-02 10:00:00');
    const end = dayjs('2021-06-04 12:00:00');

    const diff = dayjs.businessTimeDiff(start, end, 'hours', opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(10);
  });

  it('should get the 1 business day diff between 2 times with a weekend', () => {
    const start = dayjs('2021-02-05 15:00:00');
    const end = dayjs('2021-02-08 14:30:00');

    const diff = dayjs.businessTimeDiff(start, end, 'day', opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(1);
  });

  it('should get the 2 business days diff between 2 times with a long weekend', () => {
    const start = dayjs('2021-01-22 14:00:00');
    const end = dayjs('2021-01-27 11:00:00');

    const diff = dayjs.businessTimeDiff(start, end, 'days', opts);

    expect(diff).toBeDefined();
    expect(diff).toBe(2);
  });
});
