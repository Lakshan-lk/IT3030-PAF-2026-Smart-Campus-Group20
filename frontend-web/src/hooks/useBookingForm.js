import { useState } from 'react';
import { useCreateBooking } from './useBookings';

const DEFAULT_FORM = {
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
  attendees: '',
};

export const useBookingForm = ({ onSuccess, initialDate = '', initialStartTime = '', initialEndTime = '', userId } = {}) => {
  const [bookingData, setBookingData] = useState({
    ...DEFAULT_FORM,
    date: initialDate,
    startTime: initialStartTime,
    endTime: initialEndTime,
  });
  const [conflictError, setConflictError] = useState('');
  const createBooking = useCreateBooking();

  const reset = () => {
    setBookingData({ ...DEFAULT_FORM });
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
    bookingData.attendees >= 1;

  const submit = async (resourceId) => {
    if (!isValid()) return;
    const fmt = t => t.split(':').length === 2 ? `${t}:00` : t;
    const payload = {
      resourceId,
      userId: userId,
      purpose: bookingData.purpose,
      attendees: parseInt(bookingData.attendees),
      startTime: `${bookingData.date}T${fmt(bookingData.startTime)}`,
      endTime: `${bookingData.date}T${fmt(bookingData.endTime)}`,
      recurring: false,
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
    conflictError,
    handleChange,
    isValid,
    submit,
    isPending: createBooking.isPending,
  };
};
