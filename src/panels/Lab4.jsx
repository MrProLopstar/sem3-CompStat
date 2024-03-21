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
			M: 4,
			N: 10,
			n: 5,
			//
			alpha: 10,
			beta: 0.6,
			//
			sampleSize: 20,
			arr: null
		};
	}

  calculation = () => {
    const {select, M, N, n, alpha, beta, sampleSize} = this.state;
    let itog = [];

    if(select===0){
      
    } else if(select===1){
      
    }

    this.setState({ arr: itog, renderKey: Math.random() });
  };

	render(){
		const {title} = getState().app;
		const {select,M,N,n,alpha,beta,arr,renderKey,sampleSize} = this.state;
		const titles = ['Гипергеометрический закон','Бета закон'];
		return (
			<Panel>
				<PanelHeader before={<Icon24Back onClick={() => dispatch(goBack())}/>}>{title}</PanelHeader>
				{select==1 ? (
					<FormLayoutGroup mode="horizontal" segmented>
						<FormItem top="Найти значения для">
							<Select
								value={select}
								options={titles.map((i,index) => ({
									label: i,
									value: index,
								}))}
								onChange={({target}) => this.setState({select: target.value==='' ? 0 : parseInt(target.value, 10)})}
							/>
						</FormItem>
						<FormItem top='α:'>
							<Input
								value={alpha}
								onChange={({ target }) => this.setState({alpha: target.value==='' ? 0 : parseInt(target.value, 10)})}
							/>
						</FormItem>
						<FormItem top='β:'>
							<Input
								value={beta}
								onChange={({ target }) => this.setState({beta: target.value==='' ? 0 : parseInt(target.value, 10)})}
							/>
						</FormItem>
					</FormLayoutGroup>
				) : (
					<div>
						<FormLayoutGroup mode="horizontal" segmented>
							<FormItem top="Найти значения для">
								<Select
									value={select}
									options={titles.map((i,index) => ({
										label: i,
										value: index,
									}))}
									onChange={({target}) => this.setState({select: target.value==='' ? 0 : parseInt(target.value, 10)})}
								/>
							</FormItem>
							<FormItem top='Размер совокупности N:'>
								<Input
									value={N}
									onChange={({ target }) => this.setState({N: target.value==='' ? 0 : parseInt(target.value, 10)})}
								/>
							</FormItem>
						</FormLayoutGroup>
						<FormLayoutGroup mode="horizontal" segmented>
							<FormItem top='Количество "успехов" в совокупности M:'>
								<Input
									value={M}
									onChange={({ target }) => this.setState({M: target.value==='' ? 0 : parseInt(target.value, 10)})}
								/>
							</FormItem>
							<FormItem top='Размер выборки n:'>
								<Input
									value={n}
									onChange={({ target }) => this.setState({n: target.value==='' ? 0 : parseInt(target.value, 10)})}
								/>
							</FormItem>
						</FormLayoutGroup>
					</div>
				)}
				<FormItem top='Размер выборки:'><Input
					align='center'
					value={sampleSize}
					onChange={({ target }) => this.setState({sampleSize: target.value==='' ? 0 : parseInt(target.value, 10)})}
				/></FormItem>
				<FormItem><Button rounded stretched onClick={this.calculation}>Рассчёт</Button></FormItem>
			</Panel>
		);
	}
}

export default Lab2;