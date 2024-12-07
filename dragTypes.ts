import { PoemLine } from '@/types/types';
import type { ViewStyle } from 'react-native';
import type Animated from 'react-native-reanimated';
import { SharedValue } from 'react-native-reanimated';

export const MARGIN_TOP = 0;
export const ITEM_HEIGHT = 50;
export const GAP = 4;
export const SCROLL_HEIGHT_THRESHOLD = ITEM_HEIGHT;
export const OFFSET = 50;

export type PlayerType = { team: number; uuid: string; position: number; name: string; id: number };
export type CovertedList = {
    [k: string ]: PlayerType;
}
export type PoemList = {
    [k: string ]: PoemLine;
}

export type Offset = {
    order: SharedValue<number>;
    uuid: SharedValue<string>;
    team: SharedValue<number>;
    width: SharedValue<number>;
    height: SharedValue<number>;
    x: SharedValue<number>;
    y: SharedValue<number>;
};

export type DuoWordAnimatedStyle = {
    position: string;
    top: number;
    left: number;
    zIndex: number;
    width: number;
    height: number;
    transform: [{ translateX: number }, { translateY: number }] & ViewStyle['transform'];
};

export type DuoAnimatedStyleWorklet = (
    style: DuoWordAnimatedStyle & ViewStyle,
    isGestureActive: boolean,
) => Animated.AnimateStyle<ViewStyle | DuoWordAnimatedStyle>;
