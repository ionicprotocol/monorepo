'use client';
import React from 'react';

export default function DonutChart() {
  return (
    <svg
      className="donut"
      height="100%"
      viewBox="0 0 40 40"
      width="100%"
    >
      <circle
        className="donut-hole"
        cx="20"
        cy="20"
        fill="transparent"
        r="16"
      />
      <circle
        className="donut-ring"
        cx="20"
        cy="20"
        fill="transparent"
        r="16"
        stroke="rgb(255 255 255 / 0.3)"
        stroke-width="2"
      />
      <circle
        className="donut-segment donut-segment-2"
        cx="20"
        cy="20"
        fill="transparent"
        r="16"
        stroke="#3bff89ff"
        stroke-dasharray="69 31"
        stroke-dashoffset="25"
        stroke-width="4"
      />
      <g className="donut-text donut-text-1">
        <text
          transform="translate(0, 2)"
          y="50%"
        >
          <tspan
            className="donut-percent"
            text-anchor="middle"
            x="50%"
          >
            69%
          </tspan>
        </text>
      </g>
    </svg>
  );
}
