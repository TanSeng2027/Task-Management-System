package com.tanseng2027.task_management.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Format JSON thống nhất cho mọi lỗi trả về từ API.
 *
 * @param errors chi tiết lỗi theo từng field (chỉ có khi lỗi validation), null nếu không có
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> errors) {

    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(LocalDateTime.now(), status, error, message, null);
    }

    public static ErrorResponse of(int status, String error, String message, Map<String, String> errors) {
        return new ErrorResponse(LocalDateTime.now(), status, error, message, errors);
    }
}
