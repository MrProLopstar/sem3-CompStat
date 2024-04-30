import axios from 'axios';
import React, {Component} from 'react';
import queryString from 'query-string';
import {AppRoot, ConfigProvider, AdaptivityProvider, withPlatform, View, ModalRoot, SplitCol, SplitLayout, Epic, Tabbar, TabbarItem, Counter, ModalPage, ModalPageHeader, PanelHeaderButton,Snackbar,Avatar} from '@vkontakte/vkui';
import {Icon28AddCircleOutline,Icon28ArchiveOutline,Icon28RectangleSplit4UnevenOutline,Icon28ListOutline} from '@vkontakte/icons';
import store, {dispatch} from './main.jsx';
import {setPage} from './store/router';
import {setPageState} from './store/app';
import Hub from './panels/Hub.jsx';
import Lab1 from './panels/Lab1.jsx';
import Lab2 from './panels/Lab2.jsx';
import Lab2_v2 from './panels/Lab2_v2.jsx';
import Lab3 from './panels/Lab3.jsx';
import Lab4 from './panels/Lab4.jsx';
import Lab5 from './panels/Lab5.jsx';
import Lab6 from './panels/Lab6.jsx';
import Lab7 from './panels/Lab7.jsx';
import Lab8 from './panels/Lab8.jsx';
import Lab9 from './panels/Lab9.jsx';
const labs = [Lab1,Lab2,Lab2_v2,Lab3,Lab4,Lab5,Lab6,Lab7,Lab8,Lab9];

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      reduxState: store.getState()
    };
  }
  async componentDidMount(){
    this.unsubscribe = store.subscribe(() => {
      const newReduxState = store.getState();
      if(this.state.reduxState!==newReduxState) this.setState({ reduxState: newReduxState });
    });
    window.addEventListener('resize', () => this.forceUpdate());
    const parsedUrl = queryString.parse(window.location.search);
    if(parsedUrl.lab){
      const labNumber = parseInt(parsedUrl.lab, 10);
      if(!isNaN(labNumber) && labNumber >= 1 && labNumber <= labs.length){
        dispatch(setPage(['labs','lab'+labNumber]));
        dispatch(setPageState({title: 'Лабораторная работа №'+(i>1 ? (i==2 ? `2 (V2)` : i) : i+1), arr: i==0 ? lab1 : null}));
      }
    }
  }

  render(){
    const {platform} = this.props;
    const {activeView, activeStory, activePanel, panelsHistory, activeModals, popouts, scheme, snackbar} = store.getState().router;
    let history = (panelsHistory[activeView] === undefined) ? [activeView] : panelsHistory[activeView];
    let popout = (popouts[activeView] === undefined) ? null : popouts[activeView];
    let activeModal = (activeModals[activeView] === undefined) ? null : activeModals[activeView];
    const modals = [];
    return(
        <ConfigProvider platform={'vkcom'} isWebView scheme={scheme} appearance={scheme=='space_gray' ? 'dark' : 'light'}>
          <AdaptivityProvider>
            <AppRoot>
              <SplitLayout
                popout={popout}
                modal={(
                  <ModalRoot activeModal={activeModal} onClose={() => dispatch(closeModal())} settlingHeight={80}>
                    {modals.map((x) => {
                      return (
                        <ModalPage
                          id={x.id}
                          className='scroll'
                          dynamicContentHeight
                          header={x.name &&
                            <ModalPageHeader /*before={<PanelHeaderButton onClick={() => dispatch(closeModal())}><Icon24Dismiss/></PanelHeaderButton>}*/>
                              {x.name}
                            </ModalPageHeader>
                          }
                        >{x.component}</ModalPage>
                      )
                    })}
                  </ModalRoot>
                )}
              >
              <SplitCol>
                  <View
                    id='labs'
                    history={history}
                    activePanel={activePanel}
                    onSwipeBack={() => { dispatch(goBack()); }}
                  >
                    <Hub id='hub'/>
                    {labs.map((L,i) => (
                      <L id={'lab'+(i+1)} num={i==2 ? 1 : i+1}/>
                    ))}
                  </View>
              </SplitCol>
            </SplitLayout>
          </AppRoot>
        </AdaptivityProvider>
      </ConfigProvider>
    )
  }
};

export default withPlatform(App);