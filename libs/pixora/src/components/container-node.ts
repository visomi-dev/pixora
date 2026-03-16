import { Container } from 'pixi.js';

import { BaseNode } from './base-node';

export class ContainerNode extends BaseNode<Container> {
  constructor() {
    super(new Container());
  }
}
