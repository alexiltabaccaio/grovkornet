import { ImageSourcePropType } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GestureType, ComposedGesture } from 'react-native-gesture-handler';

type ThumbVariant = 'text' | 'slider' | 'preset';

export interface ParameterThumbViewProps {
  label: string;
  isActive: boolean;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  imageSource?: ImageSourcePropType;
  thumbnailComponent?: React.ReactNode;
  renderValue?: boolean;
  valueFormatter?: (val: number) => string;
  variant?: ThumbVariant;
  isAuto?: SharedValue<boolean>;
  staticText?: string;
  hideValueInAuto?: boolean;
  autoValueText?: string;
  isLayoutOverlayEnabled?: boolean;
  disabled?: SharedValue<boolean>;
  isToggle?: boolean;
  centerValue?: number;
  onReset?: () => void;
  onToggleAuto?: (active: boolean) => void;
  onPress?: () => void;
  hideAutoPlaceholder?: boolean;
  sliderTrackWidth?: SharedValue<number>;
  sliderColor?: string;
  parameterId?: string;
  isMainSlider?: boolean;
  labelGesture?: ComposedGesture | GestureType;
  trackGesture?: ComposedGesture | GestureType;
}

