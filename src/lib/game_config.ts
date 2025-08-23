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
      food: 20,
      water: 20,
      health: 50,
      dailyFoodLoss: 20,
      dailyWaterLoss: 20,
      minDistanceInKilometers: 8,
      maxDistanceInKilometers: 20,
      description: "You barely escape the burning wreckage with life-threatening injuries. Blood pours from multiple deep wounds, your left arm hangs useless, and every breath sends shooting pain through your ribs. Your backpack was destroyed in the crash, leaving you with nothing but the torn clothes on your back. The unforgiving wilderness stretches endlessly before you, and death feels closer than rescue.",
    } as GameConfig,
  },
};