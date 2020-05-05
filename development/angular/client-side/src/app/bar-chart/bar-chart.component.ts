import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppServiceComponent } from '../app.service';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ExportToCsv } from 'export-to-csv';


// export interface PeriodicElement {
//   districtName: string;
//   visit_0: number;
//   visit_3_5: number;
//   visit_6_10: number;l;k
// }


@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements OnInit {
  public ELEMENT_DATA: any;
  public displayedColumns: any;
  public dataSource: any;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public title: string = '';
  public titleName: string = '';
  public districts: any;
  public blocks: any = [];
  public cluster: any = [];
  public schools: any = [];
  public districtsIds: any = [];
  public blocksIds: any = [];
  public clusterIds: any = [];
  public schoolsIds: any = [];
  public districtsNames: any = [];
  public blocksNames: any = [];
  public clusterNames: any = [];
  public schoolsNames: any = [];
  public stylesFile = "../assets/mapStyles.json";
  public id: any = '';
  public blockHidden: boolean = true;
  public clusterHidden: boolean = true;
  public myDistrict: any;
  public myBlock: any;
  public myCluster: any;
  public colors: any;
  public studentCount: any;
  public schoolCount: Number;
  public dateRange: any = '';
  public dist: boolean = false;
  public blok: boolean = false;
  public clust: boolean = false;
  public skul: boolean = false;
  public hierName: any;
  public distName: any;
  public blockName: any;
  public clustName: any;
  public visitCount: any;

  public styles: any = [];
  public labelOptions: any = {};

  public mylatlngData: any = [];
  public result: any = [];

  public scatterChart: Chart;
  public xAxis: any = "visit_0";
  public yAxis: any = "visit_1_2";

  public crcDistrictsNames: any;
  public crcBlocksNames: any;
  public crcClusterNames: any;
  public crcSchoolNames: any;

  public fileName: any;
  public reportData: any = [];

  public xAxisFilter = [
    { key: 'visit_0', value: "Visit-0 times (%)" },
    { key: 'visit_1_2', value: "Visit-1 to 2 times (%)" },
    { key: 'visit_3_5', value: "Visit-3 to 5 times (%)" },
    { key: 'visit_6_10', value: "Visit-6 to 10 times (%)" },
    { key: 'visit_10_more', value: "Visits more than 10 times (%)" },
    { key: "no_of_schools_per_crc", value: "Number of schools per CRC" },
    { key: "visits_per_school", value: "Visits per schools" },
    { key: "totalSchools", value: "Total schools" }
  ]

  public yAxisFilter = [
    { key: 'visit_0', value: "Visit-0 times (%)" },
    { key: 'visit_1_2', value: "Visit-1 to 2 times (%)" },
    { key: 'visit_3_5', value: "Visit-3 to 5 times (%)" },
    { key: 'visit_6_10', value: "Visit-6 to 10 times (%)" },
    { key: 'visit_10_more', value: "Visits more than 10 times (%)" },
    { key: "no_of_schools_per_crc", value: "Number of schools per CRC" },
    { key: "visits_per_school", value: "Visits per schools" },
    { key: "totalSchools", value: "Total schools" }
  ]


  constructor(public http: HttpClient, public service: AppServiceComponent, public router: Router, private changeDetection: ChangeDetectorRef) { }

  async ngOnInit() {
    // if (this.dataSource.length > 0) {
    // this.dataSource.sort = this.sort;
    // }
    this.createChart(["clg"], [], '', {});
    this.districtWise();
  }


  loaderAndErr() {
    if (this.scatterChart !== null) {
      document.getElementById('spinner').style.display = 'none';
    } else {
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('errMsg').style.color = 'red';
      document.getElementById('errMsg').style.display = 'block';
      document.getElementById('errMsg').innerHTML = 'No data found';
    }
  }

  errMsg() {
    document.getElementById('errMsg').style.display = 'none';
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('spinner').style.marginTop = '3%';
  }
  public tableHead: any;
  public tableData: any = [];
  public chartData: any = [];
  districtWise() {
    document.getElementById('dist_table').style.display = 'block';
    document.getElementById('block_table').style.display = 'none';
    document.getElementById('cluster_table').style.display = 'none';
    document.getElementById('school_table').style.display = 'none';
    this.scatterChart.destroy();
    this.tableHead = "District Name";
    this.fileName = "Dist_level_CRC_Report";
    this.blockHidden = true;
    this.clusterHidden = true;
    this.myDistrict = '';
    this.errMsg();
    this.dist = false;
    this.blok = false;
    this.clust = false;
    this.skul = true;

    this.schoolCount = 0;
    this.visitCount = 0;
    document.getElementById('home').style.display = 'none';

    this.tableData = [];

    this.displayedColumns = [
      'districtName', 'visit_0', 'visit_1_2', 'visit_3_5', 'visit_6_10', 'visit_10_more', 'visits_per_school',
      'no_of_schools_per_crc', 'percentage_crc_visited_school', 'totalSchools', 'totalVisits'
    ];

    this.dateRange = localStorage.getItem('dateRange');
    // if (this.result.length > 0) {
    if (JSON.parse(localStorage.getItem('resData')) !== null) {
      this.chartData = [];
      var labels = [];
      this.result = JSON.parse(localStorage.getItem('resData'));
      let colors = this.color().generateGradient('#FF0000', '#7FFF00', this.result.length, 'rgb');
      this.ELEMENT_DATA = this.crcDistrictsNames = this.result;
      for (var i = 0; i < this.result.length; i++) {
        this.schoolCount = this.schoolCount + this.result[i].totalSchools;
        this.visitCount = this.visitCount + Number(this.result[i].totalVisits);
        this.districtsNames.push({ id: this.result[i].districtId, name: this.result[i].districtName });
        labels.push(this.result[i].districtName);
        this.chartData.push({ x: Number(this.result[i][this.xAxis]), y: Number(this.result[i][this.yAxis]) });
      }
      let obj = {
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        pointBackgroundColor: colors
      }

      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.sort = this.sort;

      this.createChart(labels, this.chartData, this.tableHead, obj);
      this.loaderAndErr();
      this.changeDetection.markForCheck();
    } else {
      this.schoolCount = 0;
      this.visitCount = 0;
      this.chartData = []
      this.service.crcDistWiseData().subscribe(res => {
        localStorage.setItem('resData', JSON.stringify(res));
        this.result = res;
        let colors = this.color().generateGradient('#FF0000', '#7FFF00', this.result.length, 'rgb');

        this.ELEMENT_DATA = this.result;
        if (this.result.length > 0) {
          var labels = [];
          this.reportData = this.crcDistrictsNames = this.result;
          for (var i = 0; i < this.result.length; i++) {
            this.schoolCount = this.schoolCount + this.result[i].totalSchools;
            this.visitCount = this.visitCount + Number(this.result[i].totalVisits);
            this.districtsNames.push({ id: this.result[i].districtId, name: this.result[i].districtName });
            labels.push(this.result[i].districtName);
            this.chartData.push({ x: Number(this.result[i][this.xAxis]), y: Number(this.result[i][this.yAxis]) });
          }
          let obj = {
            xAxis: this.xAxis,
            yAxis: this.yAxis,
            pointBackgroundColor: colors
          }

          this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
          // this.dataSource.sort = this.sort;

          this.createChart(labels, this.chartData, this.tableHead, obj);
          this.loaderAndErr();
          this.changeDetection.markForCheck();
        }
      });
    }
  }


  myDistData(data) {
    document.getElementById('dist_table').style.display = 'none';
    document.getElementById('block_table').style.display = 'block';
    document.getElementById('cluster_table').style.display = 'none';
    document.getElementById('school_table').style.display = 'none';
    this.scatterChart.destroy();
    this.blockHidden = false;
    this.clusterHidden = true;
    this.fileName = "Block_level_CRC_Report"
    this.myBlock = '';
    this.errMsg();
    this.schoolCount = 0;
    this.visitCount = 0;
    this.tableData = [];
    this.chartData = [];
    this.tableHead = "Block Name";
    this.dist = true;
    this.blok = false;
    this.clust = false;
    this.skul = false;
    let obj = this.districtsNames.find(o => o.id == data);
    this.distName = data;
    this.hierName = obj.name;
    localStorage.setItem('dist', obj.name);
    localStorage.setItem('distId', data);

    // this.dataSource = {};
    this.displayedColumns = [
      'blockName', 'districtName', 'visit_0', 'visit_1_2', 'visit_3_5', 'visit_6_10', 'visit_10_more', 'visits_per_school',
      'no_of_schools_per_crc', 'percentage_crc_visited_school', 'totalSchools', 'totalVisits'
    ];
    this.service.crcBlockWiseData(data).subscribe((result: any) => {
      this.reportData = this.crcBlocksNames = result;
      let colors = this.color().generateGradient('#FF0000', '#7FFF00', this.crcBlocksNames.length, 'rgb');

      this.ELEMENT_DATA = this.crcBlocksNames;
      if (this.result.length > 0) {
        var labels = [];
        for (var i = 0; i < this.crcBlocksNames.length; i++) {
          this.schoolCount = this.schoolCount + this.crcBlocksNames[i].totalSchools;
          this.visitCount = this.visitCount + Number(this.crcBlocksNames[i].totalVisits);
          this.blocksNames.push({ id: this.crcBlocksNames[i].blockId, name: this.crcBlocksNames[i].blockName });
          labels.push(this.crcBlocksNames[i].blockName);
          this.chartData.push({ x: Number(this.crcBlocksNames[i][this.xAxis]), y: Number(this.crcBlocksNames[i][this.yAxis]) });
        }
        let obj = {
          xAxis: this.xAxis,
          yAxis: this.yAxis,
          pointBackgroundColor: colors
        }

        this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
        this.dataSource.sort = this.sort;

        this.createChart(labels, this.chartData, this.tableHead, obj);
        this.changeDetection.markForCheck();
        this.loaderAndErr();
      }
    });
    this.blocksNames.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    document.getElementById('home').style.display = 'block';;
  }

  myBlockData(data) {
    document.getElementById('dist_table').style.display = 'none';
    document.getElementById('block_table').style.display = 'none';
    document.getElementById('cluster_table').style.display = 'block';
    document.getElementById('school_table').style.display = 'none';
    this.scatterChart.destroy();
    this.clusterHidden = false;
    this.blockHidden = false;
    this.fileName = "Cluster_level_CRC_Report"
    this.myCluster = '';
    this.errMsg();
    this.schoolCount = 0;
    this.visitCount = 0;
    this.tableData = [];
    this.chartData = [];
    this.tableHead = "CRC Name";
    this.dist = false;
    this.blok = true;
    this.clust = false;
    this.skul = false;

    localStorage.setItem('blockId', data);
    this.titleName = localStorage.getItem('dist');
    this.distName = JSON.parse(localStorage.getItem('distId'));
    this.blockName = data;
    let obj = this.blocksNames.find(o => o.id == data);
    localStorage.setItem('block', JSON.stringify(obj.name));
    this.hierName = obj.name;

    this.displayedColumns = [
      'clusterName', 'blockName', 'districtName', 'visit_0', 'visit_1_2', 'visit_3_5', 'visit_6_10', 'visit_10_more', 'visits_per_school',
      'no_of_schools_per_crc', 'percentage_crc_visited_school', 'totalSchools', 'totalVisits'
    ];
    this.service.crcClusterWiseData(JSON.parse(localStorage.getItem('distId')), data).subscribe((result: any) => {
      this.reportData = this.crcClusterNames = result;
      let colors = this.color().generateGradient('#FF0000', '#7FFF00', this.crcClusterNames.length, 'rgb');
      this.ELEMENT_DATA = this.crcClusterNames;
      var labels = [];
      for (var i = 0; i < this.crcClusterNames.length; i++) {
        this.schoolCount = this.schoolCount + this.crcClusterNames[i].totalSchools;
        this.visitCount = this.visitCount + Number(this.crcClusterNames[i].totalVisits);
        this.clusterNames.push({ id: this.crcClusterNames[i].clusterId, name: this.crcClusterNames[i].clusterName });
        labels.push(this.crcClusterNames[i].clusterName);
        this.chartData.push({ x: Number(this.crcClusterNames[i][this.xAxis]), y: Number(this.crcClusterNames[i][this.yAxis]) });
      }
      let obj = {
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        pointBackgroundColor: colors
      }

      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      // this.dataSource.sort = this.sort;

      this.createChart(labels, this.chartData, this.tableHead, obj);
      this.changeDetection.markForCheck();
      this.loaderAndErr();
    });
    this.blocksNames.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));


    document.getElementById('home').style.display = 'block';;
  }

  myClusterData(data) {
    document.getElementById('dist_table').style.display = 'none';
    document.getElementById('block_table').style.display = 'none';
    document.getElementById('cluster_table').style.display = 'none';
    document.getElementById('school_table').style.display = 'block';
    this.scatterChart.destroy();
    this.tableHead = "School Name";
    this.errMsg();
    this.schoolCount = 0;
    this.visitCount = 0;
    this.fileName = "School_level_CRC_Report"
    this.crcSchoolNames = [];
    this.dist = false;
    this.blok = false;
    this.clust = true;
    this.skul = false;
    this.tableData = [];
    this.chartData = [];
    this.title = JSON.parse(localStorage.getItem('block'));
    this.titleName = localStorage.getItem('dist');
    var distId = JSON.parse(localStorage.getItem('distId'));
    var blockId = JSON.parse(localStorage.getItem('blockId'));
    this.distName = JSON.parse(localStorage.getItem('distId'));
    this.blockName = blockId;
    this.clustName = data;
    let obj = this.clusterNames.find(o => o.id == data);
    this.hierName = obj.name;
    localStorage.setItem('clusterId', data);

    this.displayedColumns = [
      'schoolName', 'clusterName', 'blockName', 'districtName', 'visit_0', 'visit_1_2', 'visit_3_5', 'visit_6_10', 'visit_10_more', 'visits_per_school',
      'no_of_schools_per_crc', 'percentage_crc_visited_school', 'totalSchools', 'totalVisits'
    ];
    this.service.crcSchoolWiseData(distId, blockId, data).subscribe(async (result: any) => {
      this.reportData = this.crcSchoolNames = result;
      let colors = this.color().generateGradient('#FF0000', '#7FFF00', this.crcSchoolNames.length, 'rgb');
      this.ELEMENT_DATA = this.crcSchoolNames;

      var labels = [];
      for (var i = 0; i < this.crcSchoolNames.length; i++) {
        this.schoolCount = this.schoolCount + this.crcSchoolNames[i].totalSchools;
        this.visitCount = this.visitCount + Number(this.crcSchoolNames[i].totalVisits);
        labels.push(this.crcSchoolNames[i].schoolName);
        this.chartData.push({ x: Number(this.crcSchoolNames[i][this.xAxis]), y: Number(this.crcSchoolNames[i][this.yAxis]) });
      }
      let obj = {
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        pointBackgroundColor: colors
      }
      this.dataSource = await new MatTableDataSource(this.ELEMENT_DATA);
      // this.dataSource.sort = await this.sort;

      this.loaderAndErr();
      this.createChart(labels, this.chartData, this.tableHead, obj);
      this.changeDetection.markForCheck();
    });
    document.getElementById('home').style.display = 'block';
  }

  createChart(labels, chartData, name, obj) {
    this.scatterChart = new Chart('myChart', {
      type: 'scatter',
      data: {
        labels: labels,
        datasets: [{
          data: chartData,
          pointBackgroundColor: obj.pointBackgroundColor,
          pointRadius: 6
        }]
      },
      options: {
        legend: {
          display: false
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              var label = data.labels[tooltipItem.index];
              var multistringText = [name + ": " + label];
              multistringText.push("x-Axis: " + tooltipItem.xLabel);
              multistringText.push("y-Axis: " + tooltipItem.yLabel);
              return multistringText;
            }
          }
        },

        scales: {
          xAxes: [{
            gridLines: {
              color: "rgba(252, 239, 252)",
            },
            ticks: {
              min: 0
            },
            scaleLabel: {
              display: true,
              labelString: obj.xAxis,
              fontSize: 12,
              // fontColor: "dark gray"
            }
          }],
          yAxes: [{
            gridLines: {
              color: "rgba(252, 239, 252)",
            },
            ticks: {
              min: 0
            },
            scaleLabel: {
              display: true,
              labelString: obj.yAxis,
              fontSize: 12,
              // fontColor: "dark gray",
            }
          }]
        }
      }
    });
  };

  downloadRoport() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      title: 'My Awesome CSV',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      filename: this.fileName
    };
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.reportData);
  }

  selectAxis() {
    if (this.skul) {
      this.districtWise();
    }
    if (this.dist) {
      this.myDistData(JSON.parse(localStorage.getItem('distId')));
    }
    if (this.blok) {
      this.myBlockData(JSON.parse(localStorage.getItem('blockId')));
    }
    if (this.clust) {
      this.myClusterData(JSON.parse(localStorage.getItem('clusterId')));
    }
  }

  color() {
    // Converts a #ffffff hex string into an [r,g,b] array
    function hex2rgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : null;
    }

    // Inverse of the above
    function rgb2hex(rgb) {
      return '#' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
    }

    // Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
    // Taken from the awesome ROT.js roguelike dev library at
    // https://github.com/ondras/rot.js
    function _interpolateRgb(color1, color2, factor) {
      if (arguments.length < 3) { factor = 0.5; }

      let result = color1.slice();

      for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
      }
      return result;
    }

    function generateGradient(color1, color2, total, interpolation) {
      const colorStart = typeof color1 === 'string' ? hex2rgb(color1) : color1;
      const colorEnd = typeof color2 === 'string' ? hex2rgb(color2) : color2;

      // will the gradient be via RGB or HSL
      switch (interpolation) {
        case 'rgb':
          return colorsToGradientRgb(colorStart, colorEnd, total);
        // case 'hsl':
        //   return colorsToGradientHsl(colorStart, colorEnd, total);
        default:
          return false;
      }
    }

    function colorsToGradientRgb(startColor, endColor, steps) {
      // returns array of hex values for color, since rgb would be an array of arrays and not strings, easier to handle hex strings
      let arrReturnColors = [];
      let interimColorRGB;
      let interimColorHex;
      const totalColors = steps;
      const factorStep = 1 / (totalColors - 1);

      for (let idx = 0; idx < totalColors; idx++) {
        interimColorRGB = _interpolateRgb(startColor, endColor, factorStep * idx);
        interimColorHex = rgb2hex(interimColorRGB);
        arrReturnColors.push(interimColorHex);
      }
      return arrReturnColors;
    }
    return {
      generateGradient
    };
  }

}
