export type GameConfig = {
  food: number;
  water: number;
  health: number;
  dailyFoodLoss: number;
  dailyWaterLoss: number;
  minDurationInSeconds: number;
  maxDurationInSeconds: number;
  description: string;
}

export type OvernightEvent = {
  name: string;
  resource: 'food' | 'water' | 'health';
  resource_change_as_percent: number;
}

export type StoryOption = {
  name: string;
  difficulty: string;
  canFindFood: boolean;
  canFindWater: boolean;
  canFindHealth: boolean;
  distance?: number;
  hungerChange?: number;
  thirstChange?: number;
  healthChange?: number;
  injuryChance?: number;
}

const DAILY_FOOD_LOSS = 5
const DAILY_WATER_LOSS = 5

export const gameConfig = {
  difficulty: {
    easy: {
      food: 80,
      water: 80,
      health: 90,
      dailyFoodLoss: DAILY_FOOD_LOSS,
      dailyWaterLoss: DAILY_WATER_LOSS, 
      minDurationInSeconds: 60 * 20,
      maxDurationInSeconds: 60 * 35,
      description: "You emerge from the wreckage with minor injuries but your survival instincts intact. Your backpack contains ample provisions to sustain you through the initial days of your wilderness ordeal.",
    } as GameConfig,
    medium: {
      food: 60,
      water: 60,
      health: 80,
      dailyFoodLoss: DAILY_FOOD_LOSS,
      dailyWaterLoss: DAILY_WATER_LOSS,
      minDurationInSeconds: 60 * 35,
      maxDurationInSeconds: 60 * 45,
      description: "You crawl from the twisted wreckage, blood trickling from several wounds. Your head throbs and your vision blurs intermittently. Your backpack is torn, and much of your gear has scattered across the crash site, leaving you with limited supplies for the harsh wilderness ahead.",
    } as GameConfig,
    hard: {
      food: 40,
      water: 40,
      health: 50,
      dailyFoodLoss: DAILY_FOOD_LOSS,
      dailyWaterLoss: DAILY_WATER_LOSS,
      minDurationInSeconds: 60 * 45,
      maxDurationInSeconds: 60 * 60,
      description: "You barely escape the burning wreckage with life-threatening injuries. Blood pours from multiple deep wounds, your left arm hangs useless, and every breath sends shooting pain through your ribs. Your backpack was destroyed in the crash, leaving you with nothing but the torn clothes on your back. The unforgiving wilderness stretches endlessly before you, and death feels closer than rescue.",
    } as GameConfig,
  },
};

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}


export const easyStoryOptions: StoryOption[] = [
  { name: "Search the crash site for supplies", difficulty: "easy", canFindFood: true, canFindWater: true, canFindHealth: true },
  { name: "Collect rainwater in makeshift containers", difficulty: "easy", canFindFood: false, canFindWater: true, canFindHealth: false },
  { name: "Gather coconuts from palm trees", difficulty: "easy", canFindFood: true, canFindWater: true, canFindHealth: false },
  { name: "Search for edible plants", difficulty: "easy", canFindFood: true, canFindWater: false, canFindHealth: false },
  { name: "Dig a small pit to trap rainwater", difficulty: "easy", canFindFood: false, canFindWater: true, canFindHealth: false },
  { name: "Patch up torn clothing for warmth", difficulty: "easy", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Forage for wild berries", difficulty: "easy", canFindFood: true, canFindWater: false, canFindHealth: false },
  { name: "Search for dry tinder to start a fire", difficulty: "easy", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Collect large leaves for shelter roofing", difficulty: "easy", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Search shallow pools for fish and fresh water", difficulty: "easy", canFindFood: true, canFindWater: true, canFindHealth: false },
  { name: "Explore a small cave for shelter materials and edible roots", difficulty: "easy", canFindFood: true, canFindWater: false, canFindHealth: true },
  { name: "Follow a stream to find drinking water and medicinal herbs", difficulty: "easy", canFindFood: false, canFindWater: true, canFindHealth: true },
]

export const mediumStoryOptions: StoryOption[] = [
  { name: "Explore the nearby forest", difficulty: "medium", canFindFood: true, canFindWater: true, canFindHealth: false },
  { name: "Fish along the rocky coast", difficulty: "medium", canFindFood: true, canFindWater: false, canFindHealth: false },
  { name: "Search tide pools for crabs and shellfish", difficulty: "medium", canFindFood: true, canFindWater: false, canFindHealth: false },
  { name: "Follow animal tracks to find fresh water", difficulty: "medium", canFindFood: false, canFindWater: true, canFindHealth: false },
  { name: "Collect firewood for a signal fire", difficulty: "medium", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Build a makeshift spear", difficulty: "medium", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Search under driftwood for insects to eat", difficulty: "medium", canFindFood: true, canFindWater: false, canFindHealth: false },
  { name: "Track birds to find a nesting area", difficulty: "medium", canFindFood: true, canFindWater: false, canFindHealth: false },
  { name: "Explore a freshwater stream for fish and drinking water", difficulty: "medium", canFindFood: true, canFindWater: true, canFindHealth: false },
  { name: "Search a fallen tree for grubs and collect sap for wounds", difficulty: "medium", canFindFood: true, canFindWater: false, canFindHealth: true },
  { name: "Investigate a natural spring and gather medicinal plants nearby", difficulty: "medium", canFindFood: false, canFindWater: true, canFindHealth: true }
]

export const hardStoryOptions: StoryOption[] = [
  { name: "Build a makeshift shelter", difficulty: "hard", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Climb the hill for a better view", difficulty: "hard", canFindFood: false, canFindWater: true, canFindHealth: false },
  { name: "Hunt small animals with improvised tools", difficulty: "hard", canFindFood: true, canFindWater: false, canFindHealth: false },
  { name: "Venture deeper into the jungle", difficulty: "hard", canFindFood: true, canFindWater: true, canFindHealth: false },
  { name: "Set up a signal using wreckage parts", difficulty: "hard", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Inspect the coastline for possible escape routes", difficulty: "hard", canFindFood: true, canFindWater: false, canFindHealth: false },
  { name: "Explore a nearby cave", difficulty: "hard", canFindFood: true, canFindWater: true, canFindHealth: false },
  { name: "Attempt to repair a broken radio", difficulty: "hard", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Scale dangerous cliffs to reach a hidden waterfall and fruit trees", difficulty: "hard", canFindFood: true, canFindWater: true, canFindHealth: false },
  { name: "Navigate through thorny undergrowth to find a natural pharmacy of healing plants and fresh spring water", difficulty: "hard", canFindFood: false, canFindWater: true, canFindHealth: true },
  { name: "Risk crossing a fast-moving river to access a grove with fruit trees and medicinal bark", difficulty: "hard", canFindFood: true, canFindWater: false, canFindHealth: true },
]

export const restStoryOptions: StoryOption[] = [
  { name: "Rest by the fire and tend to your wounds", difficulty: "rest", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Sleep in your shelter to regain strength", difficulty: "rest", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Meditate and focus on healing", difficulty: "rest", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Stay put and conserve energy", difficulty: "rest", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Lie down and let your body recover", difficulty: "rest", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Take a peaceful nap in the shade", difficulty: "rest", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Sit quietly and regain your composure", difficulty: "rest", canFindFood: false, canFindWater: false, canFindHealth: true },
  { name: "Rest against a tree and watch the horizon", difficulty: "rest", canFindFood: false, canFindWater: false, canFindHealth: true },
]


export const overnightEvents: OvernightEvent[] = [
  { name: "You discover a hidden cache of food left by previous survivors", resource: 'food', resource_change_as_percent: getRandomNumber(5, 10) },
  { name: "A friendly dolphin brings you fish while you rest by the shore", resource: 'food', resource_change_as_percent: getRandomNumber(5, 10) },
  { name: "You find a natural hot spring that provides clean water", resource: 'water', resource_change_as_percent: getRandomNumber(5, 10) },
  { name: "A flock of migrating birds drops exotic fruits near your camp", resource: 'food', resource_change_as_percent: getRandomNumber(5, 10) },
  { name: "A gentle rain fills your water containers while you sleep peacefully", resource: 'water', resource_change_as_percent: getRandomNumber(5, 10) },
  { name: "A pack of wild animals circles your camp, keeping you awake and on edge all night", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
  { name: "You develop a fever from an infected wound and spend the night shivering", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
  { name: "Poisonous insects bite you repeatedly during the night", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
  { name: "A severe thunderstorm destroys part of your shelter, leaving you exposed to the elements", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
  { name: "You accidentally eat spoiled food and spend the night violently ill", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
  { name: "Sharp rocks and thorns tear at your skin as you sleep restlessly", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10)   },
  { name: "A venomous snake bites you in your sleep, causing weakness and nausea", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
  { name: "Extreme cold penetrates your inadequate shelter, causing hypothermia symptoms", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
  { name: "You fall into a hidden pit during the night and injure yourself climbing out", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
  { name: "Toxic fumes from nearby volcanic activity make you sick throughout the night", resource: 'health', resource_change_as_percent: getRandomNumber(-5, -10) },
]