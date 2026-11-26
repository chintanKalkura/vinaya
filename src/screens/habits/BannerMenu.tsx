import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import OptionsMenu from './OptionsMenu';
import { MIN_TOUCH_SIZE } from './TouchTarget';

// ⋮ right of a banner's streak number: docs/style-choices/habits-section/banner-menu.md.
// Opens a dropdown (Edit, Delete), then a confirm step before deleting.
interface BannerMenuProps {
  kind: 'habit' | 'group';
  onEdit: () => void;
  onDelete: () => void;
  testID: string;
  // Where the 48dp target sits: the parent places it over its name row, since
  // the row itself is too short to hold it (tap-targets.md)
  targetStyle?: StyleProp<ViewStyle>;
}

// Kept in the name row where the ⋮ is drawn, so the title and streak stay put
export const BANNER_MENU_SPACE = 6 + 18;

export default function BannerMenu({
  kind,
  onEdit,
  onDelete,
  testID,
  targetStyle,
}: BannerMenuProps): React.JSX.Element {
  return (
    <OptionsMenu
      kind={kind}
      testID={testID}
      targetStyle={targetStyle}
      items={[
        { key: 'edit', label: 'Edit', Icon: Pencil, onPress: onEdit },
        {
          key: 'delete',
          label: 'Delete',
          Icon: Trash2,
          danger: true,
          onPress: onDelete,
        },
      ]}
    />
  );
}

// Puts the 48dp target over the ⋮ drawn at the right end of a name row whose
// vertical centre is `centerY` in the parent's coordinates
export function bannerMenuTargetStyle(centerY: number): ViewStyle {
  return {
    position: 'absolute',
    right: 0,
    top: Math.max(0, centerY - MIN_TOUCH_SIZE / 2),
  };
}
