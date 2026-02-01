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

export default function Index() {
  const theme = useTheme();
  
  // Input state with default values
  const [input, setInput] = useState<BostadsInput>(DEFAULT_INPUT);
  const [resultat, setResultat] = useState<BostadsResultat | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Handle reset
  const handleAterstall = () => {
    setInput(DEFAULT_INPUT);
    setResultat(null);
    setError(null);
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
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Form Card */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Fyll i uppgifter
            </Text>

            {/* Bostadspris */}
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

            {/* Kontantinsats */}
            <TextInput
              label="Kontantinsats (kr)"
              value={input.kontantinsats.toString()}
              onChangeText={(text) =>
                setInput({ ...input, kontantinsats: Number(text) || 0 })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            {/* Årsinkomst */}
            <TextInput
              label="Årsinkomst (kr) - valfritt"
              value={input.arsinkomst?.toString() || ''}
              onChangeText={(text) =>
                setInput({
                  ...input,
                  arsinkomst: text ? Number(text) : undefined,
                })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
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
              style={styles.input}
            />

            {/* Driftkostnad */}
            <TextInput
              label="Driftkostnad (kr/mån)"
              value={input.driftkostnad.toString()}
              onChangeText={(text) =>
                setInput({ ...input, driftkostnad: Number(text) || 0 })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            {/* Elkostnad */}
            <TextInput
              label="Elkostnad (kr/mån)"
              value={input.elkostnad.toString()}
              onChangeText={(text) =>
                setInput({ ...input, elkostnad: Number(text) || 0 })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            {/* Renoveringskostnad */}
            <TextInput
              label="Renoveringskostnad (kr)"
              value={input.renoveringskostnad.toString()}
              onChangeText={(text) =>
                setInput({ ...input, renoveringskostnad: Number(text) || 0 })
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
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
              style={styles.input}
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
              style={styles.input}
            />

            {/* Error message */}
            {error && (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <Text style={styles.errorText}>{error}</Text>
                </Card.Content>
              </Card>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleBerakna}
                style={[styles.button, { backgroundColor: '#2563eb' }]}
                labelStyle={styles.buttonLabel}
              >
                Beräkna
              </Button>
              <Button
                mode="contained"
                onPress={handleAterstall}
                style={[styles.button, { backgroundColor: '#6b7280' }]}
                labelStyle={styles.buttonLabel}
              >
                Återställ
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Results */}
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
            <Card style={styles.detailCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.detailTitle}>
                  Uppdelning per månad
                </Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Lån (ränta + amortering)
                  </Text>
                  <Text style={styles.detailValue}>
                    {formatNumber(resultat.lanePerManad)} kr
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Drift + El</Text>
                  <Text style={styles.detailValue}>
                    {formatNumber(resultat.driftOchElPerManad)} kr
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Renovering (snitt)</Text>
                  <Text style={styles.detailValue}>
                    {formatNumber(resultat.renoveringPerManad)} kr
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* Loan details */}
            <Card style={styles.detailCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.detailTitle}>
                  Låneuppgifter
                </Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Lånebelopp</Text>
                  <Text style={styles.detailValue}>
                    {formatNumber(resultat.lanebelopp)} kr
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amorteringskrav</Text>
                  <Text style={styles.detailValue}>
                    {formatPercent(resultat.amorteringsprocent)}{'\u00A0'}%
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ränta per år</Text>
                  <Text style={styles.detailValue}>
                    {formatNumber(resultat.rantaPerAr)} kr
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amortering per år</Text>
                  <Text style={styles.detailValue}>
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
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  errorCard: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#991b1b',
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
});
