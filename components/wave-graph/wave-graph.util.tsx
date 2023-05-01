import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { map, range, toString } from 'lodash';

export const NUM_SAMPLES_PER_LINE = 12;
export const NUM_LINES_IN_WINDOW = 8;
export const MAX_LINE_VALUE = 33;
const MAX_FPS = 32;
const FRAME_TIME_DELTA = 1000 / MAX_FPS;
export const MOUSE_OUT: {x: number | undefined; y: number | undefined; }  = { x: undefined, y: undefined };

export const useScales = (svgWidth: number, svgHeight: number) => {
  return useMemo(() => {
      const waveHistoryPositionScale = d3.scalePoint() // vertical equidistance of waves
        .domain(map(range(0, NUM_LINES_IN_WINDOW), toString))
        .range([0, svgHeight]);

      // width of wave
      const xScale = d3.scaleLinear()
        .domain(
          [
            0,
            NUM_SAMPLES_PER_LINE - 1,
          ]
        )
        .range([0, svgWidth]);

      // height of wave
      const yScale = d3.scaleLinear()
        .domain(
          [
            0,
            MAX_LINE_VALUE,
          ]
        ).nice()
        .range([0, (svgHeight * 0.8)]);

      return {
        waveHistoryPositionScale,
        xScale,
        yScale,
      };
    }
    , [svgHeight, svgWidth]);
}

export const useWaveDefinitions = (xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>) => {
  const area = d3.area<number>()
    .curve(d3.curveBasis) // make it smooth
    .defined((d) => !isNaN(d))
    .x((d, i) => xScale(i))
    .y0(0)
    .y1((d) => -yScale(d));

  return {
    area,
    line: area.lineY1()
  };
}

// from https://css-tricks.com/using-requestanimationframe-with-react-hooks/
export const useAnimationFrame = (callback: (time: number) => void) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      if (deltaTime > FRAME_TIME_DELTA ) {
        try {
          callback(deltaTime);
        } catch (e) {
          console.log(e);
        }
        previousTimeRef.current = time;
      }
    } else {
      previousTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef?.current as number);
  }, []); // Make sure the effect runs only once
}