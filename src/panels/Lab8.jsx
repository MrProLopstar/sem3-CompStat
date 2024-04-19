import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup, Input, Select, Button, Separator, Slider, Textarea } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import { v4 as uuidv4 } from 'uuid';
import data from '../data/lab8.json'
import { Line, Bar, Scatter } from 'react-chartjs-2';
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
import jStat from 'jstat';

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

class Lab8 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: Object.entries(data).map(([key, value]) => ({ x: parseInt(key, 10), y: value })),
      alpha: 0.1,
      pearsonResult: '',
      scatterData: {}
    };
  }

  calculatePearson = () => {
    const { alpha, data } = this.state;
    const dataArray = data.map(pair => [pair.x, pair.y]);
    let x = 0;
    let y = 0;
    const n = dataArray.length;

    dataArray.forEach(([xi, yi]) => {
      x += xi;
      y += yi;
    });

    x /= n;
    y /= n;

    let qxy = 0;
    let qx = 0;
    let qy = 0;

    dataArray.forEach(([xi, yi]) => {
      qxy += (xi - x) * (yi - y);
      qx += Math.pow((xi - x), 2);
      qy += Math.pow((yi - y), 2);
    });

    const rxy = qxy / Math.sqrt(qx * qy);
    const formattedResult = `x*= ${x.toFixed(2)}\ny*= ${y.toFixed(2)}\nqx= ${qx.toFixed(2)}\nqy= ${qy.toFixed(2)}\nqxy= ${qxy.toFixed(2)}\nrxy= ${rxy.toFixed(2)}\n`;

    this.setState({
      pearsonResult: formattedResult,
      scatterData: {
        datasets: [
          {
            label: 'Dataset',
            data: dataArray,
            backgroundColor: 'rgba(255, 99, 132, 1)'
          }
        ]
      }
    });
  };

  componentDidMount() {
  }

  render() {
    const { title } = getState().app;
    const { pearsonResult, scatterData } = this.state;

    return (
      <Panel>
        <PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())} />}>{title}</PanelHeader>
        <FormItem>
          <Button mode="secondary" stretched onClick={this.calculatePearson}>Задание 1</Button>
        </FormItem>
        <FormItem>
          <Textarea
            readonly
            value="Задание: Для данных, приведенных в варианте, провести линейный корреляционный и регрессионный анализ.\nНайти число заболеваний кариесом у детей при потреблении ими рафинированных углеводов 55 граммов в сутки, определить, при каком потреблении рафинированных углеводов распространенность кариеса составит 900 детей (в расчете на 1000 детей)."
          />
        </FormItem>
        {pearsonResult && (
          <>
            <FormItem>
              <Textarea
                readonly
                value={`Результат расчета коэффициента корреляции Пирсона: \n${pearsonResult}`}
                maxHeight={200}
              />
            </FormItem>
            <Scatter data={scatterData} options={{
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'X'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Y'
                  }
                }
              }
            }} />
          </>
        )}
      </Panel>
    );
  }
}

export default Lab8;