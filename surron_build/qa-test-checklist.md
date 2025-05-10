# SurRon Squad v2.0.0 - QA Test Checklist

This document outlines the testing procedures to verify that all features are working correctly after the migration to GameCore and Redux state management.

## Core Pages to Test

1. **squad-hq.html**
   - [ ] Player stats load correctly
   - [ ] Quest board displays available quests
   - [ ] Character relationships display correctly
   - [ ] Navigation to other game sections works

2. **buildpartsSelector.html**
   - [ ] Parts load correctly from system
   - [ ] Building and saving a bike works
   - [ ] Rewards trigger when saving (XP and SurCoins)
   - [ ] Squad commentary updates based on selections

3. **saved_builds.html**
   - [ ] Previously saved builds display correctly
   - [ ] Comparison feature works
   - [ ] Delete and load build functions work

4. **surron-shop.html**
   - [ ] Items load correctly
   - [ ] Player currency displays correctly
   - [ ] Purchase process works
   - [ ] Items are added to inventory when purchased

5. **adventure.html**
   - [ ] Map locations display correctly
   - [ ] Character relationships display correctly
   - [ ] Fishing game loads and works
   - [ ] Workshop navigation works

6. **settings.html**
   - [ ] Settings toggles work and save state
   - [ ] Import/export features work
   - [ ] Reset functionality works

## Testing Process

1. **Initialize Game**
   - [ ] Start at squad-hq.html
   - [ ] Verify GameCore loads correctly (check console)
   - [ ] Player state initializes with defaults

2. **Build a Bike**
   - [ ] Navigate to buildpartsSelector.html
   - [ ] Select parts and save a build
   - [ ] Verify XP and currency rewards

3. **Shop Interaction**
   - [ ] Navigate to surron-shop.html
   - [ ] Purchase an item
   - [ ] Verify currency decreases
   - [ ] Verify item appears in inventory

4. **Adventure Mode**
   - [ ] Navigate to adventure.html
   - [ ] Start fishing mini-game
   - [ ] Catch a fish and verify rewards

5. **Settings Management**
   - [ ] Navigate to settings.html
   - [ ] Change settings and verify they persist
   - [ ] Export save data
   - [ ] Reset game
   - [ ] Import save data

## Regression Tests

- [ ] No references to window.playerState anywhere
- [ ] No references to window.game anywhere
- [ ] No playerStateReady events firing
- [ ] Console shows no errors during normal gameplay

## Final Verification

- [ ] All pages use type="module" scripts
- [ ] All pages call GameCore.boot() to initialize
- [ ] No legacy files are loaded or referenced

## Notes

- Document any issues found during testing
- Check browser console for any errors or warnings
- Test on multiple browsers if possible (Chrome, Firefox, Edge)

Last updated: May 10, 2025 