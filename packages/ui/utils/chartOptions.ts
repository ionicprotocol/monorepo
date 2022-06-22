import { ApexOptions } from 'apexcharts';

export const LineChartOptions: ApexOptions = {
  chart: {
    foreColor: '#a19f9f',
    animations: {
      enabled: false,
    },

    dropShadow: {
      // This looks nice, try it!
      enabled: false,
    },

    toolbar: {
      show: false,
    },

    selection: {
      enabled: false,
    },

    zoom: {
      enabled: false,
    },
  },

  stroke: {
    curve: 'smooth',
  },

  colors: ['#FFFFFF', '#007D43', '#F4CD00', '#F83536'],

  grid: {
    yaxis: {
      lines: {
        show: false,
      },
    },
  },

  dataLabels: {
    enabled: false,
  },

  legend: {
    position: 'top',
    horizontalAlign: 'left',
    showForSingleSeries: false,
  },

  yaxis: {
    labels: {
      style: {
        fontSize: '13px',
      },
    },
  },
};

export const InterestRateChartOptions: ApexOptions = {
  ...LineChartOptions,

  stroke: {
    curve: 'straight',
    lineCap: 'round',
  },

  grid: {
    ...LineChartOptions.grid,
    padding: {
      top: -50,
    },
  },

  dataLabels: {
    enabled: false,
  },

  legend: {
    show: true,
  },

  tooltip: {
    x: {
      formatter: function (value: number) {
        return parseFloat(value.toString()).toFixed(2) + '% Utilization';
      },
    },
  },

  yaxis: {
    show: true,
    labels: {
      // @ts-ignore
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return parseFloat(value).toFixed(0) + '%';
      },
    },
    tickAmount: 4,
    max: 100,
    min: 0,
  },

  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    tickAmount: 2,
    labels: {
      show: true,
      // @ts-ignore
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return parseFloat(value).toFixed(0) + '%';
      },
    },
    max: 100,
    min: 0,
  },
};

export const FuseUtilizationChartOptions: ApexOptions = {
  ...InterestRateChartOptions,

  grid: {
    ...LineChartOptions.grid,
  },
};

export const FuseIRMDemoChartOptions: ApexOptions = {
  ...InterestRateChartOptions,

  grid: {
    ...LineChartOptions.grid,
    padding: {
      top: -15,
    },
  },
};
