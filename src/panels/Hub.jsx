import React, {Component} from 'react';
import {Panel,Button,PanelHeader} from '@vkontakte/vkui';
//import {} from '@vkontakte/icons';
import store, {dispatch} from '../main.jsx';
import {setPage, goBack} from '../store/router';
import {setPageState} from '../store/app';
import lab1 from '../data/lab1.json';
import { TbCircleDashedNumber1, TbCircleDashedNumber2, TbCircleDashedNumber3, TbCircleDashedNumber4, TbCircleDashedNumber5, TbCircleDashedNumber6, TbCircleDashedNumber7, TbCircleDashedNumber8, TbCircleDashedNumber9, TbCircleDashedNumber0, TbNorthStar } from "react-icons/tb";
const iconStyle = {
  marginTop: 5
};
const icons = [<TbCircleDashedNumber1 style={iconStyle}/>, <TbCircleDashedNumber2 style={iconStyle}/>, <TbCircleDashedNumber3 style={iconStyle}/>, <TbCircleDashedNumber4 style={iconStyle}/>, <TbCircleDashedNumber5 style={iconStyle}/>, <TbCircleDashedNumber6 style={iconStyle}/>, <TbCircleDashedNumber7 style={iconStyle}/>, <TbCircleDashedNumber8 style={iconStyle}/>, <TbCircleDashedNumber9 style={iconStyle}/>, <TbCircleDashedNumber0 style={iconStyle}/>];
const northStar = <TbNorthStar style={iconStyle}/>;


class Main extends Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
       
  }

  render(){
    return(
      <Panel>
				<PanelHeader>Лабораторные работы Гостяева Ярослава</PanelHeader>
        {new Array(11).fill(0).map((x,i) => (
          <Button key={i+1} mode={(i+1)%3===1 ? 'secondary' : ((i+1)%3===2 ? 'primary' : 'outline')}
            after={i>1 ? (i==2 ? icons[1] : (i==9 ? (<>{icons[0]}{icons[9]}</>) : (i==10 ? northStar : icons[i-1]))) : icons[i]}
            before={i>1 ? (i==2 ? icons[1] : (i==9 ? (<>{icons[0]}{icons[9]}</>) : (i==10 ? northStar : icons[i-1]))) : icons[i]}
            onClick={() => {
              dispatch(setPage(['labs','lab'+(i+1)]));
              dispatch(setPageState({title: i==10 ? "Зачётная работа" : `Лабораторная работа №${i>1 ? (i==2 ? "2 (V2)" : (i==9 ? "10" : i)) : i+1}`, arr: i==0 ? lab1 : null}));
            }} style={{margin:5}}>{i==10 ? "Зачётная работа" : `Лабораторная работа №${i>1 ? (i==2 ? "2 (V2)" : (i==9 ? "10" : i)) : i+1}`}</Button>
        ))}
      </Panel>
    )
  }
}
export default Main;