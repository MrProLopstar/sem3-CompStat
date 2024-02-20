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
		return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
	};

	calculation = () => {
		const {N,P,Xmin,Xmax,step,A,D} = this.state;
        console.log(Xmin,Xmax)
		let binom = [], norm = [];
		let binomTotal = 0;
        if(N<=0 || P<=0 || P>=1) return alert("Ошибка инициализации входных данных, проверьте выполнимость условий: N>0 и 0 < P < 1");
        for (let i = 0; i <= N; i++) {
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
            //totalProbability += pdfValue*step;
        }
		this.setState({binom,norm});
	}

    renderTable = (table) => {
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
						text: 'Частота'
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
                        <tr>
                            <th className="table-cell">X</th>
                            <th className="table-cell">P(X=x)</th>
                            <th className="table-cell">F(X=x)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.map((item, index) => (
                            <tr key={index}>
                                <td className="table-cell">{item.x}</td>
                                <td className="table-cell">{item.pmf?.toFixed(10)}</td>
                                <td className="table-cell">{item.cdf?.toFixed(10)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <FormItem>
                    <Bar options={options} data={{
                        labels: table.map(item => item.x),
                        datasets: [
                            {
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
                            }
                    ]}}/>
                </FormItem>
            </div>
        )
    }

	render(){
		const {title} = getState().app;
		const {select,N,P,binom,norm,Xmin,Xmax,step,A,D} = this.state;
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
                <div className='container'>
                    <div className="split left" style={{marginRight: 50, marginLeft: 5}}>
                        {binom && this.renderTable(binom)}
                    </div>
                    <div className='split right' style={{marginRight: 5}}>
                        {norm && this.renderTable(norm)}
                    </div>
                </div>
			</Panel>
		);
	}
}

export default Lab2;