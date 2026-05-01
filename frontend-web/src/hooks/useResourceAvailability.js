import { useBookings } from './useBookings';
import { useAllEquipmentBookings } from './useEquipmentBooking';

// Business hours: 8 AM – 6 PM (slots on the hour)
const BUSINESS_START = 8;
const BUSINESS_END   = 18; // exclusive

/**
 * Given a list of active bookings for a resource, returns helpers for
 * checking availability on a specific date.
 */
export const useResourceAvailability = (resourceId) => {
  const { data: allBookings = [], isLoading } = useBookings(
    resourceId ? { resourceId } : {}
  );

  // Only PENDING and APPROVED bookings block a slot
  const activeBookings = allBookings.filter(
    b => b.status === 'PENDING' || b.status === 'APPROVED'
  );

  /**
   * Returns an array of { startHour, endHour } for all bookings on `date`.
   * date: string 'YYYY-MM-DD'
   */
  const getBookedRangesForDate = (date) => {
    if (!date) return [];
    return activeBookings
      .filter(b => {
        const start = new Date(b.startTime);
        const y = start.getFullYear();
        const m = String(start.getMonth() + 1).padStart(2, '0');
        const d = String(start.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === date;
      })
      .map(b => ({
        startHour: new Date(b.startTime).getHours(),
        endHour:   new Date(b.endTime).getHours(),
        label: `${fmt(new Date(b.startTime).getHours())} – ${fmt(new Date(b.endTime).getHours())}`,
      }));
  };

  /**
   * Returns true if the given HH:00 start slot is already taken on `date`.
   * A slot is taken when it falls within [startHour, endHour) of any booking.
   */
  const isStartSlotBooked = (timeValue, date) => {
    if (!timeValue || !date) return false;
    const hour = parseInt(timeValue.split(':')[0]);
    return getBookedRangesForDate(date).some(r => hour >= r.startHour && hour < r.endHour);
  };

  /**
   * Returns true if choosing endTime `timeValue` would overlap with an
   * existing booking on `date` given that startTime is `startValue`.
   */
  const isEndSlotConflicting = (startValue, endValue, date) => {
    if (!startValue || !endValue || !date) return false;
    const startHour = parseInt(startValue.split(':')[0]);
    const endHour   = parseInt(endValue.split(':')[0]);
    return getBookedRangesForDate(date).some(r => {
      // overlap: proposed [startHour, endHour) intersects booked [r.startHour, r.endHour)
      return startHour < r.endHour && endHour > r.startHour;
    });
  };

  /**
   * Returns 'full' | 'partial' | 'free' for a given date.
   */
  const getDayStatus = (date) => {
    const ranges = getBookedRangesForDate(date);
    if (ranges.length === 0) return 'free';
    let bookedHours = 0;
    for (let h = BUSINESS_START; h < BUSINESS_END; h++) {
      if (ranges.some(r => h >= r.startHour && h < r.endHour)) bookedHours++;
    }
    if (bookedHours >= BUSINESS_END - BUSINESS_START) return 'full';
    return 'partial';
  };

  /**
   * Returns an array of { date, status } for the next `days` days.
   */
  const getAvailabilityStrip = (days = 14) => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      result.push({ date: dateStr, status: getDayStatus(dateStr), dayObj: d });
    }
    return result;
  };

  return {
    isLoading,
    getBookedRangesForDate,
    isStartSlotBooked,
    isEndSlotConflicting,
    getDayStatus,
    getAvailabilityStrip,
  };
};

// Helper: format hour -> "8:00 AM"
const fmt = (hour) => {
  if (hour === 0)  return '12:00 AM';
  if (hour < 12)   return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
};

/**
 * Same availability logic but for equipment.
 */
export const useEquipmentAvailability = (equipmentId) => {
  const { data: allBookingsData, isLoading } = useAllEquipmentBookings();
  const allBookings = Array.isArray(allBookingsData?.content) 
    ? allBookingsData.content 
    : (Array.isArray(allBookingsData) ? allBookingsData : []);

  // Filter for the specific equipment
  const equipmentBookings = allBookings.filter(b => b.equipmentId === equipmentId);

  const activeBookings = equipmentBookings.filter(
    b => b.status === 'PENDING' || b.status === 'APPROVED'
  );

  const getBookedRangesForDate = (date) => {
    if (!date) return [];
    return activeBookings
      .filter(b => {
        const start = new Date(b.startTime);
        const y = start.getFullYear();
        const m = String(start.getMonth() + 1).padStart(2, '0');
        const d = String(start.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === date;
      })
      .map(b => ({
        startHour: new Date(b.startTime).getHours(),
        endHour:   new Date(b.endTime).getHours(),
        label: `${fmt(new Date(b.startTime).getHours())} – ${fmt(new Date(b.endTime).getHours())}`,
      }));
  };

  const isStartSlotBooked = (timeValue, date) => {
    if (!timeValue || !date) return false;
    const hour = parseInt(timeValue.split(':')[0]);
    return getBookedRangesForDate(date).some(r => hour >= r.startHour && hour < r.endHour);
  };

  const isEndSlotConflicting = (startValue, endValue, date) => {
    if (!startValue || !endValue || !date) return false;
    const startHour = parseInt(startValue.split(':')[0]);
    const endHour   = parseInt(endValue.split(':')[0]);
    return getBookedRangesForDate(date).some(r => {
      return startHour < r.endHour && endHour > r.startHour;
    });
  };

  const getDayStatus = (date) => {
    const ranges = getBookedRangesForDate(date);
    if (ranges.length === 0) return 'free';
    let bookedHours = 0;
    for (let h = BUSINESS_START; h < BUSINESS_END; h++) {
      if (ranges.some(r => h >= r.startHour && h < r.endHour)) bookedHours++;
    }
    if (bookedHours >= BUSINESS_END - BUSINESS_START) return 'full';
    return 'partial';
  };

  const getAvailabilityStrip = (days = 14) => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      result.push({ date: dateStr, status: getDayStatus(dateStr), dayObj: d });
    }
    return result;
  };

  return {
    isLoading,
    getBookedRangesForDate,
    isStartSlotBooked,
    isEndSlotConflicting,
    getDayStatus,
    getAvailabilityStrip,
  };
};
