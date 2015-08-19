// set global options for highcharts
Highcharts.setOptions({
	/* transparent background */
	chart: {
		backgroundColor: 'none',
		reflow: false
	},
	/* random color palette, will change later... */
	colors: [ 
		'#77c5d5',
		'#f3d03e',
		'#ed8b00',
		'#d14124',
		'#54A1C4',
		'#3F659E',
		'#2E2666'
	],
	/* set custom font (from @font-face definition on CSS) for all text instances */
	title: {
        text: null,
		style: {
			fontFamily: 'Arial',
			fontSize: '18px',
			color: '#000000'
		}
	},
	subtitle: {
		style: {
			fontFamily: 'Arial',
			fontSize: '12px',
			color: '#000000'
		}
	},
	labels: {
		style: {
			fontFamily: 'Arial',
			fontSize: '10px',
			color: '#000000'
		}					
	},
	legend: {
		itemStyle: {
			fontFamily: 'Arial',
			fontSize: '11px',
			color: '#000000',
			lineHeight: '15px',
			padding: '5px'
		},
		style: {
			fontFamily: 'Arial',
			fontSize: '10px',
			color: '#000000'
		}
	},
	plotOptions: {
		pie: {
			dataLabels: {
				style: {
					fontFamily: 'Arial',
					fontSize: '11px',
					color: '#000000'
				}
			}
		},
		column: {
			//borderWidth: 0,
			//shadow: false
		}
	},
	tooltip: {
		borderWidth: 1,
		style: {
			fontFamily: 'Arial',
			fontSize: '12px',
			color: '#000000'
		}
	},
	xAxis: {
		labels: {
			style: {
				fontFamily: 'Arial',
				fontSize: '11px',
				color: '#000000'
			}
		},
		title: {
			style: {
				fontFamily: 'Arial',
				fontSize: '13px',
				color: '#000000',
				fontWeight: 'normal'
			}
		}
	},
	yAxis: {
		labels: {
			style: {
				fontFamily: 'Arial',
				fontSize: '11px',
				color: '#000000'
			}
		},
		lineColor: '#333333',
		title: {
            text: null,
			style: {
				fontFamily: 'Arial',
				fontSize: '13px',
				color: '#000000',
				fontWeight: 'normal'
			}
		}
	},
	/* no credits at the bottom (sorry Highcharts author...) */
	credits: {
		enabled: false
	},
	/* no exporting buttons at first */
	exporting: {
		enabled: false
	}
});