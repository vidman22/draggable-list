import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, runOnJS, SharedValue, useAnimatedGestureHandler, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { CovertedList, GAP, ITEM_HEIGHT, OFFSET } from './dragTypes';
import { reorder, changeTeamsAndSetOrder, clamp } from './dragUtils';
const WIDTH = Dimensions.get('screen').width;

type Props = {
    children: JSX.Element;
    uuid: string;
    positions: SharedValue<CovertedList>;
    scrollY: SharedValue<number>;
    itemsLength: number;
}

// type AnimatedGHContext = {
//     startX: number;
//     startY: number;
// };

const DraggableItem = ({
    positions,
    uuid,
    // offset,
    scrollY,
    children
    // itemsLength,
}: Props) => {
    const p = positions.value[uuid];
    const [ moving, setMoving ] = useState(false);
    const top = useSharedValue(p ? positions.value[uuid].position * (ITEM_HEIGHT + GAP) : 0);
    const left = useSharedValue(positions.value[uuid].team === 0 ? 0 : WIDTH / 2);

    useAnimatedReaction(
        () => positions.value[uuid]?.position,
        (currentPosition, previousPosition) => {
            if (currentPosition !== previousPosition) {
                if (!moving) {
                    top.value = withSpring(currentPosition * (ITEM_HEIGHT + GAP));
                }
            }
        }, [ moving, positions.value[uuid]?.position ]);

    const gestureHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startX: number; startY: number }
    >({
        onStart: () => {
            runOnJS(setMoving)(true);
        },
        onActive: (event) => {
            if (!p) return;
            const positionY = event.absoluteY + scrollY.value - OFFSET;
            const translationX = event.translationX;
            // translation.x.value = ctx.startX + event.translationX;
            // = ctx.startY + event.translationY;

            // Handle scrolling
            // if (positionY <= scrollY.value + SCROLL_HEIGHT_THRESHOLD) {
            //     // Scroll up
            //     scrollY.value = withTiming(0, { duration: 1500 });
            // } else if (
            //     positionY >= scrollY.value + dimensions.height - SCROLL_HEIGHT_THRESHOLD
            // ) {
            //     // Scroll down
            //     const contentHeight = itemsLength * (ITEM_HEIGHT + GAP);
            //     const containerHeight = dimensions.height - insets.top - insets.bottom;
            //     const maxScroll = contentHeight - containerHeight;
            //     scrollY.value = withTiming(maxScroll, { duration: 1500 });
            // } else {
            //     cancelAnimation(scrollY);
            // }

            // Handle going to the top
            // And going to the bottom
            // if (translation.y.value < MARGIN_TOP) {
            //     position.order.value = 0;
            // } else if (translation.y.value > SENTENCE_HEIGHT) {
            //     position.order.value = teamPositions.length - 1;
            // }

            // This is the right column if it moves left the x value will be negative.
            // If it moves more than a third of the screen over to the left then we can
            // move it to the first column
            const newPosition = clamp(
                Math.floor(positionY / (ITEM_HEIGHT + GAP)),
                0,
                Object.values(positions.value).filter(el => el.team === positions.value[uuid]?.team).length - 1
            );
            if (translationX > (WIDTH / 3) && positions.value[uuid]?.team === 0) {
                positions.value = changeTeamsAndSetOrder(positions.value, uuid);
                cancelAnimation(left);
            }
            if (translationX < (-WIDTH / 3) && positions.value[uuid]?.team === 1) {
                positions.value = changeTeamsAndSetOrder(positions.value, uuid);
                cancelAnimation(left);
            }

            const newX = clamp(
                translationX + (positions.value[uuid]?.team === 0 ? 0 : WIDTH / 2),
                0,
                WIDTH / 2
            );
            left.value = withTiming(newX, {
                duration: 16
            });

            top.value = withTiming(positionY - (ITEM_HEIGHT + GAP) - OFFSET, {
                duration: 16
            });

            if (newPosition !== positions.value[uuid].position) {
                positions.value = reorder(
                    positions.value,
                    positions.value[uuid].position,
                    newPosition,
                    positions.value[uuid].team
                );
            }
        },
        onEnd: () => {
            top.value = positions.value[uuid].position * (ITEM_HEIGHT + GAP);
            left.value = positions.value[uuid].team === 0 ? 0 : WIDTH / 2;
            runOnJS(setMoving)(false);
        }
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            zIndex: moving ? 2 : 0,
            top: top.value,
            position: 'absolute',
            width: '50%',
            left: left.value,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: ITEM_HEIGHT,
            marginBottom: GAP
        };
    }, [ moving ]);

    return (
        <Animated.View style={animatedStyle}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View style={{ width: '100%' }}>
                    {children}
                </Animated.View>
            </PanGestureHandler>

        </Animated.View>
    );
};

export default DraggableItem;
