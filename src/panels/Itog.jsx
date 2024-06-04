import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, Textarea } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Данные для анализа
const data = [
  // [Возраст, Частота дыхания, Класс]
  [1, 35, 0],
  [2, 31, 0],
  [3, 25, 0],
  [5, 24, 0],
  [7, 23, 0],
  [8, 21, 0],
  [9, 21, 0],
  [11, 20, 0],
  [13, 18, 0],
  [14, 17, 0],
  [15, 17, 0],
  [19, 30, 1],
  [20, 28, 1],
  [21, 25, 1],
  [23, 24, 1],
  [24, 22, 1],
  [25, 21, 1],
  [27, 20, 1],
  [28, 18, 1],
  [30, 17, 1],
];

class DiscriminantAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: data,
      ldaResult: null,
      plotData: null
    };
  }

  componentDidMount() {
    this.performDiscriminantAnalysis();
  }

  mean = (arr) => arr.reduce((acc, val) => acc + val, 0) / arr.length;

  covarianceMatrix = (X) => {
    const n = X.length;
    const means = X[0].map((_, colIndex) => this.mean(X.map(row => row[colIndex])));
    const covarianceMatrix = Array.from({ length: means.length }, () => Array(means.length).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < means.length; j++) {
        for (let k = 0; k < means.length; k++) {
          covarianceMatrix[j][k] += (X[i][j] - means[j]) * (X[i][k] - means[k]) / (n - 1);
        }
      }
    }
    return covarianceMatrix;
  };

  inverseMatrix = (matrix) => {
    const size = matrix.length;
    const identity = [...Array(size)].map((_, i) => [...Array(size)].map((_, j) => i === j ? 1 : 0));
    
    for (let i = 0; i < size; i++) {
      let scale = 1 / matrix[i][i];
      for (let j = 0; j < size; j++) {
        matrix[i][j] *= scale;
        identity[i][j] *= scale;
      }
      for (let k = 0; k < size; k++) {
        if (k !== i) {
          scale = matrix[k][i];
          for (let j = 0; j < size; j++) {
            matrix[k][j] -= scale * matrix[i][j];
            identity[k][j] -= scale * identity[i][j];
          }
        }
      }
    }
    return identity;
  };

  multiplyMatrix = (A, B) => {
    return A.map(row => B[0].map((_, colIndex) => row.reduce((sum, val, rowIndex) => sum + val * B[rowIndex][colIndex], 0)));
  };

  performDiscriminantAnalysis = () => {
    const { data } = this.state;

    // Разделяем данные и метки классов
    const X = data.map(item => [item[0], item[1]]);
    const y = data.map(item => item[2]);

    // Разделение данных на классы
    const classes = [...new Set(y)];
    const classData = classes.map(cls => X.filter((_, index) => y[index] === cls));

    // Средние значения для каждого класса
    const means = classData.map(clsData => clsData.reduce((acc, val) => acc.map((sum, i) => sum + val[i]), Array(clsData[0].length).fill(0)).map(sum => sum / clsData.length));

    // Общая ковариационная матрица
    const covMatrices = classData.map(clsData => this.covarianceMatrix(clsData));
    const pooledCovMatrix = covMatrices.reduce((acc, covMatrix) => acc.map((row, rowIndex) => row.map((val, colIndex) => val + covMatrix[rowIndex][colIndex])), Array(covMatrices[0].length).fill().map(() => Array(covMatrices[0].length).fill(0))).map(row => row.map(val => val / classes.length));

    // Инверсия ковариационной матрицы
    const invPooledCovMatrix = this.inverseMatrix(pooledCovMatrix);

    // Коэффициенты дискриминантной функции
    const discriminantFunctions = means.map(meanVec => this.multiplyMatrix([meanVec], invPooledCovMatrix)[0]);

    // Проекции данных на дискриминантные функции
    const projections = X.map(row => discriminantFunctions.map(discriminantFunction => discriminantFunction.reduce((sum, coef, i) => sum + coef * row[i], 0)));

    // Подготовка данных для построения графиков
    const plotData = {
      labels: X.map((_, index) => index + 1),
      datasets: classes.map((cls, clsIndex) => ({
        label: `Класс ${cls}`,
        data: projections.filter((_, index) => y[index] === cls).map((proj, i) => ({ x: X[i][0], y: proj })),
        backgroundColor: clsIndex === 0 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.5)',
        borderColor: clsIndex === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 5,
        showLine: false
      }))
    };

    this.setState({ ldaResult: { means, discriminantFunctions }, plotData });
  };

  renderTable = (tableData, headers) => {
    return (
      <table>
        <thead>
          <tr>
            {headers.map(header => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              {Object.keys(row).map(header => <td key={header}>{row[header].toFixed(3)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    const { title } = getState().app;
    const { plotData, ldaResult } = this.state;
    const tableHeaders = ['Возраст (лет)', 'Частота дыхания (взд/мин)', 'Класс'];

    return (
      <Panel>
        <PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())} />}>{title}</PanelHeader>
        <FormItem>
          <Textarea
            readonly
            value="Задание: Выполнить дискриминантный анализ для определения различий между классами."
          />
        </FormItem>
        {ldaResult && <>
          <h3>Дискриминантные функции</h3>
          {ldaResult.discriminantFunctions.map((func, index) => (
            <p key={index}>{`Функция для класса ${index}: ${func.map(coef => coef.toFixed(3)).join(' + ')}`}</p>
          ))}
        </>}
        {plotData && <FormItem>
          <h3>Результаты дискриминантного анализа</h3>
          <Scatter data={plotData} options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Возраст (лет)'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Проекция'
                }
              }
            }
          }}/>
        </FormItem>}
        <h3>Данные</h3>
        {this.renderTable(data, tableHeaders)}
      </Panel>
    );
  }
}

export default DiscriminantAnalysis;