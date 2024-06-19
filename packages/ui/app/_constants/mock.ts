//----------donut chart

import type { WidgetConfig } from '@lifi/widget';

export const donutdata = {
  datasets: [
    {
      backgroundColor: ['#3bff89ff', '#34363dff'],
      // label: 'My First Dataset',
      data: [30, 70]
    }
  ],
  labels: ['Lend', 'Total']
};

export const donutoptions = {
  elements: {
    arc: {
      borderDash: [90],
      borderWidth: 0
    }
  },
  maintainAspectRatio: false,
  // spacing :10 ,
  plugins: {
    legend: {
      display: false
    }
  }
};

//--------------------- flat dounuts rewards section-----------

// export const rewardsData = {
//   labels: [
//     'Red',
//     'Blue',
//     'Yellow'
//   ],
//   datasets: [{

//     data: [300, 50, 100],
//     backgroundColor: [
//       'rgb(255, 99, 132)',
//       'rgb(54, 162, 235)',
//       'rgb(255, 205, 86)'
//     ],
//     hoverOffset: 4
//   }]
// }

// export const rewardsOption ={
//   maintainAspectRatio: false,
//   // spacing :10 ,
//   plugins: {
//     legend: {
//       display : false,
//     }},
//     elements :{
//       arc :{
//         circular : false ,
//         borderWidth : 0 ,
//         borderDash : [90]
//       }
//     }
// }

//------------------------graph chart-------------------
export const chartoptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: 'right' as const
    },
    title: {
      display: true,
      position: 'top' as const,
      text: 'Supply APR'
    }
  },
  responsive: true,
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  }
};
export const chartoptions2 = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      position: 'top' as const,
      text: 'Borrow APR Variable'
    }
  },
  responsive: true,
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  }
};

const x = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const y = [87, -73, 24, 45, 75, -44, 76];

export const chartdata = {
  datasets: [
    {
      backgroundColor: '#3bff8910',
      borderColor: '#3bff89ff',
      data: y,
      fill: true,
      label: 'Dataset 2'
    }
  ],
  labels: x
};

const x1 = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const y1 = [0, 0, 0, 0, 75, 44, 76];

export const chartdata2 = {
  datasets: [
    // {
    {
      backgroundColor: '#ff386310',
      borderColor: '#ff3863ff',
      data: y1,
      fill: 'origin'
    }

    // 0: fill to 'origin'
    // {fill: '-1'},       // 1: fill to dataset 0
    // {fill: 1},          // 2: fill to dataset 1
    // {fill: false},      // 3: no fill
    // {fill: '-2'}
    // label: 'Dataset 2',
    // data: y,
    // borderColor: '#3bff89ff',
    // backgroundColor: '#3bff8910',
    // },
  ],
  labels: x1
};

export const widgetConfig: WidgetConfig = {
  toChain: 34443,
  fromChain: 1,
  fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  toToken: '0x18470019bf0e94611f15852f7e93cf5d65bc34ca',
  containerStyle: {
    border: '1px solid #3bff89ff',
    borderRadius: '16px'
  },
  theme: {
    palette: {
      primary: { main: '#3bff89' }
    }
  },
  // theme : { palette : "grey"},
  integrator: 'Ionic Money'
};
