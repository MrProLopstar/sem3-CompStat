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

class Lab5 extends Component {
	constructor(props) {
		super(props);
		this.state = {
            n: 15,
            N: 10,
            P: 0.5,
            lambda: 3,
            select: 0,
			arr: norm.map(x => ({ value: uuidv4(), label: x.toString() }))
		};
	}

  calculateAsymmetryAndKurtosis = (sample) => {
    const mean = jStat.mean(sample);
    const n = sample.length;
    let sumSkewness = 0;
    let sumKurtosis = 0;

    for(let i=0; i<n; i++){
      sumSkewness += Math.pow(sample[i]-mean, 3);
      sumKurtosis += Math.pow(sample[i]-mean, 4);
    }

    const skewness = sumSkewness/(n*Math.pow(jStat.stdev(sample), 3));
    const kurtosis = (sumKurtosis/(n*Math.pow(jStat.stdev(sample), 4)))-3;
    return { skewness, kurtosis };
  };
    
  calculateJarqueBera = (sample) => {
    const { skewness, kurtosis } = this.calculateAsymmetryAndKurtosis(sample);
    const n = sample.length;
    const JB = (n/6)*(Math.pow(skewness, 2) + (Math.pow(kurtosis, 2)/4));
    return { JB, skewness, kurtosis };
  };
    
  handleThirdTask = () => {
    const { arr } = this.state;
    const sample = arr.map(item => parseFloat(item.label));
    const n = sample.length;
    const mean = jStat.mean(sample);
    const stdDeviation = jStat.stdev(sample, true);
    const min = Math.min(...sample);
    const max = Math.max(...sample);
    const range = max - min;
    const numIntervals = Math.ceil(1 + 3.322 * Math.log10(n));
    const intervalWidth = range / numIntervals;
  
    let intervals = [];
    let cumulativeFiBuffer = 0;
    let cumulativeFitBuffer = 0;
    let diffSquaredBuffer = 0;
    let chiSquareSum = 0;
  
    for (let i = 0; i < numIntervals; i++) {
      const lowerBound = min + i * intervalWidth;
      const upperBound = i === numIntervals - 1 ? max : lowerBound + intervalWidth;
      const midpoint = (lowerBound + upperBound) / 2;
      const fi = sample.filter(value => value >= lowerBound && (i === numIntervals - 1 ? value <= upperBound : value < upperBound)).length;
      const Pm = jStat.normal.cdf(upperBound, mean, stdDeviation) - jStat.normal.cdf(lowerBound, mean, stdDeviation);
      const fit = Pm * n;
      const diffSquared = fi > 0 ? Math.pow(fi - fit, 2) / fit : 0;
  
      cumulativeFiBuffer += fi;
      cumulativeFitBuffer += fit;
      diffSquaredBuffer += diffSquared;
  
      if (cumulativeFiBuffer > 5 && cumulativeFitBuffer > 5) {
        chiSquareSum += diffSquaredBuffer;
        intervals.push({
          lowerBound,
          upperBound,
          midpoint,
          fi,
          Pm,
          fit,
          cumulativeFi: cumulativeFiBuffer,
          cumulativeFit: cumulativeFitBuffer,
          diffSquared: diffSquaredBuffer
        });
        cumulativeFiBuffer = 0;
        cumulativeFitBuffer = 0;
        diffSquaredBuffer = 0;
      } else if (i === numIntervals - 1) {  
        intervals.push({
          lowerBound,
          upperBound,
          midpoint,
          fi,
          Pm,
          fit,
          cumulativeFi: cumulativeFiBuffer,
          cumulativeFit: cumulativeFitBuffer,
          diffSquared: diffSquaredBuffer
        });
      } else {
        intervals.push({
          lowerBound,
          upperBound,
          midpoint,
          fi,
          Pm,
          fit,
          cumulativeFi: null,
          cumulativeFit: null,
          diffSquared: null
        });
      }
    }
    
    const degreesOfFreedom = intervals.filter(interval => interval.cumulativeFi != null).length - 1;
    const chiSquareCritical = jStat.chisquare.inv(1 - 0.05, degreesOfFreedom);
    const hypothesisAccepted = chiSquareSum < chiSquareCritical;
  
    this.setState({
      intervals: intervals,
      chiSquare: chiSquareSum,
      chiSquareCritical: chiSquareCritical,
      hypothesisAccepted: hypothesisAccepted,
      answer: `Значение критерия хи-квадрат: ${chiSquareSum.toFixed(4)}\n` +
              `Критическое значение хи-квадрат: ${chiSquareCritical.toFixed(4)}\n` +
              `Гипотеза о соответствии распределения нормальному: ${hypothesisAccepted ? 'принимается' : 'не принимается'}`  
    });
  };

  renderFrequencyTable = (intervals) => {
    return (
      <table>
        <thead>
          <tr>
            <th className="table-cell">Нижняя граница</th>
            <th className="table-cell">Верхняя граница</th>
            <th className="table-cell">Середина</th>
            <th className="table-cell">Опытные частоты</th>
            <th className="table-cell">Вероятность попадания в интервал</th>
            <th className="table-cell">Теоретические частоты</th>
            <th className="table-cell">Сложенные опытные частоты</th>
            <th className="table-cell">Сложенные теоретические частоты</th>
            <th className="table-cell">(nk - n*pk)^2/n*pk</th>
          </tr>
        </thead>
        <tbody>
          {intervals.map((interval, index) => (
            <tr key={index}>
              <td className="table-cell">{interval.lowerBound.toFixed(2)}</td>
              <td className="table-cell">{interval.upperBound.toFixed(2)}</td>
              <td className="table-cell">{interval.midpoint.toFixed(2)}</td>
              <td className="table-cell">{interval.fi}</td>
              <td className="table-cell">{(interval.Pm * 100).toFixed(2)}%</td>
              <td className="table-cell">{interval.fit.toFixed(2)}</td>
              <td className="table-cell">{interval.cumulativeFi ? interval.cumulativeFi.toFixed(2) : ''}</td>
              <td className="table-cell">{interval.cumulativeFit ? interval.cumulativeFit.toFixed(2) : ''}</td>
              <td className="table-cell">{interval.diffSquared ? interval.diffSquared.toFixed(4) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
      
  renderFrequencyChart = (intervals) => {
    const labels = intervals.map(interval => 
      `${interval.lowerBound.toFixed(2)}-${interval.upperBound.toFixed(2)}`
    );
  
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Опытные частоты (f_i)',
          data: intervals.map(interval => interval.fi),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Теоретические частоты (f_i^t)',
          data: intervals.map(interval => interval.fit),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ],
    };
  
    return <Bar data={chartData} height={100}/>;
  }

  generateBinomialSample = (n, p, size) => {
    let sample = [];
    for(let i=0; i<size; i++){
      let success = 0;
      for(let j=0; j<n; j++) if(Math.random()<p) success++;
      sample.push(success);
    }
    return sample;
  };
      
  generatePoissonSample = (lambda, size) => {
    let sample = [];
    for(let i=0; i<size; i++){
      let L = Math.exp(-lambda), k = 0, p = 1;
      do {
        k++;
        p *= Math.random();
      } while(p>L);
      sample.push(k-1);
    }
    return sample;
  };

  calculateExpectedFrequenciesBinomial = (n, p, sample) => {
    const maxK = Math.max(...sample);
    let expectedFrequencies = [];
    for(let k=0; k<=maxK; k++) expectedFrequencies.push(jStat.binomial.pdf(k, n, p)*sample.length);
    return expectedFrequencies;
  };
  calculateExpectedFrequenciesPoisson = (lambda, sample) => {
    const maxK = Math.max(...sample);
    let expectedFrequencies = [];
    for(let k=0; k<=maxK; k++) expectedFrequencies.push(jStat.poisson.pdf(k, lambda)*sample.length);
    return expectedFrequencies;
  };
    
  calculateChiSquare = (observed, expected) => {
    let chiSq = 0;
    for(let i=0; i<observed.length; i++) if(expected[i]!==0) chiSq += Math.pow(observed[i] - expected[i], 2) / expected[i];
    return chiSq;
  };
  handleSecondTask = () => {
    const { n, P, lambda, select, N } = this.state;
    let sample, expectedFrequencies = [], observedFrequencies = {};
    
    if(select===0) sample = this.generateBinomialSample(N, P, n);
    else sample = this.generatePoissonSample(lambda, n);
    sample.forEach(value => {
      observedFrequencies[value] = (observedFrequencies[value] || 0) + 1;
    });

    const maxK = Math.max(...sample);
    for(let k=0; k<=maxK; k++){
      const probability = select===0 ? jStat.binomial.pdf(k, N, P) : jStat.poisson.pdf(k, lambda);
      expectedFrequencies[k] = probability*n;
    }

    const observedFrequenciesArray = new Array(maxK + 1).fill(0);
    for(const [value, frequency] of Object.entries(observedFrequencies)) observedFrequenciesArray[parseInt(value)] = frequency;

    let chiSquare = this.calculateChiSquare(observedFrequenciesArray, expectedFrequencies);

    const degreesOfFreedom = maxK - (select === 0 ? 2 : 1);
    const chiSquareCritical = jStat.chisquare.inv(1-0.05, degreesOfFreedom);
    const isHypothesisAccepted = chiSquare < chiSquareCritical;
    let intervals = [];
    let cumulativeFi = 0;
    let cumulativeFit = 0;
    let cumulativeDiffSquared = 0;
    let chiSquareSum = 0;

    observedFrequenciesArray.forEach((fi, i) => {
      const fit = expectedFrequencies[i];
      const diffSquared = fi > 0 ? Math.pow(fi - fit, 2) / fit : 0;
  
      cumulativeFi += fi;
      cumulativeFit += fit;
      cumulativeDiffSquared += diffSquared;
  
      if(cumulativeFi<5 || cumulativeFit<5){
        intervals.push({
          lowerBound: i,
          upperBound: i + 1,
          midpoint: i + 0.5,
          fi,
          Pm: fit / n, 
          fit,
          cumulativeFi: null,
          cumulativeFit: null,
          diffSquared: null
        });
      } else {
        
        chiSquareSum += cumulativeDiffSquared;
        intervals.push({
          lowerBound: i,
          upperBound: i + 1,
          midpoint: i + 0.5,
          fi,
          Pm: fit / n, 
          fit,
          cumulativeFi,
          cumulativeFit,
          diffSquared: cumulativeDiffSquared
        });
  
        
        cumulativeFi = 0;
        cumulativeFit = 0;
        cumulativeDiffSquared = 0;
      }
    });
  
    
    if (cumulativeFi > 0 || cumulativeFit > 0) {
      let lastNonEmptyIntervalIndex = intervals.length - 1;
      while (lastNonEmptyIntervalIndex >= 0 && intervals[lastNonEmptyIntervalIndex].cumulativeFi === null) {
        lastNonEmptyIntervalIndex--;
      }
      if (lastNonEmptyIntervalIndex >= 0) {
        intervals[lastNonEmptyIntervalIndex].cumulativeFi += cumulativeFi;
        intervals[lastNonEmptyIntervalIndex].cumulativeFit += cumulativeFit;
        intervals[lastNonEmptyIntervalIndex].diffSquared += cumulativeDiffSquared;
        chiSquareSum += cumulativeDiffSquared;
      }
    }

    this.setState({
      intervals: null,
      inter: intervals,
      renderKey: Math.random(),
      sample: sample.map(value => ({ value: uuidv4(), label: value.toString() })),
      chiSquare,
      chiSquareCritical,
      isHypothesisAccepted,
      observedFrequencies: observedFrequenciesArray,
      expectedFrequencies,
      chartData: this.createChartData(observedFrequenciesArray, expectedFrequencies),
      answer: `Задание 2. Проверить сгенерированную выборку и генеральную совокупность на биномиальное распределение\n` +
              `Результаты вычислений:\n` +
              `Хи-квадрат статистика: ${chiSquare.toFixed(2)}\n` +
              `Критическое значение Хи-квадрат: ${chiSquareCritical.toFixed(2)}\n` +
              `Гипотеза о соответствии распределению: ${isHypothesisAccepted ? 'Принята' : 'Отклонена'}`
    });
  };
    
  handleFirstTask = () => {
    const { arr } = this.state;
    const sample = arr.map(item => parseFloat(item.label));
    const { JB, skewness, kurtosis } = this.calculateJarqueBera(sample);
    const chiSquareQuantile = jStat.chisquare.inv(1-0.05, 2);

    let answer = `Задание 1. С помощью критерия Харке - Бера проверить свою выборку на нормальное распределение генеральной совокупности. \n` +
                  `Выборочная асимметрия Sk = ${skewness.toFixed(4)}\n` +
                  `Выборочный эксцесс Kur = ${kurtosis.toFixed(4)}\n` +
                  `Значение выборочной статистики JB = ${JB.toFixed(4)}\n` +
                  `Квантиль χ² (1-α)(2) = ${chiSquareQuantile.toFixed(4)} при α = 0.05\n`;
    if(JB<chiSquareQuantile) answer += `Нулевая гипотеза о нормальном распределении принимается, т.к. JB < χ² (1-α)(2)`;
    else answer += `Нулевая гипотеза о нормальном распределении НЕ принимается, т.к. JB >= χ² (1-α)(2)`;

    this.setState({ answer, intervals: null, chartData: null });
  };

  createChartData = (observedFrequencies, expectedFrequencies) => {
    const labels = observedFrequencies.map((_, index) => `Интервал ${index+1}`);
    return {
      labels: labels,
      datasets: [
        {
          label: 'Опытные частоты',
          data: observedFrequencies,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Теоретические частоты',
          data: expectedFrequencies,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
  };

	render(){
		const {title} = getState().app;
		const {arr,renderKey,answer,intervals,select,inter,chiSquare, chiSquareCritical, isHypothesisAccepted, chartData,n,N,P,lambda,sample} = this.state;
		const sortedArr = arr?.slice().sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
    const titles = ['Биномиальный закон', 'Распределение Пуассона'];
		return (
			<Panel>
				<PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())}/>}>{title}</PanelHeader>
				{arr && (
					<div>
						<FormItem top='Изначальный массив'>
							<ChipsInput
								disabled
								value={arr}
								key={renderKey}
								
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
        <FormLayoutGroup mode="horizontal">
            <FormItem><Button mode="secondary" stretched onClick={this.handleFirstTask}>Задание 1</Button></FormItem>
            <FormItem><Button mode="secondary" stretched onClick={this.handleSecondTask}>Задание 2</Button></FormItem>
            <FormItem><Button mode="secondary" stretched onClick={this.handleThirdTask}>Задание 3</Button></FormItem>
        </FormLayoutGroup>
        <FormItem top="Для 2 задания">
            <FormLayoutGroup mode="horizontal" segmented>
            <FormItem top="Выберите распределение:">
                <Select
                    value={select}
                    options={titles.map((i,index) => ({
                        label: i,
                        value: index,
                    }))}
                    onChange={({target}) => this.setState({select: target.value==='' ? 0 : parseInt(target.value, 10)})}
                />
            </FormItem>
            <FormItem top="n:">
                <Input
                    type="number"
                    value={n}
                    onChange={({ target }) => this.setState({ n: target.value })}
                />
            </FormItem>
            {select===0 ? (
                <>
                <FormItem top="N (число испытаний):">
                    <Input
                    type="number"
                    value={N}
                    onChange={({ target }) => this.setState({ N: target.value })}
                    />
                </FormItem>
                <FormItem top="P (вероятность успеха):">
                    <Input
                    type="number"
                    value={P}
                    onChange={({ target }) => this.setState({ P: target.value })}
                    />
                </FormItem>
                </>
            ) : (
                <>
                <FormItem top="λ (среднее количество событий):">
                    <Input
                    type="number"
                    value={lambda}
                    onChange={({ target }) => this.setState({ lambda: target.value })}
                    />
                </FormItem>
                </>
            )}
            </FormLayoutGroup>
        </FormItem>
        {answer && <FormItem top='Результат'>
            <Textarea
                disabled
                value={answer}
                key={renderKey}
            />
        </FormItem>}
        {intervals && this.renderFrequencyTable(intervals)}
        {intervals && this.renderFrequencyChart(intervals)}
        {chartData && (
        <div>
            <FormItem top='Вариационный ряд'>
            <ChipsInput
              disabled
              value={sample.slice().sort((a, b) => parseFloat(a.label) - parseFloat(b.label))}
              key={renderKey}
            />
            </FormItem>
            {this.renderFrequencyTable(inter)}
            <div className='chart-container'>
                <Bar
                    data={chartData}
                    options={{
                        title: {
                        display: true,
                        text: 'График распределения частот',
                        fontSize: 20,
                        },
                        legend: {
                        display: true,
                        position: 'top',
                        },
                    }}
                />
            </div>
        </div>
        )}
			</Panel>
		);
	}
}

export default Lab5;