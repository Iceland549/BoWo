export type RootStackParamList = {
  // Main Tabs container
  Main: undefined;

  // Trick flow
  TrickDetail: { trick: string };          // Écran détaillé
  TrickLearn: { trickId: string };      // TrickLearn par ID
  Quiz: { trickId: string };            // Quiz lié à un trick

  // Mini-games
  MiniGameUnlockChoice: undefined;
  KillerTimeCoinFlip: undefined;
  Magic8Ball: undefined;
  FortuneCookie: undefined;
  CasinoTrickSlot: undefined;

  // Fun fact screen
  FunFact: undefined;

  // Réel screens
  Home: undefined;                      // Dans TopTab
  Profile: undefined;                   // Dans TopTab
};
