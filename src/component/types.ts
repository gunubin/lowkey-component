import {Component} from './Component'

export interface IComponentGenerator {
  initialize(): void;

  mount(): void;

  refresh(): void;

  unmount(): void;

  willUnmount(): void;
}

export type Refs = Record<string, Component | undefined>;
