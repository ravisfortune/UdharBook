/**
 * Reusable contact picker — multi-select with search
 * Used in Split screens to pick members
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadows } from '@theme/tokens';
import { useContactStore } from '@store/useContactStore';
import { fadeInDown } from '@utils/animations';

interface SelectedMember {
  contactId: string;
  name: string;
  avatarColor: string;
  avatarLetter: string;
  phone?: string;
}

interface Props {
  selected: SelectedMember[];
  onAdd: (m: SelectedMember) => void;
  onRemove: (contactId: string) => void;
}

export default function ContactPicker({ selected, onAdd, onRemove }: Props) {
  const { t } = useTranslation();
  const { contacts } = useContactStore();
  const [search, setSearch] = useState('');

  const selectedIds = new Set(selected.map(s => s.contactId));
  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    !selectedIds.has(c.id)
  );

  return (
    <View>
      {/* Selected chips */}
      {selected.length > 0 && (
        <View style={styles.chips}>
          {selected.map(m => (
            <Animated.View key={m.contactId} entering={fadeInDown(0)} style={styles.chip}>
              <View style={[styles.chipAvatar, { backgroundColor: m.avatarColor + '22' }]}>
                <Text style={[styles.chipAvatarText, { color: m.avatarColor }]}>
                  {m.avatarLetter}
                </Text>
              </View>
              <Text style={styles.chipName}>{m.name}</Text>
              <TouchableOpacity onPress={() => onRemove(m.contactId)}>
                <MaterialIcons name="close" size={14} color={Colors.muted} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <MaterialIcons name="search" size={18} color={Colors.mutedLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('transaction.searchContact')}
          placeholderTextColor={Colors.mutedLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <View style={styles.list}>
        {filtered.slice(0, 8).map(c => (
          <TouchableOpacity
            key={c.id}
            style={styles.row}
            onPress={() => onAdd({
              contactId: c.id,
              name: c.name,
              avatarColor: c.avatar_color,
              avatarLetter: c.avatar_letter,
              phone: c.phone,
            })}
          >
            <View style={[styles.avatar, { backgroundColor: c.avatar_color + '22' }]}>
              <Text style={[styles.avatarText, { color: c.avatar_color }]}>
                {c.avatar_letter}
              </Text>
            </View>
            <Text style={styles.name}>{c.name}</Text>
            <MaterialIcons name="add-circle-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.empty}>{t('common.noData')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryFixed,
    borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: 10,
  },
  chipAvatar: {
    width: 20, height: 20, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  chipAvatarText: { fontFamily: FontFamily.displaySemiBold, fontSize: 10 },
  chipName: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: Colors.primary },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLow, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1, paddingVertical: Spacing.md,
    fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.ink,
  },
  list: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: Radius.md, overflow: 'hidden', ...Shadows.sm,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceLow,
  },
  avatar: {
    width: 36, height: 36, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FontFamily.displaySemiBold, fontSize: FontSize.sm },
  name: { flex: 1, fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.ink },
  empty: {
    fontFamily: FontFamily.body, fontSize: FontSize.sm,
    color: Colors.muted, padding: Spacing.lg, textAlign: 'center',
  },
});
