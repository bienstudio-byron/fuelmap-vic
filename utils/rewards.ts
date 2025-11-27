import { BrandName } from '@/types';
import { Plane, ShoppingCart, Car, ShieldCheck } from 'lucide-react';

export interface RewardProgram {
  id: string;
  name: string;
  icon: any; // Lucide Icon
  color: string;
  description: string;
}

export const getRewardsForBrand = (brand: BrandName): RewardProgram[] => {
  const rewards: RewardProgram[] = [];

  // BP -> Qantas Points
  if (brand === 'BP') {
    rewards.push({
      id: 'qantas',
      name: 'Qantas Frequent Flyer',
      icon: Plane,
      color: 'text-red-600',
      description: 'Earn 2 points per litre on BP Ultimate'
    });
  }

  // Shell -> Flybuys (Coles)
  if (brand === 'Shell' || brand.includes('Coles')) {
    rewards.push({
      id: 'flybuys',
      name: 'Flybuys',
      icon: ShoppingCart,
      color: 'text-blue-600',
      description: 'Collect points & 4c off/L with docket'
    });
  }

  // Ampol -> Woolworths Rewards
  if (brand === 'Ampol') {
    rewards.push({
      id: 'everyday-rewards',
      name: 'Everyday Rewards',
      icon: ShoppingCart, // Orange usually
      color: 'text-orange-600',
      description: 'Collect points & 4c off/L'
    });
  }

  // 7-Eleven -> Velocity
  if (brand === '7-Eleven') {
    rewards.push({
      id: 'velocity',
      name: 'Velocity Points',
      icon: Plane,
      color: 'text-blue-800',
      description: 'Earn 2 points per litre on premium fuel'
    });
  }

  // RACV Members usually save at Ampol/Caltex/United
  if (brand === 'Ampol' || brand === 'United') {
    rewards.push({
      id: 'racv',
      name: 'RACV Member',
      icon: ShieldCheck, // Shield icon
      color: 'text-yellow-600',
      description: 'Save 4c/L - Show your card'
    });
  }

  return rewards;
};

