export const DEFAULT_DAYS = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
};

export function sortPeriods(a: Period, b: Period) {
  return a.start > b.start
    ? 1
    : a.start === b.start
    ? a.end < b.end
      ? 1
      : a.id > b.id
      ? 1
      : -1
    : -1;
}

export function arePeriodsEqual(p1: Period, p2: Period): boolean {
  return (
    p1.id === p2.id &&
    p1.start === p2.start &&
    p1.end === p2.end &&
    p1.target === p2.target &&
    // compare days object property
    p1.days.monday === p2.days.monday &&
    p1.days.tuesday === p2.days.tuesday &&
    p1.days.wednesday === p2.days.wednesday &&
    p1.days.thursday === p2.days.thursday &&
    p1.days.friday === p2.days.friday &&
    p1.days.saturday === p2.days.saturday &&
    p1.days.sunday === p2.days.sunday
  );
}

export function arePeriodArrsEqual(
  arr1: Period[] | undefined,
  arr2: Period[]
): boolean {
  if (arr1 === undefined) return true;
  if (arr1.length !== arr2.length) return false;

  for (const p1 of arr1) {
    if (!arr2.some((p2) => arePeriodsEqual(p1, p2))) {
      return false;
    }
  }

  return true;
}
