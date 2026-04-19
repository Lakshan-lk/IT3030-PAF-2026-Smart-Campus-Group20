package com.campushub.smartcampus.dto;

public class CancelSeriesResponse {

    private int cancelled;

    public CancelSeriesResponse() {}

    public CancelSeriesResponse(int cancelled) {
        this.cancelled = cancelled;
    }

    public int getCancelled() {
        return cancelled;
    }

    public void setCancelled(int cancelled) {
        this.cancelled = cancelled;
    }
}