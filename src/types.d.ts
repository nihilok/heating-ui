interface Days {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

interface Period {
  id: string;
  start: number;
  end: number;
  target: number;
  days: Days;
}

interface System {
  system_id: string;
  periods: Period[];
  advance?: string;
  boost?: string;
  program: boolean;
  is_within_period: boolean;
}
