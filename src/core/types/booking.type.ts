import { Calendar, Event, NavigateAction, View } from 'react-big-calendar';

export type BookingStatus = 'booked' | 'cancelled';

export type BookingMode = 'list' | 'date';
export type CalendarRef = Calendar<BookingEvent, object> & {
  handleNavigate: (action: NavigateAction, date: Date) => void;
  handleViewChange: (view: View) => void;
};

export type BookingEvent = Event & {
  status: BookingStatus;
  location_name: string;
  price: string;
  time: string;
};

export type ActionToolBar = {
  action: NavigateAction;
  label: React.ReactNode;
};

export type Booking = {
  id: number;
  guestName: string;
  customer_id: number;
  parking_lot_id: number;
  price: string;
  date_time: string;
  time_in: string;
  time_out: string;
  status: BookingStatus;
  customer_name: string;
  location_name: string;
};
