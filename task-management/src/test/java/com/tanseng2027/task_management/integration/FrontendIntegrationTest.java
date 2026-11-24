package com.tanseng2027.task_management.integration;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Frontend là file tĩnh trong resources/static: phải tải được khi CHƯA đăng nhập,
 * còn dữ liệu thì vẫn được bảo vệ bởi các API /api/** (đã test ở các class khác).
 */
class FrontendIntegrationTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("Trang chủ / chuyển tới index.html mà không cần token")
    void rootServesIndex() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("index.html"));
    }

    @Test
    @DisplayName("index.html, CSS, JS, favicon tải được mà không cần token")
    void staticAssetsArePublic() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Task Manager")));
        mockMvc.perform(get("/css/app.css")).andExpect(status().isOk());
        mockMvc.perform(get("/js/app.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/api.js")).andExpect(status().isOk());
        mockMvc.perform(get("/favicon.svg")).andExpect(status().isOk());
    }
}
