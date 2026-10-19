import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';

class BluetoothService {
  private connectedDevice: BluetoothDevice | null = null;
  private onDataCallback: ((data: string) => void) | null = null;

  /**
   * Lấy danh sách thiết bị Bluetooth đã pair
   */
  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      const devices = await RNBluetoothClassic.getBondedDevices();
      return devices;
    } catch (error) {
      console.error('Lỗi lấy danh sách thiết bị:', error);
      return [];
    }
  }

  /**
   * Kết nối tới thiết bị
   */
  async connect(device: BluetoothDevice): Promise<boolean> {
    try {
      const connected = await RNBluetoothClassic.connectToDevice(
        device.address,
      );
      if (connected) {
        this.connectedDevice = device;
        console.log('Đã kết nối:', device.name);

        device.onDataReceived(data => {
          const message = data.data;
          console.log('Nhận:', message);
          if (this.onDataCallback) {
            this.onDataCallback(message);
          }
        });
      }
      return connected;
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      return false;
    }
  }

  /**
   * Ngắt kết nối
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connectedDevice) {
        await RNBluetoothClassic.disconnectFromDevice(
          this.connectedDevice.address,
        );
        this.connectedDevice = null;
        console.log('Đã ngắt kết nối');
      }
    } catch (error) {
      console.error('Lỗi ngắt kết nối:', error);
    }
  }

  /**
   * Gửi lệnh xuống MCU
   */
  async send(command: string): Promise<boolean> {
    try {
      if (!this.connectedDevice) {
        console.warn('Chưa kết nối thiết bị');
        return false;
      }
      await this.connectedDevice.write(command + '\n');
      console.log('Gửi:', command);
      return true;
    } catch (error) {
      console.error('Lỗi gửi:', error);
      return false;
    }
  }

  /**
   * Đăng ký callback khi có dữ liệu về
   */
  onData(callback: (data: string) => void) {
    this.onDataCallback = callback;
  }

  /**
   * Kiểm tra đã kết nối chưa
   */
  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  /**
   * Lấy tên thiết bị đang kết nối
   */
  getConnectedDeviceName(): string {
    return this.connectedDevice?.name || '';
  }
}

export default new BluetoothService();
