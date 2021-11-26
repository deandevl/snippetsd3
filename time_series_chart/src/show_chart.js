/**
 * Created by Rick on 2021-11-21.
 */
'use strict';
import {utcParse} from 'd3-time-format';
import {timeFormat} from 'd3-time-format';
import {timeMonth,timeYear} from 'd3-time';
import {json} from 'd3-fetch';
import {scaleTime,scaleLinear} from 'd3-scale';
import {axisBottom,axisLeft} from 'd3-axis';
import {line,area} from 'd3-shape';
import {min,max,ticks} from 'd3-array';

export default async function(
  svg,
  file_path,
  mode='line',
  ticks='quarter'){

  const svg_width = +svg.attr('width');
  const svg_height = +svg.attr('height');

  const margin = {top: 40, right: 20, bottom: 80, left: 80};
  const chart_width = svg_width - margin.left - margin.right;
  const chart_height = svg_height - margin.top - margin.bottom;

  svg.select('#main_g').remove();
  const main_g =
    svg.append('g')
      .attr('id','main_g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const parseTime = utcParse('%Y-%m-%d');
  const formatDate = timeFormat('%Y-%m');
  const formatDate2 = timeFormat('%x');

  //read json data file
  const data_raw = await json(file_path);
  const data = data_raw.map(d => {
    return {
      date: parseTime(d.date),
      value: d.value
    };
  });

  // define scales
  const x_scale = scaleTime()
    .range([margin.left, svg_width-margin.right])
    .domain([
      min(data, d => {return d.date;}),
      max(data,d => {return d.date;})
    ]).nice();

  const y_scale = scaleLinear()
    .range([svg_height-margin.bottom, margin.top])
    .domain([
      min(data, d => {return d.value;}),
      max(data, d => {return d.value;})
    ]).nice();

  // define axis'
  const xAxis = axisBottom();

  let xTicks = null;
  if(ticks === 'quarter'){
    xTicks = timeMonth.every(3); //every quarter
  }else if(ticks === 'semiannual'){
    xTicks = timeMonth.every(6); //semi-annual
  }else if(ticks === 'annual'){
    xTicks = timeYear.every(1); //annual
  }
  xAxis.ticks(xTicks);
  xAxis.scale(x_scale).tickFormat(formatDate);
  //.tickPadding(6);

  const yAxis = axisLeft()
    .scale(y_scale)
    .tickPadding(6);

  // place axis'
  const x_axis_g = main_g.append('g')
    .attr('class', 'chart_axis_g')
    .attr('id', 'x_axis_g')
    .attr('transform',`translate(0,${svg_height-margin.bottom})`)
    .call(xAxis);
  x_axis_g
    .style('font-size', '.8rem')
    .style('font-family', 'Verdana,sans-serif')
    .style('font-weight', 'bold');

  const y_axis_g = main_g.append('g')
    .attr('class', 'chart_axis_g')
    .attr('transform',`translate(${margin.left}, 0)`)
    .call(yAxis);
  y_axis_g
    .style('font-size', '.8rem')
    .style('font-family', 'Verdana,sans-serif')
    .style('font-weight', 'bold');

  if(mode === 'line') {
    const line_generator = line()
      .x((d) => {
        return x_scale(d.date);
      })
      .y((d) => {
        return y_scale(d.value);
      });
    main_g.append('g')
      .attr('id', 'line_g')
      .attr('class', 'line')
      .append('path')
      .datum(data)
      .attr('d', line_generator);
  }else if(mode === 'area'){
    const gradient = svg.append('defs').append('linearGradient')
      .attr('id', 'gradient')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')//top
      .attr('offset', '0%')
      .attr('stop-color', '#8125de')
      .attr('stop-opacity', 1);

    gradient.append('stop')//middle
      .attr('offset', '50%')
      .attr('stop-color', '#de2581')
      .attr('stop-opacity', 0.5);

    gradient.append('stop')//bottom
      .attr('offset', '100%')
      .attr('stop-color', '#de25de')
      .attr('stop-opacity', 0.2);
    const area_generator = area()
      .x((d) => {
        return x_scale(d.date);
      })
      .y0(() => {
        return y_scale(y_scale.domain()[0]);
      })
      .y1((d) => {
        return y_scale(d.value);
      });
    main_g.append('g')
      .attr('id', 'area_g')
      .attr('class', 'area')
      .append('path')
      //.attr('clip-path', 'url(#clip)')
      .style('fill', 'url(#gradient)')
      .datum(data)
      .attr('d', area_generator);
  }
  console.log(`Chart width: ${svg.attr('width')}`);
  console.log(`Chart height: ${svg.attr('height')}`);
  console.log(`Data: ${data[0].date} ${data[0].value}`);
}
