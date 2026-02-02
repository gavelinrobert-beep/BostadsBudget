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

// Default values for the calculator
const DEFAULT_INPUT: BostadsInput = {
  bostadspris: 3000000,
  kontantinsats: 450000,
  arsinkomst: 500000,
  arsranta: 0.045,
  driftkostnad: 3000,
  elkostnad: 800,
  renoveringskostnad: 200000,
  renoveringsintervall: 10,
  analysperiod: 10,
};

const STORAGE_KEY = '@bostadsbudget_calculation';

export default function Index() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Input state with default values
  const [input, setInput] = useState<BostadsInput>(DEFAULT_INPUT);
  const [resultat, setResultat] = useState<BostadsResultat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load saved calculation on mount
  useEffect(() => {
    loadSavedCalculation();
  }, []);

  // Load calculation from AsyncStorage
  const loadSavedCalculation = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.input) {
          setInput(parsed.input);
        }
        if (parsed.resultat) {
          setResultat(parsed.resultat);
        }
      }
    } catch (err) {
      console.error('Error loading saved calculation:', err);
    }
  };

  // Save calculation to AsyncStorage
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

  // Validation
  const validateInput = (): string | null => {
    if (input.bostadspris <= 0) {
      return 'Bostadspris måste vara större än 0';
    }
    if (input.kontantinsats < 0 || input.kontantinsats > input.bostadspris) {
      return 'Kontantinsats måste vara mellan 0 och bostadspriset';
    }
    if (input.arsranta < 0 || input.arsranta > 1) {
      return 'Årsränta måste vara mellan 0 och 100%';
    }
    if (input.renoveringsintervall <= 0) {
      return 'Renoveringsintervall måste vara större än 0';
    }
    return null;
  };

  // Handle calculation
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

  // Handle reset
  const handleAterstall = () => {
    setInput(DEFAULT_INPUT);
    setResultat(null);
    setError(null);
  };

  // Share results
  const handleShare = async () => {
    if (!resultat) return;
    
    try {
      // Format results as text
      const shareText = `
Bostadsbudget Resultat
====================

📊 Sammanfattning:
• Total månadskostnad: ${formatNumber(resultat.totalPerManad)} kr
• Total årskostnad: ${formatNumber(resultat.totalPerAr)} kr
• Belåningsgrad: ${formatPercent(resultat.belåningsgrad)}%

💰 Månadskostnader:
• Lån (ränta + amortering): ${formatNumber(resultat.lanePerManad)} kr
• Drift + El: ${formatNumber(resultat.driftOchElPerManad)} kr
• Renovering (snitt): ${formatNumber(resultat.renoveringPerManad)} kr

🏠 Låneuppgifter:
• Lånebelopp: ${formatNumber(resultat.lanebelopp)} kr
• Amorteringskrav: ${formatPercent(resultat.amorteringsprocent)}%
• Ränta per år: ${formatNumber(resultat.rantaPerAr)} kr
• Amortering per år: ${formatNumber(resultat.amorteringPerAr)} kr

📝 Beräknat med BostadsBudget
      `.trim();

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Create a temporary text file to share using new API
        const file = new FileSystem.File(FileSystem.Paths.cache, 'bostadsbudget_resultat.txt');
        await file.write(shareText);
        await Sharing.shareAsync(file.uri);
      } else {
        setError('Delning är inte tillgänglig på denna enhet');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      setError('Kunde inte dela resultatet');
    }
  };

  // Format thousands separator
  const formatInputValue = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    const number = parseFloat(cleaned);
    if (isNaN(number)) return '';
    return number.toLocaleString('sv-SE');
  };

  // Parse formatted input back to number
  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/\s/g, '').replace(/,/g, '.');
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
  };

  // Format number with Swedish thousand separator
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString('sv-SE');
  };

  // Format percentage
  const formatPercent = (num: number): string => {
    return (num * 100).toFixed(1);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Form Card */}
        <Card style={[styles.formCard, isDark && styles.cardDark]}>
          <Card.Content>
            <Text variant="headlineSmall" style={[styles.sectionTitle, isDark && styles.textDark]}>
              Fyll i uppgifter
            </Text>

            {/* Bostadspris */}
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

            {/* Kontantinsats */}
            <TextInput
              label="Kontantinsats (kr)"
              value={formatInputValue(input.kontantinsats.toString())}
              onChangeText={(text) =>
                setInput({ ...input, kontantinsats: parseInputValue(text) })
              }
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, isDark && styles.inputDark]}
              right={
                input.kontantinsats !== 0 ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setInput({ ...input, kontantinsats: 0 })}
                  />
                ) : undefined
              }
            />

            {/* Årsinkomst */}
            <TextInput
              label="Årsinkomst (kr) - valfritt"
              value={input.arsinkomst ? formatInputValue(input.arsinkomst.toString()) : ''}
              onChangeText={(text) =>
                setInput({
                  ...input,
                  arsinkomst: text ? parseInputValue(text) : undefined,
                })
              }
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, isDark && styles.inputDark]}
              right={
                input.arsinkomst ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setInput({ ...input, arsinkomst: undefined })}
                  />
                ) : undefined
              }
            />

            {/* Årsränta */}
            <TextInput
              label="Årsränta (%)"
              value={(input.arsranta * 100).toString()}
              onChangeText={(text) =>
                setInput({ ...input, arsranta: (Number(text) || 0) / 100 })
              }
              keyboardType="decimal-pad"
              mode="outlined"
              style={[styles.input, isDark && styles.inputDark]}
              right={
                input.arsranta !== 0 ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setInput({ ...input, arsranta: 0 })}
                  />
                ) : undefined
              }
            />

            {/* Driftkostnad */}
            <TextInput
              label="Driftkostnad (kr/mån)"
              value={formatInputValue(input.driftkostnad.toString())}
              onChangeText={(text) =>
                setInput({ ...input, driftkostnad: parseInputValue(text) })
              }
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, isDark && styles.inputDark]}
              right={
                input.driftkostnad !== 0 ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setInput({ ...input, driftkostnad: 0 })}
                  />
                ) : undefined
              }
            />

            {/* Elkostnad */}
            <TextInput
              label="Elkostnad (kr/mån)"
              value={formatInputValue(input.elkostnad.toString())}
              onChangeText={(text) =>
                setInput({ ...input, elkostnad: parseInputValue(text) })
              }
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, isDark && styles.inputDark]}
              right={
                input.elkostnad !== 0 ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setInput({ ...input, elkostnad: 0 })}
                  />
                ) : undefined
              }
            />

            {/* Renoveringskostnad */}
            <TextInput
              label="Renoveringskostnad (kr)"
              value={formatInputValue(input.renoveringskostnad.toString())}
              onChangeText={(text) =>
                setInput({ ...input, renoveringskostnad: parseInputValue(text) })
              }
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, isDark && styles.inputDark]}
              right={
                input.renoveringskostnad !== 0 ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setInput({ ...input, renoveringskostnad: 0 })}
                  />
                ) : undefined
              }
            />

            {/* Renoveringsintervall */}
            <TextInput
              label="Renoveringsintervall (år)"
              value={input.renoveringsintervall.toString()}
              onChangeText={(text) =>
                setInput({ ...input, renoveringsintervall: Number(text) || 0 })
              }
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, isDark && styles.inputDark]}
              right={
                input.renoveringsintervall !== 0 ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setInput({ ...input, renoveringsintervall: 0 })}
                  />
                ) : undefined
              }
            />

            {/* Analysperiod */}
            <TextInput
              label="Analysperiod (år)"
              value={input.analysperiod.toString()}
              onChangeText={(text) =>
                setInput({ ...input, analysperiod: Number(text) || 0 })
              }
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, isDark && styles.inputDark]}
              right={
                input.analysperiod !== 0 ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setInput({ ...input, analysperiod: 0 })}
                  />
                ) : undefined
              }
            />

            {/* Error message */}
            {error && (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <Text style={styles.errorText}>{error}</Text>
                </Card.Content>
              </Card>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={[styles.loadingText, isDark && styles.textDark]}>
                  Beräknar...
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleBerakna}
                style={[styles.button, { backgroundColor: '#2563eb' }]}
                labelStyle={styles.buttonLabel}
                disabled={isLoading}
              >
                Beräkna
              </Button>
              <Button
                mode="contained"
                onPress={handleAterstall}
                style={[styles.button, { backgroundColor: '#6b7280' }]}
                labelStyle={styles.buttonLabel}
                disabled={isLoading}
              >
                Återställ
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Results */}
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

            <Card style={[styles.resultCard, { backgroundColor: '#16a34a' }]}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.resultCardTitle}>
                  Total årskostnad
                </Text>
                <Text variant="headlineMedium" style={styles.resultCardValue}>
                  {formatNumber(resultat.totalPerAr)} kr
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.resultCard, { backgroundColor: '#9333ea' }]}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.resultCardTitle}>
                  Belåningsgrad
                </Text>
                <Text variant="headlineMedium" style={styles.resultCardValue}>
                  {formatPercent(resultat.belåningsgrad)}{'\u00A0'}%
                </Text>
              </Card.Content>
            </Card>

            {/* Monthly breakdown */}
            <Card style={[styles.detailCard, isDark && styles.cardDark]}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.detailTitle, isDark && styles.textDark]}>
                  Uppdelning per månad
                </Text>
                <View style={[styles.detailRow, isDark && styles.detailRowDark]}>
                  <Text style={[styles.detailLabel, isDark && styles.textDark]}>
                    Lån (ränta + amortering)
                  </Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>
                    {formatNumber(resultat.lanePerManad)} kr
                  </Text>
                </View>
                <View style={[styles.detailRow, isDark && styles.detailRowDark]}>
                  <Text style={[styles.detailLabel, isDark && styles.textDark]}>Drift + El</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>
                    {formatNumber(resultat.driftOchElPerManad)} kr
                  </Text>
                </View>
                <View style={[styles.detailRow, isDark && styles.detailRowDark]}>
                  <Text style={[styles.detailLabel, isDark && styles.textDark]}>Renovering (snitt)</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>
                    {formatNumber(resultat.renoveringPerManad)} kr
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* Loan details */}
            <Card style={[styles.detailCard, isDark && styles.cardDark]}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.detailTitle, isDark && styles.textDark]}>
                  Låneuppgifter
                </Text>
                <View style={[styles.detailRow, isDark && styles.detailRowDark]}>
                  <Text style={[styles.detailLabel, isDark && styles.textDark]}>Lånebelopp</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>
                    {formatNumber(resultat.lanebelopp)} kr
                  </Text>
                </View>
                <View style={[styles.detailRow, isDark && styles.detailRowDark]}>
                  <Text style={[styles.detailLabel, isDark && styles.textDark]}>Amorteringskrav</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>
                    {formatPercent(resultat.amorteringsprocent)}{'\u00A0'}%
                  </Text>
                </View>
                {/* Amortization breakdown explanation */}
                <View style={[styles.explanationBox, isDark && styles.explanationBoxDark]}>
                  <Text style={[styles.explanationTitle, isDark && styles.textDark]}>
                    Uppdelning av amorteringskrav:
                  </Text>
                  <Text style={[styles.explanationText, isDark && styles.textDark]}>
                    • Grundkrav (belåningsgrad): {formatPercent(resultat.amorteringsprocentGrundkrav)}%
                  </Text>
                  {resultat.harSkarptKrav && (
                    <Text style={[styles.explanationText, isDark && styles.textDark]}>
                      • Skärpt krav (lån {'>'} 4.5 × årsinkomst): +{formatPercent(resultat.amorteringsprocentSkarptKrav)}%
                    </Text>
                  )}
                  <Text style={[styles.explanationTotal, isDark && styles.textDark]}>
                    = Totalt: {formatPercent(resultat.amorteringsprocent)}%
                  </Text>
                </View>
                <View style={[styles.detailRow, isDark && styles.detailRowDark]}>
                  <Text style={[styles.detailLabel, isDark && styles.textDark]}>Ränta per år</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>
                    {formatNumber(resultat.rantaPerAr)} kr
                  </Text>
                </View>
                <View style={[styles.detailRow, isDark && styles.detailRowDark]}>
                  <Text style={[styles.detailLabel, isDark && styles.textDark]}>Amortering per år</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>
                    {formatNumber(resultat.amorteringPerAr)} kr
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  textDark: {
    color: '#f9fafb',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  inputDark: {
    backgroundColor: '#374151',
  },
  errorCard: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#991b1b',
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
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  button: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    marginBottom: 16,
  },
  resultsContainer: {
    gap: 16,
  },
  resultCard: {
    marginBottom: 0,
  },
  resultCardTitle: {
    color: '#ffffff',
    marginBottom: 8,
  },
  resultCardValue: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  detailCard: {
    backgroundColor: '#ffffff',
  },
  detailTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailRowDark: {
    borderBottomColor: '#4b5563',
  },
  detailLabel: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  explanationBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  explanationBoxDark: {
    backgroundColor: '#1e3a5f',
    borderColor: '#3b82f6',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  explanationTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
});
