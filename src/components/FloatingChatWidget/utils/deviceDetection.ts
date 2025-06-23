export class DeviceDetection {
  static isMobile(): boolean {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  }

  static isTouchDevice(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  static supportsVibration(): boolean {
    return "vibrate" in navigator;
  }
}
