import {createSlice} from '@reduxjs/toolkit';
import {ScreenSpinner} from '@vkontakte/vkui';
import ScreenRasengan from '../components/ScreenRasengan.jsx';

const scheme = 'space_gray';
const router = createSlice({
    name: "router",
    initialState: {
        scheme,
        swipe: false,
        snackbar: null,
        activeStory: null,
        activeView: null,
        activePanel: null,

        storiesHistory: [],
        viewsHistory: [],
        panelsHistory: [],
      
        activeModals: [],
        modalHistory: [],
        popouts: [],
      
        scrollPosition: []
    },
    reducers: {
        setSnackbar: (state, {payload}) => {
            state.snackbar=payload;
        },
        setSwipe: (state, action) => {
            state.swipe = action.payload;
        },
        setScheme: (state, action) => {
            state.scheme = action.payload;
        },
        setStory: (state, action) => {
            window.history.pushState(null, null);
            let viewsHistory = state.viewsHistory[action.payload[0]] || [action.payload[0]];
            let storiesHistory = state.storiesHistory;
            let activeView = viewsHistory[viewsHistory.length - 1];
            let panelsHistory = state.panelsHistory[activeView] || [action.payload[1]];
            let activePanel = panelsHistory[panelsHistory.length - 1];

            if(action.payload.story===state.activeStory){
                if(panelsHistory.length>1){
                    let firstPanel = panelsHistory.shift();
                    panelsHistory = [firstPanel];
                    activePanel = panelsHistory[panelsHistory.length-1];
                } else if(viewsHistory.length>1){
                    let firstView = viewsHistory.shift();
                    viewsHistory = [firstView];
                    activeView = viewsHistory[viewsHistory.length-1];
                    panelsHistory = state.panelsHistory[activeView];
                    activePanel = panelsHistory[panelsHistory.length-1];
                }
            }
            const storiesIndexInHistory = storiesHistory.indexOf(action.payload[0]);
            if(storiesIndexInHistory===-1 || (storiesHistory[0]===action.payload.story && storiesHistory[storiesHistory.length-1] !== action.payload.story)) storiesHistory = [...storiesHistory, action.payload[0]];
            
            state.activeStory=action.payload[0];
            state.activeView=activeView;
            state.activePanel=activePanel;
            state.storiesHistory=storiesHistory;

            state.viewsHistory = {
                ...state.viewsHistory,
                [activeView]: viewsHistory
            }
            state.panelsHistory = {
                ...state.panelsHistory,
                [activeView]: panelsHistory
            }
            state.scrollPosition = {
                ...state.scrollPosition,
                [state.activeStory + "_" + state.activeView + "_" + state.activePanel]: window.pageYOffset
            }
        },
        setPage: (state, action) => {
            let View = action.payload[0];
            let Panel = action.payload[1];
            window.history.pushState(null, null);

            let panelsHistory = state.panelsHistory[View] || [];
            let viewsHistory = state.viewsHistory[state.activeStory] || [];

            const viewIndexInHistory = viewsHistory.indexOf(View);

            if(viewIndexInHistory !== -1) viewsHistory.splice(viewIndexInHistory, 1);
            if(panelsHistory.indexOf(Panel) === -1) panelsHistory = [...panelsHistory, Panel];

            state.activeView=View;
            state.activePanel=Panel;
            state.panelsHistory = {
                ...state.panelsHistory,
                [View]: panelsHistory
            }
            state.viewsHistory = {
                ...state.viewsHistory,
                [state.activeStory]: viewsHistory
            }
            state.scrollPosition = {
                ...state.scrollPosition,
                [state.activeStory + "_" + state.activeView + "_" + state.activePanel]: window.pageYOffset
            }
        },
        goBack: (state) => {
            let setView = state.activeView;
            let setPanel = state.activePanel;
            let setStory = state.activeStory;
            let popoutsData = state.popouts;
            if(popoutsData[setView]){
                popoutsData[setView] = null;
                state.popouts={...state.popouts,popoutsData};
            }

            let viewModalsHistory = state.modalHistory[setView];
            if(viewModalsHistory !== undefined && viewModalsHistory.length !== 0){
                let activeModal = viewModalsHistory[viewModalsHistory.length-2] || null;
                if(activeModal === null){
                    viewModalsHistory = [];
                } else if(viewModalsHistory.indexOf(activeModal) !== -1){
                    viewModalsHistory = viewModalsHistory.splice(0, viewModalsHistory.indexOf(activeModal)+1);
                } else {
                    viewModalsHistory.push(activeModal);
                }

                state.activeModals={
                    ...state.activeModals,
                    [setView]: activeModal
                };
                state.modalHistory={
                    ...state.modalHistory,
                    [setView]: viewModalsHistory
                };
            }

            let panelsHistory = state.panelsHistory[setView] || [];
            let viewsHistory = state.viewsHistory[state.activeStory] || [];
            let storiesHistory = state.storiesHistory;

            if(panelsHistory.length>1){
              panelsHistory.pop();
              setPanel = panelsHistory[panelsHistory.length - 1];
            } else if(viewsHistory.length>1){
              viewsHistory.pop();
              setView = viewsHistory[viewsHistory.length - 1];
              let panelsHistoryNew = state.panelsHistory[setView];
              setPanel = panelsHistoryNew[panelsHistoryNew.length - 1];
            } else if(storiesHistory.length>1){
              storiesHistory.pop();
              setStory = storiesHistory[storiesHistory.length - 1];
              setView = state.viewsHistory[setStory][state.viewsHistory[setStory].length - 1];
              let panelsHistoryNew = state.panelsHistory[setView];
              if(panelsHistoryNew.length > 1) setPanel = panelsHistoryNew[panelsHistoryNew.length - 1]
              else setPanel = panelsHistoryNew[0];
            } else {
              window.history.pushState(null, null);
              state.popouts={...state.popouts,popoutsData};
            };

            //if(panelsHistory.length === 1) VK.swipeBackOff();
            state.activeView=setView;
            state.activePanel=setPanel;
            state.activeStory=setStory;

            state.viewsHistory = {
                ...state.viewsHistory,
                [setStory]: viewsHistory
            }
            state.panelsHistory = {
                ...state.panelsHistory,
                [setView]: panelsHistory
            }
        },
        openPopout: (state, action) => {
            window.history.pushState(null, null);
            state.popouts={
                ...state.popouts,
                [state.activeView]: action.payload
            }
        },
        openLoader: (state) => {
            window.history.pushState(null, null);
            state.popouts={
                ...state.popouts,
                [state.activeView]: state.scheme=='space_gray' ? <ScreenRasengan/> : <ScreenSpinner/>
            }
        },
        closePopout: (state) => {
            state.popouts={
                ...state.popouts,
                [state.activeView]: null
            }
        },
        openModal: (state, action) => {
            window.history.pushState(null, null);
            let activeModal = action.payload || null;
            let modalsHistory = state.modalHistory[state.activeView] ? [...state.modalHistory[state.activeView]] : [];

            if(activeModal === null) modalsHistory = [];
            else if(modalsHistory.indexOf(activeModal) !== -1) modalsHistory = modalsHistory.splice(0, modalsHistory.indexOf(activeModal) + 1);
            else modalsHistory.push(activeModal);

            state.activeModals = {
                ...state.activeModals,
                [state.activeView]: activeModal
            };
            state.modalHistory = {
                ...state.modalHistory,
                [state.activeView]: modalsHistory
            };
        },
        closeModal: (state) => {
            let activeModal = state.modalHistory[state.activeView][state.modalHistory[state.activeView].length - 2] || null;
            let modalsHistory = state.modalHistory[state.activeView] ? [...state.modalHistory[state.activeView]] : [];
            if(activeModal === null) modalsHistory = [];
            else if (modalsHistory.indexOf(activeModal) !== -1) modalsHistory = modalsHistory.splice(0, modalsHistory.indexOf(activeModal) + 1);
            else modalsHistory.push(activeModal);

            state.activeModals = {
                ...state.activeModals,
                [state.activeView]: activeModal
            };
            state.modalHistory = {
                ...state.modalHistory,
                [state.activeView]: modalsHistory
            };
        }
    }
});
document.documentElement.dataset.scheme = scheme;

export const { setStory, setPage, goBack, openModal, closeModal, openPopout, closePopout, openLoader, setSnackbar } = router.actions;
export default router.reducer;