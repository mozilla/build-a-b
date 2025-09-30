import type { Choice, ChoiceConfig, ChoiceGroup, GameChoices } from '@/types';

export const choiceGroupMap: Record<ChoiceGroup, Choice[]> = {
  'origin-story': ['inherited', 'manipulator', 'data.thief', 'crypto.king', 'med.mogul'],
  'core-drive': ['power', 'chaos', 'immortality', 'control', 'fame'],
  'public-mask': ['eco.fake', 'visionary', 'rebel', 'savior', 'genius'],
  'power-play': ['raiders', 'shadows', 'data.mine', 'media.spin', 'policy.hack'],
  'legacy-plan': ['mars', 'fountain.of.youth', 'clone.library', 'ai.diety', 'sea.lord'],
};

export const groupDescriptionMap: Record<ChoiceGroup, { title: string; description: string }> = {
  'origin-story': {
    title: 'Pick an Origin Story',
    description: 'Checkered past? I’m more of a chess person.',
  },
  'core-drive': {
    title: 'Pick a Core Drive',
    description:
      'Being a Billionaire comes with some very motivating benefits. Or symptoms, as the rest of us call them.',
  },
  'legacy-plan': {
    title: 'Pick a Legacy Plan',
    description:
      'How will you be remembered when your only heir records over your uploaded consciousness with their AI “companion?”',
  },
  'power-play': {
    title: 'Pick a Power Play',
    description: 'Go big or go to one of your dozens of homes.',
  },
  'public-mask': {
    title: 'Pick a Public Mask',
    description:
      'Coming right out with your transparent plans and motives never plays well with the board.',
  },
};

export const phrasesMap: Record<Choice, string> = {
  inherited: 'Nothing fuels the myth of rugged individualism like an absence of hardship.',
  manipulator: 'They’re not exploiting your data. They’re maximizing your experience.',
  'data.thief': 'Honey, have you seen my personally identifying information?',
  'crypto.king': 'What even is “real” money anyway?',
  'med.mogul': 'Ask your doctor if raising a drug price by 100x is right for your portfolio',
  power: 'The feeling of lightning striking right after you say something cool.',
  chaos: '“Move fast and break things” sure broke things fast.',
  immortality: 'Living forever is set for clinical trials next year.',
  control: 'Expand your sphere of influence.',
  fame: 'A choice motive for only the most discerning attention hog.',
  'eco.fake':
    'With some carbon credit cunning, you can earn your pollution fines back and then some!',
  visionary: 'If the people understand, you’re not doing it right.',
  rebel: 'Wearing a t-shirt and flip flops to the board meeting lets them know who’s in charge.',
  savior: 'Nothing says “philanthropist” like your name on a building.',
  genius: 'Beyond a certain level of wealth, seeming dumber makes you seem smarter.',
  raiders: 'Finance films meant to be cautionary tales are your pre-workout.',
  shadows: 'This meeting never happened.',
  'data.mine': 'To get to space, sometimes you have to dig.',
  'media.spin': 'Talking heads don’t get their talking points from nowhere.',
  'policy.hack': 'A couple whithertos and wherebys aaaand we are clear to test on unicorns. ',
  mars: 'One day, I’m going to have my own planet, and you won’t be invited, and you’ll all be sorry.',
  'fountain.of.youth':
    "Everyone's trying to live longer. Some are just trying to live longer than those people.",
  'clone.library': 'What would the future do without your exact gene sequence?',
  'ai.diety': "It'll be the prompt to end all prompts to end all prompts to end all prompts.",
  'sea.lord': 'Please attend my four-part lecture series on how Poseidon is real.',
  '': 'N/A',
};

export const choiceMap: GameChoices = Object.entries(choiceGroupMap).reduce(
  (acc, [group, choices]) => {
    const typedGroup = group as ChoiceGroup;

    if (acc[typedGroup]) return acc;

    acc[typedGroup] = choices.reduce(
      (choicesConf, currentChoice, choiceIndex) => {
        if (choicesConf[currentChoice]) return choicesConf;

        choicesConf[currentChoice] = {
          icon: `/assets/images/choice-cards/${currentChoice}.svg`,
          iconWhenConfirmed: `/assets/images/choice-cards/${currentChoice}.svg`,
          phrase: phrasesMap[currentChoice],
          value: choiceIndex + 1,
          id: currentChoice,
        };

        return choicesConf;
      },
      {} as Record<Choice, ChoiceConfig>,
    );

    return acc;
  },
  {} as GameChoices,
);
