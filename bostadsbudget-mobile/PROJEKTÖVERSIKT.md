# Bostadsbudget Mobile - Projektöversikt

## Översikt
Detta är en React Native Expo-app för bostadsbudgetkalkylering, byggd med TypeScript och react-native-paper för UI-komponenter.

## Projektstruktur

```
bostadsbudget-mobile/
├── app/                          # Expo Router appstruktur
│   ├── (tabs)/                   # Tab-baserad navigation
│   │   ├── _layout.tsx          # Tab layout konfiguration
│   │   └── index.tsx            # Huvudsida med kalkylator
│   └── _layout.tsx              # Root layout med PaperProvider
├── lib/
│   └── calculators.ts           # Kalkylmotor (identisk med webbappen)
├── assets/                       # Bilder och ikoner (placeholder)
├── app.json                      # Expo konfiguration
├── babel.config.js              # Babel konfiguration
├── package.json                 # Projektberoenden
└── tsconfig.json                # TypeScript konfiguration
```

## Teknologier

- **Expo** (~52.0.0): Plattform för React Native utveckling
- **expo-router** (~4.0.0): Filbaserad routing
- **React Native** (0.76.3): Mobil app framework
- **TypeScript** (^5.3.3): Statisk typning
- **react-native-paper** (^5.12.5): Material Design UI-komponenter

## Funktioner

### Kalkylmotor (lib/calculators.ts)
Identisk logik som webbappen med:
- Beräkning av lånebelopp baserat på bostadspris och kontantinsats
- Belåningsgrad
- Amorteringskrav (0%, 1%, eller 2% beroende på belåningsgrad)
- Skärpt amorteringskrav (extra 1% om lån > 4.5x årsinkomst)
- Månads- och årskostnader
- Validering av input

### UI (app/(tabs)/index.tsx)

#### Formulär
9 input-fält för:
1. Bostadspris (kr)
2. Kontantinsats (kr)
3. Årsinkomst (kr) - valfritt
4. Årsränta (%)
5. Driftkostnad (kr/mån)
6. Elkostnad (kr/mån)
7. Renoveringskostnad (kr)
8. Renoveringsintervall (år)
9. Analysperiod (år)

#### Validering
- Bostadspris måste vara > 0
- Kontantinsats mellan 0 och bostadspris
- Årsränta mellan 0% och 100%
- Renoveringsintervall > 0

#### Resultatvisning
5 Cards:
1. **Total månadskostnad** (blå, #2563eb)
2. **Total årskostnad** (grön, #16a34a)
3. **Belåningsgrad** (lila, #9333ea)
4. **Uppdelning per månad** - visar lån, drift+el, renovering
5. **Låneuppgifter** - visar lånebelopp, amortering, ränta

#### Layout
- `ScrollView` för hela sidan
- `KeyboardAvoidingView` för iOS-kompatibilitet
- `TextInput` från react-native-paper med `outlined` mode
- Svenska tusentalsavgränsare (toLocaleString('sv-SE'))
- Mobilanpassad layout i en kolumn
- Ljus färgschema med tydliga labels

#### Knappar
- **"Beräkna"** - blå knapp som kör kalkylen
- **"Återställ"** - grå knapp som återställer till standardvärden

## Standardvärden
```typescript
bostadspris: 3000000 kr
kontantinsats: 450000 kr
arsinkomst: 500000 kr
arsranta: 4.5%
driftkostnad: 3000 kr/mån
elkostnad: 800 kr/mån
renoveringskostnad: 200000 kr
renoveringsintervall: 10 år
analysperiod: 10 år
```

## Komma igång

### Installation
```bash
cd bostadsbudget-mobile
npm install
```

### Kör appen
```bash
# Starta Expo development server
npm start

# Kör på iOS simulator
npm run ios

# Kör på Android emulator
npm run android

# Kör i webbläsare
npm run web
```

### Scanna QR-kod
När du kör `npm start` får du en QR-kod som du kan scanna med:
- **iOS**: Kamera-appen (öppnar Expo Go automatiskt)
- **Android**: Expo Go-appen

## Nästa steg

### Assets
Skapa eller lägg till följande bilder i `assets/`:
- `icon.png` (1024x1024) - App-ikon
- `splash.png` (1284x2778) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon

### Förbättringar (framtida)
- Lägg till enhetstester
- Implementera datalagring (AsyncStorage)
- Lägg till möjlighet att spara beräkningar
- Lägg till grafer för visualisering
- Implementera dark mode
- Lägg till exportfunktion (PDF/CSV)

## Jämförelse med webbappen

### Likheter
- ✅ Identisk kalkyllogik
- ✅ Samma fält och validering
- ✅ Samma resultatvisning
- ✅ Svenska tusentalsavgränsare
- ✅ Samma färgkodning (blå, grön, lila)

### Skillnader
- ✅ Mobilanpassad layout (en kolumn istället för grid)
- ✅ react-native-paper istället för Tailwind CSS
- ✅ KeyboardAvoidingView för iOS
- ✅ Native TextInput med `keyboardType` för bättre UX
- ✅ ScrollView för att hantera längre formulär

## Säkerhet och validering
- Input-validering på klientsidan
- Fel visas tydligt i röd Card
- Try-catch för felhantering
- TypeScript för typsäkerhet

## Licens
ISC (matchar webbappen)
