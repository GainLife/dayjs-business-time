import dayjs from 'dayjs';
import { businessTimeStatic } from '../../src';

let opts;

describe('Holidays & Business Days', () => {
  beforeAll(() => {
    dayjs.extend(businessTimeStatic);

    opts = {
      holidays: ['2021-01-01', '2021-01-25', '2021-06-03'],
    }
  });

  it('should successfully check a holiday', () => {
    // previously set as holiday
    const holiday = dayjs('2021-01-25');

    const isHoliday = dayjs.isHoliday(holiday, opts);

    expect(isHoliday).toBeDefined();
    expect(isHoliday).toBe(true);
  });

  it('should successfully check a non holiday', () => {
    // previously set as holiday
    const nHoliday = dayjs('2021-01-26');

    const isHoliday = dayjs.isHoliday(nHoliday, opts);

    expect(isHoliday).toBeDefined();
    expect(isHoliday).toBe(false);
  });

  it('should check if the given date is a holiday', () => {
    // previously set as holiday
    const holiday = dayjs('2021-01-25');

    const isHoliday = dayjs.isHoliday(holiday, opts);

    expect(isHoliday).toBeDefined();
    expect(isHoliday).toBe(true);
  });

  it('should successfully check a business day', () => {
    // february 4nd, 2021 is a wednesday
    const businessDay = dayjs('2021-02-04');

    const isBusinessDay = dayjs.isBusinessDay(businessDay, opts);

    expect(isBusinessDay).toBeDefined();
    expect(isBusinessDay).toBe(true);
  });

  it('should successfully check a non business day', () => {
    // february 7th, 2021 is a sunday
    const nonBusinessDay = dayjs('2021-02-07');

    const isBusinessDay = dayjs.isBusinessDay(nonBusinessDay, opts);

    expect(isBusinessDay).toBeDefined();
    expect(isBusinessDay).toBe(false);
  });
});
