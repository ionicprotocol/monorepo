//----------donut chart

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
