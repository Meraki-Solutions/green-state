import React from 'react';

export class RenderPropsSpy {
  constructor(content) {

    this.content = content;

    this.render = (...props) => {
      this.firstProp = props[0];
      this.props = props;

      return content ? <p>{content}</p> : null;
    };

  }
}

