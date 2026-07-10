export interface LogEntry {
  date: string; // 'YYYY-MM-DD'
  kind: 'marker' | 'hours';
  value: number; // marker: always 1. hours: whole-number hour count
}
