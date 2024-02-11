import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup, Input, Select, Button } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
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
import { erf } from 'jstat';
import { setPage } from '../store/router';
import { setPageState } from '../store/app';

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
			N: 12,
			a: 4,
			//
			n: 10,
			p: 0.6,
			el: 15,
			//
			N_: 50,
			M: 5,
			S: 6,
			arr: null
		};
	}

	factorial = (n) => {
		let result=1;
		for(let i=2; i<=n; i++) result *= i;
		return result;
	};

	calculation = () => {
		const {select,N,a,n,p,el,N_,M,S} = this.state;
		let itog = [];
		if(select==0){
			if(N<=0) return alert("Количество экспериментов должно быть больше нуля.");
			else if (a<=0) return alert("Параметр 'a' должен быть больше нуля.");
			let y0, k = 11, y = Math.random();
			const inverseFunction = (a, y) => {return -Math.log(1 - y) / a};
			itog.push({value: uuidv4(), label: inverseFunction(a, y)});
			for(let i=1; i<N; i++){
			  y0 = y;
			  y = (k*y0)-Math.floor(k*y0);
			  itog.push({value: uuidv4(), label: inverseFunction(a, y).toFixed(4).toString()});
			}
		} else if(select==1){
			if(el<0) return alert("Переменная el должна быть больше нуля.");
			else if(n<0) return alert("Переменная n должна быть больше нуля.");
			else if(p<0 || p>1) return alert("Вероятность 'p' должна быть в диапазоне от 0 до 1.");
			for(let i=0; i<el; i++){
				let success = 0;
				for(let j=0; j<n; j++) if(Math.random()<p) success++;
				itog.push({ value: uuidv4(), label: success.toString() });
			}
		} else if(select==2){
			if(N_<=0) return alert("Количество экспериментов должно быть больше нуля.");
			else if(M<=0) return alert("Мат. ожидание должно быть больше нуля.");
			else if(S<=0) return alert("Среднеквадратичное отклонение должно быть больше нуля.");
			let ready = false;
			let second = 0.0;
			for(let i=0; i<N_; i++){
				if(ready){
					ready = false;
					itog.push({ value: uuidv4(), label: (second*S+M).toFixed(4).toString() })
				} else {
					let u, v, s;
					do {
						u = 2.0*Math.random()-1.0;
						v = 2.0*Math.random()-1.0;
						s = u*u+v*v;
					} while (s>1.0 || s==0.0);
					const r = Math.sqrt(-2.0*Math.log(s)/s);
					second = r*u;
					ready = true;
					itog.push({ value: uuidv4(), label: (r*v*S+M).toFixed(4).toString() });
				}
			}
		}
		this.setState({arr: itog});
	}

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
		const {select,N,a,n,p,el,N_,M,S,arr} = this.state;	
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
		const titles = ['Экспонециальный закон','Биномиальный закон','Нормальный закон'];
		return (
			<Panel>
				<PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())}/>}>{title}</PanelHeader>
				{select==0 ? (
					<FormLayoutGroup mode="horizontal" segmented>
						<FormItem top="Найти значения для">
							<Select
								value={select}
								options={titles.map((i,index) => ({
									label: i,
									value: index,
								}))}
								onChange={({target}) => this.setState({select: target.value})}
							/>
						</FormItem>
						<FormItem top='a:'>
							<Input
								value={a}
								onChange={({target}) => this.setState({a: target.value})}
							/>
						</FormItem>
						<FormItem top='N:'>
							<Input
								value={N}
								onChange={({target}) => this.setState({N: target.value})}
							/>
						</FormItem>
					</FormLayoutGroup>
				) : (select==1 ? (
					<div>
						<FormLayoutGroup mode="horizontal" segmented>
							<FormItem top="Найти значения для">
								<Select
									value={select}
									options={titles.map((i,index) => ({
										label: i,
										value: index,
									}))}
									onChange={({target}) => this.setState({select: target.value})}
								/>
							</FormItem>
							<FormItem top='Кол-во испытаний:'>
								<Input
									value={n}
									onChange={({target}) => this.setState({n: target.value})}
								/>
							</FormItem>
						</FormLayoutGroup>
						<FormLayoutGroup mode="horizontal" segmented>
							<FormItem top='Введите вероятность p:'>
								<Input
									value={p}
									onChange={({target}) => this.setState({N: target.value})}
								/>
							</FormItem>
							<FormItem top='Введите количество элементов:'>
								<Input
									value={el}
									onChange={({target}) => this.setState({el: target.value})}
								/>
							</FormItem>
						</FormLayoutGroup>
					</div>
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
									onChange={({target}) => this.setState({select: target.value})}
								/>
							</FormItem>
							<FormItem top='N:'>
								<Input
									value={N_}
									onChange={({target}) => this.setState({N_: target.value})}
								/>
							</FormItem>
						</FormLayoutGroup>
						<FormLayoutGroup mode="horizontal" segmented>
							<FormItem top='M:'>
								<Input
									value={M}
									onChange={({target}) => this.setState({M: target.value})}
								/>
							</FormItem>
							<FormItem top='S:'>
								<Input
									value={S}
									onChange={({target}) => this.setState({S: target.value})}
								/>
							</FormItem>
						</FormLayoutGroup>
					</div>
				))}
				<FormItem><Button rounded stretched onClick={this.calculation}>Рассчёт</Button></FormItem>
				{arr && (
					<div>
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
					</div>
				)}
			</Panel>
		);
	}
}

export default Lab3;