//----------donut chart

export function getDonutData(ofdata: number, total: number) {
  const data2 = total - ofdata;
  const donutdata = {
    datasets: [
      {
        backgroundColor: ['#3bff89ff', '#34363dff'],
        // label: 'My First Dataset',
        data: [ofdata, data2]
      }
    ],
    labels: ['Provided', 'Total']
  };
  return donutdata;
}
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
      text: 'Borrow/Supply APY'
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

export function getChartData(x: string[], y: number[]) {
  const chartdata = {
    datasets: [
      {
        backgroundColor: '#3bff8910',
        borderColor: '#3bff89ff',
        data: y,
        fill: true,
        label: 'APY'
      }
    ],
    labels: x
  };
  return chartdata;
}

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

export const chartoptions2 = {
  maintainAspectRatio: false,
  aspectRatio: 2,
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        padding: 10,
        boxWidth: 15
      }
    },
    title: {
      display: true,
      position: 'top' as const,
      text: 'Interest Rate Model',
      padding: {
        top: 0,
        bottom: 10
      }
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
        }
      }
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Utilization Rate (%)'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10
      }
    },
    y: {
      title: {
        display: true,
        text: 'Interest Rate (%)',
        padding: { top: 0, bottom: 0 }
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      min: 0,
      ticks: {
        callback: (value: any) => `${value}%`,
        padding: 8
      }
    }
  }
};
