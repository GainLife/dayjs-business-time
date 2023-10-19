import { PluginFunc } from 'dayjs'

declare const plugin: PluginFunc
export default plugin;
export const businessTime: PluginFunc;
export const businessTimeStatic: PluginFunc;

declare module 'dayjs' {
  export function getDefaultWorkingHours(): BusinessHoursMap
  export function getHolidays(): string[];
  export function setHolidays(holidays: string[]): void;
  export function getBusinessTime(): BusinessHoursMap;
  export function setBusinessTime(businessHours: BusinessHoursMap): void;

  export type BusinessUnitType = 'minute' | 'minutes' | 'hour' | 'hours' | 'day' | 'days';
  export type BusinessOpts = {
    businessHoursMap?: BusinessHoursMap,
    holidays?: string[]
  }

  export function isBusinessDay(date: Dayjs, opt: BusinessOpts): boolean;
  export function isHoliday(date: Dayjs, opt: BusinessOpts): boolean;
  export function nextBusinessDay(date: Dayjs, opt: BusinessOpts): Dayjs;
  export function lastBusinessDay(date: Dayjs, opt: BusinessOpts): Dayjs;
  export function isBusinessTime(date: Dayjs, opt: BusinessOpts): boolean;
  export function nextBusinessTime(date: Dayjs, opt: BusinessOpts): Dayjs;
  export function lastBusinessTime(date: Dayjs, opt: BusinessOpts): Dayjs;
  export function addBusinessDays(date: Dayjs, numberOfDays: number, opt: BusinessOpts): Dayjs;
  export function subtractBusinessDays(date: Dayjs, numberOfDays: number, opt: BusinessOpts): Dayjs;
  export function addBusinessHours(date: Dayjs, numberOfHours: number, opt: BusinessOpts): Dayjs;
  export function addBusinessMinutes(date: Dayjs, numberOfMinutes: number, opt: BusinessOpts): Dayjs;
  export function addBusinessTime(date: Dayjs, timeToAdd: number, businessUnit: BusinessUnitType, opt: BusinessOpts): Dayjs;
  export function subtractBusinessMinutes(date: Dayjs, numberOfMinutes: number, opt: BusinessOpts): Dayjs;
  export function subtractBusinessHours(date: Dayjs, numberOfHours: number, opt: BusinessOpts): Dayjs;
  export function subtractBusinessTime(date: Dayjs, timeToSubtract: number, businessUnit: BusinessUnitType, opt: BusinessOpts): Dayjs;
  export function businessMinutesDiff(date: Dayjs, comparator: Dayjs, opt: BusinessOpts): number;
  export function businessHoursDiff(date: Dayjs, comparator: Dayjs, opt: BusinessOpts): number;
  export function businessDaysDiff(date: Dayjs, comparator: Dayjs, opt: BusinessOpts): number;
  export function businessTimeDiff(date: Dayjs, comparator: Dayjs, businessUnit: BusinessUnitType, opt: BusinessOpts): number;

  export interface Dayjs {
    isBusinessDay(): boolean,
    isHoliday(): boolean,
    nextBusinessDay(): Dayjs,
    lastBusinessDay(): Dayjs,
    isBusinessTime(): boolean,
    nextBusinessTime(): Dayjs,
    lastBusinessTime(): Dayjs,
    addBusinessDays(numberOfDays: number): Dayjs,
    subtractBusinessDays(numberOfDays: number): Dayjs,
    addBusinessHours(numberOfHours: number): Dayjs,
    addBusinessMinutes(numberOfMinutes: number): Dayjs,
    addBusinessTime(timeToAdd: number, businessUnit: BusinessUnitType): Dayjs,
    subtractBusinessMinutes(numberOfMinutes: number): Dayjs;
    subtractBusinessHours(numberOfHours: number): Dayjs,
    subtractBusinessTime(timeToSubtract: number, businessUnit: BusinessUnitType): Dayjs,
    businessMinutesDiff(comparator: Dayjs): number
    businessHoursDiff(comparator: Dayjs): number
    businessDaysDiff(comparator: Dayjs): number
    businessTimeDiff(comparator: Dayjs, businessUnit: BusinessUnitType): number,
  }
  export interface BusinessHoursMap {
    sunday: BusinessHours[] | null;
    monday: BusinessHours[] | null;
    tuesday: BusinessHours[] | null;
    wednesday: BusinessHours[] | null;
    thursday: BusinessHours[] | null;
    friday: BusinessHours[] | null;
    saturday: BusinessHours[] | null;
  }

  export interface BusinessHours {
    start: string,
    end: string
  }

  export interface BusinessTimeSegment {
    start: Dayjs;
    end: Dayjs;
  }

  export interface ILocale {
    holidays: string[],
    businessHours: BusinessHoursMap,
  }
}
