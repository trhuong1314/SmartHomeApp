// Định nghĩa kiểu dữ liệu
export type ParsedMessage =
  | {type: 'STATUS'; data: StatusData}
  | {type: 'ACK'; command: string}
  | {type: 'NACK'; command: string; error: string}
  | {type: 'EVENT'; event: string; data: any}
  | {type: 'UNKNOWN'; raw: string};

export type StatusData = {
  temperature?: number;
  humidity?: number;
  light?: number;
  gas?: number;
  lock?: string;
  fan?: string;
  curtain?: number;
  time?: string;
};

class ProtocolParser {
  /**
   * Phân tích 1 message từ MCU
   * Ví dụ: "STATUS:T=28.5:H=65.2:LUX=120:GAS=350:LOCK=ON:FAN=OFF:CUR=50:TIME=20:15:30"
   */
  parse(message: string): ParsedMessage {
    // Xóa khoảng trắng, newline
    const cleaned = message.trim();
    if (!cleaned) {
      return {type: 'UNKNOWN', raw: message};
    }

    // Tách theo dấu ':'
    const parts = cleaned.split(':');
    const header = parts[0].toUpperCase();

    // Xử lý STATUS
    if (header === 'STATUS') {
      const data: StatusData = {};
      // Duyệt các phần sau "STATUS:"
      for (let i = 1; i < parts.length; i++) {
        const pair = parts[i].split('=');
        if (pair.length !== 2) {
          continue;
        }
        const key = pair[0].toUpperCase();
        const value = pair[1];

        switch (key) {
          case 'T':
            data.temperature = parseFloat(value);
            break;
          case 'H':
            data.humidity = parseFloat(value);
            break;
          case 'LUX':
            data.light = parseFloat(value);
            break;
          case 'GAS':
            data.gas = parseFloat(value);
            break;
          case 'LOCK':
            data.lock = value; // "ON" hoặc "OFF"
            break;
          case 'FAN':
            data.fan = value;
            break;
          case 'CUR':
            data.curtain = parseFloat(value);
            break;
          case 'TIME':
            // TIME=20:15:30 → nhưng split(':') đã tách rồi
            // Cần ghép lại
            data.time = `${value}:${parts[i + 1] || '00'}:${
              parts[i + 2] || '00'
            }`;
            i += 2; // Bỏ qua 2 phần tiếp theo
            break;
        }
      }
      return {type: 'STATUS', data};
    }

    // Xử lý ACK
    if (header === 'ACK') {
      // ACK:LOCK:OPEN → command = "LOCK:OPEN"
      const command = parts.slice(1).join(':');
      return {type: 'ACK', command};
    }

    // Xử lý NACK
    if (header === 'NACK') {
      // NACK:LOCK:OPEN:ERR01 → command = "LOCK:OPEN", error = "ERR01"
      if (parts.length < 4) {
        return {type: 'UNKNOWN', raw: message};
      }
      const error = parts[parts.length - 1];
      const command = parts.slice(1, -1).join(':');
      return {type: 'NACK', command, error};
    }

    // Xử lý EVENT
    if (header === 'EVENT') {
      // EVENT:GAS:ALERT:350:20:15:30
      const eventName = parts.slice(1, 3).join('_');
      const eventData: any = {};
      if (parts.length >= 4) {
        eventData.value = parts[3];
      }
      return {type: 'EVENT', event: eventName, data: eventData};
    }

    return {type: 'UNKNOWN', raw: message};
  }

  /**
   * Lấy mô tả lỗi từ mã lỗi
   */
  getErrorMessage(code: string): string {
    const errors: Record<string, string> = {
      ERR01: 'Sai mật khẩu',
      ERR02: 'Đang bị khóa tạm',
      ERR03: 'Cảm biến lỗi',
      ERR04: 'Động cơ bị kẹt',
      ERR05: 'Lệnh không hợp lệ',
      ERR06: 'Timeout',
    };
    return errors[code] || `Lỗi không xác định (${code})`;
  }
}

export default new ProtocolParser();
