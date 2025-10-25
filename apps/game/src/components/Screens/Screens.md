The following Figma boards represent the entirety of the Screens that exist for the game. Screens relate to a specific state found in the [gameFlowMachine](../../machines/gameFlowMachine.ts). Gameplay is handled by the Game component, but Screen components will exist for events and actions that can occur throughout a game, such as when an effect card is tapped to reveal information, the "Data War", "Hostile Takeover", "Open What You Want", "Launch Stack", mechanisms are triggered, or the game has been won by the computer or the player.

Screens are rendered by the [ScreenRenderer](../ScreenRenderer/index.tsx) component. Screen backgrounds are rendered by the ScreenRenderer's [Background](../ScreenRenderer/Background.tsx) subcomponent, but the tabletop background is rendered by the [Board](../Board/index.tsx) component.

## Mobile Screens

[Page](https://www.figma.com/design/J4P0OmFgogb22j0fh9LO1N/Data-War-Digital?node-id=676-10902&m=dev)

## Desktop Screens

[Page](https://www.figma.com/design/J4P0OmFgogb22j0fh9LO1N/Data-War-Digital?node-id=676-10903&m=dev)
