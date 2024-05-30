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

class Lab10 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: Object.entries(data).map(([key, value]) => ({ x: parseInt(key, 10), y: value })),
      alpha: 0.1
    };
  }

  calculateCorrelationAndRegression = () => {
    const { data, alpha } = this.state;
    const n = data.length;
    const xMean = data.reduce((acc, pair) => acc + pair.x, 0) / n;
    const yMean = data.reduce((acc, pair) => acc + pair.y, 0) / n;

    const qxi = data.map(pair => Math.pow(pair.x - xMean, 2));
    const qyi = data.map(pair => Math.pow(pair.y - yMean, 2));
    const qxiyi = data.map(pair => (pair.x - xMean) * (pair.y - yMean));

    const Qx = qxi.reduce((acc, qx) => acc + qx, 0);
    const Qy = qyi.reduce((acc, qy) => acc + qy, 0);
    const Qxy = qxiyi.reduce((acc, qxy) => acc + qxy, 0);

    const rXY = Qxy / Math.sqrt(Qx * Qy);
    const tCritical = jStat.studentt.inv(1 - alpha / 2, n - 2);
    const isSignificant = Math.abs(rXY) > tCritical / Math.sqrt(n - 2 + Math.pow(tCritical, 2));

    let svyaz = "положительная", power = "слабая", str = "увеличивается";
    if (rXY < 0) {
      svyaz = "отрицательная";
      str = "уменьшается";
    }
    if (Math.abs(rXY) >= 0.3 && Math.abs(rXY) <= 0.7) power = "умеренная";
    else if (Math.abs(rXY) > 0.7) power = "сильная";

    const Z = 0.5 * Math.log((1 + rXY) / (1 - rXY));
    const z1 = Z - jStat.normal.inv(1 - alpha / 2, 0, 1) / Math.sqrt(n - 3);
    const z2 = Z + jStat.normal.inv(1 - alpha / 2, 0, 1) / Math.sqrt(n - 3);
    const r1 = (Math.exp(2 * z1) - 1) / (Math.exp(2 * z1) + 1);
    const r2 = (Math.exp(2 * z2) - 1) / (Math.exp(2 * z2) + 1);

    const ner = `(${Math.abs(rXY).toFixed(4)}>${(tCritical / Math.sqrt(n - 2 + Math.pow(tCritical, 2))).toFixed(4)})`;

    const resPearson = `x* = ${xMean.toFixed(2)}\ny* = ${yMean.toFixed(2)}\nQx = ${Qx.toFixed(2)}\nQy = ${Qy.toFixed(2)}\nQxy = ${Qxy.toFixed(2)}\nrXY = ${rXY.toFixed(2)}\n` +
      `Так как коэффициент корреляции ${svyaz}, то между возрастом детей и частотой дыхания есть ${power} ${svyaz} связь. Эта связь заключается в том, что при увеличении возраста ${str} частота дыхания.\n\n` +
      `n = ${n}\nt a/2(n-2) = ${tCritical.toFixed(2)}\n` +
      `${isSignificant ? `Так как неравенство ${ner} верное, то нулевая гипотеза отвергается, т.е. коэффициент корреляции является значимым.` : `Так как неравенство ${ner} неверное, то нулевая гипотеза принимается, т.е. коэффициент корреляции не является значимым.`}\n` +
      `Z = ${Z.toFixed(3)}\nz1 = ${z1.toFixed(3)}     ${r1.toFixed(2)}<rXY<${r2.toFixed(2)}\nz2 = ${z2.toFixed(3)}\n` +
      `С вероятностью 95% коэффициент корреляции находится в пределах от ${r1.toFixed(2)} до ${r2.toFixed(2)}`;
    //////////
    const b = Qxy / Qx;
    const a = yMean - b * xMean;

    const sb = Math.sqrt((1 - rXY ** 2) * Qy / ((n - 2) * Qx));
    const T = Math.abs(b / sb);
    const tcrit = jStat.studentt.inv(1 - alpha / 2, n - 2);

    const f = (rXY ** 2) * (n - 2) / (1 - rXY ** 2);
    const Fcrit = jStat.centralF.inv(1 - alpha / 2, 1, n - 2);

    const predictedCDAtSix = a + b * 6;
    const ageWhenCDIsTwentyTwo = (22 - a) / b;


    const resRegres = `a = ${a.toFixed(3)}\nb = ${b.toFixed(3)}\n` +
  `Уравнение линейной регрессии: y* = ${a.toFixed(3)} + ${b.toFixed(3)}x\n` +
  `sb = ${sb.toFixed(2)}\nT = ${T.toFixed(2)}\nt крит. = ${tcrit.toFixed(2)}\n` +
  `${T >= tcrit ? `Коэффициент b значим` : `Коэффициент b не значим`}\n` +
  `F = ${f.toFixed(2)}\nF крит. = ${Fcrit.toFixed(2)}\n` +
  `${f >= Fcrit ? `Линейная регрессионная модель значима` : `Линейная регрессионная модель не значима`}\n\n` +
  `ЧД = ${a.toFixed(2)} + ${b.toFixed(2)} * Возраст\n` +
  `ЧД в возрасте 6 лет: ${predictedCDAtSix.toFixed(2)} взд/мин\n` +
  `Возраст, при котором ЧД составляет 22 взд/мин: ${ageWhenCDIsTwentyTwo.toFixed(2)} лет\n` +
  `Значение коэффициента наклона b = ${b.toFixed(3)} указывает на ${b < 0 ? 'отрицательную' : 'положительную'} связь ` +
  `между возрастом и частотой дыхания. Данное значение показывает, что с каждым годом частота дыхания ` +
  `${b < 0 ? 'уменьшается' : 'увеличивается'} в среднем на ${Math.abs(b).toFixed(3)} вздохов в минуту. ` +
  `Поскольку значение T = ${T.toFixed(2)} превышает t критическое = ${tcrit.toFixed(2)}, ` +
  `мы отвергаем нулевую гипотезу о том, что между возрастом и частотой дыхания нет связи, ` +
  `таким образом подтверждая статистическую значимость коэффициента b.`;

    const fittingChartData = {
      labels: data.map(pair => pair.x),
      datasets: [
        {
          label: 'Исходные данные',
          data: data.map(pair => pair.y),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          type: 'scatter'
        },
        {
          label: 'Линия регрессии',
          data: data.map(pair => a + b * pair.x),
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          type: 'line',
          fill: false
        }
      ]
    };

    const residualsChartData = {
      labels: data.map(pair => pair.x),
      datasets: [
        {
          label: 'Остатки',
          data: data.map(pair => ({ x: pair.x, y: pair.y - (a + b * pair.x) })),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          showLine: true,
          fill: false
        }
      ]
    };

    this.setState({ fittingChartData, residualsChartData, resPearson, resRegres });
  };
  
  calculateTables = () => {
    const { data } = this.state;
    let xSum = 0;
    let ySum = 0;
    const n = data.length;
  
    data.forEach(pair => {
      xSum += pair.x;
      ySum += pair.y;
    });
  
    const xMean = xSum / n;
    const yMean = ySum / n;
  
    const table1Data = data.map(pair => ({
      xi: pair.x,
      yi: pair.y,
      xi_xMean_sq: Math.pow(pair.x - xMean, 2),
      yi_yMean_sq: Math.pow(pair.y - yMean, 2),
      xi_xMean_yi_yMean: (pair.x - xMean) * (pair.y - yMean)
    }));
  
    let qxy = 0;
    let qx = 0;
    data.forEach(pair => {
      qxy += (pair.x - xMean) * (pair.y - yMean);
      qx += Math.pow((pair.x - xMean), 2);
    });
  
    const b = qxy / qx;
    const a = yMean - b * xMean;
  
    const table2Data = data.map(pair => {
      const yPredicted = a + b * pair.x;
      return {
        xi: pair.x,
        yi: pair.y,
        yPredicted: Number(yPredicted.toFixed(3)),
        yi_yPredicted: Number((pair.y - yPredicted).toFixed(3))
      };
    });
  
    const tableLnXData = data.map(pair => {
      const lnXi = Math.log(pair.x);
      const yPredicted = a + b * lnXi;
      return {
        lnXi: lnXi,
        yi: pair.y,
        yPredicted: Number(yPredicted.toFixed(3)),
        yi_yPredicted: Number((pair.y - yPredicted).toFixed(3))
      };
    });
  
    this.setState({ table1Data, table2Data, tableLnXData });
  }

  renderTable = (tableData, headers) => {
    return (
      <table>
        <thead>
          <tr className="table-cell">
            {headers.map(header => <th key={header} className="table-cell">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index} className="table-cell">
              {Object.keys(row).map(header => <td key={header} className="table-cell">{row[header].toFixed(3)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  calculateNonLinearRegression = () => {
    const { data, alpha } = this.state;
    const n = data.length;
  
    const lnX = data.map(pair => Math.log(pair.x));
    const xMean = lnX.reduce((acc, x) => acc + x, 0) / n;
    const yMean = data.reduce((acc, pair) => acc + pair.y, 0) / n;
  
    const qxi = lnX.map(x => Math.pow(x - xMean, 2));
    const qyi = data.map(pair => Math.pow(pair.y - yMean, 2));
    const qxiyi = lnX.map((x, i) => (x - xMean) * (data[i].y - yMean));
  
    const Qx = qxi.reduce((acc, qx) => acc + qx, 0);
    const Qy = qyi.reduce((acc, qy) => acc + qy, 0);
    const Qxy = qxiyi.reduce((acc, qxy) => acc + qxy, 0);
  
    const b = Qxy / Qx;
    const a = yMean - b * xMean;
  
    const sb = Math.sqrt((1 - (Qxy / Math.sqrt(Qx * Qy)) ** 2) * Qy / ((n - 2) * Qx));
    const T = Math.abs(b / sb);
    const tcrit = jStat.studentt.inv(1 - alpha / 2, n - 2);
  
    const f = ((Qxy / Math.sqrt(Qx * Qy)) ** 2) * (n - 2) / (1 - (Qxy / Math.sqrt(Qx * Qy)) ** 2);
    const Fcrit = jStat.centralF.inv(1 - alpha / 2, 1, n - 2);
  
    const predictedCDAtSix = a + b * Math.log(6);
    const ageWhenCDIsTwentyTwo = Math.exp((22 - a) / b);
  
    const resNonLinearRegres = `a = ${a.toFixed(3)}\nb = ${b.toFixed(3)}\n` +
      `Уравнение нелинейной регрессии: y* = ${a.toFixed(3)} + ${b.toFixed(3)} * ln(x)\n` +
      `sb = ${sb.toFixed(2)}\nT = ${T.toFixed(2)}\nt крит. = ${tcrit.toFixed(2)}\n` +
      `${T >= tcrit ? `Коэффициент b значим` : `Коэффициент b не значим`}\n` +
      `F = ${f.toFixed(2)}\nF крит. = ${Fcrit.toFixed(2)}\n` +
      `${f >= Fcrit ? `Нелинейная регрессионная модель значима` : `Нелинейная регрессионная модель не значима`}\n\n` +
      `ЧД = ${a.toFixed(2)} + ${b.toFixed(2)} * ln(Возраст)\n` +
      `ЧД в возрасте 6 лет: ${predictedCDAtSix.toFixed(2)} взд/мин\n` +
      `Возраст, при котором ЧД составляет 22 взд/мин: ${ageWhenCDIsTwentyTwo.toFixed(2)} лет\n` +
      `Значение коэффициента наклона b = ${b.toFixed(3)} указывает на ${b < 0 ? 'отрицательную' : 'положительную'} связь ` +
      `между возрастом и частотой дыхания. Данное значение показывает, что с каждым годом частота дыхания ` +
      `${b < 0 ? 'уменьшается' : 'увеличивается'} в среднем на ${Math.abs(b).toFixed(3)} вздохов в минуту. ` +
      `Поскольку значение T = ${T.toFixed(2)} превышает t критическое = ${tcrit.toFixed(2)}, ` +
      `мы отвергаем нулевую гипотезу о том, что между возрастом и частотой дыхания нет связи, ` +
      `таким образом подтверждая статистическую значимость коэффициента b.`;
  
    const fittingChartDataNonLinear = {
      labels: data.map(pair => pair.x),
      datasets: [
        {
          label: 'Исходные данные',
          data: data.map(pair => pair.y),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          type: 'scatter'
        },
        {
          label: 'Линия нелинейной регрессии',
          data: data.map(pair => a + b * Math.log(pair.x)),
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          type: 'line',
          fill: false
        }
      ]
    };
  
    const residualsChartDataNonLinear = {
      labels: data.map(pair => pair.x),
      datasets: [
        {
          label: 'Остатки',
          data: data.map(pair => ({ x: pair.x, y: pair.y - (a + b * Math.log(pair.x)) })),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          showLine: true,
          fill: false
        }
      ]
    };
  
    this.setState({ fittingChartDataNonLinear, residualsChartDataNonLinear, resNonLinearRegres });
  };

  componentDidMount(){
    this.calculateTables();
    this.calculateCorrelationAndRegression();
    this.calculateNonLinearRegression();
  }

  render() {
    const { title } = getState().app;
    const { table1Data, table2Data, tableLnXData, resPearson, resRegres, resNonLinearRegres, fittingChartData, fittingChartDataNonLinear, residualsChartData, residualsChartDataNonLinear } = this.state;
    const table1Headers = ['xi (Возраст, лет)', 'yi (Частота дыхания, взд/мин)', '(xi-x*)^2', '(yi-y*)^2', '(xi-x*)*(yi-y*)'];
    const table2Headers = ['xi (Возраст, лет)', 'yi (Частота дыхания, взд/мин)', 'y*(xi)', 'yi-y*(xi)'];
    const tableLnXHeaders = ['ln(xi)', 'yi (Частота дыхания, взд/мин)', 'y*(ln(xi))', 'yi-y*(ln(xi))'];
  
    return (
      <Panel>
        <PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())} />}>{title}</PanelHeader>
        <FormItem>
          <Textarea
            readonly
            value="Задание: Изучали зависимость между возрастом детей и частотой дыхания. Найти значение ЧД в возрасте 6 лет, определить, в каком возрасте значение ЧД у ребенка составляет 22 (взд/мин)."
          />
        </FormItem>
        {table1Data && this.renderTable(table1Data, table1Headers)}
        {resPearson && <FormItem><Textarea
          readonly
          value={`Линейный корреляционный анализ:\n${resPearson}`}
          maxHeight={2000}
        /></FormItem>}
        <br/>
        {table2Data && this.renderTable(table2Data, table2Headers)}
        {resRegres && <FormItem><Textarea
          readonly
          value={`Линейный регрессионный анализ:\n${resRegres}`}
          maxHeight={2000}
        /></FormItem>}
        {fittingChartData && <FormItem>
          <h3>График подбора</h3>
          <Scatter data={fittingChartData} options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Возраст детей'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Частота дыхания (взд/мин)'
                }
              }
            }
          }}/>
        </FormItem>}
  
        {residualsChartData && <FormItem>
          <h3>График остатков</h3>
          <Line data={residualsChartData} options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Возраст детей'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Остатки'
                }
              }
            }
          }} />
        </FormItem>}
        {tableLnXData && this.renderTable(tableLnXData, tableLnXHeaders)}
        {resNonLinearRegres && <FormItem><Textarea
          readonly
          value={`Нелинейный регрессионный анализ:\n${resNonLinearRegres}`}
          maxHeight={2000}
        /></FormItem>}
        {fittingChartDataNonLinear && <FormItem>
          <h3>График подбора (Нелинейная регрессия)</h3>
          <Scatter data={fittingChartDataNonLinear} options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Возраст детей'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Частота дыхания (взд/мин)'
                }
              }
            }
          }}/>
        </FormItem>}
        {residualsChartDataNonLinear && <FormItem>
          <h3>График остатков (Нелинейная регрессия)</h3>
          <Line data={residualsChartDataNonLinear} options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Возраст детей'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Остатки'
                }
              }
            }
          }} />
        </FormItem>}
      </Panel>
    );
  }
}

export default Lab10;