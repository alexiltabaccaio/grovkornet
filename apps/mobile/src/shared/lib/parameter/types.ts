import { SharedValue } from 'react-native-reanimated';

export interface ParameterControlData {
  value: SharedValue<number>;
  minValue: number;
  maxValue: number;
  centerValue?: number;
  onChange: (v: number) => void;
  onUpdateWorklet?: (v: number) => void;
  isAuto?: SharedValue<boolean>;
  valueFormatter: (v: number) => string;
  hideValueInAuto?: boolean;
  autoValueText?: string;
  onReset?: () => void;
  onToggleAuto?: (auto: boolean) => void;
  disabled?: SharedValue<boolean>;
}
