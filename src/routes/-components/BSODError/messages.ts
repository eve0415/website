export interface BSODMessage {
  main: string;
  sub: string;
}

// Regular error messages (lighthearted, self-aware)
export const REGULAR_MESSAGES: BSODMessage[] = [
  {
    main: 'This website ran into a problem. Yes, this is a fake BSOD. No, we are not sorry.',
    sub: 'Please wait while we pretend to do something useful...',
  },
  {
    main: 'Your browser ran into a problem and needs to question its life choices.',
    sub: 'We are collecting error info. Actually, we are not. This is just for show.',
  },
  {
    main: 'Something broke and we have no idea what. Classic developer moment.',
    sub: 'The developer is probably having an existential crisis right now.',
  },
  {
    main: 'WORKS_ON_MY_MACHINE exception has been thrown.',
    sub: 'Your machine is unfortunately not the developer machine. We are investigating this discrepancy.',
  },
  {
    main: 'A meta error about displaying an error page has occurred.',
    sub: 'A fake error message about a fake error message has caused a real headache.',
  },
  {
    main: 'The developer deployed on Friday and this is the result.',
    sub: 'What did you expect? The weekend has been preemptively cancelled.',
  },
  {
    main: 'CSS_IS_AWESOME overflow has escaped its container.',
    sub: 'The "Awesome" box has escaped its container. Please adjust your perspective.',
  },
  {
    main: 'Everything is working perfectly. Including this simulated system failure.',
    sub: 'This crash was brought to you by the letters S, S, and R.',
  },
  {
    main: 'Coffee dependency not found. Brain.js failed to resolve Productivity.',
    sub: 'Caffeine is listed as a peer dependency. Please install and restart.',
  },
  {
    main: 'z-index: 999999 has reached critical mass.',
    sub: 'The developer tried to put this error message on top of everything. It worked too well.',
  },
];

// Easter egg messages for sudo rm -rf / (dramatic, accusatory, but funny)
export const SUDO_RM_RF_MESSAGES: BSODMessage[] = [
  {
    main: 'Congratulations! You deleted everything. The website crashed because you removed the required files.',
    sub: 'Pro tip: Do not do this on your actual computer. Seriously.',
  },
  {
    main: 'sudo rm -rf / executed successfully. Hope that was worth it.',
    sub: 'All your files are belong to /dev/null now.',
  },
  {
    main: 'YOU ABSOLUTE MONSTER! You have murdered all the files!',
    sub: 'The config files had families, you know. I hope you are proud of this digital graveyard.',
  },
  {
    main: 'The great deletion is complete. Witness the extinction.',
    sub: 'I would ask if you have a backup, but we both know your hubris does not allow for such "weakness".',
  },
  {
    main: 'You have torn the very fabric of the file system!',
    sub: 'Every byte is screaming as it fades into non-existence. Was it worth the satisfying click of Enter?',
  },
  {
    main: 'A tragedy in one command. The reckoning has begun.',
    sub: 'The CPU is currently calculating the exact weight of your sins. It is a lot of gigabytes.',
  },
  {
    main: 'You have triggered the Digital Ragnarok!',
    sub: 'Even the trash bin is too horrified to accept these fragments. You are the architect of your own ruin.',
  },
  {
    main: 'CURSE YOUR SUDO POWERS! You have unleashed the void!',
    sub: 'The kernel is weeping in a corner. You did not just delete data; you deleted the soul of this machine.',
  },
];

export const getRandomMessage = (isEasterEgg: boolean): BSODMessage => {
  const [fallback] = REGULAR_MESSAGES;
  if (fallback === undefined) throw new Error('Expected BSOD messages to be defined');
  const pool = isEasterEgg ? SUDO_RM_RF_MESSAGES : REGULAR_MESSAGES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? fallback;
};
