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
import { exp } from 'mathjs';

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
    
        this.setState({ answer, intervals: null });
      };

      handleThirdTask = () => {
        const { arr } = this.state; // Предполагается, что arr содержит выборку данных
        const sample = arr.map(item => parseFloat(item.label));
        const n = sample.length; // размер выборки
        const min = jStat.min(sample);
        const max = jStat.max(sample);
        const range = max - min; // размах выборки
        const l = Math.ceil(1 + 3.322 * Math.log10(n)); // число интервалов
        const h = range / l; // ширина интервала
    
        // Расчет границ интервалов и частот
        let intervals = [];
        for (let i = 0; i < l; i++) {
          const start = min + i * h;
          const end = i === l - 1 ? max : start + h;
          const count = sample.filter(x => (i === 0 ? x >= start && x < end : x > start && x <= end)).length;
          intervals.push({ start, end, count });
        }
    
        // Расчет теоретических частот и критерия хи-квадрат
        const mean = jStat.mean(sample);
        const stdDeviation = jStat.stdev(sample, true);
        let chiSquare = 0;
        intervals.forEach(interval => {
          const z1 = (interval.start - mean) / stdDeviation;
          const z2 = (interval.end - mean) / stdDeviation;
          const p = jStat.normal.cdf(z2, 0, 1) - jStat.normal.cdf(z1, 0, 1);
          const expected = n * p;
          const chi = Math.pow(interval.count - expected, 2) / expected;
          chiSquare += chi;
    
          interval.expected = expected;
          interval.chi = chi;
        });
    
        // Сравнение с критическим значением хи-квадрат распределения
        const chiSquareCritical = jStat.chisquare.inv(1 - 0.05, l - 1);
        const hypothesisAccepted = chiSquare < chiSquareCritical;
    
        // Составление ответа
        let answer = `Задание 3. С помощью критерия хи-квадрат проверить свою выборку на нормальное распределение генеральной совокупности.\n` +
                     `Значение критерия хи-квадрат: ${chiSquare.toFixed(4)}\n` +
                     `Критическое значение хи-квадрат: ${chiSquareCritical.toFixed(4)}\n` +
                     `Гипотеза о соответствии распределения нормальному: ${hypothesisAccepted ? 'принимается' : 'не принимается'}`;
    
        this.setState({ answer, intervals });
      };

      renderFrequencyTable = (intervals) => {
        return (
          <table>
            <thead>
              <tr>
                <th className="table-cell">Нижняя граница</th>
                <th className="table-cell">Верхняя граница</th>
                <th className="table-cell">Опытные частоты</th>
                <th className="table-cell">Вероятность попадания в интервал</th>
                <th className="table-cell">Теоретические частоты</th>
              </tr>
            </thead>
            <tbody>
              {intervals.map((interval, index) => (
                <tr key={index}>
                  <td className="table-cell">{interval.start.toFixed(2)}</td>
                  <td className="table-cell">{interval.end.toFixed(2)}</td>
                  <td className="table-cell">{interval.count}</td>
                  <td className="table-cell">{((interval.count / this.state.arr.length) * 100).toFixed(2)}%</td>
                  <td className="table-cell">{interval.expected.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      
      // Метод для рендеринга графика частот
      renderFrequencyChart = (intervals) => {
        const chartData = {
          labels: intervals.map(interval => `${interval.start.toFixed(2)}-${interval.end.toFixed(2)}`),
          datasets: [
            {
              label: 'Опытные частоты',
              data: intervals.map(interval => interval.count),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
            {
              label: 'Теоретические частоты',
              data: intervals.map(interval => interval.expected),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            }
          ],
        };
      
        return <Bar data={chartData} height={100}/>;
      }

      binomialProbability = (n, p, k) => {
        return jStat.binomial.pdf(k, n, p);
      };
    
      // Функция для вычисления вероятности распределения Пуассона
      poissonProbability = (lambda, k) => {
        return jStat.poisson.pdf(k, lambda);
      };
    
      // Функция для расчёта хи-квадрат статистики
      calculateChiSquare = (observed, expected) => {
        let chiSq = 0;
        for (let i = 0; i < observed.length; i++) {
            if (expected[i] !== 0) { // Проверяем, что ожидаемая частота не равна нулю
                chiSq += Math.pow(observed[i] - expected[i], 2) / expected[i];
            }
        }
        return chiSq;
    };
    
      // Обработчик для выполнения второго задания
      handleSecondTask = () => {
        const { arr, N, P, lambda, select } = this.state;
        // Определение уникальных значений и их частот в выборке
        const valueCounts = arr.reduce((counts, item) => {
            counts[item.label] = (counts[item.label] || 0) + 1;
            return counts;
        }, {});
    
        // Преобразование объекта частот в массив для дальнейшего анализа
        const sampleValues = Object.keys(valueCounts).map(value => parseInt(value));
        const sampleFrequencies = Object.values(valueCounts);
    
        // Вычисление теоретических вероятностей для каждого уникального значения выборки
        let expectedFrequencies = sampleValues.map(k => {
            const prob = select === 0 ? this.binomialProbability(N, P, k) : this.poissonProbability(lambda, k);
            return prob * arr.length; // arr.length - общее количество элементов в выборке
        });
    
        // Расчёт хи-квадрат статистики
        let chiSquare = this.calculateChiSquare(sampleFrequencies, expectedFrequencies);
    
        // Сравнение с критическим значением
        const degreesOfFreedom = sampleValues.length - (select === 0 ? 3 : 2); // -1 за каждый оцененный параметр
        const chiSquareCritical = jStat.chisquare.inv(1 - 0.05, degreesOfFreedom);
        const isHypothesisAccepted = chiSquare < chiSquareCritical;
    
        // Обновление состояния компонента
        this.setState({
            chiSquare,
            chiSquareCritical,
            isHypothesisAccepted
            // Обновление состояния для графика и таблицы
        }, () => {
            // После обновления состояния вызываем createChartData для создания данных для графика
            this.createChartData(sampleValues, sampleFrequencies, expectedFrequencies);
        });
    };
    
    createChartData = (sampleValues, sampleFrequencies, expectedFrequencies) => {
        const data = {
            labels: sampleValues,
            datasets: [
                {
                    label: 'Опытные частоты',
                    data: sampleFrequencies,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
                {
                    label: 'Теоретические частоты',
                    data: expectedFrequencies,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                },
            ],
        };
        this.setState({ chartData: data });
    };

	render(){
		const {title} = getState().app;
		const {arr,renderKey,answer,intervals,select,chiSquare, chiSquareCritical, isHypothesisAccepted, chartData,n,N,P,lambda} = this.state;
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
                    <div className='result-table'>
                        <h4>Результаты вычислений:</h4>
                        <table>
                            <tbody>
                            <tr>
                                <td>Хи-квадрат статистика:</td>
                                <td>{chiSquare.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Критическое значение Хи-квадрат:</td>
                                <td>{chiSquareCritical.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Гипотеза о соответствии распределению:</td>
                                <td>{isHypothesisAccepted ? 'Принята' : 'Отклонена'}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
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

export default Lab2;