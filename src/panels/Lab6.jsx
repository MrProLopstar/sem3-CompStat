import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup, Input, Select, Button, Separator, Slider, Textarea, Group } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import { v4 as uuidv4 } from 'uuid';
import { Line, Bar } from 'react-chartjs-2';
import data from '../data/lab6.json'
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

class Lab6 extends Component {
	constructor(props) {
		super(props);
		this.state = {
            og: data.og,
            kg: data.kg,
            difference: false
		};
	}

    renderTable = (dataSet) => {
        const {difference} = this.state;
        return (
            <table>
            <thead>
                <tr>
                    {['',...dataSet.before].map((_, index) => (
                        <th key={index} className="table-cell">{index==0 ? '' : index}</th>
                    ))}
                </tr>
            </thead>
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
                {difference && (
                    <tr>
                        {["До-После", ...dataSet.before].map((value, index) => (
                            <td key={index} className="table-cell">{index==0 ? value : (value-dataSet.after[index-1]).toFixed(1)}</td>
                        ))}
                    </tr>
                )}
            </tbody>
        </table>
        );
    }

    pairedStudentTest = (dataSet, name) => {
        const diff = dataSet.before.map((before, index) => before - dataSet.after[index]);
        const meanDiff = jStat.mean(diff);
        const stdDiff = jStat.stdev(diff, true);
        const n = diff.length;
        const t = meanDiff / (stdDiff / Math.sqrt(n)); // Расчет t-статистики
        const criticalT = jStat.studentt.inv(0.975, n - 1); // Двусторонний t-критерий
        const pValue = (1 - jStat.studentt.cdf(Math.abs(t), n - 1)) * 2;
      
        let conclusion = `Вывод: `;
        if (Math.abs(t) >= criticalT) {
          conclusion += `так как T фактическое >= T критическое (${t.toFixed(4)} >= ${criticalT.toFixed(4)}), то с вероятностью 95% нулевая гипотеза о равенстве средних в ${name} до эксперимента и после него отвергается. Следовательно, значения в ${name} до и после эксперимента не равны. Эксперимент повлиял на значения.`;
        } else {
          conclusion += `так как T фактическое < T критическое (${t.toFixed(4)} < ${criticalT.toFixed(4)}), то с вероятностью 95% нулевая гипотеза о равенстве средних в ${name} до эксперимента и после него принимается. Следовательно, значения в ${name} до и после эксперимента равны. Эксперимент не повлиял на значения.`;
        }
      
        return {
          tValue: t.toFixed(4),
          criticalT: criticalT.toFixed(4),
          pValue: pValue.toFixed(4),
          conclusion
        };
      };
      
      handleFirstTask = () => {
        const ogResult = this.pairedStudentTest(this.state.og, "Опытной группе (ОГ)");
        const kgResult = this.pairedStudentTest(this.state.kg, "Контрольной группе (КГ)");
        const resultText = `Опытная группа (ОГ):\nT-фактическое: ${ogResult.tValue}\nT-критическое: ${ogResult.criticalT}\nP-значение: ${ogResult.pValue}\n${ogResult.conclusion}\n\nКонтрольная группа (КГ):\nT-фактическое: ${kgResult.tValue}\nT-критическое: ${kgResult.criticalT}\nP-значение: ${kgResult.pValue}\n${kgResult.conclusion}`;
        this.setState({result: resultText, difference: true, task: "Задание 1\nВыполнить проверку гипотезы о равенстве средних для двух зависимых выборок с помощью парного критерия Стьюдента:\nа) Опытная группа до и после эксперимента;\nб) Контрольная группа до и после эксперимента."});
    };

    handleSecondTask = () => {
        this.setState({difference: false, task: "Задание 2\nВыполнить проверку гипотезы о равенстве дисперсий для двух независимых выборок с помощью критерия Фишера:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после экспермиента."});
    };

    handleThirdTask = () => {
        this.setState({difference: false, task: "Задание 3\nВыполнить проверку гипотезы о равенстве средних для двух независимых выборок с помощью непарного критерия Стьюдента:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."});
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
                    />
                </FormItem>}
			</Panel>
		);
	}
}

export default Lab6;