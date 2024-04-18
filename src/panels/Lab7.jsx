import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup, Input, Select, Button, Separator, Slider, Textarea } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import { v4 as uuidv4 } from 'uuid';
import { Line, Bar } from 'react-chartjs-2';
import data from '../data/lab7.json'
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

class Lab7 extends Component {
	constructor(props){
		super(props);
		this.state = {
      og: data.og,
      kg: data.kg,
      difference: 0
		};
	};

  renderTable = (dataSet) => {
    const { difference } = this.state;
    let diffs = [];
    let signs = [];

    if (difference === 1) {
        diffs = dataSet.before.map((before, index) => (before - dataSet.after[index]).toFixed(1));
        signs = diffs.map(diff => diff > 0 ? "+" : diff < 0 ? "-" : "0");
    }

    let orderedData = [];
    let groupNumbers = [];
    let ranks = [];
    if (difference === 2) {
        orderedData = [...dataSet.before, ...dataSet.after].sort((a, b) => a - b);
        groupNumbers = orderedData.map(value => dataSet.before.includes(value) ? 1 : 2);
        // Рассчитываем ранги с учетом повторяющихся значений
        let currentRank = 1;
        orderedData.forEach((value, index) => {
            if (index > 0 && value === orderedData[index - 1]) {
                ranks.push(currentRank);
            } else {
                ranks.push(currentRank);
                currentRank++;
            }
        });
        // Расчет средних рангов для повторяющихся значений
        ranks = ranks.map((rank, index, self) => {
            if (index > 0 && orderedData[index] === orderedData[index - 1]) {
                const firstIndex = self.lastIndexOf(rank, index - 1);
                const lastIndex = self.indexOf(rank, index);
                const count = lastIndex - firstIndex + 1;
                const sum = count * rank;
                const averageRank = sum / count;
                for (let i = firstIndex; i <= lastIndex; i++) {
                    self[i] = averageRank;
                }
                return averageRank;
            }
            return rank;
        });
    }

    // Отображение таблицы в соответствии с состоянием difference
    return (
        <table>
            <tbody>
              
            <tr>
                            {["До", ...dataSet.before].map((value, index) => (
                                <td key={index} className="table-cell">{value}</td>
                            ))}
                        </tr>
                        <tr>
                            {["После", ...dataSet.after].map((value, index) => (
                                <td key={index} className="table-cell">{value}</td>
                            ))}
                        </tr>
                        {difference === 1 && (
                            <>
                                <tr>
                                    {["До-После", ...diffs].map((value, index) => {
                                      index==0 ? 
                                        <th key={index} className="table-cell">{value}</th> :
                                        <td key={index} className="table-cell">{diffs[index-1]}</td>
                                    })}
                                </tr>
                                <tr>
                                    {["Знаки", ...signs].map((value, index) => (
                                        <td key={index} className="table-cell">{index === 0 ? value : signs[index-1]}</td>
                                    ))}
                                </tr>
                            </>
                        )}
                {difference === 2 && (
                    <>
                        <tr>
                            <th className="table-cell">Данные в порядке возрастания</th>
                            {orderedData.map((value, index) => (
                                <td key={index} className="table-cell">{value.toFixed(1)}</td>
                            ))}
                        </tr>
                        <tr>
                            <th className="table-cell">№ группы</th>
                            {groupNumbers.map((value, index) => (
                                <td key={index} className="table-cell">{value}</td>
                            ))}
                        </tr>
                        <tr>
                          <th className="table-cell">Ранги для критерия о равенстве дисперсий</th>
                          {ranks.map((value, index) => (
                            <td key={index} className="table-cell">{index === 0 ? value : value}</td>
                          ))}
                        </tr>
                    </>
                )}
        </tbody>
      </table>
    );
  };
  
  signTest = (dataSet) => {
    const diffs = dataSet.before.map((before, index) => before - dataSet.after[index]);
    const positiveCount = diffs.filter(diff => diff > 0).length;
    const negativeCount = diffs.filter(diff => diff < 0).length;
    const n = diffs.length;
    const F = positiveCount - negativeCount; // Разность количества положительных и отрицательных знаков
    const Fcrit = jStat.normal.inv(0.975, 0, 1) * Math.sqrt(n); // Критическое значение для уровня значимости 0.05
  
    let conclusion = '';
    if (Math.abs(F) >= Fcrit) {
      conclusion = `Так как F >= F_крит (${F.toFixed(4)} >= ${Fcrit.toFixed(4)}), то нулевая гипотеза о равенстве средних отвергается.`;
    } else {
      conclusion = `Так как F < F_крит (${F.toFixed(4)} < ${Fcrit.toFixed(4)}), то нулевая гипотеза о равенстве средних принимается.`;
    }
  
    return {
      r: positiveCount,
      l: negativeCount,
      F: F.toFixed(4),
      Fcrit: Fcrit.toFixed(4),
      conclusion
    };
  };
  
  handleFirstTask = () => {
    const ogResult = this.signTest(this.state.og);
    const kgResult = this.signTest(this.state.kg);
    const resultText = `Опытная группа (ОГ):\nr: ${ogResult.r}\nl: ${ogResult.l}\nF: ${ogResult.F}\nF_крит: ${ogResult.Fcrit}\n${ogResult.conclusion}\n\n` +
                       `Контрольная группа (КГ):\nr: ${kgResult.r}\nl: ${kgResult.l}\nF: ${kgResult.F}\nF_крит: ${kgResult.Fcrit}\n${kgResult.conclusion}`;
  
    this.setState({
      result: resultText,
      difference: 1,
      task: "Задание 1\nПрименить критерий знаков:\nа) Опытная группа до и после эксперимента;\nб) Контрольная группа до и после эксперимента."
    });
  };

  calculateWilcoxonRanks = (array1, array2) => {
    const combined = [...array1, ...array2].sort((a, b) => a - b);
    const ranks = combined.map((value, index) => ({ value, rank: index + 1 }));
    return array1.map(value => ranks.find(item => item.value === value).rank);
  };
  
  wilcoxonTest = (dataSet1, dataSet2) => {
    const allValues = [...dataSet1, ...dataSet2];
    const sortedValues = allValues.slice().sort((a, b) => a - b);
    const ranks = sortedValues.map((value, index) => {
      return {
        value,
        rank: index + 1,
        sign: allValues.indexOf(value) < dataSet1.length ? 1 : 2
      };
    });
  
    const sumRanks = ranks.reduce(
      (acc, rank) => {
        if (rank.sign === 1) {
          acc.R1 += rank.rank;
          acc.n1++;
        } else {
          acc.R2 += rank.rank;
          acc.n2++;
        }
        return acc;
      },
      { R1: 0, R2: 0, n1: 0, n2: 0 }
    );
  
    const { R1, R2, n1, n2 } = sumRanks;
    const W1 = R1 - (n1 * (n1 + 1)) / 2;
    const W2 = R2 - (n2 * (n2 + 1)) / 2;
    const W = Math.min(W1, W2);
    const F = Math.abs(W);
    const Fcrit = jStat.normal.inv(0.975, 0, 1) * Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
  
    let conclusion = '';
    if (F <= Fcrit) {
      conclusion = `Так как |F| <= F_крит (${F.toFixed(4)} <= ${Fcrit.toFixed(4)}), то нулевая гипотеза о равенстве средних подтверждается с вероятностью 95%.`;
    } else {
      conclusion = `Так как |F| > F_крит (${F.toFixed(4)} > ${Fcrit.toFixed(4)}), то нулевая гипотеза о равенстве средних отвергается.`;
    }
  
    return {
      R1,
      R2,
      n1,
      n2,
      W1,
      W2,
      W,
      F,
      Fcrit,
      conclusion
    };
  };
  
  handleSecondTask = () => {
    const beforeResults = this.wilcoxonTest(this.state.og.before, this.state.kg.before);
    const afterResults = this.wilcoxonTest(this.state.og.after, this.state.kg.after);
  
    const beforeText = `ДО эксперимента:\nR1: ${beforeResults.R1}\nR2: ${beforeResults.R2}\nn1: ${beforeResults.n1}\nn2: ${beforeResults.n2}\nW1: ${beforeResults.W1}\nW2: ${beforeResults.W2}\nW: ${beforeResults.W}\nF: ${beforeResults.F}\nF_крит: ${beforeResults.Fcrit}\n${beforeResults.conclusion}`;
    const afterText = `\nПОСЛЕ эксперимента:\nR1: ${afterResults.R1}\nR2: ${afterResults.R2}\nn1: ${afterResults.n1}\nn2: ${afterResults.n2}\nW1: ${afterResults.W1}\nW2: ${afterResults.W2}\nW: ${afterResults.W}\nF: ${afterResults.F}\nF_крит: ${afterResults.Fcrit}\n${afterResults.conclusion}`;
  
    this.setState({
      result: beforeText + '\n' + afterText,
      difference: 2,
      task: "Задание 2\nПрименить критерий Вилкоксона:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."
    });
  };
  dispersionAnalysis = (dataSet1, dataSet2) => {
    const n1 = dataSet1.length;
    const n2 = dataSet2.length;
    const nComparison = n1 === n2 ? "n1 = n2" : n1 > n2 ? "n1 > n2" : "n1 < n2";

    // Преобразуем данные в массив разностей
    const differences = dataSet1.map((value, index) => value - dataSet2[index]);

    // Определяем ранги для разностей
    const ranks = differences
        .map((value, index) => ({ value: Math.abs(value), sign: Math.sign(value), index }))
        .sort((a, b) => a.value - b.value)
        .map((item, index) => ({ ...item, rank: index + 1 }))
        .sort((a, b) => a.index - b.index)
        .map(item => item.sign * item.rank);

    // Считаем сумму рангов положительных разностей
    const R = ranks.reduce((acc, rank) => rank > 0 ? acc + rank : acc, 0);

    // Вычисляем статистику Вилкоксона
    const F = R - (n1 * (n1 + 1)) / 2;
    const Fcrit = jStat.normal.inv(0.975, 0, 1) * Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);

    // Формируем вывод
    const isSignificant = Math.abs(F) > Fcrit;
    const conclusion = isSignificant
        ? `F > Fкрит (${Math.abs(F).toFixed(2)} > ${Fcrit.toFixed(2)}), значит, есть статистически значимые различия.`
        : `F <= Fкрит (${Math.abs(F).toFixed(2)} <= ${Fcrit.toFixed(2)}), значит, статистически значимых различий нет.`;

    return { n1, n2, nComparison, R, F: Math.abs(F), Fcrit, conclusion };
};

// Функция обработки клика по кнопке "Задание 3"
handleThirdTask = () => {
    const beforeResults = this.dispersionAnalysis(this.state.og.before, this.state.kg.before);
    const afterResults = this.dispersionAnalysis(this.state.og.after, this.state.kg.after);

    const resultBefore = `ДО эксперимента:\nn1: ${beforeResults.n1},\nn2: ${beforeResults.n2},\n${beforeResults.nComparison},\nR: ${beforeResults.R},\nF: ${beforeResults.F.toFixed(2)},\nFкрит: ${beforeResults.Fcrit.toFixed(2)},\n${beforeResults.conclusion}`;
    const resultAfter = `ПОСЛЕ эксперимента:\nn1: ${afterResults.n1},\nn2: ${afterResults.n2},\n${afterResults.nComparison},\nR: ${afterResults.R},\nF: ${afterResults.F.toFixed(2)},\nFкрит: ${afterResults.Fcrit.toFixed(2)},\n${afterResults.conclusion}`;

    this.setState({ 
        result: `${resultBefore}\n${resultAfter}`,
        difference: 2,
        task: "Задание 3\nНепараметрический критерий для дисперсий:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."
    });
};

	render(){
		const {title} = getState().app;
    const {og,kg,task,result} = this.state;
		return (
			<Panel>
				<PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())}/>}>{title}</PanelHeader>
        <div>
          <FormItem top="ОГ (Основная группа)">
            {this.renderTable(og)}
          </FormItem>
          <FormItem top="КГ (Контрольная группа)">
            {this.renderTable(kg)}
          </FormItem>
        </div>
        <FormLayoutGroup mode="horizontal">
          <FormItem><Button mode="secondary" stretched onClick={this.handleFirstTask}>Задание 1</Button></FormItem>
          <FormItem><Button mode="secondary" stretched onClick={this.handleSecondTask}>Задание 2</Button></FormItem>
          <FormItem><Button mode="secondary" stretched onClick={this.handleThirdTask}>Задание 3</Button></FormItem>
        </FormLayoutGroup>
        {task && <FormItem>
          <Textarea
            disabled
            value={task}
          />
        </FormItem>}
        {result && <FormItem>
          <Textarea
            disabled
            value={result}
            maxHeight={2000}
          />
        </FormItem>}
      </Panel>
		);
	}
}

export default Lab7;