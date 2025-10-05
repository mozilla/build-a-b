import Image from 'next/image';
import SimpleItemCard from '@/components/DataWar/SimpleItemCard';

const FullInstructions = () => {
    return (
        <section 
            className="relative bg-[#F8F6F4] text-charcoal 
                border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem]
                portrait:mt-8 mb-4 landscape:mb-8 pl-3 pr-4 pt-4 pb-4 landscape:pl-12 landscape:pr-12
                        landscape:pt-12 landscape:pb-12">
            <div className='flex flex-col landscape:flex-row'>
                <div className='landscape:pr-8 order-2 landscape:order-1'>
                    <h1 
                        className="text-title-1 landscape:text-5xl-custom">
                            Full Data War instructions
                    </h1>
                    <p className="text-sm-custom mt-2">Some people learn by playing. Those people hate detailed instructions, but they'll love you for reading them when they have a question.</p>
                </div>
                <div className='order-1 landscape:order-2 portrait:mb-5 portrait:flex portrait:justify-center'>
                    <Image
                        src='/assets/images/bbo-logo.webp'
                        width={174}
                        height={85}
                        alt='Billionaire Blast Off Logo'
                        className='aspect-[174/85]'
                    />
                </div>
            </div>
            <div className='mt-5'>
                <SimpleItemCard
                    title='Setup'
                    prefixTitle='1'
                    image='/assets/images/data-war/01-setup.webp'
                    imageAlt='Setup Image'
                >
                    <h3 className='text-title-3 mb-4 mt-4'>Set aside the One Way Ticket to Space</h3>
                    <p>Keep it face up. This is the Win Card and can only be purchased with 3 Launch Stacks + 1 Billionaire, or a full deck of cards.</p>
                    <h3 className='text-title-3 mb-4 mt-4'>Shuffle remaining cards and deal</h3>
                    <p>Shuffle all remaining cards and deal out evenly to all players, with each player keeping them in a single pile face down in front of them.</p>
                </SimpleItemCard>

                <SimpleItemCard
                    title='Gameplay'
                    prefixTitle='2'
                    image='/assets/images/data-war/02-gameplay.webp'
                    imageAlt='Gameplay Image'
                >
                    <h3 className='text-title-3 mb-4 mt-4'>High value wins, high ties go to (Data) War!</h3>
                    <p className='mt-3'>In War, tied players each lay 3 cards face down and 1 more face up. Winner takes all, or they go to Data War again.</p>
                    <ul className='mt-2 mb-2 list-[circle] ml-6'>
                        <li className='mb-2'><strong>DO NOT look at the face-down cards won in War. </strong>Add them face down to the bottom of your deck with all other cards won during the turn.</li>
                        <li className='mb-2'>The value of your play in a war is the combination of card values played AFTER the face down cards.</li>
                        <li className='mb-2'><strong>Mercy Rule: </strong>If one player doesn't have enough cards for a full War, limit face down cards so they can play a final card. (Or don't. Billionaires make up rules all the time.) </li>
                    </ul>
                    <h3 className='text-title-3 mb-4 mt-6'>Follow instructions on special cards</h3>
                    <p className='mt-3'>Chain cards, and apply special effects where instructed (even during War). </p>
                    <p className='mt-3'><strong>If a Tracker card is played...</strong></p>
                    <ul className='mt-2 mb-2 list-[circle] ml-6'>
                        <li>Play another card and add the Tracker value to your total as instructed on the card. </li>
                    </ul>
                    <p><strong>If a Blocker card is played (expansion only)...</strong></p>
                    <ul className='mt-2 mb-2 list-[circle] ml-6'>
                        <li>Play another card and subtract the Blocker value from all opponent plays. </li>
                    </ul>
                    <p><strong>If a Data Grab is played...it's scramble time!</strong></p>
                    <ul className='mt-2 mb-2 list-[circle] ml-6'>
                        <li>All players reach in and grab as many cards as they can from the play area only, leaving other players' decks and collected Billionaires and Launch Stacks alone.</li>
                    </ul>
                    <p><strong>If a Launch Stack or Billionaire card is played...</strong></p>
                    <ul className='mt-2 mb-2 list-[circle] ml-6'>
                        <li><strong>Play another card </strong>and add the value to your total as instructed. Collect and set aside after winning the hand.</li>
                    </ul>
                </SimpleItemCard>

                <SimpleItemCard
                    title='Firewalls & Billionaire Moves'
                    prefixTitle='3'
                    image='/assets/images/data-war/03-firewalls.webp'
                    imageAlt='Firewalls & Billionaire Moves Image'
                >
                    <h3  className='text-title-3 mb-4 mt-4'>Use the card value (6) for your play and follow instructions on the card if conditions are met. </h3>
                    <p>Firewalls and Billionaire Moves are the OP opposing forces of the game. Each has a base value of 6 and a special effect that MUST be performed if conditions are met. </p>
                    <ul  className='mt-2 mb-2 list-[circle] ml-6'>
                        <li className='mb-2'><strong>Instant effects </strong>happen immediately. If multiple cards are played with instant effects, perform the<strong> Firewall </strong>effect first. </li>
                        <li className='mb-2'><strong>Forced Empathy </strong>only affects decks, not cards in the play area or Launch Stacks and Billionaire cards that have been set aside, and must be performed instantly, no matter what else is going on.</li>
                        <li className='mb-2'><strong>Hostile Takeover </strong>affects<strong> all opponents, </strong>even if there's only one other player.
                            <ul  className='mb-2 list-[disc] ml-6'>
                                <li>Opponents lay 3 cards face down and 1 face up, and play their new value against the original 6 from Hostile takeover, going to War from there if needed.</li>
                                <li>Hostile Takeover “6” value also ignores any Trackers or Blockers previously laid by the same player.</li>
                            </ul>
                        </li>
                        <li className='mb-2'>Firewall and Billionaire Move effects<strong> stack </strong>over the course of the hand, including after War is played mid-hand, unless otherwise noted (as in "Hostile Takeover"). Reconcile<strong> all effects in the play area </strong>at the end of the hand. </li>
                    </ul>
                </SimpleItemCard>

                <SimpleItemCard
                    title='Billionaires'
                    prefixTitle='4'
                    image='/assets/images/data-war/04-billionaires.webp'
                    imageAlt='Billionaires Image'
                >
                    <h3 className='text-title-3 mb-4 mt-4'>Collect and use Billionaires</h3>
                    <ul className='mt-2 mb-2 list-[circle] ml-6'>
                        <li className='mb-2'>Set them aside with your Launch Stacks and pay attention to their special powers, which can be used while in the possession of a player.</li>
                        <li className='mb-2'>Billionaire powers take effect instantly, and require the Billionaire to be added to the bottom of the player's deck after use, so be strategic about when you use them! (You still need one Billionaire to win.)  </li>
                        <li className='mb-2'>Each player can have as many Billionaires as they can collect until they use their powers or win the game.  </li>
                    </ul>
                </SimpleItemCard>

                <SimpleItemCard
                    title='Winning & Losing'
                    prefixTitle='5'
                    image='/assets/images/data-war/05-wining.webp'
                    imageAlt='Winning & Losing Image'
                >
                    <h3 className='text-title-3 mb-4 mt-4'>Win Conditions</h3>
                    <ul className='mt-2 mb-2 list-[circle] ml-6'>
                        <li className='mb-2'><strong>Collect 3 Launch Stacks + 1 Billionaire </strong>and trade them for your<strong> One Way Ticket to Space!</strong></li>
                        <li className='mb-2'><strong>Collect all cards in the deck?! </strong>(rare, but can be done). Remember, don't look at face down cards won in War, just add them to your deck!</li>
                    </ul>
                    <h3 className='text-title-3 mb-4 mt-4'>Ran out of cards? (3-4 players only)</h3>
                    <p>Don't worry, you can still make a comeback even after you're out of cards!</p>
                    <ul className='mt-2 mb-2 list-[circle] ml-6'>
                        <li className='mb-2'>If someone lays a<strong> Data Grab, </strong>grab your way back in the game!</li>
                        <li className='mb-2'>If someone plays<strong> Forced Empathy, </strong>you'll get a new deck and the sorry sucker to your right will be out.</li>
                        <li className='mb-2'>Is your last card a<strong> Temper Tantrum? </strong>Congrats! You get 2 cards from everyone if you lose the hand.</li>

                    </ul>
                    <h3 className='text-title-3 mb-4 mt-4'>Redistributing Launch Stacks & Billionaires</h3>
                    <p>If a player is eliminated by running out of cards while in possession of<strong> Launch Stack </strong>and/or<strong> Billionaire cards, </strong>the eliminated player plays one of them into the play area per turn, like a forced liquidation! Winners add them to their collection, and might be on a fast path to blast off (winning)!</p>
                </SimpleItemCard>

            </div>

            
        </section>
    );
}

export default FullInstructions;