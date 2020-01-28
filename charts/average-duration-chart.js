const { CanvasRenderService } = require("chartjs-node-canvas");
const getDurationChartData = require("./chart-db-helper");

async function getChartImg(chat_id) {
  const data = await getDurationChartData(chat_id);
  const width = 1000;
  const height = 1000;

  const configuration = {
    type: "bar",
    data: {
      labels: data.urls,
      datasets: [
        {
          label: "Durations in milliseconds",
          data: data.durations,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(241, 130, 141, 0.2)",
            "rgba(35, 203, 167, 0.2)",
            "rgba(250, 216, 89, 0.2)",
            "rgba(155, 89, 182, 0.2)"
          ],
          borderColor: [
            "rgba(255,99,132,1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(241, 130, 141,1)",
            "rgba(35, 203, 167, 1)",
            "rgba(250, 216, 89, 1)",
            "rgba(155, 89, 182, 1)"
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: value => value + " ms"
            }
          }
        ]
      }
    }
  };

  const chartCallback = ChartJS => {
    // Global config example: https://www.chartjs.org/docs/latest/configuration/
    ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
    // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
    ChartJS.plugins.register({
      // plugin implementation
    });
    // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
    ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
      // chart implementation
    });
  };

  const canvasRenderService = new CanvasRenderService(
    width,
    height,
    chartCallback
  );
  const image = await canvasRenderService.renderToBuffer(configuration);
  // const dataUrl = await canvasRenderService.renderToDataURL(configuration);
  // const stream = canvasRenderService.renderToStream(configuration);
  return image;
}

module.exports = getChartImg;