# Before & After Code Comparison

This document shows the key changes made to implement the new features.

## 1. Imports - Before & After

### Before:
```typescript
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { TextInput, Button, Card, Text, useTheme } from 'react-native-paper';
import { beraknaBostadskostnad, BostadsInput, BostadsResultat } from '../../lib/calculators';
```

### After:
```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Card, Text, useTheme, IconButton } from 'react-native-paper';
import { beraknaBostadskostnad, BostadsInput, BostadsResultat } from '../../lib/calculators';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
```

**Changes**: Added useEffect, useColorScheme, ActivityIndicator, IconButton, and 4 new packages

---

## 2. State Management - Before & After

### Before:
```typescript
const [input, setInput] = useState<BostadsInput>(DEFAULT_INPUT);
const [resultat, setResultat] = useState<BostadsResultat | null>(null);
const [error, setError] = useState<string | null>(null);
```

### After:
```typescript
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

const [input, setInput] = useState<BostadsInput>(DEFAULT_INPUT);
const [resultat, setResultat] = useState<BostadsResultat | null>(null);
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);

// Load saved calculation on mount
useEffect(() => {
  loadSavedCalculation();
}, []);
```

**Changes**: Added dark mode detection, loading state, and useEffect for loading saved data

---

## 3. Input Fields - Before & After

### Before:
```tsx
<TextInput
  label="Bostadspris (kr)"
  value={input.bostadspris.toString()}
  onChangeText={(text) =>
    setInput({ ...input, bostadspris: Number(text) || 0 })
  }
  keyboardType="numeric"
  mode="outlined"
  style={styles.input}
/>
```

### After:
```tsx
<TextInput
  label="Bostadspris (kr)"
  value={formatInputValue(input.bostadspris.toString())}
  onChangeText={(text) =>
    setInput({ ...input, bostadspris: parseInputValue(text) })
  }
  keyboardType="numeric"
  mode="outlined"
  style={[styles.input, isDark && styles.inputDark]}
  right={
    input.bostadspris !== 0 ? (
      <TextInput.Icon
        icon="close-circle"
        onPress={() => setInput({ ...input, bostadspris: 0 })}
      />
    ) : undefined
  }
/>
```

**Changes**: 
- Added thousand separator formatting (formatInputValue)
- Added clear button with icon
- Added dark mode styling
- Added proper value parsing

---

## 4. Calculate Button Handler - Before & After

### Before:
```typescript
const handleBerakna = () => {
  setError(null);
  
  const validationError = validateInput();
  if (validationError) {
    setError(validationError);
    setResultat(null);
    return;
  }

  try {
    const result = beraknaBostadskostnad(input);
    setResultat(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Ett fel uppstod vid beräkning');
    setResultat(null);
  }
};
```

### After:
```typescript
const handleBerakna = async () => {
  setError(null);
  setIsLoading(true);
  
  const validationError = validateInput();
  if (validationError) {
    setError(validationError);
    setResultat(null);
    setIsLoading(false);
    // Error haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }

  // Light haptic feedback on button press
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  try {
    const result = beraknaBostadskostnad(input);
    setResultat(result);
    // Save calculation automatically
    await saveCalculation(input, result);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Ett fel uppstod vid beräkning');
    setResultat(null);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } finally {
    setIsLoading(false);
  }
};
```

**Changes**:
- Made async for haptic feedback
- Added loading state management
- Added haptic feedback (success and error)
- Added automatic saving to AsyncStorage

---

## 5. Results Display - Before & After

### Before:
```tsx
{resultat && (
  <View style={styles.resultsContainer}>
    {/* Three main result cards */}
    <Card style={[styles.resultCard, { backgroundColor: '#2563eb' }]}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.resultCardTitle}>
          Total månadskostnad
        </Text>
        <Text variant="headlineMedium" style={styles.resultCardValue}>
          {formatNumber(resultat.totalPerManad)} kr
        </Text>
      </Card.Content>
    </Card>
    {/* ... more cards ... */}
  </View>
)}
```

### After:
```tsx
{resultat && (
  <View style={styles.resultsContainer}>
    {/* Share button */}
    <Button
      mode="contained"
      onPress={handleShare}
      style={[styles.button, styles.shareButton, { backgroundColor: '#16a34a' }]}
      labelStyle={styles.buttonLabel}
      icon="share-variant"
    >
      Dela resultat
    </Button>

    {/* Three main result cards */}
    <Card style={[styles.resultCard, { backgroundColor: '#2563eb' }]}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.resultCardTitle}>
          Total månadskostnad
        </Text>
        <Text variant="headlineMedium" style={styles.resultCardValue}>
          {formatNumber(resultat.totalPerManad)} kr
        </Text>
      </Card.Content>
    </Card>
    {/* ... more cards ... */}
  </View>
)}
```

**Changes**: Added "Dela resultat" button with share functionality

---

## 6. New Functions Added

### AsyncStorage Functions:
```typescript
const loadSavedCalculation = async () => {
  try {
    const savedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.input) setInput(parsed.input);
      if (parsed.resultat) setResultat(parsed.resultat);
    }
  } catch (err) {
    console.error('Error loading saved calculation:', err);
  }
};

const saveCalculation = async (inputData: BostadsInput, resultatData: BostadsResultat) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ input: inputData, resultat: resultatData })
    );
  } catch (err) {
    console.error('Error saving calculation:', err);
  }
};
```

### Share Function:
```typescript
const handleShare = async () => {
  if (!resultat) return;
  
  try {
    const shareText = `
Bostadsbudget Resultat
====================

📊 Sammanfattning:
• Total månadskostnad: ${formatNumber(resultat.totalPerManad)} kr
• Total årskostnad: ${formatNumber(resultat.totalPerAr)} kr
...
    `.trim();

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      const file = new FileSystem.File(FileSystem.Paths.cache, 'bostadsbudget_resultat.txt');
      await file.write(shareText);
      await Sharing.shareAsync(file.uri);
    }
  } catch (err) {
    console.error('Error sharing:', err);
    setError('Kunde inte dela resultatet');
  }
};
```

### Input Formatting Functions:
```typescript
const formatInputValue = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const number = parseFloat(cleaned);
  if (isNaN(number)) return '';
  return number.toLocaleString('sv-SE');
};

const parseInputValue = (value: string): number => {
  const cleaned = value.replace(/\s/g, '').replace(/,/g, '.');
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};
```

---

## 7. Styles - Before & After

### Before:
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  formCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  // ... more styles ...
});
```

### After:
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  formCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  inputDark: {
    backgroundColor: '#374151',
  },
  textDark: {
    color: '#f9fafb',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  shareButton: {
    marginBottom: 16,
  },
  // ... more styles including dark mode variants ...
});
```

**Changes**: Added dark mode style variants and loading state styles

---

## Summary of Changes

| Feature | Lines Added | Key Changes |
|---------|-------------|-------------|
| AsyncStorage | ~30 | Load/save functions, useEffect hook |
| Share | ~40 | Share handler, file creation, formatting |
| Haptics | ~10 | Feedback on button press and errors |
| Dark Mode | ~50 | Color scheme detection, conditional styling |
| Loading State | ~20 | ActivityIndicator, disabled states |
| Input Formatting | ~60 | Format functions, clear buttons, parsing |
| **Total** | **~210** | **+ imports, types, styles** |

**Result**: Enhanced mobile app with modern features while maintaining code quality and performance.
