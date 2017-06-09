import { Bar } from '@vx/shape';
import { Group } from '@vx/group';
import React from 'react';
import PropTypes from 'prop-types';

import { EVENT_COUNT } from '../constants';
import { nodeShape } from '../propShapes';

const NODE_WIDTH = 20;
const LINK_COLOR = '#ddd';

const propTypes = {
  // allNodes: PropTypes.objectOf(nodeShape).isRequired,
  subtreeNodes: PropTypes.objectOf(nodeShape).isRequired,
  nodeSorter: PropTypes.func, // could default to # events

  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  colorScale: PropTypes.func.isRequired,

  getX: PropTypes.func.isRequired,
  getY: PropTypes.func.isRequired,
  getColor: PropTypes.func.isRequired,
  nodePadding: PropTypes.number,
};

const defaultProps = {
  nodeSorter(a, b) {
    return b[EVENT_COUNT] - a[EVENT_COUNT];
  },
  nodePadding: 5,
};

class SubTree extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {}; // future for event distributions, etc
  }

  render() {
    const {
      nodeSorter,
      subtreeNodes,
      xScale,
      yScale,
      colorScale,
      getX,
      getY,
      getColor,
      nodePadding,
    } = this.props;

    const sortedNodes = Object.values(subtreeNodes).sort(nodeSorter);
    const yOffset = { left: 0, right: 0 };

    return (
      <Group>
        {sortedNodes.map((node) => {
          const offset = node.depth >= 0 ? 'right' : 'left';
          const hasParent = Boolean(node.parent);
          const hasChildren = node.children && Object.keys(node.children).length;

          const top = yOffset[offset];
          const left = xScale(getX(node));
          const parentLeft = hasParent && xScale(getX(node.parent));
          const height = yScale(getY(node));
          const nodeColor = colorScale(getColor(node));

          debugger;
          yOffset[offset] += height;

          return (
            <Group
              key={node.id}
              top={top}
              className="subtree"
            >
              {/* link back to the parent */}
              {hasParent &&
                <Bar
                  className="link"
                  x={Math.min(left, parentLeft) + ((left > parentLeft ? 1 : 0) * (NODE_WIDTH))}
                  y={0}
                  width={Math.abs(left - parentLeft)}
                  height={height - nodePadding}
                  fill={LINK_COLOR}
                  fillOpacity={0.2}
                  rx={2}
                  ry={2}
                />
              }
              <Bar
                className="node"
                x={left}
                y={0}
                width={NODE_WIDTH}
                height={height - nodePadding}
                fill={nodeColor}
                stroke="#fff"
                strokeWidth={1}
                rx={2}
                ry={2}
              />

              <text
                x={left + (NODE_WIDTH / 2)}
                y={height / 2}
                textAnchor="middle"
              >
                {node.name}
              </text>

              {hasChildren &&
                <SubTree
                  {...this.props}
                  subtreeNodes={node.children}
                />}
            </Group>
          );
        })}
      </Group>
    );
  }
}

SubTree.propTypes = propTypes;
SubTree.defaultProps = defaultProps;

export default SubTree;
