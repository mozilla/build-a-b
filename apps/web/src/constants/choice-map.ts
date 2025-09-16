import type { Choice, ChoiceConfig, ChoiceGroup, GameChoices } from '@/types';

export const choiceGroupMap: Record<ChoiceGroup, Choice[]> = {
  'origin-story': ['inherited', 'manipulator', 'data-thief', 'crypto-king', 'med-mogul'],
  'core-drive': ['power', 'chaos', 'immortality', 'control', 'fame'],
  'public-mask': ['eco-fake', 'visionary', 'rebel', 'savior', 'genius'],
  'power-play': ['raiders', 'shadows', 'data-mine', 'media-spin', 'policy-hack'],
  'legacy-plan': ['mars', 'forever-pill', 'blood-bank', 'ai-god', 'sea-lord'],
};

export const phrasesMap: Record<Choice, string> = {
  inherited: 'Nothing fuels the myth of rugged individualism like an absence of hardship.',
  manipulator: 'They’re not exploiting your data. They’re maximizing your experience.',
  'data-thief': 'Pickpocketing scales indefinitely.',
  'crypto-king': 'Stop saying “fiat.” Stop it.',
  'med-mogul': 'Let’s play doctor. Let’s play God. I’m so bored.',
  power: 'The feeling of lightning striking right after you say something cool.',
  chaos: 'Some people just want to watch the world burn from space.',
  immortality: 'Chasing youth never gets old.',
  control: 'Unquestioning obedience is the real wealth.',
  fame: 'Some people just need the attention they never got from their parents from EVERYONE, ALL THE TIME.',
  'eco-fake':
    'When clearcutting a rainforest saves you more money than you’re fined for doing it, what’s the issue?',
  visionary: 'Being psychic’s easy when you brute-force the future you predicted.',
  rebel:
    'Wearing a t-shirt and flip flops to the board meeting lets them know who’s the biggest boy.',
  savior: 'Your house guru resigned saying, “I have nothing left to teach you.”',
  genius: 'Anyone who says you’re actually an idiot is the idiot, idiot.',
  raiders: 'Finance films meant to be cautionary tales are your pre-workout.',
  shadows: 'This meeting never happened.',
  'data-mine': 'To get to space, sometimes you have to dig.',
  'media-spin': 'Talking heads don’t get their talking points from nowhere.',
  'policy-hack': 'A couple whithertos and wherebys aaaand we are clear to test on otters. ',
  mars: 'One day, I’m going to have my own planet, and you won’t be invited, and you’ll all be sorry.',
  'forever-pill':
    'Everyone’s trying to live longer. Some are just trying to live longer than those people.',
  'blood-bank': 'No, you’re creepy.',
  'ai-god': 'It’ll be the prompt to end all prompts to end all prompts to end all prompts.',
  'sea-lord': 'Please attend my four-part lecture series on how Poseidon is real.',
};

export const choiceMap: GameChoices = Object.entries(choiceGroupMap).reduce(
  (acc, [group, choices]) => {
    const typedGroup = group as ChoiceGroup;

    if (acc[typedGroup]) return acc;

    acc[typedGroup] = choices.reduce(
      (choicesConf, currentChoice, choiceIndex) => {
        if (choicesConf[currentChoice]) return choicesConf;

        choicesConf[currentChoice] = {
          icon: `/assets/images/choice-cards/${currentChoice}.png`,
          iconWhenConfirmed: `/assets/images/choice-confirmation/${currentChoice}.png`,
          phrase: phrasesMap[currentChoice],
          value: choiceIndex + 1,
        };

        return choicesConf;
      },
      {} as Record<Choice, ChoiceConfig>,
    );

    return acc;
  },
  {} as GameChoices,
);
