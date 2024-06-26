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
	constructor(props){
		super(props);
		this.state = {
            og: data.og,
            kg: data.kg,
            difference: 0
		};
	}

    renderTable = (dataSet, dataSet1, before) => {
        const {difference} = this.state;
        if(difference==0 || difference==1) return (
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
                    {difference==1 && (
                        <tr>
                            {["До-После", ...dataSet.before].map((value, index) => (
                                <td key={index} className="table-cell">{index==0 ? value : (value-dataSet.after[index-1]).toFixed(1)}</td>
                            ))}
                        </tr>
                    )}
                </tbody>
            </table>
        );
        if(difference==2 || difference==3) return (
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
                        {["ОГ "+(before ? "До" : "После"), ...(before ? dataSet.before : dataSet.after)].map((value, index) => (
                            <td key={index} className="table-cell">{value}</td>
                        ))}
                    </tr>
                    <tr>
                        {["КГ "+(before ? "До" : "После"), ...(before ? dataSet1.before : dataSet1.after)].map((value, index) => (
                            <td key={index} className="table-cell">{value}</td>
                        ))}
                    </tr>
                </tbody>
            </table>
        )
    }

    pairedStudentTest = (dataSet, name) => {
        const diff = dataSet.before.map((before, index) => before-dataSet.after[index]);
        const meanBefore = jStat.mean(dataSet.before);
        const meanAfter = jStat.mean(dataSet.after);
        const meanDiff = jStat.mean(diff);
        const stdDiff = jStat.stdev(diff, true);
        const s2 = jStat.variance(diff, true);
        const n = diff.length;
        const t = meanDiff / (stdDiff / Math.sqrt(n));
        const criticalT = jStat.studentt.inv(0.975, n-1);
    
        let conclusion = `Вывод по изменению длины желчного пузыря: `;
        if(Math.abs(t)>=criticalT) conclusion += `так как наблюдаемое значение T (${t.toFixed(4)}) превышает критическое T (${criticalT.toFixed(4)}), то изменение считается статистически значимым. Это говорит о влиянии эксперимента на длину желчного пузыря.`;
        else conclusion += `так как наблюдаемое значение T (${t.toFixed(4)}) меньше критического T (${criticalT.toFixed(4)}), то статистически значимого изменения не обнаружено и эксперимент не повлиял на длину желчного пузыря.`;
    
        return {
            n,
            meanBefore: meanBefore.toFixed(4),
            meanAfter: meanAfter.toFixed(4),
            meanDiff: meanDiff.toFixed(4),
            s2: s2.toFixed(4),
            tValue: t.toFixed(4),
            criticalT: criticalT.toFixed(4),
            conclusion
        };
    };
    
    handleFirstTask = () => {
        const ogResult = this.pairedStudentTest(this.state.og, "Опытной группе (ОГ)");
        const kgResult = this.pairedStudentTest(this.state.kg, "Контрольной группе (КГ)");
        const resultText = `Опытная группа (ОГ):\nn: ${ogResult.n}\nСреднее (До): ${ogResult.meanBefore}\nСреднее (После): ${ogResult.meanAfter}\nСреднее разностей: ${ogResult.meanDiff}\nДисперсия разностей: ${ogResult.s2}\nT-фактическое: ${ogResult.tValue}\nT-критическое: ${ogResult.criticalT}\n${ogResult.conclusion}\n\nКонтрольная группа (КГ):\nn: ${kgResult.n}\nСреднее (До): ${kgResult.meanBefore}\nСреднее (После): ${kgResult.meanAfter}\nСреднее разностей: ${kgResult.meanDiff}\nДисперсия разностей: ${kgResult.s2}\nT-фактическое: ${kgResult.tValue}\nT-критическое: ${kgResult.criticalT}\n${kgResult.conclusion}`;
        this.setState({result: resultText, difference: 1, task: "Задание 1\nВыполнить проверку гипотезы о равенстве средних для двух зависимых выборок с помощью парного критерия Стьюдента:\nа) Опытная группа до и после эксперимента;\nб) Контрольная группа до и после эксперимента."});
    };
    
    handleSecondTask = () => {
        const varianceBeforeOG = jStat.variance(this.state.og.before, true);
        const varianceBeforeKG = jStat.variance(this.state.kg.before, true);
        const varianceAfterOG = jStat.variance(this.state.og.after, true);
        const varianceAfterKG = jStat.variance(this.state.kg.after, true);
    
        const fBefore = varianceBeforeOG>varianceBeforeKG ? varianceBeforeOG/varianceBeforeKG : varianceBeforeKG/varianceBeforeOG;
        const fAfter = varianceAfterOG>varianceAfterKG ? varianceAfterOG/varianceAfterKG : varianceAfterKG/varianceAfterOG;
    
        const dfBeforeOG = this.state.og.before.length-1;
        const dfBeforeKG = this.state.kg.before.length-1;
        const dfAfterOG = this.state.og.after.length-1;
        const dfAfterKG = this.state.kg.after.length-1;
        
        const criticalFBefore = jStat.centralF.inv(0.975, dfBeforeOG, dfBeforeKG);
        const criticalFAfter = jStat.centralF.inv(0.975, dfAfterOG, dfAfterKG);
    
        const conclusionBefore = fBefore >= criticalFBefore
        ? `Измерения длины желчного пузыря до эксперимента показывают, что F-фактическое (${fBefore.toFixed(4)}) превышает F-критическое (${criticalFBefore.toFixed(4)}), следовательно, с вероятностью 95% обнаружены статистически значимые различия в дисперсиях.`
        : `Измерения длины желчного пузыря до эксперимента показывают, что F-фактическое (${fBefore.toFixed(4)}) ниже F-критического (${criticalFBefore.toFixed(4)}), следовательно, статистически значимых различий в дисперсиях не обнаружено.`;

        const conclusionAfter = fAfter >= criticalFAfter
        ? `Измерения длины желчного пузыря после эксперимента показывают, что F-фактическое (${fAfter.toFixed(4)}) превышает F-критическое (${criticalFAfter.toFixed(4)}), следовательно, с вероятностью 95% обнаружены статистически значимые различия в дисперсиях.`
        : `Измерения длины желчного пузыря после эксперимента показывают, что F-фактическое (${fAfter.toFixed(4)}) ниже F-критического (${criticalFAfter.toFixed(4)}), следовательно, статистически значимых различий в дисперсиях не обнаружено.`;
    
        this.setState({
            result: `ОГ (До эксперимента):\n` +
                    `n: ${this.state.og.before.length}\n` +
                    `x*: ${jStat.mean(this.state.og.before).toFixed(4)}\n` +
                    `s^2: ${varianceBeforeOG.toFixed(4)}\n//\n` +
                    `КГ (До эксперимента):\n` +
                    `n: ${this.state.kg.before.length}\n` +
                    `x*: ${jStat.mean(this.state.kg.before).toFixed(4)}\n` +
                    `s^2: ${varianceBeforeKG.toFixed(4)}\n//\n` +
                    `F-факт: ${fBefore.toFixed(4)}\n` +
                    `F-крит: ${criticalFBefore.toFixed(4)}\n` +
                    `${conclusionBefore}\n\n` +
                    `ОГ (После эксперимента):\n` +
                    `n: ${this.state.og.after.length}\n` +
                    `x*: ${jStat.mean(this.state.og.after).toFixed(4)}\n` +
                    `s^2: ${varianceAfterOG.toFixed(4)}\n//\n` +
                    `КГ (После эксперимента):\n` +
                    `n: ${this.state.kg.after.length}\n` +
                    `x*: ${jStat.mean(this.state.kg.after).toFixed(4)}\n` +
                    `s^2: ${varianceAfterKG.toFixed(4)}\n//\n` +
                    `F-факт: ${fAfter.toFixed(4)}\n` +
                    `F-крит: ${criticalFAfter.toFixed(4)}\n` +
                    `${conclusionAfter}`,
            difference: 2,
            task: "Задание 2\nВыполнить проверку гипотезы о равенстве дисперсий для двух независимых выборок с помощью критерия Фишера:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."
        });
    };
    
    unpairedStudentTest = (data1, data2, period) => {
        const mean1 = jStat.mean(data1);
        const mean2 = jStat.mean(data2);
        const sd1 = jStat.stdev(data1, true);
        const sd2 = jStat.stdev(data2, true);
        const n1 = data1.length;
        const n2 = data2.length;
    
        const fValue = sd1 ** 2 / sd2 ** 2;
        const df1 = n1 - 1;
        const df2 = n2 - 1;
        const fCritical = jStat.centralF.inv(0.975, df1, df2);
        const areVariancesEqual = fValue <= fCritical;
    
        let tValue, criticalT, df, sp;
    
        if(areVariancesEqual){
            sp = Math.sqrt(((n1 - 1) * sd1 ** 2 + (n2 - 1) * sd2 ** 2) / (n1 + n2 - 2));
            tValue = (mean1 - mean2) / (sp * Math.sqrt(1 / n1 + 1 / n2));
            df = n1 + n2 - 2;
        } else {
            tValue = (mean1 - mean2) / Math.sqrt(sd1 ** 2 / n1 + sd2 ** 2 / n2);
            df = Math.pow(sd1 ** 2 / n1 + sd2 ** 2 / n2, 2) /
                 (Math.pow(sd1 ** 2 / n1, 2) / df1 + Math.pow(sd2 ** 2 / n2, 2) / df2);
        }
        criticalT = jStat.studentt.inv(0.975, df);
    
        let conclusion = '';
        if(Math.abs(tValue)>=criticalT) conclusion = `Поскольку T-фактическое (${tValue.toFixed(4)}) превышает T-критическое (${criticalT.toFixed(4)}), то с вероятностью 95% нулевая гипотеза об отсутствии различий в средних значениях длины желчного пузыря в ОГ и КГ ${period} отвергается.`;
        else conclusion = `Поскольку T-фактическое (${tValue.toFixed(4)}) меньше T-критического (${criticalT.toFixed(4)}), то с вероятностью 95% нулевая гипотеза об отсутствии различий в средних значениях длины желчного пузыря в ОГ и КГ ${period} принимается.`;
    
        return {
            tValue: tValue.toFixed(4),
            criticalT: criticalT.toFixed(4),
            sd: sp ? sp.toFixed(4) : 'n/a',
            conclusion: conclusion
        };
    };
    
    handleThirdTask = () => {
        const resultsBefore = this.unpairedStudentTest(this.state.og.before, this.state.kg.before, "до эксперимента");
        const resultsAfter = this.unpairedStudentTest(this.state.og.after, this.state.kg.after, "после эксперимента");
    
        const resultText = `ОГ и КГ до эксперимента:\nsd = ${resultsBefore.sd}\nT фактическое = ${resultsBefore.tValue}\nT критическое = ${resultsBefore.criticalT}\n${resultsBefore.conclusion}\n\n` +
                           `ОГ и КГ после эксперимента:\nsd = ${resultsAfter.sd}\nT фактическое = ${resultsAfter.tValue}\nT критическое = ${resultsAfter.criticalT}\n${resultsAfter.conclusion}`;
    
        this.setState({ 
            result: resultText,
            difference: 3,
            task: "Задание 3\nВыполнить проверку гипотезы о равенстве средних для двух независимых выборок с помощью непарного критерия Стьюдента:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."
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

export default Lab6;