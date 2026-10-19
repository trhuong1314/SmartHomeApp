import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import Card from '../components/Card';
import StatusPanel from '../components/StatusPanel';
import {COLORS} from '../styles/colors';
import BluetoothService from '../services/BluetoothService';
import ProtocolParser, {StatusData} from '../services/ProtocolParser';
import HistoryScreen from './HistoryScreen';
import HistoryService from '../services/HistoryService';

const DashboardScreen = () => {
  // Dữ liệu thật từ MCU
  const [status, setStatus] = useState<StatusData>({
    temperature: 0,
    humidity: 0,
    light: 0,
    gas: 0,
    lock: 'ON',
    fan: 'OFF',
    curtain: 0,
    time: '--:--:--',
  });

  const [btConnected, setBtConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Lắng nghe dữ liệu từ MCU
  useEffect(() => {
    BluetoothService.onData((raw: string) => {
      console.log('[Dashboard] Nhận:', raw);

      // Tách nhiều message nếu có (do MCU có thể gửi liền nhau)
      const messages = raw.split('\n').filter(m => m.trim());

      messages.forEach(msg => {
        const parsed = ProtocolParser.parse(msg);
        console.log('[Dashboard] Parsed:', parsed);

        if (parsed.type === 'STATUS') {
          setStatus(parsed.data);
        } else if (parsed.type === 'ACK') {
          console.log('[Dashboard] Lệnh OK:', parsed.command);
        } else if (parsed.type === 'NACK') {
          const errorMsg = ProtocolParser.getErrorMessage(parsed.error);
          Alert.alert('Lỗi', errorMsg);
          HistoryService.add(
            'LOCK_FAIL',
            `Lệnh thất bại: ${parsed.command} - ${errorMsg}`,
          );
        } else if (parsed.type === 'EVENT') {
          if (parsed.event === 'GAS_ALERT') {
            const gasValue = parsed.data.value || '?';
            Alert.alert('CẢNH BÁO GAS', `Nồng độ: ${gasValue} ppm`);
            HistoryService.add('GAS_ALERT', `Phát hiện gas: ${gasValue} ppm`);
          } else if (parsed.event === 'LOCKOUT') {
            HistoryService.add(
              'LOCKOUT',
              'Bàn phím bị khóa tạm do nhập sai nhiều lần',
            );
          }
        }
      });
    });
  }, []);

  // Gửi lệnh với retry
  const sendCommand = async (cmd: string, retries = 3) => {
    if (!btConnected) {
      Alert.alert('Chưa kết nối', 'Hãy kết nối HC-05 trước.');
      return;
    }
    if (sending) {
      return;
    }
    setSending(true);

    for (let i = 0; i < retries; i++) {
      const ok = await BluetoothService.send(cmd);
      if (ok) {
        setSending(false);
        HistoryService.add('COMMAND', `Đã gửi: ${cmd}`);
        return;
      }
      console.log(`Retry ${i + 1}/${retries} cho ${cmd}`);
      await new Promise(r => setTimeout(r, 500));
    }
    setSending(false);
    Alert.alert('Lỗi', 'Không gửi được lệnh. Kiểm tra kết nối.');
  };

  // Test kết nối
  const handleTestBluetooth = async () => {
    try {
      const devices = await BluetoothService.getPairedDevices();
      if (devices.length === 0) {
        Alert.alert(
          'Không tìm thấy thiết bị',
          'Vui lòng pair HC-05 trong Cài đặt Bluetooth của điện thoại.',
        );
        return;
      }
      const hc05 = devices.find(d => d.name?.includes('HC-05'));
      if (!hc05) {
        Alert.alert(
          'Không thấy HC-05',
          `Đã pair: ${devices.map(d => d.name).join(', ')}`,
        );
        return;
      }
      const ok = await BluetoothService.connect(hc05);
      if (ok) {
        setBtConnected(true);
        Alert.alert('Thành công', `Đã kết nối ${hc05.name}`);
      } else {
        Alert.alert('Thất bại', 'Không kết nối được HC-05');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không xác định');
    }
  };

  // Hiển thị nhiệt độ
  const displayTemp = status.temperature
    ? `${status.temperature.toFixed(1)}°C`
    : '--';
  const displayHum = status.humidity ? `${status.humidity.toFixed(0)}%` : '--';
  const displayLight = status.light ? `${status.light.toFixed(0)} lux` : '--';
  const displayGas = status.gas ? `${status.gas.toFixed(0)} ppm` : '--';
  const displayTime = status.time || '--:--:--';

  const isLocked = status.lock === 'ON';
  const isFanOn = status.fan === 'ON';

  if (showHistory) {
    return <HistoryScreen onBack={() => setShowHistory(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>SMART HOME</Text>
            <Text
              style={[
                styles.headerSubtitle,
                {color: btConnected ? COLORS.success : COLORS.danger},
              ]}>
              {btConnected ? '● Đã kết nối HC-05' : '● Chưa kết nối'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => setShowHistory(true)}>
            <Text style={styles.historyBtnText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>

        {/* Nút test */}
        <View style={styles.testRow}>
          <TouchableOpacity
            style={[styles.testBtn, {backgroundColor: COLORS.info}]}
            onPress={handleTestBluetooth}>
            <Text style={styles.testBtnText}>KẾT NỐI HC-05</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.testBtn, {backgroundColor: COLORS.warning}]}
            onPress={() => sendCommand('STATUS:GET')}>
            <Text style={styles.testBtnText}>LẤY STATUS</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Giả lập — thêm mới */}
        <View style={{marginBottom: 16}}>
          <TouchableOpacity
            style={[
              styles.testBtn,
              {
                backgroundColor: '#E91E63',
                marginTop: 8,
                flex: 0,
                paddingHorizontal: 16,
              },
            ]}
            onPress={() => {
              HistoryService.add(
                'GAS_ALERT',
                'Phát hiện gas: 500 ppm (giả lập)',
              );
              Alert.alert('Giả lập', 'Đã thêm sự kiện vào lịch sử');
            }}>
            <Text style={styles.testBtnText}>TẠO SỰ KIỆN GIẢ LẬP</Text>
          </TouchableOpacity>
        </View>

        <StatusPanel
          temperature={displayTemp}
          humidity={displayHum}
          light={displayLight}
          gas={displayGas}
          time={displayTime}
        />

        {/* Khóa cửa */}
        <Card
          title="Khóa cửa"
          icon="🔒"
          status={isLocked ? 'Đã khóa' : 'Đã mở'}
          statusColor={isLocked ? COLORS.success : COLORS.warning}>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSuccess]}
              onPress={() => sendCommand('LOCK:OPEN')}>
              <Text style={styles.btnText}>Mở khóa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={() => sendCommand('LOCK:CLOSE')}>
              <Text style={styles.btnText}>Khóa</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quạt */}
        <Card
          title="Quạt làm mát"
          icon="🌀"
          status={`Trạng thái: ${isFanOn ? 'Bật' : 'Tắt'}`}
          statusColor={isFanOn ? COLORS.success : COLORS.textSecondary}>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSuccess]}
              onPress={() => sendCommand('FAN:ON')}>
              <Text style={styles.btnText}>BẬT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={() => sendCommand('FAN:OFF')}>
              <Text style={styles.btnText}>TẮT</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Rèm */}
        <Card
          title="Rèm cửa"
          icon="🪟"
          status={`Vị trí: ${status.curtain || 0}%`}
          statusColor={COLORS.info}>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => sendCommand('CURTAIN:OPEN')}>
              <Text style={styles.btnText}>Mở</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => sendCommand('CURTAIN:CLOSE')}>
              <Text style={styles.btnText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnWarning]}
              onPress={() => sendCommand('CURTAIN:STOP')}>
              <Text style={styles.btnText}>Dừng</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Gas */}
        <Card
          title="Cảm biến Gas"
          icon="🔥"
          status={`Nồng độ: ${displayGas}`}
          statusColor={
            (status.gas || 0) > 500 ? COLORS.danger : COLORS.success
          }>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={() => sendCommand('GAS:ALARM:OFF')}>
              <Text style={styles.btnText}>Tắt còi</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Emergency Stop */}
        <TouchableOpacity
          style={styles.estopBtn}
          onPress={() => sendCommand('ESTOP')}>
          <Text style={styles.estopText}>⚠ DỪNG KHẨN CẤP</Text>
        </TouchableOpacity>

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  scrollContent: {padding: 16},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {fontSize: 24, fontWeight: 'bold', color: COLORS.primary},
  headerSubtitle: {fontSize: 14, marginTop: 4},
  historyBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  historyBtnText: {color: COLORS.textLight, fontWeight: 'bold'},
  testRow: {flexDirection: 'row', gap: 8, marginBottom: 16},
  testBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testBtnText: {color: COLORS.textLight, fontWeight: 'bold', fontSize: 12},
  btnRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  btnSuccess: {backgroundColor: COLORS.success},
  btnDanger: {backgroundColor: COLORS.danger},
  btnPrimary: {backgroundColor: COLORS.primary},
  btnWarning: {backgroundColor: COLORS.warning},
  btnText: {color: COLORS.textLight, fontWeight: 'bold'},
  estopBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#B71C1C',
  },
  estopText: {color: COLORS.textLight, fontSize: 16, fontWeight: 'bold'},
});

export default DashboardScreen;
