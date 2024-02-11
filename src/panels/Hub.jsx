import React, {Component} from 'react';
import {Panel,Button,PanelHeader} from '@vkontakte/vkui';
//import {} from '@vkontakte/icons';
import store, {dispatch} from '../main.jsx';
import {setPage, goBack} from '../store/router';
import {setPageState} from '../store/app';
import lab1 from '../data/lab1.json';


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
        {new Array(3).fill(0).map((x,i) => (
          <Button key={i+1} onClick={() => {
            dispatch(setPage(['labs','lab'+(i+1)]));
            dispatch(setPageState({title: 'Лабораторная работа №'+(i+1), arr: i==0 ? lab1 : null}));
          }} style={{margin:5}}>Лабораторная работа №{i+1}</Button>
        ))}
      </Panel>
    )
  }
}
export default Main;