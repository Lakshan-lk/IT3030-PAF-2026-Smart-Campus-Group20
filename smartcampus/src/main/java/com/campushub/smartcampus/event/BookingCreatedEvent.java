package com.campushub.smartcampus.event;

import com.campushub.smartcampus.entity.Booking;
import org.springframework.context.ApplicationEvent;

public class BookingCreatedEvent extends ApplicationEvent {
    private final Booking booking;
    
    public BookingCreatedEvent(Object source, Booking booking) {
        super(source);
        this.booking = booking;
    }
    
    public Booking getBooking() {
        return booking;
    }
}