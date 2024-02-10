import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import lab1 from '../data/lab1.json';
import { v4 as uuidv4 } from 'uuid';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
	BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
	BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
		arr: lab1.map(x => ({ value: uuidv4(), label: x.toString() }))
		};
	}

	handleChipChange = (newChips) => {
		this.setState({ arr: newChips.map(x => ({ value: uuidv4(), label: x.label })) });
	}
	getStatisticalSeries = (arr) => {
		const frequencyMap = arr.reduce((acc, current) => {
			const value = parseFloat(current.label).toFixed(2);
			acc[value] = (acc[value] || 0) + 1;
			return acc;
		}, {});
		const statisticalSeries = Object.entries(frequencyMap).map(([value, frequency]) => ({
			value,
			frequency
		}));
		statisticalSeries.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
		return statisticalSeries;
	}

	getGroupedStatisticalSeries = (arr) => {
		const length = arr.length;
		const k = Math.ceil(1+3.32*Math.log10(length));
		const max = Math.max(...arr.map(x => parseFloat(x.label)));
		const min = Math.min(...arr.map(x => parseFloat(x.label)));
		const b = (max-min)/k;

		let boundaries = Array.from({ length: k+1 }, (_, i) => min+i*b);
		let frequencies = new Array(k).fill(0);
		let accumulatedFrequencies = 0;
		let accumulatedRelativeFrequencies = 0;

		for(let value of arr){
			let val = parseFloat(value.label);
			let index = Math.min(Math.floor((val-min)/b), k - 1);
			frequencies[index]++;
		}

		let series = boundaries.slice(1).map((upperBoundary, index) => {
			let lowerBoundary = boundaries[index];
			let frequency = frequencies[index];
			accumulatedFrequencies += frequency;
			let relativeFrequency = frequency / length;
			accumulatedRelativeFrequencies += relativeFrequency;

			return {
				number: index+1,
				lowerBoundary: lowerBoundary.toFixed(2),
				upperBoundary: upperBoundary.toFixed(2),
				midpoint: ((lowerBoundary+upperBoundary)/2).toFixed(2),
				frequency,
				accumulatedFrequency: accumulatedFrequencies,
				relativeFrequency: relativeFrequency.toFixed(4),
				accumulatedRelativeFrequency: accumulatedRelativeFrequencies.toFixed(4),
			};
		});

		return series;
	}

  render(){
    const {arr} = this.state;
    const sortedArr = arr.slice().sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
    const statisticalSeries = this.getStatisticalSeries(sortedArr);
		const groupedStatisticalSeries = this.getGroupedStatisticalSeries(arr);		
		function getPolygonChartData(data){
			return {
				labels: groupedStatisticalSeries.map(item => item.lowerBoundary+'-'+item.upperBoundary),
				datasets: [
					{
						data,
						label: 'Частота',
						borderColor: 'rgba(75,192,192,1)',
						backgroundColor: 'rgba(75,192,192,0.2)',
						fill: false
					}
				]
			}
		}
		const options = {
			title: {
				display: true,
				text: 'Полигон частот',
				fontSize: 20
			},
			legend: {
				display: true,
				position: 'bottom'
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: 'Частота'
					}
				},
				x: {
					title: {
						display: true,
						text: 'Интервалы'
					}
				}
			}
		};
    
    return (
      <Panel>
        <PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())}/>}>Лабораторная работа №1</PanelHeader>
        <FormItem top='Изначальный массив'>
          <ChipsInput
						disabled
            value={arr}
            //onChange={this.handleChipChange}
          />
        </FormItem>
        <FormItem top='Вариационный ряд'>
          <ChipsInput
            disabled
            value={sortedArr}
          />
        </FormItem>
        <FormItem top='Статистический ряд'>
					<table style={{ borderCollapse: 'collapse', width: '100%' }}>
						<tbody>
							<tr>
								<th className="table-cell">Значение</th>
								{statisticalSeries.map((item, index) => (
									<td key={`value-${index}`} className="table-cell">
										{item.value}
									</td>
								))}
							</tr>
							<tr>
								<th className="table-cell">Частота</th>
								{statisticalSeries.map((item, index) => (
									<td key={`frequency-${index}`} className="table-cell">
										{item.frequency}
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</FormItem>
				<FormItem top='Группированный статистический ряд'>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr>
								<th className="table-cell">№</th>
								<th className="table-cell">Нижняя Граница</th>
								<th className="table-cell">Верхняя Граница</th>
								<th className="table-cell">Середина</th>
								<th className="table-cell">Частота</th>
								<th className="table-cell">Накопленная частота</th>
								<th className="table-cell">Относительная частота</th>
								<th className="table-cell">Относительная накопленная частота</th>
							</tr>
						</thead>
						<tbody>
							{groupedStatisticalSeries.map((item, index) => (
								<tr key={index}>
									<td className="table-cell">{item.number}</td>
									<td className="table-cell">{item.lowerBoundary}</td>
									<td className="table-cell">{item.upperBoundary}</td>
									<td className="table-cell">{item.midpoint}</td>
									<td className="table-cell">{item.frequency}</td>
									<td className="table-cell">{item.accumulatedFrequency}</td>
									<td className="table-cell">{item.relativeFrequency}</td>
									<td className="table-cell">{item.accumulatedRelativeFrequency}</td>
								</tr>
							))}
						</tbody>
					</table>
				</FormItem>
				{[{line: 'Частота (полигон)', bar: 'Частота (гистограмма)', data: groupedStatisticalSeries.map(item => item.frequency)},
				{line: 'Накопленная частота (полигон)', bar: 'Накопленная частота (гистограмма)', data: groupedStatisticalSeries.map(item => item.accumulatedFrequency)},
				{line: 'Относительная частота (полигон)', bar: 'Относительная частота (гистограмма)', data: groupedStatisticalSeries.map(item => item.relativeFrequency)},
				{line: 'Относительная накопленная частота (полигон)', bar: 'Относительная накопленная частота (гистограмма)', data: groupedStatisticalSeries.map(item => item.accumulatedRelativeFrequency)}].map((item, index) => (
					<FormLayoutGroup mode="horizontal">
						<FormItem top={item.line} htmlFor="start">
							<Line options={options} data={getPolygonChartData(item.data)}/>
						</FormItem>
						<FormItem top={item.bar} htmlFor="end">
							<Bar options={options} data={getPolygonChartData(item.data)}/>
						</FormItem>
					</FormLayoutGroup>
				))}
      </Panel>
    );
  }
}

export default Main;