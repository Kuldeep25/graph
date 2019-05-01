import { Component } from '@angular/core';

import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import * as $ from "jquery";

interface GraphData {
  location,
  metric,
  startMonth,
  startYear,
  endMonth,
  endYear,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  months = [];
  years = [];
  graphData = <GraphData>{};
  showGraph = false;
  endDateShouldGraterError = false;

  constructor(private httpClient:HttpClient) {

    //Setting months in dropdown list
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    //Setting years in dropdown list
    let startYear = 1910;
    for (let k = startYear; k <= new Date().getFullYear(); k++) {
      this.years.push(k);
    }

    //Intializing the default values
    this.graphData.location = "";
    this.graphData.metric = "";
    this.graphData.startMonth = "";
    this.graphData.startYear = "";
    this.graphData.endMonth = "";
    this.graphData.endYear = "";

  }


  //FUNCTION for getting data from API for graph
  getData(form) {
    let xAxix = [];
    let yAxix = [];
    this.showGraph = false;
    this.endDateShouldGraterError = false;
    if ((this.graphData.endYear < this.graphData.startYear) || ((this.graphData.endYear == this.graphData.startYear) && (this.graphData.endMonth <= this.graphData.startMonth))) {
      if (this.graphData.endYear != "" && this.graphData.startYear != "" && this.graphData.endMonth != "" && this.graphData.startMonth != "") {
        this.endDateShouldGraterError = true;
      }
    } else {
      if (form.valid) {
        let yAxixtitle;
        if (this.graphData.metric == "Tmax" || this.graphData.metric == "Tmin") {
          yAxixtitle = this.graphData.metric + " (°C)";
        } else {
          yAxixtitle = this.graphData.metric + " (mm)";
        }
        $('.ajax-loading-modal').show();
        this.showGraph = true;
        let url = "https://s3.eu-west-2.amazonaws.com/interview-question-data/metoffice/" + this.graphData.metric + "-" + this.graphData.location + ".json"
        this.httpClient.get(url).subscribe((res:any[])=> {
          $('.ajax-loading-modal').hide();
          for (var i in res) {
            if ((res[i].month < Number(this.graphData.startMonth) && res[i].year == Number(this.graphData.startYear))) {
              continue;
            }
            if ((res[i].month > Number(this.graphData.endMonth) && res[i].year == Number(this.graphData.endYear))) {
              continue;
            }
            if ((res[i].year >= Number(this.graphData.startYear) && res[i].year <= Number(this.graphData.endYear))) {
              xAxix.push(this.months[res[i].month - 1] + " " + res[i].year);
              yAxix.push(res[i].value);
            }
          }

          //Assigning values to chart
          Highcharts.chart('graph-container', {
            title: {
              text: 'Monthly Average Weather'
            },
            xAxis: {
              categories: xAxix,

            },
            yAxis: {
              title: {
                text: yAxixtitle,
              },
            },
            plotOptions: {
              line: {
                dataLabels: {
                  enabled: false
                },
                enableMouseTracking: true
              },
              series: {
                lineWidth: 1
              }
            },
            series: <Array<Highcharts.SeriesOptionsType>>[{
              name: "Location( " + this.graphData.location + " )",
              data: yAxix
            }],
            responsive: {
              rules: [{
                chartOptions: {
                  legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                  }
                }
              }]
            }
          });
        });

      }
    }


  }

}

