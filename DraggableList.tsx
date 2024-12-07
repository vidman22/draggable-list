import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { scrollTo, useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import DraggableItem from './DraggableItem';
import { listToObject, normalize } from './dragUtils';
import { GAP, ITEM_HEIGHT, PlayerType } from './dragTypes';
import Player from './Player';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '../theme';
import BottomModal from '../BottomModal';

type Props = {
    players: PlayerType[];
    handleStart: (p: PlayerType[]) => void;
}

const DraggableList = ({ players, handleStart }: Props) => {
    const scrollLeftY = useSharedValue(0);
    const scrollViewLeftRef = useAnimatedRef<any>();
    const [ showConfirm, setShowConfirm ] = useState<string | null>(null);
    const positions = useSharedValue(listToObject(players));

    useAnimatedReaction(() => scrollLeftY.value, (scrolling) => scrollTo(scrollViewLeftRef, 0, scrolling, false));

    const handleLeftScroll = useAnimatedScrollHandler((event) => {
        scrollLeftY.value = event.contentOffset.y;
    });
    const team = useDerivedValue(() => Object.values(positions.value), [ positions.value ]);

    const handleConfirmRemove = () => {
        'worklet';
        const newObj = Object.assign({}, positions.value);
        delete newObj[showConfirm!];
        positions.value = normalize(newObj);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1, paddingHorizontal: 0 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={styles.team}>
                        <Animated.ScrollView
                            ref={scrollViewLeftRef}
                            onScroll={handleLeftScroll}
                            scrollEventThrottle={16}
                            style={{
                                flex: 1,
                                position: 'relative'
                            }}
                            contentContainerStyle={{
                                height: (team.value.length * (ITEM_HEIGHT + GAP)),
                                paddingHorizontal: 0
                            }}
                        >
                            {team.value.map((el) => (
                                <DraggableItem
                                    key={`${el.uuid}`}
                                    uuid={el.uuid}
                                    positions={positions}
                                    scrollY={scrollLeftY}
                                    itemsLength={team.value.length}
                                >
                                    <Player
                                        text={el.name}
                                        wordHeight={ITEM_HEIGHT}
                                        handleRemove={() => setShowConfirm(el.uuid)}
                                    />
                                </DraggableItem>
                            ))}
                        </Animated.ScrollView>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 10 }}>
                    <Button
                        onPress={() => handleStart(team.value)}
                        style={{
                            borderRadius: 12
                        }}
                        fun
                    >
                        Start
                    </Button>
                </View>

                <BottomModal
                    isVisible={!!showConfirm}
                    onDismiss={() => setShowConfirm(null)}
                    swipeDirection='down'
                    onBackdropPress={() => setShowConfirm(null)}
                >
                    <View style={{ justifyContent: 'space-between' }}>
                        <Text fun size='h1'>
                            Are you sure you want to remove this player?
                        </Text>
                        <View>
                            <Button
                                color='primary'
                                style={{ marginVertical: 16 }}
                                onPress={handleConfirmRemove}
                            >
                                <Text fun size='h1'>
                                    Yes
                                </Text>
                            </Button>
                            <Button
                                color='secondary'
                                onPress={() => {
                                    setShowConfirm(null);
                                }}
                            >
                                <Text fun size='h1'>
                                    No
                                </Text>
                            </Button>
                        </View>
                    </View>
                </BottomModal>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1
    },
    team: {
        flex: 1,
        // flexDirection: 'row',
        justifyContent: 'center'
    }
});

export default DraggableList;
