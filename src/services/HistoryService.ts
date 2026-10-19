import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@smarthome_history';
const MAX_ITEMS = 50; // Giới hạn 50 sự kiện để tránh đầy bộ nhớ

export type HistoryItem = {
  id: string;
  timestamp: string;
  type: 'GAS_ALERT' | 'LOCK_FAIL' | 'LOCKOUT' | 'COMMAND' | 'INFO';
  message: string;
};

class HistoryService {
  /**
   * Lấy toàn bộ lịch sử
   */
  async getAll(): Promise<HistoryItem[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) return [];
      return JSON.parse(json);
    } catch (error) {
      console.error('Lỗi đọc lịch sử:', error);
      return [];
    }
  }

  /**
   * Thêm 1 sự kiện mới
   */
  async add(type: HistoryItem['type'], message: string): Promise<void> {
    try {
      const items = await this.getAll();
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(
        now.getDate(),
      ).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;

      const newItem: HistoryItem = {
        id: `${Date.now()}_${Math.random()}`,
        timestamp,
        type,
        message,
      };

      // Đưa sự kiện mới lên đầu, giới hạn 50 sự kiện
      const updated = [newItem, ...items].slice(0, MAX_ITEMS);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Lỗi lưu lịch sử:', error);
    }
  }

  /**
   * Xóa toàn bộ lịch sử
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Lỗi xóa lịch sử:', error);
    }
  }
}

export default new HistoryService();