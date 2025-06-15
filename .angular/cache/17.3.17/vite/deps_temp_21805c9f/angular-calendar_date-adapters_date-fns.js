import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  differenceInDays,
  differenceInMinutes,
  differenceInSeconds,
  endOfDay,
  endOfMonth,
  endOfWeek,
  getDate,
  getDay,
  getHours,
  getISOWeek,
  getMinutes,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  isSameSecond,
  max,
  setDate,
  setHours,
  setMinutes,
  setMonth,
  setYear,
  startOfDay,
  startOfMinute,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from "./chunk-SP7ZFE23.js";
import {
  __assign
} from "./chunk-Q3XVAEG4.js";
import "./chunk-3OV72XIM.js";

// node_modules/calendar-utils/date-adapters/esm/date-fns/index.js
function getTimezoneOffset(date) {
  return new Date(date).getTimezoneOffset();
}
function adapterFactory() {
  return {
    addDays,
    addHours,
    addMinutes,
    addSeconds,
    differenceInDays,
    differenceInMinutes,
    differenceInSeconds,
    endOfDay,
    endOfMonth,
    endOfWeek,
    getDay,
    getMonth,
    isSameDay,
    isSameMonth,
    isSameSecond,
    max,
    setHours,
    setMinutes,
    startOfDay,
    startOfMinute,
    startOfMonth,
    startOfWeek,
    getHours,
    getMinutes,
    getTimezoneOffset
  };
}

// node_modules/angular-calendar/date-adapters/esm/date-fns/index.js
function adapterFactory2() {
  return __assign(__assign({}, adapterFactory()), { addWeeks, addMonths, subDays, subWeeks, subMonths, getISOWeek, setDate, setMonth, setYear, getDate, getYear });
}
export {
  adapterFactory2 as adapterFactory
};
//# sourceMappingURL=angular-calendar_date-adapters_date-fns.js.map
