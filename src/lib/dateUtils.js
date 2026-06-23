import { formatDistanceToNowStrict } from 'date-fns';
import {
  formatDueInTz,
  isOverdueInTz,
  isTodayInTz,
  toDatetimeLocalInTz,
  fromDatetimeLocalInTz,
  formatTime,
  parseMomentTime,
} from './timezone';

export { parseMomentTime };

export function formatDue(dateInput) {
  return formatDueInTz(dateInput);
}

export function isOverdue(dateInput, status) {
  return isOverdueInTz(dateInput, status);
}

export function isToday(dateInput) {
  return isTodayInTz(dateInput);
}

export function minutesToHuman(mins) {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function elapsedSince(dateInput) {
  if (!dateInput) return '';
  return formatDistanceToNowStrict(new Date(dateInput));
}

// mm:ss or h:mm:ss live readout for the running timer widget
export function liveStopwatch(startDate, nowDate = new Date()) {
  const ms = Math.max(0, nowDate.getTime() - new Date(startDate).getTime());
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// For <input type="datetime-local"> — converts a UTC date to local wall-clock value
export function toDatetimeLocalValue(dateInput) {
  return toDatetimeLocalInTz(dateInput);
}

// Parses the string from <input type="datetime-local"> back to a UTC Date
export function fromDatetimeLocalValue(localStr) {
  return fromDatetimeLocalInTz(localStr);
}

// Format just the time portion (HH:mm) in user's timezone — used by calendar
export function formatTimeOnly(dateInput) {
  return formatTime(dateInput);
}
