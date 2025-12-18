
import { TripMember, ScheduleItem, TripConfig } from './types';

export const COLORS = {
  stitch: '#6EC1E4',
  donald: '#FFD966',
  navy: '#1F3C88',
  cream: '#F8F9F5',
  attraction: '#A3D166',
  food: '#FF9E9E',
  transport: '#6EC1E4',
  stay: '#FFD966'
};

export const MOCK_MEMBERS: TripMember[] = [
  { id: '1', name: 'Stitch', avatar: 'https://picsum.photos/seed/stitch/200' },
  { id: '2', name: 'Donald', avatar: 'https://picsum.photos/seed/donald/200' },
  { id: '3', name: 'Lilo', avatar: 'https://picsum.photos/seed/lilo/200' },
  { id: '4', name: 'Daisy', avatar: 'https://picsum.photos/seed/daisy/200' }
];

export const MOCK_TRIP_CONFIG: TripConfig = {
  startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
  duration: 5,
  tripName: 'Tokyo Adventure 2024',
  region: 'Tokyo, Japan'
};

export const CURRENCY_RATES = {
  JPY: 1,
  HKD: 19,
  AUD: 95
};
