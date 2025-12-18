
export type Category = 'Attraction' | 'Food' | 'Transport' | 'Stay' | 'Other';

export interface TripMember {
  id: string;
  name: string;
  avatar: string;
}

export interface ScheduleItem {
  id: string;
  dayIndex: number;
  time: string;
  title: string;
  location: string;
  category: Category;
  notes?: string;
  photo?: string;
  distanceInfo?: string; // e.g. "2.4km, 15 min walk"
}

export interface Booking {
  id: string;
  type: 'Flight' | 'Hotel' | 'Car' | 'Restaurant' | 'Amusement' | 'Ticket';
  title: string;
  details: any;
  cost: number;
  imageUrl?: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: 'JPY' | 'HKD' | 'AUD';
  category: string;
  paidBy: string; // Member ID
  splitWith: string[]; // Array of Member IDs
  date: string;
}

export interface JournalPost {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  date: string;
}

export interface PlanningItem {
  id: string;
  type: 'Packing' | 'Shopping';
  title: string;
  assignedTo: string; // 'All' or Member ID
  completed: boolean;
}

export interface TripConfig {
  startDate: string;
  duration: number;
  tripName: string;
  region: string;
}
