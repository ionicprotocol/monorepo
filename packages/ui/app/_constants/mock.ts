//----------donut chart

export const donutdata = {
  labels: ['Lend', 'Total'],
  datasets: [
    {
      // label: 'My First Dataset',
      data: [30, 70],
      backgroundColor: ['#3bff89ff', '#34363dff']
    }
  ]
};

export const donutoptions = {
  maintainAspectRatio: false,
  // spacing :10 ,
  plugins: {
    legend: {
      display: false
    }
  },
  elements: {
    arc: {
      borderWidth: 0,
      borderDash: [90]
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
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: 'right' as const
    },
    title: {
      display: true,
      text: 'Supply APR',
      position: 'top' as const
    }
  },
  maintainAspectRatio: false,
  scales: {
    y: {
      grid: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};
export const chartoptions2 = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Borrow APR Variable',
      position: 'top' as const
    }
  },
  maintainAspectRatio: false,
  scales: {
    y: {
      grid: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

const x = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const y = [87, -73, 24, 45, 75, -44, 76];

export const chartdata = {
  labels: x,
  datasets: [
    {
      fill: true,
      label: 'Dataset 2',
      data: y,
      borderColor: '#3bff89ff',
      backgroundColor: '#3bff8910'
    }
  ]
};

const x1 = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const y1 = [0, 0, 0, 0, 75, 44, 76];

export const chartdata2 = {
  labels: x1,
  datasets: [
    // {
    {
      fill: 'origin',
      data: y1,
      borderColor: '#ff3863ff',
      backgroundColor: '#ff386310'
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
  ]
};
