import { useState } from 'react';
import { useCreateBooking } from './useBookings';

const DEFAULT_FORM = {
  userId: 2,
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
  attendees: '',
  isRecurring: false,
  recurrencePattern: 'WEEKLY',
  recurrenceEndDate: '',
  skipDates: [],
  requestedEquipmentIds: [],
};

export const useBookingForm = ({ onSuccess, initialDate = '', initialStartTime = '', initialEndTime = '' } = {}) => {
  const [bookingData, setBookingData] = useState({
    ...DEFAULT_FORM,
    date: initialDate,
    startTime: initialStartTime,
    endTime: initialEndTime,
  });
  const [skipDateInput, setSkipDateInput] = useState('');
  const [conflictError, setConflictError] = useState('');
  const createBooking = useCreateBooking();

  const reset = () => {
    setBookingData({ ...DEFAULT_FORM });
    setSkipDateInput('');
    setConflictError('');
  };

  const addSkipDate = () => {
    if (skipDateInput && !bookingData.skipDates.includes(skipDateInput)) {
      setBookingData(prev => ({ ...prev, skipDates: [...prev.skipDates, skipDateInput].sort() }));
      setSkipDateInput('');
    }
  };

  const removeSkipDate = (date) =>
    setBookingData(prev => ({ ...prev, skipDates: prev.skipDates.filter(d => d !== date) }));

  const toggleEquipment = (id) =>
    setBookingData(prev => ({
      ...prev,
      requestedEquipmentIds: prev.requestedEquipmentIds.includes(id)
        ? prev.requestedEquipmentIds.filter(e => e !== id)
        : [...prev.requestedEquipmentIds, id],
    }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setConflictError('');
  };

  const isValid = () =>
    bookingData.date &&
    bookingData.startTime &&
    bookingData.endTime &&
    bookingData.startTime < bookingData.endTime &&
    bookingData.purpose.trim() &&
    bookingData.attendees >= 1 &&
    (!bookingData.isRecurring || bookingData.recurrenceEndDate);

  const submit = async (resourceId) => {
    if (!isValid()) return;
    const fmt = t => t.split(':').length === 2 ? `${t}:00` : t;
    const payload = {
      resourceId,
      userId: bookingData.userId,
      purpose: bookingData.purpose,
      attendees: parseInt(bookingData.attendees),
      startTime: `${bookingData.date}T${fmt(bookingData.startTime)}`,
      endTime: `${bookingData.date}T${fmt(bookingData.endTime)}`,
      recurring: bookingData.isRecurring,
      recurrencePattern: bookingData.isRecurring ? bookingData.recurrencePattern : null,
      recurrenceEndDate: bookingData.isRecurring && bookingData.recurrenceEndDate
        ? `${bookingData.recurrenceEndDate}T23:59:59` : null,
      skipDates: bookingData.isRecurring && bookingData.skipDates.length > 0 ? bookingData.skipDates : [],
      requestedEquipmentIds: bookingData.requestedEquipmentIds.length > 0 ? bookingData.requestedEquipmentIds : [],
    };
    try {
      await createBooking.mutateAsync(payload);
      reset();
      onSuccess?.();
    } catch (err) {
      const s = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error || 'Booking failed.';
      if (s === 409) setConflictError(msg || 'Time slot already booked.');
      else if (s === 400 || s === 422) setConflictError(msg || 'Invalid input.');
      else if (s === 404) setConflictError(msg || 'Resource not found.');
      else setConflictError(msg);
    }
  };

  return {
    bookingData,
    setBookingData,
    skipDateInput,
    setSkipDateInput,
    conflictError,
    addSkipDate,
    removeSkipDate,
    toggleEquipment,
    handleChange,
    isValid,
    submit,
    isPending: createBooking.isPending,
  };
};
