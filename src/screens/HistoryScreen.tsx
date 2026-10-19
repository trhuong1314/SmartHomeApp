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
import HistoryService, {HistoryItem} from '../services/HistoryService';
import {COLORS} from '../styles/colors';

type Props = {
  onBack: () => void;
};

const HistoryScreen = ({onBack}: Props) => {
  const [items, setItems] = useState<HistoryItem[]>([]);

  // Tải lịch sử khi màn hình mở
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await HistoryService.getAll();
    setItems(data);
  };

  const handleClear = () => {
    Alert.alert('Xóa lịch sử', 'Bạn có chắc muốn xóa toàn bộ lịch sử?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await HistoryService.clear();
          setItems([]);
        },
      },
    ]);
  };

  const getIconForType = (type: HistoryItem['type']) => {
    switch (type) {
      case 'GAS_ALERT':
        return '🔥';
      case 'LOCK_FAIL':
        return '🔒';
      case 'LOCKOUT':
        return '⚠️';
      case 'COMMAND':
        return '⚙️';
      default:
        return 'ℹ️';
    }
  };

  const getColorForType = (type: HistoryItem['type']) => {
    switch (type) {
      case 'GAS_ALERT':
        return COLORS.danger;
      case 'LOCK_FAIL':
        return COLORS.warning;
      case 'LOCKOUT':
        return '#9C27B0';
      case 'COMMAND':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearText}>Xóa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Chưa có sự kiện nào</Text>
          </View>
        ) : (
          items.map(item => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.icon}>{getIconForType(item.type)}</Text>
              <View style={styles.itemContent}>
                <Text
                  style={[styles.message, {color: getColorForType(item.type)}]}>
                  {item.message}
                </Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  backBtn: {padding: 8},
  backText: {color: COLORS.textLight, fontSize: 16},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  clearBtn: {padding: 8},
  clearText: {color: '#FFCDD2', fontSize: 16, fontWeight: 'bold'},
  listContent: {padding: 16},
  empty: {alignItems: 'center', marginTop: 50},
  emptyText: {fontSize: 16, color: COLORS.textSecondary},
  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  icon: {fontSize: 24, marginRight: 12},
  itemContent: {flex: 1},
  message: {fontSize: 15, fontWeight: '600'},
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default HistoryScreen;
