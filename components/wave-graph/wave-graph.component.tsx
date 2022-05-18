import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import * as d3 from 'd3'
import { number } from 'prop-types';

/**
 * data structure will change. It will be a number[][], where all number[] has the same length
 */
type WaveDataType = number[];

const NUM_SAMPLES_PER_LINE = 12;
const NUM_LINES = 8;
const NUM_LINES_IN_WINDOW = 4;
const MAX_LINE_VALUE = 33;
const SHIFT_INTERVAL = 2;
const MAX_INTERVAL_STEPS = Math.ceil(NUM_LINES_IN_WINDOW / SHIFT_INTERVAL);
const MOUSE_OUT: {x: number | undefined; y: number | undefined; }  = { x: undefined, y: undefined };

export const WaveGraph: React.FunctionComponent<Partial<HTMLDivElement>> = ({className}) => {
  const [isMounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef(null);
  const [data, setData] = useState<WaveDataType[]>([]);
  const [intervalStep, setIntervalStep] = useState<number>(0);
  const [aliveStep, setAliveStep] = useState<number>(0);

  // animation control (not using useEffect)
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();
  const waveDataRef = React.useRef<WaveDataType[]>([]);
  const intervalStepsRef = React.useRef<number>(0);
  const aliveRef = React.useRef<number>(0);
  const mouseRef = React.useRef(MOUSE_OUT);

  const handleMouseOver = useCallback((event) => {
    if (!containerRef?.current) {
      return
    }
    const {top = 0, left = 0} = event?.target?.getBoundingClientRect();
    const mousePos = { x: (event?.clientX ?? 0) - left, y: (event?.clientY ?? 0) - top };
    mouseRef.current = mousePos;
  }, [containerRef, mouseRef]);

  const handleMouseOut = useCallback(() => {
    if (!containerRef?.current) {
      return
    }

    mouseRef.current = MOUSE_OUT;
  }, [containerRef]);


  const {width: svgWidth, height: svgHeight} = useMemo((): { width: number, height: number } => {
    if (isMounted && !_.isNil(containerRef?.current)) {
      const {width = 0, height = 0} = containerRef.current.getBoundingClientRect();
      return {width, height};
    }
    return {width: 0, height: 0};
  }, [isMounted, containerRef]);

  const animate = (time: number): void => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;

      // // 16fps
      // if (deltaTime > 68) {
        // calculate a random walk based on previous walk-step
        const waveData = waveDataRef?.current ?? [];

        // const hasLineOutOfView = _.every(_.last(waveData), (num: number) => num > MAX_LINE_VALUE);
        const hasLineOutOfView = intervalStepsRef.current > MAX_INTERVAL_STEPS;
        let firstWaves = waveData;

        if (hasLineOutOfView) {
          firstWaves = _.slice(waveData, 0, NUM_LINES - 1);
          intervalStepsRef.current = 0;
        }

        if (firstWaves?.length < NUM_LINES) {
          const previousWave = _.head(firstWaves);

          const {x} = mouseRef?.current ?? MOUSE_OUT;
          const isMouseAffected = !_.isNil(x);
          const affectedXSample = Math.floor((x ?? 0) / svgWidth * NUM_SAMPLES_PER_LINE);

          const nextWaveData: number[] = _.map(_.range(0, NUM_SAMPLES_PER_LINE), (i) => {
            const xAffect = isMouseAffected && i === affectedXSample ? MAX_LINE_VALUE / 4 : 0;
            if (_.isEmpty(previousWave)) {
              // make new random data
              return Math.ceil(Math.random() * MAX_LINE_VALUE) + xAffect;
            }

            // random walk from last position
            return _.max([Math.abs((previousWave as WaveDataType)[i] + Math.ceil(Math.random() * MAX_LINE_VALUE / 2)) - MAX_LINE_VALUE / 3 + xAffect, MAX_LINE_VALUE]);
          }) as number[];

          // set the data
          waveDataRef.current =  _.isEmpty(firstWaves) ? [nextWaveData] : [nextWaveData, ...firstWaves] as WaveDataType[];
        }

        const _intervalStep = intervalStepsRef.current + 1;
        intervalStepsRef.current = _intervalStep;
        setIntervalStep(_intervalStep);
        setData(waveDataRef.current);
      // } else {
      //   const nextAliveStep = (aliveRef?.current ?? 0) + 1;
      //   aliveRef.current = nextAliveStep > 300 ? 0 : nextAliveStep;
      //   setAliveStep(aliveRef.current)
      // }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if(!isMounted) return;
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current as number);
  }, [isMounted]); // Make sure the effect runs only once

  // set client-side rendering flag
  useEffect(() => {
    setMounted(true);
  }, []);

  const waveData = waveDataRef?.current;

  const {
    stepScale,
    xScale,
    yScale,
  } = useMemo(() => {
      const stepScale = d3.scalePoint() // stepScale is the 'frame' in time
        .domain(_.map(_.range(0, NUM_LINES_IN_WINDOW), _.toString))
        .range([0, svgHeight]);
      const xScale = d3.scaleLinear()
        .domain(
          [
            0,
            NUM_SAMPLES_PER_LINE - 1,
          ]
        )
        .range([0, svgWidth]);

      const yScale = d3.scaleLinear()
        .domain(
          [
            0,
            MAX_LINE_VALUE,
          ]
        ).nice()
        .range([0, svgHeight]);

      return {
        stepScale,
        xScale,
        yScale,
      };
    }
    , [svgHeight, svgWidth]);

  useEffect(() => {
    if (!isMounted || _.isNil(chartRef?.current)) {
      return;
    }

    const chart = d3.select<SVGSVGElement, WaveDataType>(chartRef?.current as SVGSVGElement);

    const areaFunc = d3.area<number>()
      .curve(d3.curveBasis) // make it smooth
      .defined((d) => !isNaN(d))
      .x((d, i) => xScale(i))
      .y0(0)
      .y1((d) => -yScale(d));

    const line = areaFunc.lineY1();

    chart.selectAll('.waves').remove();

    const offset = (stepScale(_.toString(0)) ?? svgHeight) + 1 + svgHeight * 2/3;

    const group = chart.append('g')
      .attr('class', 'waves')
      .attr('transform', `translate(0,${svgHeight + yScale(MAX_LINE_VALUE) / NUM_LINES_IN_WINDOW})`)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (dArr: WaveDataType, i) => `translate(0,${offset + yScale(intervalStep - 1) - yScale(i * MAX_LINE_VALUE / 10)})`);

    group.append('path')
      .attr('fill', '#0d0')
      .attr('opacity', '0.1')
      .attr('d', (dArr: WaveDataType, i) => areaFunc(_.map(dArr, (num: number) => num + intervalStep)));

    group.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('d', (dArr: WaveDataType, i) => line(_.map(dArr, (num: number) => num + intervalStep)));
  }, [isMounted, chartRef, svgHeight, svgWidth, stepScale, xScale, yScale, waveData, intervalStep, aliveStep]);

  return <div
    ref={containerRef}
    onMouseOver={handleMouseOver}
    onMouseOut={handleMouseOut}
    onTouchStart={handleMouseOver}
    onTouchEnd={handleMouseOut}
    className={`${_.isEmpty(className) ? '' : `${className} `} bg-black overflow-hidden`}
  >
    <svg ref={chartRef} width={svgWidth} height={svgHeight}/>
  </div>;
};
