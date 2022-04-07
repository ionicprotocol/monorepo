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
    show: false,
  },

  tooltip: {
    x: {
      formatter: function (value: number) {
        return parseFloat(value as any).toFixed(2) + '% Utilization';
      },
    },
  },

  yaxis: {
    show: false,
    labels: {
      // @ts-ignore
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return parseFloat(value).toFixed(2) + '%';
      },
    },
  },

  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
      // @ts-ignore
      ...LineChartOptions.yaxis.labels,
      formatter: function (value: string) {
        return parseFloat(value).toFixed(2) + '%';
      },
    },
    max: 110,
    min: -10,
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
      top: -30,
    },
  },
};
