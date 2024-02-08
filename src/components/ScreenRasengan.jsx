
import Rasengan from './rasengan.jsx';
import {dispatch} from '../main.jsx';
import {closePopout} from '../store/router.jsx';
import {PopoutWrapper} from "@vkontakte/vkui";

export default () => {
  return (
    <PopoutWrapper>
      <div id='rasengan' className='ScreenSpinner__container' style={{ borderRadius: 8 }} onClick={() => dispatch(closePopout())}>
        <Rasengan width='88' height='88' color='rgba(44, 45, 46, 0.1)'/>
      </div>
    </PopoutWrapper>
  );
};
