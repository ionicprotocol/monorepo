import jazzicon from '@metamask/jazzicon';
import PropTypes from 'prop-types';
import React, { createRef, PureComponent } from 'react';

function jsNumberForAddress(address) {
  const addr = address.slice(2, 10);
  const seed = parseInt(addr, 16);
  return seed;
}

/**
 * Wrapper around the jazzicon library to return a React component, as the library returns an
 * HTMLDivElement which needs to be appended.
 */
export default class Jazzicon extends PureComponent {
  static propTypes = {
    address: PropTypes.string.isRequired,
    className: PropTypes.string,
    diameter: PropTypes.number,
    style: PropTypes.object,
    useTokenDetection: PropTypes.bool,
    tokenList: PropTypes.object,
  };

  static defaultProps = {
    diameter: 23,
  };

  container = createRef();

  componentDidMount() {
    this.appendJazzicon();
  }

  componentDidUpdate(prevProps) {
    const { address: prevAddress, diameter: prevDiameter } = prevProps;
    const { address, diameter } = this.props;

    if (address !== prevAddress || diameter !== prevDiameter) {
      this.removeExistingChildren();
      this.appendJazzicon();
    }
  }

  removeExistingChildren() {
    const { children } = this.container.current;

    for (let i = 0; i < children.length; i++) {
      this.container.current.removeChild(children[i]);
    }
  }

  appendJazzicon() {
    const { address, diameter } = this.props;
    const numericRepresentation = jsNumberForAddress(address);
    const identicon = jazzicon(diameter, numericRepresentation);
    this.container.current.appendChild(identicon);
  }

  render() {
    const { className, style } = this.props;

    return <div className={className} ref={this.container} style={style} />;
  }
}
