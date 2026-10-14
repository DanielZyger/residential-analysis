import type { PropertyType } from '@er/shared';

export type TypeGroup = 'house' | 'apartment' | 'other';

const GROUPS: Record<PropertyType, TypeGroup> = {
  house: 'house',
  townhouse: 'house',
  land_house: 'house',
  apartment: 'apartment',
  penthouse: 'apartment',
  studio: 'apartment',
  other: 'other',
};

export function typeGroup(type: PropertyType): TypeGroup {
  return GROUPS[type];
}
