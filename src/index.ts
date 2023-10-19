import UpdateLocale from 'dayjs/plugin/updateLocale';
import LocaleData from 'dayjs/plugin/localeData';
import IsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import dayjs, {
  BusinessHoursMap,
  BusinessOpts,
  BusinessTimeSegment,
  BusinessUnitType,
  Dayjs,
  PluginFunc,
} from 'dayjs';

const DEFAULT_WORKING_HOURS = {
  sunday: null,
  monday: [{ start: '09:00:00', end: '17:00:00' }],
  tuesday: [{ start: '09:00:00', end: '17:00:00' }],
  wednesday: [{ start: '09:00:00', end: '17:00:00' }],
  thursday: [{ start: '09:00:00', end: '17:00:00' }],
  friday: [{ start: '09:00:00', end: '17:00:00' }],
  saturday: null,
};

enum DaysNames {
  sunday = 0,
  monday = 1,
  tuesday = 2,
  wednesday = 3,
  thursday = 4,
  friday = 5,
  saturday = 6,
}

const businessTime: PluginFunc = (
  option: any,
  DayjsClass: typeof Dayjs,
  dayjsFactory: typeof dayjs,
) => {
  dayjsFactory.extend(LocaleData);
  dayjsFactory.extend(UpdateLocale);
  dayjsFactory.extend(IsSameOrBefore);
  dayjsFactory.extend(IsSameOrAfter);

  setBusinessTime(DEFAULT_WORKING_HOURS);
  setHolidays([]);

  function getLocale() {
    return dayjsFactory.Ls[dayjs().locale()];
  }

  function updateLocale(newData) {
    dayjsFactory.updateLocale(dayjs().locale(), { ...newData });
  }

  function getHolidays(): string[] {
    return getLocale().holidays || [];
  }

  function setHolidays(holidays) {
    updateLocale({ holidays });
  }

  function getBusinessTime(): BusinessHoursMap {
    return getLocale().businessHours;
  }

  function setBusinessTime(businessHours: BusinessHoursMap) {
    updateLocale({ businessHours });
  }

  function isHoliday() {
    const today = this.format('YYYY-MM-DD');
    const holidays = getHolidays();

    return holidays.includes(today);
  }

  function isBusinessDay() {
    const businessHours = getBusinessTime();
    const dayName = DaysNames[this.day()];
    const isDefaultWorkingDay = !!businessHours[dayName];

    return isDefaultWorkingDay && !this.isHoliday();
  }

  function addOrsubtractBusinessDays(
    date: Dayjs,
    numberOfDays: number,
    action: 'add' | 'subtract' = 'add',
  ) {
    let daysToIterate = numberOfDays;
    let day = date.clone();

    while (daysToIterate) {
      day = day[action](1, 'day');
      if (day.isBusinessDay()) {
        daysToIterate = daysToIterate - 1;
      }
    }

    return day;
  }

  function nextBusinessDay() {
    return addOrsubtractBusinessDays(this, 1);
  }

  function lastBusinessDay() {
    return addOrsubtractBusinessDays(this, 1, 'subtract');
  }

  function addBusinessDays(numberOfDays: number) {
    return addOrsubtractBusinessDays(this, numberOfDays);
  }

  function subtractBusinessDays(numberOfDays: number) {
    return addOrsubtractBusinessDays(this, numberOfDays, 'subtract');
  }

  function timeStringToDayJS(timeString: string, date: Dayjs = dayjs()) {
    const [hours, minutes, seconds] = <number[]>(
      (timeString.split(':') as unknown)
    );
    return date
      .clone()
      .hour(hours)
      .minute(minutes)
      .second(seconds)
      .millisecond(0);
  }

  function getBusinessTimeSegments(day: Dayjs): BusinessTimeSegment[] {
    if (!day.isBusinessDay()) {
      return null;
    }
    let date = day.clone();

    const dayName = DaysNames[date.day()];

    const businessHours = getBusinessTime()[dayName];

    return businessHours.reduce((segments, businessTime, index) => {
      let { start, end } = businessTime;
      start = timeStringToDayJS(start, date);
      end = timeStringToDayJS(end, date);
      segments.push({ start, end });
      return segments;
    }, []);
  }

  function getCurrentBusinessTimeSegment(date) {
    const businessSegments = getBusinessTimeSegments(date);

    if (!businessSegments?.length) {
      return false;
    }

    return businessSegments.find((businessSegment) => {
      const { start, end } = businessSegment;
      return date.isSameOrAfter(start) && date.isSameOrBefore(end);
    });
  }

  function isBusinessTime() {
    return !!getCurrentBusinessTimeSegment(this);
  }

  function nextBusinessTime() {
    if (!this.isBusinessDay()) {
      const nextBusinessDay = this.nextBusinessDay();
      return getBusinessTimeSegments(nextBusinessDay)[0].start;
    }

    const segments = getBusinessTimeSegments(this);

    for (let index = 0; index < segments.length; index++) {
      const { start, end } = segments[index];
      const isLastSegment = index === segments.length - 1;

      if (this.isBefore(start)) {
        return start;
      }

      if (this.isAfter(end)) {
        if (!isLastSegment) {
          continue;
        }

        const nextBusinessDay = this.nextBusinessDay();
        return getBusinessTimeSegments(nextBusinessDay)[0].start;
      }

      return this.clone();
    }
  }

  function lastBusinessTime() {
    if (!this.isBusinessDay()) {
      const lastBusinessDay = this.lastBusinessDay();
      const { end } = getBusinessTimeSegments(lastBusinessDay).pop();
      return end;
    }

    const segments = getBusinessTimeSegments(this).reverse();

    for (let index = 0; index < segments.length; index++) {
      const { start, end } = segments[index];
      const isFirstSegment = index === segments.length - 1;

      if (this.isAfter(end)) {
        return end;
      }

      if (this.isBefore(start)) {
        if (!isFirstSegment) {
          continue;
        }

        const lastBusinessDay = this.lastBusinessDay();
        return getBusinessTimeSegments(lastBusinessDay).pop().end;
      }

      return this.clone();
    }
  }

  function addBusinessMinutes(minutesToAdd: number): Dayjs {
    return addOrSubtractBusinessMinutes(this, minutesToAdd);
  }

  function addBusinessHours(hoursToAdd: number): Dayjs {
    const minutesToAdd = hoursToAdd * 60;
    return this.addBusinessMinutes(minutesToAdd);
  }

  function addBusinessTime(timeToAdd: number, businessUnit: BusinessUnitType) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return this.addBusinessMinutes(timeToAdd);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return this.addBusinessHours(timeToAdd);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return this.addBusinessDays(timeToAdd);
    }

    throw new Error('Invalid Business Time Unit');
  }

  function addOrSubtractBusinessMinutes(
    day: Dayjs,
    numberOfMinutes: number,
    action: 'add' | 'subtract' = 'add',
  ): Dayjs {
    let date =
      action === 'add' ? day.nextBusinessTime() : day.lastBusinessTime();

    while (numberOfMinutes) {
      const segment = getCurrentBusinessTimeSegment(
        date,
      ) as BusinessTimeSegment;

      if (!segment) {
        date =
          action === 'add' ? date.nextBusinessTime() : date.lastBusinessTime();
        continue;
      }

      const { start, end } = segment;

      const compareBaseDate = action === 'add' ? end : date;
      const compareDate = action === 'add' ? date : start;

      let timeToJump = compareBaseDate.diff(compareDate, 'minute');

      if (timeToJump > numberOfMinutes) {
        timeToJump = numberOfMinutes;
      }

      numberOfMinutes -= timeToJump;

      if (!timeToJump && numberOfMinutes) {
        timeToJump = 1;
      }

      date = date[action](timeToJump, 'minute');
    }

    return date;
  }

  function subtractBusinessMinutes(minutesToSubtract: number): Dayjs {
    return addOrSubtractBusinessMinutes(this, minutesToSubtract, 'subtract');
  }

  function subtractBusinessHours(hoursToSubtract: number): Dayjs {
    const minutesToSubtract = hoursToSubtract * 60;
    return this.subtractBusinessMinutes(minutesToSubtract);
  }

  function subtractBusinessTime(
    timeToSubtract: number,
    businessUnit: BusinessUnitType,
  ) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return this.subtractBusinessMinutes(timeToSubtract);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return this.subtractBusinessHours(timeToSubtract);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return this.subtractBusinessDays(timeToSubtract);
    }

    throw new Error('Invalid Business Time Unit');
  }

  function fixDatesToCalculateDiff(base, comparator) {
    let from: Dayjs = base.clone();
    let to: Dayjs = comparator.clone();
    let multiplier = 1;

    if (base.isAfter(comparator)) {
      to = base.clone();
      from = comparator.clone();
      multiplier = -1;
    }

    if (!from.isBusinessTime()) {
      from = from.lastBusinessTime();
    }

    if (!to.isBusinessTime()) {
      to = to.nextBusinessTime();
    }

    return { from, to, multiplier };
  }

  function businessDaysDiff(comparator: Dayjs): number {
    let { from, to, multiplier } = fixDatesToCalculateDiff(this, comparator);
    let diff = 0;

    while (!from.isSame(to, 'day')) {
      diff += 1;
      from = from.addBusinessDays(1);
    }

    return diff ? diff * multiplier : 0;
  }

  function businessMinutesDiff(comparator: Dayjs): number {
    let { from, to, multiplier } = fixDatesToCalculateDiff(this, comparator);
    let diff = 0;

    const isSameDayfromTo = from.isSame(to, 'day');
    if (isSameDayfromTo) {
      const fromSegments = getBusinessTimeSegments(from);
      for (const segment of fromSegments) {
        const { start, end } = segment;

        if (
          to.isSameOrAfter(start) &&
          to.isSameOrBefore(end) &&
          from.isSameOrAfter(start) &&
          from.isSameOrBefore(end)
        ) {
          diff += to.diff(from, 'minutes');
          break;
        } else if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
          diff += to.diff(start, 'minutes');
          break;
        } else if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
          diff += end.diff(from, 'minutes');
        }
      }

      return diff ? diff * multiplier : 0;
    }

    let segments = getBusinessTimeSegments(from);
    for (const segment of segments) {
      const { start, end } = segment;

      if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
        diff += end.diff(from, 'minutes');
      } else if (start.isSameOrAfter(from)) {
        diff += end.diff(start, 'minutes');
      }
    }

    from = from.addBusinessDays(1);
    while (from.isBefore(to, 'day')) {
      segments = getBusinessTimeSegments(from);
      for (const segment of segments) {
        const { start, end } = segment;
        diff += end.diff(start, 'minutes');
      }

      from = from.addBusinessDays(1);
    }

    const toSegments = getBusinessTimeSegments(to);
    for (const segment of toSegments) {
      const { start, end } = segment;
      if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
        diff += to.diff(start, 'minutes');
      } else if (end.isSameOrBefore(to)) {
        diff += end.diff(start, 'minutes');
      }
    }

    return diff ? diff * multiplier : 0;
  }

  function businessHoursDiff(comparator: Dayjs): number {
    const minutesDiff = this.businessMinutesDiff(comparator);
    return minutesDiff / 60;
  }

  function businessTimeDiff(comparator: Dayjs, businessUnit: BusinessUnitType) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return this.businessMinutesDiff(comparator);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return this.businessHoursDiff(comparator);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return this.businessDaysDiff(comparator);
    }

    throw new Error('Invalid Business Time Unit');
  }

  // New functions on dayjs factory
  dayjsFactory.getHolidays = getHolidays;
  dayjsFactory.setHolidays = setHolidays;
  dayjsFactory.getBusinessTime = getBusinessTime;
  dayjsFactory.setBusinessTime = setBusinessTime;

  // New methods on Dayjs class
  DayjsClass.prototype.isHoliday = isHoliday;
  DayjsClass.prototype.isBusinessDay = isBusinessDay;
  DayjsClass.prototype.nextBusinessDay = nextBusinessDay;
  DayjsClass.prototype.lastBusinessDay = lastBusinessDay;
  DayjsClass.prototype.addBusinessDays = addBusinessDays;
  DayjsClass.prototype.subtractBusinessDays = subtractBusinessDays;
  DayjsClass.prototype.isBusinessTime = isBusinessTime;
  DayjsClass.prototype.nextBusinessTime = nextBusinessTime;
  DayjsClass.prototype.lastBusinessTime = lastBusinessTime;
  DayjsClass.prototype.addBusinessTime = addBusinessTime;
  DayjsClass.prototype.addBusinessHours = addBusinessHours;
  DayjsClass.prototype.addBusinessMinutes = addBusinessMinutes;
  DayjsClass.prototype.subtractBusinessMinutes = subtractBusinessMinutes;
  DayjsClass.prototype.subtractBusinessHours = subtractBusinessHours;
  DayjsClass.prototype.subtractBusinessTime = subtractBusinessTime;
  DayjsClass.prototype.businessMinutesDiff = businessMinutesDiff;
  DayjsClass.prototype.businessHoursDiff = businessHoursDiff;
  DayjsClass.prototype.businessDaysDiff = businessDaysDiff;
  DayjsClass.prototype.businessTimeDiff = businessTimeDiff;
};

const businessTimeStatic: PluginFunc = (
  option: any,
  DayjsClass: typeof Dayjs,
  dayjsFactory: typeof dayjs,
) => {
  dayjsFactory.extend(IsSameOrBefore);
  dayjsFactory.extend(IsSameOrAfter);

  function getDefaultWorkingHours() { return DEFAULT_WORKING_HOURS; }

  function isHoliday(date: Dayjs, { holidays }: BusinessOpts) {
    const today = date.format('YYYY-MM-DD');
    return holidays.includes(today);
  }

  function isBusinessDay(date: Dayjs, opts: BusinessOpts) {
    const dayName = DaysNames[date.day()];
    const isDefaultWorkingDay = !!(opts.businessHoursMap || DEFAULT_WORKING_HOURS)?.[dayName];

    return isDefaultWorkingDay && !dayjsFactory.isHoliday(date, opts);
  }

  function addOrsubtractBusinessDays(
    date: Dayjs,
    numberOfDays: number,
    action: 'add' | 'subtract' = 'add',
    opts: BusinessOpts
  ) {
    let daysToIterate = numberOfDays;
    let day = date.clone();

    while (daysToIterate) {
      day = day[action](1, 'day');
      if (dayjsFactory.isBusinessDay(day, opts)) {
        daysToIterate = daysToIterate - 1;
      }
    }

    return day;
  }

  function nextBusinessDay(date: Dayjs, opts: BusinessOpts) {
    return addOrsubtractBusinessDays(date, 1, 'add', opts);
  }

  function lastBusinessDay(date: Dayjs, opts: BusinessOpts) {
    return addOrsubtractBusinessDays(date, 1, 'subtract', opts);
  }

  function addBusinessDays(date: Dayjs, numberOfDays: number, opts: BusinessOpts) {
    return addOrsubtractBusinessDays(date, numberOfDays, 'add', opts);
  }

  function subtractBusinessDays(date: Dayjs, numberOfDays: number, opts: BusinessOpts) {
    return addOrsubtractBusinessDays(date, numberOfDays, 'subtract', opts);
  }

  function timeStringToDayJS(timeString: string, date: Dayjs = dayjs()) {
    const [hours, minutes, seconds] = <number[]>(
      (timeString.split(':') as unknown)
    );
    return date
      .clone()
      .hour(hours)
      .minute(minutes)
      .second(seconds)
      .millisecond(0);
  }

  function getBusinessTimeSegments(day: Dayjs, opts: BusinessOpts): BusinessTimeSegment[] {
    if (!dayjsFactory.isBusinessDay(day, opts)) {
      return null;
    }
    let date = day.clone();

    const dayName = DaysNames[date.day()];

    const businessHours = (opts.businessHoursMap || DEFAULT_WORKING_HOURS)[dayName];

    return businessHours.reduce((segments, businessTime) => {
      let { start, end } = businessTime;
      start = timeStringToDayJS(start, date);
      end = timeStringToDayJS(end, date);
      segments.push({ start, end });
      return segments;
    }, []);
  }

  function getCurrentBusinessTimeSegment(date: Dayjs, opts: BusinessOpts) {
    const businessSegments = getBusinessTimeSegments(date, opts);

    if (!businessSegments?.length) {
      return false;
    }

    return businessSegments.find((businessSegment) => {
      const { start, end } = businessSegment;
      return date.isSameOrAfter(start) && date.isSameOrBefore(end);
    });
  }

  function isBusinessTime(date: Dayjs, opts: BusinessOpts) {
    return !!getCurrentBusinessTimeSegment(date, opts);
  }

  function nextBusinessTime(date: Dayjs, opts: BusinessOpts) {
    if (!dayjsFactory.isBusinessDay(date, opts)) {
      const nextBusinessDay = dayjsFactory.nextBusinessDay(date, opts);
      return getBusinessTimeSegments(nextBusinessDay, opts)[0].start;
    }

    const segments = getBusinessTimeSegments(date, opts);

    for (let index = 0; index < segments.length; index++) {
      const { start, end } = segments[index];
      const isLastSegment = index === segments.length - 1;

      if (date.isBefore(start)) {
        return start;
      }

      if (date.isAfter(end)) {
        if (!isLastSegment) {
          continue;
        }

        const nextBusinessDay = dayjsFactory.nextBusinessDay(date, opts);
        return getBusinessTimeSegments(nextBusinessDay, opts)[0].start;
      }

      return date.clone();
    }
  }

  function lastBusinessTime(date: Dayjs, opts: BusinessOpts) {
    if (!dayjsFactory.isBusinessDay(date, opts)) {
      const lastBusinessDay = dayjsFactory.lastBusinessDay(date, opts);
      const { end } = getBusinessTimeSegments(lastBusinessDay, opts).pop();
      return end;
    }

    const segments = getBusinessTimeSegments(date, opts).reverse();

    for (let index = 0; index < segments.length; index++) {
      const { start, end } = segments[index];
      const isFirstSegment = index === segments.length - 1;

      if (date.isAfter(end)) {
        return end;
      }

      if (date.isBefore(start)) {
        if (!isFirstSegment) {
          continue;
        }

        const lastBusinessDay = dayjsFactory.lastBusinessDay(date, opts);
        return getBusinessTimeSegments(lastBusinessDay, opts).pop().end;
      }

      return date.clone();
    }
  }

  function addBusinessMinutes(date: Dayjs, minutesToAdd: number, opts: BusinessOpts): Dayjs {
    return addOrSubtractBusinessMinutes(date, minutesToAdd, 'add', opts);
  }

  function addBusinessHours(date: Dayjs, hoursToAdd: number, opts: BusinessOpts): Dayjs {
    const minutesToAdd = hoursToAdd * 60;
    return dayjsFactory.addBusinessMinutes(date, minutesToAdd, opts);
  }

  function addBusinessTime(date: Dayjs, timeToAdd: number, businessUnit: BusinessUnitType, opts: BusinessOpts) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return dayjsFactory.addBusinessMinutes(date, timeToAdd, opts);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return dayjsFactory.addBusinessHours(date, timeToAdd, opts);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return dayjsFactory.addBusinessDays(date, timeToAdd, opts);
    }

    throw new Error('Invalid Business Time Unit');
  }

  function addOrSubtractBusinessMinutes(
    date: Dayjs,
    numberOfMinutes: number,
    action: 'add' | 'subtract' = 'add',
    opts: BusinessOpts
  ): Dayjs {
    let newDate =
      action === 'add' ? dayjsFactory.nextBusinessTime(date, opts) : dayjsFactory.lastBusinessTime(date, opts);

    while (numberOfMinutes) {
      const segment = getCurrentBusinessTimeSegment(
        newDate,
        opts
      ) as BusinessTimeSegment;

      if (!segment) {
        newDate =
          action === 'add' ? dayjsFactory.nextBusinessTime(newDate, opts) : dayjsFactory.lastBusinessTime(newDate, opts);
        continue;
      }

      const { start, end } = segment;

      const compareBaseDate = action === 'add' ? end : newDate;
      const compareDate = action === 'add' ? newDate : start;

      let timeToJump = compareBaseDate.diff(compareDate, 'minute');

      if (timeToJump > numberOfMinutes) {
        timeToJump = numberOfMinutes;
      }

      numberOfMinutes -= timeToJump;

      if (!timeToJump && numberOfMinutes) {
        timeToJump = 1;
      }

      newDate = newDate[action](timeToJump, 'minute');
    }

    return newDate;
  }

  function subtractBusinessMinutes(date: Dayjs, minutesToSubtract: number, opts: BusinessOpts): Dayjs {
    return addOrSubtractBusinessMinutes(date, minutesToSubtract, 'subtract', opts);
  }

  function subtractBusinessHours(date: Dayjs, hoursToSubtract: number, opts: BusinessOpts): Dayjs {
    const minutesToSubtract = hoursToSubtract * 60;
    return dayjsFactory.subtractBusinessMinutes(date, minutesToSubtract, opts);
  }

  function subtractBusinessTime(
    date: Dayjs,
    timeToSubtract: number,
    businessUnit: BusinessUnitType,
    opts: BusinessOpts
  ) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return dayjsFactory.subtractBusinessMinutes(date, timeToSubtract, opts);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return dayjsFactory.subtractBusinessHours(date, timeToSubtract, opts);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return dayjsFactory.subtractBusinessDays(date, timeToSubtract, opts);
    }

    throw new Error('Invalid Business Time Unit');
  }

  function fixDatesToCalculateDiff(base: Dayjs, comparator: Dayjs, opts) {
    let from: Dayjs = base.clone();
    let to: Dayjs = comparator.clone();
    let multiplier = 1;

    if (base.isAfter(comparator)) {
      to = base.clone();
      from = comparator.clone();
      multiplier = -1;
    }

    if (!dayjsFactory.isBusinessTime(from, opts)) {
      from = dayjsFactory.lastBusinessTime(from, opts);
    }

    if (!dayjsFactory.isBusinessTime(to, opts)) {
      to = dayjsFactory.nextBusinessTime(to, opts);
    }

    return { from, to, multiplier };
  }

  function businessDaysDiff(date: Dayjs, comparator: Dayjs, opts: BusinessOpts): number {
    let { from, to, multiplier } = fixDatesToCalculateDiff(date, comparator, opts);
    let diff = 0;

    while (!from.isSame(to, 'day')) {
      diff += 1;
      from = dayjsFactory.addBusinessDays(from, 1, opts);
    }

    return diff ? diff * multiplier : 0;
  }

  function businessMinutesDiff(date: Dayjs, comparator: Dayjs, opts: BusinessOpts): number {
    let { from, to, multiplier } = fixDatesToCalculateDiff(date, comparator, opts);
    let diff = 0;

    const isSameDayfromTo = from.isSame(to, 'day');
    if (isSameDayfromTo) {
      const fromSegments = getBusinessTimeSegments(from, opts);
      for (const segment of fromSegments) {
        const { start, end } = segment;

        if (
          to.isSameOrAfter(start) &&
          to.isSameOrBefore(end) &&
          from.isSameOrAfter(start) &&
          from.isSameOrBefore(end)
        ) {
          diff += to.diff(from, 'minutes');
          break;
        } else if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
          diff += to.diff(start, 'minutes');
          break;
        } else if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
          diff += end.diff(from, 'minutes');
        }
      }

      return diff ? diff * multiplier : 0;
    }

    let segments = getBusinessTimeSegments(from, opts);
    for (const segment of segments) {
      const { start, end } = segment;

      if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
        diff += end.diff(from, 'minutes');
      } else if (start.isSameOrAfter(from)) {
        diff += end.diff(start, 'minutes');
      }
    }

    from = dayjsFactory.addBusinessDays(from, 1, opts);
    while (from.isBefore(to, 'day')) {
      segments = getBusinessTimeSegments(from, opts);
      for (const segment of segments) {
        const { start, end } = segment;
        diff += end.diff(start, 'minutes');
      }

      from = dayjsFactory.addBusinessDays(from, 1, opts);
    }

    const toSegments = getBusinessTimeSegments(to, opts);
    for (const segment of toSegments) {
      const { start, end } = segment;
      if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
        diff += to.diff(start, 'minutes');
      } else if (end.isSameOrBefore(to)) {
        diff += end.diff(start, 'minutes');
      }
    }

    return diff ? diff * multiplier : 0;
  }

  function businessHoursDiff(date: Dayjs, comparator: Dayjs, opts: BusinessOpts): number {
    const minutesDiff = dayjsFactory.businessMinutesDiff(date, comparator, opts);
    return minutesDiff / 60;
  }

  function businessTimeDiff(date: Dayjs, comparator: Dayjs, businessUnit: BusinessUnitType, opts: BusinessOpts) {
    if (businessUnit.match(/^(minute)+s?$/)) {
      return dayjsFactory.businessMinutesDiff(date, comparator, opts);
    }

    if (businessUnit.match(/^(hour)+s?$/)) {
      return dayjsFactory.businessHoursDiff(date, comparator, opts);
    }

    if (businessUnit.match(/^(day)+s?$/)) {
      return dayjsFactory.businessDaysDiff(date, comparator, opts);
    }

    throw new Error('Invalid Business Time Unit');
  }

  // New methods on Dayjs class
  dayjsFactory.getDefaultWorkingHours = getDefaultWorkingHours;
  dayjsFactory.isHoliday = isHoliday;
  dayjsFactory.isBusinessDay = isBusinessDay;
  dayjsFactory.nextBusinessDay = nextBusinessDay;
  dayjsFactory.lastBusinessDay = lastBusinessDay;
  dayjsFactory.addBusinessDays = addBusinessDays;
  dayjsFactory.subtractBusinessDays = subtractBusinessDays;
  dayjsFactory.isBusinessTime = isBusinessTime;
  dayjsFactory.nextBusinessTime = nextBusinessTime;
  dayjsFactory.lastBusinessTime = lastBusinessTime;
  dayjsFactory.addBusinessTime = addBusinessTime;
  dayjsFactory.addBusinessHours = addBusinessHours;
  dayjsFactory.addBusinessMinutes = addBusinessMinutes;
  dayjsFactory.subtractBusinessMinutes = subtractBusinessMinutes;
  dayjsFactory.subtractBusinessHours = subtractBusinessHours;
  dayjsFactory.subtractBusinessTime = subtractBusinessTime;
  dayjsFactory.businessMinutesDiff = businessMinutesDiff;
  dayjsFactory.businessHoursDiff = businessHoursDiff;
  dayjsFactory.businessDaysDiff = businessDaysDiff;
  dayjsFactory.businessTimeDiff = businessTimeDiff;
};

export default businessTime;
export { businessTime, businessTimeStatic };
const mod: any = module.exports = businessTime;
mod.businessTime = businessTime;
mod.businessTimeStatic = businessTimeStatic;
