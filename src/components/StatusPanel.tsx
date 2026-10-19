import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../styles/colors';

type StatusPanelProps = {
  temperature: string;
  humidity: string;
  light: string;
  gas: string;
  time: string;
};

const StatusPanel = ({
  temperature,
  humidity,
  light,
  gas,
  time,
}: StatusPanelProps) => {
  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Nhiệt độ</Text>
          <Text style={styles.value}>{temperature}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Độ ẩm</Text>
          <Text style={styles.value}>{humidity}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Ánh sáng</Text>
          <Text style={styles.value}>{light}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Gas</Text>
          <Text style={styles.value}>{gas}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Thời gian</Text>
          <Text style={styles.value}>{time}</Text>
        </View>
        <View style={styles.item} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.textOnDark,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
});

export default StatusPanel;