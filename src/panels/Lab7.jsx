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
  
  calculateRanksWilcoxon = (orderedData) => {
    const ranks = orderedData.map((_, index) => index+1);
    for(let i=0; i<orderedData.length; i++){
      if(i>0 && orderedData[i]===orderedData[i-1]){
        const start = i;
        while(i<orderedData.length && orderedData[i]===orderedData[start]) i++;
        const end = i-1;
        const averageRank = (ranks[start]+ranks[end])/2;
        for(let j=start; j<=end; j++) ranks[j] = averageRank;
      }
    }
    return ranks;
  };

  calculateRanksDispersion = (orderedData) => {
    let ranks = new Array(orderedData.length).fill(0);
    let left = 0;
    let right = ranks.length-1;
    let rank = 1;

    while(left<=right){
      if(rank%2!==0) ranks[left++] = rank;
      else ranks[right--] = rank;
      rank++;
    }

    for(let i=0; i<orderedData.length; i++){
      if(i>0 && orderedData[i]===orderedData[i-1]){
        const start = i;
        while(i<orderedData.length && orderedData[i]===orderedData[start]) i++;
        const end = i-1;
        const averageRank = (ranks[start] + ranks[end]) / 2;
        for(let j=start; j<=end; j++) ranks[j] = averageRank;
      }
    }

    return ranks;
  };

  renderTable = (dataSet, dataSet1, before) => {
    const { difference } = this.state;
    let diffs = [];
    let signs = [];
    if(difference===1){
      diffs = dataSet.before.map((before, index) => (before - dataSet.after[index]).toFixed(1));
      signs = diffs.map(diff => diff>0 ? "+" : diff<0 ? "-" : "");
    }

    let orderedData = [];
    let groupNumbers = [];
    let ranks = [];
    if(difference===2){
      orderedData = [...dataSet.before, ...dataSet.after];
      orderedData.sort((a, b) => a-b);
      groupNumbers = orderedData.map(value => dataSet.before.includes(value) ? 1 : 2);
      ranks = this.calculateRanksWilcoxon(orderedData);
    } else if(difference===3){
      orderedData = [...dataSet.before, ...dataSet.after];
      orderedData.sort((a, b) => a-b);
      groupNumbers = orderedData.map(value => dataSet.before.includes(value) ? 1 : 2);
      ranks = this.calculateRanksDispersion(orderedData);
    }

    if(difference===2 || difference===3){
      const rankMap = {};
      orderedData.forEach((value, index) => {
          if(!rankMap[value]) rankMap[value] = {sumRanks: 0, count: 0};
          rankMap[value].sumRanks += ranks[index];
          rankMap[value].count += 1;
      });
      ranks = orderedData.map(value => rankMap[value].sumRanks/rankMap[value].count);
    }

    return (
        <table>
            <tbody>
                {(difference===0 || difference===1) ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <tr>
                            {["ОГ " + (before ? "До" : "После"), ...(before ? dataSet.before : dataSet.after)].map((value, index) => (
                                <td key={index} className="table-cell">{value}</td>
                            ))}
                        </tr>
                        <tr>
                            {["КГ " + (before ? "До" : "После"), ...(before ? dataSet1.before : dataSet1.after)].map((value, index) => (
                                <td key={index} className="table-cell">{value}</td>
                            ))}
                        </tr>
                    </>
                )}
                {difference===1 && (
                    <>
                        <tr>
                            <th className="table-cell">До-После</th>
                            {diffs.map((diff, index) => (
                                <td key={index} className="table-cell">{diff}</td>
                            ))}
                        </tr>
                        <tr>
                            <th className="table-cell">Знаки</th>
                            {signs.map((sign, index) => (
                                <td key={index} className="table-cell">{sign}</td>
                            ))}
                        </tr>
                    </>
                )}
                {(difference===2 || difference===3) && (
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
                            <th className="table-cell">{difference == 2 ? "Ранги для критерия Вилкоксона" : "Ранги для критерия о равенстве дисперсий"}</th>
                            {ranks.map((value, index) => (
                              <td key={index} className="table-cell">{value}</td>
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
    const F = positiveCount - negativeCount;
    const Fcrit = jStat.normal.inv(0.975, 0, 1) * Math.sqrt(n);
  
    let conclusion = '';
    if (Math.abs(F) >= Fcrit) conclusion = `По результатам измерений длины желчного пузыря на УЗИ внутренних органов обнаружено, что значение F (${F.toFixed(4)}) превышает критическое значение Fкрит (${Fcrit.toFixed(4)}). Это означает, что существует статистически значимое различие в средних значениях до и после эксперимента, и, следовательно, нулевая гипотеза о равенстве средних отвергается.`;
    else conclusion = `По результатам измерений длины желчного пузыря на УЗИ внутренних органов обнаружено, что значение F (${F.toFixed(4)}) не превышает критическое значение Fкрит (${Fcrit.toFixed(4)}). Это означает, что статистически значимого различия в средних значениях до и после эксперимента не обнаружено, и, следовательно, нулевая гипотеза о равенстве средних принимается.`;
      
    return {
      r: Math.max(positiveCount, negativeCount),
      l: positiveCount+negativeCount,
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
  
  wilcoxonTest = (dataSet1, dataSet2, after) => {
    const allValues = [...dataSet1, ...dataSet2];
    const sortedValues = allValues.slice().sort((a, b) => a - b);
    const ranks = sortedValues.map((value, index) => {
      return {
        value,
        rank: index + 1,
        sign: allValues.indexOf(value) < dataSet1.length ? 1 : 2
      };
    });
  
    const sumRanks = ranks.reduce((acc, rank) => {
        if(rank.sign===1){
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

    const numerator = W - 0.5 * n1 * n2;
    const denominator = Math.sqrt(1.0 / 12.0 * n1 * n2 * (n1 + n2 + 1.0));
    const F = Math.abs(Math.round(numerator / denominator * 1000) / 1000);

    const alpha = 0.05;
    const Fcrit = Math.round(jStat.normal.inv(1 - alpha / 2, 0, 1) * 1000) / 1000;
  
    let conclusion = '';
    if(Math.abs(F)<=Fcrit) conclusion = `Так как |F| <= F_крит (${F.toFixed(4)} <= ${Fcrit.toFixed(4)}), то с вероятностью 95% нулевая гипотеза о равенстве средних значений длины желчного пузыря на УЗИ внутренних органов в опытной контрольной группе ${after ? "после" : "до"} воздействия подтверждается.`;
    else conclusion = `Так как |F| > F_крит (${F.toFixed(4)} > ${Fcrit.toFixed(4)}), то с вероятностью 95% нулевая гипотеза о равенстве средних значений длины желчного пузыря на УЗИ внутренних органов в опытной контрольной группе ${after ? "после" : "до"} воздействия отвергается.`;
  
    return {
      R1, R2,
      n1, n2,
      W1, W2,
      W,
      F,
      Fcrit,
      conclusion
    };
  };
  
  handleSecondTask = () => {
    const beforeResults = this.wilcoxonTest(this.state.og.before, this.state.kg.before, false);
    const afterResults = this.wilcoxonTest(this.state.og.after, this.state.kg.after, true);
  
    const beforeText = `ДО эксперимента:\nR1: ${beforeResults.R1}\nR2: ${beforeResults.R2}\nn1: ${beforeResults.n1}\nn2: ${beforeResults.n2}\nW1: ${beforeResults.W1}\nW2: ${beforeResults.W2}\nW: ${beforeResults.W}\nF: ${beforeResults.F}\nF_крит: ${beforeResults.Fcrit}\n${beforeResults.conclusion}`;
    const afterText = `\nПОСЛЕ эксперимента:\nR1: ${afterResults.R1}\nR2: ${afterResults.R2}\nn1: ${afterResults.n1}\nn2: ${afterResults.n2}\nW1: ${afterResults.W1}\nW2: ${afterResults.W2}\nW: ${afterResults.W}\nF: ${afterResults.F}\nF_крит: ${afterResults.Fcrit}\n${afterResults.conclusion}`;
  
    this.setState({
      result: beforeText + '\n' + afterText,
      difference: 2,
      task: "Задание 2\nПрименить критерий Вилкоксона:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."
    });
  };

  dispersionAnalysis = (dataSet1, dataSet2, after) => {
    const n1 = dataSet1.length;
    const n2 = dataSet2.length;
    const nComparison = n1 === n2 ? "n1 = n2" : n1 > n2 ? "n1 > n2" : "n1 < n2";
    const differences = dataSet1.map((value, index) => value - dataSet2[index]);

    const ranks = differences
      .map((value, index) => ({ value: Math.abs(value), sign: Math.sign(value), index }))
      .sort((a, b) => a.value - b.value)
      .map((item, index) => ({ ...item, rank: index+1 }))
      .sort((a, b) => a.index - b.index)
      .map(item => item.sign * item.rank);

    const R = ranks.reduce((acc, rank) => rank > 0 ? acc + rank : acc, 0);

    const meanR = n1 * (n1 + 1) / 4;
    const stdR = Math.sqrt(n1 * (n1 + 1) * (2 * n1 + 1) / 24);
    const F = (R - meanR) / stdR;

    const alpha = 0.05;
    const Fcrit = Math.round(jStat.normal.inv(1 - alpha / 2, 0, 1) * 1000) / 1000;
      
    let conclusion = '';
    if(Math.abs(F)<=Fcrit) conclusion = `Так как |F| <= F_крит (${F.toFixed(4)} <= ${Fcrit.toFixed(4)}), то с вероятностью 95% нулевая гипотеза о равенстве дисперсий длины желчного пузыря на УЗИ внутренних органов в опытной контрольной группе ${after ? "после" : "до"} воздействия подтверждается.`;
    else conclusion = `Так как |F| > F_крит (${F.toFixed(4)} > ${Fcrit.toFixed(4)}), то с вероятностью 95% нулевая гипотеза о равенстве дисперсий длины желчного пузыря на УЗИ внутренних органов в опытной контрольной группе ${after ? "после" : "до"} воздействия отвергается.`;

    return { n1, n2, nComparison, R, F: Math.abs(F), Fcrit, conclusion };
  };

  handleThirdTask = () => {
    const beforeResults = this.dispersionAnalysis(this.state.og.before, this.state.kg.before, false);
    const afterResults = this.dispersionAnalysis(this.state.og.after, this.state.kg.after, true);

    const resultBefore = `ДО эксперимента:\nn1: ${beforeResults.n1},\nn2: ${beforeResults.n2},\n${beforeResults.nComparison},\nR: ${beforeResults.R},\nF: ${beforeResults.F.toFixed(2)},\nFкрит: ${beforeResults.Fcrit.toFixed(2)},\n${beforeResults.conclusion}`;
    const resultAfter = `ПОСЛЕ эксперимента:\nn1: ${afterResults.n1},\nn2: ${afterResults.n2},\n${afterResults.nComparison},\nR: ${afterResults.R},\nF: ${afterResults.F.toFixed(2)},\nFкрит: ${afterResults.Fcrit.toFixed(2)},\n${afterResults.conclusion}`;

    this.setState({ 
      result: `${resultBefore}\n\n${resultAfter}`,
      difference: 3,
      task: "Задание 3\nНепараметрический критерий для дисперсий:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."
    });
  };

	render(){
		const {title} = getState().app;
    const {og,kg,task,result,difference} = this.state;
		return (
			<Panel>
				<PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())}/>}>{title}</PanelHeader>
        {(difference==0 || difference==1) ? (
          <div>
            <FormItem top="ОГ (Основная группа)">
              {this.renderTable(og)}
            </FormItem>
            <FormItem top="КГ (Контрольная группа)">
              {this.renderTable(kg)}
            </FormItem>
          </div>
        ) : (
          <div>
            <FormItem>
              {this.renderTable(kg,og,true)}
            </FormItem>
            <FormItem>
              {this.renderTable(kg,og)}
            </FormItem>
          </div>
        )}
        <FormLayoutGroup mode="horizontal">
          <FormItem><Button mode="secondary" stretched onClick={this.handleFirstTask}>Задание 1</Button></FormItem>
          <FormItem><Button mode="secondary" stretched onClick={this.handleSecondTask}>Задание 2</Button></FormItem>
          <FormItem><Button mode="secondary" stretched onClick={this.handleThirdTask}>Задание 3</Button></FormItem>
        </FormLayoutGroup>
        {task && <FormItem>
          <Textarea
            readonly
            value={task}
          />
        </FormItem>}
        {result && <FormItem>
          <Textarea
            readonly
            value={result}
            maxHeight={2000}
          />
        </FormItem>}
      </Panel>
		);
	}
}

export default Lab7;