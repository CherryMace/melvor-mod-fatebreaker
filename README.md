# The Fatebreaker
 Example mod for Melvor Idle that adds custom items and additional data modifications

 [Subscibe on mod.io](https://mod.io/g/melvoridle/m/the-fatebreaker)

## Where to Look
 If interested in data registration (creation) and modifications, like of items, view [data.json](data.json). It contains examples of the following:
 * Registering 3 new items
 * Registering an item upgrade for combining 2 of the items to create the other
 * Registering a Shop purchase and its corresponding `shopDisplayOrder`
 * Modifies a monster's loot table

 If interested in implementing a new modifier, you may want to view [setup.mjs](setup.mjs). The Fatebreaker amulet has a new modifier/passive that dynamically adjusts the player's Auto Eat Threshold & HP Limit depending on the enemy's attack.