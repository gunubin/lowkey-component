import { Action, Reducer, ReducersMapObject } from './types';
export declare const combineReducers: <State extends Record<string, unknown>>(reducers: ReducersMapObject<State, Action<any>>) => Reducer<State, Action<any>>;
