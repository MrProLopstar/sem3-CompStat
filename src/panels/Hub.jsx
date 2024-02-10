import React, {Component} from 'react';
import {Panel,Button,PanelHeader} from '@vkontakte/vkui';
//import {} from '@vkontakte/icons';
import store, {dispatch} from '../main.jsx';
import {setPage, goBack} from '../store/router';


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
        {new Array(2).fill(0).map((x,i) => (
          <Button key={i+1} onClick={() => dispatch(setPage(['labs','lab'+(i+1)]))} style={{margin:5}}>Лабораторная работа №{i+1}</Button>
        ))}
      </Panel>
    )
  }
}
export default Main;