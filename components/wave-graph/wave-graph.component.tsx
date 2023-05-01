import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  isEmpty,
  map,
  range,
  slice,
  head,
  isNil,
  max,
  toString, concat, isFunction
} from 'lodash';
import * as d3 from 'd3'
import {
  MAX_LINE_VALUE,
  NUM_LINES_IN_WINDOW,
  NUM_SAMPLES_PER_LINE,
  MOUSE_OUT,
  useAnimationFrame,
  useScales,
  useWaveDefinitions
} from './wave-graph.util';

/**
 * data structure will change. It will be a number[][], where all number[] has the same length
 */
type WaveDataType = number[];

export const WaveGraph: React.FunctionComponent<Partial<HTMLDivElement>> = ({className}) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [waveHistory, setWaveData] = useState<WaveDataType[]>([]);
  const mouseRef = React.useRef(MOUSE_OUT);

  const handleMouseOver = useCallback((event) => {
    if (isNil(svgContainerRef?.current)) {
      return
    }
    const {top = 0, left = 0} = event?.target?.getBoundingClientRect();
    const mousePos = { x: (event?.clientX ?? 0) - left, y: (event?.clientY ?? 0) - top };
    mouseRef.current = mousePos;
  }, [svgContainerRef, mouseRef]);

  const handleMouseOut = useCallback(() => {
    if (isNil(svgContainerRef?.current)) {
      return
    }

    mouseRef.current = MOUSE_OUT;
  }, [svgContainerRef]);

  const { width: svgWidth = 0, height: svgHeight = 0 } = svgContainerRef?.current?.getBoundingClientRect() ?? { width: 0, height: 0};

  useAnimationFrame((_deltaTime: number) => {
    // maintain NUM_LINES_IN_WINDOW amount of waves
    setWaveData((prevWaveHistory) => {
      const {x} = mouseRef?.current ?? MOUSE_OUT;
      const isMouseAffected = !isNil(x);
      const affectedXSample = Math.floor((x ?? 0) / svgWidth * NUM_SAMPLES_PER_LINE);

      const nextWave: WaveDataType = map(range(0, NUM_SAMPLES_PER_LINE), sampleIdx => {
        const xAffect = isMouseAffected && sampleIdx === affectedXSample ? MAX_LINE_VALUE / 5 : 0;
        const previousWave = head(prevWaveHistory)
        if (isEmpty(previousWave)) {
          // make new random value for this sampleIdx
          return Math.ceil(Math.random() * MAX_LINE_VALUE);
        }

        // random walk from last position, suppressing the previous value
        return max([Math.abs((previousWave as WaveDataType)[sampleIdx] + Math.ceil(Math.random() * MAX_LINE_VALUE / 2)) - MAX_LINE_VALUE / 3 + xAffect, MAX_LINE_VALUE]);
      }) as number[];

      return slice(concat([nextWave], prevWaveHistory), 0, NUM_LINES_IN_WINDOW)
    });
  });

  const {
    waveHistoryPositionScale,
    xScale,
    yScale,
  } = useScales(svgWidth, svgHeight);

  const {
    area: waveAreaFunction,
    line: waveLineFunction
  } = useWaveDefinitions(xScale, yScale);

  // paint the waves
  useEffect(() => {
    if (isNil(svgRef?.current) || !isFunction(waveHistoryPositionScale)) {
      return;
    }

    const d3Chart = d3.select<SVGSVGElement, WaveDataType>(svgRef?.current as SVGSVGElement);

    const waveDataSelection = d3Chart
      .selectAll<SVGGElement, WaveDataType>('g.wave')
      .data(waveHistory, samples => (samples ?? []).toString());

    const wave = waveDataSelection
      .enter()
      .append('g')
      .attr('class', 'wave')
      .merge(waveDataSelection)
      .attr('transform', (waveSamples: WaveDataType, waveHistoryIndex) => `translate(0,${(waveHistoryPositionScale as (index: string) => number)(toString(waveHistoryIndex)) + svgHeight})`);

    wave.append('path')
      .attr('fill', '#0d0')
      .attr('opacity', '0.1')
      .attr('d', (waveSamples: WaveDataType, i) => waveAreaFunction(waveSamples));

    wave.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('d', (waveSamples: WaveDataType, i) => waveLineFunction(waveSamples));

    // wave.merge(waveDataSelection);

    waveDataSelection.exit().remove();
    wave.exit().remove();
  }, [svgRef, waveHistory]);

  return <div
    ref={svgContainerRef}
    onMouseOver={handleMouseOver}
    onMouseOut={handleMouseOut}
    onTouchStart={handleMouseOver}
    onTouchEnd={handleMouseOut}
    className={`${isEmpty(className) ? '' : `${className} `} bg-black overflow-hidden`}
  >
    <svg ref={svgRef} width={svgWidth} height={svgHeight}/>
  </div>;
};
