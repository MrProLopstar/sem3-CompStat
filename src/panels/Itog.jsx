import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, FormLayoutGroup, Textarea, Button, Input } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import { Scatter } from 'react-chartjs-2';
import jStat from 'jstat';

class Lab10 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      select: 0,
      dataSets: [
        {
          title: 'Производительность и эффективность использования ресурсов в сельскохозяйственных предприятиях',
          x1: [30, 45, 50, 35, 20, 25, 18, 22, 15],
          x2: [10, 12, 15, 8, 5, 7, 6, 9, 4],
          group: [1, 1, 1, 1, 2, 2, 2, 2, 2],
          //x1: [0.15, 0.34, 0.09, 0.21, 0.48, 0.41, 0.62, 0.5, 1.2],
          //x2: [1.91, 1.68, 1.89, 2.3, 0.88, 0.62, 1.09, 1.32, 0.68],
          //group: [1, 1, 1, 1, 2, 2, 2, 2, 2],
          headers: ['Номер предприятия', 'Средний урожай, ц/га (X1)', 'Затраты на удобрения, тыс. руб./га (X2)']
        },
        {
          title: 'Вовлечённость сотрудников в двух различных отделах компании',
          x1: [3.5, 4.2, 2.8, 3.9, 3.1, 2.3, 3.0, 4.1, 2.7, 3.4],
          x2: [7, 8.5, 6, 7.2, 8, 5.5, 6.8, 7.5, 6.2, 7],
          group: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
          headers: ['Номер объекта', 'Среднее время обслуживания, ч (X1)', 'Уровень вовлечённости (Х2)']
        },
        {
          title: 'Производительность студентов в двух различных классах',
          x1: [85, 90, 78, 92, 88, 80, 75, 82, 79, 86],
          x2: [3, 2, 5, 1, 2, 4, 6, 3, 5, 2],
          group: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
          headers: ['Номер объекта', 'Средний балл, (X1)', 'Количество пропущенных занятий (Х2)']
        }
      ],
      selectedDataSet: {},
      scatterData: null,
      result: '',
      discriminantFunction: '',
      covarianceMatrix: [],
      predictions: [],
      discriminantValues: []
    };
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
          {tableData[0].map((x, index) => (
            <tr key={index} className="table-cell">
              {tableData.map((y, i) => <td key={index.toString() + i.toString()} className="table-cell">{y[index]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  calculateDiscriminantValues = (select) => {
    const { dataSets } = this.state;
    const dataSet = dataSets[select-1];
    if(!dataSet) return;
    const { x1, x2, group } = dataSet;
    const x1Group1 = x1.filter((_, i) => group[i] === 1);
    const x1Group2 = x1.filter((_, i) => group[i] === 2);
    const x2Group1 = x2.filter((_, i) => group[i] === 1);
    const x2Group2 = x2.filter((_, i) => group[i] === 2);
  
    if (x1Group1.length === 0 || x1Group2.length === 0 || x2Group1.length === 0 || x2Group2.length === 0) {
      console.error('One of the groups is empty');
      return [];
    }
  
    const mean1 = [jStat.mean(x1Group1), jStat.mean(x2Group1)];
    const mean2 = [jStat.mean(x1Group2), jStat.mean(x2Group2)];
    console.log("Средние значения для группы 1:", mean1);
    console.log("Средние значения для группы 2:", mean2);
    
    const covMatrix1 = [
      [jStat.covariance(x1Group1, x1Group1), jStat.covariance(x1Group1, x2Group1)],
      [jStat.covariance(x2Group1, x1Group1), jStat.covariance(x2Group1, x2Group1)]
    ];
    const covMatrix2 = [
      [jStat.covariance(x1Group2, x1Group2), jStat.covariance(x1Group2, x2Group2)],
      [jStat.covariance(x2Group2, x1Group2), jStat.covariance(x2Group2, x2Group2)]
    ];
    console.log("Ковариационная матрица для группы 1:", covMatrix1);
    console.log("Ковариационная матрица для группы 2:", covMatrix2);
  
    const pooledCovMatrix = jStat.multiply(jStat.add(covMatrix1, covMatrix2), 0.5);
    console.log("Общая ковариационная матрица:", pooledCovMatrix);
  
    const invPooledCovMatrix = jStat.inv(pooledCovMatrix);
    console.log("Обратная ковариационная матрица:", invPooledCovMatrix);
  
    const coefficients = jStat.multiply(invPooledCovMatrix, jStat.transpose([jStat.subtract(mean1, mean2)]));
    console.log("Коэффициенты дискриминантной функции:", coefficients);
  
    const c = 0.5 * jStat.dot(jStat.add(mean1, mean2), coefficients.map(row => row[0]));
    console.log("Свободный член дискриминантной функции (c):", c);
  
    const discriminantValues = x1.map((_, i) => {
      const z = jStat.dot([x1[i], x2[i]], coefficients.map(row => row[0]));
      return z - c;
    });
  
    return this.setState({
      select,
      pooledCovMatrix,
      coefficients,
      c,
      discriminantValues
    });
  }

  renderCovarianceMatrix = (matrix) => {
    return (
      <table>
        <thead>
          <tr className="table-cell">
            <th className="table-cell"></th>
            <th className="table-cell">X1</th>
            <th className="table-cell">X2</th>
          </tr>
        </thead>
        <tbody>
          <tr className="table-cell">
            <td className="table-cell">X1</td>
            <td className="table-cell">{matrix[0][0].toFixed(5)}</td>
            <td className="table-cell">{matrix[0][1].toFixed(5)}</td>
          </tr>
          <tr className="table-cell">
            <td className="table-cell">X2</td>
            <td className="table-cell">{matrix[1][0].toFixed(5)}</td>
            <td className="table-cell">{matrix[1][1].toFixed(5)}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderDiscriminantEquation = (coefficients, c) => {
    return (
      <div>
        <p>
          z(x) = {coefficients[0][0].toFixed(5)} * X1 + {coefficients[1][0].toFixed(5)} * X2 - {c.toFixed(5)}
        </p>
      </div>
    );
  }

  handleAnalyze = () => {
    const { x1Input, x2Input, coefficients, c } = this.state;
    const x1 = parseFloat(x1Input);
    const x2 = parseFloat(x2Input);

    if (isNaN(x1) || isNaN(x2) || coefficients.length === 0) {
      this.setState({ predictionResult: 'Пожалуйста, введите корректные значения факторов.' });
      return;
    }

    const z = jStat.dot([x1, x2], coefficients.map(row => row[0])) - c;
    const group = z < 0 ? 1 : 2;

    this.setState({ predictionResult: `Т.к. c = ${c.toFixed(5)} ${group==1 ? ">" : "<"} f(xi) = ${z.toFixed(3)}, то рассматриваемый объект принадлежит классу №${group}` });
  }

  renderScatterPlot = (dataSet) => {
    const group1 = dataSet.x1.filter((_, i) => dataSet.group[i] === 1).map((x, i) => ({ x, y: dataSet.x2.filter((_, i) => dataSet.group[i] === 2)[i] }));
    const group2 = dataSet.x1.filter((_, i) => dataSet.group[i] === 2).map((x, i) => ({ x, y: dataSet.x2.filter((_, i) => dataSet.group[i] === 2)[i] }));
    console.log("groupPlot1", group1);
    console.log("groupPlot2", group2);

    const data = {
      datasets: [
        {
          label: 'Первая группа',
          data: group1,
          backgroundColor: 'red',
        },
        {
          label: 'Вторая группа',
          data: group2,
          backgroundColor: 'blue',
        },
      ],
    };

    const options = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'X1',
          },
        },
        y: {
          title: {
            display: true,
            text: 'X2',
          },
        },
      },
    };

    return <Scatter data={data} options={options} />;
  }

  render() {
    const { title } = getState().app;
    const { select, dataSets, discriminantValues, pooledCovMatrix, coefficients, c, x1Input, x2Input, predictionResult } = this.state;
    const dataSet = dataSets[select - 1];
    console.log(pooledCovMatrix)

    return (
      <Panel>
        <PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())} />}>{title}</PanelHeader>
        <FormItem>
          <Textarea
            readonly
            value={`Задание: Выполнить дискриминантный анализ.${dataSet ? `\n\n${dataSet.title}` : ""}`}
          />
        </FormItem>
        <FormLayoutGroup mode="horizontal">
          <FormItem><Button mode="secondary" stretched onClick={() => { this.calculateDiscriminantValues(1); }}>1 выборка</Button></FormItem>
          <FormItem><Button mode="secondary" stretched onClick={() => { this.calculateDiscriminantValues(2); }}>2 выборка</Button></FormItem>
          <FormItem><Button mode="secondary" stretched onClick={() => { this.calculateDiscriminantValues(3); }}>3 выборка</Button></FormItem>
        </FormLayoutGroup>
        {dataSet && this.renderTable([
          dataSet.group.map((x, i) => i + 1),
          dataSet.x1,
          dataSet.x2,
          dataSet.group,
          discriminantValues
        ], [...dataSet.headers, "Номер группы", "f(xi)"])}
        {pooledCovMatrix?.length > 0 && (
          <FormItem>
            <h3>Ковариационная матрица:</h3>
            {this.renderCovarianceMatrix(pooledCovMatrix)}
          </FormItem>
        )}
        {coefficients?.length > 0 && (
          <FormItem>
            <h3>Уравнение дискриминантной функции:</h3>
            {this.renderDiscriminantEquation(coefficients, c)}
          </FormItem>
        )}
        {dataSet && (
          <FormItem>
            <h3>График:</h3>
            {this.renderScatterPlot(dataSet)}
          </FormItem>
        )}
        <FormLayoutGroup mode="horizontal">
          <FormItem top="Введите значение факторов для проведения дискриминантного анализа:">
            <Input
              type="text"
              value={x1Input}
              onChange={(e) => this.setState({ x1Input: e.target.value })}
              placeholder="X1"
            />
          </FormItem>
          <FormItem>
            <Input
              type="text"
              value={x2Input}
              onChange={(e) => this.setState({ x2Input: e.target.value })}
              placeholder="X2"
            />
          </FormItem>
          <FormItem>
            <Button mode="secondary" onClick={this.handleAnalyze}>Осуществить прогнозирование</Button>
          </FormItem>
        </FormLayoutGroup>
        {predictionResult && (
          <FormItem>
            <Textarea
              readonly
              value={predictionResult}
            />
          </FormItem>
        )}
      </Panel>
    );
  }
}

export default Lab10;