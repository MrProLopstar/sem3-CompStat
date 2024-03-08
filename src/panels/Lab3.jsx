import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup, Input, Select, Button } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import { v4 as uuidv4 } from 'uuid';
import { Line, Bar, Scatter } from 'react-chartjs-2';
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
import jStat from 'jstat';

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

class Lab3 extends Component {
	constructor(props){
		super(props);
		this.state = {
			select: 0,
			M: 4,
			N: 10,
			n: 5,
			//
			alpha: 10,
			beta: 0.6,
			//
			sampleSize: 20,
			arr: null
		};
	}

	factorial = (n) => {
		let result=1;
		for(let i=2; i<=n; i++) result *= i;
		return result;
	};
	Bernoulli(p) {
		return Math.random() < p;
	}

	generateHyperGeometricSample = (N, n, K, sampleSize) => {
        let sample = [];
		for(let i=0; i<sampleSize; i++){
			let sum = 0, p = K/N;
			for(let j=1; j<=n; j++){
				if(this.Bernoulli(p)){
					sum++;
					if(sum===K) break;
				}
				p = (K-sum)/(N-j);
			}
			sample.push(sum);
		}
		return sample;
    };

    generateBetaSample = (alpha, beta, sampleSize) => {
		let sample = [];
		for(let i=0; i<sampleSize; i++){
			let x = jStat.gamma.sample(alpha, 1);
			let y = jStat.gamma.sample(beta, 1);
			sample.push(x/(x+y));
		}
		return sample;
	};

    calculation = () => {
		const {select, M, N, n, alpha, beta, sampleSize} = this.state;
		let itog = [];
	
		if(select===0){
			if(n>N || M>N || M>n) return alert('Параметры n и M должны быть меньше или равны N, и M не должно превышать n.');
			itog = this.generateHyperGeometricSample(N, n, M, sampleSize);
		} else if(select===1){
			if(alpha<=0 || beta<=0) return alert('Параметры α и β должны быть больше нуля.');
			itog = this.generateBetaSample(alpha, beta, sampleSize);
		}

		let formattedSample = itog.map(value => ({ value: uuidv4(), label: value.toFixed(4).toString() }));
		this.setState({ arr: formattedSample, renderKey: Math.random() });
	};

	getStatisticalSeries = (arr) => {
		if(!arr) return;
		const frequencyMap = arr.reduce((acc, current) => {
			const value = parseFloat(current.label).toFixed(6);
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
		if(!arr) return;
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
				lowerBoundary: lowerBoundary.toFixed(6),
				upperBoundary: upperBoundary.toFixed(6),
				midpoint: ((lowerBoundary+upperBoundary)/2).toFixed(6),
				frequency,
				accumulatedFrequency: accumulatedFrequencies,
				relativeFrequency: relativeFrequency.toFixed(6),
				accumulatedRelativeFrequency: accumulatedRelativeFrequencies.toFixed(6),
			};
		});

		return series;
	}

	render(){
		const {title} = getState().app;
		const {select,M,N,n,alpha,beta,arr,renderKey,sampleSize} = this.state;
		const sortedArr = arr?.slice().sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
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
						text: 'X'
					}
				}
			}
		};
		const scatterData = {
			datasets: [{
				// Устанавливаем тип диаграммы как 'scatter'
				type: 'scatter',
				label: 'Бета-распределение',
				// Координаты точек на диаграмме
				data: arr ? arr.map((item, index) => ({
					x: index, // Или другое значение, если оно у вас есть
					y: parseFloat(item.label)
				})) : [],
				backgroundColor: 'rgba(75,192,192,0.6)',
				borderColor: 'rgba(75,192,192,1)',
				borderWidth: 1
			}]
		};
		const titles = ['Гипергеометрический закон','Бета закон'];
		return (
			<Panel>
				<PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())}/>}>{title}</PanelHeader>
				{select==1 ? (
					<FormLayoutGroup mode="horizontal" segmented>
						<FormItem top="Найти значения для">
							<Select
								value={select}
								options={titles.map((i,index) => ({
									label: i,
									value: index,
								}))}
								onChange={({target}) => this.setState({select: target.value==='' ? 0 : parseInt(target.value, 10)})}
							/>
						</FormItem>
						<FormItem top='α:'>
							<Input
								value={alpha}
								onChange={({ target }) => this.setState({alpha: target.value==='' ? 0 : parseInt(target.value, 10)})}
							/>
						</FormItem>
						<FormItem top='β:'>
							<Input
								value={beta}
								onChange={({ target }) => this.setState({beta: target.value==='' ? 0 : parseInt(target.value, 10)})}
							/>
						</FormItem>
					</FormLayoutGroup>
				) : (
					<div>
						<FormLayoutGroup mode="horizontal" segmented>
							<FormItem top="Найти значения для">
								<Select
									value={select}
									options={titles.map((i,index) => ({
										label: i,
										value: index,
									}))}
									onChange={({target}) => this.setState({select: target.value==='' ? 0 : parseInt(target.value, 10)})}
								/>
							</FormItem>
							<FormItem top='Размер совокупности N:'>
								<Input
									value={N}
									onChange={({ target }) => this.setState({N: target.value==='' ? 0 : parseInt(target.value, 10)})}
								/>
							</FormItem>
						</FormLayoutGroup>
						<FormLayoutGroup mode="horizontal" segmented>
							<FormItem top='Количество "успехов" в совокупности M:'>
								<Input
									value={M}
									onChange={({ target }) => this.setState({M: target.value==='' ? 0 : parseInt(target.value, 10)})}
								/>
							</FormItem>
							<FormItem top='Размер выборки n:'>
								<Input
									value={n}
									onChange={({ target }) => this.setState({n: target.value==='' ? 0 : parseInt(target.value, 10)})}
								/>
							</FormItem>
						</FormLayoutGroup>
					</div>
				)}
				<FormItem top='Размер выборки:'><Input
					align='center'
					value={sampleSize}
					onChange={({ target }) => this.setState({sampleSize: target.value==='' ? 0 : parseInt(target.value, 10)})}
				/></FormItem>
				<FormItem><Button rounded stretched onClick={this.calculation}>Рассчёт</Button></FormItem>
				{arr && (
					<div>
						<FormItem top='Изначальный массив'>
							<ChipsInput
								disabled
								value={arr}
								key={renderKey}
								//onChange={this.handleChipChange}
							/>
				  		</FormItem>
				  		<FormItem top='Вариационный ряд'>
						<ChipsInput
					  		disabled
					  		value={sortedArr}
							key={renderKey}
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
						<FormItem top='Диаграмма рассеивания бета-распределения'>
							<Scatter data={scatterData} options={{
								scales: {
									x: {
										title: {
											display: true,
											text: 'Индекс выборки'
										}
									},
									y: {
										title: {
											display: true,
											text: 'Значение'
										}
									}
								}
							}} />
						</FormItem>
					</div>
				)}
			</Panel>
		);
	}
}

export default Lab3;