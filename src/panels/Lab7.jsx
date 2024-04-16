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
      difference: false
		};
	};

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
  };
    
  handleFirstTask = () => {
    this.setState({task: "Задание 1\nПрименить критерий знаков:\nа) Опытная группа до и после эксперимента;\nб) Контрольная группа до и после эксперимента."});
  };
    
  handleSecondTask = () => {
    this.setState({task: "Задание 2\nПрименить критерий Вилкоксона:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."});
  };
    
  handleThirdTask = () => {
    this.setState({task: "Задание 3\nНепараметрический критерий для дисперсий:\nа) Опытная и контрольная группа до эксперимента;\nб) Опытная и контрольная группа после эксперимента."});
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
      </Panel>
		);
	}
}

export default Lab7;