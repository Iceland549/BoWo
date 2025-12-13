export type RootStackParamList = {
  // Main Tabs container
  Main: undefined;

  // Trick flow
  TrickDetail: { trick: string };         
  TrickLearn: { trickId: string };      
  Quiz: { trickId: string };          

  // Mini-games
  MiniGameUnlockChoice: undefined;
  KillerTimeCoinFlip: undefined;
  Magic8Ball: undefined;
  FortuneCookie: undefined;
  CasinoTrickSlot: undefined;

  // Fun fact screen
  FunFact: undefined;

  // Réel screens
  Home: undefined;                      
  Profile: undefined;                   

  // Leagl screens
  LegalMenu: undefined;
  Terms: undefined;
  Privacy: undefined;
  DeleteAccount: undefined;

  // Collection screen
  Collection: undefined;
  
  // Deck collection screen
  DeckCollection: {
    unlockedDecks: string[];
  };
  AliveDecks: undefined

  // Avatar Shape Shop
  AvatarShapeShop: undefined;
};
