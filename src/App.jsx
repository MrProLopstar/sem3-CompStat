import axios from 'axios';
import React, {Component} from 'react';
import queryString from 'query-string';
import {AppRoot, ConfigProvider, AdaptivityProvider, withPlatform, View, ModalRoot, SplitCol, SplitLayout, Epic, Tabbar, TabbarItem, Counter, ModalPage, ModalPageHeader, PanelHeaderButton,Snackbar,Avatar} from '@vkontakte/vkui';
import {Icon28AddCircleOutline,Icon28ArchiveOutline,Icon28RectangleSplit4UnevenOutline,Icon28ListOutline} from '@vkontakte/icons';
import store, {dispatch} from './main.jsx';
import Hub from './panels/Hub.jsx';
import Lab1 from './panels/Lab1.jsx';
import Lab2 from './panels/Lab2.jsx';
import Lab2_v2 from './panels/Lab2_v2.jsx';
import Lab3 from './panels/Lab3.jsx';

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
    window.addEventListener('resize', this.resize);
  }
  resize = () => {
    this.forceUpdate();
  };

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
                    {[Lab1,Lab2,Lab2_v2,Lab3].map((L,i) => (
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