package com.tanseng2027.task_management.exception;

/**
 * Không tìm thấy dữ liệu (hoặc dữ liệu không thuộc về user hiện tại) → HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
