const VI_WEEKDAYS = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

const EN_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Formats relative time (e.g. "Vừa xong", "5 phút", "2 giờ", "3 ngày" or "Just now", "5m", "2h", "3d")
 */
export function formatTimeAgo(
  dateInput: string | Date | number,
  isVi: boolean = true,
): string {
  try {
    const now = new Date();
    const past = new Date(dateInput);
    if (isNaN(past.getTime())) return '';

    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 1) {
      return isVi ? 'Vừa xong' : 'Just now';
    }

    if (diffInMinutes < 60) {
      return isVi ? `${diffInMinutes} phút` : `${diffInMinutes}m`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return isVi ? `${diffInHours} giờ` : `${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return isVi ? `${diffInDays} ngày` : `${diffInDays}d`;
    }

    const day = String(past.getDate()).padStart(2, '0');
    const month = String(past.getMonth() + 1).padStart(2, '0');
    const year = past.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

/**
 * Formats full datetime string with translated weekday, day, month, year, and time
 * Example: "Thứ Hai, 21/09/2026 lúc 11:00" or "Monday, 21/09/2026 at 11:00"
 */
export function formatFullDateTime(
  dateInput: string | Date | number,
  isVi: boolean = true,
): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    const dayOfWeek = isVi ? VI_WEEKDAYS[d.getDay()] : EN_WEEKDAYS[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    if (isVi) {
      return `${dayOfWeek}, ${day}/${month}/${year} lúc ${hours}:${minutes}`;
    } else {
      return `${dayOfWeek}, ${day}/${month}/${year} at ${hours}:${minutes}`;
    }
  } catch {
    return '';
  }
}

/**
 * Formats time only string (e.g. "11:00", "09:15")
 */
export function formatTimeOnly(dateInput: string | Date | number): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '';
  }
}
