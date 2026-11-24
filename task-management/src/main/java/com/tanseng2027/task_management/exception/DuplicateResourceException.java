package com.tanseng2027.task_management.exception;

/**
 * Dữ liệu bị trùng (vd: email đã được đăng ký) → HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
