import {ConnectedComponent} from './ConnectedComponent';
import {Component} from './Component'

type ComponentCreator<THTMLElement extends HTMLElement = any, TRefs extends Refs = Refs> = new (
  element: THTMLElement,
) => Component<THTMLElement, TRefs> | ConnectedComponent<THTMLElement, TRefs>;

export type ComponentMap = {
  [selector: string]: ComponentCreator;
};

export interface IComponentGenerator {
  initialize(container?: HTMLElement | null): void;

  refresh(container?: HTMLElement | null): void;

  mount(container?: HTMLElement | null): void;

  unmount(container?: HTMLElement | null): void;
}

export type Refs = Record<string, Component | undefined>;
