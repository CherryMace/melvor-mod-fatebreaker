// Storing references
const sealedFate = game.specialAttacks.getObjectByID('melvorTotH:SealedFate');
const player = game.combat.player;

// We will use our stat provider to dynamically grant Auto Eat Threshold and HP Limit
const statProvider = {
  modifiers: new MappedModifiers(),
  // Stat providers can also add things like enemy modifiers, conditional modifiers,
  // and combat stat bonuses (damage reduction, etc.). However, we only need player
  // modifiers in this case.
};

/**
 * The JavaScript entrypoint for the mod
 * @param {*} ctx The mod's context object
 */
export function setup(ctx) {
  addModifierData();
  player.registerStatProvider(statProvider);
  ctx.patch(Enemy, 'queueNextAction').after(queueNextActionPatch);
}

/**
 * Sets up the new modifier (brokenFate) for use
 */
function addModifierData() {
  // Add the modifier's data to the global `modifierData` object.
  // This object stores information about all available modifiers in the game,
  // and is used for things like displaying the modifier in an item's description.
  const description = `While the enemy is attacking with ${sealedFate.name}, Auto Eat Threshold and Auto Eat HP Limit are set to \${value}%`;
  modifierData.brokenFate = {
    get langDescription() {
      return description;
    },
    description,
    isSkill: false,
    isNegative: false,
    tags: ['combat'],
  };

  // Initialize the modifier to 0, otherwise granting bonus values results in NaN
  // (undefined + 91 = NaN)
  player.modifiers.brokenFate = 0;
}

/**
 * Patch into the enemy's `queueNextAction` method to determine when they are using Sealed Fate
 */
function queueNextActionPatch() {
  // If the player is wearing the Fatebreaker's Seal and the enemy is using Sealed Fate
  if (player.modifiers.brokenFate > 0 && this.nextAction === 'Attack' && this.nextAttack.id === sealedFate.id) {
    onBeginSealedFate();
  } else {
    onEndSealedFate();
  }
}

/**
 * Called when the enemy starts a Sealed Fate attack
 */
function onBeginSealedFate() {
  // Calculate the threshold and HP limit needed to be granted to reach 91%
  // `player.modifiers.brokenFate` is used instead of hardcoding 91
  const increasedAutoEatThreshold = player.modifiers.brokenFate
    - player.modifiers.increasedAutoEatThreshold
    + player.modifiers.decreasedAutoEatThreshold;
  const increasedAutoEatHPLimit = player.modifiers.brokenFate
    - player.modifiers.increasedAutoEatHPLimit
    + player.modifiers.decreasedAutoEatHPLimit;

  // Register these modifiers with the stat provider, which will automatically be
  // added upon recomputing the player's modifiers
  statProvider.modifiers.addModifiers({
    increasedAutoEatThreshold,
    increasedAutoEatHPLimit,
  });

  // Force the player's modifiers to recompute since the beginning of an enemy's attack
  // is not a usual trigger point for recalculation
  player.computeModifiers();
  // Force the player to auto eat since auto eating usually only takes place upon
  // taking damage, but the player could be under their auto eat threshold now
  player.autoEat();
}

/**
 * Called when the enemy starts any action that is not Sealed Fate
 */
function onEndSealedFate() {
  // Avoid expensive recalculations if there's no need
  // i.e. the enemy's previous action was also not Sealed Fate
  if (!statProvider.modifiers.standardModifiers.size) return;

  // Clear out the stat provider's modifiers (Auto Eat Threshold & HP Limit)
  statProvider.modifiers.reset();
  // Force the player's modifiers to recompute since the end of an enemy's attack
  // is not a usual trigger point for recalculation
  player.computeModifiers();
}
