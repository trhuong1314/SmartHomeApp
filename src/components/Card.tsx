import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../styles/colors';

type CardProps = {
  title: string;
  icon: string;
  status: string;
  statusColor?: string;
  onPress?: () => void;
  children?: React.ReactNode;
};

const Card = ({
  title,
  icon,
  status,
  statusColor = COLORS.textSecondary,
  onPress,
  children,
}: CardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  status: {
    fontSize: 14,
    marginTop: 2,
  },
  body: {
    marginTop: 4,
  },
});

export default Card;