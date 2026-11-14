import React from 'react';
import { Text, View } from 'react-native';
import { HabitCadence } from '../../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../../types/habitConfig';
import Stepper from './Stepper';
import { formStyles } from './formStyles';

// TARGET: read-only for Day, a stepper with "of N max" otherwise (gaps doc 1.1, 1.2)
interface CadenceTargetFieldProps {
  cadence: HabitCadence;
  value: number;
  onChange: (value: number) => void;
  testID: string;
}

export default function CadenceTargetField({
  cadence,
  value,
  onChange,
  testID,
}: CadenceTargetFieldProps): React.JSX.Element {
  return (
    <View style={formStyles.card}>
      {cadence === 'Day' ? (
        <Text testID={`${testID}-day`} style={formStyles.readOnly}>
          Repeats every day, no target needed
        </Text>
      ) : (
        <Stepper
          value={value}
          min={1}
          max={DEFAULT_HABIT_LIMITS.cadenceTargetMax[cadence]}
          onChange={onChange}
          testID={testID}
          suffix={`of ${DEFAULT_HABIT_LIMITS.cadenceTargetMax[cadence]} max`}
        />
      )}
    </View>
  );
}
