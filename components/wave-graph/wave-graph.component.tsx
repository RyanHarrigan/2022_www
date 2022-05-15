import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import * as d3 from 'd3'

/**
 * data structure will change. It will be a number[][], where all number[] has same length
 */
type FFTData = number[];

const data: FFTData[] = [
  [
    1.4,
    2.5,
    2,
  ],
  [
    1.3,
    1.1,
    2,
  ],
  [
    3,
    2.7,
    1,
  ],
];

export const WaveGraph: React.FunctionComponent<Partial<HTMLDivElement>> = ({className}) => {
  const [isMounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef(null);

  // set client-side rendering flag
  useEffect(() => {
    setMounted(true);
  }, []);

  const {width: svgWidth, height: svgHeight} = useMemo((): { width: number, height: number } => {
    if (isMounted && !_.isNil(containerRef?.current)) {
      const {width = 0, height = 0} = containerRef.current.getBoundingClientRect();
      return {width, height};
    }
    return {width: 0, height: 0};
  }, [isMounted, containerRef]);

  useEffect(() => {
    if (!isMounted || _.isNil(chartRef?.current)) {
      return;
    }

    const chart = d3.select<SVGSVGElement, FFTData>(chartRef?.current as SVGSVGElement);

    const xScale = d3.scaleLinear()
      .domain(
        [
          0,
          data.length - 1,
        ]
      )
      .range([0, svgWidth]);

    const stepScale = d3.scalePoint() // stepScale is the 'frame' in time
      .domain(_.map(_.range(0, data.length), _.toString))
      .range([0, svgHeight]);

    const yScale = d3.scaleLinear()
      .domain(
        [
          0,
          d3.max(_.flatten(data)) ?? 0
        ]
      ).nice()
      .range([0, svgHeight]);

    const areaFunc = d3.area<number>()
      .curve(d3.curveBasis) // make it smooth
      .defined((d) => !isNaN(d))
      .x((d, i) => xScale(i))
      .y0(0)
      .y1((d) => -yScale(d));

    const line = areaFunc.lineY1();

    const group = chart.append('g')
      .attr('transform', `translate(0,${svgHeight})`)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      // .attr('transform', (dArr: FFTData, i) => `translate(0,${(1 / data.length) * (stepScale(_.toString(i)) ?? svgHeight) + 1})`);

    group.append('path')
      .attr('fill', '#0d0')
      .attr('opacity', '0.2')
      .attr('d', (dArr: FFTData, i) => areaFunc(dArr));

    group.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('d', (dArr: FFTData, i) => line(dArr));
  }, [isMounted, chartRef, svgHeight, svgWidth]);

  return <div ref={containerRef} className={`${_.isEmpty(className) ? '' : `${className} `} bg-black overflow-hidden`}>
    <svg ref={chartRef} width={svgWidth} height={svgHeight}/>
  </div>;
};
