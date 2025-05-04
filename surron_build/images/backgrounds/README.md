# Background Images for Surron Squad Adventure

This directory contains background images needed for the Surron Squad Adventure mode. The adventure engine references these images in the story scenes.

## Required Images

The following background images are needed for the adventure engine to work properly:

1. `workshop-night.jpg` - Charlie's workshop at night, dimly lit with tools and bike parts
2. `workshop-table.jpg` - Close-up of a table in Charlie's workshop with parts and pizza
3. `truck-loading.jpg` - Billy's truck being loaded with equipment
4. `warehouse-exterior.jpg` - Exterior of an industrial warehouse at night
5. `warehouse-side.jpg` - Side entrance of the warehouse with a security door
6. `warehouse-interior.jpg` - Inside of the warehouse filled with shelves of bike parts
7. `parts-collection.jpg` - The squad collecting electric bike parts

## Image Specifications

- All images should be JPG format
- Recommended resolution: 1200x800 pixels
- File size: Keep under 300KB per image for optimal loading

## Placeholder Images

Until actual images are created or sourced, you can use solid color placeholders or Creative Commons images that fit the theme. Make sure to credit the original creators if using external images.

## Adding New Backgrounds

When adding new story scenes to the adventure engine, create corresponding background images and add them to this directory. Then reference them in the `storyScenes` object in `adventure-engine.js` using the relative path format: `images/backgrounds/filename.jpg`. 