import type Animated from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { CovertedList, PlayerType } from './dragTypes';

/**
 * @summary Returns true if node is within lowerBound and upperBound.
 * @worklet
 */
export const between = (value: number, lowerBound: number, upperBound: number) => {
    'worklet';
    return value > lowerBound && value < upperBound;
};

export const reorder = (object: CovertedList, from: number, to: number, team: number) => {
    'worklet';
    const newObject = Object.assign({}, object);

    for (const id in object) {
        const newInner = Object.assign({}, object[id]);
        if (newInner.team !== team) continue;
        if (object[id].position === from) {
            newInner.position = to;
        }

        if (object[id].position === to) {
            newInner.position = from;
        }
        newObject[id] = newInner;
    }
    return newObject;
    // return newInputs;
};

/**
 * @summary Type representing a vector
 * @example
   export interface Vector<T = number> {
    x: T;
    y: T;
  }
 */
export interface Vector<T = number> {
    x: T;
    y: T;
}

/**
 * @summary Returns a vector of shared values
 */
export const useVector = (x1 = 0, y1?: number): Vector<Animated.SharedValue<number>> => {
    const x = useSharedValue(x1);
    const y = useSharedValue(y1 ?? x1);
    return { x, y };
};

export const byOrder = (a: PlayerType, b: PlayerType) => {
    'worklet';
    return a.position - b.position;
};

export function clamp (value: number, lowerBound: number, upperBound: number) {
    'worklet';
    return Math.max(lowerBound, Math.min(value, upperBound));
}

export const normalize = (positions: CovertedList) => {
    'worklet';
    const newObject = Object.assign({}, positions);
    Object.keys(newObject).filter(key => newObject[key].team === 0).map((key) => {
        return newObject[key];
    }).sort(byOrder).forEach((obj, idx) => {
        const newObj = Object.assign({}, obj);
        newObj.position = idx;
        newObject[obj.uuid] = newObj;
    });
    Object.keys(newObject).filter(key => newObject[key].team === 1).map((key) => {
        return newObject[key];
    }).sort(byOrder).forEach((obj, idx) => {
        const newObj = Object.assign({}, obj);
        newObj.position = idx;
        newObject[obj.uuid] = newObj;
    });
    return newObject;
};

export const changeTeamsAndSetOrder = (positions: CovertedList, id: string) => {
    'worklet';
    const newObject = Object.assign({}, positions);
    const newInner = Object.assign({}, newObject[id]);
    // newInner.position = newPosition
    newInner.team = newInner.team === 1 ? 0 : 1;
    newObject[id] = newInner;
    return normalize(newObject);
};

// export const calculateLayout = (input: Offset[]) => {
//     "worklet";
//     const offsets = input.sort(byOrder);
//     if (offsets.length === 0) {
//         return;
//     }
//     offsets.forEach((offset, index) => {
//         offset.y.value = (ITEM_HEIGHT + GAP) * index;
//     });
// };

export const listToObject = (input: PlayerType[]) => {
    const values = Object.values(input);
    const object: CovertedList = {};
    let team1Counter = 0;
    let team2Counter = 0;
    for (let i = 0; i < values.length; i++) {
        const isTeam1 = values[i].team === 0;
        const isTeam2 = values[i].team === 1;
        object[values[i].uuid] = { position: isTeam1 ? team1Counter : team2Counter, team: values[i].team, uuid: values[i].uuid, name: values[i].name, id: values[i].id };
        team1Counter = team1Counter + (isTeam1 ? 1 : 0);
        team2Counter = team2Counter + (isTeam2 ? 1 : 0);
    }

    return object;
};
