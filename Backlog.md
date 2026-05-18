## Bugs

- Expected: Play button should reset time to 0 if pressed when scrubber is stopped at 100% right position. Actual: Nothing happens.

## UX Improvements

### Main POV

The main POV (main content area) has many labels and pills in the top. It should be simplified.

1. Outer Space POV does not need a 'Ship clock' pill since it duplicates the value in another header label. Same for Earth POV 'Local clock'. There is an additional label that shows this above the pills. Remove.
2. Earth pill for 'Received ship X at Y' can be removed for the same reason. the Telescope view shows that value. 
3. So Earth POV just has one pill for whether or not the turnaround is visible and travelor POV just has the distance from earth pill.
4. New pills. Earth POV should have a pill indicating Slow or fast motion being observed based on the light delay. So when the traveler is flying away it says 'Traveler appears to age slowly' and when return signal arrives it says 'traveler appears to age quickly'. Traveler POV should have a pill that says 'Earth appears to age slowly' when flying away and immediately switches to 'Earth appears to age quickly' as soon as the ship turns around.
5. In Earth POV there is a label that says 'Earth local experience'. Remove it since Earth POV is already represented in another title label.

### Color shifting

In real relativity an observer with a telescope would see a color shift (red or blue) depending on the direction of travel. Modify our Telescope view to apply the proper color shift. Build the functions that determine the color into the proper model layer and ensure test coverage.

### Scene improvements

The Earth POV is too dark and should have its camera angle and distance placed so that it looks like there is a horizon and a blue sky.
The Traveler POV has a planet in the background that makes no sense since the traveler is supposed to be flying very fast. Remove this planet and add movement to the stars that are aligned with the movement of the traveler. The star movement can be symbolic and does not have to be simulation accurate.

The Red color of the outer space tree trunk is lame. It should be more of a neon green which will contrast nicely with the neon blue leaves.
