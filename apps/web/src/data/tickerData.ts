export interface TickerItem {
  id: number;
  text: string;
  emoji?: string;
  hashtag?: string | null;
}

export const tickerDataHashtag: TickerItem[] = [
  {
    id: 1,
    text: '@POKIMANE',
    emoji: '🚀',
    hashtag: '#BILLIONAIREBLASTOFF',
  },
  {
    id: 2,
    emoji: '🪐',
    text: '@CRISPYBEAR',
    hashtag: '#BILLIONAIREBLASTOFF',
  },
  {
    id: 3,
    emoji: '🚀',
    text: '@GAMEWITCH',
    hashtag: '#BILLIONAIREBLASTOFF',
  },
];

export const tickerData: TickerItem[] = [
  {
    id: 4,
    text: 'SEND YOUR BILLIONAIRE TO SPACE',
    emoji: '🚀',
  },
  {
    id: 5,
    text: 'JOIN US AT TWITCHCON',
    emoji: '🪐',
  },
  {
    id: 6,
    text: 'BATTLE YOUR FRIENDS IN DATA WAR',
    emoji: '💰',
  },
];
