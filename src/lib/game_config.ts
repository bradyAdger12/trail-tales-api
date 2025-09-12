export type GameConfig = {
  food: number;
  water: number;
  health: number;
  dailyFoodLoss: number;
  dailyWaterLoss: number;
  minDistanceInKilometers: number;
  maxDistanceInKilometers: number;
  description: string;
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
export const gameConfig = {
  difficulty: {
    easy: {
      food: 80,
      water: 80,
      health: 90,
      dailyFoodLoss: 10,
      dailyWaterLoss: 10,
      minDistanceInKilometers: 1,
      maxDistanceInKilometers: 5,
      description: "You emerge from the wreckage with minor injuries but your survival instincts intact. Your backpack contains ample provisions to sustain you through the initial days of your wilderness ordeal.",
    } as GameConfig,
    medium: {
      food: 60,
      water: 60,
      health: 80,
      dailyFoodLoss: 15,
      dailyWaterLoss: 15,
      minDistanceInKilometers: 5,
      maxDistanceInKilometers: 10,
      description: "You crawl from the twisted wreckage, blood trickling from several wounds. Your head throbs and your vision blurs intermittently. Your backpack is torn, and much of your gear has scattered across the crash site, leaving you with limited supplies for the harsh wilderness ahead.",
    } as GameConfig,
    hard: {
      food: 40,
      water: 40,
      health: 50,
      dailyFoodLoss: 15,
      dailyWaterLoss: 15,
      minDistanceInKilometers: 8,
      maxDistanceInKilometers: 15,
      description: "You barely escape the burning wreckage with life-threatening injuries. Blood pours from multiple deep wounds, your left arm hangs useless, and every breath sends shooting pain through your ribs. Your backpack was destroyed in the crash, leaving you with nothing but the torn clothes on your back. The unforgiving wilderness stretches endlessly before you, and death feels closer than rescue.",
    } as GameConfig,
  },
};


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