<template>
  <div class="container">
    <div class="selects_box">
      <select-comp
        heading="Chart Mode"
        placeholder="Select 'line' or 'area'"
        select-value="line"
        :blur-panel="blur_panel"
        :items="mode_items"
        @select-comp-value-changed="mode_changed"
      />
      <select-comp
        heading="Time Ticks"
        placeholder="Select a tick format"
        select-value="quarter"
        :items="tick_items"
        @select-comp-value-changed="tick_changed"
      />
    </div>
    <svg
      id="svg_chart"
      width="1600"
      height="800"
    />
  </div>
</template>

<script>
  import {select} from 'd3-selection';
  import SelectComp from 'selectcomp';
  import show_chart from './show_chart.js';

  export default {
    name: 'App',
    components: {
      SelectComp
    },
    data() {
      return {
        blue_panel: false,
        chart_svg: null,
        mode_items: ['line','area'],
        current_mode: 'line',
        current_tick: 'quarter',
        tick_items: ['quarter','semiannual','annual']
      };
    },
    mounted() {
      this.chart_svg = select('#svg_chart');
      show_chart(this.chart_svg, 'data.json', this.current_mode, this.current_tick);
    },
    methods: {
      mode_changed: function(value){
        this.current_mode = value;
        show_chart(this.chart_svg, 'data.json', value, this.current_tick);
      },
      tick_changed: function(value){
        this.current_tick = value;
        show_chart(this.chart_svg, 'data.json', this.current_mode, value);
      }
    }
  };
</script>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    border: 1px solid black;
    width: 100%;
    height: 100%;
  }
  .selects_box {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 3rem;
    width: 400px;
    height: 20px;
  }
</style>