import React, { Component } from 'react';
import { Panel, PanelHeader, FormItem, ChipsInput, FormLayoutGroup, Input, Select, Button } from '@vkontakte/vkui';
import { Icon24Back } from '@vkontakte/icons';
import { getState, dispatch } from '../main.jsx';
import { goBack } from '../store/router';
import { v4 as uuidv4 } from 'uuid';
import { Line, Bar } from 'react-chartjs-2';
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
import { erf } from 'jstat';

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
			select: 0,
			N: 15,
			P: 0.7,
			Xmin: 1,
			Xmax: 15,
			step: 1,
			A: 4, //мат. ожидание
			D: 5, //ср.кв. отклонение
			binom: null,
            norm: null
		};
	}

	factorial = (n) => {
		let result=1;
		for(let i=2; i<=n; i++) result *= i;
		return result;
	};
	combination = (n, k) => {
		return this.factorial(n) / (this.factorial(k) * this.factorial(n-k));
	};

    binomialCDF = (n, p, x) => {
      let cdf = 0;
      for(let k=0; k<=x; k++) cdf += this.combination(n, k)*Math.pow(p, k)*Math.pow(1-p, n-k);
      return cdf;
    };
    
    findBinomialQuantile = (n, p, q) => {
      let cumulativeProbability = 0;
      let x = 0;
      for(x=0; x<=n; x++){
        cumulativeProbability = this.binomialCDF(n,p,x);
        if(cumulativeProbability>=q) break;
      }
      return x;
    };
    findStandardNormalQuantile = (p) => {
        if(p<=0 || p>=1) throw new Error('p must be between 0 and 1');
        const z = Math.sqrt(2) * erf(2*p-1);
        return z;
    };
	calculation = () => {
		const {N,P,Xmin,Xmax,step,A,D} = this.state;
        let binom_quantiles = {}, norm_quantiles = {};
        console.log(Xmin,Xmax)
		let binom = [], norm = [];
		let binomTotal = 0;
        if(N<=0 || P<=0 || P>=1) return alert("Ошибка инициализации входных данных, проверьте выполнимость условий: N>0 и 0 < P < 1");
        for(let i=0; i<=N; i++) {
            let pmfValue = (this.factorial(N)/(this.factorial(i)*this.factorial(N-i)))*Math.pow(P,i)*Math.pow(1-P,N-i);
            binomTotal += pmfValue;
            binom.push({
                x: i,
                pmf: pmfValue,
                cdf: binomTotal
            });
        }
        if(D<=0) return alert("Стандартное отклонение должно быть больше 0.");
        else if(step<=0) return alert("Шаг должен быть больше 0.");
        else if(Xmin>=Xmax) return alert("Xmin должен быть меньше Xmax.");
        for(let x=Number(Xmin); x<=Number(Xmax); x+=step){
            const pdfValue = (1/(D*Math.sqrt(2*Math.PI))) * Math.exp(-Math.pow(x-A,2)/(2*Math.pow(D,2)));
            const zValue = (x-A)/(D*Math.sqrt(2));
            const cdfValue = 0.5*(1+erf(zValue));
            norm.push({
                x: x,
                pmf: pdfValue,
                cdf: cdfValue
            });
        }
        for(let q=0.05; q<1; q+=0.05){
            binom_quantiles[q.toFixed(2)] = this.findBinomialQuantile(N, P, q);
            norm_quantiles[q.toFixed(2)] = A+(D*this.findStandardNormalQuantile(q));
        }
		this.setState({binom,binom_quantiles,norm,norm_quantiles});
	}

    renderTable = (table, type) => {
		const options = {
			legend: {
				display: true,
				position: 'bottom'
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: type === 'distribution' ? 'Частота' : 'p'
					}
				},
				x: {
					title: {
						display: true,
						text: 'X'
					}
				}
			}
		};
        if(table) return (
            <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        {type === 'distribution' ?
                            <tr>
                                <th className="table-cell">X</th>
                                <th className="table-cell">P(X=x)</th>
                                <th className="table-cell">F(X=x)</th>
                            </tr>
                        :   <tr>
                                <th className="table-cell">X</th>
                                <th className="table-cell">p</th>
                            </tr>}
                    </thead>
                    <tbody>
                        {type === 'distribution' ? table.map((item, index) => (
                            <tr key={index}>
                                <td className="table-cell">{item.x}</td>
                                <td className="table-cell">{item.pmf?.toFixed(10)}</td>
                                <td className="table-cell">{item.cdf?.toFixed(10)}</td>
                            </tr>
                        )) : Object.keys(table).map((item, index) => (
                            <tr key={index}>
                                <td className="table-cell">{item}</td>
                                <td className="table-cell">{table[item].toFixed(10)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <FormItem>
                    {type === 'distribution' ? <Bar options={options} data={{
                        labels: type === 'distribution' ? table.map(item => item.x) : Object.keys(table),
                        datasets: [{
                            data: table.map(item => item.pmf),
                            label: 'Плотность распределения вероятностей',
                            borderColor: 'rgba(75,192,192,1)',
                            backgroundColor: 'rgba(75,192,192,0.2)',
                            fill: false
                        },
                        {
                            data: table.map(item => item.cdf),
                            label: 'Функция распределения вероятностей',
                            borderColor: 'rgba(138,43,226,1)',
                            backgroundColor: 'rgba(138,43,226,0.2)',
                            fill: false
                        }]}}/>
                    : <Line options={options} data={{
                        labels: type === 'distribution' ? table.map(item => item.x) : Object.keys(table),
                        datasets: [
                            {
                                data: Object.keys(table).map(x => table[x]),
                                label: 'Квантиль',
                                borderColor: 'rgba(75,192,192,1)',
                                backgroundColor: 'rgba(75,192,192,0.2)',
                                fill: false
                            }]}}/>}
                </FormItem>
            </div>
        )
    }

	render(){
		const {title} = getState().app;
		const {select,N,P,binom,norm,Xmin,Xmax,step,A,D,binom_quantiles,norm_quantiles} = this.state;
		return (
			<Panel>
				<PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())}/>}>{title}</PanelHeader>
                <div className='container'>
                    <div className="split left">
                        <FormItem top="Диксретное Биномиальное распределения">
                            <FormLayoutGroup mode="horizontal" segmented style={{marginTop:25}}>
                                <FormItem top='N:'>
                                    <Input
                                        value={N}
                                        onChange={({target}) => this.setState({N: target.value})}
                                    />
                                </FormItem>
                                <FormItem top={select==0 ? 'P:' : 'A:'}>
                                    <Input
                                        value={P}
                                        onChange={({target}) => this.setState({P: target.value})}
                                    />
                                </FormItem>
                            </FormLayoutGroup>
                        </FormItem>
                    </div>
                    <div className='split right'>
                        <FormItem top="Непрерывное Нормальное распределение">
                            <FormLayoutGroup mode="horizontal" segmented>
                                <FormItem top='X (min):'>
                                    <Input
                                        value={Xmin}
                                        onChange={({target}) => this.setState({Xmin: target.value})}
                                    />
                                </FormItem>
                                <FormItem top='X (max):'>
                                    <Input
                                        value={Xmax}
                                        onChange={({target}) => this.setState({Xmax: target.value})}
                                    />
                                </FormItem>
                            </FormLayoutGroup>
                            <FormLayoutGroup mode="horizontal" segmented>
                                <FormItem top="Введите шаг:">
                                    <Input
                                        value={step}
                                        onChange={({target}) => this.setState({step: target.value})}
                                    />
                                </FormItem>
                                <FormItem top='Введите мат. ожидание:'>
                                    <Input
                                        value={A}
                                        onChange={({target}) => this.setState({A: target.value})}
                                    />
                                </FormItem>
                                <FormItem top='Введите среднеквадратичное отклонение:'>
                                    <Input
                                        value={D}
                                        onChange={({target}) => this.setState({D: target.value})}
                                    />
                                </FormItem>
                            </FormLayoutGroup>
                        </FormItem>
                    </div>
                </div>
				<FormItem><Button rounded stretched onClick={this.calculation}>Рассчёт</Button></FormItem>
                <div className='container' style={{marginTop: 25}}>
                    <div className="split left" style={{marginRight: 50, marginLeft: 5}}>
                        {binom && this.renderTable(binom, 'distribution')}
                        {binom && this.renderTable(binom_quantiles, 'quantiles')}
                    </div>
                    <div className='split right' style={{marginRight: 5}}>
                        {norm && this.renderTable(norm, 'distribution')}
                        {binom && this.renderTable(norm_quantiles, 'quantiles')}
                    </div>
                </div>
			</Panel>
		);
	}
}

export default Lab2;