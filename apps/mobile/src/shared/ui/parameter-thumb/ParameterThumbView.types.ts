import { ImageSourcePropType } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type ThumbVariant = 'text' | 'slider' | 'preset';

export interface ParameterThumbViewProps {
  label: string;
  isActive: boolean;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  imageSource?: ImageSourcePropType;
  renderValue?: boolean;
  valueFormatter?: (val: number) => string;
  variant?: ThumbVariant;
  isAuto?: SharedValue<boolean>;
  staticText?: string;
  hideValueInAuto?: boolean;
  autoValueText?: string;
  isDebugEnabled?: boolean;
  disabled?: SharedValue<boolean>;
  isToggle?: boolean;
  centerValue?: number;
  onReset?: () => void;
  onToggleAuto?: (active: boolean) => void;
  onPress?: () => void;
  hideAutoPlaceholder?: boolean;
  sliderTrackWidth?: SharedValue<number>;
  sliderColor?: string;
}

