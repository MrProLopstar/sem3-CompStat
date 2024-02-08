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
				<PanelHeader>
          Лабораторные работы Гостяева Ярослава
        </PanelHeader>
        <Button onClick={() => dispatch(setPage(['labs','hub']))}>Лабораторная работа №1</Button>
      </Panel>
    )
  }
}
export default Main;