import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup, Input, Select, Button, Separator, Slider } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import { v4 as uuidv4 } from 'uuid';
import { Line, Bar } from 'react-chartjs-2';
import norm from '../data/lab1.json';
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
import jStat, { erf } from 'jstat';

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

class Lab2 extends Component {
	constructor(props) {
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
			percent: 0.9,
			sampleSize: 20,
			//
			lambdaMin: 0,
			lambda: 0,
			lambdaMax: 0,
			arr: null
		};
	}

	factorial = (n) => {
		let result=1;
		for(let i=2; i<=n; i++) result *= i;
		return result;
	};
	Bernoulli(p){
		return Math.random()<p;
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

	resizeLength = (value, length) => {
		return (value.toString().split('.')[1] || '').length>length ? value.toFixed(4).toString() : value.toString()
	}

    calculation = () => {
		const { select, M, N, n, alpha, beta, sampleSize, percent } = this.state;
		let sample = [], estimates = {};
		
		if (select === 0) {
			if (n > N || M > N || M > n) return alert('Параметры n и M должны быть меньше или равны N, и M не должно превышать n.');
			sample = this.generateHyperGeometricSample(N, n, M, sampleSize);
			estimates = this.calculateEstimates(sample,(percent*100).toFixed(0));
		} else if (select === 1) {
			if (alpha <= 0 || beta <= 0) return alert('Параметры α и β должны быть больше нуля.');
			sample = this.generateBetaSample(alpha, beta, sampleSize);
			console.log(this.calculateBetaEstimates(alpha, beta, percent));
		}
	
		let formattedSample = sample.map(value => ({ value: uuidv4(), label: this.resizeLength(value, 4) }));
		this.setState({
			arr: formattedSample,
			renderKey: Math.random(),
			...estimates
		});
	};

	calculateBetaEstimates = (sample, alpha, beta, percent) => {
		const mean = jStat.mean(sample);
		const variance = jStat.variance(sample);
		
		const alphaHat = mean * ((mean * (1 - mean)) / variance - 1);
		const betaHat = (1 - mean) * ((mean * (1 - mean)) / variance - 1);

		const standardErrorAlpha = /* расчет стандартной ошибки для альфа */;
		const standardErrorBeta = /* расчет стандартной ошибки для бета */;
	  
		const z = jStat.normal.inv(1 - percent / 2, 0, 1);
	  
		const alphaInterval = [
		  alphaHat - z * standardErrorAlpha,
		  alphaHat + z * standardErrorAlpha
		];
		const betaInterval = [
		  betaHat - z * standardErrorBeta,
		  betaHat + z * standardErrorBeta
		];
	  
		return {
		  alpha: alphaHat,
		  beta: betaHat,
		  alphaConfidenceInterval: alphaInterval,
		  betaConfidenceInterval: betaInterval
		};
	  };

	calculateNormalEstimates = () => {
		const { sampleSize } = this.state;
		const sample = norm.slice(0, sampleSize);

		const mean = sample.reduce((acc, val) => acc + val, 0) / sample.length;
		const variance = sample.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (sample.length - 1);
		
		const zValues = {
			'0.9': 1.645,
			'0.95': 1.96,
			'0.99': 2.576
		};
	
		const intervalEstimates = this.calculateEstimates(sample, this.state.percent * 100);
		
		this.setState({
			lambdaMin: intervalEstimates.min,
			lambda: intervalEstimates.lambda,
			lambdaMax: intervalEstimates.max
		});
	};
	
	calculateEstimates = (sample, percent) => {
		const mean = sample.reduce((acc, val) => acc + val, 0) / sample.length;
		const standardError = Math.sqrt(sample.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (sample.length - 1)) / Math.sqrt(sample.length);
		const z = {
			'90': 1.645,
			'95': 1.96,
			'99': 2.576
		}[percent];
	
		const marginOfError = z * standardError;
	
		return {
			min: mean - marginOfError,
			max: mean + marginOfError,
			lambda: mean
		};
	};
	
	normal = () => {
		this.calculateNormalEstimates();
	};

	render(){
		const {title} = getState().app;
		const {select,M,N,n,alpha,beta,arr,renderKey,percent,sampleSize,min,max,lambda} = this.state;
		console.log(min,max,lambda)
		const sortedArr = arr?.slice().sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
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
				<FormItem top={'Процент выборки: '+percent}><Slider
					step={0.05}
					min={0.9}
					max={0.99}
					withTooltip
					value={percent}
					aria-labelledby="basic"
					onChange={(value) => this.setState({percent: Number(value)})}
				/></FormItem>
				<FormItem top='Размер выборки:'><Input
					align='center'
					value={sampleSize}
					onChange={({ target }) => this.setState({sampleSize: target.value==='' ? 0 : parseInt(target.value, 10)})}
				/></FormItem>
				<FormItem><Button rounded stretched onClick={this.calculation}>Рассчёт</Button></FormItem>
				<Separator/>
				<FormItem><Button rounded stretched onClick={this.normal}>Рассчёт Нормального распределения</Button></FormItem>
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
					</div>
				)}
			</Panel>
		);
	}
}

export default Lab2;