import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup, Input, Select, Button, Separator, Slider, Textarea } from '@vkontakte/vkui';
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
			lambda: 10,
			//
			alpha: 10,
			beta: 0.6,
			//
			percent: 0.9,
			sampleSize: 20,
			//
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

	PoissonKnuth = (lambda) => {
		let L = Math.exp(-lambda);
		let k = 0;
		let p = 1;
		do {
			k = k + 1;
			let u = Math.random();
			p *= u;
		} while(p>L);
		return k - 1;
	};
	generatePoissonSample = (lambda, sampleSize) => {
		let sample = [];
		for (let i = 0; i < sampleSize; i++) sample.push(this.PoissonKnuth(lambda));
		return sample;
	};
	  
	calculatePoissonEstimates = (sample,percent) => {
		const mean = sample.reduce((acc, val) => acc + val, 0) / sample.length;
		const variance = sample.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (sample.length - 1);
		const standardError = Math.sqrt(variance) / Math.sqrt(sample.length);
		
		const z = {
			'0.9': 1.645,
			'0.95': 1.96,
			'0.99': 2.576
		}[percent.toString()];
		const marginOfError = z * standardError;
		
		return {
			lambd: mean,
			lambdaConfidenceInterval: [mean - marginOfError, mean + marginOfError]
		};
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
		const { select, lambda, alpha, beta, sampleSize, percent } = this.state;
		let sample = [], estimates = {}, answer = '';
		
		if(select===0){
			if(lambda<=0) return alert('Параметр λ должен быть больше нуля.');
			sample = this.generatePoissonSample(lambda, sampleSize);
			estimates = this.calculatePoissonEstimates(sample,percent);
			answer = `Точечное значение c вероятность ${(percent*100).toFixed(0)}% λ*=${estimates.lambd}\n${estimates.lambdaConfidenceInterval[0].toFixed(4)} ≤ λ* ≤ ${estimates.lambdaConfidenceInterval[1].toFixed(4)}`;
		} else if (select === 1) {
			if (alpha <= 0 || beta <= 0) return alert('Параметры α и β должны быть больше нуля.');
			sample = this.generateBetaSample(alpha, beta, sampleSize);
			estimates = this.calculateBetaEstimates(sample, percent);
			answer = `Точечная оценка параметра α: ${estimates.alpha.toFixed(4)}, ` +
					 `Точечная оценка параметра β: ${estimates.beta.toFixed(4)}\n` +
					 `Доверительный интервал для α: [${estimates.alphaConfidenceInterval[0].toFixed(4)}, ${estimates.alphaConfidenceInterval[1].toFixed(4)}], ` +
					 `Доверительный интервал для β: [${estimates.betaConfidenceInterval[0].toFixed(4)}, ${estimates.betaConfidenceInterval[1].toFixed(4)}]`;
		}
		this.setState({
			arr: sample.map(value => ({ value: uuidv4(), label: this.resizeLength(value, 4) })),
			renderKey: Math.random(),
			answer,
			...estimates
		});
	};

	calculateBetaEstimates = (sample, percent) => {
		const mean = jStat.mean(sample);
		const variance = jStat.variance(sample);
		
		const alphaHat = mean*((mean*(1-mean))/variance-1);
		const betaHat = (1-mean)*((mean*(1-mean))/variance-1);
	  
		const sampleSize = sample.length;
		const standardError = Math.sqrt(alphaHat*betaHat/((alphaHat+betaHat)**2*(alphaHat+betaHat+1)/sampleSize));
	  
		const z = jStat.normal.inv(1-percent/2, 0, 1);
		const alphaInterval = [
		  alphaHat - z * standardError,
		  alphaHat + z * standardError
		];
		const betaInterval = [
		  betaHat - z * standardError,
		  betaHat + z * standardError
		];
		
		return {
		  alpha: alphaHat,
		  beta: betaHat,
		  alphaConfidenceInterval: alphaInterval,
		  betaConfidenceInterval: betaInterval
		};
	  };

	  calculateNormalParameters = (sample) => {
		const mean = jStat.mean(sample);
		const variance = jStat.variance(sample);
		const stdDeviation = Math.sqrt(variance);
		return { mean, variance, stdDeviation };
	  };

	  analyzeNormalDistribution = () => {
		const { percent } = this.state;
		const sample = norm;
		const { mean, variance, stdDeviation } = this.calculateNormalParameters(sample);
		const confidenceLevel = percent;
		const zValue = jStat.normal.inv(1-(1-confidenceLevel)/2, 0, 1);
		const marginOfError = zValue*(stdDeviation/Math.sqrt(sample.length));
		const confidenceInterval = [mean - marginOfError, mean + marginOfError];
	  
		const answer = `Среднее значение показателя динамометрии кисти: ${mean.toFixed(3)} кг/масса тела.\n` +
					   `С вероятностью alpha = ${(confidenceLevel * 100).toFixed(0)}% данный показатель находится в пределах ${confidenceInterval[0].toFixed(3)} < показатель < ${confidenceInterval[1].toFixed(3)}.\n` +
					   `Среднее квадратическое отклонение составляет ${stdDeviation.toFixed(3)}.\n` +
					   `С вероятностью alpha = ${(confidenceLevel * 100).toFixed(0)}% среднее квадратическое отклонение находится в пределах ${confidenceInterval[0].toFixed(3)} < σ < ${confidenceInterval[1].toFixed(3)}.\n` +
					   `Дисперсия показателя составляет D=${variance.toFixed(3)}.`;
	  
		this.setState({
		  arr: sample.map(value => ({ value: uuidv4(), label: value.toFixed(3) })),
		  renderKey: Math.random(),
		  answer
		});
	  };

	render(){
		const {title} = getState().app;
		const {select,lambda,alpha,beta,arr,renderKey,percent,sampleSize,answer} = this.state;
		const sortedArr = arr?.slice().sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
		const titles = ['Распределение Пуассона','Бета закон'];
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
							<FormItem top='λ:'>
								<Input
									value={lambda}
									onChange={({ target }) => this.setState({lambda: target.value==='' ? 0 : parseInt(target.value, 10)})}
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
				<FormItem><Button rounded stretched onClick={this.analyzeNormalDistribution}>Рассчёт Нормального распределения</Button></FormItem>
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
				  		<FormItem top='Результат'>
							<Textarea
								disabled
								value={answer}
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