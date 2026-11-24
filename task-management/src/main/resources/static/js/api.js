/**
 * Gọi REST API của backend.
 * - Tự gắn header "Authorization: Bearer <token>"
 * - Lỗi từ server (ErrorResponse) được chuyển thành ApiError có message + lỗi từng field
 * - Gặp 401 trên API cần đăng nhập → xóa token, bắn sự kiện "auth:expired" để quay về màn hình đăng nhập
 */

const TOKEN_KEY = 'taskManager.token';
const USER_KEY = 'taskManager.user';

export class ApiError extends Error {
  constructor(status, message, fieldErrors = null) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors; // { title: "Tiêu đề không được để trống", ... }
  }
}

// localStorage có thể bị chặn (chế độ riêng tư...) nên luôn bọc try/catch
export const auth = {
  get token() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  /** Lưu kết quả đăng nhập (AuthResponse): token + thông tin user để hiển thị. */
  save(authResponse) {
    try {
      localStorage.setItem(TOKEN_KEY, authResponse.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify({
        email: authResponse.email,
        fullName: authResponse.fullName,
      }));
    } catch { /* bỏ qua */ }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch { /* bỏ qua */ }
  },
  /** { email, fullName } của user đang đăng nhập. Chỉ để hiển thị, không dùng để phân quyền. */
  get user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || { email: '', fullName: '' };
    } catch {
      return { email: '', fullName: '' };
    }
  },
};

const DEFAULT_MESSAGES = {
  400: 'Dữ liệu không hợp lệ',
  401: 'Bạn cần đăng nhập',
  403: 'Bạn không có quyền thực hiện thao tác này',
  404: 'Không tìm thấy dữ liệu',
  409: 'Dữ liệu bị trùng',
  500: 'Server gặp lỗi, vui lòng thử lại sau',
};

/**
 * @param {string} path      ví dụ "/api/tasks"
 * @param {object} options   { method, body, query, requireAuth }
 */
export async function api(path, { method = 'GET', body, query, requireAuth = true } = {}) {
  const url = new URL(path, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    }
  }

  const headers = { Accept: 'application/json, text/plain' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (requireAuth && auth.token) headers.Authorization = `Bearer ${auth.token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được tới server');
  }

  if (response.status === 401 && requireAuth) {
    auth.clear();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new ApiError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
  }

  if (!response.ok) {
    let data = null;
    try { data = await response.json(); } catch { /* body rỗng hoặc không phải JSON */ }
    throw new ApiError(
      response.status,
      data?.message || DEFAULT_MESSAGES[response.status] || `Lỗi ${response.status}`,
      data?.errors || null,
    );
  }

  // Đọc dạng text trước rồi mới parse: một số API (vd: register) trả chuỗi thường,
  // nhưng có thể bị gắn Content-Type application/json tùy header Accept.
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    try { return JSON.parse(text); } catch { /* không phải JSON hợp lệ → trả về text */ }
  }
  return text;
}
